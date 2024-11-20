import React, { useState, useRef, useEffect } from 'react';
import './Home.css';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTasks } from '../api/api';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [theme, setTheme] = useState('dark');
  const chatContainerRef = useRef(null);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullText = "Evaluate language agents for data-driven scientific discovery";
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTasks, setSidebarTasks] = useState([]);
  const navigate = useNavigate();
  const [isFirstVisit] = useState(() => !sessionStorage.getItem('hasVisitedBefore'));

  // Effect for typing animation
  useEffect(() => {
    if (!isFirstVisit) {
      setTypedText(fullText);
      setIsTypingDone(true);
      return;
    }

    const timeout = setTimeout(() => {
      if (typedText.length < fullText.length) {
        setTypedText(fullText.slice(0, typedText.length + 1));
      } else {
        setIsTypingDone(true);
        sessionStorage.setItem('hasVisitedBefore', 'true');
      }
    }, 30);

    return () => clearTimeout(timeout);
  }, [typedText, isFirstVisit, fullText]);


  // Effect for sidebar tasks
  useEffect(() => {
    fetchTasks()
    .then((response) => {
        const allTasks = response.data;
        const domains = [...new Set(allTasks.map(task => task.domain))];

         // Get one random task from each domain (up to 4)
         const selectedTasks = domains.slice(0, 4).map(domain => {
            const domainTasks = allTasks.filter(task => task.domain === domain);
            return domainTasks[Math.floor(Math.random() * domainTasks.length)];
          });
          setSidebarTasks(selectedTasks);
    })
    .catch((error) => {
      console.error('Error fetching tasks:', error);
    });
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    // Add user message
    const newMessage = {
      type: 'user',
      content: inputMessage
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    
    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botMessage = {
        type: 'bot',
        content: 'This is a simulated response. Replace with actual API integration.'
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
    }
  };

  const handleViewExamples = () => {
    setShowSidebar(prev => !prev);
  };

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  const handleViewGallery = () => {
    navigate('/gallery');
  };

  return (
    <div className="home-container">
      {/* Toggle Button */}
      <div className="sidebar-container">
        <motion.aside 
          className="sidebar"
          initial={{ x: -260 }}
          animate={{ x: showSidebar ? 0 : -260 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="sidebar-header">
            <button className="new-chat">Add Task</button>
          </div>
          <div className="sidebar-tasks">
            <AnimatePresence mode="popLayout">
              {sidebarTasks.map((task, index) => (
                <motion.div
                  key={task.instance_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.1 
                  }}
                >
                  <Link to={`/tasks/${task.instance_id}`}>
                    <div className="sidebar-task-card">
                      <span className="task-badge" data-domain={task.domain}>
                        {task.domain}
                      </span>
                      <div className="task-content">
                        <p>{task.task_inst}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.aside>
        
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          data-open={showSidebar}
        >
        </button>
      </div>

      {/* Modified Main Content */}
      <main 
        className="main-content"
        style={{
          marginLeft: showSidebar ? '260px' : '0',
          width: showSidebar ? 'calc(100% - 260px)' : '100%'
        }}
      >
        {/* Messages Container */}
        <div className="messages-container">
          <div className="chat-container" ref={chatContainerRef}>
            {messages.length === 0 ? (
              <motion.div 
                className="welcome-screen no-scroll"
                initial={isFirstVisit ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: isFirstVisit ? 0.8 : 0 }}
              >
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Welcome to ScienceAgent Bench
                </motion.h1>
                <div className="typing-container">
                  <motion.p
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="typing-text">
                      {typedText}
                    </span>
                  </motion.p>
                  {!isTypingDone && (
                    <motion.div
                      className="cursor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </div>
                <motion.div 
                  className="welcome-buttons"
                  initial={isFirstVisit ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: isFirstVisit ? 0.5 : 0, 
                    delay: isFirstVisit ? 3 : 0  // Only delay on first visit
                  }}
                >
                  <button className="start-button">New Task</button>
                  <button 
                    className="example-button"
                    onClick={handleViewGallery}
                  >
                    View More Examples
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`message ${message.type}`}>
                  <div className="message-content">
                    <span className="avatar">
                      {message.type === 'user' ? '👤' : '🤖'}
                    </span>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Input Area */}
        <div className="chat-footer">
          <form onSubmit={handleSendMessage} className="chat-form">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <div className="chat-controls">
              <button type="submit">Send</button>
              <button type="button" onClick={toggleTheme}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button type="button" onClick={clearChat}>🗑️</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Home;