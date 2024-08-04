let scene, camera, renderer, model, xrSession;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.getElementById('ar-container').appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  if (navigator.xr) {
    navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
      if (supported) {
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

init();
