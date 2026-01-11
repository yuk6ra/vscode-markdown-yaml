import { parseYaml } from './yamlParser';
import { renderYamlTable, renderError } from './tableRenderer';
import './styles.css';

function renderAllYamlContainers(): void {
  const containers = document.querySelectorAll<HTMLElement>('.yaml-preview-container');

  containers.forEach((container) => {
    // Skip if already rendered
    if (container.dataset.rendered === 'true') {
      return;
    }

    const yamlContent = container.dataset.yaml;
    if (!yamlContent) {
      return;
    }

    // Decode HTML entities
    const decodedContent = decodeHtmlEntities(yamlContent);
    const result = parseYaml(decodedContent);

    if (result.success && result.data) {
      container.innerHTML = renderYamlTable(result.data);
    } else {
      container.innerHTML = renderError(result.error || 'Unknown error');
    }

    container.dataset.rendered = 'true';
  });
}

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// Initial render
renderAllYamlContainers();

// Re-render on content update (VS Code Markdown Preview event)
window.addEventListener('vscode.markdown.updateContent', () => {
  // Reset rendered state for re-rendering
  const containers = document.querySelectorAll<HTMLElement>('.yaml-preview-container');
  containers.forEach((container) => {
    container.dataset.rendered = 'false';
  });
  renderAllYamlContainers();
});
