'use client'

import { addMedication } from "@/app/actions/medication";
import { useState } from "react";

export default function AddMedicationForm({ patientId }: { patientId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await addMedication(formData, patientId);
    setLoading(false);
    (document.getElementById('med-form') as HTMLFormElement).reset();
  }

  return (
    <form id="med-form" action={handleSubmit} className="p-6 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
      <h3 className="font-bold text-blue-800">Add New Medication</h3>
      <div className="grid grid-cols-2 gap-4">
        <input name="name" placeholder="Med Name (e.g. Paracetamol)" className="p-2 rounded border" required />
        <input name="dosage" placeholder="Dosage (e.g. 500mg)" className="p-2 rounded border" required />
        <select name="med_type" className="p-2 rounded border">
          <option value="Tablet">Tablet</option>
          <option value="Capsule">Capsule</option>
          <option value="Syrup">Syrup</option>
          <option value="Injection">Injection</option>
        </select>
        <input name="scheduled_time" type="time" className="p-2 rounded border" required />
      </div>
      <button 
        disabled={loading}
        type="submit" 
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? 'Adding...' : 'Add Medication'}
      </button>
    </form>
  );
}