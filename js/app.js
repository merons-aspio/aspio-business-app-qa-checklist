
const DATA={"cases": [{"id": "QF-A1-001", "module": "Dashboard", "check": "Dashboard loads and displays business metrics/overview without errors", "steps": "1. Log in as company owner/manager. 2. Navigate to Dashboard. 3. Observe top-bar, metric cards, and any notifications. 4. Refresh page.", "expected": "Dashboard shell renders; metric cards show values; no blank screens or console errors blocking load; top-bar navigation works.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-A1-002", "module": "Dashboard", "check": "Sidebar navigation opens all main modules", "steps": "1. From Dashboard, click each main sidebar item: Customers, Services, Staff, Calendar, Bookings, Categories, Settings, Aspio Products, Company Information, Loyalty, Deals, Reviews. 2. Confirm each route loads (no 404/blank).", "expected": "Every module link navigates to its page and the page shell renders.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-A1-003", "module": "Dashboard", "check": "User profile / logout", "steps": "1. Click user avatar/profile menu. 2. Select logout/sign-out (if present). 3. Confirm redirected to login.", "expected": "Session clears; login page shown; cannot access dashboard without re-login.", "priority": "High", "status": "Not tested"}, {"id": "QF-A2-001", "module": "Customer", "check": "Create a new customer", "steps": "1. Go to Customers page. 2. Click Add Customer. 3. Fill first name, last name, email, phone. 4. Save.", "expected": "Customer appears in the customer list with correct details; success toast shown.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-A2-002", "module": "Customer", "check": "Duplicate email is rejected", "steps": "1. Create customer with email `test@example.com`. 2. Try to create another customer with the same email (case-insensitive, e.g. `TEST@Example.com`).", "expected": "Second create is blocked with \"Customer email already exists\" / 409-style error; no duplicate row created.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-A2-003", "module": "Customer", "check": "View customer details", "steps": "1. Open an existing customer from the list (click row / detail modal).", "expected": "All saved fields display correctly: name, email, phone, address, tags, created date.", "priority": "High", "status": "Not tested"}, {"id": "QF-A2-004", "module": "Customer", "check": "Edit an existing customer", "steps": "1. Edit a customer's phone and address. 2. Save. 3. Re-open the customer.", "expected": "Updated values persist and display.", "priority": "High", "status": "Not tested"}, {"id": "QF-A2-005", "module": "Customer", "check": "Soft-delete (trash) a customer", "steps": "1. From customer list or detail, use Delete/Trash action. 2. Confirm.", "expected": "Customer disappears from active list; moves to Trash view; still recoverable.", "priority": "High", "status": "Not tested"}, {"id": "QF-A2-006", "module": "Customer", "check": "Restore a trashed customer", "steps": "1. Go to Trash view. 2. Find the trashed customer. 3. Click Restore.", "expected": "Customer reappears in the active customer list with original data intact.", "priority": "High", "status": "Not tested"}, {"id": "QF-A2-007", "module": "Customer", "check": "Filter customers", "steps": "1. Use filter tabs / search on the customers page. 2. Filter by a name fragment.", "expected": "List updates to show only matching customers.", "priority": "Medium", "status": "Not tested"}, {"id": "QF-A3-001", "module": "Services", "check": "Create a new service", "steps": "1. Go to Services page. 2. Click Add Service. 3. Enter service name, description, price, duration. 4. Assign to a category. 5. Save.", "expected": "Service appears in service list with correct name, price, duration, category.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-A3-002", "module": "Services", "check": "Edit a service", "steps": "1. Edit service price and duration. 2. Save. 3. Re-open service.", "expected": "Changes persist and display.", "priority": "High", "status": "Not tested"}, {"id": "QF-A3-003", "module": "Services", "check": "Delete / trash a service", "steps": "1. Trash a service from the list or actions menu. 2. Confirm.", "expected": "Service removed from active list; appears in Trash; bookings referencing it (if any) handled gracefully.", "priority": "High", "status": "Not tested"}, {"id": "QF-A3-004", "module": "Services", "check": "Restore a trashed service", "steps": "1. Go to Trash view. 2. Restore the service.", "expected": "Service reappears in active service list.", "priority": "High", "status": "Not tested"}, {"id": "QF-A4-001", "module": "Categories", "check": "Create a service category", "steps": "1. Go to Categories page. 2. Add category with name and color. 3. Save.", "expected": "Category appears in category list with chosen color; can be assigned to services.", "priority": "High", "status": "Not tested"}, {"id": "QF-A4-002", "module": "Categories", "check": "Edit/delete category", "steps": "1. Edit category name/color. 2. Save. 3. Trash category.", "expected": "Changes persist; category can be trashed/restored.", "priority": "Medium", "status": "Not tested"}, {"id": "QF-A5-001", "module": "Staff", "check": "Add a new staff member", "steps": "1. Go to Staff page. 2. Click Add Staff / Add Assistant. 3. Enter name, email, phone. 4. Save.", "expected": "Staff member appears in staff list; can be assigned to bookings.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-A5-002", "module": "Staff", "check": "Assign module roles/permissions to staff", "steps": "1. Open a staff member's roles/permissions panel. 2. Toggle module access (e.g. enable Calendar, disable Settings). 3. Save.", "expected": "Staff role reflects selected modules; access restricted accordingly.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-A5-003", "module": "Staff", "check": "Set staff availability / working hours", "steps": "1. Open staff availability schedule. 2. Set working days/hours for a day. 3. Save.", "expected": "Availability saved; staff shown as available during those hours on calendar.", "priority": "High", "status": "Not tested"}, {"id": "QF-A5-004", "module": "Staff", "check": "Edit and trash staff", "steps": "1. Edit staff details. 2. Trash staff. 3. Restore from Trash.", "expected": "Edit persists; trash/restore works like customers.", "priority": "High", "status": "Not tested"}, {"id": "QF-A6-001", "module": "Bookings", "check": "Create a new booking", "steps": "1. Go to Bookings or Calendar. 2. Click Add Booking. 3. Select customer, staff, service, date, time slot. 4. Confirm.", "expected": "Booking created; appears in bookings list and on calendar; totals calculated correctly.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-A6-002", "module": "Bookings", "check": "Booking totals calculation", "steps": "1. Add a service with price to a booking. 2. Add an add-on if available. 3. Observe totals before confirming.", "expected": "Subtotal, tax (if any), and grand total are correct and update when services change.", "priority": "High", "status": "Not tested"}, {"id": "QF-A6-003", "module": "Bookings", "check": "Edit an existing booking (reschedule)", "steps": "1. Open a future booking. 2. Change date/time or staff. 3. Save.", "expected": "Booking moved to new slot; calendar updated; no duplicate slot created.", "priority": "High", "status": "Not tested"}, {"id": "QF-A6-004", "module": "Bookings", "check": "Cancel / trash a booking", "steps": "1. Trash a booking. 2. Confirm.", "expected": "Booking removed from active list/calendar; appears in Trash.", "priority": "High", "status": "Not tested"}, {"id": "QF-A6-005", "module": "Bookings", "check": "View booking details", "steps": "1. Click a booking in the list/calendar.", "expected": "Modal/drawer shows customer, staff, service, date, time, price, status.", "priority": "High", "status": "Not tested"}, {"id": "QF-A7-001", "module": "Calendar", "check": "Calendar day/week view loads and shows bookings", "steps": "1. Go to Calendar page. 2. Switch between day and week view. 3. Create a booking and confirm it appears on the correct date/time.", "expected": "Bookings render on correct date/time slots; day/week toggle works.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-A7-002", "module": "Calendar", "check": "Block time slot", "steps": "1. Open Block Time modal. 2. Select staff, date, time range, reason. 3. Save.", "expected": "Blocked slot shows on calendar; no booking can be made in that range for that staff.", "priority": "High", "status": "Not tested"}, {"id": "QF-A7-003", "module": "Calendar", "check": "Staff availability governs bookable slots", "steps": "1. Set a staff member's availability for a day. 2. Try to book outside those hours.", "expected": "Slots outside availability are not bookable (or flagged).", "priority": "High", "status": "Not tested"}, {"id": "QF-A8-001", "module": "Company Information", "check": "Edit company details", "steps": "1. Go to Company Information / Settings. 2. Edit business name, address, currency, phone. 3. Save.", "expected": "Changes persist; reflected across dashboard/header.", "priority": "High", "status": "Not tested"}, {"id": "QF-A8-002", "module": "Settings", "check": "Set working hours", "steps": "1. Open working-hours settings. 2. Set open/close times per day. 3. Save.", "expected": "Working hours saved; booking slots generated within these hours.", "priority": "High", "status": "Not tested"}, {"id": "QF-A8-003", "module": "Settings", "check": "Notification settings", "steps": "1. Toggle email/SMS notification preferences. 2. Save.", "expected": "Preferences saved and reflected.", "priority": "Medium", "status": "Not tested"}, {"id": "QF-A9-001", "module": "Aspio Products", "check": "View/add/edit product", "steps": "1. Go to Aspio Products page. 2. Add a product. 3. Edit and save.", "expected": "Product appears in list; edits persist.", "priority": "Medium", "status": "Not tested"}, {"id": "QF-A10-001", "module": "Loyalty", "check": "View loyalty card for a customer", "steps": "1. Open a customer's loyalty card. 2. Observe stamp count and progress.", "expected": "Loyalty card displays correct stamps/rewards for that customer.", "priority": "Medium", "status": "Not tested"}, {"id": "QF-A10-002", "module": "Loyalty", "check": "Add a stamp", "steps": "1. Use Add Stamp / manual stamp action on a loyalty card.", "expected": "Stamp count increments; progress updates.", "priority": "Medium", "status": "Not tested"}, {"id": "QF-A11-001", "module": "Deals", "check": "Create and view a deal", "steps": "1. Go to Deals page. 2. Create a discount deal. 3. Save.", "expected": "Deal appears in deals list; applicable to selected services.", "priority": "Medium", "status": "Not tested"}, {"id": "QF-A12-001", "module": "Reviews", "check": "View customer reviews", "steps": "1. Go to Reviews page. 2. Observe listed reviews and ratings.", "expected": "Reviews display with customer name, rating, comment, date.", "priority": "Medium", "status": "Not tested"}, {"id": "QF-A13-001", "module": "Receipts", "check": "Generate/view a receipt", "steps": "1. Go to Receipts page. 2. Generate a receipt for a booking. 3. Preview/print.", "expected": "Receipt PDF renders with correct booking/customer/company details.", "priority": "Medium", "status": "Not tested"}, {"id": "QF-A14-001", "module": "Trash", "check": "Bulk restore and bulk delete", "steps": "1. Go to Trash page. 2. Select multiple trashed items. 3. Bulk Restore. 4. Select items and Bulk Delete (permanent).", "expected": "Selected items restored to active lists OR permanently removed. Trash count updates.", "priority": "High", "status": "Not tested"}, {"id": "QF-B1-001", "module": "Customer \u2192 Booking", "check": "Customer created then used in a booking", "steps": "1. Create a new customer. 2. Create a booking selecting that customer. 3. Open customer detail.", "expected": "Booking is linked to customer; customer detail shows booking history (if implemented) or booking references customer correctly.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-B1-002", "module": "Customer \u2192 Loyalty", "check": "Customer has a loyalty card", "steps": "1. Create customer. 2. Check loyalty card exists/is creatable for them. 3. Add a stamp via a completed booking.", "expected": "Loyalty card linked to customer; stamps accumulate.", "priority": "Medium", "status": "Not tested"}, {"id": "QF-B2-001", "module": "Service \u2192 Category \u2192 Booking", "check": "Service with category and scheduled price used in booking", "steps": "1. Create a category. 2. Create service in that category with a base price. 3. Add a scheduled price for a future date. 4. Book the service on that date.", "expected": "Booking uses scheduled price (not base price) for the future date; category grouping works.", "priority": "High", "status": "Not tested"}, {"id": "QF-B3-001", "module": "Staff \u2192 Availability \u2192 Booking", "check": "Staff availability controls bookings", "steps": "1. Add staff. 2. Set availability Mon-Fri 09:00-17:00. 3. Try booking at 18:00 (outside availability).", "expected": "18:00 slot not bookable for that staff; 10:00 is bookable.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-B3-002", "module": "Staff \u2192 Roles \u2192 Dashboard access", "check": "Staff with restricted module roles cannot access disabled modules", "steps": "1. Log in as a staff member with only Calendar access (no Settings, no Customers). 2. Try to navigate to Settings and Customers pages.", "expected": "Restricted modules are hidden or return forbidden/unauthorized; staff can access Calendar.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-B4-001", "module": "Bookings", "check": "End-to-end: customer \u2192 service \u2192 staff \u2192 slot \u2192 confirm", "steps": "1. Create customer. 2. Create service. 3. Add staff with availability. 4. Create booking end-to-end. 5. Confirm booking appears on calendar and in bookings list.", "expected": "Full chain works; booking visible everywhere expected; status correct.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-B4-002", "module": "Bookings", "check": "Double-booking prevention (same staff, same slot)", "steps": "1. Book staff X at 10:00 on a date. 2. Try to book staff X at 10:00 same date (different customer/service).", "expected": "Second booking blocked or slot shown as unavailable.", "priority": "Critical", "status": "Not tested"}, {"id": "QF-B5-001", "module": "Calendar", "check": "Week view shows all staff bookings side by side", "steps": "1. Create bookings for multiple staff on the same day. 2. Open week view.", "expected": "All staff bookings visible in correct columns/times.", "priority": "High", "status": "Not tested"}, {"id": "QF-B5-002", "module": "Calendar", "check": "Navigate dates forward/backward", "steps": "1. Use date picker / arrows to move to another week. 2. Create a booking there. 3. Return to today.", "expected": "Calendar navigates correctly; booking stays on the selected date.", "priority": "High", "status": "Not tested"}, {"id": "QF-B6-001", "module": "Cross-module", "check": "Deleting a service referenced by bookings", "steps": "1. Create a service and bookings using it. 2. Trash the service.", "expected": "Service trashed; existing bookings remain accessible (or graceful handling shown). No crash.", "priority": "High", "status": "Not tested"}, {"id": "QF-B6-002", "module": "Cross-module", "check": "Trashing a customer with bookings", "steps": "1. Create customer with bookings. 2. Trash the customer.", "expected": "Customer moved to trash; bookings handled gracefully (not orphaned in a way that breaks the UI).", "priority": "High", "status": "Not tested"}, {"id": "QF-B6-003", "module": "Cross-module", "check": "Company working hours affect booking slot generation", "steps": "1. Change company working hours (e.g. close at 15:00). 2. Try to book at 16:00.", "expected": "16:00 not offered as a bookable slot.", "priority": "High", "status": "Not tested"}], "critical": [["C1", "Authentication", "Login/logout works; session persists after refresh", "Log in, refresh the dashboard, log out, then try to open a dashboard page again.", "Session remains valid after refresh; logout clears the session and protected pages require login."], ["C2", "Permissions", "Owner/manager can access all modules", "Log in as an owner, then as a manager if available. Open the main modules.", "Authorized owner/manager accounts can access the modules allowed by their role."], ["C3", "Permissions", "Restricted staff cannot access disabled modules", "Use a staff account with limited module access. Try both sidebar navigation and direct URLs for disabled modules.", "Disabled modules are inaccessible; allowed modules remain accessible."], ["C4", "Customers", "Duplicate customer email is rejected clearly", "Create a customer, then attempt another customer using the same email with different letter casing.", "The second record is rejected with a clear message; no duplicate customer is created."], ["C5", "Booking", "End-to-end booking creation", "Create/select a customer, service and available staff member; choose an available slot and confirm.", "Booking is saved and appears in the bookings list and calendar with the correct details."], ["C6", "Booking / Calendar", "Double-booking prevention", "Create a booking for a staff member at a specific time. Attempt another booking for the same staff member and slot.", "The conflicting booking is blocked or the slot is clearly unavailable."], ["C7", "Staff / Booking", "Staff availability controls bookable slots", "Set a staff member's availability. Try booking within and outside those hours.", "Only valid availability slots can be booked."], ["C8", "Settings / Booking", "Company working hours constrain slots", "Change company opening hours, save, then try to book outside the new hours.", "Slots outside company working hours are not offered or cannot be confirmed."], ["C9", "Trash", "Trash/restore works without errors", "Trash a test customer or service, restore it, and verify the active record.", "Record moves to Trash and restores with its data intact; no error or data loss."], ["C10", "Booking / Totals", "Booking totals are accurate", "Create a booking with a service and an add-on if supported. Check subtotal, tax and total.", "Displayed totals match the configured prices and update correctly when selections change."], ["C11", "Booking / Calendar", "Rescheduling updates the calendar without duplicates", "Open a future booking, change its date/time, save, and inspect both old and new slots.", "Booking appears once at the new slot and is removed from the old slot."], ["C12", "Dashboard", "Dashboard loads without fatal errors", "Log in, open Dashboard, refresh, and inspect the page for blank sections or blocking errors.", "Dashboard loads and remains usable without a blank screen or fatal error."]]};
const KEY="aspio-qa-checklist-v1",ST=["Passed","Failed","Blocked","Not applicable"],LBL={"Passed":"Pass","Failed":"Fail","Blocked":"Block","Not applicable":"N/A"};
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}
const store=()=>{try{localStorage.setItem(KEY,JSON.stringify(saved))}catch(e){}};
const state=id=>saved[id]||{status:"Not tested",notes:"",done:[]};
const put=(id,p)=>{saved[id]={...state(id),...p};store()};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=s=>document.querySelector(s);
const onLists=(t,fn)=>[$("#list"),$("#featList"),$("#lastList"),$("#developList")].forEach(L=>L.addEventListener(t,fn));
const GRP=["Release sign-off","A · Basic functionality","B · Business workflows"],GSUB=["Complete these 12 checks before approving","Core screens and features","End-to-end flows across modules"];
const items=[...DATA.critical.map(c=>({id:c[0],module:c[1],check:c[2],steps:c[3],expected:c[4],priority:"Critical",grp:0})),...DATA.cases.map(c=>({...c,grp:c.id.startsWith("QF-A")?1:2}))];
const stepsOf=s=>String(s||"").split(/(?:^|\s)\d+\.\s+/).map(x=>x.trim().replace(/\.$/,"")).filter(Boolean);
let f={s:""},curPage="check",useLast=false,useDevelop=false;
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
 document.querySelectorAll(".card").forEach(refreshCard);stats();fillThumbs($("#list"));
}
function refreshCard(el){const id=el.dataset.id,st=state(id),n=el.querySelectorAll(".step").length,d=(st.done||[]).length;
 el.dataset.s=st.status;el.querySelectorAll(".seg button").forEach(b=>b.classList.toggle("on",b.dataset.st===st.status));
 const im=(st.imgs||[]).length;el.querySelector(".sp").textContent=[n>1?d+"/"+n+" steps":"",im?im+" screenshot"+(im>1?"s":""):""].filter(Boolean).join(" · ");
 el.classList.toggle("need",st.status==="Failed"&&!st.notes.trim()&&!im)}
