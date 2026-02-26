// ==================== SAMPLE DATA (Based on xyz.json schema) ====================
const sampleData = {
  users: {
    _id: "user_001",
    username: "student_learner",
    email: "learner@example.com"
  },
  decks: [
    {
      _id: "deck_001",
      userId: "user_001",
      title: "Biology 101",
      description: "Introduction to cells and organelles",
      cards: [
        { _id: "card_001", deckId: "deck_001", front: "What is the powerhouse of the cell?", back: "Mitochondria", box: 1 },
        { _id: "card_002", deckId: "deck_001", front: "What is the cell's nucleus?", back: "The control center containing DNA", box: 1 },
        { _id: "card_003", deckId: "deck_001", front: "What organelle makes protein?", back: "Ribosome", box: 1 },
        { _id: "card_004", deckId: "deck_001", front: "What is the cell's outer layer?", back: "Cell membrane", box: 1 },
        { _id: "card_005", deckId: "deck_001", front: "What stores water in plant cells?", back: "Vacuole", box: 1 }
      ]
    },
    {
      _id: "deck_002",
      userId: "user_001",
      title: "World Capitals",
      description: "Test your geography knowledge",
      cards: [
        { _id: "card_006", deckId: "deck_002", front: "What is the capital of France?", back: "Paris", box: 1 },
        { _id: "card_007", deckId: "deck_002", front: "What is the capital of Japan?", back: "Tokyo", box: 1 },
        { _id: "card_008", deckId: "deck_002", front: "What is the capital of Australia?", back: "Canberra", box: 1 },
        { _id: "card_009", deckId: "deck_002", front: "What is the capital of Brazil?", back: "Brasília", box: 1 },
        { _id: "card_010", deckId: "deck_002", front: "What is the capital of Canada?", back: "Ottawa", box: 1 },
        { _id: "card_011", deckId: "deck_002", front: "What is the capital of Egypt?", back: "Cairo", box: 1 }
      ]
    },
    {
      _id: "deck_003",
      userId: "user_001",
      title: "Programming Basics",
      description: "Essential programming concepts",
      cards: [
        { _id: "card_012", deckId: "deck_003", front: "What does HTML stand for?", back: "HyperText Markup Language", box: 1 },
        { _id: "card_013", deckId: "deck_003", front: "What does CSS stand for?", back: "Cascading Style Sheets", box: 1 },
        { _id: "card_014", deckId: "deck_003", front: "What is a variable?", back: "A container for storing data values", box: 1 },
        { _id: "card_015", deckId: "deck_003", front: "What is a function?", back: "A reusable block of code that performs a specific task", box: 1 },
        { _id: "card_016", deckId: "deck_003", front: "What is an array?", back: "A data structure that stores multiple values", box: 1 }
      ]
    }
  ]
};

// ==================== APP STATE ====================
const appState = {
  currentDeck: null,
  currentCardIndex: 0,
  cards: [],
  correctCount: 0,
  incorrectCount: 0,
  cardProgress: {}, // cardId -> { box: number, lastReviewed: Date }
  studyQueue: []
};

// ==================== DOM ELEMENTS ====================
const screens = {
  deckSelection: document.getElementById('deck-selection'),
  studySession: document.getElementById('study-session'),
  results: document.getElementById('results-screen')
};

const elements = {
  deckList: document.getElementById('deck-list'),
  flashcard: document.getElementById('flashcard'),
  cardFront: document.getElementById('card-front-text'),
  cardBack: document.getElementById('card-back-text'),
  currentCardNum: document.getElementById('current-card-num'),
  totalCardCount: document.getElementById('total-card-count'),
  correctCount: document.getElementById('correct-count'),
  incorrectCount: document.getElementById('incorrect-count'),
  totalCards: document.getElementById('total-cards'),
  masteredCards: document.getElementById('mastered-cards'),
  learningCards: document.getElementById('learning-cards'),
  finalScore: document.getElementById('final-score'),
  reviewedCount: document.getElementById('reviewed-count'),
  masteredCount: document.getElementById('mastered-count'),
  reviewCount: document.getElementById('review-count'),
  btnForgot: document.getElementById('btn-forgot'),
  btnRemembered: document.getElementById('btn-remembered'),
  btnBack: document.getElementById('back-to-decks'),
  btnStudyAgain: document.getElementById('btn-study-again'),
  btnGoHome: document.getElementById('btn-go-home')
};

