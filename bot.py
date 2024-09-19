import chess
import chess.engine
import os 
dir_path = os.path.dirname(os.path.realpath(__file__))

# Define the path to your Stockfish engine
STOCKFISH_PATH = dir_path + "/stockfish/stockfish.exe"


class ChessGame:
    def __init__(self, think_time):
        self.board = chess.Board()
        self.engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)
        self.flipped = False  # Track whether the board is flipped
        self.think_time = think_time

    def display_board(self):
        """Display the current board with rank and file labels."""
        print("    a  b  c  d  e  f  g  h" if not self.flipped else "    h  g  f  e  d  c  b  a")
        print("  +------------------------+")
        
        for rank in range(8):
            row = 8 - rank if not self.flipped else rank + 1
            print(f"{row} |", end=" ")
            for file in range(8):
                square = chess.square(file, 7 - rank) if not self.flipped else chess.square(7 - file, rank)
                piece = self.board.piece_at(square)
                if piece is None:
                    print(".", end="  ")  # Empty square
                else:
                    print(piece.symbol(), end="  ")  # Display the piece
            print(f"| {row}")  # End the row with the rank
        
        print("  +------------------------+")
        print("    a  b  c  d  e  f  g  h" if not self.flipped else "    h  g  f  e  d  c  b  a")

    def flip_board(self):
        """Flip the board orientation."""
        self.flipped = not self.flipped
        print("Board flipped.\n")

    def suggest_best_move(self):
        """Get the best move from Stockfish."""
        result = self.engine.play(self.board, chess.engine.Limit(time=self.think_time))
        return result.move

    def undo_move(self):
        """Undo the last move."""
        if len(self.board.move_stack) > 0:
            last_move = self.board.pop()
            print(f"Undid move: {last_move}\n")
        else:
            print("No moves to undo.\n")

    def get_player_move(self):
        """Get the player's move in UCI format and validate it."""
        while True:
            move_input = input("Enter your move (in UCI format, e.g., e2e4), 'flip', 'undo', 'fen', 'restart', or 'quit': ").strip().lower()
            
            if move_input == 'flip':
                return 'flip'
            elif move_input == 'undo':
                return 'undo'
            elif move_input == 'fen':
                return 'fen'
            elif move_input == 'restart':
                return 'restart'
            elif move_input == 'quit':
                return 'quit'

            try:
                move = chess.Move.from_uci(move_input)
                if move in self.board.legal_moves:
                    return move
                else:
                    print("Invalid move. Try again.")
            except ValueError:
                print("Invalid UCI format. Try again (e.g., e2e4).")

    def set_fen(self, fen_string):
        """Set the board position using a FEN string."""
        try:
            self.board.set_fen(fen_string)
            print("FEN position set successfully.")
            self.display_board()
            # Automatically suggest the best move if it's the player's turn
            if self.board.turn == chess.WHITE:
                print("White's turn (suggesting move if White is the player).")
            else:
                print("Black's turn (suggesting move if Black is the player).")
            # Suggest the best move if it's the player's turn
            if (self.board.turn == chess.WHITE and not self.flipped) or (self.board.turn == chess.BLACK and self.flipped):
                best_move = self.suggest_best_move()
                print(f"Suggested move: {best_move}")
        except ValueError:
            print("Invalid FEN string. Please try again.")

    def close_engine(self):
        """Close the Stockfish engine."""
        self.engine.quit()


def main():
    print("Welcome to the chess suggestion program!")
    print("Moves should be entered in UCI format (e.g., e2e4, e7e5). Type 'flip' to flip the board, 'undo' to undo the last move, 'fen' to input a FEN string, 'restart' to restart the game, or 'quit' to exit.")

    # Get the user input for thinking time
    while True:
        try:
            think_time = float(input("Enter Stockfish thinking time in seconds: "))
            if think_time > 0:
                break
            else:
                print("Thinking time must be a positive number.")
        except ValueError:
            print("Please enter a valid number for thinking time.")

    game = ChessGame(think_time)  # Create a ChessGame instance

    # Game loop
    while True:
        game.display_board()  # Display the current board

        if game.board.turn == chess.WHITE:
            print("White's turn.")
        else:
            print("Black's turn.")

        # Get the current player's move
        player_move = game.get_player_move()

        # Handle special commands: flip, undo, fen, restart, quit
        if player_move == 'flip':
            game.flip_board()
            continue
        elif player_move == 'undo':
            game.undo_move()
            continue
        elif player_move == 'fen':
            fen_string = input("Enter the FEN string: ").strip()
            game.set_fen(fen_string)
            continue
        elif player_move == 'restart':
            print("Restarting the game...\n")
            game = ChessGame(think_time)  # Recreate the ChessGame instance to restart
            continue
        elif player_move == 'quit':
            print("Exiting the game. Goodbye!")
            game.close_engine()
            return  # Exit the program

        game.board.push(player_move)  # Apply the player's move

        # Display the updated board
        print("\nBoard after your move:")
        game.display_board()

        # Suggest the best move for the next player
        best_move = game.suggest_best_move()
        print(f"Suggested move for { 'White' if game.board.turn == chess.WHITE else 'Black' }: {best_move}")

        # Ask the player for the next move
        print(f"Now it's { 'White' if game.board.turn == chess.WHITE else 'Black' }'s turn to make a move.")

        # Game over check
        if game.board.is_game_over():
            print("Game over!")
            game.display_board()
            play_again = input("Would you like to play again? (yes/no): ").strip().lower()
            if play_again != 'yes':
                print("Exiting the game. Goodbye!")
                break
            else:
                game = ChessGame(think_time)  # Recreate the ChessGame instance to restart

    game.close_engine()


if __name__ == "__main__":
    main()
