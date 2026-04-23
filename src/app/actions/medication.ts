'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function toggleMedication(medId: number, currentState: boolean) {
  const { error } = await supabase
    .from('medications')
    .update({ 
        is_taken: !currentState,
        last_taken_at: !currentState ? new Date().toISOString() : null 
    })
    .eq('id', medId);

  if (!error) {
    revalidatePath('/patient-dashboard');
    revalidatePath('/caregiver-dashboard');
  }
}