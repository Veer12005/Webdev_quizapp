const MODE = "QUIZ";
const QUIZ_ID = "quiz_v8";

// ================= LEADERBOARD HELPERS ==================
function loadLeaderboard() {
  return JSON.parse(localStorage.getItem("leaderboard_" + QUIZ_ID)) || [];
}

function saveLeaderboard(board) {
  localStorage.setItem("leaderboard_" + QUIZ_ID, JSON.stringify(board));
}

function displayLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  if (!list) return;

  list.innerHTML = "";
  loadLeaderboard().forEach((entry, i) => {
    const li = document.createElement("li");
    li.innerText = `${i + 1}. ${entry.name} — ${entry.score}`;
    list.appendChild(li);
  });
}

// ================= QUESTIONS ==================
const questions = [
  {
    question: "Who is the most chill guy?",
    answers: [
      { text: "Shashank", correct: false },
      { text: "Samir", correct: true },
      { text: "Bhalla ji", correct: false },
      { text: "Udit", correct: false }
    ]
  },
  {
    question: "Who is the tough guy in our group?",
    answers: [
      { text: "Vishal", correct: false },
      { text: "Shashank", correct: false },
      { text: "Saket", correct: true },
      { text: "Rishabh", correct: false }
    ]
  },
  {
    question: "Who is known as 1st Desk in Linux Lab?",
    answers: [
      { text: "Utkarsh", correct: true },
      { text: "shivendra", correct: false },
      { text: "Ayush", correct: false },
      { text: "Priyanshu", correct: false }
    ]
  },
  {
     question: "The one who is good in mimic",
     answers: [
      {text: "Shivendra", correct: true},
      {text: "Samir", correct: false},
      {text: "Shashank", correct: false},
      {text: "Sunny", correct: false}
     ]
  }
];

// ================= DOM ELEMENTS ==================
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const playerInfoBox = document.getElementById("player-info");
const quizApp = document.getElementById("quiz-app");
const lbBtn = document.getElementById("view-leaderboard-btn");
const lbBox = document.getElementById("leaderboard");
const playerNameInput = document.getElementById("player-name");
const startBtn = document.getElementById("start-btn");

let currentQuestionIndex = 0;
let score = 0;

// Hide leaderboard in poll mode
if (MODE === "POLL") {
  if (lbBtn) lbBtn.style.display = "none";
  if (lbBox) lbBox.style.display = "none";
}

// Title switch
window.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("main-title");
  title.innerText = MODE === "POLL" ? "Poll" : "Simple Quiz";
});

// ================= POLL STORAGE ==================
function savePollVote(qIndex, option) {
  let pollData = JSON.parse(localStorage.getItem("poll_" + QUIZ_ID)) || {};
  if (!pollData[qIndex]) pollData[qIndex] = {};
  pollData[qIndex][option] = (pollData[qIndex][option] || 0) + 1;
  localStorage.setItem("poll_" + QUIZ_ID, JSON.stringify(pollData));
}

function getPollData() {
  return JSON.parse(localStorage.getItem("poll_" + QUIZ_ID)) || {};
}

// ================= QUIZ FLOW ==================
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  nextButton.innerText = "Next";
  showQuestion();
}

function showQuestion() {
  resetState();
  const q = questions[currentQuestionIndex];
  questionElement.innerHTML = `${currentQuestionIndex + 1}. ${q.question}`;

  q.answers.forEach(answer => {
    const btn = document.createElement("button");
    btn.innerText = answer.text;
    btn.classList.add("btn");
    if (answer.correct) btn.dataset.correct = "true";
    btn.addEventListener("click", selectAnswer);
    answerButtons.appendChild(btn);
  });
}

function resetState() {
  nextButton.style.display = "none";
  answerButtons.innerHTML = "";
}

// ================= WHEN USER SELECTS AN OPTION ==================
function selectAnswer(e) {
  const selectedBtn = e.target;

  if (MODE === "QUIZ") {
    const isCorrect = selectedBtn.dataset.correct === "true";
    if (isCorrect) {
      selectedBtn.classList.add("correct");
      score++;
    } else {
      selectedBtn.classList.add("incorrect");
    }

    Array.from(answerButtons.children).forEach(b => {
      if (b.dataset.correct === "true") b.classList.add("correct");
      b.disabled = true;
    });

    nextButton.style.display = "block";
  } else {
    savePollVote(currentQuestionIndex, selectedBtn.innerText);
    showPollResultsForCurrentQuestion();
  }
}

// ================= SHOW % RESULTS OF CURRENT QUESTION ==================
function showPollResultsForCurrentQuestion() {
  resetState();
  const pollData = getPollData();
  const qData = pollData[currentQuestionIndex] || {};
  const totalVotes = Object.values(qData).reduce((a, b) => a + b, 0);

  questionElement.innerHTML = "<b>Poll Results</b><br><br>";

  questions[currentQuestionIndex].answers.forEach(opt => {
    const text = opt.text;
    const votes = qData[text] || 0;
    const percent = totalVotes ? ((votes / totalVotes) * 100).toFixed(1) : 0;

    const div = document.createElement("div");
    div.style.padding = "10px";
    div.style.margin = "10px 0";
    div.style.background = "#e8e8e8";
    div.innerHTML = `${text} — <b>${percent}%</b> (${votes} votes)`;
    answerButtons.appendChild(div);
  });

  nextButton.style.display = "block";
}

