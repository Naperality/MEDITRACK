'use client';

import { useState } from 'react';
import { 
  Edit2, X, Save, Trash2, Clock, 
  Calendar, FileText, Pill, Hash 
} from 'lucide-react';
import { updateMedication, discontinueMedication } from '@/app/actions/management';

export default function EditMedicationModal({ med, disabled }: { med: any, disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [times, setTimes] = useState<string[]>(med.scheduled_times || []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Ensure scheduled_times are passed as multiple entries to FormData
    // and sync daily_count with the length of the times array
    formData.delete('scheduled_times'); // Clear existing if any
    times.forEach(t => formData.append('scheduled_times', t));
    formData.set('daily_count', times.length.toString());
    
    const res = await updateMedication(med.id, formData);
    setLoading(false);
    if (res?.success) setIsOpen(false);
  };

  if (!isOpen) return (
    <button 
      onClick={() => !disabled && setIsOpen(true)}
      disabled = {disabled} 
      className={`p-2 rounded-lg transition-colors ${
        disabled 
          ? 'opacity-20 cursor-not-allowed text-slate-300' 
          : 'hover:bg-slate-100 text-slate-400 hover:text-blue-600'
      }`}
    >
      <Edit2 size={16} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Pill size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900">Edit Medication</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Prescription</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors"
          >
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Medication Name</label>
            <div className="relative">
              <Pill className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input 
                name="name" 
                defaultValue={med.name} 
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 outline-none transition-all font-semibold text-sm" 
                required 
              />
            </div>
          </div>

          {/* Dosage and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Dosage</label>
              <input 
                name="dosage" 
                defaultValue={med.dosage} 
                className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none transition-all font-semibold text-sm" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Type</label>
              <select 
                name="med_type" 
                defaultValue={med.med_type} 
                className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none transition-all font-semibold text-sm"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Starts</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 pointer-events-none" />
                <input 
                  type="date" 
                  name="start_date" 
                  defaultValue={med.start_date ? new Date(med.start_date).toISOString().split('T')[0] : ''} 
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white text-sm font-bold outline-none" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Ends</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 pointer-events-none" />
                <input 
                  type="date" 
                  name="end_date" 
                  defaultValue={med.end_date ? new Date(med.end_date).toISOString().split('T')[0] : ''} 
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white text-sm font-bold outline-none" 
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Instructions</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-slate-300 w-4 h-4" />
              <textarea 
                name="instructions" 
                defaultValue={med.instructions} 
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none transition-all font-medium text-sm h-20 resize-none" 
              />
            </div>
          </div>

          {/* Scheduled Times */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Schedule</label>
              <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-lg">
                <Hash size={10} className="text-blue-500" />
                <span className="text-[10px] font-black text-blue-600">{times.length}x Daily</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2 bg-white text-slate-700 px-3 py-2 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-blue-200">
                  <Clock size={14} className="text-blue-500" />
                  <input 
                    type="time" 
                    value={t} 
                    onChange={(e) => {
                      const newTimes = [...times];
                      newTimes[i] = e.target.value;
                      setTimes(newTimes);
                    }} 
                    className="bg-transparent font-bold text-xs outline-none" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setTimes(times.filter((_, idx) => idx !== i))}
                    className="text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <X size={14}/>
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setTimes([...times, "08:00"])} 
                className="px-4 py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
              >
                + Add Time
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-slate-900 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </button>
            <button 
              type="button" 
              onClick={async () => { 
                if(confirm("Discontinue this medication? It will be moved to history and can no longer be edited.")) {
                  setLoading(true); // Reuse loading state
                  const res = await discontinueMedication(med.id, med.name, med.patientId);
                  setLoading(false);
                  if (res.success) setIsOpen(false);
                }
              }}
              disabled={loading}
              className="bg-rose-50 text-rose-500 px-5 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center justify-center"
              title="Discontinue Medication"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}