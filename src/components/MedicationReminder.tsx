'use client'

import { recordMedicationAction } from "@/app/actions/medication";
import { Check, Lock, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

interface SlotProps {
  med: any;
  time: string;
  userId: string;
  dbStatus?: 'TAKEN' | 'MISSED';
}

export default function MedicationSlot({ med, time, userId, dbStatus }: SlotProps) {
  const [loading, setLoading] = useState(false);

  // --- TIME LOGIC ---
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const slotTime = new Date(now);
  slotTime.setHours(hours, minutes, 0, 0);

  const isFuture = now < slotTime;
  const isTaken = dbStatus === 'TAKEN';
  const isMissed = dbStatus === 'MISSED';

  const handleTake = async () => {
    if (isFuture || isTaken || isMissed || loading) return;
    setLoading(true);
    await recordMedicationAction(med.id, userId, med.name, time);
    setLoading(false);
  };

  // Status Styles Logic
  let buttonStyle = "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed";
  let statusText = "Locked";
  let Icon = Lock;

  if (isTaken) {
    buttonStyle = "bg-green-50 text-green-600 border-green-100 cursor-default";
    statusText = "Taken";
    Icon = Check;
  } else if (isMissed) {
    buttonStyle = "bg-rose-50 text-rose-600 border-rose-100 cursor-default";
    statusText = "Missed";
    Icon = AlertCircle;
  } else if (!isFuture) {
    buttonStyle = "bg-white text-slate-900 border-slate-200 hover:border-rose-500 hover:text-rose-600 shadow-sm active:scale-95";
    statusText = "Take Now";
    Icon = Clock;
  }

  return (
    <button
      onClick={handleTake}
      disabled={isFuture || isTaken || isMissed || loading}
      className={`
        relative flex flex-col items-center justify-center 
        w-full py-4 px-2 rounded-2xl border-2 transition-all duration-200
        ${buttonStyle}
      `}
    >
      <Icon size={18} className="mb-1.5" />
      
      {/* Time Label */}
      <span className="text-[11px] font-black uppercase tracking-tighter mb-0.5">
        {time}
      </span>

      {/* Status Text - Using responsive text sizes to prevent overflow */}
      <span className={`
        text-[9px] font-bold uppercase tracking-widest truncate max-w-full
        ${loading ? "opacity-0" : "opacity-100"}
      `}>
        {statusText}
      </span>

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}