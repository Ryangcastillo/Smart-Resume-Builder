// LM Provider Types and Interfaces
export interface LMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface LMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

export interface LMProvider {
  name: string;
  baseUrl: string;
  apiKey?: string;
  models: string[];
  defaultModel: string;

  generateCompletion(prompt: string, options?: LMOptions): Promise<LMResponse>;
  generateEmbedding?(text: string): Promise<number[]>;
  validateApiKey(): boolean;
}

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  models: string[];
  defaultModel: string;
}