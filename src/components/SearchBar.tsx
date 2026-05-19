"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize input state with whatever query is already in the URL
  const [text, setText] = useState(searchParams.get("q") || "");

  useEffect(() => {
    // Wait 300ms after the user stops typing before committing to the URL
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (text) {
        params.set("q", text);
      } else {
        params.delete("q");
      }
      
      // Updates the URL query string gracefully without reloading the entire page
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [text, router, searchParams]);

  // Handle manual clear or external URL changes
  useEffect(() => {
    setText(searchParams.get("q") || "");
  }, [searchParams]);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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