import { getCreatedTimestamp, getUpdatedTimestamp } from '../_data/git.js';

async function getTs(fn, inputPath) {
  const gitDate = await fn(inputPath);
  const result = !isNaN(gitDate) ? new Date(gitDate) : new Date();

  return result;
}

const created = async (data) => {
  if (data.published) {
    return data.published;
  }

  return await getTs(getCreatedTimestamp, data.page.inputPath);
}

const updated = async (data) => {
  const gt = await getTs(getUpdatedTimestamp, data.page.inputPath);
  const c = created(data);

  if (c < gt) {
    return gt;
  }

  return null;
}

export default {
  eleventyComputed: {
    created,
    updated,
  },
};
