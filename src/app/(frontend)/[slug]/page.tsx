import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import Image from 'next/image'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

function MreaHomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold mb-8 text-black">MREA</h1>
      <form className="flex flex-col items-center w-full max-w-xs">
        <input
          type="password"
          placeholder="Password"
          className="mb-4 px-4 py-2 border border-gray-300 rounded w-full focus:outline-none"
        />
        <label className="flex items-center mb-6">
          <input type="checkbox" className="mr-2" />
          <span className="text-gray-700">Remember Me</span>
        </label>
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition"
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const url = '/' + slug

  // If this is the homepage, render the minimal MREA homepage
  if (slug === 'home') {
    return <MreaHomePage />
  }

  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const page = await queryPageBySlug({
    slug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

export const HeaderClient: React.FC = () => {
  return (
    <header className="w-full bg-white py-4 px-8 flex items-center justify-between shadow">
      {/* Logo */}
      <div className="flex items-center">
        <Image src="/logo.png" alt="MRR Engineering" width={60} height={40} />
        <span className="ml-2 text-xl font-semibold text-gray-800">Engineering</span>
      </div>
      {/* Navigation */}
      <nav className="flex items-center space-x-8">
        <a href="/" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Home</a>
        <a href="/about" className="text-gray-700 hover:text-blue-600">About Us</a>
        <div className="relative group">
          <a href="/products" className="text-gray-700 hover:text-blue-600">Products</a>
          {/* Dropdown can be added here if needed */}
        </div>
        <a href="/contact" className="text-gray-700 hover:text-blue-600">Contact Us</a>
      </nav>
      {/* CTA Button */}
      <a
        href="/consultation"
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded transition"
      >
        Request a Consultation
      </a>
    </header>
  )
}
