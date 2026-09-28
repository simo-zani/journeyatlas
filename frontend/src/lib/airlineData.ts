// ============================================================================
// JourneyAtlas - Compagnie aeree
//
// Elenco scritto a mano (OurAirports non distribuisce le compagnie) ma non dato
// per buono: in generazione ogni voce è stata verificata contro l'infobox di
// Wikipedia. Il designatore IATA viene dall'infobox, non da quello annotato a
// mano, e i codici trovati sbagliati sono elencati qui sotto per riferimento.
//
// I loghi sono presi dal campo `logo` dell'infobox e risolti in URL reali
// upload.wikimedia.org via API: non sono URL inventati e non sono le foto di
// aerei che compaiono in primo piano negli articoli. Dove il logo non c'è il
// campo è vuoto e il picker mostra l'iniziale del nome.
//
// Un record per riga, campi separati da `|`:
//
//   IATA|nome|CC|url logo
//
// Non editare a mano: rigenerare con `node scripts/resolve-airlines.mjs`, che
// rilegge `scripts/airline-list.mjs`.
// ============================================================================

// Discrepanze trovate verificando a mano: Air Malta KM (non IG), Alitalia
// CityLiner CT (non AE), Boutique Airlines 4B (non BV), flydubai FZ (non 5F),
// Air Europa UX (non UU), AirAsia Z9 (l'infobox riporta AK, che è di un'altra
// compagnia). LATAM non ha l'IATA nell'infobox: preso LA.

