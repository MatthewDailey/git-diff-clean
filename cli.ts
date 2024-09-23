import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { showDiff, DiffOptions } from './diff'

const argv = yargs(hideBin(process.argv))
  .option('includePlusMinus', {
    alias: 'p',
    type: 'boolean',
    description: 'Include plus/minus signs in the diff output',
    default: true,
  })
  .option('includeColors', {
    alias: 'c',
    type: 'boolean',
    description: 'Include colors in the diff output',
    default: true,
  })
  .option('includeEmoji', {
    alias: 'e',
    type: 'boolean',
    description: 'Include emojis next to file names to visually group them.',
    default: true,
  })
  .option('includeFooter', {
    alias: 'f',
    type: 'boolean',
    description: 'Include a line as a footer to close out the diff output',
    default: true,
  })
  .option('useLess', {
    alias: 'l',
    type: 'boolean',
    description: 'Use less as the pager to view output',
    default: true,
  })
  .option('includeUntracked', {
    alias: 'u',
    type: 'boolean',
    description: 'Include untracked files in the diff output (not used when --cached is on)',
    default: true,
  })
  .help()
  .alias('help', 'h').argv as unknown as DiffOptions & { useLess: boolean }

showDiff(argv, argv.useLess)
