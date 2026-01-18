// ========================================
// app/api/auth/[...all]/route.ts - Better Auth API Handler
// ========================================

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);