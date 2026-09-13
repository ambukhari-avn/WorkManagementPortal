# Deployment Guide — IIS (Windows)

This guide covers deploying both the ASP.NET Core API and the Angular frontend to local IIS as two separate sites.

## Prerequisites

- IIS enabled on Windows (`IIS-WebServerRole` feature)
- **IIS Management Console** enabled separately (`IIS-ManagementConsole`) — not installed by default even when the web server role is
- **.NET Core Hosting Bundle** installed (separate from the SDK — download from https://dotnet.microsoft.com/download/dotnet, under "ASP.NET Core Runtime" → Hosting Bundle for your installed version)

Verify the Hosting Bundle installed correctly:
```powershell
Get-Item "C:\Program Files\IIS\Asp.Net Core Module\V2\aspnetcorev2.dll"
```
This should return a valid file. If empty, the Hosting Bundle isn't installed (or PowerShell needs to be run as Administrator to see it).

## Step 1: Publish the API

```bash
cd src/API
dotnet publish -c Release -o "C:\inetpub\wwwroot\WorkManagementApi"
```

**Note:** If IIS is currently running the site, stop it first (`Stop-Website -Name "WorkManagementApi"`) — publishing will fail with "Access Denied" if the DLLs are locked by a running process.

## Step 2: Publish the Angular App

```bash
cd src/Web
ng build --configuration production
```

Copy the build output (note: Angular nests output under a `browser/` subfolder):
```powershell
Copy-Item -Recurse "dist\Web\browser\*" "C:\inetpub\wwwroot\WorkManagementWeb\" -Force
```

## Step 3: Create the `UploadedFiles` Directory Manually

The API's static file provider (for serving task attachments) requires this folder to **already exist** — it does not auto-create it, and the app will crash on startup (`DirectoryNotFoundException`) if it's missing:

```powershell
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\WorkManagementApi\UploadedFiles" -Force
```

## Step 4: Create the IIS Sites

In IIS Manager (or via PowerShell):

**API site:**
- Site name: `WorkManagementApi`
- Physical path: `C:\inetpub\wwwroot\WorkManagementApi`
- Binding: `http`, port `5090` (or your choice)

**Web site:**
- Site name: `WorkManagementWeb`
- Physical path: `C:\inetpub\wwwroot\WorkManagementWeb`
- Binding: `http`, port `8080` (or your choice — avoid `80` if something else already uses it)

## Step 5: Fix the API Application Pool's Managed Runtime

By default, IIS may create the app pool with `.NET CLR Version v4.0` — ASP.NET Core apps need **"No Managed Code"** instead, since the ASP.NET Core Module handles the runtime itself:

```powershell
Set-ItemProperty -Path "IIS:\AppPools\WorkManagementApi" -Name managedRuntimeVersion -Value ""
```

## Step 6: Set the JWT Signing Key (Without Committing It to Source)

The published `appsettings.json` intentionally does **not** contain `Jwt:Key` (kept out of source control). Set it as a machine-level environment variable instead — ASP.NET Core automatically maps `Jwt__Key` (double underscore) to the `Jwt:Key` config path:

```powershell
[System.Environment]::SetEnvironmentVariable("Jwt__Key", "<your actual secret key>", "Machine")
```

Restart IIS fully after setting this, since worker processes only pick up environment variables at process start:
```powershell
net stop was /y
net start w3svc
```

## Step 7: Update CORS to Allow the Deployed Frontend Origin

In `Program.cs`, before publishing:
```csharp
policy.WithOrigins("http://localhost:4200", "http://localhost:8080")
```
Adjust the port to match whatever you bound `WorkManagementWeb` to. Republish the API after this change (it's compiled code, not a loose config file).

## Step 8: Update the Angular Production API URL

`src/Web/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:5090/api'
};
```
Adjust the port to match the API site. Rebuild and re-copy the Angular output after any change here (this value is compiled into the JS bundle).

## Step 9: Start Both Sites

```powershell
Start-Website -Name "WorkManagementApi"
Start-Website -Name "WorkManagementWeb"
```

## Step 10: Verify

```powershell
Invoke-WebRequest -Uri "http://localhost:5090/health" -UseBasicParsing
```
Expect `200 OK` with body `Healthy`.

Then open `http://localhost:8080` in a browser and confirm login and navigation work end-to-end.

## Troubleshooting

| Symptom | Likely Cause |
|---|---|
| `500.30 - ASP.NET Core app failed to start` | Check Windows Event Viewer → Application log, filtered to source `IIS AspNetCore Module V2` — it shows the actual startup exception |
| `503 Service Unavailable`, no new event log entries | Application Pool crashed repeatedly and IIS's rapid-fail protection disabled it. Stop and restart the pool: `Stop-WebAppPool` then `Start-WebAppPool` |
| CORS errors in browser console | The deployed frontend's exact origin (protocol + host + port) isn't in the API's `WithOrigins(...)` list — republish the API after fixing |
| Attachments won't download | `UploadedFiles` folder missing, or old database records point to files that don't physically exist in the fresh deployment folder |
| File copy/publish fails with "Access Denied" | The IIS site is still running and has the files locked — stop the site first |

## Security Note

This deployment uses HTTP (not HTTPS) and stores the JWT key via a machine environment variable for local/learning purposes. A production deployment would require HTTPS bindings with a real certificate and a proper secrets manager (Azure Key Vault, AWS Secrets Manager, etc.) instead of a plain environment variable.