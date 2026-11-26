(function () {
  "use strict";

  const STORAGE_KEY = "quickOrderState";
  const TYPE_PRESETS = {
    restaurant: { label: "Table Number", placeholder: "e.g. Table 5", quick: ["Table 1","Table 2","Table 3","Table 4","Table 5","Table 6","Table 7","Table 8"],
      items: ["Masala Dosa","Plain Dosa","Idli","Poori","Filter Coffee","Tea","Vada","Rice Plate"] },
    grocery: { label: "Delivery Address", placeholder: "e.g. 12 Main St", quick: [],
      items: ["Rice 1kg","Milk 1L","Eggs 6pc","Bread","Sugar 1kg","Oil 1L","Salt","Tea Powder"] },
    hotel: { label: "Room Number", placeholder: "e.g. Room 204", quick: ["Room 101","Room 102","Room 201","Room 202","Room 204"],
      items: ["Standard Room","Deluxe Room","Extra Bed","Breakfast","Lunch","Dinner","Laundry"] },
    loading: { label: "Pickup Location", placeholder: "e.g. Warehouse A", quick: [],
      items: ["Small Load","Medium Load","Large Load","Loading Only","Unloading Only","Fragile Items"] },
    custom: { label: "Location / Reference", placeholder: "e.g. Order #1", quick: [], items: [] }
  };

  let state = loadState();

  const els = {
    bizType: document.getElementById("bizType"),
    location: document.getElementById("location"),
    locationLabel: document.getElementById("locationLabel"),
    quickTables: document.getElementById("quickTables"),
    guestList: document.getElementById("guestList"),
    addGuestBtn: document.getElementById("addGuestBtn"),
    paymentNote: document.getElementById("paymentNote"),
    footerSummary: document.getElementById("footerSummary"),
    generateBtn: document.getElementById("generateBtn"),
    clearBtn: document.getElementById("clearBtn"),
    qrModal: document.getElementById("qrModal"),
    closeModal: document.getElementById("closeModal"),
    qrCanvas: document.getElementById("qrCanvas"),
    modalSummary: document.getElementById("modalSummary"),
    modalWarning: document.getElementById("modalWarning"),
    copyLinkBtn: document.getElementById("copyLinkBtn"),
    shareBtn: document.getElementById("shareBtn"),
    downloadQrBtn: document.getElementById("downloadQrBtn"),
    modalTitle: document.getElementById("modalTitle")
  };

  let currentShareUrl = "";

  function defaultState() {
    return { t: "restaurant", l: "", g: [], p: "Pay at counter", ts: Date.now() };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return defaultState();
      return parsed;
    } catch (e) { return defaultState(); }
  }

  function saveState() {
    state.ts = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function newGuest() {
    return { id: "g" + Date.now() + Math.floor(Math.random()*1000), n: "", i: [] };
  }

  function newItem(name) {
    return { q: 1, d: name || "", n: "" };
  }

  function getPreset() {
    return TYPE_PRESETS[state.t] || TYPE_PRESETS.custom;
  }

  function renderAll() {
    const preset = getPreset();
    els.bizType.value = state.t;
    els.locationLabel.textContent = preset.label;
    els.location.placeholder = preset.placeholder;
    els.location.value = state.l || "";
    els.paymentNote.value = state.p || "";
    renderQuickTables(preset);
    renderGuests();
    updateSummary();
  }

  function renderQuickTables(preset) {
    els.quickTables.innerHTML = "";
    if (!preset.quick.length) return;
    preset.quick.forEach(function (t) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quick-chip";
      b.textContent = t;
      b.addEventListener("click", function () {
        state.l = t;
        els.location.value = t;
        saveState();
        updateSummary();
      });
      els.quickTables.appendChild(b);
    });
  }

  function buildDatalist(id, items) {
    const dl = document.createElement("datalist");
    dl.id = id;
    items.forEach(function (it) {
      const o = document.createElement("option");
      o.value = it;
      dl.appendChild(o);
    });
    return dl;
  }

  function renderGuests() {
    els.guestList.innerHTML = "";
    const preset = getPreset();
    const dlId = "items-" + state.t;
    els.guestList.appendChild(buildDatalist(dlId, preset.items));

    if (!state.g.length) {
      const empty = document.createElement("p");
      empty.className = "empty-hint";
      empty.textContent = "No customers yet. Tap \u201c+ Add Customer\u201d to start.";
      els.guestList.appendChild(empty);
      return;
    }

    state.g.forEach(function (guest, gi) {
      const card = document.createElement("div");
      card.className = "guest-card";

      const head = document.createElement("div");
      head.className = "guest-head";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "guest-name";
      nameInput.placeholder = "Customer " + (gi + 1);
      nameInput.value = guest.n || "";
      nameInput.addEventListener("input", function () {
        guest.n = nameInput.value;
        saveState();
        updateSummary();
      });

      const removeGuest = document.createElement("button");
      removeGuest.type = "button";
      removeGuest.className = "btn-link danger";
      removeGuest.textContent = "Remove";
      removeGuest.addEventListener("click", function () {
        if (guest.i.length && !confirm("Remove this customer and their items?")) return;
        state.g.splice(gi, 1);
        saveState();
        renderAll();
      });

      head.appendChild(nameInput);
      head.appendChild(removeGuest);
      card.appendChild(head);

      const itemsWrap = document.createElement("div");
      itemsWrap.className = "items-wrap";

      guest.i.forEach(function (item, ii) {
        const row = document.createElement("div");
        row.className = "item-row";

        const qty = document.createElement("div");
        qty.className = "qty";
        const minus = document.createElement("button");
        minus.type = "button"; minus.textContent = "\u2212";
        minus.addEventListener("click", function () {
          item.q = Math.max(1, (item.q || 1) - 1);
          saveState(); renderGuests(); updateSummary();
        });
        const qtyNum = document.createElement("span");
        qtyNum.textContent = item.q || 1;
        const plus = document.createElement("button");
        plus.type = "button"; plus.textContent = "+";
        plus.addEventListener("click", function () {
          item.q = (item.q || 1) + 1;
          saveState(); renderGuests(); updateSummary();
        });
        qty.appendChild(minus); qty.appendChild(qtyNum); qty.appendChild(plus);

        const name = document.createElement("input");
        name.type = "text";
        name.className = "item-name";
        name.placeholder = "Item name";
        name.setAttribute("list", dlId);
        name.value = item.d || "";
        name.addEventListener("input", function () {
          item.d = name.value;
          saveState(); updateSummary();
        });

        const note = document.createElement("input");
        note.type = "text";
        note.className = "item-note";
        note.placeholder = "Note (optional)";
        note.value = item.n || "";
        note.addEventListener("input", function () {
          item.n = note.value;
          saveState();
        });

        const del = document.createElement("button");
        del.type = "button";
        del.className = "btn-link danger small";
        del.textContent = "\u00d7";
        del.addEventListener("click", function () {
          guest.i.splice(ii, 1);
          saveState(); renderGuests(); updateSummary();
        });

        row.appendChild(qty);
        row.appendChild(name);
        row.appendChild(note);
        row.appendChild(del);
        itemsWrap.appendChild(row);
      });

      const addItem = document.createElement("button");
      addItem.type = "button";
      addItem.className = "btn-secondary small";
      addItem.textContent = "+ Add Item";
      addItem.addEventListener("click", function () {
        guest.i.push(newItem(""));
        saveState(); renderGuests(); updateSummary();
      });
      itemsWrap.appendChild(addItem);
      card.appendChild(itemsWrap);
      els.guestList.appendChild(card);
    });
  }

  function countItems() {
    let total = 0;
    state.g.forEach(function (g) {
      g.i.forEach(function (it) { total += (it.q || 1); });
    });
    return total;
  }

  function updateSummary() {
    const loc = (state.l || "").trim() || "No location";
    const items = countItems();
    els.footerSummary.textContent = loc + " \u00b7 " + state.g.length + " customer" + (state.g.length === 1 ? "" : "s") + " \u00b7 " + items + " item" + (items === 1 ? "" : "s");
  }

  function buildPayload() {
    return {
      t: state.t,
      l: (state.l || "").trim(),
      p: (state.p || "").trim(),
      ts: state.ts,
      g: state.g.map(function (g) {
        return {
          n: (g.n || "").trim(),
          i: g.i.filter(function (it) { return (it.d || "").trim() || (it.n || "").trim(); })
              .map(function (it) { return { q: it.q || 1, d: (it.d || "").trim(), n: (it.n || "").trim() }; })
        };
      }).filter(function (g) { return g.i.length; })
    };
  }

  function generateLink() {
    const payload = buildPayload();
    const json = JSON.stringify(payload);
    const compressed = LZString.compressToEncodedURIComponent(json);
    const base = window.location.origin + window.location.pathname.replace("index.html", "");
    return base + "view.html#" + compressed;
  }

  function openModal() {
    const payload = buildPayload();
    if (!payload.g.length) {
      alert("Add at least one customer with an item before generating a QR code.");
      return;
    }
    if (!payload.l) {
      alert("Please enter a table number or location first.");
      return;
    }
    currentShareUrl = generateLink();
    els.modalSummary.textContent = payload.l + " \u00b7 " + payload.g.length + " customer" + (payload.g.length === 1 ? "" : "s") + " \u00b7 " + countItems() + " items";
    els.modalWarning.classList.add("hidden");
    els.qrModal.classList.remove("hidden");

    if (currentShareUrl.length > 2500) {
      els.modalWarning.classList.remove("hidden");
      const ctx = els.qrCanvas.getContext("2d");
      ctx.clearRect(0, 0, els.qrCanvas.width, els.qrCanvas.height);
      return;
    }

    QRCode.toCanvas(els.qrCanvas, currentShareUrl, { width: 280, margin: 2 }, function (err) {
      if (err) {
        els.modalWarning.classList.remove("hidden");
        els.modalWarning.textContent = "Could not generate QR. Use Share or Copy Link instead.";
      }
    });
  }

  function closeModal() { els.qrModal.classList.add("hidden"); }

  function copyLink() {
    if (!currentShareUrl) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentShareUrl).then(function () {
        els.copyLinkBtn.textContent = "Copied!";
        setTimeout(function () { els.copyLinkBtn.textContent = "Copy Link"; }, 1500);
      }).catch(fallbackCopy);
    } else { fallbackCopy(); }
    function fallbackCopy() {
      const ta = document.createElement("textarea");
      ta.value = currentShareUrl;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); els.copyLinkBtn.textContent = "Copied!"; } catch (e) {}
      setTimeout(function () { els.copyLinkBtn.textContent = "Copy Link"; }, 1500);
      document.body.removeChild(ta);
    }
  }

  function shareLink() {
    if (!currentShareUrl) return;
    if (navigator.share) {
      navigator.share({ title: "Order", text: "Order details", url: currentShareUrl }).catch(function () {});
    } else {
      copyLink();
      alert("Sharing is not supported on this browser. Link copied instead.");
    }
  }

  function downloadQr() {
    if (!currentShareUrl) return;
    try {
      const url = els.qrCanvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "order-qr.png";
      a.click();
    } catch (e) { alert("Download not available. Long-press the QR to save it."); }
  }

  // Event wiring
  els.bizType.addEventListener("change", function () {
    state.t = els.bizType.value;
    saveState();
    renderAll();
  });
  els.location.addEventListener("input", function () {
    state.l = els.location.value;
    saveState();
    updateSummary();
  });
  els.paymentNote.addEventListener("input", function () {
    state.p = els.paymentNote.value;
    saveState();
  });
  els.addGuestBtn.addEventListener("click", function () {
    state.g.push(newGuest());
    saveState();
    renderGuests();
    updateSummary();
  });
  els.generateBtn.addEventListener("click", openModal);
  els.closeModal.addEventListener("click", closeModal);
  els.qrModal.addEventListener("click", function (e) { if (e.target === els.qrModal) closeModal(); });
  els.copyLinkBtn.addEventListener("click", copyLink);
  els.shareBtn.addEventListener("click", shareLink);
  els.downloadQrBtn.addEventListener("click", downloadQr);
  els.clearBtn.addEventListener("click", function () {
    if (!confirm("Clear the entire order? This cannot be undone.")) return;
    state = defaultState();
    saveState();
    renderAll();
  });

  renderAll();
})();
