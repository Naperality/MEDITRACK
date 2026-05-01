import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { syncMissedDoses } from "@/app/actions/medication";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { data: meds } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', userId);

  if (meds && meds.length > 0) {
    await syncMissedDoses(meds, userId);
  }

  return NextResponse.json({ success: true });
}