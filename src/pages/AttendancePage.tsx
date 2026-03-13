export function AttendancePage() {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="animate-scale">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          考勤管理
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          管理员工考勤记录
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>考勤管理功能</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              支持迟到、早退、请假、加班等考勤记录
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
