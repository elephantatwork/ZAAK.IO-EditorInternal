/**
 * @author mrdoob / http://mrdoob.com/
 */

var Config = function ( name ) {

	var storage = {
		'autosave': true,
		'theme': 'css/light.css',

		'degree': true,

		'backgroundColor': 0xcccccc,

		'project/history/stored': true,
		'project/renderer': 'WebGLRenderer',
		'project/renderer/antialias': true,
		'project/renderer/gammaInput': false,
		'project/renderer/gammaOutput': false,
		'project/renderer/shadows': true,
		'project/editable': false,
		'project/vr': false,
		'project/gazetime':2.4,
		'project/crosshair':true,
		'project/quality':1.0,

		'ui/sidebar/animation/collapsed': true,
		'ui/sidebar/geometry/collapsed': true,
		'ui/sidebar/history/collapsed': true,
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

	};

};
