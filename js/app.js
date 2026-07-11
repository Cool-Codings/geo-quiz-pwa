const DIFFICULTIES = ['leicht', 'mittel', 'schwer'];
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

const ROUNDS_PLAYED_KEY = 'geoquiz-rounds-played';
const LIFETIME_SCORE_KEY = 'geoquiz-lifetime-score';
const BEST_STREAK_KEY = 'geoquiz-best-streak';
const ACTIVE_SKIN_KEY = 'geoquiz-active-skin';

const SKINS = {
  none: { id: 'none', accessory: null, isUnlocked: () => true },
  hat: { id: 'hat', accessory: 'hat', isUnlocked: (stats) => stats.roundsPlayed >= 5 },
  sunglasses: { id: 'sunglasses', accessory: 'sunglasses', isUnlocked: (stats) => stats.bestStreak >= 3 },
  scarf: { id: 'scarf', accessory: 'scarf', isUnlocked: (stats) => stats.lifetimeScore >= 300 },
  crown: { id: 'crown', accessory: 'crown', isUnlocked: (stats) => stats.bestStreak >= 7 },
};
const SKIN_ORDER = ['none', 'hat', 'sunglasses', 'scarf', 'crown'];

const STREAK_MILESTONES = [3, 7, 14, 30];
const STREAK_COUNT_KEY = 'geoquiz-streak-count';
const STREAK_LAST_DATE_KEY = 'geoquiz-streak-last-date';

const CONFETTI_COLORS = ['#FF6B6B', '#FFD93D', '#06D6A0', '#4ECDC4', '#9B5DE5', '#4FC3F7'];

const HEARTS_MAX = 3;
const HEARTS_REGEN_INTERVAL_MS = 30 * 60 * 1000;
const HEARTS_COUNT_KEY = 'geoquiz-hearts-count';
const HEARTS_ANCHOR_KEY = 'geoquiz-hearts-anchor';

const MAP_WIDTH = 960;
const MAP_HEIGHT = 480;
const CITY_CLICK_TOLERANCE = 22;

// Rough lon/lat bounding boxes used to auto-zoom the map to the continent
// that contains the current question's answer.
const CONTINENT_REGIONS = {
  Europa: { lonMin: -11, latMin: 34, lonMax: 45, latMax: 71 },
  Asien: { lonMin: 25, latMin: -11, lonMax: 180, latMax: 78 },
  Afrika: { lonMin: -18, latMin: -35, lonMax: 52, latMax: 38 },
  Nordamerika: { lonMin: -170, latMin: 5, lonMax: -50, latMax: 75 },
  Suedamerika: { lonMin: -82, latMin: -56, lonMax: -34, latMax: 13 },
  Ozeanien: { lonMin: 110, latMin: -48, lonMax: 180, latMax: 0 },
};
const MAP_ZOOM_PADDING = 0.18;
const MAP_MIN_ZOOM_WIDTH = 60;
const MAP_ZOOM_STEP = 1.5;
const MAP_TAP_THRESHOLD_PX = 10;
const MAP_ZOOM_ANIM_MS = 380;

function questionFromField(entry, pool, { promptLabel, promptValue, answerField, promptType }) {
  const correctValue = localizedField(entry, answerField);
  const distractorPool = pool.filter((c) => localizedField(c, answerField) !== correctValue);
  const distractors = shuffle(distractorPool).slice(0, 3).map((c) => localizedField(c, answerField));
  const options = shuffle([correctValue, ...distractors]);
  return {
    promptLabel,
    promptValue,
    promptType: promptType || 'text',
    options,
    correctIndex: options.indexOf(correctValue),
  };
}

function modeLabel(modeId) {
  return t(`mode.${modeId}`);
}

// City names for the Städte mode's `cities` lists are stored once, in
// German, per country. Most are proper nouns that read the same in
// English/Italian; this dictionary covers the notable exceptions so the
// distractor options stay in the active language without needing a full
// parallel city list per country.
const CITY_NAME_TRANSLATIONS = {
  'München': { en: 'Munich', it: 'Monaco di Baviera' },
  'Köln': { en: 'Cologne', it: 'Colonia' },
  'Neapel': { en: 'Naples', it: 'Napoli' },
  'Mailand': { en: 'Milan', it: 'Milano' },
  'Genua': { en: 'Genoa', it: 'Genova' },
  'Venedig': { en: 'Venice', it: 'Venezia' },
  'Florenz': { en: 'Florence', it: 'Firenze' },
  'Sevilla': { en: 'Seville', it: 'Siviglia' },
  'Zaragoza': { en: 'Saragossa', it: 'Saragozza' },
  'Warschau': { en: 'Warsaw', it: 'Varsavia' },
  'Krakau': { en: 'Krakow', it: 'Cracovia' },
  'Breslau': { en: 'Wrocław', it: 'Breslavia' },
  'Posen': { en: 'Poznań', it: 'Poznań' },
  'Prag': { en: 'Prague', it: 'Praga' },
  'Brünn': { en: 'Brno', it: 'Brno' },
  'Wien': { en: 'Vienna', it: 'Vienna' },
  'Genf': { en: 'Geneva', it: 'Ginevra' },
  'Athen': { en: 'Athens', it: 'Atene' },
  'Thessaloniki': { en: 'Thessaloniki', it: 'Salonicco' },
  'Den Haag': { en: 'The Hague', it: "L'Aia" },
  'Sankt Petersburg': { en: 'Saint Petersburg', it: 'San Pietroburgo' },
  'Moskau': { en: 'Moscow', it: 'Mosca' },
  'Jekaterinburg': { en: 'Yekaterinburg', it: 'Ekaterinburg' },
  'Peking': { en: 'Beijing', it: 'Pechino' },
  'Kairo': { en: 'Cairo', it: 'Il Cairo' },
  'Alexandria': { en: 'Alexandria', it: "Alessandria d'Egitto" },
  'Gizeh': { en: 'Giza', it: 'Giza' },
  'Assuan': { en: 'Aswan', it: 'Assuan' },
  'Izmir': { en: 'Izmir', it: 'Smirne' },
  'Rom': { en: 'Rome', it: 'Roma' },
  'London': { en: 'London', it: 'Londra' },
  'Tokio': { en: 'Tokyo', it: 'Tokyo' },
  'Mexiko-Stadt': { en: 'Mexico City', it: 'Città del Messico' },
  'Lissabon': { en: 'Lisbon', it: 'Lisbona' },
  'Brüssel': { en: 'Brussels', it: 'Bruxelles' },
  'Ho-Chi-Minh-Stadt': { en: 'Ho Chi Minh City', it: 'Ho Chi Minh' },
  'Zürich': { en: 'Zurich', it: 'Zurigo' },
  'Jerewan': { en: 'Yerevan', it: 'Yerevan' },
  'Tiflis': { en: 'Tbilisi', it: 'Tbilisi' },
  'Tripolis': { en: 'Tripoli', it: 'Tripoli' },
  'Aşgabat': { en: 'Ashgabat', it: 'Ashgabat' },
  'Duschanbe': { en: 'Dushanbe', it: 'Dushanbe' },
};

function localizeCityName(name) {
  if (state.lang === DEFAULT_LANG) return name;
  const translation = CITY_NAME_TRANSLATIONS[name];
  return (translation && translation[state.lang]) || name;
}

