import React, { useEffect, useMemo, useState } from "react";

// --- Tournament data ---

const GROUPS = {
  A: ["Mexico", "South Korea", "South Africa", "Czechia"],
  B: ["Canada", "Switzerland", "Qatar", "Bosnia and Herzegovina"],
  C: ["Brazil", "Morocco", "Scotland", "Haiti"],
  D: ["United States", "Paraguay", "Australia", "Türkiye"],
  E: ["Germany", "Ecuador", "Ivory Coast", "Curaçao"],
  F: ["Netherlands", "Japan", "Tunisia", "Sweden"],
  G: ["Belgium", "Iran", "Egypt", "New Zealand"],
  H: ["Spain", "Uruguay", "Saudi Arabia", "Cape Verde"],
  I: ["France", "Senegal", "Norway", "Iraq"],
  J: ["Argentina", "Austria", "Algeria", "Jordan"],
  K: ["Portugal", "Colombia", "Uzbekistan", "DR Congo"],
  L: ["England", "Croatia", "Panama", "Ghana"]
};

const TEAM_FLAGS = {
  "Mexico": "🇲🇽",
  "South Korea": "🇰🇷",
  "South Africa": "🇿🇦",
  "Czechia": "🇨🇿",
  "Canada": "🇨🇦",
  "Switzerland": "🇨🇭",
  "Qatar": "🇶🇦",
  "Bosnia and Herzegovina": "🇧🇦",
  "Bosnia-Herzegovina": "🇧🇦",
  "Brazil": "🇧🇷",
  "Morocco": "🇲🇦",
  "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Haiti": "🇭🇹",
  "United States": "🇺🇸",
  "Paraguay": "🇵🇾",
  "Australia": "🇦🇺",
  "Türkiye": "🇹🇷",
  "Germany": "🇩🇪",
  "Ecuador": "🇪🇨",
  "Ivory Coast": "🇨🇮",
  "Curaçao": "🇨🇼",
  "Netherlands": "🇳🇱",
  "Japan": "🇯🇵",
  "Tunisia": "🇹🇳",
  "Sweden": "🇸🇪",
  "Belgium": "🇧🇪",
  "Iran": "🇮🇷",
  "Egypt": "🇪🇬",
  "New Zealand": "🇳🇿",
  "Spain": "🇪🇸",
  "Uruguay": "🇺🇾",
  "Saudi Arabia": "🇸🇦",
  "Cape Verde": "🇨🇻",
  "France": "🇫🇷",
  "Senegal": "🇸🇳",
  "Norway": "🇳🇴",
  "Iraq": "🇮🇶",
  "Argentina": "🇦🇷",
  "Austria": "🇦🇹",
  "Algeria": "🇩🇿",
  "Jordan": "🇯🇴",
  "Portugal": "🇵🇹",
  "Colombia": "🇨🇴",
  "Uzbekistan": "🇺🇿",
  "DR Congo": "🇨🇩",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Croatia": "🇭🇷",
  "Panama": "🇵🇦",
  "Ghana": "🇬🇭"
};

const ROUND_OF_32_TEMPLATE = [
  { id: "M73", a: "2A", b: "2B" },
  { id: "M74", a: "1E", b: "3_ABCDF" },
  { id: "M75", a: "1F", b: "2C" },
  { id: "M76", a: "1C", b: "2F" },
  { id: "M77", a: "1I", b: "3_CDFGH" },
  { id: "M78", a: "2E", b: "2I" },
  { id: "M79", a: "1A", b: "3_CEFHI" },
  { id: "M80", a: "1L", b: "3_EHIJK" },
  { id: "M81", a: "1D", b: "3_BEFIJ" },
  { id: "M82", a: "1G", b: "3_AEHIJ" },
  { id: "M83", a: "2K", b: "2L" },
  { id: "M84", a: "1H", b: "2J" },
  { id: "M85", a: "1B", b: "3_EFGIJ" },
  { id: "M86", a: "1J", b: "2H" },
  { id: "M87", a: "1K", b: "3_DEIJL" },
  { id: "M88", a: "2D", b: "2G" }
];
const ROUND_OF_16_TEMPLATE = [
  ["M74", "M77"],
  ["M73", "M75"],
  ["M83", "M84"],
  ["M81", "M82"],
  ["M76", "M78"],
  ["M79", "M80"],
  ["M86", "M88"],
  ["M85", "M87"]
];
const ACTUAL_BRACKET_SIDE_ROUNDS = [
  {
    key: "R32_LEFT",
    title: "Round of 32",
    matchIds: ["M74", "M77", "M73", "M75", "M83", "M84", "M81", "M82"]
  },
  {
    key: "R16_LEFT",
    title: "Round of 16",
    matchIds: ["M89", "M90", "M93", "M94"]
  },
  {
    key: "QF_LEFT",
    title: "Quarter-final",
    matchIds: ["M97", "M98"]
  },
  {
    key: "CENTER",
    title: "Final",
    matchIds: ["M101", "M104", "M102"]
  },
  {
    key: "QF_RIGHT",
    title: "Quarter-final",
    matchIds: ["M99", "M100"]
  },
  {
    key: "R16_RIGHT",
    title: "Round of 16",
    matchIds: ["M91", "M92", "M95", "M96"]
  },
  {
    key: "R32_RIGHT",
    title: "Round of 32",
    matchIds: ["M76", "M78", "M79", "M80", "M86", "M88", "M85", "M87"]
  }
];

