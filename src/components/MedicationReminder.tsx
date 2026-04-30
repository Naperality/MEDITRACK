'use client';

import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function MedicationReminder({ meds }: { meds: any[] }) {
  useEffect(() => {
    const checkSchedule = () => {
      // Format current time as HH:MM to match database
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });

      meds.forEach(med => {
        // Only remind if the medication hasn't been taken yet
        if (med.scheduled_times?.includes(currentTime) && !med.is_taken) {
          // 1. Browser Notification (Toast)
          toast(`Time for ${med.name}!`, {
            icon: '💊',
            duration: 8000,
            style: {
              borderRadius: '24px',
              background: '#0F172A',
              color: '#FFFFFF',
              fontWeight: '900',
              fontSize: '14px',
              padding: '20px'
            }
          });

          // 2. Play Audio Chime
          const audio = new Audio('/alert.mp3');
          audio.play().catch(e => console.log("Audio playback delayed until user interaction"));
        }
      });
    };

    // Check once a minute
    const intervalId = setInterval(checkSchedule, 60000);
    
    // Initial check on load
    checkSchedule();

    return () => clearInterval(intervalId);
  }, [meds]);

  return null;
}