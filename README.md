# Local Attendance System — PWA

A mobile-first, offline attendance system using HTML, CSS, JavaScript, Bootstrap, IndexedDB and PWA.

## Features
- Employee management
- Check-in / Check-out
- Automatic late-coming calculation
- Early-out calculation
- Working-hours calculation
- Overtime calculation
- Monthly reports
- Shift/grace/break settings
- Local IndexedDB storage
- JSON backup/restore
- PWA install support
- No backend/server/database service required

## Important
Bootstrap is loaded from jsDelivr in the starter version. The application data itself is local/offline. For a truly 100% offline first launch, download Bootstrap CSS/icons locally and update the HTML references.

## Run locally
PWA service workers require a secure context or localhost.

Recommended:
1. Install VS Code.
2. Install a local server extension such as Live Server, or use Python.
3. Open this folder.
4. Serve the folder on localhost.
5. Open `http://localhost:5500/` (port may differ).
6. Add employees, set shift, then use Attendance.

Python option:
`python -m http.server 5500`

Then open:
`http://localhost:5500/`

## Mobile
For Android:
1. Put the project on a local network/server or deploy it to a HTTPS host.
2. Open the URL in Chrome.
3. Choose "Add to Home screen" / "Install app".
4. Data is stored in that browser's IndexedDB on that device.

## Backup
Dashboard → Backup creates a JSON file.
Dashboard → Restore imports a JSON backup.

## Calculation
Working minutes = checkout - check-in - configured break.
Late = max(0, check-in - shift start - grace).
Early out = max(0, shift end - checkout).
Overtime = max(0, checkout - shift end).

This is a starter full project and can be expanded with leave management, holidays, biometric/device authentication, PDF/Excel exports, dashboard charts, PIN lock, multiple shifts and payroll integration.
