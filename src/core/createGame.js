import * as THREE from 'three';
import { createIsland } from '../world/island.js';
import { createEnvironment } from '../world/environment.js';

export function createGame(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a2230);
  scene.fog = new THREE.Fog(0x1a2230, 45, 105);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 250);
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
    renderer.render(scene, camera);
    animationFrameId = window.requestAnimationFrame(animate);
  }

  function start() {
    if (running) return;
    running = true;
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
    environment.dispose();
    renderer.dispose();
    container.removeChild(renderer.domElement);
  }

  return { scene, camera, renderer, island, environment, start, stop, dispose };
}
