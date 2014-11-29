attribute vec4 vertex;
attribute vec2 texCoord;

varying vec2 texCoordF;

uniform float zoomFactor;

void main() {
	gl_Position = vertex;
	mat2 textureZoomingMatrix = mat2(
		vec2(zoomFactor, 0),
		vec2(0, zoomFactor)
	);
	texCoordF = textureZoomingMatrix * texCoord;
}