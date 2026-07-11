# build-static-html.ps1 — fetch a route's server-rendered HTML from a running `next start`,
# inline its CSS, rewrite /_next and /sprites asset paths to file:// local paths, and strip
# JS, producing a self-contained scripts/rendered/<name>.html that renders offline via file://.
#
# WHY: this sandbox blocks all browser HTTP egress, so Chromium can't screenshot the live
# server — but it CAN render local files. Server components (the landing page) are fully
# self-contained in their SSR HTML, so this faithfully reproduces them for visual QA.
# Client components (e.g. /preview) render only their initial pre-hydration markup — enough
# to verify the default view (the dragon gallery), not tab-switching.
#
# Usage:  pwsh scripts/build-static-html.ps1            # landing + pricing + preview
#         then: node scripts/render-shot.mjs            # screenshots -> scripts/shots/
# Prereq: a `next build` then `next start -p 3200` running in the HOST context (not the
#         Bash sandbox — the server must share the host loopback the fetch below uses).
# Routes may be a plain path ("pricing") or a "name|path" pair when the path has
# query params or you want a custom output filename (e.g. "preview-insights|preview?view=insights").
param(
  [string]$BaseUrl = "http://127.0.0.1:3200",
  [string[]]$Routes = @(
    "",
    "pricing",
    "preview-garden|preview?view=garden",
    "preview-detail|preview?view=detail",
    "preview-detail-dark|preview?view=detail&dark=1",
    "preview-insights|preview?view=insights",
    "preview-insights-dark|preview?view=insights&dark=1",
    "preview-garden-dark|preview?view=garden&dark=1",
    "preview-wrapped|preview?view=wrapped",
    "preview-wellness|preview?view=wellness",
    "preview-wellness-dark|preview?view=wellness&dark=1"
  )
)
$ErrorActionPreference = "Stop"
$repo = (Resolve-Path "$PSScriptRoot\..").Path
$root = "file:///" + ($repo -replace '\\', '/')
$dir = Join-Path $repo "scripts\rendered"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

# discover + fetch the (server-component) CSS chunk from the landing page, rewrite its font url()s
$landingRaw = (Invoke-WebRequest -Uri "$BaseUrl/" -UseBasicParsing -TimeoutSec 15).Content
$cssRef = ([regex]::Match($landingRaw, '/_next/static/[^"]+\.css')).Value
$css = ""
if ($cssRef) { $css = (Invoke-WebRequest -Uri "$BaseUrl$cssRef" -UseBasicParsing -TimeoutSec 15).Content -replace '/_next/', "$root/.next/" }

foreach ($route in $Routes) {
  if ($route -match '\|') { $name, $path = $route -split '\|', 2 }
  else { $path = $route; $name = if ($route -eq "") { "landing" } else { $route } }
  try {
    $html = (Invoke-WebRequest -Uri "$BaseUrl/$path" -UseBasicParsing -TimeoutSec 15).Content
  } catch { Write-Host "$name : SKIP ($($_.Exception.Message))"; continue }
  $html = [regex]::Replace($html, '<script[\s\S]*?</script>', '', 'IgnoreCase')
  $html = [regex]::Replace($html, '<link[^>]*stylesheet[^>]*>', '', 'IgnoreCase')
  $html = $html -replace '/_next/', "$root/.next/"
  $html = $html -replace '(src|href)="/sprites/', "`$1=`"$root/public/sprites/"
  $html = $html -replace '(src|href)="/icons/', "`$1=`"$root/public/icons/"
  $html = $html -replace '</head>', "<style>$css</style></head>"
  $out = Join-Path $dir "$name.html"
  $html | Out-File -FilePath $out -Encoding utf8
  Write-Host "$name : wrote $out ($([math]::Round($html.Length/1024,1))KB)"
}
