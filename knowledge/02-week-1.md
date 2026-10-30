# Week 1 · Your first website

Required: Steps 1–6 and 13 (about 1 hour). Bonus: 7–12, 14, 15.
You need an email you can open before Step 2. Under 13: a parent creates the account with their email.

## Problem types (most Week 1 questions are one of these)
| Type | Usually step | Look in |
|---|---|---|
| account | 1–2 | Steps 1–2 |
| email-privacy | 3, 6, 10 (GH007) | Steps 3, 6, 10 |
| vscode-install | 4 | Step 4, "Old or slow computers" |
| git-install | 5 | Step 5, "Old or slow computers" |
| old-computer | 4–6 | "Old or slow computers", "The browser path" |
| terminal | 5, 6, 10 | "General help: the terminal" |
| git-config | 6 | Step 6 |
| clone-signin | 8 | Step 8 |
| push-error | 10, 12 | Step 10 |
| website | 9, 11 | Steps 9, 11 |
| wall-form | 13, 14 | Steps 13–14 |

## Step list (show this when they don't know their step number)
1 Choose your handle · 2 Create your GitHub account · 3 Keep your email private · 4 Install VS Code · 5 Install Git · 6 Tell Git who you are · 7 Copy the starter (bonus) · 8 Bring it to your computer (bonus) · 9 Make it yours (bonus) · 10 First commit (bonus) · 11 Go live (bonus) · 12 Write down your idea (bonus) · 13 Send your idea and join the Wall (required) · 14 First weekly update (bonus) · 15 Do it scared (bonus)

## Step 1 · Choose your handle
No surname, birth year or school name. Short, easy to say. Check it's free: open github.com/the-name. A 404 page means it's free.
- "That username is taken": add a word, like -dev or -builds.

## Step 2 · Create your GitHub account
github.com/signup → email, password, handle as username → puzzle → code from the email.
- No code arriving: check spam/promotions, wait 2 minutes, click "Resend". Make sure the email is one they can open.
- Under 13: a parent signs up with their own email (GitHub requires 13+).

## Step 3 · Keep your email private (parents can help)
Profile picture (top right) → Settings → Emails → tick "Keep my email addresses private" and "Block command line pushes that expose my email". Copy the address like 12345678+handle@users.noreply.github.com and save it in Notes. It's needed in Step 6.
- Can't find Emails: it's in the left menu of Settings, under "Access".

## Step 4 · Install VS Code
code.visualstudio.com → Download.
- Mac: open Downloads, double-click the .zip, drag Visual Studio Code into Applications, open it from Applications. "Are you sure?" → Open.
- Windows: run the installer, accept, tick "Open with Code" (both) and "Add to PATH", Next → Install → Finish.
- Mac: VS Code stays in Downloads and asks to move every time → drag it into Applications first.
- Won't install or the computer says the system is too old → offer the browser path.

## Step 5 · Install Git
- Mac: in VS Code, Terminal → New Terminal → type git --version → Enter. If a window asks to install "command line developer tools", click Install and wait 5–15 minutes. Then type git --version again.
- Windows: git-scm.com/download/win → run installer → Next on every screen, except "Choosing the default editor used by Git": pick Visual Studio Code. Install → Finish. Close VS Code completely, open it, Terminal → New Terminal → git --version.
- Worked if you see something like git version 2.47.0. Any number is fine.
- Windows: 'git' is not recognized → close VS Code completely and open again. Still broken? Restart the computer.
- Mac: the developer tools install seems frozen → give it 15 minutes. Still frozen? Restart the Mac and type git --version again.
- Can't find the Terminal menu: on Mac the top menu bar shows only while VS Code is the active window. Shortcut: Ctrl + ` (backtick).
- Typed git --version somewhere else (like the search bar): it must go in the terminal panel at the bottom of VS Code.

## Step 6 · Tell Git who you are
In the VS Code terminal, two lines, Enter after each, with their handle and noreply email from Step 3:
git config --global user.name "your-handle"
git config --global user.email "12345678+your-handle@users.noreply.github.com"
Nothing appears on screen. That's normal and means it worked.
- Check it worked: git config --global user.email shows the noreply address.
- Copied the quotes wrong ("smart quotes" from Notes): type the quotes by hand.

## Step 7 · Copy the starter (bonus)
github.com/hechoenosa/hello-osa → Use this template → Create a new repository → owner: you, name hello-osa, Public → Create repository.

## Step 8 · Bring it to your computer (bonus)
VS Code → Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows) → Git: Clone → Clone from GitHub → sign in and Authorize in the browser → pick your-handle/hello-osa → save in Documents/hecho-en-osa → Select as Repository Destination → Open.
- Picked hechoenosa/hello-osa instead of their own: do Step 8 again and pick your-handle/hello-osa.

## Step 9 · Make it yours (bonus)
Click index.html, change the three ✏️ lines (handle, one sentence, emoji), save with Cmd+S / Ctrl+S. Right-click index.html → Reveal in Finder / File Explorer → double-click it → click the button.
- A white dot on the file tab means it's not saved yet.

## Step 10 · First commit (bonus)
In the terminal: git add . → git commit -m "My first commit" → git push.
- Author identity unknown → do Step 6, then commit again.
- Permission denied or 403 → they cloned hechoenosa/hello-osa. Redo Step 8 with their own copy.
- GH007 (would publish a private email) → redo the Step 6 email line with the noreply address, then git commit --amend --reset-author --no-edit and git push.
- Windows sign-in window → choose "Sign in with your browser" and approve.
- "rejected" → git pull, then git push.

## Step 11 · Go live (bonus)
Repo → Settings → Pages → Branch main, folder / (root) → Save → wait 2 minutes, refresh. Link: https://your-handle.github.io/hello-osa
- 404: wait 2 more minutes; check branch main and / (root).

## Step 12 · Write down your idea (bonus)
New file my-idea.md with: What it is / Who it's for / Their problem / One person I can talk to about it (first name or role only). Save, then git add . → git commit -m "Add my idea" → git push.

## Step 13 · Send your idea and join the Wall (required, browser)
Sign in to GitHub, open https://github.com/hechoenosa/hello-osa/issues/new?template=im-live.yml → title "I'm in: your-handle" → idea and who it's for → tick "my tools work" → Create. No idea yet? Write "Still deciding" plus a problem they noticed. Bookmark the issue: weekly updates go there.
- On the browser path: in the tools box, write "Browser path" instead of ticking it, and tell the mentor.
- Already posted an "I'm live" issue or my-idea.md: that counts, nothing to redo.

## Step 14 · First weekly update (bonus)
Comment on their Wall issue: Done / Next / Stuck / Scariest part / Link.

## Step 15 · Do it scared (bonus)
Show the live website to one adult and one friend.
