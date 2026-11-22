import {
  CheckWritingResponse,
  PillarId,
  StoryAdventure,
  StorytellingStyle,
  SuggestVocabResponse,
  UpgradeResponse,
} from '../types';

export const GEMINI_API_KEY_STORAGE = 'hanhtrinhngontu_gemini_api_key';
export const GEMINI_MODEL_STORAGE = 'hanhtrinhngontu_selected_model';

export interface AiModelConfig {
  id: string;
  name: string;
  description: string;
  tag: string;
  badgeColor: string;
}

export const AVAILABLE_MODELS: AiModelConfig[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    description: 'Tốc độ phản hồi cực nhanh, thông minh và tối ưu tài nguyên cho học sinh.',
    tag: 'Mặc định khuyên dùng',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    description: 'Tư duy sư phạm sâu sắc, khả năng nhận xét văn học tinh tế, sắc sảo.',
    tag: 'Chuyên sâu & Sáng tạo',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Bền bỉ, ổn định cao, là chốt chặn dự phòng tuyệt vời khi các model mới bận.',
    tag: 'Dự phòng ổn định',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
];

export const FALLBACK_MODEL_CHAIN = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];

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

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(GEMINI_API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function saveStoredApiKey(apiKey: string): void {
  try {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, apiKey.trim());
  } catch (err) {
    console.error('Cannot save API key to localStorage', err);
  }
}

export function getStoredModel(): string {
  try {
    return localStorage.getItem(GEMINI_MODEL_STORAGE) || 'gemini-3-flash-preview';
  } catch {
    return 'gemini-3-flash-preview';
  }
}

export function saveStoredModel(modelId: string): void {
  try {
    localStorage.setItem(GEMINI_MODEL_STORAGE, modelId);
  } catch (err) {
    console.error('Cannot save model to localStorage', err);
  }
}

interface GenerateOptions {
  userPrompt: string;
  responseSchema?: Record<string, unknown>;
  onModelAttempt?: (model: string, attempt: number, total: number) => void;
}

export interface AiExecutionResult<T> {
  data: T;
  usedModel: string;
  attemptsCount: number;
}

/**
 * Core Fallback & Retry Engine
 * Tự động thử model được chọn trước; nếu gặp lỗi (429, quá tải, lỗi mạng),
 * tự động retry ngay sang model kế tiếp trong danh sách fallback.
 */
export async function executeWithFallback<T>({
  userPrompt,
  responseSchema,
  onModelAttempt,
}: GenerateOptions): Promise<AiExecutionResult<T>> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const selectedModel = getStoredModel();
  // Sắp xếp danh sách fallback sao cho model được chọn chạy đầu tiên
  const modelChain: string[] = [
    selectedModel,
    ...FALLBACK_MODEL_CHAIN.filter((m) => m !== selectedModel),
  ];

  let lastErrorText = '';
  let attemptsCount = 0;

  for (let i = 0; i < modelChain.length; i++) {
    const currentModel = modelChain[i];
    attemptsCount++;
    if (onModelAttempt) {
      onModelAttempt(currentModel, i + 1, modelChain.length);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        currentModel
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const requestBody: Record<string, unknown> = {
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          {
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      };

      if (responseSchema) {
        (requestBody.generationConfig as Record<string, unknown>).responseMimeType =
          'application/json';
        (requestBody.generationConfig as Record<string, unknown>).responseSchema = responseSchema;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        const errMsg =
          errorData?.error?.message ||
          errorData?.error?.status ||
          `HTTP ${status} ${response.statusText}`;

        lastErrorText = `[${currentModel}] ${status}: ${errMsg}`;
        console.warn(`Model ${currentModel} failed:`, lastErrorText);

        // Nếu là lỗi 429 hoặc 503 hoặc 404/500, tiếp tục thử model tiếp theo trong fallback
        continue;
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        lastErrorText = `[${currentModel}] Không nhận được phản hồi nội dung từ Gemini API.`;
        continue;
      }

      let parsedData: unknown = rawText;
      if (responseSchema) {
        try {
          parsedData = JSON.parse(rawText.trim());
        } catch {
          // Xử lý trường hợp chuỗi json bọc trong markdown code fence
          const cleaned = rawText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
          parsedData = JSON.parse(cleaned);
        }
      }

      return {
        data: parsedData as T,
        usedModel: currentModel,
        attemptsCount,
      };
    } catch (err) {
      const errString = err instanceof Error ? err.message : String(err);
      lastErrorText = `[${currentModel}] Lỗi mạng hoặc trình duyệt: ${errString}`;
      console.warn(`Lỗi khi gọi model ${currentModel}:`, err);
    }
  }

  // Nếu tất cả các model đều thất bại, ném lỗi nguyên văn kèm thông tin chi tiết
  throw new Error(lastErrorText || 'Tất cả các model Gemini đều không phản hồi lúc này.');
}

