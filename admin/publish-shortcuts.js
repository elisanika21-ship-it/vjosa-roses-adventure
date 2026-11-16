/* Extra controls for the existing Decap editor.
 * This never writes data directly or bypasses permissions: it invokes
 * Decap's own Publish/Save button for the currently open entry. */
(() => {
  "use strict";
  const BUTTON_TEXT = "Ruaj / Publiko";
  const selector = "label,[class*='FieldLabel'],[class*='fieldLabel']";
  const ignored = new Set(["en", "sq"]);
  let scheduled = false;
  const root = document.body;
  const realButtons = () => [...document.querySelectorAll("button")].filter(b =>
    !b.matches(".vra-publish, .vra-publish-float") &&
    b.getClientRects().length &&
    !b.disabled
  );
  function nativeAction() {
    const buttons = realButtons();
    const names = [/^publish$/i,/^save$/i,/^publiko$/i,/^save changes$/i];
    return buttons.find(b => names.some(re => re.test((b.textContent || "").replace(/\s+/g, " ").trim()))) ||
      buttons.find(b => /^(publish|save)/i.test((b.textContent || "").replace(/\s+/g, " ").trim()));
  }
  function notify(message) {
    const m = document.getElementById("vra-editor-message");
    if (!m) return;
    m.textContent = message;
    m.hidden = false;
    clearTimeout(notify.tid);
    notify.tid = setTimeout(() => {m.hidden = true;}, 5500);
  }
  function clickPublish() {
    const action = nativeAction();
    if (!action) {
      notify("Hap një element për redaktim. Butoni i publikimit shfaqet vetëm kur Decap është gati.");
      return;
    }
    action.scrollIntoView({behavior:"smooth",block:"center"});
    action.focus({preventScroll:true});
    action.click();
    notify("Përdor veprimin e Decap që u hap. Nëse shfaqet “Publish now”, kliko atë për ta konfirmuar.");
  }
  function button(klass) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = klass;
    b.textContent = BUTTON_TEXT;
    b.setAttribute("aria-label", "Ruaj ose publiko të gjitha ndryshimet e kësaj faqeje");
    b.addEventListener("click", clickPublish);
    return b;
  }
  function openEditor() {
    return /\/collections\/[^/]+\/(entries|new|edit)/.test(location.hash) ||
           /\/edit\//.test(location.hash);
  }
  // One continuously available action beside the current editing area.
  const floating = button("vra-publish-float");
  floating.title = "Publikon të gjitha ndryshimet e elementit që po redakton";
  root.appendChild(floating);
  const message = document.createElement("div");
  message.id="vra-editor-message";message.hidden=true;message.setAttribute("role","status");
  root.appendChild(message);
  const labelsMarked = new WeakSet();
  function mount() {
    scheduled = false;
    const isEditing = openEditor();
    floating.hidden = !isEditing;
    if (!isEditing) return;
    // Field-level shortcuts for fields in Decap CMS. Save is entry-wide,
    // NOT field-specific; these shortcuts invoke exactly the same native action.
    const labels = [...document.querySelectorAll(selector)].slice(0,100);
    for (const label of labels) {
      if (labelsMarked.has(label) || label.closest(".vra-publish-fields")) continue;
      if (label.closest(".helper") || label.closest(".vra-publish-float")) continue;
      const name = (label.textContent || "").trim();
      if (!name || name.length > 110 || ignored.has(name.toLowerCase())) continue;
      const box = label.parentElement;
      if (!box || box.querySelector(":scope > .vra-publish")) continue;
      // Never change label semantics. Place an adjacent button in its field wrapper.
      const b = button("vra-publish");
      b.title = "Ruaj / publiko ndryshimet e këtij formulari";
      label.insertAdjacentElement("afterend", b);
      labelsMarked.add(label);
    }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(mount, 350);
  }
  addEventListener("hashchange", schedule);
  const mutation = new MutationObserver(schedule);
  mutation.observe(root, {childList:true, subtree:true});
  schedule();
})();