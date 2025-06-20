'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Search, Check, Loader2 } from 'lucide-react'
import { Currency, SUPPORTED_CURRENCIES } from '@/lib/currency'
import { useTranslations } from 'next-intl'

interface CurrencySelectorProps {
  selectedCurrency: Currency
  onCurrencyChange: (currency: Currency) => void
  disabled?: boolean
  loading?: boolean
  error?: string | null
}

function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  disabled = false,
  loading = false,
  error = null,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('calculator')

  // Filter currencies based on search term
  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle currency selection
  const handleCurrencySelect = (currency: Currency) => {
    onCurrencyChange(currency)
    setIsOpen(false)
    setSearchTerm('')
    setFocusedIndex(-1)
    buttonRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
        setFocusedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
        buttonRef.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => (prev + 1) % filteredCurrencies.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) =>
          prev <= 0 ? filteredCurrencies.length - 1 : prev - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && filteredCurrencies[focusedIndex]) {
          handleCurrencySelect(filteredCurrencies[focusedIndex])
        }
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(filteredCurrencies.length - 1)
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 0)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      setFocusedIndex(-1)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Trigger Button */}
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${t('selectedCurrency')}: ${selectedCurrency.name}`}
        className={`
          group relative w-full justify-between h-12 px-4 
          border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
          bg-white hover:bg-slate-50 focus:bg-white
          transition-all duration-200 ease-in-out
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' : 'shadow-sm'}
        `}
      >
        <div className="flex items-center space-x-3">
          <span
            className="text-xl"
            role="img"
            aria-label={selectedCurrency.name}
          >
            {selectedCurrency.flag}
          </span>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-slate-900 text-sm">
              {selectedCurrency.code}
            </span>
            <span className="text-xs text-slate-500 hidden sm:block">
              {selectedCurrency.name}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </Button>

      {/* Error State */}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute top-full left-0 right-0 mt-2 
            bg-white border border-slate-200 rounded-xl shadow-lg 
            z-50 overflow-hidden
            animate-in slide-in-from-top-2 duration-200
          `}
          role="listbox"
          aria-label={t('currency')}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('searchCurrencies')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setFocusedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Currency List */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredCurrencies.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                {t('noCurrenciesFound')}
              </div>
            ) : (
              filteredCurrencies.map((currency, index) => {
                const isSelected = currency.code === selectedCurrency.code
                const isFocused = index === focusedIndex

                return (
                  <button
                    key={currency.code}
                    onClick={() => handleCurrencySelect(currency)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                    className={`
                      w-full px-4 py-3 text-left flex items-center space-x-3 
                      transition-colors duration-150 ease-in-out
                      ${isFocused ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50'}
                      ${isSelected ? 'bg-blue-100 text-blue-900' : 'text-slate-700'}
                      focus:outline-none focus:bg-blue-50
                    `}
                  >
                    <span
                      className="text-xl flex-shrink-0"
                      role="img"
                      aria-label={currency.name}
                    >
                      {currency.flag}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{currency.code}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {currency.name}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-slate-400">
                        {currency.symbol}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CurrencySelector
