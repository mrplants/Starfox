define(['text!lib/constants/baseURL.const'], function(baseURL) {
    'use strict';
	return function mapParser(mapID, callback) {
        var args = Array.prototype.slice.call(arguments);
        // Public variables
        var self = this;

        // Private variables
        var mine = {
            origin : baseURL
        };

        // Private:
        /*
        *
        */

        function resetData() {
            self.length = 0;
            self.width = 0;
            self.height = 0;
            self.models = [];
        }

        function mapLoaded() {
            // Iterate over every line in the file
            var mapFileLines = this.responseText.split('\n');

            var collectibles = [];
            var obstacles = [];
            var enemies = [];

            var activeArray = undefined;

            var currentMesh = undefined;

            var parsedLength = false;
            var parsedWidthHeight = false;

            for (var i = 0; i < mapFileLines.length; i++) {
                var line = mapFileLines[i];

                // Trim comments
                if (line.indexOf('#') !== -1) {
                    line = line.slice(0,line.search('#'));
                }
                line = line.trim();
                if (line == '') {
                    continue;
                }
                
                if (!parsedLength) {
                    self.length = parseFloat(line);
                    parsedLength = true;
                } else if (!parsedWidthHeight) {
                    var size = line.match(/\S+/g);
                    self.width = parseFloat(size[0]);
                    self.height = parseFloat(size[1]);
                    parsedWidthHeight = true;
                } else if (activeArray != undefined) {

                    if (currentMesh == undefined) {
                        if (line == '}') {
                            activeArray = undefined;
                            continue;
                        }
                        line = line.slice(0, line.search('{')).trim();
                        currentMesh = line;
                    } else {

                        if (line == '}') {
                            currentMesh = undefined;
                            continue;
                        }

                        var objectLocation = line.match(/\S+/g);
                        activeArray.push({
                            mesh : currentMesh,
                            location : {
                                x : parseFloat(objectLocation[0]),
                                y : parseFloat(objectLocation[1]),
                                z : parseFloat(objectLocation[2])
                            }
                        });
                    }
                } else {
                    line = line.slice(0, line.search('{')).trim();
                    switch (line) {
                        case 'enemies':
                            activeArray = enemies;
                            break;
                        case 'collectables':
                        case 'collectibles':
                            activeArray = collectibles;
                            break;
                        case 'obstacles':
                            activeArray = obstacles;
                            break;
                    }
                }
            }

            collectibles.forEach(function(element) {
                self.models.push({
                    mesh : element.mesh,
                    location : element.location,
                    keyword : 'collectibles'
                });
            });
            obstacles.forEach(function(element) {
                self.models.push({
                    mesh : element.mesh,
                    location : element.location,
                    keyword : 'obstacles'
                });
            });
            enemies.forEach(function(element) {
                self.models.push({
                    mesh : element.mesh,
                    location : element.location,
                    keyword : 'enemies'
                });
            });

            callback(self);
        }

        // Public:
        /*
        *
        */

        // Setup
        resetData();
        self.mapID = mapID;

        // Send a XMLHttpRequest to get the map file
        var mapRequest = new XMLHttpRequest();
        mapRequest.onload = mapLoaded;
        mapRequest.open('GET', mine.origin + 'game/maps/' + self.mapID + '.map', true);
        mapRequest.send();
    };
});