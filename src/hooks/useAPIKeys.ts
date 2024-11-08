import { useState, useEffect } from 'react';
import { LLMConfig } from '../types';

export const useAPIKeys = () => {
  const [llmConfig, setLLMConfig] = useState<LLMConfig>(() => {
    const saved = localStorage.getItem('llmConfig');
    return saved ? JSON.parse(saved) : {
      openaiKey: '',
      groqKey: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('llmConfig', JSON.stringify(llmConfig));
  }, [llmConfig]);

  return [llmConfig, setLLMConfig] as const;
}; 