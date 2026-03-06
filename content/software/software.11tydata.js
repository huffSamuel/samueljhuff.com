// import { getCreatedTimestamp, getUpdatedTimestamp } from '../../_data/git.js';

// async function getTs(fn, inputPath) {
//   const gitDate = await fn(inputPath);
//   const result = !isNaN(gitDate) ? new Date(gitDate) : new Date();
//   console.log('getTs', inputPath, gitDate, result);

//   return result;
// }

// export default {
//   eleventyComputed: {
//     created: async data => data.date || getTs(getCreatedTimestamp, data.page.inputPath),
//     updated: async data => getTs(getUpdatedTimestamp, data.page.inputPath),
//   },
// };
