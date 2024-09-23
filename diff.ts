import { execSync, spawn } from 'child_process'

const Red = '\x1b[31m'
const Green = '\x1b[32m'
const Cyan = '\x1b[36m'
const Bold = '\x1b[1m'
const Underline = '\x1b[4m'
const Overline = '\x1b[53m' // \u203E
const Reset = '\x1b[0m'

export type DiffOptions = {
  /* Include plus/minus signs in the diff output */
  includePlusMinus: boolean
  /* Include colors in the diff output */
  includeColors: boolean
  /* Include emojis next to file names to visually group them. */
  includeEmoji: boolean
  /* Include a line as a footer to close out the diff output */
  includeFooter: boolean
  /* Include untracked files in the diff output */
  includeUntracked: boolean
}

export type Diff = {
  path: string
  lineNumber: number
  contents: string
}

function openInLess(content: string) {
  const less = spawn('less', ['-R'], { stdio: ['pipe', process.stdout, process.stderr] })
  less.stdin.write(content)
  less.stdin.end()
}

// Set of animal emojis that will be mapped to files for easier identification
const ANIMALS = [
  '🐶',
  '🐱',
  '🐭',
  '🐹',
  '🐰',
  '🦊',
  '🐻',
  '🐼',
  '🐨',
  '🐯',
  '🦁',
  '🐮',
  '🐷',
  '🐸',
  '🐵',
  '🐔',
  '🐧',
  '🐦',
  '🦆',
  '🦉',
]

export function splitFilesInDiff(input: string): string[] {
  const lines = input.split('\n')
  const diffs: string[] = []
  let currentDiff = ''

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      if (currentDiff) {
        diffs.push(currentDiff)
      }
      currentDiff = line
    } else {
      currentDiff += '\n' + line
    }
  }

  if (currentDiff) {
    diffs.push(currentDiff)
  }

  return diffs.filter((d) => d.trim() !== '')
}

function getLineNumber(line: string): number | null {
  const lineNumberMatch = line.match(/@@ -(\d+),\d+ .* @@/)
  return lineNumberMatch ? parseInt(lineNumberMatch[1]) : null
}

export function parseDiff(diffOutput: string): Diff[] {
  if (diffOutput.trim() === '') {
    return []
  }

  const fileParts = splitFilesInDiff(diffOutput)
  const diffs: Diff[] = []

  fileParts.forEach((part) => {
    const lines = part.split('\n')
    const filePath = lines[0].split(' ')[2].replace(/^a\//, '')

    let currentSectionLineNumber: number | null = null
    let currentSectionLines: string[] = []
    const addDiff = () => {
      if (currentSectionLineNumber !== null && currentSectionLines.length > 0) {
        diffs.push({
          path: filePath,
          lineNumber: currentSectionLineNumber,
          contents: currentSectionLines.join('\n'),
        })
      }
    }

    for (const line of lines) {
      const lineNumber = getLineNumber(line)
      if (lineNumber !== null) {
        addDiff()
        currentSectionLines = []
        currentSectionLineNumber = lineNumber
      } else {
        currentSectionLines.push(line)
      }
    }

    addDiff()
  })

  return diffs
}

function getHeader(diff: Diff, options: DiffOptions, index: number, includeEmoji: boolean): string {
  return `${includeEmoji ? ANIMALS[index] + ' ' : ''}${diff.path}:${diff.lineNumber}`
}

function coloredDiff(diff: Diff, options: DiffOptions): string {
  return diff.contents
    .split('\n')
    .map((line) => {
      const color = line.startsWith('+') ? Green : line.startsWith('-') ? Red : ''
      const text = !options.includePlusMinus ? line.slice(1) : line
      return `${options.includeColors ? color : ''}${text}${options.includeColors ? Reset : ''}`
    })
    .join('\n')
}

function coloredHeader(header: string, options: DiffOptions): string {
  return options.includeColors ? `${Bold}${Underline}${Cyan}${header}${Reset}` : header
}

function coloredFooter(footer: string, options: DiffOptions): string {
  return options.includeColors ? `${Bold}${Overline}${Cyan}${footer}${Reset}` : footer
}

export function serializeDiffs(diffs: Diff[], options: DiffOptions): string {
  if (diffs.length === 0) {
    return ''
  }

  let fileIndex = 0
  let lastFile = diffs[0].path
  return diffs
    .map((diff) => {
      if (diff.path !== lastFile) {
        lastFile = diff.path
        fileIndex++
      }
      const header = getHeader(diff, options, fileIndex, options.includeEmoji)
      const footer = options.includeFooter ? ' '.repeat(header.length) : ''

      return `${coloredHeader(header, options)}\n${coloredDiff(diff, options)}\n${coloredFooter(
        footer,
        options,
      )}`
    })
    .join('\n\n')
}

function getUntrackedFilesAsDiff(): string {
  // Note we include || true to avoid the command failing if there are no untracked files.
  // This is from https://stackoverflow.com/questions/855767/can-i-use-git-diff-on-untracked-files + ChatGPT
  return execSync(
    'git ls-files --others --exclude-standard -z | xargs -0 -n 1 git --no-pager diff --no-index /dev/null || true',
    {
      encoding: 'utf8',
    },
  )
}

function getDiffString(): string {
  return execSync('git diff', { encoding: 'utf8' })
}

function getDiffs(includeUntracked: boolean): Diff[] {
  let diffOutput = getDiffString()
  if (includeUntracked) {
    const untrackedFiles = getUntrackedFilesAsDiff()
    diffOutput += '\n\n'
    diffOutput += untrackedFiles
  }
  return parseDiff(diffOutput)
}

/**
 * Get the current git diff as a string.
 *
 * @param options [DiffOptions] - Options for the diff output.
 * @returns [String] git diff string
 */
export function getDiff(options: DiffOptions): string {
  const diffs = getDiffs(options.includeUntracked)
  return serializeDiffs(diffs, options)
}

/**
 * Open the current git diff in less.
 *
 * @param options [DiffOptions] - Options for the diff output.
 */
export function showDiff(options: DiffOptions, useLess: boolean = true) {
  const diffs = getDiffs(options.includeUntracked)
  const serialized = serializeDiffs(diffs, options)
  if (useLess) {
    openInLess(serialized)
  } else {
    console.log(serialized)
  }
}
