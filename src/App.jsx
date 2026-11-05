
import { useState } from 'react';
import {
  team,
  games,
  players,
  standings,
  announcements
} from './data';
import './App.css';

const pages = [
  'Home',
  'Schedule',
  'Roster',
  'Statistics',
  'Standings',
  'About'
];

function formatDate(date) {
  return new Date(date + 'T12:00:00').toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
  );
}

function App() {
  const [page, setPage] = useState('Home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('All');
  const [gameFilter, setGameFilter] = useState('All');

  const completedGames = games.filter(
    game => game.status === 'Final'
  );

  const wins = completedGames.filter(
    game => game.sruScore > game.opponentScore
  ).length;

  const losses = completedGames.filter(
    game => game.sruScore < game.opponentScore
  ).length;

  const upcomingGames = games
    .filter(game => game.status === 'Upcoming')
    .sort((a, b) => a.date.localeCompare(b.date));

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesPosition =
      position === 'All' ||
      player.position === position;

    return matchesSearch && matchesPosition;
  });

  const filteredGames = games
    .filter(game =>
      gameFilter === 'All' ||
      game.status === gameFilter
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const sortedStats = [...players].sort(
    (a, b) =>
      (b.goals + b.assists) -
      (a.goals + a.assists)
  );

  function navigate(destination) {
    setPage(destination);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }

  function ScheduleTable({ entries }) {
    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Opponent</th>
              <th>Location</th>
              <th>Time</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(game => (
              <tr key={game.id}>
                <td>{formatDate(game.date)}</td>
                <td>{game.opponent}</td>
                <td>{game.location}</td>
                <td>{game.time}</td>
                <td>
                  {game.status === 'Final' ? (
                    <span className={
                      game.sruScore > game.opponentScore
                        ? 'result-win'
                        : game.sruScore < game.opponentScore
                        ? 'result-loss'
                        : 'result-neutral'
                    }>
                      {game.sruScore > game.opponentScore
                        ? 'W '
                        : game.sruScore < game.opponentScore
                        ? 'L '
                        : 'T '}
                      {game.sruScore}–{game.opponentScore}
                    </span>
                  ) : (
                    <span className="status">
                      {game.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <p className="empty">
            No games available.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="site">
      <div className="topbar">
        SLIPPERY ROCK UNIVERSITY • MEN'S CLUB LACROSSE
      </div>

      <header className="site-header">
        <div
          className="brand"
          onClick={() => navigate('Home')}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter') navigate('Home');
          }}
        >
          <div className="brand-mark">SRU</div>
          <div>
            <strong>THE ROCK</strong>
            <small>MEN'S CLUB LACROSSE</small>
          </div>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        <nav className={menuOpen ? 'open' : ''}>
          {pages.map(item => (
            <button
              key={item}
              className={page === item ? 'active' : ''}
              onClick={() => navigate(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {page === 'Home' && (
          <>
            <section className="hero">
              <div className="hero-content">
                <span className="eyebrow">
                  SLIPPERY ROCK UNIVERSITY
                </span>
                <h1>
                  BUILT FOR
                  <span> THE ROCK.</span>
                </h1>
                <p>
                  SRU Men's Club Lacrosse.
                  One team. One goal.
                </p>
                <div className="hero-actions">
                  <button
                    className="btn-primary"
                    onClick={() => navigate('Schedule')}
                  >
                    View Schedule
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => navigate('Roster')}
                  >
                    Meet the Team
                  </button>
                </div>
              </div>
            </section>

            <div className="stats-strip">
              <div>
                <strong>{wins}</strong>
                <span>WINS</span>
              </div>
              <div>
                <strong>{losses}</strong>
                <span>LOSSES</span>
              </div>
              <div>
                <strong>{players.length}</strong>
                <span>ROSTER ENTRIES</span>
              </div>
              <div>
                <strong>{upcomingGames.length}</strong>
                <span>UPCOMING GAMES</span>
              </div>
            </div>

            <section className="content-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow green">
                    GAME DAY
                  </span>
                  <h2>Upcoming Games</h2>
                </div>
                <button
                  className="text-link"
                  onClick={() => navigate('Schedule')}
                >
                  Full Schedule →
                </button>
              </div>

              <ScheduleTable
                entries={upcomingGames.slice(0, 3)}
              />
            </section>

            <section className="content-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow green">
                    LATEST UPDATES
                  </span>
                  <h2>Team News</h2>
                </div>
              </div>

              <div className="news-grid">
                {announcements.map(item => (
                  <article className="news-card" key={item.id}>
                    <span className="news-tag">
                      TEAM NEWS
                    </span>
                    <p className="news-date">
                      {formatDate(item.date)}
                    </p>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {page === 'Schedule' && (
          <section className="content-section page-section">
            <div className="page-title">
              <span className="eyebrow green">
                {team.season} SEASON
              </span>
              <h1>Game Schedule & Scores</h1>
              <p>
                View upcoming matchups and completed
                game results.
              </p>
            </div>

            <div className="filters">
              {['All', 'Upcoming', 'Final'].map(filter => (
                <button
                  key={filter}
                  className={
                    gameFilter === filter
                      ? 'filter-active'
                      : ''
                  }
                  onClick={() => setGameFilter(filter)}
                >
                  {filter === 'All' ? 'All Games' : filter}
                </button>
              ))}
            </div>

            <ScheduleTable entries={filteredGames} />
          </section>
        )}

        {page === 'Roster' && (
          <section className="content-section page-section">
            <div className="page-title">
              <span className="eyebrow green">
                MEET THE TEAM
              </span>
              <h1>{team.season} Roster</h1>
              <p>
                Meet the players representing
                Slippery Rock University.
              </p>
            </div>

            <div className="roster-controls">
              <input
                type="search"
                placeholder="Search player name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search players"
              />

              <select
                value={position}
                onChange={e => setPosition(e.target.value)}
                aria-label="Filter by position"
              >
                <option value="All">All Positions</option>
                <option value="Attack">Attack</option>
                <option value="Midfield">Midfield</option>
                <option value="Defense">Defense</option>
                <option value="Goalie">Goalie</option>
                <option value="FOGO">FOGO</option>
                <option value="LSM">LSM</option>
              </select>
            </div>

            <div className="roster-grid">
              {filteredPlayers.map(player => (
                <div className="player-card" key={player.id}>
                  <div className="player-number">
                    #{player.number}
                  </div>
                  <div className="player-details">
                    <h3>{player.name}</h3>
                    <p>{player.position}</p>
                    <span>{player.year}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <p className="empty">
                No players match your search.
              </p>
            )}
          </section>
        )}

        {page === 'Statistics' && (
          <section className="content-section page-section">
            <div className="page-title">
              <span className="eyebrow green">
                PLAYER PERFORMANCE
              </span>
              <h1>Player Statistics</h1>
              <p>
                Season totals for the SRU Men's Club
                Lacrosse team.
              </p>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>GP</th>
                    <th>G</th>
                    <th>A</th>
                    <th>PTS</th>
                    <th>GB</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map(player => (
                    <tr key={player.id}>
                      <td>{player.name}</td>
                      <td>{player.games}</td>
                      <td>{player.goals}</td>
                      <td>{player.assists}</td>
                      <td>
                        <strong>
                          {player.goals + player.assists}
                        </strong>
                      </td>
                      <td>{player.groundBalls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="table-note">
              GP = Games Played • G = Goals •
              A = Assists • PTS = Points •
              GB = Ground Balls
            </p>
            <p className="table-note">
              Goalie-specific statistics will be added
              when verified data is available.
            </p>
          </section>
        )}

        {page === 'Standings' && (
          <section className="content-section page-section">
            <div className="page-title">
              <span className="eyebrow green">
                SEASON OVERVIEW
              </span>
              <h1>Team Standings</h1>
              <p>
                Team records and season performance.
              </p>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map(entry => {
                    const total =
                      entry.wins + entry.losses;
                    const percentage = total
                      ? (
                          entry.wins / total * 100
                        ).toFixed(1)
                      : '0.0';

                    return (
                      <tr key={entry.id}>
                        <td>{entry.team}</td>
                        <td>{entry.wins}</td>
                        <td>{entry.losses}</td>
                        <td>{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="table-note">
              Conference standings will be added
              after the team's league and division
              are confirmed.
            </p>
          </section>
        )}

        {page === 'About' && (
          <section className="content-section page-section">
            <div className="page-title">
              <span className="eyebrow green">
                ABOUT THE ROCK
              </span>
              <h1>SRU Men's Club Lacrosse</h1>
              <p>{team.description}</p>
            </div>

            <div className="about-grid">
              <div className="info-card">
                <h3>Our University</h3>
                <p>{team.school}</p>
                <p>{team.location}</p>
              </div>

              <div className="info-card">
                <h3>Our Season</h3>
                <p>{team.season}</p>
                <p>
                  Schedules, scores, and team
                  announcements.
                </p>
              </div>

              <div className="info-card">
                <h3>Contact the Team</h3>
                <p>
                  Official contact information
                  will be added after confirmation.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div>
          <h2>THE ROCK</h2>
          <p>SRU Men's Club Lacrosse</p>
          <p>Slippery Rock, Pennsylvania</p>
        </div>

        <div>
          <p>Team website • {team.season}</p>
          <p>
            Independent team website under development.
          </p>
          <p>
            Not an official university publication.
          </p>
        </div>
      </footer>

      <div className="copyright">
        © {new Date().getFullYear()} SRU Men's Club Lacrosse
        Website
      </div>
    </div>
  );
}

export default App;
