"use client";
import { useState } from "react";
import { ChevronDown, History, Pill, Clock, CheckCircle2, Archive } from "lucide-react";
import AddMedicationForm from "./AddMedicationForm";
import UnlinkPatientButton from "@/components/UnlinkPatientButton";
import EditMedicationModal from "@/components/EditMedicationModal";
import ViewMedicationModal from "./ViewMedicationModal";

// Note: Added caregiverId to the props to support unlinking
export default function PatientCard({ profile, patientId, logs, caregiverId }: any) {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to determine the status badge
  const getMedicationStatus = (med: any) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
    
    const endDate = med.end_date ? new Date(med.end_date) : null;
    if (endDate) endDate.setHours(0, 0, 0, 0);

    // 1. Check if the medication period has ended
    if (endDate && now > endDate) {
      return {
        label: 'Completed',
        style: 'text-slate-600 bg-slate-100',
        icon: <Archive size={14} />
      };
    }

    // 2. If active, check if taken today
    if (med.is_taken) {
      return {
        label: 'Taken',
        style: 'text-green-600 bg-green-50',
        icon: <CheckCircle2 size={14} />
      };
    }

    // 3. Otherwise, it's pending for today
    return {
      label: 'Pending',
      style: 'text-amber-600 bg-amber-50',
      icon: <Clock size={14} />
    };
  };

  return (
    <div className={`bg-white border transition-all duration-300 rounded-[2rem] overflow-hidden ${isOpen ? 'border-blue-200 shadow-xl' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}>
      
      {/* Header - Always Visible */}
      <div className="p-5 sm:p-6 flex items-center justify-between group">
        {/* Clickable area for expansion */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-4 cursor-pointer flex-1"
        >
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {profile?.full_name?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{profile?.full_name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {profile?.medications?.length || 0} Medications Active
            </p>
          </div>
        </div>
        
        {/* Action area: Unlink Button + Status Indicator */}
        <div className="flex items-center gap-3">
            {/* NEW: Unlink Patient Button */}
            <UnlinkPatientButton 
              caregiverId={caregiverId} 
              patientId={patientId} 
              patientName={profile?.full_name} 
            />

            <div 
              onClick={() => setIsOpen(!isOpen)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer ${isOpen ? 'bg-blue-50' : 'bg-slate-50'}`}
            >
               <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
               <span className={`text-[10px] font-bold uppercase ${isOpen ? 'text-blue-600' : 'text-slate-400'}`}>
                 {isOpen ? 'Viewing Details' : 'Click to View'}
               </span>
            </div>
            <ChevronDown 
              onClick={() => setIsOpen(!isOpen)}
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 cursor-pointer ${isOpen ? 'rotate-180' : ''}`} 
            />
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="border-t border-slate-50 flex flex-col lg:flex-row animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Main Info Area */}
          <div className="flex-1 p-6 sm:p-8 lg:border-r border-slate-100">
            {/* Prescribe Form */}
            <div className="mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Prescribe New Medication</h4>
              <AddMedicationForm patientId={patientId} />
            </div>

            {/* Medication List */}
            <div className="space-y-4">
               {profile?.medications?.map((med: any) => {
                  const status = getMedicationStatus(med);
                  const isCompleted = status.label === 'Completed';
                  const isInactive = med.is_discontinued;
                  return (
                    <div key={med.id} className={`p-5 rounded-2xl bg-white border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${status.label === 'Completed' ? 'opacity-60 grayscale-[0.5]' : 'hover:border-blue-100 border-slate-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${status.label === 'Completed' ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-blue-500'}`}>
                          <Pill size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-2">
                            {med.name}
                            {status.label === 'Completed' && <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">Finished</span>}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {med.scheduled_times?.map((t: string, i: number) => (
                              <span key={i} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className={`${status.style} px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all`}>
                           {status.icon}
                           {status.label}
                        </div>
                        
                        <div className="flex items-center gap-1">
                        {/* Always show Information Button */}
                        <ViewMedicationModal med={med} />
                        
                        {/* Keep Edit Button (Disabled if completed) */}
                          <EditMedicationModal med={med} disabled={isCompleted || isInactive} />
                        </div>
                      </div>
                    </div>
                  );
               })}
            </div>
          </div>

          {/* Activity Log Sidebar */}
          <div className="w-full lg:w-80 bg-slate-50/30 p-6 sm:p-8">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <History size={14} className="text-blue-500" /> Recent History
            </h4>
            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
              {logs.map((log: any) => (
                <div key={log.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative pl-4">
                  <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${log.status === 'MISSED' ? 'bg-red-400' : 'bg-green-400'}`} />
                  <p className="text-[11px] font-bold text-slate-800 truncate">{log.med_name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={10} className="text-slate-300" />
                        <p className="text-[10px] font-bold uppercase tracking-tight">
                          {new Date(log.logged_at).toLocaleTimeString('en-PH', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                          })} 
                          <span className="mx-1 opacity-30">•</span>
                          {new Date(log.logged_at).toLocaleDateString('en-PH', { 
                            month: 'short', 
                            day: 'numeric', 
                          })}
                        </p>
                      </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${log.status === 'MISSED' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}