// 1. Sentence Upgrade Function
export async function aiUpgradeSentence(params: {
  sentence: string;
  pillar: PillarId;
  storytellingStyle?: StorytellingStyle;
  roleplayCharacter?: string;
  onModelAttempt?: (model: string, attempt: number, total: number) => void;
}): Promise<AiExecutionResult<UpgradeResponse>> {
  const storytellingGuidance =
    params.pillar === 'storytelling'
      ? params.storytellingStyle === 'roleplay'
        ? `\nYêu cầu đặc biệt về CÁCH VIẾT KỂ CHUYỆN SÁNG TẠO:
- Áp dụng Cách 2: Đóng vai thành nhân vật trong truyện để kể lại (ngôi thứ nhất: xưng "tôi", "mình", hoặc "cháu/em" phù hợp nhân vật).
${
  params.roleplayCharacter
    ? `- Nhân vật nhập vai: ${params.roleplayCharacter}.`
    : '- Hãy nhập vai trực tiếp vào nhân vật chính hoặc sự vật được nhắc tới trong câu gốc.'
}
- Cả 3 phương án nâng cấp đều phải kể bằng giọng văn nhập vai giàu cảm xúc nội tâm, suy nghĩ và lời tự sự sinh động của nhân vật đó.`
        : `\nYêu cầu đặc biệt về CÁCH VIẾT KỂ CHUYỆN SÁNG TẠO:
- Áp dụng Cách 1: Viết sáng tạo bằng cách thêm các chi tiết sáng tạo (thêm tả ngoại hình, cử chỉ, âm thanh, bối cảnh không gian, suy nghĩ hoặc lời thoại ngắn tự nhiên để câu chuyện sống động và giàu sức hút hơn).`
      : '';

  const userPrompt = `Dạng bài tập làm văn lớp 5: ${PILLAR_LABELS[params.pillar]}.${storytellingGuidance}
Câu văn đơn giản của Bạn nhỏ: "${params.sentence}"

Hãy giúp Bạn nhỏ nâng cấp câu văn này thành 3 phương án ngày càng giàu hình ảnh và cảm xúc, phù hợp học sinh lớp 5:
- Phương án 1 (Cấp độ Khởi sắc): Bổ sung từ láy, tính từ màu sắc, hình dáng hoặc âm thanh sinh động.
- Phương án 2 (Cấp độ So sánh): Sử dụng phép So sánh tự nhiên, giàu sức gợi.
- Phương án 3 (Cấp độ Nhân hóa & Cảm xúc): Sử dụng phép Nhân hóa kết hợp hình ảnh tinh tế, mềm mại.

Trả về đúng định dạng JSON theo schema đã cho.`;

  const schema = {
    type: 'OBJECT',
    properties: {
      originalAnalysis: {
        type: 'STRING',
        description: 'Nhận xét ngắn gọn (1-2 câu) về ưu điểm câu gốc và điểm có thể làm sinh động hơn cho học sinh lớp 5.',
      },
      upgrades: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            level: { type: 'STRING', description: 'Tên cấp độ, ví dụ: Cấp độ 1: Thêm từ láy & sắc màu' },
            sentence: { type: 'STRING', description: 'Câu văn sau khi nâng cấp giàu hình ảnh.' },
            devices: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Tên biện pháp tu từ hoặc loại từ nổi bật (ví dụ: Từ láy, So sánh, Nhân hóa).',
            },
            highlightWords: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: '2 đến 4 từ/cụm từ đắt giá xuất hiện nguyên văn trong câu đã nâng cấp.',
            },
            explanation: {
              type: 'STRING',
              description: 'Giải thích ngắn gọn, dễ hiểu cho trẻ 10 tuổi vì sao câu này hay hơn.',
            },
          },
          required: ['level', 'sentence', 'devices', 'highlightWords', 'explanation'],
        },
      },
      bonusVocabulary: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING' },
            category: { type: 'STRING', description: 'Ví dụ: Từ láy, Tính từ, Động từ gợi tả' },
            meaning: { type: 'STRING', description: 'Nghĩa ngắn gọn, dễ hiểu cho lớp 5' },
          },
          required: ['word', 'category', 'meaning'],
        },
      },
      encouragement: {
        type: 'STRING',
        description: 'Một câu khen ngợi, khích lệ ấm áp từ Trợ lý Ngôn Từ dành cho Bạn nhỏ.',
      },
    },
    required: ['originalAnalysis', 'upgrades', 'bonusVocabulary', 'encouragement'],
  };

  return executeWithFallback<UpgradeResponse>({
    userPrompt,
    responseSchema: schema,
    onModelAttempt: params.onModelAttempt,
  });
}

