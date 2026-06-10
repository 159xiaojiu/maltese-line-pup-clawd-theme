# Build only theme-used assets (no duplicate aliases)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Assets = Join-Path $Root "assets"
$Opaque = Join-Path $Assets "_opaque"
$Src = Join-Path $Root "assets\line-stickers"
$Raw = Join-Path $Root "assets\raw"
New-Item -ItemType Directory -Force -Path $Assets, $Opaque | Out-Null
Get-ChildItem $Opaque -File -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem $Assets -File -ErrorAction SilentlyContinue | Remove-Item -Force

function Copy-Asset($dest, $source) {
    if (-not (Test-Path $source)) { throw "Missing source: $source" }
    Copy-Item -Force $source (Join-Path $Opaque $dest)
    Write-Host "OK $dest"
}

# idle
Copy-Asset "maltese-idle-on-golden.gif" "$Src\30890\Maltese_puppy_life\gif\691386774.gif"
Copy-Asset "maltese-idle-breathe.gif" "$Src\21242047\Maltese_puppy_life2\gif\542756351.gif"
Copy-Asset "maltese-idle-shiver.gif" "$Src\30397660\Maltese_puppy_life7\gif\768838761.gif"

# thinking
Copy-Asset "maltese-thinking-shock.gif" "$Src\22723957\Maltese_puppy_life5\gif\579236489.gif"
Copy-Asset "maltese-thinking-dazed.gif" "$Src\22723957\Maltese_puppy_life5\gif\579236478.gif"
Copy-Asset "maltese-thinking-ellipsis.png" "$Src\30890\Maltese_puppy_life\png\691386763.png"

# working / juggling (each tier unique source)
Copy-Asset "maltese-working-duo.gif" "$Src\22723957\Maltese_puppy_life5\gif\579236475.gif"
Copy-Asset "maltese-working-play.gif" "$Src\30890\Maltese_puppy_life\gif\691386759.gif"
Copy-Asset "maltese-working-busy.gif" "$Src\30397660\Maltese_puppy_life7\gif\768838758.gif"
Copy-Asset "maltese-juggle-play.gif" "$Src\30890\Maltese_puppy_life\gif\691386769.gif"
Copy-Asset "maltese-juggle-shock.gif" "$Src\30890\Maltese_puppy_life\@2x_gif\691386772@2x.gif"

# error
Copy-Asset "maltese-error-sad.png" "$Src\30890\Maltese_puppy_life\png\691386767.png"
Copy-Asset "maltese-sad-pout.png" "$Src\30397660\Maltese_puppy_life7\png\768838759.png"
Copy-Asset "maltese-error-noway.png" "$Src\33356256\Couple_doggy_10_(maltese)\png\828263471.png"

# attention (all unique)
Copy-Asset "maltese-happy-heart.gif" "$Src\21242047\Maltese_puppy_life2\gif\542756342.gif"
Copy-Asset "maltese-happy-jump.gif" "$Src\22723957\Maltese_puppy_life5\gif\579236470.gif"
Copy-Asset "maltese-happy-party.gif" "$Src\30890\Maltese_puppy_life\@2x_gif\691386755@2x.gif"
Copy-Asset "maltese-happy-flower.gif" "$Raw\flower.gif"
Copy-Asset "maltese-happy-sparkle.png" "$Src\30890\Maltese_puppy_life\png\691386761.png"
Copy-Asset "maltese-happy-dance.png" "$Src\30890\Maltese_puppy_life\png\691386753.png"
Copy-Asset "maltese-happy-tongue.png" "$Src\30890\Maltese_puppy_life\png\691386766.png"
Copy-Asset "maltese-happy-cheer.gif" "$Src\30397660\Maltese_puppy_life7\@2x_gif\768838745@2x.gif"
Copy-Asset "maltese-happy-party2.gif" "$Src\30397660\Maltese_puppy_life7\@2x_gif\768838754@2x.gif"
Copy-Asset "maltese-happy-heart2.gif" "$Src\30397660\Maltese_puppy_life7\@2x_gif\768838753@2x.gif"
Copy-Asset "maltese-happy-thumbs.png" "$Src\30397660\Maltese_puppy_life7\png\768838751.png"
Copy-Asset "maltese-happy-flower-petal.gif" "$Src\33356256\Couple_doggy_10_(maltese)\gif\828263457.gif"
Copy-Asset "maltese-happy-flower-head.png" "$Src\33356256\Couple_doggy_10_(maltese)\png\828263468.png"
Copy-Asset "maltese-happy-peek.png" "$Src\33356256\Couple_doggy_10_(maltese)\png\828263465.png"
Copy-Asset "maltese-happy-picnic.png" "$Src\33356256\Couple_doggy_10_(maltese)\png\828263462.png"
Copy-Asset "maltese-happy-bee.png" "$Src\33356256\Couple_doggy_10_(maltese)\png\828263458.png"

# notification (single unique alert)
Copy-Asset "maltese-notify-alert.gif" "$Src\30890\Maltese_puppy_life\@2x_gif\691386773@2x.gif"

# sleep / wake
Copy-Asset "maltese-sleep-breathe.gif" "$Src\21242047\Maltese_puppy_life2\gif\542756351.gif"
Copy-Asset "maltese-wake-wave.gif" "$Src\22723957\Maltese_puppy_life5\@2x_gif\579236472@2x.gif"

# idle overlay animations (unique from attention pool)
Copy-Asset "maltese-idle-heart.gif" "$Src\30890\Maltese_puppy_life\@2x_gif\691386772@2x.gif"
Copy-Asset "maltese-idle-peek.png" "$Src\30890\Maltese_puppy_life\png\691386762.png"

# Use original LINE/Tenor files as-is (black bg, sharp lines, correct animation).
# Transparent processing is opt-in: run scripts/make_transparent.mjs manually.
Get-ChildItem $Opaque -File | ForEach-Object {
    Copy-Item -Force $_.FullName (Join-Path $Assets $_.Name)
    Write-Host "OUT $($_.Name)"
}

Write-Host "done (original opaque assets)" -ForegroundColor Green
