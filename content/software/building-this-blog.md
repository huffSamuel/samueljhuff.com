---
title: building this blog
date: 2025-09-08
templateEngineOverride: md
---

I figured a fitting first real post for this blog would be to explain how I built it. I have tried, and failed, many times to actually start blogging and have used a variety of static site generators. I have finally settled on [Eleventy](https://www.11ty.dev/).

### First try - Jekyll

My first run at building a website started on [Jekyll](https://jekyllrb.com/) and it didn't even get off the ground. To tell you the truth, it was years ago and I didn't really understand much in the web development sphere at that time. I was a full time software engineer writing plugin code for a robotics platform to add support for 3rd party devices in C#. I knew just enough Javascript and CSS to pass an intro to web course I had taken 5 years prior. I started, stopped, started, and stopped again, never quite getting the blog off the ground. This is not a critique of Jekyll as a tool. I'm sure it's a phenomenal tool and my problems using it were all skill issues.

### Hugo - the one I got working

I deployed this site successfully 2 years ago (as of the time of writing this blog) and had been learning golang. I generally look for tools that are relevant to the languages or frameworks that I'm already working with. My frontend work at the time was Angular focused, so [Astro](https://astro.build/) had come up in my research a lot, but I was looking to divert from JS framework based websites. Hugo came up as a fast static HTTP tool written in golang, which ticked all the boxes for me. I built a theme in Hugo, deployed the website, and it was very _meh_. Looking back at it now, the design now is quite juvenile and focused on the wrong things. More skill issues aside, Hugo was a great tool but go-flavored template syntax was quite frustrating. I enjoy go as a language still, but mixing it with HTML just didn't feel right.

### Eleventy - the return to JS

Yeah, I feel back into the Javascript trap. All things old are new again. In my defense, 11ty is a very well developed tool, highly configurable, and supports all the template languages. It was quick to setup and adding custom configurations is very intuitive. I didn't need to change a lot, so my configuration is relatively vanilla but I have a few little tips that came out of building this site.

#### Per-page critical CSS

I wanted to be able to inline critical CSS for each page. This required a few tweaks to the configuration and one change to frontmatter on the layout.

First, I set up a css minification filter in the config. This step prepares the inline CSS for the layouts. I took the base snippet from Eleventy's own posts and swapped out the CSS tool:

```js
// eleventyconfig.js
import { transform, browserslistToTargets } from 'lightningcss';

const targets = browserslistToTargets(browserslist('>= 0.2% and not dead'));

export default function (eleventyConfig) {
  eleventyConfig.addFilter('cssmin', function (code) {
    return transform({
      code: Buffer.from(code),
      targets: targets,
      minify: true,
      sourceMap: false,
      filename: '',
    }).code;
  });
}
```

Next was to inject the inline CSS into the layout snippets:

```html
// layout.njk
<head>
    {% include "critical.css" %}
    {% if critical %}
        {% include critical %}
    {% endif %}
    {% endset %}
</head>
```

And for each of the layouts that need critical css, I added the `critical` frontmatter:

```md
// blog.njk
---
critical: blog.css
---
```

Now I can inline all my critical css for the entire site in the main css file and conditionally include another file as part of the build process. When the site is built, that `critical` css in the frontmatter is pulled in, minified, and inlined at the top of my HTML files. Content above the fold loads without any additional files downloaded and the critical CSS remains trim.
