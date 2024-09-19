// Import the Chess class from the ESM version of chess.js
import { Chess } from '../js/chess.js';

// Initialize the chess.js game
var game = new Chess();
var stockfish = new Worker('js/stockfish.js');

// Handle any Stockfish errors
stockfish.onerror = function(error) {
    console.error('Error in Stockfish worker:', error);
};

// Track the original square when a piece is picked up
let originalSquare = null;

// Called when a piece is picked up
function handleDragStart(source, piece, position, orientation) {
    originalSquare = source;  // Store the original square
}

// Modify the handleMove function to handle drop logic properly with error handling
function handleMove(source, target, piece, newPos, oldPos, orientation) {
    try {
        // Only allow drop if the piece is moved to a new square
        if (source !== target) {
            var promotionPiece = detectPawnPromotion(source, target);
            var move = game.move({
                from: source,
                to: target,
                promotion: promotionPiece || undefined
            });

            // If the move is invalid, snap the piece back
            if (move === null) {
                console.error(`Invalid move from ${source} to ${target}`);
                console.log('Board state after invalid move:', game.ascii());
                console.log('FEN:', game.fen());
                return 'snapback';  // Snap piece back to original square
            } else {
                // If valid, update the game state and suggest the best move
                if (promotionPiece){
                    //updatePromotedPiece(target, promotionPiece);
                }
                updateStatus();
                suggestBestMove();  // Call Stockfish to get the best move
            }
            board.position(game.fen(), false); // update board
        }
    } catch (error) {
        console.error(error);
        return 'snapback';  // Snap the piece back if any error occurs
    }
}

// Detect whether the move is a pawn promotion
function detectPawnPromotion(source, targetSquare) {
    // Use game.get() to retrieve information about the piece at the source square
    const piece = game.get(source);

    // Check if there is a piece and if it is a pawn ('p')
    if (!piece || piece.type !== 'p') {
        return null;  // Not a pawn, so no promotion is possible
    }

    // Check if the pawn is moving to the promotion rank (8 for white, 1 for black)
    const targetRank = targetSquare.charAt(1);
    const isWhitePawnPromotion = piece.color === 'w' && targetRank === '8';
    const isBlackPawnPromotion = piece.color === 'b' && targetRank === '1';

    if (isWhitePawnPromotion || isBlackPawnPromotion) {
        // Prompt the user for the promotion piece (q = Queen, r = Rook, b = Bishop, n = Knight)
        let promotionPiece = prompt('Promote to (q = Queen, r = Rook, b = Bishop, n = Knight):', 'q');

        // Ensure the promotion choice is valid
        if (!['q', 'r', 'b', 'n'].includes(promotionPiece)) {
            promotionPiece = 'q';  // Default to Queen if invalid input
        }

        return promotionPiece;  // Return the promotion piece ('q', 'r', 'b', 'n')
    }

    return null;  // No promotion needed
}

// Update the board to show the promoted piece's icon
function updatePromotedPiece(targetSquare, promotionPiece) {
    const newPosition = board.position();  // Get the current board position

    // Determine which piece to place on the target square
    let newPiece = '';
    const currentTurn = game.turn() === 'w' ? 'b' : 'w'; // After move, turn changes
    if (currentTurn === 'w') {
        newPiece = 'w' + promotionPiece;  // White piece
    } else {
        newPiece = 'b' + promotionPiece;  // Black piece
    }

    // Update the board's position with the promoted piece
    newPosition[targetSquare] = newPiece;

    // Update the board to reflect the new piece
    board.position(newPosition, false);  // false ensures that pieces don't snap
    
}

// Called when a piece is dropped
function handleDrop(source, target) {
    console.log(`Trying move from ${source} to ${target}`);

    // If the user drops the piece on the same square, cancel the move
    if (source === target) {
        console.log('Move cancelled, piece returned to original position.');
        return 'snapback';  // Snap the piece back to its original square
    }

    // Handle the move logic and validate
    let moveResult = handleMove(source, target);
    clearHighlights();
    
    // If the moveResult is 'snapback', it means the move is invalid, and the piece will snap back
    return moveResult;
}

// Initialize the chessboard.js board (after defining handleMove)
var board = Chessboard('board', {
    draggable: true,       // Enable drag-and-drop functionality
    position: 'start',     // Start the board with the standard chess setup
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',  // Use CDN for pieces
    onDragStart: handleDragStart,  // Handle when a piece is picked up
    onDrop: handleDrop  // Handle when a piece is dropped
});

// Function to suggest the best move using Stockfish
function suggestBestMove() {
    const fen = game.fen();  // Get the FEN string from the current board
    const depth = calculateDepthFromTime(thinkingTime);  // Get depth based on thinking time

    // Check if it's the player's turn based on the player's color
    if ((isPlayerWhite && game.turn() === 'w') || (!isPlayerWhite && game.turn() === 'b')) {
        stockfish.postMessage('position fen ' + fen);
        stockfish.postMessage(`go depth ${depth}`);  // Use the calculated depth

        stockfish.onmessage = function(event) {
            const message = event.data;
            if (message.includes('bestmove')) {
                const bestMove = message.split(' ')[1];
                highlightMove(bestMove);  // Highlight the best move on the board
                document.getElementById('suggestion').textContent = 'Suggested Move: ' + bestMove;
            }
        };
    } else {
        document.getElementById('suggestion').textContent = 'Waiting for opponent\'s move';
    }
}

