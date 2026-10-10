import type { SocialProvider } from "@/lib/account";

/**
 * 로그인 공급자의 표식. 각 회사의 고유 색이라 토큰 밖 색 값을 쓴다(design-lint 예외, DESIGN.md 정한 것 A.4).
 */
export function ProviderMark({ provider }: { provider: SocialProvider }) {
  if (provider === "microsoft") return <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20"><path fill="#f25022" d="M0 0h9v9H0z" /><path fill="#7fba00" d="M11 0h9v9h-9z" /><path fill="#00a4ef" d="M0 11h9v9H0z" /><path fill="#ffb900" d="M11 11h9v9h-9z" /></svg>;
  if (provider === "apple") return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.1 12.3c0-2 1.6-3 1.7-3.1-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.5.8-3.2.8-.6 0-1.6-.8-2.7-.8-1.4 0-2.7.8-3.4 2-1.5 2.4-.4 6.1 1 8.1.7 1 1.4 2 2.5 1.9 1-.1 1.4-.6 2.7-.6s1.6.6 2.8.6 1.8-1 2.5-1.9c.8-1.1 1.1-2.2 1.1-2.3-.1 0-1.8-.7-1.8-3ZM15.1 6.2c.6-.8 1.1-1.8 1-2.9-1 .1-2.1.7-2.8 1.4-.6.6-1.1 1.7-1 2.7 1.1.1 2.1-.5 2.8-1.2Z" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.7 4.7 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z" /><path fill="#34A853" d="M12 22c2.7 0 5-1 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.9-1.8-5.7-4.2H3v2.6A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.3 13.8a6 6 0 0 1 0-3.6V7.6H3a10 10 0 0 0 0 8.8l3.3-2.6Z" /><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.9 1.5l2.9-2.8A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9 5.6l3.3 2.6A6 6 0 0 1 12 6Z" /></svg>;
}
