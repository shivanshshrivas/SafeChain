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
    <div className="w-full h-full px-[5%] flex flex-col bg-[#F5F5F0] text-[#333333] rounded-lg shadow-xl">
      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 rounded-t-lg"
      >
        {messages.length === 0 && (
          <div className="text-center text-[#333333]">No messages yet...</div>
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
                  : "bg-[#FFFFFF] text-[#333333] -translate-x-1 opacity-90"
              }`}
            >
              <div className="text-xs font-figtree text-[#333333] font-semibold opacity-80 mb-1">
                {msg.sender} ({msg.deviceId}) - {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
              <div className="break-words text-sm font-inter leading-relaxed">{msg.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div className="flex items-end gap-2 py-4 bg-transparent rounded-b-lg">
      <textarea
        className="w-full overflow-hidden resize-none p-2 font-inter text-[#333333] rounded-3xl focus:outline-none focus:ring focus:ring-[#E0DACD] shadow-lg"
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value);
          e.target.style.height = "auto"; // Reset height to auto
          e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height based on content
        }}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
        placeholder="Type your message..."
        rows={1} // Start with a single row
      />
        <button
          onClick={sendMessage}
          className="bg-[#E0DACD] rotate-90 hover:rotate-0 hover:bg-[#D6D1C4] text-[#1E1E1E] px-2 py-2 rounded-full focus:outline-none focus:ring focus:ring-[#E0DACD] shadow-md transform transition-all duration-300 hover:scale-105"
        >
          <svg viewBox="0 0 24 24" height={20} width={20} fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepoBgCarrier" strokeWidth="0"></g><g id="SVGRepoTracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepoIconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z" fill="#000000"></path> </g></svg>
        </button>
      </div>
    </div>
  );
};

export default TextWindow;
