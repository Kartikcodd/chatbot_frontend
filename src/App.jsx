import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // We will style it with App.css

// An icon for the send button (same as before)
const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/>
  </svg>
);

// Main App Component

const App = () => {
  // These are 3 state values which return the array of current value and function to update it
  const [messages, setMessages] = useState([
    { text: "Hello! I am your personal AI assistant, powered by Google. How can I help?", sender: "bot" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const chatWindowRef = useRef(null);

  // Automatically scroll down when new messages are added
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);


  // we using this handleSend function to the send button-->

  const handleSend = async () => {

    // 1. Don't do anything if the input is empty or if we're already waiting for the bot.
    if (!input.trim() || isLoading) return;

    // 2. Create the user's message object.
    const userMessage = { text: input, sender: 'user' };

// 3. Add the user's message to the chat window immediately for a responsive feel.
    setMessages(prev => [...prev, userMessage]);


    const currentInput = input; // Capture input before clearing it

    //clean the input
    setInput('');

        // 5. Turn on the "typing..." indicator.

    setIsLoading(true);

     // 6. Start the backend communication.

    try {
      // The backend URL is the same
      const response = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: currentInput }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.generatedText, sender: 'bot' }]);

    } catch (error) {
      console.error("Failed to fetch from backend:", error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
        {/* The main chat area */}
      <div className="chat-window" ref={chatWindowRef}>
         {/* We map over the `messages` array to display each message */}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}

        {/* This is a conditional render: only show the typing indicator if `isLoading` is true */}
        {isLoading && (
          <div className="message bot typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={!input.trim() || isLoading}>
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

export default App;