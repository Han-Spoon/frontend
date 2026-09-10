import type { HistoryItem, UserProfile } from '../App';
import { readDemo, writeDemo } from './storage';

export interface VisitRecord extends HistoryItem {
  restaurantId: string | null;
  sourceScanId?: string;
  profileSnapshot: UserProfile | null;
  feedback: Record<string, 'yes' | 'no' | 'unknown'>;
}
export function saveVisit(record: VisitRecord) {
  const current = readDemo<VisitRecord[]>('records', []);
  writeDemo('records', [
    record,
    ...current.filter((item) => item.id !== record.id),
  ]);
}
