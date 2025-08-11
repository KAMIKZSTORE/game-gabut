// app.js - FPP demo dengan virtual joystick & buttons
// Pastikan Anda punya file gambar: assets/char.png
// Tekan ESC untuk keluar pointer lock (desktop).

let scene, camera, renderer, clock;
let controls; // PointerLockControls
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let moveForward=false, moveBackward=false, moveLeft=false, moveRight=false, canJump=false, isRunning=false;
let prevTime = performance.now();
let objects = [];
let weaponMesh;

let joystick = { active:false, startX:0, startY:0, dx:0, dy:0 };

init();
animate();

function init(){
  const container = document.getElementById('gameContainer');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a25);

  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
  camera.position.set(0,1.6,0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  hemi.position.set(0,200,0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(-3,10,-10);
  dir.castShadow = true;
  scene.add(dir);

  const groundGeo = new THREE.PlaneGeometry(2000,2000);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x222233 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  scene.add(ground);

  const boxGeo = new THREE.BoxGeometry(1,1,1);
  for(let i=0;i<30;i++){
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random()*0.2+0.1,0.6,0.4) });
    const m = new THREE.Mesh(boxGeo, mat);
    m.position.set((Math.random()-0.5)*40,0.5,(Math.random()-0.5)*40 - 10);
    scene.add(m);
    objects.push(m);
  }

  controls = new THREE.PointerLockControls(camera, renderer.domElement);
  scene.add(controls.getObject());

  renderer.domElement.addEventListener('click', () => {
    controls.lock();
  });

  // Load weapon sprite (gunakan foto Anda di assets/char.png)
  const loader = new THREE.TextureLoader();
  loader.load('assets/char.png', (tex) => {
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.encoding = THREE.sRGBEncoding;
    const w = 1.8;
    const h = w * (tex.image ? tex.image.height/tex.image.width : 1);
    const material = new THREE.MeshBasicMaterial({ map:tex, transparent:true });
    const geom = new THREE.PlaneGeometry(w,h);
    weaponMesh = new THREE.Mesh(geom, material);
    weaponMesh.position.set(0,-0.35,-0.9);
    weaponMesh.scale.set(0.6,0.6,0.6);
    camera.add(weaponMesh);
  });

  // keyboard
  const onKeyDown = function ( event ) {
    switch ( event.code ) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true; break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true; break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true; break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = true; break;
      case 'Space':
        if ( canJump === true ) velocity.y += 6; canJump = false; break;
      case 'ShiftLeft':
        isRunning = true; break;
    }
  };

  const onKeyUp = function ( event ) {
    switch ( event.code ) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false; break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false; break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false; break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = false; break;
      case 'ShiftLeft':
        isRunning = false; break;
    }
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  document.getElementById('btnShoot').addEventListener('touchstart', shoot);
  document.getElementById('btnShoot').addEventListener('mousedown', shoot);

  document.getElementById('btnJump').addEventListener('touchstart', (e)=>{ e.preventDefault(); if(canJump) velocity.y += 6; canJump=false; });
  const runBtn = document.getElementById('btnRun');
  runBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); runBtn.classList.toggle('active'); isRunning = runBtn.classList.contains('active'); });
  runBtn.addEventListener('mousedown', ()=>{ runBtn.classList.toggle('active'); isRunning = runBtn.classList.contains('active'); });

  renderer.domElement.addEventListener('mousedown', (e)=>{ if(e.button === 0) shoot(); });

  const base = document.getElementById('joystickBase');
  const knob = document.getElementById('joystickKnob');
  base.addEventListener('touchstart', (e)=> {
    joystick.active = true;
    const t = e.changedTouches[0];
    joystick.startX = t.clientX;
    joystick.startY = t.clientY;
  });
  base.addEventListener('touchmove', (e)=>{
    if(!joystick.active) return;
    const t = e.changedTouches[0];
    joystick.dx = t.clientX - joystick.startX;
    joystick.dy = t.clientY - joystick.startY;
    const maxR = 40;
    const dist = Math.hypot(joystick.dx, joystick.dy);
    if(dist > maxR){
      const r = maxR / dist;
      joystick.dx *= r; joystick.dy *= r;
    }
    knob.style.transform = `translate(${joystick.dx}px, ${joystick.dy}px)`;
    const nx = joystick.dx / maxR;
    const ny = joystick.dy / maxR;
    moveForward = ny < -0.25;
    moveBackward = ny > 0.25;
    moveLeft = nx < -0.25;
    moveRight = nx > 0.25;
  });
  base.addEventListener('touchend', (e)=>{
    joystick.active=false; joystick.dx=0; joystick.dy=0;
    knob.style.transform = `translate(0px,0px)`;
    moveForward = moveBackward = moveLeft = moveRight = false;
  });

  window.addEventListener('resize', onWindowResize);
  canJump = true;
}

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const raycaster = new THREE.Raycaster();
function shoot(){
  if(weaponMesh){
    weaponMesh.scale.set(0.68,0.68,0.68);
    setTimeout(()=>{ weaponMesh.scale.set(0.6,0.6,0.6); }, 80);
  }
  const origin = camera.getWorldPosition(new THREE.Vector3());
  const dir = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  raycaster.set(origin, dir);
  const hits = raycaster.intersectObjects(objects, false);
  if(hits.length>0){
    const first = hits[0].object;
    first.material.color.set(0xff4444);
    first.position.add(dir.multiplyScalar(0.5));
    setTimeout(()=>{ first.material.color.setHSL(Math.random()*0.2+0.1,0.6,0.4); }, 1000);
  }
}

function animate(){
  requestAnimationFrame(animate);
  const time = performance.now();
  const delta = (time - prevTime) / 1000;

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;
  velocity.y -= 9.8 * 1.5 * delta;

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  let speed = 4.0;
  if(isRunning) speed = 8.5;

  if(moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
  if(moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

  controls.getObject().translateX(velocity.x * delta * -1);
  controls.getObject().translateZ(velocity.z * delta * -1);

  controls.getObject().position.y += velocity.y * delta;

  if ( controls.getObject().position.y < 1.6 ) {
    velocity.y = 0;
    controls.getObject().position.y = 1.6;
    canJump = true;
  }

  prevTime = time;

  if(weaponMesh){
    const t = performance.now() * 0.002;
    weaponMesh.rotation.z = Math.sin(t) * 0.02;
    weaponMesh.rotation.x = Math.sin(t*0.6) * 0.01;
  }

  renderer.render(scene, camera);

  const fps = Math.round(1 / Math.max(0.0001, clock.getDelta()));
  document.getElementById('fpsInfo').innerText = `FPS ~ ${fps}`;
                                       }
