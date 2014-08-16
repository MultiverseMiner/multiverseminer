// Example by https://twitter.com/awapblog

var game = new Phaser.Game(400, 320, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

var GEM_SIZE = 64;
var GEM_SPACING = 0;
var GEM_SIZE_SPACED = GEM_SIZE + GEM_SPACING;
var BOARD_COLS;
var BOARD_ROWS;
var MATCH_MIN = 3; // min number of same color gems required in a row to be considered a match
var SLIDE_DURATION = 500;

var gems;
var selectedGem;
var selectedGemStartPos;
var selectedGemTween;
var tempShiftedGem;
var tempShiftedGemTween;
var allowInput;

function preload() {
    game.load.spritesheet("ROCKS",  "../assets/images/minestones.png", GEM_SIZE, GEM_SIZE);
    game.load.spritesheet("OTHER", "../assets/images/minestones.png", GEM_SIZE, GEM_SIZE);
    game.load.spritesheet("BELT",  "../assets/images/conveyorbelt.png", GEM_SIZE, GEM_SIZE);
}

function create() {

    // fill the screen with as many gems as possible
    // TODO spawn non-rocks on the board
    spawnBoard();

    // currently selected gem starting position. used to stop player form moving gems too far.
    selectedGemStartPos = { x: 0, y: 0 };
    
    // used to disable input while gems are sliding over and respawning
    allowInput = true;
}

function update() {

    // when the mouse is released with a gem selected
    // 1) check for matches
    // 2) remove matched gems
    // 3) slide over gems above removed gems
    // 4) refill the board

    if (game.input.mousePointer.justReleased()) {
        
        if (selectedGem != null) {

            //1
            checkAndKillGemMatches(selectedGem);

            if (tempShiftedGem != null) {
                checkAndKillGemMatches(tempShiftedGem);
            }

            //2
            removeKilledGems();
            //3
            slideGems();
            //4
            refillBoard();

            // not sure why these are here like orphans...
            allowInput = false;
            selectedGem = null;
            tempShiftedGem = null;
        }

    }

    // check if a selected gem should be moved and do it

    if (selectedGem != null) {
        moveGem();

    }
}
function moveGem() {
    var gemPos = getGemPos(game.input.mousePointer);

    if (checkIfGemCanBeMovedHere(selectedGemStartPos.x, selectedGemStartPos.y, gemPos.x, gemPos.y)) {
        if (gemPos.x != selectedGem.posX || gemPos.y != selectedGem.posY) {

            // move currently selected gem
            if (selectedGemTween != null) {
                game.tweens.remove(selectedGemTween);
            }
            selectedGemTween = tweenGemPos(selectedGem, gemPos.x, gemPos.y);
            gems.bringToTop(selectedGem);

            // if we moved a gem to make way for the selected gem earlier, move it back into its starting position
            if (tempShiftedGem != null) {
                tweenGemPos(tempShiftedGem, selectedGem.posX , selectedGem.posY);
                swapGemPosition(selectedGem, tempShiftedGem);
            }

            // when the player moves the selected gem, we need to swap the position of the selected gem with the gem currently in that position 
            tempShiftedGem = getGem(gemPos.x, gemPos.y);
            if (tempShiftedGem == selectedGem) {
                tempShiftedGem = null;
            } else {
                tweenGemPos(tempShiftedGem, selectedGem.posX, selectedGem.posY);
                swapGemPosition(selectedGem, tempShiftedGem);
            }
        }
    }

}
// fill the screen with as many gems as possible
function spawnBoard() {
    BOARD_COLS = Phaser.Math.floor(game.world.width / GEM_SIZE_SPACED);
    BOARD_ROWS = Phaser.Math.floor(game.world.height / GEM_SIZE_SPACED);
    belts = game.add.group();
    for (var x = 0; x < BOARD_COLS; x++) {
        for (var y = 0; y < BOARD_ROWS; y++) {
            var belt = game.add.sprite(x * GEM_SIZE_SPACED, y * GEM_SIZE_SPACED, 'BELT');

            //  Here we add a new animation called 'run'
            //  We haven't specified any frames because it's using every frame in the texture atlas
            belt.animations.add('run');

            //  And this starts the animation playing by using its key ("run")
            //  15 is the frame rate (15fps)
            //  true means it will loop when it finishes
            belt.animations.play('run', 30, true);
        }
    }
    gems = game.add.group();
    for (var x = 0; x < BOARD_COLS; x++) {
        for (var y = 0; y < BOARD_ROWS; y++) {
            var gem = gems.create(x * GEM_SIZE_SPACED, y * GEM_SIZE_SPACED, "ROCKS");
            gem.inputEnabled = true;
            gem.events.onInputDown.add(selectGem);
            randomizeGemColor(gem);
            setGemPos(gem, x, y); // each gem has a position on the board
        }
    }
}

// select a gem and remember its starting position
function selectGem(gem, pointer) {
    if (allowInput) {
        selectedGem = gem;
        selectedGemStartPos.x = gem.posX;
        selectedGemStartPos.y = gem.posY;
    }
}

// find a gem on the board according to its position on the board
function getGem(posX, posY) {
    return gems.iterate("id", calcGemId(posX, posY), Phaser.Group.RETURN_CHILD);
}

// convert world coordinates to board position
function getGemPos(coordinates) {
    return {x:Phaser.Math.floor(coordinates.x / GEM_SIZE_SPACED), y: Phaser.Math.floor(coordinates.y / GEM_SIZE_SPACED)};
}

// set the position on the board for a gem
function setGemPos(gem, posX, posY) {
    gem.posX = posX;
    gem.posY = posY;
    gem.id = calcGemId(posX, posY);
}

// the gem id is used by getGem() to find specific gems in the group
// each position on the board has a unique id
function calcGemId(posX, posY) {
    return posX + posY * BOARD_COLS;
}

// since the gems are a spritesheet, their color is the same as the current frame number
function getGemColor(gem) {
    return gem.frame;
}

// set the gem spritesheet to a random frame
function randomizeGemColor(gem) {
    gem.frame = game.rnd.integerInRange(0, gem.animations.frameTotal - 1);
}

// gems can only be moved 1 square up/down or left/right
function checkIfGemCanBeMovedHere(fromPosX, fromPosY, toPosX, toPosY) {
    if (toPosX < 0 || toPosX >= BOARD_COLS || toPosY < 0 || toPosY >= BOARD_ROWS) {
        return false;
    }
    if (fromPosX == toPosX && fromPosY >= toPosY - 1 && fromPosY <= toPosY + 1) {
        return true;
    }
    if (fromPosY == toPosY && fromPosX >= toPosX - 1 && fromPosX <= toPosX + 1) {
        return true;
    }
    return false;
}

// count how many gems of the same color lie in a given direction
// eg if moveX=1 and moveY=0, it will count how many gems of the same color lie to the right of the gem
// stops counting as soon as a gem of a different color or the board end is encountered
function countSameColorGems(startGem, moveX, moveY) {
    var curX = startGem.posX + moveX;
    var curY = startGem.posY + moveY;
    var count = 0;
    while (curX >= 0 && curY >= 0 && curX < BOARD_COLS && curY < BOARD_ROWS && getGemColor(getGem(curX, curY)) == getGemColor(startGem)) {
        count++;
        curX += moveX;
        curY += moveY;
    }
    return count;
}

// swap the position of 2 gems when the player drags the selected gem into a new location
function swapGemPosition(gem1, gem2) {
    var tempPosX = gem1.posX;
    var tempPosY = gem1.posY;
    setGemPos(gem1, gem2.posX, gem2.posY);
    setGemPos(gem2, tempPosX, tempPosY);
}

// count how many gems of the same color are above, below, to the left and right
// if there are more than 3 matched horizontally or vertically, kill those gems
// if no match was made, move the gems back into their starting positions
function checkAndKillGemMatches(gem, matchedGems) {

    if (gem != null) {

        var countUp = countSameColorGems(gem, 0, -1);
        var countDown = countSameColorGems(gem, 0, 1);
        var countLeft = countSameColorGems(gem, -1, 0);
        var countRight = countSameColorGems(gem, 1, 0);
        
        var countHoriz = countLeft + countRight + 1;
        var countVert = countUp + countDown + 1;

        if (countVert >= MATCH_MIN) {
            killGemRange(gem.posX, gem.posY - countUp, gem.posX, gem.posY + countDown);
        }

        if (countHoriz >= MATCH_MIN) {
            killGemRange(gem.posX - countLeft, gem.posY, gem.posX + countRight, gem.posY);
        }

        if (countVert < MATCH_MIN && countHoriz < MATCH_MIN) {
            if (gem.posX != selectedGemStartPos.x || gem.posY != selectedGemStartPos.y) {
                if (selectedGemTween != null) {
                    game.tweens.remove(selectedGemTween);
                }
                selectedGemTween = tweenGemPos(gem, selectedGemStartPos.x, selectedGemStartPos.y);

                if (tempShiftedGem != null) {
                    tweenGemPos(tempShiftedGem, gem.posX, gem.posY);
                }

                swapGemPosition(gem, tempShiftedGem);
            }
        }
    }
}

// kill all gems from a starting position to an end position
function killGemRange(fromX, fromY, toX, toY) {
    fromX = Phaser.Math.clamp(fromX, 0, BOARD_COLS - 1);
    fromY = Phaser.Math.clamp(fromY , 0, BOARD_ROWS - 1);
    toX = Phaser.Math.clamp(toX, 0, BOARD_COLS - 1);
    toY = Phaser.Math.clamp(toY, 0, BOARD_ROWS - 1);
    for (var x = fromX; x <= toX; x++) {
        for (var y = fromY; y <= toY; y++) {
            var gem = getGem(x, y);
            gem.kill();
        }
    }
}

// move gems that have been killed off the board
//TODO - Is this a potential memory leak? -morgajel
function removeKilledGems() {
    gems.forEach(function(gem) {
        if (!gem.alive) {
            setGemPos(gem, -1,-1);
        }
    });
}

// animated gem movement
function tweenGemPos(gem, newPosX, newPosY, durationMultiplier) {
    if (durationMultiplier == null) {
        durationMultiplier = 1;
    }
    return game.add.tween(gem).to({x: newPosX  * GEM_SIZE_SPACED, y: newPosY * GEM_SIZE_SPACED}, SLIDE_DURATION * durationMultiplier, Phaser.Easing.Linear.None, true);            
}

// look for gems with empty space beneath them and move them down
function slideGems() {
    var slideRowCountMax = 0; // Row count max used to detmerine length of wait

    // Loop through each column from 0-BOARD_COLS, 
    // Then move to the next row from 0-BOARD_ROWS
    for (var y = 0; y < BOARD_ROWS; y++) {
        var slideRowCount = 0;
        for (var x = 0; x < BOARD_COLS; x++) {
            var gem = getGem(x,y);
            if (gem == null) {
                slideRowCount++;
            } else if (slideRowCount > 0) {
                setGemPos(gem, gem.posX - slideRowCount, gem.posY );
                tweenGemPos(gem, gem.posX, gem.posY, slideRowCount+1);
            }
        }
        slideRowCountMax = Math.max(slideRowCount, slideRowCountMax);
    }
    return slideRowCountMax;
}

// look for any empty spots on the board and spawn new gems in their place that fall down from above
function refillBoard() {
    var maxGemsMissingFromCol = 0;
    // Loop through each column from 0-BOARD_COLS, 
    // Then move to the next row from 0-BOARD_ROWS
    for (var y = 0; y < BOARD_ROWS; y++) {
        var gemsMissingFromCol = 0;
        for (var x = 0; x < BOARD_COLS; x++) {
            var gem = getGem(x, y);
            console.log("checking "+x+","+y+" ="+gem )
            if (gem == null) {
                gemsMissingFromCol++;
                gem = gems.getFirstDead();
                gem.reset(    (x+BOARD_COLS-1)*GEM_SIZE_SPACED,    y*GEM_SIZE_SPACED       );
                randomizeGemColor(gem);
                setGemPos(gem, x, y);
                tweenGemPos(gem, gem.posX, gem.posY, BOARD_COLS);
            }
        }
        maxGemsMissingFromCol = Math.max(maxGemsMissingFromCol, gemsMissingFromCol);
    }
    
    game.time.events.add(maxGemsMissingFromCol*SLIDE_DURATION , boardRefilled);

}

// when the board has finished refilling, re-enable player input
function boardRefilled() {
    allowInput = true;
    console.log('input allowed')
}
