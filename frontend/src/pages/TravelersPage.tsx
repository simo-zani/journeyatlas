import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Loader2,
  Search,
  SearchX,
  Send,
  Sparkles,
  UserCheck,
  UserPlus,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import {
  fetchFriends,
  fetchIncomingFriendRequests,
  fetchPopularTravelers,
  respondToFriendRequest,
  searchTravelers,
  sendFriendRequest,
} from '@/lib/api';
import { useSidebarCollapsed } from '@/lib/useSidebarCollapsed';
import type { IncomingFriendRequest, TravelerSearchResult } from '@/lib/types';


/* ─── Pulsante azione amicizia ─────────────────────────────────────────────── */

const FriendActionButton: React.FC<{
  result: TravelerSearchResult;
  onSendRequest: (id: string) => Promise<void>;
  onAcceptRequest?: (senderUserId: string) => Promise<void>;
}> = ({ result, onSendRequest, onAcceptRequest }) => {
  const [busy, setBusy] = useState(false);
  const { friend_status, id } = result;

  const handleSend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBusy(true);
    try {
      await onSendRequest(id);
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBusy(true);
    try {
      if (onAcceptRequest) {
        await onAcceptRequest(id);
      }
    } finally {
      setBusy(false);
    }
  };

  if (friend_status === 'friends') {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 w-[136px] py-2 rounded-full text-xs font-semibold bg-success/15 text-emerald-600 dark:text-emerald-400 shrink-0 select-none">
        <UserCheck className="w-5 h-5" strokeWidth={2.2} />
        Amici
      </span>
    );
  }

  if (friend_status === 'outgoing') {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 w-[136px] py-2 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 select-none">
        <Send className="w-4.5 h-4.5" />
        Richiesta inviata
      </span>
    );
  }

  if (friend_status === 'self') {
    return null;
  }

  if (friend_status === 'incoming') {
    return (
      <button
        type="button"
        onClick={handleAccept}
        disabled={busy}
        className="inline-flex items-center justify-center gap-1.5 w-[136px] py-2 rounded-full text-xs font-semibold
          bg-deep-blue text-white ring-1 ring-inset ring-gold/60
          hover:ring-gold hover:shadow-glow-gold transition-all duration-200 shrink-0
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
      >
        {busy ? (
          <Loader2 className="w-4.5 h-4.5 animate-spin" />
        ) : (
          <Check className="w-5 h-5" strokeWidth={2.5} />
        )}
        Accetta
      </button>
    );
  }

  /* default: nessuna relazione → Aggiungi */
  return (
    <button
      type="button"
      onClick={handleSend}
      disabled={busy}
      className="inline-flex items-center justify-center gap-1.5 w-[136px] py-2 rounded-full text-xs font-semibold
        bg-gold/10 text-gold-dark dark:text-gold border border-gold/30
        hover:bg-gold/20 hover:border-gold/60 transition-all duration-200 shrink-0
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {busy ? (
        <Loader2 className="w-4.5 h-4.5 animate-spin" />
      ) : (
        <UserPlus className="w-5 h-5" />
      )}
      Aggiungi
    </button>
  );
};

/* ─── Card viaggiatore (griglia) ───────────────────────────────────────────── */

const TravelerCard: React.FC<{
  result: TravelerSearchResult;
  onSendRequest: (id: string) => Promise<void>;
  onAcceptRequest?: (senderUserId: string) => Promise<void>;
}> = ({ result, onSendRequest, onAcceptRequest }) => {
  const navigate = useNavigate();

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 12, scale: 0.97 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      <button
        type="button"
        onClick={() => navigate(`/travelers/${result.id}`)}
        className="w-full flex items-center gap-3 p-2 sm:p-2.5 !rounded-full surface-panel
          hover:border-gold/30 hover:shadow-lg hover:-translate-y-0.5
          transition-all duration-200 text-left group cursor-pointer"
      >
        {result.avatar_url ? (
          <img
            src={result.avatar_url}
            alt=""
            className="w-11 h-11 rounded-full object-cover ring-2 ring-gold/25 group-hover:ring-gold/50 transition-all shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0 ring-2 ring-gold/25 group-hover:ring-gold/50 transition-all">
            <UserRound className="w-7 h-7" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold truncate block text-slate-900 dark:text-slate-100">
            @{result.username}
          </span>
        </div>
        <div className="pr-1 sm:pr-1.5 shrink-0">
          <FriendActionButton result={result} onSendRequest={onSendRequest} onAcceptRequest={onAcceptRequest} />
        </div>
      </button>
    </motion.li>
  );
};

/* ─── Titolo sezione ───────────────────────────────────────────────────────── */

const SectionTitle: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <div className="flex items-center gap-2 mb-4">
    {icon}
    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
      {children}
    </span>
  </div>
);

