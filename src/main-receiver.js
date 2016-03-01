
import howl from "howler";
import { TweenMax } from "gsap";
import Artwork from 'toyota'
import castReceiverManager from './cast/receiver'
import { NS, APP_READY, APP_UNSUPPORTED, DEBUG_NS } from './app-config'



var canvas = document.createElement("canvas");
document.querySelector("#main").appendChild(canvas);


 
let artwork


// Add a resize handler



// Start



let hardwareSupportsApplication = Artwork.isSupported



console.log('Starting Receiver Manager');

// handler for the 'ready' event
castReceiverManager.onReady = function(event) {
	console.log('Received Ready event: ' + JSON.stringify(event.data));

	if( Artwork.isSupported ){

		Object.assign( canvas.style, {
			width: "100%",
			height: "100%"
		});

		var artOpts = {
			useTextureNoise:false, 
			fov:25, 
			timeScale: 0.9,
			viewOffset:[ -400, 0 ]
		}

		artwork = new Artwork( canvas, './jspm_packages/github/marklundin/toyota2@gh-pages/', artOpts )
		window.addEventListener("resize", _ => artwork.resize( canvas.offsetWidth , canvas.offsetWidth ))
		artwork.start()

	}

	castReceiverManager.setApplicationState( Artwork.isSupported ? APP_READY : APP_UNSUPPORTED );
}

// handler for 'senderconnected' event
castReceiverManager.onSenderConnected = function(event) {
	console.log('Received Sender Connected event: ' + event.data);
	console.log(castReceiverManager.getSender(event.data).userAgent);
};

// handler for 'senderdisconnected' event
castReceiverManager.onSenderDisconnected = function(event) {
	console.log('Received Sender Disconnected event: ' + event.data);
	// if (castReceiverManager.getSenders().length == 0 && ) {
	// 	window.close();
	// }
}

// handler for 'systemvolumechanged' event
castReceiverManager.onSystemVolumeChanged = function(event) {
	console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +event.data['muted']);
}

// create a CastMessageBus to handle messages for a custom namespace
let messageBus = castReceiverManager.getCastMessageBus( NS )


// handler for the CastMessageBus message event
messageBus.onMessage = function(event) {

	let logMessage = 'Message [' + event.senderId + ']: ' + event.data

	console.log( logMessage );
	// display the message from the sender
	// displayText(event.data);
	artwork.app.changeSceneByName(event.data);

	// inform all senders on the CastMessageBus of the incoming message event
	// sender message listener will be invoked
	messageBus.send( event.senderId, logMessage );
}



// DEBUG MESSAGIN
let messageDebugBus = castReceiverManager.getCastMessageBus( DEBUG_NS )

messageDebugBus.onMessage(function( event ){

	switch( event.data.command ){

		case 'resize-canvas-css' :
			resizeCanvasCss( event.data.value )
			break
		case 'terminate' :
			castReceiverManager.stop()
			break
		case 'reload' :
			location.reload( event.data.value )
			break
		default: break;
	}
})

function resizeCanvasCss( dimension ){
	Object.assign( canvas.style, dimension )
}


// initialize the CastReceiverManager with an application status message
castReceiverManager.start({statusText: "Application is starting"});
// console.log('Receiver Manager started');



// utility function to display the text message in the input field
//let displayText = text => document.getElementById( "message" ).innerHTML = text