export interface SingleStepUpgradeResult {
  step: 1 | 2 | 3;
  level: string;
  sentence: string;
  devices: string[];
  highlightWords: string[];
  explanation: string;
}

/**
 * Xử lý nâng cấp từng bước (Step 1, 2, hoặc 3) độc lập.
 * Cho phép retry model khi bước đang chạy gặp lỗi mà không làm mất kết quả các bước trước đó.
 */
export async function aiUpgradeSingleStep(params: {
  sentence: string;
  pillar: PillarId;
  step: 1 | 2 | 3;
  storytellingStyle?: StorytellingStyle;
  roleplayCharacter?: string;
  onModelAttempt?: (model: string, attempt: number, total: number) => void;
}): Promise<AiExecutionResult<SingleStepUpgradeResult>> {
  const stepGoals = {
    1: 'Phương án 1 (Cấp độ 1 - Khởi sắc): Bổ sung từ láy, tính từ màu sắc, hình dáng hoặc âm thanh sinh động.',
    2: 'Phương án 2 (Cấp độ 2 - So sánh): Sử dụng phép So sánh tự nhiên, giàu sức gợi, gần gũi với trẻ em.',
    3: 'Phương án 3 (Cấp độ 3 - Nhân hóa & Cảm xúc): Sử dụng phép Nhân hóa kết hợp hình ảnh tinh tế, mềm mại.',
  };

  const storytellingGuidance =
    params.pillar === 'storytelling'
      ? params.storytellingStyle === 'roleplay'
        ? `\nKể theo Cách 2: Đóng vai nhân vật ${params.roleplayCharacter || 'chính'} (xưng "tôi" hoặc "mình").`
        : '\nKể theo Cách 1: Thêm chi tiết miêu tả, cử chỉ, âm thanh sinh động.'
      : '';

  const userPrompt = `Dạng bài văn lớp 5: ${PILLAR_LABELS[params.pillar]}.${storytellingGuidance}
Câu văn mộc ban đầu của Bạn nhỏ: "${params.sentence}"

Yêu cầu cho Bước ${params.step}:
${stepGoals[params.step]}

Trả về đúng định dạng JSON theo schema đã cho.`;

  const schema = {
    type: 'OBJECT',
    properties: {
      level: { type: 'STRING', description: `Tên cấp độ, ví dụ: Cấp độ ${params.step}: ...` },
      sentence: { type: 'STRING', description: 'Câu văn sau khi nâng cấp giàu hình ảnh.' },
      devices: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: 'Tên biện pháp tu từ hoặc loại từ nổi bật.',
      },
      highlightWords: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: '2 đến 4 từ đắt giá xuất hiện trong câu.',
      },
      explanation: {
        type: 'STRING',
        description: 'Giải thích ngắn gọn cho trẻ 10 tuổi vì sao câu này hay hơn.',
      },
    },
    required: ['level', 'sentence', 'devices', 'highlightWords', 'explanation'],
  };

  const res = await executeWithFallback<{
    level: string;
    sentence: string;
    devices: string[];
    highlightWords: string[];
    explanation: string;
  }>({
    userPrompt,
    responseSchema: schema,
    onModelAttempt: params.onModelAttempt,
  });

  return {
    data: {
      step: params.step,
      level: res.data.level,
      sentence: res.data.sentence,
      devices: res.data.devices,
      highlightWords: res.data.highlightWords,
      explanation: res.data.explanation,
    },
    usedModel: res.usedModel,
    attemptsCount: res.attemptsCount,
  };
}

