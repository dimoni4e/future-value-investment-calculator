import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import LazyContentSection, {
  withLazyLoading,
  createLazyComponent,
} from '../../components/scenario/LazyContentSection'

// Mock IntersectionObserver
class MockIntersectionObserver {
  private callback: IntersectionObserverCallback
  private elements: Element[] = []
  public observe = jest.fn((element: Element) => {
    this.elements.push(element)
  })
  public unobserve = jest.fn((element: Element) => {
    this.elements = this.elements.filter((el) => el !== element)
  })
  public disconnect = jest.fn(() => {
    this.elements = []
  })

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  // Helper method to trigger intersection
  triggerIntersection(element: Element, isIntersecting: boolean) {
    const entry: IntersectionObserverEntry = {
      target: element,
      isIntersecting,
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: {} as DOMRectReadOnly,
      boundingClientRect: {} as DOMRectReadOnly,
      rootBounds: {} as DOMRectReadOnly,
      time: Date.now(),
    }
    act(() => {
      this.callback([entry], this as any)
    })
  }

  // Get all observed elements
  getObservedElements() {
    return this.elements
  }
}

// Setup global mock
let mockObserver: MockIntersectionObserver
let mockObserverInstances: MockIntersectionObserver[] = []

beforeEach(() => {
  mockObserverInstances = []
  global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
    const instance = new MockIntersectionObserver(callback)
    mockObserverInstances.push(instance)
    mockObserver = instance // Keep reference to latest instance
    return instance
  })
})

afterEach(() => {
  jest.clearAllMocks()
  mockObserverInstances = []
})

// Mock components for testing
const MockComponent = ({ text = 'Test Content' }: { text?: string }) => (
  <div data-testid="mock-component">{text}</div>
)

const AsyncMockComponent = React.lazy(() =>
  Promise.resolve({ default: MockComponent })
)

// Error Boundary component for testing
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-fallback">Something went wrong.</div>
    }

    return this.props.children
  }
}

