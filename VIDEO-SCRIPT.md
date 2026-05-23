# Video Script — SITTA UT Tugas Praktik 2 Vue.js

**Mata kuliah:** STSI4209 Pemrograman Berbasis Web
**Tugas:** Praktik 2
**Durasi target:** 15 menit (cap dari PDF)
**Repository:** https://github.com/dzpdev/tugas2-vue-ut

---

## 📋 Persiapan Sebelum Recording

### Tools
- **Screen recorder:** OBS Studio (free), QuickTime (macOS Cmd+Shift+5), atau Loom
- **Audio:** USB mic atau headset mic — JANGAN built-in laptop (noise + echo)
- **Resolution:** 1920×1080 minimum, 30fps cukup
- **Browser:** Chrome dengan Vue Devtools extension (opsional tapi recommended)
- **Editor:** VS Code dengan font 14-16pt untuk readable code

### Setup Browser
- Window 1: Chrome di sisi kiri (~640×900)
- Window 2: VS Code di sisi kanan (~640×900)
- Atau: full-screen swap pakai `Cmd+Tab`

### State Awal (CRITICAL — lakukan sebelum recording)
1. Buka Devtools console di Chrome
2. Jalankan: `localStorage.clear()` → app load dari SEED fresh
3. Refresh tab — pastikan landing di login page (`index.html`)
4. Tutup tab/window lain yang tidak perlu
5. Silent mode: matikan notification macOS, close Slack/email
6. Test audio 30 detik recording → playback verify

### Buffer Strategy
- Kalau over budget di Segment 4 atau 5, potong Segment 7 ke 1:00 (skip multi-tab demo bonus)
- Multi-tab demo nice-to-have, bukan rubric requirement
- Penutup (Segment 8) wajib ada — itu mapping rubrik untuk dosen

---

## 🎬 Script — 8 Segments (Total 15:00)

### Segment 1 — Intro (0:00–0:30) [30s]

**🎯 Tujuan:** Identitas + ringkasan aplikasi.

**SHOW:** Login page (`index.html`) full screen di browser.

**SAY:**
> "Halo, perkenalkan saya **[Nama Lengkap]**, NIM **[NIM]**, mahasiswa mata kuliah STSI4209 Pemrograman Berbasis Web. Pada video ini saya akan mendemonstrasikan implementasi **Tugas Praktik 2: aplikasi SITTA Universitas Terbuka berbasis Vue.js**. Aplikasi terdiri dari halaman **login**, dan tiga halaman utama: **dashboard**, **manajemen stok bahan ajar**, dan **tracking delivery order** — semuanya dibangun dengan **Vue 3 melalui CDN** tanpa build tools."

---

### Segment 1.5 — Demo Login Flow (0:30–1:30) [1 menit]

**🎯 Tujuan:** Tunjukkan login validation, modal Lupa/Daftar, demo auto-fill, 900ms toast delay.

**SHOW:** Login page dengan form + 5 demo account chips di bawah.

**Aksi step-by-step:**

| Waktu | Aksi | Narasi singkat |
|-------|------|----------------|
| 0:30 | Tunjukkan form email + password + tombol 👁 | "Form login dengan toggle show/hide password" |
| 0:35 | Klik tombol 👁 → password jadi text | "Demonstrasi `:type` binding dinamis" |
| 0:40 | Klik tombol Login tanpa isi | "Validation on-submit: kedua field error muncul" |
| 0:50 | Ketik `xxx@`, lalu blur dari field | "Validation on-blur per field: format email invalid" |
| 0:55 | Hapus, klik chip `admin@ut.ac.id` → form auto-fill, klik Login dengan password salah | "Submit dengan password salah: error generic *'Email atau password salah'* — sesuai OWASP best practice, no leak field mana yang salah" |
| 1:05 | Klik chip lagi → auto-fill correct → klik Login | "Tombol jadi *'Memproses...'* (isSubmitting lock), toast hijau tampil" |
| 1:15 | Tunggu ~1 detik | "Delay 900ms agar toast terlihat sebelum redirect" |
| 1:20 | Redirect otomatis ke `dashboard.html` | "Sekarang sudah masuk dashboard" |