const MODES = {
  hauptstaedte: {
    id: 'hauptstaedte',
    highscoreKey: 'geoquiz-highscore-hauptstaedte',
    unlockedKey: 'geoquiz-unlocked-difficulty-hauptstaedte',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty);
    },
    buildQuestion(entry, pool) {
      return questionFromField(entry, pool, {
        promptLabel: 'q.capitalOf',
        promptValue: localizedField(entry, 'country'),
        answerField: 'capital',
      });
    },
  },
  laender: {
    id: 'laender',
    highscoreKey: 'geoquiz-highscore-laender',
    unlockedKey: 'geoquiz-unlocked-difficulty-laender',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty);
    },
    buildQuestion(entry, pool) {
      if (Math.random() < 0.5) {
        return questionFromField(entry, pool, {
          promptLabel: 'q.capitalOf',
          promptValue: localizedField(entry, 'country'),
          answerField: 'capital',
        });
      }
      return questionFromField(entry, pool, {
        promptLabel: 'q.countryOfCapital',
        promptValue: localizedField(entry, 'capital'),
        answerField: 'country',
      });
    },
  },
  staedte: {
    id: 'staedte',
    highscoreKey: 'geoquiz-highscore-staedte',
    unlockedKey: 'geoquiz-unlocked-difficulty-staedte',
    getPool(countries, difficulty) {
      // Needs at least 4 known cities (the real largest city + 3
      // same-country distractors) - countries without enough well-known
      // cities are simply not asked about in this mode.
      return countries.filter((c) => c.difficulty === difficulty && c.cities && c.cities.length >= 4);
    },
    buildQuestion(entry) {
      const correctValue = localizeCityName(entry.largestCity);
      const distractorPool = entry.cities.filter((city) => city !== entry.largestCity);
      const distractors = shuffle(distractorPool).slice(0, 3).map(localizeCityName);
      const options = shuffle([correctValue, ...distractors]);
      return {
        promptLabel: 'q.largestCityOf',
        promptValue: localizedField(entry, 'country'),
        promptType: 'text',
        options,
        correctIndex: options.indexOf(correctValue),
      };
    },
  },
  fluesse: {
    id: 'fluesse',
    highscoreKey: 'geoquiz-highscore-fluesse',
    unlockedKey: 'geoquiz-unlocked-difficulty-fluesse',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty && c.river);
    },
    buildQuestion(entry, pool) {
      return questionFromField(entry, pool, {
        promptLabel: 'q.riverCountry',
        promptValue: localizedField(entry, 'river'),
        answerField: 'country',
      });
    },
  },
  flaggen: {
    id: 'flaggen',
    highscoreKey: 'geoquiz-highscore-flaggen',
    unlockedKey: 'geoquiz-unlocked-difficulty-flaggen',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty && c.code);
    },
    buildQuestion(entry, pool) {
      return questionFromField(entry, pool, {
        promptLabel: 'q.flagCountry',
        promptValue: entry.code,
        answerField: 'country',
        promptType: 'image',
      });
    },
  },
  umriss: {
    id: 'umriss',
    highscoreKey: 'geoquiz-highscore-umriss',
    unlockedKey: 'geoquiz-unlocked-difficulty-umriss',
    getPool(countries, difficulty) {
      // Reuses the interactive map's country paths, so only countries with a
      // usable, precise shape on that map (mapEligible) can be shown here.
      return countries.filter((c) => c.difficulty === difficulty && c.code && c.mapEligible);
    },
    buildQuestion(entry, pool) {
      const question = questionFromField(entry, pool, {
        promptLabel: 'q.outlineCountry',
        promptValue: localizedField(entry, 'country'),
        answerField: 'country',
        promptType: 'outline',
      });
      question.targetCode = entry.code;
      return question;
    },
  },
  nachbarn: {
    id: 'nachbarn',
    highscoreKey: 'geoquiz-highscore-nachbarn',
    unlockedKey: 'geoquiz-unlocked-difficulty-nachbarn',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty && c.neighbors && c.neighbors.length > 0);
    },
    buildQuestion(entry) {
      // The correct answer (a real neighbor) can be a different difficulty
      // than the asked country, so it's looked up in the full country list
      // rather than the (same-difficulty) `pool` used for distractors.
      const neighborCode = pickRandom(entry.neighbors);
      const neighborCountry = state.allCountries.find((c) => c.code === neighborCode);
      const correctValue = localizedField(neighborCountry, 'country');

      // Exclude every real neighbor of `entry` (not just the chosen one) from
      // the distractor pool, so no other option could also be a correct answer.
      const excluded = new Set([entry.code, ...entry.neighbors]);
      const distractorPool = state.allCountries.filter(
        (c) => c.difficulty === entry.difficulty && !excluded.has(c.code)
      );
      const distractors = shuffle(distractorPool).slice(0, 3).map((c) => localizedField(c, 'country'));
      const options = shuffle([correctValue, ...distractors]);
      return {
        promptLabel: 'q.neighborOf',
        promptValue: localizedField(entry, 'country'),
        promptType: 'text',
        options,
        correctIndex: options.indexOf(correctValue),
      };
    },
  },
  kontinente: {
    id: 'kontinente',
    highscoreKey: 'geoquiz-highscore-kontinente',
    unlockedKey: 'geoquiz-unlocked-difficulty-kontinente',
    getPool(countries, difficulty) {
      return countries.filter((c) => c.difficulty === difficulty && c.continent);
    },
    // Not used by the generic buildQuestions() path - the drag & drop round
    // (startKontinenteRound/showKontinenteQuestion) drives itself directly
    // off getPool()'s result instead of a prebuilt multiple-choice question.
    buildQuestion(entry) {
      return entry;
    },
  },
  'karte-laender': {
    id: 'karte-laender',
    highscoreKey: 'geoquiz-highscore-karte-laender',
    unlockedKey: 'geoquiz-unlocked-difficulty-karte-laender',
    getPool(countries, difficulty) {
      // Micro-states are excluded here: even zoomed to their continent they
      // stay too small to tap precisely (see mapEligible in countries.json).
      return countries.filter((c) => c.difficulty === difficulty && c.code && c.mapEligible);
    },
    buildQuestion(entry) {
      return {
        promptLabel: 'q.whereIsCountry',
        promptValue: localizedField(entry, 'country'),
        promptType: 'map-country',
        targetCode: entry.code,
        targetContinent: entry.continent,
      };
    },
  },
  'karte-staedte': {
    id: 'karte-staedte',
    highscoreKey: 'geoquiz-highscore-karte-staedte',
    unlockedKey: 'geoquiz-unlocked-difficulty-karte-staedte',
    getPool(countries, difficulty) {
      const cities = [];
      countries
        .filter((c) => c.difficulty === difficulty && c.capitalCoords && c.mapEligible)
        .forEach((c) => {
          cities.push({ name: localizedField(c, 'capital'), coords: c.capitalCoords, continent: c.continent });
          if (c.largestCity !== c.capital && c.largestCityCoords) {
            cities.push({ name: localizedField(c, 'largestCity'), coords: c.largestCityCoords, continent: c.continent });
          }
        });
      return cities;
    },
    buildQuestion(entry) {
      return {
        promptLabel: 'q.whereIsCity',
        promptValue: entry.name,
        promptType: 'map-city',
        targetCoords: entry.coords,
        targetContinent: entry.continent,
      };
    },
  },
};

const MAP_MODE_IDS = ['karte-laender', 'karte-staedte'];

const screens = {
  start: document.getElementById('screen-start'),
  quiz: document.getElementById('screen-quiz'),
  result: document.getElementById('screen-result'),
  duelSetup: document.getElementById('screen-duel-setup'),
  duelHandoff: document.getElementById('screen-duel-handoff'),
  duelResult: document.getElementById('screen-duel-result'),
  puzzle: document.getElementById('screen-puzzle'),
  puzzleResult: document.getElementById('screen-puzzle-result'),
};

