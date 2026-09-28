(function () {
  "use strict";

  /* URL Web App Google Apps Script (lihat gmeds-form-apps-script.gs).
     Isi setelah deploy; jika dikosongkan, form tetap jalan ke WhatsApp saja. */
  var SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbyWiUdwONyGy2F0Ud6EVw2nryV1YV7k15I-buy9qvgE0Q15hcCCC0_QqmQbQDrLicpECw/exec";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    initTheme();
    initLogos();
    setYear();
    initScrollProgress();
    initFloatingNav();
    initRevealObserver();
    initCounters();
    initVideo();
    initBackToTop();
    initForm();
  }

  /* ---------------- tema light / dark ---------------- */
  function initTheme() {
    var root = document.documentElement;
    var btn = document.getElementById("themeToggle");
    var meta = document.querySelector('meta[name="theme-color"]');

    function apply(theme) {
      root.setAttribute("data-theme", theme);
      if (meta) meta.setAttribute("content", theme === "dark" ? "#0D0D0D" : "#173C8D");
      if (btn) {
        btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
        btn.setAttribute("aria-label", theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap");
      }
    }

    apply(root.getAttribute("data-theme") || "light");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      apply(next);
      try { localStorage.setItem("gmeds-theme", next); } catch (e) {}
    });
  }

  /* ---------------- logo: fallback teks bila file logo belum ada ---------------- */
  function initLogos() {
    document.querySelectorAll("img.brand-logo").forEach(function (img) {
      function fallback() {
        var span = document.createElement("span");
        span.className = "brand-text " + (img.classList.contains("logo--color") ? "logo--color" : "logo--white");
        span.textContent = "GMeds";
        img.replaceWith(span);
      }
      if (img.complete && img.naturalWidth === 0) fallback();
      else img.addEventListener("error", fallback, { once: true });
    });
  }

  /* ---------------- footer year ---------------- */
  function setYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------- scroll progress bar ---------------- */
  function initScrollProgress() {
    var bar = document.getElementById("scrollProgress");
    if (!bar) return;
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var scrollTop = h.scrollTop || document.body.scrollTop;
      var height = h.scrollHeight - h.clientHeight;
      var pct = height > 0 ? (scrollTop / height) * 100 : 0;
      bar.style.width = pct + "%";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    });
    update();
  }

  /* ---------------- floating nav: show on scroll, active link, mobile toggle ---------------- */
  function initFloatingNav() {
    var nav = document.getElementById("floatingNav");
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (!nav) return;

    var revealAt = window.innerHeight * 0.5;
    window.addEventListener("scroll", function () {
      if (window.scrollY > revealAt) nav.classList.add("is-visible");
      else nav.classList.remove("is-visible");
    });

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          links.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    var navAnchors = nav.querySelectorAll("a[data-nav]");
    var sections = [];
    navAnchors.forEach(function (a) {
      var id = a.getAttribute("href");
      if (id && id.charAt(0) === "#") {
        var el = document.querySelector(id);
        if (el) sections.push({ id: id, el: el, link: a });
      }
    });

    if (sections.length && "IntersectionObserver" in window) {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var match = sections.find(function (s) { return s.el === entry.target; });
            if (!match) return;
            if (entry.isIntersecting) {
              navAnchors.forEach(function (a) { a.classList.remove("is-active"); });
              match.link.classList.add("is-active");
            }
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      sections.forEach(function (s) { obs.observe(s.el); });
    }
  }

  /* ---------------- scroll reveal ---------------- */
  function initRevealObserver() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach(function (el) { obs.observe(el); });
  }

  /* ---------------- animated counters ---------------- */
  function initCounters() {
    var nums = document.querySelectorAll(".stat-num");
    if (!nums.length) return;

    function formatNumber(n) {
      return n.toLocaleString("id-ID");
    }

    function animate(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1600;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.floor(eased * target);
        el.textContent = formatNumber(value) + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = formatNumber(target) + suffix;
        }
      }
      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      nums.forEach(animate);
      return;
    }

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach(function (el) { obs.observe(el); });
  }

  /* ---------------- click-to-play video (perf friendly) ---------------- */
  function initVideo() {
    var frame = document.getElementById("videoFrame");
    var playBtn = document.getElementById("videoPlay");
    if (!frame || !playBtn) return;

    playBtn.addEventListener("click", function () {
      var ytId = frame.getAttribute("data-yt");
      if (!ytId) return;
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube.com/embed/" + ytId + "?autoplay=1&rel=0";
      iframe.title = "Video profil GMeds";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      frame.innerHTML = "";
      frame.appendChild(iframe);
    });
  }

  /* ---------------- back to top ---------------- */
  function initBackToTop() {
    var btn = document.getElementById("backTop");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      if (window.scrollY > window.innerHeight) btn.classList.add("is-visible");
      else btn.classList.remove("is-visible");
    });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- WhatsApp floating chat bubble ---------------- */
  function initWhatsAppWidget() {
    var floatBtn = document.getElementById("waFloat");
    var bubble = document.getElementById("waBubble");
    var closeBtn = document.getElementById("waClose");
    if (!floatBtn || !bubble) return;

    function openBubble() {
      bubble.classList.add("is-open");
      bubble.setAttribute("aria-hidden", "false");
      floatBtn.setAttribute("aria-expanded", "true");
    }

    function closeBubble() {
      bubble.classList.remove("is-open");
      bubble.setAttribute("aria-hidden", "true");
      floatBtn.setAttribute("aria-expanded", "false");
    }

    floatBtn.addEventListener("click", function () {
      if (bubble.classList.contains("is-open")) closeBubble();
      else openBubble();
    });

    if (closeBtn) closeBtn.addEventListener("click", closeBubble);

    document.addEventListener("click", function (e) {
      if (!e.target.closest("#waWidget")) closeBubble();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeBubble();
    });
  }

  initWhatsAppWidget();

  /* ---------------- kirim data form ke Google Spreadsheet ---------------- */
  // no-cors: respons tidak bisa dibaca, tetapi Promise selesai setelah server menjawab.
  function sendToSheet(data) {
    var req = fetch(SHEET_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString()
    });
    var timeout = new Promise(function (_, reject) {
      setTimeout(function () { reject(new Error("timeout")); }, 20000);
    });
    return Promise.race([req, timeout]);
  }

  /* ---------------- consultation form -> Spreadsheet ---------------- */
  var WA_NUMBER = "628119275676";

  function initForm() {
    var form = document.getElementById("consultForm");
    if (!form) return;
    var note = form.querySelector(".neu-form__note");
    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn ? btn.textContent : "";
    var noteDefault = note ? note.textContent : "";
    if (note) note.setAttribute("role", "status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("is-sent")) return;

      // honeypot anti-spam: bot mengisi kolom tersembunyi ini
      if (form.hp_extra && form.hp_extra.value) return;

      var data = {
        nama: form.nama.value.trim(),
        perusahaan: form.perusahaan.value.trim(),
        jabatan: form.jabatan.value.trim(),
        jumlah: form.jumlah.value.trim(),
        wa: form.wa.value.trim(),
        email: form.email.value.trim(),
        halaman: window.location.href
      };

      // Endpoint belum diisi: kembali ke perilaku lama (langsung ke WhatsApp)
      if (!SHEET_ENDPOINT) {
        var lines = [
          "Halo GMeds! Saya ingin Konsultasi mengenai kebutuhan MCU untuk perusahaan.",
          "Nama: " + data.nama,
          "Perusahaan: " + data.perusahaan
        ];
        if (data.jabatan) lines.push("Jabatan: " + data.jabatan);
        lines.push("Jumlah Karyawan: " + data.jumlah);
        lines.push("No. WhatsApp: " + data.wa);
        if (data.email) lines.push("Email: " + data.email);
        window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
        return;
      }

      if (btn) { btn.disabled = true; btn.textContent = "Mengirim..."; }

      sendToSheet(data).then(function () {
        form.classList.add("is-sent");
        if (note) note.textContent = "Terima kasih! Permintaan konsultasi Anda sudah kami terima. Tim GMeds akan segera menghubungi Anda.";
        if (btn) btn.textContent = "Terkirim \u2713";
        form.reset();
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
        if (note) {
          note.textContent = "Maaf, pengiriman gagal. Silakan coba lagi, atau ";
          var a = document.createElement("a");
          a.href = "https://wa.me/" + WA_NUMBER;
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = "hubungi kami lewat WhatsApp";
          a.style.textDecoration = "underline";
          note.appendChild(a);
          note.appendChild(document.createTextNode("."));
        }
      });
    });
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const videoFrame = document.getElementById('videoFrame');
  const videoPlay = document.getElementById('videoPlay');

  if (videoFrame && videoPlay) {
    videoPlay.addEventListener('click', () => {
      const videoId = videoFrame.dataset.yt;
      videoFrame.innerHTML =
        '<iframe src="https://www.youtube.com/embed/' +
        encodeURIComponent(videoId) +
        '?autoplay=1&rel=0&modestbranding=1" ' +
        'title="Video YouTube GMeds" ' +
        'allow="autoplay; encrypted-media; picture-in-picture; web-share" ' +
        'allowfullscreen></iframe>';
    });
  }
});
