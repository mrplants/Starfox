attribute vec4 vertexPosition;
attribute vec3 vertexNormal;

varying vec3 vertexNormalF;
varying vec3 modelCoordinateF;

uniform mat4 perspectiveMatrix;
uniform mat4 modelViewMatrix;

void main() {

  // Transform the normal into world coordinates. Send it to the fragment shader.
  vertexNormalF = normalize(perspectiveMatrix * modelViewMatrix * vec4(vertexNormal,0.0)).xyz;

  // Send the vertex coordinates to the fragment shader
  modelCoordinateF = (perspectiveMatrix * modelViewMatrix * vertexPosition).xyz;

  // Transform from model coordinates into world coordinates and then eye coordinates.
  gl_Position = perspectiveMatrix * modelViewMatrix * vertexPosition;
}