// 2. Writing Error Checker & Explainer Function
export async function aiCheckWriting(params: {
  text: string;
  pillar: PillarId;
  storytellingStyle?: StorytellingStyle;
  roleplayCharacter?: string;
  onModelAttempt?: (model: string, attempt: number, total: number) => void;
}): Promise<AiExecutionResult<CheckWritingResponse>> {
  const checkStyleNote =
    params.pillar === 'storytelling'
      ? params.storytellingStyle === 'roleplay'
        ? `\nLưu ý về CÁCH VIẾT KỂ CHUYỆN SÁNG TẠO (Cách 2 - Đóng vai nhân vật${
            params.roleplayCharacter ? `: ${params.roleplayCharacter}` : ''
          }):
- Kiểm tra xem Bạn nhỏ đã giữ nhất quán ngôi kể thứ nhất (xưng "tôi/mình") và thể hiện được cảm xúc, góc nhìn riêng của nhân vật chưa. Bản chỉnh sửa và câu gợi ý mở rộng phải giữ đúng giọng nhập vai nhân vật đó.`
        : `\nLưu ý về CÁCH VIẾT KỂ CHUYỆN SÁNG TẠO (Cách 1 - Thêm chi tiết sáng tạo):
- Góp ý cách bổ sung chi tiết tả cảnh, cử chỉ, cảm xúc hoặc lời thoại tự nhiên để câu chuyện hấp dẫn, giàu trí tưởng tượng hơn.`
      : '';

  const userPrompt = `Dạng bài tập làm văn lớp 5: ${PILLAR_LABELS[params.pillar]}.${checkStyleNote}
Bài viết của Bạn nhỏ:
"${params.text}"

Hãy đọc thật kỹ bài viết như một người bạn đồng hành dịu dàng:
1. Tìm điểm sáng đáng khen trước.
2. Chỉ ra từng lỗi cụ thể (nếu có: lỗi chính tả, lặp từ, câu cụt thiếu chủ ngữ/vị ngữ, dấu câu, diễn đạt chưa tự nhiên). Với mỗi lỗi, PHẢI giải thích thật dễ hiểu "tại sao sai" để học sinh lớp 5 tự hiểu và nhớ lâu. Nếu bài đã đúng chính tả và ngữ pháp, vẫn có thể gợi ý 1-2 điểm tinh chỉnh diễn đạt để mượt hơn (ghi rõ là gợi ý diễn đạt).
3. Viết lại phiên bản đã chỉnh sửa mượt mà, giữ nguyên ý tưởng hồn nhiên của Bạn nhỏ.
4. Gợi ý thêm 1 câu mở rộng có dùng phép So sánh hoặc Nhân hóa mà Bạn nhỏ có thể ghép thêm vào bài.`;

  const schema = {
    type: 'OBJECT',
    properties: {
      praise: {
        type: 'STRING',
        description: 'Lời khen cụ thể về ý tưởng hoặc chi tiết hay trong bài của Bạn nhỏ.',
      },
      correctedText: {
        type: 'STRING',
        description: 'Đoạn văn hoàn chỉnh sau khi đã sửa lỗi và làm mượt câu chữ, giữ giọng văn lớp 5.',
      },
      issues: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            wrongSnippet: { type: 'STRING', description: 'Cụm từ/câu cần sửa trong bài gốc.' },
            fixedSnippet: { type: 'STRING', description: 'Cách sửa đúng và hay hơn.' },
            category: { type: 'STRING', description: 'Loại lỗi: Chính tả, Lặp từ, Ngữ pháp, Dấu câu, hoặc Diễn đạt.' },
            whyWrong: { type: 'STRING', description: 'Giải thích "tại sao sai" thật dễ hiểu cho trẻ 10 tuổi.' },
            tip: { type: 'STRING', description: 'Mẹo nhỏ dễ nhớ để lần sau không mắc lại.' },
          },
          required: ['wrongSnippet', 'fixedSnippet', 'category', 'whyWrong', 'tip'],
        },
      },
      literaryBoost: {
        type: 'OBJECT',
        properties: {
          device: { type: 'STRING', description: 'So sánh hoặc Nhân hóa' },
          suggestion: { type: 'STRING', description: '1 câu gợi ý mở rộng giàu hình ảnh để ghép vào bài.' },
        },
        required: ['device', 'suggestion'],
      },
      encouragement: {
        type: 'STRING',
        description: 'Lời nhắn khích lệ cuối cùng của Trợ lý Ngôn Từ.',
      },
    },
    required: ['praise', 'correctedText', 'issues', 'literaryBoost', 'encouragement'],
  };

  return executeWithFallback<CheckWritingResponse>({
    userPrompt,
    responseSchema: schema,
    onModelAttempt: params.onModelAttempt,
  });
}

