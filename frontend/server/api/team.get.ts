import { createError, defineEventHandler } from 'h3';
import { useRuntimeConfig } from '#imports';
import { cachedStrapiGet } from '../utils/strapi-cache';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const baseUrl =
    (config?.strapi?.url as string) ||
    (config?.public?.strapiUrl as string) ||
    'http://localhost:1337';
  const token = (config?.strapi?.token as string) || '';

  try {
    return await cachedStrapiGet<unknown>(baseUrl, token, '/api/team', {
      'populate[cover]': 'true',
      'populate[lead][populate]': '*',
    });
  } catch (error: unknown) {
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? Number((error as { statusCode?: unknown }).statusCode) || 500
        : 500;
    throw createError({
      statusCode,
      statusMessage: 'Failed to fetch team content from Strapi',
    });
  }
});
