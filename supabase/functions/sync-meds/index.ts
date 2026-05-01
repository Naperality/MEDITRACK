import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase with Service Role Key (to bypass RLS for background sync)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get current PH Time
    const nowPH = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));

    // 2. Get all active medications
    const { data: meds, error: medsError } = await supabase
      .from('medications')
      .select('*');

    if (medsError) throw medsError;

    // 3. Get all existing logs to avoid duplicates
    const { data: existingLogs } = await supabase
      .from('medication_logs')
      .select('med_id, scheduled_slot, logged_at');

    const logsToInsert = [];

    for (const med of meds) {
      const startDate = new Date(med.start_date + "T00:00:00+08:00");
      
      for (const slot of med.scheduled_times) {
        const [hours, minutes] = slot.split(':').map(Number);
        let checkDate = new Date(startDate);

        while (checkDate <= nowPH) {
          const slotTimePH = new Date(checkDate);
          slotTimePH.setHours(hours, minutes, 0, 0);

          const isPast = nowPH > slotTimePH;
          const slotComparisonISO = slotTimePH.toISOString();
          const isWithinRange = slotComparisonISO >= med.start_date && 
                               (med.end_date ? slotComparisonISO <= med.end_date : true);

          if (isPast && isWithinRange) {
            const currentSlotDateString = slotTimePH.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

            const alreadyLogged = existingLogs?.some(l => {
              const logDateString = new Date(l.logged_at).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
              return (
                l.med_id === med.id &&
                l.scheduled_slot === slot &&
                logDateString === currentSlotDateString
              );
            });

            if (!alreadyLogged) {
              const year = slotTimePH.getFullYear();
              const month = String(slotTimePH.getMonth() + 1).padStart(2, '0');
              const day = String(slotTimePH.getDate()).padStart(2, '0');
              const hh = String(slotTimePH.getHours()).padStart(2, '0');
              const mm = String(slotTimePH.getMinutes()).padStart(2, '0');

              logsToInsert.push({
                med_id: med.id,
                patient_id: med.patient_id,
                med_name: med.name,
                status: 'MISSED',
                logged_at: `${year}-${month}-${day}T${hh}:${mm}:00+08:00`,
                scheduled_slot: slot
              });
            }
          }
          checkDate.setDate(checkDate.getDate() + 1);
        }
      }
    }

    if (logsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('medication_logs').insert(logsToInsert);
      if (insertError) throw insertError;
    }

    return new Response(JSON.stringify({ message: `Synced ${logsToInsert.length} missed doses.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})