const el = {
  passwordOverlay: document.getElementById('password-overlay'),
  passwordInput: document.getElementById('password-input'),
  passwordError: document.getElementById('password-error'),
  passwordRemember: document.getElementById('password-remember'),
  btnPasswordSubmit: document.getElementById('btn-password-submit'),

  settingsOverlay: document.getElementById('settings-overlay'),
  btnSettingsOpen: document.getElementById('btn-settings-open'),
  btnSettingsDone: document.getElementById('btn-settings-done'),
  settingsLangButtons: Array.from(document.querySelectorAll('.settings-lang-btn')),

  modeButtons: Array.from(document.querySelectorAll('#mode-list .mode-btn')),
  karteSubmodes: document.getElementById('karte-submodes'),
  karteSubmodeButtons: Array.from(document.querySelectorAll('.karte-submode-btn')),
  startModeLabel: document.getElementById('start-mode-label'),
  startHighscore: document.getElementById('start-highscore'),
  difficultyButtons: Array.from(document.querySelectorAll('#difficulty-list .difficulty-btn')),
  btnStart: document.getElementById('btn-start'),
  startMascot: document.getElementById('start-mascot'),
  startMascotAccessory: document.getElementById('start-mascot-accessory'),
  startBubble: document.getElementById('start-bubble'),
  streakBadge: document.getElementById('streak-badge'),
  startHeartIcons: Array.from(document.querySelectorAll('#start-hearts .heart-icon')),
  heartsRegenHint: document.getElementById('hearts-regen-hint'),
  skinCollection: document.getElementById('skin-collection'),

  quizProgress: document.getElementById('quiz-progress'),
  quizScore: document.getElementById('quiz-score'),
  quizHeartsRow: document.getElementById('quiz-hearts'),
  quizHeartIcons: Array.from(document.querySelectorAll('#quiz-hearts .heart-icon')),
  timerBar: document.getElementById('timer-bar'),
  timerNumber: document.getElementById('timer-number'),
  questionLabel: document.getElementById('question-label'),
  questionSubject: document.getElementById('question-subject'),
  questionFlag: document.getElementById('question-flag'),
  answerButtons: Array.from(document.querySelectorAll('.answer-btn')),
  answersGrid: document.getElementById('answers-grid'),
  mapWrap: document.getElementById('map-wrap'),
  mapContainer: document.getElementById('map-container'),
  mapZoomIn: document.getElementById('map-zoom-in'),
  mapZoomOut: document.getElementById('map-zoom-out'),
  timerWrap: document.getElementById('timer-wrap'),
  kontinenteWrap: document.getElementById('kontinente-wrap'),
  kontinenteChipStage: document.getElementById('kontinente-chip-stage'),
  kontinenteChip: document.getElementById('kontinente-chip'),
  kontinenteZones: Array.from(document.querySelectorAll('#kontinente-zones .kontinente-zone')),
  quizMascot: document.getElementById('quiz-mascot'),
  quizMascotAccessory: document.getElementById('quiz-mascot-accessory'),
  quizBubble: document.getElementById('quiz-bubble'),

  resultTitle: document.getElementById('result-title'),
  resultModeLabel: document.getElementById('result-mode-label'),
  resultScore: document.getElementById('result-score'),
  resultCorrectLine: document.getElementById('result-correct-line'),
  resultHighscoreMsg: document.getElementById('result-highscore-msg'),
  resultUnlockMsg: document.getElementById('result-unlock-msg'),
  resultSkinMsg: document.getElementById('result-skin-msg'),
  resultMascot: document.getElementById('result-mascot'),
  resultMascotAccessory: document.getElementById('result-mascot-accessory'),
  confettiLayer: document.getElementById('confetti-layer'),
  btnAgain: document.getElementById('btn-again'),
  btnHome: document.getElementById('btn-home'),

  duelPlayer1Input: document.getElementById('duel-player1-name'),
  duelPlayer2Input: document.getElementById('duel-player2-name'),
  duelModeButtons: Array.from(document.querySelectorAll('#duel-mode-list .mode-btn')),
  duelDifficultyButtons: Array.from(document.querySelectorAll('#duel-difficulty-list .difficulty-btn')),
  btnDuelStart: document.getElementById('btn-duel-start'),
  btnDuelSetupBack: document.getElementById('btn-duel-setup-back'),

  duelHandoffText: document.getElementById('duel-handoff-text'),
  duelHandoffMascot: document.getElementById('duel-handoff-mascot'),
  btnDuelHandoffContinue: document.getElementById('btn-duel-handoff-continue'),

  duelWinnerText: document.getElementById('duel-winner-text'),
  duelSubMessage: document.getElementById('duel-sub-message'),
  duelCard1: document.getElementById('duel-card-1'),
  duelCard2: document.getElementById('duel-card-2'),
  duelName1: document.getElementById('duel-name-1'),
  duelName2: document.getElementById('duel-name-2'),
  duelScore1: document.getElementById('duel-score-1'),
  duelScore2: document.getElementById('duel-score-2'),
  duelCorrect1: document.getElementById('duel-correct-1'),
  duelCorrect2: document.getElementById('duel-correct-2'),
  duelResultMascot: document.getElementById('duel-result-mascot'),
  duelResultMascotAccessory: document.getElementById('duel-result-mascot-accessory'),
  duelConfettiLayer: document.getElementById('duel-confetti-layer'),
  btnDuelAgain: document.getElementById('btn-duel-again'),
  btnDuelHome: document.getElementById('btn-duel-home'),

  puzzleMascot: document.getElementById('puzzle-mascot'),
  puzzleTimer: document.getElementById('puzzle-timer'),
  puzzleBesttimeLabel: document.getElementById('puzzle-besttime-label'),
  puzzleBesttime: document.getElementById('puzzle-besttime'),
  puzzleBoard: document.getElementById('puzzle-board'),
  puzzleZones: document.getElementById('puzzle-zones'),
  puzzlePieces: document.getElementById('puzzle-pieces'),
  btnPuzzleHome: document.getElementById('btn-puzzle-home'),
  puzzleResultMascot: document.getElementById('puzzle-result-mascot'),
  puzzleResultMascotAccessory: document.getElementById('puzzle-result-mascot-accessory'),
  puzzleConfettiLayer: document.getElementById('puzzle-confetti-layer'),
  puzzleResultTime: document.getElementById('puzzle-result-time'),
  puzzleResultBest: document.getElementById('puzzle-result-best'),
  btnPuzzleAgain: document.getElementById('btn-puzzle-again'),
  btnPuzzleHome2: document.getElementById('btn-puzzle-home2'),
};

const state = {
  lang: loadStoredLang(),
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
  mapView: { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT },
  mapBaseView: { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT },
  mapAnimHandle: null,
  isDuel: false,
  duelSetup: {
    mode: 'hauptstaedte',
    difficulty: 'leicht',
  },
  duel: null,
  kontinente: null,
  puzzle: null,
};

// Transient multi-touch gesture bookkeeping for the map (pan + pinch-zoom).
// Kept separate from `state` since it's pointer-tracking scratch data, not
// app state that needs to persist or be inspected elsewhere.
const mapGesture = {
  pointers: new Map(),
  mode: 'idle',
  panLast: null,
  dragDistance: 0,
  pinchStartDist: null,
  pinchStartView: null,
  pinchMidSvg: null,
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

// --- Sprachauswahl (i18n) ---

function loadStoredLang() {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  return SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  state.lang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  applyStaticTranslations();
  renderStartScreen();
  refreshStartMascot();
}

function applyStaticTranslations() {
  document.documentElement.lang = state.lang;
  document.title = t('ui.appTitle');
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => {
    node.setAttribute('aria-label', t(node.dataset.i18nAria));
  });
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

// Hearts are a global, persistent resource (not reset per round) that slowly
// regenerate in real time, entirely client-side, so it also works offline.
function getHeartsState() {
  let count = parseInt(localStorage.getItem(HEARTS_COUNT_KEY), 10);
  if (Number.isNaN(count)) count = HEARTS_MAX;
  let anchor = parseInt(localStorage.getItem(HEARTS_ANCHOR_KEY), 10);

  if (count < HEARTS_MAX && !Number.isNaN(anchor)) {
    const regenerated = Math.floor((Date.now() - anchor) / HEARTS_REGEN_INTERVAL_MS);
    if (regenerated > 0) {
      count = Math.min(HEARTS_MAX, count + regenerated);
      localStorage.setItem(HEARTS_COUNT_KEY, String(count));
      if (count >= HEARTS_MAX) {
        localStorage.removeItem(HEARTS_ANCHOR_KEY);
        anchor = NaN;
      } else {
        anchor += regenerated * HEARTS_REGEN_INTERVAL_MS;
        localStorage.setItem(HEARTS_ANCHOR_KEY, String(anchor));
      }
    }
  }

  const msUntilNext = count < HEARTS_MAX && !Number.isNaN(anchor)
    ? Math.max(0, HEARTS_REGEN_INTERVAL_MS - (Date.now() - anchor))
    : null;
  return { count, msUntilNext };
}

function loseHeart() {
  const { count } = getHeartsState();
  if (count <= 0) return 0;
  const newCount = count - 1;
  localStorage.setItem(HEARTS_COUNT_KEY, String(newCount));
  if (count === HEARTS_MAX) {
    localStorage.setItem(HEARTS_ANCHOR_KEY, String(Date.now()));
  }
  return newCount;
}

function paintHearts(icons, count) {
  icons.forEach((icon, i) => icon.classList.toggle('lost', i >= count));
}

function renderHearts() {
  const { count, msUntilNext } = getHeartsState();
  paintHearts(el.quizHeartIcons, count);
  paintHearts(el.startHeartIcons, count);
  const showHint = count < HEARTS_MAX && msUntilNext != null;
  el.heartsRegenHint.classList.toggle('hidden', !showHint);
  if (showHint) {
    const minutes = Math.max(1, Math.ceil(msUntilNext / 60000));
    el.heartsRegenHint.textContent = t('ui.heartsRegenHint', { min: minutes });
  }
  return count;
}

function getLifetimeStats() {
  return {
    roundsPlayed: parseInt(localStorage.getItem(ROUNDS_PLAYED_KEY), 10) || 0,
    lifetimeScore: parseInt(localStorage.getItem(LIFETIME_SCORE_KEY), 10) || 0,
    bestStreak: parseInt(localStorage.getItem(BEST_STREAK_KEY), 10) || 0,
  };
}

function recordRoundStats(scoreEarned, currentStreakCount) {
  const stats = getLifetimeStats();
  const roundsPlayed = stats.roundsPlayed + 1;
  const lifetimeScore = stats.lifetimeScore + scoreEarned;
  const bestStreak = Math.max(stats.bestStreak, currentStreakCount);
  localStorage.setItem(ROUNDS_PLAYED_KEY, String(roundsPlayed));
  localStorage.setItem(LIFETIME_SCORE_KEY, String(lifetimeScore));
  localStorage.setItem(BEST_STREAK_KEY, String(bestStreak));
  return { roundsPlayed, lifetimeScore, bestStreak };
}

function getUnlockedSkinIds() {
  const stats = getLifetimeStats();
  return SKIN_ORDER.filter((id) => SKINS[id].isUnlocked(stats));
}

function getActiveSkin() {
  const stored = localStorage.getItem(ACTIVE_SKIN_KEY);
  return stored && getUnlockedSkinIds().includes(stored) ? stored : 'none';
}

function setActiveSkin(skinId) {
  localStorage.setItem(ACTIVE_SKIN_KEY, skinId);
}

function applySkinToMascot(accessoryEl) {
  const skin = SKINS[getActiveSkin()];
  if (skin.accessory) {
    accessoryEl.src = `assets/mascot/accessories/${skin.accessory}.svg`;
    accessoryEl.classList.remove('hidden');
  } else {
    accessoryEl.classList.add('hidden');
  }
}

function renderSkinCollection() {
  const stats = getLifetimeStats();
  const activeSkin = getActiveSkin();
  el.skinCollection.innerHTML = '';

  SKIN_ORDER.forEach((id) => {
    const skin = SKINS[id];
    const unlocked = skin.isUnlocked(stats);

    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = ['skin-tile', unlocked ? '' : 'locked', activeSkin === id ? 'selected' : '']
      .filter(Boolean)
      .join(' ');
    tile.dataset.skin = id;

    const thumb = document.createElement('div');
    thumb.className = 'skin-thumb';
    const base = document.createElement('img');
    base.src = MASCOT_SRC.idle;
    base.alt = '';
    thumb.appendChild(base);
    if (skin.accessory) {
      const accessoryImg = document.createElement('img');
      accessoryImg.src = `assets/mascot/accessories/${skin.accessory}.svg`;
      accessoryImg.alt = '';
      thumb.appendChild(accessoryImg);
    }
    if (!unlocked) {
      const lock = document.createElement('span');
      lock.className = 'skin-lock';
      lock.textContent = '🔒';
      thumb.appendChild(lock);
    }
    tile.appendChild(thumb);

    const name = document.createElement('span');
    name.className = 'skin-name';
    name.textContent = t(`skin.${id}.label`);
    tile.appendChild(name);

    if (!unlocked) {
      const hint = document.createElement('span');
      hint.className = 'skin-hint';
      hint.textContent = t(`skin.${id}.hint`);
      tile.appendChild(hint);
    }

    tile.addEventListener('click', () => {
      if (!unlocked) return;
      setActiveSkin(id);
      applySkinToMascot(el.startMascotAccessory);
      renderSkinCollection();
    });

    el.skinCollection.appendChild(tile);
  });
}

function pickGreeting() {
  const hour = new Date().getHours();
  const bucket = hour < 11 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  return pickRandom(tList(`messages.greetings.${bucket}`));
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

  el.startModeLabel.textContent = modeLabel(state.selectedMode);
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
  renderHearts();
  renderSkinCollection();
}

function renderStreakBadge() {
  const streak = getDisplayStreak();
  el.streakBadge.classList.toggle('hidden', streak < 1);
  const day = t(streak === 1 ? 'ui.daySingular' : 'ui.dayPlural');
  el.streakBadge.textContent = t('ui.streakBadge', { n: streak, day });
}

function refreshStartMascot() {
  el.startMascot.src = MASCOT_SRC.idle;
  el.startBubble.textContent = pickGreeting();
  applySkinToMascot(el.startMascotAccessory);
}

// --- Einstellungen (Sprache) ---

function renderSettingsModal() {
  el.settingsLangButtons.forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.lang === state.lang);
  });
}

