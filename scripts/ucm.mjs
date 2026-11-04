#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const VERSION = '1.0.0';
export const MIN_CHECKPOINT_SCORE = 70;
const STATUSES = new Set(['not_started', 'in_progress', 'blocked', 'complete', 'completed']);
const SECRET_PATTERNS = [
  /(\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|password|passwd|secret)\b\s*[:=]\s*)(['"]?)([^\s,;"']{6,})/gi,
  /(\bBearer\s+)([A-Za-z0-9._~+/=-]{12,})/gi,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /\bsk-[A-Za-z0-9_-]{16,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
];
const SENSITIVE_PATH = /(^|[/\\])(?:\.env(?:\..*)?|[^/\\]*(?:secret|credential|private[_-]?key)[^/\\]*|id_rsa|id_ed25519)$/i;
const SENSITIVE_KEY = /(?:password|passwd|secret|token|api[_-]?key|credential|private[_-]?key|authorization|cookie)/i;
const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

export function redact(value) {
  let count = 0;
  if (typeof value === 'string') {
    let text = value;
    for (const re of SECRET_PATTERNS) {
      text = text.replace(re, (...args) => {
        count++;
        const match = args[0];
        if (re === SECRET_PATTERNS[0]) return `${args[1]}${args[2]}[REDACTED]`;
        if (re === SECRET_PATTERNS[1]) return `${args[1]}[REDACTED]`;
        return '[REDACTED]';
      });
    }
    return [text, count];
  }
  if (Array.isArray(value)) {
    const out = value.map((item) => { const [v, n] = redact(item); count += n; return v; });
    return [out, count];
  }
  if (value && typeof value === 'object') {
    const out = Object.create(null);
    for (const [key, item] of Object.entries(value)) {
      const [safeKey, n1] = redact(key);
      if (SENSITIVE_KEY.test(key)) {
        out[safeKey] = '[REDACTED]';
        count += n1 + 1;
      } else {
        const [safeValue, n2] = redact(item);
        Object.defineProperty(out, safeKey, { value: safeValue, enumerable: true, writable: true, configurable: true });
        count += n1 + n2;
      }
    }
    return [out, count];
  }
  return [value, 0];
}

function atomicWrite(file, content, exclusive = false) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (exclusive) {
    const fd = fs.openSync(file, 'wx', 0o600);
    try { fs.writeFileSync(fd, content, 'utf8'); } finally { fs.closeSync(fd); }
    return;
  }
  const tmp = path.join(path.dirname(file), `.ucm-${crypto.randomUUID()}.tmp`);
  try { fs.writeFileSync(tmp, content, { encoding: 'utf8', mode: 0o600 }); fs.renameSync(tmp, file); }
  finally { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); }
}

function projectRoot(input) {
  const requested = path.resolve(input);
  if (!fs.existsSync(requested) || !fs.statSync(requested).isDirectory()) throw new Error(`Project directory does not exist: ${requested}`);
  return fs.realpathSync(requested);
}
function inside(root, candidate) {
  const rel = path.relative(root, candidate);
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
}

function ensureUcmDir(root, ...parts) {
  let current = root;
  for (const part of ['.ucm', ...parts]) {
    current = path.join(current, part);
    try { fs.mkdirSync(current); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Unsafe UCM directory: ${path.relative(root, current)}`);
    const real = fs.realpathSync(current);
    if (!inside(root, real)) throw new Error(`UCM directory escapes the project root: ${path.relative(root, current)}`);
    current = real;
  }
  return current;
}

function existingUcmDir(root, ...parts) {
  let current = root;
  for (const part of ['.ucm', ...parts]) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) return null;
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Unsafe UCM directory: ${path.relative(root, current)}`);
    current = fs.realpathSync(current);
    if (!inside(root, current)) throw new Error(`UCM directory escapes the project root: ${path.relative(root, current)}`);
  }
  return current;
}

