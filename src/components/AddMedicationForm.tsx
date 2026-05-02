'use client'

import { addMedication } from "@/app/actions/medication";
import { useState, useRef, useEffect } from "react";
import { Pill, Clock, Calendar, FileText, ChevronRight, Hash } from "lucide-react";

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
    // Append the computed times to the form data
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
      className="space-y-8 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-200">
          <Pill size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">New Prescription</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Schedule Medication</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Basic Info & Schedule */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medication Details</label>
            <div className="relative">
              <Pill className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                name="name" 
                placeholder="Medicine Name (e.g. Paracetamol)" 
                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-sm font-semibold" 
                required 
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</label>
              <input 
                name="dosage" 
                placeholder="500mg / 1 tab" 
                className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-sm font-semibold" 
                required 
              />
            </div>
            <div className="w-1/3 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
              <div className="relative">
                <select 
                  name="daily_count" 
                  value={frequency} 
                  onChange={(e) => setFrequency(parseInt(e.target.value))} 
                  className="w-full appearance-none px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-sm font-black text-rose-600"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}x Daily</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 w-4 h-4 rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Conditional Slot Selection */}
          {frequency === 1 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 w-4 h-4" />
                <select 
                  value={specificSlot} 
                  onChange={(e) => setSpecificSlot(e.target.value)} 
                  className="w-full appearance-none pl-11 pr-4 py-4 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-sm font-bold text-slate-700"
                >
                  <option value="08:00">Morning (08:00 AM)</option>
                  <option value="13:00">Afternoon (01:00 PM)</option>
                  <option value="20:00">Evening/Night (08:00 PM)</option>
                </select>
              </div>
            </div>
          )}

          <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-3 h-3 text-slate-400" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Automatic Slots</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {computedTimes.map((t, i) => (
                <div key={i} className="px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center gap-2 group hover:border-rose-200 transition-colors">
                  <Clock className="w-3 h-3 text-rose-500" />
                  <span className="text-xs font-black text-slate-700">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Duration & Instructions */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  name="start_date" 
                  type="date" 
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-sm font-semibold" 
                  defaultValue={new Date().toISOString().split('T')[0]} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  name="end_date" 
                  type="date" 
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-sm font-semibold" 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Instructions</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
              <textarea 
                name="instructions" 
                placeholder="Take before meals, avoid alcohol..." 
                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-sm font-medium h-[152px] resize-none" 
              />
            </div>
          </div>
        </div>
      </div>

      <button 
        disabled={loading} 
        type="submit" 
        className="w-full group relative overflow-hidden bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-70"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Confirm Prescription
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </span>
      </button>
    </form>
  );
}