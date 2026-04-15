# ============================================================
# utils.py — Community Fridge Project: Database & App Utilities
# ============================================================
# PURPOSE: All database access and shared helper functions live here.
#
# ARCHITECTURE NOTE (for future developers):
#   • All DB queries return pandas DataFrames for easy display in Streamlit.
#   • Data access goes through the Supabase Python client (REST API) via
#     supabase_client.py — no direct PostgreSQL connection is used here.
#   • Reads  → supabase.table(...).select(...).execute()
#   • Writes → supabase.table(...).insert/update/delete/upsert(...).execute()
#   • All public functions keep the same signatures and return types they
#     had before so callers (app.py, pages/*.py) need no changes.
#
# EDIT SETTINGS IN: config.py  (not here)
# ============================================================

import streamlit as st
import pandas as pd
from datetime import date, timedelta
from typing import Optional

from config import (
    SKILL_TAGS, INITIATIVE_TYPES, STATUS_COLORS,
    LOW_FILL_THRESHOLD, CRIT_FILL_THRESHOLD,
    UPCOMING_DAYS_WINDOW,
)
from supabase_client import supabase


# ============================================================
# VOLUNTEER HELPERS
# ============================================================

def get_all_volunteers(active_only: bool = True) -> pd.DataFrame:
    """
    Fetch all volunteers with their skill tags merged into one column.

    Returns columns:
        id, name, email, phone, is_active, joined_date, notes, skills
        (skills = comma-separated tag keys, e.g. "cleaning,delivery")
    """
    try:
        q = supabase.table('volunteers').select(
            'id, name, email, phone, is_active, joined_date, notes, volunteer_tags(tag)'
        )
        if active_only:
            q = q.eq('is_active', True)
        response = q.order('name').execute()
        rows = response.data
        if not rows:
            return pd.DataFrame()
        for r in rows:
            tags = sorted(t['tag'] for t in (r.pop('volunteer_tags', []) or []))
            r['skills'] = ','.join(tags)
        return pd.DataFrame(rows)
    except Exception as e:
        st.error(f"Query error: {e}")
        return pd.DataFrame()


def get_volunteers_by_skill(skill_tag: str) -> pd.DataFrame:
    """
    Return active volunteers who hold a specific skill tag.

    Args:
        skill_tag — one of the keys from SKILL_TAGS in config.py

    Returns columns: id, name, email, phone
    """
    try:
        tag_resp = (
            supabase.table('volunteer_tags')
            .select('volunteer_id')
            .eq('tag', skill_tag)
            .execute()
        )
        vol_ids = [r['volunteer_id'] for r in (tag_resp.data or [])]
        if not vol_ids:
            return pd.DataFrame()
        resp = (
            supabase.table('volunteers')
            .select('id, name, email, phone')
            .eq('is_active', True)
            .in_('id', vol_ids)
            .order('name')
            .execute()
        )
        return pd.DataFrame(resp.data) if resp.data else pd.DataFrame()
    except Exception as e:
        st.error(f"Query error: {e}")
        return pd.DataFrame()


def get_volunteer_by_id(volunteer_id: int) -> Optional[dict]:
    """Return a single volunteer record as a dict, or None."""
    try:
        resp = (
            supabase.table('volunteers')
            .select('*')
            .eq('id', volunteer_id)
            .execute()
        )
        return resp.data[0] if resp.data else None
    except Exception as e:
        st.error(f"Query error: {e}")
        return None


def add_volunteer(
    name: str,
    email: str,
    phone: str,
    tags: list,
    notes: str = "",
) -> Optional[int]:
    """
    Insert a new volunteer and their skill tags.

    Args:
        name   — full name (required)
        email  — email address (can be empty string)
        phone  — phone number (can be empty string)
        tags   — list of skill tag keys, e.g. ["sack_lunch", "delivery"]
        notes  — optional admin notes

    Returns:
        new volunteer id (int) on success, None on failure
    """
    try:
        resp = supabase.table('volunteers').insert({
            'name': name,
            'email': email or None,
            'phone': phone or None,
            'notes': notes or None,
        }).execute()
        if not resp.data:
            return None
        new_id = resp.data[0]['id']
        if tags:
            supabase.table('volunteer_tags').upsert(
                [{'volunteer_id': new_id, 'tag': tag} for tag in tags],
                ignore_duplicates=True,
            ).execute()
        return new_id
    except Exception as e:
        st.error(f"Could not add volunteer: {e}")
        return None


