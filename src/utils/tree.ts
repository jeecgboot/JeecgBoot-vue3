export function filterTree<T extends { children: T[] | undefined }>(tree: T[], iterate: (item: T, index: number) => boolean): T[] {
  function filter(tree: T[]): T[] {
    return tree.filter((item, index) => {
      if (!iterate(item, index)) {
        return false;
      }
      if (item.children && item.children.length > 0) {
        item.children = filter(item.children);
      }
      return true;
    })
  }
  return filter(tree);
}