**SAY (sambil aksi):**
> "Saya pakai mock auth client-side — 5 akun demo hard-coded di `shared.js`. Validation on-blur dan on-submit per field. Generic error 'Email atau password salah' mengikuti OWASP — tidak boleh leak field mana yang salah karena bisa dipakai untuk account enumeration. Yang penting: setelah login berhasil, ada delay 900 milidetik sebelum redirect — kalau tidak, `window.location.replace` langsung kill page dan toast tidak terlihat. Saya juga disable tombol submit selama transisi untuk cegah double-submit."

> **Quick demo Lupa Password (opsional, kalau sempat):** klik link "Lupa Password?" → modal terbuka, input email valid → tampil toast mock, close.

---

### Segment 2 — Demo End-to-End (1:30–3:00) [1.5 menit]

**🎯 Tujuan:** Tour fitur stok + tracking dari perspektif user.

**SHOW:** `dashboard.html` (sudah login).

**Aksi step-by-step:**

| Waktu | Aksi | Narasi singkat |
|-------|------|----------------|
| 1:30 | Tunjuk topbar | "Greeting + nama user + badge merah Administrator + tombol Logout" |
| 1:35 | Tunjuk 4 KPI cards | "Total Stok, Total Bahan Ajar, Stok Kritis warning kuning, DO Aktif — semua reaktif dari data localStorage" |
| 1:45 | Klik Quick Action **"Kelola Stok"** → `stok.html` | "Sidebar nav highlighted ke Stok (active state)" |
| 1:55 | Pilih filter **UPBJJ "Jakarta"** | "Tabel ter-filter. Dependent filter Kategori MUNCUL otomatis di sebelahnya" |
| 2:05 | Pilih **Kategori "MK Wajib"** → tabel makin sempit | "Filter cascading bekerja" |
| 2:15 | Ketik **"EKMA"** di search | "Tunggu ~300ms — debounce visible sebelum tabel update" |
| 2:25 | Klik **"+ Tambah Stok"** | "Modal terbuka. Form 8 field" |
| 2:30 | Submit kosong | "Semua field error sekaligus on-submit" |
| 2:35 | Isi field valid, submit | "Toast hijau 'berhasil ditambahkan', row baru flash kuning ~1.5 detik" |
| 2:45 | Klik **Edit** di salah satu row | "Modal terbuka, field kode disabled (read-only saat edit)" |
| 2:50 | Klik **Hapus** di row | "Modal konfirmasi custom (bukan native confirm), dengan warning kalau kode ada di paket" |

**SAY:**
> "Ini alur akhir-ke-akhir: auth gate protect semua halaman, role badge per user, filter dependent, search dengan debounce 300ms, CRUD lengkap dengan validasi. Sekarang masuk ke struktur kode dan implementasi Vue.js-nya."

---

### Segment 3 — Struktur Folder & Vue Setup (3:00–4:00) [1 menit]

**🎯 Tujuan:** Tunjukkan arsitektur project (Rubrik 1.1).

**SHOW:** VS Code, project explorer expanded.

**Tampilkan struktur:**

```
tugas2-vue-ut/
├─ index.html              ← Login page (mock auth)
├─ dashboard.html          ← KPI dashboard
├─ stok.html               ← Stok Bahan Ajar (WAJIB)
├─ tracking.html           ← Tracking DO (WAJIB)
├─ css/
│  └─ style.css            ← Styling
├─ js/
│  ├─ dataBahanAjar.js     ← window.SEED_DATA (19 stok + 4 paket + 4 tracking)
│  ├─ shared.js            ← Utility + Domain rules + AUTH helpers
│  ├─ login-app.js         ← Vue app: login + 2 modal
│  ├─ dashboard-app.js     ← Vue app: KPI
│  ├─ stok-app.js          ← Vue app: stok CRUD
│  └─ tracking-app.js      ← Vue app: tracking + DO
└─ assets/logo-ut.png
```

**SAY:**
> "Struktur folder mengikuti saran PDF dosen, dengan satu tambahan `shared.js` untuk utility yang dipakai semua app. Saya pakai **Vue 3.5.34 dengan Options API via CDN** — pin versi exact untuk reproducibility, tidak ada build process. Tiap halaman load tiga script terpisah: `dataBahanAjar.js` untuk seed data, `shared.js` untuk utility, dan app-specific untuk logic per halaman. Plus **DOMPurify** untuk sanitize `v-html`."

