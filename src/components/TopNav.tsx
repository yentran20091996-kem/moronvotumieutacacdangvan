import { Key, PenLine, Settings, Sparkles } from 'lucide-react';
import { NavTab } from '../types';

interface TopNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
  activeModelName?: string;
}

const NAV_ITEMS: { id: NavTab; label: string }[] = [
  { id: 'pillars', label: '4 Trụ cột' },
  { id: 'upgrade', label: 'Nâng cấp' },
  { id: 'vocab', label: 'Kho từ' },
  { id: 'games', label: 'Trò chơi' },
  { id: 'notebook', label: 'Sổ tay' },
];

export function TopNav({
  activeTab,
  onSelectTab,
  onOpenSettings,
  hasApiKey,
  activeModelName,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FCFDFB]/95 backdrop-blur-sm border-b border-[#DCEEE4]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('pillars')}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#0F766E] whitespace-nowrap shrink-0 cursor-pointer hover:opacity-85 transition-opacity flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-[#F59E0B]" />
          <span>Hành Trình Ngôn Từ</span>
        </button>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav aria-label="Điều hướng chính" className="hidden lg:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-2 text-[15px] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-[#0F766E] font-semibold'
                    : 'text-[#526277] hover:text-[#1E293B]'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 right-0 bottom-0 h-0.5 rounded-full transition-opacity duration-200 ${
                    isActive ? 'bg-[#0F766E] opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Settings (API Key) & Primary CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Settings (API Key) button with RED prompt per AI_INSTRUCTIONS.md */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Nhấn để thiết lập hoặc đổi API Key Gemini khi hết quota"
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-rose-300 bg-rose-50/70 hover:bg-rose-100 hover:border-rose-400 transition-all text-xs font-semibold cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-1.5 text-rose-700">
              <Settings className="w-4 h-4 text-rose-600 group-hover:rotate-45 transition-transform" />
              <Key className="w-3.5 h-3.5 text-amber-600 hidden sm:inline" />
              <span className="text-red-600 font-bold whitespace-nowrap">
                Lấy API key để sử dụng app
              </span>
            </div>
            {hasApiKey && activeModelName && (
              <span className="hidden md:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/80 border border-emerald-300 text-emerald-800">
                {activeModelName}
              </span>
            )}
          </button>

          {/* Viết ngay CTA */}
          <button
            type="button"
            onClick={() => onSelectTab('upgrade')}
            className="inline-flex items-center gap-1.5 min-h-[38px] px-4 py-2 rounded-2xl bg-[#0F766E] text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer hover:bg-[#0B5D56] active:scale-[0.98] transition-all shadow-xs"
          >
            <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Viết ngay</span>
            <span className="sm:hidden">Viết</span>
          </button>
        </div>
      </div>

      {/* Compact single-row mobile navigation */}
      <nav
        aria-label="Điều hướng di động"
        className="lg:hidden border-t border-[#E8F3EC] bg-[#FCFDFB] px-2 py-1 flex items-center justify-around overflow-x-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`min-h-[38px] px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 rounded-xl transition-colors ${
                isActive ? 'bg-[#EBFAF2] text-[#0F766E]' : 'text-[#526277]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
