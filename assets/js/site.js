(function () {
  var root = document.documentElement;

  /* ---------- language toggle (English by default) ---------- */
  var language = "en";
  var languageToggle = document.getElementById("languageToggle");
  var translatedContent = Array.prototype.slice.call(document.querySelectorAll("[data-zh]")).map(function (el) {
    return { el: el, en: el.innerHTML, zh: el.getAttribute("data-zh") };
  });
  var translatedAttributes = [];
  ["aria-label", "alt", "title", "data-caption", "content"].forEach(function (attribute) {
    document.querySelectorAll("[data-zh-" + attribute + "]").forEach(function (el) {
      translatedAttributes.push({ el: el, attribute: attribute, en: el.getAttribute(attribute), zh: el.getAttribute("data-zh-" + attribute) });
    });
  });
  function text(en, zh) { return language === "zh" ? zh : en; }
  function setLanguage(next) {
    language = next;
    root.lang = language === "zh" ? "zh-CN" : "en";
    translatedContent.forEach(function (item) { item.el.innerHTML = item[language]; });
    translatedAttributes.forEach(function (item) { item.el.setAttribute(item.attribute, item[language]); });
    languageToggle.setAttribute("aria-label", text("Switch to Chinese", "切换为英语"));
    languageToggle.setAttribute("aria-pressed", String(language === "zh"));
    setNews(more && more.getAttribute("aria-expanded") === "true");
    if (renderEntpText) renderEntpText();
    if (activeFigure && dlg.open) {
      dlgImg.alt = activeFigure.querySelector("img").alt;
      dlgCap.textContent = activeFigure.dataset.caption;
    }
    onScroll();
  }
  if (languageToggle) {
    languageToggle.addEventListener("click", function () { setLanguage(language === "en" ? "zh" : "en"); });
    languageToggle.hidden = false;
  }

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
        ? text("Show fewer", "收起动态")
        : text("Show all " + newsItems.length + " items", "查看全部 " + newsItems.length + " 条动态");
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
  var activeFigure = null;
  if (dlg && typeof dlg.showModal === "function") {
    document.querySelectorAll("button.pub-fig").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeFigure = btn;
        dlgImg.src = btn.dataset.full;
        dlgImg.alt = btn.querySelector("img").alt;
        dlgCap.textContent = btn.dataset.caption;
        dlg.showModal();
      });
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { dlgImg.removeAttribute("src"); activeFigure = null; });
  } else {
    document.querySelectorAll("button.pub-fig").forEach(function (btn) {
      btn.addEventListener("click", function () { window.open(btn.dataset.full, "_blank"); });
    });
  }

  /* ---------- personality corner ---------- */
  var corner = document.getElementById("entpCorner");
  var renderEntpText;
  if (corner) {
    var entpTrigger = document.getElementById("entpTrigger");
    var entpPanel = document.getElementById("entpPanel");
    var entpHint = document.getElementById("entpHint");
    var pinned = false;
    var dismissed = false;
    var hoverTimer;
    var leaveTimer;
    var thoughts = [
      ["“We’ll find a way when we get there.”", "“车到山前必有路，船到桥头自然直。”"],
      ["“A good idea gets better when you try to break it.”", "“好想法，经得起反复推敲。”"],
      ["“Curiosity first. Then a few experiments.”", "“先保持好奇，再动手做几个实验。”"]
    ];
    var thoughtIndex = 0;
    renderEntpText = function () {
      entpTrigger.setAttribute("aria-label", corner.classList.contains("is-minimized")
        ? text("Restore personality corner", "展开性格小人")
        : pinned ? text("Close personality card", "关闭性格卡片") : text("Meet my ENTP side", "认识我的 ENTP 一面"));
      entpHint.textContent = pinned
        ? text("Click the character again to close.", "再次点击小人即可关闭。")
        : text("Click the character to keep this open.", "点击小人可固定卡片。");
      document.getElementById("entpThought").textContent = text(thoughts[thoughtIndex][0], thoughts[thoughtIndex][1]);
    };
    function setEntpOpen(open) {
      clearTimeout(hoverTimer);
      clearTimeout(leaveTimer);
      entpPanel.hidden = !open;
      entpTrigger.setAttribute("aria-expanded", String(open));
      corner.classList.toggle("is-open", open);
      corner.classList.toggle("is-pinned", pinned);
      renderEntpText();
    }
    function dismissEntp() {
      pinned = false;
      dismissed = true;
      if (entpPanel.contains(document.activeElement)) entpTrigger.focus();
      setEntpOpen(false);
    }
    corner.addEventListener("pointerenter", function (e) {
      clearTimeout(leaveTimer);
      if (e.pointerType === "touch" || dismissed || corner.classList.contains("is-minimized")) return;
      hoverTimer = setTimeout(function () { setEntpOpen(true); }, 200);
    });
    corner.addEventListener("pointerleave", function () {
      clearTimeout(hoverTimer);
      dismissed = false;
      if (!pinned && !corner.contains(document.activeElement)) {
        leaveTimer = setTimeout(function () { setEntpOpen(false); }, 180);
      }
    });
    corner.addEventListener("focusin", function () {
      if (!dismissed && !corner.classList.contains("is-minimized")) setEntpOpen(true);
    });
    corner.addEventListener("focusout", function () {
      setTimeout(function () {
        if (!corner.contains(document.activeElement)) {
          dismissed = false;
          if (!pinned && !corner.matches(":hover")) setEntpOpen(false);
        }
      }, 0);
    });
    entpTrigger.addEventListener("click", function () {
      if (pinned) { dismissEntp(); return; }
      corner.classList.remove("is-minimized");
      dismissed = false;
      pinned = true;
      setEntpOpen(true);
    });
    document.getElementById("entpClose").addEventListener("click", dismissEntp);
    document.getElementById("entpMinimize").addEventListener("click", function () {
      dismissEntp();
      corner.classList.add("is-minimized");
      renderEntpText();
      entpTrigger.focus();
    });
    document.addEventListener("click", function (e) {
      if (!entpPanel.hidden && !corner.contains(e.target)) dismissEntp();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !entpPanel.hidden) { e.preventDefault(); dismissEntp(); }
    });
    document.getElementById("entpNext").addEventListener("click", function () {
      thoughtIndex = (thoughtIndex + 1) % thoughts.length;
      pinned = true;
      setEntpOpen(true);
    });
    entpPanel.querySelector("a").addEventListener("click", dismissEntp);
    renderEntpText();
    corner.hidden = false;
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
