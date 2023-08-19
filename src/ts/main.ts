import * as THREE from 'three'
import GUI from 'lil-gui'

let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

const floorSize = 100;
const paramRate = 100;

function init() {
  const scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(floorSize, floorSize, 1, 1),
    new THREE.MeshLambertMaterial({color: 0xFFFFFF})
  );
  floor.receiveShadow = true;

  floor.rotation.x = -0.5 * Math.PI;
  floor.position.y = -1;
  scene.add(floor);

  camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 30, 0);
  camera.lookAt(scene.position);

  scene.add(new THREE.AmbientLight(0x888888));

  const boxShape = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({color: 0xFFFFFF})
  );
  boxShape.castShadow = true;
  scene.add(boxShape);

  const cylinderShape = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({color: 0xFFFFFF})
  );
  cylinderShape.castShadow = true;
  cylinderShape.visible = false;
  scene.add(cylinderShape);

  const capsuleShape = new THREE.Mesh(
    new THREE.CapsuleGeometry(1, 1),
    new THREE.MeshLambertMaterial({color: 0xFFFFFF})
  );
  capsuleShape.castShadow = true;
  capsuleShape.visible = false;
  scene.add(capsuleShape);

  const spotLight = new THREE.SpotLight(0xFFFFFF);
  spotLight.position.set(0, 10, 0);
  spotLight.castShadow = true;
  spotLight.intensity = 100;
  scene.add(spotLight);

  const lightSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5),
    new THREE.MeshLambertMaterial({color: 0xFF0000})
  );
  lightSphere.position.set(0, 10, 0);
  scene.add(lightSphere);

  // scene.add(new THREE.CameraHelper(spotLight.shadow.camera));

  const axes = new THREE.AxesHelper(floorSize);
  scene.add(axes);

  document.getElementById('WebGL-output')?.appendChild(renderer.domElement);

  const controls = {
    axesDisp: true,
    shape: 'Box'
  };

  const lightControls = {
    radius: 1000,
    rotationX: 0,
    rotationY: 0,
    intensity: 100
  };

  const cameraControls = {
    radius: 2000,
    rotationX: 0,
    rotationY: 0
  };

  const boxControls = {
    width: 100,
    height: 100,
    depth: 100,
    rotation: 0
  };

  const cylinderControls = {
    radius: 100,
    height: 100,
    rotation: 0
  };

  const capsuleControls = {
    radius: 100,
    length: 100,
    rotation: 0
  };

  const floorControls = {
    disp: true,
    position: -100
  };

  const gui = new GUI();
  gui.add(controls, 'axesDisp').onChange(updateAxes);
  gui.add(controls, 'shape', ['Box', 'Cylinder', 'Capsule']).onChange(changeShape);
  const cameraFolder = gui.addFolder('Camera');
  cameraFolder.add(cameraControls, 'radius', 0, 4000, 1);
  cameraFolder.add(cameraControls, 'rotationX', 0, Math.PI / 2, 0.1);
  cameraFolder.add(cameraControls, 'rotationY', -Math.PI, Math.PI, 0.1);
  cameraFolder.onChange(updateCamera);
  const lightFolder = gui.addFolder('Light');
  lightFolder.add(lightControls, 'radius', 0, 4000, 1);
  lightFolder.add(lightControls, 'rotationX', 0, Math.PI / 2, 0.1);
  lightFolder.add(lightControls, 'rotationY', -Math.PI, Math.PI, 0.1);
  lightFolder.add(lightControls, 'intensity', 0, 1000, 1);
  lightFolder.onChange(updateLight);
  const floorFolder = gui.addFolder('Floor');
  floorFolder.add(floorControls, 'disp');
  floorFolder.add(floorControls, 'position', -2000, 0, 1);
  floorFolder.onChange(updateFloor);
  let boxShapeFolder = gui.addFolder('Box');
  boxShapeFolder.add(boxControls, 'width', 1, 1000, 1).onChange(updateBoxGeometry);
  boxShapeFolder.add(boxControls, 'height', 1, 1000, 1).onChange(updateBoxGeometry);
  boxShapeFolder.add(boxControls, 'depth', 1, 1000, 1).onChange(updateBoxGeometry);
  boxShapeFolder.add(boxControls, 'rotation', -Math.PI / 2, Math.PI / 2, 0.1).onChange(updateBoxRotation);
  let cylinderShapeFolder = gui.addFolder('Cylinder');
  cylinderShapeFolder.add(cylinderControls, 'radius', 1, 1000, 1).onChange(updateCylinderGeometry);
  cylinderShapeFolder.add(cylinderControls, 'height', 1, 1000, 1).onChange(updateCylinderGeometry);
  cylinderShapeFolder.add(cylinderControls, 'rotation', -Math.PI / 2, Math.PI / 2, 0.1).onChange(updateCylinderRotation);
  let capsuleShapeFolder = gui.addFolder('Capsule');
  capsuleShapeFolder.add(capsuleControls, 'radius', 1, 1000, 1).onChange(updateCapsuleGeometry);
  capsuleShapeFolder.add(capsuleControls, 'length', 1, 1000, 1).onChange(updateCapsuleGeometry);
  capsuleShapeFolder.add(capsuleControls, 'rotation', -Math.PI / 2, Math.PI / 2, 0.1).onChange(updateCapsuleRotation);

  window.addEventListener('resize', onResize);

  render();

  function render() {
    renderer.clear();
    renderer.render(scene, camera);
  }

  function updateAxes() {
    axes.visible = controls.axesDisp;
    render();
  }

  function changeShape() {
    boxShape.visible = false;
    cylinderShape.visible = false;
    capsuleShape.visible = false;

    switch(controls.shape) {
      case 'Box':
        boxShape.visible = true;
        break;
      case 'Cylinder':
        cylinderShape.visible = true;
        break;
      case 'Capsule':
        capsuleShape.visible = true;
        break;
    }
    render();
  }

  function updateCamera() {
    camera.position.set(
      cameraControls.radius * Math.sin(cameraControls.rotationX)
      * Math.cos(cameraControls.rotationY) / paramRate,
      cameraControls.radius * Math.cos(cameraControls.rotationX) / paramRate,
      cameraControls.radius * Math.sin(cameraControls.rotationX)
      * Math.sin(cameraControls.rotationY) / paramRate
    );
    camera.lookAt(scene.position);
    render();
  }

  function updateLight() {
    const x = 
      lightControls.radius * Math.sin(lightControls.rotationX)
      * Math.cos(lightControls.rotationY) / paramRate;
    const y = lightControls.radius * Math.cos(lightControls.rotationX) / paramRate;
    const z = 
      lightControls.radius * Math.sin(lightControls.rotationX)
      * Math.sin(lightControls.rotationY) / paramRate;

    spotLight.position.set(x, y, z);
    spotLight.intensity = lightControls.intensity;
    lightSphere.position.set(x, y, z);
    render();
  }

  function updateFloor() {
    floor.visible = floorControls.disp;
    floor.position.y = floorControls.position / paramRate;
    render();
  }

  function updateBoxGeometry() {
    boxShape.geometry.dispose();
    boxShape.geometry = new THREE.BoxGeometry(
      boxControls.width / paramRate,
      boxControls.height / paramRate,
      boxControls.depth / paramRate
    );
    updateBoxRotation();
  }

  function updateBoxRotation() {
    boxShape.rotation.x = boxControls.rotation;
    render();
  }

  function updateCylinderGeometry() {
    cylinderShape.geometry.dispose();
    cylinderShape.geometry = new THREE.CylinderGeometry(
      cylinderControls.radius / paramRate,
      cylinderControls.radius / paramRate,
      cylinderControls.height / paramRate
    );
    updateCylinderRotation();
  }

  function updateCylinderRotation() {
    cylinderShape.rotation.x = cylinderControls.rotation;
    render();
  }

  function updateCapsuleGeometry() {
    capsuleShape.geometry.dispose();
    capsuleShape.geometry = new THREE.CapsuleGeometry(
      capsuleControls.radius / paramRate,
      capsuleControls.length / paramRate
    );
    updateCapsuleRotation();
  }

  function updateCapsuleRotation() {
    capsuleShape.rotation.x = capsuleControls.rotation;
    render();
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  }  
}

window.onload = init;
