# night_train.ps1 -- TEND NIGHT-TRAIN RELAUNCHER
# Adapted from Kira ai-media-companion\night_train.ps1 for TEND (repo: "tend").
# ASCII-only source on purpose: PowerShell 5.1 reads a BOM-less UTF-8 .ps1 as ANSI and would
# mojibake any smart-dash/emoji in the SOURCE, breaking the parser. (The mission doc it feeds to
# claude is read at runtime with -Encoding UTF8, so Tend's arrows/emoji in the DOC survive fine.)
#
# Loops autonomous Claude sessions off TEND_NIGHTTRAIN.md until ONE of exactly four things:
#   (a) NIGHT-TRAIN COMPLETE -- a shift wrote "NIGHT-TRAIN COMPLETE" as line 1 of
#       TEND_NIGHTTRAIN_LOG.md (all Definition-of-Done items verified); loop stops.
#   (b) Jonny stops it   -- Ctrl+C this window (or close it).
#   (c) THE BRAKE        -- two CONSECUTIVE shifts with an IDENTICAL TEND_NIGHTTRAIN.md frontier
#                           AND zero new commits (provable nothing twice). Stuck-but-committing
#                           CONTINUES; slow-but-moving CONTINUES. Only the same-wall-producing-
#                           nothing machine stops. Disable with -RunUntilDone.
#   (d) API BALANCE EXHAUSTED -- billing/credit failure signature -> clean stop (top up + relaunch).
#
# -- GUARDRAILS (baked in) --------------------------------------------------
#   * BRANCH ISOLATION. The loop runs on the 'night-train' branch (auto-created off main on first
#     launch) and re-asserts it before every shift. It NEVER runs 'git push' and NEVER deploys.
#     Your live Vercel deploy (origin/main) is never touched. Merging night-train -> main is a
#     human decision you make in the morning after reviewing the work.
#   * The prompt preface hard-codes the branch + no-secrets contract each shift. Tend has ZERO
#     users, so creative latitude is wide -- but secrets never leak and nothing auto-deploys.
#
# Sessions run with --dangerously-skip-permissions: fully autonomous, no per-action gates.
# Safety = branch isolation + git-revertibility of everything + nothing deploys without Jonny.
#
# BEDTIME:   powershell -ExecutionPolicy Bypass -File .\night_train.ps1
# TEST:      powershell -ExecutionPolicy Bypass -File .\night_train.ps1 -Test
#            (one attended cycle: proves launch/log/branch-guard plumbing without doing real work)
# ALL-NIGHT: powershell -ExecutionPolicy Bypass -File .\night_train.ps1 -RunUntilDone
#            (disables the 2-shift no-progress brake -- only stops on COMPLETE / Ctrl+C / dead wallet)

param(
    [int]$SleepBetween = 60,
    [int]$MaxShifts = 0,          # 0 = unlimited
    [switch]$Test,
    [switch]$RunUntilDone         # disable the 2-shift no-progress brake
)
$ErrorActionPreference = "Continue"

# PS 5.1 encodes pipeline input to native exes with $OutputEncoding (default ASCII) -- force UTF-8
# so the doc's arrows/symbols/emoji survive the stdin pipe to claude.
$OutputEncoding = New-Object System.Text.UTF8Encoding($false)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

$Branch   = "night-train"
$Frontier = Join-Path $Root "TEND_NIGHTTRAIN.md"       # the living handoff -- fed to each shift verbatim
$Log      = Join-Path $Root "TEND_NIGHTTRAIN_LOG.md"   # machine ledger + line-1 DONE sentinel
$LogDir   = Join-Path $Root "logs\nighttrain"
New-Item -ItemType Directory -Force $LogDir | Out-Null

$DONE_TOKEN = "NIGHT-TRAIN COMPLETE"

if (-not (Test-Path $Frontier)) {
    Write-Host "== FATAL: TEND_NIGHTTRAIN.md not found. Cannot start the night train. ==" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $Log)) {
    @"
(placeholder -- the winning shift promotes '$DONE_TOKEN' to line 1 to stop the loop)
# TEND NIGHT-TRAIN LOG -- started $(Get-Date -Format 'yyyy-MM-dd HH:mm')
One line per shift below (newest last).

"@ | Set-Content $Log -Encoding UTF8
}

