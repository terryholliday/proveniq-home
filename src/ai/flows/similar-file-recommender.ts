'use server';

/**
 * AI-backed helper for reconciling similarly-named files.
 *
 * The flow will cluster near-duplicate filenames, call an LLM for a
 * recommendation about which file to keep, and include reasoning plus
 * suggested dispositions for the alternates.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const FileDescriptorSchema = z.object({
  name: z.string().describe('Original file name with extension'),
  path: z.string().optional().describe('Full or relative path for display'),
  sizeBytes: z.number().optional().describe('Size of the file in bytes'),
  modifiedAt: z.string().optional().describe('ISO-8601 last modified time'),
  hash: z.string().optional().describe('Checksum or fingerprint'),
});

export type FileDescriptor = z.infer<typeof FileDescriptorSchema>;

export const FileRecommendationSchema = z.object({
  groupKey: z.string().describe('Normalized name used to cluster similar files'),
  keepFileName: z.string().describe('File name recommended to keep'),
  reasoning: z.string().describe('Why this file should be retained'),
  dispositions: z
    .array(
      z.object({
        fileName: z.string(),
        action: z.enum(['keep', 'archive', 'delete', 'review']).describe('What to do with the file'),
        reason: z.string().describe('Short justification for the action'),
      })
    )
    .describe('Recommendations for each file in the cluster'),
});

export type FileRecommendation = z.infer<typeof FileRecommendationSchema>;

const dedupeKeywords = /(copy|final|draft|backup|latest|new|rev|revision|version)/gi;

function stripExtension(name: string): string {
  const lastDot = name.lastIndexOf('.');
  return lastDot === -1 ? name : name.slice(0, lastDot);
}

export function normalizeFileName(name: string): string {
  const base = stripExtension(name).toLowerCase();

  const cleaned = base
    .replace(dedupeKeywords, '')
    .replace(/v\d+/gi, '')
    .replace(/[_\-.]+/g, ' ')
    .replace(/\d+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || base;
}

export function groupSimilarFiles(files: FileDescriptor[]): { key: string; files: FileDescriptor[] }[] {
  const groups = new Map<string, FileDescriptor[]>();

  for (const file of files) {
    const key = normalizeFileName(file.name);
    const bucket = groups.get(key) ?? [];
    bucket.push(file);
    groups.set(key, bucket);
  }

  return Array.from(groups.entries())
    .map(([key, groupedFiles]) => ({ key, files: groupedFiles }))
    .filter((group) => group.files.length > 0);
}

const FileRecommendationPromptInputSchema = z.object({
  normalizedKey: z.string(),
  files: z.array(FileDescriptorSchema).min(2),
  context: z.string().optional().describe('User hints (e.g., prefer newest or highest resolution)'),
});

const FileRecommendationPromptOutputSchema = z.object({
  keepFileName: z.string(),
  reasoning: z.string(),
  dispositions: z.array(
    z.object({
      fileName: z.string(),
      action: z.enum(['keep', 'archive', 'delete', 'review']),
      reason: z.string(),
    })
  ),
});

const fileRecommendationPrompt = ai.definePrompt({
  name: 'fileRecommendationPrompt',
  input: { schema: FileRecommendationPromptInputSchema },
  output: { schema: FileRecommendationPromptOutputSchema },
  prompt: `
You are a careful archivist. The user has multiple files that appear to be versions of the same document.
Pick the best single file to keep and explain why using only the provided metadata.

SAFETY & CONSTRAINTS
- Follow the metadata; do not invent file names or actions.
- Prefer newer timestamps, larger sizes, and non-draft naming when deciding.
- If metadata is sparse, state the uncertainty in your reasoning and choose conservatively ("review").

Normalized Cluster: {{normalizedKey}}

Files (JSON):
{{json files}}

Optional user hints:
{{context}}

Return JSON with keepFileName, reasoning, and dispositions for every file.
`,
});

export const recommendFileToKeep = ai.defineFlow(
  {
    name: 'recommendFileToKeep',
    inputSchema: z.object({
      files: z.array(FileDescriptorSchema).describe('All files to inspect'),
      context: z.string().optional(),
    }),
    outputSchema: z.array(FileRecommendationSchema),
  },
  async (input) => {
    const groups = groupSimilarFiles(input.files);
    const recommendations: FileRecommendation[] = [];

    for (const group of groups) {
      if (group.files.length < 2) continue;

      const { output } = await fileRecommendationPrompt({
        normalizedKey: group.key,
        files: group.files,
        context: input.context,
      });

      if (output) {
        recommendations.push({
          groupKey: group.key,
          keepFileName: output.keepFileName,
          reasoning: output.reasoning,
          dispositions: output.dispositions,
        });
      }
    }

    return recommendations;
  }
);
