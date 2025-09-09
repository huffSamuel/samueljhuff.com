import { format } from 'date-fns';
import browserslist from 'browserslist';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import eleventyCss from '@11tyrocks/eleventy-plugin-lightningcss';
import { transform, browserslistToTargets } from 'lightningcss';
import { DateTime } from 'luxon';

const targets = browserslistToTargets(browserslist('>= 0.2% and not dead'));

const TIME_ZONE = 'America/Los_Angeles';

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addFilter('keys', function (obj) {
    return Object.keys(obj);
  });

  eleventyConfig.addFilter('filter', function (ray, filter) {
    return ray.filter(v => !filter.includes(v));
  });

  eleventyConfig.addFilter('preview', function (article) {
    return extractExcerpt(article);
  });

  eleventyConfig.addFilter('cssmin', function (code) {
    return transform({
      code: Buffer.from(code),
      targets: targets,
      minify: true,
      sourceMap: false,
      filename: '',
    }).code;
  });
  eleventyConfig.addFilter('date', function (date, dateFormat) {
    return format(date, dateFormat);
  });

  eleventyConfig.addPassthroughCopy('content/robots.txt');
  eleventyConfig.addPassthroughCopy('content/favicon*');
  eleventyConfig.addPassthroughCopy('content/android-chrome*.png');
  eleventyConfig.addPassthroughCopy('content/apple-touch-icon*.png');
  eleventyConfig.addPassthroughCopy('content/assets');

  // eleventyConfig.addPassthroughCopy('*.webmanifest');

  eleventyConfig.addPlugin(eleventyCss);

  eleventyConfig.addTemplateFormats('webmanifest');
  eleventyConfig.addExtension('webmanifest', {
    outputFileExtension: 'webmanifest',
    compile: async inputContent => {
      const output = JSON.stringify(JSON.parse(inputContent));

      return async () => {
        return output;
      };
    },
  });

  eleventyConfig.addShortcode('excerpt', article => extractExcerpt(article));

  eleventyConfig.addDateParsing(function (dateValue) {
    let localDate;
    if (dateValue instanceof Date) {
      // and YAML
      localDate = DateTime.fromJSDate(dateValue, { zone: 'utc' }).setZone(
        TIME_ZONE,
        { keepLocalTime: true }
      );
    } else if (typeof dateValue === 'string') {
      localDate = DateTime.fromISO(dateValue, { zone: TIME_ZONE });
    }
    if (localDate?.isValid === false) {
      throw new Error(
        `Invalid \`date\` value (${dateValue}) is invalid for ${this.page.inputPath}: ${localDate.invalidReason}`
      );
    }
    return localDate;
  });
}

export const config = {
  dir: {
    input: 'content',
    includes: '../_includes',
    output: '_site',
  },
};

function extractExcerpt(article) {
  if (!article.hasOwnProperty('templateContent')) {
    console.warn(
      'Failed to extract excerpt: Document has no property "templateContent".'
    );
    return null;
  }

  let excerpt = null;
  const content = article.templateContent;

  const separatorsList = [
    { start: '<!-- Excerpt Start -->', end: '<!-- Excerpt End -->' },
    { start: '<p>', end: '</p>' },
  ];

  separatorsList.some(separators => {
    const startPosition = content.indexOf(separators.start);
    const endPosition = content.indexOf(separators.end);

    if (startPosition !== -1 && endPosition !== -1) {
      excerpt = content
        .substring(startPosition + separators.start.length, endPosition)
        .replace(/<a.*>(.*)<.*a>/, (_, b) => {
          return b;
        })
        .trim();
      return true; // Exit out of array loop on first match
    }
  });

  return excerpt;
}