**SHOW:** Buka `dataBahanAjar.js`, scroll cepat.

> "Lampiran dari dosen pakai sintaks `new Vue({...})` yaitu Vue 2. Saya refactor jadi `window.SEED_DATA = {...}` plain object supaya kompatibel Vue 3. Saya juga tambah UPBJJ Yogyakarta, update pengirimanList jadi JNE-REG dan JNE-EXP sesuai PDF."

**SHOW:** Buka `stok.html`, scroll ke `<script>` tags di bawah `</body>`.

> "Urutan load script: Vue + DOMPurify dari CDN, lalu dataBahanAjar, shared, dan stok-app."

---

### Segment 4 — stok-app.js Walkthrough (4:00–7:00) [3 menit]

**🎯 Tujuan:** Demo data/computed/methods/watch (Rubrik 1.2, 1.4, 1.5).

**SHOW:** Buka `js/stok-app.js`.

#### 4:00–4:30 — data()

**SHOW:** Scroll ke `data()` section, highlight key fields.

```js
data() {
  return {
    stok: [],
    filterUpbjj: '', filterKategori: '', filterPerluReorder: false,
    sortBy: '', searchQuery: '', searchQueryDebounced: '',
    formStok: { kode, judul, kategori, upbjj, lokasiRak, qty, safety, harga, catatanHTML },
    modalForm: { open, mode },  // 'add' | 'edit'
    errors: {}, touched: {},
    modalDelete: { open, item },
    toast: { message, type, visible },
    recentlyChangedKode: null,
    // ...
  }
}
```

**SAY:**
> "Semua state reaktif app di `data()`. Notice `searchQuery` dan `searchQueryDebounced` — dua reactive ref untuk debounce pattern. `modalForm` punya field `mode` 'add' atau 'edit' — satu modal, dua kegunaan."

#### 4:30–5:30 — computed (Rubrik 1.4)

**SHOW:** Scroll ke `computed` block.

```js
computed: {
  filteredSortedStok() { /* chain 4 filter + sort */ },
  availableKategori() { /* dependent options dari filterUpbjj */ },
  sanitizedStok() { /* memoize safeSanitize untuk perf */ },
  stokStats() { /* filtered/total/totalUnit */ },
  isFormValid() { /* untuk disable Submit */ },
  formStokPreview() { /* live preview status badge di modal */ },
  currentUser() { return getAuth(); }
}
```

**SAY:**
> "PDF dosen minta: *'di semua filter tidak perlu recompute kembali'*. Saya implement dengan **computed property** — Vue auto-cache hasil berdasarkan reactive dependencies. Kalau filter UPBJJ tidak berubah, hasil filter tidak dihitung ulang. Plus **`sanitizedStok` memoization** — penting karena DOMPurify mahal per render kalau dipanggil 20× per tabel update. Pattern ini hindari jank di low-end devices."

#### 5:30–6:15 — watch (Rubrik 1.5 — min 2 watcher)

**SHOW:** Scroll ke `watch` block.

```js
watch: {
  searchQuery(newVal) {  // 1. Debounce 300ms
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.searchQueryDebounced = newVal;
    }, 300);
  },
  filterUpbjj() {  // 2. Cascade reset
    this.filterKategori = '';
  }
  // 3-4. stok deep watcher + storage event listener handled by stokStore.install()
  //      (createStorageSyncedRef factory pattern di shared.js)
}
```

**SAY:**
> "Rubrik minimal 2 watcher — saya pakai **6 watcher total** di app ini, plus 6+ di tracking-app. Yang paling kuat: **dependent options pattern** di mana watch `filterUpbjj` reset `filterKategori` otomatis. Plus **debounce 300ms** di search supaya filter tidak re-compute setiap keystroke. Untuk localStorage save, saya pakai factory pattern `createStorageSyncedRef` di shared.js — bind handler via closure supaya `addEventListener` dan `removeEventListener` reference identik (cegah silent leak)."

#### 6:15–7:00 — methods + Validation

**SHOW:** Scroll ke `methods`, highlight `validateField`.

```js
validateField(name, showError = true) {
  switch(name) {
    case 'kode':
      if (!v) err = 'Kode wajib diisi';
      else if (v.length < 4) err = 'Min 4 karakter';
      else if (!/^[A-Z0-9]+$/.test(v)) err = 'Hanya huruf kapital & angka';
      else if (mode === 'add' && stok.some(s => s.kode === v && s.upbjj === ...)) {
        err = `Kode "${v}" sudah ada di UPBJJ ${upbjj}`;
      }
      break;
    // ... 7 field lain
  }
}
```

