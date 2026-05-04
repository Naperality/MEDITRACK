'use server'

import { supabaseAdmin } from "@/lib/supabase"; // Assuming you use the helper from the previous turn

export async function saveSubscription(userId: string, subscription: any) {

  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ 
      id: userId, // CRITICAL: The ID must be inside the object for upsert to work
      push_subscription: JSON.stringify(subscription), 
    })

  if (error) throw new Error(error.message);
  return { success: true };
}