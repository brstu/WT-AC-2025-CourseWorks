import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'

import { LayoutModule } from './module/layout'

const roboto = Roboto({
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-roboto',
})

export const metadata: Metadata = {
    title: 'Zafich Idem',
    description: '',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`${roboto.variable} antialiased`}>
                <LayoutModule>{children}</LayoutModule>
            </body>
        </html>
    )
}