**SAY:**
> "Validation per field dengan regex (kode format `[A-Z0-9]+`, lokasiRak format `R\d+-[A-Z]\d+`), length check, dan **cross-field uniqueness** — kode wajib unique per UPBJJ. Pakai **touched map** — error tidak tampil sebelum field di-blur pertama kali, hindari 'all red on first load' anti-pattern."

---

### Segment 5 — tracking-app.js Walkthrough (7:00–9:30) [2.5 menit]

**🎯 Tujuan:** Auto-nomor DO, dependent paket detail, atomicity stok decrement, status workflow.

**SHOW:** Buka `js/tracking-app.js`.

#### 7:00–7:30 — Auto-generate Nomor DO

**SHOW:** Method `nextDoNumber` computed.

```js
nextDoNumber() {
  return Domain.generateDoNumber(this.tracking);
}
// Di shared.js Domain.generateDoNumber:
generateDoNumber(tracking, year = new Date().getFullYear()) {
  const prefix = `DO${year}-`;
  const seqs = Object.keys(tracking).filter(k => k.startsWith(prefix))
    .map(k => parseInt(k.slice(prefix.length), 10));
  const next = seqs.length ? Math.max(...seqs) + 1 : 1;
  return prefix + String(next).padStart(3, '0');
}
```

**SAY:**
> "Nomor DO auto-generate format `DO + tahun + sequence 3-digit`. Sequence **reset per tahun** — kalau ini Januari 2027, sequence kembali ke 001."

#### 7:30–8:15 — Form DO Modal + Dependent Detail

**SHOW:** Browser, klik tombol **"📦 Buat DO Baru"** di tracking.html → modal terbuka.

> "Tombol biru buka modal form DO. Form punya 7 field plus Total auto-fill."

**Aksi:** Pilih **paket** "PAKET-UT-001". → Tidak ada detail.

> "Pilih paket — tapi detail isi belum muncul karena belum pilih UPBJJ asal."

**Aksi:** Pilih **UPBJJ asal "Jakarta"** → detail isi paket muncul dengan qty per item.

> "Setelah UPBJJ dipilih, detail muncul: untuk tiap kode di paket, tampil judul + qty tersedia di Jakarta. Highlight merah kalau tidak tersedia."

**SHOW:** Computed `selectedPaketDetail` di code.

> "Computed `selectedPaketDetail` depend on `selectedPaket` DAN `formDO.upbjjAsal`. Saya pakai **count grouping** supaya kalau paket punya duplicate kode (mis. 2× EKMA4116), bisa di-decrement benar."

#### 8:15–9:00 — Submit DO + Decrement Stok (Atomicity)

**SHOW:** Method `decrementStokForPaket`.

```js
decrementStokForPaket(paketIsi, upbjjAsal) {
  // Re-load fresh stok dari localStorage (capture multi-tab updates)
  const fresh = loadFromStorage('sitta-stok-v2');
  if (fresh) this.stok = fresh;

  // Pre-flight: verify SEMUA item available SEBELUM mutasi
  const targets = [];
  for (const [kode, n] of Object.entries(counts)) {
    const idx = this.stok.findIndex(s => s.kode === kode && s.upbjj === upbjjAsal);
    if (idx === -1) return { ok: false, error: `Stok ${kode} tidak ada` };
    if (this.stok[idx].qty < n) return { ok: false, error: `Stok tidak cukup` };
    targets.push({ idx, n });
  }

  // Phase 2: apply mutations (aman karena pre-flight pass)
  targets.forEach(({ idx, n }) => { this.stok[idx].qty -= n; });
  saveToStorage('sitta-stok-v2', this.stok);
  return { ok: true };
}
```

**SAY:**
> "Submit DO mengurangi stok di UPBJJ asal. Saya pakai **atomicity pattern** — Pre-flight check dulu: verifikasi SEMUA item bisa di-decrement. Kalau ada satu yang gagal, **tidak ada mutation apapun**. Cegah partial-decrement state."

**SHOW:** Browser — submit DO valid → toast + qty stok berkurang di Stok page (refresh untuk verify).

