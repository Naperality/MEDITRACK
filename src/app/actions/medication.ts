'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * 1. RECORD MEDICATION ACTION
 */
export async function recordMedicationAction(medId: number, patientId: string, medName: string, scheduledTime: string) {
  const now = new Date().toISOString();

  // Update last taken
  await supabase
    .from('medications')
    .update({ last_taken_at: now })
    .eq('id', medId);

  // Insert log with the actual timestamp of the click
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
 * 2. SYNC MISSED DOSES
 * Logic: If current time > scheduled time + 30 mins, and no 'TAKEN' log exists.
 */
export async function syncMissedDoses(meds: any[], patientId: string) {
  const now = new Date();
  
  // Look back 48 hours to catch overlaps
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
      
      const todaySlot = new Date(now);
      todaySlot.setHours(hours, minutes, 0, 0);

      const yesterdaySlot = new Date(todaySlot);
      yesterdaySlot.setDate(yesterdaySlot.getDate() - 1);

      const timesToCheck = [todaySlot, yesterdaySlot];

      for (const checkTime of timesToCheck) {
        // Add a 30-minute grace period before marking as missed
        const missThreshold = new Date(checkTime.getTime() + 30 * 60 * 1000);
        const isPastThreshold = now > missThreshold;
        
        const checkTimeISO = checkTime.toISOString();
        const isWithinRange = checkTimeISO >= med.start_date && checkTimeISO <= med.end_date;
        
        if (isPastThreshold && isWithinRange) {
          const alreadyLogged = existingLogs?.some(l => {
            const logDate = new Date(l.logged_at);
            return l.med_id === med.id && 
                   l.scheduled_slot === slot && 
                   logDate.toDateString() === checkTime.toDateString();
          });

          if (!alreadyLogged) {
            logsToInsert.push({
              med_id: med.id,
              patient_id: patientId,
              med_name: med.name,
              status: 'MISSED',
              logged_at: checkTime.toISOString(), // Logged at the time it was scheduled
              scheduled_slot: slot
            });
          }
        }
      }
    }
  }

  if (logsToInsert.length > 0) {
    await supabase.from('medication_logs').insert(logsToInsert);
    revalidatePath('/patient-dashboard');
    revalidatePath('/caregiver-dashboard');
  }
}

export async function deleteMedication(medId: number) {
  await supabase.from('medications').delete().eq('id', medId);
  revalidatePath('/caregiver-dashboard');
  revalidatePath('/patient-dashboard');
}