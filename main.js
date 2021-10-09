import './style.css'
import * as THREE from 'three'

const init = () => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  )

  // Render scene to the DOM
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.getElementById('app').appendChild(renderer.domElement)
  renderer.render(scene, camera)

  // Set camera position and direction
  camera.position.x = 1
  camera.position.y = 1.5
  camera.position.z = 5
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  return [scene, camera, renderer]
}

const createBox = (width, height, depth) => {
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
  })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

const createPlane = (size) => {
  const geometry = new THREE.PlaneGeometry(size, size)
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(geometry, material)
  // Rotate plane along X axis by 90 degree
  mesh.rotateX(Math.PI / 2)
  return mesh
}

const main = () => {
  const [scene, camera, renderer] = init()

  // Auto update scene
  const animate = () => {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()

  const plane = createPlane(4)
  scene.add(plane)
  
  const box = createBox(1, 1, 1)
  // Place the box on the plane
  box.position.y = box.geometry.parameters.height / 2
  scene.add(box)
}

main()