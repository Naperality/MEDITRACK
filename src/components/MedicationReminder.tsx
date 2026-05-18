'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

export default function MedicationReminder({ meds, todaysLogs }: { meds: any[], todaysLogs: any[] }) {
  const [activeAlarmMed, setActiveAlarmMed] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize looping audio context safely
  useEffect(() => {
    audioRef.current = new Audio('/alert.wav');
    audioRef.current.loop = true; // Loops non-stop

    return () => {
      stopAlarm();
    };
  }, []);

  const startAlarm = (medName: string) => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch((err) => {
        console.warn("Audio autoplay blocked. Waiting for user interaction.", err);
      });
    }
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveAlarmMed(null);
  };

  // Listen to messages coming from the background Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TRIGGER_ALARM') {
        const payload = event.data.payload;
        
        // Find matching medication from props using incoming body/title metadata
        const matchedMed = meds.find(m => payload.body.includes(m.name));
        if (matchedMed) {
          setActiveAlarmMed(matchedMed);
          startAlarm(matchedMed.name);
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
  }, [meds]);

  // Fallback / Active check: If they open the app and a med status is missed/unlogged
  useEffect(() => {
    const checkActiveDoses = () => {
      const now = new Date();
      const manilaTimeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', hour12: false
      });
      const manilaDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

      meds.forEach(med => {
        if (med.is_discontinued) return;

        const isScheduledNow = (med.scheduled_times || []).some((time: string) => 
          time.startsWith(manilaTimeStr)
        );
        const isWithinRange = manilaDateStr >= med.start_date && (med.end_date ? manilaDateStr <= med.end_date : true);
        const alreadyLogged = todaysLogs.some(log =>
          log.med_id === med.id && log.scheduled_slot.startsWith(manilaTimeStr)
        );

        // If app opened EXACTLY during dose slot and it hasn't been handled yet
        if (isScheduledNow && isWithinRange && !alreadyLogged && !activeAlarmMed) {
          setActiveAlarmMed(med);
          startAlarm(med.name);
        }
      });
    };

    checkActiveDoses();
  }, [meds, todaysLogs, activeAlarmMed]);

  if (!activeAlarmMed) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="space-y-6 max-w-sm w-full">
        {/* Pulsing Alarm Indicator */}
        <div className="relative mx-auto h-24 w-24 rounded-full bg-rose-500 flex items-center justify-center shadow-2xl shadow-rose-500/50 animate-bounce">
          <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
          <span className="text-white text-4xl relative">💊</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight animate-pulse">
            CRITICAL ALARM
          </h1>
          <p className="text-slate-400 text-sm">
            Take your scheduled medication immediately.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 my-2">
          <h2 className="text-xl font-bold text-rose-400">{activeAlarmMed.name}</h2>
          <p className="text-xs text-slate-300 font-medium mt-1">{activeAlarmMed.dosage}</p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => {
              // Action: Close alarm UI and silence ringtone
              stopAlarm();
              // Tip: You can invoke a Supabase mutation here to instantly mark it as 'TAKEN'
            }}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition-all text-white font-black rounded-xl uppercase tracking-wider text-sm shadow-xl shadow-emerald-500/20"
          >
            I have taken this med
          </button>
          
          <button
            onClick={stopAlarm}
            className="w-full py-3 bg-transparent hover:bg-white/5 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-widest transition-colors"
          >
            Dismiss Alarm
          </button>
        </div>
      </div>
    </div>
  );
}