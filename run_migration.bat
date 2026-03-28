@echo off
echo 🚀 SMART DEPARTMENT PORTAL - CLOUD DATA MIGRATOR
echo --------------------------------------------------
echo This will push all your local SQLite data to Firestore Cloud.
echo Ensure you have 'backend/config/nexusportal-service-key.json' in place.
echo.
cd backend
node scripts/migrate_sqlite_to_firestore.js
echo.
echo --------------------------------------------------
echo Done! Please check your cloud dashboard.
pause