#### 9:00–9:30 — Update Status Workflow

**SHOW:** Browser — klik **Update Status** di DO "Baru Dibuat".

> "Modal Update Status — opsi status baru **dependent** dari status saat ini. State machine: Baru Dibuat → Persiapan → Perjalanan → Diterima, plus cabang Dibatalkan dari awal."

**SHOW:** `Domain.STATUS_FLOW` di shared.js.

```js
const STATUS_FLOW = {
  'Baru Dibuat':       ['Dalam Persiapan', 'Dibatalkan'],
  'Dalam Persiapan':   ['Dalam Perjalanan', 'Dibatalkan'],
  'Dalam Perjalanan':  ['Diterima'],
  'Diterima':          [],   // final
  'Dibatalkan':        []    // final
};
```

> "Status final disable tombol Update otomatis. Plus **suggestion chip** — klik chip → keterangan auto-fill dengan template per status."

---

### Segment 6 — Directives Showcase (9:30–11:00) [1.5 menit]

**🎯 Tujuan:** Tunjukkan eksplisit semua directive yang diminta rubrik 1.2 dan 1.3.

**SHOW:** Buka `stok.html` template.

#### 9:30–10:00 — Mustaches, v-text, v-html (Rubrik 1.2)

**SHOW:** Highlight di template:
```html
<td>{{ item.kode }}</td>                           <!-- mustaches -->
<td><span v-text="item.judul"></span></td>          <!-- v-text -->
<td><span v-html="item.catatanSafe"></span></td>    <!-- v-html -->
```

**SAY:**
> "**Mustaches** dipakai di puluhan tempat. **v-text** eksplisit di kolom judul untuk demo. **v-html** untuk catatan yang berisi format inline seperti `<em>` dan `<strong>` — TAPI saya wrap dengan **DOMPurify whitelist tegas**:"

**SHOW:** Buka `shared.js`, highlight `SANITIZE_CONFIG`.

```js
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['em', 'strong', 'u', 'b', 'i', 'br'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  ALLOW_DATA_ATTR: false
};
```

> "Default DOMPurify masih allow tag berisiko seperti `<a href=javascript:>` dan `<img onerror>`. Explicit whitelist hanya allow inline emphasis — jauh lebih aman."

#### 10:00–10:30 — Conditional (Rubrik 1.3)

**SHOW:** Status badge dengan v-if/v-else-if/v-else:
```html
<span :class="['badge', statusOf(item).kelas]">
  <span v-if="statusOf(item).label === 'Aman'">✅</span>
  <span v-else-if="statusOf(item).label === 'Menipis'">⚠️</span>
  <span v-else>⛔</span>
  {{ statusOf(item).label }}
</span>
```

**SAY:**
> "Conditional dipakai di banyak tempat: status badge 3-cabang pakai if/else-if/else, dependent filter Kategori muncul setelah UPBJJ dipilih, error message per field, modal show/hide, empty state, dan `v-show` untuk hide tabel."

#### 10:30–11:00 — Data Binding (Rubrik 1.2 lanjut)

**SHOW:** Form field dengan v-model + tombol dengan v-bind:
```html
<input v-model="formStok.kode"
       :readonly="modalForm.mode === 'edit'"
       :class="{ readonly: modalForm.mode === 'edit' }" />

<button :disabled="!isFormValid" type="submit">Simpan</button>
```

**SAY:**
> "**v-model** two-way binding di semua form input — total 19+ field di seluruh app. **v-bind shorthand** untuk class binding, disabled state, readonly, plus aria-pressed dan aria-label dinamis di tombol toggle password."

---

### Segment 7 — Polish & Multi-tab Demo (11:00–13:00) [2 menit]

**🎯 Tujuan:** Kreativitas UI + multi-tab sync (Rubrik 1.7).

#### 11:00–11:30 — Toast + Modal Animation + Row Flash

**SHOW:** Browser — tambah stok baru.

> "Toast slide-in dari kanan, row baru flash kuning 1.5 detik, modal pakai transition fade + slide-up 250ms cubic-bezier."

**SHOW (cepat):** style.css — keyframes rowFlash.

#### 11:30–12:15 — Multi-tab Sync (HIGHLIGHT)

