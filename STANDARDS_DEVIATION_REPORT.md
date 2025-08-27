# Kingdom Wars - Standards Deviation Report

## ⚠️ Compliance Status: **HIGH NON-COMPLIANCE (60%)**

This project has good React/TypeScript foundation but requires significant cleanup to meet WebHatchery design standards.

## 🔄 Positive Compliance Areas

### ✅ Correctly Implemented
- **Frontend Stack**: React 19+ with TypeScript ✅
- **Build System**: Vite 6.x with proper configuration ✅
- **Styling**: Tailwind CSS 4.x implementation ✅
- **State Management**: Zustand with persistence ✅
- **Linting**: ESLint configuration present ✅
- **Project Structure**: Basic React structure follows standards ✅

## 🚨 Critical Issues Requiring Immediate Action

### 1. Dual Architecture Violation (CRITICAL)
- **Problem**: Maintains both React frontend AND legacy vanilla JavaScript in `/scripts/`
- **Impact**: Violates single-source-of-truth principle, creates maintenance burden
- **Files to Remove**: 
  ```
  scripts/
  ├── events.js
  ├── gameData.js
  ├── gameLogic.js
  ├── gameState.js
  ├── main.js
  ├── tutorial.js
  └── ui.js
  ```

### 2. Legacy HTML Files at Root (HIGH)
- **Problem**: `index.html` at root suggests dual entry points
- **Impact**: Confusing deployment, unclear which version is canonical
- **Action**: Remove root `index.html`, use only Vite-generated version

### 3. Mixed CSS Architecture (MEDIUM)
- **Problem**: Custom CSS files alongside Tailwind:
  ```
  styles/
  ├── base.css
  ├── components.css
  ├── game-specific.css
  ├── layout.css
  └── themes.css
  ```
- **Standard**: Use only Tailwind classes with minimal custom CSS in `/src/styles/globals.css`

## 🔧 Required Changes

### Phase 1: Remove Legacy Code (CRITICAL - Week 1)

**Files to Delete Immediately:**
```bash
# Remove legacy JavaScript files
rm -rf scripts/
rm -rf styles/  # Keep only Tailwind
rm index.html   # Use Vite version only
rm style.css    # Legacy styles
```

**Current problematic dual structure:**
```
kingdom_wars/
├── index.html                    # ❌ REMOVE - Conflicts with frontend/dist/
├── style.css                     # ❌ REMOVE - Use Tailwind only
├── scripts/                      # ❌ REMOVE - All legacy JS
├── styles/                       # ❌ REMOVE - Use Tailwind classes
└── frontend/                     # ✅ KEEP - This is correct
    ├── src/
    └── dist/
```

### Phase 2: Fix Missing Package.json Scripts (HIGH)

**Current package.json (Missing script):**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
    // ❌ MISSING: "type-check": "tsc --noEmit"
  }
}
```

**Required addition:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"  // ✅ ADD THIS
  }
}
```

### Phase 3: Complete Frontend Directory Structure (MEDIUM)

**Current incomplete structure:**
```
frontend/src/
├── App.tsx                       # ✅ Present
├── components/                   # ✅ Present 
├── data/                         # ✅ Present
├── stores/                       # ✅ Present
├── types/                        # ✅ Present
├── hooks/                        # ❌ MISSING - Empty directory
├── utils/                        # ❌ MISSING - Empty directory
└── styles/                       # ❌ MISSING - Need globals.css
```

**Required additions:**
```typescript
// src/hooks/useGameLoop.ts - REQUIRED
export const useGameLoop = () => {
  const { 
    advanceTime, 
    processEvents, 
    updateResources 
  } = useGameStore();
  
  useEffect(() => {
    const interval = setInterval(() => {
      advanceTime();
      processEvents();
      updateResources();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [advanceTime, processEvents, updateResources]);
};

// src/hooks/useWarfare.ts - REQUIRED  
export const useWarfare = () => {
  const { 
    kingdoms, 
    attackKingdom, 
    defendKingdom 
  } = useGameStore();
  
  const initiateBattle = useCallback((attackerId: string, defenderId: string) => {
    const attacker = kingdoms.find(k => k.id === attackerId);
    const defender = kingdoms.find(k => k.id === defenderId);
    
    if (!attacker || !defender) return;
    
    const battleResult = calculateBattleOutcome(attacker, defender);
    return battleResult;
  }, [kingdoms]);
  
  return { initiateBattle };
};

// src/utils/calculations.ts - REQUIRED
export const calculateKingdomPower = (kingdom: Kingdom): number => {
  return kingdom.military.reduce((total, unit) => 
    total + (unit.strength * unit.count), 0
  );
};

export const calculateResourceProduction = (
  kingdom: Kingdom, 
  timeElapsed: number
): ResourceGains => {
  return {
    gold: kingdom.buildings.mines * 10 * timeElapsed,
    food: kingdom.buildings.farms * 15 * timeElapsed,
    population: Math.floor(kingdom.happiness / 10) * timeElapsed
  };
};

// src/styles/globals.css - REQUIRED
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Game-specific animations only */
@keyframes battleFlash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.battle-animation {
  animation: battleFlash 0.5s ease-in-out 3;
}
```

