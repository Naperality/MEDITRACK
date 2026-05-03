'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Required for the teleport
import { Info, X, Clock, Calendar, Pill } from 'lucide-react';

export default function ViewMedicationModal({ med }: { med: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure we are on the client before using Portals
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - Click to close */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/20"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Pill size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900 leading-tight">{med.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prescription Info</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors shadow-sm bg-white/50"
          >
            <X size={20}/>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Dosage</span>
              <p className="text-sm font-bold text-slate-700">{med.dosage || 'N/A'}</p>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Daily Count</span>
              <p className="text-sm font-bold text-slate-700">{med.daily_count}x Per Day</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/30 space-y-3">
            <div className="flex items-center gap-3 text-slate-600">
              <Calendar size={14} className="text-blue-500" />
              <p className="text-xs font-semibold">Started: <span className="text-slate-900 font-bold">{new Date(med.start_date).toLocaleDateString()}</span></p>
            </div>
            {med.end_date && (
              <div className="flex items-center gap-3 text-slate-600">
                <Clock size={14} className="text-amber-500" />
                <p className="text-xs font-semibold">Ended: <span className="text-slate-900 font-bold">{new Date(med.end_date).toLocaleDateString()}</span></p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Instructions</span>
            <div className="text-xs text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm italic ring-1 ring-slate-50">
              "{med.instructions || 'No additional instructions provided.'}"
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/80 border-t border-slate-100">
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98]"
          >
            Close Information
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
      >
        <Info size={18} />
      </button>

      {/* This renders the modal at the root of the document, bypassing the grayed-out row */}
      {isOpen && createPortal(modalContent, document.body)}
    </>
  );
}