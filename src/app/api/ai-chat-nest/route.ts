import { NextRequest } from "next/server";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  model?: string;
  deepThinking?: boolean;
}

function toJsonResponse(status: number, message: string) {
  return new Response(JSON.stringify({ code: status, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { messages, model, deepThinking } = body;

    if (!messages || messages.length === 0) {
      return toJsonResponse(400, "消息不能为空");
    }

    const apiBaseUrl =
      process.env.MULTI_SERVICE_AI_BASE_URL ||
      process.env.NEXT_PUBLIC_MULTI_SERVICE_AI_BASE_URL ||
      "http://127.0.0.1:9999";

    const upstreamResponse = await fetch(`${apiBaseUrl}/web/ai/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages.map((message) => ({
          role: message.role,
          content: String(message.content),
        })),
        ...(model ? { model } : {}),
        ...(deepThinking ? { deepThinking: true } : {}),
      }),
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const errorText = await upstreamResponse.text();
      let errorMsg = "AI 服务请求失败";

      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.message || errorJson.error?.message || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }

      return toJsonResponse(upstreamResponse.status, errorMsg);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const segments = buffer.split("\n\n");
            buffer = segments.pop() || "";

            for (const segment of segments) {
              const lines = segment
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

              if (lines.length === 0) continue;

              let eventName = "message";
              const dataLines: string[] = [];

              for (const line of lines) {
                if (line.startsWith("event:")) {
                  eventName = line.slice(6).trim();
                } else if (line.startsWith("data:")) {
                  dataLines.push(line.slice(5).trim());
                }
              }

              if (dataLines.length === 0) continue;

              const data = dataLines.join("\n");

              if (data === "[DONE]" || eventName === "done") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }

              if (eventName === "meta") {
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                if (eventName === "error") {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ error: parsed.message || "AI 服务请求失败" })}\n\n`,
                    ),
                  );
                  continue;
                }

                if (eventName === "chunk") {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        content: parsed.delta || "",
                        reasoning: parsed.reasoning || "",
                      })}\n\n`,
                    ),
                  );
                }
              } catch {
                // skip malformed SSE payload
              }
            }
          }
        } catch (error) {
          console.error("AI Chat Nest proxy stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI Chat Nest proxy error:", error);
    return toJsonResponse(500, "服务器内部错误");
  }
}
