#!/usr/bin/env python3
"""Guide freshness check for the EPGTalk GitHub Actions watchdog.

Each guide is refreshed on a schedule, so after an update it always has listings
far into the future. If the server stops updating, that "hours of listings left"
number keeps shrinking. This fails (and GitHub e-mails the owner) when any guide
drops below its minimum, or is missing/unreadable.
"""

import datetime as dt
import gzip
import re
import sys

# file, label, minimum hours of listings that must remain
GUIDES = [
    ("guide.xml",             "Combined", 10),   # 24h guide, updated every 6h -> alerts within ~18h
    ("Sports_guide.xml.gz",   "Sports",  120),   # 7-day guide, updated every 6h
    ("US_local_guide.xml.gz", "US Local", 18),   # 72h guide, updated once a day
    ("US_guide.xml.gz",       "US",       48),   # 7-day guide, updated every 2-3 days
    ("UK_guide.xml.gz",       "UK",       48),
    ("Latino_guide.xml.gz",   "Latino",   48),
]

RE_STOP = re.compile(rb'<programme [^>]*stop="(\d{14}) ([+-]\d{4})"')


def last_stop(path):
    opener = gzip.open if path.endswith(".gz") else open
    with opener(path, "rb") as f:
        data = f.read()
    best = None
    for ts, off in RE_STOP.findall(data):
        t = dt.datetime.strptime((ts + off).decode(), "%Y%m%d%H%M%S%z")
        if best is None or t > best:
            best = t
    return best


def main():
    now = dt.datetime.now(dt.timezone.utc)
    problems = []
    print("%-10s %-24s %s" % ("Guide", "Listings end (UTC)", "Hours left"))
    for fn, label, min_hours in GUIDES:
        try:
            end = last_stop(fn)
        except (OSError, EOFError, ValueError) as e:
            problems.append("%s: cannot read %s (%s)" % (label, fn, e))
            print("%-10s %-24s %s" % (label, "UNREADABLE", "-"))
            continue
        if end is None:
            problems.append("%s: no programmes in %s" % (label, fn))
            print("%-10s %-24s %s" % (label, "EMPTY", "-"))
            continue
        left = (end - now).total_seconds() / 3600
        flag = "" if left >= min_hours else "  <-- STALE (minimum %dh)" % min_hours
        print("%-10s %-24s %6.1f%s" % (label, end.strftime("%Y-%m-%d %H:%M"), left, flag))
        if left < min_hours:
            problems.append("%s guide has only %.1f hours of listings left (minimum %d) - "
                            "it has probably stopped updating." % (label, left, min_hours))
    if problems:
        print("\n❌ EPGTalk watchdog: problems found\n  - " + "\n  - ".join(problems))
        print("\nCheck the server (mediaserver), its cron jobs and the update logs.")
        sys.exit(1)
    print("\n✅ All guides are fresh.")


if __name__ == "__main__":
    main()
