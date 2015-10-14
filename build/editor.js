// File:examples/js/libs/system.min.js

// system.js - http://github.com/mrdoob/system.js
'use strict';var System={browser:function(){var a=navigator.userAgent;return/Arora/i.test(a)?"Arora":/Chrome/i.test(a)?"Chrome":/Epiphany/i.test(a)?"Epiphany":/Firefox/i.test(a)?"Firefox":/Mobile(\/.*)? Safari/i.test(a)?"Mobile Safari":/MSIE/i.test(a)?"Internet Explorer":/Midori/i.test(a)?"Midori":/Opera/.test(a)?"Opera":/Safari/i.test(a)?"Safari":!1}(),os:function(){var a=navigator.userAgent;return/Android/i.test(a)?"Android":/CrOS/i.test(a)?"Chrome OS":/iP[ao]d|iPhone/i.test(a)?"iOS":/Linux/i.test(a)?
"Linux":/Mac OS/i.test(a)?"Mac OS":/windows/i.test(a)?"Windows":!1}(),support:{canvas:!!window.CanvasRenderingContext2D,localStorage:function(){try{return!!window.localStorage.getItem}catch(a){return!1}}(),file:!!window.File&&!!window.FileReader&&!!window.FileList&&!!window.Blob,fileSystem:!!window.requestFileSystem||!!window.webkitRequestFileSystem,getUserMedia:!!window.navigator.getUserMedia||!!window.navigator.webkitGetUserMedia||!!window.navigator.mozGetUserMedia||!!window.navigator.msGetUserMedia,
requestAnimationFrame:!!window.mozRequestAnimationFrame||!!window.webkitRequestAnimationFrame||!!window.oRequestAnimationFrame||!!window.msRequestAnimationFrame,sessionStorage:function(){try{return!!window.sessionStorage.getItem}catch(a){return!1}}(),webgl:function(){try{return!!window.WebGLRenderingContext&&!!document.createElement("canvas").getContext("experimental-webgl")}catch(a){return!1}}(),worker:!!window.Worker}};

// File:examples/js/controls/EditorControls.js

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.EditorControls = function ( object, domElement ) {

	domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;
	this.center = new THREE.Vector3();

	// internals

	var scope = this;
	var vector = new THREE.Vector3();

	var STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2 };
	var state = STATE.NONE;

	var center = this.center;
	var normalMatrix = new THREE.Matrix3();
	var pointer = new THREE.Vector2();
	var pointerOld = new THREE.Vector2();

	// events

	var changeEvent = { type: 'change' };

	this.focus = function ( target, frame ) {

		var scale = new THREE.Vector3();
		target.matrixWorld.decompose( center, new THREE.Quaternion(), scale );

		if ( frame && target.geometry ) {

			scale = ( scale.x + scale.y + scale.z ) / 3;
			center.add( target.geometry.boundingSphere.center.clone().multiplyScalar( scale ) );
			var radius = target.geometry.boundingSphere.radius * ( scale );
			var pos = object.position.clone().sub( center ).normalize().multiplyScalar( radius * 2 );
			object.position.copy( center ).add( pos );

		}

		object.lookAt( center );

		scope.dispatchEvent( changeEvent );

	};

	this.pan = function ( delta ) {

		var distance = object.position.distanceTo( center );

		delta.multiplyScalar( distance * 0.001 );
		delta.applyMatrix3( normalMatrix.getNormalMatrix( object.matrix ) );

		object.position.add( delta );
		center.add( delta );

		scope.dispatchEvent( changeEvent );

	};

	this.zoom = function ( delta ) {

		var distance = object.position.distanceTo( center );

		delta.multiplyScalar( distance * 0.001 );

		if ( delta.length() > distance ) return;

		delta.applyMatrix3( normalMatrix.getNormalMatrix( object.matrix ) );

		object.position.add( delta );

		scope.dispatchEvent( changeEvent );

	};

	this.rotate = function ( delta ) {

		vector.copy( object.position ).sub( center );

		var theta = Math.atan2( vector.x, vector.z );
		var phi = Math.atan2( Math.sqrt( vector.x * vector.x + vector.z * vector.z ), vector.y );

		theta += delta.x;
		phi += delta.y;

		var EPS = 0.000001;

		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = vector.length();

		vector.x = radius * Math.sin( phi ) * Math.sin( theta );
		vector.y = radius * Math.cos( phi );
		vector.z = radius * Math.sin( phi ) * Math.cos( theta );

		object.position.copy( center ).add( vector );

		object.lookAt( center );

		scope.dispatchEvent( changeEvent );

	};

	// mouse

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		if ( event.button === 0 ) {

			state = STATE.ROTATE;

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

		} else if ( event.button === 2 ) {

			state = STATE.PAN;

		}

		pointerOld.set( event.clientX, event.clientY );

		domElement.addEventListener( 'mousemove', onMouseMove, false );
		domElement.addEventListener( 'mouseup', onMouseUp, false );
		domElement.addEventListener( 'mouseout', onMouseUp, false );
		domElement.addEventListener( 'dblclick', onMouseUp, false );

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		pointer.set( event.clientX, event.clientY );

		var movementX = pointer.x - pointerOld.x;
		var movementY = pointer.y - pointerOld.y;

		if ( state === STATE.ROTATE ) {

			scope.rotate( new THREE.Vector3( - movementX * 0.005, - movementY * 0.005, 0 ) );

		} else if ( state === STATE.ZOOM ) {

			scope.zoom( new THREE.Vector3( 0, 0, movementY ) );

		} else if ( state === STATE.PAN ) {

			scope.pan( new THREE.Vector3( - movementX, movementY, 0 ) );

		}

		pointerOld.set( event.clientX, event.clientY );

	}

	function onMouseUp( event ) {

		domElement.removeEventListener( 'mousemove', onMouseMove, false );
		domElement.removeEventListener( 'mouseup', onMouseUp, false );
		domElement.removeEventListener( 'mouseout', onMouseUp, false );
		domElement.removeEventListener( 'dblclick', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		event.preventDefault();

		// if ( scope.enabled === false ) return;

		var delta = 0;

		if ( event.wheelDelta ) {

			// WebKit / Opera / Explorer 9

			delta = - event.wheelDelta;

		} else if ( event.detail ) {

			// Firefox

			delta = event.detail * 10;

		}

		scope.zoom( new THREE.Vector3( 0, 0, delta ) );

	}

	function contextmenu( event ) {

		event.preventDefault();

	}

	this.dispose = function() {

		domElement.removeEventListener( 'contextmenu', contextmenu, false );
		domElement.removeEventListener( 'mousedown', onMouseDown, false );
		domElement.removeEventListener( 'mousewheel', onMouseWheel, false );
		domElement.removeEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

		domElement.removeEventListener( 'mousemove', onMouseMove, false );
		domElement.removeEventListener( 'mouseup', onMouseUp, false );
		domElement.removeEventListener( 'mouseout', onMouseUp, false );
		domElement.removeEventListener( 'dblclick', onMouseUp, false );

		domElement.removeEventListener( 'touchstart', touchStart, false );
		domElement.removeEventListener( 'touchmove', touchMove, false );

	}

	domElement.addEventListener( 'contextmenu', contextmenu, false );
	domElement.addEventListener( 'mousedown', onMouseDown, false );
	domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

	// touch

	var touch = new THREE.Vector3();

	var touches = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
	var prevTouches = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

	var prevDistance = null;

	function touchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				break;

			case 2:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY, 0 );
				prevDistance = touches[ 0 ].distanceTo( touches[ 1 ] );
				break;

		}

		prevTouches[ 0 ].copy( touches[ 0 ] );
		prevTouches[ 1 ].copy( touches[ 1 ] );

	}


	function touchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		var getClosest = function( touch, touches ) {

			var closest = touches[ 0 ];

			for ( var i in touches ) {

				if ( closest.distanceTo( touch ) > touches[ i ].distanceTo( touch ) ) closest = touches[ i ];

			}

			return closest;

		};

		switch ( event.touches.length ) {

			case 1:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				scope.rotate( touches[ 0 ].sub( getClosest( touches[ 0 ], prevTouches ) ).multiplyScalar( - 0.005 ) );
				break;

			case 2:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY, 0 );
				distance = touches[ 0 ].distanceTo( touches[ 1 ] );
				scope.zoom( new THREE.Vector3( 0, 0, prevDistance - distance ) );
				prevDistance = distance;


				var offset0 = touches[ 0 ].clone().sub( getClosest( touches[ 0 ], prevTouches ) );
				var offset1 = touches[ 1 ].clone().sub( getClosest( touches[ 1 ], prevTouches ) );
				offset0.x = - offset0.x;
				offset1.x = - offset1.x;

				scope.pan( offset0.add( offset1 ).multiplyScalar( 0.5 ) );

				break;

		}

		prevTouches[ 0 ].copy( touches[ 0 ] );
		prevTouches[ 1 ].copy( touches[ 1 ] );

	}

	domElement.addEventListener( 'touchstart', touchStart, false );
	domElement.addEventListener( 'touchmove', touchMove, false );

};

THREE.EditorControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.EditorControls.prototype.constructor = THREE.EditorControls;

// File:examples/js/controls/TransformControls.js

/**
 * @author arodic / https://github.com/arodic
 */
 /*jshint sub:true*/

( function () {

	'use strict';


	var GizmoMaterial = function ( parameters ) {

		THREE.MeshBasicMaterial.call( this );

		this.depthTest = false;
		this.depthWrite = false;
		this.side = THREE.FrontSide;
		this.transparent = true;

		this.setValues( parameters );

		this.oldColor = this.color.clone();
		this.oldOpacity = this.opacity;

		this.highlight = function( highlighted ) {

			if ( highlighted ) {

				this.color.setRGB( 1, 1, 0 );
				this.opacity = 1;

			} else {

				this.color.copy( this.oldColor );
				this.opacity = this.oldOpacity;

			}

		};

	};

	GizmoMaterial.prototype = Object.create( THREE.MeshBasicMaterial.prototype );
	GizmoMaterial.prototype.constructor = GizmoMaterial;


	var GizmoLineMaterial = function ( parameters ) {

		THREE.LineBasicMaterial.call( this );

		this.depthTest = false;
		this.depthWrite = false;
		this.transparent = true;
		this.linewidth = 1;

		this.setValues( parameters );

		this.oldColor = this.color.clone();
		this.oldOpacity = this.opacity;

		this.highlight = function( highlighted ) {

			if ( highlighted ) {

				this.color.setRGB( 1, 1, 0 );
				this.opacity = 1;

			} else {

				this.color.copy( this.oldColor );
				this.opacity = this.oldOpacity;

			}

		};

	};

	GizmoLineMaterial.prototype = Object.create( THREE.LineBasicMaterial.prototype );
	GizmoLineMaterial.prototype.constructor = GizmoLineMaterial;


	var pickerMaterial = new GizmoMaterial( { visible: false, transparent: false } );


	THREE.TransformGizmo = function () {

		var scope = this;

		this.init = function () {

			THREE.Object3D.call( this );

			this.handles = new THREE.Object3D();
			this.pickers = new THREE.Object3D();
			this.planes = new THREE.Object3D();

			this.add( this.handles );
			this.add( this.pickers );
			this.add( this.planes );

			//// PLANES

			var planeGeometry = new THREE.PlaneBufferGeometry( 50, 50, 2, 2 );
			var planeMaterial = new THREE.MeshBasicMaterial( { visible: false, side: THREE.DoubleSide } );

			var planes = {
				"XY":   new THREE.Mesh( planeGeometry, planeMaterial ),
				"YZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
				"XZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
				"XYZE": new THREE.Mesh( planeGeometry, planeMaterial )
			};

			this.activePlane = planes[ "XYZE" ];

			planes[ "YZ" ].rotation.set( 0, Math.PI / 2, 0 );
			planes[ "XZ" ].rotation.set( - Math.PI / 2, 0, 0 );

			for ( var i in planes ) {

				planes[ i ].name = i;
				this.planes.add( planes[ i ] );
				this.planes[ i ] = planes[ i ];

			}

			//// HANDLES AND PICKERS

			var setupGizmos = function( gizmoMap, parent ) {

				for ( var name in gizmoMap ) {

					for ( i = gizmoMap[ name ].length; i --; ) {

						var object = gizmoMap[ name ][ i ][ 0 ];
						var position = gizmoMap[ name ][ i ][ 1 ];
						var rotation = gizmoMap[ name ][ i ][ 2 ];

						object.name = name;

						if ( position ) object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
						if ( rotation ) object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );

						parent.add( object );

					}

				}

			};

			setupGizmos( this.handleGizmos, this.handles );
			setupGizmos( this.pickerGizmos, this.pickers );

			// reset Transformations

			this.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {

					child.updateMatrix();

					var tempGeometry = child.geometry.clone();
					tempGeometry.applyMatrix( child.matrix );
					child.geometry = tempGeometry;

					child.position.set( 0, 0, 0 );
					child.rotation.set( 0, 0, 0 );
					child.scale.set( 1, 1, 1 );

				}

			} );

		};

		this.highlight = function ( axis ) {

			this.traverse( function( child ) {

				if ( child.material && child.material.highlight ) {

					if ( child.name === axis ) {

						child.material.highlight( true );

					} else {

						child.material.highlight( false );

					}

				}

			} );

		};

	};

	THREE.TransformGizmo.prototype = Object.create( THREE.Object3D.prototype );
	THREE.TransformGizmo.prototype.constructor = THREE.TransformGizmo;

	THREE.TransformGizmo.prototype.update = function ( rotation, eye ) {

		var vec1 = new THREE.Vector3( 0, 0, 0 );
		var vec2 = new THREE.Vector3( 0, 1, 0 );
		var lookAtMatrix = new THREE.Matrix4();

		this.traverse( function( child ) {

			if ( child.name.search( "E" ) !== - 1 ) {

				child.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) );

			} else if ( child.name.search( "X" ) !== - 1 || child.name.search( "Y" ) !== - 1 || child.name.search( "Z" ) !== - 1 ) {

				child.quaternion.setFromEuler( rotation );

			}

		} );

	};

	THREE.TransformGizmoTranslate = function () {

		THREE.TransformGizmo.call( this );

		var arrowGeometry = new THREE.Geometry();
		var mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0, 0.05, 0.2, 12, 1, false ) );
		mesh.position.y = 0.5;
		mesh.updateMatrix();

		arrowGeometry.merge( mesh.geometry, mesh.matrix );

		var lineXGeometry = new THREE.BufferGeometry();
		lineXGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

		var lineYGeometry = new THREE.BufferGeometry();
		lineYGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

		var lineZGeometry = new THREE.BufferGeometry();
		lineZGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

		this.handleGizmos = {

			X: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
				[ new THREE.Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
			],

			Y: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
				[	new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
			],

			Z: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
				[ new THREE.Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
			],

			XYZ: [
				[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ), [ 0, 0, 0 ], [ 0, 0, 0 ] ]
			],

			XY: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xffff00, opacity: 0.25 } ) ), [ 0.15, 0.15, 0 ] ]
			],

			YZ: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0x00ffff, opacity: 0.25 } ) ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ] ]
			],

			XZ: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xff00ff, opacity: 0.25 } ) ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ] ]
			]

		};

		this.pickerGizmos = {

			X: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
			],

			Y: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
			],

			Z: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
			],

			XYZ: [
				[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.2, 0 ), pickerMaterial ) ]
			],

			XY: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0.2, 0 ] ]
			],

			YZ: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ] ]
			],

			XZ: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0, 0.2 ], [ - Math.PI / 2, 0, 0 ] ]
			]

		};

		this.setActivePlane = function ( axis, eye ) {

			var tempMatrix = new THREE.Matrix4();
			eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

			if ( axis === "X" ) {

				this.activePlane = this.planes[ "XY" ];

				if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

			}

			if ( axis === "Y" ) {

				this.activePlane = this.planes[ "XY" ];

				if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

			}

			if ( axis === "Z" ) {

				this.activePlane = this.planes[ "XZ" ];

				if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

			}

			if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

			if ( axis === "XY" ) this.activePlane = this.planes[ "XY" ];

			if ( axis === "YZ" ) this.activePlane = this.planes[ "YZ" ];

			if ( axis === "XZ" ) this.activePlane = this.planes[ "XZ" ];

		};

		this.init();

	};

	THREE.TransformGizmoTranslate.prototype = Object.create( THREE.TransformGizmo.prototype );
	THREE.TransformGizmoTranslate.prototype.constructor = THREE.TransformGizmoTranslate;

	THREE.TransformGizmoRotate = function () {

		THREE.TransformGizmo.call( this );

		var CircleGeometry = function ( radius, facing, arc ) {

			var geometry = new THREE.BufferGeometry();
			var vertices = [];
			arc = arc ? arc : 1;

			for ( var i = 0; i <= 64 * arc; ++ i ) {

				if ( facing === 'x' ) vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
				if ( facing === 'y' ) vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius );
				if ( facing === 'z' ) vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 );

			}

			geometry.addAttribute( 'position', new THREE.Float32Attribute( vertices, 3 ) );
			return geometry;

		};

		this.handleGizmos = {

			X: [
				[ new THREE.Line( new CircleGeometry( 1, 'x', 0.5 ), new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
			],

			Y: [
				[ new THREE.Line( new CircleGeometry( 1, 'y', 0.5 ), new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
			],

			Z: [
				[ new THREE.Line( new CircleGeometry( 1, 'z', 0.5 ), new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
			],

			E: [
				[ new THREE.Line( new CircleGeometry( 1.25, 'z', 1 ), new GizmoLineMaterial( { color: 0xcccc00 } ) ) ]
			],

			XYZE: [
				[ new THREE.Line( new CircleGeometry( 1, 'z', 1 ), new GizmoLineMaterial( { color: 0x787878 } ) ) ]
			]

		};

		this.pickerGizmos = {

			X: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ] ]
			],

			Y: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ]
			],

			Z: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
			],

			E: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 1.25, 0.12, 2, 24 ), pickerMaterial ) ]
			],

			XYZE: [
				[ new THREE.Mesh( new THREE.Geometry() ) ]// TODO
			]

		};

		this.setActivePlane = function ( axis ) {

			if ( axis === "E" ) this.activePlane = this.planes[ "XYZE" ];

			if ( axis === "X" ) this.activePlane = this.planes[ "YZ" ];

			if ( axis === "Y" ) this.activePlane = this.planes[ "XZ" ];

			if ( axis === "Z" ) this.activePlane = this.planes[ "XY" ];

		};

		this.update = function ( rotation, eye2 ) {

			THREE.TransformGizmo.prototype.update.apply( this, arguments );

			var group = {

				handles: this[ "handles" ],
				pickers: this[ "pickers" ],

			};

			var tempMatrix = new THREE.Matrix4();
			var worldRotation = new THREE.Euler( 0, 0, 1 );
			var tempQuaternion = new THREE.Quaternion();
			var unitX = new THREE.Vector3( 1, 0, 0 );
			var unitY = new THREE.Vector3( 0, 1, 0 );
			var unitZ = new THREE.Vector3( 0, 0, 1 );
			var quaternionX = new THREE.Quaternion();
			var quaternionY = new THREE.Quaternion();
			var quaternionZ = new THREE.Quaternion();
			var eye = eye2.clone();

			worldRotation.copy( this.planes[ "XY" ].rotation );
			tempQuaternion.setFromEuler( worldRotation );

			tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix );
			eye.applyMatrix4( tempMatrix );

			this.traverse( function( child ) {

				tempQuaternion.setFromEuler( worldRotation );

				if ( child.name === "X" ) {

					quaternionX.setFromAxisAngle( unitX, Math.atan2( - eye.y, eye.z ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
					child.quaternion.copy( tempQuaternion );

				}

				if ( child.name === "Y" ) {

					quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
					child.quaternion.copy( tempQuaternion );

				}

				if ( child.name === "Z" ) {

					quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
					child.quaternion.copy( tempQuaternion );

				}

			} );

		};

		this.init();

	};

	THREE.TransformGizmoRotate.prototype = Object.create( THREE.TransformGizmo.prototype );
	THREE.TransformGizmoRotate.prototype.constructor = THREE.TransformGizmoRotate;

	THREE.TransformGizmoScale = function () {

		THREE.TransformGizmo.call( this );

		var arrowGeometry = new THREE.Geometry();
		var mesh = new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ) );
		mesh.position.y = 0.5;
		mesh.updateMatrix();

		arrowGeometry.merge( mesh.geometry, mesh.matrix );

		var lineXGeometry = new THREE.BufferGeometry();
		lineXGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

		var lineYGeometry = new THREE.BufferGeometry();
		lineYGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

		var lineZGeometry = new THREE.BufferGeometry();
		lineZGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

		this.handleGizmos = {

			X: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
				[ new THREE.Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
			],

			Y: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
				[ new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
			],

			Z: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
				[ new THREE.Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
			],

			XYZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ) ]
			]

		};

		this.pickerGizmos = {

			X: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
			],

			Y: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
			],

			Z: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
			],

			XYZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.4, 0.4, 0.4 ), pickerMaterial ) ]
			]

		};

		this.setActivePlane = function ( axis, eye ) {

			var tempMatrix = new THREE.Matrix4();
			eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

			if ( axis === "X" ) {

				this.activePlane = this.planes[ "XY" ];
				if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

			}

			if ( axis === "Y" ) {

				this.activePlane = this.planes[ "XY" ];
				if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

			}

			if ( axis === "Z" ) {

				this.activePlane = this.planes[ "XZ" ];
				if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

			}

			if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

		};

		this.init();

	};

	THREE.TransformGizmoScale.prototype = Object.create( THREE.TransformGizmo.prototype );
	THREE.TransformGizmoScale.prototype.constructor = THREE.TransformGizmoScale;

	THREE.TransformControls = function ( camera, domElement ) {

		// TODO: Make non-uniform scale and rotate play nice in hierarchies
		// TODO: ADD RXYZ contol

		THREE.Object3D.call( this );

		domElement = ( domElement !== undefined ) ? domElement : document;

		this.object = undefined;
		this.visible = false;
		this.translationSnap = null;
		this.rotationSnap = null;
		this.space = "world";
		this.size = 1;
		this.axis = null;

		var scope = this;

		var _mode = "translate";
		var _dragging = false;
		var _plane = "XY";
		var _gizmo = {

			"translate": new THREE.TransformGizmoTranslate(),
			"rotate": new THREE.TransformGizmoRotate(),
			"scale": new THREE.TransformGizmoScale()
		};

		for ( var type in _gizmo ) {

			var gizmoObj = _gizmo[ type ];

			gizmoObj.visible = ( type === _mode );
			this.add( gizmoObj );

		}

		var changeEvent = { type: "change" };
		var mouseDownEvent = { type: "mouseDown" };
		var mouseUpEvent = { type: "mouseUp", mode: _mode };
		var objectChangeEvent = { type: "objectChange" };

		var ray = new THREE.Raycaster();
		var pointerVector = new THREE.Vector2();

		var point = new THREE.Vector3();
		var offset = new THREE.Vector3();

		var rotation = new THREE.Vector3();
		var offsetRotation = new THREE.Vector3();
		var scale = 1;

		var lookAtMatrix = new THREE.Matrix4();
		var eye = new THREE.Vector3();

		var tempMatrix = new THREE.Matrix4();
		var tempVector = new THREE.Vector3();
		var tempQuaternion = new THREE.Quaternion();
		var unitX = new THREE.Vector3( 1, 0, 0 );
		var unitY = new THREE.Vector3( 0, 1, 0 );
		var unitZ = new THREE.Vector3( 0, 0, 1 );

		var quaternionXYZ = new THREE.Quaternion();
		var quaternionX = new THREE.Quaternion();
		var quaternionY = new THREE.Quaternion();
		var quaternionZ = new THREE.Quaternion();
		var quaternionE = new THREE.Quaternion();

		var oldPosition = new THREE.Vector3();
		var oldScale = new THREE.Vector3();
		var oldRotationMatrix = new THREE.Matrix4();

		var parentRotationMatrix  = new THREE.Matrix4();
		var parentScale = new THREE.Vector3();

		var worldPosition = new THREE.Vector3();
		var worldRotation = new THREE.Euler();
		var worldRotationMatrix  = new THREE.Matrix4();
		var camPosition = new THREE.Vector3();
		var camRotation = new THREE.Euler();

		domElement.addEventListener( "mousedown", onPointerDown, false );
		domElement.addEventListener( "touchstart", onPointerDown, false );

		domElement.addEventListener( "mousemove", onPointerHover, false );
		domElement.addEventListener( "touchmove", onPointerHover, false );

		domElement.addEventListener( "mousemove", onPointerMove, false );
		domElement.addEventListener( "touchmove", onPointerMove, false );

		domElement.addEventListener( "mouseup", onPointerUp, false );
		domElement.addEventListener( "mouseout", onPointerUp, false );
		domElement.addEventListener( "touchend", onPointerUp, false );
		domElement.addEventListener( "touchcancel", onPointerUp, false );
		domElement.addEventListener( "touchleave", onPointerUp, false );

		this.dispose = function () {

			domElement.removeEventListener( "mousedown", onPointerDown );
			domElement.removeEventListener( "touchstart", onPointerDown );

			domElement.removeEventListener( "mousemove", onPointerHover );
			domElement.removeEventListener( "touchmove", onPointerHover );

			domElement.removeEventListener( "mousemove", onPointerMove );
			domElement.removeEventListener( "touchmove", onPointerMove );

			domElement.removeEventListener( "mouseup", onPointerUp );
			domElement.removeEventListener( "mouseout", onPointerUp );
			domElement.removeEventListener( "touchend", onPointerUp );
			domElement.removeEventListener( "touchcancel", onPointerUp );
			domElement.removeEventListener( "touchleave", onPointerUp );

		};

		this.attach = function ( object ) {

			this.object = object;
			this.visible = true;
			this.update();

		};

		this.detach = function () {

			this.object = undefined;
			this.visible = false;
			this.axis = null;

		};

		this.setMode = function ( mode ) {

			_mode = mode ? mode : _mode;

			if ( _mode === "scale" ) scope.space = "local";

			for ( var type in _gizmo ) _gizmo[ type ].visible = ( type === _mode );

			this.update();
			scope.dispatchEvent( changeEvent );

		};

		this.setTranslationSnap = function ( translationSnap ) {

			scope.translationSnap = translationSnap;

		};

		this.setRotationSnap = function ( rotationSnap ) {

			scope.rotationSnap = rotationSnap;

		};

		this.setSize = function ( size ) {

			scope.size = size;
			this.update();
			scope.dispatchEvent( changeEvent );

		};

		this.setSpace = function ( space ) {

			scope.space = space;
			this.update();
			scope.dispatchEvent( changeEvent );

		};

		this.update = function () {

			if ( scope.object === undefined ) return;

			scope.object.updateMatrixWorld();
			worldPosition.setFromMatrixPosition( scope.object.matrixWorld );
			worldRotation.setFromRotationMatrix( tempMatrix.extractRotation( scope.object.matrixWorld ) );

			camera.updateMatrixWorld();
			camPosition.setFromMatrixPosition( camera.matrixWorld );
			camRotation.setFromRotationMatrix( tempMatrix.extractRotation( camera.matrixWorld ) );

			scale = worldPosition.distanceTo( camPosition ) / 6 * scope.size;
			this.position.copy( worldPosition );
			this.scale.set( scale, scale, scale );

			eye.copy( camPosition ).sub( worldPosition ).normalize();

			if ( scope.space === "local" ) {

				_gizmo[ _mode ].update( worldRotation, eye );

			} else if ( scope.space === "world" ) {

				_gizmo[ _mode ].update( new THREE.Euler(), eye );

			}

			_gizmo[ _mode ].highlight( scope.axis );

		};

		function onPointerHover( event ) {

			if ( scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

			var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

			var intersect = intersectObjects( pointer, _gizmo[ _mode ].pickers.children );

			var axis = null;

			if ( intersect ) {

				axis = intersect.object.name;

				event.preventDefault();

			}

			if ( scope.axis !== axis ) {

				scope.axis = axis;
				scope.update();
				scope.dispatchEvent( changeEvent );

			}

		}

		function onPointerDown( event ) {

			if ( scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

			var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

			if ( pointer.button === 0 || pointer.button === undefined ) {

				var intersect = intersectObjects( pointer, _gizmo[ _mode ].pickers.children );

				if ( intersect ) {

					event.preventDefault();
					event.stopPropagation();

					scope.dispatchEvent( mouseDownEvent );

					scope.axis = intersect.object.name;

					scope.update();

					eye.copy( camPosition ).sub( worldPosition ).normalize();

					_gizmo[ _mode ].setActivePlane( scope.axis, eye );

					var planeIntersect = intersectObjects( pointer, [ _gizmo[ _mode ].activePlane ] );

					if ( planeIntersect ) {

						oldPosition.copy( scope.object.position );
						oldScale.copy( scope.object.scale );

						oldRotationMatrix.extractRotation( scope.object.matrix );
						worldRotationMatrix.extractRotation( scope.object.matrixWorld );

						parentRotationMatrix.extractRotation( scope.object.parent.matrixWorld );
						parentScale.setFromMatrixScale( tempMatrix.getInverse( scope.object.parent.matrixWorld ) );

						offset.copy( planeIntersect.point );

					}

				}

			}

			_dragging = true;

		}

		function onPointerMove( event ) {

			if ( scope.object === undefined || scope.axis === null || _dragging === false || ( event.button !== undefined && event.button !== 0 ) ) return;

			var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

			var planeIntersect = intersectObjects( pointer, [ _gizmo[ _mode ].activePlane ] );

			if ( planeIntersect === false ) return;

			event.preventDefault();
			event.stopPropagation();

			point.copy( planeIntersect.point );

			if ( _mode === "translate" ) {

				point.sub( offset );
				point.multiply( parentScale );

				if ( scope.space === "local" ) {

					point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

					if ( scope.axis.search( "X" ) === - 1 ) point.x = 0;
					if ( scope.axis.search( "Y" ) === - 1 ) point.y = 0;
					if ( scope.axis.search( "Z" ) === - 1 ) point.z = 0;

					point.applyMatrix4( oldRotationMatrix );

					scope.object.position.copy( oldPosition );
					scope.object.position.add( point );

				}

				if ( scope.space === "world" || scope.axis.search( "XYZ" ) !== - 1 ) {

					if ( scope.axis.search( "X" ) === - 1 ) point.x = 0;
					if ( scope.axis.search( "Y" ) === - 1 ) point.y = 0;
					if ( scope.axis.search( "Z" ) === - 1 ) point.z = 0;

					point.applyMatrix4( tempMatrix.getInverse( parentRotationMatrix ) );

					scope.object.position.copy( oldPosition );
					scope.object.position.add( point );

				}

				if ( scope.translationSnap !== null ) {

					if ( scope.space === "local" ) {

						scope.object.position.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

					}

					if ( scope.axis.search( "X" ) !== - 1 ) scope.object.position.x = Math.round( scope.object.position.x / scope.translationSnap ) * scope.translationSnap;
					if ( scope.axis.search( "Y" ) !== - 1 ) scope.object.position.y = Math.round( scope.object.position.y / scope.translationSnap ) * scope.translationSnap;
					if ( scope.axis.search( "Z" ) !== - 1 ) scope.object.position.z = Math.round( scope.object.position.z / scope.translationSnap ) * scope.translationSnap;

					if ( scope.space === "local" ) {

						scope.object.position.applyMatrix4( worldRotationMatrix );

					}

				}

			} else if ( _mode === "scale" ) {

				point.sub( offset );
				point.multiply( parentScale );

				if ( scope.space === "local" ) {

					if ( scope.axis === "XYZ" ) {

						scale = 1 + ( ( point.y ) / 50 );

						scope.object.scale.x = oldScale.x * scale;
						scope.object.scale.y = oldScale.y * scale;
						scope.object.scale.z = oldScale.z * scale;

					} else {

						point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

						if ( scope.axis === "X" ) scope.object.scale.x = oldScale.x * ( 1 + point.x / 50 );
						if ( scope.axis === "Y" ) scope.object.scale.y = oldScale.y * ( 1 + point.y / 50 );
						if ( scope.axis === "Z" ) scope.object.scale.z = oldScale.z * ( 1 + point.z / 50 );

					}

				}

			} else if ( _mode === "rotate" ) {

				point.sub( worldPosition );
				point.multiply( parentScale );
				tempVector.copy( offset ).sub( worldPosition );
				tempVector.multiply( parentScale );

				if ( scope.axis === "E" ) {

					point.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );
					tempVector.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );

					rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
					offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

					tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

					quaternionE.setFromAxisAngle( eye, rotation.z - offsetRotation.z );
					quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionE );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

					scope.object.quaternion.copy( tempQuaternion );

				} else if ( scope.axis === "XYZE" ) {

					quaternionE.setFromEuler( point.clone().cross( tempVector ).normalize() ); // rotation axis

					tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );
					quaternionX.setFromAxisAngle( quaternionE, - point.clone().angleTo( tempVector ) );
					quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

					scope.object.quaternion.copy( tempQuaternion );

				} else if ( scope.space === "local" ) {

					point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

					tempVector.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

					rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
					offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

					quaternionXYZ.setFromRotationMatrix( oldRotationMatrix );

					if ( scope.rotationSnap !== null ) {

						quaternionX.setFromAxisAngle( unitX, Math.round( ( rotation.x - offsetRotation.x ) / scope.rotationSnap ) * scope.rotationSnap );
						quaternionY.setFromAxisAngle( unitY, Math.round( ( rotation.y - offsetRotation.y ) / scope.rotationSnap ) * scope.rotationSnap );
						quaternionZ.setFromAxisAngle( unitZ, Math.round( ( rotation.z - offsetRotation.z ) / scope.rotationSnap ) * scope.rotationSnap );

					} else {

						quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
						quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
						quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

					}

					if ( scope.axis === "X" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionX );
					if ( scope.axis === "Y" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionY );
					if ( scope.axis === "Z" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionZ );

					scope.object.quaternion.copy( quaternionXYZ );

				} else if ( scope.space === "world" ) {

					rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
					offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

					tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

					if ( scope.rotationSnap !== null ) {

						quaternionX.setFromAxisAngle( unitX, Math.round( ( rotation.x - offsetRotation.x ) / scope.rotationSnap ) * scope.rotationSnap );
						quaternionY.setFromAxisAngle( unitY, Math.round( ( rotation.y - offsetRotation.y ) / scope.rotationSnap ) * scope.rotationSnap );
						quaternionZ.setFromAxisAngle( unitZ, Math.round( ( rotation.z - offsetRotation.z ) / scope.rotationSnap ) * scope.rotationSnap );

					} else {

						quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
						quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
						quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

					}

					quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

					if ( scope.axis === "X" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
					if ( scope.axis === "Y" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
					if ( scope.axis === "Z" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );

					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

					scope.object.quaternion.copy( tempQuaternion );

				}

			}

			scope.update();
			scope.dispatchEvent( changeEvent );
			scope.dispatchEvent( objectChangeEvent );

		}

		function onPointerUp( event ) {

			if ( event.button !== undefined && event.button !== 0 ) return;

			if ( _dragging && ( scope.axis !== null ) ) {

				mouseUpEvent.mode = _mode;
				scope.dispatchEvent( mouseUpEvent )

			}

			_dragging = false;
			onPointerHover( event );

		}

		function intersectObjects( pointer, objects ) {

			var rect = domElement.getBoundingClientRect();
			var x = ( pointer.clientX - rect.left ) / rect.width;
			var y = ( pointer.clientY - rect.top ) / rect.height;

			pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1 );
			ray.setFromCamera( pointerVector, camera );

			var intersections = ray.intersectObjects( objects, true );
			return intersections[ 0 ] ? intersections[ 0 ] : false;

		}

	};

	THREE.TransformControls.prototype = Object.create( THREE.Object3D.prototype );
	THREE.TransformControls.prototype.constructor = THREE.TransformControls;

}() );

// File:examples/js/loaders/BabylonLoader.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BabylonLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.BabylonLoader.prototype = {

	constructor: THREE.ObjectLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( json ) {

		var materials = this.parseMaterials( json );
		var scene = this.parseObjects( json, materials );

		return scene;

	},

	parseMaterials: function ( json ) {

		var materials = {};

		for ( var i = 0, l = json.materials.length; i < l; i ++ ) {

			var data = json.materials[ i ];

			var material = new THREE.MeshPhongMaterial();
			material.name = data.name;
			material.color.fromArray( data.diffuse );
			material.emissive.fromArray( data.emissive );
			material.specular.fromArray( data.specular );
			material.shininess = data.specularPower;
			material.opacity = data.alpha;

			materials[ data.id ] = material;

		}

		if ( json.multiMaterials ) {

			for ( var i = 0, l = json.multiMaterials.length; i < l; i ++ ) {

				var data = json.multiMaterials[ i ];

				console.warn( 'THREE.BabylonLoader: Multi materials not yet supported.' );

				materials[ data.id ] = new THREE.MeshPhongMaterial();

			}

		}

		return materials;

	},

	parseGeometry: function ( json ) {

		var geometry = new THREE.BufferGeometry();

		// indices

		var indices = new Uint16Array( json.indices );

		geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );

		// positions

		var positions = new Float32Array( json.positions );

		for ( var j = 2, jl = positions.length; j < jl; j += 3 ) {

			positions[ j ] = - positions[ j ];

		}

		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		// normals

		if ( json.normals ) {

			var normals = new Float32Array( json.normals );

			for ( var j = 2, jl = normals.length; j < jl; j += 3 ) {

				normals[ j ] = - normals[ j ];

			}

			geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

		}

		// uvs

		if ( json.uvs ) {

			var uvs = new Float32Array( json.uvs );

			geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

		}

		// offsets

		var subMeshes = json.subMeshes;

		if ( subMeshes ) {

			for ( var j = 0, jl = subMeshes.length; j < jl; j ++ ) {

				var subMesh = subMeshes[ j ];

				geometry.addGroup( subMesh.indexStart, subMesh.indexCount );

			}

		}

		return geometry;

	},

	parseObjects: function ( json, materials ) {

		var objects = {};
		var scene = new THREE.Scene();

		var cameras = json.cameras;

		for ( var i = 0, l = cameras.length; i < l; i ++ ) {

			var data = cameras[ i ];

			var camera = new THREE.PerspectiveCamera( ( data.fov / Math.PI ) * 180, 1.33, data.minZ, data.maxZ );

			camera.name = data.name;
			camera.position.fromArray( data.position );
			if ( data.rotation ) camera.rotation.fromArray( data.rotation );

			objects[ data.id ] = camera;

		}

		var lights = json.lights;

		for ( var i = 0, l = lights.length; i < l; i ++ ) {

			var data = lights[ i ];

			var light;

			switch ( data.type ) {

				case 0:
					light = new THREE.PointLight();
					break;

				case 1:
					light = new THREE.DirectionalLight();
					break;

				case 2:
					light = new THREE.SpotLight();
					break;

				case 3:
					light = new THREE.HemisphereLight();
					break;
			}

			light.name = data.name;
			if ( data.position ) light.position.set( data.position[ 0 ], data.position[ 1 ], - data.position[ 2 ] );
			light.color.fromArray( data.diffuse );
			if ( data.groundColor ) light.groundColor.fromArray( data.groundColor );
			if ( data.intensity ) light.intensity = data.intensity;

			objects[ data.id ] = light;

			scene.add( light );

		}

		var meshes = json.meshes;

		for ( var i = 0, l = meshes.length; i < l; i ++ ) {

			var data = meshes[ i ];

			var object;

			if ( data.indices ) {

				var geometry = this.parseGeometry( data );

				object = new THREE.Mesh( geometry, materials[ data.materialId ] );

			} else {

				object = new THREE.Group();

			}

			object.name = data.name;
			object.position.set( data.position[ 0 ], data.position[ 1 ], - data.position[ 2 ] );
			object.rotation.fromArray( data.rotation );
			if ( data.rotationQuaternion ) object.quaternion.fromArray( data.rotationQuaternion );
			object.scale.fromArray( data.scaling );
			// object.visible = data.isVisible;

			if ( data.parentId ) {

				objects[ data.parentId ].add( object );

			} else {

				scene.add( object );

			}

			objects[ data.id ] = object;

		}

		return scene;

	}

};

// File:examples/js/loaders/ColladaLoader.js

/**
* @author Tim Knip / http://www.floorplanner.com/ / tim at floorplanner.com
* @author Tony Parisi / http://www.tonyparisi.com/
*/


( function() {

	var COLLADA = null;
	var scene = null;
	var visualScene;
	var kinematicsModel;

	var readyCallbackFunc = null;

	var sources = {};
	var images = {};
	var animations = {};
	var controllers = {};
	var geometries = {};
	var materials = {};
	var effects = {};
	var cameras = {};
	var lights = {};

	var animData;
	var kinematics;
	var visualScenes;
	var kinematicsModels;
	var baseUrl;
	var morphs;
	var skins;

	var flip_uv = true;
	var preferredShading = THREE.SmoothShading;

	var colladaUnit = 1.0;
	var colladaUp = 'Y';
	var upConversion = null;

	var options = {
		// Force Geometry to always be centered at the local origin of the
		// containing Mesh.
		centerGeometry: false,

		// Axis conversion is done for geometries, animations, and controllers.
		// If we ever pull cameras or lights out of the COLLADA file, they'll
		// need extra work.
		convertUpAxis: false,

		subdivideFaces: true,

		upAxis: 'Y',

		// For reflective or refractive materials we'll use this cubemap
		defaultEnvMap: null

	};

	THREE.ColladaLoader = function ( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

		/*

		return {

			load: load,
			parse: parse,
			setPreferredShading: setPreferredShading,
			applySkin: applySkin,
			geometries : geometries,
			options: options

		};

		*/

	};

	THREE.ColladaLoader.prototype = {

		constructor: THREE.ColladaLoader,

		options: options, //hack

		load: function ( url, onLoad, onProgress, onError ) {

			var length = 0;

			if ( document.implementation && document.implementation.createDocument ) {

				var scope = this;

				var loader = new THREE.XHRLoader( this.manager );
				loader.setCrossOrigin( this.crossOrigin );
				loader.load( url, function ( text ) {

					var parts = url.split( '/' );
					parts.pop();
					baseUrl = ( parts.length < 1 ? '.' : parts.join( '/' ) ) + '/';

					var xmlParser = new DOMParser();
					var responseXML = xmlParser.parseFromString( text, "application/xml" );
					onLoad( scope.parse( responseXML, url ) );

				}, onProgress, onError );

			} else {

				alert( "Don't know how to parse XML!" );

			}

		},

		setCrossOrigin: function ( value ) {

			this.crossOrigin = value;

		},

		parse: function( doc ) {

			COLLADA = doc;

			this.parseAsset();
			this.setUpConversion();
			images = this.parseLib( "library_images image", _Image, "image" );
			materials = this.parseLib( "library_materials material", Material, "material" );
			effects = this.parseLib( "library_effects effect", Effect, "effect" );
			geometries = this.parseLib( "library_geometries geometry", Geometry, "geometry" );
			cameras = this.parseLib( "library_cameras camera", Camera, "camera" );
			lights = this.parseLib( "library_lights light", Light, "light" );
			controllers = this.parseLib( "library_controllers controller", Controller, "controller" );
			animations = this.parseLib( "library_animations animation", Animation, "animation" );
			visualScenes = this.parseLib( "library_visual_scenes visual_scene", VisualScene, "visual_scene" );
			kinematicsModels = this.parseLib( "library_kinematics_models kinematics_model", KinematicsModel, "kinematics_model" );

			morphs = [];
			skins = [];

			visualScene = this.parseScene();
			scene = new THREE.Group();

			for ( var i = 0; i < visualScene.nodes.length; i ++ ) {

				scene.add( createSceneGraph( visualScene.nodes[ i ] ) );

			}

			// unit conversion
			scene.scale.multiplyScalar( colladaUnit );

			this.createAnimations();

			kinematicsModel = this.parseKinematicsModel();
			this.createKinematics();

			var result = {
				scene: scene,
				morphs: morphs,
				skins: skins,
				animations: animData,
				kinematics: kinematics,
				dae: {
					images: images,
					materials: materials,
					cameras: cameras,
					lights: lights,
					effects: effects,
					geometries: geometries,
					controllers: controllers,
					animations: animations,
					visualScenes: visualScenes,
					visualScene: visualScene,
					scene: visualScene,
					kinematicsModels: kinematicsModels,
					kinematicsModel: kinematicsModel
				}
			};

			return result;

		},

		setPreferredShading: function ( shading ) {

			preferredShading = shading;

		},

		parseAsset: function () {

			var elements = COLLADA.querySelectorAll( 'asset' );

			var element = elements[ 0 ];

			if ( element && element.childNodes ) {

				for ( var i = 0; i < element.childNodes.length; i ++ ) {

					var child = element.childNodes[ i ];

					switch ( child.nodeName ) {

						case 'unit':

							var meter = child.getAttribute( 'meter' );

							if ( meter ) {

								colladaUnit = parseFloat( meter );

							}

							break;

						case 'up_axis':

							colladaUp = child.textContent.charAt( 0 );
							break;

					}

				}

			}

		},

		parseLib: function ( q, classSpec, prefix ) {

			var elements = COLLADA.querySelectorAll( q );

			var lib = {};

			var i = 0;

			var elementsLength = elements.length;

			for ( var j = 0; j < elementsLength; j ++ ) {

				var element = elements[ j ];
				var daeElement = ( new classSpec() ).parse( element );

				if ( ! daeElement.id || daeElement.id.length === 0 ) daeElement.id = prefix + ( i ++ );
				lib[ daeElement.id ] = daeElement;

			}

			return lib;

		},

		parseScene: function () {

			var sceneElement = COLLADA.querySelectorAll( 'scene instance_visual_scene' )[ 0 ];

			if ( sceneElement ) {

				var url = sceneElement.getAttribute( 'url' ).replace( /^#/, '' );
				return visualScenes[ url.length > 0 ? url : 'visual_scene0' ];

			} else {

				return null;

			}

		},

		parseKinematicsModel: function () {

			var kinematicsModelElement = COLLADA.querySelectorAll( 'instance_kinematics_model' )[ 0 ];

			if ( kinematicsModelElement ) {

				var url = kinematicsModelElement.getAttribute( 'url' ).replace( /^#/, '' );
				return kinematicsModels[ url.length > 0 ? url : 'kinematics_model0' ];

			} else {

				return null;

			}

		},

		createAnimations: function () {

			animData = [];

			// fill in the keys
			recurseHierarchy( scene );

		},

		recurseHierarchy: function ( node ) {

			var n = visualScene.getChildById( node.colladaId, true ),
				newData = null;

			if ( n && n.keys ) {

				newData = {
					fps: 60,
					hierarchy: [ {
						node: n,
						keys: n.keys,
						sids: n.sids
					} ],
					node: node,
					name: 'animation_' + node.name,
					length: 0
				};

				animData.push( newData );

				for ( var i = 0, il = n.keys.length; i < il; i ++ ) {

					newData.length = Math.max( newData.length, n.keys[ i ].time );

				}

			} else {

				newData = {
					hierarchy: [ {
						keys: [],
						sids: []
					} ]
				}

			}

			for ( var i = 0, il = node.children.length; i < il; i ++ ) {

				var d = recurseHierarchy( node.children[ i ] );

				for ( var j = 0, jl = d.hierarchy.length; j < jl; j ++ ) {

					newData.hierarchy.push( {
						keys: [],
						sids: []
					} );

				}

			}

			return newData;

		},

		createMorph: function ( geometry, ctrl ) {

			var morphCtrl = ctrl instanceof InstanceController ? controllers[ ctrl.url ] : ctrl;

			if ( ! morphCtrl || ! morphCtrl.morph ) {

				console.log( "could not find morph controller!" );
				return;

			}

			var morph = morphCtrl.morph;

			for ( var i = 0; i < morph.targets.length; i ++ ) {

				var target_id = morph.targets[ i ];
				var daeGeometry = geometries[ target_id ];

				if ( ! daeGeometry.mesh ||
					 ! daeGeometry.mesh.primitives ||
					 ! daeGeometry.mesh.primitives.length ) {

					 continue;

				}

				var target = daeGeometry.mesh.primitives[ 0 ].geometry;

				if ( target.vertices.length === geometry.vertices.length ) {

					geometry.morphTargets.push( { name: "target_1", vertices: target.vertices } );

				}

			}

			geometry.morphTargets.push( { name: "target_Z", vertices: geometry.vertices } );

		},

		createSkin: function ( geometry, ctrl, applyBindShape ) {

			var skinCtrl = controllers[ ctrl.url ];

			if ( ! skinCtrl || ! skinCtrl.skin ) {

				console.log( "could not find skin controller!" );
				return;

			}

			if ( ! ctrl.skeleton || ! ctrl.skeleton.length ) {

				console.log( "could not find the skeleton for the skin!" );
				return;

			}

			var skin = skinCtrl.skin;
			var skeleton = visualScene.getChildById( ctrl.skeleton[ 0 ] );
			var hierarchy = [];

			applyBindShape = applyBindShape !== undefined ? applyBindShape : true;

			var bones = [];
			geometry.skinWeights = [];
			geometry.skinIndices = [];

			//createBones( geometry.bones, skin, hierarchy, skeleton, null, -1 );
			//createWeights( skin, geometry.bones, geometry.skinIndices, geometry.skinWeights );

			/*
			geometry.animation = {
				name: 'take_001',
				fps: 30,
				length: 2,
				JIT: true,
				hierarchy: hierarchy
			};
			*/

			if ( applyBindShape ) {

				for ( var i = 0; i < geometry.vertices.length; i ++ ) {

					geometry.vertices[ i ].applyMatrix4( skin.bindShapeMatrix );

				}

			}

		},

		createKinematics: function () {

			if ( kinematicsModel && kinematicsModel.joints.length === 0 ) {

				kinematics = undefined;
				return;

			}

			var jointMap = {};

			var _addToMap = function( jointIndex, parentVisualElement ) {

				var parentVisualElementId = parentVisualElement.getAttribute( 'id' );
				var colladaNode = visualScene.getChildById( parentVisualElementId, true );
				var joint = kinematicsModel.joints[ jointIndex ];

				scene.traverse( function( node ) {

					if ( node.colladaId == parentVisualElementId ) {

						jointMap[ jointIndex ] = {
							node: node,
							transforms: colladaNode.transforms,
							joint: joint,
							position: joint.zeroPosition
						};

					}

				} );

			};

			kinematics = {

				joints: kinematicsModel && kinematicsModel.joints,

				getJointValue: function( jointIndex ) {

					var jointData = jointMap[ jointIndex ];

					if ( jointData ) {

						return jointData.position;

					} else {

						console.log( 'getJointValue: joint ' + jointIndex + ' doesn\'t exist' );

					}

				},

				setJointValue: function( jointIndex, value ) {

					var jointData = jointMap[ jointIndex ];

					if ( jointData ) {

						var joint = jointData.joint;

						if ( value > joint.limits.max || value < joint.limits.min ) {

							console.log( 'setJointValue: joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ')' );

						} else if ( joint.static ) {

							console.log( 'setJointValue: joint ' + jointIndex + ' is static' );

						} else {

							var threejsNode = jointData.node;
							var axis = joint.axis;
							var transforms = jointData.transforms;

							var matrix = new THREE.Matrix4();

							for ( i = 0; i < transforms.length; i ++ ) {

								var transform = transforms[ i ];

								// kinda ghetto joint detection
								if ( transform.sid && transform.sid.indexOf( 'joint' + jointIndex ) !== - 1 ) {

									// apply actual joint value here
									switch ( joint.type ) {

										case 'revolute':

											matrix.multiply( m1.makeRotationAxis( axis, THREE.Math.degToRad( value ) ) );
											break;

										case 'prismatic':

											matrix.multiply( m1.makeTranslation( axis.x * value, axis.y * value, axis.z * value ) );
											break;

										default:

											console.warn( 'setJointValue: unknown joint type: ' + joint.type );
											break;

									}

								} else {

									var m1 = new THREE.Matrix4();

									switch ( transform.type ) {

										case 'matrix':

											matrix.multiply( transform.obj );

											break;

										case 'translate':

											matrix.multiply( m1.makeTranslation( transform.obj.x, transform.obj.y, transform.obj.z ) );

											break;

										case 'rotate':

											matrix.multiply( m1.makeRotationAxis( transform.obj, transform.angle ) );

											break;

									}

								}

							}

							// apply the matrix to the threejs node
							var elementsFloat32Arr = matrix.elements;
							var elements = Array.prototype.slice.call( elementsFloat32Arr );

							var elementsRowMajor = [
								elements[ 0 ],
								elements[ 4 ],
								elements[ 8 ],
								elements[ 12 ],
								elements[ 1 ],
								elements[ 5 ],
								elements[ 9 ],
								elements[ 13 ],
								elements[ 2 ],
								elements[ 6 ],
								elements[ 10 ],
								elements[ 14 ],
								elements[ 3 ],
								elements[ 7 ],
								elements[ 11 ],
								elements[ 15 ]
							];

							threejsNode.matrix.set.apply( threejsNode.matrix, elementsRowMajor );
							threejsNode.matrix.decompose( threejsNode.position, threejsNode.quaternion, threejsNode.scale );

						}

					} else {

						console.log( 'setJointValue: joint ' + jointIndex + ' doesn\'t exist' );

					}

				}

			};

			var element = COLLADA.querySelector( 'scene instance_kinematics_scene' );

			if ( element ) {

				for ( var i = 0; i < element.childNodes.length; i ++ ) {

					var child = element.childNodes[ i ];

					if ( child.nodeType != 1 ) continue;

					switch ( child.nodeName ) {

						case 'bind_joint_axis':

							var visualTarget = child.getAttribute( 'target' ).split( '/' ).pop();
							var axis = child.querySelector( 'axis param' ).textContent;
							var jointIndex = parseInt( axis.split( 'joint' ).pop().split( '.' )[ 0 ] );
							var visualTargetElement = COLLADA.querySelector( '[sid="' + visualTarget + '"]' );

							if ( visualTargetElement ) {

								var parentVisualElement = visualTargetElement.parentElement;
								_addToMap( jointIndex, parentVisualElement );

							}

							break;

						default:

							break;

					}

				}

			}

		},

		getJointId: function ( skin, id ) {

			for ( var i = 0; i < skin.joints.length; i ++ ) {

				if ( skin.joints[ i ] === id ) {

					return i;

				}

			}

		},

		calcFrameDuration: function ( node ) {

			var minT = 10000000;

			for ( var i = 0; i < node.channels.length; i ++ ) {

				var sampler = node.channels[ i ].sampler;

				for ( var j = 0; j < sampler.input.length - 1; j ++ ) {

					var t0 = sampler.input[ j ];
					var t1 = sampler.input[ j + 1 ];
					minT = Math.min( minT, t1 - t0 );

				}

			}

			return minT;

		},

		calcMatrixAt: function ( node, t ) {

			var animated = {};

			var i, j;

			for ( i = 0; i < node.channels.length; i ++ ) {

				var channel = node.channels[ i ];
				animated[ channel.sid ] = channel;

			}

			var matrix = new THREE.Matrix4();

			for ( i = 0; i < node.transforms.length; i ++ ) {

				var transform = node.transforms[ i ];
				var channel = animated[ transform.sid ];

				if ( channel !== undefined ) {

					var sampler = channel.sampler;
					var value;

					for ( j = 0; j < sampler.input.length - 1; j ++ ) {

						if ( sampler.input[ j + 1 ] > t ) {

							value = sampler.output[ j ];
							//console.log(value.flatten)
							break;

						}

					}

					if ( value !== undefined ) {

						if ( value instanceof THREE.Matrix4 ) {

							matrix.multiplyMatrices( matrix, value );

						} else {

							// FIXME: handle other types

							matrix.multiplyMatrices( matrix, transform.matrix );

						}

					} else {

						matrix.multiplyMatrices( matrix, transform.matrix );

					}

				} else {

					matrix.multiplyMatrices( matrix, transform.matrix );

				}

			}

			return matrix;

		},

		// Up axis conversion
		setUpConversion: function () {

			if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

				upConversion = null;

			} else {

				switch ( colladaUp ) {

					case 'X':

						upConversion = options.upAxis === 'Y' ? 'XtoY' : 'XtoZ';
						break;

					case 'Y':

						upConversion = options.upAxis === 'X' ? 'YtoX' : 'YtoZ';
						break;

					case 'Z':

						upConversion = options.upAxis === 'X' ? 'ZtoX' : 'ZtoY';
						break;

				}

			}

		}


	};

	function _Image() {

		this.id = "";
		this.init_from = "";

	};

	_Image.prototype.parse = function( element ) {

		this.id = element.getAttribute( 'id' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName === 'init_from' ) {

				this.init_from = child.textContent;

			}

		}

		return this;

	};

	function Controller() {

		this.id = "";
		this.name = "";
		this.type = "";
		this.skin = null;
		this.morph = null;

	};

	Controller.prototype.parse = function( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.type = "none";

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'skin':

					this.skin = ( new Skin() ).parse( child );
					this.type = child.nodeName;
					break;

				case 'morph':

					this.morph = ( new Morph() ).parse( child );
					this.type = child.nodeName;
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Morph() {

		this.method = null;
		this.source = null;
		this.targets = null;
		this.weights = null;

	};

	Morph.prototype.parse = function( element ) {

		var sources = {};
		var inputs = [];
		var i;

		this.method = element.getAttribute( 'method' );
		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					var source = ( new Source() ).parse( child );
					sources[ source.id ] = source;
					break;

				case 'targets':

					inputs = this.parseInputs( child );
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		for ( i = 0; i < inputs.length; i ++ ) {

			var input = inputs[ i ];
			var source = sources[ input.source ];

			switch ( input.semantic ) {

				case 'MORPH_TARGET':

					this.targets = source.read();
					break;

				case 'MORPH_WEIGHT':

					this.weights = source.read();
					break;

				default:
					break;

			}

		}

		return this;

	};

	Morph.prototype.parseInputs = function( element ) {

		var inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( ( new Input() ).parse( child ) );
					break;

				default:
					break;
			}

		}

		return inputs;

	};

	function Skin() {

		this.source = "";
		this.bindShapeMatrix = null;
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

	};

	Skin.prototype.parse = function( element ) {

		var sources = {};
		var joints, weights;

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bind_shape_matrix':

					var f = _floats( child.textContent );
					this.bindShapeMatrix = getConvertedMat4( f );
					break;

				case 'source':

					var src = new Source().parse( child );
					sources[ src.id ] = src;
					break;

				case 'joints':

					joints = child;
					break;

				case 'vertex_weights':

					weights = child;
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		this.parseJoints( joints, sources );
		this.parseWeights( weights, sources );

		return this;

	};

	Skin.prototype.parseJoints = function ( element, sources ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					var input = ( new Input() ).parse( child );
					var source = sources[ input.source ];

					if ( input.semantic === 'JOINT' ) {

						this.joints = source.read();

					} else if ( input.semantic === 'INV_BIND_MATRIX' ) {

						this.invBindMatrices = source.read();

					}

					break;

				default:
					break;
			}

		}

	};

	Skin.prototype.parseWeights = function ( element, sources ) {

		var v, vcount, inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( ( new Input() ).parse( child ) );
					break;

				case 'v':

					v = _ints( child.textContent );
					break;

				case 'vcount':

					vcount = _ints( child.textContent );
					break;

				default:
					break;

			}

		}

		var index = 0;

		for ( var i = 0; i < vcount.length; i ++ ) {

			var numBones = vcount[ i ];
			var vertex_weights = [];

			for ( var j = 0; j < numBones; j ++ ) {

				var influence = {};

				for ( var k = 0; k < inputs.length; k ++ ) {

					var input = inputs[ k ];
					var value = v[ index + input.offset ];

					switch ( input.semantic ) {

						case 'JOINT':

							influence.joint = value;//this.joints[value];
							break;

						case 'WEIGHT':

							influence.weight = sources[ input.source ].data[ value ];
							break;

						default:
							break;

					}

				}

				vertex_weights.push( influence );
				index += inputs.length;

			}

			for ( var j = 0; j < vertex_weights.length; j ++ ) {

				vertex_weights[ j ].index = i;

			}

			this.weights.push( vertex_weights );

		}

	};

	function VisualScene () {

		this.id = "";
		this.name = "";
		this.nodes = [];
		this.scene = new THREE.Group();

	};

	VisualScene.prototype.getChildById = function( id, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildById( id, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.getChildBySid = function( sid, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildBySid( sid, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.parse = function( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.nodes = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Node() {

		this.id = "";
		this.name = "";
		this.sid = "";
		this.nodes = [];
		this.controllers = [];
		this.transforms = [];
		this.geometries = [];
		this.channels = [];
		this.matrix = new THREE.Matrix4();

	};

	Node.prototype.getChannelForTransform = function( transformSid ) {

		for ( var i = 0; i < this.channels.length; i ++ ) {

			var channel = this.channels[ i ];
			var parts = channel.target.split( '/' );
			var id = parts.shift();
			var sid = parts.shift();
			var dotSyntax = ( sid.indexOf( "." ) >= 0 );
			var arrSyntax = ( sid.indexOf( "(" ) >= 0 );
			var arrIndices;
			var member;

			if ( dotSyntax ) {

				parts = sid.split( "." );
				sid = parts.shift();
				member = parts.shift();

			} else if ( arrSyntax ) {

				arrIndices = sid.split( "(" );
				sid = arrIndices.shift();

				for ( var j = 0; j < arrIndices.length; j ++ ) {

					arrIndices[ j ] = parseInt( arrIndices[ j ].replace( /\)/, '' ) );

				}

			}

			if ( sid === transformSid ) {

				channel.info = { sid: sid, dotSyntax: dotSyntax, arrSyntax: arrSyntax, arrIndices: arrIndices };
				return channel;

			}

		}

		return null;

	};

	Node.prototype.getChildById = function ( id, recursive ) {

		if ( this.id === id ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildById( id, recursive );

				if ( n ) {

					return n;

				}

			}

		}

		return null;

	};

	Node.prototype.getChildBySid = function ( sid, recursive ) {

		if ( this.sid === sid ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildBySid( sid, recursive );

				if ( n ) {

					return n;

				}

			}

		}

		return null;

	};

	Node.prototype.getTransformBySid = function ( sid ) {

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			if ( this.transforms[ i ].sid === sid ) return this.transforms[ i ];

		}

		return null;

	};

	Node.prototype.parse = function( element ) {

		var url;

		this.id = element.getAttribute( 'id' );
		this.sid = element.getAttribute( 'sid' );
		this.name = element.getAttribute( 'name' );
		this.type = element.getAttribute( 'type' );
		this.layer = element.getAttribute( 'layer' );

		this.type = this.type === 'JOINT' ? this.type : 'NODE';

		this.nodes = [];
		this.transforms = [];
		this.geometries = [];
		this.cameras = [];
		this.lights = [];
		this.controllers = [];
		this.matrix = new THREE.Matrix4();

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				case 'instance_camera':

					this.cameras.push( ( new InstanceCamera() ).parse( child ) );
					break;

				case 'instance_controller':

					this.controllers.push( ( new InstanceController() ).parse( child ) );
					break;

				case 'instance_geometry':

					this.geometries.push( ( new InstanceGeometry() ).parse( child ) );
					break;

				case 'instance_light':

					this.lights.push( ( new InstanceLight() ).parse( child ) );
					break;

				case 'instance_node':

					url = child.getAttribute( 'url' ).replace( /^#/, '' );
					var iNode = getLibraryNode( url );

					if ( iNode ) {

						this.nodes.push( ( new Node() ).parse( iNode ) ) ;

					}

					break;

				case 'rotate':
				case 'translate':
				case 'scale':
				case 'matrix':
				case 'lookat':
				case 'skew':

					this.transforms.push( ( new Transform() ).parse( child ) );
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		this.channels = getChannelsForNode( this );
		bakeAnimations( this );

		this.updateMatrix();

		return this;

	};

	Node.prototype.updateMatrix = function () {

		this.matrix.identity();

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			this.transforms[ i ].apply( this.matrix );

		}

	};

	function Transform () {

		this.sid = "";
		this.type = "";
		this.data = [];
		this.obj = null;

	};

	Transform.prototype.parse = function ( element ) {

		this.sid = element.getAttribute( 'sid' );
		this.type = element.nodeName;
		this.data = _floats( element.textContent );
		this.convert();

		return this;

	};

	Transform.prototype.convert = function () {

		switch ( this.type ) {

			case 'matrix':

				this.obj = getConvertedMat4( this.data );
				break;

			case 'rotate':

				this.angle = THREE.Math.degToRad( this.data[ 3 ] );

			case 'translate':

				fixCoords( this.data, - 1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			case 'scale':

				fixCoords( this.data, 1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			default:
				console.log( 'Can not convert Transform of type ' + this.type );
				break;

		}

	};

	Transform.prototype.apply = function () {

		var m1 = new THREE.Matrix4();

		return function ( matrix ) {

			switch ( this.type ) {

				case 'matrix':

					matrix.multiply( this.obj );

					break;

				case 'translate':

					matrix.multiply( m1.makeTranslation( this.obj.x, this.obj.y, this.obj.z ) );

					break;

				case 'rotate':

					matrix.multiply( m1.makeRotationAxis( this.obj, this.angle ) );

					break;

				case 'scale':

					matrix.scale( this.obj );

					break;

			}

		};

	}();

	Transform.prototype.update = function ( data, member ) {

		var members = [ 'X', 'Y', 'Z', 'ANGLE' ];

		switch ( this.type ) {

			case 'matrix':

				if ( ! member ) {

					this.obj.copy( data );

				} else if ( member.length === 1 ) {

					switch ( member[ 0 ] ) {

						case 0:

							this.obj.n11 = data[ 0 ];
							this.obj.n21 = data[ 1 ];
							this.obj.n31 = data[ 2 ];
							this.obj.n41 = data[ 3 ];

							break;

						case 1:

							this.obj.n12 = data[ 0 ];
							this.obj.n22 = data[ 1 ];
							this.obj.n32 = data[ 2 ];
							this.obj.n42 = data[ 3 ];

							break;

						case 2:

							this.obj.n13 = data[ 0 ];
							this.obj.n23 = data[ 1 ];
							this.obj.n33 = data[ 2 ];
							this.obj.n43 = data[ 3 ];

							break;

						case 3:

							this.obj.n14 = data[ 0 ];
							this.obj.n24 = data[ 1 ];
							this.obj.n34 = data[ 2 ];
							this.obj.n44 = data[ 3 ];

							break;

					}

				} else if ( member.length === 2 ) {

					var propName = 'n' + ( member[ 0 ] + 1 ) + ( member[ 1 ] + 1 );
					this.obj[ propName ] = data;

				} else {

					console.log( 'Incorrect addressing of matrix in transform.' );

				}

				break;

			case 'translate':
			case 'scale':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						break;

				}

				break;

			case 'rotate':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					case 'ANGLE':

						this.angle = THREE.Math.degToRad( data );
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						this.angle = THREE.Math.degToRad( data[ 3 ] );
						break;

				}
				break;

		}

	};

	function InstanceController() {

		this.url = "";
		this.skeleton = [];
		this.instance_material = [];

	};

	InstanceController.prototype.parse = function ( element ) {

		this.url = element.getAttribute( 'url' ).replace( /^#/, '' );
		this.skeleton = [];
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'skeleton':

					this.skeleton.push( child.textContent.replace( /^#/, '' ) );
					break;

				case 'bind_material':

					var instances = child.querySelectorAll( 'instance_material' );

					for ( var j = 0; j < instances.length; j ++ ) {

						var instance = instances[ j ];
						this.instance_material.push( ( new InstanceMaterial() ).parse( instance ) );

					}


					break;

				case 'extra':
					break;

				default:
					break;

			}

		}

		return this;

	};

	function InstanceMaterial () {

		this.symbol = "";
		this.target = "";

	};

	InstanceMaterial.prototype.parse = function ( element ) {

		this.symbol = element.getAttribute( 'symbol' );
		this.target = element.getAttribute( 'target' ).replace( /^#/, '' );
		return this;

	};

	function InstanceGeometry() {

		this.url = "";
		this.instance_material = [];

	};

	InstanceGeometry.prototype.parse = function ( element ) {

		this.url = element.getAttribute( 'url' ).replace( /^#/, '' );
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			if ( child.nodeName === 'bind_material' ) {

				var instances = child.querySelectorAll( 'instance_material' );

				for ( var j = 0; j < instances.length; j ++ ) {

					var instance = instances[ j ];
					this.instance_material.push( ( new InstanceMaterial() ).parse( instance ) );

				}

				break;

			}

		}

		return this;

	};

	function Geometry() {

		this.id = "";
		this.mesh = null;

	};

	Geometry.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );

		extractDoubleSided( this, element );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'mesh':

					this.mesh = ( new Mesh( this ) ).parse( child );
					break;

				case 'extra':

					// console.log( child );
					break;

				default:
					break;
			}

		}

		return this;

	};

	function Mesh( geometry ) {

		this.geometry = geometry.id;
		this.primitives = [];
		this.vertices = null;
		this.geometry3js = null;

	};

	Mesh.prototype.parse = function ( element ) {

		this.primitives = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'source':

					_source( child );
					break;

				case 'vertices':

					this.vertices = ( new Vertices() ).parse( child );
					break;

				case 'linestrips':

					this.primitives.push( ( new LineStrips().parse( child ) ) );
					break;

				case 'triangles':

					this.primitives.push( ( new Triangles().parse( child ) ) );
					break;

				case 'polygons':

					this.primitives.push( ( new Polygons().parse( child ) ) );
					break;

				case 'polylist':

					this.primitives.push( ( new Polylist().parse( child ) ) );
					break;

				default:
					break;

			}

		}

		this.geometry3js = new THREE.Geometry();

		if ( this.vertices === null ) {

			// TODO (mrdoob): Study case when this is null (carrier.dae)

			return this;

		}

		var vertexData = sources[ this.vertices.input[ 'POSITION' ].source ].data;

		for ( var i = 0; i < vertexData.length; i += 3 ) {

			this.geometry3js.vertices.push( getConvertedVec3( vertexData, i ).clone() );

		}

		for ( var i = 0; i < this.primitives.length; i ++ ) {

			var primitive = this.primitives[ i ];
			primitive.setVertices( this.vertices );
			this.handlePrimitive( primitive, this.geometry3js );

		}

		if ( this.geometry3js.calcNormals ) {

			this.geometry3js.computeVertexNormals();
			delete this.geometry3js.calcNormals;

		}

		return this;

	};

	Mesh.prototype.handlePrimitive = function ( primitive, geom ) {

		if ( primitive instanceof LineStrips ) {

			// TODO: Handle indices. Maybe easier with BufferGeometry?

			geom.isLineStrip = true;
			return;

		}

		var j, k, pList = primitive.p, inputs = primitive.inputs;
		var input, index, idx32;
		var source, numParams;
		var vcIndex = 0, vcount = 3, maxOffset = 0;
		var texture_sets = [];

		for ( j = 0; j < inputs.length; j ++ ) {

			input = inputs[ j ];

			var offset = input.offset + 1;
			maxOffset = ( maxOffset < offset ) ? offset : maxOffset;

			switch ( input.semantic ) {

				case 'TEXCOORD':
					texture_sets.push( input.set );
					break;

			}

		}

		for ( var pCount = 0; pCount < pList.length; ++ pCount ) {

			var p = pList[ pCount ], i = 0;

			while ( i < p.length ) {

				var vs = [];
				var ns = [];
				var ts = null;
				var cs = [];

				if ( primitive.vcount ) {

					vcount = primitive.vcount.length ? primitive.vcount[ vcIndex ++ ] : primitive.vcount;

				} else {

					vcount = p.length / maxOffset;

				}


				for ( j = 0; j < vcount; j ++ ) {

					for ( k = 0; k < inputs.length; k ++ ) {

						input = inputs[ k ];
						source = sources[ input.source ];

						index = p[ i + ( j * maxOffset ) + input.offset ];
						numParams = source.accessor.params.length;
						idx32 = index * numParams;

						switch ( input.semantic ) {

							case 'VERTEX':

								vs.push( index );

								break;

							case 'NORMAL':

								ns.push( getConvertedVec3( source.data, idx32 ) );

								break;

							case 'TEXCOORD':

								ts = ts || { };
								if ( ts[ input.set ] === undefined ) ts[ input.set ] = [];
								// invert the V
								ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], source.data[ idx32 + 1 ] ) );

								break;

							case 'COLOR':

								cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

								break;

							default:

								break;

						}

					}

				}

				if ( ns.length === 0 ) {

					// check the vertices inputs
					input = this.vertices.input.NORMAL;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							ns.push( getConvertedVec3( source.data, vs[ ndx ] * numParams ) );

						}

					} else {

						geom.calcNormals = true;

					}

				}

				if ( ! ts ) {

					ts = { };
					// check the vertices inputs
					input = this.vertices.input.TEXCOORD;

					if ( input ) {

						texture_sets.push( input.set );
						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							idx32 = vs[ ndx ] * numParams;
							if ( ts[ input.set ] === undefined ) ts[ input.set ] = [ ];
							// invert the V
							ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], 1.0 - source.data[ idx32 + 1 ] ) );

						}

					}

				}

				if ( cs.length === 0 ) {

					// check the vertices inputs
					input = this.vertices.input.COLOR;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							idx32 = vs[ ndx ] * numParams;
							cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

						}

					}

				}

				var face = null, faces = [], uv, uvArr;

				if ( vcount === 3 ) {

					faces.push( new THREE.Face3( vs[ 0 ], vs[ 1 ], vs[ 2 ], ns, cs.length ? cs : new THREE.Color() ) );

				} else if ( vcount === 4 ) {

					faces.push( new THREE.Face3( vs[ 0 ], vs[ 1 ], vs[ 3 ], [ ns[ 0 ].clone(), ns[ 1 ].clone(), ns[ 3 ].clone() ], cs.length ? [ cs[ 0 ], cs[ 1 ], cs[ 3 ]] : new THREE.Color() ) );

					faces.push( new THREE.Face3( vs[ 1 ], vs[ 2 ], vs[ 3 ], [ ns[ 1 ].clone(), ns[ 2 ].clone(), ns[ 3 ].clone() ], cs.length ? [ cs[ 1 ], cs[ 2 ], cs[ 3 ]] : new THREE.Color() ) );

				} else if ( vcount > 4 && options.subdivideFaces ) {

					var clr = cs.length ? cs : new THREE.Color(),
						vec1, vec2, vec3, v1, v2, norm;

					// subdivide into multiple Face3s

					for ( k = 1; k < vcount - 1; ) {

						// FIXME: normals don't seem to be quite right

						faces.push( new THREE.Face3( vs[ 0 ], vs[ k ], vs[ k + 1 ], [ ns[ 0 ].clone(), ns[ k ++ ].clone(), ns[ k ].clone() ],  clr ) );

					}

				}

				if ( faces.length ) {

					for ( var ndx = 0, len = faces.length; ndx < len; ndx ++ ) {

						face = faces[ ndx ];
						face.daeMaterial = primitive.material;
						geom.faces.push( face );

						for ( k = 0; k < texture_sets.length; k ++ ) {

							uv = ts[ texture_sets[ k ] ];

							if ( vcount > 4 ) {

								// Grab the right UVs for the vertices in this face
								uvArr = [ uv[ 0 ], uv[ ndx + 1 ], uv[ ndx + 2 ] ];

							} else if ( vcount === 4 ) {

								if ( ndx === 0 ) {

									uvArr = [ uv[ 0 ], uv[ 1 ], uv[ 3 ] ];

								} else {

									uvArr = [ uv[ 1 ].clone(), uv[ 2 ], uv[ 3 ].clone() ];

								}

							} else {

								uvArr = [ uv[ 0 ], uv[ 1 ], uv[ 2 ] ];

							}

							if ( geom.faceVertexUvs[ k ] === undefined ) {

								geom.faceVertexUvs[ k ] = [];

							}

							geom.faceVertexUvs[ k ].push( uvArr );

						}

					}

				} else {

					console.log( 'dropped face with vcount ' + vcount + ' for geometry with id: ' + geom.id );

				}

				i += maxOffset * vcount;

			}

		}

	};

	function Polygons () {

		this.material = "";
		this.count = 0;
		this.inputs = [];
		this.vcount = null;
		this.p = [];
		this.geometry = new THREE.Geometry();

	};

	Polygons.prototype.setVertices = function ( vertices ) {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			if ( this.inputs[ i ].source === vertices.id ) {

				this.inputs[ i ].source = vertices.input[ 'POSITION' ].source;

			}

		}

	};

	Polygons.prototype.parse = function ( element ) {

		this.material = element.getAttribute( 'material' );
		this.count = _attr_as_int( element, 'count', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( ( new Input() ).parse( element.childNodes[ i ] ) );
					break;

				case 'vcount':

					this.vcount = _ints( child.textContent );
					break;

				case 'p':

					this.p.push( _ints( child.textContent ) );
					break;

				case 'ph':

					console.warn( 'polygon holes not yet supported!' );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Polylist () {

		Polygons.call( this );

		this.vcount = [];

	};

	Polylist.prototype = Object.create( Polygons.prototype );
	Polylist.prototype.constructor = Polylist;

	function LineStrips() {

		Polygons.call( this );

		this.vcount = 1;

	};

	LineStrips.prototype = Object.create( Polygons.prototype );
	LineStrips.prototype.constructor = LineStrips;

	function Triangles () {

		Polygons.call( this );

		this.vcount = 3;

	};

	Triangles.prototype = Object.create( Polygons.prototype );
	Triangles.prototype.constructor = Triangles;

	function Accessor() {

		this.source = "";
		this.count = 0;
		this.stride = 0;
		this.params = [];

	};

	Accessor.prototype.parse = function ( element ) {

		this.params = [];
		this.source = element.getAttribute( 'source' );
		this.count = _attr_as_int( element, 'count', 0 );
		this.stride = _attr_as_int( element, 'stride', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName === 'param' ) {

				var param = {};
				param[ 'name' ] = child.getAttribute( 'name' );
				param[ 'type' ] = child.getAttribute( 'type' );
				this.params.push( param );

			}

		}

		return this;

	};

	function Vertices() {

		this.input = {};

	};

	Vertices.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName === 'input' ) {

				var input = ( new Input() ).parse( element.childNodes[ i ] );
				this.input[ input.semantic ] = input;

			}

		}

		return this;

	};

	function Input () {

		this.semantic = "";
		this.offset = 0;
		this.source = "";
		this.set = 0;

	};

	Input.prototype.parse = function ( element ) {

		this.semantic = element.getAttribute( 'semantic' );
		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.set = _attr_as_int( element, 'set', - 1 );
		this.offset = _attr_as_int( element, 'offset', 0 );

		if ( this.semantic === 'TEXCOORD' && this.set < 0 ) {

			this.set = 0;

		}

		return this;

	};

	function Source ( id ) {

		this.id = id;
		this.type = null;

	};

	Source.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'bool_array':

					this.data = _bools( child.textContent );
					this.type = child.nodeName;
					break;

				case 'float_array':

					this.data = _floats( child.textContent );
					this.type = child.nodeName;
					break;

				case 'int_array':

					this.data = _ints( child.textContent );
					this.type = child.nodeName;
					break;

				case 'IDREF_array':
				case 'Name_array':

					this.data = _strings( child.textContent );
					this.type = child.nodeName;
					break;

				case 'technique_common':

					for ( var j = 0; j < child.childNodes.length; j ++ ) {

						if ( child.childNodes[ j ].nodeName === 'accessor' ) {

							this.accessor = ( new Accessor() ).parse( child.childNodes[ j ] );
							break;

						}

					}
					break;

				default:
					// console.log(child.nodeName);
					break;

			}

		}

		return this;

	};

	Source.prototype.read = function () {

		var result = [];

		//for (var i = 0; i < this.accessor.params.length; i++) {

		var param = this.accessor.params[ 0 ];

		//console.log(param.name + " " + param.type);

		switch ( param.type ) {

			case 'IDREF':
			case 'Name': case 'name':
			case 'float':

				return this.data;

			case 'float4x4':

				for ( var j = 0; j < this.data.length; j += 16 ) {

					var s = this.data.slice( j, j + 16 );
					var m = getConvertedMat4( s );
					result.push( m );

				}

				break;

			default:

				console.log( 'ColladaLoader: Source: Read dont know how to read ' + param.type + '.' );
				break;

		}

		//}

		return result;

	};

	function Material () {

		this.id = "";
		this.name = "";
		this.instance_effect = null;

	};

	Material.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName === 'instance_effect' ) {

				this.instance_effect = ( new InstanceEffect() ).parse( element.childNodes[ i ] );
				break;

			}

		}

		return this;

	};

	function ColorOrTexture () {

		this.color = new THREE.Color();
		this.color.setRGB( Math.random(), Math.random(), Math.random() );
		this.color.a = 1.0;

		this.texture = null;
		this.texcoord = null;
		this.texOpts = null;

	};

	ColorOrTexture.prototype.isColor = function () {

		return ( this.texture === null );

	};

	ColorOrTexture.prototype.isTexture = function () {

		return ( this.texture != null );

	};

	ColorOrTexture.prototype.parse = function ( element ) {

		if ( element.nodeName === 'transparent' ) {

			this.opaque = element.getAttribute( 'opaque' );

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'color':

					var rgba = _floats( child.textContent );
					this.color = new THREE.Color();
					this.color.setRGB( rgba[ 0 ], rgba[ 1 ], rgba[ 2 ] );
					this.color.a = rgba[ 3 ];
					break;

				case 'texture':

					this.texture = child.getAttribute( 'texture' );
					this.texcoord = child.getAttribute( 'texcoord' );
					// Defaults from:
					// https://collada.org/mediawiki/index.php/Maya_texture_placement_MAYA_extension
					this.texOpts = {
						offsetU: 0,
						offsetV: 0,
						repeatU: 1,
						repeatV: 1,
						wrapU: 1,
						wrapV: 1
					};
					this.parseTexture( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	ColorOrTexture.prototype.parseTexture = function ( element ) {

		if ( ! element.childNodes ) return this;

		// This should be supported by Maya, 3dsMax, and MotionBuilder

		if ( element.childNodes[ 1 ] && element.childNodes[ 1 ].nodeName === 'extra' ) {

			element = element.childNodes[ 1 ];

			if ( element.childNodes[ 1 ] && element.childNodes[ 1 ].nodeName === 'technique' ) {

				element = element.childNodes[ 1 ];

			}

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'offsetU':
				case 'offsetV':
				case 'repeatU':
				case 'repeatV':

					this.texOpts[ child.nodeName ] = parseFloat( child.textContent );

					break;

				case 'wrapU':
				case 'wrapV':

					// some dae have a value of true which becomes NaN via parseInt

					if ( child.textContent.toUpperCase() === 'TRUE' ) {

						this.texOpts[ child.nodeName ] = 1;

					} else {

						this.texOpts[ child.nodeName ] = parseInt( child.textContent );

					}
					break;

				default:

					this.texOpts[ child.nodeName ] = child.textContent;

					break;

			}

		}

		return this;

	};

	function Shader ( type, effect ) {

		this.type = type;
		this.effect = effect;
		this.material = null;

	};

	Shader.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'transparent':

					this[ child.nodeName ] = ( new ColorOrTexture() ).parse( child );
					break;

				case 'bump':

					// If 'bumptype' is 'heightfield', create a 'bump' property
					// Else if 'bumptype' is 'normalmap', create a 'normal' property
					// (Default to 'bump')
					var bumpType = child.getAttribute( 'bumptype' );
					if ( bumpType ) {

						if ( bumpType.toLowerCase() === "heightfield" ) {

							this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );

						} else if ( bumpType.toLowerCase() === "normalmap" ) {

							this[ 'normal' ] = ( new ColorOrTexture() ).parse( child );

						} else {

							console.error( "Shader.prototype.parse: Invalid value for attribute 'bumptype' (" + bumpType +
										   ") - valid bumptypes are 'HEIGHTFIELD' and 'NORMALMAP' - defaulting to 'HEIGHTFIELD'" );
							this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );

						}

					} else {

						console.warn( "Shader.prototype.parse: Attribute 'bumptype' missing from bump node - defaulting to 'HEIGHTFIELD'" );
						this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );

					}

					break;

				case 'shininess':
				case 'reflectivity':
				case 'index_of_refraction':
				case 'transparency':

					var f = child.querySelectorAll( 'float' );

					if ( f.length > 0 )
						this[ child.nodeName ] = parseFloat( f[ 0 ].textContent );

					break;

				default:
					break;

			}

		}

		this.create();
		return this;

	};

	Shader.prototype.create = function() {

		var props = {};

		var transparent = false;

		if ( this[ 'transparency' ] !== undefined && this[ 'transparent' ] !== undefined ) {

			// convert transparent color RBG to average value
			var transparentColor = this[ 'transparent' ];
			var transparencyLevel = ( this.transparent.color.r + this.transparent.color.g + this.transparent.color.b ) / 3 * this.transparency;

			if ( transparencyLevel > 0 ) {

				transparent = true;
				props[ 'transparent' ] = true;
				props[ 'opacity' ] = 1 - transparencyLevel;

			}

		}

		var keys = {
			'diffuse': 'map',
			'ambient': 'lightMap',
			'specular': 'specularMap',
			'emission': 'emissionMap',
			'bump': 'bumpMap',
			'normal': 'normalMap'
		};

		for ( var prop in this ) {

			switch ( prop ) {

				case 'ambient':
				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'bump':
				case 'normal':

					var cot = this[ prop ];

					if ( cot instanceof ColorOrTexture ) {

						if ( cot.isTexture() ) {

							var samplerId = cot.texture;
							var surfaceId = this.effect.sampler[ samplerId ];

							if ( surfaceId !== undefined && surfaceId.source !== undefined ) {

								var surface = this.effect.surface[ surfaceId.source ];

								if ( surface !== undefined ) {

									var image = images[ surface.init_from ];

									if ( image && baseUrl ) {

										var url = baseUrl + image.init_from;

										var texture;
										var loader = THREE.Loader.Handlers.get( url );

										if ( loader !== null ) {

											texture = loader.load( url );

										} else {

											texture = new THREE.Texture();

											loadTextureImage( texture, url );

										}

										texture.wrapS = cot.texOpts.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
										texture.wrapT = cot.texOpts.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
										texture.offset.x = cot.texOpts.offsetU;
										texture.offset.y = cot.texOpts.offsetV;
										texture.repeat.x = cot.texOpts.repeatU;
										texture.repeat.y = cot.texOpts.repeatV;
										props[ keys[ prop ]] = texture;

										// Texture with baked lighting?
										if ( prop === 'emission' ) props[ 'emissive' ] = 0xffffff;

									}

								}

							}

						} else if ( prop === 'diffuse' || ! transparent ) {

							if ( prop === 'emission' ) {

								props[ 'emissive' ] = cot.color.getHex();

							} else {

								props[ prop ] = cot.color.getHex();

							}

						}

					}

					break;

				case 'shininess':

					props[ prop ] = this[ prop ];
					break;

				case 'reflectivity':

					props[ prop ] = this[ prop ];
					if ( props[ prop ] > 0.0 ) props[ 'envMap' ] = options.defaultEnvMap;
					props[ 'combine' ] = THREE.MixOperation;	//mix regular shading with reflective component
					break;

				case 'index_of_refraction':

					props[ 'refractionRatio' ] = this[ prop ]; //TODO: "index_of_refraction" becomes "refractionRatio" in shader, but I'm not sure if the two are actually comparable
					if ( this[ prop ] !== 1.0 ) props[ 'envMap' ] = options.defaultEnvMap;
					break;

				case 'transparency':
					// gets figured out up top
					break;

				default:
					break;

			}

		}

		props[ 'shading' ] = preferredShading;
		props[ 'side' ] = this.effect.doubleSided ? THREE.DoubleSide : THREE.FrontSide;

		switch ( this.type ) {

			case 'constant':

				if ( props.emissive != undefined ) props.color = props.emissive;
				this.material = new THREE.MeshBasicMaterial( props );
				break;

			case 'phong':
			case 'blinn':

				if ( props.diffuse != undefined ) props.color = props.diffuse;
				this.material = new THREE.MeshPhongMaterial( props );
				break;

			case 'lambert':
			default:

				if ( props.diffuse != undefined ) props.color = props.diffuse;
				this.material = new THREE.MeshLambertMaterial( props );
				break;

		}

		return this.material;

	};

	function Surface ( effect ) {

		this.effect = effect;
		this.init_from = null;
		this.format = null;

	};

	Surface.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'init_from':

					this.init_from = child.textContent;
					break;

				case 'format':

					this.format = child.textContent;
					break;

				default:

					console.log( "unhandled Surface prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Sampler2D ( effect ) {

		this.effect = effect;
		this.source = null;
		this.wrap_s = null;
		this.wrap_t = null;
		this.minfilter = null;
		this.magfilter = null;
		this.mipfilter = null;

	};

	Sampler2D.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					this.source = child.textContent;
					break;

				case 'minfilter':

					this.minfilter = child.textContent;
					break;

				case 'magfilter':

					this.magfilter = child.textContent;
					break;

				case 'mipfilter':

					this.mipfilter = child.textContent;
					break;

				case 'wrap_s':

					this.wrap_s = child.textContent;
					break;

				case 'wrap_t':

					this.wrap_t = child.textContent;
					break;

				default:

					console.log( "unhandled Sampler2D prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Effect () {

		this.id = "";
		this.name = "";
		this.shader = null;
		this.surface = {};
		this.sampler = {};

	};

	Effect.prototype.create = function () {

		if ( this.shader === null ) {

			return null;

		}

	};

	Effect.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		extractDoubleSided( this, element );

		this.shader = null;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseTechnique( this.parseProfileCOMMON( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Effect.prototype.parseNewparam = function ( element ) {

		var sid = element.getAttribute( 'sid' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'surface':

					this.surface[ sid ] = ( new Surface( this ) ).parse( child );
					break;

				case 'sampler2D':

					this.sampler[ sid ] = ( new Sampler2D( this ) ).parse( child );
					break;

				case 'extra':

					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

	};

	Effect.prototype.parseProfileCOMMON = function ( element ) {

		var technique;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseProfileCOMMON( child );
					break;

				case 'technique':

					technique = child;
					break;

				case 'newparam':

					this.parseNewparam( child );
					break;

				case 'image':

					var _image = ( new _Image() ).parse( child );
					images[ _image.id ] = _image;
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		return technique;

	};

	Effect.prototype.parseTechnique = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'constant':
				case 'lambert':
				case 'blinn':
				case 'phong':

					this.shader = ( new Shader( child.nodeName, this ) ).parse( child );
					break;
				case 'extra':
					this.parseExtra( child );
					break;
				default:
					break;

			}

		}

	};

	Effect.prototype.parseExtra = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique':
					this.parseExtraTechnique( child );
					break;
				default:
					break;

			}

		}

	};

	Effect.prototype.parseExtraTechnique = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bump':
					this.shader.parse( element );
					break;
				default:
					break;

			}

		}

	};

	function InstanceEffect () {

		this.url = "";

	};

	InstanceEffect.prototype.parse = function ( element ) {

		this.url = element.getAttribute( 'url' ).replace( /^#/, '' );
		return this;

	};

	function Animation() {

		this.id = "";
		this.name = "";
		this.source = {};
		this.sampler = [];
		this.channel = [];

	};

	Animation.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.source = {};

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'animation':

					var anim = ( new Animation() ).parse( child );

					for ( var src in anim.source ) {

						this.source[ src ] = anim.source[ src ];

					}

					for ( var j = 0; j < anim.channel.length; j ++ ) {

						this.channel.push( anim.channel[ j ] );
						this.sampler.push( anim.sampler[ j ] );

					}

					break;

				case 'source':

					var src = ( new Source() ).parse( child );
					this.source[ src.id ] = src;
					break;

				case 'sampler':

					this.sampler.push( ( new Sampler( this ) ).parse( child ) );
					break;

				case 'channel':

					this.channel.push( ( new Channel( this ) ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Channel( animation ) {

		this.animation = animation;
		this.source = "";
		this.target = "";
		this.fullSid = null;
		this.sid = null;
		this.dotSyntax = null;
		this.arrSyntax = null;
		this.arrIndices = null;
		this.member = null;

	};

	Channel.prototype.parse = function ( element ) {

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.target = element.getAttribute( 'target' );

		var parts = this.target.split( '/' );

		var id = parts.shift();
		var sid = parts.shift();

		var dotSyntax = ( sid.indexOf( "." ) >= 0 );
		var arrSyntax = ( sid.indexOf( "(" ) >= 0 );

		if ( dotSyntax ) {

			parts = sid.split( "." );
			this.sid = parts.shift();
			this.member = parts.shift();

		} else if ( arrSyntax ) {

			var arrIndices = sid.split( "(" );
			this.sid = arrIndices.shift();

			for ( var j = 0; j < arrIndices.length; j ++ ) {

				arrIndices[ j ] = parseInt( arrIndices[ j ].replace( /\)/, '' ) );

			}

			this.arrIndices = arrIndices;

		} else {

			this.sid = sid;

		}

		this.fullSid = sid;
		this.dotSyntax = dotSyntax;
		this.arrSyntax = arrSyntax;

		return this;

	};

	function Sampler ( animation ) {

		this.id = "";
		this.animation = animation;
		this.inputs = [];
		this.input = null;
		this.output = null;
		this.strideOut = null;
		this.interpolation = null;
		this.startTime = null;
		this.endTime = null;
		this.duration = 0;

	};

	Sampler.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( ( new Input() ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Sampler.prototype.create = function () {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			var input = this.inputs[ i ];
			var source = this.animation.source[ input.source ];

			switch ( input.semantic ) {

				case 'INPUT':

					this.input = source.read();
					break;

				case 'OUTPUT':

					this.output = source.read();
					this.strideOut = source.accessor.stride;
					break;

				case 'INTERPOLATION':

					this.interpolation = source.read();
					break;

				case 'IN_TANGENT':

					break;

				case 'OUT_TANGENT':

					break;

				default:

					console.log( input.semantic );
					break;

			}

		}

		this.startTime = 0;
		this.endTime = 0;
		this.duration = 0;

		if ( this.input.length ) {

			this.startTime = 100000000;
			this.endTime = - 100000000;

			for ( var i = 0; i < this.input.length; i ++ ) {

				this.startTime = Math.min( this.startTime, this.input[ i ] );
				this.endTime = Math.max( this.endTime, this.input[ i ] );

			}

			this.duration = this.endTime - this.startTime;

		}

	};

	Sampler.prototype.getData = function ( type, ndx, member ) {

		var data;

		if ( type === 'matrix' && this.strideOut === 16 ) {

			data = this.output[ ndx ];

		} else if ( this.strideOut > 1 ) {

			data = [];
			ndx *= this.strideOut;

			for ( var i = 0; i < this.strideOut; ++ i ) {

				data[ i ] = this.output[ ndx + i ];

			}

			if ( this.strideOut === 3 ) {

				switch ( type ) {

					case 'rotate':
					case 'translate':

						fixCoords( data, - 1 );
						break;

					case 'scale':

						fixCoords( data, 1 );
						break;

				}

			} else if ( this.strideOut === 4 && type === 'matrix' ) {

				fixCoords( data, - 1 );

			}

		} else {

			data = this.output[ ndx ];

			if ( member && type === 'translate' ) {

				data = getConvertedTranslation( member, data );

			}

		}

		return data;

	};

	function Key ( time ) {

		this.targets = [];
		this.time = time;

	};

	Key.prototype.addTarget = function ( fullSid, transform, member, data ) {

		this.targets.push( {
			sid: fullSid,
			member: member,
			transform: transform,
			data: data
		} );

	};

	Key.prototype.apply = function ( opt_sid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			var target = this.targets[ i ];

			if ( ! opt_sid || target.sid === opt_sid ) {

				target.transform.update( target.data, target.member );

			}

		}

	};

	Key.prototype.getTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return this.targets[ i ];

			}

		}

		return null;

	};

	Key.prototype.hasTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return true;

			}

		}

		return false;

	};

	// TODO: Currently only doing linear interpolation. Should support full COLLADA spec.
	Key.prototype.interpolate = function ( nextKey, time ) {

		for ( var i = 0, l = this.targets.length; i < l; i ++ ) {

			var target = this.targets[ i ],
				nextTarget = nextKey.getTarget( target.sid ),
				data;

			if ( target.transform.type !== 'matrix' && nextTarget ) {

				var scale = ( time - this.time ) / ( nextKey.time - this.time ),
					nextData = nextTarget.data,
					prevData = target.data;

				if ( scale < 0 ) scale = 0;
				if ( scale > 1 ) scale = 1;

				if ( prevData.length ) {

					data = [];

					for ( var j = 0; j < prevData.length; ++ j ) {

						data[ j ] = prevData[ j ] + ( nextData[ j ] - prevData[ j ] ) * scale;

					}

				} else {

					data = prevData + ( nextData - prevData ) * scale;

				}

			} else {

				data = target.data;

			}

			target.transform.update( data, target.member );

		}

	};

	// Camera
	function Camera() {

		this.id = "";
		this.name = "";
		this.technique = "";

	};

	Camera.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'optics':

					this.parseOptics( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Camera.prototype.parseOptics = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName === 'technique_common' ) {

				var technique = element.childNodes[ i ];

				for ( var j = 0; j < technique.childNodes.length; j ++ ) {

					this.technique = technique.childNodes[ j ].nodeName;

					if ( this.technique === 'perspective' ) {

						var perspective = technique.childNodes[ j ];

						for ( var k = 0; k < perspective.childNodes.length; k ++ ) {

							var param = perspective.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'yfov':
									this.yfov = param.textContent;
									break;
								case 'xfov':
									this.xfov = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					} else if ( this.technique === 'orthographic' ) {

						var orthographic = technique.childNodes[ j ];

						for ( var k = 0; k < orthographic.childNodes.length; k ++ ) {

							var param = orthographic.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'xmag':
									this.xmag = param.textContent;
									break;
								case 'ymag':
									this.ymag = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					}

				}

			}

		}

		return this;

	};

	function InstanceCamera() {

		this.url = "";

	};

	InstanceCamera.prototype.parse = function ( element ) {

		this.url = element.getAttribute( 'url' ).replace( /^#/, '' );

		return this;

	};

	// Light

	function Light() {

		this.id = "";
		this.name = "";
		this.technique = "";

	};

	Light.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':

					this.parseCommon( child );
					break;

				case 'technique':

					this.parseTechnique( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Light.prototype.parseCommon = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			switch ( element.childNodes[ i ].nodeName ) {

				case 'directional':
				case 'point':
				case 'spot':
				case 'ambient':

					this.technique = element.childNodes[ i ].nodeName;

					var light = element.childNodes[ i ];

					for ( var j = 0; j < light.childNodes.length; j ++ ) {

						var child = light.childNodes[ j ];

						switch ( child.nodeName ) {

							case 'color':

								var rgba = _floats( child.textContent );
								this.color = new THREE.Color( 0 );
								this.color.setRGB( rgba[ 0 ], rgba[ 1 ], rgba[ 2 ] );
								this.color.a = rgba[ 3 ];
								break;

							case 'falloff_angle':

								this.falloff_angle = parseFloat( child.textContent );
								break;

							case 'quadratic_attenuation':
								var f = parseFloat( child.textContent );
								this.distance = f ? Math.sqrt( 1 / f ) : 0;
						}

					}

			}

		}

		return this;

	};

	Light.prototype.parseTechnique = function ( element ) {

		this.profile = element.getAttribute( 'profile' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'intensity':

					this.intensity = parseFloat( child.textContent );
					break;

			}

		}

		return this;

	};

	function InstanceLight() {

		this.url = "";

	};

	InstanceLight.prototype.parse = function ( element ) {

		this.url = element.getAttribute( 'url' ).replace( /^#/, '' );

		return this;

	};

	function KinematicsModel( ) {

		this.id = '';
		this.name = '';
		this.joints = [];
		this.links = [];

	}

	KinematicsModel.prototype.parse = function( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.joints = [];
		this.links = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':

					this.parseCommon( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	KinematicsModel.prototype.parseCommon = function( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( element.childNodes[ i ].nodeName ) {

				case 'joint':
					this.joints.push( ( new Joint() ).parse( child ) );
					break;

				case 'link':
					this.links.push( ( new Link() ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Joint( ) {

		this.sid = '';
		this.name = '';
		this.axis = new THREE.Vector3();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = false;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

	}

	Joint.prototype.parse = function( element ) {

		this.sid = element.getAttribute( 'sid' );
		this.name = element.getAttribute( 'name' );
		this.axis = new THREE.Vector3();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = false;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

		var axisElement = element.querySelector( 'axis' );
		var _axis = _floats( axisElement.textContent );
		this.axis = getConvertedVec3( _axis, 0 );

		var min = element.querySelector( 'limits min' ) ? parseFloat( element.querySelector( 'limits min' ).textContent ) : - 360;
		var max = element.querySelector( 'limits max' ) ? parseFloat( element.querySelector( 'limits max' ).textContent ) : 360;

		this.limits = {
			min: min,
			max: max
		};

		var jointTypes = [ 'prismatic', 'revolute' ];
		for ( var i = 0; i < jointTypes.length; i ++ ) {

			var type = jointTypes[ i ];

			var jointElement = element.querySelector( type );

			if ( jointElement ) {

				this.type = type;

			}

		}

		// if the min is equal to or somehow greater than the max, consider the joint static
		if ( this.limits.min >= this.limits.max ) {

			this.static = true;

		}

		this.middlePosition = ( this.limits.min + this.limits.max ) / 2.0;
		return this;

	};

	function Link( ) {

		this.sid = '';
		this.name = '';
		this.transforms = [];
		this.attachments = [];

	}

	Link.prototype.parse = function( element ) {

		this.sid = element.getAttribute( 'sid' );
		this.name = element.getAttribute( 'name' );
		this.transforms = [];
		this.attachments = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'attachment_full':
					this.attachments.push( ( new Attachment() ).parse( child ) );
					break;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push( ( new Transform() ).parse( child ) );
					break;

				default:

					break;

			}

		}

		return this;

	};

	function Attachment( ) {

		this.joint = '';
		this.transforms = [];
		this.links = [];

	}

	Attachment.prototype.parse = function( element ) {

		this.joint = element.getAttribute( 'joint' ).split( '/' ).pop();
		this.links = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'link':
					this.links.push( ( new Link() ).parse( child ) );
					break;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push( ( new Transform() ).parse( child ) );
					break;

				default:

					break;

			}

		}

		return this;

	};

	function _source( element ) {

		var id = element.getAttribute( 'id' );

		if ( sources[ id ] != undefined ) {

			return sources[ id ];

		}

		sources[ id ] = ( new Source( id ) ).parse( element );
		return sources[ id ];

	};

	function _nsResolver( nsPrefix ) {

		if ( nsPrefix === "dae" ) {

			return "http://www.collada.org/2005/11/COLLADASchema";

		}

		return null;

	};

	function _bools( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( ( raw[ i ] === 'true' || raw[ i ] === '1' ) ? true : false );

		}

		return data;

	};

	function _floats( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseFloat( raw[ i ] ) );

		}

		return data;

	};

	function _ints( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseInt( raw[ i ], 10 ) );

		}

		return data;

	};

	function _strings( str ) {

		return ( str.length > 0 ) ? _trimString( str ).split( /\s+/ ) : [];

	};

	function _trimString( str ) {

		return str.replace( /^\s+/, "" ).replace( /\s+$/, "" );

	};

	function _attr_as_float( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseFloat( element.getAttribute( name ) );

		} else {

			return defaultValue;

		}

	};

	function _attr_as_int( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseInt( element.getAttribute( name ), 10 ) ;

		} else {

			return defaultValue;

		}

	};

	function _attr_as_string( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return element.getAttribute( name );

		} else {

			return defaultValue;

		}

	};

	function _format_float( f, num ) {

		if ( f === undefined ) {

			var s = '0.';

			while ( s.length < num + 2 ) {

				s += '0';

			}

			return s;

		}

		num = num || 2;

		var parts = f.toString().split( '.' );
		parts[ 1 ] = parts.length > 1 ? parts[ 1 ].substr( 0, num ) : "0";

		while ( parts[ 1 ].length < num ) {

			parts[ 1 ] += '0';

		}

		return parts.join( '.' );

	};

	function loadTextureImage ( texture, url ) {

		var loader = new THREE.ImageLoader();

		loader.load( url, function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;

		} );

	};

	function applySkin ( geometry, instanceCtrl, frame ) {

		var skinController = controllers[ instanceCtrl.url ];

		frame = frame !== undefined ? frame : 40;

		if ( ! skinController || ! skinController.skin ) {

			console.log( 'ColladaLoader: Could not find skin controller.' );
			return;

		}

		if ( ! instanceCtrl.skeleton || ! instanceCtrl.skeleton.length ) {

			console.log( 'ColladaLoader: Could not find the skeleton for the skin. ' );
			return;

		}

		var animationBounds = calcAnimationBounds();
		var skeleton = visualScene.getChildById( instanceCtrl.skeleton[ 0 ], true ) ||
					   visualScene.getChildBySid( instanceCtrl.skeleton[ 0 ], true );

		//flatten the skeleton into a list of bones
		var bonelist = flattenSkeleton( skeleton );
		var joints = skinController.skin.joints;

		//sort that list so that the order reflects the order in the joint list
		var sortedbones = [];
		for ( var i = 0; i < joints.length; i ++ ) {

			for ( var j = 0; j < bonelist.length; j ++ ) {

				if ( bonelist[ j ].name === joints[ i ] ) {

					sortedbones[ i ] = bonelist[ j ];

				}

			}

		}

		//hook up the parents by index instead of name
		for ( var i = 0; i < sortedbones.length; i ++ ) {

			for ( var j = 0; j < sortedbones.length; j ++ ) {

				if ( sortedbones[ i ].parent === sortedbones[ j ].name ) {

					sortedbones[ i ].parent = j;

				}

			}

		}


		var i, j, w, vidx, weight;
		var v = new THREE.Vector3(), o, s;

		// move vertices to bind shape
		for ( i = 0; i < geometry.vertices.length; i ++ ) {

			geometry.vertices[ i ].applyMatrix4( skinController.skin.bindShapeMatrix );

		}

		var skinIndices = [];
		var skinWeights = [];
		var weights = skinController.skin.weights;

		//hook up the skin weights
		// TODO -  this might be a good place to choose greatest 4 weights
		for ( var i = 0; i < weights.length; i ++ ) {

			var indicies = new THREE.Vector4( weights[ i ][ 0 ] ? weights[ i ][ 0 ].joint : 0, weights[ i ][ 1 ] ? weights[ i ][ 1 ].joint : 0, weights[ i ][ 2 ] ? weights[ i ][ 2 ].joint : 0, weights[ i ][ 3 ] ? weights[ i ][ 3 ].joint : 0 );
			var weight = new THREE.Vector4( weights[ i ][ 0 ] ? weights[ i ][ 0 ].weight : 0, weights[ i ][ 1 ] ? weights[ i ][ 1 ].weight : 0, weights[ i ][ 2 ] ? weights[ i ][ 2 ].weight : 0, weights[ i ][ 3 ] ? weights[ i ][ 3 ].weight : 0 );

			skinIndices.push( indicies );
			skinWeights.push( weight );

		}

		geometry.skinIndices = skinIndices;
		geometry.skinWeights = skinWeights;
		geometry.bones = sortedbones;
		// process animation, or simply pose the rig if no animation

		//create an animation for the animated bones
		//NOTE: this has no effect when using morphtargets
		var animationdata = { "name": animationBounds.ID, "fps": 30, "length": animationBounds.frames / 30, "hierarchy": [] };

		for ( var j = 0; j < sortedbones.length; j ++ ) {

			animationdata.hierarchy.push( { parent: sortedbones[ j ].parent, name: sortedbones[ j ].name, keys: [] } );

		}

		console.log( 'ColladaLoader:', animationBounds.ID + ' has ' + sortedbones.length + ' bones.' );



		skinToBindPose( geometry, skeleton, skinController );


		for ( frame = 0; frame < animationBounds.frames; frame ++ ) {

			var bones = [];
			var skinned = [];
			// process the frame and setup the rig with a fresh
			// transform, possibly from the bone's animation channel(s)

			setupSkeleton( skeleton, bones, frame );
			setupSkinningMatrices( bones, skinController.skin );

			for ( var i = 0; i < bones.length; i ++ ) {

				for ( var j = 0; j < animationdata.hierarchy.length; j ++ ) {

					if ( animationdata.hierarchy[ j ].name === bones[ i ].sid ) {

						var key = {};
						key.time = ( frame / 30 );
						key.matrix = bones[ i ].animatrix;

						if ( frame === 0 )
							bones[ i ].matrix = key.matrix;

						var data = [ new THREE.Vector3(), new THREE.Quaternion(), new THREE.Vector3() ];
						key.matrix.decompose( data[ 0 ], data[ 1 ], data[ 2 ] );

						key.pos = [ data[ 0 ].x, data[ 0 ].y, data[ 0 ].z ];

						key.scl = [ data[ 2 ].x, data[ 2 ].y, data[ 2 ].z ];
						key.rot = data[ 1 ];

						animationdata.hierarchy[ j ].keys.push( key );

					}

				}

			}

			geometry.animation = animationdata;

		}

	};

	function calcAnimationBounds () {

		var start = 1000000;
		var end = - start;
		var frames = 0;
		var ID;
		for ( var id in animations ) {

			var animation = animations[ id ];
			ID = ID || animation.id;
			for ( var i = 0; i < animation.sampler.length; i ++ ) {

				var sampler = animation.sampler[ i ];

				sampler.create();

				start = Math.min( start, sampler.startTime );
				end = Math.max( end, sampler.endTime );
				frames = Math.max( frames, sampler.input.length );

			}

		}

		return { start: start, end: end, frames: frames, ID: ID };

	};

	function createSceneGraph ( node, parent ) {

		var obj = new THREE.Object3D();
		var skinned = false;
		var skinController;
		var morphController;
		var i, j;

		// FIXME: controllers

		for ( i = 0; i < node.controllers.length; i ++ ) {

			var controller = controllers[ node.controllers[ i ].url ];

			switch ( controller.type ) {

				case 'skin':

					if ( geometries[ controller.skin.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.skin.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						skinned = true;
						skinController = node.controllers[ i ];

					} else if ( controllers[ controller.skin.source ] ) {

						// urgh: controller can be chained
						// handle the most basic case...

						var second = controllers[ controller.skin.source ];
						morphController = second;
						//	skinController = node.controllers[i];

						if ( second.morph && geometries[ second.morph.source ] ) {

							var inst_geom = new InstanceGeometry();

							inst_geom.url = second.morph.source;
							inst_geom.instance_material = node.controllers[ i ].instance_material;

							node.geometries.push( inst_geom );

						}

					}

					break;

				case 'morph':

					if ( geometries[ controller.morph.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.morph.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						morphController = node.controllers[ i ];

					}

					console.log( 'ColladaLoader: Morph-controller partially supported.' );

				default:
					break;

			}

		}

		// geometries

		var double_sided_materials = {};

		for ( i = 0; i < node.geometries.length; i ++ ) {

			var instance_geometry = node.geometries[ i ];
			var instance_materials = instance_geometry.instance_material;
			var geometry = geometries[ instance_geometry.url ];
			var used_materials = {};
			var used_materials_array = [];
			var num_materials = 0;
			var first_material;

			if ( geometry ) {

				if ( ! geometry.mesh || ! geometry.mesh.primitives )
					continue;

				if ( obj.name.length === 0 ) {

					obj.name = geometry.id;

				}

				// collect used fx for this geometry-instance

				if ( instance_materials ) {

					for ( j = 0; j < instance_materials.length; j ++ ) {

						var instance_material = instance_materials[ j ];
						var mat = materials[ instance_material.target ];
						var effect_id = mat.instance_effect.url;
						var shader = effects[ effect_id ].shader;
						var material3js = shader.material;

						if ( geometry.doubleSided ) {

							if ( ! ( instance_material.symbol in double_sided_materials ) ) {

								var _copied_material = material3js.clone();
								_copied_material.side = THREE.DoubleSide;
								double_sided_materials[ instance_material.symbol ] = _copied_material;

							}

							material3js = double_sided_materials[ instance_material.symbol ];

						}

						material3js.opacity = ! material3js.opacity ? 1 : material3js.opacity;
						used_materials[ instance_material.symbol ] = num_materials;
						used_materials_array.push( material3js );
						first_material = material3js;
						first_material.name = mat.name === null || mat.name === '' ? mat.id : mat.name;
						num_materials ++;

					}

				}

				var mesh;
				var material = first_material || new THREE.MeshLambertMaterial( { color: 0xdddddd, side: geometry.doubleSided ? THREE.DoubleSide : THREE.FrontSide } );
				var geom = geometry.mesh.geometry3js;

				if ( num_materials > 1 ) {

					material = new THREE.MeshFaceMaterial( used_materials_array );

					for ( j = 0; j < geom.faces.length; j ++ ) {

						var face = geom.faces[ j ];
						face.materialIndex = used_materials[ face.daeMaterial ]

					}

				}

				if ( skinController !== undefined ) {


					applySkin( geom, skinController );

					if ( geom.morphTargets.length > 0 ) {

						material.morphTargets = true;
						material.skinning = false;

					} else {

						material.morphTargets = false;
						material.skinning = true;

					}


					mesh = new THREE.SkinnedMesh( geom, material, false );


					//mesh.skeleton = skinController.skeleton;
					//mesh.skinController = controllers[ skinController.url ];
					//mesh.skinInstanceController = skinController;
					mesh.name = 'skin_' + skins.length;



					//mesh.animationHandle.setKey(0);
					skins.push( mesh );

				} else if ( morphController !== undefined ) {

					createMorph( geom, morphController );

					material.morphTargets = true;

					mesh = new THREE.Mesh( geom, material );
					mesh.name = 'morph_' + morphs.length;

					morphs.push( mesh );

				} else {

					if ( geom.isLineStrip === true ) {

						mesh = new THREE.Line( geom );

					} else {

						mesh = new THREE.Mesh( geom, material );

					}

				}

				obj.add( mesh );

			}

		}

		for ( i = 0; i < node.cameras.length; i ++ ) {

			var instance_camera = node.cameras[ i ];
			var cparams = cameras[ instance_camera.url ];

			var cam = new THREE.PerspectiveCamera( cparams.yfov, parseFloat( cparams.aspect_ratio ),
					parseFloat( cparams.znear ), parseFloat( cparams.zfar ) );

			obj.add( cam );

		}

		for ( i = 0; i < node.lights.length; i ++ ) {

			var light = null;
			var instance_light = node.lights[ i ];
			var lparams = lights[ instance_light.url ];

			if ( lparams && lparams.technique ) {

				var color = lparams.color.getHex();
				var intensity = lparams.intensity;
				var distance = lparams.distance;
				var angle = lparams.falloff_angle;
				var exponent; // Intentionally undefined, don't know what this is yet

				switch ( lparams.technique ) {

					case 'directional':

						light = new THREE.DirectionalLight( color, intensity, distance );
						light.position.set( 0, 0, 1 );
						break;

					case 'point':

						light = new THREE.PointLight( color, intensity, distance );
						break;

					case 'spot':

						light = new THREE.SpotLight( color, intensity, distance, angle, exponent );
						light.position.set( 0, 0, 1 );
						break;

					case 'ambient':

						light = new THREE.AmbientLight( color );
						break;

				}

			}

			if ( light ) {

				obj.add( light );

			}

		}

		obj.name = node.name || node.id || "";
		obj.colladaId = node.id || "";
		obj.layer = node.layer || "";
		obj.matrix = node.matrix;
		obj.matrix.decompose( obj.position, obj.quaternion, obj.scale );

		if ( options.centerGeometry && obj.geometry ) {

			var delta = obj.geometry.center();
			delta.multiply( obj.scale );
			delta.applyQuaternion( obj.quaternion );

			obj.position.sub( delta );

		}

		for ( i = 0; i < node.nodes.length; i ++ ) {

			obj.add( createSceneGraph( node.nodes[ i ], node ) );

		}

		return obj;

	};

	function bakeAnimations ( node ) {

		if ( node.channels && node.channels.length ) {

			var keys = [],
				sids = [];

			for ( var i = 0, il = node.channels.length; i < il; i ++ ) {

				var channel = node.channels[ i ],
					fullSid = channel.fullSid,
					sampler = channel.sampler,
					input = sampler.input,
					transform = node.getTransformBySid( channel.sid ),
					member;

				if ( channel.arrIndices ) {

					member = [];

					for ( var j = 0, jl = channel.arrIndices.length; j < jl; j ++ ) {

						member[ j ] = getConvertedIndex( channel.arrIndices[ j ] );

					}

				} else {

					member = getConvertedMember( channel.member );

				}

				if ( transform ) {

					if ( sids.indexOf( fullSid ) === - 1 ) {

						sids.push( fullSid );

					}

					for ( var j = 0, jl = input.length; j < jl; j ++ ) {

						var time = input[ j ],
							data = sampler.getData( transform.type, j, member ),
							key = findKey( keys, time );

						if ( ! key ) {

							key = new Key( time );
							var timeNdx = findTimeNdx( keys, time );
							keys.splice( timeNdx === - 1 ? keys.length : timeNdx, 0, key );

						}

						key.addTarget( fullSid, transform, member, data );

					}

				} else {

					console.log( 'Could not find transform "' + channel.sid + '" in node ' + node.id );

				}

			}

			// post process
			for ( var i = 0; i < sids.length; i ++ ) {

				var sid = sids[ i ];

				for ( var j = 0; j < keys.length; j ++ ) {

					var key = keys[ j ];

					if ( ! key.hasTarget( sid ) ) {

						interpolateKeys( keys, key, j, sid );

					}

				}

			}

			node.keys = keys;
			node.sids = sids;

		}

	};

	function extractDoubleSided( obj, element ) {

		obj.doubleSided = false;

		var node = element.querySelectorAll( 'extra double_sided' )[ 0 ];

		if ( node ) {

			if ( node && parseInt( node.textContent, 10 ) === 1 ) {

				obj.doubleSided = true;

			}

		}

	};

	function findKey ( keys, time ) {

		var retVal = null;

		for ( var i = 0, il = keys.length; i < il && retVal === null; i ++ ) {

			var key = keys[ i ];

			if ( key.time === time ) {

				retVal = key;

			} else if ( key.time > time ) {

				break;

			}

		}

		return retVal;

	};

	function findTimeNdx ( keys, time ) {

		var ndx = - 1;

		for ( var i = 0, il = keys.length; i < il && ndx === - 1; i ++ ) {

			var key = keys[ i ];

			if ( key.time >= time ) {

				ndx = i;

			}

		}

		return ndx;

	};

	function fixCoords( data, sign ) {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			return;

		}

		switch ( upConversion ) {

			case 'XtoY':

				var tmp = data[ 0 ];
				data[ 0 ] = sign * data[ 1 ];
				data[ 1 ] = tmp;
				break;

			case 'XtoZ':

				var tmp = data[ 2 ];
				data[ 2 ] = data[ 1 ];
				data[ 1 ] = data[ 0 ];
				data[ 0 ] = tmp;
				break;

			case 'YtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = sign * tmp;
				break;

			case 'YtoZ':

				var tmp = data[ 1 ];
				data[ 1 ] = sign * data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoY':

				var tmp = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = sign * tmp;
				break;

		}

	};

	//Walk the Collada tree and flatten the bones into a list, extract the position, quat and scale from the matrix
	function flattenSkeleton ( skeleton ) {

		var list = [];
		var walk = function( parentid, node, list ) {

			var bone = {};
			bone.name = node.sid;
			bone.parent = parentid;
			bone.matrix = node.matrix;
			var data = [ new THREE.Vector3(), new THREE.Quaternion(), new THREE.Vector3() ];
			bone.matrix.decompose( data[ 0 ], data[ 1 ], data[ 2 ] );

			bone.pos = [ data[ 0 ].x, data[ 0 ].y, data[ 0 ].z ];

			bone.scl = [ data[ 2 ].x, data[ 2 ].y, data[ 2 ].z ];
			bone.rotq = [ data[ 1 ].x, data[ 1 ].y, data[ 1 ].z, data[ 1 ].w ];
			list.push( bone );

			for ( var i in node.nodes ) {

				walk( node.sid, node.nodes[ i ], list );

			}

		};

		walk( - 1, skeleton, list );
		return list;

	};

	function getConvertedTranslation( axis, data ) {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			return data;

		}

		switch ( axis ) {
			case 'X':
				data = upConversion === 'XtoY' ? data * - 1 : data;
				break;
			case 'Y':
				data = upConversion === 'YtoZ' || upConversion === 'YtoX' ? data * - 1 : data;
				break;
			case 'Z':
				data = upConversion === 'ZtoY' ? data * - 1 : data ;
				break;
			default:
				break;
		}

		return data;

	};

	function getConvertedVec3( data, offset ) {

		var arr = [ data[ offset ], data[ offset + 1 ], data[ offset + 2 ] ];
		fixCoords( arr, - 1 );
		return new THREE.Vector3( arr[ 0 ], arr[ 1 ], arr[ 2 ] );

	};

	function getConvertedMat4( data ) {

		if ( options.convertUpAxis ) {

			// First fix rotation and scale

			// Columns first
			var arr = [ data[ 0 ], data[ 4 ], data[ 8 ] ];
			fixCoords( arr, - 1 );
			data[ 0 ] = arr[ 0 ];
			data[ 4 ] = arr[ 1 ];
			data[ 8 ] = arr[ 2 ];
			arr = [ data[ 1 ], data[ 5 ], data[ 9 ] ];
			fixCoords( arr, - 1 );
			data[ 1 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 9 ] = arr[ 2 ];
			arr = [ data[ 2 ], data[ 6 ], data[ 10 ] ];
			fixCoords( arr, - 1 );
			data[ 2 ] = arr[ 0 ];
			data[ 6 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];
			// Rows second
			arr = [ data[ 0 ], data[ 1 ], data[ 2 ] ];
			fixCoords( arr, - 1 );
			data[ 0 ] = arr[ 0 ];
			data[ 1 ] = arr[ 1 ];
			data[ 2 ] = arr[ 2 ];
			arr = [ data[ 4 ], data[ 5 ], data[ 6 ] ];
			fixCoords( arr, - 1 );
			data[ 4 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 6 ] = arr[ 2 ];
			arr = [ data[ 8 ], data[ 9 ], data[ 10 ] ];
			fixCoords( arr, - 1 );
			data[ 8 ] = arr[ 0 ];
			data[ 9 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];

			// Now fix translation
			arr = [ data[ 3 ], data[ 7 ], data[ 11 ] ];
			fixCoords( arr, - 1 );
			data[ 3 ] = arr[ 0 ];
			data[ 7 ] = arr[ 1 ];
			data[ 11 ] = arr[ 2 ];

		}

		return new THREE.Matrix4().set(
			data[ 0 ], data[ 1 ], data[ 2 ], data[ 3 ],
			data[ 4 ], data[ 5 ], data[ 6 ], data[ 7 ],
			data[ 8 ], data[ 9 ], data[ 10 ], data[ 11 ],
			data[ 12 ], data[ 13 ], data[ 14 ], data[ 15 ]
			);

	};

	function getConvertedIndex( index ) {

		if ( index > - 1 && index < 3 ) {

			var members = [ 'X', 'Y', 'Z' ],
				indices = { X: 0, Y: 1, Z: 2 };

			index = getConvertedMember( members[ index ] );
			index = indices[ index ];

		}

		return index;

	};

	function getChannelsForNode ( node ) {

		var channels = [];
		var startTime = 1000000;
		var endTime = - 1000000;

		for ( var id in animations ) {

			var animation = animations[ id ];

			for ( var i = 0; i < animation.channel.length; i ++ ) {

				var channel = animation.channel[ i ];
				var sampler = animation.sampler[ i ];
				var id = channel.target.split( '/' )[ 0 ];

				if ( id == node.id ) {

					sampler.create();
					channel.sampler = sampler;
					startTime = Math.min( startTime, sampler.startTime );
					endTime = Math.max( endTime, sampler.endTime );
					channels.push( channel );

				}

			}

		}

		if ( channels.length ) {

			node.startTime = startTime;
			node.endTime = endTime;

		}

		return channels;

	};

	function getConvertedMember( member ) {

		if ( options.convertUpAxis ) {

			switch ( member ) {

				case 'X':

					switch ( upConversion ) {

						case 'XtoY':
						case 'XtoZ':
						case 'YtoX':

							member = 'Y';
							break;

						case 'ZtoX':

							member = 'Z';
							break;

					}

					break;

				case 'Y':

					switch ( upConversion ) {

						case 'XtoY':
						case 'YtoX':
						case 'ZtoX':

							member = 'X';
							break;

						case 'XtoZ':
						case 'YtoZ':
						case 'ZtoY':

							member = 'Z';
							break;

					}

					break;

				case 'Z':

					switch ( upConversion ) {

						case 'XtoZ':

							member = 'X';
							break;

						case 'YtoZ':
						case 'ZtoX':
						case 'ZtoY':

							member = 'Y';
							break;

					}

					break;

			}

		}

		return member;

	};

	function getLibraryNode ( id ) {

		var nodes = COLLADA.querySelectorAll( 'library_nodes node' );

		for ( var i = 0; i < nodes.length; i ++ ) {

			var attObj = nodes[ i ].attributes.getNamedItem( 'id' );
			if ( attObj && attObj.value === id ) {

				return nodes[ i ];

			}

		}

		return undefined;

	};

	// Get next key with given sid
	function getNextKeyWith ( keys, fullSid, ndx ) {

		for ( ; ndx < keys.length; ndx ++ ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	};

	// Get previous key with given sid
	function getPrevKeyWith ( keys, fullSid, ndx ) {

		ndx = ndx >= 0 ? ndx : ndx + keys.length;

		for ( ; ndx >= 0; ndx -- ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	};

	function interpolateKeys ( keys, key, ndx, fullSid ) {

		var prevKey = getPrevKeyWith( keys, fullSid, ndx ? ndx - 1 : 0 ),
			nextKey = getNextKeyWith( keys, fullSid, ndx + 1 );

		if ( prevKey && nextKey ) {

			var scale = ( key.time - prevKey.time ) / ( nextKey.time - prevKey.time ),
				prevTarget = prevKey.getTarget( fullSid ),
				nextData = nextKey.getTarget( fullSid ).data,
				prevData = prevTarget.data,
				data;

			if ( prevTarget.type === 'matrix' ) {

				data = prevData;

			} else if ( prevData.length ) {

				data = [];

				for ( var i = 0; i < prevData.length; ++ i ) {

					data[ i ] = prevData[ i ] + ( nextData[ i ] - prevData[ i ] ) * scale;

				}

			} else {

				data = prevData + ( nextData - prevData ) * scale;

			}

			key.addTarget( fullSid, prevTarget.transform, prevTarget.member, data );

		}

	};

	function recurseHierarchy( node ) {

		var n = visualScene.getChildById( node.colladaId, true ),
			newData = null;

		if ( n && n.keys ) {

			newData = {
				fps: 60,
				hierarchy: [ {
					node: n,
					keys: n.keys,
					sids: n.sids
				} ],
				node: node,
				name: 'animation_' + node.name,
				length: 0
			};

			animData.push( newData );

			for ( var i = 0, il = n.keys.length; i < il; i ++ ) {

				newData.length = Math.max( newData.length, n.keys[ i ].time );

			}

		} else {

			newData = {
				hierarchy: [ {
					keys: [],
					sids: []
				} ]
			}

		}

		for ( var i = 0, il = node.children.length; i < il; i ++ ) {

			var d = recurseHierarchy( node.children[ i ] );

			for ( var j = 0, jl = d.hierarchy.length; j < jl; j ++ ) {

				newData.hierarchy.push( {
					keys: [],
					sids: []
				} );

			}

		}

		return newData;

	};

	function setupSkeleton ( node, bones, frame, parent ) {

		node.world = node.world || new THREE.Matrix4();
		node.localworld = node.localworld || new THREE.Matrix4();
		node.world.copy( node.matrix );
		node.localworld.copy( node.matrix );

		if ( node.channels && node.channels.length ) {

			var channel = node.channels[ 0 ];
			var m = channel.sampler.output[ frame ];

			if ( m instanceof THREE.Matrix4 ) {

				node.world.copy( m );
				node.localworld.copy( m );
				if ( frame === 0 )
					node.matrix.copy( m );

			}

		}

		if ( parent ) {

			node.world.multiplyMatrices( parent, node.world );

		}

		bones.push( node );

		for ( var i = 0; i < node.nodes.length; i ++ ) {

			setupSkeleton( node.nodes[ i ], bones, frame, node.world );

		}

	};

	function setupSkinningMatrices ( bones, skin ) {

		// FIXME: this is dumb...

		for ( var i = 0; i < bones.length; i ++ ) {

			var bone = bones[ i ];
			var found = - 1;

			if ( bone.type != 'JOINT' ) continue;

			for ( var j = 0; j < skin.joints.length; j ++ ) {

				if ( bone.sid === skin.joints[ j ] ) {

					found = j;
					break;

				}

			}

			if ( found >= 0 ) {

				var inv = skin.invBindMatrices[ found ];

				bone.invBindMatrix = inv;
				bone.skinningMatrix = new THREE.Matrix4();
				bone.skinningMatrix.multiplyMatrices( bone.world, inv ); // (IBMi * JMi)
				bone.animatrix = new THREE.Matrix4();

				bone.animatrix.copy( bone.localworld );
				bone.weights = [];

				for ( var j = 0; j < skin.weights.length; j ++ ) {

					for ( var k = 0; k < skin.weights[ j ].length; k ++ ) {

						var w = skin.weights[ j ][ k ];

						if ( w.joint === found ) {

							bone.weights.push( w );

						}

					}

				}

			} else {

				console.warn( "ColladaLoader: Could not find joint '" + bone.sid + "'." );

				bone.skinningMatrix = new THREE.Matrix4();
				bone.weights = [];

			}

		}

	};

	//Move the vertices into the pose that is proper for the start of the animation
	function skinToBindPose ( geometry, skeleton, skinController ) {

		var bones = [];
		setupSkeleton( skeleton, bones, - 1 );
		setupSkinningMatrices( bones, skinController.skin );
		var v = new THREE.Vector3();
		var skinned = [];

		for ( var i = 0; i < geometry.vertices.length; i ++ ) {

			skinned.push( new THREE.Vector3() );

		}

		for ( var i = 0; i < bones.length; i ++ ) {

			if ( bones[ i ].type != 'JOINT' ) continue;

			for ( var j = 0; j < bones[ i ].weights.length; j ++ ) {

				var w = bones[ i ].weights[ j ];
				var vidx = w.index;
				var weight = w.weight;

				var o = geometry.vertices[ vidx ];
				var s = skinned[ vidx ];

				v.x = o.x;
				v.y = o.y;
				v.z = o.z;

				v.applyMatrix4( bones[ i ].skinningMatrix );

				s.x += ( v.x * weight );
				s.y += ( v.y * weight );
				s.z += ( v.z * weight );

			}

		}

		for ( var i = 0; i < geometry.vertices.length; i ++ ) {

			geometry.vertices[ i ] = skinned[ i ];

		}

	};


} )();

// File:examples/js/loaders/MD2Loader.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MD2Loader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.MD2Loader.prototype = {

	constructor: THREE.MD2Loader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( buffer ) {

			onLoad( scope.parse( buffer ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: ( function () {

		var normals = [
			[ -0.525731,  0.000000,  0.850651 ], [ -0.442863,  0.238856,  0.864188 ],
			[ -0.295242,  0.000000,  0.955423 ], [ -0.309017,  0.500000,  0.809017 ],
			[ -0.162460,  0.262866,  0.951056 ], [  0.000000,  0.000000,  1.000000 ],
			[  0.000000,  0.850651,  0.525731 ], [ -0.147621,  0.716567,  0.681718 ],
			[  0.147621,  0.716567,  0.681718 ], [  0.000000,  0.525731,  0.850651 ],
			[  0.309017,  0.500000,  0.809017 ], [  0.525731,  0.000000,  0.850651 ],
			[  0.295242,  0.000000,  0.955423 ], [  0.442863,  0.238856,  0.864188 ],
			[  0.162460,  0.262866,  0.951056 ], [ -0.681718,  0.147621,  0.716567 ],
			[ -0.809017,  0.309017,  0.500000 ], [ -0.587785,  0.425325,  0.688191 ],
			[ -0.850651,  0.525731,  0.000000 ], [ -0.864188,  0.442863,  0.238856 ],
			[ -0.716567,  0.681718,  0.147621 ], [ -0.688191,  0.587785,  0.425325 ],
			[ -0.500000,  0.809017,  0.309017 ], [ -0.238856,  0.864188,  0.442863 ],
			[ -0.425325,  0.688191,  0.587785 ], [ -0.716567,  0.681718, -0.147621 ],
			[ -0.500000,  0.809017, -0.309017 ], [ -0.525731,  0.850651,  0.000000 ],
			[  0.000000,  0.850651, -0.525731 ], [ -0.238856,  0.864188, -0.442863 ],
			[  0.000000,  0.955423, -0.295242 ], [ -0.262866,  0.951056, -0.162460 ],
			[  0.000000,  1.000000,  0.000000 ], [  0.000000,  0.955423,  0.295242 ],
			[ -0.262866,  0.951056,  0.162460 ], [  0.238856,  0.864188,  0.442863 ],
			[  0.262866,  0.951056,  0.162460 ], [  0.500000,  0.809017,  0.309017 ],
			[  0.238856,  0.864188, -0.442863 ], [  0.262866,  0.951056, -0.162460 ],
			[  0.500000,  0.809017, -0.309017 ], [  0.850651,  0.525731,  0.000000 ],
			[  0.716567,  0.681718,  0.147621 ], [  0.716567,  0.681718, -0.147621 ],
			[  0.525731,  0.850651,  0.000000 ], [  0.425325,  0.688191,  0.587785 ],
			[  0.864188,  0.442863,  0.238856 ], [  0.688191,  0.587785,  0.425325 ],
			[  0.809017,  0.309017,  0.500000 ], [  0.681718,  0.147621,  0.716567 ],
			[  0.587785,  0.425325,  0.688191 ], [  0.955423,  0.295242,  0.000000 ],
			[  1.000000,  0.000000,  0.000000 ], [  0.951056,  0.162460,  0.262866 ],
			[  0.850651, -0.525731,  0.000000 ], [  0.955423, -0.295242,  0.000000 ],
			[  0.864188, -0.442863,  0.238856 ], [  0.951056, -0.162460,  0.262866 ],
			[  0.809017, -0.309017,  0.500000 ], [  0.681718, -0.147621,  0.716567 ],
			[  0.850651,  0.000000,  0.525731 ], [  0.864188,  0.442863, -0.238856 ],
			[  0.809017,  0.309017, -0.500000 ], [  0.951056,  0.162460, -0.262866 ],
			[  0.525731,  0.000000, -0.850651 ], [  0.681718,  0.147621, -0.716567 ],
			[  0.681718, -0.147621, -0.716567 ], [  0.850651,  0.000000, -0.525731 ],
			[  0.809017, -0.309017, -0.500000 ], [  0.864188, -0.442863, -0.238856 ],
			[  0.951056, -0.162460, -0.262866 ], [  0.147621,  0.716567, -0.681718 ],
			[  0.309017,  0.500000, -0.809017 ], [  0.425325,  0.688191, -0.587785 ],
			[  0.442863,  0.238856, -0.864188 ], [  0.587785,  0.425325, -0.688191 ],
			[  0.688191,  0.587785, -0.425325 ], [ -0.147621,  0.716567, -0.681718 ],
			[ -0.309017,  0.500000, -0.809017 ], [  0.000000,  0.525731, -0.850651 ],
			[ -0.525731,  0.000000, -0.850651 ], [ -0.442863,  0.238856, -0.864188 ],
			[ -0.295242,  0.000000, -0.955423 ], [ -0.162460,  0.262866, -0.951056 ],
			[  0.000000,  0.000000, -1.000000 ], [  0.295242,  0.000000, -0.955423 ],
			[  0.162460,  0.262866, -0.951056 ], [ -0.442863, -0.238856, -0.864188 ],
			[ -0.309017, -0.500000, -0.809017 ], [ -0.162460, -0.262866, -0.951056 ],
			[  0.000000, -0.850651, -0.525731 ], [ -0.147621, -0.716567, -0.681718 ],
			[  0.147621, -0.716567, -0.681718 ], [  0.000000, -0.525731, -0.850651 ],
			[  0.309017, -0.500000, -0.809017 ], [  0.442863, -0.238856, -0.864188 ],
			[  0.162460, -0.262866, -0.951056 ], [  0.238856, -0.864188, -0.442863 ],
			[  0.500000, -0.809017, -0.309017 ], [  0.425325, -0.688191, -0.587785 ],
			[  0.716567, -0.681718, -0.147621 ], [  0.688191, -0.587785, -0.425325 ],
			[  0.587785, -0.425325, -0.688191 ], [  0.000000, -0.955423, -0.295242 ],
			[  0.000000, -1.000000,  0.000000 ], [  0.262866, -0.951056, -0.162460 ],
			[  0.000000, -0.850651,  0.525731 ], [  0.000000, -0.955423,  0.295242 ],
			[  0.238856, -0.864188,  0.442863 ], [  0.262866, -0.951056,  0.162460 ],
			[  0.500000, -0.809017,  0.309017 ], [  0.716567, -0.681718,  0.147621 ],
			[  0.525731, -0.850651,  0.000000 ], [ -0.238856, -0.864188, -0.442863 ],
			[ -0.500000, -0.809017, -0.309017 ], [ -0.262866, -0.951056, -0.162460 ],
			[ -0.850651, -0.525731,  0.000000 ], [ -0.716567, -0.681718, -0.147621 ],
			[ -0.716567, -0.681718,  0.147621 ], [ -0.525731, -0.850651,  0.000000 ],
			[ -0.500000, -0.809017,  0.309017 ], [ -0.238856, -0.864188,  0.442863 ],
			[ -0.262866, -0.951056,  0.162460 ], [ -0.864188, -0.442863,  0.238856 ],
			[ -0.809017, -0.309017,  0.500000 ], [ -0.688191, -0.587785,  0.425325 ],
			[ -0.681718, -0.147621,  0.716567 ], [ -0.442863, -0.238856,  0.864188 ],
			[ -0.587785, -0.425325,  0.688191 ], [ -0.309017, -0.500000,  0.809017 ],
			[ -0.147621, -0.716567,  0.681718 ], [ -0.425325, -0.688191,  0.587785 ],
			[ -0.162460, -0.262866,  0.951056 ], [  0.442863, -0.238856,  0.864188 ],
			[  0.162460, -0.262866,  0.951056 ], [  0.309017, -0.500000,  0.809017 ],
			[  0.147621, -0.716567,  0.681718 ], [  0.000000, -0.525731,  0.850651 ],
			[  0.425325, -0.688191,  0.587785 ], [  0.587785, -0.425325,  0.688191 ],
			[  0.688191, -0.587785,  0.425325 ], [ -0.955423,  0.295242,  0.000000 ],
			[ -0.951056,  0.162460,  0.262866 ], [ -1.000000,  0.000000,  0.000000 ],
			[ -0.850651,  0.000000,  0.525731 ], [ -0.955423, -0.295242,  0.000000 ],
			[ -0.951056, -0.162460,  0.262866 ], [ -0.864188,  0.442863, -0.238856 ],
			[ -0.951056,  0.162460, -0.262866 ], [ -0.809017,  0.309017, -0.500000 ],
			[ -0.864188, -0.442863, -0.238856 ], [ -0.951056, -0.162460, -0.262866 ],
			[ -0.809017, -0.309017, -0.500000 ], [ -0.681718,  0.147621, -0.716567 ],
			[ -0.681718, -0.147621, -0.716567 ], [ -0.850651,  0.000000, -0.525731 ],
			[ -0.688191,  0.587785, -0.425325 ], [ -0.587785,  0.425325, -0.688191 ],
			[ -0.425325,  0.688191, -0.587785 ], [ -0.425325, -0.688191, -0.587785 ],
			[ -0.587785, -0.425325, -0.688191 ], [ -0.688191, -0.587785, -0.425325 ]
		];

		return function ( buffer ) {

			console.time( 'MD2Loader' );

			var data = new DataView( buffer );

			// http://tfc.duke.free.fr/coding/md2-specs-en.html

			var header = {};
			var headerNames = [
				'ident', 'version',
				'skinwidth', 'skinheight',
				'framesize',
				'num_skins', 'num_vertices', 'num_st', 'num_tris', 'num_glcmds', 'num_frames',
				'offset_skins', 'offset_st', 'offset_tris', 'offset_frames', 'offset_glcmds', 'offset_end'
			];

			for ( var i = 0; i < headerNames.length; i ++ ) {

				header[ headerNames[ i ] ] = data.getInt32( i * 4, true );

			}

			if ( header.ident !== 844121161 || header.version !== 8 ) {

				console.error( 'Not a valid MD2 file' );
				return;

			}

			if ( header.offset_end !== data.byteLength ) {

				console.error( 'Corrupted MD2 file' );
				return;

			}

			//

			var geometry = new THREE.Geometry();

			// uvs

			var uvs = [];
			var offset = header.offset_st;

			for ( var i = 0, l = header.num_st; i < l; i ++ ) {

				var u = data.getInt16( offset + 0, true );
				var v = data.getInt16( offset + 2, true );

				uvs.push( new THREE.Vector2( u / header.skinwidth, 1 - ( v / header.skinheight ) ) );

				offset += 4;

			}

			// triangles

			var offset = header.offset_tris;

			for ( var i = 0, l = header.num_tris; i < l; i ++ ) {

				var a = data.getUint16( offset + 0, true );
				var b = data.getUint16( offset + 2, true );
				var c = data.getUint16( offset + 4, true );

				geometry.faces.push( new THREE.Face3( a, b, c ) );

				geometry.faceVertexUvs[ 0 ].push( [
					uvs[ data.getUint16( offset + 6, true ) ],
					uvs[ data.getUint16( offset + 8, true ) ],
					uvs[ data.getUint16( offset + 10, true ) ]
				] );

				offset += 12;

			}

			// frames

			var translation = new THREE.Vector3();
			var scale = new THREE.Vector3();
			var string = [];

			var offset = header.offset_frames;

			for ( var i = 0, l = header.num_frames; i < l; i ++ ) {

				scale.set(
					data.getFloat32( offset + 0, true ),
					data.getFloat32( offset + 4, true ),
					data.getFloat32( offset + 8, true )
				);

				translation.set(
					data.getFloat32( offset + 12, true ),
					data.getFloat32( offset + 16, true ),
					data.getFloat32( offset + 20, true )
				);

				offset += 24;

				for ( var j = 0; j < 16; j ++ ) {

					string[ j ] = data.getUint8( offset + j, true );

				}

				var frame = {
					name: String.fromCharCode.apply( null, string ),
					vertices: [],
					normals: []
				};

				offset += 16;

				for ( var j = 0; j < header.num_vertices; j ++ ) {

					var x = data.getUint8( offset ++, true );
					var y = data.getUint8( offset ++, true );
					var z = data.getUint8( offset ++, true );
					var n = normals[ data.getUint8( offset ++, true ) ];

					var vertex = new THREE.Vector3(
						x * scale.x + translation.x,
						z * scale.z + translation.z,
						y * scale.y + translation.y
					);

					var normal = new THREE.Vector3( n[ 0 ], n[ 2 ], n[ 1 ] );

					frame.vertices.push( vertex );
					frame.normals.push( normal );

				}

				geometry.morphTargets.push( frame );

			}

			// Static

			geometry.vertices = geometry.morphTargets[ 0 ].vertices;

			var morphTarget = geometry.morphTargets[ 0 ];

			for ( var j = 0, jl = geometry.faces.length; j < jl; j ++ ) {

				var face = geometry.faces[ j ];

				face.vertexNormals = [
					morphTarget.normals[ face.a ],
					morphTarget.normals[ face.b ],
					morphTarget.normals[ face.c ]
				];

			}


			// Convert to geometry.morphNormals

			for ( var i = 0, l = geometry.morphTargets.length; i < l; i ++ ) {

				var morphTarget = geometry.morphTargets[ i ];
				var vertexNormals = [];

				for ( var j = 0, jl = geometry.faces.length; j < jl; j ++ ) {

					var face = geometry.faces[ j ];

					vertexNormals.push( {
						a: morphTarget.normals[ face.a ],
						b: morphTarget.normals[ face.b ],
						c: morphTarget.normals[ face.c ]
					} );

				}

				geometry.morphNormals.push( { vertexNormals: vertexNormals } );

			}

			console.timeEnd( 'MD2Loader' );

			return geometry;

		}

	} )()

}

// File:examples/js/loaders/OBJLoader.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.OBJLoader.prototype = {

	constructor: THREE.OBJLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( text ) {

		console.time( 'OBJLoader' );

		var object, objects = [];
		var geometry, material;

		function parseVertexIndex( value ) {

			var index = parseInt( value );

			return ( index >= 0 ? index - 1 : index + vertices.length / 3 ) * 3;

		}

		function parseNormalIndex( value ) {

			var index = parseInt( value );

			return ( index >= 0 ? index - 1 : index + normals.length / 3 ) * 3;

		}

		function parseUVIndex( value ) {

			var index = parseInt( value );

			return ( index >= 0 ? index - 1 : index + uvs.length / 2 ) * 2;

		}

		function addVertex( a, b, c ) {

			geometry.vertices.push(
				vertices[ a ], vertices[ a + 1 ], vertices[ a + 2 ],
				vertices[ b ], vertices[ b + 1 ], vertices[ b + 2 ],
				vertices[ c ], vertices[ c + 1 ], vertices[ c + 2 ]
			);

		}

		function addNormal( a, b, c ) {

			geometry.normals.push(
				normals[ a ], normals[ a + 1 ], normals[ a + 2 ],
				normals[ b ], normals[ b + 1 ], normals[ b + 2 ],
				normals[ c ], normals[ c + 1 ], normals[ c + 2 ]
			);

		}

		function addUV( a, b, c ) {

			geometry.uvs.push(
				uvs[ a ], uvs[ a + 1 ],
				uvs[ b ], uvs[ b + 1 ],
				uvs[ c ], uvs[ c + 1 ]
			);

		}

		function addFace( a, b, c, d,  ua, ub, uc, ud, na, nb, nc, nd ) {

			var ia = parseVertexIndex( a );
			var ib = parseVertexIndex( b );
			var ic = parseVertexIndex( c );
			var id;

			if ( d === undefined ) {

				addVertex( ia, ib, ic );

			} else {

				id = parseVertexIndex( d );

				addVertex( ia, ib, id );
				addVertex( ib, ic, id );

			}

			if ( ua !== undefined ) {

				ia = parseUVIndex( ua );
				ib = parseUVIndex( ub );
				ic = parseUVIndex( uc );

				if ( d === undefined ) {

					addUV( ia, ib, ic );

				} else {

					id = parseUVIndex( ud );

					addUV( ia, ib, id );
					addUV( ib, ic, id );

				}

			}

			if ( na !== undefined ) {

				ia = parseNormalIndex( na );
				ib = parseNormalIndex( nb );
				ic = parseNormalIndex( nc );

				if ( d === undefined ) {

					addNormal( ia, ib, ic );

				} else {

					id = parseNormalIndex( nd );

					addNormal( ia, ib, id );
					addNormal( ib, ic, id );

				}

			}

		}

		// create mesh if no objects in text

		if ( /^o /gm.test( text ) === false ) {

			geometry = {
				vertices: [],
				normals: [],
				uvs: []
			};

			material = {
				name: ''
			};

			object = {
				name: '',
				geometry: geometry,
				material: material
			};

			objects.push( object );

		}

		var vertices = [];
		var normals = [];
		var uvs = [];

		// v float float float

		var vertex_pattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

		// vn float float float

		var normal_pattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

		// vt float float

		var uv_pattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

		// f vertex vertex vertex ...

		var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

		// f vertex/uv vertex/uv vertex/uv ...

		var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

		var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

		// f vertex//normal vertex//normal vertex//normal ...

		var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;

		//

		var lines = text.split( '\n' );

		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim();

			var result;

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				continue;

			} else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

				// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				vertices.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				);

			} else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				normals.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				);

			} else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

				// ["vt 0.1 0.2", "0.1", "0.2"]

				uvs.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] )
				);

			} else if ( ( result = face_pattern1.exec( line ) ) !== null ) {

				// ["f 1 2 3", "1", "2", "3", undefined]

				addFace(
					result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ]
				);

			} else if ( ( result = face_pattern2.exec( line ) ) !== null ) {

				// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

				addFace(
					result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
					result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
				);

			} else if ( ( result = face_pattern3.exec( line ) ) !== null ) {

				// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

				addFace(
					result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ],
					result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ],
					result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ]
				);

			} else if ( ( result = face_pattern4.exec( line ) ) !== null ) {

				// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

				addFace(
					result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
					undefined, undefined, undefined, undefined,
					result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
				);

			} else if ( /^o /.test( line ) ) {

				geometry = {
					vertices: [],
					normals: [],
					uvs: []
				};

				material = {
					name: ''
				};

				object = {
					name: line.substring( 2 ).trim(),
					geometry: geometry,
					material: material
				};

				objects.push( object )

			} else if ( /^g /.test( line ) ) {

				// group

			} else if ( /^usemtl /.test( line ) ) {

				// material

				material.name = line.substring( 7 ).trim();

			} else if ( /^mtllib /.test( line ) ) {

				// mtl file

			} else if ( /^s /.test( line ) ) {

				// smooth shading

			} else {

				// console.log( "THREE.OBJLoader: Unhandled line " + line );

			}

		}

		var container = new THREE.Object3D();

		for ( var i = 0, l = objects.length; i < l; i ++ ) {

			object = objects[ i ];
			geometry = object.geometry;

			var buffergeometry = new THREE.BufferGeometry();

			buffergeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( geometry.vertices ), 3 ) );

			if ( geometry.normals.length > 0 ) {

				buffergeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( geometry.normals ), 3 ) );

			}

			if ( geometry.uvs.length > 0 ) {

				buffergeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( geometry.uvs ), 2 ) );

			}

			material = new THREE.MeshLambertMaterial();
			material.name = object.material.name;

			var mesh = new THREE.Mesh( buffergeometry, material );
			mesh.name = object.name;

			container.add( mesh );

		}

		console.timeEnd( 'OBJLoader' );

		return container;

	}

};

// File:examples/js/loaders/PLYLoader.js

/**
 * @author Wei Meng / http://about.me/menway
 *
 * Description: A THREE loader for PLY ASCII files (known as the Polygon File Format or the Stanford Triangle Format).
 *
 *
 * Limitations: ASCII decoding assumes file is UTF-8.
 *
 * Usage:
 *	var loader = new THREE.PLYLoader();
 *	loader.load('./models/ply/ascii/dolphins.ply', function (geometry) {
 *
 *		scene.add( new THREE.Mesh( geometry ) );
 *
 *	} );
 *
 * If the PLY file uses non standard property names, they can be mapped while
 * loading. For example, the following maps the properties
 * “diffuse_(red|green|blue)” in the file to standard color names.
 *
 * loader.setPropertyNameMapping( {
 *	diffuse_red: 'red',
 *	diffuse_green: 'green',
 *	diffuse_blue: 'blue'
 * } );
 *
 */


THREE.PLYLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	this.propertyNameMapping = {};

};

THREE.PLYLoader.prototype = {

	constructor: THREE.PLYLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	setPropertyNameMapping: function ( mapping ) {

		this.propertyNameMapping = mapping;

	},

	bin2str: function ( buf ) {

		var array_buffer = new Uint8Array( buf );
		var str = '';
		for ( var i = 0; i < buf.byteLength; i ++ ) {

			str += String.fromCharCode( array_buffer[ i ] ); // implicitly assumes little-endian

		}

		return str;

	},

	isASCII: function( data ) {

		var header = this.parseHeader( this.bin2str( data ) );

		return header.format === "ascii";

	},

	parse: function ( data ) {

		if ( data instanceof ArrayBuffer ) {

			return this.isASCII( data )
				? this.parseASCII( this.bin2str( data ) )
				: this.parseBinary( data );

		} else {

			return this.parseASCII( data );

		}

	},

	parseHeader: function ( data ) {

		var patternHeader = /ply([\s\S]*)end_header\s/;
		var headerText = "";
		var headerLength = 0;
		var result = patternHeader.exec( data );
		if ( result !== null ) {

			headerText = result [ 1 ];
			headerLength = result[ 0 ].length;

		}

		var header = {
			comments: [],
			elements: [],
			headerLength: headerLength
		};

		var lines = headerText.split( '\n' );
		var currentElement = undefined;
		var lineType, lineValues;

		function make_ply_element_property( propertValues, propertyNameMapping ) {

			var property = {
				type: propertValues[ 0 ]
			};

			if ( property.type === 'list' ) {

				property.name = propertValues[ 3 ];
				property.countType = propertValues[ 1 ];
				property.itemType = propertValues[ 2 ];

			} else {

				property.name = propertValues[ 1 ];

			}

			if ( property.name in propertyNameMapping ) {

				property.name = propertyNameMapping[ property.name ];

			}

			return property;

		}

		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim();
			if ( line === "" ) {

				continue;

			}
			lineValues = line.split( /\s+/ );
			lineType = lineValues.shift();
			line = lineValues.join( " " );

			switch ( lineType ) {

			case "format":

				header.format = lineValues[ 0 ];
				header.version = lineValues[ 1 ];

				break;

			case "comment":

				header.comments.push( line );

				break;

			case "element":

				if ( ! ( currentElement === undefined ) ) {

					header.elements.push( currentElement );

				}

				currentElement = Object();
				currentElement.name = lineValues[ 0 ];
				currentElement.count = parseInt( lineValues[ 1 ] );
				currentElement.properties = [];

				break;

			case "property":

				currentElement.properties.push( make_ply_element_property( lineValues, this.propertyNameMapping ) );

				break;


			default:

				console.log( "unhandled", lineType, lineValues );

			}

		}

		if ( ! ( currentElement === undefined ) ) {

			header.elements.push( currentElement );

		}

		return header;

	},

	parseASCIINumber: function ( n, type ) {

		switch ( type ) {

		case 'char': case 'uchar': case 'short': case 'ushort': case 'int': case 'uint':
		case 'int8': case 'uint8': case 'int16': case 'uint16': case 'int32': case 'uint32':

			return parseInt( n );

		case 'float': case 'double': case 'float32': case 'float64':

			return parseFloat( n );

		}

	},

	parseASCIIElement: function ( properties, line ) {

		var values = line.split( /\s+/ );

		var element = Object();

		for ( var i = 0; i < properties.length; i ++ ) {

			if ( properties[ i ].type === "list" ) {

				var list = [];
				var n = this.parseASCIINumber( values.shift(), properties[ i ].countType );

				for ( var j = 0; j < n; j ++ ) {

					list.push( this.parseASCIINumber( values.shift(), properties[ i ].itemType ) );

				}

				element[ properties[ i ].name ] = list;

			} else {

				element[ properties[ i ].name ] = this.parseASCIINumber( values.shift(), properties[ i ].type );

			}

		}

		return element;

	},

	parseASCII: function ( data ) {

		// PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)

		var geometry = new THREE.Geometry();

		var result;

		var header = this.parseHeader( data );

		var patternBody = /end_header\s([\s\S]*)$/;
		var body = "";
		if ( ( result = patternBody.exec( data ) ) !== null ) {

			body = result [ 1 ];

		}

		var lines = body.split( '\n' );
		var currentElement = 0;
		var currentElementCount = 0;
		geometry.useColor = false;

		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim();
			if ( line === "" ) {

				continue;

			}

			if ( currentElementCount >= header.elements[ currentElement ].count ) {

				currentElement ++;
				currentElementCount = 0;

			}

			var element = this.parseASCIIElement( header.elements[ currentElement ].properties, line );

			this.handleElement( geometry, header.elements[ currentElement ].name, element );

			currentElementCount ++;

		}

		return this.postProcess( geometry );

	},

	postProcess: function ( geometry ) {

		if ( geometry.useColor ) {

			for ( var i = 0; i < geometry.faces.length; i ++ ) {

				geometry.faces[ i ].vertexColors = [
					geometry.colors[ geometry.faces[ i ].a ],
					geometry.colors[ geometry.faces[ i ].b ],
					geometry.colors[ geometry.faces[ i ].c ]
				];

			}

			geometry.elementsNeedUpdate = true;

		}

		geometry.computeBoundingSphere();

		return geometry;

	},

	handleElement: function ( geometry, elementName, element ) {

		if ( elementName === "vertex" ) {

			geometry.vertices.push(
				new THREE.Vector3( element.x, element.y, element.z )
			);

			if ( 'red' in element && 'green' in element && 'blue' in element ) {

				geometry.useColor = true;

				var color = new THREE.Color();
				color.setRGB( element.red / 255.0, element.green / 255.0, element.blue / 255.0 );
				geometry.colors.push( color );

			}

		} else if ( elementName === "face" ) {

			var vertex_indices = element.vertex_indices;

			if ( vertex_indices.length === 3 ) {

				geometry.faces.push(
					new THREE.Face3( vertex_indices[ 0 ], vertex_indices[ 1 ], vertex_indices[ 2 ] )
				);

			} else if ( vertex_indices.length === 4 ) {

				geometry.faces.push(
					new THREE.Face3( vertex_indices[ 0 ], vertex_indices[ 1 ], vertex_indices[ 3 ] ),
					new THREE.Face3( vertex_indices[ 1 ], vertex_indices[ 2 ], vertex_indices[ 3 ] )
				);

			}

		}

	},

	binaryRead: function ( dataview, at, type, little_endian ) {

		switch ( type ) {

			// corespondences for non-specific length types here match rply:
		case 'int8':		case 'char':	 return [ dataview.getInt8( at ), 1 ];

		case 'uint8':		case 'uchar':	 return [ dataview.getUint8( at ), 1 ];

		case 'int16':		case 'short':	 return [ dataview.getInt16( at, little_endian ), 2 ];

		case 'uint16':	case 'ushort': return [ dataview.getUint16( at, little_endian ), 2 ];

		case 'int32':		case 'int':		 return [ dataview.getInt32( at, little_endian ), 4 ];

		case 'uint32':	case 'uint':	 return [ dataview.getUint32( at, little_endian ), 4 ];

		case 'float32': case 'float':	 return [ dataview.getFloat32( at, little_endian ), 4 ];

		case 'float64': case 'double': return [ dataview.getFloat64( at, little_endian ), 8 ];

		}

	},

	binaryReadElement: function ( dataview, at, properties, little_endian ) {

		var element = Object();
		var result, read = 0;

		for ( var i = 0; i < properties.length; i ++ ) {

			if ( properties[ i ].type === "list" ) {

				var list = [];

				result = this.binaryRead( dataview, at + read, properties[ i ].countType, little_endian );
				var n = result[ 0 ];
				read += result[ 1 ];

				for ( var j = 0; j < n; j ++ ) {

					result = this.binaryRead( dataview, at + read, properties[ i ].itemType, little_endian );
					list.push( result[ 0 ] );
					read += result[ 1 ];

				}

				element[ properties[ i ].name ] = list;

			} else {

				result = this.binaryRead( dataview, at + read, properties[ i ].type, little_endian );
				element[ properties[ i ].name ] = result[ 0 ];
				read += result[ 1 ];

			}

		}

		return [ element, read ];

	},

	parseBinary: function ( data ) {

		var geometry = new THREE.Geometry();

		var header = this.parseHeader( this.bin2str( data ) );
		var little_endian = ( header.format === "binary_little_endian" );
		var body = new DataView( data, header.headerLength );
		var result, loc = 0;

		for ( var currentElement = 0; currentElement < header.elements.length; currentElement ++ ) {

			for ( var currentElementCount = 0; currentElementCount < header.elements[ currentElement ].count; currentElementCount ++ ) {

				result = this.binaryReadElement( body, loc, header.elements[ currentElement ].properties, little_endian );
				loc += result[ 1 ];
				var element = result[ 0 ];

				this.handleElement( geometry, header.elements[ currentElement ].name, element );

			}

		}

		return this.postProcess( geometry );

	}

};

// File:examples/js/loaders/STLLoader.js

/**
 * @author aleeper / http://adamleeper.com/
 * @author mrdoob / http://mrdoob.com/
 * @author gero3 / https://github.com/gero3
 *
 * Description: A THREE loader for STL ASCII files, as created by Solidworks and other CAD programs.
 *
 * Supports both binary and ASCII encoded files, with automatic detection of type.
 *
 * Limitations:
 *  Binary decoding supports "Magics" color format (http://en.wikipedia.org/wiki/STL_(file_format)#Color_in_binary_STL).
 *  There is perhaps some question as to how valid it is to always assume little-endian-ness.
 *  ASCII decoding assumes file is UTF-8. Seems to work for the examples...
 *
 * Usage:
 *  var loader = new THREE.STLLoader();
 *  loader.load( './models/stl/slotted_disk.stl', function ( geometry ) {
 *    scene.add( new THREE.Mesh( geometry ) );
 *  });
 *
 * For binary STLs geometry might contain colors for vertices. To use it:
 *  // use the same code to load STL as above
 *  if (geometry.hasColors) {
 *    material = new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: THREE.VertexColors });
 *  } else { .... }
 *  var mesh = new THREE.Mesh( geometry, material );
 */


THREE.STLLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.STLLoader.prototype = {

	constructor: THREE.STLLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( data ) {

		var isBinary = function () {

			var expect, face_size, n_faces, reader;
			reader = new DataView( binData );
			face_size = ( 32 / 8 * 3 ) + ( ( 32 / 8 * 3 ) * 3 ) + ( 16 / 8 );
			n_faces = reader.getUint32( 80, true );
			expect = 80 + ( 32 / 8 ) + ( n_faces * face_size );

			if ( expect === reader.byteLength ) {

				return true;

			}

			// some binary files will have different size from expected,
			// checking characters higher than ASCII to confirm is binary
			var fileLength = reader.byteLength;
			for ( var index = 0; index < fileLength; index ++ ) {

				if ( reader.getUint8( index, false ) > 127 ) {

					return true;

				}

			}

			return false;

		};

		var binData = this.ensureBinary( data );

		return isBinary()
			? this.parseBinary( binData )
			: this.parseASCII( this.ensureString( data ) );

	},

	parseBinary: function ( data ) {

		var reader = new DataView( data );
		var faces = reader.getUint32( 80, true );

		var r, g, b, hasColors = false, colors;
		var defaultR, defaultG, defaultB, alpha;

		// process STL header
		// check for default color in header ("COLOR=rgba" sequence).

		for ( var index = 0; index < 80 - 10; index ++ ) {

			if ( ( reader.getUint32( index, false ) == 0x434F4C4F /*COLO*/ ) &&
				( reader.getUint8( index + 4 ) == 0x52 /*'R'*/ ) &&
				( reader.getUint8( index + 5 ) == 0x3D /*'='*/ ) ) {

				hasColors = true;
				colors = new Float32Array( faces * 3 * 3 );

				defaultR = reader.getUint8( index + 6 ) / 255;
				defaultG = reader.getUint8( index + 7 ) / 255;
				defaultB = reader.getUint8( index + 8 ) / 255;
				alpha = reader.getUint8( index + 9 ) / 255;

			}

		}

		var dataOffset = 84;
		var faceLength = 12 * 4 + 2;

		var offset = 0;

		var geometry = new THREE.BufferGeometry();

		var vertices = new Float32Array( faces * 3 * 3 );
		var normals = new Float32Array( faces * 3 * 3 );

		for ( var face = 0; face < faces; face ++ ) {

			var start = dataOffset + face * faceLength;
			var normalX = reader.getFloat32( start, true );
			var normalY = reader.getFloat32( start + 4, true );
			var normalZ = reader.getFloat32( start + 8, true );

			if ( hasColors ) {

				var packedColor = reader.getUint16( start + 48, true );

				if ( ( packedColor & 0x8000 ) === 0 ) {

					// facet has its own unique color

					r = ( packedColor & 0x1F ) / 31;
					g = ( ( packedColor >> 5 ) & 0x1F ) / 31;
					b = ( ( packedColor >> 10 ) & 0x1F ) / 31;

				} else {

					r = defaultR;
					g = defaultG;
					b = defaultB;

				}

			}

			for ( var i = 1; i <= 3; i ++ ) {

				var vertexstart = start + i * 12;

				vertices[ offset ] = reader.getFloat32( vertexstart, true );
				vertices[ offset + 1 ] = reader.getFloat32( vertexstart + 4, true );
				vertices[ offset + 2 ] = reader.getFloat32( vertexstart + 8, true );

				normals[ offset ] = normalX;
				normals[ offset + 1 ] = normalY;
				normals[ offset + 2 ] = normalZ;

				if ( hasColors ) {

					colors[ offset ] = r;
					colors[ offset + 1 ] = g;
					colors[ offset + 2 ] = b;

				}

				offset += 3;

			}

		}

		geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

		if ( hasColors ) {

			geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
			geometry.hasColors = true;
			geometry.alpha = alpha;

		}

		return geometry;

	},

	parseASCII: function ( data ) {

		var geometry, length, normal, patternFace, patternNormal, patternVertex, result, text;
		geometry = new THREE.Geometry();
		patternFace = /facet([\s\S]*?)endfacet/g;

		while ( ( result = patternFace.exec( data ) ) !== null ) {

			text = result[ 0 ];
			patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

			while ( ( result = patternNormal.exec( text ) ) !== null ) {

				normal = new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );

			}

			patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

			while ( ( result = patternVertex.exec( text ) ) !== null ) {

				geometry.vertices.push( new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) ) );

			}

			length = geometry.vertices.length;

			geometry.faces.push( new THREE.Face3( length - 3, length - 2, length - 1, normal ) );

		}

		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		return geometry;

	},

	ensureString: function ( buf ) {

		if ( typeof buf !== "string" ) {

			var array_buffer = new Uint8Array( buf );
			var str = '';
			for ( var i = 0; i < buf.byteLength; i ++ ) {

				str += String.fromCharCode( array_buffer[ i ] ); // implicitly assumes little-endian

			}
			return str;

		} else {

			return buf;

		}

	},

	ensureBinary: function ( buf ) {

		if ( typeof buf === "string" ) {

			var array_buffer = new Uint8Array( buf.length );
			for ( var i = 0; i < buf.length; i ++ ) {

				array_buffer[ i ] = buf.charCodeAt( i ) & 0xff; // implicitly assumes little-endian

			}
			return array_buffer.buffer || array_buffer;

		} else {

			return buf;

		}

	}

};

if ( typeof DataView === 'undefined' ) {

	DataView = function( buffer, byteOffset, byteLength ) {

		this.buffer = buffer;
		this.byteOffset = byteOffset || 0;
		this.byteLength = byteLength || buffer.byteLength || buffer.length;
		this._isString = typeof buffer === "string";

	};

	DataView.prototype = {

		_getCharCodes: function( buffer, start, length ) {

			start = start || 0;
			length = length || buffer.length;
			var end = start + length;
			var codes = [];
			for ( var i = start; i < end; i ++ ) {

				codes.push( buffer.charCodeAt( i ) & 0xff );

			}
			return codes;

		},

		_getBytes: function ( length, byteOffset, littleEndian ) {

			var result;

			// Handle the lack of endianness
			if ( littleEndian === undefined ) {

				littleEndian = this._littleEndian;

			}

			// Handle the lack of byteOffset
			if ( byteOffset === undefined ) {

				byteOffset = this.byteOffset;

			} else {

				byteOffset = this.byteOffset + byteOffset;

			}

			if ( length === undefined ) {

				length = this.byteLength - byteOffset;

			}

			// Error Checking
			if ( typeof byteOffset !== 'number' ) {

				throw new TypeError( 'DataView byteOffset is not a number' );

			}

			if ( length < 0 || byteOffset + length > this.byteLength ) {

				throw new Error( 'DataView length or (byteOffset+length) value is out of bounds' );

			}

			if ( this.isString ) {

				result = this._getCharCodes( this.buffer, byteOffset, byteOffset + length );

			} else {

				result = this.buffer.slice( byteOffset, byteOffset + length );

			}

			if ( ! littleEndian && length > 1 ) {

				if ( Array.isArray( result ) === false ) {

					result = Array.prototype.slice.call( result );

				}

				result.reverse();

			}

			return result;

		},

		// Compatibility functions on a String Buffer

		getFloat64: function ( byteOffset, littleEndian ) {

			var b = this._getBytes( 8, byteOffset, littleEndian ),

				sign = 1 - ( 2 * ( b[ 7 ] >> 7 ) ),
				exponent = ( ( ( ( b[ 7 ] << 1 ) & 0xff ) << 3 ) | ( b[ 6 ] >> 4 ) ) - ( ( 1 << 10 ) - 1 ),

			// Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
				mantissa = ( ( b[ 6 ] & 0x0f ) * Math.pow( 2, 48 ) ) + ( b[ 5 ] * Math.pow( 2, 40 ) ) + ( b[ 4 ] * Math.pow( 2, 32 ) ) +
							( b[ 3 ] * Math.pow( 2, 24 ) ) + ( b[ 2 ] * Math.pow( 2, 16 ) ) + ( b[ 1 ] * Math.pow( 2, 8 ) ) + b[ 0 ];

			if ( exponent === 1024 ) {

				if ( mantissa !== 0 ) {

					return NaN;

				} else {

					return sign * Infinity;

				}

			}

			if ( exponent === - 1023 ) {

				// Denormalized
				return sign * mantissa * Math.pow( 2, - 1022 - 52 );

			}

			return sign * ( 1 + mantissa * Math.pow( 2, - 52 ) ) * Math.pow( 2, exponent );

		},

		getFloat32: function ( byteOffset, littleEndian ) {

			var b = this._getBytes( 4, byteOffset, littleEndian ),

				sign = 1 - ( 2 * ( b[ 3 ] >> 7 ) ),
				exponent = ( ( ( b[ 3 ] << 1 ) & 0xff ) | ( b[ 2 ] >> 7 ) ) - 127,
				mantissa = ( ( b[ 2 ] & 0x7f ) << 16 ) | ( b[ 1 ] << 8 ) | b[ 0 ];

			if ( exponent === 128 ) {

				if ( mantissa !== 0 ) {

					return NaN;

				} else {

					return sign * Infinity;

				}

			}

			if ( exponent === - 127 ) {

				// Denormalized
				return sign * mantissa * Math.pow( 2, - 126 - 23 );

			}

			return sign * ( 1 + mantissa * Math.pow( 2, - 23 ) ) * Math.pow( 2, exponent );

		},

		getInt32: function ( byteOffset, littleEndian ) {

			var b = this._getBytes( 4, byteOffset, littleEndian );
			return ( b[ 3 ] << 24 ) | ( b[ 2 ] << 16 ) | ( b[ 1 ] << 8 ) | b[ 0 ];

		},

		getUint32: function ( byteOffset, littleEndian ) {

			return this.getInt32( byteOffset, littleEndian ) >>> 0;

		},

		getInt16: function ( byteOffset, littleEndian ) {

			return ( this.getUint16( byteOffset, littleEndian ) << 16 ) >> 16;

		},

		getUint16: function ( byteOffset, littleEndian ) {

			var b = this._getBytes( 2, byteOffset, littleEndian );
			return ( b[ 1 ] << 8 ) | b[ 0 ];

		},

		getInt8: function ( byteOffset ) {

			return ( this.getUint8( byteOffset ) << 24 ) >> 24;

		},

		getUint8: function ( byteOffset ) {

			return this._getBytes( 1, byteOffset )[ 0 ];

		}

	 };

}

// File:examples/js/loaders/UTF8Loader.js

/**
 * Loader for UTF8 version2 (after r51) encoded models generated by:
 *	http://code.google.com/p/webgl-loader/
 *
 * Code to load/decompress mesh is taken from r100 of this webgl-loader
 */

THREE.UTF8Loader = function () {};

/**
 * Load UTF8 encoded model
 * @param jsonUrl - URL from which to load json containing information about model
 * @param callback - Callback(THREE.Object3D) on successful loading of model
 * @param options - options on how to load model (see THREE.MTLLoader.MaterialCreator for basic options)
 *                  Additional options include
 *                   geometryBase: Base url from which to load referenced geometries
 *                   materialBase: Base url from which to load referenced textures
 */

THREE.UTF8Loader.prototype.load = function ( jsonUrl, callback, options ) {

	this.downloadModelJson( jsonUrl, callback, options );

};

// BufferGeometryCreator

THREE.UTF8Loader.BufferGeometryCreator = function () {
};

THREE.UTF8Loader.BufferGeometryCreator.prototype.create = function ( attribArray, indices ) {

	var ntris = indices.length / 3;

	var geometry = new THREE.BufferGeometry();

	var positions = new Float32Array( ntris * 3 * 3 );
	var normals = new Float32Array( ntris * 3 * 3 );
	var uvs = new Float32Array( ntris * 3 * 2 );

	var i, j, offset;
	var x, y, z;
	var u, v;

	var end = attribArray.length;
	var stride = 8;

	// extract positions

	j = 0;
	offset = 0;

	for ( i = offset; i < end; i += stride ) {

		x = attribArray[ i ];
		y = attribArray[ i + 1 ];
		z = attribArray[ i + 2 ];

		positions[ j ++ ] = x;
		positions[ j ++ ] = y;
		positions[ j ++ ] = z;

	}

	// extract uvs

	j = 0;
	offset = 3;

	for ( i = offset; i < end; i += stride ) {

		u = attribArray[ i ];
		v = attribArray[ i + 1 ];

		uvs[ j ++ ] = u;
		uvs[ j ++ ] = v;

	}

	// extract normals

	j = 0;
	offset = 5;

	for ( i = offset; i < end; i += stride ) {

		x = attribArray[ i ];
		y = attribArray[ i + 1 ];
		z = attribArray[ i + 2 ];

		normals[ j ++ ] = x;
		normals[ j ++ ] = y;
		normals[ j ++ ] = z;

	}

	geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

	geometry.computeBoundingSphere();

	return geometry;

};


// UTF-8 decoder from webgl-loader (r100)
// http://code.google.com/p/webgl-loader/

// Model manifest description. Contains objects like:
// name: {
//   materials: { 'material_name': { ... } ... },
//   decodeParams: {
//     decodeOffsets: [ ... ],
//     decodeScales: [ ... ],
//   },
//   urls: {
//     'url': [
//       { material: 'material_name',
//         attribRange: [#, #],
//         indexRange: [#, #],
//         names: [ 'object names' ... ],
//         lengths: [#, #, # ... ]
//       }
//     ],
//     ...
//   }
// }

var DEFAULT_DECODE_PARAMS = {

    decodeOffsets: [ -4095, -4095, -4095, 0, 0, -511, -511, -511 ],
    decodeScales: [ 1 / 8191, 1 / 8191, 1 / 8191, 1 / 1023, 1 / 1023, 1 / 1023, 1 / 1023, 1 / 1023 ]

    // TODO: normal decoding? (see walt.js)
    // needs to know: input, output (from vertex format!)
    //
    // Should split attrib/index.
    // 1) Decode position and non-normal attributes.
    // 2) Decode indices, computing normals
    // 3) Maybe normalize normals? Only necessary for refinement, or fixed?
    // 4) Maybe refine normals? Should this be part of regular refinement?
    // 5) Morphing

};

// Triangle strips!

// TODO: will it be an optimization to specialize this method at
// runtime for different combinations of stride, decodeOffset and
// decodeScale?

THREE.UTF8Loader.prototype.decompressAttribsInner_ = function ( str, inputStart, inputEnd,
                                                                  output, outputStart, stride,
                                                                  decodeOffset, decodeScale ) {

	var prev = 0;

	for ( var j = inputStart; j < inputEnd; j ++ ) {

		var code = str.charCodeAt( j );
		prev += ( code >> 1 ) ^ ( -( code & 1 ) );

		output[ outputStart ] = decodeScale * ( prev + decodeOffset );
		outputStart += stride;

	}

};

THREE.UTF8Loader.prototype.decompressIndices_ = function( str, inputStart, numIndices,
                                                            output, outputStart ) {

	var highest = 0;

	for ( var i = 0; i < numIndices; i ++ ) {

		var code = str.charCodeAt( inputStart ++ );

		output[ outputStart ++ ] = highest - code;

		if ( code === 0 ) {

			highest ++;

		}

	}

};

THREE.UTF8Loader.prototype.decompressAABBs_ = function ( str, inputStart, numBBoxen,
                                                           decodeOffsets, decodeScales ) {
	var numFloats = 6 * numBBoxen;

	var inputEnd = inputStart + numFloats;
	var outputStart = 0;

	var bboxen = new Float32Array( numFloats );

	for ( var i = inputStart; i < inputEnd; i += 6 ) {

		var minX = str.charCodeAt(i + 0) + decodeOffsets[0];
		var minY = str.charCodeAt(i + 1) + decodeOffsets[1];
		var minZ = str.charCodeAt(i + 2) + decodeOffsets[2];

		var radiusX = (str.charCodeAt(i + 3) + 1) >> 1;
		var radiusY = (str.charCodeAt(i + 4) + 1) >> 1;
		var radiusZ = (str.charCodeAt(i + 5) + 1) >> 1;

		bboxen[ outputStart ++ ] = decodeScales[0] * (minX + radiusX);
		bboxen[ outputStart ++ ] = decodeScales[1] * (minY + radiusY);
		bboxen[ outputStart ++ ] = decodeScales[2] * (minZ + radiusZ);

		bboxen[ outputStart ++ ] = decodeScales[0] * radiusX;
		bboxen[ outputStart ++ ] = decodeScales[1] * radiusY;
		bboxen[ outputStart ++ ] = decodeScales[2] * radiusZ;

	}

	return bboxen;

};

THREE.UTF8Loader.prototype.decompressMesh =  function ( str, meshParams, decodeParams, name, idx, callback ) {

    // Extract conversion parameters from attribArrays.

	var stride = decodeParams.decodeScales.length;

	var decodeOffsets = decodeParams.decodeOffsets;
	var decodeScales = decodeParams.decodeScales;

	var attribStart = meshParams.attribRange[0];
	var numVerts = meshParams.attribRange[1];

    // Decode attributes.

	var inputOffset = attribStart;
	var attribsOut = new Float32Array( stride * numVerts );

	for (var j = 0; j < stride; j ++ ) {

		var end = inputOffset + numVerts;

		var decodeScale = decodeScales[j];

		if ( decodeScale ) {

            // Assume if decodeScale is never set, simply ignore the
            // attribute.

			this.decompressAttribsInner_( str, inputOffset, end,
                attribsOut, j, stride,
                decodeOffsets[j], decodeScale );
		}

		inputOffset = end;

	}

	var indexStart = meshParams.indexRange[ 0 ];
	var numIndices = 3 * meshParams.indexRange[ 1 ];

	var indicesOut = new Uint16Array( numIndices );

	this.decompressIndices_( str, inputOffset, numIndices, indicesOut, 0 );

    // Decode bboxen.

	var bboxen = undefined;
	var bboxOffset = meshParams.bboxes;

	if ( bboxOffset ) {

		bboxen = this.decompressAABBs_( str, bboxOffset, meshParams.names.length, decodeOffsets, decodeScales );
	}

	callback( name, idx, attribsOut, indicesOut, bboxen, meshParams );

};

THREE.UTF8Loader.prototype.copyAttrib = function ( stride, attribsOutFixed, lastAttrib, index ) {

	for ( var j = 0; j < stride; j ++ ) {

		lastAttrib[ j ] = attribsOutFixed[ stride * index + j ];

	}

};

THREE.UTF8Loader.prototype.decodeAttrib2 = function ( str, stride, decodeOffsets, decodeScales, deltaStart,
                                                        numVerts, attribsOut, attribsOutFixed, lastAttrib,
                                                        index ) {

	for ( var j = 0; j < 5; j ++ ) {

		var code = str.charCodeAt( deltaStart + numVerts * j + index );
		var delta = ( code >> 1) ^ (-(code & 1));

		lastAttrib[ j ] += delta;
		attribsOutFixed[ stride * index + j ] = lastAttrib[ j ];
		attribsOut[ stride * index + j ] = decodeScales[ j ] * ( lastAttrib[ j ] + decodeOffsets[ j ] );
	}

};

THREE.UTF8Loader.prototype.accumulateNormal = function ( i0, i1, i2, attribsOutFixed, crosses ) {

	var p0x = attribsOutFixed[ 8 * i0 ];
	var p0y = attribsOutFixed[ 8 * i0 + 1 ];
	var p0z = attribsOutFixed[ 8 * i0 + 2 ];

	var p1x = attribsOutFixed[ 8 * i1 ];
	var p1y = attribsOutFixed[ 8 * i1 + 1 ];
	var p1z = attribsOutFixed[ 8 * i1 + 2 ];

	var p2x = attribsOutFixed[ 8 * i2 ];
	var p2y = attribsOutFixed[ 8 * i2 + 1 ];
	var p2z = attribsOutFixed[ 8 * i2 + 2 ];

	p1x -= p0x;
	p1y -= p0y;
	p1z -= p0z;

	p2x -= p0x;
	p2y -= p0y;
	p2z -= p0z;

	p0x = p1y * p2z - p1z * p2y;
	p0y = p1z * p2x - p1x * p2z;
	p0z = p1x * p2y - p1y * p2x;

	crosses[ 3 * i0 ]     += p0x;
	crosses[ 3 * i0 + 1 ] += p0y;
	crosses[ 3 * i0 + 2 ] += p0z;

	crosses[ 3 * i1 ]     += p0x;
	crosses[ 3 * i1 + 1 ] += p0y;
	crosses[ 3 * i1 + 2 ] += p0z;

	crosses[ 3 * i2 ]     += p0x;
	crosses[ 3 * i2 + 1 ] += p0y;
	crosses[ 3 * i2 + 2 ] += p0z;

};

THREE.UTF8Loader.prototype.decompressMesh2 = function( str, meshParams, decodeParams, name, idx, callback ) {

	var MAX_BACKREF = 96;

    // Extract conversion parameters from attribArrays.

	var stride = decodeParams.decodeScales.length;

	var decodeOffsets = decodeParams.decodeOffsets;
	var decodeScales = decodeParams.decodeScales;

	var deltaStart = meshParams.attribRange[ 0 ];
	var numVerts = meshParams.attribRange[ 1 ];

	var codeStart = meshParams.codeRange[ 0 ];
	var codeLength = meshParams.codeRange[ 1 ];

	var numIndices = 3 * meshParams.codeRange[ 2 ];

	var indicesOut = new Uint16Array( numIndices );

	var crosses = new Int32Array( 3 * numVerts );

	var lastAttrib = new Uint16Array( stride );

	var attribsOutFixed = new Uint16Array( stride * numVerts );
	var attribsOut = new Float32Array( stride * numVerts );

	var highest = 0;
	var outputStart = 0;

	for ( var i = 0; i < numIndices; i += 3 ) {

		var code = str.charCodeAt( codeStart ++ );

		var max_backref = Math.min( i, MAX_BACKREF );

		if ( code < max_backref ) {

            // Parallelogram

			var winding = code % 3;
			var backref = i - ( code - winding );
			var i0, i1, i2;

			switch ( winding ) {

				case 0:

					i0 = indicesOut[ backref + 2 ];
					i1 = indicesOut[ backref + 1 ];
					i2 = indicesOut[ backref + 0 ];
					break;

				case 1:

					i0 = indicesOut[ backref + 0 ];
					i1 = indicesOut[ backref + 2 ];
					i2 = indicesOut[ backref + 1 ];
					break;

				case 2:

					i0 = indicesOut[ backref + 1 ];
					i1 = indicesOut[ backref + 0 ];
					i2 = indicesOut[ backref + 2 ];
					break;

			}

			indicesOut[ outputStart ++ ] = i0;
			indicesOut[ outputStart ++ ] = i1;

			code = str.charCodeAt( codeStart ++ );

			var index = highest - code;
			indicesOut[ outputStart ++ ] = index;

			if ( code === 0 ) {

				for (var j = 0; j < 5; j ++ ) {

					var deltaCode = str.charCodeAt( deltaStart + numVerts * j + highest );

					var prediction = ((deltaCode >> 1) ^ (-(deltaCode & 1))) +
                        attribsOutFixed[stride * i0 + j] +
                        attribsOutFixed[stride * i1 + j] -
                        attribsOutFixed[stride * i2 + j];

					lastAttrib[j] = prediction;

					attribsOutFixed[ stride * highest + j ] = prediction;
					attribsOut[ stride * highest + j ] = decodeScales[ j ] * ( prediction + decodeOffsets[ j ] );

				}

				highest ++;

			} else {

				this.copyAttrib( stride, attribsOutFixed, lastAttrib, index );

			}

			this.accumulateNormal( i0, i1, index, attribsOutFixed, crosses );

		} else {

            // Simple

			var index0 = highest - ( code - max_backref );

			indicesOut[ outputStart ++ ] = index0;

			if ( code === max_backref ) {

				this.decodeAttrib2( str, stride, decodeOffsets, decodeScales, deltaStart,
                    numVerts, attribsOut, attribsOutFixed, lastAttrib,
                    highest ++ );

			} else {

				this.copyAttrib(stride, attribsOutFixed, lastAttrib, index0);

			}

			code = str.charCodeAt( codeStart ++ );

			var index1 = highest - code;
			indicesOut[ outputStart ++ ] = index1;

			if ( code === 0 ) {

				this.decodeAttrib2( str, stride, decodeOffsets, decodeScales, deltaStart,
                    numVerts, attribsOut, attribsOutFixed, lastAttrib,
                    highest ++ );

			} else {

				this.copyAttrib( stride, attribsOutFixed, lastAttrib, index1 );

			}

			code = str.charCodeAt( codeStart ++ );

			var index2 = highest - code;
			indicesOut[ outputStart ++ ] = index2;

			if ( code === 0 ) {

				for ( var j = 0; j < 5; j ++ ) {

					lastAttrib[ j ] = ( attribsOutFixed[ stride * index0 + j ] + attribsOutFixed[ stride * index1 + j ] ) / 2;

				}

				this.decodeAttrib2( str, stride, decodeOffsets, decodeScales, deltaStart,
                    numVerts, attribsOut, attribsOutFixed, lastAttrib,
                    highest ++ );

			} else {

				this.copyAttrib( stride, attribsOutFixed, lastAttrib, index2 );

			}

			this.accumulateNormal( index0, index1, index2, attribsOutFixed, crosses );

		}

	}

	for ( var i = 0; i < numVerts; i ++ ) {

		var nx = crosses[ 3 * i ];
		var ny = crosses[ 3 * i + 1 ];
		var nz = crosses[ 3 * i + 2 ];

		var norm = 511.0 / Math.sqrt( nx * nx + ny * ny + nz * nz );

		var cx = str.charCodeAt( deltaStart + 5 * numVerts + i );
		var cy = str.charCodeAt( deltaStart + 6 * numVerts + i );
		var cz = str.charCodeAt( deltaStart + 7 * numVerts + i );

		attribsOut[ stride * i + 5 ] = norm * nx + ((cx >> 1) ^ (-(cx & 1)));
		attribsOut[ stride * i + 6 ] = norm * ny + ((cy >> 1) ^ (-(cy & 1)));
		attribsOut[ stride * i + 7 ] = norm * nz + ((cz >> 1) ^ (-(cz & 1)));
	}

	callback( name, idx, attribsOut, indicesOut, undefined, meshParams );

};

THREE.UTF8Loader.prototype.downloadMesh = function ( path, name, meshEntry, decodeParams, callback ) {

	var loader = this;
	var idx = 0;

	function onprogress( req, e ) {

		while ( idx < meshEntry.length ) {

			var meshParams = meshEntry[ idx ];
			var indexRange = meshParams.indexRange;

			if ( indexRange ) {

				var meshEnd = indexRange[ 0 ] + 3 * indexRange[ 1 ];

				if ( req.responseText.length < meshEnd ) break;

				loader.decompressMesh( req.responseText, meshParams, decodeParams, name, idx, callback );

			} else {

				var codeRange = meshParams.codeRange;
				var meshEnd = codeRange[ 0 ] + codeRange[ 1 ];

				if ( req.responseText.length < meshEnd ) break;

				loader.decompressMesh2( req.responseText, meshParams, decodeParams, name, idx, callback );
			}

			++ idx;

		}

	}

	getHttpRequest( path, function( req, e ) {

		if ( req.status === 200 || req.status === 0 ) {

			onprogress( req, e );

		}

        // TODO: handle errors.

	}, onprogress );

};

THREE.UTF8Loader.prototype.downloadMeshes = function ( path, meshUrlMap, decodeParams, callback ) {

	for ( var url in meshUrlMap ) {

		var meshEntry = meshUrlMap[url];
		this.downloadMesh( path + url, url, meshEntry, decodeParams, callback );

	}

};

THREE.UTF8Loader.prototype.createMeshCallback = function( materialBaseUrl, loadModelInfo, allDoneCallback ) {

	var nCompletedUrls = 0;
	var nExpectedUrls = 0;

	var expectedMeshesPerUrl = {};
	var decodedMeshesPerUrl = {};

	var modelParts = {};

	var meshUrlMap = loadModelInfo.urls;

	for ( var url in meshUrlMap ) {

		expectedMeshesPerUrl[ url ] = meshUrlMap[ url ].length;
		decodedMeshesPerUrl[ url ] = 0;

		nExpectedUrls ++;

		modelParts[ url ] = new THREE.Object3D();

	}

	var model = new THREE.Object3D();

    // Prepare materials first...

	var materialCreator = new THREE.MTLLoader.MaterialCreator( materialBaseUrl, loadModelInfo.options );
	materialCreator.setMaterials( loadModelInfo.materials );

	materialCreator.preload();

	// Create callback for creating mesh parts

	var bufferGeometryCreator = new THREE.UTF8Loader.BufferGeometryCreator();

	var meshCallback = function( name, idx, attribArray, indexArray, bboxen, meshParams ) {

        // Got ourselves a new mesh

        // name identifies this part of the model (url)
        // idx is the mesh index of this mesh of the part
        // attribArray defines the vertices
        // indexArray defines the faces
        // bboxen defines the bounding box
        // meshParams contains the material info

		var geometry = bufferGeometryCreator.create( attribArray, indexArray );
		var material = materialCreator.create( meshParams.material );

		var mesh = new THREE.Mesh( geometry, material );
		modelParts[ name ].add( mesh );

        //model.add(new THREE.Mesh(geometry, material));

		decodedMeshesPerUrl[ name ] ++;

		if ( decodedMeshesPerUrl[ name ] === expectedMeshesPerUrl[ name ] ) {

			nCompletedUrls ++;

			model.add( modelParts[ name ] );

			if ( nCompletedUrls === nExpectedUrls ) {

                // ALL DONE!!!

				allDoneCallback( model );

			}

		}

	};

	return meshCallback;

};

THREE.UTF8Loader.prototype.downloadModel = function ( geometryBase, materialBase, model, callback ) {

	var meshCallback = this.createMeshCallback( materialBase, model, callback );
	this.downloadMeshes( geometryBase, model.urls, model.decodeParams, meshCallback );

};

THREE.UTF8Loader.prototype.downloadModelJson = function ( jsonUrl, callback, options ) {

	getJsonRequest( jsonUrl, function( loaded ) {

		if ( ! loaded.decodeParams ) {

			if ( options && options.decodeParams ) {

				loaded.decodeParams = options.decodeParams;

			} else {

				loaded.decodeParams = DEFAULT_DECODE_PARAMS;

			}

		}

		loaded.options = options;

		var geometryBase = jsonUrl.substr( 0, jsonUrl.lastIndexOf( "/" ) + 1 );
		var materialBase = geometryBase;

		if ( options && options.geometryBase ) {

			geometryBase = options.geometryBase;

			if ( geometryBase.charAt( geometryBase.length - 1 ) !== "/" ) {

				geometryBase = geometryBase + "/";

			}

		}

		if ( options && options.materialBase ) {

			materialBase = options.materialBase;

			if ( materialBase.charAt( materialBase.length - 1 ) !== "/" ) {

				materialBase = materialBase  + "/";

			}

		}

		this.downloadModel( geometryBase, materialBase, loaded, callback );

	}.bind( this ) );

};

// XMLHttpRequest stuff

function getHttpRequest( url, onload, opt_onprogress ) {

	var LISTENERS = {

        load: function( e ) { onload( req, e ); },
        progress: function( e ) { opt_onprogress( req, e ); }

    };

	var req = new XMLHttpRequest();
	addListeners( req, LISTENERS );

	req.open( 'GET', url, true );
	req.send( null );
}

function getJsonRequest( url, onjson ) {

	getHttpRequest( url,
        function( e ) { onjson( JSON.parse( e.responseText ) ); },
        function() {} );

}

function addListeners( dom, listeners ) {

    // TODO: handle event capture, object binding.

	for ( var key in listeners ) {

		dom.addEventListener( key, listeners[ key ] );

	}
}

// File:examples/js/loaders/VRMLLoader.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VRMLLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.VRMLLoader.prototype = {

	constructor: THREE.VRMLLoader,

	// for IndexedFaceSet support
	isRecordingPoints: false,
	isRecordingFaces: false,
	points: [],
	indexes : [],

	// for Background support
	isRecordingAngles: false,
	isRecordingColors: false,
	angles: [],
	colors: [],

	recordingFieldname: null,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( data ) {

		var parseV1 = function ( lines, scene ) {

			console.warn( 'VRML V1.0 not supported yet' );

		};

		var parseV2 = function ( lines, scene ) {

			var defines = {};
			var float_pattern = /(\b|\-|\+)([\d\.e]+)/;
			var float3_pattern = /([\d\.\+\-e]+)\s+([\d\.\+\-e]+)\s+([\d\.\+\-e]+)/g;

			/**
			* Interpolates colors a and b following their relative distance
			* expressed by t.
			*
			* @param float a
			* @param float b
			* @param float t
			* @returns {Color}
			*/
			var interpolateColors = function( a, b, t ) {

				var deltaR = a.r - b.r;
				var deltaG = a.g - b.g;
				var deltaB = a.b - b.b;

				var c = new THREE.Color();

				c.r = a.r - t * deltaR;
				c.g = a.g - t * deltaG;
				c.b = a.b - t * deltaB;

				return c;

			};

			/**
			 * Vertically paints the faces interpolating between the
			 * specified colors at the specified angels. This is used for the Background
			 * node, but could be applied to other nodes with multiple faces as well.
			 *
			 * When used with the Background node, default is directionIsDown is true if
			 * interpolating the skyColor down from the Zenith. When interpolationg up from
			 * the Nadir i.e. interpolating the groundColor, the directionIsDown is false.
			 *
			 * The first angle is never specified, it is the Zenith (0 rad). Angles are specified
			 * in radians. The geometry is thought a sphere, but could be anything. The color interpolation
			 * is linear along the Y axis in any case.
			 *
			 * You must specify one more color than you have angles at the beginning of the colors array.
			 * This is the color of the Zenith (the top of the shape).
			 *
			 * @param geometry
			 * @param radius
			 * @param angles
			 * @param colors
			 * @param boolean directionIsDown Whether to work bottom up or top down.
			 */
			var paintFaces = function ( geometry, radius, angles, colors, directionIsDown ) {

				var f, n, p, vertexIndex, color;

				var direction = directionIsDown ? 1 : - 1;

				var faceIndices = [ 'a', 'b', 'c', 'd' ];

				var coord = [ ], aColor, bColor, t = 1, A = {}, B = {}, applyColor = false, colorIndex;

				for ( var k = 0; k < angles.length; k ++ ) {

					var vec = { };

					// push the vector at which the color changes
					vec.y = direction * ( Math.cos( angles[ k ] ) * radius );

					vec.x = direction * ( Math.sin( angles[ k ] ) * radius );

					coord.push( vec );

				}

				// painting the colors on the faces
				for ( var i = 0; i < geometry.faces.length ; i ++ ) {

					f  = geometry.faces[ i ];

					n = ( f instanceof THREE.Face3 ) ? 3 : 4;

					for ( var j = 0; j < n; j ++ ) {

						vertexIndex = f[ faceIndices[ j ] ];

						p = geometry.vertices[ vertexIndex ];

						for ( var index = 0; index < colors.length; index ++ ) {

							// linear interpolation between aColor and bColor, calculate proportion
							// A is previous point (angle)
							if ( index === 0 ) {

								A.x = 0;
								A.y = directionIsDown ? radius : - 1 * radius;

							} else {

								A.x = coord[ index - 1 ].x;
								A.y = coord[ index - 1 ].y;

							}

							// B is current point (angle)
							B = coord[ index ];

							if ( undefined !== B ) {

								// p has to be between the points A and B which we interpolate
								applyColor = directionIsDown ? p.y <= A.y && p.y > B.y : p.y >= A.y && p.y < B.y;

								if ( applyColor ) {

									bColor = colors[ index + 1 ];

									aColor = colors[ index ];

									// below is simple linear interpolation
									t = Math.abs( p.y - A.y ) / ( A.y - B.y );

									// to make it faster, you can only calculate this if the y coord changes, the color is the same for points with the same y
									color = interpolateColors( aColor, bColor, t );

									f.vertexColors[ j ] = color;

								}

							} else if ( undefined === f.vertexColors[ j ] ) {

								colorIndex = directionIsDown ? colors.length - 1 : 0;
								f.vertexColors[ j ] = colors[ colorIndex ];

							}

						}

					}

				}

			};

			var parseProperty = function ( node, line ) {

				var parts = [], part, property = {}, fieldName;

				/**
				 * Expression for matching relevant information, such as a name or value, but not the separators
				 * @type {RegExp}
				 */
				var regex = /[^\s,\[\]]+/g;

				var point, index, angles, colors;

				while ( null != ( part = regex.exec( line ) ) ) {

					parts.push( part[ 0 ] );

				}

				fieldName = parts[ 0 ];


				// trigger several recorders
				switch ( fieldName ) {
					case 'skyAngle':
					case 'groundAngle':
						this.recordingFieldname = fieldName;
						this.isRecordingAngles = true;
						this.angles = [];
						break;
					case 'skyColor':
					case 'groundColor':
						this.recordingFieldname = fieldName;
						this.isRecordingColors = true;
						this.colors = [];
						break;
					case 'point':
						this.recordingFieldname = fieldName;
						this.isRecordingPoints = true;
						this.points = [];
						break;
					case 'coordIndex':
						this.recordingFieldname = fieldName;
						this.isRecordingFaces = true;
						this.indexes = [];
						break;
				}

				if ( this.isRecordingFaces ) {

					// the parts hold the indexes as strings
					if ( parts.length > 0 ) {

						index = [];

						for ( var ind = 0; ind < parts.length; ind ++ ) {

							// the part should either be positive integer or -1
							if ( ! /(-?\d+)/.test( parts[ ind ] ) ) {

								continue;

							}

							// end of current face
							if ( parts[ ind ] === "-1" ) {

								if ( index.length > 0 ) {

									this.indexes.push( index );

								}

								// start new one
								index = [];

							} else {

								index.push( parseInt( parts[ ind ] ) );

							}

						}

					}

					// end
					if ( /]/.exec( line ) ) {

						this.isRecordingFaces = false;
						node.coordIndex = this.indexes;

					}

				} else if ( this.isRecordingPoints ) {

					while ( null !== ( parts = float3_pattern.exec( line ) ) ) {

						point = {
							x: parseFloat( parts[ 1 ] ),
							y: parseFloat( parts[ 2 ] ),
							z: parseFloat( parts[ 3 ] )
						};

						this.points.push( point );

					}

					// end
					if ( /]/.exec( line ) ) {

						this.isRecordingPoints = false;
						node.points = this.points;

					}

				} else if ( this.isRecordingAngles ) {

					// the parts hold the angles as strings
					if ( parts.length > 0 ) {

						for ( var ind = 0; ind < parts.length; ind ++ ) {

							// the part should be a float
							if ( ! float_pattern.test( parts[ ind ] ) ) {

								continue;

							}

							this.angles.push( parseFloat( parts[ ind ] ) );

						}

					}

					// end
					if ( /]/.exec( line ) ) {

						this.isRecordingAngles = false;
						node[ this.recordingFieldname ] = this.angles;

					}

				} else if ( this.isRecordingColors ) {

					while ( null !== ( parts = float3_pattern.exec( line ) ) ) {

						color = {
							r: parseFloat( parts[ 1 ] ),
							g: parseFloat( parts[ 2 ] ),
							b: parseFloat( parts[ 3 ] )
						};

						this.colors.push( color );

					}

					// end
					if ( /]/.exec( line ) ) {

						this.isRecordingColors = false;
						node[ this.recordingFieldname ] = this.colors;

					}

				} else if ( parts[ parts.length - 1 ] !== 'NULL' && fieldName !== 'children' ) {

					switch ( fieldName ) {

						case 'diffuseColor':
						case 'emissiveColor':
						case 'specularColor':
						case 'color':

							if ( parts.length != 4 ) {

								console.warn( 'Invalid color format detected for ' + fieldName );
								break;

							}

							property = {
								r: parseFloat( parts[ 1 ] ),
								g: parseFloat( parts[ 2 ] ),
								b: parseFloat( parts[ 3 ] )
							};

							break;

						case 'translation':
						case 'scale':
						case 'size':
							if ( parts.length != 4 ) {

								console.warn( 'Invalid vector format detected for ' + fieldName );
								break;

							}

							property = {
								x: parseFloat( parts[ 1 ] ),
								y: parseFloat( parts[ 2 ] ),
								z: parseFloat( parts[ 3 ] )
							};

							break;

						case 'radius':
						case 'topRadius':
						case 'bottomRadius':
						case 'height':
						case 'transparency':
						case 'shininess':
						case 'ambientIntensity':
							if ( parts.length != 2 ) {

								console.warn( 'Invalid single float value specification detected for ' + fieldName );
								break;

							}

							property = parseFloat( parts[ 1 ] );

							break;

						case 'rotation':
							if ( parts.length != 5 ) {

								console.warn( 'Invalid quaternion format detected for ' + fieldName );
								break;

							}

							property = {
								x: parseFloat( parts[ 1 ] ),
								y: parseFloat( parts[ 2 ] ),
								z: parseFloat( parts[ 3 ] ),
								w: parseFloat( parts[ 4 ] )
							};

							break;

						case 'ccw':
						case 'solid':
						case 'colorPerVertex':
						case 'convex':
							if ( parts.length != 2 ) {

								console.warn( 'Invalid format detected for ' + fieldName );
								break;

							}

							property = parts[ 1 ] === 'TRUE' ? true : false;

							break;
					}

					node[ fieldName ] = property;

				}

				return property;

			};

			var getTree = function ( lines ) {

				var tree = { 'string': 'Scene', children: [] };
				var current = tree;
				var matches;
				var specification;

				for ( var i = 0; i < lines.length; i ++ ) {

					var comment = '';

					var line = lines[ i ];

					// omit whitespace only lines
					if ( null !== ( result = /^\s+?$/g.exec( line ) ) ) {

						continue;

					}

					line = line.trim();

					// skip empty lines
					if ( line === '' ) {

						continue;

					}

					if ( /#/.exec( line ) ) {

						var parts = line.split( '#' );

						// discard everything after the #, it is a comment
						line = parts[ 0 ];

						// well, let's also keep the comment
						comment = parts[ 1 ];

					}

					if ( matches = /([^\s]*){1}\s?{/.exec( line ) ) {

						// first subpattern should match the Node name

						var block = { 'nodeType' : matches[ 1 ], 'string': line, 'parent': current, 'children': [], 'comment' : comment };
						current.children.push( block );
						current = block;

						if ( /}/.exec( line ) ) {

							// example: geometry Box { size 1 1 1 } # all on the same line
							specification = /{(.*)}/.exec( line )[ 1 ];

							// todo: remove once new parsing is complete?
							block.children.push( specification );

							parseProperty( current, specification );

							current = current.parent;

						}

					} else if ( /}/.exec( line ) ) {

						current = current.parent;

					} else if ( line !== '' ) {

						parseProperty( current, line );
						// todo: remove once new parsing is complete? we still do not parse geometry and appearance the new way
						current.children.push( line );

					}

				}

				return tree;

			};

			var parseNode = function ( data, parent ) {

				// console.log( data );

				if ( typeof data === 'string' ) {

					if ( /USE/.exec( data ) ) {

						var defineKey = /USE\s+?(\w+)/.exec( data )[ 1 ];

						if ( undefined == defines[ defineKey ] ) {

							console.warn( defineKey + ' is not defined.' );

						} else {

							if ( /appearance/.exec( data ) && defineKey ) {

								parent.material = defines[ defineKey ].clone();

							} else if ( /geometry/.exec( data ) && defineKey ) {

								parent.geometry = defines[ defineKey ].clone();

								// the solid property is not cloned with clone(), is only needed for VRML loading, so we need to transfer it
								if ( undefined !== defines[ defineKey ].solid && defines[ defineKey ].solid === false ) {

									parent.geometry.solid = false;
									parent.material.side = THREE.DoubleSide;

								}

							} else if ( defineKey ) {

								var object = defines[ defineKey ].clone();
								parent.add( object );

							}

						}

					}

					return;

				}

				var object = parent;

				if ( 'Transform' === data.nodeType || 'Group' === data.nodeType ) {

					object = new THREE.Object3D();

					if ( /DEF/.exec( data.string ) ) {

						object.name = /DEF\s+(\w+)/.exec( data.string )[ 1 ];
						defines[ object.name ] = object;

					}

					if ( undefined !== data[ 'translation' ] ) {

						var t = data.translation;

						object.position.set( t.x, t.y, t.z );

					}

					if ( undefined !== data.rotation ) {

						var r = data.rotation;

						object.quaternion.setFromAxisAngle( new THREE.Vector3( r.x, r.y, r.z ), r.w );

					}

					if ( undefined !== data.scale ) {

						var s = data.scale;

						object.scale.set( s.x, s.y, s.z );

					}

					parent.add( object );

				} else if ( 'Shape' === data.nodeType ) {

					object = new THREE.Mesh();

					if ( /DEF/.exec( data.string ) ) {

						object.name = /DEF (\w+)/.exec( data.string )[ 1 ];

						defines[ object.name ] = object;

					}

					parent.add( object );

				} else if ( 'Background' === data.nodeType ) {

					var segments = 20;

					// sky (full sphere):

					var radius = 2e4;

					var skyGeometry = new THREE.SphereGeometry( radius, segments, segments );
					var skyMaterial = new THREE.MeshBasicMaterial( { fog: false, side: THREE.BackSide } );

					if ( data.skyColor.length > 1 ) {

						paintFaces( skyGeometry, radius, data.skyAngle, data.skyColor, true );

						skyMaterial.vertexColors = THREE.VertexColors

					} else {

						var color = data.skyColor[ 0 ];
						skyMaterial.color.setRGB( color.r, color.b, color.g );

					}

					scene.add( new THREE.Mesh( skyGeometry, skyMaterial ) );

					// ground (half sphere):

					if ( data.groundColor !== undefined ) {

						radius = 1.2e4;

						var groundGeometry = new THREE.SphereGeometry( radius, segments, segments, 0, 2 * Math.PI, 0.5 * Math.PI, 1.5 * Math.PI );
						var groundMaterial = new THREE.MeshBasicMaterial( { fog: false, side: THREE.BackSide, vertexColors: THREE.VertexColors } );

						paintFaces( groundGeometry, radius, data.groundAngle, data.groundColor, false );

						scene.add( new THREE.Mesh( groundGeometry, groundMaterial ) );

					}

				} else if ( /geometry/.exec( data.string ) ) {

					if ( 'Box' === data.nodeType ) {

						var s = data.size;

						parent.geometry = new THREE.BoxGeometry( s.x, s.y, s.z );

					} else if ( 'Cylinder' === data.nodeType ) {

						parent.geometry = new THREE.CylinderGeometry( data.radius, data.radius, data.height );

					} else if ( 'Cone' === data.nodeType ) {

						parent.geometry = new THREE.CylinderGeometry( data.topRadius, data.bottomRadius, data.height );

					} else if ( 'Sphere' === data.nodeType ) {

						parent.geometry = new THREE.SphereGeometry( data.radius );

					} else if ( 'IndexedFaceSet' === data.nodeType ) {

						var geometry = new THREE.Geometry();

						var indexes;

						for ( var i = 0, j = data.children.length; i < j; i ++ ) {

							var child = data.children[ i ];

							var vec;

							if ( 'Coordinate' === child.nodeType ) {

								for ( var k = 0, l = child.points.length; k < l; k ++ ) {

									var point = child.points[ k ];

									vec = new THREE.Vector3( point.x, point.y, point.z );

									geometry.vertices.push( vec );

								}

								break;

							}

						}

						var skip = 0;

						// read this: http://math.hws.edu/eck/cs424/notes2013/16_Threejs_Advanced.html
						for ( var i = 0, j = data.coordIndex.length; i < j; i ++ ) {

							indexes = data.coordIndex[ i ];

							// vrml support multipoint indexed face sets (more then 3 vertices). You must calculate the composing triangles here
							skip = 0;

							// todo: this is the time to check if the faces are ordered ccw or not (cw)

							// Face3 only works with triangles, but IndexedFaceSet allows shapes with more then three vertices, build them of triangles
							while ( indexes.length >= 3 && skip < ( indexes.length - 2 ) ) {

								var face = new THREE.Face3(
									indexes[ 0 ],
									indexes[ skip + 1 ],
									indexes[ skip + 2 ],
									null // normal, will be added later
									// todo: pass in the color, if a color index is present
								);

								skip ++;

								geometry.faces.push( face );

							}


						}

						if ( false === data.solid ) {

							parent.material.side = THREE.DoubleSide;

						}

						// we need to store it on the geometry for use with defines
						geometry.solid = data.solid;

						geometry.computeFaceNormals();
						//geometry.computeVertexNormals(); // does not show
						geometry.computeBoundingSphere();

						// see if it's a define
						if ( /DEF/.exec( data.string ) ) {

							geometry.name = /DEF (\w+)/.exec( data.string )[ 1 ];
							defines[ geometry.name ] = geometry;

						}

						parent.geometry = geometry;

					}

					return;

				} else if ( /appearance/.exec( data.string ) ) {

					for ( var i = 0; i < data.children.length; i ++ ) {

						var child = data.children[ i ];

						if ( 'Material' === child.nodeType ) {

							var material = new THREE.MeshPhongMaterial();

							if ( undefined !== child.diffuseColor ) {

								var d = child.diffuseColor;

								material.color.setRGB( d.r, d.g, d.b );

							}

							if ( undefined !== child.emissiveColor ) {

								var e = child.emissiveColor;

								material.emissive.setRGB( e.r, e.g, e.b );

							}

							if ( undefined !== child.specularColor ) {

								var s = child.specularColor;

								material.specular.setRGB( s.r, s.g, s.b );

							}

							if ( undefined !== child.transparency ) {

								var t = child.transparency;

								// transparency is opposite of opacity
								material.opacity = Math.abs( 1 - t );

								material.transparent = true;

							}

							if ( /DEF/.exec( data.string ) ) {

								material.name = /DEF (\w+)/.exec( data.string )[ 1 ];

								defines[ material.name ] = material;

							}

							parent.material = material;

							// material found, stop looping
							break;

						}

					}

					return;

				}

				for ( var i = 0, l = data.children.length; i < l; i ++ ) {

					var child = data.children[ i ];

					parseNode( data.children[ i ], object );

				}

			};

			parseNode( getTree( lines ), scene );

		};

		var scene = new THREE.Scene();

		var lines = data.split( '\n' );

		var header = lines.shift();

		if ( /V1.0/.exec( header ) ) {

			parseV1( lines, scene );

		} else if ( /V2.0/.exec( header ) ) {

			parseV2( lines, scene );

		}

		return scene;

	}

};

// File:examples/js/loaders/VTKLoader.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VTKLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.VTKLoader.prototype = {

	constructor: THREE.VTKLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( data ) {

		var indices = [];
		var positions = [];

		var result;

		// float float float

		var pat3Floats = /([\-]?[\d]+[\.]?[\d|\-|e]*)[ ]+([\-]?[\d]+[\.]?[\d|\-|e]*)[ ]+([\-]?[\d]+[\.]?[\d|\-|e]*)/g;
		var patTriangle = /^3[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)/;
		var patQuad = /^4[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)/;
		var patPOINTS = /^POINTS /;
		var patPOLYGONS = /^POLYGONS /;
		var inPointsSection = false;
		var inPolygonsSection = false;

		var lines = data.split('\n');
		for ( var i = 0; i < lines.length; ++i ) {

			line = lines[i];

			if ( inPointsSection ) {

				// get the vertices

				while ( ( result = pat3Floats.exec( line ) ) !== null ) {
					positions.push( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ) );
				}
			}
			else if ( inPolygonsSection ) {

				result = patTriangle.exec(line);

				if ( result !== null ) {

					// 3 int int int
					// triangle

					indices.push( parseInt( result[ 1 ] ), parseInt( result[ 2 ] ), parseInt( result[ 3 ] ) );
				}
				else {

					result = patQuad.exec(line);

					if ( result !== null ) {

						// 4 int int int int
						// break quad into two triangles

						indices.push( parseInt( result[ 1 ] ), parseInt( result[ 2 ] ), parseInt( result[ 4 ] ) );
						indices.push( parseInt( result[ 2 ] ), parseInt( result[ 3 ] ), parseInt( result[ 4 ] ) );
					}

				}

			}

			if ( patPOLYGONS.exec(line) !== null ) {
				inPointsSection = false;
				inPolygonsSection = true;
			}
			if ( patPOINTS.exec(line) !== null ) {
				inPolygonsSection = false;
				inPointsSection = true;
			}
		}

		var geometry = new THREE.BufferGeometry();
		geometry.setIndex( new THREE.BufferAttribute( new ( indices.length > 65535 ? Uint32Array : Uint16Array )( indices ), 1 ) );
		geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );

		return geometry;

	}

};

THREE.EventDispatcher.prototype.apply( THREE.VTKLoader.prototype );

// File:examples/js/loaders/ctm/lzma.js


var LZMA = LZMA || {};

// browserify support
if ( typeof module === 'object' ) {

	module.exports = LZMA;

}

LZMA.OutWindow = function() {
	this._windowSize = 0;
};

LZMA.OutWindow.prototype.create = function(windowSize) {
	if ( (!this._buffer) || (this._windowSize !== windowSize) ) {
		this._buffer = [];
	}
	this._windowSize = windowSize;
	this._pos = 0;
	this._streamPos = 0;
};

LZMA.OutWindow.prototype.flush = function() {
	var size = this._pos - this._streamPos;
	if (size !== 0) {
		while (size --) {
			this._stream.writeByte(this._buffer[this._streamPos ++]);
		}
		if (this._pos >= this._windowSize) {
			this._pos = 0;
		}
		this._streamPos = this._pos;
	}
};

LZMA.OutWindow.prototype.releaseStream = function() {
	this.flush();
	this._stream = null;
};

LZMA.OutWindow.prototype.setStream = function(stream) {
	this.releaseStream();
	this._stream = stream;
};

LZMA.OutWindow.prototype.init = function(solid) {
	if (!solid) {
		this._streamPos = 0;
		this._pos = 0;
	}
};

LZMA.OutWindow.prototype.copyBlock = function(distance, len) {
	var pos = this._pos - distance - 1;
	if (pos < 0) {
		pos += this._windowSize;
	}
	while (len --) {
		if (pos >= this._windowSize) {
			pos = 0;
		}
		this._buffer[this._pos ++] = this._buffer[pos ++];
		if (this._pos >= this._windowSize) {
			this.flush();
		}
	}
};

LZMA.OutWindow.prototype.putByte = function(b) {
	this._buffer[this._pos ++] = b;
	if (this._pos >= this._windowSize) {
		this.flush();
	}
};

LZMA.OutWindow.prototype.getByte = function(distance) {
	var pos = this._pos - distance - 1;
	if (pos < 0) {
		pos += this._windowSize;
	}
	return this._buffer[pos];
};

LZMA.RangeDecoder = function() {
};

LZMA.RangeDecoder.prototype.setStream = function(stream) {
	this._stream = stream;
};

LZMA.RangeDecoder.prototype.releaseStream = function() {
	this._stream = null;
};

LZMA.RangeDecoder.prototype.init = function() {
	var i = 5;

	this._code = 0;
	this._range = -1;
  
	while (i --) {
		this._code = (this._code << 8) | this._stream.readByte();
	}
};

LZMA.RangeDecoder.prototype.decodeDirectBits = function(numTotalBits) {
	var result = 0, i = numTotalBits, t;

	while (i --) {
		this._range >>>= 1;
		t = (this._code - this._range) >>> 31;
		this._code -= this._range & (t - 1);
		result = (result << 1) | (1 - t);

		if ( (this._range & 0xff000000) === 0) {
			this._code = (this._code << 8) | this._stream.readByte();
			this._range <<= 8;
		}
	}

	return result;
};

LZMA.RangeDecoder.prototype.decodeBit = function(probs, index) {
	var prob = probs[index],
      newBound = (this._range >>> 11) * prob;

	if ( (this._code ^ 0x80000000) < (newBound ^ 0x80000000) ) {
		this._range = newBound;
		probs[index] += (2048 - prob) >>> 5;
		if ( (this._range & 0xff000000) === 0) {
			this._code = (this._code << 8) | this._stream.readByte();
			this._range <<= 8;
		}
		return 0;
	}

	this._range -= newBound;
	this._code -= newBound;
	probs[index] -= prob >>> 5;
	if ( (this._range & 0xff000000) === 0) {
		this._code = (this._code << 8) | this._stream.readByte();
		this._range <<= 8;
	}
	return 1;
};

LZMA.initBitModels = function(probs, len) {
	while (len --) {
		probs[len] = 1024;
	}
};

LZMA.BitTreeDecoder = function(numBitLevels) {
	this._models = [];
	this._numBitLevels = numBitLevels;
};

LZMA.BitTreeDecoder.prototype.init = function() {
	LZMA.initBitModels(this._models, 1 << this._numBitLevels);
};

LZMA.BitTreeDecoder.prototype.decode = function(rangeDecoder) {
	var m = 1, i = this._numBitLevels;

	while (i --) {
		m = (m << 1) | rangeDecoder.decodeBit(this._models, m);
	}
	return m - (1 << this._numBitLevels);
};

LZMA.BitTreeDecoder.prototype.reverseDecode = function(rangeDecoder) {
	var m = 1, symbol = 0, i = 0, bit;

	for (; i < this._numBitLevels; ++ i) {
		bit = rangeDecoder.decodeBit(this._models, m);
		m = (m << 1) | bit;
		symbol |= bit << i;
	}
	return symbol;
};

LZMA.reverseDecode2 = function(models, startIndex, rangeDecoder, numBitLevels) {
	var m = 1, symbol = 0, i = 0, bit;

	for (; i < numBitLevels; ++ i) {
		bit = rangeDecoder.decodeBit(models, startIndex + m);
		m = (m << 1) | bit;
		symbol |= bit << i;
	}
	return symbol;
};

LZMA.LenDecoder = function() {
	this._choice = [];
	this._lowCoder = [];
	this._midCoder = [];
	this._highCoder = new LZMA.BitTreeDecoder(8);
	this._numPosStates = 0;
};

LZMA.LenDecoder.prototype.create = function(numPosStates) {
	for (; this._numPosStates < numPosStates; ++ this._numPosStates) {
		this._lowCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);
		this._midCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);
	}
};

LZMA.LenDecoder.prototype.init = function() {
	var i = this._numPosStates;
	LZMA.initBitModels(this._choice, 2);
	while (i --) {
		this._lowCoder[i].init();
		this._midCoder[i].init();
	}
	this._highCoder.init();
};

LZMA.LenDecoder.prototype.decode = function(rangeDecoder, posState) {
	if (rangeDecoder.decodeBit(this._choice, 0) === 0) {
		return this._lowCoder[posState].decode(rangeDecoder);
	}
	if (rangeDecoder.decodeBit(this._choice, 1) === 0) {
		return 8 + this._midCoder[posState].decode(rangeDecoder);
	}
	return 16 + this._highCoder.decode(rangeDecoder);
};

LZMA.Decoder2 = function() {
	this._decoders = [];
};

LZMA.Decoder2.prototype.init = function() {
	LZMA.initBitModels(this._decoders, 0x300);
};

LZMA.Decoder2.prototype.decodeNormal = function(rangeDecoder) {
	var symbol = 1;

	do {
		symbol = (symbol << 1) | rangeDecoder.decodeBit(this._decoders, symbol);
	}while (symbol < 0x100);

	return symbol & 0xff;
};

LZMA.Decoder2.prototype.decodeWithMatchByte = function(rangeDecoder, matchByte) {
	var symbol = 1, matchBit, bit;

	do {
		matchBit = (matchByte >> 7) & 1;
		matchByte <<= 1;
		bit = rangeDecoder.decodeBit(this._decoders, ( (1 + matchBit) << 8) + symbol);
		symbol = (symbol << 1) | bit;
		if (matchBit !== bit) {
			while (symbol < 0x100) {
				symbol = (symbol << 1) | rangeDecoder.decodeBit(this._decoders, symbol);
			}
			break;
		}
	}while (symbol < 0x100);

	return symbol & 0xff;
};

LZMA.LiteralDecoder = function() {
};

LZMA.LiteralDecoder.prototype.create = function(numPosBits, numPrevBits) {
	var i;

	if (this._coders
    && (this._numPrevBits === numPrevBits)
    && (this._numPosBits === numPosBits) ) {
		return;
	}
	this._numPosBits = numPosBits;
	this._posMask = (1 << numPosBits) - 1;
	this._numPrevBits = numPrevBits;

	this._coders = [];

	i = 1 << (this._numPrevBits + this._numPosBits);
	while (i --) {
		this._coders[i] = new LZMA.Decoder2();
	}
};

LZMA.LiteralDecoder.prototype.init = function() {
	var i = 1 << (this._numPrevBits + this._numPosBits);
	while (i --) {
		this._coders[i].init();
	}
};

LZMA.LiteralDecoder.prototype.getDecoder = function(pos, prevByte) {
	return this._coders[( (pos & this._posMask) << this._numPrevBits)
    + ( (prevByte & 0xff) >>> (8 - this._numPrevBits) )];
};

LZMA.Decoder = function() {
	this._outWindow = new LZMA.OutWindow();
	this._rangeDecoder = new LZMA.RangeDecoder();
	this._isMatchDecoders = [];
	this._isRepDecoders = [];
	this._isRepG0Decoders = [];
	this._isRepG1Decoders = [];
	this._isRepG2Decoders = [];
	this._isRep0LongDecoders = [];
	this._posSlotDecoder = [];
	this._posDecoders = [];
	this._posAlignDecoder = new LZMA.BitTreeDecoder(4);
	this._lenDecoder = new LZMA.LenDecoder();
	this._repLenDecoder = new LZMA.LenDecoder();
	this._literalDecoder = new LZMA.LiteralDecoder();
	this._dictionarySize = -1;
	this._dictionarySizeCheck = -1;

	this._posSlotDecoder[0] = new LZMA.BitTreeDecoder(6);
	this._posSlotDecoder[1] = new LZMA.BitTreeDecoder(6);
	this._posSlotDecoder[2] = new LZMA.BitTreeDecoder(6);
	this._posSlotDecoder[3] = new LZMA.BitTreeDecoder(6);
};

LZMA.Decoder.prototype.setDictionarySize = function(dictionarySize) {
	if (dictionarySize < 0) {
		return false;
	}
	if (this._dictionarySize !== dictionarySize) {
		this._dictionarySize = dictionarySize;
		this._dictionarySizeCheck = Math.max(this._dictionarySize, 1);
		this._outWindow.create( Math.max(this._dictionarySizeCheck, 4096) );
	}
	return true;
};

LZMA.Decoder.prototype.setLcLpPb = function(lc, lp, pb) {
	var numPosStates = 1 << pb;

	if (lc > 8 || lp > 4 || pb > 4) {
		return false;
	}

	this._literalDecoder.create(lp, lc);

	this._lenDecoder.create(numPosStates);
	this._repLenDecoder.create(numPosStates);
	this._posStateMask = numPosStates - 1;

	return true;
};

LZMA.Decoder.prototype.init = function() {
	var i = 4;

	this._outWindow.init(false);

	LZMA.initBitModels(this._isMatchDecoders, 192);
	LZMA.initBitModels(this._isRep0LongDecoders, 192);
	LZMA.initBitModels(this._isRepDecoders, 12);
	LZMA.initBitModels(this._isRepG0Decoders, 12);
	LZMA.initBitModels(this._isRepG1Decoders, 12);
	LZMA.initBitModels(this._isRepG2Decoders, 12);
	LZMA.initBitModels(this._posDecoders, 114);

	this._literalDecoder.init();

	while (i --) {
		this._posSlotDecoder[i].init();
	}

	this._lenDecoder.init();
	this._repLenDecoder.init();
	this._posAlignDecoder.init();
	this._rangeDecoder.init();
};

LZMA.Decoder.prototype.decode = function(inStream, outStream, outSize) {
	var state = 0, rep0 = 0, rep1 = 0, rep2 = 0, rep3 = 0, nowPos64 = 0, prevByte = 0,
      posState, decoder2, len, distance, posSlot, numDirectBits;

	this._rangeDecoder.setStream(inStream);
	this._outWindow.setStream(outStream);

	this.init();

	while (outSize < 0 || nowPos64 < outSize) {
		posState = nowPos64 & this._posStateMask;

		if (this._rangeDecoder.decodeBit(this._isMatchDecoders, (state << 4) + posState) === 0) {
			decoder2 = this._literalDecoder.getDecoder(nowPos64 ++, prevByte);

			if (state >= 7) {
				prevByte = decoder2.decodeWithMatchByte(this._rangeDecoder, this._outWindow.getByte(rep0) );
			}else {
				prevByte = decoder2.decodeNormal(this._rangeDecoder);
			}
			this._outWindow.putByte(prevByte);

			state = state < 4 ? 0 : state - (state < 10 ? 3 : 6);

		}else {

			if (this._rangeDecoder.decodeBit(this._isRepDecoders, state) === 1) {
				len = 0;
				if (this._rangeDecoder.decodeBit(this._isRepG0Decoders, state) === 0) {
					if (this._rangeDecoder.decodeBit(this._isRep0LongDecoders, (state << 4) + posState) === 0) {
						state = state < 7 ? 9 : 11;
						len = 1;
					}
				}else {
					if (this._rangeDecoder.decodeBit(this._isRepG1Decoders, state) === 0) {
						distance = rep1;
					}else {
						if (this._rangeDecoder.decodeBit(this._isRepG2Decoders, state) === 0) {
							distance = rep2;
						}else {
							distance = rep3;
							rep3 = rep2;
						}
						rep2 = rep1;
					}
					rep1 = rep0;
					rep0 = distance;
				}
				if (len === 0) {
					len = 2 + this._repLenDecoder.decode(this._rangeDecoder, posState);
					state = state < 7 ? 8 : 11;
				}
			}else {
				rep3 = rep2;
				rep2 = rep1;
				rep1 = rep0;

				len = 2 + this._lenDecoder.decode(this._rangeDecoder, posState);
				state = state < 7 ? 7 : 10;

				posSlot = this._posSlotDecoder[len <= 5 ? len - 2 : 3].decode(this._rangeDecoder);
				if (posSlot >= 4) {

					numDirectBits = (posSlot >> 1) - 1;
					rep0 = (2 | (posSlot & 1) ) << numDirectBits;

					if (posSlot < 14) {
						rep0 += LZMA.reverseDecode2(this._posDecoders,
                rep0 - posSlot - 1, this._rangeDecoder, numDirectBits);
					}else {
						rep0 += this._rangeDecoder.decodeDirectBits(numDirectBits - 4) << 4;
						rep0 += this._posAlignDecoder.reverseDecode(this._rangeDecoder);
						if (rep0 < 0) {
							if (rep0 === -1) {
								break;
							}
							return false;
						}
					}
				}else {
					rep0 = posSlot;
				}
			}

			if (rep0 >= nowPos64 || rep0 >= this._dictionarySizeCheck) {
				return false;
			}

			this._outWindow.copyBlock(rep0, len);
			nowPos64 += len;
			prevByte = this._outWindow.getByte(0);
		}
	}

	this._outWindow.flush();
	this._outWindow.releaseStream();
	this._rangeDecoder.releaseStream();

	return true;
};

LZMA.Decoder.prototype.setDecoderProperties = function(properties) {
	var value, lc, lp, pb, dictionarySize;

	if (properties.size < 5) {
		return false;
	}

	value = properties.readByte();
	lc = value % 9;
	value = ~~(value / 9);
	lp = value % 5;
	pb = ~~(value / 5);

	if ( !this.setLcLpPb(lc, lp, pb) ) {
		return false;
	}

	dictionarySize = properties.readByte();
	dictionarySize |= properties.readByte() << 8;
	dictionarySize |= properties.readByte() << 16;
	dictionarySize += properties.readByte() * 16777216;

	return this.setDictionarySize(dictionarySize);
};

LZMA.decompress = function(properties, inStream, outStream, outSize) {
	var decoder = new LZMA.Decoder();

	if ( !decoder.setDecoderProperties(properties) ) {
		throw "Incorrect stream properties";
	}

	if ( !decoder.decode(inStream, outStream, outSize) ) {
		throw "Error in data stream";
	}

	return true;
};

// File:examples/js/loaders/ctm/ctm.js

/*
Copyright (c) 2011 Juan Mellado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
References:
- "OpenCTM: The Open Compressed Triangle Mesh file format" by Marcus Geelnard
  http://openctm.sourceforge.net/
*/

var CTM = CTM || {};

// browserify support
if ( typeof module === 'object' ) {

	module.exports = CTM;

}

CTM.CompressionMethod = {
  RAW: 0x00574152,
  MG1: 0x0031474d,
  MG2: 0x0032474d
};

CTM.Flags = {
  NORMALS: 0x00000001
};

CTM.File = function(stream) {
	this.load(stream);
};

CTM.File.prototype.load = function(stream) {
	this.header = new CTM.FileHeader(stream);

	this.body = new CTM.FileBody(this.header);
  
	this.getReader().read(stream, this.body);
};

CTM.File.prototype.getReader = function() {
	var reader;

	switch (this.header.compressionMethod){
		case CTM.CompressionMethod.RAW:
			reader = new CTM.ReaderRAW();
			break;
		case CTM.CompressionMethod.MG1:
			reader = new CTM.ReaderMG1();
			break;
		case CTM.CompressionMethod.MG2:
			reader = new CTM.ReaderMG2();
			break;
	}

	return reader;
};

CTM.FileHeader = function(stream) {
	stream.readInt32(); //magic "OCTM"
	this.fileFormat = stream.readInt32();
	this.compressionMethod = stream.readInt32();
	this.vertexCount = stream.readInt32();
	this.triangleCount = stream.readInt32();
	this.uvMapCount = stream.readInt32();
	this.attrMapCount = stream.readInt32();
	this.flags = stream.readInt32();
	this.comment = stream.readString();
};

CTM.FileHeader.prototype.hasNormals = function() {
	return this.flags & CTM.Flags.NORMALS;
};

CTM.FileBody = function(header) {
	var i = header.triangleCount * 3,
      v = header.vertexCount * 3,
      n = header.hasNormals() ? header.vertexCount * 3 : 0,
      u = header.vertexCount * 2,
      a = header.vertexCount * 4,
      j = 0;

	var data = new ArrayBuffer(
    (i + v + n + (u * header.uvMapCount) + (a * header.attrMapCount) ) * 4);

	this.indices = new Uint32Array(data, 0, i);

	this.vertices = new Float32Array(data, i * 4, v);

	if ( header.hasNormals() ) {
		this.normals = new Float32Array(data, (i + v) * 4, n);
	}
  
	if (header.uvMapCount) {
		this.uvMaps = [];
		for (j = 0; j < header.uvMapCount; ++ j) {
			this.uvMaps[j] = { uv: new Float32Array(data,
        (i + v + n + (j * u) ) * 4, u) };
		}
	}
  
	if (header.attrMapCount) {
		this.attrMaps = [];
		for (j = 0; j < header.attrMapCount; ++ j) {
			this.attrMaps[j] = { attr: new Float32Array(data,
        (i + v + n + (u * header.uvMapCount) + (j * a) ) * 4, a) };
		}
	}
};

CTM.FileMG2Header = function(stream) {
	stream.readInt32(); //magic "MG2H"
	this.vertexPrecision = stream.readFloat32();
	this.normalPrecision = stream.readFloat32();
	this.lowerBoundx = stream.readFloat32();
	this.lowerBoundy = stream.readFloat32();
	this.lowerBoundz = stream.readFloat32();
	this.higherBoundx = stream.readFloat32();
	this.higherBoundy = stream.readFloat32();
	this.higherBoundz = stream.readFloat32();
	this.divx = stream.readInt32();
	this.divy = stream.readInt32();
	this.divz = stream.readInt32();
  
	this.sizex = (this.higherBoundx - this.lowerBoundx) / this.divx;
	this.sizey = (this.higherBoundy - this.lowerBoundy) / this.divy;
	this.sizez = (this.higherBoundz - this.lowerBoundz) / this.divz;
};

CTM.ReaderRAW = function() {
};

CTM.ReaderRAW.prototype.read = function(stream, body) {
	this.readIndices(stream, body.indices);
	this.readVertices(stream, body.vertices);
  
	if (body.normals) {
		this.readNormals(stream, body.normals);
	}
	if (body.uvMaps) {
		this.readUVMaps(stream, body.uvMaps);
	}
	if (body.attrMaps) {
		this.readAttrMaps(stream, body.attrMaps);
	}
};

CTM.ReaderRAW.prototype.readIndices = function(stream, indices) {
	stream.readInt32(); //magic "INDX"
	stream.readArrayInt32(indices);
};

CTM.ReaderRAW.prototype.readVertices = function(stream, vertices) {
	stream.readInt32(); //magic "VERT"
	stream.readArrayFloat32(vertices);
};

CTM.ReaderRAW.prototype.readNormals = function(stream, normals) {
	stream.readInt32(); //magic "NORM"
	stream.readArrayFloat32(normals);
};

CTM.ReaderRAW.prototype.readUVMaps = function(stream, uvMaps) {
	var i = 0;
	for (; i < uvMaps.length; ++ i) {
		stream.readInt32(); //magic "TEXC"

		uvMaps[i].name = stream.readString();
		uvMaps[i].filename = stream.readString();
		stream.readArrayFloat32(uvMaps[i].uv);
	}
};

CTM.ReaderRAW.prototype.readAttrMaps = function(stream, attrMaps) {
	var i = 0;
	for (; i < attrMaps.length; ++ i) {
		stream.readInt32(); //magic "ATTR"

		attrMaps[i].name = stream.readString();
		stream.readArrayFloat32(attrMaps[i].attr);
	}
};

CTM.ReaderMG1 = function() {
};

CTM.ReaderMG1.prototype.read = function(stream, body) {
	this.readIndices(stream, body.indices);
	this.readVertices(stream, body.vertices);
  
	if (body.normals) {
		this.readNormals(stream, body.normals);
	}
	if (body.uvMaps) {
		this.readUVMaps(stream, body.uvMaps);
	}
	if (body.attrMaps) {
		this.readAttrMaps(stream, body.attrMaps);
	}
};

CTM.ReaderMG1.prototype.readIndices = function(stream, indices) {
	stream.readInt32(); //magic "INDX"
	stream.readInt32(); //packed size
  
	var interleaved = new CTM.InterleavedStream(indices, 3);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

	CTM.restoreIndices(indices, indices.length);
};

CTM.ReaderMG1.prototype.readVertices = function(stream, vertices) {
	stream.readInt32(); //magic "VERT"
	stream.readInt32(); //packed size
  
	var interleaved = new CTM.InterleavedStream(vertices, 1);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

CTM.ReaderMG1.prototype.readNormals = function(stream, normals) {
	stream.readInt32(); //magic "NORM"
	stream.readInt32(); //packed size

	var interleaved = new CTM.InterleavedStream(normals, 3);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

CTM.ReaderMG1.prototype.readUVMaps = function(stream, uvMaps) {
	var i = 0;
	for (; i < uvMaps.length; ++ i) {
		stream.readInt32(); //magic "TEXC"

		uvMaps[i].name = stream.readString();
		uvMaps[i].filename = stream.readString();
    
		stream.readInt32(); //packed size

		var interleaved = new CTM.InterleavedStream(uvMaps[i].uv, 2);
		LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
	}
};

CTM.ReaderMG1.prototype.readAttrMaps = function(stream, attrMaps) {
	var i = 0;
	for (; i < attrMaps.length; ++ i) {
		stream.readInt32(); //magic "ATTR"

		attrMaps[i].name = stream.readString();
    
		stream.readInt32(); //packed size

		var interleaved = new CTM.InterleavedStream(attrMaps[i].attr, 4);
		LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
	}
};

CTM.ReaderMG2 = function() {
};

CTM.ReaderMG2.prototype.read = function(stream, body) {
	this.MG2Header = new CTM.FileMG2Header(stream);
  
	this.readVertices(stream, body.vertices);
	this.readIndices(stream, body.indices);
  
	if (body.normals) {
		this.readNormals(stream, body);
	}
	if (body.uvMaps) {
		this.readUVMaps(stream, body.uvMaps);
	}
	if (body.attrMaps) {
		this.readAttrMaps(stream, body.attrMaps);
	}
};

CTM.ReaderMG2.prototype.readVertices = function(stream, vertices) {
	stream.readInt32(); //magic "VERT"
	stream.readInt32(); //packed size

	var interleaved = new CTM.InterleavedStream(vertices, 3);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  
	var gridIndices = this.readGridIndices(stream, vertices);
  
	CTM.restoreVertices(vertices, this.MG2Header, gridIndices, this.MG2Header.vertexPrecision);
};

CTM.ReaderMG2.prototype.readGridIndices = function(stream, vertices) {
	stream.readInt32(); //magic "GIDX"
	stream.readInt32(); //packed size
  
	var gridIndices = new Uint32Array(vertices.length / 3);
  
	var interleaved = new CTM.InterleavedStream(gridIndices, 1);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  
	CTM.restoreGridIndices(gridIndices, gridIndices.length);
  
	return gridIndices;
};

CTM.ReaderMG2.prototype.readIndices = function(stream, indices) {
	stream.readInt32(); //magic "INDX"
	stream.readInt32(); //packed size

	var interleaved = new CTM.InterleavedStream(indices, 3);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

	CTM.restoreIndices(indices, indices.length);
};

CTM.ReaderMG2.prototype.readNormals = function(stream, body) {
	stream.readInt32(); //magic "NORM"
	stream.readInt32(); //packed size

	var interleaved = new CTM.InterleavedStream(body.normals, 3);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

	var smooth = CTM.calcSmoothNormals(body.indices, body.vertices);

	CTM.restoreNormals(body.normals, smooth, this.MG2Header.normalPrecision);
};

CTM.ReaderMG2.prototype.readUVMaps = function(stream, uvMaps) {
	var i = 0;
	for (; i < uvMaps.length; ++ i) {
		stream.readInt32(); //magic "TEXC"

		uvMaps[i].name = stream.readString();
		uvMaps[i].filename = stream.readString();
    
		var precision = stream.readFloat32();
    
		stream.readInt32(); //packed size

		var interleaved = new CTM.InterleavedStream(uvMaps[i].uv, 2);
		LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
    
		CTM.restoreMap(uvMaps[i].uv, 2, precision);
	}
};

CTM.ReaderMG2.prototype.readAttrMaps = function(stream, attrMaps) {
	var i = 0;
	for (; i < attrMaps.length; ++ i) {
		stream.readInt32(); //magic "ATTR"

		attrMaps[i].name = stream.readString();
    
		var precision = stream.readFloat32();
    
		stream.readInt32(); //packed size

		var interleaved = new CTM.InterleavedStream(attrMaps[i].attr, 4);
		LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
    
		CTM.restoreMap(attrMaps[i].attr, 4, precision);
	}
};

CTM.restoreIndices = function(indices, len) {
	var i = 3;
	if (len > 0) {
		indices[2] += indices[0];
		indices[1] += indices[0];
	}
	for (; i < len; i += 3) {
		indices[i] += indices[i - 3];
    
		if (indices[i] === indices[i - 3]) {
			indices[i + 1] += indices[i - 2];
		}else {
			indices[i + 1] += indices[i];
		}

		indices[i + 2] += indices[i];
	}
};

CTM.restoreGridIndices = function(gridIndices, len) {
	var i = 1;
	for (; i < len; ++ i) {
		gridIndices[i] += gridIndices[i - 1];
	}
};

CTM.restoreVertices = function(vertices, grid, gridIndices, precision) {
	var gridIdx, delta, x, y, z,
      intVertices = new Uint32Array(vertices.buffer, vertices.byteOffset, vertices.length),
      ydiv = grid.divx, zdiv = ydiv * grid.divy,
      prevGridIdx = 0x7fffffff, prevDelta = 0,
      i = 0, j = 0, len = gridIndices.length;

	for (; i < len; j += 3) {
		x = gridIdx = gridIndices[i ++];
    
		z = ~~(x / zdiv);
		x -= ~~(z * zdiv);
		y = ~~(x / ydiv);
		x -= ~~(y * ydiv);

		delta = intVertices[j];
		if (gridIdx === prevGridIdx) {
			delta += prevDelta;
		}

		vertices[j]     = grid.lowerBoundx +
      x * grid.sizex + precision * delta;
		vertices[j + 1] = grid.lowerBoundy +
      y * grid.sizey + precision * intVertices[j + 1];
		vertices[j + 2] = grid.lowerBoundz +
      z * grid.sizez + precision * intVertices[j + 2];

		prevGridIdx = gridIdx;
		prevDelta = delta;
	}
};

CTM.restoreNormals = function(normals, smooth, precision) {
	var ro, phi, theta, sinPhi,
      nx, ny, nz, by, bz, len,
      intNormals = new Uint32Array(normals.buffer, normals.byteOffset, normals.length),
      i = 0, k = normals.length,
      PI_DIV_2 = 3.141592653589793238462643 * 0.5;

	for (; i < k; i += 3) {
		ro = intNormals[i] * precision;
		phi = intNormals[i + 1];

		if (phi === 0) {
			normals[i]     = smooth[i]     * ro;
			normals[i + 1] = smooth[i + 1] * ro;
			normals[i + 2] = smooth[i + 2] * ro;
		}else {
      
			if (phi <= 4) {
				theta = (intNormals[i + 2] - 2) * PI_DIV_2;
			}else {
				theta = ( (intNormals[i + 2] * 4 / phi) - 2) * PI_DIV_2;
			}
      
			phi *= precision * PI_DIV_2;
			sinPhi = ro * Math.sin(phi);

			nx = sinPhi * Math.cos(theta);
			ny = sinPhi * Math.sin(theta);
			nz = ro * Math.cos(phi);

			bz = smooth[i + 1];
			by = smooth[i] - smooth[i + 2];

			len = Math.sqrt(2 * bz * bz + by * by);
			if (len > 1e-20) {
				by /= len;
				bz /= len;
			}

			normals[i]     = smooth[i]     * nz +
        (smooth[i + 1] * bz - smooth[i + 2] * by) * ny - bz * nx;
			normals[i + 1] = smooth[i + 1] * nz -
        (smooth[i + 2]      + smooth[i]   ) * bz  * ny + by * nx;
			normals[i + 2] = smooth[i + 2] * nz +
        (smooth[i]     * by + smooth[i + 1] * bz) * ny + bz * nx;
		}
	}
};

CTM.restoreMap = function(map, count, precision) {
	var delta, value,
      intMap = new Uint32Array(map.buffer, map.byteOffset, map.length),
      i = 0, j, len = map.length;

	for (; i < count; ++ i) {
		delta = 0;

		for (j = i; j < len; j += count) {
			value = intMap[j];
      
			delta += value & 1 ? -( (value + 1) >> 1) : value >> 1;
      
			map[j] = delta * precision;
		}
	}
};

CTM.calcSmoothNormals = function(indices, vertices) {
	var smooth = new Float32Array(vertices.length),
      indx, indy, indz, nx, ny, nz,
      v1x, v1y, v1z, v2x, v2y, v2z, len,
      i, k;

	for (i = 0, k = indices.length; i < k;) {
		indx = indices[i ++] * 3;
		indy = indices[i ++] * 3;
		indz = indices[i ++] * 3;

		v1x = vertices[indy]     - vertices[indx];
		v2x = vertices[indz]     - vertices[indx];
		v1y = vertices[indy + 1] - vertices[indx + 1];
		v2y = vertices[indz + 1] - vertices[indx + 1];
		v1z = vertices[indy + 2] - vertices[indx + 2];
		v2z = vertices[indz + 2] - vertices[indx + 2];
    
		nx = v1y * v2z - v1z * v2y;
		ny = v1z * v2x - v1x * v2z;
		nz = v1x * v2y - v1y * v2x;
    
		len = Math.sqrt(nx * nx + ny * ny + nz * nz);
		if (len > 1e-10) {
			nx /= len;
			ny /= len;
			nz /= len;
		}
    
		smooth[indx]     += nx;
		smooth[indx + 1] += ny;
		smooth[indx + 2] += nz;
		smooth[indy]     += nx;
		smooth[indy + 1] += ny;
		smooth[indy + 2] += nz;
		smooth[indz]     += nx;
		smooth[indz + 1] += ny;
		smooth[indz + 2] += nz;
	}

	for (i = 0, k = smooth.length; i < k; i += 3) {
		len = Math.sqrt(smooth[i] * smooth[i] + 
      smooth[i + 1] * smooth[i + 1] +
      smooth[i + 2] * smooth[i + 2]);

		if (len > 1e-10) {
			smooth[i]     /= len;
			smooth[i + 1] /= len;
			smooth[i + 2] /= len;
		}
	}

	return smooth;
};

CTM.isLittleEndian = (function() {
	var buffer = new ArrayBuffer(2),
      bytes = new Uint8Array(buffer),
      ints = new Uint16Array(buffer);

	bytes[0] = 1;

	return ints[0] === 1;
}());

CTM.InterleavedStream = function(data, count) {
	this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
	this.offset = CTM.isLittleEndian ? 3 : 0;
	this.count = count * 4;
	this.len = this.data.length;
};

CTM.InterleavedStream.prototype.writeByte = function(value) {
	this.data[this.offset] = value;
  
	this.offset += this.count;
	if (this.offset >= this.len) {
  
		this.offset -= this.len - 4;
		if (this.offset >= this.count) {
    
			this.offset -= this.count + (CTM.isLittleEndian ? 1 : -1);
		}
	}
};

CTM.Stream = function(data) {
	this.data = data;
	this.offset = 0;
};

CTM.Stream.prototype.TWO_POW_MINUS23 = Math.pow(2, -23);

CTM.Stream.prototype.TWO_POW_MINUS126 = Math.pow(2, -126);

CTM.Stream.prototype.readByte = function() {
	return this.data[this.offset ++] & 0xff;
};

CTM.Stream.prototype.readInt32 = function() {
	var i = this.readByte();
	i |= this.readByte() << 8;
	i |= this.readByte() << 16;
	return i | (this.readByte() << 24);
};

CTM.Stream.prototype.readFloat32 = function() {
	var m = this.readByte();
	m += this.readByte() << 8;

	var b1 = this.readByte();
	var b2 = this.readByte();

	m += (b1 & 0x7f) << 16; 
	var e = ( (b2 & 0x7f) << 1) | ( (b1 & 0x80) >>> 7);
	var s = b2 & 0x80 ? -1 : 1;

	if (e === 255) {
		return m !== 0 ? NaN : s * Infinity;
	}
	if (e > 0) {
		return s * (1 + (m * this.TWO_POW_MINUS23) ) * Math.pow(2, e - 127);
	}
	if (m !== 0) {
		return s * m * this.TWO_POW_MINUS126;
	}
	return s * 0;
};

CTM.Stream.prototype.readString = function() {
	var len = this.readInt32();

	this.offset += len;

	return String.fromCharCode.apply(null, this.data.subarray(this.offset - len, this.offset));
};

CTM.Stream.prototype.readArrayInt32 = function(array) {
	var i = 0, len = array.length;
  
	while (i < len) {
		array[i ++] = this.readInt32();
	}

	return array;
};

CTM.Stream.prototype.readArrayFloat32 = function(array) {
	var i = 0, len = array.length;

	while (i < len) {
		array[i ++] = this.readFloat32();
	}

	return array;
};

// File:examples/js/loaders/ctm/CTMLoader.js

/**
 * Loader for CTM encoded models generated by OpenCTM tools:
 *	http://openctm.sourceforge.net/
 *
 * Uses js-openctm library by Juan Mellado
 *	http://code.google.com/p/js-openctm/
 *
 * @author alteredq / http://alteredqualia.com/
 */

THREE.CTMLoader = function () {

	THREE.Loader.call( this );

	// Deprecated
	
	Object.defineProperties( this, {
		statusDomElement: {
			get: function () {

				if ( this._statusDomElement === undefined ) {

					this._statusDomElement = document.createElement( 'div' );

				}

				console.warn( 'THREE.BinaryLoader: .statusDomElement has been removed.' );
				return this._statusDomElement;

			}
		},
	} );

};

THREE.CTMLoader.prototype = Object.create( THREE.Loader.prototype );
THREE.CTMLoader.prototype.constructor = THREE.CTMLoader;

// Load multiple CTM parts defined in JSON

THREE.CTMLoader.prototype.loadParts = function( url, callback, parameters ) {

	parameters = parameters || {};

	var scope = this;

	var xhr = new XMLHttpRequest();

	var basePath = parameters.basePath ? parameters.basePath : this.extractUrlBase( url );

	xhr.onreadystatechange = function() {

		if ( xhr.readyState === 4 ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				var jsonObject = JSON.parse( xhr.responseText );

				var materials = [], geometries = [], counter = 0;

				function callbackFinal( geometry ) {

					counter += 1;

					geometries.push( geometry );

					if ( counter === jsonObject.offsets.length ) {

						callback( geometries, materials );

					}

				}


				// init materials

				for ( var i = 0; i < jsonObject.materials.length; i ++ ) {

					materials[ i ] = scope.createMaterial( jsonObject.materials[ i ], basePath );

				}

				// load joined CTM file

				var partUrl = basePath + jsonObject.data;
				var parametersPart = { useWorker: parameters.useWorker, offsets: jsonObject.offsets };
				scope.load( partUrl, callbackFinal, parametersPart );

			}

		}

	};

	xhr.open( "GET", url, true );
	xhr.setRequestHeader( "Content-Type", "text/plain" );
	xhr.send( null );

};

// Load CTMLoader compressed models
//	- parameters
//		- url (required)
//		- callback (required)

THREE.CTMLoader.prototype.load = function( url, callback, parameters ) {

	parameters = parameters || {};

	var scope = this;

	var offsets = parameters.offsets !== undefined ? parameters.offsets : [ 0 ];

	var xhr = new XMLHttpRequest(),
		callbackProgress = null;

	var length = 0;

	xhr.onreadystatechange = function() {

		if ( xhr.readyState === 4 ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				var binaryData = new Uint8Array(xhr.response);

				var s = Date.now();

				if ( parameters.useWorker ) {

					var worker = parameters.worker || new Worker( "js/loaders/ctm/CTMWorker.js" );

					worker.onmessage = function( event ) {

						var files = event.data;

						for ( var i = 0; i < files.length; i ++ ) {

							var ctmFile = files[ i ];

							var e1 = Date.now();
							// console.log( "CTM data parse time [worker]: " + (e1-s) + " ms" );

							scope.createModel( ctmFile, callback );

							var e = Date.now();
							console.log( "model load time [worker]: " + (e - e1) + " ms, total: " + (e - s));

						}


					};

					worker.postMessage( { "data": binaryData, "offsets": offsets } );

				} else {

					for ( var i = 0; i < offsets.length; i ++ ) {

						var stream = new CTM.Stream( binaryData );
						stream.offset = offsets[ i ];

						var ctmFile = new CTM.File( stream );

						scope.createModel( ctmFile, callback );

					}

					//var e = Date.now();
					//console.log( "CTM data parse time [inline]: " + (e-s) + " ms" );

				}

			} else {

				console.error( "Couldn't load [" + url + "] [" + xhr.status + "]" );

			}

		} else if ( xhr.readyState === 3 ) {

			if ( callbackProgress ) {

				if ( length === 0 ) {

					length = xhr.getResponseHeader( "Content-Length" );

				}

				callbackProgress( { total: length, loaded: xhr.responseText.length } );

			}

		} else if ( xhr.readyState === 2 ) {

			length = xhr.getResponseHeader( "Content-Length" );

		}

	};

	xhr.open( "GET", url, true );
	xhr.responseType = "arraybuffer";

	xhr.send( null );

};


THREE.CTMLoader.prototype.createModel = function ( file, callback ) {

	var Model = function () {

		THREE.BufferGeometry.call( this );

		this.materials = [];

		var indices = file.body.indices,
		positions = file.body.vertices,
		normals = file.body.normals;

		var uvs, colors;

		var uvMaps = file.body.uvMaps;

		if ( uvMaps !== undefined && uvMaps.length > 0 ) {

			uvs = uvMaps[ 0 ].uv;

		}

		var attrMaps = file.body.attrMaps;

		if ( attrMaps !== undefined && attrMaps.length > 0 && attrMaps[ 0 ].name === 'Color' ) {

			colors = attrMaps[ 0 ].attr;

		}

		this.setIndex( new THREE.BufferAttribute( indices, 1 ) );
		this.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		if ( normals !== undefined ) {

			this.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

		}

		if ( uvs !== undefined ) {

			this.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

		}

		if ( colors !== undefined ) {

			this.addAttribute( 'color', new THREE.BufferAttribute( colors, 4 ) );

		}

	};

	Model.prototype = Object.create( THREE.BufferGeometry.prototype );
	Model.prototype.constructor = Model;

	var geometry = new Model();

	// compute vertex normals if not present in the CTM model
	if ( geometry.attributes.normal === undefined ) {
		geometry.computeVertexNormals();
	}

	callback( geometry );

};

// File:examples/js/exporters/OBJExporter.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJExporter = function () {};

THREE.OBJExporter.prototype = {

	constructor: THREE.OBJExporter,

	parse: function ( object ) {

		var output = '';

		var indexVertex = 0;
		var indexVertexUvs = 0;
		var indexNormals = 0;

		var parseMesh = function ( mesh ) {

			var nbVertex = 0;
			var nbVertexUvs = 0;
			var nbNormals = 0;

			var geometry = mesh.geometry;

			if ( geometry instanceof THREE.Geometry ) {

				output += 'o ' + mesh.name + '\n';

				var vertices = geometry.vertices;

				for ( var i = 0, l = vertices.length; i < l; i ++ ) {

					var vertex = vertices[ i ].clone();
					vertex.applyMatrix4( mesh.matrixWorld );

					output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

					nbVertex ++;

				}

				// uvs

				var faces = geometry.faces;
				var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
				var hasVertexUvs = faces.length === faceVertexUvs.length;

				if ( hasVertexUvs ) {

					for ( var i = 0, l = faceVertexUvs.length; i < l; i ++ ) {

						var vertexUvs = faceVertexUvs[ i ];

						for ( var j = 0, jl = vertexUvs.length; j < jl; j ++ ) {

							var uv = vertexUvs[ j ];

							output += 'vt ' + uv.x + ' ' + uv.y + '\n';

							nbVertexUvs ++;

						}

					}

				}

				// normals

				var normalMatrixWorld = new THREE.Matrix3();
				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

				for ( var i = 0, l = faces.length; i < l; i ++ ) {

					var face = faces[ i ];
					var vertexNormals = face.vertexNormals;

					if ( vertexNormals.length === 3 ) {

						for ( var j = 0, jl = vertexNormals.length; j < jl; j ++ ) {

							var normal = vertexNormals[ j ].clone();
							normal.applyMatrix3( normalMatrixWorld );

							output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

							nbNormals ++;

						}

					} else {

						var normal = face.normal.clone();
						normal.applyMatrix3( normalMatrixWorld );

						for ( var j = 0; j < 3; j ++ ) {

							output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

							nbNormals ++;

						}

					}

				}

				// faces


				for ( var i = 0, j = 1, l = faces.length; i < l; i ++, j += 3 ) {

					var face = faces[ i ];

					output += 'f ';
					output += ( indexVertex + face.a + 1 ) + '/' + ( hasVertexUvs ? ( indexVertexUvs + j     ) : '' ) + '/' + ( indexNormals + j     ) + ' ';
					output += ( indexVertex + face.b + 1 ) + '/' + ( hasVertexUvs ? ( indexVertexUvs + j + 1 ) : '' ) + '/' + ( indexNormals + j + 1 ) + ' ';
					output += ( indexVertex + face.c + 1 ) + '/' + ( hasVertexUvs ? ( indexVertexUvs + j + 2 ) : '' ) + '/' + ( indexNormals + j + 2 ) + '\n';

				}

			} else {

				console.warn( 'THREE.OBJExporter.parseMesh(): geometry type unsupported', mesh );
				// TODO: Support only BufferGeometry and use use setFromObject()

			}

			// update index
			indexVertex += nbVertex;
			indexVertexUvs += nbVertexUvs;
			indexNormals += nbNormals;

		};

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) parseMesh( child );

		} );

		return output;

	}

};

// File:examples/js/exporters/STLExporter.js

/**
 * @author kovacsv / http://kovacsv.hu/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.STLExporter = function () {};

THREE.STLExporter.prototype = {

	constructor: THREE.STLExporter,

	parse: ( function () {

		var vector = new THREE.Vector3();
		var normalMatrixWorld = new THREE.Matrix3();

		return function parse( scene ) {

			var output = '';

			output += 'solid exported\n';

			scene.traverse( function ( object ) {

				if ( object instanceof THREE.Mesh ) {

					var geometry = object.geometry;
					var matrixWorld = object.matrixWorld;

					if ( geometry instanceof THREE.Geometry ) {

						var vertices = geometry.vertices;
						var faces = geometry.faces;

						normalMatrixWorld.getNormalMatrix( matrixWorld );

						for ( var i = 0, l = faces.length; i < l; i ++ ) {

							var face = faces[ i ];

							vector.copy( face.normal ).applyMatrix3( normalMatrixWorld ).normalize();

							output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
							output += '\t\touter loop\n';

							var indices = [ face.a, face.b, face.c ];

							for ( var j = 0; j < 3; j ++ ) {

								vector.copy( vertices[ indices[ j ] ] ).applyMatrix4( matrixWorld );

								output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';

							}

							output += '\t\tendloop\n';
							output += '\tendfacet\n';

						}

					}

				}

			} );

			output += 'endsolid exported\n';

			return output;

		};

	}() )

};

// File:examples/js/loaders/deprecated/SceneLoader.js

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneLoader = function ( manager ) {

	this.onLoadStart = function () {};
	this.onLoadProgress = function() {};
	this.onLoadComplete = function () {};

	this.callbackSync = function () {};
	this.callbackProgress = function () {};

	this.geometryHandlers = {};
	this.hierarchyHandlers = {};

	this.addGeometryHandler( "ascii", THREE.JSONLoader );

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.SceneLoader.prototype = {

	constructor: THREE.SceneLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			scope.parse( JSON.parse( text ), onLoad, url );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	addGeometryHandler: function ( typeID, loaderClass ) {

		this.geometryHandlers[ typeID ] = { "loaderClass": loaderClass };

	},

	addHierarchyHandler: function ( typeID, loaderClass ) {

		this.hierarchyHandlers[ typeID ] = { "loaderClass": loaderClass };

	},

	parse: function ( json, callbackFinished, url ) {

		var scope = this;

		var urlBase = THREE.Loader.prototype.extractUrlBase( url );

		var geometry, material, camera, fog,
			texture, images, color,
			light, hex, intensity,
			counter_models, counter_textures,
			total_models, total_textures,
			result;

		var target_array = [];

		var data = json;

		// async geometry loaders

		for ( var typeID in this.geometryHandlers ) {

			var loaderClass = this.geometryHandlers[ typeID ][ "loaderClass" ];
			this.geometryHandlers[ typeID ][ "loaderObject" ] = new loaderClass();

		}

		// async hierachy loaders

		for ( var typeID in this.hierarchyHandlers ) {

			var loaderClass = this.hierarchyHandlers[ typeID ][ "loaderClass" ];
			this.hierarchyHandlers[ typeID ][ "loaderObject" ] = new loaderClass();

		}

		counter_models = 0;
		counter_textures = 0;

		result = {

			scene: new THREE.Scene(),
			geometries: {},
			face_materials: {},
			materials: {},
			textures: {},
			objects: {},
			cameras: {},
			lights: {},
			fogs: {},
			empties: {},
			groups: {}

		};

		if ( data.transform ) {

			var position = data.transform.position,
				rotation = data.transform.rotation,
				scale = data.transform.scale;

			if ( position ) {

				result.scene.position.fromArray( position );

			}

			if ( rotation ) {

				result.scene.rotation.fromArray( rotation );

			}

			if ( scale ) {

				result.scene.scale.fromArray( scale );

			}

			if ( position || rotation || scale ) {

				result.scene.updateMatrix();
				result.scene.updateMatrixWorld();

			}

		}

		function get_url( source_url, url_type ) {

			if ( url_type == "relativeToHTML" ) {

				return source_url;

			} else {

				return urlBase + source_url;

			}

		}

		// toplevel loader function, delegates to handle_children

		function handle_objects() {

			handle_children( result.scene, data.objects );

		}

		// handle all the children from the loaded json and attach them to given parent

		function handle_children( parent, children ) {

			var mat, dst, pos, rot, scl, quat;

			for ( var objID in children ) {

				// check by id if child has already been handled,
				// if not, create new object

				var object = result.objects[ objID ];
				var objJSON = children[ objID ];

				if ( object === undefined ) {

					// meshes

					if ( objJSON.type && ( objJSON.type in scope.hierarchyHandlers ) ) {

						if ( objJSON.loading === undefined ) {

							material = result.materials[ objJSON.material ];

							objJSON.loading = true;

							var loader = scope.hierarchyHandlers[ objJSON.type ][ "loaderObject" ];

							// ColladaLoader

							if ( loader.options ) {

								loader.load( get_url( objJSON.url, data.urlBaseType ), create_callback_hierachy( objID, parent, material, objJSON ) );

							// UTF8Loader
							// OBJLoader

							} else {

								loader.load( get_url( objJSON.url, data.urlBaseType ), create_callback_hierachy( objID, parent, material, objJSON ) );

							}

						}

					} else if ( objJSON.geometry !== undefined ) {

						geometry = result.geometries[ objJSON.geometry ];

						// geometry already loaded

						if ( geometry ) {

							material = result.materials[ objJSON.material ];

							pos = objJSON.position;
							rot = objJSON.rotation;
							scl = objJSON.scale;
							mat = objJSON.matrix;
							quat = objJSON.quaternion;

							// use materials from the model file
							// if there is no material specified in the object

							if ( ! objJSON.material ) {

								material = new THREE.MeshFaceMaterial( result.face_materials[ objJSON.geometry ] );

							}

							// use materials from the model file
							// if there is just empty face material
							// (must create new material as each model has its own face material)

							if ( ( material instanceof THREE.MeshFaceMaterial ) && material.materials.length === 0 ) {

								material = new THREE.MeshFaceMaterial( result.face_materials[ objJSON.geometry ] );

							}

							if ( objJSON.skin ) {

								object = new THREE.SkinnedMesh( geometry, material );

							} else if ( objJSON.morph ) {

								object = new THREE.MorphAnimMesh( geometry, material );

								if ( objJSON.duration !== undefined ) {

									object.duration = objJSON.duration;

								}

								if ( objJSON.time !== undefined ) {

									object.time = objJSON.time;

								}

								if ( objJSON.mirroredLoop !== undefined ) {

									object.mirroredLoop = objJSON.mirroredLoop;

								}

								if ( material.morphNormals ) {

									geometry.computeMorphNormals();

								}

							} else {

								object = new THREE.Mesh( geometry, material );

							}

							object.name = objID;

							if ( mat ) {

								object.matrixAutoUpdate = false;
								object.matrix.set(
									mat[ 0 ],  mat[ 1 ],  mat[ 2 ],  mat[ 3 ],
									mat[ 4 ],  mat[ 5 ],  mat[ 6 ],  mat[ 7 ],
									mat[ 8 ],  mat[ 9 ],  mat[ 10 ], mat[ 11 ],
									mat[ 12 ], mat[ 13 ], mat[ 14 ], mat[ 15 ]
								);

							} else {

								object.position.fromArray( pos );

								if ( quat ) {

									object.quaternion.fromArray( quat );

								} else {

									object.rotation.fromArray( rot );

								}

								object.scale.fromArray( scl );

							}

							object.visible = objJSON.visible;
							object.castShadow = objJSON.castShadow;
							object.receiveShadow = objJSON.receiveShadow;

							parent.add( object );

							result.objects[ objID ] = object;

						}

					// lights

					} else if ( objJSON.type === "AmbientLight" || objJSON.type === "PointLight" ||
						objJSON.type === "DirectionalLight" || objJSON.type === "SpotLight" ||
						objJSON.type === "HemisphereLight" ) {

						var color = objJSON.color;
						var intensity = objJSON.intensity;
						var distance = objJSON.distance;
						var position = objJSON.position;
						var rotation = objJSON.rotation;

						switch ( objJSON.type ) {

							case 'AmbientLight':
								light = new THREE.AmbientLight( color );
								break;

							case 'PointLight':
								light = new THREE.PointLight( color, intensity, distance );
								light.position.fromArray( position );
								break;

							case 'DirectionalLight':
								light = new THREE.DirectionalLight( color, intensity );
								light.position.fromArray( objJSON.direction );
								break;

							case 'SpotLight':
								light = new THREE.SpotLight( color, intensity, distance, 1 );
								light.angle = objJSON.angle;
								light.position.fromArray( position );
								light.target.set( position[ 0 ], position[ 1 ] - distance, position[ 2 ] );
								light.target.applyEuler( new THREE.Euler( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ], 'XYZ' ) );
								break;

							case 'HemisphereLight':
								light = new THREE.DirectionalLight( color, intensity, distance );
								light.target.set( position[ 0 ], position[ 1 ] - distance, position[ 2 ] );
								light.target.applyEuler( new THREE.Euler( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ], 'XYZ' ) );
								break;

						}

						parent.add( light );

						light.name = objID;
						result.lights[ objID ] = light;
						result.objects[ objID ] = light;

					// cameras

					} else if ( objJSON.type === "PerspectiveCamera" || objJSON.type === "OrthographicCamera" ) {

						pos = objJSON.position;
						rot = objJSON.rotation;
						quat = objJSON.quaternion;

						if ( objJSON.type === "PerspectiveCamera" ) {

							camera = new THREE.PerspectiveCamera( objJSON.fov, objJSON.aspect, objJSON.near, objJSON.far );

						} else if ( objJSON.type === "OrthographicCamera" ) {

							camera = new THREE.OrthographicCamera( objJSON.left, objJSON.right, objJSON.top, objJSON.bottom, objJSON.near, objJSON.far );

						}

						camera.name = objID;
						camera.position.fromArray( pos );

						if ( quat !== undefined ) {

							camera.quaternion.fromArray( quat );

						} else if ( rot !== undefined ) {

							camera.rotation.fromArray( rot );

						} else if ( objJSON.target ) {

							camera.lookAt( new THREE.Vector3().fromArray( objJSON.target ) );

						}

						parent.add( camera );

						result.cameras[ objID ] = camera;
						result.objects[ objID ] = camera;

					// pure Object3D

					} else {

						pos = objJSON.position;
						rot = objJSON.rotation;
						scl = objJSON.scale;
						quat = objJSON.quaternion;

						object = new THREE.Object3D();
						object.name = objID;
						object.position.fromArray( pos );

						if ( quat ) {

							object.quaternion.fromArray( quat );

						} else {

							object.rotation.fromArray( rot );

						}

						object.scale.fromArray( scl );
						object.visible = ( objJSON.visible !== undefined ) ? objJSON.visible : false;

						parent.add( object );

						result.objects[ objID ] = object;
						result.empties[ objID ] = object;

					}

					if ( object ) {

						if ( objJSON.userData !== undefined ) {

							for ( var key in objJSON.userData ) {

								var value = objJSON.userData[ key ];
								object.userData[ key ] = value;

							}

						}

						if ( objJSON.groups !== undefined ) {

							for ( var i = 0; i < objJSON.groups.length; i ++ ) {

								var groupID = objJSON.groups[ i ];

								if ( result.groups[ groupID ] === undefined ) {

									result.groups[ groupID ] = [];

								}

								result.groups[ groupID ].push( objID );

							}

						}

					}

				}

				if ( object !== undefined && objJSON.children !== undefined ) {

					handle_children( object, objJSON.children );

				}

			}

		}

		function handle_mesh( geo, mat, id ) {

			result.geometries[ id ] = geo;
			result.face_materials[ id ] = mat;
			handle_objects();

		}

		function handle_hierarchy( node, id, parent, material, obj ) {

			var p = obj.position;
			var r = obj.rotation;
			var q = obj.quaternion;
			var s = obj.scale;

			node.position.fromArray( p );

			if ( q ) {

				node.quaternion.fromArray( q );

			} else {

				node.rotation.fromArray( r );

			}

			node.scale.fromArray( s );

			// override children materials
			// if object material was specified in JSON explicitly

			if ( material ) {

				node.traverse( function ( child ) {

					child.material = material;

				} );

			}

			// override children visibility
			// with root node visibility as specified in JSON

			var visible = ( obj.visible !== undefined ) ? obj.visible : true;

			node.traverse( function ( child ) {

				child.visible = visible;

			} );

			parent.add( node );

			node.name = id;

			result.objects[ id ] = node;
			handle_objects();

		}

		function create_callback_geometry( id ) {

			return function ( geo, mat ) {

				geo.name = id;

				handle_mesh( geo, mat, id );

				counter_models -= 1;

				scope.onLoadComplete();

				async_callback_gate();

			}

		}

		function create_callback_hierachy( id, parent, material, obj ) {

			return function ( event ) {

				var result;

				// loaders which use EventDispatcher

				if ( event.content ) {

					result = event.content;

				// ColladaLoader

				} else if ( event.dae ) {

					result = event.scene;


				// UTF8Loader

				} else {

					result = event;

				}

				handle_hierarchy( result, id, parent, material, obj );

				counter_models -= 1;

				scope.onLoadComplete();

				async_callback_gate();

			}

		}

		function create_callback_embed( id ) {

			return function ( geo, mat ) {

				geo.name = id;

				result.geometries[ id ] = geo;
				result.face_materials[ id ] = mat;

			}

		}

		function async_callback_gate() {

			var progress = {

				totalModels : total_models,
				totalTextures : total_textures,
				loadedModels : total_models - counter_models,
				loadedTextures : total_textures - counter_textures

			};

			scope.callbackProgress( progress, result );

			scope.onLoadProgress();

			if ( counter_models === 0 && counter_textures === 0 ) {

				finalize();
				callbackFinished( result );

			}

		}

		function finalize() {

			// take care of targets which could be asynchronously loaded objects

			for ( var i = 0; i < target_array.length; i ++ ) {

				var ta = target_array[ i ];

				var target = result.objects[ ta.targetName ];

				if ( target ) {

					ta.object.target = target;

				} else {

					// if there was error and target of specified name doesn't exist in the scene file
					// create instead dummy target
					// (target must be added to scene explicitly as parent is already added)

					ta.object.target = new THREE.Object3D();
					result.scene.add( ta.object.target );

				}

				ta.object.target.userData.targetInverse = ta.object;

			}

		}

		var callbackTexture = function ( count ) {

			counter_textures -= count;
			async_callback_gate();

			scope.onLoadComplete();

		};

		// must use this instead of just directly calling callbackTexture
		// because of closure in the calling context loop

		var generateTextureCallback = function ( count ) {

			return function () {

				callbackTexture( count );

			};

		};

		function traverse_json_hierarchy( objJSON, callback ) {

			callback( objJSON );

			if ( objJSON.children !== undefined ) {

				for ( var objChildID in objJSON.children ) {

					traverse_json_hierarchy( objJSON.children[ objChildID ], callback );

				}

			}

		}

		// first go synchronous elements

		// fogs

		var fogID, fogJSON;

		for ( fogID in data.fogs ) {

			fogJSON = data.fogs[ fogID ];

			if ( fogJSON.type === "linear" ) {

				fog = new THREE.Fog( 0x000000, fogJSON.near, fogJSON.far );

			} else if ( fogJSON.type === "exp2" ) {

				fog = new THREE.FogExp2( 0x000000, fogJSON.density );

			}

			color = fogJSON.color;
			fog.color.setRGB( color[ 0 ], color[ 1 ], color[ 2 ] );

			result.fogs[ fogID ] = fog;

		}

		// now come potentially asynchronous elements

		// geometries

		// count how many geometries will be loaded asynchronously

		var geoID, geoJSON;

		for ( geoID in data.geometries ) {

			geoJSON = data.geometries[ geoID ];

			if ( geoJSON.type in this.geometryHandlers ) {

				counter_models += 1;

				scope.onLoadStart();

			}

		}

		// count how many hierarchies will be loaded asynchronously

		for ( var objID in data.objects ) {

			traverse_json_hierarchy( data.objects[ objID ], function ( objJSON ) {

				if ( objJSON.type && ( objJSON.type in scope.hierarchyHandlers ) ) {

					counter_models += 1;

					scope.onLoadStart();

				}

			} );

		}

		total_models = counter_models;

		for ( geoID in data.geometries ) {

			geoJSON = data.geometries[ geoID ];

			if ( geoJSON.type === "cube" ) {

				geometry = new THREE.BoxGeometry( geoJSON.width, geoJSON.height, geoJSON.depth, geoJSON.widthSegments, geoJSON.heightSegments, geoJSON.depthSegments );
				geometry.name = geoID;
				result.geometries[ geoID ] = geometry;

			} else if ( geoJSON.type === "plane" ) {

				geometry = new THREE.PlaneGeometry( geoJSON.width, geoJSON.height, geoJSON.widthSegments, geoJSON.heightSegments );
				geometry.name = geoID;
				result.geometries[ geoID ] = geometry;

			} else if ( geoJSON.type === "sphere" ) {

				geometry = new THREE.SphereGeometry( geoJSON.radius, geoJSON.widthSegments, geoJSON.heightSegments );
				geometry.name = geoID;
				result.geometries[ geoID ] = geometry;

			} else if ( geoJSON.type === "cylinder" ) {

				geometry = new THREE.CylinderGeometry( geoJSON.topRad, geoJSON.botRad, geoJSON.height, geoJSON.radSegs, geoJSON.heightSegs );
				geometry.name = geoID;
				result.geometries[ geoID ] = geometry;

			} else if ( geoJSON.type === "torus" ) {

				geometry = new THREE.TorusGeometry( geoJSON.radius, geoJSON.tube, geoJSON.segmentsR, geoJSON.segmentsT );
				geometry.name = geoID;
				result.geometries[ geoID ] = geometry;

			} else if ( geoJSON.type === "icosahedron" ) {

				geometry = new THREE.IcosahedronGeometry( geoJSON.radius, geoJSON.subdivisions );
				geometry.name = geoID;
				result.geometries[ geoID ] = geometry;

			} else if ( geoJSON.type in this.geometryHandlers ) {

				var loader = this.geometryHandlers[ geoJSON.type ][ "loaderObject" ];
				loader.load( get_url( geoJSON.url, data.urlBaseType ), create_callback_geometry( geoID ) );

			} else if ( geoJSON.type === "embedded" ) {

				var modelJson = data.embeds[ geoJSON.id ],
					texture_path = "";

				// pass metadata along to jsonLoader so it knows the format version

				modelJson.metadata = data.metadata;

				if ( modelJson ) {

					var jsonLoader = this.geometryHandlers[ "ascii" ][ "loaderObject" ];
					var model = jsonLoader.parse( modelJson, texture_path );
					create_callback_embed( geoID )( model.geometry, model.materials );

				}

			}

		}

		// textures

		// count how many textures will be loaded asynchronously

		var textureID, textureJSON;

		for ( textureID in data.textures ) {

			textureJSON = data.textures[ textureID ];

			if ( Array.isArray( textureJSON.url ) ) {

				counter_textures += textureJSON.url.length;

				for ( var n = 0; n < textureJSON.url.length; n ++ ) {

					scope.onLoadStart();

				}

			} else {

				counter_textures += 1;

				scope.onLoadStart();

			}

		}

		total_textures = counter_textures;

		for ( textureID in data.textures ) {

			textureJSON = data.textures[ textureID ];

			if ( textureJSON.mapping !== undefined && THREE[ textureJSON.mapping ] !== undefined ) {

				textureJSON.mapping = THREE[ textureJSON.mapping ];

			}

			var texture;

			if ( Array.isArray( textureJSON.url ) ) {

				var count = textureJSON.url.length;
				var url_array = [];

				for ( var i = 0; i < count; i ++ ) {

					url_array[ i ] = get_url( textureJSON.url[ i ], data.urlBaseType );

				}

				var loader = THREE.Loader.Handlers.get( url_array[ 0 ] );

				if ( loader !== null ) {

					texture = loader.load( url_array, generateTextureCallback( count ) );

					if ( textureJSON.mapping !== undefined )
						texture.mapping = textureJSON.mapping;

				} else {

					texture = THREE.ImageUtils.loadTextureCube( url_array, textureJSON.mapping, generateTextureCallback( count ) );

				}

			} else {

				var fullUrl = get_url( textureJSON.url, data.urlBaseType );
				var textureCallback = generateTextureCallback( 1 );

				var loader = THREE.Loader.Handlers.get( fullUrl );

				if ( loader !== null ) {

					texture = loader.load( fullUrl, textureCallback );

				} else {

					texture = new THREE.Texture();
					loader = new THREE.ImageLoader();

					( function ( texture ) {

						loader.load( fullUrl, function ( image ) {

							texture.image = image;
							texture.needsUpdate = true;

							textureCallback();

						} );

					} )( texture )


				}

				if ( textureJSON.mapping !== undefined )
					texture.mapping = textureJSON.mapping;

				if ( THREE[ textureJSON.minFilter ] !== undefined )
					texture.minFilter = THREE[ textureJSON.minFilter ];

				if ( THREE[ textureJSON.magFilter ] !== undefined )
					texture.magFilter = THREE[ textureJSON.magFilter ];

				if ( textureJSON.anisotropy ) texture.anisotropy = textureJSON.anisotropy;

				if ( textureJSON.repeat ) {

					texture.repeat.set( textureJSON.repeat[ 0 ], textureJSON.repeat[ 1 ] );

					if ( textureJSON.repeat[ 0 ] !== 1 ) texture.wrapS = THREE.RepeatWrapping;
					if ( textureJSON.repeat[ 1 ] !== 1 ) texture.wrapT = THREE.RepeatWrapping;

				}

				if ( textureJSON.offset ) {

					texture.offset.set( textureJSON.offset[ 0 ], textureJSON.offset[ 1 ] );

				}

				// handle wrap after repeat so that default repeat can be overriden

				if ( textureJSON.wrap ) {

					var wrapMap = {
						"repeat": THREE.RepeatWrapping,
						"mirror": THREE.MirroredRepeatWrapping
					};

					if ( wrapMap[ textureJSON.wrap[ 0 ] ] !== undefined ) texture.wrapS = wrapMap[ textureJSON.wrap[ 0 ] ];
					if ( wrapMap[ textureJSON.wrap[ 1 ] ] !== undefined ) texture.wrapT = wrapMap[ textureJSON.wrap[ 1 ] ];

				}

			}

			result.textures[ textureID ] = texture;

		}

		// materials

		var matID, matJSON;
		var parID;

		for ( matID in data.materials ) {

			matJSON = data.materials[ matID ];

			for ( parID in matJSON.parameters ) {

				if ( parID === "envMap" || parID === "map" || parID === "lightMap" || parID === "bumpMap" || parID === "normalMap" || parID === "alphaMap" ) {

					matJSON.parameters[ parID ] = result.textures[ matJSON.parameters[ parID ] ];

				} else if ( parID === "shading" ) {

					matJSON.parameters[ parID ] = ( matJSON.parameters[ parID ] === "flat" ) ? THREE.FlatShading : THREE.SmoothShading;

				} else if ( parID === "side" ) {

					if ( matJSON.parameters[ parID ] == "double" ) {

						matJSON.parameters[ parID ] = THREE.DoubleSide;

					} else if ( matJSON.parameters[ parID ] == "back" ) {

						matJSON.parameters[ parID ] = THREE.BackSide;

					} else {

						matJSON.parameters[ parID ] = THREE.FrontSide;

					}

				} else if ( parID === "blending" ) {

					matJSON.parameters[ parID ] = matJSON.parameters[ parID ] in THREE ? THREE[ matJSON.parameters[ parID ] ] : THREE.NormalBlending;

				} else if ( parID === "combine" ) {

					matJSON.parameters[ parID ] = matJSON.parameters[ parID ] in THREE ? THREE[ matJSON.parameters[ parID ] ] : THREE.MultiplyOperation;

				} else if ( parID === "vertexColors" ) {

					if ( matJSON.parameters[ parID ] == "face" ) {

						matJSON.parameters[ parID ] = THREE.FaceColors;

					// default to vertex colors if "vertexColors" is anything else face colors or 0 / null / false

					} else if ( matJSON.parameters[ parID ] ) {

						matJSON.parameters[ parID ] = THREE.VertexColors;

					}

				} else if ( parID === "wrapRGB" ) {

					var v3 = matJSON.parameters[ parID ];
					matJSON.parameters[ parID ] = new THREE.Vector3( v3[ 0 ], v3[ 1 ], v3[ 2 ] );

				} else if ( parID === "normalScale" ) {

					var v2 = matJSON.parameters[ parID ];
					matJSON.parameters[ parID ] = new THREE.Vector2( v2[ 0 ], v2[ 1 ] );

				}

			}

			if ( matJSON.parameters.opacity !== undefined && matJSON.parameters.opacity < 1.0 ) {

				matJSON.parameters.transparent = true;

			}

			material = new THREE[ matJSON.type ]( matJSON.parameters );
			material.name = matID;

			result.materials[ matID ] = material;

		}

		// second pass through all materials to initialize MeshFaceMaterials
		// that could be referring to other materials out of order

		for ( matID in data.materials ) {

			matJSON = data.materials[ matID ];

			if ( matJSON.parameters.materials ) {

				var materialArray = [];

				for ( var i = 0; i < matJSON.parameters.materials.length; i ++ ) {

					var label = matJSON.parameters.materials[ i ];
					materialArray.push( result.materials[ label ] );

				}

				result.materials[ matID ].materials = materialArray;

			}

		}

		// objects ( synchronous init of procedural primitives )

		handle_objects();

		// defaults

		if ( result.cameras && data.defaults.camera ) {

			result.currentCamera = result.cameras[ data.defaults.camera ];

		}

		if ( result.fogs && data.defaults.fog ) {

			result.scene.fog = result.fogs[ data.defaults.fog ];

		}

		// synchronous callback

		scope.callbackSync( result );

		// just in case there are no async elements

		async_callback_gate();

	}

};

// File:examples/js/renderers/Projector.js

/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author julianwa / https://github.com/julianwa
 */

THREE.RenderableObject = function () {

	this.id = 0;

	this.object = null;
	this.z = 0;
	this.renderOrder = 0;

};

//

THREE.RenderableFace = function () {

	this.id = 0;

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();
	this.v3 = new THREE.RenderableVertex();

	this.normalModel = new THREE.Vector3();

	this.vertexNormalsModel = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
	this.vertexNormalsLength = 0;

	this.color = new THREE.Color();
	this.material = null;
	this.uvs = [ new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() ];

	this.z = 0;
	this.renderOrder = 0;

};

//

THREE.RenderableVertex = function () {

	this.position = new THREE.Vector3();
	this.positionWorld = new THREE.Vector3();
	this.positionScreen = new THREE.Vector4();

	this.visible = true;

};

THREE.RenderableVertex.prototype.copy = function ( vertex ) {

	this.positionWorld.copy( vertex.positionWorld );
	this.positionScreen.copy( vertex.positionScreen );

};

//

THREE.RenderableLine = function () {

	this.id = 0;

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();

	this.vertexColors = [ new THREE.Color(), new THREE.Color() ];
	this.material = null;

	this.z = 0;
	this.renderOrder = 0;

};

//

THREE.RenderableSprite = function () {

	this.id = 0;

	this.object = null;

	this.x = 0;
	this.y = 0;
	this.z = 0;

	this.rotation = 0;
	this.scale = new THREE.Vector2();

	this.material = null;
	this.renderOrder = 0;

};

//

THREE.Projector = function () {

	var _object, _objectCount, _objectPool = [], _objectPoolLength = 0,
	_vertex, _vertexCount, _vertexPool = [], _vertexPoolLength = 0,
	_face, _faceCount, _facePool = [], _facePoolLength = 0,
	_line, _lineCount, _linePool = [], _linePoolLength = 0,
	_sprite, _spriteCount, _spritePool = [], _spritePoolLength = 0,

	_renderData = { objects: [], lights: [], elements: [] },

	_vector3 = new THREE.Vector3(),
	_vector4 = new THREE.Vector4(),

	_clipBox = new THREE.Box3( new THREE.Vector3( - 1, - 1, - 1 ), new THREE.Vector3( 1, 1, 1 ) ),
	_boundingBox = new THREE.Box3(),
	_points3 = new Array( 3 ),
	_points4 = new Array( 4 ),

	_viewMatrix = new THREE.Matrix4(),
	_viewProjectionMatrix = new THREE.Matrix4(),

	_modelMatrix,
	_modelViewProjectionMatrix = new THREE.Matrix4(),

	_normalMatrix = new THREE.Matrix3(),

	_frustum = new THREE.Frustum(),

	_clippedVertex1PositionScreen = new THREE.Vector4(),
	_clippedVertex2PositionScreen = new THREE.Vector4();

	//

	this.projectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .projectVector() is now vector.project().' );
		vector.project( camera );

	};

	this.unprojectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .unprojectVector() is now vector.unproject().' );
		vector.unproject( camera );

	};

	this.pickingRay = function ( vector, camera ) {

		console.error( 'THREE.Projector: .pickingRay() is now raycaster.setFromCamera().' );

	};

	//

	var RenderList = function () {

		var normals = [];
		var uvs = [];

		var object = null;
		var material = null;

		var normalMatrix = new THREE.Matrix3();

		var setObject = function ( value ) {

			object = value;
			material = object.material;

			normalMatrix.getNormalMatrix( object.matrixWorld );

			normals.length = 0;
			uvs.length = 0;

		};

		var projectVertex = function ( vertex ) {

			var position = vertex.position;
			var positionWorld = vertex.positionWorld;
			var positionScreen = vertex.positionScreen;

			positionWorld.copy( position ).applyMatrix4( _modelMatrix );
			positionScreen.copy( positionWorld ).applyMatrix4( _viewProjectionMatrix );

			var invW = 1 / positionScreen.w;

			positionScreen.x *= invW;
			positionScreen.y *= invW;
			positionScreen.z *= invW;

			vertex.visible = positionScreen.x >= - 1 && positionScreen.x <= 1 &&
					 positionScreen.y >= - 1 && positionScreen.y <= 1 &&
					 positionScreen.z >= - 1 && positionScreen.z <= 1;

		};

		var pushVertex = function ( x, y, z ) {

			_vertex = getNextVertexInPool();
			_vertex.position.set( x, y, z );

			projectVertex( _vertex );

		};

		var pushNormal = function ( x, y, z ) {

			normals.push( x, y, z );

		};

		var pushUv = function ( x, y ) {

			uvs.push( x, y );

		};

		var checkTriangleVisibility = function ( v1, v2, v3 ) {

			if ( v1.visible === true || v2.visible === true || v3.visible === true ) return true;

			_points3[ 0 ] = v1.positionScreen;
			_points3[ 1 ] = v2.positionScreen;
			_points3[ 2 ] = v3.positionScreen;

			return _clipBox.isIntersectionBox( _boundingBox.setFromPoints( _points3 ) );

		};

		var checkBackfaceCulling = function ( v1, v2, v3 ) {

			return ( ( v3.positionScreen.x - v1.positionScreen.x ) *
				    ( v2.positionScreen.y - v1.positionScreen.y ) -
				    ( v3.positionScreen.y - v1.positionScreen.y ) *
				    ( v2.positionScreen.x - v1.positionScreen.x ) ) < 0;

		};

		var pushLine = function ( a, b ) {

			var v1 = _vertexPool[ a ];
			var v2 = _vertexPool[ b ];

			_line = getNextLineInPool();

			_line.id = object.id;
			_line.v1.copy( v1 );
			_line.v2.copy( v2 );
			_line.z = ( v1.positionScreen.z + v2.positionScreen.z ) / 2;
			_line.renderOrder = object.renderOrder;

			_line.material = object.material;

			_renderData.elements.push( _line );

		};

		var pushTriangle = function ( a, b, c ) {

			var v1 = _vertexPool[ a ];
			var v2 = _vertexPool[ b ];
			var v3 = _vertexPool[ c ];

			if ( checkTriangleVisibility( v1, v2, v3 ) === false ) return;

			if ( material.side === THREE.DoubleSide || checkBackfaceCulling( v1, v2, v3 ) === true ) {

				_face = getNextFaceInPool();

				_face.id = object.id;
				_face.v1.copy( v1 );
				_face.v2.copy( v2 );
				_face.v3.copy( v3 );
				_face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
				_face.renderOrder = object.renderOrder;

				// use first vertex normal as face normal

				_face.normalModel.fromArray( normals, a * 3 );
				_face.normalModel.applyMatrix3( normalMatrix ).normalize();

				for ( var i = 0; i < 3; i ++ ) {

					var normal = _face.vertexNormalsModel[ i ];
					normal.fromArray( normals, arguments[ i ] * 3 );
					normal.applyMatrix3( normalMatrix ).normalize();

					var uv = _face.uvs[ i ];
					uv.fromArray( uvs, arguments[ i ] * 2 );

				}

				_face.vertexNormalsLength = 3;

				_face.material = object.material;

				_renderData.elements.push( _face );

			}

		};

		return {
			setObject: setObject,
			projectVertex: projectVertex,
			checkTriangleVisibility: checkTriangleVisibility,
			checkBackfaceCulling: checkBackfaceCulling,
			pushVertex: pushVertex,
			pushNormal: pushNormal,
			pushUv: pushUv,
			pushLine: pushLine,
			pushTriangle: pushTriangle
		}

	};

	var renderList = new RenderList();

	this.projectScene = function ( scene, camera, sortObjects, sortElements ) {

		_faceCount = 0;
		_lineCount = 0;
		_spriteCount = 0;

		_renderData.elements.length = 0;

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();
		if ( camera.parent === null ) camera.updateMatrixWorld();

		_viewMatrix.copy( camera.matrixWorldInverse.getInverse( camera.matrixWorld ) );
		_viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );

		_frustum.setFromMatrix( _viewProjectionMatrix );

		//

		_objectCount = 0;

		_renderData.objects.length = 0;
		_renderData.lights.length = 0;

		scene.traverseVisible( function ( object ) {

			if ( object instanceof THREE.Light ) {

				_renderData.lights.push( object );

			} else if ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite ) {

				var material = object.material;

				if ( material.visible === false ) return;

				if ( object.frustumCulled === false || _frustum.intersectsObject( object ) === true ) {

					_object = getNextObjectInPool();
					_object.id = object.id;
					_object.object = object;

					_vector3.setFromMatrixPosition( object.matrixWorld );
					_vector3.applyProjection( _viewProjectionMatrix );
					_object.z = _vector3.z;
					_object.renderOrder = object.renderOrder;

					_renderData.objects.push( _object );

				}

			}

		} );

		if ( sortObjects === true ) {

			_renderData.objects.sort( painterSort );

		}

		//

		for ( var o = 0, ol = _renderData.objects.length; o < ol; o ++ ) {

			var object = _renderData.objects[ o ].object;
			var geometry = object.geometry;

			renderList.setObject( object );

			_modelMatrix = object.matrixWorld;

			_vertexCount = 0;

			if ( object instanceof THREE.Mesh ) {

				if ( geometry instanceof THREE.BufferGeometry ) {

					var attributes = geometry.attributes;
					var groups = geometry.groups;

					if ( attributes.position === undefined ) continue;

					var positions = attributes.position.array;

					for ( var i = 0, l = positions.length; i < l; i += 3 ) {

						renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

					}

					if ( attributes.normal !== undefined ) {

						var normals = attributes.normal.array;

						for ( var i = 0, l = normals.length; i < l; i += 3 ) {

							renderList.pushNormal( normals[ i ], normals[ i + 1 ], normals[ i + 2 ] );

						}

					}

					if ( attributes.uv !== undefined ) {

						var uvs = attributes.uv.array;

						for ( var i = 0, l = uvs.length; i < l; i += 2 ) {

							renderList.pushUv( uvs[ i ], uvs[ i + 1 ] );

						}

					}

					if ( geometry.index !== null ) {

						var indices = geometry.index.array;

						if ( groups.length > 0 ) {

							for ( var o = 0; o < groups.length; o ++ ) {

								var group = groups[ o ];

								for ( var i = group.start, l = group.start + group.count; i < l; i += 3 ) {

									renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

								}

							}

						} else {

							for ( var i = 0, l = indices.length; i < l; i += 3 ) {

								renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

							}

						}

					} else {

						for ( var i = 0, l = positions.length / 3; i < l; i += 3 ) {

							renderList.pushTriangle( i, i + 1, i + 2 );

						}

					}

				} else if ( geometry instanceof THREE.Geometry ) {

					var vertices = geometry.vertices;
					var faces = geometry.faces;
					var faceVertexUvs = geometry.faceVertexUvs[ 0 ];

					_normalMatrix.getNormalMatrix( _modelMatrix );

					var material = object.material;

					var isFaceMaterial = material instanceof THREE.MeshFaceMaterial;
					var objectMaterials = isFaceMaterial === true ? object.material : null;

					for ( var v = 0, vl = vertices.length; v < vl; v ++ ) {

						var vertex = vertices[ v ];

						_vector3.copy( vertex );

						if ( material.morphTargets === true ) {

							var morphTargets = geometry.morphTargets;
							var morphInfluences = object.morphTargetInfluences;

							for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

								var influence = morphInfluences[ t ];

								if ( influence === 0 ) continue;

								var target = morphTargets[ t ];
								var targetVertex = target.vertices[ v ];

								_vector3.x += ( targetVertex.x - vertex.x ) * influence;
								_vector3.y += ( targetVertex.y - vertex.y ) * influence;
								_vector3.z += ( targetVertex.z - vertex.z ) * influence;

							}

						}

						renderList.pushVertex( _vector3.x, _vector3.y, _vector3.z );

					}

					for ( var f = 0, fl = faces.length; f < fl; f ++ ) {

						var face = faces[ f ];

						material = isFaceMaterial === true
							 ? objectMaterials.materials[ face.materialIndex ]
							 : object.material;

						if ( material === undefined ) continue;

						var side = material.side;

						var v1 = _vertexPool[ face.a ];
						var v2 = _vertexPool[ face.b ];
						var v3 = _vertexPool[ face.c ];

						if ( renderList.checkTriangleVisibility( v1, v2, v3 ) === false ) continue;

						var visible = renderList.checkBackfaceCulling( v1, v2, v3 );

						if ( side !== THREE.DoubleSide ) {

							if ( side === THREE.FrontSide && visible === false ) continue;
							if ( side === THREE.BackSide && visible === true ) continue;

						}

						_face = getNextFaceInPool();

						_face.id = object.id;
						_face.v1.copy( v1 );
						_face.v2.copy( v2 );
						_face.v3.copy( v3 );

						_face.normalModel.copy( face.normal );

						if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

							_face.normalModel.negate();

						}

						_face.normalModel.applyMatrix3( _normalMatrix ).normalize();

						var faceVertexNormals = face.vertexNormals;

						for ( var n = 0, nl = Math.min( faceVertexNormals.length, 3 ); n < nl; n ++ ) {

							var normalModel = _face.vertexNormalsModel[ n ];
							normalModel.copy( faceVertexNormals[ n ] );

							if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

								normalModel.negate();

							}

							normalModel.applyMatrix3( _normalMatrix ).normalize();

						}

						_face.vertexNormalsLength = faceVertexNormals.length;

						var vertexUvs = faceVertexUvs[ f ];

						if ( vertexUvs !== undefined ) {

							for ( var u = 0; u < 3; u ++ ) {

								_face.uvs[ u ].copy( vertexUvs[ u ] );

							}

						}

						_face.color = face.color;
						_face.material = material;

						_face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
						_face.renderOrder = object.renderOrder;

						_renderData.elements.push( _face );

					}

				}

			} else if ( object instanceof THREE.Line ) {

				if ( geometry instanceof THREE.BufferGeometry ) {

					var attributes = geometry.attributes;

					if ( attributes.position !== undefined ) {

						var positions = attributes.position.array;

						for ( var i = 0, l = positions.length; i < l; i += 3 ) {

							renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

						}

						if ( geometry.index !== null ) {

							var indices = geometry.index.array;

							for ( var i = 0, l = indices.length; i < l; i += 2 ) {

								renderList.pushLine( indices[ i ], indices[ i + 1 ] );

							}

						} else {

							var step = object instanceof THREE.LineSegments ? 2 : 1;

							for ( var i = 0, l = ( positions.length / 3 ) - 1; i < l; i += step ) {

								renderList.pushLine( i, i + 1 );

							}

						}

					}

				} else if ( geometry instanceof THREE.Geometry ) {

					_modelViewProjectionMatrix.multiplyMatrices( _viewProjectionMatrix, _modelMatrix );

					var vertices = object.geometry.vertices;

					if ( vertices.length === 0 ) continue;

					v1 = getNextVertexInPool();
					v1.positionScreen.copy( vertices[ 0 ] ).applyMatrix4( _modelViewProjectionMatrix );

					var step = object instanceof THREE.LineSegments ? 2 : 1;

					for ( var v = 1, vl = vertices.length; v < vl; v ++ ) {

						v1 = getNextVertexInPool();
						v1.positionScreen.copy( vertices[ v ] ).applyMatrix4( _modelViewProjectionMatrix );

						if ( ( v + 1 ) % step > 0 ) continue;

						v2 = _vertexPool[ _vertexCount - 2 ];

						_clippedVertex1PositionScreen.copy( v1.positionScreen );
						_clippedVertex2PositionScreen.copy( v2.positionScreen );

						if ( clipLine( _clippedVertex1PositionScreen, _clippedVertex2PositionScreen ) === true ) {

							// Perform the perspective divide
							_clippedVertex1PositionScreen.multiplyScalar( 1 / _clippedVertex1PositionScreen.w );
							_clippedVertex2PositionScreen.multiplyScalar( 1 / _clippedVertex2PositionScreen.w );

							_line = getNextLineInPool();

							_line.id = object.id;
							_line.v1.positionScreen.copy( _clippedVertex1PositionScreen );
							_line.v2.positionScreen.copy( _clippedVertex2PositionScreen );

							_line.z = Math.max( _clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z );
							_line.renderOrder = object.renderOrder;

							_line.material = object.material;

							if ( object.material.vertexColors === THREE.VertexColors ) {

								_line.vertexColors[ 0 ].copy( object.geometry.colors[ v ] );
								_line.vertexColors[ 1 ].copy( object.geometry.colors[ v - 1 ] );

							}

							_renderData.elements.push( _line );

						}

					}

				}

			} else if ( object instanceof THREE.Sprite ) {

				_vector4.set( _modelMatrix.elements[ 12 ], _modelMatrix.elements[ 13 ], _modelMatrix.elements[ 14 ], 1 );
				_vector4.applyMatrix4( _viewProjectionMatrix );

				var invW = 1 / _vector4.w;

				_vector4.z *= invW;

				if ( _vector4.z >= - 1 && _vector4.z <= 1 ) {

					_sprite = getNextSpriteInPool();
					_sprite.id = object.id;
					_sprite.x = _vector4.x * invW;
					_sprite.y = _vector4.y * invW;
					_sprite.z = _vector4.z;
					_sprite.renderOrder = object.renderOrder;
					_sprite.object = object;

					_sprite.rotation = object.rotation;

					_sprite.scale.x = object.scale.x * Math.abs( _sprite.x - ( _vector4.x + camera.projectionMatrix.elements[ 0 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 12 ] ) );
					_sprite.scale.y = object.scale.y * Math.abs( _sprite.y - ( _vector4.y + camera.projectionMatrix.elements[ 5 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 13 ] ) );

					_sprite.material = object.material;

					_renderData.elements.push( _sprite );

				}

			}

		}

		if ( sortElements === true ) {

			_renderData.elements.sort( painterSort );

		}

		return _renderData;

	};

	// Pools

	function getNextObjectInPool() {

		if ( _objectCount === _objectPoolLength ) {

			var object = new THREE.RenderableObject();
			_objectPool.push( object );
			_objectPoolLength ++;
			_objectCount ++;
			return object;

		}

		return _objectPool[ _objectCount ++ ];

	}

	function getNextVertexInPool() {

		if ( _vertexCount === _vertexPoolLength ) {

			var vertex = new THREE.RenderableVertex();
			_vertexPool.push( vertex );
			_vertexPoolLength ++;
			_vertexCount ++;
			return vertex;

		}

		return _vertexPool[ _vertexCount ++ ];

	}

	function getNextFaceInPool() {

		if ( _faceCount === _facePoolLength ) {

			var face = new THREE.RenderableFace();
			_facePool.push( face );
			_facePoolLength ++;
			_faceCount ++;
			return face;

		}

		return _facePool[ _faceCount ++ ];


	}

	function getNextLineInPool() {

		if ( _lineCount === _linePoolLength ) {

			var line = new THREE.RenderableLine();
			_linePool.push( line );
			_linePoolLength ++;
			_lineCount ++;
			return line;

		}

		return _linePool[ _lineCount ++ ];

	}

	function getNextSpriteInPool() {

		if ( _spriteCount === _spritePoolLength ) {

			var sprite = new THREE.RenderableSprite();
			_spritePool.push( sprite );
			_spritePoolLength ++;
			_spriteCount ++;
			return sprite;

		}

		return _spritePool[ _spriteCount ++ ];

	}

	//

	function painterSort( a, b ) {

		if ( a.renderOrder !== b.renderOrder ) {

			return a.renderOrder - b.renderOrder;

		} else if ( a.z !== b.z ) {

			return b.z - a.z;

		} else if ( a.id !== b.id ) {

			return a.id - b.id;

		} else {

			return 0;

		}

	}

	function clipLine( s1, s2 ) {

		var alpha1 = 0, alpha2 = 1,

		// Calculate the boundary coordinate of each vertex for the near and far clip planes,
		// Z = -1 and Z = +1, respectively.
		bc1near =  s1.z + s1.w,
		bc2near =  s2.z + s2.w,
		bc1far =  - s1.z + s1.w,
		bc2far =  - s2.z + s2.w;

		if ( bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0 ) {

			// Both vertices lie entirely within all clip planes.
			return true;

		} else if ( ( bc1near < 0 && bc2near < 0 ) || ( bc1far < 0 && bc2far < 0 ) ) {

			// Both vertices lie entirely outside one of the clip planes.
			return false;

		} else {

			// The line segment spans at least one clip plane.

			if ( bc1near < 0 ) {

				// v1 lies outside the near plane, v2 inside
				alpha1 = Math.max( alpha1, bc1near / ( bc1near - bc2near ) );

			} else if ( bc2near < 0 ) {

				// v2 lies outside the near plane, v1 inside
				alpha2 = Math.min( alpha2, bc1near / ( bc1near - bc2near ) );

			}

			if ( bc1far < 0 ) {

				// v1 lies outside the far plane, v2 inside
				alpha1 = Math.max( alpha1, bc1far / ( bc1far - bc2far ) );

			} else if ( bc2far < 0 ) {

				// v2 lies outside the far plane, v2 inside
				alpha2 = Math.min( alpha2, bc1far / ( bc1far - bc2far ) );

			}

			if ( alpha2 < alpha1 ) {

				// The line segment spans two boundaries, but is outside both of them.
				// (This can't happen when we're only clipping against just near/far but good
				//  to leave the check here for future usage if other clip planes are added.)
				return false;

			} else {

				// Update the s1 and s2 vertices to match the clipped line segment.
				s1.lerp( s2, alpha1 );
				s2.lerp( s1, 1 - alpha2 );

				return true;

			}

		}

	}

};

// File:examples/js/renderers/CanvasRenderer.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SpriteCanvasMaterial = function ( parameters ) {

	THREE.Material.call( this );

	this.type = 'SpriteCanvasMaterial';

	this.color = new THREE.Color( 0xffffff );
	this.program = function ( context, color ) {};

	this.setValues( parameters );

};

THREE.SpriteCanvasMaterial.prototype = Object.create( THREE.Material.prototype );
THREE.SpriteCanvasMaterial.prototype.constructor = THREE.SpriteCanvasMaterial;

THREE.SpriteCanvasMaterial.prototype.clone = function () {

	var material = new THREE.SpriteCanvasMaterial();

	material.copy( this );
	material.color.copy( this.color );
	material.program = this.program;

	return material;

};

//

THREE.CanvasRenderer = function ( parameters ) {

	console.log( 'THREE.CanvasRenderer', THREE.REVISION );

	var smoothstep = THREE.Math.smoothstep;

	parameters = parameters || {};

	var _this = this,
	_renderData, _elements, _lights,
	_projector = new THREE.Projector(),

	_canvas = parameters.canvas !== undefined
			 ? parameters.canvas
			 : document.createElement( 'canvas' ),

	_canvasWidth = _canvas.width,
	_canvasHeight = _canvas.height,
	_canvasWidthHalf = Math.floor( _canvasWidth / 2 ),
	_canvasHeightHalf = Math.floor( _canvasHeight / 2 ),

	_viewportX = 0,
	_viewportY = 0,
	_viewportWidth = _canvasWidth,
	_viewportHeight = _canvasHeight,

	pixelRatio = 1,

	_context = _canvas.getContext( '2d', {
		alpha: parameters.alpha === true
	} ),

	_clearColor = new THREE.Color( 0x000000 ),
	_clearAlpha = parameters.alpha === true ? 0 : 1,

	_contextGlobalAlpha = 1,
	_contextGlobalCompositeOperation = 0,
	_contextStrokeStyle = null,
	_contextFillStyle = null,
	_contextLineWidth = null,
	_contextLineCap = null,
	_contextLineJoin = null,
	_contextLineDash = [],

	_camera,

	_v1, _v2, _v3, _v4,
	_v5 = new THREE.RenderableVertex(),
	_v6 = new THREE.RenderableVertex(),

	_v1x, _v1y, _v2x, _v2y, _v3x, _v3y,
	_v4x, _v4y, _v5x, _v5y, _v6x, _v6y,

	_color = new THREE.Color(),
	_color1 = new THREE.Color(),
	_color2 = new THREE.Color(),
	_color3 = new THREE.Color(),
	_color4 = new THREE.Color(),

	_diffuseColor = new THREE.Color(),
	_emissiveColor = new THREE.Color(),

	_lightColor = new THREE.Color(),

	_patterns = {},

	_image, _uvs,
	_uv1x, _uv1y, _uv2x, _uv2y, _uv3x, _uv3y,

	_clipBox = new THREE.Box2(),
	_clearBox = new THREE.Box2(),
	_elemBox = new THREE.Box2(),

	_ambientLight = new THREE.Color(),
	_directionalLights = new THREE.Color(),
	_pointLights = new THREE.Color(),

	_vector3 = new THREE.Vector3(), // Needed for PointLight
	_centroid = new THREE.Vector3(),
	_normal = new THREE.Vector3(),
	_normalViewMatrix = new THREE.Matrix3();

	// dash+gap fallbacks for Firefox and everything else

	if ( _context.setLineDash === undefined ) {

		_context.setLineDash = function () {}

	}

	this.domElement = _canvas;

	this.autoClear = true;
	this.sortObjects = true;
	this.sortElements = true;

	this.info = {

		render: {

			vertices: 0,
			faces: 0

		}

	};

	// WebGLRenderer compatibility

	this.supportsVertexTextures = function () {};
	this.setFaceCulling = function () {};

	// API

	this.getContext = function () {

		return _context;

	};

	this.getContextAttributes = function () {

		return _context.getContextAttributes();

	};

	this.getPixelRatio = function () {

		return pixelRatio;

	};

	this.setPixelRatio = function ( value ) {

		if ( value !== undefined ) pixelRatio = value;

	};

	this.setSize = function ( width, height, updateStyle ) {

		_canvasWidth = width * pixelRatio;
		_canvasHeight = height * pixelRatio;

		_canvas.width = _canvasWidth;
		_canvas.height = _canvasHeight;

		_canvasWidthHalf = Math.floor( _canvasWidth / 2 );
		_canvasHeightHalf = Math.floor( _canvasHeight / 2 );

		if ( updateStyle !== false ) {

			_canvas.style.width = width + 'px';
			_canvas.style.height = height + 'px';

		}

		_clipBox.min.set( - _canvasWidthHalf, - _canvasHeightHalf );
		_clipBox.max.set(   _canvasWidthHalf,   _canvasHeightHalf );

		_clearBox.min.set( - _canvasWidthHalf, - _canvasHeightHalf );
		_clearBox.max.set(   _canvasWidthHalf,   _canvasHeightHalf );

		_contextGlobalAlpha = 1;
		_contextGlobalCompositeOperation = 0;
		_contextStrokeStyle = null;
		_contextFillStyle = null;
		_contextLineWidth = null;
		_contextLineCap = null;
		_contextLineJoin = null;

		this.setViewport( 0, 0, width, height );

	};

	this.setViewport = function ( x, y, width, height ) {

		_viewportX = x * pixelRatio;
		_viewportY = y * pixelRatio;

		_viewportWidth = width * pixelRatio;
		_viewportHeight = height * pixelRatio;

	};

	this.setScissor = function () {};
	this.enableScissorTest = function () {};

	this.setClearColor = function ( color, alpha ) {

		_clearColor.set( color );
		_clearAlpha = alpha !== undefined ? alpha : 1;

		_clearBox.min.set( - _canvasWidthHalf, - _canvasHeightHalf );
		_clearBox.max.set(   _canvasWidthHalf,   _canvasHeightHalf );

	};

	this.setClearColorHex = function ( hex, alpha ) {

		console.warn( 'THREE.CanvasRenderer: .setClearColorHex() is being removed. Use .setClearColor() instead.' );
		this.setClearColor( hex, alpha );

	};

	this.getClearColor = function () {

		return _clearColor;

	};

	this.getClearAlpha = function () {

		return _clearAlpha;

	};

	this.getMaxAnisotropy = function () {

		return 0;

	};

	this.clear = function () {

		if ( _clearBox.empty() === false ) {

			_clearBox.intersect( _clipBox );
			_clearBox.expandByScalar( 2 );

			_clearBox.min.x = _clearBox.min.x + _canvasWidthHalf;
			_clearBox.min.y =  - _clearBox.min.y + _canvasHeightHalf;		// higher y value !
			_clearBox.max.x = _clearBox.max.x + _canvasWidthHalf;
			_clearBox.max.y =  - _clearBox.max.y + _canvasHeightHalf;		// lower y value !

			if ( _clearAlpha < 1 ) {

				_context.clearRect(
					_clearBox.min.x | 0,
					_clearBox.max.y | 0,
					( _clearBox.max.x - _clearBox.min.x ) | 0,
					( _clearBox.min.y - _clearBox.max.y ) | 0
				);

			}

			if ( _clearAlpha > 0 ) {

				setBlending( THREE.NormalBlending );
				setOpacity( 1 );

				setFillStyle( 'rgba(' + Math.floor( _clearColor.r * 255 ) + ',' + Math.floor( _clearColor.g * 255 ) + ',' + Math.floor( _clearColor.b * 255 ) + ',' + _clearAlpha + ')' );

				_context.fillRect(
					_clearBox.min.x | 0,
					_clearBox.max.y | 0,
					( _clearBox.max.x - _clearBox.min.x ) | 0,
					( _clearBox.min.y - _clearBox.max.y ) | 0
				);

			}

			_clearBox.makeEmpty();

		}

	};

	// compatibility

	this.clearColor = function () {};
	this.clearDepth = function () {};
	this.clearStencil = function () {};

	this.render = function ( scene, camera ) {

		if ( camera instanceof THREE.Camera === false ) {

			console.error( 'THREE.CanvasRenderer.render: camera is not an instance of THREE.Camera.' );
			return;

		}

		if ( this.autoClear === true ) this.clear();

		_this.info.render.vertices = 0;
		_this.info.render.faces = 0;

		_context.setTransform( _viewportWidth / _canvasWidth, 0, 0, - _viewportHeight / _canvasHeight, _viewportX, _canvasHeight - _viewportY );
		_context.translate( _canvasWidthHalf, _canvasHeightHalf );

		_renderData = _projector.projectScene( scene, camera, this.sortObjects, this.sortElements );
		_elements = _renderData.elements;
		_lights = _renderData.lights;
		_camera = camera;

		_normalViewMatrix.getNormalMatrix( camera.matrixWorldInverse );

		/* DEBUG
		setFillStyle( 'rgba( 0, 255, 255, 0.5 )' );
		_context.fillRect( _clipBox.min.x, _clipBox.min.y, _clipBox.max.x - _clipBox.min.x, _clipBox.max.y - _clipBox.min.y );
		*/

		calculateLights();

		for ( var e = 0, el = _elements.length; e < el; e ++ ) {

			var element = _elements[ e ];

			var material = element.material;

			if ( material === undefined || material.opacity === 0 ) continue;

			_elemBox.makeEmpty();

			if ( element instanceof THREE.RenderableSprite ) {

				_v1 = element;
				_v1.x *= _canvasWidthHalf; _v1.y *= _canvasHeightHalf;

				renderSprite( _v1, element, material );

			} else if ( element instanceof THREE.RenderableLine ) {

				_v1 = element.v1; _v2 = element.v2;

				_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;

				_elemBox.setFromPoints( [
					_v1.positionScreen,
					_v2.positionScreen
				] );

				if ( _clipBox.isIntersectionBox( _elemBox ) === true ) {

					renderLine( _v1, _v2, element, material );

				}

			} else if ( element instanceof THREE.RenderableFace ) {

				_v1 = element.v1; _v2 = element.v2; _v3 = element.v3;

				if ( _v1.positionScreen.z < - 1 || _v1.positionScreen.z > 1 ) continue;
				if ( _v2.positionScreen.z < - 1 || _v2.positionScreen.z > 1 ) continue;
				if ( _v3.positionScreen.z < - 1 || _v3.positionScreen.z > 1 ) continue;

				_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;
				_v3.positionScreen.x *= _canvasWidthHalf; _v3.positionScreen.y *= _canvasHeightHalf;

				if ( material.overdraw > 0 ) {

					expand( _v1.positionScreen, _v2.positionScreen, material.overdraw );
					expand( _v2.positionScreen, _v3.positionScreen, material.overdraw );
					expand( _v3.positionScreen, _v1.positionScreen, material.overdraw );

				}

				_elemBox.setFromPoints( [
					_v1.positionScreen,
					_v2.positionScreen,
					_v3.positionScreen
				] );

				if ( _clipBox.isIntersectionBox( _elemBox ) === true ) {

					renderFace3( _v1, _v2, _v3, 0, 1, 2, element, material );

				}

			}

			/* DEBUG
			setLineWidth( 1 );
			setStrokeStyle( 'rgba( 0, 255, 0, 0.5 )' );
			_context.strokeRect( _elemBox.min.x, _elemBox.min.y, _elemBox.max.x - _elemBox.min.x, _elemBox.max.y - _elemBox.min.y );
			*/

			_clearBox.union( _elemBox );

		}

		/* DEBUG
		setLineWidth( 1 );
		setStrokeStyle( 'rgba( 255, 0, 0, 0.5 )' );
		_context.strokeRect( _clearBox.min.x, _clearBox.min.y, _clearBox.max.x - _clearBox.min.x, _clearBox.max.y - _clearBox.min.y );
		*/

		_context.setTransform( 1, 0, 0, 1, 0, 0 );

	};

	//

	function calculateLights() {

		_ambientLight.setRGB( 0, 0, 0 );
		_directionalLights.setRGB( 0, 0, 0 );
		_pointLights.setRGB( 0, 0, 0 );

		for ( var l = 0, ll = _lights.length; l < ll; l ++ ) {

			var light = _lights[ l ];
			var lightColor = light.color;

			if ( light instanceof THREE.AmbientLight ) {

				_ambientLight.add( lightColor );

			} else if ( light instanceof THREE.DirectionalLight ) {

				// for sprites

				_directionalLights.add( lightColor );

			} else if ( light instanceof THREE.PointLight ) {

				// for sprites

				_pointLights.add( lightColor );

			}

		}

	}

	function calculateLight( position, normal, color ) {

		for ( var l = 0, ll = _lights.length; l < ll; l ++ ) {

			var light = _lights[ l ];

			_lightColor.copy( light.color );

			if ( light instanceof THREE.DirectionalLight ) {

				var lightPosition = _vector3.setFromMatrixPosition( light.matrixWorld ).normalize();

				var amount = normal.dot( lightPosition );

				if ( amount <= 0 ) continue;

				amount *= light.intensity;

				color.add( _lightColor.multiplyScalar( amount ) );

			} else if ( light instanceof THREE.PointLight ) {

				var lightPosition = _vector3.setFromMatrixPosition( light.matrixWorld );

				var amount = normal.dot( _vector3.subVectors( lightPosition, position ).normalize() );

				if ( amount <= 0 ) continue;

				amount *= light.distance == 0 ? 1 : 1 - Math.min( position.distanceTo( lightPosition ) / light.distance, 1 );

				if ( amount == 0 ) continue;

				amount *= light.intensity;

				color.add( _lightColor.multiplyScalar( amount ) );

			}

		}

	}

	function renderSprite( v1, element, material ) {

		setOpacity( material.opacity );
		setBlending( material.blending );

		var scaleX = element.scale.x * _canvasWidthHalf;
		var scaleY = element.scale.y * _canvasHeightHalf;

		var dist = 0.5 * Math.sqrt( scaleX * scaleX + scaleY * scaleY ); // allow for rotated sprite
		_elemBox.min.set( v1.x - dist, v1.y - dist );
		_elemBox.max.set( v1.x + dist, v1.y + dist );

		if ( material instanceof THREE.SpriteMaterial ) {

			var texture = material.map;

			if ( texture !== null ) {

				var pattern = _patterns[ texture.id ];

				if ( pattern === undefined || pattern.version !== texture.version ) {

					pattern = textureToPattern( texture );
					_patterns[ texture.id ] = pattern;

				}

				if ( pattern.canvas !== undefined ) {

					setFillStyle( pattern.canvas );

					var bitmap = texture.image;

					var ox = bitmap.width * texture.offset.x;
					var oy = bitmap.height * texture.offset.y;

					var sx = bitmap.width * texture.repeat.x;
					var sy = bitmap.height * texture.repeat.y;

					var cx = scaleX / sx;
					var cy = scaleY / sy;

					_context.save();
					_context.translate( v1.x, v1.y );
					if ( material.rotation !== 0 ) _context.rotate( material.rotation );
					_context.translate( - scaleX / 2, - scaleY / 2 );
					_context.scale( cx, cy );
					_context.translate( - ox, - oy );
					_context.fillRect( ox, oy, sx, sy );
					_context.restore();

				}

			} else {

				// no texture

				setFillStyle( material.color.getStyle() );

				_context.save();
				_context.translate( v1.x, v1.y );
				if ( material.rotation !== 0 ) _context.rotate( material.rotation );
				_context.scale( scaleX, - scaleY );
				_context.fillRect( - 0.5, - 0.5, 1, 1 );
				_context.restore();

			}

		} else if ( material instanceof THREE.SpriteCanvasMaterial ) {

			setStrokeStyle( material.color.getStyle() );
			setFillStyle( material.color.getStyle() );

			_context.save();
			_context.translate( v1.x, v1.y );
			if ( material.rotation !== 0 ) _context.rotate( material.rotation );
			_context.scale( scaleX, scaleY );

			material.program( _context );

			_context.restore();

		}

		/* DEBUG
		setStrokeStyle( 'rgb(255,255,0)' );
		_context.beginPath();
		_context.moveTo( v1.x - 10, v1.y );
		_context.lineTo( v1.x + 10, v1.y );
		_context.moveTo( v1.x, v1.y - 10 );
		_context.lineTo( v1.x, v1.y + 10 );
		_context.stroke();
		*/

	}

	function renderLine( v1, v2, element, material ) {

		setOpacity( material.opacity );
		setBlending( material.blending );

		_context.beginPath();
		_context.moveTo( v1.positionScreen.x, v1.positionScreen.y );
		_context.lineTo( v2.positionScreen.x, v2.positionScreen.y );

		if ( material instanceof THREE.LineBasicMaterial ) {

			setLineWidth( material.linewidth );
			setLineCap( material.linecap );
			setLineJoin( material.linejoin );

			if ( material.vertexColors !== THREE.VertexColors ) {

				setStrokeStyle( material.color.getStyle() );

			} else {

				var colorStyle1 = element.vertexColors[ 0 ].getStyle();
				var colorStyle2 = element.vertexColors[ 1 ].getStyle();

				if ( colorStyle1 === colorStyle2 ) {

					setStrokeStyle( colorStyle1 );

				} else {

					try {

						var grad = _context.createLinearGradient(
							v1.positionScreen.x,
							v1.positionScreen.y,
							v2.positionScreen.x,
							v2.positionScreen.y
						);
						grad.addColorStop( 0, colorStyle1 );
						grad.addColorStop( 1, colorStyle2 );

					} catch ( exception ) {

						grad = colorStyle1;

					}

					setStrokeStyle( grad );

				}

			}

			_context.stroke();
			_elemBox.expandByScalar( material.linewidth * 2 );

		} else if ( material instanceof THREE.LineDashedMaterial ) {

			setLineWidth( material.linewidth );
			setLineCap( material.linecap );
			setLineJoin( material.linejoin );
			setStrokeStyle( material.color.getStyle() );
			setLineDash( [ material.dashSize, material.gapSize ] );

			_context.stroke();

			_elemBox.expandByScalar( material.linewidth * 2 );

			setLineDash( [] );

		}

	}

	function renderFace3( v1, v2, v3, uv1, uv2, uv3, element, material ) {

		_this.info.render.vertices += 3;
		_this.info.render.faces ++;

		setOpacity( material.opacity );
		setBlending( material.blending );

		_v1x = v1.positionScreen.x; _v1y = v1.positionScreen.y;
		_v2x = v2.positionScreen.x; _v2y = v2.positionScreen.y;
		_v3x = v3.positionScreen.x; _v3y = v3.positionScreen.y;

		drawTriangle( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y );

		if ( ( material instanceof THREE.MeshLambertMaterial || material instanceof THREE.MeshPhongMaterial ) && material.map === null ) {

			_diffuseColor.copy( material.color );
			_emissiveColor.copy( material.emissive );

			if ( material.vertexColors === THREE.FaceColors ) {

				_diffuseColor.multiply( element.color );

			}

			_color.copy( _ambientLight );

			_centroid.copy( v1.positionWorld ).add( v2.positionWorld ).add( v3.positionWorld ).divideScalar( 3 );

			calculateLight( _centroid, element.normalModel, _color );

			_color.multiply( _diffuseColor ).add( _emissiveColor );

			material.wireframe === true
				 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
				 : fillPath( _color );

		} else if ( material instanceof THREE.MeshBasicMaterial ||
				    material instanceof THREE.MeshLambertMaterial ||
				    material instanceof THREE.MeshPhongMaterial ) {

			if ( material.map !== null ) {

				var mapping = material.map.mapping;

				if ( mapping === THREE.UVMapping ) {

					_uvs = element.uvs;
					patternPath( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uvs[ uv1 ].x, _uvs[ uv1 ].y, _uvs[ uv2 ].x, _uvs[ uv2 ].y, _uvs[ uv3 ].x, _uvs[ uv3 ].y, material.map );

				}

			} else if ( material.envMap !== null ) {

				if ( material.envMap.mapping === THREE.SphericalReflectionMapping ) {

					_normal.copy( element.vertexNormalsModel[ uv1 ] ).applyMatrix3( _normalViewMatrix );
					_uv1x = 0.5 * _normal.x + 0.5;
					_uv1y = 0.5 * _normal.y + 0.5;

					_normal.copy( element.vertexNormalsModel[ uv2 ] ).applyMatrix3( _normalViewMatrix );
					_uv2x = 0.5 * _normal.x + 0.5;
					_uv2y = 0.5 * _normal.y + 0.5;

					_normal.copy( element.vertexNormalsModel[ uv3 ] ).applyMatrix3( _normalViewMatrix );
					_uv3x = 0.5 * _normal.x + 0.5;
					_uv3y = 0.5 * _normal.y + 0.5;

					patternPath( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uv1x, _uv1y, _uv2x, _uv2y, _uv3x, _uv3y, material.envMap );

				}

			} else {

				_color.copy( material.color );

				if ( material.vertexColors === THREE.FaceColors ) {

					_color.multiply( element.color );

				}

				material.wireframe === true
					 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
					 : fillPath( _color );

			}

		} else if ( material instanceof THREE.MeshDepthMaterial ) {

			_color.r = _color.g = _color.b = 1 - smoothstep( v1.positionScreen.z * v1.positionScreen.w, _camera.near, _camera.far );

			material.wireframe === true
					 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
					 : fillPath( _color );

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			_normal.copy( element.normalModel ).applyMatrix3( _normalViewMatrix );

			_color.setRGB( _normal.x, _normal.y, _normal.z ).multiplyScalar( 0.5 ).addScalar( 0.5 );

			material.wireframe === true
				 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
				 : fillPath( _color );

		} else {

			_color.setRGB( 1, 1, 1 );

			material.wireframe === true
				 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
				 : fillPath( _color );

		}

	}

	//

	function drawTriangle( x0, y0, x1, y1, x2, y2 ) {

		_context.beginPath();
		_context.moveTo( x0, y0 );
		_context.lineTo( x1, y1 );
		_context.lineTo( x2, y2 );
		_context.closePath();

	}

	function strokePath( color, linewidth, linecap, linejoin ) {

		setLineWidth( linewidth );
		setLineCap( linecap );
		setLineJoin( linejoin );
		setStrokeStyle( color.getStyle() );

		_context.stroke();

		_elemBox.expandByScalar( linewidth * 2 );

	}

	function fillPath( color ) {

		setFillStyle( color.getStyle() );
		_context.fill();

	}

	function textureToPattern( texture ) {

		if ( texture.version === 0 ||
			texture instanceof THREE.CompressedTexture ||
			texture instanceof THREE.DataTexture ) {

			return {
					canvas: undefined,
					version: texture.version
				}

		}

		var image = texture.image;

		var canvas = document.createElement( 'canvas' );
		canvas.width = image.width;
		canvas.height = image.height;

		var context = canvas.getContext( '2d' );
		context.setTransform( 1, 0, 0, - 1, 0, image.height );
		context.drawImage( image, 0, 0 );

		var repeatX = texture.wrapS === THREE.RepeatWrapping;
		var repeatY = texture.wrapT === THREE.RepeatWrapping;

		var repeat = 'no-repeat';

		if ( repeatX === true && repeatY === true ) {

			repeat = 'repeat';

		} else if ( repeatX === true ) {

			repeat = 'repeat-x';

		} else if ( repeatY === true ) {

			repeat = 'repeat-y';

		}

		return {
			canvas: _context.createPattern( canvas, repeat ),
			version: texture.version
		}

	}

	function patternPath( x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, texture ) {

		var pattern = _patterns[ texture.id ];

		if ( pattern === undefined || pattern.version !== texture.version ) {

			pattern = textureToPattern( texture );
			_patterns[ texture.id ] = pattern;

		}

		if ( pattern.canvas !== undefined ) {

			setFillStyle( pattern.canvas );

		} else {

			setFillStyle( 'rgba( 0, 0, 0, 1)' );
			_context.fill();
			return;

		}

		// http://extremelysatisfactorytotalitarianism.com/blog/?p=2120

		var a, b, c, d, e, f, det, idet,
		offsetX = texture.offset.x / texture.repeat.x,
		offsetY = texture.offset.y / texture.repeat.y,
		width = texture.image.width * texture.repeat.x,
		height = texture.image.height * texture.repeat.y;

		u0 = ( u0 + offsetX ) * width;
		v0 = ( v0 + offsetY ) * height;

		u1 = ( u1 + offsetX ) * width;
		v1 = ( v1 + offsetY ) * height;

		u2 = ( u2 + offsetX ) * width;
		v2 = ( v2 + offsetY ) * height;

		x1 -= x0; y1 -= y0;
		x2 -= x0; y2 -= y0;

		u1 -= u0; v1 -= v0;
		u2 -= u0; v2 -= v0;

		det = u1 * v2 - u2 * v1;

		if ( det === 0 ) return;

		idet = 1 / det;

		a = ( v2 * x1 - v1 * x2 ) * idet;
		b = ( v2 * y1 - v1 * y2 ) * idet;
		c = ( u1 * x2 - u2 * x1 ) * idet;
		d = ( u1 * y2 - u2 * y1 ) * idet;

		e = x0 - a * u0 - c * v0;
		f = y0 - b * u0 - d * v0;

		_context.save();
		_context.transform( a, b, c, d, e, f );
		_context.fill();
		_context.restore();

	}

	function clipImage( x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, image ) {

		// http://extremelysatisfactorytotalitarianism.com/blog/?p=2120

		var a, b, c, d, e, f, det, idet,
		width = image.width - 1,
		height = image.height - 1;

		u0 *= width; v0 *= height;
		u1 *= width; v1 *= height;
		u2 *= width; v2 *= height;

		x1 -= x0; y1 -= y0;
		x2 -= x0; y2 -= y0;

		u1 -= u0; v1 -= v0;
		u2 -= u0; v2 -= v0;

		det = u1 * v2 - u2 * v1;

		idet = 1 / det;

		a = ( v2 * x1 - v1 * x2 ) * idet;
		b = ( v2 * y1 - v1 * y2 ) * idet;
		c = ( u1 * x2 - u2 * x1 ) * idet;
		d = ( u1 * y2 - u2 * y1 ) * idet;

		e = x0 - a * u0 - c * v0;
		f = y0 - b * u0 - d * v0;

		_context.save();
		_context.transform( a, b, c, d, e, f );
		_context.clip();
		_context.drawImage( image, 0, 0 );
		_context.restore();

	}

	// Hide anti-alias gaps

	function expand( v1, v2, pixels ) {

		var x = v2.x - v1.x, y = v2.y - v1.y,
		det = x * x + y * y, idet;

		if ( det === 0 ) return;

		idet = pixels / Math.sqrt( det );

		x *= idet; y *= idet;

		v2.x += x; v2.y += y;
		v1.x -= x; v1.y -= y;

	}

	// Context cached methods.

	function setOpacity( value ) {

		if ( _contextGlobalAlpha !== value ) {

			_context.globalAlpha = value;
			_contextGlobalAlpha = value;

		}

	}

	function setBlending( value ) {

		if ( _contextGlobalCompositeOperation !== value ) {

			if ( value === THREE.NormalBlending ) {

				_context.globalCompositeOperation = 'source-over';

			} else if ( value === THREE.AdditiveBlending ) {

				_context.globalCompositeOperation = 'lighter';

			} else if ( value === THREE.SubtractiveBlending ) {

				_context.globalCompositeOperation = 'darker';

			}

			_contextGlobalCompositeOperation = value;

		}

	}

	function setLineWidth( value ) {

		if ( _contextLineWidth !== value ) {

			_context.lineWidth = value;
			_contextLineWidth = value;

		}

	}

	function setLineCap( value ) {

		// "butt", "round", "square"

		if ( _contextLineCap !== value ) {

			_context.lineCap = value;
			_contextLineCap = value;

		}

	}

	function setLineJoin( value ) {

		// "round", "bevel", "miter"

		if ( _contextLineJoin !== value ) {

			_context.lineJoin = value;
			_contextLineJoin = value;

		}

	}

	function setStrokeStyle( value ) {

		if ( _contextStrokeStyle !== value ) {

			_context.strokeStyle = value;
			_contextStrokeStyle = value;

		}

	}

	function setFillStyle( value ) {

		if ( _contextFillStyle !== value ) {

			_context.fillStyle = value;
			_contextFillStyle = value;

		}

	}

	function setLineDash( value ) {

		if ( _contextLineDash.length !== value.length ) {

			_context.setLineDash( value );
			_contextLineDash = value;

		}

	}

};

// File:examples/js/renderers/RaytracingRenderer.js

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RaytracingRenderer = function ( parameters ) {

	console.log( 'THREE.RaytracingRenderer', THREE.REVISION );

	parameters = parameters || {};

	var scope = this;

	var canvas = document.createElement( 'canvas' );
	var context = canvas.getContext( '2d', {
		alpha: parameters.alpha === true
	} );

	var maxRecursionDepth = 3;

	var canvasWidth, canvasHeight;
	var canvasWidthHalf, canvasHeightHalf;

	var clearColor = new THREE.Color( 0x000000 );

	var origin = new THREE.Vector3();
	var direction = new THREE.Vector3();

	var cameraPosition = new THREE.Vector3();

	var raycaster = new THREE.Raycaster( origin, direction );
	var raycasterLight = new THREE.Raycaster();

	var perspective;
	var modelViewMatrix = new THREE.Matrix4();
	var cameraNormalMatrix = new THREE.Matrix3();

	var objects;
	var lights = [];
	var cache = {};

	var animationFrameId = null;

	this.domElement = canvas;

	this.autoClear = true;

	this.setClearColor = function ( color, alpha ) {

		clearColor.set( color );

	};

	this.setPixelRatio = function () {};

	this.setSize = function ( width, height ) {

		canvas.width = width;
		canvas.height = height;

		canvasWidth = canvas.width;
		canvasHeight = canvas.height;

		canvasWidthHalf = Math.floor( canvasWidth / 2 );
		canvasHeightHalf = Math.floor( canvasHeight / 2 );

		context.fillStyle = 'white';

	};

	this.setSize( canvas.width, canvas.height );

	this.clear = function () {

	};

	//

	var spawnRay = ( function () {

		var diffuseColor = new THREE.Color();
		var specularColor = new THREE.Color();
		var lightColor = new THREE.Color();
		var schlick = new THREE.Color();

		var lightContribution = new THREE.Color();

		var eyeVector = new THREE.Vector3();
		var lightVector = new THREE.Vector3();
		var normalVector = new THREE.Vector3();
		var halfVector = new THREE.Vector3();

		var localPoint = new THREE.Vector3();
		var reflectionVector = new THREE.Vector3();

		var tmpVec = new THREE.Vector3();

		var tmpColor = [];

		for ( var i = 0; i < maxRecursionDepth; i ++ ) {

			tmpColor[ i ] = new THREE.Color();

		}

		return function spawnRay( rayOrigin, rayDirection, outputColor, recursionDepth ) {

			var ray = raycaster.ray;

			ray.origin = rayOrigin;
			ray.direction = rayDirection;

			//

			var rayLight = raycasterLight.ray;

			//

			outputColor.setRGB( 0, 0, 0 );

			//

			var intersections = raycaster.intersectObjects( objects, true );

			// ray didn't find anything
			// (here should come setting of background color?)

			if ( intersections.length === 0 ) {

				return;

			}

			// ray hit

			var intersection = intersections[ 0 ];

			var point = intersection.point;
			var object = intersection.object;
			var material = object.material;
			var face = intersection.face;

			var vertices = object.geometry.vertices;

			//

			var _object = cache[ object.id ];

			localPoint.copy( point ).applyMatrix4( _object.inverseMatrix );
			eyeVector.subVectors( raycaster.ray.origin, point ).normalize();

			// resolve pixel diffuse color

			if ( material instanceof THREE.MeshLambertMaterial ||
				 material instanceof THREE.MeshPhongMaterial ||
				 material instanceof THREE.MeshBasicMaterial ) {

				diffuseColor.copyGammaToLinear( material.color );

			} else {

				diffuseColor.setRGB( 1, 1, 1 );

			}

			if ( material.vertexColors === THREE.FaceColors ) {

				diffuseColor.multiply( face.color );

			}

			// compute light shading

			rayLight.origin.copy( point );

			if ( material instanceof THREE.MeshBasicMaterial ) {

				for ( var i = 0, l = lights.length; i < l; i ++ ) {

					var light = lights[ i ];

					lightVector.setFromMatrixPosition( light.matrixWorld );
					lightVector.sub( point );

					rayLight.direction.copy( lightVector ).normalize();

					var intersections = raycasterLight.intersectObjects( objects, true );

					// point in shadow

					if ( intersections.length > 0 ) continue;

					// point visible

					outputColor.add( diffuseColor );

				}

			} else if ( material instanceof THREE.MeshLambertMaterial ||
						material instanceof THREE.MeshPhongMaterial ) {

				var normalComputed = false;

				for ( var i = 0, l = lights.length; i < l; i ++ ) {

					var light = lights[ i ];

					lightColor.copyGammaToLinear( light.color );

					lightVector.setFromMatrixPosition( light.matrixWorld );
					lightVector.sub( point );

					rayLight.direction.copy( lightVector ).normalize();

					var intersections = raycasterLight.intersectObjects( objects, true );

					// point in shadow

					if ( intersections.length > 0 ) continue;

					// point lit

					if ( normalComputed === false ) {

						// the same normal can be reused for all lights
						// (should be possible to cache even more)

						computePixelNormal( normalVector, localPoint, material.shading, face, vertices );
						normalVector.applyMatrix3( _object.normalMatrix ).normalize();

						normalComputed = true;

					}

					// compute attenuation

					var attenuation = 1.0;

					if ( light.physicalAttenuation === true ) {

						attenuation = lightVector.length();
						attenuation = 1.0 / ( attenuation * attenuation );

					}

					lightVector.normalize();

					// compute diffuse

					var dot = Math.max( normalVector.dot( lightVector ), 0 );
					var diffuseIntensity = dot * light.intensity;

					lightContribution.copy( diffuseColor );
					lightContribution.multiply( lightColor );
					lightContribution.multiplyScalar( diffuseIntensity * attenuation );

					outputColor.add( lightContribution );

					// compute specular

					if ( material instanceof THREE.MeshPhongMaterial ) {

						halfVector.addVectors( lightVector, eyeVector ).normalize();

						var dotNormalHalf = Math.max( normalVector.dot( halfVector ), 0.0 );
						var specularIntensity = Math.max( Math.pow( dotNormalHalf, material.shininess ), 0.0 ) * diffuseIntensity;

						var specularNormalization = ( material.shininess + 2.0 ) / 8.0;

						specularColor.copyGammaToLinear( material.specular );

						var alpha = Math.pow( Math.max( 1.0 - lightVector.dot( halfVector ), 0.0 ), 5.0 );

						schlick.r = specularColor.r + ( 1.0 - specularColor.r ) * alpha;
						schlick.g = specularColor.g + ( 1.0 - specularColor.g ) * alpha;
						schlick.b = specularColor.b + ( 1.0 - specularColor.b ) * alpha;

						lightContribution.copy( schlick );

						lightContribution.multiply( lightColor );
						lightContribution.multiplyScalar( specularNormalization * specularIntensity * attenuation );
						outputColor.add( lightContribution );

					}

				}

			}

			// reflection / refraction

			var reflectivity = material.reflectivity;

			if ( ( material.mirror || material.glass ) && reflectivity > 0 && recursionDepth < maxRecursionDepth ) {

				if ( material.mirror ) {

					reflectionVector.copy( rayDirection );
					reflectionVector.reflect( normalVector );

				} else if ( material.glass ) {

					var eta = material.refractionRatio;

					var dotNI = rayDirection.dot( normalVector );
					var k = 1.0 - eta * eta * ( 1.0 - dotNI * dotNI );

					if ( k < 0.0 ) {

						reflectionVector.set( 0, 0, 0 );

					} else {

						reflectionVector.copy( rayDirection );
						reflectionVector.multiplyScalar( eta );

						var alpha = eta * dotNI + Math.sqrt( k );
						tmpVec.copy( normalVector );
						tmpVec.multiplyScalar( alpha );
						reflectionVector.sub( tmpVec );

					}

				}

				var theta = Math.max( eyeVector.dot( normalVector ), 0.0 );
				var rf0 = reflectivity;
				var fresnel = rf0 + ( 1.0 - rf0 ) * Math.pow( ( 1.0 - theta ), 5.0 );

				var weight = fresnel;

				var zColor = tmpColor[ recursionDepth ];

				spawnRay( point, reflectionVector, zColor, recursionDepth + 1 );

				if ( material.specular !== undefined ) {

					zColor.multiply( material.specular );

				}

				zColor.multiplyScalar( weight );
				outputColor.multiplyScalar( 1 - weight );
				outputColor.add( zColor );

			}

		};

	}() );

	var computePixelNormal = ( function () {

		var tmpVec1 = new THREE.Vector3();
		var tmpVec2 = new THREE.Vector3();
		var tmpVec3 = new THREE.Vector3();

		return function computePixelNormal( outputVector, point, shading, face, vertices ) {

			var faceNormal = face.normal;
			var vertexNormals = face.vertexNormals;

			if ( shading === THREE.FlatShading ) {

				outputVector.copy( faceNormal );

			} else if ( shading === THREE.SmoothShading ) {

				// compute barycentric coordinates

				var vA = vertices[ face.a ];
				var vB = vertices[ face.b ];
				var vC = vertices[ face.c ];

				tmpVec3.crossVectors( tmpVec1.subVectors( vB, vA ), tmpVec2.subVectors( vC, vA ) );
				var areaABC = faceNormal.dot( tmpVec3 );

				tmpVec3.crossVectors( tmpVec1.subVectors( vB, point ), tmpVec2.subVectors( vC, point ) );
				var areaPBC = faceNormal.dot( tmpVec3 );
				var a = areaPBC / areaABC;

				tmpVec3.crossVectors( tmpVec1.subVectors( vC, point ), tmpVec2.subVectors( vA, point ) );
				var areaPCA = faceNormal.dot( tmpVec3 );
				var b = areaPCA / areaABC;

				var c = 1.0 - a - b;

				// compute interpolated vertex normal

				tmpVec1.copy( vertexNormals[ 0 ] );
				tmpVec1.multiplyScalar( a );

				tmpVec2.copy( vertexNormals[ 1 ] );
				tmpVec2.multiplyScalar( b );

				tmpVec3.copy( vertexNormals[ 2 ] );
				tmpVec3.multiplyScalar( c );

				outputVector.addVectors( tmpVec1, tmpVec2 );
				outputVector.add( tmpVec3 );

			}

		};

	}() );

	var renderBlock = ( function () {

		var blockSize = 64;

		var canvasBlock = document.createElement( 'canvas' );
		canvasBlock.width = blockSize;
		canvasBlock.height = blockSize;

		var contextBlock = canvasBlock.getContext( '2d', {

			alpha: parameters.alpha === true

		} );

		var imagedata = contextBlock.getImageData( 0, 0, blockSize, blockSize );
		var data = imagedata.data;

		var pixelColor = new THREE.Color();

		return function renderBlock( blockX, blockY ) {

			var index = 0;

			for ( var y = 0; y < blockSize; y ++ ) {

				for ( var x = 0; x < blockSize; x ++, index += 4 ) {

					// spawn primary ray at pixel position

					origin.copy( cameraPosition );

					direction.set( x + blockX - canvasWidthHalf, - ( y + blockY - canvasHeightHalf ), - perspective );
					direction.applyMatrix3( cameraNormalMatrix ).normalize();

					spawnRay( origin, direction, pixelColor, 0 );

					// convert from linear to gamma

					data[ index ]     = Math.sqrt( pixelColor.r ) * 255;
					data[ index + 1 ] = Math.sqrt( pixelColor.g ) * 255;
					data[ index + 2 ] = Math.sqrt( pixelColor.b ) * 255;

				}

			}

			context.putImageData( imagedata, blockX, blockY );

			blockX += blockSize;

			if ( blockX >= canvasWidth ) {

				blockX = 0;
				blockY += blockSize;

				if ( blockY >= canvasHeight ) {

					scope.dispatchEvent( { type: "complete" } );
					return;

				}

			}

			context.fillRect( blockX, blockY, blockSize, blockSize );

			animationFrameId = requestAnimationFrame( function () {

				renderBlock( blockX, blockY );

			} );

		};

	}() );

	this.render = function ( scene, camera ) {

		if ( this.autoClear === true ) this.clear();

		cancelAnimationFrame( animationFrameId );

		// update scene graph

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

		// update camera matrices

		if ( camera.parent === null ) camera.updateMatrixWorld();

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );
		cameraPosition.setFromMatrixPosition( camera.matrixWorld );

		//

		cameraNormalMatrix.getNormalMatrix( camera.matrixWorld );
		origin.copy( cameraPosition );

		perspective = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * canvasHeight;

		objects = scene.children;

		// collect lights and set up object matrices

		lights.length = 0;

		scene.traverse( function ( object ) {

			if ( object instanceof THREE.Light ) {

				lights.push( object );

			}

			if ( cache[ object.id ] === undefined ) {

				cache[ object.id ] = {
					normalMatrix: new THREE.Matrix3(),
					inverseMatrix: new THREE.Matrix4()
				};

			}

			modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );

			var _object = cache[ object.id ];

			_object.normalMatrix.getNormalMatrix( modelViewMatrix );
			_object.inverseMatrix.getInverse( object.matrixWorld );

		} );

		renderBlock( 0, 0 );

	};

};

THREE.EventDispatcher.prototype.apply( THREE.RaytracingRenderer.prototype );

// File:examples/js/renderers/SoftwareRenderer.js

/**
 * @author mrdoob / http://mrdoob.com/
 * @author ryg / http://farbrausch.de/~fg
 * @author mraleph / http://mrale.ph/
 * @author daoshengmu / http://dsmu.me/
 */

THREE.SoftwareRenderer = function ( parameters ) {

	console.log( 'THREE.SoftwareRenderer', THREE.REVISION );

	parameters = parameters || {};

	var canvas = parameters.canvas !== undefined
			 ? parameters.canvas
			 : document.createElement( 'canvas' );

	var context = canvas.getContext( '2d', {
		alpha: parameters.alpha === true
	} );

	var shaders = {};
	var textures = {};

	var canvasWidth, canvasHeight;
	var canvasWBlocks, canvasHBlocks;
	var viewportXScale, viewportYScale, viewportZScale;
	var viewportXOffs, viewportYOffs, viewportZOffs;

	var clearColor = new THREE.Color( 0x000000 );

	var imagedata, data, zbuffer;
	var numBlocks, blockMaxZ, blockFlags;

	var BLOCK_ISCLEAR = ( 1 << 0 );
	var BLOCK_NEEDCLEAR = ( 1 << 1 );

	var subpixelBits = 4;
	var subpixelBias = ( 1 << subpixelBits ) - 1;
	var blockShift = 3;
	var blockSize = 1 << blockShift;
	var maxZVal = ( 1 << 24 ); // Note: You want to size this so you don't get overflows.
	var lineMode = false;
	var lookVector = new THREE.Vector3( 0, 0, 1 );
	var crossVector = new THREE.Vector3();        
    
	var rectx1 = Infinity, recty1 = Infinity;
	var rectx2 = 0, recty2 = 0;

	var prevrectx1 = Infinity, prevrecty1 = Infinity;
	var prevrectx2 = 0, prevrecty2 = 0;

	var projector = new THREE.Projector();

	var vector1 = new THREE.Vector3();
	var vector2 = new THREE.Vector3();
	var vector3 = new THREE.Vector3();

	var texCoord1 = new THREE.Vector2();
	var texCoord2 = new THREE.Vector2();
	var texCoord3 = new THREE.Vector2();

	this.domElement = canvas;

	this.autoClear = true;

	// WebGLRenderer compatibility

	this.supportsVertexTextures = function () {};
	this.setFaceCulling = function () {};

	this.setClearColor = function ( color, alpha ) {

		clearColor.set( color );
		cleanColorBuffer();

	};

	this.setPixelRatio = function () {};

	this.setSize = function ( width, height ) {

		canvasWBlocks = Math.floor( width / blockSize );
		canvasHBlocks = Math.floor( height / blockSize );
		canvasWidth   = canvasWBlocks * blockSize;
		canvasHeight  = canvasHBlocks * blockSize;

		var fixScale = 1 << subpixelBits;

		viewportXScale =  fixScale * canvasWidth  / 2;
		viewportYScale = - fixScale * canvasHeight / 2;
		viewportZScale =             maxZVal      / 2;

		viewportXOffs  =  fixScale * canvasWidth  / 2 + 0.5;
		viewportYOffs  =  fixScale * canvasHeight / 2 + 0.5;
		viewportZOffs  =             maxZVal      / 2 + 0.5;

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		context.fillStyle = clearColor.getStyle();
		context.fillRect( 0, 0, canvasWidth, canvasHeight );

		imagedata = context.getImageData( 0, 0, canvasWidth, canvasHeight );
		data = imagedata.data;

		zbuffer = new Int32Array( data.length / 4 );

		numBlocks = canvasWBlocks * canvasHBlocks;
		blockMaxZ = new Int32Array( numBlocks );
		blockFlags = new Uint8Array( numBlocks );

		for ( var i = 0, l = zbuffer.length; i < l; i ++ ) {

			zbuffer[ i ] = maxZVal;

		}

		for ( var i = 0; i < numBlocks; i ++ ) {

			blockFlags[ i ] = BLOCK_ISCLEAR;

		}

		cleanColorBuffer();

	};

	this.setSize( canvas.width, canvas.height );

	this.clear = function () {

		rectx1 = Infinity;
		recty1 = Infinity;
		rectx2 = 0;
		recty2 = 0;

		for ( var i = 0; i < numBlocks; i ++ ) {

			blockMaxZ[ i ] = maxZVal;
			blockFlags[ i ] = ( blockFlags[ i ] & BLOCK_ISCLEAR ) ? BLOCK_ISCLEAR : BLOCK_NEEDCLEAR;

		}

	};

    // TODO: Check why autoClear can't be false.
	this.render = function ( scene, camera ) {

		if ( this.autoClear === true ) this.clear();

		var renderData = projector.projectScene( scene, camera, false, false );
		var elements = renderData.elements;

		for ( var e = 0, el = elements.length; e < el; e ++ ) {

			var element = elements[ e ];
			var material = element.material;
			var shader = getMaterialShader( material );

			if ( element instanceof THREE.RenderableFace ) {

				if ( ! element.uvs ) {

					drawTriangle(
						element.v1.positionScreen,
						element.v2.positionScreen,
						element.v3.positionScreen,
						null, null, null,
						shader, element, material
					);

				} else {

					drawTriangle(
						element.v1.positionScreen,
						element.v2.positionScreen,
						element.v3.positionScreen,
						element.uvs[ 0 ], element.uvs[ 1 ], element.uvs[ 2 ],
						shader, element, material
					);

				}


			} else if ( element instanceof THREE.RenderableSprite ) {

				var scaleX = element.scale.x * 0.5;
				var scaleY = element.scale.y * 0.5;

				vector1.copy( element );
				vector1.x -= scaleX;
				vector1.y += scaleY;

				vector2.copy( element );
				vector2.x -= scaleX;
				vector2.y -= scaleY;

				vector3.copy( element );
				vector3.x += scaleX;
				vector3.y += scaleY;

				if ( material.map ) {

					texCoord1.set( 0, 1 );
					texCoord2.set( 0, 0 );
					texCoord3.set( 1, 1 );

					drawTriangle(
						vector1, vector2, vector3,
						texCoord1, texCoord2, texCoord3,
						shader, element, material
					);

				} else {

					drawTriangle(
						vector1, vector2, vector3,
						null, null, null,
						shader, element, material
					);

				}

				vector1.copy( element );
				vector1.x += scaleX;
				vector1.y += scaleY;

				vector2.copy( element );
				vector2.x -= scaleX;
				vector2.y -= scaleY;

				vector3.copy( element );
				vector3.x += scaleX;
				vector3.y -= scaleY;

				if ( material.map ) {

					texCoord1.set( 1, 1 );
					texCoord2.set( 0, 0 );
					texCoord3.set( 1, 0 );

					drawTriangle(
						vector1, vector2, vector3,
						texCoord1, texCoord2, texCoord3,
						shader, element, material
					);

				} else {

					drawTriangle(
						vector1, vector2, vector3,
						null, null, null,
						shader, element, material
					);

				}

			} else if ( element instanceof THREE.RenderableLine ) {
				
				var shader = getMaterialShader( material );

				drawLine(
					element.v1.positionScreen,
					element.v2.positionScreen,
					element.vertexColors[0],
					element.vertexColors[1],
					shader,
					material
				);
			}

		}

		finishClear();

		var x = Math.min( rectx1, prevrectx1 );
		var y = Math.min( recty1, prevrecty1 );
		var width = Math.max( rectx2, prevrectx2 ) - x;
		var height = Math.max( recty2, prevrecty2 ) - y;

		/*
		// debug; draw zbuffer

		for ( var i = 0, l = zbuffer.length; i < l; i++ ) {

			var o = i * 4;
			var v = (65535 - zbuffer[ i ]) >> 3;
			data[ o + 0 ] = v;
			data[ o + 1 ] = v;
			data[ o + 2 ] = v;
			data[ o + 3 ] = 255;
		}
		*/

		if ( x !== Infinity ) {

			context.putImageData( imagedata, 0, 0, x, y, width, height );

		}

		prevrectx1 = rectx1; prevrecty1 = recty1;
		prevrectx2 = rectx2; prevrecty2 = recty2;

	};

	function setSize( width, height ) {
        
		canvasWBlocks = Math.floor( width / blockSize );
		canvasHBlocks = Math.floor( height / blockSize );
		canvasWidth   = canvasWBlocks * blockSize;
		canvasHeight  = canvasHBlocks * blockSize;

		var fixScale = 1 << subpixelBits;

		viewportXScale =  fixScale * canvasWidth  / 2;
		viewportYScale = -fixScale * canvasHeight / 2;
		viewportZScale =             maxZVal      / 2;
              
		viewportXOffs  =  fixScale * canvasWidth  / 2 + 0.5;
		viewportYOffs  =  fixScale * canvasHeight / 2 + 0.5;
		viewportZOffs  =             maxZVal      / 2 + 0.5;
        
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		context.fillStyle = clearColor.getStyle();
		context.fillRect( 0, 0, canvasWidth, canvasHeight );

		imagedata = context.getImageData( 0, 0, canvasWidth, canvasHeight );
		data = imagedata.data;

		zbuffer = new Int32Array( data.length / 4 );

		numBlocks = canvasWBlocks * canvasHBlocks;
		blockMaxZ = new Int32Array( numBlocks );
		blockFlags = new Uint8Array( numBlocks );

		for ( var i = 0, l = zbuffer.length; i < l; i ++ ) {

			zbuffer[ i ] = maxZVal;

		}

		for ( var i = 0; i < numBlocks; i ++ ) {

			blockFlags[ i ] = BLOCK_ISCLEAR;

		}

		cleanColorBuffer();
	}
    
	function cleanColorBuffer() {

		var size = canvasWidth * canvasHeight * 4;

		for ( var i = 0; i < size; i += 4 ) {

			data[ i ] = clearColor.r * 255 | 0;
			data[ i + 1 ] = clearColor.g * 255 | 0;
			data[ i + 2 ] = clearColor.b * 255 | 0;
			data[ i + 3 ] = 255;

		}

		context.fillStyle = clearColor.getStyle();
		context.fillRect( 0, 0, canvasWidth, canvasHeight );

	}

	function getPalette( material, bSimulateSpecular ) {

		var i = 0, j = 0;
		var diffuseR = material.color.r * 255;
		var diffuseG = material.color.g * 255;
		var diffuseB = material.color.b * 255;
		var palette = new Uint8Array( 256 * 3 );

		if ( bSimulateSpecular ) {

			while ( i < 204 ) {

				palette[ j ++ ] = Math.min( i * diffuseR / 204, 255 );
				palette[ j ++ ] = Math.min( i * diffuseG / 204, 255 );
				palette[ j ++ ] = Math.min( i * diffuseB / 204, 255 );
				++ i;

			}

			while ( i < 256 ) {

				// plus specular highlight
				palette[ j ++ ] = Math.min( diffuseR + ( i - 204 ) * ( 255 - diffuseR ) / 82, 255 );
				palette[ j ++ ] = Math.min( diffuseG + ( i - 204 ) * ( 255 - diffuseG ) / 82, 255 );
				palette[ j ++ ] = Math.min( diffuseB + ( i - 204 ) * ( 255 - diffuseB ) / 82, 255 );
				++ i;

			}

		} else {

			while ( i < 256 ) {

				palette[ j ++ ] = Math.min( i * diffuseR / 255, 255 );
				palette[ j ++ ] = Math.min( i * diffuseG / 255, 255 );
				palette[ j ++ ] = Math.min( i * diffuseB / 255, 255 );
				++ i;

			}

		}

		return palette;

	}

	function basicMaterialShader( buffer, depthBuf, offset, depth, u, v, n, face, material ) {

		var colorOffset = offset * 4;

		var texture = textures[ material.map.id ];

		if ( ! texture.data )
			return;

		var tdim = texture.width;
		var isTransparent = material.transparent;
		var tbound = tdim - 1;
		var tdata = texture.data;
		var tIndex = ( ( ( v * tdim ) & tbound ) * tdim + ( ( u * tdim ) & tbound ) ) * 4;

		if ( ! isTransparent ) {

			buffer[ colorOffset ] = tdata[ tIndex ];
			buffer[ colorOffset + 1 ] = tdata[ tIndex + 1 ];
			buffer[ colorOffset + 2 ] = tdata[ tIndex + 2 ];
			buffer[ colorOffset + 3 ] = material.opacity * 255;
			depthBuf[ offset ] = depth;

		} else {

			var opaci = tdata[ tIndex + 3 ] * material.opacity;
			var texel = ( tdata[ tIndex ] << 16 ) + ( tdata[ tIndex + 1 ] << 8 ) + tdata[ tIndex + 2 ];
			if ( opaci < 250 ) {

				var backColor = ( buffer[ colorOffset ] << 16 ) + ( buffer[ colorOffset + 1 ] << 8 ) + buffer[ colorOffset + 2 ];
				texel = texel * opaci + backColor * ( 1 - opaci );

			}

			buffer[ colorOffset ] = ( texel & 0xff0000 ) >> 16;
			buffer[ colorOffset + 1 ] = ( texel & 0xff00 ) >> 8;
			buffer[ colorOffset + 2 ] = texel & 0xff;
			buffer[ colorOffset + 3 ] = material.opacity * 255;

		}

	}

	function lightingMaterialShader( buffer, depthBuf, offset, depth, u, v, n, face, material ) {

		var colorOffset = offset * 4;

		var texture = textures[ material.map.id ];

		if ( ! texture.data )
			return;

		var tdim = texture.width;
		var isTransparent = material.transparent;
		var cIndex = ( n > 0 ? ( ~~ n ) : 0 ) * 3;
		var tbound = tdim - 1;
		var tdata = texture.data;
		var tIndex = ( ( ( v * tdim ) & tbound ) * tdim + ( ( u * tdim ) & tbound ) ) * 4;

		if ( ! isTransparent ) {

			buffer[ colorOffset ] = ( material.palette[ cIndex ] * tdata[ tIndex ] ) >> 8;
			buffer[ colorOffset + 1 ] = ( material.palette[ cIndex + 1 ] * tdata[ tIndex + 1 ] ) >> 8;
			buffer[ colorOffset + 2 ] = ( material.palette[ cIndex + 2 ] * tdata[ tIndex + 2 ] ) >> 8;
			buffer[ colorOffset + 3 ] = material.opacity * 255;
			depthBuf[ offset ] = depth;

		} else {

			var opaci = tdata[ tIndex + 3 ] * material.opacity;
			var foreColor = ( ( material.palette[ cIndex ] * tdata[ tIndex ] ) << 16 )
							+ ( ( material.palette[ cIndex + 1 ] * tdata[ tIndex + 1 ] ) << 8 )
							+ ( material.palette[ cIndex + 2 ] * tdata[ tIndex + 2 ] );

			if ( opaci < 250 ) {

				var backColor = buffer[ colorOffset ] << 24 + buffer[ colorOffset + 1 ] << 16 + buffer[ colorOffset + 2 ] << 8;
				foreColor = foreColor * opaci + backColor * ( 1 - opaci );

			}

			buffer[ colorOffset ] = ( foreColor & 0xff0000 ) >> 16;
			buffer[ colorOffset + 1 ] = ( foreColor & 0xff00 ) >> 8;
			buffer[ colorOffset + 2 ] = ( foreColor & 0xff );
			buffer[ colorOffset + 3 ] = material.opacity * 255;

		}

	}

	function onMaterialUpdate ( event ) {

		var material = event.target;

		material.removeEventListener( 'update', onMaterialUpdate );

		delete shaders[ material.id ];

	}

	function getMaterialShader( material ) {

		var id = material.id;
		var shader = shaders[ id ];

		if ( shaders[ id ] === undefined ) {

			material.addEventListener( 'update', onMaterialUpdate );

			if ( material instanceof THREE.MeshBasicMaterial ||
				material instanceof THREE.MeshLambertMaterial ||
				material instanceof THREE.MeshPhongMaterial ||
				material instanceof THREE.SpriteMaterial ) {

				if ( material instanceof THREE.MeshLambertMaterial ) {

					// Generate color palette
					if ( ! material.palette ) {

						material.palette = getPalette( material, false );

					}

				} else if ( material instanceof THREE.MeshPhongMaterial ) {

					// Generate color palette
					if ( ! material.palette ) {

						material.palette = getPalette( material, true );

					}

				}

				var string;

				if ( material.map ) {

					var texture = new THREE.SoftwareRenderer.Texture();
					texture.fromImage( material.map.image );

					textures[ material.map.id ] = texture;

					if ( material instanceof THREE.MeshBasicMaterial
						|| material instanceof THREE.SpriteMaterial ) {

						shader = basicMaterialShader;

					} else {

						shader = lightingMaterialShader;

					}


				} else {

					if ( material.vertexColors === THREE.FaceColors ) {

						string = [
							'var colorOffset = offset * 4;',
							'buffer[ colorOffset ] = face.color.r * 255;',
							'buffer[ colorOffset + 1 ] = face.color.g * 255;',
							'buffer[ colorOffset + 2 ] = face.color.b * 255;',
							'buffer[ colorOffset + 3 ] = material.opacity * 255;',
							'depthBuf[ offset ] = depth;'
						].join( '\n' );

					} else {

						string = [
							'var colorOffset = offset * 4;',
							'buffer[ colorOffset ] = material.color.r * 255;',
							'buffer[ colorOffset + 1 ] = material.color.g * 255;',
							'buffer[ colorOffset + 2 ] = material.color.b * 255;',
							'buffer[ colorOffset + 3 ] = material.opacity * 255;',
							'depthBuf[ offset ] = depth;'
						].join( '\n' );

					}

					shader = new Function( 'buffer, depthBuf, offset, depth, u, v, n, face, material', string );

				}

			} else if ( material instanceof THREE.LineBasicMaterial ) {
                
				var string = [
					'var colorOffset = offset * 4;',
					'buffer[ colorOffset ] = material.color.r * (color1.r+color2.r) * 0.5 * 255;',
					'buffer[ colorOffset + 1 ] = material.color.g * (color1.g+color2.g) * 0.5 * 255;',
					'buffer[ colorOffset + 2 ] = material.color.b * (color1.b+color2.b) * 0.5 * 255;',
					'buffer[ colorOffset + 3 ] = 255;',
					'depthBuf[ offset ] = depth;'
				].join('\n');

				shader = new Function( 'buffer, depthBuf, offset, depth, color1, color2, material', string );

			} else {

				var string = [
					'var colorOffset = offset * 4;',
					'buffer[ colorOffset ] = u * 255;',
					'buffer[ colorOffset + 1 ] = v * 255;',
					'buffer[ colorOffset + 2 ] = 0;',
					'buffer[ colorOffset + 3 ] = 255;',
					'depthBuf[ offset ] = depth;'
				].join( '\n' );

				shader = new Function( 'buffer, depthBuf, offset, depth, u, v, n, face, material', string );

			}

			shaders[ id ] = shader;

		}

		return shader;

	}

	function clearRectangle( x1, y1, x2, y2 ) {

		var xmin = Math.max( Math.min( x1, x2 ), 0 );
		var xmax = Math.min( Math.max( x1, x2 ), canvasWidth );
		var ymin = Math.max( Math.min( y1, y2 ), 0 );
		var ymax = Math.min( Math.max( y1, y2 ), canvasHeight );

		var offset = ( xmin + ymin * canvasWidth ) * 4 + 3;
		var linestep = ( canvasWidth - ( xmax - xmin ) ) * 4;

		for ( var y = ymin; y < ymax; y ++ ) {

			for ( var x = xmin; x < xmax; x ++ ) {

				data[ offset += 4 ] = 0;

			}

			offset += linestep;

		}

	}

	function drawTriangle( v1, v2, v3, uv1, uv2, uv3, shader, face, material ) {

		// TODO: Implement per-pixel z-clipping

		if ( v1.z < - 1 || v1.z > 1 || v2.z < - 1 || v2.z > 1 || v3.z < - 1 || v3.z > 1 ) return;

		// https://gist.github.com/2486101
		// explanation: http://pouet.net/topic.php?which=8760&page=1

		// 28.4 fixed-point coordinates

		var x1 = ( v1.x * viewportXScale + viewportXOffs ) | 0;
		var x2 = ( v2.x * viewportXScale + viewportXOffs ) | 0;
		var x3 = ( v3.x * viewportXScale + viewportXOffs ) | 0;

		var y1 = ( v1.y * viewportYScale + viewportYOffs ) | 0;
		var y2 = ( v2.y * viewportYScale + viewportYOffs ) | 0;
		var y3 = ( v3.y * viewportYScale + viewportYOffs ) | 0;

		// Z values (.28 fixed-point)

		var z1 = ( v1.z * viewportZScale + viewportZOffs ) | 0;
		var z2 = ( v2.z * viewportZScale + viewportZOffs ) | 0;
		var z3 = ( v3.z * viewportZScale + viewportZOffs ) | 0;

		// UV values
		var bHasUV = false;
		var tu1, tv1, tu2, tv2, tu3, tv3;

		if ( uv1 && uv2 && uv3 ) {

			bHasUV = true;

			tu1 = uv1.x;
			tv1 = 1 - uv1.y;
			tu2 = uv2.x;
			tv2 = 1 - uv2.y;
			tu3 = uv3.x;
			tv3 = 1 - uv3.y;

		}

		// Normal values
		var bHasNormal = false;
		var n1, n2, n3, nz1, nz2, nz3;

		if ( face.vertexNormalsModel ) {

			bHasNormal = true;

			n1 = face.vertexNormalsModel[ 0 ];
			n2 = face.vertexNormalsModel[ 1 ];
			n3 = face.vertexNormalsModel[ 2 ];
			nz1 = n1.z * 255;
			nz2 = n2.z * 255;
			nz3 = n3.z * 255;

		}

		// Deltas

		var dx12 = x1 - x2, dy12 = y2 - y1;
		var dx23 = x2 - x3, dy23 = y3 - y2;
		var dx31 = x3 - x1, dy31 = y1 - y3;

		// Bounding rectangle

		var minx = Math.max( ( Math.min( x1, x2, x3 ) + subpixelBias ) >> subpixelBits, 0 );
		var maxx = Math.min( ( Math.max( x1, x2, x3 ) + subpixelBias ) >> subpixelBits, canvasWidth );
		var miny = Math.max( ( Math.min( y1, y2, y3 ) + subpixelBias ) >> subpixelBits, 0 );
		var maxy = Math.min( ( Math.max( y1, y2, y3 ) + subpixelBias ) >> subpixelBits, canvasHeight );

		rectx1 = Math.min( minx, rectx1 );
		rectx2 = Math.max( maxx, rectx2 );
		recty1 = Math.min( miny, recty1 );
		recty2 = Math.max( maxy, recty2 );

		// Block size, standard 8x8 (must be power of two)

		var q = blockSize;

		// Start in corner of 8x8 block

		minx &= ~ ( q - 1 );
		miny &= ~ ( q - 1 );

		// Constant part of half-edge functions

		var minXfixscale = ( minx << subpixelBits );
		var minYfixscale = ( miny << subpixelBits );

		var c1 = dy12 * ( ( minXfixscale ) - x1 ) + dx12 * ( ( minYfixscale ) - y1 );
		var c2 = dy23 * ( ( minXfixscale ) - x2 ) + dx23 * ( ( minYfixscale ) - y2 );
		var c3 = dy31 * ( ( minXfixscale ) - x3 ) + dx31 * ( ( minYfixscale ) - y3 );

		// Correct for fill convention

		if ( dy12 > 0 || ( dy12 == 0 && dx12 > 0 ) ) c1 ++;
		if ( dy23 > 0 || ( dy23 == 0 && dx23 > 0 ) ) c2 ++;
		if ( dy31 > 0 || ( dy31 == 0 && dx31 > 0 ) ) c3 ++;

		// Note this doesn't kill subpixel precision, but only because we test for >=0 (not >0).
		// It's a bit subtle. :)
		c1 = ( c1 - 1 ) >> subpixelBits;
		c2 = ( c2 - 1 ) >> subpixelBits;
		c3 = ( c3 - 1 ) >> subpixelBits;

		// Z interpolation setup

		var dz12 = z1 - z2, dz31 = z3 - z1;
		var invDet = 1.0 / ( dx12 * dy31 - dx31 * dy12 );
		var dzdx = ( invDet * ( dz12 * dy31 - dz31 * dy12 ) ); // dz per one subpixel step in x
		var dzdy = ( invDet * ( dz12 * dx31 - dx12 * dz31 ) ); // dz per one subpixel step in y

		// Z at top/left corner of rast area

		var cz = ( z1 + ( ( minXfixscale ) - x1 ) * dzdx + ( ( minYfixscale ) - y1 ) * dzdy ) | 0;

		// Z pixel steps

		var fixscale = ( 1 << subpixelBits );
		dzdx = ( dzdx * fixscale ) | 0;
		dzdy = ( dzdy * fixscale ) | 0;

		var dtvdx, dtvdy, cbtu, cbtv;
		if ( bHasUV ) {

			// UV interpolation setup
			var dtu12 = tu1 - tu2, dtu31 = tu3 - tu1;
			var dtudx = ( invDet * ( dtu12 * dy31 - dtu31 * dy12 ) ); // dtu per one subpixel step in x
			var dtudy = ( invDet * ( dtu12 * dx31 - dx12 * dtu31 ) ); // dtu per one subpixel step in y
			var dtv12 = tv1 - tv2, dtv31 = tv3 - tv1;
			dtvdx = ( invDet * ( dtv12 * dy31 - dtv31 * dy12 ) ); // dtv per one subpixel step in x
			dtvdy = ( invDet * ( dtv12 * dx31 - dx12 * dtv31 ) ); // dtv per one subpixel step in y

			// UV at top/left corner of rast area
			cbtu = ( tu1 + ( minXfixscale - x1 ) * dtudx + ( minYfixscale - y1 ) * dtudy );
			cbtv = ( tv1 + ( minXfixscale - x1 ) * dtvdx + ( minYfixscale - y1 ) * dtvdy );

			// UV pixel steps
			dtudx = dtudx * fixscale;
			dtudy = dtudy * fixscale;
			dtvdx = dtvdx * fixscale;
			dtvdy = dtvdy * fixscale;

		}

		var dnxdx, dnzdy, cbnz;
		if ( bHasNormal ) {

			 // Normal interpolation setup
			var dnz12 = nz1 - nz2, dnz31 = nz3 - nz1;
			var dnzdx = ( invDet * ( dnz12 * dy31 - dnz31 * dy12 ) ); // dnz per one subpixel step in x
			var dnzdy = ( invDet * ( dnz12 * dx31 - dx12 * dnz31 ) ); // dnz per one subpixel step in y

			// Normal at top/left corner of rast area
			cbnz = ( nz1 + ( minXfixscale - x1 ) * dnzdx + ( minYfixscale - y1 ) * dnzdy );

			// Normal pixel steps
			dnzdx = ( dnzdx * fixscale );
			dnzdy = ( dnzdy * fixscale );

		}

		// Set up min/max corners
		var qm1 = q - 1; // for convenience
		var nmin1 = 0, nmax1 = 0;
		var nmin2 = 0, nmax2 = 0;
		var nmin3 = 0, nmax3 = 0;
		var nminz = 0, nmaxz = 0;
		if ( dx12 >= 0 ) nmax1 -= qm1 * dx12; else nmin1 -= qm1 * dx12;
		if ( dy12 >= 0 ) nmax1 -= qm1 * dy12; else nmin1 -= qm1 * dy12;
		if ( dx23 >= 0 ) nmax2 -= qm1 * dx23; else nmin2 -= qm1 * dx23;
		if ( dy23 >= 0 ) nmax2 -= qm1 * dy23; else nmin2 -= qm1 * dy23;
		if ( dx31 >= 0 ) nmax3 -= qm1 * dx31; else nmin3 -= qm1 * dx31;
		if ( dy31 >= 0 ) nmax3 -= qm1 * dy31; else nmin3 -= qm1 * dy31;
		if ( dzdx >= 0 ) nmaxz += qm1 * dzdx; else nminz += qm1 * dzdx;
		if ( dzdy >= 0 ) nmaxz += qm1 * dzdy; else nminz += qm1 * dzdy;

		// Loop through blocks
		var linestep = canvasWidth - q;

		var cb1 = c1;
		var cb2 = c2;
		var cb3 = c3;
		var cbz = cz;
		var qstep = - q;
		var e1x = qstep * dy12;
		var e2x = qstep * dy23;
		var e3x = qstep * dy31;
		var ezx = qstep * dzdx;

		var etux, etvx;
		if ( bHasUV ) {

			etux = qstep * dtudx;
			etvx = qstep * dtvdx;

		}

		var enzx;
		if ( bHasNormal ) {

			enzx = qstep * dnzdx;

		}

		var x0 = minx;

		for ( var y0 = miny; y0 < maxy; y0 += q ) {

			// New block line - keep hunting for tri outer edge in old block line dir
			while ( x0 >= minx && x0 < maxx && cb1 >= nmax1 && cb2 >= nmax2 && cb3 >= nmax3 ) {

				x0 += qstep;
				cb1 += e1x;
				cb2 += e2x;
				cb3 += e3x;
				cbz += ezx;

				if ( bHasUV ) {

					cbtu += etux;
					cbtv += etvx;

				}

				if ( bHasNormal ) {

					cbnz += enzx;

				}

			}

			// Okay, we're now in a block we know is outside. Reverse direction and go into main loop.
			qstep = - qstep;
			e1x = - e1x;
			e2x = - e2x;
			e3x = - e3x;
			ezx = - ezx;

			if ( bHasUV ) {

				etux = - etux;
				etvx = - etvx;

			}

			if ( bHasNormal ) {

				enzx = - enzx;

			}

			while ( 1 ) {

				// Step everything
				x0 += qstep;
				cb1 += e1x;
				cb2 += e2x;
				cb3 += e3x;
				cbz += ezx;

				if ( bHasUV ) {

					cbtu += etux;
					cbtv += etvx;

				}

				if ( bHasNormal ) {

					cbnz += enzx;

				}

				// We're done with this block line when at least one edge completely out
				// If an edge function is too small and decreasing in the current traversal
				// dir, we're done with this line.
				if ( x0 < minx || x0 >= maxx ) break;
				if ( cb1 < nmax1 ) if ( e1x < 0 ) break; else continue;
				if ( cb2 < nmax2 ) if ( e2x < 0 ) break; else continue;
				if ( cb3 < nmax3 ) if ( e3x < 0 ) break; else continue;

				// We can skip this block if it's already fully covered
				var blockX = x0 >> blockShift;
				var blockY = y0 >> blockShift;
				var blockId = blockX + blockY * canvasWBlocks;
				var minz = cbz + nminz;

				// farthest point in block closer than closest point in our tri?
				if ( blockMaxZ[ blockId ] < minz ) continue;

				// Need to do a deferred clear?
				var bflags = blockFlags[ blockId ];
				if ( bflags & BLOCK_NEEDCLEAR ) clearBlock( blockX, blockY );
				blockFlags[ blockId ] = bflags & ~ ( BLOCK_ISCLEAR | BLOCK_NEEDCLEAR );

				// Offset at top-left corner
				var offset = x0 + y0 * canvasWidth;

				// Accept whole block when fully covered
				if ( cb1 >= nmin1 && cb2 >= nmin2 && cb3 >= nmin3 ) {

					var maxz = cbz + nmaxz;
					blockMaxZ[ blockId ] = Math.min( blockMaxZ[ blockId ], maxz );

					var cy1 = cb1;
					var cy2 = cb2;
					var cyz = cbz;

					var cytu, cytv;
					if ( bHasUV ) {

						cytu = cbtu;
						cytv = cbtv;

					}

					var cynz;
					if ( bHasNormal ) {

						cynz = cbnz;

					}


					for ( var iy = 0; iy < q; iy ++ ) {

						var cx1 = cy1;
						var cx2 = cy2;
						var cxz = cyz;

						var cxtu;
						var cxtv;
						if ( bHasUV ) {

							cxtu = cytu;
							cxtv = cytv;

						}

						var cxnz;
						if ( bHasNormal ) {

							cxnz = cynz;

						}

						for ( var ix = 0; ix < q; ix ++ ) {

							var z = cxz;

							if ( z < zbuffer[ offset ] ) {

								shader( data, zbuffer, offset, z, cxtu, cxtv, cxnz, face, material );

							}

							cx1 += dy12;
							cx2 += dy23;
							cxz += dzdx;

							if ( bHasUV ) {

								cxtu += dtudx;
								cxtv += dtvdx;

							}

							if ( bHasNormal ) {

								cxnz += dnzdx;

							}

							offset ++;

						}

						cy1 += dx12;
						cy2 += dx23;
						cyz += dzdy;

						if ( bHasUV ) {

							cytu += dtudy;
							cytv += dtvdy;

						}

						if ( bHasNormal ) {

							cynz += dnzdy;

						}

						offset += linestep;

					}

				} else {

					// Partially covered block

					var cy1 = cb1;
					var cy2 = cb2;
					var cy3 = cb3;
					var cyz = cbz;

					var cytu, cytv;
					if ( bHasUV ) {

						cytu = cbtu;
						cytv = cbtv;

					}

					var cynz;
					if ( bHasNormal ) {

						cynz = cbnz;

					}

					for ( var iy = 0; iy < q; iy ++ ) {

						var cx1 = cy1;
						var cx2 = cy2;
						var cx3 = cy3;
						var cxz = cyz;

						var cxtu;
						var cxtv;
						if ( bHasUV ) {

							cxtu = cytu;
							cxtv = cytv;

						}

						var cxnz;
						if ( bHasNormal ) {

							cxnz = cynz;

						}

						for ( var ix = 0; ix < q; ix ++ ) {

							if ( ( cx1 | cx2 | cx3 ) >= 0 ) {

								var z = cxz;

								if ( z < zbuffer[ offset ] ) {

									shader( data, zbuffer, offset, z, cxtu, cxtv, cxnz, face, material );

								}

							}

							cx1 += dy12;
							cx2 += dy23;
							cx3 += dy31;
							cxz += dzdx;

							if ( bHasUV ) {

								cxtu += dtudx;
								cxtv += dtvdx;

							}

							if ( bHasNormal ) {

								cxnz += dnzdx;

							}

							offset ++;

						}

						cy1 += dx12;
						cy2 += dx23;
						cy3 += dx31;
						cyz += dzdy;

						if ( bHasUV ) {

							cytu += dtudy;
							cytv += dtvdy;

						}

						if ( bHasNormal ) {

							cynz += dnzdy;

						}

						offset += linestep;

					}

				}

			}

			// Advance to next row of blocks
			cb1 += q * dx12;
			cb2 += q * dx23;
			cb3 += q * dx31;
			cbz += q * dzdy;

			if ( bHasUV ) {

				cbtu += q * dtudy;
				cbtv += q * dtvdy;

			}

			if ( bHasNormal ) {

				cbnz += q * dnzdy;

			}

		}

	}
    
	// When drawing line, the blockShiftShift has to be zero. In order to clean pixel
	// Using color1 and color2 to interpolation pixel color
	// LineWidth is according to material.linewidth
	function drawLine( v1, v2, color1, color2, shader, material ) {
        
		// While the line mode is enable, blockSize has to be changed to 0.
		if ( !lineMode ) {
			lineMode = true;            
			blockShift = 0;
			blockSize = 1 << blockShift;

			setSize( canvas.width, canvas.height );
		}

		// TODO: Implement per-pixel z-clipping
		if ( v1.z < -1 || v1.z > 1 || v2.z < -1 || v2.z > 1 ) return;

		var halfLineWidth = Math.floor( (material.linewidth-1) * 0.5 );
      
		// https://gist.github.com/2486101
		// explanation: http://pouet.net/topic.php?which=8760&page=1

		// 28.4 fixed-point coordinates
		var x1 = (v1.x * viewportXScale + viewportXOffs) | 0;
		var x2 = (v2.x * viewportXScale + viewportXOffs) | 0;

		var y1 = (v1.y * viewportYScale + viewportYOffs) | 0;
		var y2 = (v2.y * viewportYScale + viewportYOffs) | 0;

		var z1 = (v1.z * viewportZScale + viewportZOffs) | 0;
		var z2 = (v2.z * viewportZScale + viewportZOffs) | 0;

		// Deltas
		var dx12 = x1 - x2, dy12 = y1 - y2, dz12 = z1 - z2;

		// Bounding rectangle
		var minx = Math.max( ( Math.min( x1, x2 ) + subpixelBias ) >> subpixelBits, 0 );
		var maxx = Math.min( ( Math.max( x1, x2 ) + subpixelBias ) >> subpixelBits, canvasWidth );
		var miny = Math.max( ( Math.min( y1, y2 ) + subpixelBias ) >> subpixelBits, 0 );
		var maxy = Math.min( ( Math.max( y1, y2 ) + subpixelBias ) >> subpixelBits, canvasHeight );
		var minz = Math.max( ( Math.min( z1, z2 ) + subpixelBias ) >> subpixelBits, 0 );
		var maxz = Math.min( ( Math.max( z1, z2 ) + subpixelBias ) >> subpixelBits, 0 );

		rectx1 = Math.min( minx, rectx1 );
		rectx2 = Math.max( maxx, rectx2 );
		recty1 = Math.min( miny, recty1 );
		recty2 = Math.max( maxy, recty2 );

		// Get the line's unit vector and cross vector
		var length = Math.sqrt((dy12 * dy12) + (dx12 * dx12));
		var unitX = (dx12 / length);
		var unitY = (dy12 / length);
		var unitZ = (dz12 / length);        
		var pixelX, pixelY, pixelZ;
		var pX, pY, pZ;
		crossVector.set( unitX, unitY, unitZ );
		crossVector.cross( lookVector );
		crossVector.normalize();
            
		while (length > 0) {

			// Get this pixel.
			pixelX = (x2 + length * unitX);
			pixelY = (y2 + length * unitY);
			pixelZ = (z2 + length * unitZ);               

			pixelX = (pixelX + subpixelBias) >> subpixelBits;
			pixelY = (pixelY + subpixelBias) >> subpixelBits;
			pZ = (pixelZ + subpixelBias) >> subpixelBits;

			// Draw line with line width
			for ( var i = -halfLineWidth; i <= halfLineWidth; ++i ) {

				// Compute the line pixels.
				// Get the pixels on the vector that crosses to the line vector
				pX = Math.floor((pixelX + crossVector.x * i));
				pY = Math.floor((pixelY + crossVector.y * i));                    

				// if pixel is over the rect. Continue
				if ( rectx1 >= pX || rectx2 <= pX || recty1 >= pY 
					|| recty2 <= pY )
				continue;

				// Find this pixel at which block
				var blockX = pX >> blockShift;
				var blockY = pY >> blockShift;
				var blockId = blockX + blockY * canvasWBlocks;

				// Compare the pixel depth width z block.
				if ( blockMaxZ[ blockId ] < minz ) continue;

				blockMaxZ[ blockId ] = Math.min( blockMaxZ[ blockId ], maxz );                    

				var bflags = blockFlags[ blockId ];
				if ( bflags & BLOCK_NEEDCLEAR ) clearBlock( blockX, blockY );
				blockFlags[ blockId ] = bflags & ~( BLOCK_ISCLEAR | BLOCK_NEEDCLEAR );                   
		        
				// draw pixel
				var offset = pX + pY * canvasWidth;

				if ( pZ < zbuffer[ offset ] ) {		 
					shader( data, zbuffer, offset, pZ, color1, color2, material );								
				}
			}

			--length;
		}           

	}
    
	function clearBlock( blockX, blockY ) {

		var zoffset = blockX * blockSize + blockY * blockSize * canvasWidth;
		var poffset = zoffset * 4;

		var zlinestep = canvasWidth - blockSize;
		var plinestep = zlinestep * 4;

		for ( var y = 0; y < blockSize; y ++ ) {

			for ( var x = 0; x < blockSize; x ++ ) {

				zbuffer[ zoffset ++ ] = maxZVal;

				data[ poffset ++ ] = clearColor.r * 255 | 0;
				data[ poffset ++ ] = clearColor.g * 255 | 0;
				data[ poffset ++ ] = clearColor.b * 255 | 0;
				data[ poffset ++ ] = 255;

			}

			zoffset += zlinestep;
			poffset += plinestep;

		}

	}

	function finishClear( ) {

		var block = 0;

		for ( var y = 0; y < canvasHBlocks; y ++ ) {

			for ( var x = 0; x < canvasWBlocks; x ++ ) {

				if ( blockFlags[ block ] & BLOCK_NEEDCLEAR ) {

					clearBlock( x, y );
					blockFlags[ block ] = BLOCK_ISCLEAR;

				}

				block ++;

			}

		}

	}

};

THREE.SoftwareRenderer.Texture = function() {

	var canvas;

	this.fromImage = function( image ) {

		if ( ! image || image.width <= 0 || image.height <= 0 )
			return;

		if ( canvas === undefined ) {

			canvas = document.createElement( 'canvas' );

		}

		var size = image.width > image.height ? image.width : image.height;
		size = THREE.Math.nextPowerOfTwo( size );

		if ( canvas.width != size || canvas.height != size ) {

			canvas.width = size;
			canvas.height = size;

		}

		var ctx = canvas.getContext( '2d' );
		ctx.clearRect( 0, 0, size, size );
		ctx.drawImage( image, 0, 0, size, size );

		var imgData = ctx.getImageData( 0, 0, size, size );

		this.data = imgData.data;
		this.width = size;
		this.height = size;
		this.srcUrl = image.src;

	};

};

// File:examples/js/renderers/SVGRenderer.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SVGObject = function ( node ) {

	THREE.Object3D.call( this );

	this.node = node;

};

THREE.SVGObject.prototype = Object.create( THREE.Object3D.prototype );
THREE.SVGObject.prototype.constructor = THREE.SVGObject;

THREE.SVGRenderer = function () {

	console.log( 'THREE.SVGRenderer', THREE.REVISION );

	var _this = this,
	_renderData, _elements, _lights,
	_projector = new THREE.Projector(),
	_svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ),
	_svgWidth, _svgHeight, _svgWidthHalf, _svgHeightHalf,

	_v1, _v2, _v3, _v4,

	_clipBox = new THREE.Box2(),
	_elemBox = new THREE.Box2(),

	_color = new THREE.Color(),
	_diffuseColor = new THREE.Color(),
	_ambientLight = new THREE.Color(),
	_directionalLights = new THREE.Color(),
	_pointLights = new THREE.Color(),
	_clearColor = new THREE.Color(),
	_clearAlpha = 1,

	_w, // z-buffer to w-buffer
	_vector3 = new THREE.Vector3(), // Needed for PointLight
	_centroid = new THREE.Vector3(),
	_normal = new THREE.Vector3(),
	_normalViewMatrix = new THREE.Matrix3(),

	_viewMatrix = new THREE.Matrix4(),
	_viewProjectionMatrix = new THREE.Matrix4(),

	_svgPathPool = [], _svgLinePool = [], _svgRectPool = [],
	_svgNode, _pathCount = 0, _lineCount = 0, _rectCount = 0,
	_quality = 1;

	this.domElement = _svg;

	this.autoClear = true;
	this.sortObjects = true;
	this.sortElements = true;

	this.info = {

		render: {

			vertices: 0,
			faces: 0

		}

	};

	this.setQuality = function( quality ) {

		switch ( quality ) {

			case "high": _quality = 1; break;
			case "low": _quality = 0; break;

		}

	};

	// WebGLRenderer compatibility

	this.supportsVertexTextures = function () {};
	this.setFaceCulling = function () {};

	this.setClearColor = function ( color, alpha ) {

		_clearColor.set( color );
		_clearAlpha = alpha !== undefined ? alpha : 1;

	};

	this.setPixelRatio = function () {};

	this.setSize = function( width, height ) {

		_svgWidth = width; _svgHeight = height;
		_svgWidthHalf = _svgWidth / 2; _svgHeightHalf = _svgHeight / 2;

		_svg.setAttribute( 'viewBox', ( - _svgWidthHalf ) + ' ' + ( - _svgHeightHalf ) + ' ' + _svgWidth + ' ' + _svgHeight );
		_svg.setAttribute( 'width', _svgWidth );
		_svg.setAttribute( 'height', _svgHeight );

		_clipBox.min.set( - _svgWidthHalf, - _svgHeightHalf );
		_clipBox.max.set( _svgWidthHalf, _svgHeightHalf );

	};

	this.clear = function () {

		_pathCount = 0;
		_lineCount = 0;
		_rectCount = 0;

		while ( _svg.childNodes.length > 0 ) {

			_svg.removeChild( _svg.childNodes[ 0 ] );

		}

		_svg.style.backgroundColor = 'rgba(' + ( ( _clearColor.r * 255 ) | 0 ) + ',' + ( ( _clearColor.g * 255 ) | 0 ) + ',' + ( ( _clearColor.b * 255 ) | 0 ) + ',' + _clearAlpha + ')';

	};

	this.render = function ( scene, camera ) {

		if ( camera instanceof THREE.Camera === false ) {

			console.error( 'THREE.SVGRenderer.render: camera is not an instance of THREE.Camera.' );
			return;

		}

		if ( this.autoClear === true ) this.clear();

		_this.info.render.vertices = 0;
		_this.info.render.faces = 0;

		_viewMatrix.copy( camera.matrixWorldInverse.getInverse( camera.matrixWorld ) );
		_viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );

		_renderData = _projector.projectScene( scene, camera, this.sortObjects, this.sortElements );
		_elements = _renderData.elements;
		_lights = _renderData.lights;

		_normalViewMatrix.getNormalMatrix( camera.matrixWorldInverse );

		calculateLights( _lights );

		for ( var e = 0, el = _elements.length; e < el; e ++ ) {

			var element = _elements[ e ];
			var material = element.material;

			if ( material === undefined || material.opacity === 0 ) continue;

			_elemBox.makeEmpty();

			if ( element instanceof THREE.RenderableSprite ) {

				_v1 = element;
				_v1.x *= _svgWidthHalf; _v1.y *= - _svgHeightHalf;

				renderSprite( _v1, element, material );

			} else if ( element instanceof THREE.RenderableLine ) {

				_v1 = element.v1; _v2 = element.v2;

				_v1.positionScreen.x *= _svgWidthHalf; _v1.positionScreen.y *= - _svgHeightHalf;
				_v2.positionScreen.x *= _svgWidthHalf; _v2.positionScreen.y *= - _svgHeightHalf;

				_elemBox.setFromPoints( [ _v1.positionScreen, _v2.positionScreen ] );

				if ( _clipBox.isIntersectionBox( _elemBox ) === true ) {

					renderLine( _v1, _v2, element, material );

				}

			} else if ( element instanceof THREE.RenderableFace ) {

				_v1 = element.v1; _v2 = element.v2; _v3 = element.v3;

				if ( _v1.positionScreen.z < - 1 || _v1.positionScreen.z > 1 ) continue;
				if ( _v2.positionScreen.z < - 1 || _v2.positionScreen.z > 1 ) continue;
				if ( _v3.positionScreen.z < - 1 || _v3.positionScreen.z > 1 ) continue;

				_v1.positionScreen.x *= _svgWidthHalf; _v1.positionScreen.y *= - _svgHeightHalf;
				_v2.positionScreen.x *= _svgWidthHalf; _v2.positionScreen.y *= - _svgHeightHalf;
				_v3.positionScreen.x *= _svgWidthHalf; _v3.positionScreen.y *= - _svgHeightHalf;

				_elemBox.setFromPoints( [
					_v1.positionScreen,
					_v2.positionScreen,
					_v3.positionScreen
				] );

				if ( _clipBox.isIntersectionBox( _elemBox ) === true ) {

					renderFace3( _v1, _v2, _v3, element, material );

				}

			}

		}

		scene.traverseVisible( function ( object ) {

			 if ( object instanceof THREE.SVGObject ) {

				_vector3.setFromMatrixPosition( object.matrixWorld );
				_vector3.applyProjection( _viewProjectionMatrix );

				var x =   _vector3.x * _svgWidthHalf;
				var y = - _vector3.y * _svgHeightHalf;

				var node = object.node;
				node.setAttribute( 'transform', 'translate(' + x + ',' + y + ')' );

				_svg.appendChild( node );

			}

		} );

	};

	function calculateLights( lights ) {

		_ambientLight.setRGB( 0, 0, 0 );
		_directionalLights.setRGB( 0, 0, 0 );
		_pointLights.setRGB( 0, 0, 0 );

		for ( var l = 0, ll = lights.length; l < ll; l ++ ) {

			var light = lights[ l ];
			var lightColor = light.color;

			if ( light instanceof THREE.AmbientLight ) {

				_ambientLight.r += lightColor.r;
				_ambientLight.g += lightColor.g;
				_ambientLight.b += lightColor.b;

			} else if ( light instanceof THREE.DirectionalLight ) {

				_directionalLights.r += lightColor.r;
				_directionalLights.g += lightColor.g;
				_directionalLights.b += lightColor.b;

			} else if ( light instanceof THREE.PointLight ) {

				_pointLights.r += lightColor.r;
				_pointLights.g += lightColor.g;
				_pointLights.b += lightColor.b;

			}

		}

	}

	function calculateLight( lights, position, normal, color ) {

		for ( var l = 0, ll = lights.length; l < ll; l ++ ) {

			var light = lights[ l ];
			var lightColor = light.color;

			if ( light instanceof THREE.DirectionalLight ) {

				var lightPosition = _vector3.setFromMatrixPosition( light.matrixWorld ).normalize();

				var amount = normal.dot( lightPosition );

				if ( amount <= 0 ) continue;

				amount *= light.intensity;

				color.r += lightColor.r * amount;
				color.g += lightColor.g * amount;
				color.b += lightColor.b * amount;

			} else if ( light instanceof THREE.PointLight ) {

				var lightPosition = _vector3.setFromMatrixPosition( light.matrixWorld );

				var amount = normal.dot( _vector3.subVectors( lightPosition, position ).normalize() );

				if ( amount <= 0 ) continue;

				amount *= light.distance == 0 ? 1 : 1 - Math.min( position.distanceTo( lightPosition ) / light.distance, 1 );

				if ( amount == 0 ) continue;

				amount *= light.intensity;

				color.r += lightColor.r * amount;
				color.g += lightColor.g * amount;
				color.b += lightColor.b * amount;

			}

		}

	}

	function renderSprite( v1, element, material ) {

		var scaleX = element.scale.x * _svgWidthHalf;
		var scaleY = element.scale.y * _svgHeightHalf;

		_svgNode = getRectNode( _rectCount ++ );

		_svgNode.setAttribute( 'x', v1.x - ( scaleX * 0.5 ) );
		_svgNode.setAttribute( 'y', v1.y - ( scaleY * 0.5 ) );
		_svgNode.setAttribute( 'width', scaleX );
		_svgNode.setAttribute( 'height', scaleY );

		if ( material instanceof THREE.SpriteMaterial ) {

			_svgNode.setAttribute( 'style', 'fill: ' + material.color.getStyle() );

		}

		_svg.appendChild( _svgNode );

	}

	function renderLine( v1, v2, element, material ) {

		_svgNode = getLineNode( _lineCount ++ );

		_svgNode.setAttribute( 'x1', v1.positionScreen.x );
		_svgNode.setAttribute( 'y1', v1.positionScreen.y );
		_svgNode.setAttribute( 'x2', v2.positionScreen.x );
		_svgNode.setAttribute( 'y2', v2.positionScreen.y );

		if ( material instanceof THREE.LineBasicMaterial ) {

			_svgNode.setAttribute( 'style', 'fill: none; stroke: ' + material.color.getStyle() + '; stroke-width: ' + material.linewidth + '; stroke-opacity: ' + material.opacity + '; stroke-linecap: ' + material.linecap + '; stroke-linejoin: ' + material.linejoin );

			_svg.appendChild( _svgNode );

		}

	}

	function renderFace3( v1, v2, v3, element, material ) {

		_this.info.render.vertices += 3;
		_this.info.render.faces ++;

		_svgNode = getPathNode( _pathCount ++ );
		_svgNode.setAttribute( 'd', 'M ' + v1.positionScreen.x + ' ' + v1.positionScreen.y + ' L ' + v2.positionScreen.x + ' ' + v2.positionScreen.y + ' L ' + v3.positionScreen.x + ',' + v3.positionScreen.y + 'z' );

		if ( material instanceof THREE.MeshBasicMaterial ) {

			_color.copy( material.color );

			if ( material.vertexColors === THREE.FaceColors ) {

				_color.multiply( element.color );

			}

		} else if ( material instanceof THREE.MeshLambertMaterial || material instanceof THREE.MeshPhongMaterial ) {

			_diffuseColor.copy( material.color );

			if ( material.vertexColors === THREE.FaceColors ) {

				_diffuseColor.multiply( element.color );

			}

			_color.copy( _ambientLight );

			_centroid.copy( v1.positionWorld ).add( v2.positionWorld ).add( v3.positionWorld ).divideScalar( 3 );

			calculateLight( _lights, _centroid, element.normalModel, _color );

			_color.multiply( _diffuseColor ).add( material.emissive );

		} else if ( material instanceof THREE.MeshDepthMaterial ) {

			_w = 1 - ( material.__2near / ( material.__farPlusNear - element.z * material.__farMinusNear ) );
			_color.setRGB( _w, _w, _w );

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			_normal.copy( element.normalModel ).applyMatrix3( _normalViewMatrix );

			_color.setRGB( _normal.x, _normal.y, _normal.z ).multiplyScalar( 0.5 ).addScalar( 0.5 );

		}

		if ( material.wireframe ) {

			_svgNode.setAttribute( 'style', 'fill: none; stroke: ' + _color.getStyle() + '; stroke-width: ' + material.wireframeLinewidth + '; stroke-opacity: ' + material.opacity + '; stroke-linecap: ' + material.wireframeLinecap + '; stroke-linejoin: ' + material.wireframeLinejoin );

		} else {

			_svgNode.setAttribute( 'style', 'fill: ' + _color.getStyle() + '; fill-opacity: ' + material.opacity );

		}

		_svg.appendChild( _svgNode );

	}

	function getLineNode( id ) {

		if ( _svgLinePool[ id ] == null ) {

			_svgLinePool[ id ] = document.createElementNS( 'http://www.w3.org/2000/svg', 'line' );

			if ( _quality == 0 ) {

				_svgLinePool[ id ].setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed

			}

			return _svgLinePool[ id ];

		}

		return _svgLinePool[ id ];

	}

	function getPathNode( id ) {

		if ( _svgPathPool[ id ] == null ) {

			_svgPathPool[ id ] = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );

			if ( _quality == 0 ) {

				_svgPathPool[ id ].setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed

			}

			return _svgPathPool[ id ];

		}

		return _svgPathPool[ id ];

	}

	function getRectNode( id ) {

		if ( _svgRectPool[ id ] == null ) {

			_svgRectPool[ id ] = document.createElementNS( 'http://www.w3.org/2000/svg', 'rect' );

			if ( _quality == 0 ) {

				_svgRectPool[ id ].setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed

			}

			return _svgRectPool[ id ];

		}

		return _svgRectPool[ id ];

	}

};

// File:examples/js/libs/jszip.min.js

/*!

JSZip - A Javascript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2014 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/master/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/master/LICENSE
*/
!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;"undefined"!=typeof window?b=window:"undefined"!=typeof global?b=global:"undefined"!=typeof self&&(b=self),b.JSZip=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){"use strict";var d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";c.encode=function(a){for(var b,c,e,f,g,h,i,j="",k=0;k<a.length;)b=a.charCodeAt(k++),c=a.charCodeAt(k++),e=a.charCodeAt(k++),f=b>>2,g=(3&b)<<4|c>>4,h=(15&c)<<2|e>>6,i=63&e,isNaN(c)?h=i=64:isNaN(e)&&(i=64),j=j+d.charAt(f)+d.charAt(g)+d.charAt(h)+d.charAt(i);return j},c.decode=function(a){var b,c,e,f,g,h,i,j="",k=0;for(a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");k<a.length;)f=d.indexOf(a.charAt(k++)),g=d.indexOf(a.charAt(k++)),h=d.indexOf(a.charAt(k++)),i=d.indexOf(a.charAt(k++)),b=f<<2|g>>4,c=(15&g)<<4|h>>2,e=(3&h)<<6|i,j+=String.fromCharCode(b),64!=h&&(j+=String.fromCharCode(c)),64!=i&&(j+=String.fromCharCode(e));return j}},{}],2:[function(a,b){"use strict";function c(){this.compressedSize=0,this.uncompressedSize=0,this.crc32=0,this.compressionMethod=null,this.compressedContent=null}c.prototype={getContent:function(){return null},getCompressedContent:function(){return null}},b.exports=c},{}],3:[function(a,b,c){"use strict";c.STORE={magic:"\x00\x00",compress:function(a){return a},uncompress:function(a){return a},compressInputType:null,uncompressInputType:null},c.DEFLATE=a("./flate")},{"./flate":8}],4:[function(a,b){"use strict";var c=a("./utils"),d=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918e3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117];b.exports=function(a,b){if("undefined"==typeof a||!a.length)return 0;var e="string"!==c.getTypeOf(a);"undefined"==typeof b&&(b=0);var f=0,g=0,h=0;b=-1^b;for(var i=0,j=a.length;j>i;i++)h=e?a[i]:a.charCodeAt(i),g=255&(b^h),f=d[g],b=b>>>8^f;return-1^b}},{"./utils":21}],5:[function(a,b){"use strict";function c(){this.data=null,this.length=0,this.index=0}var d=a("./utils");c.prototype={checkOffset:function(a){this.checkIndex(this.index+a)},checkIndex:function(a){if(this.length<a||0>a)throw new Error("End of data reached (data length = "+this.length+", asked index = "+a+"). Corrupted zip ?")},setIndex:function(a){this.checkIndex(a),this.index=a},skip:function(a){this.setIndex(this.index+a)},byteAt:function(){},readInt:function(a){var b,c=0;for(this.checkOffset(a),b=this.index+a-1;b>=this.index;b--)c=(c<<8)+this.byteAt(b);return this.index+=a,c},readString:function(a){return d.transformTo("string",this.readData(a))},readData:function(){},lastIndexOfSignature:function(){},readDate:function(){var a=this.readInt(4);return new Date((a>>25&127)+1980,(a>>21&15)-1,a>>16&31,a>>11&31,a>>5&63,(31&a)<<1)}},b.exports=c},{"./utils":21}],6:[function(a,b,c){"use strict";c.base64=!1,c.binary=!1,c.dir=!1,c.createFolders=!1,c.date=null,c.compression=null,c.comment=null},{}],7:[function(a,b,c){"use strict";var d=a("./utils");c.string2binary=function(a){return d.string2binary(a)},c.string2Uint8Array=function(a){return d.transformTo("uint8array",a)},c.uint8Array2String=function(a){return d.transformTo("string",a)},c.string2Blob=function(a){var b=d.transformTo("arraybuffer",a);return d.arrayBuffer2Blob(b)},c.arrayBuffer2Blob=function(a){return d.arrayBuffer2Blob(a)},c.transformTo=function(a,b){return d.transformTo(a,b)},c.getTypeOf=function(a){return d.getTypeOf(a)},c.checkSupport=function(a){return d.checkSupport(a)},c.MAX_VALUE_16BITS=d.MAX_VALUE_16BITS,c.MAX_VALUE_32BITS=d.MAX_VALUE_32BITS,c.pretty=function(a){return d.pretty(a)},c.findCompression=function(a){return d.findCompression(a)},c.isRegExp=function(a){return d.isRegExp(a)}},{"./utils":21}],8:[function(a,b,c){"use strict";var d="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,e=a("pako");c.uncompressInputType=d?"uint8array":"array",c.compressInputType=d?"uint8array":"array",c.magic="\b\x00",c.compress=function(a){return e.deflateRaw(a)},c.uncompress=function(a){return e.inflateRaw(a)}},{pako:24}],9:[function(a,b){"use strict";function c(a,b){return this instanceof c?(this.files={},this.comment=null,this.root="",a&&this.load(a,b),void(this.clone=function(){var a=new c;for(var b in this)"function"!=typeof this[b]&&(a[b]=this[b]);return a})):new c(a,b)}var d=a("./base64");c.prototype=a("./object"),c.prototype.load=a("./load"),c.support=a("./support"),c.defaults=a("./defaults"),c.utils=a("./deprecatedPublicUtils"),c.base64={encode:function(a){return d.encode(a)},decode:function(a){return d.decode(a)}},c.compressions=a("./compressions"),b.exports=c},{"./base64":1,"./compressions":3,"./defaults":6,"./deprecatedPublicUtils":7,"./load":10,"./object":13,"./support":17}],10:[function(a,b){"use strict";var c=a("./base64"),d=a("./zipEntries");b.exports=function(a,b){var e,f,g,h;for(b=b||{},b.base64&&(a=c.decode(a)),f=new d(a,b),e=f.files,g=0;g<e.length;g++)h=e[g],this.file(h.fileName,h.decompressed,{binary:!0,optimizedBinaryString:!0,date:h.date,dir:h.dir,comment:h.fileComment.length?h.fileComment:null,createFolders:b.createFolders});return f.zipComment.length&&(this.comment=f.zipComment),this}},{"./base64":1,"./zipEntries":22}],11:[function(a,b){(function(a){"use strict";b.exports=function(b,c){return new a(b,c)},b.exports.test=function(b){return a.isBuffer(b)}}).call(this,"undefined"!=typeof Buffer?Buffer:void 0)},{}],12:[function(a,b){"use strict";function c(a){this.data=a,this.length=this.data.length,this.index=0}var d=a("./uint8ArrayReader");c.prototype=new d,c.prototype.readData=function(a){this.checkOffset(a);var b=this.data.slice(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./uint8ArrayReader":18}],13:[function(a,b){"use strict";var c=a("./support"),d=a("./utils"),e=a("./crc32"),f=a("./signature"),g=a("./defaults"),h=a("./base64"),i=a("./compressions"),j=a("./compressedObject"),k=a("./nodeBuffer"),l=a("./utf8"),m=a("./stringWriter"),n=a("./uint8ArrayWriter"),o=function(a){if(a._data instanceof j&&(a._data=a._data.getContent(),a.options.binary=!0,a.options.base64=!1,"uint8array"===d.getTypeOf(a._data))){var b=a._data;a._data=new Uint8Array(b.length),0!==b.length&&a._data.set(b,0)}return a._data},p=function(a){var b=o(a),e=d.getTypeOf(b);return"string"===e?!a.options.binary&&c.nodebuffer?k(b,"utf-8"):a.asBinary():b},q=function(a){var b=o(this);return null===b||"undefined"==typeof b?"":(this.options.base64&&(b=h.decode(b)),b=a&&this.options.binary?A.utf8decode(b):d.transformTo("string",b),a||this.options.binary||(b=d.transformTo("string",A.utf8encode(b))),b)},r=function(a,b,c){this.name=a,this.dir=c.dir,this.date=c.date,this.comment=c.comment,this._data=b,this.options=c,this._initialMetadata={dir:c.dir,date:c.date}};r.prototype={asText:function(){return q.call(this,!0)},asBinary:function(){return q.call(this,!1)},asNodeBuffer:function(){var a=p(this);return d.transformTo("nodebuffer",a)},asUint8Array:function(){var a=p(this);return d.transformTo("uint8array",a)},asArrayBuffer:function(){return this.asUint8Array().buffer}};var s=function(a,b){var c,d="";for(c=0;b>c;c++)d+=String.fromCharCode(255&a),a>>>=8;return d},t=function(){var a,b,c={};for(a=0;a<arguments.length;a++)for(b in arguments[a])arguments[a].hasOwnProperty(b)&&"undefined"==typeof c[b]&&(c[b]=arguments[a][b]);return c},u=function(a){return a=a||{},a.base64!==!0||null!==a.binary&&void 0!==a.binary||(a.binary=!0),a=t(a,g),a.date=a.date||new Date,null!==a.compression&&(a.compression=a.compression.toUpperCase()),a},v=function(a,b,c){var e,f=d.getTypeOf(b);if(c=u(c),c.createFolders&&(e=w(a))&&x.call(this,e,!0),c.dir||null===b||"undefined"==typeof b)c.base64=!1,c.binary=!1,b=null;else if("string"===f)c.binary&&!c.base64&&c.optimizedBinaryString!==!0&&(b=d.string2binary(b));else{if(c.base64=!1,c.binary=!0,!(f||b instanceof j))throw new Error("The data of '"+a+"' is in an unsupported format !");"arraybuffer"===f&&(b=d.transformTo("uint8array",b))}var g=new r(a,b,c);return this.files[a]=g,g},w=function(a){"/"==a.slice(-1)&&(a=a.substring(0,a.length-1));var b=a.lastIndexOf("/");return b>0?a.substring(0,b):""},x=function(a,b){return"/"!=a.slice(-1)&&(a+="/"),b="undefined"!=typeof b?b:!1,this.files[a]||v.call(this,a,null,{dir:!0,createFolders:b}),this.files[a]},y=function(a,b){var c,f=new j;return a._data instanceof j?(f.uncompressedSize=a._data.uncompressedSize,f.crc32=a._data.crc32,0===f.uncompressedSize||a.dir?(b=i.STORE,f.compressedContent="",f.crc32=0):a._data.compressionMethod===b.magic?f.compressedContent=a._data.getCompressedContent():(c=a._data.getContent(),f.compressedContent=b.compress(d.transformTo(b.compressInputType,c)))):(c=p(a),(!c||0===c.length||a.dir)&&(b=i.STORE,c=""),f.uncompressedSize=c.length,f.crc32=e(c),f.compressedContent=b.compress(d.transformTo(b.compressInputType,c))),f.compressedSize=f.compressedContent.length,f.compressionMethod=b.magic,f},z=function(a,b,c,g){var h,i,j,k,m=(c.compressedContent,d.transformTo("string",l.utf8encode(b.name))),n=b.comment||"",o=d.transformTo("string",l.utf8encode(n)),p=m.length!==b.name.length,q=o.length!==n.length,r=b.options,t="",u="",v="";j=b._initialMetadata.dir!==b.dir?b.dir:r.dir,k=b._initialMetadata.date!==b.date?b.date:r.date,h=k.getHours(),h<<=6,h|=k.getMinutes(),h<<=5,h|=k.getSeconds()/2,i=k.getFullYear()-1980,i<<=4,i|=k.getMonth()+1,i<<=5,i|=k.getDate(),p&&(u=s(1,1)+s(e(m),4)+m,t+="up"+s(u.length,2)+u),q&&(v=s(1,1)+s(this.crc32(o),4)+o,t+="uc"+s(v.length,2)+v);var w="";w+="\n\x00",w+=p||q?"\x00\b":"\x00\x00",w+=c.compressionMethod,w+=s(h,2),w+=s(i,2),w+=s(c.crc32,4),w+=s(c.compressedSize,4),w+=s(c.uncompressedSize,4),w+=s(m.length,2),w+=s(t.length,2);var x=f.LOCAL_FILE_HEADER+w+m+t,y=f.CENTRAL_FILE_HEADER+"\x00"+w+s(o.length,2)+"\x00\x00\x00\x00"+(j===!0?"\x00\x00\x00":"\x00\x00\x00\x00")+s(g,4)+m+t+o;return{fileRecord:x,dirRecord:y,compressedObject:c}},A={load:function(){throw new Error("Load method is not defined. Is the file jszip-load.js included ?")},filter:function(a){var b,c,d,e,f=[];for(b in this.files)this.files.hasOwnProperty(b)&&(d=this.files[b],e=new r(d.name,d._data,t(d.options)),c=b.slice(this.root.length,b.length),b.slice(0,this.root.length)===this.root&&a(c,e)&&f.push(e));return f},file:function(a,b,c){if(1===arguments.length){if(d.isRegExp(a)){var e=a;return this.filter(function(a,b){return!b.dir&&e.test(a)})}return this.filter(function(b,c){return!c.dir&&b===a})[0]||null}return a=this.root+a,v.call(this,a,b,c),this},folder:function(a){if(!a)return this;if(d.isRegExp(a))return this.filter(function(b,c){return c.dir&&a.test(b)});var b=this.root+a,c=x.call(this,b),e=this.clone();return e.root=c.name,e},remove:function(a){a=this.root+a;var b=this.files[a];if(b||("/"!=a.slice(-1)&&(a+="/"),b=this.files[a]),b&&!b.dir)delete this.files[a];else for(var c=this.filter(function(b,c){return c.name.slice(0,a.length)===a}),d=0;d<c.length;d++)delete this.files[c[d].name];return this},generate:function(a){a=t(a||{},{base64:!0,compression:"STORE",type:"base64",comment:null}),d.checkSupport(a.type);var b,c,e=[],g=0,j=0,k=d.transformTo("string",this.utf8encode(a.comment||this.comment||""));for(var l in this.files)if(this.files.hasOwnProperty(l)){var o=this.files[l],p=o.options.compression||a.compression.toUpperCase(),q=i[p];if(!q)throw new Error(p+" is not a valid compression method !");var r=y.call(this,o,q),u=z.call(this,l,o,r,g);g+=u.fileRecord.length+r.compressedSize,j+=u.dirRecord.length,e.push(u)}var v="";v=f.CENTRAL_DIRECTORY_END+"\x00\x00\x00\x00"+s(e.length,2)+s(e.length,2)+s(j,4)+s(g,4)+s(k.length,2)+k;var w=a.type.toLowerCase();for(b="uint8array"===w||"arraybuffer"===w||"blob"===w||"nodebuffer"===w?new n(g+j+v.length):new m(g+j+v.length),c=0;c<e.length;c++)b.append(e[c].fileRecord),b.append(e[c].compressedObject.compressedContent);for(c=0;c<e.length;c++)b.append(e[c].dirRecord);b.append(v);var x=b.finalize();switch(a.type.toLowerCase()){case"uint8array":case"arraybuffer":case"nodebuffer":return d.transformTo(a.type.toLowerCase(),x);case"blob":return d.arrayBuffer2Blob(d.transformTo("arraybuffer",x));case"base64":return a.base64?h.encode(x):x;default:return x}},crc32:function(a,b){return e(a,b)},utf8encode:function(a){return d.transformTo("string",l.utf8encode(a))},utf8decode:function(a){return l.utf8decode(a)}};b.exports=A},{"./base64":1,"./compressedObject":2,"./compressions":3,"./crc32":4,"./defaults":6,"./nodeBuffer":11,"./signature":14,"./stringWriter":16,"./support":17,"./uint8ArrayWriter":19,"./utf8":20,"./utils":21}],14:[function(a,b,c){"use strict";c.LOCAL_FILE_HEADER="PK",c.CENTRAL_FILE_HEADER="PK",c.CENTRAL_DIRECTORY_END="PK",c.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",c.ZIP64_CENTRAL_DIRECTORY_END="PK",c.DATA_DESCRIPTOR="PK\b"},{}],15:[function(a,b){"use strict";function c(a,b){this.data=a,b||(this.data=e.string2binary(this.data)),this.length=this.data.length,this.index=0}var d=a("./dataReader"),e=a("./utils");c.prototype=new d,c.prototype.byteAt=function(a){return this.data.charCodeAt(a)},c.prototype.lastIndexOfSignature=function(a){return this.data.lastIndexOf(a)},c.prototype.readData=function(a){this.checkOffset(a);var b=this.data.slice(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./dataReader":5,"./utils":21}],16:[function(a,b){"use strict";var c=a("./utils"),d=function(){this.data=[]};d.prototype={append:function(a){a=c.transformTo("string",a),this.data.push(a)},finalize:function(){return this.data.join("")}},b.exports=d},{"./utils":21}],17:[function(a,b,c){(function(a){"use strict";if(c.base64=!0,c.array=!0,c.string=!0,c.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,c.nodebuffer="undefined"!=typeof a,c.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)c.blob=!1;else{var b=new ArrayBuffer(0);try{c.blob=0===new Blob([b],{type:"application/zip"}).size}catch(d){try{var e=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,f=new e;f.append(b),c.blob=0===f.getBlob("application/zip").size}catch(d){c.blob=!1}}}}).call(this,"undefined"!=typeof Buffer?Buffer:void 0)},{}],18:[function(a,b){"use strict";function c(a){a&&(this.data=a,this.length=this.data.length,this.index=0)}var d=a("./dataReader");c.prototype=new d,c.prototype.byteAt=function(a){return this.data[a]},c.prototype.lastIndexOfSignature=function(a){for(var b=a.charCodeAt(0),c=a.charCodeAt(1),d=a.charCodeAt(2),e=a.charCodeAt(3),f=this.length-4;f>=0;--f)if(this.data[f]===b&&this.data[f+1]===c&&this.data[f+2]===d&&this.data[f+3]===e)return f;return-1},c.prototype.readData=function(a){if(this.checkOffset(a),0===a)return new Uint8Array(0);var b=this.data.subarray(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./dataReader":5}],19:[function(a,b){"use strict";var c=a("./utils"),d=function(a){this.data=new Uint8Array(a),this.index=0};d.prototype={append:function(a){0!==a.length&&(a=c.transformTo("uint8array",a),this.data.set(a,this.index),this.index+=a.length)},finalize:function(){return this.data}},b.exports=d},{"./utils":21}],20:[function(a,b,c){"use strict";for(var d=a("./utils"),e=a("./support"),f=a("./nodeBuffer"),g=new Array(256),h=0;256>h;h++)g[h]=h>=252?6:h>=248?5:h>=240?4:h>=224?3:h>=192?2:1;g[254]=g[254]=1;var i=function(a){var b,c,d,f,g,h=a.length,i=0;for(f=0;h>f;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),i+=128>c?1:2048>c?2:65536>c?3:4;for(b=e.uint8array?new Uint8Array(i):new Array(i),g=0,f=0;i>g;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),128>c?b[g++]=c:2048>c?(b[g++]=192|c>>>6,b[g++]=128|63&c):65536>c?(b[g++]=224|c>>>12,b[g++]=128|c>>>6&63,b[g++]=128|63&c):(b[g++]=240|c>>>18,b[g++]=128|c>>>12&63,b[g++]=128|c>>>6&63,b[g++]=128|63&c);return b},j=function(a,b){var c;for(b=b||a.length,b>a.length&&(b=a.length),c=b-1;c>=0&&128===(192&a[c]);)c--;return 0>c?b:0===c?b:c+g[a[c]]>b?c:b},k=function(a){var b,c,e,f,h=a.length,i=new Array(2*h);for(c=0,b=0;h>b;)if(e=a[b++],128>e)i[c++]=e;else if(f=g[e],f>4)i[c++]=65533,b+=f-1;else{for(e&=2===f?31:3===f?15:7;f>1&&h>b;)e=e<<6|63&a[b++],f--;f>1?i[c++]=65533:65536>e?i[c++]=e:(e-=65536,i[c++]=55296|e>>10&1023,i[c++]=56320|1023&e)}return i.length!==c&&(i.subarray?i=i.subarray(0,c):i.length=c),d.applyFromCharCode(i)};c.utf8encode=function(a){return e.nodebuffer?f(a,"utf-8"):i(a)},c.utf8decode=function(a){if(e.nodebuffer)return d.transformTo("nodebuffer",a).toString("utf-8");a=d.transformTo(e.uint8array?"uint8array":"array",a);for(var b=[],c=0,f=a.length,g=65536;f>c;){var h=j(a,Math.min(c+g,f));b.push(e.uint8array?k(a.subarray(c,h)):k(a.slice(c,h))),c=h}return b.join("")}},{"./nodeBuffer":11,"./support":17,"./utils":21}],21:[function(a,b,c){"use strict";function d(a){return a}function e(a,b){for(var c=0;c<a.length;++c)b[c]=255&a.charCodeAt(c);return b}function f(a){var b=65536,d=[],e=a.length,f=c.getTypeOf(a),g=0,h=!0;try{switch(f){case"uint8array":String.fromCharCode.apply(null,new Uint8Array(0));break;case"nodebuffer":String.fromCharCode.apply(null,j(0))}}catch(i){h=!1}if(!h){for(var k="",l=0;l<a.length;l++)k+=String.fromCharCode(a[l]);return k}for(;e>g&&b>1;)try{d.push("array"===f||"nodebuffer"===f?String.fromCharCode.apply(null,a.slice(g,Math.min(g+b,e))):String.fromCharCode.apply(null,a.subarray(g,Math.min(g+b,e)))),g+=b}catch(i){b=Math.floor(b/2)}return d.join("")}function g(a,b){for(var c=0;c<a.length;c++)b[c]=a[c];return b}var h=a("./support"),i=a("./compressions"),j=a("./nodeBuffer");c.string2binary=function(a){for(var b="",c=0;c<a.length;c++)b+=String.fromCharCode(255&a.charCodeAt(c));return b},c.arrayBuffer2Blob=function(a){c.checkSupport("blob");try{return new Blob([a],{type:"application/zip"})}catch(b){try{var d=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,e=new d;return e.append(a),e.getBlob("application/zip")}catch(b){throw new Error("Bug : can't construct the Blob.")}}},c.applyFromCharCode=f;var k={};k.string={string:d,array:function(a){return e(a,new Array(a.length))},arraybuffer:function(a){return k.string.uint8array(a).buffer},uint8array:function(a){return e(a,new Uint8Array(a.length))},nodebuffer:function(a){return e(a,j(a.length))}},k.array={string:f,array:d,arraybuffer:function(a){return new Uint8Array(a).buffer},uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return j(a)}},k.arraybuffer={string:function(a){return f(new Uint8Array(a))},array:function(a){return g(new Uint8Array(a),new Array(a.byteLength))},arraybuffer:d,uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return j(new Uint8Array(a))}},k.uint8array={string:f,array:function(a){return g(a,new Array(a.length))},arraybuffer:function(a){return a.buffer},uint8array:d,nodebuffer:function(a){return j(a)}},k.nodebuffer={string:f,array:function(a){return g(a,new Array(a.length))},arraybuffer:function(a){return k.nodebuffer.uint8array(a).buffer},uint8array:function(a){return g(a,new Uint8Array(a.length))},nodebuffer:d},c.transformTo=function(a,b){if(b||(b=""),!a)return b;c.checkSupport(a);var d=c.getTypeOf(b),e=k[d][a](b);return e},c.getTypeOf=function(a){return"string"==typeof a?"string":"[object Array]"===Object.prototype.toString.call(a)?"array":h.nodebuffer&&j.test(a)?"nodebuffer":h.uint8array&&a instanceof Uint8Array?"uint8array":h.arraybuffer&&a instanceof ArrayBuffer?"arraybuffer":void 0},c.checkSupport=function(a){var b=h[a.toLowerCase()];if(!b)throw new Error(a+" is not supported by this browser")},c.MAX_VALUE_16BITS=65535,c.MAX_VALUE_32BITS=-1,c.pretty=function(a){var b,c,d="";for(c=0;c<(a||"").length;c++)b=a.charCodeAt(c),d+="\\x"+(16>b?"0":"")+b.toString(16).toUpperCase();return d},c.findCompression=function(a){for(var b in i)if(i.hasOwnProperty(b)&&i[b].magic===a)return i[b];return null},c.isRegExp=function(a){return"[object RegExp]"===Object.prototype.toString.call(a)}},{"./compressions":3,"./nodeBuffer":11,"./support":17}],22:[function(a,b){"use strict";function c(a,b){this.files=[],this.loadOptions=b,a&&this.load(a)}var d=a("./stringReader"),e=a("./nodeBufferReader"),f=a("./uint8ArrayReader"),g=a("./utils"),h=a("./signature"),i=a("./zipEntry"),j=a("./support"),k=a("./object");c.prototype={checkSignature:function(a){var b=this.reader.readString(4);if(b!==a)throw new Error("Corrupted zip or bug : unexpected signature ("+g.pretty(b)+", expected "+g.pretty(a)+")")},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2),this.zipComment=this.reader.readString(this.zipCommentLength),this.zipComment=k.utf8decode(this.zipComment)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.versionMadeBy=this.reader.readString(2),this.versionNeeded=this.reader.readInt(2),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var a,b,c,d=this.zip64EndOfCentralSize-44,e=0;d>e;)a=this.reader.readInt(2),b=this.reader.readInt(4),c=this.reader.readString(b),this.zip64ExtensibleData[a]={id:a,length:b,value:c}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),this.disksCount>1)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var a,b;for(a=0;a<this.files.length;a++)b=this.files[a],this.reader.setIndex(b.localHeaderOffset),this.checkSignature(h.LOCAL_FILE_HEADER),b.readLocalPart(this.reader),b.handleUTF8()},readCentralDir:function(){var a;for(this.reader.setIndex(this.centralDirOffset);this.reader.readString(4)===h.CENTRAL_FILE_HEADER;)a=new i({zip64:this.zip64},this.loadOptions),a.readCentralPart(this.reader),this.files.push(a)},readEndOfCentral:function(){var a=this.reader.lastIndexOfSignature(h.CENTRAL_DIRECTORY_END);if(-1===a)throw new Error("Corrupted zip : can't find end of central directory");if(this.reader.setIndex(a),this.checkSignature(h.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===g.MAX_VALUE_16BITS||this.diskWithCentralDirStart===g.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===g.MAX_VALUE_16BITS||this.centralDirRecords===g.MAX_VALUE_16BITS||this.centralDirSize===g.MAX_VALUE_32BITS||this.centralDirOffset===g.MAX_VALUE_32BITS){if(this.zip64=!0,a=this.reader.lastIndexOfSignature(h.ZIP64_CENTRAL_DIRECTORY_LOCATOR),-1===a)throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator");this.reader.setIndex(a),this.checkSignature(h.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(h.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}},prepareReader:function(a){var b=g.getTypeOf(a);this.reader="string"!==b||j.uint8array?"nodebuffer"===b?new e(a):new f(g.transformTo("uint8array",a)):new d(a,this.loadOptions.optimizedBinaryString)},load:function(a){this.prepareReader(a),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},b.exports=c},{"./nodeBufferReader":12,"./object":13,"./signature":14,"./stringReader":15,"./support":17,"./uint8ArrayReader":18,"./utils":21,"./zipEntry":23}],23:[function(a,b){"use strict";function c(a,b){this.options=a,this.loadOptions=b}var d=a("./stringReader"),e=a("./utils"),f=a("./compressedObject"),g=a("./object");c.prototype={isEncrypted:function(){return 1===(1&this.bitFlag)},useUTF8:function(){return 2048===(2048&this.bitFlag)},prepareCompressedContent:function(a,b,c){return function(){var d=a.index;a.setIndex(b);var e=a.readData(c);return a.setIndex(d),e}},prepareContent:function(a,b,c,d,f){return function(){var a=e.transformTo(d.uncompressInputType,this.getCompressedContent()),b=d.uncompress(a);if(b.length!==f)throw new Error("Bug : uncompressed data size mismatch");return b}},readLocalPart:function(a){var b,c;if(a.skip(22),this.fileNameLength=a.readInt(2),c=a.readInt(2),this.fileName=a.readString(this.fileNameLength),a.skip(c),-1==this.compressedSize||-1==this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory (compressedSize == -1 || uncompressedSize == -1)");if(b=e.findCompression(this.compressionMethod),null===b)throw new Error("Corrupted zip : compression "+e.pretty(this.compressionMethod)+" unknown (inner file : "+this.fileName+")");if(this.decompressed=new f,this.decompressed.compressedSize=this.compressedSize,this.decompressed.uncompressedSize=this.uncompressedSize,this.decompressed.crc32=this.crc32,this.decompressed.compressionMethod=this.compressionMethod,this.decompressed.getCompressedContent=this.prepareCompressedContent(a,a.index,this.compressedSize,b),this.decompressed.getContent=this.prepareContent(a,a.index,this.compressedSize,b,this.uncompressedSize),this.loadOptions.checkCRC32&&(this.decompressed=e.transformTo("string",this.decompressed.getContent()),g.crc32(this.decompressed)!==this.crc32))throw new Error("Corrupted zip : CRC32 mismatch")},readCentralPart:function(a){if(this.versionMadeBy=a.readString(2),this.versionNeeded=a.readInt(2),this.bitFlag=a.readInt(2),this.compressionMethod=a.readString(2),this.date=a.readDate(),this.crc32=a.readInt(4),this.compressedSize=a.readInt(4),this.uncompressedSize=a.readInt(4),this.fileNameLength=a.readInt(2),this.extraFieldsLength=a.readInt(2),this.fileCommentLength=a.readInt(2),this.diskNumberStart=a.readInt(2),this.internalFileAttributes=a.readInt(2),this.externalFileAttributes=a.readInt(4),this.localHeaderOffset=a.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");this.fileName=a.readString(this.fileNameLength),this.readExtraFields(a),this.parseZIP64ExtraField(a),this.fileComment=a.readString(this.fileCommentLength),this.dir=16&this.externalFileAttributes?!0:!1},parseZIP64ExtraField:function(){if(this.extraFields[1]){var a=new d(this.extraFields[1].value);this.uncompressedSize===e.MAX_VALUE_32BITS&&(this.uncompressedSize=a.readInt(8)),this.compressedSize===e.MAX_VALUE_32BITS&&(this.compressedSize=a.readInt(8)),this.localHeaderOffset===e.MAX_VALUE_32BITS&&(this.localHeaderOffset=a.readInt(8)),this.diskNumberStart===e.MAX_VALUE_32BITS&&(this.diskNumberStart=a.readInt(4))}},readExtraFields:function(a){var b,c,d,e=a.index;for(this.extraFields=this.extraFields||{};a.index<e+this.extraFieldsLength;)b=a.readInt(2),c=a.readInt(2),d=a.readString(c),this.extraFields[b]={id:b,length:c,value:d}},handleUTF8:function(){if(this.useUTF8())this.fileName=g.utf8decode(this.fileName),this.fileComment=g.utf8decode(this.fileComment);else{var a=this.findExtraFieldUnicodePath();null!==a&&(this.fileName=a);var b=this.findExtraFieldUnicodeComment();null!==b&&(this.fileComment=b)}},findExtraFieldUnicodePath:function(){var a=this.extraFields[28789];if(a){var b=new d(a.value);return 1!==b.readInt(1)?null:g.crc32(this.fileName)!==b.readInt(4)?null:g.utf8decode(b.readString(a.length-5))}return null},findExtraFieldUnicodeComment:function(){var a=this.extraFields[25461];if(a){var b=new d(a.value);return 1!==b.readInt(1)?null:g.crc32(this.fileComment)!==b.readInt(4)?null:g.utf8decode(b.readString(a.length-5))}return null}},b.exports=c},{"./compressedObject":2,"./object":13,"./stringReader":15,"./utils":21}],24:[function(a,b){"use strict";var c=a("./lib/utils/common").assign,d=a("./lib/deflate"),e=a("./lib/inflate"),f=a("./lib/zlib/constants"),g={};c(g,d,e,f),b.exports=g},{"./lib/deflate":25,"./lib/inflate":26,"./lib/utils/common":27,"./lib/zlib/constants":30}],25:[function(a,b,c){"use strict";function d(a,b){var c=new s(b);if(c.push(a,!0),c.err)throw c.msg;return c.result}function e(a,b){return b=b||{},b.raw=!0,d(a,b)}function f(a,b){return b=b||{},b.gzip=!0,d(a,b)}var g=a("./zlib/deflate.js"),h=a("./utils/common"),i=a("./utils/strings"),j=a("./zlib/messages"),k=a("./zlib/zstream"),l=0,m=4,n=0,o=1,p=-1,q=0,r=8,s=function(a){this.options=h.assign({level:p,method:r,chunkSize:16384,windowBits:15,memLevel:8,strategy:q,to:""},a||{});var b=this.options;b.raw&&b.windowBits>0?b.windowBits=-b.windowBits:b.gzip&&b.windowBits>0&&b.windowBits<16&&(b.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new k,this.strm.avail_out=0;var c=g.deflateInit2(this.strm,b.level,b.method,b.windowBits,b.memLevel,b.strategy);if(c!==n)throw new Error(j[c]);b.header&&g.deflateSetHeader(this.strm,b.header)
};s.prototype.push=function(a,b){var c,d,e=this.strm,f=this.options.chunkSize;if(this.ended)return!1;d=b===~~b?b:b===!0?m:l,e.input="string"==typeof a?i.string2buf(a):a,e.next_in=0,e.avail_in=e.input.length;do{if(0===e.avail_out&&(e.output=new h.Buf8(f),e.next_out=0,e.avail_out=f),c=g.deflate(e,d),c!==o&&c!==n)return this.onEnd(c),this.ended=!0,!1;(0===e.avail_out||0===e.avail_in&&d===m)&&this.onData("string"===this.options.to?i.buf2binstring(h.shrinkBuf(e.output,e.next_out)):h.shrinkBuf(e.output,e.next_out))}while((e.avail_in>0||0===e.avail_out)&&c!==o);return d===m?(c=g.deflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===n):!0},s.prototype.onData=function(a){this.chunks.push(a)},s.prototype.onEnd=function(a){a===n&&(this.result="string"===this.options.to?this.chunks.join(""):h.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},c.Deflate=s,c.deflate=d,c.deflateRaw=e,c.gzip=f},{"./utils/common":27,"./utils/strings":28,"./zlib/deflate.js":32,"./zlib/messages":37,"./zlib/zstream":39}],26:[function(a,b,c){"use strict";function d(a,b){var c=new m(b);if(c.push(a,!0),c.err)throw c.msg;return c.result}function e(a,b){return b=b||{},b.raw=!0,d(a,b)}var f=a("./zlib/inflate.js"),g=a("./utils/common"),h=a("./utils/strings"),i=a("./zlib/constants"),j=a("./zlib/messages"),k=a("./zlib/zstream"),l=a("./zlib/gzheader"),m=function(a){this.options=g.assign({chunkSize:16384,windowBits:0,to:""},a||{});var b=this.options;b.raw&&b.windowBits>=0&&b.windowBits<16&&(b.windowBits=-b.windowBits,0===b.windowBits&&(b.windowBits=-15)),!(b.windowBits>=0&&b.windowBits<16)||a&&a.windowBits||(b.windowBits+=32),b.windowBits>15&&b.windowBits<48&&0===(15&b.windowBits)&&(b.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new k,this.strm.avail_out=0;var c=f.inflateInit2(this.strm,b.windowBits);if(c!==i.Z_OK)throw new Error(j[c]);this.header=new l,f.inflateGetHeader(this.strm,this.header)};m.prototype.push=function(a,b){var c,d,e,j,k,l=this.strm,m=this.options.chunkSize;if(this.ended)return!1;d=b===~~b?b:b===!0?i.Z_FINISH:i.Z_NO_FLUSH,l.input="string"==typeof a?h.binstring2buf(a):a,l.next_in=0,l.avail_in=l.input.length;do{if(0===l.avail_out&&(l.output=new g.Buf8(m),l.next_out=0,l.avail_out=m),c=f.inflate(l,i.Z_NO_FLUSH),c!==i.Z_STREAM_END&&c!==i.Z_OK)return this.onEnd(c),this.ended=!0,!1;l.next_out&&(0===l.avail_out||c===i.Z_STREAM_END||0===l.avail_in&&d===i.Z_FINISH)&&("string"===this.options.to?(e=h.utf8border(l.output,l.next_out),j=l.next_out-e,k=h.buf2string(l.output,e),l.next_out=j,l.avail_out=m-j,j&&g.arraySet(l.output,l.output,e,j,0),this.onData(k)):this.onData(g.shrinkBuf(l.output,l.next_out)))}while(l.avail_in>0&&c!==i.Z_STREAM_END);return c===i.Z_STREAM_END&&(d=i.Z_FINISH),d===i.Z_FINISH?(c=f.inflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===i.Z_OK):!0},m.prototype.onData=function(a){this.chunks.push(a)},m.prototype.onEnd=function(a){a===i.Z_OK&&(this.result="string"===this.options.to?this.chunks.join(""):g.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},c.Inflate=m,c.inflate=d,c.inflateRaw=e,c.ungzip=d},{"./utils/common":27,"./utils/strings":28,"./zlib/constants":30,"./zlib/gzheader":33,"./zlib/inflate.js":35,"./zlib/messages":37,"./zlib/zstream":39}],27:[function(a,b,c){"use strict";var d="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;c.assign=function(a){for(var b=Array.prototype.slice.call(arguments,1);b.length;){var c=b.shift();if(c){if("object"!=typeof c)throw new TypeError(c+"must be non-object");for(var d in c)c.hasOwnProperty(d)&&(a[d]=c[d])}}return a},c.shrinkBuf=function(a,b){return a.length===b?a:a.subarray?a.subarray(0,b):(a.length=b,a)};var e={arraySet:function(a,b,c,d,e){if(b.subarray&&a.subarray)return void a.set(b.subarray(c,c+d),e);for(var f=0;d>f;f++)a[e+f]=b[c+f]},flattenChunks:function(a){var b,c,d,e,f,g;for(d=0,b=0,c=a.length;c>b;b++)d+=a[b].length;for(g=new Uint8Array(d),e=0,b=0,c=a.length;c>b;b++)f=a[b],g.set(f,e),e+=f.length;return g}},f={arraySet:function(a,b,c,d,e){for(var f=0;d>f;f++)a[e+f]=b[c+f]},flattenChunks:function(a){return[].concat.apply([],a)}};c.setTyped=function(a){a?(c.Buf8=Uint8Array,c.Buf16=Uint16Array,c.Buf32=Int32Array,c.assign(c,e)):(c.Buf8=Array,c.Buf16=Array,c.Buf32=Array,c.assign(c,f))},c.setTyped(d)},{}],28:[function(a,b,c){"use strict";function d(a,b){if(65537>b&&(a.subarray&&g||!a.subarray&&f))return String.fromCharCode.apply(null,e.shrinkBuf(a,b));for(var c="",d=0;b>d;d++)c+=String.fromCharCode(a[d]);return c}var e=a("./common"),f=!0,g=!0;try{String.fromCharCode.apply(null,[0])}catch(h){f=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(h){g=!1}for(var i=new e.Buf8(256),j=0;256>j;j++)i[j]=j>=252?6:j>=248?5:j>=240?4:j>=224?3:j>=192?2:1;i[254]=i[254]=1,c.string2buf=function(a){var b,c,d,f,g,h=a.length,i=0;for(f=0;h>f;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),i+=128>c?1:2048>c?2:65536>c?3:4;for(b=new e.Buf8(i),g=0,f=0;i>g;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),128>c?b[g++]=c:2048>c?(b[g++]=192|c>>>6,b[g++]=128|63&c):65536>c?(b[g++]=224|c>>>12,b[g++]=128|c>>>6&63,b[g++]=128|63&c):(b[g++]=240|c>>>18,b[g++]=128|c>>>12&63,b[g++]=128|c>>>6&63,b[g++]=128|63&c);return b},c.buf2binstring=function(a){return d(a,a.length)},c.binstring2buf=function(a){for(var b=new e.Buf8(a.length),c=0,d=b.length;d>c;c++)b[c]=a.charCodeAt(c);return b},c.buf2string=function(a,b){var c,e,f,g,h=b||a.length,j=new Array(2*h);for(e=0,c=0;h>c;)if(f=a[c++],128>f)j[e++]=f;else if(g=i[f],g>4)j[e++]=65533,c+=g-1;else{for(f&=2===g?31:3===g?15:7;g>1&&h>c;)f=f<<6|63&a[c++],g--;g>1?j[e++]=65533:65536>f?j[e++]=f:(f-=65536,j[e++]=55296|f>>10&1023,j[e++]=56320|1023&f)}return d(j,e)},c.utf8border=function(a,b){var c;for(b=b||a.length,b>a.length&&(b=a.length),c=b-1;c>=0&&128===(192&a[c]);)c--;return 0>c?b:0===c?b:c+i[a[c]]>b?c:b}},{"./common":27}],29:[function(a,b){"use strict";function c(a,b,c,d){for(var e=65535&a|0,f=a>>>16&65535|0,g=0;0!==c;){g=c>2e3?2e3:c,c-=g;do e=e+b[d++]|0,f=f+e|0;while(--g);e%=65521,f%=65521}return e|f<<16|0}b.exports=c},{}],30:[function(a,b){b.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],31:[function(a,b){"use strict";function c(){for(var a,b=[],c=0;256>c;c++){a=c;for(var d=0;8>d;d++)a=1&a?3988292384^a>>>1:a>>>1;b[c]=a}return b}function d(a,b,c,d){var f=e,g=d+c;a=-1^a;for(var h=d;g>h;h++)a=a>>>8^f[255&(a^b[h])];return-1^a}var e=c();b.exports=d},{}],32:[function(a,b,c){"use strict";function d(a,b){return a.msg=G[b],b}function e(a){return(a<<1)-(a>4?9:0)}function f(a){for(var b=a.length;--b>=0;)a[b]=0}function g(a){var b=a.state,c=b.pending;c>a.avail_out&&(c=a.avail_out),0!==c&&(C.arraySet(a.output,b.pending_buf,b.pending_out,c,a.next_out),a.next_out+=c,b.pending_out+=c,a.total_out+=c,a.avail_out-=c,b.pending-=c,0===b.pending&&(b.pending_out=0))}function h(a,b){D._tr_flush_block(a,a.block_start>=0?a.block_start:-1,a.strstart-a.block_start,b),a.block_start=a.strstart,g(a.strm)}function i(a,b){a.pending_buf[a.pending++]=b}function j(a,b){a.pending_buf[a.pending++]=b>>>8&255,a.pending_buf[a.pending++]=255&b}function k(a,b,c,d){var e=a.avail_in;return e>d&&(e=d),0===e?0:(a.avail_in-=e,C.arraySet(b,a.input,a.next_in,e,c),1===a.state.wrap?a.adler=E(a.adler,b,e,c):2===a.state.wrap&&(a.adler=F(a.adler,b,e,c)),a.next_in+=e,a.total_in+=e,e)}function l(a,b){var c,d,e=a.max_chain_length,f=a.strstart,g=a.prev_length,h=a.nice_match,i=a.strstart>a.w_size-jb?a.strstart-(a.w_size-jb):0,j=a.window,k=a.w_mask,l=a.prev,m=a.strstart+ib,n=j[f+g-1],o=j[f+g];a.prev_length>=a.good_match&&(e>>=2),h>a.lookahead&&(h=a.lookahead);do if(c=b,j[c+g]===o&&j[c+g-1]===n&&j[c]===j[f]&&j[++c]===j[f+1]){f+=2,c++;do;while(j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&m>f);if(d=ib-(m-f),f=m-ib,d>g){if(a.match_start=b,g=d,d>=h)break;n=j[f+g-1],o=j[f+g]}}while((b=l[b&k])>i&&0!==--e);return g<=a.lookahead?g:a.lookahead}function m(a){var b,c,d,e,f,g=a.w_size;do{if(e=a.window_size-a.lookahead-a.strstart,a.strstart>=g+(g-jb)){C.arraySet(a.window,a.window,g,g,0),a.match_start-=g,a.strstart-=g,a.block_start-=g,c=a.hash_size,b=c;do d=a.head[--b],a.head[b]=d>=g?d-g:0;while(--c);c=g,b=c;do d=a.prev[--b],a.prev[b]=d>=g?d-g:0;while(--c);e+=g}if(0===a.strm.avail_in)break;if(c=k(a.strm,a.window,a.strstart+a.lookahead,e),a.lookahead+=c,a.lookahead+a.insert>=hb)for(f=a.strstart-a.insert,a.ins_h=a.window[f],a.ins_h=(a.ins_h<<a.hash_shift^a.window[f+1])&a.hash_mask;a.insert&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[f+hb-1])&a.hash_mask,a.prev[f&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=f,f++,a.insert--,!(a.lookahead+a.insert<hb)););}while(a.lookahead<jb&&0!==a.strm.avail_in)}function n(a,b){var c=65535;for(c>a.pending_buf_size-5&&(c=a.pending_buf_size-5);;){if(a.lookahead<=1){if(m(a),0===a.lookahead&&b===H)return sb;if(0===a.lookahead)break}a.strstart+=a.lookahead,a.lookahead=0;var d=a.block_start+c;if((0===a.strstart||a.strstart>=d)&&(a.lookahead=a.strstart-d,a.strstart=d,h(a,!1),0===a.strm.avail_out))return sb;if(a.strstart-a.block_start>=a.w_size-jb&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.strstart>a.block_start&&(h(a,!1),0===a.strm.avail_out)?sb:sb}function o(a,b){for(var c,d;;){if(a.lookahead<jb){if(m(a),a.lookahead<jb&&b===H)return sb;if(0===a.lookahead)break}if(c=0,a.lookahead>=hb&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart),0!==c&&a.strstart-c<=a.w_size-jb&&(a.match_length=l(a,c)),a.match_length>=hb)if(d=D._tr_tally(a,a.strstart-a.match_start,a.match_length-hb),a.lookahead-=a.match_length,a.match_length<=a.max_lazy_match&&a.lookahead>=hb){a.match_length--;do a.strstart++,a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart;while(0!==--a.match_length);a.strstart++}else a.strstart+=a.match_length,a.match_length=0,a.ins_h=a.window[a.strstart],a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+1])&a.hash_mask;else d=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++;if(d&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=a.strstart<hb-1?a.strstart:hb-1,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function p(a,b){for(var c,d,e;;){if(a.lookahead<jb){if(m(a),a.lookahead<jb&&b===H)return sb;if(0===a.lookahead)break}if(c=0,a.lookahead>=hb&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart),a.prev_length=a.match_length,a.prev_match=a.match_start,a.match_length=hb-1,0!==c&&a.prev_length<a.max_lazy_match&&a.strstart-c<=a.w_size-jb&&(a.match_length=l(a,c),a.match_length<=5&&(a.strategy===S||a.match_length===hb&&a.strstart-a.match_start>4096)&&(a.match_length=hb-1)),a.prev_length>=hb&&a.match_length<=a.prev_length){e=a.strstart+a.lookahead-hb,d=D._tr_tally(a,a.strstart-1-a.prev_match,a.prev_length-hb),a.lookahead-=a.prev_length-1,a.prev_length-=2;do++a.strstart<=e&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart);while(0!==--a.prev_length);if(a.match_available=0,a.match_length=hb-1,a.strstart++,d&&(h(a,!1),0===a.strm.avail_out))return sb}else if(a.match_available){if(d=D._tr_tally(a,0,a.window[a.strstart-1]),d&&h(a,!1),a.strstart++,a.lookahead--,0===a.strm.avail_out)return sb}else a.match_available=1,a.strstart++,a.lookahead--}return a.match_available&&(d=D._tr_tally(a,0,a.window[a.strstart-1]),a.match_available=0),a.insert=a.strstart<hb-1?a.strstart:hb-1,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function q(a,b){for(var c,d,e,f,g=a.window;;){if(a.lookahead<=ib){if(m(a),a.lookahead<=ib&&b===H)return sb;if(0===a.lookahead)break}if(a.match_length=0,a.lookahead>=hb&&a.strstart>0&&(e=a.strstart-1,d=g[e],d===g[++e]&&d===g[++e]&&d===g[++e])){f=a.strstart+ib;do;while(d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&f>e);a.match_length=ib-(f-e),a.match_length>a.lookahead&&(a.match_length=a.lookahead)}if(a.match_length>=hb?(c=D._tr_tally(a,1,a.match_length-hb),a.lookahead-=a.match_length,a.strstart+=a.match_length,a.match_length=0):(c=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++),c&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function r(a,b){for(var c;;){if(0===a.lookahead&&(m(a),0===a.lookahead)){if(b===H)return sb;break}if(a.match_length=0,c=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++,c&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function s(a){a.window_size=2*a.w_size,f(a.head),a.max_lazy_match=B[a.level].max_lazy,a.good_match=B[a.level].good_length,a.nice_match=B[a.level].nice_length,a.max_chain_length=B[a.level].max_chain,a.strstart=0,a.block_start=0,a.lookahead=0,a.insert=0,a.match_length=a.prev_length=hb-1,a.match_available=0,a.ins_h=0}function t(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=Y,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new C.Buf16(2*fb),this.dyn_dtree=new C.Buf16(2*(2*db+1)),this.bl_tree=new C.Buf16(2*(2*eb+1)),f(this.dyn_ltree),f(this.dyn_dtree),f(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new C.Buf16(gb+1),this.heap=new C.Buf16(2*cb+1),f(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new C.Buf16(2*cb+1),f(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function u(a){var b;return a&&a.state?(a.total_in=a.total_out=0,a.data_type=X,b=a.state,b.pending=0,b.pending_out=0,b.wrap<0&&(b.wrap=-b.wrap),b.status=b.wrap?lb:qb,a.adler=2===b.wrap?0:1,b.last_flush=H,D._tr_init(b),M):d(a,O)}function v(a){var b=u(a);return b===M&&s(a.state),b}function w(a,b){return a&&a.state?2!==a.state.wrap?O:(a.state.gzhead=b,M):O}function x(a,b,c,e,f,g){if(!a)return O;var h=1;if(b===R&&(b=6),0>e?(h=0,e=-e):e>15&&(h=2,e-=16),1>f||f>Z||c!==Y||8>e||e>15||0>b||b>9||0>g||g>V)return d(a,O);8===e&&(e=9);var i=new t;return a.state=i,i.strm=a,i.wrap=h,i.gzhead=null,i.w_bits=e,i.w_size=1<<i.w_bits,i.w_mask=i.w_size-1,i.hash_bits=f+7,i.hash_size=1<<i.hash_bits,i.hash_mask=i.hash_size-1,i.hash_shift=~~((i.hash_bits+hb-1)/hb),i.window=new C.Buf8(2*i.w_size),i.head=new C.Buf16(i.hash_size),i.prev=new C.Buf16(i.w_size),i.lit_bufsize=1<<f+6,i.pending_buf_size=4*i.lit_bufsize,i.pending_buf=new C.Buf8(i.pending_buf_size),i.d_buf=i.lit_bufsize>>1,i.l_buf=3*i.lit_bufsize,i.level=b,i.strategy=g,i.method=c,v(a)}function y(a,b){return x(a,b,Y,$,_,W)}function z(a,b){var c,h,k,l;if(!a||!a.state||b>L||0>b)return a?d(a,O):O;if(h=a.state,!a.output||!a.input&&0!==a.avail_in||h.status===rb&&b!==K)return d(a,0===a.avail_out?Q:O);if(h.strm=a,c=h.last_flush,h.last_flush=b,h.status===lb)if(2===h.wrap)a.adler=0,i(h,31),i(h,139),i(h,8),h.gzhead?(i(h,(h.gzhead.text?1:0)+(h.gzhead.hcrc?2:0)+(h.gzhead.extra?4:0)+(h.gzhead.name?8:0)+(h.gzhead.comment?16:0)),i(h,255&h.gzhead.time),i(h,h.gzhead.time>>8&255),i(h,h.gzhead.time>>16&255),i(h,h.gzhead.time>>24&255),i(h,9===h.level?2:h.strategy>=T||h.level<2?4:0),i(h,255&h.gzhead.os),h.gzhead.extra&&h.gzhead.extra.length&&(i(h,255&h.gzhead.extra.length),i(h,h.gzhead.extra.length>>8&255)),h.gzhead.hcrc&&(a.adler=F(a.adler,h.pending_buf,h.pending,0)),h.gzindex=0,h.status=mb):(i(h,0),i(h,0),i(h,0),i(h,0),i(h,0),i(h,9===h.level?2:h.strategy>=T||h.level<2?4:0),i(h,wb),h.status=qb);else{var m=Y+(h.w_bits-8<<4)<<8,n=-1;n=h.strategy>=T||h.level<2?0:h.level<6?1:6===h.level?2:3,m|=n<<6,0!==h.strstart&&(m|=kb),m+=31-m%31,h.status=qb,j(h,m),0!==h.strstart&&(j(h,a.adler>>>16),j(h,65535&a.adler)),a.adler=1}if(h.status===mb)if(h.gzhead.extra){for(k=h.pending;h.gzindex<(65535&h.gzhead.extra.length)&&(h.pending!==h.pending_buf_size||(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending!==h.pending_buf_size));)i(h,255&h.gzhead.extra[h.gzindex]),h.gzindex++;h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),h.gzindex===h.gzhead.extra.length&&(h.gzindex=0,h.status=nb)}else h.status=nb;if(h.status===nb)if(h.gzhead.name){k=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending===h.pending_buf_size)){l=1;break}l=h.gzindex<h.gzhead.name.length?255&h.gzhead.name.charCodeAt(h.gzindex++):0,i(h,l)}while(0!==l);h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),0===l&&(h.gzindex=0,h.status=ob)}else h.status=ob;if(h.status===ob)if(h.gzhead.comment){k=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending===h.pending_buf_size)){l=1;break}l=h.gzindex<h.gzhead.comment.length?255&h.gzhead.comment.charCodeAt(h.gzindex++):0,i(h,l)}while(0!==l);h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),0===l&&(h.status=pb)}else h.status=pb;if(h.status===pb&&(h.gzhead.hcrc?(h.pending+2>h.pending_buf_size&&g(a),h.pending+2<=h.pending_buf_size&&(i(h,255&a.adler),i(h,a.adler>>8&255),a.adler=0,h.status=qb)):h.status=qb),0!==h.pending){if(g(a),0===a.avail_out)return h.last_flush=-1,M}else if(0===a.avail_in&&e(b)<=e(c)&&b!==K)return d(a,Q);if(h.status===rb&&0!==a.avail_in)return d(a,Q);if(0!==a.avail_in||0!==h.lookahead||b!==H&&h.status!==rb){var o=h.strategy===T?r(h,b):h.strategy===U?q(h,b):B[h.level].func(h,b);if((o===ub||o===vb)&&(h.status=rb),o===sb||o===ub)return 0===a.avail_out&&(h.last_flush=-1),M;if(o===tb&&(b===I?D._tr_align(h):b!==L&&(D._tr_stored_block(h,0,0,!1),b===J&&(f(h.head),0===h.lookahead&&(h.strstart=0,h.block_start=0,h.insert=0))),g(a),0===a.avail_out))return h.last_flush=-1,M}return b!==K?M:h.wrap<=0?N:(2===h.wrap?(i(h,255&a.adler),i(h,a.adler>>8&255),i(h,a.adler>>16&255),i(h,a.adler>>24&255),i(h,255&a.total_in),i(h,a.total_in>>8&255),i(h,a.total_in>>16&255),i(h,a.total_in>>24&255)):(j(h,a.adler>>>16),j(h,65535&a.adler)),g(a),h.wrap>0&&(h.wrap=-h.wrap),0!==h.pending?M:N)}function A(a){var b;return a&&a.state?(b=a.state.status,b!==lb&&b!==mb&&b!==nb&&b!==ob&&b!==pb&&b!==qb&&b!==rb?d(a,O):(a.state=null,b===qb?d(a,P):M)):O}var B,C=a("../utils/common"),D=a("./trees"),E=a("./adler32"),F=a("./crc32"),G=a("./messages"),H=0,I=1,J=3,K=4,L=5,M=0,N=1,O=-2,P=-3,Q=-5,R=-1,S=1,T=2,U=3,V=4,W=0,X=2,Y=8,Z=9,$=15,_=8,ab=29,bb=256,cb=bb+1+ab,db=30,eb=19,fb=2*cb+1,gb=15,hb=3,ib=258,jb=ib+hb+1,kb=32,lb=42,mb=69,nb=73,ob=91,pb=103,qb=113,rb=666,sb=1,tb=2,ub=3,vb=4,wb=3,xb=function(a,b,c,d,e){this.good_length=a,this.max_lazy=b,this.nice_length=c,this.max_chain=d,this.func=e};B=[new xb(0,0,0,0,n),new xb(4,4,8,4,o),new xb(4,5,16,8,o),new xb(4,6,32,32,o),new xb(4,4,16,16,p),new xb(8,16,32,32,p),new xb(8,16,128,128,p),new xb(8,32,128,256,p),new xb(32,128,258,1024,p),new xb(32,258,258,4096,p)],c.deflateInit=y,c.deflateInit2=x,c.deflateReset=v,c.deflateResetKeep=u,c.deflateSetHeader=w,c.deflate=z,c.deflateEnd=A,c.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":27,"./adler32":29,"./crc32":31,"./messages":37,"./trees":38}],33:[function(a,b){"use strict";function c(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}b.exports=c},{}],34:[function(a,b){"use strict";var c=30,d=12;b.exports=function(a,b){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C;e=a.state,f=a.next_in,B=a.input,g=f+(a.avail_in-5),h=a.next_out,C=a.output,i=h-(b-a.avail_out),j=h+(a.avail_out-257),k=e.dmax,l=e.wsize,m=e.whave,n=e.wnext,o=e.window,p=e.hold,q=e.bits,r=e.lencode,s=e.distcode,t=(1<<e.lenbits)-1,u=(1<<e.distbits)-1;a:do{15>q&&(p+=B[f++]<<q,q+=8,p+=B[f++]<<q,q+=8),v=r[p&t];b:for(;;){if(w=v>>>24,p>>>=w,q-=w,w=v>>>16&255,0===w)C[h++]=65535&v;else{if(!(16&w)){if(0===(64&w)){v=r[(65535&v)+(p&(1<<w)-1)];continue b}if(32&w){e.mode=d;break a}a.msg="invalid literal/length code",e.mode=c;break a}x=65535&v,w&=15,w&&(w>q&&(p+=B[f++]<<q,q+=8),x+=p&(1<<w)-1,p>>>=w,q-=w),15>q&&(p+=B[f++]<<q,q+=8,p+=B[f++]<<q,q+=8),v=s[p&u];c:for(;;){if(w=v>>>24,p>>>=w,q-=w,w=v>>>16&255,!(16&w)){if(0===(64&w)){v=s[(65535&v)+(p&(1<<w)-1)];continue c}a.msg="invalid distance code",e.mode=c;break a}if(y=65535&v,w&=15,w>q&&(p+=B[f++]<<q,q+=8,w>q&&(p+=B[f++]<<q,q+=8)),y+=p&(1<<w)-1,y>k){a.msg="invalid distance too far back",e.mode=c;break a}if(p>>>=w,q-=w,w=h-i,y>w){if(w=y-w,w>m&&e.sane){a.msg="invalid distance too far back",e.mode=c;break a}if(z=0,A=o,0===n){if(z+=l-w,x>w){x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}}else if(w>n){if(z+=l+n-w,w-=n,x>w){x-=w;do C[h++]=o[z++];while(--w);if(z=0,x>n){w=n,x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}}}else if(z+=n-w,x>w){x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}for(;x>2;)C[h++]=A[z++],C[h++]=A[z++],C[h++]=A[z++],x-=3;x&&(C[h++]=A[z++],x>1&&(C[h++]=A[z++]))}else{z=h-y;do C[h++]=C[z++],C[h++]=C[z++],C[h++]=C[z++],x-=3;while(x>2);x&&(C[h++]=C[z++],x>1&&(C[h++]=C[z++]))}break}}break}}while(g>f&&j>h);x=q>>3,f-=x,q-=x<<3,p&=(1<<q)-1,a.next_in=f,a.next_out=h,a.avail_in=g>f?5+(g-f):5-(f-g),a.avail_out=j>h?257+(j-h):257-(h-j),e.hold=p,e.bits=q}},{}],35:[function(a,b,c){"use strict";function d(a){return(a>>>24&255)+(a>>>8&65280)+((65280&a)<<8)+((255&a)<<24)}function e(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new r.Buf16(320),this.work=new r.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function f(a){var b;return a&&a.state?(b=a.state,a.total_in=a.total_out=b.total=0,a.msg="",b.wrap&&(a.adler=1&b.wrap),b.mode=K,b.last=0,b.havedict=0,b.dmax=32768,b.head=null,b.hold=0,b.bits=0,b.lencode=b.lendyn=new r.Buf32(ob),b.distcode=b.distdyn=new r.Buf32(pb),b.sane=1,b.back=-1,C):F}function g(a){var b;return a&&a.state?(b=a.state,b.wsize=0,b.whave=0,b.wnext=0,f(a)):F}function h(a,b){var c,d;return a&&a.state?(d=a.state,0>b?(c=0,b=-b):(c=(b>>4)+1,48>b&&(b&=15)),b&&(8>b||b>15)?F:(null!==d.window&&d.wbits!==b&&(d.window=null),d.wrap=c,d.wbits=b,g(a))):F}function i(a,b){var c,d;return a?(d=new e,a.state=d,d.window=null,c=h(a,b),c!==C&&(a.state=null),c):F}function j(a){return i(a,rb)}function k(a){if(sb){var b;for(p=new r.Buf32(512),q=new r.Buf32(32),b=0;144>b;)a.lens[b++]=8;for(;256>b;)a.lens[b++]=9;for(;280>b;)a.lens[b++]=7;for(;288>b;)a.lens[b++]=8;for(v(x,a.lens,0,288,p,0,a.work,{bits:9}),b=0;32>b;)a.lens[b++]=5;v(y,a.lens,0,32,q,0,a.work,{bits:5}),sb=!1}a.lencode=p,a.lenbits=9,a.distcode=q,a.distbits=5}function l(a,b,c,d){var e,f=a.state;return null===f.window&&(f.wsize=1<<f.wbits,f.wnext=0,f.whave=0,f.window=new r.Buf8(f.wsize)),d>=f.wsize?(r.arraySet(f.window,b,c-f.wsize,f.wsize,0),f.wnext=0,f.whave=f.wsize):(e=f.wsize-f.wnext,e>d&&(e=d),r.arraySet(f.window,b,c-d,e,f.wnext),d-=e,d?(r.arraySet(f.window,b,c-d,d,0),f.wnext=d,f.whave=f.wsize):(f.wnext+=e,f.wnext===f.wsize&&(f.wnext=0),f.whave<f.wsize&&(f.whave+=e))),0}function m(a,b){var c,e,f,g,h,i,j,m,n,o,p,q,ob,pb,qb,rb,sb,tb,ub,vb,wb,xb,yb,zb,Ab=0,Bb=new r.Buf8(4),Cb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!a||!a.state||!a.output||!a.input&&0!==a.avail_in)return F;c=a.state,c.mode===V&&(c.mode=W),h=a.next_out,f=a.output,j=a.avail_out,g=a.next_in,e=a.input,i=a.avail_in,m=c.hold,n=c.bits,o=i,p=j,xb=C;a:for(;;)switch(c.mode){case K:if(0===c.wrap){c.mode=W;break}for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(2&c.wrap&&35615===m){c.check=0,Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0),m=0,n=0,c.mode=L;break}if(c.flags=0,c.head&&(c.head.done=!1),!(1&c.wrap)||(((255&m)<<8)+(m>>8))%31){a.msg="incorrect header check",c.mode=lb;break}if((15&m)!==J){a.msg="unknown compression method",c.mode=lb;break}if(m>>>=4,n-=4,wb=(15&m)+8,0===c.wbits)c.wbits=wb;else if(wb>c.wbits){a.msg="invalid window size",c.mode=lb;break}c.dmax=1<<wb,a.adler=c.check=1,c.mode=512&m?T:V,m=0,n=0;break;case L:for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(c.flags=m,(255&c.flags)!==J){a.msg="unknown compression method",c.mode=lb;break}if(57344&c.flags){a.msg="unknown header flags set",c.mode=lb;break}c.head&&(c.head.text=m>>8&1),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0,c.mode=M;case M:for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.head&&(c.head.time=m),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,Bb[2]=m>>>16&255,Bb[3]=m>>>24&255,c.check=t(c.check,Bb,4,0)),m=0,n=0,c.mode=N;case N:for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.head&&(c.head.xflags=255&m,c.head.os=m>>8),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0,c.mode=O;case O:if(1024&c.flags){for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.length=m,c.head&&(c.head.extra_len=m),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0}else c.head&&(c.head.extra=null);c.mode=P;case P:if(1024&c.flags&&(q=c.length,q>i&&(q=i),q&&(c.head&&(wb=c.head.extra_len-c.length,c.head.extra||(c.head.extra=new Array(c.head.extra_len)),r.arraySet(c.head.extra,e,g,q,wb)),512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,c.length-=q),c.length))break a;c.length=0,c.mode=Q;case Q:if(2048&c.flags){if(0===i)break a;q=0;do wb=e[g+q++],c.head&&wb&&c.length<65536&&(c.head.name+=String.fromCharCode(wb));while(wb&&i>q);if(512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,wb)break a}else c.head&&(c.head.name=null);c.length=0,c.mode=R;case R:if(4096&c.flags){if(0===i)break a;q=0;do wb=e[g+q++],c.head&&wb&&c.length<65536&&(c.head.comment+=String.fromCharCode(wb));while(wb&&i>q);if(512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,wb)break a}else c.head&&(c.head.comment=null);c.mode=S;case S:if(512&c.flags){for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m!==(65535&c.check)){a.msg="header crc mismatch",c.mode=lb;break}m=0,n=0}c.head&&(c.head.hcrc=c.flags>>9&1,c.head.done=!0),a.adler=c.check=0,c.mode=V;break;case T:for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}a.adler=c.check=d(m),m=0,n=0,c.mode=U;case U:if(0===c.havedict)return a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,E;a.adler=c.check=1,c.mode=V;case V:if(b===A||b===B)break a;case W:if(c.last){m>>>=7&n,n-=7&n,c.mode=ib;break}for(;3>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}switch(c.last=1&m,m>>>=1,n-=1,3&m){case 0:c.mode=X;break;case 1:if(k(c),c.mode=bb,b===B){m>>>=2,n-=2;break a}break;case 2:c.mode=$;break;case 3:a.msg="invalid block type",c.mode=lb}m>>>=2,n-=2;break;case X:for(m>>>=7&n,n-=7&n;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if((65535&m)!==(m>>>16^65535)){a.msg="invalid stored block lengths",c.mode=lb;break}if(c.length=65535&m,m=0,n=0,c.mode=Y,b===B)break a;case Y:c.mode=Z;case Z:if(q=c.length){if(q>i&&(q=i),q>j&&(q=j),0===q)break a;r.arraySet(f,e,g,q,h),i-=q,g+=q,j-=q,h+=q,c.length-=q;break}c.mode=V;break;case $:for(;14>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(c.nlen=(31&m)+257,m>>>=5,n-=5,c.ndist=(31&m)+1,m>>>=5,n-=5,c.ncode=(15&m)+4,m>>>=4,n-=4,c.nlen>286||c.ndist>30){a.msg="too many length or distance symbols",c.mode=lb;break}c.have=0,c.mode=_;case _:for(;c.have<c.ncode;){for(;3>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.lens[Cb[c.have++]]=7&m,m>>>=3,n-=3}for(;c.have<19;)c.lens[Cb[c.have++]]=0;if(c.lencode=c.lendyn,c.lenbits=7,yb={bits:c.lenbits},xb=v(w,c.lens,0,19,c.lencode,0,c.work,yb),c.lenbits=yb.bits,xb){a.msg="invalid code lengths set",c.mode=lb;break}c.have=0,c.mode=ab;case ab:for(;c.have<c.nlen+c.ndist;){for(;Ab=c.lencode[m&(1<<c.lenbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(16>sb)m>>>=qb,n-=qb,c.lens[c.have++]=sb;else{if(16===sb){for(zb=qb+2;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m>>>=qb,n-=qb,0===c.have){a.msg="invalid bit length repeat",c.mode=lb;break}wb=c.lens[c.have-1],q=3+(3&m),m>>>=2,n-=2}else if(17===sb){for(zb=qb+3;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=qb,n-=qb,wb=0,q=3+(7&m),m>>>=3,n-=3}else{for(zb=qb+7;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=qb,n-=qb,wb=0,q=11+(127&m),m>>>=7,n-=7}if(c.have+q>c.nlen+c.ndist){a.msg="invalid bit length repeat",c.mode=lb;break}for(;q--;)c.lens[c.have++]=wb}}if(c.mode===lb)break;if(0===c.lens[256]){a.msg="invalid code -- missing end-of-block",c.mode=lb;break}if(c.lenbits=9,yb={bits:c.lenbits},xb=v(x,c.lens,0,c.nlen,c.lencode,0,c.work,yb),c.lenbits=yb.bits,xb){a.msg="invalid literal/lengths set",c.mode=lb;break}if(c.distbits=6,c.distcode=c.distdyn,yb={bits:c.distbits},xb=v(y,c.lens,c.nlen,c.ndist,c.distcode,0,c.work,yb),c.distbits=yb.bits,xb){a.msg="invalid distances set",c.mode=lb;break}if(c.mode=bb,b===B)break a;case bb:c.mode=cb;case cb:if(i>=6&&j>=258){a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,u(a,p),h=a.next_out,f=a.output,j=a.avail_out,g=a.next_in,e=a.input,i=a.avail_in,m=c.hold,n=c.bits,c.mode===V&&(c.back=-1);break}for(c.back=0;Ab=c.lencode[m&(1<<c.lenbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(rb&&0===(240&rb)){for(tb=qb,ub=rb,vb=sb;Ab=c.lencode[vb+((m&(1<<tb+ub)-1)>>tb)],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=tb+qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=tb,n-=tb,c.back+=tb}if(m>>>=qb,n-=qb,c.back+=qb,c.length=sb,0===rb){c.mode=hb;break}if(32&rb){c.back=-1,c.mode=V;break}if(64&rb){a.msg="invalid literal/length code",c.mode=lb;break}c.extra=15&rb,c.mode=db;case db:if(c.extra){for(zb=c.extra;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.length+=m&(1<<c.extra)-1,m>>>=c.extra,n-=c.extra,c.back+=c.extra}c.was=c.length,c.mode=eb;case eb:for(;Ab=c.distcode[m&(1<<c.distbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(0===(240&rb)){for(tb=qb,ub=rb,vb=sb;Ab=c.distcode[vb+((m&(1<<tb+ub)-1)>>tb)],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=tb+qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=tb,n-=tb,c.back+=tb}if(m>>>=qb,n-=qb,c.back+=qb,64&rb){a.msg="invalid distance code",c.mode=lb;break}c.offset=sb,c.extra=15&rb,c.mode=fb;case fb:if(c.extra){for(zb=c.extra;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.offset+=m&(1<<c.extra)-1,m>>>=c.extra,n-=c.extra,c.back+=c.extra}if(c.offset>c.dmax){a.msg="invalid distance too far back",c.mode=lb;break}c.mode=gb;case gb:if(0===j)break a;
if(q=p-j,c.offset>q){if(q=c.offset-q,q>c.whave&&c.sane){a.msg="invalid distance too far back",c.mode=lb;break}q>c.wnext?(q-=c.wnext,ob=c.wsize-q):ob=c.wnext-q,q>c.length&&(q=c.length),pb=c.window}else pb=f,ob=h-c.offset,q=c.length;q>j&&(q=j),j-=q,c.length-=q;do f[h++]=pb[ob++];while(--q);0===c.length&&(c.mode=cb);break;case hb:if(0===j)break a;f[h++]=c.length,j--,c.mode=cb;break;case ib:if(c.wrap){for(;32>n;){if(0===i)break a;i--,m|=e[g++]<<n,n+=8}if(p-=j,a.total_out+=p,c.total+=p,p&&(a.adler=c.check=c.flags?t(c.check,f,p,h-p):s(c.check,f,p,h-p)),p=j,(c.flags?m:d(m))!==c.check){a.msg="incorrect data check",c.mode=lb;break}m=0,n=0}c.mode=jb;case jb:if(c.wrap&&c.flags){for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m!==(4294967295&c.total)){a.msg="incorrect length check",c.mode=lb;break}m=0,n=0}c.mode=kb;case kb:xb=D;break a;case lb:xb=G;break a;case mb:return H;case nb:default:return F}return a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,(c.wsize||p!==a.avail_out&&c.mode<lb&&(c.mode<ib||b!==z))&&l(a,a.output,a.next_out,p-a.avail_out)?(c.mode=mb,H):(o-=a.avail_in,p-=a.avail_out,a.total_in+=o,a.total_out+=p,c.total+=p,c.wrap&&p&&(a.adler=c.check=c.flags?t(c.check,f,p,a.next_out-p):s(c.check,f,p,a.next_out-p)),a.data_type=c.bits+(c.last?64:0)+(c.mode===V?128:0)+(c.mode===bb||c.mode===Y?256:0),(0===o&&0===p||b===z)&&xb===C&&(xb=I),xb)}function n(a){if(!a||!a.state)return F;var b=a.state;return b.window&&(b.window=null),a.state=null,C}function o(a,b){var c;return a&&a.state?(c=a.state,0===(2&c.wrap)?F:(c.head=b,b.done=!1,C)):F}var p,q,r=a("../utils/common"),s=a("./adler32"),t=a("./crc32"),u=a("./inffast"),v=a("./inftrees"),w=0,x=1,y=2,z=4,A=5,B=6,C=0,D=1,E=2,F=-2,G=-3,H=-4,I=-5,J=8,K=1,L=2,M=3,N=4,O=5,P=6,Q=7,R=8,S=9,T=10,U=11,V=12,W=13,X=14,Y=15,Z=16,$=17,_=18,ab=19,bb=20,cb=21,db=22,eb=23,fb=24,gb=25,hb=26,ib=27,jb=28,kb=29,lb=30,mb=31,nb=32,ob=852,pb=592,qb=15,rb=qb,sb=!0;c.inflateReset=g,c.inflateReset2=h,c.inflateResetKeep=f,c.inflateInit=j,c.inflateInit2=i,c.inflate=m,c.inflateEnd=n,c.inflateGetHeader=o,c.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":27,"./adler32":29,"./crc32":31,"./inffast":34,"./inftrees":36}],36:[function(a,b){"use strict";var c=a("../utils/common"),d=15,e=852,f=592,g=0,h=1,i=2,j=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],k=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],l=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],m=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];b.exports=function(a,b,n,o,p,q,r,s){var t,u,v,w,x,y,z,A,B,C=s.bits,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=null,O=0,P=new c.Buf16(d+1),Q=new c.Buf16(d+1),R=null,S=0;for(D=0;d>=D;D++)P[D]=0;for(E=0;o>E;E++)P[b[n+E]]++;for(H=C,G=d;G>=1&&0===P[G];G--);if(H>G&&(H=G),0===G)return p[q++]=20971520,p[q++]=20971520,s.bits=1,0;for(F=1;G>F&&0===P[F];F++);for(F>H&&(H=F),K=1,D=1;d>=D;D++)if(K<<=1,K-=P[D],0>K)return-1;if(K>0&&(a===g||1!==G))return-1;for(Q[1]=0,D=1;d>D;D++)Q[D+1]=Q[D]+P[D];for(E=0;o>E;E++)0!==b[n+E]&&(r[Q[b[n+E]]++]=E);if(a===g?(N=R=r,y=19):a===h?(N=j,O-=257,R=k,S-=257,y=256):(N=l,R=m,y=-1),M=0,E=0,D=F,x=q,I=H,J=0,v=-1,L=1<<H,w=L-1,a===h&&L>e||a===i&&L>f)return 1;for(var T=0;;){T++,z=D-J,r[E]<y?(A=0,B=r[E]):r[E]>y?(A=R[S+r[E]],B=N[O+r[E]]):(A=96,B=0),t=1<<D-J,u=1<<I,F=u;do u-=t,p[x+(M>>J)+u]=z<<24|A<<16|B|0;while(0!==u);for(t=1<<D-1;M&t;)t>>=1;if(0!==t?(M&=t-1,M+=t):M=0,E++,0===--P[D]){if(D===G)break;D=b[n+r[E]]}if(D>H&&(M&w)!==v){for(0===J&&(J=H),x+=F,I=D-J,K=1<<I;G>I+J&&(K-=P[I+J],!(0>=K));)I++,K<<=1;if(L+=1<<I,a===h&&L>e||a===i&&L>f)return 1;v=M&w,p[v]=H<<24|I<<16|x-q|0}}return 0!==M&&(p[x+M]=D-J<<24|64<<16|0),s.bits=H,0}},{"../utils/common":27}],37:[function(a,b){"use strict";b.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],38:[function(a,b,c){"use strict";function d(a){for(var b=a.length;--b>=0;)a[b]=0}function e(a){return 256>a?gb[a]:gb[256+(a>>>7)]}function f(a,b){a.pending_buf[a.pending++]=255&b,a.pending_buf[a.pending++]=b>>>8&255}function g(a,b,c){a.bi_valid>V-c?(a.bi_buf|=b<<a.bi_valid&65535,f(a,a.bi_buf),a.bi_buf=b>>V-a.bi_valid,a.bi_valid+=c-V):(a.bi_buf|=b<<a.bi_valid&65535,a.bi_valid+=c)}function h(a,b,c){g(a,c[2*b],c[2*b+1])}function i(a,b){var c=0;do c|=1&a,a>>>=1,c<<=1;while(--b>0);return c>>>1}function j(a){16===a.bi_valid?(f(a,a.bi_buf),a.bi_buf=0,a.bi_valid=0):a.bi_valid>=8&&(a.pending_buf[a.pending++]=255&a.bi_buf,a.bi_buf>>=8,a.bi_valid-=8)}function k(a,b){var c,d,e,f,g,h,i=b.dyn_tree,j=b.max_code,k=b.stat_desc.static_tree,l=b.stat_desc.has_stree,m=b.stat_desc.extra_bits,n=b.stat_desc.extra_base,o=b.stat_desc.max_length,p=0;for(f=0;U>=f;f++)a.bl_count[f]=0;for(i[2*a.heap[a.heap_max]+1]=0,c=a.heap_max+1;T>c;c++)d=a.heap[c],f=i[2*i[2*d+1]+1]+1,f>o&&(f=o,p++),i[2*d+1]=f,d>j||(a.bl_count[f]++,g=0,d>=n&&(g=m[d-n]),h=i[2*d],a.opt_len+=h*(f+g),l&&(a.static_len+=h*(k[2*d+1]+g)));if(0!==p){do{for(f=o-1;0===a.bl_count[f];)f--;a.bl_count[f]--,a.bl_count[f+1]+=2,a.bl_count[o]--,p-=2}while(p>0);for(f=o;0!==f;f--)for(d=a.bl_count[f];0!==d;)e=a.heap[--c],e>j||(i[2*e+1]!==f&&(a.opt_len+=(f-i[2*e+1])*i[2*e],i[2*e+1]=f),d--)}}function l(a,b,c){var d,e,f=new Array(U+1),g=0;for(d=1;U>=d;d++)f[d]=g=g+c[d-1]<<1;for(e=0;b>=e;e++){var h=a[2*e+1];0!==h&&(a[2*e]=i(f[h]++,h))}}function m(){var a,b,c,d,e,f=new Array(U+1);for(c=0,d=0;O-1>d;d++)for(ib[d]=c,a=0;a<1<<_[d];a++)hb[c++]=d;for(hb[c-1]=d,e=0,d=0;16>d;d++)for(jb[d]=e,a=0;a<1<<ab[d];a++)gb[e++]=d;for(e>>=7;R>d;d++)for(jb[d]=e<<7,a=0;a<1<<ab[d]-7;a++)gb[256+e++]=d;for(b=0;U>=b;b++)f[b]=0;for(a=0;143>=a;)eb[2*a+1]=8,a++,f[8]++;for(;255>=a;)eb[2*a+1]=9,a++,f[9]++;for(;279>=a;)eb[2*a+1]=7,a++,f[7]++;for(;287>=a;)eb[2*a+1]=8,a++,f[8]++;for(l(eb,Q+1,f),a=0;R>a;a++)fb[2*a+1]=5,fb[2*a]=i(a,5);kb=new nb(eb,_,P+1,Q,U),lb=new nb(fb,ab,0,R,U),mb=new nb(new Array(0),bb,0,S,W)}function n(a){var b;for(b=0;Q>b;b++)a.dyn_ltree[2*b]=0;for(b=0;R>b;b++)a.dyn_dtree[2*b]=0;for(b=0;S>b;b++)a.bl_tree[2*b]=0;a.dyn_ltree[2*X]=1,a.opt_len=a.static_len=0,a.last_lit=a.matches=0}function o(a){a.bi_valid>8?f(a,a.bi_buf):a.bi_valid>0&&(a.pending_buf[a.pending++]=a.bi_buf),a.bi_buf=0,a.bi_valid=0}function p(a,b,c,d){o(a),d&&(f(a,c),f(a,~c)),E.arraySet(a.pending_buf,a.window,b,c,a.pending),a.pending+=c}function q(a,b,c,d){var e=2*b,f=2*c;return a[e]<a[f]||a[e]===a[f]&&d[b]<=d[c]}function r(a,b,c){for(var d=a.heap[c],e=c<<1;e<=a.heap_len&&(e<a.heap_len&&q(b,a.heap[e+1],a.heap[e],a.depth)&&e++,!q(b,d,a.heap[e],a.depth));)a.heap[c]=a.heap[e],c=e,e<<=1;a.heap[c]=d}function s(a,b,c){var d,f,i,j,k=0;if(0!==a.last_lit)do d=a.pending_buf[a.d_buf+2*k]<<8|a.pending_buf[a.d_buf+2*k+1],f=a.pending_buf[a.l_buf+k],k++,0===d?h(a,f,b):(i=hb[f],h(a,i+P+1,b),j=_[i],0!==j&&(f-=ib[i],g(a,f,j)),d--,i=e(d),h(a,i,c),j=ab[i],0!==j&&(d-=jb[i],g(a,d,j)));while(k<a.last_lit);h(a,X,b)}function t(a,b){var c,d,e,f=b.dyn_tree,g=b.stat_desc.static_tree,h=b.stat_desc.has_stree,i=b.stat_desc.elems,j=-1;for(a.heap_len=0,a.heap_max=T,c=0;i>c;c++)0!==f[2*c]?(a.heap[++a.heap_len]=j=c,a.depth[c]=0):f[2*c+1]=0;for(;a.heap_len<2;)e=a.heap[++a.heap_len]=2>j?++j:0,f[2*e]=1,a.depth[e]=0,a.opt_len--,h&&(a.static_len-=g[2*e+1]);for(b.max_code=j,c=a.heap_len>>1;c>=1;c--)r(a,f,c);e=i;do c=a.heap[1],a.heap[1]=a.heap[a.heap_len--],r(a,f,1),d=a.heap[1],a.heap[--a.heap_max]=c,a.heap[--a.heap_max]=d,f[2*e]=f[2*c]+f[2*d],a.depth[e]=(a.depth[c]>=a.depth[d]?a.depth[c]:a.depth[d])+1,f[2*c+1]=f[2*d+1]=e,a.heap[1]=e++,r(a,f,1);while(a.heap_len>=2);a.heap[--a.heap_max]=a.heap[1],k(a,b),l(f,j,a.bl_count)}function u(a,b,c){var d,e,f=-1,g=b[1],h=0,i=7,j=4;for(0===g&&(i=138,j=3),b[2*(c+1)+1]=65535,d=0;c>=d;d++)e=g,g=b[2*(d+1)+1],++h<i&&e===g||(j>h?a.bl_tree[2*e]+=h:0!==e?(e!==f&&a.bl_tree[2*e]++,a.bl_tree[2*Y]++):10>=h?a.bl_tree[2*Z]++:a.bl_tree[2*$]++,h=0,f=e,0===g?(i=138,j=3):e===g?(i=6,j=3):(i=7,j=4))}function v(a,b,c){var d,e,f=-1,i=b[1],j=0,k=7,l=4;for(0===i&&(k=138,l=3),d=0;c>=d;d++)if(e=i,i=b[2*(d+1)+1],!(++j<k&&e===i)){if(l>j){do h(a,e,a.bl_tree);while(0!==--j)}else 0!==e?(e!==f&&(h(a,e,a.bl_tree),j--),h(a,Y,a.bl_tree),g(a,j-3,2)):10>=j?(h(a,Z,a.bl_tree),g(a,j-3,3)):(h(a,$,a.bl_tree),g(a,j-11,7));j=0,f=e,0===i?(k=138,l=3):e===i?(k=6,l=3):(k=7,l=4)}}function w(a){var b;for(u(a,a.dyn_ltree,a.l_desc.max_code),u(a,a.dyn_dtree,a.d_desc.max_code),t(a,a.bl_desc),b=S-1;b>=3&&0===a.bl_tree[2*cb[b]+1];b--);return a.opt_len+=3*(b+1)+5+5+4,b}function x(a,b,c,d){var e;for(g(a,b-257,5),g(a,c-1,5),g(a,d-4,4),e=0;d>e;e++)g(a,a.bl_tree[2*cb[e]+1],3);v(a,a.dyn_ltree,b-1),v(a,a.dyn_dtree,c-1)}function y(a){var b,c=4093624447;for(b=0;31>=b;b++,c>>>=1)if(1&c&&0!==a.dyn_ltree[2*b])return G;if(0!==a.dyn_ltree[18]||0!==a.dyn_ltree[20]||0!==a.dyn_ltree[26])return H;for(b=32;P>b;b++)if(0!==a.dyn_ltree[2*b])return H;return G}function z(a){pb||(m(),pb=!0),a.l_desc=new ob(a.dyn_ltree,kb),a.d_desc=new ob(a.dyn_dtree,lb),a.bl_desc=new ob(a.bl_tree,mb),a.bi_buf=0,a.bi_valid=0,n(a)}function A(a,b,c,d){g(a,(J<<1)+(d?1:0),3),p(a,b,c,!0)}function B(a){g(a,K<<1,3),h(a,X,eb),j(a)}function C(a,b,c,d){var e,f,h=0;a.level>0?(a.strm.data_type===I&&(a.strm.data_type=y(a)),t(a,a.l_desc),t(a,a.d_desc),h=w(a),e=a.opt_len+3+7>>>3,f=a.static_len+3+7>>>3,e>=f&&(e=f)):e=f=c+5,e>=c+4&&-1!==b?A(a,b,c,d):a.strategy===F||f===e?(g(a,(K<<1)+(d?1:0),3),s(a,eb,fb)):(g(a,(L<<1)+(d?1:0),3),x(a,a.l_desc.max_code+1,a.d_desc.max_code+1,h+1),s(a,a.dyn_ltree,a.dyn_dtree)),n(a),d&&o(a)}function D(a,b,c){return a.pending_buf[a.d_buf+2*a.last_lit]=b>>>8&255,a.pending_buf[a.d_buf+2*a.last_lit+1]=255&b,a.pending_buf[a.l_buf+a.last_lit]=255&c,a.last_lit++,0===b?a.dyn_ltree[2*c]++:(a.matches++,b--,a.dyn_ltree[2*(hb[c]+P+1)]++,a.dyn_dtree[2*e(b)]++),a.last_lit===a.lit_bufsize-1}var E=a("../utils/common"),F=4,G=0,H=1,I=2,J=0,K=1,L=2,M=3,N=258,O=29,P=256,Q=P+1+O,R=30,S=19,T=2*Q+1,U=15,V=16,W=7,X=256,Y=16,Z=17,$=18,_=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],ab=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],bb=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],cb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],db=512,eb=new Array(2*(Q+2));d(eb);var fb=new Array(2*R);d(fb);var gb=new Array(db);d(gb);var hb=new Array(N-M+1);d(hb);var ib=new Array(O);d(ib);var jb=new Array(R);d(jb);var kb,lb,mb,nb=function(a,b,c,d,e){this.static_tree=a,this.extra_bits=b,this.extra_base=c,this.elems=d,this.max_length=e,this.has_stree=a&&a.length},ob=function(a,b){this.dyn_tree=a,this.max_code=0,this.stat_desc=b},pb=!1;c._tr_init=z,c._tr_stored_block=A,c._tr_flush_block=C,c._tr_tally=D,c._tr_align=B},{"../utils/common":27}],39:[function(a,b){"use strict";function c(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}b.exports=c},{}]},{},[9])(9)});
// File:editor/js/libs/sortable.min.js

/*! Sortable 1.0.1 - MIT | git://github.com/rubaxa/Sortable.git */
!function(a){"use strict";"function"==typeof define&&define.amd?define(a):"undefined"!=typeof module&&"undefined"!=typeof module.exports?module.exports=a():"undefined"!=typeof Package?Sortable=a():window.Sortable=a()}(function(){"use strict";function a(a,b){this.el=a,this.options=b=b||{};var d={group:Math.random(),sort:!0,disabled:!1,store:null,handle:null,scroll:!0,scrollSensitivity:30,scrollSpeed:10,draggable:/[uo]l/i.test(a.nodeName)?"li":">*",ghostClass:"sortable-ghost",ignore:"a, img",filter:null,animation:0,setData:function(a,b){a.setData("Text",b.textContent)},dropBubble:!1,dragoverBubble:!1};for(var e in d)!(e in b)&&(b[e]=d[e]);var g=b.group;g&&"object"==typeof g||(g=b.group={name:g}),["pull","put"].forEach(function(a){a in g||(g[a]=!0)}),L.forEach(function(d){b[d]=c(this,b[d]||M),f(a,d.substr(2).toLowerCase(),b[d])},this),a[E]=g.name+" "+(g.put.join?g.put.join(" "):"");for(var h in this)"_"===h.charAt(0)&&(this[h]=c(this,this[h]));f(a,"mousedown",this._onTapStart),f(a,"touchstart",this._onTapStart),I&&f(a,"selectstart",this._onTapStart),f(a,"dragover",this._onDragOver),f(a,"dragenter",this._onDragOver),P.push(this._onDragOver),b.store&&this.sort(b.store.get(this))}function b(a){s&&s.state!==a&&(i(s,"display",a?"none":""),!a&&s.state&&t.insertBefore(s,q),s.state=a)}function c(a,b){var c=O.call(arguments,2);return b.bind?b.bind.apply(b,[a].concat(c)):function(){return b.apply(a,c.concat(O.call(arguments)))}}function d(a,b,c){if(a){c=c||G,b=b.split(".");var d=b.shift().toUpperCase(),e=new RegExp("\\s("+b.join("|")+")\\s","g");do if(">*"===d&&a.parentNode===c||(""===d||a.nodeName.toUpperCase()==d)&&(!b.length||((" "+a.className+" ").match(e)||[]).length==b.length))return a;while(a!==c&&(a=a.parentNode))}return null}function e(a){a.dataTransfer.dropEffect="move",a.preventDefault()}function f(a,b,c){a.addEventListener(b,c,!1)}function g(a,b,c){a.removeEventListener(b,c,!1)}function h(a,b,c){if(a)if(a.classList)a.classList[c?"add":"remove"](b);else{var d=(" "+a.className+" ").replace(/\s+/g," ").replace(" "+b+" ","");a.className=d+(c?" "+b:"")}}function i(a,b,c){var d=a&&a.style;if(d){if(void 0===c)return G.defaultView&&G.defaultView.getComputedStyle?c=G.defaultView.getComputedStyle(a,""):a.currentStyle&&(c=a.currentStyle),void 0===b?c:c[b];b in d||(b="-webkit-"+b),d[b]=c+("string"==typeof c?"":"px")}}function j(a,b,c){if(a){var d=a.getElementsByTagName(b),e=0,f=d.length;if(c)for(;f>e;e++)c(d[e],e);return d}return[]}function k(a){a.draggable=!1}function l(){J=!1}function m(a,b){var c=a.lastElementChild,d=c.getBoundingClientRect();return b.clientY-(d.top+d.height)>5&&c}function n(a){for(var b=a.tagName+a.className+a.src+a.href+a.textContent,c=b.length,d=0;c--;)d+=b.charCodeAt(c);return d.toString(36)}function o(a){for(var b=0;a&&(a=a.previousElementSibling)&&"TEMPLATE"!==a.nodeName.toUpperCase();)b++;return b}function p(a,b){var c,d;return function(){void 0===c&&(c=arguments,d=this,setTimeout(function(){1===c.length?a.call(d,c[0]):a.apply(d,c),c=void 0},b))}}var q,r,s,t,u,v,w,x,y,z,A,B,C,D={},E="Sortable"+(new Date).getTime(),F=window,G=F.document,H=F.parseInt,I=!!G.createElement("div").dragDrop,J=!1,K=function(a,b,c,d,e,f){var g=G.createEvent("Event");g.initEvent(b,!0,!0),g.item=c||a,g.from=d||a,g.clone=s,g.oldIndex=e,g.newIndex=f,a.dispatchEvent(g)},L="onAdd onUpdate onRemove onStart onEnd onFilter onSort".split(" "),M=function(){},N=Math.abs,O=[].slice,P=[];return a.prototype={constructor:a,_dragStarted:function(){h(q,this.options.ghostClass,!0),a.active=this,K(t,"start",q,t,y)},_onTapStart:function(a){var b=a.type,c=a.touches&&a.touches[0],e=(c||a).target,g=e,h=this.options,i=this.el,l=h.filter;if(!("mousedown"===b&&0!==a.button||h.disabled)){if(h.handle&&(e=d(e,h.handle,i)),e=d(e,h.draggable,i),y=o(e),"function"==typeof l){if(l.call(this,a,e,this))return K(g,"filter",e,i,y),void a.preventDefault()}else if(l&&(l=l.split(",").some(function(a){return a=d(g,a.trim(),i),a?(K(a,"filter",e,i,y),!0):void 0})))return void a.preventDefault();if(e&&!q&&e.parentNode===i){"selectstart"===b&&e.dragDrop(),B=a,t=this.el,q=e,v=q.nextSibling,A=this.options.group,q.draggable=!0,h.ignore.split(",").forEach(function(a){j(e,a.trim(),k)}),c&&(B={target:e,clientX:c.clientX,clientY:c.clientY},this._onDragStart(B,!0),a.preventDefault()),f(G,"mouseup",this._onDrop),f(G,"touchend",this._onDrop),f(G,"touchcancel",this._onDrop),f(q,"dragend",this),f(t,"dragstart",this._onDragStart),f(G,"dragover",this);try{G.selection?G.selection.empty():window.getSelection().removeAllRanges()}catch(m){}}}},_emulateDragOver:function(){if(C){i(r,"display","none");var a=G.elementFromPoint(C.clientX,C.clientY),b=a,c=this.options.group.name,d=P.length;if(b)do{if((" "+b[E]+" ").indexOf(c)>-1){for(;d--;)P[d]({clientX:C.clientX,clientY:C.clientY,target:a,rootEl:b});break}a=b}while(b=b.parentNode);i(r,"display","")}},_onTouchMove:function(a){if(B){var b=a.touches[0],c=b.clientX-B.clientX,d=b.clientY-B.clientY,e="translate3d("+c+"px,"+d+"px,0)";C=b,i(r,"webkitTransform",e),i(r,"mozTransform",e),i(r,"msTransform",e),i(r,"transform",e),this._onDrag(b),a.preventDefault()}},_onDragStart:function(a,b){var c=a.dataTransfer,d=this.options;if(this._offUpEvents(),"clone"==A.pull&&(s=q.cloneNode(!0),i(s,"display","none"),t.insertBefore(s,q)),b){var e,g=q.getBoundingClientRect(),h=i(q);r=q.cloneNode(!0),i(r,"top",g.top-H(h.marginTop,10)),i(r,"left",g.left-H(h.marginLeft,10)),i(r,"width",g.width),i(r,"height",g.height),i(r,"opacity","0.8"),i(r,"position","fixed"),i(r,"zIndex","100000"),t.appendChild(r),e=r.getBoundingClientRect(),i(r,"width",2*g.width-e.width),i(r,"height",2*g.height-e.height),f(G,"touchmove",this._onTouchMove),f(G,"touchend",this._onDrop),f(G,"touchcancel",this._onDrop),this._loopId=setInterval(this._emulateDragOver,150)}else c&&(c.effectAllowed="move",d.setData&&d.setData.call(this,c,q)),f(G,"drop",this);if(u=d.scroll,u===!0){u=t;do if(u.offsetWidth<u.scrollWidth||u.offsetHeight<u.scrollHeight)break;while(u=u.parentNode)}setTimeout(this._dragStarted,0)},_onDrag:p(function(a){if(t&&this.options.scroll){var b,c,d=this.options,e=d.scrollSensitivity,f=d.scrollSpeed,g=a.clientX,h=a.clientY,i=window.innerWidth,j=window.innerHeight,k=(e>=i-g)-(e>=g),l=(e>=j-h)-(e>=h);k||l?b=F:u&&(b=u,c=u.getBoundingClientRect(),k=(N(c.right-g)<=e)-(N(c.left-g)<=e),l=(N(c.bottom-h)<=e)-(N(c.top-h)<=e)),(D.vx!==k||D.vy!==l||D.el!==b)&&(D.el=b,D.vx=k,D.vy=l,clearInterval(D.pid),b&&(D.pid=setInterval(function(){b===F?F.scrollTo(F.scrollX+k*f,F.scrollY+l*f):(l&&(b.scrollTop+=l*f),k&&(b.scrollLeft+=k*f))},24)))}},30),_onDragOver:function(a){var c,e,f,g=this.el,h=this.options,j=h.group,k=j.put,n=A===j,o=h.sort;if(void 0!==a.preventDefault&&(a.preventDefault(),!h.dragoverBubble&&a.stopPropagation()),!J&&A&&(n?o||(f=!t.contains(q)):A.pull&&k&&(A.name===j.name||k.indexOf&&~k.indexOf(A.name)))&&(void 0===a.rootEl||a.rootEl===this.el)){if(c=d(a.target,h.draggable,g),e=q.getBoundingClientRect(),f)return b(!0),void(s||v?t.insertBefore(q,s||v):o||t.appendChild(q));if(0===g.children.length||g.children[0]===r||g===a.target&&(c=m(g,a))){if(c){if(c.animated)return;u=c.getBoundingClientRect()}b(n),g.appendChild(q),this._animate(e,q),c&&this._animate(u,c)}else if(c&&!c.animated&&c!==q&&void 0!==c.parentNode[E]){w!==c&&(w=c,x=i(c));var p,u=c.getBoundingClientRect(),y=u.right-u.left,z=u.bottom-u.top,B=/left|right|inline/.test(x.cssFloat+x.display),C=c.offsetWidth>q.offsetWidth,D=c.offsetHeight>q.offsetHeight,F=(B?(a.clientX-u.left)/y:(a.clientY-u.top)/z)>.5,G=c.nextElementSibling;J=!0,setTimeout(l,30),b(n),p=B?c.previousElementSibling===q&&!C||F&&C:G!==q&&!D||F&&D,p&&!G?g.appendChild(q):c.parentNode.insertBefore(q,p?G:c),this._animate(e,q),this._animate(u,c)}}},_animate:function(a,b){var c=this.options.animation;if(c){var d=b.getBoundingClientRect();i(b,"transition","none"),i(b,"transform","translate3d("+(a.left-d.left)+"px,"+(a.top-d.top)+"px,0)"),b.offsetWidth,i(b,"transition","all "+c+"ms"),i(b,"transform","translate3d(0,0,0)"),clearTimeout(b.animated),b.animated=setTimeout(function(){i(b,"transition",""),b.animated=!1},c)}},_offUpEvents:function(){g(G,"mouseup",this._onDrop),g(G,"touchmove",this._onTouchMove),g(G,"touchend",this._onDrop),g(G,"touchcancel",this._onDrop)},_onDrop:function(b){var c=this.el,d=this.options;clearInterval(this._loopId),clearInterval(D.pid),g(G,"drop",this),g(G,"dragover",this),g(c,"dragstart",this._onDragStart),this._offUpEvents(),b&&(b.preventDefault(),!d.dropBubble&&b.stopPropagation(),r&&r.parentNode.removeChild(r),q&&(g(q,"dragend",this),k(q),h(q,this.options.ghostClass,!1),t!==q.parentNode?(z=o(q),K(q.parentNode,"sort",q,t,y,z),K(t,"sort",q,t,y,z),K(q,"add",q,t,y,z),K(t,"remove",q,t,y,z)):(s&&s.parentNode.removeChild(s),q.nextSibling!==v&&(z=o(q),K(t,"update",q,t,y,z),K(t,"sort",q,t,y,z))),a.active&&K(t,"end",q,t,y,z)),t=q=r=v=s=B=C=w=x=A=a.active=null,this.save())},handleEvent:function(a){var b=a.type;"dragover"===b?(this._onDrag(a),e(a)):("drop"===b||"dragend"===b)&&this._onDrop(a)},toArray:function(){for(var a,b=[],c=this.el.children,e=0,f=c.length;f>e;e++)a=c[e],d(a,this.options.draggable,this.el)&&b.push(a.getAttribute("data-id")||n(a));return b},sort:function(a){var b={},c=this.el;this.toArray().forEach(function(a,e){var f=c.children[e];d(f,this.options.draggable,c)&&(b[a]=f)},this),a.forEach(function(a){b[a]&&(c.removeChild(b[a]),c.appendChild(b[a]))})},save:function(){var a=this.options.store;a&&a.set(this)},closest:function(a,b){return d(a,b||this.options.draggable,this.el)},option:function(a,b){var c=this.options;return void 0===b?c[a]:void(c[a]=b)},destroy:function(){var a=this.el,b=this.options;L.forEach(function(c){g(a,c.substr(2).toLowerCase(),b[c])}),g(a,"mousedown",this._onTapStart),g(a,"touchstart",this._onTapStart),g(a,"selectstart",this._onTapStart),g(a,"dragover",this._onDragOver),g(a,"dragenter",this._onDragOver),Array.prototype.forEach.call(a.querySelectorAll("[draggable]"),function(a){a.removeAttribute("draggable")}),P.splice(P.indexOf(this._onDragOver),1),this._onDrop(),this.el=null}},a.utils={on:f,off:g,css:i,find:j,bind:c,is:function(a,b){return!!d(a,b,a)},throttle:p,closest:d,toggleClass:h,dispatchEvent:K,index:o},a.version="1.0.1",a.create=function(b,c){return new a(b,c)},a});
// File:editor/js/libs/signals.min.js

/*

 JS Signals <http://millermedeiros.github.com/js-signals/>
 Released under the MIT license
 Author: Miller Medeiros
 Version: 0.7.4 - Build: 252 (2012/02/24 10:30 PM)
*/
(function(h){function g(a,b,c,d,e){this._listener=b;this._isOnce=c;this.context=d;this._signal=a;this._priority=e||0}function f(a,b){if(typeof a!=="function")throw Error("listener is a required param of {fn}() and should be a Function.".replace("{fn}",b));}var e={VERSION:"0.7.4"};g.prototype={active:!0,params:null,execute:function(a){var b;this.active&&this._listener&&(a=this.params?this.params.concat(a):a,b=this._listener.apply(this.context,a),this._isOnce&&this.detach());return b},detach:function(){return this.isBound()?
this._signal.remove(this._listener,this.context):null},isBound:function(){return!!this._signal&&!!this._listener},getListener:function(){return this._listener},_destroy:function(){delete this._signal;delete this._listener;delete this.context},isOnce:function(){return this._isOnce},toString:function(){return"[SignalBinding isOnce:"+this._isOnce+", isBound:"+this.isBound()+", active:"+this.active+"]"}};e.Signal=function(){this._bindings=[];this._prevParams=null};e.Signal.prototype={memorize:!1,_shouldPropagate:!0,
active:!0,_registerListener:function(a,b,c,d){var e=this._indexOfListener(a,c);if(e!==-1){if(a=this._bindings[e],a.isOnce()!==b)throw Error("You cannot add"+(b?"":"Once")+"() then add"+(!b?"":"Once")+"() the same listener without removing the relationship first.");}else a=new g(this,a,b,c,d),this._addBinding(a);this.memorize&&this._prevParams&&a.execute(this._prevParams);return a},_addBinding:function(a){var b=this._bindings.length;do--b;while(this._bindings[b]&&a._priority<=this._bindings[b]._priority);
this._bindings.splice(b+1,0,a)},_indexOfListener:function(a,b){for(var c=this._bindings.length,d;c--;)if(d=this._bindings[c],d._listener===a&&d.context===b)return c;return-1},has:function(a,b){return this._indexOfListener(a,b)!==-1},add:function(a,b,c){f(a,"add");return this._registerListener(a,!1,b,c)},addOnce:function(a,b,c){f(a,"addOnce");return this._registerListener(a,!0,b,c)},remove:function(a,b){f(a,"remove");var c=this._indexOfListener(a,b);c!==-1&&(this._bindings[c]._destroy(),this._bindings.splice(c,
1));return a},removeAll:function(){for(var a=this._bindings.length;a--;)this._bindings[a]._destroy();this._bindings.length=0},getNumListeners:function(){return this._bindings.length},halt:function(){this._shouldPropagate=!1},dispatch:function(a){if(this.active){var b=Array.prototype.slice.call(arguments),c=this._bindings.length,d;if(this.memorize)this._prevParams=b;if(c){d=this._bindings.slice();this._shouldPropagate=!0;do c--;while(d[c]&&this._shouldPropagate&&d[c].execute(b)!==!1)}}},forget:function(){this._prevParams=
null},dispose:function(){this.removeAll();delete this._bindings;delete this._prevParams},toString:function(){return"[Signal active:"+this.active+" numListeners:"+this.getNumListeners()+"]"}};typeof define==="function"&&define.amd?define(e):typeof module!=="undefined"&&module.exports?module.exports=e:h.signals=e})(this);
// File:editor/js/libs/ui.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var UI = {};

UI.Element = function ( dom ) {

	this.dom = dom;

};

UI.Element.prototype = {

	setId: function ( id ) {

		this.dom.id = id;

		return this;

	},

	setClass: function ( name ) {

		this.dom.className = name;

		return this;

	},

	setStyle: function ( style, array ) {

		for ( var i = 0; i < array.length; i ++ ) {

			this.dom.style[ style ] = array[ i ];

		}

	},

	setDisabled: function ( value ) {

		this.dom.disabled = value;

		return this;

	},

	setTextContent: function ( value ) {

		this.dom.textContent = value;

		return this;

	}

}

// properties

var properties = [ 'position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'border', 'borderLeft',
'borderTop', 'borderRight', 'borderBottom', 'borderColor', 'display', 'overflow', 'margin', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom', 'padding', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'color',
'backgroundColor', 'opacity', 'fontSize', 'fontWeight', 'textAlign', 'textDecoration', 'textTransform', 'cursor', 'zIndex' ];

properties.forEach( function ( property ) {

	var method = 'set' + property.substr( 0, 1 ).toUpperCase() + property.substr( 1, property.length );

	UI.Element.prototype[ method ] = function () {

		this.setStyle( property, arguments );
		return this;

	};

} );

// events

var events = [ 'KeyUp', 'KeyDown', 'MouseOver', 'MouseOut', 'Click', 'DblClick', 'Change' ];

events.forEach( function ( event ) {

	var method = 'on' + event;

	UI.Element.prototype[ method ] = function ( callback ) {

		this.dom.addEventListener( event.toLowerCase(), callback.bind( this ), false );

		return this;

	};

} );


// Panel

UI.Panel = function () {

	UI.Element.call( this );

	var dom = document.createElement( 'div' );
	dom.className = 'Panel';

	this.dom = dom;

	return this;
};

UI.Panel.prototype = Object.create( UI.Element.prototype );
UI.Panel.prototype.constructor = UI.Panel;

UI.Panel.prototype.add = function () {

	for ( var i = 0; i < arguments.length; i ++ ) {

		var argument = arguments[ i ];

		if ( argument instanceof UI.Element ) {

			this.dom.appendChild( argument.dom );

		} else {

			console.error( 'UI.Panel:', argument, 'is not an instance of UI.Element.' )

		}

	}

	return this;

};


UI.Panel.prototype.remove = function () {

	for ( var i = 0; i < arguments.length; i ++ ) {

		var argument = arguments[ i ];

		if ( argument instanceof UI.Element ) {

			this.dom.removeChild( argument.dom );

		} else {

			console.error( 'UI.Panel:', argument, 'is not an instance of UI.Element.' )

		}

	}

	return this;

};

UI.Panel.prototype.clear = function () {

	while ( this.dom.children.length ) {

		this.dom.removeChild( this.dom.lastChild );

	}

};


// Collapsible Panel

UI.CollapsiblePanel = function () {

	UI.Panel.call( this );

	this.setClass( 'Panel Collapsible' );

	var scope = this;

	this.static = new UI.Panel();
	this.static.setClass( 'Static' );
	this.static.onClick( function () {
		scope.toggle();
	} );
	this.dom.appendChild( this.static.dom );

	this.contents = new UI.Panel();
	this.contents.setClass( 'Content' );
	this.dom.appendChild( this.contents.dom );

	var button = new UI.Panel();
	button.setClass( 'Button' );
	this.static.add( button );

	this.isCollapsed = false;

	return this;

};

UI.CollapsiblePanel.prototype = Object.create( UI.Panel.prototype );
UI.CollapsiblePanel.prototype.constructor = UI.CollapsiblePanel;

UI.CollapsiblePanel.prototype.addStatic = function () {

	this.static.add.apply( this.static, arguments );
	return this;

};

UI.CollapsiblePanel.prototype.removeStatic = function () {

	this.static.remove.apply( this.static, arguments );
	return this;

};

UI.CollapsiblePanel.prototype.clearStatic = function () {

	this.static.clear();
	return this;

};

UI.CollapsiblePanel.prototype.add = function () {

	this.contents.add.apply( this.contents, arguments );
	return this;

};

UI.CollapsiblePanel.prototype.remove = function () {

	this.contents.remove.apply( this.contents, arguments );
	return this;

};

UI.CollapsiblePanel.prototype.clear = function () {

	this.contents.clear();
	return this;

};

UI.CollapsiblePanel.prototype.toggle = function() {

	this.setCollapsed( !this.isCollapsed );

};

UI.CollapsiblePanel.prototype.collapse = function() {

	this.setCollapsed( true );

};

UI.CollapsiblePanel.prototype.expand = function() {

	this.setCollapsed( false );

};

UI.CollapsiblePanel.prototype.setCollapsed = function( boolean ) {

	if ( boolean ) {

		this.dom.classList.add( 'collapsed' );

	} else {

		this.dom.classList.remove( 'collapsed' );

	}

	this.isCollapsed = boolean;

	if ( this.onCollapsedChangeCallback !== undefined ) {

		this.onCollapsedChangeCallback( boolean );

	}

};

UI.CollapsiblePanel.prototype.onCollapsedChange = function ( callback ) {

	this.onCollapsedChangeCallback = callback;

};

// Text

UI.Text = function ( text ) {

	UI.Element.call( this );

	var dom = document.createElement( 'span' );
	dom.className = 'Text';
	dom.style.cursor = 'default';
	dom.style.display = 'inline-block';
	dom.style.verticalAlign = 'middle';

	this.dom = dom;
	this.setValue( text );

	return this;

};

UI.Text.prototype = Object.create( UI.Element.prototype );
UI.Text.prototype.constructor = UI.Text;

UI.Text.prototype.getValue = function () {

	return this.dom.textContent;

};

UI.Text.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.textContent = value;

	}

	return this;

};


// Input

UI.Input = function ( text ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Input';
	dom.style.padding = '2px';
	dom.style.border = '1px solid transparent';

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

	}, false );

	this.dom = dom;
	this.setValue( text );

	return this;

};

UI.Input.prototype = Object.create( UI.Element.prototype );
UI.Input.prototype.constructor = UI.Input;

UI.Input.prototype.getValue = function () {

	return this.dom.value;

};

UI.Input.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};


// TextArea

UI.TextArea = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'textarea' );
	dom.className = 'TextArea';
	dom.style.padding = '2px';
	dom.spellcheck = false;

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

		if ( event.keyCode === 9 ) {

			event.preventDefault();

			var cursor = dom.selectionStart;

			dom.value = dom.value.substring( 0, cursor ) + '\t' + dom.value.substring( cursor );
			dom.selectionStart = cursor + 1;
			dom.selectionEnd = dom.selectionStart;

		}

	}, false );

	this.dom = dom;

	return this;

};

UI.TextArea.prototype = Object.create( UI.Element.prototype );
UI.TextArea.prototype.constructor = UI.TextArea;

UI.TextArea.prototype.getValue = function () {

	return this.dom.value;

};

UI.TextArea.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};


// Select

UI.Select = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'select' );
	dom.className = 'Select';
	dom.style.padding = '2px';

	this.dom = dom;

	return this;

};

UI.Select.prototype = Object.create( UI.Element.prototype );
UI.Select.prototype.constructor = UI.Select;

UI.Select.prototype.setMultiple = function ( boolean ) {

	this.dom.multiple = boolean;

	return this;

};

UI.Select.prototype.setOptions = function ( options ) {

	var selected = this.dom.value;

	while ( this.dom.children.length > 0 ) {

		this.dom.removeChild( this.dom.firstChild );

	}

	for ( var key in options ) {

		var option = document.createElement( 'option' );
		option.value = key;
		option.innerHTML = options[ key ];
		this.dom.appendChild( option );

	}

	this.dom.value = selected;

	return this;

};

UI.Select.prototype.getValue = function () {

	return this.dom.value;

};

UI.Select.prototype.setValue = function ( value ) {

	value = String( value );

	if ( this.dom.value !== value ) {

		this.dom.value = value;

	}

	return this;

};

// Checkbox

UI.Checkbox = function ( boolean ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Checkbox';
	dom.type = 'checkbox';

	this.dom = dom;
	this.setValue( boolean );

	return this;

};

UI.Checkbox.prototype = Object.create( UI.Element.prototype );
UI.Checkbox.prototype.constructor = UI.Checkbox;

UI.Checkbox.prototype.getValue = function () {

	return this.dom.checked;

};

UI.Checkbox.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.checked = value;

	}

	return this;

};


// Color

UI.Color = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Color';
	dom.style.width = '64px';
	dom.style.height = '16px';
	dom.style.border = '0px';
	dom.style.padding = '0px';
	dom.style.backgroundColor = 'transparent';

	try {

		dom.type = 'color';
		dom.value = '#ffffff';

	} catch ( exception ) {}

	this.dom = dom;

	return this;

};

UI.Color.prototype = Object.create( UI.Element.prototype );
UI.Color.prototype.constructor = UI.Color;

UI.Color.prototype.getValue = function () {

	return this.dom.value;

};

UI.Color.prototype.getHexValue = function () {

	return parseInt( this.dom.value.substr( 1 ), 16 );

};

UI.Color.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};

UI.Color.prototype.setHexValue = function ( hex ) {

	this.dom.value = '#' + ( '000000' + hex.toString( 16 ) ).slice( -6 );

	return this;

};


// Number

UI.Number = function ( number ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Number';
	dom.value = '0.00';

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

		if ( event.keyCode === 13 ) dom.blur();

	}, false );

	this.min = - Infinity;
	this.max = Infinity;

	this.precision = 2;
	this.step = 1;

	this.dom = dom;
	this.setValue( number );

	var changeEvent = document.createEvent( 'HTMLEvents' );
	changeEvent.initEvent( 'change', true, true );

	var distance = 0;
	var onMouseDownValue = 0;

	var pointer = [ 0, 0 ];
	var prevPointer = [ 0, 0 ];

	var onMouseDown = function ( event ) {

		event.preventDefault();

		distance = 0;

		onMouseDownValue = parseFloat( dom.value );

		prevPointer = [ event.clientX, event.clientY ];

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	var onMouseMove = function ( event ) {

		var currentValue = dom.value;

		pointer = [ event.clientX, event.clientY ];

		distance += ( pointer[ 0 ] - prevPointer[ 0 ] ) - ( pointer[ 1 ] - prevPointer[ 1 ] );

		var number = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;

		dom.value = Math.min( scope.max, Math.max( scope.min, number ) ).toFixed( scope.precision );

		if ( currentValue !== dom.value ) dom.dispatchEvent( changeEvent );

		prevPointer = [ event.clientX, event.clientY ];

	};

	var onMouseUp = function ( event ) {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		if ( Math.abs( distance ) < 2 ) {

			dom.focus();
			dom.select();

		}

	};

	var onChange = function ( event ) {

		var value = 0;

		try {

			value = eval( dom.value );

		} catch ( error ) {

			console.error( error.message );

		}

		dom.value = parseFloat( value );

	};

	var onFocus = function ( event ) {

		dom.style.backgroundColor = '';
		dom.style.borderColor = '#ccc';
		dom.style.cursor = '';

	};

	var onBlur = function ( event ) {

		dom.style.backgroundColor = 'transparent';
		dom.style.borderColor = 'transparent';
		dom.style.cursor = 'col-resize';

	};

	dom.addEventListener( 'mousedown', onMouseDown, false );
	dom.addEventListener( 'change', onChange, false );
	dom.addEventListener( 'focus', onFocus, false );
	dom.addEventListener( 'blur', onBlur, false );

	return this;

};

UI.Number.prototype = Object.create( UI.Element.prototype );
UI.Number.prototype.constructor = UI.Number;

UI.Number.prototype.getValue = function () {

	return parseFloat( this.dom.value );

};

UI.Number.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.value = value.toFixed( this.precision );

	}

	return this;

};

UI.Number.prototype.setRange = function ( min, max ) {

	this.min = min;
	this.max = max;

	return this;

};

UI.Number.prototype.setPrecision = function ( precision ) {

	this.precision = precision;

	return this;

};


// Integer

UI.Integer = function ( number ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Number';
	dom.value = '0.00';

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

	}, false );

	this.min = - Infinity;
	this.max = Infinity;

	this.step = 1;

	this.dom = dom;
	this.setValue( number );

	var changeEvent = document.createEvent( 'HTMLEvents' );
	changeEvent.initEvent( 'change', true, true );

	var distance = 0;
	var onMouseDownValue = 0;

	var pointer = [ 0, 0 ];
	var prevPointer = [ 0, 0 ];

	var onMouseDown = function ( event ) {

		event.preventDefault();

		distance = 0;

		onMouseDownValue = parseFloat( dom.value );

		prevPointer = [ event.clientX, event.clientY ];

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	var onMouseMove = function ( event ) {

		var currentValue = dom.value;

		pointer = [ event.clientX, event.clientY ];

		distance += ( pointer[ 0 ] - prevPointer[ 0 ] ) - ( pointer[ 1 ] - prevPointer[ 1 ] );

		var number = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;

		dom.value = Math.min( scope.max, Math.max( scope.min, number ) ) | 0;

		if ( currentValue !== dom.value ) dom.dispatchEvent( changeEvent );

		prevPointer = [ event.clientX, event.clientY ];

	};

	var onMouseUp = function ( event ) {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		if ( Math.abs( distance ) < 2 ) {

			dom.focus();
			dom.select();

		}

	};

	var onChange = function ( event ) {

		var value = 0;

		try {

			value = eval( dom.value );

		} catch ( error ) {

			console.error( error.message );

		}

		dom.value = parseInt( value );

	};

	var onFocus = function ( event ) {

		dom.style.backgroundColor = '';
		dom.style.borderColor = '#ccc';
		dom.style.cursor = '';

	};

	var onBlur = function ( event ) {

		dom.style.backgroundColor = 'transparent';
		dom.style.borderColor = 'transparent';
		dom.style.cursor = 'col-resize';

	};

	dom.addEventListener( 'mousedown', onMouseDown, false );
	dom.addEventListener( 'change', onChange, false );
	dom.addEventListener( 'focus', onFocus, false );
	dom.addEventListener( 'blur', onBlur, false );

	return this;

};

UI.Integer.prototype = Object.create( UI.Element.prototype );
UI.Integer.prototype.constructor = UI.Integer;

UI.Integer.prototype.getValue = function () {

	return parseInt( this.dom.value );

};

UI.Integer.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.value = value | 0;

	}

	return this;

};

UI.Integer.prototype.setRange = function ( min, max ) {

	this.min = min;
	this.max = max;

	return this;

};


// Break

UI.Break = function () {

	UI.Element.call( this );

	var dom = document.createElement( 'br' );
	dom.className = 'Break';

	this.dom = dom;

	return this;

};

UI.Break.prototype = Object.create( UI.Element.prototype );
UI.Break.prototype.constructor = UI.Break;


// HorizontalRule

UI.HorizontalRule = function () {

	UI.Element.call( this );

	var dom = document.createElement( 'hr' );
	dom.className = 'HorizontalRule';

	this.dom = dom;

	return this;

};

UI.HorizontalRule.prototype = Object.create( UI.Element.prototype );
UI.HorizontalRule.prototype.constructor = UI.HorizontalRule;


// Button

UI.Button = function ( value ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'button' );
	dom.className = 'Button';

	this.dom = dom;
	this.dom.textContent = value;

	return this;

};

UI.Button.prototype = Object.create( UI.Element.prototype );
UI.Button.prototype.constructor = UI.Button;

UI.Button.prototype.setLabel = function ( value ) {

	this.dom.textContent = value;

	return this;

};


// Dialog

UI.Dialog = function ( value ) {

	var scope = this;

	var dom = document.createElement( 'dialog' );

	if ( dom.showModal === undefined ) {

		// fallback

		dom = document.createElement( 'div' );
		dom.style.display = 'none';

		dom.showModal = function () {

			dom.style.position = 'absolute';
			dom.style.left = '100px';
			dom.style.top = '100px';
			dom.style.zIndex = 1;
			dom.style.display = '';

		};

	}

	dom.className = 'Dialog';

	this.dom = dom;

	return this;

};

UI.Dialog.prototype = Object.create( UI.Panel.prototype );
UI.Dialog.prototype.constructor = UI.Dialog;

UI.Dialog.prototype.showModal = function () {

	this.dom.showModal();

	return this;

};

// Sound

UI.Sound = function (  ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'div' );
	dom.className = 'SoundDrop';

	this.dom = dom;
	
	this.dom.dropArea = document.createElement( 'div' );
	this.dom.dropArea.className = 'dropArea';
	this.dom.dropArea.textContent = 'Drop audio file here';
	
	this.dom.appendChild( this.dom.dropArea );
	
	var playButton = document.createElement( 'button' );
	playButton.textContent = '>';
	playButton.style.display = 'none';
	this.dom.playButton = playButton;
	
	this.dom.appendChild( playButton );
	
	
	this.dom._deleteSoundButton = document.createElement( 'button' );
	this.dom._deleteSoundButton.className = 'deleteButton';
	this.dom._deleteSoundButton.textContent = 'x';
	this.dom._deleteSoundButton.addEventListener( 'click', this.setValue.bind(this) );
	
	// Setup the dnd listeners.
	this.dom.addEventListener('dragover', this.handleDragOver.bind(this), false);
	this.dom.addEventListener('drop', this.handleFileSelect.bind(this), false);
	
	// create the (initially inactive) play listeners
	this._mouseListeners = {
		down: this.play.bind(this),
		up: this.stop.bind(this)
	};

	return this;

};

UI.Sound.prototype = Object.create( UI.Element.prototype );

UI.Sound.prototype.setLabel = function ( value ) {

	this.dom.textContent = value;

	return this;

};

UI.Sound.prototype.handleFileSelect = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files; // FileList object.
	
	if (files && files[0]) {		
		this.setValue( files[0] );
	}
}

UI.Sound.prototype.handleDragOver = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

UI.Sound.prototype.getValue = function() {
	return this.sound;
};

UI.Sound.prototype.setValue = function(sound) {

	if (sound instanceof Blob) {
	
		// add sound
		this.sound = sound;
		editor.soundCollection.add( sound, new THREE.Vector3(0, 0, 0), function( buffer ) {
		
			var changeEvent = document.createEvent('HTMLEvents');
			changeEvent.initEvent( 'change', true, true );
			changeEvent.buffer = buffer;
			this.dom.dispatchEvent( changeEvent );
			
		}.bind(this) );
		this.dom.dropArea.textContent = sound.name;
		this.dom.dropArea.appendChild ( this.dom._deleteSoundButton );
		this.dom.playButton.style.display = '';
		this.dom.playButton.addEventListener( 'mousedown', this._mouseListeners.down, false );
		this.dom.playButton.addEventListener( 'mouseup', this._mouseListeners.up, false );
		
	} else {
	
		// remove sound
		this.stop();
		this.dom.playButton.style.display = 'none';
		this.dom.playButton.removeEventListener( 'mousedown', this._mouseListeners.down, false );
		this.dom.playButton.removeEventListener( 'mouseup', this._mouseListeners.up, false );
		this.dom.dropArea.textContent = 'Drop audio file here';
		this.sound = undefined;
		
		var changeEvent = document.createEvent('HTMLEvents');
		changeEvent.initEvent( 'change', true, true );
		this.dom.dispatchEvent( changeEvent );
	}
	
};

UI.Sound.prototype.play = function() {
	if (this.sound) {
		editor.soundCollection.stop(this.sound);
		editor.soundCollection.play(this.sound);
	}
}

UI.Sound.prototype.stop = function() {
	if (this.sound) {
		editor.soundCollection.stop(this.sound);
	}
}

// File:editor/js/libs/ui.three.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

UI.Texture = function ( mapping ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'span' );

	var input = document.createElement( 'input' );
	input.type = 'file';
	input.addEventListener( 'change', function ( event ) {

		loadFile( event.target.files[ 0 ] );

	} );

	var canvas = document.createElement( 'canvas' );
	canvas.width = 32;
	canvas.height = 16;
	canvas.style.cursor = 'pointer';
	canvas.style.marginRight = '5px';
	canvas.style.border = '1px solid #888';
	canvas.addEventListener( 'click', function ( event ) {

		input.click();

	}, false );
	canvas.addEventListener( 'drop', function ( event ) {

		event.preventDefault();
		event.stopPropagation();
		loadFile( event.dataTransfer.files[ 0 ] );

	}, false );
	dom.appendChild( canvas );

	var name = document.createElement( 'input' );
	name.disabled = true;
	name.style.width = '64px';
	name.style.border = '1px solid #ccc';
	dom.appendChild( name );

	var loadFile = function ( file ) {

		if ( file.type.match( 'image.*' ) ) {

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var image = document.createElement( 'img' );
				image.addEventListener( 'load', function( event ) {

					var texture = new THREE.Texture( this, mapping );
					texture.sourceFile = file.name;
					texture.needsUpdate = true;

					scope.setValue( texture );

					if ( scope.onChangeCallback ) scope.onChangeCallback();

				}, false );

				image.src = event.target.result;

			}, false );

			reader.readAsDataURL( file );

		}

	}

	this.dom = dom;
	this.texture = null;
	this.onChangeCallback = null;

	return this;

};

UI.Texture.prototype = Object.create( UI.Element.prototype );
UI.Texture.prototype.constructor = UI.Texture;

UI.Texture.prototype.getValue = function () {

	return this.texture;

};

UI.Texture.prototype.setValue = function ( texture ) {

	var canvas = this.dom.children[ 0 ];
	var name = this.dom.children[ 1 ];
	var context = canvas.getContext( '2d' );

	if ( texture !== null ) {

		var image = texture.image;

		if ( image !== undefined && image.width > 0 ) {

			name.value = texture.sourceFile;

			var scale = canvas.width / image.width;
			context.drawImage( image, 0, 0, image.width * scale, image.height * scale );

		} else {

			name.value = texture.sourceFile + ' (error)';
			context.clearRect( 0, 0, canvas.width, canvas.height );

		}

	} else {

		name.value = '';
		context.clearRect( 0, 0, canvas.width, canvas.height );

	}

	this.texture = texture;

};

UI.Texture.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};

// Outliner

UI.Outliner = function ( editor ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'div' );
	dom.className = 'Outliner';
	dom.tabIndex = 0;	// keyup event is ignored without setting tabIndex

	var scene = editor.scene;

	var sortable = Sortable.create( dom, {
		draggable: '.draggable',
		onUpdate: function ( event ) {

			var item = event.item;

			var object = scene.getObjectById( item.value );

			if ( item.nextSibling === null ) {

				editor.moveObject( object, editor.scene );

			} else {

				var nextObject = scene.getObjectById( item.nextSibling.value );
				editor.moveObject( object, nextObject.parent, nextObject );

			}

		}
	} );

	// Broadcast for object selection after arrow navigation
	var changeEvent = document.createEvent('HTMLEvents');
	changeEvent.initEvent( 'change', true, true );

	// Prevent native scroll behavior
	dom.addEventListener( 'keydown', function (event) {

		switch ( event.keyCode ) {
			case 38: // up
			case 40: // down
			event.preventDefault();
			event.stopPropagation();
			break;
		}

	}, false);

	// Keybindings to support arrow navigation
	dom.addEventListener( 'keyup', function (event) {

		switch ( event.keyCode ) {
			case 38: // up
			case 40: // down
			scope.selectedIndex += ( event.keyCode == 38 ) ? -1 : 1;

			if ( scope.selectedIndex >= 0 && scope.selectedIndex < scope.options.length ) {

				// Highlight selected dom elem and scroll parent if needed
				scope.setValue( scope.options[ scope.selectedIndex ].value );

				scope.dom.dispatchEvent( changeEvent );

			}

			break;
		}

	}, false);

	this.dom = dom;

	this.options = [];
	this.selectedIndex = -1;
	this.selectedValue = null;

	return this;

};

UI.Outliner.prototype = Object.create( UI.Element.prototype );
UI.Outliner.prototype.constructor = UI.Outliner;

UI.Outliner.prototype.setOptions = function ( options ) {

	var scope = this;

	var changeEvent = document.createEvent( 'HTMLEvents' );
	changeEvent.initEvent( 'change', true, true );

	while ( scope.dom.children.length > 0 ) {

		scope.dom.removeChild( scope.dom.firstChild );

	}

	scope.options = [];

	for ( var i = 0; i < options.length; i ++ ) {

		var option = options[ i ];

		var div = document.createElement( 'div' );
		div.className = 'option ' + ( option.static === true ? '': 'draggable' );
		div.innerHTML = option.html;
		div.value = option.value;
		scope.dom.appendChild( div );

		scope.options.push( div );

		div.addEventListener( 'click', function ( event ) {

			scope.setValue( this.value );
			scope.dom.dispatchEvent( changeEvent );

		}, false );

	}

	return scope;

};

UI.Outliner.prototype.getValue = function () {

	return this.selectedValue;

};

UI.Outliner.prototype.setValue = function ( value ) {

	for ( var i = 0; i < this.options.length; i ++ ) {

		var element = this.options[ i ];

		if ( element.value === value ) {

			element.classList.add( 'active' );

			// scroll into view

			var y = element.offsetTop - this.dom.offsetTop;
			var bottomY = y + element.offsetHeight;
			var minScroll = bottomY - this.dom.offsetHeight;

			if ( this.dom.scrollTop > y ) {

				this.dom.scrollTop = y

			} else if ( this.dom.scrollTop < minScroll ) {

				this.dom.scrollTop = minScroll;

			}

			this.selectedIndex = i;

		} else {

			element.classList.remove( 'active' );

		}

	}

	this.selectedValue = value;

	return this;

};

// File:editor/js/libs/app.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var APP = {

	Player: function () {

		var scope = this;

		var loader = new THREE.ObjectLoader();
		var camera, scene, renderer;

		var vr, controls, effect;

		var events = {};

		this.dom = undefined;

		this.width = 500;
		this.height = 500;

		this.load = function ( json ) {

			vr = json.project.vr;

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setClearColor( 0x000000 );
			renderer.setPixelRatio( window.devicePixelRatio );
			this.dom = renderer.domElement;

			this.setScene( loader.parse( json.scene ) );
			this.setCamera( loader.parse( json.camera ) );

			events = {
				init: [],
				start: [],
				stop: [],
				keydown: [],
				keyup: [],
				mousedown: [],
				mouseup: [],
				mousemove: [],
				touchstart: [],
				touchend: [],
				touchmove: [],
				update: []
			};

			var scriptWrapParams = 'player,renderer,scene';
			var scriptWrapResultObj = {};
			for ( var eventKey in events ) {
				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[ eventKey ] = eventKey;
			}
			var scriptWrapResult =
					JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( 'uuid', uuid, true );

				var scripts = json.scripts[ uuid ];

				for ( var i = 0; i < scripts.length; i ++ ) {

					var script = scripts[ i ];

					var functions = ( new Function( scriptWrapParams,
							script.source + '\nreturn ' + scriptWrapResult+ ';' ).bind( object ) )( this, renderer, scene );

					for ( var name in functions ) {

						if ( functions[ name ] === undefined ) continue;

						if ( events[ name ] === undefined ) {

							console.warn( 'APP.Player: event type not supported (', name, ')' );
							continue;

						}

						events[ name ].push( functions[ name ].bind( object ) );

					}

				}

			}

			dispatch( events.init, arguments );

		};

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();


			if ( vr === true ) {

				if ( camera.parent === null ) {

					// camera needs to be in the scene so camera2 matrix updates

					scene.add( camera );

				}

				var camera2 = camera.clone();
				camera.add( camera2 );

				camera = camera2;

				controls = new THREE.VRControls( camera );
				effect = new THREE.VREffect( renderer );

				document.addEventListener( 'keyup', function ( event ) {

					switch ( event.keyCode ) {
						case 90:
							controls.zeroSensor();
							break;
					}

				} );

				this.dom.addEventListener( 'dblclick', function () {

					effect.setFullScreen( true );

				} );

			}

		};

		this.setScene = function ( value ) {

			scene = value;

		},

		this.setSize = function ( width, height ) {

			if ( renderer._fullScreen ) return;

			this.width = width;
			this.height = height;

			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			renderer.setSize( width, height );

		};

		var dispatch = function ( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				try {

					array[ i ]( event );

				} catch (e) {

					console.error( ( e.message || e ), ( e.stack || "" ) );

				}

			}

		};

		var prevTime, request;

		var animate = function ( time ) {

			request = requestAnimationFrame( animate );

			dispatch( events.update, { time: time, delta: time - prevTime } );

			if ( vr === true ) {

				controls.update();
				effect.render( scene, camera );

			} else {

				renderer.render( scene, camera );

			}

			prevTime = time;

		};

		this.play = function () {

			document.addEventListener( 'keydown', onDocumentKeyDown );
			document.addEventListener( 'keyup', onDocumentKeyUp );
			document.addEventListener( 'mousedown', onDocumentMouseDown );
			document.addEventListener( 'mouseup', onDocumentMouseUp );
			document.addEventListener( 'mousemove', onDocumentMouseMove );
			document.addEventListener( 'touchstart', onDocumentTouchStart );
			document.addEventListener( 'touchend', onDocumentTouchEnd );
			document.addEventListener( 'touchmove', onDocumentTouchMove );

			dispatch( events.start, arguments );

			request = requestAnimationFrame( animate );
			prevTime = ( window.performance || Date ).now();
		};

		this.stop = function () {

			document.removeEventListener( 'keydown', onDocumentKeyDown );
			document.removeEventListener( 'keyup', onDocumentKeyUp );
			document.removeEventListener( 'mousedown', onDocumentMouseDown );
			document.removeEventListener( 'mouseup', onDocumentMouseUp );
			document.removeEventListener( 'mousemove', onDocumentMouseMove );
			document.removeEventListener( 'touchstart', onDocumentTouchStart );
			document.removeEventListener( 'touchend', onDocumentTouchEnd );
			document.removeEventListener( 'touchmove', onDocumentTouchMove );

			dispatch( events.stop, arguments );

			cancelAnimationFrame( request );
		};

		//

		var onDocumentKeyDown = function ( event ) {

			dispatch( events.keydown, event );

		};

		var onDocumentKeyUp = function ( event ) {

			dispatch( events.keyup, event );

		};

		var onDocumentMouseDown = function ( event ) {

			dispatch( events.mousedown, event );

		};

		var onDocumentMouseUp = function ( event ) {

			dispatch( events.mouseup, event );

		};

		var onDocumentMouseMove = function ( event ) {

			dispatch( events.mousemove, event );

		};

		var onDocumentTouchStart = function ( event ) {

			dispatch( events.touchstart, event );

		};

		var onDocumentTouchEnd = function ( event ) {

			dispatch( events.touchend, event );

		};

		var onDocumentTouchMove = function ( event ) {

			dispatch( events.touchmove, event );

		};

	}

};

// File:editor/js/Player.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var Player = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'player' );
	container.setPosition( 'absolute' );
	container.setDisplay( 'none' );

	//

	var player = new APP.Player();

	window.addEventListener( 'resize', function () {

		if ( player.dom === undefined ) return;

		player.setSize( container.dom.clientWidth, container.dom.clientHeight );

	} );

	signals.startPlayer.add( function () {

		container.setDisplay( '' );

		player.load( editor.toJSON() );
		player.setSize( container.dom.clientWidth, container.dom.clientHeight );
		player.play();

		container.dom.appendChild( player.dom );

		editor.play();

	} );

	signals.stopPlayer.add( function () {

		container.setDisplay( 'none' );

		editor.stop();

		player.stop();

		container.dom.removeChild( player.dom );



	} );

	return container;

};

// File:editor/js/Script.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var Script = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'script' );
	container.setPosition( 'absolute' );
	container.setBackgroundColor( '#272822' );
	container.setDisplay( 'none' );

	var header = new UI.Panel();
	header.setPadding( '10px' );
	container.add( header );

	var title = new UI.Text().setColor( '#fff' );
	header.add( title );

	var buttonSVG = ( function () {
		var svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		svg.setAttribute( 'width', 32 );
		svg.setAttribute( 'height', 32 );
		var path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		path.setAttribute( 'd', 'M 12,12 L 22,22 M 22,12 12,22' );
		path.setAttribute( 'stroke', '#fff' );
		svg.appendChild( path );
		return svg;
	} )();

	var close = new UI.Element( buttonSVG );
	close.setPosition( 'absolute' );
	close.setTop( '3px' );
	close.setRight( '1px' );
	close.setCursor( 'pointer' );
	close.onClick( function () {

		container.setDisplay( 'none' );

	} );
	header.add( close );


	var renderer;

	signals.rendererChanged.add( function ( newRenderer ) {

		renderer = newRenderer;

	} );


	var delay;
	var currentMode;
	var currentScript;
	var currentObject;

	var codemirror = CodeMirror( container.dom, {
		value: '',
		lineNumbers: true,
		matchBrackets: true,
		indentWithTabs: true,
		tabSize: 4,
		indentUnit: 4,
		hintOptions: {
			completeSingle: false
		}
	} );
	codemirror.setOption( 'theme', 'monokai' );
	codemirror.on( 'change', function () {

		clearTimeout( delay );
		delay = setTimeout( function () {

			var value = codemirror.getValue();

			if ( ! validate( value ) ) return;

			if ( typeof( currentScript ) === 'object' ) {

				currentScript.source = value;
				signals.scriptChanged.dispatch( currentScript );
				return;
			}

			if ( currentScript !== 'programInfo' ) return;

			var json = JSON.parse( value );
			currentObject.defines = json.defines;
			currentObject.uniforms = json.uniforms;
			currentObject.attributes = json.attributes;

			currentObject.needsUpdate = true;
			signals.materialChanged.dispatch( currentObject );

		}, 300 );

	});

	// prevent backspace from deleting objects
	var wrapper = codemirror.getWrapperElement();
	wrapper.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

	} );

	// validate

	var errorLines = [];
	var widgets = [];

	var validate = function ( string ) {

		var valid;
		var errors = [];

		return codemirror.operation( function () {

			while ( errorLines.length > 0 ) {

				codemirror.removeLineClass( errorLines.shift(), 'background', 'errorLine' );

			}

			while ( widgets.length > 0 ) {

				codemirror.removeLineWidget( widgets.shift() );

			}

			//

			switch ( currentMode ) {

				case 'javascript':

					try {

						var syntax = esprima.parse( string, { tolerant: true } );
						errors = syntax.errors;

					} catch ( error ) {

						errors.push( {

							lineNumber: error.lineNumber - 1,
							message: error.message

						} );

					}

					for ( var i = 0; i < errors.length; i ++ ) {

						var error = errors[ i ];
						error.message = error.message.replace(/Line [0-9]+: /, '');

					}

					break;

				case 'json':

					errors = [];

					jsonlint.parseError = function ( message, info ) {

						message = message.split('\n')[3];

						errors.push( {

							lineNumber: info.loc.first_line - 1,
							message: message

						} );

					};

					try {

						jsonlint.parse( string );

					} catch ( error ) {

						// ignore failed error recovery

					}

					break;

				case 'glsl':

					try {

						var shaderType = currentScript === 'vertexShader' ?
								glslprep.Shader.VERTEX : glslprep.Shader.FRAGMENT;

						glslprep.parseGlsl( string, shaderType );

					} catch( error ) {

						if ( error instanceof glslprep.SyntaxError ) {

							errors.push( {

								lineNumber: error.line,
								message: "Syntax Error: " + error.message

							} );

						} else {

							console.error( error.stack || error );

						}

					}

					if ( errors.length !== 0 ) break;
					if ( renderer instanceof THREE.WebGLRenderer === false ) break;

					currentObject[ currentScript ] = string;
					currentObject.needsUpdate = true;
					signals.materialChanged.dispatch( currentObject );

					var programs = renderer.info.programs;

					valid = true;
					var parseMessage = /^(?:ERROR|WARNING): \d+:(\d+): (.*)/g;

					for ( var i = 0, n = programs.length; i !== n; ++ i ) {

						var diagnostics = programs[i].diagnostics;

						if ( diagnostics === undefined ||
								diagnostics.material !== currentObject ) continue;

						if ( ! diagnostics.runnable ) valid = false;

						var shaderInfo = diagnostics[ currentScript ];
						var lineOffset = shaderInfo.prefix.split(/\r\n|\r|\n/).length;

						while ( true ) {

							var parseResult = parseMessage.exec( shaderInfo.log );
							if ( parseResult === null ) break;

							errors.push( {

								lineNumber: parseResult[ 1 ] - lineOffset,
								message: parseResult[ 2 ]

							} );

						} // messages

						break;

					} // programs

			} // mode switch

			for ( var i = 0; i < errors.length; i ++ ) {

				var error = errors[ i ];

				var message = document.createElement( 'div' );
				message.className = 'esprima-error';
				message.textContent = error.message;

				var lineNumber = Math.max( error.lineNumber, 0 );
				errorLines.push( lineNumber );

				codemirror.addLineClass( lineNumber, 'background', 'errorLine' );

				var widget = codemirror.addLineWidget( lineNumber, message );

				widgets.push( widget );

			}

			return valid !== undefined ? valid : errors.length === 0;

		});

	};

	// tern js autocomplete

	var server = new CodeMirror.TernServer( {
		caseInsensitive: true,
		plugins: { threejs: null }
	} );

	codemirror.setOption( 'extraKeys', {
		'Ctrl-Space': function(cm) { server.complete(cm); },
		'Ctrl-I': function(cm) { server.showType(cm); },
		'Ctrl-O': function(cm) { server.showDocs(cm); },
		'Alt-.': function(cm) { server.jumpToDef(cm); },
		'Alt-,': function(cm) { server.jumpBack(cm); },
		'Ctrl-Q': function(cm) { server.rename(cm); },
		'Ctrl-.': function(cm) { server.selectName(cm); }
	} );

	codemirror.on( 'cursorActivity', function( cm ) {

		if ( currentMode !== 'javascript' ) return;
		server.updateArgHints( cm );

	} );

	codemirror.on( 'keypress', function( cm, kb ) {

		if ( currentMode !== 'javascript' ) return;
		var typed = String.fromCharCode( kb.which || kb.keyCode );
		if ( /[\w\.]/.exec( typed ) ) {

			server.complete( cm );

		}

	} );


	//

	signals.editorCleared.add( function () {

		container.setDisplay( 'none' );

	} );

	signals.editScript.add( function ( object, script ) {

		var mode, name, source;

		if ( typeof( script ) === 'object' ) {

			mode = 'javascript';
			name = script.name;
			source = script.source;

		} else {

			switch ( script ) {

				case 'vertexShader':

					mode = 'glsl';
					name = 'Vertex Shader';
					source = object.vertexShader || "";

					break;

				case 'fragmentShader':

					mode = 'glsl';
					name = 'Fragment Shader';
					source = object.fragmentShader || "";

					break;

				case 'programInfo':

					mode = 'json';
					name = 'Program Properties';
					var json = {
						defines: object.defines,
						uniforms: object.uniforms,
						attributes: object.attributes
					};
					source = JSON.stringify( json, null, '\t' );

			}

		}

		currentMode = mode;
		currentScript = script;
		currentObject = object;

		title.setValue( object.name + ' / ' + name );
		container.setDisplay( '' );
		codemirror.setValue( source );
		if (mode === 'json' ) mode = { name: 'javascript', json: true };
		codemirror.setOption( 'mode', mode );

	} );

	return container;

};

// File:examples/js/effects/VREffect.js

/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 *
 * WebVR Spec: http://mozvr.github.io/webvr-spec/webvr.html
 *
 * Firefox: http://mozvr.com/downloads/
 * Chromium: https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ&usp=sharing#list
 *
 */

THREE.VREffect = function ( renderer, onError ) {

	var vrHMD;
	var eyeTranslationL, eyeFOVL;
	var eyeTranslationR, eyeFOVR;

	function gotVRDevices( devices ) {

		for ( var i = 0; i < devices.length; i ++ ) {

			if ( devices[ i ] instanceof HMDVRDevice ) {

				vrHMD = devices[ i ];

				if ( vrHMD.getEyeParameters !== undefined ) {

					var eyeParamsL = vrHMD.getEyeParameters( 'left' );
					var eyeParamsR = vrHMD.getEyeParameters( 'right' );

					eyeTranslationL = eyeParamsL.eyeTranslation;
					eyeTranslationR = eyeParamsR.eyeTranslation;
					eyeFOVL = eyeParamsL.recommendedFieldOfView;
					eyeFOVR = eyeParamsR.recommendedFieldOfView;

				} else {

					// TODO: This is an older code path and not spec compliant.
					// It should be removed at some point in the near future.
					eyeTranslationL = vrHMD.getEyeTranslation( 'left' );
					eyeTranslationR = vrHMD.getEyeTranslation( 'right' );
					eyeFOVL = vrHMD.getRecommendedEyeFieldOfView( 'left' );
					eyeFOVR = vrHMD.getRecommendedEyeFieldOfView( 'right' );

				}

				break; // We keep the first we encounter

			}

		}

		if ( vrHMD === undefined ) {

			if ( onError ) onError( 'HMD not available' );

		}

	}

	if ( navigator.getVRDevices ) {

		navigator.getVRDevices().then( gotVRDevices );

	}

	//

	this.scale = 1;

	this.setSize = function( width, height ) {

		renderer.setSize( width, height );

	};

	// fullscreen

	var isFullscreen = false;

	var canvas = renderer.domElement;
	var fullscreenchange = canvas.mozRequestFullScreen ? 'mozfullscreenchange' : 'webkitfullscreenchange';

	document.addEventListener( fullscreenchange, function ( event ) {

		isFullscreen = document.mozFullScreenElement || document.webkitFullscreenElement;

	}, false );

	this.setFullScreen = function ( boolean ) {

		if ( vrHMD === undefined ) return;
		if ( isFullscreen === boolean ) return;

		if ( canvas.mozRequestFullScreen ) {

			canvas.mozRequestFullScreen( { vrDisplay: vrHMD } );

		} else if ( canvas.webkitRequestFullscreen ) {

			canvas.webkitRequestFullscreen( { vrDisplay: vrHMD } );

		}

	};

	// render

	var cameraL = new THREE.PerspectiveCamera();
	var cameraR = new THREE.PerspectiveCamera();

	this.render = function ( scene, camera ) {

		if ( vrHMD ) {

			var sceneL, sceneR;

			if ( Array.isArray( scene ) ) {

				sceneL = scene[ 0 ];
				sceneR = scene[ 1 ];

			} else {

				sceneL = scene;
				sceneR = scene;

			}

			var size = renderer.getSize();
			size.width /= 2;

			renderer.enableScissorTest( true );
			renderer.clear();

			if ( camera.parent === null ) camera.updateMatrixWorld();

			cameraL.projectionMatrix = fovToProjection( eyeFOVL, true, camera.near, camera.far );
			cameraR.projectionMatrix = fovToProjection( eyeFOVR, true, camera.near, camera.far );

			camera.matrixWorld.decompose( cameraL.position, cameraL.quaternion, cameraL.scale );
			camera.matrixWorld.decompose( cameraR.position, cameraR.quaternion, cameraR.scale );

			cameraL.translateX( eyeTranslationL.x * this.scale );
			cameraR.translateX( eyeTranslationR.x * this.scale );

			// render left eye
			renderer.setViewport( 0, 0, size.width, size.height );
			renderer.setScissor( 0, 0, size.width, size.height );
			renderer.render( sceneL, cameraL );

			// render right eye
			renderer.setViewport( size.width, 0, size.width, size.height );
			renderer.setScissor( size.width, 0, size.width, size.height );
			renderer.render( sceneR, cameraR );

			renderer.enableScissorTest( false );

			return;

		}

		// Regular render mode if not HMD

		if ( Array.isArray( scene ) ) scene = scene[ 0 ];

		renderer.render( scene, camera );

	};

	//

	function fovToNDCScaleOffset( fov ) {

		var pxscale = 2.0 / ( fov.leftTan + fov.rightTan );
		var pxoffset = ( fov.leftTan - fov.rightTan ) * pxscale * 0.5;
		var pyscale = 2.0 / ( fov.upTan + fov.downTan );
		var pyoffset = ( fov.upTan - fov.downTan ) * pyscale * 0.5;
		return { scale: [ pxscale, pyscale ], offset: [ pxoffset, pyoffset ] };

	}

	function fovPortToProjection( fov, rightHanded, zNear, zFar ) {

		rightHanded = rightHanded === undefined ? true : rightHanded;
		zNear = zNear === undefined ? 0.01 : zNear;
		zFar = zFar === undefined ? 10000.0 : zFar;

		var handednessScale = rightHanded ? - 1.0 : 1.0;

		// start with an identity matrix
		var mobj = new THREE.Matrix4();
		var m = mobj.elements;

		// and with scale/offset info for normalized device coords
		var scaleAndOffset = fovToNDCScaleOffset( fov );

		// X result, map clip edges to [-w,+w]
		m[ 0 * 4 + 0 ] = scaleAndOffset.scale[ 0 ];
		m[ 0 * 4 + 1 ] = 0.0;
		m[ 0 * 4 + 2 ] = scaleAndOffset.offset[ 0 ] * handednessScale;
		m[ 0 * 4 + 3 ] = 0.0;

		// Y result, map clip edges to [-w,+w]
		// Y offset is negated because this proj matrix transforms from world coords with Y=up,
		// but the NDC scaling has Y=down (thanks D3D?)
		m[ 1 * 4 + 0 ] = 0.0;
		m[ 1 * 4 + 1 ] = scaleAndOffset.scale[ 1 ];
		m[ 1 * 4 + 2 ] = - scaleAndOffset.offset[ 1 ] * handednessScale;
		m[ 1 * 4 + 3 ] = 0.0;

		// Z result (up to the app)
		m[ 2 * 4 + 0 ] = 0.0;
		m[ 2 * 4 + 1 ] = 0.0;
		m[ 2 * 4 + 2 ] = zFar / ( zNear - zFar ) * - handednessScale;
		m[ 2 * 4 + 3 ] = ( zFar * zNear ) / ( zNear - zFar );

		// W result (= Z in)
		m[ 3 * 4 + 0 ] = 0.0;
		m[ 3 * 4 + 1 ] = 0.0;
		m[ 3 * 4 + 2 ] = handednessScale;
		m[ 3 * 4 + 3 ] = 0.0;

		mobj.transpose();

		return mobj;

	}

	function fovToProjection( fov, rightHanded, zNear, zFar ) {

		var DEG2RAD = Math.PI / 180.0;

		var fovPort = {
			upTan: Math.tan( fov.upDegrees * DEG2RAD ),
			downTan: Math.tan( fov.downDegrees * DEG2RAD ),
			leftTan: Math.tan( fov.leftDegrees * DEG2RAD ),
			rightTan: Math.tan( fov.rightDegrees * DEG2RAD )
		};

		return fovPortToProjection( fovPort, rightHanded, zNear, zFar );

	}

};

// File:examples/js/controls/VRControls.js

/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 */

THREE.VRControls = function ( object, onError ) {

	var scope = this;

	var vrInputs = [];

	function filterInvalidDevices( devices ) {

		// Exclude Cardboard position sensor if Oculus exists.

		var oculusDevices = devices.filter( function ( device ) {

			return device.deviceName.toLowerCase().indexOf( 'oculus' ) !== - 1;

		} );

		if ( oculusDevices.length >= 1 ) {

			return devices.filter( function ( device ) {

				return device.deviceName.toLowerCase().indexOf( 'cardboard' ) === - 1;

			} );

		} else {

			return devices;

		}

	}

	function gotVRDevices( devices ) {

		devices = filterInvalidDevices( devices );

		for ( var i = 0; i < devices.length; i ++ ) {

			if ( devices[ i ] instanceof PositionSensorVRDevice ) {

				vrInputs.push( devices[ i ] );

			}

		}

		if ( onError ) onError( 'HMD not available' );

	}

	if ( navigator.getVRDevices ) {

		navigator.getVRDevices().then( gotVRDevices );

	}

	// the Rift SDK returns the position in meters
	// this scale factor allows the user to define how meters
	// are converted to scene units.

	this.scale = 1;

	this.update = function () {

		for ( var i = 0; i < vrInputs.length; i ++ ) {

			var vrInput = vrInputs[ i ];

			var state = vrInput.getState();

			if ( state.orientation !== null ) {

				object.quaternion.copy( state.orientation );

			}

			if ( state.position !== null ) {

				object.position.copy( state.position ).multiplyScalar( scope.scale );

			}

		}

	};

	this.resetSensor = function () {

		for ( var i = 0; i < vrInputs.length; i ++ ) {

			var vrInput = vrInputs[ i ];

			if ( vrInput.resetSensor !== undefined ) {

				vrInput.resetSensor();

			} else if ( vrInput.zeroSensor !== undefined ) {

				vrInput.zeroSensor();

			}

		}

	};

	this.zeroSensor = function () {

		console.warn( 'THREE.VRControls: .zeroSensor() is now .resetSensor().' );
		this.resetSensor();

	};

	this.dispose = function () {

		vrInputs = [];

	};

};

// File:editor/js/Storage.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var Storage = function () {

	var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	if ( indexedDB === undefined  ) {
		console.warn( 'Storage: IndexedDB not available.' );
		return { init: function () {}, get: function () {}, set: function () {}, clear: function () {} };
	}

	var name = 'threejs-editor';
	var version = 1;

	var dbSize;

	var database;

	return {

		init: function ( callback ) {

			var request = indexedDB.open( name, version );
			request.onupgradeneeded = function ( event ) {

				var db = event.target.result;

				if ( db.objectStoreNames.contains( 'states' ) === false ) {

					db.createObjectStore( 'states' );

				}

			};
			request.onsuccess = function ( event ) {

				database = event.target.result;

				callback();

			};
			request.onerror = function ( event ) {

				console.error( 'IndexedDB', event );

			};


		},

		get: function ( callback ) {

			var transaction = database.transaction( [ 'states' ], 'readwrite' );
			var objectStore = transaction.objectStore( 'states' );
			var request = objectStore.get( 0 );
			request.onsuccess = function ( event ) {

				callback( event.target.result );

			};

		},

		set: function ( data, callback ) {

			var start = performance.now();

			var transaction = database.transaction( [ 'states' ], 'readwrite' );
			var objectStore = transaction.objectStore( 'states' );
			var request = objectStore.put( data, 0 );
			request.onsuccess = function ( event ) {

				console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Saved state to IndexedDB. ' + ( performance.now() - start ).toFixed( 2 ) + 'ms' );
				// console.log(request.);
			};

		},

		clear: function ( callback ) {

			var transaction = database.transaction( [ 'states' ], 'readwrite' );
			var objectStore = transaction.objectStore( 'states' );
			var request = objectStore.clear();
			request.onsuccess = function ( event ) {

				callback();

			};

		},

		size: function ( callback ){

			if(database != null){
		        var size = 0;
		 
		        var transaction = database.transaction(["states"])
		            .objectStore("states")
		            .openCursor();
		 
		        transaction.onsuccess = function(event){
		            var cursor = event.target.result;
		            if(cursor){
		                var storedObject = cursor.value;
		                var json = JSON.stringify(storedObject);
		                size += json.length;
		                cursor.continue();
		            }
		            else{
		            	// console.log(size);
		            	// dbSize = parseInt(size) / 1000000;
		            	// console.log(dbSize);
		            	size /= 1000000;
		            	size = parseInt(size);

		            	callback(size,null);
		            }
		        }.bind(this);
		        transaction.onerror = function(err){
		            callback(null,err);
		        }
		    }
		    else{
		        callback(null,null);
		    }
		}
	}	
};

// File:editor/js/Editor.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var Editor = function (shortcuts) {

	var SIGNALS = signals;

	this.signals = {

		// script

		editScript: new SIGNALS.Signal(),

		// player

		startPlayer: new SIGNALS.Signal(),
		stopPlayer: new SIGNALS.Signal(),

		// actions

		// showDialog: new SIGNALS.Signal(),

		// notifications

		editorCleared: new SIGNALS.Signal(),

		savingStarted: new SIGNALS.Signal(),
		savingFinished: new SIGNALS.Signal(),

		themeChanged: new SIGNALS.Signal(),

		transformModeChanged: new SIGNALS.Signal(),
		snapChanged: new SIGNALS.Signal(),
		spaceChanged: new SIGNALS.Signal(),
		rendererChanged: new SIGNALS.Signal(),

		sceneGraphChanged: new SIGNALS.Signal(),

		cameraChanged: new SIGNALS.Signal(),

		geometryChanged: new SIGNALS.Signal(),

		objectSelected: new SIGNALS.Signal(),
		objectFocused: new SIGNALS.Signal(),

		objectAdded: new SIGNALS.Signal(),
		objectChanged: new SIGNALS.Signal(),
		objectRemoved: new SIGNALS.Signal(),

		helperAdded: new SIGNALS.Signal(),
		helperRemoved: new SIGNALS.Signal(),

		materialChanged: new SIGNALS.Signal(),

		scriptAdded: new SIGNALS.Signal(),
		scriptChanged: new SIGNALS.Signal(),
		scriptRemoved: new SIGNALS.Signal(),

		fogTypeChanged: new SIGNALS.Signal(),
		fogColorChanged: new SIGNALS.Signal(),
		fogParametersChanged: new SIGNALS.Signal(),
		windowResize: new SIGNALS.Signal(),

		showGridChanged: new SIGNALS.Signal(),

		// added by Sam
		cameraPositionSnap: new SIGNALS.Signal(),
		saveProject: new SIGNALS.Signal(),
		unsaveProject: new SIGNALS.Signal(),
		undo: new SIGNALS.Signal(),
		redo: new SIGNALS.Signal(),
		soundAdded: new SIGNALS.Signal(),
		showManChanged: new SIGNALS.Signal(),
		bgColorChanged: new SIGNALS.Signal()
	};

	this.config = new Config();
	this.history = new History( this );
	this.storage = new Storage();
	this.loader = new Loader( this );
	this.shortcuts = new EditorShortCutsList();

	this.camera = new THREE.PerspectiveCamera( 50, 1, 1, 100000 );
	this.camera.position.set( 500, 250, 500 );
	this.camera.lookAt( new THREE.Vector3() );
	this.camera.name = 'Camera';

	this.listener = new THREE.AudioListener();
	this.camera.add( this.listener );

	this.scene = new THREE.Scene();
	this.scene.name = 'Scene';

	this.sceneHelpers = new THREE.Scene();

	this.object = {};
	this.geometries = {};
	this.materials = {};
	this.textures = {};
	this.scripts = {};
	
	this.soundCollection = new SoundCollection({cam:this.camera});

	this.selected = null;
	this.helpers = {};

};

Editor.prototype = {

	setTheme: function ( value ) {

		document.getElementById( 'theme' ).href = value;

		this.signals.themeChanged.dispatch( value );

	},

	/*
	showDialog: function ( value ) {

		this.signals.showDialog.dispatch( value );

	},
	*/

	//

	setScene: function ( scene ) {

		this.scene.uuid = scene.uuid;
		this.scene.name = scene.name;
		this.scene.userData = JSON.parse( JSON.stringify( scene.userData ) );

		// avoid render per object

		this.signals.sceneGraphChanged.active = false;

		while ( scene.children.length > 0 ) {

			this.addObject( scene.children[ 0 ] );

		}

		this.signals.sceneGraphChanged.active = true;
		this.signals.sceneGraphChanged.dispatch();

	},

	//

	addObject: function ( object ) {

		var scope = this;

		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

			scope.addHelper( child );

		} );

		this.scene.add( object );

		this.signals.objectAdded.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	cloneObject: function(){

		var object = editor.selected;

		if( object === null ) return;

		if ( object.parent === undefined ) return; // avoid cloning the camera or scene

		object = object.clone();

		editor.addObject( object );
		editor.select( object );
	},

	destoryCurrent: function(){

		var object = this.selected;
		console.log("hey");

		if(object === null) return;

		if ( confirm( 'Delete ' + object.name + '?' ) === false ) return;

		var parent = object.parent;
		this.removeObject( object );
		this.select( null );
	},

	moveObject: function ( object, parent, before ) {

		if ( parent === undefined ) {

			parent = this.scene;

		}

		parent.add( object );

		// sort children array

		if ( before !== undefined ) {

			var index = parent.children.indexOf( before );
			parent.children.splice( index, 0, object );
			parent.children.pop();

		}

		this.signals.sceneGraphChanged.dispatch();

	},

	nameObject: function ( object, name ) {

		object.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	removeObject: function ( object ) {

		if ( object.parent === null ) return; // avoid deleting the camera or scene

		var scope = this;

		object.traverse( function ( child ) {

			scope.removeHelper( child );

		} );

		object.parent.remove( object );

		this.signals.objectRemoved.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	addGeometry: function ( geometry ) {

		this.geometries[ geometry.uuid ] = geometry;

	},

	setGeometryName: function ( geometry, name ) {

		geometry.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addMaterial: function ( material ) {

		this.materials[ material.uuid ] = material;

	},

	setMaterialName: function ( material, name ) {

		material.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addTexture: function ( texture ) {

		this.textures[ texture.uuid ] = texture;

	},

	//

	addHelper: function () {

		var geometry = new THREE.SphereBufferGeometry( 20, 4, 2 );
		var material = new THREE.MeshBasicMaterial( { color: 0xff0000, visible: false } );

		return function ( object ) {

			var helper;

			if ( object instanceof THREE.Camera ) {

				helper = new THREE.CameraHelper( object, 10 );

			} else if ( object instanceof THREE.PointLight ) {

				helper = new THREE.PointLightHelper( object, 10 );

			} else if ( object instanceof THREE.DirectionalLight ) {

				helper = new THREE.DirectionalLightHelper( object, 20 );

			} else if ( object instanceof THREE.SpotLight ) {

				helper = new THREE.SpotLightHelper( object, 10 );

			} else if ( object instanceof THREE.HemisphereLight ) {

				helper = new THREE.HemisphereLightHelper( object, 10 );

			} else if ( object instanceof THREE.SkinnedMesh ) {

				helper = new THREE.SkeletonHelper( object );

			} else {

				// no helper for this object type
				return;

			}

			var picker = new THREE.Mesh( geometry, material );
			picker.name = 'picker';
			picker.userData.object = object;
			helper.add( picker );

			this.sceneHelpers.add( helper );
			this.helpers[ object.id ] = helper;

			this.signals.helperAdded.dispatch( helper );

		};

	}(),

	removeHelper: function ( object ) {

		if ( this.helpers[ object.id ] !== undefined ) {

			var helper = this.helpers[ object.id ];
			helper.parent.remove( helper );

			delete this.helpers[ object.id ];

			this.signals.helperRemoved.dispatch( helper );

		}

	},

	//

	addScript: function ( object, script ) {

		if ( this.scripts[ object.uuid ] === undefined ) {

			this.scripts[ object.uuid ] = [];

		}

		this.scripts[ object.uuid ].push( script );

		this.signals.scriptAdded.dispatch( script );

	},

	removeScript: function ( object, script ) {

		if ( this.scripts[ object.uuid ] === undefined ) return;

		var index = this.scripts[ object.uuid ].indexOf( script );

		if ( index !== - 1 ) {

			this.scripts[ object.uuid ].splice( index, 1 );

		}

		this.signals.scriptRemoved.dispatch( script );

	},

	//

	select: function ( object ) {

		if ( this.selected === object ) return;

		var uuid = null;

		if ( object !== null ) {

			uuid = object.uuid;

		}

		this.selected = object;

		this.config.setKey( 'selected', uuid );
		this.signals.objectSelected.dispatch( object );

	},

	selectById: function ( id ) {

		if ( id === this.camera.id ) {

			this.select( this.camera );
			return;

		}

		this.select( this.scene.getObjectById( id, true ) );

	},

	selectByUuid: function ( uuid ) {

		var scope = this;

		this.scene.traverse( function ( child ) {

			if ( child.uuid === uuid ) {

				scope.select( child );

			}

		} );

	},

	deselect: function () {

		this.select( null );

	},

	focus: function ( object ) {

		this.signals.objectFocused.dispatch( object );

	},

	focusById: function ( id ) {

		this.focus( this.scene.getObjectById( id, true ) );

	},

	hide: function(){

		if(this.selected !== null){
			this.selected.visible = false;
			this.deselect();
		}
	},

	unhideAll: function(){

		this.scene.traverse( function ( child ) {

			child.visible = true;

		} );

		this.signals.sceneGraphChanged.dispatch();
	},

	isolate: function(){

		var mode = !this.isolationMode;
		this.isolationMode = mode;

		if(this.selected !== null){
			this.scene.traverse( function ( child ) {

				if ( child.parent !== undefined //don't hide scene
					&& !(child instanceof THREE.Light // dont hide lights
					)){ 
					child.visible = mode;
				}

			} );

			this.selected.traverse( function ( child2 ) { //Show all chilrden

				child2.visible = true;

			} );

			//TODO: Add parent iteration so all parents of an object stay visible and don't hide the child

			this.signals.sceneGraphChanged.dispatch();

		}
	},

	clear: function () {

		this.history.clear();

		this.camera.position.set( 500, 250, 500 );
		this.camera.lookAt( new THREE.Vector3() );

		var objects = this.scene.children;

		while ( objects.length > 0 ) {

			this.removeObject( objects[ 0 ] );

		}

		this.geometries = {};
		this.materials = {};
		this.textures = {};
		this.scripts = {};

		this.deselect();

		this.signals.editorCleared.dispatch();

	},

	play: function ( ) {
	
		this.scene.traverse( function ( child ) {
		
			if ( child.sounds ) {
			
				if ( child.sounds.constant ) {
					editor.soundCollection.playAttachedSound( child.sounds.constant, child );
				}
			
			}
		
		}.bind( this ) );
		
	},
	
	stop: function ( ) {
	
		this.scene.traverse( function ( child ) {
			
			if ( child.sounds ) {
			
				editor.soundCollection.stop( child.sounds.constant, true );
				console.log(child.name);
			}
		
		}.bind( this ) );
	},	

	//

	fromJSON: function ( json ) {

		var loader = new THREE.ObjectLoader();

		// backwards

		if ( json.scene === undefined ) {

			this.setScene( loader.parse( json ) );
			return;

		}

		// TODO: Clean this up somehow

		var camera = loader.parse( json.camera );

		this.camera.position.copy( camera.position );
		this.camera.rotation.copy( camera.rotation );
		this.camera.aspect = camera.aspect;
		this.camera.near = camera.near;
		this.camera.far = camera.far;

		this.setScene( loader.parse( json.scene ) );
		this.scripts = json.scripts;

		// document.getElementById( "preloader" ).style.display = "none";


	},

	toJSON: function () {

		// console.log(this.scene.toJSON())

		return {

			project: {
				// vr: this.config.getKey( 'project/vr' )
			},
			camera: this.camera.toJSON(),
			scene: this.scene.toJSON(),
			scripts: this.scripts

		};

	}

}

// File:editor/js/Config.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var Config = function () {

	var name = 'threejs-editor';

	var storage = {
		'autosave': true,
		'theme': 'css/dark.css',

		'backgroundColor': 0xcccccc,

		'project/renderer': 'WebGLRenderer',
		'project/renderer/antialias': true,
		'project/vr': false,

		'ui/sidebar/animation/collapsed': true,
		'ui/sidebar/geometry/collapsed': true,
		'ui/sidebar/material/collapsed': true,
		'ui/sidebar/object3d/collapsed': false,
		'ui/sidebar/project/collapsed': true,
		'ui/sidebar/scene/collapsed': false,
		'ui/sidebar/script/collapsed': true
	};

	if ( window.localStorage[ name ] === undefined ) {

		window.localStorage[ name ] = JSON.stringify( storage );

	} else {

		var data = JSON.parse( window.localStorage[ name ] );

		for ( var key in data ) {

			storage[ key ] = data[ key ];

		}

	}

	return {

		getKey: function ( key ) {

			return storage[ key ];

		},

		setKey: function () { // key, value, key, value ...

			for ( var i = 0, l = arguments.length; i < l; i += 2 ) {

				storage[ arguments[ i ] ] = arguments[ i + 1 ];

			}

			window.localStorage[ name ] = JSON.stringify( storage );

			console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Saved config to LocalStorage.' );

		},

		clear: function () {

			delete window.localStorage[ name ];

		}

	}

};

// File:editor/js/History.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var History = function ( editor ) {

	this.array = [];
	this.arrayLength = -1;

	this.current = -1;
	this.isRecording = true;

	//

	var scope = this;
	var signals = editor.signals;

	signals.objectAdded.add( function ( object ) {

		if ( scope.isRecording === false ) return;

		scope.add(
			function () {
				editor.removeObject( object );
				editor.select( null );
			},
			function () {
				editor.addObject( object );
				editor.select( object );
			}
		);

	} );

};

History.prototype = {

	add: function ( undo, redo ) {

		this.current ++;

		this.array[ this.current ] = { undo: undo, redo: redo };
		this.arrayLength = this.current;

	},

	undo: function () {

		if ( this.current < 0 ) return;

		this.isRecording = false;

		this.array[ this.current -- ].undo();

		this.isRecording = true;

	},

	redo: function () {

		if ( this.current === this.arrayLength ) return;

		this.isRecording = false;

		this.array[ ++ this.current ].redo();

		this.isRecording = true;

	},

	clear: function () {

		this.array = [];
		this.arrayLength = -1;

		this.current = -1;

	}

};

// File:editor/js/Loader.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var Loader = function ( editor ) {

	var scope = this;
	var signals = editor.signals;

	this.texturePath = '';

	this.loadFile = function ( file ) {

		var filename = file.name;
		var extension = filename.split( '.' ).pop().toLowerCase();

		switch ( extension ) {

			case 'awd':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.AWDLoader();
					var scene = loader.parse( event.target.result );

					editor.setScene( scene );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'babylon':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.BabylonLoader();
					var scene = loader.parse( json );

					editor.setScene( scene );

				}, false );
				reader.readAsText( file );

				break;

			case 'babylonmeshdata':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.BabylonLoader();

					var geometry = loader.parseGeometry( json );
					var material = new THREE.MeshPhongMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );
				reader.readAsText( file );

				break;

			case 'ctm':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var data = new Uint8Array( event.target.result );

					var stream = new CTM.Stream( data );
					stream.offset = 0;

					var loader = new THREE.CTMLoader();
					loader.createModel( new CTM.File( stream ), function( geometry ) {

						geometry.sourceType = "ctm";
						geometry.sourceFile = file.name;

						var material = new THREE.MeshPhongMaterial();

						var mesh = new THREE.Mesh( geometry, material );
						mesh.name = filename;

						editor.addObject( mesh );
						editor.select( mesh );

					} );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'dae':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var parser = new DOMParser();
					var xml = parser.parseFromString( contents, 'text/xml' );

					var loader = new THREE.ColladaLoader();
					var collada = loader.parse( xml );

					collada.scene.name = filename;

					editor.addObject( collada.scene );
					editor.select( collada.scene );

				}, false );
				reader.readAsText( file );

				break;

			case 'js':
			case 'json':

			case '3geo':
			case '3mat':
			case '3obj':
			case '3scn':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					// document.getElementById( "preloader" ).style.display = "block";

					// 2.0

					if ( contents.indexOf( 'postMessage' ) !== -1 ) {

						var blob = new Blob( [ contents ], { type: 'text/javascript' } );
						var url = URL.createObjectURL( blob );

						var worker = new Worker( url );

						worker.onmessage = function ( event ) {

							event.data.metadata = { version: 2 };
							handleJSON( event.data, file, filename );

						};

						worker.postMessage( Date.now() );
						return;

					}

					// >= 3.0

					var data;

					try {

						data = JSON.parse( contents );

					} catch ( error ) {

						alert( error );
						return;

					}

					handleJSON( data, file, filename );

				}, false );
				reader.readAsText( file );

				break;

				case 'md2':

					var reader = new FileReader();
					reader.addEventListener( 'load', function ( event ) {

						var contents = event.target.result;

						var geometry = new THREE.MD2Loader().parse( contents );
						var material = new THREE.MeshPhongMaterial( {
							morphTargets: true,
							morphNormals: true
						} );

						var object = new THREE.MorphAnimMesh( geometry, material );
						object.name = filename;

						editor.addObject( object );
						editor.select( object );

					}, false );
					reader.readAsArrayBuffer( file );

					break;

			case 'obj':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var object = new THREE.OBJLoader().parse( contents );
					object.name = filename;

					editor.addObject( object );
					editor.select( object );

				}, false );
				reader.readAsText( file );

				break;

			case 'ply':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.PLYLoader().parse( contents );
					geometry.sourceType = "ply";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshPhongMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );
				reader.readAsText( file );

				break;

			case 'stl':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.STLLoader().parse( contents );
					geometry.sourceType = "stl";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshPhongMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );

				if ( reader.readAsBinaryString !== undefined ) {

					reader.readAsBinaryString( file );

				} else {

					reader.readAsArrayBuffer( file );

				}

				break;

			/*
			case 'utf8':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.UTF8Loader().parse( contents );
					var material = new THREE.MeshLambertMaterial();

					var mesh = new THREE.Mesh( geometry, material );

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );
				reader.readAsBinaryString( file );

				break;
			*/

			case 'vtk':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.VTKLoader().parse( contents );
					geometry.sourceType = "vtk";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshPhongMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );
				reader.readAsText( file );

				break;

			case 'wrl':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var result = new THREE.VRMLLoader().parse( contents );

					editor.setScene( result );

				}, false );
				reader.readAsText( file );

				break;

			default:

				alert( 'Unsupported file format (' + extension +  ').' );

				break;

		}

	}

	var handleJSON = function ( data, file, filename ) {

		// data.metadata = data.object.metadata;

		// delete data.object.metadata;

		if ( data.metadata === undefined ) { // 2.0

			data.metadata = { type: 'Geometry' };

		}

		if ( data.metadata.type === undefined ) { // 3.0

			data.metadata.type = 'Geometry';

		}

		if ( data.metadata.version === undefined ) {

			data.metadata.version = data.metadata.formatVersion;

		}

		if ( data.metadata.type === 'BufferGeometry' ) {

			var loader = new THREE.BufferGeometryLoader();
			var result = loader.parse( data );

			var mesh = new THREE.Mesh( result );

			editor.addObject( mesh );
			editor.select( mesh );

		} else if ( data.metadata.type.toLowerCase() === 'geometry' ) {

			// console.log("hey")


			var loader = new THREE.JSONLoader();
			loader.setTexturePath( scope.texturePath );

			var result = loader.parse( data );

			var geometry = result.geometry;
			var material;

			if ( result.materials !== undefined ) {

				if ( result.materials.length > 1 ) {

					material = new THREE.MeshFaceMaterial( result.materials );

				} else {

					material = result.materials[ 0 ];

				}

			} else {

				material = new THREE.MeshPhongMaterial();

			}

			geometry.sourceType = "ascii";
			geometry.sourceFile = file.name;

			var mesh;

			if ( geometry.animation && geometry.animation.hierarchy ) {

				mesh = new THREE.SkinnedMesh( geometry, material );

			} else {

				mesh = new THREE.Mesh( geometry, material );

			}

			mesh.name = filename;

			editor.addObject( mesh );
			editor.select( mesh );

		} else if ( data.metadata.type.toLowerCase() === 'object' ) {


			var loader = new THREE.ObjectLoader();
			loader.setTexturePath( scope.texturePath );

			var result = loader.parse( data );

			if ( result instanceof THREE.Scene ) {

				editor.setScene( result );

			} else {

				editor.addObject( result );
				editor.select( result );

			}

		} else if ( data.metadata.type.toLowerCase() === 'scene' ) {

			// DEPRECATED

			var loader = new THREE.SceneLoader();
			loader.parse( data, function ( result ) {

				editor.setScene( result.scene );

			}, '' );

		}
		
		// document.getElementById( "preloader" ).style.display = "none";

	};

}

// File:editor/js/Menubar.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var Menubar = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'menubar' );

	container.add( new Menubar.File( editor ) );
	container.add( new Menubar.Edit( editor ) );
	container.add( new Menubar.Add( editor ) );
	container.add( new Menubar.Light( editor ) );
	container.add( new Menubar.Navigation( editor ) );
	container.add( new Menubar.View( editor ) );
	container.add( new Menubar.Play( editor ) );
	container.add( new Menubar.Plus( editor ) );

	container.add( new Menubar.Status( editor ) );

	return container;

};

// File:editor/js/Menubar.File.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.File = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'File' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// New

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'New' );
	option.onClick( function () {

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

			editor.clear();
            App.Helper.New();

		}

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Import

	var fileInput = document.createElement( 'input' );
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function ( event ) {

		editor.loader.loadFile( fileInput.files[ 0 ] );

	} );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Import' );
	option.onClick( function () {

		fileInput.click();

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );




	// Export Scene

	// var option = new UI.Panel();
	// option.setClass( 'option' );
	// option.setTextContent( 'Export Scene' );
	// option.onClick( function () {

	// 	var output = editor.scene.toJSON();
	// 	output = JSON.stringify( output, null, '\t' );
	// 	output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

	// 	exportString( output, 'scene.json' );

	// } );
	// options.add( option );

	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link ); // Firefox workaround, see #6594

	var exportString = function ( output, filename ) {

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		link.href = objectURL;
		link.download = filename || 'data.json';
		link.target = '_blank';

		var event = document.createEvent("MouseEvents");
		event.initMouseEvent(
			"click", true, false, window, 0, 0, 0, 0, 0
			, false, false, false, false, 0, null
		);
		link.dispatchEvent(event);

	};

	// Save to Platform

    var option = new UI.Panel();
    option.setClass( 'option' );
    option.setTextContent( 'Publish' );

    option.onClick( function () {
        var output = editor.scene.toJSON();
        App.Helper.Save(output);
    } );
    options.add( option );

	return container;

};

// File:editor/js/Menubar.Edit.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Edit = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();	
	title.setClass( 'title' );
	title.setTextContent( 'Edit' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	//Undo
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Undo ( ' + editor.shortcuts.getKey( 'history/undo' ) +' )' );
	option.onClick( function () {

		editor.history.undo();

	} );
	options.add( option );	

	//Redo
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Redo ( ' + editor.shortcuts.getKey( 'history/redo' ) +' )' );
	option.onClick( function () {

		editor.history.redo();

	} );
	options.add( option );

	//Translate
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Translate ( ' + editor.shortcuts.getKey( 'transform/move' ) +' )' );
	option.onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );

	//Scale
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Scale ( ' + editor.shortcuts.getKey( 'transform/scale' ) +' )' );
		option.onClick( function () {

		signals.transformModeChanged.dispatch( 'scale' );

	} );
	options.add( option );

	//Rotate
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Rotate ( ' + editor.shortcuts.getKey( 'transform/rotate' ) +' )' );
	option.onClick( function () {

		signals.transformModeChanged.dispatch( 'rotate' );

	} );

	//TODO: Put the action to a different place
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Clone ( ' + editor.shortcuts.getKey( 'edit/cloneObject' ) +' )');
	option.onClick( function () {

		// var object = editor.selected;

		// if ( object.parent === undefined ) return; // avoid cloning the camera or scene

		// object = object.clone();

		// editor.addObject( object );
		// editor.select( object );
		editor.cloneObject();

	} );
	options.add( option );

	//TODO: Put the action to a different place
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Delete ( X )' );
	option.onClick( function () {
	
		// var object = editor.selected;

		// if ( confirm( 'Delete ' + object.name + '?' ) === false ) return;

		// var parent = object.parent;
		// editor.removeObject( object );
		// editor.select( parent );
		editor.destoryCurrent();

	} );
	options.add( option );


	options.add( option );
	

	return container;

};

// File:editor/js/Menubar.Add.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Add = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Add' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	
	var meshCount = 0;
	var lightCount = 0;
	var cameraCount = 0;

	editor.signals.editorCleared.add( function () {

		meshCount = 0;
		lightCount = 0;
		cameraCount = 0;

	} );

	// // Soundsource
	// var option = new UI.Panel();
	// option.setClass( 'option' );
	// option.setTextContent( 'Soundsource' );
	// option.onClick( function () {

	// 	var source = new THREE.Audio(editor.listener);

	// 	editor.addObject( source );
	// 	editor.select( source );

	// } );
	// options.add( option );

	// Box
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Box' );
	option.onClick( function () {

		var width = 100;
		var height = 100;
		var depth = 100;

		var widthSegments = 1;
		var heightSegments = 1;
		var depthSegments = 1;

		var geometry = new THREE.BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'Box ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	// Cylinder
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Cylinder' );
	option.onClick( function () {

		var radiusTop = 20;
		var radiusBottom = 20;
		var height = 100;
		var radiusSegments = 32;
		var heightSegments = 1;
		var openEnded = false;

		var geometry = new THREE.CylinderGeometry( radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'Cylinder ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	// Sphere
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Sphere' );
	option.onClick( function () {

		var radius = 75;
		var widthSegments = 32;
		var heightSegments = 16;
		var phiStart = 0;
		var phiLength = Math.PI * 2;
		var thetaStart = 0;
		var thetaLength = Math.PI;

		var geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'Sphere ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	
	// // Text
	// var option = new UI.Panel();
	// option.setClass( 'option' );
	// option.setTextContent( 'Text' );
	// option.onClick( function () {

	// 	var text = "three.js",
	// 			height = 20,
	// 			size = 70,
	// 			hover = 30,

	// 			curveSegments = 4,

	// 			bevelThickness = 2,
	// 			bevelSize = 1.5,
	// 			bevelSegments = 3,
	// 			bevelEnabled = true,

	// 			font = "helvetiker", // helvetiker, optimer, gentilis, droid sans, droid serif
	// 			weight = "bold", // normal bold
	// 			style = "normal"; // normal italic



	// 	var textGeo = new THREE.TextGeometry( text, {

	// 		size: size,
	// 		height: height,
	// 		curveSegments: curveSegments,

	// 		font: font,
	// 		weight: weight,
	// 		style: style,

	// 		bevelThickness: bevelThickness,
	// 		bevelSize: bevelSize,
	// 		bevelEnabled: bevelEnabled,

	// 		material: 0,
	// 		extrudeMaterial: 1

	// 	});

	// 	console.log(textGeo);

	// 	textGeo.computeBoundingBox();
	// 	textGeo.computeVertexNormals();

	// 	// "fix" side normals by removing z-component of normals for side faces
	// 	// (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

	// 	if ( ! bevelEnabled ) {

	// 		var triangleAreaHeuristics = 0.1 * ( height * size );

	// 		for ( var i = 0; i < textGeo.faces.length; i ++ ) {

	// 			var face = textGeo.faces[ i ];

	// 			if ( face.materialIndex == 1 ) {

	// 				for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

	// 					face.vertexNormals[ j ].z = 0;
	// 					face.vertexNormals[ j ].normalize();

	// 				}

	// 				var va = textGeo.vertices[ face.a ];
	// 				var vb = textGeo.vertices[ face.b ];
	// 				var vc = textGeo.vertices[ face.c ];

	// 				var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

	// 				if ( s > triangleAreaHeuristics ) {

	// 					for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

	// 						face.vertexNormals[ j ].copy( face.normal );

	// 					}

	// 				}

	// 			}

	// 		}

	// 	}

	// 	var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

	// 	textMesh1 = new THREE.Mesh( textGeo, new THREE.MeshBasicMaterial({color: 'antiquewhite', needsUpdate: true }) );

	// 	textMesh1.position.x = centerOffset;
	// 	textMesh1.position.y = hover;
	// 	textMesh1.position.z = 0;

	// 	textMesh1.rotation.x = 0;
	// 	textMesh1.rotation.y = Math.PI * 2;

	// 	textMesh1.name = "Text Object";

	// 	console.log(textMesh1);

	// 	editor.addObject( textMesh1 );
	// 	editor.select( textMesh1 );

	// } );
	// options.add( option );

	// Mediasphere

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Mediasphere' );
	option.onClick( function () {

		//Media Object
		var radius = 120;
		var widthSegments = 64;
		var heightSegments = 64;
		var phiStart = 0;
		var phiLength = Math.PI * 2;
		var thetaStart = 0;
		var thetaLength = Math.PI;

		var geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );
		THREE.ImageUtils.crossOrigin = '';
		var texture = THREE.ImageUtils.loadTexture('http://upload.wikimedia.org/wikipedia/commons/1/18/Rheingauer_Dom%2C_Geisenheim%2C_360_Panorama_%28Equirectangular_projection%29.jpg');
		var mediaObject = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({map: texture, side: THREE.FrontSide, needsUpdate: true}) );

		mediaObject.name = 'MediaSphere';


		editor.addObject( mediaObject );
		mediaObject.scale.set(-1,1,1);

		//TargetObject
		var radius = 15;
		var widthSegments = 10;
		var heightSegments = 10;
		var phiStart = 0;
		var phiLength = Math.PI * 2;
		var thetaStart = 0;
		var thetaLength = Math.PI;

		var geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial({transparent: true, depthTest: true, depthWrite: true, needsUpdate: true}) );
		// var mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial({transparent: true, depthTest: false, depthWrite: false, needsUpdate: true}) );

		mesh.name = 'Target_name';

		editor.addObject( mesh );
		mesh.scale.set(-1,1,1);
		
		editor.select( mediaObject );

		editor.moveObject(mesh, mediaObject);

	} );
	options.add( option );

	return container;

}

// File:editor/js/Menubar.Play.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Play = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var isPlaying = false;

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Play' );
	title.onClick( function () {

		if ( isPlaying === false ) {

			isPlaying = true;
			title.setTextContent( 'Stop' );
			signals.startPlayer.dispatch();

		} else {

			isPlaying = false;
			title.setTextContent( 'Play' );
			signals.stopPlayer.dispatch();

		}

	} );
	container.add( title );

	return container;

};

// File:editor/js/Menubar.View.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.View = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'View' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Hide selected ( ' + editor.shortcuts.getKey( 'view/hide' ) +' )' );
	option.onClick( function () {

		editor.hide();

	} );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Unhide All ( ' + editor.shortcuts.getKey( 'view/unhideAll' ) +' )');
		option.onClick( function () {

		editor.unhideAll();

	} );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Isolation Mode ( ' + editor.shortcuts.getKey( 'view/isolate' ) +' )');
	option.onClick( function () {

		editor.isolate();

	} );

	options.add( new UI.HorizontalRule() );

	// Light theme
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Light theme' );
	option.onClick( function () {

		editor.setTheme( 'css/light.css' );
		editor.config.setKey( 'theme', 'css/light.css' );
		editor.hide();

	} );
	options.add( option );

	// Dark theme

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Dark theme' );
	option.onClick( function () {

		editor.setTheme( 'css/dark.css' );
		editor.config.setKey( 'theme', 'css/dark.css' );
		editor.unhideAll();

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// fullscreen

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Fullscreen' );
	option.onClick( function () {

		var element = document.body;

		if ( element.requestFullscreen ) {

			element.requestFullscreen();

		} else if ( element.mozRequestFullScreen ) {

			element.mozRequestFullScreen();

		} else if ( element.webkitRequestFullscreen ) {

			element.webkitRequestFullscreen();

		} else if ( element.msRequestFullscreen ) {

			element.msRequestFullscreen();

		}

	} );


	options.add( option );

	return container;

	
};



// File:editor/js/Menubar.Examples.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Examples = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Examples' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// Examples

	var items = [
		{ title: 'Head Studies', file: 'arkanoid.app.json' },
		{ title: 'Architecture Demo', file: 'camera.app.json' },
		{ title: 'Photo Book', file: 'particles.app.json' },
		{ title: 'Interactive Campaign Demo', file: 'pong.app.json' },
		{ title: 'Sam Default', file: 'scene.json' }
	];

	var loader = new THREE.XHRLoader();

	for ( var i = 0; i < items.length; i ++ ) {

		( function ( i ) {

			var item = items[ i ];

			var option = new UI.Panel();
			option.setClass( 'option' );
			option.setTextContent( item.title );
			option.onClick( function () {

				if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

					loader.load( 'examples/' + item.file, function ( text ) {

						editor.clear();
						editor.fromJSON( JSON.parse( text ) );

					} );

				}

			} );
			options.add( option );

		} )( i )

	}

	return container;

};

// File:editor/js/Menubar.Help.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Help = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent("Info");
	// title.setBackground('#E6E6E6 url(http://localhost:8000/GITTY/MYVR/editor/imgs/toolbar-07.png)');
	// title.setBackgroundRepeat("no-repeat");
	// title.setBackgroundSize("50px, 100px");
	// title.setTextContent( 'Info' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// Source code

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Source code' );
	option.onClick( function () {

		window.open( 'https://github.com/mrdoob/three.js/tree/master/editor', '_blank' )

	} );
	options.add( option );

	// About

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'About' );
	option.onClick( function () {

		window.open( 'http://threejs.org', '_blank' );

	} );
	options.add( option );

	return container;

};

// File:editor/js/Menubar.Status.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Status = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu right' );

	// var checkbox = new UI.Checkbox( editor.config.getKey( 'autosave' ) );
	// checkbox.onChange( function () {

	// 	var value = this.getValue();

	// 	editor.config.setKey( 'autosave', value );

	// 	if ( value === true ) {

	// 		editor.signals.sceneGraphChanged.dispatch();

	// 	}

	// } );
	// container.add( checkbox );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Size: unknown' );

	editor.storage.size( function (size){
					title.setTextContent( "Size : " + size + "/100Mb");
					// title.setWidth(size);

		});

	container.add( title );

	// var loading = new UI.Panel();
	// loading.setClass( 'status' );

	// container.add( loading );

	var saveButton = new UI.Panel();
	saveButton.setClass( 'button' );
	// saveButton.setWidth("300px");
	saveButton.setTextContent( 'Save' );
	saveButton.onClick( function() {

		editor.storage.size( function (size){
					title.setTextContent( "Size : " + size + "/100Mb");
					// title.setWidth(size);

		});

		// console.log(editor.storage.dbSize);
		// title.setTextContent( "Size : " + editor.storage.dbSize + "/100Mb");

		editor.signals.saveProject.dispatch();
		// console.log("savebutton");

	} );
	container.add(saveButton);

	// var title = new UI.Panel();
	// title.setClass( 'title' );
	// title.setTextContent( 'Size: unknown' );
	// container.add( title );

	editor.signals.unsaveProject.add( function () {

		saveButton.setBackgroundColor('crimson').setColor('white').setBorder('none');
		// saveButton.setColor('white');

	} );

	editor.signals.savingStarted.add( function () {

		// title.setTextDecoration( 'underline' );
		saveButton.setBackgroundColor('lightgoldenrodyellow').setColor('darkslategrey');
		//Create a "currently saving overlay"
		// document.getElementById((saveOverlay).style.display = 'initial';

	} );

	editor.signals.savingFinished.add( function () {

		saveButton.setBackgroundColor('lightgreen');
		// 	title.setTextDecoration( 'none' );
		// document.getElementById(saveOverlay).style.display = 'none';

	} );

	return container;

};

// File:editor/js/Menubar.Plus.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Plus = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Exit' );
	title.onClick( function () {

		window.open( 'http://zaak.io' )

	} );
	container.add( title );

	// var options = new UI.Panel();
	// options.setClass( 'options' );
	// container.add( options );

	// // Source code

	// var option = new UI.Panel();
	// option.setClass( 'option' );
	// option.setTextContent( 'Return to ZAAK Plus' );
	// option.onClick( function () {

	// 	window.open( 'http://zaak.io' )

	// } );
	// options.add( option );
	return container;

};

// File:editor/js/Sidebar.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var Sidebar = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'sidebar' );

	container.add( new Sidebar.Project( editor ) );
	container.add( new Sidebar.Scene( editor ) );
	container.add( new Sidebar.Object3D( editor ) );
	// container.add( new Sidebar.Sounds( editor ) );
	container.add( new Sidebar.Geometry( editor ) );
	container.add( new Sidebar.Material( editor ) );
	container.add( new Sidebar.Animation( editor ) );
	container.add( new Sidebar.Script( editor ) );

	return container;

};

// File:editor/js/Sidebar.Project.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Project = function ( editor ) {

	var signals = editor.signals;

	var rendererTypes = {

		'WebGLRenderer': THREE.WebGLRenderer,
		'CanvasRenderer': THREE.CanvasRenderer,
		'SVGRenderer': THREE.SVGRenderer,
		'SoftwareRenderer': THREE.SoftwareRenderer,
		'RaytracingRenderer': THREE.RaytracingRenderer

	};

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/project/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/project/collapsed', boolean );

	} );

	container.addStatic( new UI.Text( 'PROJECT' ) );
	container.add( new UI.Break() );

	// class

	var options = {};

	for ( var key in rendererTypes ) {

		if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

		options[ key ] = key;

	}

	var rendererTypeRow = new UI.Panel();
	var rendererType = new UI.Select().setOptions( options ).setWidth( '150px' ).onChange( function () {

		editor.config.setKey( 'project/renderer', this.getValue() );
		updateRenderer();

	} );

	rendererTypeRow.add( new UI.Text( 'Renderer' ).setWidth( '90px' ) );
	rendererTypeRow.add( rendererType );

	container.add( rendererTypeRow );

	if ( editor.config.getKey( 'project/renderer' ) !== undefined ) {

		rendererType.setValue( editor.config.getKey( 'project/renderer' ) );

	}

	// antialiasing

	var rendererAntialiasRow = new UI.Panel();
	var rendererAntialias = new UI.Checkbox( editor.config.getKey( 'project/renderer/antialias' ) ).setLeft( '100px' ).onChange( function () {

		editor.config.setKey( 'project/renderer/antialias', this.getValue() );
		updateRenderer();

	} );

	rendererAntialiasRow.add( new UI.Text( 'Antialias' ).setWidth( '90px' ) );
	rendererAntialiasRow.add( rendererAntialias );

	container.add( rendererAntialiasRow );

	// VR

	var vrRow = new UI.Panel();
	var vr = new UI.Checkbox( editor.config.getKey( 'project/vr' ) ).setLeft( '100px' ).onChange( function () {

		editor.config.setKey( 'project/vr', this.getValue() );
		// updateRenderer();

	} );

	vrRow.add( new UI.Text( 'VR' ).setWidth( '90px' ) );
	vrRow.add( vr );

	container.add( vrRow );

	//

	function updateRenderer() {

		createRenderer( rendererType.getValue(), rendererAntialias.getValue() );

	}

	function createRenderer( type, antialias ) {

		if ( type === 'WebGLRenderer' && System.support.webgl === false ) {

			type = 'CanvasRenderer';

		}

		var renderer = new rendererTypes[ type ]( { antialias: antialias } );
		signals.rendererChanged.dispatch( renderer );

	}

	createRenderer( editor.config.getKey( 'project/renderer' ), editor.config.getKey( 'project/renderer/antialias' ) );

	return container;

}

// File:editor/js/Sidebar.Scene.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Scene = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/scene/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/scene/collapsed', boolean );

	} );

	container.addStatic( new UI.Text( 'SCENE' ) );
	container.add( new UI.Break() );

	var ignoreObjectSelectedSignal = false;

	var outliner = new UI.Outliner( editor );
	outliner.onChange( function () {

		ignoreObjectSelectedSignal = true;

		editor.selectById( parseInt( outliner.getValue() ) );

		ignoreObjectSelectedSignal = false;

	} );
	outliner.onDblClick( function () {

		editor.focusById( parseInt( outliner.getValue() ) );

	} );
	container.add( outliner );
	container.add( new UI.Break() );

	
	var bgColorRow = new UI.Panel();
	var bgColor = new UI.Color().setHexValue( editor.config.getKey('backgroundColor'));
	bgColor.onChange( function () {
		signals.bgColorChanged.dispatch( bgColor.getHexValue() );

	} );

	bgColorRow.add( new UI.Text( 'Background color' ).setWidth( '90px' ) );
	bgColorRow.add( bgColor );

	container.add( bgColorRow );

	// fog

	var updateFogParameters = function () {

		var near = fogNear.getValue();
		var far = fogFar.getValue();
		var density = fogDensity.getValue();

		signals.fogParametersChanged.dispatch( near, far, density );

	};

	var fogTypeRow = new UI.Panel();
	var fogType = new UI.Select().setOptions( {

		'None': 'None',
		'Fog': 'Linear',
		'FogExp2': 'Exponential'

	} ).setWidth( '150px' );
	fogType.onChange( function () {

		var type = fogType.getValue();
		signals.fogTypeChanged.dispatch( type );

		refreshFogUI();

	} );

	fogTypeRow.add( new UI.Text( 'Fog' ).setWidth( '90px' ) );
	fogTypeRow.add( fogType );

	container.add( fogTypeRow );

	// fog color

	var fogColorRow = new UI.Panel();
	fogColorRow.setDisplay( 'none' );

	var fogColor = new UI.Color().setValue( '#aaaaaa' )
	fogColor.onChange( function () {

		signals.fogColorChanged.dispatch( fogColor.getHexValue() );

	} );

	fogColorRow.add( new UI.Text( 'Fog color' ).setWidth( '90px' ) );
	fogColorRow.add( fogColor );

	container.add( fogColorRow );

	// fog near

	var fogNearRow = new UI.Panel();
	fogNearRow.setDisplay( 'none' );

	var fogNear = new UI.Number( 1 ).setWidth( '60px' ).setRange( 0, Infinity ).onChange( updateFogParameters );

	fogNearRow.add( new UI.Text( 'Fog near' ).setWidth( '90px' ) );
	fogNearRow.add( fogNear );

	container.add( fogNearRow );

	var fogFarRow = new UI.Panel();
	fogFarRow.setDisplay( 'none' );

	// fog far

	var fogFar = new UI.Number( 5000 ).setWidth( '60px' ).setRange( 0, Infinity ).onChange( updateFogParameters );

	fogFarRow.add( new UI.Text( 'Fog far' ).setWidth( '90px' ) );
	fogFarRow.add( fogFar );

	container.add( fogFarRow );

	// fog density

	var fogDensityRow = new UI.Panel();
	fogDensityRow.setDisplay( 'none' );

	var fogDensity = new UI.Number( 0.00025 ).setWidth( '60px' ).setRange( 0, 0.1 ).setPrecision( 5 ).onChange( updateFogParameters );

	fogDensityRow.add( new UI.Text( 'Fog density' ).setWidth( '90px' ) );
	fogDensityRow.add( fogDensity );

	container.add( fogDensityRow );

	//

	var refreshUI = function () {

		var camera = editor.camera;
		var scene = editor.scene;

		var options = [];

		// options.push( { value: camera.id, html: '<span class="type ' + camera.type + '"></span> ' + camera.name } );
		options.push( { static: true, value: scene.id, html: '<span class="type ' + scene.type + '"></span> ' + scene.name } );

		( function addObjects( objects, pad ) {

			for ( var i = 0, l = objects.length; i < l; i ++ ) {

				var object = objects[ i ];

				var html = pad + '<span class="type ' + object.type + '"></span> ' + object.name;

				if ( object instanceof THREE.Mesh ) {

					var geometry = object.geometry;
					var material = object.material;

					html += ' <span class="type ' + geometry.type + '"></span> ' + geometry.name;
					html += ' <span class="type ' + material.type + '"></span> ' + material.name;

				}

				options.push( { value: object.id, html: html } );

				addObjects( object.children, pad + '&nbsp;&nbsp;&nbsp;' );

			}

		} )( scene.children, '&nbsp;&nbsp;&nbsp;' );

		outliner.setOptions( options );

		if ( editor.selected !== null ) {

			outliner.setValue( editor.selected.id );

		}

		if ( scene.fog ) {

			fogColor.setHexValue( scene.fog.color.getHex() );

			if ( scene.fog instanceof THREE.Fog ) {

				fogType.setValue( "Fog" );
				fogNear.setValue( scene.fog.near );
				fogFar.setValue( scene.fog.far );

			} else if ( scene.fog instanceof THREE.FogExp2 ) {

				fogType.setValue( "FogExp2" );
				fogDensity.setValue( scene.fog.density );

			}

		} else {

			fogType.setValue( "None" );

		}

		refreshFogUI();

	};

	var refreshFogUI = function () {

		var type = fogType.getValue();

		fogColorRow.setDisplay( type === 'None' ? 'none' : '' );
		fogNearRow.setDisplay( type === 'Fog' ? '' : 'none' );
		fogFarRow.setDisplay( type === 'Fog' ? '' : 'none' );
		fogDensityRow.setDisplay( type === 'FogExp2' ? '' : 'none' );

	};

	refreshUI();

	// events

	signals.sceneGraphChanged.add( refreshUI );

	signals.objectSelected.add( function ( object ) {

		if ( ignoreObjectSelectedSignal === true ) return;

		outliner.setValue( object !== null ? object.id : null );

	} );

	return container;

}

// File:editor/js/Sidebar.Object3D.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Object3D = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/object3d/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/object3d/collapsed', boolean );

	} );
	container.setDisplay( 'none' );

	var objectType = new UI.Text().setTextTransform( 'uppercase' );
	container.addStatic( objectType );

	// Actions

	var objectActions = new UI.Select().setPosition('absolute').setRight( '8px' ).setFontSize( '11px' );
	objectActions.setOptions( {

		'Actions': 'Actions',
		'Reset Position': 'Reset Position',
		'Reset Rotation': 'Reset Rotation',
		'Reset Scale': 'Reset Scale'

	} );
	objectActions.onClick( function ( event ) {

		event.stopPropagation(); // Avoid panel collapsing

	} );
	objectActions.onChange( function ( event ) {

		var object = editor.selected;

		switch ( this.getValue() ) {

			case 'Reset Position':
				object.position.set( 0, 0, 0 );
				break;

			case 'Reset Rotation':
				object.rotation.set( 0, 0, 0 );
				break;

			case 'Reset Scale':
				object.scale.set( 1, 1, 1 );
				break;

		}

		this.setValue( 'Actions' );

		signals.objectChanged.dispatch( object );

	} );
	container.addStatic( objectActions );

	container.add( new UI.Break() );

	// uuid

	var objectUUIDRow = new UI.Panel();
	var objectUUID = new UI.Input().setWidth( '115px' ).setFontSize( '12px' ).setDisabled( true );
	var objectUUIDRenew = new UI.Button( '⟳' ).setMarginLeft( '7px' ).onClick( function () {

		objectUUID.setValue( THREE.Math.generateUUID() );

		editor.selected.uuid = objectUUID.getValue();

	} );

	objectUUIDRow.add( new UI.Text( 'UUID' ).setWidth( '90px' ) );
	objectUUIDRow.add( objectUUID );
	objectUUIDRow.add( objectUUIDRenew );

	container.add( objectUUIDRow );

	// name

	var objectNameRow = new UI.Panel();
	var objectName = new UI.Input().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

		editor.nameObject( editor.selected, objectName.getValue() );

	} );

	objectNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
	objectNameRow.add( objectName );

	container.add( objectNameRow );

	// parent

	var objectParentRow = new UI.Panel();
	var objectParent = new UI.Select().setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

	objectParentRow.add( new UI.Text( 'Parent' ).setWidth( '90px' ) );
	objectParentRow.add( objectParent );

	container.add( objectParentRow );

	// position

	var objectPositionRow = new UI.Panel();
	var objectPositionX = new UI.Number().setWidth( '50px' ).onChange( update );
	var objectPositionY = new UI.Number().setWidth( '50px' ).onChange( update );
	var objectPositionZ = new UI.Number().setWidth( '50px' ).onChange( update );

	objectPositionRow.add( new UI.Text( 'Position' ).setWidth( '90px' ) );
	objectPositionRow.add( objectPositionX, objectPositionY, objectPositionZ );

	container.add( objectPositionRow );

	// rotation

	var objectRotationRow = new UI.Panel();
	var objectRotationX = new UI.Number().setWidth( '50px' ).onChange( update );
	var objectRotationY = new UI.Number().setWidth( '50px' ).onChange( update );
	var objectRotationZ = new UI.Number().setWidth( '50px' ).onChange( update );

	objectRotationRow.add( new UI.Text( 'Rotation' ).setWidth( '90px' ) );
	objectRotationRow.add( objectRotationX, objectRotationY, objectRotationZ );

	container.add( objectRotationRow );

	// scale

	var objectScaleRow = new UI.Panel();
	var objectScaleLock = new UI.Checkbox( true ).setPosition( 'absolute' ).setLeft( '75px' );
	var objectScaleX = new UI.Number( 1 ).setRange( 0.01, Infinity ).setWidth( '50px' ).onChange( updateScaleX );
	var objectScaleY = new UI.Number( 1 ).setRange( 0.01, Infinity ).setWidth( '50px' ).onChange( updateScaleY );
	var objectScaleZ = new UI.Number( 1 ).setRange( 0.01, Infinity ).setWidth( '50px' ).onChange( updateScaleZ );

	objectScaleRow.add( new UI.Text( 'Scale' ).setWidth( '90px' ) );
	objectScaleRow.add( objectScaleLock );
	objectScaleRow.add( objectScaleX, objectScaleY, objectScaleZ );

	container.add( objectScaleRow );

	// fov

	var objectFovRow = new UI.Panel();
	var objectFov = new UI.Number().onChange( update );

	objectFovRow.add( new UI.Text( 'Fov' ).setWidth( '90px' ) );
	objectFovRow.add( objectFov );

	container.add( objectFovRow );

	// near

	var objectNearRow = new UI.Panel();
	var objectNear = new UI.Number().onChange( update );

	objectNearRow.add( new UI.Text( 'Near' ).setWidth( '90px' ) );
	objectNearRow.add( objectNear );

	container.add( objectNearRow );

	// far

	var objectFarRow = new UI.Panel();
	var objectFar = new UI.Number().onChange( update );

	objectFarRow.add( new UI.Text( 'Far' ).setWidth( '90px' ) );
	objectFarRow.add( objectFar );

	container.add( objectFarRow );

	// intensity

	var objectIntensityRow = new UI.Panel();
	var objectIntensity = new UI.Number().setRange( 0, Infinity ).onChange( update );

	objectIntensityRow.add( new UI.Text( 'Intensity' ).setWidth( '90px' ) );
	objectIntensityRow.add( objectIntensity );

	container.add( objectIntensityRow );

	// color

	var objectColorRow = new UI.Panel();
	var objectColor = new UI.Color().onChange( update );

	objectColorRow.add( new UI.Text( 'Color' ).setWidth( '90px' ) );
	objectColorRow.add( objectColor );

	container.add( objectColorRow );

	// ground color

	var objectGroundColorRow = new UI.Panel();
	var objectGroundColor = new UI.Color().onChange( update );

	objectGroundColorRow.add( new UI.Text( 'Ground color' ).setWidth( '90px' ) );
	objectGroundColorRow.add( objectGroundColor );

	container.add( objectGroundColorRow );

	// distance

	var objectDistanceRow = new UI.Panel();
	var objectDistance = new UI.Number().setRange( 0, Infinity ).onChange( update );

	objectDistanceRow.add( new UI.Text( 'Distance' ).setWidth( '90px' ) );
	objectDistanceRow.add( objectDistance );

	container.add( objectDistanceRow );

	// angle

	var objectAngleRow = new UI.Panel();
	var objectAngle = new UI.Number().setPrecision( 3 ).setRange( 0, Math.PI / 2 ).onChange( update );

	objectAngleRow.add( new UI.Text( 'Angle' ).setWidth( '90px' ) );
	objectAngleRow.add( objectAngle );

	container.add( objectAngleRow );

	// exponent

	var objectExponentRow = new UI.Panel();
	var objectExponent = new UI.Number().setRange( 0, Infinity ).onChange( update );

	objectExponentRow.add( new UI.Text( 'Exponent' ).setWidth( '90px' ) );
	objectExponentRow.add( objectExponent );

	container.add( objectExponentRow );

	// decay

	var objectDecayRow = new UI.Panel();
	var objectDecay = new UI.Number().setRange( 0, Infinity ).onChange( update );

	objectDecayRow.add( new UI.Text( 'Decay' ).setWidth( '90px' ) );
	objectDecayRow.add( objectDecay );

	container.add( objectDecayRow );

	// visible

	var objectVisibleRow = new UI.Panel();
	var objectVisible = new UI.Checkbox().onChange( update );

	objectVisibleRow.add( new UI.Text( 'Visible' ).setWidth( '90px' ) );
	objectVisibleRow.add( objectVisible );

	container.add( objectVisibleRow );

	// user data

	var timeout;

	var objectUserDataRow = new UI.Panel();
	var objectUserData = new UI.TextArea().setWidth( '150px' ).setHeight( '40px' ).setFontSize( '12px' ).onChange( update );
	objectUserData.onKeyUp( function () {

		try {

			JSON.parse( objectUserData.getValue() );

			objectUserData.dom.classList.add( 'success' );
			objectUserData.dom.classList.remove( 'fail' );

		} catch ( error ) {

			objectUserData.dom.classList.remove( 'success' );
			objectUserData.dom.classList.add( 'fail' );

		}

	} );

	objectUserDataRow.add( new UI.Text( 'User data' ).setWidth( '90px' ) );
	objectUserDataRow.add( objectUserData );

	container.add( objectUserDataRow );


	//

	function updateScaleX() {

		var object = editor.selected;

		if ( objectScaleLock.getValue() === true ) {

			var scale = objectScaleX.getValue() / object.scale.x;

			objectScaleY.setValue( objectScaleY.getValue() * scale );
			objectScaleZ.setValue( objectScaleZ.getValue() * scale );

		}

		update();

	}

	function updateScaleY() {

		var object = editor.selected;

		if ( objectScaleLock.getValue() === true ) {

			var scale = objectScaleY.getValue() / object.scale.y;

			objectScaleX.setValue( objectScaleX.getValue() * scale );
			objectScaleZ.setValue( objectScaleZ.getValue() * scale );

		}

		update();

	}

	function updateScaleZ() {

		var object = editor.selected;

		if ( objectScaleLock.getValue() === true ) {

			var scale = objectScaleZ.getValue() / object.scale.z;

			objectScaleX.setValue( objectScaleX.getValue() * scale );
			objectScaleY.setValue( objectScaleY.getValue() * scale );

		}

		update();

	}

	function update() {

		var object = editor.selected;

		if ( object !== null ) {

			if ( object.parent !== null ) {

				var newParentId = parseInt( objectParent.getValue() );

				if ( object.parent.id !== newParentId && object.id !== newParentId ) {

					editor.moveObject( object, editor.scene.getObjectById( newParentId ) );

				}

			}

			object.position.x = objectPositionX.getValue();
			object.position.y = objectPositionY.getValue();
			object.position.z = objectPositionZ.getValue();

			object.rotation.x = objectRotationX.getValue();
			object.rotation.y = objectRotationY.getValue();
			object.rotation.z = objectRotationZ.getValue();

			object.scale.x = objectScaleX.getValue();
			object.scale.y = objectScaleY.getValue();
			object.scale.z = objectScaleZ.getValue();

			if ( object.fov !== undefined ) {

				object.fov = objectFov.getValue();
				object.updateProjectionMatrix();

			}

			if ( object.near !== undefined ) {

				object.near = objectNear.getValue();

			}

			if ( object.far !== undefined ) {

				object.far = objectFar.getValue();

			}

			if ( object.intensity !== undefined ) {

				object.intensity = objectIntensity.getValue();

			}

			if ( object.color !== undefined ) {

				object.color.setHex( objectColor.getHexValue() );

			}

			if ( object.groundColor !== undefined ) {

				object.groundColor.setHex( objectGroundColor.getHexValue() );

			}

			if ( object.distance !== undefined ) {

				object.distance = objectDistance.getValue();

			}

			if ( object.angle !== undefined ) {

				object.angle = objectAngle.getValue();

			}

			if ( object.exponent !== undefined ) {

				object.exponent = objectExponent.getValue();

			}

			if ( object.decay !== undefined ) {

				object.decay = objectDecay.getValue();

			}

			object.visible = objectVisible.getValue();

			try {

				object.userData = JSON.parse( objectUserData.getValue() );

			} catch ( exception ) {

				console.warn( exception );

			}

			signals.objectChanged.dispatch( object );

		}

	}

	function updateRows( object ) {

		var properties = {
			'parent': objectParentRow,
			'fov': objectFovRow,
			'near': objectNearRow,
			'far': objectFarRow,
			'intensity': objectIntensityRow,
			'color': objectColorRow,
			'groundColor': objectGroundColorRow,
			'distance' : objectDistanceRow,
			'angle' : objectAngleRow,
			'exponent' : objectExponentRow,
			'decay' : objectDecayRow
		};

		for ( var property in properties ) {

			properties[ property ].setDisplay( object[ property ] !== undefined ? '' : 'none' );

		}

	}

	function updateTransformRows( object ) {

		if ( object instanceof THREE.Light ||
		   ( object instanceof THREE.Object3D && object.userData.targetInverse ) ) {

			objectRotationRow.setDisplay( 'none' );
			objectScaleRow.setDisplay( 'none' );

		} else {

			objectRotationRow.setDisplay( '' );
			objectScaleRow.setDisplay( '' );

		}

	}

	// events

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			container.setDisplay( 'block' );

			updateRows( object );
			updateUI( object );

		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.sceneGraphChanged.add( function () {

		var scene = editor.scene;
		var options = {};

		scene.traverse( function ( object ) {

			options[ object.id ] = object.name;

		} );

		objectParent.setOptions( options );

	} );

	signals.objectChanged.add( function ( object ) {

		if ( object !== editor.selected ) return;

		updateUI( object );

	} );

	function updateUI( object ) {

		objectType.setValue( object.type );

		objectUUID.setValue( object.uuid );
		objectName.setValue( object.name );

		if ( object.parent !== null ) {

			objectParent.setValue( object.parent.id );

		}

		objectPositionX.setValue( object.position.x );
		objectPositionY.setValue( object.position.y );
		objectPositionZ.setValue( object.position.z );

		objectRotationX.setValue( object.rotation.x );
		objectRotationY.setValue( object.rotation.y );
		objectRotationZ.setValue( object.rotation.z );

		objectScaleX.setValue( object.scale.x );
		objectScaleY.setValue( object.scale.y );
		objectScaleZ.setValue( object.scale.z );

		if ( object.fov !== undefined ) {

			objectFov.setValue( object.fov );

		}

		if ( object.near !== undefined ) {

			objectNear.setValue( object.near );

		}

		if ( object.far !== undefined ) {

			objectFar.setValue( object.far );

		}

		if ( object.intensity !== undefined ) {

			objectIntensity.setValue( object.intensity );

		}

		if ( object.color !== undefined ) {

			objectColor.setHexValue( object.color.getHexString() );

		}

		if ( object.groundColor !== undefined ) {

			objectGroundColor.setHexValue( object.groundColor.getHexString() );

		}

		if ( object.distance !== undefined ) {

			objectDistance.setValue( object.distance );

		}

		if ( object.angle !== undefined ) {

			objectAngle.setValue( object.angle );

		}

		if ( object.exponent !== undefined ) {

			objectExponent.setValue( object.exponent );

		}

		if ( object.decay !== undefined ) {

			objectDecay.setValue( object.decay );

		}

		objectVisible.setValue( object.visible );

		try {

			objectUserData.setValue( JSON.stringify( object.userData, null, '  ' ) );

		} catch ( error ) {

			console.log( error );

		}

		objectUserData.setBorderColor( 'transparent' );
		objectUserData.setBackgroundColor( '' );

		updateTransformRows( object );

	}

	return container;

}

// File:editor/js/Sidebar.Animation.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Animation = function ( editor ) {

	var signals = editor.signals;

	var options = {};
	var possibleAnimations = {};

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/animation/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/animation/collapsed', boolean );

	} );
	container.setDisplay( 'none' );

	container.addStatic( new UI.Text( 'Animation' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break() );

	var animationsRow = new UI.Panel();
	container.add( animationsRow );

	var animations = {};

	signals.objectAdded.add( function ( object ) {

		object.traverse( function ( child ) {

			if ( child instanceof THREE.SkinnedMesh ) {

				var material = child.material;

				if ( material instanceof THREE.MeshFaceMaterial ) {

					for ( var i = 0; i < material.materials.length; i ++ ) {

						material.materials[ i ].skinning = true;

					}

				} else {

					child.material.skinning = true;

				}

				animations[ child.id ] = new THREE.Animation( child, child.geometry.animation );

			} else if ( child instanceof THREE.MorphAnimMesh ) {

				var animation = new THREE.MorphAnimation( child );
				animation.duration = 30;

				// temporal hack for THREE.AnimationHandler
				animation._play = animation.play;
				animation.play = function () {
					this._play();
					THREE.AnimationHandler.play( this );
				};
				animation.resetBlendWeights = function () {};
				animation.stop = function () {
					this.pause();
					THREE.AnimationHandler.stop( this );
				};

				animations[ child.id ] = animation;

			}

		} );

	} );

	signals.objectSelected.add( function ( object ) {

		container.setDisplay( 'none' );

		if ( object instanceof THREE.SkinnedMesh || object instanceof THREE.MorphAnimMesh ) {

			animationsRow.clear();

			var animation = animations[ object.id ];

			var playButton = new UI.Button( 'Play' ).onClick( function () {

				animation.play();

			} );
			animationsRow.add( playButton );

			var pauseButton = new UI.Button( 'Stop' ).onClick( function () {

				animation.stop();

			} );
			animationsRow.add( pauseButton );

			container.setDisplay( 'block' );

		}

	} );

	return container;

}

// File:editor/js/Sidebar.Geometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/geometry/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/geometry/collapsed', boolean );

	} );
	container.setDisplay( 'none' );

	var geometryType = new UI.Text().setTextTransform( 'uppercase' );
	container.addStatic( geometryType );

	// Actions

	var objectActions = new UI.Select().setPosition('absolute').setRight( '8px' ).setFontSize( '11px' );
	objectActions.setOptions( {

		'Actions': 'Actions',
		'Center': 'Center',
		'Convert': 'Convert',
		'Flatten': 'Flatten'

	} );
	objectActions.onClick( function ( event ) {

		event.stopPropagation(); // Avoid panel collapsing

	} );
	objectActions.onChange( function ( event ) {

		var action = this.getValue();

		var object = editor.selected;
		var geometry = object.geometry;

		if ( confirm( action + ' ' + object.name + '?' ) === false ) return;

		switch ( action ) {

			case 'Center':

				var offset = geometry.center();

				object.position.sub( offset );

				editor.signals.geometryChanged.dispatch( geometry );
				editor.signals.objectChanged.dispatch( object );

				break;

			case 'Convert':

				if ( geometry instanceof THREE.Geometry ) {

					object.geometry = new THREE.BufferGeometry().fromGeometry( geometry );

					signals.geometryChanged.dispatch( object );

				}

				break;

			case 'Flatten':

				geometry.applyMatrix( object.matrix );

				object.position.set( 0, 0, 0 );
				object.rotation.set( 0, 0, 0 );
				object.scale.set( 1, 1, 1 );

				editor.signals.geometryChanged.dispatch( geometry );
				editor.signals.objectChanged.dispatch( object );

				break;

		}

		this.setValue( 'Actions' );

		signals.objectChanged.dispatch( object );

	} );
	container.addStatic( objectActions );

	container.add( new UI.Break() );

	// uuid

	var geometryUUIDRow = new UI.Panel();
	var geometryUUID = new UI.Input().setWidth( '115px' ).setFontSize( '12px' ).setDisabled( true );
	var geometryUUIDRenew = new UI.Button( '⟳' ).setMarginLeft( '7px' ).onClick( function () {

		geometryUUID.setValue( THREE.Math.generateUUID() );

		editor.selected.geometry.uuid = geometryUUID.getValue();

	} );

	geometryUUIDRow.add( new UI.Text( 'UUID' ).setWidth( '90px' ) );
	geometryUUIDRow.add( geometryUUID );
	geometryUUIDRow.add( geometryUUIDRenew );

	container.add( geometryUUIDRow );

	// name

	var geometryNameRow = new UI.Panel();
	var geometryName = new UI.Input().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

		editor.setGeometryName( editor.selected.geometry, geometryName.getValue() );

	} );

	geometryNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
	geometryNameRow.add( geometryName );

	container.add( geometryNameRow );

	// geometry

	container.add( new Sidebar.Geometry.Geometry( signals ) );

	// buffergeometry

	container.add( new Sidebar.Geometry.BufferGeometry( signals ) );

	// parameters

	var parameters = new UI.Panel();
	container.add( parameters );


	//

	function build() {

		var object = editor.selected;

		if ( object && object.geometry ) {

			var geometry = object.geometry;

			container.setDisplay( 'block' );

			geometryType.setValue( geometry.type );

			geometryUUID.setValue( geometry.uuid );
			geometryName.setValue( geometry.name );

			//

			parameters.clear();

			if ( geometry.type === 'BufferGeometry' || geometry.type === 'Geometry' ) {

				parameters.add( new Sidebar.Geometry.Modifiers( signals, object ) );

			} else if ( Sidebar.Geometry[ geometry.type ] !== undefined ) {

				parameters.add( new Sidebar.Geometry[ geometry.type ]( signals, object ) );

			}

		} else {

			container.setDisplay( 'none' );

		}

	}

	signals.objectSelected.add( build );
	signals.geometryChanged.add( build );

	return container;

}

// File:editor/js/Sidebar.Geometry.Geometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.Geometry = function ( signals ) {

	var container = new UI.Panel();

	// vertices

	var verticesRow = new UI.Panel();
	var vertices = new UI.Text().setFontSize( '12px' );

	verticesRow.add( new UI.Text( 'Vertices' ).setWidth( '90px' ) );
	verticesRow.add( vertices );

	container.add( verticesRow );

	// faces

	var facesRow = new UI.Panel();
	var faces = new UI.Text().setFontSize( '12px' );

	facesRow.add( new UI.Text( 'Faces' ).setWidth( '90px' ) );
	facesRow.add( faces );

	container.add( facesRow );

	//

	var update = function ( object ) {

		if ( object === null ) return;

		var geometry = object.geometry;

		if ( geometry instanceof THREE.Geometry ) { 

			container.setDisplay( 'block' );

			vertices.setValue( ( geometry.vertices.length ).format() );
			faces.setValue( ( geometry.faces.length ).format() );

		} else {

			container.setDisplay( 'none' );

		}

	};

	signals.objectSelected.add( update );
	signals.geometryChanged.add( update );

	return container;

}

// File:editor/js/Sidebar.Geometry.BufferGeometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.BufferGeometry = function ( signals ) {

	var container = new UI.Panel();

	function update( object ) {

		if ( object === null ) return;

		var geometry = object.geometry;

		if ( geometry instanceof THREE.BufferGeometry ) {

			container.clear();
			container.setDisplay( 'block' );

			var index = geometry.index;

			if ( index !== null ) {

				var panel = new UI.Panel();
				panel.add( new UI.Text( 'index' ).setWidth( '90px' ) );
				panel.add( new UI.Text( ( index.count ).format() ).setFontSize( '12px' ) );
				container.add( panel );

			}

			var attributes = geometry.attributes;

			for ( var name in attributes ) {

				var panel = new UI.Panel();
				panel.add( new UI.Text( name ).setWidth( '90px' ) );
				panel.add( new UI.Text( ( attributes[ name ].count ).format() ).setFontSize( '12px' ) );
				container.add( panel );

			}

		} else {

			container.setDisplay( 'none' );

		}

	};

	signals.objectSelected.add( update );
	signals.geometryChanged.add( update );

	return container;

}

// File:editor/js/Sidebar.Geometry.Modifiers.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.Modifiers = function ( signals, object ) {

	var container = new UI.Panel().setPaddingLeft( '90px' );

	var geometry = object.geometry;

	// Compute Vertex Normals

	var button = new UI.Button( 'Compute Vertex Normals' );
	button.onClick( function () {

		geometry.computeVertexNormals();

		if ( geometry instanceof THREE.BufferGeometry ) {

			geometry.attributes.normal.needsUpdate = true;

		} else {

			geometry.normalsNeedUpdate = true;

		}

		signals.geometryChanged.dispatch( object );

	} );

	container.add( button );

	//

	return container;

}

// File:editor/js/Sidebar.Geometry.BoxGeometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.BoxGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// width

	var widthRow = new UI.Panel();
	var width = new UI.Number( parameters.width ).onChange( update );

	widthRow.add( new UI.Text( 'Width' ).setWidth( '90px' ) );
	widthRow.add( width );

	container.add( widthRow );

	// height

	var heightRow = new UI.Panel();
	var height = new UI.Number( parameters.height ).onChange( update );

	heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ) );
	heightRow.add( height );

	container.add( heightRow );

	// depth

	var depthRow = new UI.Panel();
	var depth = new UI.Number( parameters.depth ).onChange( update );

	depthRow.add( new UI.Text( 'Depth' ).setWidth( '90px' ) );
	depthRow.add( depth );

	container.add( depthRow );

	// widthSegments

	var widthSegmentsRow = new UI.Panel();
	var widthSegments = new UI.Integer( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

	widthSegmentsRow.add( new UI.Text( 'Width segments' ).setWidth( '90px' ) );
	widthSegmentsRow.add( widthSegments );

	container.add( widthSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Panel();
	var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// depthSegments

	var depthSegmentsRow = new UI.Panel();
	var depthSegments = new UI.Integer( parameters.depthSegments ).setRange( 1, Infinity ).onChange( update );

	depthSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
	depthSegmentsRow.add( depthSegments );

	container.add( depthSegmentsRow );

	//

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.BoxGeometry(
			width.getValue(),
			height.getValue(),
			depth.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue(),
			depthSegments.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}

// File:editor/js/Sidebar.Geometry.CircleGeometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.CircleGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// segments

	var segmentsRow = new UI.Panel();
	var segments = new UI.Integer( parameters.segments ).setRange( 3, Infinity ).onChange( update );

	segmentsRow.add( new UI.Text( 'Segments' ).setWidth( '90px' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	//

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.CircleGeometry(
			radius.getValue(),
			segments.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}

// File:editor/js/Sidebar.Geometry.CylinderGeometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.CylinderGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// radiusTop

	var radiusTopRow = new UI.Panel();
	var radiusTop = new UI.Number( parameters.radiusTop ).onChange( update );

	radiusTopRow.add( new UI.Text( 'Radius top' ).setWidth( '90px' ) );
	radiusTopRow.add( radiusTop );

	container.add( radiusTopRow );

	// radiusBottom

	var radiusBottomRow = new UI.Panel();
	var radiusBottom = new UI.Number( parameters.radiusBottom ).onChange( update );

	radiusBottomRow.add( new UI.Text( 'Radius bottom' ).setWidth( '90px' ) );
	radiusBottomRow.add( radiusBottom );

	container.add( radiusBottomRow );

	// height

	var heightRow = new UI.Panel();
	var height = new UI.Number( parameters.height ).onChange( update );

	heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ) );
	heightRow.add( height );

	container.add( heightRow );

	// radialSegments

	var radialSegmentsRow = new UI.Panel();
	var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UI.Text( 'Radial segments' ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Panel();
	var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// openEnded

	var openEndedRow = new UI.Panel();
	var openEnded = new UI.Checkbox( parameters.openEnded ).onChange( update );

	openEndedRow.add( new UI.Text( 'Open ended' ).setWidth( '90px' ) );
	openEndedRow.add( openEnded );

	container.add( openEndedRow );

	//

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.CylinderGeometry(
			radiusTop.getValue(),
			radiusBottom.getValue(),
			height.getValue(),
			radialSegments.getValue(),
			heightSegments.getValue(),
			openEnded.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}

// File:editor/js/Sidebar.Geometry.IcosahedronGeometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.IcosahedronGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// detail

	var detailRow = new UI.Panel();
	var detail = new UI.Integer( parameters.detail ).setRange( 0, Infinity ).onChange( update );

	detailRow.add( new UI.Text( 'Detail' ).setWidth( '90px' ) );
	detailRow.add( detail );

	container.add( detailRow );


	//

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.IcosahedronGeometry(
			radius.getValue(),
			detail.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.objectChanged.dispatch( object );

	}

	return container;

}

// File:editor/js/Sidebar.Geometry.PlaneGeometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.PlaneGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// width

	var widthRow = new UI.Panel();
	var width = new UI.Number( parameters.width ).onChange( update );

	widthRow.add( new UI.Text( 'Width' ).setWidth( '90px' ) );
	widthRow.add( width );

	container.add( widthRow );

	// height

	var heightRow = new UI.Panel();
	var height = new UI.Number( parameters.height ).onChange( update );

	heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ) );
	heightRow.add( height );

	container.add( heightRow );

	// widthSegments

	var widthSegmentsRow = new UI.Panel();
	var widthSegments = new UI.Integer( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

	widthSegmentsRow.add( new UI.Text( 'Width segments' ).setWidth( '90px' ) );
	widthSegmentsRow.add( widthSegments );

	container.add( widthSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Panel();
	var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );


	//

	function update() {
		
		object.geometry.dispose();

		object.geometry = new THREE.PlaneGeometry(
			width.getValue(),
			height.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}

// File:editor/js/Sidebar.Geometry.SphereGeometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.SphereGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// widthSegments

	var widthSegmentsRow = new UI.Panel();
	var widthSegments = new UI.Integer( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

	widthSegmentsRow.add( new UI.Text( 'Width segments' ).setWidth( '90px' ) );
	widthSegmentsRow.add( widthSegments );

	container.add( widthSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Panel();
	var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// phiStart

	var phiStartRow = new UI.Panel();
	var phiStart = new UI.Number( parameters.phiStart ).onChange( update );

	phiStartRow.add( new UI.Text( 'Phi start' ).setWidth( '90px' ) );
	phiStartRow.add( phiStart );

	container.add( phiStartRow );

	// phiLength

	var phiLengthRow = new UI.Panel();
	var phiLength = new UI.Number( parameters.phiLength ).onChange( update );

	phiLengthRow.add( new UI.Text( 'Phi length' ).setWidth( '90px' ) );
	phiLengthRow.add( phiLength );

	container.add( phiLengthRow );

	// thetaStart

	var thetaStartRow = new UI.Panel();
	var thetaStart = new UI.Number( parameters.thetaStart ).onChange( update );

	thetaStartRow.add( new UI.Text( 'Theta start' ).setWidth( '90px' ) );
	thetaStartRow.add( thetaStart );

	container.add( thetaStartRow );

	// thetaLength

	var thetaLengthRow = new UI.Panel();
	var thetaLength = new UI.Number( parameters.thetaLength ).onChange( update );

	thetaLengthRow.add( new UI.Text( 'Theta length' ).setWidth( '90px' ) );
	thetaLengthRow.add( thetaLength );

	container.add( thetaLengthRow );


	//

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.SphereGeometry(
			radius.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue(),
			phiStart.getValue(),
			phiLength.getValue(),
			thetaStart.getValue(),
			thetaLength.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}

// File:editor/js/Sidebar.Geometry.TorusGeometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.TorusGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tube

	var tubeRow = new UI.Panel();
	var tube = new UI.Number( parameters.tube ).onChange( update );

	tubeRow.add( new UI.Text( 'Tube' ).setWidth( '90px' ) );
	tubeRow.add( tube );

	container.add( tubeRow );

	// radialSegments

	var radialSegmentsRow = new UI.Panel();
	var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UI.Text( 'Radial segments' ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// tubularSegments

	var tubularSegmentsRow = new UI.Panel();
	var tubularSegments = new UI.Integer( parameters.tubularSegments ).setRange( 1, Infinity ).onChange( update );

	tubularSegmentsRow.add( new UI.Text( 'Tubular segments' ).setWidth( '90px' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// arc

	var arcRow = new UI.Panel();
	var arc = new UI.Number( parameters.arc ).onChange( update );

	arcRow.add( new UI.Text( 'Arc' ).setWidth( '90px' ) );
	arcRow.add( arc );

	container.add( arcRow );


	//

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.TorusGeometry(
			radius.getValue(),
			tube.getValue(),
			radialSegments.getValue(),
			tubularSegments.getValue(),
			arc.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}

// File:editor/js/Sidebar.Geometry.TorusKnotGeometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.TorusKnotGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tube

	var tubeRow = new UI.Panel();
	var tube = new UI.Number( parameters.tube ).onChange( update );

	tubeRow.add( new UI.Text( 'Tube' ).setWidth( '90px' ) );
	tubeRow.add( tube );

	container.add( tubeRow );

	// radialSegments

	var radialSegmentsRow = new UI.Panel();
	var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UI.Text( 'Radial segments' ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// tubularSegments

	var tubularSegmentsRow = new UI.Panel();
	var tubularSegments = new UI.Integer( parameters.tubularSegments ).setRange( 1, Infinity ).onChange( update );

	tubularSegmentsRow.add( new UI.Text( 'Tubular segments' ).setWidth( '90px' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// p

	var pRow = new UI.Panel();
	var p = new UI.Number( parameters.p ).onChange( update );

	pRow.add( new UI.Text( 'P' ).setWidth( '90px' ) );
	pRow.add( p );

	container.add( pRow );

	// q

	var qRow = new UI.Panel();
	var q = new UI.Number( parameters.q ).onChange( update );

	pRow.add( new UI.Text( 'Q' ).setWidth( '90px' ) );
	pRow.add( q );

	container.add( qRow );

	// heightScale

	var heightScaleRow = new UI.Panel();
	var heightScale = new UI.Number( parameters.heightScale ).onChange( update );

	pRow.add( new UI.Text( 'Height scale' ).setWidth( '90px' ) );
	pRow.add( heightScale );

	container.add( heightScaleRow );


	//

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.TorusKnotGeometry(
			radius.getValue(),
			tube.getValue(),
			radialSegments.getValue(),
			tubularSegments.getValue(),
			p.getValue(),
			q.getValue(),
			heightScale.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}

// File:examples/js/geometries/TeapotBufferGeometry.js

/**
 * @author Eric Haines / http://erichaines.com/
 *
 * Tessellates the famous Utah teapot database by Martin Newell into triangles.
 *
 * THREE.TeapotBufferGeometry = function ( size, segments, bottom, lid, body, fitLid, blinn )
 *
 * defaults: size = 50, segments = 10, bottom = true, lid = true, body = true,
 *   fitLid = false, blinn = true
 *
 * size is a relative scale: I've scaled the teapot to fit vertically between -1 and 1.
 * Think of it as a "radius".
 * segments - number of line segments to subdivide each patch edge;
 *   1 is possible but gives degenerates, so two is the real minimum.
 * bottom - boolean, if true (default) then the bottom patches are added. Some consider
 *   adding the bottom heresy, so set this to "false" to adhere to the One True Way.
 * lid - to remove the lid and look inside, set to true.
 * body - to remove the body and leave the lid, set this and "bottom" to false.
 * fitLid - the lid is a tad small in the original. This stretches it a bit so you can't
 *   see the teapot's insides through the gap.
 * blinn - Jim Blinn scaled the original data vertically by dividing by about 1.3 to look
 *   nicer. If you want to see the original teapot, similar to the real-world model, set
 *   this to false. True by default.
 *   See http://en.wikipedia.org/wiki/File:Original_Utah_Teapot.jpg for the original
 *   real-world teapot (from http://en.wikipedia.org/wiki/Utah_teapot).
 *
 * Note that the bottom (the last four patches) is not flat - blame Frank Crow, not me.
 *
 * The teapot should normally be rendered as a double sided object, since for some
 * patches both sides can be seen, e.g., the gap around the lid and inside the spout.
 *
 * Segments 'n' determines the number of triangles output.
 *   Total triangles = 32*2*n*n - 8*n    [degenerates at the top and bottom cusps are deleted]
 *
 *   size_factor   # triangles
 *       1          56
 *       2         240
 *       3         552
 *       4         992
 *
 *      10        6320
 *      20       25440
 *      30       57360
 *
 * Code converted from my ancient SPD software, http://tog.acm.org/resources/SPD/
 * Created for the Udacity course "Interactive Rendering", http://bit.ly/ericity
 * Lesson: https://www.udacity.com/course/viewer#!/c-cs291/l-68866048/m-106482448
 * YouTube video on teapot history: https://www.youtube.com/watch?v=DxMfblPzFNc
 *
 * See https://en.wikipedia.org/wiki/Utah_teapot for the history of the teapot
 *
 */
/*global THREE */

THREE.TeapotBufferGeometry = function ( size, segments, bottom, lid, body, fitLid, blinn ) {

	"use strict";

	// 32 * 4 * 4 Bezier spline patches
	var teapotPatches = [
/*rim*/
0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
3,16,17,18,7,19,20,21,11,22,23,24,15,25,26,27,
18,28,29,30,21,31,32,33,24,34,35,36,27,37,38,39,
30,40,41,0,33,42,43,4,36,44,45,8,39,46,47,12,
/*body*/
12,13,14,15,48,49,50,51,52,53,54,55,56,57,58,59,
15,25,26,27,51,60,61,62,55,63,64,65,59,66,67,68,
27,37,38,39,62,69,70,71,65,72,73,74,68,75,76,77,
39,46,47,12,71,78,79,48,74,80,81,52,77,82,83,56,
56,57,58,59,84,85,86,87,88,89,90,91,92,93,94,95,
59,66,67,68,87,96,97,98,91,99,100,101,95,102,103,104,
68,75,76,77,98,105,106,107,101,108,109,110,104,111,112,113,
77,82,83,56,107,114,115,84,110,116,117,88,113,118,119,92,
/*handle*/
120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,
123,136,137,120,127,138,139,124,131,140,141,128,135,142,143,132,
132,133,134,135,144,145,146,147,148,149,150,151,68,152,153,154,
135,142,143,132,147,155,156,144,151,157,158,148,154,159,160,68,
/*spout*/
161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,
164,177,178,161,168,179,180,165,172,181,182,169,176,183,184,173,
173,174,175,176,185,186,187,188,189,190,191,192,193,194,195,196,
176,183,184,173,188,197,198,185,192,199,200,189,196,201,202,193,
/*lid*/
203,203,203,203,204,205,206,207,208,208,208,208,209,210,211,212,
203,203,203,203,207,213,214,215,208,208,208,208,212,216,217,218,
203,203,203,203,215,219,220,221,208,208,208,208,218,222,223,224,
203,203,203,203,221,225,226,204,208,208,208,208,224,227,228,209,
209,210,211,212,229,230,231,232,233,234,235,236,237,238,239,240,
212,216,217,218,232,241,242,243,236,244,245,246,240,247,248,249,
218,222,223,224,243,250,251,252,246,253,254,255,249,256,257,258,
224,227,228,209,252,259,260,229,255,261,262,233,258,263,264,237,
/*bottom*/
265,265,265,265,266,267,268,269,270,271,272,273,92,119,118,113,
265,265,265,265,269,274,275,276,273,277,278,279,113,112,111,104,
265,265,265,265,276,280,281,282,279,283,284,285,104,103,102,95,
265,265,265,265,282,286,287,266,285,288,289,270,95,94,93,92
	] ;

	var teapotVertices = [
1.4,0,2.4,
1.4,-0.784,2.4,
0.784,-1.4,2.4,
0,-1.4,2.4,
1.3375,0,2.53125,
1.3375,-0.749,2.53125,
0.749,-1.3375,2.53125,
0,-1.3375,2.53125,
1.4375,0,2.53125,
1.4375,-0.805,2.53125,
0.805,-1.4375,2.53125,
0,-1.4375,2.53125,
1.5,0,2.4,
1.5,-0.84,2.4,
0.84,-1.5,2.4,
0,-1.5,2.4,
-0.784,-1.4,2.4,
-1.4,-0.784,2.4,
-1.4,0,2.4,
-0.749,-1.3375,2.53125,
-1.3375,-0.749,2.53125,
-1.3375,0,2.53125,
-0.805,-1.4375,2.53125,
-1.4375,-0.805,2.53125,
-1.4375,0,2.53125,
-0.84,-1.5,2.4,
-1.5,-0.84,2.4,
-1.5,0,2.4,
-1.4,0.784,2.4,
-0.784,1.4,2.4,
0,1.4,2.4,
-1.3375,0.749,2.53125,
-0.749,1.3375,2.53125,
0,1.3375,2.53125,
-1.4375,0.805,2.53125,
-0.805,1.4375,2.53125,
0,1.4375,2.53125,
-1.5,0.84,2.4,
-0.84,1.5,2.4,
0,1.5,2.4,
0.784,1.4,2.4,
1.4,0.784,2.4,
0.749,1.3375,2.53125,
1.3375,0.749,2.53125,
0.805,1.4375,2.53125,
1.4375,0.805,2.53125,
0.84,1.5,2.4,
1.5,0.84,2.4,
1.75,0,1.875,
1.75,-0.98,1.875,
0.98,-1.75,1.875,
0,-1.75,1.875,
2,0,1.35,
2,-1.12,1.35,
1.12,-2,1.35,
0,-2,1.35,
2,0,0.9,
2,-1.12,0.9,
1.12,-2,0.9,
0,-2,0.9,
-0.98,-1.75,1.875,
-1.75,-0.98,1.875,
-1.75,0,1.875,
-1.12,-2,1.35,
-2,-1.12,1.35,
-2,0,1.35,
-1.12,-2,0.9,
-2,-1.12,0.9,
-2,0,0.9,
-1.75,0.98,1.875,
-0.98,1.75,1.875,
0,1.75,1.875,
-2,1.12,1.35,
-1.12,2,1.35,
0,2,1.35,
-2,1.12,0.9,
-1.12,2,0.9,
0,2,0.9,
0.98,1.75,1.875,
1.75,0.98,1.875,
1.12,2,1.35,
2,1.12,1.35,
1.12,2,0.9,
2,1.12,0.9,
2,0,0.45,
2,-1.12,0.45,
1.12,-2,0.45,
0,-2,0.45,
1.5,0,0.225,
1.5,-0.84,0.225,
0.84,-1.5,0.225,
0,-1.5,0.225,
1.5,0,0.15,
1.5,-0.84,0.15,
0.84,-1.5,0.15,
0,-1.5,0.15,
-1.12,-2,0.45,
-2,-1.12,0.45,
-2,0,0.45,
-0.84,-1.5,0.225,
-1.5,-0.84,0.225,
-1.5,0,0.225,
-0.84,-1.5,0.15,
-1.5,-0.84,0.15,
-1.5,0,0.15,
-2,1.12,0.45,
-1.12,2,0.45,
0,2,0.45,
-1.5,0.84,0.225,
-0.84,1.5,0.225,
0,1.5,0.225,
-1.5,0.84,0.15,
-0.84,1.5,0.15,
0,1.5,0.15,
1.12,2,0.45,
2,1.12,0.45,
0.84,1.5,0.225,
1.5,0.84,0.225,
0.84,1.5,0.15,
1.5,0.84,0.15,
-1.6,0,2.025,
-1.6,-0.3,2.025,
-1.5,-0.3,2.25,
-1.5,0,2.25,
-2.3,0,2.025,
-2.3,-0.3,2.025,
-2.5,-0.3,2.25,
-2.5,0,2.25,
-2.7,0,2.025,
-2.7,-0.3,2.025,
-3,-0.3,2.25,
-3,0,2.25,
-2.7,0,1.8,
-2.7,-0.3,1.8,
-3,-0.3,1.8,
-3,0,1.8,
-1.5,0.3,2.25,
-1.6,0.3,2.025,
-2.5,0.3,2.25,
-2.3,0.3,2.025,
-3,0.3,2.25,
-2.7,0.3,2.025,
-3,0.3,1.8,
-2.7,0.3,1.8,
-2.7,0,1.575,
-2.7,-0.3,1.575,
-3,-0.3,1.35,
-3,0,1.35,
-2.5,0,1.125,
-2.5,-0.3,1.125,
-2.65,-0.3,0.9375,
-2.65,0,0.9375,
-2,-0.3,0.9,
-1.9,-0.3,0.6,
-1.9,0,0.6,
-3,0.3,1.35,
-2.7,0.3,1.575,
-2.65,0.3,0.9375,
-2.5,0.3,1.125,
-1.9,0.3,0.6,
-2,0.3,0.9,
1.7,0,1.425,
1.7,-0.66,1.425,
1.7,-0.66,0.6,
1.7,0,0.6,
2.6,0,1.425,
2.6,-0.66,1.425,
3.1,-0.66,0.825,
3.1,0,0.825,
2.3,0,2.1,
2.3,-0.25,2.1,
2.4,-0.25,2.025,
2.4,0,2.025,
2.7,0,2.4,
2.7,-0.25,2.4,
3.3,-0.25,2.4,
3.3,0,2.4,
1.7,0.66,0.6,
1.7,0.66,1.425,
3.1,0.66,0.825,
2.6,0.66,1.425,
2.4,0.25,2.025,
2.3,0.25,2.1,
3.3,0.25,2.4,
2.7,0.25,2.4,
2.8,0,2.475,
2.8,-0.25,2.475,
3.525,-0.25,2.49375,
3.525,0,2.49375,
2.9,0,2.475,
2.9,-0.15,2.475,
3.45,-0.15,2.5125,
3.45,0,2.5125,
2.8,0,2.4,
2.8,-0.15,2.4,
3.2,-0.15,2.4,
3.2,0,2.4,
3.525,0.25,2.49375,
2.8,0.25,2.475,
3.45,0.15,2.5125,
2.9,0.15,2.475,
3.2,0.15,2.4,
2.8,0.15,2.4,
0,0,3.15,
0.8,0,3.15,
0.8,-0.45,3.15,
0.45,-0.8,3.15,
0,-0.8,3.15,
0,0,2.85,
0.2,0,2.7,
0.2,-0.112,2.7,
0.112,-0.2,2.7,
0,-0.2,2.7,
-0.45,-0.8,3.15,
-0.8,-0.45,3.15,
-0.8,0,3.15,
-0.112,-0.2,2.7,
-0.2,-0.112,2.7,
-0.2,0,2.7,
-0.8,0.45,3.15,
-0.45,0.8,3.15,
0,0.8,3.15,
-0.2,0.112,2.7,
-0.112,0.2,2.7,
0,0.2,2.7,
0.45,0.8,3.15,
0.8,0.45,3.15,
0.112,0.2,2.7,
0.2,0.112,2.7,
0.4,0,2.55,
0.4,-0.224,2.55,
0.224,-0.4,2.55,
0,-0.4,2.55,
1.3,0,2.55,
1.3,-0.728,2.55,
0.728,-1.3,2.55,
0,-1.3,2.55,
1.3,0,2.4,
1.3,-0.728,2.4,
0.728,-1.3,2.4,
0,-1.3,2.4,
-0.224,-0.4,2.55,
-0.4,-0.224,2.55,
-0.4,0,2.55,
-0.728,-1.3,2.55,
-1.3,-0.728,2.55,
-1.3,0,2.55,
-0.728,-1.3,2.4,
-1.3,-0.728,2.4,
-1.3,0,2.4,
-0.4,0.224,2.55,
-0.224,0.4,2.55,
0,0.4,2.55,
-1.3,0.728,2.55,
-0.728,1.3,2.55,
0,1.3,2.55,
-1.3,0.728,2.4,
-0.728,1.3,2.4,
0,1.3,2.4,
0.224,0.4,2.55,
0.4,0.224,2.55,
0.728,1.3,2.55,
1.3,0.728,2.55,
0.728,1.3,2.4,
1.3,0.728,2.4,
0,0,0,
1.425,0,0,
1.425,0.798,0,
0.798,1.425,0,
0,1.425,0,
1.5,0,0.075,
1.5,0.84,0.075,
0.84,1.5,0.075,
0,1.5,0.075,
-0.798,1.425,0,
-1.425,0.798,0,
-1.425,0,0,
-0.84,1.5,0.075,
-1.5,0.84,0.075,
-1.5,0,0.075,
-1.425,-0.798,0,
-0.798,-1.425,0,
0,-1.425,0,
-1.5,-0.84,0.075,
-0.84,-1.5,0.075,
0,-1.5,0.075,
0.798,-1.425,0,
1.425,-0.798,0,
0.84,-1.5,0.075,
1.5,-0.84,0.075
	] ;

	THREE.BufferGeometry.call( this );

	this.type = 'TeapotBufferGeometry';

	this.parameters = {
		size: size,
		segments: segments,
		bottom: bottom,
		lid: lid,
		body: body,
		fitLid: fitLid,
		blinn: blinn
	};

	size = size || 50;

	// number of segments per patch
	segments = segments !== undefined ? Math.max( 2, Math.floor( segments ) || 10 ) : 10;

	// which parts should be visible
	bottom = bottom === undefined ? true : bottom;
	lid = lid === undefined ? true : lid;
	body = body === undefined ? true : body;

	// Should the lid be snug? It's not traditional, so off by default
	fitLid = fitLid === undefined ? false : fitLid;

	// Jim Blinn scaled the teapot down in size by about 1.3 for
	// some rendering tests. He liked the new proportions that he kept
	// the data in this form. The model was distributed with these new
	// proportions and became the norm. Trivia: comparing images of the
	// real teapot and the computer model, the ratio for the bowl of the
	// real teapot is more like 1.25, but since 1.3 is the traditional
	// value given, we use it here.
	var blinnScale = 1.3;
	blinn = blinn === undefined ? true : blinn;

	// scale the size to be the real scaling factor
	var maxHeight = 3.15 * ( blinn ? 1 : blinnScale );

	var maxHeight2 = maxHeight / 2;
	var trueSize = size / maxHeight2;

	// Number of elements depends on what is needed. Subtract degenerate
	// triangles at tip of bottom and lid out in advance.
	var numTriangles = bottom ? ( 8 * segments - 4 ) * segments : 0;
	numTriangles += lid ? ( 16 * segments - 4 ) * segments : 0;
	numTriangles += body ? 40 * segments * segments : 0;

	var indices = new Uint32Array( numTriangles * 3 );

	var numVertices = bottom ? 4 : 0;
	numVertices += lid ? 8 : 0;
	numVertices += body ? 20 : 0;
	numVertices *= ( segments + 1 ) * ( segments + 1 );

	var vertices = new Float32Array( numVertices * 3 );
	var normals = new Float32Array( numVertices * 3 );
	var uvs = new Float32Array( numVertices * 2 );

	// Bezier form
	var ms = new THREE.Matrix4();
	ms.set( -1.0,  3.0, -3.0,  1.0,
			 3.0, -6.0,  3.0,  0.0,
			-3.0,  3.0,  0.0,  0.0,
			 1.0,  0.0,  0.0,  0.0 ) ;

	var g = [];
	var i, r, c;

	var sp = [];
	var tp = [];
	var dsp = [];
	var dtp = [];

	// M * G * M matrix, sort of see
	// http://www.cs.helsinki.fi/group/goa/mallinnus/curves/surfaces.html
	var mgm = [];

	var vert = [];
	var sdir = [];
	var tdir = [];

	var norm = new THREE.Vector3();

	var tcoord;

	var sstep, tstep;
	var vertPerRow, eps;

	var s, t, sval, tval, p, dsval, dtval;

	var normOut = new THREE.Vector3();
	var v1, v2, v3, v4;

	var gmx = new THREE.Matrix4();
	var tmtx = new THREE.Matrix4();

	var vsp = new THREE.Vector4();
	var vtp = new THREE.Vector4();
	var vdsp = new THREE.Vector4();
	var vdtp = new THREE.Vector4();

	var vsdir = new THREE.Vector3();
	var vtdir = new THREE.Vector3();

	var mst = ms.clone();
	mst.transpose();

	// internal function: test if triangle has any matching vertices;
	// if so, don't save triangle, since it won't display anything.
	var notDegenerate = function ( vtx1, vtx2, vtx3 ) {

		// if any vertex matches, return false
		return ! ( ( ( vertices[ vtx1 * 3 ]     === vertices[ vtx2 * 3 ] ) &&
					 ( vertices[ vtx1 * 3 + 1 ] === vertices[ vtx2 * 3 + 1 ] ) &&
					 ( vertices[ vtx1 * 3 + 2 ] === vertices[ vtx2 * 3 + 2 ] ) ) ||
				   ( ( vertices[ vtx1 * 3 ]     === vertices[ vtx3 * 3 ] ) &&
					 ( vertices[ vtx1 * 3 + 1 ] === vertices[ vtx3 * 3 + 1 ] ) &&
					 ( vertices[ vtx1 * 3 + 2 ] === vertices[ vtx3 * 3 + 2 ] ) ) ||
				   ( ( vertices[ vtx2 * 3 ]     === vertices[ vtx3 * 3 ] ) &&
					 ( vertices[ vtx2 * 3 + 1 ] === vertices[ vtx3 * 3 + 1 ] ) &&
					 ( vertices[ vtx2 * 3 + 2 ] === vertices[ vtx3 * 3 + 2 ] ) ) );

	};


	for ( i = 0; i < 3; i ++ )
	{

		mgm[ i ] = new THREE.Matrix4();

	}

	var minPatches = body ? 0 : 20;
	var maxPatches = bottom ? 32 : 28;

	vertPerRow = segments + 1;

	eps = 0.0000001;

	var surfCount = 0;

	var vertCount = 0;
	var normCount = 0;
	var uvCount = 0;

	var indexCount = 0;

	for ( var surf = minPatches ; surf < maxPatches ; surf ++ ) {

		// lid is in the middle of the data, patches 20-27,
		// so ignore it for this part of the loop if the lid is not desired
		if ( lid || ( surf < 20 || surf >= 28 ) ) {

			// get M * G * M matrix for x,y,z
			for ( i = 0 ; i < 3 ; i ++ ) {

				// get control patches
				for ( r = 0 ; r < 4 ; r ++ ) {

					for ( c = 0 ; c < 4 ; c ++ ) {

						// transposed
						g[ c * 4 + r ] = teapotVertices[ teapotPatches[ surf * 16 + r * 4 + c ] * 3 + i ] ;

						// is the lid to be made larger, and is this a point on the lid
						// that is X or Y?
						if ( fitLid && ( surf >= 20 && surf < 28 ) && ( i !== 2 ) ) {

							// increase XY size by 7.7%, found empirically. I don't
							// increase Z so that the teapot will continue to fit in the
							// space -1 to 1 for Y (Y is up for the final model).
							g[ c * 4 + r ] *= 1.077;

						}

						// Blinn "fixed" the teapot by dividing Z by blinnScale, and that's the
						// data we now use. The original teapot is taller. Fix it:
						if ( ! blinn && ( i === 2 ) ) {

							g[ c * 4 + r ] *= blinnScale;

						}

					}

				}

				gmx.set( g[ 0 ], g[ 1 ], g[ 2 ], g[ 3 ], g[ 4 ], g[ 5 ], g[ 6 ], g[ 7 ], g[ 8 ], g[ 9 ], g[ 10 ], g[ 11 ], g[ 12 ], g[ 13 ], g[ 14 ], g[ 15 ] );

				tmtx.multiplyMatrices( gmx, ms );
				mgm[ i ].multiplyMatrices( mst, tmtx );

			}

			// step along, get points, and output
			for ( sstep = 0 ; sstep <= segments ; sstep ++ ) {

				s = sstep / segments;

				for ( tstep = 0 ; tstep <= segments ; tstep ++ ) {

					t = tstep / segments;

					// point from basis
					// get power vectors and their derivatives
					for ( p = 4, sval = tval = 1.0 ; p -- ; ) {

						sp[ p ] = sval ;
						tp[ p ] = tval ;
						sval *= s ;
						tval *= t ;

						if ( p === 3 ) {

							dsp[ p ] = dtp[ p ] = 0.0 ;
							dsval = dtval = 1.0 ;

						} else {

							dsp[ p ] = dsval * ( 3 - p ) ;
							dtp[ p ] = dtval * ( 3 - p ) ;
							dsval *= s ;
							dtval *= t ;

						}

					}

					vsp.fromArray( sp );
					vtp.fromArray( tp );
					vdsp.fromArray( dsp );
					vdtp.fromArray( dtp );

					// do for x,y,z
					for ( i = 0 ; i < 3 ; i ++ ) {

						// multiply power vectors times matrix to get value
						tcoord = vsp.clone();
						tcoord.applyMatrix4( mgm[ i ] );
						vert[ i ] = tcoord.dot( vtp );

						// get s and t tangent vectors
						tcoord = vdsp.clone();
						tcoord.applyMatrix4( mgm[ i ] );
						sdir[ i ] = tcoord.dot( vtp ) ;

						tcoord = vsp.clone();
						tcoord.applyMatrix4( mgm[ i ] );
						tdir[ i ] = tcoord.dot( vdtp ) ;

					}

					// find normal
					vsdir.fromArray( sdir );
					vtdir.fromArray( tdir );
					norm.crossVectors( vtdir, vsdir );
					norm.normalize();

					// if X and Z length is 0, at the cusp, so point the normal up or down, depending on patch number
					if ( vert[ 0 ] === 0 && vert[ 1 ] === 0 )
					{

						// if above the middle of the teapot, normal points up, else down
						normOut.set( 0, vert[ 2 ] > maxHeight2 ? 1 : - 1, 0 );

					}
					else
					{

						// standard output: rotate on X axis
						normOut.set( norm.x, norm.z, - norm.y );

					}

					// store it all
					vertices[ vertCount ++ ] = trueSize * vert[ 0 ];
					vertices[ vertCount ++ ] = trueSize * ( vert[ 2 ] - maxHeight2 );
					vertices[ vertCount ++ ] = - trueSize * vert[ 1 ];

					normals[ normCount ++ ] = normOut.x;
					normals[ normCount ++ ] = normOut.y;
					normals[ normCount ++ ] = normOut.z;

					uvs[ uvCount ++ ] = 1 - t;
					uvs[ uvCount ++ ] = 1 - s;

				}

			}

			// save the faces
			for ( sstep = 0 ; sstep < segments ; sstep ++ ) {

				for ( tstep = 0 ; tstep < segments ; tstep ++ ) {

					v1 = surfCount * vertPerRow * vertPerRow + sstep * vertPerRow + tstep;
					v2 = v1 + 1;
					v3 = v2 + vertPerRow;
					v4 = v1 + vertPerRow;

					// Normals and UVs cannot be shared. Without clone(), you can see the consequences
					// of sharing if you call geometry.applyMatrix( matrix ).
					if ( notDegenerate ( v1, v2, v3 ) ) {

						indices[ indexCount ++ ] = v1;
						indices[ indexCount ++ ] = v2;
						indices[ indexCount ++ ] = v3;

					}
					if ( notDegenerate ( v1, v3, v4 ) ) {

						indices[ indexCount ++ ] = v1;
						indices[ indexCount ++ ] = v3;
						indices[ indexCount ++ ] = v4;

					}

				}

			}

			// increment only if a surface was used
			surfCount ++;

		}

	}

	this.setIndex( new THREE.BufferAttribute( indices, 1 ) );
	this.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	this.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	this.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

	this.computeBoundingSphere();

};


THREE.TeapotBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.TeapotBufferGeometry.prototype.constructor = THREE.TeapotBufferGeometry;

THREE.TeapotBufferGeometry.prototype.clone = function () {

	var bufferGeometry = new THREE.TeapotBufferGeometry(
		this.parameters.size,
		this.parameters.segments,
		this.parameters.bottom,
		this.parameters.lid,
		this.parameters.body,
		this.parameters.fitLid,
		this.parameters.blinn
	);

	return bufferGeometry;

};

// File:editor/js/Sidebar.Geometry.TeapotBufferGeometry.js

/**
 * @author tschw
 */

Sidebar.Geometry.TeapotBufferGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// size

	var sizeRow = new UI.Panel();
	var size = new UI.Number( parameters.size ).onChange( update );

	sizeRow.add( new UI.Text( 'Size' ).setWidth( '90px' ) );
	sizeRow.add( size );

	container.add( sizeRow );

	// segments

	var segmentsRow = new UI.Panel();
	var segments = new UI.Integer( parameters.segments ).setRange( 1, Infinity ).onChange( update );

	segmentsRow.add( new UI.Text( 'Segments' ).setWidth( '90px' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	// bottom

	var bottomRow = new UI.Panel();
	var bottom = new UI.Checkbox( parameters.bottom ).onChange( update );

	bottomRow.add( new UI.Text( 'Bottom' ).setWidth( '90px' ) );
	bottomRow.add( bottom );

	container.add( bottomRow );

	// lid

	var lidRow = new UI.Panel();
	var lid = new UI.Checkbox( parameters.lid ).onChange( update );

	lidRow.add( new UI.Text( 'Lid' ).setWidth( '90px' ) );
	lidRow.add( lid );

	container.add( lidRow );

	// body

	var bodyRow = new UI.Panel();
	var body = new UI.Checkbox( parameters.body ).onChange( update );

	bodyRow.add( new UI.Text( 'Body' ).setWidth( '90px' ) );
	bodyRow.add( body );

	container.add( bodyRow );

	// fitted lid

	var fitLidRow = new UI.Panel();
	var fitLid = new UI.Checkbox( parameters.fitLid ).onChange( update );

	fitLidRow.add( new UI.Text( 'Fitted Lid' ).setWidth( '90px' ) );
	fitLidRow.add( fitLid );

	container.add( fitLidRow );

	// blinn-sized

	var blinnRow = new UI.Panel();
	var blinn = new UI.Checkbox( parameters.blinn ).onChange( update );

	blinnRow.add( new UI.Text( 'Blinn-scaled' ).setWidth( '90px' ) );
	blinnRow.add( blinn );

	container.add( blinnRow );

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.TeapotBufferGeometry(
			size.getValue(),
			segments.getValue(),
			bottom.getValue(),
			lid.getValue(),
			body.getValue(),
			fitLid.getValue(),
			blinn.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}

// File:editor/js/Sidebar.Material.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Material = function ( editor ) {

	var signals = editor.signals;
	var currentObject;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/material/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/material/collapsed', boolean );

	} );
	container.setDisplay( 'none' );
	container.dom.classList.add( 'Material' );

	container.addStatic( new UI.Text().setValue( 'MATERIAL' ) );
	container.add( new UI.Break() );

	// uuid

	var materialUUIDRow = new UI.Panel();
	var materialUUID = new UI.Input().setWidth( '115px' ).setFontSize( '12px' ).setDisabled( true );
	var materialUUIDRenew = new UI.Button( '⟳' ).setMarginLeft( '7px' ).onClick( function () {

		materialUUID.setValue( THREE.Math.generateUUID() );
		update();

	} );

	materialUUIDRow.add( new UI.Text( 'UUID' ).setWidth( '90px' ) );
	materialUUIDRow.add( materialUUID );
	materialUUIDRow.add( materialUUIDRenew );

	container.add( materialUUIDRow );

	// name

	var materialNameRow = new UI.Panel();
	var materialName = new UI.Input().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

		editor.setMaterialName( editor.selected.material, materialName.getValue() );

	} );

	materialNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
	materialNameRow.add( materialName );

	container.add( materialNameRow );

	// class

	var materialClassRow = new UI.Panel();
	var materialClass = new UI.Select().setOptions( {

		'LineBasicMaterial': 'LineBasicMaterial',
		'LineDashedMaterial': 'LineDashedMaterial',
		'MeshBasicMaterial': 'MeshBasicMaterial',
		'MeshDepthMaterial': 'MeshDepthMaterial',
		'MeshLambertMaterial': 'MeshLambertMaterial',
		'MeshNormalMaterial': 'MeshNormalMaterial',
		'MeshPhongMaterial': 'MeshPhongMaterial',
		'ShaderMaterial': 'ShaderMaterial',
		'SpriteMaterial': 'SpriteMaterial'

	} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

	materialClassRow.add( new UI.Text( 'Type' ).setWidth( '90px' ) );
	materialClassRow.add( materialClass );

	container.add( materialClassRow );

	// program

	var materialProgramRow = new UI.Panel();
	materialProgramRow.add( new UI.Text( 'Program' ).setWidth( '90px' ) );

	var materialProgramInfo = new UI.Button( 'Info' );
	materialProgramInfo.setMarginLeft( '4px' );
	materialProgramInfo.onClick( function () {

		signals.editScript.dispatch( currentObject.material, 'programInfo' );

	} );
	materialProgramRow.add( materialProgramInfo );

	var materialProgramVertex = new UI.Button( 'Vertex' );
	materialProgramVertex.setMarginLeft( '4px' );
	materialProgramVertex.onClick( function () {

		signals.editScript.dispatch( currentObject.material, 'vertexShader' );

	} );
	materialProgramRow.add( materialProgramVertex );

	var materialProgramFragment = new UI.Button( 'Fragment' );
	materialProgramFragment.setMarginLeft( '4px' );
	materialProgramFragment.onClick( function () {

		signals.editScript.dispatch( currentObject.material, 'fragmentShader' );

	} );
	materialProgramRow.add( materialProgramFragment );

	container.add( materialProgramRow );

	// color

	var materialColorRow = new UI.Panel();
	var materialColor = new UI.Color().onChange( update );

	materialColorRow.add( new UI.Text( 'Color' ).setWidth( '90px' ) );
	materialColorRow.add( materialColor );

	container.add( materialColorRow );

	// emissive

	var materialEmissiveRow = new UI.Panel();
	var materialEmissive = new UI.Color().setHexValue( 0x000000 ).onChange( update );

	materialEmissiveRow.add( new UI.Text( 'Emissive' ).setWidth( '90px' ) );
	materialEmissiveRow.add( materialEmissive );

	container.add( materialEmissiveRow );

	// specular

	var materialSpecularRow = new UI.Panel();
	var materialSpecular = new UI.Color().setHexValue( 0x111111 ).onChange( update );

	materialSpecularRow.add( new UI.Text( 'Specular' ).setWidth( '90px' ) );
	materialSpecularRow.add( materialSpecular );

	container.add( materialSpecularRow );

	// shininess

	var materialShininessRow = new UI.Panel();
	var materialShininess = new UI.Number( 30 ).onChange( update );

	materialShininessRow.add( new UI.Text( 'Shininess' ).setWidth( '90px' ) );
	materialShininessRow.add( materialShininess );

	container.add( materialShininessRow );

	// vertex colors

	var materialVertexColorsRow = new UI.Panel();
	var materialVertexColors = new UI.Select().setOptions( {

		0: 'No',
		1: 'Face',
		2: 'Vertex'

	} ).onChange( update );

	materialVertexColorsRow.add( new UI.Text( 'Vertex Colors' ).setWidth( '90px' ) );
	materialVertexColorsRow.add( materialVertexColors );

	container.add( materialVertexColorsRow );

	// skinning

	var materialSkinningRow = new UI.Panel();
	var materialSkinning = new UI.Checkbox( false ).onChange( update );

	materialSkinningRow.add( new UI.Text( 'Skinning' ).setWidth( '90px' ) );
	materialSkinningRow.add( materialSkinning );

	container.add( materialSkinningRow );

	// map

	var materialMapRow = new UI.Panel();
	var materialMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialMap = new UI.Texture().onChange( update );

	materialMapRow.add( new UI.Text( 'Map' ).setWidth( '90px' ) );
	materialMapRow.add( materialMapEnabled );
	materialMapRow.add( materialMap );

	container.add( materialMapRow );

	// alpha map

	var materialAlphaMapRow = new UI.Panel();
	var materialAlphaMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialAlphaMap = new UI.Texture().onChange( update );

	materialAlphaMapRow.add( new UI.Text( 'Alpha Map' ).setWidth( '90px' ) );
	materialAlphaMapRow.add( materialAlphaMapEnabled );
	materialAlphaMapRow.add( materialAlphaMap );

	container.add( materialAlphaMapRow );

	// bump map

	var materialBumpMapRow = new UI.Panel();
	var materialBumpMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialBumpMap = new UI.Texture().onChange( update );
	var materialBumpScale = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

	materialBumpMapRow.add( new UI.Text( 'Bump Map' ).setWidth( '90px' ) );
	materialBumpMapRow.add( materialBumpMapEnabled );
	materialBumpMapRow.add( materialBumpMap );
	materialBumpMapRow.add( materialBumpScale );

	container.add( materialBumpMapRow );

	// normal map

	var materialNormalMapRow = new UI.Panel();
	var materialNormalMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialNormalMap = new UI.Texture().onChange( update );

	materialNormalMapRow.add( new UI.Text( 'Normal Map' ).setWidth( '90px' ) );
	materialNormalMapRow.add( materialNormalMapEnabled );
	materialNormalMapRow.add( materialNormalMap );

	container.add( materialNormalMapRow );

	// displacement map

	var materialDisplacementMapRow = new UI.Panel();
	var materialDisplacementMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialDisplacementMap = new UI.Texture().onChange( update );
	var materialDisplacementScale = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

	materialDisplacementMapRow.add( new UI.Text( 'Displace Map' ).setWidth( '90px' ) );
	materialDisplacementMapRow.add( materialDisplacementMapEnabled );
	materialDisplacementMapRow.add( materialDisplacementMap );
	materialDisplacementMapRow.add( materialDisplacementScale );

	container.add( materialDisplacementMapRow );

	// specular map

	var materialSpecularMapRow = new UI.Panel();
	var materialSpecularMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialSpecularMap = new UI.Texture().onChange( update );

	materialSpecularMapRow.add( new UI.Text( 'Specular Map' ).setWidth( '90px' ) );
	materialSpecularMapRow.add( materialSpecularMapEnabled );
	materialSpecularMapRow.add( materialSpecularMap );

	container.add( materialSpecularMapRow );

	// env map

	var materialEnvMapRow = new UI.Panel();
	var materialEnvMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialEnvMap = new UI.Texture( THREE.SphericalReflectionMapping ).onChange( update );
	var materialReflectivity = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

	materialEnvMapRow.add( new UI.Text( 'Env Map' ).setWidth( '90px' ) );
	materialEnvMapRow.add( materialEnvMapEnabled );
	materialEnvMapRow.add( materialEnvMap );
	materialEnvMapRow.add( materialReflectivity );

	container.add( materialEnvMapRow );

	// light map

	var materialLightMapRow = new UI.Panel();
	var materialLightMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialLightMap = new UI.Texture().onChange( update );

	materialLightMapRow.add( new UI.Text( 'Light Map' ).setWidth( '90px' ) );
	materialLightMapRow.add( materialLightMapEnabled );
	materialLightMapRow.add( materialLightMap );

	container.add( materialLightMapRow );

	// ambient occlusion map

	var materialAOMapRow = new UI.Panel();
	var materialAOMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialAOMap = new UI.Texture().onChange( update );
	var materialAOScale = new UI.Number( 1 ).setRange( 0, 1 ).setWidth( '30px' ).onChange( update );

	materialAOMapRow.add( new UI.Text( 'AO Map' ).setWidth( '90px' ) );
	materialAOMapRow.add( materialAOMapEnabled );
	materialAOMapRow.add( materialAOMap );
	materialAOMapRow.add( materialAOScale );

	container.add( materialAOMapRow );

	// side

	var materialSideRow = new UI.Panel();
	var materialSide = new UI.Select().setOptions( {

		0: 'Front',
		1: 'Back',
		2: 'Double'

	} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

	materialSideRow.add( new UI.Text( 'Side' ).setWidth( '90px' ) );
	materialSideRow.add( materialSide );

	container.add( materialSideRow );

	// shading

	var materialShadingRow = new UI.Panel();
	var materialShading = new UI.Select().setOptions( {

		0: 'No',
		1: 'Flat',
		2: 'Smooth'

	} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

	materialShadingRow.add( new UI.Text( 'Shading' ).setWidth( '90px' ) );
	materialShadingRow.add( materialShading );

	container.add( materialShadingRow );

	// blending

	var materialBlendingRow = new UI.Panel();
	var materialBlending = new UI.Select().setOptions( {

		0: 'No',
		1: 'Normal',
		2: 'Additive',
		3: 'Subtractive',
		4: 'Multiply',
		5: 'Custom'

	} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

	materialBlendingRow.add( new UI.Text( 'Blending' ).setWidth( '90px' ) );
	materialBlendingRow.add( materialBlending );

	container.add( materialBlendingRow );

	// opacity

	var materialOpacityRow = new UI.Panel();
	var materialOpacity = new UI.Number().setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialOpacityRow.add( new UI.Text( 'Opacity' ).setWidth( '90px' ) );
	materialOpacityRow.add( materialOpacity );

	container.add( materialOpacityRow );

	// transparent

	var materialTransparentRow = new UI.Panel();
	var materialTransparent = new UI.Checkbox().setLeft( '100px' ).onChange( update );

	materialTransparentRow.add( new UI.Text( 'Transparent' ).setWidth( '90px' ) );
	materialTransparentRow.add( materialTransparent );

	container.add( materialTransparentRow );

	// alpha test

	var materialAlphaTestRow = new UI.Panel();
	var materialAlphaTest = new UI.Number().setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialAlphaTestRow.add( new UI.Text( 'Alpha Test' ).setWidth( '90px' ) );
	materialAlphaTestRow.add( materialAlphaTest );

	container.add( materialAlphaTestRow );

	// wireframe

	var materialWireframeRow = new UI.Panel();
	var materialWireframe = new UI.Checkbox( false ).onChange( update );
	var materialWireframeLinewidth = new UI.Number( 1 ).setWidth( '60px' ).setRange( 0, 100 ).onChange( update );

	materialWireframeRow.add( new UI.Text( 'Wireframe' ).setWidth( '90px' ) );
	materialWireframeRow.add( materialWireframe );
	materialWireframeRow.add( materialWireframeLinewidth );

	container.add( materialWireframeRow );

	//

	function update() {

		var object = currentObject;

		var geometry = object.geometry;
		var material = object.material;

		var textureWarning = false;
		var objectHasUvs = false;

		if ( object instanceof THREE.Sprite ) objectHasUvs = true;
		if ( geometry instanceof THREE.Geometry && geometry.faceVertexUvs[ 0 ].length > 0 ) objectHasUvs = true;
		if ( geometry instanceof THREE.BufferGeometry && geometry.attributes.uv !== undefined ) objectHasUvs = true;

		if ( material ) {

			if ( material.uuid !== undefined ) {

				material.uuid = materialUUID.getValue();

			}

			if ( material instanceof THREE[ materialClass.getValue() ] === false ) {

				material = new THREE[ materialClass.getValue() ]();

				object.material = material;
				// TODO Copy other references in the scene graph
				// keeping name and UUID then.
				// Also there should be means to create a unique
				// copy for the current object explicitly and to
				// attach the current material to other objects.

			}

			if ( material.color !== undefined ) {

				material.color.setHex( materialColor.getHexValue() );

			}

			if ( material.emissive !== undefined ) {

				material.emissive.setHex( materialEmissive.getHexValue() );

			}

			if ( material.specular !== undefined ) {

				material.specular.setHex( materialSpecular.getHexValue() );

			}

			if ( material.shininess !== undefined ) {

				material.shininess = materialShininess.getValue();

			}

			if ( material.vertexColors !== undefined ) {

				var vertexColors = parseInt( materialVertexColors.getValue() );

				if ( material.vertexColors !== vertexColors ) {

					material.vertexColors = vertexColors;
					material.needsUpdate = true;

				}

			}

			if ( material.skinning !== undefined ) {

				material.skinning = materialSkinning.getValue();

			}

			if ( material.map !== undefined ) {

				var mapEnabled = materialMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					material.map = mapEnabled ? materialMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( mapEnabled ) textureWarning = true;

				}

			}

			if ( material.alphaMap !== undefined ) {

				var mapEnabled = materialAlphaMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					material.alphaMap = mapEnabled ? materialAlphaMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( mapEnabled ) textureWarning = true;

				}

			}

			if ( material.bumpMap !== undefined ) {

				var bumpMapEnabled = materialBumpMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					material.bumpMap = bumpMapEnabled ? materialBumpMap.getValue() : null;
					material.bumpScale = materialBumpScale.getValue();
					material.needsUpdate = true;

				} else {

					if ( bumpMapEnabled ) textureWarning = true;

				}

			}

			if ( material.normalMap !== undefined ) {

				var normalMapEnabled = materialNormalMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					material.normalMap = normalMapEnabled ? materialNormalMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( normalMapEnabled ) textureWarning = true;

				}

			}

			if ( material.displacementMap !== undefined ) {

				var displacementMapEnabled = materialDisplacementMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					material.displacementMap = displacementMapEnabled ? materialDisplacementMap.getValue() : null;
					material.displacementScale = materialDisplacementScale.getValue();
					material.needsUpdate = true;

				} else {

					if ( displacementMapEnabled ) textureWarning = true;

				}

			}

			if ( material.specularMap !== undefined ) {

				var specularMapEnabled = materialSpecularMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					material.specularMap = specularMapEnabled ? materialSpecularMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( specularMapEnabled ) textureWarning = true;

				}

			}

			if ( material.envMap !== undefined ) {

				var envMapEnabled = materialEnvMapEnabled.getValue() === true;

				material.envMap = envMapEnabled ? materialEnvMap.getValue() : null;
				material.reflectivity = materialReflectivity.getValue();
				material.needsUpdate = true;

			}


			if ( material.lightMap !== undefined ) {

				var lightMapEnabled = materialLightMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					material.lightMap = lightMapEnabled ? materialLightMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( lightMapEnabled ) textureWarning = true;

				}

			}

			if ( material.aoMap !== undefined ) {

				var aoMapEnabled = materialAOMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					material.aoMap = aoMapEnabled ? materialAOMap.getValue() : null;
					material.aoMapIntensity = materialAOScale.getValue();
					material.needsUpdate = true;

				} else {

					if ( aoMapEnabled ) textureWarning = true;

				}

			}

			if ( material.side !== undefined ) {

				material.side = parseInt( materialSide.getValue() );

			}

			if ( material.shading !== undefined ) {

				material.shading = parseInt( materialShading.getValue() );

			}

			if ( material.blending !== undefined ) {

				material.blending = parseInt( materialBlending.getValue() );

			}

			if ( material.opacity !== undefined ) {

				material.opacity = materialOpacity.getValue();

			}

			if ( material.transparent !== undefined ) {

				material.transparent = materialTransparent.getValue();

			}

			if ( material.alphaTest !== undefined ) {

				material.alphaTest = materialAlphaTest.getValue();

			}

			if ( material.wireframe !== undefined ) {

				material.wireframe = materialWireframe.getValue();

			}

			if ( material.wireframeLinewidth !== undefined ) {

				material.wireframeLinewidth = materialWireframeLinewidth.getValue();

			}

			refreshUi(false);

			signals.materialChanged.dispatch( material );

		}

		if ( textureWarning ) {

			console.warn( "Can't set texture, model doesn't have texture coordinates" );

		}

	};

	//

	function setRowVisibility() {

		var properties = {
			'name': materialNameRow,
			'color': materialColorRow,
			'emissive': materialEmissiveRow,
			'specular': materialSpecularRow,
			'shininess': materialShininessRow,
			'vertexShader': materialProgramRow,
			'vertexColors': materialVertexColorsRow,
			'skinning': materialSkinningRow,
			'map': materialMapRow,
			'alphaMap': materialAlphaMapRow,
			'bumpMap': materialBumpMapRow,
			'normalMap': materialNormalMapRow,
			'displacementMap': materialDisplacementMapRow,
			'specularMap': materialSpecularMapRow,
			'envMap': materialEnvMapRow,
			'lightMap': materialLightMapRow,
			'aoMap': materialAOMapRow,
			'side': materialSideRow,
			'shading': materialShadingRow,
			'blending': materialBlendingRow,
			'opacity': materialOpacityRow,
			'transparent': materialTransparentRow,
			'alphaTest': materialAlphaTestRow,
			'wireframe': materialWireframeRow
		};

		var material = currentObject.material;

		for ( var property in properties ) {

			properties[ property ].setDisplay( material[ property ] !== undefined ? '' : 'none' );

		}

	};


	function refreshUi( resetTextureSelectors ) {

		var material = currentObject.material;

		if ( material.uuid !== undefined ) {

			materialUUID.setValue( material.uuid );

		}

		if ( material.name !== undefined ) {

			materialName.setValue( material.name );

		}

		materialClass.setValue( material.type );

		if ( material.color !== undefined ) {

			materialColor.setHexValue( material.color.getHexString() );

		}

		if ( material.emissive !== undefined ) {

			materialEmissive.setHexValue( material.emissive.getHexString() );

		}

		if ( material.specular !== undefined ) {

			materialSpecular.setHexValue( material.specular.getHexString() );

		}

		if ( material.shininess !== undefined ) {

			materialShininess.setValue( material.shininess );

		}

		if ( material.vertexColors !== undefined ) {

			materialVertexColors.setValue( material.vertexColors );

		}

		if ( material.skinning !== undefined ) {

			materialSkinning.setValue( material.skinning );

		}

		if ( material.map !== undefined ) {

			materialMapEnabled.setValue( material.map !== null );

			if ( material.map !== null || resetTextureSelectors ) {

				materialMap.setValue( material.map );

			}

		}

		if ( material.alphaMap !== undefined ) {

			materialAlphaMapEnabled.setValue( material.alphaMap !== null );

			if ( material.alphaMap !== null || resetTextureSelectors ) {

				materialAlphaMap.setValue( material.alphaMap );

			}

		}

		if ( material.bumpMap !== undefined ) {

			materialBumpMapEnabled.setValue( material.bumpMap !== null );

			if ( material.bumpMap !== null || resetTextureSelectors ) {

				materialBumpMap.setValue( material.bumpMap );

			}

			materialBumpScale.setValue( material.bumpScale );

		}

		if ( material.normalMap !== undefined ) {

			materialNormalMapEnabled.setValue( material.normalMap !== null );

			if ( material.normalMap !== null || resetTextureSelectors ) {

				materialNormalMap.setValue( material.normalMap );

			}

		}

		if ( material.displacementMap !== undefined ) {

			materialDisplacementMapEnabled.setValue( material.displacementMap !== null );

			if ( material.displacementMap !== null || resetTextureSelectors ) {

				materialDisplacementMap.setValue( material.displacementMap );

			}

			materialDisplacementScale.setValue( material.displacementScale );

		}

		if ( material.specularMap !== undefined ) {

			materialSpecularMapEnabled.setValue( material.specularMap !== null );

			if ( material.specularMap !== null || resetTextureSelectors ) {

				materialSpecularMap.setValue( material.specularMap );

			}

		}

		if ( material.envMap !== undefined ) {

			materialEnvMapEnabled.setValue( material.envMap !== null );

			if ( material.envMap !== null || resetTextureSelectors ) {

				materialEnvMap.setValue( material.envMap );

			}

			materialReflectivity.setValue( material.reflectivity );

		}

		if ( material.lightMap !== undefined ) {

			materialLightMapEnabled.setValue( material.lightMap !== null );

			if ( material.lightMap !== null || resetTextureSelectors ) {

				materialLightMap.setValue( material.lightMap );

			}

		}

		if ( material.aoMap !== undefined ) {

			materialAOMapEnabled.setValue( material.aoMap !== null );

			if ( material.aoMap !== null || resetTextureSelectors ) {

				materialAOMap.setValue( material.aoMap );

			}

			materialAOScale.setValue( material.aoMapIntensity );

		}

		if ( material.side !== undefined ) {

			materialSide.setValue( material.side );

		}

		if ( material.shading !== undefined ) {

			materialShading.setValue( material.shading );

		}

		if ( material.blending !== undefined ) {

			materialBlending.setValue( material.blending );

		}

		if ( material.opacity !== undefined ) {

			materialOpacity.setValue( material.opacity );

		}

		if ( material.transparent !== undefined ) {

			materialTransparent.setValue( material.transparent );

		}

		if ( material.alphaTest !== undefined ) {

			materialAlphaTest.setValue( material.alphaTest );

		}

		if ( material.wireframe !== undefined ) {

			materialWireframe.setValue( material.wireframe );

		}

		if ( material.wireframeLinewidth !== undefined ) {

			materialWireframeLinewidth.setValue( material.wireframeLinewidth );

		}

		setRowVisibility();

	}

	// events

	signals.objectSelected.add( function ( object ) {

		if ( object && object.material ) {

			var objectChanged = object !== currentObject;

			currentObject = object;
			refreshUi(objectChanged);
			container.setDisplay( '' );

		} else {

			currentObject = null;
			container.setDisplay( 'none' );

		}

	} );

	return container;

}

// File:editor/js/Sidebar.Script.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Script = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/script/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/script/collapsed', boolean );

	} );
	container.setDisplay( 'none' );

	container.addStatic( new UI.Text( 'Script' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break() );

	//

	var scriptsContainer = new UI.Panel();
	container.add( scriptsContainer );

	var newScript = new UI.Button( 'New' );
	newScript.onClick( function () {

		var script = { name: '', source: 'function update( event ) {}' };
		editor.addScript( editor.selected, script );

	} );
	container.add( newScript );

	/*
	var loadScript = new UI.Button( 'Load' );
	loadScript.setMarginLeft( '4px' );
	container.add( loadScript );
	*/

	//

	function update() {

		scriptsContainer.clear();

		var object = editor.selected;

		if ( object === null ) {

			return;

		}

		var scripts = editor.scripts[ object.uuid ];

		if ( scripts !== undefined ) {

			for ( var i = 0; i < scripts.length; i ++ ) {

				( function ( object, script ) {

					var name = new UI.Input( script.name ).setWidth( '130px' ).setFontSize( '12px' );
					name.onChange( function () {

						script.name = this.getValue();

						signals.scriptChanged.dispatch();

					} );
					scriptsContainer.add( name );

					var edit = new UI.Button( 'Edit' );
					edit.setMarginLeft( '4px' );
					edit.onClick( function () {

						signals.editScript.dispatch( object, script );

					} );
					scriptsContainer.add( edit );

					var remove = new UI.Button( 'Remove' );
					remove.setMarginLeft( '4px' );
					remove.onClick( function () {

						if ( confirm( 'Are you sure?' ) ) {

							editor.removeScript( editor.selected, script );

						}

					} );
					scriptsContainer.add( remove );

					scriptsContainer.add( new UI.Break() );

				} )( object, scripts[ i ] )

			}

		}

	}

	// signals

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			container.setDisplay( 'block' );

			update();

		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.scriptAdded.add( update );
	signals.scriptRemoved.add( update );

	return container;

};

// File:editor/js/Toolbar.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var Toolbar = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'toolbar' );

	var buttons = new UI.Panel();
	container.add( buttons );

	// translate / rotate / scale

	// var translate = new UI.Button( 'translate' ).onClick( function () {

	// 	signals.transformModeChanged.dispatch( 'translate' );

	// } );
	// buttons.add( translate );

	// var rotate = new UI.Button( 'rotate' ).onClick( function () {

	// 	signals.transformModeChanged.dispatch( 'rotate' );

	// } );
	// buttons.add( rotate );

	// var scale = new UI.Button( 'scale' ).onClick( function () {

	// 	signals.transformModeChanged.dispatch( 'scale' );

	// } );
	// buttons.add( scale );

	// grid

	var grid = new UI.Number( 25 ).onChange( update );
	grid.dom.style.width = '42px';
	buttons.add( new UI.Text( 'Grid: ' ) );
	buttons.add( grid );

	var snap = new UI.Checkbox( false ).onChange( update );
	buttons.add( snap );
	buttons.add( new UI.Text( 'snap' ) );

	// var local = new UI.Checkbox( false ).onChange( update );
	// buttons.add( local );
	// buttons.add( new UI.Text( 'local' ) );

	var showGrid = new UI.Checkbox().onChange( update ).setValue( true );
	buttons.add( showGrid );
	buttons.add( new UI.Text( 'Grid' ) );

	var showMan = new UI.Checkbox().onChange( update ).setValue( true );
	buttons.add( showMan );
	buttons.add( new UI.Text( 'Dummy' ) );

	function update() {

		signals.snapChanged.dispatch( snap.getValue() === true ? grid.getValue() : null );
		// signals.spaceChanged.dispatch( local.getValue() === true ? "local" : "world" );
		signals.showGridChanged.dispatch( showGrid.getValue() );
		signals.showManChanged.dispatch( showMan.getValue() );
	}

	return container;

}

// File:editor/js/Viewport.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var Viewport = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'viewport' );
	container.setPosition( 'absolute' );

	container.add( new Viewport.Info( editor ) );

	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;

	var objects = [];

	// helpers

	var grid = new THREE.GridHelper( 500, 25 );
	sceneHelpers.add( grid );

	// instantiate a loader
	var loader = new THREE.JSONLoader();
	var vrHuman;

	// load a resource
	loader.load(
		// resource URL
		'3D/dummy.json',
		// Function when resource is loaded
		function ( geometry, materials ) {
			vrHuman = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial( ) );
			sceneHelpers.add( vrHuman );
		}
	);


	//

	var camera = editor.camera;

	//

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	var matrix = new THREE.Matrix4();

	var transformControls = new THREE.TransformControls( camera, container.dom );
	transformControls.addEventListener( 'change', function () {

		var object = transformControls.object;

		if ( object !== undefined ) {

			selectionBox.update( object );

			if ( editor.helpers[ object.id ] !== undefined ) {

				editor.helpers[ object.id ].update();

			}

		}

		render();

	} );
	transformControls.addEventListener( 'mouseDown', function () {

		var object = transformControls.object;

		matrix.copy( object.matrix );

		controls.enabled = false;

	} );
	transformControls.addEventListener( 'mouseUp', function () {

		var object = transformControls.object;

		if ( matrix.equals( object.matrix ) === false ) {

			( function ( matrix1, matrix2 ) {

				editor.history.add(
					function () {
						matrix1.decompose( object.position, object.quaternion, object.scale );
						signals.objectChanged.dispatch( object );
					},
					function () {
						matrix2.decompose( object.position, object.quaternion, object.scale );
						signals.objectChanged.dispatch( object );
					}
				);

			} )( matrix.clone(), object.matrix.clone() );

		}

		signals.objectChanged.dispatch( object );
		controls.enabled = true;

	} );

	sceneHelpers.add( transformControls );

	// fog

	var oldFogType = "None";
	var oldFogColor = 0xaaaaaa;
	var oldFogNear = 1;
	var oldFogFar = 5000;
	var oldFogDensity = 0.00025;

	// object picking

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	// events

	function getIntersects( point, objects ) {

		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		raycaster.setFromCamera( mouse, camera );

		return raycaster.intersectObjects( objects );

	};

	var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition( dom, x, y ) {

		var rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

	};

	function handleClick() {

		if ( onDownPosition.distanceTo( onUpPosition ) == 0 ) {

			var intersects = getIntersects( onUpPosition, objects );

			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;

				if ( object.userData.object !== undefined ) {

					// helper

					editor.select( object.userData.object );

				} else {

					editor.select( object );

				}

			} else {

				editor.select( null );

			}

			render();

		}

	};

	function onMouseDown( event ) {

		event.preventDefault();

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	function onMouseUp( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'mouseup', onMouseUp, false );

	};

	function onTouchStart( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', onTouchEnd, false );

	};

	function onTouchEnd( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'touchend', onTouchEnd, false );

	};

	function onDoubleClick( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDoubleClickPosition.fromArray( array );

		var intersects = getIntersects( onDoubleClickPosition, objects );

		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];

			signals.objectFocused.dispatch( intersect.object );

		}

	};

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'touchstart', onTouchStart, false );
	container.dom.addEventListener( 'dblclick', onDoubleClick, false );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	var controls = new THREE.EditorControls( camera, container.dom );
	controls.addEventListener( 'change', function () {

		transformControls.update();
		signals.cameraChanged.dispatch( camera );

	} );

	// signals

	signals.editorCleared.add( function () {

		controls.center.set( 0, 0, 0 );
		render();

	} );

	var clearColor;

	signals.themeChanged.add( function ( value ) {

		switch ( value ) {

			case 'css/light.css':
				grid.setColors( 0x444444, 0x888888 );
				clearColor = 0xaaaaaa;
				break;
			case 'css/dark.css':
				grid.setColors( 0xbbbbbb, 0x888888 );
				clearColor = 0x333333;
				break;

		}

		renderer.setClearColor( clearColor );

		render();

	} );

	signals.cameraPositionSnap.add( function ( mode ) {

		//Needs Update to work without selected object

		var distance;
		var newPos;

		if(editor.selected)
			distance = editor.selected.position.distanceTo(camera.position);

		switch(mode){

			case "top" :
				newPos = new THREE.Vector3(0, distance, 0);
			break;

			case "bottom" :
				newPos = new THREE.Vector3(0, -distance, 0);
			break;

			case "left" :
				newPos = new THREE.Vector3(distance, 0, 0);
			break;

			case "right" :
				newPos = new THREE.Vector3(-distance, 0, 0);
			break;

			case "front" :
				newPos = new THREE.Vector3(0, 0, -distance);
			break;

			case "back" :
				newPos = new THREE.Vector3(0, 0, distance);
			break;

		}
		
		if(editor.selected){

			camera.position.set(newPos.x + editor.selected.position.x, 
				newPos.y + editor.selected.position.y, 
				newPos.z + editor.selected.position.z);

			controls.focus(editor.selected);

		}
		else
		{

			controls.center.set( 0, 0, 0 );
			render();
		}

		signals.cameraChanged.dispatch( camera );

	} );

	signals.transformModeChanged.add( function ( mode ) {

		transformControls.setMode( mode );

	} );

	signals.snapChanged.add( function ( dist ) {

		transformControls.setTranslationSnap( dist );

	} );

	signals.spaceChanged.add( function ( space ) {

		transformControls.setSpace( space );

	} );



	signals.rendererChanged.add( function ( newRenderer ) {

		if ( renderer !== null ) {

			container.dom.removeChild( renderer.domElement );

		}

		renderer = newRenderer;

		renderer.autoClear = false;
		renderer.autoUpdateScene = false;
		renderer.setClearColor( clearColor );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		container.dom.appendChild( renderer.domElement );

		render();

	} );

	signals.sceneGraphChanged.add( function () {

		render();

	} );

	var saveTimeout;

	signals.cameraChanged.add( function () {

		render();

	} );

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		transformControls.detach();

		if ( object !== null ) {

			if ( object.geometry !== undefined &&
				 object instanceof THREE.Sprite === false ) {

				selectionBox.update( object );
				selectionBox.visible = true;

			}

			transformControls.attach( object );

		}

		render();

	} );

	signals.objectFocused.add( function ( object ) {

		controls.focus( object );

	} );

	signals.geometryChanged.add( function ( geometry ) {

		selectionBox.update( editor.selected );

		render();

	} );

	signals.objectAdded.add( function ( object ) {

		var materialsNeedUpdate = false;

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

			objects.push( child );

		} );

		if ( materialsNeedUpdate === true ) updateMaterials();

	} );

	signals.objectChanged.add( function ( object ) {

		selectionBox.update( object );
		transformControls.update();

		if ( object instanceof THREE.PerspectiveCamera ) {

			object.updateProjectionMatrix();

		}

		if ( editor.helpers[ object.id ] !== undefined ) {

			editor.helpers[ object.id ].update();

		}

		render();

	} );

	signals.objectRemoved.add( function ( object ) {

		var materialsNeedUpdate = false;

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

			objects.splice( objects.indexOf( child ), 1 );

		} );

		if ( materialsNeedUpdate === true ) updateMaterials();

	} );

	signals.helperAdded.add( function ( object ) {

		objects.push( object.getObjectByName( 'picker' ) );

	} );

	signals.helperRemoved.add( function ( object ) {

		objects.splice( objects.indexOf( object.getObjectByName( 'picker' ) ), 1 );

	} );

	signals.materialChanged.add( function ( material ) {

		render();

	} );

	signals.fogTypeChanged.add( function ( fogType ) {

		if ( fogType !== oldFogType ) {

			if ( fogType === "None" ) {

				scene.fog = null;

			} else if ( fogType === "Fog" ) {

				scene.fog = new THREE.Fog( oldFogColor, oldFogNear, oldFogFar );

			} else if ( fogType === "FogExp2" ) {

				scene.fog = new THREE.FogExp2( oldFogColor, oldFogDensity );

			}

			updateMaterials();

			oldFogType = fogType;

		}

		render();

	} );

	//@elephantatwork, changeable bgColor
	signals.bgColorChanged.add(function ( bgColor ) {

		renderer.setClearColor( bgColor, 1 );
		editor.config.setKey( 'backgroundColor', bgColor);

		render();

	} );

	signals.fogColorChanged.add( function ( fogColor ) {

		oldFogColor = fogColor;

		updateFog( scene );

		render();

	} );

	signals.fogParametersChanged.add( function ( near, far, density ) {

		oldFogNear = near;
		oldFogFar = far;
		oldFogDensity = density;

		updateFog( scene );

		render();

	} );

	signals.windowResize.add( function () {

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();

	} );

	signals.showGridChanged.add( function ( showGrid ) {

		grid.visible = showGrid;
		render();

	} );

	signals.showManChanged.add( function ( showMan ) {

		vrHuman.visible = showMan;
		render();

	} );

	//

	var renderer = null;

	animate();

	//

	function updateMaterials() {

		editor.scene.traverse( function ( node ) {

			if ( node.material ) {

				node.material.needsUpdate = true;

				if ( node.material instanceof THREE.MeshFaceMaterial ) {

					for ( var i = 0; i < node.material.materials.length; i ++ ) {

						node.material.materials[ i ].needsUpdate = true;

					}

				}

			}

		} );

	}

	function updateFog( root ) {

		if ( root.fog ) {

			root.fog.color.setHex( oldFogColor );

			if ( root.fog.near !== undefined ) root.fog.near = oldFogNear;
			if ( root.fog.far !== undefined ) root.fog.far = oldFogFar;
			if ( root.fog.density !== undefined ) root.fog.density = oldFogDensity;

		}

	}

	function animate() {

		requestAnimationFrame( animate );

		// animations

		// editor.storage.size();

		if ( THREE.AnimationHandler.animations.length > 0 ) {

			THREE.AnimationHandler.update( 0.016 );

			for ( var i = 0, l = sceneHelpers.children.length; i < l; i ++ ) {

				var helper = sceneHelpers.children[ i ];

				if ( helper instanceof THREE.SkeletonHelper ) {

					helper.update();

				}

			}

			render();

		}

	}

	function render() {

		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();

		renderer.clear();
		renderer.render( scene, camera );

		if ( renderer instanceof THREE.RaytracingRenderer === false ) {

			renderer.render( sceneHelpers, camera );

		}

	}

	return container;

}

// File:editor/js/Viewport.Info.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Viewport.Info = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'info' );
	container.setPosition( 'absolute' );
	container.setLeft( '10px' );
	container.setBottom( '10px' );
	container.setFontSize( '12px' );
	container.setColor( '#fff' );

	var objectsText = new UI.Text( '0' ).setMarginLeft( '6px' );
	var verticesText = new UI.Text( '0' ).setMarginLeft( '6px' );
	var trianglesText = new UI.Text( '0' ).setMarginLeft( '6px' );

	container.add( new UI.Text( 'objects' ), objectsText, new UI.Break() );
	container.add( new UI.Text( 'vertices' ), verticesText, new UI.Break() );
	container.add( new UI.Text( 'triangles' ), trianglesText, new UI.Break() );

	signals.objectAdded.add( update );
	signals.objectRemoved.add( update );
	signals.geometryChanged.add( update );

	//

	function update() {

		var scene = editor.scene;

		var objects = 0, vertices = 0, triangles = 0;

		for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

			var object = scene.children[ i ];

			object.traverseVisible( function ( object ) {

				objects ++;

				if ( object instanceof THREE.Mesh ) {

					var geometry = object.geometry;

					if ( geometry instanceof THREE.Geometry ) {

						vertices += geometry.vertices.length;
						triangles += geometry.faces.length;

					} else if ( geometry instanceof THREE.BufferGeometry ) {

						if ( geometry.index !== null ) {

							vertices += geometry.index.count * 3;
							triangles += geometry.index.count;

						} else {

							vertices += geometry.attributes.position.count;
							triangles += geometry.attributes.position.count / 3;

						}

					}

				}

			} );

		}

		objectsText.setValue( objects.format() );
		verticesText.setValue( vertices.format() );
		trianglesText.setValue( triangles.format() );

	}

	return container;

}

// File:editor/js/EditorShortCuts.js

/**
 * @author elephantatwork, Samuel Vonäsch
 * keyboard reco code @author Jérome Etienne
 */

var EditorShortCuts = function (editor) {

	this.editor = editor;
	this.shortcuts = this.editor.shortcuts;

	this.domElement = document;
	// to store the current state
	this.keyCodes	= {};
	this.modifiers	= {};
	
	// create callback to bind/unbind keyboard events
	var _this	= this;
	this._onKeyDown	= function(event){ _this._onKeyChange(event)	}
	this._onKeyUp	= function(event){ _this._onKeyChange(event)	}

	// bind keyEvents
	this.domElement.addEventListener("keydown", this._onKeyDown, false);
	this.domElement.addEventListener("keyup", this._onKeyUp, false);

	// create callback to bind/unbind window blur event
	this._onBlur = function(){
		for(var prop in _this.keyCodes)  _this.keyCodes[prop] = false;
		for(var prop in _this.modifiers)  _this.modifiers[prop] = false;
	}

	// bind window blur
	window.addEventListener("blur", this._onBlur, false);

	//export scnee hack
	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link ); // Firefox workaround, see #6594

};

EditorShortCuts.MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];
EditorShortCuts.ALIAS	= {
	'left'		: 37,
	'up'		: 38,
	'right'		: 39,
	'down'		: 40,
	'space'		: 32,
	'pageup'	: 33,
	'pagedown'	: 34,
	'tab'		: 9,
	'escape'	: 27,
	'num1'		: 97,
	'num2'		: 98,
	'num3'		: 99,
	'num4'		: 100,
	'num5'		: 101,
	'num6'		: 102,
	'num7'		: 103,
	'num8'		: 104,
	'num9'		: 105,
	'num0'		: 96

};

EditorShortCuts.prototype = {


	keyCheck: function( keyCode ){

		//File
		if( this.pressed(this.shortcuts.getKey('file/exportscene' ))) {

			var output = this.editor.scene.toJSON();
			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

			exportString( output, 'scene.json' );;

		}
		


		//History
		//Undo
		if( this.pressed(this.shortcuts.getKey('history/undo' ))) this.editor.history.undo();

		//Redo
		if( this.pressed(this.shortcuts.getKey('history/redo' ))) this.editor.history.redo();


		//Transform
		//Translate
		if( this.pressed(this.shortcuts.getKey('transform/move' ))) this.editor.signals.transformModeChanged.dispatch( 'translate' );

		//Rotate
		if( this.pressed(this.shortcuts.getKey('transform/rotate' ))) this.editor.signals.transformModeChanged.dispatch( 'rotate' );

		//Sccale
		if( this.pressed(this.shortcuts.getKey('transform/scale' ))) this.editor.signals.transformModeChanged.dispatch( 'scale' );

		//Delete Shortcut -HHACK IT ATM
		if( event.keyCode == 88 ) {
			this.editor.destoryCurrent();
		}

		//Clone Object
		if( this.pressed(this.shortcuts.getKey( 'edit/clone' ))) this.editor.cloneObject();

		//Hide Current
		if( this.pressed(this.shortcuts.getKey( 'view/hide' ))) this.editor.hide();

		//Unhide all
		if( this.pressed(this.shortcuts.getKey( 'view/unhideAll' ))) this.editor.unhideAll();

		//Isolate - toggle
		if( this.pressed(this.shortcuts.getKey( 'view/isolate' ))) this.editor.isolate();

		//Focus object
		if( this.pressed(this.shortcuts.getKey( 'view/focus' ))) this.editor.focus(this.editor.selected);

		// //Camera Positions - Hack Style
		// if(keyboard.pressed("7")) this.editor.signals.cameraPositionSnap.dispatch( 'top' );
		// if(keyboard.pressed("3")) this.editor.signals.cameraPositionSnap.dispatch( 'left' );
		// if(keyboard.pressed("1")) this.editor.signals.cameraPositionSnap.dispatch( 'front' );

		// if(keyboard.pressed("alt+7")) this.editor.signals.cameraPositionSnap.dispatch( 'bottom' );
		// if(keyboard.pressed("alt+3")) this.editor.signals.cameraPositionSnap.dispatch( 'right' );
		// if(keyboard.pressed("alt+1")) this.editor.signals.cameraPositionSnap.dispatch( 'back' );

		//Camera Positions - Hack Style
		if( this.pressed(this.shortcuts.getKey( 'camera/top' ))) this.editor.signals.cameraPositionSnap.dispatch( 'top' );
		if( this.pressed(this.shortcuts.getKey( 'camera/left' ))) this.editor.signals.cameraPositionSnap.dispatch( 'left' );
		if( this.pressed(this.shortcuts.getKey( 'camera/front' ))) this.editor.signals.cameraPositionSnap.dispatch( 'front' );

		if( this.pressed("alt+"+this.shortcuts.getKey( 'camera/top' ))) this.editor.signals.cameraPositionSnap.dispatch( 'bottom' );
		if( this.pressed("alt+"+this.shortcuts.getKey( 'camera/left' ))) this.editor.signals.cameraPositionSnap.dispatch( 'right' );
		if( this.pressed("alt+"+this.shortcuts.getKey( 'camera/front' ))) this.editor.signals.cameraPositionSnap.dispatch( 'back' );

	},

	exportString: function ( output, filename ) {

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		link.href = objectURL;
		link.download = filename || 'data.json';
		link.target = '_blank';

		var event = document.createEvent("MouseEvents");
		event.initMouseEvent(
			"click", true, false, window, 0, 0, 0, 0, 0
			, false, false, false, false, 0, null
		);
		link.dispatchEvent(event);
	},

	/**
	* To stop listening of the keyboard events
	*/
	destroy: function(){
		// unbind keyEvents
		this.domElement.removeEventListener("keydown", this._onKeyDown, false);
		this.domElement.removeEventListener("keyup", this._onKeyUp, false);

		// unbind window blur event
		window.removeEventListener("blur", this._onBlur, false);
	},

	/**
	 * to process the keyboard dom event
	*/
	_onKeyChange: function( event ){
		// log to debug
		// console.log("onKeyChange", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey);

		// update this.keyCodes
		var keyCode		= event.keyCode
		var pressed		= event.type === 'keydown' ? true : false
		this.keyCodes[keyCode]	= pressed
		// update this.modifiers
		this.modifiers['shift']	= event.shiftKey
		this.modifiers['ctrl']	= event.ctrlKey
		this.modifiers['alt']	= event.altKey
		this.modifiers['meta']	= event.metaKey
	},

	/**
	 * query keyboard state to know if a key is pressed of not
	 *
	 * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
	 * @returns {Boolean} true if the key is pressed, false otherwise
	*/
	pressed: function(keyDesc){
		// console.log(keyDesc);
		var keys	= keyDesc.split("+");
		for(var i = 0; i < keys.length; i++){
			var key		= keys[i]
			var pressed	= false
			if( EditorShortCuts.MODIFIERS.indexOf( key ) !== -1 ){
				pressed	= this.modifiers[key];
			}else if( Object.keys(EditorShortCuts.ALIAS).indexOf( key ) != -1 ){
				pressed	= this.keyCodes[ EditorShortCuts.ALIAS[key] ];
			}else {
				pressed	= this.keyCodes[key.toUpperCase().charCodeAt(0)]
			}
			if( !pressed)	return false;
		};
		return true;
	},

	/**
	 * return true if an event match a keyDesc
	 * @param  {KeyboardEvent} event   keyboard event
	 * @param  {String} keyDesc string description of the key
	 * @return {Boolean}         true if the event match keyDesc, false otherwise
	 */
	eventMatches: function( event, keyDesc ) {

		var aliases	= THREEx.KeyboardState.ALIAS
		var aliasKeys	= Object.keys(aliases)
		var keys	= keyDesc.split("+")
		// log to debug
		// console.log("eventMatches", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
		for(var i = 0; i < keys.length; i++){
			var key		= keys[i];
			var pressed	= false;
			if( key === 'shift' ){
				pressed	= (event.shiftKey	? true : false)
			}else if( key === 'ctrl' ){
				pressed	= (event.ctrlKey	? true : false)
			}else if( key === 'alt' ){
				pressed	= (event.altKey		? true : false)
			}else if( key === 'meta' ){
				pressed	= (event.metaKey	? true : false)
			}else if( aliasKeys.indexOf( key ) !== -1 ){
				pressed	= (event.keyCode === aliases[key] ? true : false);
			}else if( event.keyCode === key.toUpperCase().charCodeAt(0) ){
				pressed	= true;
			}

			if( !pressed )	return false;
		}

		return true;
	}

}


// File:editor/js/EditorShortCutsList.js

/**
 * @author elephantatWork, Samuel Vonäsch
 */

var EditorShortCutsList = function () {

	var name = 'threejs-editor-shortcuts';

	var storage = {

		'file/exportscene':"ctrl+e",

		'history/undo':"ctrl+z",
		'history/redo':"ctrl+y",

		'transform/move':'g',
		'transform/rotate':'r',
		'transform/scale':'s',

		'edit/clone':'shift+D',
		'edit/duplicate':'',
		'edit/delete':'x',

		'view/hide':'h',
		'view/unhideAll':'alt+h',
		'view/isolate':'i',
		'view/focus':'f',
		'view/showgrid':'space',

		'camera/front':'1',
		'camera/left':'3',
		'camera/top':'7',
	};

	if ( window.localStorage[ name ] === undefined ) {

		window.localStorage[ name ] = JSON.stringify( storage );

	} else {

		var data = JSON.parse( window.localStorage[ name ] );

		for ( var key in data ) {

			storage[ key ] = data[ key ];

		}

	}

	return {

		getKey: function ( key ) {

			return storage[ key ];

		},

		setKey: function () { // key, value, key, value ...

			for ( var i = 0, l = arguments.length; i < l; i += 2 ) {

				storage[ arguments[ i ] ] = arguments[ i + 1 ];

			}

			window.localStorage[ name ] = JSON.stringify( storage );
 
			console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Saved config to shortcuts.' );

		},

		clear: function () {

			delete window.localStorage[ name ];

		}

	}

};

// File:editor/js/Menubar.Light.js

/**
 * @author elephantatwork, Samuel Vonäsch
 */

Menubar.Light = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Light' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	var lightCount = 0;
	// var cameraCount = 0;

	editor.signals.editorCleared.add( function () {

		// meshCount = 0;
		lightCount = 0;
		// cameraCount = 0;

	} );

	// PointLight

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'PointLight' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;

		var light = new THREE.PointLight( color, intensity, distance );
		light.name = 'PointLight ' + ( ++ lightCount );

		editor.addObject( light );
		editor.select( light );

	} );
	options.add( option );

	// // SpotLight

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'SpotLight' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;
		var angle = Math.PI * 0.1;
		var exponent = 10;

		var light = new THREE.SpotLight( color, intensity, distance, angle, exponent );
		light.name = 'SpotLight ' + ( ++ lightCount );

		//Add a target
		var size = 100;

		var segements = 1;

		var geometry = new THREE.BoxGeometry( size, size, size, segements, segements, segements );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'SpotLight ' + ( lightCount ) + ' Target';

		editor.addObject( mesh );

		light.target = mesh;


		light.position.set( 0.5, 1, 0.75 ).multiplyScalar( 200 );

		editor.addObject( light );
		editor.select( light );

	} );
	options.add( option );

	// DirectionalLight

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'DirectionalLight' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;

		var light = new THREE.DirectionalLight( color, intensity );
		light.name = 'DirectionalLight ' + ( ++ lightCount );
		light.target.name = 'DirectionalLight ' + ( lightCount ) + ' Target';

		light.position.set( 0.5, 1, 0.75 ).multiplyScalar( 200 );

		editor.addObject( light );
		editor.select( light );

	} );
	options.add( option );

	// HemisphereLight

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'HemisphereLight' );
	option.onClick( function () {

		var skyColor = 0x00aaff;
		var groundColor = 0xffaa00;
		var intensity = 1;

		var light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		light.name = 'HemisphereLight ' + ( ++ lightCount );

		light.position.set( 0.5, 1, 0.75 ).multiplyScalar( 200 );

		editor.addObject( light );
		editor.select( light );

	} );
	options.add( option );

	// AmbientLight

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'AmbientLight' );
	option.onClick( function() {

		var color = 0x222222;

		var light = new THREE.AmbientLight( color );
		light.name = 'AmbientLight ' + ( ++ lightCount );

		editor.addObject( light );
		editor.select( light );

	} );
	options.add( option );

	return container;
};

// File:editor/js/Menubar.Navigation.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Navigation = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Navigation' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	//Need a huge overhaul
	// SphereTarget
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'MoveTo' );
	option.onClick( function () {

		var radius = 15;
		var widthSegments = 10;
		var heightSegments = 10;
		var phiStart = 0;
		var phiLength = Math.PI * 2;
		var thetaStart = 0;
		var thetaLength = Math.PI;

		var geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial({transparent: true, depthTest: false, depthWrite: false, needsUpdate: true}) );

		mesh.name = 'MoveTo_name';

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	//Plane Pointer
	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'JumpTo' );
	option.onClick( function () {

		// ParentGroup
		var parent = new THREE.Group();
		parent.name = 'JumpToPair ';

		editor.addObject( parent );

		var width = 100;
		var height = 100;

		var widthSegments = 1;
		var heightSegments = 1;

		var geometry = new THREE.PlaneGeometry( width, height, widthSegments, heightSegments );
		var material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, transparent: true, depthTest: true, depthWrite: true, needsUpdate: true});
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Pointer_name';
		parent.add(mesh); 

		var radius = 15;
		var widthSegments = 10;
		var heightSegments = 10;
		var phiStart = 0;
		var phiLength = Math.PI * 2;
		var thetaStart = 0;
		var thetaLength = Math.PI;

		var geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial({transparent: true, depthTest: true, depthWrite: true, needsUpdate: true}) );
		mesh.name = 'Target_name';
		parent.add(mesh);

		// var helper = new THREE.ArrowHelper( object, 10 );

		editor.addObject( parent );
		editor.select( parent );

	} );
	options.add( option );

	// //Plane Target
	// var option = new UI.Panel();
	// option.setClass( 'option' );
	// option.setTextContent( 'Sphere Target' );
	// option.onClick( function () {

	// 	var radius = 15;
	// 	var widthSegments = 10;
	// 	var heightSegments = 10;
	// 	var phiStart = 0;
	// 	var phiLength = Math.PI * 2;
	// 	var thetaStart = 0;
	// 	var thetaLength = Math.PI;

	// 	var geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );
	// 	var mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial({transparent: true, depthTest: true, depthWrite: true, needsUpdate: true}) );

	// 	mesh.name = 'Target_name';

	// 	editor.addObject( mesh );
	// 	editor.select( mesh );

	// } );
	// options.add( option );

	return container;

};

// File:editor/js/Sidebar.Sounds.js

Sidebar.Sounds = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setDisplay( 'none' );
	//container.dom.classList.add( 'Material' );

	container.add( new UI.Text( 'SOUNDS' ) );
	container.add( new UI.Break(), new UI.Break() );

	// constant sound

	var soundsConstantRow = new UI.Panel();
	var soundsConstant = new UI.Sound().onChange( function( event ) {
		
		if ( event.buffer ) {
			
			if ( editor.config.getKey('defaultColor') == 'RMS' ) {
			
				editor.signals.soundAdded.dispatch( event.buffer, editor.selected.material );
				
			}
			
		}
		
		update();
		
	} );

	soundsConstantRow.add( new UI.Text( 'Constant' ).setWidth( '90px' ) );
	soundsConstantRow.add( soundsConstant );

	container.add( soundsConstantRow );


	var playButton = new UI.Button( 'Play' );
	playButton.onClick( function () {

		editor.selected.sounds.play();		

	} );

	container.add( playButton );

	//

	function update() {
		
		if (editor.selected.sounds == undefined) editor.selected.sounds = {};
		
		var sounds = editor.selected.sounds;
		
		sounds.constant = soundsConstant.getValue();

		updateRows();

	};

	function updateRows() {
	
		/*var properties = {
			'constant': physicsFriction,
			'restitution': physicsRestitution,
			'massmodifier': physicsMassmodifier
		};

		var physics = editor.selected.material._physijs;
		console.log(editor.selected);

		for ( var property in properties ) {
		
			//properties[ property ].setDisplay( physics[ property ] !== undefined ? '' : 'none' );

		}*/

	};

	// events

	signals.objectSelected.add( function ( object ) {

		if ( object ) {

			container.setDisplay( '' );
			
			if ( !object.sounds ) object.sounds = {};

			var sounds = object.sounds;
			
			soundsConstant.setValue( sounds.constant );

			updateRows();

		} else {

			container.setDisplay( 'none' );

		}

	} );

	return container;

}

// File:editor/js/SoundCollection.js

/**
* Class for creating an artwork cluster in space
**/
var SoundCollection = function(options){
		
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    this._context = new AudioContext();
    this._loaderContext = new OfflineAudioContext(2, 1024, 44100); //22050 to 96000, CD = 44100
		
    this._listenerUpdater = new WebAudiox.ListenerObject3DUpdater(this._context, options.cam);
		
		
    // Create lineOut
    this._lineOut = new WebAudiox.LineOut(this._context);
    this._lineOut.volume = 1;
};
	
SoundCollection.prototype = {
	//class options, set by the constructer or left default
	options: {
		cam: undefined
	},
	
	_soundCollection: {
		soundUrl: [],
		//panner: [],
		pannerUpdaters: [],
		buffer: [],
		source: [] //optional, filled when the sound is currently playing
	},
	
    /**
     * Adds a sound to the collection
     * @param sound The sound url
     */
	add: function(sound, position, callback) {
		var soundListIndex = this._findEmptySpotInSoundList();
		//reserve spot so no overwrites will happen
		if (soundListIndex != -1) this._soundCollection.soundUrl[soundListIndex] = 'reserved';
		
		WebAudiox.loadBuffer(this._loaderContext, sound, function(buffer){
			/*var destination	= this._lineOut.destination;

			// init AudioPannerNode
			var panner	= this._context.createPanner();
			panner.connect(destination);
			//panner.setPosition(position.x, position.y, position.z);
			panner.position = position;
			destination	= panner;*/
			
			if (soundListIndex == -1) {
				soundListIndex = this._soundCollection.soundUrl.push( sound ) - 1;
				//this._soundCollection.panner.push( panner );
				this._soundCollection.buffer.push( buffer );
			} else {
				this._soundCollection.soundUrl[soundListIndex] = sound;
				//this._soundCollection.panner[soundListIndex] = panner;
				this._soundCollection.buffer[soundListIndex] = buffer;
			}
			
			if (callback) callback(buffer);
			
		}.bind(this));
	},
	
	remove: function(sound) {
		var index = this._getSoundIndex(sound);
		if (index != -1) {
			this.stop(sound);
			delete this._soundCollection.soundUrl[index];
			delete this._soundCollection.panner[index];
			delete this._soundCollection.buffer[index];
			delete this._soundCollection.source[index];
		}
	},
	
	play: function(sound /* Can be URL, panner or source */, object3d, offset, endedCallback) {
		var playInitialized = 0;
		if (sound) {
			playInitialized++;
			var soundIndex = this._getSoundIndex(sound);
			if (soundIndex != -1) {
				playInitialized++;
				var buffer = this._soundCollection.buffer[soundIndex];
				if (buffer != undefined) {
					//loaded the sound source, start playing
					
					// init AudioBufferSourceNode
					var source = this._context.createBufferSource();
					source.buffer = buffer;
					source.loop	= true;
					source.connect(this._lineOut.destination);
					if (endedCallback) source.onended = endedCallback;
					
					//stop the playback after 5 loops
					setTimeout(function() {
						if (this.playbackState == 1 || this.playbackState == 2) {
							this.stop();
						}
					}.bind(source), source.buffer.duration * 1000 * 5);
					
					source.start(0, offset|0);
					
					this._soundCollection.source[soundIndex] = source;
					playInitialized++;
				} else {
					console.log('source', source);
				}
			}
		}
		if (playInitialized < 3) {
			console.log('play but not play', playInitialized, sound);
		} else {
			return true;
		}
		return false;
	},
	
	addAudioPannerToMesh: function(object3d) {
        var panner	= this._context.createPanner();
        // panner.coneOuterGain	= 0.1
        // panner.coneOuterAngle	= Math.PI *180/Math.PI
        // panner.coneInnerAngle	= 0 *180/Math.PI
		
		// init AudioPannerNode
		panner.connect(this._lineOut.destination);

        var pannerUpdater	= new WebAudiox.PannerObject3DUpdater(panner, object3d);
        this._soundCollection.pannerUpdaters.push(pannerUpdater);
        object3d._panner = panner;
		object3d._pannerUpdater = pannerUpdater;
    },
	
    playAttachedSound: function(sound, object3d) {
        var panner = object3d._panner;
        if (!panner) {
            this.addAudioPannerToMesh(object3d);
            panner = object3d._panner;
        }
        var index = this._getSoundIndex(sound);
        if (index != -1 && panner) {
			var buffer = this._soundCollection.buffer[index];
			if (buffer != undefined) {
			
				var source = this._context.createBufferSource();
				source.buffer = buffer;
				source.loop	= true;
				source.connect(panner);
				
				this._soundCollection.source[index] = source;
				source.start(0);
				
			}
        } else {
            console.log('can\'t play sound ' + sound, index, panner);
        }
    },
	
	/* play a sound collection, make sure every sound is loaded before */
	playCollection: function(indexes) {
		//TODO: Positions to indexes, timeouts to onload.
		var self = this;
		
		var bufferResult = this._gatherPositionBuffers(
			indexes,
			[], 
			function(positionBuffers) {
				var x = 0;
				var playBuffer = function () {
					console.log('playBuffer', x);
					var source = self._context.createBufferSource();
					source.buffer = positionBuffers[x];
					x++;
					source.loop	= false;
					source.connect(self._lineOut.destination);
					//console.log('duration', source, source.buffer.duration * 1000);
					//source.onended = playBuffer;
					if (x < positionBuffers.length) setTimeout(playBuffer.bind(this), source.buffer.duration * 1000);
					
					source.start(0);
					
					//this._soundCollection.source[soundIndex] = source;
				};
				
				if (x < positionBuffers.length) playBuffer();
			},
			function(positionBuffers) {
				console.log('unable to load play collection', positionBuffers); 
			}
		);
		
		//gathering failed, invalid indexes
		if (bufferResult == false) return false;
	},
	
	stop: function(sound /* Can be URL, panner or source */, deleteAudioBufferSource) {
		if (sound) {
			var soundIndex = this._getSoundIndex(sound);
			if (soundIndex != -1) {
				var source = this._soundCollection.source[soundIndex];
				if (source != undefined && (source.playbackState == 1 || source.playbackState == 2)) {
					//loaded the sound source, stop it IF it is playing
					source.stop();
					if (deleteAudioBufferSource) this._soundCollection.source[soundIndex] = undefined;
				}
			}
		}
	},
	
	_getSoundIndex: function(sound) {
		var soundIndex = -1;
		//figure out index
		if (sound) {
		    if (typeof (sound) == 'string' || sound instanceof Blob) {
				soundIndex = this._soundCollection.soundUrl.indexOf(sound);
			} else if (sound instanceof THREE.Vector3) {
				for (var x = 0; x < this._soundCollection.panner.length; x++) {
					if (this._soundCollection.panner[x] && this._soundCollection.panner[x].position.distanceTo(sound) < 0.001) {
						soundIndex = x;
						break;
					}
				}
			} else if (sound instanceof AudioBufferSourceNode) {
				soundIndex = this._soundCollection.source.indexOf(sound);
			}
		}
		if (soundIndex == -1) {
			//console.log('-1!', sound);
		}
		return soundIndex
	},
	
	_findEmptySpotInSoundList: function() {
		for (var x = 0; x < this._soundCollection.soundUrl.length; x++) {
			if (this._soundCollection.soundUrl[x] == undefined) return x;
		}
		return -1;
	},
	
	_update: function(delta, now) {
		this._listenerUpdater.update(delta, now);

        for (var x = 0; x < this._soundCollection.pannerUpdaters.length; x++) {
            this._soundCollection.pannerUpdaters[x].update(delta, now);
        }
	},
	
	_gatherPositionBuffers: function(indexes, positionBuffers, successCallback, errorCallback, tryCount, positions) {
		if (!tryCount) tryCount = 1;
		if (!positions) positions = focusedArtCluster.getPointsByIndexes(indexes);
	
		for (var x = 0; x < indexes.length; x++) {
			console.log('try', tryCount, 'positionBuffer is', positionBuffers[x], 'position', indexes[x]);
			if (positionBuffers[x]) continue;
			if (!indexes[x] || !positions[x]) return false;
			
			var soundIndex = this._getSoundIndex(positions[x]);
			if (soundIndex != -1) {
				var buffer = this._soundCollection.buffer[soundIndex];
				if (buffer != undefined) {
					//loaded the sound source, add it to buffers
					positionBuffers[x] = buffer;
				}
			} else {
				//-1 = sound neither added nor loaded.
				//initiate buffer loading
				//this.add('sounds/sound' + (indexes[x] % 7) + '.ogg', positions[x]);
				this.add('sounds/usage permitted only with a contimbre.com license ' + soundList[(indexes[x] % soundList.length)][0] + '.ogg', positions[x]);
			}
		}
		
		//do we have all buffers loaded?
		var allLoaded = true;
		for (var y = 0; y < indexes.length; y++) {
			if (!positionBuffers[y]) {
				//if not, set a new timeout with another call/check to see if all are loaded
				setTimeout(function() {
					if (tryCount < 5) this._gatherPositionBuffers(indexes, positionBuffers, successCallback, errorCallback, tryCount, positions);
				}.bind(this), 200);
				allLoaded = false;
				break;
			}
		}
		
		tryCount++;
		
		if (allLoaded && successCallback) successCallback(positionBuffers);
		else if (tryCount >= 5 && !allLoaded && errorCallback) errorCallback(positionBuffers);
	}
};
// File:editor/fonts/helvetiker_regular.typeface.js

if (_typeface_js && _typeface_js.loadFace) _typeface_js.loadFace({"glyphs":{"ο":{"x_min":0,"x_max":712,"ha":815,"o":"m 356 -25 q 96 88 192 -25 q 0 368 0 201 q 92 642 0 533 q 356 761 192 761 q 617 644 517 761 q 712 368 712 533 q 619 91 712 201 q 356 -25 520 -25 m 356 85 q 527 175 465 85 q 583 369 583 255 q 528 562 583 484 q 356 651 466 651 q 189 560 250 651 q 135 369 135 481 q 187 177 135 257 q 356 85 250 85 "},"S":{"x_min":0,"x_max":788,"ha":890,"o":"m 788 291 q 662 54 788 144 q 397 -26 550 -26 q 116 68 226 -26 q 0 337 0 168 l 131 337 q 200 152 131 220 q 384 85 269 85 q 557 129 479 85 q 650 270 650 183 q 490 429 650 379 q 194 513 341 470 q 33 739 33 584 q 142 964 33 881 q 388 1041 242 1041 q 644 957 543 1041 q 756 716 756 867 l 625 716 q 561 874 625 816 q 395 933 497 933 q 243 891 309 933 q 164 759 164 841 q 325 609 164 656 q 625 526 475 568 q 788 291 788 454 "},"¦":{"x_min":343,"x_max":449,"ha":792,"o":"m 449 462 l 343 462 l 343 986 l 449 986 l 449 462 m 449 -242 l 343 -242 l 343 280 l 449 280 l 449 -242 "},"/":{"x_min":183.25,"x_max":608.328125,"ha":792,"o":"m 608 1041 l 266 -129 l 183 -129 l 520 1041 l 608 1041 "},"Τ":{"x_min":-0.4375,"x_max":777.453125,"ha":839,"o":"m 777 893 l 458 893 l 458 0 l 319 0 l 319 892 l 0 892 l 0 1013 l 777 1013 l 777 893 "},"y":{"x_min":0,"x_max":684.78125,"ha":771,"o":"m 684 738 l 388 -83 q 311 -216 356 -167 q 173 -279 252 -279 q 97 -266 133 -279 l 97 -149 q 132 -155 109 -151 q 168 -160 155 -160 q 240 -114 213 -160 q 274 -26 248 -98 l 0 738 l 137 737 l 341 139 l 548 737 l 684 738 "},"Π":{"x_min":0,"x_max":803,"ha":917,"o":"m 803 0 l 667 0 l 667 886 l 140 886 l 140 0 l 0 0 l 0 1012 l 803 1012 l 803 0 "},"ΐ":{"x_min":-111,"x_max":339,"ha":361,"o":"m 339 800 l 229 800 l 229 925 l 339 925 l 339 800 m -1 800 l -111 800 l -111 925 l -1 925 l -1 800 m 284 3 q 233 -10 258 -5 q 182 -15 207 -15 q 85 26 119 -15 q 42 200 42 79 l 42 737 l 167 737 l 168 215 q 172 141 168 157 q 226 101 183 101 q 248 103 239 101 q 284 112 257 104 l 284 3 m 302 1040 l 113 819 l 30 819 l 165 1040 l 302 1040 "},"g":{"x_min":0,"x_max":686,"ha":838,"o":"m 686 34 q 586 -213 686 -121 q 331 -306 487 -306 q 131 -252 216 -306 q 31 -84 31 -190 l 155 -84 q 228 -174 166 -138 q 345 -207 284 -207 q 514 -109 454 -207 q 564 89 564 -27 q 461 6 521 36 q 335 -23 401 -23 q 88 100 184 -23 q 0 370 0 215 q 87 634 0 522 q 330 758 183 758 q 457 728 398 758 q 564 644 515 699 l 564 737 l 686 737 l 686 34 m 582 367 q 529 560 582 481 q 358 652 468 652 q 189 561 250 652 q 135 369 135 482 q 189 176 135 255 q 361 85 251 85 q 529 176 468 85 q 582 367 582 255 "},"²":{"x_min":0,"x_max":442,"ha":539,"o":"m 442 383 l 0 383 q 91 566 0 492 q 260 668 176 617 q 354 798 354 727 q 315 875 354 845 q 227 905 277 905 q 136 869 173 905 q 99 761 99 833 l 14 761 q 82 922 14 864 q 232 974 141 974 q 379 926 316 974 q 442 797 442 878 q 351 635 442 704 q 183 539 321 611 q 92 455 92 491 l 442 455 l 442 383 "},"–":{"x_min":0,"x_max":705.5625,"ha":803,"o":"m 705 334 l 0 334 l 0 410 l 705 410 l 705 334 "},"Κ":{"x_min":0,"x_max":819.5625,"ha":893,"o":"m 819 0 l 650 0 l 294 509 l 139 356 l 139 0 l 0 0 l 0 1013 l 139 1013 l 139 526 l 626 1013 l 809 1013 l 395 600 l 819 0 "},"ƒ":{"x_min":-46.265625,"x_max":392,"ha":513,"o":"m 392 651 l 259 651 l 79 -279 l -46 -278 l 134 651 l 14 651 l 14 751 l 135 751 q 151 948 135 900 q 304 1041 185 1041 q 334 1040 319 1041 q 392 1034 348 1039 l 392 922 q 337 931 360 931 q 271 883 287 931 q 260 793 260 853 l 260 751 l 392 751 l 392 651 "},"e":{"x_min":0,"x_max":714,"ha":813,"o":"m 714 326 l 140 326 q 200 157 140 227 q 359 87 260 87 q 488 130 431 87 q 561 245 545 174 l 697 245 q 577 48 670 123 q 358 -26 484 -26 q 97 85 195 -26 q 0 363 0 197 q 94 642 0 529 q 358 765 195 765 q 626 627 529 765 q 714 326 714 503 m 576 429 q 507 583 564 522 q 355 650 445 650 q 206 583 266 650 q 140 429 152 522 l 576 429 "},"ό":{"x_min":0,"x_max":712,"ha":815,"o":"m 356 -25 q 94 91 194 -25 q 0 368 0 202 q 92 642 0 533 q 356 761 192 761 q 617 644 517 761 q 712 368 712 533 q 619 91 712 201 q 356 -25 520 -25 m 356 85 q 527 175 465 85 q 583 369 583 255 q 528 562 583 484 q 356 651 466 651 q 189 560 250 651 q 135 369 135 481 q 187 177 135 257 q 356 85 250 85 m 576 1040 l 387 819 l 303 819 l 438 1040 l 576 1040 "},"J":{"x_min":0,"x_max":588,"ha":699,"o":"m 588 279 q 287 -26 588 -26 q 58 73 126 -26 q 0 327 0 158 l 133 327 q 160 172 133 227 q 288 96 198 96 q 426 171 391 96 q 449 336 449 219 l 449 1013 l 588 1013 l 588 279 "},"»":{"x_min":-1,"x_max":503,"ha":601,"o":"m 503 302 l 280 136 l 281 256 l 429 373 l 281 486 l 280 608 l 503 440 l 503 302 m 221 302 l 0 136 l 0 255 l 145 372 l 0 486 l -1 608 l 221 440 l 221 302 "},"©":{"x_min":-3,"x_max":1008,"ha":1106,"o":"m 502 -7 q 123 151 263 -7 q -3 501 -3 294 q 123 851 -3 706 q 502 1011 263 1011 q 881 851 739 1011 q 1008 501 1008 708 q 883 151 1008 292 q 502 -7 744 -7 m 502 60 q 830 197 709 60 q 940 501 940 322 q 831 805 940 681 q 502 944 709 944 q 174 805 296 944 q 65 501 65 680 q 173 197 65 320 q 502 60 294 60 m 741 394 q 661 246 731 302 q 496 190 591 190 q 294 285 369 190 q 228 497 228 370 q 295 714 228 625 q 499 813 370 813 q 656 762 588 813 q 733 625 724 711 l 634 625 q 589 704 629 673 q 498 735 550 735 q 377 666 421 735 q 334 504 334 597 q 374 340 334 408 q 490 272 415 272 q 589 304 549 272 q 638 394 628 337 l 741 394 "},"ώ":{"x_min":0,"x_max":922,"ha":1030,"o":"m 687 1040 l 498 819 l 415 819 l 549 1040 l 687 1040 m 922 339 q 856 97 922 203 q 650 -26 780 -26 q 538 9 587 -26 q 461 103 489 44 q 387 12 436 46 q 277 -22 339 -22 q 69 97 147 -22 q 0 338 0 202 q 45 551 0 444 q 161 737 84 643 l 302 737 q 175 552 219 647 q 124 336 124 446 q 155 179 124 248 q 275 88 197 88 q 375 163 341 88 q 400 294 400 219 l 400 572 l 524 572 l 524 294 q 561 135 524 192 q 643 88 591 88 q 762 182 719 88 q 797 341 797 257 q 745 555 797 450 q 619 737 705 637 l 760 737 q 874 551 835 640 q 922 339 922 444 "},"^":{"x_min":193.0625,"x_max":598.609375,"ha":792,"o":"m 598 772 l 515 772 l 395 931 l 277 772 l 193 772 l 326 1013 l 462 1013 l 598 772 "},"«":{"x_min":0,"x_max":507.203125,"ha":604,"o":"m 506 136 l 284 302 l 284 440 l 506 608 l 507 485 l 360 371 l 506 255 l 506 136 m 222 136 l 0 302 l 0 440 l 222 608 l 221 486 l 73 373 l 222 256 l 222 136 "},"D":{"x_min":0,"x_max":828,"ha":935,"o":"m 389 1013 q 714 867 593 1013 q 828 521 828 729 q 712 161 828 309 q 382 0 587 0 l 0 0 l 0 1013 l 389 1013 m 376 124 q 607 247 523 124 q 681 510 681 355 q 607 771 681 662 q 376 896 522 896 l 139 896 l 139 124 l 376 124 "},"∙":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 585 l 0 585 l 0 738 l 142 738 l 142 585 "},"ÿ":{"x_min":0,"x_max":47,"ha":125,"o":"m 47 3 q 37 -7 47 -7 q 28 0 30 -7 q 39 -4 32 -4 q 45 3 45 -1 l 37 0 q 28 9 28 0 q 39 19 28 19 l 47 16 l 47 19 l 47 3 m 37 1 q 44 8 44 1 q 37 16 44 16 q 30 8 30 16 q 37 1 30 1 m 26 1 l 23 22 l 14 0 l 3 22 l 3 3 l 0 25 l 13 1 l 22 25 l 26 1 "},"w":{"x_min":0,"x_max":1009.71875,"ha":1100,"o":"m 1009 738 l 783 0 l 658 0 l 501 567 l 345 0 l 222 0 l 0 738 l 130 738 l 284 174 l 432 737 l 576 738 l 721 173 l 881 737 l 1009 738 "},"$":{"x_min":0,"x_max":700,"ha":793,"o":"m 664 717 l 542 717 q 490 825 531 785 q 381 872 450 865 l 381 551 q 620 446 540 522 q 700 241 700 370 q 618 45 700 116 q 381 -25 536 -25 l 381 -152 l 307 -152 l 307 -25 q 81 62 162 -25 q 0 297 0 149 l 124 297 q 169 146 124 204 q 307 81 215 89 l 307 441 q 80 536 148 469 q 13 725 13 603 q 96 910 13 839 q 307 982 180 982 l 307 1077 l 381 1077 l 381 982 q 574 917 494 982 q 664 717 664 845 m 307 565 l 307 872 q 187 831 233 872 q 142 724 142 791 q 180 618 142 656 q 307 565 218 580 m 381 76 q 562 237 562 96 q 517 361 562 313 q 381 423 472 409 l 381 76 "},"\\":{"x_min":-0.015625,"x_max":425.0625,"ha":522,"o":"m 425 -129 l 337 -129 l 0 1041 l 83 1041 l 425 -129 "},"µ":{"x_min":0,"x_max":697.21875,"ha":747,"o":"m 697 -4 q 629 -14 658 -14 q 498 97 513 -14 q 422 9 470 41 q 313 -23 374 -23 q 207 4 258 -23 q 119 81 156 32 l 119 -278 l 0 -278 l 0 738 l 124 738 l 124 343 q 165 173 124 246 q 308 83 216 83 q 452 178 402 83 q 493 359 493 255 l 493 738 l 617 738 l 617 214 q 623 136 617 160 q 673 92 637 92 q 697 96 684 92 l 697 -4 "},"Ι":{"x_min":42,"x_max":181,"ha":297,"o":"m 181 0 l 42 0 l 42 1013 l 181 1013 l 181 0 "},"Ύ":{"x_min":0,"x_max":1144.5,"ha":1214,"o":"m 1144 1012 l 807 416 l 807 0 l 667 0 l 667 416 l 325 1012 l 465 1012 l 736 533 l 1004 1012 l 1144 1012 m 277 1040 l 83 799 l 0 799 l 140 1040 l 277 1040 "},"’":{"x_min":0,"x_max":139,"ha":236,"o":"m 139 851 q 102 737 139 784 q 0 669 65 690 l 0 734 q 59 787 42 741 q 72 873 72 821 l 0 873 l 0 1013 l 139 1013 l 139 851 "},"Ν":{"x_min":0,"x_max":801,"ha":915,"o":"m 801 0 l 651 0 l 131 822 l 131 0 l 0 0 l 0 1013 l 151 1013 l 670 191 l 670 1013 l 801 1013 l 801 0 "},"-":{"x_min":8.71875,"x_max":350.390625,"ha":478,"o":"m 350 317 l 8 317 l 8 428 l 350 428 l 350 317 "},"Q":{"x_min":0,"x_max":968,"ha":1072,"o":"m 954 5 l 887 -79 l 744 35 q 622 -11 687 2 q 483 -26 556 -26 q 127 130 262 -26 q 0 504 0 279 q 127 880 0 728 q 484 1041 262 1041 q 841 884 708 1041 q 968 507 968 735 q 933 293 968 398 q 832 104 899 188 l 954 5 m 723 191 q 802 330 777 248 q 828 499 828 412 q 744 790 828 673 q 483 922 650 922 q 228 791 322 922 q 142 505 142 673 q 227 221 142 337 q 487 91 323 91 q 632 123 566 91 l 520 215 l 587 301 l 723 191 "},"ς":{"x_min":1,"x_max":676.28125,"ha":740,"o":"m 676 460 l 551 460 q 498 595 542 546 q 365 651 448 651 q 199 578 263 651 q 136 401 136 505 q 266 178 136 241 q 508 106 387 142 q 640 -50 640 62 q 625 -158 640 -105 q 583 -278 611 -211 l 465 -278 q 498 -182 490 -211 q 515 -80 515 -126 q 381 12 515 -15 q 134 91 197 51 q 1 388 1 179 q 100 651 1 542 q 354 761 199 761 q 587 680 498 761 q 676 460 676 599 "},"M":{"x_min":0,"x_max":954,"ha":1067,"o":"m 954 0 l 819 0 l 819 869 l 537 0 l 405 0 l 128 866 l 128 0 l 0 0 l 0 1013 l 200 1013 l 472 160 l 757 1013 l 954 1013 l 954 0 "},"Ψ":{"x_min":0,"x_max":1006,"ha":1094,"o":"m 1006 678 q 914 319 1006 429 q 571 200 814 200 l 571 0 l 433 0 l 433 200 q 92 319 194 200 q 0 678 0 429 l 0 1013 l 139 1013 l 139 679 q 191 417 139 492 q 433 326 255 326 l 433 1013 l 571 1013 l 571 326 l 580 326 q 813 423 747 326 q 868 679 868 502 l 868 1013 l 1006 1013 l 1006 678 "},"C":{"x_min":0,"x_max":886,"ha":944,"o":"m 886 379 q 760 87 886 201 q 455 -26 634 -26 q 112 136 236 -26 q 0 509 0 283 q 118 882 0 737 q 469 1041 245 1041 q 748 955 630 1041 q 879 708 879 859 l 745 708 q 649 862 724 805 q 473 920 573 920 q 219 791 312 920 q 136 509 136 675 q 217 229 136 344 q 470 99 311 99 q 672 179 591 99 q 753 379 753 259 l 886 379 "},"!":{"x_min":0,"x_max":138,"ha":236,"o":"m 138 684 q 116 409 138 629 q 105 244 105 299 l 33 244 q 16 465 33 313 q 0 684 0 616 l 0 1013 l 138 1013 l 138 684 m 138 0 l 0 0 l 0 151 l 138 151 l 138 0 "},"{":{"x_min":0,"x_max":480.5625,"ha":578,"o":"m 480 -286 q 237 -213 303 -286 q 187 -45 187 -159 q 194 48 187 -15 q 201 141 201 112 q 164 264 201 225 q 0 314 118 314 l 0 417 q 164 471 119 417 q 201 605 201 514 q 199 665 201 644 q 193 772 193 769 q 241 941 193 887 q 480 1015 308 1015 l 480 915 q 336 866 375 915 q 306 742 306 828 q 310 662 306 717 q 314 577 314 606 q 288 452 314 500 q 176 365 256 391 q 289 275 257 337 q 314 143 314 226 q 313 84 314 107 q 310 -11 310 -5 q 339 -131 310 -94 q 480 -182 377 -182 l 480 -286 "},"X":{"x_min":-0.015625,"x_max":854.15625,"ha":940,"o":"m 854 0 l 683 0 l 423 409 l 166 0 l 0 0 l 347 519 l 18 1013 l 186 1013 l 428 637 l 675 1013 l 836 1013 l 504 520 l 854 0 "},"#":{"x_min":0,"x_max":963.890625,"ha":1061,"o":"m 963 690 l 927 590 l 719 590 l 655 410 l 876 410 l 840 310 l 618 310 l 508 -3 l 393 -2 l 506 309 l 329 310 l 215 -2 l 102 -3 l 212 310 l 0 310 l 36 410 l 248 409 l 312 590 l 86 590 l 120 690 l 347 690 l 459 1006 l 573 1006 l 462 690 l 640 690 l 751 1006 l 865 1006 l 754 690 l 963 690 m 606 590 l 425 590 l 362 410 l 543 410 l 606 590 "},"ι":{"x_min":42,"x_max":284,"ha":361,"o":"m 284 3 q 233 -10 258 -5 q 182 -15 207 -15 q 85 26 119 -15 q 42 200 42 79 l 42 738 l 167 738 l 168 215 q 172 141 168 157 q 226 101 183 101 q 248 103 239 101 q 284 112 257 104 l 284 3 "},"Ά":{"x_min":0,"x_max":906.953125,"ha":982,"o":"m 283 1040 l 88 799 l 5 799 l 145 1040 l 283 1040 m 906 0 l 756 0 l 650 303 l 251 303 l 143 0 l 0 0 l 376 1012 l 529 1012 l 906 0 m 609 421 l 452 866 l 293 421 l 609 421 "},")":{"x_min":0,"x_max":318,"ha":415,"o":"m 318 365 q 257 25 318 191 q 87 -290 197 -141 l 0 -290 q 140 21 93 -128 q 193 360 193 189 q 141 704 193 537 q 0 1024 97 850 l 87 1024 q 257 706 197 871 q 318 365 318 542 "},"ε":{"x_min":0,"x_max":634.71875,"ha":714,"o":"m 634 234 q 527 38 634 110 q 300 -25 433 -25 q 98 29 183 -25 q 0 204 0 93 q 37 314 0 265 q 128 390 67 353 q 56 460 82 419 q 26 555 26 505 q 114 712 26 654 q 295 763 191 763 q 499 700 416 763 q 589 515 589 631 l 478 515 q 419 618 464 580 q 307 657 374 657 q 207 630 253 657 q 151 547 151 598 q 238 445 151 469 q 389 434 280 434 l 389 331 l 349 331 q 206 315 255 331 q 125 210 125 287 q 183 107 125 145 q 302 76 233 76 q 436 117 379 76 q 509 234 493 159 l 634 234 "},"Δ":{"x_min":0,"x_max":952.78125,"ha":1028,"o":"m 952 0 l 0 0 l 400 1013 l 551 1013 l 952 0 m 762 124 l 476 867 l 187 124 l 762 124 "},"}":{"x_min":0,"x_max":481,"ha":578,"o":"m 481 314 q 318 262 364 314 q 282 136 282 222 q 284 65 282 97 q 293 -58 293 -48 q 241 -217 293 -166 q 0 -286 174 -286 l 0 -182 q 143 -130 105 -182 q 171 -2 171 -93 q 168 81 171 22 q 165 144 165 140 q 188 275 165 229 q 306 365 220 339 q 191 455 224 391 q 165 588 165 505 q 168 681 165 624 q 171 742 171 737 q 141 865 171 827 q 0 915 102 915 l 0 1015 q 243 942 176 1015 q 293 773 293 888 q 287 675 293 741 q 282 590 282 608 q 318 466 282 505 q 481 417 364 417 l 481 314 "},"‰":{"x_min":-3,"x_max":1672,"ha":1821,"o":"m 846 0 q 664 76 732 0 q 603 244 603 145 q 662 412 603 344 q 846 489 729 489 q 1027 412 959 489 q 1089 244 1089 343 q 1029 76 1089 144 q 846 0 962 0 m 845 103 q 945 143 910 103 q 981 243 981 184 q 947 340 981 301 q 845 385 910 385 q 745 342 782 385 q 709 243 709 300 q 742 147 709 186 q 845 103 781 103 m 888 986 l 284 -25 l 199 -25 l 803 986 l 888 986 m 241 468 q 58 545 126 468 q -3 715 -3 615 q 56 881 -3 813 q 238 958 124 958 q 421 881 353 958 q 483 712 483 813 q 423 544 483 612 q 241 468 356 468 m 241 855 q 137 811 175 855 q 100 710 100 768 q 136 612 100 653 q 240 572 172 572 q 344 614 306 572 q 382 713 382 656 q 347 810 382 771 q 241 855 308 855 m 1428 0 q 1246 76 1314 0 q 1185 244 1185 145 q 1244 412 1185 344 q 1428 489 1311 489 q 1610 412 1542 489 q 1672 244 1672 343 q 1612 76 1672 144 q 1428 0 1545 0 m 1427 103 q 1528 143 1492 103 q 1564 243 1564 184 q 1530 340 1564 301 q 1427 385 1492 385 q 1327 342 1364 385 q 1291 243 1291 300 q 1324 147 1291 186 q 1427 103 1363 103 "},"a":{"x_min":0,"x_max":698.609375,"ha":794,"o":"m 698 0 q 661 -12 679 -7 q 615 -17 643 -17 q 536 12 564 -17 q 500 96 508 41 q 384 6 456 37 q 236 -25 312 -25 q 65 31 130 -25 q 0 194 0 88 q 118 390 0 334 q 328 435 180 420 q 488 483 476 451 q 495 523 495 504 q 442 619 495 584 q 325 654 389 654 q 209 617 257 654 q 152 513 161 580 l 33 513 q 123 705 33 633 q 332 772 207 772 q 528 712 448 772 q 617 531 617 645 l 617 163 q 624 108 617 126 q 664 90 632 90 l 698 94 l 698 0 m 491 262 l 491 372 q 272 329 350 347 q 128 201 128 294 q 166 113 128 144 q 264 83 205 83 q 414 130 346 83 q 491 262 491 183 "},"—":{"x_min":0,"x_max":941.671875,"ha":1039,"o":"m 941 334 l 0 334 l 0 410 l 941 410 l 941 334 "},"=":{"x_min":8.71875,"x_max":780.953125,"ha":792,"o":"m 780 510 l 8 510 l 8 606 l 780 606 l 780 510 m 780 235 l 8 235 l 8 332 l 780 332 l 780 235 "},"N":{"x_min":0,"x_max":801,"ha":914,"o":"m 801 0 l 651 0 l 131 823 l 131 0 l 0 0 l 0 1013 l 151 1013 l 670 193 l 670 1013 l 801 1013 l 801 0 "},"ρ":{"x_min":0,"x_max":712,"ha":797,"o":"m 712 369 q 620 94 712 207 q 362 -26 521 -26 q 230 2 292 -26 q 119 83 167 30 l 119 -278 l 0 -278 l 0 362 q 91 643 0 531 q 355 764 190 764 q 617 647 517 764 q 712 369 712 536 m 583 366 q 530 559 583 480 q 359 651 469 651 q 190 562 252 651 q 135 370 135 483 q 189 176 135 257 q 359 85 250 85 q 528 175 466 85 q 583 366 583 254 "},"2":{"x_min":59,"x_max":731,"ha":792,"o":"m 731 0 l 59 0 q 197 314 59 188 q 457 487 199 315 q 598 691 598 580 q 543 819 598 772 q 411 867 488 867 q 272 811 328 867 q 209 630 209 747 l 81 630 q 182 901 81 805 q 408 986 271 986 q 629 909 536 986 q 731 694 731 826 q 613 449 731 541 q 378 316 495 383 q 201 122 235 234 l 731 122 l 731 0 "},"¯":{"x_min":0,"x_max":941.671875,"ha":938,"o":"m 941 1033 l 0 1033 l 0 1109 l 941 1109 l 941 1033 "},"Z":{"x_min":0,"x_max":779,"ha":849,"o":"m 779 0 l 0 0 l 0 113 l 621 896 l 40 896 l 40 1013 l 779 1013 l 778 887 l 171 124 l 779 124 l 779 0 "},"u":{"x_min":0,"x_max":617,"ha":729,"o":"m 617 0 l 499 0 l 499 110 q 391 10 460 45 q 246 -25 322 -25 q 61 58 127 -25 q 0 258 0 136 l 0 738 l 125 738 l 125 284 q 156 148 125 202 q 273 82 197 82 q 433 165 369 82 q 493 340 493 243 l 493 738 l 617 738 l 617 0 "},"k":{"x_min":0,"x_max":612.484375,"ha":697,"o":"m 612 738 l 338 465 l 608 0 l 469 0 l 251 382 l 121 251 l 121 0 l 0 0 l 0 1013 l 121 1013 l 121 402 l 456 738 l 612 738 "},"Η":{"x_min":0,"x_max":803,"ha":917,"o":"m 803 0 l 667 0 l 667 475 l 140 475 l 140 0 l 0 0 l 0 1013 l 140 1013 l 140 599 l 667 599 l 667 1013 l 803 1013 l 803 0 "},"Α":{"x_min":0,"x_max":906.953125,"ha":985,"o":"m 906 0 l 756 0 l 650 303 l 251 303 l 143 0 l 0 0 l 376 1013 l 529 1013 l 906 0 m 609 421 l 452 866 l 293 421 l 609 421 "},"s":{"x_min":0,"x_max":604,"ha":697,"o":"m 604 217 q 501 36 604 104 q 292 -23 411 -23 q 86 43 166 -23 q 0 238 0 114 l 121 237 q 175 122 121 164 q 300 85 223 85 q 415 112 363 85 q 479 207 479 147 q 361 309 479 276 q 140 372 141 370 q 21 544 21 426 q 111 708 21 647 q 298 761 190 761 q 492 705 413 761 q 583 531 583 643 l 462 531 q 412 625 462 594 q 298 657 363 657 q 199 636 242 657 q 143 558 143 608 q 262 454 143 486 q 484 394 479 397 q 604 217 604 341 "},"B":{"x_min":0,"x_max":778,"ha":876,"o":"m 580 546 q 724 469 670 535 q 778 311 778 403 q 673 83 778 171 q 432 0 575 0 l 0 0 l 0 1013 l 411 1013 q 629 957 541 1013 q 732 768 732 892 q 691 633 732 693 q 580 546 650 572 m 393 899 l 139 899 l 139 588 l 379 588 q 521 624 462 588 q 592 744 592 667 q 531 859 592 819 q 393 899 471 899 m 419 124 q 566 169 504 124 q 635 303 635 219 q 559 436 635 389 q 402 477 494 477 l 139 477 l 139 124 l 419 124 "},"…":{"x_min":0,"x_max":614,"ha":708,"o":"m 142 0 l 0 0 l 0 151 l 142 151 l 142 0 m 378 0 l 236 0 l 236 151 l 378 151 l 378 0 m 614 0 l 472 0 l 472 151 l 614 151 l 614 0 "},"?":{"x_min":0,"x_max":607,"ha":704,"o":"m 607 777 q 543 599 607 674 q 422 474 482 537 q 357 272 357 391 l 236 272 q 297 487 236 395 q 411 619 298 490 q 474 762 474 691 q 422 885 474 838 q 301 933 371 933 q 179 880 228 933 q 124 706 124 819 l 0 706 q 94 963 0 872 q 302 1044 177 1044 q 511 973 423 1044 q 607 777 607 895 m 370 0 l 230 0 l 230 151 l 370 151 l 370 0 "},"H":{"x_min":0,"x_max":803,"ha":915,"o":"m 803 0 l 667 0 l 667 475 l 140 475 l 140 0 l 0 0 l 0 1013 l 140 1013 l 140 599 l 667 599 l 667 1013 l 803 1013 l 803 0 "},"ν":{"x_min":0,"x_max":675,"ha":761,"o":"m 675 738 l 404 0 l 272 0 l 0 738 l 133 738 l 340 147 l 541 738 l 675 738 "},"c":{"x_min":1,"x_max":701.390625,"ha":775,"o":"m 701 264 q 584 53 681 133 q 353 -26 487 -26 q 91 91 188 -26 q 1 370 1 201 q 92 645 1 537 q 353 761 190 761 q 572 688 479 761 q 690 493 666 615 l 556 493 q 487 606 545 562 q 356 650 428 650 q 186 563 246 650 q 134 372 134 487 q 188 179 134 258 q 359 88 250 88 q 492 136 437 88 q 566 264 548 185 l 701 264 "},"¶":{"x_min":0,"x_max":566.671875,"ha":678,"o":"m 21 892 l 52 892 l 98 761 l 145 892 l 176 892 l 178 741 l 157 741 l 157 867 l 108 741 l 88 741 l 40 871 l 40 741 l 21 741 l 21 892 m 308 854 l 308 731 q 252 691 308 691 q 227 691 240 691 q 207 696 213 695 l 207 712 l 253 706 q 288 733 288 706 l 288 763 q 244 741 279 741 q 193 797 193 741 q 261 860 193 860 q 287 860 273 860 q 308 854 302 855 m 288 842 l 263 843 q 213 796 213 843 q 248 756 213 756 q 288 796 288 756 l 288 842 m 566 988 l 502 988 l 502 -1 l 439 -1 l 439 988 l 317 988 l 317 -1 l 252 -1 l 252 602 q 81 653 155 602 q 0 805 0 711 q 101 989 0 918 q 309 1053 194 1053 l 566 1053 l 566 988 "},"β":{"x_min":0,"x_max":660,"ha":745,"o":"m 471 550 q 610 450 561 522 q 660 280 660 378 q 578 64 660 151 q 367 -22 497 -22 q 239 5 299 -22 q 126 82 178 32 l 126 -278 l 0 -278 l 0 593 q 54 903 0 801 q 318 1042 127 1042 q 519 964 436 1042 q 603 771 603 887 q 567 644 603 701 q 471 550 532 586 m 337 79 q 476 138 418 79 q 535 279 535 198 q 427 437 535 386 q 226 477 344 477 l 226 583 q 398 620 329 583 q 486 762 486 668 q 435 884 486 833 q 312 935 384 935 q 169 861 219 935 q 126 698 126 797 l 126 362 q 170 169 126 242 q 337 79 224 79 "},"Μ":{"x_min":0,"x_max":954,"ha":1068,"o":"m 954 0 l 819 0 l 819 868 l 537 0 l 405 0 l 128 865 l 128 0 l 0 0 l 0 1013 l 199 1013 l 472 158 l 758 1013 l 954 1013 l 954 0 "},"Ό":{"x_min":0.109375,"x_max":1120,"ha":1217,"o":"m 1120 505 q 994 132 1120 282 q 642 -29 861 -29 q 290 130 422 -29 q 167 505 167 280 q 294 883 167 730 q 650 1046 430 1046 q 999 882 868 1046 q 1120 505 1120 730 m 977 504 q 896 784 977 669 q 644 915 804 915 q 391 785 484 915 q 307 504 307 669 q 391 224 307 339 q 644 95 486 95 q 894 224 803 95 q 977 504 977 339 m 277 1040 l 83 799 l 0 799 l 140 1040 l 277 1040 "},"Ή":{"x_min":0,"x_max":1158,"ha":1275,"o":"m 1158 0 l 1022 0 l 1022 475 l 496 475 l 496 0 l 356 0 l 356 1012 l 496 1012 l 496 599 l 1022 599 l 1022 1012 l 1158 1012 l 1158 0 m 277 1040 l 83 799 l 0 799 l 140 1040 l 277 1040 "},"•":{"x_min":0,"x_max":663.890625,"ha":775,"o":"m 663 529 q 566 293 663 391 q 331 196 469 196 q 97 294 194 196 q 0 529 0 393 q 96 763 0 665 q 331 861 193 861 q 566 763 469 861 q 663 529 663 665 "},"¥":{"x_min":0.1875,"x_max":819.546875,"ha":886,"o":"m 563 561 l 697 561 l 696 487 l 520 487 l 482 416 l 482 380 l 697 380 l 695 308 l 482 308 l 482 0 l 342 0 l 342 308 l 125 308 l 125 380 l 342 380 l 342 417 l 303 487 l 125 487 l 125 561 l 258 561 l 0 1013 l 140 1013 l 411 533 l 679 1013 l 819 1013 l 563 561 "},"(":{"x_min":0,"x_max":318.0625,"ha":415,"o":"m 318 -290 l 230 -290 q 61 23 122 -142 q 0 365 0 190 q 62 712 0 540 q 230 1024 119 869 l 318 1024 q 175 705 219 853 q 125 360 125 542 q 176 22 125 187 q 318 -290 223 -127 "},"U":{"x_min":0,"x_max":796,"ha":904,"o":"m 796 393 q 681 93 796 212 q 386 -25 566 -25 q 101 95 208 -25 q 0 393 0 211 l 0 1013 l 138 1013 l 138 391 q 204 191 138 270 q 394 107 276 107 q 586 191 512 107 q 656 391 656 270 l 656 1013 l 796 1013 l 796 393 "},"γ":{"x_min":0.5,"x_max":744.953125,"ha":822,"o":"m 744 737 l 463 54 l 463 -278 l 338 -278 l 338 54 l 154 495 q 104 597 124 569 q 13 651 67 651 l 0 651 l 0 751 l 39 753 q 168 711 121 753 q 242 594 207 676 l 403 208 l 617 737 l 744 737 "},"α":{"x_min":0,"x_max":765.5625,"ha":809,"o":"m 765 -4 q 698 -14 726 -14 q 564 97 586 -14 q 466 7 525 40 q 337 -26 407 -26 q 88 98 186 -26 q 0 369 0 212 q 88 637 0 525 q 337 760 184 760 q 465 728 407 760 q 563 637 524 696 l 563 739 l 685 739 l 685 222 q 693 141 685 168 q 748 94 708 94 q 765 96 760 94 l 765 -4 m 584 371 q 531 562 584 485 q 360 653 470 653 q 192 566 254 653 q 135 379 135 489 q 186 181 135 261 q 358 84 247 84 q 528 176 465 84 q 584 371 584 260 "},"F":{"x_min":0,"x_max":683.328125,"ha":717,"o":"m 683 888 l 140 888 l 140 583 l 613 583 l 613 458 l 140 458 l 140 0 l 0 0 l 0 1013 l 683 1013 l 683 888 "},"­":{"x_min":0,"x_max":705.5625,"ha":803,"o":"m 705 334 l 0 334 l 0 410 l 705 410 l 705 334 "},":":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 585 l 0 585 l 0 738 l 142 738 l 142 585 m 142 0 l 0 0 l 0 151 l 142 151 l 142 0 "},"Χ":{"x_min":0,"x_max":854.171875,"ha":935,"o":"m 854 0 l 683 0 l 423 409 l 166 0 l 0 0 l 347 519 l 18 1013 l 186 1013 l 427 637 l 675 1013 l 836 1013 l 504 521 l 854 0 "},"*":{"x_min":116,"x_max":674,"ha":792,"o":"m 674 768 l 475 713 l 610 544 l 517 477 l 394 652 l 272 478 l 178 544 l 314 713 l 116 766 l 153 876 l 341 812 l 342 1013 l 446 1013 l 446 811 l 635 874 l 674 768 "},"†":{"x_min":0,"x_max":777,"ha":835,"o":"m 458 804 l 777 804 l 777 683 l 458 683 l 458 0 l 319 0 l 319 681 l 0 683 l 0 804 l 319 804 l 319 1015 l 458 1013 l 458 804 "},"°":{"x_min":0,"x_max":347,"ha":444,"o":"m 173 802 q 43 856 91 802 q 0 977 0 905 q 45 1101 0 1049 q 173 1153 90 1153 q 303 1098 255 1153 q 347 977 347 1049 q 303 856 347 905 q 173 802 256 802 m 173 884 q 238 910 214 884 q 262 973 262 937 q 239 1038 262 1012 q 173 1064 217 1064 q 108 1037 132 1064 q 85 973 85 1010 q 108 910 85 937 q 173 884 132 884 "},"V":{"x_min":0,"x_max":862.71875,"ha":940,"o":"m 862 1013 l 505 0 l 361 0 l 0 1013 l 143 1013 l 434 165 l 718 1012 l 862 1013 "},"Ξ":{"x_min":0,"x_max":734.71875,"ha":763,"o":"m 723 889 l 9 889 l 9 1013 l 723 1013 l 723 889 m 673 463 l 61 463 l 61 589 l 673 589 l 673 463 m 734 0 l 0 0 l 0 124 l 734 124 l 734 0 "}," ":{"x_min":0,"x_max":0,"ha":853},"Ϋ":{"x_min":0.328125,"x_max":819.515625,"ha":889,"o":"m 588 1046 l 460 1046 l 460 1189 l 588 1189 l 588 1046 m 360 1046 l 232 1046 l 232 1189 l 360 1189 l 360 1046 m 819 1012 l 482 416 l 482 0 l 342 0 l 342 416 l 0 1012 l 140 1012 l 411 533 l 679 1012 l 819 1012 "},"0":{"x_min":73,"x_max":715,"ha":792,"o":"m 394 -29 q 153 129 242 -29 q 73 479 73 272 q 152 829 73 687 q 394 989 241 989 q 634 829 545 989 q 715 479 715 684 q 635 129 715 270 q 394 -29 546 -29 m 394 89 q 546 211 489 89 q 598 479 598 322 q 548 748 598 640 q 394 871 491 871 q 241 748 298 871 q 190 479 190 637 q 239 211 190 319 q 394 89 296 89 "},"”":{"x_min":0,"x_max":347,"ha":454,"o":"m 139 851 q 102 737 139 784 q 0 669 65 690 l 0 734 q 59 787 42 741 q 72 873 72 821 l 0 873 l 0 1013 l 139 1013 l 139 851 m 347 851 q 310 737 347 784 q 208 669 273 690 l 208 734 q 267 787 250 741 q 280 873 280 821 l 208 873 l 208 1013 l 347 1013 l 347 851 "},"@":{"x_min":0,"x_max":1260,"ha":1357,"o":"m 1098 -45 q 877 -160 1001 -117 q 633 -203 752 -203 q 155 -29 327 -203 q 0 360 0 127 q 176 802 0 616 q 687 1008 372 1008 q 1123 854 969 1008 q 1260 517 1260 718 q 1155 216 1260 341 q 868 82 1044 82 q 772 106 801 82 q 737 202 737 135 q 647 113 700 144 q 527 82 594 82 q 367 147 420 82 q 314 312 314 212 q 401 565 314 452 q 639 690 498 690 q 810 588 760 690 l 849 668 l 938 668 q 877 441 900 532 q 833 226 833 268 q 853 182 833 198 q 902 167 873 167 q 1088 272 1012 167 q 1159 512 1159 372 q 1051 793 1159 681 q 687 925 925 925 q 248 747 415 925 q 97 361 97 586 q 226 26 97 159 q 627 -122 370 -122 q 856 -87 737 -122 q 1061 8 976 -53 l 1098 -45 m 786 488 q 738 580 777 545 q 643 615 700 615 q 483 517 548 615 q 425 322 425 430 q 457 203 425 250 q 552 156 490 156 q 722 273 665 156 q 786 488 738 309 "},"Ί":{"x_min":0,"x_max":499,"ha":613,"o":"m 277 1040 l 83 799 l 0 799 l 140 1040 l 277 1040 m 499 0 l 360 0 l 360 1012 l 499 1012 l 499 0 "},"i":{"x_min":14,"x_max":136,"ha":275,"o":"m 136 873 l 14 873 l 14 1013 l 136 1013 l 136 873 m 136 0 l 14 0 l 14 737 l 136 737 l 136 0 "},"Β":{"x_min":0,"x_max":778,"ha":877,"o":"m 580 545 q 724 468 671 534 q 778 310 778 402 q 673 83 778 170 q 432 0 575 0 l 0 0 l 0 1013 l 411 1013 q 629 957 541 1013 q 732 768 732 891 q 691 632 732 692 q 580 545 650 571 m 393 899 l 139 899 l 139 587 l 379 587 q 521 623 462 587 q 592 744 592 666 q 531 859 592 819 q 393 899 471 899 m 419 124 q 566 169 504 124 q 635 302 635 219 q 559 435 635 388 q 402 476 494 476 l 139 476 l 139 124 l 419 124 "},"υ":{"x_min":0,"x_max":617,"ha":725,"o":"m 617 352 q 540 94 617 199 q 308 -24 455 -24 q 76 94 161 -24 q 0 352 0 199 l 0 739 l 126 739 l 126 355 q 169 185 126 257 q 312 98 220 98 q 451 185 402 98 q 492 355 492 257 l 492 739 l 617 739 l 617 352 "},"]":{"x_min":0,"x_max":275,"ha":372,"o":"m 275 -281 l 0 -281 l 0 -187 l 151 -187 l 151 920 l 0 920 l 0 1013 l 275 1013 l 275 -281 "},"m":{"x_min":0,"x_max":1019,"ha":1128,"o":"m 1019 0 l 897 0 l 897 454 q 860 591 897 536 q 739 660 816 660 q 613 586 659 660 q 573 436 573 522 l 573 0 l 447 0 l 447 455 q 412 591 447 535 q 294 657 372 657 q 165 586 213 657 q 122 437 122 521 l 122 0 l 0 0 l 0 738 l 117 738 l 117 640 q 202 730 150 697 q 316 763 254 763 q 437 730 381 763 q 525 642 494 697 q 621 731 559 700 q 753 763 682 763 q 943 694 867 763 q 1019 512 1019 625 l 1019 0 "},"χ":{"x_min":8.328125,"x_max":780.5625,"ha":815,"o":"m 780 -278 q 715 -294 747 -294 q 616 -257 663 -294 q 548 -175 576 -227 l 379 133 l 143 -277 l 9 -277 l 313 254 l 163 522 q 127 586 131 580 q 36 640 91 640 q 8 637 27 640 l 8 752 l 52 757 q 162 719 113 757 q 236 627 200 690 l 383 372 l 594 737 l 726 737 l 448 250 l 625 -69 q 670 -153 647 -110 q 743 -188 695 -188 q 780 -184 759 -188 l 780 -278 "},"8":{"x_min":55,"x_max":736,"ha":792,"o":"m 571 527 q 694 424 652 491 q 736 280 736 358 q 648 71 736 158 q 395 -26 551 -26 q 142 69 238 -26 q 55 279 55 157 q 96 425 55 359 q 220 527 138 491 q 120 615 153 562 q 88 726 88 668 q 171 904 88 827 q 395 986 261 986 q 618 905 529 986 q 702 727 702 830 q 670 616 702 667 q 571 527 638 565 m 394 565 q 519 610 475 565 q 563 717 563 655 q 521 823 563 781 q 392 872 474 872 q 265 824 312 872 q 224 720 224 783 q 265 613 224 656 q 394 565 312 565 m 395 91 q 545 150 488 91 q 597 280 597 204 q 546 408 597 355 q 395 465 492 465 q 244 408 299 465 q 194 280 194 356 q 244 150 194 203 q 395 91 299 91 "},"ί":{"x_min":42,"x_max":326.71875,"ha":361,"o":"m 284 3 q 233 -10 258 -5 q 182 -15 207 -15 q 85 26 119 -15 q 42 200 42 79 l 42 737 l 167 737 l 168 215 q 172 141 168 157 q 226 101 183 101 q 248 102 239 101 q 284 112 257 104 l 284 3 m 326 1040 l 137 819 l 54 819 l 189 1040 l 326 1040 "},"Ζ":{"x_min":0,"x_max":779.171875,"ha":850,"o":"m 779 0 l 0 0 l 0 113 l 620 896 l 40 896 l 40 1013 l 779 1013 l 779 887 l 170 124 l 779 124 l 779 0 "},"R":{"x_min":0,"x_max":781.953125,"ha":907,"o":"m 781 0 l 623 0 q 587 242 590 52 q 407 433 585 433 l 138 433 l 138 0 l 0 0 l 0 1013 l 396 1013 q 636 946 539 1013 q 749 731 749 868 q 711 597 749 659 q 608 502 674 534 q 718 370 696 474 q 729 207 722 352 q 781 26 736 62 l 781 0 m 373 551 q 533 594 465 551 q 614 731 614 645 q 532 859 614 815 q 373 896 465 896 l 138 896 l 138 551 l 373 551 "},"o":{"x_min":0,"x_max":713,"ha":821,"o":"m 357 -25 q 94 91 194 -25 q 0 368 0 202 q 93 642 0 533 q 357 761 193 761 q 618 644 518 761 q 713 368 713 533 q 619 91 713 201 q 357 -25 521 -25 m 357 85 q 528 175 465 85 q 584 369 584 255 q 529 562 584 484 q 357 651 467 651 q 189 560 250 651 q 135 369 135 481 q 187 177 135 257 q 357 85 250 85 "},"5":{"x_min":54.171875,"x_max":738,"ha":792,"o":"m 738 314 q 626 60 738 153 q 382 -23 526 -23 q 155 47 248 -23 q 54 256 54 125 l 183 256 q 259 132 204 174 q 382 91 314 91 q 533 149 471 91 q 602 314 602 213 q 538 469 602 411 q 386 528 475 528 q 284 506 332 528 q 197 439 237 484 l 81 439 l 159 958 l 684 958 l 684 840 l 254 840 l 214 579 q 306 627 258 612 q 407 643 354 643 q 636 552 540 643 q 738 314 738 457 "},"7":{"x_min":58.71875,"x_max":730.953125,"ha":792,"o":"m 730 839 q 469 448 560 641 q 335 0 378 255 l 192 0 q 328 441 235 252 q 593 830 421 630 l 58 830 l 58 958 l 730 958 l 730 839 "},"K":{"x_min":0,"x_max":819.46875,"ha":906,"o":"m 819 0 l 649 0 l 294 509 l 139 355 l 139 0 l 0 0 l 0 1013 l 139 1013 l 139 526 l 626 1013 l 809 1013 l 395 600 l 819 0 "},",":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 -12 q 105 -132 142 -82 q 0 -205 68 -182 l 0 -138 q 57 -82 40 -124 q 70 0 70 -51 l 0 0 l 0 151 l 142 151 l 142 -12 "},"d":{"x_min":0,"x_max":683,"ha":796,"o":"m 683 0 l 564 0 l 564 93 q 456 6 516 38 q 327 -25 395 -25 q 87 100 181 -25 q 0 365 0 215 q 90 639 0 525 q 343 763 187 763 q 564 647 486 763 l 564 1013 l 683 1013 l 683 0 m 582 373 q 529 562 582 484 q 361 653 468 653 q 190 561 253 653 q 135 365 135 479 q 189 175 135 254 q 358 85 251 85 q 529 178 468 85 q 582 373 582 258 "},"¨":{"x_min":-109,"x_max":247,"ha":232,"o":"m 247 1046 l 119 1046 l 119 1189 l 247 1189 l 247 1046 m 19 1046 l -109 1046 l -109 1189 l 19 1189 l 19 1046 "},"E":{"x_min":0,"x_max":736.109375,"ha":789,"o":"m 736 0 l 0 0 l 0 1013 l 725 1013 l 725 889 l 139 889 l 139 585 l 677 585 l 677 467 l 139 467 l 139 125 l 736 125 l 736 0 "},"Y":{"x_min":0,"x_max":820,"ha":886,"o":"m 820 1013 l 482 416 l 482 0 l 342 0 l 342 416 l 0 1013 l 140 1013 l 411 534 l 679 1012 l 820 1013 "},"\"":{"x_min":0,"x_max":299,"ha":396,"o":"m 299 606 l 203 606 l 203 988 l 299 988 l 299 606 m 96 606 l 0 606 l 0 988 l 96 988 l 96 606 "},"‹":{"x_min":17.984375,"x_max":773.609375,"ha":792,"o":"m 773 40 l 18 376 l 17 465 l 773 799 l 773 692 l 159 420 l 773 149 l 773 40 "},"„":{"x_min":0,"x_max":364,"ha":467,"o":"m 141 -12 q 104 -132 141 -82 q 0 -205 67 -182 l 0 -138 q 56 -82 40 -124 q 69 0 69 -51 l 0 0 l 0 151 l 141 151 l 141 -12 m 364 -12 q 327 -132 364 -82 q 222 -205 290 -182 l 222 -138 q 279 -82 262 -124 q 292 0 292 -51 l 222 0 l 222 151 l 364 151 l 364 -12 "},"δ":{"x_min":1,"x_max":710,"ha":810,"o":"m 710 360 q 616 87 710 196 q 356 -28 518 -28 q 99 82 197 -28 q 1 356 1 192 q 100 606 1 509 q 355 703 199 703 q 180 829 288 754 q 70 903 124 866 l 70 1012 l 643 1012 l 643 901 l 258 901 q 462 763 422 794 q 636 592 577 677 q 710 360 710 485 m 584 365 q 552 501 584 447 q 451 602 521 555 q 372 611 411 611 q 197 541 258 611 q 136 355 136 472 q 190 171 136 245 q 358 85 252 85 q 528 173 465 85 q 584 365 584 252 "},"έ":{"x_min":0,"x_max":634.71875,"ha":714,"o":"m 634 234 q 527 38 634 110 q 300 -25 433 -25 q 98 29 183 -25 q 0 204 0 93 q 37 313 0 265 q 128 390 67 352 q 56 459 82 419 q 26 555 26 505 q 114 712 26 654 q 295 763 191 763 q 499 700 416 763 q 589 515 589 631 l 478 515 q 419 618 464 580 q 307 657 374 657 q 207 630 253 657 q 151 547 151 598 q 238 445 151 469 q 389 434 280 434 l 389 331 l 349 331 q 206 315 255 331 q 125 210 125 287 q 183 107 125 145 q 302 76 233 76 q 436 117 379 76 q 509 234 493 159 l 634 234 m 520 1040 l 331 819 l 248 819 l 383 1040 l 520 1040 "},"ω":{"x_min":0,"x_max":922,"ha":1031,"o":"m 922 339 q 856 97 922 203 q 650 -26 780 -26 q 538 9 587 -26 q 461 103 489 44 q 387 12 436 46 q 277 -22 339 -22 q 69 97 147 -22 q 0 339 0 203 q 45 551 0 444 q 161 738 84 643 l 302 738 q 175 553 219 647 q 124 336 124 446 q 155 179 124 249 q 275 88 197 88 q 375 163 341 88 q 400 294 400 219 l 400 572 l 524 572 l 524 294 q 561 135 524 192 q 643 88 591 88 q 762 182 719 88 q 797 342 797 257 q 745 556 797 450 q 619 738 705 638 l 760 738 q 874 551 835 640 q 922 339 922 444 "},"´":{"x_min":0,"x_max":96,"ha":251,"o":"m 96 606 l 0 606 l 0 988 l 96 988 l 96 606 "},"±":{"x_min":11,"x_max":781,"ha":792,"o":"m 781 490 l 446 490 l 446 255 l 349 255 l 349 490 l 11 490 l 11 586 l 349 586 l 349 819 l 446 819 l 446 586 l 781 586 l 781 490 m 781 21 l 11 21 l 11 115 l 781 115 l 781 21 "},"|":{"x_min":343,"x_max":449,"ha":792,"o":"m 449 462 l 343 462 l 343 986 l 449 986 l 449 462 m 449 -242 l 343 -242 l 343 280 l 449 280 l 449 -242 "},"ϋ":{"x_min":0,"x_max":617,"ha":725,"o":"m 482 800 l 372 800 l 372 925 l 482 925 l 482 800 m 239 800 l 129 800 l 129 925 l 239 925 l 239 800 m 617 352 q 540 93 617 199 q 308 -24 455 -24 q 76 93 161 -24 q 0 352 0 199 l 0 738 l 126 738 l 126 354 q 169 185 126 257 q 312 98 220 98 q 451 185 402 98 q 492 354 492 257 l 492 738 l 617 738 l 617 352 "},"§":{"x_min":0,"x_max":593,"ha":690,"o":"m 593 425 q 554 312 593 369 q 467 233 516 254 q 537 83 537 172 q 459 -74 537 -12 q 288 -133 387 -133 q 115 -69 184 -133 q 47 96 47 -6 l 166 96 q 199 7 166 40 q 288 -26 232 -26 q 371 -5 332 -26 q 420 60 420 21 q 311 201 420 139 q 108 309 210 255 q 0 490 0 383 q 33 602 0 551 q 124 687 66 654 q 75 743 93 712 q 58 812 58 773 q 133 984 58 920 q 300 1043 201 1043 q 458 987 394 1043 q 529 814 529 925 l 411 814 q 370 908 404 877 q 289 939 336 939 q 213 911 246 939 q 180 841 180 883 q 286 720 180 779 q 484 612 480 615 q 593 425 593 534 m 467 409 q 355 544 467 473 q 196 630 228 612 q 146 587 162 609 q 124 525 124 558 q 239 387 124 462 q 398 298 369 315 q 448 345 429 316 q 467 409 467 375 "},"b":{"x_min":0,"x_max":685,"ha":783,"o":"m 685 372 q 597 99 685 213 q 347 -25 501 -25 q 219 5 277 -25 q 121 93 161 36 l 121 0 l 0 0 l 0 1013 l 121 1013 l 121 634 q 214 723 157 692 q 341 754 272 754 q 591 637 493 754 q 685 372 685 526 m 554 356 q 499 550 554 470 q 328 644 437 644 q 162 556 223 644 q 108 369 108 478 q 160 176 108 256 q 330 83 221 83 q 498 169 435 83 q 554 356 554 245 "},"q":{"x_min":0,"x_max":683,"ha":876,"o":"m 683 -278 l 564 -278 l 564 97 q 474 8 533 39 q 345 -23 415 -23 q 91 93 188 -23 q 0 364 0 203 q 87 635 0 522 q 337 760 184 760 q 466 727 408 760 q 564 637 523 695 l 564 737 l 683 737 l 683 -278 m 582 375 q 527 564 582 488 q 358 652 466 652 q 190 565 253 652 q 135 377 135 488 q 189 179 135 261 q 361 84 251 84 q 530 179 469 84 q 582 375 582 260 "},"Ω":{"x_min":-0.171875,"x_max":969.5625,"ha":1068,"o":"m 969 0 l 555 0 l 555 123 q 744 308 675 194 q 814 558 814 423 q 726 812 814 709 q 484 922 633 922 q 244 820 334 922 q 154 567 154 719 q 223 316 154 433 q 412 123 292 199 l 412 0 l 0 0 l 0 124 l 217 124 q 68 327 122 210 q 15 572 15 444 q 144 911 15 781 q 484 1041 274 1041 q 822 909 691 1041 q 953 569 953 777 q 899 326 953 443 q 750 124 846 210 l 969 124 l 969 0 "},"ύ":{"x_min":0,"x_max":617,"ha":725,"o":"m 617 352 q 540 93 617 199 q 308 -24 455 -24 q 76 93 161 -24 q 0 352 0 199 l 0 738 l 126 738 l 126 354 q 169 185 126 257 q 312 98 220 98 q 451 185 402 98 q 492 354 492 257 l 492 738 l 617 738 l 617 352 m 535 1040 l 346 819 l 262 819 l 397 1040 l 535 1040 "},"z":{"x_min":-0.015625,"x_max":613.890625,"ha":697,"o":"m 613 0 l 0 0 l 0 100 l 433 630 l 20 630 l 20 738 l 594 738 l 593 636 l 163 110 l 613 110 l 613 0 "},"™":{"x_min":0,"x_max":894,"ha":1000,"o":"m 389 951 l 229 951 l 229 503 l 160 503 l 160 951 l 0 951 l 0 1011 l 389 1011 l 389 951 m 894 503 l 827 503 l 827 939 l 685 503 l 620 503 l 481 937 l 481 503 l 417 503 l 417 1011 l 517 1011 l 653 580 l 796 1010 l 894 1011 l 894 503 "},"ή":{"x_min":0.78125,"x_max":697,"ha":810,"o":"m 697 -278 l 572 -278 l 572 454 q 540 587 572 536 q 425 650 501 650 q 271 579 337 650 q 206 420 206 509 l 206 0 l 81 0 l 81 489 q 73 588 81 562 q 0 644 56 644 l 0 741 q 68 755 38 755 q 158 721 124 755 q 200 630 193 687 q 297 726 234 692 q 434 761 359 761 q 620 692 544 761 q 697 516 697 624 l 697 -278 m 479 1040 l 290 819 l 207 819 l 341 1040 l 479 1040 "},"Θ":{"x_min":0,"x_max":960,"ha":1056,"o":"m 960 507 q 833 129 960 280 q 476 -32 698 -32 q 123 129 255 -32 q 0 507 0 280 q 123 883 0 732 q 476 1045 255 1045 q 832 883 696 1045 q 960 507 960 732 m 817 500 q 733 789 817 669 q 476 924 639 924 q 223 792 317 924 q 142 507 142 675 q 222 222 142 339 q 476 89 315 89 q 730 218 636 89 q 817 500 817 334 m 716 449 l 243 449 l 243 571 l 716 571 l 716 449 "},"®":{"x_min":-3,"x_max":1008,"ha":1106,"o":"m 503 532 q 614 562 566 532 q 672 658 672 598 q 614 747 672 716 q 503 772 569 772 l 338 772 l 338 532 l 503 532 m 502 -7 q 123 151 263 -7 q -3 501 -3 294 q 123 851 -3 706 q 502 1011 263 1011 q 881 851 739 1011 q 1008 501 1008 708 q 883 151 1008 292 q 502 -7 744 -7 m 502 60 q 830 197 709 60 q 940 501 940 322 q 831 805 940 681 q 502 944 709 944 q 174 805 296 944 q 65 501 65 680 q 173 197 65 320 q 502 60 294 60 m 788 146 l 678 146 q 653 316 655 183 q 527 449 652 449 l 338 449 l 338 146 l 241 146 l 241 854 l 518 854 q 688 808 621 854 q 766 658 766 755 q 739 563 766 607 q 668 497 713 519 q 751 331 747 472 q 788 164 756 190 l 788 146 "},"~":{"x_min":0,"x_max":833,"ha":931,"o":"m 833 958 q 778 753 833 831 q 594 665 716 665 q 402 761 502 665 q 240 857 302 857 q 131 795 166 857 q 104 665 104 745 l 0 665 q 54 867 0 789 q 237 958 116 958 q 429 861 331 958 q 594 765 527 765 q 704 827 670 765 q 729 958 729 874 l 833 958 "},"Ε":{"x_min":0,"x_max":736.21875,"ha":778,"o":"m 736 0 l 0 0 l 0 1013 l 725 1013 l 725 889 l 139 889 l 139 585 l 677 585 l 677 467 l 139 467 l 139 125 l 736 125 l 736 0 "},"³":{"x_min":0,"x_max":450,"ha":547,"o":"m 450 552 q 379 413 450 464 q 220 366 313 366 q 69 414 130 366 q 0 567 0 470 l 85 567 q 126 470 85 504 q 225 437 168 437 q 320 467 280 437 q 360 552 360 498 q 318 632 360 608 q 213 657 276 657 q 195 657 203 657 q 176 657 181 657 l 176 722 q 279 733 249 722 q 334 815 334 752 q 300 881 334 856 q 220 907 267 907 q 133 875 169 907 q 97 781 97 844 l 15 781 q 78 926 15 875 q 220 972 135 972 q 364 930 303 972 q 426 817 426 888 q 344 697 426 733 q 421 642 392 681 q 450 552 450 603 "},"[":{"x_min":0,"x_max":273.609375,"ha":371,"o":"m 273 -281 l 0 -281 l 0 1013 l 273 1013 l 273 920 l 124 920 l 124 -187 l 273 -187 l 273 -281 "},"L":{"x_min":0,"x_max":645.828125,"ha":696,"o":"m 645 0 l 0 0 l 0 1013 l 140 1013 l 140 126 l 645 126 l 645 0 "},"σ":{"x_min":0,"x_max":803.390625,"ha":894,"o":"m 803 628 l 633 628 q 713 368 713 512 q 618 93 713 204 q 357 -25 518 -25 q 94 91 194 -25 q 0 368 0 201 q 94 644 0 533 q 356 761 194 761 q 481 750 398 761 q 608 739 564 739 l 803 739 l 803 628 m 360 85 q 529 180 467 85 q 584 374 584 262 q 527 566 584 490 q 352 651 463 651 q 187 559 247 651 q 135 368 135 478 q 189 175 135 254 q 360 85 251 85 "},"ζ":{"x_min":0,"x_max":573,"ha":642,"o":"m 573 -40 q 553 -162 573 -97 q 510 -278 543 -193 l 400 -278 q 441 -187 428 -219 q 462 -90 462 -132 q 378 -14 462 -14 q 108 45 197 -14 q 0 290 0 117 q 108 631 0 462 q 353 901 194 767 l 55 901 l 55 1012 l 561 1012 l 561 924 q 261 669 382 831 q 128 301 128 489 q 243 117 128 149 q 458 98 350 108 q 573 -40 573 80 "},"θ":{"x_min":0,"x_max":674,"ha":778,"o":"m 674 496 q 601 160 674 304 q 336 -26 508 -26 q 73 153 165 -26 q 0 485 0 296 q 72 840 0 683 q 343 1045 166 1045 q 605 844 516 1045 q 674 496 674 692 m 546 579 q 498 798 546 691 q 336 935 437 935 q 178 798 237 935 q 126 579 137 701 l 546 579 m 546 475 l 126 475 q 170 233 126 348 q 338 80 230 80 q 504 233 447 80 q 546 475 546 346 "},"Ο":{"x_min":0,"x_max":958,"ha":1054,"o":"m 485 1042 q 834 883 703 1042 q 958 511 958 735 q 834 136 958 287 q 481 -26 701 -26 q 126 130 261 -26 q 0 504 0 279 q 127 880 0 729 q 485 1042 263 1042 m 480 98 q 731 225 638 98 q 815 504 815 340 q 733 783 815 670 q 480 913 640 913 q 226 785 321 913 q 142 504 142 671 q 226 224 142 339 q 480 98 319 98 "},"Γ":{"x_min":0,"x_max":705.28125,"ha":749,"o":"m 705 886 l 140 886 l 140 0 l 0 0 l 0 1012 l 705 1012 l 705 886 "}," ":{"x_min":0,"x_max":0,"ha":375},"%":{"x_min":-3,"x_max":1089,"ha":1186,"o":"m 845 0 q 663 76 731 0 q 602 244 602 145 q 661 412 602 344 q 845 489 728 489 q 1027 412 959 489 q 1089 244 1089 343 q 1029 76 1089 144 q 845 0 962 0 m 844 103 q 945 143 909 103 q 981 243 981 184 q 947 340 981 301 q 844 385 909 385 q 744 342 781 385 q 708 243 708 300 q 741 147 708 186 q 844 103 780 103 m 888 986 l 284 -25 l 199 -25 l 803 986 l 888 986 m 241 468 q 58 545 126 468 q -3 715 -3 615 q 56 881 -3 813 q 238 958 124 958 q 421 881 353 958 q 483 712 483 813 q 423 544 483 612 q 241 468 356 468 m 241 855 q 137 811 175 855 q 100 710 100 768 q 136 612 100 653 q 240 572 172 572 q 344 614 306 572 q 382 713 382 656 q 347 810 382 771 q 241 855 308 855 "},"P":{"x_min":0,"x_max":726,"ha":806,"o":"m 424 1013 q 640 931 555 1013 q 726 719 726 850 q 637 506 726 587 q 413 426 548 426 l 140 426 l 140 0 l 0 0 l 0 1013 l 424 1013 m 379 889 l 140 889 l 140 548 l 372 548 q 522 589 459 548 q 593 720 593 637 q 528 845 593 801 q 379 889 463 889 "},"Έ":{"x_min":0,"x_max":1078.21875,"ha":1118,"o":"m 1078 0 l 342 0 l 342 1013 l 1067 1013 l 1067 889 l 481 889 l 481 585 l 1019 585 l 1019 467 l 481 467 l 481 125 l 1078 125 l 1078 0 m 277 1040 l 83 799 l 0 799 l 140 1040 l 277 1040 "},"Ώ":{"x_min":0.125,"x_max":1136.546875,"ha":1235,"o":"m 1136 0 l 722 0 l 722 123 q 911 309 842 194 q 981 558 981 423 q 893 813 981 710 q 651 923 800 923 q 411 821 501 923 q 321 568 321 720 q 390 316 321 433 q 579 123 459 200 l 579 0 l 166 0 l 166 124 l 384 124 q 235 327 289 210 q 182 572 182 444 q 311 912 182 782 q 651 1042 441 1042 q 989 910 858 1042 q 1120 569 1120 778 q 1066 326 1120 443 q 917 124 1013 210 l 1136 124 l 1136 0 m 277 1040 l 83 800 l 0 800 l 140 1041 l 277 1040 "},"_":{"x_min":0,"x_max":705.5625,"ha":803,"o":"m 705 -334 l 0 -334 l 0 -234 l 705 -234 l 705 -334 "},"Ϊ":{"x_min":-110,"x_max":246,"ha":275,"o":"m 246 1046 l 118 1046 l 118 1189 l 246 1189 l 246 1046 m 18 1046 l -110 1046 l -110 1189 l 18 1189 l 18 1046 m 136 0 l 0 0 l 0 1012 l 136 1012 l 136 0 "},"+":{"x_min":23,"x_max":768,"ha":792,"o":"m 768 372 l 444 372 l 444 0 l 347 0 l 347 372 l 23 372 l 23 468 l 347 468 l 347 840 l 444 840 l 444 468 l 768 468 l 768 372 "},"½":{"x_min":0,"x_max":1050,"ha":1149,"o":"m 1050 0 l 625 0 q 712 178 625 108 q 878 277 722 187 q 967 385 967 328 q 932 456 967 429 q 850 484 897 484 q 759 450 798 484 q 721 352 721 416 l 640 352 q 706 502 640 448 q 851 551 766 551 q 987 509 931 551 q 1050 385 1050 462 q 976 251 1050 301 q 829 179 902 215 q 717 68 740 133 l 1050 68 l 1050 0 m 834 985 l 215 -28 l 130 -28 l 750 984 l 834 985 m 224 422 l 142 422 l 142 811 l 0 811 l 0 867 q 104 889 62 867 q 164 973 157 916 l 224 973 l 224 422 "},"Ρ":{"x_min":0,"x_max":720,"ha":783,"o":"m 424 1013 q 637 933 554 1013 q 720 723 720 853 q 633 508 720 591 q 413 426 546 426 l 140 426 l 140 0 l 0 0 l 0 1013 l 424 1013 m 378 889 l 140 889 l 140 548 l 371 548 q 521 589 458 548 q 592 720 592 637 q 527 845 592 801 q 378 889 463 889 "},"'":{"x_min":0,"x_max":139,"ha":236,"o":"m 139 851 q 102 737 139 784 q 0 669 65 690 l 0 734 q 59 787 42 741 q 72 873 72 821 l 0 873 l 0 1013 l 139 1013 l 139 851 "},"ª":{"x_min":0,"x_max":350,"ha":397,"o":"m 350 625 q 307 616 328 616 q 266 631 281 616 q 247 673 251 645 q 190 628 225 644 q 116 613 156 613 q 32 641 64 613 q 0 722 0 669 q 72 826 0 800 q 247 866 159 846 l 247 887 q 220 934 247 916 q 162 953 194 953 q 104 934 129 953 q 76 882 80 915 l 16 882 q 60 976 16 941 q 166 1011 104 1011 q 266 979 224 1011 q 308 891 308 948 l 308 706 q 311 679 308 688 q 331 670 315 670 l 350 672 l 350 625 m 247 757 l 247 811 q 136 790 175 798 q 64 726 64 773 q 83 682 64 697 q 132 667 103 667 q 207 690 174 667 q 247 757 247 718 "},"΅":{"x_min":0,"x_max":450,"ha":553,"o":"m 450 800 l 340 800 l 340 925 l 450 925 l 450 800 m 406 1040 l 212 800 l 129 800 l 269 1040 l 406 1040 m 110 800 l 0 800 l 0 925 l 110 925 l 110 800 "},"T":{"x_min":0,"x_max":777,"ha":835,"o":"m 777 894 l 458 894 l 458 0 l 319 0 l 319 894 l 0 894 l 0 1013 l 777 1013 l 777 894 "},"Φ":{"x_min":0,"x_max":915,"ha":997,"o":"m 527 0 l 389 0 l 389 122 q 110 231 220 122 q 0 509 0 340 q 110 785 0 677 q 389 893 220 893 l 389 1013 l 527 1013 l 527 893 q 804 786 693 893 q 915 509 915 679 q 805 231 915 341 q 527 122 696 122 l 527 0 m 527 226 q 712 310 641 226 q 779 507 779 389 q 712 705 779 627 q 527 787 641 787 l 527 226 m 389 226 l 389 787 q 205 698 275 775 q 136 505 136 620 q 206 308 136 391 q 389 226 276 226 "},"⁋":{"x_min":0,"x_max":0,"ha":694},"j":{"x_min":-77.78125,"x_max":167,"ha":349,"o":"m 167 871 l 42 871 l 42 1013 l 167 1013 l 167 871 m 167 -80 q 121 -231 167 -184 q -26 -278 76 -278 l -77 -278 l -77 -164 l -41 -164 q 26 -143 11 -164 q 42 -65 42 -122 l 42 737 l 167 737 l 167 -80 "},"Σ":{"x_min":0,"x_max":756.953125,"ha":819,"o":"m 756 0 l 0 0 l 0 107 l 395 523 l 22 904 l 22 1013 l 745 1013 l 745 889 l 209 889 l 566 523 l 187 125 l 756 125 l 756 0 "},"1":{"x_min":215.671875,"x_max":574,"ha":792,"o":"m 574 0 l 442 0 l 442 697 l 215 697 l 215 796 q 386 833 330 796 q 475 986 447 875 l 574 986 l 574 0 "},"›":{"x_min":18.0625,"x_max":774,"ha":792,"o":"m 774 376 l 18 40 l 18 149 l 631 421 l 18 692 l 18 799 l 774 465 l 774 376 "},"<":{"x_min":17.984375,"x_max":773.609375,"ha":792,"o":"m 773 40 l 18 376 l 17 465 l 773 799 l 773 692 l 159 420 l 773 149 l 773 40 "},"£":{"x_min":0,"x_max":704.484375,"ha":801,"o":"m 704 41 q 623 -10 664 5 q 543 -26 583 -26 q 359 15 501 -26 q 243 36 288 36 q 158 23 197 36 q 73 -21 119 10 l 6 76 q 125 195 90 150 q 175 331 175 262 q 147 443 175 383 l 0 443 l 0 512 l 108 512 q 43 734 43 623 q 120 929 43 854 q 358 1010 204 1010 q 579 936 487 1010 q 678 729 678 857 l 678 684 l 552 684 q 504 838 552 780 q 362 896 457 896 q 216 852 263 896 q 176 747 176 815 q 199 627 176 697 q 248 512 217 574 l 468 512 l 468 443 l 279 443 q 297 356 297 398 q 230 194 297 279 q 153 107 211 170 q 227 133 190 125 q 293 142 264 142 q 410 119 339 142 q 516 96 482 96 q 579 105 550 96 q 648 142 608 115 l 704 41 "},"t":{"x_min":0,"x_max":367,"ha":458,"o":"m 367 0 q 312 -5 339 -2 q 262 -8 284 -8 q 145 28 183 -8 q 108 143 108 64 l 108 638 l 0 638 l 0 738 l 108 738 l 108 944 l 232 944 l 232 738 l 367 738 l 367 638 l 232 638 l 232 185 q 248 121 232 140 q 307 102 264 102 q 345 104 330 102 q 367 107 360 107 l 367 0 "},"¬":{"x_min":0,"x_max":706,"ha":803,"o":"m 706 411 l 706 158 l 630 158 l 630 335 l 0 335 l 0 411 l 706 411 "},"λ":{"x_min":0,"x_max":750,"ha":803,"o":"m 750 -7 q 679 -15 716 -15 q 538 59 591 -15 q 466 214 512 97 l 336 551 l 126 0 l 0 0 l 270 705 q 223 837 247 770 q 116 899 190 899 q 90 898 100 899 l 90 1004 q 152 1011 125 1011 q 298 938 244 1011 q 373 783 326 901 l 605 192 q 649 115 629 136 q 716 95 669 95 l 736 95 q 750 97 745 97 l 750 -7 "},"W":{"x_min":0,"x_max":1263.890625,"ha":1351,"o":"m 1263 1013 l 995 0 l 859 0 l 627 837 l 405 0 l 265 0 l 0 1013 l 136 1013 l 342 202 l 556 1013 l 701 1013 l 921 207 l 1133 1012 l 1263 1013 "},">":{"x_min":18.0625,"x_max":774,"ha":792,"o":"m 774 376 l 18 40 l 18 149 l 631 421 l 18 692 l 18 799 l 774 465 l 774 376 "},"v":{"x_min":0,"x_max":675.15625,"ha":761,"o":"m 675 738 l 404 0 l 272 0 l 0 738 l 133 737 l 340 147 l 541 737 l 675 738 "},"τ":{"x_min":0.28125,"x_max":644.5,"ha":703,"o":"m 644 628 l 382 628 l 382 179 q 388 120 382 137 q 436 91 401 91 q 474 94 447 91 q 504 97 501 97 l 504 0 q 454 -9 482 -5 q 401 -14 426 -14 q 278 67 308 -14 q 260 233 260 118 l 260 628 l 0 628 l 0 739 l 644 739 l 644 628 "},"ξ":{"x_min":0,"x_max":624.9375,"ha":699,"o":"m 624 -37 q 608 -153 624 -96 q 563 -278 593 -211 l 454 -278 q 491 -183 486 -200 q 511 -83 511 -126 q 484 -23 511 -44 q 370 1 452 1 q 323 0 354 1 q 283 -1 293 -1 q 84 76 169 -1 q 0 266 0 154 q 56 431 0 358 q 197 538 108 498 q 94 613 134 562 q 54 730 54 665 q 77 823 54 780 q 143 901 101 867 l 27 901 l 27 1012 l 576 1012 l 576 901 l 380 901 q 244 863 303 901 q 178 745 178 820 q 312 600 178 636 q 532 582 380 582 l 532 479 q 276 455 361 479 q 118 281 118 410 q 165 173 118 217 q 274 120 208 133 q 494 101 384 110 q 624 -37 624 76 "},"&":{"x_min":-3,"x_max":894.25,"ha":992,"o":"m 894 0 l 725 0 l 624 123 q 471 0 553 40 q 306 -41 390 -41 q 168 -7 231 -41 q 62 92 105 26 q 14 187 31 139 q -3 276 -3 235 q 55 433 -3 358 q 248 581 114 508 q 170 689 196 640 q 137 817 137 751 q 214 985 137 922 q 384 1041 284 1041 q 548 988 483 1041 q 622 824 622 928 q 563 666 622 739 q 431 556 516 608 l 621 326 q 649 407 639 361 q 663 493 653 426 l 781 493 q 703 229 781 352 l 894 0 m 504 818 q 468 908 504 877 q 384 940 433 940 q 293 907 331 940 q 255 818 255 875 q 289 714 255 767 q 363 628 313 678 q 477 729 446 682 q 504 818 504 771 m 556 209 l 314 499 q 179 395 223 449 q 135 283 135 341 q 146 222 135 253 q 183 158 158 192 q 333 80 241 80 q 556 209 448 80 "},"Λ":{"x_min":0,"x_max":862.5,"ha":942,"o":"m 862 0 l 719 0 l 426 847 l 143 0 l 0 0 l 356 1013 l 501 1013 l 862 0 "},"I":{"x_min":41,"x_max":180,"ha":293,"o":"m 180 0 l 41 0 l 41 1013 l 180 1013 l 180 0 "},"G":{"x_min":0,"x_max":921,"ha":1011,"o":"m 921 0 l 832 0 l 801 136 q 655 15 741 58 q 470 -28 568 -28 q 126 133 259 -28 q 0 499 0 284 q 125 881 0 731 q 486 1043 259 1043 q 763 957 647 1043 q 905 709 890 864 l 772 709 q 668 866 747 807 q 486 926 589 926 q 228 795 322 926 q 142 507 142 677 q 228 224 142 342 q 483 94 323 94 q 712 195 625 94 q 796 435 796 291 l 477 435 l 477 549 l 921 549 l 921 0 "},"ΰ":{"x_min":0,"x_max":617,"ha":725,"o":"m 524 800 l 414 800 l 414 925 l 524 925 l 524 800 m 183 800 l 73 800 l 73 925 l 183 925 l 183 800 m 617 352 q 540 93 617 199 q 308 -24 455 -24 q 76 93 161 -24 q 0 352 0 199 l 0 738 l 126 738 l 126 354 q 169 185 126 257 q 312 98 220 98 q 451 185 402 98 q 492 354 492 257 l 492 738 l 617 738 l 617 352 m 489 1040 l 300 819 l 216 819 l 351 1040 l 489 1040 "},"`":{"x_min":0,"x_max":138.890625,"ha":236,"o":"m 138 699 l 0 699 l 0 861 q 36 974 0 929 q 138 1041 72 1020 l 138 977 q 82 931 95 969 q 69 839 69 893 l 138 839 l 138 699 "},"·":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 585 l 0 585 l 0 738 l 142 738 l 142 585 "},"Υ":{"x_min":0.328125,"x_max":819.515625,"ha":889,"o":"m 819 1013 l 482 416 l 482 0 l 342 0 l 342 416 l 0 1013 l 140 1013 l 411 533 l 679 1013 l 819 1013 "},"r":{"x_min":0,"x_max":355.5625,"ha":432,"o":"m 355 621 l 343 621 q 179 569 236 621 q 122 411 122 518 l 122 0 l 0 0 l 0 737 l 117 737 l 117 604 q 204 719 146 686 q 355 753 262 753 l 355 621 "},"x":{"x_min":0,"x_max":675,"ha":764,"o":"m 675 0 l 525 0 l 331 286 l 144 0 l 0 0 l 256 379 l 12 738 l 157 737 l 336 473 l 516 738 l 661 738 l 412 380 l 675 0 "},"μ":{"x_min":0,"x_max":696.609375,"ha":747,"o":"m 696 -4 q 628 -14 657 -14 q 498 97 513 -14 q 422 8 470 41 q 313 -24 374 -24 q 207 3 258 -24 q 120 80 157 31 l 120 -278 l 0 -278 l 0 738 l 124 738 l 124 343 q 165 172 124 246 q 308 82 216 82 q 451 177 402 82 q 492 358 492 254 l 492 738 l 616 738 l 616 214 q 623 136 616 160 q 673 92 636 92 q 696 95 684 92 l 696 -4 "},"h":{"x_min":0,"x_max":615,"ha":724,"o":"m 615 472 l 615 0 l 490 0 l 490 454 q 456 590 490 535 q 338 654 416 654 q 186 588 251 654 q 122 436 122 522 l 122 0 l 0 0 l 0 1013 l 122 1013 l 122 633 q 218 727 149 694 q 362 760 287 760 q 552 676 484 760 q 615 472 615 600 "},".":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 0 l 0 0 l 0 151 l 142 151 l 142 0 "},"φ":{"x_min":-2,"x_max":878,"ha":974,"o":"m 496 -279 l 378 -279 l 378 -17 q 101 88 204 -17 q -2 367 -2 194 q 68 626 -2 510 q 283 758 151 758 l 283 646 q 167 537 209 626 q 133 373 133 462 q 192 177 133 254 q 378 93 259 93 l 378 758 q 445 764 426 763 q 476 765 464 765 q 765 659 653 765 q 878 377 878 553 q 771 96 878 209 q 496 -17 665 -17 l 496 -279 m 496 93 l 514 93 q 687 183 623 93 q 746 380 746 265 q 691 569 746 491 q 522 658 629 658 l 496 656 l 496 93 "},";":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 585 l 0 585 l 0 738 l 142 738 l 142 585 m 142 -12 q 105 -132 142 -82 q 0 -206 68 -182 l 0 -138 q 58 -82 43 -123 q 68 0 68 -56 l 0 0 l 0 151 l 142 151 l 142 -12 "},"f":{"x_min":0,"x_max":378,"ha":472,"o":"m 378 638 l 246 638 l 246 0 l 121 0 l 121 638 l 0 638 l 0 738 l 121 738 q 137 935 121 887 q 290 1028 171 1028 q 320 1027 305 1028 q 378 1021 334 1026 l 378 908 q 323 918 346 918 q 257 870 273 918 q 246 780 246 840 l 246 738 l 378 738 l 378 638 "},"“":{"x_min":1,"x_max":348.21875,"ha":454,"o":"m 140 670 l 1 670 l 1 830 q 37 943 1 897 q 140 1011 74 990 l 140 947 q 82 900 97 940 q 68 810 68 861 l 140 810 l 140 670 m 348 670 l 209 670 l 209 830 q 245 943 209 897 q 348 1011 282 990 l 348 947 q 290 900 305 940 q 276 810 276 861 l 348 810 l 348 670 "},"A":{"x_min":0.03125,"x_max":906.953125,"ha":1008,"o":"m 906 0 l 756 0 l 648 303 l 251 303 l 142 0 l 0 0 l 376 1013 l 529 1013 l 906 0 m 610 421 l 452 867 l 293 421 l 610 421 "},"6":{"x_min":53,"x_max":739,"ha":792,"o":"m 739 312 q 633 62 739 162 q 400 -31 534 -31 q 162 78 257 -31 q 53 439 53 206 q 178 859 53 712 q 441 986 284 986 q 643 912 559 986 q 732 713 732 833 l 601 713 q 544 830 594 786 q 426 875 494 875 q 268 793 331 875 q 193 517 193 697 q 301 597 240 570 q 427 624 362 624 q 643 540 552 624 q 739 312 739 451 m 603 298 q 540 461 603 400 q 404 516 484 516 q 268 461 323 516 q 207 300 207 401 q 269 137 207 198 q 405 83 325 83 q 541 137 486 83 q 603 298 603 197 "},"‘":{"x_min":1,"x_max":139.890625,"ha":236,"o":"m 139 670 l 1 670 l 1 830 q 37 943 1 897 q 139 1011 74 990 l 139 947 q 82 900 97 940 q 68 810 68 861 l 139 810 l 139 670 "},"ϊ":{"x_min":-70,"x_max":283,"ha":361,"o":"m 283 800 l 173 800 l 173 925 l 283 925 l 283 800 m 40 800 l -70 800 l -70 925 l 40 925 l 40 800 m 283 3 q 232 -10 257 -5 q 181 -15 206 -15 q 84 26 118 -15 q 41 200 41 79 l 41 737 l 166 737 l 167 215 q 171 141 167 157 q 225 101 182 101 q 247 103 238 101 q 283 112 256 104 l 283 3 "},"π":{"x_min":-0.21875,"x_max":773.21875,"ha":857,"o":"m 773 -7 l 707 -11 q 575 40 607 -11 q 552 174 552 77 l 552 226 l 552 626 l 222 626 l 222 0 l 97 0 l 97 626 l 0 626 l 0 737 l 773 737 l 773 626 l 676 626 l 676 171 q 695 103 676 117 q 773 90 714 90 l 773 -7 "},"ά":{"x_min":0,"x_max":765.5625,"ha":809,"o":"m 765 -4 q 698 -14 726 -14 q 564 97 586 -14 q 466 7 525 40 q 337 -26 407 -26 q 88 98 186 -26 q 0 369 0 212 q 88 637 0 525 q 337 760 184 760 q 465 727 407 760 q 563 637 524 695 l 563 738 l 685 738 l 685 222 q 693 141 685 168 q 748 94 708 94 q 765 95 760 94 l 765 -4 m 584 371 q 531 562 584 485 q 360 653 470 653 q 192 566 254 653 q 135 379 135 489 q 186 181 135 261 q 358 84 247 84 q 528 176 465 84 q 584 371 584 260 m 604 1040 l 415 819 l 332 819 l 466 1040 l 604 1040 "},"O":{"x_min":0,"x_max":958,"ha":1057,"o":"m 485 1041 q 834 882 702 1041 q 958 512 958 734 q 834 136 958 287 q 481 -26 702 -26 q 126 130 261 -26 q 0 504 0 279 q 127 880 0 728 q 485 1041 263 1041 m 480 98 q 731 225 638 98 q 815 504 815 340 q 733 783 815 669 q 480 912 640 912 q 226 784 321 912 q 142 504 142 670 q 226 224 142 339 q 480 98 319 98 "},"n":{"x_min":0,"x_max":615,"ha":724,"o":"m 615 463 l 615 0 l 490 0 l 490 454 q 453 592 490 537 q 331 656 410 656 q 178 585 240 656 q 117 421 117 514 l 117 0 l 0 0 l 0 738 l 117 738 l 117 630 q 218 728 150 693 q 359 764 286 764 q 552 675 484 764 q 615 463 615 593 "},"3":{"x_min":54,"x_max":737,"ha":792,"o":"m 737 284 q 635 55 737 141 q 399 -25 541 -25 q 156 52 248 -25 q 54 308 54 140 l 185 308 q 245 147 185 202 q 395 96 302 96 q 539 140 484 96 q 602 280 602 190 q 510 429 602 390 q 324 454 451 454 l 324 565 q 487 584 441 565 q 565 719 565 617 q 515 835 565 791 q 395 879 466 879 q 255 824 307 879 q 203 661 203 769 l 78 661 q 166 909 78 822 q 387 992 250 992 q 603 921 513 992 q 701 723 701 844 q 669 607 701 656 q 578 524 637 558 q 696 434 655 499 q 737 284 737 369 "},"9":{"x_min":53,"x_max":739,"ha":792,"o":"m 739 524 q 619 94 739 241 q 362 -32 516 -32 q 150 47 242 -32 q 59 244 59 126 l 191 244 q 246 129 191 176 q 373 82 301 82 q 526 161 466 82 q 597 440 597 255 q 363 334 501 334 q 130 432 216 334 q 53 650 53 521 q 134 880 53 786 q 383 986 226 986 q 659 841 566 986 q 739 524 739 719 m 388 449 q 535 514 480 449 q 585 658 585 573 q 535 805 585 744 q 388 873 480 873 q 242 809 294 873 q 191 658 191 745 q 239 514 191 572 q 388 449 292 449 "},"l":{"x_min":41,"x_max":166,"ha":279,"o":"m 166 0 l 41 0 l 41 1013 l 166 1013 l 166 0 "},"¤":{"x_min":40.09375,"x_max":728.796875,"ha":825,"o":"m 728 304 l 649 224 l 512 363 q 383 331 458 331 q 256 363 310 331 l 119 224 l 40 304 l 177 441 q 150 553 150 493 q 184 673 150 621 l 40 818 l 119 898 l 267 749 q 321 766 291 759 q 384 773 351 773 q 447 766 417 773 q 501 749 477 759 l 649 898 l 728 818 l 585 675 q 612 618 604 648 q 621 553 621 587 q 591 441 621 491 l 728 304 m 384 682 q 280 643 318 682 q 243 551 243 604 q 279 461 243 499 q 383 423 316 423 q 487 461 449 423 q 525 553 525 500 q 490 641 525 605 q 384 682 451 682 "},"κ":{"x_min":0,"x_max":632.328125,"ha":679,"o":"m 632 0 l 482 0 l 225 384 l 124 288 l 124 0 l 0 0 l 0 738 l 124 738 l 124 446 l 433 738 l 596 738 l 312 466 l 632 0 "},"4":{"x_min":48,"x_max":742.453125,"ha":792,"o":"m 742 243 l 602 243 l 602 0 l 476 0 l 476 243 l 48 243 l 48 368 l 476 958 l 602 958 l 602 354 l 742 354 l 742 243 m 476 354 l 476 792 l 162 354 l 476 354 "},"p":{"x_min":0,"x_max":685,"ha":786,"o":"m 685 364 q 598 96 685 205 q 350 -23 504 -23 q 121 89 205 -23 l 121 -278 l 0 -278 l 0 738 l 121 738 l 121 633 q 220 726 159 691 q 351 761 280 761 q 598 636 504 761 q 685 364 685 522 m 557 371 q 501 560 557 481 q 330 651 437 651 q 162 559 223 651 q 108 366 108 479 q 162 177 108 254 q 333 87 224 87 q 502 178 441 87 q 557 371 557 258 "},"‡":{"x_min":0,"x_max":777,"ha":835,"o":"m 458 238 l 458 0 l 319 0 l 319 238 l 0 238 l 0 360 l 319 360 l 319 681 l 0 683 l 0 804 l 319 804 l 319 1015 l 458 1013 l 458 804 l 777 804 l 777 683 l 458 683 l 458 360 l 777 360 l 777 238 l 458 238 "},"ψ":{"x_min":0,"x_max":808,"ha":907,"o":"m 465 -278 l 341 -278 l 341 -15 q 87 102 180 -15 q 0 378 0 210 l 0 739 l 133 739 l 133 379 q 182 195 133 275 q 341 98 242 98 l 341 922 l 465 922 l 465 98 q 623 195 563 98 q 675 382 675 278 l 675 742 l 808 742 l 808 381 q 720 104 808 213 q 466 -13 627 -13 l 465 -278 "},"η":{"x_min":0.78125,"x_max":697,"ha":810,"o":"m 697 -278 l 572 -278 l 572 454 q 540 587 572 536 q 425 650 501 650 q 271 579 337 650 q 206 420 206 509 l 206 0 l 81 0 l 81 489 q 73 588 81 562 q 0 644 56 644 l 0 741 q 68 755 38 755 q 158 720 124 755 q 200 630 193 686 q 297 726 234 692 q 434 761 359 761 q 620 692 544 761 q 697 516 697 624 l 697 -278 "}},"cssFontWeight":"normal","ascender":1189,"underlinePosition":-100,"cssFontStyle":"normal","boundingBox":{"yMin":-334,"xMin":-111,"yMax":1189,"xMax":1672},"resolution":1000,"original_font_information":{"postscript_name":"Helvetiker-Regular","version_string":"Version 1.00 2004 initial release","vendor_url":"http://www.magenta.gr/","full_font_name":"Helvetiker","font_family_name":"Helvetiker","copyright":"Copyright (c) Μagenta ltd, 2004","description":"","trademark":"","designer":"","designer_url":"","unique_font_identifier":"Μagenta ltd:Helvetiker:22-10-104","license_url":"http://www.ellak.gr/fonts/MgOpen/license.html","license_description":"Copyright (c) 2004 by MAGENTA Ltd. All Rights Reserved.\r\n\r\nPermission is hereby granted, free of charge, to any person obtaining a copy of the fonts accompanying this license (\"Fonts\") and associated documentation files (the \"Font Software\"), to reproduce and distribute the Font Software, including without limitation the rights to use, copy, merge, publish, distribute, and/or sell copies of the Font Software, and to permit persons to whom the Font Software is furnished to do so, subject to the following conditions: \r\n\r\nThe above copyright and this permission notice shall be included in all copies of one or more of the Font Software typefaces.\r\n\r\nThe Font Software may be modified, altered, or added to, and in particular the designs of glyphs or characters in the Fonts may be modified and additional glyphs or characters may be added to the Fonts, only if the fonts are renamed to names not containing the word \"MgOpen\", or if the modifications are accepted for inclusion in the Font Software itself by the each appointed Administrator.\r\n\r\nThis License becomes null and void to the extent applicable to Fonts or Font Software that has been modified and is distributed under the \"MgOpen\" name.\r\n\r\nThe Font Software may be sold as part of a larger software package but no copy of one or more of the Font Software typefaces may be sold by itself. \r\n\r\nTHE FONT SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL MAGENTA OR PERSONS OR BODIES IN CHARGE OF ADMINISTRATION AND MAINTENANCE OF THE FONT SOFTWARE BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM OTHER DEALINGS IN THE FONT SOFTWARE.","manufacturer_name":"Μagenta ltd","font_sub_family_name":"Regular"},"descender":-334,"familyName":"Helvetiker","lineHeight":1522,"underlineThickness":50});
// File:editor/fonts/helvetiker_bold.typeface.js

if (_typeface_js && _typeface_js.loadFace) _typeface_js.loadFace({"glyphs":{"ο":{"x_min":0,"x_max":764,"ha":863,"o":"m 380 -25 q 105 87 211 -25 q 0 372 0 200 q 104 660 0 545 q 380 775 209 775 q 658 659 552 775 q 764 372 764 544 q 658 87 764 200 q 380 -25 552 -25 m 379 142 q 515 216 466 142 q 557 373 557 280 q 515 530 557 465 q 379 607 466 607 q 245 530 294 607 q 204 373 204 465 q 245 218 204 283 q 379 142 294 142 "},"S":{"x_min":0,"x_max":826,"ha":915,"o":"m 826 306 q 701 55 826 148 q 423 -29 587 -29 q 138 60 255 -29 q 0 318 13 154 l 208 318 q 288 192 216 238 q 437 152 352 152 q 559 181 506 152 q 623 282 623 217 q 466 411 623 372 q 176 487 197 478 q 18 719 18 557 q 136 958 18 869 q 399 1040 244 1040 q 670 956 561 1040 q 791 713 791 864 l 591 713 q 526 826 583 786 q 393 866 469 866 q 277 838 326 866 q 218 742 218 804 q 374 617 218 655 q 667 542 646 552 q 826 306 826 471 "},"¦":{"x_min":0,"x_max":143,"ha":240,"o":"m 143 462 l 0 462 l 0 984 l 143 984 l 143 462 m 143 -242 l 0 -242 l 0 280 l 143 280 l 143 -242 "},"/":{"x_min":196.109375,"x_max":632.5625,"ha":828,"o":"m 632 1040 l 289 -128 l 196 -128 l 538 1040 l 632 1040 "},"Τ":{"x_min":-0.609375,"x_max":808,"ha":878,"o":"m 808 831 l 508 831 l 508 0 l 298 0 l 298 831 l 0 831 l 0 1013 l 808 1013 l 808 831 "},"y":{"x_min":0,"x_max":738.890625,"ha":828,"o":"m 738 749 l 444 -107 q 361 -238 413 -199 q 213 -277 308 -277 q 156 -275 176 -277 q 120 -271 131 -271 l 120 -110 q 147 -113 134 -111 q 179 -116 161 -116 q 247 -91 226 -116 q 269 -17 269 -67 q 206 173 269 -4 q 84 515 162 301 q 0 749 41 632 l 218 749 l 376 207 l 529 749 l 738 749 "},"Π":{"x_min":0,"x_max":809,"ha":922,"o":"m 809 0 l 598 0 l 598 836 l 208 836 l 208 0 l 0 0 l 0 1012 l 809 1012 l 809 0 "},"ΐ":{"x_min":-162,"x_max":364,"ha":364,"o":"m 364 810 l 235 810 l 235 952 l 364 952 l 364 810 m 301 1064 l 86 810 l -12 810 l 123 1064 l 301 1064 m -33 810 l -162 810 l -162 952 l -33 952 l -33 810 m 200 0 l 0 0 l 0 748 l 200 748 l 200 0 "},"g":{"x_min":0,"x_max":724,"ha":839,"o":"m 724 48 q 637 -223 724 -142 q 357 -304 551 -304 q 140 -253 226 -304 q 23 -72 36 -192 l 243 -72 q 290 -127 255 -110 q 368 -144 324 -144 q 504 -82 470 -144 q 530 71 530 -38 l 530 105 q 441 25 496 51 q 319 0 386 0 q 79 115 166 0 q 0 377 0 219 q 77 647 0 534 q 317 775 166 775 q 534 656 456 775 l 534 748 l 724 748 l 724 48 m 368 167 q 492 237 447 167 q 530 382 530 297 q 490 529 530 466 q 364 603 444 603 q 240 532 284 603 q 201 386 201 471 q 240 239 201 300 q 368 167 286 167 "},"²":{"x_min":0,"x_max":463,"ha":560,"o":"m 463 791 q 365 627 463 706 q 151 483 258 555 l 455 483 l 455 382 l 0 382 q 84 565 0 488 q 244 672 97 576 q 331 784 331 727 q 299 850 331 824 q 228 876 268 876 q 159 848 187 876 q 132 762 132 820 l 10 762 q 78 924 10 866 q 228 976 137 976 q 392 925 322 976 q 463 791 463 874 "},"–":{"x_min":0,"x_max":704.171875,"ha":801,"o":"m 704 297 l 0 297 l 0 450 l 704 450 l 704 297 "},"Κ":{"x_min":0,"x_max":899.671875,"ha":969,"o":"m 899 0 l 646 0 l 316 462 l 208 355 l 208 0 l 0 0 l 0 1013 l 208 1013 l 208 596 l 603 1013 l 863 1013 l 460 603 l 899 0 "},"ƒ":{"x_min":-46,"x_max":440,"ha":525,"o":"m 440 609 l 316 609 l 149 -277 l -46 -277 l 121 609 l 14 609 l 14 749 l 121 749 q 159 949 121 894 q 344 1019 208 1019 l 440 1015 l 440 855 l 377 855 q 326 841 338 855 q 314 797 314 827 q 314 773 314 786 q 314 749 314 761 l 440 749 l 440 609 "},"e":{"x_min":0,"x_max":708,"ha":808,"o":"m 708 321 l 207 321 q 254 186 207 236 q 362 141 298 141 q 501 227 453 141 l 700 227 q 566 36 662 104 q 362 -26 477 -26 q 112 72 213 -26 q 0 369 0 182 q 95 683 0 573 q 358 793 191 793 q 619 677 531 793 q 708 321 708 561 m 501 453 q 460 571 501 531 q 353 612 420 612 q 247 570 287 612 q 207 453 207 529 l 501 453 "},"ό":{"x_min":0,"x_max":764,"ha":863,"o":"m 380 -25 q 105 87 211 -25 q 0 372 0 200 q 104 660 0 545 q 380 775 209 775 q 658 659 552 775 q 764 372 764 544 q 658 87 764 200 q 380 -25 552 -25 m 379 142 q 515 216 466 142 q 557 373 557 280 q 515 530 557 465 q 379 607 466 607 q 245 530 294 607 q 204 373 204 465 q 245 218 204 283 q 379 142 294 142 m 593 1039 l 391 823 l 293 823 l 415 1039 l 593 1039 "},"J":{"x_min":0,"x_max":649,"ha":760,"o":"m 649 294 q 573 48 649 125 q 327 -29 497 -29 q 61 82 136 -29 q 0 375 0 173 l 200 375 l 199 309 q 219 194 199 230 q 321 145 249 145 q 418 193 390 145 q 441 307 441 232 l 441 1013 l 649 1013 l 649 294 "},"»":{"x_min":-0.234375,"x_max":526,"ha":624,"o":"m 526 286 l 297 87 l 296 250 l 437 373 l 297 495 l 297 660 l 526 461 l 526 286 m 229 286 l 0 87 l 0 250 l 140 373 l 0 495 l 0 660 l 229 461 l 229 286 "},"©":{"x_min":3,"x_max":1007,"ha":1104,"o":"m 507 -6 q 129 153 269 -6 q 3 506 3 298 q 127 857 3 713 q 502 1017 266 1017 q 880 855 740 1017 q 1007 502 1007 711 q 882 152 1007 295 q 507 -6 743 -6 m 502 934 q 184 800 302 934 q 79 505 79 680 q 184 210 79 331 q 501 76 302 76 q 819 210 701 76 q 925 507 925 331 q 820 800 925 682 q 502 934 704 934 m 758 410 q 676 255 748 313 q 506 197 605 197 q 298 291 374 197 q 229 499 229 377 q 297 713 229 624 q 494 811 372 811 q 666 760 593 811 q 752 616 739 710 l 621 616 q 587 688 621 658 q 509 719 554 719 q 404 658 441 719 q 368 511 368 598 q 403 362 368 427 q 498 298 438 298 q 624 410 606 298 l 758 410 "},"ώ":{"x_min":0,"x_max":945,"ha":1051,"o":"m 566 528 l 372 528 l 372 323 q 372 298 372 311 q 373 271 372 285 q 360 183 373 211 q 292 142 342 142 q 219 222 243 142 q 203 365 203 279 q 241 565 203 461 q 334 748 273 650 l 130 748 q 36 552 68 650 q 0 337 0 444 q 69 96 0 204 q 276 -29 149 -29 q 390 0 337 -29 q 470 78 444 28 q 551 0 495 30 q 668 -29 608 -29 q 874 96 793 -29 q 945 337 945 205 q 910 547 945 444 q 814 748 876 650 l 610 748 q 703 565 671 650 q 742 365 742 462 q 718 189 742 237 q 651 142 694 142 q 577 190 597 142 q 565 289 565 221 l 565 323 l 566 528 m 718 1039 l 516 823 l 417 823 l 540 1039 l 718 1039 "},"^":{"x_min":197.21875,"x_max":630.5625,"ha":828,"o":"m 630 836 l 536 836 l 413 987 l 294 836 l 197 836 l 331 1090 l 493 1090 l 630 836 "},"«":{"x_min":0,"x_max":526.546875,"ha":624,"o":"m 526 87 l 297 286 l 297 461 l 526 660 l 526 495 l 385 373 l 526 250 l 526 87 m 229 87 l 0 286 l 0 461 l 229 660 l 229 495 l 88 373 l 229 250 l 229 87 "},"D":{"x_min":0,"x_max":864,"ha":968,"o":"m 400 1013 q 736 874 608 1013 q 864 523 864 735 q 717 146 864 293 q 340 0 570 0 l 0 0 l 0 1013 l 400 1013 m 398 837 l 206 837 l 206 182 l 372 182 q 584 276 507 182 q 657 504 657 365 q 594 727 657 632 q 398 837 522 837 "},"∙":{"x_min":0,"x_max":207,"ha":304,"o":"m 207 528 l 0 528 l 0 735 l 207 735 l 207 528 "},"ÿ":{"x_min":0,"x_max":47,"ha":125,"o":"m 47 3 q 37 -7 47 -7 q 28 0 30 -7 q 39 -4 32 -4 q 45 3 45 -1 l 37 0 q 28 9 28 0 q 39 19 28 19 l 47 16 l 47 19 l 47 3 m 37 1 q 44 8 44 1 q 37 16 44 16 q 30 8 30 16 q 37 1 30 1 m 26 1 l 23 22 l 14 0 l 3 22 l 3 3 l 0 25 l 13 1 l 22 25 l 26 1 "},"w":{"x_min":0,"x_max":1056.953125,"ha":1150,"o":"m 1056 749 l 848 0 l 647 0 l 527 536 l 412 0 l 211 0 l 0 749 l 202 749 l 325 226 l 429 748 l 633 748 l 740 229 l 864 749 l 1056 749 "},"$":{"x_min":0,"x_max":704,"ha":800,"o":"m 682 693 l 495 693 q 468 782 491 749 q 391 831 441 824 l 391 579 q 633 462 562 534 q 704 259 704 389 q 616 57 704 136 q 391 -22 528 -22 l 391 -156 l 308 -156 l 308 -22 q 76 69 152 -7 q 0 300 0 147 l 183 300 q 215 191 190 230 q 308 128 245 143 l 308 414 q 84 505 157 432 q 12 700 12 578 q 89 902 12 824 q 308 981 166 981 l 308 1069 l 391 1069 l 391 981 q 595 905 521 981 q 682 693 670 829 m 308 599 l 308 831 q 228 796 256 831 q 200 712 200 762 q 225 642 200 668 q 308 599 251 617 m 391 128 q 476 174 449 140 q 504 258 504 207 q 391 388 504 354 l 391 128 "},"\\":{"x_min":-0.03125,"x_max":434.765625,"ha":532,"o":"m 434 -128 l 341 -128 l 0 1039 l 91 1040 l 434 -128 "},"µ":{"x_min":0,"x_max":647,"ha":754,"o":"m 647 0 l 478 0 l 478 68 q 412 9 448 30 q 330 -11 375 -11 q 261 3 296 -11 q 199 43 226 18 l 199 -277 l 0 -277 l 0 749 l 199 749 l 199 358 q 216 221 199 267 q 322 151 244 151 q 435 240 410 151 q 448 401 448 283 l 448 749 l 647 749 l 647 0 "},"Ι":{"x_min":42,"x_max":250,"ha":413,"o":"m 250 0 l 42 0 l 42 1013 l 250 1013 l 250 0 "},"Ύ":{"x_min":0,"x_max":1211.15625,"ha":1289,"o":"m 1211 1012 l 907 376 l 907 0 l 697 0 l 697 376 l 374 1012 l 583 1012 l 802 576 l 1001 1012 l 1211 1012 m 313 1035 l 98 780 l 0 780 l 136 1035 l 313 1035 "},"’":{"x_min":0,"x_max":192,"ha":289,"o":"m 192 834 q 137 692 192 751 q 0 626 83 634 l 0 697 q 101 831 101 723 l 0 831 l 0 1013 l 192 1013 l 192 834 "},"Ν":{"x_min":0,"x_max":833,"ha":946,"o":"m 833 0 l 617 0 l 206 696 l 206 0 l 0 0 l 0 1013 l 216 1013 l 629 315 l 629 1013 l 833 1013 l 833 0 "},"-":{"x_min":27.78125,"x_max":413.890625,"ha":525,"o":"m 413 279 l 27 279 l 27 468 l 413 468 l 413 279 "},"Q":{"x_min":0,"x_max":995.59375,"ha":1096,"o":"m 995 49 l 885 -70 l 762 42 q 641 -12 709 4 q 497 -29 572 -29 q 135 123 271 -29 q 0 504 0 276 q 131 881 0 731 q 497 1040 270 1040 q 859 883 719 1040 q 994 506 994 731 q 966 321 994 413 q 884 152 938 229 l 995 49 m 730 299 q 767 395 755 344 q 779 504 779 446 q 713 743 779 644 q 505 857 638 857 q 284 745 366 857 q 210 501 210 644 q 279 265 210 361 q 492 157 357 157 q 615 181 557 157 l 508 287 l 620 405 l 730 299 "},"ς":{"x_min":0,"x_max":731.78125,"ha":768,"o":"m 731 448 l 547 448 q 485 571 531 533 q 369 610 440 610 q 245 537 292 610 q 204 394 204 473 q 322 186 204 238 q 540 133 430 159 q 659 -15 659 98 q 643 -141 659 -80 q 595 -278 627 -202 l 423 -278 q 458 -186 448 -215 q 474 -88 474 -133 q 352 0 474 -27 q 123 80 181 38 q 0 382 0 170 q 98 660 0 549 q 367 777 202 777 q 622 683 513 777 q 731 448 731 589 "},"M":{"x_min":0,"x_max":1019,"ha":1135,"o":"m 1019 0 l 823 0 l 823 819 l 618 0 l 402 0 l 194 818 l 194 0 l 0 0 l 0 1013 l 309 1012 l 510 241 l 707 1013 l 1019 1013 l 1019 0 "},"Ψ":{"x_min":0,"x_max":995,"ha":1085,"o":"m 995 698 q 924 340 995 437 q 590 200 841 227 l 590 0 l 404 0 l 404 200 q 70 340 152 227 q 0 698 0 437 l 0 1013 l 188 1013 l 188 694 q 212 472 188 525 q 404 383 254 383 l 404 1013 l 590 1013 l 590 383 q 781 472 740 383 q 807 694 807 525 l 807 1013 l 995 1013 l 995 698 "},"C":{"x_min":0,"x_max":970.828125,"ha":1043,"o":"m 970 345 q 802 70 933 169 q 490 -29 672 -29 q 130 130 268 -29 q 0 506 0 281 q 134 885 0 737 q 502 1040 275 1040 q 802 939 668 1040 q 965 679 936 838 l 745 679 q 649 809 716 761 q 495 857 582 857 q 283 747 361 857 q 214 508 214 648 q 282 267 214 367 q 493 154 359 154 q 651 204 584 154 q 752 345 718 255 l 970 345 "},"!":{"x_min":0,"x_max":204,"ha":307,"o":"m 204 739 q 182 515 204 686 q 152 282 167 398 l 52 282 q 13 589 27 473 q 0 739 0 704 l 0 1013 l 204 1013 l 204 739 m 204 0 l 0 0 l 0 203 l 204 203 l 204 0 "},"{":{"x_min":0,"x_max":501.390625,"ha":599,"o":"m 501 -285 q 229 -209 301 -285 q 176 -35 176 -155 q 182 47 176 -8 q 189 126 189 103 q 156 245 189 209 q 0 294 112 294 l 0 438 q 154 485 111 438 q 189 603 189 522 q 186 666 189 636 q 176 783 176 772 q 231 945 176 894 q 501 1015 306 1015 l 501 872 q 370 833 408 872 q 340 737 340 801 q 342 677 340 705 q 353 569 353 579 q 326 451 353 496 q 207 366 291 393 q 327 289 294 346 q 353 164 353 246 q 348 79 353 132 q 344 17 344 26 q 372 -95 344 -58 q 501 -141 408 -141 l 501 -285 "},"X":{"x_min":0,"x_max":894.453125,"ha":999,"o":"m 894 0 l 654 0 l 445 351 l 238 0 l 0 0 l 316 516 l 0 1013 l 238 1013 l 445 659 l 652 1013 l 894 1013 l 577 519 l 894 0 "},"#":{"x_min":0,"x_max":1019.453125,"ha":1117,"o":"m 1019 722 l 969 582 l 776 581 l 717 417 l 919 417 l 868 279 l 668 278 l 566 -6 l 413 -5 l 516 279 l 348 279 l 247 -6 l 94 -6 l 196 278 l 0 279 l 49 417 l 245 417 l 304 581 l 98 582 l 150 722 l 354 721 l 455 1006 l 606 1006 l 507 721 l 673 722 l 776 1006 l 927 1006 l 826 721 l 1019 722 m 627 581 l 454 581 l 394 417 l 567 417 l 627 581 "},"ι":{"x_min":42,"x_max":242,"ha":389,"o":"m 242 0 l 42 0 l 42 749 l 242 749 l 242 0 "},"Ά":{"x_min":0,"x_max":995.828125,"ha":1072,"o":"m 313 1035 l 98 780 l 0 780 l 136 1035 l 313 1035 m 995 0 l 776 0 l 708 208 l 315 208 l 247 0 l 29 0 l 390 1012 l 629 1012 l 995 0 m 652 376 l 509 809 l 369 376 l 652 376 "},")":{"x_min":0,"x_max":389,"ha":486,"o":"m 389 357 q 319 14 389 187 q 145 -293 259 -134 l 0 -293 q 139 22 90 -142 q 189 358 189 187 q 139 689 189 525 q 0 1013 90 853 l 145 1013 q 319 703 258 857 q 389 357 389 528 "},"ε":{"x_min":16.671875,"x_max":652.78125,"ha":742,"o":"m 652 259 q 565 49 652 123 q 340 -25 479 -25 q 102 39 188 -25 q 16 197 16 104 q 45 299 16 249 q 134 390 75 348 q 58 456 86 419 q 25 552 25 502 q 120 717 25 653 q 322 776 208 776 q 537 710 456 776 q 625 508 625 639 l 445 508 q 415 585 445 563 q 327 608 386 608 q 254 590 293 608 q 215 544 215 573 q 252 469 215 490 q 336 453 280 453 q 369 455 347 453 q 400 456 391 456 l 400 308 l 329 308 q 247 291 280 308 q 204 223 204 269 q 255 154 204 172 q 345 143 286 143 q 426 174 398 143 q 454 259 454 206 l 652 259 "},"Δ":{"x_min":0,"x_max":981.953125,"ha":1057,"o":"m 981 0 l 0 0 l 386 1013 l 594 1013 l 981 0 m 715 175 l 490 765 l 266 175 l 715 175 "},"}":{"x_min":0,"x_max":500,"ha":597,"o":"m 500 294 q 348 246 390 294 q 315 128 315 209 q 320 42 315 101 q 326 -48 326 -17 q 270 -214 326 -161 q 0 -285 196 -285 l 0 -141 q 126 -97 90 -141 q 154 8 154 -64 q 150 91 154 37 q 146 157 146 145 q 172 281 146 235 q 294 366 206 339 q 173 451 208 390 q 146 576 146 500 q 150 655 146 603 q 154 731 154 708 q 126 831 154 799 q 0 872 90 872 l 0 1015 q 270 944 196 1015 q 326 777 326 891 q 322 707 326 747 q 313 593 313 612 q 347 482 313 518 q 500 438 390 438 l 500 294 "},"‰":{"x_min":0,"x_max":1681,"ha":1775,"o":"m 861 484 q 1048 404 979 484 q 1111 228 1111 332 q 1048 51 1111 123 q 859 -29 979 -29 q 672 50 740 -29 q 610 227 610 122 q 672 403 610 331 q 861 484 741 484 m 861 120 q 939 151 911 120 q 967 226 967 183 q 942 299 967 270 q 861 333 912 333 q 783 301 811 333 q 756 226 756 269 q 783 151 756 182 q 861 120 810 120 m 904 984 l 316 -28 l 205 -29 l 793 983 l 904 984 m 250 984 q 436 904 366 984 q 499 730 499 832 q 436 552 499 626 q 248 472 366 472 q 62 552 132 472 q 0 728 0 624 q 62 903 0 831 q 250 984 132 984 m 249 835 q 169 801 198 835 q 140 725 140 768 q 167 652 140 683 q 247 621 195 621 q 327 654 298 621 q 357 730 357 687 q 329 803 357 772 q 249 835 301 835 m 1430 484 q 1618 404 1548 484 q 1681 228 1681 332 q 1618 51 1681 123 q 1429 -29 1548 -29 q 1241 50 1309 -29 q 1179 227 1179 122 q 1241 403 1179 331 q 1430 484 1311 484 m 1431 120 q 1509 151 1481 120 q 1537 226 1537 183 q 1511 299 1537 270 q 1431 333 1482 333 q 1352 301 1380 333 q 1325 226 1325 269 q 1352 151 1325 182 q 1431 120 1379 120 "},"a":{"x_min":0,"x_max":700,"ha":786,"o":"m 700 0 l 488 0 q 465 93 469 45 q 365 5 427 37 q 233 -26 303 -26 q 65 37 130 -26 q 0 205 0 101 q 120 409 0 355 q 343 452 168 431 q 465 522 465 468 q 424 588 465 565 q 337 611 384 611 q 250 581 285 611 q 215 503 215 552 l 26 503 q 113 707 26 633 q 328 775 194 775 q 538 723 444 775 q 657 554 657 659 l 657 137 q 666 73 657 101 q 700 33 675 45 l 700 0 m 465 297 l 465 367 q 299 322 358 340 q 193 217 193 287 q 223 150 193 174 q 298 127 254 127 q 417 175 370 127 q 465 297 465 224 "},"—":{"x_min":0,"x_max":941.671875,"ha":1039,"o":"m 941 297 l 0 297 l 0 450 l 941 450 l 941 297 "},"=":{"x_min":29.171875,"x_max":798.609375,"ha":828,"o":"m 798 502 l 29 502 l 29 635 l 798 635 l 798 502 m 798 204 l 29 204 l 29 339 l 798 339 l 798 204 "},"N":{"x_min":0,"x_max":833,"ha":949,"o":"m 833 0 l 617 0 l 206 695 l 206 0 l 0 0 l 0 1013 l 216 1013 l 629 315 l 629 1013 l 833 1013 l 833 0 "},"ρ":{"x_min":0,"x_max":722,"ha":810,"o":"m 364 -17 q 271 0 313 -17 q 194 48 230 16 l 194 -278 l 0 -278 l 0 370 q 87 656 0 548 q 358 775 183 775 q 626 655 524 775 q 722 372 722 541 q 621 95 722 208 q 364 -17 520 -17 m 360 607 q 237 529 280 607 q 201 377 201 463 q 234 229 201 292 q 355 147 277 147 q 467 210 419 147 q 515 374 515 273 q 471 537 515 468 q 360 607 428 607 "},"2":{"x_min":64,"x_max":764,"ha":828,"o":"m 764 685 q 675 452 764 541 q 484 325 637 415 q 307 168 357 250 l 754 168 l 754 0 l 64 0 q 193 301 64 175 q 433 480 202 311 q 564 673 564 576 q 519 780 564 737 q 416 824 475 824 q 318 780 358 824 q 262 633 270 730 l 80 633 q 184 903 80 807 q 415 988 276 988 q 654 907 552 988 q 764 685 764 819 "},"¯":{"x_min":0,"x_max":775,"ha":771,"o":"m 775 958 l 0 958 l 0 1111 l 775 1111 l 775 958 "},"Z":{"x_min":0,"x_max":804.171875,"ha":906,"o":"m 804 836 l 251 182 l 793 182 l 793 0 l 0 0 l 0 176 l 551 830 l 11 830 l 11 1013 l 804 1013 l 804 836 "},"u":{"x_min":0,"x_max":668,"ha":782,"o":"m 668 0 l 474 0 l 474 89 q 363 9 425 37 q 233 -19 301 -19 q 61 53 123 -19 q 0 239 0 126 l 0 749 l 199 749 l 199 296 q 225 193 199 233 q 316 146 257 146 q 424 193 380 146 q 469 304 469 240 l 469 749 l 668 749 l 668 0 "},"k":{"x_min":0,"x_max":688.890625,"ha":771,"o":"m 688 0 l 450 0 l 270 316 l 196 237 l 196 0 l 0 0 l 0 1013 l 196 1013 l 196 483 l 433 748 l 675 748 l 413 469 l 688 0 "},"Η":{"x_min":0,"x_max":837,"ha":950,"o":"m 837 0 l 627 0 l 627 450 l 210 450 l 210 0 l 0 0 l 0 1013 l 210 1013 l 210 635 l 627 635 l 627 1013 l 837 1013 l 837 0 "},"Α":{"x_min":0,"x_max":966.671875,"ha":1043,"o":"m 966 0 l 747 0 l 679 208 l 286 208 l 218 0 l 0 0 l 361 1013 l 600 1013 l 966 0 m 623 376 l 480 809 l 340 376 l 623 376 "},"s":{"x_min":0,"x_max":681,"ha":775,"o":"m 681 229 q 568 33 681 105 q 340 -29 471 -29 q 107 39 202 -29 q 0 245 0 114 l 201 245 q 252 155 201 189 q 358 128 295 128 q 436 144 401 128 q 482 205 482 166 q 363 284 482 255 q 143 348 181 329 q 25 533 25 408 q 129 716 25 647 q 340 778 220 778 q 554 710 465 778 q 658 522 643 643 l 463 522 q 419 596 458 570 q 327 622 380 622 q 255 606 290 622 q 221 556 221 590 q 339 473 221 506 q 561 404 528 420 q 681 229 681 344 "},"B":{"x_min":0,"x_max":835,"ha":938,"o":"m 674 547 q 791 450 747 518 q 835 304 835 383 q 718 75 835 158 q 461 0 612 0 l 0 0 l 0 1013 l 477 1013 q 697 951 609 1013 q 797 754 797 880 q 765 630 797 686 q 674 547 734 575 m 438 621 q 538 646 495 621 q 590 730 590 676 q 537 814 590 785 q 436 838 494 838 l 199 838 l 199 621 l 438 621 m 445 182 q 561 211 513 182 q 618 311 618 247 q 565 410 618 375 q 444 446 512 446 l 199 446 l 199 182 l 445 182 "},"…":{"x_min":0,"x_max":819,"ha":963,"o":"m 206 0 l 0 0 l 0 207 l 206 207 l 206 0 m 512 0 l 306 0 l 306 207 l 512 207 l 512 0 m 819 0 l 613 0 l 613 207 l 819 207 l 819 0 "},"?":{"x_min":1,"x_max":687,"ha":785,"o":"m 687 734 q 621 563 687 634 q 501 454 560 508 q 436 293 436 386 l 251 293 l 251 391 q 363 557 251 462 q 476 724 476 653 q 432 827 476 788 q 332 866 389 866 q 238 827 275 866 q 195 699 195 781 l 1 699 q 110 955 1 861 q 352 1040 210 1040 q 582 963 489 1040 q 687 734 687 878 m 446 0 l 243 0 l 243 203 l 446 203 l 446 0 "},"H":{"x_min":0,"x_max":838,"ha":953,"o":"m 838 0 l 628 0 l 628 450 l 210 450 l 210 0 l 0 0 l 0 1013 l 210 1013 l 210 635 l 628 635 l 628 1013 l 838 1013 l 838 0 "},"ν":{"x_min":0,"x_max":740.28125,"ha":828,"o":"m 740 749 l 473 0 l 266 0 l 0 749 l 222 749 l 373 211 l 529 749 l 740 749 "},"c":{"x_min":0,"x_max":751.390625,"ha":828,"o":"m 751 282 q 625 58 725 142 q 384 -26 526 -26 q 107 84 215 -26 q 0 366 0 195 q 98 651 0 536 q 370 774 204 774 q 616 700 518 774 q 751 486 715 626 l 536 486 q 477 570 516 538 q 380 607 434 607 q 248 533 298 607 q 204 378 204 466 q 242 219 204 285 q 377 139 290 139 q 483 179 438 139 q 543 282 527 220 l 751 282 "},"¶":{"x_min":0,"x_max":566.671875,"ha":678,"o":"m 21 892 l 52 892 l 98 761 l 145 892 l 176 892 l 178 741 l 157 741 l 157 867 l 108 741 l 88 741 l 40 871 l 40 741 l 21 741 l 21 892 m 308 854 l 308 731 q 252 691 308 691 q 227 691 240 691 q 207 696 213 695 l 207 712 l 253 706 q 288 733 288 706 l 288 763 q 244 741 279 741 q 193 797 193 741 q 261 860 193 860 q 287 860 273 860 q 308 854 302 855 m 288 842 l 263 843 q 213 796 213 843 q 248 756 213 756 q 288 796 288 756 l 288 842 m 566 988 l 502 988 l 502 -1 l 439 -1 l 439 988 l 317 988 l 317 -1 l 252 -1 l 252 602 q 81 653 155 602 q 0 805 0 711 q 101 989 0 918 q 309 1053 194 1053 l 566 1053 l 566 988 "},"β":{"x_min":0,"x_max":703,"ha":789,"o":"m 510 539 q 651 429 600 501 q 703 262 703 357 q 617 53 703 136 q 404 -29 532 -29 q 199 51 279 -29 l 199 -278 l 0 -278 l 0 627 q 77 911 0 812 q 343 1021 163 1021 q 551 957 464 1021 q 649 769 649 886 q 613 638 649 697 q 510 539 577 579 m 344 136 q 452 181 408 136 q 497 291 497 227 q 435 409 497 369 q 299 444 381 444 l 299 600 q 407 634 363 600 q 452 731 452 669 q 417 820 452 784 q 329 857 382 857 q 217 775 246 857 q 199 622 199 725 l 199 393 q 221 226 199 284 q 344 136 254 136 "},"Μ":{"x_min":0,"x_max":1019,"ha":1132,"o":"m 1019 0 l 823 0 l 823 818 l 617 0 l 402 0 l 194 818 l 194 0 l 0 0 l 0 1013 l 309 1013 l 509 241 l 708 1013 l 1019 1013 l 1019 0 "},"Ό":{"x_min":0.15625,"x_max":1174,"ha":1271,"o":"m 676 -29 q 312 127 451 -29 q 179 505 179 277 q 311 883 179 733 q 676 1040 449 1040 q 1040 883 901 1040 q 1174 505 1174 733 q 1041 127 1174 277 q 676 -29 903 -29 m 676 154 q 890 266 811 154 q 961 506 961 366 q 891 745 961 648 q 676 857 812 857 q 462 747 541 857 q 392 506 392 648 q 461 266 392 365 q 676 154 540 154 m 314 1034 l 98 779 l 0 779 l 136 1034 l 314 1034 "},"Ή":{"x_min":0,"x_max":1248,"ha":1361,"o":"m 1248 0 l 1038 0 l 1038 450 l 621 450 l 621 0 l 411 0 l 411 1012 l 621 1012 l 621 635 l 1038 635 l 1038 1012 l 1248 1012 l 1248 0 m 313 1035 l 98 780 l 0 780 l 136 1035 l 313 1035 "},"•":{"x_min":-27.78125,"x_max":691.671875,"ha":775,"o":"m 691 508 q 588 252 691 358 q 331 147 486 147 q 77 251 183 147 q -27 508 -27 355 q 75 761 -27 655 q 331 868 179 868 q 585 763 479 868 q 691 508 691 658 "},"¥":{"x_min":0,"x_max":836,"ha":931,"o":"m 195 625 l 0 1013 l 208 1013 l 427 576 l 626 1013 l 836 1013 l 650 625 l 777 625 l 777 472 l 578 472 l 538 389 l 777 389 l 777 236 l 532 236 l 532 0 l 322 0 l 322 236 l 79 236 l 79 389 l 315 389 l 273 472 l 79 472 l 79 625 l 195 625 "},"(":{"x_min":0,"x_max":388.890625,"ha":486,"o":"m 388 -293 l 243 -293 q 70 14 130 -134 q 0 357 0 189 q 69 703 0 526 q 243 1013 129 856 l 388 1013 q 248 695 297 860 q 200 358 200 530 q 248 24 200 187 q 388 -293 297 -138 "},"U":{"x_min":0,"x_max":813,"ha":926,"o":"m 813 362 q 697 79 813 187 q 405 -29 582 -29 q 114 78 229 -29 q 0 362 0 186 l 0 1013 l 210 1013 l 210 387 q 260 226 210 291 q 408 154 315 154 q 554 226 500 154 q 603 387 603 291 l 603 1013 l 813 1013 l 813 362 "},"γ":{"x_min":0.0625,"x_max":729.234375,"ha":815,"o":"m 729 749 l 457 37 l 457 -278 l 257 -278 l 257 37 q 218 155 243 95 q 170 275 194 215 l 0 749 l 207 749 l 363 284 l 522 749 l 729 749 "},"α":{"x_min":-1,"x_max":722,"ha":835,"o":"m 722 0 l 531 0 l 530 101 q 433 8 491 41 q 304 -25 375 -25 q 72 104 157 -25 q -1 372 -1 216 q 72 643 -1 530 q 308 775 158 775 q 433 744 375 775 q 528 656 491 713 l 528 749 l 722 749 l 722 0 m 361 601 q 233 527 277 601 q 196 375 196 464 q 232 224 196 288 q 358 144 277 144 q 487 217 441 144 q 528 370 528 281 q 489 523 528 457 q 361 601 443 601 "},"F":{"x_min":0,"x_max":706.953125,"ha":778,"o":"m 706 837 l 206 837 l 206 606 l 645 606 l 645 431 l 206 431 l 206 0 l 0 0 l 0 1013 l 706 1013 l 706 837 "},"­":{"x_min":0,"x_max":704.171875,"ha":801,"o":"m 704 297 l 0 297 l 0 450 l 704 450 l 704 297 "},":":{"x_min":0,"x_max":207,"ha":304,"o":"m 207 528 l 0 528 l 0 735 l 207 735 l 207 528 m 207 0 l 0 0 l 0 207 l 207 207 l 207 0 "},"Χ":{"x_min":0,"x_max":894.453125,"ha":978,"o":"m 894 0 l 654 0 l 445 351 l 238 0 l 0 0 l 316 516 l 0 1013 l 238 1013 l 445 660 l 652 1013 l 894 1013 l 577 519 l 894 0 "},"*":{"x_min":115,"x_max":713,"ha":828,"o":"m 713 740 l 518 688 l 651 525 l 531 438 l 412 612 l 290 439 l 173 523 l 308 688 l 115 741 l 159 880 l 342 816 l 343 1013 l 482 1013 l 481 816 l 664 880 l 713 740 "},"†":{"x_min":0,"x_max":809,"ha":894,"o":"m 509 804 l 809 804 l 809 621 l 509 621 l 509 0 l 299 0 l 299 621 l 0 621 l 0 804 l 299 804 l 299 1011 l 509 1011 l 509 804 "},"°":{"x_min":-1,"x_max":363,"ha":460,"o":"m 181 808 q 46 862 94 808 q -1 992 -1 917 q 44 1118 -1 1066 q 181 1175 96 1175 q 317 1118 265 1175 q 363 991 363 1066 q 315 862 363 917 q 181 808 267 808 m 181 908 q 240 933 218 908 q 263 992 263 958 q 242 1051 263 1027 q 181 1075 221 1075 q 120 1050 142 1075 q 99 991 99 1026 q 120 933 99 958 q 181 908 142 908 "},"V":{"x_min":0,"x_max":895.828125,"ha":997,"o":"m 895 1013 l 550 0 l 347 0 l 0 1013 l 231 1013 l 447 256 l 666 1013 l 895 1013 "},"Ξ":{"x_min":0,"x_max":751.390625,"ha":800,"o":"m 733 826 l 5 826 l 5 1012 l 733 1012 l 733 826 m 681 432 l 65 432 l 65 617 l 681 617 l 681 432 m 751 0 l 0 0 l 0 183 l 751 183 l 751 0 "}," ":{"x_min":0,"x_max":0,"ha":853},"Ϋ":{"x_min":-0.21875,"x_max":836.171875,"ha":914,"o":"m 610 1046 l 454 1046 l 454 1215 l 610 1215 l 610 1046 m 369 1046 l 212 1046 l 212 1215 l 369 1215 l 369 1046 m 836 1012 l 532 376 l 532 0 l 322 0 l 322 376 l 0 1012 l 208 1012 l 427 576 l 626 1012 l 836 1012 "},"0":{"x_min":51,"x_max":779,"ha":828,"o":"m 415 -26 q 142 129 242 -26 q 51 476 51 271 q 141 825 51 683 q 415 984 242 984 q 687 825 585 984 q 779 476 779 682 q 688 131 779 271 q 415 -26 587 -26 m 415 137 q 529 242 485 137 q 568 477 568 338 q 530 713 568 619 q 415 821 488 821 q 303 718 344 821 q 262 477 262 616 q 301 237 262 337 q 415 137 341 137 "},"”":{"x_min":0,"x_max":469,"ha":567,"o":"m 192 834 q 137 692 192 751 q 0 626 83 634 l 0 697 q 101 831 101 723 l 0 831 l 0 1013 l 192 1013 l 192 834 m 469 834 q 414 692 469 751 q 277 626 360 634 l 277 697 q 379 831 379 723 l 277 831 l 277 1013 l 469 1013 l 469 834 "},"@":{"x_min":0,"x_max":1276,"ha":1374,"o":"m 1115 -52 q 895 -170 1015 -130 q 647 -211 776 -211 q 158 -34 334 -211 q 0 360 0 123 q 179 810 0 621 q 698 1019 377 1019 q 1138 859 981 1019 q 1276 514 1276 720 q 1173 210 1276 335 q 884 75 1062 75 q 784 90 810 75 q 737 186 749 112 q 647 104 698 133 q 532 75 596 75 q 360 144 420 75 q 308 308 308 205 q 398 568 308 451 q 638 696 497 696 q 731 671 690 696 q 805 604 772 647 l 840 673 l 964 673 q 886 373 915 490 q 856 239 856 257 q 876 201 856 214 q 920 188 895 188 q 1084 284 1019 188 q 1150 511 1150 380 q 1051 779 1150 672 q 715 905 934 905 q 272 734 439 905 q 121 363 121 580 q 250 41 121 170 q 647 -103 394 -103 q 863 -67 751 -103 q 1061 26 975 -32 l 1115 -52 m 769 483 q 770 500 770 489 q 733 567 770 539 q 651 596 695 596 q 508 504 566 596 q 457 322 457 422 q 483 215 457 256 q 561 175 509 175 q 671 221 625 175 q 733 333 718 268 l 769 483 "},"Ί":{"x_min":0,"x_max":619,"ha":732,"o":"m 313 1035 l 98 780 l 0 780 l 136 1035 l 313 1035 m 619 0 l 411 0 l 411 1012 l 619 1012 l 619 0 "},"i":{"x_min":14,"x_max":214,"ha":326,"o":"m 214 830 l 14 830 l 14 1013 l 214 1013 l 214 830 m 214 0 l 14 0 l 14 748 l 214 748 l 214 0 "},"Β":{"x_min":0,"x_max":835,"ha":961,"o":"m 675 547 q 791 450 747 518 q 835 304 835 383 q 718 75 835 158 q 461 0 612 0 l 0 0 l 0 1013 l 477 1013 q 697 951 609 1013 q 797 754 797 880 q 766 630 797 686 q 675 547 734 575 m 439 621 q 539 646 496 621 q 590 730 590 676 q 537 814 590 785 q 436 838 494 838 l 199 838 l 199 621 l 439 621 m 445 182 q 561 211 513 182 q 618 311 618 247 q 565 410 618 375 q 444 446 512 446 l 199 446 l 199 182 l 445 182 "},"υ":{"x_min":0,"x_max":656,"ha":767,"o":"m 656 416 q 568 55 656 145 q 326 -25 490 -25 q 59 97 137 -25 q 0 369 0 191 l 0 749 l 200 749 l 200 369 q 216 222 200 268 q 326 142 245 142 q 440 247 411 142 q 456 422 456 304 l 456 749 l 656 749 l 656 416 "},"]":{"x_min":0,"x_max":349,"ha":446,"o":"m 349 -300 l 0 -300 l 0 -154 l 163 -154 l 163 866 l 0 866 l 0 1013 l 349 1013 l 349 -300 "},"m":{"x_min":0,"x_max":1065,"ha":1174,"o":"m 1065 0 l 866 0 l 866 483 q 836 564 866 532 q 759 596 807 596 q 663 555 700 596 q 627 454 627 514 l 627 0 l 433 0 l 433 481 q 403 563 433 531 q 323 596 374 596 q 231 554 265 596 q 197 453 197 513 l 197 0 l 0 0 l 0 748 l 189 748 l 189 665 q 279 745 226 715 q 392 775 333 775 q 509 744 455 775 q 606 659 563 713 q 695 744 640 713 q 814 775 749 775 q 992 702 920 775 q 1065 523 1065 630 l 1065 0 "},"χ":{"x_min":0,"x_max":759.71875,"ha":847,"o":"m 759 -299 l 548 -299 l 379 66 l 215 -299 l 0 -299 l 261 233 l 13 749 l 230 749 l 379 400 l 527 749 l 738 749 l 500 238 l 759 -299 "},"8":{"x_min":57,"x_max":770,"ha":828,"o":"m 625 516 q 733 416 697 477 q 770 284 770 355 q 675 69 770 161 q 415 -29 574 -29 q 145 65 244 -29 q 57 273 57 150 q 93 413 57 350 q 204 516 130 477 q 112 609 142 556 q 83 718 83 662 q 177 905 83 824 q 414 986 272 986 q 650 904 555 986 q 745 715 745 822 q 716 608 745 658 q 625 516 688 558 m 414 590 q 516 624 479 590 q 553 706 553 659 q 516 791 553 755 q 414 828 480 828 q 311 792 348 828 q 275 706 275 757 q 310 624 275 658 q 414 590 345 590 m 413 135 q 527 179 487 135 q 564 279 564 218 q 525 386 564 341 q 411 436 482 436 q 298 387 341 436 q 261 282 261 344 q 300 178 261 222 q 413 135 340 135 "},"ί":{"x_min":42,"x_max":371.171875,"ha":389,"o":"m 242 0 l 42 0 l 42 748 l 242 748 l 242 0 m 371 1039 l 169 823 l 71 823 l 193 1039 l 371 1039 "},"Ζ":{"x_min":0,"x_max":804.171875,"ha":886,"o":"m 804 835 l 251 182 l 793 182 l 793 0 l 0 0 l 0 176 l 551 829 l 11 829 l 11 1012 l 804 1012 l 804 835 "},"R":{"x_min":0,"x_max":836.109375,"ha":947,"o":"m 836 0 l 608 0 q 588 53 596 20 q 581 144 581 86 q 581 179 581 162 q 581 215 581 197 q 553 345 581 306 q 428 393 518 393 l 208 393 l 208 0 l 0 0 l 0 1013 l 491 1013 q 720 944 630 1013 q 819 734 819 869 q 778 584 819 654 q 664 485 738 513 q 757 415 727 463 q 794 231 794 358 l 794 170 q 800 84 794 116 q 836 31 806 51 l 836 0 m 462 838 l 208 838 l 208 572 l 452 572 q 562 604 517 572 q 612 704 612 640 q 568 801 612 765 q 462 838 525 838 "},"o":{"x_min":0,"x_max":764,"ha":871,"o":"m 380 -26 q 105 86 211 -26 q 0 371 0 199 q 104 660 0 545 q 380 775 209 775 q 658 659 552 775 q 764 371 764 544 q 658 86 764 199 q 380 -26 552 -26 m 379 141 q 515 216 466 141 q 557 373 557 280 q 515 530 557 465 q 379 607 466 607 q 245 530 294 607 q 204 373 204 465 q 245 217 204 282 q 379 141 294 141 "},"5":{"x_min":59,"x_max":767,"ha":828,"o":"m 767 319 q 644 59 767 158 q 382 -29 533 -29 q 158 43 247 -29 q 59 264 59 123 l 252 264 q 295 165 252 201 q 400 129 339 129 q 512 172 466 129 q 564 308 564 220 q 514 437 564 387 q 398 488 464 488 q 329 472 361 488 q 271 420 297 456 l 93 428 l 157 958 l 722 958 l 722 790 l 295 790 l 271 593 q 348 635 306 621 q 431 649 389 649 q 663 551 560 649 q 767 319 767 453 "},"7":{"x_min":65.28125,"x_max":762.5,"ha":828,"o":"m 762 808 q 521 435 604 626 q 409 0 438 244 l 205 0 q 313 422 227 234 q 548 789 387 583 l 65 789 l 65 958 l 762 958 l 762 808 "},"K":{"x_min":0,"x_max":900,"ha":996,"o":"m 900 0 l 647 0 l 316 462 l 208 355 l 208 0 l 0 0 l 0 1013 l 208 1013 l 208 595 l 604 1013 l 863 1013 l 461 603 l 900 0 "},",":{"x_min":0,"x_max":206,"ha":303,"o":"m 206 5 q 150 -151 206 -88 q 0 -238 94 -213 l 0 -159 q 84 -100 56 -137 q 111 -2 111 -62 l 0 -2 l 0 205 l 206 205 l 206 5 "},"d":{"x_min":0,"x_max":722,"ha":836,"o":"m 722 0 l 530 0 l 530 101 q 303 -26 449 -26 q 72 103 155 -26 q 0 373 0 214 q 72 642 0 528 q 305 775 156 775 q 433 743 373 775 q 530 656 492 712 l 530 1013 l 722 1013 l 722 0 m 361 600 q 234 523 280 600 q 196 372 196 458 q 233 220 196 286 q 358 143 278 143 q 489 216 442 143 q 530 369 530 280 q 491 522 530 456 q 361 600 443 600 "},"¨":{"x_min":212,"x_max":609,"ha":933,"o":"m 609 1046 l 453 1046 l 453 1216 l 609 1216 l 609 1046 m 369 1046 l 212 1046 l 212 1216 l 369 1216 l 369 1046 "},"E":{"x_min":0,"x_max":761.109375,"ha":824,"o":"m 761 0 l 0 0 l 0 1013 l 734 1013 l 734 837 l 206 837 l 206 621 l 690 621 l 690 446 l 206 446 l 206 186 l 761 186 l 761 0 "},"Y":{"x_min":0,"x_max":836,"ha":931,"o":"m 836 1013 l 532 376 l 532 0 l 322 0 l 322 376 l 0 1013 l 208 1013 l 427 576 l 626 1013 l 836 1013 "},"\"":{"x_min":0,"x_max":357,"ha":454,"o":"m 357 604 l 225 604 l 225 988 l 357 988 l 357 604 m 132 604 l 0 604 l 0 988 l 132 988 l 132 604 "},"‹":{"x_min":35.984375,"x_max":791.671875,"ha":828,"o":"m 791 17 l 36 352 l 35 487 l 791 823 l 791 672 l 229 421 l 791 168 l 791 17 "},"„":{"x_min":0,"x_max":483,"ha":588,"o":"m 206 5 q 150 -151 206 -88 q 0 -238 94 -213 l 0 -159 q 84 -100 56 -137 q 111 -2 111 -62 l 0 -2 l 0 205 l 206 205 l 206 5 m 483 5 q 427 -151 483 -88 q 277 -238 371 -213 l 277 -159 q 361 -100 334 -137 q 388 -2 388 -62 l 277 -2 l 277 205 l 483 205 l 483 5 "},"δ":{"x_min":6,"x_max":732,"ha":835,"o":"m 732 352 q 630 76 732 177 q 354 -25 529 -25 q 101 74 197 -25 q 6 333 6 174 q 89 581 6 480 q 323 690 178 690 q 66 864 201 787 l 66 1013 l 669 1013 l 669 856 l 348 856 q 532 729 461 789 q 673 566 625 651 q 732 352 732 465 m 419 551 q 259 496 321 551 q 198 344 198 441 q 238 208 198 267 q 357 140 283 140 q 484 203 437 140 q 526 344 526 260 q 499 466 526 410 q 419 551 473 521 "},"έ":{"x_min":16.671875,"x_max":652.78125,"ha":742,"o":"m 652 259 q 565 49 652 123 q 340 -25 479 -25 q 102 39 188 -25 q 16 197 16 104 q 45 299 16 250 q 134 390 75 348 q 58 456 86 419 q 25 552 25 502 q 120 717 25 653 q 322 776 208 776 q 537 710 456 776 q 625 508 625 639 l 445 508 q 415 585 445 563 q 327 608 386 608 q 254 590 293 608 q 215 544 215 573 q 252 469 215 490 q 336 453 280 453 q 369 455 347 453 q 400 456 391 456 l 400 308 l 329 308 q 247 291 280 308 q 204 223 204 269 q 255 154 204 172 q 345 143 286 143 q 426 174 398 143 q 454 259 454 206 l 652 259 m 579 1039 l 377 823 l 279 823 l 401 1039 l 579 1039 "},"ω":{"x_min":0,"x_max":945,"ha":1051,"o":"m 565 323 l 565 289 q 577 190 565 221 q 651 142 597 142 q 718 189 694 142 q 742 365 742 237 q 703 565 742 462 q 610 749 671 650 l 814 749 q 910 547 876 650 q 945 337 945 444 q 874 96 945 205 q 668 -29 793 -29 q 551 0 608 -29 q 470 78 495 30 q 390 0 444 28 q 276 -29 337 -29 q 69 96 149 -29 q 0 337 0 204 q 36 553 0 444 q 130 749 68 650 l 334 749 q 241 565 273 650 q 203 365 203 461 q 219 222 203 279 q 292 142 243 142 q 360 183 342 142 q 373 271 373 211 q 372 298 372 285 q 372 323 372 311 l 372 528 l 566 528 l 565 323 "},"´":{"x_min":0,"x_max":132,"ha":299,"o":"m 132 604 l 0 604 l 0 988 l 132 988 l 132 604 "},"±":{"x_min":29,"x_max":798,"ha":828,"o":"m 798 480 l 484 480 l 484 254 l 344 254 l 344 480 l 29 480 l 29 615 l 344 615 l 344 842 l 484 842 l 484 615 l 798 615 l 798 480 m 798 0 l 29 0 l 29 136 l 798 136 l 798 0 "},"|":{"x_min":0,"x_max":143,"ha":240,"o":"m 143 462 l 0 462 l 0 984 l 143 984 l 143 462 m 143 -242 l 0 -242 l 0 280 l 143 280 l 143 -242 "},"ϋ":{"x_min":0,"x_max":656,"ha":767,"o":"m 535 810 l 406 810 l 406 952 l 535 952 l 535 810 m 271 810 l 142 810 l 142 952 l 271 952 l 271 810 m 656 417 q 568 55 656 146 q 326 -25 490 -25 q 59 97 137 -25 q 0 369 0 192 l 0 748 l 200 748 l 200 369 q 216 222 200 268 q 326 142 245 142 q 440 247 411 142 q 456 422 456 304 l 456 748 l 656 748 l 656 417 "},"§":{"x_min":0,"x_max":633,"ha":731,"o":"m 633 469 q 601 356 633 406 q 512 274 569 305 q 570 197 548 242 q 593 105 593 152 q 501 -76 593 -5 q 301 -142 416 -142 q 122 -82 193 -142 q 43 108 43 -15 l 212 108 q 251 27 220 53 q 321 1 283 1 q 389 23 360 1 q 419 83 419 46 q 310 194 419 139 q 108 297 111 295 q 0 476 0 372 q 33 584 0 537 q 120 659 62 626 q 72 720 91 686 q 53 790 53 755 q 133 978 53 908 q 312 1042 207 1042 q 483 984 412 1042 q 574 807 562 921 l 409 807 q 379 875 409 851 q 307 900 349 900 q 244 881 270 900 q 218 829 218 862 q 324 731 218 781 q 524 636 506 647 q 633 469 633 565 m 419 334 q 473 411 473 372 q 451 459 473 436 q 390 502 430 481 l 209 595 q 167 557 182 577 q 153 520 153 537 q 187 461 153 491 q 263 413 212 440 l 419 334 "},"b":{"x_min":0,"x_max":722,"ha":822,"o":"m 416 -26 q 289 6 346 -26 q 192 101 232 39 l 192 0 l 0 0 l 0 1013 l 192 1013 l 192 656 q 286 743 226 712 q 415 775 346 775 q 649 644 564 775 q 722 374 722 533 q 649 106 722 218 q 416 -26 565 -26 m 361 600 q 232 524 279 600 q 192 371 192 459 q 229 221 192 284 q 357 145 275 145 q 487 221 441 145 q 526 374 526 285 q 488 523 526 460 q 361 600 442 600 "},"q":{"x_min":0,"x_max":722,"ha":833,"o":"m 722 -298 l 530 -298 l 530 97 q 306 -25 449 -25 q 73 104 159 -25 q 0 372 0 216 q 72 643 0 529 q 305 775 156 775 q 430 742 371 775 q 530 654 488 709 l 530 750 l 722 750 l 722 -298 m 360 601 q 234 527 278 601 q 197 378 197 466 q 233 225 197 291 q 357 144 277 144 q 488 217 441 144 q 530 370 530 282 q 491 523 530 459 q 360 601 443 601 "},"Ω":{"x_min":-0.03125,"x_max":1008.53125,"ha":1108,"o":"m 1008 0 l 589 0 l 589 199 q 717 368 670 265 q 764 580 764 471 q 698 778 764 706 q 504 855 629 855 q 311 773 380 855 q 243 563 243 691 q 289 360 243 458 q 419 199 336 262 l 419 0 l 0 0 l 0 176 l 202 176 q 77 355 123 251 q 32 569 32 459 q 165 908 32 776 q 505 1040 298 1040 q 844 912 711 1040 q 977 578 977 785 q 931 362 977 467 q 805 176 886 256 l 1008 176 l 1008 0 "},"ύ":{"x_min":0,"x_max":656,"ha":767,"o":"m 656 417 q 568 55 656 146 q 326 -25 490 -25 q 59 97 137 -25 q 0 369 0 192 l 0 748 l 200 748 l 201 369 q 218 222 201 269 q 326 142 245 142 q 440 247 411 142 q 456 422 456 304 l 456 748 l 656 748 l 656 417 m 579 1039 l 378 823 l 279 823 l 401 1039 l 579 1039 "},"z":{"x_min":0,"x_max":663.890625,"ha":753,"o":"m 663 0 l 0 0 l 0 154 l 411 591 l 25 591 l 25 749 l 650 749 l 650 584 l 245 165 l 663 165 l 663 0 "},"™":{"x_min":0,"x_max":951,"ha":1063,"o":"m 405 921 l 255 921 l 255 506 l 149 506 l 149 921 l 0 921 l 0 1013 l 405 1013 l 405 921 m 951 506 l 852 506 l 852 916 l 750 506 l 643 506 l 539 915 l 539 506 l 442 506 l 442 1013 l 595 1012 l 695 625 l 794 1013 l 951 1013 l 951 506 "},"ή":{"x_min":0,"x_max":669,"ha":779,"o":"m 669 -278 l 469 -278 l 469 390 q 448 526 469 473 q 348 606 417 606 q 244 553 288 606 q 201 441 201 501 l 201 0 l 0 0 l 0 749 l 201 749 l 201 665 q 301 744 244 715 q 423 774 359 774 q 606 685 538 774 q 669 484 669 603 l 669 -278 m 495 1039 l 293 823 l 195 823 l 317 1039 l 495 1039 "},"Θ":{"x_min":0,"x_max":993,"ha":1092,"o":"m 497 -29 q 133 127 272 -29 q 0 505 0 277 q 133 883 0 733 q 497 1040 272 1040 q 861 883 722 1040 q 993 505 993 733 q 861 127 993 277 q 497 -29 722 -29 m 497 154 q 711 266 631 154 q 782 506 782 367 q 712 746 782 648 q 497 858 634 858 q 281 746 361 858 q 211 506 211 648 q 280 266 211 365 q 497 154 359 154 m 676 430 l 316 430 l 316 593 l 676 593 l 676 430 "},"®":{"x_min":3,"x_max":1007,"ha":1104,"o":"m 507 -6 q 129 153 269 -6 q 3 506 3 298 q 127 857 3 713 q 502 1017 266 1017 q 880 855 740 1017 q 1007 502 1007 711 q 882 152 1007 295 q 507 -6 743 -6 m 502 934 q 184 800 302 934 q 79 505 79 680 q 184 210 79 331 q 501 76 302 76 q 819 210 701 76 q 925 507 925 331 q 820 800 925 682 q 502 934 704 934 m 782 190 l 639 190 q 627 225 632 202 q 623 285 623 248 l 623 326 q 603 411 623 384 q 527 439 584 439 l 388 439 l 388 190 l 257 190 l 257 829 l 566 829 q 709 787 654 829 q 772 654 772 740 q 746 559 772 604 q 675 497 720 514 q 735 451 714 483 q 756 341 756 419 l 756 299 q 760 244 756 265 q 782 212 764 223 l 782 190 m 546 718 l 388 718 l 388 552 l 541 552 q 612 572 584 552 q 641 635 641 593 q 614 695 641 672 q 546 718 587 718 "},"~":{"x_min":0,"x_max":851,"ha":949,"o":"m 851 968 q 795 750 851 831 q 599 656 730 656 q 406 744 506 656 q 259 832 305 832 q 162 775 193 832 q 139 656 139 730 l 0 656 q 58 871 0 787 q 251 968 124 968 q 442 879 341 968 q 596 791 544 791 q 691 849 663 791 q 712 968 712 892 l 851 968 "},"Ε":{"x_min":0,"x_max":761.546875,"ha":824,"o":"m 761 0 l 0 0 l 0 1012 l 735 1012 l 735 836 l 206 836 l 206 621 l 690 621 l 690 446 l 206 446 l 206 186 l 761 186 l 761 0 "},"³":{"x_min":0,"x_max":467,"ha":564,"o":"m 467 555 q 393 413 467 466 q 229 365 325 365 q 70 413 134 365 q 0 565 0 467 l 123 565 q 163 484 131 512 q 229 461 190 461 q 299 486 269 461 q 329 553 329 512 q 281 627 329 607 q 187 641 248 641 l 187 722 q 268 737 237 722 q 312 804 312 758 q 285 859 312 837 q 224 882 259 882 q 165 858 189 882 q 135 783 140 834 l 12 783 q 86 930 20 878 q 230 976 145 976 q 379 931 314 976 q 444 813 444 887 q 423 744 444 773 q 365 695 402 716 q 439 640 412 676 q 467 555 467 605 "},"[":{"x_min":0,"x_max":347.21875,"ha":444,"o":"m 347 -300 l 0 -300 l 0 1013 l 347 1013 l 347 866 l 188 866 l 188 -154 l 347 -154 l 347 -300 "},"L":{"x_min":0,"x_max":704.171875,"ha":763,"o":"m 704 0 l 0 0 l 0 1013 l 208 1013 l 208 186 l 704 186 l 704 0 "},"σ":{"x_min":0,"x_max":851.3125,"ha":940,"o":"m 851 594 l 712 594 q 761 369 761 485 q 658 83 761 191 q 379 -25 555 -25 q 104 87 208 -25 q 0 372 0 200 q 103 659 0 544 q 378 775 207 775 q 464 762 407 775 q 549 750 521 750 l 851 750 l 851 594 m 379 142 q 515 216 466 142 q 557 373 557 280 q 515 530 557 465 q 379 608 465 608 q 244 530 293 608 q 203 373 203 465 q 244 218 203 283 q 379 142 293 142 "},"ζ":{"x_min":0,"x_max":622,"ha":701,"o":"m 622 -32 q 604 -158 622 -98 q 551 -278 587 -218 l 373 -278 q 426 -180 406 -229 q 446 -80 446 -131 q 421 -22 446 -37 q 354 -8 397 -8 q 316 -9 341 -8 q 280 -11 291 -11 q 75 69 150 -11 q 0 283 0 150 q 87 596 0 437 q 291 856 162 730 l 47 856 l 47 1013 l 592 1013 l 592 904 q 317 660 422 800 q 197 318 197 497 q 306 141 197 169 q 510 123 408 131 q 622 -32 622 102 "},"θ":{"x_min":0,"x_max":714,"ha":817,"o":"m 357 1022 q 633 833 534 1022 q 714 486 714 679 q 634 148 714 288 q 354 -25 536 -25 q 79 147 175 -25 q 0 481 0 288 q 79 831 0 679 q 357 1022 177 1022 m 510 590 q 475 763 510 687 q 351 862 430 862 q 233 763 272 862 q 204 590 204 689 l 510 590 m 510 440 l 204 440 q 233 251 204 337 q 355 131 274 131 q 478 248 434 131 q 510 440 510 337 "},"Ο":{"x_min":0,"x_max":995,"ha":1092,"o":"m 497 -29 q 133 127 272 -29 q 0 505 0 277 q 132 883 0 733 q 497 1040 270 1040 q 861 883 722 1040 q 995 505 995 733 q 862 127 995 277 q 497 -29 724 -29 m 497 154 q 711 266 632 154 q 781 506 781 365 q 711 745 781 647 q 497 857 632 857 q 283 747 361 857 q 213 506 213 647 q 282 266 213 365 q 497 154 361 154 "},"Γ":{"x_min":0,"x_max":703.84375,"ha":742,"o":"m 703 836 l 208 836 l 208 0 l 0 0 l 0 1012 l 703 1012 l 703 836 "}," ":{"x_min":0,"x_max":0,"ha":375},"%":{"x_min":0,"x_max":1111,"ha":1213,"o":"m 861 484 q 1048 404 979 484 q 1111 228 1111 332 q 1048 51 1111 123 q 859 -29 979 -29 q 672 50 740 -29 q 610 227 610 122 q 672 403 610 331 q 861 484 741 484 m 861 120 q 939 151 911 120 q 967 226 967 183 q 942 299 967 270 q 861 333 912 333 q 783 301 811 333 q 756 226 756 269 q 783 151 756 182 q 861 120 810 120 m 904 984 l 316 -28 l 205 -29 l 793 983 l 904 984 m 250 984 q 436 904 366 984 q 499 730 499 832 q 436 552 499 626 q 248 472 366 472 q 62 552 132 472 q 0 728 0 624 q 62 903 0 831 q 250 984 132 984 m 249 835 q 169 801 198 835 q 140 725 140 768 q 167 652 140 683 q 247 621 195 621 q 327 654 298 621 q 357 730 357 687 q 329 803 357 772 q 249 835 301 835 "},"P":{"x_min":0,"x_max":771,"ha":838,"o":"m 208 361 l 208 0 l 0 0 l 0 1013 l 450 1013 q 682 919 593 1013 q 771 682 771 826 q 687 452 771 544 q 466 361 604 361 l 208 361 m 421 837 l 208 837 l 208 544 l 410 544 q 525 579 480 544 q 571 683 571 615 q 527 792 571 747 q 421 837 484 837 "},"Έ":{"x_min":0,"x_max":1172.546875,"ha":1235,"o":"m 1172 0 l 411 0 l 411 1012 l 1146 1012 l 1146 836 l 617 836 l 617 621 l 1101 621 l 1101 446 l 617 446 l 617 186 l 1172 186 l 1172 0 m 313 1035 l 98 780 l 0 780 l 136 1035 l 313 1035 "},"Ώ":{"x_min":0.4375,"x_max":1189.546875,"ha":1289,"o":"m 1189 0 l 770 0 l 770 199 q 897 369 849 263 q 945 580 945 474 q 879 778 945 706 q 685 855 810 855 q 492 773 561 855 q 424 563 424 691 q 470 360 424 458 q 600 199 517 262 l 600 0 l 180 0 l 180 176 l 383 176 q 258 355 304 251 q 213 569 213 459 q 346 908 213 776 q 686 1040 479 1040 q 1025 912 892 1040 q 1158 578 1158 785 q 1112 362 1158 467 q 986 176 1067 256 l 1189 176 l 1189 0 m 314 1092 l 99 837 l 0 837 l 136 1092 l 314 1092 "},"_":{"x_min":61.109375,"x_max":766.671875,"ha":828,"o":"m 766 -333 l 61 -333 l 61 -190 l 766 -190 l 766 -333 "},"Ϊ":{"x_min":-56,"x_max":342,"ha":503,"o":"m 342 1046 l 186 1046 l 186 1215 l 342 1215 l 342 1046 m 101 1046 l -56 1046 l -56 1215 l 101 1215 l 101 1046 m 249 0 l 41 0 l 41 1012 l 249 1012 l 249 0 "},"+":{"x_min":43,"x_max":784,"ha":828,"o":"m 784 353 l 483 353 l 483 0 l 343 0 l 343 353 l 43 353 l 43 489 l 343 489 l 343 840 l 483 840 l 483 489 l 784 489 l 784 353 "},"½":{"x_min":0,"x_max":1090,"ha":1188,"o":"m 1090 380 q 992 230 1090 301 q 779 101 886 165 q 822 94 784 95 q 924 93 859 93 l 951 93 l 973 93 l 992 93 l 1009 93 q 1046 93 1027 93 q 1085 93 1066 93 l 1085 0 l 650 0 l 654 38 q 815 233 665 137 q 965 376 965 330 q 936 436 965 412 q 869 461 908 461 q 806 435 831 461 q 774 354 780 409 l 659 354 q 724 505 659 451 q 870 554 783 554 q 1024 506 958 554 q 1090 380 1090 459 m 868 998 l 268 -28 l 154 -27 l 757 999 l 868 998 m 272 422 l 147 422 l 147 799 l 0 799 l 0 875 q 126 900 91 875 q 170 973 162 926 l 272 973 l 272 422 "},"Ρ":{"x_min":0,"x_max":771,"ha":838,"o":"m 208 361 l 208 0 l 0 0 l 0 1012 l 450 1012 q 682 919 593 1012 q 771 681 771 826 q 687 452 771 544 q 466 361 604 361 l 208 361 m 422 836 l 209 836 l 209 544 l 410 544 q 525 579 480 544 q 571 683 571 614 q 527 791 571 747 q 422 836 484 836 "},"'":{"x_min":0,"x_max":192,"ha":289,"o":"m 192 834 q 137 692 192 751 q 0 626 82 632 l 0 697 q 101 830 101 726 l 0 830 l 0 1013 l 192 1013 l 192 834 "},"ª":{"x_min":0,"x_max":350,"ha":393,"o":"m 350 625 l 245 625 q 237 648 241 636 q 233 672 233 661 q 117 611 192 611 q 33 643 66 611 q 0 727 0 675 q 116 846 0 828 q 233 886 233 864 q 211 919 233 907 q 168 931 190 931 q 108 877 108 931 l 14 877 q 56 977 14 942 q 165 1013 98 1013 q 270 987 224 1013 q 329 903 329 955 l 329 694 q 332 661 329 675 q 350 641 336 648 l 350 625 m 233 774 l 233 809 q 151 786 180 796 q 97 733 97 768 q 111 700 97 712 q 149 689 126 689 q 210 713 187 689 q 233 774 233 737 "},"΅":{"x_min":57,"x_max":584,"ha":753,"o":"m 584 810 l 455 810 l 455 952 l 584 952 l 584 810 m 521 1064 l 305 810 l 207 810 l 343 1064 l 521 1064 m 186 810 l 57 810 l 57 952 l 186 952 l 186 810 "},"T":{"x_min":0,"x_max":809,"ha":894,"o":"m 809 831 l 509 831 l 509 0 l 299 0 l 299 831 l 0 831 l 0 1013 l 809 1013 l 809 831 "},"Φ":{"x_min":0,"x_max":949,"ha":1032,"o":"m 566 0 l 385 0 l 385 121 q 111 230 222 121 q 0 508 0 340 q 112 775 0 669 q 385 892 219 875 l 385 1013 l 566 1013 l 566 892 q 836 776 732 875 q 949 507 949 671 q 838 231 949 341 q 566 121 728 121 l 566 0 m 566 285 q 701 352 650 285 q 753 508 753 419 q 703 658 753 597 q 566 729 653 720 l 566 285 m 385 285 l 385 729 q 245 661 297 717 q 193 516 193 604 q 246 356 193 427 q 385 285 300 285 "},"j":{"x_min":-45.828125,"x_max":242,"ha":361,"o":"m 242 830 l 42 830 l 42 1013 l 242 1013 l 242 830 m 242 -119 q 180 -267 242 -221 q 20 -308 127 -308 l -45 -308 l -45 -140 l -24 -140 q 25 -130 8 -140 q 42 -88 42 -120 l 42 748 l 242 748 l 242 -119 "},"Σ":{"x_min":0,"x_max":772.21875,"ha":849,"o":"m 772 0 l 0 0 l 0 140 l 368 526 l 18 862 l 18 1012 l 740 1012 l 740 836 l 315 836 l 619 523 l 298 175 l 772 175 l 772 0 "},"1":{"x_min":197.609375,"x_max":628,"ha":828,"o":"m 628 0 l 434 0 l 434 674 l 197 674 l 197 810 q 373 837 318 810 q 468 984 450 876 l 628 984 l 628 0 "},"›":{"x_min":36.109375,"x_max":792,"ha":828,"o":"m 792 352 l 36 17 l 36 168 l 594 420 l 36 672 l 36 823 l 792 487 l 792 352 "},"<":{"x_min":35.984375,"x_max":791.671875,"ha":828,"o":"m 791 17 l 36 352 l 35 487 l 791 823 l 791 672 l 229 421 l 791 168 l 791 17 "},"£":{"x_min":0,"x_max":716.546875,"ha":814,"o":"m 716 38 q 603 -9 658 5 q 502 -24 548 -24 q 398 -10 451 -24 q 239 25 266 25 q 161 12 200 25 q 77 -29 122 0 l 0 113 q 110 211 81 174 q 151 315 151 259 q 117 440 151 365 l 0 440 l 0 515 l 73 515 q 35 610 52 560 q 15 710 15 671 q 119 910 15 831 q 349 984 216 984 q 570 910 480 984 q 693 668 674 826 l 501 668 q 455 791 501 746 q 353 830 414 830 q 256 795 298 830 q 215 705 215 760 q 249 583 215 655 q 283 515 266 548 l 479 515 l 479 440 l 309 440 q 316 394 313 413 q 319 355 319 374 q 287 241 319 291 q 188 135 263 205 q 262 160 225 152 q 332 168 298 168 q 455 151 368 168 q 523 143 500 143 q 588 152 558 143 q 654 189 617 162 l 716 38 "},"t":{"x_min":0,"x_max":412,"ha":511,"o":"m 412 -6 q 349 -8 391 -6 q 287 -11 307 -11 q 137 38 177 -11 q 97 203 97 87 l 97 609 l 0 609 l 0 749 l 97 749 l 97 951 l 297 951 l 297 749 l 412 749 l 412 609 l 297 609 l 297 191 q 315 152 297 162 q 366 143 334 143 q 389 143 378 143 q 412 143 400 143 l 412 -6 "},"¬":{"x_min":0,"x_max":704,"ha":801,"o":"m 704 93 l 551 93 l 551 297 l 0 297 l 0 450 l 704 450 l 704 93 "},"λ":{"x_min":0,"x_max":701.390625,"ha":775,"o":"m 701 0 l 491 0 l 345 444 l 195 0 l 0 0 l 238 697 l 131 1013 l 334 1013 l 701 0 "},"W":{"x_min":0,"x_max":1291.671875,"ha":1399,"o":"m 1291 1013 l 1002 0 l 802 0 l 645 777 l 490 0 l 288 0 l 0 1013 l 215 1013 l 388 298 l 534 1012 l 757 1013 l 904 299 l 1076 1013 l 1291 1013 "},">":{"x_min":36.109375,"x_max":792,"ha":828,"o":"m 792 352 l 36 17 l 36 168 l 594 420 l 36 672 l 36 823 l 792 487 l 792 352 "},"v":{"x_min":0,"x_max":740.28125,"ha":828,"o":"m 740 749 l 473 0 l 266 0 l 0 749 l 222 749 l 373 211 l 529 749 l 740 749 "},"τ":{"x_min":0.28125,"x_max":618.734375,"ha":699,"o":"m 618 593 l 409 593 l 409 0 l 210 0 l 210 593 l 0 593 l 0 749 l 618 749 l 618 593 "},"ξ":{"x_min":0,"x_max":640,"ha":715,"o":"m 640 -14 q 619 -157 640 -84 q 563 -299 599 -230 l 399 -299 q 442 -194 433 -223 q 468 -85 468 -126 q 440 -25 468 -41 q 368 -10 412 -10 q 333 -11 355 -10 q 302 -13 311 -13 q 91 60 179 -13 q 0 259 0 138 q 56 426 0 354 q 201 530 109 493 q 106 594 144 553 q 65 699 65 642 q 94 787 65 747 q 169 856 123 828 l 22 856 l 22 1013 l 597 1013 l 597 856 l 497 857 q 345 840 398 857 q 257 736 257 812 q 366 614 257 642 q 552 602 416 602 l 552 446 l 513 446 q 313 425 379 446 q 199 284 199 389 q 312 162 199 184 q 524 136 418 148 q 640 -14 640 105 "},"&":{"x_min":-1,"x_max":910.109375,"ha":1007,"o":"m 910 -1 l 676 -1 l 607 83 q 291 -47 439 -47 q 50 100 135 -47 q -1 273 -1 190 q 51 431 -1 357 q 218 568 104 505 q 151 661 169 629 q 120 769 120 717 q 201 951 120 885 q 382 1013 276 1013 q 555 957 485 1013 q 635 789 635 894 q 584 644 635 709 q 468 539 548 597 l 615 359 q 664 527 654 440 l 844 527 q 725 223 824 359 l 910 -1 m 461 787 q 436 848 461 826 q 381 870 412 870 q 325 849 349 870 q 301 792 301 829 q 324 719 301 757 q 372 660 335 703 q 430 714 405 680 q 461 787 461 753 m 500 214 l 318 441 q 198 286 198 363 q 225 204 198 248 q 347 135 268 135 q 425 153 388 135 q 500 214 462 172 "},"Λ":{"x_min":0,"x_max":894.453125,"ha":974,"o":"m 894 0 l 666 0 l 447 757 l 225 0 l 0 0 l 344 1013 l 547 1013 l 894 0 "},"I":{"x_min":41,"x_max":249,"ha":365,"o":"m 249 0 l 41 0 l 41 1013 l 249 1013 l 249 0 "},"G":{"x_min":0,"x_max":971,"ha":1057,"o":"m 971 -1 l 829 -1 l 805 118 q 479 -29 670 -29 q 126 133 261 -29 q 0 509 0 286 q 130 884 0 737 q 493 1040 268 1040 q 790 948 659 1040 q 961 698 920 857 l 736 698 q 643 813 709 769 q 500 857 578 857 q 285 746 364 857 q 213 504 213 644 q 285 263 213 361 q 505 154 365 154 q 667 217 598 154 q 761 374 736 280 l 548 374 l 548 548 l 971 548 l 971 -1 "},"ΰ":{"x_min":0,"x_max":655,"ha":767,"o":"m 583 810 l 454 810 l 454 952 l 583 952 l 583 810 m 186 810 l 57 809 l 57 952 l 186 952 l 186 810 m 516 1039 l 315 823 l 216 823 l 338 1039 l 516 1039 m 655 417 q 567 55 655 146 q 326 -25 489 -25 q 59 97 137 -25 q 0 369 0 192 l 0 748 l 200 748 l 201 369 q 218 222 201 269 q 326 142 245 142 q 439 247 410 142 q 455 422 455 304 l 455 748 l 655 748 l 655 417 "},"`":{"x_min":0,"x_max":190,"ha":288,"o":"m 190 654 l 0 654 l 0 830 q 55 970 0 909 q 190 1040 110 1031 l 190 969 q 111 922 134 952 q 88 836 88 892 l 190 836 l 190 654 "},"·":{"x_min":0,"x_max":207,"ha":304,"o":"m 207 528 l 0 528 l 0 735 l 207 735 l 207 528 "},"Υ":{"x_min":-0.21875,"x_max":836.171875,"ha":914,"o":"m 836 1013 l 532 376 l 532 0 l 322 0 l 322 376 l 0 1013 l 208 1013 l 427 576 l 626 1013 l 836 1013 "},"r":{"x_min":0,"x_max":431.9375,"ha":513,"o":"m 431 564 q 269 536 320 564 q 200 395 200 498 l 200 0 l 0 0 l 0 748 l 183 748 l 183 618 q 285 731 224 694 q 431 768 345 768 l 431 564 "},"x":{"x_min":0,"x_max":738.890625,"ha":826,"o":"m 738 0 l 504 0 l 366 238 l 230 0 l 0 0 l 252 382 l 11 749 l 238 749 l 372 522 l 502 749 l 725 749 l 488 384 l 738 0 "},"μ":{"x_min":0,"x_max":647,"ha":754,"o":"m 647 0 l 477 0 l 477 68 q 411 9 448 30 q 330 -11 374 -11 q 261 3 295 -11 q 199 43 226 18 l 199 -278 l 0 -278 l 0 749 l 199 749 l 199 358 q 216 222 199 268 q 322 152 244 152 q 435 240 410 152 q 448 401 448 283 l 448 749 l 647 749 l 647 0 "},"h":{"x_min":0,"x_max":669,"ha":782,"o":"m 669 0 l 469 0 l 469 390 q 449 526 469 472 q 353 607 420 607 q 248 554 295 607 q 201 441 201 501 l 201 0 l 0 0 l 0 1013 l 201 1013 l 201 665 q 303 743 245 715 q 425 772 362 772 q 609 684 542 772 q 669 484 669 605 l 669 0 "},".":{"x_min":0,"x_max":206,"ha":303,"o":"m 206 0 l 0 0 l 0 207 l 206 207 l 206 0 "},"φ":{"x_min":-1,"x_max":921,"ha":990,"o":"m 542 -278 l 367 -278 l 367 -22 q 99 92 200 -22 q -1 376 -1 206 q 72 627 -1 520 q 288 769 151 742 l 288 581 q 222 495 243 550 q 202 378 202 439 q 240 228 202 291 q 367 145 285 157 l 367 776 l 515 776 q 807 667 694 776 q 921 379 921 558 q 815 93 921 209 q 542 -22 709 -22 l 542 -278 m 542 145 q 672 225 625 145 q 713 381 713 291 q 671 536 713 470 q 542 611 624 611 l 542 145 "},";":{"x_min":0,"x_max":208,"ha":306,"o":"m 208 528 l 0 528 l 0 735 l 208 735 l 208 528 m 208 6 q 152 -151 208 -89 q 0 -238 96 -212 l 0 -158 q 87 -100 61 -136 q 113 0 113 -65 l 0 0 l 0 207 l 208 207 l 208 6 "},"f":{"x_min":0,"x_max":424,"ha":525,"o":"m 424 609 l 300 609 l 300 0 l 107 0 l 107 609 l 0 609 l 0 749 l 107 749 q 145 949 107 894 q 328 1019 193 1019 l 424 1015 l 424 855 l 362 855 q 312 841 324 855 q 300 797 300 827 q 300 773 300 786 q 300 749 300 761 l 424 749 l 424 609 "},"“":{"x_min":0,"x_max":468,"ha":567,"o":"m 190 631 l 0 631 l 0 807 q 55 947 0 885 q 190 1017 110 1010 l 190 947 q 88 813 88 921 l 190 813 l 190 631 m 468 631 l 278 631 l 278 807 q 333 947 278 885 q 468 1017 388 1010 l 468 947 q 366 813 366 921 l 468 813 l 468 631 "},"A":{"x_min":0,"x_max":966.671875,"ha":1069,"o":"m 966 0 l 747 0 l 679 208 l 286 208 l 218 0 l 0 0 l 361 1013 l 600 1013 l 966 0 m 623 376 l 480 810 l 340 376 l 623 376 "},"6":{"x_min":57,"x_max":771,"ha":828,"o":"m 744 734 l 544 734 q 500 802 533 776 q 425 828 466 828 q 315 769 359 828 q 264 571 264 701 q 451 638 343 638 q 691 537 602 638 q 771 315 771 449 q 683 79 771 176 q 420 -29 586 -29 q 134 123 227 -29 q 57 455 57 250 q 184 865 57 721 q 452 988 293 988 q 657 916 570 988 q 744 734 744 845 m 426 128 q 538 178 498 128 q 578 300 578 229 q 538 422 578 372 q 415 479 493 479 q 303 430 342 479 q 264 313 264 381 q 308 184 264 240 q 426 128 352 128 "},"‘":{"x_min":0,"x_max":190,"ha":289,"o":"m 190 631 l 0 631 l 0 807 q 55 947 0 885 q 190 1017 110 1010 l 190 947 q 88 813 88 921 l 190 813 l 190 631 "},"ϊ":{"x_min":-55,"x_max":337,"ha":389,"o":"m 337 810 l 208 810 l 208 952 l 337 952 l 337 810 m 74 810 l -55 810 l -55 952 l 74 952 l 74 810 m 242 0 l 42 0 l 42 748 l 242 748 l 242 0 "},"π":{"x_min":0.5,"x_max":838.890625,"ha":938,"o":"m 838 593 l 750 593 l 750 0 l 549 0 l 549 593 l 287 593 l 287 0 l 88 0 l 88 593 l 0 593 l 0 749 l 838 749 l 838 593 "},"ά":{"x_min":-1,"x_max":722,"ha":835,"o":"m 722 0 l 531 0 l 530 101 q 433 8 491 41 q 304 -25 375 -25 q 72 104 157 -25 q -1 372 -1 216 q 72 643 -1 530 q 308 775 158 775 q 433 744 375 775 q 528 656 491 713 l 528 749 l 722 749 l 722 0 m 361 601 q 233 527 277 601 q 196 375 196 464 q 232 224 196 288 q 358 144 277 144 q 487 217 441 144 q 528 370 528 281 q 489 523 528 457 q 361 601 443 601 m 579 1039 l 377 823 l 279 823 l 401 1039 l 579 1039 "},"O":{"x_min":0,"x_max":994,"ha":1094,"o":"m 497 -29 q 133 127 272 -29 q 0 505 0 277 q 131 883 0 733 q 497 1040 270 1040 q 860 883 721 1040 q 994 505 994 733 q 862 127 994 277 q 497 -29 723 -29 m 497 154 q 710 266 631 154 q 780 506 780 365 q 710 745 780 647 q 497 857 631 857 q 283 747 361 857 q 213 506 213 647 q 282 266 213 365 q 497 154 361 154 "},"n":{"x_min":0,"x_max":669,"ha":782,"o":"m 669 0 l 469 0 l 469 452 q 442 553 469 513 q 352 601 412 601 q 245 553 290 601 q 200 441 200 505 l 200 0 l 0 0 l 0 748 l 194 748 l 194 659 q 289 744 230 713 q 416 775 349 775 q 600 700 531 775 q 669 509 669 626 l 669 0 "},"3":{"x_min":61,"x_max":767,"ha":828,"o":"m 767 290 q 653 51 767 143 q 402 -32 548 -32 q 168 48 262 -32 q 61 300 61 140 l 250 300 q 298 173 250 219 q 405 132 343 132 q 514 169 471 132 q 563 282 563 211 q 491 405 563 369 q 343 432 439 432 l 343 568 q 472 592 425 568 q 534 701 534 626 q 493 793 534 758 q 398 829 453 829 q 306 789 344 829 q 268 669 268 749 l 80 669 q 182 909 80 823 q 410 986 274 986 q 633 916 540 986 q 735 719 735 840 q 703 608 735 656 q 615 522 672 561 q 727 427 687 486 q 767 290 767 369 "},"9":{"x_min":58,"x_max":769,"ha":828,"o":"m 769 492 q 646 90 769 232 q 384 -33 539 -33 q 187 35 271 -33 q 83 224 98 107 l 282 224 q 323 154 286 182 q 404 127 359 127 q 513 182 471 127 q 563 384 563 248 q 475 335 532 355 q 372 315 418 315 q 137 416 224 315 q 58 642 58 507 q 144 877 58 781 q 407 984 239 984 q 694 827 602 984 q 769 492 769 699 m 416 476 q 525 521 488 476 q 563 632 563 566 q 521 764 563 709 q 403 826 474 826 q 297 773 337 826 q 258 649 258 720 q 295 530 258 577 q 416 476 339 476 "},"l":{"x_min":41,"x_max":240,"ha":363,"o":"m 240 0 l 41 0 l 41 1013 l 240 1013 l 240 0 "},"¤":{"x_min":40.265625,"x_max":727.203125,"ha":825,"o":"m 727 792 l 594 659 q 620 552 620 609 q 598 459 620 504 l 725 331 l 620 224 l 491 352 q 382 331 443 331 q 273 352 322 331 l 144 224 l 40 330 l 167 459 q 147 552 147 501 q 172 658 147 608 l 40 794 l 147 898 l 283 759 q 383 776 330 776 q 482 759 434 776 l 620 898 l 727 792 m 383 644 q 308 617 334 644 q 283 551 283 590 q 309 489 283 517 q 381 462 335 462 q 456 488 430 462 q 482 554 482 515 q 455 616 482 588 q 383 644 429 644 "},"κ":{"x_min":0,"x_max":691.84375,"ha":779,"o":"m 691 0 l 479 0 l 284 343 l 196 252 l 196 0 l 0 0 l 0 749 l 196 749 l 196 490 l 440 749 l 677 749 l 416 479 l 691 0 "},"4":{"x_min":53,"x_max":775.21875,"ha":828,"o":"m 775 213 l 660 213 l 660 0 l 470 0 l 470 213 l 53 213 l 53 384 l 416 958 l 660 958 l 660 370 l 775 370 l 775 213 m 474 364 l 474 786 l 204 363 l 474 364 "},"p":{"x_min":0,"x_max":722,"ha":824,"o":"m 415 -26 q 287 4 346 -26 q 192 92 228 34 l 192 -298 l 0 -298 l 0 750 l 192 750 l 192 647 q 289 740 230 706 q 416 775 347 775 q 649 645 566 775 q 722 375 722 534 q 649 106 722 218 q 415 -26 564 -26 m 363 603 q 232 529 278 603 q 192 375 192 465 q 230 222 192 286 q 360 146 276 146 q 487 221 441 146 q 526 371 526 285 q 488 523 526 458 q 363 603 443 603 "},"‡":{"x_min":0,"x_max":809,"ha":894,"o":"m 299 621 l 0 621 l 0 804 l 299 804 l 299 1011 l 509 1011 l 509 804 l 809 804 l 809 621 l 509 621 l 509 387 l 809 387 l 809 205 l 509 205 l 509 0 l 299 0 l 299 205 l 0 205 l 0 387 l 299 387 l 299 621 "},"ψ":{"x_min":0,"x_max":875,"ha":979,"o":"m 522 142 q 657 274 620 163 q 671 352 671 316 l 671 748 l 875 748 l 875 402 q 806 134 875 240 q 525 -22 719 -1 l 525 -278 l 349 -278 l 349 -22 q 65 135 152 -1 q 0 402 0 238 l 0 748 l 204 748 l 204 352 q 231 240 204 295 q 353 142 272 159 l 353 922 l 524 922 l 522 142 "},"η":{"x_min":0,"x_max":669,"ha":779,"o":"m 669 -278 l 469 -278 l 469 390 q 448 526 469 473 q 348 606 417 606 q 244 553 288 606 q 201 441 201 501 l 201 0 l 0 0 l 0 749 l 201 749 l 201 665 q 301 744 244 715 q 423 774 359 774 q 606 685 538 774 q 669 484 669 603 l 669 -278 "}},"cssFontWeight":"bold","ascender":1216,"underlinePosition":-100,"cssFontStyle":"normal","boundingBox":{"yMin":-333,"xMin":-162,"yMax":1216,"xMax":1681},"resolution":1000,"original_font_information":{"postscript_name":"Helvetiker-Bold","version_string":"Version 1.00 2004 initial release","vendor_url":"http://www.magenta.gr","full_font_name":"Helvetiker Bold","font_family_name":"Helvetiker","copyright":"Copyright (c) Magenta ltd, 2004.","description":"","trademark":"","designer":"","designer_url":"","unique_font_identifier":"Magenta ltd:Helvetiker Bold:22-10-104","license_url":"http://www.ellak.gr/fonts/MgOpen/license.html","license_description":"Copyright (c) 2004 by MAGENTA Ltd. All Rights Reserved.\r\n\r\nPermission is hereby granted, free of charge, to any person obtaining a copy of the fonts accompanying this license (\"Fonts\") and associated documentation files (the \"Font Software\"), to reproduce and distribute the Font Software, including without limitation the rights to use, copy, merge, publish, distribute, and/or sell copies of the Font Software, and to permit persons to whom the Font Software is furnished to do so, subject to the following conditions: \r\n\r\nThe above copyright and this permission notice shall be included in all copies of one or more of the Font Software typefaces.\r\n\r\nThe Font Software may be modified, altered, or added to, and in particular the designs of glyphs or characters in the Fonts may be modified and additional glyphs or characters may be added to the Fonts, only if the fonts are renamed to names not containing the word \"MgOpen\", or if the modifications are accepted for inclusion in the Font Software itself by the each appointed Administrator.\r\n\r\nThis License becomes null and void to the extent applicable to Fonts or Font Software that has been modified and is distributed under the \"MgOpen\" name.\r\n\r\nThe Font Software may be sold as part of a larger software package but no copy of one or more of the Font Software typefaces may be sold by itself. \r\n\r\nTHE FONT SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL MAGENTA OR PERSONS OR BODIES IN CHARGE OF ADMINISTRATION AND MAINTENANCE OF THE FONT SOFTWARE BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM OTHER DEALINGS IN THE FONT SOFTWARE.","manufacturer_name":"Magenta ltd","font_sub_family_name":"Bold"},"descender":-334,"familyName":"Helvetiker","lineHeight":1549,"underlineThickness":50});
// File:editor/fonts/gentilis_regular.typeface.js

// File:editor/fonts/optimer_regular.typeface.js

if (_typeface_js && _typeface_js.loadFace) _typeface_js.loadFace({"glyphs":{"ο":{"x_min":41,"x_max":710,"ha":753,"o":"m 371 -15 q 131 78 222 -15 q 41 322 41 172 q 133 573 41 474 q 378 672 225 672 q 619 574 528 672 q 710 326 710 477 q 617 80 710 175 q 371 -15 525 -15 m 377 619 q 226 530 272 619 q 180 327 180 441 q 227 125 180 216 q 375 35 274 35 q 524 123 478 35 q 570 326 570 211 q 524 529 570 440 q 377 619 479 619 "},"S":{"x_min":50,"x_max":639,"ha":699,"o":"m 88 208 q 179 88 122 131 q 318 46 237 46 q 457 98 397 46 q 518 227 518 150 q 401 400 518 336 q 184 498 293 448 q 68 688 68 566 q 156 880 68 811 q 370 950 244 950 q 480 936 430 950 q 597 891 530 922 q 570 822 583 858 q 553 756 558 786 l 539 756 q 354 897 502 897 q 231 855 282 897 q 181 742 181 813 q 298 580 181 640 q 519 483 408 531 q 639 286 639 413 q 538 68 639 152 q 301 -15 438 -15 q 166 2 229 -15 q 50 59 104 19 q 68 135 62 104 q 75 205 75 166 l 88 208 "},"/":{"x_min":-36.03125,"x_max":404.15625,"ha":383,"o":"m -36 -125 l 340 1025 l 404 1024 l 28 -126 l -36 -125 "},"Τ":{"x_min":11,"x_max":713,"ha":725,"o":"m 11 839 l 15 884 l 11 932 q 194 927 72 932 q 361 922 316 922 q 544 927 421 922 q 713 932 668 932 q 707 883 707 911 q 707 861 707 870 q 713 834 707 852 q 609 850 666 843 q 504 857 552 857 l 428 857 q 426 767 428 830 q 424 701 424 704 l 428 220 q 442 0 428 122 q 362 8 401 3 q 323 5 344 8 q 282 0 301 2 q 289 132 282 40 q 296 259 296 225 l 296 683 l 296 857 q 11 839 164 857 "},"ϕ":{"x_min":41,"x_max":960,"ha":1006,"o":"m 441 -10 q 162 76 283 -10 q 41 316 41 163 q 162 562 41 470 q 441 654 283 654 q 434 838 441 719 q 427 971 427 957 q 464 965 443 968 q 503 962 485 962 q 540 965 519 962 q 578 970 560 968 q 563 654 563 824 q 839 567 719 654 q 960 324 960 481 q 841 79 960 169 q 563 -10 722 -10 q 570 -201 563 -68 q 578 -371 578 -334 q 505 -362 539 -362 q 465 -365 483 -362 q 427 -372 446 -368 q 434 -161 427 -297 q 441 -10 441 -26 m 563 39 q 757 118 690 39 q 824 330 824 198 q 750 523 824 445 q 564 601 677 601 l 563 319 l 563 39 m 441 319 l 441 601 q 253 523 326 601 q 180 330 180 446 q 245 117 180 195 q 439 39 310 39 l 441 319 "},"y":{"x_min":4.171875,"x_max":665.28125,"ha":664,"o":"m 4 654 l 86 647 l 165 654 q 202 536 188 577 q 241 431 215 495 l 363 129 l 473 413 q 552 654 519 537 q 606 647 583 647 q 665 654 633 647 q 416 125 531 388 q 223 -372 301 -137 l 187 -366 q 141 -366 163 -366 q 112 -372 122 -370 l 290 -22 q 4 654 170 294 "},"≈":{"x_min":118.0625,"x_max":1019.453125,"ha":1139,"o":"m 765 442 q 564 487 700 442 q 376 533 429 533 q 250 506 298 533 q 118 427 202 480 l 118 501 q 245 572 180 545 q 376 600 311 600 q 574 553 438 600 q 765 507 709 507 q 888 534 829 507 q 1019 614 947 562 l 1019 538 q 892 467 954 493 q 765 442 830 442 m 759 214 q 568 260 702 214 q 376 307 433 307 q 236 272 300 307 q 118 202 173 238 l 118 277 q 247 346 181 320 q 380 372 312 372 q 570 326 445 372 q 765 281 695 281 q 883 306 830 281 q 1019 388 936 331 l 1019 313 q 894 240 959 266 q 759 214 829 214 "},"Π":{"x_min":108,"x_max":927.453125,"ha":1036,"o":"m 432 846 l 263 846 q 260 634 263 781 q 257 475 257 486 q 262 236 257 395 q 268 0 268 77 q 229 3 255 0 q 188 8 202 8 q 149 3 177 8 q 108 0 121 0 q 117 239 108 70 q 126 465 126 408 q 122 711 126 620 q 108 932 119 803 q 285 926 166 932 q 464 921 405 921 q 695 926 541 921 q 927 932 849 932 q 915 793 921 871 q 909 659 909 716 l 909 504 q 917 245 909 427 q 926 0 926 62 q 887 4 913 0 q 847 8 860 8 q 810 5 827 8 q 768 0 792 2 q 773 259 768 94 q 778 469 778 423 l 778 731 l 773 846 l 432 846 "},"ΐ":{"x_min":-41,"x_max":384,"ha":342,"o":"m 105 333 l 105 520 q 104 566 105 544 q 97 654 103 588 q 141 647 131 648 q 166 647 152 647 q 234 654 196 647 q 225 555 226 599 q 224 437 224 510 l 224 406 q 229 194 224 337 q 234 0 234 51 q 202 3 217 1 q 166 5 186 5 q 128 3 149 5 q 97 0 108 1 q 101 165 97 51 q 105 333 105 279 m 18 865 q 61 846 43 865 q 80 804 80 828 q 61 761 80 779 q 18 743 43 743 q -22 761 -4 743 q -41 804 -41 779 q -22 846 -41 828 q 18 865 -4 865 m 172 929 q 189 969 179 956 q 225 982 199 982 q 256 971 243 982 q 270 941 270 961 q 257 904 270 919 l 149 743 l 117 743 l 172 929 m 324 865 q 366 846 348 865 q 384 804 384 828 q 366 761 384 779 q 324 743 348 743 q 281 761 298 743 q 265 804 265 779 q 281 846 265 828 q 324 865 298 865 "},"g":{"x_min":32,"x_max":672,"ha":688,"o":"m 81 123 q 112 201 81 169 q 193 252 144 233 l 193 262 q 97 329 130 277 q 64 447 64 380 q 141 610 64 549 q 323 672 218 672 q 421 661 357 672 q 500 650 486 651 l 672 654 l 672 582 q 599 592 635 587 q 537 597 563 597 q 607 458 607 548 q 527 294 607 356 q 342 232 447 232 q 291 235 319 232 q 255 239 262 239 q 208 220 228 239 q 188 173 188 201 q 221 120 188 136 q 296 104 254 104 l 427 104 q 603 56 534 104 q 672 -93 672 9 q 560 -299 672 -226 q 309 -372 448 -372 q 115 -327 199 -372 q 32 -183 32 -283 q 76 -62 32 -110 q 193 8 121 -13 q 112 51 143 25 q 81 123 81 77 m 332 278 q 439 332 401 278 q 478 457 478 386 q 441 575 478 525 q 338 625 404 625 q 232 570 271 625 q 194 447 194 515 q 230 328 194 379 q 332 278 266 278 m 337 -316 q 491 -270 423 -316 q 559 -141 559 -224 q 500 -29 559 -62 q 353 3 441 3 q 199 -36 263 3 q 136 -162 136 -76 q 195 -277 136 -238 q 337 -316 255 -316 "},"²":{"x_min":15.28125,"x_max":412.5,"ha":496,"o":"m 297 744 q 270 830 297 795 q 197 866 244 866 q 120 837 149 866 q 83 761 90 808 l 76 759 q 54 802 68 780 q 31 837 40 824 q 210 901 108 901 q 334 862 278 901 q 390 758 390 824 q 282 568 390 656 q 111 428 174 479 l 293 428 q 350 431 316 428 q 412 439 384 434 l 406 397 l 412 356 l 304 361 l 111 361 l 15 355 l 15 378 q 220 567 144 484 q 297 744 297 651 "},"Κ":{"x_min":108,"x_max":856.625,"ha":821,"o":"m 255 314 q 261 132 255 250 q 268 0 268 13 q 229 4 255 0 q 188 8 202 8 q 148 4 174 8 q 108 0 121 0 q 117 239 108 70 q 126 465 126 408 q 122 712 126 621 q 108 932 119 803 q 153 928 124 932 q 188 925 183 925 q 231 928 203 925 q 267 932 259 932 l 255 671 l 255 499 q 480 693 375 586 q 687 932 585 800 q 732 932 710 932 q 777 932 753 932 l 837 932 q 606 727 720 830 q 389 522 493 623 q 525 358 465 426 q 666 202 586 290 q 856 0 747 115 l 746 0 q 692 -1 716 0 q 644 -8 669 -2 q 571 92 610 44 q 477 204 532 140 l 255 459 l 255 314 "},"ë":{"x_min":40,"x_max":646.9375,"ha":681,"o":"m 406 42 q 602 130 523 42 l 621 130 q 613 93 617 112 q 609 47 609 73 q 496 0 558 14 q 369 -15 435 -15 q 130 73 220 -15 q 40 311 40 162 q 126 562 40 456 q 355 669 212 669 q 564 590 481 669 q 646 386 646 512 l 644 331 q 438 333 562 331 q 313 335 315 335 l 179 331 q 235 127 179 212 q 406 42 291 42 m 219 929 q 271 906 249 929 q 294 854 294 884 q 273 800 294 822 q 221 778 252 778 q 166 800 190 778 q 143 854 143 822 q 165 906 143 884 q 219 929 187 929 m 460 929 q 513 906 492 929 q 534 854 534 884 q 513 799 534 820 q 461 778 493 778 q 407 800 429 778 q 385 854 385 822 q 407 906 385 884 q 460 929 429 929 m 513 392 l 513 437 q 470 563 513 509 q 356 618 427 618 q 233 552 271 618 q 183 390 195 487 l 513 392 "},"e":{"x_min":41,"x_max":645.15625,"ha":681,"o":"m 406 42 q 602 130 523 42 l 618 125 q 611 86 614 104 q 609 44 609 67 q 497 0 561 14 q 370 -15 434 -15 q 130 73 220 -15 q 41 311 41 161 q 127 563 41 455 q 356 672 214 672 q 563 592 482 672 q 645 385 645 512 l 643 331 l 313 335 l 179 331 q 235 126 179 210 q 406 42 291 42 m 511 392 l 513 436 q 470 563 513 509 q 356 618 427 618 q 230 553 268 618 q 179 388 191 488 l 511 392 "},"ό":{"x_min":41,"x_max":710,"ha":753,"o":"m 371 -15 q 131 78 222 -15 q 41 322 41 172 q 133 573 41 474 q 378 672 225 672 q 619 574 528 672 q 710 326 710 477 q 617 80 710 175 q 371 -15 525 -15 m 524 943 q 558 974 542 964 q 595 985 574 985 q 632 969 618 985 q 646 932 646 954 q 632 897 646 911 q 591 866 618 883 l 390 743 l 341 743 l 524 943 m 377 619 q 226 530 272 619 q 180 327 180 441 q 227 125 180 216 q 375 35 274 35 q 524 123 478 35 q 570 326 570 211 q 524 529 570 440 q 377 619 479 619 "},"J":{"x_min":-71,"x_max":277,"ha":385,"o":"m 118 -40 q 131 62 128 9 q 135 184 135 115 q 132 462 135 325 q 127 690 130 598 q 111 932 123 782 q 159 928 129 932 q 193 925 189 925 q 238 927 221 925 q 277 932 256 929 q 268 665 277 843 q 260 457 260 487 l 260 165 q 260 107 260 147 q 260 48 260 68 q 169 -155 260 -88 q -62 -222 79 -222 l -71 -180 q 50 -134 1 -166 q 118 -40 100 -102 "},"»":{"x_min":43,"x_max":543,"ha":607,"o":"m 196 322 l 43 607 l 81 645 l 303 322 l 81 0 l 43 37 l 196 322 m 436 322 l 283 607 l 322 645 l 543 322 l 322 0 l 283 37 l 436 322 "},"©":{"x_min":80,"x_max":1058,"ha":1139,"o":"m 816 905 q 992 726 927 841 q 1058 481 1058 611 q 912 138 1058 283 q 567 -6 766 -6 q 225 139 370 -6 q 80 481 80 284 q 224 826 80 681 q 569 971 368 971 q 816 905 698 971 m 569 918 q 263 788 392 918 q 134 481 134 659 q 261 175 134 306 q 566 45 389 45 q 872 174 741 45 q 1004 478 1004 304 q 947 699 1004 596 q 787 859 890 801 q 569 918 684 918 m 570 724 q 441 652 483 724 q 399 490 399 581 q 438 320 399 396 q 560 245 478 245 q 664 278 621 245 q 723 370 707 311 l 798 370 q 720 232 788 283 q 561 181 653 181 q 379 268 446 181 q 313 476 313 355 q 380 694 313 604 q 571 785 447 785 q 717 738 656 785 q 793 610 779 691 l 715 610 q 664 692 705 660 q 570 724 624 724 "},"ώ":{"x_min":39.71875,"x_max":1028.9375,"ha":1068,"o":"m 534 528 l 596 528 l 594 305 q 616 117 594 193 q 722 42 638 42 q 850 118 811 42 q 888 293 888 194 q 829 502 888 409 q 664 654 769 594 l 717 648 q 805 654 766 648 q 967 510 905 606 q 1028 304 1028 413 q 948 81 1028 177 q 744 -15 867 -15 q 622 16 678 -15 q 534 104 566 47 q 445 16 500 48 q 323 -15 389 -15 q 118 83 196 -15 q 39 311 39 182 q 100 511 39 419 q 262 654 161 604 q 303 650 278 651 q 349 648 327 648 l 402 654 q 238 501 296 593 q 179 291 179 409 q 218 116 179 191 q 348 42 257 42 q 419 68 390 42 q 461 138 448 94 q 472 216 469 175 q 475 303 475 257 q 472 420 475 353 q 469 529 470 486 l 534 528 m 681 943 q 714 974 699 964 q 751 985 730 985 q 788 969 774 985 q 802 932 802 954 q 787 896 802 912 q 746 866 773 880 l 547 743 l 498 743 l 681 943 "},"≥":{"x_min":176.1875,"x_max":963,"ha":1139,"o":"m 963 462 l 176 196 l 176 266 l 850 491 l 176 718 l 176 788 l 963 522 l 963 462 m 963 26 l 176 26 l 176 93 l 963 93 l 963 26 "},"^":{"x_min":0,"x_max":390,"ha":403,"o":"m 150 978 l 239 978 l 390 743 l 344 743 l 195 875 l 49 743 l 0 743 l 150 978 "},"«":{"x_min":48,"x_max":549.390625,"ha":607,"o":"m 152 326 l 309 42 l 268 3 l 48 326 l 268 649 l 309 611 l 152 326 m 394 326 l 549 42 l 509 3 l 288 326 l 509 649 l 549 611 l 394 326 "},"D":{"x_min":108,"x_max":991,"ha":1043,"o":"m 126 465 q 117 704 126 536 q 108 931 108 872 l 210 929 q 350 934 251 929 q 477 939 449 939 q 579 936 553 939 q 709 917 605 934 q 902 775 814 900 q 991 483 991 650 q 852 130 991 261 q 491 0 713 0 l 378 0 l 228 7 l 203 7 q 148 4 173 7 q 108 0 123 1 q 117 239 108 70 q 126 465 126 408 m 402 64 q 724 168 609 64 q 840 479 840 273 q 730 774 840 671 q 428 878 621 878 q 345 873 400 878 q 262 869 289 869 l 255 497 l 255 376 l 262 76 q 332 68 292 72 q 402 64 373 64 "},"w":{"x_min":4.171875,"x_max":1052.78125,"ha":1047,"o":"m 4 655 q 55 648 41 648 q 86 647 69 647 q 165 654 120 647 q 190 540 176 587 q 238 394 204 492 l 329 141 q 498 654 419 386 q 551 647 526 647 q 609 654 577 647 q 637 544 620 601 q 677 420 654 487 l 770 135 l 872 413 q 911 532 893 472 q 944 654 930 592 q 979 647 970 648 q 1000 647 988 647 q 1052 654 1022 647 q 961 457 1002 555 q 871 235 919 359 q 782 0 824 110 q 755 3 772 0 q 733 6 738 6 q 708 3 724 6 q 686 0 692 0 q 650 127 667 72 q 611 239 632 183 l 518 494 q 432 258 475 382 q 348 0 390 134 q 325 3 336 1 q 297 5 313 5 q 269 3 284 5 q 245 0 254 1 q 162 244 200 140 q 86 447 125 347 q 4 655 47 546 "},"$":{"x_min":89,"x_max":666,"ha":749,"o":"m 139 186 l 146 186 q 213 91 165 119 q 342 50 261 63 l 342 416 q 142 515 196 458 q 89 648 89 573 q 164 819 89 752 q 342 886 239 886 q 330 985 342 936 l 359 979 l 404 984 q 400 924 401 945 q 399 886 399 904 q 510 874 457 886 q 605 834 562 862 q 582 788 592 808 q 555 729 572 768 l 547 729 q 495 810 535 783 q 399 837 455 837 l 399 520 q 610 419 554 479 q 666 277 666 359 q 588 87 666 164 q 399 0 511 9 l 399 -32 q 399 -63 399 -48 q 405 -125 400 -78 l 368 -121 l 329 -125 l 342 0 q 210 13 273 0 q 98 58 147 27 l 139 186 m 342 836 q 237 787 278 826 q 196 686 196 748 q 237 588 196 626 q 342 537 279 551 l 342 836 m 553 231 q 513 337 553 300 q 399 402 473 375 l 399 51 q 512 113 471 66 q 553 231 553 159 "},"‧":{"x_min":134,"x_max":309,"ha":446,"o":"m 222 636 q 284 611 259 636 q 309 548 309 586 q 284 486 309 512 q 222 461 260 461 q 160 486 186 461 q 134 548 134 511 q 159 610 134 584 q 222 636 185 636 "},"\\":{"x_min":-36,"x_max":403.140625,"ha":383,"o":"m -36 1025 l 28 1025 l 403 -125 l 340 -125 l -36 1025 "},"Ι":{"x_min":109,"x_max":271,"ha":385,"o":"m 127 465 q 123 711 127 620 q 109 932 120 803 q 154 927 129 929 q 190 925 179 925 q 238 928 209 925 q 271 931 266 931 q 263 788 271 887 q 256 659 256 690 l 256 448 l 256 283 q 263 135 256 238 q 271 0 271 31 q 231 3 258 0 q 190 8 204 8 q 151 5 172 8 q 109 0 129 2 q 118 239 109 70 q 127 465 127 408 "},"Ύ":{"x_min":-1,"x_max":1204.5625,"ha":1165,"o":"m 758 177 l 758 386 q 651 570 717 458 q 543 750 585 681 q 431 931 501 819 q 483 928 449 931 q 522 925 518 925 q 572 927 550 925 q 606 931 593 930 q 666 800 633 866 q 735 676 699 734 l 849 475 q 968 688 910 575 q 1086 931 1027 801 l 1142 926 q 1174 927 1160 926 q 1204 931 1187 929 q 1014 627 1099 769 l 891 415 l 891 240 q 894 101 891 198 q 897 0 897 5 q 860 4 885 1 q 820 6 835 6 q 778 4 793 6 q 743 0 763 2 q 753 88 748 36 q 758 177 758 140 m 182 943 q 215 974 200 964 q 252 985 231 985 q 289 969 274 985 q 305 932 305 954 q 290 896 305 911 q 248 866 275 882 l 48 743 l -1 743 l 182 943 "},"’":{"x_min":90.28125,"x_max":305.5625,"ha":374,"o":"m 169 859 q 197 923 177 894 q 250 953 218 953 q 288 939 272 953 q 305 902 305 925 q 295 857 305 882 q 269 811 284 833 l 120 568 l 90 576 l 169 859 "},"Ν":{"x_min":98,"x_max":911.890625,"ha":1011,"o":"m 112 230 q 114 486 112 315 q 117 741 117 656 l 117 950 l 166 950 q 326 766 239 865 q 468 606 413 667 q 610 451 524 544 l 821 227 l 821 604 q 816 765 821 685 q 803 931 812 845 l 855 927 l 911 931 q 901 831 906 884 q 897 741 897 779 q 894 413 897 619 q 892 165 892 207 l 892 -15 l 849 -15 q 730 125 796 50 q 589 281 664 201 l 193 702 l 193 330 q 212 -1 193 169 l 149 2 l 98 -1 q 108 125 105 79 q 112 230 112 170 "},"-":{"x_min":58.328125,"x_max":388.890625,"ha":449,"o":"m 58 390 l 388 390 l 388 273 l 58 273 l 58 390 "},"Q":{"x_min":51,"x_max":1074.609375,"ha":1119,"o":"m 566 -14 q 194 113 338 -14 q 51 465 51 241 q 192 820 51 690 q 559 950 333 950 q 892 853 754 950 q 1047 654 1031 756 q 1065 525 1062 551 q 1068 462 1068 499 q 1065 405 1068 429 q 1050 305 1062 381 q 960 144 1038 229 q 748 6 881 59 l 930 -112 q 1004 -161 963 -136 q 1074 -200 1045 -186 q 1008 -228 1035 -214 q 951 -267 980 -243 q 876 -208 912 -234 q 803 -154 841 -182 l 606 -14 l 566 -14 m 202 468 q 290 163 202 283 q 559 43 379 43 q 826 163 738 43 q 915 468 915 284 q 825 770 915 651 q 559 889 735 889 q 348 826 429 889 q 225 638 267 763 q 202 468 202 552 "},"ς":{"x_min":44,"x_max":613.453125,"ha":644,"o":"m 305 -206 q 350 -218 325 -218 q 447 -177 407 -218 q 487 -79 487 -136 q 376 55 487 4 q 159 156 266 106 q 44 365 44 231 q 143 585 44 499 q 380 672 242 672 q 506 658 448 672 q 613 616 564 645 q 587 500 595 559 l 562 500 q 501 586 549 557 q 391 616 453 616 q 233 551 296 616 q 170 393 170 486 q 216 271 170 320 q 339 196 263 223 l 467 149 q 569 76 531 119 q 608 -27 608 34 q 522 -206 608 -136 q 321 -293 437 -276 l 305 -206 "},"M":{"x_min":55,"x_max":1165,"ha":1238,"o":"m 190 950 l 243 950 q 331 772 291 851 q 412 612 370 693 q 504 436 454 532 l 626 214 q 742 435 671 298 q 882 711 813 572 q 1001 950 952 850 l 1052 950 q 1082 649 1067 791 q 1118 341 1098 508 q 1165 0 1139 174 q 1121 8 1139 5 q 1088 11 1103 11 q 1049 6 1071 11 q 1008 0 1027 2 q 998 226 1008 109 q 974 461 989 343 q 944 695 959 579 l 748 312 q 610 0 665 152 l 594 1 l 576 0 q 227 685 402 364 l 188 307 q 172 128 175 179 q 168 0 168 77 q 138 4 157 1 q 110 6 118 6 q 81 4 93 6 q 55 0 68 2 q 121 333 89 168 q 171 652 152 498 q 190 950 190 805 "},"Ψ":{"x_min":73,"x_max":995.609375,"ha":1071,"o":"m 609 0 q 561 5 585 2 q 532 8 536 8 q 494 5 515 8 q 456 0 474 2 q 463 151 456 45 q 470 297 470 258 q 180 383 287 297 q 73 650 73 469 l 73 817 l 73 932 q 139 925 110 925 q 180 928 155 925 q 212 931 206 931 q 200 818 204 861 q 197 723 197 774 l 197 688 l 197 638 q 268 438 197 508 q 472 368 340 368 l 473 481 q 464 736 473 566 q 456 932 456 905 q 499 927 481 929 q 532 925 518 925 q 577 927 557 925 q 609 931 596 930 q 601 635 609 841 q 594 368 594 429 l 645 372 q 816 465 765 372 q 868 691 868 559 q 861 829 868 740 q 855 932 855 919 q 896 927 878 929 q 924 925 913 925 q 971 927 955 925 q 995 931 987 930 l 994 839 l 994 675 q 894 388 994 480 q 594 297 794 297 q 601 142 594 249 q 609 0 609 35 "},"C":{"x_min":51,"x_max":881.5625,"ha":913,"o":"m 828 737 q 552 889 733 889 q 295 768 383 889 q 207 469 207 647 q 299 177 207 305 q 551 50 391 50 q 710 86 637 50 q 855 189 783 122 l 870 183 q 858 122 862 147 q 855 69 855 97 q 521 -15 699 -15 q 180 116 309 -15 q 51 462 51 248 q 189 820 51 690 q 556 950 327 950 q 719 930 638 950 q 881 875 799 911 q 857 809 867 843 q 845 737 847 775 l 828 737 "},"œ":{"x_min":39,"x_max":1195.9375,"ha":1226,"o":"m 359 -15 q 125 76 212 -15 q 39 318 39 167 q 125 571 39 470 q 362 672 212 672 q 514 640 441 672 q 641 551 588 608 q 897 672 741 672 q 1110 593 1024 672 q 1195 390 1195 515 l 1193 331 q 1022 332 1108 331 q 851 334 935 333 l 708 331 q 765 124 708 206 q 944 42 822 42 q 1145 130 1068 42 l 1162 130 q 1155 85 1158 110 q 1151 47 1152 60 q 1036 0 1100 14 q 904 -15 973 -15 q 754 12 819 -15 q 641 106 689 40 q 514 14 584 44 q 359 -15 444 -15 m 376 625 q 224 534 270 625 q 179 328 179 443 q 224 124 179 215 q 369 34 269 34 q 521 127 470 34 q 573 328 573 221 q 526 534 573 443 q 376 625 480 625 m 1061 392 l 1061 423 q 1017 561 1061 504 q 894 618 973 618 q 756 549 805 618 q 708 390 708 480 l 1061 392 "},"!":{"x_min":136,"x_max":312,"ha":449,"o":"m 223 156 q 285 130 259 156 q 312 68 312 105 q 285 8 312 32 q 223 -15 259 -15 q 161 9 187 -15 q 136 68 136 33 q 160 130 136 105 q 223 156 185 156 m 150 752 l 144 841 q 161 919 144 888 q 223 950 178 950 q 282 925 260 950 q 304 863 304 901 q 299 808 304 845 q 295 752 295 770 l 246 250 q 223 250 238 250 q 199 250 206 250 l 150 752 "},"ç":{"x_min":34,"x_max":614.5625,"ha":644,"o":"m 607 119 l 592 41 q 490 -2 549 10 q 363 -15 431 -15 q 130 80 227 -15 q 34 313 34 175 q 132 576 34 480 q 397 672 231 672 q 511 659 456 672 q 614 617 565 647 q 597 558 604 587 q 584 492 589 528 l 570 492 q 507 587 547 553 q 406 622 467 622 q 234 534 293 622 q 176 329 176 447 q 238 126 176 211 q 414 42 300 42 q 592 124 521 42 l 607 119 m 202 -212 q 350 -246 273 -246 q 414 -232 388 -246 q 440 -186 440 -219 q 421 -142 440 -158 q 373 -126 402 -126 l 323 -126 l 323 0 l 367 0 l 367 -77 l 404 -73 q 495 -102 457 -73 q 533 -183 533 -132 q 494 -270 533 -237 q 402 -303 456 -303 q 286 -294 335 -303 q 184 -261 238 -286 l 202 -212 "},"{":{"x_min":116,"x_max":567.390625,"ha":683,"o":"m 491 909 q 421 874 445 909 q 397 792 397 839 l 397 744 l 397 583 q 368 434 397 493 q 263 354 339 376 q 367 272 338 332 q 397 125 397 212 l 397 -35 q 414 -149 397 -108 q 471 -197 431 -191 q 529 -204 511 -204 q 567 -204 548 -204 l 567 -276 q 387 -239 459 -276 q 315 -105 315 -203 l 315 -28 l 315 132 q 296 244 315 194 q 240 303 277 294 q 176 314 204 312 q 116 317 148 317 l 116 389 q 270 429 225 389 q 315 576 315 469 l 315 737 q 348 918 315 870 q 450 977 381 966 q 567 983 503 983 l 567 912 l 491 909 "},"X":{"x_min":0,"x_max":739,"ha":739,"o":"m 200 285 l 318 456 q 18 932 159 718 q 63 929 33 932 q 109 926 94 926 q 168 929 147 926 q 198 932 188 932 q 296 743 244 841 q 391 568 348 644 l 489 726 q 597 932 548 825 q 627 927 614 929 q 661 926 641 926 q 693 929 671 926 q 728 932 715 932 q 616 781 673 862 q 524 652 558 700 l 427 512 q 523 347 480 419 q 614 197 566 275 q 739 0 662 119 q 686 3 719 0 q 647 6 652 6 q 595 4 618 6 q 558 0 572 1 q 459 197 512 97 q 353 398 405 298 l 265 249 q 174 96 193 130 q 127 0 155 62 q 89 3 113 0 q 62 6 65 6 q 26 4 43 6 q 0 0 9 1 l 200 285 "},"ô":{"x_min":40,"x_max":712,"ha":753,"o":"m 371 -15 q 131 79 223 -15 q 40 322 40 173 q 133 572 40 473 q 380 672 227 672 q 621 575 530 672 q 712 327 712 479 q 619 80 712 175 q 371 -15 527 -15 m 332 978 l 421 978 l 572 743 l 525 743 l 376 875 l 229 743 l 180 743 l 332 978 m 377 622 q 227 532 274 622 q 180 327 180 442 q 227 125 180 216 q 375 35 274 35 q 524 124 478 35 q 570 327 570 214 q 524 531 570 441 q 377 622 479 622 "},"#":{"x_min":78,"x_max":972.4375,"ha":1050,"o":"m 497 647 l 675 647 l 791 969 l 877 968 l 761 647 l 972 647 l 948 576 l 736 576 l 671 390 l 896 390 l 873 319 l 644 319 l 531 0 l 446 0 l 559 319 l 382 319 l 266 0 l 182 0 l 294 319 l 78 319 l 102 390 l 320 390 l 386 576 l 151 576 l 176 647 l 410 647 l 526 969 l 610 969 l 497 647 m 472 576 l 407 390 l 587 390 l 650 576 l 472 576 "},"ι":{"x_min":96,"x_max":233.5,"ha":342,"o":"m 104 333 l 104 521 q 103 567 104 545 q 96 655 102 589 q 141 648 130 648 q 165 647 151 647 q 233 654 196 647 q 224 555 226 599 q 223 437 223 511 l 223 406 q 228 194 223 337 q 233 0 233 51 q 201 3 216 1 q 165 5 185 5 q 127 3 148 5 q 96 0 107 1 q 100 165 96 51 q 104 333 104 279 "},"Ά":{"x_min":12,"x_max":910.609375,"ha":896,"o":"m 328 639 l 458 950 q 489 944 464 947 q 522 950 507 944 q 655 613 602 745 q 770 331 709 480 q 910 0 832 181 q 859 3 891 0 q 823 6 827 6 q 772 4 795 6 q 735 0 749 1 q 672 195 692 135 q 613 353 652 255 l 449 358 l 285 353 l 233 205 q 173 0 194 94 l 116 5 q 76 2 91 5 q 55 0 62 0 q 146 211 101 105 q 229 404 192 317 q 328 639 266 490 m 195 943 q 228 974 213 964 q 265 985 244 985 q 302 969 287 985 q 318 932 318 954 q 303 896 318 911 q 261 866 288 882 l 61 743 l 12 743 l 195 943 m 450 419 l 585 425 l 451 761 l 318 425 l 450 419 "},")":{"x_min":65.671875,"x_max":332,"ha":449,"o":"m 332 376 q 271 81 332 217 q 96 -183 211 -54 q 65 -151 83 -164 q 193 104 155 -16 q 232 386 232 226 q 191 661 232 533 q 65 918 150 789 q 96 950 87 933 q 273 681 215 816 q 332 376 332 545 "},"ε":{"x_min":53,"x_max":567,"ha":628,"o":"m 506 516 q 433 591 467 566 q 353 616 400 616 q 261 580 298 616 q 225 492 225 545 q 268 406 225 437 q 372 375 311 375 l 418 375 l 417 349 l 417 310 l 343 317 q 236 282 280 317 q 193 183 193 247 q 238 77 193 117 q 352 38 284 38 q 460 66 410 38 q 543 144 510 94 q 553 99 547 121 q 567 54 558 76 q 452 2 515 19 q 321 -15 388 -15 q 134 31 216 -15 q 53 175 53 78 q 95 286 53 246 q 214 355 137 326 q 127 408 162 370 q 93 497 93 445 q 165 625 93 579 q 323 672 237 672 q 430 654 378 672 q 541 604 481 637 q 522 564 529 584 q 506 516 514 545 "},"Δ":{"x_min":0,"x_max":899,"ha":899,"o":"m 899 0 q 701 5 833 0 q 501 11 569 11 q 251 5 418 11 q 0 0 84 0 q 225 473 126 251 q 407 932 323 696 q 432 929 415 932 q 457 926 448 926 q 482 927 471 926 q 505 932 493 929 q 691 449 601 664 q 899 0 782 234 m 281 429 q 158 90 212 259 q 290 84 201 90 q 423 79 379 79 l 456 79 q 587 81 550 79 q 692 90 625 83 l 651 188 l 576 383 l 422 778 l 281 429 "},"â":{"x_min":43,"x_max":655.5,"ha":649,"o":"m 234 -15 q 98 33 153 -15 q 43 162 43 82 q 106 303 43 273 q 303 364 169 333 q 444 448 437 395 q 403 568 444 521 q 288 616 362 616 q 191 587 233 616 q 124 507 149 559 l 95 520 l 104 591 q 202 651 144 631 q 323 672 261 672 q 500 622 444 672 q 557 455 557 573 l 557 133 q 567 69 557 84 q 618 54 577 54 q 655 58 643 54 l 655 26 q 594 5 626 14 q 537 -6 562 -3 q 438 85 453 -6 q 342 10 388 35 q 234 -15 296 -15 m 279 978 l 368 978 l 522 743 l 471 743 l 323 875 l 176 743 l 126 743 l 279 978 m 176 186 q 204 98 176 133 q 284 64 232 64 q 390 107 342 64 q 438 212 438 151 l 438 345 q 239 293 303 319 q 176 186 176 268 "},"}":{"x_min":114,"x_max":567,"ha":683,"o":"m 369 576 q 405 438 369 487 q 527 389 441 389 l 567 389 l 567 317 q 415 278 461 317 q 369 132 369 239 l 369 -28 q 319 -229 369 -182 q 114 -276 270 -276 l 114 -204 q 252 -172 218 -204 q 286 -83 286 -141 l 286 -35 l 286 125 q 314 271 286 212 q 418 354 342 329 q 311 435 337 382 q 286 584 286 488 l 286 745 q 268 860 286 818 q 191 913 251 903 l 114 913 l 114 983 l 186 982 q 287 960 242 982 q 346 900 331 938 q 365 822 362 862 q 369 737 369 783 l 369 576 "},"‰":{"x_min":28,"x_max":1511,"ha":1536,"o":"m 799 0 q 647 62 708 0 q 586 218 586 124 q 647 372 586 309 q 799 436 709 436 q 949 373 888 436 q 1011 223 1011 311 q 995 130 1011 176 q 918 35 972 70 q 799 0 865 0 m 1298 0 q 1146 62 1206 0 q 1087 218 1087 124 q 1148 372 1087 308 q 1299 436 1209 436 q 1449 373 1388 436 q 1511 223 1511 311 q 1494 130 1511 169 q 1418 34 1472 69 q 1298 0 1365 0 m 241 448 q 89 510 150 448 q 28 663 28 573 q 89 820 28 755 q 241 885 151 885 q 391 823 329 885 q 453 672 453 761 q 434 580 453 620 q 359 483 412 518 q 241 448 307 448 m 863 1015 l 227 -125 l 158 -125 l 793 1015 l 863 1015 m 897 260 q 872 353 897 310 q 798 397 847 397 q 718 340 737 397 q 700 202 700 283 q 719 86 700 133 q 798 40 738 40 q 866 73 840 40 q 892 149 892 106 q 895 206 894 169 q 897 260 897 242 m 339 684 q 319 797 339 750 q 244 845 300 845 q 161 784 182 845 q 141 645 141 723 q 165 540 141 590 q 237 490 189 490 q 303 524 278 490 q 334 598 329 558 q 339 684 339 638 m 1397 260 q 1373 356 1397 315 q 1297 397 1349 397 q 1218 340 1237 397 q 1200 202 1200 283 q 1219 87 1200 134 q 1297 40 1238 40 q 1366 73 1340 40 q 1392 149 1392 106 q 1395 206 1394 169 q 1397 260 1397 242 "},"Ä":{"x_min":-16,"x_max":839.5625,"ha":826,"o":"m 258 638 l 389 951 q 420 945 395 948 q 453 951 438 945 q 570 651 500 826 q 688 360 640 477 q 839 0 736 242 q 788 3 820 0 q 752 6 756 6 q 702 3 728 6 q 665 0 675 0 q 599 204 615 158 q 542 357 584 251 l 378 357 l 214 357 l 161 207 q 130 109 147 170 q 102 0 113 47 l 45 5 q 20 4 29 5 q -16 0 10 4 q 72 203 29 105 q 169 427 115 301 q 258 638 222 552 m 293 1208 q 345 1186 325 1208 q 366 1133 366 1164 q 345 1080 366 1102 q 293 1058 324 1058 q 239 1080 261 1058 q 217 1133 217 1102 q 239 1185 217 1163 q 293 1208 261 1208 m 535 1208 q 587 1186 565 1208 q 609 1133 609 1164 q 587 1080 609 1103 q 535 1058 565 1058 q 481 1080 503 1058 q 459 1133 459 1102 q 481 1185 459 1163 q 535 1208 503 1208 m 378 421 l 515 425 l 381 762 l 247 425 l 378 421 "},"a":{"x_min":44,"x_max":653.734375,"ha":647,"o":"m 233 -15 q 99 33 154 -15 q 44 162 44 82 q 105 302 44 273 q 302 363 167 331 q 444 448 437 395 q 401 567 444 519 q 287 615 359 615 q 190 587 231 615 q 124 508 149 560 l 95 519 l 103 591 q 204 651 148 631 q 323 672 260 672 q 499 623 443 672 q 555 457 555 574 l 555 132 q 566 70 555 86 q 616 55 578 55 l 653 55 l 653 26 q 594 4 624 15 q 536 -6 564 -6 q 468 15 492 -6 q 436 83 445 38 q 341 9 387 34 q 233 -15 294 -15 m 175 185 q 204 99 175 135 q 282 63 234 63 q 389 106 343 63 q 436 211 436 150 l 436 344 q 239 294 304 320 q 175 185 175 268 "},"—":{"x_min":226.390625,"x_max":1138.890625,"ha":1367,"o":"m 226 375 l 1138 375 l 1138 292 l 226 292 l 226 375 "},"=":{"x_min":169.4375,"x_max":969.453125,"ha":1139,"o":"m 969 499 l 169 499 l 169 564 l 969 564 l 969 499 m 969 248 l 169 248 l 169 315 l 969 315 l 969 248 "},"N":{"x_min":98,"x_max":911.890625,"ha":1011,"o":"m 112 230 q 114 486 112 315 q 117 741 117 656 l 117 950 l 166 950 q 326 766 239 865 q 468 606 413 667 q 610 451 524 544 l 821 227 l 821 604 q 816 765 821 685 q 803 931 812 845 l 855 927 l 911 931 q 901 831 906 884 q 897 741 897 779 q 894 413 897 619 q 892 165 892 207 l 892 -15 l 849 -15 q 730 125 796 50 q 589 281 664 201 l 193 702 l 193 330 q 212 -1 193 169 l 149 2 l 98 -1 q 108 125 105 79 q 112 230 112 170 "},"ρ":{"x_min":65,"x_max":711,"ha":758,"o":"m 191 -99 q 195 -235 191 -145 q 199 -371 199 -325 q 161 -367 169 -367 q 134 -366 153 -366 q 96 -368 116 -366 q 65 -372 76 -370 q 70 -190 65 -311 q 76 -8 76 -69 q 73 166 76 67 q 70 329 71 265 q 148 578 70 484 q 380 672 226 672 q 617 573 524 672 q 711 329 711 474 q 625 84 711 184 q 396 -15 539 -15 q 285 7 334 -15 q 191 78 236 30 l 191 -99 m 377 619 q 231 533 271 619 q 191 327 191 447 q 241 103 191 169 q 376 38 292 38 q 525 125 479 38 q 571 326 571 212 q 525 529 571 440 q 377 619 480 619 "},"2":{"x_min":22,"x_max":622,"ha":749,"o":"m 449 648 q 410 789 449 727 q 298 851 371 851 q 173 802 219 851 q 128 676 128 753 l 118 673 q 84 740 100 712 q 47 799 69 768 q 313 911 158 911 q 507 844 426 911 q 589 667 589 777 q 527 479 589 555 q 315 258 466 404 l 169 118 l 442 118 q 531 123 485 118 q 622 136 576 129 q 617 102 619 117 q 616 68 616 87 q 617 37 616 54 q 622 0 619 20 q 438 4 562 0 q 252 8 315 8 q 142 7 195 8 q 22 0 88 6 l 22 40 q 234 238 155 158 q 380 430 312 319 q 449 648 449 541 "},"ü":{"x_min":90,"x_max":664,"ha":754,"o":"m 653 498 q 653 329 653 443 q 653 158 653 215 q 664 0 653 82 q 631 3 647 1 q 598 5 616 5 q 563 3 583 5 q 533 0 544 1 l 538 118 q 440 18 494 52 q 312 -15 385 -15 q 148 50 201 -15 q 96 229 96 115 l 96 354 l 96 516 l 90 655 q 120 650 103 651 q 158 648 136 648 q 192 650 175 648 q 227 656 210 651 q 220 446 227 592 q 213 247 213 300 q 247 115 213 163 q 362 68 281 68 q 477 113 428 68 q 531 217 525 159 q 538 340 538 274 q 533 520 538 394 q 528 655 528 647 q 558 650 542 651 q 596 648 574 648 q 629 650 612 648 q 663 656 646 651 q 653 498 653 574 m 253 929 q 307 906 285 929 q 330 854 330 884 q 309 800 330 822 q 257 778 288 778 q 202 800 225 778 q 180 854 180 823 q 200 906 180 884 q 253 929 221 929 m 498 929 q 549 906 527 929 q 572 854 572 884 q 551 799 572 820 q 499 778 531 778 q 444 800 466 778 q 422 854 422 822 q 444 906 422 884 q 498 929 466 929 "},"Z":{"x_min":6.9375,"x_max":801.390625,"ha":828,"o":"m 6 36 q 222 324 112 176 q 425 605 333 473 l 597 857 l 433 857 q 59 836 247 857 l 65 883 l 59 932 q 262 927 134 932 q 427 922 390 922 q 622 927 491 922 q 801 932 754 932 l 801 904 q 594 629 709 785 q 399 361 479 473 q 201 77 319 249 l 427 77 q 581 82 520 77 q 801 103 643 87 l 797 68 l 795 54 l 797 34 l 801 0 q 504 4 683 0 q 325 8 326 8 q 166 4 272 8 q 6 0 61 0 l 6 36 "},"u":{"x_min":90,"x_max":662.21875,"ha":754,"o":"m 653 497 l 653 156 q 654 83 653 122 q 661 -1 656 44 q 623 3 632 2 q 596 4 615 4 q 572 3 581 4 q 533 -1 563 2 l 536 117 q 439 18 491 51 q 313 -15 386 -15 q 147 48 199 -15 q 96 227 96 112 l 96 352 l 96 516 l 90 654 q 158 647 125 647 q 189 648 178 647 q 226 654 200 650 q 220 450 226 586 q 215 246 215 314 q 248 114 215 163 q 361 66 281 66 q 473 112 426 66 q 527 225 520 158 q 536 340 536 282 q 531 497 536 393 q 527 654 527 601 q 572 647 563 647 q 595 647 581 647 q 626 648 616 647 q 662 654 637 650 l 653 497 "},"k":{"x_min":97,"x_max":677.5625,"ha":683,"o":"m 104 656 q 100 873 104 741 q 97 1025 97 1005 q 164 1018 134 1018 q 231 1025 196 1018 q 227 825 231 962 q 223 622 223 687 l 223 377 l 245 377 q 507 654 391 506 q 563 647 538 647 q 616 647 589 647 q 648 652 638 651 l 349 398 l 548 165 q 608 93 577 127 q 677 19 638 59 l 677 0 q 628 3 659 0 q 591 6 597 6 q 544 3 567 6 q 510 0 520 0 q 438 101 473 54 q 360 197 402 148 l 269 308 l 252 324 l 223 326 q 227 164 223 272 q 231 0 231 55 q 200 4 215 2 q 164 5 185 5 q 127 3 146 5 q 97 0 108 1 q 100 386 97 151 q 104 656 104 620 "},"Η":{"x_min":109,"x_max":928.453125,"ha":1039,"o":"m 257 317 q 262 142 257 253 q 267 0 267 30 q 226 3 253 0 q 188 8 200 8 q 147 3 174 8 q 109 0 121 0 q 116 243 109 72 q 124 465 124 415 q 116 710 124 540 q 109 932 109 880 q 152 929 121 932 q 188 926 183 926 q 231 929 200 926 q 267 932 262 932 q 262 719 267 854 q 257 547 257 584 q 406 544 301 547 q 517 541 511 541 q 666 544 562 541 q 777 547 770 547 q 773 786 777 641 q 769 932 769 930 q 813 929 781 932 q 849 926 845 926 q 893 929 861 926 q 928 932 924 932 q 914 795 920 866 q 909 659 909 723 l 909 505 q 918 252 909 420 q 927 0 927 84 q 887 4 913 0 q 848 8 861 8 q 811 5 829 8 q 769 0 793 2 q 773 103 769 41 q 777 176 777 166 l 777 317 l 777 465 q 604 466 692 465 q 430 469 517 467 l 257 465 l 257 317 "},"Α":{"x_min":-15.28125,"x_max":838.890625,"ha":825,"o":"m 257 639 l 387 950 q 402 945 395 947 q 417 944 409 944 q 452 950 437 944 q 576 629 536 733 q 686 359 617 526 q 838 0 755 192 q 789 3 820 0 q 751 6 758 6 q 700 4 723 6 q 663 0 677 1 q 600 199 622 137 q 543 353 579 260 l 377 358 l 215 353 l 162 205 q 130 110 145 160 q 101 0 115 59 l 44 5 q 6 2 20 5 q -15 0 -8 0 q 76 211 30 105 q 158 404 121 318 q 257 639 195 490 m 378 419 l 513 425 l 379 761 l 246 425 l 378 419 "},"ß":{"x_min":94,"x_max":726,"ha":765,"o":"m 107 431 l 107 611 l 107 761 q 200 948 118 872 q 395 1025 283 1025 q 543 979 478 1025 q 608 852 608 933 q 530 709 608 783 q 453 586 453 636 q 589 457 453 547 q 726 259 726 368 q 648 64 726 143 q 453 -15 570 -15 q 379 -6 418 -15 q 309 15 339 1 l 334 128 l 348 127 q 405 70 368 91 q 485 49 442 49 q 583 92 544 49 q 622 193 622 135 q 484 365 622 280 q 347 525 347 450 q 433 667 347 561 q 520 838 520 773 q 483 939 520 899 q 386 979 446 979 q 269 924 313 979 q 226 795 226 870 l 226 629 l 226 344 q 229 141 226 265 q 233 1 233 18 q 196 4 219 1 q 166 8 173 8 q 123 5 142 8 q 94 1 105 2 q 100 250 94 91 q 107 431 107 409 "},"é":{"x_min":40,"x_max":646.9375,"ha":681,"o":"m 406 42 q 602 130 523 42 l 621 130 q 613 93 617 112 q 609 47 609 73 q 496 0 558 14 q 369 -15 435 -15 q 130 73 220 -15 q 40 311 40 162 q 126 562 40 456 q 355 669 212 669 q 564 590 481 669 q 646 386 646 512 l 644 331 q 438 333 562 331 q 313 335 315 335 l 179 331 q 235 127 179 212 q 406 42 291 42 m 406 945 q 440 976 424 966 q 477 986 455 986 q 528 934 528 986 q 513 895 528 912 q 471 866 498 879 l 272 743 l 222 743 l 406 945 m 513 392 l 513 437 q 470 563 513 509 q 356 618 427 618 q 233 552 271 618 q 183 390 195 487 l 513 392 "},"s":{"x_min":68,"x_max":531,"ha":593,"o":"m 117 161 q 172 69 130 102 q 276 36 214 36 q 378 67 333 36 q 424 152 424 98 q 334 260 424 224 q 168 320 251 290 q 79 460 79 366 q 147 612 79 552 q 310 672 216 672 q 400 660 355 672 q 500 627 446 649 l 461 508 l 448 508 q 401 587 433 561 q 314 614 369 614 q 223 584 262 614 q 185 505 185 555 q 358 375 185 427 q 531 197 531 322 q 450 39 531 93 q 259 -15 369 -15 q 68 23 162 -15 l 103 161 l 117 161 "},"B":{"x_min":109,"x_max":751,"ha":801,"o":"m 127 559 q 109 931 127 759 l 203 929 q 338 932 244 929 q 438 935 432 935 q 629 883 549 935 q 709 726 709 832 q 638 579 709 633 q 464 504 567 524 q 673 438 595 490 q 751 268 751 387 q 639 66 751 133 q 382 0 528 0 l 232 6 q 162 3 211 6 q 109 0 113 0 q 118 287 109 86 q 127 559 127 488 m 256 257 l 256 149 l 261 61 l 337 57 q 526 108 450 57 q 602 266 602 159 q 523 428 602 386 q 312 471 444 471 l 256 471 l 256 257 m 569 706 q 507 834 569 788 q 361 879 446 879 l 261 875 q 252 709 252 798 l 252 522 q 476 558 384 522 q 569 706 569 595 "},"…":{"x_min":119,"x_max":1005,"ha":1160,"o":"m 191 130 q 244 108 223 130 q 266 55 266 87 q 244 5 266 25 q 191 -15 223 -15 q 139 4 160 -15 q 119 55 119 23 q 139 108 119 87 q 191 130 159 130 m 560 130 q 612 108 591 130 q 634 55 634 87 q 612 5 634 25 q 560 -15 591 -15 q 507 4 528 -15 q 487 55 487 23 q 507 109 487 88 q 560 130 528 130 m 930 130 q 983 108 962 130 q 1005 55 1005 87 q 983 5 1005 25 q 930 -15 962 -15 q 878 4 899 -15 q 858 55 858 23 q 878 108 858 87 q 930 130 898 130 "},"?":{"x_min":128,"x_max":520,"ha":601,"o":"m 307 156 q 367 130 342 156 q 392 68 392 105 q 367 7 392 30 q 307 -15 343 -15 q 244 8 269 -15 q 220 68 220 32 q 244 130 220 105 q 307 156 269 156 m 329 250 q 214 290 261 250 q 168 399 168 331 q 287 595 168 479 q 406 776 406 712 q 371 858 406 823 q 292 894 337 894 q 207 867 243 894 q 162 794 171 840 l 150 794 q 142 835 146 822 q 128 894 139 849 q 210 936 165 922 q 305 950 255 950 q 457 893 394 950 q 520 748 520 837 q 398 550 520 657 q 276 370 276 443 q 293 316 276 337 q 343 296 310 296 q 397 302 372 296 l 383 256 q 357 251 365 252 q 329 250 348 250 "},"H":{"x_min":108,"x_max":927.453125,"ha":1036,"o":"m 258 318 q 263 143 258 255 q 268 0 268 30 q 229 3 255 0 q 188 8 202 8 q 148 3 174 8 q 108 0 121 0 q 117 239 108 70 q 126 465 126 408 q 122 711 126 620 q 108 932 119 803 q 153 928 124 932 q 188 925 183 925 q 231 928 204 925 q 268 932 259 932 q 263 719 268 854 q 258 547 258 584 l 517 543 l 777 547 q 773 786 777 641 q 769 932 769 930 q 814 928 785 932 q 848 925 842 925 q 894 928 864 925 q 927 932 923 932 q 914 798 919 868 q 909 659 909 729 l 909 448 l 909 283 q 916 135 909 238 q 924 0 924 31 q 885 4 911 0 q 846 8 860 8 q 807 4 832 8 q 769 0 781 0 q 773 101 769 37 q 777 177 777 164 l 777 318 l 777 468 q 604 468 720 468 q 431 468 489 468 l 258 468 l 258 318 "},"ν":{"x_min":0,"x_max":632,"ha":654,"o":"m 319 8 q 296 5 309 8 q 272 0 283 2 q 200 206 234 120 q 0 654 165 291 q 84 647 45 647 q 113 647 98 647 q 168 654 127 648 q 252 402 204 529 l 360 131 q 469 358 440 267 q 499 520 499 448 q 492 579 499 543 q 477 641 486 615 q 552 649 527 645 q 613 661 576 652 q 628 611 625 623 q 632 576 632 598 q 621 501 632 536 q 560 373 611 466 q 461 190 509 280 q 372 0 412 99 q 345 3 363 0 q 319 8 327 8 "},"î":{"x_min":-25,"x_max":365.328125,"ha":340,"o":"m 104 144 l 104 522 l 97 655 q 138 650 113 651 q 167 649 162 649 q 233 655 206 649 q 225 506 225 581 q 229 254 225 423 q 233 0 233 84 q 201 3 216 1 q 164 5 186 5 q 127 3 146 5 q 97 0 108 1 l 104 144 m 125 978 l 214 978 l 365 743 l 319 743 l 170 875 l 24 743 l -25 743 l 125 978 "},"c":{"x_min":36,"x_max":613.78125,"ha":644,"o":"m 606 119 l 594 41 q 493 -3 548 7 q 365 -15 438 -15 q 131 79 227 -15 q 36 312 36 173 q 134 576 36 480 q 399 672 233 672 q 513 658 459 672 q 613 616 566 645 q 586 492 597 563 l 571 492 q 510 586 550 553 q 406 619 470 619 q 235 532 294 619 q 176 327 176 445 q 237 125 176 209 q 415 42 299 42 q 594 122 520 42 l 606 119 "},"¶":{"x_min":18,"x_max":531,"ha":590,"o":"m 298 968 l 531 968 l 531 910 l 473 910 l 473 4 l 415 4 l 415 910 l 305 910 l 305 4 l 247 4 l 247 558 q 99 602 163 558 q 27 690 36 645 q 18 744 18 734 q 90 896 18 824 q 298 968 163 968 "},"β":{"x_min":96,"x_max":737.671875,"ha":779,"o":"m 160 -365 q 129 -367 151 -365 q 96 -369 107 -369 q 100 -253 96 -325 q 104 -169 104 -182 l 104 101 l 104 565 q 168 898 104 771 q 419 1025 232 1025 q 605 960 525 1025 q 686 787 686 895 q 641 641 686 705 q 522 548 597 577 q 682 454 626 515 q 737 290 737 394 q 648 73 737 162 q 431 -15 559 -15 q 324 3 372 -15 q 226 61 276 22 q 224 -44 226 19 q 223 -110 223 -107 l 230 -369 q 193 -367 220 -369 q 160 -365 166 -365 m 356 564 q 507 618 458 564 q 557 779 557 673 q 520 917 557 859 q 407 975 483 975 q 279 906 323 975 q 234 752 234 838 q 232 613 234 701 q 230 506 230 524 l 226 355 l 230 230 q 275 94 230 147 q 406 41 321 41 q 552 116 504 41 q 600 297 600 192 q 550 443 600 386 q 412 499 500 499 q 361 497 384 499 q 327 493 337 494 l 329 516 l 329 565 l 356 564 "},"Μ":{"x_min":55,"x_max":1165,"ha":1238,"o":"m 190 950 l 243 950 q 331 772 291 851 q 412 612 370 693 q 504 436 454 532 l 626 214 q 742 435 671 298 q 882 711 813 572 q 1001 950 952 850 l 1052 950 q 1082 649 1067 791 q 1118 341 1098 508 q 1165 0 1139 174 q 1121 8 1139 5 q 1088 11 1103 11 q 1049 6 1071 11 q 1008 0 1027 2 q 998 226 1008 109 q 974 461 989 343 q 944 695 959 579 l 748 312 q 610 0 665 152 l 594 1 l 576 0 q 227 685 402 364 l 188 307 q 172 128 175 179 q 168 0 168 77 q 138 4 157 1 q 110 6 118 6 q 81 4 93 6 q 55 0 68 2 q 121 333 89 168 q 171 652 152 498 q 190 950 190 805 "},"Ό":{"x_min":-1,"x_max":1305,"ha":1356,"o":"m 288 465 q 429 820 288 690 q 796 950 570 950 q 1129 853 991 950 q 1284 654 1268 757 q 1302 525 1299 551 q 1305 462 1305 500 q 1302 402 1305 426 q 1284 277 1299 379 q 1131 80 1268 175 q 797 -15 993 -15 q 684 -10 733 -15 q 541 29 635 -5 q 367 186 447 64 q 288 465 288 308 m 182 943 q 215 974 200 964 q 251 985 230 985 q 289 969 274 985 q 304 932 304 954 q 290 896 304 911 q 247 866 275 882 l 48 743 l -1 743 l 182 943 m 439 468 q 527 162 439 282 q 796 42 616 42 q 1063 162 975 42 q 1152 468 1152 283 q 1062 770 1152 651 q 796 889 972 889 q 585 826 666 889 q 462 639 504 764 q 439 468 439 552 "},"Ή":{"x_min":-1.390625,"x_max":1233.046875,"ha":1341,"o":"m 564 316 q 569 142 564 254 q 574 0 574 30 q 535 4 561 0 q 494 8 508 8 q 454 4 480 8 q 414 0 427 0 q 423 239 414 70 q 432 465 432 408 q 428 711 432 620 q 414 931 425 802 q 459 928 430 931 q 494 924 489 924 q 537 928 510 924 q 574 931 565 931 q 569 719 574 854 q 564 547 564 584 l 823 543 l 1083 547 q 1078 786 1083 641 q 1074 931 1074 930 q 1119 928 1091 931 q 1153 924 1148 924 q 1199 928 1170 924 q 1233 931 1228 931 q 1221 798 1226 868 q 1217 659 1217 729 l 1215 448 l 1217 283 q 1225 135 1217 238 q 1233 0 1233 31 q 1194 4 1220 0 q 1154 8 1167 8 q 1113 4 1140 8 q 1075 0 1087 0 q 1078 100 1075 37 q 1082 176 1082 163 l 1083 316 l 1083 465 q 910 466 1026 465 q 737 468 795 468 l 564 465 l 564 316 m 181 943 q 215 974 200 964 q 251 985 230 985 q 288 969 273 985 q 304 932 304 954 q 289 896 304 911 q 247 866 275 882 l 47 743 l -1 743 l 181 943 "},"•":{"x_min":204.171875,"x_max":795.828125,"ha":1003,"o":"m 501 789 q 709 702 622 789 q 795 493 795 615 q 709 286 795 372 q 501 201 623 201 q 290 286 377 201 q 204 493 204 371 q 226 605 204 550 q 312 725 248 661 q 501 789 376 789 "},"¥":{"x_min":32,"x_max":699,"ha":750,"o":"m 313 278 q 176 273 268 278 q 50 268 83 268 l 50 335 q 147 332 82 335 q 246 329 213 329 l 313 329 l 313 436 l 176 436 l 50 432 l 50 495 q 182 492 90 495 q 281 490 275 490 l 126 743 l 32 888 l 91 883 l 191 887 q 225 814 208 845 q 287 699 241 783 l 397 512 q 477 653 433 570 q 592 887 521 736 l 643 883 l 699 887 l 625 773 l 554 655 l 454 490 q 593 492 496 490 q 697 495 690 495 l 697 431 l 434 436 l 434 330 l 572 329 q 636 332 595 329 q 697 335 678 335 l 697 268 l 568 278 l 434 278 q 434 143 434 208 q 442 0 435 77 l 365 5 l 299 0 q 310 131 307 54 q 313 278 313 208 "},"(":{"x_min":114,"x_max":380.5625,"ha":449,"o":"m 114 388 q 175 684 114 545 q 351 950 237 822 q 380 918 361 933 q 253 660 291 782 q 215 379 215 538 q 256 103 215 231 q 380 -151 297 -25 q 351 -183 361 -167 q 173 84 232 -50 q 114 388 114 219 "},"U":{"x_min":101,"x_max":919.0625,"ha":1015,"o":"m 181 926 q 228 929 195 926 q 263 932 262 932 q 251 804 255 853 q 248 697 248 755 l 248 457 q 315 134 248 212 q 515 57 382 57 q 733 129 654 57 q 813 334 813 201 l 813 458 l 813 655 q 810 797 813 733 q 798 931 807 862 q 827 927 813 929 q 859 926 841 926 q 888 929 868 926 q 919 932 907 932 q 905 779 909 853 q 902 600 902 705 l 902 366 q 793 81 902 178 q 492 -15 685 -15 q 211 66 307 -15 q 116 323 116 147 l 116 425 l 116 698 q 109 826 116 759 q 101 931 103 893 q 138 927 120 929 q 181 926 156 926 "},"γ":{"x_min":-12,"x_max":701,"ha":681,"o":"m 642 647 q 701 654 669 647 q 593 440 633 520 q 502 247 553 359 l 411 48 l 411 -90 q 415 -238 411 -138 q 419 -372 419 -337 l 372 -366 q 282 -372 325 -366 q 287 -195 282 -313 q 292 -33 292 -76 q 260 192 292 47 q 170 460 229 338 q 39 583 111 583 l -12 579 l -10 608 l -12 638 q 43 662 14 653 q 101 672 71 672 q 279 554 234 672 q 398 143 324 437 q 496 393 439 244 q 590 654 553 541 q 615 648 607 650 q 642 647 623 647 "},"α":{"x_min":41,"x_max":827.109375,"ha":846,"o":"m 705 352 q 803 -1 763 155 l 739 1 l 673 -1 l 632 172 q 521 36 593 87 q 356 -15 448 -15 q 129 81 217 -15 q 41 316 41 177 q 130 569 41 467 q 368 672 220 672 q 537 622 464 672 q 659 486 610 573 q 711 654 691 569 l 770 650 l 827 654 q 763 505 792 576 q 705 352 734 434 m 377 619 q 226 530 272 619 q 181 326 181 442 q 223 124 181 214 q 367 34 265 34 q 528 137 480 34 q 601 323 577 240 q 527 531 578 444 q 377 619 475 619 "},"F":{"x_min":108,"x_max":613.5625,"ha":671,"o":"m 258 316 q 263 142 258 254 q 268 0 268 30 q 229 3 255 0 q 188 8 202 8 q 148 3 174 8 q 108 0 121 0 q 117 239 108 70 q 126 465 126 408 q 122 711 126 620 q 108 932 119 802 l 358 928 l 613 931 l 610 886 l 613 836 q 505 855 549 851 q 388 860 460 860 l 260 860 l 258 671 l 258 528 l 398 528 q 587 541 480 528 l 584 497 l 587 451 l 394 463 l 258 463 l 258 316 "},"­":{"x_min":0,"x_max":683.328125,"ha":683,"o":"m 0 374 l 683 374 l 683 289 l 0 289 l 0 374 "},":":{"x_min":134,"x_max":309,"ha":446,"o":"m 222 636 q 284 611 259 636 q 309 548 309 586 q 284 486 309 512 q 222 461 260 461 q 160 486 186 461 q 134 548 134 511 q 159 610 134 584 q 222 636 185 636 m 221 156 q 283 131 257 156 q 309 69 309 107 q 284 8 309 32 q 221 -15 259 -15 q 159 9 185 -15 q 134 69 134 33 q 159 131 134 107 q 221 156 185 156 "},"Χ":{"x_min":0,"x_max":739,"ha":739,"o":"m 200 285 l 318 456 q 18 932 159 718 q 63 929 33 932 q 109 926 94 926 q 168 929 147 926 q 198 932 188 932 q 296 743 244 841 q 391 568 348 644 l 489 726 q 597 932 548 825 q 627 927 614 929 q 661 926 641 926 q 693 929 671 926 q 728 932 715 932 q 616 781 673 862 q 524 652 558 700 l 427 512 q 523 347 480 419 q 614 197 566 275 q 739 0 662 119 q 686 3 719 0 q 647 6 652 6 q 595 4 618 6 q 558 0 572 1 q 459 197 512 97 q 353 398 405 298 l 265 249 q 174 96 193 130 q 127 0 155 62 q 89 3 113 0 q 62 6 65 6 q 26 4 43 6 q 0 0 9 1 l 200 285 "},"*":{"x_min":94,"x_max":580,"ha":675,"o":"m 336 940 q 367 944 349 940 q 389 948 385 948 q 368 850 375 902 q 362 747 362 799 q 522 873 442 800 q 548 812 539 829 q 580 778 556 796 q 386 702 485 750 q 476 661 427 680 q 575 629 524 643 q 521 535 539 587 q 441 604 478 573 q 362 661 403 634 q 369 564 362 615 q 391 459 377 513 q 360 463 379 459 q 336 467 340 467 q 306 463 325 467 q 282 459 288 459 q 304 568 296 522 q 313 661 313 615 q 152 535 221 602 q 128 589 138 569 q 97 630 117 608 q 185 661 140 643 q 287 704 231 679 q 189 746 234 728 q 94 777 145 763 q 125 818 113 795 q 150 873 137 841 q 227 805 184 839 q 313 747 269 771 q 309 810 313 784 q 282 950 305 836 q 310 942 297 945 q 336 940 324 940 "},"°":{"x_min":176,"x_max":508,"ha":683,"o":"m 176 889 q 228 1010 176 961 q 355 1060 280 1060 q 460 1011 413 1060 q 508 904 508 962 q 455 785 508 839 q 337 731 402 731 q 222 776 269 731 q 176 889 176 821 m 241 880 q 266 805 241 836 q 336 775 292 775 q 413 811 386 775 q 441 899 441 847 q 417 985 441 952 q 343 1018 393 1018 q 281 995 307 1018 q 247 940 254 973 q 241 880 241 906 "},"V":{"x_min":0,"x_max":852.78125,"ha":853,"o":"m 190 477 l 74 759 l 0 932 l 83 926 q 134 929 98 926 q 173 931 170 931 q 206 829 187 884 q 248 704 224 773 l 308 548 l 454 153 l 586 502 q 729 931 666 713 l 790 927 l 852 931 q 643 467 748 720 q 470 0 538 215 q 445 4 457 1 q 418 6 432 6 q 384 3 399 6 q 366 0 368 0 q 279 256 331 123 q 190 477 226 389 "},"Ξ":{"x_min":58.328125,"x_max":818.0625,"ha":878,"o":"m 437 821 q 258 817 377 821 q 77 813 138 813 q 84 851 83 838 q 84 872 84 864 q 77 932 84 900 q 256 928 137 932 q 437 924 376 924 q 618 928 497 924 q 797 932 738 932 l 791 872 q 794 842 791 861 q 797 813 797 822 q 619 817 738 813 q 437 821 500 821 m 470 430 q 335 425 440 430 q 183 421 230 421 q 187 456 186 433 q 188 481 188 480 q 183 543 188 515 q 304 538 215 543 q 437 533 394 533 q 572 538 481 533 q 694 543 662 543 l 687 482 l 694 421 q 572 425 650 421 q 470 430 494 430 m 437 8 q 250 4 376 8 q 58 0 123 0 l 63 63 l 58 129 q 268 124 134 129 q 437 119 401 119 q 636 124 502 119 q 818 129 769 129 l 813 63 l 818 0 q 627 4 754 0 q 437 8 501 8 "}," ":{"x_min":0,"x_max":0,"ha":375},"Ϋ":{"x_min":-26,"x_max":746,"ha":708,"o":"m 299 177 l 299 387 q 190 577 235 501 q 87 747 146 652 q -26 931 29 841 q 23 929 -13 931 q 65 926 61 926 q 110 929 78 926 q 146 931 143 931 q 208 800 175 866 q 278 676 241 734 l 391 475 q 627 931 519 693 l 683 927 q 721 929 701 927 q 746 931 741 931 q 652 786 702 866 q 557 627 602 705 l 432 415 l 432 241 q 435 97 432 184 q 439 0 439 10 q 395 4 414 2 q 361 6 376 6 q 320 4 336 6 q 286 0 304 2 q 294 88 290 36 q 299 177 299 141 m 233 1208 q 286 1187 265 1208 q 307 1133 307 1166 q 285 1080 307 1103 q 233 1058 263 1058 q 179 1080 202 1058 q 157 1133 157 1103 q 179 1186 157 1164 q 233 1208 202 1208 m 475 1208 q 528 1186 506 1208 q 550 1133 550 1164 q 528 1080 550 1103 q 475 1058 506 1058 q 422 1080 444 1058 q 400 1133 400 1102 q 421 1186 400 1164 q 475 1208 443 1208 "},"0":{"x_min":48,"x_max":699,"ha":749,"o":"m 372 909 q 621 773 544 909 q 699 451 699 637 q 627 116 699 252 q 372 -19 556 -19 q 120 114 193 -19 q 48 444 48 247 q 120 774 48 639 q 372 909 193 909 m 187 365 q 226 137 187 238 q 373 37 266 37 q 457 62 421 37 q 519 142 494 88 q 552 271 545 196 q 559 455 559 346 q 526 736 559 622 q 371 851 493 851 q 245 783 280 851 q 198 647 210 716 q 187 444 187 577 l 187 365 "},"”":{"x_min":104.171875,"x_max":570.828125,"ha":625,"o":"m 184 858 q 211 924 193 898 q 265 951 230 951 q 320 903 316 951 q 310 856 320 881 q 283 812 300 831 l 136 568 l 104 576 l 184 858 m 433 858 q 468 928 452 905 q 516 951 483 951 q 555 938 540 951 q 570 903 570 926 q 561 859 570 881 q 536 812 552 837 l 387 568 l 355 576 l 433 858 "},"@":{"x_min":78,"x_max":1289,"ha":1367,"o":"m 906 640 l 970 640 l 876 266 l 864 203 q 886 157 864 172 q 940 142 908 142 q 1136 262 1062 142 q 1211 513 1211 383 q 1067 801 1211 693 q 735 909 923 909 q 324 753 495 909 q 154 362 154 598 q 301 1 154 135 q 679 -132 448 -132 q 904 -99 791 -132 q 1105 -6 1016 -67 l 1129 -43 q 923 -150 1033 -113 q 694 -188 812 -188 q 258 -43 439 -188 q 78 350 78 100 q 273 791 78 614 q 737 969 469 969 q 1122 843 955 969 q 1289 507 1289 717 q 1187 214 1289 346 q 930 82 1086 82 q 835 103 879 82 q 792 170 792 124 l 792 203 q 709 116 762 150 q 595 82 655 82 q 439 139 493 82 q 386 302 386 197 q 471 553 386 441 q 692 665 556 665 q 797 639 754 665 q 864 556 840 613 l 906 640 m 849 477 q 796 572 835 535 q 701 609 758 609 q 529 511 592 609 q 467 297 467 413 q 503 184 467 230 q 605 139 540 139 q 733 188 679 139 q 807 313 787 238 l 849 477 "},"Ί":{"x_min":-1.390625,"x_max":580.0625,"ha":690,"o":"m 433 465 q 429 711 433 620 q 414 931 426 802 q 461 927 435 929 q 498 925 487 925 q 546 928 517 925 q 580 931 575 931 q 572 788 580 887 q 564 659 564 690 l 562 448 l 564 283 q 572 135 564 238 q 580 0 580 31 q 539 4 567 0 q 498 8 512 8 q 457 5 480 8 q 414 0 435 2 q 423 239 414 70 q 433 465 433 408 m 181 943 q 215 974 200 964 q 251 985 230 985 q 288 969 273 985 q 304 932 304 954 q 289 896 304 911 q 247 866 275 882 l 47 743 l -1 743 l 181 943 "},"ö":{"x_min":40,"x_max":712,"ha":753,"o":"m 371 -15 q 131 79 223 -15 q 40 322 40 173 q 133 572 40 473 q 380 672 227 672 q 621 575 530 672 q 712 327 712 479 q 619 80 712 175 q 371 -15 527 -15 m 253 929 q 307 906 285 929 q 330 854 330 884 q 309 800 330 822 q 257 778 288 778 q 202 800 225 778 q 180 854 180 823 q 200 906 180 884 q 253 929 221 929 m 498 929 q 549 906 527 929 q 572 854 572 884 q 551 799 572 820 q 499 778 531 778 q 444 800 466 778 q 422 854 422 822 q 444 906 422 884 q 498 929 466 929 m 377 622 q 227 532 274 622 q 180 327 180 442 q 227 125 180 216 q 375 35 274 35 q 524 124 478 35 q 570 327 570 214 q 524 531 570 441 q 377 622 479 622 "},"i":{"x_min":91.765625,"x_max":244,"ha":342,"o":"m 100 144 l 100 520 l 93 654 q 161 648 130 648 q 194 649 182 648 q 229 654 207 650 q 221 579 224 616 q 219 505 219 543 q 224 240 219 417 q 229 0 229 63 q 197 3 212 1 q 161 5 181 5 q 116 2 131 5 q 91 0 100 0 l 100 144 m 168 963 q 223 940 202 963 q 244 881 244 917 q 222 831 244 849 q 168 813 200 813 q 115 833 137 813 q 93 885 93 853 q 113 941 93 919 q 168 963 134 963 "},"Β":{"x_min":109,"x_max":751,"ha":801,"o":"m 127 559 q 109 931 127 759 l 203 929 q 338 932 244 929 q 438 935 432 935 q 629 883 549 935 q 709 726 709 832 q 638 579 709 633 q 464 504 567 524 q 673 438 595 490 q 751 268 751 387 q 639 66 751 133 q 382 0 528 0 l 232 6 q 162 3 211 6 q 109 0 113 0 q 118 287 109 86 q 127 559 127 488 m 256 257 l 256 149 l 261 61 l 337 57 q 526 108 450 57 q 602 266 602 159 q 523 428 602 386 q 312 471 444 471 l 256 471 l 256 257 m 569 706 q 507 834 569 788 q 361 879 446 879 l 261 875 q 252 709 252 798 l 252 522 q 476 558 384 522 q 569 706 569 595 "},"≤":{"x_min":176,"x_max":962.703125,"ha":1139,"o":"m 288 491 l 962 266 l 962 196 l 176 462 l 176 521 l 962 788 l 962 718 l 288 491 m 962 26 l 176 26 l 176 93 l 962 93 l 962 26 "},"υ":{"x_min":79,"x_max":703,"ha":774,"o":"m 703 397 q 596 110 703 236 q 332 -15 489 -15 q 145 54 211 -15 q 79 244 79 123 l 83 430 q 81 542 83 486 q 79 654 80 598 l 146 650 l 217 654 q 209 503 217 608 q 202 366 202 398 l 202 261 q 240 105 202 168 q 369 43 279 43 q 523 133 476 43 q 571 341 571 223 q 548 493 571 418 q 488 645 526 568 q 550 648 529 645 q 627 659 571 650 q 703 397 703 538 "},"]":{"x_min":83,"x_max":332,"ha":449,"o":"m 209 -154 l 83 -158 l 85 -129 l 85 -98 q 183 -104 128 -104 l 229 -104 l 232 386 l 232 880 l 185 880 q 134 877 162 880 q 83 872 107 874 l 85 903 l 85 932 l 205 929 l 332 929 q 326 852 332 909 q 321 766 321 794 l 321 455 l 321 2 l 332 -158 l 209 -154 "},"m":{"x_min":91,"x_max":1075,"ha":1167,"o":"m 101 155 l 101 494 q 98 568 101 529 q 91 654 96 606 q 155 647 123 647 l 221 654 l 216 537 q 317 638 261 604 q 450 672 373 672 q 629 547 581 672 q 733 639 677 606 q 860 672 789 672 q 1018 606 968 672 q 1069 429 1069 540 l 1069 298 l 1069 136 l 1075 0 q 1038 3 1063 0 q 1006 6 1013 6 q 968 3 992 6 q 938 0 943 0 q 944 203 938 68 q 950 406 950 338 q 918 536 950 486 q 810 587 887 587 q 699 540 745 587 q 648 452 653 493 q 642 376 643 410 q 641 326 641 342 l 641 314 q 644 132 641 258 q 647 0 647 6 q 607 4 621 2 q 581 5 593 5 q 542 2 570 5 q 514 0 515 0 q 519 168 514 55 q 524 321 524 280 l 524 406 q 490 534 524 482 q 383 587 457 587 q 273 541 314 587 q 223 436 231 496 q 216 314 216 376 q 219 133 216 244 q 222 0 222 22 q 183 3 207 0 q 154 6 159 6 q 117 4 134 6 q 91 0 100 1 l 101 155 "},"χ":{"x_min":-1,"x_max":725.390625,"ha":713,"o":"m 500 426 q 554 536 528 476 q 607 654 580 595 l 675 650 l 725 652 q 623 507 672 586 q 519 330 573 427 l 444 197 q 575 -85 507 55 q 719 -371 643 -227 q 665 -371 701 -371 q 611 -371 629 -371 l 560 -371 q 444 -115 497 -230 q 358 72 392 -1 l 255 -95 q 178 -237 208 -174 q 125 -371 147 -299 l 62 -371 l 0 -371 q 125 -192 68 -278 q 240 -5 182 -106 l 324 136 l 201 402 q 146 519 174 460 q 43 587 103 587 l -1 584 l -1 638 q 128 672 57 672 q 222 627 181 672 q 292 522 264 583 l 359 374 l 411 260 l 500 426 "},"8":{"x_min":59,"x_max":689,"ha":749,"o":"m 110 696 q 187 853 110 797 q 370 909 264 909 q 558 854 480 909 q 636 694 636 800 q 589 575 636 621 q 467 510 543 529 l 467 499 q 630 413 572 475 q 689 247 689 351 q 597 51 689 120 q 374 -18 505 -18 q 149 48 239 -18 q 59 247 59 115 q 118 414 59 347 q 281 499 178 480 l 281 510 q 157 570 205 521 q 110 696 110 619 m 371 531 q 472 577 437 531 q 507 693 507 624 q 470 810 507 764 q 366 856 433 856 q 271 807 305 856 q 238 693 238 758 q 271 578 238 625 q 371 531 305 531 m 373 31 q 505 97 461 31 q 550 255 550 164 q 506 415 550 348 q 373 482 462 482 q 239 416 283 482 q 195 255 195 351 q 240 96 195 162 q 373 31 285 31 "},"ί":{"x_min":96,"x_max":429.34375,"ha":342,"o":"m 104 333 l 104 520 q 103 566 104 544 q 96 654 102 588 q 141 647 130 648 q 165 647 151 647 q 233 654 196 647 q 224 555 226 599 q 223 437 223 511 l 223 406 q 228 194 223 337 q 233 0 233 51 q 201 3 216 1 q 165 5 185 5 q 127 3 148 5 q 96 0 107 1 q 100 165 96 51 q 104 333 104 279 m 308 943 q 341 974 326 964 q 377 985 357 985 q 415 969 401 985 q 429 932 429 954 q 414 896 429 912 q 373 866 400 880 l 174 743 l 125 743 l 308 943 "},"Ζ":{"x_min":6.9375,"x_max":801.390625,"ha":828,"o":"m 6 36 q 222 324 112 176 q 425 605 333 473 l 597 857 l 433 857 q 59 836 247 857 l 65 883 l 59 932 q 262 927 134 932 q 427 922 390 922 q 622 927 491 922 q 801 932 754 932 l 801 904 q 594 629 709 785 q 399 361 479 473 q 201 77 319 249 l 427 77 q 581 82 520 77 q 801 103 643 87 l 797 68 l 795 54 l 797 34 l 801 0 q 504 4 683 0 q 325 8 326 8 q 166 4 272 8 q 6 0 61 0 l 6 36 "},"R":{"x_min":109,"x_max":806.234375,"ha":785,"o":"m 261 0 q 223 3 248 0 q 185 8 198 8 q 148 5 168 8 q 109 0 127 2 q 118 306 109 90 q 127 598 127 523 q 122 761 127 672 q 109 931 117 849 l 203 929 l 409 935 q 618 882 529 935 q 708 719 708 830 q 634 559 708 615 q 442 473 560 503 q 620 240 533 355 q 806 0 708 124 l 732 5 l 610 0 q 449 240 529 127 q 283 455 369 353 l 251 455 l 251 307 q 256 138 251 245 q 261 0 261 31 m 570 699 q 504 835 570 791 q 344 879 439 879 l 261 875 q 253 772 255 834 q 251 701 251 709 l 251 504 q 479 542 388 504 q 570 699 570 581 "},"×":{"x_min":203.984375,"x_max":938.015625,"ha":1139,"o":"m 892 775 l 938 729 l 616 406 l 938 86 l 892 38 l 571 361 l 247 38 l 203 86 l 525 407 l 204 729 l 247 775 l 570 453 l 892 775 "},"o":{"x_min":41,"x_max":710,"ha":753,"o":"m 371 -15 q 131 78 222 -15 q 41 322 41 172 q 133 573 41 474 q 378 672 225 672 q 619 574 528 672 q 710 326 710 477 q 617 80 710 175 q 371 -15 525 -15 m 377 619 q 226 530 272 619 q 180 327 180 441 q 227 125 180 216 q 375 35 274 35 q 524 123 478 35 q 570 326 570 211 q 524 529 570 440 q 377 619 479 619 "},"5":{"x_min":75,"x_max":654,"ha":749,"o":"m 116 201 q 176 77 131 120 q 303 35 221 35 q 454 98 396 35 q 512 255 512 161 q 457 407 512 346 q 313 469 403 469 q 170 417 227 469 l 150 428 l 158 526 q 158 662 158 570 q 158 801 158 754 l 147 888 l 383 879 l 412 879 q 628 887 520 879 q 624 848 626 870 q 622 818 622 826 l 626 760 l 425 761 l 227 761 q 221 631 227 717 q 216 500 216 544 q 375 536 296 536 q 572 465 491 536 q 654 279 654 394 q 550 60 654 139 q 304 -18 447 -18 q 179 -6 231 -18 q 75 34 127 4 q 101 201 87 118 l 116 201 "},"7":{"x_min":122.609375,"x_max":729.5625,"ha":749,"o":"m 461 553 l 586 770 l 362 770 q 129 755 232 770 q 133 786 132 769 q 135 820 135 804 q 128 888 135 853 l 408 883 l 729 887 l 729 871 q 463 429 582 641 q 251 0 344 216 l 194 8 q 153 5 169 8 q 122 0 137 2 q 214 146 179 91 q 333 339 249 201 q 461 553 417 477 "},"K":{"x_min":108,"x_max":856.625,"ha":821,"o":"m 255 314 q 261 132 255 250 q 268 0 268 13 q 229 4 255 0 q 188 8 202 8 q 148 4 174 8 q 108 0 121 0 q 117 239 108 70 q 126 465 126 408 q 122 712 126 621 q 108 932 119 803 q 153 928 124 932 q 188 925 183 925 q 231 928 203 925 q 267 932 259 932 l 255 671 l 255 499 q 480 693 375 586 q 687 932 585 800 q 732 932 710 932 q 777 932 753 932 l 837 932 q 606 727 720 830 q 389 522 493 623 q 525 358 465 426 q 666 202 586 290 q 856 0 747 115 l 746 0 q 692 -1 716 0 q 644 -8 669 -2 q 571 92 610 44 q 477 204 532 140 l 255 459 l 255 314 "},",":{"x_min":40.28125,"x_max":272.21875,"ha":374,"o":"m 131 75 q 160 147 144 120 q 213 175 176 175 q 272 119 272 175 q 259 67 272 91 q 231 18 245 43 l 73 -243 l 40 -231 l 131 75 "},"d":{"x_min":55,"x_max":676,"ha":758,"o":"m 668 762 l 672 137 l 676 -1 q 638 3 653 1 q 611 5 623 5 q 574 2 597 5 q 547 -1 551 -1 l 557 119 q 336 -15 484 -15 q 127 86 200 -15 q 55 330 55 187 q 127 569 55 467 q 332 672 199 672 q 457 643 402 672 q 551 556 513 615 l 551 756 l 551 789 l 551 818 q 542 1025 551 927 q 609 1018 576 1018 q 639 1019 628 1018 q 675 1025 651 1020 l 668 762 m 374 57 q 515 139 473 57 q 557 332 557 222 q 513 522 557 437 q 374 607 470 607 q 236 522 278 607 q 194 332 194 438 q 235 141 194 225 q 374 57 277 57 "},"¨":{"x_min":83.71875,"x_max":550.390625,"ha":625,"o":"m 471 659 q 441 593 458 618 q 389 568 424 568 q 350 579 365 568 q 335 613 335 591 q 346 660 335 633 q 371 706 358 687 l 519 950 l 550 940 l 471 659 m 221 659 q 192 593 211 618 q 137 568 174 568 q 83 613 83 568 q 93 658 83 637 q 119 706 103 680 l 268 950 l 300 940 l 221 659 "},"E":{"x_min":108,"x_max":613.5625,"ha":686,"o":"m 126 465 q 122 711 126 620 q 108 932 119 802 l 353 928 l 610 931 l 606 884 l 610 836 q 508 853 562 847 q 408 860 453 860 l 260 860 l 258 671 l 258 528 l 398 528 q 587 541 480 528 l 584 497 l 587 451 l 394 463 l 258 463 l 258 316 l 264 73 q 456 76 380 73 q 613 94 531 80 l 610 47 l 613 0 l 358 4 l 108 0 q 117 239 108 70 q 126 465 126 408 "},"Y":{"x_min":-28,"x_max":746,"ha":707,"o":"m 297 177 l 297 386 q 191 570 256 458 q 84 750 125 682 q -28 932 42 819 q 24 928 -9 932 q 63 925 59 925 q 112 927 91 925 q 146 932 134 930 q 207 800 174 866 q 275 676 239 735 l 389 475 q 509 688 451 575 q 627 932 567 801 l 683 926 q 715 927 701 926 q 746 932 729 929 q 555 627 640 769 l 432 415 l 432 240 q 435 101 432 198 q 438 0 438 5 q 401 4 426 1 q 361 6 376 6 q 319 4 334 6 q 284 0 304 2 q 292 88 288 36 q 297 177 297 140 "},"\"":{"x_min":64,"x_max":315,"ha":379,"o":"m 133 587 l 64 587 l 64 957 l 133 957 l 133 587 m 315 587 l 247 587 l 247 957 l 315 957 l 315 587 "},"ê":{"x_min":40,"x_max":646.9375,"ha":681,"o":"m 406 42 q 602 130 523 42 l 621 130 q 613 93 617 112 q 609 47 609 73 q 496 0 558 14 q 369 -15 435 -15 q 130 73 220 -15 q 40 311 40 162 q 126 562 40 456 q 355 669 212 669 q 564 590 481 669 q 646 386 646 512 l 644 331 q 438 333 562 331 q 314 335 315 335 l 179 331 q 235 127 179 212 q 406 42 291 42 m 296 978 l 386 978 l 537 743 l 488 743 l 340 875 l 193 743 l 143 743 l 296 978 m 513 392 l 513 437 q 470 563 513 509 q 356 618 427 618 q 233 552 271 618 q 183 390 195 487 l 513 392 "},"δ":{"x_min":41,"x_max":670,"ha":710,"o":"m 102 840 q 185 981 102 937 q 375 1025 268 1025 q 497 1010 436 1025 q 621 968 559 995 q 595 876 604 923 q 500 947 547 923 q 393 972 453 972 q 280 937 328 972 q 233 840 233 902 q 272 742 233 794 q 434 627 312 691 q 613 504 556 563 q 670 305 670 445 q 581 75 670 165 q 350 -15 492 -15 q 125 73 210 -15 q 41 305 41 162 q 113 526 41 430 q 306 622 186 622 q 145 726 189 674 q 102 840 102 779 m 356 576 q 221 492 261 576 q 181 302 181 409 q 223 118 181 203 q 356 34 265 34 q 490 116 450 34 q 530 307 530 198 q 489 492 530 409 q 356 576 449 576 "},"έ":{"x_min":53,"x_max":598.828125,"ha":628,"o":"m 506 516 q 433 591 467 566 q 353 616 400 616 q 261 580 298 616 q 225 492 225 545 q 268 406 225 437 q 372 375 311 375 l 418 375 l 417 352 l 417 313 l 343 317 q 237 282 281 317 q 193 185 193 247 q 238 78 193 118 q 352 38 284 38 q 460 66 410 38 q 543 144 510 94 q 553 99 547 121 q 567 54 558 76 q 452 2 515 19 q 321 -15 388 -15 q 134 31 216 -15 q 53 176 53 78 q 96 286 53 246 q 214 355 139 326 q 127 408 162 370 q 93 497 93 445 q 165 625 93 579 q 323 672 237 672 q 430 654 378 672 q 541 604 481 637 q 522 564 529 584 q 506 516 514 545 m 476 944 q 510 975 494 965 q 547 986 526 986 q 584 970 569 986 q 598 933 598 954 q 584 898 598 912 q 541 867 569 884 l 342 744 l 293 744 l 476 944 "},"ω":{"x_min":39.71875,"x_max":1028.9375,"ha":1068,"o":"m 535 526 l 596 528 l 594 305 q 616 117 594 193 q 722 42 638 42 q 850 118 811 42 q 888 293 888 194 q 829 502 888 409 q 664 654 769 594 l 717 648 q 805 654 766 648 q 967 510 905 606 q 1028 304 1028 413 q 948 81 1028 177 q 744 -15 867 -15 q 622 16 678 -15 q 534 104 566 47 q 445 16 500 48 q 323 -15 389 -15 q 118 83 196 -15 q 39 311 39 182 q 100 511 39 419 q 262 654 161 604 q 303 650 278 651 q 349 648 327 648 l 402 654 q 238 501 296 593 q 179 291 179 409 q 218 116 179 191 q 348 42 257 42 q 419 68 390 42 q 461 137 448 94 q 472 216 469 175 q 475 303 475 257 q 472 419 475 353 q 469 528 470 485 l 535 526 "},"´":{"x_min":90.28125,"x_max":305.5625,"ha":374,"o":"m 169 859 q 197 923 177 894 q 250 953 218 953 q 288 939 272 953 q 305 902 305 925 q 295 857 305 882 q 269 811 284 833 l 120 568 l 90 576 l 169 859 "},"±":{"x_min":169,"x_max":969,"ha":1139,"o":"m 602 549 l 969 549 l 969 482 l 602 482 l 602 247 l 534 247 l 534 482 l 169 482 l 169 549 l 534 549 l 534 779 l 602 779 l 602 549 m 969 33 l 169 33 l 169 100 l 969 100 l 969 33 "},"|":{"x_min":305,"x_max":376,"ha":683,"o":"m 376 448 l 305 448 l 305 956 l 376 956 l 376 448 m 376 -233 l 305 -233 l 305 272 l 376 272 l 376 -233 "},"ϋ":{"x_min":79,"x_max":703,"ha":774,"o":"m 703 395 q 595 110 703 236 q 332 -15 488 -15 q 145 54 211 -15 q 79 244 79 123 l 83 429 q 81 542 83 486 q 79 654 80 598 l 146 650 l 217 654 q 209 502 217 608 q 202 365 202 397 l 202 261 q 240 105 202 168 q 369 43 279 43 q 523 132 476 43 q 571 340 571 222 q 548 493 571 418 q 488 645 526 568 q 550 647 529 645 q 627 658 571 650 q 703 395 703 537 m 227 928 q 281 907 259 928 q 304 853 304 886 q 283 800 304 822 q 230 778 262 778 q 175 800 197 778 q 153 853 153 822 q 174 906 153 884 q 227 928 195 928 m 469 928 q 523 906 501 928 q 545 853 545 884 q 524 799 545 821 q 472 778 504 778 q 418 800 440 778 q 396 853 396 822 q 416 905 396 883 q 469 928 437 928 "},"§":{"x_min":64,"x_max":620,"ha":675,"o":"m 114 36 l 128 36 q 198 -76 148 -33 q 319 -120 247 -120 q 430 -78 384 -120 q 476 27 476 -37 q 369 169 476 116 q 170 252 269 210 q 64 419 64 312 q 91 522 64 476 q 171 609 119 568 q 122 739 122 669 q 195 896 122 837 q 369 956 268 956 q 473 940 422 956 q 576 894 523 925 q 559 864 568 882 q 521 775 551 846 l 508 775 q 445 871 483 839 q 343 903 407 903 q 251 867 289 903 q 213 777 213 832 q 318 644 213 694 q 514 563 415 604 q 620 408 620 507 q 592 299 620 348 q 515 213 565 251 q 560 143 544 179 q 576 65 576 108 q 494 -112 576 -46 q 298 -178 412 -178 q 179 -163 239 -178 q 76 -119 120 -148 q 97 -42 86 -89 q 114 36 108 4 m 138 479 q 257 340 138 396 q 478 238 376 285 q 524 285 508 261 q 541 342 541 310 q 384 490 541 423 q 197 587 228 556 q 156 532 175 563 q 138 479 138 501 "},"b":{"x_min":78,"x_max":703,"ha":758,"o":"m 152 1018 q 219 1025 181 1018 q 212 916 214 966 q 210 788 210 866 l 210 755 l 210 555 q 419 672 283 672 q 629 569 555 672 q 703 322 703 466 q 630 79 703 173 q 414 -15 558 -15 q 296 8 350 -15 q 193 79 242 31 q 160 49 175 64 q 120 -1 145 33 l 78 -1 q 87 106 82 43 q 92 213 92 169 l 92 545 q 88 784 92 625 q 85 1025 85 944 q 152 1018 119 1018 m 383 605 q 243 520 285 605 q 202 323 202 435 q 245 133 202 218 q 383 48 288 48 q 522 132 480 48 q 564 326 564 217 q 522 519 564 434 q 383 605 480 605 "},"q":{"x_min":54,"x_max":675,"ha":758,"o":"m 608 -368 q 579 -368 591 -368 q 540 -373 567 -369 q 549 -213 548 -312 q 551 -101 551 -115 l 551 99 q 339 -15 476 -15 q 130 82 207 -15 q 54 316 54 180 q 125 564 54 456 q 333 672 197 672 q 464 636 407 672 q 557 535 520 601 q 546 655 557 594 q 586 649 576 650 q 611 648 597 648 q 674 655 640 648 l 671 433 q 669 163 671 298 q 666 -106 668 27 l 675 -373 q 643 -369 658 -370 q 608 -368 627 -368 m 373 48 q 515 134 473 48 q 557 331 557 220 q 511 514 557 433 q 372 596 466 596 q 234 512 276 596 q 193 322 193 429 q 236 133 193 218 q 373 48 279 48 "},"Ω":{"x_min":8,"x_max":1119.125,"ha":1129,"o":"m 449 0 q 318 4 410 0 q 223 8 227 8 l 10 0 l 13 47 q 11 74 13 59 q 8 95 9 88 q 119 88 69 90 q 249 86 169 86 q 103 261 152 170 q 55 473 55 352 q 200 822 55 694 q 567 950 345 950 q 931 823 791 950 q 1072 473 1072 697 q 1025 261 1072 350 q 878 86 978 173 q 992 91 902 86 q 1119 96 1083 96 l 1114 33 l 1117 0 l 906 8 q 778 4 867 8 q 682 0 688 0 l 682 72 q 864 215 807 122 q 921 451 921 309 q 834 764 921 639 q 565 889 747 889 q 296 767 384 889 q 209 454 209 645 q 268 217 209 319 q 449 72 327 115 l 449 0 "},"ύ":{"x_min":79,"x_max":703,"ha":774,"o":"m 703 395 q 595 110 703 236 q 332 -15 488 -15 q 145 54 211 -15 q 79 244 79 123 l 83 429 q 81 541 83 484 q 79 652 80 597 l 146 648 l 217 652 q 209 502 217 606 q 202 365 202 397 l 202 261 q 240 105 202 168 q 369 43 279 43 q 523 132 476 43 q 571 340 571 222 q 548 491 571 416 q 488 644 526 566 q 550 646 529 644 q 627 656 571 648 q 703 395 703 536 m 499 941 q 532 972 517 962 q 568 983 547 983 q 606 967 592 983 q 620 930 620 952 q 605 894 620 910 q 564 865 590 878 l 365 741 l 316 741 l 499 941 "},"Ö":{"x_min":51,"x_max":1069,"ha":1121,"o":"m 51 465 q 191 819 51 688 q 559 950 332 950 q 891 852 750 950 q 1046 659 1031 755 q 1065 535 1062 562 q 1069 462 1069 508 q 1066 395 1069 416 q 1047 275 1063 373 q 894 80 1031 176 q 562 -15 756 -15 q 451 -8 503 -15 q 304 31 399 -2 q 130 187 209 65 q 51 465 51 308 m 439 1208 q 491 1186 470 1208 q 513 1133 513 1164 q 491 1080 513 1103 q 439 1058 470 1058 q 385 1080 409 1058 q 362 1133 362 1102 q 384 1186 362 1164 q 439 1208 407 1208 m 682 1208 q 735 1186 713 1208 q 757 1133 757 1164 q 735 1080 757 1103 q 682 1058 713 1058 q 628 1079 650 1058 q 607 1133 607 1101 q 628 1186 607 1164 q 682 1208 650 1208 m 204 469 q 292 162 204 283 q 559 42 380 42 q 827 162 739 42 q 916 469 916 283 q 825 767 916 648 q 559 887 735 887 q 349 825 430 887 q 226 638 267 763 q 204 469 204 558 "},"z":{"x_min":15.28125,"x_max":606.9375,"ha":647,"o":"m 15 29 q 164 224 88 124 q 302 416 240 323 l 418 586 l 270 586 q 181 581 218 586 q 62 565 145 577 l 68 609 l 62 654 q 181 648 115 650 q 330 646 248 646 l 363 646 l 393 646 q 606 654 500 646 l 606 626 q 453 428 545 549 q 317 246 361 306 q 194 68 273 185 l 343 68 q 456 72 400 68 q 594 86 513 77 l 588 42 l 594 0 l 280 8 q 148 4 237 8 q 15 0 59 0 l 15 29 "},"™":{"x_min":176,"x_max":918,"ha":1139,"o":"m 463 930 l 346 930 l 346 614 l 293 614 l 293 930 l 176 930 l 176 969 l 463 969 l 463 930 m 736 690 l 840 968 l 918 969 l 918 614 l 871 614 l 871 927 l 752 614 l 719 614 l 594 930 l 594 614 l 548 614 l 548 969 l 625 969 l 736 690 "},"ή":{"x_min":91,"x_max":662,"ha":754,"o":"m 594 -365 q 557 -366 577 -365 q 526 -369 537 -368 q 531 -189 526 -310 q 537 -7 537 -68 l 537 406 q 503 536 537 485 q 391 587 469 587 q 255 508 290 587 q 220 315 220 430 q 222 133 220 259 q 224 1 224 8 l 158 6 l 91 1 l 101 156 l 101 495 q 97 584 101 527 q 93 655 93 640 q 119 650 105 652 q 155 648 134 648 q 185 650 175 648 q 221 655 195 651 l 220 538 q 321 637 265 602 q 452 672 378 672 q 604 603 552 672 q 656 430 656 535 l 656 329 l 656 -186 q 659 -293 656 -227 q 662 -370 662 -359 q 630 -366 645 -368 q 594 -365 614 -365 m 481 944 q 515 975 499 965 q 552 986 531 986 q 589 970 575 986 q 603 933 603 955 q 589 898 603 912 q 547 868 575 884 l 348 744 l 298 744 l 481 944 "},"Θ":{"x_min":51,"x_max":1068,"ha":1119,"o":"m 51 465 q 193 820 51 690 q 562 950 335 950 q 893 852 755 950 q 1047 653 1031 755 q 1065 525 1062 551 q 1068 462 1068 500 q 1065 402 1068 426 q 1047 280 1062 379 q 892 83 1033 182 q 560 -15 751 -15 q 435 -7 480 -15 q 299 32 390 0 q 130 187 209 65 q 51 465 51 308 m 202 468 q 290 163 202 283 q 559 43 379 43 q 826 163 738 43 q 915 468 915 283 q 826 770 915 652 q 559 889 738 889 q 254 720 306 889 q 202 468 202 552 m 560 507 q 683 510 608 507 q 768 514 758 514 l 765 465 l 765 429 q 648 432 730 429 q 558 435 566 435 q 440 432 523 435 q 351 429 357 429 l 353 470 l 353 514 q 474 510 400 514 q 560 507 549 507 "},"®":{"x_min":80,"x_max":1058,"ha":1139,"o":"m 816 905 q 992 726 927 841 q 1058 481 1058 611 q 912 138 1058 283 q 567 -6 766 -6 q 225 139 370 -6 q 80 481 80 284 q 224 826 80 681 q 569 971 368 971 q 816 905 698 971 m 569 918 q 263 788 392 918 q 134 481 134 659 q 261 175 134 306 q 566 45 389 45 q 872 174 741 45 q 1004 478 1004 304 q 947 699 1004 596 q 787 859 890 801 q 569 918 684 918 m 815 619 q 776 521 815 562 q 681 468 738 480 l 809 209 l 709 208 l 592 456 l 462 457 l 462 209 l 376 209 l 376 771 l 581 771 q 745 737 676 771 q 815 619 815 704 m 462 714 l 462 513 l 566 513 q 682 532 635 513 q 729 611 729 551 q 681 692 729 671 q 564 714 634 714 l 462 714 "},"É":{"x_min":109,"x_max":614.5625,"ha":685,"o":"m 124 465 q 116 710 124 540 q 109 932 109 880 l 353 929 l 610 929 q 607 904 607 918 q 607 884 607 891 l 610 838 q 407 860 506 860 l 259 860 l 257 670 l 257 530 l 397 530 q 586 542 492 530 q 584 518 584 530 q 584 499 584 506 q 586 450 584 465 q 487 458 542 454 q 393 463 432 463 l 257 463 l 257 318 l 262 74 q 452 77 381 74 q 614 94 524 80 l 613 47 l 614 0 l 356 0 l 109 0 q 116 243 109 72 q 124 465 124 415 m 426 1225 q 461 1255 445 1244 q 499 1267 478 1267 q 536 1251 522 1267 q 549 1212 549 1236 q 533 1176 549 1192 q 492 1147 517 1160 l 292 1024 l 242 1024 l 426 1225 "},"~":{"x_min":284,"x_max":1080,"ha":1368,"o":"m 850 650 q 667 750 761 650 q 511 850 573 850 q 396 793 431 850 q 362 650 362 737 l 284 650 q 339 846 284 768 q 508 924 395 924 q 697 824 606 924 q 853 725 788 725 q 969 779 936 725 q 1002 924 1002 834 l 1080 924 q 1023 727 1080 805 q 850 650 966 650 "},"Ε":{"x_min":108,"x_max":613.5625,"ha":686,"o":"m 126 465 q 122 711 126 620 q 108 932 119 802 l 353 928 l 610 931 l 606 884 l 610 836 q 508 853 562 847 q 408 860 453 860 l 260 860 l 258 671 l 258 528 l 398 528 q 587 541 480 528 l 584 497 l 587 451 l 394 463 l 258 463 l 258 316 l 264 73 q 456 76 380 73 q 613 94 531 80 l 610 47 l 613 0 l 358 4 l 108 0 q 117 239 108 70 q 126 465 126 408 "},"³":{"x_min":48,"x_max":424,"ha":496,"o":"m 159 636 l 156 663 q 178 661 167 661 q 200 661 189 661 q 280 690 248 661 q 312 767 312 719 q 212 869 312 869 q 143 846 168 869 q 107 781 117 823 l 102 779 q 84 812 93 795 q 66 845 75 830 q 134 886 98 871 q 212 901 171 901 q 341 873 284 901 q 398 778 398 845 q 355 691 398 724 q 252 643 313 658 q 373 610 322 643 q 424 509 424 577 q 353 385 424 427 q 196 343 283 343 q 48 373 117 343 q 57 422 52 391 q 66 469 63 454 l 75 469 q 120 399 88 425 q 199 374 153 374 q 294 409 254 374 q 334 499 334 444 q 299 588 334 553 q 207 623 264 623 q 179 620 193 623 q 156 617 166 618 l 159 636 "},"[":{"x_min":116,"x_max":364.609375,"ha":449,"o":"m 127 2 l 127 386 l 127 769 l 116 932 l 235 929 l 364 929 l 363 908 l 363 872 q 263 880 313 880 l 216 880 l 216 387 l 216 -105 l 264 -105 q 329 -102 308 -105 q 364 -98 351 -99 l 363 -123 l 363 -158 l 237 -154 l 116 -158 q 121 -81 116 -138 q 127 2 127 -24 "},"L":{"x_min":108,"x_max":627.453125,"ha":629,"o":"m 126 465 q 122 712 126 621 q 108 932 119 803 q 149 930 126 932 q 188 926 173 927 q 233 929 202 926 q 268 932 265 932 q 263 797 268 883 q 258 684 258 711 q 261 332 258 577 q 264 73 264 86 l 402 73 q 512 78 458 73 q 627 94 566 84 l 624 47 l 627 0 l 358 4 l 108 0 q 117 239 108 70 q 126 465 126 408 "},"σ":{"x_min":41,"x_max":802.109375,"ha":806,"o":"m 625 644 l 802 651 l 797 611 l 802 566 l 626 573 q 690 464 671 527 q 710 327 710 402 q 616 81 710 177 q 371 -15 522 -15 q 131 78 222 -15 q 41 322 41 172 q 131 572 41 472 q 371 672 221 672 q 439 665 403 672 q 508 653 475 659 q 569 645 541 646 q 625 644 597 644 m 376 619 q 226 530 272 619 q 181 326 181 442 q 224 124 181 213 q 369 35 268 35 q 522 123 474 35 q 570 326 570 211 q 524 529 570 440 q 376 619 479 619 "},"ζ":{"x_min":75,"x_max":675,"ha":683,"o":"m 642 987 l 642 949 q 425 760 524 860 q 260 545 326 661 q 194 303 194 428 q 194 278 194 289 q 202 215 194 267 q 335 141 210 163 q 558 116 447 128 q 675 -7 675 91 q 643 -109 675 -65 q 544 -232 612 -154 l 500 -205 q 565 -113 555 -131 q 576 -66 576 -94 q 552 -20 576 -37 q 292 22 509 2 q 75 240 75 41 q 143 487 75 357 q 297 719 212 616 q 508 949 383 821 l 359 949 q 252 945 301 949 q 130 933 204 941 l 134 977 l 130 1025 q 272 1021 186 1025 q 372 1018 358 1018 q 526 1021 429 1018 q 643 1025 623 1025 l 642 987 "},"θ":{"x_min":48,"x_max":699,"ha":749,"o":"m 375 909 q 621 773 544 909 q 699 456 699 638 q 627 118 699 255 q 372 -19 556 -19 q 120 114 193 -19 q 48 444 48 247 q 122 773 48 638 q 375 909 196 909 m 184 383 q 221 136 184 242 q 374 31 259 31 q 534 137 505 31 q 564 424 564 244 l 408 428 l 184 423 l 184 383 m 371 858 q 257 804 300 858 q 196 673 214 751 q 186 581 189 630 q 184 483 184 532 l 322 478 q 461 480 364 478 q 564 483 558 483 q 528 747 564 637 q 371 858 493 858 "},"Ο":{"x_min":51,"x_max":1068,"ha":1119,"o":"m 51 465 q 192 820 51 690 q 559 950 333 950 q 892 853 754 950 q 1047 654 1031 757 q 1065 525 1062 551 q 1068 462 1068 500 q 1065 402 1068 426 q 1047 277 1062 379 q 894 80 1031 175 q 560 -15 756 -15 q 447 -10 496 -15 q 304 29 398 -5 q 130 186 210 64 q 51 465 51 308 m 202 468 q 290 162 202 282 q 559 42 379 42 q 826 162 738 42 q 915 468 915 283 q 825 770 915 651 q 559 889 735 889 q 348 826 429 889 q 225 639 267 764 q 202 468 202 552 "},"Γ":{"x_min":108,"x_max":627.453125,"ha":629,"o":"m 448 932 l 627 932 q 623 902 624 921 q 621 874 621 883 l 627 836 q 402 863 512 863 l 264 863 q 261 586 264 779 q 258 379 258 393 q 263 181 258 313 q 268 0 268 48 l 187 5 l 108 0 q 121 209 117 106 q 126 427 126 311 q 117 686 126 504 q 108 932 108 869 l 448 932 "}," ":{"x_min":0,"x_max":0,"ha":375},"%":{"x_min":28,"x_max":1011,"ha":1032,"o":"m 799 0 q 647 62 708 0 q 586 218 586 124 q 647 372 586 309 q 799 436 709 436 q 949 373 888 436 q 1011 223 1011 311 q 995 130 1011 176 q 918 35 972 70 q 799 0 865 0 m 863 1015 l 227 -125 l 158 -125 l 793 1015 l 863 1015 m 241 451 q 89 513 150 451 q 28 668 28 576 q 89 823 28 759 q 241 888 150 888 q 391 825 330 888 q 453 673 453 762 q 434 581 453 623 q 359 486 412 521 q 241 451 307 451 m 897 260 q 872 353 897 310 q 798 397 847 397 q 718 340 737 397 q 700 202 700 283 q 719 86 700 133 q 798 40 738 40 q 866 73 840 40 q 892 149 892 106 q 895 206 894 169 q 897 260 897 242 m 339 689 q 312 812 339 775 q 240 849 285 849 q 160 788 179 849 q 141 648 141 728 q 164 541 141 590 q 240 493 188 493 q 307 527 281 493 q 334 602 334 561 q 339 689 339 641 "},"P":{"x_min":109,"x_max":722,"ha":736,"o":"m 127 559 q 109 931 127 759 l 231 927 q 337 931 270 927 q 416 935 403 935 q 632 874 543 935 q 722 694 722 814 q 616 493 722 564 q 371 422 510 422 l 252 422 q 257 200 252 348 q 262 0 262 52 q 224 3 249 0 q 185 8 199 8 q 147 5 168 8 q 109 0 127 2 q 118 287 109 85 q 127 559 127 488 m 576 684 q 515 826 576 773 q 364 879 455 879 l 262 875 q 254 781 257 827 q 252 688 252 735 l 252 476 q 507 530 439 476 q 576 684 576 584 "},"Ώ":{"x_min":-1,"x_max":1355.953125,"ha":1365,"o":"m 685 0 q 555 4 646 0 q 460 8 464 8 l 247 0 l 250 47 q 248 74 250 59 q 244 95 246 88 q 355 88 305 90 q 486 86 405 86 q 340 261 389 170 q 292 473 292 352 q 437 822 292 694 q 804 950 582 950 q 1168 823 1028 950 q 1309 473 1309 697 q 1262 261 1309 350 q 1115 86 1215 173 q 1229 91 1139 86 q 1355 96 1319 96 l 1351 33 l 1354 0 l 1143 8 q 1014 4 1104 8 q 918 0 924 0 l 918 72 q 1100 215 1043 122 q 1158 451 1158 309 q 1071 764 1158 639 q 802 889 984 889 q 533 767 621 889 q 446 454 446 645 q 505 217 446 319 q 685 72 564 115 l 685 0 m 182 943 q 215 974 200 964 q 251 985 230 985 q 289 969 274 985 q 304 932 304 954 q 290 896 304 911 q 247 866 275 882 l 48 743 l -1 743 l 182 943 "},"Έ":{"x_min":-1.390625,"x_max":920.015625,"ha":992,"o":"m 432 465 q 428 711 432 620 q 414 932 425 802 l 660 928 l 917 932 l 912 884 l 917 836 q 814 853 868 847 q 714 860 760 860 l 567 860 l 564 671 l 564 528 l 704 528 q 893 541 786 528 l 890 497 l 893 451 l 700 462 l 564 462 l 564 317 l 570 74 q 762 77 686 74 q 920 94 838 80 l 917 47 l 920 0 l 664 4 l 414 0 q 423 239 414 70 q 432 465 432 408 m 181 943 q 215 974 200 964 q 251 985 230 985 q 288 969 273 985 q 304 932 304 954 q 289 896 304 911 q 247 866 275 882 l 47 743 l -1 743 l 181 943 "},"_":{"x_min":0,"x_max":683.328125,"ha":683,"o":"m 683 -322 l 0 -322 l 0 -256 l 683 -256 l 683 -322 "},"Ϊ":{"x_min":-3,"x_max":388,"ha":386,"o":"m 126 465 q 118 710 126 540 q 111 932 111 880 q 156 929 123 932 q 192 926 190 926 q 238 929 205 926 q 276 932 271 932 q 265 697 276 863 q 255 465 255 530 q 265 230 255 397 q 276 0 276 63 q 233 3 260 0 q 192 8 205 8 q 153 5 176 8 q 111 0 131 2 q 118 243 111 72 q 126 465 126 415 m 73 1208 q 124 1186 102 1208 q 146 1133 146 1164 q 123 1081 146 1105 q 73 1058 101 1058 q 19 1080 42 1058 q -3 1133 -3 1103 q 19 1185 -3 1163 q 73 1208 41 1208 m 313 1208 q 366 1186 344 1208 q 388 1133 388 1164 q 365 1080 388 1103 q 313 1058 342 1058 q 260 1080 283 1058 q 238 1133 238 1103 q 260 1185 238 1163 q 313 1208 282 1208 "},"+":{"x_min":169,"x_max":970,"ha":1139,"o":"m 603 441 l 970 441 l 970 374 l 603 374 l 603 0 l 536 0 l 536 374 l 169 374 l 169 441 l 536 441 l 536 816 l 603 816 l 603 441 "},"½":{"x_min":83,"x_max":1094.125,"ha":1172,"o":"m 250 743 l 245 836 q 181 804 205 818 q 120 768 156 791 q 104 788 117 775 q 83 808 91 801 q 200 851 141 825 q 327 913 259 877 l 336 911 q 331 724 336 850 q 326 551 326 598 l 326 391 q 301 394 319 391 q 280 397 283 397 q 254 394 271 397 q 233 391 238 391 q 246 551 242 473 q 250 743 250 629 m 859 1015 l 929 1015 l 312 -124 l 243 -124 l 859 1015 m 982 363 q 959 443 982 413 q 887 478 936 473 q 821 458 852 478 q 784 407 790 439 l 778 377 l 773 376 q 728 448 753 416 q 899 513 801 513 q 1019 476 967 513 q 1072 374 1072 439 q 955 189 1072 285 q 806 67 838 93 l 978 67 q 1094 79 1039 67 q 1090 63 1092 76 q 1088 41 1088 49 q 1094 3 1088 18 q 981 3 1056 3 q 867 3 906 3 q 791 3 842 3 q 714 3 739 3 l 714 25 q 913 198 844 125 q 982 363 982 270 "},"Ρ":{"x_min":109,"x_max":722,"ha":736,"o":"m 127 559 q 109 931 127 759 l 231 927 q 337 931 270 927 q 416 935 403 935 q 632 874 543 935 q 722 694 722 814 q 616 493 722 564 q 371 422 510 422 l 252 422 q 257 200 252 348 q 262 0 262 52 q 224 3 249 0 q 185 8 199 8 q 147 5 168 8 q 109 0 127 2 q 118 287 109 85 q 127 559 127 488 m 576 684 q 515 826 576 773 q 364 879 455 879 l 262 875 q 254 781 257 827 q 252 688 252 735 l 252 476 q 507 530 439 476 q 576 684 576 584 "},"'":{"x_min":88.890625,"x_max":306.9375,"ha":374,"o":"m 169 858 q 196 923 177 896 q 250 951 215 951 q 289 937 272 951 q 306 903 306 923 q 295 858 306 883 q 269 812 284 833 l 122 568 l 88 576 l 169 858 "},"T":{"x_min":11,"x_max":713,"ha":725,"o":"m 11 839 l 15 884 l 11 932 q 194 927 72 932 q 361 922 316 922 q 544 927 421 922 q 713 932 668 932 q 707 883 707 911 q 707 861 707 870 q 713 834 707 852 q 609 850 666 843 q 504 857 552 857 l 428 857 q 426 767 428 830 q 424 701 424 704 l 428 220 q 442 0 428 122 q 362 8 401 3 q 323 5 344 8 q 282 0 301 2 q 289 132 282 40 q 296 259 296 225 l 296 683 l 296 857 q 11 839 164 857 "},"Φ":{"x_min":50,"x_max":1068,"ha":1119,"o":"m 637 -25 q 559 -15 591 -15 q 527 -17 544 -15 q 483 -25 509 -19 l 487 68 q 181 179 313 68 q 50 465 50 291 q 172 744 50 647 q 487 865 295 842 l 483 958 q 522 952 502 955 q 559 950 543 950 q 596 952 576 950 q 637 958 616 955 l 631 865 q 942 758 816 865 q 1068 465 1068 651 q 944 184 1068 286 q 631 68 820 83 l 637 -25 m 501 502 q 497 677 501 570 q 494 800 494 784 q 278 698 354 786 q 203 466 203 611 q 282 231 203 331 q 494 132 361 132 q 497 363 494 225 q 501 502 501 501 m 915 466 q 839 706 915 612 q 626 800 764 800 q 622 636 626 738 q 618 470 618 533 q 622 301 618 408 q 626 132 626 194 q 839 226 764 132 q 915 466 915 320 "},"j":{"x_min":-55,"x_max":248,"ha":342,"o":"m 113 391 q 106 543 113 444 q 100 654 100 641 q 144 648 135 648 q 167 648 153 648 q 202 649 189 648 q 241 654 214 650 q 237 507 241 595 q 234 405 234 419 l 234 -13 l 234 -109 q 154 -303 234 -234 q -55 -372 74 -372 l -55 -333 q 78 -267 44 -323 q 113 -103 113 -212 l 113 -26 l 113 391 m 171 963 q 226 940 205 963 q 248 881 248 917 q 226 831 248 849 q 171 813 204 813 q 116 833 139 813 q 94 885 94 853 q 115 941 94 919 q 171 963 136 963 "},"Σ":{"x_min":44.4375,"x_max":790.28125,"ha":825,"o":"m 729 883 l 733 835 q 272 855 519 855 q 544 500 391 691 q 372 312 446 399 q 219 119 297 224 l 455 119 q 638 124 522 119 q 790 129 755 129 l 784 86 l 783 68 l 784 42 q 785 25 784 33 q 790 0 786 17 q 558 4 694 0 q 416 8 422 8 q 230 4 350 8 q 44 0 111 0 l 44 50 q 169 182 105 109 q 307 344 232 255 l 406 468 q 242 689 314 594 q 76 899 170 785 l 76 932 q 231 929 123 932 q 345 926 340 926 q 568 929 412 926 q 733 932 723 932 l 729 883 "},"1":{"x_min":72,"x_max":472,"ha":749,"o":"m 334 626 q 331 722 334 655 q 329 793 329 788 q 228 737 278 765 q 133 673 177 709 q 102 713 124 688 q 72 743 80 737 q 274 827 177 780 q 458 935 372 875 l 472 929 q 463 552 472 804 q 455 259 455 300 l 459 0 q 421 5 441 2 q 384 8 401 8 q 349 5 367 8 q 312 0 330 2 q 329 289 324 133 q 334 626 334 445 "},"ä":{"x_min":43,"x_max":655.5,"ha":649,"o":"m 234 -15 q 98 33 153 -15 q 43 162 43 82 q 106 303 43 273 q 303 364 169 333 q 444 448 437 395 q 403 568 444 521 q 288 616 362 616 q 191 587 233 616 q 124 507 149 559 l 95 520 l 104 591 q 202 651 144 631 q 323 672 261 672 q 500 622 444 672 q 557 455 557 573 l 557 133 q 567 69 557 84 q 618 54 577 54 q 655 58 643 54 l 655 26 q 594 5 626 14 q 537 -6 562 -3 q 438 85 453 -6 q 342 10 388 35 q 234 -15 296 -15 m 203 929 q 254 906 232 929 q 277 854 277 884 q 256 799 277 820 q 204 778 236 778 q 149 800 173 778 q 126 854 126 822 q 148 906 126 884 q 203 929 170 929 m 444 929 q 498 906 476 929 q 521 854 521 884 q 500 800 521 822 q 447 778 479 778 q 392 800 415 778 q 370 854 370 823 q 392 906 370 884 q 444 929 414 929 m 176 186 q 204 98 176 133 q 284 64 232 64 q 390 107 342 64 q 438 212 438 151 l 438 345 q 239 293 303 319 q 176 186 176 268 "},"<":{"x_min":176,"x_max":961.109375,"ha":1139,"o":"m 279 406 l 960 130 l 961 56 l 176 379 l 176 432 l 960 756 l 960 682 l 279 406 "},"£":{"x_min":65,"x_max":728.890625,"ha":749,"o":"m 67 47 l 65 98 l 116 101 q 203 168 176 112 q 231 292 231 224 q 227 375 231 330 q 221 444 223 420 q 139 441 171 444 q 76 432 107 439 l 78 479 l 76 503 q 105 495 92 498 q 134 493 117 493 l 219 493 q 212 550 214 522 q 209 609 209 578 q 304 825 209 742 q 537 909 399 909 q 633 896 592 909 q 723 864 673 884 q 666 731 694 809 l 656 731 q 605 825 641 791 q 512 859 570 859 q 383 796 427 859 q 340 646 340 734 l 345 493 l 366 493 q 523 502 450 493 l 521 466 l 526 434 q 438 441 493 439 q 345 444 383 444 l 345 378 q 310 238 345 302 q 213 107 275 173 q 527 113 421 107 q 728 134 633 119 l 721 66 q 728 0 721 34 q 542 3 666 0 q 358 8 419 8 q 176 3 285 8 q 65 0 67 0 l 67 47 "},"¹":{"x_min":82,"x_max":347,"ha":496,"o":"m 255 731 l 255 833 l 123 759 q 104 780 120 763 q 82 801 87 797 q 208 850 148 822 q 337 917 269 878 l 347 912 q 341 721 347 848 q 336 529 336 593 l 336 356 q 311 358 327 356 q 289 361 295 361 q 264 358 280 361 q 242 356 248 356 q 251 498 247 407 q 255 731 255 590 "},"t":{"x_min":18,"x_max":415.21875,"ha":425,"o":"m 18 586 l 22 630 l 18 654 q 133 643 80 643 q 131 732 133 669 q 129 799 129 796 q 199 827 163 811 q 263 863 234 843 q 252 758 255 811 q 250 643 250 705 q 334 645 310 643 q 401 654 358 647 l 398 618 l 401 586 q 248 594 323 594 l 243 258 l 243 162 q 272 76 243 109 q 353 43 301 43 q 387 44 369 43 q 415 48 405 46 l 415 4 q 349 -10 378 -5 q 290 -15 319 -15 q 174 18 221 -15 q 123 118 128 51 l 123 200 l 129 387 l 133 594 q 84 592 113 594 q 18 586 55 590 "},"λ":{"x_min":2.78125,"x_max":652.78125,"ha":657,"o":"m 302 670 q 227 871 262 803 q 111 940 193 940 q 78 937 94 940 q 20 924 62 934 l 20 978 q 96 1012 59 1000 q 170 1025 133 1025 q 329 947 287 1025 q 427 692 372 869 q 538 340 481 515 q 652 1 594 166 l 579 5 l 504 0 q 336 573 423 305 q 218 301 272 438 q 111 0 163 163 l 61 6 q 27 3 48 6 q 2 0 5 0 q 302 670 165 329 "},"ù":{"x_min":90,"x_max":664,"ha":754,"o":"m 653 498 q 653 329 653 443 q 653 158 653 215 q 664 0 653 81 q 631 3 647 1 q 598 5 616 5 q 563 3 583 5 q 533 0 544 1 l 538 118 q 440 18 494 52 q 312 -15 385 -15 q 148 50 201 -15 q 96 229 96 115 l 96 354 l 96 516 l 90 655 q 120 650 103 651 q 158 648 136 648 q 192 650 175 648 q 227 655 210 651 q 220 445 227 591 q 213 247 213 299 q 247 115 213 163 q 362 68 281 68 q 477 113 428 68 q 531 217 525 159 q 538 340 538 274 q 533 520 538 394 q 528 655 528 647 q 561 650 548 651 q 596 648 574 648 q 663 655 628 648 q 653 498 653 573 m 445 743 l 244 866 q 205 896 223 877 q 187 934 187 915 q 202 970 187 955 q 238 986 217 986 q 277 973 256 986 q 309 945 298 961 l 496 743 l 445 743 "},"W":{"x_min":0,"x_max":1306.953125,"ha":1307,"o":"m 0 932 q 47 927 31 929 q 76 926 62 926 q 121 929 88 926 q 155 931 154 931 q 262 547 200 750 l 380 171 q 470 437 415 272 q 552 693 525 602 q 619 931 580 784 l 672 926 q 700 928 684 926 q 726 931 716 930 q 825 604 787 727 q 883 419 862 482 q 969 171 904 357 l 1087 522 q 1143 720 1120 623 q 1187 931 1166 816 q 1221 929 1197 931 q 1247 926 1245 926 q 1280 928 1262 926 q 1306 931 1298 930 q 1131 467 1218 716 q 990 0 1045 217 q 963 4 980 1 q 937 7 947 7 q 904 3 925 7 q 880 0 883 0 q 761 385 831 184 l 641 733 l 491 287 q 402 0 438 133 q 370 3 391 0 q 344 7 350 7 q 315 4 327 7 q 287 0 302 2 q 206 296 252 142 q 122 568 161 450 q 0 932 83 686 "},"ï":{"x_min":-25,"x_max":365.328125,"ha":340,"o":"m 104 144 l 104 522 l 97 655 q 138 650 113 651 q 167 648 162 648 q 233 655 206 648 q 225 506 225 581 q 229 254 225 423 q 233 0 233 84 q 201 3 216 1 q 164 5 186 5 q 128 3 143 5 q 97 0 113 1 l 104 144 m 50 929 q 102 906 80 929 q 125 854 125 884 q 104 799 125 820 q 52 778 84 778 q -2 800 19 778 q -25 854 -25 822 q -4 906 -25 884 q 50 929 16 929 m 290 929 q 343 906 320 929 q 365 854 365 884 q 345 799 365 820 q 294 778 324 778 q 238 800 260 778 q 216 854 216 822 q 237 906 216 884 q 290 929 258 929 "},">":{"x_min":176.390625,"x_max":963,"ha":1139,"o":"m 963 379 l 176 56 l 176 130 l 858 406 l 176 682 l 176 756 l 962 432 l 963 379 "},"v":{"x_min":0,"x_max":658.328125,"ha":654,"o":"m 0 655 q 54 648 38 648 q 86 647 69 647 q 113 647 100 647 q 168 654 127 648 q 252 402 204 529 l 358 134 l 470 436 q 543 654 508 533 q 570 650 554 651 q 600 648 586 648 q 636 648 618 648 q 658 654 652 652 q 506 340 577 502 q 372 0 436 177 q 347 5 362 2 q 319 8 333 8 q 296 5 309 8 q 272 0 283 2 q 200 206 234 120 q 0 655 165 292 "},"τ":{"x_min":30,"x_max":677,"ha":701,"o":"m 423 573 l 419 303 q 423 146 419 250 q 428 0 428 42 q 394 4 410 2 q 359 5 378 5 q 333 4 343 5 q 289 0 323 4 l 298 194 l 294 573 q 156 553 207 573 q 57 472 105 534 q 30 559 49 522 q 149 626 82 609 q 307 644 216 644 l 510 644 q 604 647 545 644 q 677 651 664 651 l 671 610 q 677 566 671 586 q 527 569 618 566 q 423 573 436 573 "},"û":{"x_min":90,"x_max":664,"ha":754,"o":"m 653 498 q 653 328 653 442 q 653 158 653 215 q 664 0 653 81 q 631 3 647 1 q 598 5 616 5 q 563 3 583 5 q 533 0 544 1 l 538 118 q 440 18 494 52 q 312 -15 385 -15 q 148 50 201 -15 q 96 229 96 115 l 96 354 l 96 516 l 90 655 q 120 650 103 651 q 158 648 136 648 q 192 649 175 648 q 227 655 210 651 q 220 445 227 591 q 213 247 213 299 q 247 115 213 163 q 362 68 281 68 q 477 113 428 68 q 531 217 525 159 q 538 340 538 274 q 533 520 538 394 q 528 655 528 647 q 558 650 542 651 q 596 648 574 648 q 629 649 612 648 q 663 655 646 651 q 653 498 653 573 m 332 978 l 421 978 l 572 743 l 525 743 l 376 875 l 227 743 l 180 743 l 332 978 "},"ξ":{"x_min":64,"x_max":654,"ha":656,"o":"m 562 861 q 502 941 539 911 q 414 972 465 972 q 299 917 342 972 q 256 788 256 862 q 312 650 256 701 q 458 599 369 599 l 526 599 l 524 563 l 524 528 q 480 533 503 532 q 427 535 457 535 q 271 494 337 535 q 197 408 205 454 q 187 347 188 361 q 186 326 186 333 q 186 294 186 300 q 190 282 187 287 q 238 200 201 229 q 335 153 276 171 l 494 118 q 610 73 567 100 q 654 -13 654 46 q 628 -103 654 -60 q 511 -238 602 -146 l 466 -210 q 541 -121 530 -139 q 553 -75 553 -103 q 393 16 553 -18 q 149 92 234 50 q 64 276 64 133 q 130 462 64 379 q 299 575 197 544 q 175 652 222 600 q 128 780 128 704 q 213 954 128 883 q 405 1025 298 1025 q 507 1009 458 1025 q 609 965 555 994 q 585 914 600 945 q 562 861 571 883 "},"&":{"x_min":76,"x_max":917.671875,"ha":975,"o":"m 360 -18 q 160 41 245 -18 q 76 211 76 101 q 137 382 76 315 q 314 515 199 448 q 249 618 273 569 q 225 722 225 668 q 287 872 225 812 q 441 932 349 932 q 581 891 520 932 q 643 777 643 851 q 588 640 643 701 q 453 532 533 579 q 568 390 509 459 q 690 253 627 321 q 815 530 792 379 l 829 530 l 887 466 q 814 327 856 396 q 727 209 772 259 q 807 115 760 169 q 917 0 853 61 q 855 1 896 0 q 791 2 813 2 l 739 0 l 649 110 q 515 15 586 48 q 360 -18 445 -18 m 341 475 q 234 380 267 419 q 201 273 201 340 q 258 125 201 190 q 401 61 316 61 q 508 86 458 61 q 606 154 559 111 l 341 475 m 547 770 q 524 854 547 823 q 454 886 502 886 q 363 851 402 886 q 325 769 325 817 q 344 685 325 718 q 422 575 363 652 q 514 661 481 615 q 547 770 547 708 "},"Λ":{"x_min":0,"x_max":852.78125,"ha":853,"o":"m 662 452 l 778 172 l 852 0 l 769 5 q 734 4 747 5 q 679 0 722 4 q 647 102 661 55 q 605 226 633 148 l 547 383 l 401 777 l 266 429 q 191 213 226 319 q 125 0 157 108 l 62 2 l 0 0 q 205 459 95 191 q 380 932 315 726 q 404 927 393 929 q 431 926 416 926 q 459 929 441 926 q 487 932 477 932 q 548 743 511 850 q 662 452 586 637 "},"I":{"x_min":109,"x_max":271,"ha":385,"o":"m 127 465 q 123 711 127 620 q 109 932 120 803 q 154 927 129 929 q 190 925 179 925 q 238 928 209 925 q 271 931 266 931 q 263 788 271 887 q 256 659 256 690 l 256 448 l 256 283 q 263 135 256 238 q 271 0 271 31 q 231 3 258 0 q 190 8 204 8 q 151 5 172 8 q 109 0 129 2 q 118 239 109 70 q 127 465 127 408 "},"G":{"x_min":51,"x_max":942,"ha":1001,"o":"m 581 -15 q 198 107 345 -15 q 51 459 51 229 q 196 815 51 680 q 566 950 342 950 q 755 929 659 950 q 930 869 852 909 q 906 802 916 836 q 895 737 897 769 l 874 737 q 739 855 808 818 q 571 893 670 893 q 305 770 406 893 q 204 479 204 647 q 298 168 204 291 q 577 46 393 46 q 689 56 640 46 q 790 94 738 66 q 794 184 790 123 q 798 251 798 246 q 794 337 798 280 q 790 423 790 394 q 830 417 821 418 q 863 416 838 416 q 901 419 880 416 q 941 425 923 422 l 936 236 q 939 121 936 201 q 942 37 942 41 q 757 -1 843 11 q 581 -15 672 -15 "},"ΰ":{"x_min":79,"x_max":703,"ha":774,"o":"m 703 395 q 595 110 703 236 q 332 -15 488 -15 q 145 54 211 -15 q 79 244 79 123 l 83 430 q 81 542 83 486 q 79 654 80 598 l 146 650 l 217 654 q 209 502 217 608 q 202 365 202 397 l 202 261 q 240 105 202 168 q 369 43 279 43 q 523 132 476 43 q 571 340 571 222 q 548 493 571 418 q 488 645 526 568 q 550 647 529 645 q 627 658 571 650 q 703 395 703 537 m 209 865 q 250 846 232 865 q 269 804 269 828 q 251 761 269 780 q 209 743 234 743 q 166 761 184 743 q 148 804 148 779 q 166 846 148 828 q 209 865 184 865 m 361 929 q 378 969 368 956 q 414 982 388 982 q 458 941 458 982 q 446 904 458 919 l 338 743 l 306 743 l 361 929 m 513 865 q 555 846 537 865 q 573 804 573 828 q 555 761 573 779 q 513 743 537 743 q 470 761 487 743 q 454 804 454 779 q 470 846 454 828 q 513 865 487 865 "},"`":{"x_min":86.5,"x_max":303.171875,"ha":374,"o":"m 222 659 q 194 595 214 622 q 140 568 175 568 q 86 613 86 568 q 96 660 86 636 q 122 706 107 684 l 271 950 l 303 940 l 222 659 "},"Υ":{"x_min":-28,"x_max":746,"ha":707,"o":"m 297 177 l 297 386 q 191 570 256 458 q 84 750 125 682 q -28 932 42 819 q 24 928 -9 932 q 63 925 59 925 q 112 927 91 925 q 146 932 134 930 q 207 800 174 866 q 275 676 239 735 l 389 475 q 509 688 451 575 q 627 932 567 801 l 683 926 q 715 927 701 926 q 746 932 729 929 q 555 627 640 769 l 432 415 l 432 240 q 435 101 432 198 q 438 0 438 5 q 401 4 426 1 q 361 6 376 6 q 319 4 334 6 q 284 0 304 2 q 292 88 288 36 q 297 177 297 140 "},"r":{"x_min":89,"x_max":465.390625,"ha":488,"o":"m 99 120 l 99 400 l 99 433 q 91 654 99 548 q 125 648 114 650 q 162 647 136 647 q 232 654 195 647 q 223 588 226 626 q 220 516 220 550 q 313 628 264 589 q 437 668 362 668 l 465 668 l 459 604 l 465 537 q 427 544 448 541 q 383 551 407 548 q 256 482 292 551 q 220 312 220 413 q 222 131 220 256 q 225 0 225 6 l 157 6 l 89 0 l 99 120 "},"x":{"x_min":1,"x_max":635,"ha":632,"o":"m 264 316 l 158 461 q 78 563 120 508 q 5 655 36 619 q 97 647 51 647 q 141 649 120 647 q 177 654 162 651 q 249 538 214 592 q 334 415 284 484 q 420 533 377 473 q 501 654 464 592 q 523 650 508 652 q 550 647 539 648 q 616 654 582 647 l 371 365 q 477 210 434 267 q 635 0 519 152 q 587 3 616 0 q 551 6 558 6 q 501 4 523 6 q 465 0 479 1 q 380 140 407 98 q 295 264 352 183 q 172 84 194 117 q 123 0 151 51 l 66 5 q 33 2 55 5 q 1 0 10 0 q 131 154 63 72 q 264 316 199 236 "},"è":{"x_min":40,"x_max":646.9375,"ha":681,"o":"m 407 42 q 602 130 523 42 l 621 130 q 613 93 617 112 q 609 47 609 73 q 496 0 558 14 q 369 -15 435 -15 q 130 73 220 -15 q 40 311 40 162 q 126 562 40 456 q 355 669 212 669 q 564 590 481 669 q 646 386 646 512 l 644 331 q 438 333 562 331 q 313 335 315 335 l 179 331 q 235 127 179 212 q 407 42 291 42 m 407 743 l 208 866 q 166 895 183 880 q 149 934 149 911 q 167 967 149 949 q 202 986 185 986 q 243 969 220 986 q 273 945 266 952 l 457 743 l 407 743 m 513 392 l 513 437 q 470 563 513 509 q 356 618 427 618 q 233 552 271 618 q 183 390 195 487 l 513 392 "},"μ":{"x_min":84,"x_max":669.109375,"ha":754,"o":"m 331 -15 q 265 -7 292 -15 q 210 19 238 0 l 208 -128 q 211 -266 208 -178 q 214 -373 214 -354 q 183 -369 198 -370 q 150 -368 168 -368 q 114 -370 133 -368 q 84 -373 95 -372 q 89 -165 84 -304 q 94 43 94 -26 q 89 363 94 149 q 84 655 84 578 q 150 647 118 647 q 219 654 180 647 q 213 495 219 601 q 208 334 208 390 q 232 155 208 227 q 339 75 256 83 q 471 112 419 75 q 531 212 523 150 q 539 332 539 273 q 536 518 539 388 q 533 655 533 648 q 600 647 568 647 q 669 654 629 647 q 660 477 662 566 q 658 257 658 389 q 660 113 658 171 q 669 -1 662 55 l 602 4 l 537 -1 l 539 106 q 449 17 502 50 q 331 -15 397 -15 "},"÷":{"x_min":169,"x_max":969,"ha":1139,"o":"m 641 643 q 618 593 641 615 q 566 571 596 571 q 518 592 538 571 q 498 643 498 613 q 518 692 498 670 q 567 715 539 715 q 610 703 579 715 q 641 643 641 691 m 969 374 l 169 374 l 169 441 l 969 441 l 969 374 m 641 170 q 619 120 641 141 q 570 100 598 100 q 519 120 540 100 q 498 170 498 141 q 518 221 498 199 q 568 243 538 243 q 604 235 584 243 q 632 214 624 227 q 641 170 641 201 "},"h":{"x_min":92,"x_max":665,"ha":758,"o":"m 102 136 l 102 859 q 100 934 102 894 q 94 1025 98 975 q 136 1018 126 1019 q 158 1018 146 1018 q 226 1025 188 1018 q 222 957 223 1001 q 221 888 221 913 l 221 868 l 221 543 q 322 637 264 602 q 450 672 380 672 q 608 606 558 672 q 659 429 659 541 l 659 298 l 659 136 l 665 0 q 633 3 648 1 q 597 5 617 5 q 560 3 580 5 q 529 0 540 1 q 534 202 529 68 q 540 405 540 337 q 503 533 540 481 q 394 586 467 586 q 256 508 291 586 q 221 313 221 430 q 224 133 221 244 q 227 0 227 22 q 188 3 211 0 q 161 6 164 6 q 123 4 137 6 q 92 0 108 2 l 102 136 "},".":{"x_min":100,"x_max":274,"ha":374,"o":"m 187 156 q 248 130 223 156 q 274 68 274 105 q 248 8 274 32 q 187 -15 223 -15 q 125 8 150 -15 q 100 68 100 32 q 125 130 100 105 q 187 156 150 156 "},"φ":{"x_min":39,"x_max":965,"ha":1006,"o":"m 578 -371 q 505 -362 539 -362 q 465 -365 483 -362 q 427 -372 446 -368 q 433 -163 427 -298 q 440 -11 440 -29 q 156 76 274 -11 q 39 327 39 163 q 145 571 39 486 q 410 656 252 656 q 412 635 411 645 q 413 615 413 625 q 235 516 292 580 q 179 327 179 451 q 247 118 179 197 q 442 39 316 39 l 444 197 l 444 311 q 444 400 444 340 q 444 491 444 461 q 514 619 452 570 q 657 668 577 668 q 879 568 794 668 q 965 332 965 469 q 850 84 965 169 q 563 -14 735 0 q 570 -203 563 -71 q 578 -371 578 -334 m 826 347 q 794 534 826 451 q 677 617 763 617 q 592 572 621 617 q 563 470 563 527 l 559 350 l 563 39 q 759 126 693 39 q 826 347 826 213 "},";":{"x_min":72.609375,"x_max":312,"ha":446,"o":"m 224 636 q 287 611 262 636 q 312 548 312 586 q 287 486 312 511 q 224 461 262 461 q 162 486 188 461 q 137 548 137 512 q 162 611 137 586 q 224 636 187 636 m 164 75 q 198 157 182 140 q 244 175 214 175 q 304 119 304 175 q 296 75 304 93 q 262 18 287 56 l 103 -243 l 72 -231 l 164 75 "},"f":{"x_min":12,"x_max":432.546875,"ha":397,"o":"m 127 324 l 127 597 q 66 595 92 597 q 12 588 39 594 l 14 626 l 12 654 q 79 648 38 649 q 127 647 121 647 q 192 901 127 777 q 378 1025 257 1025 q 409 1022 400 1025 q 432 1015 418 1019 l 415 896 q 371 911 395 905 q 325 918 347 918 q 252 886 278 918 q 227 805 227 855 q 235 713 227 760 q 246 647 243 665 q 330 650 276 647 q 396 654 384 654 q 391 642 393 647 q 389 633 389 637 l 388 622 l 389 610 q 396 589 389 609 q 323 595 357 594 q 246 597 289 597 l 246 366 q 250 183 246 305 q 254 0 254 60 q 213 3 238 0 q 183 6 187 6 q 144 4 161 6 q 116 0 127 1 q 121 160 116 52 q 127 324 127 269 "},"“":{"x_min":83.71875,"x_max":550.390625,"ha":625,"o":"m 471 659 q 441 593 458 618 q 389 568 424 568 q 350 579 365 568 q 335 613 335 591 q 346 660 335 633 q 371 706 358 687 l 519 950 l 550 940 l 471 659 m 221 659 q 192 593 211 618 q 137 568 174 568 q 83 613 83 568 q 93 658 83 637 q 119 706 103 680 l 268 950 l 300 940 l 221 659 "},"A":{"x_min":-15.28125,"x_max":838.890625,"ha":825,"o":"m 257 639 l 387 950 q 402 945 395 947 q 417 944 409 944 q 452 950 437 944 q 576 629 536 733 q 686 359 617 526 q 838 0 755 192 q 789 3 820 0 q 751 6 758 6 q 700 4 723 6 q 663 0 677 1 q 600 199 622 137 q 543 353 579 260 l 377 358 l 215 353 l 162 205 q 130 110 145 160 q 101 0 115 59 l 44 5 q 6 2 20 5 q -15 0 -8 0 q 76 211 30 105 q 158 404 121 318 q 257 639 195 490 m 378 419 l 513 425 l 379 761 l 246 425 l 378 419 "},"6":{"x_min":64,"x_max":692,"ha":749,"o":"m 464 859 q 267 730 324 859 q 210 442 210 602 q 315 514 262 488 q 431 540 367 540 q 618 462 545 540 q 692 270 692 385 q 604 65 692 145 q 390 -15 516 -15 q 142 93 221 -15 q 64 377 64 201 q 167 745 64 581 q 462 909 270 909 q 524 905 501 909 q 579 890 547 902 l 574 827 q 521 851 547 844 q 464 859 495 859 m 554 258 q 510 409 554 347 q 380 471 466 471 q 255 409 300 471 q 210 264 210 348 q 253 105 210 172 q 384 39 297 39 q 485 73 441 39 q 540 148 529 108 q 552 206 551 187 q 554 258 554 225 "},"‘":{"x_min":86.5,"x_max":303.171875,"ha":374,"o":"m 224 659 q 193 594 212 620 q 140 568 174 568 q 86 615 86 568 q 98 660 86 633 q 122 708 110 687 l 271 951 l 303 942 l 224 659 "},"ϊ":{"x_min":-29,"x_max":362,"ha":342,"o":"m 104 333 l 104 520 q 103 566 104 544 q 96 654 102 588 q 140 647 130 648 q 165 647 151 647 q 232 654 195 647 q 224 555 225 599 q 223 437 223 511 l 223 406 q 228 194 223 337 q 233 0 233 51 q 201 3 216 1 q 165 5 185 5 q 127 3 148 5 q 96 0 107 1 q 100 165 96 51 q 104 333 104 279 m 45 928 q 99 907 77 928 q 122 853 122 886 q 101 800 122 822 q 48 778 80 778 q -6 800 15 778 q -29 853 -29 822 q -7 906 -29 884 q 45 928 13 928 m 286 928 q 340 906 318 928 q 362 853 362 884 q 341 799 362 821 q 289 778 321 778 q 235 800 257 778 q 213 853 213 822 q 233 905 213 883 q 286 928 254 928 "},"π":{"x_min":19,"x_max":957,"ha":989,"o":"m 702 5 l 635 0 q 639 114 635 44 q 643 196 643 185 l 643 575 l 508 575 l 373 575 l 369 284 q 373 143 369 236 q 377 0 377 50 q 345 3 360 1 q 309 5 329 5 q 271 3 292 5 q 239 0 250 1 l 248 196 l 243 575 q 130 553 171 575 q 43 472 89 532 q 19 559 35 519 q 139 627 71 611 q 305 644 207 644 l 658 644 l 852 644 l 957 651 l 951 610 l 957 566 l 769 575 l 765 310 q 769 154 765 257 q 773 0 773 51 q 739 3 755 1 q 702 5 724 5 "},"ά":{"x_min":41,"x_max":827.109375,"ha":846,"o":"m 705 352 q 803 -1 763 155 l 739 1 l 673 -1 l 632 172 q 521 36 593 87 q 356 -15 448 -15 q 129 81 217 -15 q 41 316 41 177 q 130 569 41 467 q 368 672 220 672 q 537 622 464 672 q 659 486 610 573 q 711 654 691 569 l 770 650 l 827 654 q 763 505 792 576 q 705 352 734 434 m 518 943 q 552 974 536 964 q 589 985 568 985 q 626 969 611 985 q 641 932 641 953 q 627 897 641 911 q 585 866 613 883 l 384 743 l 335 743 l 518 943 m 377 619 q 226 530 272 619 q 181 326 181 442 q 223 124 181 214 q 367 34 265 34 q 528 137 480 34 q 601 323 577 240 q 527 531 578 444 q 377 619 475 619 "},"O":{"x_min":51,"x_max":1068,"ha":1119,"o":"m 51 465 q 192 820 51 690 q 559 950 333 950 q 892 853 754 950 q 1047 654 1031 757 q 1065 525 1062 551 q 1068 462 1068 500 q 1065 402 1068 426 q 1047 277 1062 379 q 894 80 1031 175 q 560 -15 756 -15 q 447 -10 496 -15 q 304 29 398 -5 q 130 186 210 64 q 51 465 51 308 m 202 468 q 290 162 202 282 q 559 42 379 42 q 826 162 738 42 q 915 468 915 283 q 825 770 915 651 q 559 889 735 889 q 348 826 429 889 q 225 639 267 764 q 202 468 202 552 "},"n":{"x_min":89,"x_max":661,"ha":754,"o":"m 99 155 l 99 495 q 97 569 99 530 q 91 655 95 608 q 153 648 122 648 l 219 656 l 218 539 q 319 635 260 599 q 451 672 378 672 q 591 624 528 672 q 654 501 654 576 l 654 299 l 654 136 l 661 0 q 629 3 644 1 q 593 5 613 5 q 556 3 576 5 q 525 0 536 1 q 530 222 525 80 q 535 406 535 364 q 501 536 535 485 q 389 587 467 587 q 253 508 288 587 q 218 313 218 430 q 220 132 218 258 q 222 0 222 6 q 184 3 208 0 q 155 6 159 6 q 117 3 141 6 q 89 0 93 0 l 99 155 "},"3":{"x_min":75,"x_max":644,"ha":749,"o":"m 241 465 l 238 512 l 294 510 q 424 554 375 510 q 474 680 474 599 q 434 805 474 754 q 322 856 394 856 q 220 818 257 856 q 164 711 183 780 l 153 706 q 127 767 136 747 q 99 819 118 788 q 220 886 162 863 q 348 909 278 909 q 526 857 450 909 q 603 706 603 805 q 542 564 603 617 q 383 479 482 511 q 567 423 490 479 q 644 262 644 366 q 542 55 644 129 q 302 -18 441 -18 q 183 -6 240 -18 q 75 32 127 5 q 99 189 91 116 l 113 188 q 182 73 136 115 q 302 31 229 31 q 448 92 392 31 q 505 246 505 154 q 451 389 505 333 q 312 446 398 446 q 238 435 279 446 l 241 465 "},"9":{"x_min":57,"x_max":688,"ha":749,"o":"m 261 38 q 475 166 405 38 q 546 451 546 295 q 442 378 494 403 q 325 354 389 354 q 132 428 208 354 q 57 617 57 502 q 148 828 57 748 q 372 909 240 909 q 612 801 536 909 q 688 520 688 693 q 574 143 688 305 q 252 -18 461 -18 q 186 -14 211 -18 q 127 0 161 -11 l 113 90 q 180 51 143 64 q 261 38 218 38 m 372 419 q 501 482 457 419 q 546 634 546 545 q 504 790 546 725 q 373 855 462 855 q 238 791 284 855 q 193 637 193 727 q 238 482 193 545 q 372 419 284 419 "},"l":{"x_min":100,"x_max":237.5,"ha":342,"o":"m 107 118 l 107 881 q 104 965 107 915 q 101 1025 101 1016 q 169 1018 138 1018 q 237 1025 203 1018 q 228 872 230 948 q 226 684 226 797 l 226 512 l 232 111 l 237 0 q 205 3 220 1 q 169 5 189 5 q 131 3 152 5 q 100 0 111 1 l 107 118 "},"κ":{"x_min":97,"x_max":677.5625,"ha":683,"o":"m 104 365 q 100 531 104 428 q 97 655 97 634 q 164 647 134 647 q 231 654 196 647 q 227 516 231 608 q 223 377 223 425 l 258 377 q 386 498 323 431 q 528 654 449 565 q 588 647 563 647 q 640 647 613 647 q 672 652 662 651 l 358 387 l 548 165 q 608 93 577 127 q 677 19 638 59 l 677 0 q 628 3 659 0 q 591 6 596 6 q 544 3 567 6 q 510 0 520 0 q 437 100 477 47 q 360 196 398 153 l 269 308 l 252 323 l 223 326 q 227 163 223 274 q 231 0 231 52 l 164 5 l 97 0 q 100 208 97 77 q 104 365 104 339 "},"4":{"x_min":39,"x_max":691.78125,"ha":749,"o":"m 453 252 l 177 257 l 39 253 l 39 291 q 204 522 111 392 q 345 721 297 653 q 475 906 394 789 l 527 906 l 581 906 q 575 805 581 872 q 569 705 569 739 l 569 343 l 598 343 q 644 344 620 343 q 690 350 667 345 l 683 297 q 686 270 683 287 q 691 244 689 254 q 568 253 629 253 l 568 137 l 569 0 l 505 6 l 437 0 q 450 120 447 51 q 453 252 453 190 m 453 767 l 344 626 q 230 465 298 562 q 144 343 162 368 l 453 343 l 453 767 "},"p":{"x_min":83,"x_max":702,"ha":758,"o":"m 91 -106 q 89 202 91 47 q 87 513 88 358 l 83 655 q 109 650 95 652 q 146 648 124 648 q 177 650 165 648 q 213 655 188 651 q 202 535 202 591 q 297 637 246 602 q 425 672 349 672 q 630 567 558 672 q 702 322 702 463 q 629 84 702 183 q 423 -15 556 -15 q 210 99 287 -15 l 210 -101 q 214 -244 210 -148 q 219 -373 219 -340 q 185 -369 201 -370 q 151 -368 170 -368 q 130 -368 138 -368 q 83 -373 123 -368 q 87 -240 83 -329 q 91 -106 91 -151 m 384 596 q 245 514 289 596 q 202 328 202 433 q 244 134 202 220 q 383 48 286 48 q 520 131 478 48 q 563 322 563 215 q 519 509 563 423 q 384 596 475 596 "},"ψ":{"x_min":78,"x_max":1002,"ha":1038,"o":"m 78 294 l 82 477 l 82 654 l 145 650 l 215 654 q 209 517 215 605 q 203 421 203 430 l 203 341 q 264 117 203 197 q 465 38 325 38 l 468 260 q 461 535 468 342 q 455 786 455 729 q 496 779 479 782 q 526 776 513 776 q 566 780 545 776 q 600 786 587 784 q 591 496 600 690 q 583 270 583 302 l 587 38 q 791 132 715 38 q 867 357 867 227 q 824 641 867 506 q 885 645 857 641 q 960 656 912 648 q 1002 419 1002 544 q 891 118 1002 231 q 587 -13 780 5 l 591 -221 l 600 -372 q 561 -365 578 -367 q 526 -363 543 -363 q 491 -366 511 -363 q 455 -372 471 -369 q 461 -162 455 -302 q 468 -13 468 -22 q 194 64 310 -13 q 78 294 78 142 "},"Ü":{"x_min":101,"x_max":919.0625,"ha":1015,"o":"m 182 927 l 262 931 q 250 805 253 854 q 247 697 247 757 l 247 457 q 314 136 247 212 q 516 60 381 60 q 733 130 654 60 q 813 336 813 201 l 813 458 l 813 657 q 799 931 813 802 l 859 927 l 919 931 q 905 770 909 863 q 901 600 901 677 l 901 366 q 792 82 901 179 q 491 -15 684 -15 q 211 66 307 -15 q 116 325 116 148 l 116 426 l 116 698 q 112 805 116 757 q 101 931 109 854 l 182 927 m 410 1208 q 462 1186 442 1208 q 483 1133 483 1164 q 460 1081 483 1105 q 410 1058 438 1058 q 356 1080 379 1058 q 334 1133 334 1103 q 356 1185 334 1163 q 410 1208 378 1208 m 650 1208 q 704 1187 682 1208 q 727 1133 727 1166 q 704 1080 727 1103 q 650 1058 681 1058 q 598 1078 620 1058 q 576 1133 576 1099 q 598 1185 576 1163 q 650 1208 620 1208 "},"à":{"x_min":43,"x_max":655.5,"ha":649,"o":"m 234 -15 q 98 33 153 -15 q 43 162 43 82 q 106 303 43 273 q 303 364 169 333 q 444 448 437 395 q 403 568 444 521 q 288 616 362 616 q 191 587 233 616 q 124 507 149 559 l 95 520 l 104 591 q 202 651 144 631 q 323 672 261 672 q 500 622 444 672 q 557 455 557 573 l 557 133 q 567 69 557 84 q 618 54 577 54 q 655 58 643 54 l 655 26 q 594 5 626 14 q 537 -6 562 -3 q 438 85 453 -6 q 342 10 388 35 q 234 -15 296 -15 m 392 743 l 191 866 q 152 896 170 877 q 133 934 133 915 q 148 970 133 955 q 186 986 163 986 q 222 972 200 986 q 254 945 245 958 l 442 743 l 392 743 m 176 186 q 204 98 176 133 q 284 64 232 64 q 390 107 342 64 q 438 212 438 151 l 438 345 q 239 293 303 319 q 176 186 176 268 "},"η":{"x_min":91,"x_max":662,"ha":754,"o":"m 594 -365 q 557 -366 577 -365 q 526 -369 537 -368 q 531 -189 526 -310 q 537 -7 537 -68 l 537 406 q 503 536 537 485 q 391 587 469 587 q 255 508 290 587 q 220 315 220 430 q 222 133 220 259 q 224 1 224 8 l 158 6 l 91 1 l 101 156 l 101 495 q 97 584 101 527 q 93 655 93 640 q 119 650 105 652 q 155 648 134 648 q 185 650 175 648 q 221 655 195 651 l 220 538 q 321 637 265 602 q 452 672 378 672 q 604 603 552 672 q 656 430 656 535 l 656 329 l 656 -186 q 659 -293 656 -227 q 662 -370 662 -359 q 630 -366 645 -368 q 594 -365 614 -365 "}},"cssFontWeight":"normal","ascender":1267,"underlinePosition":-133,"cssFontStyle":"normal","boundingBox":{"yMin":-373.75,"xMin":-71,"yMax":1267,"xMax":1511},"resolution":1000,"original_font_information":{"postscript_name":"Optimer-Regular","version_string":"Version 1.00 2004 initial release","vendor_url":"http://www.magenta.gr/","full_font_name":"Optimer","font_family_name":"Optimer","copyright":"Copyright (c) Magenta Ltd., 2004","description":"","trademark":"","designer":"","designer_url":"","unique_font_identifier":"Magenta Ltd.:Optimer:22-10-104","license_url":"http://www.ellak.gr/fonts/MgOpen/license.html","license_description":"Copyright (c) 2004 by MAGENTA Ltd. All Rights Reserved.\r\n\r\nPermission is hereby granted, free of charge, to any person obtaining a copy of the fonts accompanying this license (\"Fonts\") and associated documentation files (the \"Font Software\"), to reproduce and distribute the Font Software, including without limitation the rights to use, copy, merge, publish, distribute, and/or sell copies of the Font Software, and to permit persons to whom the Font Software is furnished to do so, subject to the following conditions: \r\n\r\nThe above copyright and this permission notice shall be included in all copies of one or more of the Font Software typefaces.\r\n\r\nThe Font Software may be modified, altered, or added to, and in particular the designs of glyphs or characters in the Fonts may be modified and additional glyphs or characters may be added to the Fonts, only if the fonts are renamed to names not containing the word \"MgOpen\", or if the modifications are accepted for inclusion in the Font Software itself by the each appointed Administrator.\r\n\r\nThis License becomes null and void to the extent applicable to Fonts or Font Software that has been modified and is distributed under the \"MgOpen\" name.\r\n\r\nThe Font Software may be sold as part of a larger software package but no copy of one or more of the Font Software typefaces may be sold by itself. \r\n\r\nTHE FONT SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL MAGENTA OR PERSONS OR BODIES IN CHARGE OF ADMINISTRATION AND MAINTENANCE OF THE FONT SOFTWARE BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM OTHER DEALINGS IN THE FONT SOFTWARE.","manufacturer_name":"Magenta Ltd.","font_sub_family_name":"Regular"},"descender":-374,"familyName":"Optimer","lineHeight":1640,"underlineThickness":20});
// File:editor/js/Sidebar.Geometry.TextGeometry.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.TextGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	
	var parameters = object.geometry.parameters;
	var newParameters = parameters || {};

	// Font Size
	var sizeRow = new UI.Panel();
	var size = new UI.Number(parameters.data.size).onChange( update);

	sizeRow.add( new UI.Text( 'Font Size' ).setWidth( '90px' ) );
	sizeRow.add( size );

	container.add( sizeRow );

	// Extrusion - change height to a more understandable name
	var depthRow = new UI.Panel();
	var depth = new UI.Number(parameters.data.height).onChange( update);

	depthRow.add( new UI.Text( 'Depth' ).setWidth( '90px' ) );
	depthRow.add( depth );

	container.add( depthRow );

	// Smoothness in curves - do users need to change values like this?
	// var curveSegmentsRow = new UI.Panel();
	// var curveSegments = new UI.Integer(parameters.data.curveSegments).onChange( update);

	// curveSegmentsRow.add( new UI.Text( 'Curve Segments' ).setWidth( '90px' ) );
	// curveSegmentsRow.add( curveSegments );

	// container.add( curveSegmentsRow );

	// Font
	var fontRow = new UI.Panel();
	var font = new UI.Select().setOptions( {

		'helvetiker': 'helvetiker',
		'optimer': 'optimer',
		'gentilis': 'gentilis'

	} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );
	fontRow.add( new UI.Text( 'Font' ).setWidth( '90px' ) );
	fontRow.add( font );

	container.add( fontRow );

	// Weight
	var weightRow = new UI.Panel();
	var weight = new UI.Select().setOptions( {

		'normal': 'normal',
		'bold': 'bold'

	} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );
	weightRow.add( new UI.Text( 'Weight' ).setWidth( '90px' ) );
	weightRow.add( weight );

	container.add( weightRow );

	// Style - is this even working ( relevant if fonts support it )
	// var styleRow = new UI.Panel();
	// var style = new UI.Select().setOptions( {

	// 	'normal': 'normal',
	// 	'italics': 'italics'

	// } ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );
	// styleRow.add( new UI.Text( 'Style' ).setWidth( '90px' ) );
	// styleRow.add( style );

	// container.add( styleRow );

	// Text
	var textRow = new UI.Panel();
	var text = new UI.Input(parameters.text).setWidth( '150px' ).setFontSize( '12px' ).onChange( update);

	textRow.add( new UI.Text( 'Text' ).setWidth( '90px' ) );
	textRow.add( text );

	container.add( textRow );

	//

	function update() {

		object.geometry.dispose();
		
		newParameters.size = size.getValue();
		newParameters.height = depth.getValue();
		newParameters.font = font.getValue();
		newParameters.weight = weight.getValue();

		object.geometry = new THREE.TextGeometry(
			text.getValue(),
			newParameters
			
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}

// File:editor/js/MainEditor.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

var MainEditor = function () {

	this.init();
}

MainEditor.prototype = {


	init: function(){

			window.URL = window.URL || window.webkitURL;
			window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

			Number.prototype.format = function (){
				return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
			};

            this.editor = new Editor();
			var editor = this.editor;

			var shortcuts = new EditorShortCuts(editor);

			var viewport = new Viewport( editor );
			document.body.appendChild( viewport.dom );

			var player = new Player( editor );
			document.body.appendChild( player.dom );

			var script = new Script( editor );
			document.body.appendChild( script.dom );

			var toolbar = new Toolbar( editor );
			document.body.appendChild( toolbar.dom );

			var menubar = new Menubar( editor );
			document.body.appendChild( menubar.dom );

			var sidebar = new Sidebar( editor );
			document.body.appendChild( sidebar.dom );

			editor.config.setKey( 'autosave', false ); // Hacky
			editor.setTheme( editor.config.getKey( 'theme' ) );

			editor.storage.init( function () {

				editor.storage.get( function ( state ) {

					if ( state !== undefined ) {

						editor.fromJSON( state );

					}

					var selected = editor.config.getKey( 'selected' );

					if ( selected !== undefined ) {

						editor.selectByUuid( selected );

					}

				} );

				//

				var timeout;

				var sceneChanged = function(){

					editor.signals.unsaveProject.dispatch();

					if ( editor.config.getKey( 'autosave' ) === false ) return;

					// else {

					// 	saveState(1000);

					// }

				};

				var manualSave = function () {

					saveState(1000);
					// console.log("manualSave");
				};

				// var saveState = function ( scene ) {
				var saveState = function ( time ) {

					console.log("h2");

					clearTimeout( timeout );

					timeout = setTimeout( function () {

						editor.signals.savingStarted.dispatch();

						timeout = setTimeout( function () {

							editor.storage.set( editor.toJSON() );

							editor.signals.savingFinished.dispatch();

						}, 100 );

					}, time );

				};

				var signals = editor.signals;

				signals.editorCleared.add( sceneChanged );
				signals.geometryChanged.add( sceneChanged );
				signals.objectAdded.add( sceneChanged );
				signals.objectChanged.add( sceneChanged );
				signals.objectRemoved.add( sceneChanged );
				signals.materialChanged.add( sceneChanged );
				signals.sceneGraphChanged.add( sceneChanged );
				// signals.scriptChanged.add( saveState );
				signals.saveProject.add( manualSave );
			} );

			//

			document.addEventListener( 'dragover', function ( event ) {

				event.preventDefault();
				event.dataTransfer.dropEffect = 'copy';

			}, false );

			document.addEventListener( 'drop', function ( event ) {

				event.preventDefault();

				if ( event.dataTransfer.files.length > 0 ) {

					editor.loader.loadFile( event.dataTransfer.files[ 0 ] );

				}

			}, false );

			document.addEventListener( 'keydown', function ( event ) {

				switch ( event.keyCode ) {

					case 8:
						event.preventDefault(); // prevent browser back
						break;

					default:
						shortcuts.keyCheck( event.keyCode );
						break;
				}

			}, false );

			var onWindowResize = function ( event ) {

				editor.signals.windowResize.dispatch();

			};

			window.addEventListener( 'resize', onWindowResize, false );

			onWindowResize();

			//

			var file = null;
			var hash = window.location.hash;

			if ( hash.substr( 1, 4 ) === 'app=' ) file = hash.substr( 5 );
			if ( hash.substr( 1, 6 ) === 'scene=' ) file = hash.substr( 7 );

			if ( file !== null ) {

				if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

					var loader = new THREE.XHRLoader();
					loader.crossOrigin = '';
					loader.load( file, function ( text ) {

						var json = JSON.parse( text );

						editor.clear();
						editor.fromJSON( json );

					} );

				}

			}

			window.addEventListener( 'message', function ( event ) {

				editor.clear();
				editor.fromJSON( event.data );

			}, false );



	}
}