function existingUcmFile(root, ...parts) {
  const name = parts.pop();
  const dir = existingUcmDir(root, ...parts);
  if (!dir) return null;
  const file = path.join(dir, name);
  if (fs.existsSync(file) && fs.lstatSync(file).isSymbolicLink()) throw new Error(`Unsafe UCM file link: ${path.relative(root, file)}`);
  return file;
}

function ucmFile(root, ...parts) {
  const name = parts.pop();
  const file = path.join(ensureUcmDir(root, ...parts), name);
  if (fs.existsSync(file) && fs.lstatSync(file).isSymbolicLink()) throw new Error(`Unsafe UCM file link: ${path.relative(root, file)}`);
  return file;
}

export function validatePayload(payload) {
  const errors = []; const warnings = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { passed: false, score: 0, minimum_score: MIN_CHECKPOINT_SCORE, errors: ['Checkpoint input must be a JSON object'], warnings, redactions: 0 };
  }
  const [data, redactions] = redact(payload);
  let score = 0;
  const nonEmpty = (key) => typeof data[key] === 'string' && data[key].trim().length > 0;
  if (nonEmpty('goal') && data.goal.trim().length >= 8) score += 15; else errors.push('Add a clear goal of at least 8 characters.');
  if (nonEmpty('status') && STATUSES.has(data.status)) score += 10;
  else if (!nonEmpty('status')) errors.push('Add a status.');
  else errors.push('Use a standard status: not_started, in_progress, blocked, complete, or completed.');
  if (nonEmpty('next_action')) {
    const action = data.next_action.trim();
    if (action.length >= 8 && !/^(todo|tbd|continue|continue working|none|n\/?a|later)$/i.test(action)) score += 20;
    else if (data.status === 'complete' || data.status === 'completed') score += 10;
    else errors.push('Make next_action a specific first step.');
  } else errors.push('Add the next action.');
  for (const [field, weight, label] of [
    ['completed', 10, 'completed work'], ['decisions', 10, 'decisions'], ['open_questions', 10, 'open questions'], ['changed_files', 5, 'changed_files']
  ]) {
    if (Array.isArray(data[field]) && data[field].every((item) => typeof item === 'string')) score += weight;
    else errors.push(`Add ${label} as an array (use [] when there are none).`);
  }
  if (Array.isArray(data.changed_files)) {
    for (const item of data.changed_files) {
      if (typeof item !== 'string' || path.isAbsolute(item) || /^[a-z]:[\\/]/i.test(item)
          || item.split(/[\\/]/).includes('..') || SENSITIVE_PATH.test(item)) {
        errors.push('changed_files entries must be safe, project-relative paths.'); break;
      }
    }
  }
  const verification = data.verification;
  if (verification && typeof verification === 'object' && !Array.isArray(verification)
      && ['passed', 'failed', 'partial', 'not_run'].includes(verification.status)
      && Array.isArray(verification.checks) && verification.checks.every((item) => typeof item === 'string')) score += 10;
  else errors.push('Record verification.status and verification.checks, including not_run when nothing was tested.');
  for (const field of ['suggested_skills', 'references']) {
    if (data[field] !== undefined && (!Array.isArray(data[field]) || !data[field].every((item) => typeof item === 'string')))
      errors.push(`${field} must be an array of strings.`);
  }
  for (const field of ['in_progress', 'handoff_to', 'handoff_focus', 'notes']) {
    if (data[field] !== undefined && typeof data[field] !== 'string') errors.push(`${field} must be a string.`);
  }
  if (data.handoff_to) {
    if (typeof data.handoff_to === 'string' && data.handoff_to.trim()) score += 5;
    else errors.push('handoff_to must name one receiving agent.');
    if (nonEmpty('handoff_focus')) score += 5;
    else errors.push('Add handoff_focus so the receiving agent knows the transfer goal.');
  } else score += 10;
  const serialized = JSON.stringify(data);
  if (/\[(?:TODO|TBD|PLACEHOLDER|FILL(?: ME)? IN)[^\]]*\]/i.test(serialized)) {
    score = Math.max(0, score - 35); warnings.push('Replace remaining TODO/TBD placeholders before handoff.');
  }
  if (redactions) warnings.push(`${redactions} secret-like value(s) will be redacted before saving.`);
  const normalizedScore = Math.min(100, score);
  if (normalizedScore < MIN_CHECKPOINT_SCORE) warnings.push(`Checkpoint quality ${normalizedScore}/100 is below the ${MIN_CHECKPOINT_SCORE}-point save threshold.`);
  return { passed: errors.length === 0 && normalizedScore >= MIN_CHECKPOINT_SCORE, score: normalizedScore, minimum_score: MIN_CHECKPOINT_SCORE, errors, warnings, redactions };
}

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000, windowsHide: true }).trim();
}

