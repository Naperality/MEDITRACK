'use client';
import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { recordMedicationAction } from "@/app/actions/medication";

export default function MedicationSlot({ med, time, isTaken, userId }: any) {
  // Initialize state based on whether the DB says it was already taken
  const [status, setStatus] = useState<'PENDING' | 'MISSED' | 'TAKEN'>(isTaken ? 'TAKEN' : 'PENDING');
  const [displayDate, setDisplayDate] = useState<string>("");

  useEffect(() => {
    if (isTaken) {
      setStatus('TAKEN');
      return;
    }

    const checkStatus = () => {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      
      // Create a reference for the scheduled time TODAY
      const scheduledToday = new Date();
      scheduledToday.setHours(hours, minutes, 0, 0);

      // Set the date string for clarity (e.g., "May 1")
      setDisplayDate(now.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }));

      // If the current time is strictly after the scheduled time, mark as MISSED
      if (now > scheduledToday) {
        setStatus('MISSED');
      } else {
        setStatus('PENDING');
      }
    };

    checkStatus();
    // Check every 30 seconds to update from PENDING to MISSED in real-time
    const interval = setInterval(checkStatus, 30000); 
    
    return () => clearInterval(interval);
  }, [time, isTaken]);

  const handleAction = async () => {
    // Optimistic Update: Change color immediately so user knows it worked
    setStatus('TAKEN');
    try {
      await recordMedicationAction(med.id, userId, med.name, time);
    } catch (error) {
      // If the database fails, revert the UI so they can try again
      console.error("Failed to record medication:", error);
      setStatus(isTaken ? 'TAKEN' : 'PENDING');
    }
  };

  return (
    <form action={handleAction}>
      <button
        type="submit"
        disabled={status === 'TAKEN'}
        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border shadow-sm ${
          status === 'TAKEN' 
            ? 'bg-green-100 border-green-200 text-green-700 opacity-90 cursor-not-allowed' 
            : status === 'MISSED' 
            ? 'bg-red-50 border-red-200 text-red-600 animate-pulse hover:bg-red-100' 
            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:shadow-md'
        }`}
      >
        {status === 'TAKEN' ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : status === 'MISSED' ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Clock className="w-4 h-4" />
        )}
        
        <span className="tabular-nums">{time}</span>

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