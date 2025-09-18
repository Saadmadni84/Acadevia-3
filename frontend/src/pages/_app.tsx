// pages/_app.tsx
import type { AppProps } from 'next/app';
import SchoolBackground from '../components/SchoolBackground';
import '../styles/globals.css';
import '../styles/backgrounds.css'; // Import your CSS

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SchoolBackground>
      <Component {...pageProps} />
    </SchoolBackground>
  );
}
