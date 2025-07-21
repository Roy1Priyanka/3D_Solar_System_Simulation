
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("solarCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0d0d1f);

function addStars(count) {
  const starGeometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 1000;
    const y = (Math.random() - 0.5) * 1000;
    const z = (Math.random() - 0.5) * 1000;
    positions.push(x, y, z);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
addStars(1000);

const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshStandardMaterial({
  color: 0xffd700,
  emissive: 0xffa500,
  emissiveIntensity: 2,
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);


const pointLight = new THREE.PointLight(0xffffff, 3, 300);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);


camera.position.set(0, 10, 35);
camera.lookAt(0, 0, 0);
let cameraAngle = 0;

function createLabel(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;
  context.fillStyle = 'rgba(0, 0, 0, 0.5)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.font = 'bold 42px Outfit';
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = 'black';
  context.shadowBlur = 8;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4, 1, 1);
  return sprite;
}

const planetData = [
  { name: "Mercury", color: 0x888888, distance: 5, size: 0.3, speed: 4.17 },
  { name: "Venus", color: 0xffcc99, distance: 7, size: 0.5, speed: 1.61 },
  { name: "Earth", color: 0x3399ff, distance: 9, size: 0.6, speed: 1.0 },
  { name: "Mars", color: 0xff5733, distance: 11, size: 0.5, speed: 0.53 },
  { name: "Jupiter", color: 0xffcc66, distance: 14, size: 1.1, speed: 0.084 },
  { name: "Saturn", color: 0xd2b48c, distance: 17, size: 0.9, speed: 0.034 },
  { name: "Uranus", color: 0x66ccff, distance: 20, size: 0.7, speed: 0.012 },
  { name: "Neptune", color: 0x3366ff, distance: 23, size: 0.7, speed: 0.006 },
];

const planets = [];
const panel = document.getElementById("control-panel");

planetData.forEach((planet) => {
  const geo = new THREE.SphereGeometry(planet.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: planet.color });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  planet.mesh = mesh;
  planet.angle = Math.random() * Math.PI * 2;


  if (planet.name === "Saturn") {
    const ringGeo = new THREE.RingGeometry(1.2, 1.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd2b48c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    planet.mesh.add(ring);
  }


  const label = createLabel(planet.name);
  planet.label = label;
  scene.add(label);
  planets.push(planet);

  const orbitCurve = new THREE.EllipseCurve(0, 0, planet.distance, planet.distance, 0, 2 * Math.PI);
  const orbitPoints = orbitCurve.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
  const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbitLine.rotation.x = Math.PI / 2;
  scene.add(orbitLine);

  const card = document.createElement("div");
  card.className = "planet-card";
  const labelText = document.createElement("div");
  labelText.className = "planet-label";
  labelText.textContent = planet.name;
  card.appendChild(labelText);
  const container = document.createElement("div");
  container.className = "speed-container";
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0.001;
  slider.max = 5;
  slider.step = 0.001;
  slider.value = planet.speed;
  slider.className = "speed-slider";
  const valueDisplay = document.createElement("div");
  valueDisplay.className = "speed-value";
  valueDisplay.textContent = slider.value;
  slider.addEventListener("input", (e) => {
    planet.speed = parseFloat(e.target.value);
    valueDisplay.textContent = slider.value;
  });
  container.appendChild(slider);
  container.appendChild(valueDisplay);
  card.appendChild(container);
  panel.appendChild(card);
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  planets.forEach((planet) => {
    planet.angle += planet.speed * delta * 0.3;
    const x = Math.cos(planet.angle) * planet.distance;
    const z = Math.sin(planet.angle) * planet.distance;
    planet.mesh.position.set(x, 0, z);
    planet.mesh.rotation.y += 0.01;
    planet.label.position.set(x, planet.size + 0.8, z);
    planet.label.lookAt(camera.position);
  });
  cameraAngle += 0.002;
  camera.position.x = Math.sin(cameraAngle) * 35;
  camera.position.z = Math.cos(cameraAngle) * 35;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
