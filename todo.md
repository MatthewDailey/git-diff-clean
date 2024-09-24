# TODO

-

### Ideas

- Thought about trying bun to run faster but that would make this not work via npx. If it does feel slow, will reconsider for myself.
- Make file linking work with spaces would be nice but seems like a limitation of VSCode. (Would be one perk of working on a fork like Cursor)

### Tests to add

Should add a scaffold that runs on real repos or at least mock out the functions that call git diff

- new file
- files with spaces in the name
- cached

### Notes

Untracked: `git ls-files --others --exclude-standard -z | xargs -0 -n 1 git --no-pager diff /dev/null | less` via https://stackoverflow.com/questions/855767/can-i-use-git-diff-on-untracked-files
