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

The interface is built from reusable React components in `src/components`, with styling defined using `styled-components`.

The pre-session demo asks players to check their mental and emotional readiness, daily session count, deposit amount, and cooling period. Players confirm with a checkbox that at least 3 hours have passed since their last session. It also checks the planned game limits and asks players to acknowledge the stop-loss and stop-win rules:

- Maximum 2 sessions on weekdays and 4 on weekends.
- At least 3 hours between sessions.
- Maximum INR 15,000 deposited per session.
- Slot amounts up to INR 50 and no more than 3 slot games per session.
- Roulette base amount up to INR 200.
- Stop and exit if losses exceed 50% of the session deposit or profit reaches INR 1,000.

The demo Player IDs come from the `PLAYER_IDS` constant. The app calculates the current session number and cooling-period status from saved Firestore session records for the selected player. It does not monitor live play or provide enforceable spending/session controls; saved timestamps represent app records, not verified game activity. Production enforcement requires trusted server-side session and game data.

## Firebase setup

The app signs users in with Google through Firebase Authentication. After a successful review, it creates a Firestore document at `game-users/{sessionId}` using the signed-in user's Firebase Auth token. It stores the record owner UID, player ID, session limits and confirmations, deposit, amount returned, the deposited-minus-returned balance in the game account, completed game records, the last game's final balance (recorded as withdrawn amount), and a server timestamp; it does not store profile email or contact details. The editable replenished agent amount is shown during review but is not saved. Firestore creates the `game-users` collection automatically with the first document.

Local Firebase Web app settings can be set in `.env.local`. For GitHub Pages builds, add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID` to the `github-pages` environment secrets. The build job uses that environment and fails if any value is missing. Firebase Web config is included in the browser bundle by design and is not an Admin credential. Never put service-account keys in `.env.local` or in the browser app. Restrict the API key to required Firebase APIs and website domains, and rely on Firestore rules for database security.

Enable Google as a sign-in provider in Firebase Authentication and add the deployed site domain to its authorized domains. Create a Firestore database, then publish the owner-scoped rules from `firestore.rules` in the Firebase console. These rules restrict session reads and writes to the authenticated user and deny deletes. The app counts saved sessions by player and checks the cooling period against the latest saved session: 3 hours normally, or 1 hour on weekends after 6 pm. Direct Firestore writes use the Firebase Web SDK and work on the Spark plan; no service-account key or Cloud Functions deployment is used.

## Deploy to GitHub Pages

The GitHub Actions workflow builds and deploys the site whenever changes are pushed to `main`.

1. Push the project to the `main` branch on GitHub.
2. In the repository, open **Settings → Pages** and set the build and deployment source to **GitHub Actions**.
3. Open the **Actions** tab and wait for the **Deploy to GitHub Pages** workflow to finish.
