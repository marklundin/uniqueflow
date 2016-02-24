import api from './sender-api'
import signal from 'min-signal'



/**
 * Initialises a new session
 */

let initialize = cast => {

	return ( appID, namespace = 'urn:x-cast:com.google.cast' ) => {


		let session = null,
			devicesAvailable = false,
			connection

		/**
		 * session listener during initialization
		 */
		let onSessionAvailable = e => {
			console.log('New session ID:' + e.sessionId);
			session = e;
			session.addUpdateListener( sessionUpdateListener )  
			session.addMessageListener( namespace, ( ns, message ) => connection.message.dispatch( message )  )
			connection.session.dispatch( e )
		}


		/**
		* listener for session updates
		*/
		let sessionUpdateListener = isAlive => {
			let message = isAlive ? 'Session Updated' : 'Session Removed';
			message += ': ' + session.sessionId;
			console.log( message, session.status );
			if( !isAlive ) session = null
		}


		let sessionRequest = new cast.SessionRequest( appID ),
			apiConfig = new cast.ApiConfig( sessionRequest, onSessionAvailable, e => {
				devicesAvailable = e === 'available'
				connection.availability.dispatch( e ) 
			})



		/**
		 * send a message to the receiver using the custom namespace
		 * receiver CastMessageBus message handler will be invoked
		 * @param {string} message A message string
		 */

		let leave = _ => new Promise(( resolve, reject ) => session.leave( resolve, reject ))
		let stop  = _ => new Promise(( resolve, reject ) => session.stop( resolve, reject ))
		let send = message => new Promise(( resolve, reject ) => session ? session.sendMessage( namespace, message, resolve, reject ) : reject( 'No Session' ))

		let requestSession = _ => {

			return new Promise(( resolve, reject ) => cast.requestSession( resolve, reject ))

		}

		connection = { 
			send, leave, stop, requestSession, 
			session: new signal(),
			availability: new signal(),
			message: new signal()
		}


		return new Promise(( resolve, reject ) => {

	  		cast.initialize( apiConfig, _ => resolve( connection ), _ => reject('sma;ls') )

	  	})
	}
}


let onError = message => console.log( "onError: " + JSON.stringify( message ))
let onSuccess = message => console.log( "onSuccess: " + message )

/**
 * utility function to log messages from the receiver
 * @param {string} namespace The namespace of the message
 * @param {string} message A message string
 */
//let receiverMessage = ( namespace, message ) => console.log( "receiverMessage: " + namespace + ", " + message )

/**
 * receiver listener during initialization
 */
let onReceiverAvailabilityChanged = e => ( e === 'available' ) ? console.log( "receiver found" ) : console.log( "receiver list empty" )



export default api.then( initialize )





