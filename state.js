/* ================== 全域狀態與資料層 ================== */
const STORAGE_KEY = 'fandom_notebook_v2';
function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
const TODAY = getTodayStr();

const COLOR_PRESETS = ['#7A2E2A','#5C6B4F','#A9791F','#4A5568','#8B5A8C','#2F6690','#B0563E','#3E6152'];

let state = {
  // 全域設定
  settings: {
    fabAvatarSize: 56,
    fabTheme: 'default' // 'default' | 'minimal'
  },
  idols: [
    {
      id: 'i1', name: '示範愛豆 A', color: '#7A2E2A',
      avatarUrl: '', coverUrl: '',
      debutDate: '2019-06-01',
      groupName: '示範男團', position: '主唱',
      fields: [ { label: '生日', value: '03-14' } ]
    },
    {
      id: 'i2', name: '示範愛豆 B', color: '#5C6B4F',
      avatarUrl: '', coverUrl: '',
      debutDate: '2021-02-10',
      groupName: '示範女團', position: '',
      fields: []
    }
  ],
  activeIdol: 'i1',
  currentView: 'home', // 'home' | 'idol'

  // 追星紀錄（原入坑故事）— 每筆綁定 idol，也會出現在主頁總覽
  logs: [
    { id: 'o1', idol: 'i1', date: '2022-03-14', text: '朋友傳來一支舞台影片，說「妳一定會喜歡」。看完的當下沒特別感覺，但那個轉音一直在腦中重播。' },
    { id: 'o2', idol: 'i1', date: '2022-04-02', text: '半夜補完出道以來的所有直拍，隔天上班全程恍神。開始覺得，好像回不去了。' },
    { id: 'o3', idol: 'i2', date: '2023-01-20', text: '因為朋友安利才點開的舞台，結果整個晚上都在找過去的影片。' }
  ],

  // 活動紀錄（原見面會紀錄）
  meetings: [
    { id: 'm1', idol: 'i1', type: '簽售會', customTag: '', title: '第二張專輯簽售', date: '2023-06-18', exchanges: [
        { who: '我', text: '謝謝你這幾年的音樂陪我度過很多低潮，辛苦了。' },
        { who: '他', text: '換我謝謝妳才對，有妳在真的很有力量，要照顧好自己喔。' }
      ], note: '他說話的時候一直有看著我的眼睛，握手的時候手心比想像中溫暖很多。' }
  ],

  // 追星年表（原應援史）
  achievements: [
    { id: 'a1', idol: 'i1', type: 'album', name: '首張正規專輯', date: '2022-05', category: '專輯' },
    { id: 'a2', idol: 'i1', type: 'concert', name: '首爾演唱會 Day1', date: '2023-01', category: '演唱會' },
    { id: 'a3', idol: 'i1', type: 'event', name: '簽售會抽中', date: '2023-06', category: '簽售' },
    { id: 'a4', idol: 'i1', type: 'goods', name: '應援手燈 ver.3', date: '2023-08', category: '周邊' }
  ],

  // 情緒安全度（淡坑 / 刪除回踩）
  emotions: [
    { id: 'e1', idol: 'i1', date: '2024-01', value: 85, tags: ['心動','穩定'] },
    { id: 'e2', idol: 'i1', date: '2024-04', value: 55, tags: ['淡坑中'] },
    { id: 'e3', idol: 'i1', date: '2024-07', value: 70, tags: ['心動'] }
  ],

  // 統一行事曆：所有偶像行程都在這一份資料裡，用 idol 欄位區分
  schedule: [
    { id: 's1', idol: 'i1', name: '巡演台北場', date: '2026-08-12', tagName: '', type: '演唱會', priority: 1, remind: true },
    { id: 's2', idol: 'i2', name: '生日應援活動', date: '2026-08-12', tagName: '', type: '應援', priority: 2, remind: false },
    { id: 's3', idol: 'i1', name: '直播生放送', date: '2026-08-20', tagName: '', type: '直播', priority: 2, remind: true }
  ],

  // 官方資源清單
  resources: [
    { id: 'r1', idol: 'i1', name: 'YouTube 官方頻道全影片', cat: '社群媒體', done: true },
    { id: 'r2', idol: 'i1', name: 'Weverse 專屬留言', cat: '社群媒體', done: false },
    { id: 'r3', idol: 'i1', name: '出道紀錄片', cat: '綜藝', done: false },
    { id: 'r4', idol: 'i1', name: '首張正規專輯', cat: '專輯', done: true },
    { id: 'r5', idol: 'i1', name: '演唱會 DVD', cat: '周邊', done: false },
    { id: 'r6', idol: 'i1', name: '生日應援站活動', cat: '活動資訊', done: false }
  ],

  // 應援法：可編輯筆記卡片
  supportNotes: [
    { id: 'sn1', idol: 'i1', icon: 'ti-flag-3', title: '應援色 / 應援物', body: '官方應援色為酒紅色與米白色，手燈型號 ver.3，可於官方商城購買。' },
    { id: 'sn2', idol: 'i1', icon: 'ti-chart-line', title: '打歌 / 投票規則', body: '各節目投票方式、每日次數上限、截止時間整理於此。' },
    { id: 'sn3', idol: 'i1', icon: 'ti-users', title: '應援站資訊', body: '生日應援、地鐵廣告等公益應援站的參與方式與集資連結。' }
  ],
  // 各歌曲應援法
  songSupports: [
    { id: 'ss1', idol: 'i1', songName: '出道曲', notes: '副歌第二次重複時全體揮白色手燈' },
    { id: 'ss2', idol: 'i1', songName: '生日曲', notes: '間奏時喊生日祝福口號' }
  ],

  // 待辦事項（主頁）
  todos: [
    { id: 'td1', text: '確認演唱會周邊預購時間', done: false },
    { id: 'td2', text: '整理應援手幅設計稿', done: false }
  ]
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = Object.assign({}, state, parsed);
    }
  } catch(e) {}
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}
function uid() { return 'id' + Math.random().toString(36).slice(2, 9); }
function esc(s) { const d = document.createElement('div'); d.textContent = (s===undefined||s===null)?'':String(s); return d.innerHTML; }