el.btnSettingsOpen.addEventListener('click', () => {
  renderSettingsModal();
  el.settingsOverlay.classList.remove('hidden');
});

el.btnSettingsDone.addEventListener('click', () => {
  el.settingsOverlay.classList.add('hidden');
});

el.settingsLangButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    setLanguage(btn.dataset.lang);
    renderSettingsModal();
  });
});

// --- Passwortschutz ---
// Not real security (there is no server) - just a lightweight, lightly
// obfuscated gate so casual visitors can't stumble into the app, matching
// the same pattern used by the sibling Tetris PWA.

const PASSWORD_AUTH_KEY = 'geoquiz-auth-ok';
const PW_CHAR_CODES = [103, 101, 111, 113, 117, 105, 122, 50, 48, 50, 54];

function getAppPassword() {
  return String.fromCharCode(...PW_CHAR_CODES);
}

function checkPasswordGate() {
  if (localStorage.getItem(PASSWORD_AUTH_KEY) === 'true') return;
  el.passwordOverlay.classList.remove('hidden');
  el.passwordInput.focus();
}

function submitPassword() {
  if (el.passwordInput.value === getAppPassword()) {
    if (el.passwordRemember.checked) {
      localStorage.setItem(PASSWORD_AUTH_KEY, 'true');
    }
    el.passwordError.classList.add('hidden');
    el.passwordInput.value = '';
    el.passwordOverlay.classList.add('hidden');
  } else {
    el.passwordError.textContent = t('password.wrong');
    el.passwordError.classList.remove('hidden');
    el.passwordInput.value = '';
    el.passwordInput.focus();
  }
}

el.btnPasswordSubmit.addEventListener('click', submitPassword);
el.passwordInput.addEventListener('keydown', (evt) => {
  if (evt.key === 'Enter') submitPassword();
});

el.modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.mode === 'karte') {
      state.karteSubmodesOpen = !state.karteSubmodesOpen;
      // Clicking the parent "Karte" tile alone (without also tapping a
      // submode button) must still leave a valid, playable map mode
      // selected - otherwise "Spiel starten" silently starts whatever
      // non-map mode was selected before, which looks like the map mode
      // never starts at all.
      if (!MAP_MODE_IDS.includes(state.selectedMode)) {
        state.selectedMode = 'karte-laender';
        state.selectedDifficulty = 'leicht';
      }
      renderStartScreen();
      return;
    }
    if (btn.dataset.mode === 'duell') {
      showDuelSetup();
      return;
    }
    if (btn.dataset.mode === 'puzzle') {
      startPuzzle();
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

el.btnStart.addEventListener('click', () => {
  if (state.selectedMode === 'kontinente') {
    startKontinenteRound(state.selectedDifficulty);
  } else {
    startRound(state.selectedMode, state.selectedDifficulty);
  }
});
el.btnAgain.addEventListener('click', () => {
  if (state.roundMode === 'kontinente') {
    startKontinenteRound(state.roundDifficulty);
  } else {
    startRound(state.roundMode, state.roundDifficulty);
  }
});
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
  state.isDuel = false;
  state.roundMode = modeId;
  state.roundDifficulty = difficulty;
  state.questions = buildQuestions(modeId, difficulty);
  state.currentIndex = 0;
  state.score = 0;
  state.correctCount = 0;

  showScreen('quiz');
  showQuestion();
}

// --- Kontinente-Zuordnung (Drag & Drop) ---
// Reuses the #screen-quiz shell (progress/score header, mascot row) but
// swaps in its own drag & drop panel instead of the answers-grid/map-wrap,
// and drives its own round loop (no timer, unlimited retries per country).
// On completion it feeds its results into the normal endRound()/result
// screen so highscore, unlock progress, streak and skins all work exactly
// like every other mode.

const kontinenteDrag = { active: false, pointerId: null, offsetX: 0, offsetY: 0 };

function startKontinenteRound(difficulty) {
  state.isDuel = false;
  const pool = MODES.kontinente.getPool(state.allCountries, difficulty);
  state.kontinente = {
    pool: shuffle(pool).slice(0, Math.min(QUESTIONS_PER_ROUND, pool.length)),
    currentIndex: 0,
    score: 0,
    cleanCount: 0,
    firstAttempt: true,
    difficulty,
  };
  showScreen('quiz');
  showKontinenteQuestion();
}

function showKontinenteQuestion() {
  const k = state.kontinente;
  const entry = k.pool[k.currentIndex];
  k.firstAttempt = true;

  el.quizProgress.textContent = t('ui.progressQuiz', { mode: modeLabel('kontinente'), n: k.currentIndex + 1, total: k.pool.length });
  el.quizScore.textContent = k.score;
  el.quizHeartsRow.classList.add('hidden');
  el.timerWrap.classList.add('hidden');
  el.timerNumber.classList.add('hidden');

  el.questionLabel.textContent = t('q.dragContinent');
  el.questionSubject.classList.add('hidden');
  el.questionFlag.classList.add('hidden');
  el.answersGrid.classList.add('hidden');
  el.mapWrap.classList.add('hidden');
  el.kontinenteWrap.classList.remove('hidden');

  el.kontinenteZones.forEach((zone) => zone.classList.remove('zone-correct', 'zone-wrong'));
  el.kontinenteChip.textContent = localizedField(entry, 'country');
  el.kontinenteChip.classList.remove('chip-shake');
  resetKontinenteChipPosition();

  el.quizMascot.src = MASCOT_SRC.idle;
  el.quizMascot.classList.remove('mascot-bounce', 'mascot-sway');
  el.quizMascot.classList.add('mascot-float');
  el.quizBubble.classList.add('hidden');
  applySkinToMascot(el.quizMascotAccessory);
}

