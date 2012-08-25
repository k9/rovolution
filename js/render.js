var gl = GL.create();
$("#canvasContainer").append(gl.canvas);
gl.canvas.width= 768;
gl.canvas.height = 576;

var blockTiles = GL.Texture.fromURL('tiles.png', { magFilter: gl.NEAREST, minFilter: gl.NEAREST });
var roverTiles = GL.Texture.fromURL('rover.png', { magFilter: gl.NEAREST, minFilter: gl.NEAREST });

var tileShader = new GL.Shader('\
    uniform float tilesWidth;\
    uniform float x;\
    uniform float y;\
    attribute float type;\
    varying vec2 coord;\
    void main() {\
        float offset = 1.0 / tilesWidth;\
        float start = type * 18.0 / tilesWidth + offset;\
        float width = gl_TexCoord.x * 16.0 / tilesWidth;\
        coord = vec2(start + width, gl_TexCoord.y);\
        vec4 pos = gl_Vertex + vec4(x / 16.0, y / 16.0, 0, 0);\
        gl_Position = gl_ModelViewProjectionMatrix * pos;\
    }\
', '\
    varying vec2 coord;\
    uniform sampler2D texture;\
    void main() {\
        gl_FragColor = texture2D(texture, coord);\
    }\
');

gl.ondraw = function() {
    gl.clearColor(0,0,0,0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.loadIdentity();
    gl.ortho(0, 24, 0, 18, 0, 100); 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.translate(0, 0, -5);

    blockTiles.bind(0);
    tileShader.uniforms({ 
        texture: 0, 
        tilesWidth: 180,
        x: 0,
        y: 0
    }).draw(game.levelMesh);

    var wheelOffset = 0;
    if(game.keysDown.right) wheelOffset = 1;
    if(game.keysDown.left) wheelOffset = 2;

    var chassisOffset = 0;
    if(game.keysDown.down) chassisOffset = 1;

    game.rover.offsetTypes(game.theRover, [0, chassisOffset, wheelOffset]);
    game.theRoverMesh = game.rover.makeMesh(game.theRover);

    roverTiles.bind(0);
    tileShader.uniforms({ 
        texture: 0, 
        tilesWidth: 180,
        x: game.theRover.x,
        y: game.theRover.y
    }).draw(game.theRoverMesh);
};