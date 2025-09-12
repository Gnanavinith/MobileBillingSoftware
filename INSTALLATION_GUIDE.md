# Mobile Billing Software - Installation Guide

## Prerequisites

Before installing Mobile Billing, you need to install MongoDB on your computer.

### Step 1: Install MongoDB

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select "Windows" and download the MSI installer

2. **Install MongoDB:**
   - Run the downloaded MSI file
   - Choose "Complete" installation
   - **Important:** Check "Install MongoDB as a Service" during installation
   - Complete the installation

3. **Verify MongoDB is running:**
   - Open Services (press Win+R, type `services.msc`)
   - Look for "MongoDB" service
   - Status should be "Running"
   - If not running, right-click → Start

### Step 2: Install Mobile Billing

1. **Run the installer:**
   - Double-click `Mobile Billing Setup 1.0.0.exe`
   - Follow the installation wizard
   - Accept the license agreement
   - Choose installation directory (default is recommended)

2. **Launch the application:**
   - The app will start automatically after installation
   - Or find "Mobile Billing" in Start Menu or Desktop

## First Time Setup

1. **Login:**
   - Email: `admin@gmail.com`
   - Password: `123456`

2. **Start using:**
   - Add your first dealer
   - Add mobile inventory
   - Create your first bill

## Troubleshooting

### "Failed to fetch" Error
- **Cause:** MongoDB is not running
- **Solution:** 
  1. Open Services (Win+R → `services.msc`)
  2. Find "MongoDB" service
  3. Right-click → Start
  4. Restart Mobile Billing

### App Won't Start
- **Cause:** Multiple instances running
- **Solution:**
  1. Close all Mobile Billing windows
  2. Open Task Manager (Ctrl+Shift+Esc)
  3. End any "Mobile Billing" or "Electron" processes
  4. Restart the app

### Data Not Saving
- **Cause:** MongoDB connection issue
- **Solution:**
  1. Ensure MongoDB service is running
  2. Check Windows Firewall settings
  3. Restart both MongoDB and Mobile Billing

## Support

If you encounter any issues:
1. Check that MongoDB is running
2. Restart the application
3. Contact support with error details

## Features

- **Billing:** Create invoices for mobiles and accessories
- **Inventory Management:** Track stock levels
- **Dealer Management:** Manage supplier information
- **Reports:** View sales and profit reports
- **Service Management:** Handle repair services
- **Second Hand Mobiles:** Manage used phone sales

---

**Note:** This application stores all data locally on your computer. No internet connection required for normal operation.
