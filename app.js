// Game Data
const gameData = {
    buildings: {
        townHall: {name: "Town Hall", level: 1, maxLevel: 10, cost: {gold: 0, wood: 0, stone: 0}, effect: "Central building that unlocks other structures"},
        goldMine: {name: "Gold Mine", level: 0, maxLevel: 8, cost: {gold: 100, wood: 50, stone: 30}, production: 10},
        farm: {name: "Farm", level: 0, maxLevel: 8, cost: {gold: 80, wood: 40, stone: 20}, production: 8},
        lumberMill: {name: "Lumber Mill", level: 0, maxLevel: 8, cost: {gold: 90, wood: 30, stone: 40}, production: 6},
        stoneQuarry: {name: "Stone Quarry", level: 0, maxLevel: 8, cost: {gold: 120, wood: 60, stone: 20}, production: 4},
        barracks: {name: "Barracks", level: 0, maxLevel: 6, cost: {gold: 200, wood: 100, stone: 80}, effect: "Trains infantry units"},
        archeryRange: {name: "Archery Range", level: 0, maxLevel: 6, cost: {gold: 180, wood: 120, stone: 60}, effect: "Trains ranged units"},
        stable: {name: "Stable", level: 0, maxLevel: 6, cost: {gold: 300, wood: 80, stone: 100}, effect: "Trains cavalry units"},
        walls: {name: "Walls", level: 0, maxLevel: 8, cost: {gold: 150, wood: 200, stone: 150}, defense: 20},
        watchtower: {name: "Watchtower", level: 0, maxLevel: 5, cost: {gold: 100, wood: 80, stone: 120}, defense: 15}
    },
    units: {
        soldier: {name: "Soldier", attack: 10, defense: 8, health: 25, cost: {gold: 20, food: 10}, trainingTime: 30, building: "barracks"},
        spearman: {name: "Spearman", attack: 12, defense: 15, health: 30, cost: {gold: 30, food: 15}, trainingTime: 45, building: "barracks"},
        archer: {name: "Archer", attack: 15, defense: 5, health: 20, cost: {gold: 25, food: 12}, trainingTime: 35, building: "archeryRange"},
        crossbowman: {name: "Crossbowman", attack: 20, defense: 8, health: 25, cost: {gold: 40, food: 18}, trainingTime: 50, building: "archeryRange"},
        knight: {name: "Knight", attack: 25, defense: 20, health: 50, cost: {gold: 80, food: 30}, trainingTime: 90, building: "stable"}
    },
    technologies: {
        ironWorking: {name: "Iron Working", cost: {gold: 500, stone: 200}, effect: "Increases all unit attack by 20%"},
        masonry: {name: "Masonry", cost: {gold: 400, stone: 300}, effect: "Increases building defense by 30%"},
        agriculture: {name: "Agriculture", cost: {gold: 300, wood: 150}, effect: "Increases food production by 50%"},
        mining: {name: "Mining", cost: {gold: 350, stone: 200}, effect: "Increases gold and stone production by 40%"}
    },
    enemyKingdoms: [
        {name: "Valoria", power: 1250, resources: {gold: 850, food: 620, wood: 430, stone: 380}},
        {name: "Drakmoor", power: 980, resources: {gold: 720, food: 540, wood: 380, stone: 290}},
        {name: "Ironhold", power: 1420, resources: {gold: 950, food: 680, wood: 520, stone: 460}},
        {name: "Thornwall", power: 760, resources: {gold: 480, food: 360, wood: 280, stone: 220}}
    ]
};

// Game State
let gameState = {
    kingdom: {
        name: "",
        flag: null,
        power: 100,
        population: 10,
        happiness: 100
    },
    resources: {
        gold: 500,
        food: 300,
        wood: 200,
        stone: 150
    },
    buildings: JSON.parse(JSON.stringify(gameData.buildings)),
    army: {},
    trainingQueue: [],
    research: {
        completed: [],
        inProgress: null
    },
    alliance: null,
    lastUpdate: Date.now(),
    tutorialCompleted: false,
    actionCooldowns: {}
};

