
export const VERCEL_TROUBLESHOOTING_GUIDE = `
## vercel 배포 문제 해결 가이드

### 문제 1: 빈 화면 (White Screen)
**원인**: \`index.html\`에 \`<script type="module" src="/src/main.tsx"></script>\` 누락

**해결**:
1. \`index.html\` 열기
2. \`</body>\` 직전에 스크립트 태그 추가
3. 정확한 경로(\`/src/main.tsx\`) 확인

### 문제 2: 파일 구조가 잘못됨
**원인**: 디렉토리가 생성되지 않고 루트에 파일이 생성됨

**해결**:
1. 먼저 \`mkdir -p src/components src/pages src/images\` 실행
2. 각 파일을 정확한 경로에 생성
3. 예: \`HomePage.tsx\`는 반드시 \`src/pages/HomePage.tsx\`에 위치

### 문제 3: 404 에러 (서브페이지)
**원인**: \`vercel.json\` 누락

**해결**:
1. 프로젝트 루트에 \`vercel.json\` 파일 생성
2. 아래 내용 작성:
   \`\`\`json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   \`\`\`
`;

interface TopicTemplate {
  type: string;
  description: string;
  structure: string;
}

export const TOPIC_TEMPLATES: Record<string, TopicTemplate> = {
  "개인 홈피(About Me)": {
    type: "Card Type",
    description: "개인의 아이덴티티와 히스토리를 보여주는 퍼스널 브랜딩 페이지",
    structure: "Main: 핵심 요약 / Sub 1: 상세 소개(About), Sub 2: 타임라인(Journey), Sub 3: 갤러리(Life), Sub 4: 연락처(Contact)"
  },
  "프로필 카드(링크 인 바이오)": {
    type: "Card Type",
    description: "SNS 바이오 링크용 모바일 최적화 프로필 및 리소스 허브",
    structure: "Main: 프로필 및 링크 목록 / Sub 1: 상세 프로필(Profile), Sub 2: 추천 리소스(Links), Sub 3: 포트폴리오 요약(Work), Sub 4: 문의하기(Ask me)"
  },
  "이력서/경력 소개(온라인 CV)": {
    type: "Document Type",
    description: "전문성을 강조하는 상세한 온라인 이력서 및 경력 기술서",
    structure: "Main: 경력 요약 / Sub 1: 경력 기술서(Experience), Sub 2: 프로젝트 상세(Projects), Sub 3: 기술/자격증(Skills), Sub 4: 자기소개서(Cover Letter)"
  },
  "포트폴리오(디자이너/개발자/작가)": {
    type: "Gallery Type",
    description: "작업물을 시각적으로 돋보이게 하는 전문 포트폴리오",
    structure: "Main: 대표 작품 썸네일 / Sub 1: 작품 상세(Projects), Sub 2: 소개(About Me), Sub 3: 서비스 안내(Services), Sub 4: 견적 문의(Contact)"
  },
  "회사, 병원, 기업, 가게 등의 홍보 페이지": {
    type: "Landing Type",
    description: "고객에게 신뢰감을 주는 기업/브랜드 공식 홈페이지",
    structure: "Main: 히어로 및 특징 / Sub 1: 회사 소개(About Us), Sub 2: 서비스/제품(Products), Sub 3: 고객 후기(Reviews), Sub 4: 오시는 길/문의(Location)"
  },
  "뉴스레터 구독": {
    type: "Hero Type",
    description: "이메일 수집에 최적화된 뉴스레터 랜딩 및 아카이브",
    structure: "Main: 구독 유도 / Sub 1: 지난 뉴스레터(Archive), Sub 2: 에디터 소개(Editor), Sub 3: 구독 혜택(Benefits), Sub 4: 자주 묻는 질문(FAQ)"
  },
  "콘텐츠 허브(블로그/유튜브/팟캐스트 모음)": {
    type: "Gallery Type",
    description: "다양한 채널의 콘텐츠를 한곳에 모은 미디어 허브",
    structure: "Main: 최신 피드 / Sub 1: 비디오/영상(Videos), Sub 2: 아티클/글(Articles), Sub 3: 추천 리소스(Resources), Sub 4: 커뮤니티(Community)"
  },
  "디지털 굿즈 판매(템플릿, 전자책, 코드 스니펫)": {
    type: "Gallery Type",
    description: "디지털 상품을 매력적으로 진열하고 판매하는 스토어",
    structure: "Main: 베스트셀러 / Sub 1: 전체 상품(Shop), Sub 2: 사용 가이드(Guide), Sub 3: 라이선스 안내(License), Sub 4: 고객센터(Support)"
  },
  "컨설팅/멘토링 예약": {
    type: "Landing Type",
    description: "전문가 신뢰 구축 및 상담 예약을 위한 페이지",
    structure: "Main: 문제 해결 제안 / Sub 1: 전문가 소개(Profile), Sub 2: 프로그램 상세(Program), Sub 3: 성공 사례(Cases), Sub 4: 예약/신청(Booking)"
  },
  "프리랜서 서비스(디자인/개발/번역 등)": {
    type: "Landing Type",
    description: "서비스 특징과 작업 프로세스를 안내하는 수주용 페이지",
    structure: "Main: 서비스 요약 / Sub 1: 서비스 목록(Services), Sub 2: 작업 프로세스(Process), Sub 3: 포트폴리오(Portfolio), Sub 4: 견적 문의(Request)"
  },
  "수업/클래스/워크숍 접수": {
    type: "Landing Type",
    description: "강의 매력을 어필하고 수강생을 모집하는 페이지",
    structure: "Main: 강의 소개 / Sub 1: 상세 커리큘럼(Curriculum), Sub 2: 강사 소개(Instructor), Sub 3: 수강 후기(Reviews), Sub 4: 수강 신청(Apply)"
  },
  "지역 소규모 서비스(사진 촬영, 홈튜터, 헤어 등)": {
    type: "Landing Type",
    description: "지역 기반 서비스의 친근함과 정보를 제공",
    structure: "Main: 서비스 매력 발산 / Sub 1: 서비스 소개(Info), Sub 2: 가격표(Price List), Sub 3: 갤러리(Gallery), Sub 4: 예약/문의(Reservation)"
  },
  "후원/기부(크리에이터 후원, 프로젝트 펀딩)": {
    type: "Hero Type",
    description: "프로젝트 비전을 공유하고 후원을 받는 페이지",
    structure: "Main: 프로젝트 비전 / Sub 1: 스토리(Story), Sub 2: 후원 내역(History), Sub 3: 후원자 명단(Donors), Sub 4: 리워드 안내(Rewards)"
  },
  "웹도구 모음(개발·마케팅 툴북마크/본인 제작 툴)": {
    type: "Gallery Type",
    description: "유용한 도구들을 카테고리별로 큐레이션한 디렉토리",
    structure: "Main: 인기 도구 / Sub 1: 개발 도구(Dev Tools), Sub 2: 디자인 도구(Design Tools), Sub 3: 생산성 도구(Productivity), Sub 4: 도구 제보(Submit)"
  },
  "바로가기(즐겨찾기/리소스 링크 허브)": {
    type: "Card Type",
    description: "자주 쓰는 리소스나 링크를 분류하여 제공",
    structure: "Main: 카테고리별 링크 / Sub 1: 업무용(Work), Sub 2: 학습용(Study), Sub 3: 휴식/취미(Rest), Sub 4: 자료실(Archive)"
  },
  "미니 웹앱/게임/계산기/체크리스트": {
    type: "Hero Type",
    description: "단일 기능 웹앱과 부가 정보를 제공",
    structure: "Main: 웹앱 인터페이스 / Sub 1: 사용법(How to), Sub 2: 업데이트 로그(Changelog), Sub 3: 개발자 소개(Dev), Sub 4: 버그 제보(Report)"
  },
  "오픈소스/프로젝트 랜딩": {
    type: "Landing Type",
    description: "오픈소스 프로젝트의 문서와 커뮤니티를 위한 랜딩",
    structure: "Main: 프로젝트 소개 / Sub 1: 문서(Docs), Sub 2: 튜토리얼(Tutorial), Sub 3: 기여 가이드(Contribute), Sub 4: 변경 내역(Releases)"
  },
  "대기자 명단(앱/사이드 프로젝트)": {
    type: "Hero Type",
    description: "출시 전 기대감을 높이고 사전 예약을 받는 티저",
    structure: "Main: 티저 및 신청 / Sub 1: 기능 미리보기(Preview), Sub 2: 로드맵(Roadmap), Sub 3: 팀 소개(Team), Sub 4: 자주 묻는 질문(FAQ)"
  },
  "설문/피드백 수집": {
    type: "Hero Type",
    description: "사용자 의견 수집을 위한 깔끔한 설문 페이지",
    structure: "Main: 설문 목적 / Sub 1: 설문 참여(Survey), Sub 2: 결과 보기(Results), Sub 3: 참여 혜택(Benefits), Sub 4: 개인정보처리방침(Privacy)"
  },
  "기타(사용자입력)": {
    type: "Auto-Detect",
    description: "AI가 주제를 분석하여 최적의 유형 자동 선정",
    structure: "Main: 핵심 섹션 / Sub 1: 상세 정보, Sub 2: 기능/서비스, Sub 3: 소개/안내, Sub 4: 문의/지원 (주제에 맞춰 4개 필수 구성)"
  }
};
