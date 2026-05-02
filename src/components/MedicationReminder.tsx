'use client';

import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function MedicationReminder({ meds, todaysLogs }: { meds: any[], todaysLogs: any[] }) {
  useEffect(() => {
    const checkSchedule = () => {
      // 1. Get precise Manila time components
      const now = new Date();
      const manilaTimeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // 2. Get current Manila date for date-range validation
      const manilaDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

      meds.forEach(med => {
        // --- VALIDATION LOGIC ---
        // A. Is it scheduled for this exact minute?
        const isScheduledNow = med.scheduled_times?.includes(manilaTimeStr);
        
        // B. Is today within the start/end date range?
        const isWithinRange = manilaDateStr >= med.start_date && 
                             (med.end_date ? manilaDateStr <= med.end_date : true);

        // C. Has it already been dealt with (Taken or Missed)?
        const alreadyLogged = todaysLogs.some(log =>
          log.med_id === med.id && log.scheduled_slot === manilaTimeStr
        );

        if (isScheduledNow && isWithinRange && !alreadyLogged) {
          // --- SLEEK NOTIFICATION DESIGN ---
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
              max-w-md w-full bg-slate-900 shadow-2xl rounded-[1.5rem] pointer-events-auto 
              flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-white/10`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                      <span className="text-white text-lg">💊</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-black text-white tracking-tight">
                      Medication Alert
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      It's time for <span className="text-rose-400 font-bold">{med.name}</span> ({med.dosage})
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-white/5">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 6000 });

          // Play Sound
          new Audio('/alert.mp3').play().catch(() => {});
        }
      });
    };

    // Run check every minute
    const intervalId = setInterval(checkSchedule, 60000);
    // Initial check on mount
    checkSchedule();

    return () => clearInterval(intervalId);
  }, [meds, todaysLogs]);

  return null;
}