function stats(){fstats();
 const cnt={};items.forEach(c=>{const s=state(c.id).status;cnt[s]=(cnt[s]||0)+1});
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
function goNext(from){let n=from?from.nextElementSibling:document.querySelector("#list .card");
 for(;n;n=n.nextElementSibling)if(n.classList.contains("card")&&n.dataset.s==="Not tested")break;
 if(!n&&from){return from.parentElement.id==="list"?goNext(null):void 0}
 if(n){open(n,true);n.scrollIntoView({behavior:"smooth",block:"center"})}else if(!from)alert("Nothing left to test in this view. Nice work!")}
function setLastStatus(el,s){const id=el.dataset.id,was=el.classList.contains("open"),cur=state(id).status,next=cur===s?"Not tested":s;
 put(id,{status:next});refreshCard(el);lstats();
 if(next==="Failed"){open(el,true);const t=el.querySelector("textarea");t.focus({preventScroll:true})}
 else if(next==="Passed"&&was){open(el,false);lNext(el)}}
function lNext(from){let n=from?from.nextElementSibling:document.querySelector("#lastList .card");
 for(;n;n=n.nextElementSibling)if(n.classList.contains("card")&&n.dataset.s==="Not tested")break;
 if(!n&&from){return from.parentElement.id==="lastList"?lNext(null):void 0}
 if(n){open(n,true);n.scrollIntoView({behavior:"smooth",block:"center"})}else if(!from)alert("All last-week checks are done. Nice work!")}
function setDevelopStatus(el,s){const id=el.dataset.id,was=el.classList.contains("open"),cur=state(id).status,next=cur===s?"Not tested":s;
 put(id,{status:next});refreshCard(el);dstats();
 if(next==="Failed"){open(el,true);const t=el.querySelector("textarea");t.focus({preventScroll:true})}
 else if(next==="Passed"&&was){open(el,false);dNext(el)}}
function dNext(from){let n=from?from.nextElementSibling:document.querySelector("#developList .card");
 for(;n;n=n.nextElementSibling)if(n.classList.contains("card")&&n.dataset.s==="Not tested")break;
 if(!n&&from){return from.parentElement.id==="developList"?dNext(null):void 0}
 if(n){open(n,true);n.scrollIntoView({behavior:"smooth",block:"center"})}else if(!from)alert("All develop checks are done. Nice work!")}
onLists("click",e=>{const el=e.target.closest(".card");if(!el)return;const b=e.target.closest("[data-st]");
 if(b){if(el.closest("#developList")){setDevelopStatus(el,b.dataset.st);return}if(el.closest("#lastList")){setLastStatus(el,b.dataset.st);return}setStatus(el,b.dataset.st);return}
 if(e.target.closest(".body"))return;open(el,!el.classList.contains("open"))});
onLists("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.classList.contains("head")){e.preventDefault();const el=e.target.closest(".card");open(el,!el.classList.contains("open"))}});
onLists("change",e=>{if(!e.target.matches(".step input"))return;const el=e.target.closest(".card"),id=el.dataset.id,i=+e.target.dataset.i;
 const d=new Set(state(id).done||[]);e.target.checked?d.add(i):d.delete(i);put(id,{done:[...d]});refreshCard(el)});
onLists("input",e=>{if(!e.target.matches("textarea"))return;const el=e.target.closest(".card");put(el.dataset.id,{notes:e.target.value});refreshCard(el)});
$("#chips").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;f.s=f.s===b.dataset.f?"":b.dataset.f;render()});
["#q","#mod","#pri"].forEach(s=>$(s).addEventListener("input",render));
[...new Set(DATA.cases.map(c=>c.module))].sort().forEach(m=>{const o=document.createElement("option");o.textContent=m;$("#mod").appendChild(o)});
const root=document.documentElement;
function applyTheme(t){root.dataset.theme=t;$("#theme").textContent=t==="dark"?"☀ Light mode":"☾ Dark mode";$("#theme").setAttribute("aria-label","Switch to "+(t==="dark"?"light":"dark")+" mode")}
let th=null;try{th=localStorage.getItem("aspio-qa-theme")}catch(e){}
applyTheme(th||"light");
$("#theme").onclick=()=>{const t=root.dataset.theme==="dark"?"light":"dark";applyTheme(t);try{localStorage.setItem("aspio-qa-theme",t)}catch(e){}};
$("#next").onclick=()=>goNext(null);
let all=false;$("#toggleAll").onclick=()=>{all=!all;document.querySelectorAll(".card").forEach(c=>open(c,all));$("#toggleAll").textContent=all?"Collapse all":"Expand all"};
/* ===== Screenshots (stored in IndexedDB, shrunk to JPEG) ===== */
const imgCache={};let idbp=null;
function idb(){if(idbp)return idbp;idbp=new Promise((res,rej)=>{try{const r=indexedDB.open("aspio-qa-shots",1);r.onupgradeneeded=()=>r.result.createObjectStore("s",{keyPath:"id"});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});return idbp}
async function idbTx(mode,fn){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction("s",mode),r=fn(t.objectStore("s"));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error)})}
async function imgPut(o){imgCache[o.id]=o;try{await idbTx("readwrite",s=>s.put(o))}catch(e){}}
async function imgGet(id){if(imgCache[id])return imgCache[id];try{const o=await idbTx("readonly",s=>s.get(id));if(o)imgCache[id]=o;return o||null}catch(e){return null}}
async function imgDel(id){delete imgCache[id];try{await idbTx("readwrite",s=>s.delete(id))}catch(e){}}
function shrink(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();
 im.onload=()=>{const k=Math.min(1,1400/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*k)),h=Math.max(1,Math.round(im.height*k)),c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);URL.revokeObjectURL(u);res({url:c.toDataURL("image/jpeg",.82),w,h})};
 im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error("not an image"))};im.src=u})}
