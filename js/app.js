const DIFFICULTIES = ['leicht', 'mittel', 'schwer'];
const DIFFICULTY_LABELS = { leicht: 'Leicht', mittel: 'Mittel', schwer: 'Schwer' };
const TIME_LIMITS = { leicht: 15, mittel: 12, schwer: 10 };
const POINTS_PER_CORRECT = { leicht: 10, mittel: 15, schwer: 20 };
const QUESTIONS_PER_ROUND = 10;
const UNLOCK_THRESHOLD = 0.7;
const ANSWER_FEEDBACK_DELAY = 1200;

const MASCOT_SRC = {
  idle: 'assets/mascot/koala-idle.svg',
  happy: 'assets/mascot/koala-happy.svg',
  comfort: 'assets/mascot/koala-comfort.svg',
  excited: 'assets/mascot/koala-excited.svg',
};

const GREETINGS = {
  morning: [
    'Guten Morgen! Bereit für ein paar knifflige Fragen? ☀️',
    'Guten Morgen! Lass uns die Welt entdecken! 🌍',
  ],
  afternoon: [
    'Schön, dass du da bist! Lust auf ein Quiz? 🌤️',
    'Hallo! Zeit für neue Entdeckungen! 🗺️',
  ],
  evening: [
    'Guten Abend! Noch eine Runde Geo-Quiz? 🌙',
    'Hallo! Lass uns gemeinsam die Welt erkunden! ✨',
  ],
};

const CORRECT_MESSAGES = [
  'Super gemacht! 🎉',
  'Klasse! Du kennst dich aus! 🌟',
  'Genau richtig! 👏',
  'Wow, stark! 💪',
  'Perfekt! Weiter so! ✨',
];

const WRONG_MESSAGES = [
  "Kein Problem, nächstes Mal klappt's! 💛",
  "Fast! Beim nächsten Mal schaffst du's! 🌈",
  'Nicht so schlimm, weiter geht\'s! 🙂',
  'Das war knifflig! Du lernst dazu! 🌱',
  'Kopf hoch, du machst das gut! 🤗',
];

const RESULT_MESSAGES = {
  excellent: [
    'Wow, fantastisch! Du bist ein echter Geo-Profi! 🏆',
    'Sensationell! Fast alles richtig! 🌟',
  ],
  good: [
    'Super gemacht! Du kennst dich richtig gut aus! 🎉',
    'Klasse Runde! Weiter so! 👏',
  ],
  practice: [
    'Guter Versuch! Übung macht den Meister! 💪',
    'Weiter so, du wirst von Mal zu Mal besser! 🌱',
  ],
};

const STREAK_MILESTONES = [3, 7, 14, 30];
const STREAK_COUNT_KEY = 'geoquiz-streak-count';
const STREAK_LAST_DATE_KEY = 'geoquiz-streak-last-date';

const CONFETTI_COLORS = ['#FF6B6B', '#FFD93D', '#06D6A0', '#4ECDC4', '#9B5DE5', '#4FC3F7'];

const MAP_WIDTH = 960;
const MAP_HEIGHT = 480;
const CITY_CLICK_TOLERANCE = 22;

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
  'karte-laender': {
    id: 'karte-laender',
    label: 'Karte: Länder finden',
    highscoreKey: 'geoquiz-highscore-karte-laender',
    unlockedKey: 'geoquiz-unlocked-difficulty-karte-laender',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty && c.code);
    },
    buildQuestion(entry) {
      return {
        promptLabel: 'Wo liegt dieses Land?',
        promptValue: entry.country,
        promptType: 'map-country',
        targetCode: entry.code,
      };
    },
  },
  'karte-staedte': {
    id: 'karte-staedte',
    label: 'Karte: Städte finden',
    highscoreKey: 'geoquiz-highscore-karte-staedte',
    unlockedKey: 'geoquiz-unlocked-difficulty-karte-staedte',
    getPool(countries, difficulty) {
      const cities = [];
      countries
        .filter((c) => c.difficulty === difficulty && c.capitalCoords)
        .forEach((c) => {
          cities.push({ name: c.capital, coords: c.capitalCoords });
          if (c.largestCity !== c.capital && c.largestCityCoords) {
            cities.push({ name: c.largestCity, coords: c.largestCityCoords });
          }
        });
      return cities;
    },
    buildQuestion(entry) {
      return {
        promptLabel: 'Wo liegt diese Stadt?',
        promptValue: entry.name,
        promptType: 'map-city',
        targetCoords: entry.coords,
      };
    },
  },
};

