import type { ReactNode } from 'react';

export interface CommunicationAction {
  id: string;
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

function ActionButton({ action, primary = false }: { action: CommunicationAction; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={action.onClick}
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-normal rounded-xl px-3 py-2.5 text-center text-sm font-bold leading-5 ${
        primary
          ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
          : 'border border-border-warm bg-surface-raised text-text-primary hover:bg-surface-interactive'
      }`}
    >
      {action.icon}
      <span>{action.label}</span>
    </button>
  );
}

export function CommunicationActions({
  primaryAction,
  requestActions = [],
  trailingAction,
}: {
  primaryAction?: CommunicationAction;
  requestActions?: CommunicationAction[];
  trailingAction?: CommunicationAction;
}) {
  return (
    <div className="space-y-2">
      {primaryAction && <ActionButton action={primaryAction} primary />}
      {requestActions.length > 0 && (
        <div className={`grid gap-2 ${requestActions.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {requestActions.map((action) => <ActionButton key={action.id} action={action} />)}
        </div>
      )}
      {trailingAction && <ActionButton action={trailingAction} />}
    </div>
  );
}
