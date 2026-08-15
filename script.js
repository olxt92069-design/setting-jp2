const STORAGE_KEY="chaos_call_scatter_v1";

const providers={
  "PG Soft":["Mahjong Ways 2","Mahjong Ways 3","Lucky Neko","Treasures of Aztec"],
  "Pragmatic Play":["Gates of Olympus","Sweet Bonanza","Starlight Princess","Sugar Rush"],
  "Habanero":["Hot Hot Fruit","Fa Cai Shen","Koi Gate","Presto!"],
  "Joker Gaming":["Roma X","Supermarket Spree","Golden Empress"],
  "Spadegaming":["Lucky Koi","Fiery Sevens","Jewel Scarabs"]
};

const seed=[
 {id:1,agent:"ClaudiaChesaa",agentUser:"agent_claudiachesaa",level:"HEAD",whatsapp:"08929292929",provider:"PG Soft",game:"Mahjong Ways 2",callType:"Scatter",target:"2+ Scatter",status:"Active",created:"2026-08-15T03:41",note:"Prioritas call scatter"},
 {id:2,agent:"ClaudiaChesaa",agentUser:"agent_claudiachesaa",level:"HEAD",whatsapp:"081234567890",provider:"Pragmatic Play",game:"Gates of Olympus",callType:"Scatter",target:"2+ Scatter",status:"Active",created:"2026-08-15T02:28",note:""},
 {id:3,agent:"ClaudiaChesaa",agentUser:"agent_claudiachesaa",level:"HEAD",whatsapp:"082345678901",provider:"Habanero",game:"Hot Hot Fruit",callType:"Bonus",target:"Bonus Trigger",status:"Pending",created:"2026-08-14T23:17",note:"Review sebelum aktif"},
 {id:4,agent:"RizkyAgent",agentUser:"agent_rizky",level:"SUB",whatsapp:"085700112233",provider:"PG Soft",game:"Lucky Neko",callType:"Scatter",target:"3+ Scatter",status:"Active",created:"2026-08-14T21:09",note:""},
 {id:5,agent:"RizkyAgent",agentUser:"agent_rizky",level:"SUB",whatsapp:"085788990011",provider:"Joker Gaming",game:"Roma X",callType:"Jackpot",target:"Jackpot Hit",status:"Inactive",created:"2026-08-14T19:44",note:"Nonaktif sementara"},
 {id:6,agent:"NocTraa",agentUser:"noctraa",level:"HEAD",whatsapp:"087711223344",provider:"Spadegaming",game:"Lucky Koi",callType:"Scatter",target:"2+ Scatter",status:"Active",created:"2026-08-13T18:30",note:""},
 {id:7,agent:"NocTraa",agentUser:"noctraa",level:"HEAD",whatsapp:"088812345678",provider:"Pragmatic Play",game:"Sweet Bonanza",callType:"Scatter",target:"2+ Scatter",status:"Pending",created:"2026-08-13T15:12",note:""}
];