// 3. Topic Vocab Suggester Function
export async function aiSuggestVocab(params: {
  topic: string;
  pillar: PillarId;
  onModelAttempt?: (model: string, attempt: number, total: number) => void;
}): Promise<AiExecutionResult<SuggestVocabResponse>> {
  const userPrompt = `Chủ đề viết văn lớp 5: "${params.topic}" (thuộc dạng bài: ${PILLAR_LABELS[params.pillar]}).
Hãy gợi ý 6 từ/cụm từ đắt giá, giàu hình ảnh cho học sinh lớp 5 gồm đa dạng: Từ láy, Màu sắc & Ánh sáng, Âm thanh & Hình dáng, So sánh, và Nhân hóa.
Mỗi từ cần có nghĩa dễ hiểu và 1 câu văn mẫu lớp 5 thật trong sáng, sinh động.`;

  const schema = {
    type: 'OBJECT',
    properties: {
      topicTitle: { type: 'STRING' },
      writingTip: { type: 'STRING', description: '1 bí kíp quan sát nhanh khi viết về chủ đề này.' },
      words: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING' },
            category: {
              type: 'STRING',
              description: 'Một trong 5 loại: Từ láy, Màu sắc & Ánh sáng, Âm thanh & Hình dáng, So sánh, Nhân hóa',
            },
            meaning: { type: 'STRING' },
            example: { type: 'STRING' },
          },
          required: ['word', 'category', 'meaning', 'example'],
        },
      },
      encouragement: { type: 'STRING' },
    },
    required: ['topicTitle', 'writingTip', 'words', 'encouragement'],
  };

  return executeWithFallback<SuggestVocabResponse>({
    userPrompt,
    responseSchema: schema,
    onModelAttempt: params.onModelAttempt,
  });
}

