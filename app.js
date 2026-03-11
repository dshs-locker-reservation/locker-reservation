import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAk8MjKCLDbk-OXqxyW5g8MY7DLaY4Dbjg",
  authDomain: "locker-b8f43.firebaseapp.com",
  projectId: "locker-b8f43",
  storageBucket: "locker-b8f43.firebasestorage.app",
  messagingSenderId: "204210400652",
  appId: "1:204210400652:web:ffd978d8ceba7814e63aa9",
  measurementId: "G-GYHSV2FWNR",
  databaseURL: "https://locker-b8f43-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const grid = document.getElementById("grid");

function openModal(title, desc) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("modal-overlay");
    const titleEl = document.getElementById("modal-title");
    const descEl = document.getElementById("modal-desc");
    const inputEl = document.getElementById("modal-input");
    const btnConfirm = document.getElementById("modal-confirm");
    const btnCancel = document.getElementById("modal-cancel");

    titleEl.innerText = title;
    descEl.innerText = desc;
    inputEl.value = ""; 
    
    overlay.classList.add("active");
    inputEl.focus();

    function close(result) {
      overlay.classList.remove("active");
      btnConfirm.onclick = null;
      btnCancel.onclick = null;
      resolve(result);
    }

    btnConfirm.onclick = () => close(inputEl.value.trim() || null);
    btnCancel.onclick = () => close(null);
    
    inputEl.onkeydown = (e) => {
      if (e.key === "Enter") {
        close(inputEl.value.trim() || null);
      }
    };
  });
}

async function render() {
  grid.innerHTML = "";

  const lockersRef = ref(db, "lockers");
  const snapshot = await get(lockersRef);
  const lockersData = snapshot.exists() ? snapshot.val() : {};

  // 💡 개수 카운트를 위한 변수 추가
  let occupiedCount = 0;
  const totalLockers = 33;

  for (let i = 1; i <= totalLockers; i++) {
    let div = document.createElement("div");
    div.className = "locker";

    if (lockersData[i]) {
      occupiedCount++; // 예약된 사물함이면 카운트 1 증가
      
      div.classList.add("reserved");
      div.innerText = i + "\n사용중";
      
      div.onclick = async () => {
        let inputName = await openModal(
          "예약 취소", 
          i + "번 사물함 예약을 취소하시겠습니까?\n예약하신 이름을 정확히 입력해주세요."
        );
        
        if (inputName === null) return; 
        
        if (inputName === lockersData[i].name) {
          let specificLockerRef = ref(db, "lockers/" + i);
          await remove(specificLockerRef);
          alert("예약이 취소되었습니다.");
          render();
        } else {
          alert("이름이 일치하지 않아 취소할 수 없습니다.");
        }
      };

    } else {
      div.innerText = i;
      
      div.onclick = async () => {
        let name = await openModal(
          "사물함 예약", 
          i + "번 사물함을 예약합니다.\n예약자 이름을 입력하세요."
        );
        
        if (!name) return; 

        let specificLockerRef = ref(db, "lockers/" + i);
        await set(specificLockerRef, { name: name });
        
        render();
      };
    }
    grid.appendChild(div);
  }

  // 💡 루프가 끝나면 화면의 숫자를 업데이트합니다.
  document.getElementById("count-occupied").innerText = occupiedCount;
  document.getElementById("count-available").innerText = totalLockers - occupiedCount;
}

render();