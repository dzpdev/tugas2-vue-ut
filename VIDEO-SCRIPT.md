# Video Script — SITTA UT Tugas Praktik 2 Vue.js

**Mata kuliah:** STSI4209 Pemrograman Berbasis Web
**Tugas:** Praktik 2
**Durasi target:** **13 menit** (cap PDF 15 menit, sisakan 2 menit untuk buffer)
**Repository:** https://github.com/dzpdev/tugas2-vue-ut

---

## 📋 Persiapan Sebelum Recording

### Tools
- **Screen recorder:** OBS Studio (free), QuickTime (macOS Cmd+Shift+5), atau Loom
- **Audio:** USB mic atau headset mic — JANGAN built-in laptop (noise + echo)
- **Resolution:** 1920×1080 minimum, 30fps cukup
- **Browser:** Chrome dengan Vue Devtools extension (opsional)
- **Editor:** VS Code dengan font 14-16pt

### State Awal (CRITICAL — lakukan sebelum recording)
1. Buka Devtools console di Chrome → jalankan `localStorage.clear()`
2. Refresh tab — landing di login page (`index.html`)
3. Tutup tab/window lain yang tidak perlu
4. Silent mode: matikan notification
5. Test audio 30 detik playback verify

### Buffer Strategy
- **2 menit cadangan** dialokasikan untuk: lag, salah ucap, demo glitch, pause natural
- Kalau over budget di Segment 4 atau 5, potong Segment 7 (multi-tab demo bonus)

---

## 🎬 Script — 8 Segments (Total 13:00)

### Segment 1 — Intro (0:00–0:30) [30s]

**SHOW:** Login page (`index.html`) full screen.

**SAY:**
> "Halo, saya **[Nama]**, NIM **[NIM]**, mahasiswa STSI4209 Pemrograman Berbasis Web. Pada video ini saya akan mendemonstrasikan implementasi **Tugas Praktik 2: aplikasi SITTA Universitas Terbuka berbasis Vue 3 via CDN**. Aplikasi terdiri dari halaman login plus tiga halaman utama: dashboard, stok bahan ajar, dan tracking delivery order."

---

### Segment 1.5 — Demo Login Flow (0:30–1:15) [45s]

**SHOW:** Login page dengan form + 5 demo account chips.

**Aksi step-by-step:**

| Waktu | Aksi | Narasi singkat |
|-------|------|----------------|
| 0:30 | Klik tombol 👁 | "Toggle show/hide password — demo `:type` dinamis" |
| 0:35 | Klik Login tanpa isi | "Validation on-submit: error muncul" |
| 0:42 | Klik chip `admin@ut.ac.id` → auto-fill → Login | "Demo chip auto-fill UX. Tombol jadi 'Memproses...', toast tampil, **delay 900ms** sebelum redirect supaya toast terlihat" |
| 1:10 | Landing di dashboard | (lanjut Segment 2) |

**SAY (sambil aksi):**
> "Mock auth client-side, 5 akun demo di `shared.js`. Generic error sesuai OWASP — no leak field mana yang salah. Yang penting: delay 900 milidetik sebelum `window.location.replace`, kalau tidak toast tidak terlihat. Plus `isSubmitting` lock cegah double-submit."

---

### Segment 2 — Demo End-to-End (1:15–2:30) [1:15]

**SHOW:** Dashboard sudah login → navigate ke stok.

**Aksi step-by-step:**

| Waktu | Aksi | Narasi singkat |
|-------|------|----------------|
| 1:15 | Tunjuk topbar | "Greeting + nama user + badge merah Administrator + Logout" |
| 1:20 | Tunjuk 4 KPI cards | "Total Stok, Bahan Ajar, Stok Kritis, DO Aktif — semua reaktif" |
| 1:30 | Klik Quick Action **Kelola Stok** | "Sidebar nav active state Stok highlighted" |
| 1:40 | Pilih filter **UPBJJ Jakarta** | "Dependent filter Kategori MUNCUL otomatis" |
| 1:50 | Search **EKMA** | "Debounce ~300ms sebelum tabel update" |
| 2:00 | Klik **+ Tambah Stok** → submit kosong | "Modal terbuka, semua field error" |
| 2:10 | Isi valid → submit | "Toast hijau + row baru flash kuning" |
| 2:20 | Klik **Edit** → tunjuk kode disabled | "Modal sama, mode edit kode locked" |

