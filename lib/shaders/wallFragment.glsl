precision mediump float;

uniform sampler2D wallTexture;

varying vec2 texCoordF;

void main() {
	// gl_FragColor = vec4(1.0,0.0,0.0,1.0);
	gl_FragColor = texture2D(wallTexture, texCoordF);
}