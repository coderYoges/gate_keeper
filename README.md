### Gate_Keeper
A gatekeeper system for a game user is a validation and control module that receives user input, checks eligibility or conditions, and decides whether the player can proceed to the next stage of the game.
This README provides a complete, GitHub‑ready documentation for the Gatekeeper System, a module that validates user actions in a game, processes input, returns results, and updates a database when conditions are met.


📘 Project Overview
The Gatekeeper System is a core validation and control module used within a game environment. It acts as an intermediary between the player and the game engine, ensuring that only valid, authorized, and condition‑satisfying actions are allowed. When a user’s action is successful, the system updates the database for later analytics and gameplay insights.
This README is based entirely on the project description provided by the user.
✅ Key Features
User Input Validation – checks format, identity, and game progress.
Rule‑Based Access Control – evaluates predefined game logic.
Decision Engine – grants, denies, or requests additional input.
Database Update on Success – logs successful actions for analysis.
Analytics‑Ready Logging – stores structured data for future insights.
Modular Architecture – easy to extend or integrate with game engines.
🧩 System Architecture
Core Components
Input Handler – captures and sanitizes user input.
Validation Engine – verifies identity, session, and input correctness.
Rule Engine – checks game conditions (score, items, permissions).
Decision Module – determines final outcome.
Response Manager – sends results back to the game UI.
Database Logger – records successful interactions.
High‑Level Flow
Player sends input (score, item, action request).
Input Handler sanitizes and forwards it.
Validation Engine checks identity and format.
Rule Engine evaluates game conditions.
Decision Module returns success, failure, or request more data.
On success, Database Logger updates analytics tables.
Response Manager sends final output to the game engine.

## Responsible-play checks

The pre-session demo asks players to check their mental and emotional readiness, daily session count, deposit amount, and cooling period. It also checks the planned game limits and asks players to acknowledge the stop-loss and stop-win rules:

- Maximum 2 sessions on weekdays and 4 on weekends.
- At least 3 hours between sessions.
- Maximum INR 15,000 deposited per session.
- Slot amounts up to INR 50 and no more than 3 slot games per session.
- Roulette base amount up to INR 200.
- Stop and exit if losses exceed 50% of the session deposit or profit reaches INR 1,000.

The demo Player IDs come from the `PLAYER_IDS` constant. After a successful check, the app saves that ID's last-played timestamp in browser local storage and blocks another check until 3 hours have passed. This local record is specific to the current browser and can be cleared; it does not connect to a game account, monitor live play, or provide enforceable spending/session controls. Production enforcement requires trusted server-side session and game data.

## Deploy to GitHub Pages

The GitHub Actions workflow builds and deploys the site whenever changes are pushed to `main`.

1. Push the project to the `main` branch on GitHub.
2. In the repository, open **Settings → Pages** and set the build and deployment source to **GitHub Actions**.
3. Open the **Actions** tab and wait for the **Deploy to GitHub Pages** workflow to finish.

The site will be available at `https://coderyoges.github.io/gate_keeper/`.