**Aksi:** Buka 2 tab side-by-side:
- Tab A (kiri): `stok.html`, filter UPBJJ Jakarta, lihat qty EKMA4116
- Tab B (kanan): `tracking.html`, buka modal Buat DO Baru

**Aksi:**
1. Tab B: pilih paket PAKET-UT-001, UPBJJ asal Jakarta, NIM `041234567`, Nama `Demo`, ekspedisi JNE-REG, tanggal hari ini
2. Klik **Buat DO**
3. Tab B: toast "DO DO2026-00X berhasil dibuat", modal close
4. **Tab A AUTO-UPDATE**: qty EKMA4116 + EKMA4115 berkurang, toast "Data ter-update dari tab lain"

**SAY:**
> "Multi-tab sync via **storage event**. Saat satu tab save ke localStorage, tab lain dengan key sama receive event dan auto-reload data. Notice toast di tab kiri muncul tanpa refresh manual. Plus saya pakai **value comparison dedup** (bukan flag pattern) — cegah feedback loop tanpa race condition."

#### 12:15–13:00 — Empty State + Auth Sync

**Aksi:** Filter UPBJJ Padang + Kategori MK Pilihan → 0 hasil → empty state friendly + tombol Reset Filter.

**Aksi:** Buka 2 tab dashboard, klik Logout di tab A → tab B auto-redirect ke login dalam <1 detik.

> "Multi-tab logout: clear auth di tab A → storage event → tab B redirect ke login. Cross-tab UX yang konsisten."

---

### Segment 8 — Penutup & Rubric Mapping (13:00–15:00) [2 menit]

**🎯 Tujuan:** Recap pemenuhan rubrik 1.1–1.7 dengan referensi konkret.

**SHOW:** Bisa pakai split-screen: kiri browser, kanan README.md di VS Code (scroll ke "Mapping Rubrik Penilaian" table).

**SAY (clear & confident, baca dengan tempo wajar):**

> "Singkatnya, mapping ke rubrik penilaian:
>
> - **Poin 1.1 — Arsitektur (5 poin):** Multi-page Vue 3, **4 Vue app** independent (login, dashboard, stok, tracking), struktur folder sesuai PDF dosen ditambah `shared.js` untuk utility shared.
>
> - **Poin 1.2 — Data binding & directive (20 poin):** Mustaches puluhan tempat, **v-text** di kolom judul, **v-html dengan DOMPurify whitelist** untuk catatan, **v-bind** untuk class/disabled/aria-pressed dinamis, **v-model di 19+ form input**, **v-for** di tabel, dropdown, timeline, dan demo chips.
>
> - **Poin 1.3 — Conditional (10 poin):** Status badge 3-cabang dengan **v-if/v-else-if/v-else**, dependent filter Kategori, error message per field, **4 modal** dengan show/hide, paket detail, empty state, **v-show** untuk tabel.
>
> - **Poin 1.4 — Property — computed/methods (10 poin):** **12+ computed** termasuk `filteredSortedStok` yang chain 4 filter dengan sort, `nextDoNumber`, `selectedPaketDetail`, `stokTidakTersedia`, `currentUser`. Plus methods seperti `validateField`, `decrementStokForPaket`, `safeBadge`.
>
> - **Poin 1.5 — Watchers (10 poin):** Rubrik minimal 2, saya pakai **6 watcher total** — debounce 300ms search, cascade reset filter Kategori saat UPBJJ berubah, formDO.upbjjAsal re-validate, dan deep stok+tracking via factory pattern untuk localStorage sync.
>
> - **Poin 1.6 — Form & validasi (20 poin):** **6 form total**: Login, Lupa Password, Daftar Akun, Tambah/Edit Stok, Buat DO Baru, Update Status. Validation **on-blur per field + on-submit** semua. Regex untuk kode + NIM, cross-field check (konfirmasi password, kode unique per UPBJJ, stok availability), isSubmitting lock cegah double-submit.
>
> - **Poin 1.7 — Kreativitas UI (10 poin):** Reuse CSS Tugas 1 yang sudah polished, status badge berwarna dengan emoji, toast slide-in animation, modal transition cubic-bezier, row flash highlight, **locale Indonesia** untuk Rupiah dan tanggal, **multi-tab sync** dengan auto-redirect saat logout, suggestion chip di update status, **demo account chip auto-fill**, **900ms toast delay** sebelum redirect, role badge berwarna per role, mobile responsive, dan `prefers-reduced-motion` support untuk accessibility.
>
> Semua source code ada di **github.com/dzpdev/tugas2-vue-ut**, plus dokumentasi planning di folder `docs/plans/`. Terima kasih atas perhatiannya."

