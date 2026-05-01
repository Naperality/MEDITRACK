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
 */
export async function recordMedicationAction(medId: number, patientId: string, medName: string, scheduledTime: string) {
  const now = new Date().toISOString();

  // Step A: Update the main medication "last taken" time
  const { error: updateError } = await supabase
    .from('medications')
    .update({ last_taken_at: now })
    .eq('id', medId);

  if (updateError) {
    console.error("Update error:", updateError.message);
    return;
  }

  // Step B: Insert log entry with the specific slot
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

  if (logError) {
    console.error("Logging error:", logError.message);
  }

  revalidatePath('/caregiver-dashboard');
  revalidatePath('/patient-dashboard');
}

/**
 * 3. DELETE MEDICATION
 */
export async function deleteMedication(medId: number) {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', medId);

  if (!error) {
    revalidatePath('/caregiver-dashboard');
    revalidatePath('/patient-dashboard');
    return { success: true };
  }
}

/**
 * 4. SYNC MISSED DOSES (The Proactive Engine)
 * Specifically adjusted for Philippine Time (PHT) logic
 */
export async function syncMissedDoses(meds: any[], patientId: string) {
  // Use a stable 'now' reference for all calculations in this cycle
  const now = new Date();
  
  console.log("--- START SYNC MISSED DOSES (Manila Time) ---");
  console.log("Current Sync Time:", now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' }));
  
  // Look back 48 hours to ensure we catch yesterday's missed doses regardless of current time
  const lookbackPeriod = new Date(now);
  lookbackPeriod.setDate(lookbackPeriod.getDate() - 2);
  
  const { data: existingLogs, error: fetchError } = await supabase
    .from('medication_logs')
    .select('med_id, scheduled_slot, logged_at')
    .eq('patient_id', patientId)
    .gte('logged_at', lookbackPeriod.toISOString());

  if (fetchError) {
    console.error("Supabase Fetch Error:", fetchError.message);
    return;
  }

  const logsToInsert = [];

  for (const med of meds) {
    for (const slot of med.scheduled_times) {
      const [hours, minutes] = slot.split(':').map(Number);
      
      // Calculate 'Today' and 'Yesterday' timestamps for this slot
      const todaySlot = new Date(now);
      todaySlot.setHours(hours, minutes, 0, 0);

      const yesterdaySlot = new Date(todaySlot);
      yesterdaySlot.setDate(yesterdaySlot.getDate() - 1);

      // We check both Today and Yesterday for every medication slot
      const timesToCheck = [todaySlot, yesterdaySlot];

      for (const checkTime of timesToCheck) {
        const isPast = checkTime < now;
        
        // Ensure the medication prescription is/was active at this checkTime
        const checkTimeISO = checkTime.toISOString();
        const isWithinMedRange = checkTimeISO >= med.start_date && checkTimeISO <= med.end_date;
        
        if (isPast && isWithinMedRange) {
          const alreadyLogged = existingLogs?.some(l => {
            const logDate = new Date(l.logged_at);
            return l.med_id === med.id && 
                   l.scheduled_slot === slot && 
                   logDate.toDateString() === checkTime.toDateString();
          });

          if (!alreadyLogged) {
            console.log(`>>> QUEUEING MISSED: ${med.name} | Slot: ${slot} | Date: ${checkTime.toDateString()}`);
            logsToInsert.push({
              med_id: med.id,
              patient_id: patientId,
              med_name: med.name,
              status: 'MISSED',
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
    
    if (insertError) {
      console.error("Supabase Sync Insert Error:", insertError.message);
    } else {
      console.log(`Successfully synced ${logsToInsert.length} missed logs.`);
      // Force UI refresh so the new logs appear in the history sidebar immediately
      revalidatePath('/patient-dashboard');
      revalidatePath('/caregiver-dashboard');
    }
  } else {
    console.log("No new missed doses detected.");
  }
  
  console.log("--- END SYNC MISSED DOSES ---");
}