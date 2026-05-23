// ============================================================================
// SITTA UT — Login App (Tugas Praktik 2 Vue.js)
// ============================================================================
// Vue 3 (Options API, CDN). Dipakai di index.html (login page).
// Features: login form (email+password+toggle show, validation on-blur+submit,
// generic error, 900ms toast delay sebelum redirect, isSubmitting lock),
// Modal Lupa Password (mock, validate email exists), Modal Daftar (mock,
// 4-field cross-validation), demo account auto-fill chips, multi-tab login
// sync via factory (redirect kalau auth muncul di tab lain).
//
// CONVENTIONS (per plan):
// - Redirect targets HARUS literal ('dashboard.html')
// - isSubmitting locks cegah double-submit
// - 900ms delay sebelum window.location.replace supaya toast terlihat
// - Auto-focus first input on modal open via $refs + $nextTick
// - After-leave reset dengan re-open guard
// ============================================================================

Vue.createApp({
  data() {
    return {
      // ---- Demo accounts (untuk hint card + auto-fill chips) ----
      seedAccounts: DEMO_ACCOUNTS,  // dari shared.js

      // ---- Login form ----
      formLogin: {
        email: '',
        password: '',
        showPassword: false
      },
      formLoginErrors: {},
      formLoginTouched: {},
      loginError: '',  // generic submit error
      isSubmittingLogin: false,

      // ---- Modal Lupa Password ----
      modalLupa: {
        open: false,
        email: '',
        error: '',
        touched: false,
        isSubmitting: false
      },

      // ---- Modal Daftar ----
      modalDaftar: {
        open: false,
        nama: '',
        email: '',
        password: '',
        konfirmasi: '',
        showPassword: false,
        errors: {},
        touched: {},
        isSubmitting: false
      },

      // ---- Toast ----
      toast: { message: '', type: 'success', visible: false }
    };
  },

  // ============================================================================
  // Lifecycle
  // ============================================================================

  mounted() {
    // Multi-tab: kalau auth muncul di tab lain (login berhasil sana),
    // tab ini redirect ke dashboard juga
    this._teardownAuth = installAuthGuardListener('login');
    document.addEventListener('keydown', this.handleEscapeKey);
  },

  beforeUnmount() {
    this._teardownAuth?.();
    document.removeEventListener('keydown', this.handleEscapeKey);
    clearTimeout(this._toastTimer);
    clearTimeout(this._redirectTimer);
  },

  // ============================================================================
  // Methods
  // ============================================================================

  methods: {
    // ---- Login form ----

    togglePassword() {
      this.formLogin.showPassword = !this.formLogin.showPassword;
    },

    useDemoAccount(acc) {
      this.formLogin.email = acc.email;
      this.formLogin.password = acc.password;
      this.loginError = '';
      this.formLoginTouched = {};
      this.formLoginErrors = {};
    },

    validateLoginField(name, showError = true) {
      const v = this.formLogin[name];
      let err = '';
      switch (name) {
        case 'email':
          if (!v) err = 'Email wajib diisi';
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err = 'Format email tidak valid';
          break;
        case 'password':
          if (!v) err = 'Password wajib diisi';
          else if (v.length < 6) err = 'Min 6 karakter';
          break;
      }
      if (showError) {
        this.formLoginTouched = { ...this.formLoginTouched, [name]: true };
        this.formLoginErrors = { ...this.formLoginErrors, [name]: err };
      }
      return err;
    },

    validateAllLogin() {
      ['email', 'password'].forEach(f => { this.formLoginTouched[f] = true; });
      return ['email', 'password'].every(f => !this.validateLoginField(f, true));
    },

    submitLogin() {
      // Double-submit guard
      if (this.isSubmittingLogin) return;
      this.loginError = '';

      if (!this.validateAllLogin()) return;

      const account = findAccount(this.formLogin.email, this.formLogin.password);
      if (!account) {
        // Generic error — JANGAN reveal which field wrong (OWASP)
        this.loginError = 'Email atau password salah';
        return;
      }

      // Sukses: lock submit, save auth, show toast, delay redirect
      this.isSubmittingLogin = true;
      setAuth(account);
      this.showToast(`Selamat datang, ${account.nama}!`, 'success');

      // CRITICAL: 900ms delay supaya toast terlihat sebelum page navigate.
      // Tanpa delay: window.location.replace langsung kill page → toast tidak visible.
      this._redirectTimer = setTimeout(() => {
        window.location.replace('dashboard.html');
      }, 900);
    },

    // ---- Modal Lupa Password ----

    openLupa() {
      this.modalLupa = {
        open: true, email: '', error: '', touched: false, isSubmitting: false
      };
      this.$nextTick(() => {
        this.$refs.lupaEmail?.focus();
      });
    },

    closeLupa() {
      this.modalLupa.open = false;
      // Form reset di onLupaClosed (after-leave) untuk hindari flash
    },

    onLupaClosed() {
      // Re-open guard: cegah open→close→open cepat reset state mid-second-open
      if (this.modalLupa.open) return;
      this.modalLupa = {
        open: false, email: '', error: '', touched: false, isSubmitting: false
      };
    },

    validateLupaEmail(showError = true) {
      const v = this.modalLupa.email;
      let err = '';
      if (!v) err = 'Email wajib diisi';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err = 'Format email tidak valid';
      else if (!emailExists(v)) err = 'Email tidak terdaftar';
      // Note: Lupa Password REVEAL "tidak terdaftar" karena flow butuh verify
      // (vs login yang generic). UX > security trade-off didokumentasikan di plan.
      if (showError) {
        this.modalLupa.touched = true;
        this.modalLupa.error = err;
      }
      return err;
    },

    submitLupa() {
      if (this.modalLupa.isSubmitting) return;
      if (this.validateLupaEmail(true)) return;

      this.modalLupa.isSubmitting = true;
      // Mock: tidak benar-benar kirim email
      this.showToast(`Tautan reset password dikirim ke ${this.modalLupa.email}`, 'success');
      this.closeLupa();
    },

    // ---- Modal Daftar ----

    openDaftar() {
      this.modalDaftar = {
        open: true,
        nama: '', email: '', password: '', konfirmasi: '',
        showPassword: false,
        errors: {}, touched: {}, isSubmitting: false
      };
      this.$nextTick(() => {
        this.$refs.daftarNama?.focus();
      });
    },

    closeDaftar() {
      this.modalDaftar.open = false;
    },

    onDaftarClosed() {
      if (this.modalDaftar.open) return;
      this.modalDaftar = {
        open: false,
        nama: '', email: '', password: '', konfirmasi: '',
        showPassword: false,
        errors: {}, touched: {}, isSubmitting: false
      };
    },

    validateDaftarField(name, showError = true) {
      const v = this.modalDaftar[name];
      let err = '';
      switch (name) {
        case 'nama':
          if (!v) err = 'Nama wajib diisi';
          else if (v.length < 3) err = 'Min 3 karakter';
          else if (v.length > 50) err = 'Max 50 karakter';
          break;
        case 'email':
          if (!v) err = 'Email wajib diisi';
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err = 'Format email tidak valid';
          else if (emailExists(v)) err = 'Email sudah terdaftar';
          break;
        case 'password':
          if (!v) err = 'Password wajib diisi';
          else if (v.length < 6) err = 'Min 6 karakter';
          break;
        case 'konfirmasi':
          if (!v) err = 'Konfirmasi wajib diisi';
          else if (v !== this.modalDaftar.password) err = 'Konfirmasi tidak cocok dengan password';
          break;
      }
      if (showError) {
        this.modalDaftar.touched = { ...this.modalDaftar.touched, [name]: true };
        this.modalDaftar.errors = { ...this.modalDaftar.errors, [name]: err };
      }
      return err;
    },

    validateAllDaftar() {
      const fields = ['nama', 'email', 'password', 'konfirmasi'];
      fields.forEach(f => { this.modalDaftar.touched[f] = true; });
      return fields.every(f => !this.validateDaftarField(f, true));
    },

    submitDaftar() {
      if (this.modalDaftar.isSubmitting) return;
      if (!this.validateAllDaftar()) return;

      this.modalDaftar.isSubmitting = true;
      // Mock: TIDAK push ke DEMO_ACCOUNTS (akan hilang saat refresh, lebih clear via toast)
      this.showToast(
        `Pendaftaran ${this.modalDaftar.nama} berhasil! Akun belum aktif (demo).`,
        'success'
      );
      this.closeDaftar();
    },

    // ---- Toast ----

    showToast(message, type = 'success') {
      this.toast = { message, type, visible: true };
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => { this.toast.visible = false; }, 2500);
    },

    // ---- Keyboard shortcuts ----

    handleEscapeKey(e) {
      if (e.key !== 'Escape') return;
      if (this.modalLupa.open) this.closeLupa();
      else if (this.modalDaftar.open) this.closeDaftar();
    }
  }
}).mount('#app');
