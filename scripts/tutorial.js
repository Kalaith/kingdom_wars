const tutorialSteps = [
  {
    title: "Welcome to Kingdom Wars!",
    content: "You've just established your kingdom. Let's learn the basics of managing your realm.",
    tab: "kingdom"
  },
  {
    title: "Resource Management",
    content: "Your kingdom needs resources to grow. Gold, Food, Wood, and Stone are essential. Watch them in the top bar.",
    tab: "kingdom"
  },
  {
    title: "Building Your Kingdom",
    content: "Go to the Buildings tab to construct and upgrade buildings. Start with resource generators like Gold Mine and Farm.",
    tab: "buildings"
  },
  {
    title: "Training Your Army",
    content: "Visit the Military tab to train units. You'll need the Barracks to train infantry units first.",
    tab: "military"
  },
  {
    title: "Research Technologies",
    content: "The Research tab unlocks powerful technologies that boost your kingdom's capabilities.",
    tab: "research"
  },
  {
    title: "Conquest and Glory",
    content: "Once you have an army, attack other kingdoms in the Attack tab to raid their resources and gain power!",
    tab: "attack"
  }
];

let currentTutorialStep = 0;
let tutorialActive = false;

function startTutorial() {
  tutorialActive = true;
  currentTutorialStep = 0;
  showTutorialStep();
}

function showTutorialStep() {
  if (currentTutorialStep >= tutorialSteps.length) {
    completeTutorial();
    return;
  }
  const step = tutorialSteps[currentTutorialStep];
  switchTab(step.tab);
  showTutorialModal(step);
}

function showTutorialModal(step) {
  const modal = document.getElementById('battleModal');
  const report = document.getElementById('battleReport');

  report.innerHTML = `
    <div class="tutorial-step">
      <h4>📚 Tutorial: Step ${currentTutorialStep + 1} of ${tutorialSteps.length}</h4>
      <h5>${step.title}</h5>
      <p>${step.content}</p>
      <div class="tutorial-actions">
        <button class="btn btn--secondary" onclick="skipTutorial()">Skip Tutorial</button>
        <button class="btn btn--primary" onclick="nextTutorialStep()">
          ${currentTutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function nextTutorialStep() {
  currentTutorialStep++;
  closeBattleModal();

  setTimeout(() => {
    showTutorialStep();
  }, 500);
}

function skipTutorial() {
  completeTutorial();
  closeBattleModal();
}

function completeTutorial() {
  tutorialActive = false;
  gameState.tutorialCompleted = true;
  saveGameState();
  showNotification('Tutorial completed! You are now ready to build your empire!', 'success');
}
