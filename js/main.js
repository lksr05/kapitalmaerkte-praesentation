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

  /* ---- Route im Overview ---- */
  var NS="http://www.w3.org/2000/svg", route=document.getElementById("route"), pts=[];
  order.slice(0,12).forEach(function(id){var e=document.getElementById(id);
    pts.push([+e.getAttribute("data-x"),+e.getAttribute("data-y")]);});
  var pl=document.createElementNS(NS,"polyline");
  pl.setAttribute("points",pts.map(function(p){return p.join(",");}).join(" "));
  pl.setAttribute("fill","none");pl.setAttribute("stroke","#1B2A41");pl.setAttribute("stroke-width","22");
  pl.setAttribute("stroke-dasharray","70 50");pl.setAttribute("opacity",".45");route.appendChild(pl);
  pts.forEach(function(p,i){
    var c=document.createElementNS(NS,"circle");c.setAttribute("cx",p[0]);c.setAttribute("cy",p[1]);c.setAttribute("r",170);
    c.setAttribute("fill","#1B2A41");c.setAttribute("opacity",".9");route.appendChild(c);
    var t=document.createElementNS(NS,"text");t.setAttribute("x",p[0]);t.setAttribute("y",p[1]+75);
    t.setAttribute("text-anchor","middle");t.setAttribute("fill","#fff");
    t.setAttribute("style","font:800 210px system-ui,sans-serif");t.textContent=i+1;route.appendChild(t);
  });

  /* ---- Hochzählen ---- */
  function run(el){
    var to=+el.getAttribute("data-to"), t0=null;
    function f(ts){ if(t0===null)t0=ts; var k=Math.min(1,(ts-t0)/1400); k=1-Math.pow(1-k,3);
      el.textContent=Math.round(to*k); if(k<1)requestAnimationFrame(f);}
    el.textContent="0"; requestAnimationFrame(f);
  }
  function visibleCnt(root){
    root.querySelectorAll(".cnt").forEach(function(c){
      var s=c.closest(".substep"); if(!s||s.classList.contains("substep-visible"))run(c);});
  }
  document.addEventListener("impress:stepenter",function(e){visibleCnt(e.target);});
  new MutationObserver(function(ms){ms.forEach(function(m){
    var t=m.target; if(t.classList.contains("substep-visible")&&!(m.oldValue||"").includes("substep-visible")){
      t.querySelectorAll(".cnt").forEach(run);}});
  }).observe(document.getElementById("impress"),{attributes:true,attributeFilter:["class"],subtree:true,attributeOldValue:true});

  /* ---- Vollbild mit F ---- */
  document.addEventListener("keydown",function(e){
    if(e.key==="f"||e.key==="F"){
      if(!document.fullscreenElement)document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  if(window.impress){ impress().init(); }
})();
