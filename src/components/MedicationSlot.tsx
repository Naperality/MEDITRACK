'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { recordMedicationAction } from "@/app/actions/medication";

export default function MedicationSlot({ med, time, dbStatus, userId }: any) {
  const [status, setStatus] = useState<'PENDING' | 'MISSED' | 'TAKEN' | 'LOCKED'>('LOCKED');

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
      await recordMedicationAction(med.id, userId, med.name, time);
    } catch (error) {
      console.error("Action failed:", error);
      setStatus('PENDING');
    }
  };

  const styles = {
    TAKEN: 'bg-green-50 border-green-100 text-green-600 cursor-not-allowed',
    MISSED: 'bg-rose-50 border-rose-100 text-rose-600 cursor-not-allowed',
    LOCKED: 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-60',
    PENDING: 'bg-white border-rose-500 text-rose-600 shadow-sm ring-4 ring-rose-50 hover:scale-105 cursor-pointer active:scale-95'
  };

  return (
    <button
      onClick={handleAction}
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
        {status === 'TAKEN' && <CheckCircle2 size={10} />}
        {status === 'MISSED' && <AlertCircle size={10} />}
        {status === 'LOCKED' && <Lock size={10} />}
        {status === 'PENDING' && <Clock size={10} className="animate-pulse" />}
        <span className="text-[9px] font-black uppercase tracking-tighter opacity-80">
          {status}
        </span>
      </div>
      
      {/* Large Bold Time */}
      <span className="text-sm font-black tabular-nums tracking-tight">
        {displayTime}
      </span>
    </button>
  );
}