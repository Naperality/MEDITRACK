'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

export default function MedicationReminder({ meds, todaysLogs }: { meds: any[], todaysLogs: any[] }) {
  // Use a ref to track the last notified minute so we don't spam toasts
  const lastNotifiedRef = useRef<string>("");

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      
      // Explicitly get Philippines Time in 24-hour format (HH:mm)
      const currentTime = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false,
        timeZone: 'Asia/Manila' 
      });

      // Avoid running the logic multiple times in the same minute
      if (lastNotifiedRef.current === currentTime) return;

      meds.forEach(med => {
        const isScheduledNow = med.scheduled_times?.includes(currentTime);
        
        // Only notify if not already logged today (Taken or Missed) in the database
        const alreadyLogged = todaysLogs.some(log => 
          log.med_id === med.id && log.scheduled_slot === currentTime
        );

        if (isScheduledNow && !alreadyLogged) {
          lastNotifiedRef.current = currentTime;

          toast(`Time for ${med.name}!`, {
            icon: '💊',
            duration: 6000,
            style: { 
              borderRadius: '20px', 
              background: '#0F172A', 
              color: '#fff',
              fontWeight: 'bold',
              border: '1px solid #1E293B'
            }
          });

          // Play notification sound
          const audio = new Audio('/alert.mp3');
          audio.play().catch((err) => console.log("Audio playback blocked until user interacts with page."));
        }
      });
    };

    // Check every 30 seconds to ensure we don't miss the start of a minute
    const intervalId = setInterval(checkSchedule, 30000);
    
    // Also check immediately when the component mounts
    checkSchedule();

    return () => clearInterval(intervalId);
  }, [meds, todaysLogs]);

  return null;
}