'use server';

import {
  generateSocialMediaStrategy,
  type GenerateSocialMediaStrategyInput,
  type GenerateSocialMediaStrategyOutput,
} from '@/ai/flows/generate-social-media-strategy';

export async function createStrategy(
  input: GenerateSocialMediaStrategyInput
): Promise<GenerateSocialMediaStrategyOutput> {
  const result = await generateSocialMediaStrategy(input);
  if (!result || !result.strategies) {
    throw new Error('AI failed to return a valid strategy.');
  }
  return result;
}
