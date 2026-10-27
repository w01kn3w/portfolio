#!/usr/bin/env bash
set -euo pipefail
release_id=${1:?Expected a Git commit SHA}
[[ "$release_id" =~ ^[a-f0-9]{40}$ ]] || exit 1
app_root=/srv/atajan
release_dir="$app_root/releases/$release_id"
test -d "$app_root/releases"
test -f "$app_root/shared/portfolio.env"
test ! -e "$release_dir"
mkdir "$release_dir"
tar -xzf "$app_root/incoming/$release_id.tgz" -C "$release_dir"
cd "$release_dir"
npm ci --omit=dev --ignore-scripts
previous=$(readlink -f "$app_root/current" || true)
ln -s "$release_dir" "$app_root/current.next"
mv -Tf "$app_root/current.next" "$app_root/current"
rollback() {
  if [[ "$previous" == "$app_root/releases/"* ]] && [[ -d "$previous" ]]; then
    ln -s "$previous" "$app_root/current.rollback"
    mv -Tf "$app_root/current.rollback" "$app_root/current"
    sudo -n systemctl restart atajan-portfolio.service
    echo 'Previous release restored.'
  else
    echo 'No previous release exists. Inspect the dedicated service before enabling traffic.' >&2
  fi
}
trap rollback ERR
sudo -n systemctl restart atajan-portfolio.service
curl --fail --silent --show-error --retry 8 --retry-all-errors --retry-delay 2 http://127.0.0.1:3000/api/health > /dev/null
curl --fail --silent --show-error --retry 3 --retry-delay 2 https://atajan.org/api/health > /dev/null
curl --fail --silent --show-error https://atajan.org/ | grep 'Atajan' > /dev/null
trap - ERR
echo "Activated release $release_id"
