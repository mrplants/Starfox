define(['ObjParser', 'Matrix', 'MatrixStack'], function(ObjParser, Matrix, MatrixStack) {
    'use strict';
	return function Model(gl, modelName, callback) {
        var args = Array.prototype.slice.call(arguments);
        // Public variables
        var self = this;
        self.modelName = modelName;
        self.modelView = new Matrix(4);
        self.vertexBuffer = gl.createBuffer();
        self.normalBuffer = gl.createBuffer();
        self.parser = new ObjParser();
        self.lightPosition = [0.0, 0.0, -1.0];
        self.ambientColor = [0.2, 0.2, 0.2];
        self.shininess = 1.0;
        self.baseColor = [0.3,0.3];

        // Private variables
        var mine = {
        };

        // Private:
        /*
        *
        */

        // Public:
        /*
        *
        */
        self.draw = function draw(perspectiveProjectionStack, program, optionalTempModelMatrix) {
            // Load the uniforms
            // Scene
            if (optionalTempModelMatrix !== undefined) {
                var modelViewUniform = gl.getUniformLocation(program, 'modelViewMatrix');
                gl.uniformMatrix4fv(modelViewUniform, false, self.modelView.multiply(optionalTempModelMatrix).webGLFormat());
            } else {
                var modelViewUniform = gl.getUniformLocation(program, 'modelViewMatrix');
                gl.uniformMatrix4fv(modelViewUniform, false, self.modelView.webGLFormat());
            }
            var perspectiveUniform = gl.getUniformLocation(program, 'perspectiveMatrix');
            gl.uniformMatrix4fv(perspectiveUniform, false, perspectiveProjectionStack.getProduct().webGLFormat());


            // Lighting
            var baseColorUniform = gl.getUniformLocation(program, 'baseColor');
            gl.uniform4fv(baseColorUniform, new Float32Array(self.baseColor));

            var lightPositionUniform = gl.getUniformLocation(program, 'pointLightPosition');
            gl.uniform3fv(lightPositionUniform, new Float32Array(self.lightPosition));

            var ambientUniform = gl.getUniformLocation(program, 'ambientProduct');
            gl.uniform3fv(ambientUniform, new Float32Array(self.ambientColor));

            var shininessUniform = gl.getUniformLocation(program, 'shininess');
            gl.uniform1f(shininessUniform, self.shininess);

            // Load the attribute buffers
            var positionAttribute = gl.getAttribLocation(program, 'vertexPosition');
            gl.enableVertexAttribArray(positionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
            gl.vertexAttribPointer(positionAttribute, 4, gl.FLOAT, false, 0, 0);

            var normalAttribute = gl.getAttribLocation(program, 'vertexNormal');
            gl.enableVertexAttribArray(normalAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, self.normalBuffer);
            gl.vertexAttribPointer(normalAttribute, 3, gl.FLOAT, false, 0, 0);

            // Draw
            gl.drawArrays(gl.TRIANGLES, 0, self.parser.vertices.length/4);
        };

        // Setup

        // Load the data
        if (modelName !== undefined) {
            self.parser.setLocation(modelName, function() {
                // Set up the openGL context with data
                gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, self.parser.vertices, gl.STATIC_DRAW);

                gl.bindBuffer(gl.ARRAY_BUFFER, self.normalBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, self.parser.vertexNormals, gl.STATIC_DRAW);

                var near, far, left, right, top, bottom;
                far = self.parser.mins.z;
                near = self.parser.maxes.z;
                top = self.parser.maxes.y;
                bottom = self.parser.mins.y;
                right = self.parser.maxes.x;
                left = self.parser.mins.x;

                var centerX = Math.abs(right+left) / 2.0;
                var centerY = Math.abs(top+bottom) / 2.0;
                var centerZ = Math.abs(near+far) / 2.0;

                var sideLength = Math.max(Math.max(Math.abs(right-left), Math.abs(top-bottom)), Math.abs(near-far));

                self.modelView.orthogonize(centerZ+sideLength, centerZ-sideLength, centerY+sideLength, centerY-sideLength, centerX+sideLength, centerX-sideLength);

                callback(self);
            });
        }
    };
});