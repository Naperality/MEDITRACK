'use client'

import { addMedication } from "@/app/actions/medication";
import { useState, useRef, useEffect } from "react";
import { Pill, Clock, Calendar, FileText, ChevronRight, Hash, ArrowRight } from "lucide-react";

export default function AddMedicationForm({ patientId }: { patientId: string }) {
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState(1);
  const [specificSlot, setSpecificSlot] = useState("08:00"); 
  const [computedTimes, setComputedTimes] = useState<string[]>(["08:00"]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let times: string[] = [];
    if (frequency === 1) {
      times = [specificSlot];
    } else if (frequency === 2) {
      times = ["08:00", "16:00"]; 
    } else if (frequency === 3) {
      times = ["08:00", "13:00", "20:00"]; 
    } else {
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
    computedTimes.forEach(t => formData.append("scheduled_times", t));
    const result = await addMedication(formData, patientId);
    setLoading(false);
    if (result?.success) {
      formRef.current?.reset();
      setFrequency(1);
      setSpecificSlot("08:00");
    }
  }

  return (
    <form 
      ref={formRef} 
      action={handleSubmit} 
      className="max-w-xl mx-auto space-y-6 bg-white p-5 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 transition-all"
    >
      {/* Header - Centered for better mobile balance */}
      <div className="flex flex-col items-center text-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-200 ring-4 ring-rose-50">
          <Pill size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Prescription</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule Medication</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Medication Name */}
        <div className="group space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medication Details</label>
          <div className="relative">
            <Pill className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors w-4 h-4" />
            <input 
              name="name" 
              placeholder="Medicine Name" 
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-200 outline-none transition-all text-sm font-semibold" 
              required 
            />
          </div>
        </div>

        {/* Dosage & Frequency - Stacked on mobile, side-by-side on tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</label>
            <input 
              name="dosage" 
              placeholder="e.g. 500mg" 
              className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-200 outline-none transition-all text-sm font-semibold" 
              required 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
            <div className="relative">
              <select 
                name="daily_count" 
                value={frequency} 
                onChange={(e) => setFrequency(parseInt(e.target.value))} 
                className="w-full appearance-none px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-200 outline-none transition-all text-sm font-black text-rose-600"
              >
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}x Daily</option>)}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 w-4 h-4 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Preferred Time selection */}
        {frequency === 1 && (
          <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-300">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Time</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 w-4 h-4" />
              <select 
                value={specificSlot} 
                onChange={(e) => setSpecificSlot(e.target.value)} 
                className="w-full appearance-none pl-11 pr-4 py-3.5 rounded-2xl border border-rose-100 bg-rose-50/20 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-200 outline-none transition-all text-sm font-bold text-slate-700"
              >
                <option value="08:00">Morning (08:00 AM)</option>
                <option value="13:00">Afternoon (01:00 PM)</option>
                <option value="20:00">Evening (08:00 PM)</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 w-4 h-4 rotate-90 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Automated Schedule Preview */}
        <div className="p-5 bg-slate-50/80 rounded-[2rem] border border-slate-100/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Hash className="w-3 h-3 text-slate-400" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auto Schedule</p>
            </div>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">Smart Sync</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {computedTimes.map((t, i) => (
              <div key={i} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center gap-2">
                <Clock className="w-3 h-3 text-rose-500" />
                <span className="text-xs font-bold text-slate-700">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dates - Side by side even on mobile, using smaller padding */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Starts</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5 pointer-events-none" />
              <input 
                name="start_date" 
                type="date" 
                className="w-full pl-10 pr-3 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white text-xs font-bold outline-none transition-all" 
                defaultValue={new Date().toISOString().split('T')[0]} 
                required 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ends</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5 pointer-events-none" />
              <input 
                name="end_date" 
                type="date" 
                className="w-full pl-10 pr-3 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white text-xs font-bold outline-none transition-all" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Instructions</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-slate-300 w-4 h-4" />
            <textarea 
              name="instructions" 
              placeholder="e.g. Take with water after meals..." 
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-200 outline-none transition-all text-sm font-medium h-24 resize-none" 
            />
          </div>
        </div>
      </div>

      <button 
        disabled={loading} 
        type="submit" 
        className="w-full group relative overflow-hidden bg-slate-900 text-white py-4.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-rose-600 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Confirm Prescription
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}