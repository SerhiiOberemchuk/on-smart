#!/usr/bin/env node
// heap-summary.mjs — a DevTools-free "Summary / Comparison" view for V8
// .heapsnapshot files, meant to run INSIDE the Aruba container so the multi-
// hundred-MB snapshot never has to leave the box.
//
//   node --max-old-space-size=256 scripts/heap-summary.mjs <after.heapsnapshot>
//   node --max-old-space-size=256 scripts/heap-summary.mjs <before.heapsnapshot> <after.heapsnapshot>
//
// With two files the report is the growth (after − before) by constructor —
// the same thing DevTools' Comparison view shows, minus retainer chains.
//
// The file is streamed, never JSON.parse'd whole: the container that produced
// the snapshot rarely has enough free memory to hold it, and blowing the
// cgroup limit here would make the kernel OOM-kill next-server — the analysis
// must not be able to cause the outage it is investigating. Peak usage is
// bounded by the aggregation maps (~tens of MB), hence the 256MB cap above.

import { createReadStream } from "fs";
import { StringDecoder } from "string_decoder";

const TOP_ROWS = 60;
const TOP_STRINGS = 25;
const BIG_STRING_MIN = 64 * 1024; // secrets are short; only payload-sized strings are previewed
const PREVIEW_CHARS = 80;
const MAX_AGG_ENTRIES = 250_000;

const NODES_MARK = '"nodes":[';
const STRINGS_MARK = '"strings":[';

function newState() {
  return {
    phase: "header",
    header: "",
    tail: "",
    fieldCount: 0,
    tI: 0,
    nI: 0,
    sI: 0,
    typeNames: [],
    // string contents / numbers have a unique "name" per node — aggregating
    // those by name would build a map with millions of entries.
    collapseTypes: new Set(),
    stringTypes: new Set(),
    cur: [],
    num: null,
    perType: new Map(), // typeId -> [count, size]
    agg: new Map(), // key -> [count, size]; key = nameIdx*64+typeId, or -typeId-1 collapsed
    needed: new Set(), // string-table indices we must resolve
    bigStrings: [], // {n: nameIdx, s: selfSize}
    strIndex: 0,
    inStr: false,
    esc: false,
    keep: false,
    lit: "",
    resolved: new Map(), // nameIdx -> string
    done: false,
  };
}

function parseMeta(st, headerText) {
  const from = headerText.indexOf('"snapshot":') + '"snapshot":'.length;
  const to = headerText.lastIndexOf(",");
  const meta = JSON.parse(headerText.slice(from, to)).meta;
  st.fieldCount = meta.node_fields.length;
  st.tI = meta.node_fields.indexOf("type");
  st.nI = meta.node_fields.indexOf("name");
  st.sI = meta.node_fields.indexOf("self_size");
  st.typeNames = meta.node_types[0];
  for (const t of ["string", "concatenated string", "sliced string"]) {
    const id = st.typeNames.indexOf(t);
    if (id !== -1) {
      st.stringTypes.add(id);
      st.collapseTypes.add(id);
    }
  }
  const num = st.typeNames.indexOf("number");
  if (num !== -1) st.collapseTypes.add(num);
}

function recordNode(st) {
  const t = st.cur[st.tI];
  const n = st.cur[st.nI];
  const size = st.cur[st.sI];
  st.cur.length = 0;

  let pt = st.perType.get(t);
  if (!pt) st.perType.set(t, (pt = [0, 0]));
  pt[0] += 1;
  pt[1] += size;

  let key = st.collapseTypes.has(t) ? -t - 1 : n * 64 + t;
  if (key >= 0 && !st.agg.has(key) && st.agg.size >= MAX_AGG_ENTRIES) key = -t - 1;
  let a = st.agg.get(key);
  if (!a) st.agg.set(key, (a = [0, 0]));
  a[0] += 1;
  a[1] += size;
  if (key >= 0) st.needed.add(n);

  if (st.stringTypes.has(t) && size >= BIG_STRING_MIN) {
    st.bigStrings.push({ n, s: size });
    st.needed.add(n);
    if (st.bigStrings.length > 4000) {
      st.bigStrings.sort((x, y) => y.s - x.s);
      st.bigStrings.length = 400;
    }
  }
}

function feed(st, s) {
  let i = 0;
  const len = s.length;

  while (i < len && !st.done) {
    if (st.phase === "header") {
      st.header += i === 0 ? s : s.slice(i);
      const at = st.header.indexOf(NODES_MARK);
      if (at === -1) return;
      parseMeta(st, st.header.slice(0, at));
      const rest = st.header.slice(at + NODES_MARK.length);
      st.header = "";
      st.phase = "nodes";
      feed(st, rest);
      return;
    }

    if (st.phase === "nodes") {
      while (i < len) {
        const c = s.charCodeAt(i);
        if (c >= 48 && c <= 57) {
          st.num = (st.num ?? 0) * 10 + (c - 48);
          i += 1;
          continue;
        }
        if (st.num !== null) {
          st.cur.push(st.num);
          st.num = null;
          if (st.cur.length === st.fieldCount) recordNode(st);
        }
        i += 1;
        if (c === 93 /* ] */) {
          st.phase = "mid";
          break;
        }
      }
      continue;
    }

    if (st.phase === "mid") {
      // Everything between nodes and strings (edges included) is numeric, so a
      // plain marker search cannot false-positive inside a string literal.
      st.tail += s.slice(i);
      const at = st.tail.indexOf(STRINGS_MARK);
      if (at === -1) {
        st.tail = st.tail.slice(-STRINGS_MARK.length);
        return;
      }
      const rest = st.tail.slice(at + STRINGS_MARK.length);
      st.tail = "";
      st.phase = "strings";
      feed(st, rest);
      return;
    }

    if (st.phase === "strings") {
      while (i < len) {
        const c = s.charCodeAt(i);
        const ch = s[i];
        i += 1;
        if (st.inStr) {
          if (st.keep) st.lit += ch;
          if (st.esc) st.esc = false;
          else if (c === 92 /* \ */) st.esc = true;
          else if (c === 34 /* " */) {
            st.inStr = false;
            if (st.keep) {
              try {
                st.resolved.set(st.strIndex, JSON.parse('"' + st.lit));
              } catch {
                /* keep index unresolved rather than fail the whole run */
              }
            }
            st.strIndex += 1;
          }
        } else if (c === 34 /* " */) {
          st.inStr = true;
          st.esc = false;
          st.keep = st.needed.has(st.strIndex);
          st.lit = "";
        } else if (c === 93 /* ] */) {
          st.done = true;
          break;
        }
      }
      continue;
    }
  }
}

