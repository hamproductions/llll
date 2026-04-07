#!/usr/bin/env node

const readline = require('readline')

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
})

let currentToolName = null
let toolInputBuffer = ''
let lastToolName = null
let toolUseCount = 0

function formatToolDetails(name, input) {
  try {
    const params = JSON.parse(input)
    if (name === 'Bash' && params.command) return `$ ${params.command}`
    if (name === 'Read' && params.file_path) return params.file_path
    if (name === 'Edit' && params.file_path) return params.file_path
    if (name === 'Write' && params.file_path) return params.file_path
    if (name === 'Task' && params.description) return params.description
    if (name === 'Grep' && params.pattern) return params.pattern
    if (name === 'Glob' && params.pattern) return params.pattern
    const key = Object.keys(params)[0]
    if (!key) return null
    const value = params[key]
    return typeof value === 'string' ? `${key}: ${value}` : null
  } catch {
    return null
  }
}

function formatToolResult(content) {
  let text = ''
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block.type === 'text') text += block.text
    }
  } else if (typeof content === 'string') {
    text = content
  } else if (content && typeof content.text === 'string') {
    text = content.text
  }
  if (!text) return null
  const lines = text.split('\n').filter((line) => line.trim()).slice(0, 5)
  return lines.map((line) => line.length > 120 ? `${line.slice(0, 117)}...` : line).join('\n')
}

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line)

    if (data.type === 'stream_event') {
      const event = data.event

      if (event?.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
        currentToolName = event.content_block.name
        lastToolName = currentToolName
        toolInputBuffer = ''
        toolUseCount += 1
        console.log(`\n${colors.cyan}🔧 ${currentToolName}${colors.reset}`)
      } else if (event?.type === 'content_block_delta') {
        if (event.delta?.text) process.stdout.write(event.delta.text)
        if (event.delta?.partial_json !== undefined) toolInputBuffer += event.delta.partial_json
      } else if (event?.type === 'content_block_stop' && currentToolName) {
        const details = formatToolDetails(currentToolName, toolInputBuffer)
        if (details) console.log(`${colors.dim}   ${details}${colors.reset}`)
        currentToolName = null
        toolInputBuffer = ''
      }
    } else if (data.type === 'tool_result' || data.type === 'user') {
      const blocks = data.type === 'tool_result' ? [{ content: data.result || data.content, is_error: data.is_error }] : data.message?.content || []
      for (const block of blocks) {
        if (data.type === 'user' && block.type !== 'tool_result') continue
        const isError = Boolean(block.is_error)
        console.log(isError ? `${colors.red}   ✗ Error:${colors.reset}` : `${colors.green}   ↳ Result:${colors.reset}`)
        const formatted = formatToolResult(block.content)
        if (formatted) {
          for (const resultLine of formatted.split('\n')) {
            console.log(`${colors.gray}     ${resultLine}${colors.reset}`)
          }
        }
      }
    } else if (data.type === 'result') {
      const seconds = Math.floor((data.duration_ms || 0) / 1000)
      const inputTokens = data.total_input_tokens || data.input_tokens || data.usage?.input_tokens || 0
      const outputTokens = data.total_output_tokens || data.output_tokens || data.usage?.output_tokens || 0
      const cost = data.total_cost_usd || data.cost_usd || 0
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`${colors.green}✅ Done${colors.reset} in ${seconds}s | Cost: $${cost.toFixed(4)} | Tokens: ↓${inputTokens} ↑${outputTokens} | Tools: ${toolUseCount}`)
    } else if (data.type === 'error') {
      console.log(`\n${colors.red}❌ Error: ${data.error?.message || data.message || 'unknown error'}${colors.reset}`)
    }
  } catch {
    if (line.trim()) process.stderr.write(`${line}\n`)
  }
})
