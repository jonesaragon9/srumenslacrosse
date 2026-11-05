
export const team = {
  name: "SRU Men's Club Lacrosse",
  school: "Slippery Rock University",
  location: "Slippery Rock, Pennsylvania",
  season: "2026–2027",
  description:
    "Your home for SRU Men's Club Lacrosse news, schedules, scores, rosters, and player statistics."
};

export const games = [
  {
    id: 1,
    date: "2027-02-20",
    time: "1:00 PM",
    opponent: "Sample University A",
    location: "Home",
    status: "Upcoming",
    sruScore: null,
    opponentScore: null
  },
  {
    id: 2,
    date: "2027-03-06",
    time: "2:00 PM",
    opponent: "Sample University B",
    location: "Away",
    status: "Upcoming",
    sruScore: null,
    opponentScore: null
  },
  {
    id: 3,
    date: "2027-03-13",
    time: "12:00 PM",
    opponent: "Sample University C",
    location: "Home",
    status: "Upcoming",
    sruScore: null,
    opponentScore: null
  }
];

export const players = [
  {
    id: 1,
    number: 1,
    name: "Sample Player 1",
    position: "Attack",
    year: "Freshman",
    games: 0,
    goals: 0,
    assists: 0,
    groundBalls: 0
  },
  {
    id: 2,
    number: 7,
    name: "Sample Player 2",
    position: "Midfield",
    year: "Sophomore",
    games: 0,
    goals: 0,
    assists: 0,
    groundBalls: 0
  },
  {
    id: 3,
    number: 12,
    name: "Sample Player 3",
    position: "Defense",
    year: "Junior",
    games: 0,
    goals: 0,
    assists: 0,
    groundBalls: 0
  },
  {
    id: 4,
    number: 25,
    name: "Sample Player 4",
    position: "Goalie",
    year: "Senior",
    games: 0,
    goals: 0,
    assists: 0,
    groundBalls: 0
  }
];

export const standings = [
  {
    id: 1,
    team: "SRU Men's Club Lacrosse",
    wins: 0,
    losses: 0
  }
];

export const announcements = [
  {
    id: 1,
    title: "Welcome to SRU Men's Club Lacrosse",
    date: "2026-11-05",
    body: "Our new team website is currently under development. Official schedules, rosters, and announcements will be added once confirmed."
  }
];
