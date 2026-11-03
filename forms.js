/* Voting (vote.html) and questions/suggestions (feedback.html) forms.
   Both post to the Google Apps Script web app in config.js, which appends a row to a Google Sheet. */
(function () {
  "use strict";

  const cfg = window.MNRI_CONFIG || {};
  const posters = window.MNRI_ASSIGNMENTS || {};
  const msg = document.getElementById("form-msg");
  const btn = document.getElementById("submit-btn");

  function showMsg(text) {
    msg.textContent = text;
    msg.hidden = !text;
  }

  // Apps Script web apps do not send CORS headers, so use a no-cors form post (the response is opaque).
  async function send(payload) {
    if (!cfg.SCRIPT_URL) throw new Error("not-configured");
    await fetch(cfg.SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams(payload),
    });
  }

  function wire(form, build) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      showMsg("");
      const result = build();
      if (result.error) return showMsg(result.error);
      btn.disabled = true;
      try {
        const list = result.payloads || [result.payload];
        btn.dataset.label = btn.innerHTML;
        btn.textContent = "Submitting…";
        if (cfg.BATCH_VOTES && list.length > 1 && list[0].sheet === "Votes") {
          // One request for all votes: faster and all-or-nothing (needs the updated Apps Script).
          await send({ sheet: "Votes", name: list[0].name, votes: JSON.stringify(list.map((v) => ({ poster: v.poster, title: v.title, presenter: v.presenter, rating: v.rating }))) });
        } else {
          for (const p of list) await send(p);
        }
        form.hidden = true;
        document.getElementById("form-done").hidden = false;
      } catch (err) {
        showMsg(err.message === "not-configured"
          ? "This form is not connected yet. Please tell an organizer."
          : "Could not send. Check your connection and try again.");
        btn.disabled = false;
        if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
      }
    });
  }

  // ---------- Vote ----------
  const voteForm = document.getElementById("vote-form");
  if (voteForm) {
    const card = document.getElementById("poster-card");
    const listRow = document.getElementById("poster-list-row");
    const list = document.getElementById("poster-list");
    const singleRating = document.getElementById("single-rating");
    // QR codes use ?p=<permanent presenter id>, so they never change when poster positions change.
    // Old ?poster=<board> links still work for boards that are currently assigned.
    const all = window.MNRI_ASSIGNMENTS_FULL || posters;
    const params = new URLSearchParams(window.location.search);
    let posterId = null, entry = null;
    if (params.get("p")) {
      posterId = Object.keys(all).find((k) => all[k].id === params.get("p")) || null;
      entry = posterId ? all[posterId] : null;
    } else if (params.get("poster") && posters[params.get("poster")]) {
      posterId = params.get("poster");
      entry = posters[posterId];
    }

    function showCard(id, a) {
      document.getElementById("poster-card-id").hidden = true;
      document.getElementById("poster-card-title").textContent = a.title;
      document.getElementById("poster-card-presenter").textContent = "Presenter: " + a.presenter;
      const pdf = document.getElementById("poster-card-pdf");
      if (pdf) {
        const has = (window.MNRI_PDFS || []).indexOf(id) !== -1;
        if (has) pdf.href = "posters/" + id + ".pdf";
        pdf.hidden = !has;
      }
      card.hidden = false;
    }

    function esc(s) {
      return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }

    {
      // Collapsed list (presenter + title); tap a row to open/close it and rate inside.
      // A QR link (?p=) shows its poster opened in a separate block just above the name/submit button.
      singleRating.hidden = true;
      card.hidden = true;
      const featured = document.getElementById("poster-featured");
      const pool = Object.assign({}, posters);
      if (entry) pool[posterId] = entry;
      Object.keys(pool).sort((x, y) => pool[x].presenter.localeCompare(pool[y].presenter)).forEach((id) => {
        const p = pool[id];
        const hasPdf = (window.MNRI_PDFS || []).indexOf(id) !== -1;
        const stars = [5, 4, 3, 2, 1].map((n) =>
          '<input type="radio" id="r-' + id + '-' + n + '" name="rate-' + id + '" value="' + n + '">' +
          '<label for="r-' + id + '-' + n + '" title="' + n + ' star' + (n > 1 ? "s" : "") + '">&#9733;</label>').join("");
        const li = document.createElement("li");
        li.className = "poster-list-item";
        li.dataset.id = id;
        li.innerHTML =
          '<button type="button" class="poster-list-head" aria-expanded="false">' +
          '<span class="poster-list-text"><strong>' + esc(p.presenter) + '</strong>' +
          '<span class="poster-list-title">' + esc(p.title) + '</span></span>' +
          '<span class="poster-list-badge" hidden></span></button>' +
          '<div class="poster-list-body" hidden>' +
          (hasPdf ? '<a class="poster-list-pdf" href="posters/' + id + '.pdf" target="_blank" rel="noopener">Open poster PDF &#8599;</a>' : '') +
          '<div class="rating-options">' + stars + '</div></div>';
        const head = li.querySelector(".poster-list-head");
        const body = li.querySelector(".poster-list-body");
        head.addEventListener("click", () => {
          const open = body.hidden;
          body.hidden = !open;
          head.setAttribute("aria-expanded", open ? "true" : "false");
          li.classList.toggle("open", open);
        });
        li.querySelector(".rating-options").addEventListener("change", () => {
          const r = li.querySelector('input[name="rate-' + id + '"]:checked');
          const badge = li.querySelector(".poster-list-badge");
          badge.textContent = "\u2605 " + r.value;
          badge.hidden = false;
          li.classList.add("rated");
        });
        if (entry && id === posterId) {
          body.hidden = false;
          head.setAttribute("aria-expanded", "true");
          li.classList.add("open");
          featured.appendChild(li);
          featured.hidden = false;
        } else {
          list.appendChild(li);
        }
      });
      listRow.hidden = false;
      voteForm.closest(".form-card").classList.add("wide");
    }

    voteForm.elements.name.addEventListener("input", (e) => e.target.classList.remove("invalid"));
    wire(voteForm, () => {
      const nameInput = voteForm.elements.name;
      const name = nameInput.value.trim();
      nameInput.classList.toggle("invalid", !name);
      if (!name) {
        nameInput.focus();
        return { error: "Your name is required. Please enter it before submitting." };
      }
      const payloads = [];
      for (const id of Object.keys(posters).concat(entry ? [posterId] : [])) {
        const r = voteForm.querySelector('input[name="rate-' + id + '"]:checked');
        if (!r) continue;
        const a = id === posterId && entry ? entry : posters[id];
        payloads.push({ sheet: "Votes", poster: a.id, title: a.title, presenter: a.presenter, name, rating: r.value });
      }
      if (!payloads.length) return { error: "Please open a poster and rate it." };
      return { payloads };
    });
  }

  // ---------- Questions & suggestions ----------
  const fbForm = document.getElementById("feedback-form");
  if (fbForm) {
    wire(fbForm, () => {
      const f = fbForm.elements;
      const message = f.message.value.trim();
      if (!message) return { error: "Please write a message." };
      return { payload: { sheet: "Suggestions", kind: f.kind.value, name: f.name.value.trim(), email: f.email.value.trim(), message } };
    });
  }
})();
