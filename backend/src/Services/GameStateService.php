<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuthUser;
use RuntimeException;

final class GameStateService
{
    public function __construct(
        private readonly string $gameSlug,
        private readonly string $gameName
    ) {
    }

    public function initialState(): array
    {
        return [
            'game_slug' => $this->gameSlug,
            'game_name' => $this->gameName,
            'schema_version' => 2,
            'kingdom' => ['name' => '', 'flag' => null, 'power' => 100, 'population' => 10, 'happiness' => 100],
            'resources' => ['gold' => 500, 'food' => 300, 'wood' => 200, 'stone' => 150],
            'buildings' => $this->buildings(),
            'army' => [],
            'trainingQueue' => [],
            'research' => ['completed' => [], 'inProgress' => null],
            'alliance' => null,
            'lastUpdate' => $this->nowMs(),
            'tutorialCompleted' => false,
            'actionCooldowns' => [],
            'battleReports' => [],
            'isKingdomCreated' => false,
            'lastBattleResult' => null,
            'created_at' => gmdate('Y-m-d H:i:s'),
        ];
    }

    public function applyIntent(array $state, string $intent, array $payload): array
    {
        $state = $this->withDefaults($state);

        return match ($intent) {
            'load', 'save' => $state,
            'create_kingdom' => $this->createKingdom($state, $payload),
            'add_resources' => $this->addResources($state, $payload['resources'] ?? []),
            'subtract_resources' => $this->subtractResources($state, $payload['resources'] ?? []),
            'upgrade_building' => $this->upgradeBuilding($state, $payload),
            'train_unit' => $this->trainUnit($state, $payload),
            'process_training_queue' => $this->processTrainingQueue($state),
            'start_research' => $this->startResearch($state, $payload),
            'complete_research' => $this->completeResearch($state),
            'update_game_time' => $this->updateGameTime($state),
            'attack_kingdom' => $this->attackKingdom($state, $payload),
            default => throw new RuntimeException('Unsupported game intent: ' . $intent),
        };
    }

    public function response(array $save, AuthUser $user): array
    {
        return [
            'user' => $user->toArray(),
            'save' => [
                'id' => $save['id'],
                'slot' => $save['save_slot'],
                'state' => $this->withDefaults($save['state']),
                'metadata' => $save['metadata'],
                'version' => $save['version'],
                'status' => $save['status'],
                'created_at' => $save['created_at'],
                'updated_at' => $save['updated_at'],
            ],
        ];
    }

    private function createKingdom(array $state, array $payload): array
    {
        $name = $payload['name'] ?? null;
        if (!is_string($name) || trim($name) === '') {
            throw new RuntimeException('Kingdom name is required.');
        }

        $state['kingdom']['name'] = substr(trim($name), 0, 20);
        $state['kingdom']['flag'] = isset($payload['flag']) && is_string($payload['flag']) ? $payload['flag'] : null;
        $state['isKingdomCreated'] = true;
        return $state;
    }

    private function upgradeBuilding(array $state, array $payload): array
    {
        $buildingKey = $this->stringPayload($payload, 'buildingKey');
        if (!isset($state['buildings'][$buildingKey])) {
            throw new RuntimeException('Building not found.');
        }

        $building = $state['buildings'][$buildingKey];
        if ((int) $building['level'] >= (int) $building['maxLevel']) {
            throw new RuntimeException('Building is already at maximum level.');
        }

        $cost = $this->buildingUpgradeCost($building);
        $state = $this->subtractResources($state, $cost);
        $state['buildings'][$buildingKey]['level'] = (int) $building['level'] + 1;
        return $state;
    }

    private function trainUnit(array $state, array $payload): array
    {
        $unitType = $this->stringPayload($payload, 'unitType');
        $quantity = $this->positiveInt($payload['quantity'] ?? 1, 'quantity');
        $units = $this->units();
        if (!isset($units[$unitType])) {
            throw new RuntimeException('Unknown unit type.');
        }

        $unit = $units[$unitType];
        $building = $state['buildings'][$unit['building']] ?? null;
        if (!is_array($building) || (int) $building['level'] <= 0) {
            throw new RuntimeException('Required building is not available.');
        }

        $cost = [];
        foreach ($unit['cost'] as $resource => $amount) {
            $cost[$resource] = (int) $amount * $quantity;
        }

        $state = $this->subtractResources($state, $cost);
        $state['trainingQueue'][] = [
            'id' => $unitType . '-' . $this->nowMs(),
            'unitType' => $unitType,
            'quantity' => $quantity,
            'completionTime' => $this->nowMs() + ((int) $unit['trainingTime'] * 1000 * $quantity),
            'building' => $unit['building'],
        ];

        return $state;
    }

