/* ==========================================================
   Landing Page PMB SD YIMI Gresik — script.js (vanilla JS)
   ========================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ----------------------------------------------------------
     KONFIGURASI
     ---------------------------------------------------------- */
  var WA_NUMBER = '62881036517460'; // tujuan WhatsApp Ustadzah Nina (format API, tanpa 0 / +)

  /*
   * TRACKING (BELUM AKTIF)
   * Setelah snippet Google tag (gtag.js) dipasang di <head> index.html dengan ID resmi,
   * ubah enabled menjadi true. Jangan mengisi ID palsu.
   * Event dikirim tanpa data pribadi (tanpa nama orang tua / anak / nomor / isi pertanyaan).
   * Untuk konversi Google Ads, buat konversi di akun Ads lalu isi sendTo dengan
   * label konversi resmi (format "AW-XXXXXXXXX/LABEL"), contoh di fungsi trackEvent.
   */
  var ANALYTICS = {
    enabled: false,
    ctaEventName: 'click_whatsapp_cta',
    formEventName: 'submit_pmb_form_whatsapp',
    adsConversionSendTo: '' // contoh: 'AW-XXXXXXXXX/LABEL' (isi hanya jika sudah resmi)
  };

  /* Pesan WhatsApp berdasarkan konteks tombol */
  var CTA_MESSAGES = {
    hero: 'Assalamu’alaikum, Ustadzah Nina. Saya ingin mendapatkan informasi Penerimaan Murid Baru SD YIMI Gresik. Mohon informasi mengenai program pendidikan dan prosedur pendaftaran. Terima kasih.',
    header: 'Assalamu’alaikum, Ustadzah Nina. Saya ingin menanyakan informasi pendaftaran Penerimaan Murid Baru SD YIMI Gresik. Mohon arahannya. Terima kasih.',
    ustadzah: 'Assalamu’alaikum, Ustadzah Nina. Saya ingin berkonsultasi mengenai Penerimaan Murid Baru SD YIMI Gresik. Mohon informasi lebih lanjut. Terima kasih.',
    alur: 'Assalamu’alaikum, Ustadzah Nina. Saya ingin berkonsultasi mengenai persyaratan, jadwal, biaya, dan prosedur pendaftaran SD YIMI Gresik. Mohon informasinya. Terima kasih.',
    closing: 'Assalamu’alaikum, Ustadzah Nina. Saya ingin mendapatkan informasi resmi mengenai program pendidikan dan proses penerimaan murid baru SD YIMI Gresik. Terima kasih.',
    footer: 'Assalamu’alaikum, Ustadzah Nina. Saya ingin bertanya mengenai Penerimaan Murid Baru SD YIMI Gresik. Terima kasih.',
    floating: 'Assalamu’alaikum, Ustadzah Nina. Saya ingin bertanya mengenai Penerimaan Murid Baru SD YIMI Gresik. Mohon informasinya. Terima kasih.',
    default: 'Assalamu’alaikum, Ustadzah Nina. Saya ingin bertanya mengenai Penerimaan Murid Baru SD YIMI Gresik. Terima kasih.'
  };

  /* ----------------------------------------------------------
     UTILITAS WHATSAPP
     ---------------------------------------------------------- */
  function buildWhatsAppUrl(message) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
  }

  function messageFor(context) {
    return CTA_MESSAGES[context] || CTA_MESSAGES.default;
  }

  function trackEvent(name, params) {
    if (!ANALYTICS.enabled || typeof window.gtag !== 'function') { return; }
    try {
      window.gtag('event', name, params || {});
      if (ANALYTICS.adsConversionSendTo) {
        window.gtag('event', 'conversion', { send_to: ANALYTICS.adsConversionSendTo });
      }
    } catch (e) { /* tracking tidak boleh mengganggu halaman */ }
  }

  /* ----------------------------------------------------------
     SEMUA TOMBOL CTA [data-wa]
     ---------------------------------------------------------- */
  var ctas = document.querySelectorAll('[data-wa]');
  Array.prototype.forEach.call(ctas, function (el) {
    var ctx = el.getAttribute('data-wa');
    el.setAttribute('href', buildWhatsAppUrl(messageFor(ctx)));
    el.addEventListener('click', function () {
      trackEvent(ANALYTICS.ctaEventName, { cta_location: ctx });
    });
  });

  /* ----------------------------------------------------------
     FORMULIR → WHATSAPP
     ---------------------------------------------------------- */
  var form = document.getElementById('pmb-form');
  if (form) {
    var fParent = document.getElementById('f-parent');
    var fChild = document.getElementById('f-child');
    var fPhone = document.getElementById('f-phone');
    var fQuestion = document.getElementById('f-question');
    var statusEl = document.getElementById('form-status');

    var setError = function (input, msg) {
      var err = document.getElementById('e-' + input.name);
      if (msg) {
        input.setAttribute('aria-invalid', 'true');
        if (err) { err.textContent = msg; }
      } else {
        input.removeAttribute('aria-invalid');
        if (err) { err.textContent = ''; }
      }
    };

    var clean = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };

    var validate = function () {
      var ok = true;
      var firstInvalid = null;

      var parent = clean(fParent.value);
      if (parent.length < 3) {
        setError(fParent, 'Mohon isi nama orang tua/wali (minimal 3 karakter).');
        ok = false; firstInvalid = firstInvalid || fParent;
      } else { setError(fParent, ''); }

      var phoneRaw = clean(fPhone.value);
      if (phoneRaw) {
        var digits = phoneRaw.replace(/[\s\-().]/g, '');
        if (!/^(\+?62|0)8\d{7,12}$/.test(digits)) {
          setError(fPhone, 'Nomor WhatsApp tidak valid. Contoh: 08123456789.');
          ok = false; firstInvalid = firstInvalid || fPhone;
        } else { setError(fPhone, ''); }
      } else { setError(fPhone, ''); }

      var question = clean(fQuestion.value);
      if (question.length < 5) {
        setError(fQuestion, 'Mohon tuliskan informasi yang ingin Anda tanyakan (minimal 5 karakter).');
        ok = false; firstInvalid = firstInvalid || fQuestion;
      } else { setError(fQuestion, ''); }

      if (firstInvalid) { firstInvalid.focus(); }
      return ok;
    };

    var buildFormMessage = function () {
      var lines = [
        'Assalamu’alaikum, Ustadzah Nina.',
        '',
        'Saya ingin bertanya mengenai Penerimaan Murid Baru SD YIMI Gresik.',
        '',
        'Nama orang tua/wali: ' + clean(fParent.value)
      ];
      var child = clean(fChild.value);
      var phone = clean(fPhone.value);
      if (child) { lines.push('Nama calon murid: ' + child); }
      if (phone) { lines.push('Nomor WhatsApp: ' + phone); }
      lines.push('Pertanyaan: ' + clean(fQuestion.value));
      lines.push('');
      lines.push('Mohon informasi lebih lanjut mengenai PMB SD YIMI Gresik.');
      lines.push('');
      lines.push('Terima kasih.');
      return lines.join('\n');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusEl.textContent = '';
      if (!validate()) { return; }

      var url = buildWhatsAppUrl(buildFormMessage());

      // Event tanpa data pribadi
      trackEvent(ANALYTICS.formEventName, { form_id: 'pmb_form' });

      window.open(url, '_blank', 'noopener,noreferrer');

      // Tautan cadangan jika WhatsApp/tab baru diblokir peramban
      statusEl.textContent = '';
      statusEl.appendChild(document.createTextNode('WhatsApp akan terbuka dengan pesan yang sudah terisi. Tekan tombol kirim di WhatsApp untuk mengirimnya. Jika tidak terbuka, '));
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'klik di sini';
      statusEl.appendChild(a);
      statusEl.appendChild(document.createTextNode('.'));
    });

    // Hapus pesan error saat pengguna mengetik ulang
    [fParent, fPhone, fQuestion].forEach(function (input) {
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') { setError(input, ''); }
      });
    });
  }

  /* ----------------------------------------------------------
     FAQ ACCORDION (aksesibel)
     ---------------------------------------------------------- */
  var accRoot = document.querySelector('[data-accordion]');
  if (accRoot) {
    var triggers = accRoot.querySelectorAll('.acc-trigger');

    var toggle = function (btn, open) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) { return; }
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
    };

    Array.prototype.forEach.call(triggers, function (btn, idx) {
      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        toggle(btn, !isOpen);
      });
      // Navigasi keyboard antar pertanyaan (panah atas/bawah, Home, End)
      btn.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown') { next = triggers[(idx + 1) % triggers.length]; }
        else if (e.key === 'ArrowUp') { next = triggers[(idx - 1 + triggers.length) % triggers.length]; }
        else if (e.key === 'Home') { next = triggers[0]; }
        else if (e.key === 'End') { next = triggers[triggers.length - 1]; }
        if (next) { e.preventDefault(); next.focus(); }
      });
    });
  }

  /* ----------------------------------------------------------
     ANIMASI MUNCUL SAAT SCROLL
     ---------------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
  }

  /* ----------------------------------------------------------
     TOMBOL WHATSAPP MELAYANG: sembunyikan saat formulir terlihat
     ---------------------------------------------------------- */
  var floatBtn = document.getElementById('wa-float');
  var contactSection = document.getElementById('kontak');
  if (floatBtn && contactSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      floatBtn.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.2 }).observe(contactSection);
  }

  /* ----------------------------------------------------------
     COPYRIGHT DINAMIS
     ---------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }
})();
