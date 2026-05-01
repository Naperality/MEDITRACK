import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { syncMissedDoses } from "@/app/actions/medication";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // Check if we are syncing as a caregiver
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  if (role === 'caregiver') {
    // 1. Get all patients linked to this caregiver
    const { data: links } = await supabase
      .from('caregiver_patient')
      .select('patient_id, profiles:patient_id(medications(*))')
      .eq('caregiver_id', userId);

    if (links) {
      // 2. Sync for every patient
      await Promise.all(
        links.map(link => {
          const profile: any = Array.isArray(link.profiles) ? link.profiles[0] : link.profiles;
          return profile?.medications 
            ? syncMissedDoses(profile.medications, link.patient_id) 
            : Promise.resolve();
        })
      );
    }
  } else {
    // Standard Patient Sync
    const { data: meds } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', userId);

    if (meds) await syncMissedDoses(meds, userId);
  }

  return NextResponse.json({ success: true });
}