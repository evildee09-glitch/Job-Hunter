import hmac

from fastapi import Header, HTTPException

from . import config


def require_token(authorization: str = Header(default="")) -> None:
    """Single-user bearer-token check. Fails closed if no token is configured."""
    if not config.API_TOKEN:
        raise HTTPException(503, "Server API_TOKEN is not configured")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not hmac.compare_digest(token.encode(), config.API_TOKEN.encode()):
        raise HTTPException(401, "Invalid or missing token")
