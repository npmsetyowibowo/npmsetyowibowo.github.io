(function () {
  "use strict";

  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Counter animation ---------- */
  var counters = document.querySelectorAll(".counter");
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(eased * target);
      el.textContent = value.toLocaleString("id-ID");
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString("id-ID");
      }
    }
    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        el.textContent = parseInt(el.getAttribute("data-target"), 10).toLocaleString("id-ID");
      });
    } else {
      var counterIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterIO.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) { counterIO.observe(el); });
    }
  }

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
      }
    });
  });

  /* ---------- WhatsApp floating widget ---------- */
  var waWidget = document.getElementById("waWidget");
  var waButton = document.getElementById("waButton");
  var waClose = document.getElementById("waClose");

  if (waWidget && waButton) {
    waButton.addEventListener("click", function () {
      waWidget.classList.toggle("open");
    });
    if (waClose) {
      waClose.addEventListener("click", function (e) {
        e.preventDefault();
        waWidget.classList.remove("open");
      });
    }

    // Buka otomatis sekali setelah beberapa detik, seperti widget joinchat asli
    window.setTimeout(function () {
      if (!waWidget.classList.contains("dismissed")) {
        waWidget.classList.add("open");
      }
    }, 3200);

    document.addEventListener("click", function (e) {
      if (!waWidget.contains(e.target)) {
        waWidget.classList.remove("open");
      }
    });
  }
})();
