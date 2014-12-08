require.config({
	paths: {
	"jquery"     : "lib/jquery-2.1.1.min",
	"underscore" : "lib/underscore",
	"constants"  : "lib/modules/constants",
	"ObjParser"  : "lib/modules/ObjParser",
	"Timer"		 : "lib/modules/Timer",
	"Animation"  : "lib/modules/Animation",
	"text"       : "lib/require/text",
	"DOMInteraction" : "lib/modules/DOMInteraction",
	"Matrix"	 : "lib/modules/Matrix",
	"MatrixStack": "lib/modules/MatrixStack",
	"Model"		 : "lib/modules/Model",
	"ParticleEmitter" : "lib/modules/ParticleEmitter",
	"Graphics3DContext": "lib/modules/Graphics3DContext",
	"MapParser"  : "lib/modules/MapParser"
	}
});
require(['jquery', 'Animation', 'ObjParser', 'DOMInteraction', 'Matrix', 'MatrixStack', 'Model', 'ParticleEmitter', 'Graphics3DContext', 'MapParser', 'text!lib/shaders/vertex.glsl', 'text!lib/shaders/fragment.glsl'],
function( jquery, 	Animation, 	 ObjParser,   DOMInteraction,   Matrix,   MatrixStack,   Model,   ParticleEmitter,   Graphics3DContext,   MapParser,   vertexSource, 				     fragmentSource) {
	'use strict';

	$('#game-over').hide();

	// Recognize mouse movements
	var domInteraction = new DOMInteraction();

	// Get the canvas element and set its height/width appropriately based on the pixel ratio
	var canvas = $('canvas')[0];
	canvas.width = $(window).width() * devicePixelRatio;
	canvas.style.width = $(window).width() + 'px';
	canvas.height = $(window).height() * devicePixelRatio;
	canvas.style.height = $(window).height() + 'px';
	var aspectRatio = canvas.width / canvas.height;

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
	viewProjectionMatrix.perspectivize(Math.PI / 3, aspectRatio, 1, 20);

	var modelLoadedCount = 0;
	var numberModels = 1;

	var mapParser = new MapParser('level-1', mapLoaded);

	var loadedModels = [];

	var arwing;

	function mapLoaded(mapParser) {
		arwing = new Model(gl, 'arwing', modelLoaded);
		mapParser.models.forEach(function(element){
			element.shouldDraw = true;
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


	var coinRadius = 0.125;
	var asteroidRadius = 1.0;
	var shipRadius = 1.0;

	function modelLoaded(model) {
		if (model.modelName.indexOf('asteroid') !== -1) {
			model.baseColor = [92/255.0, 64/255.0, 51/255.0, 1.0];
			model.shininess = 0.0;
			model.modelView.scale(asteroidRadius, asteroidRadius, asteroidRadius);
			model.radius = asteroidRadius;
		}
		if (model.modelName == 'coin') {
			model.baseColor = [255/255.0, 215/255.0, 0.0, 1.0];
			model.shininess = 100.0;
			model.modelView.scale(coinRadius, coinRadius, coinRadius);
			model.radius = coinRadius;
		}
		if (model.modelName == 'arwing') {
			model.baseColor = [35/255.0, 107/255.0, 142/255.0, 1.0];
			model.shininess = 50.0;
			model.modelView.scale(shipRadius, shipRadius, -shipRadius);
			model.radius = shipRadius;
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

	var shipOffset = -4;
	var coinSpinFactor = 200; // higher is slower
	var worldTiltAngle = Math.PI / 8;
	var worldOffset = -1.0;
	var travelSpeedFactor = 300; // higher is slower
	var moving = true;
	var numberCoinsCollected = 0;
	var distanceTraveled = 0;
	var shipLocation = {x:0,y:0};

	function convertScreenToMap(location){
		var locationConverted = {};
		locationConverted.x = location.x * mapParser.width / $(window).width() - (0.5)*mapParser.width;
		locationConverted.y = -location.y * mapParser.height / $(window).height() + (0.5)*mapParser.height;
		return locationConverted;
	}

	function reDraw(time, frameNumber) {
	// Remember that all models are drawn in the negative z-space.
	// This ensures a right-handed coordinatesystem with sensibly oriented x and y axes.


		//var translate = new Matrix(4);
		//translate.translate(gestureRecognizer.curXPos, gestureRecognizer.curYPos, 0);


		if (moving) {
			shipLocation = convertScreenToMap({x:domInteraction.curXPos, y:domInteraction.curYPos});			
		}

		// Detect collisions
		// First iterate through all the scene models
		mapParser.models.forEach(function(element) {
			var category = element.keyword;
			var modelName = element.mesh.modelName;
			var distance = Math.sqrt(Math.pow(element.location.x - shipLocation.x, 2) + Math.pow(element.location.y - shipLocation.y, 2) + Math.pow(-element.location.z - shipOffset - 20 + distanceTraveled, 2));

			if (distance < (shipRadius + element.mesh.radius)/2 && element.shouldDraw) {
				switch (category) {
					case 'collectibles':
						numberCoinsCollected++;
						$('#score').html(String(numberCoinsCollected));
						element.shouldDraw = false;
						break;
					case 'enemies':
						moving = false;
						$('#game-over').show();
						break;
					case 'obstacles':
						moving = false;
						$('#game-over').show();
						break;
				}
			}
		});


		context.draw('Starfox scene', viewProjectionMatrix, function(program) {

			if (moving) {
				distanceTraveled = frameNumber * 60 / travelSpeedFactor;
			}

			// Angle the world a little up so that the user isn't staring at the back of the ship
			// Then move it down a little
			worldProjectionStack.push((new Matrix()).translate(0.0, worldOffset, 0.0));
			worldProjectionStack.push((new Matrix()).rotateX(worldTiltAngle));


			// Move the world forward a little so that the camera can capture everything
			worldProjectionStack.push((new Matrix()).translate(0.0, 0.0, -20 + distanceTraveled));

			// Draw the models in the scene
			for (var index = 0; index < mapParser.models.length; index++) {
				var model = mapParser.models[index];

				if (!model.shouldDraw) {
					continue;
				}

				var meshModel = model.mesh;
				var location = model.location;

				// Push the location onto the world projection stack
				worldProjectionStack.push((new Matrix()).translate(location.x, location.y, -location.z));
				
				var modelTransform = new Matrix(4);

				if (meshModel.modelName == 'coin') {
					modelTransform.rotateX(Math.PI / 2);
					modelTransform.rotateZ(time / coinSpinFactor, 3);
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
			}
			worldProjectionStack.pop();

			// draw the ship
			worldProjectionStack.push((new Matrix()).translate(shipLocation.x, shipLocation.y, shipOffset));
			arwing.draw(worldProjectionStack, program);
			worldProjectionStack.pop();
			worldProjectionStack.pop();
			worldProjectionStack.pop();
		});
	};
}); 