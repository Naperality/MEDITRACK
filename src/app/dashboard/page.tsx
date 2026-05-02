import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";

export default async function DashboardRedirect() {
  // Get the session and user data from Clerk
  const { userId } = await auth();
  const user = await currentUser();

  // If no session exists, send them to login
  if (!userId || !user) {
    redirect("/login");
  }

  // 1. Immediate Check: Get the role from Clerk Metadata
  // This is available immediately upon registration/login
  const metaRole = user.unsafeMetadata?.requested_role;

  // 2. Database Check: Fetch the role from your Supabase 'profiles' table
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  /**
   * RESOLVING THE RACE CONDITION:
   * On the very first login, the Supabase 'profile' might be null because 
   * the webhook is still processing. We fall back to metaRole to ensure 
   * the user lands on the correct dashboard immediately.
   */
  const finalRole = profile?.role || metaRole;

  // 3. Perform Redirection
  if (finalRole === 'ADMIN') {
    redirect('/admin-dashboard');
  }

  if (finalRole === 'CAREGIVER') {
    redirect('/caregiver-dashboard');
  }

  // Default fallback is the Patient Dashboard
  redirect('/patient-dashboard');
}