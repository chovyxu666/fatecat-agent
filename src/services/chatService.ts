
import { API_CONFIG } from '../config/api';
import { apiService } from './apiService';

export interface ChatRequest {
  user_id: string;
  message: string;
  tarot?: string;
  chat_type?: number; // 新增chat_type参数
}

export interface ChatChunk {
  chunk: string;
  type?: string;
  emotion_score?: number;
}

export interface ProcessedMessage {
  id: string;
  text: string;
  isComplete: boolean;
}

export class ChatService {
  private abortController: AbortController | null = null;

  async sendMessage(
    request: ChatRequest,
    onMessage: (message: ProcessedMessage) => void,
    signal?: AbortController,
    isBazi: boolean = false // 新增参数区分是否八字聊天
  ): Promise<void> {
    if (signal) {
      this.abortController = signal;
    }

    // 根据是否八字聊天选择不同的endpoint
    const endpoint = isBazi ? API_CONFIG.ENDPOINTS.BAZI_CHAT_STREAM : API_CONFIG.ENDPOINTS.CHAT_STREAM;

    const response = await apiService.stream(
      endpoint,
      request,
      { signal: this.abortController?.signal }
    );

    await this.handleStreamResponse(response, onMessage);
  }

  private async handleStreamResponse(
    response: Response,
    onMessage: (message: ProcessedMessage) => void
  ): Promise<void> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    let textBuffer = '';
    let messageCounter = 0;
    const baseMessageId = Date.now().toString();
    const currentMessageId = `${baseMessageId}_current`;

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
                  this.processChunk(data.chunk, baseMessageId, messageCounter, textBuffer, onMessage);

                  // 更新本地状态
                  textBuffer += data.chunk;

                  // 检查是否包含换行符，如果有则完成消息
                  if (data.chunk.includes('\n')) {
                    const lines = textBuffer.split('\n');

                    // 处理完整的行（除了最后一行）
                    for (let i = 0; i < lines.length - 1; i++) {
                      const lineText = lines[i].trim();
                      if (lineText) {
                        messageCounter++;
                        onMessage({
                          id: `${baseMessageId}_${messageCounter}`,
                          text: lineText,
                          isComplete: true
                        });
                      }
                    }

                    // 重置缓冲区为最后一行
                    textBuffer = lines[lines.length - 1];
                  }

                  // 更新当前未完成的消息
                  if (textBuffer.trim()) {
                    onMessage({
                      id: currentMessageId,
                      text: textBuffer.trim(),
                      isComplete: false
                    });
                  }
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
                textBuffer += data.chunk;
              }
            }
          } catch (e) {
            console.log('解析最后JSON失败:', e);
          }
        }
      }

      // 流结束后，如果还有未完成的文本，创建最终消息
      if (textBuffer.trim()) {
        messageCounter++;
        onMessage({
          id: `${baseMessageId}_${messageCounter}`,
          text: textBuffer.trim(),
          isComplete: true
        });
      }

    } finally {
      reader.releaseLock();
    }
  }

  private processChunk(
    chunk: string,
    baseMessageId: string,
    messageCounter: number,
    textBuffer: string,
    onMessage: (message: ProcessedMessage) => void
  ): void {
    console.log(`接收到chunk: "${chunk}"`);
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}
