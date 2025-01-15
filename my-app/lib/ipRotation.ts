import { sendEventToAll } from "@/app/api/logs/route";

let abortController: AbortController | null = null;

export async function rotateIp(proxies: string[], targetSubnet: string) {
  abortController = new AbortController();
  const signal = abortController.signal;

  try {
    const results = await Promise.all(
      proxies.map(async (proxy) => {
        // Parse the URL to extract host and configName
        try {
          const url = new URL(proxy);
          const host = url.hostname;
          const configName = new URLSearchParams(url.search).get("configName");

          if (!host || !configName) {
            return { proxy, status: "failed", reason: "Invalid proxy format" };
          }

          let newIp = "";
          let attempts = 0;
          // console.log(host);
          // console.log(configName);

          while (!newIp.startsWith(targetSubnet)) {
            if (signal.aborted) {
              sendEventToAll(`Process aborted for proxy ${proxy}`);
              return {
                proxy,
                status: "aborted",
                reason: "Process stopped by user.",
              };
            }

            try {
              const apiURL = `http://${host}:3000/gt/newip?configName=${configName}`;
              const response = await fetch(apiURL, { signal });
              const data = await response.json();

              if (response.ok && data.success) {
                newIp = data.result.newIp;
                sendEventToAll(`New IP obtained: ${newIp}`);

                if (newIp.startsWith(targetSubnet)) {
                  sendEventToAll(`Target subnet matched! IP: ${newIp}`);
                  return { proxy, status: "success", new_ip: newIp };
                } else {
                  sendEventToAll(
                    `IP ${newIp} does not match target subnet ${targetSubnet}. Retrying...`
                  );
                }
              } else {
                sendEventToAll("Failed to rotate IP.");
                return {
                  proxy,
                  status: "failed",
                  reason: "Failed to rotate IP",
                };
              }
            } catch (error) {
              if (error instanceof Error && error.name === "AbortError") {
                return {
                  proxy,
                  status: "aborted",
                  reason: "Process stopped by user.",
                };
              }
              return {
                proxy,
                status: "failed",
                reason: `Error during API call: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              };
            }

            await new Promise((resolve) => setTimeout(resolve, 5000));

            attempts++;
            if (attempts >= 10) {
              return {
                proxy,
                status: "failed",
                reason: "Reached maximum attempts",
              };
            }
          }
        } catch (error) {
          return { proxy, status: "failed", reason: "Invalid URL format" };
        }
      })
    );

    sendEventToAll("IP rotation process completed.");
    return results;
  } catch (error) {
    console.error("Error in rotateIp:", error);
    sendEventToAll(
      `Error in IP rotation process: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return [];
  }
}

export function abortIpRotation() {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
}
