import { serve } from "std/http/server"
import { createClient } from "@supabase/supabase-js"
import webpush from "web-push"

// 1. Setup VAPID with your active administrative support account
webpush.setVapidDetails(
  'mailto:medinow2@gmail.com', 
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight options request smoothly
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    // 2. High-accuracy Manila Clock calculations
    const now = new Date();
    const manilaString = now.toLocaleString("en-US", { 
      timeZone: "Asia/Manila", 
      hour12: false 
    });
    
    const phDateOnly = now.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }); // Outputs: YYYY-MM-DD
    const phTimePart = manilaString.split(', ')[1];
    const [currentHour, currentMinute] = phTimePart.split(':').map(Number);
    const currentMinutesSinceMidnight = (currentHour * 60) + currentMinute;

    // 3. Optimized Database Fetching
    // Only pull down medications that are actively valid on today's date
    const { data: meds, error: medsError } = await supabase
      .from('medications')
      .select('*')
      .or('is_discontinued.eq.false,is_discontinued.is.null')
      .gte('end_date', phDateOnly)
      .lte('start_date', phDateOnly);
      
    if (medsError) throw medsError;

    // Only pull down logs created TODAY within the Asia/Manila boundary context
    const { data: existingLogs } = await supabase
      .from('medication_logs')
      .select('med_id, scheduled_slot, logged_at')
      .gte('logged_at', `${phDateOnly}T00:00:00+08:00`);

    // Flatten existing logs into a high-performance Hash Set for fast validation lookups
    const loggedCache = new Set(
      existingLogs?.map(l => `${l.med_id}_${l.scheduled_slot}`) || []
    );

    const logsToInsert = [];

    // 4. Process Medications and Alarm Schedules
    for (const med of meds) {
      for (const slot of med.scheduled_times) {
        const [slotHours, slotMinutes] = slot.split(':').map(Number);
        const slotMinutesSinceMidnight = (slotHours * 60) + slotMinutes;
        
        const cacheKey = `${med.id}_${slot}`;
        const alreadyHandledToday = loggedCache.has(cacheKey);

        // --- A. REAL-TIME NOTIFICATION TRIGGER ---
        const isScheduledForNow = currentHour === slotHours && currentMinute === slotMinutes;

        if (isScheduledForNow && !alreadyHandledToday) {
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
              }),
              {
                headers: { 
                  'Urgency': 'high', 
                  'Topic': 'medication-alerts' 
                },
                TTL: 60 * 60 // Keeps notification retry active on server for 1 hour maximum
              }
            ).catch(e => console.error(`Push transmission failed for user ${med.patient_id}:`, e));
          }
        }

        // --- B. LIGHTWEIGHT TODAY-ONLY MISSED LOG LOGIC ---
        // If the current slot time has passed by more than 30 minutes and remains unlogged
        const gracePeriodMinutes = 30;
        const isPastGrace = currentMinutesSinceMidnight > (slotMinutesSinceMidnight + gracePeriodMinutes);

        if (isPastGrace && !alreadyHandledToday) {
          const timePart = `${String(slotHours).padStart(2, '0')}:${String(slotMinutes).padStart(2, '0')}:00`;
          
          logsToInsert.push({
            med_id: med.id,
            patient_id: med.patient_id,
            med_name: med.name,
            status: 'MISSED',
            logged_at: `${phDateOnly}T${timePart}+08:00`, // Explicit Manila ISO timestamp insertion
            scheduled_slot: slot
          });
        }
      }
    }

    // 5. Batch insert missed slots if any exist
    if (logsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('medication_logs').insert(logsToInsert);
      if (insertError) throw insertError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      timeProcessedPH: `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`,
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