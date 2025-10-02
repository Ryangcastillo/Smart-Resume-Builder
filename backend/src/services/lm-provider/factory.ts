import { LMProvider, ProviderConfig } from './types';
import { OpenRouterProvider } from './providers/openrouter';
import { OpenAIProvider } from './providers/openai';
import { config } from '../../config';

export class LMProviderFactory {
  private static providers = new Map<string, LMProvider>();
  private static currentProvider: LMProvider | null = null;

  /**
   * Get or create a provider instance
   */
  static getProvider(providerName?: string): LMProvider {
    const name = providerName || config.lmProviders.primary.provider;

    if (this.providers.has(name)) {
      return this.providers.get(name)!;
    }

    const provider = this.createProvider(name);
    this.providers.set(name, provider);
    return provider;
  }

  /**
   * Get the current active provider
   */
  static getCurrentProvider(): LMProvider {
    if (!this.currentProvider) {
      this.currentProvider = this.getProvider();
    }
    return this.currentProvider;
  }

  /**
   * Switch to a different provider
   */
  static switchProvider(providerName: string): LMProvider {
    this.currentProvider = this.getProvider(providerName);
    return this.currentProvider;
  }

  /**
   * Create a provider instance based on configuration
   */
  private static createProvider(providerName: string): LMProvider {
    const providerConfig = this.getProviderConfig(providerName);

    switch (providerName) {
      case 'openrouter':
        return new OpenRouterProvider(providerConfig);
      case 'openai':
        return new OpenAIProvider(providerConfig);
      default:
        throw new Error(`Unsupported LM provider: ${providerName}`);
    }
  }

  /**
   * Get provider configuration from environment
   */
  private static getProviderConfig(providerName: string): ProviderConfig {
    const isPrimary = providerName === config.lmProviders.primary.provider;

    if (isPrimary) {
      return {
        name: config.lmProviders.primary.provider,
        baseUrl: this.getProviderBaseUrl(providerName),
        apiKey: config.lmProviders.primary.apiKey,
        models: this.getProviderModels(providerName),
        defaultModel: config.lmProviders.primary.model,
      };
    } else {
      return {
        name: config.lmProviders.fallback.provider,
        baseUrl: this.getProviderBaseUrl(config.lmProviders.fallback.provider),
        apiKey: config.lmProviders.fallback.apiKey,
        models: this.getProviderModels(config.lmProviders.fallback.provider),
        defaultModel: config.lmProviders.fallback.model,
      };
    }
  }

  /**
   * Get base URL for a provider
   */
  private static getProviderBaseUrl(providerName: string): string {
    switch (providerName) {
      case 'openrouter':
        return 'https://openrouter.ai/api/v1';
      case 'openai':
        return 'https://api.openai.com/v1';
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }

  /**
   * Get available models for a provider
   */
  private static getProviderModels(providerName: string): string[] {
    switch (providerName) {
      case 'openrouter':
        return [
          'anthropic/claude-3.5-sonnet',
          'anthropic/claude-3-haiku',
          'openai/gpt-4',
          'openai/gpt-3.5-turbo',
          'google/gemini-pro',
          'meta-llama/llama-3.1-70b',
          'meta-llama/llama-3.1-8b',
        ];
      case 'openai':
        return [
          'gpt-4',
          'gpt-4-turbo-preview',
          'gpt-3.5-turbo',
          'gpt-3.5-turbo-16k',
        ];
      default:
        return [];
    }
  }

  /**
   * Try to generate completion with fallback support
   */
  static async generateWithFallback(
    prompt: string,
    options?: { provider?: string; model?: string }
  ): Promise<{ response: any; provider: string; model: string }> {
    const primaryProvider = this.getProvider(options?.provider);

    try {
      // Try primary provider first
      const response = await primaryProvider.generateCompletion(prompt, options);
      return {
        response,
        provider: primaryProvider.name,
        model: options?.model || primaryProvider.defaultModel,
      };
    } catch (error) {
      console.warn(`Primary provider ${primaryProvider.name} failed:`, error);

      // Try fallback provider
      const fallbackProviderName = config.lmProviders.fallback.provider;
      if (fallbackProviderName && fallbackProviderName !== primaryProvider.name) {
        try {
          const fallbackProvider = this.getProvider(fallbackProviderName);
          const response = await fallbackProvider.generateCompletion(prompt, {
            ...options,
            model: config.lmProviders.fallback.model,
          });

          return {
            response,
            provider: fallbackProvider.name,
            model: config.lmProviders.fallback.model,
          };
        } catch (fallbackError) {
          console.error(`Fallback provider ${fallbackProviderName} also failed:`, fallbackError);
          throw new Error(`Both primary and fallback providers failed. Primary: ${error}. Fallback: ${fallbackError}`);
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Clear all cached providers (useful for testing)
   */
  static clearCache(): void {
    this.providers.clear();
    this.currentProvider = null;
  }
}