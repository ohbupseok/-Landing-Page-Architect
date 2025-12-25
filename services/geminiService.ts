
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { UserInputs } from '../types';
import { TOPIC_TEMPLATES } from './templateData';

let aiInstance: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

export const initializeGemini = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  aiInstance = new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
당신은 Google의 **수석 UX/UI 디자이너**이자 **전문 풀스택 개발자**입니다.

**[핵심 역할: 주제별 맞춤형 템플릿 매핑]**
사용자의 **'웹사이트 주제(Topic)'**를 분석하여, 정의된 **스타일 매핑 규칙**을 **엄격히** 따르세요.
모든 결과물이 천편일률적인 '홈페이지'가 되지 않도록, 주제에 따라 레이아웃을 확실히 차별화해야 합니다.

**[스타일 매핑 규칙 (Topic Keyword -> Layout Type)]**
1. **[Card Type] (모바일 프로필/링크트리 스타일)**
   - 특징: 화면 중앙에 폰 크기의 카드 하나만 떠 있음. 배경은 그라데이션/이미지.

2. **[Document Type] (A4/문서 스타일)**
   - 특징: 종이 질감 또는 깔끔한 흰색 배경의 중앙 정렬된 문서 형태. 타이포그래피 강조.

3. **[Hero Type] (단일 섹션/입력폼 중심)**
   - 특징: 스크롤 없는 풀스크린 화면. 강렬한 헤드라인 + 이메일 입력폼이 핵심.

4. **[Gallery Type] (그리드/이미지 중심)**
   - 특징: 핀터레스트 스타일의 Masonry 그리드 또는 카드 나열 형태.

5. **[Landing Type] (섹션 스크롤/일반 웹사이트)**
   - 특징: Hero -> Features -> Proof -> CTA 흐름의 전형적인 긴 페이지.

**[필수 공통 규칙]**
1. **구조 준수**: 프롬프트로 전달된 'Structure Strategy'에 정의된 메인 페이지와 서브 페이지(Sub 1~4)의 구성을 **반드시** 그대로 따라야 합니다. 임의로 변경하지 마십시오.
2. **언어**: 모든 기획 내용, 설명, UI 텍스트는 반드시 **한국어**로 작성합니다. (기술 스택 명칭 등 불가피한 영어 제외)
3. **출력 형식**: 
   - Phase 1: **JSON 포맷** (Markdown 아님).
   - Phase 2: 순수 HTML 코드.
4. **이미지**: \`https://loremflickr.com/1600/900/{english_keyword}\` 사용.

**금지 사항:**
- 잡담, 인사말, 대화형 멘트 절대 금지.
`;

export const generateSuggestions = async (topic: string): Promise<{ target: string; goal: string }> => {
  if (!aiInstance) {
    initializeGemini();
  }
  if (!aiInstance) throw new Error("Gemini not initialized");

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the website topic: "${topic}".
      Suggest a specific target audience and a concrete core goal in Korean.
      
      Rules:
      1. Target: Specific demographic + psychographic (e.g., "Efficiency-seeking 30s office workers").
      2. Goal: Measurable or clear value proposition (e.g., "Achieve 10% conversion rate for free trials").
      3. Language: Korean.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            target: { type: Type.STRING },
            goal: { type: Type.STRING },
          },
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Suggestion generation failed", e);
    return { target: "", goal: "" };
  }
};

export const startPlanningSession = async (inputs: UserInputs): Promise<string> => {
  if (!aiInstance) {
    initializeGemini();
  }
  
  if (!aiInstance) {
     throw new Error("Failed to initialize Gemini");
  }

  chatSession = aiInstance.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  // Determine which template to use
  const selectedTemplate = TOPIC_TEMPLATES[inputs.topic] || TOPIC_TEMPLATES["기타(사용자입력)"];

  const prompt = `
# Context (맥락)
나는 **"${inputs.topic}"**라는 주제로 웹사이트를 제작하려고 합니다.
지정된 **템플릿 가이드**와 **구조 전략**을 엄격히 준수하여 기획안을 작성해 주세요.

**[사용자 입력 정보]**
* **웹사이트 주제**: ${inputs.topic}
* **타겟 고객**: ${inputs.target}
* **핵심 목표**: ${inputs.goal}

**[필수 반영 구조 (Structure Strategy)]**
다음 구조를 반드시 따르세요. 서브 페이지의 개수와 역할을 임의로 변경하지 마세요:
"${selectedTemplate.structure}"

# Task (지시사항)
**Phase 1: 맞춤형 상세 기획**을 **순수 JSON 포맷**으로 작성하세요.
Markdown 코드 블록(\`\`\`json) 없이 **Raw JSON 텍스트**만 출력하세요.

**JSON 구조 (Schema Example):**
{
  "projectInfo": {
    "topic": "String",
    "target": "String",
    "goal": "String",
    "language": "Korean (한국어)",
    "selectedStyle": "${selectedTemplate.type}",
    "structureStrategy": "${selectedTemplate.structure}",
    "designIntent": "String (상세 서술)"
  },
  "structure": {
    "mainPage": {
      "sections": ["Header", "Hero", "Features", "..."],
      "description": "String"
    },
    "subPages": [
      {
        "id": "String (e.g., sub1, sub2)",
        "title": "String (위 Structure Strategy의 명칭 준수)",
        "path": "String (e.g., /about)",
        "purpose": "String",
        "contentSpecs": "String"
      }
    ]
  },
  "contentStrategy": {
    "headline": "String",
    "cta": "String",
    "keyMessages": ["String", "String"]
  },
  "designSystem": {
    "colorPalette": { "primary": "String", "secondary": "String", "background": "String" },
    "typography": "String",
    "moodboard": "String"
  },
  "developmentGuide": {
    "stack": "Vite + React + TypeScript",
    "folderStructure": "String (Description of src/components, src/pages etc)",
    "vercelDeploymentConfig": {
       "instruction": "Vercel 배포가 가능한 Vite + React + TypeScript 프로젝트 구조로 변환",
       "indexHtmlSetup": "index.html 내 <script type='module' src='/src/main.tsx'></script> 포함하게"
    },
    "imageConfiguration": {
       "storagePath": "src/assets/images",
       "manifestFile": "src/assets/images/images.txt (사용된 이미지 파일명 목록 명시)"
    }
  },
  "imageAssets": [
    {
      "name": "String (e.g., HERO_BG)",
      "url": "https://loremflickr.com/1600/900/{english_keyword}",
      "description": "String",
      "prompt": "String"
    }
  ]
}

**모든 값은 한국어로 작성하되, developmentGuide 내부의 vercelDeploymentConfig와 imageConfiguration 내용은 위 예시의 요구사항을 그대로 유지/반영하세요.**
`;

  const response = await chatSession.sendMessage({ message: prompt });
  let planText = response.text || "{}";
  
  // Clean up if the model wrapped in markdown
  planText = planText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  
  try {
     const parsed = JSON.parse(planText);
     return JSON.stringify(parsed, null, 2);
  } catch (e) {
     console.warn("Returned text is not valid JSON, returning raw text", e);
     return planText;
  }
};

