"""Analyze Aruba memory samples; outputs aggregates only, never request headers.

Usage: python analyze-log.py "C:/path/run.log"
Optional chart: make matplotlib available on PYTHONPATH.
"""
import argparse
import bisect
import collections
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote

parser = argparse.ArgumentParser()
parser.add_argument("log", type=Path)
args = parser.parse_args()
output = Path(__file__).resolve().parent
raw = args.log.read_bytes()
lines = raw.decode("utf-8-sig").splitlines()
pattern = re.compile(
    r"rss=(\d+)MB heapUsed=(\d+)MB heapTotal=(\d+)MB external=(\d+)MB "
    r"arrayBuffers=(\d+)MB \| req/5m=(\d+) ext([+-]\d+)KB.*fetch/5m: (.*)"
)
fields = ["rss", "heapUsed", "heapTotal", "external", "arrayBuffers", "requests", "externalDeltaKB"]
samples, errors, snapshots = [], [], []
for number, line in enumerate(lines, 1):
    match = pattern.search(line)
    if match:
        row = dict(zip(fields, map(int, match.groups()[:7])))
        row.update(line=number, sample=len(samples) + 1, hours=len(samples) / 12, fetch=match.group(8))
        samples.append(row)
    elif line.startswith("[onRequestError] "):
        record = json.loads(line[len("[onRequestError] "):])
        header = record.get("headers", {})
        try:
            json.loads(unquote(header.get("next-router-state-tree", "")))
            valid_router_json = True
        except ValueError:
            valid_router_json = False
        errors.append({"line": number, "method": record.get("method"),
                       "route": record.get("routePath"), "type": record.get("routeType"),
                       "message": record.get("message"), "validRouterJson": valid_router_json,
                       "actionIdLength": len(header.get("next-action", ""))})
    elif line.startswith("[heap-snapshot] writing"):
        snapshots.append({"line": number, "rss": int(re.search(r"rss=(\d+)MB", line)[1])})

assert len(samples) > 2, "No usable memory samples"


def fit(rows, key):
    x = [r["hours"] for r in rows]
    y = [r[key] for r in rows]
    mx, my = sum(x) / len(x), sum(y) / len(y)
    xx = sum((v - mx) ** 2 for v in x)
    yy = sum((v - my) ** 2 for v in y)
    xy = sum((a - mx) * (b - my) for a, b in zip(x, y))
    return {"MiBPerHour": round(xy / xx, 4), "rSquared": round(xy * xy / (xx * yy), 4)}


summary = {
    "sourceSha256": hashlib.sha256(raw).hexdigest(), "sourceBytes": len(raw),
    "lineCount": len(lines), "sampleCount": len(samples),
    "hoursBetweenFirstAndLastAssuming5Minutes": samples[-1]["hours"],
    "timeCaveat": "No per-sample timestamps. Hours assume uninterrupted 5-minute sampling.",
    "first": samples[0], "last": samples[-1],
    "maxima": {key: max(r[key] for r in samples) for key in fields[:6]},
    "totalProxyRequests": sum(r["requests"] for r in samples),
    "zeroProxyRequestWindows": sum(r["requests"] == 0 for r in samples),
    "fitsAfter12Hours": {key: fit(samples[144:], key) for key in fields[:5]},
    "snapshots": snapshots, "errors": errors,
    "checkpoints": [samples[min(hour * 12, len(samples) - 1)] for hour in [0, 12, 24, 48, 72, 96]],
    "outboundByHost": {},
}
hosts = collections.Counter()
for sample in samples:
    for host, count in re.findall(r"(\S+)=(\d+)", sample["fetch"]):
        hosts[host] += int(count)
summary["outboundByHost"] = dict(hosts)
(output / "summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
(output / "samples.json").write_text(json.dumps(samples, indent=2) + "\n", encoding="utf-8")
print(json.dumps({key: summary[key] for key in ["sampleCount", "fitsAfter12Hours", "outboundByHost"]}, indent=2))

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
except ImportError:
    print("Matplotlib unavailable; numeric reports saved.")
else:
    fig, axes = plt.subplots(2, 1, figsize=(12, 7), sharex=True, height_ratios=[3, 1])
    x = [r["hours"] for r in samples]
    for key, color, label in [("rss", "#185abc", "Process RSS"),
                              ("heapUsed", "#b35d00", "V8 heap used"),
                              ("arrayBuffers", "#188038", "ArrayBuffers (part of external)")]:
        axes[0].plot(x, [r[key] for r in samples], label=label, color=color, linewidth=1.5)
    axes[0].axhline(896, color="#b3261e", linestyle="--", label="Container limit (includes other memory)")
    for snap in snapshots:
        idx = bisect.bisect_left([r["line"] for r in samples], snap["line"])
        axes[0].axvline(x[idx], color="#777", linestyle=":")
        axes[0].annotate("Heap snapshot + traffic spike", (x[idx], 458), xytext=(5, 470),
                         arrowprops={"arrowstyle": "->", "color": "#777"}, fontsize=9)
    axes[0].set(ylabel="MiB", title="OnSmart / Aruba: 1,161 memory samples from run (6).log")
    axes[0].legend(loc="upper left", ncol=2, fontsize=9)
    axes[0].grid(alpha=.2)
    axes[1].plot(x, [r["requests"] for r in samples], color="#777", linewidth=.8)
    axes[1].set(ylabel="Proxy requests / 5 min", xlabel="Approximate hours since first sample (timestamps unavailable)")
    axes[1].grid(alpha=.2)
    fig.tight_layout()
    fig.savefig(output / "memory-trend.png", dpi=160)
    fig.savefig(output / "memory-trend.svg")
    plt.close(fig)
