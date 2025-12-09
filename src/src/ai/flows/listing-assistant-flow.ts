'use server';
/**
 * @fileOverview An AI flow to assist with creating item listings.
 *
 * - suggestListingDetails - A function that suggests a description and price for an item.
 * - ListingSuggestionInput - The input type for the suggestListingDetails function.
 * - ListingSuggestionOutput - The return type for the suggestListing-details function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ListingSuggestionInputSchema = z.object({
  title: z.string().describe('The title of the item being listed.'),
  category: z
    .enum(['buy-sell', 'borrow-lend', 'lost-found'])
    .describe('The category of the listing.'),
  condition: z
    .string()
    .optional()
    .describe('The condition of the item (e.g., New, Like New, Good, Fair).'),
});
export type ListingSuggestionInput = z.infer<
  typeof ListingSuggestionInputSchema
>;

const ListingSuggestionOutputSchema = z.object({
  description: z
    .string()
    .describe('A compelling and detailed description for the item listing.'),
  price: z
    .number()
    .optional()
    .describe('A suggested price in Indian Rupees (₹) for a "buy-sell" item.'),
});
export type ListingSuggestionOutput = z.infer<
  typeof ListingSuggestionOutputSchema
>;

const assistantPrompt = ai.definePrompt({
  name: 'listingAssistantPrompt',
  input: { schema: ListingSuggestionInputSchema },
  output: { schema: ListingSuggestionOutputSchema },
  prompt: `You are a helpful assistant for a college student marketplace called CampusHub. Your goal is to help users create great listings for their items.

You will be given the item's title, category, and condition.

1.  **Generate a Description:** Write a clear, concise, and appealing description for the item. Include potential use cases for a college student. The tone should be friendly and helpful.

2.  **Suggest a Price:**
    *   If the category is 'buy-sell', suggest a realistic price in Indian Rupees (₹) based on the title and condition. Do not include currency symbols or text, just the number.
    *   If the category is NOT 'buy-sell', do not suggest a price.

ITEM DETAILS:
- Title: {{{title}}}
- Category: {{{category}}}
- Condition: {{{condition}}}
`,
});

const listingAssistantFlow = ai.defineFlow(
  {
    name: 'listingAssistantFlow',
    inputSchema: ListingSuggestionInputSchema,
    outputSchema: ListingSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await assistantPrompt(input);
    return output!;
  }
);

export async function suggestListingDetails(
  input: ListingSuggestionInput
): Promise<ListingSuggestionOutput> {
  return listingAssistantFlow(input);
}
