// ============================================================================
// SITTA UT — Seed Data (Tugas Praktik 2 Vue.js)
// ============================================================================
// Diadaptasi dari template dosen `dataBahanAjar.js`. Di-refactor untuk Vue 3
// (CDN global) jadi `window.SEED_DATA` plain object. Tiap Vue app
// (index/stok/tracking) load dari localStorage kalau ada, fallback ke ini.
//
// CATATAN PII: NIM di tracking adalah dummy synthetic 9-digit untuk demo.
// BUKAN data mahasiswa nyata. UU PDP 27/2022 compliance.
// ============================================================================

window.SEED_DATA = {

  upbjjList: [
    "Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar", "Yogyakarta"
  ],

  kategoriList: [
    "MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"
  ],

  pengirimanList: [
    { 
      kode: "JNE-REG", 
      nama: "JNE Regular (3-5 hari)" 
    },
    { 
      kode: "JNE-EXP", 
      nama: "JNE Express (1-2 hari)" 
    }
  ],

  paket: [
    {
      kode: "PAKET-UT-001",
      nama: "Paket IPS Dasar",
      isi: ["EKMA4116", "EKMA4115"],
      harga: 130000
    },
    {
      kode: "PAKET-UT-002",
      nama: "Paket IPA Dasar",
      isi: ["BIOL4201", "FISIP4001"],
      harga: 145000
    },
    {
      kode: "PAKET-UT-003",
      nama: "Paket Manajemen Lengkap",
      isi: ["EKMA4116", "EKMA4115", "EKMA4263"],
      harga: 195000
    },
    {
      kode: "PAKET-UT-004",
      nama: "Paket Sains Praktikum",
      isi: ["BIOL4201", "FISIK4203"],
      harga: 175000
    }
  ],

  // 19 entries — variasi per UPBJJ × kategori, status mix
  stok: [
    { 
      kode: "EKMA4116", 
      judul: "Pengantar Manajemen", 
      kategori: "MK Wajib",
      upbjj: "Jakarta", 
      lokasiRak: "R1-A3", 
      harga: 65000, 
      qty: 28, 
      safety: 20,
      catatanHTML: "<em>Edisi 2024, cetak ulang</em>" 
    },
    { 
      kode: "EKMA4116", 
      judul: "Pengantar Manajemen", 
      kategori: "MK Wajib",
      upbjj: "Surabaya", 
      lokasiRak: "R2-A1", 
      harga: 65000, 
      qty: 18, 
      safety: 15,
      catatanHTML: "<em>Edisi 2024</em>" 
    },
    { 
      kode: "EKMA4116", 
      judul: "Pengantar Manajemen", 
      kategori: "MK Wajib",
      upbjj: "Yogyakarta", 
      lokasiRak: "R1-B2", 
      harga: 65000, 
      qty: 12, 
      safety: 10,
      catatanHTML: "<em>Edisi 2024</em>" 
    },
    { 
      kode: "EKMA4115", 
      judul: "Pengantar Akuntansi", 
      kategori: "MK Wajib",
      upbjj: "Jakarta", 
      lokasiRak: "R1-A4", 
      harga: 60000, 
      qty: 22, 
      safety: 15,
      catatanHTML: "<strong>Cover baru 2025</strong>" 
    },
    { 
      kode: "EKMA4115", 
      judul: "Pengantar Akuntansi", 
      kategori: "MK Wajib",
      upbjj: "Makassar", 
      lokasiRak: "R3-B1", 
      harga: 60000, 
      qty: 9, 
      safety: 12,
      catatanHTML: "Stok terbatas" 
    },
    { 
      kode: "EKMA4115", 
      judul: "Pengantar Akuntansi", 
      kategori: "MK Wajib",
      upbjj: "Padang", 
      lokasiRak: "R2-A2", 
      harga: 60000, 
      qty: 16, 
      safety: 10,
      catatanHTML: "<strong>Cover baru</strong>" 
    },
    { 
      kode: "EKMA4263", 
      judul: "Manajemen Keuangan", 
      kategori: "MK Wajib",
      upbjj: "Jakarta", 
      lokasiRak: "R1-A5", 
      harga: 70000, 
      qty: 14, 
      safety: 10,
      catatanHTML: "<em>Update regulasi OJK 2025</em>" 
    },
    { 
      kode: "EKMA4263", 
      judul: "Manajemen Keuangan", 
      kategori: "MK Wajib",
      upbjj: "Surabaya", 
      lokasiRak: "R2-A3", 
      harga: 70000, 
      qty: 8, 
      safety: 10,
      catatanHTML: "Persediaan harus di-replenish" 
    },
    { 
      kode: "BIOL4201", 
      judul: "Biologi Umum (Praktikum)", 
      kategori: "Praktikum",
      upbjj: "Surabaya", 
      lokasiRak: "R3-B2", 
      harga: 80000, 
      qty: 12, 
      safety: 8,
      catatanHTML: "Butuh <u>pendingin</u> untuk kit basah" 
    },
    { 
      kode: "BIOL4201", 
      judul: "Biologi Umum (Praktikum)", 
      kategori: "Praktikum",
      upbjj: "Denpasar", 
      lokasiRak: "R4-C1", 
      harga: 80000, 
      qty: 7, 
      safety: 6,
      catatanHTML: "Kit edisi 2024" 
    },
    { 
      kode: "BIOL4201", 
      judul: "Biologi Umum (Praktikum)", 
      kategori: "Praktikum",
      upbjj: "Makassar", 
      lokasiRak: "R3-B3", 
      harga: 80000, 
      qty: 8, 
      safety: 6,
      catatanHTML: "Kit standar" 
    },
    { 
      kode: "FISIP4001", 
      judul: "Dasar-Dasar Sosiologi", 
      kategori: "MK Pilihan",
      upbjj: "Makassar", 
      lokasiRak: "R2-C1", 
      harga: 55000, 
      qty: 10, 
      safety: 8,
      catatanHTML: "<i>Buku tipis, mudah dibawa</i>" 
    },
    { 
      kode: "FISIP4001", 
      judul: "Dasar-Dasar Sosiologi", 
      kategori: "MK Pilihan",
      upbjj: "Yogyakarta", 
      lokasiRak: "R1-B3", 
      harga: 55000, 
      qty: 6, 
      safety: 5,
      catatanHTML: "Edisi standar" 
    },
    { 
      kode: "FISIK4203", 
      judul: "Fisika Dasar (Praktikum)", 
      kategori: "Praktikum",
      upbjj: "Padang", 
      lokasiRak: "R2-A3", 
      harga: 85000, 
      qty: 9, 
      safety: 7,
      catatanHTML: "Kit lengkap dengan modul" 
    },
    { 
      kode: "FISIK4203", 
      judul: "Fisika Dasar (Praktikum)", 
      kategori: "Praktikum",
      upbjj: "Denpasar", 
      lokasiRak: "R4-C2", 
      harga: 85000, 
      qty: 5, 
      safety: 5,
      catatanHTML: "<strong>Stok pas-pasan</strong>" 
    },
    { 
      kode: "MKDU4109", 
      judul: "Pendidikan Kewarganegaraan", 
      kategori: "MK Wajib",
      upbjj: "Jakarta", 
      lokasiRak: "R1-A6", 
      harga: 50000, 
      qty: 0, 
      safety: 10,
      catatanHTML: "<strong>Habis!</strong> Sedang reorder" 
    },
    { 
      kode: "MKDU4109", 
      judul: "Pendidikan Kewarganegaraan", 
      kategori: "MK Wajib",
      upbjj: "Padang", 
      lokasiRak: "R2-A4", 
      harga: 50000, 
      qty: 3, 
      safety: 8,
      catatanHTML: "Sisa terakhir" 
    },
    { 
      kode: "PBIS4406", 
      judul: "English for Business", 
      kategori: "Problem-Based",
      upbjj: "Yogyakarta", 
      lokasiRak: "R1-B4", 
      harga: 75000, 
      qty: 11, 
      safety: 8,
      catatanHTML: "Audio CD included" 
    },
    { 
      kode: "PBIS4406", 
      judul: "English for Business", 
      kategori: "Problem-Based",
      upbjj: "Denpasar", 
      lokasiRak: "R4-C3", 
      harga: 75000, 
      qty: 0, 
      safety: 6,
      catatanHTML: "<em>Habis stok</em> — reorder priority" 
    }
  ],

  tracking: {
    "DO2025-001": {
      nim: "041234567",
      nama: "Rina Wulandari",
      ekspedisi: "JNE-REG",
      upbjjAsal: "Jakarta",
      paket: "PAKET-UT-001",
      tanggalKirim: "2025-08-25",
      total: 130000,
      status: "Diterima",
      perjalanan: [
        { 
          waktu: "2025-08-25T10:12:20+07:00", 
          keterangan: "Pesanan Diterima Sistem" 
        },
        { 
          waktu: "2025-08-25T14:07:56+07:00", 
          keterangan: "[Dalam Persiapan] Paket dikemas di gudang Jakarta" 
        },
        { 
          waktu: "2025-08-26T08:44:01+07:00", 
          keterangan: "[Dalam Perjalanan] Diserahkan ke kurir JNE" 
        },
        { 
          waktu: "2025-08-28T15:30:00+07:00", 
          keterangan: "[Diterima] Diterima oleh penerima" 
        }
      ]
    },
    "DO2025-002": {
      nim: "042345678",
      nama: "Agus Pranoto",
      ekspedisi: "JNE-EXP",
      upbjjAsal: "Surabaya",
      paket: "PAKET-UT-002",
      tanggalKirim: "2025-09-10",
      total: 145000,
      status: "Dalam Perjalanan",
      perjalanan: [
        { 
          waktu: "2025-09-10T09:00:00+07:00", 
          keterangan: "Pesanan Diterima Sistem" 
        },
        { 
          waktu: "2025-09-10T13:45:00+07:00", 
          keterangan: "[Dalam Persiapan] Kit praktikum disiapkan dengan ice pack" 
        },
        { 
          waktu: "2025-09-11T07:30:00+07:00", 
          keterangan: "[Dalam Perjalanan] Diserahkan ke kurir JNE Express" 
        }
      ]
    },
    "DO2026-001": {
      nim: "043456789",
      nama: "Siti Nurhaliza",
      ekspedisi: "JNE-REG",
      upbjjAsal: "Jakarta",
      paket: "PAKET-UT-003",
      tanggalKirim: "2026-04-15",
      total: 195000,
      status: "Dalam Persiapan",
      perjalanan: [
        { 
          waktu: "2026-04-15T10:00:00+07:00", 
          keterangan: "Pesanan Diterima Sistem" 
        },
        { 
          waktu: "2026-04-15T14:30:00+07:00", 
          keterangan: "[Dalam Persiapan] Paket sedang disiapkan" 
        }
      ]
    },
    "DO2026-002": {
      nim: "044567890",
      nama: "Budi Hartono",
      ekspedisi: "JNE-EXP",
      upbjjAsal: "Denpasar",
      paket: "PAKET-UT-004",
      tanggalKirim: "2026-05-01",
      total: 175000,
      status: "Baru Dibuat",
      perjalanan: [
        { 
          waktu: "2026-05-01T08:15:00+07:00", 
          keterangan: "Pesanan Diterima Sistem" 
        }
      ]
    }
  }
};

console.log(
  '[SITTA] SEED_DATA loaded:',
  window.SEED_DATA.stok.length, 'stok entries,',
  Object.keys(window.SEED_DATA.tracking).length, 'tracking entries'
);
