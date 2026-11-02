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
        await send(result.payload);
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
    const selectRow = document.getElementById("poster-select-row");
    const select = document.getElementById("poster-select");
    let posterId = new URLSearchParams(window.location.search).get("poster");

    function showCard(id) {
      const a = posters[id];
      document.getElementById("poster-card-id").textContent = "Poster " + id;
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

    if (posterId && posters[posterId]) {
      showCard(posterId);
    } else {
      // No (or unknown) poster in the link: let the visitor pick one.
      posterId = null;
      Object.keys(posters).sort().forEach((id) => {
        const o = document.createElement("option");
        o.value = id;
        o.textContent = id + " — " + posters[id].title;
        select.appendChild(o);
      });
      selectRow.hidden = false;
    }

    wire(voteForm, () => {
      const id = posterId || select.value;
      const name = voteForm.elements.name.value.trim();
      const rating = (voteForm.querySelector('input[name="rating"]:checked') || {}).value;
      if (!id) return { error: "Please choose a poster." };
      if (!name) return { error: "Please enter your name." };
      if (!rating) return { error: "Please choose a rating from 1 to 5." };
      const a = posters[id];
      return { payload: { sheet: "Votes", poster: id, title: a.title, presenter: a.presenter, name, rating } };
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
