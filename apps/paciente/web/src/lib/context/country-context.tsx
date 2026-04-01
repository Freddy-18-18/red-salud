'use client'

import { createContext, useContext } from 'react'

export interface CountryConfig {
  code: string
  name: string
  currency: string
  locale: string
  timezone: string
  phonePrefix: string
  flag: string
}

const COUNTRIES: Record<string, CountryConfig> = {
  VE: {
    code: 'VE',
    name: 'Venezuela',
    currency: 'VES',
    locale: 'es-VE',
    timezone: 'America/Caracas',
    phonePrefix: '+58',
    flag: '\u{1F1FB}\u{1F1EA}',
  },
}

const CountryContext = createContext<CountryConfig>(COUNTRIES.VE)

export function CountryProvider({
  countryCode = 'VE',
  children,
}: {
  countryCode?: string
  children: React.ReactNode
}) {
  const config = COUNTRIES[countryCode] ?? COUNTRIES.VE
  return (
    <CountryContext.Provider value={config}>
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry() {
  return useContext(CountryContext)
}
