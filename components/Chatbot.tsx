import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, ChatMessage, ThemeColor } from '../types';
import { generateChatResponse } from '../services/geminiService';

interface ChatbotProps {
  role: Role;
  contextData: string;
  themeColor: ThemeColor;
}

export const Chatbot: React.FC<ChatbotProps> = ({ role, contextData, themeColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: `Hello! I'm your ${role} assistant. How can I help you today?` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    const loadingId = Date.now().toString() + '-load';
    setMessages(prev => [...prev, { id: loadingId, sender: 'ai', text: '', isLoading: true }]);

    try {
      const responseText = await generateChatResponse(userMsg.text, role, contextData);
      
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: responseText
      }]);
    } catch (error) {
        setMessages(prev => prev.filter(m => m.id !== loadingId));
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700"
          >
            {/* Header */}
            <div className={`bg-${themeColor}-600 p-4 flex justify-between items-center text-white`}>
              <div className="flex items-center gap-2">
                <Bot size={24} />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.sender === 'user'
                        ? `bg-${themeColor}-600 text-white rounded-br-none`
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700 rounded-bl-none'
                    }`}
                  >
                    {msg.isLoading ? (
                      <div className="flex items-center gap-2">
                         <Loader2 className="animate-spin w-4 h-4" />
                         <span>Thinking...</span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSend}
                  className={`bg-${themeColor}-600 text-white p-2 rounded-lg hover:bg-${themeColor}-700 transition-colors disabled:opacity-50`}
                  disabled={!inputValue.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-${themeColor}-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-${themeColor}-700 transition-colors`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </>
  );
};