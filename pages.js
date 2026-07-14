/* ================== 主頁 ================== */

function renderHomePage() {
  return `
    <div class="topbar">
      <div class="brand"><i class="ti ti-notebook" aria-hidden="true"></i>追星手帳</div>
    </div>
    ${homeQuickLogCard()}
    ${homeThrowbackCard()}
    ${homeScheduleCard()}
    <div class="home-grid2">
      ${homeResourceMiniCard()}
      ${homeTodoCard()}
    </div>
  `;
}

function homeQuickLogCard() {
  const pills = state.idols.map(i => `
    <div class="idol-pill ${homeQuickLogIdol===i.id?'active':''}" data-quicklog-idol="${i.id}">
      <span class="dot" style="${avatarStyle(i)}"></span>${esc(i.name)}
    </div>
  `).join('');
  return `
    <div class="card">
      <div class="section-head">
        <p class="section-title"><i class="ti ti-pencil" aria-hidden="true"></i>今日追星紀錄</p>
      </div>
      ${state.idols.length > 1 ? `<div class="idol-select-pills" style="margin-bottom:9px;">${pills}</div>` : ''}
      <textarea class="quicklog-input" id="quicklog-text" placeholder="今天發生了什麼追星大小事？看了什麼、有什麼感覺，都可以寫下來..." rows="2"></textarea>
      <div class="quicklog-row" style="justify-content:flex-end;">
        <button class="btn primary small" id="btn-quicklog-save"><i class="ti ti-plus" aria-hidden="true"></i>加入紀錄</button>
      </div>
    </div>
  `;
}

function homeThrowbackCard() {
  // 找出今天日期（月/日）在歷史上相符的紀錄與活動紀錄
  const md = TODAY.slice(5); // MM-DD
  const matches = [];
  state.logs.forEach(o => { if (o.date.slice(5) === md && o.date !== TODAY) matches.push({ date:o.date, text:o.text, idol:o.idol, kind:'追星紀錄' }); });
  state.meetings.forEach(m => { if (m.date.slice(5) === md && m.date !== TODAY) matches.push({ date:m.date, text:m.title, idol:m.idol, kind:'活動紀錄' }); });

  if (!matches.length) {
    return `<div class="card"><div class="section-head"><p class="section-title"><i class="ti ti-clock-play" aria-hidden="true"></i>那年今日</p></div><p style="font-size:13px;color:var(--ink-faint);">今天還沒有累積到過去的回顧，繼續記錄下去，明年的今天就會看到囉。</p></div>`;
  }
  const cards = matches.map(x => {
    const idol = idolById(x.idol);
    return `<div class="throwback-card"><div class="tb-label"><i class="ti ti-sparkles" aria-hidden="true"></i>${yearsAgoText(x.date)} · ${idol?esc(idol.name):''} · ${x.kind}</div><div class="tb-text">${esc(x.text)}</div></div>`;
  }).join('');
  return `<div class="card"><div class="section-head"><p class="section-title"><i class="ti ti-clock-play" aria-hidden="true"></i>那年今日</p><p class="section-desc">系統自動比對歷史上的今天</p></div>${cards}</div>`;
}

function homeScheduleCard() {
  const upcoming = state.schedule.filter(s => daysUntil(s.date) >= 0).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6);
  const byDate = {};
  state.schedule.forEach(s => { (byDate[s.date] = byDate[s.date]||[]).push(s); });
  const clashDates = Object.keys(byDate).filter(d => new Set(byDate[d].map(x=>x.idol)).size > 1);

  const items = upcoming.map(s => {
    const idol = idolById(s.idol);
    const isClash = clashDates.includes(s.date);
    const dt = new Date(s.date+'T00:00:00');
    const du = daysUntil(s.date);
    const label = (s.tagName ? s.tagName : (idol?idol.name:'')) + ' 行程';
    return `
      <div class="sched-item ${isClash?'clash':''}">
        <div class="sched-date-box"><div class="d">${dt.getDate()}</div><div class="m">${dt.getMonth()+1}月</div></div>
        <span class="sched-dot" style="background:${idol?idol.color:'#999'}"></span>
        <div class="sched-info">
          <div class="name">${esc(s.name)}</div>
          <div class="meta">${esc(label)} · ${esc(s.type)}</div>
        </div>
        ${s.remind ? `<span class="countdown-badge">${du===0?'就是今天':du+' 天後'}</span>` : ''}
      </div>
    `;
  }).join('');

  const conflictText = clashDates.length ? clashDates.filter(d=>daysUntil(d)>=0).map(d => {
    const names = byDate[d].map(s => { const idol = idolById(s.idol); return `${idol?idol.name:''}《${s.name}》`; }).join('、');
    return `${fmtDate(d)}：${names} 撞期`;
  }).filter(Boolean).join('；') : '';

  return `
    <div class="card">
      <div class="section-head">
        <p class="section-title"><i class="ti ti-calendar-star" aria-hidden="true"></i>跨團行程</p>
        <p class="section-desc">所有偶像行程整合在這裡</p>
      </div>
      ${conflictText ? `<div class="conflict-banner"><i class="ti ti-alert-triangle" aria-hidden="true"></i>發現行程衝突：${esc(conflictText)}</div>` : ''}
      ${items || emptyState('ti-calendar-star','近期沒有安排的行程','到偶像頁面新增行程吧')}
    </div>
  `;
}

