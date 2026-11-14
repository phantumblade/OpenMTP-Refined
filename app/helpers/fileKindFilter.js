// The counters in the pane footer double as a filter: everything, only the
// folders or only the files of the current folder.
export const FILE_KIND_FILTER = {
  all: 'all',
  dirs: 'dirs',
  files: 'files',
};

export const countFileKinds = (nodes = []) => {
  let dirs = 0;

  nodes.forEach((node) => {
    if (node.isFolder) {
      dirs += 1;
    }
  });

  return { all: nodes.length, dirs, files: nodes.length - dirs };
};