function resetKontinenteChipPosition() {
  const chip = el.kontinenteChip;
  chip.style.position = '';
  chip.style.left = '';
  chip.style.top = '';
  chip.style.width = '';
  chip.style.zIndex = '';
}

function kontinentePointerDown(evt) {
  if (kontinenteDrag.active) return;
  const chip = el.kontinenteChip;
  chip.setPointerCapture(evt.pointerId);
  const rect = chip.getBoundingClientRect();
  kontinenteDrag.active = true;
  kontinenteDrag.pointerId = evt.pointerId;
  kontinenteDrag.offsetX = evt.clientX - rect.left;
  kontinenteDrag.offsetY = evt.clientY - rect.top;
  chip.style.position = 'fixed';
  chip.style.left = `${rect.left}px`;
  chip.style.top = `${rect.top}px`;
  chip.style.width = `${rect.width}px`;
  chip.style.zIndex = '50';
  chip.classList.add('dragging');
}

function kontinentePointerMove(evt) {
  if (!kontinenteDrag.active || evt.pointerId !== kontinenteDrag.pointerId) return;
  el.kontinenteChip.style.left = `${evt.clientX - kontinenteDrag.offsetX}px`;
  el.kontinenteChip.style.top = `${evt.clientY - kontinenteDrag.offsetY}px`;
}

function kontinentePointerUp(evt) {
  if (!kontinenteDrag.active || evt.pointerId !== kontinenteDrag.pointerId) return;
  kontinenteDrag.active = false;
  const chip = el.kontinenteChip;
  chip.classList.remove('dragging');

  const rect = chip.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  // Hide the chip from hit-testing for a moment - it's fixed-positioned
  // directly on top of the drop point, so elementFromPoint would otherwise
  // just find the chip itself instead of the zone underneath it.
  chip.style.pointerEvents = 'none';
  const dropTarget = document.elementFromPoint(centerX, centerY);
  chip.style.pointerEvents = '';
  const zoneEl = dropTarget ? dropTarget.closest('.kontinente-zone') : null;

  resetKontinenteChipPosition();
  handleKontinenteDrop(zoneEl ? zoneEl.dataset.continent : null, zoneEl);
}

el.kontinenteChip.addEventListener('pointerdown', kontinentePointerDown);
el.kontinenteChip.addEventListener('pointermove', kontinentePointerMove);
el.kontinenteChip.addEventListener('pointerup', kontinentePointerUp);
el.kontinenteChip.addEventListener('pointercancel', kontinentePointerUp);

function handleKontinenteDrop(continent, zoneEl) {
  const k = state.kontinente;
  const entry = k.pool[k.currentIndex];
  const isCorrect = continent === entry.continent;

  if (isCorrect) {
    const points = k.firstAttempt
      ? POINTS_PER_CORRECT[k.difficulty]
      : Math.round(POINTS_PER_CORRECT[k.difficulty] * 0.6);
    k.score += points;
    if (k.firstAttempt) k.cleanCount += 1;
    el.quizScore.textContent = k.score;
    if (zoneEl) zoneEl.classList.add('zone-correct');
    setMascotPose(el.quizMascot, 'happy', 'mascot-bounce');
    el.quizBubble.textContent = pickRandom(tList('messages.correct'));
    el.quizBubble.classList.remove('hidden');

    setTimeout(() => {
      if (zoneEl) zoneEl.classList.remove('zone-correct');
      if (k.currentIndex + 1 < k.pool.length) {
        k.currentIndex += 1;
        showKontinenteQuestion();
      } else {
        finishKontinenteRound();
      }
    }, ANSWER_FEEDBACK_DELAY);
  } else {
    k.firstAttempt = false;
    el.kontinenteChip.classList.add('chip-shake');
    setTimeout(() => el.kontinenteChip.classList.remove('chip-shake'), 420);
    if (zoneEl) {
      zoneEl.classList.add('zone-wrong');
      setTimeout(() => zoneEl.classList.remove('zone-wrong'), 420);
    }
    setMascotPose(el.quizMascot, 'comfort', 'mascot-sway');
    el.quizBubble.textContent = `${pickRandom(tList('messages.wrong'))} ${t('kontinente.tryAgain')}`;
    el.quizBubble.classList.remove('hidden');
  }
}

function finishKontinenteRound() {
  const k = state.kontinente;
  el.timerWrap.classList.remove('hidden');
  el.timerNumber.classList.remove('hidden');
  state.roundMode = 'kontinente';
  state.roundDifficulty = k.difficulty;
  state.questions = k.pool;
  state.currentIndex = k.pool.length - 1;
  state.score = k.score;
  state.correctCount = k.cleanCount;
  endRound({});
}

// --- Puzzle-Modus (Kontinente-Weltkarte) ---
// A relaxed, explorative mode with no scoring: 6 simplified, proportionally
// placed continent pieces are dragged onto a matching blank board. No
// difficulty tiers (there's only one puzzle), no wrong-answer penalty -
// just a stopwatch and a personal best time in localStorage.

const SVG_NS = 'http://www.w3.org/2000/svg';
const PUZZLE_BESTTIME_KEY = 'geoquiz-puzzle-besttime';
const PUZZLE_SNAP_TOLERANCE = 30;

const PUZZLE_PIECES = [
  { continent: 'Nordamerika', emoji: '🦅', x: 10, y: 15, w: 100, h: 75, scatterX: 300, scatterY: -25, colorClass: 'piece-na' },
  { continent: 'Suedamerika', emoji: '🌴', x: 55, y: 105, w: 75, h: 95, scatterX: -25, scatterY: 210, colorClass: 'piece-sa' },
  { continent: 'Europa', emoji: '🏰', x: 185, y: 15, w: 65, h: 55, scatterX: 10, scatterY: 190, colorClass: 'piece-eu' },
  { continent: 'Afrika', emoji: '🦁', x: 175, y: 90, w: 85, h: 100, scatterX: 330, scatterY: 200, colorClass: 'piece-af' },
  { continent: 'Asien', emoji: '🏯', x: 265, y: 10, w: 130, h: 110, scatterX: -25, scatterY: 60, colorClass: 'piece-as' },
  { continent: 'Ozeanien', emoji: '🐨', x: 305, y: 155, w: 90, h: 70, scatterX: 140, scatterY: 195, colorClass: 'piece-oc' },
];

const puzzleDrag = { active: false, pointerId: null, pieceEl: null, startTranslate: null, startClient: null };

function buildPuzzleBoard() {
  el.puzzleZones.innerHTML = '';
  el.puzzlePieces.innerHTML = '';

  PUZZLE_PIECES.forEach((p) => {
    const zoneRect = document.createElementNS(SVG_NS, 'rect');
    zoneRect.setAttribute('x', p.x);
    zoneRect.setAttribute('y', p.y);
    zoneRect.setAttribute('width', p.w);
    zoneRect.setAttribute('height', p.h);
    zoneRect.setAttribute('rx', 16);
    zoneRect.setAttribute('class', 'puzzle-zone');
    el.puzzleZones.appendChild(zoneRect);

    const zoneLabel = document.createElementNS(SVG_NS, 'text');
    zoneLabel.setAttribute('x', p.x + p.w / 2);
    zoneLabel.setAttribute('y', p.y + p.h / 2 + 7);
    zoneLabel.setAttribute('class', 'puzzle-zone-label');
    zoneLabel.textContent = p.emoji;
    el.puzzleZones.appendChild(zoneLabel);

    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', `puzzle-piece ${p.colorClass}`);
    g.dataset.continent = p.continent;
    g.setAttribute('transform', `translate(${p.scatterX}, ${p.scatterY})`);

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('width', p.w);
    rect.setAttribute('height', p.h);
    rect.setAttribute('rx', 16);
    rect.setAttribute('class', 'puzzle-piece-shape');
    g.appendChild(rect);

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', p.w / 2);
    label.setAttribute('y', p.h / 2 + 7);
    label.setAttribute('class', 'puzzle-piece-label');
    label.textContent = p.emoji;
    g.appendChild(label);

    g.addEventListener('pointerdown', puzzlePiecePointerDown);
    g.addEventListener('pointermove', puzzlePiecePointerMove);
    g.addEventListener('pointerup', puzzlePiecePointerUp);
    g.addEventListener('pointercancel', puzzlePiecePointerUp);
    el.puzzlePieces.appendChild(g);
  });
}