/* ─── Pagina principale ────────────────────────────────────────────────────── */

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

  const gridClass =
    'grid grid-cols-1 sm:grid-cols-2 gap-3' +
    (sidebarCollapsed ? ' lg:grid-cols-3 xl:grid-cols-4' : ' lg:grid-cols-3');

  /* ── Caricamento iniziale ── */

  const loadFriends = useCallback(async () => {
    try {
      setFriends(await fetchFriends());
    } catch {
      setFriends([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setFriendsLoading(true);
    fetchFriends()
      .then((rows) => { if (!cancelled) setFriends(rows); })
      .catch(() => { if (!cancelled) setFriends([]); })
      .finally(() => { if (!cancelled) setFriendsLoading(false); });
    fetchIncomingFriendRequests()
      .then((rows) => { if (!cancelled) setRequests(rows); })
      .catch(() => { if (!cancelled) setRequests([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setPopularLoading(true);
    fetchPopularTravelers()
      .then((rows) => { if (!cancelled) setPopular(rows); })
      .catch(() => { /* silenzioso */ })
      .finally(() => { if (!cancelled) setPopularLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Ricerca con debounce ── */

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

  /* ── Invia richiesta di amicizia ── */

  const handleSendRequest = async (addresseeId: string) => {
    await sendFriendRequest(addresseeId);
    const patch = (list: TravelerSearchResult[]) =>
      list.map((r) => (r.id === addresseeId ? { ...r, friend_status: 'outgoing' as const } : r));
    setResults(patch);
    setPopular(patch);
  };

  /* ── Rispondi a una richiesta ricevuta ── */

  const handleAcceptByUserId = async (senderUserId: string) => {
    const req = requests.find((r) => r.user_id === senderUserId);
    if (req) {
      await handleRespond(req, true);
    } else {
      try {
        const incoming = await fetchIncomingFriendRequests();
        const found = incoming.find((r) => r.user_id === senderUserId);
        if (found) {
          await handleRespond(found, true);
        }
      } catch {
        /* no-op */
      }
    }
  };

  const handleRespond = async (request: IncomingFriendRequest, accept: boolean) => {
    setRespondBusy(request.id);
    try {
      await respondToFriendRequest(request.id, accept);
      setRequests((prev) => prev.filter((r) => r.id !== request.id));

      const newStatus = accept ? ('friends' as const) : null;
      const patch = (list: TravelerSearchResult[]) =>
        list.map((r) => (r.id === request.user_id ? { ...r, friend_status: newStatus } : r));
      setResults(patch);
      setPopular(patch);

      window.dispatchEvent(new Event('ja-friends-updated'));
      if (accept) void loadFriends();
    } catch {
      /* silenzioso */
    } finally {
      setRespondBusy(null);
    }
  };

  return (
    <div className="relative w-full max-w-[1680px] mx-auto transition-all duration-300">

      {/* Header */}
      <div className="mb-8">
        <h1>{t('travelers.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('travelers.subtitle')}</p>
      </div>

      {/* Barra di ricerca */}
      <div className="relative mb-10">
        <div className="input-field flex items-center gap-3 focus-within:ring-0 focus-within:outline-none transition-all duration-200">
          <Search className="w-5 h-5 text-gold shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('travelers.searchPlaceholder')}
            className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
            autoFocus
          />
          <AnimatePresence>
            {searching && (
              <motion.span
                key="spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader2 className="w-5 h-5 text-gold animate-spin shrink-0" />
              </motion.span>
            )}
            {query && !searching && (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                type="button"
                onClick={() => setQuery('')}
                className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {error && <p className="text-error text-sm mb-4">{error}</p>}

      {/* ── Risultati ricerca / Contenuto default ── */}
      <AnimatePresence mode="wait">
        {query.trim() ? (
          <motion.div
            key="search-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {!searching && hasSearched && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <SearchX className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                  {t('travelers.noResults', { query: query.trim() })}
                </p>
              </div>
            ) : results.length > 0 ? (
              <motion.ul
                className={gridClass}
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.04 } } }}
              >
                {results.map((result) => (
                  <TravelerCard
                    key={result.id}
                    result={result}
                    onSendRequest={handleSendRequest}
                    onAcceptRequest={handleAcceptByUserId}
                  />
                ))}
              </motion.ul>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key="default-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* ── Richieste ricevute ── */}
            <AnimatePresence>
              {requests.length > 0 && (
                <motion.section
                  className="mb-10"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <SectionTitle icon={<UserPlus className="w-3.5 h-3.5 text-gold" />}>
                    {t('travelers.requests')} ({requests.length})
                  </SectionTitle>
                  <motion.ul
                    className={gridClass}
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                  >
                    {requests.map((request) => (
                      <motion.li
                        key={request.id}
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                        }}
                      >
                        <div className="flex items-center gap-3 p-2 sm:p-2.5 !rounded-full surface-panel border border-gold/20">
                          {request.avatar_url ? (
                            <img
                              src={request.avatar_url}
                              alt=""
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-gold/30 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0 ring-2 ring-gold/25">
                              <UserRound className="w-7 h-7" />
                            </div>
                          )}
                          <span className="text-sm font-semibold flex-1 truncate min-w-0">@{request.username}</span>
                          <div className="flex items-center gap-1.5 shrink-0 pr-1.5">
                            <button
                              type="button"
                              onClick={() => handleRespond(request, true)}
                              disabled={respondBusy === request.id}
                              aria-label={t('friend.accept')}
                              className="w-9 h-9 rounded-full flex items-center justify-center
                                bg-deep-blue text-white ring-1 ring-inset ring-gold/60
                                hover:ring-gold hover:shadow-glow-gold active:scale-95
                                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
                            >
                              <Check className="w-5 h-5" strokeWidth={2.5} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRespond(request, false)}
                              disabled={respondBusy === request.id}
                              aria-label={t('friend.decline')}
                              className="w-9 h-9 rounded-full flex items-center justify-center
                                bg-transparent text-gold-dark dark:text-gold border border-gold/40
                                hover:border-gold hover:bg-gold/10 active:scale-95
                                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <X className="w-5 h-5" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.section>
              )}
            </AnimatePresence>

            {/* ── I miei amici ── */}
            {friendsLoading ? (
              <section className="mb-10">
                <SectionTitle icon={<Users className="w-3.5 h-3.5 text-gold" />}>
                  I miei amici
                </SectionTitle>
                <div className="flex gap-5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2.5 w-[90px] shrink-0 animate-pulse">
                      <div className="w-[72px] h-[72px] rounded-full bg-slate-200 dark:bg-white/10" />
                      <div className="h-2.5 w-14 rounded-full bg-slate-200 dark:bg-white/10" />
                    </div>
                  ))}
                </div>
              </section>
            ) : friends.length > 0 ? (
              <section className="mb-10">
                <SectionTitle icon={<Users className="w-3.5 h-3.5 text-gold" />}>
                  I miei amici ({friends.length})
                </SectionTitle>
                <div className="flex gap-5 overflow-x-auto pt-2 pb-3 -mx-1 px-1">
                  {friends.map((friend) => (
                    <motion.button
                      key={friend.id}
                      type="button"
                      onClick={() => navigate(`/travelers/${friend.id}`)}
                      className="flex flex-col items-center gap-2.5 w-[90px] shrink-0 group cursor-pointer"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {friend.avatar_url ? (
                        <img
                          src={friend.avatar_url}
                          alt=""
                          className="w-[72px] h-[72px] rounded-full object-cover
                            ring-2 ring-gold/30 group-hover:ring-gold/70
                            shadow-md group-hover:shadow-lg group-hover:shadow-gold/20
                            transition-all duration-200 shrink-0"
                        />
                      ) : (
                        <div className="w-[72px] h-[72px] rounded-full bg-gold/10
                          flex items-center justify-center text-gold shrink-0
                          ring-2 ring-gold/30 group-hover:ring-gold/70
                          shadow-md group-hover:shadow-lg group-hover:shadow-gold/20
                          transition-all duration-200">
                          <UserRound className="w-10 h-10" />
                        </div>
                      )}
                      <span className="text-[11px] font-semibold truncate w-full text-center
                        text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                        @{friend.username}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </section>
            ) : null}

            {/* ── Profili più ricercati ── */}
            <section>
              <SectionTitle icon={<Sparkles className="w-3.5 h-3.5 text-gold" />}>
                {t('travelers.popular')}
              </SectionTitle>
              {popularLoading ? (
                <div className={gridClass}>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 sm:p-2.5 !rounded-full surface-panel animate-pulse">
                      <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 rounded-full bg-slate-200 dark:bg-white/10" />
                      </div>
                      <div className="h-8 w-[136px] rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : popular.length > 0 ? (
                <motion.ul
                  className={gridClass}
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.04 } } }}
                >
                  {popular.map((result) => (
                    <TravelerCard
                      key={result.id}
                      result={result}
                      onSendRequest={handleSendRequest}
                      onAcceptRequest={handleAcceptByUserId}
                    />
                  ))}
                </motion.ul>
              ) : null}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};