export function collectGitState(root) {
  try {
    return {
      branch: git(root, ['rev-parse', '--abbrev-ref', 'HEAD']),
      head: git(root, ['rev-parse', 'HEAD']),
      working_tree_changes: git(root, ['status', '--short', '--untracked-files=all']).split(/\r?\n/).filter(Boolean).sort(),
    };
  } catch { return null; }
}

function normalizeFiles(values) {
  const input = Array.isArray(values) ? values : [];
  return [...new Set(input.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean))];
}

function saveUnlocked(root, agent, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Checkpoint input must be a JSON object');
  const validation = validatePayload(payload);
  if (!validation.passed) throw new Error(`Checkpoint validation failed (${validation.score}/${MIN_CHECKPOINT_SCORE} minimum): ${[...validation.errors, ...validation.warnings].join(' ')}`);
  const [clean, redactions] = redact(payload);
  const allowed = new Set(['goal', 'status', 'completed', 'in_progress', 'open_questions', 'decisions', 'changed_files', 'next_action', 'handoff_to', 'handoff_focus', 'suggested_skills', 'references', 'verification', 'notes']);
  const data = Object.fromEntries(Object.entries(clean).filter(([key]) => allowed.has(key)));
  const evidence = [];
  const requestedFiles = normalizeFiles(data.changed_files);
  for (const rel of requestedFiles) {
    const absolute = path.resolve(root, rel);
    if (path.isAbsolute(rel) || rel.split(/[\\/]/).includes('..') || SENSITIVE_PATH.test(rel)) continue;
    if (!fs.existsSync(absolute)) { evidence.push({ path: rel.split(/[\\/]/).join('/'), sha256: null }); continue; }
    const real = fs.realpathSync(absolute);
    if (!inside(root, real) || !fs.statSync(real).isFile()) continue;
    evidence.push({ path: rel.split(/[\\/]/).join('/'), sha256: sha256(fs.readFileSync(real)) });
  }
  data.changed_files = evidence.map((item) => item.path);
  const latestPath = ucmFile(root, 'latest.json');
  let parent = null;
  let previousCreatedAt = null;
  if (fs.existsSync(latestPath)) {
    const previous = loadLatest(root).record;
    parent = previous.id;
    previousCreatedAt = previous.created_at;
    const claimPath = ucmFile(root, 'claims', `${previous.id}.json`);
    if (fs.existsSync(claimPath)) {
      const receipt = JSON.parse(fs.readFileSync(claimPath, 'utf8'));
      if (String(receipt.agent).toLowerCase() !== String(agent).toLowerCase())
        throw new Error(`Latest checkpoint was claimed by ${receipt.agent}; only that agent may save the continuation.`);
    }
  }
  const cleanAgent = redact(String(agent || 'unspecified'))[0].replace(/[\r\n\0]/g, ' ').trim() || 'unspecified';
  const currentTime = Date.now(); const previousTime = Date.parse(previousCreatedAt);
  const createdAt = new Date(Number.isFinite(previousTime) ? Math.max(currentTime, previousTime + 1) : currentTime).toISOString();
  const record = { schema: 1, id: crypto.randomUUID().replaceAll('-', ''), parent_id: parent, created_at: createdAt, agent: cleanAgent, data, file_evidence: evidence, git_state: collectGitState(root), quality: { score: validation.score, minimum_score: MIN_CHECKPOINT_SCORE } };
  const dir = ensureUcmDir(root, 'checkpoints');
  const stem = `${record.created_at.replace(/[-:]/g, '')}-${record.id.slice(0, 8)}`;
  const jsonFile = ucmFile(root, 'checkpoints', `${stem}.json`); const mdFile = ucmFile(root, 'checkpoints', `${stem}.md`);
  const jsonRel = path.relative(root, jsonFile).split(path.sep).join('/'); const mdRel = path.relative(root, mdFile).split(path.sep).join('/');
  const json = `${JSON.stringify(record, null, 2)}\n`;
  atomicWrite(jsonFile, json); atomicWrite(mdFile, renderMarkdown(record));
  atomicWrite(latestPath, `${JSON.stringify({ schema: 1, path: jsonRel, markdown: mdRel, sha256: sha256(json) }, null, 2)}\n`);
  return { path: mdFile, redactions, quality: validation };
}

