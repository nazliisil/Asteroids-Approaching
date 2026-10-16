import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Earth
const texture = new THREE.TextureLoader().load('/earth.jpg');
texture.colorSpace = THREE.SRGBColorSpace;
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  new THREE.MeshStandardMaterial({ map: texture })
);
scene.add(earth);

//Lights
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(-2, 0.5, 1.5);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ---- Fake data (same shape your API will return later) ----
const asteroids = [
  { id: '1', name: '2026 AB', diameterM: 120, missDistanceKm: 1500000, velocityKmh: 40000, hazardous: false, date: '2026-10-18' },
  { id: '2', name: '2026 CD', diameterM: 450, missDistanceKm: 4200000, velocityKmh: 61000, hazardous: true,  date: '2026-10-19' },
  { id: '3', name: '2026 EF', diameterM: 30,  missDistanceKm: 800000,  velocityKmh: 28000, hazardous: false, date: '2026-10-20' },
  { id: '4', name: '2026 GH', diameterM: 260, missDistanceKm: 7000000, velocityKmh: 52000, hazardous: false, date: '2026-10-21' },
  { id: '5', name: '2026 IJ', diameterM: 80,  missDistanceKm: 2600000, velocityKmh: 35000, hazardous: true,  date: '2026-10-22' },
];

function seeded(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
} //TODO: modify

const MOON_KM = 384400;
const asteroidGroup = new THREE.Group();
scene.add(asteroidGroup);

asteroids.forEach((a, i) => {
  const ld = a.missDistanceKm / MOON_KM;
  const r = 1.5 + Math.sqrt(ld) * 1.2;
  const theta = seeded(i + 1) * Math.PI * 2;
  const phi = Math.acos(2 * seeded(i + 101) - 1);
  const size = 0.04 + (Math.min(a.diameterM, 600) / 600) * 0.14;

  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(size, 0),
    new THREE.MeshStandardMaterial({ color: a.hazardous ? 0xff5533 : 0xaaaaaa, flatShading: true })
  );
  mesh.position.set(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
  mesh.userData = a;
  asteroidGroup.add(mesh);
});

// Moon distance reference ring
const moonRing = new THREE.Mesh(
  new THREE.RingGeometry(2.69, 2.71, 128),
  new THREE.MeshBasicMaterial({ color: 0x4488ff, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
);
moonRing.rotation.x = Math.PI / 2;
scene.add(moonRing);

function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.002;
  controls.update();
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});