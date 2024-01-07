import '../styles/globals.css'
import {Inter} from 'next/font/google'
import {ReduxProvider} from "@/store/provider";
import {ReactNode} from "react";
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import de from "@/constants/de.json";
import icon from "./favicon.ico"
config.autoAddCss = false

const inter = Inter({subsets: ['latin']})

export const metadata = {
  title: de.head.title,
  description: de.head.description,
}

export default function RootLayout({children}: { children: ReactNode }) {
  return (
      <html lang="en">
      <head>
          <title>{de.head.title}</title>
          <link rel={'icon'} href={icon.src}/>
      </head>
      <body className={inter.className}>
      <ReduxProvider>{children}</ReduxProvider>
      </body>
      </html>
  )
}