async function scan(file) {
  const st = newState();
  const decoder = new StringDecoder("utf8");
  const stream = createReadStream(file, { highWaterMark: 4 * 1024 * 1024 });
  for await (const chunk of stream) {
    feed(st, decoder.write(chunk));
    if (st.done) break;
  }
  if (!st.done) feed(st, decoder.end());
  if (st.phase === "header") throw new Error(`${file}: not a .heapsnapshot (no "nodes" section)`);
  return st;
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2).padStart(9) + " MB";
const pad = (v, w) => String(v).padStart(w);

function buildRows(st) {
  // key "type|name" -> [count, size], collapsed buckets merged in
  const rows = new Map();
  for (const [key, [count, size]] of st.agg) {
    let type;
    let name;
    if (key < 0) {
      const t = -key - 1;
      type = st.typeNames[t] ?? `type${t}`;
      name = `(all ${type} values)`;
    } else {
      const t = key % 64;
      const n = (key - t) / 64;
      type = st.typeNames[t] ?? `type${t}`;
      name = st.resolved.get(n) ?? `#${n}`;
    }
    const k = `${type}|${name}`;
    const row = rows.get(k);
    if (row) {
      row[0] += count;
      row[1] += size;
    } else rows.set(k, [count, size]);
  }
  return rows;
}

function printSingle(file, st) {
  console.log(`\n===== ${file} =====`);
  let total = 0;
  const types = [...st.perType.entries()].sort((a, b) => b[1][1] - a[1][1]);
  console.log("\n-- totals by node type --");
  for (const [t, [count, size]] of types) {
    total += size;
    console.log(`${mb(size)}  ${pad(count, 9)}x  ${st.typeNames[t] ?? t}`);
  }
  console.log(`${mb(total)}  total self size`);

  const rows = [...buildRows(st)].sort((a, b) => b[1][1] - a[1][1]).slice(0, TOP_ROWS);
  console.log(`\n-- top ${TOP_ROWS} by self size (type | constructor, count, size) --`);
  for (const [k, [count, size]] of rows) {
    console.log(`${mb(size)}  ${pad(count, 9)}x  ${k}`);
  }

  const big = st.bigStrings.sort((a, b) => b.s - a.s).slice(0, TOP_STRINGS);
  if (big.length) {
    console.log(`\n-- largest strings (>=64KB, first ${PREVIEW_CHARS} chars) --`);
    for (const { n, s } of big) {
      const preview = (st.resolved.get(n) ?? "<unresolved>")
        .slice(0, PREVIEW_CHARS)
        .replace(/[\r\n\t]/g, " ")
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001f]/g, ".");
      console.log(`${mb(s)}  ${preview}`);
    }
  }
}

function printDiff(beforeFile, afterFile, before, after) {
  const a = buildRows(after);
  const b = buildRows(before);
  const keys = new Set([...a.keys(), ...b.keys()]);
  const deltas = [];
  for (const k of keys) {
    const [ac, as] = a.get(k) ?? [0, 0];
    const [bc, bs] = b.get(k) ?? [0, 0];
    if (as - bs !== 0 || ac - bc !== 0) deltas.push([k, ac - bc, as - bs]);
  }
  deltas.sort((x, y) => y[2] - x[2]);

  console.log(`\n===== GROWTH: ${afterFile} minus ${beforeFile} =====`);
  console.log(`-- top ${TOP_ROWS} by size delta (Δsize, Δcount, type | constructor) --`);
  for (const [k, dc, ds] of deltas.slice(0, TOP_ROWS)) {
    if (ds < 16 * 1024 && ds > -16 * 1024) continue;
    console.log(`${mb(ds)}  ${pad((dc >= 0 ? "+" : "") + dc, 10)}x  ${k}`);
  }
  console.log("\n-- top shrinkage --");
  for (const [k, dc, ds] of deltas.slice(-10).reverse()) {
    if (ds >= 0) continue;
    console.log(`${mb(ds)}  ${pad((dc >= 0 ? "+" : "") + dc, 10)}x  ${k}`);
  }
}

const files = process.argv.slice(2);
if (files.length < 1 || files.length > 2) {
  console.error(
    "usage: node --max-old-space-size=256 heap-summary.mjs <after.heapsnapshot>\n" +
      "       node --max-old-space-size=256 heap-summary.mjs <before.heapsnapshot> <after.heapsnapshot>",
  );
  process.exit(1);
}

const states = [];
for (const f of files) {
  states.push(await scan(f));
}

if (files.length === 1) {
  printSingle(files[0], states[0]);
} else {
  printSingle(files[0], states[0]);
  printSingle(files[1], states[1]);
  printDiff(files[0], files[1], states[0], states[1]);
}
