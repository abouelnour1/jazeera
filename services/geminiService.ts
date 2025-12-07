import { GoogleGenAI, Type } from "@google/genai";
import { DietAdvice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDietaryAdvice = async (condition: string): Promise<DietAdvice> => {
  try {
    const prompt = `
      Provide dietary advice for a patient suffering from: ${condition}.
      Return the response in Arabic language.
      Structure the response as a JSON object with:
      - condition: The name of the condition in Arabic.
      - allowedFoods: An array of strings listing recommended foods.
      - forbiddenFoods: An array of strings listing foods to avoid.
      - tips: An array of general lifestyle or eating tips.
      - disclaimer: A short medical disclaimer in Arabic stating this is AI-generated and not a doctor's replacement.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING },
            allowedFoods: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            forbiddenFoods: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            tips: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            disclaimer: { type: Type.STRING }
          },
          required: ["condition", "allowedFoods", "forbiddenFoods", "tips", "disclaimer"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DietAdvice;
    }
    
    throw new Error("No data returned from Gemini");

  } catch (error) {
    console.error("Error fetching diet advice:", error);
    throw error;
  }
};