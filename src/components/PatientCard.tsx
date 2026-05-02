"use client";
import { useState } from "react";
import { ChevronDown, History, Pill, Clock, CheckCircle2, MoreHorizontal } from "lucide-react";
import AddMedicationForm from "./AddMedicationForm";

export default function PatientCard({ profile, patientId, logs }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-white border transition-all duration-300 rounded-[2rem] overflow-hidden ${isOpen ? 'border-blue-200 shadow-xl' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}>
      {/* Header - Always Visible */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 sm:p-6 flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {profile?.full_name?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{profile?.full_name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{profile?.medications?.length || 0} Medications Active</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full ${isOpen ? 'bg-blue-50' : 'bg-slate-50'}`}>
               <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
               <span className={`text-[10px] font-bold uppercase ${isOpen ? 'text-blue-600' : 'text-slate-400'}`}>
                 {isOpen ? 'Viewing Details' : 'Click to View'}
               </span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="border-t border-slate-50 flex flex-col lg:flex-row animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Main Info */}
          <div className="flex-1 p-6 sm:p-8 lg:border-r border-slate-100">
            <div className="mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Prescribe New Medication</h4>
              <AddMedicationForm patientId={patientId} />
            </div>

            <div className="space-y-4">
               {profile?.medications?.map((med: any) => (
                  <div key={med.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="font-bold text-slate-800">{med.name}</p>
                      <div className="flex gap-2 mt-1">
                        {med.scheduled_times?.map((t: string, i: number) => (
                          <span key={i} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className={med.is_taken ? 'text-green-600 bg-green-50 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold' : 'text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold'}>
                       {med.is_taken ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                       {med.is_taken ? 'Taken' : 'Pending'}
                    </div>
                  </div>
               ))}
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