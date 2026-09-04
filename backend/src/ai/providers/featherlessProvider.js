import { SYSTEM_PROMPT, buildUserPrompt, PROMPT_VERSION } from '../prompts/issueAnalysisPrompt.js';
import { validateIssueAnalysisSchema } from '../schemas/issueAnalysisSchema.js';

export const featherlessProvider = {
  name: 'Featherless AI VLM (Fallback Vision & Multimodal)',

  analyzeIssue: async (issueData) => {
    const apiKey = process.env.FEATHERLESS_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('[Featherless Provider] FEATHERLESS_API_KEY is not configured in backend environment variables.');
    }

    const modelName = process.env.FEATHERLESS_VISION_MODEL || 'meta-llama/Llama-3.2-11B-Vision-Instruct';
    const endpoint = process.env.FEATHERLESS_API_URL || 'https://api.featherless.ai/v1/chat/completions';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const userContent = [
        { type: 'text', text: buildUserPrompt(issueData) }
      ];

      // Add Multimodal Photo Evidence if base64 or URL images are provided
      if (Array.isArray(issueData.evidence) && issueData.evidence.length > 0) {
        issueData.evidence.forEach((img) => {
          const imgSrc = typeof img === 'string' ? img : img?.url;
          if (typeof imgSrc === 'string' && imgSrc.trim() !== '') {
            if (imgSrc.startsWith('data:image/') || imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
              userContent.push({
                type: 'image_url',
                image_url: { url: imgSrc }
              });
            }
          }
        });
      }

      const payload = {
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ],
        temperature: 0.2
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Featherless API Error (HTTP ${response.status}): ${errorText}`);
      }

      const resJson = await response.json();
      let rawText = resJson?.choices?.[0]?.message?.content;

      if (!rawText || typeof rawText !== 'string') {
        throw new Error('Featherless API returned an empty or invalid content payload.');
      }

      // Strip markdown code block formatting if returned by model
      let cleanedText = rawText.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }

      const parsed = JSON.parse(cleanedText);
      const validated = validateIssueAnalysisSchema(parsed);

      return {
        ...validated,
        provider: 'featherless',
        model: modelName,
        promptVersion: PROMPT_VERSION,
        status: 'ANALYZED'
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Featherless VLM call timed out after 8000ms`);
      }
      throw error;
    }
  }
};
