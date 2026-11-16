/* One clear publish helper: never pretends to save.
   It looks for Decap's native control, otherwise opens the official editor. */
(()=>{
"use strict";
function text(el){return ((el.getAttribute?.("aria-label")||"")+" "+(el.getAttribute?.("title")||"")+" "+(el.textContent||"")).replace(/\s+/g," ").trim();}
function nativePublish(){
 const nodes=[...document.querySelectorAll("button,[role='button']")];
 return nodes.filter(el=>!el.closest(".helper")&&!el.matches(".vra-publish-helper")&&el.getClientRects().length&&!el.disabled).find(el=>/\b(publish|save|publiko|ruaj)\b/i.test(text(el))&&!/delete|remove|discard/i.test(text(el)));
}
function showMessage(msg){
 let el=document.getElementById("vra-publish-note");
 if(!el){el=document.createElement("div");el.id="vra-publish-note";el.setAttribute("role","status");document.body.appendChild(el)}
 el.textContent=msg;el.hidden=false;
}
function activate(){
 const el=nativePublish();
 if(el){
  el.scrollIntoView({behavior:"smooth",block:"center"});
  el.focus({preventScroll:true});
  // Native Decap confirmation is still necessary.
  el.click();
  showMessage("Kontrollo butonin e Decap që u hap. Nëse shfaqet 'Publish now', kliko për të konfirmuar. Ruajtja nuk konfirmohet derisa Decap ta përfundojë.");
 }else{
  showMessage("Butoni origjinal Publish nuk është i disponueshëm këtu. Ruaj nga shiriti i Decap pasi të ndryshosh një fushë; nëse nuk shfaqet, kontrollo hyrjen me GitHub.");
 }
}
const button=document.createElement("button");
button.type="button";button.className="vra-publish-helper";button.textContent="Gjej Publish";
button.title="Gjen dhe aktivizon butonin zyrtar të Decap; nuk ruan vetë.";
button.addEventListener("click",activate);
document.body.appendChild(button);
function update(){
 button.hidden=!/\/collections\/[^/]+\/(entries|new|edit)/.test(location.hash);
 const note=document.getElementById("vra-publish-note");if(note)note.hidden=true;
}
addEventListener("hashchange",update);update();
})();