export function save(root, agent, payload) {
  const lock = ucmFile(root, 'locks', 'save.lock');
  let fd;
  try { fd = fs.openSync(lock, 'wx', 0o600); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('Another checkpoint save is in progress; retry after it finishes.');
    throw error;
  }
  try { return saveUnlocked(root, agent, payload); }
  finally {
    try { fs.closeSync(fd); } catch {}
    try { fs.unlinkSync(lock); } catch {}
  }
}

export function renderMarkdown(record) {
  const d = record.data;
  const bullets = (key) => { const values = d[key] ?? []; const list = Array.isArray(values) ? values : [values]; return list.length ? list.map((v) => `- ${v}`).join('\n') : '- None recorded'; };
  const verification = d.verification ? `**Status:** ${d.verification.status}\n\n${(d.verification.checks ?? []).length ? d.verification.checks.map((item) => `- ${item}`).join('\n') : '- No checks listed'}` : 'Not recorded';
  return `# Project checkpoint\n\n- **Checkpoint:** \`${record.id}\`\n- **Previous:** ${record.parent_id || 'None'}\n- **Quality:** ${record.quality?.score ?? 'unavailable'}/100\n- **Saved:** ${record.created_at}\n- **Agent:** ${record.agent}\n- **Status:** ${d.status}\n- **Handoff to:** ${d.handoff_to || 'Not assigned'}\n\n## Goal\n${d.goal}\n\n## Handoff focus\n${d.handoff_focus || 'None'}\n\n## Completed\n${bullets('completed')}\n\n## In progress\n${d.in_progress || 'None recorded'}\n\n## Decisions\n${bullets('decisions')}\n\n## Open questions\n${bullets('open_questions')}\n\n## Relevant files\n${bullets('changed_files')}\n\n## References\n${bullets('references')}\n\n## Suggested skills for the next agent\n${bullets('suggested_skills')}\n\n## Verification\n${verification}\n\n## Next action\n${d.next_action}\n\n## Notes\n${d.notes || 'None'}\n`;
}

export function loadLatest(root) {
  const pointer = existingUcmFile(root, 'latest.json');
  if (!pointer || !fs.existsSync(pointer)) throw new Error('No saved checkpoint exists yet');
  const meta = JSON.parse(fs.readFileSync(pointer, 'utf8')); const requested = path.resolve(root, meta.path);
  if (!fs.existsSync(requested)) throw new Error('Latest checkpoint file is missing');
  const file = fs.realpathSync(requested);
  if (!inside(root, file)) throw new Error('Latest checkpoint path escapes the project root');
  const raw = fs.readFileSync(file);
  if (sha256(raw) !== meta.sha256) throw new Error('Latest checkpoint integrity check failed');
  const record = JSON.parse(raw.toString('utf8'));
  if (!/^[a-f0-9]{32}$/.test(record.id ?? '')) throw new Error('Checkpoint identifier is invalid');
  return { record, file };
}

