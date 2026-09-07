import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import type { HistoryItem, Language } from '../App';
import { createTranslator } from '../locales';

interface ScanHistoryListProps {
  language: Language;
  history: HistoryItem[];
  onOpen: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export function ScanHistoryList({ language, history, onOpen, onDelete, onRename }: ScanHistoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const t = createTranslator(language);

  const subtitle = (item: HistoryItem) => t(
    `메뉴 ${item.menuCount}개 분석`,
    `Analyzed ${item.menuCount} items`,
    `تم تحليل ${item.menuCount} عناصر`,
  );

  return (
    <div className="space-y-2">
      {history.map((item) => (
        <div key={item.id} className="p-4 bg-rice-white border border-border-warm rounded-2xl shadow-[0_6px_20px_rgba(54,70,60,0.05)]">
          {editingId === item.id ? (
            <div className="flex items-center gap-2">
              <input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="flex-1 h-10 px-3 rounded-xl border border-border-warm bg-white text-sm focus:outline-none focus:border-brand-green-500"
              />
              <button
                onClick={() => {
                  const next = editingTitle.trim();
                  if (next) onRename(item.id, next);
                  setEditingId(null);
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-green-700 hover:bg-brand-green-50"
                aria-label={t('저장', 'Save', 'حفظ')}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sesame-gray hover:bg-muted"
                aria-label={t('취소', 'Cancel', 'إلغاء')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => onOpen(item)} className="flex-1 text-left">
                <div className="text-sm font-bold text-soy-ink">{item.title}</div>
                <div className="text-xs text-sesame-gray mt-1">{subtitle(item)}</div>
              </button>
              <button
                onClick={() => {
                  setEditingId(item.id);
                  setEditingTitle(item.title);
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sesame-gray hover:text-brand-green-700 hover:bg-brand-green-50 transition-colors"
                aria-label={t('이름 수정', 'Rename', 'إعادة تسمية')}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sesame-gray hover:text-destructive hover:bg-red-50 transition-colors"
                aria-label={t('삭제', 'Delete', 'حذف')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
