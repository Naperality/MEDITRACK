"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Track text input state locally
  const [text, setText] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (text) {
        params.set("q", text);
      } else {
        params.delete("q");
      }
      
      // startTransition forces Next.js to wait for the server component to re-render
      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
        router.refresh(); // 🔥 CRITICAL: Forces Next.js to clear cache and update the server layout data
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [text, router, searchParams]);

  // Sync state if URL changes externally
  useEffect(() => {
    setText(searchParams.get("q") || "");
  }, [searchParams]);

  return (
    <div className="relative">
      <Search 
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
          isPending ? "text-rose-500 animate-pulse" : "text-slate-400"
        }`} 
      />
      <input
        type="text"
        placeholder="Search patient name..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-white border border-slate-200 pl-11 pr-4 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 outline-none transition-all shadow-sm"
      />
    </div>
  );
}