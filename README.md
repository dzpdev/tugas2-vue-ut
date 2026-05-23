# SITTA UT — Tugas Praktik 2 Vue.js

Aplikasi web pemesanan dan distribusi bahan ajar Universitas Terbuka, dibangun
dengan **Vue 3.5 (Options API, CDN)** sebagai implementasi Tugas Praktik 2
mata kuliah **STSI4209 Pemrograman Berbasis Web**.

> Repository: https://github.com/dzpdev/tugas2-vue-ut

## 🚀 Cara Menjalankan

**Tidak ada build process** — aplikasi pure HTML/CSS/JS dengan Vue 3 dari CDN.

### Opsi 1 — Buka langsung
Klik dua kali `index.html` di file explorer.

### Opsi 2 — Local server (recommended untuk localStorage testing yang konsisten)

```bash
# Python 3
python3 -m http.server 8000

# atau Node.js
npx serve .

# atau PHP
php -S localhost:8000
```

Lalu buka `http://localhost:8000/index.html`.

**Flow pertama kali:**
1. `index.html` adalah halaman **Login**. Klik chip demo account di bawah form
   (mis. `admin@ut.ac.id`) untuk auto-fill credentials → klik Login.
2. Setelah login, otomatis ke `dashboard.html` (KPI cards) → silakan navigate
   ke Stok / Tracking via sidebar.

## 📁 Struktur Folder

```
tugas2-vue-ut/
├─ index.html              ← Login page (mock auth)
├─ dashboard.html          ← Beranda (KPI dashboard reaktif)
├─ stok.html               ← Halaman 1: Stok Bahan Ajar (WAJIB)
├─ tracking.html           ← Halaman 2: Tracking DO (WAJIB)
├─ css/
│  └─ style.css            ← Styling (extended dari Tugas 1)
├─ js/
│  ├─ dataBahanAjar.js     ← Seed data (window.SEED_DATA)
│  ├─ shared.js            ← Utility + Domain rules + AUTH helpers
│  ├─ login-app.js         ← Vue app: login + 2 modal
│  ├─ dashboard-app.js     ← Vue app: KPI dashboard
│  ├─ stok-app.js          ← Vue app: stok CRUD
│  └─ tracking-app.js      ← Vue app: tracking + DO
├─ assets/
│  └─ logo-ut.png
├─ README.md               ← File ini
└─ .gitignore
```

## 🛠️ Tech Stack

- **Vue 3.5.34** via CDN — Options API, multi-app pattern (1 app per page)
- **DOMPurify 3.4.2** via CDN — sanitize `v-html` untuk `catatanHTML`
- **localStorage** untuk persistensi:
  - `sitta-auth-v2` — auth session (cleared on Logout)
  - `sitta-stok-v2` — stok bahan ajar
  - `sitta-tracking-v2` — tracking DO
- **Vanilla CSS** — extended dari Tugas 1, tambah class baru (toast, badge,
  empty-state, modal-transition, row-flash, status-bars, demo-account-chip,
  role-* variants)
- **Mock client-side auth** — `DEMO_ACCOUNTS` hard-coded di `shared.js`,
  NO backend, NO real PII transmission. Coursework only.

## 🔐 Demo Accounts

Klik chip akun di login page untuk auto-fill credentials:

| Email | Password | Role | UPBJJ |
|-------|----------|------|-------|
| `admin@ut.ac.id` | `admin123` | Administrator | — |
| `siti@ut.ac.id` | `siti123` | Puslaba | — |
| `doni@ut.ac.id` | `doni123` | Fakultas | — |
| `rina@ut.ac.id` | `rina123` | UPBJJ Jakarta | Jakarta |
| `agus@ut.ac.id` | `agus123` | UPBJJ Makassar | Makassar |

> Role di-display di topbar dengan badge berwarna, TIDAK enforce access
> restriction (semua role bisa akses semua fitur — mirror Tugas 1).

## ✨ Fitur Utama