let data=loadData();
let currentPage=1;
const perPage=4;
let pendingDelete=null;

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function loadData(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved)&&saved.length?saved:seed;
  }catch{return seed}
}
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function formatDate(v){
  const d=new Date(v);
  if(Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
}
function formatDateTime(v){
  const d=new Date(v);
  if(Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("sv-SE",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).replace("T"," ");
}
function statusBadge(status){
  const cls=status==="Active"?"status-active":status==="Pending"?"status-pending":"status-inactive";
  const icon=status==="Active"?"circle-check":status==="Pending"?"clock-3":"circle-x";
  return `<span class="badge ${cls}"><i data-lucide="${icon}"></i>${esc(status)}</span>`;
}
function agentGroups(records){
  const map=new Map();
  agents.forEach(a=>map.set(a.name,{agent:a.name,agentUser:a.username,level:a.level,status:a.status,created:a.created,records:[]}));
  records.forEach(r=>{
    if(!map.has(r.agent)){
      map.set(r.agent,{agent:r.agent,agentUser:r.agentUser||("agent_"+slug(r.agent)),level:r.level||"SUB",status:"Active",created:r.created,records:[]});
    }
    const g=map.get(r.agent);
    g.records.push(r);
    if(r.agentUser)g.agentUser=r.agentUser;
    if(r.level)g.level=r.level;
  });
  return [...map.values()];
}
function filteredData(){
  const q=($("#tableSearch").value||$("#globalSearch").value||"").trim().toLowerCase();
  const provider=$("#providerFilter").value;
  const status=$("#statusFilter").value;
  const type=$("#callTypeFilter").value;
  return data.filter(r=>{
    const hay=[r.agent,r.agentUser,r.whatsapp,r.provider,r.game,r.status,r.callType,r.target,r.note].join(" ").toLowerCase();
    return (!q||hay.includes(q))&&(!provider||provider==="all"||r.provider===provider)&&(!status||status==="all"||r.status===status)&&(!type||type==="all"||r.callType===type);
  });
}
function render(){
  updateStats();
  const groups=agentGroups(filteredData());
  const totalPages=Math.max(1,Math.ceil(groups.length/perPage));
  if(currentPage>totalPages)currentPage=totalPages;
  const pageGroups=groups.slice((currentPage-1)*perPage,currentPage*perPage);
  const wrap=$("#agentRows");
  $("#emptyState").hidden=groups.length!==0;
  wrap.innerHTML=pageGroups.map((g,i)=>agentTemplate(g,(currentPage-1)*perPage+i)).join("");
  renderPagination(totalPages);
  lucide.createIcons();
}
function agentTemplate(g,index){
  const open=sessionStorage.getItem("open_"+g.agent)==="1";
  const rows=g.records.map(r=>memberTemplate(r)).join("");
  const status=g.status || (g.records.some(r=>r.status==="Active")?"Active":(g.records[0]?.status||"Inactive"));
  const created=g.created || g.records[0]?.created || new Date().toISOString();
  return `<div class="agent-row">
    <div><button class="expand-btn ${open?"open":""}" data-expand="${esc(g.agent)}"><i data-lucide="chevron-right"></i></button></div>
    <div class="agent-cell"><div class="agent-icon"><i data-lucide="shield"></i></div><div class="agent-name"><div class="agent-name-line"><strong class="agent-name-click" title="Klik untuk ubah nama" data-edit-agent="${esc(g.agent)}">${esc(g.agent)}</strong><button class="name-edit-btn" title="Ubah nama agent" data-edit-agent="${esc(g.agent)}"><i data-lucide="pencil"></i></button></div><small>${esc(g.agentUser)}</small></div></div>
    <div><span class="badge level"><i data-lucide="layers-3"></i>${esc(g.level)}</span></div>
    <div><span class="badge count"><i data-lucide="users"></i>${g.records.length} setting${g.records.length===1?"":"s"}</span></div>
    <div>${statusBadge(status)}</div>
    <div class="created"><span class="badge"><i data-lucide="calendar-days"></i>${formatDate(created)}</span></div>
    <div class="agent-action-group">
      <button class="action-btn agent-edit" title="Edit Agent" data-edit-agent="${esc(g.agent)}"><i data-lucide="pencil"></i></button>
      <button class="action-btn agent-delete" title="Delete Agent" data-delete-agent="${esc(g.agent)}"><i data-lucide="trash-2"></i></button>
      <button class="action-btn edit" title="Add setting" data-add-agent="${esc(g.agent)}"><i data-lucide="plus"></i></button>
    </div>
    ${open?`<div class="member-section"><div class="member-title"><i data-lucide="radio-tower"></i> Call Scatter Settings of ${esc(g.agent)} (${g.records.length})</div><div class="member-table"><div class="member-head"><div>INTERNAL USER</div><div>WHATSAPP USER</div><div>GAME PROVIDER</div><div>GAME NAME</div><div>CALL TYPE</div><div>STATUS / CREATED</div><div>ACTION</div></div>${rows || `<div class="empty-state">No call scatter settings for this agent.</div>`}</div></div>`:""}
  </div>`;
}
function memberTemplate(r){
  return `<div class="member-row">
    <div class="user-cell"><div class="user-avatar"><i data-lucide="user"></i></div><div><strong>${esc(r.agentUser)}</strong><small>Internal Account</small></div></div>
    <div class="whatsapp"><span class="badge"><i data-lucide="phone"></i>${esc(r.whatsapp)}</span></div>
    <div><span class="badge provider-badge"><i data-lucide="gamepad-2"></i>${esc(r.provider)}</span></div>
    <div class="game-name">${esc(r.game)}</div>
    <div><span class="badge"><i data-lucide="radio"></i>${esc(r.callType)}${r.target?` · ${esc(r.target)}`:""}</span></div>
    <div>${statusBadge(r.status)}<div class="member-created">${formatDateTime(r.created)}</div></div>
    <div><button class="action-btn edit" title="Edit" data-edit="${r.id}"><i data-lucide="pencil"></i></button><button class="action-btn delete" title="Delete" data-delete="${r.id}"><i data-lucide="trash-2"></i></button></div>
  </div>`;
}
function updateStats(){
  $("#statTotal").textContent=data.length;
  $("#statActive").textContent=data.filter(r=>r.status==="Active").length;
  $("#statPending").textContent=data.filter(r=>r.status==="Pending").length;
  $("#statProviders").textContent=new Set(data.map(r=>r.provider)).size;
}
function renderPagination(total){
  const p=$("#pagination");
  if(total<=1){p.innerHTML="";return}
  let html=`<span>Page ${currentPage} of ${total}</span>`;
  html+=`<button class="page-btn" data-page="${Math.max(1,currentPage-1)}"><i data-lucide="chevron-left"></i></button>`;
  for(let i=1;i<=total;i++) html+=`<button class="page-btn ${i===currentPage?"active":""}" data-page="${i}">${i}</button>`;
  html+=`<button class="page-btn" data-page="${Math.min(total,currentPage+1)}"><i data-lucide="chevron-right"></i></button>`;
  p.innerHTML=html;
  lucide.createIcons();
}
function fillProviders(){
  $("#providerInput").innerHTML=Object.keys(providers).map(p=>`<option>${p}</option>`).join("");
  $("#providerFilter").innerHTML=`<option value="all">All Providers</option>`+Object.keys(providers).map(p=>`<option>${p}</option>`).join("");
  updateGames();
}
function updateGames(selected=""){
  const p=$("#providerInput").value;
  $("#gameInput").innerHTML=(providers[p]||[]).map(g=>`<option ${g===selected?"selected":""}>${g}</option>`).join("");
}
const AGENTS_KEY="chaos_call_scatter_agents_v3";

function defaultAgentRegistry(){
  const map=new Map();
  data.forEach(r=>{
    if(!map.has(r.agent)) map.set(r.agent,{
      id:"agent_"+slug(r.agent),
      name:r.agent,
      username:r.agentUser||("agent_"+slug(r.agent)),
      level:r.level||"SUB",
      status:"Active",
      created:r.created||new Date().toISOString()
    });
  });
  return [...map.values()];
}
function slug(v){return String(v||"agent").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"")}
function loadAgents(){
  try{
    const saved=JSON.parse(localStorage.getItem(AGENTS_KEY));
    if(Array.isArray(saved)&&saved.length) return saved;
  }catch(e){}
  const initial=defaultAgentRegistry();
  localStorage.setItem(AGENTS_KEY,JSON.stringify(initial));
  return initial;
}
let agents=loadAgents();
function saveAgents(){localStorage.setItem(AGENTS_KEY,JSON.stringify(agents))}
function getAgent(name){return agents.find(a=>a.name===name)}
function syncAgentToRecords(oldName,newAgent){
  data.forEach(r=>{
    if(r.agent===oldName){
      r.agent=newAgent.name;
      r.agentUser=newAgent.username;
      r.level=newAgent.level;
    }
  });
  saveData();
}
function fillAgents(selected=""){
  $("#agentInput").innerHTML=agents.map(a=>`<option value="${esc(a.name)}" ${a.name===selected?"selected":""}>${esc(a.name)} — ${esc(a.username)}</option>`).join("");
}
function resetForm(){
  $("#recordId").value="";
  fillAgents();
  $("#whatsappInput").value="";
  $("#providerInput").value=Object.keys(providers)[0];
  updateGames();
  $("#callTypeInput").value="Scatter";
  $("#targetInput").value="2+ Scatter";
  $("#statusInput").value="Active";
  const now=new Date();now.setMinutes(now.getMinutes()-now.getTimezoneOffset());
  $("#createdInput").value=now.toISOString().slice(0,16);
  $("#noteInput").value="";
  $("#modalTitle").textContent="Add Call Scatter";
}
function openModal(record=null,agentName=""){
  resetForm();
  if(agentName){
    const idx=[...$("#agentInput").options].findIndex(o=>o.value===agentName);
    if(idx>=0)$("#agentInput").selectedIndex=idx;
  }
  if(record){
    $("#modalTitle").textContent="Edit Call Scatter";
    $("#recordId").value=record.id;
    $("#agentInput").value=record.agent;
    $("#whatsappInput").value=record.whatsapp;
    $("#providerInput").value=record.provider;
    updateGames(record.game);
    $("#callTypeInput").value=record.callType;
    $("#targetInput").value=record.target||"";
    $("#statusInput").value=record.status;
    $("#createdInput").value=record.created;
    $("#noteInput").value=record.note||"";
  }
  $("#modalBackdrop").classList.add("show");
  setTimeout(()=>$("#whatsappInput").focus(),50);
}
function closeModal(){$("#modalBackdrop").classList.remove("show")}
function showToast(text,title="Success"){
  $("#toastTitle").textContent=title;$("#toastText").textContent=text;$("#toast").classList.add("show");
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>$("#toast").classList.remove("show"),2600);
}
function openDelete(id){pendingDelete=id;$("#deleteBackdrop").classList.add("show")}
function closeDelete(){pendingDelete=null;$("#deleteBackdrop").classList.remove("show")}

