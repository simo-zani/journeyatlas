import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, PartyPopper } from 'lucide-react';
import { Card } from '@/components/Card';
import { ConfirmIconButton } from '@/components/ConfirmIconButton';
import { participantName, type ExpenseSummary, type Settlement } from '@/lib/expenses';
import type { TripParticipantDetail } from '@/lib/types';
import { ParticipantAvatar } from './participants';

interface ExpenseBalancesProps {
  summary: ExpenseSummary;
  settlements: Settlement[];
  participants: TripParticipantDetail[];
  currentUserId: string;
  formatMoney: (cents: number) => string;
  /** Registra il rimborso suggerito come trasferimento (null = non consentito). */
  onSettle: ((s: Settlement) => Promise<void>) | null;
}

export const ExpenseBalances: React.FC<ExpenseBalancesProps> = ({
  summary,
  settlements,
  participants,
  currentUserId,
  formatMoney,
  onSettle,
}) => {
  const { t } = useTranslation();
  const byId = new Map(participants.map((p) => [p.participant_id, p]));
  const name = (id: string) => participantName(byId.get(id), currentUserId, t);
  const maxAbs = Math.max(1, ...participants.map((p) => Math.abs(summary.byParticipant.get(p.participant_id)?.balance ?? 0)));
  const sorted = [...participants].sort(
    (a, b) =>
      (summary.byParticipant.get(b.participant_id)?.balance ?? 0) -
      (summary.byParticipant.get(a.participant_id)?.balance ?? 0)
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      {/* Saldi: barra divergente dal centro, verso destra chi deve ricevere, verso sinistra chi deve dare.
          Segno e testo accompagnano sempre il colore. */}
      <Card className="card-static">
        <h3 className="font-poppins font-semibold text-base mb-1">{t('expenses.balances.title')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">{t('expenses.balances.subtitle')}</p>
        <ul className="space-y-3">
          {sorted.map((p) => {
            const r = summary.byParticipant.get(p.participant_id);
            const balance = r?.balance ?? 0;
            const width = (Math.abs(balance) / maxAbs) * 50;
            const positive = balance > 0;
            const settled = balance === 0;
            return (
              <li key={p.participant_id} className="rounded-2xl bg-slate-900/5 dark:bg-white/5 px-3.5 py-3">
                <div className="flex items-center gap-3">
                  <ParticipantAvatar participant={p} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{name(p.participant_id)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {t('expenses.balances.paidAndShare', {
                        paid: formatMoney(r?.paid ?? 0),
                        share: formatMoney(r?.share ?? 0),
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold tabular-nums ${
                        settled ? 'text-slate-500 dark:text-slate-400' : positive ? 'text-success' : 'text-error'
                      }`}
                    >
                      {positive ? '+' : ''}
                      {formatMoney(balance)}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {settled
                        ? t('expenses.balances.settled')
                        : positive
                          ? t('expenses.balances.toReceive')
                          : t('expenses.balances.toGive')}
                    </p>
                  </div>
                </div>
                <div className="relative mt-2.5 h-2 rounded-full bg-slate-900/5 dark:bg-white/5">
                  <span className="absolute left-1/2 -top-0.5 -bottom-0.5 w-px bg-slate-400/50" aria-hidden="true" />
                  {!settled && (
                    <span
                      className={`absolute top-0 bottom-0 transition-[width] duration-500 ease-out ${
                        positive ? 'left-1/2 rounded-r-[4px] bg-success' : 'right-1/2 rounded-l-[4px] bg-error'
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="card-static">
        <h3 className="font-poppins font-semibold text-base mb-1">{t('expenses.settle.title')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">{t('expenses.settle.subtitle')}</p>
        {settlements.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-2 py-8">
            <PartyPopper className="w-10 h-10 text-gold" />
            <p className="font-semibold">{t('expenses.settle.allSettled')}</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {settlements.map((s) => (
              <li
                key={`${s.from}-${s.to}`}
                className="flex items-center gap-3 rounded-2xl bg-slate-900/5 dark:bg-white/5 px-3.5 py-3"
              >
                <ParticipantAvatar participant={byId.get(s.from)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{name(s.from)}</span>
                    <ArrowRight className="inline w-5 h-5 mx-1.5 -mt-0.5 text-slate-400" aria-label={t('expenses.settle.owes')} />
                    <span className="font-semibold">{name(s.to)}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('expenses.settle.sentence', { from: name(s.from), to: name(s.to), amount: formatMoney(s.cents) })}
                  </p>
                </div>
                <span className="text-sm font-bold tabular-nums shrink-0">{formatMoney(s.cents)}</span>
                {onSettle && (
                  <ConfirmIconButton
                    icon={Check}
                    label={t('expenses.settle.markPaid')}
                    tone="success"
                    onConfirm={() => onSettle(s)}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
