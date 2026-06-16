import React, { useEffect, useMemo, useState } from "react";

const GROUPS = {
  A: ["Mexico", "South Korea", "South Africa", "Czechia"],
  B: ["Canada", "Switzerland", "Qatar", "Bosnia-Herzegovina"],
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

function TeamName({ team }) {
  if (!team) return <>TBD</>;

  return (
    <span className="team-with-flag">
      <span className="flag" aria-hidden="true">
        {TEAM_FLAGS[team] || "🏳️"}
      </span>
      <span>{team}</span>
    </span>
  );
}

const THIRD_PLACE_SLOTS = [
  { key: "3_ABCDF", allowedGroups: ["A", "B", "C", "D", "F"] },
  { key: "3_CDFGH", allowedGroups: ["C", "D", "F", "G", "H"] },
  { key: "3_CEFHI", allowedGroups: ["C", "E", "F", "H", "I"] },
  { key: "3_EHIJK", allowedGroups: ["E", "H", "I", "J", "K"] },
  { key: "3_BEFIJ", allowedGroups: ["B", "E", "F", "I", "J"] },
  { key: "3_AEHIJ", allowedGroups: ["A", "E", "H", "I", "J"] },
  { key: "3_EFGIJ", allowedGroups: ["E", "F", "G", "I", "J"] },
  { key: "3_DEIJL", allowedGroups: ["D", "E", "I", "J", "L"] }
];

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

function orderRoundOf32ForBracket(matches) {
  const matchesById = Object.fromEntries(
    (matches || []).map(match => [match.id, match])
  );

  return ROUND_OF_16_TEMPLATE
    .flat()
    .map(matchId => matchesById[matchId])
    .filter(Boolean);
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

function assignThirdPlaceSlots(rankings, selectedThirdGroups) {
  const selected = [...selectedThirdGroups];

  if (selected.length !== 8) {
    throw new Error("Please choose exactly 8 third-place teams.");
  }

  const result = {};
  const usedGroups = new Set();

  function backtrack(slotIndex) {
    if (slotIndex === THIRD_PLACE_SLOTS.length) return true;

    const slot = THIRD_PLACE_SLOTS[slotIndex];
    const candidates = selected.filter(
      group => slot.allowedGroups.includes(group) && !usedGroups.has(group)
    );

    for (const group of candidates) {
      usedGroups.add(group);
      result[slot.key] = rankings[group][2];

      if (backtrack(slotIndex + 1)) return true;

      delete result[slot.key];
      usedGroups.delete(group);
    }

    return false;
  }

  const ok = backtrack(0);

  if (!ok) {
    throw new Error(
      "Those 8 third-place teams cannot be assigned to the current bracket slots. Try a different set."
    );
  }

  return result;
}

function buildRoundOf32(rankings, selectedThirdGroups) {
  const directQualifiers = getQualifiers(rankings);
  const thirdSlotAssignments = assignThirdPlaceSlots(rankings, selectedThirdGroups);
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

  function ReadOnlyBracketMatch({ id, a, b, winner }) {
    return (
      <div className="readonly-match">
        <div className="match-id">{id}</div>
  
        <div className={winner === a ? "readonly-team winner-team" : "readonly-team"}>
          <TeamName team={a} />
        </div>
  
        <div className={winner === b ? "readonly-team winner-team" : "readonly-team"}>
          <TeamName team={b} />
        </div>
      </div>
    );
  }
  
  function PredictionBracket({ details }) {
    const picks = details.picks || {};
  
    const roundOf32ById = Object.fromEntries(
      (details.roundOf32 || []).map(match => [match.id, match])
    );
    
    const roundOf32 = ROUND_OF_16_TEMPLATE
      .flat()
      .map(matchId => roundOf32ById[matchId])
      .filter(Boolean);
  
    const roundOf16 = ROUND_OF_16_TEMPLATE.map(([left, right], index) => ({
      id: `R16-${index + 1}`,
      a: picks[left],
      b: picks[right],
      winner: picks[`R16-${index + 1}`]
    }));
  
    const quarterFinals = [
      { id: "QF-1", a: picks["R16-1"], b: picks["R16-2"], winner: picks["QF-1"] },
      { id: "QF-2", a: picks["R16-3"], b: picks["R16-4"], winner: picks["QF-2"] },
      { id: "QF-3", a: picks["R16-5"], b: picks["R16-6"], winner: picks["QF-3"] },
      { id: "QF-4", a: picks["R16-7"], b: picks["R16-8"], winner: picks["QF-4"] }
    ];
  
    const semiFinals = [
      { id: "SF-1", a: picks["QF-1"], b: picks["QF-2"], winner: picks["SF-1"] },
      { id: "SF-2", a: picks["QF-3"], b: picks["QF-4"], winner: picks["SF-2"] }
    ];
  
    const final = [
      { id: "FINAL", a: picks["SF-1"], b: picks["SF-2"], winner: picks.FINAL }
    ];
  
    return (
      <div className="readonly-bracket">
        <div className="readonly-round">
          <h4>Round of 32</h4>
          {orderRoundOf32ForBracket(roundOf32).map(match => (
            <ReadOnlyBracketMatch
              key={match.id}
              id={match.id}
              a={match.a}
              b={match.b}
              winner={picks[match.id]}
            />
          ))}
        </div>
  
        <div className="readonly-round">
          <h4>Round of 16</h4>
          {roundOf16.map(match => (
            <ReadOnlyBracketMatch
              key={match.id}
              id={match.id}
              a={match.a}
              b={match.b}
              winner={match.winner}
            />
          ))}
        </div>
  
        <div className="readonly-round">
          <h4>Quarterfinals</h4>
          {quarterFinals.map(match => (
            <ReadOnlyBracketMatch
              key={match.id}
              id={match.id}
              a={match.a}
              b={match.b}
              winner={match.winner}
            />
          ))}
        </div>
  
        <div className="readonly-round">
          <h4>Semifinals</h4>
          {semiFinals.map(match => (
            <ReadOnlyBracketMatch
              key={match.id}
              id={match.id}
              a={match.a}
              b={match.b}
              winner={match.winner}
            />
          ))}
        </div>
  
        <div className="readonly-round">
          <h4>Final</h4>
          {final.map(match => (
            <ReadOnlyBracketMatch
              key={match.id}
              id={match.id}
              a={match.a}
              b={match.b}
              winner={match.winner}
            />
          ))}
  
          <div className="readonly-champion">
            <span>Champion</span>
            <strong>{details.champion || "TBD"}</strong><strong>
              <TeamName team={details.champion || "TBD"} />
            </strong>
          </div>
        </div>
      </div>
    );
  }

  function GuessDetail({ submission, onBack }) {
    const details = getSubmissionDetails(submission);
  
    return (
      <section className="panel">
        <button className="secondary back-button" type="button" onClick={onBack}>
          ← Back to all guesses
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
            <h3>Knockout bracket</h3>
            <p className="muted">
              Highlighted teams are the winners picked by this user.
            </p>
  
            <PredictionBracket details={details} />
          </section>
        </div>
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

      setSubmissions(data.submissions || []);
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
            These are the submissions currently recorded in the Google Sheet.
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

export default function App() {
  const [activeTab, setActiveTab] = useState("submit");
  const submitUrl = import.meta.env.VITE_SUBMIT_URL;
  const [name, setName] = useState("");
  const [rankings, setRankings] = useState(defaultRankings);
  const [selectedThirdGroups, setSelectedThirdGroups] = useState([]);
  const [roundOf32, setRoundOf32] = useState([]);
  const [picks, setPicks] = useState({});
  const [status, setStatus] = useState("");

  const allRankingsValid = Object.values(rankings).every(rankingIsValid);

  const thirdPlaceTeams = useMemo(() => {
    return Object.entries(rankings).map(([group, ranking]) => ({
      group,
      team: ranking[2]
    }));
  }, [rankings]);

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

      const bracket = buildRoundOf32(rankings, selectedThirdGroups);
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
      </nav>

      {activeTab === "guesses" && (
        <AllGuesses submitUrl={submitUrl} />
      )}

      {activeTab === "submit" && (
        <>

      <section className="panel">
        <label className="name-label">
          Your name
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Your Name"
          />
        </label>
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