
export interface UserInputs {
  topic: string;
  target: string;
  goal: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING_PLAN = 'GENERATING_PLAN',
  PLAN_COMPLETE = 'PLAN_COMPLETE',
  GENERATING_CODE = 'GENERATING_CODE',
  CODE_COMPLETE = 'CODE_COMPLETE',
  ERROR = 'ERROR'
}

export type ImageProvider = 'unsplash' | 'pexels' | 'pixabay' | 'loremflickr';

export interface ApiKeys {
  preferredProvider: ImageProvider;
  unsplashAccessKey?: string;
  pexelsApiKey?: string;
  pixabayApiKey?: string;
}
