# Database Cleanup Scripts

## cleanup-unverified-users.js

This script deletes old user accounts that were created before email verification was implemented.

### What it does:
- Finds all users with `emailVerified: false` or where the field doesn't exist
- Displays a list of users that will be deleted
- Requires manual confirmation before deletion (safety feature)
- Deletes the unverified accounts
- Logs the number of accounts deleted

### How to use:

1. **Preview users to be deleted (safe mode):**
   ```bash
   cd server
   node scripts/cleanup-unverified-users.js
   ```
   This will show you the list of unverified users WITHOUT deleting them.

2. **Actually delete the users:**
   - Open `scripts/cleanup-unverified-users.js`
   - Find the line: `const CONFIRM_DELETE = false;`
   - Change it to: `const CONFIRM_DELETE = true;`
   - Save the file
   - Run the script again:
   ```bash
   node scripts/cleanup-unverified-users.js
   ```

3. **Important:**
   - After deletion, set `CONFIRM_DELETE` back to `false` to prevent accidental future deletions
   - This action is **irreversible** - deleted users cannot be recovered
   - Make a database backup before running if you're unsure

### When to use:
- After implementing email verification feature
- To clean up test accounts
- To remove spam/fake registrations

### Safety features:
- Displays user list before deletion
- Requires manual flag change to confirm
- Only deletes unverified users (verified users are safe)
- Logs all operations

### Example output:

```
Connecting to MongoDB...
Connected to MongoDB successfully

Found 3 unverified user(s)

The following users will be deleted:
─────────────────────────────────────────────────
1. Test User (test@example.com)
   Created: 2024-01-15T10:30:00.000Z
   Email Verified: false

2. John Doe (john@test.com)
   Created: 2024-01-16T14:20:00.000Z
   Email Verified: false

3. Jane Smith (jane@example.com)
   Created: 2024-01-17T09:15:00.000Z
   Email Verified: false

─────────────────────────────────────────────────

⚠️  WARNING: This action is irreversible!
To proceed with deletion, set CONFIRM_DELETE=true in this script.

Deletion cancelled. No users were deleted.
To delete these users, set CONFIRM_DELETE=true in the script and run again.
```

## Notes:
- Always backup your database before running destructive operations
- Consider keeping a record of deleted users (export to JSON before deletion)
- This script is intended for one-time use after implementing email verification
