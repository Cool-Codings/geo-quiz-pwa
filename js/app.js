const DIFFICULTIES = ['leicht', 'mittel', 'schwer'];
const DIFFICULTY_LABELS = { leicht: 'Leicht', mittel: 'Mittel', schwer: 'Schwer' };
const TIME_LIMITS = { leicht: 15, mittel: 12, schwer: 10 };
const POINTS_PER_CORRECT = { leicht: 10, mittel: 15, schwer: 20 };
const QUESTIONS_PER_ROUND = 10;
const UNLOCK_THRESHOLD = 0.7;
const ANSWER_FEEDBACK_DELAY = 1200;

function questionFromField(entry, pool, { promptLabel, promptValue, answerField, promptType }) {
  const correctValue = entry[answerField];
  const distractorPool = pool.filter((c) => c[answerField] !== correctValue);
  const distractors = shuffle(distractorPool).slice(0, 3).map((c) => c[answerField]);
  const options = shuffle([correctValue, ...distractors]);
  return {
    promptLabel,
    promptValue,
    promptType: promptType || 'text',
    options,
    correctIndex: options.indexOf(correctValue),
  };
}

const MODES = {
  hauptstaedte: {
    id: 'hauptstaedte',
    label: 'Hauptstädte',
    highscoreKey: 'geoquiz-highscore-hauptstaedte',
    unlockedKey: 'geoquiz-unlocked-difficulty-hauptstaedte',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty);
    },
    buildQuestion(entry, pool) {
      return questionFromField(entry, pool, {
        promptLabel: 'Wie heißt die Hauptstadt von...?',
        promptValue: entry.country,
        answerField: 'capital',
      });
    },
  },
  laender: {
    id: 'laender',
    label: 'Länder',
    highscoreKey: 'geoquiz-highscore-laender',
    unlockedKey: 'geoquiz-unlocked-difficulty-laender',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty);
    },
    buildQuestion(entry, pool) {
      if (Math.random() < 0.5) {
        return questionFromField(entry, pool, {
          promptLabel: 'Wie heißt die Hauptstadt von...?',
          promptValue: entry.country,
          answerField: 'capital',
        });
      }
      return questionFromField(entry, pool, {
        promptLabel: 'Welches Land hat diese Hauptstadt?',
        promptValue: entry.capital,
        answerField: 'country',
      });
    },
  },
  staedte: {
    id: 'staedte',
    label: 'Städte',
    highscoreKey: 'geoquiz-highscore-staedte',
    unlockedKey: 'geoquiz-unlocked-difficulty-staedte',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty && c.largestCity);
    },
    buildQuestion(entry, pool) {
      return questionFromField(entry, pool, {
        promptLabel: 'Welche ist die größte Stadt in...?',
        promptValue: entry.country,
        answerField: 'largestCity',
      });
    },
  },
  fluesse: {
    id: 'fluesse',
    label: 'Flüsse',
    highscoreKey: 'geoquiz-highscore-fluesse',
    unlockedKey: 'geoquiz-unlocked-difficulty-fluesse',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty && c.river);
    },
    buildQuestion(entry, pool) {
      return questionFromField(entry, pool, {
        promptLabel: 'Durch welches Land fließt dieser Fluss?',
        promptValue: entry.river,
        answerField: 'country',
      });
    },
  },
  flaggen: {
    id: 'flaggen',
    label: 'Flaggen',
    highscoreKey: 'geoquiz-highscore-flaggen',
    unlockedKey: 'geoquiz-unlocked-difficulty-flaggen',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty && c.code);
    },
    buildQuestion(entry, pool) {
      return questionFromField(entry, pool, {
        promptLabel: 'Zu welchem Land gehört diese Flagge?',
        promptValue: entry.code,
        answerField: 'country',
        promptType: 'image',
      });
    },
  },
};

const screens = {
  start: document.getElementById('screen-start'),
  quiz: document.getElementById('screen-quiz'),
  result: document.getElementById('screen-result'),
};

const el = {
  modeButtons: Array.from(document.querySelectorAll('.mode-btn')),
  startModeLabel: document.getElementById('start-mode-label'),
  startHighscore: document.getElementById('start-highscore'),
  difficultyButtons: Array.from(document.querySelectorAll('.difficulty-btn')),
  btnStart: document.getElementById('btn-start'),

  quizProgress: document.getElementById('quiz-progress'),
  quizScore: document.getElementById('quiz-score'),
  timerBar: document.getElementById('timer-bar'),
  timerNumber: document.getElementById('timer-number'),
  questionLabel: document.getElementById('question-label'),
  questionSubject: document.getElementById('question-subject'),
  questionFlag: document.getElementById('question-flag'),
  answerButtons: Array.from(document.querySelectorAll('.answer-btn')),

  resultEmoji: document.getElementById('result-emoji'),
  resultTitle: document.getElementById('result-title'),
  resultModeLabel: document.getElementById('result-mode-label'),
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
  selectedMode: 'hauptstaedte',
  selectedDifficulty: 'leicht',
  roundMode: 'hauptstaedte',
  roundDifficulty: 'leicht',
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  timeLeft: 0,
  timerHandle: null,
  answered: false,
};

