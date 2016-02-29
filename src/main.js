import howl from "howler";
import { TweenMax } from "gsap";
import Artwork from 'toyota'
import cast from './cast/sender'
import { APP_ID, NS } from './app-config'


let InstallationArtwork = ( canvas, filePath ) => {

	 // Style it
	let artwork = new Artwork( canvas, filePath, {
		useTextureNoise:false, 
        fov:25, 
        viewOffset:[ -400, 0 ]
    })

	// Add a resize handler
	window.addEventListener("resize", _ => artwork.resize( canvas.offsetWidth, canvas.offsetHeight ))


	// Start
	artwork.start()



	cast.then( connect => {

		connect( APP_ID, NS ).then( api => {

			console.log( 'Google Cast Extension Available' )

			// if( new detect(window.navigator.userAgent).mobile() ){

			// 	let castButton = document.querySelectot('#cast')
			// 	castButton.style.display = 'initial'
			// 	castButton.onclick = api.requestSession()

			// }



			let send = message => api.send( message ).catch( e => null )

			// api.availability.add( m => console.log('availability changed:', m ))
			api.session.add( session => console.log('session :', session ))
			// api.message.add( m => console.log('message :', m ))

			artwork.app.onSceneChange.add( send )
			

		}).catch( e => console.error( e ))
	})


	return artwork;

}

export default InstallationArtwork

window.InstallationArtwork = InstallationArtwork