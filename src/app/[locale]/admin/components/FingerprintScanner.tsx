"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFingerprint } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import axios from "axios";

// Configuration
const FINGERPRINT_SERVER_URL = "https://localhost:8443/fingerprint-websocket";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface FingerprintScannerProps {
  userId?: string;
  onTemplateUpdate?: (template: string) => void;
  hasExistingTemplate?: boolean;
}

const FingerprintScanner: React.FC<FingerprintScannerProps> = ({
  userId,
  onTemplateUpdate,
  hasExistingTemplate = false,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [stompClient, setStompClient] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [message, setMessage] = useState<string>(
    "Connect to register fingerprint"
  );
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [templateData, setTemplateData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);

  // Generate unique session ID when component mounts
  useEffect(() => {
    setSessionId(`session-${Date.now()}`);
  }, []);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [stompClient]);

  // Connect to the fingerprint server
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
          setMessage(
            "Connected to fingerprint scanner. Start the registration process."
          );

          // Subscribe to session-specific channel
          client.subscribe(
            `/topic/fingerprint/${sessionId}`,
            (message: any) => {
              handleResponse(JSON.parse(message.body));
            }
          );

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

  // Disconnect from the fingerprint server
  const disconnect = () => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => {
        setConnectionStatus("disconnected");
        setStompClient(null);
        setMessage("Connect to register fingerprint");
        setScanProgress(0);
        setIsScanning(false);
        toast.info("Disconnected from fingerprint scanner");
      });
    }
  };

  // Start fingerprint enrollment (3 scans)
  const startEnrollment = () => {
    if (stompClient && stompClient.connected) {
      setIsScanning(true);
      setTemplateData(null);
      setScanProgress(0);
      setMessage("Place your finger on the scanner for the first scan");

      stompClient.send(
        "/app/scan",
        {},
        JSON.stringify({
          operation: "enroll",
          sessionId: sessionId,
        })
      );
    } else {
      toast.error("Not connected to fingerprint scanner");
    }
  };

  // Handle WebSocket responses
  const handleResponse = (response: any) => {
    console.log("Received:", response);

    if (response.status === "in_progress") {
      setMessage(response.message);
      setScanProgress(response.progress);
    } else if (response.status === "success") {
      setMessage(response.message);
      setTemplateData(response.templateBase64);
      setIsScanning(false);
      toast.success("Scan completed successfully");

      // Notify parent component of template update
      if (onTemplateUpdate && response.templateBase64) {
        onTemplateUpdate(response.templateBase64);
        toast.success("Fingerprint template captured and ready to save");
      }
    } else if (response.status === "error") {
      setMessage(`Error: ${response.message}`);
      setIsScanning(false);
      toast.error(response.message);
    }
  };

  // Open scanner modal
  const openScannerModal = () => {
    setShowScannerModal(true);
    connect();
  };

  // Close scanner modal
  const closeScannerModal = () => {
    if (stompClient && stompClient.connected) {
      disconnect();
    }
    setShowScannerModal(false);
  };

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Fingerprint</label>
        <div className="flex items-center">
          <button
            type="button"
            onClick={openScannerModal}
            className="flex items-center justify-center bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faFingerprint} className="mr-2" />
            {hasExistingTemplate
              ? "Update Fingerprint"
              : "Register Fingerprint"}
          </button>
          {hasExistingTemplate && (
            <span className="ml-3 text-sm text-green-500">
              Fingerprint already registered
            </span>
          )}
        </div>
      </div>

      {/* Fingerprint Scanner Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              Fingerprint Registration
            </h2>

            {/* Connection Status */}
            <div className="mb-6 p-3 bg-gray-800 rounded-lg">
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
            </div>

            {/* Fingerprint Operations */}
            {connectionStatus === "connected" &&
              !isScanning &&
              !templateData && (
                <div className="mb-6">
                  <button
                    onClick={startEnrollment}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-2 rounded-md"
                  >
                    Start Fingerprint Registration
                  </button>
                </div>
              )}

            {/* Scan Status and Progress */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg text-center">
              <p className="text-white mb-4">{message}</p>

              {isScanning && scanProgress > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-gradient-to-r from-red-500 to-yellow-500 h-2.5 rounded-full"
                    style={{ width: `${scanProgress * 33.33}%` }}
                  ></div>
                </div>
              )}

              {templateData && (
                <div className="mt-4">
                  <p className="text-green-500 mb-2">Template Data Received</p>
                  <div className="bg-gray-700 p-2 rounded text-left">
                    <code className="text-xs text-gray-300 break-all">
                      {templateData.substring(0, 30)}...
                    </code>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-between">
              <button
                onClick={closeScannerModal}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>

              {connectionStatus === "connected" && (
                <button
                  onClick={disconnect}
                  className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FingerprintScanner;