**SAY:**
> "Alur akhir-ke-akhir: auth gate protect semua page, role badge per user, filter dependent, search debounce, CRUD lengkap. Sekarang masuk ke kode."

---

### Segment 3 — Struktur Folder & Vue Setup (2:30–3:15) [45s]

**SHOW:** VS Code, project explorer.

```
tugas2-vue-ut/
├─ index.html              ← Login (mock auth)
├─ dashboard.html          ← KPI dashboard
├─ stok.html               ← Stok (WAJIB)
├─ tracking.html           ← Tracking (WAJIB)
├─ css/style.css
├─ js/
│  ├─ dataBahanAjar.js     ← window.SEED_DATA
│  ├─ shared.js            ← Utility + Domain + AUTH
│  ├─ login-app.js
│  ├─ dashboard-app.js
│  ├─ stok-app.js
│  └─ tracking-app.js
└─ assets/logo-ut.png
```

**SAY:**
> "Struktur sesuai PDF dosen plus `shared.js` untuk utility shared. Vue **3.5.34 via CDN** + DOMPurify, **Options API**, pin versi exact. Lampiran dosen pakai `new Vue({...})` Vue 2 — saya refactor jadi `window.SEED_DATA` plain object kompatibel Vue 3. Tambah UPBJJ Yogyakarta dan update pengirimanList jadi JNE-REG/JNE-EXP sesuai PDF."

---

### Segment 4 — stok-app.js Walkthrough (3:15–5:45) [2:30]

**SHOW:** Buka `js/stok-app.js`.

#### 3:15–3:45 — data() + computed (Rubrik 1.4)

**SHOW:** Highlight key state + computed block.

```js
data() { return {
  stok: [], filterUpbjj: '', filterKategori: '',
  searchQuery: '', searchQueryDebounced: '',
  formStok: { /* 8 field */ },
  modalForm: { open, mode: 'add'|'edit' },
  errors: {}, touched: {},
  // ...
}}

computed: {
  filteredSortedStok() { /* chain 4 filter + sort */ },
  availableKategori() { /* dependent dari filterUpbjj */ },
  sanitizedStok() { /* memoize safeSanitize untuk perf */ },
  stokStats() { /* counter toolbar */ },
  isFormValid() { /* disable Submit */ },
  currentUser() { return getAuth(); }
}
```

**SAY:**
> "PDF minta *'di semua filter tidak perlu recompute kembali'* — saya pakai **computed property**, Vue auto-cache berdasarkan reactive dependencies. `sanitizedStok` penting: memoize DOMPurify supaya tidak dipanggil per render — bisa jank di low-end devices."

#### 3:45–4:30 — watch (Rubrik 1.5 — min 2)

**SHOW:** watch block.

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
  // 3-4. stok deep watcher + storage event listener via stokStore.install()
}
```

**SAY:**
> "Rubrik minimal 2 — saya pakai **6 watcher total**. Yang paling kuat: **dependent options** pattern, watch `filterUpbjj` reset `filterKategori` otomatis. Plus debounce 300ms supaya filter tidak re-compute setiap keystroke. Untuk localStorage save, factory pattern `createStorageSyncedRef` di shared.js — closure handler supaya add/removeEventListener reference identik (cegah silent leak)."

#### 4:30–5:45 — methods + Validation (Rubrik 1.6)

**SHOW:** Highlight `validateField` switch.

```js
case 'kode':
  if (!v) err = 'Kode wajib diisi';
  else if (v.length < 4) err = 'Min 4 karakter';
  else if (!/^[A-Z0-9]+$/.test(v)) err = 'Hanya huruf kapital & angka';
  else if (mode === 'add' && stok.some(s => s.kode === v && s.upbjj === ...)) {
    err = `Kode "${v}" sudah ada di UPBJJ ${upbjj}`;
  }
