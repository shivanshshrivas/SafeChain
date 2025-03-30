import React, { useState, useEffect, useRef } from "react";

const TextWindow = ({ nickname, deviceId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      sender: nickname,
      deviceId: deviceId,
      text: newMessage,
      timestamp: new Date().toISOString(),
      isSent: true, // Marks as a sent message
    };

    setMessages((prevMessages) => [...prevMessages, messageData]);
    setNewMessage("");
  };

  // Simulate receiving a message
  useEffect(() => {
    const simulateReceiveMessage = () => {
      setTimeout(() => {
        const receivedMessage = {
          sender: "Responder",
          deviceId: "Node_002",
          text: "Message received! Thank you for reaching out.",
          timestamp: new Date().toISOString(),
          isSent: false, // Marks as a received message
        };
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      }, 3000);
    };

    if (messages.length % 2 === 1) simulateReceiveMessage(); // Simulate every second message as a reply
  }, [messages]);

  return (
    <div className="w-full h-full flex flex-col bg-[#F5F5F0] text-[#3B3B3B] font-mono border-4 border-[#DEB887] rounded-lg shadow-xl">
      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 border border-[#D6D1C4] rounded-t-lg"
      >
        {messages.length === 0 && (
          <div className="text-center text-[#3B3B3B] opacity-70">No messages yet...</div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 flex items-end ${msg.isSent ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 max-w-[70%] rounded-xl shadow-md transform transition-all duration-300 ${
                msg.isSent
                  ? "bg-[#E0DACD] text-[#1E1E1E] translate-x-1 opacity-90"
                  : "bg-[#FFFFFF] text-[#3B3B3B] -translate-x-1 opacity-90"
              }`}
            >
              <div className="text-xs text-[#3B3B3B] font-semibold opacity-80 mb-1">
                {msg.sender} ({msg.deviceId}) - {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
              <div className="break-words text-sm leading-relaxed">{msg.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div className="flex items-center gap-2 p-4 border-t-2 border-[#D6D1C4] bg-[#F5F5F0] rounded-b-lg">
        <input
          type="text"
          className="w-full p-2 bg-[#FFFFFF] text-[#3B3B3B] border-2 border-[#D6D1C4] rounded-md focus:outline-none focus:ring focus:ring-[#E0DACD] shadow-sm"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-[#E0DACD] hover:bg-[#D6D1C4] text-[#1E1E1E] px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-[#E0DACD] shadow-md transform transition-all duration-300 hover:scale-105"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default TextWindow;
