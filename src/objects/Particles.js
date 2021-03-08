import { Group, PointsMaterial, Vector3, Points, TextureLoader, Geometry } from 'three';
import disc from '../textures/disc.png';

var particles;
var particleSystem;
var pMaterial;
var width = 70;
var height = 50;

export default class Square extends Group {
  constructor() {
    super();

    // create the particle variables
    particles = new Geometry();

    const sprite = new TextureLoader().load( disc );

    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        var pX = x * 15 - 500;
        var pY = y * 15 - 400;
        var particle = new Vector3(pX, pY, 0);
        particles.vertices.push(particle)
      }
    }

    pMaterial = new PointsMaterial( { size: 15, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true } );
    pMaterial.color.setHSL( 1.0, 0.3, 0.7 );

    // // create the particle system
    particleSystem = new Points(particles, pMaterial);

    this.add(particleSystem);
  }

  update(musicDataArray) {
    var divide = Math.ceil(particles.vertices.length/700)
    for (var i = 0; i < particles.vertices.length; i++) {
      var particle = particles.vertices[i]
      particle.z = musicDataArray[Math.floor(i/divide)] * 1.5
    }
    var length = particles.vertices.length
    for (var i = 0; i < particles.vertices.length; i++) {
      var sum = particles.vertices[i].z
      var count = 1
      if (i + height < length) { sum = sum + particles.vertices[i+height].z; count +=1; }
      if (i - height > 0) { sum = sum + particles.vertices[i-height].z; count +=1; }
      if (i + 1 < length && (i + 1) % height != 0) { sum = sum + particles.vertices[i+1].z; count +=1; }
      if (i - 1 >= 0 && i % height != 0) { sum = sum + particles.vertices[i-1].z; count +=1; }
      particles.vertices[i].z = Math.floor(sum / count)
    }
  
    const time = Date.now() * 0.00005;
    const h = ( 360 * ( 1.0 + time ) % 360 ) / 360;
		pMaterial.color.setHSL( h, 0.5, 0.5 );

    particles.verticesNeedUpdate = true  
  }
}