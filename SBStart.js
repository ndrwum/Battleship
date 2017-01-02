$(document).ready(function () {
    alert("**Super Battleship made by Andrew Um**\nInstructions: \nPlease click a cell to fire.")
    var game = new SuperBattleship();
    var cli_player_one = new CLIPlayer(game, $('cli_input'), $('#cli_output'), $('#mapTable'), true);
    var ai_player_two = new DumbAI(game, false);
    game.startGame();
});