'use server'

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function linkPatient(caregiverId: string, patientEmail: string) {
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  if (!token) return { error: "Unauthorized" };

  const supabase = createClerkSupabaseClient(token);

  const { data: patient, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', patientEmail)
    .eq('role', 'PATIENT')
    .single();

  if (findError || !patient) return { error: "Patient not found." };

  const { error: linkError } = await supabase
    .from('caregiver_patient')
    .insert({ caregiver_id: caregiverId, patient_id: patient.id });

  if (linkError) return { error: "Link already exists." };

  revalidatePath('/caregiver-dashboard');
  return { success: true };
}