import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';
import { Card } from '@/components/Card';
import { DeleteButton } from '@/components/trip/DeleteButton';
import { AirlineLogo } from '@/components/trip/AirlinePicker';
import { TrainOperatorLogo } from '@/components/trip/TrainOperatorPicker';
import { FerryOperatorLogo } from '@/components/trip/FerryOperatorPicker';
import { airportByIata, type Airport } from '@/lib/airports';
import { airlineByName, type Airline } from '@/lib/airlines';
import { stationByNameOrCode, type TrainStation } from '@/lib/trainStations';
import { trainOperatorByName, type TrainOperator } from '@/lib/trainOperators';
import { portByNameOrCode, type FerryPort } from '@/lib/ferryPorts';
import { ferryOperatorByName, type FerryOperator } from '@/lib/ferryOperators';
import { airlineGradient, trainOperatorGradient, TRANSPORT_TYPE_GRADIENTS } from '@/lib/airlineColors';
import {
  wallClockFromIso,
  convertWallClock,
  tzDiffMinutes,
  wallClockDiffMinutes,
  type WallClock,
} from '@/lib/flightTime';
import { TRANSPORT_ICONS, BAGGAGE_OPTIONS, TRAIN_OPTIONS, FERRY_OPTIONS } from '@/lib/transportMeta';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import type { TransportRow } from '@/lib/types';

interface TransportCardProps {
  transport: TransportRow;
  /** null finché l'elenco non è ancora caricato: la card resta senza città
   *  e fuso orario, non bloccata dietro uno spinner. */
  airports: Airport[] | null;
  airlines: Airline[] | null;
  stations?: TrainStation[] | null;
  trainOperators?: TrainOperator[] | null;
  ferryPorts?: FerryPort[] | null;
  ferryOperators?: FerryOperator[] | null;
  /** Fuso di riferimento del viaggiatore: quello dell'aeroporto più vicino a
   *  casa sua (vedi TransportSection), non un valore fisso sull'Italia. */
  homeTz: string;
  /** Mostra o nasconde la conversione con il fuso orario di riferimento */
  showHomeTz?: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const formatHM = (w: WallClock) => `${pad2(w.hour)}:${pad2(w.minute)}`;
const formatDayMonth = (w: WallClock) =>
  new Date(Date.UTC(w.year, w.month - 1, w.day)).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });

/** Giorni di scarto tra due orari a muro (per il "+1"/"-1" quando convertire
 *  in ora italiana fa scavallare la data). */
const dayShift = (a: WallClock, b: WallClock): number =>
  Math.round((Date.UTC(a.year, a.month - 1, a.day) - Date.UTC(b.year, b.month - 1, b.day)) / 86400000);

const formatDuration = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/** "6h" oppure "5h30": l'offset tra due fusi non è sempre un numero intero di
 *  ore (India, parte dell'Australia). */
const formatOffset = (diffMin: number): string => {
  const abs = Math.abs(diffMin);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `${h}h` : `${h}h${pad2(m)}`;
};

/** "−6h (20:05⁺¹)": offset più orario di casa tra parentesi, col giorno in
 *  apice solo se la conversione scavalca la mezzanotte. */
const HomeOffset: React.FC<{ diffMin: number; home: WallClock; wall: WallClock }> = ({ diffMin, home, wall }) => {
  const shift = dayShift(home, wall);
  return (
    <span className="text-[11px] font-semibold text-gold-dark dark:text-gold whitespace-nowrap">
      {diffMin < 0 ? '−' : '+'}
      {formatOffset(diffMin)} ({formatHM(home)}
      {shift !== 0 && <sup>{shift > 0 ? '+1' : '−1'}</sup>})
    </span>
  );
};

/** Le due "tacche" del biglietto staccato, al confine tra striscia e corpo
 *  (x=64, il bordo tratteggiato). Un vero buco nella card intera — non un
 *  cerchio dipinto sopra — così bordo e angoli restano intatti ovunque tranne
 *  lì, e sotto non si vede lo sfondo della card ma la pagina dietro.
 *  `intersect` tra i due livelli: ciascuno è "opaco ovunque tranne il proprio
 *  buco", l'intersezione lascia trasparenti solo i due buchi. */
const NOTCH_MASK = (() => {
  const hole = (y: string) => `radial-gradient(circle 10px at 64px ${y}, transparent 9.5px, black 10.5px)`;
  const image = `${hole('0px')}, ${hole('100%')}`;
  return {
    maskImage: image,
    maskComposite: 'intersect',
    WebkitMaskImage: image,
  } as React.CSSProperties;
})();

