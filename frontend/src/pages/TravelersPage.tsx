import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Loader2, Search, SearchX, Sparkles, UserRound, X } from 'lucide-react';
import { Button } from '@/components/Button';
import {
  fetchFriends,
  fetchIncomingFriendRequests,
  fetchPopularTravelers,
  respondToFriendRequest,
  searchTravelers,
} from '@/lib/api';
import { useSidebarCollapsed } from '@/lib/useSidebarCollapsed';
import type { FriendStatus, IncomingFriendRequest, TravelerSearchResult } from '@/lib/types';

const statusBadge = (status: FriendStatus, t: (key: string) => string) => {
  switch (status) {
    case 'friends':
      return (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success shrink-0">
          {t('friend.status.friends')}
        </span>
      );
    case 'outgoing':
      return (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
          {t('friend.status.outgoing')}
        </span>
      );
    case 'incoming':
      return (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0">
          {t('friend.status.incoming')}
        </span>
      );
    default:
      return null;
  }
};

const SectionTitle: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
    {icon}
    {children}
  </h2>
);

const TravelerRow: React.FC<{ result: TravelerSearchResult }> = ({ result }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      <button
        type="button"
        onClick={() => navigate(`/travelers/${result.id}`)}
        className="w-full flex items-center gap-3 p-3 !rounded-3xl surface-panel hover:ring-1 hover:ring-gold/40 transition-all cursor-pointer text-left"
      >
        {result.avatar_url ? (
          <img
            src={result.avatar_url}
            alt=""
            className="w-14 h-14 rounded-full object-cover ring-2 ring-gold/30 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center text-gold shrink-0 ring-2 ring-gold/30">
            <UserRound className="w-7 h-7" />
          </div>
        )}
        <span className="text-sm font-semibold flex-1 truncate">@{result.username}</span>
        {statusBadge(result.friend_status, t)}
      </button>
    </motion.li>
  );
};

