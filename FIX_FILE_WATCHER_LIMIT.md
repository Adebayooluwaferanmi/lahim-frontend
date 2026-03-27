# Fix File Watcher Limit (ENOSPC Error)

## Problem
```
Error: ENOSPC: System limit for number of file watchers reached
```

This error occurs when the Linux system's inotify file watcher limit is too low for large projects with many files (especially in `node_modules`).

## Solution

### Permanent Fix (Recommended)

Run these commands to increase the limit permanently:

```bash
# Check current limit
cat /proc/sys/fs/inotify/max_user_watches

# Increase limit to 524288 (recommended for large projects)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Verify the change
cat /proc/sys/fs/inotify/max_user_watches
```

### Temporary Fix (Until Reboot)

If you can't use sudo or need a temporary fix:

```bash
# Temporary increase (resets on reboot)
sudo sysctl fs.inotify.max_user_watches=524288
```

### Alternative: Increase Further

For very large projects, you might need even more:

```bash
# Increase to 1 million (for extremely large projects)
echo fs.inotify.max_user_watches=1048576 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Verify Fix

After applying the fix, restart your dev server:

```bash
cd packages/frontend
yarn start
```

The error should be gone!

## Why This Happens

- React development server uses file watchers to detect changes
- Large `node_modules` directories require many watchers
- Default Linux limit (usually 8192) is too low for modern projects
- Increasing to 524288 is safe and recommended

## Additional Tips

### Reduce Watched Files (Alternative)

If you can't increase the limit, you can reduce the number of watched files:

1. **Exclude node_modules from watching** (not recommended, breaks hot reload)
2. **Use polling instead of file watching** (slower, but works):

```bash
# In package.json, modify start script:
"start": "WATCHPACK_POLLING=true react-app-rewired start"
```

### Check Current Usage

```bash
# See how many file watchers are in use
find /proc/*/fd -lname anon_inode:inotify -printf '%h\n' 2>/dev/null | cut -d/ -f3 | xargs -I '{}' -- ps --no-headers -o '%p %U %c' -p '{}' | uniq -c | sort -rn
```

## References

- [Linux inotify documentation](https://man7.org/linux/man-pages/man7/inotify.7.html)
- [React Scripts issue](https://github.com/facebook/create-react-app/issues/4548)

