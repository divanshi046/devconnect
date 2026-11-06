# DevConnect

DevConnect is a small developer community app concept built with HTML, CSS, and vanilla JavaScript. Its warm editorial design uses a CSS-built architectural hero and a project gallery, with the community workspace and interactions running directly in the browser.

## Run locally

Open `index.html` in a browser, or serve this folder with any static web server. For example, with Python installed:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

To try the full account flow, create an account, choose **My profile → Log out**, then sign in with the email and password you just used. Choose **Explore the community** on the landing page to open the sample workspace without creating an account.

## What’s included

- A responsive landing page with sign-up, login, and community preview actions
- A blush-and-cream visual theme, serif display typography, and an illustrated architectural hero scene
- Sign-up and login forms with name, email, and password validation
- A developer feed with update, code, and project posts
- Like, comment, and share interactions
- Developer search and skill filters
- Follow and unfollow actions with a connections list
- Simple one-to-one conversations
- Editable developer profile and project list
- Dark and light theme toggle
- Hackathon team finder with skill-fit scores and owner accept/decline controls
- Jaccard-style skill overlap scores on developer cards and team openings
- GitHub username lookup for public repositories, stars, and top repository languages
- Recent contribution calendar, profile completeness progress, skill levels, and achievement badges
- Developer of the Week spotlight, in-app request/follow notifications, and a trending skills chart
- Prism.js syntax highlighting for JavaScript, Python, HTML, CSS, JSON, and Bash snippets
- Responsive team board and mobile feed widgets, with reduced-motion support
- Browser `localStorage` persistence for demo accounts, profile edits, posts, follows, comments, messages, team requests, notifications, and synced GitHub stats

## External data and libraries

- GitHub repository and profile details use GitHub’s public REST API.
- The contribution calendar uses the public [GitHub Contributions API](https://github.com/grubersjoe/github-contributions-api), which can cache results for up to an hour. If that service is unavailable, the repository and star cards still load.
- Syntax highlighting is provided by Prism.js and the trending skills visualization by Chart.js. These libraries load from CDNs, so those enhancements need an internet connection.
- The page makes public GitHub requests from the browser and does not need a private API token.

## Project structure

The extra community workflows live in `features.js`; `favicon.svg` supplies the browser icon.

```text
devconnect/
├── index.html   # Landing page and app shell
├── styles.css   # Responsive layout, components, and themes
├── app.js       # Demo data, page rendering, and interactions
├── features.js  # Team finder, notifications, GitHub stats, and profile extras
├── favicon.svg  # Browser tab icon
└── README.md
```

## Tech used

- HTML5
- CSS3 (Grid, Flexbox, responsive media queries)
- Vanilla JavaScript
- Browser localStorage
- GitHub REST API, Prism.js, and Chart.js (loaded from CDNs)

## Deployment

This version is static and can be deployed to GitHub Pages:

1. Push the project to a GitHub repository.
2. Open the repository’s **Settings → Pages**.
3. Choose **Deploy from a branch**, select the branch and `/ (root)` folder, then save.

The page will be available at the GitHub Pages URL shown in that settings panel.

## Notes for extending the project

All app data currently lives in the browser, so it is a prototype rather than a production account system. A next course milestone could replace the localStorage helpers with Flask routes and a SQLite database, then deploy the backend to a service such as Render. Avoid using real passwords or personal information in this demo.
