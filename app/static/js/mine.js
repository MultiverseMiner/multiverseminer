// Example by https://twitter.com/awapblog



var game = new Phaser.Game(645,645, Phaser.CANVAS, 'MiningGame', { preload: preload, create: create, update: update });

var TILE_SIZE = 64;
var BOARD_COLS;
var BOARD_ROWS;
var MATCH_MIN = 3; // min number of same color tiles required in a row to be considered a match
var SLIDE_DURATION = 200;

// Drop Rates for unique Items
var COMMON_RATE=10
var UNCOMMON_RATE=5
var RARE_RATE=1
var ARTIFACT_RATE=.01

var tiles;
var selectedTile;
var selectedTileStartPos;
var selectedTileTween;
var tempShiftedTile;
var tempShiftedTileTween;
var allowInput;

var planetCommonItems=['carbon','crudeOil','copper']
var planetUnCommonItems=['iron','gold']


function preload() {

    game.load.spritesheet("ROCKS",  "../assets/images/minestones.png", TILE_SIZE, TILE_SIZE);
    game.load.spritesheet("BELT",  "../assets/images/conveyorbelt.png", TILE_SIZE, TILE_SIZE);

}


function create() {

    // fill the screen with as many tiles as possible
    // TODO spawn non-rocks on the board
    spawnBoard();

    // currently selected tile starting position. used to stop player form moving tiles too far.
    selectedTileStartPos = { x: 0, y: 0 };
    
    // used to disable input while tiles are sliding over and respawning
    allowInput = true;
}

function update() {

    // when the mouse is released with a tile selected
    // 1) check for matches
    // 2) remove matched tiles
    // 3) slide over tiles above removed tiles
    // 4) refill the board

    if (game.input.mousePointer.justReleased()) {
        
        if (selectedTile != null) {
            //1
            checkAndKillTileMatches(selectedTile);

            if (tempShiftedTile != null) {
                checkAndKillTileMatches(tempShiftedTile);
            }

            //2
            removeKilledTiles();
            //3
            slideTiles();
            //4
            refillBoard();

            allowInput = false; //TODO why is this here?

            // Make sure after moving and killing and refilling that our two tile vars are empty
            selectedTile = null;
            tempShiftedTile = null;
        }

    }
    moveTile();

}

//====================================================Sanity Line: Everything above here I understand.=======================================================
function moveTile() {

    if (selectedTile != null) {

        var tilePos = getTilePos(game.input.mousePointer);

        if (checkIfTileCanBeMovedHere(selectedTileStartPos.x, selectedTileStartPos.y, tilePos.x, tilePos.y)) {
            if (tilePos.x != selectedTile.posX || tilePos.y != selectedTile.posY) {

                // move currently selected tile
                if (selectedTileTween != null) {
                    game.tweens.remove(selectedTileTween);
                }
                selectedTileTween = tweenTilePos(selectedTile, tilePos.x, tilePos.y);
                tiles.bringToTop(selectedTile);

                // if we moved a tile to make way for the selected tile earlier, move it back into its starting position
                if (tempShiftedTile != null) {
                    tweenTilePos(tempShiftedTile, selectedTile.posX , selectedTile.posY);
                    swapTilePosition(selectedTile, tempShiftedTile);
                }
    
                // when the player moves the selected tile, we need to swap the position of the selected tile with the tile currently in that position 
                tempShiftedTile = getTile(tilePos.x, tilePos.y);
                if (tempShiftedTile == selectedTile) {
                    tempShiftedTile = null;
                } else {
                    tweenTilePos(tempShiftedTile, selectedTile.posX, selectedTile.posY);
                    swapTilePosition(selectedTile, tempShiftedTile);
                }
            }
        }
    }
}

// fill the screen with as many tiles as possible
function spawnBoard() {
    BOARD_COLS = Phaser.Math.floor(game.world.width / TILE_SIZE);
    BOARD_ROWS = Phaser.Math.floor(game.world.height / TILE_SIZE);
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
    tiles = game.add.group();
    for (var x = 0; x < BOARD_COLS; x++) {
        for (var y = 0; y < BOARD_ROWS; y++) {
            var tile = tiles.create(x * TILE_SIZE, y * TILE_SIZE, "ROCKS");
            tile.inputEnabled = true;
            tile.events.onInputDown.add(selectTile);
            randomizeTileType(tile);
            setTilePos(tile, x, y); // each tile has a position on the board
        }
    }
}

