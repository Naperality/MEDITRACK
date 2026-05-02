'use client';

import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function MedicationReminder({ meds, todaysLogs }: { meds: any[], todaysLogs: any[] }) {
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const manilaTimeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const manilaDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

      meds.forEach(med => {
        const isScheduledNow = med.scheduled_times?.includes(manilaTimeStr);
        const isWithinRange = manilaDateStr >= med.start_date && 
                             (med.end_date ? manilaDateStr <= med.end_date : true);

        const alreadyLogged = todaysLogs.some(log =>
          log.med_id === med.id && log.scheduled_slot === manilaTimeStr
        );

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

          new Audio('/alert.mp3').play().catch(() => {});
        }
      });
    };

    const intervalId = setInterval(checkSchedule, 60000);
    checkSchedule();
    return () => clearInterval(intervalId);
  }, [meds, todaysLogs]);

  return null;
}