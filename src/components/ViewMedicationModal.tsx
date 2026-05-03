'use client';
import { useState } from 'react';
import { Info, X, Clock, Calendar, FileText, Pill } from 'lucide-react';

export default function ViewMedicationModal({ med }: { med: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
        title="View Details"
      >
        <Info size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                  <Pill size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{med.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prescription Archive</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white rounded-full"><X size={20}/></button>
            </div>

            <div className="p-8 space-y-6">
              {/* Core Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Dosage</label>
                  <p className="text-sm font-bold text-slate-700">{med.dosage} {med.med_type}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Frequency</label>
                  <p className="text-sm font-bold text-slate-700">{med.daily_count}x Daily</p>
                </div>
              </div>

              {/* Date Range */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Duration</p>
                    <p className="text-xs font-bold text-slate-600">
                      {new Date(med.start_date).toLocaleDateString()} — {med.end_date ? new Date(med.end_date).toLocaleDateString() : 'Continuous'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Instructions</label>
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-sm text-slate-600 leading-relaxed italic">
                  "{med.instructions || 'No specific instructions provided.'}"
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Scheduled Times</label>
                <div className="flex flex-wrap gap-2">
                  {med.scheduled_times?.map((t: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                      <Clock size={12} className="text-blue-500" /> {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-600 hover:bg-slate-100 transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}