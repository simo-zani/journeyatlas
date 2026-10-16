import {
  addDays,
  carnivalRanges,
  chuseokRanges,
  diwaliRanges,
  holyWeekRanges,
  holiRanges,
  lunarNewYearRanges,
  nyepiRanges,
  oktoberfestRanges,
  ramadanRanges,
  yearly,
  yomKippurRanges,
} from '@/lib/calendars';

/**
 * Usanze per paese, per la scheda "Usanze" di Info Paese: orari dei pasti, mance, weekend,
 * periodi di festa che cambiano il viaggio, divieti di legge, gesti, galateo e abitudini locali.
 *
 * Dati curati a mano (ottobre 2026), pensati per un viaggiatore italiano: si scrive solo ciò che
 * è diverso da casa. Le leggi cambiano: la scheda rimanda sempre a Viaggiare Sicuri.
 * Le festività nazionali del singolo anno arrivano invece da Nager.Date (vedi fetchPublicHolidays).
 */

export interface LocalText {
  it: string;
  en: string;
}

export interface CustomsPeriod {
  name: LocalText;
  /** Cos'è la festa. */
  about?: LocalText;
  /** Quando cade, in parole (le date esatte cambiano ogni anno). */
  when: LocalText;
  /** Cosa cambia per chi viaggia. */
  note: LocalText;
  /** Intervalli YYYY-MM-DD (inclusi) che iniziano in un dato anno, per segnalare se cade durante il viaggio.
   *  Calcolati (vedi calendars.ts): le feste lunari possono slittare di un giorno. */
  dates?: (year: number) => [string, string][];
}

export interface CountryCustoms {
  /** Orari tipici (ora locale). */
  meals?: { breakfast: string; lunch: string; dinner: string; note?: LocalText };
  /** Solo se il weekend non è sabato-domenica. */
  weekend?: LocalText;
  tipping?: LocalText;
  /** Vietato per legge: multe, sequestri o peggio. */
  law?: LocalText[];
  /** Gesti che cambiano significato. */
  gestures?: LocalText[];
  /** Da evitare: galateo, cose viste male. */
  avoid?: LocalText[];
  /** Normale lì, strano per noi. */
  local?: LocalText[];
  periods?: CustomsPeriod[];
}

const tx = (it: string, en: string): LocalText => ({ it, en });

// ---------------------------------------------------------------------------
// Voci comuni a più paesi
// ---------------------------------------------------------------------------

const LEFT_HAND = tx(
  'Mangia, porgi e ricevi con la mano destra: la sinistra è considerata impura.',
  'Eat, give and receive with your right hand: the left is considered unclean.'
);
const DRUGS = tx(
  'Pene durissime per la droga, anche per piccole quantità: carcere lungo e in alcuni casi pena di morte.',
  'Extremely harsh drug penalties, even for small amounts: long prison terms and in some cases the death penalty.'
);
const SHOES_HOME = tx(
  'Le scarpe si tolgono entrando in casa (spesso ti danno le ciabatte).',
  'Shoes come off when entering a home (you are often given slippers).'
);
const ODD_FLOWERS = tx(
  'I fiori si regalano in numero dispari: quelli pari si portano ai funerali.',
  'Give flowers in odd numbers: even numbers are for funerals.'
);
const TEMPLE_DRESS = tx(
  'Nei templi spalle e ginocchia coperte e scarpe tolte all\'ingresso.',
  'In temples cover shoulders and knees and take your shoes off at the entrance.'
);
const MOSQUE_DRESS = tx(
  'Nelle moschee spalle e gambe coperte, scarpe tolte; alle donne viene chiesto di coprire i capelli.',
  'In mosques cover shoulders and legs and take your shoes off; women are asked to cover their hair.'
);
const MODEST_DRESS = tx(
  'Fuori da spiagge e resort vestiti coprenti, soprattutto per le donne: spalle e ginocchia coperte.',
  'Away from beaches and resorts dress modestly, especially women: shoulders and knees covered.'
);
const PDA = tx(
  'Niente effusioni in pubblico: anche un bacio può creare problemi.',
  'No public displays of affection: even a kiss can cause trouble.'
);
const HEAD_FEET = tx(
  'Non toccare la testa di nessuno (nemmeno dei bambini) e non puntare i piedi verso persone o statue sacre.',
  "Don't touch anyone's head (not even children's) and don't point your feet at people or sacred statues."
);
const POINT_THUMB = tx(
  'Non indicare con l\'indice, che è scortese: si usa il pollice con la mano chiusa.',
  "Don't point with your index finger, it's rude: use your thumb with your hand closed."
);
const BARGAIN = tx(
  'Nei mercati si contratta: il primo prezzo è solo l\'inizio.',
  'In markets you bargain: the first price is just the opening.'
);
const NO_TIP = tx(
  'Non si lascia la mancia: può perfino mettere in imbarazzo.',
  "Tipping isn't done: it can even cause embarrassment."
);
const NAZI_SYMBOLS = tx(
  'Simboli e saluti nazisti sono reato, anche per scherzo o in foto.',
  'Nazi symbols and salutes are a crime, even as a joke or in photos.'
);
const OK_SIGN = tx(
  'Il segno "OK" (pollice e indice a cerchio) è un gesto volgare.',
  'The "OK" sign (thumb and index finger in a circle) is an obscene gesture.'
);
const DRONES_BANNED = tx(
  'I droni non si possono portare senza autorizzazione: vengono sequestrati in dogana.',
  "Drones can't be brought in without a permit: they are confiscated at customs."
);

const ramadan = (extra?: LocalText): CustomsPeriod => ({
  name: tx('Ramadan ed Eid al-Fitr', 'Ramadan and Eid al-Fitr'),
  about: tx(
    "Il mese sacro dell'Islam, in cui secondo la tradizione fu rivelato il Corano: si digiuna dall'alba al tramonto e ci si dedica alla preghiera e alla carità.",
    "The holy month of Islam, when tradition holds the Quran was revealed: Muslims fast from dawn to sunset and focus on prayer and charity."
  ),
  when: tx(
    "Mese lunare che anticipa di circa 11 giorni ogni anno; inizio e fine dipendono dall'avvistamento della luna (±1 giorno)",
    'Lunar month moving about 11 days earlier each year; start and end depend on the moon sighting (±1 day)'
  ),
  note: tx(
    `Dall'alba al tramonto i musulmani digiunano: molti locali aprono solo la sera, uffici e negozi hanno orari ridotti. Evita di mangiare, bere o fumare in pubblico di giorno. La sera, dopo il tramonto (iftar), le città si animano. Finisce con l'Eid al-Fitr, 1-3 giorni di festa con molto movimento.${extra ? ` ${extra.it}` : ''}`,
    `Muslims fast from dawn to sunset: many places open only in the evening, offices and shops keep shorter hours. Avoid eating, drinking or smoking in public during the day. After sunset (iftar) cities come alive. It ends with Eid al-Fitr, 1-3 days of celebration and heavy travel.${extra ? ` ${extra.en}` : ''}`
  ),
  dates: ramadanRanges,
});

const BALTIC_REFLECTOR = tx(
  'Di notte, a piedi fuori dalle zone illuminate, è obbligatorio portare un catarifrangente: multa se non lo hai.',
  'At night, walking outside lit areas, you must wear a reflector: you can be fined without one.'
);

const balticMidsummer = (name: LocalText, extra?: LocalText): CustomsPeriod => ({
  name,
  about: tx(
    'La notte più corta dell\'anno: falò, canti e notte in bianco in campagna, tradizione più antica del cristianesimo.',
    'The shortest night of the year: bonfires, songs and an all-nighter in the countryside, a tradition older than Christianity.'
  ),
  when: tx('23 – 24 giugno', '23 – 24 June'),
  note: tx(
    `Le città si svuotano e molti negozi e ristoranti chiudono; strade verso la campagna trafficate.${extra ? ` ${extra.it}` : ''}`,
    `Cities empty out and many shops and restaurants close; roads to the countryside are busy.${extra ? ` ${extra.en}` : ''}`
  ),
  dates: yearly('06-23', '06-24'),
});

// ---------------------------------------------------------------------------
// Paesi
// ---------------------------------------------------------------------------

