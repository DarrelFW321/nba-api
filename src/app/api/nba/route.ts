import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const PLAYER_URL = "https://www.basketball-reference.com/players/j/jamesle01.html"; // LeBron James' page

// Define types for the player profile
interface PlayerProfile {
  team: string;
}

export async function GET() {
  try {
    console.log("Fetching player profile from Basketball Reference...");

    // Fetch the HTML of the player profile page
    const response = await fetch(PLAYER_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch player profile: ${response.statusText}`);
    }

    // Load the HTML into Cheerio for parsing
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract the team name and get the last word
    const teamText = $("p:contains('Team') a").text().trim(); 
    const team = teamText.split(" ").pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? ""; 

    const playerProfile: PlayerProfile = {
      team,
    };

    console.log("Player team fetched successfully:", playerProfile);

    return NextResponse.json(playerProfile);
  } catch (error) {
    console.error("Error fetching player profile:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to fetch player profile. Please try again later." },
      { status: 500 }
    );
  }
}
