(function () {
  var root = document.documentElement;

  /* ---------- theme toggle ---------- */
  var toggle = document.getElementById("themeToggle");
  function isDark() {
    var t = root.dataset.theme;
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---------- top bar border + active section ---------- */
  var bar = document.getElementById("topbar");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function onScroll() {
    var y = window.scrollY;
    if (bar) bar.classList.toggle("scrolled", y > 8);
    var current = null;
    var line = window.innerHeight * 0.35;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line) current = sections[i].id;
    }
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4 && sections.length) {
      current = sections[sections.length - 1].id;
    }
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- publication filters ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  var firstOnly = document.getElementById("firstOnly");
  var groups = Array.prototype.slice.call(document.querySelectorAll(".year-group"));
  var empty = document.getElementById("pubEmpty");
  var active = "all";

  function applyFilter() {
    var shown = 0;
    groups.forEach(function (g) {
      var visible = 0;
      g.querySelectorAll(".pub").forEach(function (p) {
        var tags = (p.dataset.tags || "").split(" ");
        var ok = (active === "all" || tags.indexOf(active) !== -1) &&
                 (!firstOnly || !firstOnly.checked || p.dataset.first === "1");
        p.hidden = !ok;
        if (ok) visible++;
      });
      g.hidden = visible === 0;
      shown += visible;
    });
    if (empty) empty.hidden = shown !== 0;
  }

  function countFor(key) {
    return document.querySelectorAll(key === "all" ? ".pub" : ".pub[data-tags~='" + key + "']").length;
  }

  filters.forEach(function (btn) {
    var c = document.createElement("span");
    c.className = "count";
    c.textContent = countFor(btn.dataset.filter);
    btn.appendChild(c);
    btn.addEventListener("click", function () {
      active = btn.dataset.filter;
      filters.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      applyFilter();
    });
  });
  if (firstOnly) firstOnly.addEventListener("change", applyFilter);

  /* ---------- news: show first N ---------- */
  var NEWS_VISIBLE = 6;
  var newsItems = Array.prototype.slice.call(document.querySelectorAll("#newsList li"));
  var more = document.getElementById("newsMore");
  function setNews(expanded) {
    newsItems.forEach(function (li, i) { li.hidden = !expanded && i >= NEWS_VISIBLE; });
    if (more) {
      more.setAttribute("aria-expanded", expanded ? "true" : "false");
      more.querySelector("span").textContent = expanded
        ? "Show fewer"
        : "Show all " + newsItems.length + " items";
    }
  }
  if (newsItems.length > NEWS_VISIBLE) {
    setNews(false);
    more.addEventListener("click", function () {
      setNews(more.getAttribute("aria-expanded") !== "true");
    });
  } else if (more) {
    more.hidden = true;
  }

  /* ---------- figure lightbox ---------- */
  var dlg = document.getElementById("figDialog");
  var dlgImg = document.getElementById("figImg");
  var dlgCap = document.getElementById("figCap");
  if (dlg && typeof dlg.showModal === "function") {
    document.querySelectorAll("button.pub-fig").forEach(function (btn) {
      btn.addEventListener("click", function () {
        dlgImg.src = btn.dataset.full;
        dlgImg.alt = btn.querySelector("img").alt;
        dlgCap.textContent = btn.dataset.caption;
        dlg.showModal();
      });
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { dlgImg.removeAttribute("src"); });
  } else {
    document.querySelectorAll("button.pub-fig").forEach(function (btn) {
      btn.addEventListener("click", function () { window.open(btn.dataset.full, "_blank"); });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
})();
