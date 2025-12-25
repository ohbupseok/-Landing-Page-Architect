
import { ApiKeys } from '../types';

const STORAGE_KEY = 'landing_arch_config';
const SALT = 'landing-page-architect-salt-v1';

// Simple XOR cipher for basic client-side obfuscation
const xorEncrypt = (text: string): string => {
  const textToChars = (text: string) => text.split('').map((c) => c.charCodeAt(0));
  const byteHex = (n: number) => ('0' + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code: number) =>
    textToChars(SALT).reduce((a, b) => a ^ b, code);

  return text
    .split('')
    .map(textToChars)
    .map((a) => applySaltToChar(a[0]))
    .map(byteHex)
    .join('');
};

const xorDecrypt = (encoded: string): string => {
  const textToChars = (text: string) => text.split('').map((c) => c.charCodeAt(0));
  const applySaltToChar = (code: number) =>
    textToChars(SALT).reduce((a, b) => a ^ b, code);
  
  return (encoded.match(/.{1,2}/g) || [])
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join('');
};

export const saveApiKeys = (keys: ApiKeys): void => {
  try {
    const jsonString = JSON.stringify(keys);
    const encrypted = xorEncrypt(jsonString);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (e) {
    console.error("Failed to save config", e);
  }
};

export const loadApiKeys = (): ApiKeys => {
  // Default to loremflickr so no API key is needed on first run
  const defaultKeys: ApiKeys = { preferredProvider: 'loremflickr' };
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return defaultKeys;
    
    const jsonString = xorDecrypt(encrypted);
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to load config", e);
    return defaultKeys;
  }
};
