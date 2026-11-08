import { useCallback, useEffect, useMemo, useState } from 'react';
// Data statis lama, dipakai hanya sebagai cadangan kalau API gagal / belum ada data.
// Sesuaikan path & jenis export ini kalau kos.js ada di lokasi lain.
import kosFallback from './kos.js';

const API_URL = '/api/kos';
const TIMEOUT_MS = 8000;

/**
 * Hook untuk katalog kos.
 *
 * Mengambil data dari GET /api/kos (hanya kos yang sudah di-approve).
 * Kalau request gagal (jaringan, timeout, server error), atau API sukses tapi belum ada
 * kos approved sama sekali dan tidak ada filter aktif, data diganti dengan kos.js
 * supaya katalog tidak kosong. Saat fallback aktif, `isFallback` bernilai true.
 *
 * @param {object} [options]
 * @param {string} [options.q]          cari di nama / alamat
 * @param {string} [options.kota]
 * @param {'putra'|'putri'|'campur'} [options.tipe]
 * @param {number} [options.minHarga]
 * @param {number} [options.maxHarga]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=12]
 * @param {boolean} [options.fallbackOnEmpty=true] pakai kos.js kalau hasil API kosong (tanpa filter)
 *
 * @returns {{
 *   data: object[],
 *   meta: { page: number, limit: number, total: number, total_pages: number },
 *   loading: boolean,
 *   error: Error | null,
 *   isFallback: boolean,
 *   refetch: () => void,
 * }}
 *
 * @example
 *   const { data, loading, isFallback } = useKos({ tipe: 'putri', kota: 'Palembang' });
 */
export default function useKos({
  q = '',
  kota = '',
  tipe = '',
  minHarga,
  maxHarga,
  page = 1,
  limit = 12,
  fallbackOnEmpty = true,
} = {}) {
  const filters = useMemo(
    () => ({ q: q.trim(), kota: kota.trim(), tipe, minHarga, maxHarga }),
    [q, kota, tipe, minHarga, maxHarga]
  );

  const [state, setState] = useState({
    data: [],
    meta: { page, limit, total: 0, total_pages: 1 },
    loading: true,
    error: null,
    isFallback: false,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    setState((s) => ({ ...s, loading: true }));

    const fallback = (error) => {
      const { data, meta } = filterFallback(kosFallback, filters, page, limit);
      setState({ data, meta, loading: false, error, isFallback: true });
    };

    (async () => {
      try {
        const res = await fetch(`${API_URL}?${buildQuery(filters, page, limit)}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`Gagal memuat data kos (HTTP ${res.status})`);

        const json = await res.json();
        if (!Array.isArray(json.data)) throw new Error('Format respons API tidak valid');

        const noFilter = !hasActiveFilter(filters);
        if (fallbackOnEmpty && noFilter && page === 1 && json.data.length === 0) {
          fallback(null);
          return;
        }

        setState({
          data: json.data,
          meta: json.meta ?? { page, limit, total: json.data.length, total_pages: 1 },
          loading: false,
          error: null,
          isFallback: false,
        });
      } catch (err) {
        // Dibatalkan karena komponen unmount / filter berubah: abaikan, jangan set state.
        if (controller.signal.aborted && !timedOut) return;
        fallback(timedOut ? new Error('Permintaan ke server terlalu lama') : err);
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters, page, limit, fallbackOnEmpty, reloadKey]);

  return { ...state, refetch };
}

export { useKos };

// ---------- helpers ----------

function hasActiveFilter(f) {
  return Boolean(f.q || f.kota || f.tipe || f.minHarga != null || f.maxHarga != null);
}

function buildQuery(f, page, limit) {
  const params = new URLSearchParams();
  if (f.q) params.set('q', f.q);
  if (f.kota) params.set('kota', f.kota);
  if (f.tipe) params.set('tipe', f.tipe);
  if (f.minHarga != null) params.set('min_harga', String(f.minHarga));
  if (f.maxHarga != null) params.set('max_harga', String(f.maxHarga));
  params.set('page', String(page));
  params.set('limit', String(limit));
  return params.toString();
}

// Terapkan filter & pagination yang sama di sisi client untuk data statis kos.js,
// supaya perilaku katalog konsisten baik dari API maupun fallback.
function filterFallback(list, f, page, limit) {
  const source = Array.isArray(list) ? list : [];
  const q = f.q.toLowerCase();
  const kota = f.kota.toLowerCase();

  const filtered = source.filter((k) => {
    if (f.tipe && k.tipe !== f.tipe) return false;
    if (kota && String(k.kota ?? '').toLowerCase() !== kota) return false;
    if (f.minHarga != null && !(Number(k.harga) >= f.minHarga)) return false;
    if (f.maxHarga != null && !(Number(k.harga) <= f.maxHarga)) return false;
    if (q) {
      const haystack = `${k.nama ?? ''} ${k.alamat ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    meta: { page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) },
  };
}
