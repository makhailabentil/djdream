# Deploy D&J Dream Entertainment to dandjdream.com (Porkbun)

This site is a **static** site (`index.html`, `styles.css`, `script.js`, and the `assets/` folder). The simplest path is **Porkbun Static Hosting** on the domain you already own at Porkbun.

## What to upload

Upload everything in this project folder **except** this file and `.git/`:

```
index.html
styles.css
script.js
assets/          (entire folder — images, characters, logo, etc.)
```

Porkbun’s upload limit is **40 MB** per upload. If the zip is larger, use FTP or GitHub Connect (below).

---

## Option A — Porkbun Static Hosting (recommended)

### 1. Turn on Static Hosting

1. Log in at [porkbun.com](https://porkbun.com) → **Account** → **Domain Management**.
2. Find **dandjdream.com**.
3. Click the **house** icon under **Website** (Static Hosting).
   - If you see a different icon, another hosting product is active — cancel it first, then use Static Hosting.
4. Choose **Static Hosting** → pick billing (15-day trial available) → **Start**.

### 2. Publish the site

On the Static Hosting page for **dandjdream.com**, use one of:

| Method | Best for |
|--------|----------|
| **File editor / upload** | One-time launch |
| **FTP** | Large `assets/` folder |
| **GitHub Connect** | Ongoing updates via git push |

**Upload layout on the server** (document root must contain `index.html` at the top level):

```
/
  index.html
  styles.css
  script.js
  assets/
    party-01.png
    ...
    characters/
    logo-dj-dream.png
```

Do **not** upload the parent folder name (`dj-dream-entertainment-site`) as an extra directory, or the site will 404 at the root.

### 3. DNS on Porkbun (same account)

When Static Hosting is enabled **on dandjdream.com** at Porkbun, DNS is usually wired automatically.

Still verify:

1. **Domain Management** → **dandjdream.com** → **Details** → **DNS Records** → **Edit**.
2. Remove or avoid conflicts:
   - Old **URL forwarding** to a parking page
   - **A** / **CNAME** / **ALIAS** records pointing at `pixie.porkbun.com` or another host (unless you intend to use that host)
3. After Static Hosting is active, Porkbun should serve the site on the domain. Propagation can take up to **24–48 hours** (often minutes).

### 4. `www` vs root (`dandjdream.com`)

Pick one primary URL (recommended: **https://dandjdream.com** without www).

**Redirect www → root (common):**

1. **Domain Management** → **dandjdream.com** → **Details**.
2. Open **URL Forwarding** (or **Manage DNS** if you use forwarding there).
3. Forward `www.dandjdream.com` → `https://dandjdream.com` (301 permanent).

**Or** serve both: ensure Static Hosting / DNS covers both hostnames (Porkbun support can confirm for your plan).

### 5. HTTPS

Porkbun Static Hosting typically provisions **SSL** automatically. After DNS is correct, open:

- https://dandjdream.com  
- https://www.dandjdream.com (if you use www)

If the padlock is missing after 24 hours, contact Porkbun support from the help bubble.

---

## Option B — GitHub Connect (updates on every push)

1. Push this project to a GitHub repo (root contains `index.html`, not in a subfolder).
2. In Porkbun Static Hosting for **dandjdream.com** → **GitHub Connect** → **connect**.
3. Authorize Porkbun, select the repo, branch **`main`**.
4. Commits to `main` redeploy the live site.

Local setup:

```bash
git init
git add index.html styles.css script.js assets DEPLOY-PORKBUN.md .gitignore
git commit -m "Initial site deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

---

## Option C — External host (Netlify, Cloudflare Pages, etc.)

Only if you host **outside** Porkbun:

1. Deploy the site there and copy the hostname they give you (e.g. `something.netlify.app`).
2. In Porkbun DNS for **dandjdream.com**:
   - **ALIAS** (or ANAME) on host `@` → that hostname  
   - **CNAME** on host `www` → that hostname  
3. Add `dandjdream.com` as a custom domain in the host’s dashboard.

Porkbun guide: [Connect root when host has no IP](https://kb.porkbun.com/article/85-how-to-connect-your-root-domain-when-your-web-host-wont-provide-an-ip-address)

---

## After go-live checklist

- [ ] https://dandjdream.com loads `index.html`
- [ ] Carousel images load (`assets/party-*.png`)
- [ ] Character images load (`assets/characters/`)
- [ ] Logo click scrolls to top and URL has **no** stray `#packages` hash
- [ ] Booking form and calendar work (client-side only — no server required)
- [ ] Mobile menu works

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Porkbun parking / “coming soon” page | Remove parking; enable Static Hosting; clear conflicting DNS |
| 404 on home | `index.html` must be in the **root** of hosting, not in a subfolder |
| Broken images | Upload full `assets/` tree; paths are relative (`./assets/...`) |
| `www` works but apex does not | Add ALIAS/forwarding for `@` per Porkbun docs |
| Changes not showing | Hard refresh (Ctrl+F5) or wait for CDN/cache |

Support: **support@porkbun.com** or the help bubble in your Porkbun account.
