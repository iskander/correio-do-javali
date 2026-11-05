// Éditeur du formulaire d'envoi : garde gras, italique, listes et intertitres,
// y compris au copier-coller depuis Word ou Google Docs.
// Le texte est converti dans le format texte du journal :
//   **gras**  *italique*  ***les deux***  « ## Intertitre »  « • élément »  « 1. élément »
(function (global) {
  const BLOCS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "TR", "SECTION", "ARTICLE"]);
  const IGNORER = new Set(["SCRIPT", "STYLE", "META", "TITLE", "LINK", "HEAD", "XML", "O:P", "IMG", "SVG"]);

  function etatInline(el, st) {
    let { b, i } = st;
    const tag = el.tagName;
    if (tag === "B" || tag === "STRONG") b = true;
    if (tag === "I" || tag === "EM") i = true;
    const s = el.style || {};
    if (s.fontWeight) {
      const w = s.fontWeight === "bold" || s.fontWeight === "bolder" ? 700
        : s.fontWeight === "normal" || s.fontWeight === "lighter" ? 400 : parseInt(s.fontWeight, 10) || 400;
      b = w >= 600;                       // Google Docs : <b style="font-weight:normal"> n'est pas du gras
    }
    if (s.fontStyle) i = s.fontStyle === "italic" || s.fontStyle === "oblique";
    return { b, i };
  }

  function estListeWord(el) {
    const st = (el.getAttribute && el.getAttribute("style")) || "";
    return /MsoListParagraph/i.test(el.className || "") || /mso-list:\s*l\d/i.test(st);
  }

  // HTML (collé ou tapé) -> liste de blocs {k, runs:[{t,b,i}]}
  function versBlocs(racine) {
    const blocs = [];
    let cur = null;
    const nouveau = (k) => { cur = { k, runs: [] }; blocs.push(cur); return cur; };
    const fermer = () => { cur = null; };

    function marcher(n, st) {
      if (n.nodeType === 3) {
        const t = n.nodeValue.replace(/[\s ]+/g, (m) => (m.includes(" ") ? " " : " "));
        if (!t.trim() && !cur) return;
        (cur || nouveau("p")).runs.push({ t, b: st.b, i: st.i });
        return;
      }
      if (n.nodeType !== 1) return;
      const tag = n.tagName.toUpperCase();
      if (IGNORER.has(tag)) return;
      const style = n.getAttribute("style") || "";
      if (/mso-list:\s*Ignore/i.test(style)) {                // puce ou numéro de Word
        if (cur) cur.numero = /\d/.test(n.textContent);
        return;
      }
      if (tag === "BR") { fermer(); return; }
      if (BLOCS.has(tag)) {
        // <li><p>…</p></li> (Google Docs) : le paragraphe intérieur reste dans l'élément de liste
        if (tag !== "LI" && cur && !cur.runs.length && cur.k !== "p") {
          for (const c of n.childNodes) marcher(c, etatInline(n, st));
          return;
        }
        fermer();
        let k = "p";
        if (/^H[1-6]$/.test(tag)) k = "h";
        else if (tag === "LI") k = n.parentElement && n.parentElement.tagName === "OL" ? "ol" : "ul";
        else if (estListeWord(n)) k = "ul";
        nouveau(k);
        const b = cur;
        for (const c of n.childNodes) marcher(c, etatInline(n, st));
        if (b.k === "ul" && b.numero) b.k = "ol";
        fermer();
        return;
      }
      const st2 = etatInline(n, st);
      for (const c of n.childNodes) marcher(c, st2);
    }
    for (const c of racine.childNodes) marcher(c, { b: false, i: false });
    return blocs.filter((b) => b.runs.some((r) => r.t.trim()));
  }

  function runsVersTexte(runs) {
    // regrouper les morceaux de même style, puis entourer de marques (espaces laissées dehors)
    const g = [];
    for (const r of runs) {
      const t = r.t.replace(/\*/g, "∗");
      const last = g[g.length - 1];
      if (last && last.b === r.b && last.i === r.i) last.t += t; else g.push({ t, b: r.b, i: r.i });
    }
    return g.map(({ t, b, i }) => {
      if (!(b || i) || !t.trim()) return t;
      const m = b && i ? "***" : b ? "**" : "*";
      const debut = t.match(/^\s*/)[0], fin = t.match(/\s*$/)[0];
      return debut + m + t.trim() + m + fin;
    }).join("").replace(/\s+/g, " ").trim();
  }

  function blocsVersTexte(blocs) {
    let num = 0;
    return blocs.map((b) => {
      const t = runsVersTexte(b.runs);
      if (b.k !== "ol") num = 0;
      if (b.k === "h") return "## " + t.replace(/\*/g, "");
      if (b.k === "ul") return "• " + t;
      if (b.k === "ol") return (++num) + ". " + t;
      return t;
    }).filter(Boolean).join("\n");
  }

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function inlineHTML(t) {
    return esc(t)
      .replace(/\*\*\*([^*]+)\*\*\*/g, "<b><i>$1</i></b>")
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/\*([^*\s][^*]*)\*/g, "<i>$1</i>");
  }

  // format texte du journal -> HTML propre pour l'éditeur
  function texteVersHTML(texte) {
    const out = [];
    let liste = null;
    for (const ligne of texte.split("\n")) {
      let m, k = "p", t = ligne;
      if ((m = ligne.match(/^##\s+(.*)$/))) { k = "h"; t = m[1]; }
      else if ((m = ligne.match(/^•\s*(.*)$/))) { k = "ul"; t = m[1]; }
      else if ((m = ligne.match(/^\d{1,2}[.)]\s+(.*)$/))) { k = "ol"; t = m[1]; }
      if (liste && liste !== k) { out.push(`</${liste}>`); liste = null; }
      if (k === "ul" || k === "ol") {
        if (!liste) { out.push(`<${k}>`); liste = k; }
        out.push(`<li>${inlineHTML(t)}</li>`);
      } else if (k === "h") out.push(`<h3>${inlineHTML(t)}</h3>`);
      else out.push(`<p>${inlineHTML(t)}</p>`);
    }
    if (liste) out.push(`</${liste}>`);
    return out.join("");
  }

  function htmlVersTexte(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return blocsVersTexte(versBlocs(doc.body));
  }

  global.CDJ_EDITEUR = { htmlVersTexte, texteVersHTML, versTexte: (el) => blocsVersTexte(versBlocs(el)) };

  // ---- branchement sur la page
  const ed = document.getElementById("editeur");
  if (!ed) return;
  ed.addEventListener("paste", (e) => {
    const cd = e.clipboardData;
    if (!cd) return;
    e.preventDefault();
    const html = cd.getData("text/html");
    const texte = html ? htmlVersTexte(html) : cd.getData("text/plain").replace(/\r/g, "");
    const propre = html ? texteVersHTML(texte) : texteVersHTML(texte.split("\n").map((l) => l.trim()).join("\n"));
    document.execCommand("insertHTML", false, propre);
  });
  document.querySelectorAll(".outils [data-cmd]").forEach((btn) => btn.addEventListener("click", () => {
    const c = btn.dataset.cmd;
    ed.focus();
    if (c === "h3") {
      const cur = document.queryCommandValue("formatBlock").toLowerCase();
      document.execCommand("formatBlock", false, cur === "h3" ? "p" : "h3");
    } else document.execCommand(c, false);
  }));
})(window);
