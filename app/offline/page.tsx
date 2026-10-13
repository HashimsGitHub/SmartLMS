import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline - SmartLMS" };

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 px-4">
      <div className="p-4 rounded-2xl bg-muted text-muted-foreground">
        <WifiOff className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold">You&apos;re offline</h1>
      <p className="text-sm text-muted-foreground max-w-xs">
        SmartLMS needs a connection to load this page. Check your network and try again.
      </p>
      <Link href="/" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
        Try again
      </Link>
    </div>
  );
}
