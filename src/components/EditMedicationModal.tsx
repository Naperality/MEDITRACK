'use client';
import { useState } from 'react';
import { Edit2, X, Save, Trash2, Clock } from 'lucide-react';
import { updateMedication, deleteMedication } from '@/app/actions/management';

export default function EditMedicationModal({ med }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [times, setTimes] = useState<string[]>(med.scheduled_times || []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    times.forEach(t => formData.append('scheduled_times', t));
    
    const res = await updateMedication(med.id, formData);
    if (res.success) setIsOpen(false);
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
      <Edit2 size={16} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-900">Edit {med.name}</h3>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white rounded-full"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Medication Name</label>
              <input name="name" defaultValue={med.name} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Dosage</label>
              <input name="dosage" defaultValue={med.dosage} className="w-full p-3 rounded-xl border border-slate-200 outline-none" required />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Type</label>
              <select name="med_type" defaultValue={med.med_type} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Scheduled Times</label>
            <div className="flex flex-wrap gap-2">
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl border border-blue-100">
                  <Clock size={12} />
                  <input type="time" value={t} onChange={(e) => {
                    const newTimes = [...times];
                    newTimes[i] = e.target.value;
                    setTimes(newTimes);
                  }} className="bg-transparent font-bold text-sm outline-none" />
                  <button type="button" onClick={() => setTimes(times.filter((_, idx) => idx !== i))}><X size={14}/></button>
                </div>
              ))}
              <button type="button" onClick={() => setTimes([...times, "08:00"])} className="px-4 py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all">+ Add</button>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button type="submit" className="flex-1 bg-blue-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-200 transition-all">
              <Save size={18} /> Save Changes
            </button>
            <button 
              type="button" 
              onClick={async () => { if(confirm("Delete this medication?")) await deleteMedication(med.id); }}
              className="bg-rose-50 text-rose-500 p-4 rounded-2xl hover:bg-rose-100 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}