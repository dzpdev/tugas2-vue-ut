// ============================================================================
// SITTA UT — Stok Bahan Ajar App (Tugas Praktik 2 Vue.js)
// ============================================================================
// Vue 3 (Options API, CDN). Dipakai di stok.html.
// Features: display, filter (UPBJJ + dependent Kategori + perlu re-order),
// sort (5 opsi), search (debounced), CRUD (Tambah/Edit modal + Hapus
// confirm), validation (on blur + on submit), toast notif, row flash,
// localStorage persistence, multi-tab sync.
// ============================================================================

Vue.createApp({
  data() {
    return {
      // ---- State data ----
      stok: [],

      // ---- Master lists (dari SEED_DATA) ----
      seedUpbjjList: window.SEED_DATA.upbjjList,
      seedKategoriList: window.SEED_DATA.kategoriList,
      seedPaket: window.SEED_DATA.paket,

      // ---- Filter & sort & search ----
      filterUpbjj: '',
      filterKategori: '',
      filterPerluReorder: false,
      sortBy: '',
      searchQuery: '',
      searchQueryDebounced: '',

      // ---- Modal Tambah/Edit ----
      modalForm: { open: false, mode: 'add' },
      formStok: { kode: '', judul: '', kategori: '', upbjj: '',
                  lokasiRak: '', qty: 0, safety: 0, harga: 0, catatanHTML: '' },
      formStokOriginalKode: null,
      formStokOriginalUpbjj: null,
      errors: {},
      touched: {},

      // ---- Modal Hapus ----
      modalDelete: { open: false, item: null },

      // ---- Toast ----
      toast: { message: '', type: 'success', visible: false },

      // ---- Row flash ----
      recentlyChangedKode: null,

      // ---- Multi-tab race UX ----
      staleDataBanner: false,

      // ---- Sidebar mobile ----
      sidebarOpen: false
    };
  },

  // ============================================================================
  // Lifecycle
  // ============================================================================

  created() {
    this.stok = stokStore.load(() => window.SEED_DATA.stok);
  },

  mounted() {
    this._cleanup = stokStore.install(this, 'stok', {
      onSync: () => {
        this.showToast('Data ter-update dari tab lain', 'info');
        if (this.modalForm.open && this.modalForm.mode === 'edit') {
          this.staleDataBanner = true;
        }
      }
    });
    // Multi-tab logout sync (factory closure pattern, hindari reference leak)
    this._teardownAuth = installAuthGuardListener('logout');
    document.addEventListener('keydown', this.handleEscapeKey);
  },

  beforeUnmount() {
    if (this._cleanup) this._cleanup();
    this._teardownAuth?.();
    document.removeEventListener('keydown', this.handleEscapeKey);
    clearTimeout(this._searchTimer);
    clearTimeout(this._toastTimer);
    clearTimeout(this._flashTimer);
  },

  // ============================================================================
  // Computed
  // ============================================================================

  computed: {
    currentUser() { return getAuth(); },

    // Filter UPBJJ → dependent Kategori options
    availableKategori() {
      if (!this.filterUpbjj) return this.seedKategoriList;
      const kategoriDiUpbjj = new Set(
        this.stok
          .filter(s => s.upbjj === this.filterUpbjj)
          .map(s => s.kategori)
      );
      return this.seedKategoriList.filter(k => kategoriDiUpbjj.has(k));
    },

    // Main filter+sort+search pipeline (computed → auto-cached)
    filteredSortedStok() {
      let list = this.stok;
      if (this.filterUpbjj)        list = list.filter(s => s.upbjj === this.filterUpbjj);
      if (this.filterKategori)     list = list.filter(s => s.kategori === this.filterKategori);
      if (this.filterPerluReorder) list = list.filter(s => Domain.isKritis(s));
      if (this.searchQueryDebounced) {
        const q = this.searchQueryDebounced.toLowerCase();
        list = list.filter(s =>
          s.kode.toLowerCase().includes(q) || s.judul.toLowerCase().includes(q)
        );
      }
      if (this.sortBy) {
        list = [...list].sort((a, b) => {
          switch (this.sortBy) {
            case 'judul-asc':  return a.judul.localeCompare(b.judul);
            case 'qty-asc':    return a.qty - b.qty;
            case 'qty-desc':   return b.qty - a.qty;
            case 'harga-asc':  return a.harga - b.harga;
            case 'harga-desc': return b.harga - a.harga;
            default:           return 0;
          }
        });
      }
      return list;
    },

    // Memoize sanitize via computed (perf — DOMPurify per-render = jank)
    sanitizedStok() {
      return this.filteredSortedStok.map(item => ({
        ...item,
        catatanSafe: safeSanitize(item.catatanHTML)
      }));
    },

    // Toolbar stats
    stokStats() {
      return {
        filteredItem: this.filteredSortedStok.length,
        totalItem: this.stok.length,
        totalUnit: this.filteredSortedStok.reduce((sum, s) => sum + s.qty, 0)
      };
    },

    // Form valid? (untuk disable Submit) — tidak set error, hanya cek
    isFormValid() {
      return ['kode','judul','kategori','upbjj','lokasiRak','qty','safety','harga']
        .every(f => !this.validateField(f, false));
    },

    // Live preview status badge di modal form
    formStokPreview() {
      const qty = Number(this.formStok.qty);
      const safety = Number(this.formStok.safety);
      if (isNaN(qty) || isNaN(safety)) return null;
      return Domain.statusOf({ qty, safety });
    },

    // Greeting di topbar
    greeting() {
      const h = new Date().getHours();
      if (h < 11) return 'Selamat pagi';
      if (h < 15) return 'Selamat siang';
      if (h < 18) return 'Selamat sore';
      return 'Selamat malam';
    }
  },

  // ============================================================================
  // Watchers (6 total)
  // ============================================================================

  watch: {
    // 1. Search debounce 300ms
    searchQuery(newVal) {
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        this.searchQueryDebounced = newVal;
      }, 300);
    },

    // 2. Filter UPBJJ → cascade reset Kategori (dependent options)
    filterUpbjj() {
      this.filterKategori = '';
    }

    // 3-4. Stok deep watcher + storage event listener handled by stokStore.install()
    // (lihat shared.js createStorageSyncedRef — value comparison dedup)
  },

  // ============================================================================
  // Methods
  // ============================================================================

  methods: {
    // ---- Helpers (delegated to shared.js) ----
    formatRupiah,
    formatTanggal,
    safeSanitize,
    safeBadge(badge) { return safeRoleBadge(badge); },
    statusOf(item) { return Domain.statusOf(item); },
    isKodeInPaket(kode) { return Domain.isKodeInPaket(kode, this.seedPaket); },

    // ---- Auth ----
    logout() {
      clearAuth();
      window.location.replace('index.html');
    },

    // ---- Form blank state ----
    blankFormStok() {
      return { kode: '', judul: '', kategori: '', upbjj: '',
               lokasiRak: '', qty: 0, safety: 0, harga: 0, catatanHTML: '' };
    },

    // ---- Modal Tambah/Edit ----
    openAddModal() {
      this.modalForm = { open: true, mode: 'add' };
      this.formStok = this.blankFormStok();
      this.formStokOriginalKode = null;
      this.formStokOriginalUpbjj = null;
      this.errors = {};
      this.touched = {};
      this.staleDataBanner = false;
    },

    openEditModal(item) {
      this.modalForm = { open: true, mode: 'edit' };
      this.formStok = { ...item };  // shallow copy
      this.formStokOriginalKode = item.kode;
      this.formStokOriginalUpbjj = item.upbjj;
      this.errors = {};
      this.touched = {};
      this.staleDataBanner = false;
    },

    closeModalForm() {
      this.modalForm.open = false;
      // Form reset di onModalClosed (after-leave) untuk hindari flash
    },

    onModalClosed() {
      this.formStok = this.blankFormStok();
      this.errors = {};
      this.touched = {};
      this.formStokOriginalKode = null;
      this.formStokOriginalUpbjj = null;
      this.staleDataBanner = false;
    },

    reloadFormFromStok() {
      const fresh = this.stok.find(s =>
        s.kode === this.formStokOriginalKode && s.upbjj === this.formStokOriginalUpbjj
      );
      if (fresh) {
        this.formStok = { ...fresh };
        this.staleDataBanner = false;
      }
    },

    // ---- Validation ----
    validateField(name, showError = true) {
      const v = this.formStok[name];
      let err = '';
      switch(name) {
        case 'kode':
          if (!v) err = 'Kode wajib diisi';
          else if (v.length < 4) err = 'Min 4 karakter';
          else if (v.length > 12) err = 'Max 12 karakter';
          else if (!/^[A-Z0-9]+$/.test(v)) err = 'Hanya huruf kapital & angka';
          else if (this.modalForm.mode === 'add' &&
                   this.stok.some(s => s.kode === v && s.upbjj === this.formStok.upbjj)) {
            err = `Kode "${v}" sudah ada di UPBJJ ${this.formStok.upbjj}`;
          }
          break;
        case 'judul':
          if (!v) err = 'Judul wajib diisi';
          else if (v.length < 3) err = 'Min 3 karakter';
          else if (v.length > 100) err = 'Max 100 karakter';
          break;
        case 'kategori':
          if (!v) err = 'Pilih kategori';
          else if (!this.seedKategoriList.includes(v)) err = 'Kategori tidak valid';
          break;
        case 'upbjj':
          if (!v) err = 'Pilih UPBJJ';
          else if (!this.seedUpbjjList.includes(v)) err = 'UPBJJ tidak valid';
          break;
        case 'lokasiRak':
          if (!v) err = 'Lokasi rak wajib diisi';
          else if (!/^R\d+-[A-Z]\d+$/.test(v)) err = 'Format: R{angka}-{huruf}{angka}, mis. R1-A3';
          break;
        case 'qty':
        case 'safety': {
          const n = Number(v);
          if (v === '' || v === null) err = `${name === 'qty' ? 'Qty' : 'Safety stock'} wajib diisi`;
          else if (!Number.isInteger(n)) err = 'Harus integer';
          else if (n < 0) err = 'Tidak boleh negatif';
          else if (n > 9999) err = 'Max 9999';
          break;
        }
        case 'harga': {
          const h = Number(v);
          if (v === '' || v === null) err = 'Harga wajib diisi';
          else if (!Number.isInteger(h)) err = 'Harus integer';
          else if (h <= 0) err = 'Harga harus > 0';
          else if (h > 10000000) err = 'Max Rp 10.000.000';
          break;
        }
      }
      if (showError) {
        this.touched = { ...this.touched, [name]: true };
        this.errors = { ...this.errors, [name]: err };
      }
      return err;
    },

    validateAll() {
      const fields = ['kode','judul','kategori','upbjj','lokasiRak','qty','safety','harga'];
      fields.forEach(f => { this.touched[f] = true; });
      return fields.every(f => !this.validateField(f, true));
    },

    // ---- Submit ----
    submitForm() {
      if (!this.validateAll()) return;
      const data = {
        ...this.formStok,
        qty: Number(this.formStok.qty),
        safety: Number(this.formStok.safety),
        harga: Number(this.formStok.harga)
      };
      if (this.modalForm.mode === 'add') {
        this.stok.push(data);
        this.showToast(`Stok "${data.kode}" berhasil ditambahkan`);
      } else {
        const idx = this.stok.findIndex(s =>
          s.kode === this.formStokOriginalKode && s.upbjj === this.formStokOriginalUpbjj
        );
        if (idx !== -1) {
          this.stok.splice(idx, 1, data);
          this.showToast(`Stok "${data.kode}" berhasil diupdate`);
        }
      }
      this.flashRow(data.kode);
      this.closeModalForm();
    },

    // ---- Hapus ----
    askDelete(item) {
      this.modalDelete = { open: true, item };
    },

    doDelete() {
      const kode = this.modalDelete.item.kode;
      const upbjj = this.modalDelete.item.upbjj;
      this.stok = this.stok.filter(s => !(s.kode === kode && s.upbjj === upbjj));
      this.showToast(`Stok "${kode}" berhasil dihapus`);
      this.modalDelete.open = false;
    },

    // ---- Toast ----
    showToast(message, type = 'success') {
      this.toast = { message, type, visible: true };
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => { this.toast.visible = false; }, 2500);
    },

    // ---- Row flash ----
    flashRow(kode) {
      this.recentlyChangedKode = kode;
      clearTimeout(this._flashTimer);  // CRITICAL — cegah flash collision
      this._flashTimer = setTimeout(() => { this.recentlyChangedKode = null; }, 1500);
    },

    // ---- Reset filter ----
    resetFilters() {
      this.filterUpbjj = '';
      this.filterKategori = '';
      this.filterPerluReorder = false;
      this.sortBy = '';
      this.searchQuery = '';
      this.searchQueryDebounced = '';
    },

    // ---- Reset data ke SEED ----
    resetData() {
      if (!confirm('Yakin reset semua data stok ke kondisi awal?')) return;
      try { localStorage.removeItem('sitta-stok-v2'); } catch (e) {}
      this.stok = JSON.parse(JSON.stringify(window.SEED_DATA.stok));
      this._lastSavedJSON_sitta_stok_v2 = JSON.stringify(this.stok);
      this.showToast('Data stok dikembalikan ke kondisi awal', 'info');
    },

    // ---- Sidebar mobile ----
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    closeSidebar() { this.sidebarOpen = false; },

    // ---- Keyboard shortcuts ----
    handleEscapeKey(e) {
      if (e.key === 'Escape') {
        if (this.modalForm.open) this.closeModalForm();
        else if (this.modalDelete.open) this.modalDelete.open = false;
        else if (this.sidebarOpen) this.closeSidebar();
      }
    }
  }
}).mount('#app');
