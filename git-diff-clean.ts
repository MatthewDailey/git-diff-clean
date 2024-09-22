import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { showDiff, DiffOptions } from './src/show_diff'

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
    description: 'Include emojis in the diff output',
    default: true,
  })
  .option('includeFooter', {
    alias: 'f',
    type: 'boolean',
    description: 'Include footer in the diff output',
    default: true,
  })
  .help()
  .alias('help', 'h').argv

const options: DiffOptions = {
  includePlusMinus: argv.includePlusMinus,
  includeColors: argv.includeColors,
  includeEmoji: argv.includeEmoji,
  includeFooter: argv.includeFooter,
}

showDiff(options)
