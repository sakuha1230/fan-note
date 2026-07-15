/* ================== Firebase 初始化與雲端同步 ================== */
/*
  這個檔案負責：
  1. 初始化 Firebase（用你在 Firebase 主控台拿到的設定）
  2. Google 登入 / 登出
  3. 把 state 存到 Firestore（登入時），或退回本機 localStorage（未登入時）

  資料結構：
  users/{uid}   這份文件底下存放該使用者的完整 state JSON
*/

const firebaseConfig = {
  apiKey: "AIzaSyCUwAueY42a4knlwTw7O7q3kgf3lnmgdtw",
  authDomain: "fan-note-5caf4.firebaseapp.com",
  projectId: "fan-note-5caf4",
  storageBucket: "fan-note-5caf4.firebasestorage.app",
  messagingSenderId: "323515222159",
  appId: "1:323515222159:web:131eadb3b9126f876108fa",
  measurementId: "G-T85SE4BEHE"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let cloudSyncReady = false; // 避免登入瞬間、資料還沒抓回來前就把本機空資料寫上去覆蓋雲端

/* ---- 登入狀態變化時的處理 ---- */
auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  cloudSyncReady = false;

  if (user) {
    // 已登入：從雲端抓資料
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists && doc.data() && doc.data().state) {
        // 雲端已經有資料，用雲端資料完全取代畫面上的資料（包含示範資料）
        state = JSON.parse(doc.data().state);
      } else {
        // 雲端還沒有資料（第一位使用者第一次登入）：給一份乾淨的空白帳本，
        // 而不是把畫面上殘留的示範資料當成初始值存上去
        state = createBlankState();
        await saveStateToCloud();
      }
    } catch (e) {
      console.error('讀取雲端資料失敗', e);
    }
  }

  cloudSyncReady = true;
  if (typeof renderApp === 'function') renderApp();
  if (typeof renderFab === 'function') renderFab();
});

/* ---- Google 登入 ---- */
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (e) {
    console.error('登入失敗', e);
    if (e && e.code === 'auth/popup-blocked') {
      alert('瀏覽器阻擋了登入視窗，請允許彈出視窗後再試一次');
    } else {
      alert('登入時發生問題，請稍後再試一次');
    }
  }
}

async function signOutUser() {
  try { await auth.signOut(); } catch (e) { console.error('登出失敗', e); }
}

/* ---- 儲存到雲端（登入時使用）---- */
let saveDebounceTimer = null;
async function saveStateToCloud() {
  if (!currentUser) return;
  try {
    await db.collection('users').doc(currentUser.uid).set({
      state: JSON.stringify(state),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.error('儲存到雲端失敗', e);
  }
}

/* ---- 覆寫 saveState：登入時寫雲端＋本機備份，未登入時只寫本機 ---- */
const _originalSaveStateLocal = saveState; // 保留原本寫 localStorage 的版本
saveState = function() {
  _originalSaveStateLocal();
  if (currentUser && cloudSyncReady) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(saveStateToCloud, 600); // 稍微延遲，避免打字時每個字都寫一次雲端
  }
};
