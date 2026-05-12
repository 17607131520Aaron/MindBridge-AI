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

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { messages, model, deepThinking } = body;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ code: 400, message: "消息不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.SENSENOVA_API_KEY;
    const baseUrl = process.env.SENSENOVA_BASE_URL || "https://token.sensenova.cn/v1";
    const modelName = model || process.env.SENSENOVA_MODEL || "deepseek-v4-flash";

    if (!apiKey || apiKey === "your_api_key_here") {
      return new Response(JSON.stringify({ code: 500, message: "未配置 SenseNova API Key" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sanitizedMessages = messages.map((m) => ({
      role: m.role,
      content: String(m.content),
    }));

    const payload: Record<string, unknown> = {
      model: modelName,
      messages: sanitizedMessages,
      stream: true,
    };

    if (deepThinking) {
      payload.thinking = { type: "enabled", reasoning_effort: "high" };
    }

    const upstreamResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      console.error("SenseNova API error:", upstreamResponse.status, errorText);
      let errorMsg = "AI 服务请求失败";
      try {
        const errJson = JSON.parse(errorText);
        errorMsg = errJson.error?.message || errJson.message || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      return new Response(
        JSON.stringify({ code: upstreamResponse.status, message: errorMsg }),
        { status: upstreamResponse.status, headers: { "Content-Type": "application/json" } }
      );
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
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data:")) continue;

              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;
                const content = delta?.content;
                const reasoning = delta?.reasoning_content;
                if (content || reasoning) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: content || "", reasoning: reasoning || "" })}\n\n`)
                  );
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        } catch (error) {
          console.error("Stream read error:", error);
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
    console.error("AI Chat error:", error);
    return new Response(JSON.stringify({ code: 500, message: "服务器内部错误" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
