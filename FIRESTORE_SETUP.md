# Firestore Setup Instructions

## Current Status

Tasks are now synced with Firebase Firestore! All task data is stored in the cloud and syncs in real-time.

## Firestore Structure

```
/users/{uid}/
  - User document (email, displayName, photoURL, createdAt)

  /tasks/{taskId}/
    - detail: string
    - stage: 'Entry' | 'Actionable' | 'Incubate' | 'Reference' | 'Archive'
    - completed: boolean
    - createdAt: timestamp
    - priority?: number
    - context?: string
    - timeFrame?: string
    - dayOfWeek?: number
    - dayOfMonth?: number
    - alertDateTime?: number
    - deadlineDateTime?: number
    - children?: Task[]
```

## Security Rules

To deploy the security rules to Firebase:

### Method 1: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studio-6322617027-3e57b`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

### Method 2: Using Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Security Rules Explanation

The rules ensure:
- ✅ Users can only read/write their own user document
- ✅ Users can only access their own tasks
- ✅ All operations require authentication
- ❌ Users cannot access other users' data

## Testing the Implementation

### 1. Sign in to the app
```
Go to http://localhost:9002/login
Click "Sign in with Google"
```

### 2. Create a new task
- Click the microphone button or use the voice recorder
- Add a task with voice or text
- The task will be saved to Firestore

### 3. Verify in Firebase Console
- Go to Firebase Console → Firestore Database
- Navigate to: `users/{your-uid}/tasks`
- You should see your tasks stored there

### 4. Test real-time sync
- Open the app in two browser tabs/windows
- Create a task in one tab
- Watch it appear in the other tab immediately!

### 5. Test updates
- Change a task's stage (Entry → Actionable)
- Mark a task as complete
- Delete a task
- All changes sync in real-time

## Migration from localStorage

**Important:** Tasks previously stored in localStorage are NOT automatically migrated to Firestore.

If you had tasks in localStorage that you want to keep:
1. Open browser DevTools → Console
2. Run: `localStorage.getItem('voiceflow-tasks')`
3. Copy the output
4. Manually re-create the tasks in the app

Alternatively, we can create a migration script if needed.

## Benefits of Firestore Sync

✅ **Real-time updates** - Changes appear instantly across all devices
✅ **Cloud backup** - Tasks are never lost
✅ **Multi-device** - Access tasks from phone, tablet, desktop
✅ **Offline support** - Firestore caches data locally (works offline)
✅ **Secure** - Security rules prevent unauthorized access
✅ **Scalable** - Can handle millions of tasks

## Troubleshooting

### Tasks not appearing?
- Check that you're signed in
- Check browser console for errors
- Verify Firestore security rules are deployed

### "Permission denied" errors?
- Ensure security rules are deployed correctly
- Check that user is authenticated
- Verify you're accessing your own tasks (not someone else's)

### Real-time updates not working?
- Check your internet connection
- Firestore uses WebSockets for real-time updates
- Some corporate firewalls may block WebSocket connections

## Next Steps (Optional Enhancements)

1. **Offline support** - Enable Firestore persistence for better offline experience
2. **Batch operations** - Optimize multiple task updates
3. **Task sharing** - Allow users to share tasks with others
4. **Search/filtering** - Add server-side search capabilities
5. **Task history** - Track changes to tasks over time
