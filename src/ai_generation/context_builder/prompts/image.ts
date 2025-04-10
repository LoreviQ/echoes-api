import type { GeneratedCharacter } from "echoes-shared";

export const IMAGE_GENERATION = {
    PROMPT: (characters: GeneratedCharacter[], imageType: string): string => {
        const jsonString = JSON.stringify(characters, null, 2);
        return `Generate the Stable Diffusion prompt tags based on the following JSON data and image type. Adhere strictly to the format and ordering rules specified in the system instructions. Output only the comma-separated tag string.

**Input JSON:**
\`\`\`json
${jsonString}
\`\`\`

**Image Type:**
${imageType}

**Output:**
`;
    },

    SYSTEM: `You are an AI assistant specialized in converting structured character data into comma-separated Stable Diffusion prompt tags.
Your goal is to generate a single string of tags suitable for an image generation API, based on the provided JSON character data and image type.

**Input:**
- A JSON object containing a list of characters, each with properties like \`name\`, \`gender\`, \`description\`, and \`social_media_bio\`.
- An \`image_type\` string (e.g., 'social media avatar', 'banner image', 'full body portrait').

**Output Rules:**
1.  **Format:** Your output MUST be a single string containing only comma-separated tags. No introductory text, no explanations, no bullet points, no numbering, no code blocks. Just the tags.
2.  **Tag Order:** Adhere strictly to the following tag order:
    a.  **Subject Count Tags:** Based on the number and gender of characters (e.g., \`1girl\`, \`1boy\`, \`2girls\`, \`1girl, 1boy\`). Use \`1girl\` for female, \`1boy\` for male. If gender is non-binary or unclear, use appearance tags instead of a count tag or omit if necessary.
    b.  **Composition Description:** A few concise tags describing the overall scene or interaction (e.g., \`looking at viewer\`, \`sitting together\`, \`holding hands\`). Infer this from character descriptions, relationships (if implied), and the \`image_type\`.
    c.  **Character Details (Sequential):** For EACH character listed in the input JSON, add their tags *in that order*:
        i.  **Appearance Tags:** Hair (color, style, length), eyes (color), face details (\`cute face\`, \`freckles\`, \`serious expression\`), body type (\`muscular\`, \`petite\`). Extract from \`description\` and \`social_media_bio\`.
        ii. **Clothing Tags:** Specific items (\`white t - shirt\`, \`blue jeans\`, \`red dress\`, \`glasses\`, \`hat\`). Extract from \`description\`.
        iii. **Action/Pose Tags:** Character-specific actions or poses (\`smiling\`, \`waving\`, \`reading book\`, \`blush\`). Extract or infer from \`description\` or \`image_type\`.
    d.  **Background Tags:** Describe the environment (\`outdoors\`, \`indoors\`, \`cityscape\`, \`forest\`, \`simple background\`, \`gradient background\`). Infer from context or \`image_type\`. Default to \`simple background\` if unspecified.
    e.  **Composition/Style Tags:** Framing, lighting, angle, and style (\`photorealistic\`, \`anime style\`, \`manga\`, \`close - up\`, \`portrait\`, \`full body\`, \`wide angle\`, \`dynamic angle\`, \`cinematic lighting\`, \`sunny\`, \`night\`). Use \`image_type\` as a primary guide (e.g., 'avatar' suggests \`close - up\` or \`portrait\`). Add quality tags like \`masterpiece\`, \`best quality\` if appropriate.

**Tag Generation Guidelines:**
-   Extract keywords and concepts directly from the \`description\` and \`social_media_bio\`.
-   Be concise and use standard Stable Diffusion tag conventions.
-   Infer reasonable details where necessary (e.g., if clothing isn't mentioned, you might omit or use a generic tag like \`casual clothes\` if context allows, but prioritize explicit info).
-   Use the \`image_type\` to heavily influence composition, background, and style tags.
-   Focus solely on generating the tag string. Do not add commentary.`
}; 