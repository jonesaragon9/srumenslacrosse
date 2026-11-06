
import { useState, useEffect } from 'react';
import {
  team,
  games as sampleGames,
  players,
  standings,
  announcements
} from './data';
import './App.css';
import lacrosseHeroArt from './assets/lacrosse-hero-art.png';
import SignUp from './SignUp'
import PlayerProfile from './PlayerProfile';
import LogIn from './LogIn';
import { supabase } from './supabaseClient';
import AdminDashboard from './AdminDashboard';
const pages = [
  'Home',
  'Schedule',
  'Roster',
  'Statistics',
  'Standings',
  'About',
  'Fundraising',
  'Sign Up' ,
  'Log In' ,
  'Player Profile' ,
  'Admin Dashboard'

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
  const [approvedPlayers, setApprovedPlayers] = useState([]);
  const [games, setGames] = useState(sampleGames);
  const [scheduleError, setScheduleError] = useState('');

  async function loadGames() {
    const { data, error } = await supabase.from('games').select('*').order('date', { ascending: true });
    if (error) {
      console.error('Unable to load games:', error.message);
      setScheduleError('Live schedule unavailable. Showing the original schedule until the database is configured.');
      return;
    }
    setScheduleError('');
    setGames((data || []).map(game => ({
      id: game.id, date: game.date, opponent: game.opponent,
      location: game.location, time: game.time, status: game.status,
      sruScore: game.sru_score, opponentScore: game.opponent_score
    })));
  }

  useEffect(() => { loadGames(); }, []);

  useEffect(() => {
  async function loadApprovedPlayers() {
    const { data, error } = await supabase
      .from('approved_roster')
      .select('*');

    if (error) {
      console.error('Error loading roster:', error.message);
    } else {
      setApprovedPlayers(data || []);
    }
  }

  loadApprovedPlayers();
}, []);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
  async function checkAdmin() {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    setIsAdmin(!error && !!data);
  }

  checkAdmin();
}, [user]);

