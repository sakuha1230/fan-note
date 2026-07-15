/* ================== 主控與事件綁定 ================== */
let homeQuickLogIdol = null;

function renderApp() {
  const app = document.getElementById('app');
  if (!homeQuickLogIdol) homeQuickLogIdol = state.activeIdol;
  app.innerHTML = state.currentView === 'home' ? renderHomePage() : renderIdolPage();
  renderFab();
  bindEvents();
}

function bindEvents() {
  /* ---- 導覽 ---- */
  const crumbHome = document.getElementById('crumb-home');
  if (crumbHome) crumbHome.onclick = () => { state.currentView='home'; saveState(); renderApp(); };

  /* ================== 主頁事件 ================== */
  /* ---- 帳號同步 ---- */
  const googleBtn = document.getElementById('btn-google');
  if (googleBtn) googleBtn.onclick = () => { if (typeof signInWithGoogle === 'function') signInWithGoogle(); };
  const signOutBtn = document.getElementById('btn-sign-out');
  if (signOutBtn) signOutBtn.onclick = () => { if (typeof signOutUser === 'function') signOutUser(); };

  document.querySelectorAll('[data-quicklog-idol]').forEach(el => {
    el.onclick = () => { homeQuickLogIdol = el.dataset.quicklogIdol; renderApp(); };
  });
  const quicklogSave = document.getElementById('btn-quicklog-save');
  if (quicklogSave) quicklogSave.onclick = () => {
    const text = document.getElementById('quicklog-text').value.trim();
    if (!text) return;
    const idolId = homeQuickLogIdol || state.idols[0].id;
    state.logs.push({ id: uid(), idol: idolId, date: TODAY, text });
    saveState(); renderApp();
  };

  document.querySelectorAll('[data-toggle-todo]').forEach(el => {
    el.onclick = () => { const t = state.todos.find(x=>x.id===el.dataset.toggleTodo); if (t) { t.done=!t.done; saveState(); renderApp(); } };
  });
  document.querySelectorAll('[data-del-todo]').forEach(el => {
    el.onclick = () => { state.todos = state.todos.filter(x=>x.id!==el.dataset.delTodo); saveState(); renderApp(); };
  });
  const addTodoBtn = document.getElementById('btn-add-todo');
  if (addTodoBtn) addTodoBtn.onclick = () => {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    if (!text) return;
    state.todos.push({ id: uid(), text, done:false });
    saveState(); renderApp();
  };

  /* ================== 偶像頁：行事曆＋追星紀錄 ================== */
  const addSchedBtn = document.getElementById('btn-add-sched');
  if (addSchedBtn) addSchedBtn.onclick = () => openScheduleModal();
  document.querySelectorAll('[data-del-sched]').forEach(el => {
    el.onclick = () => { state.schedule = state.schedule.filter(s=>s.id!==el.dataset.delSched); saveState(); renderApp(); };
  });
  const addIdolLogBtn = document.getElementById('btn-add-idol-log');
  if (addIdolLogBtn) addIdolLogBtn.onclick = () => {
    const text = document.getElementById('idol-log-text').value.trim();
    const date = document.getElementById('idol-log-date').value;
    if (!text) return;
    state.logs.push({ id: uid(), idol: state.activeIdol, date, text });
    saveState(); renderApp();
  };

  /* ---- 偶像資訊編輯 ---- */
  const editIdolBtn = document.getElementById('btn-edit-idol');
  if (editIdolBtn) editIdolBtn.onclick = () => openEditIdolModal();

  /* ---- 活動紀錄 ---- */
  const addMeetingBtn = document.getElementById('btn-add-meeting');
  if (addMeetingBtn) addMeetingBtn.onclick = () => openMeetingModal();
  document.querySelectorAll('[data-del-meeting]').forEach(el => {
    el.onclick = () => { state.meetings = state.meetings.filter(m=>m.id!==el.dataset.delMeeting); saveState(); renderApp(); };
  });

  /* ---- 追星年表 ---- */
  const addAchBtn = document.getElementById('btn-add-achievement');
  if (addAchBtn) addAchBtn.onclick = () => openAchievementModal();

  /* ---- 官方資源／應援法 子分頁 ---- */
  document.querySelectorAll('[data-subtab]').forEach(el => {
    el.onclick = () => { idolPageSubtab = el.dataset.subtab; renderApp(); };
  });
  document.querySelectorAll('[data-rescat]').forEach(el => {
    el.onclick = () => { idolResCat = el.dataset.rescat; renderApp(); };
  });
  document.querySelectorAll('[data-toggle-res]').forEach(el => {
    el.onclick = () => { const r = state.resources.find(x=>x.id===el.dataset.toggleRes); if (r) { r.done=!r.done; saveState(); renderApp(); } };
  });
  document.querySelectorAll('[data-del-res]').forEach(el => {
    el.onclick = () => { state.resources = state.resources.filter(r=>r.id!==el.dataset.delRes); saveState(); renderApp(); };
  });
  const addResBtn = document.getElementById('btn-add-resource');
  if (addResBtn) addResBtn.onclick = () => openResourceModal();

  const addSupportBtn = document.getElementById('btn-add-support');
  if (addSupportBtn) addSupportBtn.onclick = () => openSupportNoteModal();
  document.querySelectorAll('[data-edit-support]').forEach(el => {
    el.onclick = () => openSupportNoteModal(el.dataset.editSupport);
  });
  document.querySelectorAll('[data-del-support]').forEach(el => {
    el.onclick = () => { state.supportNotes = state.supportNotes.filter(n=>n.id!==el.dataset.delSupport); saveState(); renderApp(); };
  });
  const addSongBtn = document.getElementById('btn-add-song');
  if (addSongBtn) addSongBtn.onclick = () => openSongSupportModal();
  document.querySelectorAll('[data-del-song]').forEach(el => {
    el.onclick = () => { state.songSupports = state.songSupports.filter(s=>s.id!==el.dataset.delSong); saveState(); renderApp(); };
  });

  /* ---- 情緒安全度（收合） ---- */
  const emoToggle = document.getElementById('emo-collapse-toggle');
  if (emoToggle) emoToggle.onclick = () => { emotionCollapsed = !emotionCollapsed; renderApp(); };
  const emoRange = document.getElementById('emo-range');
  const emoFace = document.getElementById('emo-face');
  if (emoRange) {
    const upd = () => { const v = +emoRange.value; emoFace.textContent = v>=70?'(*^▽^*)':v>=40?'( ˘ω˘ )':'(´-ω-`)'; };
    upd(); emoRange.oninput = upd;
  }
  let selectedEmoTags = [];
  document.querySelectorAll('[data-emo-tag]').forEach(el => {
    el.onclick = () => {
      const tag = el.dataset.emoTag;
      if (selectedEmoTags.includes(tag)) { selectedEmoTags = selectedEmoTags.filter(t=>t!==tag); el.classList.remove('on'); }
      else { selectedEmoTags.push(tag); el.classList.add('on'); }
    };
  });
  const addEmoBtn = document.getElementById('btn-add-emotion');
  if (addEmoBtn) addEmoBtn.onclick = () => {
    const value = +document.getElementById('emo-range').value;
    state.emotions.push({ id: uid(), idol: state.activeIdol, date: TODAY.slice(0,7), value, tags: selectedEmoTags });
    saveState(); renderApp();
  };
}

