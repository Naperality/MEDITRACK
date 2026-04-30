'use client';
import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { recordMedicationAction } from "@/app/actions/medication";

export default function MedicationSlot({ med, time, isTaken, userId }: any) {
  const [status, setStatus] = useState<'PENDING' | 'MISSED' | 'TAKEN'>(isTaken ? 'TAKEN' : 'PENDING');

  useEffect(() => {
    if (isTaken) return;

    const checkStatus = () => {
      const [hours, minutes] = time.split(':');
      const slotTime = new Date();
      slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (new Date() > slotTime) {
        setStatus('MISSED');
      } else {
        setStatus('PENDING');
      }
    };

    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    checkStatus();
    return () => clearInterval(interval);
  }, [time, isTaken]);

  return (
    <form action={async () => {
      await recordMedicationAction(med.id, userId, med.name, time);
    }}>
      <button
        type="submit"
        disabled={status === 'TAKEN'}
        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border shadow-sm ${
          status === 'TAKEN' ? 'bg-green-100 border-green-200 text-green-700' :
          status === 'MISSED' ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' :
          'bg-white border-slate-200 text-slate-700 hover:border-blue-500'
        }`}
      >
        {status === 'TAKEN' ? <CheckCircle2 className="w-4 h-4" /> : 
         status === 'MISSED' ? <AlertCircle className="w-4 h-4" /> : 
         <Clock className="w-4 h-4" />}
        {time} {status === 'MISSED' && "(Missed)"}
      </button>
    </form>
  );
}