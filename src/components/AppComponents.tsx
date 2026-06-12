import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: boolean;
  hoverable?: boolean;
}

export function AppCard({ children, className, gradient, hoverable = true, ...props }: AppCardProps) {
  return (
    <div 
      className={cn(
        "rounded-3xl border border-white/5 bg-bg-card shadow-card overflow-hidden transition-all",
        hoverable && "hover-card-effect active:scale-[0.98]",
        gradient && "bg-gradient-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: boolean;
  actions?: React.ReactNode;
}

export function AppHeader({ title, subtitle, backButton, actions }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between py-4 mb-6">
      <div className="flex items-center gap-3">
        {backButton && (
          <button 
            onClick={() => window.history.back()}
            className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted active:scale-90 transition-transform"
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold font-space uppercase tracking-tight leading-tight italic">{title}</h2>
          {subtitle && <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-0.5 opacity-60">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  className?: string;
}

export function SectionHeader({ title, onSeeAll, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">{title}</h3>
      {onSeeAll && (
        <button 
          onClick={onSeeAll}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline active:scale-95 transition-all"
        >
          Ver tudo
        </button>
      )}
    </div>
  );
}

import { Search, X } from "lucide-react";

interface AppSearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function AppSearchBar({ placeholder = "Buscar...", value, onChange, onClear }: AppSearchBarProps) {
  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-12 text-sm font-medium placeholder:text-text-muted/50 focus:outline-none focus:border-primary/30 transition-all"
      />
      {value && (
        <button 
          onClick={() => {
            onChange("");
            onClear?.();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-white"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
