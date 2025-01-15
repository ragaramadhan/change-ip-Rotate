"use server";

import { rotateIp, abortIpRotation } from "@/lib/ipRotation";

export async function startIpRotation(formData: FormData) {
  const targetSubnet = formData.get("subnet") as string;
  const proxiesText = formData.get("proxies") as string;
  const proxies = proxiesText
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p);

  try {
    // console.log(proxies);
    // console.log(targetSubnet, "ini target");

    const results = await rotateIp(proxies, targetSubnet);
    return { success: true, results };
  } catch (error) {
    console.error("Error in startIpRotation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function stopIpRotation() {
  abortIpRotation();
  return { success: true, message: "IP rotation process aborted." };
}
