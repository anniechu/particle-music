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
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import Particles from './objects/Particles.js';
import music from './music/hakone.mp3';
import './style.css';

var camera;
var analyser;
var dataArray;
var played = false;
var loaded = false;
var songLabel;
var audio;

function loadFileObject(fileObj, loadedCallback)
{
    var reader = new FileReader();
    reader.readAsDataURL( fileObj );
    reader.onload = loadedCallback;
}

function play(evt) {
  if (played) {
    audio.pause()
  }
  if (evt) {
    audio = new Audio(evt.target.result)
    songLabel.textContent = ''
    loaded = true;
  } else {
    audio = new Audio(music)
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

const gui = new GUI()
var params = {
  loadFile : function() { 
    document.getElementById('myInput').click();
  },
};
gui.add(params, 'loadFile').name('Load music file');

// render loop
const onAnimationFrameHandler = (timeStamp) => {
  composer.render();
  if(played) {
    analyser.getByteFrequencyData(dataArray);
    particles.update && particles.update(dataArray);
  }
  if (typeof document.getElementById("myInput").files[0] !== 'undefined' && !loaded) {
    loadFileObject(document.getElementById("myInput").files[0], play)
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
var element = document.createElement('input')
element.type = 'file'
element.id = 'myInput'
document.documentElement.appendChild( element )
songLabel = document.createElement('song')
songLabel.id = 'song'
songLabel.textContent = 'Hakone - DREAIR'
document.documentElement.appendChild( songLabel )

play()