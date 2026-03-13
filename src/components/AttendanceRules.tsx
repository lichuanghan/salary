import { useState, useEffect } from 'react'
import type { DeductionRule } from '../types'

interface AttendanceRulesProps {
  onClose: () => void
}

const DEFAULT_RULES: DeductionRule = {
  late_deduction_per_time: 50,
  late_threshold: 0,
  early_leave_deduction_per_time: 30,
  overtime_rate: 30
}

export function AttendanceRules({ onClose }: AttendanceRulesProps) {
  const [rules, setRules] = useState<DeductionRule>(DEFAULT_RULES)

  useEffect(() => {
    const saved = localStorage.getItem('attendance_rules')
    if (saved) {
      try {
        setRules(JSON.parse(saved))
      } catch {
        setRules(DEFAULT_RULES)
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('attendance_rules', JSON.stringify(rules))
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-scale" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent) 0%, #9a7209 100%)',
                boxShadow: '0 2px 8px rgba(184, 134, 11, 0.3)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3>考勤扣款规则配置</h3>
          </div>
        </div>
        <div className="modal-body">
          <div className="space-y-5">
            {/* 迟到扣款 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                每次迟到扣款 (元)
              </label>
              <input
                type="number"
                value={rules.late_deduction_per_time}
                onChange={(e) => setRules({ ...rules, late_deduction_per_time: Number(e.target.value) })}
                className="input"
                min={0}
              />
            </div>

            {/* 早退扣款 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                每次早退扣款 (元)
              </label>
              <input
                type="number"
                value={rules.early_leave_deduction_per_time}
                onChange={(e) => setRules({ ...rules, early_leave_deduction_per_time: Number(e.target.value) })}
                className="input"
                min={0}
              />
            </div>

            {/* 加班费 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                加班费每小时 (元)
              </label>
              <input
                type="number"
                value={rules.overtime_rate}
                onChange={(e) => setRules({ ...rules, overtime_rate: Number(e.target.value) })}
                className="input"
                min={0}
              />
            </div>

            {/* 提示 */}
            <div
              className="p-4 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%)',
                border: '1px solid rgba(217, 119, 6, 0.2)'
              }}
            >
              <div className="flex gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <p className="font-medium mb-1" style={{ color: 'var(--color-warning)' }}>计算说明</p>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    考勤扣款 = 迟到次数 × 每次扣款 + 早退次数 × 每次扣款<br />
                    加班费 = 加班小时数 × 每小时费率
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            取消
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export function getDeductionRules(): DeductionRule {
  const saved = localStorage.getItem('attendance_rules')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return DEFAULT_RULES
    }
  }
  return DEFAULT_RULES
}
