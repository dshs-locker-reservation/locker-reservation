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

// =========================================
// 💡 랜덤 명언 띄우기 기능
// =========================================
const quotes = [
  { text: "성공은 매일 반복한 작은 노력들의 합이다.", author: "- 로버트 콜리어 -" },
  { text: "오늘 걷지 않으면, 내일은 뛰어야 한다.", author: "- 카를레스 푸욜 -" },
  { text: "승리는 가장 끈기 있는 자에게 돌아간다.", author: "- 나폴레옹 보나파르트 -" },
  { text: "아무것도 하지 않으면 아무 일도 일어나지 않는다.", author: "- 기시미 이치로 -" },
  { text: "지금 잠을 자면 꿈을 꾸지만, 지금 공부하면 꿈을 이룬다.", author: "- 작자 미상 -" },
  { text: "고통은 필수지만, 괴로움은 선택이다.", author: "- 무라카미 하루키 -" },
  { text: "12시간 야자, 버티는 자가 승리한다.", author: "- OOO고등학교 -" } // 원하시는 문구로 수정 가능!
];

function displayRandomQuote() {
  // 1. 명언 개수만큼 랜덤한 숫자(인덱스) 뽑기
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const selectedQuote = quotes[randomIndex];
  
  // 2. HTML에 선택된 명언 쏙 집어넣기
  document.getElementById("quote-text").innerText = `"${selectedQuote.text}"`;
  document.getElementById("quote-author").innerText = selectedQuote.author;
}

// 사이트가 켜질 때 명언 함수 실행!
displayRandomQuote();