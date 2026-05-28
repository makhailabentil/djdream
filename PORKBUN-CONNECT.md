# Connect dandjdream.com on Porkbun — do this in order

Your site files are ready. Porkbun cannot be configured from this project — you click through these steps in your Porkbun account.

---

## Step 1 — Enable hosting (required)

1. Go to [porkbun.com](https://porkbun.com) and log in.
2. **Account** → **Domain Management**.
3. On the row for **dandjdream.com**, click the **house** icon in the **Website** column.
4. Click **Select A Plan** under **Static Hosting**.
5. Complete checkout or **Start Trial**.

You should land on the Static Hosting dashboard for **dandjdream.com**.

---

## Step 2 — Upload the site (required)

Use the file **`dandjdream-site.zip`** in this project folder (create it by running `.\deploy.ps1` in PowerShell).

On the Static Hosting page:

1. Open the file manager / upload area.
2. Upload **`dandjdream-site.zip`** and extract it **into the root** (not into a subfolder).
3. Confirm these files exist at the **top level** of the site:

   - `index.html`
   - `styles.css`
   - `script.js`
   - `assets/` (folder with images inside)

**Wrong:** `public/index.html` or `dj-dream-entertainment-site/index.html`  
**Right:** `index.html` at the root

Alternative: use **FTP** or **GitHub Connect** on the same page if the zip is too large.

---

## Step 3 — DNS records (change only if the site does not load)

1. **Domain Management** → **dandjdream.com** → **Details**.
2. Click **Edit** next to **DNS Records**.

**Delete** (if present and you are using Porkbun Static Hosting only):

| Type | Host | Points to (example) |
|------|------|---------------------|
| URL Forward | @ or www | parking / other site |
| CNAME | * | `pixie.porkbun.com` |
| ALIAS / A | @ | old host IP |

**Leave alone:** records Porkbun added when you enabled Static Hosting (often automatic).

You usually **do not** add new A records yourself for Static Hosting on the same domain.

---

## Step 4 — Forward www to the main domain (recommended)

1. **Domain Management** → **dandjdream.com** → **Details**.
2. Find **URL Forwarding** (wording may vary).
3. Add:

   - **Host:** `www`
   - **Forward to:** `https://dandjdream.com`
   - **Type:** Permanent (301)

Save.

---

## Step 5 — SSL (usually automatic)

After Steps 1–4, wait 5–30 minutes, then open:

**https://dandjdream.com**

If there is no padlock after 24 hours, open a ticket with Porkbun support (help bubble on the site).

---

## What is already connected in the code

| Item | Status |
|------|--------|
| Production URL in `index.html` (`canonical`, Open Graph) | `https://dandjdream.com/` |
| Relative asset paths (`./assets/...`) | Work on any domain |
| No localhost-only links | OK |

Nothing else is required in the code for Porkbun Static Hosting.

---

## Test after connecting

- [ ] https://dandjdream.com shows the homepage
- [ ] Carousel images rotate
- [ ] Character photos load
- [ ] Logo scrolls to top; URL becomes `https://dandjdream.com/` (no `#packages` stuck in the bar)
- [ ] https://www.dandjdream.com redirects to apex (if you set Step 4)

---

## Need help from Porkbun?

Email **support@porkbun.com** or use the chat bubble and say:

> I enabled Static Hosting on dandjdream.com and uploaded index.html to the root, but the site still shows [parking / 404 / wrong page].