async function addImgs(files){const out=[];for(const f of files){if(!f||!f.type.startsWith("image/"))continue;try{const s=await shrink(f),o={id:"i"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),...s};await imgPut(o);out.push(o.id)}catch(e){}}return out}
function pastedImages(e){const it=[...(e.clipboardData?e.clipboardData.items:[])];return{files:it.filter(i=>i.kind==="file"&&i.type.startsWith("image/")).map(i=>i.getAsFile()).filter(Boolean),hasText:it.some(i=>i.type==="text/plain")}}
const thumbs=(ids,rm=true)=>ids.map(id=>`<figure class="shot"><img alt="Screenshot (click to enlarge)" data-lb="${esc(id)}">${rm?`<button type="button" class="rm" data-rm="${esc(id)}" aria-label="Remove screenshot">✕</button>`:""}</figure>`).join("");
async function fillThumbs(root){for(const im of root.querySelectorAll("img[data-lb]:not([src])")){const o=await imgGet(im.dataset.lb);if(o)im.src=o.url;else im.closest(".shot").remove()}}
async function loadAll(R){for(const x of R)for(const id of (x.imgs||[]))await imgGet(id)}
async function attach(el,files){const id=el.dataset.id,ids=await addImgs(files);if(!ids.length)return;
 put(id,{imgs:[...(state(id).imgs||[]),...ids]});const box=el.querySelector(".shots");box.insertAdjacentHTML("beforeend",thumbs(ids));fillThumbs(box);refreshCard(el)}
