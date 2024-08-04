import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.143.0/build/three.module.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.143.0/examples/jsm/ARButton.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.143.0/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, model;

function init() {
    // Set up the scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('ar-container').appendChild(renderer.domElement);
    
    // Add AR Button
    document.body.appendChild(ARButton.createButton(renderer));

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Set up event listeners
    document.getElementById('ar-button').addEventListener('click', () => {
        if (renderer.xr.isPresenting) {
            renderer.xr.getController(0).remove(model);
            renderer.xr.getController(1).remove(model);
            renderer.xr.getSession().end();
        } else {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    renderer.xr.getController(0).add(model);
                    renderer.xr.getController(1).add(model);
                    renderer.xr.getSession().start();
                });
        }
    });

    // Handle model upload
    document.getElementById('model-upload').addEventListener('change', event => {
        const file = event.target.files[0];
        if (file) {
            const loader = new GLTFLoader();
            loader.load(URL.createObjectURL(file), gltf => {
                if (model) scene.remove(model);
                model = gltf.scene;
                scene.add(model);
            });
        }
    });

    animate();
}

function animate() {
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}

init();
