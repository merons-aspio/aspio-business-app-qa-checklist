/**
 * App bootstrap and page wiring.
 *
 * Static test content lives in `src/data/`; screenshot storage and DOM helpers
 * live in `src/lib/`. This file keeps the renderers, event handlers and export
 * flow that tie those modules together.
 */
import "./app.css";
import { initBackend } from "./backend";
import {
  syncBug,
  syncBugDelete,
  syncIssue,
  syncIssueDelete,
  syncLabels,
  syncMeta,
  syncReset,
  syncTest,
} from "./sync";
import { DATA, GRP, GSUB, items } from "./data/checklist";
import { DEVELOP } from "./data/develop";
import { FEAT } from "./data/features";
import { LAST } from "./data/last-week";
import { MARKETPLACE, MGRP, MGSUB } from "./data/marketplace";
import { $, esc, hue, stepsOf } from "./lib/dom";
import {
  addImgs,
  fillThumbs,
  imgCache,
  imgDel,
  imgGet,
  loadAll,
  pastedImages,
  thumbs,
} from "./lib/images";

/* ===== Local state ===== */
const KEY="aspio-qa-checklist-v1";
const ST: readonly string[]=["Passed","Failed","Blocked","Not applicable"];
const LBL: Record<string,string>={"Passed":"Pass","Failed":"Fail","Blocked":"Block","Not applicable":"N/A"};
let saved: any={};try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}
const store=()=>{try{localStorage.setItem(KEY,JSON.stringify(saved))}catch(e){}};
const state=id=>saved[id]||{status:"Not tested",notes:"",done:[]};
const isTouched=id=>{const st=state(id);return st.status!=="Not tested"||(st.done||[]).length>0||!!(st.notes||"").trim()||(st.imgs||[]).length>0};
const put=(id,p)=>{saved[id]={...state(id),...p};store();syncTest(id,saved[id],Object.keys(p))};
const onLists=(t,fn)=>[$("#list"),$("#featList"),$("#lastList"),$("#developList"),$("#marketplaceList")].forEach(L=>L.addEventListener(t,fn));
let f={s:""},mf={s:""},curPage="check",useLast=false,useDevelop=false,useMarketplace=false;
/* ===== Main checklist page ===== */
function card(it){const st=state(it.id),steps=stepsOf(it.steps);
 return `<article class="card" data-id="${esc(it.id)}" data-s="${st.status}"><div class="head" tabindex="0" role="button" aria-expanded="false"><div><span class="id">${esc(it.id)}</span><div class="title">${esc(it.check)}</div><div class="meta"><span>${esc(it.module)}</span><span class="pr ${esc(it.priority)}">${esc(it.priority)}</span><span class="sp"></span></div></div><div class="seg">${ST.map(s=>`<button data-st="${s}" class="${st.status===s?"on":""}" aria-label="${s}" title="${s}">${LBL[s]}</button>`).join("")}</div></div>
 <div class="body"><div class="lbl">Expected result</div><div class="exp">${esc(it.expected)}</div><div class="lbl">Steps</div>${steps.map((x,i)=>`<label class="step"><input type="checkbox" data-i="${i}" ${(st.done||[]).includes(i)?"checked":""}><span>${esc(x)}</span></label>`).join("")}<div class="lbl">Actual result / evidence / defect ID</div><textarea placeholder="What happened? Add a defect ID or evidence link. You can also paste a screenshot here (Ctrl/Cmd+V).">${esc(st.notes)}</textarea><div class="shots">${thumbs(st.imgs||[])}</div><div class="shotbar"><span>Paste a screenshot with Ctrl/Cmd+V, or</span><label class="btn sec sm">Add image<input type="file" accept="image/*" multiple hidden></label></div></div></article>`}
function render(){
 if(curPage==="lastweek"){renderLast();return}
 if(curPage==="develop"){renderDevelop();return}
 const q=$("#q").value.toLowerCase(),m=$("#mod").value,p=$("#pri").value;
 const list=items.filter(c=>(!q||[c.id,c.module,c.check].join(" ").toLowerCase().includes(q))&&(!m||c.module===m)&&(!p||c.priority===p)&&(!f.s||state(c.id).status===f.s));
 $("#shown").textContent=list.length+" of "+items.length+" shown";
 let h="";[0,1,2].forEach(g=>{const a=list.filter(c=>c.grp===g);if(a.length)h+=`<div class="gh"><div><h2>${GRP[g]}</h2></div><span>${GSUB[g]} · ${a.length}</span></div>`+a.map(card).join("")});
 $("#list").innerHTML=h||'<div class="empty">No tests match these filters.</div>';
 document.querySelectorAll<any>(".card").forEach(refreshCard);stats();fillThumbs($("#list"));
}
function refreshCard(el){const id=el.dataset.id,st=state(id),n=el.querySelectorAll(".step").length,d=(st.done||[]).length;
 el.dataset.s=st.status;el.querySelectorAll(".seg button").forEach(b=>b.classList.toggle("on",b.dataset.st===st.status));
 const im=(st.imgs||[]).length,by=st.updatedBy?String(st.updatedBy).split("@")[0]:"",sp=el.querySelector(".sp");
 sp.textContent=[n>1?d+"/"+n+" steps":"",im?im+" screenshot"+(im>1?"s":""):"",by?"by "+by:""].filter(Boolean).join(" · ");
 sp.title=st.updatedBy?"Last updated by "+st.updatedBy:"";
 el.classList.toggle("need",st.status==="Failed"&&!st.notes.trim()&&!im)}
function stats(){fstats();
 const cnt: Record<string, number>={};items.forEach(c=>{const s=state(c.id).status;cnt[s]=(cnt[s]||0)+1});
 const T=items.length,nt=cnt["Not tested"]||0,done=T-nt;
 $("#pct").textContent=Math.round(done/T*100)+"%";$("#doneTxt").textContent=done+" of "+T+" tested";
 [["tp","Passed"],["tf","Failed"],["tb","Blocked"],["tn","Not applicable"]].forEach(([i,s])=>$("#"+i).style.width=((cnt[s]||0)/T*100)+"%");
 const defs=[["","All",T,"var(--pur)"],["Not tested","To do",nt,"var(--line)"],["Passed","Passed",cnt.Passed||0,"var(--pass)"],["Failed","Failed",cnt.Failed||0,"var(--fail)"],["Blocked","Blocked",cnt.Blocked||0,"var(--blk)"]];
 $("#chips").innerHTML=defs.map(d=>`<button class="chip" data-f="${d[0]}" aria-pressed="${f.s===d[0]}"><span class="dotc" style="background:${d[3]}"></span>${d[1]} <b>${d[2]}</b></button>`).join("");
 const bad=items.filter(c=>c.grp===0&&["Failed","Blocked"].includes(state(c.id).status)).length,w=$("#warn");
 w.classList.toggle("show",bad>0);w.textContent="Release blocked: "+bad+" Critical sign-off check"+(bad>1?"s are":" is")+" Failed or Blocked."}
function open(el,on){el.classList.toggle("open",on);el.querySelector(".head").setAttribute("aria-expanded",on)}
function setStatus(el,s){const id=el.dataset.id,was=el.classList.contains("open"),cur=state(id).status,next=cur===s?"Not tested":s;
 put(id,{status:next});refreshCard(el);stats();
 if(next==="Failed"){open(el,true);const t=el.querySelector("textarea");t.focus({preventScroll:true})}
 else if(next==="Passed"&&was){open(el,false);goNext(el)}}
