'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = () => {


  return (
    <header className="w-full bg-white py-8 flex justify-center items-center border-b border-gray-200">
      <h1 className="text-3xl font-bold text-black">MREA</h1>
    </header>
  )
}
