'use client';

import { useEffect, useState, useRef } from 'react';

export default function MedicationReminder({ meds, todaysLogs }: { meds: any[], todaysLogs: any[] }) {
  const [activeAlarmMed, setActiveAlarmMed] = useState<any>(null);
  const [activeSlot, setActiveSlot] = useState<string>(''); // Tracks the specific time string of the active alarm
  const [dismissedSlots, setDismissedSlots] = useState<string[]>([]); // Tracks manually dismissed slots for today
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize looping audio context safely
  useEffect(() => {
    audioRef.current = new Audio('/alert.wav');
    audioRef.current.loop = true; // Loops non-stop

    return () => {
      stopAlarm();
    };
  }, []);

  const startAlarm = (med: any, slotTime: string) => {
    setActiveAlarmMed(med);
    setActiveSlot(slotTime);
    
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
    setActiveSlot('');
  };

  // Triggered when user explicitly wants to temporarily quiet the alarm
  const handleDismiss = () => {
    if (activeSlot) {
      // Remember that we dismissed this specific slot so it won't fire again this minute
      setDismissedSlots(prev => [...prev, activeSlot]);
    }
    stopAlarm();
  };

  // Clear dismissed tracking slots if the minute changes
  useEffect(() => {
    const now = new Date();
    const manilaTimeStr = now.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', hour12: false
    });

    // Clean up outdated dismissed tracking tokens to keep memory fresh
    setDismissedSlots(prev => prev.filter(slot => slot === manilaTimeStr));
  }, [meds, todaysLogs]); // Re-verify on data sync intervals

  // Listen to messages coming from the background Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TRIGGER_ALARM') {
        const payload = event.data.payload;
        
        const matchedMed = meds.find(m => payload.body.includes(m.name));
        if (matchedMed) {
          // Get current window time slot context
          const now = new Date();
          const currentSlot = now.toLocaleTimeString('en-GB', {
            timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', hour12: false
          });

          if (!dismissedSlots.includes(currentSlot)) {
            startAlarm(matchedMed, currentSlot);
          }
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
  }, [meds, dismissedSlots]);

  // Fallback / Active check: If they open the app and a med status is missed/unlogged
  useEffect(() => {
    const checkActiveDoses = () => {
      const now = new Date();
      const manilaTimeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', hour12: false
      });
      const manilaDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

      // Safety: If this exact time slot was just dismissed, do absolutely nothing
      if (dismissedSlots.includes(manilaTimeStr)) return;

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
          startAlarm(med, manilaTimeStr);
        }
      });
    };

    checkActiveDoses();
  }, [meds, todaysLogs, activeAlarmMed, dismissedSlots]);

  if (!activeAlarmMed) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md overflow-y-auto min-h-screen w-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm my-auto bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-between text-center space-y-6 shadow-2xl">
        
        {/* Top Header / Icon Group */}
        <div className="space-y-4 w-full">
          <div className="relative mx-auto h-20 w-20 rounded-full bg-rose-500 flex items-center justify-center shadow-2xl shadow-rose-500/40 animate-bounce">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
            <span className="text-white text-3xl relative">💊</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight uppercase text-rose-500 animate-pulse">
              Critical Alarm
            </h1>
            <p className="text-slate-400 text-xs px-4">
              Take your scheduled medication immediately.
            </p>
          </div>
        </div>

        {/* Medication Info Card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 shadow-inner">
          <h2 className="text-xl font-black text-white tracking-tight">{activeAlarmMed.name}</h2>
          <p className="text-xs text-rose-400 font-bold tracking-wider uppercase mt-1 bg-rose-500/10 inline-block px-2.5 py-0.5 rounded-full">
            {activeAlarmMed.dosage}
          </p>
        </div>

        {/* Action Button Group */}
        <div className="w-full flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => {
              stopAlarm();
              // Mutation hook to update Supabase goes here
            }}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition-all text-white font-black rounded-xl uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/20"
          >
            I have taken this med
          </button>
          
          <button
            onClick={handleDismiss}
            className="w-full py-3 bg-white/5 hover:bg-white/10 active:scale-[0.99] text-slate-300 font-bold rounded-xl text-xs uppercase tracking-widest transition-all border border-white/5"
          >
            Dismiss Alarm
          </button>
        </div>

      </div>
    </div>
  );
}