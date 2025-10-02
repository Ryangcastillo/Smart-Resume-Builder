// LM Provider System - Main Export
export { LMProviderFactory } from './factory';
export { OpenRouterProvider } from './providers/openrouter';
export { OpenAIProvider } from './providers/openai';
export type { LMProvider, LMResponse, LMOptions, ProviderConfig } from './types';

// Convenience function for quick access
export const getLMProvider = () => LMProviderFactory.getCurrentProvider();
export const generateWithLM = (prompt: string, options?: any) =>
  LMProviderFactory.generateWithFallback(prompt, options);