import React, { useState } from 'react';
import { AdminChat, ChatMessage } from '../types';

interface ChatsTabProps {
  chats: AdminChat[];
  selectedChat: string | null;
  chatMessages: ChatMessage[];
  onSelectChat: (userId: string) => void;
  onSendMessage: (e: React.FormEvent) => Promise<void>;
  newMessage: string;
  onNewMessageChange: (message: string) => void;
}

export const ChatsTab: React.FC<ChatsTabProps> = ({
  chats,
  selectedChat,
  chatMessages,
  onSelectChat,
  onSendMessage,
  newMessage,
  onNewMessageChange
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 h-[calc(100vh-16rem)]">
      <div className="border rounded-lg overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          {chats.map((chat) => (
            <button
              key={chat.user_id}
              onClick={() => onSelectChat(chat.user_id)}
              className={`w-full p-3 text-left hover:bg-gray-50 ${
                selectedChat === chat.user_id ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="font-medium">{chat.profiles?.full_name || 'Unknown User'}</p>
                {chat.unread_count > 0 && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    {chat.unread_count}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {chat.last_message.content}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(chat.last_message.created_at).toLocaleTimeString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-2 border rounded-lg overflow-hidden flex flex-col">
        {selectedChat ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_admin ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-lg p-3 ${
                    message.is_admin
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.is_admin
                          ? message.admin?.full_name || 'Support Team'
                          : message.profiles?.full_name || 'Unknown User'}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-75 mt-1 block">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t bg-white p-4">
              <form onSubmit={onSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => onNewMessageChange(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};