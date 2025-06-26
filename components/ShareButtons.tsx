'use client'

import React, { useState } from 'react'
import {
  Share2,
  Copy,
  CheckCircle,
  Facebook,
  Twitter,
  Linkedin,
} from 'lucide-react'
import { generateShareableUrl, type CalculatorParams } from '@/lib/urlState'
import { useTranslations } from 'next-intl'

interface ShareButtonsProps {
  calculatorParams?: CalculatorParams
  url?: string
  title?: string
  description?: string
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  calculatorParams,
  url,
  title = 'Financial Growth Planner',
  description = 'Calculate the future value of your investments with compound interest',
}) => {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('share')

  // Generate clean URL without parameters
  const shareUrl = React.useMemo(() => {
    if (url) return url
    // Always use current page URL without query parameters
    return typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname
      : ''
  }, [url])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareOnTwitter = () => {
    const text = `${title} - ${description}`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/shareArticle/?url=${encodeURIComponent(
        shareUrl
      )}`,
      '_blank',
      'width=600,height=400'
    )
  }

  return (
    <div
      className="share-buttons bg-white p-6 rounded-lg border"
      data-testid="share-buttons"
    >
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Copy URL Button */}
        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600'
          }`}
          data-testid="copy-url-button"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              {t('copied')}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              {t('copyLink')}
            </>
          )}
        </button>

        {/* Social Share Buttons */}
        <button
          onClick={shareOnFacebook}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          data-testid="facebook-share-button"
        >
          <Facebook className="w-4 h-4" />
          {t('facebook')}
        </button>

        <button
          onClick={shareOnTwitter}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors duration-200"
          data-testid="twitter-share-button"
        >
          <Twitter className="w-4 h-4" />
          {t('twitter')}
        </button>

        <button
          onClick={shareOnLinkedIn}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors duration-200"
          data-testid="linkedin-share-button"
        >
          <Linkedin className="w-4 h-4" />
          {t('linkedin')}
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-3">{t('description')}</p>
    </div>
  )
}

export default ShareButtons
