# TODO

- add '--cached' arg (pass all args? no this is opinionated to my needs)
- try bun instead of my cli.js + esbuild/runner thing for performance
- make file linking work for files with spaces (idk if this is possible?)
- push new version

### Tests to add

Should add a scaffold that runs on real repos or at least mock out the functions that call git diff

- new file
- files with spaces in the name
- cached

### Notes

Untracked: `git ls-files --others --exclude-standard -z | xargs -0 -n 1 git --no-pager diff /dev/null | less` via https://stackoverflow.com/questions/855767/can-i-use-git-diff-on-untracked-files
