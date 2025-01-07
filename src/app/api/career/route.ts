import { NextResponse } from "next/server";

// Define types for the API response
interface ResultSet {
  name: string;
  headers: string[];
  rowSet: (string | number | null)[][];
}

interface NBAApiResponse {
  resultSets: ResultSet[];
}

// Define types for the cleaned data structure
interface CareerStats {
    [key: string]: number | null; // Index signature allowing dynamic keys
  }

interface CleanedData {
  regularSeason: CareerStats;
  postSeason: CareerStats;
}

const API_URL =
  "https://stats.nba.com/stats/playercareerstats?LeagueID=00&PerMode=Totals&PlayerID=2544"; // LeBron James' PlayerID

export async function GET() {
  try {
    console.log("Fetching player data...");

    // Fetch the data from the NBA Stats API
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Referer: "https://www.nba.com/",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch career totals: ${response.statusText}`);
    }

    // Parse the JSON response
    const data: NBAApiResponse = await response.json();

    // Extract result sets
    const regularSeasonSet = data.resultSets.find((set) => set.name === "CareerTotalsRegularSeason");
    const postseasonSet = data.resultSets.find((set) => set.name === "CareerTotalsPostSeason");

    if (!regularSeasonSet || !regularSeasonSet.rowSet[0]) {
      throw new Error("CareerTotalsRegularSeason data not found");
    }

    if (!postseasonSet || !postseasonSet.rowSet[0]) {
      throw new Error("CareerTotalsPostSeason data not found");
    }

    // Map headers to rowSet values for Regular Season
    const mapStats = (
      headers: string[],
      row: (string | number | null)[]
    ): CareerStats => {
      return headers.reduce((acc, header, index) => {
        acc[header as keyof CareerStats] = row[index] as number | null;
        return acc;
      }, {} as CareerStats);
    };

    const careerTotalsRegular = mapStats(regularSeasonSet.headers, regularSeasonSet.rowSet[0]);
    const careerTotalsPostSeason = mapStats(postseasonSet.headers, postseasonSet.rowSet[0]);

    // Clean up the data to match the desired structure
    const cleanedData: CleanedData = {
      regularSeason: {
        points: careerTotalsRegular.PTS,
        rebounds: careerTotalsRegular.REB,
        assists: careerTotalsRegular.AST,
        steals: careerTotalsRegular.STL,
        blocks: careerTotalsRegular.BLK,
        gamesPlayed: careerTotalsRegular.GP,
        fieldGoalPercentage: careerTotalsRegular.FG_PCT,
        threePointPercentage: careerTotalsRegular.FG3_PCT,
        freeThrowPercentage: careerTotalsRegular.FT_PCT,
        minutes: careerTotalsRegular.MIN,
      },
      postSeason: {
        points: careerTotalsPostSeason.PTS,
        rebounds: careerTotalsPostSeason.REB,
        assists: careerTotalsPostSeason.AST,
        steals: careerTotalsPostSeason.STL,
        blocks: careerTotalsPostSeason.BLK,
        gamesPlayed: careerTotalsPostSeason.GP,
        fieldGoalPercentage: careerTotalsPostSeason.FG_PCT,
        threePointPercentage: careerTotalsPostSeason.FG3_PCT,
        freeThrowPercentage: careerTotalsPostSeason.FT_PCT,
        minutes: careerTotalsPostSeason.MIN,
      },
    };

    console.log("Player data fetched successfully:", cleanedData);

    // Return the cleaned data with cache control headers
    return NextResponse.json(cleanedData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error fetching player data:", error);

    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
