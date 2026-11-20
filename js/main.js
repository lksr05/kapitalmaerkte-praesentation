(function(){
  /* ---- Zahnräder erzeugen ---- */
  function gearPath(cx,cy,R,r,n,rotDeg){
    var step=2*Math.PI/n, pts=[], off=rotDeg*Math.PI/180;
    function P(rad,a){return (cx+rad*Math.cos(a+off)).toFixed(1)+","+(cy+rad*Math.sin(a+off)).toFixed(1);}
    for(var i=0;i<n;i++){var a=i*step;
      pts.push(P(r,a-.30*step),P(R,a-.16*step),P(R,a+.16*step),P(r,a+.30*step));}
    var hole=r*0.38;
    return "M"+pts.join("L")+"Z M"+(cx+hole)+","+cy+" A"+hole+","+hole+" 0 1 0 "+(cx-hole)+","+cy+" A"+hole+","+hole+" 0 1 0 "+(cx+hole)+","+cy+"Z";
  }
  document.querySelectorAll("[data-gear]").forEach(function(g){
    var p=g.getAttribute("data-gear").split(","); var NS="http://www.w3.org/2000/svg";
    var path=document.createElementNS(NS,"path");
    path.setAttribute("d",gearPath(+p[0],+p[1],+p[2],+p[3],+p[4],+p[5]));
    path.setAttribute("fill-rule","evenodd");
    path.setAttribute("fill",p[6]); path.setAttribute("stroke",p[7]); path.setAttribute("stroke-width","4");
    path.setAttribute("stroke-linejoin","round");
    g.appendChild(path);
  });

  /* ---- Seitenzahl ---- */
  var order=["s1","s2","s3","s4","s5","s6","s7","s8","s9","s10","s11","s12","s13"];
  order.forEach(function(id,i){
    var el=document.getElementById(id), d=document.createElement("div");
    d.className="pg"; d.textContent=(i+1)+" / "+order.length; el.appendChild(d);
  });

  /* ---- Hochzählen (Zahlen in .cnt laufen beim Erscheinen von 0 hoch) ---- */
  function run(el){
    var to=+el.getAttribute("data-to"), t0=null;
    function f(ts){ if(t0===null)t0=ts; var k=Math.min(1,(ts-t0)/1400); k=1-Math.pow(1-k,3);
      el.textContent=Math.round(to*k); if(k<1)requestAnimationFrame(f);}
    el.textContent="0"; requestAnimationFrame(f);
  }
  function countSlide(slide){
    if(!slide) return;
    slide.querySelectorAll(".cnt").forEach(function(c){
      var fr=c.closest(".fragment"); if(!fr||fr.classList.contains("visible"))run(c);});
  }
  /* reveal.js-Events blubbern bis zum document */
  document.addEventListener("ready",function(e){countSlide(e.currentSlide);});
  document.addEventListener("slidechanged",function(e){countSlide(e.currentSlide);});
  document.addEventListener("fragmentshown",function(e){
    (e.fragments||[e.fragment]).forEach(function(f){f.querySelectorAll(".cnt").forEach(run);});
  });

  /* ---- reveal.js starten ---- */
  Reveal.initialize({
    width:1920, height:1080,
    /* Rand ums Folienblatt: 6 % gesamt, also ca. 3 % je Seite. Im PDF (?print-pdf) ohne Rand,
       sonst würde reveal.js die Seite um diesen Rand vergrößern. */
    margin:/print-pdf/.test(location.search) ? 0 : 0.06,
    minScale:0.05, maxScale:3,
    center:false,
    hash:true,
    controls:false, progress:false, slideNumber:false,   /* eigene Seitenzahl auf jeder Folie */
    transition:"none", backgroundTransition:"none",      /* harter Folienwechsel wie in PowerPoint */
    pdfSeparateFragments:false,                          /* PDF: Folie im Endzustand */
    plugins:[RevealNotes]
  });
})();
