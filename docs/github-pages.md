# GitHub Pages and atajan.org

The owner selected GitHub Pages in w01kn3w/portfolio. Custom domain `atajan.org` is configured in repository Settings > Pages, and `public/CNAME` preserves the intended domain. The production build uses base `/` and email-draft contact mode. Main pushes run the checked Pages publication workflow. No VPS or GitHub deployment secrets are needed.

## Owner DNS steps

The authoritative nameservers observed are dns1.registrar-servers.com and dns2.registrar-servers.com, commonly used by Namecheap. Edit the DNS zone at the provider that manages those servers. Do not change nameservers or mail records.

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | w01kn3w.github.io |

Use automatic/default TTL. Replace conflicting web records for `@` and `www`, such as the previously observed A value 159.65.0.116, parked-domain records or URL redirects. Preserve MX/TXT and unrelated subdomains. An existing AAAA record for the apex must also match GitHub Pages or be removed after checking its purpose. A CNAME value has no protocol or path.

For Namecheap BasicDNS the usual route is Domain List > Manage beside atajan.org > Advanced DNS > Host Records. If the actual DNS is managed elsewhere, use its equivalent record editor.

After DNS propagates, inspect repository Settings > Pages. GitHub provisions the TLS certificate. Enable Enforce HTTPS when the certificate becomes available. If GitHub asks for domain ownership verification, follow the exact TXT challenge shown in the account's Pages settings; do not invent a verification token. Publication success does not mean domain DNS or HTTPS is ready.

Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Contact and required owner information

The owner confirmed that admin@atajan.org does not exist yet. Production contact mode is `unavailable`, so no uncreated address or mail form is displayed. After a working mailbox is confirmed, `email` mode supports a mailto draft. Server-side delivery would require a separately configured endpoint/provider, outside GitHub Pages. Never put private credentials into frontend environment variables.

The owner has now entered the DNS records. Google public DNS confirms the four GitHub A values and the www CNAME. Local resolvers can retain the previous negative result until its TTL expires. The manually triggered `Enable custom domain HTTPS` workflow retries certificate readiness for up to ten minutes, enables HTTPS through the Pages API, and verifies the public HTTPS response. It fails explicitly if issuance remains pending; rerun it after GitHub finishes provisioning.

No registrar password, SSH credential, private key or GitHub token is needed in chat. The owner can complete the DNS records directly and report completion for verification.

## Rollback

Revert the relevant code commit on main and let Pages republish. Domain rollback is separate: restore the previously recorded DNS web records if the owner intentionally returns to earlier hosting, and update/remove the custom domain in Pages to match. Never change mail records for a site rollback.