    private function processTrainingQueue(array $state): array
    {
        $now = $this->nowMs();
        $remaining = [];
        foreach ($state['trainingQueue'] as $item) {
            if ((int) $item['completionTime'] <= $now) {
                $state['army'][$item['unitType']] = (int) ($state['army'][$item['unitType']] ?? 0) + (int) $item['quantity'];
            } else {
                $remaining[] = $item;
            }
        }
        $state['trainingQueue'] = $remaining;
        return $state;
    }

    private function startResearch(array $state, array $payload): array
    {
        $techKey = $this->stringPayload($payload, 'techKey');
        $techs = $this->technologies();
        if (!isset($techs[$techKey])) {
            throw new RuntimeException('Unknown technology.');
        }
        if ($state['research']['inProgress'] !== null || in_array($techKey, $state['research']['completed'], true)) {
            throw new RuntimeException('Technology cannot be researched now.');
        }

        $state = $this->subtractResources($state, $techs[$techKey]['cost']);
        $state['research']['inProgress'] = $techKey;
        $state['research']['completionTime'] = $this->nowMs() + 60000;
        return $state;
    }

    private function completeResearch(array $state): array
    {
        $techKey = $state['research']['inProgress'];
        if (!is_string($techKey)) {
            return $state;
        }

        $state['research']['completed'][] = $techKey;
        $state['research']['inProgress'] = null;
        unset($state['research']['completionTime']);
        return $state;
    }

    private function updateGameTime(array $state): array
    {
        $state = $this->processTrainingQueue($state);

        if (
            isset($state['research']['completionTime'])
            && (int) $state['research']['completionTime'] <= $this->nowMs()
        ) {
            $state = $this->completeResearch($state);
        }

        $now = $this->nowMs();
        $timeDiff = $now - (int) $state['lastUpdate'];
        if ($timeDiff > 60000) {
            $rates = $this->productionRates($state);
            $multiplier = $timeDiff / 60000;
            $state = $this->addResources($state, [
                'gold' => (int) floor($rates['gold'] * $multiplier),
                'food' => (int) floor($rates['food'] * $multiplier),
                'wood' => (int) floor($rates['wood'] * $multiplier),
                'stone' => (int) floor($rates['stone'] * $multiplier),
            ]);
            $state['lastUpdate'] = $now;
        }

        return $state;
    }

    private function attackKingdom(array $state, array $payload): array
    {
        $enemy = $payload['enemy'] ?? null;
        if (!is_array($enemy) || !isset($enemy['name'], $enemy['power'], $enemy['resources'])) {
            throw new RuntimeException('Enemy kingdom is required.');
        }

        $armyPower = $this->armyPower($state);
        if ($armyPower <= 0) {
            throw new RuntimeException('No army available.');
        }

        $powerRatio = $armyPower / (int) $enemy['power'];
        $adjustedRatio = $powerRatio * (random_int(80, 120) / 100);
        $victory = $adjustedRatio > 1;
        $lootPercent = $victory ? random_int(10, 25) / 100 : random_int(2, 7) / 100;
        $resourcesGained = [];
        foreach (['gold', 'food', 'wood', 'stone'] as $resource) {
            $resourcesGained[$resource] = (int) floor((int) $enemy['resources'][$resource] * $lootPercent);
        }

        $state = $this->addResources($state, $resourcesGained);
        $lossPercent = $victory ? random_int(0, 10) / 100 : random_int(20, 50) / 100;
        $unitsLost = [];
        foreach ($state['army'] as $unitType => $count) {
            $lost = (int) floor((int) $count * $lossPercent);
            if ($lost > 0) {
                $state['army'][$unitType] = max(0, (int) $count - $lost);
                $unitsLost[$unitType] = $lost;
            }
        }

        $report = [
            'id' => 'battle-' . $this->nowMs(),
            'attacker' => $state['kingdom']['name'] ?: 'Your Kingdom',
            'defender' => (string) $enemy['name'],
            'result' => $victory ? 'victory' : 'defeat',
            'resourcesGained' => $resourcesGained,
            'unitsLost' => $unitsLost,
            'timestamp' => $this->nowMs(),
        ];
        array_unshift($state['battleReports'], $report);
        $state['battleReports'] = array_slice($state['battleReports'], 0, 20);
        $state['lastBattleResult'] = $report + ['lossPercentage' => $lossPercent];
        return $state;
    }

