'use client';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { saveSubscription } from '@/app/actions/notifications'; // Import the action

export default function NotificationSetup() {
  const { user } = useUser();

  useEffect(() => {
    // Ensure we are in the browser and user exists
    if (typeof window === 'undefined' || !user) return;

    const registerAndSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BBt22uMz4mbH9MGQfELu9IhxL4LjPeLX8snOp0NIv-veKB8JHqHaKeS58EPonBRlrkNrAXq_1tI6qqvsKOxU-iM' 
        });

        // Use the Server Action instead of the Supabase Client
        await saveSubscription(user.id, subscription);

      } catch (err) {
        console.error('Push subscription failed:', err);
      }
    };

    registerAndSubscribe();
  }, [user]);

  return null;
}