// Tutorial Steps
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

// Initialize Game
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

function setupEventListeners() {
    // Kingdom Creation
    document.getElementById('createKingdomBtn').addEventListener('click', createKingdom);
    document.getElementById('flagUpload').addEventListener('change', handleFlagUpload);
    
    // Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
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
    
    // Start tutorial after a brief delay
    setTimeout(() => {
        if (!gameState.tutorialCompleted) {
            startTutorial();
        }
    }, 1000);
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

// Tutorial System
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
    
    // Switch to appropriate tab
    switchTab(step.tab);
    
    // Show tutorial modal
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

function updateTutorialForTab(tabName) {
    // If tutorial is showing and we're on the right tab, update the step
    const currentStep = tutorialSteps[currentTutorialStep];
    if (currentStep && currentStep.tab === tabName) {
        // Tutorial step matches current tab
    }
}

function updateUI() {
    // Update resources
    document.getElementById('goldAmount').textContent = Math.floor(gameState.resources.gold);
    document.getElementById('foodAmount').textContent = Math.floor(gameState.resources.food);
    document.getElementById('woodAmount').textContent = Math.floor(gameState.resources.wood);
    document.getElementById('stoneAmount').textContent = Math.floor(gameState.resources.stone);
    
    // Update kingdom info
    document.getElementById('kingdomName').textContent = gameState.kingdom.name;
    document.getElementById('kingdomPower').textContent = calculatePower();
    document.getElementById('kingdomTitle').textContent = gameState.kingdom.name;
    document.getElementById('population').textContent = gameState.kingdom.population;
    document.getElementById('happiness').textContent = gameState.kingdom.happiness + '%';
    document.getElementById('totalDefense').textContent = calculateDefense();
    document.getElementById('armySize').textContent = calculateArmySize();
    
    // Update kingdom flag
    if (gameState.kingdom.flag) {
        document.getElementById('kingdomFlagImg').src = gameState.kingdom.flag;
        document.getElementById('kingdomFlagImg').style.display = 'block';
        document.getElementById('defaultFlag').style.display = 'none';
    }
    
    // Update production
    const production = calculateProduction();
    document.getElementById('goldProduction').textContent = production.gold;
    document.getElementById('foodProduction').textContent = production.food;
    document.getElementById('woodProduction').textContent = production.wood;
    document.getElementById('stoneProduction').textContent = production.stone;
}

function calculatePower() {
    let power = 100; // Base power
    
    // Add building power
    Object.values(gameState.buildings).forEach(building => {
        power += building.level * 50;
    });
    
    // Add army power
    Object.entries(gameState.army).forEach(([unitType, count]) => {
        const unit = gameData.units[unitType];
        if (unit) {
            power += count * (unit.attack + unit.defense + unit.health);
        }
    });
    
    return Math.floor(power);
}

function calculateDefense() {
    let defense = 0;
    Object.entries(gameState.buildings).forEach(([key, building]) => {
        if (gameData.buildings[key].defense) {
            defense += building.level * gameData.buildings[key].defense;
        }
    });
    return defense;
}

function calculateArmySize() {
    return Object.values(gameState.army).reduce((total, count) => total + count, 0);
}

function calculateProduction() {
    const production = {gold: 0, food: 0, wood: 0, stone: 0};
    
    if (gameState.buildings.goldMine.level > 0) {
        production.gold = gameState.buildings.goldMine.level * gameData.buildings.goldMine.production;
    }
    if (gameState.buildings.farm.level > 0) {
        production.food = gameState.buildings.farm.level * gameData.buildings.farm.production;
    }
    if (gameState.buildings.lumberMill.level > 0) {
        production.wood = gameState.buildings.lumberMill.level * gameData.buildings.lumberMill.production;
    }
    if (gameState.buildings.stoneQuarry.level > 0) {
        production.stone = gameState.buildings.stoneQuarry.level * gameData.buildings.stoneQuarry.production;
    }
    
    // Apply technology bonuses
    if (gameState.research.completed.includes('agriculture')) {
        production.food = Math.floor(production.food * 1.5);
    }
    if (gameState.research.completed.includes('mining')) {
        production.gold = Math.floor(production.gold * 1.4);
        production.stone = Math.floor(production.stone * 1.4);
    }
    
    return production;
}

function renderBuildings() {
    const buildingsList = document.getElementById('buildingsList');
    buildingsList.innerHTML = '';
    
    Object.entries(gameState.buildings).forEach(([key, building]) => {
        const buildingData = gameData.buildings[key];
        const canUpgrade = building.level < building.maxLevel && canAfford(getUpgradeCost(key));
        
        const buildingCard = document.createElement('div');
        buildingCard.className = `building-card ${!canUpgrade && building.level < building.maxLevel ? 'disabled' : ''}`;
        
        const costHtml = building.level < building.maxLevel ? 
            Object.entries(getUpgradeCost(key)).map(([resource, amount]) => 
                `<div class="cost-item">${getResourceIcon(resource)} ${amount}</div>`
            ).join('') : '';
        
        buildingCard.innerHTML = `
            <div class="building-header">
                <div class="building-name">${building.name}</div>
                <div class="building-level">Lv ${building.level}</div>
            </div>
            <div class="building-description">${buildingData.effect || buildingData.production ? `Production: +${buildingData.production || 0}/min` : 'Special building'}</div>
            ${building.level < building.maxLevel ? `
                <div class="building-cost">${costHtml}</div>
                <div class="building-actions">
                    <button class="btn ${canUpgrade ? 'btn--primary' : 'btn--outline'}" 
                            onclick="upgradeBuilding('${key}')" 
                            ${!canUpgrade ? 'disabled' : ''}>
                        ${building.level === 0 ? 'Build' : 'Upgrade'}
                    </button>
                </div>
            ` : '<div class="text-success">Max Level Reached</div>'}
        `;
        
        buildingsList.appendChild(buildingCard);
    });
}

function getUpgradeCost(buildingKey) {
    const building = gameState.buildings[buildingKey];
    const baseCost = gameData.buildings[buildingKey].cost;
    const multiplier = Math.pow(1.5, building.level);
    
    return {
        gold: Math.floor(baseCost.gold * multiplier),
        wood: Math.floor(baseCost.wood * multiplier),
        stone: Math.floor(baseCost.stone * multiplier)
    };
}

function upgradeBuilding(buildingKey) {
    const cost = getUpgradeCost(buildingKey);
    
    if (!canAfford(cost)) {
        showNotification('Not enough resources!', 'error');
        return;
    }
    
    // Deduct resources
    Object.entries(cost).forEach(([resource, amount]) => {
        gameState.resources[resource] -= amount;
    });
    
    gameState.buildings[buildingKey].level++;
    
    showNotification(`${gameState.buildings[buildingKey].name} upgraded to level ${gameState.buildings[buildingKey].level}!`, 'success');
    renderBuildings();
    updateUI();
    saveGameState();
}

function renderMilitary() {
    renderUnitTraining();
    renderArmy();
    renderTrainingQueue();
}

function renderUnitTraining() {
    const unitTraining = document.getElementById('unitTraining');
    unitTraining.innerHTML = '';
    
    Object.entries(gameData.units).forEach(([key, unit]) => {
        const requiredBuilding = gameState.buildings[unit.building];
        const canTrain = requiredBuilding.level > 0 && canAfford(unit.cost);
        
        const unitCard = document.createElement('div');
        unitCard.className = `unit-card ${!canTrain ? 'disabled' : ''}`;
        
        unitCard.innerHTML = `
            <div class="unit-header">
                <div class="unit-name">${unit.name}</div>
            </div>
            <div class="unit-stats">
                <div class="unit-stat">⚔️ ${unit.attack}</div>
                <div class="unit-stat">🛡️ ${unit.defense}</div>
                <div class="unit-stat">❤️ ${unit.health}</div>
            </div>
            <div class="building-cost">
                ${Object.entries(unit.cost).map(([resource, amount]) => 
                    `<div class="cost-item">${getResourceIcon(resource)} ${amount}</div>`
                ).join('')}
            </div>
            <div class="building-actions">
                <button class="btn ${canTrain ? 'btn--primary' : 'btn--outline'}" 
                        onclick="trainUnit('${key}')" 
                        ${!canTrain ? 'disabled' : ''}>
                    Train (${unit.trainingTime}s)
                </button>
            </div>
            ${requiredBuilding.level === 0 ? `<div class="text-warning">Requires ${gameData.buildings[unit.building].name}</div>` : ''}
        `;
        
        unitTraining.appendChild(unitCard);
    });
}

function trainUnit(unitKey) {
    const unit = gameData.units[unitKey];
    
    if (!canAfford(unit.cost)) {
        showNotification('Not enough resources!', 'error');
        return;
    }
    
    // Deduct resources
    Object.entries(unit.cost).forEach(([resource, amount]) => {
        gameState.resources[resource] -= amount;
    });
    
    // Add to training queue
    gameState.trainingQueue.push({
        unit: unitKey,
        completionTime: Date.now() + (unit.trainingTime * 1000)
    });
    
    showNotification(`${unit.name} training started!`, 'success');
    renderMilitary();
    updateUI();
    saveGameState();
}

function renderArmy() {
    const armyList = document.getElementById('armyList');
    armyList.innerHTML = '';
    
    Object.entries(gameState.army).forEach(([unitType, count]) => {
        if (count > 0) {
            const unit = gameData.units[unitType];
            const armyUnit = document.createElement('div');
            armyUnit.className = 'army-unit';
            armyUnit.innerHTML = `
                <div>${unit.name}</div>
                <div>${count}</div>
            `;
            armyList.appendChild(armyUnit);
        }
    });
    
    if (Object.keys(gameState.army).length === 0 || calculateArmySize() === 0) {
        armyList.innerHTML = '<div class="text-center">No units trained yet</div>';
    }
}

function renderTrainingQueue() {
    const trainingQueue = document.getElementById('trainingQueue');
    trainingQueue.innerHTML = '';
    
    if (gameState.trainingQueue.length === 0) {
        trainingQueue.innerHTML = '<div class="text-center">No units in training</div>';
        return;
    }
    
    gameState.trainingQueue.forEach((item, index) => {
        const unit = gameData.units[item.unit];
        const timeLeft = Math.max(0, item.completionTime - Date.now());
        const queueItem = document.createElement('div');
        queueItem.className = 'queue-item';
        queueItem.innerHTML = `
            <div>${unit.name}</div>
            <div>${Math.ceil(timeLeft / 1000)}s</div>
        `;
        trainingQueue.appendChild(queueItem);
    });
}

function renderResearch() {
    const researchList = document.getElementById('researchList');
    researchList.innerHTML = '';
    
    Object.entries(gameData.technologies).forEach(([key, tech]) => {
        const isCompleted = gameState.research.completed.includes(key);
        const canResearch = !isCompleted && canAfford(tech.cost);
        
        const researchCard = document.createElement('div');
        researchCard.className = `research-card ${isCompleted ? 'completed' : ''} ${!canResearch && !isCompleted ? 'disabled' : ''}`;
        
        researchCard.innerHTML = `
            <div class="research-header">
                <div class="research-name">${tech.name}</div>
                <div class="research-effect">${tech.effect}</div>
            </div>
            ${!isCompleted ? `
                <div class="building-cost">
                    ${Object.entries(tech.cost).map(([resource, amount]) => 
                        `<div class="cost-item">${getResourceIcon(resource)} ${amount}</div>`
                    ).join('')}
                </div>
                <div class="building-actions">
                    <button class="btn ${canResearch ? 'btn--primary' : 'btn--outline'}" 
                            onclick="startResearch('${key}')" 
                            ${!canResearch ? 'disabled' : ''}>
                        Research
                    </button>
                </div>
            ` : '<div class="status status--success">Completed</div>'}
        `;
        
        researchList.appendChild(researchCard);
    });
}

function startResearch(techKey) {
    const tech = gameData.technologies[techKey];
    
    if (!canAfford(tech.cost)) {
        showNotification('Not enough resources!', 'error');
        return;
    }
    
    // Deduct resources
    Object.entries(tech.cost).forEach(([resource, amount]) => {
        gameState.resources[resource] -= amount;
    });
    
    gameState.research.completed.push(techKey);
    
    showNotification(`${tech.name} research completed!`, 'success');
    renderResearch();
    updateUI();
    saveGameState();
}

function renderEnemyKingdoms() {
    const enemyKingdoms = document.getElementById('enemyKingdoms');
    enemyKingdoms.innerHTML = '';
    
    gameData.enemyKingdoms.forEach(enemy => {
        const enemyCard = document.createElement('div');
        enemyCard.className = 'enemy-card';
        
        enemyCard.innerHTML = `
            <div class="enemy-header">
                <div class="enemy-name">${enemy.name}</div>
                <div class="power-rating">⚡ ${enemy.power}</div>
            </div>
            <div class="enemy-resources">
                <div>🏛️ ${enemy.resources.gold}</div>
                <div>🌾 ${enemy.resources.food}</div>
                <div>🪵 ${enemy.resources.wood}</div>
                <div>🪨 ${enemy.resources.stone}</div>
            </div>
            <div class="building-actions">
                <button class="btn btn--secondary" onclick="scoutKingdom('${enemy.name}')">Scout</button>
                <button class="btn btn--primary" onclick="attackKingdom('${enemy.name}')">Attack</button>
            </div>
        `;
        
        enemyKingdoms.appendChild(enemyCard);
    });
}

function scoutKingdom(enemyName) {
    // Add cooldown protection
    const cooldownKey = `scout_${enemyName}`;
    if (isOnCooldown(cooldownKey)) {
        showNotification('Please wait before scouting again', 'warning');
        return;
    }
    
    setCooldown(cooldownKey, 3000); // 3 second cooldown
    showNotification(`Scouting ${enemyName}... Intelligence gathered!`, 'success');
}

function attackKingdom(enemyName) {
    // Add cooldown protection
    const cooldownKey = `attack_${enemyName}`;
    if (isOnCooldown(cooldownKey)) {
        showNotification('Your army is still recovering from the last battle', 'warning');
        return;
    }
    
    const enemy = gameData.enemyKingdoms.find(k => k.name === enemyName);
    if (!enemy) return;
    
    const armySize = calculateArmySize();
    if (armySize === 0) {
        showNotification('You need an army to attack!', 'error');
        return;
    }
    
    setCooldown(cooldownKey, 10000); // 10 second cooldown
    
    // Simple battle calculation
    const playerPower = calculatePower();
    const enemyPower = enemy.power;
    
    const battleResult = simulateBattle(playerPower, enemyPower);
    showBattleReport(enemyName, battleResult);
    
    if (battleResult.victory) {
        // Award resources
        const loot = {
            gold: Math.floor(enemy.resources.gold * 0.3),
            food: Math.floor(enemy.resources.food * 0.2),
            wood: Math.floor(enemy.resources.wood * 0.2),
            stone: Math.floor(enemy.resources.stone * 0.2)
        };
        
        Object.entries(loot).forEach(([resource, amount]) => {
            gameState.resources[resource] += amount;
        });
        
        showNotification(`Victory! You've raided ${enemyName} for resources!`, 'success');
    } else {
        showNotification(`Defeat! Your attack on ${enemyName} failed.`, 'error');
    }
    
    updateUI();
    saveGameState();
}

function isOnCooldown(key) {
    const cooldown = gameState.actionCooldowns[key];
    return cooldown && Date.now() < cooldown;
}

function setCooldown(key, duration) {
    gameState.actionCooldowns[key] = Date.now() + duration;
}

function simulateBattle(playerPower, enemyPower) {
    const playerAdvantage = playerPower / (playerPower + enemyPower);
    const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    
    return {
        victory: (playerAdvantage * randomFactor) > 0.5,
        playerLosses: Math.floor(Math.random() * 20) + 5,
        enemyLosses: Math.floor(Math.random() * 30) + 10
    };
}

function showBattleReport(enemyName, result) {
    const modal = document.getElementById('battleModal');
    const report = document.getElementById('battleReport');
    
    report.innerHTML = `
        <h4>Battle vs ${enemyName}</h4>
        <div class="battle-result ${result.victory ? 'text-success' : 'text-error'}">
            ${result.victory ? '🎉 VICTORY!' : '💀 DEFEAT!'}
        </div>
        <div class="battle-details">
            <p>Your losses: ${result.playerLosses} units</p>
            <p>Enemy losses: ${result.enemyLosses} units</p>
            ${result.victory ? '<p class="text-success">Resources have been added to your treasury!</p>' : ''}
        </div>
        <button class="btn btn--primary" onclick="closeBattleModal()">Close</button>
    `;
    
    modal.classList.add('active');
}

function closeBattleModal() {
    document.getElementById('battleModal').classList.remove('active');
}

function canAfford(cost) {
    return Object.entries(cost).every(([resource, amount]) => 
        gameState.resources[resource] >= amount
    );
}

function getResourceIcon(resource) {
    const icons = {
        gold: '🏛️',
        food: '🌾',
        wood: '🪵',
        stone: '🪨'
    };
    return icons[resource] || '❓';
}

function showNotification(message, type = 'info') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notifications.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function startGameLoop() {
    setInterval(() => {
        updateResources();
        processTrainingQueue();
        updateUI();
        saveGameState();
        cleanupCooldowns();
    }, 1000);
}

function updateResources() {
    const production = calculateProduction();
    const timeDelta = 1; // 1 second
    
    gameState.resources.gold += production.gold * timeDelta / 60;
    gameState.resources.food += production.food * timeDelta / 60;
    gameState.resources.wood += production.wood * timeDelta / 60;
    gameState.resources.stone += production.stone * timeDelta / 60;
    
    // Cap resources at 10000
    Object.keys(gameState.resources).forEach(resource => {
        gameState.resources[resource] = Math.min(gameState.resources[resource], 10000);
    });
}

function processTrainingQueue() {
    const now = Date.now();
    const completed = [];
    
    gameState.trainingQueue.forEach((item, index) => {
        if (item.completionTime <= now) {
            completed.push(index);
            
            // Add unit to army
            if (!gameState.army[item.unit]) {
                gameState.army[item.unit] = 0;
            }
            gameState.army[item.unit]++;
            
            const unit = gameData.units[item.unit];
            showNotification(`${unit.name} training completed!`, 'success');
        }
    });
    
    // Remove completed items (in reverse order to maintain indices)
    completed.reverse().forEach(index => {
        gameState.trainingQueue.splice(index, 1);
    });
    
    if (completed.length > 0) {
        renderMilitary();
    }
}

function cleanupCooldowns() {
    const now = Date.now();
    Object.keys(gameState.actionCooldowns).forEach(key => {
        if (gameState.actionCooldowns[key] < now) {
            delete gameState.actionCooldowns[key];
        }
    });
}

function saveGameState() {
    try {
        gameState.lastUpdate = Date.now();
        const gameDataString = JSON.stringify(gameState);
        // Using a simple in-memory storage since localStorage is not available
        window.savedGameState = gameState;
    } catch (error) {
        console.error('Failed to save game state:', error);
    }
}

function loadGameState() {
    try {
        if (window.savedGameState) {
            gameState = { ...gameState, ...window.savedGameState };
        }
    } catch (error) {
        console.error('Failed to load game state:', error);
    }
}