# DevConnect

DevConnect is a small developer community app concept built with HTML, CSS, and vanilla JavaScript. It is designed as a course project: the pages are easy to explore, the main interactions work in the browser, and no build tools or server are required.

## Run locally

Open `index.html` in a browser, or serve this folder with any static web server. For example, with Python installed:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

To try the full account flow, create an account, choose **My profile → Log out**, then sign in with the email and password you just used. Choose **Explore the community** on the landing page to open the sample workspace without creating an account.

## What’s included

- A responsive landing page with sign-up, login, and community preview actions
- Sign-up and login forms with name, email, and password validation
- A developer feed with update, code, and project posts
- Like, comment, and share interactions
- Developer search and skill filters
- Follow and unfollow actions with a connections list
- Simple one-to-one conversations
- Editable developer profile and project list
- Dark and light theme toggle
- Browser `localStorage` persistence for demo accounts, profile edits, posts, follows, comments, and messages

## Project structure

```text
devconnect/
├── index.html   # Landing page and app shell
├── styles.css   # Responsive layout, components, and themes
├── app.js       # Demo data, page rendering, and interactions
└── README.md
```

## Tech used

- HTML5
- CSS3 (Grid, Flexbox, responsive media queries)
- Vanilla JavaScript
- Browser localStorage

## Deployment

This version is static and can be deployed to GitHub Pages:

1. Push the project to a GitHub repository.
2. Open the repository’s **Settings → Pages**.
3. Choose **Deploy from a branch**, select the branch and `/ (root)` folder, then save.

The page will be available at the GitHub Pages URL shown in that settings panel.

## Notes for extending the project

All app data currently lives in the browser, so it is a prototype rather than a production account system. A next course milestone could replace the localStorage helpers with Flask routes and a SQLite database, then deploy the backend to a service such as Render. Avoid using real passwords or personal information in this demo.
