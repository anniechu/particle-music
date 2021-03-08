/**
 * entry.js
 * 
 * This is the first file loaded. It sets up the Renderer, 
 * Scene and Camera. It also starts the render loop and 
 * handles window resizes.
 * 
 */

import { WebGLRenderer, Scene, Vector3, FogExp2, PerspectiveCamera, Vector2, PointLight } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Particles from './objects/Particles.js';
import music from './music/keshi.mp3';

var camera;
var audio = new Audio(music);
var analyser;
var dataArray;
var played = false;

var onClick = function(e) {
  if (played) {
    return
  }
  var context = new AudioContext();
  var src = context.createMediaElementSource(audio);
  analyser = context.createAnalyser();
  src.connect(analyser);
  analyser.connect(context.destination);
  var bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  audio.play()
  played = true;
}

const scene = new Scene();
camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({antialias: true});

// scene
const particles = new Particles();
scene.add(particles);
camera.position.set( 0, -800, 500);
scene.add( camera );
camera.lookAt(new Vector3(0,200,0));

// renderer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 1);

//effect composer
var composer = new EffectComposer( renderer );
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
const bloomPass = new UnrealBloomPass( new Vector2( window.innerWidth, window.innerHeight ), 3, 0.4, 0.1 );
composer.addPass( bloomPass );

bloomPass.threshold = 0;
bloomPass.strength = 1.3;
bloomPass.radius = 0;

const controls = new OrbitControls( camera, renderer.domElement );

// render loop
const onAnimationFrameHandler = (timeStamp) => {
  composer.render();
  if(played) {
    analyser.getByteFrequencyData(dataArray);
    particles.update && particles.update(dataArray);
  }
  window.requestAnimationFrame(onAnimationFrameHandler);
}
window.requestAnimationFrame(onAnimationFrameHandler);

// resize
const windowResizeHanlder = () => { 
  const { innerHeight, innerWidth } = window;
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize( innerWidth, innerHeight );
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};
windowResizeHanlder();
window.addEventListener('resize', windowResizeHanlder);

// dom
document.body.style.margin = 0;
document.body.appendChild( renderer.domElement );

window.addEventListener('click', onClick, false)