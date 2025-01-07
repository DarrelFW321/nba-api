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

    // Extract Career Stats (last row in <tfoot>)
    const careerStatsRow = $('tfoot tr').last();

    const careerStats = {
      games: careerStatsRow.find('td').eq(2).text().trim(), // G
      minutes: careerStatsRow.find('td').eq(3).text().trim(), // MIN
      points: careerStatsRow.find('td').eq(4).text().trim(), // PTS
      rebounds: careerStatsRow.find('td').eq(5).text().trim(), // REB
      offensiveRebounds: careerStatsRow.find('td').eq(6).text().trim(), // OREB
      assists: careerStatsRow.find('td').eq(7).text().trim(), // AST
      steals: careerStatsRow.find('td').eq(8).text().trim(), // STL
      blocks: careerStatsRow.find('td').eq(9).text().trim(), // BLK
      fouls: careerStatsRow.find('td').eq(10).text().trim(), // PF
      turnovers: careerStatsRow.find('td').eq(11).text().trim(), // TO
      fieldGoalsMade: careerStatsRow.find('td').eq(12).text().trim(), // FGM
      fieldGoalsAttempted: careerStatsRow.find('td').eq(13).text().trim(), // FGA
      fieldGoalPercentage: careerStatsRow.find('td').eq(14).text().trim(), // FG%
      threePointersMade: careerStatsRow.find('td').eq(15).text().trim(), // 3PTM
      threePointersAttempted: careerStatsRow.find('td').eq(16).text().trim(), // 3PTA
      threePointPercentage: careerStatsRow.find('td').eq(17).text().trim(), // 3PT%
      freeThrowsMade: careerStatsRow.find('td').eq(18).text().trim(), // FTM
      freeThrowsAttempted: careerStatsRow.find('td').eq(19).text().trim(), // FTA
      freeThrowPercentage: careerStatsRow.find('td').eq(20).text().trim(), // FT%
    };

    // Extract Current Season Stats (second row in <tfoot>)
    const currentSeasonStatsRow = $('tfoot tr').eq(1); // Second row

    const currentSeasonStats = {
      games: currentSeasonStatsRow.find('td').eq(2).text().trim(), // G
      minutes: currentSeasonStatsRow.find('td').eq(3).text().trim(), // MIN
      points: currentSeasonStatsRow.find('td').eq(4).text().trim(), // PTS
      rebounds: currentSeasonStatsRow.find('td').eq(5).text().trim(), // REB
      offensiveRebounds: currentSeasonStatsRow.find('td').eq(6).text().trim(), // OREB
      assists: currentSeasonStatsRow.find('td').eq(7).text().trim(), // AST
      steals: currentSeasonStatsRow.find('td').eq(8).text().trim(), // STL
      blocks: currentSeasonStatsRow.find('td').eq(9).text().trim(), // BLK
      fouls: currentSeasonStatsRow.find('td').eq(10).text().trim(), // PF
      turnovers: currentSeasonStatsRow.find('td').eq(11).text().trim(), // TO
      fieldGoalsMade: currentSeasonStatsRow.find('td').eq(12).text().trim(), // FGM
      fieldGoalsAttempted: currentSeasonStatsRow.find('td').eq(13).text().trim(), // FGA
      fieldGoalPercentage: currentSeasonStatsRow.find('td').eq(14).text().trim(), // FG%
      threePointersMade: currentSeasonStatsRow.find('td').eq(15).text().trim(), // 3PTM
      threePointersAttempted: currentSeasonStatsRow.find('td').eq(16).text().trim(), // 3PTA
      threePointPercentage: currentSeasonStatsRow.find('td').eq(17).text().trim(), // 3PT%
      freeThrowsMade: currentSeasonStatsRow.find('td').eq(18).text().trim(), // FTM
      freeThrowsAttempted: currentSeasonStatsRow.find('td').eq(19).text().trim(), // FTA
      freeThrowPercentage: currentSeasonStatsRow.find('td').eq(20).text().trim(), // FT%
    };

    // Return the extracted stats as a JSON response
    return NextResponse.json({
      careerStats,
      currentSeasonStats
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
