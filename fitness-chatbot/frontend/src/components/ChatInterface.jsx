import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Video, 
  Dumbbell, 
  Apple, 
  Sparkles, 
  Bot, 
  User,
  Clock,
  TrendingUp,
  Heart,
  Shuffle,
  BookOpen,
  Youtube,
  ChevronRight,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { chatAPI, websocketService } from '../services/api';
import ModelSelector from './ModelSelector';
import VideoPlayer from './VideoPlayer';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hello! I'm your AI fitness coach. I can help you with workout plans, diet advice, and fitness tips. What would you like to know? 💪",
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai');
  const [showVideos, setShowVideos] = useState(true);
  const [websocket, setWebsocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Quick action buttons
  const quickActions = [
    {
      id: 1,
      label: 'Workout Plan',
      icon: <Dumbbell className="w-5 h-5" />,
      query: 'Create a 4-week full body workout plan for beginners',
      color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
    },
    {
      id: 2,
      label: 'Diet Advice',
      icon: <Apple className="w-5 h-5" />,
      query: 'Suggest a high-protein vegetarian diet for muscle gain',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      id: 3,
      label: 'Fat Loss',
      icon: <TrendingUp className="w-5 h-5" />,
      query: 'How can I lose belly fat effectively?',
      color: 'bg-amber-100 text-amber-700 hover:bg-amber-200'
    },
    {
      id: 4,
      label: 'Recovery Tips',
      icon: <Heart className="w-5 h-5" />,
      query: 'What are the best recovery methods after intense workout?',
      color: 'bg-rose-100 text-rose-700 hover:bg-rose-200'
    }
  ];

  // Send message function
  const sendMessage = async (content = input) => {
    if (!content.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      content,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setTyping(true);

    try {
      const response = await chatAPI.sendMessage(content, selectedModel, showVideos);
      
      const botMessage = {
        id: messages.length + 2,
        content: response.response,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
        model: response.model_used,
        questionType: response.question_type,
        youtubeVideos: response.youtube_videos
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        isUser: false,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTyping(false);
    }
  };

  // Handle quick action click
  const handleQuickAction = (query) => {
    setInput(query);
    setTimeout(() => {
      sendMessage(query);
    }, 100);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Copy message to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Render message content
  const renderMessageContent = (message) => {
    if (message.type === 'error') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-500 text-sm">!</span>
            </div>
            <span className="font-semibold">Error</span>
          </div>
          {message.content}
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-xl font-bold text-gray-800 mt-4 mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-700 mt-3 mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="font-medium text-gray-600 mt-2 mb-1">{children}</h3>,
            p: ({ children }) => <p className="mb-2 text-gray-700 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-gray-700">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
            em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
            code: ({ children }) => <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono">{children}</code>,
            pre: ({ children }) => (
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm my-3">
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-gray-600 my-3">
                {children}
              </blockquote>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>

        {/* Render YouTube videos if available */}
        {message.youtubeVideos && message.youtubeVideos.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Youtube className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-700">Related Workout Videos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {message.youtubeVideos.slice(0, 2).map((video, index) => (
                <VideoPlayer key={index} video={video} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">FitBot AI Coach</h1>
              <p className="text-sm text-gray-500">Your personal fitness assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ModelSelector selectedModel={selectedModel} onChange={setSelectedModel} />
            <button
              onClick={() => setShowVideos(!showVideos)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showVideos 
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Video className="w-4 h-4" />
              <span className="text-sm font-medium">Videos {showVideos ? 'On' : 'Off'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar with Quick Actions */}
        <div className="hidden md:flex w-64 bg-white border-r border-gray-200 p-6 flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction(action.query)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${action.color}`}
                >
                  {action.icon}
                  <span className="font-medium text-left flex-1">{action.label}</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">Pro Tip</h3>
              </div>
              <p className="text-sm opacity-90">
                Stay hydrated! Drink at least 3-4 liters of water daily for optimal performance.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 ${message.isUser ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser 
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500' 
                      : 'bg-gradient-to-r from-gray-200 to-gray-300'
                  }`}>
                    {message.isUser ? (
                      <User className="w-5 h-5 text-white" />
                    ) : message.model === 'gemini' ? (
                      <Bot className="w-5 h-5 text-gray-700" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-gray-700" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 max-w-3xl ${message.isUser ? 'items-end' : ''}`}>
                    <div className={`p-4 rounded-2xl ${message.isUser ? 'user-message' : 'bot-message'}`}>
                      {renderMessageContent(message)}
                      
                      {/* Message Footer */}
                      <div className={`flex items-center justify-between mt-3 pt-3 border-t ${
                        message.isUser ? 'border-emerald-200' : 'border-gray-100'
                      }`}>
                        <div className="flex items-center gap-2 text-xs opacity-70">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(message.timestamp)}</span>
                          {!message.isUser && message.model && (
                            <>
                              <span>•</span>
                              <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                {message.model === 'gemini' ? 'Gemini' : 'GPT-4'}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {!message.isUser && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => copyToClipboard(message.content)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Helpful"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-gray-700" />
                </div>
                <div className="p-4 rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-500">FitBot is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6">
            <div className="max-w-3xl mx-auto">
              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm text-gray-500 mr-2">Try asking:</span>
                {[
                  'Home workout without equipment',
                  'Meal prep for weight loss',
                  'Knee-friendly exercises',
                  'Build muscle fast'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Input Container */}
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about workouts, diet, or fitness tips..."
                  className="w-full px-5 py-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  rows="2"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors ${
                    !input.trim() || isLoading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600'
                  }`}
                >
                  <Send className={`w-5 h-5 ${!input.trim() || isLoading ? 'text-gray-500' : 'text-white'}`} />
                </motion.button>
              </div>
              
              {/* Input Footer */}
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Powered by {selectedModel === 'gemini' ? 'Google Gemini' : 'OpenAI GPT-4'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    Videos: {showVideos ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <span>Press Enter to send • Shift+Enter for new line</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;