'use server'

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addMedication(formData: FormData, patientId: string) {
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  if (!token) return { error: "Not authenticated" };

  const supabase = createClerkSupabaseClient(token);

  const { error } = await supabase.from('medications').insert({
    patient_id: patientId,
    name: formData.get("name") as string,
    dosage: formData.get("dosage") as string,
    med_type: formData.get("med_type") as string,
    scheduled_time: formData.get("scheduled_time") as string,
    is_taken: false
  });

  if (!error) {
    revalidatePath('/caregiver-dashboard');
    revalidatePath('/patient-dashboard');
    return { success: true };
  }
  return { error: error.message };
}

export async function toggleMedication(medId: number, currentState: boolean) {
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  if (!token) return;

  const supabase = createClerkSupabaseClient(token);
  const timeTaken = !currentState ? new Date().toISOString() : null;

  const { error } = await supabase
    .from('medications')
    .update({ is_taken: !currentState, last_taken_at: timeTaken })
    .eq('id', medId);

  if (!error) {
    revalidatePath('/caregiver-dashboard');
    revalidatePath('/patient-dashboard');
  }
}