// import * as THREE from 'three';
import * as THREE from '/node_modules/three/build/three.module.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';


// Our Javascript will go here.
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 5, 0);
// controls.update();

// var geometry = new THREE.BoxGeometry();
// var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// var cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

camera.position.z = 5;
controls.update();

function animate() {
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(1, 0, 1))
        .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

function adjustLighting() {
    //let pointLight = new THREE.PointLight(0xdddddd)
    //pointLight.position.set(-5, -3, 3)
    //scene.add(pointLight)

    let ambientLight = new THREE.AmbientLight(0x505050)
    scene.add(ambientLight)

    var directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    scene.add(directionalLight);
}

function addBasicCube() {
    let geometry = new THREE.BoxGeometry(500, 500, 500);
    let material = new THREE.MeshLambertMaterial();

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -2;
    scene.add(mesh);
    // sceneObjects.push(mesh)
}

function loadModel() {
    var loader = new GLTFLoader();
    loader.load('../models/the_lighthouse/scene.gltf', function (gltf) {
        scene.add(gltf.scene);

        // console.log(gltf.scene);
        // console.log(gltf);

        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                // console.log(child.material);
                var old_mat = child.material;
                // var new_mat = new THREE.MeshLambertMaterial({ map: old_mat.map });
                var new_mat = CustomMaterial();
                new_mat.uniforms.map = {
                    type: 'sampler2D',
                    value: old_mat.map
                }
                child.material = new_mat;
            }
        });

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());
        // set the camera to frame the box
        frameArea(boxSize * 0.5, boxSize, boxCenter, camera);
        // update the Trackball controls to handle the new size
        controls.maxDistance = boxSize * 10;
        controls.target.copy(boxCenter);
        controls.update();
        renderer.render(scene, camera);

    }, undefined, function (error) {
        console.log("error!");
        console.error(error);
    });
}

function vertexShader() {
    return `
      varying vec2 texture_uv;
  
      void main() {
        texture_uv = uv;
  
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewPosition; 
      }
    `
}

function fragmentShader() {
    return `
    uniform vec3 colorA; 
    uniform vec3 colorB;
    uniform sampler2D map; 
    varying vec2 texture_uv;

    void main() {
      vec4 diffuse = texture(map, texture_uv);
      gl_FragColor = vec4(diffuse.rgb, 1.0);
    }
`
}

function CustomMaterial() {
    let uniforms = {
        colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
        colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
    };
    let material =  new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: fragmentShader(),
        vertexShader: vertexShader(),
      });
    // console.log(material);
    return material;
}
  

loadModel();
adjustLighting();
// addBasicCube();
animate();
