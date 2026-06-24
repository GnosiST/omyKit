# Task Intake Broker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a project-level task intake broker so repeated `$omykit` requests can be recorded, classified, merged, split into workstreams, flagged for conflicts, and projected to the board before runtime worker dispatch.

**Architecture:** Keep the Node controller as the durable source of truth. Add `.omykit/tasks/tasks.jsonl` as a project-level inbox, classify each incoming brief with conservative heuristics, link tasks to active workflows when safe, and project inbox/workstream/conflict signals into doctor, board, and orchestration output without pretending the controller itself spawns Codex agents.

**Tech Stack:** Node.js ESM controller, JSONL runtime state, existing workflow templates, existing assignment `write_scope`, existing board projection, existing validator/test script.

---

### Task 1: Add Task Inbox Controller Primitives

**Files:**
- Modify: `scripts/test-omykit-workflow.mjs`
- Modify: `scripts/omykit-workflow.mjs`

- [ ] **Step 1: Write failing task inbox tests**

Add tests after the existing doctor/cleanup section:

```javascript
const tmpTasks = fs.mkdtempSync(path.join(os.tmpdir(), "omykit-workflow-tasks-"));
run(["init", "修复首页 UI 货不对版", "--id", "ui-defects", "--template", "frontend-ui.strict", "--lang", "zh-CN"], tmpTasks);
const firstTask = JSON.parse(run(["tasks", "add", "修 bug：根据截图修首页字体、卡片间距和 TabBar 图标", "--lang", "zh-CN", "--json"], tmpTasks));
assert.equal(firstTask.decision, "merge_current");
assert.equal(firstTask.template_id, "frontend-ui.strict");
assert.ok(firstTask.tags.includes("ui"));
assert.ok(firstTask.suggested_write_scope.includes("styles/tokens/**"));
const secondTask = JSON.parse(run(["tasks", "add", "修 bug：二级页面也没测试到，和上面问题一样", "--lang", "zh-CN", "--json"], tmpTasks));
assert.equal(secondTask.decision, "merge_current");
assert.equal(secondTask.relation, "same_problem_family");
assert.equal(secondTask.conflict_risk, "medium");
const taskList = JSON.parse(run(["tasks", "list", "--json"], tmpTasks));
assert.equal(taskList.tasks.length, 2);
assert.equal(taskList.summary.total, 2);
assert.ok(taskList.summary.by_decision.merge_current >= 2);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-omykit-workflow.mjs`

Expected: FAIL with `Unknown command: tasks`.

- [ ] **Step 3: Implement task inbox files and command routing**

Add helpers:

```javascript
function tasksRoot(cwd = process.cwd()) {
  return path.join(omykitRoot(cwd), "tasks");
}

function tasksFile(cwd = process.cwd()) {
  return path.join(tasksRoot(cwd), "tasks.jsonl");
}

function readTaskInbox(cwd = process.cwd()) {
  const file = tasksFile(cwd);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}
```

