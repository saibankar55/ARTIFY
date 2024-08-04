let scene, camera, renderer, model, xrSession;

function init() {
  // Set up the scene, camera, and renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.getElementById('ar-container').appendChild(renderer.domElement);

  // Set up lighting
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // Handle file input
  document.getElementById('file-input').addEventListener('change', handleFileUpload, false);

  // Check WebXR support
  if (navigator.xr) {
    navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
      if (supported) {
        console.log("WebXR supported");
        document.getElementById('ar-button').style.display = 'block';
        document.getElementById('ar-button').addEventListener('click', () => {
          navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local-floor'] })
            .then(onSessionStarted)
            .catch(err => console.error("Failed to start XR session:", err));
        });
      } else {
        console.warn("WebXR not supported");
      }
    }).catch(err => console.error("Error checking WebXR support:", err));
  } else {
    console.warn("WebXR API not available");
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      const arrayBuffer = reader.result;
      const loader = new THREE.GLTFLoader();
      loader.parse(arrayBuffer, '', (gltf) => {
        if (model) {
          scene.remove(model);
        }
        model = gltf.scene;
        model.position.set(0, 0, -2); // Initial position of the model
        scene.add(model);
      }, undefined, (error) => console.error("Error loading GLTF model:", error));
    };
    reader.readAsArrayBuffer(file);
  }
}

function onSessionStarted(session) {
  xrSession = session;
  renderer.xr.setSession(session);
  session.addEventListener('end', onSessionEnded);
  animate();
}

function onSessionEnded() {
  xrSession.removeEventListener('end', onSessionEnded);
  xrSession = null;
  renderer.xr.setSession(null);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  renderer.render(scene, camera);
}

// Initialize the app
init();
