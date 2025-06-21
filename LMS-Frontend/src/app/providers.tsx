'use client'

import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { Provider } from 'react-redux'
import store from '@/lib/redux/store'//store the global state
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  const pathname = usePathname()
  return (
    <ClerkProvider>{/*Enables Clerk authentication*/}
      <Provider store={store}>{/*store global state*/}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Provider>
    </ClerkProvider>
  )
} 