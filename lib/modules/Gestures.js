define(['jquery', 'Matrix'], function(jquery, Matrix) {
    'use strict';
	return function Gesture() {
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
        */

        // Setup 
       $(window).mousemove(function(m){
            //if(self.curDown === true){
                self.curXPos = m.pageX;
                self.curYPos = m.pageY;
            //}
        });
/*          
        $(window).mousedown(function(m){
            self.curDown = true;
            self.curYPos = m.pageY;
            self.curXPos = m.pageX;
        });
          
        $(window).mouseup(function(){
            self.curDown = false;
        });
*/
    };
});