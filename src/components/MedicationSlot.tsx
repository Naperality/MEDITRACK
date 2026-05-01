'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { recordMedicationAction } from "@/app/actions/medication";

export default function MedicationSlot({ med, time, dbStatus, userId }: any) {
  const [status, setStatus] = useState<'PENDING' | 'MISSED' | 'TAKEN' | 'LOCKED'>('LOCKED');

  useEffect(() => {
    const checkStatus = () => {
      // If DB already has a status (TAKEN/MISSED), prioritize that
      if (dbStatus) {
        setStatus(dbStatus);
        return;
      }

      // Get current time specifically for Asia/Manila
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));

      const [hours, minutes] = time.split(':').map(Number);
      const scheduledToday = new Date(now);
      scheduledToday.setHours(hours, minutes, 0, 0);

      // Window to take medication (e.g., 1 hour before scheduled time)
      const oneHourBefore = new Date(scheduledToday.getTime() - 60 * 60 * 1000);

      if (now > scheduledToday) {
        // If it's 1 second past the scheduled time and not in DB, it's MISSED
        setStatus('MISSED');
      } else if (now >= oneHourBefore && now <= scheduledToday) {
        // If we are within 1 hour of the time
        setStatus('PENDING');
      } else {
        // Otherwise, it's too early
        setStatus('LOCKED');
      }
    };

    checkStatus();
    // Check every 15 seconds to update the UI in real-time
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [time, dbStatus]);

  const handleAction = async () => {
    if (status !== 'PENDING') return;
    
    // Optimistic UI update
    setStatus('TAKEN');
    
    try {
      await recordMedicationAction(med.id, userId, med.name, time);
    } catch (error) {
      console.error("Action failed:", error);
      setStatus('PENDING'); // Rollback on error
    }
  };

  const styles = {
    TAKEN: 'bg-green-100 border-green-200 text-green-700 cursor-not-allowed',
    MISSED: 'bg-red-50 border-red-200 text-red-600 cursor-not-allowed',
    LOCKED: 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed grayscale',
    PENDING: 'bg-white border-blue-500 text-blue-700 shadow-md ring-2 ring-blue-100 hover:scale-105 cursor-pointer active:scale-95'
  };

  return (
    <button
      onClick={handleAction}
      disabled={status !== 'PENDING'}
      className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border ${styles[status]}`}
    >
      {status === 'TAKEN' && <CheckCircle2 size={16} />}
      {status === 'MISSED' && <AlertCircle size={16} />}
      {status === 'LOCKED' && <Lock size={16} />}
      {status === 'PENDING' && <Clock size={16} />}
      
      <span className="tabular-nums">{time}</span>
      <span className="text-[9px] uppercase ml-1 opacity-70">{status}</span>
    </button>
  );
}