export function wrapInCodeBlock(string: string): string {
    return `\`\`\`json\n${string}\n\`\`\``;
}