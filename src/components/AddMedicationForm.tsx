'use client'

import { addMedication } from "@/app/actions/medication";
import { useState, useRef } from "react";

export default function AddMedicationForm({ patientId }: { patientId: string }) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await addMedication(formData, patientId);
    setLoading(false);
    formRef.current?.reset(); // Safely reset this specific form
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-sm text-blue-800 uppercase tracking-tight">Add New Medication for Patient</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input name="name" placeholder="Med Name" className="p-2 rounded border text-sm" required />
        <input name="dosage" placeholder="Dosage" className="p-2 rounded border text-sm" required />
        <select name="med_type" className="p-2 rounded border text-sm">
          <option value="Tablet">Tablet</option>
          <option value="Capsule">Capsule</option>
          <option value="Syrup">Syrup</option>
          <option value="Injection">Injection</option>
        </select>
        <input name="scheduled_time" type="time" className="p-2 rounded border text-sm" required />
      </div>
      <button 
        disabled={loading}
        type="submit" 
        className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? 'Adding...' : 'Add Medication'}
      </button>
    </form>
  );
}