def update_volunteer(
    volunteer_id: int,
    name: str,
    email: str,
    phone: str,
    tags: list,
    notes: str = "",
    is_active: bool = True,
) -> bool:
    """
    Update an existing volunteer's info and replace their skill tags.

    Replaces all tags (delete + re-insert) to keep logic simple.
    """
    try:
        supabase.table('volunteers').update({
            'name': name,
            'email': email or None,
            'phone': phone or None,
            'notes': notes or None,
            'is_active': is_active,
        }).eq('id', volunteer_id).execute()

        # Replace all tags
        supabase.table('volunteer_tags').delete().eq('volunteer_id', volunteer_id).execute()
        if tags:
            supabase.table('volunteer_tags').insert(
                [{'volunteer_id': volunteer_id, 'tag': tag} for tag in tags]
            ).execute()
        return True
    except Exception as e:
        st.error(f"Could not update volunteer: {e}")
        return False


def get_volunteer_tags(volunteer_id: int) -> list:
    """Return list of tag keys for a volunteer."""
    try:
        resp = (
            supabase.table('volunteer_tags')
            .select('tag')
            .eq('volunteer_id', volunteer_id)
            .order('tag')
            .execute()
        )
        return [r['tag'] for r in resp.data] if resp.data else []
    except Exception as e:
        st.error(f"Query error: {e}")
        return []


# ============================================================
# FRIDGE HELPERS
# ============================================================

def get_all_fridges(active_only: bool = True) -> pd.DataFrame:
    """Return fridge locations as a DataFrame."""
    try:
        q = supabase.table('fridges').select('id, name, address, city, is_active, notes')
        if active_only:
            q = q.eq('is_active', True)
        resp = q.order('name').execute()
        return pd.DataFrame(resp.data) if resp.data else pd.DataFrame()
    except Exception as e:
        st.error(f"Query error: {e}")
        return pd.DataFrame()


def fridge_options() -> dict:
    """Return {name: id} dict for use in st.selectbox."""
    df = get_all_fridges()
    if df.empty:
        return {}
    return dict(zip(df["name"], df["id"]))


# ============================================================
# INITIATIVE HELPERS
# ============================================================

def get_all_initiatives(active_only: bool = True) -> pd.DataFrame:
    """Return all initiative templates."""
    try:
        q = supabase.table('initiatives').select(
            'id, name, initiative_type, day_of_week, optimal_seats, max_seats,'
            ' is_recurring, is_active, description, fridges(name)'
        )
        if active_only:
            q = q.eq('is_active', True)
        resp = q.order('day_of_week').order('name').execute()
        rows = resp.data or []
        for r in rows:
            fridge = r.pop('fridges', None)
            r['fridge_name'] = fridge['name'] if fridge else None
        return pd.DataFrame(rows) if rows else pd.DataFrame()
    except Exception as e:
        st.error(f"Query error: {e}")
        return pd.DataFrame()


# ============================================================
# EVENT HELPERS
# ============================================================

def get_upcoming_events(days_ahead: int = UPCOMING_DAYS_WINDOW) -> pd.DataFrame:
    """
    Return events in the next N days with seat fill metrics.

    Queries the vw_event_capacity view.
    Returns columns: event_id, event_date, initiative_name, initiative_type,
                     optimal_seats, seats_filled, seats_needed, fill_pct,
                     status, fridge_name, fridge_address
    """
    try:
        today = date.today().isoformat()
        end_date = (date.today() + timedelta(days=days_ahead)).isoformat()
        resp = (
            supabase.table('vw_event_capacity')
            .select('*')
            .gte('event_date', today)
            .lte('event_date', end_date)
            .not_.in_('status', ['cancelled', 'completed'])
            .order('event_date')
            .order('initiative_name')
            .execute()
        )
        return pd.DataFrame(resp.data) if resp.data else pd.DataFrame()
    except Exception as e:
        st.error(f"Query error: {e}")
        return pd.DataFrame()


