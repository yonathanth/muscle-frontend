"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

// Configuration
const FINGERPRINT_SERVER_URL = "https://localhost:8443/fingerprint-websocket";

// Shimmer component for loading states
const Shimmer = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer rounded ${className}`}
    >
      &nbsp;
    </div>
  );
};

// Add shimmer animation to CSS
const shimmerStyle = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  .animate-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
  }
`;

export default function AttendancePage() {
  // State for connection
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [stompClient, setStompClient] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [message, setMessage] = useState<string>(
    "Connect to fingerprint scanner to begin"
  );
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Audio references
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const failureAudioRef = useRef<HTMLAudioElement | null>(null);
  const inactiveAudioRef = useRef<HTMLAudioElement | null>(null);

  // Verification result state
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    userName?: string;
    remainingDays?: number | null;
    status?: string;
    userStatus?: string;
  } | null>(null);

  // Performance tracking for verification speed
  const [verificationStartTime, setVerificationStartTime] = useState<
    number | null
  >(null);

  // Template reload state
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [templateStats, setTemplateStats] = useState<string>("");

  // Generate unique session ID when component mounts
  useEffect(() => {
    setSessionId(`session-${Date.now()}`);

    // Create audio elements
    successAudioRef.current = new Audio("/sounds/success.mp3");
    failureAudioRef.current = new Audio("/sounds/failure.mp3");
    inactiveAudioRef.current = new Audio("/sounds/failure.mp3");

    // Preload audio
    successAudioRef.current.load();
    failureAudioRef.current.load();
    inactiveAudioRef.current.load();

    return () => {
      // Clean up audio resources
      if (successAudioRef.current) successAudioRef.current = null;
      if (failureAudioRef.current) failureAudioRef.current = null;
      if (inactiveAudioRef.current) inactiveAudioRef.current = null;
    };
  }, []);

  // Connect to the WebSocket server
  const connect = () => {
    try {
      setConnectionStatus("connecting");
      setMessage("Connecting to fingerprint scanner...");

      const socket = new SockJS(FINGERPRINT_SERVER_URL);
      const client = Stomp.over(socket);

      // Disable debug logging
      client.debug = () => {};

      client.connect(
        {},
        (frame: any) => {
          console.log("Connected:", frame);
          setConnectionStatus("connected");
          setStompClient(client);
          setMessage("Connected to fingerprint scanner. Ready to scan.");

          // Subscribe to session-specific channel
          client.subscribe(
            `/topic/fingerprint/${sessionId}`,
            (message: any) => {
              handleResponse(JSON.parse(message.body));
            }
          );

          // Start verification automatically on connect
          startVerification();

          toast.success("Connected to fingerprint scanner");
        },
        (error: any) => {
          console.error("Connection error:", error);
          setConnectionStatus("error");
          setMessage(
            "Failed to connect to fingerprint scanner. Please ensure the server is running."
          );
          toast.error("Connection failed. Is the fingerprint server running?");
        }
      );
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionStatus("error");
      setMessage("Error connecting to fingerprint scanner");
      toast.error("Connection error. Check console for details.");
    }
  };

  // Disconnect from the WebSocket server
  const disconnect = () => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => {
        setConnectionStatus("disconnected");
        setStompClient(null);
        setMessage("Connect to fingerprint scanner to begin");
        setScanProgress(0);
        setVerificationResult(null);
        setIsScanning(false);
        toast.info("Disconnected from fingerprint scanner");
      });
    }
  };

  // Start fingerprint verification
  const startVerification = () => {
    if (stompClient && stompClient.connected) {
      setIsScanning(true);
      setVerificationResult(null);
      setScanProgress(0);
      setVerificationStartTime(Date.now()); // Track verification start time
      setMessage("Place your finger on the scanner for verification");

      stompClient.send(
        "/app/scan",
        {},
        JSON.stringify({
          operation: "verify",
          sessionId: sessionId,
        })
      );
    } else {
      toast.error("Not connected to fingerprint scanner");
    }
  };

  // Handle WebSocket responses (Updated for two-stage verification)
  const handleResponse = (response: any) => {
    console.log("Received:", response);

    if (response.status === "in_progress") {
      setMessage(response.message);
      setScanProgress(response.progress);
      setIsScanning(true);
    } else if (response.status === "success") {
      setIsScanning(false);

      if (response.operation === "verify") {
        // Handle verification result with two-stage optimization
        if (response.verified) {
          // Check if this is stage 1 (immediate match) or stage 2 (complete details)
          const isStageOne = response.userName === "Loading...";

          if (isStageOne) {
            // Stage 1: Immediate feedback that match was found
            setMessage(`✅ Fingerprint match found!`);

            setVerificationResult({
              verified: true,
              userName: "Loading user details...",
              remainingDays: null,
              status: "Fetching Details",
              userStatus: "Loading...",
            });

            // Show immediate success feedback
            toast.success("Match Found!", {
              description: "Fetching user details...",
            });
          } else {
            // Stage 2: Complete user details received
            const isCheckIn =
              response.message.includes("check-in") ||
              !response.message.includes("check-out");
            const attendanceType = isCheckIn ? "check-in" : "check-out";

            setMessage(
              `✅ Welcome, ${response.userName}! Attendance recorded successfully.`
            );

            // Play appropriate sound based on status
            if (response.userStatus?.toLowerCase() === "active") {
              successAudioRef.current?.play();
              toast.success(`Welcome ${response.userName}`, {
                description: "Attendance recorded successfully",
              });
            } else {
              inactiveAudioRef.current?.play();
              toast.warning(
                `User verified but has status: ${response.userStatus}`,
                {
                  description: "Contact admin for status update",
                }
              );
            }

            setVerificationResult({
              verified: true,
              userName: response.userName,
              remainingDays: response.remainingDays || 30,
              status: "Attendance Recorded",
              userStatus: response.userStatus,
            });

            // Set timeout to start a new scan after 3 seconds
            setTimeout(() => {
              startVerification();
            }, 3000);
          }
        } else {
          setMessage(
            "❌ No matching user found. Please try again or contact admin."
          );

          // Play failure sound
          failureAudioRef.current?.play();
          toast.error("Verification failed: No matching user found", {
            description:
              "Please ensure finger is clean and properly positioned",
          });

          setVerificationResult({
            verified: false,
            status: "Verification Failed",
          });

          // Set timeout to start a new scan after 3 seconds
          setTimeout(() => {
            startVerification();
          }, 3000);
        }
      }
    } else if (response.status === "error") {
      setMessage(`❌ Error: ${response.message}`);
      setIsScanning(false);

      // Play failure sound
      failureAudioRef.current?.play();
      toast.error("Scanner Error", {
        description: response.message,
      });

      // Set timeout to restart scanning after an error
      setTimeout(() => {
        startVerification();
      }, 3000);
    }
  };

  // Reload fingerprint templates manually
  const reloadTemplates = async () => {
    setIsReloading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/fingerprint/database/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setTemplateStats(data.stats || "Templates refreshed successfully");
        toast.success("Templates Reloaded", {
          description: data.stats || "Fingerprint database updated",
        });

        // Auto-hide stats after 10 seconds
        setTimeout(() => setTemplateStats(""), 10000);
      } else {
        toast.error("Failed to reload templates", {
          description: data.message || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Error reloading templates:", error);
      toast.error("Connection Error", {
        description: "Could not connect to fingerprint service",
      });
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <style dangerouslySetInnerHTML={{ __html: shimmerStyle }} />
      <Card className="p-6 bg-black border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-6">
          Fingerprint Attendance System
        </h1>

        {/* Connection Status */}
        <div className="flex items-center justify-between mb-8 p-4 bg-gray-900 rounded-lg">
          <div>
            <p className="text-white mb-1">
              Status:
              <span
                className={`ml-2 font-medium ${
                  connectionStatus === "connected"
                    ? "text-green-500"
                    : connectionStatus === "connecting"
                    ? "text-yellow-500"
                    : connectionStatus === "error"
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "connecting"
                  ? "Connecting..."
                  : connectionStatus === "error"
                  ? "Connection Error"
                  : "Disconnected"}
              </span>
            </p>
            <p className="text-sm text-gray-400">{sessionId}</p>
            {connectionStatus === "connected" && (
              <p className="text-xs text-green-400 mt-1">
                Ready for fingerprint scanning
              </p>
            )}
            {templateStats && (
              <p className="text-xs text-blue-400 mt-1 bg-blue-950 rounded px-2 py-1">
                {templateStats}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {connectionStatus !== "connected" &&
            connectionStatus !== "connecting" ? (
              <Button
                onClick={connect}
                className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
              >
                Connect
              </Button>
            ) : (
              <Button
                onClick={disconnect}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-950"
              >
                Disconnect
              </Button>
            )}

            {/* Reload Templates Button */}
            <Button
              onClick={reloadTemplates}
              disabled={isReloading}
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-950 disabled:opacity-50"
              title="Reload fingerprint templates from database"
            >
              {isReloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              ) : (
                "Reload Templates"
              )}
            </Button>
          </div>
        </div>

        {/* Fingerprint Operations */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <Button
              onClick={startVerification}
              disabled={connectionStatus !== "connected" || isScanning}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 disabled:opacity-50"
            >
              Scan Fingerprint for Attendance
            </Button>
          </div>
        </div>

        {/* Scan Status and Progress */}
        <div className="mb-8 p-6 bg-gray-900 rounded-lg text-center">
          <p className="text-white mb-4">{message}</p>

          {isScanning && scanProgress > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
              <div
                className="bg-gradient-to-r from-red-500 to-yellow-500 h-2.5 rounded-full"
                style={{ width: `${scanProgress * 33.33}%` }}
              ></div>
            </div>
          )}

          {verificationResult && (
            <div className="mt-6 p-4 rounded-lg bg-gray-800">
              <h3 className="text-lg font-medium mb-2 text-white">
                Verification Result
              </h3>
              <div
                className={`text-${
                  verificationResult.verified ? "green" : "red"
                }-500 text-xl font-bold mb-4`}
              >
                {verificationResult.verified ? "SUCCESS" : "FAILED"}
              </div>

              {verificationResult.verified && (
                <div className="text-left">
                  <p className="text-white">
                    <span className="text-gray-400">Name:</span>{" "}
                    {verificationResult.userName ===
                    "Loading user details..." ? (
                      <Shimmer className="inline-block w-32 h-4" />
                    ) : (
                      verificationResult.userName
                    )}
                  </p>
                  <p className="text-white">
                    <span className="text-gray-400">Status:</span>{" "}
                    {verificationResult.userStatus === "Loading..." ? (
                      <Shimmer className="inline-block w-20 h-4" />
                    ) : (
                      <span
                        className={
                          verificationResult.userStatus === "active" ||
                          verificationResult.userStatus === "Active"
                            ? "text-green-500"
                            : "text-yellow-500"
                        }
                      >
                        {verificationResult.userStatus || "Unknown"}
                      </span>
                    )}
                  </p>
                  <p className="text-white">
                    <span className="text-gray-400">Remaining Days:</span>{" "}
                    {verificationResult.remainingDays === null ? (
                      <Shimmer className="inline-block w-16 h-4" />
                    ) : (
                      verificationResult.remainingDays
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-400">
          <p>1. Connect to the fingerprint scanner</p>
          <p>2. Place your finger on the scanner to record attendance</p>
          <p>3. Your presence will be automatically recorded</p>
          <p>4. Use "Reload Templates" button after adding new users</p>
        </div>

        {/* Hidden audio elements (optional, can rely on the refs instead) */}
        <audio src="/sounds/success.mp3" ref={successAudioRef} preload="auto" />
        <audio src="/sounds/failure.mp3" ref={failureAudioRef} preload="auto" />
        <audio
          src="/sounds/failure.mp3"
          ref={inactiveAudioRef}
          preload="auto"
        />
      </Card>
    </div>
  );
}