export const CUSTOMS: Record<string, CountryCustoms> = {
  // ----- Europa -----
  ES: {
    meals: {
      breakfast: '8:00–10:00',
      lunch: '14:00–16:00',
      dinner: '21:00–23:00',
      note: tx('Si mangia tardi: alle 19 i ristoranti sono spesso vuoti o chiusi.', 'People eat late: at 7 pm restaurants are often empty or closed.'),
    },
    tipping: tx('Non obbligatoria: si arrotonda o si lascia qualche moneta.', 'Not required: round up or leave a few coins.'),
    law: [
      tx(
        'A Barcellona e in altre città costiere girare in costume o a torso nudo lontano dalla spiaggia è multato.',
        'In Barcelona and other coastal towns walking around in swimwear or shirtless away from the beach is fined.'
      ),
      tx(
        'Bere alcol per strada (botellón) è vietato in molte città, con multe anche salate.',
        'Drinking alcohol in the street (botellón) is banned in many cities, with hefty fines.'
      ),
    ],
    local: [
      tx('Nei paesi piccoli molti negozi chiudono nel primo pomeriggio (siesta).', 'In small towns many shops close in the early afternoon (siesta).'),
      tx('Le tapas si ordinano un po\' alla volta e si condividono.', 'Tapas are ordered a few at a time and shared.'),
    ],
  },
  FR: {
    meals: {
      breakfast: '7:00–9:00',
      lunch: '12:00–14:00',
      dinner: '19:30–21:30',
      note: tx(
        'Le cucine hanno orari rigidi: fuori da queste fasce molti ristoranti non servono.',
        'Kitchens keep strict hours: outside these slots many restaurants won\'t serve you.'
      ),
    },
    tipping: tx('Il servizio è già incluso ("service compris"): si lascia solo qualche euro se si è contenti.', 'Service is already included ("service compris"): leave a few euros only if you were happy.'),
    avoid: [
      tx(
        'Entrare in un negozio senza dire "Bonjour" (e uscire senza "Au revoir") è considerato maleducato.',
        'Entering a shop without saying "Bonjour" (and leaving without "Au revoir") is considered rude.'
      ),
    ],
    local: [
      tx('In agosto molti negozi e ristoranti a conduzione familiare chiudono per ferie.', 'In August many family-run shops and restaurants close for holidays.'),
      tx('La caraffa d\'acqua del rubinetto al ristorante è gratuita: basta chiedere "une carafe d\'eau".', 'Tap water at restaurants is free: just ask for "une carafe d\'eau".'),
    ],
  },
  PT: {
    meals: { breakfast: '8:00–10:00', lunch: '12:30–14:30', dinner: '20:00–22:00' },
    tipping: tx('Non obbligatoria: si arrotonda o si lascia il 5-10% se il servizio è stato buono.', 'Not required: round up or leave 5-10% for good service.'),
    avoid: [
      tx('Non dare per scontato che parlino spagnolo: meglio inglese o qualche parola di portoghese.', "Don't assume they speak Spanish: English or a few words of Portuguese go down better."),
    ],
    local: [
      tx(
        'Gli antipasti portati in tavola senza chiederli (pane, olive, formaggi) si pagano se li tocchi.',
        'Starters brought to the table unasked (bread, olives, cheese) are charged if you touch them.'
      ),
    ],
  },
  GR: {
    meals: { breakfast: '8:00–10:00', lunch: '14:00–16:00', dinner: '21:00–23:00' },
    tipping: tx('Si lascia il 5-10% o si arrotonda; al tavolo si lasciano le monete.', 'Leave 5-10% or round up; coins are left on the table.'),
    law: [
      tx(
        'Portare via sassi, frammenti o sabbia dai siti archeologici è reato. Sull\'Acropoli sono vietati i tacchi a spillo.',
        "Taking stones, fragments or sand from archaeological sites is a crime. Stiletto heels are banned on the Acropolis."
      ),
      tx('Sul Monte Athos le donne non possono entrare.', 'Women are not allowed on Mount Athos.'),
    ],
    gestures: [
      tx(
        'Il palmo aperto verso qualcuno (moutza) è un insulto pesante: attenzione al "basta" fatto con la mano.',
        'An open palm pushed toward someone (moutza) is a serious insult: careful with a hand "stop" gesture.'
      ),
      tx(
        '"Nai" vuol dire sì (anche se suona come "no"); il no si fa alzando il mento e le sopracciglia.',
        '"Nai" means yes (even though it sounds like "no"); no is a raised chin and eyebrows.'
      ),
    ],
    avoid: [tx('Nei monasteri ortodossi spalle e gambe coperte; spesso alle donne è richiesta la gonna.', 'In Orthodox monasteries cover shoulders and legs; women are often asked to wear a skirt.')],
    local: [
      tx('La Pasqua ortodossa è la festa più importante dell\'anno, più del Natale.', 'Orthodox Easter is the biggest celebration of the year, more than Christmas.'),
      tx('In molte isole la carta igienica non va nel WC ma nel cestino: le tubature sono strette.', 'On many islands toilet paper goes in the bin, not the toilet: the pipes are narrow.'),
    ],
  },
  HR: {
    meals: { breakfast: '7:00–9:00', lunch: '12:30–15:00', dinner: '19:00–22:00' },
    tipping: tx('Si arrotonda o si lascia il 10% se il servizio è stato buono.', 'Round up or leave 10% for good service.'),
    law: [
      tx(
        'A Spalato, Hvar, Dubrovnik e in altre città girare in costume o a torso nudo nel centro storico è multato.',
        'In Split, Hvar, Dubrovnik and other towns walking around the old town in swimwear or shirtless is fined.'
      ),
    ],
    local: [tx('Il caffè al bar (kava) è un rito lento: si resta seduti anche un\'ora.', 'Coffee at a café (kava) is a slow ritual: people sit for an hour.')],
  },
  DE: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–13:30', dinner: '18:00–20:00' },
    tipping: tx(
      'Si arrotonda o si lascia il 5-10%, ma lo si dice al cameriere mentre si paga ("fa 30") invece di lasciarlo sul tavolo.',
      'Round up or add 5-10%, but tell the waiter the total as you pay ("make it 30") rather than leaving it on the table.'
    ),
    law: [
      NAZI_SYMBOLS,
      tx('Attraversare col rosso è multato e molto malvisto, soprattutto davanti ai bambini.', 'Crossing on red is fined and frowned upon, especially in front of children.'),
    ],
    avoid: [
      tx('La domenica è giorno di riposo: negozi chiusi e niente rumori (lavori, vetro nella campana).', 'Sunday is a day of rest: shops are closed and no noise (DIY, glass recycling).'),
    ],
    local: [
      tx('Al ristorante chiedono "zusammen oder getrennt?": pagare separati è normalissimo.', 'Restaurants ask "zusammen oder getrennt?": paying separately is perfectly normal.'),
      tx('Sulle bottiglie c\'è un deposito (Pfand) che ti restituiscono riportandole.', 'Bottles carry a deposit (Pfand) refunded when you return them.'),
    ],
    periods: [
      {
        name: tx('Oktoberfest (Monaco)', 'Oktoberfest (Munich)'),
        about: tx(
          "La più grande festa della birra del mondo, nata nel 1810 per le nozze del principe Ludwig di Baviera.",
          "The world's largest beer festival, born in 1810 for the wedding of Prince Ludwig of Bavaria."
        ),
        when: tx('Da metà settembre al primo weekend di ottobre', 'Mid-September to the first weekend of October'),
        note: tx('Hotel di Monaco pieni e prezzi molto più alti: prenota con mesi di anticipo.', 'Munich hotels are full and prices much higher: book months ahead.'),
        dates: oktoberfestRanges,
      },
    ],
  },
  AT: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–13:30', dinner: '18:00–20:00' },
    tipping: tx('Si arrotonda o si lascia il 5-10%, dicendolo mentre si paga.', 'Round up or add 5-10%, saying so as you pay.'),
    law: [NAZI_SYMBOLS],
    avoid: [tx('La domenica quasi tutti i negozi sono chiusi.', 'On Sunday almost all shops are closed.')],
  },
  CH: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–13:30', dinner: '18:00–20:00' },
    tipping: tx('Il servizio è incluso per legge: si arrotonda solo se si vuole.', 'Service is included by law: round up only if you wish.'),
    avoid: [
      tx(
        'Rumore la domenica e di notte (lavatrici, vetro nella campana) è malvisto e a volte vietato dai regolamenti condominiali.',
        'Noise on Sundays and at night (washing machines, glass recycling) is frowned upon and sometimes banned by building rules.'
      ),
    ],
    local: [tx('La puntualità è presa molto sul serio, anche per gli appuntamenti informali.', 'Punctuality is taken very seriously, even for informal meetings.')],
  },
  GB: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '18:00–20:00' },
    tipping: tx(
      'Al ristorante 10-12,5%, spesso già aggiunto come "service charge": controlla il conto. Al pub non si lascia.',
      'At restaurants 10-12.5%, often already added as a "service charge": check the bill. Not in pubs.'
    ),
    gestures: [
      tx(
        'Il segno della V con il dorso della mano verso l\'altro è un insulto (col palmo verso l\'esterno invece è "pace").',
        'The V sign with the back of the hand facing out is an insult (palm facing out means "peace").'
      ),
    ],
    avoid: [tx('Saltare la coda è uno dei peggiori sgarbi possibili.', 'Jumping the queue is one of the worst possible offences.')],
    local: [
      tx('Al pub si ordina e si paga al bancone, non al tavolo.', 'In pubs you order and pay at the bar, not at the table.'),
      tx('Si guida a sinistra: attraversando guarda prima a destra.', 'They drive on the left: look right first when crossing.'),
    ],
  },
  IE: {
    meals: { breakfast: '7:30–9:30', lunch: '12:30–14:00', dinner: '18:00–20:30' },
    tipping: tx('Al ristorante 10-15%; al pub non si lascia.', 'At restaurants 10-15%; not in pubs.'),
    local: [
      tx('Al pub in compagnia si offre "a giro" (round): quando tocca a te, offri da bere a tutto il gruppo.', 'In a group at the pub drinks go in rounds: when it\'s your turn, you buy for everyone.'),
      tx('Si guida a sinistra.', 'They drive on the left.'),
    ],
  },
  NL: {
    meals: { breakfast: '7:00–8:30', lunch: '12:00–13:00', dinner: '18:00–19:30', note: tx('Il pranzo è leggero, spesso un panino.', 'Lunch is light, often a sandwich.') },
    tipping: tx('Non obbligatoria: si arrotonda o 5-10%.', 'Not required: round up or 5-10%.'),
    law: [
      tx(
        'La cannabis è tollerata solo dentro i coffeeshop: ad Amsterdam fumarla per strada nel quartiere a luci rosse è multato.',
        'Cannabis is tolerated only inside coffeeshops: in Amsterdam smoking it in the street in the red-light district is fined.'
      ),
      tx('Nel quartiere a luci rosse è vietato fotografare le vetrine.', 'Photographing the windows in the red-light district is banned.'),
    ],
    avoid: [tx('Non camminare sulle piste ciclabili (di solito rosse): le bici non frenano.', "Don't walk on the bike lanes (usually red): cyclists won't stop.")],
    local: [tx('Dividere il conto ("going Dutch") è la norma.', 'Splitting the bill ("going Dutch") is the norm.')],
  },
  BE: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '18:30–21:00' },
    tipping: tx('Il servizio è incluso: si arrotonda se si vuole.', 'Service is included: round up if you like.'),
    local: [tx('Ogni birra ha il suo bicchiere: è normale che te la servano in quello giusto.', 'Every beer has its own glass: it\'s normal to be served in the right one.')],
  },
  CZ: {
    meals: { breakfast: '7:00–9:00', lunch: '11:30–13:30', dinner: '18:00–20:00', note: tx('Il pasto principale è il pranzo.', 'Lunch is the main meal.') },
    tipping: tx('Si arrotonda o si lascia il 10%, dicendolo mentre si paga.', 'Round up or add 10%, saying so as you pay.'),
    law: [tx('Tolleranza zero sull\'alcol alla guida: nemmeno un bicchiere.', 'Zero tolerance for drink-driving: not even one glass.')],
    local: [SHOES_HOME],
  },
  HU: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '18:30–20:30' },
    tipping: tx('10-15%, ma controlla se il conto include già il "szervizdíj".', '10-15%, but check whether the bill already includes "szervizdíj".'),
    avoid: [
      tx(
        'Per tradizione non si fa "cin cin" con la birra (ricordo della repressione del 1849): col vino sì.',
        "By tradition you don't clink beer glasses (a memory of the 1849 repression): with wine it's fine."
      ),
    ],
    local: [SHOES_HOME, tx('Le terme sono un\'abitudine quotidiana, non solo turistica.', 'Thermal baths are an everyday habit, not just for tourists.')],
  },
  PL: {
    meals: { breakfast: '7:00–9:00', lunch: '13:00–15:00', dinner: '18:00–20:00' },
    tipping: tx('Circa 10%. Attenzione: dire "grazie" quando paghi significa "tieni il resto".', 'Around 10%. Careful: saying "thank you" as you pay means "keep the change".'),
    law: [
      tx('Quasi tutte le domeniche i negozi sono chiusi per legge.', 'By law shops are closed on most Sundays.'),
      tx('Bere alcol in strada e nei parchi è vietato.', 'Drinking alcohol in streets and parks is banned.'),
    ],
    avoid: [ODD_FLOWERS],
    local: [SHOES_HOME],
  },
  BG: {
    meals: { breakfast: '8:00–10:00', lunch: '12:30–14:30', dinner: '19:30–22:00' },
    tipping: tx('Circa 10%.', 'Around 10%.'),
    gestures: [
      tx(
        'Scuotere la testa da un lato all\'altro vuol dire sì, annuire vuol dire no: il contrario del nostro.',
        'Shaking your head side to side means yes, nodding means no: the opposite of ours.'
      ),
    ],
    avoid: [ODD_FLOWERS],
    local: [
      tx(
        'Il 1° marzo ci si regalano i martenitsa, braccialetti bianchi e rossi che si portano fino a quando si vede una cicogna.',
        'On 1 March people exchange martenitsa, red and white bracelets worn until you see a stork.'
      ),
    ],
  },
  RO: {
    meals: { breakfast: '7:00–9:00', lunch: '13:00–15:00', dinner: '19:00–21:00' },
    tipping: tx('Circa 10%.', 'Around 10%.'),
    avoid: [ODD_FLOWERS],
    local: [SHOES_HOME],
  },
  RS: {
    meals: { breakfast: '8:00–10:00', lunch: '14:00–16:00', dinner: '20:00–22:00' },
    tipping: tx('Si arrotonda o si lascia il 10%.', 'Round up or leave 10%.'),
    avoid: [
      tx('Il Kosovo è un argomento molto delicato: meglio non aprirlo.', 'Kosovo is a very sensitive topic: better not to bring it up.'),
      tx('Rifiutare l\'ospitalità (un caffè, un bicchiere di rakija) può offendere.', 'Refusing hospitality (a coffee, a glass of rakija) can cause offence.'),
    ],
    local: [tx('Brindando si guarda negli occhi: non farlo porta sfortuna.', 'When toasting you look people in the eye: not doing so is bad luck.')],
  },
  AL: {
    meals: { breakfast: '7:00–9:00', lunch: '13:00–15:00', dinner: '19:30–22:00' },
    tipping: tx('Si arrotonda o si lascia il 10%.', 'Round up or leave 10%.'),
    gestures: [
      tx('Come in Bulgaria, scuotere la testa vuol dire sì e annuire vuol dire no.', 'As in Bulgaria, shaking your head means yes and nodding means no.'),
    ],
    local: [tx('La passeggiata serale (xhiro) sul corso è un rito quotidiano.', 'The evening stroll (xhiro) along the main street is a daily ritual.')],
  },
  NO: {
    meals: { breakfast: '7:00–9:00', lunch: '11:30–13:00', dinner: '17:00–19:00' },
    tipping: tx('Non è necessaria: si arrotonda se si vuole.', "Not needed: round up if you like."),
    law: [
      tx(
        'Vino e superalcolici si comprano solo nei negozi di Stato (Vinmonopolet), con orari ridotti; nei supermercati solo birra leggera, fino alle 20 (sabato 18).',
        'Wine and spirits are sold only in state shops (Vinmonopolet) with short hours; supermarkets sell only light beer, until 8 pm (Saturday 6 pm).'
      ),
    ],
    local: [SHOES_HOME, tx('Si paga quasi ovunque con la carta: alcuni posti non accettano contanti.', 'Card is used almost everywhere: some places don\'t take cash.')],
  },
  SE: {
    meals: { breakfast: '7:00–9:00', lunch: '11:30–13:00', dinner: '17:30–19:30' },
    tipping: tx('Non è necessaria: si arrotonda se si vuole.', "Not needed: round up if you like."),
    law: [
      tx(
        'Oltre il 3,5% l\'alcol si compra solo nei negozi di Stato (Systembolaget), chiusi la domenica.',
        'Alcohol over 3.5% is sold only in state shops (Systembolaget), closed on Sundays.'
      ),
    ],
    local: [
      SHOES_HOME,
      tx('Molti posti accettano solo carta, niente contanti.', 'Many places take card only, no cash.'),
      tx('La "fika", pausa caffè con dolce, è un rito quotidiano.', '"Fika", a coffee break with something sweet, is a daily ritual.'),
    ],
  },
  DK: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–13:00', dinner: '18:00–20:00' },
    tipping: tx('Il servizio è incluso: si arrotonda se si vuole.', 'Service is included: round up if you like.'),
    avoid: [tx('Non camminare sulle piste ciclabili: le bici sono tantissime e veloci.', "Don't walk on bike lanes: bikes are many and fast.")],
    local: [SHOES_HOME],
  },
  FI: {
    meals: { breakfast: '7:00–9:00', lunch: '11:00–13:00', dinner: '17:00–19:00' },
    tipping: tx('Non è necessaria.', 'Not needed.'),
    law: [
      tx(
        'Oltre l\'8% l\'alcol si compra solo nei negozi di Stato (Alko); nei supermercati la vendita finisce alle 21.',
        'Alcohol over 8% is sold only in state shops (Alko); supermarket sales stop at 9 pm.'
      ),
    ],
    local: [SHOES_HOME, tx('In sauna si entra nudi, separati per sesso o in famiglia: il costume è insolito.', 'Sauna is taken naked, split by sex or with family: swimsuits are unusual.')],
  },
  IS: {
    meals: { breakfast: '7:30–9:30', lunch: '12:00–13:30', dinner: '18:30–20:30' },
    tipping: tx('Non è necessaria: il servizio è incluso.', 'Not needed: service is included.'),
    law: [
      tx(
        'Guidare fuori strada è vietato e punito con multe molto alte: il muschio impiega decenni a ricrescere.',
        'Off-road driving is banned and fined very heavily: the moss takes decades to grow back.'
      ),
    ],
    local: [tx('Nelle piscine e terme ci si lava nudi sotto la doccia prima di entrare: è obbligatorio e controllato.', 'In pools and hot springs you must shower naked before going in: it is mandatory and checked.')],
  },

  EE: {
    meals: { breakfast: '7:30–9:30', lunch: '12:00–14:00', dinner: '18:00–21:00' },
    tipping: tx('Non obbligatoria: si arrotonda o si lascia il 5-10% se il servizio è stato buono.', 'Not required: round up or leave 5-10% for good service.'),
    law: [BALTIC_REFLECTOR],
    avoid: [
      ODD_FLOWERS,
      tx('Non dare per scontato che parlino russo né chiamarli "ex sovietici": è un tasto dolente.', "Don't assume they speak Russian or call them \"ex-Soviet\": it's a sore point."),
    ],
    local: [
      tx('La sauna è un rito sociale: si fa nudi o con un telo, poi tuffo nel lago o nella neve.', 'Sauna is a social ritual: naked or in a towel, then a dip in the lake or snow.'),
      tx('Quasi tutto si paga con la carta, anche cifre piccole.', 'Almost everything is paid by card, even small amounts.'),
      tx('Le persone sono riservate: i silenzi in conversazione non sono imbarazzanti.', 'People are reserved: silences in conversation are not awkward.'),
    ],
    periods: [balticMidsummer(tx('Jaanipäev (Mezza estate)', 'Jaanipäev (Midsummer)'))],
  },
  LV: {
    meals: { breakfast: '7:30–9:30', lunch: '12:00–14:00', dinner: '18:00–21:00' },
    tipping: tx('Circa 10% al ristorante, se non è già nel conto.', 'Around 10% at restaurants, unless already on the bill.'),
    law: [BALTIC_REFLECTOR],
    avoid: [
      ODD_FLOWERS,
      tx('Non dare per scontato che parlino russo né chiamarli "ex sovietici": è un tasto dolente.', "Don't assume they speak Russian or call them \"ex-Soviet\": it's a sore point."),
    ],
    local: [
      tx('Il Mercato Centrale di Riga sta in cinque vecchi hangar per dirigibili.', "Riga's Central Market is housed in five old zeppelin hangars."),
      tx('Nei bar trovi il Balsamo nero di Riga, liquore alle erbe da bere puro o col caffè.', 'In bars you will find Riga Black Balsam, a herbal liqueur drunk neat or in coffee.'),
    ],
    periods: [
      balticMidsummer(
        tx('Jāņi (Mezza estate)', 'Jāņi (Midsummer)'),
        tx('È la festa più sentita dell\'anno: falò, corone di foglie di quercia e formaggio al cumino.', 'The most heartfelt holiday of the year: bonfires, oak-leaf crowns and caraway cheese.')
      ),
    ],
  },
  LT: {
    meals: { breakfast: '7:30–9:30', lunch: '12:00–14:00', dinner: '18:00–21:00' },
    tipping: tx('Circa 10% al ristorante, se non è già nel conto.', 'Around 10% at restaurants, unless already on the bill.'),
    law: [BALTIC_REFLECTOR],
    avoid: [
      ODD_FLOWERS,
      tx('Non dare per scontato che parlino russo né chiamarli "ex sovietici": è un tasto dolente.', "Don't assume they speak Russian or call them \"ex-Soviet\": it's a sore point."),
    ],
    local: [
      tx('Il basket è quasi una religione: le partite della nazionale svuotano le strade.', 'Basketball is almost a religion: national team games empty the streets.'),
      tx('Non si dà la mano attraverso la soglia di casa: porta sfortuna.', "Don't shake hands across a doorway: it's bad luck."),
    ],
    periods: [balticMidsummer(tx('Joninės (Mezza estate)', 'Joninės (Midsummer)'))],
  },
  MD: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '19:00–21:00' },
    tipping: tx('Circa 10%.', 'Around 10%.'),
    law: [
      tx(
        'La Transnistria (est del paese) non è controllata dal governo moldavo: verifica Viaggiare Sicuri prima di andarci.',
        'Transnistria (the east of the country) is not controlled by the Moldovan government: check Viaggiare Sicuri before going.'
      ),
    ],
    avoid: [
      ODD_FLOWERS,
      tx('Lingua e identità (rumena, moldava, russa) sono temi delicati: meglio non schierarsi.', 'Language and identity (Romanian, Moldovan, Russian) are sensitive topics: better not to take sides.'),
    ],
    local: [
      SHOES_HOME,
      tx('Si parla rumeno, ma il russo è molto diffuso, soprattutto a Chișinău.', 'Romanian is spoken, but Russian is very common, especially in Chișinău.'),
      tx('È terra di vino: le cantine sotterranee di Cricova e Mileștii Mici si visitano su prenotazione.', 'It is wine country: the underground cellars of Cricova and Mileștii Mici can be visited by booking.'),
    ],
  },

  // ----- Mediterraneo e Medio Oriente -----
  TR: {
    meals: { breakfast: '8:00–10:00', lunch: '12:00–14:00', dinner: '19:00–21:00', note: tx('La colazione (kahvaltı) è un pasto ricco e lungo.', 'Breakfast (kahvaltı) is a rich, long meal.') },
    tipping: tx('Circa 10% al ristorante.', 'Around 10% at restaurants.'),
    law: [
      tx('Offendere Atatürk o la nazione turca è reato.', 'Insulting Atatürk or the Turkish nation is a crime.'),
      tx('Non fotografare installazioni militari e di polizia.', "Don't photograph military or police sites."),
    ],
    gestures: [
      OK_SIGN,
      tx('Il no si fa alzando la testa e le sopracciglia, a volte con uno schiocco della lingua ("tsk").', 'No is a raised head and eyebrows, sometimes with a click of the tongue ("tsk").'),
    ],
    avoid: [MOSQUE_DRESS, tx('Soffiarsi il naso a tavola è maleducato.', 'Blowing your nose at the table is rude.')],
    local: [BARGAIN, tx('Il tè (çay) viene offerto ovunque, anche nei negozi: accettarlo è cortese.', 'Tea (çay) is offered everywhere, even in shops: accepting is polite.')],
    periods: [ramadan(tx('In Turchia il ramadan è vissuto in modo più discreto: nelle città turistiche cambia poco.', 'In Turkey Ramadan is lower-key: in tourist cities little changes.'))],
  },
  MA: {
    meals: { breakfast: '8:00–10:00', lunch: '13:00–15:00', dinner: '20:00–22:00' },
    tipping: tx('Piccole mance sono attese ovunque (camerieri, guide, parcheggiatori): 10% al ristorante.', 'Small tips are expected everywhere (waiters, guides, parking attendants): 10% at restaurants.'),
    law: [
      DRONES_BANNED,
      tx(
        'Durante il Ramadan mangiare in pubblico di giorno è punito per i musulmani; ai turisti è tollerato ma va evitato.',
        'During Ramadan eating in public in daytime is punished for Muslims; tourists are tolerated but should avoid it.'
      ),
    ],
    gestures: [LEFT_HAND],
    avoid: [PDA, MODEST_DRESS, tx('Chiedi sempre prima di fotografare le persone.', 'Always ask before photographing people.')],
    local: [
      BARGAIN,
      tx('Rifiutare il tè alla menta offerto è poco cortese: almeno un sorso.', 'Refusing the mint tea you are offered is impolite: have at least a sip.'),
      tx('Il venerdì è il giorno del couscous e della preghiera: a mezzogiorno molti negozi chiudono.', 'Friday is couscous and prayer day: many shops close at midday.'),
    ],
    periods: [ramadan()],
  },
  EG: {
    meals: { breakfast: '8:00–10:00', lunch: '14:00–17:00', dinner: '21:00–23:00' },
    weekend: tx('Venerdì e sabato', 'Friday and Saturday'),
    tipping: tx(
      'Il "baksheesh" è parte di tutto: piccole mance per ogni servizio, anche per chi ti indica la strada.',
      '"Baksheesh" is part of everything: small tips for every service, even for showing you the way.'
    ),
    law: [
      DRONES_BANNED,
      tx('Vietato fotografare ponti, installazioni militari, polizia e uffici pubblici.', 'Photographing bridges, military sites, police and government buildings is forbidden.'),
    ],
    gestures: [LEFT_HAND],
    avoid: [PDA, MODEST_DRESS, MOSQUE_DRESS],
    local: [BARGAIN],
    periods: [ramadan()],
  },
  TN: {
    meals: { breakfast: '7:30–9:30', lunch: '12:30–14:30', dinner: '19:30–21:30' },
    tipping: tx('Piccole mance sono gradite: 10% al ristorante.', 'Small tips are welcome: 10% at restaurants.'),
    law: [DRONES_BANNED],
    gestures: [LEFT_HAND],
    avoid: [MODEST_DRESS],
    local: [BARGAIN],
    periods: [ramadan()],
  },
  AE: {
    meals: { breakfast: '8:00–10:00', lunch: '13:00–15:00', dinner: '20:00–23:00' },
    tipping: tx('Spesso il servizio è già nel conto; altrimenti 10-15%.', 'Service is often in the bill; otherwise 10-15%.'),
    law: [
      tx('Effusioni in pubblico, gesti offensivi e parolacce (anche online) possono portare all\'arresto.', 'Public displays of affection, offensive gestures and swearing (even online) can lead to arrest.'),
      tx('L\'alcol si beve solo nei locali con licenza: essere ubriachi in pubblico è reato.', 'Alcohol only in licensed venues: being drunk in public is a crime.'),
      tx(
        'Alcuni farmaci comuni (es. con codeina) richiedono un\'autorizzazione preventiva: controlla prima di partire.',
        'Some common medicines (e.g. with codeine) need prior approval: check before you travel.'
      ),
      tx('Vietato fotografare persone senza permesso, soprattutto donne.', 'Photographing people without permission is forbidden, especially women.'),
      DRUGS,
    ],
    gestures: [LEFT_HAND],
    avoid: [MODEST_DRESS, MOSQUE_DRESS],
    periods: [ramadan(tx('Mangiare in pubblico di giorno non è più vietato, ma resta poco rispettoso.', 'Eating in public in daytime is no longer illegal, but remains disrespectful.'))],
  },
  JO: {
    meals: { breakfast: '8:00–10:00', lunch: '14:00–16:00', dinner: '20:00–22:00' },
    weekend: tx('Venerdì e sabato', 'Friday and Saturday'),
    tipping: tx('10% al ristorante; piccole mance alle guide.', '10% at restaurants; small tips for guides.'),
    gestures: [LEFT_HAND],
    avoid: [MODEST_DRESS, PDA],
    local: [tx('Il caffè o il tè offerti si accettano; per dire basta si scuote leggermente la tazzina.', 'Accept offered coffee or tea; to say "enough" gently shake the cup.')],
    periods: [ramadan()],
  },
  IL: {
    meals: { breakfast: '7:00–10:00', lunch: '12:00–15:00', dinner: '19:00–22:00', note: tx('La colazione israeliana è abbondante, da hotel.', 'Israeli breakfast is a big hotel-style spread.') },
    weekend: tx('Venerdì e sabato (Shabbat)', 'Friday and Saturday (Shabbat)'),
    tipping: tx('Al ristorante 10-15%.', 'At restaurants 10-15%.'),
    avoid: [
      tx(
        'Nei quartieri religiosi (Mea Shearim, Muro del Pianto) abiti coprenti e niente foto alle persone di Shabbat.',
        'In religious areas (Mea Shearim, the Western Wall) dress modestly and don\'t photograph people on Shabbat.'
      ),
    ],
    local: [
      tx(
        'Dal venerdì pomeriggio al sabato sera (Shabbat) quasi tutti i mezzi pubblici si fermano e molti negozi chiudono; Tel Aviv resta più aperta.',
        'From Friday afternoon to Saturday evening (Shabbat) most public transport stops and many shops close; Tel Aviv stays more open.'
      ),
      tx('Nei locali kosher carne e latticini non si servono insieme: niente cappuccino dopo la bistecca.', 'Kosher places don\'t serve meat and dairy together: no cappuccino after steak.'),
      tx('I controlli di sicurezza all\'aeroporto e nei centri commerciali sono lunghi e normali.', 'Long security checks at the airport and in malls are normal.'),
    ],
    periods: [
      {
        name: tx('Yom Kippur', 'Yom Kippur'),
        about: tx(
          "Il giorno dell'espiazione, il più sacro dell'ebraismo: digiuno di 25 ore e preghiera.",
          "The Day of Atonement, the holiest day in Judaism: a 25-hour fast and prayer."
        ),
        when: tx('Settembre o ottobre, data variabile', 'September or October, date varies'),
        note: tx(
          'Per 25 ore il paese si ferma: niente auto, mezzi pubblici, negozi né voli. L\'aeroporto chiude.',
          'For 25 hours the country stops: no cars, public transport, shops or flights. The airport closes.'
        ),
        dates: yomKippurRanges,
      },
    ],
  },

  OM: {
    meals: { breakfast: '7:00–9:00', lunch: '13:00–15:00', dinner: '19:30–22:00' },
    weekend: tx('Venerdì e sabato', 'Friday and Saturday'),
    tipping: tx('Non obbligatoria; nei ristoranti turistici 10%.', 'Not required; 10% in tourist restaurants.'),
    law: [
      tx('L\'alcol si beve solo negli hotel e nei locali con licenza; bere in pubblico è reato.', 'Alcohol only in hotels and licensed venues; drinking in public is a crime.'),
      tx('Si può prendere una multa per l\'auto troppo sporca.', 'You can be fined for driving a car that is too dirty.'),
      DRUGS,
    ],
    gestures: [LEFT_HAND],
    avoid: [MODEST_DRESS, MOSQUE_DRESS, PDA],
    local: [tx('All\'ospite si offrono kahwa (caffè al cardamomo) e datteri: rifiutare è scortese.', 'Guests are offered kahwa (cardamom coffee) and dates: refusing is impolite.')],
    periods: [ramadan()],
  },
  QA: {
    meals: { breakfast: '7:00–9:00', lunch: '13:00–15:00', dinner: '20:00–23:00' },
    weekend: tx('Venerdì e sabato', 'Friday and Saturday'),
    tipping: tx('Spesso il servizio è già nel conto; altrimenti 10%.', 'Service is often in the bill; otherwise 10%.'),
    law: [
      tx('Non si può portare alcol nel paese; si beve solo negli hotel con licenza. Essere ubriachi in pubblico è reato.', "Alcohol can't be brought into the country; it is served only in licensed hotels. Being drunk in public is a crime."),
      tx('Effusioni in pubblico e gesti offensivi possono portare all\'arresto.', 'Public displays of affection and offensive gestures can lead to arrest.'),
      DRUGS,
    ],
    gestures: [LEFT_HAND],
    avoid: [
      tx('Nei luoghi pubblici (centri commerciali, musei, uffici) spalle e ginocchia coperte.', 'In public places (malls, museums, offices) cover shoulders and knees.'),
      MOSQUE_DRESS,
    ],
    local: [tx('La vita si sposta verso sera: il Souq Waqif si anima dopo il tramonto.', 'Life shifts to the evening: Souq Waqif comes alive after sunset.')],
    periods: [ramadan()],
  },

  // ----- Americhe -----
  US: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–13:00', dinner: '18:00–20:00' },
    tipping: tx(
      'Al ristorante la mancia del 18-20% è di fatto obbligatoria: è parte dello stipendio. Anche per taxi, bar e servizi.',
      'At restaurants an 18-20% tip is effectively mandatory: it is part of the wage. Also for taxis, bars and services.'
    ),
    law: [
      tx('Alcol solo dai 21 anni: chiedono un documento anche a chi è chiaramente adulto.', 'Alcohol only from age 21: ID is asked even of people who are clearly adults.'),
      tx('Bere alcol in strada con la bottiglia aperta è vietato quasi ovunque.', 'Drinking from an open container in the street is banned almost everywhere.'),
    ],
    local: [
      tx('I prezzi esposti sono senza tasse: alla cassa si aggiunge la sales tax.', 'Displayed prices exclude tax: sales tax is added at the till.'),
      tx('Le bibite al fast food sono spesso con ricarica gratuita (free refill).', 'Fast-food drinks often come with free refills.'),
    ],
  },
  CA: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–13:00', dinner: '18:00–20:00' },
    tipping: tx('15-20% al ristorante, attesa come negli USA.', '15-20% at restaurants, expected as in the US.'),
    local: [
      tx('I prezzi esposti sono senza tasse: si aggiungono alla cassa.', 'Displayed prices exclude tax: it is added at the till.'),
      tx('In Québec la lingua è il francese: un "bonjour" è molto apprezzato.', 'In Québec the language is French: a "bonjour" is much appreciated.'),
    ],
  },
  MX: {
    meals: {
      breakfast: '8:00–10:00',
      lunch: '14:00–16:00',
      dinner: '20:00–22:00',
      note: tx('Il pasto principale è la "comida" del pomeriggio; la cena è leggera.', 'The main meal is the afternoon "comida"; dinner is light.'),
    },
    tipping: tx('10-15% al ristorante.', '10-15% at restaurants.'),
    local: [
      tx('"Ahorita" può voler dire tra un minuto o mai: i tempi sono elastici.', '"Ahorita" can mean in a minute or never: timing is flexible.'),
      tx('L\'acqua del rubinetto non si beve: si usa quella in bottiglia.', "Tap water isn't for drinking: use bottled water."),
    ],
    periods: [
      {
        name: tx('Día de Muertos', 'Day of the Dead'),
        about: tx(
          "Si crede che in questi giorni i defunti tornino a trovare i vivi: altari con fiori di cempasúchil, teschi di zucchero e i piatti preferiti dei cari.",
          "The dead are believed to come back to visit the living: altars with marigolds, sugar skulls and the loved ones' favourite dishes."
        ),
        when: tx('31 ottobre – 2 novembre', '31 October – 2 November'),
        note: tx(
          'Festa allegra di ricordo dei defunti, con altari e sfilate: città affollate e alloggi da prenotare presto.',
          'A joyful remembrance of the dead with altars and parades: crowded cities, book lodging early.'
        ),
        dates: yearly('10-31', '11-02'),
      },
    ],
  },
  CU: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '19:00–21:00' },
    tipping: tx('Le mance sono molto attese ed essenziali per chi lavora nel turismo.', 'Tips are much expected and essential for people working in tourism.'),
    avoid: [tx('Le critiche al governo in pubblico possono mettere in difficoltà chi è con te.', 'Criticising the government in public can put the people with you in trouble.')],
    local: [tx('Internet è lento e limitato: scarica mappe e documenti prima di partire.', 'Internet is slow and limited: download maps and documents before you go.')],
  },
  BR: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '19:30–21:30', note: tx('Il pranzo è il pasto principale.', 'Lunch is the main meal.') },
    tipping: tx('Il 10% di servizio è di solito già nel conto.', 'A 10% service charge is usually already in the bill.'),
    gestures: [OK_SIGN, tx('Il pollice in su è usatissimo per dire "ok", "grazie", "tutto bene".', 'Thumbs up is used constantly for "ok", "thanks", "all good".')],
    local: [tx('Ci si saluta con baci sulle guance anche alla prima conoscenza.', 'People greet with kisses on the cheek even on first meeting.')],
    periods: [
      {
        name: tx('Carnevale', 'Carnival'),
        about: tx(
          "Gli ultimi giorni di festa prima della Quaresima: a Rio sfilano le scuole di samba nel Sambódromo, a Salvador e Recife si balla in strada.",
          "The last days of celebration before Lent: in Rio the samba schools parade in the Sambódromo, in Salvador and Recife people dance in the streets."
        ),
        when: tx('Febbraio o inizio marzo, i 4-5 giorni prima del mercoledì delle Ceneri', 'February or early March, the 4-5 days before Ash Wednesday'),
        note: tx(
          'Il paese si ferma per festeggiare: prezzi alle stelle, alloggi esauriti, uffici chiusi.',
          'The country stops to party: sky-high prices, sold-out lodging, offices closed.'
        ),
        dates: carnivalRanges,
      },
    ],
  },
  AR: {
    meals: {
      breakfast: '7:00–9:00',
      lunch: '13:00–15:00',
      dinner: '21:30–23:30',
      note: tx('Si cena molto tardi: prima delle 21 i ristoranti sono vuoti. Alle 17 c\'è la merienda.', 'Dinner is very late: restaurants are empty before 9 pm. At 5 pm there\'s merienda.'),
    },
    tipping: tx('Circa 10%, spesso in contanti.', 'Around 10%, often in cash.'),
    avoid: [tx('Le isole Falkland/Malvinas sono un tema molto sentito: meglio non scherzarci.', 'The Falklands/Malvinas are a very sensitive topic: better not to joke about it.')],
    local: [
      tx(
        'Il mate si beve in gruppo dalla stessa cannuccia; dire "grazie" significa che non ne vuoi più.',
        'Mate is shared in a group from the same straw; saying "thank you" means you don\'t want any more.'
      ),
    ],
  },
  PE: {
    meals: { breakfast: '7:00–9:00', lunch: '12:30–15:00', dinner: '19:00–21:00', note: tx('Il pranzo è il pasto principale.', 'Lunch is the main meal.') },
    tipping: tx('Circa 10% al ristorante.', 'Around 10% at restaurants.'),
    local: [
      tx('A Cusco e sulle Ande l\'altitudine si sente: i primi giorni vai piano e bevi mate de coca.', 'In Cusco and the Andes you feel the altitude: take it easy the first days and drink coca tea.'),
      tx('L\'acqua del rubinetto non si beve.', "Tap water isn't for drinking."),
    ],
  },

  CO: {
    meals: {
      breakfast: '6:30–8:30',
      lunch: '12:00–14:00',
      dinner: '19:00–21:00',
      note: tx('Il pasto principale è il pranzo: cerca il "menú del día", zuppa e piatto unico a poco prezzo.', 'Lunch is the main meal: look for the "menú del día", soup and a main at a low price.'),
    },
    tipping: tx(
      'Al ristorante ti chiedono se includere il servizio ("¿desea incluir el servicio?"), di solito il 10%: è volontario.',
      'At restaurants you are asked whether to add service ("¿desea incluir el servicio?"), usually 10%: it is voluntary.'
    ),
    law: [DRUGS],
    avoid: [
      tx('"No dar papaya": non mostrare telefono, gioielli o soldi in strada.', '"No dar papaya": don\'t show off your phone, jewellery or cash in the street.'),
      tx('Non accettare drink o sigarette da sconosciuti: esistono furti con droghe (scopolamina).', "Don't accept drinks or cigarettes from strangers: there are robberies using drugs (scopolamine)."),
    ],
    local: [
      tx('Un "tinto" è un caffè nero, non un vino rosso.', 'A "tinto" is a black coffee, not red wine.'),
      tx('Si chiede con molta cortesia: "¿me regala…?" vuol dire "mi dà…?", non chiedere un regalo.', 'People are very polite: "¿me regala…?" means "can I have…?", not asking for a gift.'),
    ],
  },
  CL: {
    meals: {
      breakfast: '7:00–9:00',
      lunch: '13:00–15:00',
      dinner: '20:30–22:30',
      note: tx('Verso le 18-20 c\'è la "once", merenda con tè, pane e affettati che spesso sostituisce la cena.', 'Around 6-8 pm there\'s "once", tea with bread and cold cuts that often replaces dinner.'),
    },
    tipping: tx('Ti chiedono se aggiungere il 10% ("¿desea agregar la propina?"): è volontario ma si usa.', 'You are asked whether to add 10% ("¿desea agregar la propina?"): voluntary but customary.'),
    law: [
      tx(
        'Controlli severissimi all\'arrivo su frutta, carne, formaggi e semi: dichiara tutto o rischi multe alte.',
        'Very strict checks on fruit, meat, cheese and seeds on arrival: declare everything or risk heavy fines.'
      ),
    ],
    local: [tx('Lo spagnolo cileno è veloce e pieno di gergo ("¿cachai?" = capisci?).', 'Chilean Spanish is fast and full of slang ("¿cachai?" = get it?).')],
    periods: [
      {
        name: tx('Fiestas Patrias', 'Fiestas Patrias'),
        about: tx(
          "La festa dell'indipendenza: fondas con empanadas, asado e chicha, cueca (il ballo nazionale) e aquiloni.",
          'Independence celebrations: fondas with empanadas, barbecue and chicha, cueca (the national dance) and kites.'
        ),
        when: tx('18 – 19 settembre, spesso con ponte', '18 – 19 September, often with a long weekend'),
        note: tx('Si ferma tutto per giorni: uffici e molti negozi chiusi, autobus e voli interni pieni.', 'Everything stops for days: offices and many shops closed, buses and domestic flights full.'),
        dates: yearly('09-17', '09-20'),
      },
    ],
  },
  EC: {
    meals: { breakfast: '7:00–9:00', lunch: '12:30–14:00', dinner: '19:00–21:00', note: tx('Il pranzo (almuerzo) è il pasto principale.', 'Lunch (almuerzo) is the main meal.') },
    tipping: tx('Spesso il 10% di servizio è già nel conto; si aggiunge qualcosa solo se si è contenti.', 'A 10% service charge is often already on the bill; add a little only if happy.'),
    law: [
      tx(
        'Alle Galápagos regole rigide: niente cibo, nessun contatto con gli animali (almeno 2 metri), solo sentieri segnati e con guida.',
        'In the Galápagos strict rules apply: no food, no contact with animals (at least 2 metres), marked trails only and with a guide.'
      ),
      DRUGS,
    ],
    local: [
      tx('La moneta è il dollaro USA: porta banconote piccole, quelle da 50 e 100 spesso non le accettano.', 'The currency is the US dollar: bring small notes, 50s and 100s are often refused.'),
      tx('Quito è a 2.850 metri: i primi giorni vai piano.', 'Quito is at 2,850 metres: take it easy the first days.'),
    ],
  },
  BO: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '19:00–21:00', note: tx('Il pranzo è il pasto principale; a metà mattina si mangiano le salteñas.', 'Lunch is the main meal; mid-morning is salteña time.') },
    tipping: tx('Non obbligatoria: 5-10% al ristorante, piccole mance a guide e autisti.', 'Not required: 5-10% at restaurants, small tips for guides and drivers.'),
    law: [
      tx(
        'Le foglie di coca sono legali in Bolivia ma vietate in Italia e quasi ovunque: non portarle a casa, nemmeno in bustine di tè.',
        "Coca leaves are legal in Bolivia but banned in Italy and almost everywhere: don't take them home, not even as tea bags."
      ),
      DRUGS,
    ],
    avoid: [tx('Chiedi prima di fotografare le persone, soprattutto le cholitas: spesso si aspettano una mancia.', 'Ask before photographing people, especially cholitas: they often expect a tip.')],
    local: [
      tx('La Paz è a oltre 3.600 metri: il mate de coca aiuta con l\'altitudine.', 'La Paz is over 3,600 metres up: coca tea helps with the altitude.'),
      tx('Scioperi e blocchi stradali (bloqueos) sono frequenti: tieni margine negli spostamenti.', 'Strikes and roadblocks (bloqueos) are frequent: leave slack in your travel plans.'),
    ],
  },
  UY: {
    meals: { breakfast: '8:00–10:00', lunch: '12:30–14:30', dinner: '21:00–23:00' },
    tipping: tx('Circa 10% al ristorante.', 'Around 10% at restaurants.'),
    local: [
      tx('Il mate è ovunque: la gente gira col thermos sotto il braccio. Se te lo offrono, "gracias" vuol dire "basta così".', 'Mate is everywhere: people walk around with a thermos under their arm. If offered, "gracias" means "no more".'),
      tx('L\'asado della domenica è un rito familiare.', 'The Sunday barbecue (asado) is a family ritual.'),
    ],
    periods: [
      {
        name: tx('Semana de Turismo (Settimana Santa)', 'Semana de Turismo (Holy Week)'),
        about: tx(
          'In Uruguay, paese laico, la Settimana Santa si chiama "settimana del turismo": tutti vanno in vacanza.',
          'In secular Uruguay, Holy Week is called "tourism week": everyone goes on holiday.'
        ),
        when: tx('La settimana prima di Pasqua', 'The week before Easter'),
        note: tx('Uffici e molti negozi chiusi per tutta la settimana; località di mare e autobus pieni.', 'Offices and many shops closed all week; seaside towns and buses full.'),
        dates: holyWeekRanges,
      },
      {
        name: tx('Carnevale', 'Carnival'),
        about: tx(
          'Il carnevale più lungo del mondo: da fine gennaio a inizio marzo, con le murgas e il candombe nei quartieri di Montevideo.',
          "The world's longest carnival: from late January to early March, with murgas and candombe in Montevideo's neighbourhoods."
        ),
        when: tx('Circa 40 giorni tra gennaio e marzo; festivo il lunedì e martedì di Carnevale', 'About 40 days between January and March; Carnival Monday and Tuesday are holidays'),
        note: tx('Spettacoli ogni sera nei tablados; i due giorni festivi chiudono uffici e molti negozi.', 'Shows every night at the tablados; the two holidays close offices and many shops.'),
        dates: carnivalRanges,
      },
    ],
  },

  // ----- Asia -----
  JP: {
    meals: { breakfast: '7:00–8:30', lunch: '12:00–13:00', dinner: '18:00–20:00' },
    tipping: NO_TIP,
    law: [
      tx(
        'Alcuni farmaci da banco italiani (con pseudoefedrina o codeina, es. certi antinfluenzali) sono vietati; per scorte oltre un mese di farmaci con ricetta serve un permesso (Yunyu Kakunin-sho).',
        'Some over-the-counter medicines common in Italy (with pseudoephedrine or codeine, e.g. some cold remedies) are banned; carrying more than a month\'s supply of prescription drugs needs a permit (Yunyu Kakunin-sho).'
      ),
      tx('In molti quartieri di Tokyo è vietato fumare camminando: si fuma solo nelle aree apposite.', 'In many Tokyo districts smoking while walking is banned: smoke only in designated areas.'),
      tx('Bisogna avere sempre con sé il passaporto.', 'You must carry your passport at all times.'),
    ],
    avoid: [
      tx(
        'Non piantare le bacchette dritte nel riso e non passare il cibo da bacchetta a bacchetta: sono gesti dei funerali.',
        "Don't stick chopsticks upright in rice or pass food from chopstick to chopstick: both are funeral rites."
      ),
      tx('Soffiarsi il naso in pubblico è maleducato; tirare su col naso no.', 'Blowing your nose in public is rude; sniffling is not.'),
      tx('Parlare al telefono in treno e mangiare camminando sono malvisti.', 'Talking on the phone on trains and eating while walking are frowned upon.'),
      tx('Con i tatuaggi spesso non si entra negli onsen: chiedi o coprili.', 'Visible tattoos often bar entry to onsen: ask or cover them.'),
    ],
    local: [
      tx('Aspirare rumorosamente ramen e soba è normale, quasi un complimento.', 'Slurping ramen and soba loudly is normal, almost a compliment.'),
      SHOES_HOME,
      tx('I cestini per strada sono rarissimi: i rifiuti si portano con sé.', 'Street bins are very rare: carry your rubbish with you.'),
      tx('Negli onsen si entra nudi, dopo essersi lavati con cura seduti alle docce.', 'Onsen are entered naked, after washing thoroughly seated at the showers.'),
    ],
    periods: [
      {
        name: tx('Golden Week', 'Golden Week'),
        about: tx(
          "Quattro feste nazionali ravvicinate (Shōwa, Costituzione, Verde, Bambini) che formano la vacanza più lunga dell'anno.",
          "Four national holidays close together (Shōwa, Constitution, Greenery, Children's) forming the longest holiday of the year."
        ),
        when: tx('29 aprile – 5 maggio', '29 April – 5 May'),
        note: tx('Tutti i giapponesi viaggiano: treni pieni, prezzi alti, mete affollate.', 'All of Japan travels: packed trains, high prices, crowded sights.'),
        dates: yearly('04-29', '05-05'),
      },
      {
        name: tx('Obon', 'Obon'),
        about: tx(
          "Festa buddista in cui si accolgono gli spiriti degli antenati: lanterne, visite alle tombe e danze bon-odori.",
          "Buddhist festival welcoming the spirits of ancestors: lanterns, grave visits and bon-odori dances."
        ),
        when: tx('Metà agosto (13-16)', 'Mid-August (13-16)'),
        note: tx('Ci si sposta verso i paesi d\'origine: treni e autostrade pieni.', 'People travel to their hometowns: trains and highways are full.'),
        dates: yearly('08-13', '08-16'),
      },
      {
        name: tx('Capodanno (Shōgatsu)', 'New Year (Shōgatsu)'),
        about: tx(
          "La festa più importante dell'anno: prima visita al tempio (hatsumōde), cibi speciali e giorni in famiglia.",
          "The most important holiday of the year: first shrine visit (hatsumōde), special food and days with family."
        ),
        when: tx('29 dicembre – 3 gennaio', '29 December – 3 January'),
        note: tx('Molti negozi, musei e ristoranti chiudono qualche giorno.', 'Many shops, museums and restaurants close for a few days.'),
        dates: yearly('12-29', '01-03'),
      },
    ],
  },
  CN: {
    meals: { breakfast: '7:00–8:30', lunch: '11:30–13:00', dinner: '17:30–19:30', note: tx('Si mangia presto: dopo le 21 molte cucine sono chiuse.', 'People eat early: after 9 pm many kitchens are closed.') },
    tipping: tx('Non si usa, salvo negli hotel internazionali.', "Not customary, except in international hotels."),
    law: [
      DRUGS,
      tx('Bisogna avere sempre con sé il passaporto: serve anche per treni e molti musei.', 'You must carry your passport: it is needed for trains and many museums too.'),
    ],
    avoid: [
      tx('Non regalare orologi (evocano la morte) né oggetti in gruppi di quattro: il 4 porta sfortuna.', "Don't give clocks (they evoke death) or anything in fours: 4 is unlucky."),
      tx('Bacchette dritte nel riso: richiamano i funerali.', 'Chopsticks upright in rice: they recall funerals.'),
    ],
    local: [
      tx(
        'Google, WhatsApp, Instagram e molti siti occidentali non funzionano: scarica prima le alternative (WeChat, mappe offline).',
        'Google, WhatsApp, Instagram and many Western sites don\'t work: get alternatives first (WeChat, offline maps).'
      ),
      tx('Si paga quasi tutto con Alipay o WeChat Pay: collegale alla carta prima di partire.', 'Almost everything is paid with Alipay or WeChat Pay: link them to your card before you go.'),
      tx('Mangiare in modo rumoroso e condividere tutti i piatti al centro è normale.', 'Noisy eating and sharing all dishes in the middle is normal.'),
    ],
    periods: [
      {
        name: tx('Capodanno cinese (Festa di Primavera)', 'Chinese New Year (Spring Festival)'),
        about: tx(
          "L'inizio dell'anno lunare: cenone in famiglia, buste rosse con soldi, fuochi d'artificio e danze del drago.",
          "The start of the lunar year: family reunion dinner, red envelopes with money, fireworks and dragon dances."
        ),
        when: tx('Fine gennaio o febbraio, data lunare', 'Late January or February, lunar date'),
        note: tx(
          'La più grande migrazione del mondo: treni e voli esauriti, molti negozi e ristoranti chiusi per una settimana.',
          "The world's biggest migration: trains and flights sold out, many shops and restaurants closed for a week."
        ),
        dates: lunarNewYearRanges,
      },
      {
        name: tx('Golden Week nazionale', 'National Golden Week'),
        about: tx(
          "La settimana di vacanza attorno alla Festa nazionale del 1° ottobre, anniversario della Repubblica Popolare (1949).",
          "The week-long holiday around National Day on 1 October, anniversary of the People's Republic (1949)."
        ),
        when: tx('1 – 7 ottobre', '1 – 7 October'),
        note: tx('Tutto il paese è in viaggio: siti turistici presi d\'assalto e prezzi alti.', 'The whole country travels: sights are mobbed and prices high.'),
        dates: yearly('10-01', '10-07'),
      },
    ],
  },
  KR: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–13:00', dinner: '18:00–20:00' },
    tipping: NO_TIP,
    avoid: [
      tx('Non scrivere il nome di qualcuno in rosso: si usa per i defunti.', "Don't write someone's name in red: it's used for the dead."),
      tx('Non versarti da bere da solo: si versa agli altri, e si riceve il bicchiere con due mani.', "Don't pour your own drink: you pour for others and receive your glass with two hands."),
      tx('Il 4 porta sfortuna (in molti ascensori il piano è "F").', '4 is unlucky (in many lifts the floor is "F").'),
    ],
    local: [SHOES_HOME, tx('Si aspetta che il più anziano inizi a mangiare.', 'You wait for the eldest to start eating.')],
    periods: [
      {
        name: tx('Seollal (Capodanno lunare)', 'Seollal (Lunar New Year)'),
        about: tx(
          "Il capodanno lunare coreano: inchino agli anziani (sebae), zuppa di gnocchi di riso (tteokguk) e riti per gli antenati.",
          "Korean Lunar New Year: bowing to elders (sebae), rice-cake soup (tteokguk) and ancestral rites."
        ),
        when: tx('Fine gennaio o febbraio', 'Late January or February'),
        note: tx('Tre giorni di festa: molti negozi chiusi e trasporti pieni.', 'Three days of holiday: many shops closed and transport packed.'),
        dates: (y) => lunarNewYearRanges(y, 'dangi'),
      },
      {
        name: tx('Chuseok', 'Chuseok'),
        about: tx(
          "La festa del raccolto, alla luna piena d'autunno: si torna in famiglia, si onorano gli antenati e si mangiano i songpyeon.",
          "The harvest festival at the autumn full moon: people go home, honour their ancestors and eat songpyeon rice cakes."
        ),
        when: tx('Settembre o inizio ottobre', 'September or early October'),
        note: tx('Il "ringraziamento" coreano: tre giorni in cui tutti tornano in famiglia.', 'Korean "thanksgiving": three days when everyone goes home to family.'),
        dates: chuseokRanges,
      },
    ],
  },
  TH: {
    meals: { breakfast: '7:00–9:00', lunch: '11:30–13:00', dinner: '18:00–20:00', note: tx('Lo street food si trova a ogni ora.', 'Street food is available at all hours.') },
    tipping: tx('Non obbligatoria: si lasciano le monete del resto o 20-50 baht.', 'Not required: leave the coins from your change or 20-50 baht.'),
    law: [
      tx(
        'Offendere il re e la famiglia reale è un reato gravissimo: anche calpestare una banconota (c\'è il suo ritratto) è un\'offesa.',
        'Insulting the king and royal family is a very serious crime: even stepping on a banknote (it bears his portrait) is an offence.'
      ),
      tx('Sigarette elettroniche vietate: multe alte o arresto, anche solo per possesso.', 'E-cigarettes are banned: heavy fines or arrest, even just for possession.'),
      tx(
        'L\'alcol si vende solo dalle 11 alle 14 e dalle 17 a mezzanotte, e non nei giorni festivi buddisti.',
        'Alcohol is sold only from 11 am to 2 pm and from 5 pm to midnight, and not on Buddhist holy days.'
      ),
      tx('Le statue di Buddha non si esportano senza permesso.', "Buddha statues can't be exported without a permit."),
      DRUGS,
    ],
    gestures: [tx('Ci si saluta con il wai: mani giunte e leggero inchino.', 'People greet with the wai: palms together and a slight bow.')],
    avoid: [
      HEAD_FEET,
      TEMPLE_DRESS,
      tx('Le donne non devono toccare i monaci né porgere loro oggetti direttamente.', 'Women must not touch monks or hand them things directly.'),
      tx('Alzare la voce o arrabbiarsi in pubblico fa "perdere la faccia" a tutti.', 'Raising your voice or getting angry in public makes everyone "lose face".'),
    ],
    local: [
      tx(
        'Alle 8 e alle 18 nei luoghi pubblici suona l\'inno nazionale e tutti si fermano in piedi; al cinema ci si alza per l\'inno reale.',
        'At 8 am and 6 pm the national anthem plays in public places and everyone stands still; in cinemas people stand for the royal anthem.'
      ),
      BARGAIN,
    ],
    periods: [
      {
        name: tx('Songkran (Capodanno thai)', 'Songkran (Thai New Year)'),
        about: tx(
          "Il capodanno tradizionale thai: l'acqua versata simboleggia la purificazione e la buona fortuna per l'anno nuovo.",
          "The traditional Thai New Year: pouring water symbolises cleansing and good luck for the new year."
        ),
        when: tx('13 – 15 aprile', '13 – 15 April'),
        note: tx(
          'Gigantesca battaglia d\'acqua in tutto il paese: verrai bagnato, proteggi telefono e documenti. Trasporti pieni.',
          "A giant nationwide water fight: you will get soaked, protect phone and documents. Transport is packed."
        ),
        dates: yearly('04-13', '04-15'),
      },
    ],
  },
  VN: {
    meals: { breakfast: '6:00–8:00', lunch: '11:00–13:00', dinner: '17:00–19:00', note: tx('Si mangia presto; il phở è una colazione.', 'People eat early; phở is a breakfast dish.') },
    tipping: tx('Non obbligatoria, ma apprezzata da guide e autisti.', 'Not required, but appreciated by guides and drivers.'),
    law: [DRUGS],
    avoid: [HEAD_FEET, POINT_THUMB],
    local: [
      BARGAIN,
      tx('Per attraversare tra i motorini cammina lento e costante, senza fermarti di colpo: ti schivano loro.', 'To cross among the scooters walk slowly and steadily without stopping suddenly: they will avoid you.'),
    ],
    periods: [
      {
        name: tx('Tết (Capodanno lunare)', 'Tết (Lunar New Year)'),
        about: tx(
          "Il capodanno lunare vietnamita: fiori di pesco e kumquat, bánh chưng e visite a parenti e antenati.",
          "Vietnamese Lunar New Year: peach blossoms and kumquat trees, bánh chưng and visits to relatives and ancestors."
        ),
        when: tx('Fine gennaio o febbraio', 'Late January or February'),
        note: tx('La festa più importante: per una settimana molti negozi chiudono e i trasporti sono esauriti.', 'The biggest holiday: for a week many shops close and transport sells out.'),
        dates: lunarNewYearRanges,
      },
    ],
  },
  KH: {
    meals: { breakfast: '6:00–8:00', lunch: '11:00–13:00', dinner: '17:00–19:00' },
    tipping: tx('Non obbligatoria, ma apprezzata.', 'Not required, but appreciated.'),
    law: [DRUGS],
    avoid: [HEAD_FEET, tx('Ad Angkor spalle e ginocchia devono essere coperte: all\'ingresso dei templi controllano.', 'At Angkor shoulders and knees must be covered: it is checked at temple entrances.')],
    local: [tx('Il dollaro americano si usa quanto la valuta locale; il resto arriva spesso in riel.', 'US dollars are used as much as the local currency; change often comes in riel.')],
  },
  ID: {
    meals: { breakfast: '6:30–8:30', lunch: '12:00–13:30', dinner: '18:00–20:00' },
    tipping: tx('Non obbligatoria; nei ristoranti turistici c\'è spesso il service charge.', 'Not required; tourist restaurants often add a service charge.'),
    law: [DRUGS],
    gestures: [LEFT_HAND, POINT_THUMB],
    avoid: [
      HEAD_FEET,
      tx('Nei templi di Bali serve il sarong (spesso lo prestano all\'ingresso).', 'Balinese temples require a sarong (often lent at the entrance).'),
      MODEST_DRESS,
    ],
    periods: [
      {
        name: tx('Nyepi (Bali)', 'Nyepi (Bali)'),
        about: tx(
          "Il capodanno induista balinese: la sera prima sfilano gli ogoh-ogoh, enormi statue di demoni che poi vengono bruciate; il giorno dopo è dedicato al silenzio e alla meditazione.",
          "The Balinese Hindu New Year: the evening before, huge demon statues (ogoh-ogoh) parade and are burned; the next day is for silence and meditation."
        ),
        when: tx('Marzo, con la luna nuova (data variabile)', 'March, at the new moon (date varies)'),
        note: tx(
          'Giorno del silenzio: per 24 ore a Bali nessuno esce di casa, luci spente, aeroporto chiuso. Gli hotel restano aperti ma non si può uscire.',
          'Day of Silence: for 24 hours nobody in Bali leaves home, lights off, airport closed. Hotels stay open but you cannot go out.'
        ),
        dates: nyepiRanges,
      },
      ramadan(tx('A Bali, a maggioranza induista, il ramadan si nota poco.', 'In Hindu-majority Bali, Ramadan is barely noticeable.')),
    ],
  },
  MY: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '19:00–21:00' },
    weekend: tx('Sabato e domenica; in alcuni stati (Kelantan, Terengganu, Kedah, Johor) venerdì e sabato', 'Saturday and Sunday; in some states (Kelantan, Terengganu, Kedah, Johor) Friday and Saturday'),
    tipping: tx('Non obbligatoria; spesso c\'è il service charge del 10%.', 'Not required; there is often a 10% service charge.'),
    law: [DRUGS],
    gestures: [LEFT_HAND, POINT_THUMB],
    avoid: [PDA, MOSQUE_DRESS, SHOES_HOME],
    periods: [ramadan()],
  },
  SG: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '18:00–20:00', note: tx('Negli hawker centre si mangia bene e a poco a ogni ora.', 'Hawker centres serve good cheap food at all hours.') },
    tipping: tx('Non si usa: il 10% di servizio è già nel conto.', 'Not customary: a 10% service charge is already in the bill.'),
    law: [
      tx('Vietato vendere e importare gomme da masticare; sputarle per terra costa multe salate.', 'Selling and importing chewing gum is banned; spitting it out costs hefty fines.'),
      tx('Sigarette elettroniche vietate: anche il solo possesso è punito con multe.', 'E-cigarettes are banned: even possession is fined.'),
      tx(
        'Multe per rifiuti per terra, sputi, attraversare fuori dalle strisce, non tirare lo sciacquone nei bagni pubblici.',
        'Fines for littering, spitting, jaywalking and not flushing public toilets.'
      ),
      tx('Vietato mangiare e bere sulla metropolitana (e portarci il durian).', 'No eating or drinking on the metro (and no durian).'),
      DRUGS,
    ],
    local: [tx('Un pacchetto di fazzoletti sul tavolo dell\'hawker centre significa "occupato" (chope).', 'A packet of tissues on a hawker-centre table means "taken" (chope).')],
  },
  PH: {
    meals: { breakfast: '6:30–8:30', lunch: '12:00–13:00', dinner: '18:00–20:00', note: tx('A metà pomeriggio c\'è la merienda.', 'Mid-afternoon there\'s merienda.') },
    tipping: tx('Circa 10% se non c\'è già il service charge.', 'Around 10% unless a service charge is included.'),
    law: [DRUGS],
    gestures: [tx('Si indica spesso con le labbra, non con il dito.', 'People often point with their lips rather than a finger.')],
    local: [tx('"Po" alla fine della frase è segno di rispetto.', '"Po" at the end of a sentence is a sign of respect.')],
  },
  IN: {
    meals: { breakfast: '8:00–9:30', lunch: '13:00–14:30', dinner: '20:00–22:00' },
    tipping: tx('Circa 10% al ristorante; piccole mance ad autisti e facchini.', 'Around 10% at restaurants; small tips for drivers and porters.'),
    law: [
      tx(
        'I telefoni satellitari (Thuraya, Iridium) sono vietati senza permesso: ci sono stati arresti in aeroporto.',
        'Satellite phones (Thuraya, Iridium) are banned without a permit: there have been arrests at airports.'
      ),
      tx('In molti stati la macellazione delle vacche è vietata: il manzo è quasi introvabile.', 'In many states cow slaughter is banned: beef is almost impossible to find.'),
    ],
    gestures: [
      LEFT_HAND,
      tx('Il dondolio della testa da una spalla all\'altra vuol dire "sì" o "ho capito", non "no".', 'Wobbling the head from shoulder to shoulder means "yes" or "I understand", not "no".'),
    ],
    avoid: [PDA, TEMPLE_DRESS, MODEST_DRESS],
    local: [BARGAIN, tx('Si mangia spesso con la mano destra, senza posate.', 'People often eat with their right hand, without cutlery.')],
    periods: [
      {
        name: tx('Diwali', 'Diwali'),
        about: tx(
          "La festa delle luci, la più importante dell'induismo: celebra la vittoria della luce sulle tenebre con lampade a olio, dolci e regali.",
          "The festival of lights, the biggest Hindu holiday: it celebrates light over darkness with oil lamps, sweets and gifts."
        ),
        when: tx('Ottobre o novembre, data lunare', 'October or November, lunar date'),
        note: tx('Festa delle luci: fuochi d\'artificio ovunque, treni pieni, molti negozi chiusi il giorno stesso.', 'Festival of lights: fireworks everywhere, packed trains, many shops closed on the day.'),
        dates: diwaliRanges,
      },
      {
        name: tx('Holi', 'Holi'),
        about: tx(
          "La festa dei colori che saluta la primavera e la vittoria del bene sul male: ci si lancia polveri e acqua colorata.",
          "The festival of colours welcoming spring and the victory of good over evil: people throw coloured powder and water."
        ),
        when: tx('Marzo, data lunare', 'March, lunar date'),
        note: tx('Festa dei colori: per strada ti tirano polveri colorate. Vestiti che puoi buttare.', 'Festival of colours: people throw coloured powder in the streets. Wear clothes you can throw away.'),
        dates: holiRanges,
      },
    ],
  },
  LK: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '19:00–21:00' },
    tipping: tx('Circa 10% se non è già nel conto.', 'Around 10% if not already in the bill.'),
    law: [
      tx('Tatuaggi con il Buddha in vista hanno portato a espulsioni dal paese: coprili.', 'Visible Buddha tattoos have led to deportations: cover them.'),
      tx('Farsi fotografare di spalle a una statua del Buddha è considerato un\'offesa grave.', 'Posing for photos with your back to a Buddha statue is a serious offence.'),
    ],
    gestures: [LEFT_HAND],
    avoid: [HEAD_FEET, TEMPLE_DRESS],
    local: [tx('Nei giorni di luna piena (Poya) non si vende alcol e molti negozi chiudono.', 'On full-moon days (Poya) alcohol is not sold and many shops close.')],
  },
  MV: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '19:00–21:00' },
    weekend: tx('Venerdì e sabato', 'Friday and Saturday'),
    tipping: tx('Nei resort c\'è il 10% di servizio; mance extra allo staff sono comuni.', 'Resorts add 10% service; extra tips for staff are common.'),
    law: [
      tx('Vietato portare alcol, carne di maiale, idoli religiosi e materiale pornografico: vengono sequestrati.', 'Bringing alcohol, pork, religious idols or pornography is banned: they are confiscated.'),
      tx('L\'alcol si beve solo nei resort e sulle barche autorizzate, non nelle isole abitate.', 'Alcohol only in resorts and licensed boats, not on inhabited islands.'),
      DRUGS,
    ],
    avoid: [tx('Nelle isole abitate niente bikini fuori dalle "bikini beach" e vestiti coprenti.', 'On inhabited islands no bikinis outside "bikini beaches" and dress modestly.')],
    periods: [ramadan()],
  },

  TW: {
    meals: {
      breakfast: '6:30–9:00',
      lunch: '11:30–13:30',
      dinner: '17:30–20:00',
      note: tx('La colazione si fa nei "breakfast shop" di quartiere; la sera si va ai mercati notturni.', 'Breakfast is eaten at neighbourhood "breakfast shops"; in the evening people go to night markets.'),
    },
    tipping: tx('Non si usa: al ristorante spesso c\'è il 10% di servizio nel conto.', 'Not customary: restaurants often add a 10% service charge.'),
    law: [
      tx('Vietato mangiare, bere (anche acqua) e masticare gomme in metropolitana: multe salate.', 'No eating, drinking (even water) or chewing gum on the metro: hefty fines.'),
      DRUGS,
    ],
    avoid: [
      tx('Non regalare orologi (evocano la morte) né oggetti in gruppi di quattro: il 4 porta sfortuna.', "Don't give clocks (they evoke death) or anything in fours: 4 is unlucky."),
      tx('Bacchette dritte nel riso: richiamano i funerali.', 'Chopsticks upright in rice: they recall funerals.'),
    ],
    local: [
      tx('I camion della spazzatura suonano una melodia (Per Elisa): la gente scende a buttare i sacchi.', 'Garbage trucks play a tune (Für Elise): people come down to throw their bags in.'),
      tx('Per i mezzi e i negozi si usa la EasyCard, ricaricabile nei minimarket.', 'For transport and shops you use the EasyCard, topped up at convenience stores.'),
    ],
    periods: [
      {
        name: tx('Capodanno lunare', 'Lunar New Year'),
        about: tx(
          "L'inizio dell'anno lunare: cenone in famiglia, buste rosse con soldi e visita ai templi.",
          'The start of the lunar year: family reunion dinner, red envelopes with money and temple visits.'
        ),
        when: tx('Fine gennaio o febbraio, data lunare', 'Late January or February, lunar date'),
        note: tx('Treni ad alta velocità esauriti; molti piccoli ristoranti chiudono per alcuni giorni.', 'High-speed trains sold out; many small restaurants close for a few days.'),
        dates: lunarNewYearRanges,
      },
    ],
  },
  HK: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '19:00–21:00', note: tx('Il dim sum si mangia al mattino e a pranzo.', 'Dim sum is eaten in the morning and at lunch.') },
    tipping: tx('Al ristorante il 10% di servizio è già nel conto; si lasciano solo gli spiccioli.', 'Restaurants add a 10% service charge; just leave the small change.'),
    law: [
      tx('Vietato mangiare e bere sulla metropolitana (MTR): multe salate.', 'No eating or drinking on the MTR: hefty fines.'),
      DRUGS,
    ],
    avoid: [tx('Il 4 porta sfortuna: in molti palazzi i piani con il 4 non esistono.', '4 is unlucky: many buildings skip the floors with a 4.')],
    local: [
      tx('Si guida a sinistra e sulle scale mobili si sta a destra.', 'They drive on the left, and you stand on the right on escalators.'),
      tx('Nei locali affollati è normale dividere il tavolo con sconosciuti.', 'In busy places it is normal to share a table with strangers.'),
      tx('Con la carta Octopus paghi mezzi, minimarket e molti negozi.', 'The Octopus card pays for transport, convenience stores and many shops.'),
    ],
    periods: [
      {
        name: tx('Capodanno cinese', 'Chinese New Year'),
        about: tx(
          "L'inizio dell'anno lunare: mercati dei fiori, sfilata, fuochi d'artificio sul porto e buste rosse (lai see).",
          'The start of the lunar year: flower markets, a parade, harbour fireworks and red envelopes (lai see).'
        ),
        when: tx('Fine gennaio o febbraio, data lunare', 'Late January or February, lunar date'),
        note: tx('Tre giorni festivi: molti negozi e ristoranti locali chiusi, attrazioni e centri commerciali aperti e affollati.', 'Three public holidays: many local shops and restaurants close, sights and malls open and crowded.'),
        dates: lunarNewYearRanges,
      },
    ],
  },
  NP: {
    meals: {
      breakfast: '6:00–8:00',
      lunch: '10:00–11:00',
      dinner: '19:00–20:30',
      note: tx('Si fanno due pasti principali di dal bhat, a metà mattina e la sera; nel pomeriggio tè e spuntini.', 'Two main dal bhat meals, mid-morning and evening; tea and snacks in the afternoon.'),
    },
    weekend: tx('Il giorno di riposo è il sabato: la domenica uffici e banche lavorano', 'Saturday is the day off: offices and banks work on Sunday'),
    tipping: tx('10% nei ristoranti turistici (se non già nel conto); a fine trekking mance a guide e portatori.', '10% at tourist restaurants (unless included); at the end of a trek tip guides and porters.'),
    gestures: [LEFT_HAND, HEAD_FEET],
    avoid: [
      tx('Gira attorno a stupa e templi in senso orario.', 'Walk around stupas and temples clockwise.'),
      tx('Non toccare cibo o bicchieri di altri dopo averli portati alla bocca (jutho): sono considerati impuri.', "Don't touch others' food or glasses once they've touched your lips (jutho): it is considered unclean."),
      tx('Nei templi indù spesso non si entra con oggetti di pelle e alcuni sono vietati ai non induisti.', 'Hindu temples often ban leather items, and some are closed to non-Hindus.'),
    ],
    local: [tx('Il saluto è "Namaste" a mani giunte, più che la stretta di mano.', 'The greeting is "Namaste" with palms together, rather than a handshake.')],
    periods: [
      {
        name: tx('Tihar (Festa delle luci)', 'Tihar (Festival of Lights)'),
        about: tx(
          "La versione nepalese di Diwali: cinque giorni in cui si onorano corvi, cani, mucche e la dea Lakshmi, con lumini e ghirlande.",
          "Nepal's Diwali: five days honouring crows, dogs, cows and the goddess Lakshmi, with oil lamps and garlands."
        ),
        when: tx('Ottobre o novembre, data lunare (poche settimane dopo il Dashain, la festa più lunga)', 'October or November, lunar date (a few weeks after Dashain, the longest festival)'),
        note: tx('Uffici chiusi e grandi spostamenti; in questo periodo i trekking sono molto frequentati.', 'Offices closed and lots of travel; treks are very busy at this time of year.'),
        dates: (y) => diwaliRanges(y).map(([a, b]): [string, string] => [addDays(a, -2), addDays(b, 2)]),
      },
    ],
  },
  LA: {
    meals: { breakfast: '6:30–8:30', lunch: '11:30–13:00', dinner: '18:00–20:00', note: tx('Si va a dormire presto: in molte città il coprifuoco dei locali è verso le 23.', 'People go to bed early: in many towns venues close around 11 pm.') },
    tipping: tx('Non si usa, ma è apprezzata nei ristoranti turistici e con le guide.', 'Not customary, but appreciated at tourist restaurants and by guides.'),
    law: [
      DRUGS,
      tx('Le relazioni sessuali tra stranieri e laotiani non sposati sono vietate dalla legge.', 'Sexual relations between foreigners and unmarried Lao nationals are prohibited by law.'),
    ],
    gestures: [HEAD_FEET],
    avoid: [
      TEMPLE_DRESS,
      tx('Le donne non devono toccare i monaci né porgergli oggetti direttamente.', 'Women must not touch monks or hand them things directly.'),
      tx(
        'Al Tak Bat (elemosina ai monaci all\'alba) di Luang Prabang stai a distanza, in silenzio e senza flash.',
        "At Luang Prabang's Tak Bat (dawn alms for the monks) keep your distance, stay silent and use no flash."
      ),
    ],
    local: [tx('Il riso glutinoso si mangia con le mani, a palline.', 'Sticky rice is eaten by hand, rolled into balls.')],
    periods: [
      {
        name: tx('Pi Mai (Capodanno laotiano)', 'Pi Mai (Lao New Year)'),
        about: tx("Il capodanno buddista: si lavano le statue di Buddha e ci si bagna a vicenda con l'acqua.", 'The Buddhist New Year: Buddha statues are washed and people splash each other with water.'),
        when: tx('13 – 16 aprile', '13 – 16 April'),
        note: tx('Uscendo ti bagneranno di sicuro: proteggi telefono e documenti. Uffici chiusi.', "You'll get soaked when you go out: protect phone and documents. Offices closed."),
        dates: yearly('04-13', '04-16'),
      },
    ],
  },
  UZ: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '18:30–21:00', note: tx('Il plov si mangia soprattutto a pranzo: la sera spesso è finito.', 'Plov is mostly a lunch dish: by evening it is often sold out.') },
    tipping: tx('Spesso c\'è il 10-15% di servizio nel conto; altrimenti si arrotonda.', 'A 10-15% service charge is often on the bill; otherwise round up.'),
    law: [
      tx(
        'Ogni straniero va registrato entro 3 giorni: lo fanno gli hotel, ma conserva le ricevute fino alla partenza.',
        'Every foreigner must be registered within 3 days: hotels do it, but keep the slips until you leave.'
      ),
      tx('Alcuni farmaci comuni (es. con codeina) sono vietati: porta la ricetta.', 'Some common medicines (e.g. with codeine) are banned: carry your prescription.'),
    ],
    avoid: [
      tx('Il pane (non) è sacro: non va messo capovolto, per terra o buttato.', "Bread (non) is sacred: don't put it upside down, on the ground or throw it away."),
      MOSQUE_DRESS,
    ],
    local: [
      tx('Ci si saluta con la mano destra sul cuore.', 'People greet with their right hand on their heart.'),
      tx('Il tè si versa e si rimette nella teiera tre volte prima di servirlo; la tazza piena a metà è segno di rispetto.', 'Tea is poured and returned to the pot three times before serving; a half-full cup is a sign of respect.'),
    ],
  },

  // ----- Africa -----
  KE: {
    meals: { breakfast: '7:00–9:00', lunch: '13:00–14:00', dinner: '19:00–21:00' },
    tipping: tx('10% al ristorante; ai safari si lascia una mancia a guida e cuoco a fine viaggio.', '10% at restaurants; on safari tip the guide and cook at the end of the trip.'),
    law: [tx('Sacchetti di plastica vietati: vengono sequestrati anche in aeroporto, dal bagaglio.', 'Plastic bags are banned: they are confiscated even from luggage at the airport.')],
    avoid: [tx('Chiedi sempre prima di fotografare le persone, soprattutto i Maasai.', 'Always ask before photographing people, especially the Maasai.')],
    local: [tx('"Pole pole" (piano piano): i tempi sono rilassati.', '"Pole pole" (slowly slowly): the pace is relaxed.')],
  },
  TZ: {
    meals: { breakfast: '7:00–9:00', lunch: '13:00–14:00', dinner: '19:00–21:00' },
    tipping: tx('10% al ristorante; ai safari mance a guida e cuoco.', '10% at restaurants; on safari tips for guide and cook.'),
    law: [tx('Sacchetti di plastica vietati, anche nel bagaglio.', 'Plastic bags are banned, even in luggage.')],
    gestures: [LEFT_HAND],
    avoid: [tx('A Zanzibar, musulmana, vestiti coprenti fuori dalle spiagge.', 'In Muslim Zanzibar dress modestly away from the beach.')],
    local: [tx('"Pole pole" (piano piano): i tempi sono rilassati.', '"Pole pole" (slowly slowly): the pace is relaxed.')],
    periods: [ramadan(tx('Si sente soprattutto a Zanzibar.', 'Felt mostly in Zanzibar.'))],
  },
  ZA: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '18:00–20:00' },
    tipping: tx('10-15% al ristorante; qualche moneta ai "car guard" che sorvegliano l\'auto.', '10-15% at restaurants; a few coins for the "car guards" watching your car.'),
    local: [tx('Si guida a sinistra.', 'They drive on the left.'), tx('Il braai (grigliata) è un rito sociale del weekend.', 'The braai (barbecue) is a weekend social ritual.')],
  },
  MG: {
    meals: { breakfast: '6:00–8:00', lunch: '12:00–13:00', dinner: '19:00–20:00', note: tx('Il riso si mangia a ogni pasto.', 'Rice is eaten at every meal.') },
    tipping: tx('Apprezzata, soprattutto per guide e autisti.', 'Appreciated, especially for guides and drivers.'),
    avoid: [
      tx(
        'Esistono i "fady", tabù locali che cambiano da villaggio a villaggio (es. indicare le tombe col dito): chiedi alla guida.',
        'There are "fady", local taboos that change from village to village (e.g. pointing at tombs): ask your guide.'
      ),
    ],
    local: [tx('Per indicare si usa il dito piegato, non teso.', 'People point with a bent finger, not a straight one.')],
  },
  ET: {
    meals: {
      breakfast: '7:00–9:00',
      lunch: '12:00–14:00',
      dinner: '19:00–21:00',
      note: tx('Il mercoledì e il venerdì molti mangiano "di digiuno" (vegano).', 'On Wednesdays and Fridays many eat "fasting" (vegan) food.'),
    },
    tipping: tx('10% al ristorante e piccole mance per le guide.', '10% at restaurants and small tips for guides.'),
    gestures: [LEFT_HAND],
    local: [
      tx(
        'L\'orologio etiope conta le ore dall\'alba: le "3" sono le nostre 9 del mattino. Chiedi sempre se l\'orario è "farenji" (straniero).',
        'The Ethiopian clock counts from dawn: "3 o\'clock" is our 9 am. Always ask whether a time is "farenji" (foreign).'
      ),
      tx('Imboccarsi a vicenda con l\'injera (gursha) è un gesto di amicizia.', 'Feeding each other with injera (gursha) is a gesture of friendship.'),
    ],
  },

  GH: {
    meals: { breakfast: '6:30–8:30', lunch: '12:00–14:00', dinner: '18:30–20:30' },
    tipping: tx('Circa 10% al ristorante, se non già incluso; piccole mance a guide e facchini.', 'Around 10% at restaurants unless included; small tips for guides and porters.'),
    gestures: [LEFT_HAND],
    avoid: [
      tx('Saluta sempre prima di chiedere qualcosa: andare dritti al punto è scortese.', 'Always greet before asking for something: getting straight to the point is rude.'),
      tx('Chiedi prima di fotografare persone, mercati ed edifici pubblici.', 'Ask before photographing people, markets and public buildings.'),
    ],
    local: [
      tx('Molti hanno il nome del giorno della settimana in cui sono nati (Kofi = venerdì, Kwame = sabato).', 'Many people are named after the weekday they were born on (Kofi = Friday, Kwame = Saturday).'),
      tx('"Akwaaba" (benvenuto) lo sentirai spesso: l\'ospitalità è molto calorosa.', 'You\'ll often hear "Akwaaba" (welcome): hospitality is very warm.'),
    ],
  },
  SN: {
    meals: { breakfast: '7:00–9:00', lunch: '13:30–15:00', dinner: '20:00–22:00', note: tx('Il pasto principale è il pranzo, spesso mangiato tutti dallo stesso piatto.', 'Lunch is the main meal, often eaten by everyone from the same platter.') },
    tipping: tx('Non obbligatoria: 5-10% al ristorante e piccole mance alle guide.', 'Not required: 5-10% at restaurants and small tips for guides.'),
    gestures: [LEFT_HAND],
    avoid: [tx('Chiedi sempre prima di fotografare le persone.', 'Always ask before photographing people.'), MODEST_DRESS],
    local: [
      tx('"Teranga" è l\'ospitalità senegalese: è normale essere invitati a mangiare.', '"Teranga" is Senegalese hospitality: being invited to eat is normal.'),
      tx('Il tè (attaya) si beve in tre giri, dal più amaro al più dolce: andarsene prima è scortese.', 'Tea (attaya) is served in three rounds, from bitter to sweet: leaving early is rude.'),
      tx('Il venerdì verso le 14 molte attività si fermano per la preghiera.', 'On Fridays around 2 pm many businesses stop for prayers.'),
    ],
    periods: [ramadan()],
  },
  RW: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '19:00–21:00' },
    tipping: tx('Non attesa, ma apprezzata: 5-10% al ristorante, mance a guide e ranger.', 'Not expected but appreciated: 5-10% at restaurants, tips for guides and rangers.'),
    law: [tx('Sacchetti di plastica vietati: vengono sequestrati anche dal bagaglio in aeroporto.', 'Plastic bags are banned: they are confiscated even from luggage at the airport.')],
    avoid: [
      tx('Non parlare di etnie (hutu, tutsi): è un tabù e la legge punisce il "divisionismo".', "Don't talk about ethnicity (Hutu, Tutsi): it's taboo and the law punishes \"divisionism\"."),
      tx('Chiedi prima di fotografare persone ed edifici pubblici.', 'Ask before photographing people and public buildings.'),
    ],
    local: [
      tx(
        "L'ultimo sabato del mese c'è l'Umuganda: dalle 8 alle 11 lavori comunitari, traffico fermo e negozi chiusi.",
        'On the last Saturday of the month there is Umuganda: community work from 8 to 11 am, traffic stops and shops close.'
      ),
      tx('Le strade sono pulitissime e il paese è molto ordinato.', 'Streets are spotless and the country is very orderly.'),
    ],
  },
  UG: {
    meals: { breakfast: '7:00–9:00', lunch: '13:00–14:30', dinner: '19:00–21:00' },
    tipping: tx('10% al ristorante; ai safari e al trekking dei gorilla mance a guide, ranger e portatori.', '10% at restaurants; on safari and gorilla treks tip guides, rangers and porters.'),
    law: [
      tx('Le relazioni omosessuali sono punite con pene molto pesanti.', 'Same-sex relations are punished very severely.'),
      tx('Vietato fotografare militari, polizia e edifici governativi.', 'Photographing soldiers, police and government buildings is forbidden.'),
    ],
    gestures: [LEFT_HAND],
    local: [
      tx('Si guida a sinistra.', 'They drive on the left.'),
      tx('Il "rolex" non è un orologio: è uno spuntino di chapati arrotolato con la frittata.', 'A "rolex" is not a watch: it\'s a snack of chapati rolled with an omelette.'),
    ],
  },
  NA: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '18:30–20:30' },
    tipping: tx('10% al ristorante; qualche moneta ai benzinai che servono e ai "car guard".', '10% at restaurants; a few coins for petrol attendants and "car guards".'),
    law: [tx('Nei parchi (Etosha) non si scende dall\'auto fuori dalle aree recintate.', "In parks (Etosha) you don't get out of the car outside fenced areas.")],
    avoid: [tx('Chiedi prima di fotografare le persone, soprattutto gli Himba: spesso si concorda un compenso.', 'Ask before photographing people, especially the Himba: a fee is often agreed.')],
    local: [
      tx('Si guida a sinistra, spesso su sterrato: distanze enormi tra un distributore e l\'altro.', 'They drive on the left, often on gravel: huge distances between petrol stations.'),
      tx('Il tedesco è ancora parlato e lo trovi in cucina e nei nomi delle città.', 'German is still spoken and shows up in the food and town names.'),
    ],
  },

  // ----- Oceania -----
  AU: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '18:00–20:00' },
    tipping: tx('Non necessaria: si arrotonda se si vuole.', 'Not needed: round up if you like.'),
    law: [
      tx(
        'Controlli molto severi su cibo, semi e prodotti animali all\'arrivo: dichiara tutto o rischi multe alte.',
        'Very strict checks on food, seeds and animal products on arrival: declare everything or risk heavy fines.'
      ),
    ],
    local: [tx('Si guida a sinistra.', 'They drive on the left.')],
  },
  NZ: {
    meals: { breakfast: '7:00–9:00', lunch: '12:00–14:00', dinner: '18:00–20:00' },
    tipping: tx('Non necessaria.', 'Not needed.'),
    law: [
      tx(
        'Controlli molto severi su cibo e prodotti naturali all\'arrivo: dichiara tutto o paghi una multa immediata.',
        'Very strict checks on food and natural products on arrival: declare everything or pay an on-the-spot fine.'
      ),
    ],
    local: [tx('Si guida a sinistra.', 'They drive on the left.'), tx('Il saluto maori hongi si fa toccando naso e fronte.', 'The Māori hongi greeting is done by pressing nose and forehead.')],
  },
};