# -- BRANCH-ISOLATION GUARDRAIL ---------------------------------------------
# Never runs on main. Auto-creates 'night-train' off main on first launch, then re-asserts it
# every shift so the loop can never drift onto main and never auto-deploys via origin/main.
function Assert-Branch {
    $b = (git rev-parse --abbrev-ref HEAD 2>$null)
    if ($b -ne $Branch) {
        Write-Host "== Not on '$Branch' (on '$b'). Switching... ==" -ForegroundColor Yellow
        git checkout $Branch 2>$null | Out-Null
        $b = (git rev-parse --abbrev-ref HEAD 2>$null)
        if ($b -ne $Branch) {
            Write-Host "== '$Branch' does not exist -- creating it off current HEAD. ==" -ForegroundColor Yellow
            git checkout -b $Branch 2>$null | Out-Null
            $b = (git rev-parse --abbrev-ref HEAD 2>$null)
        }
    }
    if ($b -ne $Branch) {
        Write-Host "== FATAL GUARDRAIL: cannot reach the '$Branch' branch (on '$b'). Halting so we NEVER commit to main. ==" -ForegroundColor Red
        exit 1
    }
}
Assert-Branch
Write-Host "== Guardrail OK: on '$Branch'. This loop never pushes and never deploys. Live main stays as-is. ==" -ForegroundColor Green

function Get-FrontierHash {
    if (Test-Path $Frontier) { (Get-FileHash $Frontier -Algorithm SHA256).Hash } else { "" }
}

