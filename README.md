## Chess Engine with Humanized Mode and Multi-PV
A browser-based chess engine interface built with Stockfish and JavaScript. This application allows users to play chess, analyze games, and receive move suggestions from Stockfish with features such as Multi-PV (multiple best move suggestions), humanized mode for less optimal but more realistic move suggestions, and dynamic control over thinking time or depth.

## Features
Interactive Chessboard: Drag-and-drop interface for making moves.
Stockfish Integration: Utilizes Stockfish for move analysis and suggestions.
Multi-PV Support: Choose how many move variations Stockfish provides.
Humanized Mode: Enable a mode that adds a touch of randomness and less CPU-perfect moves for a more human-like experience.
Dynamic Depth/Thinking Time: Choose between calculating depth from thinking time or manually inputting depth.
Pawn Promotion: Decide what piece to promote to when pawns reach the last rank.
Move Highlighting: Highlights suggested moves with unique or shared colors for clarity.
Mobile-Friendly: Supports touch drag-and-drop on mobile devices.

## Demo
Live Demo on GitHub Pages

## Getting Started
Installation
Clone the repository:

```
Copy code
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

Install dependencies:

```
Copy code
npm install
Run a local server to test the application:
```

```
npx http-server
Open your browser at http://localhost:8080.
```

## Usage
Load the Application: Open the application in your browser.
Play Chess: Drag and drop pieces to make moves.

## Analyze Moves:
Choose a side to play or analyze from.
Use the "Analyze" button to get Stockfish's suggested moves.

## Customize Settings:
Adjust the number of Multi-PVs (multiple best moves).
Enable or disable humanized mode for more human-like suggestions.
Switch between thinking time and manual depth modes.

## Controls and Toggles
Thinking Time vs. Manual Depth: Choose whether Stockfish calculates depth dynamically based on thinking time or use a fixed depth.
Humanized Mode: Toggle human-like move suggestions, with an optional setting to randomize depth.
Multi-PV Count: Adjust how many move variations Stockfish suggests (1-10).

## Project Structure
```
<repo-name>/
├── index.html       # Main HTML file
├── css/
│   ├── style.css    # Custom styles
├── js/
│   ├── script.js    # Main JavaScript logic
│   ├── stockfish.js # Stockfish WebAssembly file
├── README.md        # Project documentation
```
## Technologies Used
JavaScript: Core logic and Stockfish integration.
Stockfish: Powerful chess engine for move analysis and suggestions.
Chess.js: Chessboard representation and move validation.
Chessboard.js: Interactive chessboard for browser-based gameplay.
HTML/CSS: UI design and layout.

## Contributing
Contributions are welcome! Feel free to fork the repository and submit pull requests for improvements or bug fixes.

Fork the repository.
Create your feature branch:
```
Copy code
git checkout -b feature/YourFeatureName
Commit your changes:

git commit -m "Add YourFeatureName"
Push to the branch:
git push origin feature/YourFeatureName
Open a pull request.
```
