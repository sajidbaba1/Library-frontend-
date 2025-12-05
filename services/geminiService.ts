import { GoogleGenAI, Type } from "@google/genai";
import { Role, Book, AIRecommendation } from '../types';

// In a real app, this key comes from process.env.API_KEY
// The prompt instructions state to use process.env.API_KEY directly in the constructor.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (role: Role, contextData?: string): string => {
  const baseInstruction = "You are a helpful, intelligent library assistant chatbot.";
  
  switch (role) {
    case 'admin':
      return `${baseInstruction} You are assisting the System Administrator. You can provide insights on user management, system analytics, and policy decisions. Keep answers concise and professional. Context: ${contextData || 'No specific context.'}`;
    case 'librarian':
      return `${baseInstruction} You are assisting a Librarian. Help them with cataloging strategies, book recommendations, and managing category approvals. You are knowledgeable about literature and library science. Context: ${contextData || 'No specific context.'}`;
    case 'student':
      return `${baseInstruction} You are assisting a Student. Help them find books, summarize topics, suggest reading materials based on their interests, and explain academic concepts found in the library books. be encouraging and educational. Context: ${contextData || 'No specific context.'}`;
    default:
      return baseInstruction;
  }
};

export const generateChatResponse = async (
  message: string,
  role: Role,
  contextData: string
): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash'; // Optimized for chat/text tasks
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: message,
      config: {
        systemInstruction: getSystemInstruction(role, contextData),
        temperature: 0.7,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am currently having trouble connecting to the library knowledge base. Please try again later.";
  }
};

export const getBookRecommendations = async (
  readBookTitles: string[],
  availableBooks: Book[]
): Promise<AIRecommendation[]> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    // Construct the context
    const readHistoryStr = readBookTitles.length > 0 
      ? readBookTitles.join(", ") 
      : "No reading history yet (recommend popular starter books)";
      
    // Create a catalog summary for the model
    const catalogStr = availableBooks.map(b => `ID: ${b.id}, Title: "${b.title}", Author: ${b.author}, Desc: ${b.description.substring(0, 50)}...`).join("\n");

    const prompt = `
      Based on the user's reading history: [${readHistoryStr}]
      
      And the following library catalog:
      ${catalogStr}
      
      Recommend exactly 3 books from the catalog that the user would enjoy. 
      If the history is empty, recommend 3 popular or diverse starter books from the catalog.
      
      Return the result as a strict JSON array where each object has:
      - 'bookId': matching the ID from the catalog exactly.
      - 'reason': a short, enthusiastic 1-sentence explanation of why they should read it.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              bookId: { type: Type.STRING },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as AIRecommendation[];
  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return [];
  }
};