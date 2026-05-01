'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { recordMedicationAction } from "@/app/actions/medication";

export default function MedicationSlot({ med, time, dbStatus, userId }: any) {
  const [status, setStatus] = useState<'PENDING' | 'MISSED' | 'TAKEN' | 'LOCKED'>('LOCKED');

  useEffect(() => {
    const checkStatus = () => {
      // 1. If the database already has a status (TAKEN or MISSED), use it immediately
      if (dbStatus) {
        setStatus(dbStatus);
        return;
      }

      // 2. Get the current time (Browser time is already PHT in Cebu)
      const now = new Date();
      
      // 3. Parse the scheduled time (HH:mm)
      const [hours, minutes] = time.split(':').map(Number);
      
      // 4. Create a Date object for the scheduled slot TODAY
      const scheduledToday = new Date();
      scheduledToday.setHours(hours, minutes, 0, 0);

      // 5. Define the "Window" (e.g., 1 hour before the scheduled time)
      const oneHourBefore = new Date(scheduledToday.getTime() - 60 * 60 * 1000);
      
      /**
       * TIME LOGIC:
       * - If it's more than 1 minute past the scheduled time, it's MISSED.
       * - If it's within 1 hour before the time, it's PENDING (clickable).
       * - Otherwise, it's LOCKED.
       */
      if (now > scheduledToday) {
        setStatus('MISSED');
      } else if (now >= oneHourBefore && now <= scheduledToday) {
        setStatus('PENDING'); 
      } else {
        setStatus('LOCKED');
      }
    };

    // Run immediately on mount
    checkStatus();

    // Update every 10 seconds to keep the UI fresh without heavy lag
    const interval = setInterval(checkStatus, 10000); 
    return () => clearInterval(interval);
  }, [time, dbStatus]);

  const handleAction = async () => {
    if (status !== 'PENDING') return;

    // Optimistic Update: Change UI immediately before the database responds
    const previousStatus = status;
    setStatus('TAKEN');

    try {
      await recordMedicationAction(med.id, userId, med.name, time);
    } catch (error) {
      console.error("Failed to record action:", error);
      // Rollback status if the server call fails
      setStatus(previousStatus);
    }
  };

  const styles = {
    TAKEN: 'bg-green-100 border-green-200 text-green-700 cursor-not-allowed',
    MISSED: 'bg-red-50 border-red-200 text-red-600 cursor-not-allowed',
    LOCKED: 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed grayscale opacity-60',
    PENDING: 'bg-white border-blue-500 text-blue-700 shadow-md ring-2 ring-blue-100 hover:scale-105 active:scale-95 cursor-pointer transition-all'
  };

  return (
    <button
      onClick={handleAction}
      disabled={status !== 'PENDING'}
      className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border ${styles[status]}`}
    >
      <div className="shrink-0">
        {status === 'TAKEN' && <CheckCircle2 size={16} />}
        {status === 'MISSED' && <AlertCircle size={16} />}
        {status === 'LOCKED' && <Lock size={16} />}
        {status === 'PENDING' && <Clock size={16} className="animate-pulse" />}
      </div>
      
      <span className="tabular-nums tracking-tight">{time}</span>
      <span className="text-[9px] font-black uppercase ml-1 opacity-70 tracking-widest">
        {status}
      </span>
    </button>
  );
}