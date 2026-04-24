import { GoogleGenAI } from "@google/genai";

// Initialize the Google Gen AI SDK
// The API key is securely injected by the AI Studio environment
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface PostIdea {
  id: string;
  date: string;
  topic: string;
  caption: string;
  imagePrompt: string;
  status: 'scheduled' | 'published' | 'draft';
}

export async function generateContentCalendar(startDate: Date): Promise<PostIdea[]> {
  const prompt = `
You are an expert AI social media manager for "Aura", a minimal modern home real estate development brand based in Nashik, India.
The brand focuses on sustainable, low-maintenance, and high-quality living spaces.
Generate a 7-day Instagram content calendar starting from ${startDate.toISOString().split('T')[0]}.
Focus on these themes: new technology in world real estate, architecture, building materials, sustainable living in Nashik, minimal design.

Return ONLY a valid JSON array of objects. Each object must have exactly these keys:
- "topic": Short title of the post (String)
- "caption": The engaging Instagram caption, including relevant hashtags. Make it sound professional, minimal, and modern. (String)
- "imagePrompt": A highly detailed prompt for an AI image generator to create the accompanying visual. Describe a realistic, minimal architectural photo. (String)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonText = response.text.trim();
    if (jsonText.startsWith('```json')) jsonText = jsonText.replace(/^```json/, '');
    if (jsonText.startsWith('```')) jsonText = jsonText.replace(/^```/, '');
    if (jsonText.endsWith('```')) jsonText = jsonText.replace(/```$/, '');
    jsonText = jsonText.trim();
    const data = JSON.parse(jsonText);
    
    // Map to our PostIdea type
    return data.map((item: any, index: number) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      
      return {
        id: `post-${Date.now()}-${index}`,
        date: date.toISOString().split('T')[0],
        topic: item.topic,
        caption: item.caption,
        imagePrompt: item.imagePrompt,
        status: 'draft'
      };
    });
  } catch (error) {
    console.error("Failed to generate content calendar:", error);
    throw error;
  }
}

export async function generateMarketInsights(): Promise<string[]> {
  const prompt = `
You are a real estate and architecture AI analyst focusing on the Nashik market and global sustainable trends.
Provide 3 bullet points on current trends in sustainable, low-maintenance modern architecture and building materials that a minimal real estate brand in Nashik should leverage in their marketing.
Provide ONLY a valid JSON array of 3 strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonText = response.text.trim();
    if (jsonText.startsWith('```json')) jsonText = jsonText.replace(/^```json/, '');
    if (jsonText.startsWith('```')) jsonText = jsonText.replace(/^```/, '');
    if (jsonText.endsWith('```')) jsonText = jsonText.replace(/```$/, '');
    jsonText = jsonText.trim();
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to generate market insights:", error);
    return [
      "No data available right now."
    ];
  }
}
