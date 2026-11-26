(function () {
  "use strict";
  const content = document.getElementById("slipContent");

  function showError(msg) {
    content.innerHTML = '<p class="empty-hint">' + msg + "</p>";
  }

  function render() {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) { showError("No order data found in this link."); return; }

    let payload;
    try {
      const json = LZString.decompressFromEncodedURIComponent(hash);
      if (!json) throw new Error("empty");
      payload = JSON.parse(json);
    } catch (e) {
      showError("This order link is invalid or was corrupted.");
      return;
    }

    if (!payload || !Array.isArray(payload.g) || !payload.g.length) {
      showError("This order is empty.");
      return;
    }

    const title = document.createElement("h2");
    title.className = "slip-title";
    title.textContent = payload.l || "Order";

    const wrap = document.createElement("div");
    wrap.className = "slip-card";
    wrap.appendChild(title);

    let totalItems = 0;

    payload.g.forEach(function (guest, gi) {
      const g = document.createElement("div");
      g.className = "slip-guest";
      const name = document.createElement("h3");
      name.textContent = guest.n || ("Customer " + (gi + 1));
      g.appendChild(name);

      const ul = document.createElement("ul");
      guest.i.forEach(function (it) {
        totalItems += it.q || 1;
        const li = document.createElement("li");
        let text = (it.q || 1) + " \u00d7 " + (it.d || "Item");
        if (it.n) text += " \u2014 " + it.n;
        li.textContent = text;
        ul.appendChild(li);
      });
      g.appendChild(ul);
      wrap.appendChild(g);
    });

    const totals = document.createElement("div");
    totals.className = "slip-totals";
    totals.innerHTML = "<strong>Total items: " + totalItems + "</strong>" +
      (payload.p ? "<br><span class='pay-note'>" + escapeHtml(payload.p) + "</span>" : "");
    wrap.appendChild(totals);

    content.innerHTML = "";
    content.appendChild(wrap);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.getElementById("printBtn").addEventListener("click", function () { window.print(); });
  document.getElementById("shareSlipBtn").addEventListener("click", function () {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "Order Slip", url: url }).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { alert("Link copied."); }).catch(function () {});
    } else {
      alert("Copy this link manually: " + url);
    }
  });

  window.addEventListener("hashchange", render);
  render();
})();
