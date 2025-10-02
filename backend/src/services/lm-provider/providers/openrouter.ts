import { LMProvider, LMResponse, LMOptions, ProviderConfig } from '../types';

export class OpenRouterProvider implements LMProvider {
  name = 'openrouter';
  baseUrl: string;
  apiKey?: string;
  models: string[];
  defaultModel: string;

  constructor(config: ProviderConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.models = config.models;
    this.defaultModel = config.defaultModel;
  }

  validateApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.startsWith('sk-or-'));
  }

  async generateCompletion(prompt: string, options?: LMOptions): Promise<LMResponse> {
    if (!this.validateApiKey()) {
      throw new Error('Invalid or missing OpenRouter API key');
    }

    const model = options?.model || this.defaultModel;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://smart-resume-builder.com',
          'X-Title': 'Smart Resume Builder',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume writer and ATS optimization specialist. Help users create professional, ATS-friendly resumes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1000,
          top_p: options?.topP ?? 1,
          frequency_penalty: options?.frequencyPenalty ?? 0,
          presence_penalty: options?.presencePenalty ?? 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        model: data.model,
        provider: this.name,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate completion with OpenRouter');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.validateApiKey()) {
      throw new Error('Invalid or missing OpenRouter API key');
    }

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/text-embedding-ada-002', // OpenRouter supports OpenAI embeddings
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter embedding API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0]?.embedding || [];
    } catch (error) {
      throw new Error('Failed to generate embedding with OpenRouter');
    }
  }
}