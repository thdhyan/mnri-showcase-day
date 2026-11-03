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
        for (const p of (result.payloads || [result.payload])) await send(p);
        form.hidden = true;
        document.getElementById("form-done").hidden = false;
      } catch (err) {
        showMsg(err.message === "not-configured"
          ? "This form is not connected yet. Please tell an organizer."
          : "Could not send. Check your connection and try again.");
        btn.disabled = false;
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
      document.getElementById("poster-card-id").textContent = posters[id] ? "Poster " + id : "Poster";
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

    if (entry) {
      showCard(posterId, entry);
    } else {
      // No (or unknown) poster in the link: list every poster with a checkbox and a star rating each.
      posterId = null;
      singleRating.hidden = true;
      Object.keys(posters).sort().forEach((id) => {
        const p = posters[id];
        const stars = [5, 4, 3, 2, 1].map((n) =>
          '<input type="radio" id="r-' + id + '-' + n + '" name="rate-' + id + '" value="' + n + '">' +
          '<label for="r-' + id + '-' + n + '" title="' + n + ' star' + (n > 1 ? "s" : "") + '">&#9733;</label>').join("");
        const li = document.createElement("li");
        li.className = "poster-list-item";
        li.dataset.id = id;
        li.innerHTML =
          '<label class="poster-list-check"><input type="checkbox" name="pick" value="' + esc(id) + '">' +
          '<span class="poster-list-text"><strong>' + esc(id) + '</strong> ' + esc(p.title) +
          '<span class="poster-list-presenter">' + esc(p.presenter) + '</span></span></label>' +
          '<div class="rating-options">' + stars + '</div>';
        // Choosing a rating ticks the box automatically.
        li.querySelector(".rating-options").addEventListener("change", () => {
          li.querySelector('input[name="pick"]').checked = true;
        });
        list.appendChild(li);
      });
      listRow.hidden = false;
      voteForm.closest(".form-card").classList.add("wide");
    }

    wire(voteForm, () => {
      const name = voteForm.elements.name.value.trim();
      if (!name) return { error: "Please enter your name." };
      if (entry) {
        const rating = (voteForm.querySelector('input[name="rating"]:checked') || {}).value;
        if (!rating) return { error: "Please choose a rating from 1 to 5." };
        const a = entry;
        return { payloads: [{ sheet: "Votes", poster: a.id, title: a.title, presenter: a.presenter, name, rating }] };
      }
      const payloads = [];
      for (const cb of voteForm.querySelectorAll('input[name="pick"]:checked')) {
        const id = cb.value;
        const r = voteForm.querySelector('input[name="rate-' + id + '"]:checked');
        if (!r) return { error: "Please give a rating to poster " + id + " (or untick it)." };
        const a = posters[id];
        payloads.push({ sheet: "Votes", poster: a.id, title: a.title, presenter: a.presenter, name, rating: r.value });
      }
      if (!payloads.length) return { error: "Please tick at least one poster and rate it." };
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
