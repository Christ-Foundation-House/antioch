import { env } from "@/env";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const supabase_signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    console.error("Signup error:", error.message);
  } else {
    console.log("Signup successful:", data);
  }
};

// Function to sign in a user
export const supabase_signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth
      .signInWithPassword({
        email,
        password,
      })
      .catch((error) => {
        throw new Error(error);
      });
    if (error) {
      throw new Error(`Login error: ${error.message}`);
    } else {
      console.log("Login successful:", data);
    }
  } catch (error) {
    console.error(error);
    return error;
  }
};

// Function to sign out a user
export const supabase_signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error.message);
  } else {
    console.log("Logout successful");
  }
};