function goNext(from){let n=from?from.nextElementSibling:document.querySelector<any>("#list .card");
 for(;n;n=n.nextElementSibling)if(n.classList.contains("card")&&n.dataset.s==="Not tested")break;
 if(!n&&from){return from.parentElement.id==="list"?goNext(null):void 0}
 if(n){open(n,true);n.scrollIntoView({behavior:"smooth",block:"center"})}else if(!from)alert("Nothing left to test in this view. Nice work!")}
function setLastStatus(el,s){const id=el.dataset.id,was=el.classList.contains("open"),cur=state(id).status,next=cur===s?"Not tested":s;
 put(id,{status:next});refreshCard(el);lstats();
 if(next==="Failed"){open(el,true);const t=el.querySelector("textarea");t.focus({preventScroll:true})}
 else if(next==="Passed"&&was){open(el,false);lNext(el)}}
function lNext(from){let n=from?from.nextElementSibling:document.querySelector<any>("#lastList .card");
 for(;n;n=n.nextElementSibling)if(n.classList.contains("card")&&n.dataset.s==="Not tested")break;
 if(!n&&from){return from.parentElement.id==="lastList"?lNext(null):void 0}
 if(n){open(n,true);n.scrollIntoView({behavior:"smooth",block:"center"})}else if(!from)alert("All last-week checks are done. Nice work!")}
function setDevelopStatus(el,s){const id=el.dataset.id,was=el.classList.contains("open"),cur=state(id).status,next=cur===s?"Not tested":s;
 put(id,{status:next});refreshCard(el);dstats();
 if(next==="Failed"){open(el,true);const t=el.querySelector("textarea");t.focus({preventScroll:true})}
 else if(next==="Passed"&&was){open(el,false);dNext(el)}}
function dNext(from){let n=from?from.nextElementSibling:document.querySelector<any>("#developList .card");
 for(;n;n=n.nextElementSibling)if(n.classList.contains("card")&&n.dataset.s==="Not tested")break;
 if(!n&&from){return from.parentElement.id==="developList"?dNext(null):void 0}
 if(n){open(n,true);n.scrollIntoView({behavior:"smooth",block:"center"})}else if(!from)alert("All develop checks are done. Nice work!")}
onLists("click",e=>{const el=e.target.closest(".card");if(!el)return;const b=e.target.closest("[data-st]");
 if(b){if(el.closest("#developList")){setDevelopStatus(el,b.dataset.st);return}if(el.closest("#lastList")){setLastStatus(el,b.dataset.st);return}if(el.closest("#marketplaceList")){setMarketplaceStatus(el,b.dataset.st);return}setStatus(el,b.dataset.st);return}
 if(e.target.closest(".body"))return;open(el,!el.classList.contains("open"))});
onLists("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.classList.contains("head")){e.preventDefault();const el=e.target.closest(".card");open(el,!el.classList.contains("open"))}});
onLists("change",e=>{if(!e.target.matches(".step input"))return;const el=e.target.closest(".card"),id=el.dataset.id,i=+e.target.dataset.i;
 const d=new Set(state(id).done||[]);e.target.checked?d.add(i):d.delete(i);put(id,{done:[...d]});refreshCard(el)});
onLists("input",e=>{if(!e.target.matches("textarea"))return;const el=e.target.closest(".card");put(el.dataset.id,{notes:e.target.value});refreshCard(el)});
$("#chips").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;f.s=f.s===b.dataset.f?"":b.dataset.f;render()});
$("#mchips").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;mf.s=mf.s===b.dataset.mf?"":b.dataset.mf;renderMarketplace()});
["#q","#mod","#pri"].forEach(s=>$(s).addEventListener("input",render));
["#mq","#mmod","#mpri"].forEach(s=>$(s).addEventListener("input",renderMarketplace));
[...new Set(DATA.cases.map(c=>c.module))].sort().forEach(m=>{const o=document.createElement("option");o.textContent=m;$("#mod").appendChild(o)});
const root=document.documentElement;
function applyTheme(t){root.dataset.theme=t;$("#theme").textContent=t==="dark"?"☀ Light mode":"☾ Dark mode";$("#theme").setAttribute("aria-label","Switch to "+(t==="dark"?"light":"dark")+" mode")}
let th=null;try{th=localStorage.getItem("aspio-qa-theme")}catch(e){}
applyTheme(th||"light");
$("#theme").onclick=()=>{const t=root.dataset.theme==="dark"?"light":"dark";applyTheme(t);try{localStorage.setItem("aspio-qa-theme",t)}catch(e){}};
$("#next").onclick=()=>goNext(null);
let all=false;$("#toggleAll").onclick=()=>{all=!all;document.querySelectorAll<any>(".card").forEach(c=>open(c,all));$("#toggleAll").textContent=all?"Collapse all":"Expand all"};
/* ===== Screenshot capture + lightbox ===== */
async function attach(el,files){const id=el.dataset.id,ids=await addImgs(files);if(!ids.length)return;
 put(id,{imgs:[...(state(id).imgs||[]),...ids]});const box=el.querySelector(".shots");box.insertAdjacentHTML("beforeend",thumbs(ids));fillThumbs(box);refreshCard(el)}
onLists("paste",e=>{const ta=e.target.closest&&e.target.closest(".card textarea");if(!ta)return;const p=pastedImages(e);if(!p.files.length)return;if(!p.hasText)e.preventDefault();attach(ta.closest(".card"),p.files)});
onLists("change",async e=>{if(!e.target.matches(".shotbar input[type=file]"))return;const f=[...e.target.files];e.target.value="";await attach(e.target.closest(".card"),f)});
const showLb=url=>{$("#lbimg").src=url;$("#lb").hidden=false};
$("#lb").onclick=()=>{$("#lb").hidden=true};
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#lb").hidden=true});
document.addEventListener("click",async e=>{
 const rm=(e.target as any).closest&&(e.target as any).closest("[data-rm]"),zoom=(e.target as any).closest&&(e.target as any).closest("img[data-lb]");
 if(rm){const id=rm.dataset.rm,el=rm.closest(".card");
  if(el){put(el.dataset.id,{imgs:(state(el.dataset.id).imgs||[]).filter(x=>x!==id)});rm.closest(".shot").remove();refreshCard(el)}
  else if(rm.closest("#xShots")){xImgs=xImgs.filter(x=>x!==id);rm.closest(".shot").remove()}
  else if(rm.closest("#fiShots")){fiImgs=fiImgs.filter(x=>x!==id);rm.closest(".shot").remove()}
  imgDel(id);return}
 if(zoom){const o=await imgGet(zoom.dataset.lb);if(o)showLb(o.url)}});
/* ===== Other bugs (temporary, not in checklist) ===== */
const XK="aspio-qa-extra";let extra=[],editId=null,xImgs=[];
try{extra=JSON.parse(localStorage.getItem(XK)||"[]")}catch(e){}
const storeX=()=>{try{localStorage.setItem(XK,JSON.stringify(extra))}catch(e){}};
const xv=id=>$("#"+id).value.trim();
function drawExtra(){
 $("#xCount").textContent=(extra.length?extra.length+" logged":"Not in the checklist")+" · saved temporarily in this browser";
 $("#xClear").hidden=!extra.length;
 $("#xList").innerHTML=extra.map((b,i)=>`<div class="xb"><div class="xh"><span class="sev ${esc(b.sev)}">${esc(b.sev)}</span><b>${esc(b.title)}</b><button class="btn out" type="button" data-xe="${esc(b.id)}">Edit</button><button class="btn out" type="button" data-xd="${esc(b.id)}">Delete</button></div><small>BUG-${i+1}${b.area?" · "+esc(b.area):""}${b.link?" · "+esc(b.link):""}</small>${b.steps?`<div class="xs">${esc(b.steps)}</div>`:""}<div class="shots">${thumbs(b.imgs||[],false)}</div></div>`).join("");fillThumbs($("#xList"))}