onLists("paste",e=>{const ta=e.target.closest&&e.target.closest(".card textarea");if(!ta)return;const p=pastedImages(e);if(!p.files.length)return;if(!p.hasText)e.preventDefault();attach(ta.closest(".card"),p.files)});
onLists("change",async e=>{if(!e.target.matches(".shotbar input[type=file]"))return;const f=[...e.target.files];e.target.value="";await attach(e.target.closest(".card"),f)});
const showLb=url=>{$("#lbimg").src=url;$("#lb").hidden=false};
$("#lb").onclick=()=>{$("#lb").hidden=true};
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#lb").hidden=true});
document.addEventListener("click",async e=>{
 const rm=e.target.closest&&e.target.closest("[data-rm]"),zoom=e.target.closest&&e.target.closest("img[data-lb]");
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
 $("#xAreas").innerHTML=[...new Set(DATA.cases.map(c=>c.module))].sort().map(m=>`<option value="${esc(m)}">`).join("");
 $("#xCount").textContent=(extra.length?extra.length+" logged":"Not in the checklist")+" · saved temporarily in this browser";
 $("#xClear").hidden=!extra.length;
 $("#xList").innerHTML=extra.map((b,i)=>`<div class="xb"><div class="xh"><span class="sev ${esc(b.sev)}">${esc(b.sev)}</span><b>${esc(b.title)}</b><button class="btn out" type="button" data-xe="${esc(b.id)}">Edit</button><button class="btn out" type="button" data-xd="${esc(b.id)}">Delete</button></div><small>BUG-${i+1}${b.area?" · "+esc(b.area):""}${b.link?" · "+esc(b.link):""}</small>${b.steps?`<div class="xs">${esc(b.steps)}</div>`:""}<div class="shots">${thumbs(b.imgs||[],false)}</div></div>`).join("");fillThumbs($("#xList"))}
function clearX(){editId=null;xImgs=[];$("#xShots").innerHTML="";["xTitle","xArea","xSteps","xExp","xAct","xLink"].forEach(i=>$("#"+i).value="");$("#xSev").value="High";$("#xAdd").textContent="Add bug";$("#xCancel").hidden=true}
function addX(){const t=xv("xTitle");if(!t){$("#xTitle").style.borderColor="var(--fail)";$("#xTitle").focus();return}
 $("#xTitle").style.borderColor="";
 const b={id:editId||("x"+Date.now()),title:t,sev:$("#xSev").value,area:xv("xArea"),steps:xv("xSteps"),exp:xv("xExp"),act:xv("xAct"),link:xv("xLink"),imgs:[...xImgs]};
 if(editId)extra=extra.map(x=>x.id===editId?b:x);else extra.push(b);
 storeX();clearX();drawExtra()}
$("#xAdd").onclick=addX;$("#xCancel").onclick=clearX;
$("#xTitle").addEventListener("keydown",e=>{if(e.key==="Enter")addX()});
$("#xList").addEventListener("click",e=>{const d=e.target.closest("[data-xd]"),ed=e.target.closest("[data-xe]");
 if(d){const gone=extra.find(x=>x.id===d.dataset.xd);((gone&&gone.imgs)||[]).forEach(imgDel);extra=extra.filter(x=>x.id!==d.dataset.xd);if(editId===d.dataset.xd)clearX();storeX();drawExtra()}
 if(ed){const b=extra.find(x=>x.id===ed.dataset.xe);if(!b)return;editId=b.id;
  $("#xTitle").value=b.title;$("#xSev").value=b.sev;$("#xArea").value=b.area;$("#xSteps").value=b.steps;$("#xExp").value=b.exp;$("#xAct").value=b.act;$("#xLink").value=b.link;
  xImgs=[...(b.imgs||[])];$("#xShots").innerHTML=thumbs(xImgs);fillThumbs($("#xShots"));$("#xAdd").textContent="Save changes";$("#xCancel").hidden=false;$("#xTitle").scrollIntoView({behavior:"smooth",block:"center"});$("#xTitle").focus()}});
$("#xClear").onclick=()=>{if(confirm("Remove all "+extra.length+" extra bugs logged here?")){extra.flatMap(b=>b.imgs||[]).forEach(imgDel);extra=[];storeX();clearX();drawExtra()}};
async function xAttach(files){const ids=await addImgs(files);if(!ids.length)return;xImgs.push(...ids);$("#xShots").insertAdjacentHTML("beforeend",thumbs(ids));fillThumbs($("#xShots"))}
$("#xPanel").addEventListener("paste",e=>{const p=pastedImages(e);if(!p.files.length)return;if(!p.hasText)e.preventDefault();xAttach(p.files)});
$("#xFile").onchange=async e=>{const f=[...e.target.files];e.target.value="";await xAttach(f)};
drawExtra();
const xOn=()=>extra.length>0&&$("#useX").checked;
const xrows=()=>extra.map((b,i)=>({id:"BUG-"+(i+1),module:b.area||"Not specified",check:b.title,priority:b.sev,status:"New bug",steps:b.steps?b.steps.split(/\n+/).map(s=>s.trim()).filter(Boolean):["(none given)"],expected:b.exp||"(not provided)",notes:[b.act?"Actual: "+b.act:"",b.link?"Evidence / ticket: "+b.link:""].filter(Boolean).join("\n"),group:"Additional bugs (not in checklist)",imgs:b.imgs||[]}));
/* ===== New features page ===== */
const FEAT=[
["NF-01","Access","Feature can be found and opened from its expected entry point","1. Log in as a user who should have access. 2. Open the feature from the menu, button or link where users would expect it.","The feature opens quickly with no error or blank screen.","High"],
["NF-02","Happy path","Main flow works end to end","1. Complete the main task from start to finish using valid data. 2. Check the confirmation or result.","The task completes and the result is shown correctly.","High"],
["NF-03","Validation","Missing and invalid input is handled","1. Leave required fields empty. 2. Enter invalid values (wrong format, too long, negative numbers). 3. Submit.","Clear messages appear and nothing invalid is saved.","High"],
["NF-04","Saved data","Data persists after refresh","1. Create or change something. 2. Refresh the page. 3. Check related screens and lists.","Changes are still there and appear everywhere they should.","High"],
["NF-05","Permissions","Each role sees only what it should","1. Test as owner, manager and staff (or other roles). 2. Try opening the feature through a direct link.","Allowed roles can use it; others are blocked with a clear message.","High"],
["NF-06","Empty and edge cases","Empty states and large data look right","1. Open the feature with no data. 2. Try very long names and many records.","A helpful empty message shows and the layout does not break.","Medium"],
["NF-07","Content","Text, labels and translations are correct","1. Read every label, message and button. 2. Check spelling and tone. 3. Switch language if supported.","No typos, placeholder text or untranslated strings.","Medium"],
["NF-08","Layout","Works on mobile and desktop","1. Open on a phone-sized screen and on desktop. 2. Rotate and resize the window.","Nothing overlaps, is cut off or unreachable, and buttons are easy to tap.","Medium"],
["NF-09","Errors","Failures are handled gracefully","1. Go offline or interrupt a save. 2. Retry.","A clear error is shown and no data is lost or duplicated.","Medium"],
["NF-10","Related features","Existing related features still work","1. Run the related tests from the main checklist.","No existing behavior changed unexpectedly.","High"]
].map(a=>({id:a[0],module:"New feature · "+a[1],check:a[2],steps:a[3],expected:a[4],priority:a[5],grp:0}));
const LAST=[
["LW-A1-01","Staff hours · Area 1","Create assistant — follow company schedule = ON","1. Sign in as company owner 2. Navigate to Add New Assistant page 3. Enable \"Staff hours follow company schedule\" toggle 4. Leave custom-hours fields blank (or at defaults) 5. Click Save / Create 6. Open Firestore → assistants collection → new doc 7. Verify assistant hours match company schedule exactly","All steps succeed; Firebase flag staffHoursFollowCompany is true; stored hours equal company schedule.","High"],
["LW-A1-02","Staff hours · Area 1","Create assistant — follow company schedule = OFF (custom hours)","1. Sign in as company owner 2. Navigate to Add New Assistant 3. Disable \"Staff hours follow company schedule\" 4. Enter custom staff hours (e.g., Mon 10:00–18:00, Tue–Thu 11:00–19:00, Fri–Sun closed) 5. Click Save / Create 6. Open Firestore → new assistant doc 7. Verify stored custom hours match exactly what was entered","Custom hours saved independently; flag is false; stored hours ≠ company schedule.","High"],
["LW-A1-03","Staff hours · Area 1","Day ordering in custom staff schedule (Mon–Sun)","1. On Add New Assistant, disable follow-company 2. Observe the vertical order of day rows 3. (Optional) Save and re-open edit","Days appear strictly Monday→Sunday; no swapped or missing days.","Medium"],
["LW-A1-04","Staff hours · Area 1","Edit assistant — toggle follow-company ↔ custom","1. Open an existing assistant for edit 2. If follow-company: disable it, enter custom hours, save 3. Re-open edit; enable follow-company; save 4. Re-open edit one more time","Flag flips correctly each toggle; hours update to selected mode; no stale custom hours when follow-company is on.","High"],
["LW-A1-05","Staff hours · Area 1","Firebase payload verification (server-side shape)","1. Create an assistant via UI with custom hours 2. Inspect the Firestore document in console 3. Verify no extra or missing fields","Document shape matches build-assistant-firebase-payload.ts; correct field names and types; no phantom fields.","High"],
["LW-A1-EC1","Staff hours · Area 1","Edge: follow-company ON with empty company schedule","1. Save assistant with follow-company ON but company schedule empty/not configured","Validation warning or graceful fallback; no crash.","Medium"],
["LW-A1-EC2","Staff hours · Area 1","Edge: rapid toggle follow-company 5× then save","1. Rapidly toggle follow-company on/off 5 times 2. Save","Last state wins; no duplicate submissions.","Medium"],
["LW-A1-EC3","Staff hours · Area 1","Edge: navigate away without saving","1. Navigate away from Add New Assistant without saving","Unsaved changes warning (if implemented) or silent discard; no partial record created.","Medium"],
["LW-A2-06","SMS phone suppression · Area 2","Toggle suppression on single customer","1. Open customer detail modal 2. Toggle SMS suppression ON → save → re-open → OFF → save","Toggle persists; sms_phone_suppression flips on customer doc.","High"],
["LW-A2-07","SMS phone suppression · Area 2","Suppressed-phone document lifecycle","1. Suppression ON → check Firestore for suppressed-phone doc 2. Suppression OFF → check Firestore","Doc exists while ON; removed when OFF.","High"],
["LW-A2-08","SMS phone suppression · Area 2","Bulk suppress/unsuppress","1. Customers page → multi-select → bulk SMS dialog → apply","All selected updated; no console errors.","High"],
["LW-A2-09","SMS phone suppression · Area 2","API suppression payload","1. PATCH /api/customers/[id] with suppression body 2. GET customer","200; field updated.","High"],
["LW-A2-10","SMS phone suppression · Area 2","Delete suppressed phone script","1. Run scripts/delete-suppressed-phone.mjs against test phone","Doc removed; script exits cleanly.","Medium"],
["LW-A2-11","SMS phone suppression · Area 2","Guest customer suppression","1. Guest customer (no userId) → apply suppression → verify","Stored and respected; no bypass.","Medium"],
["LW-A3-12","Customer SMS business preferences · Area 3","SMS business toggles per customer","1. Customer detail modal → toggle opt-in/out → save → re-open","Saved per customer; reflected on record.","Medium"],
["LW-A3-13","Customer SMS business preferences · Area 3","Bulk SMS business dialog","1. Customers page → multi-select → bulk dialog → apply → verify each","All selected updated consistently.","Medium"],
["LW-A3-14","Customer SMS business preferences · Area 3","Settings page SMS preferences","1. Settings → SMS business preferences → save → check default inheritance","Global setting saved; new/no-override customers inherit.","Medium"],
["LW-A4-15","Staff management & multi-staff service blocks · Area 4","Staff user_uid","1. Create/edit staff with user_uid → save → query API/Firestore","Stored; lookups by user_uid work.","Medium"],
["LW-A4-16","Staff management & multi-staff service blocks · Area 4","Multi-staff booking","1. Create service allowing multiple staff → booking → assign 2+ staff → save","Accepts multiple staff; all visible on booking.","Medium"],
["LW-A4-17","Staff management & multi-staff service blocks · Area 4","Invalid staff validation","1. Assign non-existent/inactive staff → save","Validation message; save blocked.","Medium"],
["LW-A4-18","Staff management & multi-staff service blocks · Area 4","Staff dashboard metrics","1. Open Staff Dashboard → metrics load","Render without errors; data present.","Medium"],
["LW-A5-22","SAR · Area 5","Staff personal number","1. Staff management → add personal number → save → view","Stored and displayed where SAR access allows.","Medium"],
["LW-A5-23","SAR · Area 5","SAR page renders","1. Navigate to SAR page","Loads without errors; staff data shown.","Medium"],
["LW-A5-24","SAR · Area 5","SAR view employees/settings","1. Open both sub-pages","Render without errors; consistent with staff records.","Medium"],
["LW-A5-25","SAR · Area 5","SAR nav gating","1. Sign in with SAR entitlement → items visible 2. Without → hidden","Correctly gated by entitlement.","Medium"],
["LW-A5-26","SAR · Area 5","Attendance SAR access","1. Call attendance API with/without SAR permission","200 with permission; 403 without.","Medium"],
["LW-A6-27","Attendance · Area 6","Check-in/check-out log","1. Staff checks in/out → inspect attendance-logs","Log created with correct staff ID + timestamps.","Medium"],
["LW-A6-28","Attendance · Area 6","Attendance query endpoints","1. Call today, last-7-days, open-shifts, modify","Correct filtered data; no 500s.","Medium"],
["LW-A6-29","Attendance · Area 6","Attendance logs Firestore index","1. Run filtered+ordered query","Executes without \"index missing\" warning.","Medium"],
["LW-A6-30","Attendance · Area 6","Dashboard analytics/staff metrics","1. Open dashboard analytics panels","Populate with data; charts/tables render.","Medium"],
["LW-A6-31","Attendance · Area 6","Booking date grouping","1. Create bookings on different dates → dashboard API","Grouped by correct date; no timezone shift.","Medium"],
["LW-A7-32","Onboarding AI toggle removal · Area 7","AI panels no longer reference removed toggle","1. Open onboarding AI suggest/feedback panels","Render; no references to removed toggle; no console errors.","Low"],
["LW-A7-33","Onboarding AI toggle removal · Area 7","Service blocks / add-new-service without toggle","1. Open both pages","Render correctly; no broken UI where toggle was.","Low"],
["LW-A8-34","Dashboard / settings / translations · Area 8","Dashboard cards CARD_META_TEXT","1. Open dashboard home; inspect card metadata","Consistent styling; no broken layout.","Low"],
["LW-A8-35","Dashboard / settings / translations · Area 8","Settings page loads","1. Open Settings (SAR logic commented out)","Loads; no crashes.","Low"],
["LW-A8-36","Dashboard / settings / translations · Area 8","Staff list filter + staff page","1. Open filter popover + staff page","Render; filters functional.","Low"],
["LW-A8-37","Dashboard / settings / translations · Area 8","Discount capitalization EN/SV","1. Switch language; view discount text","Capitalized correctly in both languages.","Low"]
].map(a=>({id:a[0],module:a[1],check:a[2],steps:a[3],expected:a[4],priority:a[5]}));
const DEVELOP=[
["D-01","Develop · Customer search","Customer search — prefix matching & two-word split","1. Open customers page → type partial first/last name → prefix matches return ≤15 results 2. Type two words (\"First Last\") → first word treated as first name, second as last name","Prefix matches return up to 15 results; two-word input splits into first + last name.","High"],
["D-02","Develop · Customer search","Customer search — caching & debounce","1. Search, then repeat same search → result served from browser cache (no re-fetch) for same user/company 2. Empty search → not cached; re-fetches on next non-empty query 3. Wait 0.5s after typing stops → search triggers","Repeat search served from cache; empty search not cached; 0.5s debounce applies.","High"],
["D-03","Develop · Customer search","Booking search / add-booking — prefix query","1. Booking search / add-booking customer field → performs prefix query 2. Verify it no longer downloads every customer","No full customer download; prefix query used.","High"],
["D-04","Develop · Customer search","Customer detail — fresh stats read","1. Open a single customer detail → reads only that customer for fresh stats","Reads only that customer, not all customers.","Medium"],
["D-05","Develop · Customer search","Customer without userId — bookings by email","1. Customer without userId → booking history loaded by email, not by downloading all bookings","Booking history loaded by email.","Medium"],
["D-06","Develop · Firebase read reduction","Week-view add-booking — company portal reads","1. Week-view add-booking → company portal loads owner/manager/staff company ids from user doc, then loads each company once","Loads each company once, not per booking.","High"],
["D-07","Develop · Firebase read reduction","Customer sidebar / booking search — reduced reads","1. Customer sidebar / booking search → verify reduced Firebase reads in browser network/Firestore logs","Reduced Firebase reads observed.","High"],
["D-08","Develop · Image compression","RestaurantMenuEditorPanel — compress before save","1. RestaurantMenuEditorPanel → upload an image → verify it's compressed before save","Image compressed before save.","Medium"],
["D-09","Develop · Image compression","WebsiteEditorContext — compress & large file","1. WebsiteEditorContext → upload image in website editor → verify compression applied 2. Large file upload → confirm no failure and reasonable file size stored","Compression applied; large file uploads without failure.","Medium"],
["D-10","Develop · Support contact","Support contact display & sync","1. Public website → support contact email/phone displays from company settings 2. Edit support contact in company settings → syncs to website preview/publish 3. Website support contact API routes return correct email/phone","Displays from settings; syncs to website; API routes correct.","Medium"],
["D-11","Develop · Email verification","Email verification & password reset flow","1. Trigger email verification → verification email sent 2. Click verification link → app/auth/action/page handles confirm/reset, user confirmed 3. Password reset flow → reset email sent, link works, password updated 4. Translations for confirmation/reset present in EN and SV","Verification email sent; confirm/reset handled; password reset works; EN/SV translations present.","High"],
["D-12","Develop · Discount campaign","Discount campaign booking window","1. Create discount campaign → set booking availability fields (start/end, days) 2. Booking window validation works (invalid dates blocked, toast shown) 3. Campaign applies discount within booking window, outside window no discount 4. Translation JSON is valid (no broken closures across languages)","Validation blocks invalid dates + toast; discount applies in-window only; translation JSON valid.","Medium"],
["D-13","Develop · Staff metrics","Custom date picker — period selection","1. Staff metrics page → open custom date picker → select period 2. Period chips + metrics filter wired → chart/table updates for selected range 3. Staff metrics period selection persists correctly","Chart/table updates for selected range; period persists.","Medium"],
["D-14","Develop · Staff hours (carry-over)","Staff hours follow company schedule","1. New assistant: follow company schedule = on → hours match company 2. Custom staff hours → saved independently, days ordered Mon–Sun 3. Toggle follow-company ↔ custom on edit; Firebase payload flag correct","Follow-company hours match company; custom hours saved independently; flag correct on toggle.","High"],
["D-15","Develop · SMS phone suppression (carry-over)","SMS phone suppression","1. Customer detail modal → toggle suppression on/off → saved 2. Suppressed phone doc created/deleted in Firestore 3. Bulk select on customers page → bulk suppress/unsuppress dialog 4. PATCH /api/customers/[customerId] suppression payload 5. scripts/delete-suppressed-phone.mjs removes doc 6. Guest customer suppression synchronized (no bypass)","Toggle persists + doc lifecycle correct; bulk suppress works; API/script/guest suppression correct.","High"],
["D-16","Develop · Customer SMS business preferences (carry-over)","Customer SMS business preferences","1. Customer detail modal SMS toggles → saved per customer 2. Bulk SMS business dialog → applies to selected customers 3. Settings page SMS business preferences saved","Toggles saved per customer; bulk dialog applies; global setting saved.","Medium"],
["D-17","Develop · Staff management & multi-staff (carry-over)","Staff management & multi-staff service blocks","1. Staff member with user_uid → stored and used for lookups 2. Booking with multiple staff → validation passes, all staff displayed 3. Invalid staff selection → validation message 4. Staff dashboard performance metrics load","user_uid stored; multi-staff booking works; invalid staff blocked; metrics load.","Medium"],
["D-18","Develop · SAR (carry-over)","SAR (personal data)","1. Staff personal number field → stored/displayed 2. SAR page / view employees / view settings render 3. Dashboard layout + sidebar SAR items appear per entitlement 4. Attendance APIs enforce SAR access (with/without permission)","Personal number stored/displayed; SAR pages render; entitlement gating correct; SAR access enforced.","Medium"],
["D-19","Develop · Attendance (carry-over)","Attendance","1. Check-in/check-out → attendance log with correct staff 2. Today / last-7-days / open-shifts / modify endpoints 3. Attendance logs Firestore index → queries perform 4. Dashboard analytics / staff metrics render 5. Booking date grouping correct in dashboard API","Logs created with correct staff; endpoints return correct data; indexes perform; analytics render; date grouping correct.","Medium"],
["D-20","Develop · Onboarding AI toggle (carry-over, still present)","Onboarding AI toggle — regression","1. Onboarding AI suggest/feedback panels work (toggle not yet removed on develop) 2. Service blocks / add-new-service page renders with AI toggle state 3. No console errors where toggle is used","AI panels work; pages render with toggle; no console errors.","Low"],
["D-21","Develop · Dashboard / settings / translations (carry-over)","Dashboard / settings / translations — regression","1. Dashboard home cards with CARD_META_TEXT styling 2. Settings page loads (SAR commented-out logic doesn't break it) 3. Staff list filter popover + staff page render 4. Discount capitalization fixed in EN and SV","Cards styled consistently; Settings loads; filters render; EN/SV capitalization correct.","Low"]
].map(a=>({id:a[0],module:a[1],check:a[2],steps:a[3],expected:a[4],priority:a[5]}));
function drawFeatList(){$("#featList").innerHTML=FEAT.map(card).join("");document.querySelectorAll("#featList .card").forEach(refreshCard);fillThumbs($("#featList"))}
function fstats(){const c={};FEAT.forEach(i=>{const s=state(i.id).status;c[s]=(c[s]||0)+1});const T=FEAT.length,dn=T-(c["Not tested"]||0);
 $("#fpct").textContent=Math.round(dn/T*100)+"%";$("#fdone").textContent=dn+" of "+T+" checked";
 [["fp","Passed"],["ff","Failed"],["fb","Blocked"],["fn","Not applicable"]].forEach(([i,s])=>$("#"+i).style.width=((c[s]||0)/T*100)+"%")}
function lstats(){const c={};LAST.forEach(i=>{const s=state(i.id).status;c[s]=(c[s]||0)+1});const T=LAST.length,dn=T-(c["Not tested"]||0);
 $("#lpct").textContent=Math.round(dn/T*100)+"%";$("#ldone").textContent=dn+" of "+T+" tested";
 [["lp","Passed"],["lf","Failed"],["lb","Blocked"],["ln","Not applicable"]].forEach(([i,s])=>$("#"+i).style.width=((c[s]||0)/T*100)+"%")}
function renderLast(){
 const q=$("#q").value.toLowerCase();
 const list=LAST.filter(c=>!q||[c.id,c.module,c.check].join(" ").toLowerCase().includes(q));
 const groups={};list.forEach(c=>{if(!groups[c.module])groups[c.module]=[];groups[c.module].push(c)});
 let h="";
 for(const [mod,cs] of Object.entries(groups)){
   h+=`<div class="gh"><div><h2>${esc(mod)}</h2></div><span>${cs.length}</span></div>`+cs.map(card).join("");
 }
 $("#lastList").innerHTML=h||'<div class="empty">No tests match these filters.</div>';
 document.querySelectorAll("#lastList .card").forEach(refreshCard);lstats();fillThumbs($("#lastList"))}
function dstats(){const c={};DEVELOP.forEach(i=>{const s=state(i.id).status;c[s]=(c[s]||0)+1});const T=DEVELOP.length,dn=T-(c["Not tested"]||0);
 $("#dpct").textContent=Math.round(dn/T*100)+"%";$("#ddone").textContent=dn+" of "+T+" tested";
 [["dp","Passed"],["df","Failed"],["db","Blocked"],["dn","Not applicable"]].forEach(([i,s])=>$("#"+i).style.width=((c[s]||0)/T*100)+"%")}
function renderDevelop(){
 const q=$("#q").value.toLowerCase();
 const list=DEVELOP.filter(c=>!q||[c.id,c.module,c.check].join(" ").toLowerCase().includes(q));
 const groups={};list.forEach(c=>{if(!groups[c.module])groups[c.module]=[];groups[c.module].push(c)});
 let h="";
 for(const [mod,cs] of Object.entries(groups)){
   h+=`<div class="gh"><div><h2>${esc(mod)}</h2></div><span>${cs.length}</span></div>`+cs.map(card).join("");
 }
 $("#developList").innerHTML=h||'<div class="empty">No tests match these filters.</div>';
 document.querySelectorAll("#developList .card").forEach(refreshCard);dstats();fillThumbs($("#developList"))}
$("#fNext").onclick=()=>{const n=document.querySelector('#featList .card[data-s="Not tested"]');if(n){open(n,true);n.scrollIntoView({behavior:"smooth",block:"center"})}else alert("All feature checks are done. Nice work!")};
$("#exp2").onclick=()=>openExp();
try{$("#fName").value=localStorage.getItem("aspio-qa-fname")||""}catch(e){}
$("#fName").addEventListener("input",()=>{try{localStorage.setItem("aspio-qa-fname",$("#fName").value)}catch(e){}});

/* Labels + issues log */
const LK="aspio-qa-labels",FK="aspio-qa-fissues";
let LAB=null;try{LAB=JSON.parse(localStorage.getItem(LK))}catch(e){}
if(!Array.isArray(LAB))LAB=["Bug","Content issue","UI / UX","Typo","Idea"];
let fIssues=[];try{fIssues=JSON.parse(localStorage.getItem(FK)||"[]")}catch(e){}if(!Array.isArray(fIssues))fIssues=[];
const saveL=()=>{try{localStorage.setItem(LK,JSON.stringify(LAB))}catch(e){}},saveF=()=>{try{localStorage.setItem(FK,JSON.stringify(fIssues))}catch(e){}};
let fiSel=[],fiImgs=[],fiEdit=null,fiFilt="",manage=false;
const hue=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%360;return h};
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
 saveF();resetFi();drawFeat()}
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
 if(d){const g=fIssues.find(x=>x.id===d.dataset.fd);((g&&g.imgs)||[]).forEach(imgDel);fIssues=fIssues.filter(x=>x.id!==d.dataset.fd);if(fiEdit===d.dataset.fd)resetFi();saveF();drawFeat()}
 if(ed){const b=fIssues.find(x=>x.id===ed.dataset.fe);if(!b)return;
  b.labels.forEach(l=>{if(!LAB.some(x=>x.toLowerCase()===l.toLowerCase())){LAB.push(l);saveL()}});
  fiEdit=b.id;$("#fiTitle").value=b.title;$("#fiDetails").value=b.details||"";$("#fiSev").value=b.sev;$("#fiLink").value=b.link||"";fiSel=[...b.labels];fiImgs=[...(b.imgs||[])];
  $("#fiShots").innerHTML=thumbs(fiImgs);fillThumbs($("#fiShots"));$("#fiAdd").textContent="Save changes";$("#fiCancel").hidden=false;drawLib();
  $("#fiTitle").scrollIntoView({behavior:"smooth",block:"center"});$("#fiTitle").focus()}});
