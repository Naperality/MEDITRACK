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
 * 3. SYNC MISSED DOSES (Corrected Timezone Offset)
 */
export async function syncMissedDoses(meds: any[], patientId: string) {
  const nowPH = getPHDate();
  const lookbackPH = new Date(nowPH);
  lookbackPH.setDate(lookbackPH.getDate() - 2);

  const { data: existingLogs } = await supabase
    .from('medication_logs')
    .select('med_id, scheduled_slot, logged_at')
    .eq('patient_id', patientId)
    .gte('logged_at', lookbackPH.toISOString());

  const logsToInsert = [];

  for (const med of meds) {
    for (const slot of med.scheduled_times) {
      const [hours, minutes] = slot.split(':').map(Number);
      
      const todaySlotPH = new Date(nowPH);
      todaySlotPH.setHours(hours, minutes, 0, 0);

      const yesterdaySlotPH = new Date(todaySlotPH);
      yesterdaySlotPH.setDate(yesterdaySlotPH.getDate() - 1);

      const slotsToCheck = [todaySlotPH, yesterdaySlotPH];

      for (const slotTimePH of slotsToCheck) {
        const isPast = nowPH > slotTimePH;
        
        // Use a comparison string that respects the medication's date range
        const slotComparisonISO = slotTimePH.toISOString();
        const isWithinRange = slotComparisonISO >= med.start_date && 
                             (med.end_date ? slotComparisonISO <= med.end_date : true);
        
        if (isPast && isWithinRange) {
          const alreadyLogged = existingLogs?.some(l => {
            const logDate = new Date(l.logged_at);
            const dbDateString = logDate.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
            const currentSlotDateString = slotTimePH.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

            return (
              l.med_id === med.id &&
              l.scheduled_slot === slot &&
              dbDateString === currentSlotDateString
            );
          });

          if (!alreadyLogged) {
            // --- FIX: Create a string with the explicit +08:00 offset ---
            const year = slotTimePH.getFullYear();
            const month = String(slotTimePH.getMonth() + 1).padStart(2, '0');
            const day = String(slotTimePH.getDate()).padStart(2, '0');
            const hh = String(slotTimePH.getHours()).padStart(2, '0');
            const mm = String(slotTimePH.getMinutes()).padStart(2, '0');
            
            // This format (YYYY-MM-DDTHH:mm:ss+08:00) forces the DB to see Manila time
            const manilaISO = `${year}-${month}-${day}T${hh}:${mm}:00+08:00`;

            logsToInsert.push({
              med_id: med.id,
              patient_id: patientId,
              med_name: med.name,
              status: 'MISSED',
              logged_at: manilaISO, 
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