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
 * 2. RECORD MEDICATION ACTION (Fixed Timeline)
 */
export async function recordMedicationAction(medId: number, patientId: string, medName: string, scheduledTime: string) {
  // 1. Get the current time in Manila
  const nowPH = getPHDate();
  
  // 2. Format it to a string that includes the +08:00 offset
  // This prevents the 8-hour shift in your database and dashboard
  const year = nowPH.getFullYear();
  const month = String(nowPH.getMonth() + 1).padStart(2, '0');
  const day = String(nowPH.getDate()).padStart(2, '0');
  const hh = String(nowPH.getHours()).padStart(2, '0');
  const mm = String(nowPH.getMinutes()).padStart(2, '0');
  const ss = String(nowPH.getSeconds()).padStart(2, '0');
  
  const manilaISO = `${year}-${month}-${day}T${hh}:${mm}:${ss}+08:00`;

  // Update the medication record
  await supabase
    .from('medications')
    .update({ last_taken_at: manilaISO })
    .eq('id', medId);

  // Insert the activity log
  const { error: logError } = await supabase
    .from('medication_logs')
    .insert({
      med_id: medId,
      patient_id: patientId,
      med_name: medName,
      status: 'TAKEN',
      logged_at: manilaISO, // Now correctly shows Manila time
      scheduled_slot: scheduledTime
    });

  if (logError) console.error("Logging error:", logError.message);

  revalidatePath('/caregiver-dashboard');
  revalidatePath('/patient-dashboard');
}

/**
 * 3. SYNC MISSED DOSES (Fixed: Dynamic Date Range)
 */
export async function syncMissedDoses(meds: any[], patientId: string) {
  const nowPH = getPHDate();
  
  // 1. Fetch all logs for this patient. 
  // We remove the .gte filter to ensure we can check against the full history.
  const { data: existingLogs } = await supabase
    .from('medication_logs')
    .select('med_id, scheduled_slot, logged_at')
    .eq('patient_id', patientId);

  const logsToInsert = [];

  for (const med of meds) {
    // Convert start_date (YYYY-MM-DD) to a Manila-aligned Date object for comparison
    // Split the YYYY-MM-DD string to avoid UTC auto-conversion issues
    const [sYear, sMonth, sDay] = med.start_date.split('-').map(Number);
    // Create the date object specifically for Manila 00:00:00
    const startDate = new Date(new Date(sYear, sMonth - 1, sDay, 0, 0, 0).toLocaleString("en-US", { timeZone: "Asia/Manila" }));
    
    for (const slot of med.scheduled_times) {
      const [hours, minutes] = slot.split(':').map(Number);
      
      // Start checking from the medication's start date
      let checkDate = new Date(startDate);

      // Loop through every day from start_date until today
      while (checkDate <= nowPH) {
        const slotTimePH = new Date(checkDate);
        slotTimePH.setHours(hours, minutes, 0, 0);

        const isPast = nowPH > slotTimePH;
        
        // Use your existing ISO comparison logic for the range
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
        // Move to the next day
        checkDate.setDate(checkDate.getDate() + 1);
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