'use client';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function MedicationReminder({ meds, todaysLogs }: { meds: any[], todaysLogs: any[] }) {
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', minute: '2-digit', hour12: false 
      });

      meds.forEach(med => {
        const isScheduledNow = med.scheduled_times?.includes(currentTime);
        
        // Only notify if not already logged today (Taken or Missed)
        const alreadyLogged = todaysLogs.some(log => 
          log.med_id === med.id && log.scheduled_slot === currentTime
        );

        if (isScheduledNow && !alreadyLogged) {
          toast(`Time for ${med.name}!`, {
            icon: '💊',
            duration: 5000,
            style: { borderRadius: '20px', background: '#0F172A', color: '#fff' }
          });

          new Audio('/alert.mp3').play().catch(() => {});
        }
      });
    };

    const intervalId = setInterval(checkSchedule, 60000);
    return () => clearInterval(intervalId);
  }, [meds, todaysLogs]);

  return null;
}