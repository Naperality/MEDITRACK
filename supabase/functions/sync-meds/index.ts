import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "https://esm.sh/web-push";

// 1. Setup VAPID with your saved secrets from the dashboard
webpush.setVapidDetails(
  'mailto:support@yourdomain.com', 
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS for browser-side triggers
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Get high-accuracy current time in Manila
    const now = new Date();
    const manilaFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    
    const parts = manilaFormatter.formatToParts(now);
    const currentHour = parseInt(parts.find(p => p.type === 'hour')?.value || "0");
    const currentMinute = parseInt(parts.find(p => p.type === 'minute')?.value || "0");
    const todayDateStr = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}`;

    // Helper for backfilling missed doses
    const nowPH = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));

    // 3. Fetch Data
    const { data: meds, error: medsError } = await supabase.from('medications').select('*');
    if (medsError) throw medsError;

    const { data: existingLogs } = await supabase
      .from('medication_logs')
      .select('med_id, scheduled_slot, logged_at');

    const logsToInsert = [];

    for (const med of meds) {
      const startDate = new Date(med.start_date + "T00:00:00+08:00");
      
      for (const slot of med.scheduled_times) {
        const [slotHours, slotMinutes] = slot.split(':').map(Number);
        
        // --- A. NOTIFICATION LOGIC (Real-time) ---
        const isScheduledForNow = currentHour === slotHours && currentMinute === slotMinutes;

        if (isScheduledForNow) {
          // Check if already notified/logged for this slot TODAY
          const alreadyProcessedToday = existingLogs?.some(l => {
            const logDate = new Date(l.logged_at).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
            return l.med_id === med.id && l.scheduled_slot === slot && logDate === todayDateStr;
          });

          if (!alreadyProcessedToday) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('push_subscription')
              .eq('id', med.patient_id)
              .single();

            if (profile?.push_subscription) {
              await webpush.sendNotification(
                JSON.parse(profile.push_subscription), 
                JSON.stringify({
                  title: "Medication Reminder 💊",
                  body: `It's time to take your ${med.name} (${med.dosage})`,
                  url: "/patient-dashboard"
                })
              ).catch(e => console.error(`Push failed for user ${med.patient_id}:`, e));
            }
          }
        }

        // --- B. MISSED LOG LOGIC (Backfilling History) ---
        let checkDate = new Date(startDate);
        while (checkDate <= nowPH) {
          const slotTimePH = new Date(checkDate);
          slotTimePH.setHours(slotHours, slotMinutes, 0, 0);

          const isPast = nowPH > slotTimePH;
          const slotComparisonISO = slotTimePH.toISOString();
          const isWithinRange = slotComparisonISO >= med.start_date && 
                               (med.end_date ? slotComparisonISO <= med.end_date : true);

          if (isPast && isWithinRange) {
            const currentSlotDateString = slotTimePH.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
            const alreadyLogged = existingLogs?.some(l => {
              const logDateString = new Date(l.logged_at).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
              return l.med_id === med.id && l.scheduled_slot === slot && logDateString === currentSlotDateString;
            });

            if (!alreadyLogged) {
              logsToInsert.push({
                med_id: med.id,
                patient_id: med.patient_id,
                med_name: med.name,
                status: 'MISSED',
                logged_at: slotTimePH.toISOString(),
                scheduled_slot: slot
              });
            }
          }
          checkDate.setDate(checkDate.getDate() + 1);
        }
      }
    }

    // 4. Batch insert missed doses
    if (logsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('medication_logs').insert(logsToInsert);
      if (insertError) throw insertError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      timeProcessed: `${currentHour}:${currentMinute}`,
      missedDosesSynced: logsToInsert.length 
    }), {
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