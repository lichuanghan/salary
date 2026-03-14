interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange
}: PaginationProps) {
  const pages: (number | string)[] = []
  const maxVisible = 5

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) pages.push(i)

    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border-light)', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
      <div className="flex items-center gap-3" style={{ minWidth: '140px' }}>
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          共 {totalItems} 条
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="input select"
            style={{ padding: '4px 8px', fontSize: '13px', height: '32px', whiteSpace: 'nowrap', width: '90px', minWidth: '90px', position: 'relative', zIndex: 100 }}
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
            <option value={100}>100 条/页</option>
          </select>
        )}
      </div>

      <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-sm btn-secondary"
          style={{ padding: '6px 10px', opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {pages.map((page, idx) => (
          typeof page === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(page)}
              className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', minWidth: '36px' }}
            >
              {page}
            </button>
          ) : (
            <span key={idx} style={{ padding: '0 4px', color: 'var(--color-text-muted)' }}>...</span>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-sm btn-secondary"
          style={{ padding: '6px 10px', opacity: currentPage === totalPages ? 0.5 : 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
