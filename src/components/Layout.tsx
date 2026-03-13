import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen app-layout-wrapper" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* 顶部导航 */}
      <header
        className="sticky top-0 z-40 animate-scale"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border-light)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 8px 24px rgba(0, 0, 0, 0.04)',
          minHeight: '65px'
        }}
      >
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo 图标 */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent) 0%, #9a7209 100%)',
                  boxShadow: '0 2px 8px rgba(184, 134, 11, 0.4)'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  薪酬管理系统
                </h1>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  薪酬管理 · 考勤核算
                </p>
              </div>
            </div>

            {/* 右侧信息 */}
            <div className="flex items-center gap-4">
              <div
                className="px-4 py-2 rounded-lg"
                style={{ background: 'var(--color-bg-tertiary)' }}
              >
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="app-main" style={{ display: 'contents' }}>
        {children}
      </main>
    </div>
  )
}
