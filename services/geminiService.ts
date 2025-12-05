import { GoogleGenAI } from "@google/genai";
import { Role } from '../types';

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