// select a tile and remember its starting position
function selectTile(tile, pointer) {
    if (allowInput) {
        selectedTile = tile;
        selectedTileStartPos.x = tile.posX;
        selectedTileStartPos.y = tile.posY;
    }
}

// find a tile on the board according to its position on the board
function getTile(posX, posY) {
    return tiles.iterate("id", calcTileId(posX, posY), Phaser.Group.RETURN_CHILD);
}

// convert world coordinates to board position
function getTilePos(coordinates) {
    return {x:Phaser.Math.floor(coordinates.x / TILE_SIZE), y: Phaser.Math.floor(coordinates.y / TILE_SIZE)};
}

// set the position on the board for a tile
function setTilePos(tile, posX, posY) {
    tile.posX = posX;
    tile.posY = posY;
    tile.id = calcTileId(posX, posY);
}

// the tile id is used by getTile() to find specific tiles in the group
// each position on the board has a unique id
function calcTileId(posX, posY) {
    return posX + posY * BOARD_COLS;
}

// since the tiles are a spritesheet, their color is the same as the current frame number
function getTileType(tile) {
    return tile.frame;
}

// set the tile spritesheet to a random frame
function randomizeTileType(tile) {
    tile.frame = game.rnd.integerInRange(0, tile.animations.frameTotal - 1);
    var chance=getRandRangeNum(1,100);
    console.log('randomizing color')
    if (chance >90 ){
        //tile.frame = game.rnd.integerInRange(0, tile.animations.frameTotal - 1);

        console.log('add loot here')
    }
    //TODO add new loot here
}