let isPlayerWhite = true; //default
let thinkingTime = 5;  // Default thinking time in seconds


function updateThinkingTime(value) {
    thinkingTime = value;
    document.getElementById('thinkingTimeValue').textContent = value;
}

function calculateDepthFromTime(timeInSeconds) {
    return Math.min(Math.floor(timeInSeconds * 2), 30);  // Example correlation: 2x time
}

// Function to highlight the suggested move on the board
function highlightMove(bestMove) {
    clearHighlights();  // Always clear previous highlights
    const from = bestMove.slice(0, 2);  // Extract 'from' square
    const to = bestMove.slice(2, 4);    // Extract 'to' square
    addHighlight(from);
    addHighlight(to);
}

// Function to add highlight to a specific square
function addHighlight(square) {
    const squareElement = document.querySelector(`.square-${square}`);
    if (squareElement) {
        squareElement.classList.add('highlight');
    }
}

// Function to clear all highlights
function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(el => {
        el.classList.remove('highlight');
    });
}

// Function to update the status of the game (e.g., whose turn, checkmate, etc.)
function updateStatus() {
    var status = '';
    var moveColor = 'White';  // Default to White's turn

    if (game.turn() === 'b') {
        moveColor = 'Black';  // If it's Black's turn
    }

    // Check if the game is over (checkmate, draw, etc.)
    if (game.isCheckmate()) {  // Using `isCheckmate()` as per your version of chess.js
        status = 'Game over, ' + moveColor + ' is in checkmate.';
    } else if (game.isDraw()) {  // Using `isDraw()` as per your version of chess.js
        status = 'Game over, drawn position.';
    } else {
        status = moveColor + ' to move';

        // Check if the current player is in check
        if (game.inCheck()) {  // Using `inCheck()` as per your version of chess.js
            status += ', ' + moveColor + ' is in check';
        }
    }

    document.getElementById('status').textContent = 'Status: ' + status;
}

// Undo the last move made
function undoMove() {
    game.undo();  // Undo the last move in chess.js
    board.position(game.fen());  // Update the board to reflect the new position
    updateStatus();  // Update the game status
    clearHighlights();
    if ((isPlayerWhite && game.turn() === 'w') || (!isPlayerWhite && game.turn() === 'b')) {
        suggestBestMove();  // Suggest the best move for the player
    } else {
        document.getElementById('suggestion').textContent = "Waiting for opponent's move.";
    }
}

// Flip the board orientation
function flipBoard() {
    board.flip();  // Flip the chessboard orientation
    isPlayerWhite = !isPlayerWhite;  // Toggle player's color (White/Black)
    clearHighlights();  // Clear highlights when flipping the board

    // Check if it's the player's turn after flipping
    if ((isPlayerWhite && game.turn() === 'w') || (!isPlayerWhite && game.turn() === 'b')) {
        suggestBestMove();  // Suggest the best move for the player
    } else {
        document.getElementById('suggestion').textContent = "Waiting for opponent's move.";
    }
    updateStatus();
}

// Reset the game to the starting position
function resetGame() {
    game.reset();
    board.start();
    if (!isPlayerWhite)
        flipBoard(); // Reset to white by default
    clearHighlights();  // Clear all highlights
    updateStatus();  // Update the game status

    // Clear the suggestion and turn text
    document.getElementById('suggestion').textContent = 'Suggested Move: None';
    document.getElementById('status').textContent = 'Status: Ready';
}

document.addEventListener('DOMContentLoaded', function() {
    // Attach event listeners to buttons
    document.getElementById('flipButton').addEventListener('click', flipBoard);
    document.getElementById('resetButton').addEventListener('click', resetGame);
    document.getElementById('undoButton').addEventListener('click', undoMove);
    document.getElementById('loadFENButton').addEventListener('click', loadFEN);
    const slider = document.getElementById('thinkingTime');
    const timeDisplay = document.getElementById('thinkingTimeValue');
    slider.addEventListener('input', function() {
        thinkingTime = slider.value;
        timeDisplay.textContent = thinkingTime;
    })
});

// Load a position from a FEN string
function loadFEN() {
    var fen = document.getElementById('fenInput').value.trim();  // Get and trim the FEN string
    console.log('FEN Input:', fen);  // Log the FEN for debugging purposes

    // Directly set the position of the board without relying on game.load()
    try {
        board.position(fen);  // Update the board to reflect the loaded position
        game.reset();  // Reset the internal chess.js game
        game.load(fen);  // Load the FEN into the game (even if it doesn't return anything)
        console.log('Board updated to FEN: ', fen);  // Log the update
        updateStatus();  // Update the game status
        if ((isPlayerWhite && game.turn() === 'w') || (!isPlayerWhite && game.turn() === 'b')) {
            suggestBestMove();
        }
        else{
            document.getElementById('suggestion').textContent = "Waiting for opponent's move.";
        }
    } catch (error) {
        console.error("Error loading FEN: ", error);
        alert("Invalid FEN string!");
    }
}