def get_unfilled_events(days_ahead: int = UPCOMING_DAYS_WINDOW) -> pd.DataFrame:
    """Return only events that are below their optimal seat count."""
    df = get_upcoming_events(days_ahead)
    if df.empty:
        return df
    return df[df["seats_needed"] > 0].copy()


def get_event_volunteers(event_id: int) -> pd.DataFrame:
    """
    Return volunteers who signed up for a specific event.

    Returns columns: name, phone, email, skill_tag, confirmed, status, signed_up_at
    """
    try:
        resp = (
            supabase.table('event_signups')
            .select('skill_tag, confirmed, status, signed_up_at, volunteers(name, phone, email)')
            .eq('event_id', event_id)
            .execute()
        )
        rows = resp.data or []
        for r in rows:
            vol = r.pop('volunteers', {}) or {}
            r['name'] = vol.get('name')
            r['phone'] = vol.get('phone')
            r['email'] = vol.get('email')
        return pd.DataFrame(rows) if rows else pd.DataFrame()
    except Exception as e:
        st.error(f"Query error: {e}")
        return pd.DataFrame()


def signup_volunteer_for_event(
    event_id: int,
    volunteer_id: int,
    skill_tag: str = None,
) -> bool:
    """
    Create a sign-up record. Safe to call multiple times (upsert, ignore on conflict).
    """
    try:
        supabase.table('event_signups').upsert(
            {'event_id': event_id, 'volunteer_id': volunteer_id, 'skill_tag': skill_tag or None},
            ignore_duplicates=True,
        ).execute()
        return True
    except Exception as e:
        st.error(f"Write error: {e}")
        return False


def cancel_signup(event_id: int, volunteer_id: int) -> bool:
    """Mark a sign-up as cancelled (soft delete)."""
    try:
        supabase.table('event_signups').update(
            {'status': 'cancelled'}
        ).eq('event_id', event_id).eq('volunteer_id', volunteer_id).execute()
        return True
    except Exception as e:
        st.error(f"Write error: {e}")
        return False


def generate_weekly_events(days_ahead: int = 14) -> int:
    """
    Auto-populate the events table for the next N days.

    Iterates over all active, recurring initiatives and creates a row
    in the events table for each matching weekday in the window.
    Safe to call multiple times (upsert ignores conflicts).

    Returns:
        Number of new event rows created.
    """
    try:
        resp = (
            supabase.table('initiatives')
            .select('id, name, day_of_week')
            .eq('is_recurring', True)
            .eq('is_active', True)
            .not_.is_('day_of_week', 'null')
            .execute()
        )
        initiatives = resp.data or []
    except Exception as e:
        st.error(f"Error fetching initiatives: {e}")
        return 0

    if not initiatives:
        return 0

    day_map = {
        "Monday": 0, "Tuesday": 1, "Wednesday": 2,
        "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6,
    }

    today = date.today()
    to_insert = []

    for row in initiatives:
        target_dow = day_map.get(row["day_of_week"])
        if target_dow is None:
            continue
        for delta in range(days_ahead):
            check_date = today + timedelta(days=delta)
            if check_date.weekday() == target_dow:
                to_insert.append({
                    'initiative_id': row['id'],
                    'event_date': check_date.isoformat(),
                    'status': 'open',
                })

    if not to_insert:
        return 0

    try:
        resp = supabase.table('events').upsert(
            to_insert,
            on_conflict='initiative_id,event_date',
            ignore_duplicates=True,
        ).execute()
        return len(resp.data) if resp.data else 0
    except Exception as e:
        st.error(f"Error generating events: {e}")
        return 0


def log_outreach(
    event_id: int,
    volunteer_id: int,
    method: str,
    message: str = "",
    notes: str = "",
) -> bool:
    """Record that Karen (or the system) reached out to a volunteer."""
    try:
        supabase.table('outreach_log').insert({
            'event_id': event_id,
            'volunteer_id': volunteer_id,
            'method': method,
            'message_sent': message or None,
            'notes': notes or None,
        }).execute()
        return True
    except Exception as e:
        st.error(f"Write error: {e}")
        return False


# ============================================================
# DONOR HELPERS
# ============================================================

