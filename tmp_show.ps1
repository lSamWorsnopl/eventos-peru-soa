Get-Content -Path 'frontend/src/pages/LandingPage.tsx' -Raw | % { [Text.Encoding]::UTF8.GetString([Text.Encoding]::Default.GetBytes()) }
