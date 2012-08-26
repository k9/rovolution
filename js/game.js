(function() {

var $$ = window.game = {
    levelMesh: {}, 
    currentLevel: {},
    projectiles: [],
    turrets: [],

    genTime: 5,
    generation: 0,

    currentGen: {
        speed: 3,
        jump: 3,
        blaster: 2
    },

    nextGen: {
        speed: 3,
        jump: 3,
        blaster: 2        
    },

    keysDown: {},
    keys: { left: 37, right: 39, down: 40, A: 65, S: 83, D: 68, F: 70, space: 32 },

    keyChange: function(code, pressed) {
        if(code == $$.keys.right || code == this.keys.D)
            game.keysDown.right = pressed; 
        if(code == $$.keys.left || code == this.keys.A)
            game.keysDown.left = pressed;
        if(code == $$.keys.down || code == this.keys.S)
            game.keysDown.down = pressed;
        if(code == $$.keys.space)
            game.keysDown.space = pressed;
    },

    newProjectile: function(x, y, speed, enemy) {
        var p = game.projectile.create(x, y, speed, 0, enemy);
        p.mesh = game.projectile.makeMesh(p);

        for(var i = 0; i < game.projectiles.length; i++) {
            if(!game.projectiles[i].alive) {
                game.projectiles[i] = p;
                return;
            }
        }

        game.projectiles.push(p);
    },

    start: function() {
        loadImage("level1.png", function(img) {
            var data = getImageData(img);
            game.currentLevel = game.level.create(data.data, data.width, data.height);
            game.levelMesh = game.level.makeMesh(game.currentLevel);

            for(var x = 0; x < data.width; x++)
                for(var y = 0; y < data.height; y++)
                    if(game.currentLevel.blocks[x][y] == game.level.blockTypes.turret)
                        game.turrets.push(game.turret.create(x * 16, y * 16));

            game.theRover = game.rover.create();
            game.theRoverMesh = game.rover.makeMesh(game.theRover);

            $(document).on({
                keydown: function(e) { game.keyChange(e.keyCode, true); },
                keyup: function(e) { game.keyChange(e.keyCode, false); }
            });

            gl.animate();
        });

        gl.onupdate = game.tick;
    },

    elapsed: 0,
    leftOver: 0,
    lastPct: 0,
    tick: function(seconds) {
        game.elapsed += seconds;

        var milliseconds = seconds * 1000 + game.leftOver;
        while(milliseconds > 5) {
            game.realTick();
            milliseconds -= 5;
        }
        game.leftOver = milliseconds;

        if(game.projectiles.length > 0)
            game.projectileMesh = game.projectile.makeMesh(game.projectiles);

        if(game.turrets.length > 0)
            game.turretMesh = game.turret.makeMesh(game.turrets);

        $("#hud .health .inner").css("width", game.theRover.health + "%");

        var genPct = 100 - (game.elapsed % game.genTime) / game.genTime * 100;
        $("#hud .transition .inner").css("width", genPct + "%");

        if(genPct > game.lastPct) {
            game.generation++;

            game.currentGen = {
                speed: Math.round(game.nextGen.speed),
                jump: Math.round(game.nextGen.jump),
                blaster: Math.round(game.nextGen.blaster)
            };

            game.nextGen = {
                speed: game.currentGen.speed,
                jump: game.currentGen.jump,
                blaster: game.currentGen.blaster
            };

            $("#hud .current").css("opacity", 0);
            $("#hud .next").animate({ top: "80px" }, 1000, function() {
                $("#hud .current").css("opacity", 1).find("h1").text("Version " + game.generation);
                $("#hud .next").css("top", "320px").find("h1").text("Version " + (game.generation + 1));
            });
        }

        game.lastPct = genPct;

        $("#hud .current .speed .inner").css("width", game.currentGen.speed * 20 + "%");
        $("#hud .current .jump .inner").css("width", game.currentGen.jump * 20 + "%");
        $("#hud .current .blaster .inner").css("width", game.currentGen.blaster * 20 + "%");

        $("#hud .next .speed .inner").css("width", game.nextGen.speed * 20 + "%");
        $("#hud .next .jump .inner").css("width", game.nextGen.jump * 20 + "%");
        $("#hud .next .blaster .inner").css("width", game.nextGen.blaster * 20 + "%");
    },

    skillPoints: 8,
    realTick: function() {
        game.rover.update(game.theRover, game.elapsed);

        if(Math.abs(game.theRover.xSpeed) > 0.01)
            game.nextGen.speed = clamp(game.nextGen.speed + 0.01, 0.01, 4.99);
        if(Math.abs(game.theRover.ySpeed) > 0.01)
            game.nextGen.jump = clamp(game.nextGen.jump + 0.01, 0.01, 4.99);
        if(game.keysDown.space)
            game.nextGen.blaster = clamp(game.nextGen.blaster + 0.01, 0.01, 4.99);

        var skillTotal = game.nextGen.speed + game.nextGen.jump + game.nextGen.blaster;
        game.nextGen.speed *= game.skillPoints / skillTotal;
        game.nextGen.jump *= game.skillPoints / skillTotal;
        game.nextGen.blaster *= game.skillPoints / skillTotal;

        for(var i = 0; i < game.projectiles.length; i++)
            if(game.projectiles[i].alive)
                game.projectile.update(game.projectiles[i], game.elapsed);

        for(var i = 0; i < game.turrets.length; i++)
            if(game.turrets[i].health > 0)
                game.turret.update(game.turrets[i], game.elapsed);
    }
};

})();