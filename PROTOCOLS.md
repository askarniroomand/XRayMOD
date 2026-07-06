# Modular Protocol Documentation

To add a new protocol to the panel, you don't need to touch the source code. Simply use the `/api/protocols` endpoint to register a new schema and template.

## Example: Adding "VLESS + gRPC"

### 1. Define the Schema
The schema tells the UI what fields to show when creating a config for this protocol.

```json
{
  "fields": [
    { "name": "port", "label": "Port", "type": "number", "default": 443 },
    { "name": "serviceName", "label": "Service Name", "type": "text", "default": "grpc-service" }
  ]
}
```

### 2. Define the Template
The template is a JSON string with placeholders like `{{uuid}}`, `{{port}}`, etc.

```json
{
  "inbound": {
    "port": "{{port}}",
    "protocol": "vless",
    "settings": {
      "clients": [{ "id": "{{uuid}}" }],
      "decryption": "none"
    },
    "streamSettings": {
      "network": "grpc",
      "grpcSettings": {
        "serviceName": "{{serviceName}}"
      }
    }
  }
}
```

### 3. Register via API
Send a POST request to `/api/protocols`:

```bash
curl -X POST http://localhost:3000/api/protocols \
  -H "Content-Type: application/json" \
  -d '{
    "id": "vless-grpc",
    "name": "VLESS + gRPC",
    "schema": "{\"fields\": [...]}",
    "template": "{\"inbound\": {...}}"
  }'
```

The panel will automatically:
1. Show "VLESS + gRPC" in the protocol selection dropdown.
2. Render the "Service Name" input field.
3. Generate the correct Xray config when a user creates a link.
