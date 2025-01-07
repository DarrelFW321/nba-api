import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'https://www.nbcsports.com/nba/lebron-james/9844/stats';

  try {
    // Fetch the HTML content of the page
    const { data } = await axios.get(url);
    
    // Load the HTML data into Cheerio
    const $ = cheerio.load(data);
    
    // Find the last row in the <tfoot> section
    const statsRow = $('tfoot tr').last();

    // Extract the stats from each column in the row
    const stats = {
      games: statsRow.find('td').eq(2).text().trim(), // G
      minutes: statsRow.find('td').eq(3).text().trim(), // MIN
      points: statsRow.find('td').eq(4).text().trim(), // PTS
      rebounds: statsRow.find('td').eq(5).text().trim(), // REB
      offensiveRebounds: statsRow.find('td').eq(6).text().trim(), // OREB
      assists: statsRow.find('td').eq(7).text().trim(), // AST
      steals: statsRow.find('td').eq(8).text().trim(), // STL
      blocks: statsRow.find('td').eq(9).text().trim(), // BLK
      fouls: statsRow.find('td').eq(10).text().trim(), // PF
      turnovers: statsRow.find('td').eq(11).text().trim(), // TO
      fieldGoalsMade: statsRow.find('td').eq(12).text().trim(), // FGM
      fieldGoalsAttempted: statsRow.find('td').eq(13).text().trim(), // FGA
      fieldGoalPercentage: statsRow.find('td').eq(14).text().trim(), // FG%
      threePointersMade: statsRow.find('td').eq(15).text().trim(), // 3PTM
      threePointersAttempted: statsRow.find('td').eq(16).text().trim(), // 3PTA
      threePointPercentage: statsRow.find('td').eq(17).text().trim(), // 3PT%
      freeThrowsMade: statsRow.find('td').eq(18).text().trim(), // FTM
      freeThrowsAttempted: statsRow.find('td').eq(19).text().trim(), // FTA
      freeThrowPercentage: statsRow.find('td').eq(20).text().trim(), // FT%
    };

    // Return the extracted stats as a JSON response
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