    private function addResources(array $state, mixed $resources): array
    {
        if (!is_array($resources)) {
            throw new RuntimeException('Resources payload must be an object.');
        }
        foreach (['gold', 'food', 'wood', 'stone'] as $resource) {
            $state['resources'][$resource] = (int) $state['resources'][$resource] + (int) ($resources[$resource] ?? 0);
        }
        return $state;
    }

    private function subtractResources(array $state, mixed $resources): array
    {
        if (!is_array($resources)) {
            throw new RuntimeException('Resources payload must be an object.');
        }
        foreach (['gold', 'food', 'wood', 'stone'] as $resource) {
            if ((int) $state['resources'][$resource] < (int) ($resources[$resource] ?? 0)) {
                throw new RuntimeException('Insufficient resources.');
            }
        }
        foreach (['gold', 'food', 'wood', 'stone'] as $resource) {
            $state['resources'][$resource] = (int) $state['resources'][$resource] - (int) ($resources[$resource] ?? 0);
        }
        return $state;
    }

    public function buildingUpgradeCost(array $building): array
    {
        $multiplier = 1.5 ** (int) $building['level'];
        return [
            'gold' => (int) floor((int) $building['cost']['gold'] * $multiplier),
            'food' => (int) floor((int) $building['cost']['food'] * $multiplier),
            'wood' => (int) floor((int) $building['cost']['wood'] * $multiplier),
            'stone' => (int) floor((int) $building['cost']['stone'] * $multiplier),
        ];
    }

    private function productionRates(array $state): array
    {
        $rates = ['gold' => 0, 'food' => 0, 'wood' => 0, 'stone' => 0];
        foreach ($state['buildings'] as $key => $building) {
            if (!isset($building['production']) || (int) $building['level'] <= 0) {
                continue;
            }
            $production = (int) $building['production'] * (int) $building['level'];
            if ($key === 'goldMine') {
                $rates['gold'] += $production;
            } elseif ($key === 'farm') {
                $rates['food'] += $production;
            } elseif ($key === 'lumberMill') {
                $rates['wood'] += $production;
            } elseif ($key === 'stoneQuarry') {
                $rates['stone'] += $production;
            }
        }
        if (in_array('agriculture', $state['research']['completed'], true)) {
            $rates['food'] *= 1.5;
        }
        if (in_array('mining', $state['research']['completed'], true)) {
            $rates['gold'] *= 1.4;
            $rates['stone'] *= 1.4;
        }
        return array_map(fn (float|int $value): int => (int) floor($value), $rates);
    }

    private function armyPower(array $state): int
    {
        $total = 0;
        $units = $this->units();
        foreach ($state['army'] as $unitType => $count) {
            if (!isset($units[$unitType])) {
                continue;
            }
            $unit = $units[$unitType];
            $power = (int) $unit['attack'] + (int) $unit['defense'] + (int) $unit['health'];
            if (in_array('ironWorking', $state['research']['completed'], true)) {
                $power *= 1.2;
            }
            $total += (int) floor($power * (int) $count);
        }
        return $total;
    }

    private function withDefaults(array $state): array
    {
        return array_replace_recursive($this->initialState(), $state);
    }

    private function stringPayload(array $payload, string $key): string
    {
        $value = $payload[$key] ?? null;
        if (!is_string($value) || trim($value) === '') {
            throw new RuntimeException($key . ' is required.');
        }
        return $value;
    }

    private function positiveInt(mixed $value, string $name): int
    {
        if (!is_int($value) && !is_float($value)) {
            throw new RuntimeException($name . ' must be numeric.');
        }
        return max(1, (int) $value);
    }

    private function nowMs(): int
    {
        return (int) floor(microtime(true) * 1000);
    }