```

**SAY:**
> "Validation per field dengan regex, length check, dan cross-field uniqueness — kode wajib unique per UPBJJ. Pakai **touched map** — error tidak tampil sebelum field di-blur pertama kali."

---

### Segment 5 — tracking-app.js Walkthrough (5:45–8:00) [2:15]

**SHOW:** Buka `js/tracking-app.js`.

#### 5:45–6:15 — Auto-nomor DO + Modal

**SHOW:** Method `nextDoNumber` + buka modal di browser.

```js
nextDoNumber() {
  return Domain.generateDoNumber(this.tracking);
}
```

**SAY:**
> "Nomor DO auto-generate format `DO + tahun + sequence 3-digit`, **reset per tahun**. Saya buat 'Buat DO Baru' jadi modal yang dibuka via tombol — bukan inline form."

**Aksi browser:** Klik **+ Buat DO Baru** → modal terbuka.

#### 6:15–6:45 — Dependent Paket Detail

**Aksi browser:** Pilih paket → tidak ada detail. Pilih UPBJJ asal Jakarta → detail isi paket muncul dengan qty per item.

**SAY:**
> "Detail isi paket muncul **dependent** setelah paket DAN UPBJJ asal dipilih. Untuk tiap kode di paket, tampil judul + qty tersedia di UPBJJ. Item tidak tersedia di-highlight merah."

#### 6:45–7:30 — Atomicity Stok Decrement

**SHOW:** `decrementStokForPaket` di code.

```js
// Pre-flight: verify SEMUA item available SEBELUM mutasi apapun
const targets = [];
for (const [kode, n] of Object.entries(counts)) {
  const idx = this.stok.findIndex(s => s.kode === kode && s.upbjj === upbjjAsal);
  if (idx === -1) return { ok: false, error: '...' };
  if (this.stok[idx].qty < n) return { ok: false, error: '...' };
  targets.push({ idx, n });
}
// Phase 2: apply mutations (aman karena pre-flight pass)
targets.forEach(({ idx, n }) => { this.stok[idx].qty -= n; });
```

**SAY:**
> "Submit DO pakai **atomicity pattern** — pre-flight check verifikasi SEMUA item bisa di-decrement. Kalau ada satu gagal, **tidak ada mutation**. Cegah partial-decrement state."

#### 7:30–8:00 — Status Workflow

**SHOW:** `Domain.STATUS_FLOW` di shared.js.

```js
const STATUS_FLOW = {
  'Baru Dibuat':       ['Dalam Persiapan', 'Dibatalkan'],
  'Dalam Persiapan':   ['Dalam Perjalanan', 'Dibatalkan'],
  'Dalam Perjalanan':  ['Diterima'],
  'Diterima':          [],   // final
  'Dibatalkan':        []
};
```

**SAY:**
> "State machine status: linear plus cabang Dibatalkan. Modal Update Status — opsi status baru **dependent** dari status sekarang. Status final disable tombol Update otomatis."

---

### Segment 6 — Directives Showcase (8:00–9:30) [1:30]

**SHOW:** Buka `stok.html` template.

#### 8:00–8:30 — Mustaches, v-text, v-html

```html
<td>{{ item.kode }}</td>                            <!-- mustaches -->
<td><span v-text="item.judul"></span></td>           <!-- v-text -->
<td><span v-html="item.catatanSafe"></span></td>     <!-- v-html -->
```

**SAY:**
> "Mustaches puluhan tempat, **v-text** eksplisit di kolom judul, **v-html** untuk catatan — tapi wrap dengan **DOMPurify whitelist tegas**."

**SHOW (cepat):** SANITIZE_CONFIG di shared.js.

```js
ALLOWED_TAGS: ['em', 'strong', 'u', 'b', 'i', 'br'],
ALLOWED_ATTR: []
```

> "Default DOMPurify masih allow `<a href=javascript:>` dan `<img onerror>`. Whitelist eksplisit jauh lebih aman."

#### 8:30–9:00 — Conditional (Rubrik 1.3)

```html
<span :class="['badge', statusOf(item).kelas]">
  <span v-if="statusOf(item).label === 'Aman'">✅</span>
  <span v-else-if="statusOf(item).label === 'Menipis'">⚠️</span>
  <span v-else>⛔</span>
  {{ statusOf(item).label }}
