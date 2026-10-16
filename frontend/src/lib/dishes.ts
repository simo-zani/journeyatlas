import type { LocalText } from '@/lib/customs';

/**
 * Piatti tipici per paese, per la scheda "Usanze" di Info Paese: nome locale e due righe su cosa sono.
 * Dati curati a mano (ottobre 2026), sugli stessi paesi di CUSTOMS.
 */

export interface Dish {
  /** Nome con cui lo trovi nei menu (traslitterato se l'alfabeto è diverso). */
  name: string;
  about: LocalText;
}

const d = (name: string, it: string, en: string): Dish => ({ name, about: { it, en } });

export const DISHES: Record<string, Dish[]> = {
  // ----- Europa -----
  ES: [
    d('Paella', 'Riso cotto in padella larga con zafferano, carne o pesce: quella valenciana ha pollo, coniglio e fagioli.', 'Rice cooked in a wide pan with saffron and meat or seafood: the Valencian one has chicken, rabbit and beans.'),
    d('Tortilla de patatas', 'Frittata alta di patate e uova (con o senza cipolla), servita a spicchi anche come tapa.', 'Thick potato and egg omelette (with or without onion), served in wedges, often as a tapa.'),
    d('Jamón ibérico', 'Prosciutto crudo di maiale iberico stagionato a lungo, tagliato a mano.', 'Long-cured ham from Iberian pigs, carved by hand.'),
    d('Gazpacho', 'Zuppa fredda di pomodoro, peperone, cetriolo e aglio, tipica dell\'estate andalusa.', 'Cold soup of tomato, pepper, cucumber and garlic, an Andalusian summer staple.'),
    d('Churros con chocolate', 'Bastoncini di pasta fritta da intingere nella cioccolata calda densa, a colazione o a fine serata.', 'Fried dough sticks dipped in thick hot chocolate, for breakfast or after a night out.'),
  ],
  FR: [
    d('Croissant', 'Cornetto di pasta sfoglia al burro, senza ripieno: la colazione classica con un café.', 'Flaky butter pastry with no filling: the classic breakfast with a café.'),
    d('Bœuf bourguignon', 'Spezzatino di manzo cotto a lungo nel vino rosso di Borgogna con funghi e cipolline.', 'Beef stew slowly braised in Burgundy red wine with mushrooms and pearl onions.'),
    d('Croque-monsieur', 'Toast caldo di prosciutto cotto e formaggio con besciamella gratinata (con l\'uovo è croque-madame).', 'Hot ham and cheese sandwich topped with grilled béchamel (with an egg it is a croque-madame).'),
    d('Ratatouille', 'Verdure provenzali stufate: melanzane, zucchine, peperoni e pomodoro.', 'Provençal stewed vegetables: aubergine, courgette, peppers and tomato.'),
    d('Crêpe', 'Sottile frittella dolce o salata (in Bretagna la galette di grano saraceno).', 'Thin sweet or savoury pancake (in Brittany the buckwheat galette).'),
  ],
  PT: [
    d('Bacalhau à Brás', 'Baccalà sfilacciato con patate fiammifero, cipolla e uova strapazzate.', 'Shredded salt cod with matchstick potatoes, onion and scrambled eggs.'),
    d('Pastel de nata', 'Tartelletta di sfoglia con crema all\'uovo caramellata, da gustare con cannella.', 'Puff pastry tart with caramelised egg custard, eaten with cinnamon.'),
    d('Francesinha', 'Panino di Porto farcito di carni, coperto di formaggio fuso e salsa piccante alla birra.', 'Porto sandwich stuffed with meats, covered in melted cheese and a spicy beer sauce.'),
    d('Sardinhas assadas', 'Sardine alla griglia, regine delle feste di giugno a Lisbona.', 'Grilled sardines, the stars of Lisbon\'s June festivals.'),
  ],
  GR: [
    d('Moussaka', 'Sformato di melanzane e carne macinata speziata coperto di besciamella.', 'Bake of aubergine and spiced minced meat topped with béchamel.'),
    d('Souvlaki / Gyros', 'Spiedini o carne allo spiedo verticale nella pita con tzatziki, pomodoro e patatine.', 'Skewers or spit-roasted meat in pita with tzatziki, tomato and fries.'),
    d('Choriatiki', 'L\'insalata greca: pomodoro, cetriolo, cipolla, olive e una fetta di feta.', 'Greek salad: tomato, cucumber, onion, olives and a slab of feta.'),
    d('Spanakopita', 'Torta salata di pasta fillo con spinaci e feta.', 'Filo pastry pie with spinach and feta.'),
    d('Loukoumades', 'Frittelline dorate bagnate nel miele e cosparse di cannella.', 'Golden fried dough balls soaked in honey and dusted with cinnamon.'),
  ],
  HR: [
    d('Peka', 'Carne o polpo cotti lentamente sotto una campana di ferro coperta di brace (va prenotata).', 'Meat or octopus slow-cooked under an iron bell covered in embers (order ahead).'),
    d('Crni rižot', 'Risotto nero al nero di seppia, tipico della costa dalmata.', 'Black risotto with cuttlefish ink, typical of the Dalmatian coast.'),
    d('Ćevapi', 'Salsicciotti di carne macinata alla griglia con pane, cipolla e ajvar.', 'Grilled minced-meat sausages with flatbread, onion and ajvar.'),
    d('Štrukli', 'Pasta ripiena di formaggio fresco, bollita o gratinata, tipica di Zagabria.', 'Dough filled with fresh cheese, boiled or baked, from Zagreb.'),
  ],
  DE: [
    d('Bratwurst', 'Salsiccia alla griglia servita con senape e pane o crauti.', 'Grilled sausage served with mustard and bread or sauerkraut.'),
    d('Schweinshaxe', 'Stinco di maiale arrosto con la cotenna croccante, tipico della Baviera.', 'Roast pork knuckle with crackling skin, a Bavarian classic.'),
    d('Currywurst', 'Würstel a fette con ketchup al curry, lo street food di Berlino.', 'Sliced sausage with curry ketchup, Berlin\'s street food.'),
    d('Brezel', 'Ciambella intrecciata di pane salato con la crosta lucida.', 'Twisted salted bread with a glossy crust.'),
    d('Schwarzwälder Kirschtorte', 'Torta Foresta Nera: cioccolato, panna, ciliegie e kirsch.', 'Black Forest cake: chocolate, cream, cherries and kirsch.'),
  ],
  AT: [
    d('Wiener Schnitzel', 'Cotoletta di vitello sottile e impanata, servita con limone e insalata di patate.', 'Thin breaded veal cutlet, served with lemon and potato salad.'),
    d('Tafelspitz', 'Bollito di manzo servito nel suo brodo con salsa di mele e rafano.', 'Boiled beef served in its broth with apple and horseradish sauce.'),
    d('Apfelstrudel', 'Sfoglia sottilissima arrotolata con mele, uvetta e cannella.', 'Paper-thin pastry rolled with apples, raisins and cinnamon.'),
    d('Sachertorte', 'Torta al cioccolato con confettura di albicocca, con panna montata a parte.', 'Chocolate cake with apricot jam, served with whipped cream on the side.'),
  ],
  CH: [
    d('Fondue', 'Formaggi fusi con vino bianco in cui intingere pezzi di pane con lunghe forchette.', 'Cheese melted with white wine, for dipping bread on long forks.'),
    d('Raclette', 'Formaggio fuso raschiato sopra patate lesse, cetriolini e cipolline.', 'Melted cheese scraped over boiled potatoes, gherkins and pickled onions.'),
    d('Rösti', 'Tortino croccante di patate grattugiate cotte in padella.', 'Crispy pan-fried cake of grated potatoes.'),
    d('Zürcher Geschnetzeltes', 'Straccetti di vitello in salsa di panna e funghi, con il rösti.', 'Sliced veal in a cream and mushroom sauce, served with rösti.'),
  ],
  GB: [
    d('Fish and chips', 'Merluzzo o eglefino in pastella fritti con patatone, aceto di malto e piselli.', 'Battered cod or haddock with chunky chips, malt vinegar and mushy peas.'),
    d('Full English breakfast', 'Colazione salata: uova, bacon, salsicce, fagioli, funghi, pomodoro e toast.', 'Savoury breakfast: eggs, bacon, sausages, beans, mushrooms, tomato and toast.'),
    d('Sunday roast', 'Arrosto della domenica con patate, verdure, Yorkshire pudding e gravy.', 'Sunday roast with potatoes, vegetables, Yorkshire pudding and gravy.'),
    d('Shepherd\'s pie', 'Pasticcio di carne macinata coperto di purè gratinato.', 'Minced meat pie topped with baked mashed potato.'),
    d('Scones', 'Panini dolci con clotted cream e marmellata, per il tè del pomeriggio.', 'Small sweet breads with clotted cream and jam, for afternoon tea.'),
  ],
  IE: [
    d('Irish stew', 'Stufato di agnello o montone con patate, carote e cipolle.', 'Lamb or mutton stew with potatoes, carrots and onions.'),
    d('Soda bread', 'Pane lievitato col bicarbonato al posto del lievito, servito con burro.', 'Bread leavened with baking soda instead of yeast, served with butter.'),
    d('Seafood chowder', 'Zuppa cremosa di pesce e frutti di mare.', 'Creamy fish and shellfish soup.'),
    d('Boxty', 'Frittella di patate grattugiate e purè, spesso farcita.', 'Pancake of grated and mashed potato, often filled.'),
  ],
  NL: [
    d('Stroopwafel', 'Due cialde sottili con caramello in mezzo, da scaldare sopra la tazza.', 'Two thin waffles with caramel in between, warmed over your cup.'),
    d('Haring', 'Aringa cruda in salamoia con cipolla, mangiata tenendola per la coda.', 'Raw brined herring with onion, eaten holding it by the tail.'),
    d('Bitterballen', 'Polpettine fritte di ragù di manzo da intingere nella senape, con la birra.', 'Fried beef ragout balls dipped in mustard, eaten with beer.'),
    d('Stamppot', 'Purè di patate schiacciato con verdure (cavolo, carote) e salsiccia affumicata.', 'Potatoes mashed with vegetables (kale, carrots) and smoked sausage.'),
  ],
  BE: [
    d('Moules-frites', 'Cozze al vapore (spesso al vino o alla birra) con patatine fritte.', 'Steamed mussels (often in wine or beer) with fries.'),
    d('Frites', 'Patatine fritte due volte, servite nel cono con maionese o altre salse.', 'Twice-fried chips served in a cone with mayonnaise or other sauces.'),
    d('Gaufre', 'Waffle: quello di Liegi è denso e caramellato, quello di Bruxelles leggero e rettangolare.', 'Waffle: the Liège one is dense and caramelised, the Brussels one light and rectangular.'),
    d('Carbonade flamande', 'Spezzatino di manzo cotto nella birra scura con cipolle.', 'Beef stew braised in dark beer with onions.'),
  ],
  CZ: [
    d('Svíčková', 'Manzo in salsa cremosa di verdure con knedlíky, panna e mirtilli rossi.', 'Beef in a creamy vegetable sauce with dumplings, cream and cranberries.'),
    d('Guláš', 'Spezzatino di manzo alla paprica servito con i knedlíky (gnocchi di pane).', 'Paprika beef stew served with knedlíky (bread dumplings).'),
    d('Vepřo knedlo zelo', 'Arrosto di maiale con knedlíky e crauti.', 'Roast pork with dumplings and sauerkraut.'),
    d('Trdelník', 'Dolce arrotolato su uno spiedo e cotto alla brace, con zucchero e cannella.', 'Pastry wrapped on a spit and grilled, coated in sugar and cinnamon.'),
  ],
  HU: [
    d('Gulyás', 'Zuppa densa di manzo, patate e paprica: l\'originale del gulasch.', 'Thick soup of beef, potatoes and paprika: the original goulash.'),
    d('Pörkölt / Paprikás', 'Spezzatino alla paprica (con la panna diventa paprikás, spesso di pollo).', 'Paprika stew (with sour cream it becomes paprikás, often with chicken).'),
    d('Lángos', 'Pane fritto coperto di panna acida, formaggio e aglio.', 'Fried flatbread topped with sour cream, cheese and garlic.'),
    d('Dobos torta', 'Torta a strati di pan di Spagna e crema al cioccolato con copertura di caramello.', 'Layered sponge and chocolate cream cake with a caramel top.'),
  ],
  PL: [
    d('Pierogi', 'Ravioli ripieni di patate e formaggio, carne, crauti o frutta.', 'Dumplings filled with potato and cheese, meat, sauerkraut or fruit.'),
    d('Żurek', 'Zuppa acidula di segale fermentata con salsiccia e uovo sodo.', 'Sour fermented rye soup with sausage and boiled egg.'),
    d('Bigos', 'Lo "stufato del cacciatore": crauti e cavolo cotti a lungo con carni miste.', '"Hunter\'s stew": sauerkraut and cabbage slow-cooked with mixed meats.'),
    d('Kotlet schabowy', 'Cotoletta di maiale impanata con patate e insalata di cavolo.', 'Breaded pork cutlet with potatoes and cabbage salad.'),
  ],
  BG: [
    d('Shopska salata', 'Pomodoro, cetriolo, peperone e cipolla coperti di formaggio sirene grattugiato.', 'Tomato, cucumber, pepper and onion under grated sirene cheese.'),
    d('Banitsa', 'Sfoglia ripiena di uova e formaggio, la colazione bulgara.', 'Filo pastry filled with eggs and cheese, the Bulgarian breakfast.'),
    d('Tarator', 'Zuppa fredda di yogurt, cetriolo, aneto e noci.', 'Cold soup of yoghurt, cucumber, dill and walnuts.'),
    d('Kavarma', 'Spezzatino di carne e verdure cotto in tegame di coccio.', 'Meat and vegetable stew cooked in a clay pot.'),
  ],
  RO: [
    d('Sarmale', 'Involtini di foglie di cavolo acido ripieni di carne e riso, con panna acida.', 'Pickled cabbage rolls stuffed with meat and rice, with sour cream.'),
    d('Mici', 'Salsicciotti di carne mista alla griglia, senza budello, con senape.', 'Grilled skinless mixed-meat rolls, served with mustard.'),
    d('Mămăligă', 'Polenta servita con formaggio, panna acida e a volte un uovo.', 'Polenta served with cheese, sour cream and sometimes an egg.'),
    d('Papanași', 'Ciambelle fritte di formaggio fresco con panna acida e marmellata.', 'Fried fresh-cheese doughnuts with sour cream and jam.'),
  ],
  RS: [
    d('Ćevapi', 'Salsicciotti di carne macinata alla griglia con pane e cipolla cruda.', 'Grilled minced-meat sausages with flatbread and raw onion.'),
    d('Pljeskavica', 'Grande hamburger speziato alla griglia, spesso farcito di formaggio.', 'Large spiced grilled patty, often stuffed with cheese.'),
    d('Sarma', 'Involtini di cavolo acido ripieni di carne e riso.', 'Pickled cabbage rolls stuffed with meat and rice.'),
    d('Kajmak', 'Crema di latte stagionata e salata da spalmare sul pane o sulla carne.', 'Aged salted milk cream spread on bread or meat.'),
  ],
  AL: [
    d('Tavë kosi', 'Agnello al forno con riso coperto da una crema di yogurt e uova.', 'Baked lamb and rice under a yoghurt and egg custard.'),
    d('Byrek', 'Sfoglia ripiena di formaggio, spinaci o carne, venduta ovunque.', 'Filo pie filled with cheese, spinach or meat, sold everywhere.'),
    d('Fërgesë', 'Peperoni, pomodoro e formaggio fresco cotti insieme in tegame.', 'Peppers, tomato and fresh cheese baked together in a pan.'),
    d('Qofte', 'Polpette di carne speziate alla griglia.', 'Spiced grilled meatballs.'),
  ],
  NO: [
    d('Laks', 'Salmone, fresco, affumicato o marinato (gravlaks) con salsa all\'aneto.', 'Salmon, fresh, smoked or cured (gravlaks) with dill sauce.'),
    d('Fårikål', 'Stufato di agnello e cavolo con pepe in grani, il piatto nazionale.', 'Lamb and cabbage stew with whole peppercorns, the national dish.'),
    d('Brunost', 'Formaggio marrone e dolciastro di siero caramellato, a fettine sul pane.', 'Sweetish brown whey cheese, sliced thin on bread.'),
    d('Kjøttkaker', 'Polpette di carne in salsa bruna con patate e mirtilli rossi.', 'Meatballs in brown gravy with potatoes and lingonberries.'),
  ],
  SE: [
    d('Köttbullar', 'Polpettine con purè, salsa alla panna e marmellata di mirtilli rossi.', 'Meatballs with mash, cream gravy and lingonberry jam.'),
    d('Kanelbulle', 'Girella alla cannella e cardamomo, regina della fika (la pausa caffè).', 'Cinnamon and cardamom bun, the star of fika (the coffee break).'),
    d('Gravlax', 'Salmone marinato con sale, zucchero e aneto.', 'Salmon cured with salt, sugar and dill.'),
    d('Smörgås', 'Tartine aperte con gamberetti, uova o aringa.', 'Open sandwiches with prawns, eggs or herring.'),
  ],
  DK: [
    d('Smørrebrød', 'Fetta di pane di segale con sopra aringa, roast beef, uova o gamberetti.', 'Rye bread slice topped with herring, roast beef, eggs or prawns.'),
    d('Stegt flæsk', 'Pancetta di maiale croccante con patate e salsa al prezzemolo.', 'Crispy pork belly with potatoes and parsley sauce.'),
    d('Wienerbrød', 'La "danese": pasta sfoglia dolce con crema, frutta o marzapane.', 'The "Danish": sweet pastry with custard, fruit or marzipan.'),
    d('Pølse', 'Hot dog danese dai chioschi, con cipolla fritta e cetriolini.', 'Danish hot dog from street stands, with crispy onions and pickles.'),
  ],
  FI: [
    d('Karjalanpiirakka', 'Tartellette di segale ripiene di riso, con burro all\'uovo.', 'Rye pastries filled with rice porridge, topped with egg butter.'),
    d('Lohikeitto', 'Zuppa cremosa di salmone, patate e aneto.', 'Creamy soup of salmon, potatoes and dill.'),
    d('Poronkäristys', 'Straccetti di renna saltati con purè e mirtilli rossi.', 'Sautéed reindeer with mash and lingonberries.'),
    d('Korvapuusti', 'Girella alla cannella schiacciata, con la pausa caffè.', 'Flattened cinnamon bun, with coffee.'),
  ],
  IS: [
    d('Kjötsúpa', 'Zuppa di agnello con verdure e rape.', 'Lamb soup with root vegetables.'),
    d('Pylsur', 'Hot dog di agnello con cipolla cruda e fritta e salse dolci.', 'Lamb hot dog with raw and crispy onions and sweet sauces.'),
    d('Skyr', 'Latticino denso e proteico simile allo yogurt, anche nei dolci.', 'Thick, high-protein yoghurt-like dairy, also used in desserts.'),
    d('Plokkfiskur', 'Stufato di pesce bianco e patate, con pane di segale.', 'Mash of white fish and potatoes, with rye bread.'),
  ],

  EE: [
    d('Verivorst', 'Sanguinaccio con orzo servito con crauti e mirtilli rossi, il piatto di Natale.', 'Blood sausage with barley served with sauerkraut and lingonberries, the Christmas dish.'),
    d('Kiluvõileib', 'Tartina di pane nero con spratti marinati, uovo e burro.', 'Black bread open sandwich with marinated sprats, egg and butter.'),
    d('Mulgikapsad', 'Crauti stufati con orzo e maiale.', 'Sauerkraut stewed with barley and pork.'),
    d('Kama', 'Farina di cereali tostati mescolata al kefir o allo yogurt, a colazione o come dolce.', 'Roasted grain flour mixed into kefir or yoghurt, for breakfast or dessert.'),
  ],
  LV: [
    d('Pelēkie zirņi ar speķi', 'Piselli grigi con pancetta e cipolla, il piatto nazionale.', 'Grey peas with bacon and onion, the national dish.'),
    d('Rupjmaize', 'Pane nero di segale scuro e dolciastro, anche nei dolci.', 'Dark, slightly sweet rye bread, also used in desserts.'),
    d('Jāņu siers', 'Formaggio fresco al cumino, il protagonista della festa di Mezza estate.', 'Fresh caraway cheese, the star of the Midsummer festival.'),
    d('Pīrāgi', 'Panini a mezzaluna ripieni di pancetta e cipolla.', 'Crescent-shaped buns filled with bacon and onion.'),
  ],
  LT: [
    d('Cepelinai', 'Grossi gnocchi di patate a forma di dirigibile ripieni di carne, con panna acida e ciccioli.', 'Large zeppelin-shaped potato dumplings filled with meat, with sour cream and cracklings.'),
    d('Šaltibarščiai', 'Zuppa fredda rosa fucsia di barbabietola e kefir, con patate calde a parte.', 'Bright pink cold beetroot and kefir soup, with hot potatoes on the side.'),
    d('Kepta duona', 'Bastoncini di pane nero fritti con aglio, lo snack da birra.', 'Fried black bread sticks with garlic, the beer snack.'),
    d('Šakotis', 'Dolce "ad albero" cotto allo spiedo, colando l\'impasto strato per strato.', '"Tree cake" baked on a spit, pouring the batter layer by layer.'),
  ],
  MD: [
    d('Mămăligă', 'Polenta servita con brânză (formaggio di pecora), panna acida e a volte ciccioli.', 'Polenta served with brânză (sheep cheese), sour cream and sometimes cracklings.'),
    d('Plăcinte', 'Sfoglie ripiene di formaggio, patate, cavolo o zucca, cotte in padella o al forno.', 'Pastries filled with cheese, potato, cabbage or pumpkin, pan-fried or baked.'),
    d('Zeamă', 'Zuppa di pollo acidula con tagliolini fatti in casa e levistico.', 'Sour chicken soup with homemade noodles and lovage.'),
    d('Sarmale', 'Involtini di foglie di cavolo o vite ripieni di carne e riso.', 'Cabbage or vine leaves rolled around meat and rice.'),
  ],

  // ----- Mediterraneo e Medio Oriente -----
  TR: [
    d('Kebap', 'Carne alla griglia in molte versioni: Adana (piccante), şiş, döner, İskender con yogurt.', 'Grilled meat in many styles: Adana (spicy), şiş, döner, İskender with yoghurt.'),
    d('Meze', 'Antipasti da condividere: hummus, melanzane, yogurt all\'aglio, dolma.', 'Shared starters: hummus, aubergine, garlic yoghurt, dolma.'),
    d('Lahmacun', 'Pizza sottile con carne macinata speziata, da arrotolare con prezzemolo e limone.', 'Thin flatbread with spiced minced meat, rolled up with parsley and lemon.'),
    d('Menemen', 'Uova strapazzate con pomodoro e peperoni, per colazione.', 'Eggs scrambled with tomato and peppers, for breakfast.'),
    d('Baklava', 'Strati di pasta fillo con pistacchi o noci bagnati di sciroppo.', 'Layers of filo with pistachios or walnuts soaked in syrup.'),
  ],
  MA: [
    d('Tajine', 'Stufato cotto nel tegame di coccio a cono: pollo con limone e olive, agnello con prugne.', 'Stew cooked in the cone-shaped clay pot: chicken with lemon and olives, lamb with prunes.'),
    d('Couscous', 'Semola cotta al vapore con carne e sette verdure, tradizionalmente il venerdì.', 'Steamed semolina with meat and seven vegetables, traditionally on Fridays.'),
    d('Pastilla', 'Sfoglia ripiena di piccione o pollo e mandorle, dolce e salata con zucchero e cannella.', 'Pastry filled with pigeon or chicken and almonds, sweet and savoury with sugar and cinnamon.'),
    d('Harira', 'Zuppa di pomodoro, lenticchie e ceci, quella che rompe il digiuno del Ramadan.', 'Tomato, lentil and chickpea soup, the one that breaks the Ramadan fast.'),
  ],
  EG: [
    d('Koshari', 'Riso, lenticchie, pasta e ceci con salsa di pomodoro piccante e cipolle fritte.', 'Rice, lentils, pasta and chickpeas with spicy tomato sauce and fried onions.'),
    d('Ful medames', 'Fave stufate con olio, cumino e limone, la colazione di tutti.', 'Stewed fava beans with oil, cumin and lemon, everyone\'s breakfast.'),
    d('Ta\'ameya', 'Falafel egiziani, fatti con le fave invece dei ceci.', 'Egyptian falafel, made with fava beans instead of chickpeas.'),
    d('Molokhia', 'Zuppa verde di foglie di corchorus con aglio, servita con riso o pane.', 'Green jute-leaf soup with garlic, served with rice or bread.'),
  ],
  TN: [
    d('Couscous', 'Semola al vapore con pesce, agnello o verdure in salsa piccante.', 'Steamed semolina with fish, lamb or vegetables in a spicy sauce.'),
    d('Brik', 'Sfoglia sottile fritta ripiena di uovo, tonno e prezzemolo.', 'Thin fried pastry filled with egg, tuna and parsley.'),
    d('Lablabi', 'Zuppa di ceci con aglio, cumino e harissa versata sul pane.', 'Chickpea soup with garlic, cumin and harissa poured over bread.'),
    d('Shakshuka', 'Uova cotte in un sugo di pomodoro e peperoni.', 'Eggs poached in a tomato and pepper sauce.'),
  ],
  AE: [
    d('Machboos', 'Riso speziato con carne o pesce, limone secco e cipolle.', 'Spiced rice with meat or fish, dried lime and onions.'),
    d('Shawarma', 'Carne allo spiedo verticale nel pane arabo con salsa all\'aglio.', 'Spit-roasted meat in flatbread with garlic sauce.'),
    d('Luqaimat', 'Palline fritte croccanti con sciroppo di datteri e sesamo.', 'Crispy fried dumplings with date syrup and sesame.'),
    d('Harees', 'Grano e carne cotti a lungo fino a diventare una crema, tipico del Ramadan.', 'Wheat and meat slow-cooked into a porridge, typical during Ramadan.'),
  ],
  JO: [
    d('Mansaf', 'Agnello cotto nello yogurt secco fermentato (jameed) servito su riso e pane: il piatto nazionale.', 'Lamb cooked in fermented dried yoghurt (jameed) over rice and flatbread: the national dish.'),
    d('Maqluba', 'Riso, verdure e pollo cotti a strati e rovesciati sul piatto al momento di servire.', 'Rice, vegetables and chicken cooked in layers and flipped upside down to serve.'),
    d('Falafel e hummus', 'Polpette fritte di ceci e crema di ceci e tahina, colazione e spuntino.', 'Fried chickpea balls and chickpea-tahini dip, for breakfast or a snack.'),
    d('Knafeh', 'Formaggio filante sotto pasta croccante bagnata di sciroppo.', 'Stretchy cheese under crisp pastry soaked in syrup.'),
  ],
  IL: [
    d('Hummus', 'Crema di ceci e tahina, un pasto a sé con pita, fave o carne.', 'Chickpea and tahini dip, a meal in itself with pita, fava beans or meat.'),
    d('Shakshuka', 'Uova cotte in un sugo piccante di pomodoro e peperoni, a colazione.', 'Eggs poached in a spicy tomato and pepper sauce, for breakfast.'),
    d('Sabich', 'Pita con melanzane fritte, uovo sodo, insalata e tahina.', 'Pita with fried aubergine, boiled egg, salad and tahini.'),
    d('Shawarma', 'Carne allo spiedo verticale (spesso tacchino) nella pita o nel laffa.', 'Spit-roasted meat (often turkey) in pita or laffa.'),
  ],

  OM: [
    d('Shuwa', 'Agnello o capra marinati nelle spezie e cotti per un giorno in una fossa sotto terra, per l\'Eid.', 'Spiced lamb or goat slow-cooked for a day in an underground pit, for Eid.'),
    d('Majboos', 'Riso speziato con pollo o carne e limone secco.', 'Spiced rice with chicken or meat and dried lime.'),
    d('Mashuai', 'Sgombro reale intero alla griglia con riso al limone.', 'Whole grilled kingfish with lemon rice.'),
    d('Halwa omanita', 'Dolce gelatinoso di zucchero, ghee, zafferano e acqua di rose, servito col kahwa.', 'Jelly-like sweet of sugar, ghee, saffron and rosewater, served with kahwa.'),
  ],
  QA: [
    d('Machboos', 'Riso speziato con carne, pollo o pesce, il piatto nazionale.', 'Spiced rice with meat, chicken or fish, the national dish.'),
    d('Harees', 'Grano e carne cotti a lungo fino a diventare una crema, tipico del Ramadan.', 'Wheat and meat slow-cooked into a porridge, typical during Ramadan.'),
    d('Balaleet', 'Vermicelli dolci allo zafferano e cardamomo con frittata sopra, a colazione.', 'Sweet saffron-cardamom vermicelli topped with an omelette, for breakfast.'),
    d('Luqaimat', 'Palline fritte croccanti con sciroppo di datteri.', 'Crispy fried dumplings with date syrup.'),
  ],

  // ----- Americhe -----
  US: [
    d('Burger', 'Hamburger di manzo con formaggio e contorno di patatine.', 'Beef burger with cheese and a side of fries.'),
    d('BBQ', 'Carne affumicata per ore: brisket in Texas, costine a Kansas City e Memphis, maiale sfilacciato al Sud.', 'Meat smoked for hours: brisket in Texas, ribs in Kansas City and Memphis, pulled pork in the South.'),
    d('Pancakes', 'Frittelle alte a colazione, con sciroppo d\'acero, burro o bacon.', 'Fluffy breakfast pancakes with maple syrup, butter or bacon.'),
    d('Clam chowder', 'Zuppa cremosa di vongole e patate, tipica del New England.', 'Creamy clam and potato soup, from New England.'),
    d('Cheesecake', 'Torta di formaggio cremoso su base di biscotto, quella di New York è la più famosa.', 'Cream cheese cake on a biscuit base, the New York one is the most famous.'),
  ],
  CA: [
    d('Poutine', 'Patatine fritte con pezzetti di formaggio cagliato e gravy caldo, nata in Québec.', 'Fries with cheese curds and hot gravy, born in Québec.'),
    d('Butter tart', 'Tartelletta con ripieno di burro, zucchero e sciroppo.', 'Small tart with a butter, sugar and syrup filling.'),
    d('Montreal smoked meat', 'Petto di manzo speziato e affumicato in un panino di segale con senape.', 'Spiced smoked beef brisket on rye with mustard.'),
    d('Nanaimo bar', 'Dolcetto a tre strati senza cottura: biscotto, crema e cioccolato.', 'No-bake three-layer bar: crumb base, custard and chocolate.'),
  ],
  MX: [
    d('Tacos al pastor', 'Tortillas di mais con maiale marinato allo spiedo, ananas, cipolla e coriandolo.', 'Corn tortillas with spit-roasted marinated pork, pineapple, onion and coriander.'),
    d('Mole', 'Salsa densa di peperoncini, spezie, frutta secca e cioccolato, di solito sul pollo.', 'Thick sauce of chillies, spices, nuts and chocolate, usually over chicken.'),
    d('Chilaquiles', 'Triangoli di tortilla fritti nella salsa verde o rossa, con panna e formaggio, a colazione.', 'Fried tortilla chips simmered in green or red salsa, with cream and cheese, for breakfast.'),
    d('Pozole', 'Zuppa di mais bianco e maiale con lattuga, ravanelli e lime.', 'Hominy and pork soup with lettuce, radish and lime.'),
    d('Tamales', 'Impasto di mais ripieno, cotto al vapore nella foglia di mais o banano.', 'Filled corn dough steamed in a corn husk or banana leaf.'),
  ],
  CU: [
    d('Ropa vieja', 'Manzo sfilacciato stufato con pomodoro e peperoni.', 'Shredded beef stewed with tomato and peppers.'),
    d('Moros y cristianos', 'Riso e fagioli neri cotti insieme.', 'Rice and black beans cooked together.'),
    d('Lechón asado', 'Maialino arrosto marinato con agrumi e aglio (mojo).', 'Roast suckling pig marinated in citrus and garlic (mojo).'),
    d('Tostones', 'Fette di platano verde fritte due volte.', 'Twice-fried green plantain slices.'),
  ],
  BR: [
    d('Feijoada', 'Fagioli neri cotti con carni di maiale, serviti con riso, farofa e arancia: il piatto del sabato.', 'Black beans cooked with pork, served with rice, farofa and orange: the Saturday dish.'),
    d('Churrasco', 'Carni alla brace servite al tavolo dagli spiedi nelle churrascarias (rodízio).', 'Grilled meats carved at the table from skewers in churrascarias (rodízio).'),
    d('Pão de queijo', 'Panini soffici al formaggio fatti con farina di manioca.', 'Chewy cheese bread rolls made with cassava flour.'),
    d('Moqueca', 'Stufato di pesce con latte di cocco, peperoni e olio di palma (dendê).', 'Fish stew with coconut milk, peppers and palm oil (dendê).'),
    d('Açaí', 'Purea gelata di bacche di açaí con granola e banana.', 'Frozen açaí berry purée with granola and banana.'),
  ],
  AR: [
    d('Asado', 'Grigliata di tagli di manzo, chorizo e achuras, il rito della domenica.', 'Barbecue of beef cuts, chorizo and offal, the Sunday ritual.'),
    d('Empanadas', 'Fagottini al forno ripieni di carne, formaggio o mais.', 'Baked pastries filled with meat, cheese or corn.'),
    d('Milanesa', 'Cotoletta impanata, anche "a la napolitana" con pomodoro e mozzarella.', 'Breaded cutlet, also "a la napolitana" with tomato and mozzarella.'),
    d('Dulce de leche', 'Crema di latte caramellato, nei dolci e negli alfajores.', 'Caramelised milk spread, in desserts and alfajores.'),
  ],
  PE: [
    d('Ceviche', 'Pesce crudo "cotto" nel succo di lime con cipolla rossa, peperoncino e patata dolce.', 'Raw fish "cooked" in lime juice with red onion, chilli and sweet potato.'),
    d('Lomo saltado', 'Manzo saltato al wok con cipolla, pomodoro e patatine, servito con riso.', 'Wok-fried beef with onion, tomato and fries, served with rice.'),
    d('Ají de gallina', 'Pollo sfilacciato in crema di peperoncino giallo, pane e formaggio.', 'Shredded chicken in a creamy yellow chilli, bread and cheese sauce.'),
    d('Cuy', 'Porcellino d\'India arrosto, piatto tradizionale delle Ande.', 'Roast guinea pig, a traditional Andean dish.'),
  ],

  CO: [
    d('Bandeja paisa', 'Piatto unico enorme: fagioli, riso, carne macinata, chicharrón, uovo, platano e arepa.', 'One huge plate: beans, rice, minced meat, chicharrón, egg, plantain and arepa.'),
    d('Ajiaco', 'Zuppa di pollo e tre tipi di patate con mais e capperi, tipica di Bogotá.', 'Chicken soup with three kinds of potato, corn and capers, from Bogotá.'),
    d('Arepa', 'Focaccina di mais alla piastra, semplice o ripiena di formaggio.', 'Griddled corn cake, plain or filled with cheese.'),
    d('Sancocho', 'Zuppa densa di carne, yuca, platano e mais.', 'Hearty soup of meat, cassava, plantain and corn.'),
  ],
  CL: [
    d('Empanada de pino', 'Fagottino al forno ripieno di carne, cipolla, uovo sodo e oliva.', 'Baked pastry filled with beef, onion, boiled egg and an olive.'),
    d('Pastel de choclo', 'Sformato di carne e pollo coperto da crema di mais dolce gratinata.', 'Meat and chicken bake under a golden sweetcorn crust.'),
    d('Completo', 'Hot dog enorme con avocado, pomodoro e maionese.', 'Giant hot dog with avocado, tomato and mayonnaise.'),
    d('Curanto', 'Frutti di mare, carne e patate cotti in una buca su pietre roventi, a Chiloé.', 'Seafood, meat and potatoes cooked in a pit over hot stones, on Chiloé.'),
  ],
  EC: [
    d('Ceviche ecuatoriano', 'Gamberi in salsa di lime e pomodoro, servito con popcorn e chips di platano.', 'Prawns in a lime-tomato sauce, served with popcorn and plantain chips.'),
    d('Locro de papa', 'Zuppa cremosa di patate e formaggio con avocado.', 'Creamy potato and cheese soup with avocado.'),
    d('Encebollado', 'Zuppa di tonno, yuca e cipolla marinata, rimedio post-serata.', 'Tuna, cassava and pickled onion soup, the hangover cure.'),
    d('Hornado', 'Maiale arrosto con llapingachos (tortini di patate e formaggio).', 'Roast pork with llapingachos (potato and cheese patties).'),
  ],
  BO: [
    d('Salteña', 'Fagottino al forno con ripieno succoso di carne in brodo, a metà mattina.', 'Baked pastry with a juicy meat stew filling, mid-morning.'),
    d('Silpancho', 'Cotoletta sottile su riso e patate, con uovo fritto e salsa di pomodoro.', 'Thin breaded steak over rice and potatoes, with a fried egg and tomato salsa.'),
    d('Pique macho', 'Manzo e salsiccia a pezzi con patatine, peperoncino, uovo e cipolla, da condividere.', 'Chopped beef and sausage over fries with chilli, egg and onion, for sharing.'),
    d('Sopa de maní', 'Zuppa cremosa di arachidi con carne e patatine.', 'Creamy peanut soup with meat and fries.'),
  ],
  UY: [
    d('Chivito', 'Panino enorme con bistecca, prosciutto, formaggio, uovo e verdure.', 'Giant steak sandwich with ham, cheese, egg and vegetables.'),
    d('Asado', 'Grigliata di tagli di manzo e achuras cotti sulla legna.', 'Barbecue of beef cuts and offal grilled over wood.'),
    d('Torta frita', 'Pane fritto da mangiare nei giorni di pioggia, col mate.', 'Fried dough eaten on rainy days, with mate.'),
    d('Postre chajá', 'Dolce di pan di Spagna, meringa, panna e pesche.', 'Dessert of sponge cake, meringue, cream and peaches.'),
  ],

  // ----- Asia -----
  JP: [
    d('Sushi', 'Riso all\'aceto con pesce crudo; al bancone si mangia anche con le mani.', 'Vinegared rice with raw fish; at the counter it\'s fine to eat with your hands.'),
    d('Ramen', 'Spaghetti di grano in brodo (di maiale, soia, miso o sale) con carne e uovo.', 'Wheat noodles in broth (pork, soy, miso or salt) with meat and egg.'),
    d('Tempura', 'Pesce e verdure in pastella leggerissima e fritti.', 'Seafood and vegetables in an ultra-light batter, deep-fried.'),
    d('Okonomiyaki', 'Frittata di cavolo e pastella cotta sulla piastra, con salsa e maionese.', 'Cabbage and batter pancake cooked on a griddle, with sauce and mayo.'),
    d('Onigiri', 'Triangolo di riso con ripieno e alga, lo spuntino dei konbini.', 'Rice triangle with a filling and seaweed, the convenience-store snack.'),
  ],
  CN: [
    d('Anatra laccata (Pechino)', 'Anatra arrosto dalla pelle croccante, in crespelle con cipollotto e salsa hoisin.', 'Roast duck with crisp skin, in pancakes with spring onion and hoisin sauce.'),
    d('Xiaolongbao', 'Ravioli al vapore pieni di brodo: si morde un angolo e si beve prima il brodo.', 'Steamed soup dumplings: bite a corner and sip the broth first.'),
    d('Mapo tofu', 'Tofu in salsa piccante di carne e pepe di Sichuan, che intorpidisce la bocca.', 'Tofu in a spicy meat sauce with mouth-numbing Sichuan pepper.'),
    d('Dim sum', 'Bocconcini al vapore e fritti della tradizione cantonese, col tè.', 'Cantonese steamed and fried small bites, eaten with tea.'),
    d('Hot pot', 'Pentola di brodo bollente al centro del tavolo dove cuocere carne e verdure.', 'A pot of simmering broth at the table to cook meat and vegetables in.'),
  ],
  KR: [
    d('Bibimbap', 'Riso con verdure, carne, uovo e salsa di peperoncino da mescolare.', 'Rice topped with vegetables, meat, egg and chilli paste, mixed together.'),
    d('Korean BBQ', 'Carne (spesso pancetta di maiale) grigliata al tavolo e avvolta nella lattuga.', 'Meat (often pork belly) grilled at the table and wrapped in lettuce.'),
    d('Kimchi', 'Cavolo fermentato piccante, presente a ogni pasto.', 'Spicy fermented cabbage, served at every meal.'),
    d('Tteokbokki', 'Gnocchetti di riso in salsa rossa piccante e dolce, street food.', 'Rice cakes in a sweet-spicy red sauce, street food.'),
    d('Samgyetang', 'Pollo intero ripieno di riso e ginseng in brodo, mangiato in estate.', 'Whole chicken stuffed with rice and ginseng in broth, eaten in summer.'),
  ],
  TH: [
    d('Pad thai', 'Spaghetti di riso saltati con uovo, tofu o gamberi, arachidi e lime.', 'Stir-fried rice noodles with egg, tofu or prawns, peanuts and lime.'),
    d('Tom yum', 'Zuppa piccante e acidula con gamberi, citronella e lime kaffir.', 'Hot and sour soup with prawns, lemongrass and kaffir lime.'),
    d('Green curry', 'Curry al latte di cocco con peperoncino verde e basilico thai.', 'Coconut milk curry with green chilli and Thai basil.'),
    d('Som tam', 'Insalata di papaya verde pestata, piccante, con lime e arachidi.', 'Pounded green papaya salad, spicy, with lime and peanuts.'),
    d('Mango sticky rice', 'Riso glutinoso al latte di cocco con mango maturo.', 'Sticky rice with coconut milk and ripe mango.'),
  ],
  VN: [
    d('Phở', 'Zuppa di spaghetti di riso in brodo profumato, con manzo o pollo ed erbe fresche.', 'Rice noodle soup in fragrant broth, with beef or chicken and fresh herbs.'),
    d('Bánh mì', 'Baguette ripiena di carne, paté, verdure in agrodolce e coriandolo.', 'Baguette filled with meat, pâté, pickled vegetables and coriander.'),
    d('Bún chả', 'Maiale alla griglia in salsa agrodolce con spaghetti di riso, tipico di Hanoi.', 'Grilled pork in a sweet-sour dip with rice noodles, from Hanoi.'),
    d('Gỏi cuốn', 'Involtini freschi di carta di riso con gamberi, erbe e vermicelli.', 'Fresh rice-paper rolls with prawns, herbs and vermicelli.'),
    d('Cà phê sữa đá', 'Caffè forte col latte condensato e ghiaccio.', 'Strong coffee with condensed milk over ice.'),
  ],
  KH: [
    d('Amok', 'Pesce al vapore in crema di cocco e spezie, servito nella foglia di banano.', 'Fish steamed in a spiced coconut custard, served in a banana leaf.'),
    d('Lok lak', 'Manzo saltato con salsa al pepe e lime, riso e uovo.', 'Stir-fried beef with a lime-pepper dip, rice and egg.'),
    d('Bai sach chrouk', 'Maiale grigliato con riso, la colazione di strada.', 'Grilled pork with rice, the street breakfast.'),
    d('Kuy teav', 'Zuppa di spaghetti di riso con maiale, del mattino.', 'Morning rice noodle soup with pork.'),
  ],
  ID: [
    d('Nasi goreng', 'Riso fritto con salsa di soia dolce, uovo e gamberetti croccanti.', 'Fried rice with sweet soy sauce, egg and prawn crackers.'),
    d('Satay', 'Spiedini di carne alla griglia con salsa di arachidi.', 'Grilled meat skewers with peanut sauce.'),
    d('Rendang', 'Manzo cotto per ore nel latte di cocco e spezie fino a seccarsi.', 'Beef slow-cooked for hours in coconut milk and spices until dry.'),
    d('Gado-gado', 'Verdure lesse, tofu e uovo con salsa di arachidi.', 'Blanched vegetables, tofu and egg with peanut sauce.'),
    d('Babi guling', 'Maialino arrosto speziato, specialità di Bali.', 'Spiced spit-roast pig, a Balinese speciality.'),
  ],
  MY: [
    d('Nasi lemak', 'Riso al cocco con sambal piccante, acciughe fritte, arachidi e uovo.', 'Coconut rice with spicy sambal, fried anchovies, peanuts and egg.'),
    d('Laksa', 'Zuppa di spaghetti piccante, al cocco o acida al tamarindo (Penang).', 'Spicy noodle soup, coconut-based or sour with tamarind (Penang).'),
    d('Roti canai', 'Pane sfogliato cotto sulla piastra, da intingere nel curry.', 'Flaky griddle flatbread dipped in curry.'),
    d('Char kway teow', 'Tagliatelle di riso saltate al wok con gamberi e germogli.', 'Wok-fried flat rice noodles with prawns and bean sprouts.'),
  ],
  SG: [
    d('Hainanese chicken rice', 'Pollo lesso con riso cotto nel brodo e salse di peperoncino e zenzero.', 'Poached chicken with rice cooked in broth and chilli and ginger sauces.'),
    d('Chilli crab', 'Granchio in salsa di pomodoro piccante, da raccogliere con i panini fritti.', 'Crab in a spicy tomato sauce, mopped up with fried buns.'),
    d('Laksa', 'Zuppa di spaghetti al cocco piccante con gamberi.', 'Spicy coconut noodle soup with prawns.'),
    d('Kaya toast', 'Toast con crema di cocco e uovo, uova alla coque e kopi, a colazione.', 'Toast with coconut-egg jam, soft-boiled eggs and kopi, for breakfast.'),
  ],
  PH: [
    d('Adobo', 'Pollo o maiale stufato in aceto, soia, aglio e alloro.', 'Chicken or pork braised in vinegar, soy, garlic and bay leaf.'),
    d('Sinigang', 'Zuppa acida al tamarindo con carne o pesce e verdure.', 'Sour tamarind soup with meat or fish and vegetables.'),
    d('Lechon', 'Maialino intero arrosto dalla pelle croccantissima, per le feste.', 'Whole roast pig with very crisp skin, for celebrations.'),
    d('Halo-halo', 'Ghiaccio tritato con latte, frutta, fagioli dolci e gelato all\'ube.', 'Shaved ice with milk, fruit, sweet beans and ube ice cream.'),
  ],
  IN: [
    d('Biryani', 'Riso basmati speziato cotto a strati con carne o verdure.', 'Spiced basmati rice cooked in layers with meat or vegetables.'),
    d('Butter chicken', 'Pollo tandoori in salsa cremosa di pomodoro e burro, del Nord.', 'Tandoori chicken in a creamy tomato-butter sauce, from the North.'),
    d('Masala dosa', 'Crespella croccante di riso e lenticchie con patate speziate, del Sud.', 'Crisp rice-lentil crêpe filled with spiced potato, from the South.'),
    d('Thali', 'Vassoio con riso, pane, dal, curry e salse in piccole ciotole.', 'Platter of rice, bread, dal, curries and chutneys in small bowls.'),
    d('Chai', 'Tè nero bollito con latte, zucchero e spezie, venduto ovunque.', 'Black tea boiled with milk, sugar and spices, sold everywhere.'),
  ],
  LK: [
    d('Rice and curry', 'Riso con tanti piccoli curry di verdure, pesce o carne e sambol di cocco.', 'Rice with many small curries of vegetables, fish or meat and coconut sambol.'),
    d('Hoppers (appa)', 'Crespelle a scodella di farina di riso e cocco, anche con l\'uovo.', 'Bowl-shaped rice flour and coconut pancakes, also with an egg.'),
    d('Kottu roti', 'Pane roti tagliuzzato sulla piastra con verdure, uovo e carne.', 'Roti bread chopped on the griddle with vegetables, egg and meat.'),
    d('Lamprais', 'Riso, carne e contorni cotti insieme in una foglia di banano.', 'Rice, meat and sides baked together in a banana leaf.'),
  ],
  MV: [
    d('Mas huni', 'Tonno, cocco grattugiato, cipolla e peperoncino con pane roshi, a colazione.', 'Tuna, grated coconut, onion and chilli with roshi bread, for breakfast.'),
    d('Garudhiya', 'Brodo limpido di tonno servito con riso, lime e peperoncino.', 'Clear tuna broth served with rice, lime and chilli.'),
    d('Hedhikaa', 'Spuntini fritti salati di pesce, serviti col tè del pomeriggio.', 'Fried savoury fish snacks, served with afternoon tea.'),
    d('Mas riha', 'Curry di tonno al latte di cocco.', 'Tuna curry with coconut milk.'),
  ],

  TW: [
    d('Niu rou mian', 'Zuppa di spaghetti con manzo brasato, il piatto simbolo dell\'isola.', 'Noodle soup with braised beef, the island\'s signature dish.'),
    d('Lu rou fan', 'Riso con maiale brasato nella salsa di soia.', 'Rice topped with soy-braised minced pork.'),
    d('Gua bao', 'Panino al vapore con pancetta brasata, arachidi e coriandolo.', 'Steamed bun with braised pork belly, peanuts and coriander.'),
    d('Bubble tea', 'Tè al latte con perle di tapioca, nato qui negli anni \'80.', 'Milk tea with tapioca pearls, born here in the 1980s.'),
    d('Xiaolongbao', 'Ravioli al vapore pieni di brodo.', 'Steamed soup dumplings.'),
  ],
  HK: [
    d('Dim sum', 'Ravioli e bocconcini al vapore (har gow, siu mai) con il tè, al mattino.', 'Steamed dumplings and bites (har gow, siu mai) with tea, in the morning.'),
    d('Char siu / oca arrosto', 'Maiale laccato e oca arrosto serviti su riso.', 'Glazed barbecue pork and roast goose over rice.'),
    d('Wonton noodles', 'Brodo con tagliolini all\'uovo e ravioli di gamberi.', 'Broth with egg noodles and prawn dumplings.'),
    d('Egg tart', 'Tartelletta con crema all\'uovo, eredità di Macao.', 'Egg custard tart, inherited from Macau.'),
    d('Milk tea', 'Tè nero forte con latte evaporato, filtrato in una "calza".', 'Strong black tea with evaporated milk, strained through a "sock".'),
  ],
  NP: [
    d('Dal bhat', 'Riso con zuppa di lenticchie, curry di verdure e sottaceti: si rabbocca gratis.', 'Rice with lentil soup, vegetable curry and pickles: refills are free.'),
    d('Momo', 'Ravioli al vapore o fritti ripieni di carne o verdure, con salsa piccante.', 'Steamed or fried dumplings filled with meat or vegetables, with a spicy dip.'),
    d('Thukpa', 'Zuppa tibetana di spaghetti con verdure e carne, ideale in montagna.', 'Tibetan noodle soup with vegetables and meat, ideal in the mountains.'),
    d('Newari khaja set', 'Vassoio della cucina newari di Kathmandu: riso schiacciato, carni speziate, fagioli.', 'Platter of Kathmandu\'s Newari cuisine: beaten rice, spiced meats, beans.'),
  ],
  LA: [
    d('Larb', 'Insalata di carne macinata con lime, erbe e riso tostato.', 'Minced meat salad with lime, herbs and toasted rice.'),
    d('Khao niao', 'Riso glutinoso servito nel cestino di bambù, da mangiare con le mani.', 'Sticky rice served in a bamboo basket, eaten by hand.'),
    d('Tam mak hoong', 'Insalata piccante di papaya verde, più acida di quella thai.', 'Spicy green papaya salad, sourer than the Thai one.'),
    d('Khao jee pâté', 'Baguette ripiena di paté e verdure, eredità francese.', 'Baguette filled with pâté and vegetables, a French legacy.'),
  ],
  UZ: [
    d('Plov', 'Riso cotto nel calderone con carne d\'agnello, carote gialle e ceci: il piatto nazionale.', 'Rice cooked in a cauldron with lamb, yellow carrots and chickpeas: the national dish.'),
    d('Samsa', 'Fagottini al forno tandoor ripieni di carne e cipolla.', 'Tandoor-baked pastries filled with meat and onion.'),
    d('Lagman', 'Spaghetti tirati a mano in brodo o saltati con carne e verdure.', 'Hand-pulled noodles in broth or stir-fried with meat and vegetables.'),
    d('Shashlik', 'Spiedini di agnello alla brace con cipolla cruda.', 'Grilled lamb skewers with raw onion.'),
    d('Non', 'Pane rotondo cotto nel tandoor, decorato al centro: è sacro.', 'Round tandoor-baked bread stamped in the middle: it is sacred.'),
  ],

  // ----- Africa -----
  KE: [
    d('Nyama choma', 'Carne di capra o manzo alla griglia, con kachumbari e ugali.', 'Grilled goat or beef, with kachumbari salad and ugali.'),
    d('Ugali', 'Polenta soda di mais bianco, si mangia con le mani insieme a carne e verdure.', 'Stiff white maize porridge, eaten by hand with meat and greens.'),
    d('Sukuma wiki', 'Cavolo verde saltato con cipolla e pomodoro.', 'Collard greens sautéed with onion and tomato.'),
    d('Pilau', 'Riso speziato con carne, influenza della costa swahili.', 'Spiced rice with meat, from the Swahili coast.'),
  ],
  TZ: [
    d('Zanzibar pizza', 'Crespella ripiena di carne, uova e verdure cotta sulla piastra, ai mercati serali.', 'Griddled pancake stuffed with meat, egg and vegetables, at the night markets.'),
    d('Pilau', 'Riso con cardamomo, cannella e chiodi di garofano e carne.', 'Rice with cardamom, cinnamon, cloves and meat.'),
    d('Ugali', 'Polenta soda di mais servita con carne, pesce o verdure.', 'Stiff maize porridge served with meat, fish or greens.'),
    d('Mishkaki', 'Spiedini di carne marinata alla griglia.', 'Marinated grilled meat skewers.'),
  ],
  ZA: [
    d('Braai', 'Il barbecue sudafricano: carne, salsicce boerewors e mieliepap.', 'The South African barbecue: meat, boerewors sausage and maize pap.'),
    d('Bobotie', 'Carne macinata speziata al curry con frutta secca, coperta di crema all\'uovo e cotta al forno.', 'Curried spiced mince with dried fruit, topped with egg custard and baked.'),
    d('Bunny chow', 'Mezza pagnotta scavata e riempita di curry, nata a Durban.', 'Half a hollowed loaf filled with curry, born in Durban.'),
    d('Biltong', 'Carne essiccata e speziata da sgranocchiare.', 'Spiced air-dried meat to snack on.'),
  ],
  MG: [
    d('Romazava', 'Stufato di manzo con foglie verdi (brèdes), il piatto nazionale.', 'Beef stew with leafy greens, the national dish.'),
    d('Ravitoto', 'Foglie di manioca pestate cotte con maiale e cocco.', 'Pounded cassava leaves cooked with pork and coconut.'),
    d('Zebu', 'Carne del bue con la gobba, alla griglia o in spiedini (masikita).', 'Humped zebu beef, grilled or on skewers (masikita).'),
    d('Mofo gasy', 'Frittelline di riso dolci vendute per strada a colazione.', 'Sweet rice cakes sold on the street for breakfast.'),
  ],
  ET: [
    d('Injera', 'Grande crespella acidula di teff che fa da piatto e da posata.', 'Large sour teff flatbread that serves as both plate and cutlery.'),
    d('Doro wat', 'Stufato di pollo piccante al berbere con uova sode, delle feste.', 'Spicy berbere chicken stew with boiled eggs, for celebrations.'),
    d('Shiro', 'Crema speziata di farina di ceci, il piatto dei giorni di digiuno.', 'Spiced chickpea flour stew, the fasting-day dish.'),
    d('Tibs', 'Carne saltata in padella con cipolla, peperoncino e burro speziato.', 'Pan-fried meat with onion, chilli and spiced butter.'),
  ],

  GH: [
    d('Jollof rice', 'Riso cotto nel sugo di pomodoro e spezie, conteso con la Nigeria.', 'Rice cooked in a spiced tomato sauce, fought over with Nigeria.'),
    d('Fufu', 'Palla di manioca e platano pestati, da intingere nella zuppa con le mani.', 'Ball of pounded cassava and plantain, dipped in soup by hand.'),
    d('Banku e tilapia', 'Impasto fermentato di mais e manioca con pesce alla griglia e salsa piccante.', 'Fermented corn-cassava dough with grilled fish and hot pepper sauce.'),
    d('Kelewele', 'Cubetti di platano fritti con zenzero e peperoncino, lo snack di strada.', 'Fried plantain cubes with ginger and chilli, the street snack.'),
  ],
  SN: [
    d('Thiéboudienne', 'Riso cotto nel sugo di pesce e verdure, il piatto nazionale.', 'Rice cooked in a fish and vegetable sauce, the national dish.'),
    d('Yassa', 'Pollo o pesce marinati e cotti con tanta cipolla e limone.', 'Chicken or fish marinated and cooked with lots of onion and lemon.'),
    d('Mafé', 'Stufato di carne in salsa di arachidi, con riso.', 'Meat stew in peanut sauce, with rice.'),
    d('Fataya', 'Fagottini fritti ripieni di pesce o carne.', 'Fried pastries filled with fish or meat.'),
  ],
  RW: [
    d('Brochettes', 'Spiedini di capra (o manzo) alla brace con patate o platano fritti.', 'Grilled goat (or beef) skewers with fried potatoes or plantain.'),
    d('Isombe', 'Foglie di manioca pestate cotte con melanzane e arachidi.', 'Pounded cassava leaves cooked with aubergine and peanuts.'),
    d('Agatogo', 'Stufato di platano con carne o pesce in salsa di pomodoro.', 'Plantain stew with meat or fish in tomato sauce.'),
    d('Ubugali', 'Polenta soda di manioca o mais, da accompagnare agli stufati.', 'Stiff cassava or maize porridge to go with stews.'),
  ],
  UG: [
    d('Rolex', 'Chapati arrotolato con frittata, cavolo e pomodoro, venduto per strada.', 'Chapati rolled around an omelette, cabbage and tomato, sold on the street.'),
    d('Matoke', 'Banane verdi cotte al vapore e schiacciate, con salsa di arachidi o carne.', 'Steamed and mashed green bananas, with peanut or meat sauce.'),
    d('Luwombo', 'Stufato di pollo o carne cotto al vapore in foglie di banano.', 'Chicken or meat stew steamed in banana leaves.'),
    d('Posho e fagioli', 'Polenta di mais bianco con fagioli stufati, il pasto di ogni giorno.', 'White maize porridge with stewed beans, the everyday meal.'),
  ],
  NA: [
    d('Kapana', 'Straccetti di manzo grigliati al mercato e intinti nel sale piccante, a Windhoek.', 'Beef strips grilled at the market and dipped in spicy salt, in Windhoek.'),
    d('Carne di selvaggina', 'Bistecche di orice, kudu o springbok, nei menu di tutto il paese.', 'Oryx, kudu or springbok steaks, on menus across the country.'),
    d('Potjiekos', 'Stufato di carne e verdure cotto a strati in una pentola di ghisa sul fuoco.', 'Meat and vegetable stew cooked in layers in a cast-iron pot over the fire.'),
    d('Brötchen e Apfelstrudel', 'Pane e dolci tedeschi, ancora tipici a Swakopmund e Windhoek.', 'German bread and pastries, still typical in Swakopmund and Windhoek.'),
  ],

  // ----- Oceania -----
  AU: [
    d('Meat pie', 'Tortino di sfoglia ripieno di carne e gravy, con ketchup.', 'Pastry pie filled with minced meat and gravy, with tomato sauce.'),
    d('Barramundi', 'Pesce bianco locale alla griglia o in fish and chips.', 'Local white fish, grilled or as fish and chips.'),
    d('Avocado toast', 'Pane tostato con avocado schiacciato: il brunch nei caffè.', 'Toast with smashed avocado: the café brunch staple.'),
    d('Pavlova / Lamington', 'Meringa con panna e frutta; cubetti di pan di Spagna al cioccolato e cocco.', 'Meringue with cream and fruit; sponge squares in chocolate and coconut.'),
  ],
  NZ: [
    d('Hāngī', 'Carne e verdure cotte in un forno scavato nella terra, tradizione Māori.', 'Meat and vegetables cooked in an earth oven, a Māori tradition.'),
    d('Lamb', 'Agnello arrosto, simbolo della cucina neozelandese.', 'Roast lamb, the emblem of New Zealand cooking.'),
    d('Green-lipped mussels', 'Grosse cozze dal bordo verde, al vapore o gratinate.', 'Large green-shelled mussels, steamed or grilled.'),
    d('Hokey pokey', 'Gelato alla vaniglia con pezzetti di caramello croccante.', 'Vanilla ice cream with crunchy honeycomb toffee.'),
  ],
};