/* ================== 彈窗表單 ================== */

function openScheduleModal() {
  const idol = activeIdolData();
  const m = openModal(`
    <h3><i class="ti ti-calendar-star" aria-hidden="true"></i>新增行程</h3>
    <div class="field-row"><label class="field-label">行程名稱</label><input id="ss-name" placeholder="例如：巡演台北場"></div>
    <div class="field-row">
      <div style="flex:1;"><label class="field-label">日期</label><input type="date" id="ss-date" value="${TODAY}" style="width:100%;"></div>
      <div style="flex:1;"><label class="field-label">類型</label><select id="ss-type" style="width:100%;"><option>演唱會</option><option>直播</option><option>應援</option><option>簽售</option><option>綜藝</option><option>其他</option></select></div>
    </div>
    <div class="field-row">
      <label class="field-label">自訂標籤名稱（顯示為「OO 行程」，留空則用「${esc(idol.name)} 行程」）</label>
      <input id="ss-tagname" placeholder="例如：小天使">
    </div>
    <div class="field-row">
      <div style="flex:1;"><label class="field-label">優先度</label><select id="ss-priority" style="width:100%;"><option value="1">優先</option><option value="2">次要</option></select></div>
      <div style="flex:1;display:flex;align-items:flex-end;gap:6px;padding-bottom:9px;"><input type="checkbox" id="ss-remind" checked style="width:16px;height:16px;"><label for="ss-remind" style="font-size:13px;">開啟倒數提醒</label></div>
    </div>
    <div class="modal-actions">
      <button class="btn ghost small" id="ss-cancel">取消</button>
      <button class="btn primary small" id="ss-save">加入行程</button>
    </div>
  `);
  m.querySelector('#ss-cancel').onclick = () => m.remove();
  m.querySelector('#ss-save').onclick = () => {
    const name = m.querySelector('#ss-name').value.trim();
    if (!name) return;
    state.schedule.push({
      id: uid(), idol: state.activeIdol, name,
      date: m.querySelector('#ss-date').value,
      type: m.querySelector('#ss-type').value,
      tagName: m.querySelector('#ss-tagname').value.trim(),
      priority: +m.querySelector('#ss-priority').value,
      remind: m.querySelector('#ss-remind').checked
    });
    saveState(); m.remove(); renderApp();
  };
}