export const AIRLINE_DATA = `
A3|Aegean Airlines|GR|https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Aegean_Airlines_logo_light-on-dark.svg/250px-Aegean_Airlines_logo_light-on-dark.svg.png
SU|Aeroflot|RU|https://upload.wikimedia.org/wikipedia/en/thumb/7/73/Aeroflot_Logo_en.svg/250px-Aeroflot_Logo_en.svg.png
AR|Aerolíneas Argentinas|AR|https://upload.wikimedia.org/wikipedia/en/thumb/7/79/Logo_Aerol%C3%ADneas_Argentinas_%282010%29.svg/250px-Logo_Aerol%C3%ADneas_Argentinas_%282010%29.svg.png
AM|Aeroméxico|MX|https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/Aerom%C3%A9xico_Logo_2024_-_Navy.svg/250px-Aerom%C3%A9xico_Logo_2024_-_Navy.svg.png
AC|Air Canada|CA|https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Air_Canada_2017.svg/250px-Air_Canada_2017.svg.png
CA|Air China|CN|https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Air_China_logo.svg/250px-Air_China_logo.svg.png
EN|Air Dolomiti|IT|https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Air_Dolomiti-Logo.svg/250px-Air_Dolomiti-Logo.svg.png
UX|Air Europa|ES|https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Air_Europa_Logo_%282015%29.svg/250px-Air_Europa_Logo_%282015%29.svg.png
AF|Air France|FR|https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Air_France_Logo.svg/250px-Air_France_Logo.svg.png
AI|Air India|IN|https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Air_India_2023.svg/250px-Air_India_2023.svg.png
KM|Air Malta|MT|https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Logo_airmalta.svg/250px-Logo_airmalta.svg.png
NZ|Air New Zealand|NZ|https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Air_New_Zealand_logo.svg/250px-Air_New_Zealand_logo.svg.png
JU|Air Serbia|RS|https://upload.wikimedia.org/wikipedia/en/thumb/a/af/Air_Serbia_logo-en.svg/250px-Air_Serbia_logo-en.svg.png
Z9|AirAsia|MY|https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/AirAsia_New_Logo.svg/250px-AirAsia_New_Logo.svg.png
AS|Alaska Airlines|US|https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Alaska_Airlines_logo_with_tagline.svg/250px-Alaska_Airlines_logo_with_tagline.svg.png
CT|Alitalia CityLiner|IT|https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Alitalia_CityLiner_logo_2017.svg/250px-Alitalia_CityLiner_logo_2017.svg.png
AA|American Airlines|US|https://upload.wikimedia.org/wikipedia/en/thumb/2/23/American_Airlines_logo_2013.svg/250px-American_Airlines_logo_2013.svg.png
NH|ANA|JP|https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/All_Nippon_Airways_Logo.svg/250px-All_Nippon_Airways_Logo.svg.png
OZ|Asiana Airlines|KR|https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Asiana_Airlines_%282024%29.svg/250px-Asiana_Airlines_%282024%29.svg.png
OS|Austrian Airlines|AT|https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Austrian_Airlines_logo.svg/250px-Austrian_Airlines_logo.svg.png
AV|Avianca|CO|https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Logo_Avianca_%28Colombia%29_2023.svg/250px-Logo_Avianca_%28Colombia%29_2023.svg.png
AD|Azul|BR|https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Logo_da_Azul_Linhas_A%C3%A9reas_Brasileiras.svg/250px-Logo_da_Azul_Linhas_A%C3%A9reas_Brasileiras.svg.png
4B|Boutique Airlines|IT|https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Boutique_air_logo.png/250px-Boutique_air_logo.png
BA|British Airways|GB|https://upload.wikimedia.org/wikipedia/en/thumb/4/42/British_Airways_Logo.svg/250px-British_Airways_Logo.svg.png
SN|Brussels Airlines|BE|https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Brussels_airlines_logo_2021.svg/250px-Brussels_airlines_logo_2021.svg.png
CX|Cathay Pacific|HK|https://upload.wikimedia.org/wikipedia/en/thumb/1/17/Cathay_Pacific_logo.svg/250px-Cathay_Pacific_logo.svg.png
5J|Cebu Pacific|PH|https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Cebu_Pacific_logo.svg/250px-Cebu_Pacific_logo.svg.png
CI|China Airlines|TW|https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/China_Airlines.svg/250px-China_Airlines.svg.png
MU|China Eastern Airlines|CN|https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/China_Eastern_Airlines_logo.svg/250px-China_Eastern_Airlines_logo.svg.png
CZ|China Southern Airlines|CN|https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/China_Southern_Airlines_logo.svg/250px-China_Southern_Airlines_logo.svg.png
DE|Condor|DE|https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Condor_logo_2022.svg/250px-Condor_logo_2022.svg.png
CM|Copa Airlines|PA|https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Copa_airlines_logo.svg/250px-Copa_airlines_logo.svg.png
OU|Croatia Airlines|HR|https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Croatia_Airlines_2024_logo.svg/250px-Croatia_Airlines_2024_logo.svg.png
OK|Czech Airlines|CZ|https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Czech_Airlines_Logo.svg/250px-Czech_Airlines_Logo.svg.png
DL|Delta Air Lines|US|https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Delta_logo.svg/250px-Delta_logo.svg.png
U2|easyJet|GB|https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EasyJet_logo.svg/250px-EasyJet_logo.svg.png
MS|EgyptAir|EG|https://upload.wikimedia.org/wikipedia/en/thumb/c/ca/Egypt_Air.svg/250px-Egypt_Air.svg.png
EK|Emirates|AE|https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Emirates_Logo.svg/250px-Emirates_Logo.svg.png
ET|Ethiopian Airlines|ET|https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Ethiopian_Airlines_Logo.svg/250px-Ethiopian_Airlines_Logo.svg.png
EY|Etihad Airways|AE|https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Etihad-airways-logo.svg/250px-Etihad-airways-logo.svg.png
EW|Eurowings|DE|https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Eurowings_Logo.svg/250px-Eurowings_Logo.svg.png
BR|EVA Air|TW|https://upload.wikimedia.org/wikipedia/en/thumb/e/ed/EVA_Air_logo.svg/250px-EVA_Air_logo.svg.png
AY|Finnair|FI|https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Finnair_Logo.svg/250px-Finnair_Logo.svg.png
FZ|flydubai|AE|https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Fly_Dubai_logo_2010_03.svg/250px-Fly_Dubai_logo_2010_03.svg.png
F9|Frontier Airlines|US|https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Frontier_Airlines_logo.svg/250px-Frontier_Airlines_logo.svg.png
GA|Garuda Indonesia|ID|https://upload.wikimedia.org/wikipedia/en/thumb/f/fe/Garuda_Indonesia_Logo.svg/250px-Garuda_Indonesia_Logo.svg.png
A9|Georgian Airways|GE|https://upload.wikimedia.org/wikipedia/en/thumb/4/40/Georgian_Airways_logo.svg/250px-Georgian_Airways_logo.svg.png
G3|Gol Linhas Aéreas|BR|https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Gol_Linhas_A%C3%A9reas_Inteligentes_logo_%282015%2C_without_the_slogan%29.svg/250px-Gol_Linhas_A%C3%A9reas_Inteligentes_logo_%282015%2C_without_the_slogan%29.svg.png
GF|Gulf Air|BH|https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Gulf_Air_Logo_2018.svg/250px-Gulf_Air_Logo_2018.svg.png
HU|Hainan Airlines|CN|https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Hainan_Airlines_Logo.svg/250px-Hainan_Airlines_Logo.svg.png
IB|Iberia|ES|https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Logotipo_de_Iberia.svg/250px-Logotipo_de_Iberia.svg.png
6E|IndiGo|IN|https://upload.wikimedia.org/wikipedia/en/thumb/6/69/IndiGo.svg/250px-IndiGo.svg.png
AZ|ITA Airways|IT|https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/ITA_Airways_logo_light-on-dark.svg/250px-ITA_Airways_logo_light-on-dark.svg.png
JL|Japan Airlines|JP|https://upload.wikimedia.org/wikipedia/en/thumb/d/dd/Japan_Airlines_Logo_%282011%29.svg/250px-Japan_Airlines_Logo_%282011%29.svg.png
LS|Jet2.com|GB|https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Jet2Logo.svg/250px-Jet2Logo.svg.png
B6|JetBlue|US|https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/JetBlue_Airways_Logo.svg/250px-JetBlue_Airways_Logo.svg.png
JQ|Jetstar Airways|AU|https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Jetstar_logo.svg/250px-Jetstar_logo.svg.png
KQ|Kenya Airways|KE|https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Kenya_Airways_Logo.svg/250px-Kenya_Airways_Logo.svg.png
KL|KLM|NL|https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/KLM_logo.svg/250px-KLM_logo.svg.png
KE|Korean Air|KR|https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Korean_Air_2025.svg/250px-Korean_Air_2025.svg.png
KU|Kuwait Airways|KW|https://upload.wikimedia.org/wikipedia/en/thumb/0/08/Kuwait_Airways_logo.svg/250px-Kuwait_Airways_logo.svg.png
LA|LATAM Airlines|CL|https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Latam-logo_-v_%28Indigo%29.svg/250px-Latam-logo_-v_%28Indigo%29.svg.png
LO|LOT Polish Airlines|PL|https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/LOT_Polish_Airlines.svg/250px-LOT_Polish_Airlines.svg.png
LH|Lufthansa|DE|https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lufthansa_Logo_2018.svg/250px-Lufthansa_Logo_2018.svg.png
MH|Malaysia Airlines|MY|https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Malaysia_Airlines_Logo.svg/250px-Malaysia_Airlines_Logo.svg.png
DY|Norwegian|NO|https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Norwegian_Logo_2024.svg/250px-Norwegian_Logo_2024.svg.png
WY|Oman Air|OM|https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/Oman_Air_logo.svg/250px-Oman_Air_logo.svg.png
PC|Pegasus Airlines|TR|https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Pegasus_Airlines_logo.svg/250px-Pegasus_Airlines_logo.svg.png
PR|Philippine Airlines|PH|https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/Philippine_Airlines_logo.svg/250px-Philippine_Airlines_logo.svg.png
QF|Qantas|AU|https://upload.wikimedia.org/wikipedia/en/thumb/0/02/Qantas_Airways_logo_2016.svg/250px-Qantas_Airways_logo_2016.svg.png
QR|Qatar Airways|QA|https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Qatar_Airways_Logo.svg/250px-Qatar_Airways_Logo.svg.png
FV|Rossiya Airlines|RU|https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Rossiya_Airline.svg/250px-Rossiya_Airline.svg.png
AT|Royal Air Maroc|MA|https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Logo_Royal_Air_Maroc.svg/250px-Logo_Royal_Air_Maroc.svg.png
RJ|Royal Jordanian|JO|https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Royal_Jordanian_Logo.svg/250px-Royal_Jordanian_Logo.svg.png
FR|Ryanair|IE|https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Ryanair.svg/250px-Ryanair.svg.png
S7|S7 Airlines|RU|https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/S7_new_logo.svg/250px-S7_new_logo.svg.png
SK|SAS|SE|https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Scandinavian_Airlines_logo.svg/250px-Scandinavian_Airlines_logo.svg.png
SV|Saudia|SA|https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Logo_of_Saudia.svg/250px-Logo_of_Saudia.svg.png
TR|Scoot|SG|https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Scoot_logo.svg/250px-Scoot_logo.svg.png
SQ|Singapore Airlines|SG|https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Singapore_Airlines_Logo_2.svg/250px-Singapore_Airlines_Logo_2.svg.png
SA|South African Airways|ZA|https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/SAA_logo_%282019%29.svg/250px-SAA_logo_%282019%29.svg.png
WN|Southwest Airlines|US|https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Southwest_Airlines_logo_2014.svg/250px-Southwest_Airlines_logo_2014.svg.png
NK|Spirit Airlines|US|https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Spirit_Airlines_logo.svg/250px-Spirit_Airlines_logo.svg.png
9C|Spring Airlines|CN|https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/SpringAirLogo.svg/250px-SpringAirLogo.svg.png
UL|SriLankan Airlines|LK|https://upload.wikimedia.org/wikipedia/en/thumb/7/78/SriLankan_Airlines_Logo.svg/250px-SriLankan_Airlines_Logo.svg.png
LX|SWISS|CH|https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Swiss_International_Air_Lines_Logo_2011.svg/250px-Swiss_International_Air_Lines_Logo_2011.svg.png
TP|TAP Air Portugal|PT|https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/TAP-Portugal-Logo.svg/250px-TAP-Portugal-Logo.svg.png
RO|TAROM|RO|https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/TAROM_Logo_%28blue%29.svg/250px-TAROM_Logo_%28blue%29.svg.png
FD|Thai AirAsia|TH|https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/AirAsia_New_Logo.svg/250px-AirAsia_New_Logo.svg.png
TG|Thai Airways|TH|https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Thai_Airways_logo.svg/250px-Thai_Airways_logo.svg.png
HV|Transavia|NL|https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Transavia_2025_logo.svg/250px-Transavia_2025_logo.svg.png
TO|Transavia France|FR|https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Transavia_2025_logo.svg/250px-Transavia_2025_logo.svg.png
TK|Turkish Airlines|TR|https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Turkish_Airlines_logo_2019_compact.svg/250px-Turkish_Airlines_logo_2019_compact.svg.png
UA|United Airlines|US|https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/United_Airlines_Logo.svg/250px-United_Airlines_Logo.svg.png
VN|Vietnam Airlines|VN|https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Vietnam_Airlines_logo_2015.svg/250px-Vietnam_Airlines_logo_2015.svg.png
VS|Virgin Atlantic|GB|https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Virgin_Atlantic_logo_2018.svg/250px-Virgin_Atlantic_logo_2018.svg.png
Y4|Volaris|MX|https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Volaris-logo.svg/250px-Volaris-logo.svg.png
VY|Vueling|ES|https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Logo_Vueling.svg/250px-Logo_Vueling.svg.png
WS|WestJet|CA|https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/WestJetLogo2018.svg/250px-WestJetLogo2018.svg.png
W6|Wizz Air|HU|https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Wizz_Air_logo_2015.svg/250px-Wizz_Air_logo_2015.svg.png
`;
