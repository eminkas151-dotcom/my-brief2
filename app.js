let briefing=null;
let mode="minute";

async function loadBriefing(){
  const response = await fetch("data/briefing.json", {cache:"no-store"});
  briefing = await response.json();
  renderAll();
}

function renderAll(){
  document.getElementById("issueLine").textContent = `${briefing.issue} · ${briefing.date} · ${briefing.region}`;
  document.getElementById("dayIndex").textContent = briefing.dayIndex.label;
  document.getElementById("daySummary").textContent = `${briefing.dayIndex.summary} ${briefing.dayIndex.readingTime}.`;
  document.getElementById("importantCount").textContent = `${briefing.dayIndex.importantCount} важных`;

  renderTopStories();
  renderSections();
  renderList("changes", briefing.changes);
  renderList("tomorrow", briefing.tomorrow);
}

function renderTopStories(){
  const box=document.getElementById("topStories");
  box.innerHTML = briefing.topStories.map(story => `
    <article class="news">
      <div class="row"><div class="newsTitle">${story.importance} ${story.title}</div><span class="pill">${story.readTime}</span></div>
      <div class="newsText"><b>Что произошло:</b> ${story.what}</div>
      <div class="why"><b>Почему важно:</b> ${story.why}</div>
    </article>
  `).join("");
}

function renderSections(){
  const c=document.getElementById("content");
  c.innerHTML="";
  const max=mode==="minute"?1:mode==="short"?2:99;
  const allowed=mode==="minute"?["az","ru","economy"]:briefing.sections.map(s=>s.id);

  briefing.sections.filter(s=>allowed.includes(s.id)).forEach(section=>{
    const card=document.createElement("section");
    card.className="card";
    card.id=section.id;
    card.innerHTML=`<div class="row"><h2>${section.title}</h2><span class="pill">${section.priority}</span></div>`+
    section.items.slice(0,max).map(item=>`
      <article class="news">
        <div class="row"><div class="newsTitle">${item.importance} ${item.title}</div><span class="pill">${item.readTime}</span></div>
        <div class="newsText">${item.text}</div>
        <div class="why"><b>Почему важно:</b> ${item.why}</div>
      </article>
    `).join("");
    c.appendChild(card);
  });
}

function renderList(id, items){
  document.getElementById(id).innerHTML = items.map(x => `<article class="news"><div class="newsText">• ${x}</div></article>`).join("");
}

function setMode(m,btn){
  mode=m;
  document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  renderSections();
}

async function testNotify(){
 if(!("Notification" in window)){alert("Уведомления не поддерживаются этим браузером.");return;}
 const p=await Notification.requestPermission();
 if(p==="granted") new Notification("My Brief v0.4",{body:"Тестовое уведомление включено."});
}

if("serviceWorker" in navigator){navigator.serviceWorker.register("service-worker.js");}
loadBriefing().catch(err=>{
  document.getElementById("content").innerHTML = `<section class="card"><h2>Ошибка загрузки</h2><p>Не удалось загрузить data/briefing.json.</p></section>`;
});
