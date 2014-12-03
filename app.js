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
	worldProjectionStack.push((new Matrix()).rotate3D(-Math.PI/6, -Math.PI/6, 0));
	worldProjectionStack.push((new Matrix()).translate(0,0,2));
	// View projection used for transforming the scene into viewing coordinates
	var viewProjectionMatrix = new Matrix();
	viewProjectionMatrix.frustivize(-1, -100, 1, -1, 1, -1); // <-- SOMETHING WEIRD ABOUT THIS FUNCTION. TAKES ONLY NEGATIVE VALUES FOR THE FIRST TWO ARGUMENTS...

	var modelLoadedCount = 0;
	var numberModels = 1;

	var mapParser = new MapParser('level-1', mapLoaded);

	var loadedModels = [];

	var arwing;

	function mapLoaded(mapParser) {
		arwing = new Model(gl, 'arwing', modelLoaded);
		mapParser.models.forEach(function(element){
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
		if (model.modelName == 'arwing') {
			model.baseColor = [131/255.0, 137/255.0, 150/255.0, 1.0];
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

	// Load the data
	function reDraw(time, frameNumber) {

		context.draw('Starfox scene', viewProjectionMatrix, function(program) {
			arwing.draw(worldProjectionStack, program);
			worldProjectionStack.pop();
			worldProjectionStack.push((new Matrix()).translate(0,0.5,70)); // really far away, a little higher
			arwing.draw(worldProjectionStack, program);
			worldProjectionStack.pop();
			worldProjectionStack.push((new Matrix()).translate(0,0,2));
			// ^^ CLEARLY THE FRUSTUM DOES NOT WORK. THESE MODELS ARE THE SAME SIZE. ^^
		});


	};

}); 