-- ============================================================================
-- JourneyAtlas - Migration 0027: Seed elementi checklist
--
-- Inserisce elementi checklist realistici per tutti i viaggi esistenti nel DB.
-- Usa NOT EXISTS per evitare duplicati se eseguita più volte.
-- ============================================================================

INSERT INTO public.checklist_items (trip_id, created_by_user_id, name, category, quantity, notes)
SELECT
  t.id AS trip_id,
  t.owner_id AS created_by_user_id,
  s.name,
  s.category,
  s.quantity,
  s.notes
FROM public.trips t
CROSS JOIN (
  VALUES
    -- Documenti
    ('Passaporto',                    'documenti', 1, 'Verifica scadenza: almeno 6 mesi residui'),
    ('Carta d''identità',             'documenti', 1, NULL),
    ('Biglietti volo / treno',        'documenti', 1, 'Stampa o salva PDF offline'),
    ('Assicurazione viaggio',         'documenti', 1, 'Copia digitale e cartacea'),
    ('Prenotazioni alloggi',          'documenti', 1, NULL),
    ('Patente di guida',              'documenti', 1, NULL),
    ('Tessera sanitaria',             'documenti', 1, NULL),
    ('Visto d''ingresso',             'documenti', 1, 'Verifica validità e requisiti'),

    -- Abbigliamento
    ('T-shirt / magliette',           'abbigliamento', 5, NULL),
    ('Pantaloni lunghi',              'abbigliamento', 2, NULL),
    ('Shorts / bermuda',              'abbigliamento', 3, NULL),
    ('Felpa / maglione',              'abbigliamento', 1, 'Utile per aereo o serate fresche'),
    ('Giacca a vento / k-way',        'abbigliamento', 1, NULL),
    ('Costume da bagno',              'abbigliamento', 2, NULL),
    ('Biancheria intima',             'abbigliamento', 6, NULL),
    ('Calzini',                       'abbigliamento', 6, NULL),
    ('Scarpe comode per camminare',   'abbigliamento', 1, NULL),
    ('Sandali / ciabatte',            'abbigliamento', 1, NULL),
    ('Cappello per il sole',          'abbigliamento', 1, NULL),
    ('Occhiali da sole',              'abbigliamento', 1, NULL),

    -- Toilette
    ('Shampoo e bagnoschiuma',        'toilette', 1, 'Flaconi max 100ml per bagaglio a mano'),
    ('Dentifricio e spazzolino',      'toilette', 1, NULL),
    ('Deodorante',                    'toilette', 1, NULL),
    ('Crema solare SPF alta',         'toilette', 1, NULL),
    ('Doposole / crema idratante',    'toilette', 1, NULL),
    ('Repellente insetti',            'toilette', 1, NULL),
    ('Spazzola / pettine',            'toilette', 1, NULL),
    ('Rasoio e schiuma da barba',     'toilette', 1, NULL),
    ('Salviette umidificate',         'toilette', 1, NULL),
    ('Fazzoletti di carta',           'toilette', 3, NULL),
    ('Asciugamano in microfibra',     'toilette', 1, 'Compatto e ad asciugatura rapida'),

    -- Elettronica
    ('Smartphone',                    'elettronica', 1, NULL),
    ('Caricabatterie smartphone',     'elettronica', 1, NULL),
    ('Power bank',                    'elettronica', 1, 'Portare sempre nel bagaglio a mano'),
    ('Adattatore prese universale',   'elettronica', 1, 'Verificare tipo prese paese destinazione'),
    ('Cuffie / auricolari',           'elettronica', 1, NULL),
    ('Cavo USB aggiuntivo',           'elettronica', 1, NULL),
    ('Fotocamera / action cam',       'elettronica', 1, NULL),
    ('E-reader o libro',              'elettronica', 1, NULL),

    -- Salute
    ('Farmaci personali salva-vita',  'salute', 1, 'Con prescrizione medica nel bagaglio a mano'),
    ('Paracetamolo / ibuprofene',     'salute', 1, 'Antidolorifico / antinfiammatorio'),
    ('Antidiarroico e fermenti',      'salute', 1, NULL),
    ('Antistaminico',                 'salute', 1, NULL),
    ('Cerotti e disinfettante',       'salute', 1, 'Kit primo soccorso tascabile'),
    ('Termometro',                    'salute', 1, NULL),
    ('Stick labbra con protezione',   'salute', 1, NULL),

    -- Altro
    ('Lucchetto TSA per valigia',     'altro', 1, NULL),
    ('Borraccia termica riutilizzabile', 'altro', 1, 'Vuota ai controlli di sicurezza'),
    ('Zainetto pieghevole da giorno', 'altro', 1, NULL),
    ('Sacchetti ermetici (tipo Ziploc)','altro', 4, 'Per liquidi e indumenti umidi'),
    ('Cuscino da viaggio e mascherina','altro', 1, 'Per il riposo durante i trasferimenti'),
    ('Tappi per le orecchie',         'altro', 2, NULL),
    ('Ombrello pieghevole compatto',  'altro', 1, NULL),
    ('Penna',                         'altro', 1, 'Utile per moduli doganali in volo')
) AS s(name, category, quantity, notes)
WHERE NOT EXISTS (
  SELECT 1 FROM public.checklist_items ci
  WHERE ci.trip_id = t.id AND ci.name = s.name
);

-- ============================================================================
-- Verifica elementi inseriti:
--   SELECT t.name AS viaggio, ci.category, ci.name, ci.quantity
--   FROM public.checklist_items ci
--   JOIN public.trips t ON t.id = ci.trip_id
--   ORDER BY t.name, ci.category, ci.name;
-- ============================================================================
