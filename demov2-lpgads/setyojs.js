(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setYear();
    initScrollProgress();
    initFloatingNav();
    initRevealObserver();
    initCounters();
    initVideo();
    initBackToTop();
    initForm();
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

  /* ---------------- consultation form -> WhatsApp handoff ---------------- */
  function initForm() {
    var form = document.getElementById("consultForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nama = form.nama.value.trim();
      var perusahaan = form.perusahaan.value.trim();
      var jabatan = form.jabatan.value.trim();
      var jumlah = form.jumlah.value.trim();
      var wa = form.wa.value.trim();
      var email = form.email.value.trim();

      var lines = [
        "Halo GMeds! Saya ingin Konsultasi mengenai kebutuhan MCU untuk perusahaan.",
        "Nama: " + nama,
        "Perusahaan: " + perusahaan
      ];
      if (jabatan) lines.push("Jabatan: " + jabatan);
      lines.push("Jumlah Karyawan: " + jumlah);
      lines.push("No. WhatsApp: " + wa);
      if (email) lines.push("Email: " + email);

      var message = encodeURIComponent(lines.join("\n"));
      form.classList.add("is-sent");
      window.open("https://wa.me/628119275676?text=" + message, "_blank", "noopener");
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