def get_all_donors() -> pd.DataFrame:
    """Return all active donors."""
    try:
        resp = (
            supabase.table('donors')
            .select('id, name, email, phone, organization, donor_type, first_gift_date, last_contact, notes')
            .eq('is_active', True)
            .order('name')
            .execute()
        )
        return pd.DataFrame(resp.data) if resp.data else pd.DataFrame()
    except Exception as e:
        st.error(f"Query error: {e}")
        return pd.DataFrame()


def add_donor(
    name: str,
    email: str,
    phone: str,
    organization: str,
    donor_type: str,
    notes: str = "",
) -> bool:
    """Insert a new donor record."""
    try:
        supabase.table('donors').insert({
            'name': name,
            'email': email or None,
            'phone': phone or None,
            'organization': organization or None,
            'donor_type': donor_type,
            'notes': notes or None,
        }).execute()
        return True
    except Exception as e:
        st.error(f"Write error: {e}")
        return False


def update_donor_contact(donor_id: int, notes: str = "") -> bool:
    """Stamp last_contact = today and optionally update notes."""
    try:
        update_data: dict = {'last_contact': date.today().isoformat()}
        if notes:
            update_data['notes'] = notes
        supabase.table('donors').update(update_data).eq('id', donor_id).execute()
        return True
    except Exception as e:
        st.error(f"Write error: {e}")
        return False


# ============================================================
# FOOD RECOVERY / SCHOOL CONTACT HELPERS
# ============================================================

def get_food_recovery_contacts() -> pd.DataFrame:
    """Return all active food recovery contacts (e.g., Tovala)."""
    try:
        resp = (
            supabase.table('food_recovery_contacts')
            .select('id, org_name, contact_name, email, phone, pickup_day, pickup_location, reallocation_notes')
            .eq('is_active', True)
            .order('org_name')
            .execute()
        )
        return pd.DataFrame(resp.data) if resp.data else pd.DataFrame()
    except Exception as e:
        st.error(f"Query error: {e}")
        return pd.DataFrame()


def get_school_contacts() -> pd.DataFrame:
    """Return all active school contacts for food drives."""
    try:
        resp = (
            supabase.table('school_contacts')
            .select('id, school_name, contact_name, email, phone, last_drive_date, notes')
            .eq('is_active', True)
            .order('school_name')
            .execute()
        )
        return pd.DataFrame(resp.data) if resp.data else pd.DataFrame()
    except Exception as e:
        st.error(f"Query error: {e}")
        return pd.DataFrame()


# ============================================================
# UI HELPER FUNCTIONS
# ============================================================

def get_fill_color(fill_pct) -> str:
    """
    Map a seat fill percentage to a status hex color.

    100+% → green  (STATUS_COLORS["filled"])
    60-99% → gray   (neutral)
    30-59% → amber  (low)
    0-29%  → red    (critical)
    """
    try:
        pct = float(fill_pct or 0)
    except (TypeError, ValueError):
        pct = 0.0
    if pct >= 100:
        return STATUS_COLORS["filled"]
    elif pct >= LOW_FILL_THRESHOLD * 100:
        return STATUS_COLORS["neutral"]
    elif pct >= CRIT_FILL_THRESHOLD * 100:
        return STATUS_COLORS["low"]
    else:
        return STATUS_COLORS["critical"]


def skill_labels(skills_csv: str) -> str:
    """
    Convert a comma-separated string of tag keys into display labels.

    Example:
        skill_labels("cleaning,delivery")
        → "🧹 Cleaning  🚗 Delivery"
    """
    if not skills_csv:
        return "—"
    tags = [t.strip() for t in skills_csv.split(",") if t.strip()]
    return "  ".join(SKILL_TAGS.get(t, t) for t in tags)


def volunteer_select_options(active_only: bool = True) -> dict:
    """
    Return {display_label: id} dict for use in Streamlit selectboxes.

    Example usage:
        options = volunteer_select_options()
        chosen = st.selectbox("Volunteer", list(options.keys()))
        vol_id = options[chosen]
    """
    df = get_all_volunteers(active_only)
    if df.empty:
        return {}
    # Format: "Jane Doe (🥪 Sack Lunch, 🚗 Delivery)"
    labels = df.apply(
        lambda r: f"{r['name']}  ({skill_labels(r['skills'])})" if r["skills"] else r["name"],
        axis=1,
    )
    return dict(zip(labels, df["id"]))
