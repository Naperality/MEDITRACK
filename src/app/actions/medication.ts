'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * 1. ADD MEDICATION (Used by Caregiver)
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
 * Updated to ensure timestamps are stored in standard ISO.
 */
export async function recordMedicationAction(medId: number, patientId: string, medName: string, scheduledTime: string) {
  const now = new Date().toISOString();

  await supabase
    .from('medications')
    .update({ last_taken_at: now })
    .eq('id', medId);

  const { error: logError } = await supabase
    .from('medication_logs')
    .insert({
      med_id: medId,
      patient_id: patientId,
      med_name: medName,
      status: 'TAKEN',
      logged_at: now, 
      scheduled_slot: scheduledTime 
    });

  if (logError) console.error("Logging error:", logError.message);

  revalidatePath('/caregiver-dashboard');
  revalidatePath('/patient-dashboard');
}

/**
 * 3. SYNC MISSED DOSES (Timezone Corrected for Philippines)
 */
export async function syncMissedDoses(meds: any[], patientId: string) {
  // 1. Get current time in Philippines string format to handle offsets correctly
  const now = new Date();
  const phTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Manila" });
  const phtNow = new Date(phTimeStr);
  
  // Look back period for the query (keep it in UTC for Supabase)
  const lookbackPeriod = new Date(now);
  lookbackPeriod.setDate(lookbackPeriod.getDate() - 2);
  
  const { data: existingLogs } = await supabase
    .from('medication_logs')
    .select('med_id, scheduled_slot, logged_at')
    .eq('patient_id', patientId)
    .gte('logged_at', lookbackPeriod.toISOString());

  const logsToInsert = [];

  for (const med of meds) {
    for (const slot of med.scheduled_times) {
      const [hours, minutes] = slot.split(':').map(Number);
      
      // 2. Create slot comparison objects based on PHT Now
      const todaySlot = new Date(phtNow);
      todaySlot.setHours(hours, minutes, 0, 0);

      const yesterdaySlot = new Date(todaySlot);
      yesterdaySlot.setDate(yesterdaySlot.getDate() - 1);

      const timesToCheck = [todaySlot, yesterdaySlot];

      for (const checkTime of timesToCheck) {
        // Compare PHT time vs PHT schedule
        const isPast = phtNow > checkTime;
        
        // Use standard comparison for dates (ensuring start/end covers the time)
        const checkTimeISO = checkTime.toISOString();
        const isWithinRange = checkTimeISO >= med.start_date && checkTimeISO <= med.end_date;
        
        if (isPast && isWithinRange) {
          const alreadyLogged = existingLogs?.some(l => {
            // Convert log date to PHT string for a fair "Date String" comparison
            const logPHT = new Date(l.logged_at).toLocaleString("en-US", { timeZone: "Asia/Manila" });
            const logDatePHT = new Date(logPHT);

            return l.med_id === med.id && 
                   l.scheduled_slot === slot && 
                   logDatePHT.toDateString() === checkTime.toDateString();
          });

          if (!alreadyLogged) {
            logsToInsert.push({
              med_id: med.id,
              patient_id: patientId,
              med_name: med.name,
              status: 'MISSED',
              // Use the actual scheduled time as the log record
              logged_at: checkTime.toISOString(), 
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