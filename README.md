# Simple UI - Rundeskio API Test Interface

A dead simple, old-school black and white UI for testing Rundeskio Work Service and Communications Service APIs.

## Design Philosophy

- **Brutalist/Minimalist**: No fancy graphics, just text and borders
- **Monospace Font**: Courier New for that classic terminal feel
- **Black & White Only**: High contrast, printer-friendly
- **Pure Vanilla JS**: No frameworks, no build process
- **Semantic HTML**: Clean, accessible markup
- **Full API Integration**: Complete CRUD operations for both services

## Features

### Configuration
- **API Endpoint Configuration**: Set custom URLs for Work and Comms services
- **Persistent Settings**: Configuration saved to localStorage
- **Health Checks**: Test API connectivity before use

### Work Service Integration
- **Workspaces**: Create, list, view, update, delete workspaces
- **Tasks**: Full CRUD for tasks with filtering by workspace
- **Goals**: Manage goals with progress tracking
- **Bookmarks**: Create and manage workspace bookmarks

### Communications Service Integration
- **Announcements**: Workspace-scoped announcements with priority levels
- **Memos**: Organization-wide memos with types and visibility
- **Decision Records**: Document decisions with context and alternatives
- **Celebrations**: Recognize achievements and milestones

### UI Features
- **Section-based Navigation**: Clean tabbed interface
- **Form Validation**: Client-side validation before API calls
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during API operations
- **Copy to Clipboard**: Easy UUID copying for workspace IDs
- **Data Tables**: Clean display of API responses

## File Structure

```
simple-ui/
├── index.html          # Main HTML structure with all sections
├── styles.css          # Old-school black & white styling
├── api-client.js       # API wrapper for Work & Comms services
├── script.js           # UI controller and event handlers
└── README.md           # This file
```

## Usage

### 1. Start the Test Server

```bash
# Using Python's built-in server
python -m http.server 8000

# Or use any static file server
npx serve .
```

Then navigate to: **http://localhost:8000**

### 2. Configure API Endpoints

1. Click on "Config" in the navigation
2. Enter your Work Service API URL (e.g., `http://localhost:8000/api/v1`)
3. Enter your Comms Service API URL (e.g., `http://localhost:8001/api/v1`)
4. Enter valid Organization ID (UUID format)
5. Enter valid User ID (UUID format)
6. Click "Save Configuration"
7. Click "Test Connections" to verify connectivity

### 3. Interact with APIs

Navigate to any section and start creating/viewing/managing resources:

- **Workspaces**: Create workspaces, copy IDs for use in other sections
- **Tasks**: Create tasks within workspaces
- **Goals**: Set and track goals
- **Announcements**: Post announcements to workspaces
- **Memos**: Create organizational memos
- **Decisions**: Document key decisions
- **Celebrations**: Recognize achievements

## API Client Details

The `api-client.js` provides a clean wrapper around both services:

### Work Service Endpoints
- `GET /workspaces` - List all workspaces
- `POST /workspaces` - Create workspace
- `GET /workspaces/{id}` - Get workspace details
- `PUT /workspaces/{id}` - Update workspace
- `DELETE /workspaces/{id}` - Delete workspace
- `GET /workspaces/{id}/tasks` - List tasks in workspace
- `POST /workspaces/{id}/tasks` - Create task
- `GET /workspaces/{id}/goals` - List goals in workspace
- `POST /workspaces/{id}/goals` - Create goal

### Comms Service Endpoints
- `GET /workspaces/{id}/announcements` - List announcements
- `POST /workspaces/{id}/announcements` - Create announcement
- `GET /orgs/{orgId}/memos` - List memos
- `POST /orgs/{orgId}/memos` - Create memo
- `GET /orgs/{orgId}/decisions` - List decisions
- `POST /orgs/{orgId}/decisions` - Create decision
- `GET /orgs/{orgId}/celebrations` - List celebrations
- `POST /orgs/{orgId}/celebrations` - Create celebration

All endpoints support proper:
- **Authentication Headers**: `X-Org-Id` and `X-User-Id`
- **Error Handling**: User-friendly error messages
- **Logging**: Console logging for debugging
- **JSON Serialization**: Automatic request/response handling

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

Requires:
- `localStorage` support (for config persistence)
- `fetch` API (for HTTP requests)
- ES6+ JavaScript (async/await, arrow functions)

## Development Tips

### Debugging
- Open browser DevTools (F12)
- Check Console tab for API request/response logs
- Network tab shows all HTTP traffic
- Application tab shows localStorage values

### Testing Different Environments
The configuration screen allows you to quickly switch between:
- Local development (`http://localhost:8000`)
- Docker containers (`http://work-service:8000`)
- Remote staging/production servers

### CORS Issues
If you encounter CORS errors:
1. Ensure your API services have CORS enabled
2. Add your test UI origin to allowed origins
3. Or use a CORS proxy for testing

## Security Notes

- **No Authentication**: This UI doesn't handle JWT tokens
- **Headers Only**: Uses `X-Org-Id` and `X-User-Id` headers for identification
- **Local Storage**: API credentials stored in browser localStorage
- **Development Only**: Not intended for production use

## Customization

### Colors
To change the color scheme, update `styles.css`:
- `#000000` - Black (text, borders)
- `#ffffff` - White (backgrounds)
- `#f5f5f5` - Light gray (alternate backgrounds)
- `#f0f0f0` - Lighter gray (hover states)

### Fonts
Change the monospace font in `styles.css`:
```css
body {
    font-family: "Courier New", Courier, monospace;
}
```

### API Base URLs
Default URLs in `api-client.js`:
- Work Service: `http://localhost:8000/api/v1`
- Comms Service: `http://localhost:8001/api/v1`

## Troubleshooting

### "Configuration saved successfully" but APIs don't work
- Check that Org ID and User ID are valid UUIDs
- Verify API services are running
- Click "Test Connections" to check health endpoints

### "CORS error" in console
- API services need CORS middleware configured
- Check `ALLOWED_ORIGINS` environment variable on services

### "Invalid UUID" errors
- Ensure Org ID and User ID are proper UUID format
- Example: `00000000-0000-0000-0000-000000000000`

### Forms submit but nothing happens
- Check browser console for JavaScript errors
- Verify API client is loaded (check Network tab)
- Check API response in Network tab

## Future Enhancements

Potential additions:
- Newsletter management UI
- Knowledge share (tips/tutorials) section
- Reactions and pins UI
- Unified feed view
- Search across all communications
- Bulk operations (multi-select + bulk actions)
- Export data to JSON/CSV
- Dark mode toggle (while keeping brutalist aesthetic)

## License

Public domain - use however you want for testing your Rundeskio APIs.

## Support

This is a test interface. For API documentation, refer to:
- Work Service: `GET /docs` (when DEBUG=True)
- Comms Service: `GET /docs` (when DEBUG=True)