// ---------------------------------------------------------------------------
// Cosa succede nei giorni di festa
// ---------------------------------------------------------------------------

const CLOSED_LIKE_SUNDAY = tx(
  'Come la domenica: chiudono quasi tutti i negozi, supermercati compresi (aperti solo in stazioni, aeroporti e benzinai). Ristoranti, musei e attrazioni in genere aperti. Fai la spesa il giorno prima.',
  'Like a Sunday: almost all shops close, supermarkets included (open only at stations, airports and petrol stations). Restaurants, museums and sights are usually open. Shop the day before.'
);
const SHOPS_CLOSED_FOOD_OPEN = tx(
  'Negozi e uffici chiusi; bar e ristoranti per lo più aperti.',
  'Shops and offices closed; bars and restaurants mostly open.'
);
const OFFICES_CLOSED = tx(
  'Chiudono uffici pubblici e banche; negozi e ristoranti restano in gran parte aperti.',
  'Government offices and banks close; shops and restaurants mostly stay open.'
);
const NORDIC = tx(
  'Come la domenica: molti negozi chiusi o con orari ridotti. A Natale (soprattutto il 24) e a Mezza estate si ferma quasi tutto.',
  'Like a Sunday: many shops closed or on short hours. At Christmas (especially the 24th) and Midsummer almost everything stops.'
);
const EID = tx(
  'Alle feste nazionali chiudono uffici e banche. All\'Eid molte attività restano chiuse per 2-3 giorni e i trasporti sono pieni; i luoghi turistici restano aperti.',
  'On national holidays offices and banks close. At Eid many businesses stay closed for 2-3 days and transport is packed; tourist places stay open.'
);
const BALTIC = tx(
  'Negozi e supermercati in genere aperti, uffici chiusi. A Mezza estate (23-24 giugno) e a Natale chiude quasi tutto.',
  'Shops and supermarkets usually open, offices closed. At Midsummer (23-24 June) and Christmas almost everything closes.'
);
const SURCHARGE = tx(
  'Molti negozi aprono, ma caffè e ristoranti possono applicare un sovrapprezzo festivo del 10-15%. A Natale, Venerdì Santo e Anzac Day (mattina) chiude quasi tutto.',
  'Many shops open, but cafés and restaurants may add a 10-15% public holiday surcharge. On Christmas, Good Friday and Anzac Day (morning) almost everything closes.'
);

