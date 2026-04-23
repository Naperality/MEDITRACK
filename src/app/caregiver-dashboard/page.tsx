import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export default async function CaregiverDashboard() {
  const { userId } = await auth();

  // Get patients linked to this caregiver
  const { data: links } = await supabase
    .from('caregiver_patient')
    .select('patient_id, profiles!patient_id(full_name)')
    .eq('caregiver_id', userId);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Caregiver Portal</h1>
      <h2 className="text-lg font-semibold mb-4">My Patients</h2>
      <div className="space-y-6">
        {links?.map((link: any) => (
          <div key={link.patient_id} className="p-6 bg-white border rounded-xl">
            <h3 className="font-bold text-xl mb-4 border-b pb-2 text-blue-600">
              {link.profiles.full_name}
            </h3>
            {/* You would fetch and map patient meds here */}
            <p className="text-sm text-gray-400 italic">Tracking active medications...</p>
          </div>
        ))}
      </div>
    </div>
  );
}