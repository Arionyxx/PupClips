# Manual Authentication Testing Guide

This document outlines the manual testing steps to verify the authentication flows in PupClips.

## Prerequisites

1. Supabase project is running (local or remote)
2. Environment variables are properly configured in `.env.local`
3. Development server is running (`npm run dev`)

## Test Cases

### 1. Sign Up Flow

**Steps:**

1. Navigate to `/auth`
2. Click on the "Sign Up" tab
3. Enter a valid email address (e.g., `test@example.com`)
4. Optionally enter a custom username (e.g., `testuser123`)
5. Enter a password (minimum 6 characters)
6. Confirm the password
7. Click "Sign Up"

**Expected Results:**

- ✅ Loading indicator appears on the button
- ✅ If successful, user is redirected to the home page (`/`)
- ✅ Header shows user avatar/dropdown instead of "Log in" button
- ✅ A profile row is created in the `profiles` table with username derived from email or custom username
- ✅ If error occurs, toast notification displays the error message
- ✅ Session persists across page refresh

**Error Cases to Test:**

- Password less than 6 characters → Error toast
- Passwords don't match → Error toast
- Email already exists → Supabase error toast
- Invalid email format → HTML5 validation

---

### 2. Sign In Flow

**Steps:**

1. Navigate to `/auth` (or click "Log in" in header)
2. Ensure "Sign In" tab is active
3. Enter existing user email
4. Enter correct password
5. Click "Sign In"

**Expected Results:**

- ✅ Loading indicator appears on the button
- ✅ If successful, user is redirected to home page
- ✅ Header shows authenticated state (avatar dropdown)
- ✅ Session persists across page refresh
- ✅ If error occurs, toast notification displays error

**Error Cases to Test:**

- Wrong password → "Invalid login credentials" toast
- Non-existent email → "Invalid login credentials" toast
- Empty fields → "Please fill in all fields" toast

---

### 3. Protected Routes

**Steps:**

1. While signed out, try to access `/upload`
2. Middleware should redirect to `/auth`
3. Sign in
4. Try to access `/upload` again

**Expected Results:**

- ✅ Unauthenticated users are redirected to `/auth`
- ✅ Authenticated users can access `/upload`
- ✅ Redirect preserves intended destination (optional enhancement)

---

### 4. Sign Out Flow

**Steps:**

1. Sign in if not already authenticated
2. Click on the user avatar in the header
3. Dropdown menu appears
4. Click "Sign Out"

**Expected Results:**

- ✅ Loading indicator appears briefly
- ✅ User is redirected to home page
- ✅ Header shows "Log in" button instead of avatar
- ✅ Session is cleared
- ✅ Accessing `/upload` redirects to `/auth`
- ✅ Refreshing the page maintains signed-out state

---

### 5. Header Authentication State

**Scenarios to Test:**

**When Signed Out:**

- ✅ Header shows "Log in" button
- ✅ Clicking "Log in" navigates to `/auth`

**When Signed In:**

- ✅ Header shows user avatar
- ✅ Avatar displays user initials as fallback
- ✅ Avatar displays profile image if available
- ✅ Clicking avatar opens dropdown menu
- ✅ Dropdown shows user's display name/username
- ✅ Dropdown shows user's email
- ✅ Dropdown has "Profile" link
- ✅ Dropdown has "Upload" link
- ✅ Dropdown has "Sign Out" option

---

### 6. Profile Bootstrap

**Steps:**

1. Create a new account (sign up)
2. Check Supabase dashboard → `profiles` table

**Expected Results:**

- ✅ Profile row exists with the new user's ID
- ✅ `username` is set (from custom input or derived from email)
- ✅ `display_name` is set (same as username initially)
- ✅ `created_at` and `updated_at` timestamps are set
- ✅ `avatar_url` and `bio` are initially null

**Test with handle_new_user() trigger:**

- The trigger should auto-create the profile
- Manual fallback in server action ensures profile exists

---

### 7. Session Persistence

**Steps:**

1. Sign in
2. Refresh the page multiple times
3. Close browser tab and reopen
4. Close browser completely and reopen

**Expected Results:**

- ✅ User remains signed in across all scenarios
- ✅ Header consistently shows authenticated state
- ✅ Protected routes remain accessible

---

### 8. Loading States

**Components to Check:**

- ✅ Sign In button shows spinner during submission
- ✅ Sign Up button shows spinner during submission
- ✅ Sign Out button shows spinner during action
- ✅ Header shows skeleton while loading auth state
- ✅ All form inputs are disabled during submission

---

### 9. Error Handling

**Test Various Error Scenarios:**

- ✅ Network errors → Appropriate error toast
- ✅ Supabase service errors → Error toast with message
- ✅ Invalid credentials → Clear error message
- ✅ Email already exists → Clear error message
- ✅ Weak password → Validation error

---

### 10. UI/UX Checks

**Visual Inspection:**

- ✅ Tabbed interface switches smoothly between Sign In/Sign Up
- ✅ Forms are styled consistently with Shadcn UI theme
- ✅ Loading states are clear and user-friendly
- ✅ Error toasts are positioned correctly and dismissible
- ✅ Header layout is responsive
- ✅ Dropdown menu is properly positioned
- ✅ Avatar fallback shows correct initials

---

## Integration with Supabase

### Database Verification

After completing auth flows, verify in Supabase:

1. **Auth Users Table** (`auth.users`)
   - New users appear with correct email
   - User IDs are valid UUIDs

2. **Profiles Table** (`public.profiles`)
   - Profile row exists for each user
   - Foreign key relationship is intact
   - Username follows constraints (3-30 chars, alphanumeric)

3. **RLS Policies**
   - Users can only see/edit their own profile
   - Test by attempting to access another user's data

---

## Cleanup After Testing

1. Delete test users from Supabase Auth dashboard
2. Corresponding profile rows should be cascade deleted (if FK constraint set)
3. Clear browser cookies/storage if needed

---

## Known Issues / Future Enhancements

- [ ] Email verification is not required (can be enabled in Supabase)
- [ ] Password reset flow not implemented yet
- [ ] OAuth providers (Google, GitHub) not configured
- [ ] Remember me / session duration customization
- [ ] Profile edit page not yet implemented

---

## Automated Testing (Future)

For future automated testing with Playwright or Vitest:

1. **E2E Tests:**
   - Sign up → Sign in → Sign out flow
   - Protected route access
   - Profile creation verification

2. **Component Tests:**
   - Auth form validation
   - SignOutButton behavior
   - Header authentication state rendering

3. **Integration Tests:**
   - Server actions error handling
   - Supabase client interactions
   - Middleware redirect logic