// ==================== UTILITY FUNCTIONS ====================
function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.add('hidden'));
  screens[screenName].classList.remove('hidden');
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateProgress() {
  const allCards = sampleData.decks.flatMap(deck => deck.cards);
  let mastered = 0;
  let learning = 0;

  allCards.forEach(card => {
    const progress = appState.cardProgress[card._id];
    if (progress && progress.box >= 3) {
      mastered++;
    } else {
      learning++;
    }
  });

  return { total: allCards.length, mastered, learning };
}

// ==================== DECK SELECTION ====================
function renderDeckList() {
  elements.deckList.innerHTML = '';

  sampleData.decks.forEach(deck => {
    const deckCard = document.createElement('div');
    deckCard.className = 'deck-card';
    deckCard.innerHTML = `
      <h3>${deck.title}</h3>
      <p>${deck.description}</p>
      <span class="card-count">${deck.cards.length} cards</span>
    `;
    deckCard.addEventListener('click', () => startStudySession(deck));
    elements.deckList.appendChild(deckCard);
  });

  // Update overall progress
  const progress = calculateProgress();
  elements.totalCards.textContent = progress.total;
  elements.masteredCards.textContent = progress.mastered;
  elements.learningCards.textContent = progress.learning;
}

// ==================== STUDY SESSION ====================
function startStudySession(deck) {
  appState.currentDeck = deck;
  appState.currentCardIndex = 0;
  appState.correctCount = 0;
  appState.incorrectCount = 0;

  // Shuffle cards for study
  appState.cards = shuffleArray(deck.cards);
  appState.studyQueue = [...appState.cards];

  // Update UI
  elements.totalCardCount.textContent = appState.cards.length;
  elements.correctCount.textContent = '0';
  elements.incorrectCount.textContent = '0';

  showScreen('studySession');
  displayCurrentCard();
}

function displayCurrentCard() {
  if (appState.studyQueue.length === 0) {
    showResults();
    return;
  }

  const card = appState.studyQueue[0];
  elements.cardFront.textContent = card.front;
  elements.cardBack.textContent = card.back;
  elements.currentCardNum.textContent = appState.cards.length - appState.studyQueue.length + 1;

  // Reset flip state
  elements.flashcard.classList.remove('is-flipped');
}

function flipCard() {
  elements.flashcard.classList.toggle('is-flipped');
}

function handleResult(success) {
  const currentCard = appState.studyQueue[0];

  if (success) {
    appState.correctCount++;
    elements.correctCount.textContent = appState.correctCount;

    // Update card progress (Spaced Repetition)
    const progress = appState.cardProgress[currentCard._id] || { box: 1 };
    progress.box = Math.min(progress.box + 1, 5); // Max box is 5
    progress.lastReviewed = new Date();
    appState.cardProgress[currentCard._id] = progress;

    // Remove from queue (card mastered for now)
    appState.studyQueue.shift();
  } else {
    appState.incorrectCount++;
    elements.incorrectCount.textContent = appState.incorrectCount;

    // Move card to end of queue for review
    const card = appState.studyQueue.shift();
    appState.studyQueue.push(card);
  }

  // Small delay for visual feedback
  setTimeout(() => {
    displayCurrentCard();
  }, 200);
}

function showResults() {
  const total = appState.correctCount + appState.incorrectCount;
  const score = total > 0 ? Math.round((appState.correctCount / total) * 100) : 0;

  elements.finalScore.textContent = `${score}%`;
  elements.reviewedCount.textContent = total;
  elements.masteredCount.textContent = appState.correctCount;
  elements.reviewCount.textContent = appState.incorrectCount;

  showScreen('results');
}

// ==================== EVENT LISTENERS ====================
// Flashcard click to flip
elements.flashcard.addEventListener('click', flipCard);

// Button handlers
elements.btnForgot.addEventListener('click', () => handleResult(false));
elements.btnRemembered.addEventListener('click', () => handleResult(true));

// Navigation
elements.btnBack.addEventListener('click', () => {
  renderDeckList();
  showScreen('deckSelection');
});

elements.btnStudyAgain.addEventListener('click', () => {
  if (appState.currentDeck) {
    startStudySession(appState.currentDeck);
  }
});

elements.btnGoHome.addEventListener('click', () => {
  renderDeckList();
  showScreen('deckSelection');
});

// ==================== INITIALIZE APP ====================
document.addEventListener('DOMContentLoaded', () => {
  renderDeckList();
  showScreen('deckSelection');
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sampleData, appState };
}