// tiles can only be moved 1 square up/down or left/right
function checkIfTileCanBeMovedHere(fromPosX, fromPosY, toPosX, toPosY) {
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

// count how many tiles of the same color lie in a given direction
// eg if moveX=1 and moveY=0, it will count how many tiles of the same color lie to the right of the tile
// stops counting as soon as a tile of a different color or the board end is encountered
function countSameColorTiles(startTile, moveX, moveY) {
    var curX = startTile.posX + moveX;
    var curY = startTile.posY + moveY;
    var count = 0;
    while (curX >= 0 && curY >= 0 && curX < BOARD_COLS && curY < BOARD_ROWS && getTileType(getTile(curX, curY)) == getTileType(startTile)) {
        count++;
        curX += moveX;
        curY += moveY;
    }
    return count;
}

// swap the position of 2 tiles when the player drags the selected tile into a new location
function swapTilePosition(tile1, tile2) {
    var tempPosX = tile1.posX;
    var tempPosY = tile1.posY;
    setTilePos(tile1, tile2.posX, tile2.posY);
    setTilePos(tile2, tempPosX, tempPosY);
}

// count how many tiles of the same color are above, below, to the left and right
// if there are more than 3 matched horizontally or vertically, kill those tiles
// if no match was made, move the tiles back into their starting positions
function checkAndKillTileMatches(tile) {

    // Make sure we have a tile
    if (tile != null) {

        var countUp = countSameColorTiles(tile, 0, -1);
        var countDown = countSameColorTiles(tile, 0, 1);
        var countLeft = countSameColorTiles(tile, -1, 0);
        var countRight = countSameColorTiles(tile, 1, 0);
        
        var countHoriz = countLeft + countRight + 1;
        var countVert = countUp + countDown + 1;

        // If a vertical line
        if (countVert >= MATCH_MIN) {
            killTileRange(tile.posX, tile.posY - countUp, tile.posX, tile.posY + countDown);
        }
        //If a horizontal line
        if (countHoriz >= MATCH_MIN) {
            killTileRange(tile.posX - countLeft, tile.posY, tile.posX + countRight, tile.posY);
        }

        // If you fail at both
        if (countVert < MATCH_MIN && countHoriz < MATCH_MIN) {
            // If the tile we're holding isn't in  the selected start position
            if (tile.posX != selectedTileStartPos.x || tile.posY != selectedTileStartPos.y) {
                if (selectedTileTween != null) {
                    game.tweens.remove(selectedTileTween);
                }
                selectedTileTween = tweenTilePos(tile, selectedTileStartPos.x, selectedTileStartPos.y);

                if (tempShiftedTile != null) {
                    tweenTilePos(tempShiftedTile, tile.posX, tile.posY);
                }

                swapTilePosition(tile, tempShiftedTile);
            }
        }
    }
}

//====================================================Sanity Line: Everything Below here I understand.=======================================================


// kill all tiles from a starting position to an end position
function killTileRange(fromX, fromY, toX, toY) {
    // I have no idea how the from and to work -morgajel
    fromX = Phaser.Math.clamp(fromX, 0, BOARD_COLS - 1);
    fromY = Phaser.Math.clamp(fromY , 0, BOARD_ROWS - 1);
    toX = Phaser.Math.clamp(toX, 0, BOARD_COLS - 1);
    toY = Phaser.Math.clamp(toY, 0, BOARD_ROWS - 1);
    // Kills all tiles in the region being removed
    for (var x = fromX; x <= toX; x++) {
        for (var y = fromY; y <= toY; y++) {
            var tile = getTile(x, y);
            tile.kill();
        }
    }
}


// move tiles that have been killed off the board
// This just sticks them in a pile for reuse
function removeKilledTiles() {
    tiles.forEach(function(tile) {
        if (!tile.alive) {
            setTilePos(tile, -1,-1);
        }
    });
}


// animated tile movement
function tweenTilePos(tile, newPosX, newPosY, distanceMultiplier) {
    if (distanceMultiplier == null) {
        distanceMultiplier = 1;
    }
    return game.add.tween(tile).to({x: newPosX  * TILE_SIZE, y: newPosY * TILE_SIZE}, SLIDE_DURATION * distanceMultiplier, Phaser.Easing.Linear.None, true);            
}


// look for tiles with empty space beneath them and move them down
function slideTiles() {

    // Loop through each column from 0-BOARD_COLS, 
    // Then move to the next row from 0-BOARD_ROWS
    for (var y = 0; y < BOARD_ROWS; y++) {
        var slideRowCount = 0;
        for (var x = 0; x < BOARD_COLS; x++) {
            var tile = getTile(x,y);
            if (tile == null) {
                slideRowCount++;
            } else if (slideRowCount > 0) {
                // Set the new tile position
                setTilePos(tile, tile.posX - slideRowCount, tile.posY );
                //animate the slide to the new position
                tweenTilePos(tile, tile.posX, tile.posY, slideRowCount);
            }
        }
    }
}

// look for any empty spots on the board and spawn new tiles in their place that slide over
function refillBoard() {
    var maxTilesMissingFromCol = 0;
    // Loop through each column from 0-BOARD_COLS, 
    // Then move to the next row from 0-BOARD_ROWS
    for (var y = 0; y < BOARD_ROWS; y++) {
        var tilesMissingFromCol = 0;
        for (var x = 0; x < BOARD_COLS; x++) {
            var tile = getTile(x, y);
            //console.log("checking "+x+","+y+" ="+tile )
            if (tile == null) {
                //Offscreen spot for the replacement tile
                var offscreenSpot=BOARD_COLS+tilesMissingFromCol;
                // Snag a new tile to replace it
                tile = tiles.getFirstDead();

                //Tiles moved to new offscreen spot
                tile.reset(    (offscreenSpot)*TILE_SIZE,    y*TILE_SIZE       );
                randomizeTileType(tile);
                // Set new spot to move to
                setTilePos(tile, x, y);
                // slide from offscreen spot to new spot.
                tweenTilePos(tile, tile.posX, tile.posY, offscreenSpot-tile.posX   );
                tilesMissingFromCol++;
            }
        }
        // Track this to calculate how long it'll take to refull board
        maxTilesMissingFromCol = Math.max(maxTilesMissingFromCol, tilesMissingFromCol);
    }
    // Allow user input
    game.time.events.add(maxTilesMissingFromCol*SLIDE_DURATION , boardRefilled);

}

// when the board has finished refilling, re-enable player input
function boardRefilled() {
    allowInput = true;
    console.log('input allowed')
}

// Used to get a random number in a range
function getRandRangeNum(min, max) {
    return Math.random() * (max - min) + min;
}
