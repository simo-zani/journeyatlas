/**
 * JourneyAtlas — Seed script: 10 account di test
 *
 * Crea:
 *   - 10 utenti test (test1…test10) in Supabase Auth + profili
 *   - 8 amicizie accettate con simo_zani
 *   - 1 richiesta di amicizia RICEVUTA da simo_zani (test9 → simo_zani, pending)
 *   - test10 libero, nessuna relazione
 *   - 2 viaggi per ogni utente test (1 pubblico, 1 privato)
 *
 * Requisiti:
 *   node >= 18
 *   npm install @supabase/supabase-js
 *
 * Utilizzo:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node seed_test_accounts.mjs
 *
 *   oppure impostando la variabile nel file .env.seed accanto allo script.
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output, env } from 'node:process';

// ── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL  = 'https://rnliaqmqmblheannqgaa.supabase.co';
// La anon key serve solo per leggere il profilo di simo_zani;
// la service role key serve per creare utenti auth e scrivere come admin.
const SUPABASE_ANON = 'sb_publishable_LmCrqnalj-4lA4jWS1SUMg_RGoxfUDd';

const TEST_PASSWORD = 'Test1234!'; // password comune a tutti gli account di test

const FAKE_USERS = [
  { username: 'lucia_explorer',  email: 'test_lucia@journeyatlas.test'  },
  { username: 'marco_wanderer',  email: 'test_marco@journeyatlas.test'  },
  { username: 'sara_traveler',   email: 'test_sara@journeyatlas.test'   },
  { username: 'alex_nomad',      email: 'test_alex@journeyatlas.test'   },
  { username: 'giulia_voyage',   email: 'test_giulia@journeyatlas.test' },
  { username: 'luca_pathfinder', email: 'test_luca@journeyatlas.test'   },
  { username: 'chiara_roamer',   email: 'test_chiara@journeyatlas.test' },
  { username: 'matteo_globetr',  email: 'test_matteo@journeyatlas.test' },
  { username: 'elena_ventura',   email: 'test_elena@journeyatlas.test'  },
  { username: 'riccardo_free',   email: 'test_riccardo@journeyatlas.test'},
];

// Viaggi: (nome, start, end, is_public)
const TRIPS_TEMPLATE = [
  ['Estate in Sardegna',        '2025-07-10', '2025-07-24', true ],
  ['Weekend a Barcellona',      '2025-04-18', '2025-04-21', false],
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function log(msg)  { console.log(`\x1b[36m[seed]\x1b[0m ${msg}`); }
function ok(msg)   { console.log(`\x1b[32m[ok]\x1b[0m   ${msg}`); }
function warn(msg) { console.log(`\x1b[33m[warn]\x1b[0m ${msg}`); }
function err(msg)  { console.error(`\x1b[31m[err]\x1b[0m  ${msg}`); }

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1) Ottieni la service role key
  let serviceKey = env.SUPABASE_SERVICE_KEY || '';
  if (!serviceKey) {
    const rl = readline.createInterface({ input, output });
    serviceKey = (await rl.question(
      '\nIncolla la Service Role Key (Settings > API > service_role secret):\n> '
    )).trim();
    rl.close();
  }
  if (!serviceKey) {
    err('Service Role Key mancante — uscita.');
    process.exit(1);
  }

  // Client admin (bypassa RLS)
  const admin = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 2) Trova l'ID di simo_zani
  log('Cerco simo_zani in profiles…');
  const { data: simoRows, error: simoErr } = await admin
    .from('profiles')
    .select('id, username')
    .eq('username', 'simo_zani')
    .limit(1);

  if (simoErr || !simoRows?.length) {
    err(`Utente simo_zani non trovato: ${simoErr?.message ?? 'nessun risultato'}`);
    process.exit(1);
  }
  const simoId = simoRows[0].id;
  ok(`simo_zani trovato → ${simoId}`);

  // 3) Crea gli utenti test
  const createdUsers = [];

  for (let i = 0; i < FAKE_USERS.length; i++) {
    const { username, email } = FAKE_USERS[i];
    log(`Creo utente ${i + 1}/10: ${username} <${email}>`);

    // Controlla se esiste già
    const { data: existing } = await admin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .limit(1);

    if (existing?.length) {
      warn(`${username} esiste già → skip creazione auth`);
      createdUsers.push({ id: existing[0].id, username, index: i });
      continue;
    }

    // Crea utente tramite Admin Auth API
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,      // salta la verifica email
      user_metadata: { username },
    });

    if (authErr) {
      err(`Errore creazione ${username}: ${authErr.message}`);
      continue;
    }

    const userId = authData.user.id;

    // Aggiorna il profilo con username (il trigger on_auth_user_created crea già il record)
    await sleep(300); // piccola pausa per il trigger
    const { error: profileErr } = await admin
      .from('profiles')
      .update({ username, display_name: username.replace(/_/g, ' ') })
      .eq('id', userId);

    if (profileErr) {
      warn(`Profilo non aggiornato per ${username}: ${profileErr.message}`);
    }

    ok(`${username} creato → ${userId}`);
    createdUsers.push({ id: userId, username, index: i });

    await sleep(200);
  }

  // 4) Crea i viaggi per ogni utente test
  log('\nCreo viaggi…');
  for (const user of createdUsers) {
    for (const [name, start, end, isPublic] of TRIPS_TEMPLATE) {
      const tripName = `${name} — ${user.username.split('_')[0]}`;
      const { error: tripErr } = await admin
        .from('trips')
        .insert({
          owner_id: user.id,
          name: tripName,
          start_date: start,
          end_date: end,
          is_public: isPublic,
          destinations: [],
        });
      if (tripErr) {
        warn(`Viaggio "${tripName}" non creato: ${tripErr.message}`);
      } else {
        ok(`Viaggio "${tripName}" (${isPublic ? 'pubblico' : 'privato'}) → ${user.username}`);
      }
    }
  }

  // 5) Amicizie
  log('\nCreo amicizie / richieste…');

  // 5a) test1…test8 → amici accettati con simo_zani
  for (let i = 0; i < 8; i++) {
    const user = createdUsers[i];
    if (!user) continue;

    // Verifica se esiste già la friendship
    const { data: existing } = await admin
      .from('friendships')
      .select('id')
      .or(`and(requester_id.eq.${simoId},addressee_id.eq.${user.id}),and(requester_id.eq.${user.id},addressee_id.eq.${simoId})`)
      .limit(1);

    if (existing?.length) {
      warn(`Amicizia già esistente tra simo_zani e ${user.username} → skip`);
      continue;
    }

    // Inserisci come accettata (simo_zani come requester per semplicità)
    const { error: fErr } = await admin
      .from('friendships')
      .insert({
        requester_id: simoId,
        addressee_id: user.id,
        status: 'accepted',
        responded_at: new Date().toISOString(),
      });

    if (fErr) {
      err(`Amicizia simo_zani ↔ ${user.username} fallita: ${fErr.message}`);
    } else {
      ok(`Amici: simo_zani ↔ ${user.username}`);
    }
  }

  // 5b) test9 (index 8) → richiesta INVIATA a simo_zani (pending)
  const test9 = createdUsers[8];
  if (test9) {
    const { data: existingReq } = await admin
      .from('friendships')
      .select('id')
      .or(`and(requester_id.eq.${test9.id},addressee_id.eq.${simoId}),and(requester_id.eq.${simoId},addressee_id.eq.${test9.id})`)
      .limit(1);

    if (existingReq?.length) {
      warn(`Richiesta già esistente tra ${test9.username} e simo_zani → skip`);
    } else {
      const { error: reqErr } = await admin
        .from('friendships')
        .insert({
          requester_id: test9.id,
          addressee_id: simoId,
          status: 'pending',
        });

      if (reqErr) {
        err(`Richiesta ${test9.username} → simo_zani fallita: ${reqErr.message}`);
      } else {
        ok(`Richiesta pending: ${test9.username} → simo_zani`);
      }
    }
  }

  // 5c) test10 (index 9) → nessuna relazione, già verificato sopra

  console.log('\n\x1b[32m✓ Seed completato!\x1b[0m');
  console.log(`\nCredenziali utenti di test:`);
  console.log(`  Password comune: ${TEST_PASSWORD}`);
  console.log(`  Email: test_<username>@journeyatlas.test\n`);
}

main().catch((e) => {
  err(e.message);
  process.exit(1);
});
