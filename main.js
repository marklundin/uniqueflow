
import howl from "howler";
import { TweenMax } from "gsap";
import Artwork from 'toyota'
import cast from './cast/sender'
import { APP_ID, NS } from './app-config'



var canvas = document.createElement("canvas");
document.querySelector("#main").appendChild(canvas);


 // Style it
let artwork = new Artwork( canvas, './jspm_packages/github/marklundin/toyota2@gh-pages/', { forceMobile:true })


// Add a resize handler
window.addEventListener("resize", _ => artwork.resize( canvas.offsetWidth, canvas.offsetHeight ))


// Start
artwork.start()



cast.then( connect => {

	connect( APP_ID, NS ).then( api => {

		console.log( 'Connected' )

		window.api = api

		let send = message => api.send( 'hello' ).catch( e => console.log( e ))
		window.send = send

		api.availability.add( m => console.log('availability changed:', m ))
		api.session.add( session => console.log('session :', session.statusText ))
		api.message.add( m => console.log('message :', m ))
		// api.send('balls')

	}).catch( e => console.error( e ))
})