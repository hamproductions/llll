#!/bin/bash

set -euo pipefail
set -o pipefail

MODE="dev-cycle"
PROMPT_FILE="PROMPT_build.md"
MAX_ITERATIONS=0
RALPH_CLI="${RALPH_CLI:-claude}"
RALPH_MODEL="${RALPH_MODEL:-}"
RALPH_APPROVAL_MODE="${RALPH_APPROVAL_MODE:-safe}"

if [[ "${1:-}" =~ ^[0-9]+$ ]]; then
    MAX_ITERATIONS=$1
elif [ -n "${1:-}" ]; then
    case "${1:-}" in
        build|cycle)
            MAX_ITERATIONS=${2:-0}
            ;;
        plan|specs|plan-work)
            echo "Warning: legacy mode '$1' is ignored."
            echo "This loop now always runs a full cycle: re-plan -> dogfood live dev -> implement -> re-dogfood -> note."
            if [[ "${2:-}" =~ ^[0-9]+$ ]]; then
                MAX_ITERATIONS=$2
            fi
            ;;
        *)
            echo "Error: unsupported mode '$1'."
            echo "Use './loop_streamed.sh [iterations]' or './loop_streamed.sh build [iterations]'."
            exit 1
            ;;
    esac
fi

ITERATION=0
CURRENT_BRANCH=$(git branch --show-current)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Mode:   $MODE"
echo "Prompt: $PROMPT_FILE"
echo "Branch: $CURRENT_BRANCH"
[ "$MAX_ITERATIONS" -gt 0 ] && echo "Max:    $MAX_ITERATIONS iterations"
echo "Cycle:  re-plan -> dogfood live dev -> implement -> re-dogfood -> note"
echo "Dev:    verify against http://localhost:3000 and never run build steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: $PROMPT_FILE not found"
    exit 1
fi

ensure_ralph_runtime() {
    if [ "$RALPH_CLI" = "codex" ] && [ -n "${CODEX_THREAD_ID:-}" ]; then
        echo "Error: nested 'codex exec' is not stable inside a Codex-managed shell in this environment."
        echo "Run './loop_streamed.sh' from a normal terminal session, or set RALPH_CLI=claude if that CLI is available."
        exit 1
    fi
}

run_ralph_streamed() {
    local prompt="$1"

    if [ "$RALPH_CLI" = "codex" ]; then
        if [ "$RALPH_APPROVAL_MODE" = "safe" ]; then
            if [ -n "$RALPH_MODEL" ]; then
                printf "%s" "$prompt" | codex exec \
                    --full-auto \
                    --model "$RALPH_MODEL" \
                    -
                return
            fi

            printf "%s" "$prompt" | codex exec \
                --full-auto \
                -
            return
        fi

        if [ -n "$RALPH_MODEL" ]; then
            printf "%s" "$prompt" | codex exec \
                --dangerously-bypass-approvals-and-sandbox \
                --model "$RALPH_MODEL" \
                -
            return
        fi

        printf "%s" "$prompt" | codex exec \
            --dangerously-bypass-approvals-and-sandbox \
            -
        return
    fi

    if [ "$RALPH_CLI" = "claude" ]; then
        if [ -n "$RALPH_MODEL" ]; then
            claude -p "$prompt" \
                --dangerously-skip-permissions \
                --model "$RALPH_MODEL" \
                --verbose \
                --output-format stream-json \
                --include-partial-messages | node "$SCRIPT_DIR/parse_stream.cjs"
            return
        fi

        claude -p "$prompt" \
            --dangerously-skip-permissions \
            --verbose \
            --output-format stream-json \
            --include-partial-messages | node "$SCRIPT_DIR/parse_stream.cjs"
        return
    fi

    echo "Error: unsupported RALPH_CLI '$RALPH_CLI'. Supported values: codex, claude."
    exit 1
}

ensure_ralph_runtime

while true; do
    if [ "$MAX_ITERATIONS" -gt 0 ] && [ "$ITERATION" -ge "$MAX_ITERATIONS" ]; then
        echo "Reached max iterations: $MAX_ITERATIONS"
        break
    fi

    PROMPT_CONTENT=$(cat "$PROMPT_FILE")

    FULL_PROMPT="$PROMPT_CONTENT

Execute the instructions above against the live dev app. Do not run build steps."

    run_ralph_streamed "$FULL_PROMPT"

    ITERATION=$((ITERATION + 1))
    echo
    echo "======================== LOOP $ITERATION ========================"
    echo
done
