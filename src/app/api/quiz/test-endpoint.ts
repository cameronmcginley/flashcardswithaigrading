/**
 * Utility function to test the quiz generation API directly
 * This is a diagnostic tool, not for production use
 */
export async function testQuizGeneration(
  deckIds: string[],
  numQuestions: number = 5
) {
  try {
    console.log("🧪 Testing quiz generation API with:", {
      deckIds,
      numQuestions,
    });

    const response = await fetch("/api/quiz/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deckIds,
        numQuestions,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Error generating quiz:", result);
      console.log("Status:", response.status);
      console.log(
        "Headers:",
        Object.fromEntries([...response.headers.entries()])
      );
      return { success: false, error: result, status: response.status };
    }

    console.log("✅ Quiz generated successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Exception during quiz generation test:", error);
    return { success: false, error };
  }
}

/**
 * Utility to run the test from browser console
 *
 * Usage in browser console:
 * import('/api/quiz/test-endpoint.js').then(m => m.runTest(['deck-id-1', 'deck-id-2']))
 */
export function runTest(deckIds: string[] = [], numQuestions: number = 5) {
  if (deckIds.length === 0) {
    console.log(
      "❌ No deck IDs provided. Please specify at least one deck ID."
    );
    return;
  }

  console.log("🚀 Running quiz generation test...");
  return testQuizGeneration(deckIds, numQuestions);
}
