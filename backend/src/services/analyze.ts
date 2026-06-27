import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { env } from '../env';
import { badRequest, serverError } from '../lib/http';

export interface LocationResult {
  country: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  confidence: number; // 0-100
  landmarks: string[];
  reasoning: string;
}

const SUPPORTED_MEDIA = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type MediaType = (typeof SUPPORTED_MEDIA)[number];

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) {
    throw serverError('AI analysis is not configured (ANTHROPIC_API_KEY)');
  }
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
}

const resultSchema = z.object({
  country: z.string().nullable(),
  city: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  confidence: z.number().min(0).max(100),
  landmarks: z.array(z.string()),
  reasoning: z.string(),
});

const SYSTEM = `أنت خبير في تحديد المواقع الجغرافية من الصور (image geo-location).
استنتج الموقع الأرجح بالاعتماد على المعالم، العمارة، اللافتات، اللغة المكتوبة،
النباتات، الطقس، وزاوية الشمس. استدعِ الأداة report_location دائماً بنتيجتك.
اكتب حقل reasoning بالعربية بإيجاز. إن لم تستطع التحديد بدقة، اخفض confidence
وضع الحقول غير المعروفة null.`;

// Forced tool use gives us a structured result without relying on the newer
// output_config/json_schema API (works across SDK versions).
const REPORT_TOOL: Anthropic.Tool = {
  name: 'report_location',
  description: 'Report the most likely geographic location of the photo.',
  input_schema: {
    type: 'object',
    properties: {
      country: { type: ['string', 'null'], description: 'Country name (Arabic)' },
      city: { type: ['string', 'null'], description: 'City/area name (Arabic)' },
      lat: { type: ['number', 'null'], description: 'Latitude in decimal degrees' },
      lng: { type: ['number', 'null'], description: 'Longitude in decimal degrees' },
      confidence: { type: 'integer', description: 'Confidence 0-100' },
      landmarks: {
        type: 'array',
        items: { type: 'string' },
        description: 'Detected landmarks/clues (Arabic)',
      },
      reasoning: { type: 'string', description: 'Short Arabic explanation' },
    },
    required: ['country', 'city', 'lat', 'lng', 'confidence', 'landmarks', 'reasoning'],
  },
};

/**
 * Analyzes an image (base64) with Claude vision and returns a structured
 * geo-location guess via a forced tool call.
 */
export async function analyzeImageLocation(
  base64: string,
  mediaType: string,
): Promise<LocationResult> {
  if (!SUPPORTED_MEDIA.includes(mediaType as MediaType)) {
    throw badRequest(`Unsupported image type: ${mediaType}`);
  }
  // The Anthropic API requires raw base64 with no data-url prefix or whitespace.
  const data = base64.replace(/^data:[^,]+,/, '').replace(/\s/g, '');

  const message = await getClient().messages.create({
    model: env.ANALYZE_MODEL,
    max_tokens: 1024,
    system: SYSTEM,
    tools: [REPORT_TOOL],
    tool_choice: { type: 'tool', name: 'report_location' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType as MediaType, data },
          },
          { type: 'text', text: 'حدّد موقع هذه الصورة عبر استدعاء report_location.' },
        ],
      },
    ],
  });

  const toolUse = message.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
  );
  if (!toolUse) throw serverError('AI returned no structured result');

  const result = resultSchema.safeParse(toolUse.input);
  if (!result.success) throw serverError('AI result failed validation');
  return { ...result.data, confidence: Math.round(result.data.confidence) };
}
