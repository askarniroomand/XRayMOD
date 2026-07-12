"""XRayMOD Backend — FastAPI for VPS deployment."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import login, logout, users, nodes, configs, protocols, settings, health, cleanip, backends, wizard


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="XRayMOD Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
for r in [login, logout, health, users, nodes, configs, protocols, settings, cleanip, backends, wizard]:
    app.include_router(r.router)


def main():
    import uvicorn
    print("\n  XrayMOD Backend starting on http://localhost:8000\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
