# D.A.T.E. Deployment Guide

## Target Environment

| | |
|---|---|
| **VM** | Monitoring VM — VM ID 103 on Mac Mini |
| **IP** | 192.168.1.14 |
| **SSH** | `ssh danny@192.168.1.14` |
| **User** | danny (sudo for root ops) |
| **Network** | Internal only, Tailscale via subnet router on Mac Mini |

## Paths

| | |
|---|---|
| **Container config** | `/opt/containers/date-night-planner/` |
| **App data (SQLite)** | `/opt/appdata/date-night-planner/data/` |

## Deploy

### First time setup

```bash
ssh danny@192.168.1.14

# Create directories
sudo mkdir -p /opt/containers/date-night-planner
sudo mkdir -p /opt/appdata/date-night-planner/data
sudo chown -R danny:users /opt/containers/date-night-planner /opt/appdata/date-night-planner

# Copy compose file
cd /opt/containers/date-night-planner
# scp or copy docker-compose.yml here

# Start
docker compose up -d
```

### Updates

Watchtower auto-pulls new images from `ghcr.io/mcgeand/date-night-planner:latest` when the CI pipeline pushes a new build on merge to `main`.

To manually update:
```bash
cd /opt/containers/date-night-planner
docker compose pull
docker compose up -d
```

## CI Pipeline

GitHub Actions (`.github/workflows/docker-publish.yml`) builds and pushes Docker images on push to `main` or `dev`:

- `main` → tagged `latest` (production, picked up by Watchtower)
- `dev` → tagged `dev`
- All pushes → tagged with commit SHA

## Domain Setup (date.guac)

| | |
|---|---|
| **PiHole DNS** | A record: `date.guac` → `192.168.1.13` |
| **Nginx Proxy Manager** | `192.168.1.13:81` |
| **Proxy rule** | `date.guac` → `http://192.168.1.14:3000` |
| **SSL** | Existing mkcert wildcard cert |

## Existing Services on This VM

| Service | Port |
|---|---|
| Speedtest-Tracker | :8090 |
| Uptime Kuma | :3001 |
| Watchtower | — |
| Portainer Edge Agent | — |
| **D.A.T.E.** | **:3000** |

## Notes

- SQLite database auto-creates at `/app/data/date.db` on first start
- NFS mounts available on the VM if needed (media/downloads)
- `DB_PATH` env var can override the database location if needed
