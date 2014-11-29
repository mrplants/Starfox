precision mediump float;

uniform vec3 ambientProduct;
uniform float shininess;
uniform vec3 pointLightPosition;
uniform vec4 baseColor;

varying vec3 vertexNormalF;
varying vec3 modelCoordinateF;

void main() {
  float diffuse, specular;
  vec3 ambient;

  vec3 eyePosition = vec3(0.0, 0.0, 1.0);
  vec3 reflection = reflect(pointLightPosition, normalize(vertexNormalF));

  ambient = ambientProduct;
  diffuse = max(dot(pointLightPosition, normalize(vertexNormalF)), 0.0);
  specular = pow(max(dot(reflection, eyePosition), 0.0), shininess);

  vec4 color = baseColor * vec4(specular + diffuse + ambient, 1.0);
  gl_FragColor = color;
}