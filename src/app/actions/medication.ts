'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addMedication(formData: FormData, userId: string) {
  const name = formData.get("name") as string;
  const dosage = formData.get("dosage") as string;
  const med_type = formData.get("med_type") as string;
  const scheduled_time = formData.get("scheduled_time") as string;

  const { error } = await supabase
    .from('medications')
    .insert({
      patient_id: userId,
      name,
      dosage,
      med_type,
      scheduled_time,
      is_taken: false
    });

  if (!error) {
    revalidatePath('/patient-dashboard');
    revalidatePath('/caregiver-dashboard');
    return { success: true };
  }
  return { error: error.message };
}

// Ensure this function is present and exported
export async function toggleMedication(medId: number, currentState: boolean) {
  // If we are marking it as taken, use the current time. 
  // If we are unmarking it, set it to null.
  const timeTaken = !currentState ? new Date().toISOString() : null;

  const { error } = await supabase
    .from('medications')
    .update({ 
      is_taken: !currentState,
      last_taken_at: timeTaken 
    })
    .eq('id', medId);

  if (error) {
    console.error("Toggle error:", error.message);
  } else {
    revalidatePath('/patient-dashboard');
    revalidatePath('/caregiver-dashboard');
  }
}