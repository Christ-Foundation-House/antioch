import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export type notification_topic_name =
  | "all_users"
  | "self"
  | "user_information_update"
  | "user_registration"
  | "user_registration_progress";

export interface notification_topic_type {
  [key: string]: {
    label: string;
  };
}

export const notifications_topics: notification_topic_type = {
  all_users: {
    label: "All Users",
  },
  self: {
    label: "Self",
  },
  system_general: {
    label: "System General",
  },
  system_error: {
    label: "System Error",
  },
  leaders: {
    label: "Leaders",
  },
  user_information_update: {
    label: "User Information Update",
  },
  user_registration_progress: {
    label: "User Registration Progress",
  },
  user_registration: {
    label: "User Registration",
  },
  prayer_request: {
    label: "Prayer Request",
  },
  feedback_submitted: {
    label: "Feedback Submitted",
  },
};

export interface notification_push_args {
  // topic: keyof typeof notifications_topics;
  topic: string;
  title?: string;
  message: string;

  from_user_id?: string;
  to_user_id?: string[];
}

export async function notification_push(args: notification_push_args) {
  console.log(args);
  try {
    const notification = await prisma.notifications.create({
      data: {
        topic: args.topic,
        title: args.title ?? notifications_topics[args.topic].label,
        message: args.message,
        from_user_id: args.from_user_id,
        to_user_ids: {
          connect: args.to_user_id?.map((id) => ({ id: String(id) })),
        },
      },
    });
    console.log(notification);
  } catch (e) {
    logger.error(e);
  }
}