function homeResourceMiniCard() {
  const undone = state.resources.filter(r => !r.done).slice(0,5);
  const items = undone.map(r => {
    const idol = idolById(r.idol);
    return `<div class="res-mini-item"><span class="dot" style="background:${idol?idol.color:'#999'}"></span><span style="flex:1;">${esc(r.name)}</span><span class="res-cat">${esc(r.cat)}</span></div>`;
  }).join('');
  return `
    <div class="card">
      <div class="section-head"><p class="section-title"><i class="ti ti-checklist" aria-hidden="true"></i>官方資源推薦</p></div>
      ${items || emptyState('ti-checklist','都看完了！','太厲害了，暫時沒有待完成的資源')}
    </div>
  `;
}

function homeTodoCard() {
  const items = state.todos.map(t => `
    <div class="todo-item">
      <div class="todo-check ${t.done?'on':''}" data-toggle-todo="${t.id}">${t.done?'<i class="ti ti-check" aria-hidden="true" style="font-size:11px"></i>':''}</div>
      <span class="todo-text ${t.done?'done':''}">${esc(t.text)}</span>
      <span class="res-del" data-del-todo="${t.id}"><i class="ti ti-x" aria-hidden="true"></i></span>
    </div>
  `).join('');
  return `
    <div class="card">
      <div class="section-head"><p class="section-title"><i class="ti ti-list-check" aria-hidden="true"></i>快速待辦</p></div>
      <div class="quicklog-row" style="margin-bottom:10px;">
        <input id="todo-input" placeholder="新增待辦事項..." style="flex:1;font-family:'Noto Serif TC',serif;font-size:13px;padding:7px 10px;border-radius:8px;border:1px solid var(--line);">
        <button class="btn small" id="btn-add-todo"><i class="ti ti-plus" aria-hidden="true"></i></button>
      </div>
      ${items || emptyState('ti-list-check','沒有待辦事項','新增一項想提醒自己的事')}
    </div>
  `;
}

/* ================== 偶像頁 ================== */
let idolPageSubtab = 'resources'; // 'resources' | 'support'
let idolResCat = '全部';
let emotionCollapsed = true;

function renderIdolPage() {
  const idol = activeIdolData();
  if (!idol) { state.currentView='home'; return renderHomePage(); }
  return `
    <div class="topbar">
      <div class="crumb" id="crumb-home"><i class="ti ti-arrow-left" aria-hidden="true"></i>回到主頁</div>
    </div>
    ${idolHeaderCard(idol)}
    ${idolCalendarAndLogCard(idol)}
    ${idolMeetingsCard(idol)}
    ${idolAchievementsCard(idol)}
    ${idolResourceSupportCard(idol)}
    ${idolEmotionCard(idol)}
  `;
}

