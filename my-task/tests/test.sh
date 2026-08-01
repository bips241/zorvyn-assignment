#!/bin/bash
set -e

# Main test harness for Silver task validation

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$TEST_DIR")")"
LOGS_DIR="${LOGS_DIR:-/logs/verifier}"

mkdir -p "$LOGS_DIR"

cd "$REPO_ROOT"

echo "=== Applying test patch ==="
python3 "$TEST_DIR/parser.py" < /dev/null > /dev/null 2>&1 || true

echo "=== Running test suite ==="
bash "$TEST_DIR/run_script.sh" 2>&1 | tee /tmp/test_output.txt

echo "=== Parsing test results ==="
python3 "$TEST_DIR/parser.py" < /tmp/test_output.txt > /tmp/parsed_results.json

echo "=== Validating test results ==="
# Check if all required tests passed
# This is a simplified check - in production, the platform does more thorough validation

if grep -q '"status": "FAILED"' /tmp/parsed_results.json; then
  echo "Some tests failed"
  echo "0" > "$LOGS_DIR/reward.txt"
  exit 1
else
  echo "All tests passed"
  echo "1" > "$LOGS_DIR/reward.txt"
  exit 0
fi
