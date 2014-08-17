// Example by https://twitter.com/awapblog



var game = new Phaser.Game(512, 256, Phaser.CANVAS, 'MiningGame', { preload: preload, create: create, update: update });


var TILE_SIZE = 64;
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
    game.load.spritesheet("ROCKS",  "../assets/images/minestones.png", TILE_SIZE, TILE_SIZE);
    game.load.spritesheet("BELT",  "../assets/images/conveyorbelt.png", TILE_SIZE, TILE_SIZE);
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
    if (selectedGem != null) {
        moveGem();
    }

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

            allowInput = false; //TODO why is this here?
            selectedGem = null;
            tempShiftedGem = null;
        }

    }

}

//====================================================Sanity Line: Everything above here I understand.=======================================================
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
    BOARD_COLS = Phaser.Math.floor(game.world.width / TILE_SIZE);
    BOARD_ROWS = Phaser.Math.floor(game.world.height / TILE_SIZE);
    belts = game.add.group();
    for (var x = 0; x < BOARD_COLS; x++) {
        for (var y = 0; y < BOARD_ROWS; y++) {
            var belt = game.add.sprite(x * TILE_SIZE, y * TILE_SIZE, 'BELT');

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
            var gem = gems.create(x * TILE_SIZE, y * TILE_SIZE, "ROCKS");
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
    return {x:Phaser.Math.floor(coordinates.x / TILE_SIZE), y: Phaser.Math.floor(coordinates.y / TILE_SIZE)};
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
function checkAndKillGemMatches(gem) {

    // Make sure we have a gem
    if (gem != null) {

        var countUp = countSameColorGems(gem, 0, -1);
        var countDown = countSameColorGems(gem, 0, 1);
        var countLeft = countSameColorGems(gem, -1, 0);
        var countRight = countSameColorGems(gem, 1, 0);
        
        var countHoriz = countLeft + countRight + 1;
        var countVert = countUp + countDown + 1;

        // If a vertical line
        if (countVert >= MATCH_MIN) {
            killGemRange(gem.posX, gem.posY - countUp, gem.posX, gem.posY + countDown);
        }
        //If a horizontal line
        if (countHoriz >= MATCH_MIN) {
            killGemRange(gem.posX - countLeft, gem.posY, gem.posX + countRight, gem.posY);
        }

        // If you fail at both
        if (countVert < MATCH_MIN && countHoriz < MATCH_MIN) {
            
            // If the gem we're holding isn't in  the selected start position
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

//====================================================Sanity Line: Everything Below here I understand.=======================================================


// kill all gems from a starting position to an end position
function killGemRange(fromX, fromY, toX, toY) {
    // I have no idea how the from and to work -morgajel
    fromX = Phaser.Math.clamp(fromX, 0, BOARD_COLS - 1);
    fromY = Phaser.Math.clamp(fromY , 0, BOARD_ROWS - 1);
    toX = Phaser.Math.clamp(toX, 0, BOARD_COLS - 1);
    toY = Phaser.Math.clamp(toY, 0, BOARD_ROWS - 1);
    // Kills all gems in the region being removed
    for (var x = fromX; x <= toX; x++) {
        for (var y = fromY; y <= toY; y++) {
            var gem = getGem(x, y);
            gem.kill();
        }
    }
}


// move gems that have been killed off the board
// This just sticks them in a pile for reuse
function removeKilledGems() {
    gems.forEach(function(gem) {
        if (!gem.alive) {
            setGemPos(gem, -1,-1);
        }
    });
}


// animated gem movement
function tweenGemPos(gem, newPosX, newPosY, distanceMultiplier) {
    if (distanceMultiplier == null) {
        distanceMultiplier = 1;
    }
    return game.add.tween(gem).to({x: newPosX  * TILE_SIZE, y: newPosY * TILE_SIZE}, SLIDE_DURATION * distanceMultiplier, Phaser.Easing.Linear.None, true);            
}


// look for gems with empty space beneath them and move them down
function slideGems() {

    // Loop through each column from 0-BOARD_COLS, 
    // Then move to the next row from 0-BOARD_ROWS
    for (var y = 0; y < BOARD_ROWS; y++) {
        var slideRowCount = 0;
        for (var x = 0; x < BOARD_COLS; x++) {
            var gem = getGem(x,y);
            if (gem == null) {
                slideRowCount++;
            } else if (slideRowCount > 0) {
                // Set the new gem position
                setGemPos(gem, gem.posX - slideRowCount, gem.posY );
                //animate the slide to the new position
                tweenGemPos(gem, gem.posX, gem.posY, slideRowCount);
            }
        }
    }
}

// look for any empty spots on the board and spawn new gems in their place that slide over
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
                //Offscreen spot for the replacement gem
                var offscreenSpot=BOARD_COLS+gemsMissingFromCol;
                // Snag a new gem to replace it
                gem = gems.getFirstDead();

                //Gems moved to new offscreen spot
                gem.reset(    (offscreenSpot)*TILE_SIZE,    y*TILE_SIZE       );
                randomizeGemColor(gem);
                // Set new spot to move to
                setGemPos(gem, x, y);
                // slide from offscreen spot to new spot.
                tweenGemPos(gem, gem.posX, gem.posY, offscreenSpot-gem.posX   );
                gemsMissingFromCol++;
            }
        }
        // Track this to calculate how long it'll take to refull board
        maxGemsMissingFromCol = Math.max(maxGemsMissingFromCol, gemsMissingFromCol);
    }
    // Allow user input
    game.time.events.add(maxGemsMissingFromCol*SLIDE_DURATION , boardRefilled);

}

// when the board has finished refilling, re-enable player input
function boardRefilled() {
    allowInput = true;
    console.log('input allowed')
}
