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
    revalidatePath('/patient-dashboard'); // Added to sync patient side too
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
 */
export async function syncMissedDoses(meds: any[], patientId: string) {
  const now = new Date();
  console.log("--- START SYNC MISSED DOSES ---");
  console.log("Current Time (Server):", now.toLocaleString());
  
  const lookbackPeriod = new Date();
  lookbackPeriod.setHours(lookbackPeriod.getHours() - 24);
  
  // 1. Get all logs from the last 24 hours
  const { data: existingLogs, error: fetchError } = await supabase
    .from('medication_logs')
    .select('med_id, scheduled_slot, logged_at')
    .eq('patient_id', patientId)
    .gte('logged_at', lookbackPeriod.toISOString());

  if (fetchError) {
    console.error("Supabase Fetch Error:", fetchError.message);
  }

  console.log(`Found ${existingLogs?.length || 0} existing logs in the last 24h.`);

  const logsToInsert = [];

  for (const med of meds) {
    console.log(`Checking Medication: ${med.name} (ID: ${med.id})`);

    for (const slot of med.scheduled_times) {
      const [hours, minutes] = slot.split(':');
      
      const slotTime = new Date();
      slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const timesToCheck = [slotTime];
      
      // Look back at yesterday if it's early morning
      if (now.getHours() < 4) {
        const yesterdaySlot = new Date(slotTime);
        yesterdaySlot.setDate(yesterdaySlot.getDate() - 1);
        timesToCheck.push(yesterdaySlot);
      }

      for (const checkTime of timesToCheck) {
        const isPast = checkTime < now;
        
        const alreadyLogged = existingLogs?.some(l => {
          const logDate = new Date(l.logged_at);
          // Precise logging for the check
          return l.med_id === med.id && 
                 l.scheduled_slot === slot && 
                 logDate.toDateString() === checkTime.toDateString();
        });

        console.log(` > Slot: ${slot} | Target Date: ${checkTime.toDateString()} | isPast: ${isPast} | alreadyLogged: ${alreadyLogged}`);

        if (isPast && !alreadyLogged) {
          console.log(` >>> MATCH FOUND: Queueing MISSED log for ${med.name} at ${slot}`);
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

  console.log(`Total logs queued for insertion: ${logsToInsert.length}`);

  if (logsToInsert.length > 0) {
    const { error: insertError } = await supabase.from('medication_logs').insert(logsToInsert);
    
    if (insertError) {
      console.error("Supabase Insert Error:", insertError.message);
    } else {
      console.log("Successfully inserted missed doses to database.");
      revalidatePath('/patient-dashboard');
      revalidatePath('/caregiver-dashboard');
    }
  } else {
    console.log("No new missed doses to sync.");
  }
  
  console.log("--- END SYNC MISSED DOSES ---");
}