async function fiAttach(files){const ids=await addImgs(files);if(!ids.length)return;fiImgs.push(...ids);$("#fiShots").insertAdjacentHTML("beforeend",thumbs(ids));fillThumbs($("#fiShots"))}
$("#fiPanel").addEventListener("paste",e=>{const p=pastedImages(e);if(!p.files.length)return;if(!p.hasText)e.preventDefault();fiAttach(p.files)});
$("#fiFile").onchange=async e=>{const f=[...e.target.files];e.target.value="";await fiAttach(f)};
/* export hooks */
const fOn=()=>$("#useFeat").checked;
const frows=()=>{const fn=SCOPES.find(s=>s[0]===scope)[2],lab=$("#expLabel").value;
 const c=FEAT.filter(i=>fn(state(i.id).status)).map(i=>({id:i.id,module:i.module,check:i.check,priority:i.priority,status:state(i.id).status,steps:stepsOf(i.steps),expected:i.expected,notes:(state(i.id).notes||"").trim(),group:"New feature checklist",imgs:state(i.id).imgs||[],labels:[]}));
 const q=fIssues.map((b,i)=>({b,i})).filter(o=>!lab||o.b.labels.includes(lab)).map(({b,i})=>({id:"ISSUE-"+(i+1),module:"New feature issue",check:b.title,priority:b.sev,status:"Issue",steps:[],expected:"",nlabel:"DETAILS",notes:[b.details,b.link?"Evidence / ticket: "+b.link:""].filter(Boolean).join("\n"),group:"New feature issues",imgs:b.imgs||[],labels:b.labels||[]}));
 return [...c,...q]};
