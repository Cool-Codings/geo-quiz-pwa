const DIFFICULTIES = ['leicht', 'mittel', 'schwer'];
const DIFFICULTY_LABELS = { leicht: 'Leicht', mittel: 'Mittel', schwer: 'Schwer' };
const TIME_LIMITS = { leicht: 15, mittel: 12, schwer: 10 };
const POINTS_PER_CORRECT = { leicht: 10, mittel: 15, schwer: 20 };
const QUESTIONS_PER_ROUND = 10;
const UNLOCK_THRESHOLD = 0.7;
const ANSWER_FEEDBACK_DELAY = 1200;

const STORAGE_KEYS = {
  highscore: 'geoquiz-highscore',
  unlockedIndex: 'geoquiz-unlocked-difficulty-index',
};

const screens = {
  start: document.getElementById('screen-start'),
  quiz: document.getElementById('screen-quiz'),
  result: document.getElementById('screen-result'),
};

const el = {
  startHighscore: document.getElementById('start-highscore'),
  difficultyButtons: Array.from(document.querySelectorAll('.difficulty-btn')),
  btnStart: document.getElementById('btn-start'),

  quizProgress: document.getElementById('quiz-progress'),
  quizScore: document.getElementById('quiz-score'),
  timerBar: document.getElementById('timer-bar'),
  timerNumber: document.getElementById('timer-number'),
  questionCountry: document.getElementById('question-country'),
  answerButtons: Array.from(document.querySelectorAll('.answer-btn')),

  resultEmoji: document.getElementById('result-emoji'),
  resultTitle: document.getElementById('result-title'),
  resultScore: document.getElementById('result-score'),
  resultCorrect: document.getElementById('result-correct'),
  resultTotal: document.getElementById('result-total'),
  resultHighscoreMsg: document.getElementById('result-highscore-msg'),
  resultUnlockMsg: document.getElementById('result-unlock-msg'),
  btnAgain: document.getElementById('btn-again'),
  btnHome: document.getElementById('btn-home'),
};

const state = {
  allCountries: [],
  selectedDifficulty: 'leicht',
  roundDifficulty: 'leicht',
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  timeLeft: 0,
  timerHandle: null,
  answered: false,
};

function getHighscore() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.highscore), 10) || 0;
}

function setHighscore(value) {
  localStorage.setItem(STORAGE_KEYS.highscore, String(value));
}

function getUnlockedIndex() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.unlockedIndex), 10) || 0;
}

function setUnlockedIndex(index) {
  localStorage.setItem(STORAGE_KEYS.unlockedIndex, String(index));
}

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, section]) => {
    section.classList.toggle('hidden', key !== name);
  });
}

function renderStartScreen() {
  el.startHighscore.textContent = getHighscore();
  const unlockedIndex = getUnlockedIndex();

  el.difficultyButtons.forEach((btn) => {
    const difficulty = btn.dataset.difficulty;
    const difficultyIndex = DIFFICULTIES.indexOf(difficulty);
    const isUnlocked = difficultyIndex <= unlockedIndex;
    btn.disabled = !isUnlocked;
    btn.classList.toggle('selected', difficulty === state.selectedDifficulty);
  });
}

el.difficultyButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    state.selectedDifficulty = btn.dataset.difficulty;
    renderStartScreen();
  });
});

el.btnStart.addEventListener('click', () => startRound(state.selectedDifficulty));
el.btnAgain.addEventListener('click', () => startRound(state.roundDifficulty));
el.btnHome.addEventListener('click', () => {
  renderStartScreen();
  showScreen('start');
});

function buildQuestions(difficulty) {
  const pool = state.allCountries.filter((c) => c.difficulty === difficulty);
  const picked = shuffle(pool).slice(0, Math.min(QUESTIONS_PER_ROUND, pool.length));

  return picked.map((correctEntry) => {
    const distractorPool = pool.filter((c) => c.country !== correctEntry.country);
    const distractors = shuffle(distractorPool).slice(0, 3);
    const options = shuffle([correctEntry, ...distractors].map((c) => c.capital));
    return {
      country: correctEntry.country,
      capital: correctEntry.capital,
      options,
      correctIndex: options.indexOf(correctEntry.capital),
    };
  });
}

