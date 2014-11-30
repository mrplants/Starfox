define([], function() {
    'use strict';
	return function Matrix() {
        var args = Array.prototype.slice.call(arguments);
        //public variables
        var self = this;
        self.isMatrix = true; // Used to identify matrices internally
        self.numRows = 4;
        self.numColumns = 4;
        self.rawData = [];
        self.stack = [];

        //private variables
        var mine = {
        };

        // Private:
        /*
        *
        */
        function multiplyItems(array1, array2) {
            if (array1.length == array2.length) {
                var productArray = array1.map(function(element, index) {
                    return element * array2[index];
                });
                return productArray;
            } else {
                console.log("MATRIX ERROR: Cannot multiply items in different sized arrays.");
                return array1;
            }
        }

        // Public:
        /*
        * Use promises so that the multiplication is more concise
        */

        // Use these to get custom matrix data
        self.getColumn = function getColumn(colNumber) {
            var column = [];
            for (var rowNumber = 0; rowNumber < self.numRows; rowNumber++) {
                column.push(self.rawData[rowNumber][colNumber]);
            };
            return column;
        };
        self.getRow = function getRow(rowNumber) {

            return self.rawData[rowNumber];
        };

        // Use these to build matrices (returns new matrix)
        self.buildOrthographic = function buildOrthographic(near, far, top, bottom, right, left) {
            var ortho = new Matrix(
                [2.0/(right-left),           0.0,                        0.0,                   0.0],
                [0.0,                        2.0/(top-bottom),           0.0,                   0.0],
                [0.0,                        0.0,                        -2.0/(far-near),       0.0],
                [-(right+left)/(right-left), -(top+bottom)/(top-bottom), (far+near)/(far-near), 1.0]
            );
            return ortho;
        };
        self.buildFrustum = function buildFrustum(near, far, top, bottom, right, left) {
            // THIS IS A DIFFERENT FORMAT THAN THE ORTHOGONAL PROJECTION INPUT
            // I USED A RAW INPUT, RATHER THAN A BUNCH OF COLUMNS
            var persp = new Matrix([
                [2.0/(right-left), 0,                0,             -(right+left)/(right-left)],
                [0,                2.0/(top-bottom), 0,             -(top+bottom)/(top-bottom)],
                [0,                0,                -2/(far-near), -(far+near)/(far-near)],
                [0,                0,                0,             1]
            ]);
            return persp;
        };
        self.build3DRotation = function build3DRotation(thetaX, thetaY, thetaZ) {
            var rotation = new Matrix(4);
            return rotation.rotateX(thetaX).rotateY(thetaY).rotateZ(thetaZ, 3);
        };
        self.build2DRotation = function build2DRotation(theta) {
            var rotation = new Matrix();
            return rotation.buildZRotation(theta, 2);
        };
        self.buildTranslation = function buildTranslation(dX, dY, dZ) {
            var translation;
            if (dZ !== undefined) {
                // 3D translation
                translation = new Matrix(
                    [1,  0,  0,  0],
                    [0,  1,  0,  0],
                    [0,  0,  1,  0],
                    [dX, dY, dZ, 1]
                );
            } else {
                // 2D translation
                translation = new Matrix(
                    [1,  0,  0],
                    [0,  1,  0],
                    [dX, dY, 1]
                );
            }
            return translation;
        };
        self.buildScaling = function buildScaling(sX, sY, sZ) {
            var scaling;
            if (sZ !== undefined) {
                // 3D scaling
                scaling = new Matrix(
                    [sX, 0,  0,  0],
                    [0,  sY, 0,  0],
                    [0,  0,  sZ, 0],
                    [0,  0,  0,  1]
                );
            } else {
                // 2D scaling
                scaling = new Matrix(
                    [sX, 0,  0],
                    [0,  sY, 0],
                    [0,  0,  1]
                );
            }
            return scaling;
        };
        self.buildIdentity = function identify(rows) {
            var identity = new Matrix(rows, rows);
            // Initialize the matrix at zero
            identity.initZero();
            for (var rowNumber = 0; rowNumber < identity.numRows; rowNumber++) {
                identity.rawData[rowNumber][rowNumber] = 1;
            }
            return identity;
        };
        self.initZero = function initZero() {
            self.rawData = [];
            for (var rowNumber = 0; rowNumber < self.numRows; rowNumber++) {
                var tempRow = [];
                for (var colNumber = 0; colNumber < self.numColumns; colNumber++) {
                    tempRow.push(0);
                }
                self.rawData.push(tempRow);
            }
        };

        // Use these for matrix manipulations (changes self)
        self.rotateX = function rotateX(thetaX) {
            // 3D rotation
            var rotation = new Matrix(
                [1, 0,                 0,                0],
                [0, Math.cos(thetaX),  Math.sin(thetaX), 0],
                [0, -Math.sin(thetaX), Math.cos(thetaX), 0],
                [0, 0,                 0,                1]
            );
            self.rawData = self.multiply(rotation).rawData;
            return self;
        };
        self.rotateY = function rotateY(thetaY) {
            // 3D rotation
            var rotation = new Matrix(
                [Math.cos(thetaY), 0, -Math.sin(thetaY), 0],
                [0,                1, 0,                 0],
                [Math.sin(thetaY), 0, Math.cos(thetaY),  0],
                [0,                0, 0,                 1]
            );
            self.rawData = self.multiply(rotation).rawData;
            return self;
        };
        self.rotateZ = function rotateZ(thetaZ, dimensions) {
            var rotation;
            if (dimensions == 3) {
                // 3D rotation
                rotation = new Matrix(
                    [Math.cos(thetaZ),  Math.sin(thetaZ), 0, 0],
                    [-Math.sin(thetaZ), Math.cos(thetaZ), 0, 0],
                    [0,                0,                 1, 0],
                    [0,                0,                 0, 1]
                );
            } else {
                // 2D rotation
                rotation = new Matrix(
                    [Math.cos(thetaZ),  Math.sin(thetaZ), 0],
                    [-Math.sin(thetaZ), Math.cos(thetaZ), 0],
                    [0,                0,                 1]
                );
            }
            self.rawData = self.multiply(rotation).rawData;
            return self;
        };
        self.rotate3D = function rotate3D(thetaX, thetaY, thetaZ) {
            var rotationMatrix = self.build3DRotation(thetaX, thetaY, thetaZ);
            self.rawData = self.multiply(rotationMatrix).rawData;
            return self;
        };
        self.rotate2D = function rotate2D(thetaZ) {
            var rotationMatrix = self.build2DRotation(thetaZ);
            self.rawData = self.multiply(rotationMatrix).rawData;
            return self;
        };
        self.translate = function translate(dX, dY, dZ) {
            var translationMatrix = self.buildTranslation(dX, dY, dZ);
            self.rawData = self.multiply(translationMatrix).rawData;
            return self;
        };
        self.scale = function scale(sX, sY, sZ) {
            var scalingMatrix = self.buildScaling(sX, sY, sZ);
            self.rawData = self.multiply(scalingMatrix).rawData;
            return self;
        };
        self.identify = function identify() {
            // Initialize the matrix at zero
            self.initZero();
            if(self.numRows != self.numColumns) {
                console.log("MATRIX ERROR: cannot create an identity matrix with an unequal number of columns and rows");
            } else {
                for (var rowNumber = 0; rowNumber < self.numRows; rowNumber++) {
                    self.rawData[rowNumber][rowNumber] = 1;
                };
            }
            return self;
        }
        self.copy = function buildCopy(matrix) {
            self.rawData = [];

            // Iterate through each row
            for (var rowNumber = 0; rowNumber < self.numRows; rowNumber++) {
                var tempRow = []; // Temporary row

                // Iterate through each column
                for (var colNumber = 0; colNumber < self.numColumns; colNumber++) {
                    tempRow.push(matrix.rawData[rowNumber][colNumber]);
                }
                rawData.push(tempRow);
            }
            return self;
        };
        self.transpose = function transpose() {
            self.rawData = self.rawData[0].map(function(col, i) { 
              return self.rawData.map(function(row) { 
                return row[i] 
              })
            });
        };
        self.orthogonize = function orthogonize(near, far, top, bottom, right, left) {
            self.rawData = [
                [2.0/(right-left), 0.0,              0.0,             -(right+left)/(right-left)],
                [0.0,              2.0/(top-bottom), 0.0,             -(top+bottom)/(top-bottom)],
                [0.0,              0.0,              -2.0/(far-near), (far+near)/(far-near)],
                [0.0,              0.0,              0.0,             1.0]
            ];
            return self;
        };
        self.frustivize = function frustivize(near, far, top, bottom, right, left) {
            self.rawData = [
                [2.0/(right-left), 0,                0,             -(right+left)/(right-left)],
                [0,                2.0/(top-bottom), 0,             -(top+bottom)/(top-bottom)],
                [0,                0,                -2/(far-near), -(far+near)/(far-near)],
                [0,                0,                0,             1]
            ];
            return self;
        };

        // Use these for matrix interactions (returns new matrix or scalar)
        self.multiply = function multiply(rightMatrix) { // self is left matrix
            var leftMatrix = self;

            if (leftMatrix.numColumns !== rightMatrix.numRows) {
                console.log("MATRIX ERROR: For matrix multiplication, column number of left matrix and row number of right matrix must be the same");
                return self;
            }

            var productMatrixData = [];
            for (var rowNumber = 0; rowNumber < leftMatrix.numRows; rowNumber++) {
                var tempRow = []
                for (var colNumber = 0; colNumber < rightMatrix.numColumns; colNumber++) {
                    var total = 0;
                    multiplyItems(leftMatrix.getRow(rowNumber), rightMatrix.getColumn(colNumber)).forEach(function(element) {
                        total += element;
                    });
                    tempRow.push(total);
                }
                productMatrixData.push(tempRow);
            }
            return new Matrix(productMatrixData);
        };
        self.dot = function dot(rightMatrix) { // self is left matrix
            var leftMatrix = self;
            if (leftMatrix.numColumns > 1 || rightMatrix.numColumns >1) {
                console.log("MATRIX ERROR: For dot product, column number of both matrices must be 1");
                return -1;
            }
            if (leftMatrix.numRows !== rightMatrix.numRows) {
                console.log("MATRIX ERROR: For dot product, row number of left matrix and row number of right matrix must be the same");
                return -1
            }
            var total = 0;
            multiplyItems(leftMatrix.getColumn(0), rightMatrix.getColumn(0)).forEach(function(element) {
                total += element;
            });
            return total;
        };

        // WebGL
        self.webGLFormat = function webGLFormat() {
            var rawData = [];
            for (var colNumber = 0; colNumber < self.numColumns; colNumber++) {
                for (var rowNumber = 0; rowNumber < self.numRows; rowNumber++) {
                    rawData.push(self.rawData[rowNumber][colNumber]);
                }
            }
            return new Float32Array(rawData);
        }

        // Setup

        // Default is a 4x4 matrix unless a number is provided
        if(args.length == 1 && typeof args[0] == "number") {
            // The user has passed in a number that is for columns and rows
            // Set the given number of rows & columns
            self.numRows = self.numColumns = args[0];
            self.identify();
        } else if(args.length == 2 && typeof args[0] == "number" && typeof args[1] == "number") {
            // The user has passed in a row number and column number
            // Set the given number of rows & columns
            self.numRows = args[0];
            self.numColumns = args[1];
            self.identify();
        } else if(args.length == 1 && args[0].constructor == Array && args[0][0].constructor == Array) {
            // The user has passed in an array of arrays
            // This is the matrix data in [row][column] format
            self.rawData = args[0];
        } else if(args.length >= 1 && args[0].constructor == Array && args[0][0].constructor != Array) {
            // The user has passed in arrays as columns ([col],[col],[col]) -> [[ccc],[ooo],[lll]]
            self.rawData = [];
            for (var rowNumber = 0; rowNumber < args[0].length; rowNumber++) {
                var tempRow = [];
                for (var colNumber = 0; colNumber < args.length; colNumber++) {
                    tempRow.push(args[colNumber][rowNumber]);
                };
                self.rawData.push(tempRow);
            };
        } else if(args.length >= 1 && args[0].isMatrix == true) {
            self.copy(args[0]);
        } else {
            self.identify();
        }
    };
});