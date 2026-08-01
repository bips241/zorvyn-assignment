# Silver Task Authoring Guide for zorvyn-assignment

This guide identifies real bugs, features, and edge cases suitable for Silver task authoring against this repository.

## Repository Overview

**Type**: Finance data processing backend with RBAC  
**Language**: TypeScript  
**Framework**: Express.js + Prisma + PostgreSQL  
**Commit History**: 11 commits with meaningful evolution  
**Test Coverage**: Unit tests + integration test suite  

---

## Prospective Task Ideas

### ✅ High-Quality Task Candidates

#### 1. **JWT Token Refresh Logic Bug** (Medium Difficulty)

**Location**: `src/shared/auth/jwt.ts`, `src/modules/auth/auth.service.ts`

**Why it's good**:
- Real auth issue: token expiry handling across multiple functions
- Non-obvious root cause: likely mismatch between token generation and validation logic
- Cross-module: affects multiple endpoints through middleware
- Hard for agents: requires understanding JWT lifecycle, not just syntax

**Potential bugs to create**:
- Token verification failing for valid tokens due to wrong expiry check
- Refresh token not properly invalidating old tokens
- Timezone issues with expiry timestamps
- Wrong algorithm specified in verification

**Testing approach**: Create tokens with specific TTLs, verify they're rejected/accepted at right times

---

#### 2. **RBAC Permission Bypass via Role Escalation** (Hard Difficulty)

**Location**: `src/modules/access-control/rbac.ts`, `src/shared/middleware/authorize.ts`

**Why it's good**:
- Security-critical: permission checks are subtle and easy to get wrong
- Multiple files involved: rbac.ts defines logic, authorize middleware applies it
- Edge case-focused: cascading permissions, implicit grants, role transitions
- Hard for agents: requires understanding permission matrices, not pattern matching

**Potential bugs to create**:
- Missing check for role transition from VIEWER→ANALYST (skips permission gate)
- Role check validates presence but not specific required permissions
- Permission cache not invalidating on role change
- Authorization middleware bypassed for certain routes

**Testing approach**: Test role transitions, permission state changes, endpoint access matrices

---

#### 3. **Dashboard Analytics Calculation Error** (Medium Difficulty)

**Location**: `src/modules/dashboard/dashboard.service.ts`

**Why it's good**:
- Business logic: requires understanding financial calculations
- Data aggregation bug: likely incorrect filtering, grouping, or sum logic
- Behavioral verification needed: output correctness, not just code structure
- Subtle: small math error affects all downstream consumers

**Potential bugs to create**:
- Income/expense categorization reversed in calculations
- Filtering logic excludes valid records (off-by-one on dates)
- Aggregation counts wrong user subset (missing WHERE clause)
- Division by zero when no data exists

**Testing approach**: Fixed dataset of records, verify calculations match expected totals

---

#### 4. **Record Validation Bypass** (Medium Difficulty)

**Location**: `src/modules/records/records.schema.ts`, `src/modules/records/records.service.ts`

**Why it's good**:
- Data validation: Zod schemas often have subtle issues
- Cross-validation: business rules require multiple fields to validate correctly
- Hard for agents: requires understanding schema semantics, not just code syntax

**Potential bugs to create**:
- Decimal precision not enforced (amounts stored with wrong precision)
- Date ranges not validated (end date before start date allowed)
- Enum validation missing (invalid RecordType accepted)
- Concurrent updates bypass optimistic locking

**Testing approach**: Submit invalid records, verify they're rejected; submit valid ones accepted

---

#### 5. **Middleware Execution Order Issue** (Medium Difficulty)

**Location**: `src/app.ts`, `src/shared/middleware/`

**Why it's good**:
- System-level bug: middleware order affects all routes
- Non-obvious failure mode: bug manifests indirectly
- Hard for agents: requires understanding Express request lifecycle

**Potential bugs to create**:
- Authentication middleware runs after authorization (checks auth after perms)
- Error handler doesn't catch async errors from certain middleware
- CORS headers set after response sent in error path
- Morgan logging includes sensitive data

**Testing approach**: Test middleware interaction, verify error handling, check header presence

---

## Task Authoring Workflow

### Step 1: Pick a Bug

1. Choose one of the ideas above or identify a real bug in your repo history
2. Find the commit **before** the fix (this is your `base_commit`)
3. Verify the bug exists at that commit and is fixed after

### Step 2: Write Tests That Fail at Base Commit

Create test files under `tests/` using your test runner (vitest):

```typescript
// Example: tests/task-name.test.ts
describe('Feature under test', () => {
  test('should exhibit bug behavior', async () => {
    // Setup
    const input = { /* ... */ };
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert - this MUST fail at base_commit
    expect(result).toEqual(expectedCorrectBehavior);
  });
});
```