$("#menuBtn").addEventListener("click",()=>{
  if(window.matchMedia("(max-width: 760px)").matches){
    $("#sidebar").classList.toggle("open");
    $("#overlay").classList.toggle("show");
  }else{
    $(".app-shell").classList.toggle("sidebar-collapsed");
  }
});
$("#mobileClose").addEventListener("click",()=>{$("#sidebar").classList.remove("open");$("#overlay").classList.remove("show")});
$("#overlay").addEventListener("click",()=>{$("#sidebar").classList.remove("open");$("#overlay").classList.remove("show")});
window.addEventListener("resize",()=>{
  if(window.innerWidth>760){
    $("#sidebar").classList.remove("open");
    $("#overlay").classList.remove("show");
  }
});
$(".nav-toggle").addEventListener("click",e=>e.currentTarget.nextElementSibling.classList.toggle("open"));

$("#addBtn").addEventListener("click",()=>openModal());
$("#modalClose").addEventListener("click",closeModal);
$("#cancelBtn").addEventListener("click",closeModal);
$("#modalBackdrop").addEventListener("click",e=>{if(e.target===e.currentTarget)closeModal()});
$("#deleteCancel").addEventListener("click",closeDelete);
$("#deleteBackdrop").addEventListener("click",e=>{if(e.target===e.currentTarget)closeDelete()});

