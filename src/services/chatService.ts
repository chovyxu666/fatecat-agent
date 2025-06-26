
import { API_CONFIG, getApiUrl } from '../config/api';

export interface ChatRequest {
  user_id: string;
  message: string;
  tarot?: string;
}

export interface ChatChunk {
  chunk: string;
  type?: string;
  emotion_score?: number;
}

export class ChatService {
  private abortController: AbortController | null = null;

  async sendMessage(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    signal?: AbortController
  ): Promise<void> {
    if (signal) {
      this.abortController = signal;
    }

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CHAT_STREAM), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: this.abortController?.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await this.handleStreamResponse(response, onChunk);
  }

  private async handleStreamResponse(
    response: Response,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    try {
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // 保留最后一行，可能不完整
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.substring(6).trim();
              if (jsonStr) {
                console.log('解析的JSON数据:', jsonStr);
                const data: ChatChunk = JSON.parse(jsonStr);
                if (data.chunk && typeof data.chunk === 'string') {
                  onChunk(data.chunk);
                }
              }
            } catch (e) {
              console.log('解析JSON失败:', e, '原始数据:', trimmedLine);
            }
          }
        }
      }
      
      // 处理缓冲区中剩余的数据
      if (buffer.trim()) {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonStr = trimmedLine.substring(6).trim();
            if (jsonStr) {
              const data: ChatChunk = JSON.parse(jsonStr);
              if (data.chunk && typeof data.chunk === 'string') {
                onChunk(data.chunk);
              }
            }
          } catch (e) {
            console.log('解析最后JSON失败:', e);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}
