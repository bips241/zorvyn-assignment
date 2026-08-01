#!/usr/bin/env python3

import json
import sys
import re

def parse_vitest_output(output: str) -> list:
    """Parse vitest output and extract test results."""
    results = []
    
    # Look for test result lines in vitest output
    # Pattern: ✓ test name or ❯ test name or FAIL
    test_pattern = r'(✓|❯|FAIL)\s+(.+?)(?:\s+\d+ms)?$'
    
    for line in output.split('\n'):
        line = line.strip()
        if not line:
            continue
            
        # Match test lines
        if 'describe(' in line or 'it(' in line:
            continue
            
        # Check for pass markers
        if line.startswith('✓'):
            # Extract test name
            match = re.search(r'✓\s+(.+?)(?:\s+\d+ms)?$', line)
            if match:
                test_name = match.group(1).strip()
                results.append({"name": test_name, "status": "PASSED"})
        
        # Check for failure markers
        elif 'FAIL' in line:
            match = re.search(r'FAIL\s+(.+?)(?:\s+>)?', line)
            if match:
                test_name = match.group(1).strip()
                results.append({"name": test_name, "status": "FAILED"})
    
    # Also parse human-readable test output
    describe_pattern = r'describe\([\'"](.+?)[\'"]\)'
    it_pattern = r'it\([\'"](.+?)[\'"]\)'
    
    current_suite = None
    for line in output.split('\n'):
        line = line.strip()
        
        # Extract describe block
        match = re.search(describe_pattern, line)
        if match:
            current_suite = match.group(1)
        
        # Extract it block  
        match = re.search(it_pattern, line)
        if match:
            test_name = match.group(1)
            if current_suite:
                full_name = f"{current_suite} > {test_name}"
            else:
                full_name = test_name
            
            # Check if this test passed or failed
            if line.startswith('✓') or 'PASS' in line:
                results.append({"name": full_name, "status": "PASSED"})
            elif line.startswith('❯') or 'FAIL' in line:
                results.append({"name": full_name, "status": "FAILED"})
    
    return results

if __name__ == "__main__":
    # Read from stdin
    output = sys.stdin.read()
    
    # Parse output
    results = parse_vitest_output(output)
    
    # Output JSON
    print(json.dumps(results, indent=2))
