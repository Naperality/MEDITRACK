'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Lock, X } from "lucide-react";
import { recordMedicationAction } from "@/app/actions/medication";

export default function MedicationSlot({ med, time, dbStatus, userId }: any) {
  const [status, setStatus] = useState<'PENDING' | 'MISSED' | 'TAKEN' | 'LOCKED'>('LOCKED');
  const [showConfirm, setShowConfirm] = useState(false); // New state for modal

  // Clean time formatting: "08:00:00" -> "08:00"
  const displayTime = time.split(':').slice(0, 2).join(':');

  useEffect(() => {
    const checkStatus = () => {
      if (dbStatus) {
        setStatus(dbStatus);
        return;
      }

      const now = new Date();
      const manilaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));

      const [hours, minutes] = time.split(':').map(Number);
      const scheduledToday = new Date(manilaTime);
      scheduledToday.setHours(hours, minutes, 0, 0);

      const nowMs = manilaTime.getTime();
      const scheduledMs = scheduledToday.getTime();

      const oneHour = 60 * 60 * 1000;
      const twoHours = 30 * 60 * 1000; // Note: Your code said 30m but variable said 2hrs, kept your logic
      
      if (nowMs > scheduledMs + twoHours) {
        setStatus('MISSED');
      } else if (nowMs >= scheduledMs - oneHour && nowMs <= scheduledMs + twoHours) {
        setStatus('PENDING');
      } else {
        setStatus('LOCKED');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [time, dbStatus]);

  const handleAction = async () => {
    if (status !== 'PENDING') return;

    setStatus('TAKEN');
    try {
      // Send 'time' (e.g., "13:00") directly instead of the ISO string
      await recordMedicationAction(med.id, userId, med.name, time);
    } catch (error) {
      console.error("Action failed:", error);
      setStatus('PENDING');
    }
  };

  // Final confirmation to push to Supabase
  const confirmAction = async () => {
    setShowConfirm(false);
    setStatus('TAKEN');
    try {
      await recordMedicationAction(med.id, userId, med.name, time);
    } catch (error) {
      console.error("Action failed:", error);
      setStatus('PENDING');
    }
  };

  const styles = {
    // Use Emerald for Success
    TAKEN: 'bg-emerald-50 border-emerald-100 text-emerald-600 cursor-not-allowed',
    // Use Amber for Missed (less aggressive than pink/red)
    MISSED: 'bg-amber-50 border-amber-100 text-amber-700 cursor-not-allowed',
    // Use Slate for Locked
    LOCKED: 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50',
    // Use Indigo/Violet for Pending (High contrast, distinct from Rose)
    PENDING: 'bg-white border-indigo-500 text-indigo-600 shadow-sm ring-4 ring-indigo-50 hover:scale-105 cursor-pointer active:scale-95'
  };

  return (
    <>
      {/* MAIN SLOT BUTTON */}
      <button
        // Changed handleAction to setShowConfirm(true) to trigger the popup first
        onClick={() => status === 'PENDING' && setShowConfirm(true)}
        disabled={status !== 'PENDING'}
        className={`
          flex flex-col items-center justify-center 
          w-full min-h-[70px] p-2 rounded-2xl 
          transition-all duration-300 border 
          ${styles[status]}
        `}
      >
        {/* Small Icon + Status Text row */}
        <div className="flex items-center gap-1 mb-1">
          {status === 'TAKEN' && <CheckCircle2 size={10} className="text-emerald-500" />}
          {status === 'MISSED' && <AlertCircle size={10} className="text-amber-500" />}
          {status === 'LOCKED' && <Lock size={10} />}
          {status === 'PENDING' && <Clock size={10} className="text-indigo-500 animate-pulse" />}
          <span className="text-[9px] font-black uppercase tracking-tighter opacity-80">
            {status}
          </span>
        </div>
        
        {/* Large Bold Time */}
        <span className="text-sm font-black tabular-nums tracking-tight">
          {displayTime}
        </span>
      </button>

      {/* CONFIRMATION POPUP */}
      {showConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)} // Closes if user clicks outside the window
        >
          <div 
            className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevents closing if user clicks inside the window
          >
            <div className="mb-4">
              <h3 className="text-lg font-black text-slate-900 leading-tight">{med.name}</h3>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                {med.dosage} • {displayTime}
              </p>
            </div>

            {med.instruction && (
              <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Instruction</span>
                <p className="text-xs text-slate-600 italic">"{med.instruction}"</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={confirmAction} // This pushes to Supabase
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm active:scale-95 transition-transform"
              >
                CONFIRM DOSE
              </button>
              
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}