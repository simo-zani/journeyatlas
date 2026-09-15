-- ============================================================================
-- JourneyAtlas - Migration 0003: Categorie personalizzate Check List
-- Esegui questo script nel Supabase SQL Editor.
-- Rimuove il vincolo CHECK che limitava la categoria a valori predefiniti,
-- permettendo all'utente di creare categorie personalizzate.
-- ============================================================================

alter table public.checklist_items
  drop constraint if exists checklist_items_category_check;

-- ============================================================================
-- Fine migration
-- ============================================================================