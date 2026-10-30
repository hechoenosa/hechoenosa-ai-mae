# Plan B: GitHub Desktop

For builders on a supported computer (Windows 10 or 11 64-bit, or macOS 12 or newer) who are stuck on Step 5 (Install Git) or Step 6 (Tell Git who you are), or who are scared of the terminal. GitHub Desktop has Git built in and uses buttons instead of typed commands. Builders who already finished Week 1 don't need it.

Offer it when: the same Git step (5 or 6) failed twice on a supported computer. For old, 32-bit, Chromebook or tablet: browser path instead.

## What it replaces
- Step 5 (Install Git): skip it. GitHub Desktop brings its own Git.
- Step 6 (Tell Git who you are): done inside GitHub Desktop (below).
- Steps 8 and 10 (clone, commit, push): buttons instead of commands.
- Still needed: VS Code (Step 4), to change files.

## Set it up
1. Go to https://desktop.github.com and click Download. Install it like any app (Mac: open the zip and drag GitHub Desktop into Applications; Windows: open the installer, it installs by itself).
2. Open GitHub Desktop. Click "Sign in to GitHub.com". Your browser opens: sign in and click Authorize, then go back to GitHub Desktop.
3. "Configure Git" screen: Name = your handle. Email = choose the one that ends in @users.noreply.github.com. Not your real email. Click Finish.
   - Change it later: Mac: GitHub Desktop → Settings → Git. Windows: File → Options → Git.

## Bring hello-osa to your computer (instead of Step 8)
1. Do Step 7 first (your own copy of hello-osa on GitHub).
2. File → Clone repository → pick your-handle/hello-osa (not hechoenosa/hello-osa).
3. Local path: Documents/hecho-en-osa → Clone.
4. Click "Open in Visual Studio Code" to edit the files (Step 9).

## Save and send (instead of Step 10 and the commands in Step 12)
1. Save your file in VS Code (Cmd+S / Ctrl+S).
2. Go back to GitHub Desktop: your changed files show on the left.
3. Bottom left, type a short message in "Summary", like "My first commit". Click "Commit to main".
4. Click "Push origin" at the top. Your work is now on GitHub.

## Common problems
- Can't find the noreply email in the list: on GitHub do Step 3 first, then restart GitHub Desktop.
- "Push origin" button missing: you have nothing new to send, or you haven't committed yet.
- Push says permission denied: you cloned hechoenosa/hello-osa. Clone your-handle/hello-osa instead.

Official guide: https://docs.github.com/en/desktop/overview/getting-started-with-github-desktop
Requirements: https://docs.github.com/en/desktop/overview/supported-operating-systems-for-github-desktop
