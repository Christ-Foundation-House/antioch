// components/ChatPage.tsx
"use client";

import { api } from "@/utils/api";
import React, { useState } from "react";
// import { trpc } from "@/utils/trpc";

const ChatPage = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("user-123");
  const [newMessage, setNewMessage] = useState<string>("");
  const [newChatName, setNewChatName] = useState<string>("");
  const [participants, setParticipants] = useState<string[]>([]);
  const trpc = api.chats;
  // Fetch messages only when a chat is selected
  const { data: messages, refetch: refetchMessages } =
    trpc.getMessages.useQuery({ chat_id: chatId || "" }, { enabled: !!chatId });

  // Fetch user's chats
  const { data: userChats, refetch: refetchChats } = trpc.getUserChats.useQuery(
    { user_id: userId },
  );

  // Mutations
  const sendMessageMutation = trpc.sendMessage.useMutation();
  const createChatMutation = trpc.createChat.useMutation();

  // Subscribe to real-time updates for the selected chat
  trpc.onNewMessage.useSubscription(
    { chat_id: chatId || "" },
    {
      onData(data) {
        console.log("New message received:", data);
        refetchMessages(); // Refresh messages when new data arrives
      },
    },
  );

  /** Create a new chat */
  const createChat = async () => {
    const newChat = await createChatMutation.mutateAsync({
      // creater_user_id: userId,
      participants,
    });
    setChatId(newChat.id);
    setParticipants([]);
    refetchChats();
  };

  /** Send a new message */
  const sendMessage = async () => {
    if (chatId && newMessage) {
      await sendMessageMutation.mutateAsync({
        chat_id: chatId,
        user_id: userId,
        message: newMessage,
      });
      setNewMessage("");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Chat App with tRPC and WebSockets</h1>

      {/* User ID Section */}
      <div>
        <label>User ID: </label>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} />
      </div>

      {/* Create New Chat Section */}
      <div>
        <h3>Create New Chat</h3>
        <input
          type="text"
          placeholder="Chat Name"
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Participant IDs (comma-separated)"
          onChange={(e) => setParticipants(e.target.value.split(","))}
        />
        <button onClick={createChat}>Create Chat</button>
      </div>

      {/* Chat List Section */}
      <h3>Your Chats</h3>
      {userChats?.map((chat) => (
        <div
          key={chat.id}
          style={{ padding: "10px", border: "1px solid gray" }}
        >
          <p>Chat ID: {chat.id}</p>
          <button onClick={() => setChatId(chat.id)}>Open Chat</button>
        </div>
      ))}

      {/* Message Section */}
      {chatId && (
        <div>
          <h3>Chat Messages</h3>
          <ul>
            {messages?.map((msg) => (
              <li key={msg.id}>
                <b>{msg.user_id}:</b> {msg.message} (
                {new Date(msg.created_at).toLocaleTimeString()})
              </li>
            ))}
          </ul>

          {/* Send Message Section */}
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
          />
          <button onClick={sendMessage}>Send Message</button>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
