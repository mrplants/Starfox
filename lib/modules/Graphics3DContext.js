define([], function() {
    'use strict';
	return function Graphics3DContext(gl) {
        var args = Array.prototype.slice.call(arguments);
        //public variables
        var self = this;
        self.gl = gl;
        self.vertexSource = "";
        self.fragmentSource = "";
        self.programs = {};

        //private variables
        var mine = {
            clearColor : [0.0,0.0,0.0,1.0]
        };

        // Private:
        /*
        *
        */

        // Public:
        /*
        *
        */
        self.setClearColor = function setClearColor(color) {
            mine.clearColor = [color.r, color.g, color.b, color.a];
            self.gl.clearColor(mine.clearColor[0], mine.clearColor[1], mine.clearColor[2], mine.clearColor[3]);
        };

        self.setupProgram = function setupProgram(vertexSource, fragmentSource, identifier) {
            // Create and compile the shaders
            var vertexShader = self.gl.createShader(self.gl.VERTEX_SHADER);
            self.gl.shaderSource(vertexShader, vertexSource);
            self.gl.compileShader(vertexShader);

            var fragmentShader = self.gl.createShader(self.gl.FRAGMENT_SHADER);
            self.gl.shaderSource(fragmentShader, fragmentSource);
            self.gl.compileShader(fragmentShader);

            // Create and compile the rendering program
            var program = self.gl.createProgram();
            self.gl.attachShader(program, vertexShader);
            self.gl.attachShader(program, fragmentShader);
            self.gl.linkProgram(program);

            self.programs[identifier] = program;
        };

        self.draw = function draw(identifier, viewProjectionMatrix, drawCallback) {
            self.gl.clear(self.gl.COLOR_BUFFER_BIT);

            // Load the rendering program
            self.gl.useProgram(self.programs[identifier]);

            var projectionUniform = gl.getUniformLocation(self.programs[identifier], 'projectionTransform');
            gl.uniformMatrix4fv(projectionUniform, false, viewProjectionMatrix.webGLFormat());

            drawCallback(self.programs[identifier]);
        };

        // Setup

        // Enable depth test
        self.gl.enable(self.gl.DEPTH_TEST);
        // Set the clear color
        self.gl.clearColor(mine.clearColor[0], mine.clearColor[1], mine.clearColor[2], mine.clearColor[3]);

    };
});