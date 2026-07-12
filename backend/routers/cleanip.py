"""Clean IP scanning endpoints."""
from __future__ import annotations

import random
import time

from fastapi import APIRouter, Request

from ..auth import require_admin
from ..database import get_db

router = APIRouter()

# Iranian ISP ASNs
ISP_MAP = {
    44244: {"isp": "MTN Irancell", "carrier": "mtn"},
    197207: {"isp": "MCI Hamrah-e Aval", "carrier": "mci"},
    57218: {"isp": "Rightel", "carrier": "rightel"},
    31549: {"isp": "Shatel", "carrier": "shatel"},
}

CF_CIDRS = [
    "104.16.0.0/12", "172.64.0.0/13", "173.245.48.0/20",
    "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
    "141.101.64.0/18", "108.162.192.0/18",
]


def generate_random_ips(cidr: str, count: int) -> list[str]:
    parts = cidr.split("/")
    base = parts[0]
    octets = [int(o) for o in base.split(".")]
    prefix_len = int(parts[1])
    host_bits = 32 - prefix_len
    ips = []
    for _ in range(count):
        rand_host = random.randint(1, (1 << host_bits) - 2)
        ip_int = (octets[0] << 24 | octets[1] << 16 | octets[2] << 8 | octets[3]) & (~((1 << host_bits) - 1))
        ip_int |= rand_host
        ip = f"{(ip_int >> 24) & 255}.{(ip_int >> 16) & 255}.{(ip_int >> 8) & 255}.{ip_int & 255}"
        ips.append(ip)
    return ips


@router.get("/api/cleanip/scan")
async def scan_ips(request: Request, count: int = 16):
    # Generate random CF IPs
    all_ips = []
    for cidr in random.sample(CF_CIDRS, min(3, len(CF_CIDRS))):
        all_ips.extend(generate_random_ips(cidr, count // 2))
    random.shuffle(all_ips)
    selected = all_ips[:count]

    # Detect ISP from CF header
    cf_asn = request.headers.get("cf-ipasn", "")
    isp_info = {"asn": int(cf_asn) if cf_asn else 0, "isp": "Unknown", "country": "XX", "carrier": "unknown"}
    if isp_info["asn"] in ISP_MAP:
        mapped = ISP_MAP[isp_info["asn"]]
        isp_info["isp"] = mapped["isp"]
        isp_info["carrier"] = mapped["carrier"]

    return {"success": True, "data": {"ips": selected, "isp": isp_info}}


@router.post("/api/cleanip/apply")
async def apply_ips(request: Request):
    db = await get_db()
    await require_admin(request, db)
    body = await request.json()
    ips = body.get("ips", [])
    await db.execute("INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?,?,?)",
                     ("clean_ips", ",".join(ips), int(time.time())))
    await db.commit()
    return {"success": True, "data": {"count": len(ips)}}


@router.get("/api/cleanip/list")
async def list_ips(request: Request):
    db = await get_db()
    await require_admin(request, db)
    row = await db.execute_fetchall("SELECT v FROM kvstore WHERE k='clean_ips'")
    ips = row[0][0].split(",") if row and row[0][0] else []
    return {"success": True, "data": {"ips": ips, "carrier": "unknown"}}
