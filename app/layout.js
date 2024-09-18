import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../styles/theme';
import Header from '../components/Header';
import UserInitializer from '../components/UserInitializer';
import Footer from '../components/Footer';
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ALX Study with AI - Revolutionize Your Learning",
  description: "Master any subject with AI-powered study tools including flashcards, quizzes, and study notes.",
  icons: {
    icon: './favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header />
            <UserInitializer />
            {children}
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}