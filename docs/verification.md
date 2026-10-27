# Verification

Checked on 2026-10-27 against the local production build using Node v24.20.0, Lighthouse 13.5.0, Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36. These measurements are local, not live-domain results.

## Automated checks

ESLint, frontend/server TypeScript, six Node test groups and Vite production build passed. Browser integration tests passed against a real temporary Node server with Chromium. Tests cover widths 320, 390, 768 and 1440, project disclosure, reference architecture, keyboard process tabs, technology disclosure, actual contact HTTP 503, network failure, pause, reduced motion, touch, 404 and assets. Axe WCAG A/AA reported zero automated violations. No JavaScript exceptions or unexpected failing asset responses were recorded. Expected form failure responses are not treated as broken assets. Runtime dependency audit found zero vulnerabilities.

## Lighthouse

| Profile | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 89 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

Mobile FCP 1.6 s, LCP 2.2 s, TBT 310 ms, CLS 0. Performance remains just below the requested 90 target on this run. The page uses a self-hosted 53.65 KB WOFF2, precompressed Brotli/Gzip assets, cached Canvas geometry and at most 30 Canvas draws per second. Results vary with CPU and network; no production Core Web Vitals are available.

Full local reports and viewport captures remain in ignored .impeccable/review/. To repeat Lighthouse, install the Lighthouse CLI and audit the built Node service with the mobile default and desktop preset. Run audits without concurrent builds.

## External state and blockers

- Public annlegion profile returned GitHub 404. The authenticated existing remote is w01kn3w/portfolio. No remotes were repointed and no account equivalence is claimed.
- Only this portfolio is verified. No source was available for the Taxi/OpenRide, UIBE Hub or VPN candidates.
- SMTP is not configured. Real inbox delivery was not tested. The integration test uses a controlled mock transport only for the success/failure contract; the browser verifies actual unconfigured failure.
- Initial system DNS returned atajan.org A 159.65.0.116; www had no address. A later public resolver query did not return an A record. Recheck authoritative DNS before cutover.
- HTTPS could not be established. A direct request to the observed IP with the domain SNI failed the TLS handshake; HTTP returned an empty reply. There is no successful new production deployment to report.
- No SSH access, live Nginx/service audit, configured GitHub deployment secrets, DNS writes, certificate issuance or paid hosting changes were performed.

## Known limits

Single-process rate limiting resets on restart. The optional VPS workflow's service restart can briefly interrupt requests; the symlink rollback is atomic but the process restart is not zero downtime. GitHub Pages cannot run the contact API. The repository-configured email mailbox is unverified. Lighthouse and axe do not replace manual assistive-technology testing. Confirm the target GitHub identity, server and SMTP before a production release.
