'use client';
import { useState } from 'react';
import { Info, X, Clock, Calendar, Pill } from 'lucide-react';

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
        /* 
           FIX: We add 'grayscale-0 opacity-100' here to counteract 
           the parent row's 'opacity-60 grayscale' 
        */
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all opacity-100 grayscale-0">
          
          <div 
            className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 opacity-100 grayscale-0" 
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
          >
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Pill size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 leading-tight">{med.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Prescription Details</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-8 space-y-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dosage</span>
                  <p className="text-sm font-bold text-slate-700">{med.dosage || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Frequency</span>
                  <p className="text-sm font-bold text-slate-700">{med.daily_count}x Per Day</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar size={14} className="text-blue-500" />
                  <p className="text-xs font-semibold">
                    Started: <span className="text-slate-900">{new Date(med.start_date).toLocaleDateString()}</span>
                  </p>
                </div>
                {med.end_date && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock size={14} className="text-amber-500" />
                    <p className="text-xs font-semibold">
                      Ended: <span className="text-slate-900">{new Date(med.end_date).toLocaleDateString()}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Instructions</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100/30 italic">
                  "{med.instructions || 'No additional instructions provided.'}"
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
              >
                Close Information
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}