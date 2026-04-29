'use server'

import { supabase } from "@/lib/supabase";

import { revalidatePath } from "next/cache";

export async function linkPatient(caregiverId: string, patientEmail: string) {
  // 1. Find the patient's ID by their email





  const { data: patient, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', patientEmail)
    .eq('role', 'PATIENT')
    .single();

  if (findError || !patient) {
    return { error: "Patient not found. Make sure the email is correct and they are registered as a Patient." };
  }

  // 2. Create the relationship
  const { error: linkError } = await supabase
    .from('caregiver_patient')
    .insert({
      caregiver_id: caregiverId,
      patient_id: patient.id
    });

  if (linkError) return { error: "Already linked or database error." };

  revalidatePath('/caregiver-dashboard');
  return { success: true };
}