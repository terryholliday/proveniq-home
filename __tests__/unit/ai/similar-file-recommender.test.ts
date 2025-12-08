import { describe, expect, it, jest } from '@jest/globals';

jest.mock('@/ai/genkit', () => ({
  ai: {
    definePrompt: jest.fn(() =>
      jest.fn(async (input: any) => ({
        output: {
          keepFileName: input.files[0].name,
          reasoning: `Selected ${input.files[0].name} for cluster ${input.normalizedKey}`,
          dispositions: input.files.map((file: any, index: number) => ({
            fileName: file.name,
            action: index === 0 ? 'keep' : 'archive',
            reason: index === 0 ? 'Newest and largest' : 'Superseded by newer version',
          })),
        },
      })
    )),
    defineFlow: (_config: any, handler: any) => handler,
  },
}));

const { normalizeFileName, groupSimilarFiles, recommendFileToKeep } = require('@/ai/flows/similar-file-recommender');

describe('normalizeFileName', () => {
  it('removes extensions and common version indicators', () => {
    expect(normalizeFileName('Report_Final_v2.pdf')).toBe('report');
    expect(normalizeFileName('report-copy-2024-01-01.docx')).toBe('report');
  });
});

describe('groupSimilarFiles', () => {
  it('clusters files by normalized name', () => {
    const files = [
      { name: 'budget_Q1.xlsx' },
      { name: 'budget-q1-final.xlsx' },
      { name: 'notes.txt' },
    ];

    const groups = groupSimilarFiles(files as any);
    const budgetGroup = groups.find((g: any) => g.key === 'budget q');

    expect(budgetGroup?.files).toHaveLength(2);
    expect(groups.some((g: any) => g.key === 'notes')).toBe(true);
  });
});

describe('recommendFileToKeep', () => {
  it('returns recommendations for groups with multiple files', async () => {
    const files = [
      { name: 'plan_draft.pdf', sizeBytes: 100, modifiedAt: '2024-01-01T00:00:00Z' },
      { name: 'plan_final.pdf', sizeBytes: 120, modifiedAt: '2024-02-01T00:00:00Z' },
      { name: 'unique.txt', sizeBytes: 10 },
    ];

    const results = await recommendFileToKeep({ files, context: 'Prefer the most recent version.' });

    expect(results).toHaveLength(1);
    expect(results[0].keepFileName).toBe('plan_draft.pdf');
    expect(results[0].dispositions).toHaveLength(2);
  });
});
