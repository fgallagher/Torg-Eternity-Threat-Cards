# Session-Based Threat Cards Design

## Session Data Structure

```json
{
  "sessionId": "abc123",
  "name": "My Campaign Session",
  "createdAt": "2025-09-22T10:00:00Z",
  "lastUpdated": "2025-09-22T10:30:00Z",
  "createdBy": "dm-user-id", // Optional user identification
  "threats": [
    {
      "name": "Layla the Ape",
      "addedAt": "2025-09-22T10:00:00Z"
    },
    {
      "name": "Storm Knight",
      "addedAt": "2025-09-22T10:15:00Z"
    }
  ],
  "settings": {
    "allowViewerRequests": false, // Can viewers request threats to be added?
    "isPublic": true
  }
}
```

## URL Structure
- **Session Management**: `/` (existing page with session controls)
- **Session View**: `/session/abc123` (clean view for players)
- **Session Edit**: `/session/abc123/edit` (DM controls)

## User Flows

### DM Flow
1. Open main page
2. Click "Create Session"
3. Add threats from full list to session
4. Copy shareable link
5. Send link to players
6. Manage threats during game (add/remove)

### Player Flow
1. Receive session link
2. Open link to see curated threat list
3. View threats in player/GM mode
4. See real-time updates as DM adds/removes threats

## Implementation Options

### Option 1: Simple Node.js Backend
- Express server
- JSON file storage
- WebSocket for real-time updates
- Easy to self-host

### Option 2: Firebase/Supabase
- Hosted solution
- Real-time database
- Built-in real-time updates
- No server management needed

### Option 3: Static + localStorage
- No backend needed
- URL parameters for sharing
- Limited to what fits in URL
- No real-time updates

## Recommended Approach
Start with Option 1 (Simple Node.js) for full control and easy setup.