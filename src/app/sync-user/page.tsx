import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

export default async function SyncUserPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/login");

  const token = await getToken({ template: "supabase" });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  // Retry logic: try to fetch the profile up to 3 times
  let profile = null;
  for (let i = 0; i < 3; i++) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (data) {
      profile = data;
      break;
    }
    // Wait 1 second before retrying
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (!profile) {
    // If still no profile, they might be a brand new user and the webhook is slow.
    // Defaulting to patient or showing an error is safer than a crash.
    redirect("/patient-dashboard");
  }

  if (profile.role === 'ADMIN') {
    redirect("/admin-dashboard");
  } else if (profile.role === 'CAREGIVER') {
    redirect("/caregiver-dashboard");
  } else {
    redirect("/patient-dashboard");
  }
}