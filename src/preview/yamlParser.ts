import * as yaml from 'js-yaml';

export interface ParsedYaml {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export function parseYaml(content: string): ParsedYaml {
  try {
    const data = yaml.load(content) as Record<string, unknown>;
    return { success: true, data };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error };
  }
}
