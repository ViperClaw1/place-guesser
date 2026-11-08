# Globe Trotter Quest

A GeoGuessr-style geography game with the following features:

- Display a random Google Street View image in the main viewport
- Show a world map where users can click to place their guess
- Calculate and display the distance between the guess and the actual location
- Show a score based on how close the guess was
- Include a "Next Round" button to load a new location
- Use a simple scoring system (closer guesses = higher points)
- Clean, modern UI with the Street View taking up most of the screen
- Smaller map positioned to the side or bottom

Google Maps powers both the Street View and the map.

The game is responsive, fun to play, and has a clean design similar to the real GeoGuessr.

**Additional features**

- User authentication with email and password login
- A database that stores user games and scores
- A global leaderboard that shows all players' best scores
- Browsing of previous games, with guess accuracy for each round
- The Street View location for each completed round, so players can review their guesses

The app is also deployed and playable online.

## Visual Development

This project was built with an AI-powered app builder, and development can continue there.

- **Ship faster**: describe what you want to build and the builder handles the code.
- **Stay in sync**: every change made in the builder is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into the builder, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
