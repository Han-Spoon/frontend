import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import type { HistoryItem, Language } from '../App';

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

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

  const subtitle = (item: HistoryItem) =>
    language === 'ko'
      ? `메뉴 ${item.menuCount}개 분석`
      : language === 'ar'
        ? `تم تحليل ${item.menuCount} عناصر`
        : `Analyzed ${item.menuCount} items`;

  return (
    <div className="space-y-2">
      {history.map((item) => (
        <div key={item.id} className="p-4 bg-neutral-50 rounded-xl">
          {editingId === item.id ? (
            <div className="flex items-center gap-2">
              <input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-neutral-500"
              />
              <button
                onClick={() => {
                  const next = editingTitle.trim();
                  if (next) onRename(item.id, next);
                  setEditingId(null);
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-700 hover:bg-neutral-200"
                aria-label={t('저장', 'Save', 'حفظ')}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
                aria-label={t('취소', 'Cancel', 'إلغاء')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => onOpen(item)} className="flex-1 text-left">
                <div className="text-sm font-medium text-neutral-900">{item.title}</div>
                <div className="text-xs text-neutral-600 mt-1">{subtitle(item)}</div>
              </button>
              <button
                onClick={() => {
                  setEditingId(item.id);
                  setEditingTitle(item.title);
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
                aria-label={t('이름 수정', 'Rename', 'إعادة تسمية')}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