export const TransportCard: React.FC<TransportCardProps> = ({
  transport,
  airports,
  airlines,
  stations,
  trainOperators,
  ferryPorts,
  ferryOperators,
  homeTz,
  showHomeTz = false,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isFlight = transport.transport_type === 'flight';
  const isTrain = transport.transport_type === 'train';
  const isFerry = transport.transport_type === 'ferry';
  const TypeIcon = TRANSPORT_ICONS[transport.transport_type] ?? TRANSPORT_ICONS.other;

  const depAirport = isFlight && airports ? airportByIata(airports, transport.departure_airport) : null;
  const arrAirport = isFlight && airports ? airportByIata(airports, transport.arrival_airport) : null;
  const airline = transport.airline && airlines ? airlineByName(airlines, transport.airline) : null;

  const depStation = isTrain && stations ? stationByNameOrCode(stations, transport.departure_airport) : null;
  const arrStation = isTrain && stations ? stationByNameOrCode(stations, transport.arrival_airport) : null;
  const trainOp = isTrain && trainOperators ? trainOperatorByName(trainOperators, transport.airline) : null;

  const depPort = isFerry && ferryPorts ? portByNameOrCode(ferryPorts, transport.departure_airport) : null;
  const arrPort = isFerry && ferryPorts ? portByNameOrCode(ferryPorts, transport.arrival_airport) : null;
  const ferryOp = isFerry && ferryOperators ? ferryOperatorByName(ferryOperators, transport.airline) : null;

  const gradient = isFlight
    ? airlineGradient(airline?.iata, transport.airline)
    : isTrain
    ? trainOperatorGradient(trainOp, transport.airline)
    : isFerry
    ? (ferryOp?.gradient ?? TRANSPORT_TYPE_GRADIENTS.ferry)
    : TRANSPORT_TYPE_GRADIENTS[transport.transport_type] ?? TRANSPORT_TYPE_GRADIENTS.other;

  const depWall = transport.departure_datetime ? wallClockFromIso(transport.departure_datetime) : null;
  const arrWall = transport.arrival_datetime ? wallClockFromIso(transport.arrival_datetime) : null;

  // Se entrambi i punti hanno un fuso certo calcoliamo la durata esatta e l'offset
  const depTz = isFlight ? depAirport?.tz : isTrain ? depStation?.tz : isFerry ? depPort?.tz : undefined;
  const arrTz = isFlight ? arrAirport?.tz : isTrain ? arrStation?.tz : isFerry ? arrPort?.tz : undefined;
  const tzAware = Boolean(depTz && arrTz && depWall && arrWall);

  const durationMin =
    depWall && arrWall
      ? tzAware
        ? wallClockDiffMinutes(depWall, depTz!, arrWall, arrTz!)
        : Math.round(
            (Date.UTC(arrWall.year, arrWall.month - 1, arrWall.day, arrWall.hour, arrWall.minute) -
              Date.UTC(depWall.year, depWall.month - 1, depWall.day, depWall.hour, depWall.minute)) /
              60000
          )
      : null;

  const depDiffMin = tzAware ? tzDiffMinutes(depWall!, homeTz, depTz!) : 0;
  const arrDiffMin = tzAware ? tzDiffMinutes(arrWall!, homeTz, arrTz!) : 0;
  const depHome = tzAware && depDiffMin !== 0 ? convertWallClock(depWall!, depTz!, homeTz) : null;
  const arrHome = tzAware && arrDiffMin !== 0 ? convertWallClock(arrWall!, arrTz!, homeTz) : null;

  const hasBaggage = isFlight && (transport.has_backpack || transport.has_carry_on || transport.has_checked_baggage);
  const hasTrainOptions = isTrain && (transport.has_seat || transport.has_cabin);
  const hasFerryOptions =
    isFerry &&
    (transport.has_car_on_ferry || transport.has_deck_passage || transport.has_seat || transport.has_cabin);

  const stripeLabel = isFlight
    ? transport.airline || t(`transport.type.${transport.transport_type}`)
    : isTrain
    ? transport.airline || t(`transport.type.${transport.transport_type}`)
    : isFerry
    ? transport.airline || t(`transport.type.${transport.transport_type}`)
    : t(`transport.type.${transport.transport_type}`);

  return (
    <Card noPadding style={NOTCH_MASK}>
      <div className="relative flex h-full">
        {/* Striscia sinistra, stile carta d'imbarco / biglietto */}
        <div
          className="relative w-[64px] shrink-0 flex items-center justify-center py-[14px] px-1"
          style={{ background: `linear-gradient(160deg, ${gradient[0]}, ${gradient[1]})` }}
        >
          {isFlight && airline?.logo ? (
            <AirlineLogo
              airline={airline}
              className="h-[20px] w-auto max-w-[130px]"
              style={{
                transform: 'rotate(-90deg)',
                filter:
                  'drop-shadow(1px 0 0 white) drop-shadow(-1px 0 0 white) drop-shadow(0 1px 0 white) drop-shadow(0 -1px 0 white)',
              }}
            />
          ) : isTrain && trainOp ? (
            <div
              className="flex items-center gap-1.5 whitespace-nowrap"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <TrainOperatorLogo
                operator={trainOp}
                className="w-5 h-5 shrink-0"
                style={{
                  filter:
                    'drop-shadow(1px 0 0 white) drop-shadow(-1px 0 0 white) drop-shadow(0 1px 0 white) drop-shadow(0 -1px 0 white)',
                }}
              />
              <span className="text-xs font-bold text-white leading-tight tracking-wide max-w-[90px] truncate">
                {trainOp.name}
              </span>
            </div>
          ) : isFerry && ferryOp ? (
            <div
              className="flex items-center gap-1.5 whitespace-nowrap"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <FerryOperatorLogo
                operator={ferryOp}
                className="w-5 h-5 shrink-0"
                style={{
                  filter:
                    'drop-shadow(1px 0 0 white) drop-shadow(-1px 0 0 white) drop-shadow(0 1px 0 white) drop-shadow(0 -1px 0 white)',
                }}
              />
              <span className="text-xs font-bold text-white leading-tight tracking-wide max-w-[90px] truncate">
                {ferryOp.name}
              </span>
            </div>
          ) : (
            <span
              className="text-sm font-bold uppercase tracking-wide text-white whitespace-nowrap"
              style={{ transform: 'rotate(-90deg)' }}
              title={stripeLabel}
            >
              {stripeLabel}
            </span>
          )}

          <div
            className="absolute top-0 bottom-0 left-[64px] w-[96px] pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${gradient[1]}4D, ${gradient[1]}1A 55%, transparent)`,
            }}
          />

          <div className="absolute right-0 top-0 bottom-0 border-r-2 border-dashed border-white/35" />
        </div>

        {/* Corpo */}
        <div className="relative flex-1 min-w-0 p-[16px] flex flex-col">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              {/* Titolo principale: città per treno/traghetto, codice per aereo, nome grezzo altrimenti */}
              <p
                className="font-poppins font-bold text-lg sm:text-xl leading-tight truncate"
                title={depStation?.city ?? depPort?.city ?? transport.departure_airport}
              >
                {depStation?.city ?? depPort?.city ?? transport.departure_airport}
              </p>
              {transport.departure_terminal && (
                <p className="text-sm font-bold text-gold-dark dark:text-gold leading-tight">
                  {transport.departure_terminal}
                </p>
              )}
              {/* Sottotitolo: nome aeroporto / nome stazione / nome porto */}
              {depAirport && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate" title={depAirport.name}>
                  {depAirport.name}
                </p>
              )}
              {depStation && depStation.name.toLowerCase() !== depStation.city.toLowerCase() && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate" title={depStation.name}>
                  {depStation.name}
                </p>
              )}
              {depPort && depPort.name.toLowerCase() !== depPort.city.toLowerCase() && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate" title={depPort.name}>
                  {depPort.name}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center pt-1.5 shrink-0 px-1.5">
              {durationMin != null && (
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {formatDuration(durationMin)}
                </span>
              )}
              {/* Un solo tratto SVG invece di bordo+icona separati: dash e
                  freccia hanno così lo stesso spessore e sono perfettamente
                  allineati (un'unica linea retta, non una curva a mano). */}
              <svg
                width="30"
                height="10"
                viewBox="0 0 30 10"
                fill="none"
                className="text-slate-300 dark:text-slate-600 my-1 shrink-0"
              >
                <path d="M1 5 H21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="3.2 3" />
                <path
                  d="M18 1 L25 5 L18 9"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1 text-right">
              {/* Titolo principale: città per treno/traghetto, codice per aereo, nome grezzo altrimenti */}
              <p
                className="font-poppins font-bold text-lg sm:text-xl leading-tight truncate"
                title={arrStation?.city ?? arrPort?.city ?? transport.arrival_airport}
              >
                {arrStation?.city ?? arrPort?.city ?? transport.arrival_airport}
              </p>
              {transport.arrival_terminal && (
                <p className="text-sm font-bold text-gold-dark dark:text-gold leading-tight">
                  {transport.arrival_terminal}
                </p>
              )}
              {/* Sottotitolo: nome aeroporto / nome stazione / nome porto */}
              {arrAirport && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate" title={arrAirport.name}>
                  {arrAirport.name}
                </p>
              )}
              {arrStation && arrStation.name.toLowerCase() !== arrStation.city.toLowerCase() && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate" title={arrStation.name}>
                  {arrStation.name}
                </p>
              )}
              {arrPort && arrPort.name.toLowerCase() !== arrPort.city.toLowerCase() && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate" title={arrPort.name}>
                  {arrPort.name}
                </p>
              )}
            </div>
          </div>

          {(depWall || arrWall) && (
            <div className="flex gap-2 mt-3 text-sm">
              {depWall && (
                <div className="flex-1 min-w-0 bg-slate-100 dark:bg-white/5 rounded-xl px-2 py-2 text-center">
                  <p className="text-xs text-slate-400 mb-0.5">{t('transport.departureAt')}</p>
                  <p className="font-semibold flex items-center justify-center flex-wrap">
                    <span>{formatHM(depWall)}</span>
                    {tzAware && depDiffMin !== 0 && depHome && (
                      <span
                        aria-hidden={!showHomeTz}
                        className={`inline-flex items-center overflow-hidden transition-all duration-300 ease-out ${
                          showHomeTz
                            ? 'max-w-[150px] opacity-100 translate-x-0 scale-100 ml-1.5'
                            : 'max-w-0 opacity-0 -translate-x-2 scale-95 ml-0 pointer-events-none'
                        }`}
                      >
                        <HomeOffset diffMin={depDiffMin} home={depHome} wall={depWall} />
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{formatDayMonth(depWall)}</p>
                </div>
              )}
              {arrWall && (
                <div className="flex-1 min-w-0 bg-slate-100 dark:bg-white/5 rounded-xl px-2 py-2 text-center">
                  <p className="text-xs text-slate-400 mb-0.5">{t('transport.arrivalAt')}</p>
                  <p className="font-semibold flex items-center justify-center flex-wrap">
                    <span>{formatHM(arrWall)}</span>
                    {tzAware && arrDiffMin !== 0 && arrHome && (
                      <span
                        aria-hidden={!showHomeTz}
                        className={`inline-flex items-center overflow-hidden transition-all duration-300 ease-out ${
                          showHomeTz
                            ? 'max-w-[150px] opacity-100 translate-x-0 scale-100 ml-1.5'
                            : 'max-w-0 opacity-0 -translate-x-2 scale-95 ml-0 pointer-events-none'
                        }`}
                      >
                        <HomeOffset diffMin={arrDiffMin} home={arrHome} wall={arrWall} />
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{formatDayMonth(arrWall)}</p>
                </div>
              )}
            </div>
          )}

          {hasBaggage && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2.5 text-xs font-medium text-gold-dark dark:text-gold">
              {BAGGAGE_OPTIONS.filter((o) => transport[o.key]).map(({ key, icon: Icon, labelKey }) => (
                <span key={key} className="inline-flex items-center gap-1">
                  <Icon className="w-[14px] h-[14px]" />
                  {t(labelKey)}
                </span>
              ))}
            </div>
          )}

          {hasTrainOptions && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2.5 text-xs font-medium text-gold-dark dark:text-gold">
              {TRAIN_OPTIONS.filter((o) => transport[o.key]).map(({ key, icon: Icon, labelKey }) => (
                <span key={key} className="inline-flex items-center gap-1">
                  <Icon className="w-[14px] h-[14px]" />
                  {t(labelKey)}
                </span>
              ))}
            </div>
          )}

          {hasFerryOptions && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2.5 text-xs font-medium text-gold-dark dark:text-gold">
              {FERRY_OPTIONS.filter((o) => transport[o.key]).map(({ key, icon: Icon, labelKey }) => (
                <span key={key} className="inline-flex items-center gap-1">
                  <Icon className="w-[14px] h-[14px]" />
                  {t(labelKey)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <TypeIcon className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
              {transport.flight_number && (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {transport.flight_number}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!confirmingDelete && (
                <button
                  onClick={onEdit}
                  className="p-2 rounded-xl text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors"
                  aria-label={t('common.edit')}
                  title={t('common.edit')}
                >
                  <Pencil className={MODAL_ICON_SIZE} />
                </button>
              )}
              <DeleteButton onDelete={onDelete} onConfirmingChange={setConfirmingDelete} />
            </div>
          </div>

          {transport.booking_ref && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {t('transport.bookingRef')}: {transport.booking_ref}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
