'use client';
import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Lock } from "lucide-react"; // Added Lock icon
import { recordMedicationAction } from "@/app/actions/medication";

export default function MedicationSlot({ med, time, isTaken, userId }: any) {
  const [status, setStatus] = useState<'PENDING' | 'MISSED' | 'TAKEN' | 'LOCKED'>(isTaken ? 'TAKEN' : 'LOCKED');
  const [displayDate, setDisplayDate] = useState<string>("");

  useEffect(() => {
    if (isTaken) {
      setStatus('TAKEN');
      return;
    }

    const checkStatus = () => {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      
      const scheduledToday = new Date();
      scheduledToday.setHours(hours, minutes, 0, 0);

      // --- THE NEW LOGIC ---
      const oneHourBefore = new Date(scheduledToday.getTime() - 60 * 60 * 1000);
      
      setDisplayDate(now.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }));

      if (now > scheduledToday) {
        setStatus('MISSED');
      } else if (now >= oneHourBefore && now <= scheduledToday) {
        // It's within the 1-hour window
        setStatus('PENDING'); 
      } else {
        // It's too early
        setStatus('LOCKED');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); 
    return () => clearInterval(interval);
  }, [time, isTaken]);

  const handleAction = async () => {
    // Prevent clicks if locked or missed (unless you want them to take missed doses)
    if (status === 'LOCKED' || status === 'TAKEN') return;

    setStatus('TAKEN');
    try {
      await recordMedicationAction(med.id, userId, med.name, time);
    } catch (error) {
      console.error("Failed to record medication:", error);
      // Re-run status check to revert to correct state
      setStatus(isTaken ? 'TAKEN' : 'PENDING');
    }
  };

  // Helper to determine styling
  const getStyles = () => {
    switch (status) {
      case 'TAKEN':
        return 'bg-green-100 border-green-200 text-green-700 opacity-90 cursor-not-allowed';
      case 'MISSED':
        return 'bg-red-50 border-red-200 text-red-600 animate-pulse hover:bg-red-100';
      case 'LOCKED':
        return 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed grayscale';
      default: // PENDING (Active window)
        return 'bg-white border-blue-500 text-blue-700 shadow-md ring-2 ring-blue-100 hover:scale-105';
    }
  };

  return (
    <form action={handleAction}>
      <button
        type="submit"
        disabled={status === 'TAKEN' || status === 'LOCKED' || status === 'MISSED'}
        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border shadow-sm ${getStyles()}`}
      >
        {status === 'TAKEN' ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : status === 'MISSED' ? (
          <AlertCircle className="w-4 h-4" />
        ) : status === 'LOCKED' ? (
          <Lock className="w-4 h-4" />
        ) : (
          <Clock className="w-4 h-4" />
        )}
        
        <span className="tabular-nums">{time}</span>

        {status === 'LOCKED' && (
           <span className="text-[9px] uppercase ml-1 opacity-60">Locked</span>
        )}

        {status === 'MISSED' && (
          <span className="ml-1 text-[9px] uppercase font-black tracking-tighter flex flex-col items-start leading-none">
            <span>Missed</span>
            <span className="opacity-60">{displayDate}</span>
          </span>
        )}
      </button>
    </form>
  );
}