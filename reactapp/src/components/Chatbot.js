// src/components/Chatbot.js

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiMessageSquare } from 'react-icons/fi';

export const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! How can I help you book an appointment today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    const botResponse = { from: 'bot', text: "It is under development... we will update that later." };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-20 right-5 w-80 h-[28rem] bg-white rounded-2xl shadow-2xl border flex flex-col z-50"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl">
            <h3 className="font-bold flex items-center gap-2"><FiMessageSquare /> AI Assistant</h3>
            <button onClick={onClose} className="hover:opacity-75"><FiX size={20} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`max-w-xs text-sm px-3 py-2 rounded-xl ${msg.from === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {msg.text}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="submit" className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-all">
                <FiSend />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
