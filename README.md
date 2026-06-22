# Metro Sul — GitHub Pages Website

Static website for the electronic music project **Metro Sul**, redesigned around the new official logo identity and the **VOLTA CHRONOS & KAIROS** sonic narrative: Chronos pressure, transit, Kairos release, after-hours distortion and the quiet return after dawn. The visual layer keeps the blue plasma/orange combustion orbital identity, while the copy now describes the sound through the urban time cycle.

## Concept

Metro Sul transforms urban time pressure into electronic motion: dry machine rhythm, subway movement, Nu-Disco/UK Garage/House tension, after-hours acid textures, lo-fi return and Neo-Soul decompression.

## Files

```txt
index.html
styles.css
script.js
404.html
CNAME
.nojekyll
robots.txt
sitemap.xml
README.md
README_DEPLOY.txt
assets/
  beyondgravity.png
  volta.png
  metrosullogo.jpg
  favicon.svg
```

## Deploy on GitHub Pages

1. Upload all files from this folder to the root of your GitHub repository.
2. Go to **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Choose **main** and **/root**.
5. The included `CNAME` file is already configured for:

```txt
www.metrosulofficial.com
```

## DNS reminder

At Hostinger, the recommended DNS setup for GitHub Pages is:

```txt
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     YOUR-GITHUB-USERNAME.github.io
```

Replace `YOUR-GITHUB-USERNAME.github.io` with your real GitHub Pages user domain.

## Analytics and Meta Pixel

In `index.html`, replace:

```js
window.METRO_SUL_TRACKING = {
  googleAnalyticsId: "G-XXXXXXXXXX",
  metaPixelId: "000000000000000"
};
```

with your real Google Analytics GA4 Measurement ID and Meta Pixel ID.

## Notes

- No npm, no React, no build tools.
- Works as a static GitHub Pages site.
- Uses vanilla JavaScript canvas animation.
- Includes reduced-motion support.
- Spotify embeds require internet access to load.
