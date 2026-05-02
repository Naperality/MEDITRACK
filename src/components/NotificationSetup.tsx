'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';

export default function NotificationSetup() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const registerAndSubscribe = async () => {
      try {
        // 1. Register Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // 2. Request Permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // 3. Subscribe to Push (You need VAPID keys - see Step 3)
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BBt22uMz4mbH9MGQfELu9IhxL4LjPeLX8snOp0NIv-veKB8JHqHaKeS58EPonBRlrkNrAXq_1tI6qqvsKOxU-iM' 
        });

        // 4. Save to Supabase 'profiles' or a new 'subscriptions' table
        await supabase
          .from('profiles')
          .update({ push_subscription: JSON.stringify(subscription) })
          .eq('id', user.id);

      } catch (err) {
        console.error('Push subscription failed:', err);
      }
    };

    registerAndSubscribe();
  }, [user]);

  return null;
}