import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI | null => {
  if (!genAI && process.env.API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const askAlmanac = async (query: string, currentSeason: string, day: number): Promise<string> => {
  const client = getAIClient();
  if (!client) {
    return "The spirits of the Almanac are silent (API Key missing).";
  }

  try {
    const prompt = `
      You are the spirit of the Ancient Almanac in a farming RPG. 
      The player is asking: "${query}".
      Current game context: Season: ${currentSeason}, Day: ${day}.
      
      Keep the answer short, whimsical, and helpful. Use markdown. 
      If they ask about gameplay, explain that:
      - Hoes till soil.
      - Water makes crops grow overnight.
      - Turnips take 2 days, Corn takes 4.
      - Crops die if not watered for 3 days.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "The pages are blurry...";
  } catch (error) {
    console.error("Almanac Error:", error);
    return "The ink has faded (Network Error).";
  }
};
