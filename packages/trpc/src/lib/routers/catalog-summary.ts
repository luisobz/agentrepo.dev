import type { FileTree } from '@agentrepo/domain';
function includesPlayground(tree: FileTree): boolean {
  return tree.some(
    (node) =>
      ['demo', 'playground', 'examples'].includes(
        node.name.replace(/\.[^.]+$/, '').toLowerCase(),
      ) ||
      (node.type === 'directory' && includesPlayground(node.children)),
  );
}
export function agentSummary<
  T extends {
    fileTree: FileTree;
    readmeContent?: string | null;
    previewContent?: string | null;
  },
>(agent: T) {
  const {
    fileTree,
    readmeContent: _readme,
    previewContent: _preview,
    ...summary
  } = agent;
  return { ...summary, hasPlayground: includesPlayground(fileTree) };
}
export function skillSummary<
  T extends { content: string; previewContent?: string | null },
>(skill: T) {
  const { content: _content, previewContent: _preview, ...summary } = skill;
  return summary;
}
export function postSummary<T extends { content: string }>(post: T) {
  const { content: _content, ...summary } = post;
  return summary;
}
