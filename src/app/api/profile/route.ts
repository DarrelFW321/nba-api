import { NextResponse } from "next/server";

const DATA_SOURCE_URL = "https://stats.nba.com/stats/commonplayerinfo?LeagueID=00&PlayerID=2544"; // LeBron James' PlayerID

// Define types for the API response
interface ResultSet {
  name: string;
  headers: string[]; // Array of column names (e.g., ["FIRST_NAME", "LAST_NAME"])
  rowSet: (string | number | null)[][]; // Array of rows (each row is an array of values)
}

interface NBAApiResponse {
  resultSets: ResultSet[];
}

// Create a mapped type for the PlayerProfile based on dynamic headers
type PlayerProfile = {
  [key: string]: string | number | null | undefined;
};

export async function GET() {
  try {
    console.log("Fetching player data...");

    const response = await fetch(DATA_SOURCE_URL, {
      headers: {
        Referer: "https://www.nba.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`NBA API returned status ${response.status}`);
    }

    // Parse the response with strict typing
    const data: NBAApiResponse = await response.json();

    // Find the relevant result set
    const playerInfo = data.resultSets.find(
      (set) => set.name === "CommonPlayerInfo"
    );

    if (!playerInfo) {
      throw new Error("Player info not found in API response.");
    }

    const playerStats = playerInfo.rowSet[0]; // Single row for player data
    const headers = playerInfo.headers;

    if (!playerStats || !headers) {
      throw new Error("Incomplete player data received from API.");
    }

    // Map headers to values to create the PlayerProfile object
    const playerData: PlayerProfile = headers.reduce((acc, header, index) => {
      acc[header] = playerStats[index] ?? null;
      return acc;
    }, {} as PlayerProfile);

    // Build cleaned response
    const cleanedData = {
      name: `${playerData.FIRST_NAME} ${playerData.LAST_NAME}`,
      team: playerData.TEAM_NAME,
      jersey: playerData.JERSEY,
      position: playerData.POSITION,
      ppg: playerData.PPG,
      rpg: playerData.RPG,
      apg: playerData.APG,
      pie: playerData.PIE,
      height: playerData.HEIGHT,
      weight: playerData.WEIGHT,
      country: playerData.COUNTRY,
      lastAttended: playerData.LAST_AFFILIATION,
      age: playerData.AGE,
      birthdate: playerData.BIRTHDATE,
      draft: playerData.DRAFT_YEAR
        ? `${playerData.DRAFT_YEAR} R${playerData.DRAFT_ROUND} Pick ${playerData.DRAFT_NUMBER}`
        : "Undrafted",
      experience: `${playerData.SEASON_EXP} Years`,
    };

    console.log("Player data fetched successfully:", cleanedData);

    return NextResponse.json(cleanedData);
  } catch (error) {
    console.error("Error fetching player data:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to fetch player data. Please try again later." },
      { status: 500 }
    );
  }
}
