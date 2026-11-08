

# Security Fixes Implementation Plan

## Overview

This plan addresses the 3 critical security errors detected in the project's Row-Level Security (RLS) policies. The current configuration exposes user data to anonymous (unauthenticated) visitors, which creates privacy and security risks.

## Current Issues

| Issue | Table | Current Policy | Risk |
|-------|-------|---------------|------|
| All User Profile Data Exposed to Anonymous Visitors | `profiles` | `USING (true)` allows anyone to SELECT | Usernames and avatars visible to unauthenticated users |
| User Gaming Activity Exposed to Public | `games` | `status = 'completed'` allows anyone to SELECT completed games | Game history, scores, and user activity patterns exposed publicly |
| Detailed Gameplay Moves Visible to Anyone | `game_rounds` | Allows SELECT on rounds of completed games to anyone | Detailed gameplay data (locations, guesses, scores) publicly accessible |

## Proposed Solution

Restrict all public data access to **authenticated users only**. This maintains the leaderboard and game review functionality while requiring users to be logged in to view the data.

---

## Changes Required

### 1. Update `profiles` Table RLS Policy

**Current Policy:**
```text
Policy: "Users can view all profiles"
Command: SELECT
USING: true
```

**New Policy:**
```text
Policy: "Authenticated users can view all profiles"
Command: SELECT
USING: auth.uid() IS NOT NULL
```

This change ensures only logged-in users can view profile data (usernames, avatars) on the leaderboard.

---

### 2. Update `games` Table RLS Policy

**Current Policy:**
```text
Policy: "Anyone can view completed games"
Command: SELECT
USING: status = 'completed'
```

**New Policy:**
```text
Policy: "Authenticated users can view completed games"
Command: SELECT
USING: status = 'completed' AND auth.uid() IS NOT NULL
```

This ensures game history and scores are only visible to authenticated users.

---

### 3. Update `game_rounds` Table RLS Policy

**Current Policy:**
```text
Policy: "Anyone can view rounds of completed games"
Command: SELECT
USING: EXISTS (
  SELECT 1 FROM games 
  WHERE games.id = game_rounds.game_id 
  AND games.status = 'completed'
)
```

**New Policy:**
```text
Policy: "Authenticated users can view rounds of completed games"
Command: SELECT
USING: auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM games 
  WHERE games.id = game_rounds.game_id 
  AND games.status = 'completed'
)
```

This protects detailed gameplay data from unauthenticated access.

---

### 4. Update Leaderboard Page UI

Add a check to show a login prompt for unauthenticated users trying to access the leaderboard, since the data will no longer be accessible without authentication.

**File:** `src/pages/Leaderboard.tsx`

- Import `useAuth` hook
- Check if user is authenticated
- If not authenticated, display a friendly message with a link to sign in

---

## Technical Details

### Database Migration SQL

```sql
-- 1. Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view completed games" ON public.games;
DROP POLICY IF EXISTS "Anyone can view rounds of completed games" ON public.game_rounds;

-- 2. Create new authenticated-only policies
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view completed games"
  ON public.games FOR SELECT
  USING (status = 'completed' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view rounds of completed games"
  ON public.game_rounds FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = game_rounds.game_id 
      AND games.status = 'completed'
    )
  );
```

---

## User Experience Impact

| Feature | Before | After |
|---------|--------|-------|
| Leaderboard | Visible to everyone | Requires sign-in |
| Game History | Completed games visible to all | Requires sign-in |
| Game Details | Round details visible to all | Requires sign-in |

Users will still be able to:
- View the leaderboard after signing in
- See other players' completed games and round details
- Review their own game history

---

## Summary

This plan implements the principle of least privilege by requiring authentication for all data access while preserving full functionality for logged-in users. The changes involve 3 RLS policy updates and 1 UI component update.

