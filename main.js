/* ==========================================================================
   EVERYTHING MEDIA — main
   Lenis (buttery scroll) + GSAP ScrollTrigger (cinematic scenes)
   ========================================================================== */

(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. LENIS — smooth scroll, wired into GSAP's ticker
  ------------------------------------------------------------------ */
  var lenis = null;

  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 1.25,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.4
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* ------------------------------------------------------------------
     2. SPLIT TITLES — wrap each word for masked reveals
  ------------------------------------------------------------------ */
  document.querySelectorAll(".split").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach(function (word, i) {
      var w = document.createElement("span");
      w.className = "w";
      var inner = document.createElement("span");
      inner.textContent = word;
      w.appendChild(inner);
      el.appendChild(w);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });

  /* ------------------------------------------------------------------
     3. CHAPTER ACCENTS — CSS accent follows the active chapter
  ------------------------------------------------------------------ */
  var ACCENTS = ["#f2ede4", "#d9a441", "#8fe0d6", "#b79cff", "#e8b96b", "#f2ede4"];
  var chapters = gsap.utils.toArray(".chapter");
  var hudScene = document.getElementById("hud-scene");

  function setChapter(index, sceneLabel) {
    gsap.to(document.documentElement, {
      "--accent": ACCENTS[index] || ACCENTS[0],
      duration: 1.1,
      ease: "power2.out"
    });
    if (sceneLabel) hudScene.textContent = sceneLabel;
  }

  chapters.forEach(function (section, i) {
    ScrollTrigger.create({
      trigger: section,
      start: "top 55%",
      end: "bottom 55%",
      onEnter: function () { setChapter(i, section.dataset.scene); },
      onEnterBack: function () { setChapter(i, section.dataset.scene); }
    });
  });

  /* ------------------------------------------------------------------
     4. SCENE ANIMATIONS — every chapter enters like a cut
  ------------------------------------------------------------------ */
  if (!reduceMotion) {
    chapters.forEach(function (section, i) {
      var words = section.querySelectorAll(".title .w > span");
      var reveals = section.querySelectorAll(".reveal");

      gsap.set(words, { yPercent: 110 });
      gsap.set(reveals, { autoAlpha: 0, y: 36 });

      // The prologue's entrance belongs to the loader sequence.
      if (i === 0) {
        gsap.fromTo(section.querySelector(".chapter__inner"),
          { y: 0 },
          {
            y: -40,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true }
          });
        return;
      }

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true
        }
      });

      tl.to(words, {
        yPercent: 0,
        duration: 1.15,
        ease: "power4.out",
        stagger: 0.055
      }, 0);

      tl.to(reveals, {
        autoAlpha: 1,
        y: 0,
        duration: 1.0,
        ease: "power3.out",
        stagger: 0.09
      }, 0.25);

      // gentle parallax drift while the chapter scrolls through
      gsap.fromTo(section.querySelector(".chapter__inner"),
        { y: 0 },
        {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
    });
  } else {
    gsap.set(".reveal, .title .w > span", { clearProps: "all" });
  }

  /* ------------------------------------------------------------------
     5. GLOBAL PROGRESS — paint bleed, timecode, progress bar
  ------------------------------------------------------------------ */
  var timecodeEl = document.getElementById("hud-timecode");
  var barEl = document.getElementById("hud-bar");
  var RUNTIME_FRAMES = 4 * 60 * 24; // a fictional 4-minute film @ 24fps

  function formatTimecode(p) {
    var total = Math.round(p * RUNTIME_FRAMES);
    var fr = total % 24;
    var s = Math.floor(total / 24) % 60;
    var m = Math.floor(total / (24 * 60)) % 60;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    return "00:" + pad(m) + ":" + pad(s) + ":" + pad(fr);
  }

  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: function (self) {
      var p = self.progress;
      if (window.EM_BG) window.EM_BG.setProgress(p);
      timecodeEl.textContent = formatTimecode(p);
      barEl.style.transform = "scaleX(" + p + ")";
    }
  });

  /* ------------------------------------------------------------------
     6. LOADER — title card, then open the curtains
  ------------------------------------------------------------------ */
  var loader = document.getElementById("loader");
  var filmOpened = false;

  function openFilm() {
    if (filmOpened) return;
    filmOpened = true;

    var heroWords = document.querySelectorAll(".chapter--prologue .title .w > span");
    var heroReveals = document.querySelectorAll(".chapter--prologue .reveal");

    var tl = gsap.timeline();

    if (!reduceMotion) {
      tl.to(".loader__line", { opacity: 1, duration: 0.7, stagger: 0.25, ease: "power2.out" })
        .to(".loader__line", { opacity: 0, duration: 0.5, delay: 0.55, ease: "power2.in" })
        .to(loader, {
          autoAlpha: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: function () { loader.remove(); }
        })
        .to(heroWords, { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.06 }, "-=0.35")
        .to(heroReveals, { autoAlpha: 1, y: 0, duration: 1.0, ease: "power3.out", stagger: 0.12 }, "-=0.8");
    } else {
      loader.remove();
    }
  }

  window.addEventListener("load", openFilm);

  // Safety: never trap the user behind the loader.
  setTimeout(function () {
    if (document.body.contains(loader)) openFilm();
  }, 4000);
})();