const MAP_MODE_IDS = ['karte-laender', 'karte-staedte'];

const screens = {
  start: document.getElementById('screen-start'),
  quiz: document.getElementById('screen-quiz'),
  result: document.getElementById('screen-result'),
};

const el = {
  modeButtons: Array.from(document.querySelectorAll('.mode-btn')),
  karteSubmodes: document.getElementById('karte-submodes'),
  karteSubmodeButtons: Array.from(document.querySelectorAll('.karte-submode-btn')),
  startModeLabel: document.getElementById('start-mode-label'),
  startHighscore: document.getElementById('start-highscore'),
  difficultyButtons: Array.from(document.querySelectorAll('.difficulty-btn')),
  btnStart: document.getElementById('btn-start'),
  startMascot: document.getElementById('start-mascot'),
  startBubble: document.getElementById('start-bubble'),
  streakBadge: document.getElementById('streak-badge'),

  quizProgress: document.getElementById('quiz-progress'),
  quizScore: document.getElementById('quiz-score'),
  timerBar: document.getElementById('timer-bar'),
  timerNumber: document.getElementById('timer-number'),
  questionLabel: document.getElementById('question-label'),
  questionSubject: document.getElementById('question-subject'),
  questionFlag: document.getElementById('question-flag'),
  answerButtons: Array.from(document.querySelectorAll('.answer-btn')),
  answersGrid: document.getElementById('answers-grid'),
  mapContainer: document.getElementById('map-container'),
  quizMascot: document.getElementById('quiz-mascot'),
  quizBubble: document.getElementById('quiz-bubble'),

  resultTitle: document.getElementById('result-title'),
  resultModeLabel: document.getElementById('result-mode-label'),
  resultScore: document.getElementById('result-score'),
  resultCorrect: document.getElementById('result-correct'),
  resultTotal: document.getElementById('result-total'),
  resultHighscoreMsg: document.getElementById('result-highscore-msg'),
  resultUnlockMsg: document.getElementById('result-unlock-msg'),
  resultMascot: document.getElementById('result-mascot'),
  confettiLayer: document.getElementById('confetti-layer'),
  btnAgain: document.getElementById('btn-again'),
  btnHome: document.getElementById('btn-home'),
};