function openEditIdolModal() {
  const idol = activeIdolData();
  const fieldsHtml = (idol.fields||[]).map((f,idx) => `
    <div class="field-row" data-field-row="${idx}">
      <input class="ei-field-label" value="${esc(f.label)}" placeholder="欄位名稱" style="flex:1;">
      <input class="ei-field-value" value="${esc(f.value)}" placeholder="內容" style="flex:1;">
      <span class="edit-btn" data-remove-field="${idx}" style="cursor:pointer;padding:8px;"><i class="ti ti-x" aria-hidden="true"></i></span>
    </div>
  `).join('');
  const m = openModal(`
    <h3><i class="ti ti-edit" aria-hidden="true"></i>編輯偶像資訊</h3>
    <div class="field-row"><label class="field-label">名稱</label><input id="ei-name" value="${esc(idol.name)}"></div>
    <div class="field-row">
      <div style="flex:1;"><label class="field-label">團體名稱（選填）</label><input id="ei-group" value="${esc(idol.groupName||'')}"></div>
      <div style="flex:1;"><label class="field-label">位置（選填）</label><input id="ei-position" value="${esc(idol.position||'')}"></div>
    </div>
    <div class="field-row"><label class="field-label">出道日期（選填）</label><input type="date" id="ei-debut" value="${idol.debutDate||''}"></div>
    <div class="field-row">
      <label class="field-label">代表色</label>
      <div class="color-swatch-row">
        ${COLOR_PRESETS.map(c=>`<span class="color-swatch ${idol.color===c?'selected':''}" style="background:${c}" data-color="${c}"></span>`).join('')}
        <input type="color" id="ei-color-custom" value="${idol.color}">
      </div>
    </div>
    <div class="field-row"><label class="field-label">大頭貼圖片網址（選填）</label><input id="ei-avatar" value="${esc(idol.avatarUrl||'')}" placeholder="https://..."></div>
    <div class="field-row"><label class="field-label">封面圖片網址（選填）</label><input id="ei-cover" value="${esc(idol.coverUrl||'')}" placeholder="https://..."></div>
    <div style="margin:10px 0 6px;">
      <label class="field-label">自訂欄位（例如：生日、星座）</label>
      <div id="ei-fields-wrap">${fieldsHtml}</div>
      <button class="btn ghost small" id="ei-add-field" style="margin-top:4px;"><i class="ti ti-plus" aria-hidden="true"></i>新增欄位</button>
    </div>
    <div class="modal-actions">
      <button class="btn danger small" id="ei-delete-idol">刪除這位偶像</button>
      <button class="btn ghost small" id="ei-cancel">取消</button>
      <button class="btn primary small" id="ei-save">儲存</button>
    </div>
  `);
  let pickedColor = idol.color;
  m.querySelectorAll('.color-swatch').forEach(sw => {
    sw.onclick = () => { m.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('selected')); sw.classList.add('selected'); pickedColor = sw.dataset.color; };
  });
  m.querySelector('#ei-color-custom').oninput = (e) => { pickedColor = e.target.value; m.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('selected')); };
  m.querySelector('#ei-add-field').onclick = () => {
    const wrap = m.querySelector('#ei-fields-wrap');
    const row = document.createElement('div');
    row.className = 'field-row';
    row.innerHTML = `<input class="ei-field-label" placeholder="欄位名稱" style="flex:1;"><input class="ei-field-value" placeholder="內容" style="flex:1;"><span class="edit-btn" style="cursor:pointer;padding:8px;" data-remove-inline><i class="ti ti-x" aria-hidden="true"></i></span>`;
    row.querySelector('[data-remove-inline]').onclick = () => row.remove();
    wrap.appendChild(row);
  };
  m.querySelectorAll('[data-remove-field]').forEach(el => { el.onclick = () => el.closest('[data-field-row]').remove(); });
  m.querySelector('#ei-cancel').onclick = () => m.remove();
  m.querySelector('#ei-delete-idol').onclick = () => {
    if (state.idols.length <= 1) { alert('至少要保留一位偶像'); return; }
    if (!confirm('確定要刪除這位偶像嗎？相關紀錄不會一併刪除，但將不再顯示於選單。')) return;
    state.idols = state.idols.filter(i => i.id !== idol.id);
    state.activeIdol = state.idols[0].id;
    saveState(); m.remove(); renderApp();
  };
  m.querySelector('#ei-save').onclick = () => {
    idol.name = m.querySelector('#ei-name').value.trim() || idol.name;
    idol.groupName = m.querySelector('#ei-group').value.trim();
    idol.position = m.querySelector('#ei-position').value.trim();
    idol.debutDate = m.querySelector('#ei-debut').value;
    idol.color = pickedColor;
    idol.avatarUrl = m.querySelector('#ei-avatar').value.trim();
    idol.coverUrl = m.querySelector('#ei-cover').value.trim();
    const fields = [];
    m.querySelectorAll('#ei-fields-wrap [data-field-row], #ei-fields-wrap .field-row').forEach(row => {
      const label = row.querySelector('.ei-field-label').value.trim();
      const value = row.querySelector('.ei-field-value').value.trim();
      if (label && value) fields.push({ label, value });
    });
    idol.fields = fields;
    saveState(); m.remove(); renderApp();
  };
}

