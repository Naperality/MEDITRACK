import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function DashboardRedirect() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profile?.role === 'ADMIN') redirect('/admin-dashboard');
  if (profile?.role === 'CAREGIVER') redirect('/caregiver-dashboard');
  redirect('/patient-dashboard');
}