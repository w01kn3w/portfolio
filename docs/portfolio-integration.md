# Portfolio integration contract

The portfolio remains in w01kn3w/portfolio. Backend, database, bot and the existing administration remain in new-project and on Railway. There is one administrator login and one business database.

## Public configuration

VITE_PORTFOLIO_API_URL defaults to https://labs.atajan.org/api/v1. VITE_ADMIN_ORIGIN defaults to https://labs.atajan.org. Neither is a secret. Native static-server CSP allows only the configured API origin, self-hosted assets and raster Blob previews. The backend allows public reads and validated inquiry POSTs from explicit PORTFOLIO_ORIGINS; administration cookies are never sent from the public frontend.

GET /portfolio/content returns a PortfolioDocument with version and published entries. Localized values have en,ru and prepared zh,tk fields, without duplicate records. Empty success stays empty. HTTP errors use the disclosed verified bundled snapshot.

## CMS conventions

HOMEPAGE/home controls sectionOrder and disabledSections. Identifiers are hero,services,projects,technologies,process,about,contact,cta. HERO controls the proposition, two button labels/URLs and an optional image. HOMEPAGE/services, projects and technologies control their section headings/descriptions. HOMEPAGE/process can override the workflow heading. PROCESS supports either one entry with items or ordered individual step entries. HOMEPAGE/final-cta controls the last call to action. HOMEPAGE/header controls the quote button. HOMEPAGE/footer controls description/body and optional link items. NAVIGATION supports a list in content.items and individual link entries. Footer services are derived from active SERVICE records.

SERVICE records support image/icon, category, localized scope items, optional startingPriceMinor/priceCurrency, estimatedDays and CTA. XTR is an integer Stars unit; fiat prices are integer minor units. PROJECT records support gallery, category filtering, technology links, challenge, solution, evidence-backed results and SEO. Public paths are /projects/<slug>/. Existing hash links remain compatible. CONTACT, SOCIAL_LINK, ABOUT, TECHNOLOGY, SEO, DESIGN, LEGAL and optional authentic TESTIMONIAL entries render their corresponding content. No testimonial is seeded or invented.

SEO uses seoTitle/seoDescription, falling back to title/description. The default Open Graph image can be configured through SEO or DESIGN. DESIGN applies shared header/footer logo and favicon, hex colors, selected typography and default language. Legal pages are /legal/privacy/ and /legal/terms/. Baseline disclosures describe the implemented inquiry handling and individually agreed project scope; owner legal review remains necessary.

## Inquiry and preview

POST /portfolio/inquiries sends name,email,message,optional catalog serviceId,locale,website honeypot and UUID submissionId. Only an explicit successful backend JSON response displays saved confirmation. The identifier is reused for an unchanged retry and replaced if failed content is edited. This avoids duplicate acceptance after response loss without trapping edited requests on409.

Preview opens /?preview=1. The child sends {type:'atajan:portfolio-preview-ready'} to the exact configured admin origin. Its opener responds with {type:'atajan:portfolio-preview',document,media:[{id,blob}]}. The child checks event.origin and event.source against the trusted opener. Raster images are capped at5MB each and30MB total; object URLs are revoked on replacement and unmount. No auth token is in the URL, storage or message.

## Static crawler content

The Vite build emits /projects/<slug>/index.html and /legal/<slug>/index.html with per-page titles, descriptions, canonical/Open Graph metadata and noscript text, plus sitemap.xml. The input defaults to the verified bundled snapshot. Set PORTFOLIO_BUILD_CONTENT_FILE to an explicit JSON export of the public published document to generate current crawler content. Never use an admin preview export. Runtime publication updates do not automatically rebuild GitHub Pages crawler snapshots.

For example, save GET https://labs.atajan.org/api/v1/portfolio/content to an ignored .runtime/published-content.json, set PORTFOLIO_BUILD_CONTENT_FILE to that path, and run npm run check. The export contains public data only. Review the generated artifact, then use the existing main-only Pages workflow after owner approval. CORS, local frontend configuration and preview origins must match the environment. No new host, domain, database or DNS changes are needed.

## Deployment status

These are prepared feature-branch changes. The previous production site remains authoritative until an approved rollout. Backend migration and content publication are separate operations. The owner must review legal text and published content, configure storage and payment secrets privately, and approve production schema changes. Existing payment flows remain on the shared backend; this frontend has no payment checkout.