function openMeetingModal() {
  const tagOptions = MEETING_TAGS.map(t => `<span class="chip-pick" data-mm-tag="${t}">${t}</span>`).join('');
  const m = openModal(`
    <h3><i class="ti ti-message-heart" aria-hidden="true"></i>新增活動紀錄</h3>
    <div class="field-row"><label class="field-label">活動名稱</label><input id="mm-title" placeholder="例如：第三張專輯簽售"></div>
    <div class="field-row"><label class="field-label">標籤</label><div id="mm-tags">${tagOptions}</div></div>
    <div class="field-row"><label class="field-label">自訂標籤（選填，可取代上方標籤）</label><input id="mm-custom-tag" placeholder="例如：機場巧遇"></div>
    <div class="field-row"><label class="field-label">日期</label><input type="date" id="mm-date" value="${TODAY}"></div>
    <div class="field-row"><label class="field-label">我對他說了什麼？</label><textarea id="mm-me" rows="2"></textarea></div>
    <div class="field-row"><label class="field-label">他回了什麼？</label><textarea id="mm-him" rows="2"></textarea></div>
    <div class="field-row"><label class="field-label">當下的反應、感覺（選填）</label><textarea id="mm-note" rows="2"></textarea></div>
    <div class="modal-actions">
      <button class="btn ghost small" id="mm-cancel">取消</button>
      <button class="btn primary small" id="mm-save">儲存紀錄</button>
    </div>
  `);
  let pickedTag = MEETING_TAGS[0];
  m.querySelectorAll('[data-mm-tag]').forEach((el,idx) => {
    if (idx===0) el.classList.add('on');
    el.onclick = () => { m.querySelectorAll('[data-mm-tag]').forEach(x=>x.classList.remove('on')); el.classList.add('on'); pickedTag = el.dataset.mmTag; };
  });
  m.querySelector('#mm-cancel').onclick = () => m.remove();
  m.querySelector('#mm-save').onclick = () => {
    const title = m.querySelector('#mm-title').value.trim() || '未命名紀錄';
    const customTag = m.querySelector('#mm-custom-tag').value.trim();
    const date = m.querySelector('#mm-date').value;
    const meText = m.querySelector('#mm-me').value.trim();
    const himText = m.querySelector('#mm-him').value.trim();
    const note = m.querySelector('#mm-note').value.trim();
    const exchanges = [];
    if (meText) exchanges.push({ who:'我', text: meText });
    if (himText) exchanges.push({ who:'他', text: himText });
    state.meetings.push({ id: uid(), idol: state.activeIdol, type: pickedTag, customTag, title, date, exchanges, note });
    saveState(); m.remove(); renderApp();
  };
}