// 4. Dynamic Story Adventure Generator Function
export async function aiGenerateStoryAdventure(params: {
  theme?: string;
  storytellingStyle?: StorytellingStyle;
  roleplayCharacter?: string;
  excludeTitles?: string[];
  onModelAttempt?: (model: string, attempt: number, total: number) => void;
}): Promise<AiExecutionResult<StoryAdventure>> {
  const styleInstruction =
    params.storytellingStyle === 'roleplay'
      ? `Áp dụng CÁCH 2 — Đóng vai thành nhân vật trong truyện để kể lại (ngôi thứ nhất xưng "tôi" hoặc "mình"). ${
          params.roleplayCharacter
            ? `Nhân vật kể chuyện là: "${params.roleplayCharacter}".`
            : 'Hãy chọn một nhân vật thú vị (con vật, đồ vật hoặc bạn nhỏ) làm người kể chuyện xưng "tôi".'
        }`
      : 'Áp dụng CÁCH 1 — Viết sáng tạo bằng cách thêm các chi tiết miêu tả, cử chỉ, âm thanh, cảm xúc và lời thoại sinh động (ngôi thứ ba hoặc người chứng kiến).';

  const avoidBlock =
    params.excludeTitles && params.excludeTitles.length > 0
      ? `\nTUYỆT ĐỐI KHÔNG lặp lại cốt truyện, nhân vật chính hay tiêu đề giống các truyện đã chơi sau: ${params.excludeTitles.join(
          '; '
        )}. Hãy sáng tạo bối cảnh và nhân vật hoàn toàn mới mẻ!`
      : '';

  const userPrompt = `Hãy thiết kế 1 trò chơi "Xếp gạch Cốt truyện Sáng tạo" hoàn toàn mới dành cho học sinh lớp 5 tại Việt Nam.
${
  params.theme
    ? `Chủ đề / ý tưởng Bạn nhỏ mong muốn: "${params.theme}".`
    : 'Chủ đề: Hãy chọn ngẫu nhiên một đề tài gần gũi, giàu trí tưởng tượng cho trẻ 10 tuổi Việt Nam (như thiên nhiên, mái trường, cổ tích viết lại, đồ vật biết nói, loài vật thân quen, mùa hè quê hương...).'
}
${styleInstruction}${avoidBlock}

Cấu trúc bắt buộc gồm đúng 3 chặng liên kết mạch lạc thành một câu chuyện trọn vẹn:
- Chặng 1: Mở đầu lôi cuốn
- Chặng 2: Thắt nút bất ngờ
- Chặng 3: Mở nút ấm áp

Mỗi chặng có đúng 2 nhánh lựa chọn ("choices"), mỗi nhánh là 2-3 câu văn tiếng Việt lớp 5 trong sáng, giàu từ láy, So sánh hoặc Nhân hóa để khi ghép 3 nhánh bất kỳ từ 3 chặng lại vẫn tạo thành một câu chuyện liền mạch, ý nghĩa.`;

  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING', description: 'Tên câu chuyện mới mẻ, hấp dẫn học sinh lớp 5.' },
      theme: { type: 'STRING', description: 'Chủ đề ngắn gọn (4-7 từ).' },
      narratorRole: {
        type: 'STRING',
        description: 'Vai người kể chuyện (ví dụ: Đóng vai Chú Dế Mèn, hoặc Người kể chuyện sáng tạo).',
      },
      steps: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            stage: { type: 'STRING' },
            question: { type: 'STRING' },
            choices: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  label: { type: 'STRING', description: 'Tên ngắn gọn của nhánh lựa chọn.' },
                  snippet: { type: 'STRING', description: '2-3 câu văn hoàn chỉnh cho chặng này.' },
                  deviceTag: { type: 'STRING', description: 'Biện pháp nổi bật, ví dụ: So sánh + Từ láy.' },
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
  };

  interface RawStoryResponse {
    title: string;
    theme: string;
    narratorRole?: string;
    steps: {
      stage: string;
      question: string;
      choices: { label: string; snippet: string; deviceTag: string }[];
    }[];
  }

  const result = await executeWithFallback<RawStoryResponse>({
    userPrompt,
    responseSchema: schema,
    onModelAttempt: params.onModelAttempt,
  });

  const storyId = `ai-story-${Date.now()}`;
  const adventure: StoryAdventure = {
    id: storyId,
    title: result.data.title,
    theme: result.data.theme,
    storytellingStyle: params.storytellingStyle || 'add_details',
    narratorRole:
      result.data.narratorRole ||
      (params.storytellingStyle === 'roleplay'
        ? params.roleplayCharacter || 'Nhân vật trong truyện'
        : 'Thêm chi tiết sáng tạo'),
    steps: (result.data.steps || []).slice(0, 3).map((step, sIdx) => ({
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

  return {
    data: adventure,
    usedModel: result.usedModel,
    attemptsCount: result.attemptsCount,
  };
}
