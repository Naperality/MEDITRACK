'use client';

import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function MedicationReminder({ meds, todaysLogs }: { meds: any[], todaysLogs: any[] }) {
  useEffect(() => {
    const checkSchedule = () => {
      // 1. Get current Manila Time in HH:mm format
      const now = new Date();
      const manilaTimeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // 2. Get current Manila Date in YYYY-MM-DD format
      const manilaDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

      meds.forEach(med => {
        // SAFETY: Skip if the medication is discontinued
        if (med.is_discontinued === true) return;

        // 3. Match against Database Time (HH:mm:ss)
        // Since database has seconds and app has minutes, we use .startsWith()
        const isScheduledNow = (med.scheduled_times || []).some((time: string) => 
          time.startsWith(manilaTimeStr)
        );

        // 4. Date Range Validation
        const isWithinRange = manilaDateStr >= med.start_date && 
                             (med.end_date ? manilaDateStr <= med.end_date : true);

        // 5. Already Logged Check
        // We check if any log for today matches this medication ID AND this specific time slot
        const alreadyLogged = todaysLogs.some(log =>
          log.med_id === med.id && log.scheduled_slot.startsWith(manilaTimeStr)
        );

        // 6. Trigger Notification
        if (isScheduledNow && isWithinRange && !alreadyLogged) {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
              max-w-md w-[90vw] sm:w-full bg-slate-900 shadow-2xl rounded-[1.5rem] pointer-events-auto 
              flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-white/10 mx-auto`}>
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
                    <p className="mt-1 text-[11px] font-medium text-slate-400 leading-relaxed">
                      It's time for <span className="text-rose-400 font-bold">{med.name}</span> <span className="opacity-60">({med.dosage})</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-white/5">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-6 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 6000 });

          // Play notification sound
          new Audio('/alert.wav').play().catch(() => {
             console.log("Audio playback blocked until user interacts with the page.");
          });
        }
      });
    };

    // Run check every minute
    const intervalId = setInterval(checkSchedule, 60000);
    
    // Initial check on component mount
    checkSchedule();

    return () => clearInterval(intervalId);
  }, [meds, todaysLogs]);

  return null;
}