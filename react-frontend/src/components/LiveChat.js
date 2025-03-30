import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const LiveChat = () => {
  const location = useLocation();
  const { meshID, meshName, ipfsLink, deviceID, nickname } = location.state || {};

  // Local component state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // WebSocket reference
  const wsRef = useRef(null);

  // Scroll container reference
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize WebSocket when meshID is available
  useEffect(() => {
    if (!meshID) return;

    const socket = new WebSocket("ws://10.104.175.40:5002");

    socket.onopen = () => {
      console.log("🟢 WebSocket connected");
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      // Only handle messages for the current meshID
      if (msg.type === "mesh_message" && msg.meshID === meshID) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.onclose = () => {
      console.log("🔴 WebSocket disconnected");
    };

    wsRef.current = socket;
    return () => socket.close();
  }, [meshID]);

  // Send message to the mesh and save to DB
  const sendMessage = async () => {
    if (!meshID || !deviceID || !nickname || !message.trim()) return;

    const timestamp = new Date().toISOString();

    try {
      // 1) Broadcast to mesh
      await axios.post("http://10.104.175.40:5002/api/broadcast-message", {
        meshID,
        message,
        deviceID,
        deviceNickname: nickname,
        timestamp,
      });

      // 2) Save to DB
      await axios.post("http://localhost:5000/api/send-message", {
        meshID,
        message,
        deviceID,
        deviceNickname: nickname,
        timestamp,
      });

      // Clear input
      setMessage("");
    } catch (err) {
      console.error("❌ Failed to broadcast or save message:", err);
      alert("Failed to send message. Try again.");
    }
  };

  // Listen for Enter key (without Shift) to send message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // We determine “sent” vs “received” by comparing the message's deviceID to our local deviceID
  const isSentByMe = (msg) => msg.deviceID === deviceID;

  return (
    <div className="flex flex-row w-auto h-full">
      <div className="w-full h-full px-[5%] flex flex-col bg-[#F5F5F0] text-[#333333] border rounded-xl shadow-xl">

        {/* Header: Displaying relevant info (optional) */}
        <div className="py-2 px-4 border-b border-gray-300 flex flex-col">
          <div className="text-lg font-semibold">
            💬 Live Mesh Chat
          </div>
          <div className="text-xs text-[#333333] mt-1 flex gap-4">
            <span>Mesh ID: {meshID}</span>
            <span>Device ID: {deviceID}</span>
            <span>Nickname: {nickname}</span>
          </div>
        </div>

        {/* Messages container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4"
        >
          {messages.length === 0 && (
            <div className="text-center text-[#333333]">
              No messages yet...
            </div>
          )}

          {messages.map((msg, index) => {
            const sent = isSentByMe(msg);
            return (
              <div
                key={index}
                className={`mb-2 flex items-end ${
                  sent ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 max-w-[70%] rounded-xl shadow-md transform transition-all duration-300 ${
                    sent
                      ? "bg-[#E0DACD] text-[#1E1E1E] translate-x-1 opacity-90"
                      : "bg-[#FFFFFF] text-[#333333] -translate-x-1 opacity-90"
                  }`}
                >
                  {/* Message header: sender, device, time */}
                  <div className="text-xs font-figtree text-[#333333] font-semibold opacity-80 mb-1">
                    {msg.deviceNickname} ({msg.deviceID}) -{" "}
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                  {/* Message text */}
                  <div className="break-words text-sm font-inter leading-relaxed">
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input field */}
        <div className="flex items-end gap-2 py-4 bg-transparent rounded-b-lg">
          <textarea
            className="w-full overflow-hidden resize-none px-4 py-2 font-inter text-[#333333] rounded-3xl focus:outline-none focus:ring focus:ring-[#E0DACD] shadow-lg"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
          />
          <button
            onClick={sendMessage}
            className="bg-[#E0DACD] rotate-90 hover:rotate-0 hover:bg-[#D6D1C4] text-[#1E1E1E] px-2 py-2 rounded-full focus:outline-none focus:ring focus:ring-[#E0DACD] shadow-md transform transition-all duration-300 hover:scale-105"
          >
            {/* Up-arrow icon (same SVG) */}
            <svg
              viewBox="0 0 24 24"
              height={20}
              width={20}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepoBgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepoTracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepoIconCarrier">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z"
                  fill="#000000"
                />
              </g>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
