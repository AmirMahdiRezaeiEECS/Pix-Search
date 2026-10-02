import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import MeiliLogo from "@/assets/meili_logo.svg";
import { useRef } from "react";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const keyboardHeight = useKeyboardHeight();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && value) {
      onChange("");
    }
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div 
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-[70%] lg:w-[60%] max-w-xl transition-all duration-200" 
      style={{ marginBottom: `${keyboardHeight > 0 ? keyboardHeight + 24 : 24}px` }}
    >
      <div className="relative bg-[rgb(var(--glass-bg))] backdrop-blur-[6px] rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border-0 outline-none ring-0">
        <a
          href="https://meilisearch.com"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-5 top-1/2 -translate-y-1/2 z-10 hover:opacity-100 transition-opacity"
        >
          <img src={MeiliLogo} alt="Meilisearch" className="h-4 w-auto invert dark:invert-0 opacity-70" />
        </a>
        <Input
          ref={inputRef}
          type="search"
          inputMode="search"
          placeholder="What inspires you today?"
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-14 pr-14 h-14 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:bg-foreground/5 outline-none focus-visible:shadow-[0_8px_24px_0_rgba(0,0,0,0.15)] rounded-full placeholder:text-foreground/50 transition-all duration-300"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-foreground/10 hover:bg-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