function getGroupTranslate(g) {
  const transform = g.transform.baseVal.consolidate();
  const matrix = transform ? transform.matrix : { e: 0, f: 0 };
  return { x: matrix.e, y: matrix.f };
}

function puzzlePiecePointerDown(evt) {
  if (puzzleDrag.active) return;
  const g = evt.currentTarget;
  if (g.classList.contains('placed')) return;
  g.setPointerCapture(evt.pointerId);
  puzzleDrag.active = true;
  puzzleDrag.pointerId = evt.pointerId;
  puzzleDrag.pieceEl = g;
  puzzleDrag.startTranslate = getGroupTranslate(g);
  puzzleDrag.startClient = { x: evt.clientX, y: evt.clientY };
  g.classList.add('dragging');
  el.puzzlePieces.appendChild(g); // bring to front while dragging
}

function puzzlePiecePointerMove(evt) {
  if (!puzzleDrag.active || evt.pointerId !== puzzleDrag.pointerId) return;
  const g = puzzleDrag.pieceEl;
  const ctm = el.puzzleBoard.getScreenCTM();
  const dxSvg = (evt.clientX - puzzleDrag.startClient.x) / ctm.a;
  const dySvg = (evt.clientY - puzzleDrag.startClient.y) / ctm.d;
  const tx = puzzleDrag.startTranslate.x + dxSvg;
  const ty = puzzleDrag.startTranslate.y + dySvg;
  g.setAttribute('transform', `translate(${tx}, ${ty})`);
}

function puzzlePiecePointerUp(evt) {
  if (!puzzleDrag.active || evt.pointerId !== puzzleDrag.pointerId) return;
  puzzleDrag.active = false;
  const g = puzzleDrag.pieceEl;
  puzzleDrag.pieceEl = null;
  g.classList.remove('dragging');

  const continent = g.dataset.continent;
  const piece = PUZZLE_PIECES.find((p) => p.continent === continent);
  const current = getGroupTranslate(g);
  const dist = Math.hypot(current.x - piece.x, current.y - piece.y);

  if (dist <= PUZZLE_SNAP_TOLERANCE) {
    g.setAttribute('transform', `translate(${piece.x}, ${piece.y})`);
    g.classList.add('placed');
    state.puzzle.placed.add(continent);
    setMascotPose(el.puzzleMascot, 'happy', 'mascot-bounce');
    if (state.puzzle.placed.size === PUZZLE_PIECES.length) {
      finishPuzzle();
    }
  }
}

function startPuzzle() {
  state.isDuel = false;
  buildPuzzleBoard();
  state.puzzle = {
    placed: new Set(),
    startTime: performance.now(),
    timerHandle: null,
  };
  updatePuzzleTimerDisplay(0);
  state.puzzle.timerHandle = setInterval(() => {
    updatePuzzleTimerDisplay((performance.now() - state.puzzle.startTime) / 1000);
  }, 250);
  renderPuzzleBestTime();
  el.puzzleMascot.src = MASCOT_SRC.idle;
  showScreen('puzzle');
}

function formatPuzzleTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function updatePuzzleTimerDisplay(seconds) {
  el.puzzleTimer.textContent = `⏱️ ${formatPuzzleTime(seconds)}`;
}

function getPuzzleBestTime() {
  const value = parseFloat(localStorage.getItem(PUZZLE_BESTTIME_KEY));
  return Number.isFinite(value) ? value : null;
}

function renderPuzzleBestTime() {
  const best = getPuzzleBestTime();
  el.puzzleBesttimeLabel.classList.toggle('hidden', best === null);
  if (best !== null) el.puzzleBesttime.textContent = formatPuzzleTime(best);
}

function finishPuzzle() {
  clearInterval(state.puzzle.timerHandle);
  const elapsed = (performance.now() - state.puzzle.startTime) / 1000;
  const best = getPuzzleBestTime();
  const isNewBest = best === null || elapsed < best;
  if (isNewBest) localStorage.setItem(PUZZLE_BESTTIME_KEY, String(elapsed));

  el.puzzleResultTime.textContent = t('puzzle.resultTime', { time: formatPuzzleTime(elapsed) });
  el.puzzleResultBest.classList.toggle('hidden', !isNewBest);
  setMascotPose(el.puzzleResultMascot, 'excited', 'mascot-pop');
  applySkinToMascot(el.puzzleResultMascotAccessory);
  launchConfetti(el.puzzleConfettiLayer);
  showScreen('puzzleResult');
}

el.btnPuzzleHome.addEventListener('click', () => {
  clearInterval(state.puzzle && state.puzzle.timerHandle);
  renderStartScreen();
  refreshStartMascot();
  showScreen('start');
});
el.btnPuzzleAgain.addEventListener('click', () => startPuzzle());
el.btnPuzzleHome2.addEventListener('click', () => {
  renderStartScreen();
  refreshStartMascot();
  showScreen('start');
});

// --- Duell-Modus (lokal, 2 Spieler am selben Gerät) ---
// Reuses the normal solo quiz screen/flow (showQuestion, handleAnswer,
// finishAnswer, timer, map click handling) for both players' turns via the
// `state.isDuel` flag, so hearts/highscore/streak/skin side effects - which
// only ever fire from the solo endRound() path - stay completely untouched.

function showDuelSetup() {
  renderDuelSetup();
  showScreen('duelSetup');
}

function renderDuelSetup() {
  el.duelModeButtons.forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.mode === state.duelSetup.mode);
  });
  el.duelDifficultyButtons.forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.difficulty === state.duelSetup.difficulty);
  });
}

el.duelModeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    state.duelSetup.mode = btn.dataset.mode;
    renderDuelSetup();
  });
});

el.duelDifficultyButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    state.duelSetup.difficulty = btn.dataset.difficulty;
    renderDuelSetup();
  });
});

el.btnDuelSetupBack.addEventListener('click', () => {
  renderStartScreen();
  refreshStartMascot();
  showScreen('start');
});

el.btnDuelStart.addEventListener('click', () => {
  const name1 = el.duelPlayer1Input.value.trim() || el.duelPlayer1Input.placeholder;
  const name2 = el.duelPlayer2Input.value.trim() || el.duelPlayer2Input.placeholder;
  startDuel(state.duelSetup.mode, state.duelSetup.difficulty, name1, name2);
});

function startDuel(modeId, difficulty, player1Name, player2Name) {
  state.isDuel = true;
  state.duel = {
    mode: modeId,
    difficulty,
    player1Name,
    player2Name,
    currentPlayer: 1,
    player1Score: 0,
    player1Correct: 0,
    player2Score: 0,
    player2Correct: 0,
  };

  state.roundMode = modeId;
  state.roundDifficulty = difficulty;
  // Both players answer the exact same questions in the exact same order,
  // built once here, so the comparison at the end is fair.
  state.questions = buildQuestions(modeId, difficulty);
  state.currentIndex = 0;
  state.score = 0;
  state.correctCount = 0;

  showScreen('quiz');
  showQuestion();
}

function endDuelLeg() {
  if (state.duel.currentPlayer === 1) {
    state.duel.player1Score = state.score;
    state.duel.player1Correct = state.correctCount;
    state.duel.currentPlayer = 2;
    showDuelHandoff();
  } else {
    state.duel.player2Score = state.score;
    state.duel.player2Correct = state.correctCount;
    showDuelResult();
  }
}

function showDuelHandoff() {
  el.duelHandoffText.textContent = t('duel.handoffText', { name: state.duel.player2Name });
  setMascotPose(el.duelHandoffMascot, 'happy', 'mascot-pop');
  showScreen('duelHandoff');
}

el.btnDuelHandoffContinue.addEventListener('click', () => {
  state.currentIndex = 0;
  state.score = 0;
  state.correctCount = 0;
  showScreen('quiz');
  showQuestion();
});

