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

## 📁 Struktur Folder

```
tugas2-vue-ut/
├─ index.html              ← Beranda (KPI dashboard reaktif)
├─ stok.html               ← Halaman 1: Stok Bahan Ajar (WAJIB)
├─ tracking.html           ← Halaman 2: Tracking DO (WAJIB)
├─ css/
│  └─ style.css            ← Styling (extended dari Tugas 1)
├─ js/
│  ├─ dataBahanAjar.js     ← Seed data (window.SEED_DATA)
│  ├─ shared.js            ← Utility + Domain rules + storage factory
│  ├─ index-app.js         ← Vue app: KPI dashboard
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
- **localStorage** untuk persistensi (key `sitta-stok-v2`, `sitta-tracking-v2`)
- **Vanilla CSS** — extended dari Tugas 1, tambah class baru (toast, badge,
  empty-state, modal-transition, row-flash, status-bars)

## ✨ Fitur Utama

### 🏠 Beranda (`index.html`)
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
  - UPBJJ → dependent filter Kategori (muncul setelah UPBJJ dipilih,
    opsi auto sesuai data)
  - Checkbox "Hanya perlu re-order" (qty < safety atau qty = 0)
  - Search bebas teks (debounce 300ms)
- **Sort**: 5 opsi (judul A-Z, qty asc/desc, harga asc/desc)
- **CRUD**:
  - Tambah Stok: modal form 8 field dengan validation per field
  - Edit Stok: modal sama, kode di-lock saat edit
  - Hapus Stok: modal konfirmasi custom dengan warning kalau kode di paket
  - Live preview status badge di modal saat ubah qty
- **Reset Filter**: clear semua filter+sort+search sekaligus
- **Reset Data**: kembalikan stok ke kondisi awal (clear localStorage)
- **Toast notif**: sukses tambah/edit/hapus + row flash highlight
- **Empty state**: friendly message + tombol Reset Filter saat 0 hasil

### 🚚 Tracking DO (`tracking.html`)
- **Form Buat DO Baru** (7 field):
  - Nomor DO auto-generated (format `DO{tahun}-{NNN}`, reset per tahun)
  - NIM (validasi 9 digit angka)
  - Nama, Ekspedisi (JNE Regular/Express), UPBJJ Asal
  - Paket Bahan Ajar dengan **detail isi paket** muncul dependent
    setelah UPBJJ asal dipilih, dengan qty tersedia per item
    (highlight merah kalau tidak tersedia)
  - Tanggal Kirim (default today, validasi tidak boleh masa lalu)
  - Total Harga auto-fill dari paket
- **Submit DO**: pre-flight check stok ketersediaan (atomicity), kalau OK
  decrement qty stok di UPBJJ asal terpilih + append ke tracking
- **Histori DO**: tabel dengan search by nomor/NIM, klik row untuk expand
  timeline
- **Update Status DO**: modal dengan dependent next statuses (workflow
  linear: Baru Dibuat → Dalam Persiapan → Dalam Perjalanan → Diterima,
  + cabang Dibatalkan dari status awal), keterangan dengan suggestion chip
  + char counter (5-200), status final disable tombol Update

## 📋 Mapping Rubrik Penilaian

| Poin | Item | Implementasi |
|------|------|--------------|
| **1.1** Arsitektur (5pt) | Struktur file Vue.js | Multi-page, 3 Vue app independent, struktur folder sesuai PDF + `shared.js` untuk utility shared |
| **1.2** Data binding & directive (20pt) | Mustaches/v-text/v-html + list rendering | Mustaches puluhan, `v-text` di kolom judul, `v-html` + DOMPurify untuk catatan, `v-bind` (:class/:disabled/:value/:readonly), `v-model` di 15+ form input, `v-for` di tabel/dropdown/timeline |
| **1.3** Conditional (10pt) | v-if/else-if/else/show | Status badge 3-cabang, dependent filter Kategori, error message per field, modal show/hide, paket detail (setelah upbjj+paket dipilih), empty state, `v-show` tabel |
| **1.4** Property — computed/methods (10pt) | Computed & methods | 10+ computed (filteredSortedStok, sanitizedStok, stokStats, isFormValid, nextDoNumber, selectedPaket, selectedPaketDetail, stokTidakTersedia, canSubmitDO, filteredTracking) + methods (validateField, statusOf, decrementStokForPaket) |
| **1.5** Watchers — min 2 (10pt) | Watcher | 6 total: searchQuery debounce 300ms (stok), searchDoQuery debounce (tracking), filterUpbjj cascade reset, formDO.upbjjAsal re-validate, deep stok+tracking via factory pattern |
| **1.6** Form & validasi (20pt) | Input + validation | 3 form: Tambah/Edit Stok (8 field, regex+length+unique), DO baru (6 field + cross-field stok cek), Update Status (2 field + dependent statusBaru). Validation on-blur per field + on-submit semua. |
| **1.7** Kreativitas UI (10pt) | UX & polish | Status badge berwarna + emoji, toast slide-in animation, modal transition (cubic-bezier), row flash highlight, locale Indonesia (Rupiah + tanggal), multi-tab sync notification, suggestion chip update status, empty state friendly, sidebar active state, mobile responsive, reduce-motion support |

## 🔒 Catatan Keamanan & Privasi

- **NIM dummy synthetic**: semua NIM di seed data dan saat demo adalah dummy
  synthetic 9-digit, BUKAN NIM mahasiswa nyata. Sesuai UU PDP 27/2022.
- **`v-html` sanitization**: pakai DOMPurify dengan whitelist tegas:
  ```js
  ALLOWED_TAGS: ['em', 'strong', 'u', 'b', 'i', 'br'],
  ALLOWED_ATTR: []
  ```
  Default DOMPurify masih allow `<a href="javascript:...">`, `<img onerror>`,
  dan tag risiko lain. Whitelist eksplisit lebih aman.
- **localStorage local-only**: tidak ada transmisi data ke server. Aplikasi
  100% client-side.

## 🧪 Smoke Test (5 menit)

Sebelum demo/recording, jalankan flow ini untuk verify semua fitur:

1. **Buka `index.html`** → 4 KPI cards reaktif tampil dengan angka real
2. Klik Quick Action **"Kelola Stok"** → tabel ~19 stok dengan status badge
3. **Filter UPBJJ "Jakarta"** → tabel ter-filter, dropdown Kategori muncul
4. **Pilih Kategori "MK Wajib"** → tabel makin sempit
5. **Search "EKMA"** → tabel update setelah ~300ms debounce
6. Klik **+ Tambah Stok** → modal terbuka. Submit kosong → semua field error
7. Isi field valid → Submit → toast hijau + row baru flash kuning
8. Klik **Edit** row → modal terbuka, field kode disabled
9. Ubah qty → live preview status badge update real-time
10. Klik **Hapus** → modal konfirmasi custom (bukan native confirm)
11. Klik **Tracking DO** → form DO baru dengan nomor auto-generated
12. Pilih paket + UPBJJ asal → detail isi paket muncul dengan qty tersedia
13. Coba pilih UPBJJ yang stok habis → highlight merah + tombol Submit disabled
14. Submit valid → toast + qty stok berkurang
15. Klik row DO existing → timeline expand
16. Klik **Update Status** DO "Baru Dibuat" → modal dengan opsi
    [Dalam Persiapan, Dibatalkan]
17. Pilih + isi keterangan + Submit → status badge update + entry timeline baru
18. **Refresh browser** → semua perubahan persistent

## 🌐 Multi-tab Demo (bonus)

1. Buka `stok.html` di Tab A
2. Buka `tracking.html` di Tab B
3. Di Tab B: submit DO baru
4. **Tab A AUTO-UPDATE**: qty stok berkurang + toast "Data ter-update dari tab lain"

## 📚 Referensi

- Vue 3 Application Guide: https://vuejs.org/guide/essentials/application.html
- Vue 3.5 Release: https://blog.vuejs.org/posts/vue-3-5
- DOMPurify: https://github.com/cure53/DOMPurify
- Sufandi et al. (2021). Evaluasi UI prototype SITTA. JANAPATI 10(3).
- Sufandi (2022). Analisis Kebutuhan SITTA. JANAPATI 11(2).

## 👤 Identitas Mahasiswa

- **Nama:** Diaz Permana
- **GitHub:** [@dzpdev](https://github.com/dzpdev)
- **Mata Kuliah:** STSI4209 Pemrograman Berbasis Web
- **Tugas:** Praktik 2

---

🤖 _Aplikasi ini dibuat dengan bantuan AI pair programming (Claude Code) untuk
exploration, planning (5800+ baris docs di `docs/plans/`), dan refactoring.
Implementasi final, testing, dan video penjelasan adalah tanggung jawab penuh
mahasiswa._
