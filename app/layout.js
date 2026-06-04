import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })

export const metadata = {
  title: 'Campus Transformation — Team Portal',
  description: 'Internal team hub for the Campus Transformation team at Transform Learning.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-gray-50 text-gray-800 antialiased">{children}</body>
    </html>
  )
}