function showDuelResult() {
  const { player1Name, player2Name, player1Score, player2Score, player1Correct, player2Correct } = state.duel;
  const total = state.questions.length;

  el.duelName1.textContent = player1Name;
  el.duelName2.textContent = player2Name;
  el.duelScore1.textContent = player1Score;
  el.duelScore2.textContent = player2Score;
  el.duelCorrect1.textContent = t('ui.correctOfTotal', { correct: player1Correct, total });
  el.duelCorrect2.textContent = t('ui.correctOfTotal', { correct: player2Correct, total });

  const isTie = player1Score === player2Score;
  el.duelCard1.classList.toggle('winner', !isTie && player1Score > player2Score);
  el.duelCard2.classList.toggle('winner', !isTie && player2Score > player1Score);

  let pose;
  if (isTie) {
    el.duelWinnerText.textContent = pickRandom(tList('messages.duelTie'));
    el.duelSubMessage.textContent = t('duel.tieSubMessage');
    pose = 'happy';
  } else {
    const winnerName = player1Score > player2Score ? player1Name : player2Name;
    const loserName = player1Score > player2Score ? player2Name : player1Name;
    el.duelWinnerText.textContent = t('duel.winnerLine', { name: winnerName, msg: pickRandom(tList('messages.duelWin')) });
    el.duelSubMessage.textContent = t('duel.loserLine', { name: loserName, msg: pickRandom(tList('messages.duelConsolation')) });
    pose = 'excited';
  }

  el.duelResultMascot.src = MASCOT_SRC[pose];
  el.duelResultMascot.classList.remove('mascot-pop');
  void el.duelResultMascot.offsetWidth;
  el.duelResultMascot.classList.add('mascot-pop');
  applySkinToMascot(el.duelResultMascotAccessory);

  if (!isTie) {
    launchConfetti(el.duelConfettiLayer);
  }

  showScreen('duelResult');
}

el.btnDuelAgain.addEventListener('click', () => {
  startDuel(state.duel.mode, state.duel.difficulty, state.duel.player1Name, state.duel.player2Name);
});

el.btnDuelHome.addEventListener('click', () => {
  state.isDuel = false;
  renderStartScreen();
  refreshStartMascot();
  showScreen('start');
});

function showQuestion() {
  state.answered = false;
  const question = state.questions[state.currentIndex];

  if (state.isDuel) {
    const playerName = state.duel.currentPlayer === 1 ? state.duel.player1Name : state.duel.player2Name;
    el.quizProgress.textContent = t('ui.progressQuiz', { mode: playerName, n: state.currentIndex + 1, total: state.questions.length });
    el.quizHeartsRow.classList.add('hidden');
  } else {
    el.quizProgress.textContent = t('ui.progressQuiz', { mode: modeLabel(state.roundMode), n: state.currentIndex + 1, total: state.questions.length });
    el.quizHeartsRow.classList.remove('hidden');
    renderHearts();
  }
  el.quizScore.textContent = state.score;
  el.questionLabel.textContent = t(question.promptLabel);

  const isImagePrompt = question.promptType === 'image';
  const isOutlinePrompt = question.promptType === 'outline';
  const isMapPrompt = question.promptType === 'map-country' || question.promptType === 'map-city';
  const usesMapDisplay = isMapPrompt || isOutlinePrompt;

  el.questionSubject.classList.toggle('hidden', isImagePrompt || isOutlinePrompt);
  el.questionFlag.classList.toggle('hidden', !isImagePrompt);
  el.questionSubject.textContent = question.promptValue;
  if (isImagePrompt) {
    el.questionFlag.src = `assets/flags/${question.promptValue}.svg`;
  }

  el.answersGrid.classList.toggle('hidden', isMapPrompt);
  el.mapWrap.classList.toggle('hidden', !usesMapDisplay);
  el.kontinenteWrap.classList.add('hidden');
  el.timerWrap.classList.remove('hidden');
  el.timerNumber.classList.remove('hidden');
  resetMapSilhouette();
  if (isMapPrompt) {
    clearMapHighlights();
    mapGesture.pointers.clear();
    mapGesture.mode = 'idle';
    const baseView = getContinentView(question.targetContinent);
    state.mapBaseView = baseView;
    setMapView(baseView, { animate: true });
  } else if (isOutlinePrompt) {
    clearMapHighlights();
    mapGesture.pointers.clear();
    mapGesture.mode = 'idle';
    showCountrySilhouette(question.targetCode);
  }
  if (!isMapPrompt) {
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
  applySkinToMascot(el.quizMascotAccessory);

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
  let heartsDepleted = false;
  if (isCorrect) {
    state.score += POINTS_PER_CORRECT[state.roundDifficulty];
    state.correctCount += 1;
    el.quizScore.textContent = state.score;
  } else if (!state.isDuel) {
    // Hearts are a solo-mode resource; the duel never spends or shows them.
    const heartsLeft = loseHeart();
    renderHearts();
    heartsDepleted = heartsLeft <= 0;
  }

  const reactionPose = isCorrect ? 'happy' : 'comfort';
  const reactionMessage = isCorrect ? pickRandom(tList('messages.correct')) : pickRandom(tList('messages.wrong'));
  setMascotPose(el.quizMascot, reactionPose, isCorrect ? 'mascot-bounce' : 'mascot-sway');
  el.quizBubble.textContent = reactionMessage;
  el.quizBubble.classList.remove('hidden');

  setTimeout(() => {
    if (heartsDepleted) {
      endRound({ heartsDepleted: true });
    } else if (state.currentIndex + 1 < state.questions.length) {
      state.currentIndex += 1;
      showQuestion();
    } else if (state.isDuel) {
      endDuelLeg();
    } else {
      endRound({});
    }
  }, ANSWER_FEEDBACK_DELAY);
}

function loadMap() {
  return fetch('assets/map/world-map.svg')
    .then((r) => r.text())
    .then((svgText) => {
      el.mapContainer.innerHTML = svgText;
      state.mapSvg = el.mapContainer.querySelector('svg');
      setMapView(state.mapView);
      el.mapContainer.addEventListener('pointerdown', mapPointerDown);
      el.mapContainer.addEventListener('pointermove', mapPointerMove);
      el.mapContainer.addEventListener('pointerup', mapPointerUp);
      el.mapContainer.addEventListener('pointercancel', mapPointerUp);
      el.mapZoomIn.addEventListener('click', () => zoomMapBy(MAP_ZOOM_STEP));
      el.mapZoomOut.addEventListener('click', () => zoomMapBy(1 / MAP_ZOOM_STEP));
    });
}

function projectLonLat(lat, lon) {
  return [(lon + 180) / 360 * MAP_WIDTH, (90 - lat) / 180 * MAP_HEIGHT];
}

function clampMapView({ x, y, w, h }) {
  const clampedW = Math.min(w, MAP_WIDTH);
  const clampedH = Math.min(h, MAP_HEIGHT);
  const clampedX = Math.max(0, Math.min(x, MAP_WIDTH - clampedW));
  const clampedY = Math.max(0, Math.min(y, MAP_HEIGHT - clampedH));
  return { x: clampedX, y: clampedY, w: clampedW, h: clampedH };
}

function getContinentView(continent) {
  const region = CONTINENT_REGIONS[continent];
  if (!region) return { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT };
  const [x0, y0] = projectLonLat(region.latMax, region.lonMin);
  const [x1, y1] = projectLonLat(region.latMin, region.lonMax);
  let w = (x1 - x0) * (1 + MAP_ZOOM_PADDING * 2);
  let h = (y1 - y0) * (1 + MAP_ZOOM_PADDING * 2);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  // Force the map's fixed 2:1 aspect ratio so the zoomed view always fills
  // the container edge-to-edge instead of getting letterboxed by the SVG's
  // default preserveAspectRatio behavior.
  const aspect = MAP_WIDTH / MAP_HEIGHT;
  if (w / h > aspect) {
    h = w / aspect;
  } else {
    w = h * aspect;
  }

  return clampMapView({ x: cx - w / 2, y: cy - h / 2, w, h });
}

function setMapView(view, { animate = false } = {}) {
  const clamped = clampMapView(view);
  if (!state.mapSvg) {
    state.mapView = clamped;
    return;
  }
  if (!animate) {
    cancelAnimationFrame(state.mapAnimHandle);
    state.mapView = clamped;
    state.mapSvg.setAttribute('viewBox', `${clamped.x} ${clamped.y} ${clamped.w} ${clamped.h}`);
    return;
  }
  const from = { ...state.mapView };
  const start = performance.now();
  cancelAnimationFrame(state.mapAnimHandle);
  const step = (now) => {
    const t = Math.min(1, (now - start) / MAP_ZOOM_ANIM_MS);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = {
      x: from.x + (clamped.x - from.x) * eased,
      y: from.y + (clamped.y - from.y) * eased,
      w: from.w + (clamped.w - from.w) * eased,
      h: from.h + (clamped.h - from.h) * eased,
    };
    state.mapSvg.setAttribute('viewBox', `${current.x} ${current.y} ${current.w} ${current.h}`);
    state.mapView = current;
    if (t < 1) {
      state.mapAnimHandle = requestAnimationFrame(step);
    } else {
      state.mapView = clamped;
    }
  };
  state.mapAnimHandle = requestAnimationFrame(step);
}

function zoomMapBy(factor, centerSvgPoint) {
  const view = state.mapView;
  const cx = centerSvgPoint ? centerSvgPoint.x : view.x + view.w / 2;
  const cy = centerSvgPoint ? centerSvgPoint.y : view.y + view.h / 2;
  const newW = Math.max(MAP_MIN_ZOOM_WIDTH, Math.min(MAP_WIDTH, view.w / factor));
  const newH = newW / 2;
  const newX = cx - (cx - view.x) * (newW / view.w);
  const newY = cy - (cy - view.y) * (newH / view.h);
  setMapView({ x: newX, y: newY, w: newW, h: newH });
}

function panMapByScreenDelta(dxScreen, dyScreen) {
  if (!state.mapSvg) return;
  const ctm = state.mapSvg.getScreenCTM();
  const view = state.mapView;
  setMapView({ x: view.x - dxScreen / ctm.a, y: view.y - dyScreen / ctm.d, w: view.w, h: view.h });
}

function mapPointerDown(evt) {
  el.mapContainer.setPointerCapture(evt.pointerId);
  mapGesture.pointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });

  if (mapGesture.pointers.size === 1) {
    mapGesture.mode = 'pan';
    mapGesture.panLast = { x: evt.clientX, y: evt.clientY };
    mapGesture.dragDistance = 0;
  } else if (mapGesture.pointers.size === 2) {
    mapGesture.mode = 'pinch';
    const pts = Array.from(mapGesture.pointers.values());
    mapGesture.pinchStartDist = Math.max(1, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
    mapGesture.pinchStartView = { ...state.mapView };
    const midClient = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    const ctm = state.mapSvg.getScreenCTM();
    const pt = state.mapSvg.createSVGPoint();
    pt.x = midClient.x;
    pt.y = midClient.y;
    mapGesture.pinchMidSvg = pt.matrixTransform(ctm.inverse());
  }
}

