import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "https://esm.sh/web-push";

// 1. Setup VAPID
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
  // Handle CORS
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Get high-accuracy current time in Manila
    const now = new Date();
    
    // We get the "Wall Clock" time for Manila to compare against scheduled slots
    const manilaString = now.toLocaleString("en-US", { 
      timeZone: "Asia/Manila", 
      hour12: false 
    });
    
    // Extract PH components safely
    const phDateOnly = now.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }); // YYYY-MM-DD
    const phTimePart = manilaString.split(', ')[1];
    const [currentHour, currentMinute] = phTimePart.split(':').map(Number);

    // 3. Fetch Data
    const { data: meds, error: medsError } = await supabase.from('medications').select('*').or('is_discontinued.eq.false,is_discontinued.is.null');;
    if (medsError) throw medsError;

    // Get existing logs for the current day to avoid duplicates
    const { data: existingLogs } = await supabase
      .from('medication_logs')
      .select('med_id, scheduled_slot, logged_at');

    const logsToInsert = [];

    for (const med of meds) {
      for (const slot of med.scheduled_times) {
        const [slotHours, slotMinutes] = slot.split(':').map(Number);
        
        // --- A. NOTIFICATION LOGIC (Real-time trigger) ---
        const isScheduledForNow = currentHour === slotHours && currentMinute === slotMinutes;

        if (isScheduledForNow) {
          const alreadyNotifiedToday = existingLogs?.some(l => {
            const logDate = new Date(l.logged_at).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
            return l.med_id === med.id && l.scheduled_slot === slot && logDate === phDateOnly;
          });

          if (!alreadyNotifiedToday) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('push_subscription')
              .eq('id', med.patient_id)
              .single();

            if (profile?.push_subscription) {
              const response = await webpush.sendNotification(
                JSON.parse(profile.push_subscription), 
                JSON.stringify({
                  title: "Medication Reminder 💊",
                  body: `It's time to take your ${med.name} (${med.dosage})`,
                  url: "/patient-dashboard"
                }),
                {
                  // These headers tell the Google/Apple push servers this is URGENT
                  headers: {
                    'Urgency': 'high',
                    'Topic': 'medication-alerts' 
                  },
                  TTL: 60 * 60 // 1 hour
                }
              ).catch(e => console.error(`Push failed for user ${med.patient_id}:`, e));
              // Now you can log the status if the response exists
              if (response) {
                console.log(`Push sent for ${med.name}. Status: ${response.statusCode}`);
              }
            }
          }
        }

        // --- B. MISSED LOG LOGIC (Backfilling History) ---
        // Iterate day-by-day from start_date to today
        let checkDate = new Date(med.start_date);
        const nowPH = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));

        while (checkDate <= nowPH) {
          // Create a date object for this specific slot on 'checkDate'
          const slotTime = new Date(checkDate);
          slotTime.setHours(slotHours, slotMinutes, 0, 0);

          const gracePeriodMs = 30 * 60 * 1000; // 1 hours
          const isPastGrace = nowPH.getTime() > (slotTime.getTime() + gracePeriodMs);
          
          const currentSlotDateStr = slotTime.toLocaleDateString("en-CA");
          const isWithinRange = currentSlotDateStr >= med.start_date && 
                               (med.end_date ? currentSlotDateStr <= med.end_date : true);

          if (isPastGrace && isWithinRange) {
            const alreadyLogged = existingLogs?.some(l => {
              const logDateString = new Date(l.logged_at).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
              return l.med_id === med.id && l.scheduled_slot === slot && logDateString === currentSlotDateStr;
            });

            if (!alreadyLogged) {
              // Construct the ISO string with the PH offset (+08:00)
              // We use sv-SE to get YYYY-MM-DD easily
              const datePart = slotTime.toLocaleDateString("en-CA");
              const timePart = `${String(slotHours).padStart(2, '0')}:${String(slotMinutes).padStart(2, '0')}:00`;
              const manilaISO = `${datePart}T${timePart}+08:00`;

              logsToInsert.push({
                med_id: med.id,
                patient_id: med.patient_id,
                med_name: med.name,
                status: 'MISSED',
                logged_at: manilaISO, 
                scheduled_slot: slot
              });
            }
          }
          // Move to next day
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
      timeProcessedPH: `${currentHour}:${currentMinute}`,
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