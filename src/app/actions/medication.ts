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
    return { success: true };
  }
  
  console.error("Insert error:", error.message);
  return { error: error.message };
}

/**
 * 2. RECORD MEDICATION ACTION
 * Updated to require the specific scheduledTime slot.
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

  // Refresh both dashboards to reflect the new log
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
    return { success: true };
  }
}
export async function syncMissedDoses(meds: any[], patientId: string) {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now.getTime() - offset).toISOString();
  const todayStr = localISOTime.split('T')[0];
  
  // 1. Get all logs for today to avoid duplicates
  const { data: existingLogs } = await supabase
    .from('medication_logs')
    .select('med_id, scheduled_slot')
    .eq('patient_id', patientId)
    .gte('logged_at', `${todayStr}T00:00:00.000Z`);

  const logsToInsert = [];

  for (const med of meds) {
    for (const slot of med.scheduled_times) {
      // Create a date object for the slot time
      const [hours, minutes] = slot.split(':');
      const slotTime = new Date();
      slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // If slot time is in the past AND no log exists for it
      const alreadyLogged = existingLogs?.some(
        l => l.med_id === med.id && l.scheduled_slot === slot
      );

      if (slotTime < now && !alreadyLogged) {
        logsToInsert.push({
          med_id: med.id,
          patient_id: patientId,
          med_name: med.name,
          status: 'MISSED',
          logged_at: slotTime.toISOString(), // Log it at the time it was supposed to happen
          scheduled_slot: slot
        });
      }
    }
  }

  if (logsToInsert.length > 0) {
    await supabase.from('medication_logs').insert(logsToInsert);
    revalidatePath('/patient-dashboard');
  }
}