const state = {
  allCountries: [],
  selectedMode: 'hauptstaedte',
  selectedDifficulty: 'leicht',
  karteSubmodesOpen: false,
  roundMode: 'hauptstaedte',
  roundDifficulty: 'leicht',
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  timeLeft: 0,
  timerHandle: null,
  answered: false,
  mapSvg: null,
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

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shiftDateString(dateStr, deltaDays) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getStreakState() {
  const count = parseInt(localStorage.getItem(STREAK_COUNT_KEY), 10) || 0;
  const lastDate = localStorage.getItem(STREAK_LAST_DATE_KEY);
  return { count, lastDate };
}

function getDisplayStreak() {
  const { count, lastDate } = getStreakState();
  if (!lastDate) return 0;
  const today = todayString();
  const yesterday = shiftDateString(today, -1);
  if (lastDate === today || lastDate === yesterday) return count;
  return 0;
}

function registerPlayedToday() {
  const { count, lastDate } = getStreakState();
  const today = todayString();
  if (lastDate === today) {
    return { count, milestone: null };
  }
  const yesterday = shiftDateString(today, -1);
  const newCount = lastDate === yesterday ? count + 1 : 1;
  localStorage.setItem(STREAK_COUNT_KEY, String(newCount));
  localStorage.setItem(STREAK_LAST_DATE_KEY, today);
  const milestone = STREAK_MILESTONES.includes(newCount) ? newCount : null;
  return { count: newCount, milestone };
}

function pickGreeting() {
  const hour = new Date().getHours();
  const bucket = hour < 11 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  return pickRandom(GREETINGS[bucket]);
}

function getResultTier(accuracy) {
  if (accuracy >= 0.9) return 'excellent';
  if (accuracy >= 0.5) return 'good';
  return 'practice';
}

function setMascotPose(imgEl, pose, animationClass) {
  imgEl.src = MASCOT_SRC[pose];
  ['mascot-float', 'mascot-bounce', 'mascot-sway', 'mascot-pop'].forEach((c) => imgEl.classList.remove(c));
  void imgEl.offsetWidth;
  imgEl.classList.add(animationClass);
}

function launchConfetti(container, count = 24) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.animationDuration = `${1000 + Math.random() * 700}ms`;
    piece.style.animationDelay = `${Math.random() * 250}ms`;
    container.appendChild(piece);
  }
  setTimeout(() => {
    container.innerHTML = '';
  }, 2200);
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, section]) => {
    section.classList.toggle('hidden', key !== name);
  });
}

function renderStartScreen() {
  const isKarteMode = MAP_MODE_IDS.includes(state.selectedMode);

  el.modeButtons.forEach((btn) => {
    const active = btn.dataset.mode === 'karte' ? isKarteMode : btn.dataset.mode === state.selectedMode;
    btn.classList.toggle('selected', active);
  });

  el.karteSubmodes.classList.toggle('hidden', !(state.karteSubmodesOpen || isKarteMode));
  el.karteSubmodeButtons.forEach((btn) => {
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

  renderStreakBadge();
}

function renderStreakBadge() {
  const streak = getDisplayStreak();
  el.streakBadge.classList.toggle('hidden', streak < 1);
  el.streakBadge.textContent = `🔥 ${streak} ${streak === 1 ? 'Tag' : 'Tage'} in Folge!`;
}

function refreshStartMascot() {
  el.startMascot.src = MASCOT_SRC.idle;
  el.startBubble.textContent = pickGreeting();
}

el.modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.mode === 'karte') {
      state.karteSubmodesOpen = !state.karteSubmodesOpen;
      renderStartScreen();
      return;
    }
    state.selectedMode = btn.dataset.mode;
    state.selectedDifficulty = 'leicht';
    state.karteSubmodesOpen = false;
    renderStartScreen();
  });
});