### Phase 4: Zustand Store Enhancement (MEDIUM)

**Current store needs enhancement for warfare mechanics:**
```typescript
// Enhance existing gameStore.ts
interface KingdomWarfareState {
  activeBattles: Battle[];
  warHistory: WarEvent[];
  alliances: Alliance[];
  diplomaticStatus: Record<string, DiplomaticRelation>;
}

interface KingdomWarfareActions {
  declareBattle: (attackerId: string, defenderId: string) => void;
  resolveBattle: (battleId: string) => BattleResult;
  formAlliance: (kingdom1Id: string, kingdom2Id: string) => void;
  breakAlliance: (allianceId: string) => void;
  updateDiplomaticStatus: (kingdom1Id: string, kingdom2Id: string, status: DiplomaticRelation) => void;
}

// Add to existing store
export const useGameStore = create<GameState & GameActions & KingdomWarfareState & KingdomWarfareActions>()(
  persist(
    (set, get) => ({
      // ... existing state
      activeBattles: [],
      warHistory: [],
      alliances: [],
      diplomaticStatus: {},
      
      // ... existing actions
      declareBattle: (attackerId, defenderId) => {
        const battle = createBattle(attackerId, defenderId);
        set(state => ({
          activeBattles: [...state.activeBattles, battle]
        }));
      },
      
      resolveBattle: (battleId) => {
        const { activeBattles } = get();
        const battle = activeBattles.find(b => b.id === battleId);
        if (!battle) return null;
        
        const result = simulateBattle(battle);
        set(state => ({
          activeBattles: state.activeBattles.filter(b => b.id !== battleId),
          warHistory: [...state.warHistory, result.event]
        }));
        return result;
      }
    }),
    { name: 'kingdom-wars-storage' }
  )
);
```

## 📋 Migration Checklist

### Immediate Actions (Week 1) - CRITICAL
- [ ] **DELETE** all files in `/scripts/` directory
- [ ] **DELETE** all files in `/styles/` directory  
- [ ] **DELETE** root `index.html` and `style.css`
- [ ] **ADD** `type-check` script to package.json
- [ ] **TEST** that React app still works after legacy removal

### Structure Completion (Week 2) - HIGH
- [ ] **CREATE** missing hook files in `/src/hooks/`
- [ ] **CREATE** utility functions in `/src/utils/`
- [ ] **CREATE** proper `/src/styles/globals.css`
- [ ] **ENHANCE** Zustand store with missing warfare mechanics
- [ ] **VERIFY** all imports resolve correctly

### Standards Compliance (Week 3) - MEDIUM
- [ ] **AUDIT** all components for proper TypeScript typing
- [ ] **REPLACE** any remaining custom CSS with Tailwind classes
- [ ] **TEST** all game mechanics work in React version
- [ ] **REMOVE** any unused dependencies
- [ ] **UPDATE** README.md with proper setup instructions

### Final Validation (Week 4) - LOW
- [ ] **RUN** `npm run type-check` with zero errors
- [ ] **RUN** `npm run lint` with zero errors
- [ ] **TEST** full game functionality
- [ ] **VERIFY** deployment works with updated publish.ps1

## ⚠️ Migration Risk Assessment

### LOW RISK
- Most React infrastructure already correct
- Game logic already in TypeScript
- State management already using Zustand

### MEDIUM RISK
- Removing legacy files might break some functionality
- Need to verify all game features work post-cleanup
- CSS migration to pure Tailwind needs testing

### MITIGATION STRATEGY
1. Create backup before deleting legacy files
2. Test functionality after each deletion step
3. Migrate CSS styles gradually to ensure visual parity

## 🎯 Success Criteria

- [ ] Zero legacy JavaScript files remain
- [ ] Single source of truth (React frontend only)
- [ ] All required package.json scripts present
- [ ] Complete directory structure with all required files
- [ ] 100% TypeScript compliance
- [ ] Zero ESLint errors
- [ ] Pure Tailwind CSS styling (minimal custom CSS)

**Estimated Migration Time**: 3-4 weeks part-time development
**Priority Level**: HIGH - Good foundation but needs cleanup

**Note**: This project is closest to compliance and should be prioritized as a "quick win" to establish the migration pattern for other projects.