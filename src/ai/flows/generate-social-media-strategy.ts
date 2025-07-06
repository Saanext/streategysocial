'use server';
/**
 * @fileOverview Social media strategy generation AI agent.
 *
 * - generateSocialMediaStrategy - A function that handles the generation of social media strategies.
 * - GenerateSocialMediaStrategyInput - The input type for the generateSocialMediaStrategy function.
 * - GenerateSocialMediaStrategyOutput - The return type for the generateSocialMediaStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlatformSchema = z.enum(['instagram', 'x', 'facebook', 'linkedin']);

const GenerateSocialMediaStrategyInputSchema = z.object({
  businessDetails: z.string().describe('Details about the business, including its name, industry, and products/services.'),
  targetAudience: z.string().describe('Description of the target audience, including demographics, interests, and behaviors.'),
  goals: z.string().describe('The goals of the social media strategy, such as increasing brand awareness, driving sales, or generating leads.'),
  platforms: z.array(PlatformSchema).describe('The social media platforms to generate strategies for (e.g., Instagram, X, Facebook, LinkedIn).'),
});
export type GenerateSocialMediaStrategyInput = z.infer<typeof GenerateSocialMediaStrategyInputSchema>;

const SocialMediaStrategySchema = z.object({
  platform: PlatformSchema,
  strategy: z.string().describe('A detailed social media strategy for the specified platform, including actionable steps and suggestions.'),
  weeklyContentPlan: z.string().describe('A sample 7-day content plan with specific, creative ideas for posts for each day of the week (Monday to Sunday).'),
  algorithmKnowledge: z.string().describe("Key insights into how the platform's algorithm works and how the proposed strategy leverages it for maximum reach and engagement."),
});

const GenerateSocialMediaStrategyOutputSchema = z.object({
  strategies: z.array(SocialMediaStrategySchema).describe('An array of social media strategies, one for each selected platform.'),
});
export type GenerateSocialMediaStrategyOutput = z.infer<typeof GenerateSocialMediaStrategyOutputSchema>;

export async function generateSocialMediaStrategy(input: GenerateSocialMediaStrategyInput): Promise<GenerateSocialMediaStrategyOutput> {
  return generateSocialMediaStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSocialMediaStrategyPrompt',
  input: {schema: GenerateSocialMediaStrategyInputSchema},
  output: {schema: GenerateSocialMediaStrategyOutputSchema},
  prompt: `You are an expert social media strategist. Given the business details, target audience, and goals, generate tailored social media strategies for each of the selected platforms.

For each platform, you must provide:
1.  **Strategy**: A detailed strategy with actionable steps and suggestions.
2.  **Weekly Content Plan**: A sample 7-day content plan with specific ideas for posts.
3.  **Algorithm Knowledge**: Key insights into how the platform's algorithm works and how this strategy leverages it.

Business Details: {{{businessDetails}}}
Target Audience: {{{targetAudience}}}
Goals: {{{goals}}}
Platforms: {{join platforms ", "}}

Please generate the output in the required JSON format with comprehensive, high-quality content for each section.`,
});

const generateSocialMediaStrategyFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaStrategyFlow',
    inputSchema: GenerateSocialMediaStrategyInputSchema,
    outputSchema: GenerateSocialMediaStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
