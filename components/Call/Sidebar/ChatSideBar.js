import React, { useEffect, useRef, useState } from "react";
import Input from "./Input";
import { BiSend } from "react-icons/bi";

const ChatSideBar = ({
  members,
  rtmChannel,
  messages,
  currentUserId,
  addMessage,
  isTabWidth,
}) => {
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState(1);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
    console.log({ messages });
  }, [messageContainerRef, messages]);

  const sendMessage = async () => {
    let trimmedMessage = message;
    if (trimmedMessage.trim().length == 0) return;

    console.log({ message });

    await rtmChannel.sendMessage({ text: message });
    addMessage({ message, sendBy: currentUserId });
    setMessage("");
    setRows(1);
  };

  return (
    <div className="h-full relative">
      <div
        className="msg mb-4 md:mb-6"
        ref={messageContainerRef}
        style={{ height: "85%", overflowY: "auto", overflowX: "hidden" }}
      >
        {messages?.map((message, index) => (
          <div
            key={index}
            className={`message ${
              index == 0
                ? ""
                : messages[index - 1].sendBy != message.sendBy
                ? "pt-4"
                : "pt-2"
            }`}
          >
            {index == 0 ? (
              <h4 className="sendBy font-bold ">
                {message.sendBy == currentUserId
                  ? "You"
                  : members.find((member) => member.userId == message.sendBy)
                      .name}
              </h4>
            ) : messages[index - 1].sendBy != message.sendBy ? (
              <h4 className="sendBy font-bold ">
                {message.sendBy == currentUserId
                  ? "You"
                  : members.find((member) => member.userId == message.sendBy)
                      .name}
              </h4>
            ) : (
              <></>
            )}
            {message.message.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        ))}
      </div>
      <div className="absolute w-full bottom-0">
        <div className="input ">
          <Input
            icon={
              <button onClick={() => sendMessage()}>
                <BiSend className="text-gray-700 text-xl" />
              </button>
            }
            onChange={(e) => setMessage(e.target.value)}
            type={"text"}
            placeholder={"Send a message to everyone"}
            value={message}
            onsubmit={sendMessage}
            rows={rows}
            setRows={(e) => setRows(e)}
            isTabWidth={isTabWidth}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;
