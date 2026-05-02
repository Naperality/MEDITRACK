'use server'
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * HELPER: Get current PH Time
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
  const nowPH = getPHDate();
  
  const year = nowPH.getFullYear();
  const month = String(nowPH.getMonth() + 1).padStart(2, '0');
  const day = String(nowPH.getDate()).padStart(2, '0');
  const hh = String(nowPH.getHours()).padStart(2, '0');
  const mm = String(nowPH.getMinutes()).padStart(2, '0');
  const ss = String(nowPH.getSeconds()).padStart(2, '0');
  
  const manilaISO = `${year}-${month}-${day}T${hh}:${mm}:${ss}+08:00`;

  await supabase
    .from('medications')
    .update({ last_taken_at: manilaISO })
    .eq('id', medId);

  const { error: logError } = await supabase
    .from('medication_logs')
    .insert({
      med_id: medId,
      patient_id: patientId,
      med_name: medName,
      status: 'TAKEN',
      logged_at: manilaISO,
      scheduled_slot: scheduledTime
    });

  if (logError) console.error("Logging error:", logError.message);

  revalidatePath('/caregiver-dashboard');
  revalidatePath('/patient-dashboard');
}

/**
 * 3. SYNC MISSED DOSES (The Fixed Version)
 */
export async function syncMissedDoses(meds: any[], patientId: string) {
  const nowPH = getPHDate();
  
  // Fetch logs to prevent duplicates
  const { data: existingLogs } = await supabase
    .from('medication_logs')
    .select('med_id, scheduled_slot, logged_at')
    .eq('patient_id', patientId);

  const logsToInsert = [];

  for (const med of meds) {
    // Parse start_date accurately for Manila
    const [sYear, sMonth, sDay] = med.start_date.split('-').map(Number);
    const startDatePH = new Date(sYear, sMonth - 1, sDay, 0, 0, 0);

    for (const slot of med.scheduled_times) {
      const [hours, minutes] = slot.split(':').map(Number);
      
      // CRITICAL: Create a fresh checkDate for every individual slot loop
      let checkDate = new Date(startDatePH);

      while (checkDate <= nowPH) {
        // Create a specific timestamp for this slot on this day
        const slotTimePH = new Date(checkDate);
        slotTimePH.setHours(hours, minutes, 0, 0);

        // 1. Check if the time has actually passed (with 2-hour grace period)
        const gracePeriodMs = 120 * 60 * 1000; 
        const isPast = nowPH.getTime() > (slotTimePH.getTime() + gracePeriodMs);
        
        // 2. Check if the slot falls within the medication's active date range
        const slotDateString = slotTimePH.toLocaleDateString("en-CA"); // YYYY-MM-DD
        const isWithinRange = slotDateString >= med.start_date && 
                             (med.end_date ? slotDateString <= med.end_date : true);
        
        if (isPast && isWithinRange) {
          // 3. Check if this specific slot has already been logged (Taken or Missed)
          const alreadyLogged = existingLogs?.some(l => {
            const logDate = new Date(l.logged_at);
            const dbDateString = logDate.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
            const currentSlotDateString = slotTimePH.toLocaleDateString("en-CA");

            return (
              l.med_id === med.id &&
              l.scheduled_slot === slot &&
              dbDateString === currentSlotDateString
            );
          });

          if (!alreadyLogged) {
            // Format Manila ISO manually to force +08:00 offset
            const year = slotTimePH.getFullYear();
            const month = String(slotTimePH.getMonth() + 1).padStart(2, '0');
            const day = String(slotTimePH.getDate()).padStart(2, '0');
            const hh = String(slotTimePH.getHours()).padStart(2, '0');
            const mm = String(slotTimePH.getMinutes()).padStart(2, '0');
            
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
        // Move to next calendar day
        checkDate.setDate(checkDate.getDate() + 1);
      }
    }
  }

  if (logsToInsert.length > 0) {
    const { error: insertError } = await supabase.from('medication_logs').insert(logsToInsert);
    if (!insertError) {
      revalidatePath('/patient-dashboard');
      revalidatePath('/caregiver-dashboard');
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