function clearX(){editId=null;xImgs=[];$("#xShots").innerHTML="";["xTitle","xArea","xSteps","xExp","xAct","xLink"].forEach(i=>$("#"+i).value="");$("#xSev").value="High";$("#xAdd").textContent="Add bug";$("#xCancel").hidden=true}
function addX(){const t=xv("xTitle");if(!t){$("#xTitle").style.borderColor="var(--fail)";$("#xTitle").focus();return}
 $("#xTitle").style.borderColor="";
 const b={id:editId||("x"+Date.now()),title:t,sev:$("#xSev").value,area:xv("xArea"),steps:xv("xSteps"),exp:xv("xExp"),act:xv("xAct"),link:xv("xLink"),imgs:[...xImgs]};
 if(editId)extra=extra.map(x=>x.id===editId?b:x);else extra.push(b);
 storeX();clearX();drawExtra();syncBug(b)}
$("#xAdd").onclick=addX;$("#xCancel").onclick=clearX;
$("#xTitle").addEventListener("keydown",e=>{if(e.key==="Enter")addX()});
$("#xList").addEventListener("click",e=>{const d=e.target.closest("[data-xd]"),ed=e.target.closest("[data-xe]");
 if(d){const gone=extra.find(x=>x.id===d.dataset.xd);((gone&&gone.imgs)||[]).forEach(imgDel);extra=extra.filter(x=>x.id!==d.dataset.xd);if(editId===d.dataset.xd)clearX();storeX();drawExtra();syncBugDelete(d.dataset.xd)}
 if(ed){const b=extra.find(x=>x.id===ed.dataset.xe);if(!b)return;editId=b.id;
  $("#xTitle").value=b.title;$("#xSev").value=b.sev;$("#xArea").value=b.area;$("#xSteps").value=b.steps;$("#xExp").value=b.exp;$("#xAct").value=b.act;$("#xLink").value=b.link;
  xImgs=[...(b.imgs||[])];$("#xShots").innerHTML=thumbs(xImgs);fillThumbs($("#xShots"));$("#xAdd").textContent="Save changes";$("#xCancel").hidden=false;$("#xTitle").scrollIntoView({behavior:"smooth",block:"center"});$("#xTitle").focus()}});
$("#xClear").onclick=()=>{if(confirm("Remove all "+extra.length+" extra bugs logged here?")){extra.forEach(b=>{((b.imgs)||[]).forEach(imgDel);syncBugDelete(b.id)});extra=[];storeX();clearX();drawExtra()}};
async function xAttach(files){const ids=await addImgs(files);if(!ids.length)return;xImgs.push(...ids);$("#xShots").insertAdjacentHTML("beforeend",thumbs(ids));fillThumbs($("#xShots"))}
$("#xPanel").addEventListener("paste",e=>{const p=pastedImages(e);if(!p.files.length)return;if(!p.hasText)e.preventDefault();xAttach(p.files)});
$("#xFile").onchange=async e=>{const f=[...e.target.files];e.target.value="";await xAttach(f)};
drawExtra();
const xOn=()=>extra.length>0&&$("#useX").checked;
const xrows=()=>extra.map((b,i)=>({id:"BUG-"+(i+1),module:b.area||"Not specified",check:b.title,priority:b.sev,status:"New bug",steps:b.steps?b.steps.split(/\n+/).map(s=>s.trim()).filter(Boolean):["(none given)"],expected:b.exp||"(not provided)",notes:[b.act?"Actual: "+b.act:"",b.link?"Evidence / ticket: "+b.link:""].filter(Boolean).join("\n"),group:"Additional bugs (not in checklist)",imgs:b.imgs||[]}));
[...new Set(MARKETPLACE.map(c=>c.module))].sort().forEach(m=>{const o=document.createElement("option");o.textContent=m;$("#mmod").appendChild(o)});
$("#xAreas").innerHTML=[...new Set([...DATA.cases.map(c=>c.module),...LAST.map(c=>c.module),...DEVELOP.map(c=>c.module),...MARKETPLACE.map(c=>c.module)])].sort().map(m=>`<option value="${esc(m)}">`).join("");

/* ===== New features page ===== */
function drawFeatList(){$("#featList").innerHTML=FEAT.map(card).join("");document.querySelectorAll<any>("#featList .card").forEach(refreshCard);fillThumbs($("#featList"))}
function fstats(){const c: Record<string, number>={};FEAT.forEach(i=>{const s=state(i.id).status;c[s]=(c[s]||0)+1});const T=FEAT.length,dn=T-(c["Not tested"]||0);
 $("#fpct").textContent=Math.round(dn/T*100)+"%";$("#fdone").textContent=dn+" of "+T+" checked";
 [["fp","Passed"],["ff","Failed"],["fb","Blocked"],["fn","Not applicable"]].forEach(([i,s])=>$("#"+i).style.width=((c[s]||0)/T*100)+"%")}
function lstats(){const c: Record<string, number>={};LAST.forEach(i=>{const s=state(i.id).status;c[s]=(c[s]||0)+1});const T=LAST.length,dn=T-(c["Not tested"]||0);
 $("#lpct").textContent=Math.round(dn/T*100)+"%";$("#ldone").textContent=dn+" of "+T+" tested";
 [["lp","Passed"],["lf","Failed"],["lblock","Blocked"],["ln","Not applicable"]].forEach(([i,s])=>$("#"+i).style.width=((c[s]||0)/T*100)+"%")}
function renderLast(){
 const list=LAST;
 const groups: Record<string, any[]>={};list.forEach(c=>{if(!groups[c.module])groups[c.module]=[];groups[c.module].push(c)});
 let h="";
 for(const [mod,cs] of Object.entries(groups)){
   h+=`<div class="gh"><div><h2>${esc(mod)}</h2></div><span>${cs.length}</span></div>`+cs.map(card).join("");
 }
 $("#lastList").innerHTML=h||'<div class="empty">No tests match these filters.</div>';
 document.querySelectorAll<any>("#lastList .card").forEach(refreshCard);lstats();fillThumbs($("#lastList"))}
function dstats(){const c: Record<string, number>={};DEVELOP.forEach(i=>{const s=state(i.id).status;c[s]=(c[s]||0)+1});const T=DEVELOP.length,dn=T-(c["Not tested"]||0);
 $("#dpct").textContent=Math.round(dn/T*100)+"%";$("#ddone").textContent=dn+" of "+T+" tested";
 [["dp","Passed"],["df","Failed"],["db","Blocked"],["dn","Not applicable"]].forEach(([i,s])=>$("#"+i).style.width=((c[s]||0)/T*100)+"%")}
