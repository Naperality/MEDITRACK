'use server'
import { supabaseAdmin } from "@/lib/supabase";
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

  const { error } = await supabaseAdmin
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
 * 2. RECORD MEDICATION ACTION (Fixed Timeline)
 */
export async function recordMedicationAction(medId: number, patientId: string, medName: string, scheduledTime: string) {
  const nowPH = getPHDate();
  // Using Intl to format the string correctly for Supabase timestamptz
  const manilaISO = nowPH.toLocaleString("sv-SE", { timeZone: "Asia/Manila" }).replace(' ', 'T') + "+08:00";

  await supabaseAdmin.from('medications').update({ last_taken_at: manilaISO }).eq('id', medId);

  const formattedSlot = scheduledTime.length === 5 ? `${scheduledTime}:00` : scheduledTime;

  const { error: logError } = await supabaseAdmin.from('medication_logs').insert({
    med_id: medId,
    patient_id: patientId,
    med_name: medName,
    status: 'TAKEN',
    logged_at: manilaISO,
    scheduled_slot: formattedSlot
  });

  if (logError) console.error("Logging error:", logError.message);
  revalidatePath('/caregiver-dashboard');
  revalidatePath('/patient-dashboard');
}

/**
 * 3. SYNC MISSED DOSES (Corrected logic)
 */
export async function syncMissedDoses(meds: any[], patientId: string) {
  const nowPH = getPHDate();
  const { data: existingLogs } = await supabaseAdmin
    .from('medication_logs')
    .select('med_id, scheduled_slot, logged_at')
    .eq('patient_id', patientId);

  const logsToInsert = [];

  for (const med of meds) {
    for (const slot of med.scheduled_times) {
      const [hours, minutes] = slot.split(':').map(Number);
      
      // Start from medication start date
      let checkDate = new Date(med.start_date);
      
      while (checkDate <= nowPH) {
        // Create the specific slot time for that day in Manila context
        const slotTimePH = new Date(checkDate.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
        slotTimePH.setHours(hours, minutes, 0, 0);

        const gracePeriodMs = 30 * 60 * 1000; 
        const isPast = nowPH.getTime() > (slotTimePH.getTime() + gracePeriodMs);
        
        const currentDateString = slotTimePH.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
        const isWithinRange = currentDateString >= med.start_date && 
                             (med.end_date ? currentDateString <= med.end_date : true);
        
        if (isPast && isWithinRange) {
          const alreadyLogged = existingLogs?.some(l => {
            const dbDateString = new Date(l.logged_at).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
            return l.med_id === med.id && l.scheduled_slot === slot && dbDateString === currentDateString;
          });

          if (!alreadyLogged) {
            // sv-SE format results in YYYY-MM-DD HH:mm:ss
            const formatted = slotTimePH.toLocaleString("sv-SE", { timeZone: "Asia/Manila" }).replace(' ', 'T');
            logsToInsert.push({
              med_id: med.id,
              patient_id: patientId,
              med_name: med.name,
              status: 'MISSED',
              logged_at: `${formatted}+08:00`, 
              scheduled_slot: slot
            });
          }
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }
    }
  }

  if (logsToInsert.length > 0) {
    await supabaseAdmin.from('medication_logs').insert(logsToInsert);
    revalidatePath('/patient-dashboard');
    revalidatePath('/caregiver-dashboard');
  }
}
/**
 * 4. DELETE MEDICATION
 */
export async function deleteMedication(medId: number) {
  await supabaseAdmin.from('medications').delete().eq('id', medId);
  revalidatePath('/caregiver-dashboard');
  revalidatePath('/patient-dashboard');
}