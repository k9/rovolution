(function() {

var $$ = game.rover = {
    parts: {
        "cannon": 5,
        "chassis": 3,
        "wheels": 0,
    },

    create: function(data, columns, rows, callback) {
        var rover = {
            health: 100,
            x: 20, 
            y: 20,
            xSpeed: 0,
            ySpeed: 0,
            acceleration: 0.005,
            poised: false,
            jump: 1.5,
            xSpeedMax: 0.5,
            ySpeedMax: 5,
            blocks: [],
            cannonRight: true,
            lastFire: 0,
            meshData: { vertices: [], triangles: [], types: [], coords: [] }
        }

        var i = 0;
        for(var key in game.rover.parts)
            game.rover.addPart(rover, i++, game.rover.parts[key]);

        return rover;
    },

    update: function(rover, elapsed) {
        rover.xSpeed = absClamp(rover.xSpeed, 0.0001, (rover.xSpeedMax * (game.currentGen.speed + 1) / 6));
        rover.x += rover.xSpeed;

        if(game.keysDown.right) rover.cannonRight = true;
        if(game.keysDown.left) rover.cannonRight = false;

        rover.ySpeed = absClamp(rover.ySpeed, 0.0001, rover.ySpeedMax);
        rover.y += rover.ySpeed;
        
        if(Math.abs(rover.xSpeed) > Math.abs(rover.ySpeed)) { $$.fixX(rover); $$.fixY(rover); }
        else { $$.fixY(rover); $$.fixX(rover); }
        
        if(game.keysDown.right && !game.level.touchingRight(rover))
            rover.xSpeed += rover.acceleration;
        else if(game.keysDown.left && !game.level.touchingLeft(rover))
            rover.xSpeed -= rover.acceleration;
        else
            rover.xSpeed *= 0.99;

        if(!game.level.touchingBottom(rover))
            rover.ySpeed -= 0.01;

        if(rover.poised && !game.keysDown.down && game.level.touchingBottom(rover) && !game.level.touchingTop(rover))
            rover.ySpeed += (rover.jump * (game.currentGen.jump + 1) / 6);

        rover.poised = game.keysDown.down;

        var cooldownTime = 1.2 / (game.currentGen.blaster + 1);
        if(elapsed - rover.lastFire > cooldownTime  && game.keysDown.space) {
            rover.lastFire = elapsed;
            if(rover.cannonRight)
                game.newProjectile(rover.x + 8, rover.y + 4, 1.5, false);
            else
                game.newProjectile(rover.x - 8, rover.y + 4, -1.5, false);
        }
    },

    fixX: function(rover) {
        if(Math.abs(rover.xSpeed) > 0) {
            if(game.level.collisionLeft(rover) && !game.level.collisionRight(rover)) { 
                rover.xSpeed = 0; 
                rover.x = (game.level.tile(rover).x + 1) * 16; 
            }
            if(game.level.collisionRight(rover) && !game.level.collisionLeft(rover)) { 
                rover.xSpeed = 0; 
                rover.x = game.level.tile(rover).x * 16; 
            }
        }
    },

    fixY: function(rover) {
        if(Math.abs(rover.ySpeed) > 0) {
            if(game.level.collisionBottom(rover) && !game.level.collisionTop(rover)) { 
                rover.ySpeed = 0; 
                rover.y = (game.level.tile(rover).y + 1) * 16; 
            }
            if(game.level.collisionTop(rover) && !game.level.collisionBottom(rover)) { 
                rover.ySpeed = 0; 
                rover.y = game.level.tile(rover).y * 16; 
            }
        }
    },

    addPart: function(rover, layer, type) {
        rover.meshData.vertices.push([0,0,-layer], [1,0,-layer], [0,1,-layer], [1,1,-layer]);
        var i = rover.meshData.triangles.length / 2 * 4;
        rover.meshData.triangles.push([i,i+1,i+2], [i+1,i+2,i+3]);
        rover.meshData.coords.push([0,0], [1,0], [0,1], [1,1]);
        rover.meshData.types.push(type, type, type, type);
    },

    offsetTypes: function(rover, offsets) {
        rover.meshData.types = [];
        var i = 0;
        for(var key in game.rover.parts) {
            var type = game.rover.parts[key] + offsets[i];
            rover.meshData.types.push(type, type, type, type);
            i++;
        }     
    },

    makeMesh: function(rover) {
        var mesh = new GL.Mesh({ coords: true });
        mesh.vertices = rover.meshData.vertices;
        mesh.triangles = rover.meshData.triangles;
        mesh.coords = rover.meshData.coords;
        mesh.addVertexBuffer('types', 'type');
        mesh.types = rover.meshData.types;
        mesh.compile();
        return mesh;
    }
};

})();