# Old or slow computers

Many builders use old family computers. First find out what they have, then decide: install, or the browser path. Never send them to hunt for old installers on random websites.

## Step 1: find out what computer it is
Ask this early for any install problem (Steps 4–6). Ask for a screenshot of the window if they're not sure.
- Not sure if it's a Mac or Windows? A Mac has an Apple logo in the top-left corner of the screen. Windows has a Start button (four squares) at the bottom. A Chromebook has a circle at the bottom left and usually "Chromebook" on the laptop.
- Windows version: press the Windows key + R, type winver, press Enter. A small window shows "Windows 10", "Windows 11", or older.
- Windows 64-bit or 32-bit: Start → Settings → System → About → look at "System type". Or press the Windows key + Pause.
- Mac version: click the Apple logo (top left) → About This Mac. It shows the macOS name and number (like "Sonoma 14.5").
- Mac chip: the same window says "Chip: Apple M1/M2/M3…" or "Processor: Intel". Both work.
- Chromebook: click the time (bottom right) → Settings (gear) → About ChromeOS.
- Linux: they usually know already. Point them to the browser path or their mentor.
- iPad, tablet or phone only: browser path.

## Step 2: decide
| What they have | VS Code | Git | Do this |
|---|---|---|---|
| Windows 10 or 11, 64-bit | ✅ | ✅ | Normal Steps 4–6. Stuck on Git twice? Plan B: GitHub Desktop |
| Windows 10 or 11, 32-bit | ❌ VS Code is 64-bit only | ⚠️ old version only | Browser path |
| Windows 7, 8 or 8.1 | ❌ not supported | ❌ current Git needs 8.1 or newer, 64-bit | Browser path |
| Mac that still gets Apple security updates (usually the newest macOS and the two before it) | ✅ | ✅ | Normal Steps 4–6 |
| Mac on macOS 11 (Big Sur) or older | ❌ current VS Code needs about macOS 12 (Monterey) or newer | ✅ usually | Browser path, tell the mentor |
| Chromebook, tablet, phone | ❌ | ❌ | Browser path |

Official sources:
- VS Code requirements: Windows 64-bit only on supported Windows versions; macOS versions that still get Apple security updates; 1 GB RAM, 1.6 GHz processor. https://code.visualstudio.com/docs/supporting/requirements
- Git for Windows works on 64-bit Windows 8.1 and newer. Version 2.46.2 was the last for Windows 7 and 8, and 2.40.1 the last with full 32-bit support. https://gitforwindows.org/faq

## Slow computer, but supported
- Close other programs and browser tabs before installing.
- The Mac developer tools (Step 5) can take 15 minutes or more on old Macs. Leave it running; plug in the charger.
- After installing, restart the computer once.
- If VS Code is very slow: close every tab inside VS Code except the one file you're working on.

## Not enough disk space
- VS Code needs about 500 MB free. Empty the Trash / Recycle Bin and delete big old downloads (with a parent's OK).
