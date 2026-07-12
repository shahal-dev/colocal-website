import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // One-time backfill: copy the legacy single `title` string into the new
    // repeatable `titles` (Designation) component for authors that don't have
    // any designations yet. Idempotent, so it's safe to run on every startup;
    // can be removed once all authors carry `titles`.
    try {
      // Wildcard populate: the generated content types may lag behind the
      // schema, and naming `titles` fails the build's typecheck when they do.
      const authors = (await strapi.documents('api::author.author').findMany({
        populate: '*',
        limit: 1000,
      })) as Array<{
        documentId: string;
        title?: string | null;
        titles?: Array<{ title?: string }> | null;
      }>;

      let migrated = 0;
      for (const author of authors) {
        if (!author.title || (author.titles && author.titles.length > 0)) continue;
        await strapi.documents('api::author.author').update({
          documentId: author.documentId,
          data: { titles: [{ title: author.title }] } as never,
        });
        migrated++;
      }
      if (migrated > 0) {
        strapi.log.info(`Backfilled titles for ${migrated} author(s) from legacy title field`);
      }
    } catch (err) {
      strapi.log.warn(`Author titles backfill skipped: ${err}`);
    }
  },
};