/* 給已登入、雲端還沒有任何資料的使用者一份乾淨的空白帳本（不含示範資料） */
function createBlankState() {
  const firstIdolId = uid();
  return {
    settings: { fabAvatarSize: 56, fabTheme: 'default' },
    idols: [
      { id: firstIdolId, name: '我的偶像', color: COLOR_PRESETS[0], avatarUrl: '', coverUrl: '', debutDate: '', groupName: '', position: '', fields: [] }
    ],
    activeIdol: firstIdolId,
    currentView: 'home',
    logs: [],
    meetings: [],
    achievements: [],
    emotions: [],
    schedule: [],
    resources: [],
    supportNotes: [],
    songSupports: [],
    todos: []
  };
}

function activeIdolData() { return state.idols.find(i => i.id === state.activeIdol); }
function idolById(id) { return state.idols.find(i => i.id === id); }
function byIdol(arr) { return arr.filter(x => x.idol === state.activeIdol); }
function byIdolId(arr, id) { return arr.filter(x => x.idol === id); }

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  if (isNaN(dt)) return d;
  return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')}`;
}
function fmtMonthDay(d) {
  const dt = new Date(d + 'T00:00:00');
  if (isNaN(dt)) return d;
  return `${dt.getMonth()+1}/${dt.getDate()}`;
}
function daysDiff(d) {
  const dt = new Date(d + 'T00:00:00');
  const now = new Date(TODAY + 'T00:00:00');
  return Math.floor((now - dt) / 86400000);
}
function daysUntil(d) {
  const dt = new Date(d + 'T00:00:00');
  const now = new Date(TODAY + 'T00:00:00');
  return Math.floor((dt - now) / 86400000);
}
function yearsAgoText(d) {
  const days = daysDiff(d);
  const years = Math.floor(days / 365);
  if (years >= 1) return `${years} 年前的今天`;
  const months = Math.floor(days / 30);
  if (months >= 1) return `${months} 個月前`;
  if (days === 0) return '就是今天';
  if (days < 0) return `${-days} 天後`;
  return `${days} 天前`;
}
function initials(name) {
  return (name||'').trim().slice(0,2);
}
function avatarStyle(idol) {
  if (idol && idol.avatarUrl) return `background-image:url('${idol.avatarUrl.replace(/'/g,"")}')`;
  return `background:${idol?idol.color:'#999'}`;
}