export const TravelersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sidebarCollapsed = useSidebarCollapsed();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TravelerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popular, setPopular] = useState<TravelerSearchResult[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [friends, setFriends] = useState<TravelerSearchResult[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [requests, setRequests] = useState<IncomingFriendRequest[]>([]);
  const [respondBusy, setRespondBusy] = useState<string | null>(null);

  const grid =
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' +
    (sidebarCollapsed ? '' : ' xl:grid-cols-4');

  const loadFriends = useCallback(async () => {
    try {
      setFriends(await fetchFriends());
    } catch {
      setFriends([]);
    }
  }, []);

  // Sezioni social caricate all'ingresso nella pagina.
  useEffect(() => {
    let cancelled = false;
    setFriendsLoading(true);
    fetchFriends()
      .then((rows) => {
        if (!cancelled) setFriends(rows);
      })
      .catch(() => {
        if (!cancelled) setFriends([]);
      })
      .finally(() => {
        if (!cancelled) setFriendsLoading(false);
      });
    fetchIncomingFriendRequests()
      .then((rows) => {
        if (!cancelled) setRequests(rows);
      })
      .catch(() => {
        if (!cancelled) setRequests([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Profili più ricercati, mostrati di default finché non si digita.
  useEffect(() => {
    let cancelled = false;
    setPopularLoading(true);
    fetchPopularTravelers()
      .then((rows) => {
        if (!cancelled) setPopular(rows);
      })
      .catch(() => {
        /* silenzioso: la ricerca manuale resta disponibile */
      })
      .finally(() => {
        if (!cancelled) setPopularLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced search — 300ms, only while the search box has text.
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const found = await searchTravelers(query);
        setResults(found);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error'));
        setResults([]);
      } finally {
        setSearching(false);
        setHasSearched(true);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query, t]);

  const handleRespond = async (request: IncomingFriendRequest, accept: boolean) => {
    setRespondBusy(request.id);
    try {
      await respondToFriendRequest(request.id, accept);
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      window.dispatchEvent(new Event('ja-friends-updated'));
      if (accept) void loadFriends();
    } catch {
      /* silenzioso: badge e lista restano invariati */
    } finally {
      setRespondBusy(null);
    }
  };

  return (
    <div className="relative w-full max-w-[1680px] mx-auto transition-all duration-300">
      <div className="mb-8">
        <h1>{t('travelers.title')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">{t('travelers.subtitle')}</p>
      </div>

      <div className="input-field flex items-center gap-2 mb-8 focus:!ring-0 focus:!ring-transparent focus:!border-slate-300 dark:focus:!border-white/15">
        <Search className="w-5 h-5 text-gold shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('travelers.searchPlaceholder')}
          className="w-full bg-transparent outline-none focus:!outline-none placeholder:text-slate-400"
          autoFocus
        />
        {searching && <Loader2 className="w-5 h-5 text-gold animate-spin shrink-0" />}
      </div>

      {error && (
        <p className="text-error text-sm mb-4">{error}</p>
      )}

      {query.trim() && !searching && hasSearched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="w-10 h-10 text-slate-400 mb-3" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            {t('travelers.noResults', { query: query.trim() })}
          </p>
        </div>
      )}

      {query.trim() && results.length > 0 && (
        <motion.ul
          className={grid + ' mb-8'}
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
        >
          {results.map((result) => (
            <TravelerRow key={result.id} result={result} />
          ))}
        </motion.ul>
      )}

      {!query.trim() && (
        <>
          {/* ── Amici: striscia orizzontale, scrollabile (niente titolo, solo se presenti) ── */}
          {!friendsLoading && friends.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pt-2 pb-2 mb-8 -mx-1 px-1">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => navigate(`/travelers/${friend.id}`)}
                  className="flex flex-col items-center gap-2 w-[140px] sm:w-[160px] shrink-0 group cursor-pointer"
                >
                  {friend.avatar_url ? (
                    <img
                      src={friend.avatar_url}
                      alt=""
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-2 ring-gold/30 group-hover:ring-gold/60 transition-all shrink-0"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gold/15 flex items-center justify-center text-gold shrink-0 ring-2 ring-gold/30 group-hover:ring-gold/60 transition-all">
                      <UserRound className="w-14 h-14 sm:w-16 sm:h-16" />
                    </div>
                  )}
                  <span className="text-sm font-semibold truncate w-full text-center">
                    @{friend.username}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ── Richieste ricevute (nascosta se non ce ne sono) ── */}
          {requests.length > 0 && (
            <section className="mb-8">
              <SectionTitle>{t('travelers.requests')}</SectionTitle>
              <motion.ul
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.04 } } }}
              >
                {requests.map((request) => (
                  <motion.li
                    key={request.id}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                  >
                    <div className="flex items-center gap-3 p-3 !rounded-3xl surface-panel">
                      {request.avatar_url ? (
                        <img
                          src={request.avatar_url}
                          alt=""
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-gold/30 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center text-gold shrink-0 ring-2 ring-gold/30">
                          <UserRound className="w-7 h-7" />
                        </div>
                      )}
                      <span className="text-sm font-semibold flex-1 truncate">
                        @{request.username}
                      </span>
                      <Button size="sm" onClick={() => handleRespond(request, true)} disabled={respondBusy === request.id}>
                        <Check className="w-5 h-5" />
                        {t('friend.accept')}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleRespond(request, false)} disabled={respondBusy === request.id}>
                        <X className="w-5 h-5" />
                        {t('friend.decline')}
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </section>
          )}

          {/* ── Più ricercati ── */}
          <section>
            <SectionTitle>
              <Sparkles className="w-5 h-5 text-gold" />
              {t('travelers.popular')}
            </SectionTitle>
            {popularLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
              </div>
            ) : popular.length > 0 ? (
              <motion.ul
                className={grid}
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.04 } } }}
              >
                {popular.map((result) => (
                  <TravelerRow key={result.id} result={result} />
                ))}
              </motion.ul>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
};