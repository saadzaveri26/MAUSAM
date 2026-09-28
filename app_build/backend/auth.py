import os
import secrets
from fastapi import Header, HTTPException

def get_admin_token() -> str:
    tok = os.environ.get("ADMIN_TOKEN", "").strip()
    if not tok or len(tok) < 24:
        raise RuntimeError("ADMIN_TOKEN must be set and at least 24 characters")
    return tok

def require_admin(x_admin_token: str = Header(None, alias="X-Admin-Token")):
    if not x_admin_token:
        raise HTTPException(status_code=403, detail="Forbidden: Missing admin token")
    expected = get_admin_token()
    if not secrets.compare_digest(x_admin_token.strip(), expected):
        raise HTTPException(status_code=403, detail="Forbidden: Invalid admin token")
