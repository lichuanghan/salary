export function ReportPage() {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="animate-scale">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          报表统计
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          部门成本分析、月度工资汇总
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
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>报表统计功能</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              部门成本分析、月度工资汇总、数据导出
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
