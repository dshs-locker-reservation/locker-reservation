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

// 🌟 커스텀 모달(팝업)을 띄우는 함수
function openModal(title, desc) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("modal-overlay");
    const titleEl = document.getElementById("modal-title");
    const descEl = document.getElementById("modal-desc");
    const inputEl = document.getElementById("modal-input");
    const btnConfirm = document.getElementById("modal-confirm");
    const btnCancel = document.getElementById("modal-cancel");

    // 제목과 설명 텍스트 채우기
    titleEl.innerText = title;
    descEl.innerText = desc;
    inputEl.value = ""; // 입력창 초기화
    
    // 모달 보여주기
    overlay.classList.add("active");
    inputEl.focus();

    // 창 닫고 결과 보내는 함수
    function close(result) {
      overlay.classList.remove("active");
      btnConfirm.onclick = null;
      btnCancel.onclick = null;
      resolve(result);
    }

    // 버튼 클릭 시 작동
    btnConfirm.onclick = () => close(inputEl.value.trim() || null);
    btnCancel.onclick = () => close(null);
    
    // 키보드 '엔터' 쳤을 때도 확인 버튼과 똑같이 동작
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

  for (let i = 1; i <= 33; i++) {
    let div = document.createElement("div");
    div.className = "locker";

    if (lockersData[i]) {
      div.classList.add("reserved");
      div.innerText = i + "\n사용중";
      
      div.onclick = async () => {
        // 기존 prompt 대신 예쁜 커스텀 팝업창 사용
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
        // 기존 prompt 대신 예쁜 커스텀 팝업창 사용
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
}

render();