const lrows=()=>LAST.map(i=>({id:i.id,module:i.module,check:i.check,priority:i.priority,status:state(i.id).status,steps:stepsOf(i.steps),expected:i.expected,notes:(state(i.id).notes||"").trim(),group:"Last week's changes",imgs:state(i.id).imgs||[],labels:[]}));
const drows=()=>DEVELOP.map(i=>({id:i.id,module:i.module,check:i.check,priority:i.priority,status:state(i.id).status,steps:stepsOf(i.steps),expected:i.expected,notes:(state(i.id).notes||"").trim(),group:"Develop branch",imgs:state(i.id).imgs||[],labels:[]}));
function fillExpLabels(){const u=[...new Set(fIssues.flatMap(b=>b.labels))].sort(),el=$("#expLabel");el.innerHTML='<option value="">Any label</option>'+u.map(l=>`<option>${esc(l)}</option>`).join("")}
$("#useFeat").onchange=()=>drawScope();$("#expLabel").onchange=()=>refreshExp();
/* tabs */
function showPage(p){curPage=p;
 $("#pgCheck").hidden=p!=="check";
 $("#pgFeat").hidden=p!=="features";
 $("#pgLast").hidden=p!=="lastweek";
 $("#pgDevelop").hidden=p!=="develop";
 document.querySelectorAll(".tabs button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===p)));
 $("#heroP").innerHTML=p==="features"?"Test what’s new. Tick the basics, then log every bug, content issue or idea with labels.":p==="lastweek"?"Last week’s changes — run the tracked test cards for changes landing on main.":p==="develop"?"Develop branch — run the tracked test cards for origin/develop.":"Tap <b>Pass</b> or <b>Fail</b> on each test. Open a card only when you need the steps or want to leave a note.";
 window.scrollTo({top:0});
 if(p==="check")render();else if(p==="features")drawFeatList();else if(p==="lastweek")renderLast();else renderDevelop()}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{const t=b.dataset.tab;try{location.hash=t==="features"?"features":"check"}catch(e){}showPage(t)});
