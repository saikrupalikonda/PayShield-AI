import sys
import os
import subprocess
import json
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.database import format_utc_iso

IST_OFFSET = timezone(timedelta(hours=5, minutes=30))

def test_utc_to_ist_conversion():
    """Requirement 1: UTC -> IST conversion (2026-09-19T04:30:00Z -> 19 Sep 2026, 10:00 AM IST)."""
    # Test Python backend conversion
    dt_utc = datetime.fromisoformat("2026-09-19T04:30:00+00:00")
    dt_ist = dt_utc.astimezone(IST_OFFSET)
    assert dt_ist.hour == 10
    assert dt_ist.minute == 0
    assert dt_ist.day == 19

    # Test Frontend date.ts logic via node
    cmd = [
        "node", "-e",
        "const { formatISTTimestamp } = require('./frontend/src/utils/date.ts'); "
        "console.log(formatISTTimestamp('2026-09-19T04:30:00Z'));"
    ]
    out = subprocess.check_output(cmd, text=True).strip()
    assert "19 Sep 2026" in out
    assert "10:00 AM IST" in out
    print("[PASS] Test 1: UTC -> IST conversion verified (2026-09-19T04:30:00Z -> 10:00 AM IST)")


def test_utc_crossing_midnight():
    """Requirement 2 & 3: UTC timestamp crossing midnight causes date change in IST."""
    # 2026-09-18T20:00:00Z -> 18 Sep 20:00 UTC + 5:30 = 19 Sep 01:30 AM IST
    dt_utc = datetime.fromisoformat("2026-09-18T20:00:00+00:00")
    dt_ist = dt_utc.astimezone(IST_OFFSET)
    assert dt_ist.day == 19
    assert dt_ist.month == 9
    assert dt_ist.hour == 1
    assert dt_ist.minute == 30


    cmd = [
        "node", "-e",
        "const { formatISTTimestamp } = require('./frontend/src/utils/date.ts'); "
        "console.log(formatISTTimestamp('2026-09-18T20:00:00Z'));"
    ]
    out = subprocess.check_output(cmd, text=True).strip()
    assert "19 Sep 2026" in out
    assert "01:30 AM IST" in out
    print("[PASS] Test 2 & 3: UTC midnight crossing & calendar date advance verified")


def test_history_sorting_newest_first():
    """Requirement 4 & 8: History sorting uses underlying timestamp epoch ms (newest -> oldest)."""
    cmd = [
        "node", "-e",
        "const { parseTimestampToMs } = require('./frontend/src/utils/date.ts'); "
        "const records = ["
        "  { id: 'old', timestamp: '2026-09-17T10:00:00Z' },"
        "  { id: 'newest', timestamp: '2026-09-19T04:30:00Z' },"
        "  { id: 'mid', timestamp: '2026-09-18T12:00:00Z' },"
        "  { id: 'invalid', timestamp: 'invalid_date' }"
        "];"
        "const sorted = records.sort((a, b) => parseTimestampToMs(b.timestamp) - parseTimestampToMs(a.timestamp));"
        "console.log(JSON.stringify(sorted.map(r => r.id)));"
    ]
    out = subprocess.check_output(cmd, text=True).strip()
    sorted_ids = json.loads(out)
    assert sorted_ids[0] == "newest"
    assert sorted_ids[1] == "mid"
    assert sorted_ids[2] == "old"
    assert sorted_ids[3] == "invalid"
    print("[PASS] Test 4 & 8: Numerical epoch ms chronological sorting verified")


def test_relative_time_formatting():
    """Requirement 5: Relative IST time formatting (Today, Yesterday, Date)."""
    cmd = [
        "node", "-e",
        "const { formatRelativeISTTimestamp } = require('./frontend/src/utils/date.ts'); "
        "const now = new Date('2026-09-19T10:00:00Z'); " # 3:30 PM IST
        "const todayTs = '2026-09-19T05:12:00Z'; "       # 10:42 AM IST
        "const yesterdayTs = '2026-09-18T14:45:00Z'; "   # 8:15 PM IST
        "const olderTs = '2026-09-17T13:00:00Z'; "       # 6:30 PM IST
        "console.log(JSON.stringify({"
        "  today: formatRelativeISTTimestamp(todayTs, now),"
        "  yesterday: formatRelativeISTTimestamp(yesterdayTs, now),"
        "  older: formatRelativeISTTimestamp(olderTs, now)"
        "}));"
    ]
    out = subprocess.check_output(cmd, text=True).strip()
    data = json.loads(out)
    assert "Today" in data["today"]
    assert "10:42 AM IST" in data["today"]
    assert "Yesterday" in data["yesterday"]
    assert "08:15 PM IST" in data["yesterday"]
    assert "17 Sep 2026" in data["older"]
    assert "06:30 PM IST" in data["older"]
    print("[PASS] Test 5: Relative IST formatting verified (Today, Yesterday, Date)")


def test_invalid_and_missing_timestamps():
    """Requirement 6 & 7: Invalid and missing timestamps display 'Time unavailable' without crashing."""
    cmd = [
        "node", "-e",
        "const { formatISTTimestamp, formatRelativeISTTimestamp } = require('./frontend/src/utils/date.ts'); "
        "console.log(JSON.stringify(["
        "  formatISTTimestamp(null),"
        "  formatISTTimestamp(undefined),"
        "  formatISTTimestamp(''),"
        "  formatISTTimestamp('invalid-date'),"
        "  formatRelativeISTTimestamp(null)"
        "]));"
    ]
    out = subprocess.check_output(cmd, text=True).strip()
    results = json.loads(out)
    for r in results:
        assert r == "Time unavailable"
    print("[PASS] Test 6 & 7: Null, undefined, and invalid timestamps return 'Time unavailable'")


def test_backend_timestamp_normalization():
    """Requirement 9 & 10: Backend stores and normalizes to UTC ISO string ending in Z."""
    # Datetime object
    now_utc = datetime(2026, 9, 19, 4, 30, 0, tzinfo=timezone.utc)
    s1 = format_utc_iso(now_utc)
    assert s1 == "2026-09-19T04:30:00Z"

    # Naive string without Z
    s2 = format_utc_iso("2026-09-19T04:30:00")
    assert s2 == "2026-09-19T04:30:00Z"

    # String already with Z
    s3 = format_utc_iso("2026-09-19T04:30:00Z")
    assert s3 == "2026-09-19T04:30:00Z"
    print("[PASS] Test 9 & 10: Backend UTC ISO-8601 storage and normalization verified")


if __name__ == "__main__":
    print("=== Running IST Timezone & Date Test Suite ===")
    test_utc_to_ist_conversion()
    test_utc_crossing_midnight()
    test_history_sorting_newest_first()
    test_relative_time_formatting()
    test_invalid_and_missing_timestamps()
    test_backend_timestamp_normalization()
    print("=== All Timezone Tests PASSED ===")
