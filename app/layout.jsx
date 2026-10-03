import "./globals.css";
import VercelAnalytics from "./VercelAnalytics";

export const metadata = {
  title: "Sand At Your Door | Digit Infra Pvt LTD",
  description:
    "Same day sand delivery for residential, commercial, and construction needs across Patna by Digit Infra Pvt LTD.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <body>
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
