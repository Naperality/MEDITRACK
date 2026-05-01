'use client';

import { useEffect } from 'react';

export default function SyncTrigger() {
  useEffect(() => {
    // This calls an API route we will create in step 2
    fetch('/api/sync', { method: 'POST' });
  }, []);

  return null; // This component doesn't render anything visible
}