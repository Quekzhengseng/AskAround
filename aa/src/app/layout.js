import "./globals.css";

export const metadata = {
  title: "Survey Platform",
  description: "Create and respond to surveys",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="color-scheme-light">{children}</body>
    </html>
  );
}
