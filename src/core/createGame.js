import * as THREE from 'three';

import { createIsland } from '../world/island.js';
import { createEnvironment } from '../world/environment.js';

import { createPlayer } from '../entities/createPlayer.js';
import { createEnemy } from '../entities/createEnemy.js';

import { createInput } from '../systems/createInput.js';
import { updatePlayerMovement } from '../systems/updatePlayerMovement.js';
import { updateEnemies } from '../systems/updateEnemies.js';

import { updateCombat } from '../systems/updateCombat.js';

import { createDrop } from '../entities/createDrop.js';
import { createInventory } from '../systems/createInventory.js';
import { updateDrops } from '../systems/updateDrops.js';

import { createInventoryUI } from '../ui/createInventoryUI.js';

import { updateEnemyDrops } from '../systems/updateEnemyDrops.js';

import { createEventBus } from './createEventBus.js';
import { createQuestManager } from '../quests/createQuestManager.js';

import { createNpc } from '../entities/createNpc.js';
import { createWallet } from '../systems/createWallet.js';

import { createDialogueUI } from '../ui/createDialogueUI.js';

import { updateNpcInteraction } from '../systems/updateNpcInteraction.js';
import { createNpcDialogue } from '../dialogue/createNpcDialogue.js';

import { createNpcQuestMarker } from '../ui/createNpcQuestMarker.js';
import { createQuestLogUI } from '../ui/createQuestLogUI.js';
import { createQuestNotifications } from '../ui/createQuestNotifications.js';
export function createGame(container) {
	const scene = new THREE.Scene();

	scene.background = new THREE.Color(0x1a2230);
	scene.fog = new THREE.Fog(0x1a2230, 45, 105);

	const camera = new THREE.PerspectiveCamera(
		55,
		window.innerWidth / window.innerHeight,
		0.1,
		250
	);

	camera.position.set(22, 25, 28);
	camera.lookAt(0, 0, 0);

	const renderer = new THREE.WebGLRenderer({ antialias: true });

	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setSize(window.innerWidth, window.innerHeight);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputColorSpace = THREE.SRGBColorSpace;

	container.prepend(renderer.domElement);

	scene.add(new THREE.HemisphereLight(0x9ab0cc, 0x2a3a2a, 1.15));

	const sun = new THREE.DirectionalLight(0xffd9a0, 2.0);

	sun.position.set(20, 30, 10);
	sun.castShadow = true;
	sun.shadow.mapSize.set(2048, 2048);

	sun.shadow.camera.left = -55;
	sun.shadow.camera.right = 55;
	sun.shadow.camera.top = 55;
	sun.shadow.camera.bottom = -55;

	scene.add(sun);

	const island = createIsland(scene, { radius: 38 });

	const environment = createEnvironment(scene, {
		attempts: 65,
		innerRadius: 8,
		outerRadius: 32,
		treeChance: 0.78,
		seed: 2026,
	});

	// Player
	const player = createPlayer(scene, { x: 0, z: 0 });

	const npc = createNpc(scene, {
		x: 2,
		z: 5,
	});

	// const enemies = [
	// 	createEnemy(scene, { x: 8, z: -8 }),
	// 	createEnemy(scene, { x: -12, z: 5 }),
	// 	createEnemy(scene, { x: 15, z: 10 }),
	// ];

	const enemies = [];

	// Input
	const input = createInput();

	const inventory = createInventory();
	const wallet = createWallet();
	const inventoryUI = createInventoryUI(inventory);

	const dialogueUI = createDialogueUI();

	// dialogueUI.open({
	// 	speaker: 'Village Elder',
	// 	text: 'The wolves have become a serious threat to our settlement. Will you help us?',
	// 	choices: [
	// 		{ id: 'accept', text: 'I will help you.' },
	// 		{ id: 'refuse', text: 'Not now.' },
	// 	],
	// 	onChoice: choiceId => {
	// 		console.log('Selected dialogue choice:', choiceId);
	// 		dialogueUI.close();
	// 	},
	// });

	const drops = [
		// createDrop(scene, {
		// 	x: 3,
		// 	z: 3,
		// 	itemId: 'wolf_fang',
		// 	amount: 1,
		// }),
		// createDrop(scene, {
		// 	x: 4,
		// 	z: 3,
		// 	itemId: 'wolf_pelt',
		// 	amount: 2,
		// }),
	];

	const events = createEventBus();
	const questManager = createQuestManager(events, {
		inventory,
		wallet,
	});

	const npcQuestMarker = createNpcQuestMarker(npc, questManager, events);

	const questLogUI = createQuestLogUI(questManager, events);

	const questNotifications = createQuestNotifications(events, questManager);

	const wolfSpawnPoints = [
		{ x: 12, z: -10 },
		{ x: -14, z: -9 },
		{ x: 18, z: 8 },
		{ x: -16, z: 14 },
		{ x: 3, z: -18 },
	];

	const unsubscribeQuestAccepted = events.on(
		'quest:accepted',
		({ questId }) => {
			if (questId === 'wolf_hunt') {
				for (const position of wolfSpawnPoints) {
					const enemy = createEnemy(scene, position);

					enemy.type = 'wolf';
					enemies.push(enemy);
				}
			}

			if (questId === 'wolf_chief') {
				const boss = createEnemy(scene, {
					x: -8,
					z: -18,
				});

				boss.type = 'wolf_chief';
				boss.hp = 150;
				boss.maxHp = 150;

				enemies.push(boss);
			}
		}
	);

	const npcDialogue = createNpcDialogue({
		dialogueUI,
		questManager,
	});

	// Time tracking
	const clock = new THREE.Clock();

	// Camera follow
	// const cameraOffset = new THREE.Vector3(18, 20, 22);
	const cameraOffset = new THREE.Vector3(0, 20, 22); // do not turn camera by X
	const cameraTarget = new THREE.Vector3();

	let animationFrameId = 0;
	let running = false;

	function resize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	function animate() {
		if (!running) return;

		const deltaTime = Math.min(clock.getDelta(), 0.05);

		if (!dialogueUI.isOpen() && input.wasPressed('KeyJ')) {
			questLogUI.toggle();
		}

		if (!dialogueUI.isOpen() && !questLogUI.isOpen()) {
			updateNpcInteraction({
				npc,
				player,
				input,
				onInteract: () => npcDialogue.open(),
			});
		}

		const interfaceOpen = dialogueUI.isOpen() || questLogUI.isOpen();

		if (!interfaceOpen) {
			// Update player
			updatePlayerMovement(
				player,
				input,
				deltaTime,
				island.radius - 3,
				environment.obstacles
			);

			updateCombat(
				player,
				input,
				enemies,
				deltaTime,
				environment.obstacles,
				island.radius - 3,
				events
			);

			updateDrops({
				drops,
				player,
				input,
				inventory,
			});

			if (input.wasPressed('KeyI')) {
				inventoryUI.toggle();
			}
		}

		updateEnemies(
			enemies,
			player,
			deltaTime,
			environment.obstacles,
			island.radius - 3
		);

		updateEnemyDrops(enemies, drops, scene);

		input.endFrame();

		// Update camera
		cameraTarget.copy(player.position).add(cameraOffset);

		camera.position.lerp(cameraTarget, 1 - Math.exp(-5 * deltaTime));

		camera.lookAt(player.position.x, 0.8, player.position.z);

		renderer.render(scene, camera);

		animationFrameId = window.requestAnimationFrame(animate);
	}

	function start() {
		if (running) return;

		running = true;
		clock.start();

		window.addEventListener('resize', resize);

		animate();
	}

	function stop() {
		running = false;

		window.cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', resize);
	}

	function dispose() {
		stop();

		input.dispose();
		player.dispose();
		npc.dispose();
		environment.dispose();

		renderer.dispose();

		questManager.dispose();
		events.dispose();

		dialogueUI.dispose();

		npcDialogue.close();

		npcQuestMarker.dispose();
		questLogUI.dispose();
		questNotifications.dispose();
		unsubscribeQuestAccepted();

		unsubscribeQuestAccepted();

		container.removeChild(renderer.domElement);
	}

	return {
		scene,
		camera,
		renderer,
		island,
		environment,
		player,
		start,
		stop,
		dispose,
		events,
		questManager,
		npc,
		wallet,
	};
}