function idolHeaderCard(idol) {
  const fieldsHtml = (idol.fields||[]).map(f => `<span><i class="ti ti-tag" aria-hidden="true"></i>${esc(f.label)}：${esc(f.value)}</span>`).join('');
  return `
    <div class="idol-header">
      <div class="idol-header-bg" style="${idol.coverUrl?`background-image:url('${idol.coverUrl.replace(/'/g,"")}');background-size:cover;background-position:center;`:`background:${idol.color};opacity:0.85;`}"></div>
      <div class="idol-header-body">
        <div class="idol-avatar" style="${avatarStyle(idol)}">${idol.avatarUrl?'':esc(initials(idol.name))}</div>
        <div class="idol-name-row">
          <div>
            <p class="idol-name">${esc(idol.name)}</p>
            <div class="idol-meta">
              ${idol.groupName?`<span><i class="ti ti-users" aria-hidden="true"></i>${esc(idol.groupName)}</span>`:''}
              ${idol.position?`<span><i class="ti ti-star" aria-hidden="true"></i>${esc(idol.position)}</span>`:''}
              ${idol.debutDate?`<span><i class="ti ti-calendar-event" aria-hidden="true"></i>出道 ${fmtDate(idol.debutDate)}</span>`:''}
              ${fieldsHtml}
            </div>
          </div>
          <button class="btn ghost small" id="btn-edit-idol"><i class="ti ti-edit" aria-hidden="true"></i>編輯偶像資訊</button>
        </div>
      </div>
    </div>
  `;
}

function idolCalendarAndLogCard(idol) {
  const upcoming = byIdol(state.schedule).filter(s => daysUntil(s.date) >= -1).sort((a,b)=>a.date.localeCompare(b.date));
  const byDate = {};
  state.schedule.forEach(s => { (byDate[s.date] = byDate[s.date]||[]).push(s); });

  const items = upcoming.map(s => {
    const dt = new Date(s.date+'T00:00:00');
    const du = daysUntil(s.date);
    const label = (s.tagName ? s.tagName : idol.name) + ' 行程';
    const others = (byDate[s.date]||[]).filter(x => x.idol !== idol.id);
    const othersText = others.length ? others.map(o => { const oi=idolById(o.idol); return `${oi?oi.name:''}：${o.name}`; }).join('、') : '';
    return `
      <div class="sched-item">
        <div class="sched-date-box"><div class="d">${dt.getDate()}</div><div class="m">${dt.getMonth()+1}月</div></div>
        <span class="sched-dot" style="background:${idol.color}"></span>
        <div class="sched-info">
          <div class="name">${esc(s.name)}</div>
          <div class="meta">${esc(label)} · ${esc(s.type)}</div>
          ${othersText ? `<div class="others"><i class="ti ti-users" aria-hidden="true"></i> 同一天：${esc(othersText)}</div>` : ''}
        </div>
        ${s.remind ? `<span class="countdown-badge">${du<=0?'就是今天':du+' 天後'}</span>` : ''}
        <span class="sched-del" data-del-sched="${s.id}"><i class="ti ti-x" aria-hidden="true"></i></span>
      </div>
    `;
  }).join('');

  const logs = byIdol(state.logs).slice().sort((a,b)=>b.date.localeCompare(a.date));
  const logItems = logs.map(o => `
    <div class="t-item">
      <div class="t-date">${fmtDate(o.date)} · <span class="t-ago">${yearsAgoText(o.date)}</span></div>
      <div class="t-body">${esc(o.text)}</div>
    </div>
  `).join('');

  return `
    <div class="card">
      <div class="section-head">
        <p class="section-title"><i class="ti ti-calendar-star" aria-hidden="true"></i>行程與追星紀錄</p>
        <button class="btn primary small" id="btn-add-sched"><i class="ti ti-plus" aria-hidden="true"></i>新增行程</button>
      </div>
      <div class="sched-list" style="margin-bottom:16px;">${items || emptyState('ti-calendar-star','還沒有安排行程','新增演唱會、直播、活動等行程')}</div>

      <div style="border-top:1px dashed var(--line); padding-top:14px;">
        <div class="section-head">
          <p class="section-title" style="font-size:14.5px;"><i class="ti ti-pencil" aria-hidden="true"></i>追星紀錄</p>
        </div>
        <div class="fn-origin-add" style="margin-bottom:12px;">
          <textarea class="quicklog-input" id="idol-log-text" placeholder="今天想記下什麼呢？例如：看到了什麼讓你心動的片段..." rows="2"></textarea>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
            <input type="date" id="idol-log-date" value="${TODAY}" style="font-size:12px;padding:6px 9px;border-radius:7px;border:1px solid var(--line);">
            <button class="btn primary small" id="btn-add-idol-log"><i class="ti ti-plus" aria-hidden="true"></i>加入紀錄</button>
          </div>
        </div>
        ${logs.length ? `<div class="timeline">${logItems}</div>` : emptyState('ti-seedling','還沒有追星紀錄','寫下第一次心動的瞬間吧')}
      </div>
    </div>
  `;
}

const MEETING_TAGS = ['見面會','簽售會','粉絲應援','演唱會'];

function idolMeetingsCard(idol) {
  const list = byIdol(state.meetings).slice().sort((a,b)=>b.date.localeCompare(a.date));
  const items = list.map(m => {
    const days = daysDiff(m.date);
    const isAnniv = days > 0 && days % 365 < 3;
    const tagLabel = m.customTag ? m.customTag : m.type;
    return `
    <div class="card" style="margin-bottom:10px;">
      ${isAnniv ? `<div class="anniversary-badge"><i class="ti ti-sparkles" aria-hidden="true"></i>${yearsAgoText(m.date)}你們聊了這個</div>` : ''}
      <div style="display:flex;justify-content:space-between;gap:8px;">
        <div>
          <span class="meeting-type">${esc(tagLabel)}</span>
          <p class="meeting-title">${esc(m.title)}</p>
          <p class="meeting-date">${fmtDate(m.date)} · ${yearsAgoText(m.date)}</p>
        </div>
        <button class="btn ghost small" data-del-meeting="${m.id}"><i class="ti ti-trash" aria-hidden="true"></i></button>
      </div>
      <div style="margin-top:9px;">
        ${m.exchanges.map(ex => `<div class="exchange ${ex.who==='我'?'me':''}"><span class="who">${esc(ex.who)}</span><span class="txt">${esc(ex.text)}</span></div>`).join('')}
        ${m.note ? `<div class="meeting-note"><i class="ti ti-note" aria-hidden="true"></i> ${esc(m.note)}</div>` : ''}
      </div>
    </div>
  `;
  }).join('');
  return `
    <div class="card">
      <div class="section-head">
        <p class="section-title"><i class="ti ti-message-heart" aria-hidden="true"></i>活動紀錄</p>
        <p class="section-desc">見面會、簽售會等一次性互動的珍貴對話</p>
        <button class="btn primary small" id="btn-add-meeting"><i class="ti ti-plus" aria-hidden="true"></i>新增紀錄</button>
      </div>
      ${list.length ? items : emptyState('ti-message-heart','還沒有活動紀錄','第一次的珍貴對話，值得被完整記住')}
    </div>
  `;
}

function idolAchievementsCard(idol) {
  const list = byIdol(state.achievements);
  const counts = { album:0, concert:0, event:0, goods:0 };
  list.forEach(a => counts[a.type] = (counts[a.type]||0) + 1);
  const byYear = {};
  list.forEach(a => { const y = a.date.split('-')[0]; (byYear[y]=byYear[y]||[]).push(a); });
  const years = Object.keys(byYear).sort();
  const iconMap = { album:'ti-disc', concert:'ti-microphone-2', event:'ti-ticket', goods:'ti-gift' };
  const yearBlocks = years.map(y => `
    <div class="ach-year">${y} 年</div>
    <div class="ach-grid">
      ${byYear[y].map(a => `
        <div class="ach-item">
          <div class="ach-icon ${a.type}" style="background:${a.type==='album'?'var(--accent-bg)':a.type==='concert'?'var(--sage-bg)':a.type==='event'?'var(--gold-bg)':'#E3E7EE'};color:${a.type==='album'?'var(--accent)':a.type==='concert'?'var(--sage)':a.type==='event'?'var(--gold)':'var(--dusk)'}"><i class="ti ${iconMap[a.type]||'ti-star'}" aria-hidden="true"></i></div>
          <div><div class="ach-name">${esc(a.name)}</div><div class="ach-date">${esc(a.category)} · ${a.date}</div></div>
        </div>
      `).join('')}
    </div>
  `).join('');
  return `
    <div class="card">
      <div class="section-head">
        <p class="section-title"><i class="ti ti-timeline" aria-hidden="true"></i>追星年表</p>
        <p class="section-desc">你走過的追星路，都算數</p>
        <button class="btn primary small" id="btn-add-achievement"><i class="ti ti-plus" aria-hidden="true"></i>新增紀錄</button>
      </div>
      <div class="wrapped-card">
        <h3>2026 年度追星回顧</h3>
        <p>只屬於你的追星 wrapped，年底自動生成</p>
        <div class="wrapped-stats">
          <div>${counts.album||0}<span>張專輯</span></div>
          <div>${counts.concert||0}<span>場演唱會</span></div>
          <div>${counts.event||0}<span>次簽售/活動</span></div>
          <div>${counts.goods||0}<span>件周邊</span></div>
        </div>
      </div>
      <div class="stats-row">
        <div class="stat"><div class="stat-num">${list.length}</div><div class="stat-label">累積紀錄總數</div></div>
        <div class="stat"><div class="stat-num">${years.length}</div><div class="stat-label">追星年資（年）</div></div>
        <div class="stat"><div class="stat-num">${counts.concert||0}</div><div class="stat-label">到場演唱會</div></div>
      </div>
      ${years.length ? yearBlocks : emptyState('ti-timeline','還沒有應援紀錄','把買過的專輯、去過的演唱會都記下來')}
    </div>
  `;
}

function idolResourceSupportCard(idol) {
  return `
    <div class="card">
      <div class="section-head">
        <p class="section-title"><i class="ti ti-checklist" aria-hidden="true"></i>官方資源 / 應援法</p>
        ${idolPageSubtab==='resources'
          ? `<button class="btn primary small" id="btn-add-resource"><i class="ti ti-plus" aria-hidden="true"></i>新增資源</button>`
          : `<div style="display:flex;gap:6px;"><button class="btn small" id="btn-add-song"><i class="ti ti-music" aria-hidden="true"></i>新增歌曲應援</button><button class="btn primary small" id="btn-add-support"><i class="ti ti-plus" aria-hidden="true"></i>新增筆記</button></div>`
        }
      </div>
      <div class="subtab-row">
        <button class="subtab ${idolPageSubtab==='resources'?'active':''}" data-subtab="resources">官方資源</button>
        <button class="subtab ${idolPageSubtab==='support'?'active':''}" data-subtab="support">應援法</button>
      </div>
      ${idolPageSubtab==='resources' ? resourceSubpanel(idol) : supportSubpanel(idol)}
    </div>
  `;
}

function resourceSubpanel(idol) {
  const list = byIdol(state.resources);
  const cats = ['全部','社群媒體','直播','綜藝','專輯','周邊','活動資訊'];
  const filtered = idolResCat==='全部' ? list : list.filter(r=>r.cat===idolResCat);
  const done = list.filter(r=>r.done).length;
  const pct = list.length ? Math.round(done/list.length*100) : 0;
  const items = filtered.map(r => `
    <div class="res-item ${r.done?'done':''}">
      <div class="res-check ${r.done?'on':''}" data-toggle-res="${r.id}">${r.done?'<i class="ti ti-check" aria-hidden="true" style="font-size:11px"></i>':''}</div>
      <span class="res-name">${esc(r.name)}</span>
      <span class="res-cat">${esc(r.cat)}</span>
      <span class="res-del" data-del-res="${r.id}"><i class="ti ti-x" aria-hidden="true"></i></span>
    </div>
  `).join('');
  return `
    <div class="res-progress"><div class="bar-wrap"><div class="bar" style="width:${pct}%"></div></div><span class="pct">${done} / ${list.length} 已完成</span></div>
    <div class="res-cat-row">${cats.map(c=>`<button class="subtab ${idolResCat===c?'active':''}" data-rescat="${c}" style="font-size:12px;padding:5px 12px;">${c}</button>`).join('')}</div>
    ${filtered.length ? items : emptyState('ti-checklist','這個分類還沒有項目','新增你想追蹤的內容')}
  `;
}

function supportSubpanel(idol) {
  const notes = byIdol(state.supportNotes);
  const songs = byIdol(state.songSupports);
  const noteCards = notes.map(n => `
    <div class="support-card">
      <div class="top-row">
        <div style="flex:1;"><div class="icon"><i class="ti ${n.icon||'ti-flag-3'}" aria-hidden="true"></i></div><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p></div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <span class="edit-btn" data-edit-support="${n.id}"><i class="ti ti-edit" aria-hidden="true"></i></span>
          <span class="edit-btn" data-del-support="${n.id}"><i class="ti ti-trash" aria-hidden="true"></i></span>
        </div>
      </div>
    </div>
  `).join('');
  const songTags = songs.map(s => `<span class="song-tag"><i class="ti ti-music" aria-hidden="true"></i>${esc(s.songName)}${s.notes?'：'+esc(s.notes):''}<span data-del-song="${s.id}" style="cursor:pointer;margin-left:2px;"><i class="ti ti-x" aria-hidden="true"></i></span></span>`).join('');
  return `
    ${notes.length ? noteCards : emptyState('ti-flag-3','還沒有應援法筆記','新增應援色、投票規則等筆記')}
    <div style="margin-top:14px;border-top:1px dashed var(--line);padding-top:14px;">
      <p class="section-title" style="font-size:14px;margin-bottom:8px;"><i class="ti ti-music" aria-hidden="true"></i>各歌曲應援</p>
      ${songTags || `<p style="font-size:12.5px;color:var(--ink-faint);">還沒有歌曲應援法，點右上角新增</p>`}
    </div>
  `;
}

const EMOTION_TAGS = ['心動','穩定','淡坑中','疲乏','過度消費擔憂'];

function idolEmotionCard(idol) {
  const list = byIdol(state.emotions).slice().sort((a,b)=>a.date.localeCompare(b.date));
  const avg = list.length ? Math.round(list.reduce((s,e)=>s+e.value,0)/list.length) : 50;
  let insight = '';
  if (list.length >= 2) {
    const trend = list[list.length-1].value - list[list.length-2].value;
    if (trend <= -20) insight = `<div class="emo-insight warn"><i class="ti ti-alert-triangle" aria-hidden="true"></i>最近的強度比上次記錄下降不少，如果感覺在淡坑或想暫停消費，都是很自然的狀態，慢慢來就好。</div>`;
    else if (avg >= 80) insight = `<div class="emo-insight"><i class="ti ti-info-circle" aria-hidden="true"></i>整體來說你對這段追星關係感覺穩定又投入，記得也照顧一下現實生活的其他部分。</div>`;
  }
  const rows = list.slice().reverse().map(e => {
    const color = e.value>=70?'var(--sage)':e.value>=40?'var(--gold)':'var(--accent)';
    return `<div class="emo-row"><span class="date">${e.date}</span><div class="bar-wrap"><div class="bar" style="width:${e.value}%;background:${color}"></div></div><span class="val">${e.value}</span></div>`;
  }).join('');

  return `
    <div class="card">
      <div class="collapse-toggle ${emotionCollapsed?'':'open'}" id="emo-collapse-toggle">
        <p class="section-title" style="font-size:14.5px;color:var(--ink-soft);"><i class="ti ti-heart-handshake" aria-hidden="true"></i>情緒安全度自我檢測</p>
        <i class="ti ti-chevron-down" aria-hidden="true"></i>
      </div>
      <div id="emo-collapse-body" style="display:${emotionCollapsed?'none':'block'};margin-top:12px;">
        <p class="section-desc" style="margin-bottom:12px;">誠實記下現在的狀態，覺察比壓抑更重要</p>
        <div class="emo-check">
          <div class="emo-face" id="emo-face">( ˘ω˘ )</div>
          <div class="emo-wrap">
            <input type="range" class="emo-range" id="emo-range" min="0" max="100" value="70" step="1">
            <div class="emo-labels"><span>淡坑/疲乏</span><span>穩定健康</span><span>非常心動</span></div>
            <div class="emo-chips">${EMOTION_TAGS.map(t=>`<span class="emo-chip" data-emo-tag="${t}">${t}</span>`).join('')}</div>
            <div style="text-align:right;margin-top:10px;"><button class="btn primary small" id="btn-add-emotion"><i class="ti ti-plus" aria-hidden="true"></i>記錄這次的感覺</button></div>
          </div>
        </div>
        ${insight}
        <div class="stats-row" style="margin-top:14px;">
          <div class="stat"><div class="stat-num">${avg}</div><div class="stat-label">近期平均強度</div></div>
          <div class="stat"><div class="stat-num">${list.length}</div><div class="stat-label">累積檢測次數</div></div>
        </div>
        <div style="margin-top:16px;">
          <p class="section-title" style="font-size:14px;">歷史紀錄</p>
          ${rows || emptyState('ti-heart-handshake','還沒有檢測紀錄','拉一下滑桿，記錄此刻的感覺')}
        </div>
      </div>
    </div>
  `;
}
