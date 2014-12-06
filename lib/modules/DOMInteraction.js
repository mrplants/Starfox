define(['jquery'], function(jquery) {
    'use strict';
	return function DOMInteraction() {
        var args = Array.prototype.slice.call(arguments);
        //public variables
        var self = this;
        self.mouseRotation = {x:0, y:0};
        self.curYPos = 0;
        self.curXPos = 0;
        self.curDown = 0;

        //private variables
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

        // Setup

        /*
        *   DOM resizing events
        */



        /*
        *   GESTURE SETUP
        */

        $(window).mousemove(function(m){
            if(self.curDown === true){
                self.mouseRotation.x += (self.curXPos - m.pageX) * 0.005;
                self.mouseRotation.y += (self.curYPos - m.pageY) * 0.005;
                self.curXPos = m.pageX;
                self.curYPos = m.pageY;
            }
        });
          
        $(window).mousedown(function(m){
            self.curDown = true;
            self.curYPos = m.pageY;
            self.curXPos = m.pageX;
        });
          
        $(window).mouseup(function(){
            self.curDown = false;
        });
    };
});