Add `cmdTasks(positional, options)` and route `case "tasks": cmdTasks(positional, options);`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test-omykit-workflow.mjs`

Expected: PASS.

### Task 2: Add Merge Gate Classification

**Files:**
- Modify: `scripts/test-omykit-workflow.mjs`
- Modify: `scripts/omykit-workflow.mjs`

- [ ] **Step 1: Write failing merge/follow-up tests**

Extend `tmpTasks` test:

```javascript
const statePath = path.join(tmpTasks, ".omykit", "workflows", "ui-defects", "state.json");
const state = readJson(statePath);
for (const nodeId of Object.keys(state.nodes)) {
  state.nodes[nodeId] = { status: "passed", updated_at: "2099-01-01T00:00:00.000Z", last_handoff: `handoffs/${nodeId}.json` };
}
writeJson(statePath, state);
const followUp = JSON.parse(run(["tasks", "add", "修 bug：设置页也存在同类 UI 问题", "--lang", "zh-CN", "--json"], tmpTasks));
assert.equal(followUp.decision, "linked_follow_up");
assert.equal(followUp.linked_workflow_id, "ui-defects");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-omykit-workflow.mjs`

Expected: FAIL because completed workflow still returns `merge_current`.

- [ ] **Step 3: Implement conservative merge gate**

Rules:

```text
active workflow exists and is not fully terminal -> merge_current
active workflow exists and all nodes terminal -> linked_follow_up
no active workflow and brief implies broad/multiple/parallel -> new_workflow with mission.orchestration
no active workflow and brief implies UI -> new_workflow with frontend-ui.strict
otherwise -> new_workflow with change.standard or bugfix.standard
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test-omykit-workflow.mjs`

Expected: PASS.

### Task 3: Project Tasks To Board, Doctor, And Orchestration

**Files:**
- Modify: `scripts/test-omykit-workflow.mjs`
- Modify: `scripts/omykit-workflow.mjs`
- Modify: `docs/workflow/controller.md`
- Modify: `docs/workflow/controller.zh-CN.md`

- [ ] **Step 1: Write failing projection tests**

Extend `tmpTasks` test:

```javascript
run(["board", "--lang", "zh-CN"], tmpTasks);
const taskBoard = readJson(path.join(tmpTasks, ".omykit", "workflows", "ui-defects", "board.json"));
assert.equal(taskBoard.task_inbox.summary.total >= 3, true);
assert.ok(taskBoard.workstreams.some((item) => item.kind === "ui_surface"));
assert.ok(taskBoard.conflicts.some((item) => item.kind === "scope_overlap"));
const taskDoctor = JSON.parse(run(["doctor", "--json", "--lang", "zh-CN"], tmpTasks));
assert.ok(taskDoctor.project.task_inbox.total >= 3);
const taskOrchestration = JSON.parse(run(["orchestrate", "--json", "--lang", "zh-CN"], tmpTasks));
assert.ok(taskOrchestration.task_intake.summary.total >= 3);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-omykit-workflow.mjs`

Expected: FAIL because board/doctor/orchestrate lack task inbox fields.

- [ ] **Step 3: Implement projections**

Add `buildTaskInboxProjection(cwd, workflowId, language)` returning:

```json
{
  "summary": { "total": 0, "open": 0, "by_decision": {} },
  "tasks": [],
  "workstreams": [],
  "conflicts": []
}
```

Include it in board as `task_inbox`, `workstreams`, and `conflicts`; include summary in doctor project; include task intake summary in orchestration plan.

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test-omykit-workflow.mjs`

Expected: PASS.

### Task 4: Update Skill And Documentation

**Files:**
- Modify: `skills/omykit/SKILL.md`
- Modify: `docs/workflow/multi-agent-coordination.md`
- Modify: `docs/workflow/multi-agent-coordination.zh-CN.md`
- Modify: `docs/workflow/controller.md`
- Modify: `docs/workflow/controller.zh-CN.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Document user-facing behavior**

State that repeated `$omykit` requests should be recorded through the task broker before creating workflows, and that normal users do not manually pick merge/parallel/conflict routes.

- [ ] **Step 2: Document runtime boundary**

State that Task Inbox/Merge Gate/Workstream/Scope Conflict are implemented in the controller, while actual subagent/thread creation remains Codex runtime responsibility.

- [ ] **Step 3: Run validation**

Run:

```bash
node scripts/omykit-workflow.mjs templates validate
node scripts/test-omykit-workflow.mjs
node ./scripts/validate-docs.mjs
PYTHON=/tmp/omykit-skill-validate/bin/python ./scripts/validate-skills.sh
git diff --check
```

Expected: all pass.

### Task 5: Install And Final Verification

**Files:**
- Read: `/Users/irainbow/.codex/omykit/install-manifest`

- [ ] **Step 1: Commit tracked changes**

Run:

```bash
git status --short
git add CHANGELOG.md docs/workflow/controller.md docs/workflow/controller.zh-CN.md docs/workflow/multi-agent-coordination.md docs/workflow/multi-agent-coordination.zh-CN.md docs/superpowers/plans/2026-06-24-task-intake-broker.md scripts/omykit-workflow.mjs scripts/test-omykit-workflow.mjs skills/omykit/SKILL.md
git commit -m "Add task intake broker"
```

- [ ] **Step 2: Install from clean commit**

Run:

```bash
PYTHON=/tmp/omykit-skill-validate/bin/python ./scripts/install-global.sh
cat /Users/irainbow/.codex/omykit/install-manifest
```

Expected: manifest points to the new commit and `git_dirty=false`.

- [ ] **Step 3: Push and final status**

Run:

```bash
git push origin main
git status --short --branch
```

Expected: `## main...origin/main`.
