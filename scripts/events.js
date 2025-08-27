function setupEventListeners() {
  document.getElementById('createKingdomBtn').addEventListener('click', createKingdom);
  document.getElementById('flagUpload').addEventListener('change', handleFlagUpload);
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
  // ...other event listeners
}

function createKingdom() {
  const nameInput = document.getElementById('kingdomNameInput');
  const name = nameInput.value.trim();
  if (!name) {
    showNotification('Please enter a kingdom name', 'error');
    return;
  }
  gameState.kingdom.name = name;
  saveGameState();
  showGameInterface();
  showNotification(`Welcome to ${name}! Your kingdom has been established.`, 'success');
}

function handleFlagUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const flagPreview = document.getElementById('flagPreview');
      flagPreview.innerHTML = `<img src="${e.target.result}" alt="Kingdom Flag">`;
      gameState.kingdom.flag = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');

  // Update tutorial if active
  if (tutorialActive) {
    updateTutorialForTab(tabName);
  }
}

function showKingdomCreation() {
  document.getElementById('kingdomCreation').classList.add('active');
  document.getElementById('gameInterface').classList.remove('active');
  document.getElementById('resourceBar').style.display = 'none';
}

function showGameInterface() {
  document.getElementById('kingdomCreation').classList.remove('active');
  document.getElementById('gameInterface').classList.add('active');
  document.getElementById('resourceBar').style.display = 'flex';

  updateUI();
  renderBuildings();
  renderMilitary();
  renderResearch();
  renderEnemyKingdoms();
}
