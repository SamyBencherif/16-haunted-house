import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Texture Loader
const textureLoader = new THREE.TextureLoader()

// Material Loader
function load_mat(path, scale, props)
{
  if (scale == undefined) scale = [1, 1]
  const color = textureLoader.load(path + '/diff.jpg')
  const ARM = textureLoader.load(path + '/arm.jpg')
  const normal = textureLoader.load(path + '/normal.png')
  color.colorSpace = THREE.SRGBColorSpace
  color.wrapS = THREE.RepeatWrapping
  color.wrapT = THREE.RepeatWrapping
  ARM.wrapS = THREE.RepeatWrapping
  ARM.wrapT = THREE.RepeatWrapping
  normal.wrapS = THREE.RepeatWrapping
  normal.wrapT = THREE.RepeatWrapping
  color.repeat.set(scale[0], scale[1])
  ARM.repeat.set(scale[0], scale[1])
  normal.repeat.set(scale[0], scale[1])

  const matProps = {
    map: color,
    aoMap: ARM,
    roughnessMap: ARM,
    metalnessMap: ARM,
    normalMap: normal
  }

  for (var prop in props) matProps[prop] = props[prop]

  return new THREE.MeshStandardMaterial(matProps)
}

function iset(obj, props)
{
  for (var p in props)
    obj[p] = props[p]
  return obj
}

/**
 * Objects
 */

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20, 100, 100),
  load_mat('./floor', [3,3])
)

const floorAlpha = textureLoader.load('./floor/alpha.jpg')
const floorDisplacement = textureLoader.load('./floor/disp.jpg')
 
floor.material.alphaMap = floorAlpha,
floor.material.transparent = true,
floor.material.displacementMap = floorDisplacement
floor.material.displacementScale = 0.216,
floor.material.displacementBias = -0.108
floor.material.displacementMap.wrapS = THREE.RepeatWrapping
floor.material.displacementMap.wrapT = THREE.RepeatWrapping
floor.material.displacementMap.repeat.set(3, 3)

floor.geometry.rotateX(-Math.PI/2)
scene.add(floor)

// House
const house = new THREE.Group()
scene.add(house)

// Walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  load_mat('./wall')
)
house.add(walls)
walls.position.y = 2.5/2

// Roof
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1.5, 4),
  load_mat('./roof')
)
house.add(roof)
roof.position.y = 2.5 + .75
roof.rotation.y = Math.PI * .25

// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: iset(textureLoader.load('./door/color.jpg'), {colorSpace: THREE.SRGBColorSpace}),
    transparent: true,
    alphaMap: textureLoader.load('./door/alpha.jpg'),
    aoMap: textureLoader.load('./door/ao.jpg'),
    metalnessMap: textureLoader.load('./door/metalness.jpg'),
    roughnessMap: textureLoader.load('./door/rough.jpg'),
    normalMap: textureLoader.load('./door/normal.png'),
    displacementMap: textureLoader.load('./door/height.jpg'),
    displacementScale: 0.15,
    displacementBias: -0.04
  })
)
house.add(door)
door.position.z = 2.01
door.position.y = 1.1

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = load_mat('./bush', [2,1], {color: '#ccffcc'}) 

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)
bush1.rotation.x = -0.75

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)
bush2.rotation.x = -0.75

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(- 0.8, 0.1, 2.2)
bush3.rotation.x = -0.75

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(- 1, 0.05, 2.6)
bush4.rotation.x = -0.75

house.add(bush1, bush2, bush3, bush4)

// Graves
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = load_mat('./grave') 

const graves = new THREE.Group()
scene.add(graves)

for (let i=0; i<30; i++)
{
  const angle = Math.random() * Math.PI * 2
  const radius = 3 + Math.random() * 4
  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius

  // Mesh
  const grave = new THREE.Mesh(graveGeometry, graveMaterial)
  grave.position.x = x
  grave.position.y = Math.random() * 0.4
  grave.position.z = z
  grave.rotation.x = (Math.random() - 0.5) * .4
  grave.rotation.y = (Math.random() - 0.5) * .4
  grave.rotation.z = (Math.random() - 0.5) * .4

  // Add to graves group
  graves.add(grave)
}

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#86cdff', 0.5)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#86cdff', 1.5)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

// Door light
const doorLight = new THREE.PointLight('#ff7d46', 5)
doorLight.position.set(0, 2.2, 2.5)
house.add(doorLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const timer = new Timer()

const tick = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
