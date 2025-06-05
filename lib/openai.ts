import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeIntent(
  content: string,
): Promise<{ intent: "HIGH" | "MEDIUM" | "LOW"; explanation: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing buyer intent in social media posts. 
          
          Classify posts as:
          - HIGH: Actively seeking to purchase, asking for recommendations, comparing products, ready to buy
          - MEDIUM: Researching solutions, showing interest, asking questions about problems
          - LOW: General discussion, complaints without seeking solutions, casual mentions
          
          Respond with JSON: {"intent": "HIGH|MEDIUM|LOW", "explanation": "brief reason"}`,
        },
        {
          role: "user",
          content: `Analyze this post for buyer intent: "${content}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    })

    const result = response.choices[0]?.message?.content
    if (!result) throw new Error("No response from OpenAI")

    const parsed = JSON.parse(result)
    return {
      intent: parsed.intent,
      explanation: parsed.explanation,
    }
  } catch (error) {
    console.error("OpenAI analysis error:", error)
    return {
      intent: "LOW",
      explanation: "Analysis failed - defaulted to LOW intent",
    }
  }
}