**SHOW (di-end):** Repository GitHub URL di address bar Chrome, atau closing slide dengan info kontak.

---

## ⏱️ Time Budget Cheatsheet

| # | Segment | Duration | Cumulative |
|---|---------|----------|------------|
| 1 | Intro | 0:30 | 0:30 |
| 1.5 | Demo login flow | 1:00 | 1:30 |
| 2 | Demo end-to-end | 1:30 | 3:00 |
| 3 | Struktur + Vue setup | 1:00 | 4:00 |
| 4 | stok-app.js walkthrough | 3:00 | 7:00 |
| 5 | tracking-app.js walkthrough | 2:30 | 9:30 |
| 6 | Directives showcase | 1:30 | 11:00 |
| 7 | Polish + multi-tab demo | 2:00 | 13:00 |
| 8 | Penutup + rubric mapping | 2:00 | 15:00 |
| **TOTAL** | | **15:00** | |

**Buffer:** kalau over di Segment 4/5, potong Segment 7 ke 1:00 (skip multi-tab demo).

---

## 🎤 Tips Recording

### Voice
- **Pelan & jelas**, jangan terburu-buru
- **Pause 1 detik** antar topik — kasih breathing space untuk listener
- Kalau salah ucap, **JANGAN restart full** — ulang kalimat saja, post-edit cut
- Tone: confident tapi natural (hindari monotone)

### Screen
- Mouse pointer **slow & deliberate** — bukan flicking ke sana ke sini
- Zoom in code (Cmd+Plus di VS Code) saat menjelaskan kode kompleks
- Highlight code dengan cursor selection (drag) untuk fokus visual
- Hindari typing live yang panjang — pakai pre-filled value di field demo

### Cuts
- Cut antar segment kalau perlu — viewer tidak akan tahu
- Trim awal/akhir untuk hapus silence/clearing-throat
- Tidak perlu satu take continuous

---

## ✅ Pre-Recording Checklist

- [ ] `localStorage.clear()` di Devtools console (state fresh)
- [ ] Browser zoom 100%
- [ ] Devtools docked di bawah kalau perlu show console (atau hidden untuk demo bersih)
- [ ] VS Code font size 14-16pt untuk readable
- [ ] Audio test 30 detik playback verify clarity
- [ ] Notification silent mode (macOS Focus / Windows Quiet Hours)
- [ ] Close Slack, email, Discord
- [ ] WiFi stable (CDN Vue + DOMPurify perlu connection)
- [ ] Pre-fill data untuk demo: minimal 1 stok kosong, 1 menipis, beberapa aman
- [ ] Pre-login dengan akun admin untuk dashboard demo

## ✅ Post-Recording Checklist

- [ ] Review playthrough di 1.5× speed untuk catch errors
- [ ] Trim silence/noise di awal & akhir
- [ ] Optional: overlay text di moment penting (mis. "Watcher: filterUpbjj cascade reset")
- [ ] Export 1080p MP4, target file <500MB
- [ ] Upload ke **YouTube unlisted** ATAU Google Drive **shareable link** (anyone with link)
- [ ] Update `README.md` dengan link video di section "👤 Identitas Mahasiswa" atau header

---

## 📎 Submission Template

Saat submit Tugas 2, lampirkan:

1. **Source code ZIP** — `Tugas\ 2\ -\ Pemrograman\ Berbasis\ Web\ -\ [Nama].zip`
   (folder `tugas2-vue-ut/` tanpa `.git/` — opsional include karena bukti history commit)
2. **Link repository GitHub** — https://github.com/dzpdev/tugas2-vue-ut
3. **Link video penjelasan** — YouTube unlisted atau Google Drive shareable
4. **(Opsional) Link folder dokumentasi planning** — `docs/plans/` berisi brainstorm + plan + 12+ supplementary docs

---

*Script ini di-generate berdasarkan plan & implementation final per 2026-05-23. Adjust narasi sesuai gaya bicara sendiri saat recording — jangan baca kata-per-kata, jadikan referensi outline saja.*