$noProgress = 0
$shift = 0
while ($true) {
    # (a) DONE check -- line 1 of the LOG only (the header line must never contain the token)
    $top = (Get-Content $Log -TotalCount 1)
    if ($top -match ("^\s*" + [regex]::Escape($DONE_TOKEN))) {
        Write-Host "== $DONE_TOKEN -- the Definition of Done is met. Read TEND_NIGHTTRAIN.md, review the 'night-train' branch, then merge + deploy. =="
        break
    }
    if (-not (Test-Path $Frontier)) {
        Add-Content $Log "- $(Get-Date -Format 'HH:mm') TEND_NIGHTTRAIN.md MISSING -- stopping for human eyes."
        break
    }
    if (($MaxShifts -gt 0) -and ($shift -ge $MaxShifts)) {
        Write-Host "== MaxShifts ($MaxShifts) reached. Stopping. =="
        break
    }

    Assert-Branch  # re-assert before every shift -- never drift onto main

    $shift++
    $startHead = (git rev-parse HEAD 2>$null)
    $startFrontier = Get-FrontierHash
    $slog = Join-Path $LogDir ("shift_{0:D3}_{1}.log" -f $shift, (Get-Date -Format "MMdd_HHmm"))
    $started = Get-Date
    Write-Host "== SHIFT $shift launching $(Get-Date -Format HH:mm) (log: $slog) =="

    if ($Test) {
        $prompt = "TEND NIGHT-TRAIN PLUMBING TEST (attended): the REAL TEND_NIGHTTRAIN.md is appended below ONLY to prove prompt-passing survives its special characters. Do NOT act on it, do NOT edit source, do NOT commit. Just: (1) confirm you received it by naming the mission in one sentence, (2) append exactly one line '- TEST shift: plumbing OK, frontier visible' to TEND_NIGHTTRAIN_LOG.md, (3) exit.`n`n--- FRONTIER CONTENT (do not act on) ---`n" + (Get-Content $Frontier -Raw -Encoding UTF8)
    } else {
        $preface = "TEND NIGHT-TRAIN -- SHIFT #$shift (unattended, via night_train.ps1). You are the LEAD ENGINEER + PRODUCT DESIGNER of Tend, a gamified dragon-egg habit-building app. Your full mission, guardrails, plan, and Definition of Done are in the TEND_NIGHTTRAIN.md content appended below -- READ IT FIRST, then continue from the 'CURRENT FRONTIER' queue.`n`n" +
                   "TWO GUARDRAILS (never violate): (1) BRANCH ISOLATION -- you are on the 'night-train' branch; commit freely and often, but NEVER run 'git push', NEVER deploy, NEVER touch origin/main. The live site stays as-is until Jonny reviews this branch and merges it himself. (2) NEVER LEAK SECRETS -- .env stays gitignored; never print, log, or commit the real Stripe/Clerk/Supabase keys; reference process.env.* by NAME only. Keep Stripe + Clerk working. Beyond these two: you have FULL creative rein -- redesign, rebuild, restructure, improve. Tend has ZERO users; be ambitious.`n`n" +
                   "SHIFT CONTRACT: (1) Frontier-first discipline -- UPDATE TEND_NIGHTTRAIN.md (CURRENT FRONTIER queue + SHIFT LOG + DECISIONS + SURPRISE-ME IDEAS + NEEDS EYES) CONTINUOUSLY, not only at close; rewrite the frontier BEFORE a long task so a successor can pick up even if you die at the context wall. (2) Commit every real change (commits are your proof of life). (3) VERIFY, do not assert -- run 'npm run build' (and lint/typecheck) and confirm it passes before claiming a thing is done. (4) Web-research / best-practices first on anything design- or conversion-related -- no blind spinning. (5) At close, append ONE line to TEND_NIGHTTRAIN_LOG.md: '- shift ${shift}: <what banked> | frontier: <next> | needs eyes: <blocker or none>'. (6) ONLY when EVERY Definition-of-Done item is complete AND build-verified, write '$DONE_TOKEN' as the FIRST line of TEND_NIGHTTRAIN_LOG.md (that line stops the loop). Do not write it early -- this is a big mission; expect many shifts.`n`n" +
                   "--- TEND_NIGHTTRAIN.md (your mission + frontier) ---`n" +
                   (Get-Content $Frontier -Raw -Encoding UTF8)
        $prompt = $preface
    }

    # Prompt goes via STDIN, never argv: PS 5.1 quotes-but-never-escapes native args, so any embedded
    # '"' in the doc re-tokenizes the tail and claude parses fragments as CLI options. Piped stdin has
    # no argument-parsing surface at all.
    $prompt | & claude --dangerously-skip-permissions -p *> $slog
    $exitCode = $LASTEXITCODE
    $secs = [int]((Get-Date) - $started).TotalSeconds
    $mins = [int]($secs / 60)

    $logBytes = 0
    if (Test-Path $slog) { $logBytes = (Get-Item $slog).Length }

    # (d) BILLING-EXHAUSTION -> CLEAN STOP. Relaunching against a dead wallet just thrashes.
    $billingRe = 'credit balance is too low|purchase more credits|insufficient[_ ]?(quota|credits?|funds)|402 payment required'
    $logText = ''
    if ($logBytes -gt 0) { $logText = (Get-Content $slog -Raw) }
    if ($logText -match $billingRe) {
        $hit = $matches[0]
        Write-Host "== SHIFT $shift STOP: API BALANCE EXHAUSTED (matched '$hit'). Halting cleanly -- top up + relaunch. ==" -ForegroundColor Yellow
        $line = "- shift {0} STOPPED {1} ({2} sec): API balance exhausted ('{3}'). Halted CLEANLY -- top up and relaunch night_train.ps1."
        Add-Content $Log ($line -f $shift, (Get-Date -Format "HH:mm"), $secs, $hit)
        break
    }

    # LAUNCH SELF-TEST: a shift that dies in under 60s never did real work -- surface it LOUDLY.
    if (($secs -lt 60) -and (($exitCode -ne 0) -or ($logBytes -eq 0))) {
        $tail = "(log empty -- claude produced no output at all)"
        if ($logBytes -gt 0) { $tail = ((Get-Content $slog -Tail 10) -join "`n") }
        Write-Host "== SHIFT $shift FAST-FAIL: exited in $secs sec (exit $exitCode, log $logBytes bytes) ==" -ForegroundColor Red
        Write-Host $tail -ForegroundColor Red
        $line = "- shift {0} FAST-FAIL {1} ({2} sec, exit {3}): {4}"
        Add-Content $Log ($line -f $shift, (Get-Date -Format "HH:mm"), $secs, $exitCode, ($tail -replace "\r?\n", " / "))
    }

    $endHead = (git rev-parse HEAD 2>$null)
    $endFrontier = Get-FrontierHash
    $commits = 0
    if ($startHead -and $endHead -and ($startHead -ne $endHead)) {
        $commits = [int](git rev-list --count "$startHead..$endHead" 2>$null)
    }
    $advanced = if ($endFrontier -ne $startFrontier) { "ADVANCED" } else { "unchanged" }
    $line = "- shift {0} {1}->{2} ({3}m): {4} commit(s), frontier {5}"
    Add-Content $Log ($line -f $shift, $started.ToString("HH:mm"), (Get-Date -Format "HH:mm"), $mins, $commits, $advanced)

    # (c) THE BRAKE -- zero-progress detector
    if (($endFrontier -eq $startFrontier) -and ($commits -eq 0)) { $noProgress++ } else { $noProgress = 0 }
    if ((-not $RunUntilDone) -and ($noProgress -ge 2)) {
        Add-Content $Log ("- BRAKE $(Get-Date -Format 'HH:mm'): two consecutive shifts of provable nothing (identical frontier, zero commits). The wall needs human eyes -- see the last shift log: $slog")
        Write-Host "== BRAKE FIRED -- two shifts of provable nothing. Stopping. Run with -RunUntilDone to override. =="
        break
    }
    if ($RunUntilDone -and ($noProgress -ge 2)) {
        Write-Host "== RUN-UNTIL-DONE: $noProgress shift(s) without progress -- brake DISABLED, continuing. =="
    }

    if ($Test) {
        Write-Host "== TEST cycle complete -- check TEND_NIGHTTRAIN_LOG.md for the test line. =="
        break
    }
    Write-Host "== SHIFT $shift closed ($mins m, $commits commits). Relaunching in $SleepBetween s. =="
    Start-Sleep -Seconds $SleepBetween
}
