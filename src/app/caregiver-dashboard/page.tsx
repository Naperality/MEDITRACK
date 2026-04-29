import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { UserButton } from "@clerk/nextjs";
import { linkPatient } from "@/app/actions/caregiver";
import { toggleMedication } from "@/app/actions/medication";
import AddMedicationForm from "@/components/AddMedicationForm";
import { UserPlus, Activity, Clock, CheckCircle2 } from "lucide-react";

export default async function CaregiverDashboard() {
  const { userId, getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  if (!userId || !token) return null;

  const supabase = createClerkSupabaseClient(token);

  const { data: links } = await supabase
    .from('caregiver_patient')
    .select(`patient_id, profiles!patient_id (full_name, medications (*))`)
    .eq('caregiver_id', userId);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black text-slate-900">Caregiver Portal</h1>
          <UserButton />
        </header>

        {/* Link Patient Form */}
        <section className="mb-10 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-3xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-6 h-6" />
            <h2 className="text-xl font-bold">Monitor a New Patient</h2>
          </div>
          <form action={async (formData: FormData) => {
            'use server';
            const email = formData.get('email') as string;
            await linkPatient(userId, email);
          }} className="flex gap-3">
            <input name="email" type="email" className="flex-1 p-4 rounded-xl text-slate-900" placeholder="Patient email..." required />
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50">Link Patient</button>
          </form>
        </section>

        <div className="space-y-8">
          {links?.map((link: any) => (
            <div key={link.patient_id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:border-blue-200 transition-colors">
              <div className="bg-slate-50 px-6 py-5 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">{link.profiles.full_name}</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Monitoring</span>
              </div>
              
              <div className="p-6 border-b bg-slate-50/50">
                <AddMedicationForm patientId={link.patient_id} />
              </div>

              <div className="p-2">
                {link.profiles.medications?.sort((a:any, b:any) => a.scheduled_time.localeCompare(b.scheduled_time)).map((med: any) => {
                  const takenTime = med.last_taken_at 
                    ? new Date(med.last_taken_at).toLocaleTimeString('en-PH', { 
                        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' 
                      }) : null;

                  return (
                    <div key={med.id} className="flex justify-between items-center p-5 hover:bg-slate-50 rounded-2xl transition-colors">
                      <div>
                        <p className="font-bold text-slate-800 text-lg">{med.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{med.dosage} • {med.med_type}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {med.scheduled_time}
                          </span>
                          {med.is_taken && (
                            <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Taken at {takenTime}
                            </span>
                          )}
                        </div>
                      </div>
                      <form action={async () => { 'use server'; await toggleMedication(med.id, med.is_taken); }}>
                        <button type="submit" className={`text-xs px-6 py-3 rounded-xl font-bold transition-all ${
                          med.is_taken ? 'bg-green-600 text-white' : 'bg-white border text-slate-500 hover:bg-slate-100'
                        }`}>
                          {med.is_taken ? '✓ Verified' : 'Mark Taken'}
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}