    private function buildings(): array
    {
        return [
            'townHall' => ['name' => 'Town Hall', 'level' => 1, 'maxLevel' => 10, 'cost' => ['gold' => 0, 'wood' => 0, 'stone' => 0, 'food' => 0], 'effect' => 'Central building that unlocks other structures'],
            'goldMine' => ['name' => 'Gold Mine', 'level' => 0, 'maxLevel' => 8, 'cost' => ['gold' => 100, 'wood' => 50, 'stone' => 30, 'food' => 0], 'production' => 10],
            'farm' => ['name' => 'Farm', 'level' => 0, 'maxLevel' => 8, 'cost' => ['gold' => 80, 'wood' => 40, 'stone' => 20, 'food' => 0], 'production' => 8],
            'lumberMill' => ['name' => 'Lumber Mill', 'level' => 0, 'maxLevel' => 8, 'cost' => ['gold' => 90, 'wood' => 30, 'stone' => 40, 'food' => 0], 'production' => 6],
            'stoneQuarry' => ['name' => 'Stone Quarry', 'level' => 0, 'maxLevel' => 8, 'cost' => ['gold' => 120, 'wood' => 60, 'stone' => 20, 'food' => 0], 'production' => 4],
            'barracks' => ['name' => 'Barracks', 'level' => 0, 'maxLevel' => 6, 'cost' => ['gold' => 200, 'wood' => 100, 'stone' => 80, 'food' => 0], 'effect' => 'Trains infantry units'],
            'archeryRange' => ['name' => 'Archery Range', 'level' => 0, 'maxLevel' => 6, 'cost' => ['gold' => 180, 'wood' => 120, 'stone' => 60, 'food' => 0], 'effect' => 'Trains ranged units'],
            'stable' => ['name' => 'Stable', 'level' => 0, 'maxLevel' => 6, 'cost' => ['gold' => 300, 'wood' => 80, 'stone' => 100, 'food' => 0], 'effect' => 'Trains cavalry units'],
            'walls' => ['name' => 'Walls', 'level' => 0, 'maxLevel' => 8, 'cost' => ['gold' => 150, 'wood' => 200, 'stone' => 150, 'food' => 0], 'defense' => 20],
            'watchtower' => ['name' => 'Watchtower', 'level' => 0, 'maxLevel' => 5, 'cost' => ['gold' => 100, 'wood' => 80, 'stone' => 120, 'food' => 0], 'defense' => 15],
        ];
    }

    private function units(): array
    {
        return [
            'soldier' => ['name' => 'Soldier', 'attack' => 10, 'defense' => 8, 'health' => 25, 'cost' => ['gold' => 20, 'food' => 10], 'trainingTime' => 30, 'building' => 'barracks'],
            'spearman' => ['name' => 'Spearman', 'attack' => 12, 'defense' => 15, 'health' => 30, 'cost' => ['gold' => 30, 'food' => 15], 'trainingTime' => 45, 'building' => 'barracks'],
            'archer' => ['name' => 'Archer', 'attack' => 15, 'defense' => 5, 'health' => 20, 'cost' => ['gold' => 25, 'food' => 12], 'trainingTime' => 35, 'building' => 'archeryRange'],
            'crossbowman' => ['name' => 'Crossbowman', 'attack' => 20, 'defense' => 8, 'health' => 25, 'cost' => ['gold' => 40, 'food' => 18], 'trainingTime' => 50, 'building' => 'archeryRange'],
            'knight' => ['name' => 'Knight', 'attack' => 25, 'defense' => 20, 'health' => 50, 'cost' => ['gold' => 80, 'food' => 30], 'trainingTime' => 90, 'building' => 'stable'],
        ];
    }

    private function technologies(): array
    {
        return [
            'ironWorking' => ['name' => 'Iron Working', 'cost' => ['gold' => 500, 'stone' => 200], 'effect' => 'Increases all unit attack by 20%'],
            'masonry' => ['name' => 'Masonry', 'cost' => ['gold' => 400, 'stone' => 300], 'effect' => 'Increases building defense by 30%'],
            'agriculture' => ['name' => 'Agriculture', 'cost' => ['gold' => 300, 'wood' => 150], 'effect' => 'Increases food production by 50%'],
            'mining' => ['name' => 'Mining', 'cost' => ['gold' => 350, 'stone' => 200], 'effect' => 'Increases gold and stone production by 40%'],
        ];
    }
}
