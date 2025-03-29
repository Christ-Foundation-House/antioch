import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter } from "@/server/api/trpc";
import { routerPrayer } from "./routers/prayer";
import { routerPhotos } from "./routers/photos";
import { routerUser } from "./routers/user";
import { routerRegistration } from "./routers/registration";
import { routerStats } from "./routers/stats";
import { linkRouter } from "./routers/link";
import { routerReport } from "./routers/report";
import { emailRouter } from "./routers/email";
import { routerForms } from "./routers/forms";
import { chatRouter } from "./routers/chats";
import { ministryRouter } from "./routers/ministry";
import { leadershipPositionRouter } from "./routers/leadership-position";
import { leadershipTenureRouter } from "./routers/leadership-tenure";
import { qaRouter } from "./routers/qa";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  prayer: routerPrayer,
  photos: routerPhotos,
  user: routerUser,
  registration: routerRegistration,
  stats: routerStats,
  link: linkRouter,
  report: routerReport,
  email: emailRouter,
  forms: routerForms,
  chats: chatRouter,
  ministry: ministryRouter,
  leadershipPosition: leadershipPositionRouter,
  leadershipTenure: leadershipTenureRouter,
  qa: qaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

// Export router types for better type inference
// export type { RouterOutputs, RouterInputs } from "@trpc/server";
