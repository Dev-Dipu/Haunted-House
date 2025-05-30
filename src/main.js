import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'

/**
 * 🎛️ Debug GUI (for tuning live)
 */
const gui = new GUI()
gui.close() // Close initially for clean look

/**
 * 📄 Canvas Setup
 */
const canvas = document.querySelector('canvas.webgl')

/**
 * 🌌 Scene Creation
 */
const scene = new THREE.Scene()

/**
 * 📦 Asset Loading Manager (progress + error handler)
 */
const loadingManager = new THREE.LoadingManager()
const loadingScreen = document.getElementById('loading-screen')

loadingManager.onStart = () => {
  console.log("🕸️ Loading started...")
}

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  console.log(`🔄 ${itemsLoaded}/${itemsTotal} - ${url}`)
}

loadingManager.onLoad = () => {
  console.log("✅ All assets loaded!")

  // Fade out and remove loading screen
  loadingScreen.style.opacity = '0'
  setTimeout(() => {
    loadingScreen.remove()
  }, 500)
}

loadingManager.onError = (url) => {
  console.error(`❌ Error loading: ${url}`)
}


/**
 * 🖼️ Texture Loading
 */
const textureLoader = new THREE.TextureLoader(loadingManager)

// Door textures 🚪
const doorColorTexture = textureLoader.load('./static/door/color.jpg')
const doorAlphaTexture = textureLoader.load('./static/door/alpha.jpg')
const doorAmbientTexture = textureLoader.load('./static/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('./static/door/height.jpg')
const doorMetalnessTexture = textureLoader.load('./static/door/metalness.jpg')
const doorNormalTexture = textureLoader.load('./static/door/normal.jpg')
const doorRoughnessTexture = textureLoader.load('./static/door/roughness.jpg')

// Brick textures 🧱
const brickColorTexture = textureLoader.load('./static/bricks/color.jpg')
const brickAmbientTexture = textureLoader.load('./static/bricks/ambientOcclusion.jpg')
const brickNormalTexture = textureLoader.load('./static/bricks/normal.jpg')
const brickRoughnessTexture = textureLoader.load('./static/bricks/roughness.jpg')

// Grass textures 🌿
const grassColorTexture = textureLoader.load('./static/grass/color.jpg')
const grassAmbientTexture = textureLoader.load('./static/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('./static/grass/normal.jpg')
const grassRoughnessTexture = textureLoader.load('./static/grass/roughness.jpg')

// Grass repeat settings 🌀 (for tiling the texture)
grassColorTexture.repeat.set(8, 8)
grassAmbientTexture.repeat.set(8, 8)
grassNormalTexture.repeat.set(8, 8)
grassRoughnessTexture.repeat.set(8, 8)

grassColorTexture.wrapS = THREE.RepeatWrapping
grassAmbientTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping

grassColorTexture.wrapT = THREE.RepeatWrapping
grassAmbientTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping

/**
 * 🏠 House Setup
 */
const house = new THREE.Group()
scene.add(house)

// 🧱 Walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    map: brickColorTexture,
    alphaMap: brickAmbientTexture,
    normalMap: brickNormalTexture,
    roughnessMap: brickRoughnessTexture,
  })
)
walls.position.y = 1.25
house.add(walls)

// ⛺ Roof
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1, 4),
  new THREE.MeshStandardMaterial({ color: '#b35f45' })
)
roof.position.y = 3
roof.rotation.y = Math.PI / 4
house.add(roof)

// 🚪 Door (highly detailed with displacement!)
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    transparent: true,
    alphaMap: doorAlphaTexture,
    aoMap: doorAmbientTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.1,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture,
  })
)
door.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
)
door.position.set(0, 1, 2.001)
house.add(door)

// 🌳 Bushes around the house
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8, 0.1, 2.2)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(-1, 0.05, 2.6)

house.add(bush1, bush2, bush3, bush4)

// ⚰️ Graves scattered randomly
const graves = new THREE.Group()
scene.add(graves)

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' })

for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2
  const radius = 3 + Math.random() * 6
  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius

  const grave = new THREE.Mesh(graveGeometry, graveMaterial)
  grave.position.set(x, 0.3, z)
  grave.rotation.y = (Math.random() - 0.5) * 0.4
  grave.rotation.z = (Math.random() - 0.5) * 0.4
  grave.castShadow = true
  graves.add(grave)
}

// 🟩 Ground / Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    map: grassColorTexture,
    alphaMap: grassAmbientTexture,
    normalMap: grassNormalTexture,
    roughnessMap: grassRoughnessTexture,
  })
)
floor.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
)
floor.rotation.x = -Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

/**
 * 🌫️ Fog Effect
 */
const fog = new THREE.Fog('#262837', 1, 15)
scene.fog = fog

/**
 * 💡 Lighting Setup
 */
// Ambient light 🌕
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Moonlight (Directional) 🌙
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12)
moonLight.position.set(4, 5, -2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001)
scene.add(moonLight)

// Door spotlight ✨
const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
doorLight.position.set(0, 2.2, 2.7)
house.add(doorLight)

// Ghost lights 👻
const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
scene.add(ghost1)

const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
scene.add(ghost2)

const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
scene.add(ghost3)

/**
 * 📏 Resizing Support
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * 🎥 Camera Setup
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 2, 5)
scene.add(camera)

// Mouse controls 🖱️
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * 🖼️ Renderer Setup
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#262837')

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Enable shadows 🌑
moonLight.castShadow = true
doorLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

walls.castShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true

walls.receiveShadow = true
floor.receiveShadow = true

doorLight.shadow.mapSize.set(256, 256)
doorLight.shadow.camera.far = 7

ghost1.shadow.mapSize.set(256, 256)
ghost1.shadow.camera.far = 7
ghost2.shadow.mapSize.set(256, 256)
ghost2.shadow.camera.far = 7
ghost3.shadow.mapSize.set(256, 256)
ghost3.shadow.camera.far = 7

/**
 * 🕰️ Animation Loop
 */
const timer = new Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()

  // Animate ghosts 👻
  const ghost1Angle = elapsedTime * 0.5
  ghost1.position.x = Math.cos(ghost1Angle) * 4
  ghost1.position.z = Math.sin(ghost1Angle) * 4
  ghost1.position.y = Math.sin(elapsedTime * 3)

  const ghost2Angle = elapsedTime * 0.32
  ghost2.position.x = Math.cos(ghost2Angle) * 5
  ghost2.position.z = Math.sin(ghost2Angle) * 5
  ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

  const ghost3Angle = elapsedTime * 0.18
  ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
  ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
  ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

  // Update controls
  controls.update()

  // Render the scene 🌄
  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}

tick()