function renderDevelop(){
 const list=DEVELOP;
 const groups: Record<string, any[]>={};list.forEach(c=>{if(!groups[c.module])groups[c.module]=[];groups[c.module].push(c)});
 let h="";
 for(const [mod,cs] of Object.entries(groups)){
   h+=`<div class="gh"><div><h2>${esc(mod)}</h2></div><span>${cs.length}</span></div>`+cs.map(card).join("");
 }
 $("#developList").innerHTML=h||'<div class="empty">No tests match these filters.</div>';
 document.querySelectorAll<any>("#developList .card").forEach(refreshCard);dstats();fillThumbs($("#developList"))}
function mstats(){const c: Record<string, number>={};MARKETPLACE.forEach(i=>{const s=state(i.id).status;c[s]=(c[s]||0)+1});const T=MARKETPLACE.length,dn=T-(c["Not tested"]||0);
  $("#mpct").textContent=Math.round(dn/T*100)+"%";$("#mdone").textContent=dn+" of "+T+" tested";
  [["mp","Passed"],["mf","Failed"],["mb","Blocked"],["mn","Not applicable"]].forEach(([i,s])=>$("#"+i).style.width=((c[s]||0)/T*100)+"%");
  const defs=[["","All",T,"var(--pur)"],["Not tested","To do",c["Not tested"]||0,"var(--line)"],["Passed","Passed",c.Passed||0,"var(--pass)"],["Failed","Failed",c.Failed||0,"var(--fail)"],["Blocked","Blocked",c.Blocked||0,"var(--blk)"]];
  $("#mchips").innerHTML=defs.map(d=>`<button class="chip" data-mf="${d[0]}" aria-pressed="${mf.s===d[0]}"><span class="dotc" style="background:${d[3]}"></span>${d[1]} <b>${d[2]}</b></button>`).join("")}
function renderMarketplace(){
  const q=$("#mq").value.toLowerCase(),m=$("#mmod").value,p=$("#mpri").value;
  const list=MARKETPLACE.filter(c=>(!q||[c.id,c.module,c.check].join(" ").toLowerCase().includes(q))&&(!m||c.module===m)&&(!p||c.priority===p)&&(!mf.s||state(c.id).status===mf.s));
  $("#mshown").textContent=list.length+" of "+MARKETPLACE.length+" shown";
  let h="";
  MGRP.forEach((g,idx)=>{
    const a=list.filter(c=>c.module==="Marketplace \u00b7 "+g);
    if(a.length)h+=`<div class="gh"><div><h2>${esc(g)}</h2></div><span>${MGSUB[idx]} \u00b7 ${a.length}</span></div>`+a.map(card).join("");
  });
  $("#marketplaceList").innerHTML=h||'<div class="empty">No tests match these filters.</div>';
  document.querySelectorAll<any>("#marketplaceList .card").forEach(refreshCard);mstats();fillThumbs($("#marketplaceList"))}
function setMarketplaceStatus(el,s){const id=el.dataset.id,was=el.classList.contains("open"),cur=state(id).status,next=cur===s?"Not tested":s;
  put(id,{status:next});refreshCard(el);mstats();
  if(next==="Failed"){open(el,true);const t=el.querySelector("textarea");t.focus({preventScroll:true})}
  else if(next==="Passed"&&was){open(el,false);mNext(el)}}
function mNext(from){let n=from?from.nextElementSibling:document.querySelector<any>("#marketplaceList .card");
  for(;n;n=n.nextElementSibling)if(n.classList.contains("card")&&n.dataset.s==="Not tested")break;
  if(!n&&from){return from.parentElement.id==="marketplaceList"?mNext(null):void 0}
  if(n){open(n,true);n.scrollIntoView({behavior:"smooth",block:"center"})}else if(!from)alert("All marketplace checks are done. Nice work!")}

$("#fNext").onclick=()=>{const n=document.querySelector<any>('#featList .card[data-s="Not tested"]');if(n){open(n,true);n.scrollIntoView({behavior:"smooth",block:"center"})}else alert("All feature checks are done. Nice work!")};
$("#exp2").onclick=()=>openExp();
try{$("#fName").value=localStorage.getItem("aspio-qa-fname")||""}catch(e){}
$("#fName").addEventListener("input",()=>{try{localStorage.setItem("aspio-qa-fname",$("#fName").value)}catch(e){};syncMeta("featureName",$("#fName").value)});

/* Labels + issues log */
const LK="aspio-qa-labels",FK="aspio-qa-fissues";
let LAB=null;try{LAB=JSON.parse(localStorage.getItem(LK))}catch(e){}
if(!Array.isArray(LAB))LAB=["Bug","Content issue","UI / UX","Typo","Idea"];
let fIssues=[];try{fIssues=JSON.parse(localStorage.getItem(FK)||"[]")}catch(e){}if(!Array.isArray(fIssues))fIssues=[];
const persistL=()=>{try{localStorage.setItem(LK,JSON.stringify(LAB))}catch(e){}};
const saveL=()=>{persistL();syncLabels(LAB)},saveF=()=>{try{localStorage.setItem(FK,JSON.stringify(fIssues))}catch(e){}};
let fiSel=[],fiImgs=[],fiEdit=null,fiFilt="",manage=false;
const labChip=l=>`<span class="lab" style="--h:${hue(l)}">${esc(l)}</span>`;
function addLabel(raw){const n=String(raw).replace(/\s+/g," ").trim().slice(0,24);if(!n)return null;
 const ex=LAB.find(l=>l.toLowerCase()===n.toLowerCase()),name=ex||n;if(!ex){LAB.push(name);saveL()}if(!fiSel.includes(name))fiSel.push(name);return name}
function drawLib(){
 $("#fiLib").innerHTML=LAB.map(l=>`<button type="button" class="lab" style="--h:${hue(l)}" data-lab="${esc(l)}" aria-pressed="${fiSel.includes(l)}">${esc(l)}${manage?`<span class="ld" data-labdel="${esc(l)}" title="Delete label">✕</span>`:""}</button>`).join("")||'<span class="mut">No labels yet. Create one below.</span>';
 $("#fiManage").textContent=manage?"Done":"Manage labels"}
function drawFeat(){
 drawLib();
 const used={};fIssues.forEach(b=>b.labels.forEach(l=>used[l]=(used[l]||0)+1));
 if(fiFilt&&!used[fiFilt])fiFilt="";
 $("#fiCount").textContent=(fIssues.length?fIssues.length+" logged":"Nothing logged yet")+" · saved temporarily in this browser";
 const names=[...new Set([...LAB.filter(l=>used[l]),...Object.keys(used)])];
 $("#fiFilter").innerHTML=fIssues.length?`<button class="chip" type="button" data-ff="" aria-pressed="${fiFilt===""}">All <b>${fIssues.length}</b></button>`+names.map(l=>`<button class="chip" type="button" data-ff="${esc(l)}" aria-pressed="${fiFilt===l}"><span class="dotc" style="background:hsl(${hue(l)} 65% 48%)"></span>${esc(l)} <b>${used[l]}</b></button>`).join(""):"";
 const list=fIssues.map((b,i)=>({b,i})).filter(o=>!fiFilt||o.b.labels.includes(fiFilt)).reverse();
 $("#fiList").innerHTML=list.map(({b,i})=>`<div class="xb"><div class="xh"><span class="sev ${esc(b.sev)}">${esc(b.sev)}</span><b>${esc(b.title)}</b><button class="btn out" type="button" data-fe="${esc(b.id)}">Edit</button><button class="btn out" type="button" data-fd="${esc(b.id)}">Delete</button></div>${b.labels.length?`<div class="labs">${b.labels.map(labChip).join("")}</div>`:""}<small>ISSUE-${i+1}${b.link?" · "+esc(b.link):""}</small>${b.details?`<div class="xs">${esc(b.details)}</div>`:""}<div class="shots">${thumbs(b.imgs||[],false)}</div></div>`).join("")||(fIssues.length?'<div class="empty">No items with this label.</div>':"");
 fillThumbs($("#fiList"))}
