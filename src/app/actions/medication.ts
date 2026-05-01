'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * 1. RECORD MEDICATION ACTION
 * Triggered when a patient clicks a 'PENDING' button.
 */
export async function recordMedicationAction(medId: number, patientId: string, medName: string, scheduledTime: string) {
  const now = new Date().toISOString();

  // Update the medication's last taken timestamp
  await supabase
    .from('medications')
    .update({ last_taken_at: now })
    .eq('id', medId);

  // Insert a 'TAKEN' log entry
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
 * 2. SYNC MISSED DOSES (The Proactive Engine)
 * Logic: Compares current time against scheduled slots for today and yesterday.
 * If the time has passed and no log exists, it inserts a 'MISSED' record.
 */
export async function syncMissedDoses(meds: any[], patientId: string) {
  const now = new Date();
  
  // Look back 48 hours to ensure we don't miss yesterday's late slots
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
      
      // Calculate timestamps for this slot for Today and Yesterday
      const todaySlot = new Date(now);
      todaySlot.setHours(hours, minutes, 0, 0);

      const yesterdaySlot = new Date(todaySlot);
      yesterdaySlot.setDate(yesterdaySlot.getDate() - 1);

      // Check both Today and Yesterday
      const timesToCheck = [todaySlot, yesterdaySlot];

      for (const checkTime of timesToCheck) {
        // REMOVED GRACE PERIOD: If current time is even 1 second past schedule, it's eligible
        const isPast = now > checkTime;
        
        const checkTimeISO = checkTime.toISOString();
        const isWithinRange = checkTimeISO >= med.start_date && checkTimeISO <= med.end_date;
        
        if (isPast && isWithinRange) {
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
              // Logged at the exact time it was SUPPOSED to be taken for historical accuracy
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
      // Force Next.js to dump the cache and show the new logs in the sidebar
      revalidatePath('/patient-dashboard');
      revalidatePath('/caregiver-dashboard');
    } else {
      console.error("Sync Insert Error:", insertError.message);
    }
  }
}

/**
 * 3. DELETE MEDICATION
 */
export async function deleteMedication(medId: number) {
  await supabase.from('medications').delete().eq('id', medId);
  revalidatePath('/caregiver-dashboard');
  revalidatePath('/patient-dashboard');
}