function startRound(difficulty) {
  state.roundDifficulty = difficulty;
  state.questions = buildQuestions(difficulty);
  state.currentIndex = 0;
  state.score = 0;
  state.correctCount = 0;

  showScreen('quiz');
  showQuestion();
}

function showQuestion() {
  state.answered = false;
  const question = state.questions[state.currentIndex];

  el.quizProgress.textContent = `Frage ${state.currentIndex + 1} von ${state.questions.length}`;
  el.quizScore.textContent = state.score;
  el.questionCountry.textContent = question.country;

  el.answerButtons.forEach((btn, i) => {
    btn.textContent = question.options[i];
    btn.disabled = false;
    btn.classList.remove('correct', 'wrong');
    btn.onclick = () => handleAnswer(i);
  });

  startTimer(TIME_LIMITS[state.roundDifficulty]);
}

function startTimer(seconds) {
  clearInterval(state.timerHandle);
  state.timeLeft = seconds;
  updateTimerDisplay(seconds, seconds);

  state.timerHandle = setInterval(() => {
    state.timeLeft -= 1;
    updateTimerDisplay(state.timeLeft, seconds);
    if (state.timeLeft <= 0) {
      clearInterval(state.timerHandle);
      handleAnswer(null);
    }
  }, 1000);
}

function updateTimerDisplay(timeLeft, total) {
  el.timerNumber.textContent = Math.max(timeLeft, 0);
  const percent = Math.max(timeLeft, 0) / total * 100;
  el.timerBar.style.width = `${percent}%`;
  el.timerBar.style.background = percent <= 30 ? 'var(--color-red)' : 'var(--color-grass)';
}

function handleAnswer(selectedIndex) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(state.timerHandle);

  const question = state.questions[state.currentIndex];
  const isCorrect = selectedIndex === question.correctIndex;

  el.answerButtons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === question.correctIndex) btn.classList.add('correct');
    else if (i === selectedIndex) btn.classList.add('wrong');
  });

  if (isCorrect) {
    state.score += POINTS_PER_CORRECT[state.roundDifficulty];
    state.correctCount += 1;
    el.quizScore.textContent = state.score;
  }

  setTimeout(() => {
    if (state.currentIndex + 1 < state.questions.length) {
      state.currentIndex += 1;
      showQuestion();
    } else {
      endRound();
    }
  }, ANSWER_FEEDBACK_DELAY);
}

function endRound() {
  const total = state.questions.length;
  const accuracy = total > 0 ? state.correctCount / total : 0;

  const previousHighscore = getHighscore();
  const isNewHighscore = state.score > previousHighscore;
  if (isNewHighscore) setHighscore(state.score);

  let unlockedNextStage = false;
  const difficultyIndex = DIFFICULTIES.indexOf(state.roundDifficulty);
  const unlockedIndex = getUnlockedIndex();
  if (
    accuracy >= UNLOCK_THRESHOLD &&
    difficultyIndex === unlockedIndex &&
    difficultyIndex < DIFFICULTIES.length - 1
  ) {
    setUnlockedIndex(difficultyIndex + 1);
    unlockedNextStage = true;
  }

  renderResult({ isNewHighscore, unlockedNextStage, accuracy });
  showScreen('result');
}

function renderResult({ isNewHighscore, unlockedNextStage }) {
  el.resultScore.textContent = state.score;
  el.resultCorrect.textContent = state.correctCount;
  el.resultTotal.textContent = state.questions.length;

  const goodRun = state.correctCount / state.questions.length >= 0.5;
  el.resultEmoji.textContent = goodRun ? '🎉' : '💪';
  el.resultTitle.textContent = goodRun ? 'Super gemacht!' : 'Weiter üben!';

  el.resultHighscoreMsg.classList.toggle('hidden', !isNewHighscore);
  el.resultUnlockMsg.classList.toggle('hidden', !unlockedNextStage);
  if (unlockedNextStage) {
    const nextDifficulty = DIFFICULTIES[DIFFICULTIES.indexOf(state.roundDifficulty) + 1];
    el.resultUnlockMsg.textContent = `🔓 Stufe "${DIFFICULTY_LABELS[nextDifficulty]}" freigeschaltet!`;
  }
}

async function init() {
  const response = await fetch('data/countries.json');
  state.allCountries = await response.json();
  renderStartScreen();
}

init();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.error('Service-Worker-Registrierung fehlgeschlagen:', err);
    });
  });
}
