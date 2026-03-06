---
title: Adding last modified dates
published: 2026-03-06
templateEngineOverride: md
summary: Automatically adding a last modified date to 11ty content
---

Whenever I'm reading an article, especially regarding technology or news, I find it helpful to set my frame of reference to when the article is written. With any blogging framework like this, the naive way of building this is to use frontmatter.

A simple `published: {date}` and `last_updated: {date}` key in the frontmatter yields the results we want. BUT... we all know keeping these in sync is a lot of extra workload. Is it that important it's actually perfect, probably not. But we're software engineers. Why would we do something manually when we could spend 10x as much time automating it?

<figure style="display: block; margin: 1em auto; width: fit-content;">
<a href="https://xkcd.com/1319/" style="background-image: none;">
<img style="border: 1px solid black;" src="https://imgs.xkcd.com/comics/automation.png">
</a>
<figcaption style="text-align: center; font-size: .9em; font-style: italic; font-weight: 300;">As always, there's a relevant XKCD</figcaption>
</figure>

Fortunately for me, eleventy makes this process pretty straightforward. Eleventy has the ability to insert computed data into content via [eleventyComputed](https://www.11ty.dev/docs/data-computed/). I'll let you look through their docs so this article can focus on what we did to achieve inserting the proper timestamps. First thing, create the data that eleventy will inject. I created the fille in my content directory so I wouldn't need to add it to all of my collections individually:

<div class="filename">content/content.11tydata.js</div>

```js
export default {
  eleventyComputed: {
    created: 'foo',
    updated: 'bar',
  },
};
```

Then I updated the template to show these values:

<div class="filename">_includes/layouts/blog.njk</div>

```njk
Published <time>{{ created | date('MMM dd yyyy')}}
Last Updated <time>{{ updated | date('MM dd yyyy')}}
```

We, obviously, have some problems because `'foo'` and `'bar'` aren't valid dates. For simplicity's sake, I'm going to assign these values from the date create and updated (respectively) in the git repository.

<div class="filename">content/content.11tydata.js</div>

```js
const created = (filePath) {
    try {
		let timestamp = await spawnAsync(
			"git",
			// Formats https://www.git-scm.com/docs/git-log#_pretty_formats
			// %at author date, UNIX timestamp
			["log", "--diff-filter=A", "--follow", "-1", "--format=%at", filePath],
		);
		// parseInt removes trailing \n
		return parseInt(timestamp, 10) * 1000;
	} catch (e) {
		// do nothing
	}
}

const updated = (filePath) {
    try {
		let timestamp = await spawnAsync(
			"git",
			// Formats https://www.git-scm.com/docs/git-log#_pretty_formats
			// %at author date, UNIX timestamp
			["log", "-1", "--format=%at", filePath],
		);
		return parseInt(timestamp, 10) * 1000;
	} catch (e) {
		// do nothing
	}
}

async function getTimestamp(cb, path) {
    const date = await cb(path);
    return !isNaN(date) ? new Date(date) : new Date();
}

export default {
    eleventyComputed: {
        created: async data => getTimestamp(created, data.page.inputPath),
        updated: async data => getTimestamp(updated, data.page.inputPath)
    }
};
```

Eleventy sets those computed properties in the data cascade and now you can use them as any other variable within your template files. 

This isn't an original creation on my part, I pulled this together from a few different Github issues, other repositories, and by reading through the eleventy documentation on computed data.

Eleventy is a pretty impressive static site generator and only takes minutes to learn. I definitely get the impression there's a lot to master though.

Good luck. Happy blogging.