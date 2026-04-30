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
 * 2. RECORD MEDICATION ACTION (Used by Patient or Caregiver)
 * Updated to match the 'med_id' column in your medication_logs table.
 */
export async function recordMedicationAction(medId: number, patientId: string, medName: string) {
  const now = new Date().toISOString();

  // Step A: Update the main medication status
  const { error: updateError } = await supabase
    .from('medications')
    .update({ 
      is_taken: true, 
      last_taken_at: now 
    })
    .eq('id', medId);

  if (updateError) {
    console.error("Update error:", updateError.message);
    return;
  }

  // Step B: Insert log entry using your schema's 'med_id' column
  const { error: logError } = await supabase
    .from('medication_logs')
    .insert({
      med_id: medId, // Matched to image_e44f35.png
      patient_id: patientId,
      med_name: medName,
      status: 'TAKEN',
      logged_at: now
    });

  if (logError) {
    console.error("Logging error:", logError.message);
  }

  // Refreshing ensures the Activity Logs sidebar updates immediately
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