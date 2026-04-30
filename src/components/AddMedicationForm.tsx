'use client'

import { addMedication } from "@/app/actions/medication";
import { useState, useRef, useEffect } from "react";
import { Pill, Clock } from "lucide-react";

export default function AddMedicationForm({ patientId }: { patientId: string }) {
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState(1);
  const [specificSlot, setSpecificSlot] = useState("08:00"); // For freq 1
  const [computedTimes, setComputedTimes] = useState<string[]>(["08:00"]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let times: string[] = [];
    if (frequency === 1) {
      times = [specificSlot];
    } else if (frequency === 2) {
      times = ["08:00", "16:00"]; // Morning & Afternoon
    } else if (frequency === 3) {
      times = ["08:00", "13:00", "20:00"]; // Morning, Afternoon, Evening
    } else {
      // Automatic calculation for 4+ times (ATC logic)
      // 24 hours divided by frequency, starting at 06:00
      const interval = 24 / frequency;
      for (let i = 0; i < frequency; i++) {
        const hour = (6 + i * interval) % 24;
        const formattedHour = Math.floor(hour).toString().padStart(2, '0');
        times.push(`${formattedHour}:00`);
      }
    }
    setComputedTimes(times);
  }, [frequency, specificSlot]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    // Append the computed times to the form data
    computedTimes.forEach(t => formData.append("scheduled_times", t));
    await addMedication(formData, patientId);
    setLoading(false);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <input name="name" placeholder="Medication Name" className="w-full p-3 rounded-xl border border-slate-200 text-sm" required />
          <div className="flex gap-2">
            <input name="dosage" placeholder="Dosage" className="flex-1 p-3 rounded-xl border border-slate-200 text-sm" required />
            <select name="daily_count" value={frequency} onChange={(e) => setFrequency(parseInt(e.target.value))} className="p-3 rounded-xl border border-slate-200 text-sm bg-white font-bold text-blue-600">
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}x Daily</option>)}
            </select>
          </div>

          {/* Conditional Slot Selection for Freq 1 */}
          {frequency === 1 && (
            <select value={specificSlot} onChange={(e) => setSpecificSlot(e.target.value)} className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700">
              <option value="08:00">Morning (08:00 AM)</option>
              <option value="13:00">Afternoon (01:00 PM)</option>
              <option value="20:00">Evening/Night (08:00 PM)</option>
            </select>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Generated Schedule</p>
            <div className="flex flex-wrap gap-2">
              {computedTimes.map((t, i) => (
                <span key={i} className="text-xs bg-white border px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input name="start_date" type="date" className="flex-1 p-3 rounded-xl border border-slate-200 text-sm" defaultValue={new Date().toISOString().split('T')[0]} required />
            <input name="end_date" type="date" className="flex-1 p-3 rounded-xl border border-slate-200 text-sm" required />
          </div>
          <textarea name="instructions" placeholder="Special Instructions..." className="w-full p-3 rounded-xl border border-slate-200 text-sm h-24" />
        </div>
      </div>

      <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all">
        {loading ? 'Saving...' : 'Confirm Prescription'}
      </button>
    </form>
  );
}