"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startIpRotation, stopIpRotation } from "./actions";

export default function IpRotator() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isPinkTheme, setIsPinkTheme] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/logs");
    eventSource.onmessage = (event) => {
      setLogs((prev) => [...prev, event.data]);
      if (resultRef.current) {
        resultRef.current.scrollTop = resultRef.current.scrollHeight;
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRotating(true);
    setLogs(["Starting IP rotation..."]);

    const formData = new FormData(event.currentTarget);
    const result = await startIpRotation(formData);

    if (result.success) {
      setLogs((prev) => [...prev, "IP rotation completed successfully."]);
    } else {
      setLogs((prev) => [...prev, `Error: ${result.error}`]);
    }
    setIsRotating(false);
  };

  const handleStop = async () => {
    const result = await stopIpRotation();
    if (result.success) {
      setLogs((prev) => [...prev, "Stopping IP rotation..."]);
    }
    setIsRotating(false);
  };

  const toggleTheme = () => {
    setIsPinkTheme(!isPinkTheme);
  };

  const bgColor = isPinkTheme
    ? "bg-gradient-to-br from-pink-500 to-purple-600"
    : "bg-gradient-to-br from-gray-800 to-gray-900";

  const cardBgColor = isPinkTheme
    ? "bg-pink-100 bg-opacity-20"
    : "bg-white bg-opacity-10";

  const buttonColor = isPinkTheme
    ? "bg-pink-600 hover:bg-pink-700"
    : "bg-blue-600 hover:bg-blue-700";

  const stopButtonColor = isPinkTheme
    ? "bg-purple-600 hover:bg-purple-700"
    : "bg-red-600 hover:bg-red-700";

  return (
    <div
      className={`min-h-screen ${bgColor} flex justify-center items-center p-4`}
    >
      <Card
        className={`w-full max-w-4xl ${cardBgColor} backdrop-filter backdrop-blur-lg`}
      >
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-white">
            Change IP Target Subnet Paps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="relative w-full h-64 md:h-full rounded-lg overflow-hidden">
                <img
                  src="https://thumbs.dreamstime.com/b/vertical-shot-happy-young-indian-farmer-holding-empty-sign-board-agricultural-farmland-concept-advertising-vertical-shot-267416700.jpg"
                  alt="IP Rotation Illustration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:w-2/3">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="subnet"
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Target Subnet:
                  </label>
                  <Input
                    id="subnet"
                    name="subnet"
                    placeholder="e.g., 192.168.1"
                    required
                    className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="proxies"
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Proxies (one per line):
                  </label>
                  <Textarea
                    id="proxies"
                    name="proxies"
                    rows={6}
                    placeholder="host:port&#10;host:port:user:password"
                    className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className={`flex-1 ${buttonColor} text-white`}
                    disabled={isRotating}
                  >
                    {isRotating ? "Rotating..." : "Start IP Rotation"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleStop}
                    className={`flex-1 ${stopButtonColor} text-white`}
                    disabled={!isRotating}
                  >
                    Stop Rotation
                  </Button>
                </div>
              </form>
              <div
                ref={resultRef}
                className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-md h-48 overflow-y-auto"
              >
                {logs.map((log, index) => (
                  <p key={index} className="text-sm text-gray-300">
                    {log}
                  </p>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  onClick={toggleTheme}
                  className={`w-full ${
                    isPinkTheme
                      ? "bg-gray-600 hover:bg-gray-700"
                      : "bg-pink-600 hover:bg-pink-700"
                  } text-white`}
                >
                  {isPinkTheme
                    ? "Switch to Default Theme"
                    : "Switch to Pink Theme"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
