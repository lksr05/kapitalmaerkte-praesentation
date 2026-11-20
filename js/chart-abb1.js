/* Folie 5: interaktives gestapeltes Säulendiagramm (Portfolios der Versicherer).
   Daten: js/abb1-data.js (erzeugt von scripts/eiopa_abb1.py aus EIOPA-Rohdaten).
   Ohne Daten bleibt das statische Bild abb1.png stehen.

   Bedienung: Hover = Tooltip · Klick auf Legende = Kategorie hervorheben (zweiter Klick hebt auf)
              Schalter = alle Anleihen zusammenfassen · Regler = Quartal */
(function(){
  var A = window.ABB1, wrap = document.getElementById("fig5");
  if(!A || !wrap) return;

  var DEFAULT_Q = "2022 Q4";
  var COLORS = {ek:"#0B66B0", hfpe:"#5B9BD5", ua:"#BCD8EE", anl:"#7A7A7A", sa:"#984A7C",
                immo:"#D8AACB", kred:"#8CBE29", cash:"#CDE3A0", sfonds:"#1E1E1E", sonst:"#A8A8A8"};
  /* Anleihen-Kategorien (liegen im Stapel direkt übereinander) und ihre Zusammenfassung */
  var BOND_KEYS = ["ua","anl","sa"];
  var BONDS = A.categories.map(function(k,j){return BOND_KEYS.indexOf(k.key)>=0 ? j : -1;}).filter(function(j){return j>=0;});
  var BOND_MAIN = BONDS[0];
  var BOND_NAME = "Anleihen gesamt", BOND_COLOR = "#7B5AA6";

  /* Geometrie in Folienpixeln (Figurfläche 1600 × 680) */
  var PLOT_L = 70, PLOT_T = 56, PLOT_H = 440, PLOT_W = 1530, BAR_W = 100;
  var colW = PLOT_W / A.countries.length;

  var nf1 = new Intl.NumberFormat("de-DE",{minimumFractionDigits:1,maximumFractionDigits:1});
  var nf0 = new Intl.NumberFormat("de-DE",{maximumFractionDigits:0});
  function qLabel(q){ var p=q.split(" Q"); return p[1]+". Quartal "+p[0]; }
  function qShort(q){ return q.replace(/(\d+) (Q\d)/,"$2/$1"); }
  function mrd(x){ return (x>=10 ? nf0.format(x) : nf1.format(x))+" Mrd. €"; }
  function el(tag, cls, parent){ var e=document.createElement(tag); if(cls)e.className=cls; if(parent)parent.appendChild(e); return e; }

  wrap.classList.add("chart-on");
  var chart = el("div","chart",wrap);

  /* Kopfzeile: Achsentitel · Schalter · Zurück-Knopf · Quartalswahl */
  var unit = el("div","ch-unit",chart);

  var sw = el("button","ch-switch",chart); sw.type="button"; sw.setAttribute("role","switch");
  el("i","",sw); el("span","",sw).textContent = "Anleihen zusammenfassen";

  var ctl = el("label","ch-ctl",chart);
  el("span","",ctl).textContent = "Quartal";
  var range = el("input","",ctl);
  range.type="range"; range.min=0; range.max=A.quarters.length-1; range.step=1;
  var qOut = el("b","",ctl);
  var reset = el("button","ch-reset",chart); reset.type="button";
  reset.textContent = "↺ "+qShort(DEFAULT_Q);

  /* Raster + Achse */
  var plot = el("div","ch-plot",chart);
  for(var g=0; g<=100; g+=10){
    var line = el("div","ch-grid",plot); line.style.bottom = g+"%";
    el("span","",line).textContent = g;
  }

  /* Säulen */
  var cols = A.countries.map(function(c,i){
    var col = el("div","ch-col",plot);
    if(c.code==="DE") col.classList.add("de");
    col.style.left = (i*colW + (colW-BAR_W)/2)+"px";
    col.style.width = BAR_W+"px";
    var segs = A.categories.map(function(k,j){
      var s = el("div","ch-seg",col);
      s.style.background = COLORS[k.key];
      s.dataset.cat = j; s.dataset.country = i;
      return s;
    });
    var lab = el("div","ch-xlab",chart);
    lab.textContent = c.name;
    lab.style.left = (PLOT_L + i*colW)+"px"; lab.style.width = colW+"px";
    if(c.code==="DE") lab.classList.add("de");
    return {code:c.code, name:c.name, segs:segs};
  });

  /* Legende */
  var legend = el("div","ch-legend",chart);
  var legItems = A.categories.map(function(k,j){
    var it = el("button","ch-leg",legend); it.type="button"; it.dataset.cat=j;
    el("i","",it).style.background = COLORS[k.key];
    el("span","",it).textContent = k.name;
    return it;
  });

  var tip = el("div","ch-tip",chart);

  /* Zustand */
  var qi = 0, merged = false, pinned = null, tipFor = null, shares = [];

  function catName(j){ return (merged && j===BOND_MAIN) ? BOND_NAME : A.categories[j].name; }

  function render(){
    var q = A.quarters[qi]; range.value = qi;
    qOut.textContent = qShort(q);
    unit.textContent = "Kapitalanlagen in %, "+qLabel(q);
    reset.hidden = (q===DEFAULT_Q);
    sw.setAttribute("aria-checked", merged ? "true" : "false");

    /* Legende: bei Zusammenfassung nur ein Eintrag für alle Anleihen */
    legItems.forEach(function(it,j){
      var bond = BONDS.indexOf(j)>=0;
      it.hidden = merged && bond && j!==BOND_MAIN;
      it.querySelector("span").textContent = catName(j);
      it.querySelector("i").style.background = (merged && j===BOND_MAIN) ? BOND_COLOR : COLORS[A.categories[j].key];
    });

    shares = cols.map(function(c){
      var v = A.data[q][c.code].map(function(x){return Math.max(0,x);});
      var tot = v.reduce(function(a,b){return a+b;},0);
      var acc = 0;
      return c.segs.map(function(s,j){
        var abs = v[j], parts = null, bond = BONDS.indexOf(j)>=0;
        if(merged && bond){
          if(j===BOND_MAIN){
            parts = BONDS.map(function(b){return {j:b, abs:v[b]};});
            abs = parts.reduce(function(a,b){return a+b.abs;},0);
          } else abs = 0;
        }
        var p = tot ? abs/tot*100 : 0;
        s.style.bottom = acc+"%"; s.style.height = p+"%";
        s.style.background = (merged && j===BOND_MAIN) ? BOND_COLOR : COLORS[A.categories[j].key];
        var r = {p:p, abs:abs, tot:tot, from:acc, parts:parts}; acc += p; return r;
      });
    });
    if(tipFor) showTip(tipFor[0], tipFor[1]);
    highlight();
  }

  /* Hervorhebung (nur über Klick auf die Legende) */
  function highlight(){
    chart.classList.toggle("hl", pinned!==null);
    cols.forEach(function(c){ c.segs.forEach(function(s,k){ s.classList.toggle("on", k===pinned); }); });
    legItems.forEach(function(it,k){ it.classList.toggle("on", k===pinned); });
  }

  /* Tooltip */
  function showTip(i,j){
    var r = shares[i][j];
    if(!r || r.p<=0){ hideTip(); return; }
    tipFor = [i,j];
    var html = "<b>"+cols[i].name+"</b> · "+catName(j)+"<br><span>"+nf1.format(r.p)+" %</span> · "+mrd(r.abs);
    if(r.parts){
      html += "<small>"+r.parts.map(function(pt){
        return A.categories[pt.j].name+" "+nf1.format(r.tot ? pt.abs/r.tot*100 : 0)+" %";
      }).join("<br>")+"</small>";
    }
    tip.innerHTML = html;
    tip.style.left = (PLOT_L + i*colW + colW/2)+"px";
    tip.style.top = (PLOT_T + PLOT_H*(1-(r.from + r.p/2)/100))+"px";
    tip.classList.toggle("left", i >= cols.length-3);
    tip.classList.add("show");
  }
  function hideTip(){ tipFor = null; tip.classList.remove("show"); }

  plot.addEventListener("mouseover", function(e){
    var s = e.target.closest(".ch-seg"); if(s) showTip(+s.dataset.country, +s.dataset.cat);
  });
  plot.addEventListener("mouseleave", hideTip);

  legend.addEventListener("click", function(e){
    var it = e.target.closest(".ch-leg"); if(!it) return;
    var j = +it.dataset.cat; pinned = (pinned===j) ? null : j;
    highlight(); it.blur();
  });

  /* Schalter: Anleihen zusammenfassen */
  sw.addEventListener("click", function(){
    merged = !merged;
    if(pinned!==null && BONDS.indexOf(pinned)>=0) pinned = merged ? BOND_MAIN : null;
    render(); sw.blur();
  });

  /* Quartalswahl (Maus); Fokus sofort abgeben, damit die Tastatur weiter die Folien steuert */
  range.addEventListener("input", function(){ qi = +range.value; render(); });
  range.addEventListener("change", function(){ range.blur(); });
  reset.addEventListener("click", function(){ qi = Math.max(0, A.quarters.indexOf(DEFAULT_Q)); render(); reset.blur(); });

  /* Beim Betreten der Folie immer mit dem Stand der Abbildung beginnen */
  function defaults(){ qi = Math.max(0, A.quarters.indexOf(DEFAULT_Q)); merged = false; pinned = null; hideTip(); render(); }
  /* reveal.js: Event "slidechanged" blubbert bis zum document */
  document.addEventListener("slidechanged", function(e){ if(e.currentSlide && e.currentSlide.id === "s5") defaults(); });
  defaults();
})();
