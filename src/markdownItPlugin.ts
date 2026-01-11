import type MarkdownIt from 'markdown-it';

export function markdownItYamlPlugin(md: MarkdownIt): MarkdownIt {
  const defaultFence = md.renderer.rules.fence!.bind(md.renderer.rules);

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const info = token.info.trim().toLowerCase();

    if (info === 'yaml' || info === 'yml') {
      const content = token.content;
      const escapedContent = escapeHtml(content);
      return `<div class="yaml-preview-container" data-yaml="${escapedContent}"></div>`;
    }

    return defaultFence(tokens, idx, options, env, self);
  };

  // Handle frontmatter
  const originalParse = md.parse.bind(md);
  md.parse = (src: string, env: any) => {
    const frontmatterMatch = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (frontmatterMatch) {
      const frontmatterContent = frontmatterMatch[1];
      const escapedContent = escapeHtml(frontmatterContent);
      const frontmatterHtml = `<div class="yaml-preview-container yaml-frontmatter" data-yaml="${escapedContent}"></div>\n\n`;

      // Remove frontmatter from source and add our custom element
      const restOfContent = src.slice(frontmatterMatch[0].length);
      env._yamlFrontmatter = frontmatterHtml;
      return originalParse(restOfContent, env);
    }
    return originalParse(src, env);
  };

  const originalRender = md.render.bind(md);
  md.render = (src: string, env: any = {}) => {
    const result = originalRender(src, env);
    if (env._yamlFrontmatter) {
      return env._yamlFrontmatter + result;
    }
    return result;
  };

  return md;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
