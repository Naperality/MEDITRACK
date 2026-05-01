'use server'
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * HELPER: Get current PH Time
 * Ensures the logic uses Manila time regardless of where the server is hosted.
 */
const getPHDate = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};

/**
 * 1. ADD MEDICATION
 */
export async function addMedication(formData: FormData, patientId: string) {
  const name = formData.get("name") as string;
  const dosage = formData.get("dosage") as string;
  const med_type = formData.get("med_type") as string;
  const daily_count = parseInt(formData.get("daily_count") as string);
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const instructions = formData.get("instructions") as string;
  const scheduled_times = formData.getAll("scheduled_times") as string[];

  const { error } = await supabase
    .from('medications')
    .insert({
      patient_id: patientId,
      name,
      dosage,
      med_type,
      daily_count,
      scheduled_times,
      start_date,
      end_date,
      instructions,
      is_taken: false
    });

  if (!error) {
    revalidatePath('/caregiver-dashboard');
    revalidatePath('/patient-dashboard');
    return { success: true };
  }
  console.error("Insert error:", error.message);
  return { error: error.message };
}

/**
 * 2. RECORD MEDICATION ACTION
 */
export async function recordMedicationAction(medId: number, patientId: string, medName: string, scheduledTime: string) {
  // Store the exact moment of action in UTC ISO format for the database
  const nowUTC = new Date().toISOString();

  await supabase
    .from('medications')
    .update({ last_taken_at: nowUTC })
    .eq('id', medId);

  const { error: logError } = await supabase
    .from('medication_logs')
    .insert({
      med_id: medId,
      patient_id: patientId,
      med_name: medName,
      status: 'TAKEN',
      logged_at: nowUTC,
      scheduled_slot: scheduledTime
    });

  if (logError) console.error("Logging error:", logError.message);

  revalidatePath('/caregiver-dashboard');
  revalidatePath('/patient-dashboard');
}

/**
 * 3. SYNC MISSED DOSES (Philippine Time Adjusted)
 * Logic: Calculates slots in PH time, converts to UTC for DB storage.
 */
export async function syncMissedDoses(meds: any[], patientId: string) {
  const nowPH = getPHDate();
  
  // Look back 48 hours relative to current PH time
  const lookbackPH = new Date(nowPH);
  lookbackPH.setDate(lookbackPH.getDate() - 2);

  // Fetch existing logs using UTC ISO string of our PH lookback
  const { data: existingLogs } = await supabase
    .from('medication_logs')
    .select('med_id, scheduled_slot, logged_at')
    .eq('patient_id', patientId)
    .gte('logged_at', lookbackPH.toISOString());

  const logsToInsert = [];

  for (const med of meds) {
    for (const slot of med.scheduled_times) {
      const [hours, minutes] = slot.split(':').map(Number);
      
      // Define the target slot in PH time for Today
      const todaySlotPH = new Date(nowPH);
      todaySlotPH.setHours(hours, minutes, 0, 0);

      // Define the target slot in PH time for Yesterday
      const yesterdaySlotPH = new Date(todaySlotPH);
      yesterdaySlotPH.setDate(yesterdaySlotPH.getDate() - 1);

      const slotsToCheck = [todaySlotPH, yesterdaySlotPH];

      for (const slotTimePH of slotsToCheck) {
        // Check 1: Has this time passed in the Philippines?
        const isPast = nowPH > slotTimePH;
        
        // Check 2: Is the slot within the medication's active dates?
        const slotISO = slotTimePH.toISOString();
        const isWithinRange = slotISO >= med.start_date && (med.end_date ? slotISO <= med.end_date : true);
        
        if (isPast && isWithinRange) {
          // Check 3: Duplicate Check
          // Compare by converting DB UTC log time back to PH for an exact match
          const alreadyLogged = existingLogs?.some(l => {
            const logDatePH = new Date(new Date(l.logged_at).toLocaleString("en-US", { timeZone: "Asia/Manila" }));
            
            return l.med_id === med.id &&
                   l.scheduled_slot === slot &&
                   logDatePH.getTime() === slotTimePH.getTime();
          });

          if (!alreadyLogged) {
            logsToInsert.push({
              med_id: med.id,
              patient_id: patientId,
              med_name: med.name,
              status: 'MISSED',
              logged_at: slotISO, // Stores as UTC correctly in timestamptz column
              scheduled_slot: slot
            });
          }
        }
      }
    }
  }

  if (logsToInsert.length > 0) {
    const { error: insertError } = await supabase.from('medication_logs').insert(logsToInsert);
    if (!insertError) {
      revalidatePath('/patient-dashboard');
      revalidatePath('/caregiver-dashboard');
    } else {
      console.error("Sync Insert Error:", insertError.message);
    }
  }
}

/**
 * 4. DELETE MEDICATION
 */
export async function deleteMedication(medId: number) {
  await supabase.from('medications').delete().eq('id', medId);
  revalidatePath('/caregiver-dashboard');
  revalidatePath('/patient-dashboard');
}