export const generateCodePhase = async (): Promise<string> => {
  if (!chatSession) {
    throw new Error("세션이 만료되었습니다. 처음부터 다시 시작해주세요.");
  }

  const prompt = `
# Task (지시사항)
**Phase 2: 코드 구현**을 진행해 주세요.

위에서 작성한 **기획안(JSON)**의 내용을 바탕으로, **[스타일 유형]**에 맞춰 단일 HTML을 작성하세요.
각 유형별 **HTML 구조 및 Tailwind 클래스 가이드**를 준수하세요.

**[금지 사항 (Strict Constraints)]**
* **\`<script type="importmap">\` 태그를 절대 사용하지 마세요.** (Vercel 배포 시 충돌 원인이 됩니다)
* React나 ReactDOM import 구문을 사용하지 마세요. (순수 HTML/JS로 프로토타입 구현)

**[구현 가이드: 스타일별 레이아웃]**

1. **Card Type (프로필, 링크)**:
   - \`body\` 전체에 배경 이미지/그라데이션 적용 (\`min-h-screen flex items-center justify-center\`).
   - 콘텐츠는 **중앙의 좁은 카드 (\`max-w-md w-full bg-white/90 rounded-3xl shadow-2xl\`)** 내부에만 배치.
   - 절대 전체 너비 헤더나 푸터를 사용하지 마시오.

2. **Document Type (이력서, CV)**:
   - 배경은 회색톤 (\`bg-slate-100\`).
   - 콘텐츠는 **A4 비율 컨테이너 (\`max-w-3xl mx-auto bg-white shadow-lg p-8 my-10\`)**.
   - 섹션 간 구분선과 타이포그래피 위주.

3. **Hero Type (뉴스레터, 대기자)**:
   - **스크롤 없는 풀스크린 (\`h-screen flex flex-col justify-center items-center text-center overflow-hidden\`)**.
   - 거대한 헤드라인과 중앙 입력폼(Input + Button)이 핵심.

4. **Gallery Type (포트폴리오, 굿즈)**:
   - 헤더(로고/메뉴) 존재.
   - 메인 콘텐츠는 **그리드 레이아웃 (\`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4\`)**.
   - 각 아이템은 이미지 위주의 카드 형태.

5. **Landing Type (홍보, 서비스)**:
   - 일반적인 웹사이트 구조.
   - Full Width Hero Section -> Features Section -> Content Section -> CTA.

**[필수 기능 구현]**
1. **메인 & 서브 페이지 (SPA 모방)**:
   - \`<div id="home">...</div>\`: 메인 콘텐츠.
   - \`<div id="sub-page">...</div>\`: 서브 페이지 (초기 \`hidden\`).
   - 버튼 클릭 시 \`document.getElementById('home').classList.add('hidden'); document.getElementById('sub-page').classList.remove('hidden');\` 동작.
   - 서브 페이지 내 **'뒤로 가기'** 버튼 필수.

2. **기술 요소**:
   - Tailwind CSS CDN, FontAwesome CDN 포함.
   - 모든 텍스트는 **한국어**.
   - 이미지는 \`https://loremflickr.com/...\` 사용.
   - **지도(Maps)**: 기획안에 지도 섹션이 명시된 경우에만 Google Maps iframe 포함.

**출력 형식**:
* 설명 없이 \`<!DOCTYPE html>\`로 시작하여 \`</html>\`로 끝나는 코드만 출력.
`;

  const response = await chatSession.sendMessage({ message: prompt });
  const text = response.text || "";

  // 1. Strict HTML Extraction Logic
  const startString = "<!DOCTYPE html>";
  const endString = "</html>";
  const startIndex = text.indexOf(startString);
  const endIndex = text.lastIndexOf(endString);

  if (startIndex !== -1 && endIndex !== -1) {
    return text.substring(startIndex, endIndex + endString.length);
  }

  // 2. Fallback matches
  const codeBlockMatch = text.match(/```html([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  if (text.trim().startsWith('<') && text.trim().endsWith('>')) {
    return text.trim();
  }

  return `<!-- Error: Formatting issue -->
  <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div class="text-center">
        <h1 class="text-2xl font-bold mb-4">코드 생성 형식 오류</h1>
        <p>AI가 올바른 HTML 형식을 반환하지 않았습니다. 다시 시도해주세요.</p>
    </div>
  </div>`;
};