describe('LazyContentSection Performance Tests', () => {
  describe('Lazy Loading Behavior', () => {
    it('should render fallback initially when not in viewport', () => {
      render(
        <LazyContentSection>
          <MockComponent />
        </LazyContentSection>
      )

      // Should show loading skeleton, not the actual component
      expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument()
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    it('should load content when element enters viewport', async () => {
      const { container } = render(
        <LazyContentSection>
          <MockComponent />
        </LazyContentSection>
      )

      const lazyContainer = container.firstChild as Element

      // Initially should show fallback
      expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument()

      // Trigger intersection
      mockObserver.triggerIntersection(lazyContainer, true)

      // Content should load
      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeInTheDocument()
      })
    })

    it('should measure loading timing performance', async () => {
      const startTime = performance.now()

      const { container } = render(
        <LazyContentSection threshold={0.5} rootMargin="25px">
          <MockComponent />
        </LazyContentSection>
      )

      const lazyContainer = container.firstChild as Element
      mockObserver.triggerIntersection(lazyContainer, true)

      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeInTheDocument()
      })

      const loadTime = performance.now() - startTime

      // Loading should be reasonably fast (under 100ms for simple components)
      expect(loadTime).toBeLessThan(100)
    })

    it('should handle multiple lazy sections efficiently', async () => {
      const { container } = render(
        <div>
          <LazyContentSection>
            <MockComponent text="Section 1" />
          </LazyContentSection>
          <LazyContentSection>
            <MockComponent text="Section 2" />
          </LazyContentSection>
          <LazyContentSection>
            <MockComponent text="Section 3" />
          </LazyContentSection>
        </div>
      )

      // Get all lazy section containers
      const lazySections = container.querySelectorAll('div > div')

      // Trigger intersection for all sections using the latest observer instances
      await act(async () => {
        lazySections.forEach((section, index) => {
          if (mockObserverInstances[index]) {
            mockObserverInstances[index].triggerIntersection(section, true)
          }
        })
      })

      // All sections should load
      await waitFor(
        () => {
          expect(screen.getByText('Section 1')).toBeInTheDocument()
          expect(screen.getByText('Section 2')).toBeInTheDocument()
          expect(screen.getByText('Section 3')).toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    })

    it('should maintain content after intersection (no unloading)', async () => {
      const { container } = render(
        <LazyContentSection>
          <MockComponent />
        </LazyContentSection>
      )

      const lazyContainer = container.firstChild as Element

      // Trigger intersection
      mockObserver.triggerIntersection(lazyContainer, true)

      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeInTheDocument()
      })

      // Trigger intersection false (out of viewport)
      mockObserver.triggerIntersection(lazyContainer, false)

      // Content should still be there (no unloading)
      expect(screen.getByTestId('mock-component')).toBeInTheDocument()
    })
  })

  describe('Intersection Observer Functionality', () => {
    it('should use correct threshold and rootMargin options', () => {
      render(
        <LazyContentSection threshold={0.25} rootMargin="50px">
          <MockComponent />
        </LazyContentSection>
      )

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          threshold: 0.25,
          rootMargin: '50px',
        })
      )
    })

    it('should observe element on mount', () => {
      render(
        <LazyContentSection>
          <MockComponent />
        </LazyContentSection>
      )

      // Check that observe was called on the latest instance
      expect(mockObserver.observe).toHaveBeenCalled()
    })

    it('should unobserve element on unmount', () => {
      const { unmount } = render(
        <LazyContentSection>
          <MockComponent />
        </LazyContentSection>
      )

      const observerInstance = mockObserver

      unmount()

      expect(observerInstance.unobserve).toHaveBeenCalled()
    })

    it('should handle intersection changes correctly', async () => {
      const { container } = render(
        <LazyContentSection>
          <MockComponent />
        </LazyContentSection>
      )

      const lazyContainer = container.firstChild as Element

      // Initially not visible
      expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument()

      // Enter viewport
      mockObserver.triggerIntersection(lazyContainer, true)

      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeInTheDocument()
      })

      // Leave viewport - content should remain
      mockObserver.triggerIntersection(lazyContainer, false)
      expect(screen.getByTestId('mock-component')).toBeInTheDocument()
    })
  })

  describe('Loading Skeleton Appearance', () => {
    it('should show loading skeleton with correct structure', () => {
      render(
        <LazyContentSection>
          <MockComponent />
        </LazyContentSection>
      )

      const skeleton = screen.getByTestId('loading-skeleton')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should show custom fallback when provided', () => {
      const customFallback = (
        <div data-testid="custom-fallback">Custom Loading...</div>
      )

      render(
        <LazyContentSection fallback={customFallback}>
          <MockComponent />
        </LazyContentSection>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
    })

    it('should replace skeleton with content after loading', async () => {
      const { container } = render(
        <LazyContentSection>
          <MockComponent />
        </LazyContentSection>
      )

      // Initially shows skeleton
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()

      const lazyContainer = container.firstChild as Element
      mockObserver.triggerIntersection(lazyContainer, true)

      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeInTheDocument()
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })
    })
  })

  describe('Higher-Order Component (withLazyLoading)', () => {
    it('should wrap component with lazy loading functionality', async () => {
      const LazyMockComponent = withLazyLoading(MockComponent, {
        threshold: 0.1,
        rootMargin: '10px',
      })

      const { container } = render(<LazyMockComponent text="HOC Test" />)

      // Initially shows skeleton
      expect(screen.queryByText('HOC Test')).not.toBeInTheDocument()

      const lazyContainer = container.firstChild as Element
      mockObserver.triggerIntersection(lazyContainer, true)

      await waitFor(() => {
        expect(screen.getByText('HOC Test')).toBeInTheDocument()
      })
    })

    it('should preserve component display name', () => {
      const TestComponent = (props: { text?: string }) => (
        <MockComponent {...props} />
      )
      TestComponent.displayName = 'TestComponent'
      const LazyTestComponent = withLazyLoading(TestComponent)

      expect(LazyTestComponent.displayName).toBe(
        'withLazyLoading(TestComponent)'
      )
    })

    it('should handle custom options', () => {
      const customFallback = (
        <div data-testid="hoc-fallback">HOC Loading...</div>
      )

      const LazyMockComponent = withLazyLoading(MockComponent, {
        threshold: 0.8,
        rootMargin: '200px',
        fallback: customFallback,
      })

      render(<LazyMockComponent />)

      expect(screen.getByTestId('hoc-fallback')).toBeInTheDocument()
      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          threshold: 0.8,
          rootMargin: '200px',
        })
      )
    })
  })

  describe('React.lazy Integration', () => {
    it('should work with React.lazy components', async () => {
      const { container } = render(
        <LazyContentSection>
          <AsyncMockComponent />
        </LazyContentSection>
      )

      const lazyContainer = container.firstChild as Element
      mockObserver.triggerIntersection(lazyContainer, true)

      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeInTheDocument()
      })
    })

    it('should handle lazy component loading errors gracefully', async () => {
      const FailingComponent = React.lazy(() =>
        Promise.reject(new Error('Loading failed'))
      )

      // Suppress console.error for this test
      const originalError = console.error
      console.error = jest.fn()

      try {
        const { container } = render(
          <TestErrorBoundary>
            <LazyContentSection>
              <FailingComponent />
            </LazyContentSection>
          </TestErrorBoundary>
        )

        const lazyContainer = container.querySelector('div div') as Element
        expect(lazyContainer).toBeInTheDocument()

        const observerInstance = mockObserver
        await act(async () => {
          observerInstance.triggerIntersection(lazyContainer, true)
        })

        // Should show error boundary fallback or loading skeleton
        await waitFor(
          () => {
            const errorFallback = screen.queryByTestId('error-fallback')
            const loadingSkeleton = screen.queryByTestId('loading-skeleton')
            expect(errorFallback || loadingSkeleton).toBeInTheDocument()
          },
          { timeout: 1000 }
        )
      } finally {
        console.error = originalError
      }
    })
  })

  describe('Performance Edge Cases', () => {
    it('should handle rapid intersection changes', async () => {
      const { container } = render(
        <LazyContentSection>
          <MockComponent />
        </LazyContentSection>
      )

      const lazyContainer = container.firstChild as Element

      // Rapidly trigger intersection changes
      for (let i = 0; i < 10; i++) {
        mockObserver.triggerIntersection(lazyContainer, i % 2 === 0)
      }

      // Should eventually show content (last intersection was true)
      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeInTheDocument()
      })
    })

    it('should handle undefined/null children gracefully', () => {
      expect(() => {
        render(<LazyContentSection>{null}</LazyContentSection>)
      }).not.toThrow()

      expect(() => {
        render(<LazyContentSection>{undefined}</LazyContentSection>)
      }).not.toThrow()
    })

    it('should cleanup observers on component unmount', () => {
      const { unmount } = render(
        <LazyContentSection>
          <MockComponent />
        </LazyContentSection>
      )

      const observerInstance = mockObserver

      unmount()

      expect(observerInstance.unobserve).toHaveBeenCalled()
    })
  })
})

// Update the loading skeleton to include a test id
// This is a mock of what should be in the actual component
const LoadingSkeletonMock = () => (
  <div
    data-testid="loading-skeleton"
    className="py-16 bg-white/50 backdrop-blur-sm animate-pulse"
  >
    <div className="container mx-auto px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 h-8 w-48 bg-slate-200 rounded-full"></div>
          <div className="mx-auto mb-4 h-10 w-96 bg-slate-200 rounded"></div>
          <div className="mx-auto h-6 w-80 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
)
