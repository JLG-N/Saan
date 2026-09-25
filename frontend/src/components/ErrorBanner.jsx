export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="sn-error-banner">{message}</div>;
}