$("#providerInput").addEventListener("change",()=>updateGames());
$("#tableSearch").addEventListener("input",()=>{currentPage=1;$("#globalSearch").value="";render()});
$("#globalSearch").addEventListener("input",()=>{currentPage=1;$("#tableSearch").value="";render()});
["providerFilter","statusFilter","callTypeFilter"].forEach(id=>$("#"+id).addEventListener("change",()=>{currentPage=1;render()}));

$("#agentRows").addEventListener("click",e=>{
  const expand=e.target.closest("[data-expand]");
  if(expand){
    const name=expand.dataset.expand;
    const isOpen=sessionStorage.getItem("open_"+name)==="1";
    sessionStorage.setItem("open_"+name,isOpen?"0":"1");render();return;
  }
  const edit=e.target.closest("[data-edit]");
  if(edit){const r=data.find(x=>x.id===Number(edit.dataset.edit));if(r)openModal(r);return}
  const del=e.target.closest("[data-delete]");
  if(del){openDelete(Number(del.dataset.delete));return}
  const add=e.target.closest("[data-add-agent]");
  if(add){openModal(null,add.dataset.addAgent);return}
  const editAgent=e.target.closest("[data-edit-agent]");
  if(editAgent){openAgentModal(editAgent.dataset.editAgent);return}
  const deleteAgentBtn=e.target.closest("[data-delete-agent]");
  if(deleteAgentBtn){openAgentDelete(deleteAgentBtn.dataset.deleteAgent);return}
});
$("#pagination").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(!b)return;currentPage=Number(b.dataset.page);render()});

