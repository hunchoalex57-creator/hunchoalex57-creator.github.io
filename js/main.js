/* Apex Resilient Flooring — site scripts */
(function () {
  "use strict";

  // Mobile menu toggle
  var burger = document.querySelector(".hamburger");
  var menu = document.querySelector(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.classList.toggle("open");
      var expanded = burger.classList.contains("open");
      burger.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }

  // FAQ accordion
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      q.parentElement.classList.toggle("open");
    });
  });

  // Quote / contact form → sends to Web3Forms (lands in the business inbox)
  document.querySelectorAll("form[data-quote-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var success = form.querySelector(".form-success");
      var btn = form.querySelector('button[type="submit"]');
      var btnLabel = btn ? btn.innerHTML : "";
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = "Sending…";
      }

      var payload = new FormData(form);
      // Free Web3Forms plan can't attach files, so photos are collected via text instead.
      payload.delete("photos");

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: payload,
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data.success) {
            if (success) {
              success.style.display = "block";
              success.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            form.reset();
          } else {
            alert(
              "Sorry — something went wrong sending your request. Please call or text 416-889-8273."
            );
          }
        })
        .catch(function () {
          alert(
            "Sorry — something went wrong sending your request. Please call or text 416-889-8273."
          );
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = btnLabel;
          }
        });
    });
  });

  // Auto-set current year in footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Elevate the sticky header once the page is scrolled
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Subtle scroll-reveal for content blocks (skips users who prefer reduced motion)
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealTargets = document.querySelectorAll(
    ".section-head, .card, .stat, .step, .quote-card, .gallery-item, .info-item, .split .media"
  );
  if (!prefersReduced && "IntersectionObserver" in window && revealTargets.length) {
    revealTargets.forEach(function (el) {
      el.classList.add("reveal");
    });
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) {
      io.observe(el);
    });
  }
})();
