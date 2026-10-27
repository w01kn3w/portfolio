# Deployment

The existing GitHub Pages workflow publishes the static site from `main` under `/portfolio/`. It runs lint, frontend and backend type checks, backend tests and a production build before publishing. Pages cannot run the contact API. The form reports delivery as unavailable there. Do not point the root domain at Pages while expecting the Node contact service to work.

The dedicated VPS workflow is disabled by default. It runs only when repository variable `VPS_DEPLOY_ENABLED` is `true`, on `main`, with the protected `production` environment. No server, DNS or certificate configuration has been applied by these files. `atajan.org` was observed pointing to `159.65.0.116`; `www.atajan.org` had no address. These observations do not establish server ownership or application readiness.

## Local checks and contact configuration

Use Node 24 or newer. Run `npm ci`, `npm run check`, then `npm start`. The server binds to `127.0.0.1:3000`, serves `dist`, and exposes `GET /api/health` and `POST /api/contact`. A development frontend must proxy `/api` to that server and use a matching `APP_ORIGIN`.

Copy `.env.example` to `.env` locally. On the VPS keep the actual environment at `/srv/atajan/shared/portfolio.env`, outside releases, owned by the service account with mode `600`. Set `APP_ORIGIN=https://atajan.org` and all five required mail variables: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_FROM`, `CONTACT_TO`. Use port 587 with required STARTTLS, or port 465 with `SMTP_SECURE=true`. Use a sender accepted by the mail provider and configure that provider's SPF/DKIM records separately. The app sends plain text and sets the visitor's address only as Reply-To.

Without mail configuration health returns `contactConfigured: false`, and valid submissions return HTTP 503. Success means the SMTP server accepted the message; it does not guarantee inbox delivery. SMTP errors return 502 without exposing provider details. Test delivery with an address you control before enabling the form.

The production build creates Brotli and Gzip variants of text assets. The Node server negotiates supported encodings and sends `Vary: Accept-Encoding`; hashed assets receive immutable caching. Keep the compressed files in each release archive.

The server accepts JSON with `name` of 2–100 characters, `email` up to 254 characters, `message` of 20–5000 characters, and an empty optional `website` honeypot. It rejects unknown fields, wrong origins and requests larger than 16 KiB. Five attempts per IP per ten minutes are allowed. The limiter is in process memory and resets on restart. Add a shared limiter or edge protection before using multiple instances. `TRUST_PROXY=true` is safe only when Node is restricted to loopback and Nginx replaces `X-Real-IP` as below.

## Prepare the existing VPS

First inspect its OS, listening ports, Nginx virtual hosts, services, firewall, deployment accounts and certificate renewal. Back up the relevant existing configuration. Obtain the owner's approval before replacing the application currently serving the domain. The examples assume Linux with systemd and Nginx. Adapt them to the inspected host.

1. Install Node 24 and npm. Create a dedicated `atajan` service/deployment account and `/srv/atajan/{incoming,releases,shared}` owned by that account. Reserve loopback port 3000 only after checking it is free.
2. Store `portfolio.env` in the shared directory. Set `TRUST_PROXY=true` for the Nginx example. Install the dedicated service below. Do not start it until a first release exists.
3. Allow the deployment account to run only `/usr/bin/systemctl restart atajan-portfolio.service` through a scoped sudoers rule. Protect the production GitHub environment with required reviewers.
4. Create a dedicated deployment SSH key. Add its public key to that account, with agent/X11/port forwarding disabled. Store the private key in GitHub environment secret `VPS_SSH_KEY`. Set `VPS_HOST` and `VPS_USER`. Verify the host key fingerprint through the server console, then put its known_hosts entry into `VPS_KNOWN_HOSTS`. The workflow never trusts a fresh `ssh-keyscan` result.
5. Review and adapt a separate Nginx virtual host. Run `nginx -t` before reloading Nginx. Preserve other hosts. Confirm DNS ownership and address first. Enable HTTPS through the existing certificate process, or Certbot only when DNS and HTTP reachability are confirmed. Check the renewal timer and run its dry-run verification. Never remove existing certificates to make room.
6. Enable `VPS_DEPLOY_ENABLED=true` after those steps. Trigger the workflow on `main`. It builds with base `/`, uploads an archive with no environment file, installs production dependencies, atomically switches `current`, restarts only `atajan-portfolio.service`, and checks local and public HTTPS health. A failed activation restores the previous release when one exists. Releases are retained for inspection and rollback.

Service example, `/etc/systemd/system/atajan-portfolio.service`:

```ini
[Unit]
Description=Atajan portfolio
After=network.target

[Service]
Type=simple
User=atajan
Group=atajan
WorkingDirectory=/srv/atajan/current
EnvironmentFile=/srv/atajan/shared/portfolio.env
ExecStart=/usr/bin/node server/index.ts
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
UMask=0077

[Install]
WantedBy=multi-user.target
```

Nginx location example inside the inspected `atajan.org` HTTPS virtual host. Certificate directives are omitted; retain the host's verified certificate paths. Keep an HTTP block that redirects to HTTPS and permits the configured ACME challenge method.

```nginx
server_name atajan.org;
client_max_body_size 16k;
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 5s;
    proxy_read_timeout 20s;
}
```

Keep the firewall enabled and the Node port private. Choose an SSH access policy that matches the existing host, such as a runner with a fixed egress address. Do not open SSH globally for GitHub-hosted runners. A current symlink switch is atomic, but restarting this single process can briefly interrupt requests. Use two dedicated upstream instances if uninterrupted deployment is required.

## Rollback

Choose a known healthy release directory under `/srv/atajan/releases`. As the deployment account run:

```bash
cd /srv/atajan
ln -s /srv/atajan/releases/KNOWN_GOOD_COMMIT current.rollback
mv -Tf current.rollback current
sudo systemctl restart atajan-portfolio.service
curl --fail http://127.0.0.1:3000/api/health
curl --fail https://atajan.org/api/health
```

For Pages, revert the change with a new Git commit on `main` and let the checked deployment run. Neither workflow changes DNS or provisions certificates. Confirm the GitHub Actions run, real HTTPS page, keyboard navigation and a controlled contact submission after publication.
