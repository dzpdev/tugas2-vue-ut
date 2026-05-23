// ============================================================================
// SITTA UT — Shared Utilities (Tugas Praktik 2 Vue.js)
// ============================================================================
// Dipakai oleh index-app.js, stok-app.js, tracking-app.js.
// Berisi: formatters (locale Indonesia), sanitization (DOMPurify wrapper),
// storage IO (try-catch), Domain rules (status, isKritis, nextStatuses,
// generateDoNumber), dan factory createStorageSyncedRef untuk multi-tab sync.
// ============================================================================

// ============================================================================
// Formatters — Locale Indonesia
// ============================================================================

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n);
}

function formatTanggal(s) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(s));
}

function formatWaktu(iso) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(iso));
}

function todayLocal() {
  // CRITICAL: jangan pakai toISOString().slice(0,10) — itu UTC, off-by-one di Indonesia
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ============================================================================
// Sanitization — DOMPurify dengan whitelist tegas
// ============================================================================
// Untuk catatanHTML yang cuma butuh emphasis inline. Default DOMPurify masih
// allow <a href="javascript:...">, <img onerror>, dll — JANGAN pakai default.

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['em', 'strong', 'u', 'b', 'i', 'br'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  ALLOW_DATA_ATTR: false
};

function safeSanitize(html) {
  if (typeof DOMPurify === 'undefined') {
    console.warn('[SITTA] DOMPurify not loaded — returning empty string for v-html safety');
    return '';
  }
  return DOMPurify.sanitize(html ?? '', SANITIZE_CONFIG);
}

// ============================================================================
// Storage IO — handle BOTH QuotaExceededError DAN SecurityError
// ============================================================================
// Safari Private mode throws SecurityError saat first write meski API exists.
// Feature-detect via try/catch round-trip, bukan 'localStorage' in window.

function loadFromStorage(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    console.warn(`[SITTA] localStorage load failed for "${key}":`, e.name);
    return null;
  }
}

function saveToStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (e) {
    console.warn(`[SITTA] localStorage save failed for "${key}":`, e.name, e.message);
    return false;
  }
}

// ============================================================================
// Domain Rules — single source of truth (cegah drift cross-app)
// ============================================================================

const STATUS_FLOW = {
  'Baru Dibuat':       ['Dalam Persiapan', 'Dibatalkan'],
  'Dalam Persiapan':   ['Dalam Perjalanan', 'Dibatalkan'],
  'Dalam Perjalanan':  ['Diterima'],
  'Diterima':          [],
  'Dibatalkan':        []
};

const STATUS_ICON = {
  'Baru Dibuat':       '🆕',
  'Dalam Persiapan':   '📦',
  'Dalam Perjalanan':  '🚚',
  'Diterima':          '✅',
  'Dibatalkan':        '❌'
};

const KETERANGAN_SUGGESTIONS = {
  'Dalam Persiapan':  'Paket sedang disiapkan di gudang {upbjjAsal}',
  'Dalam Perjalanan': 'Diserahkan ke kurir {ekspedisi}',
  'Diterima':         'Paket diterima dengan baik oleh penerima',
  'Dibatalkan':       'Pesanan dibatalkan atas permintaan pengguna'
};

const Domain = {
  statusOf(item) {
    if (item.qty === 0)         return { label: 'Kosong',  kelas: 'badge-kosong',  ikon: '⛔' };
    if (item.qty < item.safety) return { label: 'Menipis', kelas: 'badge-menipis', ikon: '⚠️' };
    return                            { label: 'Aman',    kelas: 'badge-aman',    ikon: '✅' };
  },

  isKritis(item) {
    return item.qty < item.safety || item.qty === 0;
  },

  nextStatuses(current) {
    return STATUS_FLOW[current] ?? [];
  },

  iconForStatus(status) {
    return STATUS_ICON[status] ?? '';
  },

  iconForKeterangan(keterangan) {
    const m = (keterangan ?? '').match(/^\[(.+?)\]/);
    return m ? (STATUS_ICON[m[1]] ?? '') : '';
  },

  suggestionFor(status, doData) {
    const tpl = KETERANGAN_SUGGESTIONS[status];
    if (!tpl) return '';
    return tpl
      .replace('{upbjjAsal}', doData?.upbjjAsal ?? '')
      .replace('{ekspedisi}', doData?.ekspedisi ?? '');
  },

  generateDoNumber(tracking, year) {
    year = year ?? new Date().getFullYear();
    const prefix = `DO${year}-`;
    const seqs = Object.keys(tracking)
      .filter(k => k.startsWith(prefix))
      .map(k => parseInt(k.slice(prefix.length), 10))
      .filter(n => !isNaN(n));
    const next = seqs.length ? Math.max(...seqs) + 1 : 1;
    return prefix + String(next).padStart(3, '0');
  },

  slugStatus(status) {
    return (status ?? '').toLowerCase().replace(/\s+/g, '-');
  },

  isKodeInPaket(kode, paketList) {
    return paketList.some(p => p.isi.includes(kode));
  }
};

// ============================================================================
// Storage-synced ref factory
// ============================================================================
// Eliminates duplikasi watcher+listener+dedup di tiap app. Pakai value
// comparison via _lastSavedJSON_<key> instead of brittle _suppressSave flag.

