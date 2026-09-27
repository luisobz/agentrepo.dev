#!/usr/bin/env python3
"""Fail closed if CI database URLs do not target the intended Supabase projects."""

import os
import sys
from urllib.parse import unquote, urlparse


def check(name: str, ref_name: str) -> tuple[str, str]:
    url = os.environ.get(name, "")
    ref = os.environ.get(ref_name, "")
    parsed = urlparse(url)
    if not ref or len(ref) != 20 or not ref.isalnum():
        sys.exit(f"{ref_name} must be a Supabase project ref")
    if parsed.scheme not in ("postgresql", "postgres") or not parsed.hostname:
        sys.exit(f"{name} must be a PostgreSQL URL")
    username = unquote(parsed.username or "")
    host = parsed.hostname.lower()
    pooler = host.endswith(".pooler.supabase.com") and username == f"postgres.{ref}"
    direct = host == f"db.{ref}.supabase.co" and username == "postgres"
    if not (pooler or direct):
        sys.exit(f"{name} must authenticate as postgres for {ref}")
    if parsed.path != "/postgres":
        sys.exit(f"{name} must target the postgres database")
    return ref, host


prod_ref, _ = check("PROD_MIGRATION_DATABASE_URL", "PROD_PROJECT_REF")
if os.environ.get("PRE_MIGRATION_DATABASE_URL"):
    pre_ref, _ = check("PRE_MIGRATION_DATABASE_URL", "PRE_PROJECT_REF")
    if pre_ref == prod_ref:
        sys.exit("Production and preproduction must be distinct Supabase projects")

print("Database targets validated")
