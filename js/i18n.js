// Translation dictionary + tiny helpers for the app's 3 supported languages.
// Loaded before js/app.js. `t()` always reads the active language off the
// global `state.lang` (defined in app.js) at call time, so load order only
// matters for the initial parse, not for when these functions actually run.

const SUPPORTED_LANGS = ['de', 'en', 'it'];
const DEFAULT_LANG = 'de';
const LANG_STORAGE_KEY = 'geoquiz-lang';

const I18N = {
  de: {
    ui: {
      appTitle: 'Geo-Quiz',
      modeTitle: 'Wähle einen Modus:',
      highscoreWord: 'Highscore',
      pointsWord: 'Punkte',
      modeLinePrefix: 'Modus:',
      difficultyTitle: 'Wähle eine Stufe:',
      startButton: '🚀 Spiel starten',
      correctOfTotal: '{correct} von {total} richtig',
      newHighscore: '🏆 Neuer Highscore!',
      unlockedStage: '🔓 Stufe "{stage}" freigeschaltet!',
      newSkinUnlocked: '🎁 Neuer Koala-Skin freigeschaltet: {skin}!',
      again: '🔁 Nochmal spielen',
      home: '🏠 Zum Start',
      heartsRegenHint: 'Nächstes Herz in {min} Min.',
      daySingular: 'Tag',
      dayPlural: 'Tage',
      streakBadge: '🔥 {n} {day} in Folge!',
      streakMilestone: '🎉 {n} Tage in Folge! Du bist ein Streak-Champion!',
      progressQuiz: '{mode} · Frage {n} von {total}',
      mapZoomIn: 'Karte vergrößern',
      mapZoomOut: 'Karte verkleinern',
      settingsButtonLabel: 'Einstellungen öffnen',
      settingsTitle: '⚙️ Einstellungen',
      settingsLanguageLabel: 'Sprache',
      settingsDone: 'Fertig',
    },
    tile: {
      hauptstaedte: 'Hauptstädte',
      laender: 'Länder',
      staedte: 'Städte',
      fluesse: 'Flüsse',
      flaggen: 'Flaggen',
      karte: 'Karte',
      umriss: 'Umrisse',
      nachbarn: 'Nachbarn',
      kontinente: 'Kontinente',
      puzzle: 'Puzzle',
      berge: 'Berge',
      duell: 'Duell',
    },
    submode: {
      karteLaender: '🌍 Länder finden',
      karteStaedte: '📍 Städte finden',
    },
    mode: {
      hauptstaedte: 'Hauptstädte',
      laender: 'Länder',
      staedte: 'Städte',
      fluesse: 'Flüsse',
      flaggen: 'Flaggen',
      umriss: 'Länderumrisse',
      nachbarn: 'Nachbarländer',
      kontinente: 'Kontinente-Zuordnung',
      berge: 'Berge',
      'karte-laender': 'Karte: Länder finden',
      'karte-staedte': 'Karte: Städte finden',
    },
    difficulty: {
      leicht: 'Leicht',
      mittel: 'Mittel',
      schwer: 'Schwer',
    },
    continent: {
      Europa: 'Europa',
      Asien: 'Asien',
      Afrika: 'Afrika',
      Nordamerika: 'Nordamerika',
      Suedamerika: 'Südamerika',
      Ozeanien: 'Ozeanien',
    },
    skin: {
      none: { label: 'Standard', hint: null },
      hat: { label: 'Hut', hint: 'Ab 5 gespielten Runden' },
      sunglasses: { label: 'Sonnenbrille', hint: 'Ab 3 Tagen Streak' },
      scarf: { label: 'Schal', hint: 'Ab 300 Punkten insgesamt' },
      crown: { label: 'Krone', hint: 'Ab 7 Tagen Streak' },
    },
    q: {
      capitalOf: 'Wie heißt die Hauptstadt von...?',
      countryOfCapital: 'Welches Land hat diese Hauptstadt?',
      largestCityOf: 'Welche ist die größte Stadt in...?',
      riverCountry: 'Durch welches Land fließt dieser Fluss?',
      flagCountry: 'Zu welchem Land gehört diese Flagge?',
      outlineCountry: 'Welches Land hat diesen Umriss?',
      neighborOf: 'Welches Land grenzt an...?',
      whereIsCountry: 'Wo liegt dieses Land?',
      whereIsCity: 'Wo liegt diese Stadt?',
      dragContinent: 'Ziehe das Land auf den richtigen Kontinent:',
      highestMountainOf: 'Welcher ist der höchste Berg in...?',
    },
    duel: {
      title: '⚔️ Duell-Modus',
      subtitle: 'Zwei Spieler, ein Gerät - wer weiß mehr?',
      player1Label: '👤 Spieler 1',
      player2Label: '👤 Spieler 2',
      player1Placeholder: 'Spieler 1',
      player2Placeholder: 'Spieler 2',
      startButton: '⚔️ Duell starten',
      backButton: '🏠 Zurück',
      handoffTitle: 'Runde geschafft! 🎉',
      handoffText: 'Gib das Gerät an {name} weiter!',
      handoffContinue: "▶️ Bereit? Los geht's!",
      again: '🔁 Nochmal duellieren',
      winnerLine: '🏆 {name} gewinnt! {msg}',
      loserLine: '{name}: {msg}',
      tieSubMessage: 'Ihr kennt euch beide super mit der Welt aus!',
    },
    puzzle: {
      title: '🧩 Länder-Puzzle',
      subtitle: 'Ziehe die Länder an die richtige Stelle auf der Karte!',
      highscoreLabelWord: 'Highscore',
      scoreLabelWord: 'Punkte',
      revealHint: 'So liegen sie richtig:',
      resultTitle: '🎉 Puzzle-Runde beendet!',
      resultCorrect: '{correct} von {total} Länder richtig platziert',
      resultScore: 'Punkte: {score}',
      resultBest: '🏆 Neuer Highscore!',
      again: '🔁 Nochmal puzzeln',
    },
    pause: {
      buttonLabel: 'Pause',
      title: '⏸️ Pause',
      resume: '▶️ Weiterspielen',
      cancel: '🚪 Abbrechen',
      confirmTitle: 'Wirklich beenden?',
      confirmText: 'Der Fortschritt dieser Runde geht verloren.',
      confirmYes: 'Ja, beenden',
      confirmNo: 'Nein, weiterspielen',
    },
    password: {
      title: '🔒 Passwort erforderlich',
      placeholder: 'Passwort eingeben',
      submit: "Los geht's! 🚀",
      remember: 'Passwort merken',
      wrong: "Falsches Passwort, versuch's nochmal!",
    },
    messages: {
      greetings: {
        morning: ['Guten Morgen! Bereit für ein paar knifflige Fragen? ☀️', 'Guten Morgen! Lass uns die Welt entdecken! 🌍'],
        afternoon: ['Schön, dass du da bist! Lust auf ein Quiz? 🌤️', 'Hallo! Zeit für neue Entdeckungen! 🗺️'],
        evening: ['Guten Abend! Noch eine Runde Geo-Quiz? 🌙', 'Hallo! Lass uns gemeinsam die Welt erkunden! ✨'],
      },
      correct: ['Super gemacht! 🎉', 'Klasse! Du kennst dich aus! 🌟', 'Genau richtig! 👏', 'Wow, stark! 💪', 'Perfekt! Weiter so! ✨'],
      wrong: [
        "Kein Problem, nächstes Mal klappt's! 💛",
        "Fast! Beim nächsten Mal schaffst du's! 🌈",
        "Nicht so schlimm, weiter geht's! 🙂",
        'Das war knifflig! Du lernst dazu! 🌱',
        'Kopf hoch, du machst das gut! 🤗',
      ],
      result: {
        excellent: ['Wow, fantastisch! Du bist ein echter Geo-Profi! 🏆', 'Sensationell! Fast alles richtig! 🌟'],
        good: ['Super gemacht! Du kennst dich richtig gut aus! 🎉', 'Klasse Runde! Weiter so! 👏'],
        practice: ['Guter Versuch! Übung macht den Meister! 💪', 'Weiter so, du wirst von Mal zu Mal besser! 🌱'],
      },
      heartsDepleted: [
        'Kein Problem! Deine Herzen füllen sich bald wieder auf. 💛',
        'Alle Herzen aufgebraucht - aber du hast schon tolle Punkte gesammelt! 🌟',
      ],
      duelWin: ['Klasse gemacht! 🌟', 'Starke Leistung! 👏', 'Wow, richtig gut! 🎉'],
      duelConsolation: [
        "Super gespielt! Beim nächsten Mal klappt's bestimmt! 💪",
        'Toller Einsatz! Weiter so! 🌈',
        'Gut gemacht - übe weiter und du holst auf! 🌱',
      ],
      duelTie: ['🤝 Unentschieden! Ihr seid beide Geo-Champions!', '🤝 Gleichstand! Klasse gemacht, ihr beide!'],
    },
  },

  en: {
    ui: {
      appTitle: 'Geo-Quiz',
      modeTitle: 'Choose a mode:',
      highscoreWord: 'Highscore',
      pointsWord: 'Points',
      modeLinePrefix: 'Mode:',
      difficultyTitle: 'Choose a level:',
      startButton: '🚀 Start Game',
      correctOfTotal: '{correct} of {total} correct',
      newHighscore: '🏆 New highscore!',
      unlockedStage: '🔓 Level "{stage}" unlocked!',
      newSkinUnlocked: '🎁 New koala skin unlocked: {skin}!',
      again: '🔁 Play again',
      home: '🏠 Home',
      heartsRegenHint: 'Next heart in {min} min.',
      daySingular: 'day',
      dayPlural: 'days',
      streakBadge: '🔥 {n} {day} in a row!',
      streakMilestone: "🎉 {n} days in a row! You're a streak champion!",
      progressQuiz: '{mode} · Question {n} of {total}',
      mapZoomIn: 'Zoom in on map',
      mapZoomOut: 'Zoom out of map',
      settingsButtonLabel: 'Open settings',
      settingsTitle: '⚙️ Settings',
      settingsLanguageLabel: 'Language',
      settingsDone: 'Done',
    },
    tile: {
      hauptstaedte: 'Capitals',
      laender: 'Countries',
      staedte: 'Cities',
      fluesse: 'Rivers',
      flaggen: 'Flags',
      karte: 'Map',
      umriss: 'Outlines',
      nachbarn: 'Neighbors',
      kontinente: 'Continents',
      puzzle: 'Puzzle',
      berge: 'Mountains',
      duell: 'Duel',
    },
    submode: {
      karteLaender: '🌍 Find Countries',
      karteStaedte: '📍 Find Cities',
    },
    mode: {
      hauptstaedte: 'Capitals',
      laender: 'Countries',
      staedte: 'Cities',
      fluesse: 'Rivers',
      flaggen: 'Flags',
      umriss: 'Country Outlines',
      nachbarn: 'Neighboring Countries',
      kontinente: 'Continent Matching',
      berge: 'Mountains',
      'karte-laender': 'Map: Find Countries',
      'karte-staedte': 'Map: Find Cities',
    },
    difficulty: {
      leicht: 'Easy',
      mittel: 'Medium',
      schwer: 'Hard',
    },
    continent: {
      Europa: 'Europe',
      Asien: 'Asia',
      Afrika: 'Africa',
      Nordamerika: 'North America',
      Suedamerika: 'South America',
      Ozeanien: 'Oceania',
    },
    skin: {
      none: { label: 'Standard', hint: null },
      hat: { label: 'Hat', hint: 'After 5 rounds played' },
      sunglasses: { label: 'Sunglasses', hint: 'After a 3-day streak' },
      scarf: { label: 'Scarf', hint: 'After 300 total points' },
      crown: { label: 'Crown', hint: 'After a 7-day streak' },
    },
    q: {
      capitalOf: 'What is the capital of...?',
      countryOfCapital: 'Which country has this capital?',
      largestCityOf: 'Which is the largest city in...?',
      riverCountry: 'Which country does this river flow through?',
      flagCountry: 'Which country does this flag belong to?',
      outlineCountry: 'Which country has this outline?',
      neighborOf: 'Which country borders...?',
      whereIsCountry: 'Where is this country?',
      whereIsCity: 'Where is this city?',
      dragContinent: 'Drag the country onto the right continent:',
      highestMountainOf: 'Which is the highest mountain in...?',
    },
    duel: {
      title: '⚔️ Duel Mode',
      subtitle: 'Two players, one device - who knows more?',
      player1Label: '👤 Player 1',
      player2Label: '👤 Player 2',
      player1Placeholder: 'Player 1',
      player2Placeholder: 'Player 2',
      startButton: '⚔️ Start Duel',
      backButton: '🏠 Back',
      handoffTitle: 'Round complete! 🎉',
      handoffText: 'Pass the device to {name}!',
      handoffContinue: "▶️ Ready? Let's go!",
      again: '🔁 Duel again',
      winnerLine: '🏆 {name} wins! {msg}',
      loserLine: '{name}: {msg}',
      tieSubMessage: 'You both know your way around the world!',
    },
    puzzle: {
      title: '🧩 Country Puzzle',
      subtitle: 'Drag the countries to the right place on the map!',
      highscoreLabelWord: 'Highscore',
      scoreLabelWord: 'Points',
      revealHint: "Here's where they belong:",
      resultTitle: '🎉 Puzzle round complete!',
      resultCorrect: '{correct} of {total} countries placed correctly',
      resultScore: 'Points: {score}',
      resultBest: '🏆 New highscore!',
      again: '🔁 Puzzle again',
    },
    pause: {
      buttonLabel: 'Pause',
      title: '⏸️ Pause',
      resume: '▶️ Resume',
      cancel: '🚪 Quit',
      confirmTitle: 'Really quit?',
      confirmText: "This round's progress will be lost.",
      confirmYes: 'Yes, quit',
      confirmNo: 'No, keep playing',
    },
    password: {
      title: '🔒 Password Required',
      placeholder: 'Enter password',
      submit: "Let's go! 🚀",
      remember: 'Remember password',
      wrong: 'Wrong password, try again!',
    },
    messages: {
      greetings: {
        morning: ['Good morning! Ready for a few tricky questions? ☀️', "Good morning! Let's explore the world! 🌍"],
        afternoon: ['Great to see you! Fancy a quiz? 🌤️', 'Hi! Time for new discoveries! 🗺️'],
        evening: ['Good evening! One more round of Geo-Quiz? 🌙', "Hi! Let's explore the world together! ✨"],
      },
      correct: ['Great job! 🎉', 'Awesome! You really know this! 🌟', 'Exactly right! 👏', 'Wow, amazing! 💪', 'Perfect! Keep it up! ✨'],
      wrong: [
        "No worries, you'll get it next time! 💛",
        "So close! You'll get it next time! 🌈",
        "No big deal, let's keep going! 🙂",
        "That one was tricky! You're learning! 🌱",
        "Chin up, you're doing great! 🤗",
      ],
      result: {
        excellent: ["Wow, fantastic! You're a true geo-pro! 🏆", 'Sensational! Almost all correct! 🌟'],
        good: ['Great job! You really know your way around! 🎉', 'Awesome round! Keep it up! 👏'],
        practice: ['Good try! Practice makes perfect! 💪', "Keep going, you'll get better every time! 🌱"],
      },
      heartsDepleted: [
        'No worries! Your hearts will fill back up soon. 💛',
        "All hearts used up - but you've already collected great points! 🌟",
      ],
      duelWin: ['Great job! 🌟', 'Strong performance! 👏', 'Wow, really good! 🎉'],
      duelConsolation: [
        "Great effort! Next time you'll surely get it! 💪",
        'Awesome effort! Keep going! 🌈',
        "Well done - keep practicing and you'll catch up! 🌱",
      ],
      duelTie: ["🤝 It's a tie! You're both geo-champions!", '🤝 Even score! Great job, both of you!'],
    },
  },

  it: {
    ui: {
      appTitle: 'Geo-Quiz',
      modeTitle: 'Scegli una modalità:',
      highscoreWord: 'Record',
      pointsWord: 'Punti',
      modeLinePrefix: 'Modalità:',
      difficultyTitle: 'Scegli un livello:',
      startButton: '🚀 Inizia',
      correctOfTotal: '{correct} su {total} corrette',
      newHighscore: '🏆 Nuovo record!',
      unlockedStage: '🔓 Livello "{stage}" sbloccato!',
      newSkinUnlocked: '🎁 Nuovo skin del koala sbloccato: {skin}!',
      again: '🔁 Gioca ancora',
      home: '🏠 Home',
      heartsRegenHint: 'Prossimo cuore tra {min} min.',
      daySingular: 'giorno',
      dayPlural: 'giorni',
      streakBadge: '🔥 {n} {day} di fila!',
      streakMilestone: '🎉 {n} giorni di fila! Sei un campione della serie!',
      progressQuiz: '{mode} · Domanda {n} di {total}',
      mapZoomIn: 'Ingrandisci la mappa',
      mapZoomOut: 'Rimpicciolisci la mappa',
      settingsButtonLabel: 'Apri le impostazioni',
      settingsTitle: '⚙️ Impostazioni',
      settingsLanguageLabel: 'Lingua',
      settingsDone: 'Fatto',
    },
    tile: {
      hauptstaedte: 'Capitali',
      laender: 'Paesi',
      staedte: 'Città',
      fluesse: 'Fiumi',
      flaggen: 'Bandiere',
      karte: 'Mappa',
      umriss: 'Sagome',
      nachbarn: 'Vicini',
      kontinente: 'Continenti',
      puzzle: 'Puzzle',
      berge: 'Montagne',
      duell: 'Duello',
    },
    submode: {
      karteLaender: '🌍 Trova i Paesi',
      karteStaedte: '📍 Trova le città',
    },
    mode: {
      hauptstaedte: 'Capitali',
      laender: 'Paesi',
      staedte: 'Città',
      fluesse: 'Fiumi',
      flaggen: 'Bandiere',
      umriss: 'Sagome dei Paesi',
      nachbarn: 'Paesi Confinanti',
      kontinente: 'Abbinamento Continenti',
      berge: 'Montagne',
      'karte-laender': 'Mappa: Trova i Paesi',
      'karte-staedte': 'Mappa: Trova le Città',
    },
    difficulty: {
      leicht: 'Facile',
      mittel: 'Medio',
      schwer: 'Difficile',
    },
    continent: {
      Europa: 'Europa',
      Asien: 'Asia',
      Afrika: 'Africa',
      Nordamerika: 'Nord America',
      Suedamerika: 'Sud America',
      Ozeanien: 'Oceania',
    },
    skin: {
      none: { label: 'Standard', hint: null },
      hat: { label: 'Cappello', hint: 'Dopo 5 partite giocate' },
      sunglasses: { label: 'Occhiali da sole', hint: 'Dopo una serie di 3 giorni' },
      scarf: { label: 'Sciarpa', hint: 'Dopo 300 punti totali' },
      crown: { label: 'Corona', hint: 'Dopo una serie di 7 giorni' },
    },
    q: {
      capitalOf: 'Qual è la capitale di...?',
      countryOfCapital: 'Quale Paese ha questa capitale?',
      largestCityOf: 'Qual è la città più grande in...?',
      riverCountry: 'In quale Paese scorre questo fiume?',
      flagCountry: 'A quale Paese appartiene questa bandiera?',
      outlineCountry: 'Quale Paese ha questa sagoma?',
      neighborOf: 'Quale Paese confina con...?',
      whereIsCountry: 'Dove si trova questo Paese?',
      whereIsCity: 'Dove si trova questa città?',
      dragContinent: 'Trascina il Paese sul continente giusto:',
      highestMountainOf: 'Qual è la montagna più alta in...?',
    },
    duel: {
      title: '⚔️ Modalità Duello',
      subtitle: 'Due giocatori, un dispositivo - chi ne sa di più?',
      player1Label: '👤 Giocatore 1',
      player2Label: '👤 Giocatore 2',
      player1Placeholder: 'Giocatore 1',
      player2Placeholder: 'Giocatore 2',
      startButton: '⚔️ Inizia il duello',
      backButton: '🏠 Indietro',
      handoffTitle: 'Round completato! 🎉',
      handoffText: 'Passa il dispositivo a {name}!',
      handoffContinue: '▶️ Pronti? Si parte!',
      again: '🔁 Un altro duello',
      winnerLine: '🏆 {name} vince! {msg}',
      loserLine: '{name}: {msg}',
      tieSubMessage: 'Vi intendete entrambi benissimo di geografia!',
    },
    puzzle: {
      title: '🧩 Puzzle dei Paesi',
      subtitle: 'Trascina i Paesi al posto giusto sulla mappa!',
      highscoreLabelWord: 'Record',
      scoreLabelWord: 'Punti',
      revealHint: 'Ecco dove si trovano:',
      resultTitle: '🎉 Round di puzzle completato!',
      resultCorrect: '{correct} di {total} Paesi posizionati correttamente',
      resultScore: 'Punti: {score}',
      resultBest: '🏆 Nuovo record!',
      again: '🔁 Un altro puzzle',
    },
    pause: {
      buttonLabel: 'Pausa',
      title: '⏸️ Pausa',
      resume: '▶️ Continua',
      cancel: '🚪 Esci',
      confirmTitle: 'Vuoi davvero uscire?',
      confirmText: 'I progressi di questo round andranno persi.',
      confirmYes: 'Sì, esci',
      confirmNo: 'No, continua a giocare',
    },
    password: {
      title: '🔒 Password Richiesta',
      placeholder: 'Inserisci la password',
      submit: 'Si parte! 🚀',
      remember: 'Ricorda la password',
      wrong: 'Password errata, riprova!',
    },
    messages: {
      greetings: {
        morning: ['Buongiorno! Pronto per qualche domanda impegnativa? ☀️', 'Buongiorno! Scopriamo il mondo insieme! 🌍'],
        afternoon: ['Che bello vederti! Ti va un quiz? 🌤️', 'Ciao! È il momento di nuove scoperte! 🗺️'],
        evening: ["Buonasera! Un'altra partita di Geo-Quiz? 🌙", 'Ciao! Esploriamo insieme il mondo! ✨'],
      },
      correct: ['Ottimo lavoro! 🎉', 'Fantastico! Te ne intendi! 🌟', 'Esattamente giusto! 👏', 'Wow, forte! 💪', 'Perfetto! Continua così! ✨'],
      wrong: [
        'Nessun problema, la prossima volta ce la farai! 💛',
        'Quasi! La prossima volta ci riesci! 🌈',
        'Non è grave, andiamo avanti! 🙂',
        'Era complicata! Stai imparando! 🌱',
        'Testa alta, stai andando alla grande! 🤗',
      ],
      result: {
        excellent: ['Wow, fantastico! Sei un vero esperto di geografia! 🏆', 'Sensazionale! Quasi tutto giusto! 🌟'],
        good: ['Ottimo lavoro! Te ne intendi davvero! 🎉', 'Bel round! Continua così! 👏'],
        practice: ['Bel tentativo! La pratica rende perfetti! 💪', 'Continua così, migliori ogni volta! 🌱'],
      },
      heartsDepleted: [
        'Nessun problema! I tuoi cuori si riempiranno presto. 💛',
        'Cuori esauriti - ma hai già raccolto un ottimo punteggio! 🌟',
      ],
      duelWin: ['Ottimo lavoro! 🌟', 'Grande prestazione! 👏', 'Wow, davvero forte! 🎉'],
      duelConsolation: [
        "Ottimo impegno! La prossima volta ce la farai di sicuro! 💪",
        'Grande impegno! Continua così! 🌈',
        'Ben fatto - continua ad allenarti e li raggiungerai! 🌱',
      ],
      duelTie: ['🤝 Pareggio! Siete entrambi campioni di geografia!', '🤝 Parità! Ottimo lavoro, entrambi!'],
    },
  },
};

function getLang() {
  return (typeof state !== 'undefined' && state.lang) || DEFAULT_LANG;
}

// Looks up a dot-separated key path (e.g. "duel.winnerLine") in the active
// language, falling back to German if a key is ever missing there.
function tRaw(key) {
  const path = key.split('.');
  let node = I18N[getLang()];
  for (const part of path) {
    node = node && node[part];
  }
  if (node === undefined) {
    node = I18N[DEFAULT_LANG];
    for (const part of path) {
      node = node && node[part];
    }
  }
  return node;
}

function t(key, vars) {
  let str = tRaw(key);
  if (typeof str !== 'string') return str;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
    });
  }
  return str;
}

function tList(key) {
  const list = tRaw(key);
  return Array.isArray(list) ? list : [];
}

function localizedField(entry, field) {
  const lang = getLang();
  if (lang === DEFAULT_LANG) return entry[field];
  return entry[`${field}_${lang}`] || entry[field];
}
