precision mediump float;

uniform vec3 ambientProduct;
uniform float shininess;
uniform vec3 pointLightPosition;
uniform vec4 baseColor;

varying vec3 vertexNormalF;
varying vec3 modelCoordinateF;

void main() {
  // float diffuse, specular;
  // vec3 ambient;

  vec3 eyePosition = vec3(0.0, 0.0, 0.0);

  // vec3 lightVector = normalize(pointLightPosition - modelCoordinateF);

  // vec3 reflection = reflect(lightVector, normalize(vertexNormalF));

  // ambient = ambientProduct;
  // diffuse = max(dot(pointLightPosition, normalize(vertexNormalF)), 0.0);
  // specular = pow(max(dot(reflection, eyePosition), 0.0), shininess);

  // vec4 color = baseColor * vec4(specular + diffuse + ambient, 1.0);
  // gl_FragColor = color + vec4(0.3, 0.3, 0.3, 0.0);

  	vec4 ambient = vec4(ambientProduct, 1.0);
  	vec4 diffuse = vec4(0.3, 0.3, 0.3, 1.0);
  	vec4 specular = vec4(0.2, 0.2, 0.2, 1.0);

	vec3 L = normalize(pointLightPosition.xyz - modelCoordinateF);   
	vec3 E = normalize(eyePosition - modelCoordinateF); // we are in Eye Coordinates, so EyePos is (0,0,0)  
	vec3 R = normalize(-reflect(L,vertexNormalF));  

	//calculate Ambient Term:  
	vec4 Iamb = ambient;

	//calculate Diffuse Term:  
	vec4 Idiff = max(dot(vertexNormalF,L), 0.0) * diffuse;
	Idiff = clamp(Idiff, 0.0, 1.0);     

	// calculate Specular Term:
	vec4 Ispec = pow(max(dot(R,E),0.0),shininess) * specular;
	Ispec = clamp(Ispec, 0.0, 1.0); 
	// write Total Color:  
	gl_FragColor = baseColor + Iamb + Idiff + Ispec;     
}