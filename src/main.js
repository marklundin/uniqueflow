import howl from "howler";
import { TweenMax } from "gsap";
import Artwork from 'toyota'
import cast from './cast/sender'
import { APP_ID, NS, DEBUG_NS } from './app-config'


let InstallationArtwork = ( canvas, filePath, dpi ) => {

    let pixelRatio = dpi === undefined ? 1.0 : dpi

	 // Style it
	let artwork = new Artwork( canvas, filePath, {
		timeScale: 0.9, 
		useTextureNoise:false, 
		pixelRatio })

	// Add a resize handler
	window.addEventListener("resize", _ => artwork.resize( window.innerWidth, window.innerHeight ))



	// We want the machine to 

	let randomScene = _ => {
		let scenes = Object.keys( artwork.app.data.scenes )
		let key = Math.floor( Math.random() * scenes.length )
		artwork.app.changeSceneByName( scenes[key] )
	}

	let timeOutID = setTimeout( randomScene, 5000 )
	let onSceneChange = scene => {
		if( timeOutID ) clearTimeout( timeOutID )
		if( scene === 'default' ) timeOutID = setTimeout( randomScene, 5000 )
	}

	
	// Start
	artwork.resize( window.innerWidth, window.innerHeight )
	artwork.start()

	artwork.app.onSceneChange.add( onSceneChange )


	


	cast.then( connect => {

		connect( APP_ID, NS ).then( api => {

			console.log( 'Google Cast Extension Available' )

			// if( new detect(window.navigator.userAgent).mobile() ){

			// 	let castButton = document.querySelectot('#cast')
			// 	castButton.style.display = 'initial'
			// 	castButton.onclick = api.requestSession()

			// }

			

			connect( APP_ID, DEBUG_NS ).then( debug => {

				window.cssSize = ( w, h ) => debug.send({
					command: 'resize-canvas-css',
					value:{
						"width": String( w ) + '%',
						"height": String( h ) + '%'
					}
				})

				window.terminate = _ => debug.send({ command: 'terminate'})
				window.reload = clearCache => debug.send({ command: 'reload', value: clearCache })

			})



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