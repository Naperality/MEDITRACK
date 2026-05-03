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
export async function discontinueMedication(medId: number) {
  // 1. Update the medication record
  // Assuming your column name is 'is_discontinued'. 
  // If you use 'is_completed', you can use that, but 'is_discontinued' is clearer for history.
  const { data: med, error: updateError } = await supabaseAdmin
    .from('medications')
    .update({ is_discontinued: true }) 
    .eq('id', medId)
    .select('patient_id')
    .single();

  if (updateError) return { error: updateError.message };

  // 2. Insert a log entry into medication_logs
  const { error: logError } = await supabaseAdmin
    .from('medication_logs')
    .insert({
      medication_id: medId,
      patient_id: med.patient_id,
      status: 'DISCONTINUED',
      logged_at: new Date().toISOString()
    });

  if (!logError) {
    revalidatePath('/caregiver-dashboard');
    revalidatePath('/patient-dashboard');
    return { success: true };
  }
  
  return { error: logError.message };
}