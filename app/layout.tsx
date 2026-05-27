import { Inter, Playfair_Display, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { CartProvider } from '@/lib/cart-context'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'לחם של אמא',
  description: 'מאפיית בוטיק ביתית — חלות, עוגות וממתקים בהזמנה אישית',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="he"
      dir="rtl"
      suppressHydrationWarning
      className={cn('antialiased', fontMono.variable, playfair.variable, 'font-sans', inter.variable)}
    >
      <body>
        <ThemeProvider>
          <CartProvider>
            {children}
            <Toaster richColors position="top-center" />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
