# Apex Resilient Flooring — Website

A complete, SEO-optimized website for **Apex Resilient Flooring**, a commercial & residential
resilient flooring business serving the Greater Toronto Area.

Built as a fast, static site (plain HTML/CSS/JS) — no build tools required. It can be hosted
almost anywhere for free or cheap.

---

## 📄 Pages included (17 total)

| Page | File |
|------|------|
| Home | `index.html` |
| About | `about.html` |
| Services (overview) | `services.html` |
| Vinyl Sheet | `vinyl-sheet-flooring.html` |
| Glue-Down LVT/LVP | `luxury-vinyl-flooring.html` |
| Marmoleum & Linoleum | `marmoleum-linoleum-flooring.html` |
| Carpet & Carpet Tile | `carpet-flooring.html` |
| VCT Tile | `vct-flooring.html` |
| Rubber Flooring | `rubber-flooring.html` |
| Floor Prep & Leveling | `floor-prep.html` |
| Commercial | `commercial.html` |
| Residential | `residential.html` |
| Property Management | `property-management.html` |
| Service Areas (GTA) | `service-areas.html` |
| Gallery | `gallery.html` |
| Get a Quote (form) | `quote.html` |
| Contact | `contact.html` |
| 404 error page | `404.html` |

Plus: `sitemap.xml`, `robots.txt`, `css/style.css`, `js/main.js`.

---

## ✅ What's already set up

- **Business name:** Apex Resilient Flooring
- **Phone (call & text):** 416-889-8273 — live everywhere on the site
- **Experience:** "10+ years" messaging throughout
- **Service area:** Greater Toronto Area + surrounding regions
- **Brand:** clean & professional, blue + slate gray
- **SEO:** unique titles, meta descriptions, canonical tags, Open Graph tags,
  structured data (Schema.org LocalBusiness/Service), sitemap & robots.txt
- **Mobile-friendly:** responsive layout, mobile menu, floating "Call Now" button
- **Lead capture:** quote form with photo upload + call/text/email options

---

## ✏️ Things to update when you're ready (placeholders)

1. **Email address** — currently `info@apexresilientflooring.com` (placeholder).
   Find & replace it site-wide with your real email once you have one.
2. **Domain** — the SEO tags assume `https://www.apexresilientflooring.com/`.
   If you buy a different domain, find & replace that URL in every file
   (it appears in the `<link rel="canonical">`, Open Graph, sitemap.xml and robots.txt).
3. **Gallery photos** — `gallery.html` uses placeholders. Send real job photos and
   they can be dropped in. Real photos build the most trust with new customers.
4. **Reviews** — the home page testimonials are clearly labelled as examples.
   Replace them with real client reviews as you complete jobs.

> Tip: to swap the phone number later, find & replace both `416-889-8273`
> (display) and `+14168898273` (the tap-to-call links).

---

## 🚀 How to put it online (easiest options)

**Option A — Netlify (free, drag & drop):**
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. It's live instantly on a free `*.netlify.app` address. You can connect your own domain later.

**Option B — GitHub Pages / Cloudflare Pages / Vercel:** upload the folder to a repo and enable Pages.

**Option C — Traditional web host:** upload all files via FTP to your host's `public_html` folder.

---

## ⚠️ Important: making the quote form actually send

Right now the quote/contact forms show a "thank you" message but **do not send anywhere**
(a static site can't email on its own). To receive real submissions, connect the forms to
a free form service. Two easy options:

- **Netlify Forms** — if you host on Netlify, add `netlify` to the `<form>` tags and
  submissions show up in your dashboard (and can email you).
- **Formspree** (https://formspree.io) — sign up, get a form endpoint, and set the form's
  `action="https://formspree.io/f/yourID"` and `method="POST"`. Works on any host.

Let me know which host you pick and I'll wire the forms up so leads land in your inbox/phone.

---

## Local preview

Just open `index.html` in any web browser to view the site.
