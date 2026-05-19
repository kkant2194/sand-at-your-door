# AGENTS.md

## Project

Sand At Your Door is a static business web app for Digit Infra Pvt LTD. It provides a public sand delivery landing page, a quote form, a Hindi/English toggle, a live price ticker, and a hidden admin pricing screen.

## Run Locally

```sh
cd /Users/krishnakant/sand-at-your-door
python3 -m http.server 4173
```

Public app:

```text
http://localhost:4173/
```

Admin shortcut:

```text
http://localhost:4173/admin.html
```

Admin credentials:

```text
Username: admin
Password: admin123
```

## Important Files

- `index.html`: public app and hidden admin sections.
- `admin.html`: redirects to admin mode.
- `styles.css`: dark responsive UI styling.
- `app.js`: language toggle, pricing, quote estimate, WhatsApp handoff, admin login.
- `clarity-config.js`: Microsoft Clarity project config.
- `clarity.js`: Clarity loader and event wrapper.

## Current Behavior

- Hindi is the default language on first load.
- Language choice is stored in `localStorage`.
- Admin pricing is protected by client-side login only.
- Daily vehicle prices are stored in `localStorage`.
- Customer enquiries open WhatsApp with a pre-filled message.
- Scheduled delivery shows date and time inputs only when `Scheduled` is selected.

## UI Guidelines

- Keep the app dark themed.
- Keep the public UI focused: hero, ticker, products, quote form, contact.
- Do not expose admin navigation to normal users.
- Admin should remain English-only unless explicitly requested otherwise.
- Avoid re-adding removed redundant sections such as separate process, trust strip, or decorative delivery image blocks.

## Production Notes

The current admin login is not production security. Before deploying publicly, replace client-side admin auth and `localStorage` pricing with a real backend:

- Secure admin login with hashed password.
- Database-backed prices and enquiries.
- Server-side WhatsApp Business API integration.
- Environment variables for secrets and tokens.