const PREDICTION_ROUND_TO_FIFA_MATCH_ID = {
  "R16-1": "M89",
  "R16-2": "M90",
  "R16-3": "M93",
  "R16-4": "M94",
  "R16-5": "M91",
  "R16-6": "M92",
  "R16-7": "M95",
  "R16-8": "M96",
  "QF-1": "M97",
  "QF-2": "M98",
  "QF-3": "M99",
  "QF-4": "M100",
  "SF-1": "M101",
  "SF-2": "M102",
  FINAL: "M104"
};

const ROUND_POINTS = {
  R32: 1,
  R16: 2,
  QF: 4,
  SF: 8,
  FINAL: 16,
  CHAMPION: 32
};

const SCORE_ROUNDS = ["R32", "R16", "QF", "SF", "FINAL", "CHAMPION"];

// --- Networking & parsing ---

function fetchJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonpCallback_${Date.now()}_${Math.round(Math.random() * 100000)}`;
    const separator = url.includes("?") ? "&" : "?";
    const script = document.createElement("script");

    window[callbackName] = data => {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };

    script.onerror = () => {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error("Could not load data from Google Sheets."));
    };

    script.src = `${url}${separator}callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

function safeJsonParse(value, fallback) {
  if (!value) return fallback;

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatTimestampForUser(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const userTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: userTimeZone,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short"
  }).formatToParts(date);

  const get = type => parts.find(part => part.type === type)?.value;

  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}:${get("second")} ${get("timeZoneName")}`;
}

function getSubmissionsFromResponse(data) {
  return data.submissions || data.records || [];
}

function getSubmissionDetails(submission) {
  const fullSubmission = safeJsonParse(submission.full_submission_json, null);

  const groups =
    fullSubmission?.groups ||
    safeJsonParse(submission.group_predictions_json, {});

  const thirdPlaceQualifyingGroups =
    fullSubmission?.thirdPlaceQualifyingGroups ||
    safeJsonParse(submission.third_place_json, []);

  const picks =
    fullSubmission?.picks ||
    safeJsonParse(submission.bracket_picks_json, {});

  const champion =
    fullSubmission?.champion ||
    submission.champion ||
    picks.FINAL ||
    "";

  const roundOf32 =
    fullSubmission?.roundOf32 ||
    [];

  return {
    groups,
    thirdPlaceQualifyingGroups,
    picks,
    champion,
    roundOf32
  };
}

function getSubmissionBasics(submission) {
  const fullSubmission = safeJsonParse(submission.full_submission_json, null);

  const groups =
    fullSubmission?.groups ||
    safeJsonParse(submission.group_predictions_json, {});

  const thirdPlaceQualifyingGroups =
    fullSubmission?.thirdPlaceQualifyingGroups ||
    safeJsonParse(submission.third_place_json, []);

  const name =
    fullSubmission?.name ||
    submission.name ||
    "";

  return {
    name,
    groups,
    thirdPlaceQualifyingGroups
  };
}

// --- Annex C & bracket logic ---

function comboKeyFromGroups(groups) {
  return [...new Set((groups || []).map(group => String(group).trim()))]
    .filter(Boolean)
    .sort()
    .join("");
}

function normalizeAnnexThirdGroups(value) {
  return String(value || "")
    .replace(/[^A-L]/g, "")
    .split("")
    .sort()
    .join("");
}

function buildAnnexCLookup(annexRows) {
  const lookup = {};

  (annexRows || []).forEach(row => {
    const key = normalizeAnnexThirdGroups(row.ThirdGroups);

    if (key) {
      lookup[key] = row;
    }
  });

  return lookup;
}

function defaultRankings() {
  return Object.fromEntries(
    Object.entries(GROUPS).map(([group, teams]) => [group, [...teams]])
  );
}

function getQualifiers(rankings) {
  const qualifiers = {};

  for (const [group, ranking] of Object.entries(rankings)) {
    qualifiers[`1${group}`] = ranking[0];
    qualifiers[`2${group}`] = ranking[1];
    qualifiers[`3${group}`] = ranking[2];
  }

  return qualifiers;
}

function assignThirdPlaceSlots(rankings, selectedThirdGroups, annexC) {
  const selected = [...selectedThirdGroups];

  if (selected.length !== 8) {
    throw new Error("Please choose exactly 8 third-place teams.");
  }

  const annexLookup = buildAnnexCLookup(annexC);
  const comboKey = comboKeyFromGroups(selected);
  const annexRow = annexLookup[comboKey];

  if (!annexRow) {
    throw new Error(
      `Could not find FIFA Annex C scenario for third-place groups: ${comboKey}.`
    );
  }

  const winnerColumnToSlotKey = {
    "1E": "3_ABCDF",
    "1I": "3_CDFGH",
    "1A": "3_CEFHI",
    "1L": "3_EHIJK",
    "1D": "3_BEFIJ",
    "1G": "3_AEHIJ",
    "1B": "3_EFGIJ",
    "1K": "3_DEIJL"
  };

  const result = {};

  Object.entries(winnerColumnToSlotKey).forEach(([winnerColumn, slotKey]) => {
    const thirdGroupCode = String(annexRow[winnerColumn] || "")
      .trim()
      .replace(/^3/, "");

    const thirdPlaceTeam = rankings[thirdGroupCode]?.[2];

    if (!thirdGroupCode || !thirdPlaceTeam) {
      throw new Error(
        `FIFA Annex C scenario is missing a valid team for ${winnerColumn}.`
      );
    }

    result[slotKey] = thirdPlaceTeam;
  });

  return result;
}

function buildRoundOf32(rankings, selectedThirdGroups, annexC) {
  const directQualifiers = getQualifiers(rankings);
  const thirdSlotAssignments = assignThirdPlaceSlots(
    rankings,
    selectedThirdGroups,
    annexC
  );

  const slotToTeam = { ...directQualifiers, ...thirdSlotAssignments };

  return ROUND_OF_32_TEMPLATE.map(match => ({
    id: match.id,
    a: slotToTeam[match.a],
    b: slotToTeam[match.b],
    slotA: match.a,
    slotB: match.b
  }));
}

function rankingIsValid(ranking) {
  return new Set(ranking).size === ranking.length;
}

function normalizeActualBracketRows(rows = []) {
  const byMatchId = {};

  rows.forEach(row => {
    const matchId = String(row.match_id || "").trim();

    if (!matchId) return;

    byMatchId[matchId] = {
      round: String(row.round || "").trim(),
      matchId,
      teamA: String(row.team_a || "").trim(),
      teamB: String(row.team_b || "").trim(),
      winner: String(row.winner || "").trim()
    };
  });

  return byMatchId;
}

function buildPredictedBracketRows(details) {
  const picks = details.picks || {};
  const rows = [];

  (details.roundOf32 || []).forEach(match => {
    rows.push({
      match_id: match.id,
      team_a: match.a || "",
      team_b: match.b || "",
      winner: picks[match.id] || ""
    });
  });

  ROUND_OF_16_TEMPLATE.forEach(([left, right], index) => {
    const pickId = `R16-${index + 1}`;
    rows.push({
      match_id: PREDICTION_ROUND_TO_FIFA_MATCH_ID[pickId],
      team_a: picks[left] || "",
      team_b: picks[right] || "",
      winner: picks[pickId] || ""
    });
  });

  [
    { pickId: "QF-1", a: "R16-1", b: "R16-2" },
    { pickId: "QF-2", a: "R16-3", b: "R16-4" },
    { pickId: "QF-3", a: "R16-5", b: "R16-6" },
    { pickId: "QF-4", a: "R16-7", b: "R16-8" }
  ].forEach(({ pickId, a, b }) => {
    rows.push({
      match_id: PREDICTION_ROUND_TO_FIFA_MATCH_ID[pickId],
      team_a: picks[a] || "",
      team_b: picks[b] || "",
      winner: picks[pickId] || ""
    });
  });

  [
    { pickId: "SF-1", a: "QF-1", b: "QF-2" },
    { pickId: "SF-2", a: "QF-3", b: "QF-4" }
  ].forEach(({ pickId, a, b }) => {
    rows.push({
      match_id: PREDICTION_ROUND_TO_FIFA_MATCH_ID[pickId],
      team_a: picks[a] || "",
      team_b: picks[b] || "",
      winner: picks[pickId] || ""
    });
  });

  rows.push({
    match_id: PREDICTION_ROUND_TO_FIFA_MATCH_ID.FINAL,
    team_a: picks["SF-1"] || "",
    team_b: picks["SF-2"] || "",
    winner: picks.FINAL || ""
  });

  return rows;
}

// --- Scoring ---

function normalizeTeamName(team) {
  return String(team || "").trim();
}

function uniqueTeams(teams) {
  return [...new Set((teams || []).map(normalizeTeamName).filter(Boolean))];
}

function getPredictedTeamsByRound(details) {
  const groups = details.groups || {};
  const thirdGroups = details.thirdPlaceQualifyingGroups || [];
  const picks = details.picks || {};

  const r32 = [];

  Object.entries(groups).forEach(([, ranking]) => {
    if (ranking?.[0]) r32.push(ranking[0]);
    if (ranking?.[1]) r32.push(ranking[1]);
  });

  thirdGroups.forEach(group => {
    const thirdPlaceTeam = groups[group]?.[2];
    if (thirdPlaceTeam) r32.push(thirdPlaceTeam);
  });

  return {
    R32: uniqueTeams(r32),

    R16: uniqueTeams(
      Object.keys(picks)
        .filter(key => /^M\d+$/.test(key))
        .map(key => picks[key])
    ),

    QF: uniqueTeams(
      Object.keys(picks)
        .filter(key => key.startsWith("R16-"))
        .map(key => picks[key])
    ),

    SF: uniqueTeams(
      Object.keys(picks)
        .filter(key => key.startsWith("QF-"))
        .map(key => picks[key])
    ),

    FINAL: uniqueTeams(
      Object.keys(picks)
        .filter(key => key.startsWith("SF-"))
        .map(key => picks[key])
    ),

    CHAMPION: picks.FINAL ? [normalizeTeamName(picks.FINAL)] : []
  };
}

function scoreRound(predictedTeams, actualTeams, pointsPerTeam) {
  const actualSet = new Set(uniqueTeams(actualTeams));

  const correctTeams = uniqueTeams(predictedTeams).filter(team =>
    actualSet.has(team)
  );

  return {
    correctTeams,
    count: correctTeams.length,
    points: correctTeams.length * pointsPerTeam
  };
}

function scoreSubmission(submission, actualResults) {
  const details = getSubmissionDetails(submission);
  const predictedByRound = getPredictedTeamsByRound(details);

  const roundScores = {};

  SCORE_ROUNDS.forEach(round => {
    roundScores[round] = scoreRound(
      predictedByRound[round],
      actualResults[round] || [],
      ROUND_POINTS[round]
    );
  });

  const total = SCORE_ROUNDS.reduce(
    (sum, round) => sum + roundScores[round].points,
    0
  );

  return {
    submission,
    details,
    predictedByRound,
    roundScores,
    total
  };
}

// --- UI components ---

function TeamName({ team }) {
  if (!team) return <>TBD</>;

  return (
    <span className="team-with-flag">
      <span className="flag" aria-hidden="true">
        {TEAM_FLAGS[team] || "❓"}
      </span>
      <span>{team}</span>
    </span>
  );
}

function LoadingDots({ label = "Loading" }) {
  return (
    <p className="loading-dots" aria-live="polite">
      <span>{label}</span>
      <span className="dot dot-1">.</span>
      <span className="dot dot-2">.</span>
      <span className="dot dot-3">.</span>
    </p>
  );
}

function Match({ id, a, b, winner, onPick }) {
  const disabled = !a || !b;

  return (
    <div className="match">
      <div className="match-id">{id}</div>
      <button
        type="button"
        disabled={disabled}
        className={winner === a ? "team selected" : "team"}
        onClick={() => onPick(id, a)}
      >
        <TeamName team={a} />
      </button>
      <button
        type="button"
        disabled={disabled}
        className={winner === b ? "team selected" : "team"}
        onClick={() => onPick(id, b)}
      >
        <TeamName team={b} />
      </button>
    </div>
  );
}

function ActualBracketTeam({ team, winner }) {
  const isWinner = team && winner && normalizeTeamName(team) === normalizeTeamName(winner);

  return (
    <div className={isWinner ? "actual-bracket-team actual-bracket-winner" : "actual-bracket-team"}>
      {team ? <TeamName team={team} /> : <span className="muted">TBD</span>}
    </div>
  );
}

function ActualBracketMatch({ match }) {
  const fallbackMatch = {
    matchId: "",
    teamA: "",
    teamB: "",
    winner: ""
  };

  const data = match || fallbackMatch;

  return (
    <div className="actual-bracket-match">
      <div className="actual-bracket-match-id">{data.matchId}</div>
      <ActualBracketTeam team={data.teamA} winner={data.winner} />
      <ActualBracketTeam team={data.teamB} winner={data.winner} />
    </div>
  );
}

function GroupRanker({ group, ranking, onChange }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  
  function moveTeam(fromIndex, toIndex) {
    if (fromIndex === null || fromIndex === toIndex) return;
  
    const next = [...ranking];
    const [movedTeam] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, movedTeam);
  
    onChange(group, next);
    setDraggedIndex(null);
  }
  
  function moveUp(index) {
    if (index === 0) return;
    moveTeam(index, index - 1);
  }
  
  function moveDown(index) {
    if (index === ranking.length - 1) return;
    moveTeam(index, index + 1);
  }
  
  return (
    <section className="card">
      <h3>Group {group}</h3>
  
      <div className="drag-list">
        {ranking.map((team, index) => (
          <div
            key={team}
            className={draggedIndex === index ? "drag-row dragging" : "drag-row"}
            draggable
            onDragStart={() => setDraggedIndex(index)}
            onDragOver={event => event.preventDefault()}
            onDrop={() => moveTeam(draggedIndex, index)}
            onDragEnd={() => setDraggedIndex(null)}
          >
            <div className="rank-number">{index + 1}</div>
  
            <div className="drag-handle" title="Drag to reorder">
              ☰
            </div>
  
            <div className="team-name">
              <TeamName team={team} />
            </div>
  
            <div className="rank-buttons">
              <button
                type="button"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                aria-label={`Move ${team} up`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveDown(index)}
                disabled={index === ranking.length - 1}
                aria-label={`Move ${team} down`}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
  
      <p className="hint">
        Drag teams to reorder them, or use the arrows.
      </p>
    </section>
  );
  }

function GuessDetail({ submission, onBack, backLabel = "← Back to all guesses" }) {
  const details = getSubmissionDetails(submission);

  return (
    <section className="panel">
      <button className="secondary back-button" type="button" onClick={onBack}>
        {backLabel}
      </button>

      <div className="detail-hero">
        <div>
          <p className="eyebrow dark-eyebrow">Prediction detail</p>
          <h2>{submission.name || "Unknown"}</h2>
          <p className="muted">
            Submitted: {formatTimestampForUser(submission.timestamp)}
          </p>
        </div>

        <div className="champion-card">
          <span>Champion pick</span>
          <strong>
            <TeamName team={details.champion || "Not selected"} />
          </strong>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-card">
          <h3>Group predictions</h3>

          <div className="detail-groups-grid">
            {Object.entries(details.groups).map(([group, ranking]) => (
              <div className="mini-group-card" key={group}>
                <h4>Group {group}</h4>

                <ol>
                  {(ranking || []).map(team => (
                    <li key={team}>
                      <TeamName team={team} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-card">
          <h3>Third-place qualifiers</h3>

          {details.thirdPlaceQualifyingGroups.length > 0 ? (
            <div className="pill-row">
              {details.thirdPlaceQualifyingGroups.map(group => (
                <span className="pill" key={group}>
                  Group {group}: <TeamName team={details.groups[group]?.[2] || "Unknown"} />
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">No third-place qualifiers recorded.</p>
          )}
        </section>

        <section className="detail-card">
          <FifaBracketDisplay
            bracketRows={buildPredictedBracketRows(details)}
            title="Knockout bracket"
            description="Highlighted teams are the winners picked by this user."
          />
        </section>
      </div>
    </section>
  );
}

function FifaBracketDisplay({ bracketRows, title, description }) {
  const byMatchId = normalizeActualBracketRows(bracketRows);

  return (
    <section className="actual-bracket-section">
      {(title || description) && (
        <div className="section-heading compact-heading">
          <div>
            {title && <h3>{title}</h3>}
            {description && <p>{description}</p>}
          </div>
        </div>
      )}

      <div className="actual-bracket-scroll">
        <div className="actual-bracket-fifa compact-center-bracket">
          {ACTUAL_BRACKET_SIDE_ROUNDS.map(round => {
            if (round.key === "CENTER") {
              return (
                <div className="actual-bracket-center-column" key={round.key}>
                  <h4>Final</h4>

                  <div className="center-stack">
                    <div className="center-semi-block">
                      <h5>Semi-final</h5>
                      <ActualBracketMatch
                        match={byMatchId.M101 || { matchId: "M101" }}
                      />
                    </div>

                    <div className="center-final-block">
                      <h5>Final</h5>
                      <ActualBracketMatch
                        match={byMatchId.M104 || { matchId: "M104" }}
                      />
                    </div>

                    <div className="center-semi-block">
                      <h5>Semi-final</h5>
                      <ActualBracketMatch
                        match={byMatchId.M102 || { matchId: "M102" }}
                      />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div className={`actual-bracket-column ${round.key}`} key={round.key}>
                <h4>{round.title}</h4>

                <div className="actual-bracket-column-body">
                  {round.matchIds.map(matchId => (
                    <ActualBracketMatch
                      key={matchId}
                      match={byMatchId[matchId] || { matchId }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ActualBracketDisplay({ actualBracketRows }) {
  return (
    <FifaBracketDisplay
      bracketRows={actualBracketRows}
      title="Current tournament bracket"
      description="Will be updated as teams advance and matches are played."
    />
  );
}

function Leaderboard({ submitUrl }) {
  const [loading, setLoading] = useState(false);
  const [actualBracketRows, setActualBracketRows] = useState([]);
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [actualResults, setActualResults] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [error, setError] = useState("");

  async function loadLeaderboard() {
    try {
      setLoading(true);
      setError("");

      if (!submitUrl) {
        throw new Error("No Google Sheets URL is configured.");
      }

      const [submissionsData, actualResultsData, actualBracketData] = await Promise.all([
        fetchJsonp(`${submitUrl}?type=submissions`),
        fetchJsonp(`${submitUrl}?type=actualResults`),
        fetchJsonp(`${submitUrl}?type=actualBracket`)
      ]);

      if (!submissionsData.ok) {
        throw new Error(submissionsData.error || "Could not read submissions.");
      }

      if (!actualResultsData.ok) {
        throw new Error(actualResultsData.error || "Could not read actual results.");
      }

      if (!actualBracketData.ok) {
        throw new Error(actualBracketData.error || "Could not read actual bracket.");
      }

      const submissions = getSubmissionsFromResponse(submissionsData);
      const results = actualResultsData.actualResults || {};

      const scoredRows = submissions
        .map(submission => scoreSubmission(submission, results))
        .sort((a, b) => {
          if (b.total !== a.total) return b.total - a.total;

          // Tiebreakers: champion, finalists, semis, quarters, R16, R32
          const tiebreakRounds = ["CHAMPION", "FINAL", "SF", "QF", "R16", "R32"];

          for (const round of tiebreakRounds) {
            const diff =
              b.roundScores[round].points - a.roundScores[round].points;

            if (diff !== 0) return diff;
          }

          return String(a.submission.name || "").localeCompare(
            String(b.submission.name || "")
          );
        });

      setActualResults(results);
      setActualBracketRows(actualBracketData.actualBracket || []);
      setLeaderboardRows(scoredRows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, [submitUrl]);

  if (selectedSubmission) {
    return (
      <GuessDetail
        submission={selectedSubmission}
        onBack={() => setSelectedSubmission(null)}
        backLabel="← Back to leaderboard"
      />
    );
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Leaderboard</h2>
          <p>
            Scores calculated as results come in. Click a row to view that prediction.
          </p>
        </div>

        <button className="secondary" type="button" onClick={loadLeaderboard}>
          Refresh
        </button>
      </div>

      {loading && <LoadingDots label="Loading leaderboard" />}

      {error && <p className="error">{error}</p>}

      {!loading && !error && actualResults && (
        <div className="results-summary">
          {SCORE_ROUNDS.map(round => (
            <div className="result-summary-card" key={round}>
              <span>{round}</span>
              <strong>{uniqueTeams(actualResults[round]).length}</strong>
              <small>
                {round === "CHAMPION" ? "team entered" : "teams entered"}
              </small>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && leaderboardRows.length === 0 && (
        <p className="muted">No submissions found yet.</p>
      )}

      {!loading && !error && leaderboardRows.length > 0 && (
        <div className="guess-table-wrap">
          <table className="guess-table leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Total</th>
                <th>R32</th>
                <th>R16</th>
                <th>QF</th>
                <th>SF</th>
                <th>Final</th>
                <th>Champion</th>
              </tr>
            </thead>

            <tbody>
              {leaderboardRows.map((row, index) => (
                <tr
                  key={`${row.submission.name}-${index}`}
                  className="clickable-row"
                  onClick={() => setSelectedSubmission(row.submission)}
                >
                  <td className="rank-cell">{index + 1}</td>
                  <td>{row.submission.name || "Unknown"}</td>
                  <td className="total-cell">{row.total}</td>
                  <td>{row.roundScores.R32.points}</td>
                  <td>{row.roundScores.R16.points}</td>
                  <td>{row.roundScores.QF.points}</td>
                  <td>{row.roundScores.SF.points}</td>
                  <td>{row.roundScores.FINAL.points}</td>
                  <td>{row.roundScores.CHAMPION.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && leaderboardRows.length > 0 && (
        <p className="muted small leaderboard-note">
          Scoring: Each team in the round-of-32 = 1 point, round-of-16 = 2, quarter-final = 4, semi-final = 8, final = 16,
          Champion = 32.
        </p>
      )}

      {!loading && !error && actualResults && (
        <ActualBracketDisplay actualBracketRows={actualBracketRows} />
      )}
    </section>
  );
}

function AllGuesses({ submitUrl }) {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [error, setError] = useState("");

  async function loadSubmissions() {
    try {
      setLoading(true);
      setError("");

      if (!submitUrl) {
        throw new Error("No Google Sheets URL is configured.");
      }

      const data = await fetchJsonp(`${submitUrl}?type=submissions`);

      if (!data.ok) {
        throw new Error(data.error || "Could not read submissions.");
      }

      setSubmissions(getSubmissionsFromResponse(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, [submitUrl]);

  if (selectedSubmission) {
    return (
      <GuessDetail
        submission={selectedSubmission}
        onBack={() => setSelectedSubmission(null)}
      />
    );
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>All Guesses</h2>
          <p>
            These are the submissions currently recorded.
            Click a row to view the full prediction.
          </p>
        </div>

        <button className="secondary" type="button" onClick={loadSubmissions}>
          Refresh
        </button>
      </div>

      {loading && <LoadingDots label="Loading guesses" />}

      {error && <p className="error">{error}</p>}

      {!loading && !error && submissions.length === 0 && (
        <p className="muted">No submissions found yet.</p>
      )}

      {!loading && !error && submissions.length > 0 && (
        <div className="guess-table-wrap">
          <table className="guess-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Champion</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr
                  key={`${submission.name}-${index}`}
                  className="clickable-row"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <td>{submission.name || "Unknown"}</td>
                  <td>
                    <TeamName team={submission.champion || "Not selected"} />
                  </td>
                  <td>{formatTimestampForUser(submission.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// --- App ---

export default function App() {
  const [activeTab, setActiveTab] = useState("submit");
  const submitUrl = import.meta.env.VITE_SUBMIT_URL;
  const [annexC, setAnnexC] = useState([]);
  const [annexCStatus, setAnnexCStatus] = useState("");
  const [name, setName] = useState("");
  const [rankings, setRankings] = useState(defaultRankings);
  const [selectedThirdGroups, setSelectedThirdGroups] = useState([]);
  const [roundOf32, setRoundOf32] = useState([]);
  const [picks, setPicks] = useState({});
  const [status, setStatus] = useState("");
  const [previousSubmissions, setPreviousSubmissions] = useState([]);
  const [loadingPreviousSubmissions, setLoadingPreviousSubmissions] = useState(false);
  const [previousSubmissionStatus, setPreviousSubmissionStatus] = useState("");

  const allRankingsValid = Object.values(rankings).every(rankingIsValid);

  const thirdPlaceTeams = useMemo(() => {
    return Object.entries(rankings).map(([group, ranking]) => ({
      group,
      team: ranking[2]
    }));
  }, [rankings]);

  useEffect(() => {
    async function loadAnnexC() {
      try {
        if (!submitUrl) {
          setAnnexCStatus("No Google Sheets URL configured. FIFA bracket table not loaded.");
          return;
        }
  
        const data = await fetchJsonp(`${submitUrl}?type=fifaAnnexC`);
  
        if (!data.ok) {
          throw new Error(data.error || "Could not load FIFA Annex C table.");
        }
  
        setAnnexC(data.annexC || []);
        setAnnexCStatus("");
      } catch (error) {
        setAnnexC([]);
        setAnnexCStatus(error.message);
      }
    }
  
    loadAnnexC();
  }, [submitUrl]);

  async function loadPreviousSubmissions() {
    try {
      setLoadingPreviousSubmissions(true);
      setPreviousSubmissionStatus("");
  
      if (!submitUrl) {
        throw new Error("No Google Sheets URL is configured.");
      }
  
      const data = await fetchJsonp(`${submitUrl}?type=submissions`);
  
      if (!data.ok) {
        throw new Error(data.error || "Could not read previous submissions.");
      }
  
      const submissions = getSubmissionsFromResponse(data);
      setPreviousSubmissions(submissions);
  
      if (submissions.length === 0) {
        setPreviousSubmissionStatus("No previous submissions found.");
      }
    } catch (error) {
      setPreviousSubmissionStatus(error.message);
    } finally {
      setLoadingPreviousSubmissions(false);
    }
  }
  
  function loadPreviousSubmission(indexValue) {
    if (indexValue === "") return;
  
    const submission = previousSubmissions[Number(indexValue)];
  
    if (!submission) {
      setPreviousSubmissionStatus("Could not find that previous submission.");
      return;
    }
  
    const basics = getSubmissionBasics(submission);
  
    if (!basics.groups || Object.keys(basics.groups).length === 0) {
      setPreviousSubmissionStatus("That submission does not contain group predictions.");
      return;
    }
  
    setName(basics.name);
    setRankings(basics.groups);
    setSelectedThirdGroups(basics.thirdPlaceQualifyingGroups || []);
    setRoundOf32([]);
    setPicks({});
    setStatus("");
    setPreviousSubmissionStatus(
      `Loaded ${basics.name || "previous submission"}. Click Generate bracket to rebuild it with the official FIFA mapping.`
    );
  }

  useEffect(() => {
    if (activeTab === "submit" && previousSubmissions.length === 0) {
      loadPreviousSubmissions();
    }
  }, [activeTab]);

  function updateRanking(group, nextRanking) {
    setRankings(prev => ({ ...prev, [group]: nextRanking }));
    setRoundOf32([]);
    setPicks({});
    setStatus("");
  }

  function toggleThirdGroup(group) {
    setSelectedThirdGroups(prev => {
      if (prev.includes(group)) return prev.filter(g => g !== group);
      if (prev.length >= 8) return prev;
      return [...prev, group];
    });

    setRoundOf32([]);
    setPicks({});
    setStatus("");
  }

  function generateBracket() {
    try {
      setStatus("");

      if (!allRankingsValid) {
        throw new Error("Please fix duplicate teams in the group rankings.");
      }

      if (!annexC.length) {
        throw new Error(
          annexCStatus ||
            "FIFA Annex C table is still loading. Please wait a moment and try again."
        );
      }
      
      const bracket = buildRoundOf32(rankings, selectedThirdGroups, annexC);
      setRoundOf32(bracket);
      setPicks({});
      setStatus("Bracket generated. Pick winners from left to right.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  function pickWinner(matchId, winner) {
    setPicks(prev => ({ ...prev, [matchId]: winner }));
  }

  const roundOf16 = ROUND_OF_16_TEMPLATE.map(([left, right], index) => ({
    id: `R16-${index + 1}`,
    a: picks[left],
    b: picks[right]
  }));

  const quarterFinals = [
    { id: "QF-1", a: picks["R16-1"], b: picks["R16-2"] },
    { id: "QF-2", a: picks["R16-3"], b: picks["R16-4"] },
    { id: "QF-3", a: picks["R16-5"], b: picks["R16-6"] },
    { id: "QF-4", a: picks["R16-7"], b: picks["R16-8"] }
  ];

  const semiFinals = [
    { id: "SF-1", a: picks["QF-1"], b: picks["QF-2"] },
    { id: "SF-2", a: picks["QF-3"], b: picks["QF-4"] }
  ];

  const final = [{ id: "FINAL", a: picks["SF-1"], b: picks["SF-2"] }];
  const champion = picks["FINAL"];

  async function submitGuess() {
    try {
      if (!name.trim()) {
        throw new Error("Please enter your name.");
      }

      if (!champion) {
        throw new Error("Please complete the whole bracket before submitting.");
      }

      const submission = {
        name: name.trim(),
        submittedAt: new Date().toISOString(),
        groups: rankings,
        thirdPlaceQualifyingGroups: selectedThirdGroups,
        roundOf32,
        picks,
        champion
      };

      if (!submitUrl) {
        console.log("Submission preview:", submission);
        setStatus(
          "Submission created. No Google Sheet URL is configured yet, so I printed it in the browser console."
        );
        return;
      }

      await fetch(submitUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submission)
      });

      setStatus("Guess submitted. Good luck!");
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">World Cup 2026</p>
        <h1>Hirundo Prediction Pool</h1>
        <p>
          Rank each group, choose the eight third-place teams that qualify,
          generate the bracket, and pick your champion.
        </p>
      </header>

      <nav className="tabs">
        <button
          type="button"
          className={activeTab === "submit" ? "tab active-tab" : "tab"}
          onClick={() => setActiveTab("submit")}
        >
          Submit Guess
        </button>

        <button
          type="button"
          className={activeTab === "guesses" ? "tab active-tab" : "tab"}
          onClick={() => setActiveTab("guesses")}
        >
          All Guesses
        </button>

        <button
          type="button"
          className={activeTab === "leaderboard" ? "tab active-tab" : "tab"}
          onClick={() => setActiveTab("leaderboard")}
        >
          Leaderboard
        </button>

      </nav>

      {activeTab === "guesses" && (
        <AllGuesses submitUrl={submitUrl} />
      )}
      
      {activeTab === "leaderboard" && (
        <Leaderboard submitUrl={submitUrl} />
      )}

      {activeTab === "submit" && (
        <>
          <section className="panel">
            <div className="submit-tools">
              <label className="name-label">
                Your name
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder="Example: Orr"
                />
              </label>

              <div className="previous-loader">
                <div>
                  <strong>Load previous group picks</strong>
                  <p>
                    Restore a previous submission’s group rankings and third-place qualifiers,
                    then regenerate the bracket with the official FIFA mapping.
                  </p>
                </div>

                <div className="previous-loader-controls">
                  <button
                    className="secondary"
                    type="button"
                    onClick={loadPreviousSubmissions}
                    disabled={loadingPreviousSubmissions}
                  >
                    {loadingPreviousSubmissions ? "Loading..." : "Refresh submissions"}
                  </button>

                  <select
                    defaultValue=""
                    onChange={event => loadPreviousSubmission(event.target.value)}
                    disabled={previousSubmissions.length === 0}
                  >
                    <option value="">Choose previous submission...</option>
                    {previousSubmissions.map((submission, index) => (
                      <option key={`${submission.name}-${index}`} value={index}>
                        {(submission.name || "Unknown") +
                          " — " +
                          formatTimestampForUser(submission.timestamp)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {previousSubmissionStatus && (
              <p className="status-inline">{previousSubmissionStatus}</p>
            )}
          </section>

          <section>
            <div className="section-heading">
              <h2>1. Rank the groups</h2>
              <p>Position 1 wins the group. Position 2 is runner-up. Position 3 can qualify as one of the best third-place teams.</p>
            </div>

            <div className="group-grid">
              {Object.entries(GROUPS).map(([group, teams]) => (
                <GroupRanker
                  key={group}
                  group={group}
                  ranking={rankings[group]}
                  onChange={updateRanking}
                />
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading stacked">
              <div>
                <h2>2. Choose eight third-place qualifiers</h2>
                <p>
                  In the 2026 World Cup, there are 48 teams across 12 groups. The top two teams from each group qualify automatically, and the eight best third-place teams also advance to the Round of 32.
                </p>
              </div>

              <p className="selected-count">
                Selected: {selectedThirdGroups.length}/8
              </p>
            </div>

            <div className="third-grid">
              {thirdPlaceTeams.map(({ group, team }) => (
                <label
                  key={group}
                  className={
                    selectedThirdGroups.includes(group)
                      ? "third-card selected-third"
                      : "third-card"
                  }
                >
                  <input
                    type="checkbox"
                    checked={selectedThirdGroups.includes(group)}
                    onChange={() => toggleThirdGroup(group)}
                  />
                  <strong>Group {group}</strong>
                  <span>{team}</span>
                </label>
              ))}
            </div>

            <button className="primary" type="button" onClick={generateBracket}>
              Generate bracket
            </button>
          </section>

          {roundOf32.length > 0 && (
            <section>
              <div className="section-heading">
                <h2>3. Pick winners</h2>
                <p>Each round unlocks after the previous winners are selected.</p>
              </div>

              <div className="bracket">
                <div className="round">
                  <h3>Round of 32</h3>
                  {roundOf32.map(match => (
                    <Match
                      key={match.id}
                      id={match.id}
                      a={match.a}
                      b={match.b}
                      winner={picks[match.id]}
                      onPick={pickWinner}
                    />
                  ))}
                </div>

                <div className="round">
                  <h3>Round of 16</h3>
                  {roundOf16.map(match => (
                    <Match
                      key={match.id}
                      id={match.id}
                      a={match.a}
                      b={match.b}
                      winner={picks[match.id]}
                      onPick={pickWinner}
                    />
                  ))}
                </div>

                <div className="round">
                  <h3>Quarterfinals</h3>
                  {quarterFinals.map(match => (
                    <Match
                      key={match.id}
                      id={match.id}
                      a={match.a}
                      b={match.b}
                      winner={picks[match.id]}
                      onPick={pickWinner}
                    />
                  ))}
                </div>

                <div className="round">
                  <h3>Semifinals</h3>
                  {semiFinals.map(match => (
                    <Match
                      key={match.id}
                      id={match.id}
                      a={match.a}
                      b={match.b}
                      winner={picks[match.id]}
                      onPick={pickWinner}
                    />
                  ))}
                </div>

                <div className="round">
                  <h3>Final</h3>
                  {final.map(match => (
                    <Match
                      key={match.id}
                      id={match.id}
                      a={match.a}
                      b={match.b}
                      winner={picks[match.id]}
                      onPick={pickWinner}
                    />
                  ))}

                  <div className="champion">
                    <span>Champion</span>
                    <strong>{champion || "TBD"}</strong>
                  </div>

                  <button className="primary" type="button" onClick={submitGuess}>
                    Submit guess
                  </button>
                </div>
              </div>
            </section>
          )}

      {status && <p className="status">{status}</p>}
      </>
    )}
    </main>
  );
}