export function verifyFiles(root, record) {
  return (record.file_evidence ?? []).map((item) => {
    if (!item || typeof item.path !== 'string' || path.isAbsolute(item.path) || /^[a-z]:[\\/]/i.test(item.path)
        || item.path.split(/[\\/]/).includes('..') || SENSITIVE_PATH.test(item.path)) return `MISSING ${item?.path ?? 'invalid path'}`;
    const requested = path.resolve(root, item.path);
    if (!fs.existsSync(requested)) return `MISSING ${item.path}`;
    const file = fs.realpathSync(requested);
    if (!inside(root, file) || !fs.statSync(file).isFile()) return `MISSING ${item.path}`;
    if (item.sha256 === null) return `CREATED ${item.path}`;
    return sha256(fs.readFileSync(file)) === item.sha256 ? `OK ${item.path}` : `CHANGED ${item.path}`;
  });
}

export function inspectStaleness(root, record) {
  const reasons = []; const fileChecks = verifyFiles(root, record);
  const changedFiles = fileChecks.filter((line) => !line.startsWith('OK '));
  reasons.push(...changedFiles);
  const currentGit = collectGitState(root);
  if (record.git_state && currentGit) {
    if (record.git_state.branch !== currentGit.branch) reasons.push(`BRANCH ${record.git_state.branch} -> ${currentGit.branch}`);
    if (record.git_state.head !== currentGit.head) reasons.push('HEAD changed since checkpoint');
    const previousChanges = record.git_state.working_tree_changes ?? record.git_state.tracked_changes ?? [];
    if (JSON.stringify(previousChanges) !== JSON.stringify(currentGit.working_tree_changes)) reasons.push('Git working-tree changes differ from checkpoint');
  } else if (record.git_state || currentGit) reasons.push('Git state could not be compared');
  const saved = Date.parse(record.created_at);
  const ageHours = Number.isFinite(saved) ? Math.max(0, Math.round((Date.now() - saved) / 3600000 * 10) / 10) : null;
  const status = reasons.length ? 'changed' : (record.git_state || record.file_evidence?.length ? 'fresh' : 'unknown');
  return { status, age_hours: ageHours, reasons, file_checks: fileChecks };
}

export function listCheckpoints(root, limit = 20) {
  const dir = existingUcmDir(root, 'checkpoints');
  if (!dir) return [];
  return fs.readdirSync(dir).filter((name) => name.endsWith('.json')).map((name) => {
    try {
      const file = path.join(dir, name);
      if (fs.lstatSync(file).isSymbolicLink() || !fs.statSync(file).isFile()) return null;
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch { return null; }
  }).filter((record) => record && /^[a-f0-9]{32}$/.test(record.id ?? ''))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || b.id.localeCompare(a.id)).slice(0, limit);
}

export function claim(root, agent, record) {
  const target = String(record.data.handoff_to ?? '').trim();
  if (!target) throw new Error('This checkpoint is not addressed to a receiving agent');
  if (target.toLowerCase() !== agent.trim().toLowerCase()) throw new Error(`Handoff is addressed to ${target}, not ${agent}`);
  const file = ucmFile(root, 'claims', `${record.id}.json`);
  try { atomicWrite(file, `${JSON.stringify({ checkpoint_id: record.id, agent, claimed_at: now() }, null, 2)}\n`, true); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
    throw new Error(`Checkpoint already claimed by ${existing.agent} at ${existing.claimed_at}`);
  }
  return file;
}

export function hook(root, agent, event, raw) {
  const payload = JSON.parse(raw || '{}'); const id = String(payload.session_id ?? '');
  const safe = (value) => redact(String(value || 'unspecified'))[0].replace(/[\r\n\0]/g, ' ').trim().slice(0, 120) || 'unspecified';
  const row = { time: now(), agent: safe(agent), event: safe(payload.hook_event_name || event), session_ref: id ? sha256(id).slice(0, 16) : null };
  const file = ucmFile(root, 'events.jsonl');
  fs.appendFileSync(file, `${JSON.stringify(row)}\n`, 'utf8');
  return { ok: true, recorded: row.event };
}

