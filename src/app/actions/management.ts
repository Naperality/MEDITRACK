'use server'
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * UNLINK PATIENT
 * Removes the relationship between caregiver and patient.
 */
export async function unlinkPatient(caregiverId: string, patientId: string) {
  const { error } = await supabaseAdmin
    .from('caregiver_patient')
    .delete()
    .match({ caregiver_id: caregiverId, patient_id: patientId });

  if (!error) {
    revalidatePath('/caregiver-dashboard');
    return { success: true };
  }
  return { error: error.message };
}

/**
 * UPDATE MEDICATION
 * Modifies an existing medication record.
 */
export async function updateMedication(medId: number, formData: FormData) {
  const name = formData.get("name") as string;
  const dosage = formData.get("dosage") as string;
  const med_type = formData.get("med_type") as string;
  const daily_count = parseInt(formData.get("daily_count") as string);
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string || null;
  const instructions = formData.get("instructions") as string;
  const scheduled_times = formData.getAll("scheduled_times") as string[];

  const { error } = await supabaseAdmin
    .from('medications')
    .update({
      name,
      dosage,
      med_type,
      daily_count,
      scheduled_times,
      start_date,
      end_date,
      instructions,
    })
    .eq('id', medId);

  if (!error) {
    revalidatePath('/caregiver-dashboard');
    revalidatePath('/patient-dashboard');
    return { success: true };
  }
  return { error: error.message };
}

/**
 * DELETE MEDICATION
 * Removes medication and associated logs (if foreign keys are set to cascade).
 */
export async function deleteMedication(medId: number) {
  const { error } = await supabaseAdmin
    .from('medications')
    .delete()
    .eq('id', medId);

  if (!error) {
    revalidatePath('/caregiver-dashboard');
    revalidatePath('/patient-dashboard');
    return { success: true };
  }
  return { error: error.message };
}

/**
 * DISCONTINUE MEDICATION (Replaces Delete)
 * Marks medication as discontinued and logs the event.
 */
export async function discontinueMedication(medId: number, medName: string, patientId: string) {
  // 1. Mark as discontinued
  const { error: updateError } = await supabaseAdmin
    .from('medications')
    .update({ is_discontinued: true }) 
    .eq('id', medId);

  if (updateError) {
    // Returning the message and code so you see it on Vercel
    return { error: `Update Failed: ${updateError.message} (Code: ${updateError.code})` };
  }

  // 2. Insert log
  const { error: logError } = await supabaseAdmin
    .from('medication_logs')
    .insert({
      med_id: Number(medId),
      patient_id: patientId, // CRITICAL: If this is undefined, the insert will fail
      med_name: medName,
      status: 'TAKEN', 
      logged_at: new Date().toISOString(),
      scheduled_slot: 'STOPPED'
    });

  if (logError) {
    // This will send the EXACT database error back to your frontend modal
    return { 
      error: `Insert Failed: ${logError.message}. Details: ${logError.details || 'None'}. Hint: ${logError.hint || 'None'}` 
    };
  }
  
  revalidatePath('/caregiver-dashboard');
  revalidatePath('/patient-dashboard');
  return { success: true };
}