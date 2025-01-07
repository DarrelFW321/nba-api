import { NextResponse } from 'next/server';

// Define types for the API response structure
interface ResultSet {
  name: string;
  headers: string[];
  rowSet: (string | number | null)[][];
}

interface NBAApiResponse {
  resultSets: ResultSet[];
}

interface CareerStats {
  [key: string]: string | number | null; // Using a dynamic key to handle any column name
}

export async function GET() {
  try {
    console.log('Handler started for LeBron James career totals...');

    // Fetching LeBron James' career stats from the NBA API
    const response = await fetch(
      'https://stats.nba.com/stats/playercareerstats?LeagueID=00&PerMode=Totals&PlayerID=2544',
      {
        headers: {
          Referer: 'https://www.nba.com/',
        },
      }
    );

    console.log('Data fetched from the NBA API for LeBron James...');
    if (!response.ok) {
      throw new Error(`NBA API returned status ${response.status}`);
    }

    // Parsing JSON response
    const data: NBAApiResponse = await response.json();
    console.log('Data parsed from the NBA API response...');

    // Extracting result set
    const resultSet = data.resultSets.find((set: ResultSet) => set.name === 'SeasonTotalsRegularSeason');
    if (!resultSet) {
      throw new Error('SeasonTotalsRegularSeason data not found in result sets.');
    }

    // Extracting career stats
    const headers = resultSet.headers;
    const rows = resultSet.rowSet;
    const careerTotals = rows.map((row: (string | number | null)[]) => {
      const record: CareerStats = {}; // Define the record type to handle dynamic keys
      headers.forEach((header: string, index: number) => {
        record[header] = row[index];
      });
      return record;
    });

    // Calculate total points across all seasons
    const totalPoints = careerTotals.reduce((sum: number, season: CareerStats) => sum + (season.PTS as number || 0), 0);

    // Sending response
    console.log('Response sent successfully.');
    return NextResponse.json({
      totalPoints,
    });
  } catch (error) {
    console.error('Error occurred:', error);

    // Sending error response
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || 'An unexpected error occurred.',
      },
      { status: 500 }
    );
  }
}