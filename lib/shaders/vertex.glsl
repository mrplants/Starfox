attribute vec4 vertexPosition;
attribute vec3 vertexNormal;

varying vec3 vertexNormalF;
varying vec3 modelCoordinateF;

uniform mat4 projectionTransform;
uniform mat4 worldTransform;
uniform mat4 modelTransform;

void main() {

  // Transform the normal into world coordinates. Send it to the fragment shader.
  vertexNormalF = normalize(worldTransform * modelTransform * vec4(vertexNormal,0.0)).xyz;

  // Send the vertex coordinates to the fragment shader
  modelCoordinateF = (worldTransform * modelTransform * vertexPosition).xyz;

  // Transform from model coordinates into world coordinates and then eye coordinates.
  gl_Position = projectionTransform * worldTransform * modelTransform * vertexPosition;
}