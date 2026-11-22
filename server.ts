import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `Bạn là "Trợ lý Ngôn Từ" — sự kết hợp giữa Chuyên gia Giáo dục Tiểu học (EdTech) và Nhà Ngôn ngữ học trẻ em tại Việt Nam.
Đối tượng: Học sinh lớp 5 (10-11 tuổi) tại Việt Nam.
Cách xưng hô: Luôn tự xưng là "Trợ lý Ngôn Từ" hoặc "Người bạn đồng hành" và gọi học sinh là "Bạn nhỏ" hoặc "Sĩ tử nhí".
Nguyên tắc chuyên môn:
- Mọi từ vựng, câu văn mẫu, giải thích phải tự nhiên, trong sáng, đúng trình độ Tiếng Việt lớp 5 theo chương trình giáo dục phổ thông Việt Nam.
- Ưu tiên tư duy hình ảnh: từ láy gợi tả/gợi thanh, tính từ chỉ màu sắc, hình dáng, âm thanh và đặc biệt là hai biện pháp tu từ trọng tâm: So sánh và Nhân hóa.
- Khi sửa lỗi, không chỉ sửa đúng mà phải giải thích "tại sao sai" bằng ngôn ngữ nhẹ nhàng, trực quan, dễ hiểu nhất cho trẻ 10 tuổi.
- Giọng văn luôn ấm áp, khích lệ, truyền cảm hứng yêu tiếng Việt, tuyệt đối không chê bai hay dùng thuật ngữ hàn lâm khó hiểu.`;

const PILLAR_LABELS: Record<string, string> = {
  storytelling: 'Kể chuyện sáng tạo (cốt truyện, thắt nút, mở nút, cảm xúc nhân vật)',
  plants: 'Tả cây cối (chi tiết bộ phận, màu sắc, hương thơm, sự thay đổi theo thời gian)',
  scenery: 'Tả cảnh (không gian, ánh sáng, âm thanh, nhịp sống)',
  people: 'Tả người (ngoại hình, ánh mắt, nụ cười, tính cách, hoạt động thân thương)',
};

const FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];

function extractApiKey(req: express.Request): string {
  const headerKey = req.headers['x-gemini-api-key'];
  if (typeof headerKey === 'string' && headerKey.trim()) {
    return headerKey.trim();
  }
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey !== 'MY_GEMINI_API_KEY') {
    return envKey.trim();
  }
  return '';
}

