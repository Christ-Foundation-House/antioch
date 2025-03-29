import { releaseNotes } from "@/pages/release_notes";
import { Bug } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Footer() {
  const version = releaseNotes[0].version;
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  return (
    <footer className="py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <Link
            href={`/release_notes#${version}`}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            V{version}
          </Link>
          <div className="text-sm text-gray-600 mb-2 sm:mb-0">
            © {currentYear} WICF. All rights reserved.
          </div>

          <Link
            href={`/report?url=${router.asPath}`}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Bug className="w-4 h-4 mr-1" />
            Report a Bug / Problem
          </Link>
        </div>
      </div>
    </footer>
  );
}
