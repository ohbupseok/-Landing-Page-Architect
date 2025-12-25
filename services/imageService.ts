
import { ApiKeys, ImageProvider } from '../types';

// Placeholder parsing regex
// Now looks for: https://loremflickr.com/1600/900/{keyword}
const IMG_REGEX = /https:\/\/loremflickr\.com\/1600\/900\/([a-zA-Z0-9\-_,]+)/g;

export const testConnection = async (provider: ImageProvider, key: string): Promise<boolean> => {
  try {
    if (provider === 'loremflickr') {
      return true;
    } else if (provider === 'unsplash') {
      const res = await fetch(`https://api.unsplash.com/photos/random?count=1&client_id=${key}`);
      return res.ok;
    } else if (provider === 'pexels') {
      const res = await fetch(`https://api.pexels.com/v1/curated?per_page=1`, {
        headers: { Authorization: key }
      });
      return res.ok;
    } else if (provider === 'pixabay') {
      const res = await fetch(`https://pixabay.com/api/?key=${key}&per_page=3`);
      return res.ok;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};

const fetchImage = async (keyword: string, config: ApiKeys): Promise<string | null> => {
  const { preferredProvider, unsplashAccessKey, pexelsApiKey, pixabayApiKey } = config;
  
  if (preferredProvider === 'loremflickr') {
    // Just return the loremflickr URL directly as if it's the "real" image
    return `https://loremflickr.com/1600/900/${keyword}`;
  }

  // Random page 1-10 to add variety so we don't always get the #1 result
  const randomPage = Math.floor(Math.random() * 10) + 1;

  try {
    if (preferredProvider === 'unsplash' && unsplashAccessKey) {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${keyword}&page=${randomPage}&per_page=1&orientation=landscape&client_id=${unsplashAccessKey}`);
      if (!res.ok) throw new Error(`Unsplash error: ${res.statusText}`);
      const data = await res.json();
      return data.results?.[0]?.urls?.regular || null;
    } 
    
    if (preferredProvider === 'pexels' && pexelsApiKey) {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${keyword}&page=${randomPage}&per_page=1&orientation=landscape`, {
        headers: { Authorization: pexelsApiKey }
      });
      if (!res.ok) throw new Error(`Pexels error: ${res.statusText}`);
      const data = await res.json();
      // Pexels large2x is good for hero, large for others. prefer large2x for quality.
      return data.photos?.[0]?.src?.large2x || data.photos?.[0]?.src?.large || null;
    }

    if (preferredProvider === 'pixabay' && pixabayApiKey) {
      const res = await fetch(`https://pixabay.com/api/?key=${pixabayApiKey}&q=${keyword}&page=${randomPage}&image_type=photo&orientation=horizontal&per_page=3`);
      if (!res.ok) throw new Error(`Pixabay error: ${res.statusText}`);
      const data = await res.json();
      return data.hits?.[0]?.largeImageURL || null;
    }
  } catch (e) {
    console.warn(`Failed to fetch image from ${preferredProvider} for ${keyword}`, e);
    return null;
  }
  return null;
};

export const processHtmlWithRealImages = async (html: string, config: ApiKeys): Promise<string> => {
  // If provider is loremflickr, no need to fetch external APIs, the regex matches are already correct
  if (config.preferredProvider === 'loremflickr') {
    return html;
  }

  // 1. Find all keywords from the URLs
  const matches = [...html.matchAll(IMG_REGEX)];
  if (matches.length === 0) return html;

  // 2. Create a map of keyword -> Real URL
  const uniqueKeywords = Array.from(new Set(matches.map(m => m[1])));
  const replacementMap = new Map<string, string>();

  // 3. Fetch images in parallel (only if API key is present)
  await Promise.all(uniqueKeywords.map(async (keyword) => {
    const realUrl = await fetchImage(keyword, config);
    if (realUrl) {
      replacementMap.set(keyword, realUrl);
    }
  }));

  // 4. Replace in HTML
  let processedHtml = html;
  
  processedHtml = processedHtml.replace(IMG_REGEX, (match, keyword) => {
    const realUrl = replacementMap.get(keyword);
    return realUrl || match; // Fallback to loremflickr if no API result
  });

  return processedHtml;
};
