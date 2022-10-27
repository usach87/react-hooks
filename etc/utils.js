const { readdir } = require('fs').promises;

function getAllEntry(pathName, browserEntry) {
  return getFiles(browserEntry).then(
    (folders) => (
      folders && folders.length
        ? folders.reduce((acc, i) => {
          if (!(/(?<!(\.(d|spec|test)))\.tsx?$/.test(i))) {
            return acc;
          }

          const entryName = i.replace(/^\.\/src\/hooks\//, '').replace(/\.tsx?$/, '');

          return {
            ...acc,
            ...{ [entryName]: i }
          };
        }, {})
        : browserEntry
    ),
    () => browserEntry
  );
}

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });

  const files = await Promise.all(dirents.map((dirent) => {
    const res = `${dir}/${dirent.name}`;

    return dirent.isDirectory() ? getFiles(res) : res;
  }));

  return Array.prototype.concat(...files);
}

module.exports = { getAllEntry };
