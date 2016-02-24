
import howl from "howler";
import { TweenMax } from "gsap";
import Artwork from 'toyota'
import cast from './cast/sender'
import { APP_ID, NS } from './app-config'



var canvas = document.createElement("canvas");
document.querySelector("#main").appendChild(canvas);


var renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  preserveDrawingBuffer: true
})

 // Style it
let artwork = new Artwork( canvas, './jspm_packages/github/marklundin/toyota2@gh-pages/', { forceMobile:true, renderer:renderer })


// Add a resize handler
window.addEventListener("resize", _ => artwork.resize( canvas.offsetWidth, canvas.offsetHeight ))


// Start
artwork.start()



cast.then( connect => {

	connect( APP_ID, NS ).then( api => {

		console.log( 'Google Cast Extension Available' )

		window.api = api

		let send = message => api.send( message ).catch( e => console.log( e ))

		// api.availability.add( m => console.log('availability changed:', m ))
		api.session.add( session => console.log('session :', session ))
		// api.message.add( m => console.log('message :', m ))

		artwork.app.onSceneChange.add( send )
		

	}).catch( e => console.error( e ))
})