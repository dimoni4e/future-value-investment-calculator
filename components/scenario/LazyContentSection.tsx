'use client'

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'

interface LazyContentSectionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}

// Loading skeleton component
const LoadingSkeleton = () => (
  <div
    data-testid="loading-skeleton"
    className="py-16 bg-white/50 backdrop-blur-sm animate-pulse"
  >
    <div className="container mx-auto px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 h-8 w-48 bg-slate-200 rounded-full"></div>
          <div className="mx-auto mb-4 h-10 w-96 bg-slate-200 rounded"></div>
          <div className="mx-auto h-6 w-80 bg-slate-200 rounded"></div>
        </div>

        {/* Content skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200/50"
            >
              <div className="mb-4 h-6 w-32 bg-slate-200 rounded"></div>
              <div className="mb-2 h-8 w-24 bg-slate-200 rounded"></div>
              <div className="h-4 w-full bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Additional content skeleton */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8">
          <div className="mx-auto mb-6 h-8 w-64 bg-slate-200 rounded"></div>
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i}>
                <div className="mb-2 h-6 w-40 bg-slate-200 rounded"></div>
                <div className="mb-2 h-4 w-full bg-slate-200 rounded"></div>
                <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Hook for intersection observer
const useIntersectionObserver = (
  threshold: number = 0.1,
  rootMargin: string = '100px'
) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyVisible = entry.isIntersecting
        setIsVisible(isCurrentlyVisible)

        // Once visible, keep it loaded (don't unload)
        if (isCurrentlyVisible && !hasBeenVisible) {
          setHasBeenVisible(true)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, hasBeenVisible])

  return { ref, isVisible, hasBeenVisible }
}

export default function LazyContentSection({
  children,
  fallback = <LoadingSkeleton />,
  threshold = 0.1,
  rootMargin = '100px',
  className = '',
}: LazyContentSectionProps) {
  const { ref, isVisible, hasBeenVisible } = useIntersectionObserver(
    threshold,
    rootMargin
  )

  // Avoid hydration mismatch: render full content until the client hydrates,
  // then apply lazy-loading behavior.
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])

  return (
    <div ref={ref} className={className}>
      {!hydrated || hasBeenVisible || isVisible ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      )}
    </div>
  )
}

// Export a wrapper component for lazy loading with React.lazy()
export const createLazyComponent = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
) => {
  return lazy(importFn)
}

// Higher-order component for wrapping components with lazy loading
export const withLazyLoading = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  options?: {
    threshold?: number
    rootMargin?: string
    fallback?: React.ReactNode
  }
) => {
  const LazyWrapper = (props: T) => (
    <LazyContentSection
      threshold={options?.threshold}
      rootMargin={options?.rootMargin}
      fallback={options?.fallback}
    >
      <Component {...props} />
    </LazyContentSection>
  )

  LazyWrapper.displayName = `withLazyLoading(${Component.displayName || Component.name || 'Component'})`

  return LazyWrapper
}
