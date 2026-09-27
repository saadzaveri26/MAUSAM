import os
from fastapi import Header, HTTPException

def get_admin_token() -> str:
    return os.environ.get("ADMIN_TOKEN", "meghsetu-admin-secret-key-2026")

def require_admin(x_admin_token: str = Header(..., alias="X-Admin-Token")):
    expected = get_admin_token()
    if not x_admin_token or x_admin_token != expected:
        raise HTTPException(status_code=403, detail="Invalid admin token")
