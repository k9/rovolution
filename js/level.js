(function() {

var $$ = game.level = {
    blockTypes: {
        blank: 2,
        metal: 1,
        turret: 3
    },

    blockCodes: {
        "r0g0b0": 1,
        "r255g0b0": 3,
        "r255g255b255": 2
    },

    create: function(data, columns, rows, callback) {
        var level = {
            blocks: [],
            meshData: { vertices: [], triangles: [], types: [], coords: [] }
        }

        for(var i = 0; i < columns; i++)
            level.blocks.push([]);

        for(var i = 0; i < data.length / 4; i++) {
            var code = "r" + data[i * 4] + "g" + data[i * 4 + 1] + "b" + data[i * 4 + 2];
            var row = rows - (1 + Math.floor(i / columns));
            level.blocks[i % columns][row] = game.level.blockCodes[code];
        }

        for(var y = 0; y < rows; y++)
            for(var x = 0; x < columns; x++)
                game.level.addBlock(level, x, y, level.blocks[x][y]);

        return level;
    },

    addBlock: function(level, x, y, type) {
        level.meshData.vertices.push([x,y,0], [x+1,y,0], [x,y+1,0], [x+1,y+1,0]);
        var i = level.meshData.triangles.length / 2 * 4;
        level.meshData.triangles.push([i,i+1,i+2], [i+1,i+2,i+3]);
        level.meshData.coords.push([0,0], [1,0], [0,1], [1,1]);
        level.meshData.types.push(type, type, type, type);
    },

    makeMesh: function(level) {
        var mesh = new GL.Mesh({ coords: true });
        mesh.vertices = level.meshData.vertices;
        mesh.triangles = level.meshData.triangles;
        mesh.coords = level.meshData.coords;
        mesh.addVertexBuffer('types', 'type');
        mesh.types = level.meshData.types;
        mesh.compile();
        return mesh;
    },

    tile: function(entity) { 
        return { x: Math.floor(Math.floor(entity.x) / 16), y: Math.floor(Math.floor(entity.y) / 16) }; 
    },

    offset: function(entity) { 
        return { x: Math.floor(entity.x) % 16, y: Math.floor(entity.y) % 16 };
    },

    block: function(entity, x, y) { 
        return game.currentLevel.blocks[$$.tile(entity).x + x][$$.tile(entity).y + y]; 
    },

    filled: function(entity, x, y) { return $$.block(entity, x, y) != $$.blockTypes.blank; },

    collisionLeft: function(entity, x, y) { 
        return $$.offset(entity).x != 0 && ($$.filled(entity, 0, 0) || ($$.filled(entity, 0, 1) && $$.offset(entity).y > 0)); 
    },

    collisionRight: function(entity, x, y) {
        return $$.offset(entity).x != 0 && ($$.filled(entity, 1, 0) || ($$.filled(entity, 1, 1) && $$.offset(entity).y > 0));
    },

    collisionBottom: function(entity, x, y) {
        return $$.offset(entity).y != 0 && ($$.filled(entity, 0, 0) || ($$.filled(entity, 1, 0) && $$.offset(entity).x > 0));
    },

    collisionTop: function(entity, x, y) {
        return $$.offset(entity).y != 0 && ($$.filled(entity, 0, 1) || ($$.filled(entity, 1, 1) && $$.offset(entity).x > 0));
    },

    touchingLeft: function(entity, x, y) {
        return $$.offset(entity).x == 0 && ($$.filled(entity, -1, 0) || ($$.filled(entity, -1, 1) && $$.offset(entity).y > 0));
    },

    touchingRight: function(entity, x, y) {
        return $$.offset(entity).x == 0 && ($$.filled(entity, 1, 0) || ($$.filled(entity, 1, 1) && $$.offset(entity).y > 0));
    },

    touchingBottom: function(entity, x, y) {
        return $$.offset(entity).y == 0 && ($$.filled(entity, 0, -1) || ($$.filled(entity, 1, -1) && $$.offset(entity).x > 0));
    },

    touchingTop: function(entity, x, y) {
        return $$.offset(entity).y == 0 && ($$.filled(entity, 0, 1) || ($$.filled(entity, 1, 1) && $$.offset(entity).x > 0));
    }
};

})();