function usage() {
  return 'Usage: node scripts/ucm.mjs <init|validate|save|list|resume|claim|hook|self-check> [options]\n';
}
function value(args, flag, fallback = undefined) { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : fallback; }
function has(args, flag) { return args.includes(flag); }

function main(args) {
  const [command, ...rest] = args;
  if (!command || has(args, '--help') || command === 'help') { process.stdout.write(usage()); return 0; }
  if (command === '--version') { console.log(VERSION); return 0; }
  if (command === 'self-check') {
    const [value, count] = redact({ note: 'api_key=sk-abcdefghijklmnopqrstuvwxyz' });
    const ok = count > 0 && value.note.includes('[REDACTED]');
    console.log(JSON.stringify({ version: VERSION, secret_redaction: ok, status: ok ? 'ok' : 'failed' })); return ok ? 0 : 1;
  }
  if (command === 'validate') {
    try {
      if (!has(rest, '--stdin')) throw new Error('Pass checkpoint JSON with --stdin');
      const report = validatePayload(JSON.parse(fs.readFileSync(0, 'utf8')));
      console.log(JSON.stringify(report, null, 2)); return report.passed ? 0 : 2;
    } catch (error) { console.error(`ucm: ${error.message}`); return 2; }
  }
  try {
    const root = projectRoot(value(rest, '--project', '.'));
    if (command === 'init') {
      const folder = ensureUcmDir(root);
      const ignore = path.join(root, '.gitignore');
      if (fs.existsSync(ignore) && fs.lstatSync(ignore).isSymbolicLink()) throw new Error('Refusing to modify a linked .gitignore file.');
      const current = fs.existsSync(ignore) ? fs.readFileSync(ignore, 'utf8') : '';
      if (!current.split(/\r?\n/).includes('.ucm/')) atomicWrite(ignore, `${current.replace(/\s+$/, '')}\n.ucm/\n`);
      console.log(`Initialized ${folder}`); return 0;
    }
    if (command === 'save') {
      if (!has(rest, '--stdin')) throw new Error('Pass checkpoint JSON with --stdin');
      const input = fs.readFileSync(0, 'utf8'); const result = save(root, value(rest, '--agent', 'unspecified'), JSON.parse(input));
      console.log(JSON.stringify({ saved: result.path, redactions: result.redactions, quality_score: result.quality.score, warnings: result.quality.warnings })); return 0;
    }
    if (command === 'list') {
      const limit = Math.max(1, Math.min(100, Number.parseInt(value(rest, '--limit', '20'), 10) || 20));
      const records = listCheckpoints(root, limit).map((record) => ({ id: record.id, parent_id: record.parent_id ?? null, created_at: record.created_at, agent: record.agent, status: record.data.status, goal: record.data.goal, handoff_to: record.data.handoff_to ?? null, quality_score: record.quality?.score ?? null }));
      console.log(JSON.stringify(records, null, 2)); return 0;
    }
    if (command === 'hook') {
      const out = hook(root, value(rest, '--agent', 'unspecified'), value(rest, '--event', 'unknown'), fs.readFileSync(0, 'utf8'));
      console.log(JSON.stringify(out)); return 0;
    }
    if (command === 'resume' || command === 'claim') {
      const { record } = loadLatest(root); const agent = value(rest, '--agent', 'unspecified');
      if (command === 'claim') { console.log(JSON.stringify({ claimed: true, agent, path: claim(root, agent, record) })); return 0; }
      process.stdout.write(renderMarkdown(record));
      const freshness = inspectStaleness(root, record);
      process.stdout.write(`\n## Freshness\n- **State:** ${freshness.status}\n- **Checkpoint age:** ${freshness.age_hours ?? 'unknown'} hours\n${freshness.reasons.length ? freshness.reasons.map((v) => `- ${v}`).join('\n') : '- No recorded changes detected'}\n\nReceiver: ${record.data.handoff_to || 'not assigned'}; requested agent: ${agent}\n`);
      return 0;
    }
    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(`ucm: ${error.message}`); return 2;
  }
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) process.exitCode = main(process.argv.slice(2));
