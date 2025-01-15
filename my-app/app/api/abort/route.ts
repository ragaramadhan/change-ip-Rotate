import { NextResponse } from "next/server";
import { abortIpRotation } from "@/lib/ipRotation";

export async function POST() {
  abortIpRotation();
  return NextResponse.json({ message: "IP rotation process aborted." });
}

