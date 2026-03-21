export interface AiService {
  generateReflection(locationName: string): Promise<string | null>;
  generateImage(prompt: string): Promise<string | null>;
  generateMockups(): Promise<string[]>;
}

export { geminiProvider as aiService } from './geminiProvider';
