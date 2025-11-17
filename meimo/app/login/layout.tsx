// app/login/layout.tsx
export const metadata = {
  title: "Login - Rasa Manado",
  description: "Halaman login untuk website Rasa Manado",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}