function createStorageSyncedRef(key) {
  return {
    load(seedFn) {
      return loadFromStorage(key) ?? JSON.parse(JSON.stringify(seedFn()));
    },

    install(vm, prop, opts = {}) {
      const lastKey = `_lastSavedJSON_${key}`;
      vm[lastKey] = JSON.stringify(vm[prop]);

      const stopWatch = vm.$watch(prop, {
        deep: opts.deep ?? 2,  // Vue 3.5 explicit depth
        handler(newVal) {
          const json = JSON.stringify(newVal);
          if (json === vm[lastKey]) return;  // dedup: same as last save = origin storage event
          vm[lastKey] = json;
          saveToStorage(key, newVal);
        }
      });

      const onStorage = (e) => {
        if (e.key !== key || !e.newValue) return;
        vm[lastKey] = e.newValue;
        vm[prop] = JSON.parse(e.newValue);
        if (opts.onSync) opts.onSync.call(vm);
      };
      window.addEventListener('storage', onStorage);

      return () => {
        stopWatch();
        window.removeEventListener('storage', onStorage);
      };
    }
  };
}

const stokStore = createStorageSyncedRef('sitta-stok-v2');
const trackingStore = createStorageSyncedRef('sitta-tracking-v2');

// ============================================================================
// === AUTH (mock — coursework only) ===
// ============================================================================
// CATATAN PII: DEMO_ACCOUNTS hard-coded dengan plain-text password adalah
// pilihan EKSPLISIT untuk coursework demo. Mirror Tugas 1's auth.js pattern.
// Demo hint card di login.html juga tampilkan semua password — fully
// transparent untuk grading. JANGAN diadopsi di production app.
//
// SECURITY CONVENTIONS (lihat plan):
// 1. Redirect targets HARUS literal — JANGAN baca dari auth/session object
// 2. v-html HARUS via safeSanitize() — auth token di localStorage readable
//    by any same-origin script
// 3. AUTH_KEY literal muncul di 5 tempat (1 const ini + 4 head guard HTML);
//    kalau berubah, sync semua manual
// ============================================================================

// MUST match literal in <head> guards of dashboard.html, stok.html,
// tracking.html, index.html.
const AUTH_KEY = 'sitta-auth-v2';

const DEMO_ACCOUNTS = [
  { email: 'admin@ut.ac.id', password: 'admin123', nama: 'Admin SITTA',
    role: 'Administrator',  upbjj: null,        badge: 'role-admin'    },
  { email: 'siti@ut.ac.id',  password: 'siti123',  nama: 'Siti Nurhaliza',
    role: 'Puslaba',        upbjj: null,        badge: 'role-puslaba'  },
  { email: 'doni@ut.ac.id',  password: 'doni123',  nama: 'Doni Pratama',
    role: 'Fakultas',       upbjj: null,        badge: 'role-fakultas' },
  { email: 'rina@ut.ac.id',  password: 'rina123',  nama: 'Rina Wulandari',
    role: 'UPBJJ Jakarta',  upbjj: 'Jakarta',   badge: 'role-upbjj'    },
  { email: 'agus@ut.ac.id',  password: 'agus123',  nama: 'Agus Pranoto',
    role: 'UPBJJ Makassar', upbjj: 'Makassar',  badge: 'role-upbjj'    }
];

// Whitelist untuk safeRoleBadge — cegah arbitrary CSS class injection
// kalau ada localStorage spoof. Cosmetic-only impact tanpa guard, tapi
// preventive defense murah.
const ALLOWED_ROLE_BADGES = new Set([
  'role-admin', 'role-puslaba', 'role-fakultas', 'role-upbjj', 'role-default'
]);

// ---------- Auth state helpers ----------

function getAuth() {
  return loadFromStorage(AUTH_KEY);  // returns object | null
}

function setAuth(account) {
  // Simpan subset (no password!) + loginAt timestamp + badge field
  const sessionData = {
    email:   account.email,
    nama:    account.nama,
    role:    account.role,
    upbjj:   account.upbjj,
    badge:   account.badge,
    loginAt: new Date().toISOString()
  };
  saveToStorage(AUTH_KEY, sessionData);
  return sessionData;
}

function clearAuth() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (e) {
    console.warn('[SITTA] clearAuth failed:', e.name);
  }
}

// ---------- Account lookup ----------

function findAccount(email, password) {
  return DEMO_ACCOUNTS.find(a =>
    a.email === email && a.password === password
  ) ?? null;
}

function emailExists(email) {
  return DEMO_ACCOUNTS.some(a => a.email === email);
}

// ---------- Display helpers ----------

function safeRoleBadge(badge) {
  // Whitelist guard — defend against localStorage spoof
  return ALLOWED_ROLE_BADGES.has(badge) ? badge : 'role-default';
}

// ---------- Multi-tab auth sync factory ----------

// direction: 'logout' = protected pages (redirect to login when auth cleared)
//            'login'  = login page    (redirect to dashboard when auth set)
// Returns cleanup function — caller MUST call di beforeUnmount()
function installAuthGuardListener(direction) {
  // Closure handler — reference identik untuk add/remove symmetry.
  // PENTING: jangan pakai `this.method` reference (silent leak — Vue
  // method reference berbeda tiap akses → removeEventListener no-op).
  const handler = function (e) {
    if (e.key !== AUTH_KEY) return;
    if (direction === 'logout' && !e.newValue) {
      window.location.replace('index.html');
    } else if (direction === 'login' && e.newValue) {
      window.location.replace('dashboard.html');
    }
  };
  window.addEventListener('storage', handler);
  return function cleanup() {
    window.removeEventListener('storage', handler);
  };
}

// ============================================================================
// Sanity check log — bukti shared loaded + Vue/DOMPurify version
// ============================================================================

console.log(
  '[SITTA] shared.js loaded.',
  'Vue:', typeof Vue !== 'undefined' ? Vue.version : 'NOT LOADED',
  '| DOMPurify:', typeof DOMPurify !== 'undefined' ? DOMPurify.version : 'NOT LOADED',
  '| Accounts:', DEMO_ACCOUNTS.length,
  '| Auth:', getAuth()?.email ?? 'none'
);