export const HOLIDAY_NOTES: Record<string, LocalText> = {
  ES: tx(
    'Negozi e uffici chiusi; bar e ristoranti aperti. Nelle zone turistiche alcuni negozi restano aperti. Ogni città ha anche 1-2 feste patronali proprie.',
    'Shops and offices closed; bars and restaurants open. In tourist areas some shops stay open. Each town also has 1-2 local patron saint days.'
  ),
  FR: tx(
    'Molti negozi chiusi, ma boulangerie, bar e ristoranti in genere aperti; musei spesso aperti (quasi tutti chiusi il 1° maggio e a Natale).',
    'Many shops closed, but bakeries, bars and restaurants usually open; museums often open (almost all closed on 1 May and Christmas).'
  ),
  PT: SHOPS_CLOSED_FOOD_OPEN,
  GR: tx(
    'Negozi chiusi, taverne aperte. Siti archeologici e musei chiusi a Natale, 25 marzo, Pasqua ortodossa e 1° maggio.',
    'Shops closed, tavernas open. Archaeological sites and museums closed at Christmas, 25 March, Orthodox Easter and 1 May.'
  ),
  HR: tx(
    'Per legge i negozi chiudono nei festivi e quasi tutte le domeniche; bar e ristoranti aperti.',
    'By law shops close on public holidays and most Sundays; bars and restaurants open.'
  ),
  DE: CLOSED_LIKE_SUNDAY,
  AT: CLOSED_LIKE_SUNDAY,
  CH: CLOSED_LIKE_SUNDAY,
  GB: tx(
    'Nei "bank holiday" banche e uffici chiusi, negozi in genere aperti con orari ridotti. Il 25 dicembre chiude quasi tutto e a Londra si fermano i mezzi pubblici.',
    'On bank holidays banks and offices close, shops usually open on reduced hours. On 25 December almost everything closes and London public transport stops.'
  ),
  IE: tx(
    'Negozi e pub in genere aperti con orari ridotti; banche e uffici chiusi. A Natale chiude quasi tutto.',
    'Shops and pubs usually open on reduced hours; banks and offices closed. At Christmas almost everything closes.'
  ),
  NL: tx(
    'Nelle città molti negozi aprono con orari domenicali; musei aperti. A Natale chiude quasi tutto.',
    'In cities many shops open on Sunday hours; museums open. At Christmas almost everything closes.'
  ),
  BE: SHOPS_CLOSED_FOOD_OPEN,
  CZ: tx(
    'Per legge i negozi più grandi chiudono a Capodanno, Pasquetta, 8 maggio, 28 settembre, 28 ottobre e Natale; i piccoli possono aprire.',
    'By law larger shops close on New Year, Easter Monday, 8 May, 28 September, 28 October and Christmas; small ones may open.'
  ),
  HU: SHOPS_CLOSED_FOOD_OPEN,
  PL: tx(
    'Per legge i negozi chiudono nei festivi, come quasi tutte le domeniche; ristoranti aperti.',
    'By law shops close on public holidays, as on most Sundays; restaurants open.'
  ),
  BG: OFFICES_CLOSED,
  RO: OFFICES_CLOSED,
  RS: OFFICES_CLOSED,
  AL: OFFICES_CLOSED,
  NO: NORDIC,
  SE: NORDIC,
  DK: NORDIC,
  FI: NORDIC,
  IS: NORDIC,
  TR: tx(
    'Negozi in gran parte aperti. Durante i bayram (fine Ramadan e Festa del sacrificio) uffici chiusi e grandi spostamenti; il Gran Bazar chiude nelle feste religiose.',
    'Shops mostly open. During the bayrams (end of Ramadan and Feast of Sacrifice) offices close and people travel en masse; the Grand Bazaar closes on religious holidays.'
  ),
  MA: EID,
  EG: EID,
  TN: EID,
  JO: EID,
  AE: EID,
  MV: EID,
  MY: EID,
  IL: tx(
    'Nelle feste ebraiche vale come lo Shabbat: mezzi pubblici fermi, negozi e molti ristoranti chiusi dalla sera prima.',
    'Jewish holidays work like Shabbat: public transport stops, shops and many restaurants close from the evening before.'
  ),
  US: tx(
    'Negozi aperti (molte feste sono giorni di saldi); chiusi banche, poste e uffici pubblici. A Thanksgiving e Natale chiude quasi tutto.',
    'Shops open (many holidays are sales days); banks, post offices and government closed. At Thanksgiving and Christmas almost everything closes.'
  ),
  CA: tx(
    'Banche e uffici chiusi; negozi aperti o con orari ridotti a seconda della provincia. A Natale chiude quasi tutto.',
    'Banks and offices closed; shops open or on reduced hours depending on the province. At Christmas almost everything closes.'
  ),
  MX: OFFICES_CLOSED,
  CU: OFFICES_CLOSED,
  BR: tx(
    'Banche e uffici chiusi; centri commerciali e ristoranti aperti, spiagge affollate.',
    'Banks and offices closed; malls and restaurants open, beaches crowded.'
  ),
  AR: tx(
    'Le feste spesso si spostano al lunedì per fare un ponte ("feriado puente"): viaggi interni e autobus pieni.',
    'Holidays are often moved to Monday for a long weekend ("feriado puente"): domestic travel and buses are packed.'
  ),
  PE: OFFICES_CLOSED,
  JP: tx(
    'Negozi e ristoranti aperti; i musei aprono ma spesso chiudono il giorno dopo. Treni e luoghi turistici molto affollati.',
    'Shops and restaurants open; museums open but often close the day after. Trains and sights very crowded.'
  ),
  CN: tx(
    'Negozi e ristoranti aperti, uffici chiusi. Per allungare le feste il governo sposta i giorni lavorativi: alcuni sabati e domeniche diventano lavorativi.',
    'Shops and restaurants open, offices closed. To lengthen holidays the government swaps working days: some Saturdays and Sundays become working days.'
  ),
  KR: tx(
    'Quasi tutto aperto, tranne a Seollal e Chuseok, quando chiudono molti negozi e ristoranti (i palazzi reali restano aperti).',
    'Almost everything open, except at Seollal and Chuseok, when many shops and restaurants close (royal palaces stay open).'
  ),
  TH: tx(
    'Negozi e ristoranti aperti; uffici e banche chiusi. Nei giorni festivi buddisti non si vende alcol.',
    'Shops and restaurants open; offices and banks closed. On Buddhist holy days alcohol is not sold.'
  ),
  VN: tx(
    'Quasi tutto aperto, tranne durante il Tết, quando molti negozi chiudono per una settimana.',
    'Almost everything open, except during Tết, when many shops close for a week.'
  ),
  KH: OFFICES_CLOSED,
  ID: OFFICES_CLOSED,
  SG: tx('Negozi, hawker centre e attrazioni restano aperti.', 'Shops, hawker centres and attractions stay open.'),
  PH: OFFICES_CLOSED,
  IN: tx(
    'Uffici e banche chiusi, negozi in parte aperti. In molti stati nelle feste nazionali (26 gennaio, 15 agosto, 2 ottobre) non si vende alcol ("dry day").',
    'Offices and banks closed, shops partly open. In many states no alcohol is sold on national holidays (26 January, 15 August, 2 October): "dry days".'
  ),
  LK: tx('Uffici chiusi; nei giorni di luna piena (Poya) niente alcol.', 'Offices closed; no alcohol on full-moon (Poya) days.'),
  KE: OFFICES_CLOSED,
  TZ: OFFICES_CLOSED,
  ZA: OFFICES_CLOSED,
  MG: OFFICES_CLOSED,
  ET: OFFICES_CLOSED,
  AU: SURCHARGE,
  NZ: SURCHARGE,
  EE: BALTIC,
  LV: BALTIC,
  LT: BALTIC,
  MD: OFFICES_CLOSED,
  OM: EID,
  QA: EID,
  CO: tx(
    'Molte feste si spostano al lunedì ("puente festivo"): weekend lunghi con strade, bus e località turistiche pieni.',
    'Many holidays move to Monday ("puente festivo"): long weekends with packed roads, buses and resorts.'
  ),
  CL: OFFICES_CLOSED,
  EC: OFFICES_CLOSED,
  BO: OFFICES_CLOSED,
  UY: SHOPS_CLOSED_FOOD_OPEN,
  TW: tx(
    'Negozi e ristoranti aperti, uffici chiusi. Al Capodanno lunare molti piccoli locali chiudono per qualche giorno.',
    'Shops and restaurants open, offices closed. At Lunar New Year many small places close for a few days.'
  ),
  HK: tx(
    'Negozi, centri commerciali e attrazioni aperti; banche e uffici chiusi. Al Capodanno cinese chiudono molti negozi locali.',
    'Shops, malls and sights open; banks and offices closed. At Chinese New Year many local shops close.'
  ),
  NP: OFFICES_CLOSED,
  LA: OFFICES_CLOSED,
  UZ: OFFICES_CLOSED,
  GH: OFFICES_CLOSED,
  SN: EID,
  RW: OFFICES_CLOSED,
  UG: OFFICES_CLOSED,
  NA: OFFICES_CLOSED,
};

/**
 * Paesi piccoli senza voce propria che seguono le usanze di un vicino (stessa lingua e abitudini):
 * la scheda mostra quelle del paese indicato, con una nota.
 */
export const CUSTOMS_LIKE: Record<string, string> = {
  MC: 'FR',
  AD: 'ES',
  LI: 'CH',
  FO: 'DK',
  AX: 'FI',
};

/** Vero se un periodo cade (anche in parte) tra le date del viaggio. Si guarda anche l'anno prima,
 *  per i periodi a cavallo di Capodanno (es. Shōgatsu o un Ramadan iniziato a dicembre). */
export const periodOverlaps = (period: CustomsPeriod, start: string | null, end: string | null): boolean => {
  if (!start || !period.dates) return false;
  const last = end ?? start;
  for (let y = Number(start.slice(0, 4)) - 1; y <= Number(last.slice(0, 4)); y++) {
    if (period.dates(y).some(([a, b]) => a <= last && b >= start)) return true;
  }
  return false;
};
