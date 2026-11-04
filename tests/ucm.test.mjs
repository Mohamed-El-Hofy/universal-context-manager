import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { claim, inspectStaleness, listCheckpoints, loadLatest, redact, save, validatePayload, verifyFiles } from '../scripts/ucm.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEST_BASE = path.join(ROOT, `.test-work-${process.pid}`);
after(() => fs.rmSync(TEST_BASE, { recursive: true, force: true }));
function tempProject() {
  fs.mkdirSync(TEST_BASE, { recursive: true });
  return fs.mkdtempSync(path.join(TEST_BASE, 'project-'));
}
function checkpoint(overrides = {}) {
  return {
    goal: 'Preserve the project state for the next coding session',
    status: 'in_progress',
    completed: [],
    decisions: [],
    open_questions: [],
    changed_files: [],
    verification: { status: 'not_run', checks: [] },
    next_action: 'Inspect the saved files and continue the next implementation step',
    ...overrides,
  };
}

test('redacts common secrets before persistence', () => {
  const [text, count] = redact('api_key=sk-abcdefghijklmnopqrstuvwxyz Bearer abcdefghijklmnop');
  assert.ok(count >= 2);
  assert.ok(!text.includes('abcdefghijklmnopqrstuvwxyz'));
  assert.ok(!text.includes('abcdefghijklmnop'));
});

test('redacts structured secrets by key at any nesting level and rejects non-string list items', () => {
  const [clean, count] = redact({ nested: [{ password: 'deep-secret', metadata: { access_token: 'token-value-123' } }] });
  assert.equal(count, 2);
  assert.equal(clean.nested[0].password, '[REDACTED]');
  assert.equal(clean.nested[0].metadata.access_token, '[REDACTED]');
  assert.equal(validatePayload(checkpoint({ completed: [{ task: 'not a string' }] })).passed, false);
});

