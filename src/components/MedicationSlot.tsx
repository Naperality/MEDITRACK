'use client';
import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { recordMedicationAction } from "@/app/actions/medication";

export default function MedicationSlot({ med, time, dbStatus, userId }: any) {
  const [status, setStatus] = useState<'PENDING' | 'MISSED' | 'TAKEN' | 'LOCKED'>('LOCKED');

  useEffect(() => {
    const checkStatus = () => {
      // If DB has a record for today, use that status permanently for the rest of the day
      if (dbStatus) {
        setStatus(dbStatus);
        return;
      }

      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      
      const scheduledToday = new Date();
      scheduledToday.setHours(hours, minutes, 0, 0);

      const oneHourBefore = new Date(scheduledToday.getTime() - 60 * 60 * 1000);
      const gracePeriodEnd = new Date(scheduledToday.getTime() + 30 * 60 * 1000);

      if (now > gracePeriodEnd) {
        setStatus('MISSED');
      } else if (now >= oneHourBefore && now <= gracePeriodEnd) {
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
      setStatus('PENDING');
    }
  };

  const styles = {
    TAKEN: 'bg-green-100 border-green-200 text-green-700 cursor-not-allowed',
    MISSED: 'bg-red-50 border-red-200 text-red-600 cursor-not-allowed',
    LOCKED: 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed grayscale',
    PENDING: 'bg-white border-blue-500 text-blue-700 shadow-md ring-2 ring-blue-100 hover:scale-105 cursor-pointer'
  };

  return (
    <button
      onClick={handleAction}
      disabled={status !== 'PENDING'}
      className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border ${styles[status]}`}
    >
      {status === 'TAKEN' ? <CheckCircle2 size={16} /> : 
       status === 'MISSED' ? <AlertCircle size={16} /> : 
       status === 'LOCKED' ? <Lock size={16} /> : <Clock size={16} />}
      
      <span className="tabular-nums">{time}</span>
      <span className="text-[9px] uppercase ml-1 opacity-70">{status}</span>
    </button>
  );
}