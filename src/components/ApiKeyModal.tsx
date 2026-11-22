import { useState, useEffect } from 'react';
import {
  Key,
  ExternalLink,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  AVAILABLE_MODELS,
  getStoredApiKey,
  getStoredModel,
  saveStoredApiKey,
  saveStoredModel,
} from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  isMandatory?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ApiKeyModal({
  isOpen,
  isMandatory = false,
  onClose,
  onSaved,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setErrorMessage(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập API Key của bạn để sử dụng ứng dụng.');
      return;
    }

    if (!trimmed.startsWith('AIza') && trimmed.length < 20) {
      setErrorMessage('Khóa API Gemini thường có độ dài ít nhất 39 ký tự (bắt đầu bằng AIza...). Vui lòng kiểm tra lại.');
      return;
    }

    saveStoredApiKey(trimmed);
    saveStoredModel(selectedModel);
    setSavedSuccess(true);
    setErrorMessage(null);

    setTimeout(() => {
      onSaved();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-6 relative">
          {!isMandatory && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="absolute top-5 right-5 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md">
              <Key className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Thiết lập Model & API Key</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Cấu hình khóa Gemini cá nhân và chọn model thông minh cho app
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Guide Banner */}
          <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 text-xs sm:text-sm text-amber-900 space-y-2">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-amber-950">
                  Lấy API Key Gemini miễn phí:
                </span>{' '}
                Để dùng app trực tiếp với tốc độ cao và không lo giới hạn chung, bạn hãy vào{' '}
                <a
                  href="https://aistudio.google.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-red-600 underline hover:text-red-700"
                >
                  aistudio.google.com/api-keys
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>{' '}
                để tạo khóa và dán vào ô bên dưới. Khóa được lưu an toàn trực tiếp trong trình duyệt (localStorage) của bạn.
              </div>
            </div>
          </div>

          {/* Model Selection Cards */}
          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-teal-700" />
                Chọn Model AI ưu tiên:
              </span>
              <span className="text-xs font-normal text-slate-500">
                (Tự động chuyển đổi nếu lỗi 429)
              </span>
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {AVAILABLE_MODELS.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <label
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`relative flex items-start gap-3.5 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gemini_model"
                      value={m.id}
                      checked={isSelected}
                      onChange={() => setSelectedModel(m.id)}
                      className="mt-1 h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-slate-800 tracking-tight">
                          {m.name}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${m.badgeColor}`}
                        >
                          {m.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">
                        {m.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="api-key-input"
                className="block text-sm font-bold text-slate-800 flex items-center gap-1.5"
              >
                <Key className="w-4 h-4 text-teal-700" />
                Khóa Google Gemini API Key
              </label>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                {showKey ? 'Ẩn khóa' : 'Hiện khóa'}
              </button>
            </div>

            <div className="relative">
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Dán khóa API của bạn vào đây (ví dụ: AIzaSy...)"
                className="w-full min-h-[46px] rounded-2xl border-2 border-slate-300 bg-white px-4 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
              />
            </div>

            {errorMessage && (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mt-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </p>
            )}

            {savedSuccess && (
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mt-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                Đã lưu thành công! Đang kết nối Trợ lý Ngôn Từ...
              </p>
            )}
          </div>

          {/* Fallback Guarantee Note */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Cơ chế tự phục hồi (Auto-Fallback):</strong> Hệ thống tự động chuyển đổi sang các model dự phòng nếu model chính bị quá tải quota.
            </span>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!isMandatory && (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 rounded-2xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="submit"
              className="min-h-[44px] px-6 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white text-sm font-bold shadow-md hover:from-emerald-800 hover:to-teal-800 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Lưu & Bắt đầu trải nghiệm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