$("#gotoLast").onclick=()=>{try{location.hash="#lastweek"}catch(e){}showPage("lastweek")};
$("#gotoDevelop").onclick=()=>{try{location.hash="#develop"}catch(e){}showPage("develop")};
$("#backToCheck").onclick=()=>{try{location.hash="#checklist"}catch(e){}showPage("check")};
$("#backToDevelop").onclick=()=>{try{location.hash="#checklist"}catch(e){}showPage("check")};
$("#lNext").onclick=()=>lNext(null);
$("#dNext").onclick=()=>dNext(null);
$("#exp3").onclick=()=>openExp();
$("#exp4").onclick=()=>openExp();
window.addEventListener("hashchange",()=>{const h=location.hash;showPage(h==="#features"?"features":h==="#lastweek"?"lastweek":h==="#develop"?"develop":"check")});
drawFeatList();drawFeat();showPage(location.hash==="#features"?"features":location.hash==="#lastweek"?"lastweek":location.hash==="#develop"?"develop":"check");
/* ===== Export / print ===== */
const SCOPES=[["all","All tests",()=>true],["Not tested","Not tested",s=>s==="Not tested"],["Passed","Passed",s=>s==="Passed"],["Failed","Failed",s=>s==="Failed"],["Blocked","Blocked",s=>s==="Blocked"],["attn","Failed + Blocked",s=>s==="Failed"||s==="Blocked"],["Not applicable","N/A",s=>s==="Not applicable"]];
let scope="all",useF=false;
const scopeName=()=>SCOPES.find(s=>s[0]===scope)[1];
function scoped(){const fn=SCOPES.find(s=>s[0]===scope)[2],q=$("#q").value.toLowerCase(),m=$("#mod").value,p=$("#pri").value;
 return items.filter(c=>fn(state(c.id).status)&&(!useF||((!q||[c.id,c.module,c.check].join(" ").toLowerCase().includes(q))&&(!m||c.module===m)&&(!p||c.priority===p))))}
