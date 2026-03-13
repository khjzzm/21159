const fs = require('fs');
const path = require('path');

const YEARS = [2024, 2025, 2026];
const DIVISIONS = [1, 2]; // 1=Male, 2=Female
const EVENTS = [1, 2, 3];
const PER_PAGE = 50;
const DATA_DIR = path.join(__dirname, 'data');

const BASE_URL = 'https://c3po.crossfit.com/api/leaderboards/v2/competitions/open';

function buildUrl(year, division, event, page) {
  return `${BASE_URL}/${year}/leaderboards?division=${division}&scaled=0&sort=${event}&occupation=0&country=KR&page=${page}`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

function parseScore(scoreDisplay) {
  if (!scoreDisplay || scoreDisplay === '--' || scoreDisplay.trim() === '') {
    return null;
  }
  // Strip "- f" suffix (foundations division marker - score is still valid)
  const cleaned = scoreDisplay.replace(/\s*-\s*f\s*$/, '').trim();
  if (!cleaned) return null;
  // Time format: "M:SS" or "MM:SS" or "H:MM:SS"
  const timeMatch = cleaned.match(/^(\d+):(\d{2})$/);
  if (timeMatch) {
    const minutes = parseInt(timeMatch[1], 10);
    const seconds = parseInt(timeMatch[2], 10);
    return { type: 'time', value: minutes * 60 + seconds };
  }
  // Reps format: "339 reps"
  const repsMatch = cleaned.match(/^(\d+)\s*reps?$/i);
  if (repsMatch) {
    return { type: 'reps', value: parseInt(repsMatch[1], 10) };
  }
  // Could also be just a number (reps without "reps" label)
  const numMatch = cleaned.match(/^(\d+)$/);
  if (numMatch) {
    return { type: 'reps', value: parseInt(numMatch[1], 10) };
  }
  // Unrecognized
  console.warn(`  [WARN] Unrecognized score format: "${scoreDisplay}"`);
  return null;
}

function isScaled(entryScore) {
  // entryScore.scaled could be '1', 1, or true
  if (entryScore.scaled === '1' || entryScore.scaled === 1 || entryScore.scaled === true) {
    return true;
  }
  // scoreDisplay contains "- s" (scaled indicator)
  if (entryScore.scoreDisplay && entryScore.scoreDisplay.includes('- s')) {
    return true;
  }
  return false;
}

function trimScaled(pairs) {
  if (pairs.length === 0) return pairs;

  // Detect boundary where data transitions from Rx to scaled
  // Logic: iterate sorted pairs, track lastRepsVal
  // If current is reps and lastRepsVal exists and current > lastRepsVal + 10, cut
  // If time appears after a reps section, cut
  let lastType = null;
  let lastRepsVal = null;
  let seenReps = false;
  let cutIndex = pairs.length;

  for (let i = 0; i < pairs.length; i++) {
    const { score } = pairs[i];

    if (score.type === 'reps') {
      if (seenReps && lastRepsVal !== null && score.value > lastRepsVal + 10) {
        // Sudden jump in reps - likely scaled entries start here
        cutIndex = i;
        break;
      }
      lastRepsVal = score.value;
      seenReps = true;
      lastType = 'reps';
    } else if (score.type === 'time') {
      if (seenReps && lastType === 'reps') {
        // Time appearing after reps section - likely scaled entries
        cutIndex = i;
        break;
      }
      lastType = 'time';
    }
  }

  return pairs.slice(0, cutIndex);
}

async function fetchAllPages(year, division, event) {
  const label = `${year}_${division}_${event}`;
  console.log(`[${label}] Fetching page 1...`);

  let firstPageData;
  try {
    firstPageData = await fetchJson(buildUrl(year, division, event, 1));
  } catch (err) {
    console.error(`[${label}] Failed to fetch page 1: ${err.message}`);
    return null;
  }

  const pagination = firstPageData.pagination;
  const totalPages = pagination.totalPages;
  const totalCompetitors = pagination.totalCompetitors;

  console.log(`[${label}] totalPages=${totalPages}, totalCompetitors=${totalCompetitors}`);

  // Collect all rows from all pages
  const allRows = [];

  // Process page 1
  if (firstPageData.leaderboardRows) {
    allRows.push(...firstPageData.leaderboardRows);
  }

  // Fetch remaining pages
  for (let page = 2; page <= totalPages; page++) {
    if (page % 10 === 0 || page === totalPages) {
      console.log(`[${label}] Fetching page ${page}/${totalPages}...`);
    }
    try {
      const data = await fetchJson(buildUrl(year, division, event, page));
      if (data.leaderboardRows) {
        allRows.push(...data.leaderboardRows);
      }
    } catch (err) {
      console.error(`[${label}] Failed to fetch page ${page}: ${err.message}`);
    }
    // Small delay to be polite to the API
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`[${label}] Fetched ${allRows.length} rows total`);

  // Extract rank-score pairs
  const pairs = [];
  for (const row of allRows) {
    const rank = row.overallRank || row.entrant?.overallRank;
    if (!rank) continue;

    // Find the score with matching ordinal for this event
    const scores = row.scores;
    if (!scores || scores.length === 0) continue;

    const eventScore = scores.find(s => s.ordinal === event || s.ordinal === String(event));
    if (!eventScore) continue;

    // Skip scaled entries
    if (isScaled(eventScore)) continue;

    // Skip empty/invalid scores
    const scoreDisplay = eventScore.scoreDisplay;
    if (!scoreDisplay || scoreDisplay === '--' || scoreDisplay.trim() === '') continue;
    if (scoreDisplay.includes('- s')) continue;

    const parsed = parseScore(scoreDisplay);
    if (!parsed) continue;

    const scoreRank = eventScore.rank || rank;
    pairs.push({ rank: parseInt(scoreRank, 10), score: parsed });
  }

  // Sort by rank ascending
  pairs.sort((a, b) => a.rank - b.rank);

  // Trim scaled entries that snuck through
  const trimmed = trimScaled(pairs);

  console.log(`[${label}] ${pairs.length} valid pairs, ${trimmed.length} after trimming`);

  return {
    total: totalCompetitors,
    pairs: trimmed
  };
}

async function main() {
  console.log('Starting CrossFit Open leaderboard data fetch...');
  console.log(`Data directory: ${DATA_DIR}`);

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Build list of all combinations
  const combos = [];
  for (const year of YEARS) {
    for (const div of DIVISIONS) {
      for (const event of EVENTS) {
        combos.push({ year, div, event });
      }
    }
  }

  console.log(`Processing ${combos.length} combinations...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const { year, div, event } of combos) {
    const result = await fetchAllPages(year, div, event);
    const filename = `${year}_${div}_${event}.json`;
    const filepath = path.join(DATA_DIR, filename);

    if (result && result.pairs.length > 0) {
      fs.writeFileSync(filepath, JSON.stringify(result, null, 2), 'utf-8');
      console.log(`  -> Saved ${filepath} (${result.pairs.length} pairs)\n`);
      successCount++;
    } else if (result && result.pairs.length === 0) {
      // Save empty result so we know it was fetched
      fs.writeFileSync(filepath, JSON.stringify({ total: result.total, pairs: [] }, null, 2), 'utf-8');
      console.log(`  -> Saved ${filepath} (0 pairs - no data)\n`);
      successCount++;
    } else {
      console.log(`  -> FAILED ${filename}\n`);
      failCount++;
    }
  }

  console.log('='.repeat(50));
  console.log(`Done! Success: ${successCount}, Failed: ${failCount}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
