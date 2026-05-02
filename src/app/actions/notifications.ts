'use server'

import { supabaseAdmin } from "@/lib/supabase"; // Assuming you use the helper from the previous turn

export async function saveSubscription(userId: string, subscription: any) {

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ push_subscription: JSON.stringify(subscription) })
    .eq('id', userId);

  if (error) throw new Error(error.message);
  return { success: true };
}