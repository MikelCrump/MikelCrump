export function ControlToast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed right-4 bottom-4 z-50 rounded-xl bg-[var(--life-ink)] px-4 py-3 text-sm text-white shadow-lg">
      {message}
    </div>
  );
}