function resetFi(){fiEdit=null;fiImgs=[];fiSel=[];["fiTitle","fiDetails","fiLink"].forEach(i=>$("#"+i).value="");$("#fiSev").value="Medium";$("#fiShots").innerHTML="";$("#fiAdd").textContent="Add to log";$("#fiCancel").hidden=true;drawLib()}
function saveFi(){const t=$("#fiTitle").value.trim();if(!t){$("#fiTitle").style.borderColor="var(--fail)";$("#fiTitle").focus();return}
 $("#fiTitle").style.borderColor="";
 const b={id:fiEdit||("f"+Date.now()),title:t,details:$("#fiDetails").value.trim(),sev:$("#fiSev").value,link:$("#fiLink").value.trim(),labels:[...fiSel],imgs:[...fiImgs]};
 if(fiEdit)fIssues=fIssues.map(x=>x.id===fiEdit?b:x);else fIssues.push(b);
 saveF();resetFi();drawFeat();syncIssue(b)}
$("#fiAdd").onclick=saveFi;$("#fiCancel").onclick=resetFi;
$("#fiTitle").addEventListener("keydown",e=>{if(e.key==="Enter")saveFi()});
$("#fiLib").addEventListener("click",e=>{const d=e.target.closest("[data-labdel]");
 if(d){const l=d.dataset.labdel;LAB=LAB.filter(x=>x!==l);fiSel=fiSel.filter(x=>x!==l);saveL();drawLib();return}
 const b=e.target.closest("[data-lab]");if(!b)return;const l=b.dataset.lab;fiSel=fiSel.includes(l)?fiSel.filter(x=>x!==l):[...fiSel,l];drawLib()});
const makeLab=()=>{const i=$("#fiNewLab");i.value.split(",").forEach(addLabel);i.value="";drawLib()};
$("#fiAddLab").onclick=makeLab;
$("#fiNewLab").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();makeLab()}});
$("#fiManage").onclick=()=>{manage=!manage;drawLib()};
$("#fiFilter").addEventListener("click",e=>{const b=e.target.closest("[data-ff]");if(!b)return;fiFilt=b.dataset.ff===fiFilt?"":b.dataset.ff;drawFeat()});
$("#fiList").addEventListener("click",e=>{const d=e.target.closest("[data-fd]"),ed=e.target.closest("[data-fe]");
 if(d){const g=fIssues.find(x=>x.id===d.dataset.fd);((g&&g.imgs)||[]).forEach(imgDel);fIssues=fIssues.filter(x=>x.id!==d.dataset.fd);if(fiEdit===d.dataset.fd)resetFi();saveF();drawFeat();syncIssueDelete(d.dataset.fd)}
 if(ed){const b=fIssues.find(x=>x.id===ed.dataset.fe);if(!b)return;
  b.labels.forEach(l=>{if(!LAB.some(x=>x.toLowerCase()===l.toLowerCase())){LAB.push(l);saveL()}});
  fiEdit=b.id;$("#fiTitle").value=b.title;$("#fiDetails").value=b.details||"";$("#fiSev").value=b.sev;$("#fiLink").value=b.link||"";fiSel=[...b.labels];fiImgs=[...(b.imgs||[])];
  $("#fiShots").innerHTML=thumbs(fiImgs);fillThumbs($("#fiShots"));$("#fiAdd").textContent="Save changes";$("#fiCancel").hidden=false;drawLib();
  $("#fiTitle").scrollIntoView({behavior:"smooth",block:"center"});$("#fiTitle").focus()}});
async function fiAttach(files){const ids=await addImgs(files);if(!ids.length)return;fiImgs.push(...ids);$("#fiShots").insertAdjacentHTML("beforeend",thumbs(ids));fillThumbs($("#fiShots"))}
$("#fiPanel").addEventListener("paste",e=>{const p=pastedImages(e);if(!p.files.length)return;if(!p.hasText)e.preventDefault();fiAttach(p.files)});
$("#fiFile").onchange=async e=>{const f=[...e.target.files];e.target.value="";await fiAttach(f)};
/* ===== Export row builders ===== */
const fOn=()=>$("#useFeat").checked;
const exportOnlyTouched=()=>$("#onlyTouched").checked;
const statusOk=id=>SCOPES.find(s=>s[0]===scope)![2](state(id).status);
const includeRow=id=>statusOk(id)&&(!exportOnlyTouched()||isTouched(id));
const frows=()=>{const lab=$("#expLabel").value;
 const c=FEAT.filter(i=>includeRow(i.id)).map(i=>({id:i.id,module:i.module,check:i.check,priority:i.priority,status:state(i.id).status,steps:stepsOf(i.steps),expected:i.expected,notes:(state(i.id).notes||"").trim(),group:"New feature checklist",imgs:state(i.id).imgs||[],labels:[]}));
 const q=fIssues.map((b,i)=>({b,i})).filter(o=>!lab||o.b.labels.includes(lab)).map(({b,i})=>({id:"ISSUE-"+(i+1),module:"New feature issue",check:b.title,priority:b.sev,status:"Issue",steps:[],expected:"",nlabel:"DETAILS",notes:[b.details,b.link?"Evidence / ticket: "+b.link:""].filter(Boolean).join("\n"),group:"New feature issues",imgs:b.imgs||[],labels:b.labels||[]}));
 return [...c,...q]};
