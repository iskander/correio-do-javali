'use strict';
// ===== Langues : FR, EN, NL, PT, ES =====
const LANG={};let LG='fr';
const LANGS=[['fr','Français'],['en','English'],['nl','Nederlands'],['pt','Português'],['es','Español']];
function tr(k){const L=LANG[LG]||{};if(k in L)return L[k];const F=LANG.fr||{};return k in F?F[k]:k;}
function fill(s,v){if(typeof s!=='string')return s;return s.replace(/\{(\w+)\}/g,(m,n)=>v&&v[n]!=null?v[n]:n==='nom'&&typeof S!=='undefined'&&S?S.name:m);}
function tt(k,v){const s=tr(k);return fill(Array.isArray(s)?s[0]:s,v);}
function tl(k,v){const s=tr(k);return(Array.isArray(s)?s:[s]).map(x=>fill(x,v));}
function setLang(l){LG=LANG[l]?l:'fr';document.documentElement.lang=LG;try{localStorage.setItem('cn-lang',LG);}catch(e){}applyStatic();}
function applyStatic(){document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=tt(el.dataset.i18n);});document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',tt(el.dataset.i18nAria)));document.title=tt('ui.title');}
function initLang(){let l=null;try{l=localStorage.getItem('cn-lang');}catch(e){}if(!l||!LANG[l]){const n=((navigator.language||'fr')+'').slice(0,2).toLowerCase();l=LANG[n]?n:'fr';}setLang(l);}
