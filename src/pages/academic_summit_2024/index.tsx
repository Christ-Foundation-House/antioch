import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen dark:to-gray-800 flex flex-col items-center justify-center p-4 sm:p-8">
      <main className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white">
          Welcome to Academic Summit 2024
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300">
          Be inspired.Be empowered!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/academic_summit_2024/ask">Ask a Question</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Link href="/academic_summit_2024/questions_">View Questions</Link>
          </Button>
        </div>
      </main>
      <footer className="mt-16 text-sm text-gray-500 dark:text-gray-400">
        © 2024 Academic Summit. All rights reserved.
      </footer>
    </div>
  );
}
