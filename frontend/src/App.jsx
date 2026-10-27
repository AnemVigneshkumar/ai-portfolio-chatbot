import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI assistant powered by Gemini 3.8 Flash. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    setIsGenerating(true);

    // 1. Append user message and create an empty assistant message slot
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '' }
    ]);

    try {
      // 2. Call your FastAPI backend streaming endpoint
      const response = await fetch('https://ai-portfolio-chatbot-backend-jis5.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to backend server.');
      }

      // 3. Process the response stream line by line
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Update the last assistant message chunk by chunk
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + chunk,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error('Error during streaming:', error);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          role: 'assistant',
          content: 'Sorry, I encountered an error connecting to the backend server.',
        };
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <Bot size={24} color="#3b82f6" />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>AI Portfolio Assistant</h2>
        </div>
      </header>

      {/* Chat Area */}
      <main style={styles.chatContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageRow,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                ...styles.messageBubble,
                backgroundColor: msg.role === 'user' ? '#2563eb' : '#1e293b',
                color: msg.role === 'user' ? '#ffffff' : '#f8fafc',
              }}
            >
              <div style={styles.avatar}>
                {msg.role === 'user' ? (
                  <User size={16} color="#ffffff" />
                ) : (
                  <Bot size={16} color="#3b82f6" />
                )}
              </div>
              <div style={styles.messageContent}>
                {msg.content || (
                  <span style={{ opacity: 0.5, fontStyle: 'italic' }}>
                    Thinking...
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      {/* Input Form */}
      <footer style={styles.footer}>
        <form onSubmit={handleSend} style={styles.form}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isGenerating}
            style={styles.input}
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            style={{
              ...styles.sendButton,
              opacity: isGenerating || !input.trim() ? 0.5 : 1,
            }}
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  header: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #334155',
    backgroundColor: '#1e293b',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  chatContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    display: 'flex',
    gap: '0.75rem',
    maxWidth: '75%',
    padding: '0.85rem 1.15rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    wordBreak: 'break-word',
    lineHeight: '1.6',
    textAlign: 'left', // <-- FIXED: Ensures text aligns cleanly to the left
    alignItems: 'flex-start',
  },
  avatar: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '2px',
    flexShrink: 0, // <-- FIXED: Prevents icon from squishing
  },
  messageContent: {
    whiteSpace: 'pre-wrap',
    textAlign: 'left', // <-- FIXED: Left-aligns the message text
    flex: 1,
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #334155',
    backgroundColor: '#1e293b',
  },
  form: {
    display: 'flex',
    gap: '0.75rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  input: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
  },
  sendButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem 1.25rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};