'use client';
import { useEffect } from 'react';

export default function SyncTrigger({ isCaregiver = false }: { isCaregiver?: boolean }) {
  useEffect(() => {
    const url = isCaregiver ? '/api/sync?role=caregiver' : '/api/sync';
    fetch(url, { method: 'POST' }).catch(console.error);
  }, [isCaregiver]);

  return null;
}