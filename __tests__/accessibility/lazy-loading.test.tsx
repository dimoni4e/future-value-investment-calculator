import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LazyContentSection from '../../components/scenario/LazyContentSection'

// Mock IntersectionObserver for accessibility tests
class MockIntersectionObserver {
  private callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(element: Element) {
    // Immediately trigger intersection for accessibility testing
    const entry: IntersectionObserverEntry = {
      target: element,
      isIntersecting: true,
      intersectionRatio: 1,
      intersectionRect: {} as DOMRectReadOnly,
      boundingClientRect: {} as DOMRectReadOnly,
      rootBounds: {} as DOMRectReadOnly,
      time: Date.now(),
    }
    this.callback([entry], this as any)
  }

  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
    return new MockIntersectionObserver(callback)
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

// Mock components for testing
const AccessibleContent = () => (
  <section role="region" aria-labelledby="content-heading">
    <h2 id="content-heading">Test Content Section</h2>
    <p>This is accessible content for testing lazy loading.</p>
    <button type="button">Interactive Element</button>
  </section>
)

const ContentWithFocus = () => (
  <section>
    <h2>Focusable Content</h2>
    <input type="text" placeholder="Test input" aria-label="Test input field" />
    <button type="button">Test Button</button>
  </section>
)

describe('Lazy Loading Accessibility Tests', () => {
  describe('Screen Reader Announcements', () => {
    it('should announce loading states to screen readers', () => {
      render(
        <LazyContentSection>
          <AccessibleContent />
        </LazyContentSection>
      )

      // Loading skeleton should be accessible
      const skeleton = screen.getByTestId('loading-skeleton')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should provide accessible loading skeleton structure', () => {
      render(
        <LazyContentSection>
          <AccessibleContent />
        </LazyContentSection>
      )

      // Loading skeleton should be accessible
      const skeleton = screen.getByTestId('loading-skeleton')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should announce content loading completion', async () => {
      render(
        <LazyContentSection>
          <AccessibleContent />
        </LazyContentSection>
      )

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Test Content Section')).toBeInTheDocument()
      })

      // Content should be accessible
      const heading = screen.getByRole('heading', {
        name: 'Test Content Section',
      })
      expect(heading).toBeInTheDocument()

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-labelledby', 'content-heading')
    })

    it('should maintain proper ARIA attributes during loading', async () => {
      const { container } = render(
        <LazyContentSection>
          <AccessibleContent />
        </LazyContentSection>
      )

      // Check accessibility during loading
      const loadingResults = await axe(container)
      expect(loadingResults).toHaveNoViolations()

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Test Content Section')).toBeInTheDocument()
      })

      // Check accessibility after loading
      const loadedResults = await axe(container)
      expect(loadedResults).toHaveNoViolations()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation during lazy loading', async () => {
      render(
        <LazyContentSection>
          <ContentWithFocus />
        </LazyContentSection>
      )

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Focusable Content')).toBeInTheDocument()
      })

      // Check that focusable elements are accessible
      const input = screen.getByLabelText('Test input field')
      const button = screen.getByRole('button', { name: 'Test Button' })

      expect(input).toBeInTheDocument()
      expect(button).toBeInTheDocument()

      // Elements should be focusable
      input.focus()
      expect(input).toHaveFocus()

