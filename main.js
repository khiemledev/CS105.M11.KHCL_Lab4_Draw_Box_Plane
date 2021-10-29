import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import dat from 'dat.gui'

const LightTypes = Object.freeze({'Point': 0, 'Directional': 1, 'Spot': 2})

const init = () => {
  const scene = new THREE.Scene()
  const aspect = window.innerWidth / window.innerHeight
  const camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000)

  // Render scene to the DOM
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor('rgb(120, 120, 120)')
  renderer.shadowMap.enabled = true
  document.getElementById('app').appendChild(renderer.domElement)
  renderer.render(scene, camera)

  // Set camera position and direction
  camera.position.x = 8
  camera.position.y = 8
  camera.position.z = 15
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  return [scene, camera, renderer]
}

const createBox = (width, height, depth, name) => {
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const material = new THREE.MeshPhongMaterial({
    color: 'rgb(120, 120, 120)',
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.name = name || ''
  return mesh
}

const createSphere = (size, name) => {
  const geometry = new THREE.SphereGeometry(size, 24, 24)
  const material = new THREE.MeshBasicMaterial({
    color: 'rgb(255, 255, 255)',
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name || ''
  return mesh
}

const createPlane = (size, name) => {
  const geometry = new THREE.PlaneGeometry(size, size)
  const material = new THREE.MeshPhongMaterial({
    color: 'rgb(120, 120, 120)',
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  // Rotate plane along X axis by 90 degree
  mesh.rotateX(Math.PI / 2)
  mesh.name = name || ''
  return mesh
}

const createPointLight = (intensity, name) => {
  const light = new THREE.PointLight(0xffffff, intensity)
  light.castShadow = true
  light.name = name || ''

  const lightHelper = new THREE.PointLightHelper(light, 0.5)

  return [light, lightHelper]
}

const createDirectionalLight = (intensity, name) => {
  const light = new THREE.DirectionalLight(0xffffff, intensity)
  light.castShadow = true
  light.name = name || ''

  light.shadow.camera.top = -10
  light.shadow.camera.left = -10
  light.shadow.camera.bottom = 10
  light.shadow.camera.right = 10

  const lightHelper = new THREE.DirectionalLightHelper(light, 10)

  return [light, lightHelper]
}

const createSplotLight = (intensity, name) => {
  const light = new THREE.SpotLight(0xffffff, intensity)
  light.castShadow = true
  light.name = name || ''

  const lightHelper = new THREE.SpotLightHelper(light)

  return [light, lightHelper]
}

const createAmbientLight = (intensity, name) => {
  const light = new THREE.AmbientLight(0xffffff, intensity)
  light.name = name || ''

  return light
}

const createBoxGrid = (amount, separationMultiplier) => {
  const group = new THREE.Group()

  for (let i = 0; i < amount; i++) {
    const box = createBox(1, 1, 1)
    box.position.x = i * separationMultiplier
    box.position.y = box.geometry.parameters.height / 2
    group.add(box)

    for (let j = 1; j < amount; j++) {
      const box = createBox(1, 1, 1)
      box.position.x = i * separationMultiplier
      box.position.z = j * separationMultiplier
      box.position.y = box.geometry.parameters.height / 2
      group.add(box)
    }
  }

  group.position.x = -((amount - 1) * separationMultiplier) / 2
  group.position.z = -((amount - 1) * separationMultiplier) / 2
  return group
}

const animate = (scene, camera, renderer, controls) => {
  requestAnimationFrame(() => animate(scene, camera, renderer, controls))

  // Animation goes here
  let animateBox = false

  if (animateBox) {
    let box = scene.getObjectByName('my_box')
    if (box) {
      // Rotate the box
      box.rotation.y += 0.01
      box.rotation.x += 0.01
      box.rotation.z += 0.01

      // Zoom in-out effect
      if (!box.scaleState) box.scaleState = 'UP'
      if (box.scale.x <= 1) box.scaleState = 'UP'
      if (box.scale.x >= 2) box.scaleState = 'DOWN'
      let factor = box.scaleState === 'UP' ? 0.01 : -0.01
      box.scale.x += factor
      box.scale.y += factor
      box.scale.z += factor
    }
  }

  controls.update()
  renderer.render(scene, camera)
}

const main = () => {
  const enableLightCameraHelper = true
  const enableLightHelper = false
  const smoothShadow = false
  const lightType = LightTypes.Directional
  const lightIntensity = 1.3
  const enableAmbientLight = true
  const ambientLightIntensity = 0.3

  const [scene, camera, renderer] = init()

  /**
   * Create and adding objects
   */
  const plane = createPlane(20, 'my_plane')
  scene.add(plane)

  let lighter
  switch (lightType) {
    case LightTypes.Point:
      lighter = createPointLight(lightIntensity, 'light')
      break
    case LightTypes.Directional:
      lighter = createDirectionalLight(lightIntensity, 'light')
      break
    case LightTypes.Spot:
      lighter = createSplotLight(lightIntensity, 'light')
      break
    default:
      lighter = createPointLight(1, 'light')
      console.error('lightType does not included in LightTypes')
      break
  }
  const [light, lightHelper] = lighter
  light.position.x = 13
  light.position.y = 10
  light.position.z = 4
  scene.add(light)
  if (enableLightHelper) scene.add(lightHelper)

  if (enableLightCameraHelper) {
    const helper = new THREE.CameraHelper(light.shadow.camera)
    scene.add(helper)
  }

  if (smoothShadow) {
    light.shadow.bias = 0.001
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
  }

  let ambientLight
  if (enableAmbientLight) {
    ambientLight = createAmbientLight(ambientLightIntensity, 'ambient')
    scene.add(ambientLight)
  }

  // For viewing light position
  const lightSphere = createSphere(0.05, 'light_sphere')
  light.add(lightSphere)

  const boxGrid = createBoxGrid(10, 1.5)
  scene.add(boxGrid)

  /**
   * Control the scene
   */
  const gui = new dat.GUI()
  gui.add(light, 'intensity', 0, 5).name('Light Intensity')
  gui.add(light.position, 'x', -20, 20).name('Light position X')
  gui.add(light.position, 'y', -20, 20).name('Light position Y')
  gui.add(light.position, 'z', -20, 20).name('Light position Z')
  if (light instanceof THREE.SpotLight) {
    gui.add(light, 'angle', 0, 2).name('Light angle')
    gui.add(light, 'penumbra', 0, 1).name('Light penumbra')
  }

  // Control the camera view
  const controls = new OrbitControls(camera, renderer.domElement)

  // Auto update scene
  animate(scene, camera, renderer, controls)
}

main()
