import { NextResponse } from "next/server";

interface Team {
    teamName: string;
    teamCity: string;
    teamTricode: string;
  }
  
  interface Broadcaster {
    broadcasterDisplay: string;
  }
  
  interface Game {
    gameId: string;
    gameDateUTC: string;
    gameTimeUTC: string;
    gameDateTimeUTC: string;
    homeTeam: Team;
    awayTeam: Team;
    arenaName: string;
    arenaCity: string;
    broadcasters: {
      nationalBroadcasters: Broadcaster[];
    };
  }
  
  interface GameDate {
    games: Game[];
  }
  
  interface LeagueSchedule {
    gameDates: GameDate[];
  }
  
  interface ApiResponse {
    leagueSchedule: LeagueSchedule;
  }
  
  // Updated handler function
  export async function GET(req: Request) {
    try {
      const url = "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json";
      const { searchParams } = new URL(req.url);
      const team = searchParams.get("team"); // Get the team name from query params
  
      if (!team) {
        return NextResponse.json({ error: "Team name is required" }, { status: 400 });
      }
  
      // Fetch data from the NBA API
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
        },
      });
  
      if (!response.ok) {
        return NextResponse.json({ error: `Failed to fetch: ${response.statusText}` }, { status: response.status });
      }
  
      const data: ApiResponse = await response.json();
      const { leagueSchedule } = data;
      const { gameDates } = leagueSchedule;
  
      // Flatten games from all dates
      const allGames: Game[] = gameDates.flatMap((date: GameDate) => date.games);
  
      // Filter games for the specified team
      const filteredGames: Game[] = allGames.filter((game: Game) => {
        const homeTeam = game.homeTeam?.teamName?.toLowerCase();
        const awayTeam = game.awayTeam?.teamName?.toLowerCase();
  
        // Only include games if the team name is valid and matches
        return (
          (homeTeam && homeTeam === team.toLowerCase()) ||
          (awayTeam && awayTeam === team.toLowerCase())
        );
      });
  
      // Get the current time and compare
      const currentDate = new Date();
  
      // Filter games for the future and sort by the full date-time
      const upcomingGames: Game[] = filteredGames
        .filter((game: Game) => {
          const gameDateTime = new Date(game.gameDateTimeUTC); // Combined date-time
          return gameDateTime > currentDate; // Only future games
        })
        .sort((a: Game, b: Game) => {
          const dateA = new Date(a.gameDateTimeUTC).getTime();
          const dateB = new Date(b.gameDateTimeUTC).getTime();
          return dateA - dateB; // Sort by combined date-time in milliseconds
        })
        .slice(0, 5); // Get the next 5 games
  
      // Format the response
      const formattedGames = upcomingGames.map((game: Game) => {
        // Convert UTC times to local time
        const localGameDate = new Date(game.gameDateUTC).toLocaleDateString();
        const localGameTime = new Date(game.gameTimeUTC).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
  
        return {
          gameId: game.gameId,
          date: localGameDate, // Only date part
          time: localGameTime, // Local time
          homeTeam: {
            name: game.homeTeam.teamName,
            city: game.homeTeam.teamCity,
            tricode: game.homeTeam.teamTricode,
          },
          awayTeam: {
            name: game.awayTeam.teamName,
            city: game.awayTeam.teamCity,
            tricode: game.awayTeam.teamTricode,
          },
          arena: game.arenaName,
          city: game.arenaCity,
          broadcasters: game.broadcasters.nationalBroadcasters.map((b: Broadcaster) => b.broadcasterDisplay),
          localTime: `${localGameDate} ${localGameTime}`, // Combined local time
        };
      });
  
      return NextResponse.json({ team, games: formattedGames });
    } catch (error) {
      console.error("Error fetching NBA schedule:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }