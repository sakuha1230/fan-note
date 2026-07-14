/* ================== 共用元件 ================== */

function emptyState(icon, title, desc) {
  return `<div class="empty"><i class="ti ${icon}" aria-hidden="true"></i><p style="font-weight:500;color:var(--ink-soft)">${title}</p><p>${desc}</p></div>`;
}

/* ---- 浮動選單（取代漢堡選單） ---- */
let fabOpen = false;
function renderFab() {
  const wrap = document.getElementById('fab-wrap');
  const idol = activeIdolData();
  const size = state.settings.fabAvatarSize || 56;

  const menuItems = state.idols.map(i => `
    <div class="fab-menu-item ${state.currentView==='idol' && state.activeIdol===i.id ? 'active':''}" data-fab-idol="${i.id}">
      <span class="avatar" style="${avatarStyle(i)}">${i.avatarUrl?'':esc(initials(i.name))}</span>
      ${esc(i.name)}
    </div>
  `).join('');

  wrap.innerHTML = `
    <div class="fab-menu ${fabOpen?'open':''}" id="fab-menu">
      <div class="fab-menu-item ${state.currentView==='home'?'active':''}" data-fab-home="1">
        <span class="avatar" style="background:var(--ink-soft);"><i class="ti ti-home" aria-hidden="true" style="font-size:14px"></i></span>
        主頁總覽
      </div>
      <div class="fab-menu-divider"></div>
      ${menuItems}
      <div class="fab-menu-divider"></div>
      <div class="fab-menu-item" data-fab-add="1">
        <span class="avatar" style="background:var(--paper);color:var(--ink-faint);border:1px dashed var(--line-strong);"><i class="ti ti-plus" aria-hidden="true" style="font-size:14px"></i></span>
        新增偶像
      </div>
      <div class="fab-menu-item" data-fab-settings="1">
        <span class="avatar" style="background:var(--paper);color:var(--ink-faint);border:1px dashed var(--line-strong);"><i class="ti ti-adjustments" aria-hidden="true" style="font-size:14px"></i></span>
        自訂浮動選單
      </div>
    </div>
    <div class="fab-btn" id="fab-btn" style="width:${size}px;height:${size}px;${state.currentView==='idol'&&idol?avatarStyle(idol):'background:var(--accent);'}">
      ${state.currentView==='idol' && idol ? (idol.avatarUrl?'':esc(initials(idol.name))) : '<i class="ti ti-menu-2" aria-hidden="true"></i>'}
    </div>
  `;

  document.getElementById('fab-btn').onclick = () => { fabOpen = !fabOpen; renderFab(); };
  const menuEl = document.getElementById('fab-menu');
  const homeItem = menuEl.querySelector('[data-fab-home]');
  if (homeItem) homeItem.onclick = () => { state.currentView='home'; fabOpen=false; saveState(); renderApp(); };
  menuEl.querySelectorAll('[data-fab-idol]').forEach(el => {
    el.onclick = () => { state.activeIdol = el.dataset.fabIdol; state.currentView='idol'; fabOpen=false; saveState(); renderApp(); };
  });
  const addItem = menuEl.querySelector('[data-fab-add]');
  if (addItem) addItem.onclick = () => { fabOpen=false; renderFab(); openAddIdolModal(); };
  const settingsItem = menuEl.querySelector('[data-fab-settings]');
  if (settingsItem) settingsItem.onclick = () => { fabOpen=false; renderFab(); openFabSettingsModal(); };
}

function openFabSettingsModal() {
  const m = openModal(`
    <h3><i class="ti ti-adjustments" aria-hidden="true"></i>自訂浮動選單</h3>
    <div class="field-row">
      <label class="field-label">按鈕大小</label>
      <input type="range" id="fab-size" min="44" max="72" value="${state.settings.fabAvatarSize||56}" style="width:100%">
    </div>
    <div class="modal-actions">
      <button class="btn ghost small" id="fs-cancel">取消</button>
      <button class="btn primary small" id="fs-save">儲存設定</button>
    </div>
  `);
  m.querySelector('#fs-cancel').onclick = () => m.remove();
  m.querySelector('#fs-save').onclick = () => {
    state.settings.fabAvatarSize = +m.querySelector('#fab-size').value;
    saveState(); m.remove(); renderFab();
  };
}

function openAddIdolModal() {
  const m = openModal(`
    <h3><i class="ti ti-heart" aria-hidden="true"></i>新增偶像 / 團體</h3>
    <div class="field-row"><label class="field-label">名稱</label><input id="ai-name" placeholder="例如：示範愛豆 C"></div>
    <div class="field-row">
      <label class="field-label">標記顏色</label>
      <div class="color-swatch-row" id="ai-color-row">
        ${COLOR_PRESETS.map((c,idx)=>`<span class="color-swatch ${idx===0?'selected':''}" style="background:${c}" data-color="${c}"></span>`).join('')}
        <input type="color" id="ai-color-custom" value="${COLOR_PRESETS[0]}">
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn ghost small" id="ai-cancel">取消</button>
      <button class="btn primary small" id="ai-save">新增</button>
    </div>
  `);
  let pickedColor = COLOR_PRESETS[0];
  m.querySelectorAll('.color-swatch').forEach(sw => {
    sw.onclick = () => {
      m.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('selected'));
      sw.classList.add('selected');
      pickedColor = sw.dataset.color;
    };
  });
  m.querySelector('#ai-color-custom').oninput = (e) => { pickedColor = e.target.value; m.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('selected')); };
  m.querySelector('#ai-cancel').onclick = () => m.remove();
  m.querySelector('#ai-save').onclick = () => {
    const name = m.querySelector('#ai-name').value.trim();
    if (!name) return;
    const id = uid();
    state.idols.push({ id, name, color: pickedColor, avatarUrl:'', coverUrl:'', debutDate:'', groupName:'', position:'', fields:[] });
    state.activeIdol = id; state.currentView = 'idol';
    saveState(); m.remove(); renderApp();
  };
}

/* ---- 通用彈窗系統 ---- */
function openModal(html) {
  document.querySelectorAll('.modal-mask').forEach(m => m.remove());
  const wrap = document.createElement('div');
  wrap.className = 'modal-mask open';
  wrap.innerHTML = `<div class="modal"><div class="modal-scroll">${html}</div></div>`;
  wrap.addEventListener('click', (e) => { if (e.target === wrap) wrap.remove(); });
  document.body.appendChild(wrap);
  return wrap;
}
