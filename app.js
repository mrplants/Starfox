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
	"MapParser"  : "lib/modules/Model"
	}
});
require(['jquery', 'Animation', 'ObjParser', 'Gestures', 'Matrix', 'MatrixStack', 'Model', 'ParticleEmitter', 'Graphics3DContext', 'text!lib/shaders/vertex.glsl', 'text!lib/shaders/fragment.glsl'],
function( jquery, 	Animation, 	 ObjParser,   Gestures,   Matrix,   MatrixStack,   Model,   ParticleEmitter,   Graphics3DContext,   vertexSource, 				    fragmentSource) {
	'use strict';

	// Recognize mouse movements
	var gestureRecognizer = new Gestures();

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
	viewProjectionMatrix.frustivize(-1, -3, 1, -1, 1, -1); // <-- SOMETHING WEIRD ABOUT THIS FUNCTION. TAKES ONLY NEGATIVE VALUES FOR THE FIRST TWO ARGUMENTS...

	var modelLoadedCount = 0;
	var numberModels = 1;

	var arwing = new Model(gl, 'arwing', modelLoaded);

	function modelLoaded(model) {
		if (model.modelName == 'arwing') {
			model.baseColor = [131/255.0, 137/255.0, 150/255.0, 1.0];
			model.shininess = 50.0;
		}
		modelLoadedCount++;
		if (modelLoadedCount == numberModels) {
			animation.startAnimation();
		}
	}

	// Load the data
	function reDraw(time, frameNumber) {

		//var translate = new Matrix(4);
		//translate.translate(gestureRecognizer.curXPos, gestureRecognizer.curYPos, 0);

		context.draw('Starfox scene', viewProjectionMatrix, function(program) {
			arwing.draw(worldProjectionStack, program);
			arwing.draw(worldProjectionStack, program);
		});


	};

}); 