const lrows=()=>LAST.filter(i=>includeRow(i.id)).map(i=>({id:i.id,module:i.module,check:i.check,priority:i.priority,status:state(i.id).status,steps:stepsOf(i.steps),expected:i.expected,notes:(state(i.id).notes||"").trim(),group:"Last week's changes",imgs:state(i.id).imgs||[],labels:[]}));
const drows=()=>DEVELOP.filter(i=>includeRow(i.id)).map(i=>({id:i.id,module:i.module,check:i.check,priority:i.priority,status:state(i.id).status,steps:stepsOf(i.steps),expected:i.expected,notes:(state(i.id).notes||"").trim(),group:"Develop branch",imgs:state(i.id).imgs||[],labels:[]}));
const mrows=()=>MARKETPLACE.filter(i=>includeRow(i.id)).map(i=>({id:i.id,module:i.module,check:i.check,priority:i.priority,status:state(i.id).status,steps:stepsOf(i.steps),expected:i.expected,notes:(state(i.id).notes||"").trim(),group:"Marketplace",imgs:state(i.id).imgs||[],labels:[]}));
function fillExpLabels(){const u=[...new Set(fIssues.flatMap(b=>b.labels))].sort(),el=$("#expLabel");el.innerHTML='<option value="">Any label</option>'+u.map(l=>`<option>${esc(l)}</option>`).join("")}
$("#useFeat").onchange=()=>drawScope();$("#expLabel").onchange=()=>refreshExp();
/* ===== Page navigation ===== */
function showPage(p){curPage=p;
 $("#pgCheck").hidden=p!=="check";
 $("#pgFeat").hidden=p!=="features";
 $("#pgLast").hidden=p!=="lastweek";
 $("#pgDevelop").hidden=p!=="develop";
 $("#pgMarketplace").hidden=p!=="marketplace";
 // pgMcp is managed by mcp.ts; hide it whenever a non-mcp page is selected.
 const pgMcp=document.getElementById("pgMcp");if(pgMcp&&p!=="mcp")pgMcp.hidden=true;
 document.querySelectorAll<any>(".tabs button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===p)));
 $("#heroP").innerHTML=p==="features"?"Test what's new. Tick the basics, then log every bug, content issue or idea with labels.":p==="lastweek"?"Last week's changes - run the tracked test cards for changes landing on main.":p==="develop"?"Develop branch - run the tracked test cards for origin/develop.":p==="marketplace"?"Marketplace - run the tracked test cards for deals, favorites, booking, reviews, search, and localization.":"Tap <b>Pass</b> or <b>Fail</b> on each test. Open a card only when you need the steps or want to leave a note.";
 window.scrollTo({top:0});
 if(p==="check")render();else if(p==="features")drawFeatList();else if(p==="lastweek")renderLast();else if(p==="develop")renderDevelop();else if(p==="marketplace")renderMarketplace()}
document.querySelectorAll<any>(".tabs button").forEach(b=>b.onclick=()=>{const t=b.dataset.tab;try{location.hash=t==="features"?"features":"check"}catch(e){}showPage(t)});
$("#gotoLast").onclick=()=>{try{location.hash="#lastweek"}catch(e){}showPage("lastweek")};
$("#gotoDevelop").onclick=()=>{try{location.hash="#develop"}catch(e){}showPage("develop")};
$("#gotoMarketplace").onclick=()=>{try{location.hash="#marketplace"}catch(e){}showPage("marketplace")};
$("#backToCheck").onclick=()=>{try{location.hash="#checklist"}catch(e){}showPage("check")};
$("#backToDevelop").onclick=()=>{try{location.hash="#checklist"}catch(e){}showPage("check")};
$("#backToMarketplace").onclick=()=>{try{location.hash="#checklist"}catch(e){}showPage("check")};
$("#lNext").onclick=()=>lNext(null);
$("#dNext").onclick=()=>dNext(null);
$("#mNext").onclick=()=>mNext(null);
$("#exp3").onclick=()=>openExp();
$("#exp4").onclick=()=>openExp();
$("#expMarketplace").onclick=()=>openExp();
window.addEventListener("hashchange",()=>{const h=location.hash;showPage(h==="#features"?"features":h==="#lastweek"?"lastweek":h==="#develop"?"develop":h==="#marketplace"?"marketplace":"check")});
drawFeatList();drawFeat();showPage(location.hash==="#features"?"features":location.hash==="#lastweek"?"lastweek":location.hash==="#develop"?"develop":location.hash==="#marketplace"?"marketplace":"check");
/* ===== Export / print ===== */
const SCOPES: Array<[string,string,(s:string)=>boolean]>=[["all","All tests",()=>true],["Not tested","Not tested",s=>s==="Not tested"],["Passed","Passed",s=>s==="Passed"],["Failed","Failed",s=>s==="Failed"],["Blocked","Blocked",s=>s==="Blocked"],["attn","Failed + Blocked",s=>s==="Failed"||s==="Blocked"],["Not applicable","N/A",s=>s==="Not applicable"]];
let scope="all",useF=false;
const scopeName=()=>SCOPES.find(s=>s[0]===scope)[1];
function scoped(){const fn=SCOPES.find(s=>s[0]===scope)[2],q=$("#q").value.toLowerCase(),m=$("#mod").value,p=$("#pri").value;
 return items.filter(c=>fn(state(c.id).status)&&(!useF||((!q||[c.id,c.module,c.check].join(" ").toLowerCase().includes(q))&&(!m||c.module===m)&&(!p||c.priority===p))))}
const baseRows=list=>list.filter(c=>!exportOnlyTouched()||isTouched(c.id)).map(c=>({id:c.id,module:c.module,check:c.check,priority:c.priority,status:state(c.id).status,steps:stepsOf(c.steps),expected:c.expected,notes:(state(c.id).notes||"").trim(),group:GRP[c.grp],imgs:state(c.id).imgs||[]}));
const rows=list=>[...baseRows(list),...(xOn()?xrows():[]),...(fOn()?frows():[]),...(useLast?lrows():[]),...(useDevelop?drows():[]),...(useMarketplace?mrows():[])];
const meta=()=>({feature:$("#fName").value.trim(),tester:$("#tester").value.trim(),build:$("#build").value.trim(),decision:$("#decision").value,date:$("#date").value||new Date().toISOString().slice(0,10),scope:scopeName()+(useF?" (filtered)":"")});
const slug=()=>meta().scope.replace(/[^a-z0-9]+/gi,"_").replace(/^_|_$/g,"");
function summaryText(R){const c: Record<string, number>={};R.forEach(x=>{c[x.status]=(c[x.status]||0)+1});
 const extra=(c["New bug"]||0)+(c.Issue||0);
 return "Report: "+R.length+" item"+(R.length===1?"":"s")+" - "+(c.Passed||0)+" passed, "+(c.Failed||0)+" failed, "+(c.Blocked||0)+" blocked, "+(c["Not applicable"]||0)+" N/A, "+(c["Not tested"]||0)+" not tested"+(extra?" ("+extra+" logged bug"+(extra===1?"":"s")+"/issue"+(extra===1?"":"s")+")":"")}
async function saveFile(name,data,type){
 let dl=null;try{dl=window.claude&&window.claude.use?await window.claude.use("downloads"):null}catch(e){}
 if(dl){try{await dl.save({filename:name,data});return "saved"}catch(e){if(e&&e.code==="declined")return "declined";throw e}}
 const a=document.createElement("a");a.href=URL.createObjectURL(data instanceof Blob?data:new Blob([data],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);return "saved"}
function csvOut(list){const r=[["ID","Section","Module","Test","Priority","Status","Steps","Expected result","Notes","Screenshots","Labels"]];
 rows(list).forEach(x=>r.push([x.id,x.group,x.module,x.check,x.priority,x.status,x.steps.join(" | "),x.expected,x.notes,(x.imgs||[]).length?x.imgs.length+" attached (see PDF)":"",(x.labels||[]).join("; ")]));
 return "\uFEFF"+r.map(x=>x.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n")}
const safe=s=>String(s??"").replace(/→/g,">").replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—·]/g,"-").replace(/…/g,"...").split("").map(ch=>ch.charCodeAt(0)>255?"":ch).join("");
function pdfOut(list){
 const J=window.jspdf&&window.jspdf.jsPDF;if(!J)throw new Error("the PDF library could not load (check your connection)");
 const d=new J({unit:"pt",format:"a4"}),W=d.internal.pageSize.getWidth(),H=d.internal.pageSize.getHeight(),M=40,CW=W-2*M,m=meta(),R=rows(list);let y=0;
 const COL={"Passed":[15,122,66],"Failed":[196,48,63],"Blocked":[163,95,0],"Not applicable":[117,109,133],"Not tested":[130,125,140],"New bug":[109,0,204],"Issue":[109,0,204]};
 const tx=(s,o)=>{o=o||{};const sz=o.sz||10,x=o.x||M,w=o.w||(W-M-x);d.setFont("helvetica",o.b?"bold":(o.i?"italic":"normal"));d.setFontSize(sz);d.setTextColor.apply(d,o.c||[30,22,48]);
  d.splitTextToSize(safe(s),w).forEach(l=>{if(y+sz*1.3>H-M){d.addPage();y=M}d.text(l,x,y+sz*.9);y+=sz*1.35});y+=o.gap||0};
 d.setFillColor(109,0,204);d.rect(0,0,W,92,"F");
 d.setTextColor(255,255,255);d.setFont("helvetica","bold");d.setFontSize(21);d.text("Aspio Business App",M,42);
 d.setFont("helvetica","normal");d.setFontSize(11);d.text(safe("QA test report  -  Scope: "+m.scope+(m.feature?"  -  Feature: "+m.feature:"")),M,64);
 d.setFontSize(9);d.text(safe(m.date+(m.tester?"   |   Tester: "+m.tester:"")+(m.build?"   |   Build: "+m.build:"")),M,80);
 y=110;tx(summaryText(R),{sz:9.5,c:[90,80,110]});
 if(m.decision)tx("Release decision: "+m.decision,{sz:10,b:1});
 tx(R.length+" item"+(R.length===1?"":"s")+" in this report",{sz:10,b:1,gap:6});
 d.setDrawColor(228,220,240);d.line(M,y,W-M,y);y+=14;
 R.forEach(x=>{
  if(y+120>H-M){d.addPage();y=M}
  const col=COL[x.status]||COL["Not tested"];
  d.setFillColor(col[0],col[1],col[2]);d.roundedRect(W-M-74,y-1,74,15,3,3,"F");
  d.setTextColor(255,255,255);d.setFont("helvetica","bold");d.setFontSize(7.5);d.text(x.status==="Not applicable"?"N/A":x.status.toUpperCase(),W-M-37,y+9.5,{align:"center"});
  tx(x.id+"   "+x.module+"  -  "+x.priority,{sz:9,b:1,c:[109,0,204],w:CW-84});
  tx(x.check,{sz:11.5,b:1,gap:(x.labels||[]).length?0:4});if((x.labels||[]).length)tx("Labels: "+x.labels.join(", "),{sz:8.5,c:[109,0,204],gap:4});
  if(x.expected){tx("EXPECTED RESULT",{sz:7.5,b:1,c:[120,110,140]});tx(x.expected,{sz:9.5,gap:4})}
  if(x.steps.length){tx("STEPS",{sz:7.5,b:1,c:[120,110,140]});x.steps.forEach((s,i)=>tx((i+1)+". "+s,{sz:9.5,x:M+8}));y+=4}
  tx(x.nlabel||"ACTUAL RESULT / NOTES",{sz:7.5,b:1,c:[120,110,140]});
  x.notes?tx(x.notes,{sz:9.5,c:x.status==="Failed"?[160,30,45]:[30,22,48]}):tx("No notes recorded",{sz:9.5,i:1,c:[140,130,155]});
  const ims=(x.imgs||[]).map(id=>imgCache[id]).filter(Boolean);
  if(ims.length){y+=4;tx("SCREENSHOTS",{sz:7.5,b:1,c:[120,110,140]});
   ims.forEach(o=>{const s=Math.min(CW/o.w,260/o.h,.75),w=o.w*s,h=o.h*s;if(y+h>H-M){d.addPage();y=M}d.addImage(o.url,"JPEG",M,y,w,h);y+=h+8})}
  y+=6;d.setDrawColor(228,220,240);d.line(M,y,W-M,y);y+=14});
 const n=d.getNumberOfPages();for(let i=1;i<=n;i++){d.setPage(i);d.setFont("helvetica","normal");d.setFontSize(8);d.setTextColor(140,130,155);d.text("Aspio QA report  -  Page "+i+" of "+n,W/2,H-20,{align:"center"})}
 return d.output("blob")}
function printOut(list){
 const m=meta(),R=rows(list);
 $("#printArea").innerHTML=`<h1>Aspio Business App · QA test report</h1><p class="pm">Scope: <b>${esc(m.scope)}</b>${m.feature?" · Feature: <b>"+esc(m.feature)+"</b>":""} · ${R.length} item${R.length===1?"":"s"} · ${esc(m.date)}${m.tester?" · Tester: "+esc(m.tester):""}${m.build?" · Build: "+esc(m.build):""}${m.decision?" · Decision: "+esc(m.decision):""}</p><p class="pm">${esc(summaryText(R))}</p>`+
 R.map(x=>`<section class="pi s-${x.status.replace(/ /g,"_")}"><div class="ph"><b>${esc(x.id)}</b><span>${esc(x.module)} · ${esc(x.priority)}</span><em>${esc(x.status)}</em></div><h3>${esc(x.check)}</h3>${(x.labels||[]).length?`<div class="pl">Labels: ${esc(x.labels.join(", "))}</div>`:""}${x.expected?`<div class="pl">Expected result</div><p>${esc(x.expected)}</p>`:""}${x.steps.length?`<div class="pl">Steps</div><ol>${x.steps.map(s=>"<li>"+esc(s)+"</li>").join("")}</ol>`:""}<div class="pl">${esc(x.nlabel||"Actual result / notes")}</div><p>${x.notes?esc(x.notes):"<i>No notes recorded</i>"}</p>${(x.imgs||[]).map(id=>imgCache[id]).filter(Boolean).map(o=>`<img class="pimg" src="${o.url}" alt="Screenshot">`).join("")}</section>`).join("");
 document.body.classList.add("printing");
 const done=()=>{document.body.classList.remove("printing");window.removeEventListener("afterprint",done)};
 window.addEventListener("afterprint",done);
 setTimeout(()=>{try{window.print()}catch(e){}setTimeout(done,1500)},60)}
function refreshExp(){useF=$("#useF").checked;useLast=$("#useLast").checked;useDevelop=$("#useDevelop").checked;useMarketplace=$("#useMarketplace").checked;const n=rows(scoped()).length;$("#expCount").textContent=n+" item"+(n===1?"":"s")+" will be included";["goPdf","goCsv","goPrint"].forEach(i=>$("#"+i).disabled=!n)}
function drawScope(){const all=[...items,...(fOn()?FEAT:[]),...LAST,...DEVELOP,...MARKETPLACE],touched=exportOnlyTouched();$("#scope").innerHTML=SCOPES.map(s=>`<button class="chip" type="button" data-sc="${s[0]}" aria-pressed="${scope===s[0]}">${s[1]} <b>${all.filter(i=>s[2](state(i.id).status)&&(!touched||isTouched(i.id))).length}</b></button>`).join("");refreshExp()}
function openExp(){scope=[...items,...FEAT,...LAST,...DEVELOP,...MARKETPLACE].some(i=>state(i.id).status==="Failed")?"Failed":"all";$("#expMsg").textContent="";$("#useX").checked=extra.length>0;$("#useX").disabled=!extra.length;$("#xN").textContent=extra.length;$("#useFeat").checked=fIssues.length>0||FEAT.some(i=>state(i.id).status!=="Not tested");$("#fN").textContent=FEAT.length;$("#fiN").textContent=fIssues.length;$("#useLast").checked=LAST.some(i=>state(i.id).status!=="Not tested");$("#lN").textContent=LAST.length;$("#useDevelop").checked=DEVELOP.some(i=>state(i.id).status!=="Not tested");$("#dN").textContent=DEVELOP.length;$("#useMarketplace").checked=MARKETPLACE.some(i=>state(i.id).status!=="Not tested");$("#mktN").textContent=MARKETPLACE.length;fillExpLabels();$("#modal").hidden=false;drawScope();$("#goPdf").focus()}
const closeExp=()=>{$("#modal").hidden=true};
async function runExp(kind){const list=scoped(),msg=$("#expMsg");msg.textContent="";
 try{
  await loadAll(rows(list));if(kind==="print"){closeExp();printOut(list);return}
  const base="Aspio_QA_"+slug()+"_"+meta().date;
  const r=kind==="pdf"?await saveFile(base+".pdf",pdfOut(list),"application/pdf"):await saveFile(base+".csv",csvOut(list),"text/csv;charset=utf-8");
  msg.textContent=r==="saved"?"Done. Your file is ready.":"Cancelled."
 }catch(e){msg.textContent="Couldn’t create the file: "+((e&&e.message)||"unknown error")}}
$("#exp").onclick=openExp;$("#mx").onclick=closeExp;
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeExp()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#modal").hidden)closeExp()});
$("#scope").addEventListener("click",e=>{const b=e.target.closest("[data-sc]");if(b){scope=b.dataset.sc;drawScope()}});
$("#useF").onchange=refreshExp;$("#useX").onchange=refreshExp;$("#useLast").onchange=refreshExp;$("#useDevelop").onchange=refreshExp;$("#useMarketplace").onchange=refreshExp;$("#onlyTouched").onchange=()=>drawScope();
$("#goPdf").onclick=()=>runExp("pdf");$("#goCsv").onclick=()=>runExp("csv");$("#goPrint").onclick=()=>runExp("print");

$("#reset").onclick=()=>{if(confirm("Reset all test statuses, notes, logged bugs and new-feature items saved in this browser? (Your label list is kept.)")){[...Object.values(saved as any).flatMap((s:any)=>s.imgs||[]),...extra.flatMap(b=>b.imgs||[])].forEach(imgDel);saved={};store();extra=[];storeX();clearX();drawExtra();fIssues.flatMap(b=>b.imgs||[]).forEach(imgDel);fIssues=[];saveF();resetFi();drawFeat();drawFeatList();render();mf={s:""};renderMarketplace();syncReset()}};

["tester","build","date","decision","pmNotes"].forEach(id=>{const el=$("#"+id);try{el.value=localStorage.getItem("aspio-qa-"+id)||""}catch(e){}el.addEventListener("input",()=>{try{localStorage.setItem("aspio-qa-"+id,el.value)}catch(e){};syncMeta(id,el.value)})});
render();

/* ===== Backend sync glue ===== */
const META_FIELDS: Array<[string, string]> = [
  ["#fName", "featureName"],
  ["#tester", "tester"],
  ["#build", "build"],
  ["#date", "date"],
  ["#decision", "decision"],
  ["#pmNotes", "pmNotes"],
];
const ALL_TEST_IDS = [...items, ...FEAT, ...LAST, ...DEVELOP, ...MARKETPLACE].map((t) => t.id);

function persistMeta(field: string, value: string) {
  const key = field === "featureName" ? "aspio-qa-fname" : "aspio-qa-" + field;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    /* noop */
  }
}

function mergeLocalImgs<T extends { id: string; imgs?: string[] }>(remote: T[], local: T[]): T[] {
  const byId = new Map(local.map((x) => [x.id, x]));
  return remote.map((x) => ({ ...x, imgs: byId.get(x.id)?.imgs || [] }));
}

function refreshCurrentPage() {
  if (curPage === "lastweek") renderLast();
  else if (curPage === "develop") renderDevelop();
  else if (curPage === "marketplace") renderMarketplace();
  else if (curPage === "features") {
    drawFeatList();
    fstats();
  } else render();
}

function refreshStats() {
  if (curPage === "lastweek") lstats();
  else if (curPage === "develop") dstats();
  else if (curPage === "marketplace") mstats();
  else if (curPage === "features") fstats();
  else stats();
}

function updateCardFromState(id: string) {
  const el = document.querySelector<HTMLElement>(`.card[data-id="${CSS.escape(id)}"]`);
  if (!el) return;
  const st = state(id);
  const ta = el.querySelector<HTMLTextAreaElement>("textarea");
  if (ta && document.activeElement !== ta && ta.value !== (st.notes || "")) ta.value = st.notes || "";
  el.querySelectorAll<HTMLInputElement>(".step input").forEach((cb, i) => {
    cb.checked = (st.done || []).includes(i);
  });
  refreshCard(el);
}

function applyRemoteTests(map: Record<string, any>) {
  const remoteIds = new Set(Object.keys(map));
  for (const [id, d] of Object.entries(map)) {
    const local = saved[id] || {};
    saved[id] = {
      ...local,
      status: d.status || "Not tested",
      notes: typeof d.notes === "string" ? d.notes : "",
      done: Array.isArray(d.done) ? d.done : [],
      updatedBy: d.updatedBy || "",
      updatedAt: d.updatedAt || null,
      imgs: local.imgs || [],
    };
  }
  // Remote is authoritative: a missing document means the test was reset.
  for (const id of ALL_TEST_IDS) {
    if (remoteIds.has(id)) continue;
    const local = saved[id] || {};
    saved[id] = { status: "Not tested", notes: "", done: [], imgs: local.imgs || [] };
  }
  store();
  refreshCurrentPage();
}

function applyRemoteTest(id: string, d: any, removed: boolean) {
  const local = saved[id] || {};
  saved[id] = removed
    ? { status: "Not tested", notes: "", done: [], imgs: local.imgs || [] }
    : {
        ...local,
        status: d.status || "Not tested",
        notes: typeof d.notes === "string" ? d.notes : "",
        done: Array.isArray(d.done) ? d.done : [],
        updatedBy: d.updatedBy || "",
        updatedAt: d.updatedAt || null,
        imgs: local.imgs || [],
      };
  store();
  updateCardFromState(id);
  refreshStats();
}

function applyRemoteBugs(bugs: any[]) {
  extra = mergeLocalImgs(bugs, extra);
  if (editId && !extra.some((b) => b.id === editId)) clearX();
  storeX();
  drawExtra();
}

function applyRemoteIssues(issues: any[]) {
  fIssues = mergeLocalImgs(issues, fIssues);
  if (fiEdit && !fIssues.some((b) => b.id === fiEdit)) resetFi();
  saveF();
  drawFeat();
}

function applyRemoteLabels(labels: string[]) {
  LAB = labels.slice();
  persistL();
  fiSel = fiSel.filter((l) => LAB.includes(l));
  drawFeat();
}

function applyRemoteMeta(meta: Record<string, any>) {
  for (const [sel, field] of META_FIELDS) {
    const el = $(sel);
    if (!el) continue;
    const value = meta[field];
    if (value == null) continue;
    if (document.activeElement === el) continue;
    const text = String(value);
    if (el.value !== text) el.value = text;
    persistMeta(field, text);
  }
}

void initBackend({
  getLocalData: () => ({
    saved,
    extra,
    fIssues,
    labels: LAB,
    meta: {
      featureName: $("#fName").value,
      tester: $("#tester").value,
      build: $("#build").value,
      date: $("#date").value,
      decision: $("#decision").value,
      pmNotes: $("#pmNotes").value,
    },
  }),
  applyTests: applyRemoteTests,
  applyTest: applyRemoteTest,
  applyBugs: applyRemoteBugs,
  applyIssues: applyRemoteIssues,
  applyLabels: applyRemoteLabels,
  applyMeta: applyRemoteMeta,
  onStatus: () => {},
  onNotice: () => {},
});

declare global {
  interface Window {
    jspdf?: any;
    claude?: any;
  }
}