### 🔐 Login (`index.html`)
- Form login: email + password dengan toggle show/hide (👁/🙈)
- **Validation**: on-blur per field + on-submit semua. Format email regex,
  password min 6 char.
- **Generic error**: "Email atau password salah" (no leak which field wrong,
  per OWASP best practice)
- **Demo accounts hint card** dengan chip auto-fill (klik = auto-isi form)
- **Modal Lupa Password**: validate email exists → toast mock
- **Modal Daftar Akun**: 4-field cross-validation (password match), toast mock
- **isSubmitting state lock** — disable submit button + "Memproses..." label
- **900ms delay** sebelum redirect supaya toast success terlihat
- **Auth gate**: kalau sudah login, langsung redirect ke `dashboard.html`

### 🏠 Beranda (`dashboard.html`)
- Topbar dengan greeting + nama user + role badge berwarna + tombol Logout
- 4 KPI cards reaktif: Total Stok, Total Bahan Ajar, Stok Kritis (warna
  warning kalau >0), DO Aktif
- Distribusi status stok dengan animated progress bars
- Quick Actions (link ke Stok dan Tracking)
- Greeting by hour (Pagi/Siang/Sore/Malam)
- Multi-tab sync indicator

### 📚 Stok Bahan Ajar (`stok.html`)
- **Display**: 11 kolom termasuk status badge 3-cabang (✅ Aman / ⚠️ Menipis
  / ⛔ Kosong) + catatan dengan v-html (DOMPurify whitelist)
- **Filter**:
  - UPBJJ → dependent filter Kategori (muncul setelah UPBJJ dipilih)
  - Checkbox "Hanya perlu re-order" (qty < safety atau qty = 0)
  - Search bebas teks (debounce 300ms)
- **Sort**: 5 opsi (judul A-Z, qty asc/desc, harga asc/desc)
- **CRUD**: Tambah (modal 8 field), Edit (kode locked), Hapus (modal konfirmasi)
- **Live preview status badge** di modal saat ubah qty
- **Reset Filter / Reset Data**
- **Toast notif** + row flash highlight
- **Empty state** friendly

### 🚚 Tracking DO (`tracking.html`)
- **Form Buat DO Baru** (7 field):
  - Nomor DO auto-generated (`DO{tahun}-{NNN}`, reset per tahun)
  - NIM (9 digit), Nama, Ekspedisi (JNE Regular/Express), UPBJJ Asal
  - Paket Bahan Ajar dengan **detail isi paket** dependent (qty per UPBJJ asal)
  - Tanggal Kirim (default today, validasi tidak boleh masa lalu)
  - Total Harga auto-fill
- **Submit DO**: pre-flight atomicity check + decrement stok di UPBJJ asal
- **Histori DO**: tabel dengan search by nomor/NIM, klik row → expand timeline
- **Update Status DO**: modal dengan dependent next statuses (state machine
  linear + cabang Dibatalkan), keterangan dengan suggestion chip + char counter

### 🌐 Cross-cutting
- **Multi-tab sync**: edit di tab A → tab B auto-refresh + toast info.
  Logout di tab A → tab B auto-redirect ke login.
- **Auth gate** semua halaman dengan inline head guard (FOUC-free via
  `visibility:hidden` backup)
- **Locale Indonesia**: format Rupiah (`Rp 130.000`) + tanggal (`25 Agustus 2025`)
- **Mobile responsive**: hamburger menu, breakpoint 480/768/1024
- **Accessibility**: ARIA labels, role/aria-modal di dialog, focus management,
  `prefers-reduced-motion` support

## 📋 Mapping Rubrik Penilaian

