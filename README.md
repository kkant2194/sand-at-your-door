# Sand At Your Door

Production-ready static business app for Digit Infra Pvt LTD.

## Run locally

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173/`.

## Microsoft Clarity

1. Create a Clarity project at `https://clarity.microsoft.com/`.
2. Copy the project ID from the manual tracking code.
3. Paste it into `clarity-config.js`.

```js
window.SAND_APP_CONFIG = {
  clarityProjectId: "YOUR_PROJECT_ID",
  enableAnalyticsOnLocalhost: false,
};
```

Analytics is disabled on localhost by default so development visits do not pollute production data.
Set `enableAnalyticsOnLocalhost` to `true` only when you want to test Clarity locally.

## Backend/admin pricing

Normal visitors do not see the backend tab. Open admin mode with:

```text
http://localhost:4173/?admin=1
```

Shortcut:

```text
http://localhost:4173/admin.html
```

The backend pricing panel stores daily tractor and truck rates in browser `localStorage`.

Demo admin credentials:

```text
Username: admin
Password: admin123
```

This is client-side protection only. Use a real backend login before deploying publicly.