el.karteSubmodeButtons.forEach((btn) => {
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
  refreshStartMascot();
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
  const isMapPrompt = question.promptType === 'map-country' || question.promptType === 'map-city';

  el.questionSubject.classList.toggle('hidden', isImagePrompt);
  el.questionFlag.classList.toggle('hidden', !isImagePrompt);
  el.questionSubject.textContent = question.promptValue;
  if (isImagePrompt) {
    el.questionFlag.src = `assets/flags/${question.promptValue}.svg`;
  }

  el.answersGrid.classList.toggle('hidden', isMapPrompt);
  el.mapContainer.classList.toggle('hidden', !isMapPrompt);
  if (isMapPrompt) {
    clearMapHighlights();
  } else {
    el.answerButtons.forEach((btn, i) => {
      btn.textContent = question.options[i];
      btn.disabled = false;
      btn.classList.remove('correct', 'wrong');
      btn.onclick = () => handleAnswer(i);
    });
  }

  el.quizMascot.src = MASCOT_SRC.idle;
  el.quizMascot.classList.remove('mascot-bounce', 'mascot-sway');
  el.quizMascot.classList.add('mascot-float');
  el.quizBubble.classList.add('hidden');

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
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  if (state.answered) return;
  const question = state.questions[state.currentIndex];
  if (question.promptType === 'map-country' || question.promptType === 'map-city') {
    state.answered = true;
    highlightMapTarget(question, false);
    finishAnswer(false);
  } else {
    handleAnswer(null);
  }
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

  finishAnswer(isCorrect);
}

function finishAnswer(isCorrect) {
  if (isCorrect) {
    state.score += POINTS_PER_CORRECT[state.roundDifficulty];
    state.correctCount += 1;
    el.quizScore.textContent = state.score;
  }

  const reactionPose = isCorrect ? 'happy' : 'comfort';
  const reactionMessage = isCorrect ? pickRandom(CORRECT_MESSAGES) : pickRandom(WRONG_MESSAGES);
  setMascotPose(el.quizMascot, reactionPose, isCorrect ? 'mascot-bounce' : 'mascot-sway');
  el.quizBubble.textContent = reactionMessage;
  el.quizBubble.classList.remove('hidden');

  setTimeout(() => {
    if (state.currentIndex + 1 < state.questions.length) {
      state.currentIndex += 1;
      showQuestion();
    } else {
      endRound();
    }
  }, ANSWER_FEEDBACK_DELAY);
}

function loadMap() {
  return fetch('assets/map/world-map.svg')
    .then((r) => r.text())
    .then((svgText) => {
      el.mapContainer.innerHTML = svgText;
      state.mapSvg = el.mapContainer.querySelector('svg');
      el.mapContainer.addEventListener('click', handleMapClick);
    });
}

function handleMapClick(evt) {
  if (state.answered) return;
  const question = state.questions[state.currentIndex];
  if (!question || (question.promptType !== 'map-country' && question.promptType !== 'map-city')) return;

  const svg = state.mapSvg;
  const ctm = svg.getScreenCTM();
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const point = pt.matrixTransform(ctm.inverse());

  if (question.promptType === 'map-country') {
    resolveMapCountryClick(evt.target, point, evt, ctm, question);
  } else {
    resolveMapCityClick(point, evt, ctm, question);
  }
}

// Screen-space (not SVG-viewBox-space) distance check, so the tap tolerance
// stays a comfortable, consistent size on the finger/mouse regardless of how
// large the map happens to be rendered (small phone card vs. wide tablet).
const MIN_TAP_TOLERANCE_PX = 20;

function withinScreenTolerance(svgX, svgY, evt, ctm, svgTolerance) {
  const targetScreenX = svgX * ctm.a + ctm.e;
  const targetScreenY = svgY * ctm.d + ctm.f;
  const screenDist = Math.hypot(evt.clientX - targetScreenX, evt.clientY - targetScreenY);
  const screenTol = Math.max(MIN_TAP_TOLERANCE_PX, svgTolerance * ctm.a);
  return screenDist <= screenTol;
}

function resolveMapCountryClick(targetEl, point, evt, ctm, question) {
  state.answered = true;
  clearInterval(state.timerHandle);

  const pathEl = targetEl.closest ? targetEl.closest('path[id]') : null;
  const clickedCode = pathEl ? pathEl.id : null;
  let isCorrect = clickedCode === question.targetCode;

  if (!isCorrect) {
    // Tolerance fallback so small countries (e.g. Liechtenstein, South Korea)
    // stay comfortably tappable even when their shape is only a few pixels
    // wide on screen.
    const targetPath = state.mapSvg.getElementById(question.targetCode);
    if (targetPath) {
      const cx = parseFloat(targetPath.dataset.cx);
      const cy = parseFloat(targetPath.dataset.cy);
      const tol = parseFloat(targetPath.dataset.tol);
      if (withinScreenTolerance(cx, cy, evt, ctm, tol)) isCorrect = true;
    }
  }

  highlightMapTarget(question, isCorrect);
  if (!isCorrect) addClickMarker(point);
  finishAnswer(isCorrect);
}

function resolveMapCityClick(point, evt, ctm, question) {
  state.answered = true;
  clearInterval(state.timerHandle);

  const [lat, lon] = question.targetCoords;
  const targetX = (lon + 180) / 360 * MAP_WIDTH;
  const targetY = (90 - lat) / 180 * MAP_HEIGHT;
  const isCorrect = withinScreenTolerance(targetX, targetY, evt, ctm, CITY_CLICK_TOLERANCE);

  highlightMapTarget(question, isCorrect);
  if (!isCorrect) addClickMarker(point);
  finishAnswer(isCorrect);
}

function highlightMapTarget(question, isCorrect) {
  clearMapHighlights();
  const cssClass = isCorrect ? 'map-correct' : 'map-wrong-target';
  if (question.promptType === 'map-country') {
    const targetPath = state.mapSvg.getElementById(question.targetCode);
    if (targetPath) targetPath.classList.add(cssClass);
  } else {
    const [lat, lon] = question.targetCoords;
    const x = (lon + 180) / 360 * MAP_WIDTH;
    const y = (90 - lat) / 180 * MAP_HEIGHT;
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.setAttribute('cx', x);
    marker.setAttribute('cy', y);
    marker.setAttribute('r', 8);
    marker.setAttribute('class', `map-city-marker ${cssClass}`);
    marker.dataset.mapMarker = 'true';
    state.mapSvg.appendChild(marker);
  }
}

function addClickMarker(point) {
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  marker.setAttribute('cx', point.x);
  marker.setAttribute('cy', point.y);
  marker.setAttribute('r', 5);
  marker.setAttribute('class', 'map-click-marker');
  marker.dataset.mapMarker = 'true';
  state.mapSvg.appendChild(marker);
}

function clearMapHighlights() {
  if (!state.mapSvg) return;
  state.mapSvg.querySelectorAll('.map-correct, .map-wrong-target').forEach((node) => {
    node.classList.remove('map-correct', 'map-wrong-target');
  });
  state.mapSvg.querySelectorAll('[data-map-marker]').forEach((node) => node.remove());
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

  const { milestone } = registerPlayedToday();

  renderResult({ isNewHighscore, unlockedNextStage, milestone });
  showScreen('result');
}

const RESULT_TIER_POSE = { excellent: 'excited', good: 'happy', practice: 'comfort' };

function renderResult({ isNewHighscore, unlockedNextStage, milestone }) {
  el.resultModeLabel.textContent = `Modus: ${MODES[state.roundMode].label}`;
  el.resultScore.textContent = state.score;
  el.resultCorrect.textContent = state.correctCount;
  el.resultTotal.textContent = state.questions.length;

  const accuracy = state.correctCount / state.questions.length;
  const tier = getResultTier(accuracy);
  const pose = milestone ? 'excited' : RESULT_TIER_POSE[tier];
  el.resultMascot.src = MASCOT_SRC[pose];
  el.resultMascot.classList.remove('mascot-pop');
  void el.resultMascot.offsetWidth;
  el.resultMascot.classList.add('mascot-pop');

  el.resultTitle.textContent = milestone
    ? `🎉 ${milestone} Tage in Folge! Du bist ein Streak-Champion!`
    : pickRandom(RESULT_MESSAGES[tier]);

  el.resultHighscoreMsg.classList.toggle('hidden', !isNewHighscore);
  el.resultUnlockMsg.classList.toggle('hidden', !unlockedNextStage);
  if (unlockedNextStage) {
    const nextDifficulty = DIFFICULTIES[DIFFICULTIES.indexOf(state.roundDifficulty) + 1];
    el.resultUnlockMsg.textContent = `🔓 Stufe "${DIFFICULTY_LABELS[nextDifficulty]}" freigeschaltet!`;
  }

  if (milestone) {
    launchConfetti(el.confettiLayer);
  }
}

async function init() {
  const response = await fetch('data/countries.json');
  state.allCountries = await response.json();
  renderStartScreen();
  refreshStartMascot();
  loadMap().catch((err) => console.error('Karte konnte nicht geladen werden:', err));
}

init();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.error('Service-Worker-Registrierung fehlgeschlagen:', err);
    });
  });
}
