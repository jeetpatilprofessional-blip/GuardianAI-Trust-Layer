import hashlib
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from backend.app.config import settings

STATIC_SALT = b"guardian_ai_emea_security_salt_2026"

def get_password_hash(password: str) -> str:
    """Generates a PBKDF2 HMAC SHA-256 hash."""
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), STATIC_SALT, 100000).hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored hash."""
    return get_password_hash(plain_password) == hashed_password

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
