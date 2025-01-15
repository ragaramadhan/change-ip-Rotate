import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { rotateIp } from "@/lib/ipRotation";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { proxies, targetSubnet } = body;

  if (!proxies || !Array.isArray(proxies)) {
    return NextResponse.json({
      statusCode: 400,
      message: "Invalid proxies input. Provide an array of proxies.",
    });
  }

  try {
    const results = await rotateIp(proxies, targetSubnet);
    return NextResponse.json({ message: "IP rotation completed.", results });
  } catch (error) {
    return NextResponse.json({
      statusCode: 500,
      message: "Failed to rotate IPs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