$("#scatterForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("#recordId").value;
  const selectedAgent=$("#agentInput").value;
  const agentRow=data.find(r=>r.agent===selectedAgent);
  const record={
    id:id?Number(id):Date.now(),
    agent:selectedAgent,
    agentUser:agentRow?agentRow.agentUser:"agent_"+selectedAgent.toLowerCase().replace(/\s+/g,"_"),
    level:agentRow?agentRow.level:"SUB",
    whatsapp:$("#whatsappInput").value.trim(),
    provider:$("#providerInput").value,
    game:$("#gameInput").value,
    callType:$("#callTypeInput").value,
    target:$("#targetInput").value.trim(),
    status:$("#statusInput").value,
    created:$("#createdInput").value,
    note:$("#noteInput").value.trim()
  };
  if(!record.whatsapp||!record.agent||!record.provider||!record.game){showToast("Please complete the required fields","Validation");return}
  if(id){data=data.map(r=>r.id===Number(id)?record:r);showToast("Call Scatter successfully updated")}
  else{data.unshift(record);showToast("Call Scatter successfully added")}
  saveData();closeModal();render();
});

$("#deleteConfirm").addEventListener("click",()=>{
  if(pendingDelete==null)return;
  data=data.filter(r=>r.id!==pendingDelete);
  saveData();closeDelete();render();showToast("The setting was removed from the table");
});

$("#notificationBtn").addEventListener("click",()=>{$("#notificationMenu").classList.toggle("show");$("#profileMenu").classList.remove("show")});
$("#profileBtn").addEventListener("click",()=>{$("#profileMenu").classList.toggle("show");$("#notificationMenu").classList.remove("show")});
document.addEventListener("click",e=>{
  if(!e.target.closest(".dropdown-wrap")){$("#notificationMenu").classList.remove("show");$("#profileMenu").classList.remove("show")}
});
document.addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#globalSearch").focus()}
  if(e.key==="Escape"){closeModal();closeDelete();$("#notificationMenu").classList.remove("show");$("#profileMenu").classList.remove("show")}
});

$("#chatFab").addEventListener("click",()=>$("#chatPanel").classList.toggle("show"));
$("#chatClose").addEventListener("click",()=>$("#chatPanel").classList.remove("show"));


function openAgentModal(name=""){
  const a=name?getAgent(name):null;
  $("#agentId").value=a?a.id:"";
  $("#agentName").value=a?a.name:"";
  $("#agentUsername").value=a?a.username:"";
  $("#agentLevel").value=a?a.level:"HEAD";
  $("#agentStatus").value=a?a.status:"Active";
  $("#agentModalTitle").textContent=a?"Edit Agent":"Add Agent";
  $("#agentModal").classList.add("show");
  setTimeout(()=>$("#agentName").focus(),50);
}
function closeAgentModal(){$("#agentModal").classList.remove("show")}
function openAgentDelete(name){
  const a=getAgent(name);
  if(!a)return;
  if(confirm(`Delete agent "${a.name}"?\\nAll Call Scatter settings belonging to this agent will also be removed.`)){
    agents=agents.filter(x=>x.name!==name);
    data=data.filter(r=>r.agent!==name);
    saveAgents();saveData();fillAgents();currentPage=1;render();
    showToast("Agent successfully deleted");
  }
}
$("#addAgentBtn").addEventListener("click",()=>openAgentModal());
$("#agentModalClose").addEventListener("click",closeAgentModal);
$("#agentCancel").addEventListener("click",closeAgentModal);
$("#agentModal").addEventListener("click",e=>{if(e.target===e.currentTarget)closeAgentModal()});
$("#agentForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("#agentId").value.trim();
  const name=$("#agentName").value.trim();
  const username=$("#agentUsername").value.trim();
  const level=$("#agentLevel").value;
  const status=$("#agentStatus").value;
  if(!name||!username){showToast("Agent name and username are required","Validation");return}
  const duplicate=agents.find(a=>a.name.toLowerCase()===name.toLowerCase() && a.id!==id);
  if(duplicate){showToast("Agent name already exists","Validation");return}
  if(id){
    const a=agents.find(x=>x.id===id);
    if(a){
      const oldName=a.name;
      a.name=name;a.username=username;a.level=level;a.status=status;
      if(oldName!==name){
        syncAgentToRecords(oldName,a);
        sessionStorage.setItem("open_"+name,sessionStorage.getItem("open_"+oldName)||"0");
      }else{
        syncAgentToRecords(name,a);
      }
    }
    showToast("Agent successfully updated");
  }else{
    agents.push({id:"agent_"+Date.now(),name,username,level,status,created:new Date().toISOString()});
    showToast("Agent successfully added");
  }
  saveAgents();saveData();fillAgents(name);closeAgentModal();currentPage=1;render();lucide.createIcons();
});

fillProviders();fillAgents();render();lucide.createIcons();
