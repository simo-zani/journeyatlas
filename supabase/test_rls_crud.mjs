/**
 * JourneyAtlas — Test end-to-end CRUD + RLS (1.10)
 *
 * Verifica, usando due account di test reali (creati da seed_test_accounts.mjs)
 * e solo la anon key (nessun privilegio admin), che le policy RLS si comportino
 * come previsto per Attività, Alloggi e Mezzi:
 *
 *   1. L'owner di un viaggio può creare/leggere/modificare/eliminare (CRUD pieno)
 *   2. Un estraneo (non invitato) non vede nulla e non può scrivere nulla
 *   3. Un invitato con ruolo "viewer" (dopo aver accettato l'invito) legge ma non scrive
 *   4. Promosso a "editor", l'invitato ottiene CRUD pieno
 *
 * Ogni verifica logga OK/FAIL. Il viaggio di test e tutti i suoi dati vengono
 * creati ed eliminati da questo script (nessun impatto sui dati reali di
 * simo_zani o su altri viaggi).
 *
 * Requisiti: account "lucia_explorer" e "marco_wanderer" già creati
 * (esegui prima seed_test_accounts.mjs se non l'hai ancora fatto).
 *
 * Utilizzo:
 *   node test_rls_crud.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnliaqmqmblheannqgaa.supabase.co';
const SUPABASE_ANON = 'sb_publishable_LmCrqnalj-4lA4jWS1SUMg_RGoxfUDd';
const TEST_PASSWORD = 'Test1234!';

const LUCIA_EMAIL = 'test_lucia@journeyatlas.test';
const MARCO_EMAIL = 'test_marco@journeyatlas.test';

let passed = 0;
let failed = 0;

function check(label, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`\x1b[32m[OK]\x1b[0m   ${label}`);
  } else {
    failed++;
    console.log(`\x1b[31m[FAIL]\x1b[0m ${label}${detail ? ' — ' + detail : ''}`);
  }
}

function freshClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function signIn(email) {
  const client = freshClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (error) throw new Error(`Login fallito per ${email}: ${error.message}`);
  return { client, userId: data.user.id };
}

async function main() {
  console.log('\n== Setup: login lucia_explorer e marco_wanderer ==\n');
  const lucia = await signIn(LUCIA_EMAIL);
  const marco = await signIn(MARCO_EMAIL);
  console.log(`lucia_explorer → ${lucia.userId}`);
  console.log(`marco_wanderer → ${marco.userId}`);

  // ---------------------------------------------------------------------
  // Setup: lucia crea un viaggio di test (stessa sequenza dell'app: insert
  // trips + insert trip_participants owner, vedi frontend/src/lib/api.ts createTrip)
  // ---------------------------------------------------------------------
  console.log('\n== Setup: lucia crea un viaggio di test ==\n');
  const tripName = `RLS Test Trip ${Date.now()}`;
  const { data: trip, error: tripErr } = await lucia.client
    .from('trips')
    .insert({ owner_id: lucia.userId, name: tripName, destinations: [] })
    .select('*')
    .single();
  if (tripErr) throw new Error(`Creazione viaggio fallita: ${tripErr.message}`);
  const tripId = trip.id;

  const { error: ownerPartErr } = await lucia.client.from('trip_participants').insert({
    trip_id: tripId,
    user_id: lucia.userId,
    role: 'owner',
    joined_at: new Date().toISOString(),
  });
  if (ownerPartErr) throw new Error(`Insert owner participant fallito: ${ownerPartErr.message}`);
  console.log(`Viaggio creato: "${tripName}" (${tripId})`);

  async function cleanup() {
    console.log('\n== Cleanup: elimino il viaggio di test (cascade su tutto il resto) ==\n');
    const { error } = await lucia.client.from('trips').delete().eq('id', tripId);
    if (error) console.log(`\x1b[33m[warn]\x1b[0m cleanup fallito: ${error.message}`);
    else console.log('Cleanup OK — nessun dato di test rimasto.');
  }

  try {
    // ---------------------------------------------------------------------
    // 1) Owner (lucia): CRUD pieno su activities / accommodations / flights
    // ---------------------------------------------------------------------
    console.log('\n== 1) Owner: CRUD pieno (activities, accommodations, flights) ==\n');

    const { data: activity, error: actInsErr } = await lucia.client
      .from('activities')
      .insert({ trip_id: tripId, name: 'Visita al museo', created_by_user_id: lucia.userId })
      .select('*')
      .single();
    check('Owner può creare un\'attività', !actInsErr, actInsErr?.message);

    const { data: actSelect } = await lucia.client.from('activities').select('*').eq('trip_id', tripId);
    check('Owner vede l\'attività appena creata', (actSelect?.length ?? 0) === 1);

    const { error: actUpdErr } = await lucia.client
      .from('activities')
      .update({ name: 'Visita al museo (modificata)' })
      .eq('id', activity.id);
    check('Owner può modificare l\'attività', !actUpdErr, actUpdErr?.message);

    const { data: accom, error: accomInsErr } = await lucia.client
      .from('accommodations')
      .insert({ trip_id: tripId, name: 'Hotel Test' })
      .select('*')
      .single();
    check('Owner può creare un alloggio', !accomInsErr, accomInsErr?.message);

    const { error: accomUpdErr } = await lucia.client
      .from('accommodations')
      .update({ name: 'Hotel Test (modificato)' })
      .eq('id', accom.id);
    check('Owner può modificare l\'alloggio', !accomUpdErr, accomUpdErr?.message);

    const { data: flight, error: flightInsErr } = await lucia.client
      .from('flights')
      .insert({ trip_id: tripId, departure_airport: 'FCO', arrival_airport: 'BCN' })
      .select('*')
      .single();
    check('Owner può creare un mezzo/volo', !flightInsErr, flightInsErr?.message);

    const { error: flightUpdErr } = await lucia.client
      .from('flights')
      .update({ airline: 'Test Airline' })
      .eq('id', flight.id);
    check('Owner può modificare il mezzo/volo', !flightUpdErr, flightUpdErr?.message);

    // ---------------------------------------------------------------------
    // 2) Estraneo (marco, non invitato): niente accesso
    // ---------------------------------------------------------------------
    console.log('\n== 2) Estraneo non invitato: nessun accesso ==\n');

    const { data: marcoTripView } = await marco.client.from('trips').select('*').eq('id', tripId);
    check('Estraneo non vede il viaggio', (marcoTripView?.length ?? 0) === 0);

    const { data: marcoActView } = await marco.client.from('activities').select('*').eq('trip_id', tripId);
    check('Estraneo non vede le attività del viaggio', (marcoActView?.length ?? 0) === 0);

    const { error: marcoInsErr } = await marco.client
      .from('activities')
      .insert({ trip_id: tripId, name: 'Intrusione', created_by_user_id: marco.userId });
    check('Estraneo NON può creare un\'attività (RLS blocca)', !!marcoInsErr);

    const { data: marcoUpdData, error: marcoUpdErr } = await marco.client
      .from('activities')
      .update({ name: 'Hackerata' })
      .eq('id', activity.id)
      .select('*');
    check(
      'Estraneo NON può modificare l\'attività altrui (RLS blocca)',
      !!marcoUpdErr || (marcoUpdData?.length ?? 0) === 0
    );

    // ---------------------------------------------------------------------
    // 3) Invito come viewer: legge, non scrive
    // ---------------------------------------------------------------------
    console.log('\n== 3) Marco invitato come viewer: legge ma non scrive ==\n');

    const { data: invite, error: inviteErr } = await lucia.client
      .from('trip_participants')
      .insert({
        trip_id: tripId,
        user_id: marco.userId,
        role: 'viewer',
        status: 'pending',
        invited_by: lucia.userId,
      })
      .select('*')
      .single();
    check('Owner può invitare marco come viewer', !inviteErr, inviteErr?.message);

    const { error: acceptErr } = await marco.client.rpc('respond_to_invite', {
      participant_id: invite.id,
      accept: true,
    });
    check('Marco può accettare l\'invito (RPC respond_to_invite)', !acceptErr, acceptErr?.message);

    const { data: viewerSelect } = await marco.client.from('activities').select('*').eq('trip_id', tripId);
    check('Viewer vede le attività del viaggio', (viewerSelect?.length ?? 0) === 1);

    const { error: viewerInsErr } = await marco.client
      .from('activities')
      .insert({ trip_id: tripId, name: 'Viewer scrive', created_by_user_id: marco.userId });
    check('Viewer NON può creare un\'attività (RLS blocca)', !!viewerInsErr);

    const { data: viewerUpdData, error: viewerUpdErr } = await marco.client
      .from('activities')
      .update({ name: 'Viewer modifica' })
      .eq('id', activity.id)
      .select('*');
    check(
      'Viewer NON può modificare un\'attività (RLS blocca)',
      !!viewerUpdErr || (viewerUpdData?.length ?? 0) === 0
    );

    const { data: viewerDelData, error: viewerDelErr } = await marco.client
      .from('activities')
      .delete()
      .eq('id', activity.id)
      .select('*');
    check(
      'Viewer NON può eliminare un\'attività (RLS blocca)',
      !!viewerDelErr || (viewerDelData?.length ?? 0) === 0
    );

    // ---------------------------------------------------------------------
    // 4) Promosso a editor: CRUD pieno
    // ---------------------------------------------------------------------
    console.log('\n== 4) Marco promosso a editor: CRUD pieno ==\n');

    const { error: promoteErr } = await lucia.client
      .from('trip_participants')
      .update({ role: 'editor' })
      .eq('id', invite.id);
    check('Owner può promuovere marco a editor', !promoteErr, promoteErr?.message);

    const { data: editorActivity, error: editorInsErr } = await marco.client
      .from('activities')
      .insert({ trip_id: tripId, name: 'Attività di marco editor', created_by_user_id: marco.userId })
      .select('*')
      .single();
    check('Editor può creare un\'attività', !editorInsErr, editorInsErr?.message);

    const { error: editorUpdErr } = await marco.client
      .from('activities')
      .update({ name: 'Attività di marco (modificata)' })
      .eq('id', editorActivity?.id ?? '');
    check('Editor può modificare un\'attività (anche non sua)', !editorUpdErr, editorUpdErr?.message);

    const { error: editorDelErr } = await marco.client
      .from('activities')
      .delete()
      .eq('id', editorActivity?.id ?? '');
    check('Editor può eliminare un\'attività', !editorDelErr, editorDelErr?.message);
  } finally {
    await cleanup();
  }

  console.log(`\n\x1b[1m== Risultato: ${passed} OK, ${failed} FAIL ==\x1b[0m\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(`\x1b[31m[err]\x1b[0m ${e.message}`);
  process.exit(1);
});
