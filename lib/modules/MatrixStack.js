define(['Matrix'], function(Matrix) {
    'use strict';
	return function MatrixStack() {
        var args = Array.prototype.slice.call(arguments);
        //public variables
        var self = this;
        self.numRows = 4;
        self.numColumns = 4

        //private variables
        var mine = {
            stack : []
        };

        // Private:
        /*
        *
        */

        // Public:
        /*
        *
        */

        // Use these for matrix stack manipulations
        self.push = function push(matrix) {
            if (mine.stack.length == 0) {
                self.numRows = matrix.numRows;
                self.numColumns = matrix.numColumns;
            } else if (self.numColumns !== matrix.numColumns || self.numRows !== matrix.numRows) {
                console.log("MatrixStack ERROR: all matrices in the stack must have the same number of rows and columns");
                return;
            }
            mine.stack.push(matrix);
        };
        self.pop = function pop(matrix) {
            return mine.stack.pop();
        };
        self.getProduct = function getProduct() {
            var product = new Matrix(self.numRows, self.numColumns);
            for (var i = mine.stack.length - 1; i >= 0; i--) {
                product = product.multiply(mine.stack[i]);
            };
            // for (var index = 0; index < mine.stack.length; index++) {
            //     product = product.multiply(mine.stack[index]);
            // };
            return product;
        };

        // Setup
        if (args[0] !== undefined && args[0].isMatrix == true) {
            self.push(args[0]);
        }
    };
});