/* Privacy-conscious visitor insights for Vjosa Roses Adventure.
   Google Analytics only loads after visitor consent and a configured GA4 Measurement ID.
   This script never reports personal information, email, phone or message text. */
(function(){
 "use strict";
 const required = /^G-[A-Z0-9]{6,16}$/;
 const consentKey="vjosa_analytics_consent_v1";
 const sections=["home","adventures","packages","hospitality","discover","gallery","about","contact"];
 let active=false, gaId="", watched=new WeakSet(), observedSection=new Set(), observedPackages=new Set();
 const byId=id=>document.getElementById(id);
 function send(name,params){
  if(!active || typeof window.gtag!=="function")return;
  window.gtag("event",name,params||{});
 }
 function start(id){
  if(active)return;
  active=true;gaId=id;
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments)};
  window.gtag("js",new Date());
  window.gtag("config",id,{send_page_view:true,anonymize_ip:true});
  const scr=document.createElement("script");scr.async=true;scr.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(id);
  document.head.appendChild(scr);
  send("funnel_home_view",{funnel_stage:"1_home"});
  watch();
  const scrolls=new Set();
  addEventListener("scroll",()=>{
   const doc=document.documentElement;
   const percent=Math.round(((scrollY+innerHeight)/Math.max(doc.scrollHeight,1))*100);
   for(const n of [25,50,75,90])if(percent>=n&&!scrolls.has(n)){scrolls.add(n);send("scroll_depth",{depth_percent:n});}
  },{passive:true});
  document.addEventListener("click",e=>{
    const a=e.target.closest("a");
    if(!a)return;
    const href=a.getAttribute("href")||"";
    if(a.classList.contains("package-book")){
      send("funnel_whatsapp_click",{funnel_stage:"4_whatsapp_click",experience:(a.dataset.package||"").slice(0,90)});
    } else if(href.startsWith("https://wa.me/")){
      send("funnel_whatsapp_click",{funnel_stage:"4_whatsapp_click",experience:"general"});
    } else if(href==="#packages"){
      send("funnel_packages_open",{funnel_stage:"2_packages"});
    }
  },true);
 }
 function watch(){
  if(!("IntersectionObserver" in window))return;
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(!entry.isIntersecting)continue;
    const el=entry.target;
    if(el.dataset.analyticsSection){
      const id=el.dataset.analyticsSection;
      if(!observedSection.has(id)){
       observedSection.add(id);
       send("view_section",{section_name:id,funnel_stage:id==="packages"?"2_packages":id==="contact"?"3_contact":id});
      }
    } else if(el.dataset.analyticsPackage){
      const name=el.dataset.analyticsPackage;
      if(!observedPackages.has(name)){
       observedPackages.add(name);
       send("funnel_package_view",{funnel_stage:"3_package_interest",experience:name.slice(0,90)});
      }
    }
   }
  },{threshold:0.22});
  const bind=()=>{
   for(const id of sections){
    const el=byId(id);
    if(el&&!watched.has(el)){watched.add(el);el.dataset.analyticsSection=id;observer.observe(el);}
   }
   document.querySelectorAll("#package-list .card").forEach(card=>{
    if(watched.has(card))return;
    watched.add(card);
    card.dataset.analyticsPackage=(card.querySelector("h3")?.textContent||"Tour package").trim();
    observer.observe(card);
   });
  };
  bind();
  const list=byId("package-list");
  if(list){new MutationObserver(bind).observe(list,{childList:true});}
 }
 function showConsent(id){
  const bar=document.createElement("aside");
  bar.id="analytics-consent";bar.setAttribute("role","region");bar.setAttribute("aria-label","Visitor analytics preference");
  bar.style.cssText="position:fixed;left:16px;bottom:16px;z-index:10001;max-width:410px;width:calc(100% - 32px);background:#fffaf1;border:1px solid #d4c498;box-shadow:0 8px 35px #03271c35;border-radius:14px;padding:17px;color:#073d29;font:14px/1.55 Arial,sans-serif";
  const p=document.createElement("p");
  p.style.margin="0 0 12px";
  p.textContent="We use optional analytics to understand which tours visitors explore. / Përdorim statistika opsionale për të kuptuar cilat ture shohin vizitorët. Nuk kërkojmë të dhëna personale.";
  const row=document.createElement("div");row.style.cssText="display:flex;gap:10px;flex-wrap:wrap";
  const btn=(label,decision)=>{
   const b=document.createElement("button");b.type="button";b.textContent=label;
   b.style.cssText="border:1px solid #b89a5a;padding:9px 15px;border-radius:24px;cursor:pointer;background:"+(decision==="yes"?"#073d29":"#fff")+";color:"+(decision==="yes"?"#fff":"#073d29");
   b.addEventListener("click",()=>{try{localStorage.setItem(consentKey,decision)}catch{}bar.remove();if(decision==="yes")start(id)});
   return b;
  };
  row.append(btn("Accept / Pranoj","yes"),btn("Decline / Refuzoj","no"));bar.append(p,row);document.body.appendChild(bar);
 }
 fetch("content/site.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(site=>{
  const id=String(site?.analytics_ga4_id||"").trim().toUpperCase();
  if(!required.test(id))return; // Nothing is sent until a real GA4 ID is configured.
  let choice="";try{choice=localStorage.getItem(consentKey)||""}catch{}
  if(choice==="yes")start(id);
  else if(choice!=="no")showConsent(id);
 }).catch(()=>{});
})();