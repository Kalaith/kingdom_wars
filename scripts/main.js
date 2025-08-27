document.addEventListener('DOMContentLoaded', function() {
  loadGameState();
  if (gameState.kingdom.name) {
    showGameInterface();
    if (!gameState.tutorialCompleted) {
      startTutorial();
    }
  } else {
    showKingdomCreation();
  }
  setupEventListeners();
  startGameLoop();
});

function startGameLoop() {
  setInterval(() => {
    updateResources();
    processTrainingQueue();
    updateUI();
    saveGameState();
    cleanupCooldowns();
  }, 1000);
}
