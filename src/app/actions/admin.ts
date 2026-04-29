'use server'

import { supabase } from "@/lib/supabase";

import { revalidatePath } from "next/cache";

export async function updateUserRole(targetUserId: string, newRole: 'PATIENT' | 'CAREGIVER' | 'ADMIN') {






  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetUserId);

  if (error) {
    console.error("Role update failed:", error.message);
    return { success: false };
  }

  revalidatePath('/admin-dashboard');
  return { success: true };
}