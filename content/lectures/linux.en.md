---
skill: linux
title: "Linux for developers: files, permissions, processes and the shell"
summary: "The filesystem layout, reading and changing permissions, managing processes and signals, pipes and redirection, the text tools developers use daily, environment variables and PATH, SSH keys, and scheduled and background services."
readingMinutes: 10
---

Most servers, containers and CI runners run Linux, and most developer tools assume a Unix shell. Knowing the handful of concepts behind the commands (files and permissions, processes, streams, environment) lets you debug problems instead of copying commands from the internet.

## The filesystem

Everything is a file tree under `/`. A few locations matter in practice: `/etc` (configuration), `/var` (logs, databases, caches that change), `/usr` (installed programs and libraries), `/home` (user files), `/tmp` (temporary, cleared on reboot). `ls -la` shows hidden files and permissions; `df -h` shows disk space and `du -sh *` shows what is using it.

## Permissions

Each file has an owner, a group and permission bits for owner, group and others, each read (`r`), write (`w`) and execute (`x`). For directories, `x` means "may enter".

```bash
ls -l script.sh            # -rwxr-x--- 1 ada devs ...
chmod 750 script.sh        # rwx for owner, rx for group, nothing for others
chown ada:devs file.txt    # change owner and group (usually root)
```

Use the least permission that works. `chmod 777` is almost never the answer, and `sudo` for something a user should own usually means the files were created with the wrong owner.

## Processes and signals

`ps aux` lists processes, `top` or `htop` watches them, and `kill <pid>` sends **SIGTERM**, which asks a process to shut down cleanly. `kill -9` sends **SIGKILL**, which cannot be caught, so the process gets no chance to flush data or release locks: use it last. Each process has a parent, and a process that exits without its parent reading its status becomes a zombie.

Long-running services are usually managed by **systemd** (`systemctl status`, `systemctl restart`, `journalctl -u service`), which restarts them after crashes and collects their logs.

## Streams, pipes and text tools

Every process has standard input, standard output and standard error. Redirection and pipes connect them:

```bash
grep -i "error" app.log | sort | uniq -c | sort -rn | head   # most common error lines
find . -name "*.ts" -newer package.json > changed.txt        # output to a file
command 2> errors.log                                        # stderr only
```

`grep` filters lines, `sed` edits streams, `awk` processes columns, `sort` and `uniq` count and order, and `xargs` turns lines into arguments. Composing small tools this way is the core Unix idea.

## Environment and PATH

Environment variables are inherited by child processes. `PATH` is the list of directories searched for commands, so "command not found" usually means the directory is missing from it. `export NAME=value` sets a variable for the current shell and its children; `printenv` lists them. Don't put secrets in shell history or in files that get committed: prefer a secrets manager or a local file excluded from git.

## SSH

SSH logs into remote machines with key pairs. Generate a key with `ssh-keygen -t ed25519`, keep the private key on your machine only, and install the public key on the server (`~/.ssh/authorized_keys`). Disable password logins on servers you manage. `ssh -L` forwards a port, which is a safe way to reach a database that isn't exposed to the internet.

## Scheduled and background work

`cron` (or a systemd timer) runs commands on a schedule. A background job started with `&` dies when the terminal closes; use `systemd`, `tmux` or `nohup` for work that must survive.

## Interview checklist

- Explain read, write and execute for files and for directories, and set `750` from memory.
- Explain the difference between SIGTERM and SIGKILL, and why SIGTERM comes first.
- Build a pipeline that counts the most frequent lines in a file.
- Explain stdin, stdout and stderr, and redirect them separately.
- Explain why a command can be "not found" even though it is installed, and how PATH fixes it.