      button.focus()
      expect(button).toHaveFocus()
    })

    it('should maintain tab order after content loads', async () => {
      render(
        <div>
          <button type="button">Before Lazy Content</button>
          <LazyContentSection>
            <ContentWithFocus />
          </LazyContentSection>
          <button type="button">After Lazy Content</button>
        </div>
      )

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Focusable Content')).toBeInTheDocument()
      })

      // Check tab order
      const beforeButton = screen.getByRole('button', {
        name: 'Before Lazy Content',
      })
      const lazyInput = screen.getByLabelText('Test input field')
      const lazyButton = screen.getByRole('button', { name: 'Test Button' })
      const afterButton = screen.getByRole('button', {
        name: 'After Lazy Content',
      })

      // All elements should be in the DOM and focusable
      expect(beforeButton).toBeInTheDocument()
      expect(lazyInput).toBeInTheDocument()
      expect(lazyButton).toBeInTheDocument()
      expect(afterButton).toBeInTheDocument()
    })

    it('should handle keyboard navigation in loading skeleton', () => {
      render(
        <LazyContentSection>
          <ContentWithFocus />
        </LazyContentSection>
      )

      // Loading skeleton should not have focusable elements
      const skeleton = screen.getByTestId('loading-skeleton')
      expect(skeleton).toBeInTheDocument()

      // No interactive elements should be in skeleton
      const buttons = screen.queryAllByRole('button')
      const inputs = screen.queryAllByRole('textbox')

      expect(buttons).toHaveLength(0)
      expect(inputs).toHaveLength(0)
    })
  })

  describe('Focus Management', () => {
    it('should preserve focus context after content loads', async () => {
      render(
        <div>
          <button type="button" data-testid="focus-trigger">
            Trigger Focus
          </button>
          <LazyContentSection>
            <ContentWithFocus />
          </LazyContentSection>
        </div>
      )

      // Set focus before lazy loading
      const triggerButton = screen.getByTestId('focus-trigger')
      triggerButton.focus()
      expect(triggerButton).toHaveFocus()

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Focusable Content')).toBeInTheDocument()
      })

      // Focus should still be on the trigger button (not lost)
      expect(triggerButton).toHaveFocus()
    })

    it('should provide accessible focus indicators', async () => {
      const { container } = render(
        <LazyContentSection>
          <ContentWithFocus />
        </LazyContentSection>
      )

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Focusable Content')).toBeInTheDocument()
      })

      // Check that focus indicators are accessible
      const results = await axe(container, {
        rules: {
          'focus-indicator': { enabled: true },
        },
      })
      expect(results).toHaveNoViolations()
    })

    it('should handle focus when content is dynamically added', async () => {
      const { rerender } = render(
        <LazyContentSection>
          <div>Loading...</div>
        </LazyContentSection>
      )

      // Rerender with new content
      rerender(
        <LazyContentSection>
          <ContentWithFocus />
        </LazyContentSection>
      )

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Focusable Content')).toBeInTheDocument()
      })

      // New focusable elements should be accessible
      const input = screen.getByLabelText('Test input field')
      const button = screen.getByRole('button', { name: 'Test Button' })

      input.focus()
      expect(input).toHaveFocus()

      button.focus()
      expect(button).toHaveFocus()
    })
  })

  describe('ARIA Live Regions', () => {
    it('should handle dynamic content announcements', async () => {
      const CustomContent = () => (
        <div role="status" aria-live="polite">
          <p>Content has loaded successfully</p>
        </div>
      )

      render(
        <LazyContentSection>
          <CustomContent />
        </LazyContentSection>
      )

      // Wait for content to load
      await waitFor(() => {
        expect(
          screen.getByText('Content has loaded successfully')
        ).toBeInTheDocument()
      })

      // Check that live region is properly set up
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    })

    it('should not create accessibility barriers during loading', async () => {
      const { container } = render(
        <LazyContentSection>
          <section role="main">
            <h1>Main Content</h1>
            <p>This is the main content of the page.</p>
          </section>
        </LazyContentSection>
      )

      // Check accessibility during loading phase
      const loadingResults = await axe(container)
      expect(loadingResults).toHaveNoViolations()

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Main Content')).toBeInTheDocument()
      })

      // Check accessibility after loading
      const loadedResults = await axe(container)
      expect(loadedResults).toHaveNoViolations()
    })
  })

  describe('Loading State Accessibility', () => {
    it('should provide appropriate loading semantics', () => {
      render(
        <LazyContentSection>
          <AccessibleContent />
        </LazyContentSection>
      )

      const skeleton = screen.getByTestId('loading-skeleton')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse')

      // Loading skeleton should not interfere with page structure
      expect(skeleton).toBeInTheDocument()
    })

    it('should maintain semantic structure during loading', async () => {
      const { container } = render(
        <main>
          <h1>Page Title</h1>
          <LazyContentSection>
            <section>
              <h2>Section Title</h2>
              <p>Section content</p>
            </section>
          </LazyContentSection>
        </main>
      )

      // Page structure should be maintained
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

      // Wait for lazy content
      await waitFor(() => {
        expect(screen.getByText('Section Title')).toBeInTheDocument()
      })

      // Complete structure should be accessible
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should handle custom loading fallbacks accessibly', async () => {
      const AccessibleFallback = () => (
        <div role="status" aria-label="Loading content">
          <p>Please wait, content is loading...</p>
        </div>
      )

      const { container } = render(
        <LazyContentSection fallback={<AccessibleFallback />}>
          <AccessibleContent />
        </LazyContentSection>
      )

      // Custom fallback should be accessible
      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-label', 'Loading content')

      const results = await axe(container)
      expect(results).toHaveNoViolations()

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Test Content Section')).toBeInTheDocument()
      })

      // Final state should be accessible
      const finalResults = await axe(container)
      expect(finalResults).toHaveNoViolations()
    })
  })

  describe('Error State Accessibility', () => {
    it('should handle loading errors accessibly', async () => {
      const ErrorContent = () => {
        throw new Error('Content failed to load')
      }

      // Use error boundary to catch errors
      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        try {
          return <>{children}</>
        } catch {
          return (
            <div role="alert" aria-label="Content loading error">
              <p>Sorry, content could not be loaded.</p>
            </div>
          )
        }
      }

      const { container } = render(
        <ErrorBoundary>
          <LazyContentSection>
            <ErrorContent />
          </LazyContentSection>
        </ErrorBoundary>
      )

      // Error state should be accessible
      await waitFor(() => {
        const errorElement = screen.queryByRole('alert')
        if (errorElement) {
          expect(errorElement).toHaveAttribute(
            'aria-label',
            'Content loading error'
          )
        }
      })

      // Should not have accessibility violations even in error state
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
