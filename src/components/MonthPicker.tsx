import { useState, useRef, useEffect } from 'react'

interface MonthPickerProps {
  value: string
  onChange: (value: string) => void
  style?: React.CSSProperties
}

export function MonthPicker({ value, onChange, style }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewYear, setViewYear] = useState(() => value ? parseInt(value.split('-')[0]) : new Date().getFullYear())
  const containerRef = useRef<HTMLDivElement>(null)

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (month: number) => {
    const newValue = `${viewYear}-${String(month).padStart(2, '0')}`
    onChange(newValue)
    setIsOpen(false)
  }

  const handlePrevYear = () => setViewYear(y => y - 1)
  const handleNextYear = () => setViewYear(y => y + 1)

  const displayValue = value
    ? `${value.split('-')[0]}年${parseInt(value.split('-')[1])}月`
    : '请选择月份'

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input select"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          width: '160px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          ...style
        }}
      >
        <span>{displayValue}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '12px',
            zIndex: 1000,
            minWidth: '200px'
          }}
        >
          {/* 年份选择 */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevYear}
              className="btn btn-sm btn-secondary"
              style={{ padding: '4px 8px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{viewYear}年</span>
            <button
              type="button"
              onClick={handleNextYear}
              className="btn btn-sm btn-secondary"
              style={{ padding: '4px 8px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* 月份网格 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            {months.map((month, index) => {
              const monthNum = index + 1
              const isSelected = value === `${viewYear}-${String(monthNum).padStart(2, '0')}`
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleSelect(monthNum)}
                  style={{
                    padding: '8px 4px',
                    border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border-light)',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'var(--color-accent-light)' : 'transparent',
                    color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  {month}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
