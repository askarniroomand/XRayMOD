# API Endpoints — XRayMOD Worker

## Authentication
All `/api/*` routes require session cookie.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/login` | No | Login (username + password) |
| POST | `/api/logout` | Yes | Clear session |

## Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create user |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

## Nodes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/nodes` | Yes | List nodes |
| POST | `/api/nodes` | Admin | Add node |
| PUT | `/api/nodes/:id` | Admin | Update node |
| DELETE | `/api/nodes/:id` | Admin | Delete node |

## Configs
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/configs` | Yes | List configs |
| POST | `/api/configs` | Admin | Create config |
| PUT | `/api/configs/:id` | Admin | Update config |
| DELETE | `/api/configs/:id` | Admin | Delete config |

## Protocols
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/protocols` | Yes | List protocols |
| POST | `/api/protocols` | Admin | Create protocol |

## Settings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/settings` | Admin | Get panel settings |
| PUT | `/api/settings` | Admin | Update panel settings |

## Clean IP
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cleanip` | Admin | List clean IPs |
| POST | `/api/cleanip/scan` | Admin | Scan for clean IPs |
| POST | `/api/cleanip/apply` | Admin | Apply best IPs |

## Subscription
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/sub/:token` | No | Get subscription links |

## System
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/install` | No | First-time setup |

## Telegram
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/bot` | No | Telegram webhook |
| GET | `/admin` | No | Telegram login |
