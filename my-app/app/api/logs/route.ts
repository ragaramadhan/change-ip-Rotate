import { NextResponse } from "next/server";

let clients: ReadableStreamDefaultController[] = [];

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.push(controller);
    },
    cancel() {
      clients = clients.filter(client => client !== this);
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export function sendEventToAll(data: string) {
  clients.forEach(client => {
    client.enqueue(`data: ${data}\n\n`);
  });
}

