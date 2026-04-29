'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addMedication(formData: FormData, patientId: string) {
  const name = formData.get("name") as string;
  const dosage = formData.get("dosage") as string;
  const med_type = formData.get("med_type") as string;
  const scheduled_time = formData.get("scheduled_time") as string;

  const { error } = await supabase
    .from('medications')
    .insert({
      patient_id: patientId, // Correctly uses the target patient's ID
      name,
      dosage,
      med_type,
      scheduled_time,
      is_taken: false
    });

  if (!error) {
    // Revalidate paths to refresh the UI immediately
    revalidatePath('/caregiver-dashboard');
    return { success: true };
  }
  
  console.error("Insert error:", error.message);
  return { error: error.message };
}

export async function toggleMedication(medId: number, currentState: boolean) {
  const timeTaken = !currentState ? new Date().toISOString() : null;

  const { error } = await supabase
    .from('medications')
    .update({ 
      is_taken: !currentState,
      last_taken_at: timeTaken 
    })
    .eq('id', medId);

  if (!error) {
    revalidatePath('/caregiver-dashboard');
  }
}