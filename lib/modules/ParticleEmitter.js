define(['Model', 'Matrix'], function(Model, Matrix) {
    'use strict';
	return function ParticleEmitter(newParticleCallback, drawParticleCallback) {
        var args = Array.prototype.slice.call(arguments);
        // Public variables
        var self = this;
        self.center = {
            x:0,
            y:0
        };
        self.maxRadius = Math.sqrt(2);
        self.particles = [];
        self.particleSpeed = 0.02;
        self.particleFrequency = 30; // particles per second

        // Private variables
        var mine = {
            isDrawing : false,
            intervalID : 0
        };

        // Private:
        /*
        *
        */
        function emitParticle() {
            // create a new particle
            var angleEmitted = Math.random() * 2 * Math.PI;
            var metaData = {};
            var particleModel = newParticleCallback(metaData);
            self.particles.push({
                radius : 0,
                angle  : angleEmitted,
                model  : particleModel,
                metaData : metaData
            });
        }

        // Public:
        /*
        *
        */
        self.startEmitting = function startEmitting() {
            mine.intervalID = window.setInterval(emitParticle, 1000 / self.particleFrequency);                
        };
        self.stopEmitting = function stopEmitting() {
            window.clearInterval(mine.intervalID);
        };
        self.draw = function draw() {
            var removalIndices = [];
            for (var i = 0; i < self.particles.length; i++) {
                var particle = self.particles[i];
                particle.radius += self.particleSpeed;
                if (particle.radius > self.maxRadius) {
                    removalIndices.push(i);
                }
            }
            for (var i = 0; i < removalIndices.length; i++) {
                self.particles.splice(removalIndices[i], 1);
            }
            for (var i = 0; i < self.particles.length; i++) {
                var particle = self.particles[i];
                drawParticleCallback(particle.model, particle.radius * Math.cos(particle.angle), particle.radius * Math.sin(particle.angle), particle.radius, particle.metaData); // (MODEL, X, Y, RADIUS. MATRIX)
            }
        };

        // Setup

    };
});