'use server'

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateUserRole(targetUserId: string, newRole: string) {
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  if (!token) return { success: false };

  const supabase = createClerkSupabaseClient(token);

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetUserId);

  if (!error) {
    revalidatePath('/admin-dashboard');
    return { success: true };
  }
  return { success: false };
}