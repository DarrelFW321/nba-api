import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const PLAYER_URL = "https://www.basketball-reference.com/players/j/jamesle01.html"; // LeBron James' page

// Define types for the player profile
interface PlayerProfile {
  name: string;
  team: string;
  position: string;
  height: string;
  weight: string;
  height_metric: string;
  weight_metric: string;
  country: string;
  birthdate: string;
  draft: string;
  experience: string;
  shootingHand: string;
  lastAttended: string;
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

    // Extract required data using Cheerio selectors
    const name = $("h1 span").text().trim(); // LeBron James

    // Extract position and clean up extra spaces (removes "▪ Shoots")
    const positionText = $("p:contains('Position')").text().split(":")[1]?.trim() ?? "";
    const position = positionText.replace(/\s+/g, " ").replace('▪ Shoots', '').trim();

    // Dynamically extract height and weight from the p tag
    const heightWeightText = $("p:contains('Position') + p").text().trim(); // This is the paragraph after "Position"
    
    // Dynamically extract height (in format 6-9) and weight (in format 250lb)
    const heightMatch = heightWeightText.match(/(\d{1,2}-\d{1,2})/); // For height like "6-9"
    const weightMatch = heightWeightText.match(/(\d{3}lb)/); // For weight like "250lb"

    const height = heightMatch ? heightMatch[0].replace(/\s+/g, ' ') : "";
    const weight = weightMatch ? weightMatch[0].replace(/\s+/g, ' ') : "";

    // Extract metric values from the text in parentheses (e.g., "206cm, 113kg")
    const metricMatch = heightWeightText.match(/\((\d{3}cm),\s*(\d{3}kg)\)/);
    const height_metric = metricMatch ? metricMatch[1] : "";
    const weight_metric = metricMatch ? metricMatch[2] : "";

    // Extract other information
    const team = $("p:contains('Team') a").text().trim(); // Los Angeles Lakers
    const country = $("p:contains('Born') span").last().text().trim(); // Country
    const birthdate = $("p:contains('Born') span").first().text().trim().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(); // Clean up newline and extra spaces
    const draftText = $("p:contains('Draft')").text().split(":")[1]?.trim() ?? "Undrafted"; // Draft info

    // Fix the draft dynamic part
    const draft = draftText.replace(/LeBron James was drafted by.*/i, "").trim();
    const draftDynamic = `LeBron James was drafted by ${name}`;

    const finalDraft = draft ? `${draft}, ${draftDynamic}` : draftDynamic; // Combine cleaned draft text with dynamic name if needed
    const experience = $("p:contains('Experience')").text().split(":")[1]?.trim() ?? ""; // Experience
    
    // Add shooting hand info (assumed from "Shoots" text)
    const shootingHand = $("p:contains('Shoots')").text().includes("Right") ? "Right Handed" : "Left Handed";

    // Extract last attended (High School)
    const lastAttended = $("p:contains('High School')").text().split(":")[1]?.trim() ?? "";

    // Clean up and format the data properly
    const playerProfile: PlayerProfile = {
      name,
      team,
      position,
      height,
      weight,
      height_metric,
      weight_metric,
      country,
      birthdate,
      draft: finalDraft,
      experience,
      shootingHand,
      lastAttended,
    };

    console.log("Player profile fetched successfully:", playerProfile);

    return NextResponse.json(playerProfile);
  } catch (error) {
    console.error("Error fetching player profile:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to fetch player profile. Please try again later." },
      { status: 500 }
    );
  }
}
