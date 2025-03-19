import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export function getSystemPrompt() {
  const now = new Date().toISOString();
  return `You are an expert researcher. Today is ${now}. Follow these instructions when responding:
- You may be asked to research subjects that is after your knowledge cutoff, assume the user is right when presented with news.
- The user is a highly experienced analyst, no need to simplify it, be as detailed as possible and make sure your response is correct.
- Be highly organized.
- Suggest solutions that I didn't think about.
- Be proactive and anticipate my needs.
- Treat me as an expert in all subject matter.
- Mistakes erode my trust, so be accurate and thorough.
- Provide detailed explanations, I'm comfortable with lots of detail.
- Value good arguments over authorities, the source is irrelevant.
- Consider new technologies and contrarian ideas, not just the conventional wisdom.
- You may use high levels of speculation or prediction, just flag it for me.`;
}

export function getSERPQuerySchema() {
  return z
    .array(
      z
        .object({
          query: z.string().describe("The SERP query."),
          researchGoal: z
            .string()
            .describe(
              "First talk about the goal of the research that this query is meant to accomplish, then go deeper into how to advance the research once the results are found, mention additional research directions. Be as specific as possible, especially for additional research directions. JSON reserved words should be escaped."
            ),
        })
        .required({ query: true, researchGoal: true })
    )
    .describe(`List of SERP queries.`);
}

export function generateQuestionsPrompt(query: string) {
  return [
    `Given the following query from the user, ask at least 5 follow-up questions to clarify the research direction: <query>${query}</query>`,
    `Questions need to be brief and concise. No need to output content that is irrelevant to the question.`,
  ].join("\n\n");
}

export function generateSerpQueriesPrompt(query: string) {
  const SERPQuerySchema = getSERPQuerySchema();
  const outputSchema = JSON.stringify(
    zodToJsonSchema(SERPQuerySchema),
    null,
    4
  );

  return [
    `Given the following query from the user:\n<query>${query}</query>`,
    `Based on previous user query, generate a list of SERP queries to further research the topic. Make sure each query is unique and not similar to each other.`,
    `You MUST respond in \`JSON\` matching this \`JSON schema\`:\n\`\`\`json\n${outputSchema}\n\`\`\``,
    `Expected output:\n\`\`\`json\n[{query: "This is a sample query. ", researchGoal: "This is the reason for the query. "}]\n\`\`\``,
  ].join("\n\n");
}

export function processSearchResultPrompt(query: string, researchGoal: string) {
  return [
    `Please use the following query to get the latest information via google search tool:\n<query>${query}</query>`,
    `You need to organize the searched information according to the following requirements:\n<researchGoal>\n${researchGoal}\n</researchGoal>`,
    `You need to think like a human researcher. Generate a list of learnings from the search results. Make sure each learning is unique and not similar to each other. The learnings should be to the point, as detailed and information dense as possible. Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any specific entities, metrics, numbers, and dates when available. The learnings will be used to research the topic further.`,
  ].join("\n\n");
}

export function reviewSerpQueriesPrompt(
  query: string,
  learnings: string[],
  suggestion: string
) {
  const SERPQuerySchema = getSERPQuerySchema();
  const outputSchema = JSON.stringify(
    zodToJsonSchema(SERPQuerySchema),
    null,
    4
  );
  const learningsString = learnings
    .map((learning) => `<learning>\n${learning}\n</learning>`)
    .join("\n");
  return [
    `Given the following query from the user:\n<query>${query}</query>`,
    `Here are all the learnings from previous research:\n<learnings>\n${learningsString}\n</learnings>`,
    `This is the user's suggestion for research direction:\n<suggestion>\n${suggestion}\n</suggestion>`,
    `Based on previous research and user research suggestions, determine whether further research is needed. If further research is needed, list of follow-up SERP queries to research the topic further. Make sure each query is unique and not similar to each other. If you believe no further research is needed, you can output an empty queries.`,
    `You MUST respond in \`JSON\` matching this \`JSON schema\`: \n\`\`\`json\n${outputSchema}\n\`\`\``,
    `Expected output:\n\`\`\`json\n[{query: "This is a sample query. ", researchGoal: "This is the reason for the query. "}]\n\`\`\``,
  ].join("\n\n");
}

export function writeFinalReportPrompt(query: string, learnings: string[]) {
  const learningsString = learnings
    .map((learning) => `<learning>\n${learning}\n</learning>`)
    .join("\n");
  return [
    `Given the following query from the user, write a final report on the topic using the learnings from research. Make it as as detailed as possible, aim for 3 or more pages, include ALL the learnings from research:\n<query>${query}</query>`,
    `Here are all the learnings from previous research:\n<learnings>\n${learningsString}\n</learnings>`,
    `You need to write this report like a human researcher. Humans don not wrap their writing in markdown blocks. Contains diverse data information such as pictures, katex formulas, mermaid diagrams, etc. in the form of markdown syntax.`,
  ].join("\n\n");
}
