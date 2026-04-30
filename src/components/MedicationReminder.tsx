'use client';

import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function MedicationReminder({ meds, todaysLogs }: { meds: any[], todaysLogs: any[] }) {
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });

      meds.forEach(med => {
        // 1. Check if the current time matches a scheduled time
        const isScheduledNow = med.scheduled_times?.includes(currentTime);
        
        // 2. Check if this specific slot has already been logged today
        const alreadyTaken = todaysLogs.some(log => 
          log.med_id === med.id && log.scheduled_slot === currentTime
        );

        if (isScheduledNow && !alreadyTaken) {
          toast(`Time for ${med.name}!`, {
            icon: '💊',
            duration: 8000,
            style: {
              borderRadius: '24px',
              background: '#0F172A',
              color: '#FFFFFF',
              fontWeight: '900',
              padding: '20px'
            }
          });

          const audio = new Audio('/alert.mp3');
          audio.play().catch(() => console.log("Audio waiting for user interaction"));
        }
      });
    };

    const intervalId = setInterval(checkSchedule, 60000);
    checkSchedule();

    return () => clearInterval(intervalId);
  }, [meds, todaysLogs]);

  return null;
}