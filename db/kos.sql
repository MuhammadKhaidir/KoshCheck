-- Skema tabel kos untuk alur verifikasi KoshCheck.
-- Jalankan sekali di Supabase SQL Editor.

create table if not exists public.kos (
  id           uuid primary key default gen_random_uuid(),
  nama         text not null,
  nama_pemilik text not null,
  alamat       text not null,
  kota         text not null,
  tipe         text not null check (tipe in ('putra', 'putri', 'campur')),
  harga        integer not null check (harga > 0),
  whatsapp     text not null,
  deskripsi    text not null default '',
  fasilitas    text[] not null default '{}',
  foto         text[] not null default '{}',
  latitude     double precision,
  longitude    double precision,
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now(),
  approved_at  timestamptz
);

create index if not exists kos_status_created_idx on public.kos (status, created_at desc);

-- RLS aktif tanpa policy: hanya service role (dipakai di api/) yang bisa baca/tulis.
alter table public.kos enable row level security;

-- Bucket foto (publik untuk dibaca, upload hanya lewat service role dari server).
insert into storage.buckets (id, name, public)
values ('kos-foto', 'kos-foto', true)
on conflict (id) do nothing;

-- Cara approve / reject kos (manual dari SQL Editor atau dashboard admin):
--   update public.kos set status = 'approved', approved_at = now() where id = '<uuid>';
--   update public.kos set status = 'rejected' where id = '<uuid>';
