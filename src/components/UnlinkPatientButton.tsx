'use client';
import { useState } from 'react';
import { UserMinus, Loader2 } from 'lucide-react';
import { unlinkPatient } from '@/app/actions/management';

export default function UnlinkPatientButton({ caregiverId, patientId, patientName }: any) {
  const [loading, setLoading] = useState(false);

  const handleUnlink = async () => {
    if (!confirm(`Stop monitoring ${patientName}? This cannot be undone.`)) return;
    
    setLoading(true);
    await unlinkPatient(caregiverId, patientId);
    setLoading(false);
  };

  return (
    <button 
      onClick={handleUnlink}
      disabled={loading}
      className="flex items-center gap-2 text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-rose-100"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserMinus className="w-3 h-3" />}
      Unlink
    </button>
  );
}