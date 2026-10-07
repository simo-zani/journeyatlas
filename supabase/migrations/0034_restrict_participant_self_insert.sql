-- Chiude un buco di privilegi su trip_participants.
-- La policy di INSERT originale (0001) ammetteva `user_id = auth.uid()` senza
-- altri vincoli: qualunque utente autenticato poteva inserire se stesso in un
-- viaggio altrui con role 'editor' e status 'accepted', ottenendo accesso.
-- L'auto-inserimento serve solo a createTrip, che registra il creatore come
-- partecipante 'owner' del viaggio appena creato. Lo si limita a quel caso;
-- tutti gli altri inserimenti (inviti, compagni segnaposto) restano riservati
-- al proprietario del viaggio.

drop policy if exists "trip_participants_insert_owner" on public.trip_participants;
create policy "trip_participants_insert_owner"
  on public.trip_participants for insert
  with check (
    public.is_trip_owner(trip_id)
    or (
      user_id = auth.uid()
      and role = 'owner'
      and status = 'accepted'
      and exists (
        select 1 from public.trips t
        where t.id = trip_id and t.owner_id = auth.uid()
      )
    )
  );