// ================= SHOW OVERALL POLL SUMMARY ==================
function showOverallPollSummary() {
  resetState();

  const pollData = getPollData();
  questionElement.innerHTML = "<b>Overall Poll Summary</b><br><br>";

  questions.forEach((q, index) => {
    const qData = pollData[index] || {};
    const totalVotes = Object.values(qData).reduce((a, b) => a + b, 0);

    // find top option
    let topOption = "";
    let topVotes = 0;

    for (let opt in qData) {
      if (qData[opt] > topVotes) {
        topVotes = qData[opt];
        topOption = opt;
      }
    }

    const percent = totalVotes ? ((topVotes / totalVotes) * 100).toFixed(1) : 0;

    const box = document.createElement("div");
    box.style.background = "rgba(255,255,255,0.25)";
    box.style.padding = "12px";
    box.style.borderRadius = "12px";
    box.style.margin = "10px 0";

    box.innerHTML = `
      <b>Q${index + 1}: ${q.question}</b><br>
      Top Choice: <b>${topOption || "No votes yet"}</b><br>
      Percentage: <b>${percent}%</b>
    `;

    answerButtons.appendChild(box);
  });

  nextButton.style.display = "none";
  questionElement.innerHTML += "<br><strong>Thank you for participating!</strong>";

  // mark player as having voted
  const name = localStorage.getItem("currentPlayer");
  let played = JSON.parse(localStorage.getItem("poll_played_" + QUIZ_ID)) || [];
  if (!played.includes(name)) {
    played.push(name);
    localStorage.setItem("poll_played_" + QUIZ_ID, JSON.stringify(played));
  }
}


// ================= FINAL SUMMARY ==================
function showScore() {
  resetState();

  if (MODE === "POLL") {
    showOverallPollSummary();
    return;
  }

  const player = localStorage.getItem("currentPlayer") || "Anonymous";
  questionElement.innerHTML = `
    You scored <b>${score}</b> out of <b>${questions.length}</b>!
    <br><br><strong>Thank you!</strong>
  `;

  // Update leaderboard
  let board = loadLeaderboard();
  board.push({ name: player, score });
  board.sort((a, b) => b.score - a.score);
  saveLeaderboard(board);

  lbBtn.style.display = "inline-block";
  lbBtn.onclick = () => {
    lbBox.style.display = "block";
    displayLeaderboard();
    lbBox.scrollIntoView({ behavior: "smooth" });
  };
}

// ================= NEXT BUTTON ==================
function handleNextButton() {
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
}

nextButton.addEventListener("click", handleNextButton);

function showAdminPanel() {
  quizApp.style.display = "block";
  quizApp.innerHTML = `
    <h1 style="text-align:center; color:#001e4d;">Admin Panel</h1>

    <div class="admin-buttons" style="text-align:center; margin:20px 0;">
      <button class="btn admin-btn" id="view-leaderboard">View Quiz Leaderboard</button>
      <button class="btn admin-btn" id="view-poll-summary">View Poll Summary</button>
    </div>

    <div id="admin-output" style="
        margin-top:20px; 
        background:#f5f5f5; 
        padding:20px; 
        border-radius:10px; 
        max-height:400px; 
        overflow:auto;
    "></div>
  `;

  const output = document.getElementById("admin-output");

  document.getElementById("view-leaderboard").addEventListener("click", () => {
    output.innerHTML = "<h3>Leaderboard</h3>";
    const board = JSON.parse(localStorage.getItem("leaderboard_" + QUIZ_ID)) || [];
    const ul = document.createElement("ul");
    board.forEach((entry, i) => {
      const li = document.createElement("li");
      li.innerText = `${i+1}. ${entry.name} — ${entry.score}`;
      li.style.padding = "5px 0";
      ul.appendChild(li);
    });
    output.appendChild(ul);
  });

  document.getElementById("view-poll-summary").addEventListener("click", () => {
    output.innerHTML = "<h3>Poll Summary</h3>";
    const pollData = JSON.parse(localStorage.getItem("poll_" + QUIZ_ID)) || {};
    Object.keys(pollData).forEach(qIndex => {
      const q = questions[qIndex];
      const qData = pollData[qIndex];
      const div = document.createElement("div");
      div.style.marginBottom = "15px";
      div.style.padding = "10px";
      div.style.background = "#e8e8e8";
      div.style.borderRadius = "8px";

      div.innerHTML = `<b>Q${parseInt(qIndex)+1}: ${q.question}</b><br>`;
      Object.keys(qData).forEach(opt => {
        div.innerHTML += `${opt}: ${qData[opt]} votes<br>`;
      });
      output.appendChild(div);
    });
  });
}



// ================= LOGIN ==================
const allowedUsers = ["2400520100169", "2400520100154", "2400520100150", "2400520100159", "2400520100152", "2400520100151", "2400520100167", "2400520100162", "2400520100174", "2400520100175", "2400520100164", "240520100165", "2400520100166"];


const adminUsers = ["2400520100169"]; // your admin ID(s)


// ================= LOGIN ==================
startBtn.addEventListener("click", () => {
  const enteredId = playerNameInput.value.trim();
  if (enteredId === "") {
    alert("Enter your ID!");
    return;
  }

  // Admin login
  if (adminUsers.includes(enteredId)) {
    localStorage.setItem("currentPlayer", enteredId);
    playerInfoBox.style.display = "none";
    showAdminPanel();
    return;
  }

  // Participant login
  if (!allowedUsers.includes(enteredId)) {
    if(MODE==="QUIZ"){
      alert("you are not authorized for this quiz!");
      return;
    }
    if(MODE==="POLL"){alert("you are not authorized for this poll!");
    return;}
  }

  const played = JSON.parse(localStorage.getItem("played_" + QUIZ_ID)) || [];
  if (played.includes(enteredId)) {
    alert("You have already taken this quiz!");
    return;
  }

  localStorage.setItem("currentPlayer", enteredId);
  played.push(enteredId);
  localStorage.setItem("played_" + QUIZ_ID, JSON.stringify(played));

  playerInfoBox.style.display = "none";
  quizApp.style.display = "block";
  startQuiz();
});
