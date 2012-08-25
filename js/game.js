var game = {
    levelMesh: {}, 
    currentLevel: {},

    keysDown: {
        left: false,
        right: false,
        down: false
    },

    keys: { left: 37, right: 39, down: 40, A: 65, S: 83, D: 68, F: 70},

    keyChange: function(code, pressed) {
        if(code == this.keys.right || code == this.keys.D)
            game.keysDown.right = pressed; 
        if(code == this.keys.left || code == this.keys.A)
            game.keysDown.left = pressed;
        if(code == this.keys.down || code == this.keys.S)
            game.keysDown.down = pressed;
    },

    start: function() {
        loadImage("level1.png", function(img) {
            var data = getImageData(img);
            game.currentLevel = game.level.create(data.data, data.width, data.height);
            game.levelMesh = game.level.makeMesh(game.currentLevel);

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
    tick: function(seconds) {
        game.elapsed += seconds;

        var milliseconds = seconds * 1000 + game.leftOver;
        while(milliseconds > 1) {
            game.realTick();
            milliseconds -= 1;
        }
        game.leftOver = milliseconds;
    },

    realTick: function() {
        game.rover.move(game.theRover, game.keysDown);
    }
};