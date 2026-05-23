// ============================================================================
// SITTA UT — Tracking DO App (Tugas Praktik 2 Vue.js)
// ============================================================================
// Vue 3 (Options API, CDN). Dipakai di tracking.html.
// Features: form input DO baru (auto nomor + dependent paket detail dengan
// qty cek per UPBJJ asal + atomicity stok decrement), search + list histori
// DO, expand timeline, modal Update Status (linear 4 + branch Dibatalkan),
// keterangan suggestion chip, multi-tab sync.
// ============================================================================

Vue.createApp({
  data() {
    return {
      // ---- State data ----
      stok: [],
      tracking: {},

      // ---- Master lists ----
      seedUpbjjList: window.SEED_DATA.upbjjList,
      seedPaket: window.SEED_DATA.paket,
      seedPengirimanList: window.SEED_DATA.pengirimanList,

      // ---- Form DO baru ----
      formDO: {
        nim: '', nama: '',
        ekspedisi: '',
        upbjjAsal: '',
        kodePaket: '',
        tanggalKirim: ''  // diisi todayLocal() di created()
      },
      formDOerrors: {},
      formDOtouched: {},

      // ---- Search + expand ----
      searchDoQuery: '',
      searchDoQueryDebounced: '',
      expandedDo: null,

      // ---- Modal Update Status ----
      modalUpdateStatus: {
        open: false, nomor: null,
        statusBaru: '', keterangan: '', error: ''
      },

      // ---- Toast ----
      toast: { message: '', type: 'success', visible: false },

      // ---- Sidebar mobile ----
      sidebarOpen: false
    };
  },

  // ============================================================================
  // Lifecycle
  // ============================================================================

  created() {
    this.stok = stokStore.load(() => window.SEED_DATA.stok);
    this.tracking = trackingStore.load(() => window.SEED_DATA.tracking);
    this.formDO.tanggalKirim = todayLocal();
    this._lastSavedJSON_sitta_stok_v2 = JSON.stringify(this.stok);
  },

  mounted() {
    // Tracking deep watcher + storage event via factory
    this._cleanupTracking = trackingStore.install(this, 'tracking', {
      onSync: () => {
        this.showToast('Tracking ter-update dari tab lain', 'info');
      }
    });

    // Multi-tab logout sync (factory closure pattern, hindari reference leak)
    this._teardownAuth = installAuthGuardListener('logout');

    // Stok read-only listener (tracking-app TIDAK owns stok save — explicit di submitDO)
    window.addEventListener('storage', this.onStokStorageChange);
    document.addEventListener('keydown', this.handleEscapeKey);
  },

  beforeUnmount() {
    if (this._cleanupTracking) this._cleanupTracking();
    this._teardownAuth?.();
    window.removeEventListener('storage', this.onStokStorageChange);
    document.removeEventListener('keydown', this.handleEscapeKey);
    clearTimeout(this._searchTimer);
    clearTimeout(this._toastTimer);
  },

  // ============================================================================
  // Computed
  // ============================================================================

  computed: {
    nextDoNumber() {
      return Domain.generateDoNumber(this.tracking);
    },

    selectedPaket() {
      return this.seedPaket.find(p => p.kode === this.formDO.kodePaket) ?? null;
    },

    selectedPaketDetail() {
      if (!this.selectedPaket || !this.formDO.upbjjAsal) return [];
      // Group kode dengan count (handle duplicate kode di paket)
      const counts = {};
      this.selectedPaket.isi.forEach(kode => {
        counts[kode] = (counts[kode] ?? 0) + 1;
      });
      return Object.entries(counts).map(([kode, n]) => {
        const stokItem = this.stok.find(s =>
          s.kode === kode && s.upbjj === this.formDO.upbjjAsal
        );
        const judul = stokItem?.judul ?? this.findJudulAnyUpbjj(kode);
        const qtyTersedia = stokItem?.qty ?? 0;
        return {
          kode,
          judul,
          qtyTersedia,
          qtyDibutuhkan: n,
          cukup: qtyTersedia >= n
        };
      });
    },

    stokTidakTersedia() {
      return this.selectedPaketDetail.filter(d => !d.cukup);
    },

    canSubmitDO() {
      if (this.stokTidakTersedia.length > 0) return false;
      return ['nim','nama','ekspedisi','upbjjAsal','kodePaket','tanggalKirim']
        .every(f => !this.validateFieldDO(f, false));
    },

    filteredTracking() {
      const q = this.searchDoQueryDebounced.toLowerCase();
      return Object.entries(this.tracking)
        .filter(([nomor, data]) =>
          !q || nomor.toLowerCase().includes(q) || data.nim.includes(q)
        )
        .map(([nomor, data]) => ({ nomor, ...data }))
        .sort((a, b) => b.nomor.localeCompare(a.nomor));  // newest first
    },

    totalDO() {
      return this.selectedPaket?.harga ?? 0;
    },

    greeting() {
      const h = new Date().getHours();
      if (h < 11) return 'Selamat pagi';
      if (h < 15) return 'Selamat siang';
      if (h < 18) return 'Selamat sore';
      return 'Selamat malam';
    }
  },

  // ============================================================================
  // Watchers
  // ============================================================================

  watch: {
    // 1. Search debounce 300ms
    searchDoQuery(newVal) {
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        this.searchDoQueryDebounced = newVal;
      }, 300);
    },

    // 2. Auto-validate UPBJJ asal saat berubah (re-render detail isi)
    'formDO.upbjjAsal'(val) {
      if (val && this.formDO.kodePaket && this.formDOtouched.upbjjAsal) {
        this.validateFieldDO('upbjjAsal');
      }
    }

    // 3. Tracking deep watcher handled by trackingStore.install()
  },

  // ============================================================================
  // Methods
  // ============================================================================

  methods: {
    // ---- Helpers (delegated to shared.js) ----
    formatRupiah,
    formatTanggal,
    formatWaktu,
    todayLocal,
    iconForKeterangan(k) { return Domain.iconForKeterangan(k); },
    slugStatus(s) { return Domain.slugStatus(s); },
    availableStatuses(current) { return Domain.nextStatuses(current); },
    suggestionForStatus(status) {
      const doData = this.tracking[this.modalUpdateStatus.nomor];
      return Domain.suggestionFor(status, doData);
    },

    // ---- Helpers ----
    findJudulAnyUpbjj(kode) {
      const found = this.stok.find(s => s.kode === kode);
      return found?.judul ?? '(judul tidak ditemukan)';
    },

    findStokDiUpbjjLain(kode) {
      return this.stok
        .filter(s => s.kode === kode && s.qty > 0 && s.upbjj !== this.formDO.upbjjAsal)
        .map(s => `${s.upbjj} (${s.qty})`)
        .join(', ');
    },

    // ---- Validation form DO ----
    validateFieldDO(name, showError = true) {
      const v = this.formDO[name];
      let err = '';
      switch(name) {
        case 'nim':
          if (!v) err = 'NIM wajib diisi';
          else if (!/^\d{9}$/.test(v)) err = 'NIM harus 9 digit angka';
          break;
        case 'nama':
          if (!v) err = 'Nama wajib diisi';
          else if (v.length < 3) err = 'Min 3 karakter';
          break;
        case 'ekspedisi':
          if (!v) err = 'Pilih ekspedisi';
          else if (!this.seedPengirimanList.some(p => p.kode === v)) err = 'Ekspedisi tidak valid';
          break;
        case 'upbjjAsal':
          if (!v) err = 'Pilih UPBJJ asal';
          else if (!this.seedUpbjjList.includes(v)) err = 'UPBJJ tidak valid';
          break;
        case 'kodePaket':
          if (!v) err = 'Pilih paket';
          else if (!this.seedPaket.some(p => p.kode === v)) err = 'Paket tidak valid';
          break;
        case 'tanggalKirim':
          if (!v) err = 'Tanggal kirim wajib diisi';
          else if (new Date(v) < new Date(todayLocal())) err = 'Tanggal kirim tidak boleh di masa lalu';
          break;
      }
      if (showError) {
        this.formDOtouched = { ...this.formDOtouched, [name]: true };
        this.formDOerrors = { ...this.formDOerrors, [name]: err };
      }
      return err;
    },

    validateAllDO() {
      const fields = ['nim','nama','ekspedisi','upbjjAsal','kodePaket','tanggalKirim'];
      fields.forEach(f => { this.formDOtouched[f] = true; });
      return fields.every(f => !this.validateFieldDO(f, true));
    },

    // ---- Decrement stok dengan pre-flight check (atomicity) ----
    decrementStokForPaket(paketIsi, upbjjAsal) {
      // Re-load fresh stok untuk capture multi-tab updates
      const fresh = loadFromStorage('sitta-stok-v2');
      if (fresh) this.stok = fresh;

      // Group kode dengan count (handle duplicate kode di paket)
      const counts = {};
      paketIsi.forEach(kode => { counts[kode] = (counts[kode] ?? 0) + 1; });

      // Pre-flight: verify SEMUA item available sebelum mutasi
      const targets = [];
      for (const [kode, n] of Object.entries(counts)) {
        const idx = this.stok.findIndex(s => s.kode === kode && s.upbjj === upbjjAsal);
        if (idx === -1) {
          return { ok: false, error: `Stok ${kode} tidak ada di UPBJJ ${upbjjAsal}` };
        }
        if (this.stok[idx].qty < n) {
          return { ok: false, error: `Stok ${this.stok[idx].judul} (${kode}) tidak cukup di UPBJJ ${upbjjAsal}` };
        }
        targets.push({ idx, n });
      }

      // Phase 2: apply mutations (aman karena pre-flight pass)
      targets.forEach(({ idx, n }) => { this.stok[idx].qty -= n; });

      // Persist explicit (TIDAK via deep watcher)
      const json = JSON.stringify(this.stok);
      saveToStorage('sitta-stok-v2', this.stok);
      this._lastSavedJSON_sitta_stok_v2 = json;
      return { ok: true };
    },

    // ---- Submit DO ----
    submitDO() {
      if (!this.validateAllDO() || this.stokTidakTersedia.length > 0) return;

      const result = this.decrementStokForPaket(this.selectedPaket.isi, this.formDO.upbjjAsal);
      if (!result.ok) {
        this.showToast(result.error, 'error');
        return;
      }

      const nomor = this.nextDoNumber;
      this.tracking = {
        ...this.tracking,
        [nomor]: {
          nim: this.formDO.nim,
          nama: this.formDO.nama,
          ekspedisi: this.formDO.ekspedisi,
          upbjjAsal: this.formDO.upbjjAsal,
          paket: this.formDO.kodePaket,
          tanggalKirim: this.formDO.tanggalKirim,
          total: this.totalDO,
          status: 'Baru Dibuat',
          perjalanan: [{
            waktu: new Date().toISOString(),
            keterangan: 'Pesanan Diterima Sistem'
          }]
        }
      };
      this.showToast(`DO ${nomor} berhasil dibuat`, 'success');
      this.resetFormDO();
    },

    resetFormDO() {
      this.formDO = {
        nim: '', nama: '',
        ekspedisi: '',
        upbjjAsal: '',
        kodePaket: '',
        tanggalKirim: todayLocal()
      };
      this.formDOerrors = {};
      this.formDOtouched = {};
    },

    // ---- Update Status ----
    openUpdateStatus(nomor) {
      this.modalUpdateStatus = {
        open: true, nomor,
        statusBaru: '', keterangan: '', error: ''
      };
    },

    applySuggestion() {
      this.modalUpdateStatus.keterangan = this.suggestionForStatus(this.modalUpdateStatus.statusBaru);
    },

    submitUpdateStatus() {
      const m = this.modalUpdateStatus;
      const current = this.tracking[m.nomor].status;
      if (!m.statusBaru) {
        this.modalUpdateStatus.error = 'Pilih status baru';
        return;
      }
      if (!Domain.nextStatuses(current).includes(m.statusBaru)) {
        this.modalUpdateStatus.error = 'Status tidak valid (mungkin sudah berubah di tab lain)';
        return;
      }
      if (!m.keterangan || m.keterangan.length < 5) {
        this.modalUpdateStatus.error = 'Keterangan min 5 karakter';
        return;
      }
      if (m.keterangan.length > 200) {
        this.modalUpdateStatus.error = 'Keterangan max 200 karakter';
        return;
      }

      // Apply (immutable update untuk clean watcher trigger)
      const newPerjalanan = [...this.tracking[m.nomor].perjalanan, {
        waktu: new Date().toISOString(),
        keterangan: `[${m.statusBaru}] ${m.keterangan}`
      }];
      this.tracking = {
        ...this.tracking,
        [m.nomor]: {
          ...this.tracking[m.nomor],
          status: m.statusBaru,
          perjalanan: newPerjalanan
        }
      };
      this.showToast(`Status DO ${m.nomor} diupdate ke ${m.statusBaru}`, 'success');
      this.modalUpdateStatus.open = false;
    },

    // ---- Expand timeline ----
    toggleExpandDo(nomor) {
      this.expandedDo = this.expandedDo === nomor ? null : nomor;
    },

    // ---- Storage event for stok (read-only, NOT via factory) ----
    onStokStorageChange(e) {
      if (e.key !== 'sitta-stok-v2' || !e.newValue) return;
      if (e.newValue === this._lastSavedJSON_sitta_stok_v2) return;  // dedup own write
      this._lastSavedJSON_sitta_stok_v2 = e.newValue;
      this.stok = JSON.parse(e.newValue);
    },

    // ---- Toast ----
    showToast(message, type = 'success') {
      this.toast = { message, type, visible: true };
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => { this.toast.visible = false; }, 2500);
    },

    // ---- Reset tracking ke SEED ----
    resetTrackingData() {
      if (!confirm('Yakin reset semua data tracking ke kondisi awal?')) return;
      try { localStorage.removeItem('sitta-tracking-v2'); } catch (e) {}
      this.tracking = JSON.parse(JSON.stringify(window.SEED_DATA.tracking));
      this.showToast('Data tracking dikembalikan ke kondisi awal', 'info');
    },

    // ---- Sidebar mobile ----
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    closeSidebar() { this.sidebarOpen = false; },

    // ---- Keyboard shortcuts ----
    handleEscapeKey(e) {
      if (e.key === 'Escape') {
        if (this.modalUpdateStatus.open) this.modalUpdateStatus.open = false;
        else if (this.sidebarOpen) this.closeSidebar();
      }
    }
  }
}).mount('#app');
