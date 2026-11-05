// Envoi d'une contribution vers l'application Google Apps Script de la rédaction.
// Les images sont réduites dans le navigateur (2400 px max, JPEG) avant l'envoi.
// Les messages viennent de window.CDJ_T (traductions FR / PT / EN fournies par Hugo).
(function () {
  const form = document.getElementById("envoi");
  const etat = document.getElementById("etat");
  const T = window.CDJ_T || {};
  const t = (k) => T[k] || k;
  const MAX_FICHIERS = 15;
  const MAX_TOTAL = 40 * 1024 * 1024;

  function lire(file) {
    return new Promise((ok, ko) => {
      const r = new FileReader();
      r.onload = () => ok(r.result);
      r.onerror = ko;
      r.readAsDataURL(file);
    });
  }

  async function reduire(file) {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return lire(file);
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((ok, ko) => {
        const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url;
      });
      const k = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL("image/jpeg", 0.88);
    } catch (e) {
      return lire(file);      // format non lisible par le navigateur (HEIC…) : envoyé tel quel
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const f = new FormData(form);
    if (!f.get("mot").trim()) { etat.textContent = t("js_mot_manque"); return; }
    const fichiers = form.fichiers.files;
    if (!f.get("texte").trim() && fichiers.length === 0) { etat.textContent = t("js_vide"); return; }
    if (fichiers.length > MAX_FICHIERS) { etat.textContent = t("js_trop_fichiers"); return; }
    const bouton = form.querySelector("button");
    bouton.disabled = true;
    etat.textContent = t("js_preparation");
    try {
      const pieces = [];
      let total = 0;
      for (const file of fichiers) {
        const data = await reduire(file);
        total += data.length;
        if (total > MAX_TOTAL) throw new Error("trop lourd");
        pieces.push({ nom: file.name, data });
      }
      etat.textContent = t("js_envoi");
      // contribution de l'IA -> code « I P* a … » (majuscule humain, minuscule IA, * moitié)
      const ia = ["I", "P", "A", "V", "E", "D", "R", "O", "T"].map((l) => {
        const v = f.get("ia_" + l);
        return v === "h" ? l : v === "i" ? l.toLowerCase() : v === "m" ? l + "*" : "";
      }).filter(Boolean).join(" ");
      const corps = {
        ia, langue: window.CDJ_LANGUE || "fr",
        auteur: f.get("auteur"), rubrique: f.get("rubrique"), titre: f.get("titre"),
        texte: f.get("texte"), mot: f.get("mot"), site_web: f.get("site_web"), fichiers: pieces,
      };
      const rep = await fetch(window.CDJ_ENVOI, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },   // évite la requête préalable CORS
        body: JSON.stringify(corps),
      });
      let res;
      try {
        res = await rep.json();
      } catch (e) {
        throw new Error("service");      // réponse non JSON : page de connexion Google, mauvais déploiement
      }
      if (res.ok) {
        form.reset();
        etat.textContent = t("js_merci");
      } else if (res.code === "mot") {
        etat.textContent = t("js_mot_faux");
      } else if (res.code === "limite") {
        etat.textContent = t("js_limite");
      } else {
        etat.textContent = t("js_echec") + (res.detail ? " (" + res.detail + ")" : "");
      }
    } catch (e) {
      etat.textContent = e.message === "trop lourd" ? t("js_trop_lourd")
        : e.message === "service" ? t("js_service")
        : !window.CDJ_ENVOI || window.CDJ_ENVOI.startsWith("REMPLACER") ? t("js_non_configure")
        : t("js_injoignable");
      console.error(e);
    } finally {
      bouton.disabled = false;
    }
  });
})();
