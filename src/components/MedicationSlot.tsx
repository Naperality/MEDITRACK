'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { recordMedicationAction } from "@/app/actions/medication";

export default function MedicationSlot({ med, time, dbStatus, userId }: any) {
  const [status, setStatus] = useState<'PENDING' | 'MISSED' | 'TAKEN' | 'LOCKED'>('LOCKED');

  useEffect(() => {
    const checkStatus = () => {
      if (dbStatus) {
        setStatus(dbStatus);
        return;
      }

      // 1. Get exact current time in Manila
      const now = new Date();
      const manilaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));

      // 2. Parse scheduled time (HH:mm)
      const [hours, minutes] = time.split(':').map(Number);
      
      // 3. Create scheduled date based on Manila's current date
      const scheduledToday = new Date(manilaTime);
      scheduledToday.setHours(hours, minutes, 0, 0);

      const nowMs = manilaTime.getTime();
      const scheduledMs = scheduledToday.getTime();

      // Define Windows (in milliseconds)
      const oneHour = 60 * 60 * 1000;
      const twoHours = 30 * 60 * 1000;

      // Logic:
      // PENDING: From 1 hour before until 2 hours after
      // MISSED: If current time is more than 2 hours past scheduled
      // LOCKED: If current time is more than 1 hour before scheduled
      
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