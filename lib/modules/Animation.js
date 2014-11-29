define(['jquery', 'underscore', 'lib/modules/Timer'], function(underscore, inherit, Timer) {
    'use strict';
	return function() {
        var args = Array.prototype.slice.call(arguments);
        //public variables
        var self = this;

        //private variables
        var mine = {
            frameRate : 60,
            callback : false,
            context : false,
            drawInterval : false,
            frameTimer : new Timer(),
            lastFrameDuration : 0,
            frameNumber : false,
            isAnimating : false
        };

        //private functions
        function draw() {
            mine.lastFrameDuration = mine.frameTimer.lap();
            mine.frameNumber++;
            mine.callback(mine.frameTimer.time(), mine.frameNumber); //draw stuff
        }

        function requestAnimFrame() {
            if (!mine.callback) { //make sure it's set up
                throw 'ANIMATION: no callback set';
            }
            draw();
            return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame;
        }

        function reset() {
            mine.frameTimer.reset();
            mine.frameTimer.start();
        };

        //public functions :
        /*
        *
        * void setCallback(callback) - Set a callback function to be called each frame
        *
        * void setFrameRate(FPS) - Set the frame rate in frames-per-second
        *
        * void startAnimation() - Start the animation
        *
        * void stopAnimation() - Stop the animation
        *
        * number currentFrameRate() - Returns the current instantaneous frame rate (based on the last frame)
        *
        * number averageFrameRate() - Returns the average frame rate since the last time 'void setFrameRate(FPS)' was called
        *
        */

        self.setCallback = function setCallback(callback) {
            mine.callback = callback;
        };

        self.setFrameRate = function setFrameRate(FPS) { //in FPS
            mine.frameRate = FPS;
            reset();
            if (mine.isAnimating) {
                self.stopAnimation();
                self.startAnimation();
            }
        }

        self.startAnimation = function startAnimation() {
            mine.isAnimating = true;
            mine.frameTimer.start();
            mine.drawInterval = window.setInterval(requestAnimFrame, 1000 / mine.frameRate); // 60 Hz requested framerate (not including time to draw)
        };

        self.stopAnimation = function stopAnimation() {
            mine.isAnimating = false;
            window.clearInterval(mine.drawInterval);
        };

        self.currentFrameRate = function currentFrameRate() {
            if (mine.lastFrameDuration === 0) return 0;
            return (1000 / mine.lastFrameDuration);
        };

        self.averageFrameRate = function averageFrameRate() {
            var msElapsed = mine.frameTimer.time();
            if (msElapsed === 0) return 0;
            return (mine.frameNumber * 1000 / msElapsed);
        };
    };
});