function getHighscore(modeId) {
  return parseInt(localStorage.getItem(MODES[modeId].highscoreKey), 10) || 0;
}

function setHighscore(modeId, value) {
  localStorage.setItem(MODES[modeId].highscoreKey, String(value));
}

function getUnlockedIndex(modeId) {
  return parseInt(localStorage.getItem(MODES[modeId].unlockedKey), 10) || 0;
}

function setUnlockedIndex(modeId, index) {
  localStorage.setItem(MODES[modeId].unlockedKey, String(index));
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
  el.modeButtons.forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.mode === state.selectedMode);
  });

  el.startModeLabel.textContent = MODES[state.selectedMode].label;
  el.startHighscore.textContent = getHighscore(state.selectedMode);

  const unlockedIndex = getUnlockedIndex(state.selectedMode);
  el.difficultyButtons.forEach((btn) => {
    const difficulty = btn.dataset.difficulty;
    const difficultyIndex = DIFFICULTIES.indexOf(difficulty);
    const isUnlocked = difficultyIndex <= unlockedIndex;
    btn.disabled = !isUnlocked;
    btn.classList.toggle('selected', difficulty === state.selectedDifficulty);
  });
}

el.modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    state.selectedMode = btn.dataset.mode;
    state.selectedDifficulty = 'leicht';
    renderStartScreen();
  });
});

el.difficultyButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    state.selectedDifficulty = btn.dataset.difficulty;
    renderStartScreen();
  });
});

el.btnStart.addEventListener('click', () => startRound(state.selectedMode, state.selectedDifficulty));
el.btnAgain.addEventListener('click', () => startRound(state.roundMode, state.roundDifficulty));
el.btnHome.addEventListener('click', () => {
  renderStartScreen();
  showScreen('start');
});

function buildQuestions(modeId, difficulty) {
  const mode = MODES[modeId];
  const pool = mode.getPool(state.allCountries, difficulty);
  const picked = shuffle(pool).slice(0, Math.min(QUESTIONS_PER_ROUND, pool.length));
  return picked.map((entry) => mode.buildQuestion(entry, pool));
}

function startRound(modeId, difficulty) {
  state.roundMode = modeId;
  state.roundDifficulty = difficulty;
  state.questions = buildQuestions(modeId, difficulty);
  state.currentIndex = 0;
  state.score = 0;
  state.correctCount = 0;

  showScreen('quiz');
  showQuestion();
}

function showQuestion() {
  state.answered = false;
  const question = state.questions[state.currentIndex];

  el.quizProgress.textContent = `${MODES[state.roundMode].label} · Frage ${state.currentIndex + 1} von ${state.questions.length}`;
  el.quizScore.textContent = state.score;
  el.questionLabel.textContent = question.promptLabel;

  const isImagePrompt = question.promptType === 'image';
  el.questionSubject.classList.toggle('hidden', isImagePrompt);
  el.questionFlag.classList.toggle('hidden', !isImagePrompt);
  if (isImagePrompt) {
    el.questionFlag.src = `assets/flags/${question.promptValue}.svg`;
  } else {
    el.questionSubject.textContent = question.promptValue;
  }

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

  const previousHighscore = getHighscore(state.roundMode);
  const isNewHighscore = state.score > previousHighscore;
  if (isNewHighscore) setHighscore(state.roundMode, state.score);

  let unlockedNextStage = false;
  const difficultyIndex = DIFFICULTIES.indexOf(state.roundDifficulty);
  const unlockedIndex = getUnlockedIndex(state.roundMode);
  if (
    accuracy >= UNLOCK_THRESHOLD &&
    difficultyIndex === unlockedIndex &&
    difficultyIndex < DIFFICULTIES.length - 1
  ) {
    setUnlockedIndex(state.roundMode, difficultyIndex + 1);
    unlockedNextStage = true;
  }

  renderResult({ isNewHighscore, unlockedNextStage });
  showScreen('result');
}

function renderResult({ isNewHighscore, unlockedNextStage }) {
  el.resultModeLabel.textContent = `Modus: ${MODES[state.roundMode].label}`;
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