function getGeminiClient(apiKey: string): GoogleGenAI {
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWithFallback(
  ai: GoogleGenAI,
  preferredModel: string,
  generateParams: {
    contents: string;
    config: Parameters<GoogleGenAI['models']['generateContent']>[0]['config'];
  }
) {
  const modelChain = [
    preferredModel,
    ...FALLBACK_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastError: unknown = null;

  for (const model of modelChain) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: generateParams.contents,
        config: generateParams.config,
      });
      return { response, usedModel: model };
    } catch (err) {
      console.warn(`Server model ${model} failed, trying next fallback:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Tất cả các model Gemini đều không phản hồi.');
}

function handleApiError(res: express.Response, err: unknown) {
  console.error('Gemini API Error:', err);
  if (err instanceof Error && err.message === 'MISSING_API_KEY') {
    return res.status(503).json({
      error: 'MISSING_API_KEY: Chưa thiết lập khóa API Gemini. Vui lòng bấm vào "Lấy API key để sử dụng app" trên Header để cấu hình.',
    });
  }
  const message = err instanceof Error ? err.message : String(err);
  return res.status(500).json({
    error: message, // Hiển thị nguyên văn lỗi từ API (VD: 429 RESOURCE_EXHAUSTED) theo AI_INSTRUCTIONS
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // 1. Sentence Upgrade API
  app.post('/api/upgrade-sentence', async (req, res) => {
    try {
      const apiKey = extractApiKey(req);
      const sentence = typeof req.body?.sentence === 'string' ? req.body.sentence.trim() : '';
      const pillar = typeof req.body?.pillar === 'string' && PILLAR_LABELS[req.body.pillar]
        ? req.body.pillar
        : 'plants';
      const storytellingStyle =
        req.body?.storytellingStyle === 'roleplay' ? 'roleplay' : 'add_details';
      const roleplayCharacter =
        typeof req.body?.roleplayCharacter === 'string'
          ? req.body.roleplayCharacter.trim().slice(0, 60)
          : '';
      const preferredModel =
        typeof req.body?.model === 'string' && FALLBACK_MODELS.includes(req.body.model)
          ? req.body.model
          : 'gemini-3-flash-preview';

      if (!sentence || sentence.length < 3 || sentence.length > 400) {
        return res.status(400).json({
          error: 'Bạn nhỏ hãy nhập một câu văn từ 3 đến 400 ký tự để Trợ lý Ngôn Từ giúp nâng cấp nhé!',
        });
      }

      const storytellingGuidance =
        pillar === 'storytelling'
          ? storytellingStyle === 'roleplay'
            ? `\nYêu cầu đặc biệt về CÁCH VIẾT KỂ CHUYỆN SÁNG TẠO:
- Áp dụng Cách 2: Đóng vai thành nhân vật trong truyện để kể lại (ngôi thứ nhất: xưng "tôi", "mình", hoặc "cháu/em" phù hợp nhân vật).
${roleplayCharacter ? `- Nhân vật nhập vai: ${roleplayCharacter}.` : '- Hãy nhập vai trực tiếp vào nhân vật chính hoặc sự vật được nhắc tới trong câu gốc.'}
- Cả 3 phương án nâng cấp đều phải kể bằng giọng văn nhập vai giàu cảm xúc nội tâm, suy nghĩ và lời tự sự sinh động của nhân vật đó.`
            : `\nYêu cầu đặc biệt về CÁCH VIẾT KỂ CHUYỆN SÁNG TẠO:
- Áp dụng Cách 1: Viết sáng tạo bằng cách thêm các chi tiết sáng tạo (thêm tả ngoại hình, cử chỉ, âm thanh, bối cảnh không gian, suy nghĩ hoặc lời thoại ngắn tự nhiên để câu chuyện sống động và giàu sức hút hơn).`
          : '';

      const ai = getGeminiClient(apiKey);
      const { response, usedModel } = await generateWithFallback(ai, preferredModel, {
        contents: `Dạng bài tập làm văn lớp 5: ${PILLAR_LABELS[pillar]}.${storytellingGuidance}
Câu văn đơn giản của Bạn nhỏ: "${sentence}"

Hãy giúp Bạn nhỏ nâng cấp câu văn này thành 3 phương án ngày càng giàu hình ảnh và cảm xúc, phù hợp học sinh lớp 5:
- Phương án 1 (Cấp độ Khởi sắc): Bổ sung từ láy, tính từ màu sắc, hình dáng hoặc âm thanh sinh động.
- Phương án 2 (Cấp độ So sánh): Sử dụng phép So sánh tự nhiên, giàu sức gợi.
- Phương án 3 (Cấp độ Nhân hóa & Cảm xúc): Sử dụng phép Nhân hóa kết hợp hình ảnh tinh tế, mềm mại.

Trả về đúng định dạng JSON theo schema.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              originalAnalysis: {
                type: Type.STRING,
                description: 'Nhận xét ngắn gọn (1-2 câu) về ưu điểm câu gốc và điểm có thể làm sinh động hơn cho học sinh lớp 5.',
              },
              upgrades: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.STRING, description: 'Tên cấp độ, ví dụ: Cấp độ 1: Thêm từ láy & sắc màu' },
                    sentence: { type: Type.STRING, description: 'Câu văn sau khi nâng cấp giàu hình ảnh.' },
                    devices: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Tên biện pháp tu từ hoặc loại từ nổi bật (ví dụ: Từ láy, So sánh, Nhân hóa).',
                    },
                    highlightWords: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: '2 đến 4 từ/cụm từ đắt giá xuất hiện nguyên văn trong câu đã nâng cấp.',
                    },
                    explanation: {
                      type: Type.STRING,
                      description: 'Giải thích ngắn gọn, dễ hiểu cho trẻ 10 tuổi vì sao câu này hay hơn.',
                    },
                  },
                  required: ['level', 'sentence', 'devices', 'highlightWords', 'explanation'],
                },
              },
              bonusVocabulary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    category: { type: Type.STRING, description: 'Ví dụ: Từ láy, Tính từ, Động từ gợi tả' },
                    meaning: { type: Type.STRING, description: 'Nghĩa ngắn gọn, dễ hiểu cho lớp 5' },
                  },
                  required: ['word', 'category', 'meaning'],
                },
              },
              encouragement: {
                type: Type.STRING,
                description: 'Một câu khen ngợi, khích lệ ấm áp từ Trợ lý Ngôn Từ dành cho Bạn nhỏ.',
              },
            },
            required: ['originalAnalysis', 'upgrades', 'bonusVocabulary', 'encouragement'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json({ ...parsed, usedModel });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // 2. Writing Error Checker API
  app.post('/api/check-writing', async (req, res) => {
    try {
      const apiKey = extractApiKey(req);
      const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
      const pillar = typeof req.body?.pillar === 'string' && PILLAR_LABELS[req.body.pillar]
        ? req.body.pillar
        : 'scenery';
      const storytellingStyle =
        req.body?.storytellingStyle === 'roleplay' ? 'roleplay' : 'add_details';
      const roleplayCharacter =
        typeof req.body?.roleplayCharacter === 'string'
          ? req.body.roleplayCharacter.trim().slice(0, 60)
          : '';
      const preferredModel =
        typeof req.body?.model === 'string' && FALLBACK_MODELS.includes(req.body.model)
          ? req.body.model
          : 'gemini-3-flash-preview';

      if (!text || text.length < 5 || text.length > 1500) {
        return res.status(400).json({
          error: 'Bạn nhỏ hãy viết ít nhất 1 câu (từ 5 đến 1500 ký tự) để Trợ lý Ngôn Từ cùng đọc và góp ý nhé!',
        });
      }

      const checkStyleNote =
        pillar === 'storytelling'
          ? storytellingStyle === 'roleplay'
            ? `\nLưu ý về CÁCH VIẾT KỂ CHUYỆN SÁNG TẠO (Cách 2 - Đóng vai nhân vật${roleplayCharacter ? `: ${roleplayCharacter}` : ''}):
- Kiểm tra xem Bạn nhỏ đã giữ nhất quán ngôi kể thứ nhất (xưng "tôi/mình") và thể hiện được cảm xúc, góc nhìn riêng của nhân vật chưa. Bản chỉnh sửa và câu gợi ý mở rộng phải giữ đúng giọng nhập vai nhân vật đó.`
            : `\nLưu ý về CÁCH VIẾT KỂ CHUYỆN SÁNG TẠO (Cách 1 - Thêm chi tiết sáng tạo):
- Góp ý cách bổ sung chi tiết tả cảnh, cử chỉ, cảm xúc hoặc lời thoại tự nhiên để câu chuyện hấp dẫn, giàu trí tưởng tượng hơn.`
          : '';

      const ai = getGeminiClient(apiKey);
      const { response, usedModel } = await generateWithFallback(ai, preferredModel, {
        contents: `Dạng bài tập làm văn lớp 5: ${PILLAR_LABELS[pillar]}.${checkStyleNote}
Bài viết của Bạn nhỏ:
"${text}"

Hãy đọc thật kỹ bài viết như một người bạn đồng hành dịu dàng:
1. Tìm điểm sáng đáng khen trước.
2. Chỉ ra từng lỗi cụ thể (nếu có: lỗi chính tả, lặp từ, câu cụt thiếu chủ ngữ/vị ngữ, dấu câu, diễn đạt chưa tự nhiên). Với mỗi lỗi, PHẢI giải thích thật dễ hiểu "tại sao sai" để học sinh lớp 5 tự hiểu và nhớ lâu. Nếu bài đã đúng chính tả và ngữ pháp, vẫn có thể gợi ý 1-2 điểm tinh chỉnh diễn đạt để mượt hơn (ghi rõ là gợi ý diễn đạt).
3. Viết lại phiên bản đã chỉnh sửa mượt mà, giữ nguyên ý tưởng hồn nhiên của Bạn nhỏ.
4. Gợi ý thêm 1 câu mở rộng có dùng phép So sánh hoặc Nhân hóa mà Bạn nhỏ có thể ghép thêm vào bài.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              praise: {
                type: Type.STRING,
                description: 'Lời khen cụ thể về ý tưởng hoặc chi tiết hay trong bài của Bạn nhỏ.',
              },
              correctedText: {
                type: Type.STRING,
                description: 'Đoạn văn hoàn chỉnh sau khi đã sửa lỗi và làm mượt câu chữ, giữ giọng văn lớp 5.',
              },
              issues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    wrongSnippet: { type: Type.STRING, description: 'Cụm từ/câu cần sửa trong bài gốc.' },
                    fixedSnippet: { type: Type.STRING, description: 'Cách sửa đúng và hay hơn.' },
                    category: { type: Type.STRING, description: 'Loại lỗi: Chính tả, Lặp từ, Ngữ pháp, Dấu câu, hoặc Diễn đạt.' },
                    whyWrong: { type: Type.STRING, description: 'Giải thích "tại sao sai" thật dễ hiểu cho trẻ 10 tuổi.' },
                    tip: { type: Type.STRING, description: 'Mẹo nhỏ dễ nhớ để lần sau không mắc lại.' },
                  },
                  required: ['wrongSnippet', 'fixedSnippet', 'category', 'whyWrong', 'tip'],
                },
              },
              literaryBoost: {
                type: Type.OBJECT,
                properties: {
                  device: { type: Type.STRING, description: 'So sánh hoặc Nhân hóa' },
                  suggestion: { type: Type.STRING, description: '1 câu gợi ý mở rộng giàu hình ảnh để ghép vào bài.' },
                },
                required: ['device', 'suggestion'],
              },
              encouragement: {
                type: Type.STRING,
                description: 'Lời nhắn khích lệ cuối cùng của Trợ lý Ngôn Từ.',
              },
            },
            required: ['praise', 'correctedText', 'issues', 'literaryBoost', 'encouragement'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json({ ...parsed, usedModel });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // 3. Topic Vocabulary Suggester API
  app.post('/api/suggest-vocab', async (req, res) => {
    try {
      const apiKey = extractApiKey(req);
      const topic = typeof req.body?.topic === 'string' ? req.body.topic.trim() : '';
      const pillar = typeof req.body?.pillar === 'string' && PILLAR_LABELS[req.body.pillar]
        ? req.body.pillar
        : 'scenery';
      const preferredModel =
        typeof req.body?.model === 'string' && FALLBACK_MODELS.includes(req.body.model)
          ? req.body.model
          : 'gemini-3-flash-preview';

      if (!topic || topic.length < 2 || topic.length > 120) {
        return res.status(400).json({
          error: 'Bạn nhỏ hãy nhập một chủ đề ngắn (ví dụ: cơn mưa rào, cây bàng, cô giáo) nhé!',
        });
      }

      const ai = getGeminiClient(apiKey);
      const { response, usedModel } = await generateWithFallback(ai, preferredModel, {
        contents: `Chủ đề viết văn lớp 5: "${topic}" (thuộc dạng bài: ${PILLAR_LABELS[pillar]}).
Hãy gợi ý 6 từ/cụm từ đắt giá, giàu hình ảnh cho học sinh lớp 5 gồm đa dạng: Từ láy, Màu sắc & Ánh sáng, Âm thanh & Hình dáng, So sánh, và Nhân hóa.
Mỗi từ cần có nghĩa dễ hiểu và 1 câu văn mẫu lớp 5 thật trong sáng, sinh động.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topicTitle: { type: Type.STRING },
              writingTip: { type: Type.STRING, description: '1 bí kíp quan sát nhanh khi viết về chủ đề này.' },
              words: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      description: 'Một trong 5 loại: Từ láy, Màu sắc & Ánh sáng, Âm thanh & Hình dáng, So sánh, Nhân hóa',
                    },
                    meaning: { type: Type.STRING },
                    example: { type: Type.STRING },
                  },
                  required: ['word', 'category', 'meaning', 'example'],
                },
              },
              encouragement: { type: Type.STRING },
            },
            required: ['topicTitle', 'writingTip', 'words', 'encouragement'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json({ ...parsed, usedModel });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // 4. Dynamic Non-Repeating Story Adventure Generator API
  app.post('/api/generate-story-adventure', async (req, res) => {
    try {
      const apiKey = extractApiKey(req);
      const themeInput =
        typeof req.body?.theme === 'string' ? req.body.theme.trim().slice(0, 120) : '';
      const storytellingStyle =
        req.body?.storytellingStyle === 'roleplay' ? 'roleplay' : 'add_details';
      const roleplayCharacter =
        typeof req.body?.roleplayCharacter === 'string'
          ? req.body.roleplayCharacter.trim().slice(0, 60)
          : '';
      const excludeTitles: string[] = Array.isArray(req.body?.excludeTitles)
        ? req.body.excludeTitles
            .filter((t: unknown): t is string => typeof t === 'string')
            .slice(-15)
        : [];
      const preferredModel =
        typeof req.body?.model === 'string' && FALLBACK_MODELS.includes(req.body.model)
          ? req.body.model
          : 'gemini-3-flash-preview';

      const styleInstruction =
        storytellingStyle === 'roleplay'
          ? `Áp dụng CÁCH 2 — Đóng vai thành nhân vật trong truyện để kể lại (ngôi thứ nhất xưng "tôi" hoặc "mình"). ${
              roleplayCharacter
                ? `Nhân vật kể chuyện là: "${roleplayCharacter}".`
                : 'Hãy chọn một nhân vật thú vị (con vật, đồ vật hoặc bạn nhỏ) làm người kể chuyện xưng "tôi".'
            }`
          : 'Áp dụng CÁCH 1 — Viết sáng tạo bằng cách thêm các chi tiết miêu tả, cử chỉ, âm thanh, cảm xúc và lời thoại sinh động (ngôi thứ ba hoặc người chứng kiến).';

      const avoidBlock =
        excludeTitles.length > 0
          ? `\nTUYỆT ĐỐI KHÔNG lặp lại cốt truyện, nhân vật chính hay tiêu đề giống các truyện đã chơi sau: ${excludeTitles.join('; ')}. Hãy sáng tạo bối cảnh và nhân vật hoàn toàn mới mẻ!`
          : '';

      const ai = getGeminiClient(apiKey);
      const { response } = await generateWithFallback(ai, preferredModel, {
        contents: `Hãy thiết kế 1 trò chơi "Xếp gạch Cốt truyện Sáng tạo" hoàn toàn mới dành cho học sinh lớp 5 tại Việt Nam.
${themeInput ? `Chủ đề / ý tưởng Bạn nhỏ mong muốn: "${themeInput}".` : 'Chủ đề: Hãy chọn ngẫu nhiên một đề tài gần gũi, giàu trí tưởng tượng cho trẻ 10 tuổi Việt Nam (như thiên nhiên, mái trường, cổ tích viết lại, đồ vật biết nói, loài vật thân quen, mùa hè quê hương...).'}
${styleInstruction}${avoidBlock}

Cấu trúc bắt buộc gồm đúng 3 chặng liên kết mạch lạc thành một câu chuyện trọn vẹn:
- Chặng 1: Mở đầu lôi cuốn
- Chặng 2: Thắt nút bất ngờ
- Chặng 3: Mở nút ấm áp

Mỗi chặng có đúng 2 nhánh lựa chọn ("choices"), mỗi nhánh là 2-3 câu văn tiếng Việt lớp 5 trong sáng, giàu từ láy, So sánh hoặc Nhân hóa để khi ghép 3 nhánh bất kỳ từ 3 chặng lại vẫn tạo thành một câu chuyện liền mạch, ý nghĩa.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Tên câu chuyện mới mẻ, hấp dẫn học sinh lớp 5.' },
              theme: { type: Type.STRING, description: 'Chủ đề ngắn gọn (4-7 từ).' },
              narratorRole: {
                type: Type.STRING,
                description: 'Vai người kể chuyện (ví dụ: Đóng vai Chú Dế Mèn, hoặc Người kể chuyện sáng tạo).',
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stage: { type: Type.STRING },
                    question: { type: Type.STRING },
                    choices: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          label: { type: Type.STRING, description: 'Tên ngắn gọn của nhánh lựa chọn.' },
                          snippet: { type: Type.STRING, description: '2-3 câu văn hoàn chỉnh cho chặng này.' },
                          deviceTag: { type: Type.STRING, description: 'Biện pháp nổi bật, ví dụ: So sánh + Từ láy.' },
                        },
                        required: ['label', 'snippet', 'deviceTag'],
                      },
                    },
                  },
                  required: ['stage', 'question', 'choices'],
                },
              },
            },
            required: ['title', 'theme', 'narratorRole', 'steps'],
          },
        },
      });

      const raw = JSON.parse((response.text ?? '{}').trim()) as {
        title: string;
        theme: string;
        narratorRole?: string;
        steps: {
          stage: string;
          question: string;
          choices: { label: string; snippet: string; deviceTag: string }[];
        }[];
      };

      const storyId = `ai-story-${Date.now()}`;
      const adventure = {
        id: storyId,
        title: raw.title,
        theme: raw.theme,
        storytellingStyle,
        narratorRole: raw.narratorRole || (storytellingStyle === 'roleplay' ? roleplayCharacter || 'Nhân vật trong truyện' : 'Thêm chi tiết sáng tạo'),
        steps: (raw.steps || []).slice(0, 3).map((step, sIdx) => ({
          stage: step.stage,
          question: step.question,
          choices: (step.choices || []).slice(0, 2).map((ch, cIdx) => ({
            id: `${storyId}-s${sIdx}-c${cIdx}`,
            label: ch.label,
            snippet: ch.snippet,
            deviceTag: ch.deviceTag,
          })),
        })),
      };

      return res.json(adventure);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hành Trình Ngôn Từ server running on http://localhost:${PORT}`);
  });
}

startServer();