function mapPointerMove(evt) {
  if (!mapGesture.pointers.has(evt.pointerId)) return;
  mapGesture.pointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });

  if (mapGesture.mode === 'pan' && mapGesture.panLast) {
    const dx = evt.clientX - mapGesture.panLast.x;
    const dy = evt.clientY - mapGesture.panLast.y;
    mapGesture.dragDistance += Math.hypot(dx, dy);
    panMapByScreenDelta(dx, dy);
    mapGesture.panLast = { x: evt.clientX, y: evt.clientY };
  } else if (mapGesture.mode === 'pinch') {
    const pts = Array.from(mapGesture.pointers.values());
    if (pts.length < 2) return;
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    const scale = dist / mapGesture.pinchStartDist;
    const startView = mapGesture.pinchStartView;
    const newW = Math.max(MAP_MIN_ZOOM_WIDTH, Math.min(MAP_WIDTH, startView.w / scale));
    const newH = newW / 2;
    const mid = mapGesture.pinchMidSvg;
    const fracX = (mid.x - startView.x) / startView.w;
    const fracY = (mid.y - startView.y) / startView.h;
    setMapView({ x: mid.x - fracX * newW, y: mid.y - fracY * newH, w: newW, h: newH });
  }
}

function mapPointerUp(evt) {
  const wasTap = mapGesture.mode === 'pan' && mapGesture.dragDistance < MAP_TAP_THRESHOLD_PX;
  const tapPoint = wasTap ? mapGesture.pointers.get(evt.pointerId) : null;
  mapGesture.pointers.delete(evt.pointerId);

  if (tapPoint) {
    resolveMapTap(tapPoint.x, tapPoint.y);
  }

  if (mapGesture.pointers.size === 0) {
    mapGesture.mode = 'idle';
  } else if (mapGesture.pointers.size === 1) {
    // Dropped from pinch back to a single finger: resume as a pan gesture,
    // but mark it as already "dragged" so lifting that finger won't
    // accidentally register as a tap-to-answer.
    const [remaining] = mapGesture.pointers.values();
    mapGesture.mode = 'pan';
    mapGesture.panLast = { ...remaining };
    mapGesture.dragDistance = MAP_TAP_THRESHOLD_PX;
  }
}

function resolveMapTap(clientX, clientY) {
  if (state.answered) return;
  const question = state.questions[state.currentIndex];
  if (!question || (question.promptType !== 'map-country' && question.promptType !== 'map-city')) return;

  const svg = state.mapSvg;
  const ctm = svg.getScreenCTM();
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const point = pt.matrixTransform(ctm.inverse());
  const targetEl = document.elementFromPoint(clientX, clientY);
  const fakeEvt = { clientX, clientY, target: targetEl };

  if (question.promptType === 'map-country') {
    resolveMapCountryClick(targetEl, point, fakeEvt, ctm, question);
  } else {
    resolveMapCityClick(point, fakeEvt, ctm, question);
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

// --- Länder-Umriss-Rätsel: reuses the interactive map's own country paths,
// just hidden/zoomed down to a single isolated silhouette instead of the
// full clickable map.

function resetMapSilhouette() {
  if (!state.mapSvg) return;
  state.mapSvg.classList.remove('silhouette-active');
  const prevTarget = state.mapSvg.querySelector('.silhouette-target');
  if (prevTarget) prevTarget.classList.remove('silhouette-target');
}

function showCountrySilhouette(code) {
  if (!state.mapSvg) return;
  const targetPath = state.mapSvg.getElementById(code);
  if (!targetPath) return;
  state.mapSvg.classList.add('silhouette-active');
  targetPath.classList.add('silhouette-target');

  const bbox = targetPath.getBBox();
  const padding = 0.6;
  const minSize = 40;
  let w = Math.max(bbox.width * (1 + padding * 2), minSize);
  let h = Math.max(bbox.height * (1 + padding * 2), minSize);
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  const aspect = MAP_WIDTH / MAP_HEIGHT;
  if (w / h > aspect) {
    h = w / aspect;
  } else {
    w = h * aspect;
  }

  const view = clampMapView({ x: cx - w / 2, y: cy - h / 2, w, h });
  state.mapBaseView = view;
  setMapView(view, { animate: true });
}

function endRound({ heartsDepleted = false } = {}) {
  const attempted = Math.min(state.currentIndex + 1, state.questions.length);
  const accuracy = attempted > 0 ? state.correctCount / attempted : 0;

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

  const previousUnlockedSkins = getUnlockedSkinIds();
  const { milestone, count: newStreakCount } = registerPlayedToday();
  recordRoundStats(state.score, newStreakCount);
  const newlyUnlockedSkin = getUnlockedSkinIds().find((id) => !previousUnlockedSkins.includes(id));

  renderResult({ isNewHighscore, unlockedNextStage, milestone, heartsDepleted, attempted, newlyUnlockedSkin });
  showScreen('result');
}

const RESULT_TIER_POSE = { excellent: 'excited', good: 'happy', practice: 'comfort' };

function renderResult({ isNewHighscore, unlockedNextStage, milestone, heartsDepleted, attempted, newlyUnlockedSkin }) {
  el.resultModeLabel.textContent = `${t('ui.modeLinePrefix')} ${modeLabel(state.roundMode)}`;
  el.resultScore.textContent = state.score;
  el.resultCorrectLine.textContent = t('ui.correctOfTotal', { correct: state.correctCount, total: attempted });

  const accuracy = attempted > 0 ? state.correctCount / attempted : 0;
  const tier = getResultTier(accuracy);
  const pose = milestone ? 'excited' : heartsDepleted ? 'comfort' : RESULT_TIER_POSE[tier];
  el.resultMascot.src = MASCOT_SRC[pose];
  el.resultMascot.classList.remove('mascot-pop');
  void el.resultMascot.offsetWidth;
  el.resultMascot.classList.add('mascot-pop');
  applySkinToMascot(el.resultMascotAccessory);

  if (milestone) {
    el.resultTitle.textContent = t('ui.streakMilestone', { n: milestone });
  } else if (heartsDepleted) {
    el.resultTitle.textContent = pickRandom(tList('messages.heartsDepleted'));
  } else {
    el.resultTitle.textContent = pickRandom(tList(`messages.result.${tier}`));
  }

  el.resultHighscoreMsg.classList.toggle('hidden', !isNewHighscore);
  el.resultUnlockMsg.classList.toggle('hidden', !unlockedNextStage);
  if (unlockedNextStage) {
    const nextDifficulty = DIFFICULTIES[DIFFICULTIES.indexOf(state.roundDifficulty) + 1];
    el.resultUnlockMsg.textContent = t('ui.unlockedStage', { stage: t(`difficulty.${nextDifficulty}`) });
  }

  el.resultSkinMsg.classList.toggle('hidden', !newlyUnlockedSkin);
  if (newlyUnlockedSkin) {
    el.resultSkinMsg.textContent = t('ui.newSkinUnlocked', { skin: t(`skin.${newlyUnlockedSkin}.label`) });
  }

  if (milestone || newlyUnlockedSkin) {
    launchConfetti(el.confettiLayer);
  }
}

async function init() {
  applyStaticTranslations();
  checkPasswordGate();
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
