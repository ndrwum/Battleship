var CLIPlayer = function (game, cli_input, cli_output, mapTable, is_player_one) {
    if (is_player_one) {
        var key = game.registerPlayerOne();
    }
    else {
        key = game.registerPlayerTwo();
    }
    cli_output = $(cli_output);
    cli_input = $(cli_input);
    mapTable = document.getElementById("mapTable");
    var eventLogHandler = function (e) {
        var cli_msg = $('<div class="cli_msg"></div>');
        switch (e.event_type) {
        case SBConstants.TURN_CHANGE_EVENT:
            if (e.who == SBConstants.PLAYER_ONE) {
                cli_msg.text("Player one's turn ( count = " + game.getTurnCount() + " )");
            }
            else {
                cli_msg.text("Player two's turn ( count = " + game.getTurnCount() + " )");
            }
            break;
        case SBConstants.MISS_EVENT:
            cli_msg.text("Miss event at ( " + e.x + ", " + e.y + " )");
            break;
        case SBConstants.HIT_EVENT:
            cli_msg.text("Hit event at ( " + e.x + ", " + e.y + " )");
            break;
        case SBConstants.SHIP_SUNK_EVENT:
            var ship = e.ship;
            if (ship.isMine(key)) {
                var pos = ship.getPosition(key);
                cli_msg.text("Foe sunk your " + ship.getName() + " at ( " + pos.x + ", " + pos.y + " )");
            }
            else {
                var pos = ship.getPosition(null); // This works because ship is dead.
                cli_msg.text("You sunk their " + ship.getName() + " at ( " + pos.x + ", " + pos.y + " )");
            }
            break;
        case SBConstants.GAME_OVER_EVENT:
            if (is_player_one && e.winner == SBConstants.PLAYER_ONE) {
                cli_msg.text("Game over. You win!");
            }
            else {
                cli_msg.text("Game over. You lose!");
            }
            break;
        }
        cli_output.prepend(cli_msg);
    };
    game.registerEventHandler(SBConstants.TURN_CHANGE_EVENT, eventLogHandler);
    game.registerEventHandler(SBConstants.MISS_EVENT, eventLogHandler);
    game.registerEventHandler(SBConstants.HIT_EVENT, eventLogHandler);
    game.registerEventHandler(SBConstants.SHIP_SUNK_EVENT, eventLogHandler);
    //Make the table
    var makeTable = function () {
        for (var rows = 0; rows < game.getBoardSize() + 1; rows++) {
            var nextRow = document.createElement("tr");
            mapTable.appendChild(nextRow);
            for (var cols = 0; cols < game.getBoardSize() + 1; cols++) {
                var nextColumn = document.createElement("td");
                nextRow.appendChild(nextColumn);
                if (nextRow == 0) {
                    nextColumn.innerHTML = "";
                }
            }
        }
        document.body.appendChild(mapTable);
    };
    makeTable();
    //Fill in table cells
    var tableStyler = function (e) {
        for (var row = 0; row < game.getBoardSize() + 1; row++) {
            tableRow = mapTable.rows[row].cells
            for (var col = 0; col < game.getBoardSize() + 1; col++) {
                if (col > 0 && row > 0) {
                    var cell = game.queryLocation(key, col - 1, row - 1);
                    switch (cell.type) {
                    case "miss":
                        tableRow[col].setAttribute("style", "background-color: rgba( 30, 250, 30, 0.5 );");
                        break;
                    case "p1":
                        if (cell.state == SBConstants.OK) {
                            tableRow[col].setAttribute("style", "background-color: rgba( 255, 25, 212, 0.611 );");
                        }
                        else {
                            tableRow[col].setAttribute("style", "background-color: rgba( 242, 17, 17, 0.635 );");
                        }
                        break;
                    case "p2":
                        if (cell.state == SBConstants.OK) {
                            tableRow[col].setAttribute("style", "background-color: rgba( 242, 223, 17, 0.635 );");
                        }
                        else {
                            tableRow[col].setAttribute("style", "background-color: rgba( 242, 17, 17, 0.635 );");
                        }
                        break;
                    case "empty":
                        tableRow[col].setAttribute("style", "background-color: rgba(0,0,0,0);");
                        break;
                    case "invisible":
                        tableRow[col].setAttribute("style", "background-color: rgba( 0, 0, 0, 0.68 );");
                        break;
                    }
                }
                else if (row == 0) {
                    if (col == 0 && row == 0) {
                        tableRow.item(0).innerHTML = " ";
                    }
                    else {
                        var valAsString = col.toString(10)
                        if (valAsString.length == 1 || valAsString == '10') {
                            tableRow.item(col).innerHTML = col - 1 + "\u00A0" + "\u00A0";
                        }
                        else {
                            tableRow.item(col).innerHTML = col - 1;
                        }
                    }
                }
                else if (col == 0 && row > 0) {
                    tableRow.item(0).innerHTML = row - 1;
                }
            }
        }
        infoFunction();
    };
    //Fill in ship info div
    var infoFunction = function () {
        var fleet = game.getFleetByKey(key);
        fleet.forEach(function (s) {
            var ship_name = s.getName();
            var ship_pos = s.getPosition(key);
            $(" ." + ship_name + " > .position").text("Position: (" + ship_pos.x + ", " + ship_pos.y + ")");
            $(" ." + ship_name + " > .direction").text("Direction: " + ship_pos.direction);
            $(" ." + ship_name + " > .length").text("Length: " + s.getSize());
            if (s.getStatus() == SBConstants.ALIVE) {
                $(" ." + ship_name + " > .status").text("Status: ALIVE");
            }
            else {
                $(" ." + ship_name + " > .status").text("Status: DEAD");
            }
        })
    };
    //Bomb audio
    mapTable.addEventListener('click', $('#mapTable td').click(function () {
        var audioElement = document.createElement('audio');
        audioElement.setAttribute('src', 'http://soundbible.com/grab.php?id=1234&type=mp3');
        audioElement.setAttribute('autoplay:false', 'autoplay');
        $.get();
        audioElement.addEventListener("load", function () {
            audioElement.play();
        }, true);
        audioElement.play();
        var xcoor = parseInt($(this).index()) - 1;
        var ycoor = parseInt($(this).parent().index()) - 1;
        fireFunction(xcoor, ycoor);
    }));
    game.registerEventHandler(SBConstants.TURN_CHANGE_EVENT, tableStyler);
    //Fire function
    var fireFunction = function (x, y) {
        var xs = x;
        var ys = y;
        game.shootAt(key, xs, ys);
        infoFunction();
    };
    //Move function
    var moveFunction = function () {
        var move_ship = $("#moveShip").val();
        var movement_type = $("#moveSelect").val();
        var ship = game.getShipByName(key, move_ship);
        if (movement_type === "forward") {
            if (ship != null) {
                game.moveShipForward(key, ship);
            }
        }
        else if (movement_type === "backward") {
            if (ship != null) {
                game.moveShipBackward(key, ship);
            }
        }
        infoFunction();
    };
    //Rotate function
    var rotateFunction = function () {
        var rotate_ship = $("#rotateShip").val();
        var rotation_type = $("#rotateSelect").val();
        var ship = game.getShipByName(key, rotate_ship);
        if (rotation_type === "CW") {
            if (ship != null) {
                game.rotateShipCW(key, ship);
            }
        }
        else if (rotation_type === "CCW") {
            if (ship != null) {
                game.rotateShipCCW(key, ship);
            }
        }
        infoFunction();
    };
    document.getElementById("moveSubmit").onclick = moveFunction;
    document.getElementById("rotateSubmit").onclick = rotateFunction;
    game.registerEventHandler(SBConstants.GAME_OVER_EVENT, eventLogHandler);
};