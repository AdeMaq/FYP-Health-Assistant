import React, { useState, useEffect } from 'react';
import { Dumbbell, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from './components/ChatInterface';
import { chatAPI } from './services/api';
import './styles.css';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Check API connection
    const checkConnection = async () => {
      try {
        const health = await chatAPI.healthCheck();
        setConnectionStatus(health.status === 'healthy' ? 'connected' : 'error');
      } catch (error) {
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    // Hide welcome message after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const ConnectionStatus = () => {
    const statusConfig = {
      checking: {
        icon: <Dumbbell className="w-4 h-4 animate-spin" />,
        text: 'Connecting to FitBot...',
        color: 'text-amber-500',
        bg: 'bg-amber-50'
      },
      connected: {
        icon: <Wifi className="w-4 h-4" />,
        text: 'Connected to FitBot',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50'
      },
      disconnected: {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'Disconnected from server',
        color: 'text-red-500',
        bg: 'bg-red-50'
      },
      error: {
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Server error',
        color: 'text-red-500',
        bg: 'bg-red-50'
      }
    };

    const config = statusConfig[connectionStatus] || statusConfig.checking;

    return (
      <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full ${config.bg} border border-opacity-30 border-current`}>
        <div className={config.color}>
          {config.icon}
        </div>
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <ConnectionStatus />
      
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center mb-6">
                  <Dumbbell className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome to FitBot
                </h1>
                <p className="text-gray-600 mb-6">
                  Your AI-powered fitness coach. Get personalized workout plans, diet advice, and fitness tips.
                </p>
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-600 font-semibold">1</span>
                    </div>
                    <span className="text-gray-700">Ask any fitness question</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">2</span>
                    </div>
                    <span className="text-gray-700">Get personalized AI advice</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">3</span>
                    </div>
                    <span className="text-gray-700">Watch workout videos</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowWelcome(false)}
                  className="mt-8 w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all"
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        <ChatInterface />
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800">FitBot AI Coach</span>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">v1.0</span>
          </div>
          <div className="text-sm text-gray-500 text-center md:text-right">
            <p>Powered by OpenAI GPT-4 & Google Gemini • YouTube workout videos</p>
            <p className="mt-1">For educational purposes only. Consult professionals for medical advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;