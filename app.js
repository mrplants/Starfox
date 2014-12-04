require.config({
	paths: {
	"jquery"     : "lib/jquery-2.1.1.min",
	"underscore" : "lib/underscore",
	"constants"  : "lib/modules/constants",
	"ObjParser"  : "lib/modules/ObjParser",
	"Timer"		 : "lib/modules/Timer",
	"Animation"  : "lib/modules/Animation",
	"text"       : "lib/require/text",
	"Gestures"	 : "lib/modules/Gestures",
	"Matrix"	 : "lib/modules/Matrix",
	"MatrixStack": "lib/modules/MatrixStack",
	"Model"		 : "lib/modules/Model",
	"ParticleEmitter" : "lib/modules/ParticleEmitter",
	"Graphics3DContext": "lib/modules/Graphics3DContext",
	"MapParser"  : "lib/modules/MapParser"
	}
});
require(['jquery', 'Animation', 'ObjParser', 'Gestures', 'Matrix', 'MatrixStack', 'Model', 'ParticleEmitter', 'Graphics3DContext', 'MapParser', 'text!lib/shaders/vertex.glsl', 'text!lib/shaders/fragment.glsl'],
function( jquery, 	Animation, 	 ObjParser,   Gestures,   Matrix,   MatrixStack,   Model,   ParticleEmitter,   Graphics3DContext,   MapParser,   vertexSource, 				     fragmentSource) {
	'use strict';

	// Get the canvas element and set its height/width appropriately based on the pixel ratio
	var canvas = $('canvas')[0];
	canvas.width = 500 * devicePixelRatio;
	canvas.height = 500 * devicePixelRatio;

	// Get the webGL context
	var gl = canvas.getContext('webgl');

	// Prepare the drawing context with this scene
	var context = new Graphics3DContext(gl);
	context.clearColor = {r:0.0, g:0.0, b:0.0, a:0.0};
	context.setupProgram(vertexSource, fragmentSource, 'Starfox scene');

	// Set up the animation framerate and callback
	var animation = new Animation();
	animation.setFrameRate(60);
	animation.setCallback(reDraw);

	// Data used for scene geometry
	// World projection used for positioning models in the scene
	var worldProjectionStack = new MatrixStack();
	// View projection used for transforming the scene into viewing coordinates
	var viewProjectionMatrix = new Matrix();
	viewProjectionMatrix.perspectivize(Math.PI / 3, 1, 1, 20);

	var modelLoadedCount = 0;
	var numberModels = 1;

	var mapParser = new MapParser('level-1', mapLoaded);

	var loadedModels = [];

	var arwing;

	function mapLoaded(mapParser) {
		arwing = new Model(gl, 'arwing', modelLoaded);
		mapParser.models.forEach(function(element){
			if (element.mesh == 'asteroid') {

				var asteroidNames = ['asteroid1', 'asteroid2', 'asteroid3', 'asteroid4', 'asteroid5'];
				element.mesh = asteroidNames[parseInt(Math.random() * 5)];

				element.rotationFactor = {
					x: Math.random() * 200 + 200,
					y: Math.random() * 200 + 200,
					z: Math.random() * 200 + 200
				};
			}
			if (loadedModels.indexOf(element.mesh) == -1) {
				loadedModels.push(element.mesh);
			}
		});
		numberModels += loadedModels.length;
		loadedModels.forEach(function(element) {
			new Model(gl, element, modelLoaded);
		});
	}



	function modelLoaded(model) {
		if (model.modelName.indexOf('asteroid') !== -1) {
			model.baseColor = [139/255.0, 69/255.0, 19/255.0, 1.0];
			model.shininess = 0.0;
		}
		if (model.modelName == 'coin') {
			model.baseColor = [255/255.0, 215/255.0, 0.0, 1.0];
			model.shininess = 100.0;
			model.modelView.scale(0.125, 0.125, 0.125);
		}
		if (model.modelName == 'arwing') {
			model.baseColor = [35/255.0, 107/255.0, 142/255.0, 1.0];
			model.shininess = 50.0;
		} else {
			mapParser.models.forEach(function(element) {
				if (element.mesh == model.modelName) {
					element.mesh = model;
				}
			});
		}
		modelLoadedCount++;
		if (modelLoadedCount == numberModels) {
			animation.startAnimation();
		}
	}


	function reDraw(time, frameNumber) {
	// Remember that all models are drawn in the negative z-space.
	// This ensures a right-handed coordinatesystem with sensibly oriented x and y axes.

		context.draw('Starfox scene', viewProjectionMatrix, function(program) {

			var distanceTraveled = time / 300;

			// Move the world forward a little so that the camera can capture everything and the ship is at the center of the entrance to the map.
			worldProjectionStack.push((new Matrix()).translate(0.0, 0.0, -20 + distanceTraveled));

			// Draw the models in the scene
			for (var index = 0; index < mapParser.models.length; index++) {
				var model = mapParser.models[index]

				var meshModel = model.mesh;
				var location = model.location;
				var modelCategory = model.keyword;

				// Push the location onto the world projection stack
				worldProjectionStack.push((new Matrix()).translate(location.x, location.y, -location.z));
				
				var modelTransform = new Matrix(4);

				if (meshModel.modelName == 'coin') {
					modelTransform.rotateX(Math.PI / 2);
					modelTransform.rotateZ(time / 200, 3);
				}
				if (meshModel.modelName.indexOf('asteroid') !== -1) {
					modelTransform.rotateX(time / model.rotationFactor.x);
					modelTransform.rotateY(time / model.rotationFactor.y);
					modelTransform.rotateZ(time / model.rotationFactor.z, 3);
				}

				worldProjectionStack.push(modelTransform);

				meshModel.draw(worldProjectionStack, program);
				worldProjectionStack.pop();
				worldProjectionStack.pop();
			};
			worldProjectionStack.pop();

			// draw the ship
			worldProjectionStack.push((new Matrix()).translate(0.0, 0.0, -3));
			arwing.draw(worldProjectionStack, program);
			worldProjectionStack.pop();
		});


	};

}); 