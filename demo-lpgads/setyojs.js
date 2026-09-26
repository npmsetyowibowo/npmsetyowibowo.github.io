
(() => {
  "use strict";

  const page = document.querySelector("#setyo-page");
  if (!page) return;

  /* Scroll progress */
  const progress = document.querySelector(".setyo-progress span");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${value}%`;
  };
  window.addEventListener("scroll", updateProgress, {passive:true});
  updateProgress();

  /* Reveal animation */
  const revealTargets = [
    ...page.querySelectorAll(":scope > .e-parent"),
    ...page.querySelectorAll(":scope > .e-parent .elementor-widget"),
    ...page.querySelectorAll(":scope > .e-parent .e-child")
  ];

  revealTargets.forEach((el, index) => {
    if (!el.hasAttribute("data-setyo-reveal")) {
      el.setAttribute("data-setyo-reveal", "");
      el.style.transitionDelay = `${Math.min((index % 5) * 70, 280)}ms`;
    }
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("setyo-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.12, rootMargin:"0px 0px -50px 0px"});

  document.querySelectorAll("[data-setyo-reveal]").forEach(el => revealObserver.observe(el));

  /* Smooth anchor navigation */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });

  /* Mouse-follow glow */
  const glow = document.createElement("div");
  glow.className = "setyo-cursor-glow";
  Object.assign(glow.style, {
    position:"fixed",
    width:"280px",
    height:"280px",
    borderRadius:"50%",
    pointerEvents:"none",
    zIndex:"-1",
    left:"0",
    top:"0",
    opacity:"0",
    transform:"translate(-50%,-50%)",
    background:"radial-gradient(circle, rgba(53,214,197,.12), rgba(53,214,197,0) 68%)",
    transition:"opacity .35s ease",
    willChange:"transform"
  });
  document.body.appendChild(glow);

  let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
  let glowX = mouseX, glowY = mouseY;

  window.addEventListener("pointermove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = "1";
  }, {passive:true});

  const animateGlow = () => {
    glowX += (mouseX - glowX) * .12;
    glowY += (mouseY - glowY) * .12;
    glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateGlow);
  };
  animateGlow();

  window.addEventListener("pointerleave", () => glow.style.opacity = "0");

  /* Gentle parallax for ambient orbs */
  const orbs = [
    [document.querySelector(".setyo-orb-a"), .018],
    [document.querySelector(".setyo-orb-b"), -.012],
    [document.querySelector(".setyo-orb-c"), .009]
  ];
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    orbs.forEach(([el, speed]) => {
      if (el) el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
  }, {passive:true});

  /* Interactive glass tilt, desktop pointer only */
  const tiltCards = [
    ...page.querySelectorAll(
      ":scope > .e-parent:nth-child(n+3) > .e-child, " +
      ":scope > .e-parent:nth-child(n+3) > .e-con"
    )
  ];

  tiltCards.forEach(card => {
    card.classList.add("setyo-tilt");
    card.addEventListener("pointermove", e => {
      if (window.matchMedia("(max-width: 900px)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * 3.5;
      const ry = (x - 0.5) * 3.5;
      card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  /* Magnetic interaction for existing CTA elements only */
  document.querySelectorAll('a[href="#daftar"], .elementor-button, .elementor-widget-button a').forEach(button => {
    button.addEventListener("pointermove", e => {
      const r = button.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      button.style.transform = `translate(${x * .08}px, ${y * .08}px)`;
    });
    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });

  /* Active section depth */
  const sections = [...page.querySelectorAll(":scope > .e-parent")];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("setyo-section-active");
      else entry.target.classList.remove("setyo-section-active");
    });
  }, {threshold:0.18});
  sections.forEach(section => sectionObserver.observe(section));

})();
