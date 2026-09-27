# Lab setup — Windows 11 (for the teacher)

Do this once on every lab machine before the class starts Week 5. It takes about 20 minutes per
machine, most of it downloading. Every student-facing lesson from Week 5 on assumes this is done:
Day 1 opens with a quest that *checks* each item below, with a fix beside each check, but
installing is your job so that no class period is lost to it.

Versions checked on 2026-09-27: Spring Boot 4.1.1 (start.spring.io's default), which needs
**Java 17 or newer**.

> ⚠️ **Per-user installs.** VS Code extensions (`%USERPROFILE%\.vscode\extensions`) and Maven's
> download cache (`%USERPROFILE%\.m2`) belong to the *Windows account*, not the machine. If
> students log in with their own Windows accounts, steps 3 and 5 must be repeated in each
> account — or ask them to do steps 3 and 5 as the first thing on Day 1 (the setup quest walks
> them through it). If everyone shares one lab account, doing it once is enough.

## 1. Java (JDK 21)

1. Download **Eclipse Temurin 21 (LTS)**, Windows x64, `.msi` from <https://adoptium.net>.
2. Run it. On the "Custom Setup" screen, set **"Set JAVA_HOME variable"** to *Will be installed
   on local hard drive* — it is **off** by default. Leave "Add to PATH" on.
3. Open a **new** PowerShell window and check:

   ```powershell
   java -version        # should say 21.x
   echo $env:JAVA_HOME  # should print the Temurin folder
   ```

   If an older Java (8 or 11) is still listed first, uninstall it in *Settings → Apps* — Spring
   Boot will refuse to run on it.

## 2. VS Code

1. Download the **System Installer** (x64) from <https://code.visualstudio.com/download> — the
   System one installs for every Windows account; the default User one does not.
2. During install, tick **"Add to PATH"** and both **"Add 'Open with Code' action"** boxes.

## 3. Extensions

In a new PowerShell window:

```powershell
code --install-extension vscjava.vscode-java-pack
code --install-extension vmware.vscode-boot-dev-pack
code --install-extension ritwickdey.LiveServer
code --install-extension humao.rest-client
code --install-extension mtxr.sqltools
code --install-extension mtxr.sqltools-driver-mysql
```

| Extension | What it's for |
|---|---|
| Extension Pack for Java (Microsoft) | Running and debugging Java |
| Spring Boot Extension Pack (VMware) | Creating Spring Boot projects from inside VS Code (includes Spring Initializr) |
| Live Server (Ritwick Dey) | The **Go Live** button — previews a web page and reloads it on every save |
| REST Client (Huachao Mao) | Testing an API from a plain `.http` text file — no account, and the file can be pasted into a turn-in |
| SQLTools + SQLTools MySQL/MariaDB/TiDB (Matheus Teixeira) | Running SQL against the MySQL ledger from inside VS Code (Ctrl+E Ctrl+E) — replaces MySQL Workbench from Week 5. Its MySQL driver uses `mysql2`, which handles MySQL 8's default login |

Check with `code --list-extensions`.

## 4. MySQL (from Unit 1)

The Unit 1 MySQL server stays — Spring Boot talks to the same database. Make sure it starts by
itself:

```powershell
Get-Service MySQL*   # Status should be Running
```

If it says Stopped: *Services* app → MySQL80 → Startup type **Automatic** → Start.

## 5. First Spring Boot run (downloads the libraries)

The first Spring project on a machine downloads ~100 MB of libraries from Maven Central. Do it
once now so students aren't all downloading at once on the lab's connection.

1. In VS Code: **Ctrl+Shift+P** → *Spring Initializr: Create a Maven Project*.
2. Choose: Spring Boot — the **first** entry (the recommended stable version, 4.1.x; never one
   marked SNAPSHOT or M) · Java · group `com.example` · artifact `warmup` · Jar · Java **17**
   (the first entry; runs on JDK 17 or newer) · dependencies **Spring Web**. Save it anywhere.
3. When it opens, wait for the status bar to stop saying "Downloading…" / "Importing…".
4. Open `WarmupApplication.java` and click **Run** above `main`.
5. **Windows Defender Firewall will ask about Java.** Click **Allow** (private networks). Students
   will get the same prompt the first time — the Day 1 quest tells them it's safe either way,
   because the browser on the same machine reaches `localhost` regardless.
6. Success looks like `Tomcat started on port 8080` in the terminal. Open
   <http://localhost:8080> — a "Whitelabel Error Page" there is **correct** (the app runs, it just
   has no pages yet). Stop it with the red square.

If step 3 hangs or fails with "Could not transfer artifact", the lab's internet or a proxy is
blocking Maven Central (`repo.maven.apache.org`) — that has to be fixed at the network, not per
machine.

## 6. Live Server check

1. Make a folder, create `index.html` containing `<h1>Hello</h1>`, open it in VS Code.
2. Click **Go Live** (bottom-right status bar). A browser tab opens at `127.0.0.1:5500` showing
   *Hello*.
3. Change the text and save — the tab should update by itself.

## Done when

- [ ] `java -version` says 21 and `echo $env:JAVA_HOME` prints a folder
- [ ] `code --list-extensions` shows all six extensions
- [ ] SQLTools → Add New Connection → MySQL (localhost, 3306, database `school`, your MySQL user)
      → TEST CONNECTION succeeds. The first time, SQLTools may ask to install driver
      dependencies — allow it. Delete the test connection afterwards; students create their own.
- [ ] `Get-Service MySQL*` says Running
- [ ] A Spring Boot app started and <http://localhost:8080> showed the Whitelabel page
- [ ] Go Live opened a page that updates on save