const baseRows=list=>list.map(c=>({id:c.id,module:c.module,check:c.check,priority:c.priority,status:state(c.id).status,steps:stepsOf(c.steps),expected:c.expected,notes:(state(c.id).notes||"").trim(),group:GRP[c.grp],imgs:state(c.id).imgs||[]}));
const rows=list=>[...baseRows(list),...(xOn()?xrows():[]),...(fOn()?frows():[]),...(useLast?lrows():[]),...(useDevelop?drows():[])];
const meta=()=>({feature:$("#fName").value.trim(),tester:$("#tester").value.trim(),build:$("#build").value.trim(),decision:$("#decision").value,date:$("#date").value||new Date().toISOString().slice(0,10),scope:scopeName()+(useF?" (filtered)":"")});
const slug=()=>meta().scope.replace(/[^a-z0-9]+/gi,"_").replace(/^_|_$/g,"");
function summaryText(){const c={};items.forEach(i=>{const s=state(i.id).status;c[s]=(c[s]||0)+1});
 return "Overall: "+items.length+" tests - "+(c.Passed||0)+" passed, "+(c.Failed||0)+" failed, "+(c.Blocked||0)+" blocked, "+(c["Not applicable"]||0)+" N/A, "+(c["Not tested"]||0)+" not tested"}
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
 y=110;tx(summaryText(),{sz:9.5,c:[90,80,110]});
 if(m.decision)tx("Release decision: "+m.decision,{sz:10,b:1});
 tx(list.length+" test"+(list.length===1?"":"s")+(R.length>list.length?" + "+(R.length-list.length)+" other bug"+(R.length-list.length===1?"":"s"):"")+" in this report",{sz:10,b:1,gap:6});
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
 $("#printArea").innerHTML=`<h1>Aspio Business App · QA test report</h1><p class="pm">Scope: <b>${esc(m.scope)}</b>${m.feature?" · Feature: <b>"+esc(m.feature)+"</b>":""} · ${list.length} test${list.length===1?"":"s"}${R.length>list.length?" + "+(R.length-list.length)+" other bug"+(R.length-list.length===1?"":"s"):""} · ${esc(m.date)}${m.tester?" · Tester: "+esc(m.tester):""}${m.build?" · Build: "+esc(m.build):""}${m.decision?" · Decision: "+esc(m.decision):""}</p><p class="pm">${esc(summaryText())}</p>`+
 R.map(x=>`<section class="pi s-${x.status.replace(/ /g,"_")}"><div class="ph"><b>${esc(x.id)}</b><span>${esc(x.module)} · ${esc(x.priority)}</span><em>${esc(x.status)}</em></div><h3>${esc(x.check)}</h3>${(x.labels||[]).length?`<div class="pl">Labels: ${esc(x.labels.join(", "))}</div>`:""}${x.expected?`<div class="pl">Expected result</div><p>${esc(x.expected)}</p>`:""}${x.steps.length?`<div class="pl">Steps</div><ol>${x.steps.map(s=>"<li>"+esc(s)+"</li>").join("")}</ol>`:""}<div class="pl">${esc(x.nlabel||"Actual result / notes")}</div><p>${x.notes?esc(x.notes):"<i>No notes recorded</i>"}</p>${(x.imgs||[]).map(id=>imgCache[id]).filter(Boolean).map(o=>`<img class="pimg" src="${o.url}" alt="Screenshot">`).join("")}</section>`).join("");
 document.body.classList.add("printing");
 const done=()=>{document.body.classList.remove("printing");window.removeEventListener("afterprint",done)};
 window.addEventListener("afterprint",done);
 setTimeout(()=>{try{window.print()}catch(e){}setTimeout(done,1500)},60)}
function refreshExp(){useF=$("#useF").checked;useLast=$("#useLast").checked;useDevelop=$("#useDevelop").checked;const n=scoped().length+(xOn()?extra.length:0)+(fOn()?frows().length:0)+(useLast?lrows().length:0)+(useDevelop?drows().length:0);$("#expCount").textContent=n+" item"+(n===1?"":"s")+" will be included";["goPdf","goCsv","goPrint"].forEach(i=>$("#"+i).disabled=!n)}
function drawScope(){$("#scope").innerHTML=SCOPES.map(s=>`<button class="chip" type="button" data-sc="${s[0]}" aria-pressed="${scope===s[0]}">${s[1]} <b>${[...items,...(fOn()?FEAT:[]),...LAST,...DEVELOP].filter(i=>s[2](state(i.id).status)).length}</b></button>`).join("");refreshExp()}
function openExp(){scope=[...items,...FEAT,...LAST,...DEVELOP].some(i=>state(i.id).status==="Failed")?"Failed":"all";$("#expMsg").textContent="";$("#useX").checked=extra.length>0;$("#useX").disabled=!extra.length;$("#xN").textContent=extra.length;$("#useFeat").checked=fIssues.length>0||FEAT.some(i=>state(i.id).status!=="Not tested");$("#fN").textContent=FEAT.length;$("#fiN").textContent=fIssues.length;$("#useLast").checked=LAST.some(i=>state(i.id).status!=="Not tested");$("#lN").textContent=LAST.length;$("#useDevelop").checked=DEVELOP.some(i=>state(i.id).status!=="Not tested");$("#dN").textContent=DEVELOP.length;fillExpLabels();$("#modal").hidden=false;drawScope();$("#goPdf").focus()}
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
$("#useF").onchange=refreshExp;$("#useX").onchange=refreshExp;$("#useLast").onchange=refreshExp;$("#useDevelop").onchange=refreshExp;
$("#goPdf").onclick=()=>runExp("pdf");$("#goCsv").onclick=()=>runExp("csv");$("#goPrint").onclick=()=>runExp("print");

$("#reset").onclick=()=>{if(confirm("Reset all test statuses, notes, logged bugs and new-feature items saved in this browser? (Your label list is kept.)")){[...Object.values(saved).flatMap(s=>s.imgs||[]),...extra.flatMap(b=>b.imgs||[])].forEach(imgDel);saved={};store();extra=[];storeX();clearX();drawExtra();fIssues.flatMap(b=>b.imgs||[]).forEach(imgDel);fIssues=[];saveF();resetFi();drawFeat();drawFeatList();render()}};

["tester","build","date","decision","pmNotes"].forEach(id=>{const el=$("#"+id);try{el.value=localStorage.getItem("aspio-qa-"+id)||""}catch(e){}el.addEventListener("input",()=>{try{localStorage.setItem("aspio-qa-"+id,el.value)}catch(e){}})});
render();

