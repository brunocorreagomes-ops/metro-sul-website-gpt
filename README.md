# Metro Sul — GitHub Pages Landing Page

Static, GitHub Pages-ready landing page for **Metro Sul**.

## Structure

```txt
metro-sul/
  index.html
  styles.css
  script.js
  404.html
  .nojekyll
  README.md
  assets/
    beyondgravity.png
    volta.png
    favicon.svg
```

## Deploy on GitHub Pages

1. Create a new GitHub repository.
2. Upload the extracted files directly to the repository root.
3. Go to **Settings → Pages**.
4. In **Build and deployment**, select:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/root**
5. Save and wait for GitHub Pages to publish.

The page uses only static files. No npm, no build step, no Vercel, no React.

## Add Google Analytics and Meta Pixel

Open `index.html` and replace the placeholders inside this block:

```html
<script>
  window.METRO_SUL_TRACKING = {
    googleAnalyticsId: "G-XXXXXXXXXX",
    metaPixelId: "000000000000000"
  };
</script>
```

Use your real IDs:

- Google Analytics Measurement ID: usually starts with `G-`
- Meta Pixel ID: numeric ID from Meta Events Manager

The tracking scripts only load when valid IDs are inserted. With the placeholders, analytics stays inactive.

## Local preview

From inside the extracted folder:

```bash
python -m http.server 8000
```

Then open:

```txt
http://localhost:8000
```

Spotify embeds require internet access to render.
