# TODO

- add '--cached' arg (pass all args? no this is opinionated to my needs)
- include untracked (default true, when --cached not applied)
- try bun or deno instead of my cli.js + esbuild/runner thing

### Notes

Untracked: `git ls-files --others --exclude-standard -z | xargs -0 -n 1 git --no-pager diff /dev/null | less` via https://stackoverflow.com/questions/855767/can-i-use-git-diff-on-untracked-files
