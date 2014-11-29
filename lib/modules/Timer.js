define([], function() {
    'use strict';
    return function() {
        //public variables
        var self = this;

        //private variables;
        var mine = {};
        mine.on = false;

        //public methods
        self.start = function start() {
            if (!mine.on) {
                mine.startTime = +new Date();
                mine.lastLapTime = +new Date();
            } else if (mine.stopped) {
                mine.startTime = (mine.startTime - (+new Date() - mine.stopTime));
            }
            mine.stopped = false;
            mine.on = true;
        };
        self.stop = function stop() {
            mine.stopTime = +new Date();
            mine.stopped = true;
        };
        self.time = function time() {
            if (!mine.on) {
                return 0;
            }
            if (mine.stopped) {
                return (mine.startTime - mine.stopTime);
            }
            return (+new Date() - mine.startTime);
        };
        self.reset = function reset() {
            mine.on = false;
            mine.stopped = true;
        };
        self.lap = function lap() {
            var returnableTime = +new Date() - mine.lastLapTime;
            mine.lastLapTime = +new Date();
            return returnableTime;
        };
    };
});