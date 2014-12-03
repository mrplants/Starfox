define(['text!lib/constants/baseURL.const'], function(baseURL) {
  'use strict';
  return function() {
    // Public
    var self = this;

    // Private variables
    var mine = {};
    var callback;

    function resetData() {
      mine = {
        faces : [],
        smoothShading : false,
        materialName : "",
        materialDefinitionFilename : "",
        groupName : ""
      };
      self.vertices = []; // X,Y,Z,W
      self.vertexNormals = []; // X,Y,Z
      self.textureCoordinates = []; // U,V,W
      self.diffuseTextureMapName = '';
      self.origin = baseURL;
      self.location = '';
      self.ambientColor = [];
      self.specularColor = [];
      self.diffuseColor = [];
      self.specularWeight = 0.0;
      self.hasMtl = false;
    }

    // Private methods
    function loadNewLocation() {
      requestObjFile();
    }

    function requestObjFile() {
      // Send a XMLHttpRequest to get the obj file
      var objRequest = new XMLHttpRequest();
      objRequest.onload = objLoaded;
      objRequest.open('GET', self.origin + '3D/' + self.location + '/' + self.location + '.obj', true);
      objRequest.send();
    }

    function requestMtlFile() {
      // Send a XMLHttpRequest to get the obj file
      var objRequest = new XMLHttpRequest();
      objRequest.onload = mtlLoaded;
      objRequest.open('GET', self.origin + '3D/' + self.location + '/' + self.location + '.mtl', true);
      objRequest.send();
    }

    function objLoaded() {
      // Iterate over every line in the file
      var objFileData = this.responseText.split('\n');
      var tempVertices = [];
      var tempNormals = [];
      var tempTextureCoordinates = [];

      for (var i = 0; i < objFileData.length; i++) {
        var line = objFileData[i];

        // Trim comments
        if (line.indexOf('#') !== -1) {
          line = line.slice(0,line.search('#'));
        }
        if (line.trim() == '') {
          continue;
        }
        var currentLine = line.match(/\S+/g);
        var token = currentLine.shift();
        switch (token) {
          case 'v': // Vertices
            // x,y,z[,w=1]
            if (currentLine.length == 3) {
              currentLine.push(1.0);
            }
            var vertex = currentLine.map(function(element) {
              return parseFloat(element);
            });
            tempVertices.push(vertex)
            break;
          case 'vn': // Vertex Normals
            // x,y,z
            var normal = currentLine.map(function(element) {
              return parseFloat(element);
            });
            tempNormals.push(normal);
            break;
          case 'vt': // Texture Vertices
            // u,v[,w=0]
            if (currentLine.length == 2) {
              currentLine.push(0.0);
            }
            var texCoord = currentLine.map(function(element) {
              return parseFloat(element);
            });
            tempTextureCoordinates.push(texCoord);
            break;
          case 'f':
            for (var j = 0; j < currentLine.length; j++) {
              var combinedVertexIndices = currentLine[j].split('/');
              mine.faces.push(combinedVertexIndices);
            };
            break;
          case 'mtllib': // Specify the name of the material definition file
            mine.materialDefinitionFilename = currentLine[0];
            break;
          case 'g': // Define group name
            mine.groupName = currentLine[0];
            break;
          case 'usemtl': // Specify material name defined in the mtl file
            mine.materialName = currentLine[0];
            break;
          case 's': // Specify whether or not to use smooth shading
            if (currentLine[1] === '1') {
              mine.smoothShading = false;
            } else {
              mine.smoothShading = true;
            }
            break;
          default:
            console.log("ObjParser: unrecognized obj key '" + currentLine[0] + "'");
            break;
        }
      }
      // Now put the data in a form which OpenGL can use
      var tempFlattenedVertices = [];
      var tempFlattenedNormals = [];
      var tempFlattenedTexCoords = [];
      for (var i = 0; i < mine.faces.length; i++) {
        tempVertices[mine.faces[i][0]-1].forEach(function(element) {
          tempFlattenedVertices.push(element);
        });
        if (mine.faces[i].length > 1 && mine.faces[i][1] !== NaN && tempTextureCoordinates.length >= mine.faces[i][1] && mine.faces[i][1] > 0) {
          tempTextureCoordinates[mine.faces[i][1]-1].forEach(function(element) {
            tempFlattenedTexCoords.push(element);
          });
        }
        if (mine.faces[i]. length > 2 && mine.faces[i][2] !== NaN && tempNormals.length >= mine.faces[i][2] && mine.faces[i][2] > 0) {
          tempNormals[mine.faces[i][2]-1].forEach(function(element) {
            tempFlattenedNormals.push(element);
          });
        }
      }
      // Store them in the correct type of Array
      self.vertices = new Float32Array(tempFlattenedVertices);
      self.vertexNormals = new Float32Array(tempFlattenedNormals);
      self.textureCoordinates = new Float32Array(tempFlattenedTexCoords);

      calculateMaxesMins();

      if (mine.materialDefinitionFilename !== "") {
        requestMtlFile();
        self.hasMtl = true;
      } else {
        if (callback) {
          self.hasMtl = false;
          callback();
        }
      }
    }

    function mtlLoaded() {
      // Intialize a variable to know in which state we are parsing
      var parsingMtl = false;
      // Iterate over every line in the file
      var objFileData = this.responseText.split('\n');
      for (var i = 0; i < objFileData.length; i++) {
        var line = objFileData[i];

        // Trim comments
        if (line.indexOf('#') !== -1) {
          line = line.slice(0,line.search('#'));
        }
        if (line.trim() == '') {
          continue;
        }

        var currentLine = line.split(' ');
        if (parsingMtl) {
          switch (currentLine[0]) {
            case "newmtl":
              // repeat this line in the other state
              parsingMtl = false;
              i--;
              continue;
              break;
            case "Ka": // ambient
              self.ambientColor.push(Number(currentLine[1])); // R
              self.ambientColor.push(Number(currentLine[2])); // G
              self.ambientColor.push(Number(currentLine[3])); // B
              break;
            case "Kd": // diffuse
              self.diffuseColor.push(Number(currentLine[1])); // R
              self.diffuseColor.push(Number(currentLine[2])); // G
              self.diffuseColor.push(Number(currentLine[3])); // B
              break;
            case "Ks": // specular
              self.specularColor.push(Number(currentLine[1])); // R
              self.specularColor.push(Number(currentLine[2])); // G
              self.specularColor.push(Number(currentLine[3])); // B
              break;
            case "Ns": // specular weight
              self.specularWeight = Number(currentLine[1]); 
              break;
            case "map_Kd": // specular weight
              self.diffuseTextureMapName = currentLine[1]; 
              break;
            default:
              break;
          }
        } else {
          switch (currentLine[0]) {
            case "newmtl":
              if (currentLine[1] === mine.materialName) {
                parsingMtl = true;
              }
              break;
            default:
              break;
          }
        }
      }
      if (callback) {
        callback();
      }
    }

    function calculateMaxesMins() {
      if (self.vertices.length < 4) {return}
      self.maxes = {
        x:self.vertices[0],
        y:self.vertices[1],
        z:self.vertices[2]
      };
      self.mins = {
        x:self.vertices[0],
        y:self.vertices[1],
        z:self.vertices[2]
      };

      for (var vertexIndex = 0; vertexIndex < self.vertices.length; vertexIndex+=4) {
        var X = self.vertices[vertexIndex + 0];
        var Y = self.vertices[vertexIndex + 1];
        var Z = self.vertices[vertexIndex + 2];

        if (X > self.maxes.x) {self.maxes.x = X}
        if (Y > self.maxes.y) {self.maxes.y = Y}
        if (Z > self.maxes.z) {self.maxes.z = Z}

        if (X < self.mins.x) {self.mins.x = X}
        if (Y < self.mins.y) {self.mins.y = Y}
        if (Z < self.mins.z) {self.mins.z = Z}
      }
    }

    // Public methods
    self.setLocation = function setLocation(location, thisCallback) {
      if (thisCallback !== undefined) {
        callback = thisCallback;
      }
      resetData();
      self.location = location;
      loadNewLocation();
    };

    if (arguments[0] !== undefined) {
      self.setLocation(arguments[0], arguments[1]);
    }
  }
});