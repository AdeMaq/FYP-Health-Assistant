import React from 'react';
import { Sparkles, Brain, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const ModelSelector = ({ selectedModel, onChange }) => {
  const models = [
    {
      id: 'openai',
      name: 'OpenAI GPT-4',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Most accurate, detailed responses',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      icon: <Brain className="w-5 h-5" />,
      description: 'Fast, creative responses',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">AI Model:</span>
      </div>
      
      <div className="flex gap-2 mt-2">
        {models.map((model) => (
          <motion.button
            key={model.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(model.id)}
            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
              selectedModel === model.id
                ? `${model.bgColor} ${model.borderColor} ring-2 ring-offset-2 ring-opacity-50`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            style={{
              ringColor: model.color
            }}
          >
            <div className={`p-2 rounded-lg ${model.bgColor}`}>
              <div className={model.color}>
                {model.icon}
              </div>
            </div>
            
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${model.color}`}>
                  {model.name}
                </span>
                {selectedModel === model.id && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {model.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        {selectedModel === 'openai' 
          ? 'Using GPT-4 for detailed fitness advice' 
          : 'Using Gemini for creative workout ideas'}
      </div>
    </div>
  );
};

export default ModelSelector;