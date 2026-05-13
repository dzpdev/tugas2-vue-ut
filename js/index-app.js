// ============================================================================
// SITTA UT — Index App (Tugas Praktik 2 Vue.js)
// ============================================================================
// Vue 3 (Options API, CDN). Dipakai di index.html.
// Halaman beranda dengan KPI cards reaktif (totalStok, totalBarang, stokKritis,
// doAktif), status distribution bars, Quick Actions, About SITTA.
// Multi-tab sync via storage event.
// ============================================================================

Vue.createApp({
  data() {
    return {
      stok: [],
      tracking: {},
      lastSync: null,
      sidebarOpen: false
    };
  },

  created() {
    this.stok = loadFromStorage('sitta-stok-v2')
      ?? JSON.parse(JSON.stringify(window.SEED_DATA.stok));
    this.tracking = loadFromStorage('sitta-tracking-v2')
      ?? JSON.parse(JSON.stringify(window.SEED_DATA.tracking));
  },

  mounted() {
    window.addEventListener('storage', this.onStorageChange);
  },

  beforeUnmount() {
    window.removeEventListener('storage', this.onStorageChange);
  },

  computed: {
    greeting() {
      const h = new Date().getHours();
      if (h < 11) return 'Selamat pagi';
      if (h < 15) return 'Selamat siang';
      if (h < 18) return 'Selamat sore';
      return 'Selamat malam';
    },

    totalStok() { return this.stok.reduce((sum, s) => sum + s.qty, 0); },
    totalStokFormatted() { return new Intl.NumberFormat('id-ID').format(this.totalStok); },
    totalBarang() { return this.stok.length; },
    stokKritis() { return this.stok.filter(s => Domain.isKritis(s)).length; },

    doAktif() {
      return Object.values(this.tracking).filter(d =>
        d.status !== 'Diterima' && d.status !== 'Dibatalkan'
      ).length;
    },
    doTotal() { return Object.keys(this.tracking).length; },

    countAman()    { return this.stok.filter(s => Domain.statusOf(s).label === 'Aman').length; },
    countMenipis() { return this.stok.filter(s => Domain.statusOf(s).label === 'Menipis').length; },
    countKosong()  { return this.stok.filter(s => Domain.statusOf(s).label === 'Kosong').length; },
    pctAman()    { return this.totalBarang ? Math.round(this.countAman    / this.totalBarang * 100) : 0; },
    pctMenipis() { return this.totalBarang ? Math.round(this.countMenipis / this.totalBarang * 100) : 0; },
    pctKosong()  { return this.totalBarang ? Math.round(this.countKosong  / this.totalBarang * 100) : 0; }
  },

  methods: {
    formatWaktu,

    onStorageChange(e) {
      if (e.key === 'sitta-stok-v2' && e.newValue) {
        this.stok = JSON.parse(e.newValue);
        this.lastSync = new Date().toISOString();
      }
      if (e.key === 'sitta-tracking-v2' && e.newValue) {
        this.tracking = JSON.parse(e.newValue);
        this.lastSync = new Date().toISOString();
      }
    },

    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    closeSidebar() { this.sidebarOpen = false; }
  }
}).mount('#app');
