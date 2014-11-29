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
	"ParticleEmitter" : "lib/modules/ParticleEmitter"
	}
});
require(['jquery', 'Animation', 'ObjParser', 'Gestures', 'Matrix', 'MatrixStack', 'Model', 'ParticleEmitter', 'text!lib/shaders/vertex.glsl', 'text!lib/shaders/fragment.glsl'],
function( jquery, 	Animation, 	 ObjParser,   Gestures,   Matrix,   MatrixStack,   Model,   ParticleEmitter,   vertexSource, 				   fragmentSource) {
	'use strict';

	// Get the canvas element and set its height/width appropriately based on the pixel ratio
	var canvas = $('canvas')[0];
	canvas.width = 500 * devicePixelRatio;
	canvas.height = 500 * devicePixelRatio;

	// Get the webGL context
	var gl = canvas.getContext('webgl');

	// Enable depth test
	gl.enable(gl.DEPTH_TEST);
	// Set the clear color
	gl.clearColor(0.0,0.0,0.0,1.0);

	// Create and compile the shaders
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexSource);
	gl.compileShader(vertexShader);

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentSource);
	gl.compileShader(fragmentShader);

	// Create and compile the rendering program
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	// Set up the animation framerate and callback
	var animation = new Animation();
	animation.setFrameRate(60);
	animation.setCallback(reDraw);

	// Data used for scene geometry
	var perspectiveProjectionStack = new MatrixStack();
	perspectiveProjectionStack.push(new Matrix());

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

		gl.clear(gl.COLOR_BUFFER_BIT);

		// Load the rendering program
		gl.useProgram(program);
		arwing.draw(perspectiveProjectionStack, program);

	};

}); 