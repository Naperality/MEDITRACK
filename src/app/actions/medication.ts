'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addMedication(formData: FormData, patientId: string) {
  const name = formData.get("name") as string;
  const dosage = formData.get("dosage") as string;
  const med_type = formData.get("med_type") as string;
  const daily_count = parseInt(formData.get("daily_count") as string);
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const instructions = formData.get("instructions") as string;

  // Collect all scheduled times from the dynamic inputs
  const scheduled_times = formData.getAll("scheduled_times") as string[];

  const { error } = await supabase
    .from('medications')
    .insert({
      patient_id: patientId,
      name,
      dosage,
      med_type,
      daily_count,
      scheduled_times, // Array of times
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
    revalidatePath('/patient-dashboard');
  }
}