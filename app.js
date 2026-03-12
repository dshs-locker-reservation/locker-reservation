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
      // 빈 사물함일 경우
      div.innerText = i;
      
      div.onclick = async () => {
        // ==========================================
        // ⏳ [1단계] 예약 오픈 시간 체크 (가장 먼저 실행!)
        // ==========================================
        const openTime = new Date("2026-03-12T21:05:00"); // 3월 14일 오후 6시 정각
        const now = new Date();

        if (now < openTime) {
          alert("⏳ 아직 예약 시간이 아닙니다!\n(오픈 시간: 3월 14일 오후 6시 정각)");
          return; // 시간이 안 됐으면 여기서 코드를 멈추고 쫓아냄!
        }

        // ==========================================
        // 🚨 [2단계] 야자 12시간 양심 확인 및 경고창
        // ==========================================
        const agree = confirm(
          "🚨 [경고: 야자 12시간 필수] 🚨\n\n" +
          "본인은 '주 12시간 이상 야간자율학습' 참여자임을 확인합니다.\n\n" +
          "거짓으로 예약할 경우, 예고 없이 사물함 사용 권한이 박탈되며 안의 물건은 강제 철거됩니다.\n\n" +
          "동의하십니까?"
        );
        
        // 사용자가 '취소'를 눌렀다면?
        if (!agree) {
          alert("❌ 동의하지 않아 예약이 취소되었습니다.");
          return; // 여기서 멈추고 밑의 모달창을 띄우지 않음!
        }
        // ==========================================

        // [3단계] '확인(동의)'을 누른 사람에게만 이름 입력 모달창을 띄워줌
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
  { text: "이거 내가 만들었다.", author: "- 3학년 5반 최하은 -" },
  { text: "공부가 가장 잘되는 시간은 즉시", author: "- 이종호 선생님 -" } 
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