| Poin | Item | Implementasi |
|------|------|--------------|
| **1.1** Arsitektur (5pt) | Struktur file Vue.js | Multi-page, 4 Vue app independent (login/dashboard/stok/tracking), struktur folder sesuai PDF + `shared.js` (utility + Domain + AUTH) |
| **1.2** Data binding & directive (20pt) | Mustaches/v-text/v-html + list rendering | Mustaches puluhan, `v-text` di kolom judul, `v-html` + DOMPurify untuk catatan, `v-bind` (:class/:disabled/:value/:readonly/:aria-pressed/:aria-busy/:aria-label dinamis), `v-model` di **19+ form input** (login 2, Lupa 1, Daftar 4, stok form 8, stok filter 4, DO form 6, Update Status 2), `v-for` di tabel/dropdown/timeline/demo-chips |
| **1.3** Conditional (10pt) | v-if/else-if/else/show | Status badge 3-cabang, dependent filter Kategori, error message per field, modal show/hide (4 modal!), paket detail, empty state, `v-show` tabel, toggle password show/hide, loginError generic display |
| **1.4** Property — computed/methods (10pt) | Computed & methods | 12+ computed (filteredSortedStok, sanitizedStok, stokStats, isFormValid, nextDoNumber, selectedPaket, selectedPaketDetail, stokTidakTersedia, canSubmitDO, filteredTracking, currentUser, totalStokFormatted) + methods (validateField, statusOf, decrementStokForPaket, submitLogin, openLupa, logout, safeBadge, ...) |
| **1.5** Watchers — min 2 (10pt) | Watcher | 6 total: searchQuery debounce 300ms (stok), searchDoQuery debounce (tracking), filterUpbjj cascade reset, formDO.upbjjAsal re-validate, deep stok+tracking via factory pattern (storage sync) |
| **1.6** Form & validasi (20pt) | Input + validation | **6 form**: Login (2 field + generic error), Lupa Password (1 field + emailExists check), Daftar Akun (4 field + cross-validation match), Tambah/Edit Stok (8 field + regex + length + unique + cross-field UPBJJ uniqueness), DO baru (6 field + cross-field stok availability), Update Status (2 field + dependent statusBaru). Validation on-blur per field + on-submit semua. isSubmitting locks. |
| **1.7** Kreativitas UI (10pt) | UX & polish | Status badge berwarna + emoji, toast slide-in animation (3 type), modal transition (cubic-bezier 250ms), row flash highlight (keyframes 1500ms), locale Indonesia (Rupiah + tanggal), multi-tab sync notification + auto-redirect, suggestion chip update status, empty state friendly, sidebar active state, mobile responsive, reduce-motion support, **role badge berwarna per role (5 variants)**, **demo account chip auto-fill UX**, **900ms toast delay sebelum redirect** |

## 🔒 Catatan Keamanan & Privasi

- **Mock client-side auth**: `DEMO_ACCOUNTS` hard-coded di `shared.js` dengan
  plain-text password adalah pilihan eksplisit untuk coursework. Demo hint card
  di login page juga tampilkan semua password — fully transparent untuk grading.
  **JANGAN diadopsi di production app.** Tidak ada hashing, tidak ada session
  expiry, tidak ada CSRF, tidak ada rate limiting — N/A untuk mock auth tanpa
  backend.
- **NIM dummy synthetic**: semua NIM di seed data dan saat demo adalah dummy
  synthetic 9-digit, BUKAN NIM mahasiswa nyata. Sesuai UU PDP 27/2022.
- **`v-html` sanitization**: pakai DOMPurify dengan whitelist tegas:
  ```js
  ALLOWED_TAGS: ['em', 'strong', 'u', 'b', 'i', 'br'],
  ALLOWED_ATTR: []
  ```
  Default DOMPurify masih allow `<a href="javascript:...">`, `<img onerror>`,
  dan tag risiko lain. Whitelist eksplisit lebih aman.
- **Auth gate via inline head script** + `visibility:hidden` backup — sync
  execution sebelum body render, zero FOUC kalau localStorage check fail.
  Auth state plain JSON di localStorage `sitta-auth-v2` — readable by any
  same-origin script (mock auth context: N/A).
- **localStorage local-only**: tidak ada transmisi data ke server. Aplikasi
  100% client-side.
- **Redirect targets hard-coded literal**: `window.location.replace('index.html')`
  dan `'dashboard.html'` — JANGAN baca dari auth/session object (preventive
  rule untuk hindari open-redirect future).