function openAchievementModal() {
  const m = openModal(`
    <h3><i class="ti ti-timeline" aria-hidden="true"></i>新增追星年表紀錄</h3>
    <div class="field-row"><label class="field-label">項目名稱</label><input id="aa-name" placeholder="例如：第三張專輯"></div>
    <div class="field-row">
      <div style="flex:1;"><label class="field-label">類型</label><select id="aa-type" style="width:100%;"><option value="album">專輯</option><option value="concert">演唱會</option><option value="event">簽售/活動</option><option value="goods">周邊</option></select></div>
      <div style="flex:1;"><label class="field-label">年月</label><input type="month" id="aa-date" value="${TODAY.slice(0,7)}" style="width:100%;"></div>
    </div>
    <div class="modal-actions">
      <button class="btn ghost small" id="aa-cancel">取消</button>
      <button class="btn primary small" id="aa-save">加入年表</button>
    </div>
  `);
  const catMap = { album:'專輯', concert:'演唱會', event:'簽售', goods:'周邊' };
  m.querySelector('#aa-cancel').onclick = () => m.remove();
  m.querySelector('#aa-save').onclick = () => {
    const name = m.querySelector('#aa-name').value.trim();
    if (!name) return;
    const type = m.querySelector('#aa-type').value;
    const date = m.querySelector('#aa-date').value;
    state.achievements.push({ id: uid(), idol: state.activeIdol, type, name, date, category: catMap[type] });
    saveState(); m.remove(); renderApp();
  };
}

