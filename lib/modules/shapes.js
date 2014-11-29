define([], function() {
    'use strict';
    return {
        circle : function circle(x, y, radius, ctx) {
            return ctx.arc(x, y, radius, 0, 2 * Math.PI);
        }
    };
});