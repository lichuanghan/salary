export function TaxPage() {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="animate-scale">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          个税管理
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          配置个税专项扣除，计算个人所得税
        </p>
      </div>

      {/* 内容区域 */}
      <div className="animate-scale" style={{ animationDelay: '50ms' }}>
        <div className="card" style={{ padding: '48px' }}>
          <div className="empty-state">
            <div
              className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-light) 0%, #f5f0e0 100%)' }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>个税管理功能</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              配置个税专项扣除，计算个人所得税明细
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
