import { EventEmitter } from "events";
import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const ee = new EventEmitter(); // Event Emitter for real-time updates
// const t = initTRPC.create();

// Type definition for a message
type ChatMessage = {
  id: number;
  chat_id: string;
  user_id: string;
  message: string;
  created_at: Date;
};

export const chatRouter = createTRPCRouter({
  /**
   * Subscription: Listen for new messages
   */
  onNewMessage: protectedProcedure
    .input(z.object({ chat_id: z.string() }))
    .subscription(({ input }) => {
      return observable<ChatMessage>((emit) => {
        const onMessage = (data: ChatMessage) => {
          if (data.chat_id === input.chat_id) {
            emit.next(data);
          }
        };
        ee.on("newMessage", onMessage);
        return () => {
          ee.off("newMessage", onMessage);
        };
      });
    }),

  /**
   * Mutation: Send a new message
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        chat_id: z.string(),
        user_id: z.string(),
        message: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const id = ctx.session.user.id;
      const newMessage = await prisma.chat_message.create({
        data: {
          chat_id: input.chat_id,
          user_id: id,
          message: input.message,
        },
      });

      // Emit event for subscribers
      ee.emit("newMessage", newMessage);
      return newMessage;
    }),

  /**
   * Query: Fetch all messages for a chat
   */
  getMessages: protectedProcedure
    .input(z.object({ chat_id: z.string() }))
    .query(async ({ input }) => {
      return await prisma.chat_message.findMany({
        where: { chat_id: input.chat_id },
        orderBy: { created_at: "asc" },
      });
    }),

  /**
   * Mutation: Create a new chat
   */
  createChat: protectedProcedure
    .input(
      z.object({
        // creater_user_id: z.string(),
        participants: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const id = ctx.session.user.id;
      const newChat = await prisma.chat.create({
        data: {
          creater_user_id: id,
          participants: {
            connect: input.participants.map((id) => ({ id })),
          },
        },
      });
      return newChat;
    }),

  /**
   * Query: Fetch all chats a user is part of
   */
  getUserChats: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ input, ctx }) => {
      const id = ctx.session.user.id;
      return await prisma.chat.findMany({
        where: {
          OR: [{ creater_user_id: id }, { participants: { some: { id } } }],
        },
        include: {
          messages: true,
          participants: true,
        },
      });
    }),
});