test('nested secret values are redacted in the persisted checkpoint', () => {
  const root = tempProject();
  try {
    const payload = checkpoint({ verification: { status: 'not_run', checks: [], metadata: { password: 'never-store-this' } } });
    const result = save(root, 'Codex', payload);
    assert.equal(result.redactions, 1);
    assert.equal(loadLatest(root).record.data.verification.metadata.password, '[REDACTED]');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('quality gate scores complete checkpoints and rejects placeholders', () => {
  const good = validatePayload(checkpoint());
  assert.equal(good.passed, true);
  assert.equal(good.score, 100);
  const incomplete = validatePayload(checkpoint({ goal: '[TODO: describe goal]' }));
  assert.equal(incomplete.passed, false);
  assert.ok(incomplete.warnings.some((warning) => warning.includes('TODO')));
});

test('validate CLI reports score and redactions without echoing secret values', () => {
  const root = tempProject();
  try {
    const cli = path.join(ROOT, 'scripts', 'ucm.mjs');
    const input = checkpoint({ goal: '[TODO: write goal]', notes: 'api_key=sk-abcdefghijklmnopqrstuvwxyz' });
    const result = spawnSync(process.execPath, [cli, 'validate', '--stdin'], { input: JSON.stringify(input), encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stdout, /"score"/);
    assert.match(result.stdout, /"redactions": 1/);
    assert.ok(!result.stdout.includes('sk-abcdefghijklmnopqrstuvwxyz'));
    assert.ok(!fs.existsSync(path.join(root, '.ucm')));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('checkpoint has integrity and resume detects changed files', () => {
  const root = tempProject();
  try {
    fs.mkdirSync(path.join(root, 'src'));
    const target = path.join(root, 'src', 'demo.mjs');
    fs.writeFileSync(target, 'phase one\n');
    const result = save(root, 'Freebuff', checkpoint({ goal: 'Implement demo phase one and hand it to the next agent', completed: ['phase one'], next_action: 'Complete phase two and run the focused verification', handoff_to: 'Codex', handoff_focus: 'Finish demo phase two', changed_files: ['src/demo.mjs'], notes: 'password=hunter2' }));
    assert.equal(result.redactions, 1);
    const { record } = loadLatest(root);
    assert.match(fs.readFileSync(result.path, 'utf8'), /\[REDACTED\]/);
    assert.deepEqual(verifyFiles(root, record), ['OK src/demo.mjs']);
    assert.equal(inspectStaleness(root, record).status, 'fresh');
    fs.writeFileSync(target, 'changed content\n');
    assert.deepEqual(verifyFiles(root, record), ['CHANGED src/demo.mjs']);
    assert.equal(inspectStaleness(root, record).status, 'changed');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('one receiver claims a handoff and a second writer is rejected', () => {
  const root = tempProject();
  try {
    save(root, 'Freebuff', checkpoint({ goal: 'Transfer a demo task to Codex for continuation', completed: ['sample stage'], next_action: 'Continue the sample and verify the result', handoff_to: 'Codex', handoff_focus: 'Continue the sample demo' }));
    const { record } = loadLatest(root);
    assert.ok(fs.existsSync(claim(root, 'Codex', record)));
    assert.throws(() => claim(root, 'Codex', record), /already claimed/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('a receiver claim restricts continuation saves to that receiver', () => {
  const root = tempProject();
  try {
    save(root, 'Freebuff', checkpoint({ goal: 'Transfer this task to Codex safely', next_action: 'Continue implementation and verify the result', handoff_to: 'Codex', handoff_focus: 'Complete the implementation' }));
    claim(root, 'Codex', loadLatest(root).record);
    assert.throws(() => save(root, 'Claude Code', checkpoint()), /only that agent may save/);
    assert.doesNotThrow(() => save(root, 'Codex', checkpoint({ goal: 'Continue the claimed task as Codex' })));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('concurrent save lock fails closed instead of racing the history pointer', () => {
  const root = tempProject();
  try {
    fs.mkdirSync(path.join(root, '.ucm', 'locks'), { recursive: true });
    fs.writeFileSync(path.join(root, '.ucm', 'locks', 'save.lock'), 'active');
    assert.throws(() => save(root, 'Codex', checkpoint()), /save is in progress/);
    assert.equal(listCheckpoints(root).length, 0);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('refuses checkpoint writes through a .ucm directory symlink', (t) => {
  const root = tempProject(); const outside = tempProject();
  try {
    try { fs.symlinkSync(outside, path.join(root, '.ucm'), 'junction'); }
    catch { t.skip('Directory symlink creation is unavailable on this host'); return; }
    assert.throws(() => save(root, 'Codex', checkpoint()), /Unsafe UCM directory/);
    assert.equal(fs.existsSync(path.join(outside, 'latest.json')), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); fs.rmSync(outside, { recursive: true, force: true }); }
});

test('refuses checkpoint writes when .ucm is a file instead of a directory', () => {
  const root = tempProject();
  try {
    fs.writeFileSync(path.join(root, '.ucm'), 'not a directory');
    assert.throws(() => save(root, 'Codex', checkpoint()), /Unsafe UCM directory/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('Codex, Claude, and Gemini hook command simulations persist markers without transcripts', () => {
  const root = tempProject();
  try {
    const cli = path.join(ROOT, 'scripts', 'ucm.mjs');
    const cases = [['Codex', 'PreCompact'], ['Claude Code', 'SessionEnd'], ['Gemini CLI', 'AfterAgent']];
    for (const [agent, event] of cases) {
      const input = JSON.stringify({ hook_event_name: event, session_id: `demo-${agent}`, transcript_path: 'C:/private/transcript.json', prompt: 'password=not-to-store' });
      const result = spawnSync(process.execPath, [cli, 'hook', '--agent', agent, '--event', event, '--project', root], { input, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, new RegExp(`"recorded":"${event}"`));
    }
    const contents = fs.readFileSync(path.join(root, '.ucm', 'events.jsonl'), 'utf8');
    assert.match(contents, /PreCompact/);
    assert.match(contents, /SessionEnd/);
    assert.match(contents, /AfterAgent/);
    assert.ok(!contents.includes('transcript'));
    assert.ok(!contents.includes('not-to-store'));
    assert.ok(!contents.includes('demo-secret-id'));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('CLI saves with agent A, resumes and claims with agent B', () => {
  const root = tempProject();
  try {
    const cli = path.join(ROOT, 'scripts', 'ucm.mjs');
    const payload = checkpoint({ goal: 'Test a two-agent checkpoint handoff from Freebuff to Claude Code', completed: ['agent A saved'], next_action: 'Resume the demo and confirm the first next step', handoff_to: 'Claude Code', handoff_focus: 'Resume the two-agent demo', suggested_skills: ['universal-context-manager'], references: ['README.md'] });
    const saved = spawnSync(process.execPath, [cli, 'save', '--project', root, '--agent', 'Freebuff', '--stdin'], { input: JSON.stringify(payload), encoding: 'utf8' });
    assert.equal(saved.status, 0, saved.stderr);
    const resumed = spawnSync(process.execPath, [cli, 'resume', '--project', root, '--agent', 'Claude Code'], { encoding: 'utf8' });
    assert.equal(resumed.status, 0, resumed.stderr);
    assert.match(resumed.stdout, /Resume the demo and confirm the first next step/);
    assert.match(resumed.stdout, /Suggested skills for the next agent/);
    assert.match(resumed.stdout, /Freshness/);
    const claimed = spawnSync(process.execPath, [cli, 'claim', '--project', root, '--agent', 'Claude Code'], { encoding: 'utf8' });
    assert.equal(claimed.status, 0, claimed.stderr);
    assert.match(claimed.stdout, /"claimed":true/);
    const listed = spawnSync(process.execPath, [cli, 'list', '--project', root], { encoding: 'utf8' });
    assert.equal(listed.status, 0, listed.stderr);
    const rows = JSON.parse(listed.stdout);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].handoff_to, 'Claude Code');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('checkpoint history links each save to its predecessor', () => {
  const root = tempProject();
  try {
    save(root, 'Codex', checkpoint({ goal: 'Record the initial checkpoint for a chained task' }));
    const first = loadLatest(root).record;
    save(root, 'Claude Code', checkpoint({ goal: 'Record a continuation checkpoint for a chained task', completed: ['Read the previous checkpoint'] }));
    const second = loadLatest(root).record;
    assert.equal(first.parent_id, null);
    assert.equal(second.parent_id, first.id);
    assert.equal(listCheckpoints(root).length, 2);
    assert.equal(listCheckpoints(root)[0].id, second.id);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('Git branch and commit changes appear in resume freshness report', () => {
  const root = tempProject();
  const runGit = (args) => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' });
  try {
    assert.equal(runGit(['init', '-q']).status, 0);
    fs.writeFileSync(path.join(root, '.gitignore'), '.ucm/\n');
    fs.writeFileSync(path.join(root, 'sample.txt'), 'first state\n');
    assert.equal(runGit(['add', '.gitignore', 'sample.txt']).status, 0);
    assert.equal(runGit(['-c', 'user.name=UCM Test', '-c', 'user.email=ucm-test@example.invalid', 'commit', '-q', '-m', 'initial']).status, 0);
    save(root, 'Codex', checkpoint({ goal: 'Capture repository state for staleness verification' }));
    const saved = loadLatest(root).record;
    assert.equal(inspectStaleness(root, saved).status, 'fresh');
    fs.writeFileSync(path.join(root, 'untracked.txt'), 'new untracked file\n');
    assert.equal(inspectStaleness(root, saved).status, 'changed');
    fs.rmSync(path.join(root, 'untracked.txt'));
    fs.writeFileSync(path.join(root, 'sample.txt'), 'second state\n');
    assert.equal(runGit(['add', 'sample.txt']).status, 0);
    assert.equal(runGit(['-c', 'user.name=UCM Test', '-c', 'user.email=ucm-test@example.invalid', 'commit', '-q', '-m', 'follow-up']).status, 0);
    const freshness = inspectStaleness(root, saved);
    assert.equal(freshness.status, 'changed');
    assert.ok(freshness.reasons.includes('HEAD changed since checkpoint'));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('supported hook configs are parseable and point at existing helper', () => {
  const files = [
    'adapters/codex/hooks/hooks.json',
    'adapters/claude/settings.json.example',
    'adapters/gemini/settings.json.example',
  ];
  for (const file of files) assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8')), file);
  assert.ok(fs.existsSync(path.join(ROOT, 'scripts', 'ucm.mjs')));
  assert.ok(fs.existsSync(path.join(ROOT, 'adapters', 'context-mode', 'README.md')));
});
