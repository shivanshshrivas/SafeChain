import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const LiveChat = () => {
  const [meshID, setMeshID] = useState("");
  const [deviceID, setDeviceID] = useState("");
  const [deviceNickname, setDeviceNickname] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!meshID) return;

    const socket = new WebSocket("ws://localhost:5000");

    socket.onopen = () => {
      console.log("🟢 WebSocket connected");
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
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

  const sendMessage = async () => {
    if (!meshID || !deviceID || !deviceNickname || !message) return;
  
    const timestamp = new Date().toISOString();
  
    try {
      // Step 1: Broadcast message
      await axios.post("http://localhost:5000/api/broadcast-message", {
        meshID,
        message,
        deviceID,
        deviceNickname,
        timestamp,
      });
  
      // Step 2: Only if broadcast is successful, save to DB
      await axios.post("http://localhost:5000/api/send-message", {
        meshID,
        message,
        deviceID,
        deviceNickname,
        timestamp,
      });
  
      setMessage("");
    } catch (err) {
      console.error("❌ Failed to broadcast or save message:", err);
      alert("Failed to send message. Try again.");
    }
  };
  

  return (
    <div style={{ maxWidth: "600px", margin: "1rem auto", padding: "1rem", border: "1px solid #ccc" }}>
      <h2>💬 Live Mesh Chat</h2>

      <input placeholder="Mesh ID" value={meshID} onChange={(e) => setMeshID(e.target.value)} /><br /><br />
      <input placeholder="Your Device ID" value={deviceID} onChange={(e) => setDeviceID(e.target.value)} /><br /><br />
      <input placeholder="Your Nickname" value={deviceNickname} onChange={(e) => setDeviceNickname(e.target.value)} /><br /><br />

      <textarea
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        style={{ width: "100%" }}
      /><br /><br />

      <button onClick={sendMessage}>📤 Send</button>

      <div style={{ marginTop: "2rem" }}>
        <h4>📨 Incoming Messages:</h4>
        <div style={{ maxHeight: "300px", overflowY: "auto", background: "#f9f9f9", padding: "1rem" }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <strong>{msg.deviceNickname}:</strong> {msg.message}
              <div style={{ fontSize: "0.8rem", color: "#777" }}>{new Date(msg.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