useEffect(() => {
  // Check whether someone is already logged in
  supabase.auth.getUser().then(({ data }) => {
    setUser(data.user);
  });

  // Detect when someone logs in or logs out
  const { data: { subscription } } =
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

  return () => subscription.unsubscribe();
}, []);
async function handleLogOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert('Error logging out: ' + error.message);
  } else {
    setPage('Home');
  }
}
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

  const filteredPlayers = approvedPlayers.map(player => ({
  id: player.id,
  name: player.full_name,
  number: player.jersey_number,
  position: player.position,
  year: player.class_year,
  games: player.games,
goals: player.goals,
assists: player.assists,
groundBalls: player.ground_balls,
saves: player.saves,
goalsAllowed: player.goals_allowed,
minutesPlayed: player.minutes_played
})).filter(player => {
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
          {pages
  .filter(item => {
  if (!user) {
    return !['Player Profile', 'Admin Dashboard', 'Log Out'].includes(item);
  }

  if (isAdmin) {
    return !['Log In', 'Sign Up'].includes(item);
  }

  return !['Log In', 'Sign Up', 'Admin Dashboard'].includes(item);
})
  .map(item => (
            <button
              key={item}
              className={page === item ? 'active' : ''}
              onClick={() => navigate(item)}
            >
              {item}
            </button>
          ))}
          {user && (
  <button onClick={handleLogOut}>
    Log Out
  </button>
)}
        </nav>
      </header>

      <main>
        {scheduleError && <p className="schedule-notice" role="status">{scheduleError}</p>}
        {page === 'Home' && (
          <>
            <section className="hero lacrosse-hero" aria-label="SRU Men's Club Lacrosse">
              <div className="lacrosse-hero-artwork">
                <img
                  src={lacrosseHeroArt}
                  alt="SRU green S logo above LACROSSE and crossed lacrosse sticks on a nighttime lacrosse field"
                />
              </div>
              <div className="lacrosse-hero-buttons">
                <button className="btn-primary" onClick={() => navigate('Schedule')}>
                  <span aria-hidden="true">▦</span> View Schedule
                </button>
                <button className="btn-outline" onClick={() => navigate('Roster')}>
                  <span aria-hidden="true">♟</span> Meet the Team
                </button>
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
                <strong>{approvedPlayers.length}</strong>
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

  {player.position === 'Goalie' ? (
    <div className="player-stats">
      <p>Games: {player.games}</p>
      <p>Saves: {player.saves}</p>
      <p>Goals Allowed: {player.goalsAllowed}</p>
      <p>
        Save Percentage: {
          (Number(player.saves) + Number(player.goalsAllowed)) > 0
            ? (
                Number(player.saves) /
                (Number(player.saves) + Number(player.goalsAllowed)) * 100
              ).toFixed(1) + '%'
            : '0.0%'
        }
      </p>
      <p>
        GAA: {
          Number(player.minutesPlayed) > 0
            ? (
                Number(player.goalsAllowed) * 60 /
                Number(player.minutesPlayed)
              ).toFixed(2)
            : 'N/A'
        }
      </p>
    </div>
  ) : (
    <div className="player-stats">
      <p>Games: {player.games}</p>
      <p>Goals: {player.goals}</p>
      <p>Assists: {player.assists}</p>
      <p>Ground Balls: {player.groundBalls}</p>
    </div>
  )}
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
          <div className="about-page">
            <section className="about-intro">
              <span className="about-kicker">MORE THAN A GAME</span>
              <h1>Find Your Team. Find Your People.</h1>
              <p>At SRU Men's Club Lacrosse, it's about more than what happens on the field. It's a chance to meet new people, build lasting friendships, stay active, and be part of something bigger during your time at Slippery Rock.</p>
              <button className="about-cta" onClick={() => navigate('Roster')}>Meet the Team</button>
            </section>
            <section className="about-benefits" aria-label="Why join the team">
              <article className="about-benefit"><span className="benefit-icon">01</span><h2>Make Friends</h2><p>Meet students with shared interests, find a supportive group, and build friendships on and off the field.</p></article>
              <article className="about-benefit"><span className="benefit-icon">02</span><h2>New to Lacrosse? Welcome.</h2><p>You don't need years of experience to get involved. Come ready to learn, practice your skills, and grow with the team.</p></article>
              <article className="about-benefit"><span className="benefit-icon">03</span><h2>Get in the Action</h2><p>Lacrosse is a fast-paced, hands-on sport that brings together teamwork, movement, strategy, and plenty of energy.</p></article>
              <article className="about-benefit"><span className="benefit-icon">04</span><h2>Enjoy Campus Life</h2><p>From practices and games to team hangouts and social activities, there are opportunities to make great college memories.</p></article>
            </section>
            <section className="about-details">
              <div className="about-detail-card"><span className="about-kicker">OUR HOME</span><h2>Slippery Rock University</h2><p>{team.school}</p><p>{team.location}</p><p>Season: {team.season}</p></div>
              <div className="about-detail-card"><span className="about-kicker">GET IN TOUCH</span><h2>Contact the Team</h2><p><strong>Shawn Murray</strong><br />Team President</p><a href="mailto:stm1013@sru.edu">stm1013@sru.edu</a><p>Questions about joining, practices, or the team? Reach out!</p></div>
              <div className="about-detail-card"><span className="about-kicker">SUPPORT THE ROCK</span><h2>Help Our Team Grow</h2><p>Support team activities and help make more opportunities possible for SRU men's club lacrosse.</p><button className="about-cta" onClick={() => navigate('Fundraising')}>Support the Team</button></div>
            </section>
          </div>
        )}
        {page === 'Fundraising' && (
          <section className="fundraising-page">
            <div className="fundraising-panel">
              <span className="about-kicker">SUPPORT SRU MEN'S CLUB LACROSSE</span>
              <h1>Help Us Keep the Game Growing.</h1>
              <p>Every contribution helps support the team's activities and the student-athletes who make SRU men's club lacrosse possible. Thank you for cheering us on!</p>
              <div className="fundraising-payment">
                <span className="fundraising-platform">VENMO</span>
                <h2>@Shawn-Murray-120</h2>
                <p>Venmo recipient: Shawn Murray</p>
                <a className="fundraising-link" href="https://venmo.com/u/Shawn-Murray-120" target="_blank" rel="noopener noreferrer">Open Venmo</a>
                <p className="fundraising-note">Before sending money, confirm the recipient and account details with the team president at <a href="mailto:stm1013@sru.edu">stm1013@sru.edu</a>. This is a team-provided Venmo handle, not a university payment portal.</p>
              </div>
            </div>
          </section>
        )}
        {page === 'Sign Up' && <SignUp />}
        {page === 'Player Profile' && (
        
  user ? (
    <PlayerProfile />
  ) : (
    <p>Please log in to access your player profile.</p>
  )
)}
        {page === 'Log In' && <LogIn />}
        {page === 'Admin Dashboard' && (
  isAdmin ? (
    <AdminDashboard onGamesChanged={loadGames} />
  ) : (
    <p>Administrator access required.</p>
  )
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
