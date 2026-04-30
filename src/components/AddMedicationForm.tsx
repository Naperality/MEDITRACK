'use client'

import { addMedication } from "@/app/actions/medication";
import { useState, useRef } from "react";
import { Pill, Calendar, Clock, FileText } from "lucide-react";

export default function AddMedicationForm({ patientId }: { patientId: string }) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await addMedication(formData, patientId);
    setLoading(false);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Pill className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-lg text-slate-800">Prescribe Medication</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="space-y-4">
          <input name="name" placeholder="Medication Name (e.g. Amoxicillin)" className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
          <div className="flex gap-2">
            <input name="dosage" placeholder="Dosage (e.g. 500mg)" className="flex-1 p-3 rounded-xl border border-slate-200 text-sm" required />
            <select name="med_type" className="p-3 rounded-xl border border-slate-200 text-sm bg-white">
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
            </select>
          </div>
          <input name="frequency" placeholder="Frequency (e.g. 3x a day)" className="w-full p-3 rounded-xl border border-slate-200 text-sm" required />
        </div>

        {/* Schedule & Duration */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Start Date</label>
              <input name="start_date" type="date" className="w-full p-3 rounded-xl border border-slate-200 text-sm" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">End Date (Duration)</label>
              <input name="end_date" type="date" className="w-full p-3 rounded-xl border border-slate-200 text-sm" required />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Daily Reminder Time</label>
            <input name="scheduled_time" type="time" className="w-full p-3 rounded-xl border border-slate-200 text-sm" required />
          </div>
          <input name="instructions" placeholder="Instructions (e.g. Take after meal)" className="w-full p-3 rounded-xl border border-slate-200 text-sm" />
        </div>
      </div>

      <button 
        disabled={loading}
        type="submit" 
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-blue-300 shadow-lg shadow-blue-100"
      >
        {loading ? 'Processing Prescription...' : 'Confirm Prescription'}
      </button>
    </form>
  );
}