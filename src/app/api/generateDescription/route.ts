import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '../../../../lib/prisma';

const perplexityInstance = new OpenAI({
  // Make sure to store your API key securely in an environment variable
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
  dangerouslyAllowBrowser: true,
});

export const maxDuration = 60; // This function can run for a maximum of 20 seconds

export async function POST(request: Request) {
  try {
    const { ean, maxChars } = await request.json();

    // Validate EAN code (must be 8 or 13 digits)
    if (!/^\d{8}$|^\d{13}$/.test(ean.trim())) {
      return NextResponse.json({ error: 'Invalid EAN code. Please enter 8 or 13 digits.' }, { status: 400 });
    }

    const response = await perplexityInstance.chat.completions.create({
      model: "sonar-reasoning-pro",
      messages: [{
        role: "user",
        content: `Generate a rich, detailed product description for the item with EAN code ${ean.trim()}. Include the product name, brand, key features, benefits, technical specifications, suggested use cases, and target audience. Also, highlight any unique selling points and value propositions that would appeal to potential customers. The description should be no longer than ${maxChars} characters. Use Polish language.`,
      }],
    });

    const descriptionContent = response.choices[0].message.content || "";
    // Save the search to SQLite database
    await prisma.search.create({
      data: {
        ean: ean.trim(),
        description: descriptionContent,
      },
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error({ error });
    const errorMessage =
      error instanceof Error && error.message.includes("429")
        ? "Rate limit exceeded. Please try again later."
        : "Failed to generate product description. Please try again.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 