## 🧪 Smoke Test (5 menit)

Sebelum demo/recording, jalankan flow ini untuk verify semua fitur:

### Login flow
1. **Buka `index.html`** → login form dengan 5 demo account chips
2. **Toggle 👁** → password show/hide
3. **Submit kosong** → error per field
4. **Submit valid email + wrong password** → "Email atau password salah" generic
5. **Klik chip `admin@ut.ac.id`** → auto-fill → klik Login → tombol "Memproses..."
   → toast "Selamat datang, Admin SITTA!" → delay 900ms → redirect dashboard
6. **Buka modal Lupa Password** → email tidak terdaftar → error; email terdaftar → toast + close
7. **Buka modal Daftar** → 4 field; password mismatch → error; valid → toast + close

### Dashboard + Stok flow (sudah login)
8. **Dashboard tampil** → topbar dengan nama user + badge merah "Administrator" + tombol Logout
9. **4 KPI cards** dengan angka real dari SEED
10. Klik Quick Action **"Kelola Stok"** → tabel ~19 stok dengan status badge
11. **Filter UPBJJ "Jakarta"** → tabel ter-filter, dropdown Kategori muncul
12. **Search "EKMA"** → tabel update setelah ~300ms debounce
13. Klik **+ Tambah Stok** → modal terbuka. Submit kosong → semua field error
14. Isi field valid → Submit → toast hijau + row baru flash kuning
15. Klik **Edit** row → modal terbuka, field kode disabled
16. Ubah qty → live preview status badge update real-time
17. Klik **Hapus** → modal konfirmasi custom

### Tracking + Logout flow
18. Klik **Tracking DO** → form DO baru dengan nomor auto-generated
19. Pilih paket + UPBJJ asal → detail isi paket muncul dengan qty tersedia
20. Submit valid → toast + qty stok berkurang
21. Klik row DO existing → timeline expand
22. **Update Status** DO "Baru Dibuat" → modal dengan opsi
23. Pilih + isi keterangan + Submit → status badge update
24. **Refresh browser** → semua perubahan persistent (data + auth)
25. **Klik Logout** → redirect ke index.html, localStorage `sitta-auth-v2` cleared

## 🌐 Multi-tab Demo (bonus)

### Stok sync
1. Buka `stok.html` di Tab A
2. Buka `tracking.html` di Tab B
3. Di Tab B: submit DO baru
4. **Tab A AUTO-UPDATE**: qty stok berkurang + toast "Data ter-update dari tab lain"

### Auth sync
1. Buka `dashboard.html` di Tab A (sudah login)
2. Buka `stok.html` di Tab B (sudah login)
3. Di Tab A: klik Logout
4. **Tab B AUTO-REDIRECT** ke `index.html` (login page) dalam <1 detik

## 📚 Referensi

- Vue 3 Application Guide: https://vuejs.org/guide/essentials/application.html
- Vue 3.5 Release: https://blog.vuejs.org/posts/vue-3-5
- DOMPurify: https://github.com/cure53/DOMPurify
- OWASP Authentication Cheat Sheet (untuk generic error message pattern):
  https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- web.dev — Sign-in form best practices:
  https://web.dev/articles/sign-in-form-best-practices
- Sufandi et al. (2021). Evaluasi UI prototype SITTA. JANAPATI 10(3).
- Sufandi (2022). Analisis Kebutuhan SITTA. JANAPATI 11(2).

## 👤 Identitas Mahasiswa

- **Nama:** Diaz Permana
- **GitHub:** [@dzpdev](https://github.com/dzpdev)
- **Mata Kuliah:** STSI4209 Pemrograman Berbasis Web
- **Tugas:** Praktik 2

---

🤖 _Aplikasi ini dibuat dengan bantuan AI pair programming (Claude Code) untuk
exploration, planning (7500+ baris docs di `docs/plans/`), dan refactoring.
Implementasi final, testing, dan video penjelasan adalah tanggung jawab penuh
mahasiswa._