function openResourceModal() {
  const m = openModal(`
    <h3><i class="ti ti-checklist" aria-hidden="true"></i>新增官方資源項目</h3>
    <div class="field-row"><label class="field-label">項目名稱</label><input id="rr-name" placeholder="例如：最新一集綜藝"></div>
    <div class="field-row">
      <label class="field-label">分類</label>
      <select id="rr-cat" style="width:100%;"><option>社群媒體</option><option>直播</option><option>綜藝</option><option>專輯</option><option>周邊</option><option>活動資訊</option></select>
    </div>
    <div class="modal-actions">
      <button class="btn ghost small" id="rr-cancel">取消</button>
      <button class="btn primary small" id="rr-save">加入清單</button>
    </div>
  `);
  m.querySelector('#rr-cancel').onclick = () => m.remove();
  m.querySelector('#rr-save').onclick = () => {
    const name = m.querySelector('#rr-name').value.trim();
    if (!name) return;
    state.resources.push({ id: uid(), idol: state.activeIdol, name, cat: m.querySelector('#rr-cat').value, done:false });
    saveState(); m.remove(); renderApp();
  };
}

function openSupportNoteModal(editId) {
  const existing = editId ? state.supportNotes.find(n=>n.id===editId) : null;
  const icons = ['ti-flag-3','ti-chart-line','ti-disc','ti-users','ti-hash','ti-shield-check','ti-gift','ti-camera'];
  const m = openModal(`
    <h3><i class="ti ${existing?'ti-edit':'ti-plus'}" aria-hidden="true"></i>${existing?'編輯':'新增'}應援法筆記</h3>
    <div class="field-row"><label class="field-label">標題</label><input id="sn-title" value="${existing?esc(existing.title):''}" placeholder="例如：應援色 / 應援物"></div>
    <div class="field-row">
      <label class="field-label">圖示</label>
      <select id="sn-icon" style="width:100%;">${icons.map(ic=>`<option value="${ic}" ${existing&&existing.icon===ic?'selected':''}>${ic}</option>`).join('')}</select>
    </div>
    <div class="field-row"><label class="field-label">內容</label><textarea id="sn-body" rows="4" placeholder="寫下詳細的應援方式、規則、連結...">${existing?esc(existing.body):''}</textarea></div>
    <div class="modal-actions">
      <button class="btn ghost small" id="sn-cancel">取消</button>
      <button class="btn primary small" id="sn-save">${existing?'儲存':'新增'}</button>
    </div>
  `);
  m.querySelector('#sn-cancel').onclick = () => m.remove();
  m.querySelector('#sn-save').onclick = () => {
    const title = m.querySelector('#sn-title').value.trim();
    if (!title) return;
    const icon = m.querySelector('#sn-icon').value;
    const body = m.querySelector('#sn-body').value.trim();
    if (existing) { existing.title=title; existing.icon=icon; existing.body=body; }
    else state.supportNotes.push({ id: uid(), idol: state.activeIdol, icon, title, body });
    saveState(); m.remove(); renderApp();
  };
}

function openSongSupportModal() {
  const m = openModal(`
    <h3><i class="ti ti-music" aria-hidden="true"></i>新增歌曲應援</h3>
    <div class="field-row"><label class="field-label">歌曲名稱</label><input id="sg-name" placeholder="例如：出道曲"></div>
    <div class="field-row"><label class="field-label">應援方式</label><textarea id="sg-notes" rows="2" placeholder="例如：副歌時揮白色手燈"></textarea></div>
    <div class="modal-actions">
      <button class="btn ghost small" id="sg-cancel">取消</button>
      <button class="btn primary small" id="sg-save">新增</button>
    </div>
  `);
  m.querySelector('#sg-cancel').onclick = () => m.remove();
  m.querySelector('#sg-save').onclick = () => {
    const songName = m.querySelector('#sg-name').value.trim();
    if (!songName) return;
    state.songSupports.push({ id: uid(), idol: state.activeIdol, songName, notes: m.querySelector('#sg-notes').value.trim() });
    saveState(); m.remove(); renderApp();
  };
}

/* ---- init ---- */
loadState();
renderApp();
