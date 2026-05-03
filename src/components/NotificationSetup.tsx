'use client';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { saveSubscription } from '@/app/actions/notifications';

// Helper function to convert VAPID string to required format
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationSetup() {
  const { user } = useUser();

  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;

    const registerAndSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // FIX: Convert the string key to Uint8Array
        const convertedVapidKey = urlBase64ToUint8Array('BL37-lY0OgpI58Jy9Z20Sl31LqyfgBs2BVcx4ErfzBv4OwFbrVkW1q61MxPvKISKvEzNZCOKmCii8oYLurwr99A');

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });

        await saveSubscription(user.id, subscription);
        console.log("Successfully subscribed to background notifications!");

      } catch (err) {
        console.error('Push subscription failed:', err);
      }
    };

    registerAndSubscribe();
  }, [user]);

  return null; // Stays invisible as requested
}