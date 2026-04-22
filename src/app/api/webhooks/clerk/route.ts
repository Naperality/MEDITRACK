import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // FIX: Use await here because headers() is a Promise in Next.js 13+
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', { status: 400 })
  }

  // Initialize Supabase Admin Client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Correct key to bypass RLS
  )

  // Extract data from the Clerk Event
  const { id, email_addresses, first_name, last_name } = evt.data as any;
  const email = email_addresses[0]?.email_address;
  const fullName = `${first_name || ''} ${last_name || ''}`.trim();

  // Handle the events
  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    const { error } = await supabase
    .from('profiles')
    .upsert(
        {
        id: id,            // This matches the Clerk ID
        email: email,
        full_name: fullName,
        // Note: We don't force 'PATIENT' here so we don't 
        // accidentally overwrite an Admin back to a Patient
        },
        { onConflict: 'id' } // <--- CRITICAL: This prevents doubles!
    );
    
    if (error) {
        console.error('Supabase Error:', error);
        return new Response('Database error', { status: 500 });
    }
  }

  if (evt.type === 'user.deleted') {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) console.error('Supabase Delete Error:', error);
  }

  return new Response('Successfully synced', { status: 200 })
}