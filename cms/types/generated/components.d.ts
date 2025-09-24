import type { Schema, Struct } from '@strapi/strapi';

export interface SharedCountry extends Struct.ComponentSchema {
  collectionName: 'components_shared_countries';
  info: {
    displayName: 'Country';
    icon: 'gate';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedEducation extends Struct.ComponentSchema {
  collectionName: 'components_shared_educations';
  info: {
    displayName: 'Education';
    icon: 'book';
  };
  attributes: {
    type: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedObjective extends Struct.ComponentSchema {
  collectionName: 'components_shared_objectives';
  info: {
    displayName: 'Objective';
    icon: 'check';
  };
  attributes: {
    objective: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedPublicationType extends Struct.ComponentSchema {
  collectionName: 'components_shared_publication_types';
  info: {
    displayName: 'Publication Type';
    icon: 'chartCircle';
  };
  attributes: {
    type: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    author: Schema.Attribute.Relation<'oneToOne', 'api::author.author'>;
    body: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedTag extends Struct.ComponentSchema {
  collectionName: 'components_shared_tags';
  info: {
    displayName: 'Tag';
    icon: 'bulletList';
  };
  attributes: {
    tag: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTheme extends Struct.ComponentSchema {
  collectionName: 'components_shared_themes';
  info: {
    displayName: 'Theme';
    icon: 'brush';
  };
  attributes: {
    theme: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.country': SharedCountry;
      'shared.education': SharedEducation;
      'shared.media': SharedMedia;
      'shared.objective': SharedObjective;
      'shared.publication-type': SharedPublicationType;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.tag': SharedTag;
      'shared.theme': SharedTheme;
    }
  }
}
