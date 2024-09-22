import { execSync, spawn } from 'child_process'

const Red = '\x1b[31m'
const Green = '\x1b[32m'
const Cyan = '\x1b[36m'
const Bold = '\x1b[1m'
const Underline = '\x1b[4m'
const Overline = '\x1b[53m' // \u203E
const Reset = '\x1b[0m'

export type DiffOptions = {
  includePlusMinus: boolean
  includeColors: boolean
  includeEmoji: boolean
  includeFooter: boolean
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

  return diffs
}

function getLineNumber(line: string): number | null {
  const lineNumberMatch = line.match(/@@ -(\d+),\d+ \+(\d+),\d+ @@/)
  return lineNumberMatch ? parseInt(lineNumberMatch[2]) : null
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
      if (currentSectionLineNumber && currentSectionLines.length > 0) {
        diffs.push({
          path: filePath,
          lineNumber: currentSectionLineNumber,
          contents: currentSectionLines.join('\n'),
        })
      }
    }

    for (const line of lines) {
      const lineNumber = getLineNumber(line)
      if (lineNumber) {
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

export function getDiff(
  options: DiffOptions = {
    includePlusMinus: true,
    includeColors: true,
    includeEmoji: false,
    includeFooter: false,
  },
): string {
  const diffOutput = execSync('git diff', { encoding: 'utf8' })
  const diffs = parseDiff(diffOutput)
  return serializeDiffs(diffs, options)
}

export function showDiff(
  options: DiffOptions = {
    includePlusMinus: false,
    includeColors: true,
    includeEmoji: true,
    includeFooter: true,
  },
) {
  const diffOutput = execSync('git diff', { encoding: 'utf8' })
  const diffs = parseDiff(diffOutput)
  openInLess(serializeDiffs(diffs, options))
}
