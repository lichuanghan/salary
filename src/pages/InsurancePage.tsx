export function InsurancePage() {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="animate-scale">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          社保公积金
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          配置城市社保政策，计算五险一金
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>暂未配置社保公积金政策</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              请在系统设置中配置城市社保政策后使用此功能
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
