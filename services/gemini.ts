
import { GoogleGenAI, Type } from "@google/genai";
import { Product, StyleProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFashionAdvice(query: string, context?: {
  userStylePreference?: string;
  weather?: string;
  location?: string;
  currentProduct?: string;
}) {
  try {
    const systemPrompt = `You are a world-class fashion concierge and stylist for "GS - Global Style Collective". 
    Your tone is sophisticated, editorial, and helpful. 
    Current Trends: Minimalism, 90s heritage revival, sustainable luxury, and technical sportswear.
    
    Context:
    - User Preference: ${context?.userStylePreference || 'Neutral/Versatile'}
    - Current Location/Weather: ${context?.weather || 'Indoor/Climate Controlled'}
    - Shared Product: ${context?.currentProduct || 'None'}

    Provide expert advice in max 3 sentences. Use industry terms (e.g., "silhouette", "palette", "texture"). 
    If a product is shared, suggest 2 other item types (e.g., "pair this with a leather boot and a structured blazer") that would complete the look.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${systemPrompt}\n\nUser Question: ${query}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Styling Error:", error);
    return "My styling database is currently updating. However, one can never go wrong with a crisp white tee and well-fitted indigo denim.";
  }
}

export async function getRelatedPairings(
  currentProduct: Product,
  catalog: Product[],
  styleProfile?: StyleProfile
) {
  try {
    const catalogSummary = catalog
      .filter(p => p.id !== currentProduct.id)
      .map(p => ({ id: p.id, name: p.name, category: p.category, subcategory: p.subcategory }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Current Product: ${JSON.stringify({
        name: currentProduct.name,
        category: currentProduct.category,
        subcategory: currentProduct.subcategory,
        description: currentProduct.description
      })}
      User Style Profile: ${JSON.stringify(styleProfile || 'Standard')}
      Catalog: ${JSON.stringify(catalogSummary)}
      
      Tasks:
      1. Select exactly 4 product IDs from the Catalog that would perfectly complement the Current Product to form a complete, stylish outfit.
      2. Provide a short editorial "styling reason" for this specific curated set.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 4 product IDs from the catalog."
            },
            stylingReason: {
              type: Type.STRING,
              description: "A short, sophisticated explanation of why these items were paired together."
            }
          },
          required: ["recommendedIds", "stylingReason"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Pairing Error:", error);
    return null;
  }
}