</span>
```

**SAY:**
> "v-if/v-else-if/v-else di status badge 3-cabang, plus dependent filter Kategori, error message, modal show/hide, empty state, dan v-show untuk hide tabel."

#### 9:00–9:30 — Data Binding (v-bind + v-model)

```html
<input v-model="formStok.kode" :readonly="modalForm.mode === 'edit'" />
<button :disabled="!isFormValid">Simpan</button>
```

**SAY:**
> "**v-model** di 19+ form input seluruh app. **v-bind shorthand** untuk class, disabled, readonly, plus `:aria-pressed` dan `:aria-label` dinamis di tombol toggle password."

---

### Segment 7 — Polish & Multi-tab Demo (9:30–11:00) [1:30]

#### 9:30–10:00 — Toast + Modal Animation + Row Flash

**Aksi browser:** Tambah stok baru.

**SAY:**
> "Toast slide-in dari kanan 200ms, row baru flash kuning 1.5 detik, modal pakai transition fade + slide-up 250ms cubic-bezier."

#### 10:00–10:45 — Multi-tab Sync

**Aksi:** Buka 2 tab side-by-side:
- Tab A (kiri): `stok.html`, filter Jakarta, lihat qty EKMA4116
- Tab B (kanan): `tracking.html`, klik Buat DO Baru

**Aksi (cepat):** Tab B isi paket+UPBJJ Jakarta+NIM+nama → Submit DO.

**Hasil:**
- Tab B: toast + modal close
- **Tab A AUTO-UPDATE**: qty berkurang + toast "Data ter-update dari tab lain"

**SAY:**
> "Multi-tab sync via **storage event**. Save di satu tab → tab lain auto-reload. Value comparison dedup cegah feedback loop."

#### 10:45–11:00 — Logout Cross-tab

**Aksi:** Logout di Tab A → Tab B redirect ke login.

> "Logout cross-tab — UX konsisten antar tab."

---

### Segment 8 — Penutup & Rubric Mapping (11:00–13:00) [2:00]

**SHOW:** Split-screen — kiri browser, kanan README.md "Mapping Rubrik" section.

**SAY (tempo wajar):**

> "Singkatnya, mapping ke rubrik:
>
> - **1.1 Arsitektur (5):** Multi-page, 4 Vue app, sesuai struktur PDF + `shared.js` untuk utility.
>
> - **1.2 Data binding & directive (20):** Mustaches puluhan, v-text di kolom judul, v-html dengan DOMPurify whitelist, v-bind untuk class/disabled/aria dinamis, **v-model di 19+ form input**, v-for di tabel, dropdown, timeline, demo chips.
>
> - **1.3 Conditional (10):** Status badge 3-cabang v-if/else-if/else, dependent filter Kategori, error message per field, **4 modal** show/hide, paket detail, empty state, v-show tabel.
>
> - **1.4 Computed & methods (10):** **12+ computed** termasuk filteredSortedStok yang chain 4 filter + sort, nextDoNumber, selectedPaketDetail, stokTidakTersedia, currentUser. Plus methods validateField, decrementStokForPaket, safeBadge.
>
> - **1.5 Watchers — min 2 (10):** **6 watcher total** — debounce 300ms search, cascade reset filter Kategori, formDO.upbjjAsal re-validate, plus deep stok+tracking via factory pattern untuk localStorage sync.
>
> - **1.6 Form & validasi (20):** **6 form total** — Login, Lupa Password, Daftar, Tambah/Edit Stok, Buat DO, Update Status. Validation on-blur per field + on-submit semua. Regex, cross-field check, isSubmitting lock.
>
> - **1.7 Kreativitas (10):** Reuse CSS Tugas 1, status badge berwarna, toast slide-in, modal transition cubic-bezier, row flash, **locale Indonesia** untuk Rupiah dan tanggal, **multi-tab sync** dengan auto-redirect, suggestion chip di update status, demo chip auto-fill, **900ms toast delay**, role badge per role, mobile responsive, dan `prefers-reduced-motion` support.
>
> Semua source code ada di **github.com/dzpdev/tugas2-vue-ut**, plus dokumentasi planning di folder `docs/plans/`. Terima kasih atas perhatiannya."

**SHOW (di-end):** Repository URL di address bar Chrome.

---

## ⏱️ Time Budget Cheatsheet

| # | Segment | Duration | Cumulative |
|---|---------|----------|------------|
| 1 | Intro | 0:30 | 0:30 |
| 1.5 | Demo login flow | 0:45 | 1:15 |
| 2 | Demo end-to-end | 1:15 | 2:30 |
| 3 | Struktur + Vue setup | 0:45 | 3:15 |
| 4 | stok-app.js walkthrough | 2:30 | 5:45 |
| 5 | tracking-app.js walkthrough | 2:15 | 8:00 |
| 6 | Directives showcase | 1:30 | 9:30 |
| 7 | Polish + multi-tab demo | 1:30 | 11:00 |
| 8 | Penutup + rubric mapping | 2:00 | 13:00 |
| **TOTAL** | | **13:00** | |

**Buffer:** 2 menit cadangan untuk lag, salah ucap, demo glitch, pause natural.
**Kalau over budget:** potong Segment 7 ke 0:45 (skip multi-tab demo bonus — bukan rubric requirement).

---

## 🎤 Tips Recording

### Voice
- **Pelan & jelas**, jangan terburu-buru
- **Pause 1 detik** antar topik
- Kalau salah ucap, **JANGAN restart full** — ulang kalimat saja, post-edit cut
- Tone: confident tapi natural

### Screen
- Mouse pointer **slow & deliberate**
- Zoom in code (Cmd+Plus VS Code) saat menjelaskan
- Highlight code dengan cursor selection
- Hindari typing live panjang — pre-fill value sebelum recording

### Cuts
- Cut antar segment kalau perlu — viewer tidak akan tahu
- Trim silence/throat-clearing di awal & akhir
- Tidak perlu satu take continuous

---

## ✅ Pre-Recording Checklist

- [ ] `localStorage.clear()` di Devtools console
- [ ] Browser zoom 100%
- [ ] VS Code font size 14-16pt
- [ ] Audio test 30 detik playback verify
- [ ] Notification silent mode
- [ ] Close Slack, email, Discord
- [ ] WiFi stable (CDN Vue + DOMPurify)
- [ ] Pre-login dengan akun admin sebelum start Segment 2

## ✅ Post-Recording Checklist

- [ ] Review playthrough di 1.5× speed untuk catch errors
- [ ] Trim silence/noise di awal & akhir
- [ ] Optional: overlay text di moment penting
- [ ] Export 1080p MP4, target file <500MB
- [ ] Upload ke YouTube unlisted atau Google Drive shareable
- [ ] Update README.md dengan link video

---

## 📎 Submission Template

1. **Source code ZIP** — folder `tugas2-vue-ut/`
2. **Link repository GitHub** — https://github.com/dzpdev/tugas2-vue-ut
3. **Link video penjelasan** — YouTube unlisted / Google Drive shareable
4. **(Opsional) Link folder planning** — `docs/plans/` (12+ supplementary docs)

---

*Script ini di-generate berdasarkan plan & implementation final. **Adjust narasi sesuai gaya bicara sendiri** — jangan baca kata-per-kata, jadikan referensi outline saja.*
