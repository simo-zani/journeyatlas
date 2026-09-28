// ============================================================================
// JourneyAtlas - Elenco aeroporti
//
// Fonte: https://davidmegginson.github.io/ourairports-data/airports.csv (pubblico dominio CC0), scaricato il 2026-09-28.
// Estrazione: solo `large_airport` e `medium_airport` con codice IATA
// (4568 aeroporti su ~10.000). Gli aeroporti da campi volo, eliporti e
// aviosuperfici non hanno IATA e non servono: un utente che prenota un volo cerca
// un aeroporto che abbia un codice.
//
// Un record per riga, campi separati da `|`:
//
// IATA|nome|comune|CC|lat|lon|tz IANA|l=grande m=medio|s=con voli di linea n=senza|keywords
//
// I `keywords` sono gli alias del record ("Milan Bergamo Airport", "ROM",
// "TYO", "Lisboa"): senza quelli si cerca solo per codice IATA o per nome, e
// "bergamo" non troverebbe il Caravaggio. `cc` è il codice ISO del Paese: la
// bandierina arriva da quello, non serve il nome.
//
// I due flag guidano i consigliati per prossimità: un aeroporto con voli di
// linea batte uno senza anche se è più vicino, altrimenti a Parigi verrebbero
// proposti Le Bourget e Toussus-le-Noble al posto di Charles de Gaulle.
//
// Il fuso orario è calcolato da lat/lon con `geo-tz` (pacchetto usato solo in
// fase di generazione, non a runtime): serve per convertire gli orari dei
// voli nel fuso di riferimento del viaggiatore nella card "Mezzi". Alcune
// coppie di fusi con offset permanentemente identico (es. Pacific/Honolulu e
// Pacific/Tahiti) vengono accorpate dal dataset di `geo-tz`: il nome IANA può
// non essere quello "canonico" del luogo, ma l'offset calcolato resta esatto.
//
// Non editare a mano: il file è generato. Per rigenerarlo basta rifare la
// selezione qui sopra sul CSV di OurAirports (stessa fonte, stessa data) e
// ricalcolare il fuso di ogni riga con `geo-tz`.
// ============================================================================

export const AIRPORT_DATA = `AAA|Anaa Airport|Anaa|PF|-17.353|-145.51|Pacific/Honolulu|m|s|
AAC|El Arish International Airport|El Arish|EG|31.055|33.828|Africa/Cairo|l|s|
AAE|Annaba Rabah Bitat Airport|Annaba|DZ|36.827|7.813|Africa/Algiers|l|s|Les Salines Airport, El Mellah Airport, Annabah
AAL|Aalborg Airport|Aalborg|DK|57.095|9.85|Europe/Berlin|l|s|
AAM|Malamala Airport|Malamala|ZA|-24.817|31.544|Africa/Johannesburg|m|n|
AAN|Al Ain International Airport|Al Ain|AE|24.262|55.609|Asia/Dubai|l|s|
AAO|Anaco Airport|Anaco|VE|9.43|-64.471|America/Caracas|m|n|
AAP|Aji Pangeran Tumenggung Pranoto International Airport|Samarinda|ID|-0.374|117.25|Asia/Makassar|m|s|Sungai Siring Airport
AAQ|Anapa Vityazevo Airport|Krasnyi Kurgan|RU|45.002|37.347|Europe/Moscow|m|n|УРКА, ЬРКА, Анапа / Витязево
AAR|Aarhus Airport|Aarhus|DK|56.303|10.618|Europe/Berlin|l|s|Tirstrup
AAT|Altay Xuedu Airport|Altay|CN|47.75|88.086|Asia/Shanghai|m|s|Altay Air Base
AAV|Allah Valley Airport|Surallah|PH|6.368|124.752|Asia/Manila|m|n|Alah Valley Airport
AAX|Romeu Zema Airport|Araxá|BR|-19.563|-46.96|America/Sao_Paulo|m|s|
AAY|Al Ghaydah International Airport|Al Ghaydah|YE|16.193|52.174|Asia/Riyadh|m|s|
ABA|Abakan International Airport|Abakan|RU|53.74|91.385|Asia/Krasnoyarsk|l|s|УНАА, Абакан
ABB|Asaba International Airport|Asaba|NG|6.204|6.665|Africa/Lagos|l|s|Onitsha
ABC|Albacete Airport / Los Llanos Air Base|Albacete|ES|38.949|-1.864|Europe/Madrid|m|n|
ABD|Abadan Ayatollah Jami International Airport|Abadan|IR|30.368|48.23|Asia/Tehran|l|s|Abadan Airport, فرودگاه بین‌المللی آبادان
ABE|Lehigh Valley International Airport|Allentown/Bethlehem|US|40.652|-75.443|America/New_York|m|s|Allentown–Bethlehem–Easton International Airport
ABI|Abilene Regional Airport|Abilene|US|32.411|-99.682|America/Chicago|m|s|
ABJ|Félix-Houphouët-Boigny International Airport|Abidjan|CI|5.261|-3.926|Africa/Abidjan|l|s|Port Bouët
ABK|Kebri Dahar Airport|Kebri Dahar|ET|6.733|44.241|Asia/Riyadh|m|s|Kabri Dar
ABL|Ambler Airport|Ambler|US|67.106|-157.855|America/Anchorage|m|s|Z60
ABQ|Albuquerque International Sunport|Albuquerque|US|35.04|-106.609|America/Denver|l|s|
ABR|Aberdeen Regional Airport|Aberdeen|US|45.449|-98.422|America/Chicago|m|s|
ABS|Abu Simbel Airport|Abu Simbel|EG|22.376|31.612|Africa/Cairo|m|s|
ABT|King Saud Bin Abdulaziz (Al Baha) Airport|Al-Baha|SA|20.299|41.636|Asia/Riyadh|m|s|Al-Aqiq
ABV|Nnamdi Azikiwe International Airport|Abuja|NG|9.007|7.263|Africa/Lagos|l|s|
ABX|Albury Airport|East Albury|AU|-36.067|146.959|Australia/Sydney|m|s|
ABY|Southwest Georgia Regional Airport|Albany|US|31.533|-84.196|America/New_York|m|s|
ABZ|Aberdeen International Airport|Aberdeen|GB|57.202|-2.198|Europe/London|l|s|Dyce
ACA|General Juan N. Álvarez International Airport|Acapulco|MX|16.757|-99.753|America/Mexico_City|l|s|Acapulco International Airport
ACC|Kotoka International Airport|Accra|GH|5.605|-0.167|Africa/Abidjan|l|s|
ACE|César Manrique-Lanzarote Airport|San Bartolomé|ES|28.945|-13.605|Atlantic/Canary|l|s|Arrecife Airport
ACH|Sankt Gallen Altenrhein Airport|St. Gallen|CH|47.485|9.561|Europe/Zurich|m|s|
ACI|Alderney Airport|Saint Anne|GG|49.706|-2.215|Europe/London|m|s|The Blaye, Channel Islands
ACJ|Anuradhapura Airport|Anuradhapura|LK|8.302|80.428|Asia/Colombo|m|n|SLAF Anuradhapura
ACK|Nantucket Memorial Airport|Nantucket|US|41.253|-70.06|America/New_York|m|s|
ACN|Ciudad Acuña International Airport|Ciudad Acuña|MX|29.334|-101.101|America/Matamoros|m|n|
ACS|Achinsk Airport|Achinsk|RU|56.269|90.575|Asia/Krasnoyarsk|m|n|УНКС
ACT|Waco Regional Airport|Waco|US|31.611|-97.23|America/Chicago|m|s|
ACV|California Redwood Coast-Humboldt County Airport|Arcata/Eureka|US|40.978|-124.109|America/Los_Angeles|m|s|Arcata Airport, Arcata–Eureka Airport
ACX|Xingyi Wanfenglin Airport|Xingyi|CN|25.083|104.961|Asia/Shanghai|m|s|
ACY|Atlantic City International Airport|Atlantic City|US|39.456|-74.578|America/New_York|m|s|
ACZ|Zabol Airport|Zabol|IR|31.098|61.544|Asia/Tehran|m|n|
ADB|Adnan Menderes International Airport|Gaziemir|TR|38.292|27.157|Europe/Istanbul|l|s|İzmir
ADD|Addis Ababa Bole International Airport|Addis Ababa|ET|8.978|38.799|Asia/Riyadh|l|s|Haile Selassie I
ADE|Aden International Airport|Aden|YE|12.83|45.03|Asia/Riyadh|l|s|RAF Khormaksar
ADF|Adıyaman Airport|Adıyaman|TR|37.731|38.469|Europe/Istanbul|m|s|
ADI|Arandis Airport|Arandis|NA|-22.462|14.979|Africa/Windhoek|m|n|
ADJ|Marka International (Amman Civil) Airport|Amman|JO|31.973|35.992|Asia/Amman|l|s|King Abdullah Air Base, Amman Civil Airport, Amman City Airport, Marka International Airport
ADK|Adak Airport|Adak|US|51.884|-176.643|America/Adak|m|s|
ADL|Adelaide International Airport|Adelaide|AU|-34.948|138.533|Australia/Adelaide|l|s|
ADP|Ampara Airport|Ampara|LK|7.337|81.624|Asia/Colombo|m|n|GOY, Gal Oya Airport
ADQ|Kodiak Airport|Kodiak|US|57.75|-152.494|America/Anchorage|m|s|
ADT|Ada Regional Airport|Ada|US|34.805|-96.672|America/Chicago|m|n|Ada Municipal
ADU|Ardabil Airport|Ardabil|IR|38.326|48.424|Asia/Tehran|m|s|
ADW|Joint Base Andrews|Camp Springs|US|38.811|-76.867|America/New_York|m|n|Andrews Air Force Base
ADX|Leuchars Station Airfield|Leuchars, Fife|GB|56.374|-2.869|Europe/London|m|n|
ADZ|Gustavo Rojas Pinilla International Airport|San Andrés|CO|12.584|-81.711|America/Bogota|l|s|
AEB|Baise (Bose) Bama Airport|Baise (Tianyang)|CN|23.721|106.96|Asia/Shanghai|m|s|Tian Yang Air Base, Bose airport, 百色右江机场
AEG|Aek Godang Airport|Padang Sidempuan|ID|1.4|99.43|Asia/Jakarta|m|n|
AEH|Abeche Airport|Abeche|TD|13.847|20.844|Africa/Ndjamena|m|n|
AEP|Aeroparque Jorge Newbery|Buenos Aires|AR|-34.559|-58.416|America/Argentina/Buenos_Aires|l|s|
AER|Sochi International Airport|Sochi|RU|43.45|39.957|Europe/Moscow|l|s|Adler Airport, Black Sea, Международный Аэропорт Сочи
AES|Ålesund Airport|Ålesund|NO|62.56|6.111|Europe/Berlin|l|s|Vigra, Ålesund Vigra Airport
AEU|Abu Musa Island Airport|Abu Musa|IR|25.876|55.033|Asia/Tehran|m|s|
AEX|Alexandria International Airport|Alexandria|US|31.326|-92.547|America/Chicago|m|s|England Air Park, England Air Force Base
AEY|Akureyri International Airport|Akureyri|IS|65.657|-18.072|Africa/Abidjan|l|s|
AFA|Suboficial Ay Santiago Germano Airport|San Rafael|AR|-34.588|-68.404|America/Argentina/Mendoza|m|s|
AFL|Piloto Osvaldo Marques Dias Airport|Alta Floresta|BR|-9.866|-56.106|America/Cuiaba|m|s|
AFW|Perot Field/Fort Worth Alliance Airport|Fort Worth|US|32.99|-97.319|America/Chicago|m|n|
AFY|Afyon Air Base|Afyonkarahisar|TR|38.726|30.601|Europe/Istanbul|m|n|Afyonkarahisar
AFZ|Sabzevar National Airport|Sabzevar|IR|36.168|57.595|Asia/Tehran|m|s|
AGA|Al Massira Airport|Agadir (Temsia)|MA|30.322|-9.412|Africa/Casablanca|l|s|
AGB|Augsburg Airport|Augsburg|DE|48.425|10.932|Europe/Berlin|m|n|
AGC|Allegheny County Airport|Pittsburgh|US|40.354|-79.93|America/New_York|m|n|
AGF|Agen La Garenne airport|Agen|FR|44.174|0.593|Europe/Paris|m|n|
AGH|Ängelholm-Helsingborg Airport|Ängelholm|SE|56.296|12.847|Europe/Berlin|m|s|ESDB, Ängelholm Air Base
AGP|Málaga-Costa del Sol Airport|Málaga|ES|36.675|-4.499|Europe/Madrid|l|s|
AGR|Agra Airport / Agra Air Force Station|Agra|IN|27.158|77.961|Asia/Kolkata|m|s|Kheria Airport, Pandit Deen Dayal Upadhyay Airport, RAF Agra
AGS|Augusta Regional At Bush Field|Augusta|US|33.37|-81.965|America/New_York|m|s|
AGT|Guaraní International Airport|Ciudad del Este|PY|-25.457|-54.84|America/Asuncion|l|s|Aeropuerto Internacional Guaraní
AGU|Aguascalientes International Airport|Aguascalientes|MX|21.7|-102.318|America/Mexico_City|l|s|Jesús Terán Peredo International Airport, Licenciado Jesús Terán Peredo, Aeropuerto Internacional Jesús Terán Peredo
AGV|Oswaldo Guevara Mujica Airport|Acarigua|VE|9.553|-69.238|America/Caracas|m|n|Acarigua-Araure Airport
AGX|Agatti Airport|Agatti|IN|10.824|72.176|Asia/Kolkata|m|s|
AGZ|Aggeneys Airport|Aggeneys|ZA|-29.282|18.814|Africa/Johannesburg|m|n|
AHA|Maa Mahamaya Airport|Ambikapur|IN|22.988|83.196|Asia/Kolkata|m|s|Ambikapur, Darima
AHB|Abha International Airport|Abha|SA|18.24|42.657|Asia/Riyadh|l|s|
AHE|Ahe Airport|Ahe Atoll|PF|-14.428|-146.257|Pacific/Honolulu|m|s|Tenukupara
AHJ|Hongyuan Airport|Ngawa (Hongyuan)|CN|32.532|102.352|Asia/Shanghai|m|n|Aba
AHN|Athens Ben Epps Airport|Athens|US|33.949|-83.326|America/New_York|m|n|
AHO|Alghero-Fertilia Airport|Alghero|IT|40.632|8.291|Europe/Rome|m|s|Alghero Airport, Sardinia, Alghero - Riviera del Corallo Airport
AHU|Cherif Al Idrissi Airport|Al Hoceima|MA|35.177|-3.84|Africa/Casablanca|m|s|
AIA|Alliance Municipal Airport|Alliance|US|42.053|-102.804|America/Denver|m|s|
AIN|Wainwright Airport|Wainwright|US|70.638|-159.995|America/Anchorage|m|s|5WW
AJA|Ajaccio Napoléon Bonaparte airport|Ajaccio|FR|41.924|8.803|Europe/Paris|m|s|
AJF|Al-Jawf International Airport|Al-Jawf|SA|29.783|40.101|Asia/Riyadh|l|s|Al Jouf Airport, Al Jawf, Al Jawf Airport, Al Jouf Regional Airport, Al Jawf Regional Airport
AJI|Ağrı Airport|Ağrı|TR|39.656|43.026|Europe/Istanbul|m|s|
AJL|Lengpui Airport|Aizawl (Lengpui)|IN|23.841|92.62|Asia/Kolkata|m|s|
AJN|Ouani Airport|Ouani|KM|-12.131|44.43|Asia/Riyadh|m|s|
AJR|Arvidsjaur Airport|Arvidsjaur|SE|65.59|19.282|Europe/Berlin|m|s|
AJU|Aracaju - Santa Maria Airport|Aracaju|BR|-10.984|-37.073|America/Maceio|m|s|
AJY|Mano Dayak International Airport|Agadez|NE|16.966|8|Africa/Lagos|m|n|
AKC|Akron Fulton International Airport|Akron|US|41.037|-81.468|America/New_York|m|n|Akron Executive, NAS Akron.
AKD|Akola Airport|Akola|IN|20.699|77.057|Asia/Kolkata|m|n|Shioni Airport
AKF|Kufra Airport|Kufra|LY|24.179|23.314|Africa/Tripoli|m|s|
AKH|Prince Sultan Air Base|Al Kharj|SA|24.063|47.581|Asia/Riyadh|m|n|OEKH
AKJ|Asahikawa Airport|Higashikagura|JP|43.671|142.447|Asia/Tokyo|m|s|
AKL|Auckland International Airport|Auckland|NZ|-37.012|174.786|Pacific/Auckland|l|s|
AKN|King Salmon Airport|King Salmon|US|58.678|-156.652|America/Anchorage|m|s|Naknek Air Force Base
AKP|Anaktuvuk Pass Airport|Anaktuvuk Pass|US|68.134|-151.743|America/Anchorage|m|s|
AKR|Akure Airport|Akure|NG|7.247|5.301|Africa/Lagos|m|s|
AKT|RAF Akrotiri|Akrotiri|CY|34.59|32.988|Asia/Nicosia|m|n|Royal Air Force, British
AKU|Aksu Hongqipo Airport|Aksu (Onsu)|CN|41.263|80.292|Asia/Urumqi|m|s|Ak-su, Akshu, Aqsu, Bharuka, Po-lu-chia, Aksu Wensu Air Base, Onsu
AKW|Aghajari Airport|Omidiyeh|IR|30.744|49.677|Asia/Tehran|m|n|
AKX|Aktobe International Airport|Aktobe|KZ|50.248|57.204|Asia/Aqtobe|l|s|Aktyubinsk Airport, Aktubinsk Airport, Аэропорт Актюбинск
AKY|Sittwe Airport|Sittwe|MM|20.133|92.871|Asia/Yangon|m|s|
ALA|Almaty International Airport|Almaty|KZ|43.354|77.043|Asia/Almaty|l|s|Alma Ata
ALB|Albany International Airport|Albany|US|42.748|-73.802|America/New_York|l|s|
ALC|Alicante-Elche Miguel Hernández Airport|Alicante|ES|38.282|-0.558|Europe/Madrid|l|s|
ALF|Alta Airport|Alta|NO|69.976|23.372|Europe/Berlin|m|s|
ALG|Houari Boumediene Airport|Algiers|DZ|36.694|3.215|Africa/Algiers|l|s|Algiers, Maison Blanche
ALH|Albany Airport|Albany|AU|-34.943|117.809|Australia/Perth|m|s|ABA, YPAL, Harry Riggs Albany Regional
ALI|Alice International Airport|Alice|US|27.741|-98.027|America/Chicago|m|n|
ALJ|Alexander Bay Airport|Alexander Bay|ZA|-28.575|16.533|Africa/Johannesburg|m|n|Kortdoorn
ALM|Alamogordo White Sands Regional Airport|Alamogordo|US|32.838|-105.993|America/Denver|m|n|
ALN|St Louis Regional Airport|Alton/St Louis|US|38.89|-90.046|America/Chicago|m|n|Civic Memorial Airport
ALO|Waterloo Regional Airport|Waterloo|US|42.557|-92.4|America/Chicago|m|s|
ALP|Aleppo International Airport|Aleppo|SY|36.181|37.227|Asia/Damascus|l|s|مطار حلب الدولي
ALR|Alexandra Aerodrome|Alexandra|NZ|-45.21|169.371|Pacific/Auckland|m|n|
ALS|San Luis Valley Regional Airport/Bergman Field|Alamosa|US|37.435|-105.867|America/Denver|m|s|
ALW|Walla Walla Regional Airport|Walla Walla|US|46.095|-118.288|America/Los_Angeles|m|s|
AMA|Rick Husband Amarillo International Airport|Amarillo|US|35.218|-101.706|America/Chicago|m|s|
AMD|Sardar Vallabh Patel International Airport|Ahmedabad|IN|23.077|72.635|Asia/Kolkata|l|s|Gandhinagar Air Force Station
AMH|Arba Minch Airport|Arba Minch|ET|6.039|37.59|Asia/Riyadh|m|s|Gantar, Minghi
AMM|Queen Alia International Airport|Amman|JO|31.723|35.993|Asia/Amman|l|s|
AMQ|Pattimura International Airport|Ambon|ID|-3.71|128.089|Asia/Tokyo|l|s|
AMS|Amsterdam Airport Schiphol|Amsterdam|NL|52.309|4.764|Europe/Brussels|l|s|
AMV|Amderma Airport|Amderma|RU|69.764|61.557|Europe/Moscow|m|s|УЛДД, ЬЛДД, Амдерма, АМД
AMZ|Ardmore Airport|Manurewa|NZ|-37.03|174.973|Pacific/Auckland|m|n|
ANB|Anniston Regional Airport|Anniston|US|33.588|-85.858|America/Chicago|m|n|Anniston Metropolitan
ANC|Ted Stevens Anchorage International Airport|Anchorage|US|61.179|-149.993|America/Anchorage|l|s|
AND|Anderson Regional Airport|Anderson|US|34.495|-82.709|America/New_York|m|n|
ANE|Angers Marcé airport|Angers|FR|47.56|-0.312|Europe/Paris|m|n|Marcé Airport.
ANF|Andrés Sabella Gálvez International Airport|Antofagasta|CL|-23.445|-70.445|America/Santiago|l|s|Cerro Moreno Airport
ANG|Angoulême Brie-Champniers airport|Angoulême|FR|45.729|0.221|Europe/Paris|m|n|
ANI|Aniak Airport|Aniak|US|61.582|-159.543|America/Anchorage|m|s|
ANK|Etimesgut Air Base|Ankara|TR|39.95|32.689|Europe/Istanbul|m|n|
ANM|Antsirabe Airport|Antsirabe|MG|-14.999|50.32|Asia/Riyadh|m|n|
ANN|Annette Island Airport|Metlakatla|US|55.038|-131.573|America/Metlakatla|m|n|
ANR|Antwerp International Airport (Deurne)|Antwerp|BE|51.191|4.463|Europe/Brussels|m|s|
ANU|V. C. Bird International Airport|Osbourn|AG|17.137|-61.793|America/Puerto_Rico|l|s|St. John's
ANV|Anvik Airport|Anvik|US|62.647|-160.191|America/Anchorage|m|s|
ANX|Andøya Airport, Andenes|Andenes|NO|69.295|16.139|Europe/Berlin|m|s|
AOC|Leipzig–Altenburg Airport|Nobitz|DE|50.982|12.506|Europe/Berlin|m|n|Altenburg-Nobitz
AOE|Hasan Polatkan Airport|Eskişehir|TR|39.812|30.519|Europe/Istanbul|l|s|Anadolu Airport
AOG|Anshan Teng'ao Airport / Anshan Air Base|Anshan|CN|41.105|122.854|Asia/Shanghai|m|s|
AOI|Marche Airport|Falconara Marittima|IT|43.616|13.362|Europe/Rome|m|s|Ancona, Ancona Falconara Airport, Falconara, Raffaello Sanzio Airport
AOJ|Aomori Airport|Aomori|JP|40.734|140.689|Asia/Tokyo|l|s|
AOK|Karpathos Airport|Karpathos Island|GR|35.421|27.146|Europe/Athens|m|s|
AOL|Paso De Los Libres Airport|Paso de los Libres|AR|-29.689|-57.152|America/Argentina/Cordoba|m|n|
AOO|Altoona Blair County Airport|Altoona|US|40.296|-78.32|America/New_York|m|s|
AOR|Sultan Abdul Halim Airport|Alor Satar|MY|6.19|100.398|Asia/Singapore|m|s|
AOT|Aosta Corrado Gex Airport|Saint-Christophe|IT|45.739|7.368|Europe/Rome|m|s|
APA|Centennial Airport|Denver|US|39.57|-104.849|America/Denver|m|n|Arapahoe County Airport
APF|Naples Municipal Airport|Naples|US|26.153|-81.775|America/New_York|m|n|
APG|Phillips Army Air Field|Aberdeen|US|39.466|-76.169|America/New_York|m|n|Aberdeen Proving Grounds
API|Gomez Nino Apiay Air Base|Apiay|CO|4.076|-73.563|America/Bogota|m|n|
APJ|Ali Pulan Airport|Burang Town|CN|30.398|81.133|Asia/Shanghai|m|n|
APL|Nampula Airport|Nampula|MZ|-15.106|39.282|Africa/Johannesburg|l|s|
APN|Alpena County Regional Airport|Alpena|US|45.078|-83.56|America/Detroit|m|s|
APO|Antonio Roldán Betancur Airport|Carepa|CO|7.812|-76.716|America/Bogota|m|s|
APW|Faleolo International Airport|Apia|WS|-13.83|-172.008|Pacific/Apia|l|s|
APZ|Zapala Airport|Zapala|AR|-38.975|-70.114|America/Argentina/Salta|m|n|
AQA|Araraquara Airport|Araraquara|BR|-21.812|-48.133|America/Sao_Paulo|m|s|
AQG|Anqing Tianzhushan Airport / Anqing North Air Base|Anqing|CN|30.582|117.05|Asia/Shanghai|m|s|
AQI|Qaisumah–Hafar Al-Batin International Airport|Qaisumah|SA|28.336|46.127|Asia/Riyadh|l|s|HBT, Qaisumah Domestic Airport
AQJ|King Hussein International Airport|Aqaba|JO|29.612|35.018|Asia/Amman|l|s|
AQP|Rodríguez Ballón International Airport|Arequipa|PE|-16.341|-71.569|America/Lima|l|s|
ARA|Acadiana Regional Airport|New Iberia|US|30.038|-91.884|America/Chicago|m|n|
ARC|Arctic Village Airport|Arctic Village|US|68.115|-145.579|America/Anchorage|m|s|
ARE|Antonio Nery Juarbe Pol Airport|Arecibo|PR|18.451|-66.676|America/Puerto_Rico|m|n|
ARH|Talagi Airport|Archangelsk|RU|64.6|40.717|Europe/Moscow|m|s|Арха́нгельск, Archangel
ARI|Chacalluta International Airport|Arica|CL|-18.348|-70.339|America/Santiago|m|s|
ARK|Arusha Airport|Arusha|TZ|-3.368|36.633|Asia/Riyadh|m|s|
ARM|Armidale Airport|Armidale|AU|-30.528|151.617|Australia/Sydney|m|s|
ARN|Stockholm-Arlanda Airport|Stockholm|SE|59.648|17.929|Europe/Berlin|l|s|
ART|Watertown International Airport|Watertown|US|43.992|-76.022|America/New_York|m|s|
ARU|Araçatuba Airport|Araçatuba|BR|-21.141|-50.425|America/Sao_Paulo|m|s|Dario Guarita State Airport
ARW|Arad International Airport|Arad|RO|46.176|21.264|Europe/Bucharest|m|s|
ARX|Aracati Dragão do Mar Regional Airport|Aracati|BR|-4.569|-37.805|America/Fortaleza|m|n|SNAT
ARY|Ararat Airport|Ararat|AU|-37.31|142.989|Australia/Melbourne|m|n|
ASA|Assab International Airport|Assab|ER|13.072|42.645|Asia/Riyadh|m|n|
ASB|Ashgabat International Airport|Ashgabat|TM|37.987|58.361|Asia/Ashgabat|l|s|Saparmurat Turkmenbashy International Airport
ASD|Andros Town Airport|Andros Town|BS|24.698|-77.796|America/Toronto|m|s|
ASE|Aspen-Pitkin County Airport (Sardy Field)|Aspen|US|39.223|-106.869|America/Denver|m|s|
ASF|Astrakhan Narimanovo Boris M. Kustodiev International Airport|Astrakhan|RU|46.283|48.011|Europe/Astrakhan|l|s|Astrahan Airport, Narimanovo Airport, Аэропорт Астрахань, Аэропорт Нариманово
ASI|RAF Ascension Island|Cat Hill|SH|-7.97|-14.393|Africa/Abidjan|m|s|Wideawake Airfield, Ascension Island Auxiliary Field
ASJ|Amami Airport|Amami|JP|28.431|129.713|Asia/Tokyo|m|s|
ASK|Yamoussoukro International Airport|Yamoussoukro|CI|6.903|-5.366|Africa/Abidjan|l|n|
ASM|Asmara International Airport|Asmara|ER|15.292|38.911|Asia/Riyadh|m|s|Yohannes International.
ASO|Asosa Airport|Asosa|ET|10.019|34.586|Asia/Riyadh|m|s|
ASP|Alice Springs Airport|Alice Springs|AU|-23.807|133.903|Australia/Darwin|m|s|
ASR|Kayseri Erkilet International Airport|Kayseri|TR|38.77|35.495|Europe/Istanbul|l|s|
AST|Astoria Regional Airport|Astoria|US|46.158|-123.879|America/Los_Angeles|m|n|
ASU|Silvio Pettirossi International Airport|Asunción|PY|-25.24|-57.519|America/Asuncion|l|s|Luque, Stroessner, Aeropuerto Internacional Silvio Pettirossi
ASV|Amboseli Airport|Ol Tukai|KE|-2.645|37.253|Asia/Riyadh|m|s|Maasai Amboseli Game Reserve
ASW|Aswan International Airport|Aswan|EG|23.961|32.82|Africa/Cairo|l|s|aswan airport
ATA|Comandante FAP German Arias Graziani Airport|Anta|PE|-9.347|-77.598|America/Lima|m|n|
ATC|Arthur's Town Airport|Arthur's Town|BS|24.629|-75.674|America/Toronto|m|s|
ATF|Chachoán Regional Airport|Ambato|EC|-1.212|-78.575|America/Guayaquil|m|n|Izamba
ATG|Minhas Air Base|Kamra|PK|33.869|72.401|Asia/Karachi|m|n|Attock
ATH|Athens Eleftherios Venizelos International Airport|Spata-Artemida|GR|37.936|23.945|Europe/Athens|l|s|
ATK|Atqasuk Edward Burnell Sr Memorial Airport|Atqasuk|US|70.467|-157.436|America/Anchorage|m|s|Z46
ATL|Hartsfield Jackson Atlanta International Airport|Atlanta|US|33.637|-84.428|America/New_York|l|s|
ATM|Altamira Interstate Airport|Altamira|BR|-3.253|-52.254|America/Santarem|m|s|
ATQ|Sri Guru Ram Das Ji International Airport|Amritsar|IN|31.71|74.797|Asia/Kolkata|l|s|Amritsar Air Force Station
ATR|Atar International Airport|Atar|MR|20.506|-13.044|Africa/Abidjan|m|n|
ATW|Appleton International Airport|Appleton|US|44.259|-88.519|America/Chicago|m|s|Outagamie County Regional Airport
ATY|Watertown Regional Airport|Watertown|US|44.914|-97.155|America/Chicago|m|s|
ATZ|Asyut International Airport|Asyut|EG|27.046|31.013|Africa/Cairo|l|s|
AUA|Queen Beatrix International Airport|Oranjestad|AW|12.501|-70.014|America/Puerto_Rico|l|s|Playa, Dakota Field
AUC|Santiago Perez Airport|Arauca|CO|7.069|-70.737|America/Bogota|m|s|
AUF|Auxerre Branches airport|Auxerre|FR|47.85|3.497|Europe/Paris|m|n|
AUG|Augusta State Airport|Augusta|US|44.321|-69.797|America/New_York|m|s|
AUH|Zayed International Airport|Abu Dhabi|AE|24.441|54.649|Asia/Dubai|l|s|Abu Dhabi International Airport
AUQ|Hiva Oa-Atuona Airport|Hiva Oa Island|PF|-9.769|-139.011|Pacific/Marquesas|m|s|HIX
AUR|Aurillac airport|Aurillac|FR|44.891|2.422|Europe/Paris|m|s|
AUS|Austin Bergstrom International Airport|Austin|US|30.198|-97.662|America/Chicago|l|s|BSM, KBSM, Bergstrom AFB
AUW|Wausau Downtown Airport|Wausau|US|44.926|-89.627|America/Chicago|m|n|
AUX|Araguaína Airport|Araguaína|BR|-7.228|-48.241|America/Araguaina|m|s|
AVA|Anshun Huangguoshu Airport|Anshun (Xixiu)|CN|26.261|105.873|Asia/Shanghai|m|s|
AVB|Aviano Air Base|Aviano|IT|46.032|12.597|Europe/Rome|m|n|Pagliano e Gori Airport, LIYW
AVI|Máximo Gómez Airport|Ciro Redondo|CU|22.027|-78.79|America/Havana|m|n|Ciego de Ávila
AVK|Arvaikheer Airport|Arvaikheer|MN|46.25|102.802|Asia/Ulaanbaatar|m|s|
AVL|Asheville Regional Airport|Asheville|US|35.435|-82.542|America/New_York|m|s|
AVN|Avignon Caumont airport|Avignon|FR|43.907|4.902|Europe/Paris|m|s|
AVP|Wilkes-Barre/Scranton International Airport|Wilkes-Barre/Scranton|US|41.337|-75.724|America/New_York|m|s|
AVR|Amravati Airport|Amravati|IN|20.815|77.718|Asia/Kolkata|m|s|
AVV|Melbourne Avalon International Airport|Geelong/Melbourne|AU|-38.04|144.467|Australia/Melbourne|l|s|Lara, Geelong
AWA|Hawassa International Airport|Hawassa|ET|7.101|38.396|Asia/Riyadh|l|s|Awasa
AWK|Wake Island Airfield|Wake Island|UM|19.282|166.637|Pacific/Tarawa|m|s|
AWZ|Qasem Soleimani International Airport|Ahvaz|IR|31.336|48.764|Asia/Tehran|l|s|Ahvaz, Ahvaz International Airport, Ahwaz
AXA|Clayton J. Lloyd International Airport|The Valley|AI|18.205|-63.054|America/Puerto_Rico|m|s|Wallblake Airport
AXD|Alexandroupoli Democritus Airport|Alexandroupolis|GR|40.856|25.956|Europe/Athens|m|s|
AXF|Alxa Left Banner Bayanhot Airport|Bayanhot|CN|38.748|105.584|Asia/Shanghai|m|s|
AXJ|Amakusa Airport|Amakusa|JP|32.482|130.159|Asia/Tokyo|m|s|
AXK|Ataq Airport|Ataq|YE|14.551|46.826|Asia/Riyadh|m|n|
AXM|El Eden Airport|Armenia|CO|4.453|-75.766|America/Bogota|m|s|
AXN|Chandler Field|Alexandria|US|45.866|-95.395|America/Chicago|m|n|
AXP|Spring Point Airport|Spring Point|BS|22.442|-73.971|America/Toronto|m|s|
AXR|Arutua Airport||PF|-15.248|-146.617|Pacific/Honolulu|m|s|
AXT|Akita Airport|Akita|JP|39.616|140.219|Asia/Tokyo|m|s|
AXU|Axum Airport|Axum|ET|14.147|38.773|Asia/Riyadh|m|s|Aksum, Emperor Yohannes IV Airport
AYJ|Maharshi Valmiki International Airport|Faizabad|IN|26.748|82.164|Asia/Kolkata|m|s|Maharishi Valmiki International
AYO|Aeropuerto Nacional Juan de Ayolas|Ayolas|PY|-27.378|-56.857|America/Asuncion|m|n|Aeropuerto Nacional de Juan De Ayolas
AYP|Air Force Colonel Alfredo Mendivil Duarte Airport|Ayacucho|PE|-13.155|-74.204|America/Lima|m|s|Coronel FAP Alfredo Mendivil Duarte
AYQ|Ayers Rock Connellan Airport|Yulara|AU|-25.186|130.977|Australia/Darwin|m|s|Uluru
AYT|Antalya International Airport|Antalya|TR|36.899|30.801|Europe/Istanbul|l|s|
AYX|Teniente General Gerardo Pérez Pinedo Airport|Atalaya|PE|-10.729|-73.767|America/Lima|m|n|
AZA|Mesa Gateway Airport|Mesa|US|33.308|-111.655|America/Phoenix|m|s|Higley Field, CHD, Phoenix-Mesa Gateway Airport, Williams Air Force Base, Williams Gateway Airport
AZD|Shahid Sadooghi Airport|Yazd|IR|31.905|54.277|Asia/Tehran|m|s|
AZI|Al Bateen Executive Airport|Abu Dhabi|AE|24.427|54.46|Asia/Dubai|l|n|Former Abu Dhabi International Airport
AZN|Andijan International Airport|Andijan|UZ|40.728|72.294|Asia/Tashkent|m|s|UTFA, UTKA, Andijan Airport, Andizhan Airport, Andijon Airport
AZO|Kalamazoo/Battle Creek International Airport|Kalamazoo|US|42.232|-85.55|America/Detroit|m|s|
AZR|Touat-Cheikh Sidi Mohamed Belkebir Airport|Adrar|DZ|27.838|-0.186|Africa/Algiers|m|s|لكبير مطار أدرار – توات الشيخ سيدي محمد بن
AZS|Samaná El Catey International Airport|Samana|DO|19.269|-69.737|America/Santo_Domingo|m|s|
BAB|Beale Air Force Base|Beale Air Force Base|US|39.136|-121.437|America/Los_Angeles|m|n|Marysville
BAD|Barksdale Air Force Base|Bossier City|US|32.502|-93.663|America/Chicago|m|n|
BAF|Westfield-Barnes Regional Airport|Westfield|US|42.158|-72.716|America/New_York|m|n|Barnes Municipal Airport, Springfield
BAG|Loakan Airport|Baguio|PH|16.375|120.62|Asia/Manila|m|n|Baguio Airport
BAH|Bahrain International Airport|Manama|BH|26.267|50.638|Asia/Qatar|l|s|مطار البحرين الدولي, EGYR, RAF Bahrain, RAF Muharraq
BAI|Buenos Aires Airport|Punta Arenas|CR|9.164|-83.33|America/Costa_Rica|m|n|
BAL|Batman Airport|Batman|TR|37.929|41.117|Europe/Istanbul|m|s|
BAQ|Ernesto Cortissoz International Airport|Barranquilla|CO|10.89|-74.781|America/Bogota|l|s|
BAR|Qionghai Bo'ao Airport|Qionghai (Basuo)|CN|19.141|110.453|Asia/Shanghai|m|s|
BAT|Chafei Amsei Airport|Barretos|BR|-20.585|-48.594|America/Sao_Paulo|m|n|SBBT
BAV|Baotou Donghe International Airport|Baotou|CN|40.56|109.997|Asia/Shanghai|l|s|Erliban, 包头东河
BAX|Barnaul Gherman Titov International Airport|Barnaul|RU|53.361|83.54|Asia/Barnaul|l|s|Аэропорт Барнаул, Barnaul West, Mikhaylovka, Novomikhaylovka
BAY|Maramureș International Airport|Tăuții-Măgherăuș|RO|47.658|23.464|Europe/Bucharest|m|s|Baia Mare
BBA|Balmaceda Airport|Balmaceda|CL|-45.916|-71.689|America/Coyhaique|m|s|
BBD|Curtis Field|Brady|US|31.179|-99.325|America/Chicago|m|n|
BBI|Biju Patnaik International Airport|Bhubaneswar|IN|20.251|85.815|Asia/Kolkata|l|s|
BBK|Kasane International Airport|Kasane|BW|-17.832|25.166|Africa/Johannesburg|l|s|
BBM|Battambang Airport|Battambang|KH|13.096|103.224|Asia/Jakarta|m|s|
BBN|Bario Airport|Bario|MY|3.735|115.479|Asia/Makassar|m|s|
BBO|Berbera Airport|Berbera|SO|10.385|44.937|Asia/Riyadh|m|s|
BBQ|Burton-Nibbs International Airport|Codrington|AG|17.621|-61.798|America/Puerto_Rico|m|s|Barbuda International Airport, New Barbuda Airport
BBS|Blackbushe Airport|Camberley, Surrey|GB|51.324|-0.848|Europe/London|m|n|RAF Hartford Bridge
BBT|Berbérati Airport|Berbérati|CF|4.222|15.786|Africa/Lagos|m|n|
BBU|Bucharest Băneasa Aurel Vlaicu International Airport|Bucharest|RO|44.503|26.103|Europe/Bucharest|l|s|BUH, Bucharest City
BCA|Gustavo Rizo Airport|Baracoa|CU|20.365|-74.506|America/Havana|m|s|
BCD|Bacolod-Silay International Airport|Bacolod City|PH|10.776|123.019|Asia/Manila|l|s|
BCE|Bryce Canyon Airport|Bryce Canyon|US|37.706|-112.145|America/Denver|m|n|
BCH|Baucau Airport|Baucau|TL|-8.486|126.4|Asia/Dili|m|s|English Madeira airport, Cakung Airport
BCI|Barcaldine Airport|Barcaldine|AU|-23.566|145.302|Australia/Brisbane|m|s|
BCL|Barra del Colorado Airport|Pococi|CR|10.769|-83.586|America/Costa_Rica|m|n|
BCM|Bacău George Enescu International Airport|Bacău|RO|46.522|26.91|Europe/Bucharest|l|s|RoAF 95th Air Base
BCN|Josep Tarradellas Barcelona-El Prat Airport|Barcelona|ES|41.297|2.078|Europe/Madrid|l|s|Barcelona International
BCO|Jinka Airport|Jinka|ET|5.75|36.56|Asia/Riyadh|m|s|Baco Airport
BCQ|Brak Airport|Brak|LY|27.653|14.272|Africa/Tripoli|m|n|Brach
BCT|Boca Raton Airport|Boca Raton|US|26.378|-80.108|America/New_York|m|n|Boca Raton AAF
BCU|Sir Abubakar Tafawa Balewa Bauchi State International Airport|Bauchi|NG|10.483|9.744|Africa/Lagos|l|s|Bauchi State Airport
BCW|Benguera Island Airport|Benguera Island|MZ|-21.853|35.438|Africa/Johannesburg|m|n|
BDA|L.F. Wade International Airport|Hamilton|BM|32.364|-64.678|Atlantic/Bermuda|l|s|Kindley Air Force Base, Fort Bell Army Airfield, NAS Bermuda, Naval Air Station Bermuda
BDB|Bundaberg Airport|Bundaberg|AU|-24.905|152.323|Australia/Brisbane|m|s|
BDE|Baudette International Airport|Baudette|US|48.728|-94.612|America/Chicago|m|n|
BDH|Bandar Lengeh International Airport|Bandar Lengeh|IR|26.532|54.825|Asia/Tehran|m|s|
BDJ|Syamsudin Noor International Airport|Banjarbaru|ID|-3.44|114.761|Asia/Makassar|l|s|WRBB, Banjarmasin, Banjarbaru
BDL|Bradley International Airport|Hartford|US|41.939|-72.688|America/New_York|l|s|HFD, Hartford
BDM|Bandırma Airport|Bandırma|TR|40.318|27.978|Europe/Istanbul|m|n|
BDO|Husein Sastranegara International Airport|Bandung|ID|-6.901|107.576|Asia/Jakarta|m|s|WIIB
BDQ|Vadodara International Airport|Vadodara|IN|22.336|73.226|Asia/Kolkata|l|s|Civil Airport Harni
BDR|Igor I Sikorsky Memorial Airport|Bridgeport|US|41.164|-73.126|America/New_York|m|n|
BDS|Brindisi Airport|Brindisi|IT|40.658|17.947|Europe/Rome|l|s|Brindisi Papola Casale Airport, Brindisi Salento Airport, Brindisi Casale Antonio Papolo Airport, Salento Airport
BDT|Gbadolite Airport|Gbadolite|CD|4.253|20.975|Africa/Lagos|m|s|Moanda
BDU|Bardufoss Airport|Målselv|NO|69.056|18.54|Europe/Berlin|m|s|
BEB|Benbecula Airport|Balivanich|GB|57.481|-7.363|Europe/London|m|s|
BED|Laurence G Hanscom Field|Bedford|US|42.47|-71.289|America/New_York|m|s|Hanscom Air Force Base
BEF|Bluefields Airport|Bluefields|NI|11.991|-83.774|America/Managua|m|s|
BEG|Belgrade Nikola Tesla Airport|Belgrade|RS|44.818|20.309|Europe/Belgrade|l|s|Beograd, Surčin Airport
BEJ|Kalimarau Airport|Tanjung Redeb - Borneo Island|ID|2.148|117.431|Asia/Makassar|m|s|Berau Airport, WALK, WRLK
BEK|Bareilly Air Force Station|Bareilly|IN|28.422|79.451|Asia/Kolkata|m|s|Trishul Air Base
BEL|Val de Cans/Júlio Cezar Ribeiro International Airport|Belém|BR|-1.379|-48.476|America/Belem|l|s|
BEM|Beni Mellal Airport|Oulad Yaich|MA|32.402|-6.316|Africa/Casablanca|l|s|
BEN|Benina International Airport|Benina|LY|32.097|20.27|Africa/Tripoli|l|s|Benghazi, Soluch Airfield
BEP|Bellary Airport|Bellary|IN|15.163|76.883|Asia/Kolkata|m|n|Jindal Vijayanagar, Vijaynagar
BEQ|RAF Honington|Bury Saint Edmunds, Suffolk|GB|52.343|0.773|Europe/London|m|n|
BER|Berlin Brandenburg Airport|Berlin|DE|52.362|13.502|Europe/Berlin|l|s|Willy Brandt
BES|Brest Bretagne airport|Brest|FR|48.448|-4.419|Europe/Paris|l|s|
BET|Bethel Airport|Bethel|US|60.78|-161.838|America/Anchorage|m|s|
BEU|Bedourie Airport|Bedourie|AU|-24.346|139.46|Australia/Brisbane|m|s|
BEW|Beira International Airport|Beira|MZ|-19.796|34.908|Africa/Johannesburg|l|s|
BEX|RAF Benson|Wallingford, Oxfordshire|GB|51.614|-1.096|Europe/London|m|n|
BEY|Beirut Rafic Hariri International Airport|Beirut|LB|33.82|35.487|Asia/Beirut|l|s|Chaldea, Beirut Air Base, مطار بيروت رفيق الحريري الدولي
BFD|Bradford Regional Airport|Bradford|US|41.803|-78.64|America/New_York|m|s|
BFE|Bielefeld Airport|Bielefeld|DE|51.965|8.544|Europe/Berlin|m|n|Flugplatz-Windelsbleiche
BFF|Western Neb. Rgnl/William B. Heilig Airport|Scottsbluff|US|41.874|-103.596|America/Denver|m|s|William B. Heilig Field
BFH|Bacacheri Airport|Curitiba|BR|-25.405|-49.232|America/Sao_Paulo|m|n|
BFI|King County International Airport - Boeing Field|Seattle|US|47.527|-122.3|America/Los_Angeles|m|s|
BFJ|Bijie Feixiong Airport|Bijie|CN|27.267|105.472|Asia/Shanghai|m|s|
BFK|Buckley Space Force Base|Aurora|US|39.702|-104.752|America/Denver|m|n|Buckley AFB, Buckley ANGB, Denver NAS, Buckley Field, Demolition Bombing Range–Lowry Auxiliary Field
BFL|Meadows Field|Bakersfield|US|35.434|-119.057|America/Los_Angeles|m|s|
BFM|Mobile Downtown Airport|Mobile|US|30.627|-88.068|America/Chicago|m|n|
BFN|Bram Fischer International Airport|Bloemfontein|ZA|-29.093|26.302|Africa/Johannesburg|l|s|AFB Bloemspruit, Bloemspruit
BFO|Buffalo Range Airport|Chiredzi|ZW|-21.008|31.579|Africa/Johannesburg|m|n|
BFP|Beaver County Airport|Beaver Falls|US|40.772|-80.391|America/New_York|m|n|
BFS|Belfast International Airport|Belfast|GB|54.658|-6.216|Europe/London|l|s|Aldergrove, RAF Aldergrove
BFU|Bengbu Renheji Airport|Bengbu|CN|32.848|117.32|Asia/Shanghai|m|n|
BFV|Buri Ram Airport|Buriram|TH|15.229|103.253|Asia/Jakarta|m|s|
BFX|Bafoussam Airport|Bafoussam|CM|5.537|10.355|Africa/Lagos|m|n|
BFY|Bengbu Tenghu Airport|Bengbu|CN|33.166|117.058|Asia/Shanghai|m|s|蚌埠滕湖机场
BGA|Palonegro Airport|Bucaramanga|CO|7.127|-73.185|America/Bogota|m|s|
BGC|Bragança Airport|Bragança|PT|41.858|-6.707|Europe/Lisbon|m|s|
BGF|Bangui M'Poko International Airport|Bangui|CF|4.398|18.519|Africa/Lagos|l|s|
BGG|Bingöl Airport|Bingöl|TR|38.86|40.594|Europe/Istanbul|m|s|Çeltiksuyu
BGI|Grantley Adams International Airport|Bridgetown|BB|13.075|-59.491|America/Barbados|l|s|Seawell
BGM|Greater Binghamton/Edwin A Link field|Binghamton|US|42.209|-75.98|America/New_York|m|s|Broome County Airport
BGN|Belaya Gora Airport|Belaya Gora|RU|68.556|146.228|Asia/Srednekolymsk|m|n|УЕСГ, Аэропорт Белая Гора
BGO|Bergen Airport, Flesland|Bergen|NO|60.293|5.218|Europe/Berlin|l|s|
BGR|Bangor International Airport|Bangor|US|44.806|-68.827|America/New_York|m|s|
BGW|Baghdad International Airport / New Al Muthana Air Base|Baghdad|IQ|33.263|44.235|Asia/Baghdad|l|s|SDA, BIAP, VBC, ORBS, Camp Sather, Saddam International Airport, Al Anbar Airport
BGX|Comandante Gustavo Kraemer Airport|Bagé|BR|-31.39|-54.112|America/Sao_Paulo|m|n|
BGY|Il Caravaggio International Airport|Orio al Serio|IT|45.669|9.709|Europe/Rome|l|s|Orio al Serio International Airport, Milan Bergamo Airport
BHB|Hancock County-Bar Harbor Airport|Bar Harbor|US|44.45|-68.362|America/New_York|m|s|
BHD|George Best Belfast City Airport|Belfast|GB|54.618|-5.872|Europe/London|m|s|
BHE|Woodbourne Airport|Blenheim|NZ|-41.518|173.87|Pacific/Auckland|m|s|
BHH|Bisha Airport|Bisha|SA|19.984|42.621|Asia/Riyadh|m|s|
BHI|Comandante Espora Airport|Bahía Blanca|AR|-38.725|-62.169|America/Argentina/Buenos_Aires|m|s|Bahía Blanca Airport
BHJ|Bhuj Airport|Bhuj|IN|23.288|69.67|Asia/Kolkata|m|s|Bhuj Rudra Mata Air Force Station, Shyamji Krishna Verma
BHK|Bukhara International Airport|Bukhara|UZ|39.775|64.482|Asia/Samarkand|l|s|UTSB, Buhara, Buxoro
BHM|Birmingham-Shuttlesworth International Airport|Birmingham|US|33.563|-86.751|America/Chicago|l|s|
BHO|Raja Bhoj International Airport|Bhopal|IN|23.288|77.337|Asia/Kolkata|l|s|
BHQ|Broken Hill Airport|Broken Hill|AU|-32.001|141.472|Australia/Broken_Hill|m|s|
BHS|Bathurst Airport|Bathurst|AU|-33.407|149.651|Australia/Sydney|m|s|
BHU|Bhavnagar Airport|Bhavnagar|IN|21.752|72.185|Asia/Kolkata|m|s|
BHV|Bahawalpur Airport|Bahawalpur|PK|29.348|71.718|Asia/Karachi|m|s|
BHX|Birmingham Airport|Birmingham, West Midlands|GB|52.454|-1.748|Europe/London|l|s|Birmingham International Airport
BHY|Beihai Fucheng Airport|Beihai|CN|21.539|109.294|Asia/Shanghai|m|s|北海，北海福成机场
BIA|Bastia-Poretta International airport|Bastia|FR|42.553|9.484|Europe/Paris|l|s|
BIF|Biggs Army Air Field (Fort Bliss)|Fort Bliss/El Paso|US|31.85|-106.38|America/Denver|m|n|
BIG|Allen Army Airfield|Delta Junction Ft Greely|US|63.994|-145.722|America/Anchorage|m|n|Big Delta Army Airfield
BIH|Eastern Sierra Regional Airport|Bishop|US|37.373|-118.364|America/Los_Angeles|m|s|
BIK|Frans Kaisiepo Airport|Biak|ID|-1.19|136.108|Asia/Tokyo|m|s|
BIL|Billings Logan International Airport|Billings|US|45.809|-108.541|America/Denver|m|s|
BIM|South Bimini Airport|South Bimini|BS|25.7|-79.265|America/Toronto|m|s|
BIO|Bilbao Airport|Bilbao|ES|43.301|-2.911|Europe/Madrid|l|s|
BIQ|Biarritz Pays Basque airport|Biarritz|FR|43.468|-1.523|Europe/Paris|m|s|
BIR|Biratnagar Airport|Biratnagar|NP|26.482|87.264|Asia/Kathmandu|m|s|
BIS|Bismarck Municipal Airport|Bismarck|US|46.773|-100.747|America/Chicago|m|s|Burleigh County Airport
BIU|Bildudalur Airport|Bildudalur|IS|65.641|-23.546|Africa/Abidjan|m|n|
BIX|Keesler Air Force Base|Biloxi|US|30.41|-88.924|America/Chicago|m|n|
BIY|Bisho Airport|Bisho|ZA|-32.897|27.279|Africa/Johannesburg|m|n|
BJA|Soummam–Abane Ramdane Airport|Béjaïa|DZ|36.713|5.07|Africa/Algiers|l|s|Béjaïa
BJB|Bojnord Airport|Bojnord|IR|37.493|57.308|Asia/Tehran|m|s|Bojnourd
BJC|Rocky Mountain Metropolitan Airport|Denver|US|39.909|-105.117|America/Denver|m|s|Jefferson County Airport, Jeffco Airport
BJF|Båtsfjord Airport|Båtsfjord|NO|70.6|29.693|Europe/Berlin|m|s|
BJI|Bemidji Regional Airport|Bemidji|US|47.509|-94.934|America/Chicago|m|n|
BJL|Banjul International Airport|Banjul (Yundum)|GM|13.338|-16.652|Africa/Abidjan|l|s|Yundum international Airport
BJM|Bujumbura Melchior Ndadaye International Airport|Bujumbura|BI|-3.324|29.319|Africa/Johannesburg|l|s|
BJO|Bermejo Airport|Bermejo|BO|-22.773|-64.313|America/Puerto_Rico|m|n|
BJR|Bahir Dar Airport|Bahir Dar|ET|11.608|37.322|Asia/Riyadh|m|s|Dejazmach Belay Zeleke
BJV|Milas Bodrum International Airport|Bodrum|TR|37.249|27.664|Europe/Istanbul|l|s|
BJX|Guanajuato International Airport|Silao|MX|20.993|-101.48|America/Mexico_City|l|s|Del Bajío International Airport, León/Bajío International Airport
BJY|Batajnica Air Base|Zemun|RS|44.935|20.258|Europe/Belgrade|m|n|Batajnica Colonel Milenko Pavlović Air Base
BJZ|Badajoz Airport|Badajoz|ES|38.891|-6.821|Europe/Madrid|m|s|Talavera La Real Airport
BKA|Baykit Airport|Baykit|RU|61.677|96.355|Asia/Krasnoyarsk|m|n|Аэропорт Байкит
BKB|Nal Airport|Bikaner|IN|28.071|73.207|Asia/Kolkata|m|n|Nal Air Force Station
BKE|Baker City Municipal Airport|Baker City|US|44.837|-117.809|America/Los_Angeles|m|n|
BKG|Branson Airport|Branson|US|36.532|-93.201|America/Chicago|m|s|
BKH|Barking Sands Airport|Kekaha|US|22.023|-159.785|Pacific/Honolulu|m|n|Pacific Missle Range Facility Barking Sands, Kauai
BKI|Kota Kinabalu International Airport|Kota Kinabalu|MY|5.933|116.049|Asia/Makassar|l|s|Lapangan Terbang Antarabangsa Kota Kinabalu, Jesselton Airfield
BKK|Suvarnabhumi Airport|Bangkok|TH|13.681|100.747|Asia/Jakarta|l|s|
BKL|Burke Lakefront Airport|Cleveland|US|41.518|-81.683|America/New_York|m|n|
BKN|Balkanabat International Airport|Balkanabat|TM|39.681|54.206|Asia/Ashgabat|m|s|Аэродром Джебел, Jebel Airport
BKO|Modibo Keita International Airport|Bamako|ML|12.534|-7.95|Africa/Abidjan|l|s|Senou Airport
BKQ|Blackall Airport|Blackall|AU|-24.432|145.43|Australia/Brisbane|m|s|
BKS|Fatmawati Soekarno Airport|Bengkulu|ID|-3.864|102.339|Asia/Jakarta|m|s|WIPL, Padang Kemiling Airport
BKW|Raleigh County Memorial Airport|Beaver|US|37.787|-81.124|America/New_York|m|s|Beckley
BKY|Bukavu Kavumu Airport|Kamakombe|CD|-2.309|28.809|Africa/Johannesburg|m|n|
BLA|General José Antonio Anzoategui International Airport|Barcelona|VE|10.111|-64.692|America/Caracas|l|s|Barcelona, Puero La Cruz, Lecheria
BLD|Boulder City Municipal Airport|Boulder City|US|35.947|-114.859|America/Los_Angeles|m|s|61B
BLE|Dala Airport|Borlange|SE|60.422|15.515|Europe/Berlin|m|s|
BLF|Mercer County Airport|Bluefield|US|37.296|-81.208|America/New_York|m|n|
BLH|Blythe Airport|Blythe|US|33.619|-114.717|America/Los_Angeles|m|n|
BLI|Bellingham International Airport|Bellingham|US|48.793|-122.538|America/Los_Angeles|m|s|
BLJ|Batna Mostefa Ben Boulaid Airport|Batna|DZ|35.752|6.309|Africa/Algiers|l|s|
BLK|Blackpool Airport|Blackpool|GB|53.772|-3.029|Europe/London|m|n|
BLL|Billund Airport|Billund|DK|55.74|9.157|Europe/Berlin|l|s|
BLN|Benalla Airport|Benalla|AU|-36.552|146.007|Australia/Melbourne|m|n|
BLQ|Bologna Guglielmo Marconi Airport|Bologna|IT|44.535|11.289|Europe/Rome|l|s|Borgo Panigale Airport
BLR|Kempegowda International Airport Bengaluru|Bengaluru|IN|13.198|77.706|Asia/Kolkata|l|s|Bangalore
BLT|Blackwater Airport||AU|-23.603|148.807|Australia/Brisbane|m|n|
BLV|Scott AFB/Midamerica Airport|Belleville|US|38.545|-89.835|America/Chicago|m|s|Scott Air Force Base
BLZ|Chileka International Airport|Blantyre|MW|-15.677|34.972|Africa/Johannesburg|l|s|
BMA|Stockholm-Bromma Airport|Stockholm|SE|59.354|17.942|Europe/Berlin|m|s|
BME|Broome International Airport|Broome|AU|-17.949|122.228|Australia/Perth|l|s|
BMG|Monroe County Airport|Bloomington|US|39.146|-86.617|America/Indiana/Indianapolis|m|n|
BMI|Central Illinois Regional Airport at Bloomington-Normal|Bloomington/Normal|US|40.477|-88.916|America/Chicago|m|s|
BMM|Bitam Airport|Bitam|GA|2.076|11.493|Africa/Lagos|m|n|
BMU|Sultan Muhammad Salahuddin Airport|Bima|ID|-8.537|118.685|Asia/Makassar|m|s|WRRB, PBW, Palibelo Airport, Bima, Raba Airfield
BMV|Buon Ma Thuot Airport|Buon Ma Thuot|VN|12.668|108.12|Asia/Ho_Chi_Minh|m|s|
BMW|Bordj Badji Mokhtar Airport|Bordj Badji Mokhtar|DZ|21.378|0.927|Africa/Algiers|m|s|
BNA|Nashville International Airport|Nashville|US|36.124|-86.678|America/Chicago|l|s|
BND|Bandar Abbas International Airport|Bandar Abbas|IR|27.218|56.378|Asia/Tehran|l|s|
BNE|Brisbane International Airport|Brisbane|AU|-27.384|153.117|Australia/Brisbane|l|s|
BNI|Benin Airport|Benin|NG|6.317|5.6|Africa/Lagos|m|s|
BNK|Ballina Byron Gateway Airport|Ballina|AU|-28.833|153.561|Australia/Sydney|m|s|
BNN|Brønnøysund Airport, Brønnøy|Brønnøy|NO|65.461|12.217|Europe/Berlin|m|s|Bronnoy
BNO|Burns Municipal Airport|Burns|US|43.59|-118.955|America/Los_Angeles|m|n|
BNS|Barinas Airport|Barinas|VE|8.615|-70.214|America/Caracas|m|s|
BNX|Banja Luka International Airport|Mahovljani|BA|44.941|17.298|Europe/Belgrade|l|s|Mahovljani Airport
BOB|Bora Bora Airport|Motu Mute|PF|-16.444|-151.751|Pacific/Honolulu|m|s|
BOC|Bocas del Toro Isla Colón International Airport|Isla Colón|PA|9.341|-82.251|America/Panama|m|s|Jose Ezequiel Hall
BOD|Bordeaux–Mérignac Airport|Bordeaux|FR|44.829|-0.715|Europe/Paris|l|s|
BOG|El Dorado International Airport|Bogota|CO|4.702|-74.147|America/Bogota|l|s|Cundinamarca
BOH|Bournemouth Airport|Bournemouth|GB|50.78|-1.84|Europe/London|m|s|RAF Hurn
BOI|Boise Air Terminal/Gowen Field|Boise|US|43.564|-116.223|America/Boise|l|s|
BOJ|Burgas Airport|Burgas|BG|42.57|27.515|Europe/Sofia|l|s|Bourgas
BOM|Chhatrapati Shivaji Maharaj International Airport|Mumbai|IN|19.089|72.868|Asia/Kolkata|l|s|Bombay, Sahar International Airport
BON|Flamingo International Airport|Kralendijk|BQ|12.131|-68.269|America/Puerto_Rico|l|s|Bonaire
BOO|Bodø Airport|Bodø|NO|67.269|14.365|Europe/Berlin|l|s|Bodø Air Force Base, Bodø Main Air Station
BOR|Bokeo International Airport|Ton Phueng|LA|20.324|100.165|Asia/Jakarta|m|s|
BOS|Boston Logan International Airport|Boston|US|42.362|-71.008|America/New_York|l|s|General Edward Lawrence Logan International Airport
BOU|Bourges airport|Bourges|FR|47.06|2.37|Europe/Paris|m|n|
BOY|Bobo Dioulasso Airport|Bobo Dioulasso|BF|11.16|-4.331|Africa/Abidjan|l|s|
BPC|Bamenda Airport|Bamenda|CM|6.039|10.123|Africa/Lagos|m|n|
BPE|Qinhuangdao Beidaihe Airport|Qinhuangdao (Changli)|CN|39.666|119.061|Asia/Shanghai|m|s|
BPG|Barra do Garças Airport|Barra do Garças|BR|-15.861|-52.389|America/Cuiaba|m|n|
BPH|Bislig Airport|Bislig|PH|8.195|126.321|Asia/Manila|m|n|
BPI|Miley Memorial Field|Big Piney|US|42.585|-110.111|America/Denver|m|n|Big Piney-Marbleton Airport
BPL|Bole Alashankou Airport|Bole|CN|44.895|82.3|Asia/Shanghai|m|s|
BPM|Begumpet Airport|Hyderabad|IN|17.453|78.468|Asia/Kolkata|m|n|Begumpet Air Force Station, HYD, Hyderabad Airport
BPN|Sultan Aji Muhammad Sulaiman Sepinggan International Airport|Balikpapan|ID|-1.268|116.895|Asia/Makassar|l|s|WRLL, Balikpapan Airport, Sepinggan Airport, Sepinggang Airfield
BPS|Porto Seguro International Airport|Porto Seguro|BR|-16.438|-39.081|America/Bahia|l|s|
BPT|Jack Brooks Regional Airport|Beaumont/Port Arthur|US|29.951|-94.021|America/Chicago|m|s|Southeast Texas Regional
BPX|Qamdo Bangda Airport|Bangda|CN|30.554|97.108|Asia/Shanghai|m|s|
BPY|Besalampy Airport|Besalampy|MG|-16.745|44.482|Asia/Riyadh|m|s|
BQA|Dr. Juan C. Angara Airport|Baler|PH|15.729|121.5|Asia/Manila|m|n|Baler, Baler Airport
BQH|London Biggin Hill Airport|London|GB|51.331|0.032|Europe/London|m|n|RAF Biggin Hill
BQK|Brunswick Golden Isles Airport|Brunswick|US|31.259|-81.466|America/New_York|m|s|Glynco Jetport
BQL|Boulia Airport||AU|-22.913|139.9|Australia/Brisbane|m|s|
BQN|Rafael Hernández International Airport|Aguadilla|PR|18.495|-67.129|America/Puerto_Rico|m|s|Ramey, TJFF
BQS|Ignatyevo Airport|Blagoveschensk|RU|50.427|127.416|Asia/Yakutsk|m|s|УХББ, Blagoveschensk Airport, Blagoveshchensk Airport, Аэропорт Игнатьево, Аэропорт Благовещенск
BQT|Brest International Airport|Brest|BY|52.108|23.897|Europe/Minsk|l|s|Аэропорт Брест
BQU|J F Mitchell Airport|Bequia|VC|12.988|-61.262|America/Puerto_Rico|m|s|
BRC|Teniente Luis Candelaria International Airport|San Carlos de Bariloche|AR|-41.151|-71.158|America/Argentina/Salta|l|s|
BRD|Brainerd Lakes Regional Airport|Brainerd|US|46.403|-94.13|America/Chicago|m|s|Crow Wing County Airport
BRE|Bremen Airport|Bremen|DE|53.047|8.789|Europe/Berlin|l|s|
BRI|Bari Karol Wojtyła International Airport|Bari|IT|41.139|16.761|Europe/Rome|l|s|Bari Karol Wojtyla International Airport, Palese Macchie Airport, Palese Airport
BRK|Bourke Airport||AU|-30.039|145.952|Australia/Sydney|m|s|
BRL|Southeast Iowa Regional Airport|Burlington|US|40.783|-91.126|America/Chicago|m|s|
BRM|Jacinto Lara International Airport|Barquisimeto|VE|10.043|-69.359|America/Caracas|l|s|
BRN|Bern Airport|Bern|CH|46.913|7.499|Europe/Zurich|m|s|LSZB, Belp, Bern-Belp, Bern-Belp Regional Airfield, Regionalflugplatz Bern-Belp
BRO|Brownsville South Padre Island International Airport|Brownsville|US|25.907|-97.425|America/Chicago|m|s|
BRQ|Brno-Tuřany Airport|Brno|CZ|49.151|16.694|Europe/Prague|m|s|
BRR|Barra Airport|Eoligarry|GB|57.023|-7.443|Europe/London|m|s|Barra Eoligarry Airport, Barra Island
BRS|Bristol Airport|Bristol|GB|51.382|-2.716|Europe/London|l|s|Lulsgate Bottom
BRT|Bathurst Island Airport|Wurrumiyanga|AU|-11.765|130.616|Australia/Darwin|m|n|
BRU|Brussels Airport|Zaventem|BE|50.901|4.484|Europe/Brussels|l|s|Brussels National, Zaventem, EBMB
BRW|Wiley Post Will Rogers Memorial Airport|Utqiaġvik|US|71.285|-156.766|America/Anchorage|m|s|Barrow
BRX|Maria Montez International Airport|Barahona|DO|18.251|-71.12|America/Santo_Domingo|m|s|
BSA|Bender Qassim International Airport|Bosaso|SO|11.275|49.139|Asia/Riyadh|l|s|
BSB|Presidente Juscelino Kubitschek International Airport|Brasília|BR|-15.869|-47.921|America/Sao_Paulo|l|s|
BSC|José Celestino Mutis Airport|Bahía Solano|CO|6.203|-77.395|America/Bogota|m|s|
BSD|Baoshan Yunrui Airport|Baoshan (Longyang)|CN|25.053|99.168|Asia/Shanghai|m|s|Baoshan Yunduan Airport
BSG|Bata International Airport|Bata|GQ|1.905|9.806|Africa/Lagos|l|s|
BSJ|Bairnsdale Airport|Bairnsdale|AU|-37.888|147.569|Australia/Melbourne|m|n|
BSK|Biskra - Mohamed Khider Airport|Biskra|DZ|34.793|5.739|Africa/Algiers|l|s|
BSL|EuroAirport Basel–Mulhouse–Freiburg|Bâle / Mulhouse|FR|47.601|7.521|Europe/Paris|l|s|MLH, EAP, LSZM, Bâle, Basle
BSO|Basco Airport|Basco|PH|20.451|121.98|Asia/Manila|m|s|Irport nu Basco, Paliparang Basco, Pagtayaban ti Basco
BSR|Basra International Airport|Basra|IQ|30.549|47.662|Asia/Baghdad|l|s|Basrah
BSZ|Manas International Airport|Bishkek|KG|43.061|74.478|Asia/Bishkek|l|s|FRU, UAFM, Manas Air Force Base
BTC|Batticaloa International Airport|Batticaloa|LK|7.705|81.677|Asia/Colombo|m|s|
BTH|Hang Nadim International Airport|Batam|ID|1.121|104.119|Asia/Jakarta|l|s|WIKB
BTI|Barter Island Long Range Radar Station Airport|Barter Island|US|70.134|-143.582|America/Anchorage|m|s|
BTJ|Sultan Iskandar Muda International Airport|Banda Aceh|ID|5.525|95.42|Asia/Jakarta|l|s|WIAB
BTK|Bratsk Airport|Bratsk|RU|56.37|101.702|Asia/Irkutsk|m|s|УИББ, Аэропорт Братск
BTL|Battle Creek Executive Airport at Kellogg Field|Battle Creek|US|42.307|-85.252|America/Detroit|m|n|W K Kellogg
BTM|Bert Mooney Airport|Butte|US|45.955|-112.497|America/Denver|m|s|
BTR|Baton Rouge Metropolitan Airport|Baton Rouge|US|30.533|-91.15|America/Chicago|m|s|
BTS|M. R. Štefánik Airport|Bratislava|SK|48.17|17.213|Europe/Prague|l|s|
BTU|Bintulu Airport|Bintulu|MY|3.124|113.02|Asia/Makassar|m|s|
BTV|Patrick Leahy Burlington International Airport|Burlington|US|44.472|-73.153|America/New_York|m|s|
BTZ|Betong International Airport|Betong|TH|5.79|101.15|Asia/Jakarta|m|n|
BUA|Buka Airport|Buka Island|PG|-5.422|154.673|Pacific/Bougainville|m|s|
BUD|Budapest Liszt Ferenc International Airport|Budapest|HU|47.43|19.262|Europe/Budapest|l|s|Ferihegyi nemzetközi repülőtér
BUF|Buffalo Niagara International Airport|Buffalo|US|42.94|-78.732|America/New_York|l|s|
BUG|Benguela Airport|Benguela|AO|-12.609|13.404|Africa/Lagos|m|n|Aeroporto 17 de Setembro, Gen. V. Deslandes Airport
BUJ|Bou Saada Airport|Ouled Sidi Brahim|DZ|35.333|4.206|Africa/Algiers|m|n|
BUN|Gerardo Tobar López Airport|Buenaventura|CO|3.82|-76.99|America/Bogota|m|s|
BUP|Bhatinda Air Force Station||IN|30.27|74.756|Asia/Kolkata|m|n|
BUQ|Joshua Mqabuko Nkomo International Airport|Bulawayo|ZW|-20.016|28.623|Africa/Johannesburg|l|s|FVBU
BUR|Hollywood Burbank/Bob Hope Airport|Burbank|US|34.203|-118.358|America/Los_Angeles|l|s|United Airport, Union Air Terminal, Lockheed Air Terminal, Burbank–Glendale–Pasadena
BUS|Alexander Kartveli Batumi International Airport|Batumi|GE|41.609|41.6|Asia/Tbilisi|l|s|Black Sea
BUX|Bunia Airport|Bunia|CD|1.566|30.221|Africa/Johannesburg|m|s|
BUZ|Bushehr Airport|Bushehr|IR|28.945|50.835|Asia/Tehran|m|s|
BVA|Beauvais-Tillé airport|Beauvais|FR|49.454|2.113|Europe/Paris|l|s|
BVB|Atlas Brasil Cantanhede International Airport|Boa Vista|BR|2.846|-60.691|America/Boa_Vista|l|s|Boa Vista International Airport
BVC|Aristides Pereira International Airport|Rabil|CV|16.136|-22.889|Atlantic/Cape_Verde|l|s|Boa Vista Island
BVE|Brive Souillac airport|Brive|FR|45.04|1.486|Europe/Paris|m|s|Vallee de la Dordogne, Brive-la-Gaillarde
BVG|Berlevåg Airport|Berlevåg|NO|70.872|29.034|Europe/Berlin|m|s|
BVH|Brigadeiro Camarão Airport|Vilhena|BR|-12.694|-60.098|America/Porto_Velho|m|s|Vilhena Airport
BVI|Birdsville Airport||AU|-25.897|139.348|Australia/Brisbane|m|s|
BVJ|Bovanenkovo Airport|Bovanenkovo|RU|70.315|68.334|Asia/Yekaterinburg|m|s|HELIOPS, GAZPROM, LNG
BVY|Beverly Regional Airport|Beverly / Danvers|US|42.584|-70.916|America/New_York|m|n|
BWA|Gautam Buddha International Airport|Siddharthanagar (Bhairahawa)|NP|27.505|83.41|Asia/Kathmandu|l|s|Bhairahawa Airport
BWE|Braunschweig-Wolfsburg Airport|Braunschweig|DE|52.319|10.556|Europe/Berlin|m|n|
BWF|Barrow Walney Island Airport|Barrow-in-Furness|GB|54.129|-3.268|Europe/London|m|n|
BWG|Bowling Green Warren County Regional Airport|Bowling Green|US|36.965|-86.42|America/Chicago|m|n|
BWH|RMAF Butterworth Air Base|Butterworth|MY|5.466|100.391|Asia/Singapore|m|n|RAF Butterworth
BWI|Baltimore/Washington International Thurgood Marshall Airport|Baltimore|US|39.175|-76.668|America/New_York|l|s|Friendship International
BWK|Brač Airport|Gornji Humac|HR|43.284|16.678|Europe/Belgrade|m|s|Bol Airport
BWN|Brunei International Airport|Bandar Seri Begawan|BN|4.944|114.928|Asia/Makassar|l|s|
BWO|Balakovo Airport|Balakovo|RU|51.858|47.746|Europe/Saratov|m|s|Malaya Bykovka Airport, Аэропорт Балаково, Аэропорт Малая Быковка
BWQ|Brewarrina Airport||AU|-29.976|146.814|Australia/Sydney|m|n|
BWT|Wynyard Airport|Burnie|AU|-40.997|145.726|Australia/Hobart|m|s|
BWU|Sydney Bankstown Airport|Sydney|AU|-33.924|150.991|Australia/Sydney|m|n|
BXB|Babo Airport|Babo|ID|-2.532|133.439|Asia/Tokyo|m|n|
BXE|Bakel Airport|Bakel|SN|14.847|-12.468|Africa/Abidjan|m|n|
BXH|Balkhash Airport|Balkhash|KZ|46.894|75.005|Asia/Almaty|m|s|Balqash
BXR|Bam Airport|Bam|IR|29.084|58.45|Asia/Tehran|m|s|
BXU|Bancasi Airport|Butuan|PH|8.951|125.479|Asia/Manila|m|s|
BXY|Baikonur Krayniy International Airport|Baikonur|KZ|45.622|63.211|Asia/Qyzylorda|l|s|Krayniy Airport, Аэропорт Крайний
BYC|Yacuiba Airport|Yacuíba|BO|-21.961|-63.652|America/Puerto_Rico|m|n|
BYH|Arkansas International Airport|Blytheville|US|35.964|-89.944|America/Chicago|m|n|Blytheville AFB, Eaker AFB
BYI|Burley Municipal Airport|Burley|US|42.543|-113.772|America/Boise|m|n|J R Jack Simplot Airport
BYJ|Beja Airport / Airbase|Beja|PT|38.079|-7.932|Europe/Lisbon|m|n|Beja Air Base, Base Aérea de Beja, Base Aérea Nº 11, BA11
BYK|Bouaké Airport|Bouaké|CI|7.739|-5.074|Africa/Abidjan|m|s|
BYM|Carlos Manuel de Cespedes Airport|Bayamo|CU|20.396|-76.621|America/Havana|m|s|
BYN|Bayankhongor Airport|Bayankhongor|MN|46.163|100.704|Asia/Ulaanbaatar|m|s|
BYS|Bicycle Lake Army Air Field|Fort Irwin/Barstow|US|35.28|-116.63|America/Los_Angeles|m|n|
BYU|Bayreuth Airport|Bindlach|DE|49.985|11.64|Europe/Berlin|m|n|Bindlacher Berg Airport
BZB|Bazaruto Island Airport|Bazaruto Island|MZ|-21.541|35.473|Africa/Johannesburg|m|n|
BZC|Umberto Modiano Airport|Cabo Frio|BR|-22.771|-41.963|America/Sao_Paulo|m|n|SBBZ
BZD|Balranald Airport||AU|-34.625|143.577|Australia/Sydney|m|n|
BZE|Philip S. W. Goldson International Airport|Belize City|BZ|17.54|-88.304|America/Belize|l|s|Belize International, Ladyville
BZG|Ignacy Jan Paderewski Bydgoszcz Airport|Bydgoszcz|PL|53.097|17.978|Europe/Warsaw|m|s|Szwederowo, Bromberg
BZI|Balıkesir Airport|Balıkesir|TR|39.619|27.926|Europe/Istanbul|m|s|Balıkesir Air Base, Balıkesir Central, Balıkesir Merkez
BZK|Bryansk International Airport|Bryansk|RU|53.214|34.176|Europe/Moscow|m|n|Аэропорт Брянск, УУБП
BZL|Barisal Airport|Barisal|BD|22.801|90.301|Asia/Dhaka|m|s|
BZN|Bozeman Yellowstone International Airport|Bozeman|US|45.779|-111.154|America/Denver|m|s|Gallatin Field
BZO|Bolzano Airport|Bolzano|IT|46.459|11.326|Europe/Rome|m|s|G Sabelli, Dolomiti
BZR|Béziers Vias airport|Béziers|FR|43.324|3.354|Europe/Paris|m|s|
BZU|Buta Zega Airport|Buta|CD|2.818|24.794|Africa/Johannesburg|m|n|
BZV|Maya-Maya International Airport|Brazzaville|CG|-4.252|15.253|Africa/Lagos|l|s|
BZX|Bazhong Enyang Airport|Bazhong|CN|31.738|106.645|Asia/Shanghai|m|s|
BZY|Bălți-Leadoveni International Airport|Bălți|MD|47.838|27.781|Europe/Chisinau|m|n|Beltsy International Airport, Lyadoveny Airport, Leadoveny Airport, Lyadoveni Airport, Leadoveni Airport, Аэропорт Бельцы
BZZ|RAF Brize Norton|Carterton, Oxfordshire|GB|51.75|-1.584|Europe/London|m|n|Royal Air Force
CAB|Cabinda Airport|Cabinda|AO|-5.598|12.188|Africa/Lagos|m|s|Maria Mambo Café
CAC|Coronel Adalberto Mendes da Silva Airport|Cascavel|BR|-25|-53.501|America/Sao_Paulo|m|s|
CAE|Columbia Metropolitan Airport|Columbia|US|33.938|-81.123|America/New_York|m|s|
CAG|Cagliari Elmas Airport|Cagliari|IT|39.251|9.054|Europe/Rome|l|s|Cagliari Airport
CAH|Cà Mau Airport|Ca Mau City|VN|9.178|105.178|Asia/Ho_Chi_Minh|m|s|Moranc Airfield, Quan Long Airport
CAI|Cairo International Airport|Cairo|EG|30.112|31.397|Africa/Cairo|l|s|
CAJ|Canaima Airport|Canaima|VE|6.232|-62.855|America/Caracas|m|s|
CAK|Akron Canton Regional Airport|Akron|US|40.916|-81.442|America/New_York|m|s|
CAL|Campbeltown Airport|Campbeltown|GB|55.437|-5.686|Europe/London|m|s|Kintyre, RAF Machrihanish, Kinlochkilkerran
CAN|Guangzhou Baiyun International Airport|Guangzhou (Huadu)|CN|23.392|113.299|Asia/Shanghai|l|s|
CAP|Cap Haitien International Airport|Cap Haitien|HT|19.726|-72.201|America/Port-au-Prince|l|s|
CAQ|Juan H White Airport|Caucasia|CO|7.968|-75.198|America/Bogota|m|n|Caucasia Airport
CAR|Caribou Municipal Airport|Caribou|US|46.871|-68.018|America/New_York|m|n|
CAT|Cascais Airport|Cascais|PT|38.725|-9.355|Europe/Lisbon|m|s|Tires
CAW|Bartolomeu Lisandro Airport|Campos dos Goytacazes|BR|-21.698|-41.302|America/Sao_Paulo|m|s|
CAX|Carlisle Lake District Airport|Carlisle, Cumbria|GB|54.938|-2.809|Europe/London|m|n|
CAY|Cayenne – Félix Eboué Airport|Matoury|GF|4.82|-52.361|America/Cayenne|l|s|Cayenne-Rochambeau, Matoury
CAZ|Cobar Airport||AU|-31.538|145.794|Australia/Sydney|m|s|
CBB|Jorge Wilsterman International Airport|Cochabamba|BO|-17.421|-66.177|America/Puerto_Rico|l|s|
CBD|Car Nicobar Air Force Base|IAF Camp|IN|9.153|92.819|Asia/Kolkata|m|n|Carnicobar
CBG|Cambridge City Airport|Cambridge, Cambridgeshire|GB|52.205|0.175|Europe/London|m|n|Marshall, RAF Cambridge
CBH|Béchar Boudghene Ben Ali Lotfi Airport|Béchar|DZ|31.646|-2.27|Africa/Algiers|m|s|Béchar Ouakda Airport
CBJ|Cabo Rojo Airport|Cabo Rojo|DO|17.929|-71.645|America/Santo_Domingo|m|n|
CBL|General Tomas de Heres Airport|Ciudad Bolivar|VE|8.122|-63.537|America/Caracas|m|n|Aeropuerto General Tomas de Heres
CBM|Columbus Air Force Base|Columbus|US|33.644|-88.444|America/Chicago|m|n|
CBO|Cotabato (Awang) Airport|Datu Odin Sinsuat|PH|7.165|124.21|Asia/Manila|m|s|Kutawatu
CBQ|Margaret Ekpo International Airport|Calabar|NG|4.976|8.347|Africa/Lagos|m|s|
CBR|Canberra Airport|Canberra|AU|-35.307|149.195|Australia/Sydney|m|s|RAAF Base Fairbairn
CBT|Catumbela Airport|Catumbela|AO|-12.479|13.487|Africa/Lagos|m|s|
CBV|Coban Airport|Coban|GT|15.469|-90.407|America/Guatemala|m|n|
CCC|Jardines Del Rey Airport|Cayo Coco|CU|22.461|-78.328|America/Havana|m|s|Cayo Coco
CCE|Capital International Airport|New Cairo|EG|30.065|31.84|Africa/Cairo|m|s|
CCF|Carcassonne Salvaza Airport|Carcassonne|FR|43.216|2.306|Europe/Paris|m|s|
CCH|Chile Chico Airport|Chile Chico|CL|-46.583|-71.686|America/Coyhaique|m|n|
CCJ|Calicut International Airport|Calicut|IN|11.136|75.955|Asia/Kolkata|l|s|
CCK|Cocos (Keeling) Islands Airport|West Island|CC|-12.192|96.834|Asia/Yangon|l|s|
CCL|Chinchilla Airport|Chinchilla|AU|-26.772|150.618|Australia/Brisbane|m|n|
CCM|Forquilhinha - Criciúma Airport|Criciúma|BR|-28.726|-49.424|America/Sao_Paulo|m|n|SBCM, Diomício Freitas, Santa Líbera.
CCP|Carriel Sur International Airport|Concepcion|CL|-36.772|-73.063|America/Santiago|l|s|
CCR|Buchanan Field|Concord|US|37.99|-122.057|America/Los_Angeles|m|s|
CCS|Maiquetía Simón Bolívar International Airport|Maiquetía|VE|10.602|-66.991|America/Caracas|l|s|Caracas
CCU|Netaji Subhash Chandra Bose International Airport|Kolkata|IN|22.654|88.448|Asia/Kolkata|l|s|Calcutta, Kolkatta, Dum Dum Air Force Station
CCY|Northeast Iowa Regional Airport|Charles City|US|43.073|-92.611|America/Chicago|m|n|Charles City Municipal Airport
CCZ|Chub Cay Airport|Chub Cay|BS|25.417|-77.881|America/Toronto|m|s|
CDB|Cold Bay Airport|Cold Bay|US|55.208|-162.725|America/Nome|m|s|
CDC|Cedar City Regional Airport|Cedar City|US|37.701|-113.099|America/Denver|m|s|
CDE|Chengde Puning Airport|Chengde|CN|41.123|118.074|Asia/Shanghai|m|s|
CDG|Charles de Gaulle International Airport|Paris (Roissy-en-France, Val-d'Oise)|FR|49.009|2.554|Europe/Paris|l|s|PAR, Aéroport Roissy-Charles de Gaulle, Roissy Airport
CDJ|Conceição do Araguaia Airport|Conceição do Araguaia|BR|-8.348|-49.301|America/Belem|m|n|
CDP|Kadapa Airport|Kadapa|IN|14.513|78.769|Asia/Kolkata|m|s|Cuddapah
CDR|Chadron Municipal Airport|Chadron|US|42.838|-103.095|America/Denver|m|s|
CDS|Childress Municipal Airport|Childress|US|34.434|-100.288|America/Chicago|m|n|
CDT|Castellón-Costa Azahar Airport|Castellón de la Plana|ES|40.214|0.073|Europe/Madrid|m|s|
CDU|Camden Airport|Cobbitty|AU|-34.038|150.686|Australia/Sydney|m|n|
CDV|Merle K (Mudhole) Smith Airport|Cordova|US|60.492|-145.478|America/Anchorage|m|s|Cordova Mile 13
CEB|Mactan Cebu International Airport|Cebu City/Lapu-Lapu City|PH|10.309|123.98|Asia/Manila|l|s|Mactan Air Base, Opon Airfield
CEC|Jack Mc Namara Field Airport|Crescent City|US|41.779|-124.236|America/Los_Angeles|m|s|Jack McNamara Field
CED|Ceduna Airport||AU|-32.131|133.71|Australia/Adelaide|m|s|
CEE|Cherepovets Airport|Cherepovets|RU|59.274|38.016|Europe/Moscow|m|s|УЛВЦ, Череповец
CEF|Westover Metropolitan Airport / Westover Air Reserve Base|Chicopee|US|42.194|-72.535|America/New_York|m|n|
CEG|Hawarden Airport|Broughton|GB|53.178|-2.978|Europe/London|m|n|Chester
CEI|Mae Fah Luang - Chiang Rai International Airport|Chiang Rai|TH|19.952|99.883|Asia/Jakarta|l|s|
CEK|Kurchatov Chelyabinsk International Airport|Chelyabinsk|RU|55.303|61.505|Asia/Yekaterinburg|l|s|УСЦЦ, Челябинск, Balandino, Balandino Airport
CEN|Ciudad Obregón International Airport|Ciudad Obregón|MX|27.393|-109.833|America/Hermosillo|m|s|
CEQ|Cannes Mandelieu Airport|Cannes|FR|43.548|6.955|Europe/Paris|m|n|
CER|Cherbourg Manche airport|Cherbourg|FR|49.65|-1.47|Europe/Paris|m|n|Aéroport de Cherbourg - Maupertus, Aéroport de Cherbourg - Manche, Cherbourg-Manche
CEW|Bob Sikes Airport|Crestview|US|30.779|-86.522|America/Chicago|m|n|
CEZ|Cortez Municipal Airport|Cortez|US|37.303|-108.628|America/Denver|m|s|
CFE|Clermont-Ferrand Auvergne airport|Clermont-Ferrand|FR|45.787|3.169|Europe/Paris|l|s|
CFG|Jaime Gonzalez Airport|Cienfuegos|CU|22.15|-80.414|America/Havana|m|s|Las Villas Airport
CFK|Chlef Aboubakr Belkaid International Airport|Chlef|DZ|36.217|1.341|Africa/Algiers|l|s|Ech Cheliff Airport
CFN|Donegal Airport|Donegal|IE|55.044|-8.341|Europe/London|m|s|Gweedore
CFR|Caen Carpiquet airport|Caen|FR|49.177|-0.455|Europe/Paris|m|s|
CFS|Coffs Harbour Airport|Coffs Harbour|AU|-30.321|153.116|Australia/Sydney|m|s|RAAF Base Coffs Harbour
CFU|Corfu Ioannis Kapodistrias International Airport|Kerkyra (Corfu)|GR|39.601|19.912|Europe/Athens|l|s|
CGB|Várzea Grande–Marechal Rondon International Airport|Cuiabá|BR|-15.653|-56.117|America/Cuiaba|l|s|
CGD|Changde Taohuayuan Airport|Changde (Dingcheng)|CN|28.919|111.64|Asia/Shanghai|m|s|
CGF|Cuyahoga County Airport|Cleveland|US|41.565|-81.486|America/New_York|m|n|
CGH|Congonhas–Deputado Freitas Nobre Airport|São Paulo|BR|-23.628|-46.655|America/Sao_Paulo|l|s|
CGI|Cape Girardeau Regional Airport|Cape Girardeau|US|37.225|-89.571|America/Chicago|m|s|
CGJ|Kasompe Airport|Chingola|ZM|-12.573|27.894|Africa/Johannesburg|m|n|
CGK|Soekarno-Hatta International Airport|Jakarta|ID|-6.126|106.656|Asia/Jakarta|l|s|JKT, Cengkareng, Java
CGM|Camiguin Airport|Mambajao|PH|9.254|124.709|Asia/Manila|m|s|
CGN|Cologne Bonn Airport|Köln (Cologne)|DE|50.866|7.143|Europe/Berlin|l|s|Köln
CGO|Zhengzhou Xinzheng International Airport|Zhengzhou|CN|34.526|113.849|Asia/Shanghai|l|s|Xinzheng Airport
CGP|Shah Amanat International Airport|Chattogram (Chittagong)|BD|22.25|91.813|Asia/Dhaka|l|s|M.A. Hannan International Airport
CGQ|Changchun Longjia International Airport|Changchun|CN|43.996|125.685|Asia/Shanghai|l|s|
CGR|Campo Grande Airport|Campo Grande|BR|-20.47|-54.674|America/Campo_Grande|m|s|
CGY|Laguindingan International Airport|Laguindingan|PH|8.612|124.456|Asia/Manila|l|s|IGN, RPML, Cagayan de Oro
CHA|Chattanooga Metropolitan Airport (Lovell Field)|Chattanooga|US|35.035|-85.204|America/New_York|m|s|
CHC|Christchurch International Airport|Christchurch|NZ|-43.489|172.532|Pacific/Auckland|l|s|
CHG|Chaoyang Airport|Shuangta, Chaoyang|CN|41.538|120.435|Asia/Shanghai|m|s|
CHH|Chachapoyas Airport|Chachapoyas|PE|-6.202|-77.856|America/Lima|m|s|
CHM|FAP Lieutenant Jaime Andres de Montreuil Morales Airport|Chimbote|PE|-9.15|-78.524|America/Lima|m|s|
CHO|Charlottesville Albemarle Airport|Charlottesville|US|38.139|-78.453|America/New_York|m|s|
CHQ|Chania International Airport|Souda|GR|35.531|24.151|Europe/Athens|l|s|
CHR|Châteauroux Déols airport|Châteauroux|FR|46.86|1.728|Europe/Paris|m|n|
CHS|Charleston International Airport|Charleston|US|32.896|-80.038|America/New_York|l|s|Charleston Air Force Base
CHT|Inia William Tuuta Memorial Airport|Te One|NZ|-43.812|-176.465|Pacific/Chatham|m|s|Karewa
CHX|Changuinola Captain Manuel Niño International Airport|Changuinola|PA|9.459|-82.515|America/Panama|m|s|
CIA|Ciampino–G. B. Pastine International Airport|Rome|IT|41.799|12.595|Europe/Rome|l|s|ROM, Giovan Battista Pastine Airport
CID|The Eastern Iowa Airport|Cedar Rapids|US|41.885|-91.711|America/Chicago|m|s|Cedar Rapids Municipal
CIF|Chifeng Yulong Airport|Chifeng|CN|42.16|118.841|Asia/Shanghai|m|s|
CIJ|Capitán Aníbal Arab Airport|Cobija|BO|-11.039|-68.783|America/Puerto_Rico|m|s|
CIO|Lieutenant Colonel Carmelo Peralta National Airport|Concepción|PY|-23.442|-57.427|America/Asuncion|m|n|Aeropuerto Nacional Tte. Cnel. Carmelo Peralta
CIS|Canton Island Airport|Abariringa|KI|-2.768|-171.71|Pacific/Kanton|m|n|Kanton Island
CIT|Shymkent International Airport|Shymkent|KZ|42.365|69.476|Asia/Almaty|l|s|Chimkent Airport, Аэропорт Шымкент, Аэропорт Чимкент
CIU|Chippewa County International Airport|Kincheloe|US|46.242|-84.462|America/Detroit|m|s|Sault Sainte Marie, Sault Ste Marie
CIW|Canouan Airport|Canouan|VC|12.699|-61.342|America/Puerto_Rico|m|s|
CIX|Capitán FAP José A. Quiñones González International Airport|Chiclayo|PE|-6.789|-79.828|America/Lima|l|s|
CIY|Comiso Airport|Comiso|IT|36.996|14.609|Europe/Rome|m|s|Vincenzo Magliocco Airport, Aeroporto di Comiso
CJA|Mayor General FAP Armando Revoredo Iglesias Airport|Cajamarca|PE|-7.139|-78.489|America/Lima|m|s|
CJB|Coimbatore International Airport|Coimbatore|IN|11.03|77.043|Asia/Kolkata|l|s|
CJC|El Loa Airport|Calama|CL|-22.498|-68.904|America/Santiago|m|s|
CJJ|Cheongju International Airport/Cheongju Air Base (K-59/G-513)|Cheongju|KR|36.716|127.5|Asia/Seoul|l|s|
CJL|Chitral Airport|Chitral|PK|35.886|71.8|Asia/Karachi|m|s|
CJM|Chumphon Airport|Chumphon|TH|10.711|99.362|Asia/Jakarta|m|s|
CJS|Abraham González International Airport|Ciudad Juárez|MX|31.637|-106.429|America/Ciudad_Juarez|l|s|
CJU|Jeju International Airport|Jeju City|KR|33.512|126.493|Asia/Seoul|l|s|
CKB|North Central West Virginia Airport|Bridgeport|US|39.297|-80.228|America/New_York|m|s|
CKC|Cherkasy International Airport|Cherkasy|UA|49.416|31.995|Europe/Kyiv|m|n|
CKG|Chongqing Jiangbei International Airport|Chongqing|CN|29.712|106.652|Asia/Shanghai|l|s|
CKH|Chokurdakh Airport|Chokurdah|RU|70.623|147.902|Asia/Srednekolymsk|m|s|Chokurdah Airport, Cokurdah Airport, Аэропорт Чокурдах
CKL|Chkalovskiy Air Base|Moscow|RU|55.878|38.062|Europe/Moscow|m|n|Chkalovsky Airport, Аэродром Чкаловский
CKS|Carajás Airport|Parauapebas|BR|-6.118|-50.003|America/Belem|m|s|
CKT|Sarakhs Airport|Sarakhs|IR|36.501|61.065|Asia/Tehran|m|n|
CKY|Ahmed Sékou Touré International Airport|Conakry|GN|9.577|-13.612|Africa/Abidjan|l|s|Gbessia International Airport, Conakry International Airport
CKZ|Çanakkale Airport|Çanakkale|TR|40.138|26.427|Europe/Istanbul|m|s|
CLD|McClellan-Palomar Airport|Carlsbad|US|33.128|-117.28|America/Los_Angeles|m|s|
CLE|Cleveland Hopkins International Airport|Cleveland|US|41.412|-81.85|America/New_York|l|s|
CLJ|Avram Iancu Cluj International Airport|Cluj-Napoca|RO|46.786|23.686|Europe/Bucharest|l|s|Someşeni Airport
CLL|Easterwood Field|College Station|US|30.589|-96.364|America/Chicago|m|s|
CLM|William R Fairchild International Airport|Port Angeles|US|48.12|-123.5|America/Los_Angeles|m|n|
CLN|Brig. Lysias Augusto Rodrigues Airport|Carolina|BR|-7.32|-47.459|America/Fortaleza|m|n|
CLO|Alfonso Bonilla Aragon International Airport|Cali|CO|3.543|-76.382|America/Bogota|l|s|Palmaseca International, 02-20
CLQ|Licenciado Miguel de la Madrid International Airport|Colima|MX|19.277|-103.577|America/Mexico_City|m|s|Aeropuerto Internacional Licenciado Miguel de la Madrid, Colima Airport
CLT|Charlotte Douglas International Airport|Charlotte|US|35.214|-80.943|America/New_York|l|s|
CLU|Columbus Municipal Airport|Columbus|US|39.262|-85.896|America/Indiana/Indianapolis|m|n|
CLY|Calvi Sainte Catherine Airport|Calvi|FR|42.53|8.793|Europe/Paris|m|s|
CLZ|Calabozo Airport|Guarico|VE|8.925|-67.417|America/Caracas|m|n|
CMA|Cunnamulla Airport||AU|-28.03|145.622|Australia/Brisbane|m|s|
CMB|Bandaranaike International Colombo Airport|Colombo|LK|7.181|79.884|Asia/Colombo|l|s|RAF Negombo, Katunayake International Airport
CMD|Cootamundra Airport||AU|-34.624|148.037|Australia/Sydney|m|n|
CME|Ciudad del Carmen International Airport|Ciudad del Carmen|MX|18.652|-91.799|America/Merida|m|s|
CMF|Chambéry Aix les Bains airport|Chambéry|FR|45.638|5.88|Europe/Paris|m|s|
CMG|Corumbá International Airport|Corumbá|BR|-19.012|-57.673|America/Campo_Grande|m|s|
CMH|John Glenn Columbus International Airport|Columbus|US|39.998|-82.892|America/New_York|l|s|
CMI|University of Illinois Willard Airport|Savoy|US|40.04|-88.276|America/Chicago|m|s|Champaign, Urbana
CMN|Mohammed V International Airport|Casablanca|MA|33.367|-7.59|Africa/Casablanca|l|s|CAS, Casabianca, Nouasseur
CMQ|Clermont Airport||AU|-22.773|147.621|Australia/Brisbane|m|n|
CMR|Colmar Houssen airport|Colmar|FR|48.11|7.359|Europe/Paris|m|n|
CMU|Chimbu Airport|Kundiawa|PG|-6.024|144.971|Pacific/Port_Moresby|m|s|
CMW|Ignacio Agramonte International Airport|Camaguey|CU|21.42|-77.848|America/Havana|l|s|
CMX|Houghton County Memorial Airport|Hancock|US|47.168|-88.489|America/Detroit|m|s|
CNB|Coonamble Airport||AU|-30.981|148.378|Australia/Sydney|m|s|
CND|Mihail Kogălniceanu International Airport|Constanța|RO|44.362|28.488|Europe/Bucharest|l|s|Constanța, RoAF 57th Air Base
CNF|Tancredo Neves International Airport|Belo Horizonte|BR|-19.636|-43.967|America/Sao_Paulo|l|s|http://www.infraero.gov.br/usa/aero_prev_home.php?ai=207
CNG|Cognac-Châteaubernard (BA 709) Air Base|Cognac/Châteaubernard|FR|45.658|-0.318|Europe/Paris|m|n|
CNJ|Cloncurry Airport|Cloncurry|AU|-20.669|140.504|Australia/Brisbane|m|s|
CNL|Sindal Airport|Sindal|DK|57.504|10.229|Europe/Berlin|m|n|
CNM|Cavern City Air Terminal|Carlsbad|US|32.338|-104.263|America/Denver|m|s|
CNN|Kannur International Airport|Kannur|IN|11.916|75.545|Asia/Kolkata|l|s|
CNP|Neerlerit Inaat Airport|Neerlerit Inaat|GL|70.743|-22.65|America/Scoresbysund|m|s|Constable Point, Mittarfik Nerlerit Inaat, Constable Pynt Lufthavn
CNQ|Corrientes Airport|Corrientes|AR|-27.445|-58.762|America/Argentina/Cordoba|m|s|
CNR|Chañaral Airport|Chañaral|CL|-26.332|-70.607|America/Santiago|m|n|
CNS|Cairns International Airport|Cairns|AU|-16.879|145.749|Australia/Brisbane|l|s|
CNU|Chanute Martin Johnson Airport|Chanute|US|37.668|-95.487|America/Chicago|m|n|
CNX|Chiang Mai International Airport|Chiang Mai|TH|18.767|98.963|Asia/Jakarta|l|s|
CNY|Canyonlands Regional Airport|Moab|US|38.755|-109.755|America/Denver|m|s|
COC|Comodoro Pierrestegui Airport|Concordia|AR|-31.297|-57.997|America/Argentina/Cordoba|m|n|
COD|Yellowstone Regional Airport|Cody|US|44.52|-109.024|America/Denver|m|s|
COE|Coeur D'Alene Airport - Pappy Boyington Field|Coeur d'Alene|US|47.774|-116.82|America/Los_Angeles|m|n|Coeur d'Alene Air Terminal
COF|Patrick Space Force Base|Cocoa Beach|US|28.235|-80.61|America/New_York|m|n|Naval Air Station Banana River
COJ|Coonabarabran Airport||AU|-31.332|149.267|Australia/Sydney|m|n|
COK|Cochin International Airport|Kochi|IN|10.151|76.401|Asia/Kolkata|l|s|
CON|Concord Municipal Airport|Concord|US|43.203|-71.502|America/New_York|m|n|
COO|Cotonou Cadjehoun International Airport|Cotonou|BJ|6.357|2.384|Africa/Lagos|l|s|
COQ|Choibalsan Airport||MN|48.135|114.647|Asia/Ulaanbaatar|m|s|
COR|Ingeniero Aeronáutico Ambrosio L.V. Taravella International Airport|Cordoba|AR|-31.312|-64.208|America/Argentina/Cordoba|l|s|Cordoba
COS|City of Colorado Springs Municipal Airport|Colorado Springs|US|38.806|-104.701|America/Denver|l|s|Peterson SFB, Colorado Springs Airport
COU|Columbia Regional Airport|Columbia|US|38.818|-92.22|America/Chicago|m|s|
COV|Çukurova International Airport|Tarsus|TR|36.891|35.071|Europe/Istanbul|l|s|
CPC|Aviador C. Campos Airport|Chapelco/San Martin de los Andes|AR|-40.075|-71.137|America/Argentina/Salta|m|s|
CPD|Coober Pedy Airport|Coober Pedy|AU|-29.038|134.722|Australia/Adelaide|m|s|
CPE|Ingeniero Alberto Acuña Ongay International Airport|Campeche|MX|19.816|-90.5|America/Merida|m|s|
CPH|Copenhagen Kastrup Airport|Copenhagen|DK|55.618|12.656|Europe/Berlin|l|s|København, Malmö
CPO|Desierto de Atacama Airport|Copiapo|CL|-27.261|-70.779|America/Santiago|m|s|
CPR|Casper-Natrona County International Airport|Casper|US|42.907|-106.462|America/Denver|m|s|
CPT|Cape Town International Airport|Cape Town|ZA|-33.974|18.604|Africa/Johannesburg|l|s|Kaapstad Internasionale Lughawe, CTIA, DF Malan Airport
CPV|Presidente João Suassuna Airport|Campina Grande|BR|-7.27|-35.896|America/Fortaleza|m|s|
CPX|Benjamin Rivera Noriega Airport|Culebra|PR|18.313|-65.304|America/Puerto_Rico|m|s|Culebra Airport
CQD|Shahrekord Airport|Shahrekord|IR|32.297|50.842|Asia/Tehran|m|n|
CQF|Calais Marck Airport|Calais|FR|50.962|1.955|Europe/Paris|m|n|Dunkirk, Grand Calais
CQM|Ciudad Real International Airport|Ciudad Real|ES|38.856|-3.97|Europe/Madrid|m|n|Ciudad Real Central Airport
CQW|Chongqing Xiannüshan Airport|Wulong|CN|29.466|107.694|Asia/Shanghai|m|s|
CRA|Craiova International Airport|Craiova|RO|44.318|23.889|Europe/Bucharest|l|s|
CRC|Santa Ana Airport|Cartago|CO|4.758|-75.956|America/Bogota|m|n|
CRD|General Enrique Mosconi International Airport|Comodoro Rivadavia|AR|-45.787|-67.463|America/Argentina/Catamarca|l|s|
CRE|Grand Strand Airport|North Myrtle Beach|US|33.812|-78.724|America/New_York|m|n|
CRG|Jacksonville Executive at Craig Airport|Jacksonville|US|30.336|-81.514|America/New_York|m|n|Craig Municipal Airport
CRI|Colonel Hill Airport|Colonel Hill|BS|22.746|-74.182|America/Toronto|m|s|Crooked Island Airport
CRK|Clark International Airport / Clark Air Base|Mabalacat|PH|15.186|120.56|Asia/Manila|l|s|Diosdado Macapagal International Airport, Paliparang Pandaigdig ng Diosdado Macapagal, Pangyatung Sulapawan ning Clark, Paliparang Pandaigdig ng Clark
CRL|Brussels South Charleroi Airport|Charleroi|BE|50.462|4.46|Europe/Brussels|l|s|Gosselies Airport
CRM|Catarman National Airport|Catarman|PH|12.502|124.635|Asia/Manila|m|s|
CRP|Corpus Christi International Airport|Corpus Christi|US|27.77|-97.501|America/Chicago|m|s|
CRQ|Caravelas Airport|Caravelas|BR|-17.652|-39.253|America/Bahia|m|n|SBCV
CRV|Crotone Sant'Anna Pythagoras Airport|Isola di Capo Rizzuto|IT|38.997|17.08|Europe/Rome|m|s|Sant'Anna Airport
CRW|Yeager Airport|Charleston|US|38.373|-81.593|America/New_York|m|s|
CRZ|Türkmenabat International Airport|Türkmenabat|TM|38.931|63.564|Asia/Ashgabat|l|s|Turkmenabad Airport, Chardzhou Airport, Аэропорт Туркменабат, Аэропорт Туркменабад, Аэропорт Чарджоу, چهارجوی
CSB|Caransebeş Airport|Caransebeş|RO|45.42|22.253|Europe/Bucharest|m|n|Reşiţa
CSF|Creil Air Base|Creil|FR|49.254|2.519|Europe/Paris|m|n|BA 110
CSG|Columbus Airport|Columbus|US|32.516|-84.94|America/New_York|m|s|
CSK|Cap Skirring Airport|Cap Skirring|SN|12.395|-16.748|Africa/Abidjan|m|s|
CSN|Carson Airport|Carson City|US|39.194|-119.734|America/Los_Angeles|m|n|O04, Carson City Airport
CSV|Crossville Memorial Airport Whitson Field|Crossville|US|35.951|-85.085|America/Chicago|m|n|
CSW|Cabo San Lucas International Airport|Cabo San Lucas|MX|22.949|-109.939|America/Mazatlan|m|s|MM15
CSX|Changsha Huanghua International Airport|Changsha (Changsha)|CN|28.189|113.22|Asia/Shanghai|l|s|长沙黄花国际机场
CSY|Cheboksary Airport|Cheboksary|RU|56.09|47.347|Europe/Moscow|m|s|УВКС, ЬВКС, Чебоксары
CTA|Catania-Fontanarossa Airport|Catania|IT|37.467|15.066|Europe/Rome|l|s|Lanza Di Trabie, Catania-Fontanarossa Vincenzo Bellini
CTB|Cut Bank International Airport|Cut Bank|US|48.609|-112.378|America/Denver|m|n|
CTC|Coronel Felipe Varela International Airport|Catamarca|AR|-28.593|-65.751|America/Argentina/Catamarca|m|s|
CTD|Alonso Valderrama Airport|Chitré|PA|7.988|-80.41|America/Panama|m|s|
CTG|Rafael Nuñez International Airport|Cartagena|CO|10.442|-75.513|America/Bogota|l|s|
CTL|Charleville Airport|Charleville|AU|-26.413|146.262|Australia/Brisbane|m|s|
CTM|Chetumal International Airport|Chetumal|MX|18.505|-88.328|America/Cancun|m|s|Aeropuerto Internacional de Chetumal
CTN|Cooktown Airport||AU|-15.444|145.183|Australia/Brisbane|m|s|
CTS|New Chitose Airport|Sapporo|JP|42.775|141.69|Asia/Tokyo|l|s|新千歳空港
CTT|Le Castellet Airport|Le Castellet, Var|FR|43.252|5.785|Europe/Paris|m|n|
CTU|Chengdu Shuangliu International Airport|Chengdu (Shuangliu)|CN|30.558|103.946|Asia/Shanghai|l|s|成都双流国际机场
CUB|Jim Hamilton L.B. Owens Airport|Columbia|US|33.971|-80.995|America/New_York|m|n|
CUC|Camilo Daza International Airport|Cúcuta|CO|7.928|-72.511|America/Bogota|m|s|
CUE|Mariscal Lamar Airport|Cuenca|EC|-2.889|-78.984|America/Guayaquil|m|s|
CUF|Cuneo International Airport|Levaldigi|IT|44.547|7.623|Europe/Rome|m|s|Cuneo Levaldigi Airport, Turin Cuneo Airport
CUK|Caye Caulker Airport|Caye Caulker|BZ|17.735|-88.033|America/Belize|m|s|
CUL|Bachigualato Federal International Airport|Culiacán|MX|24.765|-107.475|America/Mazatlan|l|s|Federal de Bachigualato International Airport, Culiacán International Airport
CUM|Antonio José de Sucre Airport|Cumaná|VE|10.45|-64.13|America/Caracas|m|s|
CUN|Cancún International Airport|Cancún|MX|21.041|-86.873|America/Cancun|l|s|
CUP|General Francisco Bermúdez Airport|Carúpano|VE|10.66|-63.262|America/Caracas|m|s|
CUQ|Coen Airport|Coen|AU|-13.761|143.113|Australia/Brisbane|m|s|
CUR|Hato International Airport|Willemstad|CW|12.189|-68.96|America/Puerto_Rico|l|s|Curaçao
CUT|Cutral-Co Airport|Cutral-Co|AR|-38.94|-69.265|America/Argentina/Salta|m|n|
CUU|General Roberto Fierro Villalobos International Airport|Chihuahua|MX|28.703|-105.964|America/Chihuahua|l|s|
CUZ|Alejandro Velasco Astete International Airport|Cusco|PE|-13.536|-71.939|America/Lima|l|s|
CVC|Cleve Airport||AU|-33.71|136.505|Australia/Adelaide|m|n|
CVE|Coveñas Airport|Coveñas|CO|9.401|-75.691|America/Bogota|m|n|
CVG|Cincinnati Northern Kentucky International Airport|Cincinnati / Covington|US|39.049|-84.668|America/New_York|l|s|
CVJ|General Mariano Matamoros International Airport|Temixco|MX|18.834|-99.262|America/Mexico_City|m|n|Aeropuerto Internacional Mariano Matamoros
CVM|General Pedro Jose Mendez International Airport|Ciudad Victoria|MX|23.703|-98.956|America/Monterrey|m|s|
CVN|Clovis Municipal Airport|Clovis|US|34.427|-103.079|America/Denver|m|s|
CVO|Corvallis Municipal Airport|Corvallis|US|44.497|-123.29|America/Los_Angeles|m|n|Albany Oregon
CVQ|Carnarvon Airport|Carnarvon|AU|-24.884|113.666|Australia/Perth|m|s|
CVS|Cannon Air Force Base|Clovis|US|34.383|-103.322|America/Denver|m|n|
CWA|Central Wisconsin Airport|Mosinee|US|44.777|-89.67|America/Chicago|m|s|
CWB|Curitiba-Afonso Pena International Airport|Curitiba|BR|-25.529|-49.176|America/Sao_Paulo|l|s|
CWC|Chernivtsi International Airport|Chernivtsi|UA|48.259|25.981|Europe/Kyiv|m|n|
CWJ|Cangyuan Washan Airport|Lincang (Cangyuan)|CN|23.276|99.373|Asia/Shanghai|m|s|
CWL|Cardiff International Airport|Cardiff|GB|51.397|-3.343|Europe/London|l|s|Caerdydd, Maes Awyr Caerdydd, Rhoose, Y Rhws
CWT|Cowra Airport||AU|-33.847|148.648|Australia/Sydney|m|n|
CWW|Corowa Airport||AU|-35.995|146.357|Australia/Sydney|m|n|
CXA|Caicara del Orinoco Airport||VE|7.626|-66.163|America/Caracas|m|n|
CXB|Cox's Bazar Airport|Cox's Bazar|BD|21.458|91.963|Asia/Dhaka|m|s|
CXI|Cassidy International Airport|Kiritimati|KI|1.986|-157.35|Pacific/Kiritimati|l|s|Christmas Island, Banana
CXJ|Hugo Cantergiani Regional Airport|Caxias Do Sul|BR|-29.197|-51.188|America/Sao_Paulo|m|s|Campo dos Bugres Airport, Caxias do Sul Airport
CXO|Conroe-North Houston Regional Airport|Houston|US|30.352|-95.414|America/Chicago|m|n|Montgomery County Airport, Lone Star Executive Airport
CXP|Tunggul Wulung Airport|Cilacap|ID|-7.645|109.034|Asia/Jakarta|m|s|WIIL, WIHL
CXR|Cam Ranh International Airport / Cam Ranh Air Base|Nha Trang/nha Trang aiurportCam Ranh|VN|11.998|109.219|Asia/Ho_Chi_Minh|l|s|
CYA|Antoine-Simon International Airport|Les Cayes|HT|18.271|-73.788|America/Port-au-Prince|m|s|
CYB|Charles Kirkconnell International Airport|West End|KY|19.687|-79.883|America/Panama|m|s|
CYC|Caye Chapel Airport|Caye Chapel|BZ|17.684|-88.045|America/Belize|m|s|
CYG|Corryong Airport||AU|-36.183|147.888|Australia/Melbourne|m|n|
CYI|Chiayi Airport|Shuishang|TW|23.463|120.391|Asia/Taipei|m|s|Shueishang Airport, 嘉義航空站, 水上機場
CYO|Vilo Acuña International Airport|Cayo Largo del Sur|CU|21.617|-81.546|America/Havana|m|s|
CYP|Calbayog Airport|Calbayog City|PH|12.073|124.545|Asia/Manila|m|s|
CYS|Cheyenne Regional Jerry Olson Field|Cheyenne|US|41.156|-104.812|America/Denver|m|s|
CYW|Captain Rogelio Castillo National Airport|Celaya|MX|20.546|-100.887|America/Mexico_City|m|n|Aeropuerto Nacional Capitan Rogelio Castillo
CYX|Cherskiy Airport|Cherskiy|RU|68.741|161.338|Asia/Srednekolymsk|m|s|УЕСС, Chersky Airport, Аэропорт Черский
CYZ|Cauayan Airport|Cauayan City|PH|16.93|121.753|Asia/Manila|m|s|
CZE|José Leonardo Chirinos Airport|Coro|VE|11.415|-69.681|America/Caracas|m|s|
CZF|Cape Romanzof LRRS Airport|Cape Romanzof|US|61.78|-166.039|America/Nome|m|n|
CZH|Corozal Airport|Corozal|BZ|18.382|-88.412|America/Belize|m|s|Ranchito Airport
CZL|Mohamed Boudiaf International Airport|Constantine|DZ|36.276|6.62|Africa/Algiers|l|s|
CZM|Cozumel International Airport|Cozumel|MX|20.515|-86.929|America/Cancun|l|s|
CZS|Cruzeiro do Sul Airport|Cruzeiro Do Sul|BR|-7.6|-72.77|America/Rio_Branco|m|s|
CZU|Las Brujas Airport|Corozal|CO|9.333|-75.286|America/Bogota|m|s|
CZX|Changzhou Benniu International Airport|Changzhou|CN|31.92|119.775|Asia/Shanghai|m|s|
DAA|Davison Army Air Field|Fort Belvoir|US|38.715|-77.181|America/New_York|m|n|
DAB|Daytona Beach International Airport|Daytona Beach|US|29.183|-81.059|America/New_York|m|s|
DAC|Hazrat Shahjalal International Airport|Dhaka|BD|23.843|90.398|Asia/Dhaka|l|s|VGZR, Zia International Airport, Dacca International Airport
DAD|Da Nang International Airport|Da Nang|VN|16.044|108.199|Asia/Ho_Chi_Minh|l|s|Danang, Cảng Hàng không Quốc tế Đà Nẵng
DAG|Barstow Daggett Airport|Daggett|US|34.854|-116.787|America/Los_Angeles|m|n|
DAL|Dallas Love Field|Dallas|US|32.845|-96.848|America/Chicago|l|s|QDF
DAM|Damascus International Airport|Damascus|SY|33.411|36.516|Asia/Damascus|l|s|مطار دمشق الدولي
DAN|Danville Regional Airport|Danville|US|36.573|-79.336|America/New_York|m|n|
DAR|Julius Nyerere International Airport|Dar es Salaam|TZ|-6.873|39.207|Asia/Riyadh|l|s|HTJN, Mwalimu Julius K. Nyerere, Dar es Salaam International Airport
DAT|Datong Yungang International Airport|Datong|CN|40.061|113.481|Asia/Shanghai|l|s|
DAU|Daru Airport|Daru|PG|-9.087|143.208|Pacific/Port_Moresby|m|s|
DAV|Enrique Malek International Airport|David|PA|8.389|-82.436|America/Panama|m|s|
DAY|James M. Cox Dayton International Airport|Dayton|US|39.902|-84.219|America/New_York|m|s|
DBB|El Alamein International Airport|El Alamein|EG|30.924|28.462|Africa/Cairo|l|s|Al Alamain, Al Alamayn, العلمين‎
DBC|Baicheng Chang'an Airport|Baicheng|CN|45.505|123.02|Asia/Shanghai|m|s|
DBD|Dhanbad Airport||IN|23.834|86.425|Asia/Kolkata|m|n|
DBO|Dubbo City Regional Airport|Dubbo|AU|-32.217|148.575|Australia/Sydney|m|s|
DBQ|Dubuque Regional Airport|Dubuque|US|42.402|-90.71|America/Chicago|m|s|
DBR|Darbhanga Airport|Darbhanga|IN|26.193|85.917|Asia/Kolkata|m|s|
DBV|Dubrovnik Ruđer Bošković Airport|Dubrovnik|HR|42.562|18.266|Europe/Belgrade|l|s|Močići Airport, Zračna luka Ruđer Bošković Dubrovnik
DCA|Ronald Reagan Washington National Airport|Washington|US|38.852|-77.038|America/New_York|l|s|
DCF|Canefield Airport|Canefield|DM|15.337|-61.392|America/Puerto_Rico|m|s|
DCI|Decimomannu Air Base|Decimomannu|IT|39.354|8.972|Europe/Rome|m|s|G. Farina
DCM|Castres Mazamet Airport|Castres|FR|43.556|2.289|Europe/Paris|m|s|
DCN|RAAF Base Curtin|Derby|AU|-17.581|123.828|Australia/Perth|m|n|
DCT|Duncan Town Airport|Duncan Town|BS|22.182|-75.73|America/Toronto|m|n|
DCY|Daocheng Yading Airport|Garzê (Daocheng)|CN|29.316|100.06|Asia/Shanghai|m|s|
DDC|Dodge City Regional Airport|Dodge City|US|37.763|-99.966|America/Chicago|m|s|
DDG|Dandong Langtou International Airport|Dandong (Zhenxing)|CN|40.025|124.287|Asia/Shanghai|m|s|
DDR|Shigatse Tingri Airport|Xigazê (Dingri)|CN|28.605|86.798|Asia/Shanghai|m|s|Rikaze Dingri
DEA|Dera Ghazi Khan Airport|Dera Ghazi Khan|PK|29.961|70.486|Asia/Karachi|m|s|
DEB|Debrecen International Airport|Debrecen|HU|47.489|21.616|Europe/Budapest|l|s|Debreceni nemzetközi repülőtér
DEC|Decatur Airport|Decatur|US|39.835|-88.866|America/Chicago|m|s|
DED|Dehradun Jolly Grant Airport|Dehradun (Jauligrant)|IN|30.189|78.177|Asia/Kolkata|m|s|Jauligrant
DEF|Dezful Airport|Dezful|IR|32.434|48.398|Asia/Tehran|m|s|Vahdati Air Base
DEJ|Tongren Dejiang Airport (Under Construction)|Tongren|CN|28.121|108.163|Asia/Shanghai|m|n|
DEL|Indira Gandhi International Airport|New Delhi|IN|28.556|77.095|Asia/Kolkata|l|s|Palam Air Force Station
DEN|Denver International Airport|Denver|US|39.86|-104.674|America/Denver|l|s|DVX, KVDX
DET|Coleman A. Young Municipal Airport|Detroit|US|42.409|-83.01|America/Detroit|m|n|
DEZ|Deir ez-Zor Airport|Deir ez-Zor|SY|35.285|40.176|Asia/Damascus|m|n|Al Jafrah Airport, مطار دير الزور
DFW|Dallas Fort Worth International Airport|Dallas-Fort Worth|US|32.897|-97.038|America/Chicago|l|s|QDF
DGA|Dangriga Airport|Dangriga|BZ|16.983|-88.231|America/Belize|m|s|Stann Creek Airport
DGE|Mudgee Airport|Mudgee|AU|-32.565|149.609|Australia/Sydney|m|n|
DGO|General Guadalupe Victoria International Airport|Durango|MX|24.125|-104.528|America/Monterrey|m|s|Aeropuerto Internacional General Guadalupe Victoria
DGT|Sibulan Airport|Dumaguete City|PH|9.334|123.302|Asia/Manila|m|s|
DHA|King Abdulaziz Air Base|Dhahran|SA|26.265|50.152|Asia/Riyadh|l|n|Dhahran international Airport, Dhahran Air Base, Dhahran Airport, Dhahran Airfield
DHF|Al Dhafra Air Base||AE|24.248|54.548|Asia/Dubai|m|n|
DHH|Barkol Dahe Airport|Barkol|CN|43.757|93.137|Asia/Urumqi|m|n|巴里坤大河机场, Balikun
DHM|Kangra Airport|Kangra|IN|32.165|76.263|Asia/Kolkata|m|s|Dharamshala, Gaggal
DHN|Dothan Regional Airport|Dothan|US|31.321|-85.45|America/Chicago|m|s|
DHR|De Kooy Airfield / Den Helder Naval Air Station|Den Helder|NL|52.923|4.781|Europe/Brussels|m|n|
DHT|Dalhart Municipal Airport|Dalhart|US|36.023|-102.547|America/Chicago|m|n|
DHX|Dhoho International Airport|Kediri|ID|-7.75|111.947|Asia/Jakarta|m|s|
DIA|Doha International Airport|Doha|QA|25.259|51.566|Asia/Qatar|l|s|مطار الدوحة الدولى
DIB|Dibrugarh Airport|Dibrugarh|IN|27.484|95.017|Asia/Kolkata|m|s|Mohanbari Air Force Station
DIE|Arrachart Airport|Antisiranana|MG|-12.349|49.292|Asia/Riyadh|m|s|Diego-Suárez
DIG|Diqing Shangri-La Airport|Diqing (Shangri-La)|CN|27.794|99.677|Asia/Shanghai|m|s|
DIJ|Dijon Longvic airport|Dijon|FR|47.269|5.09|Europe/Paris|m|n|BA 102
DIK|Dickinson Theodore Roosevelt Regional Airport|Dickinson|US|46.798|-102.802|America/Denver|m|s|
DIL|Presidente Nicolau Lobato International Airport|Dili|TL|-8.547|125.525|Asia/Dili|l|s|Komoro, Comoro Airport
DIN|Dien Bien Phu Airport|Dien Bien Phu|VN|21.397|103.008|Asia/Jakarta|m|s|
DIR|Aba Tenna Dejazmach Yilma International Airport|Dire Dawa|ET|9.624|41.855|Asia/Riyadh|l|s|
DIS|Ngot Nzoungou Airport|Dolisie|CG|-4.206|12.66|Africa/Lagos|m|n|Dolisie
DIY|Diyarbakır Airport|Diyarbakır|TR|37.894|40.201|Europe/Istanbul|m|s|
DJE|Djerba Zarzis International Airport|Mellita|TN|33.874|10.777|Africa/Tunis|l|s|
DJG|Tiska Djanet Airport|Djanet|DZ|24.285|9.464|Africa/Algiers|l|s|Cheikh Amoud Ben el Mokhtar, Djanet Inedbirene Airport
DJJ|Dortheys Hiyo Eluay International Airport|Sentani|ID|-2.58|140.52|Asia/Tokyo|l|s|Bandar Udara Internasional Dortheys Hiyo Eluay, Sentani International Airport, Hollandia, Jayapura
DJO|Daloa Airport||CI|6.793|-6.473|Africa/Abidjan|m|n|
DJT|President Donald J. Trump International Airport|West Palm Beach|US|26.683|-80.096|America/New_York|l|s|PBI, KPBI, MFW, South Florida
DKA|Umaru Musa Yar'adua Airport|Katsina|NG|13.008|7.66|Africa/Lagos|m|s|DN57, Katsina Airport
DKR|Léopold Sédar Senghor International Airport|Dakar|SN|14.742|-17.479|Africa/Abidjan|l|n|Yoff
DKS|Dikson Airport|Dikson|RU|73.518|80.38|Asia/Krasnoyarsk|m|n|Аэропорт Диксон
DLA|Douala International Airport|Douala|CM|4.006|9.719|Africa/Lagos|l|s|
DLC|Dalian Zhoushuizi International Airport|Dalian (Ganjingzi)|CN|38.966|121.538|Asia/Shanghai|l|s|Dalian Air Base
DLE|Dole Tavaux Airport|Dole|FR|47.039|5.428|Europe/Paris|m|s|Dole-Tavaux
DLF|Laughlin Air Force Base|Del Rio|US|29.36|-100.778|America/Chicago|m|n|Laughlin AFB, Laughlin Field, DLF Airport
DLG|Dillingham Airport|Dillingham|US|59.045|-158.505|America/Anchorage|m|s|
DLH|Duluth International Airport|Duluth|US|46.842|-92.199|America/Chicago|m|s|LKI, Duluth Air National Guard Base, Lakeside AFB
DLI|Lien Khuong Airport|Da Lat|VN|11.751|108.367|Asia/Ho_Chi_Minh|m|s|Lienkhang
DLM|Dalaman International Airport|Dalaman|TR|36.713|28.793|Europe/Istanbul|l|s|
DLS|Columbia Gorge Regional Airport|Dallesport / The Dalles|US|45.621|-121.171|America/Los_Angeles|m|n|The Dalles Municipal Airport
DLU|Dali Fengyi Airport|Dali (Xiaguan)|CN|25.649|100.319|Asia/Shanghai|m|s|Dali Air Base
DLZ|Dalanzadgad Airport|Dalanzadgad|MN|43.609|104.368|Asia/Ulaanbaatar|m|s|
DMA|Davis Monthan Air Force Base|Tucson|US|32.167|-110.883|America/Phoenix|m|n|
DMB|Taraz International Airport|Taraz|KZ|42.854|71.304|Asia/Almaty|l|s|Aulie Ata, Jambyl
DME|Domodedovo International Airport|Moscow|RU|55.409|37.906|Europe/Moscow|l|s|MOW, Аэропорт Домоде́дово
DMK|Don Mueang International Airport|Bangkok|TH|13.913|100.607|Asia/Jakarta|l|s|Old Bangkok International Airport, Don Muang Royal Thai Air Force Base
DMM|King Fahd International Airport|Ad Dammam|SA|26.469|49.798|Asia/Riyadh|l|s|
DMN|Deming Municipal Airport|Deming|US|32.262|-107.721|America/Denver|m|n|
DMU|Dimapur Airport|Dimapur|IN|25.884|93.771|Asia/Kolkata|m|s|
DNA|Kadena Air Base|Okinawa|JP|26.352|127.769|Asia/Tokyo|l|n|
DND|Dundee Airport|Dundee|GB|56.452|-3.026|Europe/London|m|s|
DNH|Dunhuang Mogao International Airport|Dunhuang|CN|40.162|94.813|Asia/Shanghai|l|s|
DNK|Dnipro International Airport|Dnipro|UA|48.357|35.101|Europe/Kyiv|m|n|Dnipropetrovsk, Міжнародний аеропорт «Дніпро»
DNL|Daniel Field|Augusta|US|33.466|-82.039|America/New_York|m|n|
DNQ|Deniliquin Airport|Deniliquin|AU|-35.559|144.946|Australia/Sydney|m|n|
DNR|Dinard Pleurtuit Saint-Malo airport|Dinard|FR|48.588|-2.08|Europe/Paris|m|n|
DNZ|Çardak Airport|Denizli|TR|37.786|29.701|Europe/Istanbul|m|s|
DOD|Dodoma Airport|Dodoma|TZ|-6.171|35.756|Asia/Riyadh|m|s|
DOG|Dongola Airport|Dongola|SD|19.154|30.43|Africa/Khartoum|m|s|DOG Airport, مطار دنقلا
DOH|Hamad International Airport|Doha|QA|25.273|51.608|Asia/Qatar|l|s|New Doha International Airport
DOL|Deauville Normandie airport|Deauville|FR|49.365|0.154|Europe/Paris|m|s|Deauville-Saint Gatien
DOM|Douglas-Charles Airport|Marigot|DM|15.547|-61.301|America/Puerto_Rico|m|s|Melville Hall
DOV|Dover Civil Air Terminal/Dover Air Force Base|Dover|US|39.13|-75.466|America/New_York|m|s|Municipal Airport - Dover Airdrome, Dover Army Airbase, Dover Army Airfield
DOY|Dongying Shengli Airport|Dongying (Kenli)|CN|37.501|118.79|Asia/Shanghai|m|s|Dongying Air Base, Dongying Yong'an Airport
DPA|Dupage Airport|Chicago/West Chicago|US|41.908|-88.249|America/Chicago|m|n|
DPL|Dipolog Airport|Dipolog|PH|8.602|123.342|Asia/Manila|m|s|
DPO|Devonport Airport|Devonport|AU|-41.17|146.43|Australia/Hobart|m|s|
DPS|Denpasar I Gusti Ngurah Rai International Airport|Kuta, Badung|ID|-8.748|115.167|Asia/Makassar|l|s|WRRR, Bali, Denpasar International Airport
DQM|Duqm International Airport|Duqm|OM|19.502|57.634|Asia/Dubai|l|s|
DRA|Desert Rock Airport|Mercury|US|36.619|-116.033|America/Los_Angeles|m|n|Formerly DRA
DRB|Derby Airport|Derby|AU|-17.372|123.662|Australia/Perth|m|n|
DRG|Deering Airport|Deering|US|66.069|-162.767|America/Nome|m|s|0Z0
DRI|Beauregard Regional Airport|DeRidder|US|30.832|-93.34|America/Chicago|m|n|Beauregard Parish, DeRidder Army Air Base
DRN|Dirranbandi Airport||AU|-28.588|148.217|Australia/Brisbane|m|n|
DRO|Durango La Plata County Airport|Durango|US|37.152|-107.754|America/Denver|m|s|
DRP|Bicol International Airport|Legazpi|PH|13.112|123.677|Asia/Manila|l|s|Daraga, Southern Luzon International Airport
DRS|Dresden Airport|Dresden|DE|51.134|13.768|Europe/Berlin|l|s|ETDN
DRT|Del Rio International Airport|Del Rio|US|29.374|-100.927|America/Chicago|m|n|
DRW|Darwin International Airport / RAAF Darwin|Darwin|AU|-12.415|130.882|Australia/Darwin|l|s|
DSI|Destin Executive Airport|Destin|US|30.4|-86.471|America/Chicago|m|s|81J, Destin-Fort Walton Beach Airport
DSK|Dera Ismael Khan Airport [IN-ACTIVE]|Dera Ismael Khan|PK|31.909|70.897|Asia/Karachi|m|n|
DSM|Des Moines International Airport|Des Moines|US|41.534|-93.657|America/Chicago|l|s|
DSN|Ordos Ejin Horo International Airport|Ordos|CN|39.494|109.86|Asia/Shanghai|l|s|Dongsheng, 鄂尔多斯
DSO|Sondok Airport|Sŏndŏng-ni|KP|39.745|127.474|Asia/Pyongyang|m|s|
DSS|Blaise Diagne International Airport|Dakar|SN|14.671|-17.073|Africa/Abidjan|l|s|diass airport
DSY|Dara Sakor International Airport|Ta Noun|KH|10.914|103.227|Asia/Jakarta|l|s|Krong Khemara Phoumin, អាកាសយានដ្ឋានអន្តរជាតិតារាសាគរ
DTE|Daet Airport|Daet|PH|14.129|122.98|Asia/Manila|m|n|
DTM|Dortmund Airport|Dortmund|DE|51.518|7.612|Europe/Berlin|l|s|
DTU|Wudalianchi Dedu Airport|Heihe|CN|48.441|126.128|Asia/Shanghai|m|s|
DTW|Detroit Metropolitan Wayne County Airport|Detroit|US|42.214|-83.354|America/Detroit|l|s|DTT, Detroit Metro Airport
DUA|Durant Regional Airport - Eaker Field|Durant|US|33.94|-96.395|America/Chicago|m|n|
DUB|Dublin Airport|Dublin|IE|53.429|-6.262|Europe/London|l|s|Aerfort Bhaile Átha Cliath
DUD|Dunedin International Airport|Dunedin|NZ|-45.929|170.198|Pacific/Auckland|m|s|Momona Airport
DUE|Dundo Airport|Chitato|AO|-7.401|20.819|Africa/Lagos|m|s|
DUG|Bisbee Douglas International Airport|Douglas Bisbee|US|31.464|-109.605|America/Phoenix|m|n|
DUJ|DuBois Regional Airport|Dubois|US|41.178|-78.899|America/New_York|m|s|DuBois Jefferson County
DUM|Pinang Kampai Airport|Dumai|ID|1.609|101.433|Asia/Jakarta|m|s|
DUR|King Shaka International Airport|Durban|ZA|-29.614|31.12|Africa/Johannesburg|l|s|La Mercy Airport
DUS|Düsseldorf Airport|Düsseldorf|DE|51.29|6.767|Europe/Berlin|l|s|
DUT|Tom Madsen (Dutch Harbor) Airport|Unalaska|US|53.899|-166.545|America/Nome|m|s|Unalaska
DVL|Devils Lake Regional Airport|Devils Lake|US|48.115|-98.909|America/Chicago|m|s|
DVO|Francisco Bangoy International Airport|Davao|PH|7.126|125.646|Asia/Manila|l|s|Davao International Airport
DWA|Dwangwa Airport|Dwangwa|MW|-12.518|34.132|Africa/Johannesburg|m|n|
DWC|Al Maktoum International Airport|Dubai(Jebel Ali)|AE|24.896|55.162|Asia/Dubai|l|s|Dubai World Central
DWD|Dawadmi Domestic Airport|Dawadmi|SA|24.45|44.121|Asia/Riyadh|m|s|Al Dawadmi Airport
DXB|Dubai International Airport|Dubai|AE|25.25|55.371|Asia/Dubai|l|s|مطار دبي الدولي‎
DXN|Noida International Airport|Gautam Buddha Nagar|IN|28.18|77.612|Asia/Kolkata|l|s|
DXR|Danbury Municipal Airport|Danbury|US|41.372|-73.482|America/New_York|m|n|
DYA|Dysart Airport||AU|-22.622|148.364|Australia/Brisbane|m|n|
DYG|Zhangjiajie Hehua International Airport|Zhangjiajie (Yongding)|CN|29.105|110.443|Asia/Shanghai|l|s|Dayong Airport, 张家界, 张家界荷花国际机场，荷花
DYR|Ugolny Yuri Ryktheu Airport|Anadyr|RU|64.735|177.741|Asia/Anadyr|m|s|УХМА, Угольный, Аnadyr Airport, Аэропорт Анадырь
DYS|Dyess Air Force Base|Abilene|US|32.421|-99.855|America/Chicago|m|n|
DYU|Dushanbe International Airport|Dushanbe|TJ|38.544|68.823|Asia/Dushanbe|l|s|
DZA|Dzaoudzi Pamandzi International Airport|Dzaoudzi|YT|-12.809|45.282|Asia/Riyadh|l|s|
DZH|Dazhou Jinya Airport|Dazhou (Dachuan)|CN|31.049|107.436|Asia/Shanghai|m|s|
DZN|Zhezkazgan National Airport|Zhezkazgan|KZ|47.709|67.738|Asia/Almaty|l|s|УАКД, Жезказган, Dzhezkazgan South
DZO|Santa Bernardina International Airport|Durazno|UY|-33.359|-56.499|America/Montevideo|m|n|Tte. 2° Mario W. Parallada Air Base
EAM|Najran Domestic Airport|Najran|SA|17.611|44.419|Asia/Riyadh|m|s|
EAR|Kearney Regional Airport|Kearney|US|40.727|-99.007|America/Chicago|m|s|
EAS|San Sebastián Airport|Hondarribia|ES|43.356|-1.791|Europe/Madrid|m|s|
EAT|Pangborn Memorial Airport|Wenatchee|US|47.399|-120.207|America/Los_Angeles|m|s|
EAU|Chippewa Valley Regional Airport|Eau Claire|US|44.866|-91.484|America/Chicago|m|s|
EBA|Marina di Campo Airport|Campo nell'Elba|IT|42.761|10.24|Europe/Rome|m|s|Elba
EBB|Entebbe International Airport|Entebbe|UG|0.042|32.444|Asia/Riyadh|l|s|
EBD|El-Obeid Airport|El-Obeid|SD|13.153|30.233|Africa/Khartoum|m|s|Al-Ubayyid
EBG|El Bagre Airport|El Bagre|CO|7.596|-74.809|America/Bogota|m|n|El Tomin Airport
EBJ|Esbjerg Airport|Esbjerg|DK|55.526|8.553|Europe/Berlin|m|s|offshore, North Sea
EBL|Erbil International Airport|Arbil|IQ|36.236|43.947|Asia/Baghdad|l|s|Irbil, Kurdistan, فروکه‌خانه‌ی نيوده‌وله‌تی هه‌ولير
EBM|El Borma Airport|El Borma|TN|31.704|9.255|Africa/Tunis|m|n|
EBU|Saint-Étienne-Bouthéon Airport|Andrézieux-Bouthéon, Loire|FR|45.541|4.296|Europe/Paris|m|n|Saint-Étienne-Loire
ECG|Elizabeth City Regional Airport & Coast Guard Air Station|Elizabeth City|US|36.261|-76.175|America/New_York|m|n|
ECH|Echuca Airport||AU|-36.157|144.762|Australia/Melbourne|m|n|
ECN|Ercan International Airport|Tymbou (Kirklar)|CY|35.153|33.507|Asia/Famagusta|l|s|Tymvou, Nicosia, Lefkoşa
ECP|Northwest Florida Beaches International Airport|Panama City Beach|US|30.357|-85.795|America/Chicago|m|s|
EDF|Elmendorf Air Force Base|Anchorage|US|61.252|-149.807|America/Anchorage|m|n|
EDI|Edinburgh Airport|Ingliston, Edinburgh|GB|55.95|-3.372|Europe/London|l|s|
EDL|Eldoret International Airport|Eldoret|KE|0.404|35.239|Asia/Riyadh|l|s|HKED
EDM|La Roche-sur-Yon Les Ajoncs Airport|La Roche-sur-Yon|FR|46.702|-1.379|Europe/Paris|m|n|
EDO|Balıkesir Koca Seyit Airport|Edremit|TR|39.553|27.01|Europe/Istanbul|l|s|
EDW|Edwards Air Force Base|Edwards|US|34.911|-117.886|America/Los_Angeles|m|n|
EEA|Planalto Serrano Regional Airport|Correia Pinto|BR|-27.634|-50.358|America/Sao_Paulo|m|n|
EED|Needles Airport|Needles|US|34.766|-114.623|America/Los_Angeles|m|n|Needles AAF
EEN|Dillant Hopkins Airport|Keene|US|42.898|-72.271|America/New_York|m|n|
EES|Berenice International Airport / Banas Cape Air Base|Berenice Troglodytica|EG|23.98|35.46|Africa/Cairo|l|n|
EFD|Ellington Airport|Houston|US|29.607|-95.159|America/Chicago|m|n|Ellington Field
EFL|Kefallinia Airport|Kefallinia Island|GR|38.12|20.5|Europe/Athens|m|s|
EGC|Bergerac Dordogne-Périgord airport|Bergerac|FR|44.825|0.519|Europe/Paris|m|s|
EGE|Eagle County Regional Airport|Eagle|US|39.643|-106.918|America/Denver|m|s|
EGH|El Jora Airport|El Jora|EG|31.078|34.153|Africa/Cairo|m|n|
EGI|Duke Field|Crestview|US|30.65|-86.523|America/Chicago|m|n|Eglin AF Auxiliary Number 3
EGO|Belgorod International Airport|Belgorod|RU|50.644|36.59|Europe/Moscow|m|n|
EGS|Egilsstaðir Airport|Egilsstaðir|IS|65.283|-14.401|Africa/Abidjan|m|s|
EGX|Egegik Airport|Egegik|US|58.184|-157.375|America/Anchorage|m|s|
EHL|El Bolsón Airfield|El Bolsón|AR|-41.943|-71.532|America/Argentina/Salta|m|n|
EHM|Cape Newenham LRRS Airport|Cape Newenham|US|58.646|-162.063|America/Nome|m|n|
EHU|Ezhou Huahu International Airport|Ezhou|CN|30.341|115.039|Asia/Shanghai|l|s|EHU, ZHEC
EIB|Eisenach-Kindel Airport|Hörselberg-Hainich|DE|50.992|10.48|Europe/Berlin|m|n|Flugplatz Eisenach-Kindel
EIE|Yeniseysk Airport|Yeniseysk|RU|58.474|92.113|Asia/Krasnoyarsk|m|s|Yeniseisk Airport, Аэропорт Енисейск
EIK|Yeysk Airport|Yeysk|RU|46.68|38.21|Europe/Moscow|m|n|Аэропорт Ейск, УРКЕ, ЬРКЕ
EIL|Eielson Air Force Base|Fairbanks|US|64.666|-147.102|America/Anchorage|m|n|
EIN|Eindhoven Airport|Eindhoven|NL|51.45|5.375|Europe/Brussels|l|s|Welschap Airport
EIS|Terrance B. Lettsome International Airport|Beef Island|VG|18.445|-64.542|America/Puerto_Rico|l|s|BVI, Beef Island Airport, Road Town
EJA|Yariguíes Airport|Barrancabermeja|CO|7.024|-73.807|America/Bogota|m|s|
EJH|Al Wajh Domestic Airport|Al Wajh|SA|26.199|36.476|Asia/Riyadh|m|s|Wedjh, Wejh
EKA|Murray Field|Eureka|US|40.803|-124.113|America/Los_Angeles|m|n|
EKB|Ekibastuz Airport|Ekibastuz|KZ|51.591|75.215|Asia/Almaty|m|n|Аэропорт Экибастуз
EKN|Elkins-Randolph County Regional Airport|Elkins|US|38.89|-79.858|America/New_York|m|n|
EKO|Elko Regional Airport|Elko|US|40.825|-115.792|America/Los_Angeles|m|s|
EKT|Eskilstuna Airport|Eskilstuna|SE|59.351|16.708|Europe/Berlin|m|n|
ELB|Las Flores Airport|El Banco|CO|9.046|-73.975|America/Bogota|m|n|
ELC|Elcho Island Airport|Elcho Island|AU|-12.019|135.571|Australia/Darwin|m|s|
ELD|South Arkansas Regional Airport at Goodwin Field|El Dorado|US|33.221|-92.813|America/Chicago|m|s|
ELF|El Fasher Airport|El Fasher|SD|13.615|25.325|Africa/Khartoum|m|s|El Fashir Airport
ELG|El Golea Airport|El Menia|DZ|30.581|2.862|Africa/Algiers|m|s|
ELH|North Eleuthera Airport|North Eleuthera|BS|25.476|-76.681|America/Toronto|m|s|
ELM|Elmira Corning Regional Airport|Elmira/Corning|US|42.16|-76.892|America/New_York|m|s|
ELP|El Paso International Airport|El Paso|US|31.81|-106.376|America/Denver|l|s|
ELQ|Prince Naif bin Abdulaziz International Airport|Qassim|SA|26.303|43.774|Asia/Riyadh|l|s|Gassim
ELS|King Phalo Airport|East London|ZA|-33.036|27.826|Africa/Johannesburg|l|s|
ELU|Guemar Airport - مطار قمار بالوادي|Guemar|DZ|33.511|6.777|Africa/Algiers|m|s|
ELY|Ely Airport Yelland Field|Ely|US|39.3|-114.842|America/Los_Angeles|m|n|
EMA|East Midlands Airport|Nottingham, Leicestershire|GB|52.831|-1.328|Europe/London|l|s|RAF Castle Donington
EMD|Emerald Airport|Emerald|AU|-23.567|148.179|Australia/Brisbane|m|s|
EMK|Emmonak Airport|Emmonak|US|62.786|-164.491|America/Nome|m|s|
EML|Emmen Air Base|Emmen|CH|47.092|8.305|Europe/Zurich|m|n|
ENA|Kenai Municipal Airport|Kenai|US|60.571|-151.245|America/Anchorage|m|s|
ENC|Nancy-Essey Airport|Tomblaine, Meurthe-et-Moselle|FR|48.692|6.23|Europe/Paris|m|n|
END|Vance Air Force Base|Enid|US|36.339|-97.916|America/Chicago|m|n|
ENF|Enontekio Airport|Enontekio|FI|68.363|23.424|Europe/Helsinki|m|s|
ENH|Enshi Xujiaping Airport|Enshi (Enshi)|CN|30.32|109.485|Asia/Shanghai|m|s|
ENK|Enniskillen/St Angelo Airport|Enniskillen, Fermanagh and Omagh|GB|54.398|-7.651|Europe/London|m|n|
ENN|Nenana Municipal Airport|Nenana|US|64.549|-149.075|America/Anchorage|m|n|
ENO|Teniente Ramon A. Ayub Gonzalez International Airport|Encarnación|PY|-27.228|-55.838|America/Asuncion|l|s|Aeropuerto Internacional Tte. Amin Ayub González
ENS|Twente Airport|Enschede|NL|52.276|6.889|Europe/Brussels|m|n|
ENU|Akanu Ibiam International Airport|Enegu|NG|6.474|7.56|Africa/Lagos|l|s|Enegu Airport
ENV|Wendover Airport|Wendover|US|40.719|-114.031|America/Denver|m|n|Wendover AFB
ENW|Kenosha Regional Airport|Kenosha|US|42.596|-87.928|America/Chicago|m|n|
ENY|Yan'an Nanniwan Airport|Yan'an (Baota)|CN|36.479|109.464|Asia/Shanghai|m|s|
EOH|Enrique Olaya Herrera Airport|Medellín|CO|6.22|-75.591|America/Bogota|m|s|
EOI|Eday Airport|Eday|GB|59.191|-2.772|Europe/London|m|s|London Airport
EOR|El Dorado Airport|Bolivar|VE|6.716|-61.639|America/Caracas|m|n|
EOZ|Elorza Airport||VE|7.06|-69.497|America/Caracas|m|n|
EPA|El Palomar Airport|El Palomar|AR|-34.61|-58.613|America/Argentina/Buenos_Aires|m|n|
EPL|Épinal Mirecourt Airport|Épinal|FR|48.325|6.07|Europe/Paris|m|n|
EPR|Esperance Airport|Esperance|AU|-33.684|121.823|Australia/Perth|m|s|
EPU|Pärnu Airport|Pärnu|EE|58.419|24.473|Europe/Tallinn|m|s|
EQS|Esquel Brigadier Antonio Parodi International Airport|Esquel|AR|-42.908|-71.14|America/Argentina/Catamarca|m|s|
ERC|Erzincan Airport|Erzincan|TR|39.71|39.527|Europe/Istanbul|m|s|
ERD|Berdyansk Airport|Berdyansk|UA|46.815|36.758|Europe/Kyiv|m|n|УКДБ, Бердянськ
ERF|Erfurt-Weimar Airport|Erfurt|DE|50.978|10.961|Europe/Berlin|l|s|Flughafen Erfurt-Weimar
ERH|Moulay Ali Cherif Airport|Errachidia|MA|31.948|-4.398|Africa/Casablanca|m|s|
ERI|Erie International Tom Ridge Field|Erie|US|42.083|-80.174|America/New_York|m|s|
ERL|Erenhot Saiwusu International Airport|Erenhot|CN|43.424|112.091|Asia/Shanghai|m|s|Saiwusu Airport
ERS|Eros Airport|Windhoek|NA|-22.605|17.079|Africa/Windhoek|m|s|
ERZ|Erzurum International Airport|Erzurum|TR|39.957|41.17|Europe/Istanbul|m|s|
ESB|Esenboğa International Airport|Ankara|TR|40.128|32.995|Europe/Istanbul|l|s|
ESC|Delta County Airport|Escanaba|US|45.723|-87.089|America/Detroit|m|s|
ESD|Orcas Island Airport|Eastsound|US|48.708|-122.91|America/Los_Angeles|m|s|
ESE|Ensenada International Airport / El Ciprés Air Base|Ensenada|MX|31.795|-116.602|America/Tijuana|m|n|El Ciprés Military Airbase Number 3, Gral. Alberto L. Salinas Carranza, Aeropuerto Internacional de Ensenada
ESF|Esler Army Airfield / Esler Regional Airport|Alexandria|US|31.394|-92.294|America/Chicago|m|n|Camp Beauregard Army Field
ESG|Dr. Luis María Argaña International Airport|Mariscal Estigarribia|PY|-22.046|-60.622|America/Asuncion|m|n|Aeropuerto Internacional Dr. Luis Maria Argaña
ESH|Brighton City Airport|Brighton, East Sussex|GB|50.836|-0.297|Europe/London|m|n|Shoreham Airport
ESK|Eskişehir Air Base|Eskişehir|TR|39.784|30.582|Europe/Istanbul|m|n|
ESL|Elista Airport|Elista|RU|46.374|44.331|Europe/Moscow|m|s|
ESM|Carlos Concha Torres International Airport|Tachina|EC|0.979|-79.627|America/Guayaquil|l|s|General Rivadeneira
ESR|Ricardo García Posada Airport|El Salvador|CL|-26.311|-69.765|America/Santiago|m|s|
ESU|Essaouira-Mogador Airport|Essaouira|MA|31.397|-9.682|Africa/Casablanca|m|s|
ETM|Ramon International Airport|Eilat|IL|29.727|35.014|Asia/Jerusalem|l|s|
ETR|Santa Rosa - Artillery Colonel Victor Larrea International Airport|Santa Rosa|EC|-3.442|-79.997|America/Guayaquil|m|s|Machala International Airport
ETZ|Metz-Nancy-Lorraine Airport|Goin|FR|48.982|6.251|Europe/Paris|m|s|
EUG|Eugene Airport|Eugene|US|44.125|-123.212|America/Los_Angeles|m|s|Mahlon Sweet Field
EUN|Laayoune Hassan I International Airport|El Aaiún|EH|27.142|-13.225|Africa/El_Aaiun|l|s|GSAI
EUQ|Evelio Javier Airport|San Jose|PH|10.767|121.933|Asia/Manila|m|n|Antique Airport
EUX|F. D. Roosevelt Airport|Oranjestad|BQ|17.497|-62.979|America/Puerto_Rico|m|s|
EVE|Harstad/Narvik Airport|Evenes|NO|68.491|16.678|Europe/Berlin|l|s|Harstad/Narvik lufthavn, Evenes, Evenes Airport
EVN|Zvartnots International Airport|Yerevan|AM|40.149|44.398|Asia/Yerevan|l|s|UGEE, Erevan Airport, Erivan Airport, Аэропорт Звартноц, Аэропорт Ереван
EVV|Evansville Regional Airport|Evansville|US|38.037|-87.532|America/Chicago|m|s|
EVW|Evanston-Uinta County Airport-Burns Field|Evanston|US|41.275|-111.035|America/Denver|m|n|
EVX|Évreux-Fauville (BA 105) Air Base|Fauville, Eure|FR|49.029|1.22|Europe/Paris|m|n|
EWB|New Bedford Regional Airport|New Bedford|US|41.676|-70.957|America/New_York|m|s|
EWN|Coastal Carolina Regional Airport|New Bern|US|35.073|-77.043|America/New_York|m|s|
EWR|Newark Liberty International Airport|Newark|US|40.689|-74.171|America/New_York|l|s|Manhattan, New York City, NYC
EXT|Exeter International Airport|Exeter, Devon|GB|50.734|-3.414|Europe/London|m|s|
EYK|Beloyarskiy Airport||RU|63.687|66.699|Asia/Yekaterinburg|m|s|Beloyarsky Airport, Аэропорт Белоярский, УСХЯ
EYP|El Alcaravan - Yopal Airport|Yopal|CO|5.319|-72.384|America/Bogota|m|s|
EYW|Key West International Airport|Key West|US|24.556|-81.76|America/New_York|m|s|
EZE|Ezeiza International Airport - Ministro Pistarini|Buenos Aires (Ezeiza)|AR|-34.822|-58.536|America/Argentina/Buenos_Aires|l|s|BUE
EZS|Elazığ Airport|Elazığ|TR|38.598|39.283|Europe/Istanbul|m|s|
EZV|Berezovo Airport||RU|63.921|65.031|Asia/Yekaterinburg|m|n|Beryozovo Airport, Аэропорт Березово, Аэропорт Берёзово
FAB|Farnborough Airport|Farnborough, Hampshire|GB|51.276|-0.776|Europe/London|m|n|TAG London Farnborough Airport, RAE Farnborough, EGUF
FAE|Vágar Airport|Vágar|FO|62.063|-7.276|Atlantic/Faroe|l|s|Faroes, RAF Vágar
FAF|Felker Army Air Field|Newport News (Fort Eustis)|US|37.133|-76.609|America/New_York|m|n|
FAI|Fairbanks International Airport|Fairbanks|US|64.815|-147.856|America/Anchorage|m|s|
FAO|Faro - Gago Coutinho International Airport|Faro|PT|37.016|-7.971|Europe/Lisbon|l|s|
FAR|Hector International Airport|Fargo|US|46.921|-96.816|America/Chicago|m|s|119th Wing, Happy Hooligans
FAT|Fresno Yosemite International Airport|Fresno|US|36.776|-119.718|America/Los_Angeles|l|s|
FAV|Fakarava Airport||PF|-16.054|-145.657|Pacific/Honolulu|m|s|
FAY|Fayetteville Regional Airport - Grannis Field|Fayetteville|US|34.991|-78.88|America/New_York|m|s|
FAZ|Fasa Airport|Fasa|IR|28.892|53.723|Asia/Tehran|m|n|
FBG|Simmons Army Air Field|Fort Bragg|US|35.132|-78.937|America/New_York|m|n|
FBK|Ladd Army Airfield|Fairbanks|US|64.838|-147.614|America/Anchorage|m|n|Fort Wainwright
FBM|Lubumbashi International Airport|Lubumbashi|CD|-11.591|27.531|Africa/Johannesburg|l|s|Luano Airport
FCA|Glacier Park International Airport|Kalispell|US|48.311|-114.256|America/Denver|m|s|Formerly KFCA
FCB|Ficksburg Sentraoes Airport|Ficksburg|ZA|-28.823|27.909|Africa/Johannesburg|m|n|
FCN|Sea-Airport Cuxhaven/Nordholz / Nordholz Naval Airbase|Wurster Nordseeküste|DE|53.768|8.659|Europe/Berlin|m|s|Fliegerhorst Nordholz, Flughafen Cuxhaven/Nordholz
FCO|Rome–Fiumicino Leonardo da Vinci International Airport|Rome|IT|41.805|12.252|Europe/Rome|l|s|Rome Fiumicino Airport, Fiumicino Airport
FCS|Butts AAF (Fort Carson) Air Field|Fort Carson|US|38.678|-104.757|America/Denver|m|n|
FDF|Martinique Aimé Césaire International Airport|Fort-de-France|MQ|14.591|-61.003|America/Martinique|l|s|Le Lamentin Airport
FDH|Bodensee Airport Friedrichshafen|Friedrichshafen|DE|47.671|9.511|Europe/Berlin|l|s|
FDU|Bandundu Airport|Bandundu|CD|-3.311|17.382|Africa/Lagos|m|s|
FDY|Findlay Airport|Findlay|US|41.014|-83.669|America/New_York|m|n|
FEC|João Durval Carneiro Airport|Feira de Santana|BR|-12.201|-38.906|America/Bahia|m|n|SNJD, SBFE
FEG|Fergana International Airport|Fergana|UZ|40.359|71.745|Asia/Tashkent|m|s|UTFF, UTKF
FEN|Fernando de Noronha Airport|Fernando de Noronha|BR|-3.855|-32.423|America/Noronha|m|s|
FEZ|Fes Saïss International Airport|Saïss|MA|33.927|-4.978|Africa/Casablanca|l|s|
FFD|RAF Fairford|Fairford, Gloucestershire|GB|51.684|-1.789|Europe/London|m|n|
FFO|Wright-Patterson Air Force Base|Dayton|US|39.826|-84.048|America/New_York|m|n|Wilbur Wright Field, Fairfield Air Depot
FGU|Fangatau Airport|Fangatau|PF|-15.82|-140.888|Pacific/Honolulu|m|s|
FHU|Sierra Vista Municipal Airport / Libby Army Air Field|Fort Huachuca / Sierra Vista|US|31.587|-110.348|America/Phoenix|m|n|fort huachuca
FIH|Ndjili International Airport|Kinshasa|CD|-4.386|15.445|Africa/Lagos|l|s|
FIZ|Fitzroy Crossing Airport||AU|-18.184|125.56|Australia/Perth|m|s|
FJR|Fujairah International Airport|Fujairah|AE|25.108|56.328|Asia/Dubai|l|s|
FKB|Karlsruhe Baden-Baden Airport|Rheinmünster|DE|48.779|8.081|Europe/Berlin|l|s|Baden Airpark
FKI|Bangoka International Airport|Kisangani|CD|0.482|25.338|Africa/Johannesburg|l|s|
FKJ|Fukui Airport|Fukui|JP|36.143|136.224|Asia/Tokyo|m|n|
FKL|Venango Regional Airport|Franklin|US|41.378|-79.86|America/New_York|m|n|
FKQ|Fakfak Airport|Fakfak|ID|-2.921|132.267|Asia/Tokyo|m|s|Iboru, Torea, Fak Fak
FKS|Fukushima Airport|Sukagawa|JP|37.227|140.431|Asia/Tokyo|m|s|福島空港
FLA|Gustavo Artunduaga Paredes Airport|Florencia|CO|1.589|-75.564|America/Bogota|m|s|
FLG|Flagstaff Pulliam Airport|Flagstaff|US|35.14|-111.67|America/Phoenix|m|s|
FLL|Fort Lauderdale Hollywood International Airport|Fort Lauderdale|US|26.073|-80.153|America/New_York|l|s|MFW, South Florida
FLN|Hercílio Luz International Airport|Florianópolis|BR|-27.67|-48.553|America/Sao_Paulo|l|s|http://www.infraero.gov.br/usa/aero_prev_home.php?ai=228
FLO|Florence Regional Airport|Florence|US|34.185|-79.724|America/New_York|m|s|
FLR|Florence Airport, Peretola|Firenze|IT|43.809|11.203|Europe/Rome|l|s|Firenze, Amerigo Vespucci Airport, Aeroporto di Firenze-Peretola
FLW|Flores Airport|Santa Cruz das Flores|PT|39.455|-31.131|Atlantic/Azores|m|s|
FLZ|Dr. Ferdinand Lumban Tobing Airport|Sibolga (Pinangsori)|ID|1.557|98.887|Asia/Jakarta|m|s|Pinangsori Airport
FMA|Formosa National Airport|Formosa|AR|-26.213|-58.228|America/Argentina/Cordoba|m|s|Aeropuerto Nacional de Formosa
FME|Fort Meade Executive Airport|Fort Meade(Odenton)|US|39.085|-76.759|America/New_York|m|n|Fort George G. Meade Army Airfield, Tipton Airport
FMI|Kalemie Airport|Kalemie|CD|-5.876|29.25|Africa/Johannesburg|m|s|
FMM|Memmingen Allgau Airport|Memmingen|DE|47.988|10.238|Europe/Berlin|l|s|ETSM
FMN|Four Corners Regional Airport|Farmington|US|36.741|-108.23|America/Denver|m|n|
FMO|Münster Osnabrück Airport|Greven|DE|52.134|7.688|Europe/Berlin|l|s|
FMY|Page Field|Fort Myers|US|26.587|-81.863|America/New_York|m|n|
FNA|Lungi International Airport|Freetown (Lungi-Town)|SL|8.616|-13.195|Africa/Abidjan|l|s|
FNB|Neubrandenburg Trollenhagen Airport|Trollenhagen|DE|53.602|13.306|Europe/Berlin|m|n|ETNU
FNC|Cristiano Ronaldo International Airport|Funchal|PT|32.698|-16.775|Atlantic/Madeira|l|s|Madeira, Funchal
FNI|Nîmes-Arles-Camargue Airport|Nîmes/Garons|FR|43.757|4.416|Europe/Paris|m|s|
FNJ|Pyongyang Sunan International Airport|Pyongyang|KP|39.224|125.67|Asia/Pyongyang|l|s|North Korea, no commercial flights.
FNL|Northern Colorado Regional Airport|Loveland|US|40.45|-105.011|America/Denver|m|n|Fort Collins Loveland Municipal
FNT|Bishop International Airport|Flint|US|42.969|-83.743|America/Detroit|m|s|
FOC|Fuzhou Changle International Airport|Fuzhou (Changle)|CN|25.929|119.673|Asia/Shanghai|l|s|
FOD|Fort Dodge Regional Airport|Fort Dodge|US|42.553|-94.191|America/Chicago|m|s|
FOE|Topeka Regional Airport|Topeka|US|38.951|-95.664|America/Chicago|m|n|Topeka Army Airfield, Forbes AFB, Forbes Field
FOG|Foggia Gino Lisa Airport|Foggia|IT|41.434|15.535|Europe/Rome|m|s|Foggia Airport
FOM|Foumban Nkounja Airport|Foumban|CM|5.637|10.751|Africa/Lagos|m|n|
FON|La Fortuna Arenal Airport|La Fortuna|CR|10.469|-84.579|America/Costa_Rica|m|s|El Tanque Airport
FOR|Pinto Martins International Airport|Fortaleza|BR|-3.776|-38.532|America/Fortaleza|l|s|
FOS|Forrest Airport||AU|-30.837|128.113|Australia/Perth|m|n|
FPO|Grand Bahama International Airport|Freeport|BS|26.558|-78.696|America/Toronto|l|s|
FPR|Treasure Coast International Airport|Fort Pierce|US|27.495|-80.368|America/New_York|m|n|St Lucie County
FRA|Frankfurt Main Airport|Frankfurt am Main|DE|50.027|8.558|Europe/Berlin|l|s|EDAF, Frankfurt am Main, Rhein-Main Air Base, Zeppelinheim
FRB|Forbes Airport|Forbes|AU|-33.364|147.935|Australia/Sydney|m|n|
FRD|Friday Harbor Airport|Friday Harbor|US|48.524|-123.025|America/Los_Angeles|m|s|
FRG|Republic Airport|East Farmingdale|US|40.729|-73.414|America/New_York|m|n|Fairchild Flying Field
FRI|Marshall Army Air Field|Fort Riley (Junction City)|US|39.053|-96.764|America/Chicago|m|n|
FRL|Forlì-Luigi Ridolfi International Airport|Forlì|IT|44.195|12.07|Europe/Rome|m|s|L Ridolfi, Ronco di Forlì
FRO|Florø Airport|Florø|NO|61.584|5.025|Europe/Berlin|m|s|Floro
FRS|Mundo Maya International Airport|San Benito|GT|16.914|-89.866|America/Guatemala|m|s|Flores International Airport
FRW|Phillip Gaonwe Matante International Airport|Francistown|BW|-21.159|27.469|Africa/Johannesburg|l|s|FBFT
FRZ|Fritzlar Army Airfield|Fritzlar|DE|51.115|9.286|Europe/Berlin|m|n|Heeresflugplatz Fritzlar
FSC|Figari Sud-Corse Airport|Figari|FR|41.502|9.097|Europe/Paris|l|s|
FSD|Sioux Falls Regional Airport|Sioux Falls|US|43.585|-96.741|America/Chicago|m|s|Joe Foss Field, Fighting Lobos, Sioux Falls Army Air Base, 114th Fighter Wing
FSI|Henry Post Army Air Field|Fort Sill|US|34.65|-98.402|America/Chicago|m|n|
FSM|Fort Smith Regional Airport|Fort Smith|US|35.337|-94.367|America/Chicago|m|s|
FSP|Saint-Pierre Pointe-Blanche Airport|Saint-Pierre|PM|46.763|-56.175|America/Miquelon|m|s|
FST|Fort Stockton Pecos County Airport|Fort Stockton|US|30.916|-102.916|America/Chicago|m|n|Gibbs Field, Fort Stockton Field
FSZ|Mount Fuji Shizuoka Airport|Makinohara / Shimada|JP|34.795|138.191|Asia/Tokyo|l|s|富士山静岡空港
FTE|El Calafate - Commander Armando Tola International Airport|El Calafate|AR|-50.28|-72.053|America/Argentina/Rio_Gallegos|m|s|
FTK|Godman Army Air Field|Fort Knox|US|37.907|-85.972|America/New_York|m|n|
FTU|Tôlanaro Airport|Tôlanaro|MG|-25.038|46.956|Asia/Riyadh|m|s|Tolagnaro Airport, Marillac Airport, Fort-Dauphin
FTW|Fort Worth Meacham International Airport|Fort Worth|US|32.82|-97.361|America/Chicago|m|s|
FTX|Owando Airport|Owando|CG|-0.525|15.938|Africa/Lagos|m|n|
FTY|Fulton County Airport Brown Field|Atlanta|US|33.779|-84.521|America/New_York|m|n|
FUE|Fuerteventura Airport|El Matorral|ES|28.453|-13.864|Atlantic/Canary|l|s|
FUG|Fuyang Xiguan Airport|Yingzhou, Fuyang|CN|32.882|115.734|Asia/Shanghai|m|s|
FUJ|Fukue Airport|Goto|JP|32.666|128.833|Asia/Tokyo|m|s|Goto-Fukue, Goto Tsubaki
FUK|Fukuoka Airport|Fukuoka|JP|33.586|130.451|Asia/Tokyo|l|s|Itazuke Air Base
FUN|Funafuti International Airport|Funafuti|TV|-8.524|179.197|Pacific/Tarawa|m|s|
FUO|Foshan Shadi Airport|Foshan (Nanhai)|CN|23.082|113.071|Asia/Shanghai|m|s|Guangzhou Shadi Air Base
FWA|Fort Wayne International Airport|Fort Wayne|US|40.979|-85.194|America/Indiana/Indianapolis|m|s|Baer Field
FWH|NAS Fort Worth JRB / Carswell Field|Fort Worth|US|32.769|-97.441|America/Chicago|m|n|Carswell AFB, Tarrant Field
FXE|Fort Lauderdale Executive Airport|Fort Lauderdale|US|26.197|-80.171|America/New_York|m|n|West Prospect Satellite Field
FYJ|Fuyuan Dongji Airport|Fuyuan|CN|48.197|134.363|Asia/Shanghai|m|s|
FYN|Fuyun Koktokay Airport|Fuyun|CN|46.804|89.512|Asia/Shanghai|m|s|
FYT|Faya-Largeau Airport|Faya-Largeau|TD|17.917|19.111|Africa/Ndjamena|m|n|
FYU|Fort Yukon Airport|Fort Yukon|US|66.572|-145.25|America/Anchorage|m|s|
FYV|Drake Field|Fayetteville|US|36.005|-94.17|America/Chicago|m|n|
GAE|Gabès Matmata International Airport|Gabès|TN|33.734|9.919|Africa/Tunis|m|n|
GAF|Gafsa Ksar International Airport|Gafsa|TN|34.422|8.822|Africa/Tunis|m|n|
GAJ|Yamagata Airport|Higashine|JP|38.412|140.371|Asia/Tokyo|m|s|
GAL|Edward G. Pitka Sr Airport|Galena|US|64.736|-156.937|America/Anchorage|m|s|
GAM|Gambell Airport|Gambell|US|63.768|-171.733|America/Nome|m|s|
GAN|Gan International Airport|Gan|MV|-0.693|73.153|Indian/Maldives|l|s|Addu City, Gan Airport
GAO|Mariana Grajales Airport|Guantánamo|CU|20.085|-75.158|America/Havana|m|n|Aerodromo los Caños
GAQ|Gao International Airport|Gao|ML|16.248|-0.005|Africa/Abidjan|m|s|Korogoussou
GAU|Lokpriya Gopinath Bordoloi International Airport|Guwahati|IN|26.107|91.585|Asia/Kolkata|l|s|Borjhar Airport, Mountain Shadow Air Force Station
GAY|Gaya Airport|Gaya|IN|24.744|84.951|Asia/Kolkata|m|s|
GBB|Gabala International Airport|Gabala|AZ|40.809|47.725|Asia/Baku|m|s|Qəbələ, Qabala
GBE|Sir Seretse Khama International Airport|Gaborone|BW|-24.555|25.918|Africa/Johannesburg|l|s|
GBJ|Marie-Galante Airport|Grand-Bourg|GP|15.869|-61.27|America/Puerto_Rico|m|s|Marie Galante
GBT|Gorgan Airport|Gorgan|IR|36.909|54.401|Asia/Tehran|m|n|
GCC|Northeast Wyoming Regional Airport|Gillette|US|44.349|-105.539|America/Denver|m|s|Gillette Campbell County Airport
GCH|Gachsaran Airport|Gachsaran|IR|30.334|50.834|Asia/Tehran|m|s|
GCI|Guernsey Airport|Saint Peter Port|GG|49.435|-2.602|Europe/London|m|s|Channel Islands
GCJ|Grand Central Airport|Midrand|ZA|-25.986|28.14|Africa/Johannesburg|m|n|
GCK|Garden City Regional Airport|Garden City|US|37.928|-100.724|America/Chicago|m|s|
GCM|Owen Roberts International Airport|George Town|KY|19.293|-81.358|America/Panama|l|s|Grand Cayman, George Town
GCN|Grand Canyon National Park Airport|Grand Canyon - Tusayan|US|35.952|-112.147|America/Phoenix|m|s|
GDB|Gondia Airport|Gondia|IN|21.527|80.29|Asia/Kolkata|m|s|Birsi
GDE|Gode Airport|Gode|ET|5.935|43.579|Asia/Riyadh|m|s|Iddiole
GDL|Guadalajara International Airport|Guadalajara|MX|20.523|-103.31|America/Mexico_City|l|s|Miguel Hidalgo y Costilla Guadalajara
GDN|Gdańsk Lech Wałęsa Airport|Gdańsk|PL|54.378|18.466|Europe/Warsaw|l|s|Gdańsk-Rębiechowo
GDO|Guasdualito Airport|Guasdualito|VE|7.211|-70.756|America/Caracas|m|n|
GDQ|Gondar Airport|Azezo|ET|12.52|37.434|Asia/Riyadh|m|s|Atse Tewodros, Emperor Tewodros
GDT|JAGS McCartney International Airport|Cockburn Town|TC|21.445|-71.142|America/Grand_Turk|m|s|
GDV|Dawson Community Airport|Glendive|US|47.138|-104.807|America/Denver|m|s|
GDX|Sokol Airport|Magadan|RU|59.911|150.72|Asia/Magadan|m|s|
GDZ|Gelendzhik Airport|Gelendzhik|RU|44.582|38.012|Europe/Moscow|m|s|Аэропорт Геленджик
GEA|Nouméa Magenta Airport|Nouméa|NC|-22.258|166.473|Pacific/Noumea|m|s|l'Aéroport de Nouméa Magenta
GEC|Geçitkale Airbase|Lefkoniko (Geçitkale)|CY|35.236|33.72|Asia/Famagusta|m|n|Geçitkale Air Base
GEG|Spokane International Airport|Spokane|US|47.62|-117.534|America/Los_Angeles|l|s|
GEL|Santo Ângelo Airport|Santo Ângelo|BR|-28.283|-54.17|America/Sao_Paulo|m|s|
GEM|President Obiang Nguema International Airport|Mengomeyén|GQ|1.676|11.025|Africa/Lagos|m|s|
GEO|Cheddi Jagan International Airport|Georgetown|GY|6.499|-58.254|America/Guyana|l|s|SYGT, Atkinson AFB. Timehri Intl
GER|Rafael Cabrera Airport|Nueva Gerona|CU|21.835|-82.784|America/Havana|m|s|
GES|General Santos International Airport|General Santos|PH|6.057|125.096|Asia/Manila|l|s|Tambler Airport
GET|Geraldton Airport|Moonyoonooka|AU|-28.796|114.707|Australia/Perth|m|s|
GEV|Gällivare Airport|Gällivare|SE|67.132|20.815|Europe/Berlin|m|s|
GFF|Griffith Airport|Griffith|AU|-34.251|146.067|Australia/Sydney|m|s|
GFK|Grand Forks International Airport|Grand Forks|US|47.949|-97.176|America/Chicago|m|s|
GFL|Floyd Bennett Memorial Airport|Glens Falls|US|43.341|-73.61|America/New_York|m|n|
GFN|Clarence Valley Regional Airport|Grafton|AU|-29.755|153.031|Australia/Sydney|m|n|
GFR|Granville Airport|Bréville-sur-Mer, Manche|FR|48.883|-1.564|Europe/Paris|m|n|Granville Mont-Saint-Michel
GFY|Grootfontein Airport|Grootfontein|NA|-19.602|18.123|Africa/Windhoek|m|n|
GGG|East Texas Regional Airport|Longview|US|32.384|-94.712|America/Chicago|m|s|
GGT|Exuma International Airport|Moss Town|BS|23.563|-75.878|America/Toronto|m|s|
GGW|Glasgow Valley County Airport Wokal Field|Glasgow|US|48.213|-106.615|America/Denver|m|s|Glascow / Valley County, Glasgow Army Airfield, Wokal Field Glasgow International, Glasgow Satellite Airfield
GHA|Noumérat - Moufdi Zakaria Airport|El Atteuf|DZ|32.384|3.794|Africa/Algiers|m|s|Ghardaïa
GHB|Governor's Harbour Airport|Governor's Harbour|BS|25.285|-76.331|America/Toronto|m|s|
GHC|Great Harbour Cay Airport|Bullocks Harbour|BS|25.738|-77.84|America/Toronto|m|n|
GHN|Guanghan Airport|Deyang (Guanghan)|CN|30.948|104.33|Asia/Shanghai|m|n|Civil Aviation Flight University of China
GHT|Ghat Airport|Ghat|LY|25.146|10.143|Africa/Tripoli|m|n|
GHU|Gualeguaychu Airport|Gualeguaychu|AR|-33.006|-58.613|America/Argentina/Cordoba|m|n|
GHV|Brașov-Ghimbav International Airport|Brașov (Ghimbav)|RO|45.706|25.523|Europe/Bucharest|l|s|Aeroportul Internațional Brașov-Ghimbav
GIB|Gibraltar Airport|Gibraltar|GI|36.152|-5.35|Europe/Gibraltar|l|s|
GID|Gitega Airport|Gitega|BI|-3.417|29.911|Africa/Johannesburg|m|s|Kitega
GIG|Rio de Janeiro Galeão – Tom Jobim International Airport|Rio De Janeiro|BR|-22.81|-43.251|America/Sao_Paulo|l|s|Galeão - Antônio Carlos Jobim International Airport
GIL|Gilgit Airport|Gilgit|PK|35.919|74.334|Asia/Karachi|m|s|
GIR|Santiago Vila Airport|Girardot|CO|4.276|-74.797|America/Bogota|m|n|
GIS|Gisborne Airport|Gisborne|NZ|-38.663|177.978|Pacific/Auckland|m|s|
GIZ|Jizan Regional Airport / King Abdullah bin Abdulaziz Airport|Jizan|SA|16.901|42.586|Asia/Riyadh|m|s|Gizan
GJA|La Laguna Airport|Guanaja|HN|16.445|-85.907|America/Tegucigalpa|m|s|
GJL|Jijel Ferhat Abbas Airport|Tahir|DZ|36.794|5.874|Africa/Algiers|l|s|
GJM|Guajará-Mirim Airport|Guajará-Mirim|BR|-10.786|-65.285|America/Porto_Velho|m|n|
GJT|Grand Junction Regional Airport|Grand Junction|US|39.127|-108.529|America/Denver|m|s|
GKA|Goroka Airport|Goronka|PG|-6.082|145.392|Pacific/Port_Moresby|m|s|
GKE|Geilenkirchen Air Base|Geilenkirchen|DE|50.961|6.042|Europe/Berlin|m|n|
GKN|Gulkana Airport|Gulkana|US|62.156|-145.455|America/Anchorage|m|s|
GLA|Glasgow Airport|Glasgow|GB|55.872|-4.433|Europe/London|l|s|Port-adhair Eadar-nàiseanta Ghlaschu, RAF Abbotsinch, RAF Ayr
GLD|Goodland Municipal Airport|Goodland|US|39.371|-101.7|America/Denver|m|n|Renner Field
GLF|Golfito Airport|Golfito|CR|8.654|-83.182|America/Costa_Rica|m|s|
GLH|Mid Delta Regional Airport|Greenville|US|33.483|-90.986|America/Chicago|m|s|
GLI|Glen Innes Airport|Glen Innes|AU|-29.676|151.691|Australia/Sydney|m|n|
GLO|Gloucestershire Airport|Staverton, Gloucestershire|GB|51.894|-2.167|Europe/London|m|n|Gloucester/Cheltenham
GLS|Scholes International At Galveston Airport|Galveston|US|29.265|-94.86|America/Chicago|m|n|
GLT|Gladstone Airport|Gladstone|AU|-23.87|151.225|Australia/Brisbane|m|s|
GLU|Gelephu Airport|Gelephu|BT|26.885|90.464|Asia/Thimphu|m|n|
GLZ|Gilze Rijen Air Base|Rijen|NL|51.567|4.932|Europe/Brussels|m|n|
GMA|Gemena Airport|Gemena|CD|3.235|19.771|Africa/Lagos|m|s|
GMB|Gambela Airport|Gambela|ET|8.129|34.563|Asia/Riyadh|m|s|Gambela National Park
GME|Gomel Airport|Gomel|BY|52.527|31.017|Europe/Minsk|m|s|
GMO|Gombe Lawanti International Airport|Gombe|NG|10.299|10.9|Africa/Lagos|m|s|
GMP|Seoul Gimpo International Airport|Seoul|KR|37.558|126.791|Asia/Seoul|l|s|Kimpo
GMQ|Golog Maqên Airport|Golog (Maqên)|CN|34.418|100.301|Asia/Shanghai|m|s|Guoluo Maqin, Maqin
GMR|Totegegie Airport||PF|-23.08|-134.89|Pacific/Gambier|m|s|
GMU|Greenville Downtown Airport|Greenville|US|34.848|-82.35|America/New_York|m|n|
GNA|Hrodna Airport|Hrodna|BY|53.602|24.054|Europe/Minsk|m|n|Grodno Airport, Гро́дна
GNB|Grenoble Alpes Isère Airport|Grenoble|FR|45.363|5.329|Europe/Paris|m|s|
GND|Maurice Bishop International Airport|Saint George's|GD|12.004|-61.785|America/Puerto_Rico|l|s|Point Salines
GNJ|Ganja International Airport|Ganja|AZ|40.739|46.32|Asia/Baku|l|s|KVD, Kirovabad, Gyandzha Airport, Аэропорт Гянджа, Ganca, Gəncə
GNS|Binaka Airport|Gunungsitoli|ID|1.166|97.705|Asia/Jakarta|m|s|
GNV|Gainesville Regional Airport|Gainesville|US|29.69|-82.272|America/New_York|m|s|
GNY|Şanlıurfa GAP Airport|Şanlıurfa|TR|37.446|38.896|Europe/Istanbul|l|s|
GOA|Genoa Cristoforo Colombo Airport|Genova|IT|44.412|8.841|Europe/Rome|l|s|Genova Sestri, Sestri Cristoforo Colombo Airport
GOH|Nuuk International Airport|Nuuk|GL|64.191|-51.679|America/Nuuk|l|s|Godthåb, Nuussuaq, Mittarfik Nuuk
GOI|Goa Dabolim International Airport|Vasco da Gama|IN|15.38|73.833|Asia/Kolkata|l|s|Goa Airport, Dabolim Navy Airbase, दाबोळी विमानतळ
GOJ|Nizhny Novgorod / Strigino International Airport|Nizhny Novgorod|RU|56.227|43.785|Europe/Moscow|l|s|УВГГ, ЬВГГ, Нижний Новгород / Стригино
GOM|Goma International Airport|Goma|CD|-1.667|29.238|Africa/Johannesburg|l|s|
GON|Groton New London Airport|Groton|US|41.33|-72.045|America/New_York|m|n|
GOP|Gorakhpur Airport|Gorakhpur|IN|26.74|83.45|Asia/Kolkata|m|s|Gorakhpur Air Force Station
GOQ|Golmud Airport|Golmud|CN|36.401|94.786|Asia/Shanghai|m|s|
GOT|Göteborg Landvetter Airport|Göteborg|SE|57.663|12.28|Europe/Berlin|l|s|Göteborg-Landvetter, Gothenburg
GOU|Garoua International Airport|Garoua|CM|9.335|13.372|Africa/Lagos|l|s|
GOV|Gove Airport|Nhulunbuy|AU|-12.269|136.818|Australia/Darwin|m|s|
GOX|Manohar International Airport|Mopa|IN|15.744|73.861|Asia/Kolkata|l|s|Mopa International
GOZ|Gorna Oryahovitsa Airport|Gorna Oryahovitsa|BG|43.151|25.713|Europe/Sofia|m|n|
GPA|Patras Araxos Agamemnon Airport|Patras|GR|38.151|21.426|Europe/Athens|m|s|
GPI|Guapi Airport|Guapi|CO|2.57|-77.898|America/Bogota|m|s|Juan Casiano
GPL|Guapiles Airport|Pococi|CR|10.217|-83.797|America/Costa_Rica|m|n|
GPN|Garden Point Airport|Pirlangimpi|AU|-11.4|130.426|Australia/Darwin|m|n|
GPO|General Pico Airport|General Pico|AR|-35.696|-63.758|America/Argentina/Salta|m|n|
GPS|Seymour Galapagos Ecological Airport|Isla Baltra|EC|-0.454|-90.266|Pacific/Galapagos|m|s|
GPT|Gulfport Biloxi International Airport|Gulfport|US|30.406|-89.07|America/Chicago|m|s|
GRB|Austin Straubel International Airport|Green Bay|US|44.483|-88.131|America/Chicago|m|s|
GRF|Gray Army Air Field|Joint Base Lewis McChord|US|47.079|-122.581|America/Los_Angeles|m|n|Fort Lewis/Tacoma
GRI|Central Nebraska Regional Airport|Grand Island|US|40.967|-98.31|America/Chicago|m|s|
GRJ|George Airport|George|ZA|-34.006|22.379|Africa/Johannesburg|l|s|P.W. Botha Airport
GRK|Killeen Regional Airport / Robert Gray Army Airfield|Fort Cavazos|US|31.067|-97.829|America/Chicago|m|s|Fort Hood, Killeen/Fort Hood Regional
GRO|Girona-Costa Brava Airport|Girona|ES|41.905|2.762|Europe/Madrid|l|s|
GRQ|Groningen Airport Eelde|Groningen|NL|53.119|6.578|Europe/Brussels|l|s|
GRR|Gerald R. Ford International Airport|Grand Rapids|US|42.881|-85.523|America/Detroit|l|s|
GRS|Grosseto Corrado Baccarini Air Base / Grosseto Airport|Grosseto|IT|42.76|11.072|Europe/Rome|m|n|C Baccarini
GRU|São Paulo/Guarulhos–Governor André Franco Montoro International Airport|São Paulo|BR|-23.431|-46.47|America/Sao_Paulo|l|s|Cumbica
GRV|Akhmat Kadyrov Grozny International Airport|Grozny|RU|43.388|45.7|Europe/Moscow|l|s|Grozny North, Grozny Severny, Аэропорт Грозный Северный, Аэропорт Грозный
GRW|Graciosa Airport|Santa Cruz da Graciosa|PT|39.092|-28.03|Atlantic/Azores|m|s|
GRX|F.G.L. Airport Granada-Jaén Airport|Granada|ES|37.189|-3.777|Europe/Madrid|m|s|
GRY|Grímsey Airport|Grímsey/Sandvík|IS|66.546|-18.017|Africa/Abidjan|m|s|Sandvík
GRZ|Graz Airport|Feldkirchen bei Graz|AT|46.991|15.44|Europe/Vienna|l|s|Thalerhof Airport, Fliegerhorst Nittner, Nittner Air Base, Christophorus 12
GSB|Seymour Johnson Air Force Base|Goldsboro|US|35.339|-77.961|America/New_York|m|n|
GSE|Säve Airport|Göteborg|SE|57.775|11.87|Europe/Berlin|m|n|Göteborg City Airport, Gothenburg City Airport
GSJ|San José Airport|Puerto San José|GT|13.936|-90.836|America/Guatemala|m|n|
GSM|Qeshm International Airport|Qeshm(Dayrestan)|IR|26.755|55.902|Asia/Tehran|l|s|Qeshm Island
GSO|Piedmont Triad International Airport|Greensboro|US|36.099|-79.937|America/New_York|l|s|
GSP|Greenville-Spartanburg International Airport|Greenville/Greer/Spartanburg|US|34.896|-82.219|America/New_York|m|s|Roger Milliken Field
GST|Gustavus Airport|Gustavus|US|58.425|-135.707|America/Juneau|m|s|
GSV|Gagarin International Airport|Saratov|RU|51.713|46.171|Europe/Saratov|l|s|УВСГ, Гагарин, Саратов
GTE|Groote Eylandt Airport|Groote Eylandt|AU|-13.972|136.459|Australia/Darwin|m|s|
GTF|Great Falls International Airport|Great Falls|US|47.482|-111.371|America/Denver|m|s|
GTN|Glentanner Airport|Glentanner Station|NZ|-43.907|170.128|Pacific/Auckland|m|n|Lake Pukaki
GTR|Golden Triangle Regional Airport|Columbus/W Point/Starkville|US|33.45|-88.591|America/Chicago|m|s|
GUA|La Aurora International Airport|Guatemala City|GT|14.583|-90.528|America/Guatemala|l|s|
GUC|Gunnison Crested Butte Regional Airport|Gunnison|US|38.535|-106.935|America/Denver|m|s|
GUH|Gunnedah Airport||AU|-30.958|150.249|Australia/Sydney|m|n|
GUI|Guiria Airport||VE|10.574|-62.313|America/Caracas|m|n|
GUJ|Edu Chaves Field|Guaratinguetá|BR|-22.792|-45.205|America/Sao_Paulo|m|n|
GUL|Goulburn Airport||AU|-34.81|149.726|Australia/Sydney|m|n|
GUM|Antonio B. Won Pat International Airport|Hagåtña|GU|13.485|144.797|Pacific/Guam|l|s|NGM, NAS Agana
GUP|Gallup Municipal Airport|Gallup|US|35.512|-108.788|America/Denver|m|s|
GUQ|Guanare Airport|Guanare|VE|9.027|-69.755|America/Caracas|m|n|
GUR|Gurney Airport|Gurney|PG|-10.311|150.334|Pacific/Port_Moresby|m|s|
GUS|Grissom Air Reserve Base|Peru|US|40.648|-86.152|America/Indiana/Indianapolis|m|n|
GUW|Atyrau International Airport|Atyrau|KZ|47.121|51.82|Asia/Atyrau|l|s|
GUY|Guymon Municipal Airport|Guymon|US|36.685|-101.508|America/Chicago|m|n|
GVA|Geneva International Airport|Geneva|CH|46.238|6.109|Europe/Zurich|l|s|Cointrin Airport
GVN|Sovetskaya Gavan (Maygatka) Airport|Sovetskaya Gavan|RU|48.925|140.035|Asia/Vladivostok|m|n|Sovietskaya Gavan Airport, May-Gatka Airport, Аэропорт Советская Гавань, Аэропорт Май-Гатка
GVR|Coronel Altino Machado Airport|Governador Valadares|BR|-18.896|-41.983|America/Sao_Paulo|m|s|Governador Valadares Airport
GVX|Gävle–Sandviken Airport|Sandviken|SE|60.594|16.951|Europe/Berlin|m|n|
GWD|New Gwadar International Airport|Gurandani|PK|25.297|62.499|Asia/Karachi|l|s|Feroz Khan Noon
GWE|Josiah Tungamirai Air Force Base|Gweru|ZW|-19.437|29.862|Africa/Johannesburg|m|n|Thornhill
GWL|Gwalior Airport|Gwalior|IN|26.293|78.228|Asia/Kolkata|m|s|Maharajpur Air Force Station
GWO|Greenwood–Leflore Airport|Greenwood|US|33.495|-90.088|America/Chicago|m|n|Greenwood Army Airfield
GWT|Westerland Sylt Airport|Sylt|DE|54.913|8.34|Europe/Berlin|m|s|
GXF|Seiyun Hadhramaut International Airport|Seiyun|YE|15.966|48.788|Asia/Riyadh|l|s|
GXG|Negage Airport|Negage|AO|-7.755|15.288|Africa/Lagos|m|s|
GXH|Gannan Xiahe Airport|Gannan (Xiahe)|CN|34.819|102.622|Asia/Shanghai|m|s|Hezuo
GXQ|Teniente Vidal Airport|Coyhaique|CL|-45.594|-72.106|America/Coyhaique|m|n|
GYA|Guayaramerín Airport|Guayaramerín|BO|-10.889|-65.381|America/Puerto_Rico|m|s|
GYD|Heydar Aliyev International Airport|Baku|AZ|40.473|50.051|Asia/Baku|l|s|BAK, Bina International Airport, Heydər Əliyev adına beynəlxalq hava limanı, Gaydar Aliyev
GYE|José Joaquín de Olmedo International Airport|Guayaquil|EC|-2.157|-79.884|America/Guayaquil|l|s|Simon Bolivar International Airport
GYG|Magan Airport|Magan|RU|62.103|129.545|Asia/Yakutsk|m|n|УЕММ, Маган
GYI|Gisenyi Airport|Gisenyi|RW|-1.677|29.259|Africa/Johannesburg|m|n|
GYM|General José María Yáñez International Airport|Guaymas|MX|27.969|-110.925|America/Hermosillo|m|s|
GYN|Santa Genoveva International Airport|Goiânia|BR|-16.632|-49.221|America/Sao_Paulo|l|s|
GYS|Guangyuan Panlong Airport|Guangyuan (Lizhou)|CN|32.39|105.695|Asia/Shanghai|m|s|
GYU|Guyuan Liupanshan Airport|Guyuan (Yuanzhou)|CN|36.079|106.217|Asia/Shanghai|m|s|
GYY|Gary/Chicago International Airport|Gary|US|41.617|-87.413|America/Chicago|m|s|East Chicago
GZP|Gazipaşa-Alanya Airport|Gazipaşa|TR|36.299|32.297|Europe/Istanbul|m|s|
GZT|Gaziantep Oğuzeli International Airport|Gaziantep|TR|36.947|37.479|Europe/Istanbul|l|s|
GZW|Qazvin Airport|Qazvin|IR|36.24|50.047|Asia/Tehran|m|n|Ghazvin
HAC|Hachijojima Airport|Hachijojima|JP|33.115|139.786|Asia/Tokyo|m|s|
HAD|Halmstad Airport|Halmstad|SE|56.691|12.82|Europe/Berlin|m|s|
HAH|Prince Said Ibrahim International Airport|Moroni|KM|-11.534|43.272|Asia/Riyadh|l|s|Hahaia
HAJ|Hannover Airport|Hannover|DE|52.461|9.685|Europe/Berlin|l|s|
HAK|Haikou Meilan International Airport|Haikou (Meilan)|CN|19.935|110.459|Asia/Shanghai|l|s|ZGHK
HAM|Hamburg Helmut Schmidt Airport|Hamburg|DE|53.63|9.988|Europe/Berlin|l|s|Hamburg-Fuhlsbüttel Airport
HAN|Noi Bai International Airport|Hanoi (Soc Son)|VN|21.221|105.807|Asia/Jakarta|l|s|Noibai Airport, Sân bay Quốc tế Nội Bài
HAQ|Hanimaadhoo International Airport|Haa Dhaalu Atoll|MV|6.743|73.167|Indian/Maldives|l|s|
HAS|Hail International Airport|Hail|SA|27.438|41.686|Asia/Riyadh|l|s|Hail Airport
HAU|Haugesund Airport, Karmøy|Karmøy|NO|59.345|5.208|Europe/Berlin|m|s|Karmoy
HAV|José Martí International Airport|Havana|CU|22.989|-82.409|America/Havana|l|s|Habana
HAW|Haverfordwest Airport|Haverfordwest|GB|51.833|-4.961|Europe/London|m|n|
HBA|Hobart International Airport|Hobart (Cambridge)|AU|-42.837|147.513|Australia/Hobart|l|s|
HBE|Alexandria International Airport|Alexandria|EG|30.932|29.696|Africa/Cairo|l|s|
HBG|Hattiesburg Bobby L Chain Municipal Airport|Hattiesburg|US|31.265|-89.253|America/Chicago|m|n|
HBR|Hobart Regional Airport|Hobart|US|34.991|-99.051|America/Chicago|m|n|
HBX|Hubballi Airport|Hubballi|IN|15.361|75.082|Asia/Kolkata|m|s|Hubli, VAHB
HCJ|Hechi Jinchengjiang Airport|Hechi (Jinchengjiang)|CN|24.804|107.711|Asia/Shanghai|m|s|
HCN|Hengchun Airport|Hengchun|TW|22.041|120.73|Asia/Taipei|m|n|
HCQ|Halls Creek Airport||AU|-18.234|127.67|Australia/Perth|m|n|
HCR|Holy Cross Airport|Holy Cross|US|62.188|-159.775|America/Anchorage|m|s|4Z4
HCZ|Chenzhou Beihu Airport|Chenzhou|CN|25.753|112.845|Asia/Shanghai|m|s|
HDF|Heringsdorf Airport|Zirchow|DE|53.879|14.152|Europe/Berlin|m|s|
HDG|Handan Airport|Handan|CN|36.525|114.424|Asia/Shanghai|m|s|Handan Matou Airport
HDM|Hamadan Airport|Hamadan|IR|34.866|48.561|Asia/Tehran|m|s|
HDN|Yampa Valley Airport|Hayden|US|40.481|-107.218|America/Denver|m|s|
HDS|Eastgate Airport / Air Force Base Hoedspruit|Hoedspruit|ZA|-24.362|31.053|Africa/Johannesburg|m|s|Hoedspruit Airport, Hoedspruit Air Force Base
HDY|Hat Yai International Airport|Hat Yai|TH|6.933|100.393|Asia/Jakarta|l|s|
HEA|Herat - Khwaja Abdullah Ansari International Airport|Guzara|AF|34.21|62.228|Asia/Kabul|l|s|
HEH|Heho Airport|Heho|MM|20.747|96.792|Asia/Yangon|m|s|
HEK|Heihe Aihui Airport|Heihe|CN|50.172|127.309|Asia/Shanghai|m|s|
HEL|Helsinki Vantaa Airport|Helsinki (Vantaa)|FI|60.318|24.963|Europe/Helsinki|l|s|
HER|Heraklion International Nikos Kazantzakis Airport|Heraklion|GR|35.34|25.18|Europe/Athens|l|s|Crete Island
HET|Hohhot Baita International Airport|Hohhot|CN|40.85|111.825|Asia/Shanghai|l|s|
HFA|Uri Michaeli Haifa International Airport|Haifa|IL|32.81|35.044|Asia/Jerusalem|m|s|RAF Haifa
HFD|Hartford Brainard Airport|Hartford|US|41.737|-72.649|America/New_York|m|n|
HFE|Hefei Xinqiao International Airport|Hefei|CN|31.988|116.977|Asia/Shanghai|l|s|合肥，合肥新桥机场
HFN|Hornafjörður Airport|Höfn|IS|64.296|-15.227|Africa/Abidjan|m|s|
HFT|Hammerfest Airport|Hammerfest|NO|70.68|23.669|Europe/Berlin|m|s|
HGA|Egal International Airport|Hargeisa|SO|9.514|44.083|Asia/Riyadh|l|s|Madaarka Caalamiga a ee Cigaal, مطار هرجيسا إيغال الدولية‎)
HGH|Hangzhou Xiaoshan International Airport|Hangzhou|CN|30.236|120.429|Asia/Shanghai|l|s|Hang Zhou, 杭州萧山国际机场
HGI|Itanagar Donyi Polo Hollongi Airport|Hollongi|IN|26.967|93.639|Asia/Kolkata|m|s|
HGN|Mae Hong Son Airport|Mae Hong Son|TH|19.301|97.976|Asia/Jakarta|m|s|
HGO|Korhogo Airport|Korhogo|CI|9.387|-5.557|Africa/Abidjan|m|s|
HGR|Hagerstown Regional Richard A Henson Field|Hagerstown|US|39.709|-77.728|America/New_York|m|s|
HGU|Mount Hagen Kagamuga Airport|Mount Hagen|PG|-5.828|144.299|Pacific/Port_Moresby|m|s|
HHE|JMSDF Hachinohe Air Base / Hachinohe Airport|Hachinohe|JP|40.551|141.465|Asia/Tokyo|m|n|
HHH|Hilton Head Airport|Hilton Head Island|US|32.224|-80.698|America/New_York|m|s|49J
HHN|Frankfurt-Hahn Airport|Frankfurt am Main (Lautzenhausen)|DE|49.946|7.262|Europe/Berlin|l|s|
HHQ|Hua Hin Airport|Hua Hin|TH|12.636|99.951|Asia/Jakarta|m|s|
HHR|Jack Northrop Field Hawthorne Municipal Airport|Hawthorne|US|33.923|-118.335|America/Los_Angeles|m|s|
HIA|Huai'an Lianshui Airport|Huai'an|CN|33.793|119.127|Asia/Shanghai|l|s|Huaian, 淮安, 淮安涟水机场
HIB|Range Regional Airport|Hibbing|US|47.385|-92.837|America/Chicago|m|s|Chisholm Hibbing Airport
HID|Horn Island Airport|Horn|AU|-10.586|142.293|Australia/Brisbane|m|s|
HIF|Hill Air Force Base|Ogden|US|41.124|-111.973|America/Denver|m|n|Hill Field
HII|Lake Havasu City Airport|Lake Havasu City|US|34.571|-114.358|America/Phoenix|m|s|
HIJ|Hiroshima Airport|Hiroshima|JP|34.436|132.919|Asia/Tokyo|l|s|広島空港
HIM|Hingurakgoda Air Force Base|Polonnaruwa Town|LK|8.05|80.981|Asia/Colombo|m|n|MNH, Minneriya Airport
HIN|Sacheon Airport / Sacheon Air Base|Sacheon|KR|35.089|128.072|Asia/Seoul|m|s|
HIO|Portland Hillsboro Airport|Portland|US|45.54|-122.95|America/Los_Angeles|m|n|
HIR|Honiara International Airport|Honiara|SB|-9.428|160.055|Pacific/Guadalcanal|l|s|Henderson Field
HJJ|Huaihua Zhijiang Airport|Huaihua|CN|27.443|109.705|Asia/Shanghai|m|s|Chihkiang Airfield
HJR|Khajuraho Airport|Khajuraho|IN|24.817|79.919|Asia/Kolkata|m|s|VAKJ
HKD|Hakodate Airport|Hakodate|JP|41.77|140.822|Asia/Tokyo|l|s|
HKG|Hong Kong International Airport|Hong Kong|HK|22.312|113.915|Asia/Hong_Kong|l|s|Chek Lap Kok Airport, 赤鱲角機場
HKK|Hokitika Airfield||NZ|-42.714|170.985|Pacific/Auckland|m|s|
HKN|Hoskins Airport|Kimbe|PG|-5.464|150.407|Pacific/Port_Moresby|m|s|
HKT|Phuket International Airport|Phuket|TH|8.113|98.317|Asia/Jakarta|l|s|
HKY|Hickory Regional Airport|Hickory|US|35.741|-81.39|America/New_York|m|n|
HLA|Lanseria International Airport|Johannesburg|ZA|-25.939|27.927|Africa/Johannesburg|l|s|
HLD|Hulunbuir Hailar Airport|Hailar|CN|49.209|119.822|Asia/Shanghai|l|s|Hailar Dongshan
HLE|Saint Helena International Airport|Jamestown|SH|-15.959|-5.646|Africa/Abidjan|m|s|
HLG|Wheeling Ohio County Airport|Wheeling|US|40.175|-80.646|America/New_York|m|n|
HLN|Helena Regional Airport|Helena|US|46.607|-111.983|America/Denver|m|s|
HLP|Halim Perdanakusuma International Airport|Jakarta|ID|-6.267|106.89|Asia/Jakarta|l|s|WIIH, WIIX, WIID
HLT|Hamilton Airport||AU|-37.649|142.065|Australia/Melbourne|m|n|
HLZ|Hamilton International Airport|Hamilton|NZ|-37.867|175.332|Pacific/Auckland|m|s|
HMA|Khanty Mansiysk Airport|Khanty-Mansiysk|RU|61.029|69.086|Asia/Yekaterinburg|m|s|
HMB|Suhaj International Airport|Suhaj|EG|26.343|31.743|Africa/Cairo|l|s|HEMK, Suhaj Mubarak International Airport, Sohag Intl
HME|Hassi Messaoud-Oued Irara Krim Belkacem Airport|Hassi Messaoud|DZ|31.673|6.14|Africa/Algiers|m|s|
HMI|Hami Airport|Hami|CN|42.841|93.669|Asia/Shanghai|m|s|Kumul, Qumul
HMJ|Khmelnytskyi Airport|Khmelnytskyi|UA|49.36|26.933|Europe/Kyiv|m|n|Khmelnitskiy, Khmelnytskyi Ruzhichnaya
HMN|Holloman Air Force Base|Alamogordo|US|32.853|-106.107|America/Denver|m|n|Alamogordo AAF
HMO|General Ignacio L. Pesqueira International Airport|Hermosillo|MX|29.093|-111.053|America/Hermosillo|l|s|
HNA|Iwate Hanamaki Airport|Hanamaki|JP|39.429|141.135|Asia/Tokyo|m|s|Morioka
HND|Tokyo Haneda International Airport|Tokyo|JP|35.55|139.787|Asia/Tokyo|l|s|TYO, 羽田空港, 東京国際空港, 東京, 東京都
HNG|Hainanzhou Gonghe Airport|Hainan (Gonghe)|CN|36.337|100.48|Asia/Shanghai|m|n|Qabqa
HNL|Daniel K. Inouye International Airport|Honolulu, Oahu|US|21.318|-157.926|Pacific/Honolulu|l|s|Hickam Air Force Base, HIK, PHIK, KHNL, Honolulu International
HNM|Hana Airport|Hana|US|20.796|-156.014|Pacific/Honolulu|m|s|
HNS|Haines Airport|Haines|US|59.244|-135.524|America/Juneau|m|s|
HOB|Lea County Regional Airport|Hobbs|US|32.688|-103.217|America/Denver|m|s|
HOF|Al-Ahsa International Airport|Hofuf|SA|25.285|49.485|Asia/Riyadh|l|s|
HOG|Frank Pais International Airport|Holguin|CU|20.785|-76.316|America/Havana|l|s|
HOI|Hao Airport|Otepa|PF|-18.075|-140.946|Pacific/Honolulu|m|s|
HOM|Homer Airport|Homer|US|59.644|-151.479|America/Anchorage|m|s|
HON|Huron Regional Airport|Huron|US|44.385|-98.228|America/Chicago|m|n|
HOP|Campbell Army Airfield (Fort Campbell)|Fort Campbell|US|36.674|-87.49|America/Chicago|m|n|Campbell AFB, Hopkinsville
HOQ|Hof-Plauen Airport|Hof|DE|50.289|11.853|Europe/Berlin|m|n|
HOR|Horta Airport|Horta|PT|38.52|-28.716|Atlantic/Azores|m|s|
HOT|Memorial Field Airport|Hot Springs|US|34.479|-93.096|America/Chicago|m|s|
HOU|William P. Hobby Airport|Houston|US|29.645|-95.277|America/Chicago|l|s|QHO
HOV|Ørsta-Volda Airport, Hovden|Ørsta|NO|62.18|6.074|Europe/Berlin|m|s|
HPA|Lifuka Island Airport|Lifuka|TO|-19.777|-174.341|Pacific/Tongatapu|m|s|Salote Pilolevu Airport, Haapai
HPG|Shennongjia Hongping Airport|Shennongjia (Hongping)|CN|31.626|110.34|Asia/Shanghai|m|s|
HPH|Cat Bi International Airport|Haiphong (Hai An)|VN|20.817|106.724|Asia/Jakarta|l|s|Catbi Airport
HPN|Westchester County Airport|White Plains|US|41.067|-73.708|America/New_York|m|s|Manhattan, New York City, NYC
HQL|Tashikuergan Hongqilafu Airport|Tashikuergan|CN|37.661|75.289|Asia/Shanghai|m|s|
HQM|Bowerman Airport|Hoquiam|US|46.971|-123.937|America/Los_Angeles|m|n|
HRB|Harbin Taiping International Airport|Harbin|CN|45.623|126.25|Asia/Shanghai|l|s|
HRE|Robert Gabriel Mugabe International Airport|Harare|ZW|-17.932|31.093|Africa/Johannesburg|l|s|FVHA, Harare
HRG|Hurghada International Airport|Hurghada|EG|27.177|33.797|Africa/Cairo|l|s|Al Ghardaqah, الغردقة
HRI|Mattala Rajapaksa International Airport|Mattala|LK|6.284|81.124|Asia/Colombo|m|s|Hambantota International Airport
HRK|Kharkiv International Airport|Kharkiv|UA|49.927|36.291|Europe/Kyiv|m|n|Osnova International Airport, Міжнародний аеропорт Харків
HRL|Valley International Airport|Harlingen|US|26.229|-97.654|America/Chicago|m|s|
HRM|Hassi R'Mel Airport|Hassi R'Mel|DZ|32.93|3.312|Africa/Algiers|m|n|
HRO|Boone County Airport|Harrison|US|36.262|-93.155|America/Chicago|m|s|
HRS|Harrismith Airport|Harrismith|ZA|-28.235|29.106|Africa/Johannesburg|m|n|
HSA|Hazrat Sultan International Airport|Turkıstan|KZ|43.311|68.55|Asia/Almaty|l|s|
HSC|Shaoguan Danxia Airport|Shaoguan|CN|24.979|113.421|Asia/Shanghai|m|s|Shaoguan Air Base, Shaoguan Guitou Airport
HSG|Kyushu Saga International Airport|Saga|JP|33.15|130.302|Asia/Tokyo|l|s|
HSL|Huslia Airport|Huslia|US|65.698|-156.351|America/Anchorage|m|s|
HSM|Horsham Airport||AU|-36.67|142.173|Australia/Melbourne|m|n|
HSN|Zhoushan Putuoshan International Airport|Zhoushan|CN|29.934|122.362|Asia/Shanghai|l|s|
HSR|Rajkot International Airport|Rajkot|IN|22.379|71.039|Asia/Kolkata|l|s|Hirasar Airport
HSS|Maharaja Agrasen International Airport|Hisar|IN|29.186|75.741|Asia/Kolkata|l|s|Hisar
HST|Homestead Air Reserve Base|Homestead|US|25.489|-80.384|America/New_York|m|n|Dade County Airport
HSV|Huntsville International Airport|Huntsville|US|34.636|-86.774|America/Chicago|m|s|Carl T. Jones Field
HSZ|Hsinchu Air Base|Hsinchu City|TW|24.818|120.939|Asia/Taipei|m|n|
HTA|Chita-Kadala International Airport|Chita|RU|52.025|113.306|Asia/Chita|l|s|
HTG|Khatanga Airport|Khatanga|RU|71.978|102.491|Asia/Krasnoyarsk|m|s|
HTI|Hamilton Island Airport|Hamilton Island|AU|-20.358|148.952|Australia/Lindeman|m|s|
HTN|Hotan Airport|Hotan|CN|37.039|79.865|Asia/Urumqi|m|s|Khotan, Heitan Air Base
HTS|Tri-State Airport / Milton J. Ferguson Field|Huntington|US|38.367|-82.558|America/New_York|m|s|
HTT|Huatugou Airport|Mengnai|CN|38.202|90.838|Asia/Shanghai|m|s|
HTU|Hopetoun Airport||AU|-35.715|142.36|Australia/Melbourne|m|n|
HTV|Huntsville Regional Airport|Huntsville|US|30.747|-95.587|America/Chicago|m|n|T39, Bruce Brothers Huntsville Regional Airport, Huntsville Municipal Airport
HTY|Hatay Airport|Antakya|TR|36.361|36.286|Europe/Istanbul|m|s|antakya, samandag
HUA|Redstone Army Air Field|Redstone Arsnl Huntsville|US|34.679|-86.685|America/Chicago|m|n|
HUF|Terre Haute Regional Airport, Hulman Field|Terre Haute|US|39.452|-87.308|America/Indiana/Indianapolis|m|n|
HUH|Huahine-Fare Airport|Fare|PF|-16.687|-151.022|Pacific/Honolulu|m|s|
HUI|Phu Bai International Airport|Huế|VN|16.401|107.704|Asia/Ho_Chi_Minh|l|s|Phubai
HUL|Houlton International Airport|Houlton|US|46.123|-67.792|America/New_York|m|n|Houlton AAF
HUN|Hualien Chiashan Airport|Hualien City|TW|24.023|121.618|Asia/Taipei|l|s|花蓮機場
HUO|Holingol Huolinhe Airport|Holingol|CN|45.487|119.407|Asia/Shanghai|m|s|
HUT|Hutchinson Municipal Airport|Hutchinson|US|38.065|-97.861|America/Chicago|m|n|
HUU|Alferez Fap David Figueroa Fernandini Airport|Huánuco|PE|-9.879|-76.205|America/Lima|m|s|
HUX|Bahías de Huatulco International Airport|Huatulco|MX|15.775|-96.26|America/Mexico_City|l|s|
HUY|Humberside Airport|Grimsby, Lincolnshire|GB|53.576|-0.35|Europe/London|m|s|RAF Kirmington
HUZ|Huizhou Pingtan Airport|Huizhou (Pingtan)|CN|23.05|114.6|Asia/Shanghai|m|s|Huiyang Air Base
HVA|Analalava Airport|Analalava|MG|-14.63|47.764|Asia/Riyadh|m|n|
HVB|Hervey Bay Airport|Hervey Bay|AU|-25.32|152.881|Australia/Brisbane|m|s|
HVD|Khovd Airport|Khovd|MN|47.954|91.628|Asia/Hovd|m|s|Kobdo
HVG|Honningsvåg Airport, Valan|Honningsvåg|NO|71.01|25.984|Europe/Berlin|m|s|North Cape Airport
HVN|Tweed New Haven Airport|New Haven|US|41.263|-72.888|America/New_York|m|s|
HVR|Havre City County Airport|Havre|US|48.541|-109.763|America/Denver|m|s|
HWN|Hwange National Park Airport|Gwayi River Farms|ZW|-18.63|27.021|Africa/Johannesburg|m|n|
HWO|North Perry Airport|Hollywood|US|26.001|-80.241|America/New_York|m|n|
HWR|Halwara International Airport|Halwara|IN|30.749|75.63|Asia/Kolkata|l|s|Ludhiana International Airport, Halwara Air Force Station
HXD|Haixi Delingha Airport|Delingha|CN|37.125|97.269|Asia/Shanghai|m|s|
HXX|Hay Airport||AU|-34.531|144.83|Australia/Sydney|m|n|
HYA|Cape Cod Gateway Airport|Hyannis|US|41.669|-70.28|America/New_York|m|s|Barnstable, Boardman Polando
HYD|Rajiv Gandhi International Airport|Hyderabad|IN|17.231|78.43|Asia/Kolkata|l|s|Shamshabad, Hyderabad
HYN|Taizhou Luqiao Airport|Taizhou (Luqiao)|CN|28.562|121.429|Asia/Shanghai|m|s|
HYR|Sawyer County Airport|Hayward|US|46.025|-91.444|America/Chicago|m|n|
HYS|Hays Regional Airport|Hays|US|38.845|-99.273|America/Chicago|m|s|
HZA|Heze Mudan Airport|Heze (Dingtao)|CN|35.213|115.737|Asia/Shanghai|m|s|
HZB|Merville-Calonne Airport|Merville, Nord|FR|50.618|2.642|Europe/Paris|m|n|
HZG|Hanzhong Chenggu Airport|Hanzhong (Chenggu)|CN|33.134|107.204|Asia/Shanghai|m|s|
HZH|Liping Airport|Liping|CN|26.322|109.15|Asia/Shanghai|m|s|
HZK|Húsavík Airport|Húsavík|IS|65.952|-17.426|Africa/Abidjan|m|n|
HZU|Chengdu Huaizhou Airport|Chengdu (Jintang)|CN|30.677|104.529|Asia/Shanghai|m|n|
IAA|Igarka Airport|Igarka|RU|67.437|86.622|Asia/Krasnoyarsk|m|s|
IAB|McConnell Air Force Base|Wichita|US|37.622|-97.268|America/Chicago|m|n|22nd Air Refueling Wing, 931st Air Refueling Group, 184th Intelligence Wing
IAD|Washington Dulles International Airport|Dulles|US|38.944|-77.456|America/New_York|l|s|
IAG|Niagara Falls International Airport|Niagara Falls|US|43.107|-78.946|America/New_York|m|s|
IAH|George Bush Intercontinental Airport|Houston|US|29.984|-95.341|America/Chicago|l|s|QHO
IAM|Zarzaitine - In Aménas Airport|In Aménas|DZ|28.052|9.643|Africa/Algiers|m|s|
IAN|Bob Baker Memorial Airport|Kiana|US|66.976|-160.439|America/Anchorage|m|s|
IAR|Golden Ring Yaroslavl International Airport|Tunoshna|RU|57.561|40.157|Europe/Moscow|l|s|
IAS|Iaşi International Airport|Iaşi|RO|47.18|27.621|Europe/Bucharest|l|s|Jassy
IBA|Ibadan Airport|Ibadan|NG|7.362|3.978|Africa/Lagos|m|s|
IBE|Perales Airport|Ibagué|CO|4.422|-75.133|America/Bogota|m|s|
IBL|Indigo Bay Lodge Airport|Bazaruto Island|MZ|-21.708|35.453|Africa/Johannesburg|m|n|
IBP|Iberia Airport|Iberia|PE|-11.412|-69.489|America/Lima|m|n|
IBR|Ibaraki Airport|Omitama|JP|36.181|140.414|Asia/Tokyo|l|s|Hyakuri, 茨城空港
IBZ|Ibiza Airport|Ibiza (Eivissa)|ES|38.873|1.373|Europe/Madrid|l|s|
ICN|Incheon International Airport|Seoul|KR|37.469|126.451|Asia/Seoul|l|s|
ICT|Wichita Dwight D. Eisenhower National Airport|Wichita|US|37.65|-97.429|America/Chicago|m|s|Mid-Continent Airport
IDA|Idaho Falls Regional Airport|Idaho Falls|US|43.515|-112.071|America/Boise|m|s|Fanning Field
IDR|Devi Ahilya Bai Holkar International Airport|Indore|IN|22.721|75.801|Asia/Kolkata|l|s|
IEG|Zielona Góra-Babimost Airport|Nowe Kramsko|PL|52.139|15.799|Europe/Warsaw|m|s|
IEJ|Iejima Airport|Ie|JP|26.723|127.787|Asia/Tokyo|m|n|
IEV|Igor Sikorsky Kyiv International Airport (Zhuliany)|Kyiv|UA|50.402|30.452|Europe/Kyiv|m|n|Міжнародний аеропорт Київ, Kiev, UKKK, IEV
IFJ|Ísafjörður Airport|Ísafjörður|IS|66.058|-23.135|Africa/Abidjan|m|s|
IFN|Isfahan Shahid Beheshti International Airport|Isfahan|IR|32.755|51.884|Asia/Tehran|l|s|Esfahan
IFO|Ivano-Frankivsk International Airport|Ivano-Frankivsk|UA|48.884|24.686|Europe/Kyiv|m|n|Міжнародний аеропорт Івано-Франківськ
IFP|Laughlin Bullhead International Airport|Bullhead City|US|35.155|-114.559|America/Phoenix|m|n|
IGA|Inagua Airport|Matthew Town|BS|20.975|-73.667|America/Toronto|m|s|Inagua International
IGD|Iğdır Airport|Iğdır|TR|39.977|43.877|Europe/Istanbul|m|s|
IGL|Çiğli Airbase|Çiğli|TR|38.513|27.01|Europe/Istanbul|m|n|
IGM|Kingman Airport|Kingman|US|35.259|-113.938|America/Phoenix|m|n|
IGR|Cataratas Del Iguazú International Airport|Puerto Iguazu|AR|-25.737|-54.473|America/Argentina/Cordoba|m|s|Iguaçu, Mayor Carlos Eduardo Krause Airport
IGS|Ingolstadt Manching Airport|Manching|DE|48.716|11.534|Europe/Berlin|m|n|
IGT|Magas Airport|Sunzha|RU|43.323|45.013|Europe/Moscow|m|s|Sleptsovskaya Airport, Ingushetiya Airport, Ingushetia Airport, Аэропорт Магас, Аэропорт Слепцовская, Аэропорт Ингушетия, Nazran
IGU|Cataratas International Airport|Foz do Iguaçu|BR|-25.594|-54.489|America/Sao_Paulo|l|s|
IHR|Iranshahr Airport|Iranshahr|IR|27.236|60.72|Asia/Tehran|m|n|
IIL|Ilam Airport|Ilam|IR|33.587|46.405|Asia/Tehran|m|n|
IJK|Izhevsk Airport|Izhevsk|RU|56.835|53.462|Europe/Samara|m|s|Аэропорт Ижевск
IKA|Imam Khomeini International Airport|Tehran|IR|35.416|51.152|Asia/Tehran|l|s|Ahmadabad
IKG|Karakol International Airport|Karakol|KG|42.508|78.408|Asia/Bishkek|m|s|UAFP, Przhevalsk Airport
IKI|Iki Airport|Iki|JP|33.749|129.785|Asia/Tokyo|m|s|
IKK|Greater Kankakee Airport|Kankakee|US|41.071|-87.846|America/Chicago|m|n|
IKS|Tiksi Airport|Tiksi|RU|71.698|128.903|Asia/Yakutsk|m|s|УЕСТ, Аеропорт Тикси
IKT|Irkutsk International Airport|Irkutsk|RU|52.267|104.396|Asia/Irkutsk|l|s|
IKU|Issyk-Kul International Airport|Tamchy|KG|42.586|76.701|Asia/Bishkek|l|s|UAFL, Issyk-Kul Airport, Chok-Tal Airport, Аэропорт Тамчы, Аэропорт Иссык-Куль, Аэропорт Чок-Тал
ILD|Lleida-Alguaire Airport|Lleida|ES|41.728|0.535|Europe/Madrid|m|s|
ILG|Wilmington Airport|Wilmington|US|39.679|-75.606|America/New_York|m|s|New Castle
ILI|Iliamna Airport|Iliamna|US|59.754|-154.911|America/Anchorage|m|s|
ILM|Wilmington International Airport|Wilmington|US|34.272|-77.905|America/New_York|m|s|
ILN|Wilmington Airpark|Wilmington|US|39.428|-83.792|America/New_York|m|n|Clinton Field, Clinton County AFB, Airborne Airpark
ILO|Iloilo International Airport|Cabatuan|PH|10.833|122.493|Asia/Manila|l|s|Iloilo City
ILP|Île des Pins Airport|Île des Pins|NC|-22.589|167.456|Pacific/Noumea|m|s|
ILQ|General Jorge Fernandez Maldon Airport|Ilo|PE|-17.695|-71.344|America/Lima|m|s|
ILR|General Tunde Idiagbon International Airport|Ilorin/Ogbomosho|NG|8.44|4.494|Africa/Lagos|l|s|Ilorin International Airport
ILS|Ilopango International Airport|San Salvador|SV|13.7|-89.12|America/El_Salvador|m|s|
ILY|Islay Airport|Isle of Islay, Argyll and Bute|GB|55.683|-6.258|Europe/London|m|s|Glenegedale, Port Ellen
ILZ|Žilina-Dolný Hričov Airport|Dolný Hričov|SK|49.233|18.613|Europe/Prague|m|n|
IMF|Bir Tikendrajit International Airport|Imphal|IN|24.76|93.897|Asia/Kolkata|l|s|Imphal
IMP|Prefeito Renato Moreira Airport|Imperatriz|BR|-5.531|-47.46|America/Fortaleza|m|s|
IMQ|Maku National Airport|Showt|IR|39.191|44.929|Asia/Tehran|m|n|Makou
IMT|Ford Airport|Kingsford|US|45.819|-88.115|America/Menominee|m|s|Iron Mountain
INA|Inta Airport|Inta|RU|66.053|60.106|Europe/Moscow|m|n|Аэропорт Инта
INC|Yinchuan Hedong International Airport|Yinchuan|CN|38.323|106.393|Asia/Shanghai|l|s|银川, 银川河东国际机场，宁夏
IND|Indianapolis International Airport|Indianapolis|US|39.717|-86.294|America/Indiana/Indianapolis|l|s|
INH|Inhambane Airport|Inhambane|MZ|-23.876|35.409|Africa/Johannesburg|m|s|
INI|Niš Constantine the Great Airport|Niš|RS|43.337|21.856|Europe/Belgrade|l|s|Aerodrom Konstantin Veliki Niš
INK|Winkler County Airport|Wink|US|31.78|-103.201|America/Chicago|m|n|
INL|Falls International Airport|International Falls|US|48.566|-93.403|America/Chicago|m|s|
INN|Innsbruck Airport|Innsbruck|AT|47.26|11.344|Europe/Vienna|l|s|Kranebitten Airport
INT|Smith Reynolds Airport|Winston Salem|US|36.134|-80.222|America/New_York|m|n|
INU|Nauru International Airport|Yaren|NR|-0.548|166.92|Pacific/Nauru|m|s|Yaren District, Naero
INV|Inverness Airport|Inverness|GB|57.542|-4.048|Europe/London|m|s|
INW|Winslow Lindbergh Regional Airport|Winslow|US|35.022|-110.723|America/Phoenix|m|n|
INZ|In Salah Airport|In Salah|DZ|27.251|2.512|Africa/Algiers|m|s|
IOA|Ioannina King Pyrrhus National Airport|Ioannina|GR|39.696|20.823|Europe/Athens|m|s|
IOM|Isle of Man Airport|Castletown|IM|54.083|-4.624|Europe/London|l|s|Ronaldsway, Douglas
IOS|Bahia - Jorge Amado Airport|Ilhéus|BR|-14.816|-39.033|America/Bahia|m|s|
IPC|Mataveri International Airport|Isla De Pascua|CL|-27.165|-109.421|Pacific/Easter|l|s|Rapa Nui, Easter Island, Isla de Pascua Airport
IPH|Sultan Azlan Shah Airport|Ipoh|MY|4.567|101.092|Asia/Singapore|l|s|
IPI|San Luis Airport|Ipiales|CO|0.862|-77.672|America/Bogota|m|s|
IPL|Imperial County Airport|Imperial|US|32.835|-115.574|America/Los_Angeles|m|s|
IPN|Usiminas Airport|Ipatinga|BR|-19.471|-42.488|America/Sao_Paulo|m|s|
IPT|Williamsport Regional Airport|Williamsport|US|41.242|-76.922|America/New_York|m|s|
IQA|Al Asad Air Base|Hīt|IQ|33.786|42.441|Asia/Baghdad|m|n|Qadisiyah Airbase
IQM|Qiemo Yudu Airport|Qiemo|CN|38.235|85.465|Asia/Urumqi|m|s|Cherchen, Qarqan
IQN|Qingyang Xifeng Airport|Qingyang (Xifeng)|CN|35.803|107.599|Asia/Shanghai|m|s|Dingxi Air Base
IQQ|Diego Aracena International Airport|Iquique|CL|-20.536|-70.181|America/Santiago|l|s|
IQT|Coronel FAP Francisco Secada Vignetta International Airport|Iquitos|PE|-3.785|-73.309|America/Lima|l|s|
IRD|Ishurdi Airport|Ishurdi|BD|24.152|89.049|Asia/Dhaka|m|n|Ishwardi
IRG|Lockhart River Airport|Lockhart River|AU|-12.787|143.305|Australia/Brisbane|m|s|
IRI|Iringa Airport|Nduli|TZ|-7.669|35.752|Asia/Riyadh|m|n|
IRJ|Capitan V A Almonacid Airport|La Rioja|AR|-29.382|-66.796|America/Argentina/La_Rioja|m|s|
IRK|Kirksville Regional Airport|Kirksville|US|40.093|-92.545|America/Chicago|m|s|
IRP|Matari Airport|Isiro|CD|2.828|27.588|Africa/Johannesburg|m|s|
ISA|Mount Isa Airport|Mount Isa|AU|-20.666|139.488|Australia/Brisbane|m|s|
ISB|Islamabad International Airport|Attock|PK|33.549|72.826|Asia/Karachi|l|s|
ISE|Süleyman Demirel International Airport|Isparta|TR|37.855|30.368|Europe/Istanbul|m|s|
ISG|New Ishigaki Airport|Ishigaki|JP|24.396|124.245|Asia/Tokyo|m|s|
ISK|Nashik International Airport|Nashik|IN|20.119|73.913|Asia/Kolkata|l|s|VA35
ISL|İstanbul Atatürk Airport|Istanbul(Bakırköy)|TR|40.972|28.824|Europe/Istanbul|l|n|Yeşilköy, Yesilkoy
ISM|Kissimmee Gateway Airport|Orlando|US|28.29|-81.437|America/New_York|m|n|
ISO|Kinston Regional Jetport At Stallings Field|Kinston|US|35.331|-77.609|America/New_York|m|n|
ISP|Long Island MacArthur Airport|Islip|US|40.796|-73.102|America/New_York|m|s|Islip Airport
IST|İstanbul Airport|Istanbul|TR|41.275|28.732|Europe/Istanbul|l|s|Arnavutköy
ISU|Jalal Talabani International Airport|Sulaymaniyah|IQ|35.56|45.315|Asia/Baghdad|m|s|ORSU, Kurd, Kurdish, Kurdistan
ITA|Itacoatiara Airport|Itacoatiara|BR|-3.127|-58.482|America/Manaus|m|n|
ITB|Itaituba Airport|Itaituba|BR|-4.242|-56.001|America/Santarem|m|s|
ITH|Ithaca Tompkins Regional Airport|Ithaca|US|42.491|-76.458|America/New_York|m|s|
ITM|Osaka Itami International Airport|Osaka|JP|34.781|135.441|Asia/Tokyo|l|s|
ITO|Hilo International Airport|Hilo|US|19.721|-155.045|Pacific/Honolulu|m|s|
IUE|Niue International Airport|Alofi|NU|-19.08|-169.923|Pacific/Pago_Pago|m|s|Hanan International Airport
IVC|Invercargill Airport|Invercargill|NZ|-46.412|168.313|Pacific/Auckland|m|s|
IVL|Ivalo Airport|Ivalo|FI|68.607|27.405|Europe/Helsinki|l|s|
IVR|Inverell Airport|Inverell|AU|-29.888|151.144|Australia/Sydney|m|n|
IWA|Ivanovo South Airport|Ivanovo|RU|56.939|40.941|Europe/Moscow|m|s|Ivanovo Yuzhniy Airport, Ivanovo Yuzhny Airport, Аэропорт Иваново Южный
IWJ|Iwami Airport|Masuda|JP|34.676|131.79|Asia/Tokyo|m|s|
IWK|Iwakuni Kintaikyo Airport|Iwakuni|JP|34.146|132.247|Asia/Tokyo|m|s|MCAS Iwakuni, Iwakuni Air Base
IWO|Ioto (Iwo Jima) Airbase|Ogasawara|JP|24.784|141.323|Asia/Tokyo|m|n|Iwo Jima Airport, Central Field
IXA|Agartala - Maharaja Bir Bikram Airport|Agartala|IN|23.887|91.24|Asia/Kolkata|m|s|Singerbhil Airport, Agartala Air Force Station
IXB|Bagdogra Airport|Siliguri|IN|26.681|88.329|Asia/Kolkata|l|s|Bagdogra Air Force Station
IXC|Shaheed Bhagat Singh International Airport|Chandigarh|IN|30.674|76.788|Asia/Kolkata|l|s|Chandigarh Air Force Station
IXD|Prayagraj Airport|Allahabad|IN|25.44|81.734|Asia/Kolkata|m|s|VIAL, Allahabad Bamrauli Airport, Bamrauli Air Force Station
IXE|Mangaluru International Airport|Mangaluru|IN|12.955|74.887|Asia/Kolkata|l|s|Bajpe Airport
IXG|Belagavi Airport|Belgaum|IN|15.859|74.618|Asia/Kolkata|m|s|VABM
IXH|Kailashahar Airport|Kailashahar|IN|24.309|92.008|Asia/Kolkata|m|n|
IXI|Lilabari North Lakhimpur Airport|Lilabari|IN|27.296|94.097|Asia/Kolkata|m|s|
IXJ|Jammu Airport|Jammu|IN|32.689|74.838|Asia/Kolkata|m|s|Satwari Airport
IXK|Keshod Airport|Keshod|IN|21.317|70.27|Asia/Kolkata|m|s|
IXL|Leh Kushok Bakula Rimpochee Airport|Leh|IN|34.136|77.547|Asia/Kolkata|m|s|Leh Air Force Station
IXM|Madurai Airport|Madurai|IN|9.835|78.093|Asia/Kolkata|m|s|Madurai Air Force Station
IXP|Pathankot Airport|Pathankot|IN|32.234|75.634|Asia/Kolkata|m|s|
IXR|Birsa Munda Airport|Ranchi|IN|23.314|85.322|Asia/Kolkata|m|s|
IXS|Silchar Airport|Silchar|IN|24.913|92.979|Asia/Kolkata|m|s|Kumbhigram Air Force Station
IXU|Aurangabad Airport|Aurangabad|IN|19.863|75.396|Asia/Kolkata|m|s|Chikkalthana Airport, Chhatrapati Sambhajinagar
IXV|Along Airport||IN|28.175|94.802|Asia/Kolkata|m|n|
IXW|Sonari Airport|Jamshedpur|IN|22.814|86.169|Asia/Kolkata|m|n|
IXX|Bidar Airport / Bidar Air Force Station|Bidar|IN|17.908|77.487|Asia/Kolkata|m|n|
IXY|Kandla Airport|Kandla|IN|23.113|70.1|Asia/Kolkata|m|s|
IXZ|Veer Savarkar International Airport / INS Utkrosh|Port Blair|IN|11.64|92.729|Asia/Kolkata|l|s|Port Blair Airport, Port Blair Air Force Station
IZA|Presidente Itamar Franco Airport|Juiz de Fora|BR|-21.513|-43.173|America/Sao_Paulo|m|s|SDZY, Zona da Mata Regional Airport, Juiz de Fora Airport
IZO|Izumo Enmusubi Airport|Izumo|JP|35.414|132.89|Asia/Tokyo|m|s|en-musubi
IZT|General Antonio Cárdenas Rodríguez National Airport / Ixtepec Air Base|Ixtepec|MX|16.446|-95.094|America/Mexico_City|m|s|Aeropuerto Nacional General Antonio Cárdenas Rodríguez
JAA|Jalalabad Airport|Jalalabad|AF|34.4|70.499|Asia/Kabul|m|n|
JAC|Jackson Hole Airport|Jackson|US|43.607|-110.738|America/Denver|m|s|
JAD|Perth Jandakot Airport|Perth|AU|-32.097|115.881|Australia/Perth|m|n|
JAE|Shumba Airport|Jaén|PE|-5.592|-78.774|America/Lima|m|s|
JAF|Jaffna International Airport|Jaffna|LK|9.792|80.07|Asia/Colombo|l|s|SLAF Palaly, Kankesanturai
JAG|Shahbaz Air Base|Jacobabad|PK|28.284|68.45|Asia/Karachi|m|n|
JAI|Jaipur International Airport|Jaipur|IN|26.824|75.812|Asia/Kolkata|l|s|
JAK|Jacmel Airport|Jacmel|HT|18.241|-72.519|America/Port-au-Prince|m|n|
JAL|El Lencero Airport|Emiliano Zapata|MX|19.475|-96.797|America/Mexico_City|m|n|Xalapa
JAM|Bezmer Air Base|Bezmer|BG|42.455|26.352|Europe/Sofia|m|n|LB44
JAN|Jackson-Medgar Wiley Evers International Airport|Jackson|US|32.311|-90.076|America/Chicago|m|s|
JAU|Francisco Carle Airport|Jauja|PE|-11.783|-75.473|America/Lima|m|s|
JAV|Ilulissat Airport|Ilulissat|GL|69.243|-51.057|America/Nuuk|m|s|Mittarfik Ilulissat, Ilulissat Lufthavn, Jakobshavn
JAX|Jacksonville International Airport|Jacksonville|US|30.492|-81.688|America/New_York|l|s|
JBQ|La Isabela International Airport|La Isabela|DO|18.573|-69.986|America/Santo_Domingo|m|s|MDLI, SDI, Dr Joaquin Balaguer International Airport
JBR|Jonesboro Municipal Airport|Jonesboro|US|35.832|-90.646|America/Chicago|m|s|
JCL|České Budějovice South Bohemian Airport|České Budějovice|CZ|48.948|14.428|Europe/Prague|l|s|Jihočeské letiště České Budějovice
JCR|Jacareacanga Airport|Jacareacanga|BR|-6.233|-57.777|America/Santarem|m|n|
JCT|Kimble County Airport|Junction|US|30.511|-99.763|America/Chicago|m|n|
JDE|Jiande Qiandaohu General Airport|Hangzhou|CN|29.361|119.181|Asia/Shanghai|m|n|
JDF|Francisco de Assis Airport|Juiz de Fora|BR|-21.791|-43.386|America/Sao_Paulo|m|s|Serrinha Airport
JDG|Jeongseok Airport|Jeju Island|KR|33.4|126.712|Asia/Seoul|m|n|Cheju
JDH|Jodhpur Airport|Jodhpur|IN|26.251|73.049|Asia/Kolkata|m|s|Jodhpur Air Force Station
JDZ|Jingdezhen Luojia Airport|Jingdezhen|CN|29.339|117.176|Asia/Shanghai|m|s|Fouliang Air Base
JED|King Abdulaziz International Airport|Jeddah|SA|21.68|39.157|Asia/Riyadh|l|s|Mecca, Hajj
JEE|Jérémie Airport|Carrefour Sanon|HT|18.663|-74.17|America/Port-au-Prince|m|s|
JEG|Aasiaat Airport|Aasiaat|GL|68.722|-52.785|America/Nuuk|m|s|Mittarfik Aasiaat, Aasiaat Lufthavn, Egedesminde
JER|Jersey Airport|St. Peter|JE|49.208|-2.196|Europe/London|m|s|Channel Islands
JFK|John F. Kennedy International Airport|New York|US|40.639|-73.779|America/New_York|l|s|Manhattan, New York City, NYC, Idlewild, IDL, KIDL
JFN|Northeast Ohio Regional Airport|Ashtabula|US|41.778|-80.696|America/New_York|m|n|Ashtabula County
JGA|Jamnagar Airport|Jamnagar|IN|22.465|70.013|Asia/Kolkata|m|s|Jamnagar Air Force Station
JGD|Daxing'anling Elunchun Airport|Jiagedaqi|CN|50.371|124.118|Asia/Shanghai|m|s|Jagdaqi, Jiagedaqi
JGN|Jiayuguan International Airport|Jiayuguan|CN|39.859|98.339|Asia/Shanghai|l|s|
JGS|Jinggangshan Airport|Ji'an|CN|26.857|114.737|Asia/Shanghai|m|s|Tiahe Air Base, Ji'an Airport
JHB|Senai International Airport|Johor Bahru|MY|1.641|103.67|Asia/Singapore|l|s|Sultan Ismail International Airport
JHF|São Paulo Catarina Executive Airport|São Roque|BR|-23.427|-47.166|America/Sao_Paulo|m|n|SP9007
JHG|Xishuangbanna Gasa International Airport|Jinghong (Gasa)|CN|21.975|100.762|Asia/Shanghai|l|s|Sipsong Panna
JHM|Kapalua Airport|Lahaina|US|20.963|-156.673|Pacific/Honolulu|m|s|
JHS|Sisimiut Airport|Sisimiut|GL|66.951|-53.729|America/Nuuk|m|s|
JHW|Chautauqua County-Jamestown Airport|Jamestown|US|42.154|-79.254|America/New_York|m|n|
JIB|Djibouti-Ambouli Airport|Djibouti City|DJ|11.547|43.16|Asia/Riyadh|l|s|Camp Lemonnier
JIC|Jinchang Jinchuan Airport|Jinchang|CN|38.542|102.348|Asia/Shanghai|m|s|
JIJ|Gerad Wilwal International Airport|Jijiga|ET|9.332|42.912|Asia/Riyadh|l|s|Garaad Wiil-Waal
JIM|Jimma Airport|Jimma|ET|7.666|36.817|Asia/Riyadh|m|s|
JIQ|Qianjiang Wulingshan Airport|Qianjiang|CN|29.513|108.831|Asia/Shanghai|m|s|Zhoubai
JJD|Comandante Ariston Pessoa Airport|Cruz|BR|-2.906|-40.357|America/Fortaleza|m|s|SSVV, Jericoacoara
JJI|Juanjui Airport|Juanjuí|PE|-7.169|-76.729|America/Lima|m|n|
JJN|Quanzhou Jinjiang International Airport|Quanzhou|CN|24.796|118.589|Asia/Shanghai|l|s|Jinjiang Air Base, Chin Chiang, Qingyang
JJU|Qaqortoq Airport|Qaqortoq|GL|60.764|-46.065|America/Nuuk|m|s|
JKG|Jönköping Airport|Jönköping|SE|57.758|14.069|Europe/Berlin|m|s|
JKH|Chios Island National Airport|Chios Island|GR|38.343|26.141|Europe/Athens|m|s|
JKR|Janakpur Airport|Janakpur|NP|26.709|85.922|Asia/Kathmandu|m|s|
JLN|Joplin Regional Airport|Joplin|US|37.152|-94.498|America/Chicago|m|s|
JLR|Jabalpur Airport|Jabalpur|IN|23.178|80.052|Asia/Kolkata|m|s|
JMJ|Lancang Jingmai Airport|Pu'er (Lancang)|CN|22.418|99.784|Asia/Shanghai|m|s|
JMK|Mykonos Island National Airport|Mykonos|GR|37.435|25.348|Europe/Athens|m|s|
JMS|Jamestown Regional Airport|Jamestown|US|46.93|-98.678|America/Chicago|m|s|
JMU|Jiamusi Songjiang International Airport|Jiamusi|CN|46.843|130.464|Asia/Shanghai|m|s|Jiamusi Dongjiao Airport, 佳木斯, 佳木斯东郊机场, 佳木斯松江机场
JNB|O.R. Tambo International Airport|Johannesburg|ZA|-26.14|28.247|Africa/Johannesburg|l|s|Johannesburg International Airport, FAJS
JNG|Jining Da'an Airport|Jining|CN|35.647|116.743|Asia/Shanghai|m|s|济宁大安机场，济宁
JNH|Jiaxing Nanhu Airport|Xiuzhou, Hangzhou|CN|30.698|120.663|Asia/Shanghai|m|s|
JNU|Juneau International Airport|Juneau|US|58.355|-134.574|America/Juneau|m|s|
JNZ|Jinzhou Bay Airport|Jinzhou (Linghai)|CN|40.936|121.277|Asia/Shanghai|m|s|
JOE|Joensuu Airport|Joensuu|FI|62.659|29.619|Europe/Helsinki|m|s|
JOG|Adisutjipto International Airport|Yogyakarta|ID|-7.788|110.432|Asia/Jakarta|m|s|WIIJ, WARJ, Adisucipto
JOH|Port St Johns Airport|Port St Johns|ZA|-31.606|29.522|Africa/Johannesburg|m|n|
JOI|Lauro Carneiro de Loyola Airport|Joinville|BR|-26.225|-48.797|America/Sao_Paulo|m|s|
JOK|Yoshkar-Ola Airport|Yoshkar-Ola|RU|56.701|47.905|Europe/Moscow|m|n|Аэропорт Йошкар-Ола
JOL|Jolo Airport|Jolo|PH|6.054|121.011|Asia/Manila|m|s|
JOS|Yakubu Gowon Airport|Jos|NG|9.64|8.869|Africa/Lagos|m|s|
JPA|Presidente Castro Pinto International Airport|João Pessoa|BR|-7.149|-34.951|America/Fortaleza|l|s|
JRF|Kalaeloa Airport|Kapolei|US|21.307|-158.07|Pacific/Honolulu|m|n|NAX, Naval Air Station Barbers Point, John Rodgers Field
JRH|Jorhat Airport|Jorhat|IN|26.73|94.175|Asia/Kolkata|m|s|Rowriah Airport, Jorhat Air Force Station
JRO|Kilimanjaro International Airport|Arusha|TZ|-3.427|37.074|Asia/Riyadh|l|s|
JSA|Jaisalmer Airport||IN|26.889|70.865|Asia/Kolkata|m|s|Jaisalmer Air Force Station
JSH|Sitia Airport|Crete Island|GR|35.216|26.101|Europe/Athens|m|s|
JSI|Skiathos Island National Airport|Skiathos|GR|39.177|23.504|Europe/Athens|m|s|Alexandros Papadiamantis Airport
JSJ|Jiansanjiang Shidi Airport|Jiansanjiang|CN|47.108|132.658|Asia/Shanghai|m|s|
JSO|Dr. Luciano de Arruda Coelho Regional Airport|Sobral|BR|-3.615|-40.232|America/Fortaleza|m|n|
JSR|Jessore Airport|Jashore (Jessore)|BD|23.184|89.161|Asia/Dhaka|m|s|
JST|John Murtha Johnstown Cambria County Airport|Johnstown|US|40.316|-78.834|America/New_York|m|s|
JTC|Bauru/Arealva–Moussa Nakhal Tobias State Airport|Bauru|BR|-22.161|-49.07|America/Sao_Paulo|m|s|SJCT
JTR|Santorini International Airport|Santorini Island|GR|36.4|25.479|Europe/Athens|l|s|
JUB|Juba International Airport|Juba|SS|4.872|31.601|Africa/Juba|l|s|JIA, HSSJ
JUJ|Gobernador Horacio Guzman International Airport|San Salvador de Jujuy|AR|-24.393|-65.098|America/Argentina/Jujuy|l|s|
JUL|Inca Manco Capac International Airport|Juliaca|PE|-15.468|-70.157|America/Lima|l|s|
JUZ|Quzhou Airport|Quzhou (Kezheng)|CN|28.966|118.899|Asia/Shanghai|m|s|
JWA|Jwaneng Airport|Jwaneng|BW|-24.602|24.691|Africa/Johannesburg|m|n|
JWN|Zanjan Airport|Zanjan|IR|36.774|48.359|Asia/Tehran|m|n|
JWO|Jungwon Air Base/Chungju Airport|Gimseang-ro|KR|37.03|127.886|Asia/Seoul|m|n|
JXA|Jixi Xingkaihu Airport|Jixi|CN|45.293|131.193|Asia/Shanghai|m|s|
JXN|Jackson County Airport/Reynolds Field|Jackson|US|42.261|-84.463|America/Detroit|m|n|
JYR|Jiroft Airport|Jiroft|IR|28.724|57.675|Asia/Tehran|m|n|Sabzevaran
JYV|Jyväskylä Airport|Jyväskylän Maalaiskunta|FI|62.4|25.678|Europe/Helsinki|m|s|
JZH|Jiuzhai Huanglong Airport|Ngawa (Songpan)|CN|32.853|103.682|Asia/Shanghai|m|s|Aba
KAB|Kariba Airport|Kariba|ZW|-16.52|28.885|Africa/Johannesburg|m|s|
KAC|Qamishli International Airport|Qamishli|SY|37.021|41.191|Asia/Damascus|m|s|مطار القامشلي‎, Kamishly, Kamishly International Airport
KAD|Kaduna International Airport|Kaduna|NG|10.696|7.32|Africa/Lagos|l|s|
KAG|Gangneung Airport (K-18)|Gangneung|KR|37.754|128.944|Asia/Seoul|m|n|
KAI|Kaieteur Airport|Kaieteur Falls|GY|5.177|-59.489|America/Guyana|m|s|
KAJ|Kajaani Airport|Kajaani|FI|64.285|27.692|Europe/Helsinki|m|s|
KAN|Mallam Aminu Kano International Airport|Kano|NG|12.046|8.524|Africa/Lagos|l|s|
KAO|Kuusamo Airport|Kuusamo|FI|65.988|29.239|Europe/Helsinki|m|s|
KAT|Kaitaia Airport|Awanui|NZ|-35.07|173.287|Pacific/Auckland|m|s|
KAU|Kauhava Airfield|Kauhava|FI|63.127|23.051|Europe/Helsinki|m|n|Kauhava Air Base
KAW|Kawthoung Airport|Kawthoung|MM|10.049|98.538|Asia/Yangon|m|s|
KBK|Kushinagar International Airport|Kushinagar|IN|26.777|83.889|Asia/Kolkata|m|n|
KBL|Kabul International Airport|Kabul|AF|34.566|69.212|Asia/Kabul|l|s|Hamid Karzai International Airport, Khwaja Rawash Airport
KBP|Boryspil International Airport|Boryspil|UA|50.345|30.895|Europe/Kyiv|l|n|Borispol, Міжнародний аеропорт Бориспіль, Kyiv
KBR|Sultan Ismail Petra Airport|Kota Baharu|MY|6.167|102.293|Asia/Singapore|m|s|
KBS|Bo Airport|Bo|SL|7.944|-11.761|Africa/Abidjan|m|n|
KBV|Krabi International Airport|Krabi|TH|8.096|98.989|Asia/Jakarta|l|s|
KCH|Kuching International Airport|Kuching|MY|1.487|110.353|Asia/Makassar|l|s|
KCM|Kahramanmaraş Airport|Kahramanmaraş|TR|37.539|36.954|Europe/Istanbul|m|s|
KCO|Cengiz Topel Airport|Kartepe|TR|40.735|30.083|Europe/Istanbul|m|n|
KCT|Koggala Airport|Galle|LK|5.994|80.32|Asia/Colombo|m|s|SLAF Koggala
KCY|Krasnoyarsk Cheremshanka Airport|Krasnoyarsk|RU|56.178|92.546|Asia/Krasnoyarsk|m|s|Аэропорт Черемшанка
KCZ|Kochi Ryoma Airport|Nankoku|JP|33.545|133.67|Asia/Tokyo|l|s|Nankoku, RJOK, KCZ
KDH|Ahmad Shah Baba International Airport|Kandahar|AF|31.506|65.848|Asia/Kabul|l|s|Kandahar International Airport, Kandahar Airfield
KDL|Kärdla Airport|Kärdla|EE|58.991|22.831|Europe/Tallinn|m|s|
KDM|Kaadedhdhoo Airport|Huvadhu Atoll|MV|0.488|72.997|Indian/Maldives|m|s|
KDO|Kadhdhoo Airport|Kadhdhoo|MV|1.859|73.522|Indian/Maldives|m|s|
KDT|Kamphaeng Saen Airport|Nakhon Pathom|TH|14.102|99.917|Asia/Jakarta|m|n|
KDU|Skardu International Airport|Skardu|PK|35.339|75.539|Asia/Karachi|l|s|
KEF|Keflavik International Airport|Reykjavík|IS|63.985|-22.606|Africa/Abidjan|l|s|Keflavik Naval Air Station, REK
KEJ|Alexei Leonov Kemerovo International Airport|Kemerovo|RU|55.27|86.107|Asia/Novokuznetsk|l|s|
KEL|Kiel-Holtenau Airport|Kiel|DE|54.38|10.145|Europe/Berlin|m|n|
KEM|Kemi-Tornio Airport|Kemi / Tornio|FI|65.779|24.582|Europe/Helsinki|m|s|
KEN|Kenema Airport|Kenema|SL|7.896|-11.174|Africa/Abidjan|m|n|
KEP|Nepalgunj Airport|Nepalgunj|NP|28.104|81.667|Asia/Kathmandu|m|s|
KER|Ayatollah Hashemi Rafsanjani International Airport|Kerman|IR|30.271|56.95|Asia/Tehran|l|s|
KES|Kelsey Airport|Kelsey|CA|56.037|-96.51|America/Winnipeg|m|n|
KET|Kengtung Airport|Kengtung|MM|21.302|99.636|Asia/Yangon|m|s|
KEV|Halli Airport|Jämsä|FI|61.856|24.787|Europe/Helsinki|m|n|Halli Air Base
KFS|Kastamonu Airport|Kastamonu|TR|41.314|33.796|Europe/Istanbul|m|s|
KFZ|Kukës International Airport|Kukës|AL|42.036|20.416|Europe/Tirane|m|n|
KGA|Kananga Airport|Kananga|CD|-5.9|22.469|Africa/Johannesburg|m|s|
KGC|Kingscote Airport||AU|-35.714|137.521|Australia/Adelaide|m|s|
KGD|Khrabrovo Airport|Kaliningrad|RU|54.892|20.599|Europe/Kaliningrad|l|s|УМКК, Храброво
KGF|Sary-Arka Airport|Karaganda|KZ|49.671|73.334|Asia/Almaty|l|s|
KGG|Kédougou Airport|Kédougou|SN|12.572|-12.22|Africa/Abidjan|m|n|
KGI|Kalgoorlie Boulder Airport|Broadwood|AU|-30.792|121.465|Australia/Perth|m|s|
KGJ|Karonga Airport|Karonga|MW|-9.954|33.893|Africa/Johannesburg|m|n|
KGL|Kigali International Airport|Kigali|RW|-1.969|30.14|Africa/Johannesburg|l|s|Gregoire Kayibanda International Airport, Kanombe International Airport
KGP|Kogalym International Airport|Kogalym|RU|62.19|74.534|Asia/Yekaterinburg|m|s|
KGS|Kos International Airport Ippokratis|Kos Island|GR|36.795|27.091|Europe/Athens|l|s|
KGT|Kangding Airport|Garzê (Kangding)|CN|30.142|101.739|Asia/Shanghai|m|s|
KGY|Kingaroy Airport||AU|-26.581|151.84|Australia/Brisbane|m|n|
KHD|Khoram Abad Airport||IR|33.435|48.283|Asia/Tehran|m|s|
KHE|Kherson International Airport|Kherson|UA|46.676|32.506|Europe/Kyiv|m|n|
KHG|Kashgar Laining International Airport|Kashgar|CN|39.542|76.02|Asia/Urumqi|l|s|Kashi Airport, 喀什徕宁国际机场, 喀什机场
KHH|Kaohsiung International Airport|Kaohsiung (Xiaogang)|TW|22.577|120.35|Asia/Taipei|l|s|Siaogang International Airport, 高雄國際航空站, 小港國際機場
KHI|Jinnah International Airport|Karachi|PK|24.907|67.161|Asia/Karachi|l|s|OPQR, OPHQ, Drigh Road Airstrip, Quaid-E-Azam International Airport
KHJ|Kauhajoki Airfield|Kauhajoki|FI|62.463|22.391|Europe/Helsinki|m|n|
KHK|Khark Airport|Khark|IR|29.261|50.322|Asia/Tehran|m|s|
KHN|Nanchang Changbei International Airport|Nanchang|CN|28.865|115.903|Asia/Shanghai|l|s|
KHS|Khasab Airport|Khasab|OM|26.171|56.241|Asia/Dubai|m|s|
KHT|Khost International Airport|Khost|AF|33.285|69.807|Asia/Kabul|m|s|FOB Chapman
KHV|Khabarovsk Novy Airport|Khabarovsk|RU|48.528|135.189|Asia/Vladivostok|m|s|Аэропорт Хабаровск-Новый
KHX|Savannah Airstrip|Kihihi|UG|-0.717|29.7|Asia/Riyadh|m|s|Kihihi Airstrip
KID|Kristianstad Airport|Kristianstad|SE|55.922|14.085|Europe/Berlin|m|n|
KIH|Kish International Airport|Kish Island|IR|26.525|53.98|Asia/Tehran|l|s|
KIJ|Niigata Airport|Niigata|JP|37.954|139.112|Asia/Tokyo|l|s|新潟空港, 新潟
KIK|Kirkuk International Airport|Kirkuk|IQ|35.47|44.349|Asia/Baghdad|l|s|Kirkuk Air Base
KIM|Kimberley Airport|Kimberley|ZA|-28.805|24.765|Africa/Johannesburg|l|s|
KIN|Norman Manley International Airport|Kingston|JM|17.936|-76.787|America/Jamaica|l|s|
KIR|Kerry Airport|Farranfore|IE|52.181|-9.524|Europe/London|m|s|
KIS|Kisumu International Airport|Kisumu|KE|-0.086|34.729|Asia/Riyadh|l|s|
KIW|Southdowns Airport|Kitwe|ZM|-12.9|28.15|Africa/Johannesburg|m|n|
KIX|Kansai International Airport|Osaka|JP|34.427|135.244|Asia/Tokyo|l|s|OSA
KJA|Krasnoyarsk International Airport|Krasnoyarsk|RU|56.176|92.486|Asia/Krasnoyarsk|l|s|Yemelyanovo
KJB|Kurnool Airport|Orvakal|IN|15.716|78.169|Asia/Kolkata|m|s|Orvakal
KJH|Kaili Huangping Airport|Kaili (Huangping)|CN|26.972|107.988|Asia/Shanghai|m|s|
KJI|Burqin Kanas Airport|Burqin|CN|48.222|86.996|Asia/Urumqi|m|s|
KJK|Kortrijk-Wevelgem International Airport|Wevelgem|BE|50.819|3.21|Europe/Brussels|m|n|Courtrai
KJT|Kertajati International Airport|Kertajati|ID|-6.647|108.166|Asia/Jakarta|m|s|
KKC|Khon Kaen Airport|Khon Kaen|TH|16.467|102.784|Asia/Jakarta|m|s|
KKE|Kerikeri Airport|Kerikeri|NZ|-35.259|173.913|Pacific/Auckland|m|s|Bay of Islands Airport
KKJ|Kitakyushu Airport|Kitakyushu|JP|33.846|131.035|Asia/Tokyo|l|s|kokuraminami
KKM|Khok Kathiam Airport|Lop Buri|TH|14.875|100.663|Asia/Jakarta|m|n|Kathiam AFB
KKN|Kirkenes Airport, Høybuktmoen|Kirkenes|NO|69.726|29.891|Europe/Berlin|m|s|
KKR|Kaukura Airport|Raitahiti|PF|-15.663|-146.885|Pacific/Honolulu|m|s|
KKS|Kashan Airport|Kashan|IR|33.895|51.577|Asia/Tehran|m|s|
KKW|Kikwit Airport|Kikwit|CD|-5.036|18.786|Africa/Lagos|m|s|
KKX|Kikai Airport|Kikai|JP|28.321|129.928|Asia/Tokyo|m|s|
KLC|Kaolack Airport|Kaolack|SN|14.147|-16.051|Africa/Abidjan|m|n|
KLD|Migalovo Air Base|Tver|RU|56.825|35.758|Europe/Moscow|m|n|
KLF|Grabtsevo Airport|Kaluga|RU|54.55|36.367|Europe/Moscow|m|n|Аэропорт Грабцево
KLH|Kolhapur Airport|Kolhapur|IN|16.665|74.289|Asia/Kolkata|m|s|
KLO|Kalibo International Airport|Kalibo|PH|11.679|122.376|Asia/Manila|l|s|
KLR|Kalmar Airport|Kalmar|SE|56.686|16.288|Europe/Berlin|m|s|
KLS|Southwest Washington Regional Airport|Kelso|US|46.118|-122.898|America/Los_Angeles|m|n|Molt Taylor Field, Kelso-Longview Regional
KLU|Klagenfurt Airport|Klagenfurt am Wörthersee|AT|46.643|14.338|Europe/Vienna|l|s|Kärnten Airport, Christophorus 11
KLV|Karlovy Vary Airport|Karlovy Vary|CZ|50.203|12.915|Europe/Prague|l|s|Karlovy Vary International
KLW|Klawock Airport|Klawock|US|55.579|-133.076|America/Sitka|m|s|9Z1
KLX|Kalamata Airport|Kalamata|GR|37.068|22.025|Europe/Athens|m|s|
KLZ|Kleinsee Airport|Kleinsee|ZA|-29.688|17.094|Africa/Johannesburg|m|n|
KMA|Kerema Airport|Kerema|PG|-7.964|145.771|Pacific/Port_Moresby|m|s|
KMC|King Khaled Military City Airport|King Khaled Military City|SA|27.901|45.528|Asia/Riyadh|m|s|
KME|Kamembe Airport|Kamembe|RW|-2.462|28.908|Africa/Johannesburg|m|s|
KMG|Kunming Changshui International Airport|Kunming|CN|25.11|102.937|Asia/Shanghai|l|s|
KMH|Johan Pienaar Airport|Kuruman|ZA|-27.457|23.412|Africa/Johannesburg|m|n|
KMI|Miyazaki Airport|Miyazaki|JP|31.877|131.449|Asia/Tokyo|l|s|
KMJ|Kumamoto Airport|Kumamoto|JP|32.837|130.855|Asia/Tokyo|l|s|
KMP|Keetmanshoop Airport|Keetmanshoop|NA|-26.54|18.111|Africa/Windhoek|m|n|
KMQ|Komatsu Airport / JASDF Komatsu Air Base|Kanazawa|JP|36.393|136.407|Asia/Tokyo|l|s|
KMS|Prempeh I International Airport|Kumasi|GH|6.715|-1.591|Africa/Abidjan|l|s|
KMU|Kismayo Airport|Kismayo|SO|-0.377|42.459|Asia/Riyadh|m|n|Kisimayu, كيسمايو المطار
KMW|Kostroma Sokerkino Airport|Kostroma|RU|57.797|41.019|Europe/Moscow|m|s|Аэропорт Кострома Сокеркино
KMX|King Khalid Air Base|Khamis Mushait|SA|18.297|42.804|Asia/Riyadh|m|n|
KNA|Viña del Mar Airport|Viña del Mar|CL|-32.95|-71.479|America/Santiago|m|n|Torquemada
KND|Kindu Airport|Kindu|CD|-2.919|25.915|Africa/Johannesburg|m|s|
KNF|RAF Marham|King's Lynn, Norfolk|GB|52.648|0.551|Europe/London|m|n|King's Lynn
KNG|Utarom Airport|Kaimana|ID|-3.645|133.695|Asia/Tokyo|m|s|
KNH|Kinmen Airport|Shang-I|TW|24.428|118.359|Asia/Taipei|m|s|Shang Yi Airport, 金門尚義機場, 金门尚义机场, Jīnmén Shàngyì jīchǎng
KNO|Kualanamu International Airport|Beringin|ID|3.638|98.871|Asia/Jakarta|l|s|Medan
KNQ|Koné Airport|Koné|NC|-21.054|164.839|Pacific/Noumea|m|s|
KNR|Jam Airport|Jam|IR|27.82|52.352|Asia/Tehran|m|n|Kangan, Tohid, OIBM
KNS|King Island Airport||AU|-39.877|143.878|Australia/Hobart|m|s|
KNU|Kanpur Airport|Kanpur|IN|26.404|80.41|Asia/Kolkata|m|s|VECX (IAF Stn), VICX, Ganesh Shankar Vidyarthi Airport, Chakeri Air Force Station
KNX|East Kimberley Regional (Kununurra) Airport|Kununurra|AU|-15.778|128.708|Australia/Perth|m|s|
KOA|Ellison Onizuka Kona International Airport at Keāhole|Kailua-Kona|US|19.739|-156.046|Pacific/Honolulu|l|s|
KOE|El Tari Airport|Kupang|ID|-10.172|123.671|Asia/Makassar|m|s|WRKK, Kupang Airport, Penfui Airport
KOI|Kirkwall Airport|Kirkwall, Orkney Islands|GB|58.958|-2.905|Europe/London|m|s|RNAS Grimsetter, HMS Robin
KOJ|Kagoshima Airport|Kagoshima|JP|31.803|130.719|Asia/Tokyo|l|s|
KOK|Kokkola-Pietarsaari Airport|Kokkola / Kruunupyy|FI|63.721|23.143|Europe/Helsinki|m|s|Kronoby Airport
KOP|Nakhon Phanom Airport|Nakhon Phanom|TH|17.384|104.643|Asia/Jakarta|m|s|
KOS|Sihanouk International Airport|Preah Sihanouk|KH|10.571|103.632|Asia/Jakarta|l|s|Kompong Som, Sihanoukville International Airport, Kang Keng Airport
KOU|Koulamoutou Mabimbi Airport|Koulamoutou|GA|-1.185|12.441|Africa/Lagos|m|n|Koula Moutou, FO23, Koulamouton/Mabimbi
KOV|Kokshetau International Airport|Kokshetau|KZ|53.329|69.595|Asia/Almaty|l|s|KOKCHETAV TROFIMOVKA
KPC|Port Clarence Coast Guard Station|Port Clarence|US|65.254|-166.859|America/Nome|m|n|
KPO|Pohang Airport (G-815/K-3)|Pohang|KR|35.988|129.42|Asia/Seoul|m|s|
KPS|Kempsey Airport||AU|-31.072|152.765|Australia/Sydney|m|n|
KPW|Keperveem Airport|Keperveem|RU|67.845|166.14|Asia/Anadyr|m|s|Keperveyem Airport, Аэропорт Кепервеем
KQH|Kishangarh Airport Ajmer|Ajmer (Kishangarh)|IN|26.591|74.813|Asia/Kolkata|m|s|
KQT|Bokhtar International Airport|Bokhtar|TJ|37.866|68.864|Asia/Dushanbe|l|s|Kurgan-Tube, Qurghonteppa
KRA|Kerang Airport||AU|-35.751|143.939|Australia/Melbourne|m|n|
KRF|Kramfors-Sollefteå Höga Kusten Airport|Nyland|SE|63.049|17.769|Europe/Berlin|m|s|
KRK|Kraków John Paul II International Airport|Balice|PL|50.078|19.785|Europe/Warsaw|l|s|Krakov
KRL|Korla Licheng Airport|Korla|CN|41.615|86.141|Asia/Urumqi|m|s|
KRN|Kiruna Airport|Kiruna|SE|67.822|20.337|Europe/Berlin|l|s|
KRO|Kurgan Airport|Kurgan|RU|55.475|65.416|Asia/Yekaterinburg|m|s|
KRP|Midtjyllands Airport / Air Base Karup|Karup|DK|56.297|9.104|Europe/Berlin|m|s|Karup Airport
KRR|Krasnodar Pashkovsky International Airport|Krasnodar|RU|45.034|39.174|Europe/Moscow|l|s|Pashkovskiy Airport, Pashkovsky Airport
KRS|Kristiansand Airport|Kristiansand(Kjevik)|NO|58.204|8.085|Europe/Berlin|l|s|Kjevik Airport
KRT|Khartoum International Airport|Khartoum|SD|15.589|32.553|Africa/Khartoum|l|s|HSSS
KRW|Turkmenbaşy International Airport|Turkmenbaşy|TM|40.063|53.005|Asia/Ashgabat|m|s|Turkmenbashi, Krasnovodsk, Красноводск
KSA|Kosrae International Airport|Okat|FM|5.357|162.958|Pacific/Kosrae|l|s|Caroline Islands Airport
KSC|Košice International Airport|Košice|SK|48.663|21.241|Europe/Prague|m|s|
KSD|Karlstad Airport|Karlstad|SE|59.445|13.337|Europe/Berlin|m|s|
KSF|Kassel Airport|Calden|DE|51.418|9.392|Europe/Berlin|l|s|Kassel-Calden
KSH|Shahid Ashrafi Esfahani Airport|Kermanshah|IR|34.346|47.158|Asia/Tehran|m|s|
KSK|Karlskoga Airport|Karlskoga|SE|59.346|14.496|Europe/Berlin|m|n|
KSL|Kassala Airport|Kassala|SD|15.387|36.329|Africa/Khartoum|m|s|
KSN|Kostanay International Airport|Kostanay|KZ|53.207|63.55|Asia/Qostanay|l|s|
KSU|Kristiansund Airport, Kvernberget|Kvernberget|NO|63.112|7.825|Europe/Berlin|m|s|Kristiansund lufthavn
KSY|Kars Airport|Kars|TR|40.562|43.115|Europe/Istanbul|m|s|
KSZ|Kotlas Airport|Kotlas|RU|61.236|46.697|Europe/Moscow|m|s|Аэропорт Котлас
KTA|Karratha Airport|Karratha|AU|-20.712|116.773|Australia/Perth|m|s|
KTD|Kitadaito Airport|Kitadaitōjima|JP|25.945|131.327|Asia/Tokyo|m|s|
KTE|Kerteh Airport|Kerteh|MY|4.537|103.427|Asia/Singapore|m|n|
KTG|Rahadi Osman Airport|Ketapang|ID|-1.817|109.963|Asia/Pontianak|m|s|Rahadi Usman
KTI|Techo International Airport|Phnom Penh (Boeng Khyang)|KH|11.36|104.921|Asia/Jakarta|l|s|
KTL|Kitale Airport|Kitale|KE|0.972|34.959|Asia/Riyadh|m|n|
KTM|Tribhuvan International Airport|Kathmandu|NP|27.697|85.359|Asia/Kathmandu|l|s|gaucharan, Bagmati
KTN|Ketchikan International Airport|Ketchikan|US|55.356|-131.714|America/Sitka|m|s|
KTP|Tinson Pen Airport|Tinson Pen|JM|17.989|-76.824|America/Jamaica|m|s|
KTQ|Kitee Airport|Kitee|FI|62.166|30.074|Europe/Helsinki|m|n|
KTR|Tindal Airport||AU|-14.521|132.378|Australia/Darwin|m|n|RAAF Base Tindal
KTT|Kittilä International Airport|Kittilä|FI|67.701|24.847|Europe/Helsinki|l|s|
KTU|Kota Airport|Kota|IN|25.16|75.846|Asia/Kolkata|m|n|
KTW|Katowice Wojciech Korfanty International Airport|Katowice|PL|50.476|19.081|Europe/Warsaw|l|s|Pyrzowice, Dąbrowa Górnicza, Silesia, GOP, Silesia Metropolis, Gliwice, Piekary Śląskie, Bytom, Zabrze, Sosnowiec
KUA|Kuantan Airport|Kuantan|MY|3.775|103.209|Asia/Singapore|m|s|
KUF|Kurumoch International Airport|Samara|RU|53.505|50.164|Europe/Samara|l|s|УВВВ, Самара / Курумоч
KUH|Kushiro Airport|Kushiro|JP|43.041|144.193|Asia/Tokyo|m|s|
KUL|Kuala Lumpur International Airport|Sepang|MY|2.746|101.71|Asia/Singapore|l|s|KLIA
KUM|Yakushima Airport|Yakushima|JP|30.386|130.659|Asia/Tokyo|m|s|
KUN|Kaunas International Airport|Kaunas|LT|54.964|24.086|Europe/Vilnius|l|s|Kauno tarptautinis Oro Uostas
KUO|Kuopio Airport|Kuopio / Siilinjärvi|FI|63.007|27.798|Europe/Helsinki|l|s|
KUS|Kulusuk Airport|Kulusuk|GL|65.574|-37.124|America/Nuuk|m|s|Kap Dan, BGKD
KUT|David the Builder Kutaisi International Airport|Kopitnari|GE|42.177|42.485|Asia/Tbilisi|l|s|Kopitnari
KUU|Kullu Manali Airport|Bhuntar|IN|31.877|77.154|Asia/Kolkata|m|s|
KUV|Gunsan Airport / Gunsan Air Base|Gunsan|KR|35.904|126.616|Asia/Seoul|m|s|Kunsan
KVA|Kavala Alexander the Great International Airport|Kavala|GR|40.913|24.619|Europe/Athens|l|s|Megas Alexandros
KVB|Skövde Airport|Skövde|SE|58.456|13.973|Europe/Berlin|m|n|
KVG|Kavieng Airport|Kavieng|PG|-2.579|150.808|Pacific/Port_Moresby|m|s|
KVO|Morava Airport|Kraljevo|RS|43.818|20.587|Europe/Belgrade|m|s|Lađevci Airport
KVX|Pobedilovo Airport|Kirov|RU|58.504|49.348|Europe/Kirov|m|s|Аэропорт Победилово
KWA|Bucholz Army Air Field|Kwajalein|MH|8.72|167.732|Pacific/Kwajalein|m|s|
KWE|Guiyang Longdongbao International Airport|Guiyang (Nanming)|CN|26.542|106.804|Asia/Shanghai|l|s|Kaiyang Guiyang Air Base, Guiyang Air Base
KWG|Kryvyi Rih International Airport|Kryvyi Rih|UA|48.043|33.21|Europe/Kyiv|m|n|Lozuvatka International Airport, Міжнародний аеропорт Кривий Ріг
KWI|Kuwait International Airport|Kuwait City|KW|29.224|47.97|Asia/Riyadh|l|s|OKBK, Al Mubarak Air Base, مطار الكويت الدولي
KWJ|Gwangju Airport|Gwangju|KR|35.123|126.805|Asia/Seoul|m|s|
KWL|Guilin Liangjiang International Airport|Guilin (Lingui)|CN|25.22|110.04|Asia/Shanghai|l|s|
KWM|Kowanyama Airport|Kowanyama|AU|-15.485|141.753|Australia/Brisbane|m|s|
KWY|Kiwayu Airport|Kiwayu|KE|-1.961|41.297|Asia/Riyadh|m|n|Mkononi Airport
KWZ|Kolwezi Airport|Kolwezi|CD|-10.766|25.506|Africa/Johannesburg|m|s|
KXB|Sangia Nibandera Airport|Kolaka|ID|-4.338|121.524|Asia/Makassar|m|s|Kolaka, Pomala
KXE|P C Pelser Airport|Klerksdorp|ZA|-26.871|26.718|Africa/Johannesburg|m|n|
KXK|Komsomolsk-on-Amur Airport|Komsomolsk-on-Amur|RU|50.409|136.934|Asia/Vladivostok|m|s|УХКК, Komsomolsk-na-Amure Airport, Khurba Airport, Аэропорт Комсомольск-на-Амуре, Аэропорт Хурба
KYA|Konya Airport|Konya|TR|37.979|32.562|Europe/Istanbul|l|s|
KYD|Lanyu Airport|Orchid Island|TW|22.027|121.535|Asia/Taipei|m|s|Lanyu Auxiliary Station
KYE|Rene Mouawad Air Base|Tripoli|LB|34.589|36.011|Asia/Beirut|m|n|Kleyate Airport, Al Qulay'at, Qulayaat, El Qlaïaat, Ṭarābulus, مطار الرئيس الشهيد رينيه
KYP|Kyaukpyu Airport|Kyaukpyu|MM|19.426|93.535|Asia/Yangon|m|s|
KYS|Kayes Dag Dag Airport|Kayes|ML|14.483|-11.399|Africa/Abidjan|m|s|
KYZ|Kyzyl Airport|Kyzyl|RU|51.669|94.401|Asia/Krasnoyarsk|m|s|
KZI|Kozani National Airport Filippos|Kozani|GR|40.286|21.841|Europe/Athens|m|s|
KZN|Kazan International Airport|Kazan|RU|55.606|49.279|Europe/Moscow|l|s|УВКД, Казань
KZO|Korkyt Ata International Airport|Kyzylorda|KZ|44.707|65.592|Asia/Qyzylorda|l|s|Kyzylorda Southwest
KZR|Zafer Airport|Altıntaş|TR|39.111|30.13|Europe/Istanbul|m|s|
LAA|Southeast Colorado Regional Airport|Lamar|US|38.066|-102.691|America/Denver|m|n|Lamar Municipal
LAD|Quatro de Fevereiro International Airport|Luanda|AO|-8.858|13.231|Africa/Lagos|l|s|4 de Fevereiro
LAE|Nadzab Tomodachi International Airport|Lae|PG|-6.568|146.727|Pacific/Port_Moresby|l|s|MFO
LAF|Purdue University Airport|West Lafayette|US|40.413|-86.939|America/Indiana/Indianapolis|m|s|
LAI|Lannion Airport|Lannion|FR|48.754|-3.472|Europe/Paris|m|n|Servel Airport
LAJ|Lages Airport|Lages|BR|-27.782|-50.282|America/Sao_Paulo|m|s|Antônio Correia Pinto de Macedo Airport, Guarujá Federal Airport
LAL|Lakeland Linder International Airport|Lakeland|US|27.989|-82.021|America/New_York|m|s|
LAN|Capital Region International Airport|Lansing|US|42.778|-84.586|America/Detroit|m|s|Lansing Capital City, Capital City
LAO|Laoag International Airport|Laoag City|PH|18.175|120.531|Asia/Manila|l|s|Gabu Airfield, Laoag Airfield
LAP|Manuel Márquez de León International Airport|La Paz|MX|24.072|-110.363|America/Mazatlan|m|s|
LAQ|Al Abraq International Airport|Al Albraq|LY|32.789|21.955|Africa/Tripoli|l|s|Al Bayda, Beida
LAR|Laramie Regional Airport|Laramie|US|41.312|-105.675|America/Denver|m|s|
LAS|Harry Reid International Airport|Las Vegas|US|36.083|-115.152|America/Los_Angeles|l|s|McCarran International Airport
LAU|Manda Airport|Lamu|KE|-2.252|40.913|Asia/Riyadh|m|s|
LAW|Lawton Fort Sill Regional Airport|Lawton|US|34.568|-98.417|America/Chicago|m|s|
LAX|Los Angeles International Airport|Los Angeles|US|33.943|-118.408|America/Los_Angeles|l|s|Tom Bradley
LAY|Ladysmith Airport|Ladysmith|ZA|-28.582|29.75|Africa/Johannesburg|m|n|
LAZ|Bom Jesus da Lapa Airport|Bom Jesus da Lapa|BR|-13.262|-43.408|America/Bahia|m|n|
LBA|Leeds Bradford Airport|Leeds, West Yorkshire|GB|53.866|-1.661|Europe/London|l|s|
LBB|Lubbock Preston Smith International Airport|Lubbock|US|33.664|-101.823|America/Chicago|m|s|
LBC|Lübeck Blankensee Airport|Lübeck|DE|53.805|10.719|Europe/Berlin|m|s|
LBD|Khujand International Airport|Khujand|TJ|40.215|69.695|Asia/Dushanbe|l|s|Khodjend, Khodzhent, Leninabad, Khudzhand
LBE|Arnold Palmer Regional Airport|Latrobe|US|40.276|-79.405|America/New_York|m|s|
LBF|North Platte Regional Airport Lee Bird Field|North Platte|US|41.126|-100.684|America/Chicago|m|s|
LBG|Paris-Le Bourget International Airport|Paris|FR|48.962|2.437|Europe/Paris|l|n|
LBI|Albi Le Sequestre airport|Albi|FR|43.914|2.113|Europe/Paris|m|n|
LBL|Liberal Mid-America Regional Airport|Liberal|US|37.044|-100.96|America/Chicago|m|s|
LBQ|Lambarene Airport|Lambarene|GA|-0.704|10.246|Africa/Lagos|m|n|
LBS|Labasa Airport|Labasa|FJ|-16.467|179.34|Pacific/Fiji|m|s|
LBT|Lumberton Regional Airport|Lumberton|US|34.611|-79.059|America/New_York|m|n|
LBU|Labuan Airport|Labuan|MY|5.302|115.248|Asia/Makassar|m|s|
LBV|Libreville Leon M'ba International Airport|Libreville|GA|0.459|9.412|Africa/Lagos|l|s|
LBX|Lubang Airport|Lubang|PH|13.855|120.105|Asia/Manila|m|n|
LBY|La Baule-Escoublac Airport|La Baule-Escoublac|FR|47.289|-2.346|Europe/Paris|m|n|
LCA|Larnaca International Airport|Larnaca|CY|34.875|33.625|Asia/Nicosia|l|s|Διεθνές Aεροδρόμιο Λάρνακας
LCC|Lecce Galatina Air Base / Galatina Fortunato Cesari Airport|Galatina|IT|40.239|18.133|Europe/Rome|m|n|
LCE|Golosón International Airport|La Ceiba|HN|15.742|-86.853|America/Tegucigalpa|m|s|Hector C. Moncada Air Base, Guillermo Anderson International Airport
LCG|A Coruña Airport|Culleredo|ES|43.302|-8.377|Europe/Madrid|m|s|The Groyne, La Coruña
LCH|Lake Charles Regional Airport|Lake Charles|US|30.126|-93.223|America/Chicago|m|s|
LCJ|Łódź Władysław Reymont Airport|Łódź|PL|51.722|19.398|Europe/Warsaw|l|s|Lublinek
LCK|Rickenbacker International Airport|Columbus|US|39.814|-82.928|America/New_York|m|s|Lockbourne Army Air Field
LCX|Liancheng Guanzhishan Airport|Longyan (Liancheng)|CN|25.676|116.746|Asia/Shanghai|m|s|ZBSZ, Liancheng Air Base
LCY|London City Airport|London|GB|51.505|0.055|Europe/London|m|s|
LDB|Governor José Richa Airport|Londrina|BR|-23.334|-51.128|America/Sao_Paulo|m|s|Londrina Airport
LDE|Tarbes-Lourdes-Pyrénées Airport|Tarbes/Lourdes/Pyrénées|FR|43.179|-0.006|Europe/Paris|m|s|
LDS|Yichun Lindu Airport|Yichun|CN|47.752|129.019|Asia/Shanghai|m|s|Yichun Shi Airport
LDU|Lahad Datu Airport|Lahad Datu|MY|5.032|118.324|Asia/Makassar|m|s|
LDV|Landivisiau Air Base|Landivisiau|FR|48.53|-4.152|Europe/Paris|m|n|
LDX|Saint-Laurent-du-Maroni Airport|Saint-Laurent-du-Maroni|GF|5.482|-54.035|America/Cayenne|m|s|
LDY|City of Derry Airport|Derry, Derry and Strabane|GB|55.043|-7.161|Europe/London|m|s|Londonderry Eglinton Airport
LEA|Learmonth Airport|Exmouth|AU|-22.235|114.09|Australia/Perth|m|s|RAAF Learmonth
LEB|Lebanon Municipal Airport|Lebanon|US|43.626|-72.304|America/New_York|m|s|
LED|Pulkovo Airport|St. Petersburg|RU|59.8|30.263|Europe/Moscow|l|s|Аэропо́рт Пу́лково, Leningrad, Shosseynaya Airport, Saint Petersburg, Petrograd
LEE|Leesburg International Airport|Leesburg|US|28.823|-81.809|America/New_York|m|n|Leesburg AAF
LEH|Le Havre-Octeville Airport|Le Havre|FR|49.534|0.088|Europe/Paris|m|n|
LEI|Almería Airport|Almería|ES|36.844|-2.37|Europe/Madrid|m|s|
LEJ|Leipzig/Halle Airport|Schkeuditz|DE|51.421|12.233|Europe/Berlin|l|s|Schkeuditz Airport
LEN|León Airport|La Virgen del Camino|ES|42.591|-5.653|Europe/Madrid|m|s|
LER|Leinster Airport||AU|-27.843|120.703|Australia/Perth|m|s|
LET|Alfredo Vásquez Cobo International Airport|Leticia|CO|-4.191|-69.942|America/Bogota|m|s|
LEU|Pirineus - la Seu d'Urgel Airport|La Seu d'Urgell Pyrenees and Andorra|ES|42.339|1.409|Europe/Madrid|m|s|Montferrer, Castellbò
LEX|Blue Grass Airport|Lexington|US|38.035|-84.607|America/New_York|m|s|
LEY|Lelystad Airport|Lelystad|NL|52.453|5.515|Europe/Brussels|m|n|
LFI|Langley Air Force Base|Hampton|US|37.083|-76.36|America/New_York|m|n|Langley Field
LFK|Angelina County Airport|Lufkin|US|31.234|-94.75|America/Chicago|m|n|
LFM|Lamerd Airport|Lamerd|IR|27.373|53.189|Asia/Tehran|m|s|
LFQ|Linfen Yaodu Airport|Linfen (Yaodu)|CN|36.133|111.641|Asia/Shanghai|m|s|Qiaoli
LFR|La Fria Airport||VE|8.239|-72.271|America/Caracas|m|n|
LFT|Lafayette Regional Airport|Lafayette|US|30.205|-91.988|America/Chicago|m|s|
LFW|Lomé–Tokoin International Airport|Lomé|TG|6.166|1.255|Africa/Abidjan|l|s|Gnassingbe Eyadema International Airport
LGA|LaGuardia Airport|New York|US|40.777|-73.873|America/New_York|l|s|Manhattan, New York City, NYC, Glenn H. Curtiss Airport, North Beach Airport, La Guardia
LGB|Long Beach International Airport|Long Beach|US|33.817|-118.15|America/Los_Angeles|l|s|Daugherty Field
LGG|Liège Airport|Grâce-Hollogne|BE|50.639|5.444|Europe/Brussels|m|s|Bierset
LGH|Leigh Creek Airport||AU|-30.598|138.426|Australia/Adelaide|m|n|
LGI|Deadman's Cay Airport|Deadman's Cay|BS|23.179|-75.094|America/Toronto|m|s|
LGK|Langkawi International Airport|Langkawi|MY|6.33|99.729|Asia/Singapore|l|s|
LGR|Cochrane Airport|Cochrane|CL|-47.244|-72.588|America/Coyhaique|m|n|
LGS|Comodoro D.R. Salomón Airport|Malargue|AR|-35.494|-69.574|America/Argentina/Mendoza|m|n|
LGU|Logan-Cache Airport|Logan|US|41.791|-111.852|America/Denver|m|n|
LGW|London Gatwick Airport|London|GB|51.149|-0.186|Europe/London|l|s|Crawley, Charlwood
LHA|Lahr Airport|Lahr/Schwarzwald|DE|48.369|7.828|Europe/Berlin|m|n|Black Forest Airport
LHE|Allama Iqbal International Airport|Lahore|PK|31.522|74.404|Asia/Karachi|l|s|OPLR
LHG|Lightning Ridge Airport||AU|-29.453|147.977|Australia/Sydney|m|s|
LHK|Guangzhou MR Air Base / Guanghua Airport|Xiangyang (Laohekou)|CN|32.389|111.694|Asia/Shanghai|m|n|
LHL|Lachin International Airport|Lachin|AZ|39.884|46.363|Asia/Baku|m|s|
LHN|Linhares Municipal Airport|Linhares|BR|-19.355|-40.071|America/Sao_Paulo|m|n|
LHR|London Heathrow Airport|London|GB|51.471|-0.46|Europe/London|l|s|Londres
LHS|Las Heras Airport|Las Heras|AR|-46.539|-68.965|America/Argentina/Rio_Gallegos|m|s|
LHW|Lanzhou Zhongchuan International Airport|Lanzhou (Yongdeng)|CN|36.515|103.62|Asia/Shanghai|l|s|ZGC, Datong Air Base, 兰州中川国际机场
LIF|Lifou Airport|Lifou|NC|-20.775|167.239|Pacific/Noumea|m|s|
LIG|Limoges Airport|Limoges/Bellegarde|FR|45.863|1.179|Europe/Paris|m|s|
LIH|Lihue Airport|Lihue, Kauai|US|21.974|-159.337|Pacific/Honolulu|l|s|
LIL|Lille Airport|Lesquin|FR|50.567|3.102|Europe/Paris|l|s|Aéroport de Lille. Lille-Lesquin Airport
LIM|Jorge Chávez International Airport|Lima|PE|-12.022|-77.114|America/Lima|l|s|SPIM
LIN|Milano Linate Airport|Segrate|IT|45.445|9.277|Europe/Rome|l|s|E Forlanini
LIO|Limón International Airport|Limón|CR|9.958|-83.022|America/Costa_Rica|m|s|
LIP|Lins Airport|Lins|BR|-21.663|-49.73|America/Sao_Paulo|m|n|SBLN
LIQ|Lisala Airport|Lisala|CD|2.171|21.497|Africa/Lagos|m|n|
LIR|Daniel Oduber Quirós International Airport|Liberia|CR|10.593|-85.544|America/Costa_Rica|l|s|Guanacaste, Liberia International
LIS|Lisbon Humberto Delgado Airport|Lisbon|PT|38.781|-9.136|Europe/Lisbon|l|s|Lisboa, Portela
LIT|Bill & Hillary Clinton National Airport/Adams Field|Little Rock|US|34.729|-92.224|America/Chicago|m|s|
LIW|Loikaw Airport|Loikaw|MM|19.691|97.215|Asia/Yangon|m|s|
LJG|Lijiang Sanyi International Airport|Lijiang|CN|26.677|100.245|Asia/Shanghai|l|s|Yunlong Air Base, 丽江三义机场
LJN|Texas Gulf Coast Regional Airport|Angleton|US|29.109|-95.462|America/Chicago|m|n|
LJU|Ljubljana Jože Pučnik Airport|Zgornji Brnik|SI|46.224|14.458|Europe/Belgrade|l|s|Kranj
LKG|Lokichogio Airport|Lokichogio|KE|4.204|34.348|Asia/Riyadh|m|n|
LKL|Lakselv Airport, Banak|Lakselv|NO|70.069|24.973|Europe/Berlin|m|s|North Cape Airport
LKN|Leknes Airport|Leknes|NO|68.152|13.609|Europe/Berlin|m|s|Leknes lufthavn
LKO|Chaudhary Charan Singh International Airport|Lucknow|IN|26.761|80.889|Asia/Kolkata|l|s|Amausi International Airport
LKY|Lake Manyara Airport|Lake Manyara National Park|TZ|-3.376|35.818|Asia/Riyadh|m|n|
LKZ|RAF Lakenheath|Brandon, Suffolk|GB|52.41|0.561|Europe/London|m|n|
LLA|Luleå Airport|Luleå|SE|65.544|22.122|Europe/Berlin|l|s|Kallax Air Base
LLC|Cagayan North International Airport|Lal-lo|PH|18.182|121.746|Asia/Manila|m|n|Northern Cagayan, Lal-lo, Lal-lo International Airport
LLF|Yongzhou Lingling Airport|Yongzhou|CN|26.339|111.61|Asia/Shanghai|m|s|
LLV|Lüliang Dawu Airport|Lüliang|CN|37.683|111.143|Asia/Shanghai|m|s|
LLW|Kamuzu International Airport|Lumbadzi|MW|-13.789|33.781|Africa/Johannesburg|l|s|FWLI, Lilongwe International
LME|Le Mans-Arnage Airport|Le Mans, Sarthe|FR|47.949|0.202|Europe/Paris|m|n|
LMM|Valle del Fuerte International Airport|Los Mochis|MX|25.686|-109.081|America/Mazatlan|m|s|
LMN|Limbang Airport|Limbang|MY|4.808|115.01|Asia/Makassar|m|s|
LMO|RAF Lossiemouth|Lossiemouth, Moray|GB|57.705|-3.339|Europe/London|m|n|
LMP|Lampedusa Airport|Lampedusa|IT|35.498|12.618|Europe/Rome|m|s|
LMQ|Marsa al Brega Airport|Marsa al Brega|LY|30.378|19.576|Africa/Tripoli|m|n|
LMR|Lime Acres Finsch Mine Airport|Lime Acres|ZA|-28.36|23.439|Africa/Johannesburg|m|n|
LMT|Crater Lake-Klamath Regional Airport|Klamath Falls|US|42.156|-121.733|America/Los_Angeles|m|n|Klamath Falls Airport
LND|Hunt Field|Lander|US|42.815|-108.73|America/Denver|m|n|
LNJ|Lincang Boshang Airport|Lincang|CN|23.738|100.025|Asia/Shanghai|m|s|Lintsang Airfield
LNK|Lincoln Airport|Lincoln|US|40.845|-96.762|America/Chicago|m|s|Lincoln Army Air Field, Lincoln Air Force Base, 155th Air Refueling Wing, Lincoln Municpal
LNL|Longnan Chengzhou Airport|Longnan (Cheng)|CN|33.79|105.79|Asia/Shanghai|m|s|
LNO|Leonora Airport|Leonora|AU|-28.878|121.315|Australia/Perth|m|s|
LNS|Lancaster Airport|Lancaster|US|40.122|-76.296|America/New_York|m|s|
LNX|Smolensk North Airport|Smolensk|RU|54.824|32.025|Europe/Moscow|m|n|Smolensk Severny Airfield, Аэродром Смоленск Северный, ЬУБС
LNY|Lanai Airport|Lanai City|US|20.786|-156.951|Pacific/Honolulu|m|s|
LNZ|Linz-Hörsching Airport|Linz|AT|48.235|14.188|Europe/Vienna|l|s|Blue Danube Airport, Vogler Air Base, Fliegerhorst Vogler, Christophorus 10
LOE|Loei Airport||TH|17.439|101.722|Asia/Jakarta|m|s|
LOK|Lodwar Airport|Lodwar|KE|3.122|35.609|Asia/Riyadh|m|n|
LOL|Derby Field|Lovelock|US|40.066|-118.565|America/Los_Angeles|m|n|
LOO|Laghouat - Molay Ahmed Medeghri Airport|Laghouat|DZ|33.764|2.928|Africa/Algiers|m|s|
LOP|Lombok International Airport|Mataram (Pujut, Lombok Tengah)|ID|-8.76|116.278|Asia/Makassar|l|s|Zainuddin Abdul Madjid, Praya
LOS|Murtala Muhammed International Airport|Lagos|NG|6.577|3.321|Africa/Lagos|l|s|
LOU|Bowman Field|Louisville|US|38.228|-85.664|America/Kentucky/Louisville|m|n|
LOV|Monclova International Airport|Monclova|MX|26.956|-101.47|America/Monterrey|m|n|
LOZ|London-Corbin Airport/Magee Field|London|US|37.082|-84.085|America/New_York|m|n|
LPA|Gran Canaria Airport|Gran Canaria Island|ES|27.932|-15.387|Atlantic/Canary|l|s|Canary Islands, Las Palmas Airport, Gando Airport
LPB|El Alto International Airport|La Paz / El Alto|BO|-16.51|-68.189|America/Puerto_Rico|l|s|
LPF|Liupanshui Yuezhao Airport|Liupanshui (Zhongshan)|CN|26.609|104.979|Asia/Shanghai|m|s|
LPG|La Plata Airport|La Plata|AR|-34.972|-57.895|America/Argentina/Buenos_Aires|m|n|
LPI|Linköping City Airport|Linköping|SE|58.405|15.684|Europe/Berlin|l|s|
LPK|Lipetsk Airport|Lipetsk|RU|52.703|39.538|Europe/Moscow|m|n|УУОЛ, Липецк
LPL|Liverpool John Lennon Airport|Liverpool|GB|53.335|-2.85|Europe/London|l|s|
LPP|Lappeenranta Airport|Lappeenranta|FI|61.045|28.145|Europe/Helsinki|l|s|
LPQ|Luang Phabang International Airport|Luang Phabang|LA|19.904|102.167|Asia/Jakarta|l|s|
LPT|Lampang Airport||TH|18.271|99.504|Asia/Jakarta|m|s|
LPX|Liepāja International Airport|Liepāja|LV|56.518|21.097|Europe/Riga|l|n|
LRD|Laredo International Airport|Laredo|US|27.544|-99.462|America/Chicago|m|s|
LRE|Longreach Airport|Longreach|AU|-23.432|144.277|Australia/Brisbane|m|s|
LRF|Little Rock Air Force Base|Jacksonville|US|34.917|-92.15|America/Chicago|m|n|
LRH|La Rochelle Île de Ré Airport|La Rochelle|FR|46.179|-1.195|Europe/Paris|m|s|Laleu Airport
LRL|Niamtougou International Airport|Niamtougou|TG|9.767|1.091|Africa/Abidjan|l|n|
LRM|Casa De Campo International Airport|La Romana|DO|18.452|-68.911|America/Santo_Domingo|l|s|
LRR|Lar Airport|Lar|IR|27.675|54.383|Asia/Tehran|m|s|
LRT|Lorient South Brittany (Bretagne Sud) Airport|Lorient/Lann/Bihoué|FR|47.761|-3.44|Europe/Paris|m|n|
LRU|Las Cruces International Airport|Las Cruces|US|32.289|-106.922|America/Denver|m|s|
LSC|La Florida Airport|La Serena-Coquimbo|CL|-29.916|-71.2|America/Santiago|m|s|COW
LSE|La Crosse Regional Airport|La Crosse|US|43.879|-91.257|America/Chicago|m|s|
LSF|Lawson Army Air Field|Fort Benning|US|32.333|-84.988|America/New_York|m|n|Columbus
LSG|Leshan Airport|Leshan (Wutongqiao)|CN|29.439|103.749|Asia/Shanghai|m|s|
LSH|Lashio Airport|Lashio|MM|22.978|97.752|Asia/Yangon|m|s|
LSI|Sumburgh Airport|Lerwick, Shetland|GB|59.879|-1.296|Europe/London|m|s|Shetlands
LSL|Los Chiles Airport|Los Chiles|CR|11.035|-84.706|America/Costa_Rica|m|n|
LSP|Josefa Camejo International Airport|Paraguaná|VE|11.781|-70.151|America/Caracas|m|s|
LSR|Alas Leuser Airport|Kutacane|ID|3.391|97.864|Asia/Jakarta|m|s|
LST|Launceston Airport|Launceston (Western Junction)|AU|-41.545|147.211|Australia/Hobart|m|s|
LSV|Nellis Air Force Base|Las Vegas|US|36.236|-115.034|America/Los_Angeles|m|n|McCarran Field, Las Vegas AAF, Las Vegas AFB
LSX|Lhok Sukon Airport|Lhok Sukon-Sumatra Island|ID|5.07|97.259|Asia/Jakarta|m|n|Lhoksukon
LSY|Lismore Airport|Lismore|AU|-28.831|153.258|Australia/Sydney|m|s|
LTA|Tzaneen Airport|Tzaneen|ZA|-23.824|30.329|Africa/Johannesburg|m|n|
LTD|Ghadames Airport|Ghadames|LY|30.145|9.702|Africa/Tripoli|m|s|
LTH|Long Thanh International Airport (Under Construction)|Ho Chi Minh City (Long Thanh)|VN|10.773|107.041|Asia/Ho_Chi_Minh|l|n|
LTI|Altai Airport|Altai|MN|46.376|96.221|Asia/Ulaanbaatar|m|s|
LTK|Latakia International Airport|Latakia|SY|35.401|35.949|Asia/Damascus|m|s|مطار الشهيد باسل الأسد الدولي, Hmeimim Air Base
LTM|Lethem Airport|Lethem|GY|3.373|-59.789|America/Guyana|m|s|
LTN|London Luton Airport|Luton, Luton|GB|51.875|-0.368|Europe/London|l|s|
LTO|Loreto International Airport|Loreto|MX|25.99|-111.348|America/Mazatlan|l|s|
LTQ|Le Touquet-Côte d'Opale Airport|Le Touquet-Paris-Plage|FR|50.518|1.622|Europe/Paris|m|n|Paris-Plage
LTS|Altus Air Force Base|Altus|US|34.667|-99.267|America/Chicago|m|n|
LTU|Murod Kond Airport|Latur|IN|18.412|76.465|Asia/Kolkata|m|s|
LTX|Cotopaxi International Airport|Latacunga|EC|-0.907|-78.616|America/Guayaquil|m|s|Latacunga, Vulcano, Ecuador, Cargo, Long runway, Height
LUA|Tenzing-Hillary Airport|Lukla|NP|27.687|86.729|Asia/Kathmandu|m|s|Lukla, Mount Everest, Tenzing Norgay, Sir Edmund Hillary
LUD|Luderitz Airport|Luderitz|NA|-26.687|15.243|Africa/Windhoek|m|s|
LUF|Luke Air Force Base|Glendale|US|33.535|-112.383|America/Phoenix|m|n|
LUG|Lugano Airport|Agno|CH|46.004|8.911|Europe/Zurich|m|s|
LUH|Ludhiana Airport||IN|30.855|75.953|Asia/Kolkata|m|n|
LUK|Cincinnati Municipal Airport Lunken Field|Cincinnati|US|39.102|-84.419|America/New_York|m|s|
LUM|Dehong Mangshi International Airport|Dehong (Mangshi)|CN|24.401|98.532|Asia/Shanghai|m|s|
LUN|Kenneth Kaunda International Airport|Lusaka|ZM|-15.331|28.453|Africa/Johannesburg|l|s|
LUO|Luena Airport|Luena|AO|-11.768|19.898|Africa/Lagos|m|n|
LUQ|Brigadier Mayor D Cesar Raul Ojeda Airport|San Luis|AR|-33.273|-66.356|America/Argentina/San_Luis|m|s|
LUR|Cape Lisburne LRRS Airport|Cape Lisburne|US|68.875|-166.11|America/Nome|m|s|
LUV|Karel Sadsuitubun Airport|Langgur|ID|-5.76|132.759|Asia/Tokyo|m|s|Tual Baru
LUW|Syukuran Aminuddin Amir Airport|Luwok|ID|-1.036|122.774|Asia/Makassar|m|n|Bubung Airport, WAMW
LUX|Luxembourg-Findel International Airport|Luxembourg|LU|49.627|6.212|Europe/Brussels|l|s|
LUZ|Lublin Airport|Lublin|PL|51.24|22.713|Europe/Warsaw|l|s|
LVA|Laval-Entrammes Airport|Laval, Mayenne|FR|48.032|-0.744|Europe/Paris|m|n|
LVI|Harry Mwanga Nkumbula International Airport|Livingstone|ZM|-17.822|25.82|Africa/Johannesburg|l|s|FLLI
LVM|Mission Field|Livingston|US|45.699|-110.448|America/Denver|m|n|
LVP|Lavan Airport|Lavan Airport|IR|26.811|53.354|Asia/Tehran|m|n|
LVS|Las Vegas Municipal Airport|Las Vegas|US|35.654|-105.142|America/Denver|m|n|
LWB|Greenbrier Valley Airport|Lewisburg|US|37.858|-80.4|America/New_York|m|s|
LWM|Lawrence Municipal Airport|Lawrence|US|42.717|-71.123|America/New_York|m|n|
LWN|Shirak International Airport|Gyumri|AM|40.75|43.859|Asia/Yerevan|l|s|UGEL
LWO|Lviv International Airport|Lviv|UA|49.813|23.956|Europe/Kyiv|l|n|Міжнародний аеропорт Львів
LWR|Leeuwarden Air Base|Leeuwarden|NL|53.229|5.761|Europe/Brussels|m|n|
LWS|Lewiston Nez Perce County Airport|Lewiston|US|46.375|-117.015|America/Los_Angeles|m|s|
LWT|Lewistown Municipal Airport|Lewistown|US|47.048|-109.466|America/Denver|m|n|
LXA|Lhasa Gonggar International Airport|Shannan (Gonggar)|CN|29.298|90.912|Asia/Shanghai|l|s|
LXR|Luxor International Airport|Luxor|EG|25.671|32.706|Africa/Cairo|l|s|
LYA|Luoyang Beijiao Airport|Luoyang (Laocheng)|CN|34.741|112.388|Asia/Shanghai|l|s|
LYB|Edward Bodden Little Cayman Airfield|Blossom Village|KY|19.66|-80.089|America/Panama|m|n|Little Cayman Airport
LYC|Lycksele Airport|Lycksele|SE|64.548|18.716|Europe/Berlin|m|s|
LYG|Lianyungang Huaguoshan International Airport|Lianyungang|CN|34.414|119.179|Asia/Shanghai|l|s|
LYH|Lynchburg Regional Airport - Preston Glenn Field|Lynchburg|US|37.327|-79.2|America/New_York|m|s|
LYI|Linyi Qiyang Airport|Linyi (Hedong)|CN|35.053|118.412|Asia/Shanghai|m|s|
LYN|Lyon Bron Airport|Chassieu, Lyon|FR|45.728|4.944|Europe/Paris|m|n|
LYP|Faisalabad International Airport|Faisalabad|PK|31.365|72.995|Asia/Karachi|l|s|OPLF
LYR|Svalbard Airport, Longyear|Longyearbyen|NO|78.246|15.466|Europe/Berlin|m|s|
LYS|Lyon Saint-Exupéry Airport|Colombier-Saugnieu, Rhône|FR|45.726|5.09|Europe/Paris|l|s|Satolas
LYU|Ely Municipal Airport|Ely|US|47.825|-91.831|America/Chicago|m|n|
LYX|Lydd London Ashford Airport|Romney Marsh, Kent|GB|50.956|0.939|Europe/London|m|n|
LZC|Lázaro Cárdenas Airport|Lázaro Cárdenas|MX|18.002|-102.22|America/Mexico_City|m|n|
LZG|Langzhong Gucheng Airport|Nanchong (Langzhong)|CN|31.502|106.034|Asia/Shanghai|m|s|
LZH|Liuzhou Bailian Airport / Bailian Air Base|Liuzhou (Liujiang)|CN|24.207|109.391|Asia/Shanghai|m|s|Liujiang-Liuzhou Air Base
LZN|Matsu Nangan Airport|Matsu (Nangan)|TW|26.16|119.958|Asia/Taipei|m|s|
LZO|Luzhou Yunlong Airport|Luzhou (Yunlong)|CN|29.03|105.468|Asia/Shanghai|m|s|
LZY|Nyingchi Mainling Airport|Nyingchi (Mainling)|CN|29.303|94.335|Asia/Shanghai|m|s|Linzhi, Kang Ko
MAA|Chennai International Airport|Chennai|IN|12.99|80.169|Asia/Kolkata|l|s|Madras
MAB|João Correa da Rocha Airport|Marabá|BR|-5.369|-49.138|America/Belem|m|s|Marabá Airport
MAD|Adolfo Suárez Madrid–Barajas Airport|Madrid|ES|40.493|-3.572|Europe/Madrid|l|s|Leganés, Madrid Barajas International Airport
MAF|Midland International Air and Space Port|Midland|US|31.942|-102.202|America/Chicago|m|s|Midland International Airport
MAG|Madang Airport|Madang|PG|-5.207|145.789|Pacific/Port_Moresby|m|s|
MAH|Menorca Airport|Mahón (Maó)|ES|39.863|4.219|Europe/Madrid|l|s|
MAJ|Marshall Islands International Airport|Majuro Atoll|MH|7.065|171.272|Pacific/Tarawa|l|s|
MAK|Malakal International Airport|Malakal|SS|9.559|31.652|Africa/Juba|m|s|HSSM
MAM|General Servando Canales International Airport|Matamoros|MX|25.77|-97.525|America/Matamoros|m|s|
MAN|Manchester Airport|Manchester, Greater Manchester|GB|53.349|-2.28|Europe/London|l|s|Ringway Airport, RAF Ringway
MAO|Eduardo Gomes International Airport|Manaus|BR|-3.039|-60.05|America/Manaus|l|s|
MAQ|Mae Sot Airport||TH|16.7|98.545|Asia/Jakarta|m|s|
MAR|La Chinita International Airport|Maracaibo|VE|10.558|-71.729|America/Caracas|l|s|
MAS|Momote Airport|Manus Island|PG|-2.062|147.424|Pacific/Port_Moresby|m|s|
MAU|Maupiti Airport||PF|-16.427|-152.244|Pacific/Honolulu|m|s|
MAX|Ouro Sogui Airport|Ouro Sogui|SN|15.594|-13.323|Africa/Abidjan|m|n|
MAY|Clarence A. Bain Airport|Mangrove Cay|BS|24.288|-77.685|America/Toronto|m|n|
MAZ|Eugenio Maria De Hostos Airport|Mayaguez|PR|18.256|-67.148|America/Puerto_Rico|m|s|
MBA|Moi International Airport|Mombasa|KE|-4.035|39.594|Asia/Riyadh|l|s|Mombasa, Port Reitz
MBD|Mmabatho International Airport|Mafeking|ZA|-25.798|25.548|Africa/Johannesburg|m|s|Mafikeng
MBE|Monbetsu Airport|Monbetsu|JP|44.304|143.404|Asia/Tokyo|m|s|
MBG|Mobridge Municipal Airport|Mobridge|US|45.547|-100.408|America/Chicago|m|n|
MBI|Songwe Airport|Mbeya|TZ|-8.92|33.274|Asia/Riyadh|m|s|
MBJ|Sangster International Airport|Montego Bay|JM|18.503|-77.913|America/Jamaica|l|s|Montego Bay
MBO|Mamburao Airport|Mamburao|PH|13.208|120.605|Asia/Manila|m|n|
MBS|MBS International Airport|Freeland|US|43.533|-84.083|America/Detroit|m|s|Tri City Airport, Midland, Bay City, Saginaw
MBT|Moises R. Espinosa Airport|Masbate|PH|12.37|123.63|Asia/Manila|m|s|Masbate, Moises R. Espinoza
MBW|Melbourne Moorabbin Airport|Melbourne|AU|-37.978|145.1|Australia/Melbourne|m|s|Harry Hawker Airport
MBX|Maribor Edvard Rusjan Airport|Maribor|SI|46.48|15.686|Europe/Belgrade|m|s|
MCB|McComb-Pike County Airport / John E Lewis Field|McComb|US|31.178|-90.472|America/Chicago|m|n|
MCC|McClellan Airfield|Sacramento|US|38.668|-121.401|America/Los_Angeles|m|n|McClellan AFB
MCE|Merced Regional Macready Field|Merced|US|37.285|-120.514|America/Los_Angeles|m|s|
MCF|MacDill Air Force Base|Tampa|US|27.849|-82.521|America/New_York|m|n|Southeast Air Base - Tampa, MacDill Field
MCG|McGrath Airport|McGrath|US|62.953|-155.606|America/Anchorage|m|s|
MCI|Kansas City International Airport|Kansas City|US|39.302|-94.714|America/Chicago|l|s|
MCJ|Jorge Isaac Airport|La Mina-Maicao|CO|11.232|-72.49|America/Bogota|m|n|
MCK|McCook Ben Nelson Regional Airport|McCook|US|40.208|-100.593|America/Chicago|m|s|
MCN|Middle Georgia Regional Airport|Macon|US|32.693|-83.649|America/New_York|m|s|
MCO|Orlando International Airport|Orlando|US|28.429|-81.309|America/New_York|l|s|Disney World, Epcot Center
MCP|Macapá - Alberto Alcolumbre International Airport|Macapá|BR|0.051|-51.072|America/Belem|m|s|
MCS|Monte Caseros Airport|Monte Caseros|AR|-30.272|-57.64|America/Argentina/Cordoba|m|n|
MCT|Muscat International Airport|Muscat/Seeb|OM|23.6|58.285|Asia/Dubai|l|s|Seeb International Airport, Masqat, Seeb
MCU|Montluçon-Guéret Airport|Lépaud, Creuse|FR|46.223|2.364|Europe/Paris|m|n|
MCW|Mason City Municipal Airport|Mason City|US|43.16|-93.33|America/Chicago|m|s|
MCX|Makhachkala Uytash International Airport|Makhachkala|RU|42.817|47.652|Europe/Moscow|l|s|
MCY|Sunshine Coast Airport|Maroochydore|AU|-26.593|153.083|Australia/Brisbane|l|s|YBMC
MCZ|Zumbi dos Palmares International Airport|Maceió|BR|-9.513|-35.792|America/Maceio|l|s|
MDC|Sam Ratulangi International Airport|Manado|ID|1.549|124.926|Asia/Makassar|l|s|
MDE|Jose Maria Córdova International Airport|Medellín|CO|6.165|-75.423|America/Bogota|l|s|
MDG|Mudanjiang Hailang International Airport|Mudanjiang|CN|44.525|129.569|Asia/Shanghai|m|s|
MDH|Southern Illinois Airport|Murphysboro|US|37.778|-89.252|America/Chicago|m|n|Carbondale
MDI|Makurdi Airport|Makurdi|NG|7.704|8.614|Africa/Lagos|m|s|
MDK|Mbandaka Airport|Mbandaka|CD|0.023|18.289|Africa/Lagos|m|s|
MDL|Mandalay International Airport|Mandalay|MM|21.702|95.978|Asia/Yangon|l|s|
MDQ|Ástor Piazzola International Airport|Mar del Plata|AR|-37.934|-57.573|America/Argentina/Buenos_Aires|m|s|Brigadier General Bartolome De La Colina International Airport
MDT|Harrisburg International Airport|Harrisburg|US|40.193|-76.762|America/New_York|m|s|Lancaster, York, HIA, Middletown
MDU|Mendi Airport|Mendi|PG|-6.148|143.657|Pacific/Port_Moresby|m|s|
MDW|Chicago Midway International Airport|Chicago|US|41.786|-87.752|America/Chicago|l|s|
MDY|Henderson Field|Sand Island|UM|28.202|-177.381|Pacific/Pago_Pago|m|n|
MDZ|Governor Francisco Gabrielli International Airport|Mendoza|AR|-32.832|-68.793|America/Argentina/Mendoza|l|s|El Plumerillo International Airport
MEA|Macaé Benedito Lacerda Airport|Macaé|BR|-22.343|-41.766|America/Sao_Paulo|m|n|
MEB|Melbourne Essendon Airport|Essendon Fields|AU|-37.728|144.902|Australia/Melbourne|m|s|
MEC|Eloy Alfaro International Airport|Manta|EC|-0.946|-80.679|America/Guayaquil|m|s|
MED|Prince Mohammad Bin Abdulaziz Airport|Medina|SA|24.553|39.705|Asia/Riyadh|l|s|Medinah
MEE|Maré Airport|Maré|NC|-21.482|168.038|Pacific/Noumea|m|s|
MEG|Malanje Airport|Malanje|AO|-9.525|16.312|Africa/Lagos|m|s|
MEH|Mehamn Airport|Mehamn|NO|71.03|27.827|Europe/Berlin|m|s|
MEI|Key Field / Meridian Regional Airport|Meridian|US|32.333|-88.752|America/Chicago|m|s|
MEK|Bassatine Airport|Meknes|MA|33.879|-5.515|Africa/Casablanca|m|n|
MEL|Melbourne Airport|Melbourne|AU|-37.671|144.838|Australia/Melbourne|l|s|Melbourne International, Tullamarine
MEM|Frederick W. Smith International Airport|Memphis|US|35.044|-89.976|America/Chicago|l|s|
MEN|Mende-Brenoux Airfield|Mende/Brénoux|FR|44.502|3.533|Europe/Paris|m|n|
MEQ|Cut Nyak Dhien Airport|Kuala Pesisir|ID|4.041|96.253|Asia/Jakarta|m|s|
MER|Castle Airport|Merced|US|37.381|-120.568|America/Los_Angeles|m|n|
MES|Soewondo Air Force Base|Medan|ID|3.558|98.672|Asia/Jakarta|m|n|Polonia International Airport, WIMM
MEU|Monte Dourado - Serra do Areão Airport|Almeirim|BR|-0.89|-52.602|America/Santarem|m|n|
MEX|Mexico City Benito Juárez International Airport|Mexico City|MX|19.436|-99.07|America/Mexico_City|l|s|AICM, Ciudad de México
MFD|Mansfield Lahm Regional Airport|Mansfield|US|40.821|-82.517|America/New_York|m|n|
MFE|McAllen Miller International Airport|McAllen|US|26.176|-98.238|America/Chicago|m|s|
MFH|Mesquite Airport|Mesquite|US|36.833|-114.056|America/Los_Angeles|m|n|
MFK|Matsu Beigan Airport|Matsu (Beigan)|TW|26.224|120.003|Asia/Taipei|m|s|
MFM|Macau International Airport|Nossa Senhora do Carmo|MO|22.15|113.592|Asia/Hong_Kong|l|s|澳門國際機場
MFQ|Maradi Airport|Maradi|NE|13.502|7.127|Africa/Lagos|m|n|
MFR|Rogue Valley International-Medford Airport|Medford|US|42.374|-122.873|America/Los_Angeles|m|s|
MFU|Mfuwe International Airport|Mfuwe|ZM|-13.259|31.937|Africa/Johannesburg|l|s|
MGA|Augusto C. Sandino (Managua) International Airport|Managua|NI|12.142|-86.168|America/Managua|l|s|
MGB|Mount Gambier Airport|Mount Gambier|AU|-37.744|140.781|Australia/Adelaide|m|s|
MGC|Michigan City Municipal Airport|Michigan City|US|41.703|-86.821|America/Chicago|m|s|Phillips Field
MGE|Dobbins Air Reserve Base|Marietta|US|33.915|-84.516|America/New_York|m|n|Rickenbacker Field, Marietta AAF, Marietta AFB, Dobbins AFB
MGF|Regional de Maringá - Sílvio Name Júnior Airport|Maringá|BR|-23.476|-52.016|America/Sao_Paulo|m|s|SBMH.
MGH|Margate Airport|Margate|ZA|-30.857|30.343|Africa/Johannesburg|m|s|
MGL|Mönchengladbach Airport|Mönchengladbach|DE|51.23|6.504|Europe/Berlin|m|n|
MGM|Montgomery Regional (Dannelly Field) Airport|Montgomery|US|32.301|-86.394|America/Chicago|m|s|
MGN|Baracoa Airport|Magangué|CO|9.285|-74.846|America/Bogota|m|n|
MGQ|Aden Adde International Airport|Mogadishu|SO|2.014|45.305|Asia/Riyadh|l|s|HCCM
MGW|Morgantown Municipal Airport Walter L. (Bill) Hart Field|Morgantown|US|39.643|-79.918|America/New_York|m|s|
MGZ|Myeik Airport|Mkeik|MM|12.44|98.621|Asia/Yangon|m|s|
MHD|Mashhad International Airport|Mashhad|IR|36.235|59.643|Asia/Tehran|l|s|Shahid Hashemi Nejad Airport, Mashhad Shahid Hasheminejad International Airport
MHG|Mannheim-City Airport|Mannheim|DE|49.473|8.514|Europe/Berlin|m|s|
MHH|Leonard M. Thompson International Airport|Marsh Harbour|BS|26.511|-77.084|America/Toronto|m|s|Marsh Harbour International Airport
MHK|Manhattan Regional Airport|Manhattan|US|39.141|-96.671|America/Chicago|m|s|
MHQ|Mariehamn Airport|Mariehamn|FI|60.122|19.898|Europe/Helsinki|m|s|
MHR|Sacramento Mather Airport|Sacramento|US|38.555|-121.298|America/Los_Angeles|m|n|
MHT|Manchester-Boston Regional Airport|Manchester|US|42.933|-71.436|America/New_York|m|s|Manchester Airport
MHU|Mount Hotham Airport|Mount Hotham|AU|-37.048|147.334|Australia/Melbourne|m|s|
MHV|Mojave Air & Space Port|Mojave|US|35.056|-118.145|America/Los_Angeles|m|n|Rutan Field
MHZ|RAF Mildenhall|Bury Saint Edmunds, Suffolk|GB|52.362|0.486|Europe/London|m|n|
MIA|Miami International Airport|Miami|US|25.796|-80.29|America/New_York|l|s|MFW, South Florida, Wilcox Field, Pan American Field
MIB|Minot Air Force Base|Minot|US|48.416|-101.358|America/Chicago|m|n|5th Bomb Wing, 91st Space Wing
MID|Manuel Crescencio Rejón International Airport|Mérida|MX|20.93|-89.645|America/Merida|l|s|
MIE|Delaware County Johnson Field|Muncie|US|40.242|-85.396|America/Indiana/Indianapolis|m|n|
MIG|Mianyang Nanjiao Airport|Mianyang (Fucheng)|CN|31.428|104.741|Asia/Shanghai|m|s|
MII|Frank Miloye Milenkowichi–Marília State Airport|Marília|BR|-22.197|-49.926|America/Sao_Paulo|m|s|Marília Airport
MIK|Mikkeli Airport|Mikkeli|FI|61.687|27.202|Europe/Helsinki|m|n|
MIM|Merimbula Airport|Merimbula|AU|-36.909|149.901|Australia/Sydney|m|s|
MIR|Monastir Habib Bourguiba International Airport|Monastir|TN|35.758|10.755|Africa/Tunis|m|s|
MIU|Maiduguri International Airport|Maiduguri|NG|11.854|13.081|Africa/Lagos|l|s|
MIV|Millville Municipal Airport|Millville|US|39.368|-75.072|America/New_York|m|n|
MJC|Man Airport||CI|7.272|-7.587|Africa/Abidjan|m|n|
MJD|Moenjodaro Airport|Moenjodaro|PK|27.335|68.143|Asia/Karachi|m|n|
MJF|Mosjøen Airport, Kjærstad|Mosjøen|NO|65.784|13.215|Europe/Berlin|m|s|
MJI|Mitiga International Airport|Tripoli|LY|32.892|13.288|Africa/Tripoli|l|s|Mellaha Army Airfield, Okba Ben Nafi Air Base, Wheelus Air Force Base
MJK|Shark Bay Airport|Denham|AU|-25.897|113.576|Australia/Perth|m|s|Monkey Mia Airport
MJL|Mouilla Ville Airport|Mouila|GA|-1.845|11.057|Africa/Lagos|m|n|
MJM|Mbuji Mayi Airport|Mbuji Mayi|CD|-6.121|23.569|Africa/Johannesburg|m|s|
MJN|Amborovy Airport|Mahajanga|MG|-15.667|46.351|Asia/Riyadh|l|s|Philibert Tsiranana Airport, Mahajanga
MJT|Mytilene International Airport|Mytilene|GR|39.057|26.599|Europe/Athens|m|s|
MJZ|Mirny Airport|Mirny|RU|62.535|114.039|Asia/Yakutsk|m|s|
MKC|Charles B. Wheeler Downtown Airport|Kansas City|US|39.123|-94.593|America/Chicago|m|n|
MKE|General Mitchell International Airport|Milwaukee|US|42.947|-87.897|America/Chicago|l|s|
MKG|Muskegon County Airport|Muskegon|US|43.169|-86.238|America/Detroit|m|s|
MKK|Molokai Airport|Kaunakakai|US|21.153|-157.096|Pacific/Honolulu|m|s|
MKL|McKellar-Sipes Regional Airport|Jackson|US|35.6|-88.916|America/Chicago|m|s|
MKM|Mukah Airport|Mukah|MY|2.882|112.043|Asia/Makassar|m|s|
MKP|Makemo Airport|Makemo|PF|-16.584|-143.658|Pacific/Honolulu|m|s|
MKQ|Mopah International Airport|Merauke|ID|-8.524|140.42|Asia/Tokyo|m|s|
MKR|Meekatharra Airport||AU|-26.612|118.548|Australia/Perth|m|s|
MKU|Makokou Airport|Makokou|GA|0.579|12.891|Africa/Lagos|m|s|
MKW|Rendani Airport|Manokwari|ID|-0.892|134.049|Asia/Tokyo|m|s|WASR
MKY|Mackay Airport|Mackay|AU|-21.171|149.183|Australia/Brisbane|m|s|
MKZ|Malacca International Airport|Malacca|MY|2.266|102.253|Asia/Singapore|m|s|Batu Berendam
MLA|Malta International Airport|Valletta|MT|35.846|14.492|Europe/Malta|l|s|Luqa Airport, Valletta, Gudja, RAF Luqa
MLB|Melbourne Orlando International Airport|Melbourne|US|28.102|-80.641|America/New_York|m|s|
MLC|Mc Alester Regional Airport|Mc Alester|US|34.882|-95.784|America/Chicago|m|n|
MLE|Velana International Airport|Malé|MV|4.192|73.529|Indian/Maldives|l|s|Malé International Airport
MLG|Abdul Rachman Saleh Airport|Malang|ID|-7.929|112.714|Asia/Jakarta|m|s|WIAS, Malang, Singosari
MLI|Quad City International Airport|Moline|US|41.449|-90.507|America/Chicago|m|s|
MLM|General Francisco J. Mujica International Airport|Morelia|MX|19.85|-101.025|America/Mexico_City|l|s|
MLN|Melilla Airport|Melilla|ES|35.28|-2.956|Africa/Ceuta|m|s|
MLS|Miles City Airport - Frank Wiley Field|Miles City|US|46.427|-105.885|America/Denver|m|n|
MLU|Monroe Regional Airport|Monroe|US|32.511|-92.038|America/Chicago|m|s|
MLW|Spriggs Payne Airport|Monrovia|LR|6.289|-10.759|Africa/Monrovia|m|s|
MLX|Malatya Erhaç Airport|Malatya|TR|38.435|38.091|Europe/Istanbul|m|s|
MMB|Memanbetsu Airport|Ōzora|JP|43.881|144.164|Asia/Tokyo|m|s|
MMD|Minamidaito Airport|Minamidaito|JP|25.846|131.263|Asia/Tokyo|m|s|
MME|Teesside International Airport|Darlington, Durham|GB|54.509|-1.429|Europe/London|m|s|Durham Tees Valley Airport, RAF Middleton St George, Tees-Side
MMG|Mount Magnet Airport||AU|-28.116|117.842|Australia/Perth|m|s|
MMH|Mammoth Yosemite Airport|Mammoth Lakes|US|37.625|-118.843|America/Los_Angeles|m|s|
MMJ|Shinshu-Matsumoto Airport|Matsumoto|JP|36.167|137.923|Asia/Tokyo|m|s|
MMK|Emperor Nicholas II Murmansk Airport|Murmansk|RU|68.782|32.751|Europe/Moscow|l|s|Аэропо́рт Му́рманска им. Николая II or Аэропорт Мурмаши, Мурманск
MMO|Maio Airport|Vila do Maio|CV|15.156|-23.214|Atlantic/Cape_Verde|m|s|Maio Island
MMT|Mc Entire Joint National Guard Base|Eastover|US|33.921|-80.801|America/New_York|m|n|
MMU|Morristown Municipal Airport|Morristown|US|40.799|-74.415|America/New_York|m|n|Manhattan, New York City, NYC
MMX|Malmö Sturup Airport|Malmö|SE|55.536|13.376|Europe/Berlin|l|s|
MMY|Miyako Airport|Miyakojima|JP|24.783|125.295|Asia/Tokyo|m|s|
MMZ|Maymana Zahiraddin Faryabi Airport|Maymana|AF|35.931|64.761|Asia/Kabul|m|n|Maimana
MNC|Nacala International Airport|Nacala|MZ|-14.488|40.712|Africa/Johannesburg|m|s|
MNG|Maningrida Airport|Maningrida|AU|-12.056|134.234|Australia/Darwin|m|s|
MNH|Mussanah Airport|Al Masna'ah|OM|23.641|57.487|Asia/Dubai|m|n|Musanaa, Wadi al Maawil, Al Muladdah, OORQ, Rustaq Airport
MNI|John A. Osborne Airport|Gerald's Park|MS|16.792|-62.193|America/Puerto_Rico|l|s|Gerald's Airport, Brades
MNJ|Mananjary Airport|Mananjary|MG|-21.202|48.358|Asia/Riyadh|m|s|
MNL|Ninoy Aquino International Airport|Manila (Pasay)|PH|14.509|121.02|Asia/Manila|l|s|Manila International Airport, Jesus Villamor Air Base
MNR|Mongu Airport|Mongu|ZM|-15.255|23.162|Africa/Johannesburg|m|n|
MNX|Manicoré Airport|Manicoré|BR|-5.811|-61.278|America/Manaus|m|s|
MNZ|Washington Manassas Harry P. Davis Field|Manassas|US|38.723|-77.515|America/New_York|m|n|
MOA|Orestes Acosta Airport|Moa|CU|20.654|-74.922|America/Havana|m|n|
MOB|Mobile Regional Airport|Mobile|US|30.691|-88.243|America/Chicago|m|s|
MOC|Mário Ribeiro Airport|Montes Claros|BR|-16.707|-43.819|America/Sao_Paulo|m|s|Montes Claros Airport
MOD|Modesto City Co-Harry Sham Field|Modesto|US|37.626|-120.954|America/Los_Angeles|m|n|
MOE|Momeik Airport||MM|23.093|96.645|Asia/Yangon|m|n|
MOG|Mong Hsat Airport|Mong Hsat|MM|20.517|99.257|Asia/Yangon|m|s|Monghsat Airport
MOL|Molde Airport, Årø|Årø|NO|62.745|7.263|Europe/Berlin|m|s|Aro
MON|Mount Cook Airport||NZ|-43.765|170.133|Pacific/Auckland|m|n|
MOQ|Morondava Airport|Morondava|MG|-20.285|44.318|Asia/Riyadh|m|s|
MOT|Minot International Airport|Minot|US|48.258|-101.279|America/Chicago|m|s|
MOV|Moranbah Airport|Moranbah|AU|-22.058|148.077|Australia/Brisbane|m|s|
MOZ|Moorea Temae Airport|Moorea-Maiao|PF|-17.49|-149.762|Pacific/Honolulu|m|s|
MPA|Katima Mulilo Airport|Mpacha|NA|-17.634|24.177|Africa/Windhoek|m|s|FYMP
MPH|Godofredo P. Ramos Airport|Caticlan|PH|11.925|121.954|Asia/Manila|m|s|
MPL|Montpellier-Méditerranée Airport|Montpellier/Méditerranée|FR|43.576|3.963|Europe/Paris|l|s|
MPM|Maputo Airport|Maputo|MZ|-25.921|32.573|Africa/Johannesburg|l|s|
MPN|Mount Pleasant Airport / RAF Mount Pleasant|Mount Pleasant|FK|-51.823|-58.446|Atlantic/Stanley|m|s|
MPV|Edward F Knapp State Airport|Barre/Montpelier|US|44.203|-72.562|America/New_York|m|n|
MPW|Mariupol International Airport|Mariupol|UA|47.076|37.45|Europe/Kyiv|m|n|Міжнародний аеропорт Маріуполь
MPY|Maripasoula Airport|Maripasoula|GF|3.656|-54.039|America/Cayenne|m|s|
MQF|Magnitogorsk International Airport|Magnitogorsk|RU|53.392|58.755|Asia/Yekaterinburg|l|s|
MQH|Minaçu Airport|Minaçu|BR|-13.549|-48.195|America/Sao_Paulo|m|n|SBMC
MQJ|Moma Airport|Khonuu|RU|66.451|143.262|Asia/Srednekolymsk|m|s|Аэропорт Мома
MQL|Mildura Airport|Mildura|AU|-34.229|142.086|Australia/Melbourne|m|s|
MQM|Mardin Airport|Mardin|TR|37.223|40.632|Europe/Istanbul|m|s|
MQN|Mo i Rana Airport, Røssvoll|Mo i Rana|NO|66.364|14.301|Europe/Berlin|m|s|
MQP|Kruger Mpumalanga International Airport|Mbombela|ZA|-25.383|31.105|Africa/Johannesburg|l|s|
MQQ|Moundou Airport|Moundou|TD|8.629|16.074|Africa/Ndjamena|m|n|
MQS|Mustique Airport|Lovell|VC|12.888|-61.18|America/Puerto_Rico|m|s|
MQT|Marquette Sawyer Regional Airport|Gwinn|US|46.351|-87.396|America/Detroit|m|s|
MQU|Mariquita Airport|Mariquita|CO|5.213|-74.884|America/Bogota|m|n|
MQX|Mekele Alula Aba Nega Airport|Mekele|ET|13.467|39.534|Asia/Riyadh|m|s|
MQY|Smyrna Airport|Smyrna|US|36.009|-86.52|America/Chicago|m|n|Sewart AFB
MRB|Eastern WV Regional Airport/Shepherd Field|Martinsburg|US|39.402|-77.985|America/New_York|m|n|
MRD|Alberto Carnevalli Airport|Mérida|VE|8.582|-71.161|America/Caracas|m|n|
MRE|Mara Serena Lodge Airstrip|Serena|KE|-1.405|35.008|Asia/Riyadh|m|s|6100
MRG|Mareeba Airport|Mareeba|AU|-17.07|145.424|Australia/Brisbane|m|n|
MRI|Merrill Field|Anchorage|US|61.213|-149.844|America/Anchorage|m|s|
MRO|Hood Airport|Masterton|NZ|-40.975|175.635|Pacific/Auckland|m|n|
MRQ|Marinduque Airport|Gasan|PH|13.361|121.826|Asia/Manila|m|n|
MRR|Jose Maria Velasco Ibarra Airport|Macará|EC|-4.378|-79.941|America/Guayaquil|m|n|
MRS|Marseille Provence Airport|Marignane, Bouches-du-Rhône|FR|43.438|5.213|Europe/Paris|l|s|
MRU|Sir Seewoosagur Ramgoolam International Airport|Plaine Magnien|MU|-20.43|57.684|Indian/Mauritius|l|s|Plaisance International Airport
MRV|Mineralnye Vody Airport|Mineralnyye Vody|RU|44.225|43.082|Europe/Moscow|l|s|
MRW|Lolland Falster Maribo Airport|Rødby|DK|54.699|11.438|Europe/Berlin|m|n|
MRX|Mahshahr Airport|Mahshahr|IR|30.556|49.152|Asia/Tehran|m|s|
MRY|Monterey Regional Airport|Monterey|US|36.587|-121.844|America/Los_Angeles|m|s|Monterey Peninsula Airport
MRZ|Moree Airport|Moree|AU|-29.499|149.845|Australia/Sydney|m|s|
MSH|RAFO Masirah|Masirah|OM|20.675|58.89|Asia/Dubai|m|n|
MSJ|Misawa Airport / Misawa Air Base|Misawa|JP|40.703|141.368|Asia/Tokyo|m|s|
MSL|Northwest Alabama Regional Airport|Muscle Shoals|US|34.745|-87.613|America/Chicago|m|s|
MSN|Dane County Regional Truax Field|Madison|US|43.14|-89.338|America/Chicago|m|s|
MSO|Missoula Montana Airport|Missoula|US|46.916|-114.091|America/Denver|m|s|
MSP|Minneapolis–Saint Paul International Airport / Wold–Chamberlain Field|Minneapolis|US|44.88|-93.222|America/Chicago|l|s|
MSQ|Minsk National Airport|Minsk|BY|53.888|28.04|Europe/Minsk|l|s|Нацыянальны аэрапорт, Minsk 2 Airport
MSR|Muş Airport|Muş|TR|38.748|41.661|Europe/Istanbul|m|s|
MSS|Massena International Airport Richards Field|Massena|US|44.936|-74.844|America/New_York|m|s|
MST|Maastricht Aachen Airport|Maastricht|NL|50.911|5.769|Europe/Brussels|l|s|
MSU|Moshoeshoe I International Airport|Maseru(Mazenod)|LS|-29.456|27.554|Africa/Johannesburg|l|s|Mazenod
MSW|Massawa International Airport|Massawa|ER|15.67|39.37|Asia/Riyadh|m|n|
MSY|Louis Armstrong New Orleans International Airport|New Orleans|US|29.993|-90.265|America/Chicago|l|s|
MSZ|Welwitschia Mirabilis International Airport|Moçâmedes|AO|-15.261|12.147|Africa/Lagos|m|s|Moçâmedes, Namibe, Yuri Gagarin
MTC|Selfridge Air National Guard Base Airport|Mount Clemens|US|42.613|-82.837|America/Detroit|m|n|
MTH|Florida Keys Marathon International Airport|Marathon|US|24.726|-81.051|America/New_York|m|n|
MTJ|Montrose Regional Airport|Montrose|US|38.51|-107.894|America/Denver|m|s|
MTN|Martin State Airport|Baltimore|US|39.326|-76.414|America/New_York|m|n|
MTR|Los Garzones Airport|Montería|CO|8.824|-75.826|America/Bogota|m|s|
MTS|Matsapha International Airport|Manzini|SZ|-26.529|31.308|Africa/Johannesburg|m|n|
MTT|Minatitlán/Coatzacoalcos International Airport|Cosoleacaque|MX|18.103|-94.581|America/Mexico_City|m|s|
MTY|Monterrey International Airport|Monterrey|MX|25.779|-100.107|America/Monterrey|l|s|General Mariano Escobedo, Apodaca
MTZ|Bar Yehuda Airfield|Masada|IL|31.328|35.389|Asia/Jerusalem|m|n|Masada Airfield
MUA|Munda Airport|Munda|SB|-8.328|157.263|Pacific/Guadalcanal|m|s|
MUB|Maun International Airport|Maun|BW|-19.97|23.431|Africa/Johannesburg|l|s|
MUC|Munich Airport|Munich|DE|48.354|11.786|Europe/Berlin|l|s|Franz Josef Strauss Airport, Flughafen München Franz Josef Strauß
MUD|Mueda Airport|Mueda|MZ|-11.673|39.563|Africa/Johannesburg|m|n|
MUE|Waimea Kohala Airport|Waimea (Kamuela)|US|20.001|-155.668|Pacific/Honolulu|m|s|
MUH|Mersa Matruh International Airport|Marsa Matruh|EG|31.324|27.222|Africa/Cairo|l|s|
MUI|Muir Army Air Field (Fort Indiantown Gap) Airport|Fort Indiantown Gap(Annville)|US|40.435|-76.569|America/New_York|m|n|
MUN|José Tadeo Monagas International Airport|Maturín|VE|9.749|-63.153|America/Caracas|m|s|
MUO|Mountain Home Air Force Base|Mountain Home|US|43.044|-115.872|America/Boise|m|n|
MUR|Marudi Airport|Marudi|MY|4.179|114.33|Asia/Makassar|m|s|
MUW|Ghriss Airport|Ghriss|DZ|35.208|0.147|Africa/Algiers|m|n|
MUX|Multan International Airport|Multan|PK|30.203|71.419|Asia/Karachi|l|s|Multan Air Base
MVA|Mývatn Airport|Myvatn|IS|65.656|-16.918|Africa/Abidjan|m|n|Reykjahlíð
MVB|M'Vengue El Hadj Omar Bongo Ondimba International Airport|Franceville|GA|-1.656|13.438|Africa/Lagos|m|s|
MVD|Carrasco General Cesáreo L. Berisso International Airport|Ciudad de la Costa|UY|-34.836|-56.026|America/Montevideo|l|s|Montevideo
MVF|Dix-Sept Rosado Airport|Mossoró|BR|-5.202|-37.364|America/Fortaleza|m|s|Mossoró Airport
MVP|Fabio Alberto Leon Bentley Airport|Mitú|CO|1.254|-70.234|America/Bogota|m|s|
MVQ|Mogilev Airport|Mogilev|BY|53.955|30.095|Europe/Minsk|m|s|
MVR|Salak Airport|Maroua|CM|10.451|14.257|Africa/Lagos|m|s|
MVT|Mataiva Airport||PF|-14.868|-148.717|Pacific/Honolulu|m|s|
MVZ|Masvingo International Airport|Masvingo|ZW|-20.055|30.859|Africa/Johannesburg|m|n|
MWA|Veterans Airport of Southern Illinois|Marion|US|37.751|-89.017|America/Chicago|m|s|Williamson County Regional Airport
MWD|Mianwali Air Base|Mianwali|PK|32.563|71.571|Asia/Karachi|m|n|
MWE|Merowe Airport|Merowe|SD|18.443|31.843|Africa/Khartoum|m|n|Merowe International
MWH|Grant County International Airport|Moses Lake|US|47.208|-119.32|America/Los_Angeles|m|n|LRN, Larson AFB, Moses Lake AFB, Moses Lake AAB
MWL|Mineral Wells Regional Airport|Mineral Wells|US|32.782|-98.06|America/Chicago|m|s|CWO, Fort Wolters AAF.
MWX|Muan International Airport|Muan (Piseo-ri)|KR|34.991|126.383|Asia/Seoul|l|s|Gwangju, Mokpo, MWX, RKJB
MWZ|Mwanza International Airport|Mwanza|TZ|-2.447|32.936|Asia/Riyadh|l|s|
MXF|Maxwell Air Force Base|Montgomery|US|32.383|-86.366|America/Chicago|m|n|
MXI|Mati National Airport|Mati|PH|6.949|126.274|Asia/Manila|m|n|Imelda R. Marcos, Tugpahanan sa Mati, Paliparan ng Mati
MXJ|Minna Airport|Minna|NG|9.652|6.462|Africa/Lagos|m|n|
MXL|General Rodolfo Sánchez Taboada International Airport|Mexicali|MX|32.631|-115.243|America/Tijuana|m|s|Mexicali Airport, Aeropuerto Internacional Gral. Rodolfo Sánchez Taboada
MXM|Morombe Airport|Morombe|MG|-21.754|43.375|Asia/Riyadh|m|n|
MXN|Morlaix-Ploujean Airport|Morlaix/Ploujean|FR|48.603|-3.816|Europe/Paris|m|n|
MXP|Milan Malpensa International Airport|Ferno|IT|45.631|8.728|Europe/Rome|l|s|Silvio Berlusconi
MXV|Mörön Airport|Mörön|MN|49.664|100.1|Asia/Ulaanbaatar|m|s|Muren, Murun
MXX|Mora Airport|Mora|SE|60.958|14.511|Europe/Berlin|m|s|
MYA|Moruya Airport|Moruya|AU|-35.898|150.144|Australia/Sydney|m|s|RAAF Moruya
MYC|Escuela Mariscal Sucre Airport|Maracay|VE|10.25|-67.649|America/Caracas|m|n|
MYD|Malindi International Airport|Malindi|KE|-3.229|40.102|Asia/Riyadh|m|s|
MYE|Miyakejima Airport|Miyakejima|JP|34.074|139.56|Asia/Tokyo|m|s|
MYG|Mayaguana Airport|Abraham Bay Settlement|BS|22.379|-73.013|America/Toronto|m|s|
MYJ|Matsuyama Airport|Matsuyama|JP|33.827|132.7|Asia/Tokyo|l|s|
MYL|McCall Municipal Airport|McCall|US|44.889|-116.101|America/Boise|m|s|
MYP|Mary International Airport|Mary|TM|37.624|61.896|Asia/Ashgabat|m|s|
MYQ|Mysore Airport|Mysore|IN|12.23|76.654|Asia/Kolkata|m|s|Mysuru, Mandakalli airport
MYR|Myrtle Beach International Airport|Myrtle Beach|US|33.68|-78.928|America/New_York|l|s|
MYT|Myitkyina Airport|Myitkyina|MM|25.384|97.352|Asia/Yangon|m|s|
MYU|Mekoryuk Airport|Mekoryuk|US|60.372|-166.27|America/Nome|m|s|
MYV|Yuba County Airport|Marysville|US|39.098|-121.57|America/Los_Angeles|m|n|Marysville AAF
MYW|Mtwara Airport|Mtwara|TZ|-10.336|40.182|Asia/Riyadh|m|s|
MYY|Miri Airport|Miri|MY|4.322|113.987|Asia/Makassar|m|s|
MZB|Mocímboa da Praia Airport|Mocímboa da Praia|MZ|-11.362|40.355|Africa/Johannesburg|m|n|
MZG|Penghu Magong Airport|Huxi|TW|23.569|119.628|Asia/Taipei|l|s|Makung
MZH|Amasya Merzifon Airport|Amasya|TR|40.829|35.522|Europe/Istanbul|m|s|
MZI|Mopti Airport|Sévaré|ML|14.513|-4.08|Africa/Abidjan|m|s|Barbe Airport, Ambodédjo Airport
MZL|La Nubia Airport|Manizales|CO|5.03|-75.465|America/Bogota|m|s|
MZO|Sierra Maestra International Airport|Manzanillo|CU|20.289|-77.088|America/Havana|m|s|
MZQ|Mkuze Airport|Mkuze|ZA|-27.626|32.044|Africa/Johannesburg|m|s|Mkuzi Airport, eMkhuze, uMkhuze, Mkhuze
MZR|Mazar-i-Sharif International Airport|Mazar-i-Sharif|AF|36.704|67.21|Asia/Kabul|l|s|Mazari Sharif
MZS|Moradabad Airport|Moradabad|IN|28.817|78.922|Asia/Kolkata|m|s|
MZT|General Rafael Buelna International Airport|Mazatlàn|MX|23.163|-106.265|America/Mazatlan|l|s|
MZU|Muzaffarpur Airport|Muzaffarpur|IN|26.119|85.314|Asia/Kolkata|m|n|
MZV|Mulu Airport|Mulu|MY|4.048|114.805|Asia/Makassar|m|s|
MZW|Mecheria Airport|Mecheria|DZ|33.536|-0.242|Africa/Algiers|m|s|
NAA|Narrabri Airport|Narrabri|AU|-30.319|149.827|Australia/Sydney|m|s|
NAG|Dr. Babasaheb Ambedkar International Airport|Nagpur|IN|21.092|79.047|Asia/Kolkata|l|s|Sonegaon Airport, Sonegaon Air Force Station
NAH|Naha Airport|Tabukan Utara, Sangihe Islands|ID|3.685|125.527|Asia/Makassar|m|s|Tahuna
NAJ|Nakhchivan International Airport|Nakhchivan|AZ|39.189|45.458|Asia/Baku|l|s|Nakhichevan Airport, Аэропорт Нахичевань, UB15
NAK|Nakhon Ratchasima Airport|Chaloem Phra Kiat|TH|14.95|102.313|Asia/Jakarta|m|n|
NAL|Nalchik Airport|Nalchik|RU|43.513|43.637|Europe/Moscow|m|s|УРМН, Нальчик
NAM|Namniwel Airport|Namniwel|ID|-3.143|126.976|Asia/Tokyo|m|s|
NAN|Nadi International Airport|Nadi|FJ|-17.762|177.438|Pacific/Fiji|l|s|
NAP|Naples International Airport|Napoli|IT|40.886|14.291|Europe/Rome|l|s|Capodichino Airport, Aeroporto Internazionale di Napoli-Capodichino Ugo Niutta, Ariopuorto 'nternazziunale 'e Napule-Capodichino Ugo Niutta
NAQ|Qaanaaq Airport|Qaanaaq|GL|77.489|-69.389|America/Thule|m|s|Mittarfik Qaanaaq, Thule
NAS|Lynden Pindling International Airport|Nassau|BS|25.039|-77.466|America/Toronto|l|s|Windsor Field, Nassau International Airport
NAT|Rio Grande do Norte/São Gonçalo do Amarante–Governador Aluízio Alves International Airport|Natal|BR|-5.77|-35.367|America/Fortaleza|l|s|Greater Natal International Airport, Augusto Severo International Airport
NAV|Nevşehir Kapadokya Airport|Nevşehir|TR|38.772|34.535|Europe/Istanbul|l|s|
NAW|Narathiwat Airport||TH|6.52|101.743|Asia/Jakarta|m|s|
NBC|Begishevo Airport|Nizhnekamsk|RU|55.565|52.092|Europe/Moscow|m|s|УВКЕ, Бегишево, Нижнекамск
NBE|Enfidha - Hammamet International Airport|Enfidha|TN|36.076|10.439|Africa/Tunis|m|s|DTNH
NBG|New Orleans NAS JRB/Alvin Callender Field|New Orleans|US|29.825|-90.035|America/Chicago|m|n|
NBJ|Dr. Antonio Agostinho Neto International Airport|Luanda (Ícolo e Bengo)|AO|-9.051|13.499|Africa/Lagos|l|s|Novo Aeroporto Internacional de Luanda
NBO|Jomo Kenyatta International Airport|Nairobi|KE|-1.319|36.928|Asia/Riyadh|l|s|Jkia Airport, Embakasi Airport, Nairobi International Airport
NBS|Changbaishan Airport|Baishan|CN|42.067|127.602|Asia/Shanghai|m|s|
NBW|Leeward Point Field|Guantanamo Bay Naval Station|CU|19.907|-75.207|America/New_York|m|n|Gitmo, Leeward Point Fld
NBX|Douw Aturure Airport|Nabire|ID|-3.398|135.393|Asia/Tokyo|m|n|
NCA|North Caicos Airport|North Caicos|TC|21.916|-71.943|America/Grand_Turk|m|s|
NCE|Nice-Côte d'Azur Airport|Nice, Alpes-Maritimes|FR|43.658|7.216|Europe/Paris|l|s|
NCL|Newcastle International Airport|Newcastle upon Tyne, Tyne and Wear|GB|55.038|-1.69|Europe/London|l|s|
NCO|Quonset State Airport|North Kingstown|US|41.597|-71.412|America/New_York|m|n|Quonset Point NAS
NCS|Newcastle Airport|Newcastle|ZA|-27.771|29.977|Africa/Johannesburg|m|n|
NCU|Nukus International Airport|Nukus|UZ|42.488|59.623|Asia/Samarkand|l|s|Nokis, UTNN
NCY|Annecy Meythet airport|Annecy|FR|45.929|6.099|Europe/Paris|m|s|Annecy-Meythet
NDB|Nouadhibou International Airport|Nouadhibou|MR|20.932|-17.03|Africa/Abidjan|l|s|
NDC|Nanded Airport|Nanded|IN|19.183|77.317|Asia/Kolkata|m|s|
NDD|Sumbe Airport|Sumbe|AO|-11.168|13.848|Africa/Lagos|m|n|
NDG|Qiqihar Sanjiazi Airport|Qiqihar|CN|47.23|123.914|Asia/Shanghai|l|s|齐齐哈尔, 齐齐哈尔三家子机场
NDJ|N'Djamena International Airport|N'Djamena|TD|12.134|15.034|Africa/Ndjamena|l|s|Ndjamena Hassan Djamous
NDR|Nador Al Aaroui International Airport|Al Aaroui|MA|34.989|-3.028|Africa/Casablanca|l|s|Al Aroui International Airport, Arwi
NDU|Rundu Airport|Rundu|NA|-17.956|19.719|Africa/Windhoek|m|s|
NEC|Necochea Airport|Necochea|AR|-38.491|-58.816|America/Argentina/Buenos_Aires|m|s|
NEL|Lakehurst Maxfield Field Airport|Lakehurst|US|40.033|-74.353|America/New_York|m|n|Hindenburg, Lakehurst NAES, Lakehurst Naval Air Engineering Station
NER|Chulman Airport|Neryungri|RU|56.914|124.914|Asia/Yakutsk|m|s|Neryungri Airport, Аэропорт Чульман, Аэропорт Нерюнгри, CNN
NEU|Sam Neua Airport||LA|20.418|104.067|Asia/Jakarta|m|n|
NEV|Vance W. Amory International Airport|Charlestown|KN|17.206|-62.59|America/Puerto_Rico|m|s|Nevis, Bambooshay Airport, Newcastle Airport
NEW|Lakefront Airport|New Orleans|US|30.042|-90.028|America/Chicago|m|n|
NFG|Nefteyugansk Airport|Nefteyugansk|RU|61.108|72.65|Asia/Yekaterinburg|m|n|УСРН, Аэропорт Нефтеюганск
NFL|Fallon Naval Air Station|Fallon|US|39.417|-118.701|America/Los_Angeles|m|n|Van Voorhis Field, Fallon NAS
NGA|Young Airport||AU|-34.256|148.247|Australia/Sydney|m|n|
NGB|Ningbo Lishe International Airport|Ningbo|CN|29.827|121.462|Asia/Shanghai|l|s|
NGE|N'Gaoundéré Airport|N'Gaoundéré|CM|7.357|13.559|Africa/Lagos|m|s|Ngaoundere
NGF|Kaneohe Bay MCAS (Marion E. Carl Field) Airport|Kaneohe|US|21.451|-157.768|Pacific/Honolulu|m|n|
NGO|Chubu Centrair International Airport|Tokoname|JP|34.858|136.805|Asia/Tokyo|l|s|
NGP|Naval Air Station Corpus Christi Truax Field|Corpus Christi|US|27.693|-97.291|America/Chicago|m|n|
NGQ|Ngari Gunsa Airport|Shiquanhe|CN|32.098|80.054|Asia/Shanghai|m|s|Ali Airport
NGS|Nagasaki Airport|Nagasaki|JP|32.917|129.914|Asia/Tokyo|l|s|
NGU|Norfolk Naval Station (Chambers Field)|Norfolk|US|36.938|-76.289|America/New_York|m|n|
NHD|Al Minhad Air Base|Dubai|AE|25.027|55.366|Asia/Dubai|m|n|
NHK|Patuxent River Naval Air Station (Trapnell Field)|Patuxent River|US|38.286|-76.412|America/New_York|m|n|
NHT|RAF Northolt|Northolt, Greater London|GB|51.553|-0.418|Europe/London|m|n|
NHV|Nuku Hiva Airport|Nuku Hiva|PF|-8.796|-140.229|Pacific/Marquesas|m|s|
NHZ|Brunswick Executive Airport|Brunswick|US|43.892|-69.939|America/New_York|m|n|KHNZ, Brunswick NAS
NIM|Diori Hamani International Airport|Niamey|NE|13.482|2.184|Africa/Lagos|l|s|
NIP|Jacksonville Naval Air Station (Towers Field)|Jacksonville|US|30.236|-81.681|America/New_York|m|n|
NIT|Niort - Marais Poitevin Airport|Niort/Souché|FR|46.313|-0.395|Europe/Paris|m|n|
NJA|JMSDF Atsugi Air Base / Naval Air Facility Atsugi|Ayase / Yamato|JP|35.455|139.45|Asia/Tokyo|m|n|Atsugi NAF
NJC|Nizhnevartovsk Airport|Nizhnevartovsk|RU|60.949|76.484|Asia/Yekaterinburg|l|s|
NJF|Al Najaf International Airport|Najaf|IQ|31.991|44.405|Asia/Baghdad|l|s|
NJK|El Centro NAF Airport (Vraciu Field)|El Centro|US|32.829|-115.672|America/Los_Angeles|m|n|Naval Air Facility El Centro, MCAS El Centro
NKC|Nouakchott–Oumtounsy International Airport|Nouakchott|MR|18.31|-15.97|Africa/Abidjan|l|s|
NKG|Nanjing Lukou International Airport|Nanjing|CN|31.735|118.866|Asia/Shanghai|l|s|
NKM|Nagoya Airport / JASDF Komaki Air Base|Nagoya|JP|35.256|136.924|Asia/Tokyo|m|s|Komaki Airport, Nagoya Airfield, 名古屋飛行場, Prefectural Nagoya Airport
NKT|Şırnak Şerafettin Elçi Airport|Şırnak|TR|37.365|42.058|Europe/Istanbul|m|s|
NKW|Naval Support Facility Diego Garcia|Diego Garcia|IO|-7.313|72.411|Indian/Chagos|m|n|Chagos, NSF Diego Garcia
NKX|Miramar Marine Corps Air Station - Mitscher Field|San Diego|US|32.868|-117.143|America/Los_Angeles|m|n|Miramar MCAS
NLA|Simon Mwansa Kapwepwe International Airport|Ndola|ZM|-12.965|28.516|Africa/Johannesburg|l|s|
NLC|Lemoore Naval Air Station (Reeves Field) Airport|Lemoore|US|36.333|-119.952|America/Los_Angeles|m|n|
NLD|Quetzalcóatl International Airport|Nuevo Laredo|MX|27.444|-99.571|America/Matamoros|m|s|
NLH|Ninglang Luguhu Airport|Ninglang|CN|27.54|100.759|Asia/Shanghai|m|s|
NLI|Nikolayevsk-na-Amure Airport|Nikolayevsk-na-Amure Airport|RU|53.155|140.65|Asia/Vladivostok|m|s|Nikolaevsk-na-Amure Airport, Nikolayevsk-on-Amur Airport, Аэропорт Николаевск-на-Амуре
NLK|Norfolk Island International Airport|Burnt Pine|NF|-29.042|167.939|Pacific/Norfolk|m|s|
NLO|Ndolo Airport|N'dolo|CD|-4.327|15.328|Africa/Lagos|m|n|N'Dolo Airport
NLT|Xinyuan Nalati Airport|Xinyuan|CN|43.432|83.379|Asia/Shanghai|m|s|
NLU|Felipe Ángeles International Airport|Mexico City|MX|19.744|-99.015|America/Mexico_City|l|s|Santa Lucia AFB, Mexico City Santa Lucía Airport, Zumpango, Aeropuerto Internacional General Felipe Ángeles
NLV|Mykolaiv International Airport [CLOSED]|Mykolaiv|UA|47.058|31.92|Europe/Kyiv|m|n|Nikolayev Airport, Nikolaev Airport, Аэропорт Николаев, Nikolayev, UKON, NLV
NMA|Namangan International Airport|Namangan|UZ|40.985|71.558|Asia/Tashkent|l|s|UTFN, UTKN
NMB|Daman Airport|Daman|IN|20.434|72.843|Asia/Kolkata|m|n|
NMC|Normans Cay Airport|Normans Cay|BS|24.594|-76.82|America/Toronto|m|n|
NMF|Maafaru International Airport|Noonu Atoll|MV|5.817|73.468|Indian/Maldives|m|s|
NMI|Navi Mumbai International Airport|Navi Mumbai|IN|18.985|73.065|Asia/Kolkata|l|s|D. B. Patil, new airport
NMS|Namsang Airport|Namsang|MM|20.89|97.736|Asia/Yangon|m|n|
NNA|Kenitra Air Base|Kenitra|MA|34.299|-6.596|Africa/Casablanca|m|n|GMMY, Craw Field, Naval Air Station Port Lyautey
NNG|Nanning Wuxu International Airport|Nanning (Jiangnan)|CN|22.598|108.182|Asia/Shanghai|l|s|南宁吴圩机场, Nanning Wuxu Air Base
NNM|Naryan Mar Airport|Naryan Mar|RU|67.64|53.122|Europe/Moscow|m|s|Нарья́н-Мар
NNT|Nan Airport||TH|18.808|100.783|Asia/Jakarta|m|s|
NOA|Naval Air Station Nowra - HMAS Albatross|Nowra Hill|AU|-34.947|150.542|Australia/Sydney|m|n|
NOB|Nosara Airport|Nicoya|CR|9.976|-85.653|America/Costa_Rica|m|s|
NOC|Ireland West Airport Knock|Charlestown|IE|53.91|-8.817|Europe/London|l|s|Connaught, Horan International Airport
NOG|Nogales International Airport|Nogales|MX|31.226|-110.977|America/Hermosillo|m|n|
NOI|Krymsk Air Base|Krymsk|RU|44.963|37.999|Europe/Moscow|m|n|Аэродром Крымск, ЬРКВ, Krimskaja II, Novorossiysk
NOJ|Noyabrsk Airport|Noyabrsk|RU|63.183|75.27|Asia/Yekaterinburg|m|s|
NOP|Sinop Airport|Sinop|TR|42.018|35.072|Europe/Istanbul|m|s|SIC
NOS|Nosy Be International Airport|Nosy Be|MG|-13.312|48.315|Asia/Riyadh|l|s|Fascene Airport
NOU|La Tontouta International Airport|Nouméa (La Tontouta)|NC|-22.015|166.213|Pacific/Noumea|l|s|Aéroport de Nouméa - La Tontouta
NOV|Albano Machado Airport|Huambo|AO|-12.809|15.761|Africa/Lagos|m|s|Nova Lisboa Airport
NOZ|Spichenkovo Airport|Novokuznetsk|RU|53.811|86.877|Asia/Novokuznetsk|m|s|
NPA|Naval Air Station Pensacola Forrest Sherman Field|Pensacola|US|30.353|-87.319|America/Chicago|m|n|NAS, KNAS
NPE|Hawke's Bay Airport|Napier|NZ|-39.466|176.87|Pacific/Auckland|m|s|
NPL|New Plymouth Airport|New Plymouth|NZ|-39.009|174.179|Pacific/Auckland|m|s|
NPO|Nanga Pinoh Airport|Nanga Pinoh-Borneo Island|ID|-0.349|111.746|Asia/Pontianak|m|s|Nangapinoh
NPT|Newport State Airport|Newport|US|41.532|-71.281|America/New_York|m|s|2B4
NQA|Millington-Memphis Airport|Millington|US|35.357|-89.87|America/Chicago|m|n|Millington Municipal, NAS Memphis, Millington Regional Jetport
NQI|Kingsville Naval Air Station|Kingsville|US|27.507|-97.81|America/Chicago|m|n|
NQN|Presidente Perón International Airport|Neuquén|AR|-38.949|-68.156|America/Argentina/Salta|l|s|
NQT|Nottingham City Airport|Nottingham, Nottinghamshire|GB|52.92|-1.079|Europe/London|m|n|
NQX|Naval Air Station Key West/Boca Chica Field|Key West|US|24.576|-81.689|America/New_York|m|n|
NQY|Cornwall Airport Newquay|Newquay|GB|50.441|-4.995|Europe/London|m|s|St Mawgan, EGDG
NQZ|Nursultan Nazarbayev International Airport|Astana|KZ|51.027|71.467|Asia/Almaty|l|s|TSE, Astana Airport
NRA|Narrandera Airport|Narrandera|AU|-34.702|146.512|Australia/Sydney|m|s|
NRB|Naval Station Mayport / Admiral David L McDonald Field|Jacksonville|US|30.391|-81.425|America/New_York|m|n|
NRK|Norrköping Airport|Norrköping|SE|58.586|16.251|Europe/Berlin|m|s|Kungsangen
NRN|Weeze (Niederrhein) Airport|Weeze|DE|51.601|6.141|Europe/Berlin|l|s|LRC, ETUL, Niederrhein Airport, RAF Laarbruch, Düsseldorf Regional
NRR|José Aponte de la Torre Airport|Ceiba|PR|18.247|-65.64|America/Puerto_Rico|m|s|Ceiba International Airport, NAS Roosevelt Roads, NRR, TJNR
NRT|Narita International Airport|Narita|JP|35.769|140.389|Asia/Tokyo|l|s|TYO, Tokyo, Tokyo Narita Airport, New Tokyo International Airport, 成田国際空港, 成田空港, 東京都, 東京成田
NSE|Whiting Field Naval Air Station - North|Milton|US|30.724|-87.022|America/Chicago|m|n|
NSH|Nowshahr Airport|Nowshahr|IR|36.664|51.463|Asia/Tehran|m|s|Noshahr
NSI|Yaoundé Nsimalen International Airport|Yaoundé|CM|3.723|11.553|Africa/Lagos|l|s|
NSK|Alykel International Airport|Norilsk|RU|69.308|87.326|Asia/Krasnoyarsk|l|s|
NSN|Nelson Airport|Nelson|NZ|-41.297|173.224|Pacific/Auckland|m|s|
NST|Nakhon Si Thammarat Airport|Nakhon Si Thammarat|TH|8.54|99.945|Asia/Jakarta|m|s|ท่าอากาศยานนครศรีธรรมราช
NTB|Notodden Airport|Notodden|NO|59.565|9.213|Europe/Berlin|m|n|
NTD|Point Mugu Naval Air Station (Naval Base Ventura Co)|Point Mugu|US|34.12|-119.121|America/Los_Angeles|m|n|
NTE|Nantes Atlantique Airport|Nantes|FR|47.153|-1.611|Europe/Paris|l|s|
NTG|Nantong Xingdong International Airport|Nantong (Tongzhou)|CN|32.074|120.98|Asia/Shanghai|m|s|
NTL|Newcastle Airport|Williamtown|AU|-32.796|151.835|Australia/Sydney|l|s|RAAF Base Williamtown, Williamtown Airport
NTN|Normanton Airport|Normanton|AU|-17.684|141.07|Australia/Brisbane|m|s|
NTQ|Noto Satoyama Airport|Wajima|JP|37.293|136.962|Asia/Tokyo|m|s|Wajima
NTR|Del Norte International Airport|Monterrey|MX|25.866|-100.237|America/Monterrey|m|n|BAM 14 Monterrey/Apodaca
NTU|Oceana Naval Air Station|Virginia Beach|US|36.821|-76.034|America/New_York|m|n|Apollo Soucek Field
NTX|Ranai Airport|Ranai-Natuna Besar Island|ID|3.909|108.388|Asia/Jakarta|m|s|WION, Natuna, Natuna-Ranai, Raden Sadjad
NTY|Pilanesberg International Airport|Pilanesberg|ZA|-25.334|27.173|Africa/Johannesburg|m|n|
NUE|Nuremberg Airport|Nuremberg|DE|49.499|11.078|Europe/Berlin|l|s|Nürnberg
NUI|Nuiqsut Airport|Nuiqsut|US|70.21|-151.006|America/Anchorage|m|s|10AK
NUJ|Nojeh Air Base|Amirabad|IR|35.212|48.653|Asia/Tehran|m|n|Hamadan Air Base, Shahrokhi
NUM|Neom Bay Airport|Sharma|SA|27.924|35.294|Asia/Riyadh|l|s|Sharma
NUQ|Moffett Federal Airfield|Mountain View|US|37.416|-122.049|America/Los_Angeles|m|n|
NUU|Nakuru Lanet Airport|Nakuru|KE|-0.298|36.159|Asia/Riyadh|m|n|Lanet Military Airstrip
NUW|Whidbey Island Naval Air Station (Ault Field)|Oak Harbor|US|48.352|-122.656|America/Los_Angeles|m|n|
NUX|Novy Urengoy Airport|Novy Urengoy|RU|66.069|76.52|Asia/Yekaterinburg|m|s|
NVA|Benito Salas Airport|Neiva|CO|2.95|-75.294|America/Bogota|m|s|La Manguita
NVI|Navoi International Airport|Navoi|UZ|40.118|65.173|Asia/Samarkand|m|s|UTSA
NVS|Nevers-Fourchambault Airport|Marzy, Nièvre|FR|47.003|3.113|Europe/Paris|m|n|
NVT|Ministro Victor Konder International Airport|Navegantes|BR|-26.879|-48.651|America/Sao_Paulo|l|s|
NWA|Mohéli Bandar Es Eslam Airport|Fomboni|KM|-12.298|43.766|Asia/Riyadh|m|n|Mwali, Bandaressalam
NWI|Norwich Airport|Norwich, Norfolk|GB|52.676|1.283|Europe/London|m|s|RAF Horsham St Faith
NYA|Nyagan Airport|Nyagan|RU|62.11|65.615|Asia/Yekaterinburg|m|s|УСХН, Аэропорт Нягань
NYG|Quantico Marine Corps Airfield / Turner Field|Quantico|US|38.502|-77.305|America/New_York|m|n|
NYI|Sunyani Airport|Sunyani|GH|7.362|-2.329|Africa/Abidjan|m|s|Bono Airport
NYK|Nanyuki Civil Airport|Gathiuru|KE|-0.062|37.041|Asia/Riyadh|m|s|
NYM|Nadym Airport|Nadym|RU|65.481|72.699|Asia/Yekaterinburg|m|s|Аэропорт Надым
NYO|Stockholm Skavsta Airport|Nyköping|SE|58.79|16.911|Europe/Berlin|l|s|
NYT|Nay Pyi Taw International Airport|Naypyitaw|MM|19.624|96.201|Asia/Yangon|l|s|VYEL, Ela
NZC|Maria Reiche Neuman Airport|Nazca|PE|-14.854|-74.962|America/Lima|m|s|
NZH|Manzhouli Xijiao Airport|Manzhouli|CN|49.567|117.33|Asia/Shanghai|m|s|
NZL|Zhalantun Genghis Khan Airport|Zhalantun|CN|47.866|122.769|Asia/Shanghai|m|s|Chengjisihan
NZY|North Island Naval Air Station-Halsey Field|San Diego|US|32.699|-117.215|America/Los_Angeles|m|n|
OAG|Orange Airport|Orange|AU|-33.382|149.131|Australia/Sydney|m|n|
OAI|Bagram Airfield|Bagram|AF|34.946|69.265|Asia/Kabul|m|n|Bagram Air Base
OAJ|Albert J Ellis Airport|Richlands|US|34.829|-77.612|America/New_York|m|s|
OAK|Oakland San Francisco Bay Airport|Oakland|US|37.72|-122.221|America/Los_Angeles|l|s|Metro Oakland International
OAM|Oamaru Airport||NZ|-44.97|171.082|Pacific/Auckland|m|n|
OAX|Xoxocotlán International Airport|Oaxaca|MX|16.999|-96.726|America/Mexico_City|l|s|Aeropuerto Internacional Xoxocotlán, Oaxaca International Airport
OBF|Oberpfaffenhofen Airport|Weßling|DE|48.081|11.283|Europe/Berlin|m|n|Weßling
OBO|Tokachi-Obihiro Airport|Obihiro|JP|42.733|143.217|Asia/Tokyo|m|s|
OBS|Aubenas-South Ardèche Airport|Lanas, Ardèche|FR|44.544|4.372|Europe/Paris|m|n|Aubenas Ardèche Méridionale
OCA|Ocean Reef Club Airport|Key Largo|US|25.325|-80.275|America/New_York|m|n|
OCC|Francisco De Orellana Airport|Coca|EC|-0.463|-76.987|America/Guayaquil|m|s|
OCE|Ocean City Municipal Airport|Ocean City|US|38.31|-75.124|America/New_York|m|s|
OCJ|Ian Fleming International Airport|Boscobel|JM|18.404|-76.97|America/Jamaica|m|s|Boscobel Aerodrome
OCN|Oceanside Municipal Airport|Oceanside|US|33.218|-117.352|America/Los_Angeles|m|n|Bob Maxwell Field
OCS|Corisco International Airport|Corisco Island|GQ|0.911|9.33|Africa/Lagos|l|s|
OCV|Aguas Claras Airport|Ocaña|CO|8.315|-73.358|America/Bogota|m|n|
ODB|Córdoba Airport|Córdoba|ES|37.842|-4.849|Europe/Madrid|m|s|
ODE|Odense Hans Christian Andersen Airport|Odense|DK|55.475|10.327|Europe/Berlin|l|s|Beldringe
ODH|RAF Odiham|Hook, Hampshire|GB|51.234|-0.943|Europe/London|m|n|
ODS|Odesa International Airport|Odesa|UA|46.427|30.673|Europe/Kyiv|l|n|ODS, UKOO, УКОО, Odesa Central, Міжнародний аеропорт Одеса, Odessa Airport
OEC|Oecusse Route of the Sandalwood International Airport|Oecussi-Ambeno|TL|-9.198|124.338|Asia/Dili|l|s|Oe-Kusi Ambenu, Ocussi, Oekussi, Oekusi, Okusi, Oé-Cusse
OER|Örnsköldsvik Airport|Örnsköldsvik|SE|63.408|18.99|Europe/Berlin|m|s|
OFF|Offutt Air Force Base|Omaha|US|41.119|-95.909|America/Chicago|m|n|
OFK|Karl Stefan Memorial Airport|Norfolk|US|41.986|-97.435|America/Chicago|m|n|
OGB|Orangeburg Municipal Airport|Orangeburg|US|33.457|-80.859|America/New_York|m|n|
OGD|Ogden Hinckley Airport|Ogden|US|41.196|-112.012|America/Denver|m|s|
OGG|Kahului International Airport|Kahului|US|20.896|-156.432|Pacific/Honolulu|l|s|
OGL|Eugene F. Correia International Airport|Ogle|GY|6.806|-58.108|America/Guyana|m|s|SYGO
OGN|Yonaguni Airport|Yonaguni|JP|24.467|122.98|Asia/Tokyo|m|s|
OGS|Ogdensburg International Airport|Ogdensburg|US|44.682|-75.466|America/New_York|m|s|
OGU|Ordu–Giresun Airport|Ordu|TR|40.967|38.086|Europe/Istanbul|m|s|
OGX|Ain Beida Airport|Ouargla|DZ|31.917|5.413|Africa/Algiers|m|s|Ain el Beida, Sedrata Airfield
OGZ|Vladikavkaz Beslan International Airport|Beslan|RU|43.205|44.607|Europe/Moscow|m|s|УРМО, Beslan Airport, Аэропорт Беслан, Аэропорт Владикавказ
OHA|RNZAF Base Ohakea||NZ|-40.206|175.388|Pacific/Auckland|m|n|
OHD|Ohrid St. Paul the Apostle Airport|Ohrid|MK|41.18|20.742|Europe/Belgrade|l|s|
OHE|Mohe Gulian Airport|Mohe|CN|52.917|122.423|Asia/Shanghai|m|s|
OHO|Okhotsk Airport|Okhotsk|RU|59.41|143.057|Asia/Vladivostok|m|s|
OHS|Suhar International Airport|Suhar|OM|24.386|56.625|Asia/Dubai|l|s|Majis, Sohar, Sohar Airport
OIM|Oshima Airport|Izu Oshima|JP|34.782|139.36|Asia/Tokyo|m|s|
OIR|Okushiri Airport|Okushiri Island|JP|42.072|139.433|Asia/Tokyo|m|s|
OIT|Oita Airport|Oita|JP|33.479|131.737|Asia/Tokyo|m|s|
OKA|Naha International Airport|Naha|JP|26.192|127.64|Asia/Tokyo|l|s|那覇空港, Naha Kūkō?, Naha AFB
OKC|OKC Will Rogers World Airport|Oklahoma City|US|35.393|-97.598|America/Chicago|l|s|
OKD|Sapporo Okadama Airport|Sapporo|JP|43.117|141.381|Asia/Tokyo|m|s|RJCO, OKD
OKE|Okinoerabu Airport|Wadomari|JP|27.432|128.706|Asia/Tokyo|m|s|Okierabu
OKI|Oki Global Geopark Airport|Okinoshima|JP|36.178|133.324|Asia/Tokyo|m|s|okinoshima, sekai
OKJ|Okayama Momotaro Airport|Okayama|JP|34.757|133.855|Asia/Tokyo|l|s|
OKL|Oksibil Airport|Oksibil|ID|-4.907|140.628|Asia/Tokyo|m|s|Gunung Bintang
OKN|Okondja Airport|Okondja|GA|-0.665|13.673|Africa/Lagos|m|n|
OKO|Yokota Air Base|Fussa|JP|35.749|139.348|Asia/Tokyo|m|n|
OKY|Oakey Army Aviation Centre||AU|-27.409|151.737|Australia/Brisbane|m|s|Swartz Barracks
OLA|Ørland Airport|Ørland|NO|63.699|9.604|Europe/Berlin|m|s|Orland
OLB|Olbia Costa Smeralda Airport|Olbia|IT|40.899|9.518|Europe/Rome|l|s|
OLF|L M Clayton Airport|Wolf Point|US|48.095|-105.575|America/Denver|m|s|
OLL|Oyo Ollombo Airport|Oyo|CG|-1.227|15.91|Africa/Lagos|m|n|Denis Sassou Nguesso Airport
OLM|Olympia Regional Airport|Olympia|US|46.969|-122.903|America/Los_Angeles|m|s|
OLS|Nogales International Airport|Nogales|US|31.418|-110.848|America/Phoenix|m|n|
OLU|Columbus Municipal Airport|Columbus|US|41.448|-97.34|America/Chicago|m|n|
OLZ|Olyokminsk Airport|Olyokminsk|RU|60.402|120.476|Asia/Yakutsk|m|s|Olekminsk Airport, Аэропорт Олёкминск, Аэропорт Олекминск, УЕМО
OMA|Eppley Airfield|Omaha|US|41.303|-95.894|America/Chicago|l|s|
OMB|Omboue Hospital Airport|Omboue|GA|-1.575|9.263|Africa/Lagos|m|n|
OMC|Ormoc Airport|Ormoc City|PH|11.058|124.566|Asia/Manila|m|n|
OMD|Oranjemund Airport|Oranjemund|NA|-28.585|16.446|Africa/Windhoek|m|s|
OME|Nome Airport|Nome|US|64.512|-165.445|America/Nome|m|s|
OMH|Urmia Airport|Urmia|IR|37.668|45.069|Asia/Tehran|m|s|
OMN|Zomin Airport|Zomin|UZ|40.014|68.411|Asia/Tashkent|m|s|UTTZ, Zaamin
OMO|Mostar International Airport|Mostar|BA|43.282|17.846|Europe/Belgrade|l|s|
OMR|Oradea International Airport|Oradea|RO|47.025|21.902|Europe/Bucharest|l|s|
OMS|Omsk Central Airport|Omsk|RU|54.963|73.312|Asia/Omsk|l|s|Omsk Tsentralny Airport
OND|Ondangwa Airport|Ondangwa|NA|-17.878|15.953|Africa/Windhoek|m|s|
ONJ|Odate Noshiro Airport|Kitaakita|JP|40.192|140.371|Asia/Tokyo|m|s|
ONO|Ontario Municipal Airport|Ontario|US|44.02|-117.013|America/Boise|m|n|
ONP|Newport Municipal Airport|Newport|US|44.58|-124.058|America/Los_Angeles|m|n|
ONQ|Zonguldak Çaycuma Airport|Zonguldak|TR|41.506|32.089|Europe/Istanbul|m|s|
ONT|Ontario International Airport|Ontario|US|34.056|-117.601|America/Los_Angeles|l|s|
ONX|Enrique Adolfo Jimenez Airport|Colón|PA|9.357|-79.867|America/Panama|m|s|
OOL|Gold Coast Airport|Gold Coast|AU|-28.166|153.507|Australia/Sydney|l|s|
OOM|Cooma Snowy Mountains Airport|Cooma|AU|-36.3|148.972|Australia/Sydney|m|s|
OPF|Miami-Opa Locka Executive Airport|Miami|US|25.907|-80.278|America/New_York|m|s|
OPO|Francisco de Sá Carneiro Airport|Porto|PT|41.248|-8.681|Europe/Lisbon|l|s|
OPU|Balimo Airport|Balimo|PG|-8.05|142.933|Pacific/Port_Moresby|m|s|
ORA|Orán Airport|Orán|AR|-23.153|-64.329|America/Argentina/Salta|m|n|
ORB|Örebro Airport|Örebro|SE|59.224|15.038|Europe/Berlin|m|s|
ORD|Chicago O'Hare International Airport|Chicago|US|41.979|-87.905|America/Chicago|l|s|Orchard Place
ORF|Norfolk International Airport|Norfolk|US|36.895|-76.201|America/New_York|l|s|
ORH|Worcester Regional Airport|Worcester|US|42.267|-71.876|America/New_York|m|s|
ORK|Cork International Airport|Cork|IE|51.841|-8.491|Europe/London|l|s|Aerfort Chorcaí
ORL|Orlando Executive Airport|Orlando|US|28.546|-81.333|America/New_York|m|n|Herndon Airport, KORL, Orlando Municipal Airport, Orlando Army Air Base, Orlando Air Force Base, Naval Training Center Orlando
ORN|Oran Es-Sénia (Ahmed Ben Bella) International Airport|Es-Sénia|DZ|35.621|-0.622|Africa/Algiers|l|s|Es Senia
ORT|Northway Airport|Northway|US|62.961|-141.929|America/Anchorage|m|s|
ORU|Juan Mendoza International Airport|Oruro|BO|-17.956|-67.076|America/Puerto_Rico|l|s|
ORY|Paris-Orly Airport|Paris (Orly, Val-de-Marne)|FR|48.729|2.359|Europe/Paris|l|s|
OSD|Åre Östersund Airport|Östersund|SE|63.194|14.504|Europe/Berlin|m|s|F4 Frösön Air Base, ESPC, Östersund–Frösön Airport
OSH|Wittman Regional Airport|Oshkosh|US|43.984|-88.557|America/Chicago|m|n|
OSI|Osijek Airport|Osijek(Klisa)|HR|45.462|18.811|Europe/Belgrade|m|s|Klisa
OSL|Oslo-Gardermoen International Airport|Oslo (Gardermoen)|NO|60.194|11.1|Europe/Berlin|l|s|
OSM|Mosul International Airport|Mosul|IQ|36.306|43.147|Asia/Baghdad|l|n|OSB
OSN|Osan Air Base|Pyeongtaek|KR|37.091|127.029|Asia/Seoul|m|n|
OSR|Leoš Janáček Airport Ostrava|Mošnov|CZ|49.696|18.111|Europe/Prague|l|s|Ostrava-Mošnov International Airport
OSS|Osh International Airport|Osh|KG|40.609|72.793|Asia/Bishkek|l|s|UAFO
OST|Ostend-Bruges International Airport|Oostende|BE|51.2|2.875|Europe/Brussels|l|s|
OSU|The Ohio State University Airport - Don Scott Field|Columbus|US|40.08|-83.073|America/New_York|m|n|
OSW|Orsk Airport|Orsk|RU|51.072|58.596|Asia/Yekaterinburg|m|s|
OTH|Southwest Oregon Regional Airport|North Bend|US|43.417|-124.246|America/Los_Angeles|m|s|
OTI|Pitu Airport|Gotalalamo-Morotai Island|ID|2.046|128.325|Asia/Tokyo|m|n|
OTM|Ottumwa Regional Airport|Ottumwa|US|41.106|-92.45|America/Chicago|m|n|
OTP|Bucharest Henri Coandă International Airport|Otopeni|RO|44.572|26.103|Europe/Bucharest|l|s|BUH, Otopeni Airport, RoAF 90th Airlift Base
OTR|Coto 47 Airport|Corredores|CR|8.602|-82.969|America/Costa_Rica|m|n|
OTZ|Ralph Wien Memorial Airport|Kotzebue|US|66.885|-162.599|America/Nome|m|s|
OUA|Ouagadougou Thomas Sankara International Airport|Ouagadougou|BF|12.353|-1.512|Africa/Abidjan|l|s|
OUD|Oujda Angads Airport|Ahl Angad|MA|34.79|-1.926|Africa/Casablanca|l|s|Oujda Airfield
OUE|Ouesso Airport||CG|1.616|16.038|Africa/Lagos|m|n|
OUH|Oudtshoorn Airport|Oudtshoorn|ZA|-33.607|22.189|Africa/Johannesburg|m|n|
OUL|Oulu Airport|Oulu / Oulunsalo|FI|64.93|25.355|Europe/Helsinki|l|s|
OUZ|Tazadit Airport|Zouérate|MR|22.757|-12.482|Africa/Abidjan|m|s|
OVB|Novosibirsk Tolmachevo Airport|Novosibirsk|RU|55.02|82.619|Asia/Novosibirsk|l|s|
OVD|Asturias Airport|Ranón|ES|43.564|-6.035|Europe/Madrid|l|s|
OVS|Sovetskiy Airport|Sovetskiy|RU|61.327|63.602|Asia/Yekaterinburg|m|s|Sovyetskiy Airport, Sovyetsky Airport, Sovetsky Airport, Аэропорт Советский
OWB|Owensboro Daviess County Airport|Owensboro|US|37.74|-87.167|America/Chicago|m|s|
OWD|Norwood Memorial Airport|Norwood|US|42.19|-71.173|America/New_York|m|n|
OXB|Osvaldo Vieira International Airport|Bissau|GW|11.894|-15.654|Africa/Bissau|l|s|
OXF|London Oxford Airport|Kidlington, Oxfordshire|GB|51.837|-1.32|Europe/London|m|n|RAF Kidlington
OXR|Oxnard Airport|Oxnard|US|34.201|-119.207|America/Los_Angeles|m|n|
OYA|Goya Airport|Goya|AR|-29.106|-59.219|America/Argentina/Cordoba|m|n|
OYE|Oyem Airport|Oyem|GA|1.543|11.581|Africa/Lagos|m|s|
OYK|Oiapoque Airport|Oiapoque|BR|3.854|-51.797|America/Belem|m|n|
OYO|Tres Arroyos Airport|Tres Arroyos|AR|-38.387|-60.33|America/Argentina/Buenos_Aires|m|n|
OYP|Saint-Georges-de-l'Oyapock Airport|Saint-Georges-de-l'Oyapock|GF|3.898|-51.804|America/Cayenne|m|n|
OZC|Labo Airport|Ozamiz|PH|8.179|123.842|Asia/Manila|m|s|Barangay Labo, Ozamiz, Misamis Airfield
OZG|Zagora Airport|Zagora|MA|30.266|-5.861|Africa/Casablanca|l|s|
OZH|Zaporizhzhia International Airport|Zaporizhia|UA|47.867|35.315|Europe/Kyiv|m|n|Zaporozhye Airport, Міжнародний аеропорт Запоріжжя, Аэропорт Запорожье
OZP|Moron Air Base|Morón|ES|37.175|-5.616|Europe/Madrid|m|n|
OZR|Cairns AAF (Fort Rucker) Air Field|Fort Rucker/Ozark|US|31.276|-85.713|America/Chicago|m|n|
OZZ|Ouarzazate International Airport|Ouarzazate|MA|30.939|-6.909|Africa/Casablanca|l|s|
PAB|Bilaspur Airport|Bilaspur|IN|21.988|82.111|Asia/Kolkata|m|s|VABI
PAC|Marcos A. Gelabert International Airport|Albrook|PA|8.973|-79.556|America/Panama|m|s|Balboa. Albrook AFS. MPLB
PAD|Paderborn Lippstadt Airport|Büren|DE|51.613|8.617|Europe/Berlin|l|s|
PAE|Seattle Paine Field International Airport|Everett|US|47.906|-122.282|America/Los_Angeles|m|s|Snohomish County, Snohomish County Airport
PAG|Pagadian Airport|Pagadian|PH|7.826|123.46|Asia/Manila|m|s|
PAH|Barkley Regional Airport|Paducah|US|37.061|-88.774|America/Chicago|m|s|
PAL|German Olano Air Base|La Dorada|CO|5.484|-74.657|America/Bogota|m|n|Palanquero Airport
PAM|Tyndall Air Force Base|Panama City|US|30.07|-85.575|America/Chicago|m|n|
PAN|Pattani Airport||TH|6.785|101.154|Asia/Jakarta|m|n|
PAO|Palo Alto Airport|Palo Alto|US|37.461|-122.115|America/Los_Angeles|m|n|Santa Clara County
PAP|Toussaint Louverture International Airport|Port-au-Prince|HT|18.58|-72.293|America/Port-au-Prince|l|s|
PAQ|Warren Bud Woods Palmer Municipal Airport|Palmer|US|61.595|-149.089|America/Anchorage|m|n|Palmer Buddy Woods Municipal
PAT|Jay Prakash Narayan Airport|Patna|IN|25.591|85.088|Asia/Kolkata|m|s|Lok Nayah Jayprakash
PAV|Paulo Afonso Airport|Paulo Afonso|BR|-9.401|-38.251|America/Bahia|m|s|
PAX|Port-de-Paix Airport|Port-de-Paix|HT|19.934|-72.848|America/Port-au-Prince|m|n|
PAZ|El Tajín National Airport|Poza Rica|MX|20.603|-97.461|America/Mexico_City|m|s|
PBC|Hermanos Serdán International Airport|Puebla|MX|19.158|-98.372|America/Mexico_City|l|s|Aeropuerto Internacional Hermanos Serdán, Puebla International Airport
PBD|Porbandar Airport|Porbandar|IN|21.65|69.656|Asia/Kolkata|m|s|
PBF|Pine Bluff Regional Airport, Grider Field|Pine Bluff|US|34.174|-91.936|America/Chicago|m|n|
PBG|Plattsburgh International Airport|Plattsburgh|US|44.651|-73.468|America/New_York|m|s|Plattsburgh Air Force Base
PBH|Paro International Airport|Paro|BT|27.403|89.425|Asia/Thimphu|l|s|སྤ་རོ་གནམ་ཐང༌།, paro gnam thang
PBL|General Bartolome Salom International Airport|Puerto Cabello|VE|10.48|-68.073|America/Caracas|m|n|
PBM|Johan Adolf Pengel International Airport|Paramaribo|SR|5.453|-55.188|America/Paramaribo|l|s|Zandery, Zanderij, JAP International Airport, JAPI Airport, JAPIA, ZY Airport
PBN|Porto Amboim Airport|Port Amboim|AO|-10.722|13.765|Africa/Lagos|m|n|
PBO|Paraburdoo Airport|Paraburdoo|AU|-23.171|117.745|Australia/Perth|m|s|
PBR|Puerto Barrios Airport|Puerto Barrios|GT|15.731|-88.584|America/Guatemala|m|s|
PBU|Putao Airport|Putao|MM|27.33|97.426|Asia/Yangon|m|s|
PBZ|Plettenberg Bay Airport|Plettenberg Bay|ZA|-34.088|23.329|Africa/Johannesburg|m|n|
PCF|Potchefstroom Airport|Potchefstroom|ZA|-26.671|27.082|Africa/Johannesburg|m|n|
PCL|Cap FAP David Abenzur Rengifo International Airport|Pucallpa|PE|-8.378|-74.574|America/Lima|l|s|
PCP|Principe Airport|São Tomé & Príncipe|ST|1.661|7.411|Africa/Sao_Tome|m|s|
PCR|German Olano Airport|Puerto Carreño|CO|6.185|-67.493|America/Bogota|m|s|Puerto Carreño Airport
PDA|Obando Cesar Gaviria Trujillo Airport|Puerto Inírida|CO|3.854|-67.906|America/Bogota|m|s|
PDG|Minangkabau International Airport|Padang (Katapiang)|ID|-0.786|100.28|Asia/Jakarta|l|s|
PDK|DeKalb Peachtree Airport|Atlanta|US|33.876|-84.302|America/New_York|m|s|
PDL|João Paulo II Airport|Ponta Delgada|PT|37.741|-25.698|Atlantic/Azores|l|s|
PDO|Pendopo Airport|Talang Gudang-Sumatra Island|ID|-3.286|103.88|Asia/Jakarta|m|s|
PDP|Capitan Corbeta CA Curbelo International Airport|Punta del Este|UY|-34.855|-55.094|America/Montevideo|m|s|
PDS|Piedras Negras International Airport|Piedras Negras|MX|28.628|-100.535|America/Matamoros|m|s|
PDT|Eastern Oregon Regional Airport at Pendleton|Pendleton|US|45.695|-118.841|America/Los_Angeles|m|s|
PDU|Tydeo Larre Borges Airport|Paysandú|UY|-32.363|-58.062|America/Montevideo|m|n|
PDV|Plovdiv International Airport|Plovdiv|BG|42.068|24.851|Europe/Sofia|l|s|
PDX|Portland International Airport|Portland|US|45.589|-122.598|America/Los_Angeles|l|s|
PED|Pardubice Airport|Pardubice|CZ|50.015|15.74|Europe/Prague|l|s|Letiště Pardubice
PEE|Perm International Airport|Perm|RU|57.915|56.021|Asia/Yekaterinburg|l|s|Bolshoye Savino
PEG|Perugia San Francesco d'Assisi – Umbria International Airport|Perugia|IT|43.096|12.513|Europe/Rome|l|s|Perugia Sant'Egidio Airport
PEH|Comodoro Pedro Zanni Airport|Pehuajó|AR|-35.845|-61.858|America/Argentina/Buenos_Aires|m|n|
PEI|Matecaña International Airport|Pereira|CO|4.813|-75.74|America/Bogota|m|s|
PEK|Beijing Capital International Airport|Beijing|CN|40.077|116.597|Asia/Shanghai|l|s|BJS, Peking, 北京, 北京首都国际机场, 北京首都机场, 北京机场
PEM|Padre Aldamiz International Airport|Puerto Maldonado|PE|-12.614|-69.229|America/Lima|m|s|Puerto Maldonado International Airport
PEN|Penang International Airport|Penang|MY|5.296|100.276|Asia/Singapore|l|s|
PER|Perth International Airport|Perth|AU|-31.94|115.967|Australia/Perth|l|s|
PES|Petrozavodsk Airport|Petrozavodsk|RU|61.885|34.155|Europe/Moscow|m|s|УЛПБ, ЬЛПБ, Besovets Airport, Аэропорт Петрозаводск, Аэропорт Бесовец
PET|João Simões Lopes Neto International Airport|Pelotas|BR|-31.717|-52.328|America/Sao_Paulo|m|s|Pelotas Airport
PEV|Pécs-Pogány International Airport|Pécs|HU|45.989|18.242|Europe/Budapest|l|s|Pecs South Airport, QPJ
PEW|Bacha Khan International Airport|Peshawar|PK|33.994|71.515|Asia/Karachi|l|s|Peshawar International Airport
PEX|Pechora Airport|Pechora|RU|65.121|57.131|Europe/Moscow|m|s|
PEZ|Penza Airport|Penza|RU|53.111|45.021|Europe/Moscow|m|s|УВПП, Пенза, Penza South
PFB|Lauro Kurtz Airport|Passo Fundo|BR|-28.244|-52.328|America/Sao_Paulo|m|s|
PFO|Paphos International Airport|Paphos|CY|34.718|32.486|Asia/Nicosia|l|s|Pafos, Mandria, Kouklia, Διεθνής Αερολιμένας Πάφου, Pafos International Airport
PGA|Page Municipal Airport|Page|US|36.924|-111.448|America/Phoenix|m|s|
PGD|Punta Gorda Airport|Punta Gorda|US|26.92|-81.991|America/New_York|m|s|Charlotte County, Punta Gorda AAF
PGF|Perpignan-Rivesaltes (Llabanère) Airport|Perpignan/Rivesaltes|FR|42.74|2.871|Europe/Paris|m|s|
PGH|Pantnagar Airport|Pantnagar|IN|29.033|79.474|Asia/Kolkata|m|s|Panthnagar
PGK|Depati Amir Airport|Pangkal Pinang|ID|-2.162|106.139|Asia/Jakarta|m|s|WIPK
PGU|Persian Gulf International Airport|Khiyaroo|IR|27.38|52.738|Asia/Tehran|m|s|Asalouyeh, Khalije Fars, PSEEZ, Bandar Asalouyeh, Pars-Special-Zone, عسلویه
PGV|Pitt-Greenville Airport|Greenville|US|35.636|-77.384|America/New_York|m|s|
PGX|Périgueux-Bassillac Airport|Périgueux/Bassillac|FR|45.198|0.816|Europe/Paris|m|n|
PGZ|Ponta Grossa Airport - Comandante Antonio Amilton Beraldo|Ponta Grossa|BR|-25.184|-50.144|America/Sao_Paulo|m|s|SSZW
PHB|Parnaíba - Prefeito Doutor João Silva Filho International Airport|Parnaíba|BR|-2.894|-41.732|America/Fortaleza|m|s|Santos Dumont Airport
PHC|Port Harcourt International Airport|Port Harcourt|NG|5.015|6.95|Africa/Lagos|l|s|
PHE|Port Hedland International Airport|Port Hedland|AU|-20.383|118.63|Australia/Perth|l|s|
PHF|Newport News Williamsburg International Airport|Newport News|US|37.132|-76.493|America/New_York|m|s|
PHG|Port Harcourt City Airport / Port Harcourt Air Force Base|Port Harcourt|NG|4.846|7.021|Africa/Lagos|m|s|Port Harcourt NAF Base
PHH|Pokhara International Airport|Pokhara|NP|28.184|84.015|Asia/Kathmandu|l|s|
PHL|Philadelphia International Airport|Philadelphia|US|39.872|-75.241|America/New_York|l|s|
PHS|Phitsanulok Airport|Phitsanulok|TH|16.783|100.279|Asia/Jakarta|m|s|
PHW|Hendrik Van Eck Airport|Phalaborwa|ZA|-23.937|31.155|Africa/Johannesburg|m|s|
PHX|Phoenix Sky Harbor International Airport|Phoenix|US|33.435|-112.006|America/Phoenix|l|s|
PHY|Phetchabun Airport||TH|16.676|101.195|Asia/Jakarta|m|s|
PIA|General Wayne A. Downing Peoria International Airport|Peoria|US|40.664|-89.693|America/Chicago|m|s|
PIB|Hattiesburg Laurel Regional Airport|Moselle|US|31.467|-89.337|America/Chicago|m|s|
PIE|St. Petersburg Clearwater International Airport|Pinellas Park|US|27.91|-82.687|America/New_York|l|s|
PIH|Pocatello Regional Airport|Pocatello|US|42.91|-112.596|America/Boise|m|s|
PIK|Glasgow Prestwick Airport|Prestwick, South Ayrshire|GB|55.501|-4.577|Europe/London|l|s|
PIL|Aeródromo Don Carlos Miguel Gimenez|Pilar|PY|-26.882|-58.319|America/Asuncion|m|n|
PIO|Captain Renán Elías Olivera International Airport|Pisco|PE|-13.745|-76.22|America/Lima|l|n|Capitán FAP Renán Elías Olivera
PIR|Pierre Regional Airport|Pierre|US|44.383|-100.286|America/Chicago|m|s|
PIS|Poitiers-Biard Airport|Poitiers/Biard|FR|46.588|0.307|Europe/Paris|m|s|
PIT|Pittsburgh International Airport|Pittsburgh|US|40.492|-80.233|America/New_York|l|s|
PIU|PAF Captain Guillermo Concha Iberico International Airport|Piura|PE|-5.206|-80.616|America/Lima|m|s|
PIW|Pikwitonei Airport|Pikwitonei|CA|55.589|-97.164|America/Winnipeg|m|n|ZMN
PIX|Pico Airport|Pico Island|PT|38.554|-28.441|Atlantic/Azores|m|s|
PIZ|Point Lay LRRS Airport|Point Lay|US|69.733|-163.005|America/Nome|m|s|
PJC|Aeropuerto Nacional Dr. Augusto Roberto Fuster|Pedro Juan Caballero|PY|-22.641|-55.83|America/Asuncion|m|n|Aeropuerto Internacional Dr. Augusto Roberto Fuster
PJG|Panjgur Airport|Panjgur|PK|26.954|64.132|Asia/Karachi|m|n|
PJM|Puerto Jimenez Airport|Puerto Jimenez|CR|8.533|-83.3|America/Costa_Rica|m|s|Corcovado National Park
PKB|Mid Ohio Valley Regional Airport|Parkersburg (Williamstown)|US|39.345|-81.439|America/New_York|m|s|
PKC|Yelizovo Airport|Petropavlovsk-Kamchatsky|RU|53.169|158.451|Asia/Kamchatka|l|s|УХПП, Елизово, ПРЛ
PKE|Parkes Airport|Parkes|AU|-33.131|148.239|Australia/Sydney|m|s|
PKR|Pokhara Domestic Airport|Pokhara|NP|28.201|83.981|Asia/Kathmandu|m|s|
PKT|Port Keats Airport|Wadeye|AU|-14.25|129.53|Australia/Darwin|m|n|
PKU|Sultan Syarif Kasim II International Airport / Roesmin Nurjadin AFB|Pekanbaru|ID|0.459|101.444|Asia/Jakarta|m|s|Simpang Tiga
PKV|Princess Olga Pskov International Airport|Pskov|RU|57.781|28.394|Europe/Moscow|m|s|УЛОО, ЬЛОО, Псков /Кресты
PKW|Selebi Phikwe Airport|Selebi Phikwe|BW|-22.058|27.829|Africa/Johannesburg|m|n|
PKX|Beijing Daxing International Airport|Beijing|CN|39.501|116.414|Asia/Shanghai|l|s|
PKY|Tjilik Riwut Airport|Palangkaraya|ID|-2.227|113.943|Asia/Pontianak|m|s|WRBP, WAOP
PKZ|Pakse International Airport|Pakse|LA|15.134|105.78|Asia/Jakarta|l|s|
PLJ|Placencia Airport|Placencia|BZ|16.537|-88.362|America/Belize|m|s|
PLL|Ponta Pelada Airport / Manaus Air Base|Manaus|BR|-3.146|-59.986|America/Manaus|m|n|
PLM|Sultan Mahmud Badaruddin II Airport|Palembang|ID|-2.898|104.698|Asia/Jakarta|m|s|
PLN|Pellston Regional Airport of Emmet County Airport|Pellston|US|45.571|-84.797|America/Detroit|m|s|
PLO|Port Lincoln Airport|Port Lincoln|AU|-34.605|135.88|Australia/Adelaide|m|s|
PLQ|Palanga International Airport|Palanga|LT|55.973|21.094|Europe/Vilnius|l|s|
PLS|Providenciales International Airport|Providenciales|TC|21.774|-72.268|America/Grand_Turk|l|s|
PLU|Pampulha - Carlos Drummond de Andrade Airport|Belo Horizonte|BR|-19.851|-43.95|America/Sao_Paulo|m|n|BHZ
PLV|Suprunovka Airport|Poltava|UA|49.569|34.397|Europe/Kyiv|m|n|
PLW|Mutiara - SIS Al-Jufrie Airport|Palu|ID|-0.916|119.909|Asia/Makassar|m|s|WAML
PLX|Semei International Airport|Semey|KZ|50.351|80.234|Asia/Almaty|l|s|Semipalatinsk Airport, Semey International Airport
PLZ|Chief Dawid Stuurman International Airport|Gqeberha (Port Elizabeth)|ZA|-33.99|25.617|Africa/Johannesburg|l|s|H. F. Verwoerd Airport, Port Elizabeth International Airport, Walmer Airport
PMA|Pemba Airport|Chake Chake|TZ|-5.257|39.811|Asia/Riyadh|m|n|Chake Chake, Karume, Thabit Kombo Jecha, Wawi
PMC|El Tepual International Airport|Puerto Montt|CL|-41.443|-73.094|America/Santiago|l|s|
PMD|Palmdale Regional Airport / USAF Plant 42 Airport|Palmdale|US|34.629|-118.085|America/Los_Angeles|m|n|
PMF|Parma Airport|Parma|IT|44.826|10.297|Europe/Rome|m|s|
PMG|Ponta Porã Airport|Ponta Porã|BR|-22.55|-55.703|America/Campo_Grande|m|s|
PMI|Palma de Mallorca Airport|Palma de Mallorca|ES|39.552|2.739|Europe/Madrid|l|s|Son Sant Joan Airport, LESJ
PMO|Falcone–Borsellino Airport|Palermo|IT|38.176|13.091|Europe/Rome|l|s|Palermo Airport, Punta Raisi Airport
PMQ|Perito Moreno Jalil Hamer Airport|Perito Moreno|AR|-46.538|-70.979|America/Argentina/Rio_Gallegos|m|s|
PMR|Palmerston North Airport|Palmerston North|NZ|-40.321|175.617|Pacific/Auckland|m|s|
PMS|Palmyra Airport|Tadmur|SY|34.557|38.317|Asia/Damascus|m|n|
PMV|Del Caribe Santiago Mariño International Airport|Isla Margarita|VE|10.913|-63.967|America/Caracas|l|s|
PMW|Brigadeiro Lysias Rodrigues Airport|Palmas|BR|-10.291|-48.357|America/Araguaina|m|s|
PMY|El Tehuelche Airport|Puerto Madryn|AR|-42.759|-65.103|America/Argentina/Catamarca|m|s|
PMZ|Palmar Sur Airport|Palmar Sur|CR|8.951|-83.469|America/Costa_Rica|m|n|
PNA|Pamplona Airport|Pamplona|ES|42.77|-1.646|Europe/Madrid|m|s|
PNB|Porto Nacional Airport|Porto Nacional|BR|-10.719|-48.4|America/Araguaina|m|n|SBPN
PNC|Ponca City Regional Airport|Ponca City|US|36.732|-97.1|America/Chicago|m|n|
PNE|Northeast Philadelphia Airport|Philadelphia|US|40.082|-75.011|America/New_York|m|n|
PNH|Phnom Penh International Airport|Phnom Penh (Pou Senchey)|KH|11.547|104.845|Asia/Jakarta|l|n|Pochentong International Airport
PNI|Pohnpei International Airport|Pohnpei Island|FM|6.985|158.21|Pacific/Guadalcanal|m|s|Ponape
PNK|Supadio International Airport|Pontianak|ID|-0.152|109.404|Asia/Pontianak|l|s|
PNL|Pantelleria Airport|Pantelleria|IT|36.817|11.969|Europe/Rome|m|s|I D'Amico
PNP|Girua Airport|Popondetta|PG|-8.805|148.309|Pacific/Port_Moresby|m|s|
PNQ|Pune International Airport|Pune|IN|18.582|73.92|Asia/Kolkata|l|s|Lohegaon Airport, Lohegaon Air Force Station
PNR|Antonio Agostinho-Neto International Airport|Pointe Noire|CG|-4.816|11.887|Africa/Lagos|l|s|Pointe Noire
PNS|Pensacola International Airport|Pensacola|US|30.473|-87.187|America/Chicago|l|s|
PNT|Lieutenant Julio Gallardo Airport|Puerto Natales|CL|-51.671|-72.529|America/Punta_Arenas|m|s|
PNV|Panevėžys Air Base|Panevėžys|LT|55.729|24.461|Europe/Vilnius|m|n|Pajuostis, Tulpė
PNX|North Texas Regional Airport Perrin Field|Denison|US|33.714|-96.674|America/Chicago|m|n|Perrin AFB, Grayson County, Sherman
PNY|Pondicherry Airport|Puducherry (Pondicherry)|IN|11.968|79.812|Asia/Kolkata|m|s|
PNZ|Senador Nilo Coelho Airport|Petrolina|BR|-9.362|-40.569|America/Recife|m|s|
POA|Porto Alegre-Salgado Filho International Airport|Porto Alegre|BR|-29.994|-51.167|America/Sao_Paulo|l|s|
POB|Pope Field|Fort Bragg|US|35.171|-79.015|America/New_York|m|n|Pope AFB, Pope Army Airfield
POE|Polk Army Air Field|Fort Polk|US|31.045|-93.192|America/Chicago|m|n|
POG|Port Gentil International Airport|Port Gentil|GA|-0.712|8.754|Africa/Lagos|l|s|
POI|Capitan Nicolas Rojas Airport|Potosí|BO|-19.543|-65.724|America/Puerto_Rico|m|n|
POL|Pemba Airport|Pemba|MZ|-12.993|40.525|Africa/Johannesburg|m|s|Porto Amelia
POM|Port Moresby Jacksons International Airport|Port Moresby|PG|-9.443|147.22|Pacific/Port_Moresby|l|s|
POO|Poços de Caldas - Embaixador Walther Moreira Salles Airport|Poços De Caldas|BR|-21.843|-46.57|America/Sao_Paulo|m|n|
POP|Gregorio Luperon International Airport|Puerto Plata|DO|19.758|-70.57|America/Santo_Domingo|m|s|La Union
POR|Pori Airport|Pori|FI|61.462|21.8|Europe/Helsinki|m|s|
POS|Piarco International Airport|Port of Spain|TT|10.595|-61.338|America/Puerto_Rico|l|s|
POT|Ken Jones Airport|Ken Jones|JM|18.199|-76.535|America/Jamaica|m|n|
POU|Dutchess County Airport|Poughkeepsie|US|41.627|-73.884|America/New_York|m|n|
POW|Portorož Airport|Sečovlje|SI|45.472|13.616|Europe/Belgrade|m|n|Sečovlje
POX|Pontoise-Cormeilles Aerodrome|Cormeilles-en-Vexin, Val-d'Oise|FR|49.096|2.036|Europe/Paris|m|n|Aérodrome de Pontoise-Cormeilles en Vexin, Cergy Pontoise
POZ|Poznań-Ławica Airport|Poznań|PL|52.422|16.823|Europe/Warsaw|l|s|Poznań–Ławica Henryk Wieniawski Airport
PPB|Presidente Prudente Airport|Presidente Prudente|BR|-22.175|-51.425|America/Sao_Paulo|m|s|
PPG|Pago Pago International Airport|Pago Pago|AS|-14.331|-170.71|Pacific/Pago_Pago|l|s|
PPI|Port Pirie Airport||AU|-33.239|137.995|Australia/Adelaide|m|n|
PPK|Petropavl International Airport|Petropavl|KZ|54.776|69.187|Asia/Almaty|l|s|
PPN|Guillermo León Valencia Airport|Popayán|CO|2.454|-76.609|America/Bogota|m|s|
PPP|Proserpine Whitsunday Coast Airport|Proserpine|AU|-20.494|148.554|Australia/Brisbane|m|s|
PPQ|Paraparaumu Airport||NZ|-40.905|174.989|Pacific/Auckland|m|n|
PPS|Puerto Princesa International Airport / PAF Antonio Bautista Air Base|Puerto Princesa|PH|9.742|118.759|Asia/Manila|l|s|
PPT|Fa'a'ā International Airport|Papeete|PF|-17.553|-149.607|Pacific/Honolulu|l|s|
PQC|Phú Quốc International Airport|Phu Quoc Island|VN|10.17|103.994|Asia/Ho_Chi_Minh|l|s|
PQI|Presque Isle International Airport|Presque Isle|US|46.689|-68.045|America/New_York|m|s|Northern Maine Regional
PQQ|Port Macquarie Airport|Port Macquarie|AU|-31.436|152.863|Australia/Sydney|m|s|
PRA|General Urquiza Airport|Parana|AR|-31.795|-60.48|America/Argentina/Cordoba|m|s|
PRB|Paso Robles Municipal Airport|Paso Robles|US|35.673|-120.627|America/Los_Angeles|m|n|
PRC|Prescott Regional Airport - Ernest A. Love Field|Prescott|US|34.654|-112.42|America/Phoenix|m|s|
PRG|Václav Havel Airport Prague|Prague|CZ|50.101|14.26|Europe/Prague|l|s|Letiště Praha-Ruzyně, Ruzyně International Airport, Letiště Václava Havla Praha
PRH|Phrae Airport||TH|18.132|100.165|Asia/Jakarta|m|n|
PRI|Praslin Island Airport|Praslin Island|SC|-4.319|55.692|Asia/Dubai|m|s|
PRM|Portimão Airport|Portimão|PT|37.149|-8.584|Europe/Lisbon|m|s|
PRN|Priština Adem Jashari International Airport|Prishtina|XK|42.573|21.036|Europe/Belgrade|l|s|LYPR, Slatina Air Base
PRV|Přerov Air Base|Přerov|CZ|49.426|17.405|Europe/Prague|m|n|
PRX|Cox Field|Paris|US|33.637|-95.451|America/Chicago|m|n|Cox AAF
PRY|Wonderboom Airport|Pretoria|ZA|-25.654|28.224|Africa/Johannesburg|m|n|
PSA|Pisa International Airport|Pisa|IT|43.684|10.393|Europe/Rome|l|s|Galileo Galilei Airport, San Giusto Airport
PSC|Tri Cities Airport|Pasco|US|46.265|-119.119|America/Los_Angeles|m|s|
PSD|Port Said International Airport|Port Said|EG|31.279|32.241|Africa/Cairo|l|s|El Gamil
PSE|Mercedita International Airport|Ponce|PR|18.008|-66.563|America/Puerto_Rico|m|s|
PSG|Petersburg James A Johnson Airport|Petersburg|US|56.802|-132.945|America/Sitka|m|s|
PSI|Pasni Airport|Pasni|PK|25.291|63.345|Asia/Karachi|m|n|
PSJ|Kasiguncu Airport|Poso-Celebes Island|ID|-1.414|120.659|Asia/Makassar|m|n|WAMP
PSM|Portsmouth International Airport at Pease|Portsmouth|US|43.078|-70.823|America/New_York|m|s|
PSO|Antonio Nariño Airport|Chachagüí|CO|1.397|-77.291|America/Bogota|m|s|Pasto
PSP|Palm Springs International Airport|Palm Springs|US|33.83|-116.507|America/Los_Angeles|l|s|Palm Springs Air Base
PSR|Abruzzo Airport|Pescara|IT|42.431|14.183|Europe/Rome|l|s|Pescara, Abruzzo Pasquale Liberi International
PSS|Libertador Gral D Jose De San Martin Airport|Posadas|AR|-27.386|-55.971|America/Argentina/Cordoba|m|s|
PSU|Pangsuma Airport|Putussibau-Borneo Island|ID|0.835|112.94|Asia/Pontianak|m|s|
PSZ|Capitán Av. Salvador Ogaya G. airport|Puerto Suárez|BO|-18.975|-57.821|America/Puerto_Rico|m|s|
PTG|Polokwane International Airport|Polokwane|ZA|-23.845|29.459|Africa/Johannesburg|l|s|FAPB, AFB Pietersburg, Pietersburg International Airport, Gateway International Airport
PTH|Port Heiden Airport|Port Heiden|US|56.958|-158.63|America/Anchorage|m|s|
PTJ|Portland Airport||AU|-38.318|141.471|Australia/Melbourne|m|s|
PTK|Oakland County International Airport|Pontiac|US|42.666|-83.42|America/Detroit|m|n|Pontiac Municipal Airport, Oakland-Pontiac Airport
PTM|Palmarito Airport|Palmarito|VE|7.575|-70.174|America/Caracas|m|n|
PTP|Maryse Condé International Airport|Pointe-à-Pitre|GP|16.265|-61.533|America/Puerto_Rico|l|s|Le Raizet, Les Abymes
PTU|Platinum Airport|Platinum|US|59.018|-161.828|America/Anchorage|m|s|
PTX|Pitalito Airport|Pitalito|CO|1.858|-76.086|America/Bogota|m|n|
PTY|Tocumen International Airport|Tocumen|PA|9.071|-79.383|America/Panama|l|s|La Joya No 1
PUB|Pueblo Memorial Airport|Pueblo|US|38.289|-104.497|America/Denver|m|s|
PUD|Puerto Deseado Airport|Puerto Deseado|AR|-47.735|-65.904|America/Argentina/Rio_Gallegos|m|s|
PUF|Pau Pyrénées Airport|Pau/Pyrénées (Uzein)|FR|43.38|-0.419|Europe/Paris|m|s|
PUG|Port Augusta Airport||AU|-32.507|137.717|Australia/Adelaide|m|s|
PUJ|Punta Cana International Airport|Punta Cana|DO|18.567|-68.365|America/Santo_Domingo|l|s|
PUQ|President Carlos Ibáñez International Airport|Punta Arenas|CL|-53.003|-70.855|America/Punta_Arenas|l|s|
PUS|Gimhae International Airport|Busan|KR|35.18|128.938|Asia/Seoul|l|s|김해국제공항, 金海國際空港, Kimhae, Pusan, Busan Airport
PUT|Sri Sathya Sai Airport|Puttaparthi|IN|14.149|77.791|Asia/Kolkata|m|n|
PUU|Tres De Mayo Airport|Puerto Asís|CO|0.505|-76.501|America/Bogota|m|s|
PUW|Pullman-Moscow Regional Airport|Pullman|US|46.742|-117.112|America/Los_Angeles|m|s|
PUY|Pula Airport|Pula|HR|44.894|13.922|Europe/Belgrade|l|s|
PUZ|Puerto Cabezas Airport|Puerto Cabezas|NI|14.047|-83.387|America/Managua|m|s|
PVA|El Embrujo Airport|Providencia|CO|13.357|-81.358|America/Bogota|m|s|
PVD|Rhode Island T. F. Green International Airport|Providence/Warwick|US|41.725|-71.426|America/New_York|l|s|
PVG|Shanghai Pudong International Airport|Shanghai (Pudong)|CN|31.143|121.805|Asia/Shanghai|l|s|上海, 上海浦东国际机场, 浦东
PVH|Governador Jorge Teixeira de Oliveira International Airport|Porto Velho|BR|-8.708|-63.902|America/Porto_Velho|l|s|
PVK|Aktion National Airport|Preveza|GR|38.925|20.765|Europe/Athens|m|s|Preveza, Lefkada, Πρέβεζα, Λευκάδα
PVO|Reales Tamarindos Airport|Portoviejo|EC|-1.042|-80.472|America/Guayaquil|m|n|
PVR|Puerto Vallarta International Airport|Puerto Vallarta|MX|20.68|-105.254|America/Mexico_City|l|s|Licenciado Gustavo Díaz Ordaz
PVS|Provideniya Bay Airport|Chukotka|RU|64.378|-173.243|Asia/Anadyr|m|n|УХМД, ЬХМД, Bukhta Provideniya Airport, Urelik Airport, Ureliki Airport, Аэропорт Бухта Провидения, Аэропорт Урелики
PVU|Provo Municipal Airport|Provo|US|40.219|-111.722|America/Denver|m|s|
PWE|Pevek Airport|Apapelgino|RU|69.783|170.597|Asia/Anadyr|m|s|УХМП, Аэропорт Певек
PWK|Chicago Executive Airport|Chicago/Prospect Heights/Wheeling|US|42.114|-87.901|America/Chicago|m|n|
PWM|Portland International Jetport|Portland|US|43.646|-70.309|America/New_York|l|s|
PWQ|Pavlodar International Airport|Pavlodar|KZ|52.195|77.073|Asia/Almaty|l|s|Pavlodar South
PWT|Bremerton National Airport|Bremerton|US|47.49|-122.765|America/Los_Angeles|m|n|
PWY|Ralph Wenz Field|Pinedale|US|42.796|-109.807|America/Denver|m|n|
PXM|Puerto Escondido International Airport|Puerto Escondido|MX|15.877|-97.089|America/Mexico_City|m|s|Aeropuerto Internacional de Puerto Escondido
PXO|Porto Santo Airport|Vila Baleira|PT|33.073|-16.35|Atlantic/Madeira|m|s|
PXR|Surin Airport|Surin|TH|14.868|103.498|Asia/Jakarta|m|s|Surin Bhakdi Airport
PXU|Pleiku Airport|Pleiku|VN|14.005|108.017|Asia/Ho_Chi_Minh|m|s|
PYH|Cacique Aramare Airport|Puerto Ayacucho|VE|5.62|-67.606|America/Caracas|m|n|Casique Aramare Airport
PYJ|Polyarny Airport|Yakutia|RU|66.4|112.03|Asia/Yakutsk|m|s|УЕРП, Аэропорт Полярный, Alrosa, Kimberlite, Diamonds
PYK|Payam International Airport|Karaj|IR|35.776|50.827|Asia/Tehran|l|s|
PYR|Andravida Air Base|Andravida|GR|37.921|21.293|Europe/Athens|m|n|GVD, Βάση Ανδραβίδας
PZA|Paz de Ariporo Airport|Paz de Ariporo|CO|5.876|-71.887|America/Bogota|m|n|
PZB|Pietermaritzburg Airport|Pietermaritzburg|ZA|-29.649|30.399|Africa/Johannesburg|m|s|
PZH|Zhob Airport|Fort Sandeman|PK|31.358|69.464|Asia/Karachi|m|s|
PZI|Panzhihua Bao'anying Airport|Panzhihua (Renhe)|CN|26.54|101.799|Asia/Shanghai|m|s|Xining Air Base, 攀枝花保安营机场
PZO|General Manuel Carlos Piar International Airport|Guyana City|VE|8.289|-62.76|America/Caracas|l|s|CGU
PZS|Maquehue Airport|Temuco|CL|-38.767|-72.637|America/Santiago|m|n|ZCO
PZU|Port Sudan New International Airport|Port Sudan|SD|19.435|37.234|Africa/Khartoum|l|s|
PZY|Piešťany Airport|Piešťany|SK|48.625|17.828|Europe/Prague|m|n|
QBC|Bella Coola Airport|Bella Coola|CA|52.388|-126.596|America/Vancouver|m|s|YBD
QCY|RAF Coningsby|Lincoln, Lincolnshire|GB|53.093|-0.166|Europe/London|m|n|
QGU|Gifu Airport|Gifu|JP|35.394|136.87|Asia/Tokyo|m|n|
QHR|Harar Meda Airport|Debre Zeyit|ET|8.716|39.006|Asia/Riyadh|m|n|አባጤናደጃ ደጃደጃ
QMJ|Shahid Asiyaee Airport|Masjed Soleyman|IR|32.002|49.269|Asia/Tehran|m|n|Shahid Asyaee
QOW|Sam Mbakwe International Cargo Airport|Owerri|NG|5.427|7.206|Africa/Lagos|m|s|Imo Airport, Imo State Airport
QPG|Paya Lebar Air Base|Paya Lebar|SG|1.36|103.91|Asia/Singapore|m|n|
QRA|Rand Airport|Johannesburg|ZA|-26.242|28.151|Africa/Johannesburg|m|n|
QRM|Narromine Airport||AU|-32.215|148.225|Australia/Sydney|m|n|
QRO|Querétaro Intercontinental Airport|Querétaro|MX|20.619|-100.186|America/Mexico_City|l|s|
QRW|Warri Airport|Okpe|NG|5.598|5.819|Africa/Lagos|m|s|Osubi Airport, Shell
QSF|Ain Arnat Airport|Sétif|DZ|36.178|5.33|Africa/Algiers|m|s|Sétif International Airport, 8 Mai 45 Airport
QSR|Salerno Costa d'Amalfi Airport|Salerno|IT|40.62|14.911|Europe/Rome|m|s|Mario Martucci Airport, Aeroporto di Salerno Costa d'Amalfi, Salerno-Pontecagnano Airport
QSZ|Shache Airport|Shache|CN|38.245|77.056|Asia/Shanghai|m|s|Yarkant, Yeerqiang
QUO|Akwa Ibom International Airport|Uyo|NG|4.872|8.093|Africa/Lagos|m|s|
RAB|Tokua Airport|Kokopo|PG|-4.34|152.38|Pacific/Port_Moresby|m|s|
RAE|Arar Domestic Airport|Arar|SA|30.907|41.138|Asia/Riyadh|m|s|
RAH|Rafha Domestic Airport|Rafha|SA|29.626|43.491|Asia/Riyadh|m|s|
RAI|Nelson Mandela International Airport|Praia|CV|14.941|-23.485|Atlantic/Cape_Verde|l|s|Santiago Island
RAJ|Rajkot Airport|Rajkot|IN|22.309|70.78|Asia/Kolkata|m|n|
RAK|Marrakesh Menara Airport|Marrakesh|MA|31.605|-8.036|Africa/Casablanca|l|s|Marakesh
RAL|Riverside Municipal Airport|Riverside|US|33.952|-117.445|America/Los_Angeles|m|n|Riverside Arlington
RAO|Leite Lopes Airport|Ribeirão Preto|BR|-21.134|-47.774|America/Sao_Paulo|m|s|
RAP|Rapid City Regional Airport|Rapid City|US|44.045|-103.057|America/Denver|m|s|
RAR|Rarotonga International Airport|Avarua|CK|-21.203|-159.806|Pacific/Rarotonga|l|s|
RAS|Sardar-e-Jangal Airport|Rasht|IR|37.323|49.618|Asia/Tehran|m|s|
RAZ|Rawalakot Airport|Rawalakot|PK|33.85|73.798|Asia/Karachi|m|n|
RBA|Rabat-Salé Airport|Rabat|MA|34.051|-6.752|Africa/Casablanca|l|s|
RBE|Ratanakiri Airport|Ratanakiri|KH|13.73|106.987|Asia/Jakarta|m|n|
RBL|Red Bluff Municipal Airport|Red Bluff|US|40.151|-122.252|America/Los_Angeles|m|n|
RBR|Rio Branco-Plácido de Castro International Airport|Rio Branco|BR|-9.869|-67.894|America/Rio_Branco|l|s|
RBY|Ruby Airport|Ruby|US|64.727|-155.47|America/Anchorage|m|s|
RCA|Ellsworth Air Force Base|Rapid City|US|44.145|-103.104|America/Denver|m|n|28th Bomb Wing
RCB|Richards Bay Airport|Richards Bay|ZA|-28.741|32.092|Africa/Johannesburg|m|s|
RCH|Almirante Padilla Airport|Riohacha|CO|11.526|-72.926|America/Bogota|m|s|
RCO|Rochefort-Saint-Agnant (BA 721) Airport|Rochefort/Saint-Agnant|FR|45.888|-0.983|Europe/Paris|m|n|
RCQ|Reconquista Airport|Reconquista|AR|-29.21|-59.683|America/Argentina/Cordoba|m|n|
RCU|Area De Material Airport|Rio Cuarto|AR|-33.085|-64.261|America/Argentina/Cordoba|m|n|
RDD|Redding Municipal Airport|Redding|US|40.509|-122.293|America/Los_Angeles|m|s|
RDG|Reading Regional Airport (Carl A Spaatz Field)|Reading|US|40.379|-75.965|America/New_York|m|n|
RDL|Bardawil International Airport|El Hassana|EG|30.411|33.155|Africa/Cairo|m|n|Jafjafa Well, Bir Gifgafa, HE36
RDM|Roberts Field|Redmond|US|44.254|-121.15|America/Los_Angeles|m|s|
RDO|Warsaw Radom Airport|Radom|PL|51.389|21.215|Europe/Warsaw|m|s|Radom Military Air Base, Radom-Sadków Airport, Warszawa-Radom, Lotnisko Warszawa-Radom im. Bohaterów Radomskiego Czerwca 1976 Roku, Heroes of Radom June 1976 Warsaw Radom
RDP|Kazi Nazrul Islam Airport|Durgapur|IN|23.622|87.243|Asia/Kolkata|m|s|Andal Airport, Durgapur Airport
RDR|Grand Forks Air Force Base|Grand Forks|US|47.961|-97.401|America/Chicago|m|n|
RDS|Rincon De Los Sauces Airport|Rincon de los Sauces|AR|-37.391|-68.904|America/Argentina/Salta|m|n|
RDU|Raleigh-Durham International Airport|Raleigh/Durham|US|35.879|-78.787|America/New_York|l|s|
RDZ|Rodez–Aveyron Airport|Rodez/Marcillac|FR|44.408|2.483|Europe/Paris|m|s|
REA|Reao Airport|Reao|PF|-18.467|-136.439|Pacific/Honolulu|m|n|
REC|Recife/Guararapes - Gilberto Freyre International Airport|Recife|BR|-8.127|-34.923|America/Recife|l|s|Ibura
REG|Reggio Calabria Airport|Reggio Calabria|IT|38.071|15.652|Europe/Rome|m|s|Tito Minniti
REL|Almirante Marco Andres Zar Airport|Rawson|AR|-43.211|-65.27|America/Argentina/Catamarca|m|s|Trelew Airport
REN|Orenburg Central Airport|Orenburg|RU|51.793|55.457|Asia/Yekaterinburg|m|s|Orenburg Tsentralny Airport, Аэропорт Центральный
RER|Retalhuleu Airport|Retalhuleu|GT|14.521|-91.697|America/Guatemala|m|s|
RES|Resistencia International Airport|Resistencia|AR|-27.45|-59.056|America/Argentina/Cordoba|l|s|
REU|Reus Airport|Reus|ES|41.148|1.168|Europe/Madrid|l|s|
REW|Rewa Airport, Chorhata, REWA|Rewa|IN|24.503|81.22|Asia/Kolkata|m|s|
REX|General Lucio Blanco International Airport|Reynosa|MX|26.009|-98.228|America/Matamoros|m|s|
RFD|Chicago Rockford International Airport|Chicago/Rockford|US|42.195|-89.097|America/Chicago|m|s|
RFP|Raiatea Airport|Uturoa|PF|-16.723|-151.466|Pacific/Honolulu|m|s|
RGA|Gobernador Ramón Trejo Noel International Airport|Rio Grande|AR|-53.778|-67.749|America/Argentina/Ushuaia|m|s|Hermes Quijada
RGI|Rangiroa Airport||PF|-14.954|-147.661|Pacific/Honolulu|m|s|
RGK|Gorno-Altaysk Airport|Gorno-Altaysk|RU|51.969|85.837|Asia/Barnaul|m|n|Аэропорт Горно-Алтайск
RGL|Piloto Civil Norberto Fernández International Airport|Rio Gallegos|AR|-51.609|-69.309|America/Argentina/Rio_Gallegos|l|s|Brigadier General D. A. Parodi
RGN|Yangon International Airport|Yangon|MM|16.907|96.133|Asia/Yangon|l|s|Rangoon
RGO|Orang (Chongjin) Airport|Hoemun-ri|KP|41.429|129.648|Asia/Pyongyang|m|s|K-33, Hoemun Airfield
RGS|Burgos Airport|Burgos|ES|42.358|-3.621|Europe/Madrid|m|n|
RGT|Japura Airport|Rengat-Sumatra Island|ID|-0.353|102.335|Asia/Jakarta|m|n|WIPR
RHD|Termas de Río Hondo international Airport|Termas de Río Hondo|AR|-27.497|-64.936|America/Argentina/Cordoba|m|s|
RHI|Rhinelander Oneida County Airport|Rhinelander|US|45.631|-89.467|America/Chicago|m|s|
RHO|Rhodes International Airport Diagoras|Rhodes|GR|36.405|28.086|Europe/Athens|l|s|Diagoras International Airport
RIA|Santa Maria Airport|Santa Maria|BR|-29.711|-53.688|America/Sao_Paulo|m|s|
RIB|Capitán Av. Selin Zeitun Lopez Airport|Riberalta|BO|-11.009|-66.075|America/Puerto_Rico|m|s|
RIC|Richmond International Airport|Richmond|US|37.505|-77.32|America/New_York|l|s|
RIJ|Juan Simons Vela Airport|Rioja|PE|-6.068|-77.16|America/Lima|m|n|
RIL|Garfield County Regional Airport|Rifle|US|39.526|-107.727|America/Denver|m|n|Rifle Airport
RIS|Rishiri Airport|Rishiri|JP|45.242|141.186|Asia/Tokyo|m|s|
RIV|March Air Reserve Base|Riverside|US|33.881|-117.259|America/Los_Angeles|m|n|
RIW|Central Wyoming Regional Airport|Riverton|US|43.064|-108.46|America/Denver|m|s|
RIX|Riga International Airport|Riga|LV|56.921|23.971|Europe/Riga|l|s|
RIY|Riyan International Airport|Mukalla(Riyan)|YE|14.662|49.375|Asia/Riyadh|l|s|ريان المكلا الدولي, Riyan Mukalla International Airport
RIZ|Rizhao Shanzihe Airport|Rizhao (Donggang)|CN|35.405|119.324|Asia/Shanghai|m|s|
RJA|Rajahmundry Airport|Madhurapudi|IN|17.106|81.813|Asia/Kolkata|m|s|
RJH|Shah Makhdum Airport|Rajshahi|BD|24.437|88.617|Asia/Dhaka|m|s|
RJK|Rijeka Airport|Rijeka(Omišalj)|HR|45.216|14.571|Europe/Belgrade|l|s|Reka, Rika, Fiume, Omišalj
RJL|Logroño-Agoncillo Airport|Logroño|ES|42.461|-2.322|Europe/Madrid|m|s|LELO
RJN|Rafsanjan Airport|Rafsanjan|IR|30.298|56.049|Asia/Tehran|m|s|
RKD|Knox County Regional Airport|Rockland|US|44.06|-69.099|America/New_York|m|s|
RKE|Copenhagen Roskilde Airport|Roskilde|DK|55.586|12.131|Europe/Berlin|m|s|København
RKS|Southwest Wyoming Regional Airport|Rock Springs|US|41.594|-109.065|America/Denver|m|s|Rock Springs Sweetwater County
RKT|Ras Al Khaimah International Airport|Ras Al Khaimah|AE|25.614|55.939|Asia/Dubai|l|s|
RKV|Reykjavík Domestic Airport|Reykjavík|IS|64.129|-21.938|Africa/Abidjan|m|s|REK
RKZ|Xigaze Peace Airport / Shigatse Air Base|Xigazê (Samzhubzê)|CN|29.351|89.299|Asia/Shanghai|l|s|
RLG|Rostock-Laage Airport|Laage|DE|53.918|12.278|Europe/Berlin|m|s|
RLK|Bayannur Tianjitai Airport|Bayannur|CN|40.926|107.741|Asia/Shanghai|m|s|
RMA|Roma Airport|Roma|AU|-26.545|148.775|Australia/Brisbane|m|s|
RME|Griffiss International Airport|Rome|US|43.234|-75.407|America/New_York|m|n|
RMF|Marsa Alam International Airport|Marsa Alam|EG|25.556|34.592|Africa/Cairo|l|s|marsa alam airport
RMG|Richard B Russell Airport|Rome|US|34.351|-85.158|America/New_York|m|n|Towers Field
RMI|Federico Fellini International Airport|Rimini|IT|44.02|12.612|Europe/Rome|l|s|Rimini Miramare Airport, Rimini San Marino International Airport
RMK|Renmark Airport||AU|-34.196|140.674|Australia/Adelaide|m|n|
RML|Colombo Ratmalana International Airport|Colombo|LK|6.822|79.886|Asia/Colombo|l|s|
RMO|Chişinău International Airport|Chişinău|MD|46.928|28.932|Europe/Chisinau|l|s|KIV
RMQ|Taichung International Airport / Ching Chuang Kang Air Base|Taichung (Qingshui)|TW|24.265|120.621|Asia/Taipei|l|s|臺中清泉崗機場
RMS|Ramstein Air Base|Ramstein-Miesenbach|DE|49.437|7.6|Europe/Berlin|m|n|Landstuhl Air Base
RMU|Region of Murcia International Airport|Corvera|ES|37.803|-1.125|Europe/Madrid|l|s|
RMZ|Tobolsk Remezov Airport|Tobolsk|RU|58.06|68.348|Asia/Yekaterinburg|m|s|Tobolsk New, Ремезов, УСТЙ
RNB|Ronneby Airport|Ronneby|SE|56.267|15.265|Europe/Berlin|m|s|
RND|Randolph Air Force Base|Universal City|US|29.53|-98.279|America/Chicago|m|n|
RNE|Roanne-Renaison Airport|Saint-Léger-sur-Roanne|FR|46.054|3.999|Europe/Paris|m|n|
RNH|New Richmond Regional Airport|New Richmond|US|45.148|-92.538|America/Chicago|m|n|
RNJ|Yoron Airport|Yoron|JP|27.044|128.402|Asia/Tokyo|m|s|
RNN|Bornholm Airport|Rønne|DK|55.063|14.76|Europe/Berlin|m|s|Roenne
RNO|Reno Tahoe International Airport|Reno|US|39.499|-119.768|America/Los_Angeles|l|s|
RNS|Rennes-Saint-Jacques Airport|Saint-Jacques-de-la-Lande, Ille-et-Vilaine|FR|48.069|-1.735|Europe/Paris|m|s|Rennes Bretagne
ROA|Roanoke–Blacksburg Regional Airport|Roanoke|US|37.325|-79.975|America/New_York|m|s|Woodrum Field
ROB|Roberts International Airport|Monrovia|LR|6.234|-10.362|Africa/Monrovia|l|s|
ROC|Frederick Douglass Greater Rochester International Airport|Rochester|US|43.119|-77.672|America/New_York|l|s|
ROD|Robertson Airport|Robertson|ZA|-33.812|19.903|Africa/Johannesburg|m|n|
ROI|Roi Et Airport|Roi Et|TH|16.117|103.774|Asia/Jakarta|m|s|
ROK|Rockhampton Airport|Rockhampton|AU|-23.38|150.475|Australia/Brisbane|m|s|
ROO|Maestro Marinho Franco Airport|Rondonópolis|BR|-16.584|-54.725|America/Cuiaba|m|s|SWRD, Rondonópolis Airport
ROP|Rota International Airport|Rota Island|MP|14.173|145.241|Pacific/Guam|l|s|
ROR|Roman Tmetuchl International Airport|Babelthuap Island|PW|7.367|134.544|Asia/Tokyo|l|s|Babelthuap Airport, Palau International Airport
ROS|Rosario Islas Malvinas International Airport|Rosario|AR|-32.904|-60.785|America/Argentina/Cordoba|l|s|Fisherton Airport
ROT|Rotorua Regional Airport|Rotorua|NZ|-38.109|176.317|Pacific/Auckland|m|s|
ROV|Platov International Airport|Rostov-on-Don|RU|47.494|39.925|Europe/Moscow|l|n|УРРП, Международный аэропорт Платов
ROW|Roswell Air Center Airport|Roswell|US|33.302|-104.531|America/Denver|m|s|Roswell Army Air Field, Walker Air Force Base
ROZ|Rota Naval Station Airport|Rota|ES|36.645|-6.349|Europe/Madrid|m|n|
RPM|Ngukurr Airport|Roper River|AU|-14.723|134.747|Australia/Darwin|m|n|
RPN|Rosh Pina Airport|Rosh Pina|IL|32.981|35.572|Asia/Jerusalem|m|n|Mahanayim Ben Yaakov Airport
RPR|Swami Vivekananda Airport|Raipur|IN|21.18|81.739|Asia/Kolkata|m|s|VARP, Mana Airport, Raipur Airport
RQA|Ruoqiang Loulan Airport|Ruoqiang Town|CN|38.975|88.008|Asia/Urumqi|m|s|
RQW|Qayyarah West Airport|Qayyarah|IQ|35.767|43.125|Asia/Baghdad|m|n|
RQY|Rashtrakavi Kuvempu Airport|Shimoga|IN|13.858|75.619|Asia/Kolkata|m|n|Sogane, Shivamogga
RRE|Marree Airport||AU|-29.663|138.065|Australia/Adelaide|m|n|
RRG|Sir Charles Gaetan Duval Airport|Port Mathurin|MU|-19.757|63.359|Indian/Mauritius|m|s|Plaine Corail
RRJ|Jacarepaguá - Roberto Marinho Airport|Rio de Janeiro|BR|-22.987|-43.372|America/Sao_Paulo|m|n|
RRK|Rourkela Airport|Rourkela|IN|22.257|84.815|Asia/Kolkata|m|n|
RRS|Røros Airport|Røros|NO|62.578|11.342|Europe/Berlin|m|s|Roros
RSA|Santa Rosa Airport|Santa Rosa|AR|-36.588|-64.276|America/Argentina/Salta|m|s|
RSD|Rock Sound International Airport|Rock Sound|BS|24.892|-76.178|America/Toronto|m|s|
RSI|Red Sea International Airport|Hanak|SA|25.628|37.089|Asia/Riyadh|l|s|RSI
RSL|Russell Municipal Airport|Russell|US|38.872|-98.812|America/Chicago|m|n|
RST|Rochester International Airport|Rochester|US|43.908|-92.5|America/Chicago|m|s|
RSU|Yeosu Airport|Yeosu|KR|34.842|127.617|Asia/Seoul|m|s|
RSW|Southwest Florida International Airport|Fort Myers|US|26.535|-81.753|America/New_York|l|s|
RTB|Juan Manuel Gálvez International Airport|Coxen Hole|HN|16.317|-86.523|America/Tegucigalpa|l|s|Roatán, Roatan International
RTC|Ratnagiri Airport||IN|17.014|73.328|Asia/Kolkata|m|n|
RTE|Campo de Marte Airport|São Paulo|BR|-23.509|-46.638|America/Sao_Paulo|m|n|
RTM|Rotterdam The Hague Airport|Rotterdam|NL|51.957|4.437|Europe/Brussels|l|s|Vliegveld Zestienhoven
RUA|Arua Airport|Arua|UG|3.049|30.912|Asia/Riyadh|m|s|
RUG|Rugao Air Base|Rugao (Nantong)|CN|32.258|120.501|Asia/Shanghai|m|n|
RUH|King Khalid International Airport|Riyadh|SA|24.958|46.699|Asia/Riyadh|l|s|Riyad
RUI|Sierra Blanca Regional Airport|Alto|US|33.463|-105.535|America/Denver|m|n|Ruidoso
RUN|Roland Garros Airport|Sainte-Marie|RE|-20.89|55.519|Asia/Dubai|l|s|Gillot Airport
RUR|Rurutu Airport||PF|-22.434|-151.361|Pacific/Honolulu|m|s|
RUT|Rutland - Southern Vermont Regional Airport|Rutland|US|43.529|-72.95|America/New_York|m|s|
RUV|Rubelsanto Airport|Rubelsanto|GT|15.992|-90.445|America/Guatemala|m|n|
RVK|Rørvik Airport, Ryum|Rørvik|NO|64.838|11.146|Europe/Berlin|m|s|
RVN|Rovaniemi Airport|Rovaniemi|FI|66.563|25.83|Europe/Helsinki|l|s|
RVS|Tulsa Riverside Airport|Tulsa|US|36.04|-95.985|America/Chicago|m|n|
RVY|Pres. Gral. Óscar D. Gestido Binational Airport|Rivera/Santana do Livramento|UY|-30.975|-55.476|America/Montevideo|m|s|Santana do Livramento, Cerro Chapeu International Airport
RWF|Redwood Falls Municipal Airport|Redwood Falls|US|44.547|-95.082|America/Chicago|m|n|
RWI|Rocky Mount Wilson Regional Airport|Rocky Mount|US|35.856|-77.892|America/New_York|m|n|
RWL|Rawlins Municipal Airport/Harvey Field|Rawlins|US|41.806|-107.2|America/Denver|m|n|
RWN|Rivne International Airport|Rivne|UA|50.607|26.142|Europe/Kyiv|m|n|Міжнародний аеропорт Рівне
RXS|Roxas Airport|Roxas City|PH|11.598|122.752|Asia/Manila|m|s|
RYB|Staroselye Airport|Rybinsk|RU|58.104|38.929|Europe/Moscow|m|n|Аэропорт Староселье, ЬУБК, УУБК, Рыбинск
RYK|Shaikh Zaid Airport|Rahim Yar Khan|PK|28.384|70.28|Asia/Karachi|m|s|Rahim Yar Khan Airport
RYN|Royan-Médis Airport|Royan/Médis|FR|45.628|-0.973|Europe/Paris|m|n|
RZA|Santa Cruz Airport|Puerto Santa Cruz|AR|-50.017|-68.579|America/Argentina/Rio_Gallegos|m|n|
RZE|Rzeszów-Jasionka Airport|Jasionka|PL|50.11|22.024|Europe/Warsaw|l|s|
RZR|Ramsar Airport|Ramsar|IR|36.907|50.687|Asia/Tehran|m|s|
RZV|Rize–Artvin Airport|Rize|TR|41.18|40.849|Europe/Istanbul|m|s|
SAB|Juancho E. Yrausquin Airport|Zion's Hill|BQ|17.645|-63.221|America/Puerto_Rico|m|s|The Bottom, Saba
SAC|Sacramento Executive Airport|Sacramento|US|38.513|-121.493|America/Los_Angeles|m|n|Sutterville Aerodrome, Sacramento Municipal
SAF|Santa Fe Municipal Airport|Santa Fe|US|35.617|-106.089|America/Denver|m|s|
SAG|Shirdi International Airport|Kakadi|IN|19.689|74.374|Asia/Kolkata|l|s|Ahmednagar, Saibaba
SAH|Sanaa International Airport|Sanaa|YE|15.476|44.22|Asia/Riyadh|l|s|
SAI|Siem Reap-Angkor International Airport|Siem Reap|KH|13.37|104.224|Asia/Jakarta|l|s|
SAL|El Salvador International Airport Saint Óscar Arnulfo Romero y Galdámez|San Salvador (San Luis Talpa)|SV|13.444|-89.056|America/El_Salvador|l|s|Monseñor Óscar Arnulfo Romero International Airport, Comalapa International Airport
SAN|San Diego International Airport|San Diego|US|32.734|-117.19|America/Los_Angeles|l|s|Lindbergh Field
SAP|Ramón Villeda Morales International Airport|San Pedro Sula|HN|15.453|-87.924|America/Tegucigalpa|l|s|
SAQ|San Andros Airport|Andros Island|BS|25.054|-78.049|America/Toronto|m|s|
SAT|San Antonio International Airport|San Antonio|US|29.534|-98.47|America/Chicago|l|s|
SAV|Savannah Hilton Head International Airport|Savannah|US|32.127|-81.2|America/New_York|l|s|
SAW|Istanbul Sabiha Gökçen International Airport|Pendik, Istanbul|TR|40.899|29.309|Europe/Istanbul|l|s|Sabiha Gökçen Havalimanı
SBA|Santa Barbara Municipal Airport|Santa Barbara|US|34.426|-119.84|America/Los_Angeles|m|s|
SBD|San Bernardino International Airport|San Bernardino|US|34.097|-117.237|America/Los_Angeles|l|s|Norton AFB, San Bernardino Air Depot
SBH|St. Jean Airport|Gustavia|BL|17.904|-62.843|America/Puerto_Rico|m|s|Gustaf III Rémy de Haenen, Saint Barthélemy Airport, Saint-Jean, Aérodrome de St Jean, Saint Barth, St. Barts
SBK|Saint-Brieuc-Armor Airport|Trémuson, Côtes-d'Armor|FR|48.539|-2.854|Europe/Paris|m|n|
SBL|Santa Ana Del Yacuma Airport|Santa Ana del Yacuma|BO|-13.762|-65.435|America/Puerto_Rico|m|n|
SBN|South Bend International Airport|South Bend|US|41.708|-86.317|America/Indiana/Indianapolis|m|s|
SBP|San Luis County Regional Airport|San Luis Obispo|US|35.237|-120.642|America/Los_Angeles|m|s|SLO Airport
SBT|Sabetta International Airport|Sabetta|RU|71.219|72.052|Asia/Yekaterinburg|m|s|Oil & Gas, Yamal LNG project, Sabetta terminal port, NOVATEK
SBU|Springbok Airport|Springbok|ZA|-29.689|17.94|Africa/Johannesburg|m|n|
SBW|Sibu Airport|Sibu|MY|2.262|111.985|Asia/Makassar|m|s|
SBY|Salisbury Ocean City Wicomico Regional Airport|Salisbury|US|38.34|-75.51|America/New_York|m|s|
SBZ|Sibiu International Airport|Sibiu|RO|45.786|24.087|Europe/Bucharest|l|s|
SCC|Deadhorse Airport|Deadhorse|US|70.195|-148.465|America/Anchorage|m|s|
SCE|State College Regional Airport|State College|US|40.849|-77.849|America/New_York|m|s|University Park
SCH|Schenectady County Airport|Schenectady|US|42.853|-73.929|America/New_York|m|n|
SCI|Paramillo Airport|San Cristóbal|VE|7.801|-72.203|America/Caracas|m|n|
SCK|Stockton Metropolitan Airport|Stockton|US|37.893|-121.238|America/Los_Angeles|m|s|
SCL|Comodoro Arturo Merino Benítez International Airport|Santiago|CL|-33.393|-70.786|America/Santiago|l|s|
SCN|Saarbrücken Airport|Saarbrücken|DE|49.215|7.11|Europe/Berlin|m|s|
SCO|Aktau International Airport|Aktau|KZ|43.86|51.091|Asia/Aqtau|l|s|Akshukyr
SCQ|Santiago-Rosalía de Castro Airport|Santiago de Compostela|ES|42.896|-8.415|Europe/Madrid|l|s|
SCR|Scandinavian Mountains Airport|Malung-Sälen|SE|61.165|12.834|Europe/Berlin|l|s|Sälens Flygplats, Trysil, Sälen Trysil Airport, Sälen/Scandinavian Mountains Airport
SCT|Socotra Airport|Mori|YE|12.632|53.906|Asia/Riyadh|m|s|Hadibu
SCU|Antonio Maceo International Airport|Santiago|CU|19.975|-75.836|America/Havana|l|s|
SCV|Suceava Ștefan cel Mare International Airport|Suceava|RO|47.688|26.354|Europe/Bucharest|l|s|
SCW|Syktyvkar Airport|Syktyvkar|RU|61.647|50.845|Europe/Moscow|m|s|
SDB|Langebaanweg Airport|Langebaanweg|ZA|-32.969|18.16|Africa/Johannesburg|m|n|
SDD|Lubango Mukanka International Airport|Lubango|AO|-14.925|13.577|Africa/Lagos|m|s|
SDE|Vicecomodoro Angel D. La Paz Aragonés Airport|Santiago del Estero|AR|-27.766|-64.31|America/Argentina/Cordoba|m|s|
SDF|Louisville Muhammad Ali International Airport|Louisville|US|38.171|-85.735|America/Kentucky/Louisville|l|s|Louisville International, Standiford Field
SDG|Sanandaj Airport||IR|35.246|47.009|Asia/Tehran|m|s|
SDJ|Sendai Airport|Natori|JP|38.14|140.917|Asia/Tokyo|l|s|
SDK|Sandakan Airport|Sandakan|MY|5.901|118.059|Asia/Makassar|m|s|
SDL|Sundsvall-Härnösand Airport|Sundsvall/ Härnösand|SE|62.528|17.444|Europe/Berlin|m|s|
SDM|Brown Field Municipal Airport|San Diego|US|32.573|-116.98|America/Los_Angeles|m|n|
SDP|Sand Point Airport|Sand Point|US|55.314|-160.522|America/Anchorage|m|s|
SDQ|Las Américas International Airport|Santo Domingo|DO|18.43|-69.669|America/Santo_Domingo|l|s|Aeropuerto Internacional de Las Américas, José Francisco Peña Gómez Intl
SDR|Seve Ballesteros-Santander Airport|Santander|ES|43.427|-3.82|Europe/Madrid|m|s|
SDS|Sado Airport|Sado|JP|38.06|138.414|Asia/Tokyo|m|s|
SDT|Saidu Sharif Airport|Saidu Sharif|PK|34.814|72.353|Asia/Karachi|m|n|
SDU|Santos Dumont Airport|Rio de Janeiro|BR|-22.91|-43.163|America/Sao_Paulo|l|s|RIO
SDW|Sindhudurg Airport|Chipi|IN|16.003|73.53|Asia/Kolkata|m|s|VA85
SDY|Sidney - Richland Regional Airport|Sidney|US|47.705|-104.194|America/Denver|m|s|
SEA|Seattle–Tacoma International Airport|Seattle|US|47.448|-122.31|America/Los_Angeles|l|s|Sea-Tac Airport, SeaTac Airport
SEB|Sabha Airport|Sabha|LY|26.992|14.466|Africa/Tripoli|m|s|Sebha
SEK|Srednekolymsk Airport|Srednekolymsk|RU|67.481|153.736|Asia/Srednekolymsk|m|s|УЕСК, Среднеколымск
SEN|London Southend Airport|Southend-on-Sea, Essex|GB|51.571|0.694|Europe/London|m|s|RAF Rochford
SES|Svetlogorsk Airport|Svetlogorsk|RU|66.84|88.403|Asia/Krasnoyarsk|m|n|
SEZ|Seychelles International Airport|Victoria|SC|-4.674|55.522|Asia/Dubai|l|s|Aéroport de la Pointe Larue, Point La Rue, Point Larue, Mahé Island
SFA|Sfax Thyna International Airport|Sfax|TN|34.718|10.691|Africa/Tunis|m|s|
SFB|Orlando Sanford International Airport|Orlando|US|28.774|-81.235|America/New_York|l|s|
SFD|San Fernando de Apure Las Flecheras National Airport|San Fernando de Apure|VE|7.883|-67.444|America/Caracas|m|n|
SFE|San Fernando Airport|San Fernando|PH|16.596|120.303|Asia/Manila|m|n|
SFF|Felts Field|Spokane|US|47.683|-117.322|America/Los_Angeles|m|n|Parkwater Airstrip
SFG|Grand Case-l'Espérance Airport|Grand Case|MF|18.1|-63.047|America/Puerto_Rico|m|s|Aérodrome de Grand-Case Espérance, CCE, Saint-Martin
SFJ|Kangerlussuaq International Airport|Kangerlussuaq|GL|67.01|-50.715|America/Nuuk|m|s|Bluie West 8, Sondrestrom Air Base, Sondrestromfjord Air Base
SFN|Sauce Viejo Airport|Santa Fe|AR|-31.712|-60.812|America/Argentina/Cordoba|m|s|
SFO|San Francisco International Airport|San Francisco|US|37.62|-122.375|America/Los_Angeles|l|s|QSF, QBA
SFS|Subic Bay International Airport / Naval Air Station Cubi Point|Olongapo|PH|14.795|120.272|Asia/Manila|l|s|Paliparang Pandaigdig ng Look ng Subic
SFT|Skellefteå Airport|Skellefteå|SE|64.625|21.077|Europe/Berlin|m|s|
SGC|Surgut International Airport|Surgut|RU|61.341|73.406|Asia/Yekaterinburg|l|s|
SGD|Sønderborg Airport|Sønderborg|DK|54.964|9.792|Europe/Berlin|m|s|Sonderborg, Soenderborg
SGE|Siegerland Airport|Burbach|DE|50.708|8.083|Europe/Berlin|m|n|EDKS
SGF|Springfield Branson National Airport|Springfield|US|37.245|-93.389|America/Chicago|m|s|
SGH|Springfield-Beckley Municipal Airport|Springfield|US|39.84|-83.84|America/New_York|m|n|
SGI|Mushaf Air Base|Sargodha|PK|32.049|72.665|Asia/Karachi|m|n|BHW
SGL|Danilo Atienza Air Base|Cavite|PH|14.495|120.904|Asia/Manila|m|n|NSP, Sangley Point Air Base, Sangley Point International Airport
SGN|Tan Son Nhat International Airport|Ho Chi Minh City|VN|10.819|106.652|Asia/Ho_Chi_Minh|l|s|Tansonnhat, Sài Gòn, Saigon, Sân bay Quốc tế Tân Sơn Nhất, Tan Son Nhut Air Base, Tan Son Nhut Airfield
SGR|Sugar Land Regional Airport|Houston|US|29.622|-95.657|America/Chicago|m|n|Hull Field
SGU|St George Regional Airport|St George|US|37.036|-113.51|America/Denver|m|s|DXZ
SGZ|Songkhla Airport||TH|7.187|100.608|Asia/Jakarta|m|n|
SHA|Shanghai Hongqiao International Airport|Shanghai (Minhang)|CN|31.198|121.334|Asia/Shanghai|l|s|上海, 上海虹桥, 上海虹桥国际机场
SHB|Nakashibetsu Airport|Nakashibetsu|JP|43.577|144.96|Asia/Tokyo|m|s|
SHD|Shenandoah Valley Regional Airport|Weyers Cave|US|38.264|-78.896|America/New_York|m|s|Harrisonburg, Staunton, Waynesboro
SHE|Shenyang Taoxian International Airport|Shenyang|CN|41.64|123.484|Asia/Shanghai|l|s|沈阳, 沈阳桃仙国际机场
SHI|Shimojishima Airport|Miyakojima|JP|24.827|125.145|Asia/Tokyo|m|s|Miyako, Shimojijima
SHJ|Sharjah International Airport|Sharjah|AE|25.329|55.517|Asia/Dubai|l|s|
SHL|Shillong Airport|Shillong|IN|25.704|91.979|Asia/Kolkata|m|s|Barapani Airport, Barapani Air Force Station, Umroi Airport
SHM|Nanki Shirahama Airport|Shirahama|JP|33.662|135.364|Asia/Tokyo|m|s|
SHO|King Mswati III International Airport|Mpaka|SZ|-26.359|31.717|Africa/Johannesburg|l|s|Sikhuphe International Airport
SHR|Sheridan County Airport|Sheridan|US|44.769|-106.98|America/Denver|m|s|
SHS|Jingzhou Shashi Airport|Jingzhou (Shashi)|CN|30.293|112.449|Asia/Shanghai|m|s|
SHT|Shepparton Airport||AU|-36.428|145.391|Australia/Melbourne|m|n|
SHV|Shreveport Regional Airport|Shreveport|US|32.445|-93.827|America/Chicago|m|s|
SHW|Sharurah Domestic Airport|Sharurah|SA|17.467|47.121|Asia/Riyadh|m|s|
SIA|Xi'an Xiguan Airport|Xi'an (Baqiao)|CN|34.377|109.12|Asia/Shanghai|m|n|Lintong Air Base
SID|Amílcar Cabral International Airport|Espargos|CV|16.741|-22.949|Atlantic/Cape_Verde|l|s|Sal Island
SIG|Fernando Luis Ribas Dominicci Airport|San Juan|PR|18.457|-66.098|America/Puerto_Rico|m|s|Isla Grande
SIJ|Siglufjörður Airport|Siglufjörður|IS|66.138|-18.908|Africa/Abidjan|m|n|
SIN|Singapore Changi Airport|Singapore|SG|1.35|103.994|Asia/Singapore|l|s|RAF Changi
SIO|Smithton Airport||AU|-40.835|145.084|Australia/Hobart|m|n|
SIP|Simferopol International Airport|Simferopol|UA|45.052|33.975|Europe/Simferopol|l|n|
SIR|Sion Airport|Sion|CH|46.219|7.327|Europe/Zurich|m|n|LSMS
SIS|Sishen Airport|Sishen|ZA|-27.649|22.999|Africa/Johannesburg|m|s|
SIT|Sitka Rocky Gutierrez Airport|Sitka|US|57.047|-135.362|America/Sitka|m|s|
SJC|Mineta San Jose International Airport|San Jose|US|37.362|-121.929|America/Los_Angeles|l|s|
SJD|Los Cabos International Airport|San José del Cabo|MX|23.152|-109.721|America/Mazatlan|l|s|
SJE|Jorge E. Gonzalez Torres Airport|San José Del Guaviare|CO|2.58|-72.639|America/Bogota|m|s|
SJI|San Jose Airport|San Jose|PH|12.361|121.047|Asia/Manila|m|s|McGuire Field
SJJ|Sarajevo International Airport|Sarajevo|BA|43.825|18.331|Europe/Belgrade|l|s|
SJK|Professor Urbano Ernesto Stumpf Airport|São José Dos Campos|BR|-23.229|-45.861|America/Sao_Paulo|m|s|
SJL|São Gabriel da Cachoeira Airport|São Gabriel da Cachoeira|BR|-0.148|-66.986|America/Manaus|m|s|Uaupés
SJO|Juan Santamaría International Airport|San José (Alajuela)|CR|9.994|-84.209|America/Costa_Rica|l|s|
SJP|Prof. Eribelto Manoel Reino State Airport|São José do Rio Preto|BR|-20.817|-49.407|America/Sao_Paulo|m|s|São José do Rio Preto Airport
SJT|San Angelo Regional Mathis Field|San Angelo|US|31.358|-100.496|America/Chicago|m|s|
SJU|Luis Munoz Marin International Airport|San Juan|PR|18.439|-66.002|America/Puerto_Rico|l|s|Isla Verde
SJW|Shijiazhuang Zhengding International Airport|Shijiazhuang|CN|38.281|114.697|Asia/Shanghai|l|s|Daguocun
SJX|Sartaneja Airport|Sartaneja|BZ|18.356|-88.131|America/Belize|m|n|
SJY|Seinäjoki Airport|Seinäjoki / Ilmajoki|FI|62.692|22.832|Europe/Helsinki|m|n|
SJZ|São Jorge Airport|Velas|PT|38.666|-28.176|Atlantic/Azores|m|s|
SKA|Fairchild Air Force Base|Spokane|US|47.615|-117.656|America/Los_Angeles|m|n|
SKB|Robert L. Bradshaw International Airport|Basseterre|KN|17.311|-62.719|America/Puerto_Rico|l|s|
SKD|Samarkand International Airport|Samarkand|UZ|39.702|66.981|Asia/Samarkand|l|s|UTSS
SKF|Lackland Air Force Base|San Antonio|US|29.384|-98.581|America/Chicago|m|n|Kelly Field Annex, Lackland AFB
SKG|Thessaloniki Macedonia International Airport|Thessaloniki|GR|40.519|22.97|Europe/Athens|l|s|Makedonia. Macedonia. Salonica
SKN|Stokmarknes Airport, Skagen|Hadsel|NO|68.579|15.033|Europe/Berlin|m|s|Stokmarknes lufthavn
SKO|Sadiq Abubakar III International Airport|Sokoto|NG|12.916|5.208|Africa/Lagos|l|s|Sultan Saddik Abubakar Airport
SKP|Skopje International Airport|Ilinden|MK|41.958|21.623|Europe/Belgrade|l|s|Petrovec
SKS|Skrydstrup Air Base|Vojens|DK|55.221|9.267|Europe/Berlin|m|n|
SKT|Sialkot International Airport|Sialkot|PK|32.536|74.365|Asia/Karachi|l|s|سیالکوٹ بین الاقوامی ہوائی اڈا
SKV|Saint Catherine International Airport|Saint Catherine|EG|28.684|34.064|Africa/Cairo|m|n|
SKX|Saransk International Airport|Saransk|RU|54.125|45.212|Europe/Moscow|l|s|Аэропорт Саранск
SKZ|Begum Nusrat Bhutto International Airport Sukkur|Sukkur|PK|27.722|68.792|Asia/Karachi|m|s|Sukkur Airport
SLA|Martín Miguel de Güemes International Airport|Salta|AR|-24.856|-65.486|America/Argentina/Salta|l|s|
SLC|Salt Lake City International Airport|Salt Lake City|US|40.789|-111.98|America/Denver|l|s|
SLD|Sliač Airport|Sliač|SK|48.638|19.134|Europe/Prague|m|s|
SLE|Salem-Willamette Valley Airport/McNary Field|Salem|US|44.91|-123.003|America/Los_Angeles|m|s|4OR1
SLK|Adirondack Regional Airport|Saranac Lake|US|44.387|-74.205|America/New_York|m|s|
SLL|Salalah International Airport|Salalah|OM|17.039|54.091|Asia/Dubai|l|s|مطار صلالة
SLM|Salamanca Airport|Salamanca|ES|40.952|-5.502|Europe/Madrid|m|s|
SLN|Salina Municipal Airport|Salina|US|38.791|-97.652|America/Chicago|m|s|
SLP|Ponciano Arriaga International Airport|San Luis Potosí|MX|22.262|-100.936|America/Mexico_City|m|s|Estafeta
SLU|George F. L. Charles Airport|Castries|LC|14.02|-60.993|America/Puerto_Rico|m|s|Vigie Airport
SLW|Plan de Guadalupe International Airport|Saltillo|MX|25.538|-100.928|America/Monterrey|m|s|Saltillo International Airport
SLY|Salekhard Airport|Salekhard|RU|66.591|66.611|Asia/Yekaterinburg|m|s|
SLZ|Marechal Cunha Machado International Airport|São Luís|BR|-2.586|-44.235|America/Fortaleza|l|s|
SMA|Santa Maria Airport|Vila do Porto|PT|36.971|-25.171|Atlantic/Azores|m|s|
SME|Lake Cumberland Regional Airport|Somerset|US|37.053|-84.616|America/New_York|m|n|
SMF|Sacramento International Airport|Sacramento|US|38.695|-121.591|America/Los_Angeles|l|s|
SMI|Samos Airport|Samos Island|GR|37.69|26.912|Europe/Athens|m|s|
SML|Stella Maris Airport|Stella Maris|BS|23.582|-75.269|America/Toronto|m|s|
SMN|Lemhi County Airport|Salmon|US|45.122|-113.882|America/Boise|m|s|
SMO|Santa Monica Municipal Airport|Santa Monica|US|34.016|-118.451|America/Los_Angeles|m|n|Clover Field
SMR|Simón Bolívar International Airport|Santa Marta|CO|11.12|-74.231|America/Bogota|m|s|
SMS|Sainte Marie Airport|Vohilava|MG|-17.094|49.816|Asia/Riyadh|m|s|
SMV|Engadin Airport|Samedan|CH|46.534|9.884|Europe/Zurich|m|n|
SMW|Smara Airport|Smara|EH|26.732|-11.684|Africa/El_Aaiun|m|s|GSMA, Semara, Semara Airport
SMX|Santa Maria Public Airport Captain G Allan Hancock Field|Santa Maria|US|34.899|-120.457|America/Los_Angeles|m|s|
SNA|John Wayne Orange County International Airport|Santa Ana|US|33.675|-117.869|America/Los_Angeles|l|s|Disney, Disneyland
SNB|Snake Bay Airport|Milikapiti|AU|-11.418|130.648|Australia/Darwin|m|s|YSNB, Austin Strip, RAAF Melville Island
SNC|General Ulpiano Paez International Airport|Salinas/La Libertad|EC|-2.21|-80.985|America/Guayaquil|l|s|
SNE|Preguiça Airport|Preguiça|CV|16.589|-24.284|Atlantic/Cape_Verde|m|s|Sao Nicolau Island
SNF|Sub Teniente Nestor Arias Airport|San Felipe|VE|10.279|-68.755|America/Caracas|m|n|
SNI|Greenville/Sinoe Airport|Greenville|LR|5.032|-9.064|Africa/Monrovia|m|n|R E Murray
SNJ|San Julián Air Base|Sandino|CU|22.101|-84.157|America/Havana|m|n|
SNN|Shannon Airport|Shannon|IE|52.702|-8.925|Europe/London|l|s|
SNO|Sakon Nakhon Airport||TH|17.195|104.119|Asia/Jakarta|m|s|
SNP|St Paul Island Airport|St Paul Island|US|57.166|-170.223|America/Nome|m|s|Pribilof
SNR|Saint-Nazaire-Montoir Airport|Saint-Nazaire/Montoir|FR|47.311|-2.153|Europe/Paris|m|n|
SNS|Salinas Municipal Airport|Salinas|US|36.663|-121.606|America/Los_Angeles|m|n|
SNU|Abel Santamaria International Airport|Santa Clara|CU|22.492|-79.943|America/Havana|l|s|
SNV|Santa Elena de Uairén Airport|Santa Elena de Uairén|VE|4.555|-61.145|America/Caracas|m|s|
SNW|Thandwe Airport|Thandwe|MM|18.461|94.3|Asia/Yangon|m|s|
SNY|Sidney Municipal Airport Lloyd W Carr Field|Sidney|US|41.101|-102.985|America/Denver|m|n|
SNZ|Santa Cruz Air Force Base|Rio de Janeiro|BR|-22.932|-43.719|America/Sao_Paulo|m|n|Santa Cruz AB, Bartolomeu de Gusmão Airport
SOB|Hévíz–Balaton Airport|Sármellék|HU|46.686|17.159|Europe/Budapest|m|s|Sármellék International, FlyBatalon Airport, Batalon Airport, Sármellék Nemzetközi Repülőtér
SOC|Adisoemarmo International Airport|Surakarta|ID|-7.516|110.757|Asia/Jakarta|l|s|WRSQ, WARQ, Adi Soemarmo, Adi Sumarmo
SOF|Sofia Airport|Sofia|BG|42.696|23.418|Europe/Sofia|l|s|Sofia International Airport, Vrazhdebna Air Base
SOJ|Sørkjosen Airport|Sørkjosen|NO|69.787|20.959|Europe/Berlin|m|s|
SOM|San Tomé Airport|El Tigre|VE|8.945|-64.151|America/Caracas|m|s|Don Edmundo Barrios, San José de Guanipa
SON|Santo Pekoa International Airport|Luganville|VU|-15.505|167.22|Pacific/Efate|m|s|
SOO|Söderhamn Airport|Söderhamn|SE|61.262|17.099|Europe/Berlin|m|n|
SOQ|Domine Eduard Osok Airport|Sorong|ID|-0.894|131.287|Asia/Tokyo|m|s|WAXX
SOT|Sodankyla Airport|Sodankyla|FI|67.395|26.619|Europe/Helsinki|m|n|
SOU|Southampton Airport|Southampton|GB|50.95|-1.357|Europe/London|m|s|RAF Eastleigh, RAF Southampton
SOW|Show Low Regional Airport|Show Low|US|34.264|-110.007|America/Phoenix|m|s|
SOZ|Solenzara (BA 126) Air Base|Solenzara|FR|41.924|9.406|Europe/Paris|m|n|
SPC|La Palma Airport|Sta Cruz de la Palma, La Palma Island|ES|28.626|-17.756|Atlantic/Canary|m|s|
SPD|Saidpur Airport|Saidpur|BD|25.759|88.909|Asia/Dhaka|m|s|
SPI|Abraham Lincoln Capital Airport|Springfield|US|39.844|-89.678|America/Chicago|m|s|
SPM|Spangdahlem Air Base|Trier|DE|49.977|6.698|Europe/Berlin|m|n|
SPN|Saipan International Airport|I Fadang, Saipan|MP|15.119|145.729|Pacific/Guam|m|s|Francisco C. Ada
SPP|Menongue Airport|Menongue|AO|-14.658|17.72|Africa/Lagos|m|s|
SPR|John Greif II Airport|San Pedro|BZ|17.914|-87.971|America/Belize|m|s|
SPS|Wichita Falls Municipal Airport / Sheppard Air Force Base|Wichita Falls|US|33.989|-98.492|America/Chicago|m|s|
SPU|Split Saint Jerome Airport|Split|HR|43.539|16.298|Europe/Belgrade|l|s|
SPX|Sphinx International Airport|Al Jiza|EG|30.108|30.896|Africa/Cairo|l|s|الجيزة
SPY|San Pedro Airport||CI|4.747|-6.661|Africa/Abidjan|m|s|
SQD|Shangrao Sanqingshan Airport|Shangrao (Hengfeng)|CN|28.38|117.964|Asia/Shanghai|m|s|
SQG|Tebelian Airport|Sintang|ID|-0.045|111.458|Asia/Pontianak|m|s|
SQJ|Sanming Shaxian Airport|Sanming (Sha)|CN|26.426|117.834|Asia/Shanghai|m|s|
SQL|San Carlos Airport|San Carlos|US|37.513|-122.251|America/Los_Angeles|m|s|San Carlos-Belmont Airport, San Mateo Country Airport
SQO|Storuman Airport|Storuman|SE|64.961|17.697|Europe/Berlin|m|n|
SQQ|Šiauliai International Airport|Šiauliai|LT|55.894|23.395|Europe/Vilnius|m|n|Zokniai Airport, Zoknių oro uostas
SQW|Skive Airport|Skive|DK|56.55|9.173|Europe/Berlin|m|n|
SRE|Alcantarí International Airport|Sucre|BO|-19.247|-65.15|America/Puerto_Rico|l|s|Yamparaez
SRG|Jenderal Ahmad Yani Airport|Semarang|ID|-6.971|110.373|Asia/Jakarta|l|s|WIIS, WARS
SRP|Stord Airport, Sørstokken|Leirvik|NO|59.792|5.341|Europe/Berlin|m|s|Sorstokken
SRQ|Sarasota Bradenton International Airport|Sarasota/Bradenton|US|27.395|-82.554|America/New_York|l|s|
SRT|Soroti Airport|Soroti|UG|1.728|33.623|Asia/Riyadh|m|s|
SRX|Sirt International Airport / Ghardabiya Airbase|Sirt|LY|31.059|16.597|Africa/Tripoli|l|n|Gardabiya, Sirte
SRY|Sari Dasht-e Naz International Airport|Sari|IR|36.644|53.189|Asia/Tehran|m|s|
SRZ|El Trompillo Airport|Santa Cruz|BO|-17.812|-63.172|America/Puerto_Rico|m|s|
SSA|Deputado Luiz Eduardo Magalhães International Airport|Salvador|BR|-12.909|-38.322|America/Bahia|l|s|Dois de Julho
SSC|Shaw Air Force Base|Sumter|US|33.973|-80.471|America/New_York|m|n|
SSE|Solapur Airport|Solapur|IN|17.628|75.935|Asia/Kolkata|m|n|Sholapur
SSF|Stinson Municipal Airport|San Antonio|US|29.337|-98.471|America/Chicago|m|n|
SSG|Malabo International Airport|Malabo|GQ|3.755|8.709|Africa/Lagos|l|s|Fernando Poo
SSH|Sharm El Sheikh International Airport|Sharm El Sheikh|EG|27.977|34.395|Africa/Cairo|l|s|
SSI|St Simons Island Airport|St Simons Island|US|31.152|-81.391|America/New_York|m|n|Malcolm McKinnon, NAS St. Simons Island, Brunswick
SSJ|Sandnessjøen Airport, Stokka|Alstahaug|NO|65.957|12.469|Europe/Berlin|m|s|
SSN|Seoul Air Base (K-16)|Seongnam|KR|37.445|127.113|Asia/Seoul|m|n|
SST|Santa Teresita Airport|Santa Teresita|AR|-36.542|-56.722|America/Argentina/Buenos_Aires|m|s|
SSY|Mbanza Congo Airport|Mbanza Congo|AO|-6.27|14.247|Africa/Lagos|m|s|
SSZ|Santos Nero Moura Air Base / Guarujá Airport|Guarujá|BR|-23.928|-46.3|America/Sao_Paulo|m|n|
STA|Stauning Vestjylland Airport|Skjern|DK|55.99|8.354|Europe/Berlin|m|n|Ringkøbing
STB|Miguel Urdaneta Fernández Airport|San Carlos del Zulia|VE|8.975|-71.943|America/Caracas|m|n|Relámpago del Catatumbo National, Santa Bárbara del Zulia
STC|Saint Cloud Regional Airport|Saint Cloud|US|45.547|-94.06|America/Chicago|m|s|
STD|Mayor Buenaventura Vivas International Airport|Santo Domingo|VE|7.565|-72.035|America/Caracas|m|s|
STG|St George Airport|St George|US|56.577|-169.664|America/Nome|m|s|A8L
STI|Cibao International Airport|Santiago|DO|19.404|-70.604|America/Santo_Domingo|l|s|
STJ|Rosecrans Memorial Airport|St Joseph|US|39.772|-94.91|America/Chicago|m|n|
STL|St. Louis Lambert International Airport|St Louis|US|38.749|-90.37|America/Chicago|l|s|Lambert St Louis
STM|Santarém - Maestro Wilson Fonseca International Airport|Santarém|BR|-2.422|-54.793|America/Santarem|m|s|
STN|London Stansted Airport|London, Essex|GB|51.885|0.235|Europe/London|l|s|
STP|Saint Paul Downtown Holman Field|Saint Paul|US|44.935|-93.06|America/Chicago|m|n|St Paul
STR|Stuttgart Airport|Stuttgart|DE|48.69|9.222|Europe/Berlin|l|s|
STS|Charles M. Schulz Sonoma County Airport|Santa Rosa|US|38.509|-122.813|America/Los_Angeles|m|s|
STT|Cyril E. King Airport|Charlotte Amalie|VI|18.337|-64.977|America/Puerto_Rico|l|s|Harry S. Truman Airport
STV|Surat International Airport|Surat|IN|21.116|72.743|Asia/Kolkata|l|s|
STW|Stavropol Shpakovskoye Airport|Stavropol|RU|45.109|42.113|Europe/Moscow|m|s|
STX|Henry E. Rohlsen Airport|Christiansted|VI|17.701|-64.803|America/Puerto_Rico|m|s|St Croix
STY|Nueva Hesperides International Airport|Salto|UY|-31.438|-57.985|America/Montevideo|m|n|
SUB|Juanda International Airport|Surabaya|ID|-7.38|112.787|Asia/Jakarta|l|s|WRSJ, Sedati, Sidoarjo
SUF|Lamezia Terme Sant'Eufemia International Airport|Lamezia Terme|IT|38.906|16.246|Europe/Rome|l|s|
SUG|Surigao Airport|Surigao City|PH|9.756|125.481|Asia/Manila|m|s|
SUI|Vladislav Ardzinba Sukhum International Airport|Sukhumi|GE|42.858|41.128|Europe/Moscow|m|s|Babushara Airport, Sukhumi Dranda, UG29, URAS, Sukhumi Babushara
SUJ|Satu Mare International Airport|Satu Mare|RO|47.703|22.886|Europe/Bucharest|m|s|
SUL|Sui Airport|Sui|PK|28.645|69.177|Asia/Karachi|m|n|
SUN|Friedman Memorial Airport|Hailey|US|43.504|-114.296|America/Boise|m|s|
SUS|Spirit of St Louis Airport|St Louis|US|38.662|-90.652|America/Chicago|m|n|
SUU|Travis Air Force Base|Fairfield|US|38.263|-121.927|America/Los_Angeles|m|n|
SUV|Nausori International Airport|Nausori|FJ|-18.044|178.561|Pacific/Fiji|l|s|
SUX|Sioux Gateway Airport / Brigadier General Bud Day Field|Sioux City|US|42.398|-96.382|America/Chicago|m|s|Col. Bud Day, Sioux City AB, Sioux City AAB
SVA|Savoonga Airport|Savoonga|US|63.686|-170.493|America/Nome|m|s|
SVB|Sambava Airport|Sambava|MG|-14.279|50.175|Asia/Riyadh|m|s|
SVC|Grant County Airport|Silver City|US|32.637|-108.155|America/Denver|m|s|
SVD|Argyle International Airport|Kingstown|VC|13.16|-61.149|America/Puerto_Rico|l|s|
SVG|Stavanger Airport, Sola|Stavanger|NO|58.877|5.638|Europe/Berlin|l|s|Sola Air Station, Stavanger lufthavn
SVI|Eduardo Falla Solano Airport|San Vicente Del Caguán|CO|2.152|-74.766|America/Bogota|m|s|
SVJ|Svolvær Airport, Helle|Svolvær|NO|68.243|14.669|Europe/Berlin|m|s|Svolvær lufthavn
SVL|Savonlinna Airport|Savonlinna|FI|61.943|28.945|Europe/Helsinki|m|s|
SVN|Hunter Army Air Field|Savannah|US|32.01|-81.146|America/New_York|m|n|
SVO|Sheremetyevo International Airport|Moscow|RU|55.977|37.411|Europe/Moscow|l|s|УУЕЕ, Москва, MOW, Международный аэропорт Шереметьево, Alexander S. Pushkin
SVP|Kuito Airport|Kuito|AO|-12.405|16.947|Africa/Lagos|m|n|
SVQ|Seville Airport|Seville|ES|37.418|-5.893|Europe/Madrid|l|s|Sevilla, Sevilla Airport
SVW|Sparrevohn LRRS Airport|Sparrevohn|US|61.097|-155.574|America/Anchorage|m|n|
SVX|Koltsovo Airport|Yekaterinburg|RU|56.743|60.803|Asia/Yekaterinburg|l|s|
SVZ|Juan Vicente Gómez International Airport|San Antonio del Tachira|VE|7.841|-72.44|America/Caracas|m|s|
SWA|Jieyang Chaoshan International Airport|Jieyang (Rongcheng)|CN|23.552|116.503|Asia/Shanghai|l|s|
SWC|Stawell Airport||AU|-37.072|142.741|Australia/Melbourne|m|n|
SWD|Seward Airport|Seward|US|60.13|-149.419|America/Anchorage|m|n|
SWF|New York Stewart International Airport|Newburgh|US|41.504|-74.109|America/New_York|m|s|
SWH|Swan Hill Airport||AU|-35.376|143.533|Australia/Melbourne|m|n|
SWO|Stillwater Regional Airport|Stillwater|US|36.162|-97.086|America/Chicago|m|s|
SWS|Swansea Airport|Swansea|GB|51.601|-4.071|Europe/London|m|n|Abertawe, Fairwood Common, RAF Fairwood Common, Maes Awyr Abertawe
SWT|Strezhevoy Airport|Strezhevoy|RU|60.709|77.66|Asia/Tomsk|m|n|Аэропорт Стрежевой
SWU|Suwon Airport|Suwon|KR|37.239|127.007|Asia/Seoul|m|n|
SWV|Severo-Evensk Airport|Evensk|RU|61.922|159.229|Asia/Magadan|m|n|Аэропорт Северо-Эвенск
SXB|Strasbourg Airport|Strasbourg|FR|48.538|7.628|Europe/Paris|l|s|BA 124
SXE|West Sale Airport|Sale|AU|-38.091|146.965|Australia/Melbourne|m|n|
SXI|Siri Airport|Siri|IR|25.909|54.539|Asia/Tehran|m|n|
SXJ|Shanshan Airport|Shanshan|CN|42.912|90.247|Asia/Shanghai|m|n|
SXL|Sligo Airport|Sligo|IE|54.28|-8.599|Europe/London|m|n|
SXM|Princess Juliana International Airport|Sint Maarten|SX|18.041|-63.109|America/Puerto_Rico|l|s|Saint Martin, Maho Beach, Simpson Bay
SXN|Sua Pan Airport|Sowa|BW|-20.553|26.116|Africa/Johannesburg|m|n|
SXQ|Soldotna Airport|Soldotna|US|60.475|-151.038|America/Anchorage|m|n|
SXR|Srinagar International Airport|Srinagar|IN|33.987|74.774|Asia/Kolkata|l|s|Srinagar Air Force Station
SXV|Salem Airport|Salem|IN|11.783|78.066|Asia/Kolkata|m|n|
SXZ|Siirt Airport|Siirt|TR|37.979|41.84|Europe/Istanbul|m|n|
SYA|Eareckson Air Station|Shemya|US|52.712|174.114|America/Adak|m|n|
SYD|Sydney Kingsford Smith International Airport|Sydney (Mascot)|AU|-33.946|151.177|Australia/Sydney|l|s|Mascot, RAAF Station Mascot
SYJ|Sirjan Airport|Sirjan|IR|29.551|55.673|Asia/Tehran|m|n|
SYO|Shonai Airport|Shonai|JP|38.812|139.787|Asia/Tokyo|m|s|
SYP|Ruben Cantu Airport|Santiago|PA|8.086|-80.945|America/Panama|m|n|Santiago
SYQ|Tobías Bolaños International Airport|San Jose|CR|9.957|-84.14|America/Costa_Rica|m|s|Aeropuerto Internacional Tobías Bolaños Palma
SYR|Syracuse Hancock International Airport|Syracuse|US|43.111|-76.106|America/New_York|l|s|
SYS|Saskylakh Airport|Saskylakh|RU|71.928|114.08|Asia/Yakutsk|m|s|УЕРС, Аэропорт Саскылах
SYT|Saint-Yan Airport|L'Hôpital-le-Mercier, Saône-et-Loire|FR|46.414|4.014|Europe/Paris|m|n|
SYW|Sehwan Sharif Airport|Sehwan Sharif|PK|26.473|67.717|Asia/Karachi|m|n|
SYX|Sanya Phoenix International Airport|Sanya (Tianya)|CN|18.303|109.412|Asia/Shanghai|l|s|
SYY|Stornoway Airport|Stornoway, Western Isles|GB|58.216|-6.331|Europe/London|m|s|Lewis
SYZ|Shiraz Shahid Dastghaib International Airport|Shiraz|IR|29.539|52.59|Asia/Tehran|l|s|
SZA|Soyo Airport|Soyo|AO|-6.141|12.372|Africa/Lagos|m|s|
SZB|Sultan Abdul Aziz Shah International Airport|Subang|MY|3.131|101.549|Asia/Singapore|l|s|Subang SkyPark, Subang Airport, Subang International Airport
SZF|Samsun-Çarşamba Airport|Samsun|TR|41.254|36.568|Europe/Istanbul|m|s|
SZG|Salzburg Airport|Salzburg|AT|47.793|13.004|Europe/Vienna|l|s|Christophorus 6
SZH|Shuozhou Zirun Airport|Shuozhou|CN|39.273|112.692|Asia/Shanghai|m|s|朔州滋润机场
SZJ|Siguanea Airport|Isla de la Juventud|CU|21.642|-82.955|America/Havana|m|n|
SZK|Skukuza Airport|Skukuza|ZA|-24.961|31.589|Africa/Johannesburg|m|s|
SZL|Whiteman Air Force Base|Knob Noster|US|38.73|-93.548|America/Chicago|m|n|Sedalia Glider Base
SZV|Suzhou Guangfu Airport|Suzhou|CN|31.263|120.401|Asia/Shanghai|m|n|
SZX|Shenzhen Bao'an International Airport|Shenzhen|CN|22.639|113.803|Asia/Shanghai|l|s|Baoan, Huangtian Airport, 深圳, 深圳宝安国际机场
SZY|Olsztyn-Mazury Airport|Szymany|PL|53.482|20.938|Europe/Warsaw|m|s|
SZZ|Solidarity Szczecin–Goleniów Airport|Szczecin(Glewice)|PL|53.585|14.902|Europe/Warsaw|l|s|Solidarność, Glewice, Port Lotniczy Szczecin–Goleniów im. NSZZ Solidarność
TAB|A.N.R. Robinson International Airport|Scarborough|TT|11.15|-60.831|America/Puerto_Rico|l|s|Tobago-Crown Point Airport
TAC|Daniel Z. Romualdez Airport|Tacloban City|PH|11.228|125.028|Asia/Manila|m|s|Tacloban, Naval Station Dioscoro Papa
TAE|Daegu International Airport|Daegu|KR|35.894|128.657|Asia/Seoul|l|s|
TAF|Oran Tafraoui Airport|Tafraoui|DZ|35.542|-0.532|Africa/Algiers|m|n|
TAG|Bohol-Panglao International Airport|Panglao|PH|9.573|123.77|Asia/Manila|l|s|
TAH|Whitegrass Airport|Tanna Island|VU|-19.455|169.224|Pacific/Efate|m|s|
TAI|Taiz International Airport|Taiz|YE|13.686|44.139|Asia/Riyadh|m|s|Ganed Airport
TAK|Takamatsu Airport|Takamatsu|JP|34.215|134.015|Asia/Tokyo|l|s|
TAM|General Francisco Javier Mina International Airport|Ciudad Madero|MX|22.293|-97.867|America/Monterrey|m|s|Tampico
TAO|Qingdao Jiaodong International Airport|Qingdao (Jiaozhou)|CN|36.362|120.088|Asia/Shanghai|l|s|
TAP|Tapachula International Airport|Tapachula|MX|14.795|-92.37|America/Mexico_City|m|s|Aeropuerto Internacional de Tapachula
TAR|Taranto-Grottaglie Marcello Arlotta Airport|Grottaglie|IT|40.518|17.403|Europe/Rome|m|n|M Arlotta, Taranto-Grottaglie Airport, Grottaglie Airport
TAS|Tashkent International Airport|Tashkent|UZ|41.258|69.281|Asia/Tashkent|l|s|UTTT
TAT|Poprad-Tatry Airport|Poprad|SK|49.071|20.241|Europe/Prague|m|s|
TAY|Tartu Airport|Tartu|EE|58.307|26.686|Europe/Tallinn|m|s|Reola, Ülenurme Airport
TAZ|Dashoguz International Airport|Daşoguz|TM|41.76|59.836|Asia/Ashgabat|l|s|Tashauz Airport, Dashkhovuz, Dashhowuz, Daşoguz, Dasoguz, Дашогуз
TBB|Dong Tac Airport|Tuy Hoa|VN|13.05|109.334|Asia/Ho_Chi_Minh|m|s|
TBF|Tabiteuea North Airport||KI|-1.224|174.776|Pacific/Tarawa|m|n|
TBH|Tugdan Airport|Tablas Island|PH|12.311|122.085|Asia/Manila|m|s|Romblon Airport, Alcantara, Barangay Tugdan, Tablas Airport
TBI|New Bight Airport|Cat Island|BS|24.315|-75.452|America/Toronto|m|s|
TBJ|Tabarka-Aïn Draham International Airport|Tabarka|TN|36.98|8.877|Africa/Tunis|m|s|Tabarka 7 Novembre Airport
TBN|Waynesville-St. Robert Regional Airport-Forney Field|Fort Leonard Wood|US|37.742|-92.141|America/Chicago|m|s|
TBP|Captain Pedro Canga Rodríguez International Airport|Tumbes|PE|-3.552|-80.381|America/Lima|m|s|Capitan FAP Pedro Canga Rodriguez
TBS|Tbilisi International Airport|Tbilisi|GE|41.669|44.955|Asia/Tbilisi|l|s|თბილისის საერთაშორისო აეროპორტი
TBT|Tabatinga International Airport|Tabatinga|BR|-4.256|-69.936|America/Manaus|m|s|
TBU|Fua'amotu International Airport|Nuku'alofa|TO|-21.241|-175.149|Pacific/Tongatapu|l|s|
TBW|Donskoye Airport|Tambov|RU|52.806|41.483|Europe/Moscow|m|n|
TBZ|Tabriz International Airport|Tabriz|IR|38.134|46.235|Asia/Tehran|l|s|IRIAF
TCA|Tennant Creek Airport|Tennant Creek|AU|-19.634|134.183|Australia/Darwin|m|s|
TCB|Treasure Cay Airport|Treasure Cay|BS|26.745|-77.391|America/Toronto|m|s|
TCC|Tucumcari Municipal Airport|Tucumcari|US|35.183|-103.603|America/Denver|m|n|
TCE|Tulcea Danube Delta Airport|Mihail Kogălniceanu|RO|45.063|28.714|Europe/Bucharest|m|n|Cataloi Airport, Aeroportul Delta Dunării Tulcea
TCL|Tuscaloosa National Airport|Tuscaloosa|US|33.221|-87.611|America/Chicago|m|n|
TCM|McChord Air Force Base|Tacoma|US|47.138|-122.476|America/Los_Angeles|m|n|
TCO|La Florida Airport|Tumaco|CO|1.814|-78.749|America/Bogota|m|s|
TCP|Taba International Airport|Taba|EG|29.594|34.776|Africa/Cairo|m|s|
TCQ|Coronel FAP Carlos Ciriani Santa Rosa International Airport|Tacna|PE|-18.053|-70.276|America/Lima|m|s|
TCS|Truth or Consequences Municipal Airport|Truth or Consequences|US|33.237|-107.272|America/Denver|m|n|
TCX|Tabas Airport|Tabas|IR|33.668|56.893|Asia/Tehran|m|n|
TCZ|Tengchong Tuofeng Airport|Baoshan (Tengchong)|CN|24.938|98.486|Asia/Shanghai|m|s|
TDD|Teniente Av. Jorge Henrich Arauz Airport|Trinidad|BO|-14.819|-64.918|America/Puerto_Rico|m|s|
TDG|Tandag Airport|Tandag|PH|9.072|126.171|Asia/Manila|m|n|
TDK|Taldykorgan Airport|Taldykorgan|KZ|45.123|78.443|Asia/Almaty|m|s|Taldy Kurgan Airport, Taldy Kurgan Northeast Airport, Аэропорт Талды-Курган
TDL|Héroes de Malvinas Airport|Tandil|AR|-37.235|-59.229|America/Argentina/Buenos_Aires|m|n|
TDX|Trat Airport|Laem Ngop|TH|12.275|102.319|Asia/Jakarta|m|s|
TEA|Tela Airport|Tela|HN|15.776|-87.476|America/Tegucigalpa|m|n|
TEB|Teterboro Airport|Teterboro|US|40.85|-74.061|America/New_York|m|n|Manhattan, New York City, NYC
TEC|Telêmaco Borba Airport|Telêmaco Borba|BR|-24.318|-50.652|America/Sao_Paulo|m|n|SBTL
TED|Thisted Airport|Thisted|DK|57.069|8.705|Europe/Berlin|m|n|
TEE|Cheikh Larbi Tébessi Airport|Tébessi|DZ|35.432|8.121|Africa/Algiers|m|s|
TEF|Telfer Airport||AU|-21.715|122.229|Australia/Perth|m|n|
TEM|Temora Airport|Temora|AU|-34.421|147.512|Australia/Sydney|m|n|
TEN|Tongren Fenghuang Airport|Tongren (Daxing)|CN|27.883|109.309|Asia/Shanghai|m|s|
TEQ|Tekirdağ Çorlu Airport|Çorlu|TR|41.138|27.919|Europe/Istanbul|m|s|
TER|Lajes Airport|Praia da Vitória|PT|38.762|-27.091|Atlantic/Azores|m|s|Terceira Island
TET|Tete Airport|Tete|MZ|-16.105|33.64|Africa/Johannesburg|l|s|Chingozi Airport, Matundo Airport
TEU|Manapouri Airport||NZ|-45.533|167.65|Pacific/Auckland|m|n|
TEV|Teruel Airport|Teruel|ES|40.41|-1.217|Europe/Madrid|m|n|
TEX|Telluride Regional Airport|Telluride|US|37.954|-107.908|America/Denver|m|s|
TEZ|Tezpur Airport||IN|26.709|92.785|Asia/Kolkata|m|s|Salonibari Airport, Tezpur Air Force Station
TFF|Tefé Airport|Tefé|BR|-3.383|-64.724|America/Manaus|m|s|
TFN|Tenerife Norte-Ciudad de La Laguna Airport|Tenerife|ES|28.483|-16.342|Atlantic/Canary|l|s|Canary Islands, Los Rodeos, TCI, Terenife
TFS|Tenerife Sur Airport|Tenerife|ES|28.044|-16.573|Atlantic/Canary|l|s|Reina Sofía, TCI, Tenerife South
TFU|Chengdu Tianfu International Airport|Chengdu (Jianyang)|CN|30.313|104.441|Asia/Shanghai|l|s|
TGA|Tengah Air Base|Western Water Catchment|SG|1.388|103.708|Asia/Singapore|m|n|RAF Tengah
TGD|Podgorica Airport / Podgorica Golubovci Airbase|Podgorica|ME|42.359|19.252|Europe/Belgrade|l|s|Podgorica Airbase, Аеродром Подгорица, Aerodrom Podgorica
TGG|Sultan Mahmud Airport|Kuala Terengganu|MY|5.383|103.103|Asia/Singapore|m|s|
TGJ|Tiga Airport|Tiga|NC|-21.096|167.804|Pacific/Noumea|m|s|
TGK|Taganrog Yuzhny Airport|Taganrog|RU|47.198|38.849|Europe/Moscow|m|n|УРРТ, ЬРРТ, Taganrog South Airport, Аэропорт Таганрог / Южный
TGM|Târgu Mureş Transilvania International Airport|Recea|RO|46.468|24.413|Europe/Bucharest|m|s|Vidrasau, Vidrasău
TGN|Latrobe Valley Airport|Morwell|AU|-38.211|146.471|Australia/Melbourne|m|n|Traralgon, Morwell
TGO|Tongliao Airport|Tongliao|CN|43.557|122.2|Asia/Shanghai|m|s|
TGP|Podkamennaya Tunguska Airport|Bor|RU|61.59|89.994|Asia/Krasnoyarsk|m|n|Аэропорт Подкаменная Тунгуска
TGR|Touggourt Sidi Madhi Airport|Touggourt|DZ|33.068|6.089|Africa/Algiers|m|s|
TGT|Tanga Airport|Tanga|TZ|-5.092|39.071|Asia/Riyadh|m|s|
TGU|Toncontín Airport|Tegucigalpa|HN|14.061|-87.217|America/Tegucigalpa|m|s|Teniente Coronel Hernán Acosta Mejía Airport
TGZ|Angel Albino Corzo International Airport|Tuxtla Gutiérrez|MX|16.562|-93.026|America/Mexico_City|m|s|Tuxtla Gutiérrez International Airport
THE|Senador Petrônio Portela Airport|Teresina|BR|-5.06|-42.824|America/Fortaleza|m|s|
THG|Thangool Airport|Biloela|AU|-24.495|150.578|Australia/Brisbane|m|s|
THL|Tachileik Airport|Tachileik|MM|20.484|99.935|Asia/Yangon|m|s|
THN|Trollhättan-Vänersborg Airport|Trollhättan|SE|58.318|12.345|Europe/Berlin|m|s|
THQ|Tianshui Maijishan Airport|Tianshui (Maiji)|CN|34.56|105.86|Asia/Shanghai|m|s|Tianshui Air Base, 天水麦积山机场, ZBEE
THR|Mehrabad International Airport|Tehran|IR|35.689|51.314|Asia/Tehran|l|s|
THS|Sukhothai Airport||TH|17.238|99.818|Asia/Jakarta|m|s|
THU|Pituffik Space Base|Pituffik|GL|76.531|-68.701|America/Thule|m|n|Thule Air Base
THZ|Tahoua Airport|Tahoua|NE|14.876|5.265|Africa/Lagos|m|n|
TIA|Tirana International Airport Mother Teresa|Rinas|AL|41.415|19.721|Europe/Tirane|l|s|Rinas International Airport, Aeroporti Nënë Tereza
TID|Abdelhafid Boussouf Bou Chekif Airport|Tiaret|DZ|35.341|1.463|Africa/Algiers|m|n|
TIF|Taif International Airport|Taif|SA|21.485|40.544|Asia/Riyadh|l|s|Taif Airport, Ta'if Airport, Taif Regional Airport
TIH|Tikehau Airport|Tuherahera|PF|-15.12|-148.231|Pacific/Honolulu|m|s|Palliser Islands
TIJ|General Abelardo L. Rodriguez International Airport|Tijuana|MX|32.541|-116.97|America/Tijuana|l|s|
TIK|Tinker Air Force Base|Oklahoma City|US|35.415|-97.387|America/Chicago|m|n|Midwest Air Depot
TIM|Mozes Kilangin Airport|Timika|ID|-4.53|136.887|Asia/Tokyo|m|s|WABP, Tembagapura
TIN|Tindouf Airport|Tindouf|DZ|27.7|-8.167|Africa/Algiers|m|s|
TIQ|Francisco Manglona Borja / Tinian International Airport|Tinian Island|MP|14.999|145.619|Pacific/Guam|m|s|
TIR|Tirupati International Airport|Tirupati|IN|13.632|79.54|Asia/Kolkata|l|s|
TIU|Timaru Airport||NZ|-44.303|171.225|Pacific/Auckland|m|s|
TIV|Tivat Airport|Tivat|ME|42.405|18.723|Europe/Belgrade|m|s|Аеродром Тиват, Aerodrom Tivat, Zračna luka Tivat
TIW|Tacoma Narrows Airport|Tacoma|US|47.267|-122.577|America/Los_Angeles|m|s|
TIX|Space Coast Regional Airport|Titusville|US|28.515|-80.799|America/New_York|m|n|
TJA|Capitan Oriel Lea Plaza Airport|Tarija|BO|-21.556|-64.701|America/Puerto_Rico|m|s|
TJG|Warukin Airport|Tanta-Tabalong|ID|-2.217|115.436|Asia/Makassar|m|s|WRBN
TJH|Konotori Tajima Airport|Toyooka|JP|35.513|134.787|Asia/Tokyo|m|s|toyooka
TJI|Trujillo Airport|Trujillo|HN|15.927|-85.939|America/Tegucigalpa|m|n|
TJK|Tokat Airport|Tokat|TR|40.325|36.391|Europe/Istanbul|m|s|
TJM|Roshchino International Airport|Tyumen|RU|57.179|65.328|Asia/Yekaterinburg|l|s|УСТР, Тюмень, Рощино, D. I. Mendeleev, Д. И. Менделеева
TJU|Kulob International Airport|Kulob|TJ|37.988|69.805|Asia/Dushanbe|l|s|Kuylab
TKA|Talkeetna Airport|Talkeetna|US|62.32|-150.094|America/Anchorage|m|n|
TKC|Tiko Airport|Tiko|CM|4.089|9.361|Africa/Lagos|m|n|
TKD|Takoradi Airport|Sekondi-Takoradi|GH|4.896|-1.775|Africa/Abidjan|m|s|
TKF|Truckee Tahoe Airport|Truckee|US|39.319|-120.141|America/Los_Angeles|m|s|
TKG|Radin Inten II International Airport|Bandar Lampung|ID|-5.247|105.183|Asia/Jakarta|m|s|WIIT, WICT
TKH|Takhli Royal Thai Air Force Base|Takhli|TH|15.277|100.296|Asia/Jakarta|m|n|
TKK|Chuuk International Airport|Weno Island|FM|7.462|151.843|Pacific/Port_Moresby|l|s|Erhart Aten International Airport
TKN|Tokunoshima Airport|Amagi|JP|27.836|128.881|Asia/Tokyo|m|s|
TKP|Takapoto Airport||PF|-14.71|-145.246|Pacific/Honolulu|m|s|
TKS|Tokushima Awaodori Airport / JMSDF Tokushima Air Base|Tokushima|JP|34.133|134.608|Asia/Tokyo|l|s|
TKT|Tak Airport||TH|16.896|99.253|Asia/Jakarta|m|n|
TKU|Turku Airport|Turku|FI|60.514|22.263|Europe/Helsinki|l|s|
TKX|Takaroa Airport||PF|-14.456|-145.025|Pacific/Honolulu|m|s|
TLC|Adolfo López Mateos International Airport|Toluca|MX|19.337|-99.566|America/Mexico_City|l|s|Aeropuerto Internacional Adolfo López Mateos
TLE|Toliara Airport|Toliara|MG|-23.383|43.728|Asia/Riyadh|m|s|
TLH|Tallahassee International Airport|Tallahassee|US|30.401|-84.354|America/New_York|m|s|
TLJ|Tatalina LRRS Airport|Takotna|US|62.894|-155.977|America/Anchorage|m|n|
TLL|Lennart Meri Tallinn Airport|Tallinn|EE|59.413|24.833|Europe/Tallinn|l|s|Tallinna Lennujaam
TLM|Zenata – Messali El Hadj Airport|Zenata|DZ|35.013|-1.457|Africa/Algiers|l|s|Tlemcen
TLN|Toulon-Hyères Airport|Hyères, Var|FR|43.097|6.146|Europe/Paris|m|s|La Palyvestre
TLQ|Turpan Jiaohe Airport|Turpan|CN|43.031|89.099|Asia/Urumqi|m|s|
TLS|Toulouse-Blagnac Airport|Toulouse/Blagnac|FR|43.629|1.364|Europe/Paris|l|s|Airbus
TLV|Ben Gurion International Airport|Tel Aviv|IL|32.011|34.887|Asia/Jerusalem|l|s|
TLX|Panguilemo Airport|Talca|CL|-35.378|-71.602|America/Santiago|m|n|
TMB|Miami Executive Airport|Miami|US|25.648|-80.433|America/New_York|m|n|Kendall-Tamiami Executive Airport
TME|Gustavo Vargas Airport|Tame|CO|6.451|-71.76|America/Bogota|m|s|
TMH|Tanah Merah Airport|Tanah Merah|ID|-6.097|140.304|Asia/Tokyo|m|s|
TMJ|Termez Airport|Termez|UZ|37.287|67.312|Asia/Samarkand|m|s|UTST
TML|Yakubu Tali International Airport|Tamale|GH|9.554|-0.866|Africa/Abidjan|l|s|Tamale International Airport
TMM|Toamasina Ambalamanasy Airport|Toamasina|MG|-18.114|49.392|Asia/Riyadh|l|s|
TMO|Tumeremo Airport||VE|7.249|-61.529|America/Caracas|m|n|
TMP|Tampere-Pirkkala Airport|Tampere / Pirkkala|FI|61.414|23.604|Europe/Helsinki|l|s|
TMR|Aguenar – Hadj Bey Akhamok Airport|Tamanrasset|DZ|22.811|5.451|Africa/Algiers|l|s|
TMS|São Tomé International Airport|São Tomé|ST|0.378|6.712|Africa/Sao_Tome|l|s|
TMT|Trombetas Airport|Oriximiná|BR|-1.49|-56.397|America/Santarem|m|s|Porto Trombetas
TMW|Tamworth Airport|Tamworth|AU|-31.078|150.845|Australia/Sydney|m|s|
TMX|Timimoun Airport|Timimoun|DZ|29.237|0.276|Africa/Algiers|m|s|
TNA|Jinan Yaoqiang International Airport|Jinan (Licheng)|CN|36.857|117.216|Asia/Shanghai|l|s|
TND|Alberto Delgado Airport|Trinidad|CU|21.788|-79.997|America/Havana|m|s|
TNE|New Tanegashima Airport|Tanegashima|JP|30.605|130.991|Asia/Tokyo|m|s|
TNF|Toussus-le-Noble Airport|Toussus-le-Noble, Yvelines|FR|48.752|2.106|Europe/Paris|m|n|
TNG|Tangier Ibn Battuta Airport|Tangier|MA|35.732|-5.921|Africa/Casablanca|l|s|Tanger-Boukhalef Airport, Aéroport de Tanger-Ibn Battouta
TNH|Tonghua Sanyuanpu Airport|Tonghua|CN|42.048|125.734|Asia/Shanghai|m|s|Tonghua Liuhe Airport
TNJ|Raja Haji Fisabilillah International Airport|Tanjung Pinang-Bintan Island|ID|0.924|104.533|Asia/Jakarta|m|s|WIKN
TNN|Tainan International Airport / Tainan Air Base|Tainan (Rende)|TW|22.95|120.206|Asia/Taipei|l|s|臺南機場, 臺南航空站
TNR|Ivato International Airport|Antananarivo|MG|-18.797|47.479|Asia/Riyadh|l|s|
TNW|Jumandy Airport|Ahuano|EC|-1.06|-77.581|America/Guayaquil|m|n|Tena
TOD|Tioman Airport|Tioman Island|MY|2.818|104.16|Asia/Singapore|m|s|Kampung Tekek, Sultan Ahmad Shah
TOE|Tozeur Nefta International Airport|Tozeur|TN|33.94|8.111|Africa/Tunis|m|s|
TOF|Tomsk Kamov Airport|Tomsk|RU|56.38|85.208|Asia/Tomsk|l|s|Bogashevo Airport
TOI|Troy Municipal Airport at N Kenneth Campbell Field|Troy|US|31.86|-86.012|America/Chicago|m|n|
TOJ|Madrid–Torrejón Airport / Torrejón Air Base|Madrid|ES|40.488|-3.457|Europe/Madrid|m|n|
TOL|Eugene F. Kranz Toledo Express Airport|Toledo|US|41.587|-83.808|America/New_York|m|s|
TOM|Tombouktou Airport|Timbuktu|ML|16.73|-3.008|Africa/Abidjan|l|s|Timbuctoo Airport, Tombouctou Airport, Tumbutu Airport
TOP|Philip Billard Municipal Airport|Topeka|US|39.07|-95.623|America/Chicago|m|n|
TOQ|Barriles Airport|Tocopilla|CL|-22.141|-70.063|America/Santiago|m|n|
TOS|Tromsø Airport|Tromsø|NO|69.683|18.919|Europe/Berlin|l|s|Langnes, Tromsøya, Tromso
TOU|Touho Airport|Touho|NC|-20.79|165.26|Pacific/Noumea|m|s|
TOY|Toyama Kitokito Airport|Toyama|JP|36.648|137.187|Asia/Tokyo|m|s|
TPA|Tampa International Airport|Tampa|US|27.976|-82.533|America/New_York|l|s|
TPC|Tarapoa Airport|Tarapoa|EC|-0.123|-76.338|America/Guayaquil|m|n|
TPE|Taiwan Taoyuan International Airport|Taoyuan|TW|25.078|121.233|Asia/Taipei|l|s|Taoyuan County, Dayuan District. 臺灣桃園國際機場
TPH|Tonopah Airport|Tonopah|US|38.06|-117.087|America/Los_Angeles|m|n|
TPJ|Taplejung Airport|Taplejung|NP|27.351|87.695|Asia/Kathmandu|m|s|Suketar Airport
TPL|Draughon Miller Central Texas Regional Airport|Temple|US|31.152|-97.408|America/Chicago|m|n|
TPP|Cadete FAP Guillermo Del Castillo Paredes Airport|Tarapoto|PE|-6.509|-76.373|America/Lima|m|s|
TPQ|Amado Nervo National Airport|Tepic|MX|21.42|-104.842|America/Mazatlan|m|s|Tepic Airport
TPS|Vincenzo Florio Airport Trapani-Birgi|Trapani|IT|37.911|12.488|Europe/Rome|m|s|Trapani Airport, Aeroporto Vincenzo Florio di Trapani-Birgi
TQD|Al Taqaddum Air Base|Al Habbaniyah|IQ|33.338|43.597|Asia/Baghdad|m|n|Tammuz Airbase, Al Fallujah, Greene Field
TQO|Felipe Carrillo Puerto International Airport Tulum|Tulum|MX|20.172|-87.66|America/Cancun|l|s|
TQS|Captain Ernesto Esguerra Cubides Air Base|Tres Esquinas|CO|0.746|-75.234|America/Bogota|m|n|
TRA|Tarama Airport|Tarama|JP|24.654|124.675|Asia/Tokyo|m|s|
TRC|Francisco Sarabia Tinoco International Airport|Torreón|MX|25.562|-103.405|America/Monterrey|m|s|
TRD|Trondheim Airport, Værnes|Trondheim|NO|63.458|10.924|Europe/Berlin|l|s|
TRE|Tiree Airport|Balemartine, Argyll and Bute|GB|56.499|-6.869|Europe/London|m|s|Inner Hebrides
TRF|Sandefjord Airport, Torp|Sandefjord(Torp)|NO|59.187|10.259|Europe/Berlin|l|s|
TRG|Tauranga Airport|Tauranga|NZ|-37.672|176.196|Pacific/Auckland|m|s|
TRI|Tri-Cities Regional TN/VA Airport|Blountville|US|36.475|-82.407|America/New_York|m|s|
TRK|Juwata International Airport / Suharnoko Harbani AFB|Tarakan|ID|3.325|117.564|Asia/Makassar|m|s|WRLR, WALR, WAQQ, TRK, TARAKAN
TRM|Jacqueline Cochran Regional Airport|Palm Springs|US|33.627|-116.16|America/Los_Angeles|m|n|Thermal Airport, Desert Resorts Regional Airport, Thermal AAF
TRN|Turin Airport|Caselle Torinese|IT|45.201|7.65|Europe/Rome|l|s|Torino-Caselle Airport, Sandro Pertini Airport, Turin-Caselle Airport
TRO|Taree Airport|Taree|AU|-31.889|152.514|Australia/Sydney|m|n|
TRQ|Tarauacá Airport|Tarauacá|BR|-8.156|-70.783|America/Rio_Branco|m|n|
TRR|China Bay Airport|Trincomalee|LK|8.539|81.181|Asia/Colombo|m|s|SLAF China Bay, RAF China Bay, Trincomalee Airport
TRS|Trieste Airport|Ronchi dei Legionari/Trieste|IT|45.828|13.467|Europe/Rome|l|s|Ronchi Dei Legionari Airport, Trieste-Ronchi dei Legionari Airport
TRT|Toraja Airport|Toraja|ID|-3.184|119.919|Asia/Makassar|m|s|
TRU|Capitán FAP Carlos Martínez de Pinillos International Airport|Trujillo|PE|-8.082|-79.109|America/Lima|l|s|
TRV|Thiruvananthapuram International Airport|Thiruvananthapuram|IN|8.482|76.92|Asia/Kolkata|l|s|Trivandrum Air Force Station
TRW|Bonriki International Airport|South Tarawa|KI|1.382|173.147|Pacific/Tarawa|l|s|Mullinix, Tarawa
TRZ|Tiruchirappalli International Airport|Tiruchirappalli|IN|10.763|78.718|Asia/Kolkata|l|s|Trichy, Trichinopoly, RAF Kajamalai
TSA|Taipei Songshan International Airport|Taipei (Songshan)|TW|25.067|121.553|Asia/Taipei|l|s|Sungshan Airport, 台北松山機場, 臺北松山機場
TSB|Tsumeb Airport|Tsumeb|NA|-19.262|17.733|Africa/Windhoek|m|n|
TSF|Treviso Airport|Treviso|IT|45.648|12.194|Europe/Rome|l|s|Venice-Treviso, Treviso-Sant'Angelo, Treviso Antonio Canova Airport
TSJ|Tsushima Airport|Tsushima|JP|34.285|129.331|Asia/Tokyo|m|s|
TSM|Taos Regional Airport|Taos|US|36.452|-105.677|America/Denver|m|s|
TSN|Tianjin Binhai International Airport|Tianjin|CN|39.124|117.346|Asia/Shanghai|l|s|
TSR|Timișoara Traian Vuia International Airport|Timişoara|RO|45.81|21.338|Europe/Bucharest|l|s|RoAF 93rd Air Base, Giarmata Airport, Temesvár, Temeschburg, Temeswar, Temeschwar, Тимишоара, Темишвар, Temišvar, Banat
TST|Trang Airport|Trang|TH|7.509|99.617|Asia/Jakarta|m|s|
TSV|Townsville Airport / RAAF Base Townsville|Townsville|AU|-19.253|146.767|Australia/Brisbane|m|s|RAAF Base Garbutt
TTA|Tan Tan Airport|Tan Tan|MA|28.448|-11.162|Africa/Casablanca|m|s|Plage Blanche Airport
TTC|Las Breas Airport|Taltal|CL|-25.564|-70.376|America/Santiago|m|n|
TTD|Portland Troutdale Airport|Portland|US|45.549|-122.401|America/Los_Angeles|m|n|
TTE|Sultan Babullah Airport|Ternate|ID|0.831|127.382|Asia/Tokyo|m|s|Sango, Tafure
TTG|General Enrique Mosconi Airport|Tartagal|AR|-22.617|-63.793|America/Argentina/Salta|m|n|
TTH|Thumrait Air Base|Thumrait|OM|17.666|54.025|Asia/Dubai|m|n|
TTJ|Tottori Sand Dunes Conan Airport|Tottori|JP|35.53|134.165|Asia/Tokyo|m|s|鳥取砂丘コナン空港, 鳥取, コナン, Tottori Airport
TTN|Trenton Mercer Airport|Ewing Township|US|40.277|-74.813|America/New_York|m|s|
TTT|Taitung Airport|Taitung City|TW|22.755|121.102|Asia/Taipei|m|s|Fengnian Airport, 台東機場
TTU|Sania Ramel Airport|Tétouan|MA|35.594|-5.32|Africa/Casablanca|l|s|Saniat R'mel, Saniet R'mel
TUA|Lieutenant Colonel Luis A. Mantilla International Airport|Tulcán|EC|0.81|-77.708|America/Guayaquil|m|s|Teniente Coronel Luis A. Mantilla
TUB|Tubuai Airport||PF|-23.365|-149.524|Pacific/Honolulu|m|s|
TUC|Teniente Benjamín Matienzo International Airport|San Miguel de Tucumán|AR|-26.837|-65.104|America/Argentina/Tucuman|l|s|
TUD|Tambacounda Airport|Tambacounda|SN|13.737|-13.653|Africa/Abidjan|m|n|
TUF|Tours Val de Loire Airport|Tours, Indre-et-Loire|FR|47.432|0.728|Europe/Paris|m|s|Aéroport Tours-Val de Loire, Loire Valley
TUG|Tuguegarao Airport|Tuguegarao City|PH|17.643|121.733|Asia/Manila|m|s|Tugegarao
TUI|Turaif Domestic Airport|Turaif|SA|31.692|38.732|Asia/Riyadh|m|s|
TUK|Turbat International Airport|Turbat|PK|25.985|63.029|Asia/Karachi|l|s|
TUL|Tulsa International Airport|Tulsa|US|36.197|-95.886|America/Chicago|l|s|
TUM|Tumut Aerodrome|Tumut|AU|-35.268|148.241|Australia/Sydney|m|n|Bombowlee
TUN|Tunis Carthage International Airport|Tunis|TN|36.851|10.227|Africa/Tunis|l|s|Aéroport international de Tunis-Carthage, مطار تونس قرطاج الدولي
TUO|Taupo Airport|Taupo|NZ|-38.74|176.084|Pacific/Auckland|m|s|
TUP|Tupelo Regional Airport|Tupelo|US|34.268|-88.77|America/Chicago|m|s|
TUR|Tucuruí Airport|Tucuruí|BR|-3.786|-49.72|America/Belem|m|s|
TUS|Tucson International Airport|Tucson|US|32.115|-110.938|America/Phoenix|l|s|Morris Air National Guard Base
TUU|Prince Sultan bin Abdulaziz International Airport|Tabuk|SA|28.371|36.625|Asia/Riyadh|l|s|Tabuk Airport, Tabuk Regional Airport
TUV|Tucupita Airport|Tucupita|VE|9.089|-62.094|America/Caracas|m|n|
TVC|Cherry Capital Airport|Traverse City|US|44.741|-85.582|America/Detroit|m|s|
TVF|Thief River Falls Regional Airport|Thief River Falls|US|48.066|-96.185|America/Chicago|m|s|
TVL|Lake Tahoe Airport|South Lake Tahoe|US|38.894|-119.995|America/Los_Angeles|m|n|
TVT|Tashkent-Khumo International Airport|Tashkent|UZ|41.313|69.396|Asia/Tashkent|m|s|Tashkent Vostochny Airport, Tashkent East
TVY|Dawei Airport|Dawei|MM|14.104|98.204|Asia/Yangon|m|s|Tavoy, Tavoy Airport
TWF|Joslin Field Magic Valley Regional Airport|Twin Falls|US|42.482|-114.488|America/Boise|m|s|
TWT|Sanga Sanga Airport|Bongao|PH|5.048|119.743|Asia/Manila|m|s|SGS
TWU|Tawau Airport|Tawau|MY|4.313|118.122|Asia/Makassar|m|s|
TWZ|Pukaki Airport|Twitzel|NZ|-44.235|170.118|Pacific/Auckland|m|n|
TXC|Orsha Airport - Balbasovo Air Base|Orsha|BY|54.44|30.297|Europe/Minsk|m|n|Balbasava, Bolbasovo, Orsha Southwest
TXE|Rembele Airport|Takengon|ID|4.721|96.852|Asia/Jakarta|m|s|
TXK|Texarkana Regional Airport (Webb Field)|Texarkana|US|33.454|-93.991|America/Chicago|m|s|
TXN|Huangshan Tunxi International Airport|Huangshan|CN|29.733|118.256|Asia/Shanghai|l|s|
TYB|Tibooburra Airport||AU|-29.451|142.058|Australia/Sydney|m|n|
TYF|Torsby Airport|Torsby|SE|60.158|12.991|Europe/Berlin|m|s|
TYL|Captain Victor Montes Arias International Airport|Talara|PE|-4.577|-81.254|America/Lima|m|s|Capitan FAP Victor Montes Arias
TYM|Staniel Cay Airport|Staniel Cay|BS|24.169|-76.439|America/Toronto|m|n|
TYN|Taiyuan Wusu International Airport|Taiyuan|CN|37.747|112.628|Asia/Shanghai|l|s|
TYR|Tyler Pounds Regional Airport|Tyler|US|32.354|-95.402|America/Chicago|m|s|
TYS|McGhee Tyson Airport|Knoxville/Maryville|US|35.811|-83.994|America/New_York|l|s|Knoxville
TZA|Sir Barry Bowen Municipal Airport|Belize City|BZ|17.517|-88.196|America/Belize|m|s|Belize City Municipal
TZL|Tuzla International Airport|Dubrave Gornje|BA|44.46|18.724|Europe/Belgrade|l|s|
TZN|Congo Town Airport|Andros|BS|24.159|-77.59|America/Toronto|m|s|Congotown Airport, South Andros Airport
TZX|Trabzon International Airport|Trabzon|TR|40.995|39.79|Europe/Istanbul|m|s|
UAB|İncirlik Air Base|Sarıçam|TR|37.002|35.426|Europe/Istanbul|m|n|ADA
UAI|Commander in Chief of FALINTIL, Kay Rala Xanana Gusmão, International Airport|Suai|TL|-9.302|125.286|Asia/Dili|m|s|Covalima Airport, Suai Airport, Xanana Gusmao International Airport
UAM|Andersen Air Force Base|Yigo|GU|13.584|144.93|Pacific/Guam|m|n|
UAQ|Domingo Faustino Sarmiento Airport|San Juan|AR|-31.572|-68.418|America/Argentina/San_Juan|m|s|
UAR|Bouarfa Airport|Bouarfa|MA|32.514|-1.983|Africa/Casablanca|m|s|
UBA|Mário de Almeida Franco Airport|Uberaba|BR|-19.765|-47.965|America/Sao_Paulo|m|s|
UBJ|Yamaguchi Ube Airport|Ube|JP|33.93|131.279|Asia/Tokyo|m|s|
UBN|Ulaanbaatar Chinggis Khaan International Airport|Ulaanbaatar (Sergelen)|MN|47.647|106.82|Asia/Ulaanbaatar|l|s|Khöshig Valley
UBP|Ubon Ratchathani Airport|Ubon Ratchathani|TH|15.251|104.87|Asia/Jakarta|m|s|
UCB|Ulanqab Jining Airport|Ulanqab|CN|41.13|113.107|Asia/Shanghai|m|s|
UCT|Ukhta Airport|Ukhta|RU|63.567|53.805|Europe/Moscow|m|s|
UDE|Volkel Air Base|Uden|NL|51.657|5.708|Europe/Brussels|m|n|The Hague
UDI|Ten. Cel. Aviador César Bombonato Airport|Uberlândia|BR|-18.884|-48.226|America/Sao_Paulo|m|s|
UDJ|Uzhhorod International Airport|Uzhhorod|UA|48.634|22.263|Europe/Kyiv|m|n|Міжнародний аеропорт Ужгород
UDR|Maharana Pratap Airport|Udaipur|IN|24.618|73.896|Asia/Kolkata|m|s|Dabok Airport
UEL|Quelimane Airport|Quelimane|MZ|-17.855|36.869|Africa/Johannesburg|m|s|
UEO|Kumejima Airport|Kumejima|JP|26.363|126.714|Asia/Tokyo|m|s|
UET|Quetta International Airport|Quetta|PK|30.251|66.938|Asia/Karachi|l|s|
UFA|Ufa International Airport|Ufa|RU|54.557|55.874|Asia/Yekaterinburg|l|s|УВУУ, Международный аэропорт Уфа
UGA|Bulgan Airport|Bulgan|MN|48.855|103.476|Asia/Ulaanbaatar|m|s|
UGC|Urgench International Airport|Urgench|UZ|41.583|60.643|Asia/Samarkand|l|s|UTNU
UGO|Uige Airport|Uige|AO|-7.603|15.028|Africa/Lagos|m|n|
UGU|Bilorai Airport|Bilogai|ID|-3.74|137.031|Asia/Tokyo|m|s|WABV, Zugapa, Bilogai-Sugapa
UHE|Kunovice Airport|Uherské Hradiště|CZ|49.029|17.44|Europe/Prague|m|n|Letiště Kunovice
UIB|El Caraño Airport|Quibdó|CO|5.691|-76.641|America/Bogota|m|s|
UIH|Phu Cat Airport|Quy Nohn|VN|13.955|109.042|Asia/Ho_Chi_Minh|m|s|Phucat
UIN|Quincy Regional Airport Baldwin Field|Quincy|US|39.943|-91.195|America/Chicago|m|s|
UIO|Mariscal Sucre International Airport|Quito|EC|-0.125|-78.354|America/Guayaquil|l|s|Nuevo Aeropuerto Internacional Mariscal Sucre
UIP|Quimper-Cornouaille Airport|Quimper/Pluguffan|FR|47.973|-4.17|Europe/Paris|m|n|
UKB|Kobe Airport|Kobe|JP|34.633|135.224|Asia/Tokyo|l|s|
UKE|Utkela Airport|Bhawanipatna|IN|20.098|83.183|Asia/Kolkata|m|s|
UKI|Ukiah Municipal Airport|Ukiah|US|39.126|-123.201|America/Los_Angeles|m|n|
UKK|Oskemen International Airport|Ust-Kamenogorsk (Oskemen)|KZ|50.035|82.496|Asia/Almaty|l|s|Ust-Kamennogorsk Airport, Аэропорт Усть-Каменногорск
UKS|Sevastopol International Airport / Belbek Air Base|Sevastopol|UA|44.692|33.575|Europe/Simferopol|m|n|Севастополь, Бельбек
UKX|Ust-Kut Airport|Ust-Kut|RU|56.857|105.73|Asia/Irkutsk|m|s|УИТТ, Аэропорт Усть-Кут
ULA|Capitan D Daniel Vazquez Airport|San Julian|AR|-49.307|-67.803|America/Argentina/Rio_Gallegos|m|n|
ULD|Prince Mangosuthu Buthelezi Airport|Ulundi|ZA|-28.321|31.417|Africa/Johannesburg|m|n|
ULG|Ölgii Mongolei International Airport|Ölgii|MN|48.993|89.923|Asia/Hovd|m|s|Ulgii Mongolei
ULH|Al-Ula International Airport|Al-Ula|SA|26.484|38.117|Asia/Riyadh|l|s|Prince Abdul majeed bin Abdulaziz Domestic Airport
ULK|Lensk Airport|Lensk|RU|60.724|114.825|Asia/Yakutsk|m|s|УЕРЛ, Ленcк
ULN|Buyant-Ukhaa International Airport|Ulaanbaatar|MN|47.843|106.767|Asia/Ulaanbaatar|l|n|Chinggis Khaan International
ULO|Ulaangom Airport|Ulaangom|MN|50.067|91.938|Asia/Hovd|m|s|
ULP|Quilpie Airport||AU|-26.609|144.254|Australia/Brisbane|m|s|
ULQ|Heriberto Gíl Martínez Airport|Tuluá|CO|4.088|-76.235|America/Bogota|m|n|Farfan Airport
ULU|Gulu Airport|Gulu|UG|2.806|32.272|Asia/Riyadh|m|s|
ULV|Ulyanovsk Baratayevka Airport|Ulyanovsk|RU|54.27|48.226|Europe/Ulyanovsk|m|s|
ULY|Ulyanovsk Vostochny Airport|Cherdakly|RU|54.401|48.803|Europe/Ulyanovsk|m|s|
UMB|Kalumbila Airport|Kalumbila|ZM|-12.254|25.444|Africa/Johannesburg|m|n|
UME|Umeå Airport|Umeå|SE|63.792|20.283|Europe/Berlin|l|s|
UND|Kunduz Airport|Kunduz|AF|36.665|68.911|Asia/Kabul|m|n|Konduz
UNI|Union Island International Airport|Union Island|VC|12.6|-61.412|America/Puerto_Rico|m|s|
UNK|Unalakleet Airport|Unalakleet|US|63.888|-160.799|America/Anchorage|m|s|
UNN|Ranong Airport|Ranong|TH|9.778|98.586|Asia/Jakarta|m|s|
UOX|University Oxford Airport|Oxford|US|34.384|-89.537|America/Chicago|m|n|
UPB|Playa Baracoa Airport|Havana|CU|23.033|-82.579|America/Havana|m|n|
UPG|Sultan Hasanuddin International Airport|Makassar|ID|-5.076|119.554|Asia/Makassar|l|s|
UPL|Upala Airport|Upala|CR|10.892|-85.016|America/Costa_Rica|m|n|
UPN|Uruapan - Licenciado y General Ignacio Lopez Rayon International Airport|Uruapan|MX|19.397|-102.039|America/Mexico_City|m|s|
URA|Manshuk Mametova International Airport|Uralsk|KZ|51.152|51.544|Asia/Oral|l|s|Podstepnyy, Uralsk International Airport, Oral Ak Zhol Airport
URC|Ürümqi Tianshan International Airport|Ürümqi|CN|43.914|87.479|Asia/Urumqi|l|s|Urumqi Diwopu Airport, Diwopu, 乌鲁木齐天山国际机场, 乌鲁木齐, 乌鲁木齐地窝堡机场
URE|Kuressaare Airport|Kuressaare|EE|58.23|22.51|Europe/Tallinn|m|s|
URG|Rubem Berta Airport|Uruguaiana|BR|-29.782|-57.038|America/Sao_Paulo|m|s|Ruben Berta
URJ|Uray Airport|Uray|RU|60.103|64.827|Asia/Yekaterinburg|m|s|Urai
URO|Rouen Vallée de Seine Airport|Boos|FR|49.385|1.179|Europe/Paris|m|n|
URS|Kursk East Airport|Kursk|RU|51.751|36.296|Europe/Moscow|m|n|УУОК, ЬУОК, Kursk Vostochny Airport, Курск / Восточный
URT|Surat Thani Airport|Surat Thani|TH|9.133|99.136|Asia/Jakarta|m|s|
URY|Gurayat Domestic Airport|Gurayat|SA|31.412|37.279|Asia/Riyadh|m|s|Guriat Airport
USA|Concord-Padgett Regional Airport|Concord|US|35.388|-80.709|America/New_York|m|s|3N8, NASCAR's Airport
USH|Ushuaia - Malvinas Argentinas International Airport|Ushuaia|AR|-54.843|-68.296|America/Argentina/Ushuaia|m|s|
USK|Usinsk Airport|Usinsk|RU|66.005|57.367|Europe/Moscow|m|s|
USM|Samui International Airport|Na Thon (Ko Samui Island)|TH|9.548|100.062|Asia/Jakarta|l|s|
USN|Ulsan Airport|Ulsan|KR|35.593|129.352|Asia/Seoul|m|s|
USQ|Uşak Airport|Uşak|TR|38.681|29.472|Europe/Istanbul|m|n|
USR|Ust-Nera Airport|Ust-Nera|RU|64.55|143.115|Asia/Ust-Nera|m|s|УЕМТ, Аэропорт Усть-Нера
UST|Northeast Florida Regional Airport|St Augustine|US|29.959|-81.34|America/New_York|m|s|St Augustine Airport, NAAS St. Augustine
USU|Francisco B. Reyes (Busuanga) Airport|Coron|PH|12.122|120.101|Asia/Manila|m|s|Busuanga Airport
UTH|Udon Thani International Airport|Udon Thani|TH|17.386|102.789|Asia/Jakarta|l|s|
UTI|Utti Air Base|Utti / Valkeala|FI|60.896|26.938|Europe/Helsinki|m|n|
UTN|Upington Airport|Upington|ZA|-28.4|21.264|Africa/Johannesburg|m|s|Pierre van Ryneveld
UTO|Indian Mountain LRRS Airport|Utopia Creek|US|65.993|-153.704|America/Anchorage|m|s|
UTP|U-Tapao–Rayong–Pattaya International Airport|Rayong|TH|12.68|101.005|Asia/Jakarta|l|s|Utapao, U-Taphao, U-Tapao Royal Thai Navy Airfield, ท่าอากาศยานอู่ตะเภา ระยอง–พัทยา
UTS|Ust-Tsylma Airport|Ust-Tsylma|RU|65.437|52.2|Europe/Moscow|m|n|Ust-Tsilma, Усть-Цильма
UTT|K. D. Matanzima Airport|Mthatha|ZA|-31.546|28.673|Africa/Johannesburg|m|s|Umtata
UTW|Queenstown Airport|Queenstown|ZA|-31.92|26.882|Africa/Johannesburg|m|n|
UUA|Bugulma Airport|Bugulma|RU|54.641|52.8|Europe/Moscow|m|s|УВКБ, Аэропорт Бугульма
UUD|Baikal International Airport|Ulan Ude|RU|51.809|107.44|Asia/Irkutsk|l|s|Mukhino Airport, Ulan-Ude Airport
UUN|Baruun Urt Airport||MN|46.66|113.285|Asia/Ulaanbaatar|m|n|
UUS|Yuzhno-Sakhalinsk International Airport|Yuzhno-Sakhalinsk|RU|46.885|142.717|Asia/Sakhalin|l|s|УХСС, Аэропорт Южно-Сахалинск, Khomutovo, Khomutovo International Airport
UVE|Ouvéa Airport|Ouvéa|NC|-20.641|166.573|Pacific/Noumea|m|s|
UVF|Hewanorra International Airport|Vieux Fort|LC|13.733|-60.953|America/Puerto_Rico|l|s|
UYL|Nyala Airport|Nyala|SD|12.053|24.956|Africa/Khartoum|m|s|
UYN|Yulin Yuyang Airport|Yulin|CN|38.36|109.591|Asia/Shanghai|m|s|
UYU|Joya Andina International Airport|Quijarro|BO|-20.441|-66.858|America/Puerto_Rico|l|s|
UZC|Ponikve Airport|Stapari|RS|43.899|19.698|Europe/Belgrade|m|n|Аеродром Ужице-Поникве, Lepa Glava, Užice
UZU|Curuzu Cuatia Airport|Curuzu Cuatia|AR|-29.771|-57.979|America/Argentina/Cordoba|m|n|
VAA|Vaasa Airport|Vaasa|FI|63.05|21.763|Europe/Helsinki|l|s|
VAD|Moody Air Force Base|Valdosta|US|30.968|-83.193|America/New_York|m|n|
VAF|Valence-Chabeuil Airport|Chabeuil, Drôme|FR|44.922|4.97|Europe/Paris|m|n|
VAG|Major Brigadeiro Trompowsky Airport|Varginha|BR|-21.591|-45.474|America/Sao_Paulo|m|n|Varginha Airport
VAI|Vanimo Airport|Vanimo|PG|-2.693|141.303|Pacific/Port_Moresby|m|s|
VAM|Villa International Airport Maamigili|Maamigili|MV|3.472|72.833|Indian/Maldives|m|s|
VAN|Van Ferit Melen Airport|Van|TR|38.468|43.332|Europe/Istanbul|m|s|
VAQ|Vanavara Airport|Vanavara|RU|60.356|102.31|Asia/Krasnoyarsk|m|s|Аэропорт Ванавара
VAR|Varna Airport|Varna|BG|43.232|27.825|Europe/Sofia|l|s|Aksakovo
VAS|Sivas Nuri Demirağ Airport|Sivas|TR|39.814|36.904|Europe/Istanbul|m|s|
VAV|Vava'u International Airport|Vava'u Island|TO|-18.585|-173.962|Pacific/Tongatapu|l|s|Vavau, Lupepau'u
VAW|Vardø Airport, Svartnes|Vardø|NO|70.355|31.045|Europe/Berlin|m|s|
VBG|Vandenberg Space Force Base|Lompoc|US|34.737|-120.584|America/Los_Angeles|m|n|
VBS|Brescia Gabriele d'Annunzio Airport|Montichiari|IT|45.429|10.331|Europe/Rome|m|s|Brescia-Montichiari
VBY|Visby Airport|Visby|SE|57.663|18.346|Europe/Berlin|l|s|
VCA|Can Tho International Airport|Can Tho|VN|10.083|105.709|Asia/Ho_Chi_Minh|l|s|Binh Thuy Air Base, Trà Nóc Airport
VCE|Venice Marco Polo Airport|Venezia|IT|45.505|12.352|Europe/Rome|l|s|Venezia-Tessera, Venice-Tessera
VCP|Viracopos International Airport|Campinas|BR|-23.007|-47.135|America/Sao_Paulo|l|s|
VCS|Con Dao Airport|Con Dao|VN|8.732|106.633|Asia/Ho_Chi_Minh|m|s|Conson Airport
VCT|Victoria Regional Airport|Victoria|US|28.853|-96.919|America/Chicago|m|s|
VDC|Glauber de Andrade Rocha Airport|Vitória da Conquista|BR|-14.908|-40.915|America/Bahia|m|s|SSVC
VDE|El Hierro Airport|El Hierro Island|ES|27.815|-17.887|Atlantic/Canary|m|s|
VDH|Dong Hoi Airport|Dong Hoi|VN|17.515|106.591|Asia/Jakarta|m|s|
VDM|Gobernador Castello Airport|Viedma / Carmen de Patagones|AR|-40.869|-63|America/Argentina/Salta|m|s|
VDO|Van Don International Airport|Van Don|VN|21.121|107.415|Asia/Jakarta|m|s|Cẩm Phả, Sân bay Quốc tế Vân Đồn
VDP|Valle de La Pascua Airport||VE|9.222|-65.994|America/Caracas|m|n|
VDR|Villa Dolores Airport|Villa Dolores|AR|-31.945|-65.146|America/Argentina/Cordoba|m|n|
VDS|Vadsø Airport|Vadsø|NO|70.065|29.845|Europe/Berlin|m|s|
VDZ|Valdez Pioneer Field|Valdez|US|61.133|-146.247|America/Anchorage|m|s|Valdez Number 2
VEL|Vernal Regional Airport|Vernal|US|40.436|-109.512|America/Denver|m|s|
VEO|Severo-Yeniseysk Airport|Severo-Yeniseysk|RU|60.373|93.012|Asia/Krasnoyarsk|m|s|Severo-Eniseisk Airport, Аэропорт Северо-Енисейск
VER|General Heriberto Jara International Airport|Veracruz|MX|19.14|-96.189|America/Mexico_City|l|s|
VEY|Vestmannaeyjar Airport|Vestmannaeyjar|IS|63.424|-20.279|Africa/Abidjan|m|n|
VFA|Victoria Falls International Airport|Victoria Falls|ZW|-18.097|25.837|Africa/Johannesburg|l|s|
VGA|Vijayawada International Airport|Vijayawada|IN|16.53|80.805|Asia/Kolkata|l|s|
VGD|Vologda Airport|Vologda|RU|59.283|39.944|Europe/Moscow|m|n|Аэропорт Вологда
VGO|Vigo Airport|Vigo|ES|42.232|-8.627|Europe/Madrid|m|s|
VGT|North Las Vegas Airport|Las Vegas|US|36.209|-115.194|America/Los_Angeles|m|n|Northtown Airport, Las Vegas North Air Terminal
VHC|Saurimo Airport|Saurimo|AO|-9.689|20.432|Africa/Lagos|m|n|
VHM|Vilhelmina South Lapland Airport|Vilhelmina|SE|64.579|16.834|Europe/Berlin|m|s|
VHY|Vichy-Charmeil Airport|Charmeil, Allier|FR|46.17|3.404|Europe/Paris|m|n|
VIE|Vienna International Airport|Vienna|AT|48.11|16.57|Europe/Vienna|l|s|
VIG|Juan Pablo Pérez Alfonso Airport|El Vigía|VE|8.624|-71.673|America/Caracas|m|s|
VII|Vinh Airport|Vinh|VN|18.738|105.671|Asia/Jakarta|m|s|
VIJ|Virgin Gorda Airport|Spanish Town|VG|18.447|-64.428|America/Puerto_Rico|m|s|
VIL|Dakhla Airport|Dakhla|EH|23.718|-15.932|Africa/El_Aaiun|l|s|GSVO, Villa Cisneros, Dajla, Oued Ed-Dahab
VIN|Vinnytsia/Gavyryshivka International Airport|Vinnitsa|UA|49.243|28.614|Europe/Kyiv|m|n|УКВВ, Вінниця, Gavrishevka Airport, Gavrishivka Airport, Аэропорт Гавришевка, Аэропорт Гавришiвка
VIP|Payerne Air Base|Payerne|CH|46.843|6.915|Europe/Zurich|m|n|Payerne Airport
VIR|Virginia Airport|Durban|ZA|-29.771|31.058|Africa/Johannesburg|m|n|
VIS|Visalia Municipal Airport|Visalia|US|36.319|-119.393|America/Los_Angeles|m|n|
VIT|Vitoria Airport|Alava|ES|42.883|-2.724|Europe/Madrid|m|s|Foronda
VIX|Eurico de Aguiar Salles International Airport|Vitória|BR|-20.258|-40.285|America/Sao_Paulo|l|s|Goiabeiras Airport
VIY|Vélizy-Villacoublay Air Base|Vélizy-Villacoublay, Yvelines|FR|48.774|2.203|Europe/Paris|m|n|BA 107
VKG|Rach Gia Airport|Rach Gia|VN|9.958|105.132|Asia/Ho_Chi_Minh|m|s|
VKO|Vnukovo International Airport|Moscow|RU|55.591|37.262|Europe/Moscow|l|s|MOW, Международный аэропорт Внуково
VKT|Vorkuta Airport|Vorkuta|RU|67.489|63.993|Europe/Moscow|m|s|
VKV|Vaskovo Airport|Arkhangelsk|RU|64.442|40.422|Europe/Moscow|m|n|Аэропорт Архангельск Васьково, УЛАХ, ЬЛАХ, Vas'kovo
VLC|Valencia Airport|Valencia|ES|39.489|-0.481|Europe/Madrid|l|s|
VLD|Valdosta Regional Airport|Valdosta|US|30.782|-83.277|America/New_York|m|s|
VLG|Villa Gesell Airport|Villa Gesell|AR|-37.235|-57.029|America/Argentina/Buenos_Aires|m|n|
VLI|Bauerfield International Airport|Port Vila|VU|-17.699|168.32|Pacific/Efate|l|s|Efate Field, Vila Field, McDonald Field, Bauer Field
VLL|Valladolid Airport|Valladolid|ES|41.706|-4.852|Europe/Madrid|m|s|
VLM|Teniente Coronel Rafael Pabón Airport|Villamontes|BO|-21.255|-63.406|America/Puerto_Rico|m|n|
VLN|Arturo Michelena International Airport|Valencia|VE|10.15|-67.928|America/Caracas|l|s|
VLR|Vallenar Airport|Vallenar|CL|-28.596|-70.756|America/Santiago|m|n|
VLU|Velikiye Luki Airport|Velikiye Luki|RU|56.381|30.608|Europe/Moscow|m|n|УЛОЛ, Великие Луки
VLV|Dr. Antonio Nicolás Briceño Airport|Valera|VE|9.34|-70.584|America/Caracas|m|s|
VLY|Anglesey Airport|Angelsey|GB|53.248|-4.535|Europe/London|m|n|Maes Awyr Môn, RAF Valley
VME|Villa Reynolds Airport|Villa Mercedes|AR|-33.73|-65.387|America/Argentina/San_Luis|m|n|Pringles
VMI|Aeropuerto Nacional Doctor Juan Plate|Puerto Vallemi|PY|-22.159|-57.942|America/Asuncion|m|n|Aeropuerto Nacional Dr. Juan Plate
VMU|Baimuru Airport|Baimuru|PG|-7.497|144.822|Pacific/Port_Moresby|m|s|
VNE|Vannes-Meucon Airport|Vannes/Meucon|FR|47.723|-2.719|Europe/Paris|m|n|
VNO|Vilnius International Airport|Vilnius|LT|54.634|25.286|Europe/Vilnius|l|s|
VNS|Lal Bahadur Shastri International Airport|Varanasi|IN|25.452|82.863|Asia/Kolkata|l|s|VIBN, Babatpur Airport, Varanasi Airport
VNX|Vilankulo Airport|Vilanculo|MZ|-22.018|35.313|Africa/Johannesburg|m|s|Vilanculos Airport
VNY|Van Nuys Airport|Van Nuys|US|34.21|-118.49|America/Los_Angeles|m|n|
VOD|Vodochody Airport|Vodochody|CZ|50.217|14.396|Europe/Prague|m|n|
VOG|Volgograd International Airport|Volgograd|RU|48.781|44.339|Europe/Volgograd|l|s|Gumrak Airport, Аэропорт Волгоград, Аэропорт Гумрак
VOH|Vohemar Airport|Vohemar|MG|-13.376|50.003|Asia/Riyadh|m|n|
VOK|Volk Field|Camp Douglas|US|43.939|-90.253|America/Chicago|m|n|Camp Williams
VOL|Nea Anchialos National Airport|Nea Anchialos|GR|39.22|22.794|Europe/Athens|m|s|Volos Central Greece Airport, Volos Nea Anchialos Airport of Central Greece
VOZ|Voronezh International Airport|Voronezh|RU|51.814|39.231|Europe/Moscow|m|s|УУОО, Chertovitskoye Airport, Chertovitskoe Airport, Аэропорт Воронеж, Аэропорт Чертовицкое
VPE|Ngjiva Pereira Airport|Ngiva|AO|-17.044|15.684|Africa/Lagos|m|s|Ngiva Airport, NGV, Ondjiva, 11 de Novembro
VPN|Vopnafjörður Airport|Vopnafjörður|IS|65.721|-14.851|Africa/Abidjan|m|s|
VPS|Destin-Fort Walton Beach Airport|Valparaiso|US|30.481|-86.516|America/Chicago|m|s|Eglin AFB
VPY|Chimoio Airport|Chimoio|MZ|-19.151|33.429|Africa/Johannesburg|m|s|
VPZ|Porter County Municipal Airport|Valparaiso|US|41.454|-87.007|America/Chicago|m|n|
VQQ|Cecil Airport|Jacksonville|US|30.219|-81.877|America/New_York|m|n|NZC, KNCZ, Cecil Field NAS
VQS|Antonio Rivera Rodriguez Airport|Vieques|PR|18.135|-65.494|America/Puerto_Rico|m|s|
VRA|Juan Gualberto Gomez International Airport|Matanzas|CU|23.034|-81.435|America/Havana|l|s|Varadero
VRB|Vero Beach Regional Airport|Vero Beach|US|27.656|-80.418|America/New_York|m|s|Vero Beach Municipal
VRC|Virac Airport|Virac|PH|13.576|124.206|Asia/Manila|m|s|
VRE|Vredendal Airport|Vredendal|ZA|-31.641|18.545|Africa/Johannesburg|m|n|
VRK|Varkaus Airport|Varkaus / Joroinen|FI|62.171|27.869|Europe/Helsinki|m|n|
VRL|Vila Real Airport|Vila Real|PT|41.274|-7.72|Europe/Lisbon|m|s|
VRN|Verona Villafranca Valerio Catullo Airport|Caselle|IT|45.395|10.887|Europe/Rome|l|s|Villafranca International Airport, Villafranca Airport
VRO|Kawama Airport|Santa Marta|CU|23.124|-81.302|America/Havana|m|n|Varadero
VRU|Vryburg Airport|Vryburg|ZA|-26.982|24.729|Africa/Johannesburg|m|n|
VSA|Carlos Rovirosa Pérez International Airport|Villahermosa|MX|17.994|-92.818|America/Mexico_City|l|s|Villahermosa International Airport
VSE|Aerodromo Goncalves Lobato (Viseu Airport)|Viseu|PT|40.725|-7.889|Europe/Lisbon|m|s|
VST|Stockholm Västerås Airport|Stockholm / Västerås|SE|59.589|16.634|Europe/Berlin|l|s|
VTB|Vitebsk Vostochny Airport|Vitebsk|BY|55.126|30.35|Europe/Minsk|m|n|УМІІ, УМИИ, Vitebsk Southeast, Vitebsk East Airport, Аэрапорт Віцебск, Аэропорт Витебск
VTE|Wattay International Airport|Vientiane|LA|17.985|102.567|Asia/Jakarta|l|s|
VTM|Nevatim Air Base|Beersheba|IL|31.208|35.012|Asia/Jerusalem|m|n|Malhata, Be'er Sheva
VTN|Miller Field|Valentine|US|42.856|-100.549|America/Chicago|m|n|Valentine Municipal Airport
VTU|Hermanos Ameijeiras Airport|Las Tunas|CU|20.988|-76.936|America/Havana|m|s|
VTZ|Alluri Sitarama Raju International Airport (Vizag)|Visakhapatnam|IN|17.972|83.504|Asia/Kolkata|l|s|Visakhapatnam
VUP|Alfonso López Pumarejo Airport|Valledupar|CO|10.435|-73.249|America/Bogota|m|s|
VUS|Velikiy Ustyug Airport|Velikiy Ustyug|RU|60.788|46.26|Europe/Moscow|m|s|Аэропорт Великий Устюг
VVC|Vanguardia Airport|Villavicencio|CO|4.168|-73.614|America/Bogota|m|s|
VVI|Viru Viru International Airport|Santa Cruz|BO|-17.645|-63.135|America/Puerto_Rico|l|s|
VVO|Vladivostok International Airport|Artyom|RU|43.396|132.148|Asia/Vladivostok|l|s|Vladivostok-Knevichi Airport
VVZ|Illizi Takhamalt Airport|Illizi|DZ|26.723|8.623|Africa/Algiers|m|s|
VXC|Lichinga Airport|Lichinga|MZ|-13.274|35.266|Africa/Johannesburg|m|s|
VXE|Cesaria Evora International Airport|São Pedro|CV|16.833|-25.055|Atlantic/Cape_Verde|l|s|São Vicente Island
VXO|Växjö Kronoberg Airport|Växjö|SE|56.929|14.728|Europe/Berlin|m|s|
VYI|Vilyuisk Airport|Vilyuisk|RU|63.757|121.693|Asia/Yakutsk|m|s|УЕНВ, Вилюйск
WAE|Wadi Al Dawasir Domestic Airport|Wadi Al Dawasir|SA|20.504|45.2|Asia/Riyadh|m|s|
WAG|Wanganui Airport|Wanganui|NZ|-39.963|175.024|Pacific/Auckland|m|s|
WAI|Ambalabe Airport|Antsohihy|MG|-14.899|47.994|Asia/Riyadh|m|n|
WAT|Waterford Airport|Waterford|IE|52.187|-7.087|Europe/London|m|n|
WAW|Warsaw Chopin Airport|Warsaw|PL|52.166|20.967|Europe/Warsaw|l|s|Okęcie, Warszawa
WBG|Schleswig Air Base|Jagel|DE|54.459|9.516|Europe/Berlin|m|n|
WBM|Wapenamanda Airport|Wapenamanda|PG|-5.635|143.892|Pacific/Port_Moresby|m|s|
WCH|Nuevo Chaitén Airport|Chaitén|CL|-42.782|-72.835|America/Santiago|m|n|
WDH|Hosea Kutako International Airport|Windhoek|NA|-22.48|17.471|Africa/Windhoek|l|s|J.G. Strijdom Airport
WDS|Shiyan Wudangshan Airport|Shiyan (Maojian)|CN|32.593|110.906|Asia/Shanghai|m|s|
WEF|Weifang Nanyuan Airport|Weifang (Kuiwen)|CN|36.647|119.119|Asia/Shanghai|m|s|
WEH|Weihai Dashuibo Airport|Weihai|CN|37.187|122.229|Asia/Shanghai|m|s|Dashuipo, Yancheng Air Base
WEI|Weipa Airport|Weipa|AU|-12.677|141.923|Australia/Brisbane|m|s|
WFI|Fianarantsoa Airport|Fianarantsoa|MG|-21.442|47.112|Asia/Riyadh|m|n|
WGA|Wagga Wagga Airport|Forest Hill|AU|-35.163|147.468|Australia/Sydney|m|s|RAAF Base Wagga
WGE|Walgett Airport||AU|-30.033|148.126|Australia/Sydney|m|s|
WGN|Shaoyang Wugang Airport|Shaoyang (Wugang)|CN|26.806|110.641|Asia/Shanghai|m|s|
WGT|Wangaratta Airport|Laceby|AU|-36.418|146.307|Australia/Melbourne|m|n|
WHA|Wuhu Xuanzhou Airport|Wuhu|CN|31.105|118.667|Asia/Shanghai|m|s|
WHB|Eliwana||AU|-22.428|116.888|Australia/Perth|m|n|
WHK|Whakatāne Airport|Whakatāne|NZ|-37.922|176.917|Pacific/Auckland|m|s|
WHN|Wuhan Hannan Municipal Airport|Wuhan (Hannan)|CN|30.255|114.063|Asia/Shanghai|m|n|
WIC|Wick John O'Groats Airport|Wick|GB|58.459|-3.093|Europe/London|m|s|
WIE|Wiesbaden Army Airfield|Wiesbaden|DE|50.05|8.325|Europe/Berlin|m|n|
WIL|Nairobi Wilson Airport|Nairobi|KE|-1.322|36.815|Asia/Riyadh|m|s|WLN
WIN|Winton Airport||AU|-22.364|143.086|Australia/Brisbane|m|s|
WIR|Wairoa Airport|Wairoa|NZ|-39.012|177.404|Pacific/Auckland|m|n|
WJF|General William J Fox Airfield|Lancaster|US|34.741|-118.219|America/Los_Angeles|m|n|
WJR|Wajir Airport|Wajir|KE|1.733|40.092|Asia/Riyadh|m|s|
WJU|Wonju Airport / Hoengseong Air Base (K-38/K-46)|Wonju|KR|37.437|127.96|Asia/Seoul|m|s|WJU, RKNW, RKNH
WKA|Wanaka Airport|Wanaka|NZ|-44.722|169.246|Pacific/Auckland|m|s|Luggate Airport
WKB|Warracknabeal Airport||AU|-36.321|142.419|Australia/Melbourne|m|n|
WKF|Waterkloof Air Force Base|Pretoria|ZA|-25.83|28.222|Africa/Johannesburg|m|n|AFB
WKJ|Wakkanai Airport|Wakkanai|JP|45.404|141.801|Asia/Tokyo|m|s|
WKK|Aleknagik / New Airport|Aleknagik|US|59.283|-158.618|America/Anchorage|m|s|
WLG|Wellington International Airport|Wellington|NZ|-41.327|174.807|Pacific/Auckland|l|s|
WLS|Hihifo Airport|Wallis Island|WF|-13.239|-176.199|Pacific/Tarawa|l|s|
WMC|Winnemucca Municipal Airport|Winnemucca|US|40.897|-117.806|America/Los_Angeles|m|n|
WME|Mount Keith Airport||AU|-27.287|120.555|Australia/Perth|m|n|
WMH|Ozark Regional Airport|Mountain Home|US|36.369|-92.47|America/Chicago|m|n|Baxter County Regional Airport
WMI|Warsaw Modlin Airport|Nowy Dwór Mazowiecki|PL|52.451|20.652|Europe/Warsaw|l|s|Warszawa
WMN|Maroantsetra Airport|Maroantsetra|MG|-15.438|49.689|Asia/Riyadh|m|s|
WMR|Mananara Nord Airport|Mananara Nord|MG|-16.164|49.774|Asia/Riyadh|m|n|Avaratra Airport
WMT|Zunyi Maotai Airport|Zunyi|CN|27.962|106.435|Asia/Shanghai|m|s|
WMX|Wamena Airport|Wamena|ID|-4.097|138.952|Asia/Tokyo|m|s|WAJW
WNI|Matahora Airport|Wangi-wangi Island|ID|-5.292|123.636|Asia/Makassar|m|s|
WNP|Naga Airport|Naga|PH|13.585|123.27|Asia/Manila|m|s|
WNR|Windorah Airport|Windorah|AU|-25.411|142.668|Australia/Brisbane|m|s|
WNS|Shaheed Benazirabad Airport|Nawabashah|PK|26.219|68.39|Asia/Karachi|m|s|
WNZ|Wenzhou Longwan International Airport|Wenzhou (Longwan)|CN|27.911|120.853|Asia/Shanghai|l|s|温州永强机场, Wenzhou Yongqiang Airport
WOE|Woensdrecht Air Base|Hoogerheide|NL|51.449|4.342|Europe/Brussels|m|n|BZM, Vliegbasis Woensdrecht
WOL|Shellharbour Airport|Albion Park Rail|AU|-34.561|150.789|Australia/Sydney|m|n|YWOL, RAAF Albion Park, Illawarra Regional Airport, Albion Park Aerodrome, Wollongong Airport
WOS|Wonsan Kalma Airport|Wonsan|KP|39.165|127.488|Asia/Pyongyang|m|s|
WPC|Pincher Creek Airport|Pincher Creek|CA|49.52|-113.997|America/Edmonton|m|n|ZPC
WPR|Captain Fuentes Martinez Airport|Porvenir|CL|-53.254|-70.319|America/Punta_Arenas|m|n|
WPU|Guardia Marina Zañartu Airport|Puerto Williams|CL|-54.931|-67.626|America/Punta_Arenas|m|n|Ensign Zañartu
WRB|Robins Air Force Base|Warner Robins|US|32.64|-83.592|America/New_York|m|n|
WRE|Whangarei Airport|Whangarei|NZ|-35.769|174.364|Pacific/Auckland|m|s|
WRG|Wrangell Airport|Wrangell|US|56.484|-132.37|America/Sitka|m|s|
WRI|Mc Guire Air Force Base|Wrightstown|US|40.016|-74.592|America/New_York|m|n|
WRL|Worland Municipal Airport|Worland|US|43.966|-107.951|America/Denver|m|n|
WRO|Copernicus Wrocław Airport|Wrocław|PL|51.104|16.882|Europe/Warsaw|l|s|Strachowice, Breslau, Wroclaw
WRT|Warton Aerodrome|Warton|GB|53.745|-2.883|Europe/London|m|n|
WSI|Western Sydney International (Nancy-Bird Walton) Airport|Sydney|AU|-33.883|150.713|Australia/Sydney|l|n|Badgerys Creek
WST|Westerly State Airport|Westerly|US|41.35|-71.803|America/New_York|m|s|
WSZ|Westport Airport|Westport|NZ|-41.737|171.579|Pacific/Auckland|m|s|
WTB|Toowoomba Wellcamp Airport|Toowoomba|AU|-27.558|151.793|Australia/Brisbane|l|s|Brisbane West Wellcamp
WTN|RAF Waddington|Lincoln, Lincolnshire|GB|53.166|-0.524|Europe/London|m|n|
WUA|Wuhai Airport|Wuhai|CN|39.793|106.799|Asia/Shanghai|m|s|乌海机场
WUH|Wuhan Tianhe International Airport|Wuhan (Huangpi)|CN|30.775|114.214|Asia/Shanghai|l|s|
WUN|Wiluna Airport||AU|-26.633|120.222|Australia/Perth|m|s|
WUS|Nanping Wuyishan Airport|Wuyishan|CN|27.702|118.001|Asia/Shanghai|m|s|
WUU|Wau Airport|Wau|SS|7.726|27.975|Africa/Juba|m|s|
WUX|Sunan Shuofang International Airport|Wuxi|CN|31.497|120.43|Asia/Shanghai|l|s|Wuxi Airport
WUZ|Wuzhou Xijiang Airport|Tangbu|CN|23.403|111.093|Asia/Shanghai|m|s|
WVB|Walvis Bay International Airport|Walvis Bay(Rooikop)|NA|-22.979|14.647|Africa/Windhoek|l|s|SAAFB Rooikop
WVK|Manakara Airport|Manakara|MG|-22.12|48.022|Asia/Riyadh|m|n|
WWA|Wasilla Airport|Wasilla|US|61.572|-149.54|America/Anchorage|m|n|4A1
WWD|Cape May County Airport|Wildwood|US|39.008|-74.908|America/New_York|m|n|
WWK|Wewak International Airport|Wewak|PG|-3.584|143.669|Pacific/Port_Moresby|m|s|
WWR|West Woodward Airport|Woodward|US|36.438|-99.523|America/Chicago|m|n|
WWY|West Wyalong Airport|West Wyalong|AU|-33.937|147.191|Australia/Sydney|m|n|
WYA|Whyalla Airport|Whyalla|AU|-33.059|137.514|Australia/Adelaide|m|s|
WYE|Yengema Airport|Yengema|SL|8.61|-11.045|Africa/Abidjan|m|n|
WYS|Yellowstone Airport|West Yellowstone|US|44.688|-111.118|America/Denver|m|s|
XAI|Xinyang Minggang Airport|Xinyang|CN|32.541|114.079|Asia/Shanghai|m|s|Queshan Air Base, 信阳明港机场
XAP|Serafin Enoss Bertaso Airport|Chapecó|BR|-27.134|-52.657|America/Sao_Paulo|m|s|Chapecó Airport
XBJ|Birjand International Airport|Birjand|IR|32.897|59.281|Asia/Tehran|l|s|
XCH|Christmas Island International Airport|Flying Fish Cove|CX|-10.45|105.691|Asia/Jakarta|m|s|
XCR|Chalons Vatry airport|Chalons en Champagne|FR|48.773|4.206|Europe/Paris|m|s|Paris-Châlons, Paris-Vatry, Paris-Vatry (Disney), Vatry Europort
XEN|Xingcheng Air Base|Huludao (Xingcheng)|CN|40.58|120.7|Asia/Shanghai|m|n|
XFN|Xiangyang Liuji Airport|Xiangyang (Xiangzhou)|CN|32.152|112.292|Asia/Shanghai|m|s|Xiangfan
XFW|Hamburg-Finkenwerder Airport|Hamburg|DE|53.535|9.836|Europe/Berlin|m|n|Airbus
XGN|Xangongo Airport|Xangongo|AO|-16.755|14.965|Africa/Lagos|m|n|
XIC|Xichang Qingshan Airport|Liangshan (Xichang)|CN|27.989|102.184|Asia/Shanghai|m|s|
XIJ|Ahmed Al Jaber Air Base|Ahmed Al Jaber AB|KW|28.935|47.792|Asia/Riyadh|m|n|
XIL|Xilinhot Airport|Xilinhot|CN|43.916|115.964|Asia/Shanghai|m|s|
XIY|Xi'an Xianyang International Airport|Xi'an|CN|34.442|108.762|Asia/Shanghai|l|s|西安咸阳国际机场
XJD|Al Udeid Air Base|Ar Rayyan|QA|25.117|51.315|Asia/Qatar|m|n|
XJM|Mangla Airport|Mangla|PK|33.05|73.638|Asia/Karachi|m|n|
XKS|Kasabonika Airport|Kasabonika|CA|53.525|-88.643|America/Winnipeg|m|s|YAQ
XLS|Saint Louis Airport|Saint Louis|SN|16.05|-16.461|Africa/Abidjan|m|n|
XMH|Manihi Airport||PF|-14.437|-146.07|Pacific/Honolulu|m|s|
XMN|Xiamen Gaoqi International Airport|Xiamen|CN|24.544|118.127|Asia/Shanghai|l|s|厦门高崎国际机场
XMS|Coronel E Carvajal Airport|Macas|EC|-2.299|-78.121|America/Guayaquil|m|s|
XNA|Northwest Arkansas National Airport|Fayetteville/Springdale/Rogers|US|36.282|-94.307|America/Chicago|m|s|Bentonville, Rogers
XNH|Ali Air Base|Nasiriyah|IQ|30.936|46.09|Asia/Baghdad|m|n|Tallil Air Base, Camp Adder
XNN|Xining Caojiabao International Airport|Haidong (Huzhu Tu Autonomous County)|CN|36.528|102.04|Asia/Shanghai|l|s|Caojiabu, Caojiapu
XPL|Palmerola International Airport|Palmerola|HN|14.382|-87.621|America/Tegucigalpa|l|s|Comayagua International, MHSC, Soto Cano, Palmerola Air Base, José Enrique Soto Cano Air Base, Tegucigalpa
XQP|Quepos Managua Airport|Quepos|CR|9.443|-84.13|America/Costa_Rica|m|s|
XQU|Qualicum Beach Airport|Qualicum Beach|CA|49.337|-124.393|America/Vancouver|m|s|AT4
XRH|RAAF Base Richmond|Richmond|AU|-33.605|150.783|Australia/Sydney|m|n|military
XRR|Ross River Airport|Ross River|CA|61.971|-132.423|America/Whitehorse|m|n|
XRY|Jerez Airport|Jerez de la Frontera|ES|36.745|-6.06|Europe/Madrid|m|s|
XSB|Sir Bani Yas Airport|Sir Bani Yas|AE|24.284|52.58|Asia/Dubai|m|n|Yas Island
XSC|South Caicos Airport|South Caicos|TC|21.516|-71.529|America/Grand_Turk|m|s|
XSP|Seletar Airport|Seletar|SG|1.416|103.867|Asia/Singapore|m|s|
XTG|Thargomindah Airport|Thargomindah|AU|-27.986|143.812|Australia/Brisbane|m|s|
XUZ|Xuzhou Guanyin International Airport|Xuzhou|CN|34.059|117.555|Asia/Shanghai|m|s|
XWA|Williston Basin International Airport|Williston|US|48.261|-103.751|America/Chicago|m|s|
YAA|Anahim Lake Airport|Anahim Lake|CA|52.452|-125.304|America/Vancouver|m|s|AJ4
YAG|Fort Frances Municipal Airport|Fort Frances|CA|48.656|-93.443|America/Winnipeg|m|s|
YAH|La Grande-4 Airport|La Grande-4|CA|53.755|-73.675|America/Toronto|m|n|YAH
YAI|Gral. Bernardo O´Higgins Airport|Chillan|CL|-36.583|-72.031|America/Santiago|m|n|
YAK|Yakutat Airport|Yakutat|US|59.509|-139.66|America/Yakutat|m|s|
YAM|Sault Ste Marie Airport|Sault Ste Marie|CA|46.483|-84.508|America/Toronto|m|s|
YAO|Yaoundé Ville Airport|Yaoundé|CM|3.836|11.524|Africa/Lagos|m|n|
YAP|Yap International Airport|Yap Island|FM|9.499|138.083|Pacific/Port_Moresby|l|s|
YAY|St. Anthony Airport|St. Anthony|CA|51.392|-56.083|America/St_Johns|m|s|
YAZ|Tofino / Long Beach Airport|Tofino|CA|49.08|-125.776|America/Vancouver|m|s|
YBC|Baie-Comeau Airport|Baie-Comeau|CA|49.133|-68.204|America/Toronto|m|s|
YBG|Saguenay-Bagotville Airport|Saguenay|CA|48.33|-70.992|America/Toronto|m|s|
YBK|Baker Lake Airport|Baker Lake|CA|64.299|-96.078|America/Rankin_Inlet|m|s|
YBL|Campbell River Airport|Campbell River|CA|49.951|-125.271|America/Vancouver|m|s|
YBP|Yibin Wuliangye Airport|Yibin (Cuiping)|CN|28.858|104.526|Asia/Shanghai|m|s|
YBR|Brandon Municipal Airport|Brandon|CA|49.91|-99.952|America/Winnipeg|m|s|
YBX|Lourdes-de-Blanc-Sablon Airport|Blanc-Sablon|CA|51.444|-57.185|America/Puerto_Rico|m|s|
YBY|Bonnyville Airport|Bonnyville|CA|54.304|-110.744|America/Edmonton|m|s|YBF
YCB|Cambridge Bay Airport|Cambridge Bay|CA|69.108|-105.138|America/Cambridge_Bay|m|s|
YCC|Cornwall Regional Airport|Cornwall|CA|45.093|-74.568|America/Toronto|m|n|
YCD|Nanaimo Airport|Nanaimo|CA|49.055|-123.87|America/Vancouver|m|s|
YCE|Centralia / James T. Field Memorial Aerodrome|Huron Park|CA|43.286|-81.508|America/Toronto|m|n|RCAF Station Centralia, Huron Airpark
YCG|Castlegar/West Kootenay Regional Airport|Castlegar|CA|49.296|-117.632|America/Vancouver|m|s|
YCH|Miramichi Airport|Miramichi|CA|47.008|-65.449|America/Moncton|m|n|CFB Chatham, RCAF Station Chatham
YCL|Charlo Airport|Charlo|CA|47.991|-66.33|America/Moncton|m|n|
YCM|Niagara District Airport|Niagara-on-the-Lake|CA|43.192|-79.172|America/Toronto|m|s|YSN, Saint Catharines
YCN|Cochrane Airport|Cochrane|CA|49.106|-81.014|America/Toronto|m|n|
YCQ|Chetwynd Airport|Chetwynd|CA|55.687|-121.627|America/Dawson_Creek|m|n|
YCU|Yuncheng Yanhu International Airport|Yuncheng (Yanhu)|CN|35.118|111.034|Asia/Shanghai|l|s|Yuncheng Guangong Airport
YDA|Dawson City Airport|Dawson City|CA|64.043|-139.128|America/Dawson|m|s|
YDB|Burwash Airport|Burwash Landing|CA|61.371|-139.041|America/Dawson|m|n|
YDF|Deer Lake Airport|Deer Lake|CA|49.208|-57.396|America/St_Johns|m|s|
YDG|Digby / Annapolis Regional Airport|Digby|CA|44.546|-65.785|America/Halifax|m|n|YID
YDN|Dauphin Barker Airport|Dauphin|CA|51.101|-100.052|America/Winnipeg|m|s|
YDO|Dolbeau-Saint-Felicien Airport|Dolbeau-Saint-Felicien|CA|48.779|-72.375|America/Toronto|m|n|Dolbeau St Methode
YDQ|Dawson Creek Airport|Dawson Creek|CA|55.741|-120.183|America/Dawson_Creek|m|n|
YDT|Boundary Bay Airport|Delta|CA|49.074|-123.007|America/Vancouver|m|n|ZBB
YEC|Yecheon Airbase|Yecheon-ri|KR|36.63|128.35|Asia/Seoul|m|n|
YEG|Edmonton International Airport|Edmonton|CA|53.31|-113.58|America/Edmonton|l|s|
YEI|Bursa Yenişehir Airport|Yenişehir|TR|40.255|29.563|Europe/Istanbul|m|s|
YEL|Elliot Lake Municipal Airport|Elliot Lake|CA|46.351|-82.561|America/Toronto|m|n|
YEM|Manitoulin East Municipal Airport|Sheguiandah|CA|45.842|-81.858|America/Toronto|m|n|
YEN|Estevan Airport|Estevan|CA|49.21|-102.966|America/Regina|m|n|YEN
YEO|RNAS Yeovilton|Yeovil, Somerset|GB|51.009|-2.639|Europe/London|m|n|
YES|Yasuj Airport|Yasuj|IR|30.702|51.543|Asia/Tehran|m|n|Yasouj
YET|Edson Airport|Edson|CA|53.579|-116.465|America/Edmonton|m|n|
YEV|Inuvik Mike Zubko Airport|Inuvik|CA|68.304|-133.483|America/Inuvik|m|s|
YEY|Amos/Magny Airport|Amos|CA|48.564|-78.25|America/Toronto|m|n|
YFB|Iqaluit Airport|Iqaluit|CA|63.756|-68.556|America/Iqaluit|m|s|Frobisher Bay Air Base
YFC|Fredericton International Airport|Fredericton|CA|45.869|-66.53|America/Moncton|m|s|
YFE|Forestville Airport|Forestville|CA|48.746|-69.097|America/Toronto|m|n|
YFR|Fort Resolution Airport|Fort Resolution|CA|61.181|-113.69|America/Edmonton|m|n|YFR
YFS|Fort Simpson Airport|Fort Simpson|CA|61.76|-121.237|America/Inuvik|m|s|
YGJ|Yonago Kitaro Airport / JASDF Miho Air Base|Yonago|JP|35.492|133.236|Asia/Tokyo|m|s|
YGK|Kingston Norman Rogers Airport|Kingston|CA|44.225|-76.597|America/Toronto|m|n|
YGL|La Grande Rivière Airport|La Grande Rivière|CA|53.625|-77.704|America/Toronto|m|s|
YGM|Gimli Industrial Park Airport|Gimli|CA|50.628|-97.043|America/Winnipeg|m|n|
YGP|Michel-Pouliot Gaspé Airport|Gaspé|CA|48.775|-64.482|America/Toronto|m|s|
YGQ|Geraldton Greenstone Regional Airport|Geraldton|CA|49.778|-86.939|America/Toronto|m|n|
YGR|Îles-de-la-Madeleine Airport|Les Îles-de-la-Madeleine|CA|47.425|-61.779|America/Halifax|m|s|
YGV|Havre-Saint-Pierre Airport|Havre-Saint-Pierre|CA|50.282|-63.611|America/Toronto|m|s|
YGW|Kuujjuarapik Airport|Kuujjuarapik|CA|55.282|-77.765|America/Toronto|m|s|
YHD|Dryden Regional Airport|Dryden|CA|49.832|-92.744|America/Winnipeg|m|n|
YHF|Hearst René Fontaine Municipal Airport|Hearst|CA|49.714|-83.686|America/Toronto|m|n|
YHM|John C. Munro Hamilton International Airport|Hamilton|CA|43.171|-79.929|America/Toronto|l|s|Mount Hope Airport
YHN|Hornepayne Municipal Airport|Hornepayne|CA|49.193|-84.759|America/Toronto|m|n|
YHT|Haines Junction Airport|Haines Junction|CA|60.789|-137.546|America/Whitehorse|m|n|
YHU|Montréal / Saint-Hubert Metropolitan Airport|Montréal|CA|45.518|-73.417|America/Toronto|m|s|
YHY|Hay River / Merlyn Carter Airport|Hay River|CA|60.84|-115.783|America/Edmonton|m|s|
YHZ|Halifax / Stanfield International Airport|Halifax|CA|44.881|-63.509|America/Halifax|l|s|Robert L. Stanfield International Airport
YIA|Yogyakarta International Airport|Yogyakarta|ID|-7.905|110.057|Asia/Jakarta|l|s|Kulon Progo
YIB|Atikokan Municipal Airport|Atikokan|CA|48.774|-91.639|America/Panama|m|n|
YIC|Yichun Mingyueshan Airport|Yichun|CN|27.802|114.306|Asia/Shanghai|m|s|
YIE|Arxan Yi'ershi Airport|Arxan|CN|47.311|119.912|Asia/Shanghai|m|s|
YIF|St Augustin Airport|St-Augustin|CA|51.212|-58.658|America/Puerto_Rico|m|s|Pakuashipi Airport
YIH|Yichang Sanxia Airport|Yichang (Xiaoting)|CN|30.554|111.483|Asia/Shanghai|m|s|
YIN|Ili Yining International Airport|Ili (Yining / Ghulja)|CN|43.956|81.33|Asia/Shanghai|m|s|Ghulja
YIP|Willow Run Airport|Detroit|US|42.238|-83.53|America/Detroit|m|n|DTT
YIV|Island Lake Airport|Island Lake|CA|53.857|-94.654|America/Winnipeg|m|s|
YIW|Yiwu Airport|Yiwu/Jinhua|CN|29.342|120.031|Asia/Shanghai|l|s|Jinhua
YJF|Fort Liard Airport|Fort Liard|CA|60.236|-123.469|America/Inuvik|m|n|YJF
YJN|St Jean Airport|St Jean|CA|45.294|-73.281|America/Toronto|m|n|
YKA|Kamloops John Moose Fulton Field Regional Airport|Kamloops|CA|50.703|-120.449|America/Vancouver|m|s|
YKD|Kincardine Municipal Airport|Kincardine|CA|44.201|-81.607|America/Toronto|m|n|NS7, CNS7
YKF|Region of Waterloo International Airport|Breslau|CA|43.461|-80.379|America/Toronto|m|s|Breslau, Kitchener, Cambridge, YKF
YKH|Yingkou Lanqi Airport|Yingkou (Laobian)|CN|40.543|122.359|Asia/Shanghai|m|s|
YKJ|Key Lake Airport|Key Lake|CA|57.256|-105.618|America/Regina|m|n|
YKL|Schefferville Airport|Schefferville|CA|54.805|-66.805|America/Toronto|m|s|
YKM|Yakima Air Terminal McAllister Field|Yakima|US|46.568|-120.544|America/Los_Angeles|m|s|
YKN|Chan Gurney Municipal Airport|Yankton|US|42.917|-97.386|America/Chicago|m|n|
YKO|Hakkari Yüksekova Airport|Hakkari|TR|37.55|44.238|Europe/Istanbul|m|s|
YKS|Platon Oyunsky Yakutsk International Airport|Yakutsk|RU|62.093|129.771|Asia/Yakutsk|l|s|УЕЕЕ, ЬЕЕЕ, Якутск
YKX|Kirkland Lake Airport|Kirkland Lake|CA|48.21|-79.981|America/Toronto|m|n|
YKY|Kindersley Airport|Kindersley|CA|51.518|-109.181|America/Swift_Current|m|n|YKY
YLD|Chapleau Airport|Chapleau|CA|47.82|-83.347|America/Toronto|m|n|
YLI|Ylivieska Airfield|Ylivieska|FI|64.055|24.725|Europe/Helsinki|m|n|
YLJ|Meadow Lake Airport|Meadow Lake|CA|54.125|-108.523|America/Swift_Current|m|n|
YLK|Barrie-Lake Simcoe Regional Airport|Barrie|CA|44.485|-79.555|America/Toronto|m|s|NB9, CNB9, Oro Station
YLL|Lloydminster Airport|Lloydminster|CA|53.309|-110.073|America/Edmonton|m|s|
YLR|Leaf Rapids Airport|Leaf Rapids|CA|56.513|-99.985|America/Winnipeg|m|n|
YLT|Alert Airport|Alert|CA|82.517|-62.283|America/Iqaluit|m|n|YLT
YLW|Kelowna International Airport|Kelowna|CA|49.956|-119.378|America/Vancouver|l|s|Okanagan
YLX|Yulin Fumian Airport|Yulin|CN|22.433|110.12|Asia/Shanghai|m|s|
YLY|Langley Airport|Langley|CA|49.101|-122.631|America/Vancouver|m|n|YNJ
YMA|Mayo Airport|Mayo|CA|63.616|-135.868|America/Whitehorse|m|n|
YME|Matane Airport|Matane|CA|48.857|-67.453|America/Toronto|m|n|
YMG|Manitouwadge Airport|Manitouwadge|CA|49.084|-85.861|America/Toronto|m|n|
YMJ|Moose Jaw Air Vice Marshal C. M. McEwen Airport|Moose Jaw|CA|50.33|-105.559|America/Regina|m|n|CFB Moose Jaw
YML|Charlevoix Airport|Charlevoix|CA|47.597|-70.224|America/Toronto|m|n|
YMM|Fort McMurray International Airport|Fort McMurray|CA|56.653|-111.222|America/Edmonton|m|s|
YMO|Moosonee Airport|Moosonee|CA|51.291|-80.608|America/Toronto|m|s|
YMS|Moises Benzaquen Rengifo Airport|Yurimaguas|PE|-5.894|-76.118|America/Lima|m|s|
YMT|Chapais Airport|Chibougamau|CA|49.772|-74.528|America/Toronto|m|s|
YMX|Montreal Mirabel International Airport|Montréal|CA|45.68|-74.039|America/Toronto|m|s|YMQ
YNA|Natashquan Airport|Natashquan|CA|50.19|-61.789|America/Puerto_Rico|m|s|
YNB|Prince Abdulmohsen Bin Abdulaziz International Airport|Yanbu|SA|24.144|38.063|Asia/Riyadh|l|s|Yenbo, Yanbu Airport, Prince Abdul Mohsin bin Abdulaziz International Airport, Prince Abdulmohsin bin Abdulaziz International Airport
YND|Ottawa / Gatineau Airport|Gatineau|CA|45.522|-75.564|America/Toronto|m|s|YND
YNG|Youngstown Warren Regional Airport|Youngstown/Warren|US|41.261|-80.679|America/New_York|m|n|
YNJ|Yanji Chaoyangchuan Airport|Yanji|CN|42.883|129.451|Asia/Shanghai|m|s|
YNL|Points North Landing Airport|Points North Landing|CA|58.277|-104.082|America/Regina|m|s|
YNM|Matagami Airport|Matagami|CA|49.762|-77.803|America/Toronto|m|n|
YNT|Yantai Penglai International Airport|Yantai|CN|37.66|120.978|Asia/Shanghai|l|s|
YNY|Yangyang International Airport|Gonghang-ro|KR|38.06|128.67|Asia/Seoul|l|s|RKNY, YNY, Gonghang
YNZ|Yancheng Nanyang International Airport|Yancheng (Tinghu)|CN|33.428|120.205|Asia/Shanghai|l|s|
YOA|Ekati Airport|Ekati|CA|64.699|-110.615|America/Edmonton|m|n|YOA
YOD|CFB Cold Lake|Cold Lake|CA|54.405|-110.279|America/Edmonton|m|n|
YOJ|High Level Airport|High Level|CA|58.621|-117.165|America/Edmonton|m|s|
YOL|Yola Airport|Yola|NG|9.258|12.43|Africa/Lagos|m|s|
YOO|Oshawa Executive Airport|Oshawa|CA|43.923|-78.895|America/Toronto|m|n|
YOP|Rainbow Lake Airport|Rainbow Lake|CA|58.491|-119.408|America/Edmonton|m|n|
YOS|Owen Sound / Billy Bishop Regional Airport|Owen Sound|CA|44.59|-80.838|America/Toronto|m|n|YOS
YOW|Ottawa Macdonald-Cartier International Airport|Ottawa|CA|45.322|-75.669|America/Toronto|l|s|Uplands, UUP, CUUP
YPA|Prince Albert Glass Field|Prince Albert|CA|53.214|-105.673|America/Regina|m|s|
YPE|Peace River Airport|Peace River|CA|56.227|-117.447|America/Edmonton|m|s|
YPG|Portage-la-Prairie / Southport Airport|Portage la Prairie|CA|49.903|-98.274|America/Winnipeg|m|n|
YPL|Pickle Lake Airport|Pickle Lake|CA|51.446|-90.214|America/Panama|m|s|
YPN|Port-Menier Airport|Port-Menier|CA|49.836|-64.289|America/Toronto|m|s|Anticosti
YPQ|Peterborough Regional Airport|Peterborough|CA|44.232|-78.362|America/Toronto|m|s|
YPR|Prince Rupert Airport|Prince Rupert|CA|54.286|-130.445|America/Vancouver|m|s|
YPS|Port Hawkesbury Airport|Port Hawkesbury|CA|45.657|-61.368|America/Glace_Bay|m|n|YPD
YPW|Powell River Airport|Powell River|CA|49.834|-124.5|America/Vancouver|m|s|
YPX|Puvirnituq Airport|Puvirnituq|CA|60.051|-77.287|America/Toronto|m|s|
YPY|Fort Chipewyan Airport|Fort Chipewyan|CA|58.767|-111.117|America/Edmonton|m|s|
YPZ|Burns Lake Airport|Burns Lake|CA|54.376|-125.951|America/Vancouver|m|s|YPZ
YQA|Muskoka Airport|Gravenhurst|CA|44.975|-79.307|America/Toronto|m|s|
YQB|Quebec Jean Lesage International Airport|Quebec|CA|46.791|-71.393|America/Toronto|l|s|Quebec City
YQD|The Pas Airport|The Pas|CA|53.971|-101.091|America/Winnipeg|m|s|
YQF|Red Deer Regional Airport|Springbrook|CA|52.182|-113.894|America/Edmonton|m|n|
YQG|Windsor International Airport|Windsor|CA|42.276|-82.956|America/Toronto|l|s|
YQH|Watson Lake Airport|Watson Lake|CA|60.117|-128.822|America/Whitehorse|m|s|
YQI|Yarmouth Airport|Yarmouth|CA|43.827|-66.088|America/Halifax|m|n|
YQK|Kenora Airport|Kenora|CA|49.788|-94.363|America/Winnipeg|m|s|
YQL|Lethbridge County Airport|Lethbridge|CA|49.63|-112.8|America/Edmonton|m|s|Kenyon Field
YQM|Greater Moncton Roméo LeBlanc International Airport|Moncton|CA|46.113|-64.677|America/Moncton|m|s|CYQM, YQM
YQN|Nakina Airport|Nakina|CA|50.183|-86.696|America/Toronto|m|s|
YQQ|Comox Valley International Airport / CFB Comox|Comox|CA|49.711|-124.887|America/Vancouver|m|s|
YQR|Regina International Airport|Regina|CA|50.432|-104.661|America/Regina|m|s|YQR, Roland J. Groome International
YQS|St Thomas Municipal Airport|St Thomas|CA|42.77|-81.111|America/Toronto|m|n|
YQT|Thunder Bay International Airport|Thunder Bay|CA|48.372|-89.324|America/Toronto|m|s|
YQU|Grande Prairie Airport|Grande Prairie|CA|55.18|-118.885|America/Edmonton|m|s|
YQV|Yorkton Municipal Airport|Yorkton|CA|51.265|-102.462|America/Regina|m|n|RCAF Station Yorkton
YQW|North Battleford Airport|North Battleford|CA|52.769|-108.244|America/Swift_Current|m|n|
YQX|Gander International Airport|Gander|CA|48.936|-54.568|America/St_Johns|m|s|CFB Gander
YQY|Sydney / J.A. Douglas McCurdy Airport|Sydney|CA|46.161|-60.05|America/Glace_Bay|m|s|
YQZ|Quesnel Airport|Quesnel|CA|53.026|-122.51|America/Vancouver|m|s|
YRB|Resolute Bay Airport|Resolute Bay|CA|74.717|-94.969|America/Resolute|m|s|
YRI|Rivière-du-Loup Airport|Rivière-du-Loup|CA|47.764|-69.585|America/Toronto|m|n|
YRJ|Roberval Airport|Roberval|CA|48.52|-72.266|America/Toronto|m|s|
YRL|Red Lake Airport|Red Lake|CA|51.067|-93.793|America/Winnipeg|m|s|
YRO|Ottawa / Rockcliffe Airport|Ottawa|CA|45.46|-75.644|America/Toronto|m|s|YRO
YRQ|Trois-Rivières Airport|Trois-Rivières|CA|46.353|-72.679|America/Toronto|m|n|
YRT|Rankin Inlet Airport|Rankin Inlet|CA|62.811|-92.116|America/Rankin_Inlet|m|s|
YRV|Revelstoke Airport|Revelstoke|CA|50.962|-118.184|America/Vancouver|m|n|YRV
YSB|Sudbury Airport|Sudbury|CA|46.625|-80.799|America/Toronto|m|s|
YSC|Sherbrooke Airport|Sherbrooke|CA|45.439|-71.691|America/Toronto|m|n|
YSF|Stony Rapids Airport|Stony Rapids|CA|59.25|-105.841|America/Regina|m|s|
YSH|Smiths Falls-Montague (Russ Beach) Airport|Smiths Falls|CA|44.946|-75.941|America/Toronto|m|n|Smith Falls
YSJ|Saint John Airport|Saint John|CA|45.316|-65.89|America/Moncton|m|s|
YSL|Saint-Léonard Airport|Saint-Léonard|CA|47.157|-67.836|America/Moncton|m|n|St. Leonard, St Leonard
YSM|Fort Smith Airport|Fort Smith|CA|60.02|-111.962|America/Edmonton|m|s|
YSN|Shuswap Regional Airport|Salmon Arm|CA|50.683|-119.229|America/Vancouver|m|n|AM4, Salmon Arm Airport
YSP|Marathon Airport|Marathon|CA|48.755|-86.344|America/Toronto|m|n|
YSQ|Songyuan Chaganhu Airport|Qian Gorlos Mongol Autonomous County|CN|44.931|124.552|Asia/Shanghai|m|s|
YSU|Summerside Airport|Slemon Park|CA|46.441|-63.834|America/Halifax|m|n|PEI
YTA|Pembroke Airport|Pembroke|CA|45.864|-77.252|America/Toronto|m|n|
YTD|Thicket Portage Airport|Thicket Portage|CA|55.319|-97.708|America/Winnipeg|m|n|ZLQ
YTF|Alma Airport|Alma|CA|48.509|-71.642|America/Toronto|m|n|
YTH|Thompson Airport|Thompson|CA|55.801|-97.864|America/Winnipeg|m|s|
YTM|Mont-Tremblant International Airport|La Macaza|CA|46.409|-74.78|America/Toronto|m|n|YFJ
YTR|CFB Trenton|Trenton|CA|44.119|-77.528|America/Toronto|m|n|
YTS|Timmins/Victor M. Power|Timmins|CA|48.57|-81.377|America/Toronto|m|s|Timmins Victor M. Power Airport
YTY|Yangzhou Taizhou Airport|Yangzhou|CN|32.563|119.72|Asia/Shanghai|m|s|Yangtai Airport
YTZ|Billy Bishop Toronto City Airport|Toronto|CA|43.628|-79.396|America/Toronto|m|s|YTO, Toronto Island Airport
YUA|Yuanmou Air Base|Chuxiong (Yuanmou)|CN|25.737|101.882|Asia/Shanghai|m|n|
YUL|Montreal / Pierre Elliott Trudeau International Airport|Montréal|CA|45.468|-73.742|America/Toronto|l|s|YMQ, Dorval Airport
YUM|Yuma International Airport / Marine Corps Air Station Yuma|Yuma|US|32.651|-114.609|America/Phoenix|m|s|Yuma MCAS, Yuma Marine Corps Air Station, Formerly KYUM
YUS|Yushu Batang Airport|Yushu (Batang)|CN|32.836|97.036|Asia/Shanghai|m|s|
YUX|Hall Beach Airport|Sanirajak|CA|68.776|-81.243|America/Iqaluit|m|s|
YUY|Rouyn Noranda Airport|Rouyn-Noranda|CA|48.206|-78.836|America/Toronto|m|s|
YVB|Bonaventure Airport|Bonaventure|CA|48.071|-65.46|America/Toronto|m|s|
YVC|La Ronge Airport|La Ronge|CA|55.151|-105.262|America/Regina|m|s|
YVE|Vernon Regional Airport|Vernon|CA|50.246|-119.331|America/Vancouver|m|n|YVK
YVO|Val-d'Or Airport|Val-d'Or|CA|48.053|-77.783|America/Toronto|m|s|
YVP|Kuujjuaq Airport|Kuujjuaq|CA|58.096|-68.427|America/Toronto|m|s|
YVQ|Norman Wells Airport|Norman Wells|CA|65.282|-126.798|America/Inuvik|m|s|
YVR|Vancouver International Airport|Vancouver|CA|49.194|-123.184|America/Vancouver|l|s|
YVV|Wiarton Airport|Wiarton|CA|44.746|-81.107|America/Toronto|m|s|
YWG|Winnipeg / James Armstrong Richardson International Airport|Winnipeg|CA|49.91|-97.24|America/Winnipeg|l|s|CFB Winnipeg
YWK|Wabush Airport|Wabush|CA|52.922|-66.864|America/Goose_Bay|m|s|
YWL|Williams Lake Airport|Williams Lake|CA|52.183|-122.054|America/Vancouver|m|s|
YWY|Wrigley Airport|Wrigley|CA|63.209|-123.437|America/Inuvik|m|n|
YXC|Cranbrook/Canadian Rockies International Airport|Cranbrook|CA|49.611|-115.782|America/Edmonton|m|s|
YXE|Saskatoon John G. Diefenbaker International Airport|Saskatoon|CA|52.171|-106.701|America/Regina|l|s|
YXH|Medicine Hat Regional Airport|Medicine Hat|CA|50.019|-110.721|America/Edmonton|m|s|
YXJ|Fort St John / North Peace Regional Airport|Fort Saint John|CA|56.238|-120.74|America/Dawson_Creek|m|s|BZ3
YXK|Rimouski Airport|Rimouski|CA|48.478|-68.496|America/Toronto|m|n|
YXL|Sioux Lookout Airport|Sioux Lookout|CA|50.114|-91.905|America/Winnipeg|m|s|
YXQ|Beaver Creek Airport|Beaver Creek|CA|62.41|-140.867|America/Dawson|m|n|
YXR|Earlton (Timiskaming Regional) Airport|Earlton|CA|47.697|-79.847|America/Toronto|m|n|yxr
YXS|Prince George (International) Airport|Prince George|CA|53.884|-122.667|America/Vancouver|m|s|Prince George International
YXT|Northwest Regional Airport Terrace-Kitimat|Terrace|CA|54.468|-128.576|America/Vancouver|m|s|
YXU|London International Airport|London|CA|43.033|-81.149|America/Toronto|m|s|
YXX|Abbotsford International Airport|Abbotsford|CA|49.025|-122.361|America/Vancouver|m|s|
YXY|Whitehorse / Erik Nielsen International Airport|Whitehorse|CA|60.709|-135.066|America/Whitehorse|m|s|
YXZ|Wawa Airport|Wawa|CA|47.967|-84.787|America/Toronto|m|n|
YYA|Yueyang Sanhe Airport|Yueyang (Yueyanglou)|CN|29.312|113.282|Asia/Shanghai|m|s|
YYB|North Bay Jack Garland Airport|North Bay|CA|46.364|-79.423|America/Toronto|m|s|CFB North Bay
YYC|Calgary International Airport|Calgary|CA|51.119|-114.01|America/Edmonton|l|s|McCall Field
YYD|Smithers Airport|Smithers|CA|54.825|-127.183|America/Vancouver|m|s|
YYE|Fort Nelson Airport|Fort Nelson|CA|58.836|-122.597|America/Fort_Nelson|m|s|
YYF|Penticton Airport|Penticton|CA|49.463|-119.602|America/Vancouver|m|s|
YYG|Charlottetown Airport|Charlottetown|CA|46.289|-63.125|America/Halifax|m|s|PEI
YYJ|Victoria International Airport|Victoria|CA|48.647|-123.428|America/Vancouver|l|s|
YYL|Lynn Lake Airport|Lynn Lake|CA|56.864|-101.076|America/Winnipeg|m|s|
YYN|Swift Current Airport|Swift Current|CA|50.292|-107.691|America/Swift_Current|m|n|YYN
YYQ|Churchill Airport|Churchill|CA|58.739|-94.065|America/Winnipeg|m|s|
YYR|Goose Bay Airport|Goose Bay|CA|53.319|-60.426|America/Goose_Bay|m|s|CFB Goose Bay
YYT|St. John's International Airport|St. John's|CA|47.619|-52.752|America/St_Johns|l|s|
YYU|Kapuskasing Airport|Kapuskasing|CA|49.412|-82.47|America/Toronto|m|n|
YYW|Armstrong Airport|Armstrong|CA|50.29|-88.91|America/Toronto|m|n|
YYY|Mont Joli Airport|Mont-Joli|CA|48.609|-68.208|America/Toronto|m|s|
YYZ|Toronto Pearson International Airport|Toronto|CA|43.676|-79.629|America/Toronto|l|s|YTO, Toronto International Airport, Malton
YZA|Cache Creek-Ashcroft Regional Airport|Cache Creek|CA|50.775|-121.321|America/Vancouver|m|n|AZ5
YZE|Gore Bay Manitoulin Airport|Gore Bay|CA|45.885|-82.568|America/Toronto|m|n|
YZF|Yellowknife International Airport|Yellowknife|CA|62.463|-114.44|America/Edmonton|m|s|
YZH|Slave Lake Airport|Slave Lake|CA|55.293|-114.777|America/Edmonton|m|n|YZH
YZP|Sandspit Airport|Sandspit|CA|53.254|-131.814|America/Vancouver|m|s|Queen Charlotte Islands, Haida Gwaii
YZR|Chris Hadfield Airport|Sarnia|CA|42.999|-82.309|America/Toronto|m|n|
YZS|Coral Harbour Airport|Coral Harbour|CA|64.193|-83.359|America/Panama|m|s|
YZT|Port Hardy Airport|Port Hardy|CA|50.681|-127.367|America/Vancouver|m|s|
YZU|Whitecourt Airport|Whitecourt|CA|54.144|-115.787|America/Edmonton|m|s|
YZV|Sept-Îles Airport|Sept-Îles|CA|50.223|-66.266|America/Toronto|m|s|
YZW|Teslin Airport|Teslin|CA|60.173|-132.743|America/Whitehorse|m|n|
YZX|CFB Greenwood|Greenwood|CA|44.984|-64.917|America/Halifax|m|n|Greenwood Airport
YZY|Zhangye Ganzhou Airport|Zhangye (Ganzhou)|CN|38.802|100.675|Asia/Shanghai|m|s|Zhangye Southeast Air Base, 张掖甘州机场
ZAD|Zadar Airport|Zadar|HR|44.097|15.354|Europe/Belgrade|l|s|
ZAG|Zagreb Franjo Tuđman International Airport|Velika Gorica|HR|45.743|16.069|Europe/Belgrade|l|s|Pleso
ZAH|Zahedan International Airport|Zahedan|IR|29.476|60.906|Asia/Tehran|l|s|
ZAL|Pichoy Airport|Valdivia|CL|-39.65|-73.086|America/Santiago|m|s|
ZAM|Zamboanga International Airport|Zamboanga|PH|6.922|122.06|Asia/Manila|l|s|
ZAO|Cahors Lalbenque airport|Cahors|FR|44.351|1.475|Europe/Paris|m|n|
ZAR|Zaria Airport|Zaria|NG|11.13|7.686|Africa/Lagos|m|n|
ZAT|Zhaotong Zhaoyang Airport|Zhaotong|CN|27.206|103.692|Asia/Shanghai|m|s|
ZAZ|Zaragoza Airport|Zaragoza|ES|41.666|-1.042|Europe/Madrid|l|s|Zaragoza Air Base
ZBF|Bathurst Airport|South Tetagouche|CA|47.63|-65.739|America/Moncton|m|s|ZBF
ZBM|Bromont (Roland Désourdy) Airport|Bromont|CA|45.291|-72.741|America/Toronto|m|n|
ZBR|Chabahar Konarak International Airport|Konarak|IR|25.443|60.382|Asia/Tehran|m|s|
ZCL|General Leobardo C. Ruiz International Airport|Zacatecas|MX|22.895|-102.687|America/Mexico_City|m|s|Zacatecas International Airport, Aeropuerto Internacional General Leobardo C. Ruiz
ZCO|La Araucanía International Airport|Temuco|CL|-38.926|-72.651|America/Santiago|l|s|
ZEC|Secunda Airport|Secunda|ZA|-26.524|29.17|Africa/Johannesburg|m|n|
ZEL|Bella Bella (Campbell Island) Airport|Bella Bella|CA|52.185|-128.157|America/Vancouver|m|s|BBC
ZER|Ziro Airport|Ziro|IN|27.588|93.828|Asia/Kolkata|m|n|
ZFA|Faro Airport|Faro|CA|62.208|-133.376|America/Whitehorse|m|n|
ZGF|Grand Forks Airport|Grand Forks|CA|49.016|-118.431|America/Vancouver|m|n|
ZGU|Gaua Island Airport|Gaua Island|VU|-14.218|167.587|Pacific/Efate|m|n|Banks Islands
ZHA|Zhanjiang Wuchuan International Airport|Zhanjiang|CN|21.482|110.59|Asia/Shanghai|l|s|
ZHY|Zhongwei Shapotou Airport|Zhongwei (Shapotou)|CN|37.573|105.154|Asia/Shanghai|m|s|
ZIA|Zhukovsky International Airport|Moscow|RU|55.553|38.15|Europe/Moscow|l|s|Аэропорт Раменское, Zhukovsky Air Base, Gromov Flight Research Institute, Лётно-исследовательский институт имени М. М. Громова, ЛИИ, Ramenskoye, Ramenskoye Airport
ZIC|Victoria Airport|Victoria|CL|-38.246|-72.349|America/Santiago|m|n|
ZIG|Ziguinchor Airport|Ziguinchor|SN|12.556|-16.283|Africa/Abidjan|m|s|Basse Casamance
ZIH|Ixtapa-Zihuatanejo International Airport|Ixtapa|MX|17.602|-101.461|America/Mexico_City|l|s|Aeropuerto Internacional de Zihuatanejo
ZIX|Zhigansk Airport|Zhigansk|RU|66.797|123.361|Asia/Yakutsk|m|s|УЕЖЖ, Аэропорт Жиганск
ZJG|Jenpeg Airport|Jenpeg|CA|54.519|-98.046|America/Winnipeg|m|n|
ZJN|Swan River Airport|Swan River|CA|52.121|-101.236|America/Winnipeg|m|n|
ZKP|Zyryanka Airport|Zyryanka|RU|65.749|150.889|Asia/Srednekolymsk|m|s|УЕСУ, Аэропорт Зырянка
ZLO|Playa de Oro International Airport|Manzanillo|MX|19.145|-104.559|America/Mexico_City|m|s|Manzanillo Costalegre, Aeropuerto Internacional Playa de Oro
ZMT|Masset Airport|Masset|CA|54.028|-132.125|America/Vancouver|m|s|
ZND|Zinder Airport|Zinder|NE|13.779|8.984|Africa/Lagos|m|s|
ZNE|Newman Airport|Newman|AU|-23.418|119.803|Australia/Perth|m|s|
ZNZ|Abeid Amani Karume International Airport|Zanzibar|TZ|-6.222|39.225|Asia/Riyadh|l|s|HTAK, Zanzibar Airport, Kiembi Samaki
ZOS|Cañal Bajo Carlos Hott Siebert Airport|Osorno|CL|-40.611|-73.061|America/Santiago|m|s|
ZQN|Queenstown Airport|Queenstown|NZ|-45.019|168.746|Pacific/Auckland|l|s|
ZQZ|Zhangjiakou Ningyuan Airport|Zhangjiakou|CN|40.739|114.933|Asia/Shanghai|m|s|Zhangjiakou Air Base, 张家口宁远机场, ZZHA, 张家口
ZRH|Zürich Airport|Zurich|CH|47.458|8.548|Europe/Zurich|l|s|
ZRI|Stevanus Rumbewas Airport|Serui|ID|-1.828|136.062|Asia/Tokyo|m|n|
ZSA|San Salvador International Airport|San Salvador|BS|24.063|-74.523|America/Toronto|l|s|Cockburn Town Airport
ZSE|Saint-Pierre Pierrefonds Airport|Saint-Pierre|RE|-21.319|55.423|Asia/Dubai|l|s|Aéroport de Saint-Pierre - Pierrefonds
ZSJ|Sandy Lake Airport|Sandy Lake|CA|53.064|-93.344|America/Winnipeg|m|s|
ZST|Stewart Airport|Stewart|CA|55.935|-129.982|America/Vancouver|m|n|
ZTH|Zakynthos International Airport Dionysios Solomos|Zakynthos|GR|37.751|20.884|Europe/Athens|m|s|Zakinthos
ZTR|Zhytomyr Airport|Zhytomyr|UA|50.271|28.739|Europe/Kyiv|m|n|
ZTU|Zaqatala International Airport|Zaqatala|AZ|41.558|46.669|Asia/Baku|m|n|Zakataly Airport
ZUC|Ignace Municipal Airport|Ignace|CA|49.428|-91.72|America/Winnipeg|m|n|
ZUH|Zhuhai Jinwan Airport|Zhuhai (Jinwan)|CN|22.006|113.376|Asia/Shanghai|l|s|珠海, 珠海金湾机场, 珠海三灶机场, Sanzao Airport
ZVA|Miandrivazo Airport|Miandrivazo|MG|-19.563|45.451|Asia/Riyadh|m|n|
ZVK|Savannakhet Airport||LA|16.557|104.76|Asia/Jakarta|m|n|
ZWA|Andapa Airport||MG|-14.652|49.621|Asia/Riyadh|m|n|
ZXT|Zabrat Airport|Zabrat|AZ|40.495|49.977|Asia/Baku|m|n|
ZYI|Zunyi Xinzhou Airport|Zunyi|CN|27.811|107.247|Asia/Shanghai|m|s|
ZYL|Osmany International Airport|Sylhet|BD|24.964|91.865|Asia/Dhaka|l|s|
ZZU|Mzuzu Airport|Mzuzu|MW|-11.445|34.012|Africa/Johannesburg|m|n|
ZZV|Zanesville Municipal Airport|Zanesville|US|39.944|-81.892|America/New_York|m|n|`;
