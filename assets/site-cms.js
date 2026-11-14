/* Vjosa Roses Adventure — public-side Decap content renderer.
   The page keeps its original HTML when dynamic content is unavailable. */
(() => {
  "use strict";
  const language = () => window.current === "sq" ? "sq" : "en";
  const words = (en, sq) => language() === "sq" ? (sq || en || "") : (en || sq || "");
  const root = document;
  const $ = (selector, parent = root) => parent.querySelector(selector);
  const $$ = (selector, parent = root) => [...parent.querySelectorAll(selector)];
  let site = null;
  const endpoint = "https://api.github.com/repos/elisanika21-ship-it/vjosa-roses-adventure/contents/content/packages";

  function plain(v) { return typeof v === "string" ? v.trim() : String(v ?? "").trim(); }
  function media(url) {
    const input = plain(url);
    if (!input) return "";
    if (/^https:\/\//i.test(input)) return input;
    if (/^\/?assets\/uploads\/[a-zA-Z0-9._%/\-]+$/.test(input)) return input.startsWith("/") ? input : "/" + input;
    if (/^\/?assets\/[a-zA-Z0-9._%/\-]+$/.test(input)) return input.startsWith("/") ? input : "/" + input;
    return "";
  }
  function linkUrl(url) {
    try { const u = new URL(url); return u.protocol === "https:" ? u.href : ""; } catch { return ""; }
  }
  async function loadJson(path) {
    const res = await fetch(path, {cache: "no-cache"});
    if (!res.ok) throw new Error("Cannot load " + path);
    return res.json();
  }
  function img(url, alt, cssClass) {
    const el = document.createElement("img");
    el.src = media(url);
    el.alt = plain(alt);
    el.loading = "lazy";
    if (cssClass) el.className = cssClass;
    el.onerror = () => { el.hidden = true; };
    return el;
  }
  function translated(el, en, sq) {
    if (!el) return;
    el.dataset.en = plain(en);
    el.dataset.sq = plain(sq || en);
    el.textContent = words(en, sq);
  }
  function priceValue(price, mode) {
    const p = plain(price);
    if (mode === "fixed" && p && p.toLowerCase() !== "on request") return p;
    if (p && p.toLowerCase() !== "on request" && mode !== "request") return p;
    return words("Price on request", "Çmimi sipas kërkesës");
  }
  function whatsapp() {
    const value = plain(site?.whatsapp_number).replace(/\D/g, "");
    return /^\d{9,15}$/.test(value) ? value : "355685348508";
  }
  function bookingUrl(name) {
    const text = language() === "sq"
      ? "Përshëndetje! Jam i/e interesuar për " + name + ". Data e dëshiruar: ___. Numri i personave: ___. Ju lutem më konfirmoni çmimin dhe disponueshmërinë."
      : "Hello! I am interested in " + name + ". Preferred date: ___. Number of guests: ___. Please confirm the price and availability.";
    return "https://wa.me/" + whatsapp() + "?text=" + encodeURIComponent(text);
  }
  function refreshBookings() {
    $$(".package-book").forEach(a => {
      a.href = bookingUrl(a.dataset.package || "Vjosa Roses Adventure");
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
    const heroLink = $(".hero .actions a.btn");
    if (heroLink) heroLink.href = bookingUrl(words("a tour with Vjosa Roses Adventure", "një tur me Vjosa Roses Adventure"));
    const contactLink = $("#contact a.btn");
    if (contactLink) {
      contactLink.href = bookingUrl("Vjosa Roses Adventure");
      contactLink.textContent = "WhatsApp: " + (plain(site?.phone_display) || "+355 68 534 8508");
    }
  }
  function renderSite(data) {
    if (!data || typeof data !== "object") return;
    site = data;
    const logoUrl = media(data.logo);
    if (logoUrl && $("header img")) $("header img").src = logoUrl;
    const heroUrl = media(data.hero_image);
    if (heroUrl && $(".hero")) $(".hero").style.backgroundImage = "url(" + JSON.stringify(heroUrl) + ")";
    translated($(".hero h1"), data.hero_title_en || "Vjosa Roses Adventure", data.hero_title_sq || data.hero_title_en);
    translated($(".hero .eyebrow"), data.hero_eyebrow_en || "EXPLORE PËRMET", data.hero_eyebrow_sq);
    translated($(".hero-content p"), data.hero_subtitle_en || "Nature · Adventure · Culture · Wellness", data.hero_subtitle_sq);
    translated($("#adventures .intro"), data.adventures_intro_en, data.adventures_intro_sq);
    translated($("#packages .intro"), data.packages_intro_en, data.packages_intro_sq);
    translated($("#hospitality .intro"), data.hospitality_intro_en, data.hospitality_intro_sq);
    translated($("#discover h2"), data.discover_title_en, data.discover_title_sq);
    translated($("#discover p"), data.discover_intro_en, data.discover_intro_sq);
    translated($("#about p"), data.about_en, data.about_sq);
    translated($("#contact p"), data.contact_intro_en, data.contact_intro_sq);
    const priceNote = $(".price-guide");
    if (priceNote) {
      // Maintain a separate source link when the note is edited.
      priceNote.textContent = "";
      const p = document.createElement("p");
      translated(p, data.market_note_en, data.market_note_sq);
      priceNote.appendChild(p);
      const more = document.createElement("a");
      more.href = "https://raftingvjosa.al/tour/rafting-vjosa-tour/";
      more.target = "_blank"; more.rel = "noopener noreferrer";
      translated(more, "Example public rafting price ↗", "Shembull i çmimit publik të rafting-ut ↗");
      priceNote.appendChild(more);
    }
    const contact = $("#contact");
    if (contact) {
      let emailLink = $("#business-email", contact);
      const email = plain(data.contact_email);
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (!emailLink) { emailLink = document.createElement("a"); emailLink.id="business-email"; emailLink.className="contact-email"; contact.appendChild(emailLink); }
        emailLink.href = "mailto:" + email; emailLink.textContent = email;
      } else if (emailLink) emailLink.remove();
    }
    const footerPlace = $("footer");
    if (footerPlace) {
      footerPlace.title = plain(data.contact_location);
      const last = footerPlace.lastChild;
      if (last && last.nodeType === 3) last.textContent = " " + (plain(data.business_name) || "Vjosa Roses Adventure") + " · " + (plain(data.contact_location) || "Përmet, Albania");
    }
    if (data.business_name) document.title = plain(data.business_name) + " | Explore Përmet";
    refreshBookings();
  }

  function galleryCard(photo) {
    const card = document.createElement("article"); card.className = "card scenic-card";
    const src = media(photo.image) || media(photo.image_url);
    if (src) card.appendChild(img(src, words(photo.title_en, photo.title_sq), "gallery-photo"));
    const inner = document.createElement("div");
    const title = document.createElement("h3"); translated(title, photo.title_en, photo.title_sq); inner.appendChild(title);
    const p = document.createElement("p"); translated(p, photo.description_en, photo.description_sq); inner.appendChild(p);
    card.appendChild(inner);
    return card;
  }
  function renderGallery(data) {
    const photos = Array.isArray(data?.photos) ? data.photos.filter(p => p && (media(p.image) || media(p.image_url))) : null;
    if (!photos) return;
    const main = $(".approved-cards"), gallery = $(".photo-gallery");
    if (main) {
      main.replaceChildren();
      (photos.filter(p => p.show_on_home).slice(0, 3).length
         ? photos.filter(p => p.show_on_home).slice(0, 3)
         : photos.slice(0, 3)).forEach(p => main.appendChild(galleryCard(p)));
    }
    if (gallery) {
      gallery.replaceChildren();
      photos.forEach(p => gallery.appendChild(galleryCard(p)));
    }
    const credits = $(".photo-credits");
    if (credits) {
      const list = $("ul", credits);
      if (list) {
        list.replaceChildren();
        photos.filter(p => p.photo_credit && linkUrl(p.credit_url)).forEach(p => {
          const li = document.createElement("li"), anchor = document.createElement("a");
          anchor.textContent = plain(p.photo_credit);
          anchor.href = linkUrl(p.credit_url);
          anchor.target = "_blank"; anchor.rel = "noopener noreferrer";
          li.appendChild(anchor); list.appendChild(li);
        });
      }
    }
  }

  function hospitalityCard(data) {
    const card = document.createElement("article"); card.className = "card";
    const inner = document.createElement("div");
    const src = media(data.image) || media(data.image_url);
    if (src) inner.appendChild(img(src, words(data.title_en, data.title_sq), "package-card-photo"));
    else if (data.icon) { const icon = document.createElement("div"); icon.className = "package-icon"; icon.textContent = plain(data.icon); inner.appendChild(icon); }
    const h = document.createElement("h3"); translated(h, data.title_en, data.title_sq); inner.appendChild(h);
    const p = document.createElement("p"); translated(p, data.description_en, data.description_sq); inner.appendChild(p);
    const price = document.createElement("small"); price.dataset.price = plain(data.price); price.textContent = priceValue(data.price, data.pricing_mode); inner.appendChild(price);
    const action = document.createElement("a");
    action.className = "btn package-book";
    action.dataset.package = plain(data.title_en) || plain(data.title_sq);
    translated(action, "Request Availability", "Kërko disponueshmërinë");
    inner.appendChild(action); card.appendChild(inner);
    return card;
  }
  function renderHospitality(data) {
    if (!Array.isArray(data?.items)) return;
    const holder = $(".hospitality-cards");
    if (!holder) return;
    holder.replaceChildren();
    data.items.forEach(i => holder.appendChild(hospitalityCard(i)));
    refreshBookings();
  }

  function parseFrontmatter(source) {
    const md = String(source || "").replace(/\r/g, "");
    const found = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (!found) return null;
    const data = {};
    const lines = found[1].split("\n");
    let activeKey = null;
    let folded = false;
    for (const line of lines) {
      const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
      if (m) {
        const key = m[1]; let val = m[2].trim();
        folded = /^[|>][-+0-9]*$/.test(val);
        activeKey = folded ? key : null;
        if (folded) { data[key] = ""; continue; }
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        data[key] = val;
      } else if (activeKey && /^\s+/.test(line)) {
        data[activeKey] += (data[activeKey] ? (folded ? " " : "\n") : "") + line.trim();
      } else {
        activeKey = null;
      }
    }
    data.body = md.slice(found[0].length).trim();
    return data;
  }

  function packageCard(data) {
    const card = document.createElement("article"); card.className = "card";
    const inner = document.createElement("div");
    const pic = media(data.image) || media(data.image_url);
    if (pic) inner.appendChild(img(pic, words(data.title, data.title_sq), "package-card-photo"));
    const h = document.createElement("h3"); translated(h, data.title, data.title_sq); inner.appendChild(h);
    const p = document.createElement("p"); translated(p, data.body, data.description_sq); inner.appendChild(p);
    const price = document.createElement("small");
    price.dataset.price = plain(data.price);
    price.dataset.mode = plain(data.pricing_mode);
    price.textContent = priceValue(data.price, data.pricing_mode);
    inner.appendChild(price);
    const a = document.createElement("a"); a.className = "btn package-book";
    translated(a, "Request Availability", "Kërko disponueshmërinë");
    a.dataset.package = plain(data.title);
    inner.appendChild(a);
    card.appendChild(inner); return card;
  }
  async function renderPackages() {
    const holder = $("#package-list");
    if (!holder) return;
    try {
      const response = await fetch(endpoint, {cache: "no-cache", headers: {Accept:"application/vnd.github+json"}});
      if (!response.ok) return;
      const records = await response.json();
      if (!Array.isArray(records)) return;
      const mdFiles = records.filter(x => x.name?.endsWith(".md")).slice(0, 60);
      const entries = await Promise.all(mdFiles.map(async f => {
        try {
          const u = linkUrl(f.download_url); if (!u) return null;
          const res = await fetch(u, {cache:"no-cache"}); if (!res.ok) return null;
          return parseFrontmatter(await res.text());
        } catch { return null; }
      }));
      const valid = entries.filter(p => p && plain(p.title) && plain(p.active).toLowerCase() !== "false");
      if (!valid.length) return;
      // Only replace the fallback if every CMS file was fetched; otherwise don't hide existing packages.
      if (entries.some(v => v === null)) return;
      const order = ["vjosa rafting adventure","bënja & lengarica explorer","discover përmet","vjosa valley experience","hotova fir forest hiking","frasheri brothers heritage","sopot waterfall nature walk"];
      valid.sort((a,b) => {
        const ai = order.indexOf(plain(a.title).toLowerCase()), bi = order.indexOf(plain(b.title).toLowerCase());
        return (ai < 0 ? 100 : ai) - (bi < 0 ? 100 : bi);
      });
      holder.replaceChildren();
      valid.forEach(p => holder.appendChild(packageCard(p)));
      const status = $("#cms-status");
      if (status) translated(status, "Tour packages are updated from the administration panel.", "Paketat turistike përditësohen nga paneli i administrimit.");
      refreshBookings();
    } catch (e) { /* Static fallback remains visible. */ }
  }

  // Keep the pre-existing English/Shqip switch functional for freshly rendered content.
  const priorToggle = window.toggleLang;
  if (typeof priorToggle === "function") {
    window.toggleLang = function () {
      priorToggle();
      $$(".hospitality-cards small[data-price], #package-list small[data-price]").forEach(el => {
        el.textContent = priceValue(el.dataset.price, el.dataset.mode);
      });
      refreshBookings();
    };
  }

  Promise.allSettled([
    loadJson("content/site.json").then(renderSite),
    loadJson("content/gallery.json").then(renderGallery),
    loadJson("content/hospitality.json").then(renderHospitality),
    renderPackages()
  ]).then(() => refreshBookings());
})();