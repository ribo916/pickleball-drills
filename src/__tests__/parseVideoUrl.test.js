import { describe, it, expect } from 'vitest';
import { parseVideoUrl } from '../utils.js';

const YT_ID = 'dQw4w9WgXcQ';
const YT_EMBED = `https://www.youtube.com/embed/${YT_ID}`;

describe('parseVideoUrl — YouTube', () => {
  it('handles long-form watch URL', () => {
    expect(parseVideoUrl(`https://www.youtube.com/watch?v=${YT_ID}`)).toBe(YT_EMBED);
  });

  it('handles long-form with extra query params', () => {
    expect(parseVideoUrl(`https://www.youtube.com/watch?v=${YT_ID}&list=PLxxx&index=2`)).toBe(YT_EMBED);
  });

  it('handles long-form with v not first', () => {
    expect(parseVideoUrl(`https://www.youtube.com/watch?list=PLxxx&v=${YT_ID}`)).toBe(YT_EMBED);
  });

  it('handles short youtu.be URL', () => {
    expect(parseVideoUrl(`https://youtu.be/${YT_ID}`)).toBe(YT_EMBED);
  });

  it('handles youtu.be with timestamp param', () => {
    expect(parseVideoUrl(`https://youtu.be/${YT_ID}?t=30`)).toBe(YT_EMBED);
  });

  it('passes through existing embed URL unchanged', () => {
    expect(parseVideoUrl(YT_EMBED)).toBe(YT_EMBED);
  });
});

describe('parseVideoUrl — Vimeo', () => {
  it('handles standard vimeo URL', () => {
    expect(parseVideoUrl('https://vimeo.com/123456789')).toBe('https://player.vimeo.com/video/123456789');
  });

  it('handles vimeo URL with privacy hash suffix', () => {
    expect(parseVideoUrl('https://vimeo.com/123456789/abc123def')).toBe('https://player.vimeo.com/video/123456789');
  });
});

describe('parseVideoUrl — invalid / edge cases', () => {
  it('returns null for unrecognized URL', () => {
    expect(parseVideoUrl('https://example.com/video')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseVideoUrl('')).toBeNull();
  });

  it('returns null for null', () => {
    expect(parseVideoUrl(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(parseVideoUrl(undefined)).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(parseVideoUrl(42)).toBeNull();
  });

  it('trims whitespace before parsing', () => {
    expect(parseVideoUrl(`  https://youtu.be/${YT_ID}  `)).toBe(YT_EMBED);
  });
});
