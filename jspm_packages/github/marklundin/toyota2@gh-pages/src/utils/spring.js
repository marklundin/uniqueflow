
/*
	Super simple generalised spring constraint with damping. Useful for animating objects smoothly

	Usage: 
	```

		let transition = spring()
		valueToAnimate += transition( valueToAnimate, valueToAnimateTowards, timeDelta )

	```
*/

export let spring = ( springiness = 1.5 ) => {

	let force, root = Math.sqrt( springiness ), velocity = 0.0
		// damp = v => 

	return ( a, b, delta ) => {
		let theta = b - a
		force = ( theta * springiness ) + ( -velocity * 2.0 * root )
	    velocity += force * delta
		return velocity * delta 
	}
}



/*

	Same spring example in 3 dimensions
	Usage: 
	```

		let transition = spring()
		vec3ToAnimate.add( transition( vec3ToAnimate, vec3ToAnimateTowards, timeDelta ))

	```
*/

export let spring3 = ( springiness ) => {

	let transition = {
		x: spring( springiness ),
		y: spring( springiness ),
		z: spring( springiness )
	}

	let velocity = { x:0, y:0, z:0 }

	return ( a, b, delta ) => {

		velocity.x = transition.x( a.x, b.x, delta )
		velocity.y = transition.y( a.y, b.y, delta )
		velocity.z = transition.z( a.z, b.z, delta )

		return velocity

	}
}