**Key requirements**:
- Test must FAIL at base_commit
- Test must PASS after your fix
- Test names must exactly match test runner output (copy from `npm test` output)
- Tests must verify behavior, not implementation details

### Step 3: Write the Fix (solution/solve.sh)

1. Create your fix in the code
2. Generate a unified diff: `git diff --no-color src/ > /tmp/fix.patch`
3. Verify the patch applies cleanly: `git apply --check /tmp/fix.patch`
4. Wrap it in solve.sh for Silver

### Step 4: Test Locally with Harbor

Before submitting to Silver, run Harbor locally (requires Docker):

```bash
# Install Harbor
pip install harbor

# Download template from Silver for your chosen base_commit
# Unzip and fill in your task files

# Test 1: Null run (solution NOT applied)
harbor run -p ./my-task -a nop
# MUST report: fail_to_pass tests FAIL, reward.txt = 0

# Test 2: Oracle run (solution applied)
harbor run -p ./my-task -a oracle
# MUST report: all tests PASS, reward.txt = 1

# View results
harbor view ./jobs
```

If both pass locally, submit to Silver. If either fails, debug locally first.

### Step 5: Submit & Iterate

On Silver:
1. Click **Template** for this repo, select your base_commit
2. Download the zip (has pre-filled test structure)
3. Edit locally: instruction.md, tests/config.json, solution/solve.sh
4. Click **Import** to upload, then **Submit**
5. Check validation results in the **Validation** tab
6. If failed, read feedback and iterate offline before resubmitting

---

## Task Format Reference

### instruction.md
```markdown
# [Brief title]

[Describe the bug/feature from the user's perspective]

## Expected Behavior
[What should happen]

## Actual Behavior  
[What currently happens]

## Constraints
[Any relevant implementation constraints]
```

### tests/config.json
```json
{
  "base_commit": "3a06b6c",
  "fail_to_pass": ["test name 1", "test name 2"],
  "pass_to_pass": ["test name 3"],
  "test_patch": "--- a/tests/task-name.test.ts\n+++ b/tests/task-name.test.ts\n...",
  "selected_test_files_to_run": ["tests/task-name.test.ts"]
}
```

### solution/solve.sh
```bash
#!/bin/bash
git apply << 'EOF'
--- a/src/path/file.ts
+++ b/src/path/file.ts
@@ -10,5 +10,5 @@
 context line
 context line
-old line
+new line
 context line
 context line
EOF
```

---

## Common Mistakes to Avoid

### ❌ Don't:
- Write tests that grep source for variable names (test implementation)
- Make instructions over-prescriptive with pseudocode
- Choose tasks that are too easy (agent solves in 1 run) or impossible (0/10 difficulty)
- Forget to include context lines in diffs (patch won't apply)
- Use test names that don't match test runner output exactly
- Create tasks that are homework/tutorials/scaffolding

### ✅ Do:
- Test behavior: run code, assert outputs
- Write outcome-focused instructions: describe what should be true, not how
- Choose problems with non-obvious root causes
- Include 3+ lines of context before/after changes in diffs
- Copy test names directly from `npm test` output
- Pick real bugs/features from your codebase

---

## Difficulty Calibration

The platform runs your task 10 times against a frontier model. Your task is accepted if it solves **1–4 times** out of 10:

- **0/10**: Task is unsolvable or tests are broken → Rejected
- **1–4/10**: Goldilocks zone → Accepted ✅
- **5+/10**: Task is too easy → Rejected

**Tips to hit the sweet spot**:
- Bugs with non-obvious root causes (symptom in one place, fix in another)
- Edge cases requiring careful reasoning (off-by-one, boundary conditions)
- Problems spanning multiple files or modules
- Issues with subtle interactions between components

**Avoid**:
- Single-line fixes (too easy)
- Clear error messages that point to the solution (too easy)
- Vague, ambiguous instructions (unfair, not hard)

---

## Payout & Timeline

- **Per approved task**: $75
- **Per approved repository** (5+ tasks): $300 bonus
- **Maximum tasks per repo**: 20
- **Timeline**: Most tasks take 2–4 submission attempts; feedback is specific and actionable

---

## Quick Reference: Silver File Locations

| File | Purpose |
|------|---------|
| [Dockerfile](./Dockerfile) | Production build (already compliant) |
| [SILVER_SUBMISSION.md](./SILVER_SUBMISSION.md) | Submission checklist & status |
| [package.json](./package.json) | Dependencies (all pinned) |
| [vitest.config.ts](./vitest.config.ts) | Test runner config |
| [src/](./src/) | Source code to reference |
| [docs/](./docs/) | Architecture & design docs |

---

## Questions?

Refer to:
- **Silver FAQ**: https://silver.afterquery.com/faq
- **Task authoring docs**: https://silver.afterquery.com/docs
- **Rubric criteria**: See SILVER_SUBMISSION.md for the 11 grading criteria
