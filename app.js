import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
// 취소 기능을 위해 remove 함수가 추가되었습니다.
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
      // 1. 이름 대신 "사용중"이라고 띄웁니다.
      div.innerText = i + "\n사용중";
      
      // 2. 예약된 사물함을 클릭했을 때 (취소 기능)
      div.onclick = async () => {
        let inputName = prompt(i + "번 사물함 예약을 취소하시겠습니까?\n예약하신 이름을 정확히 입력해주세요.");
        
        if (inputName === null) return; // 사용자가 취소 버튼을 누른 경우
        
        // 입력한 이름과 DB에 저장된 이름이 같을 때만 삭제합니다.
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
      
      // 빈 사물함을 클릭했을 때 (예약 기능)
      div.onclick = async () => {
        let name = prompt(i + "번 사물함을 예약합니다.\n예약자 이름을 입력하세요.");
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