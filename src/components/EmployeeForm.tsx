import { useState } from 'react'
import type { Employee } from '../types'

interface EmployeeFormProps {
  initialData?: Employee
  onSubmit: (data: Employee) => void
  onCancel: () => void
}

export function EmployeeForm({ initialData, onSubmit, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState<Employee>(
    initialData || {
      name: '',
      fixed_salary: 0,
      performance_salary: 0,
      status: 'active'
    }
  )

  const handleSubmit = () => {
    if (!formData.name) return
    onSubmit(formData)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content animate-scale" onClick={(e) => e.stopPropagation()}>
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
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </div>
            <h3>{initialData ? '编辑员工' : '添加新员工'}</h3>
          </div>
        </div>
        <div className="modal-body">
          <div className="space-y-5">
            {/* 姓名 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                姓名 <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="请输入员工姓名"
                autoFocus
              />
            </div>

            {/* 固定薪酬 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                固定薪酬 <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}
                >
                  ¥
                </span>
                <input
                  type="number"
                  value={formData.fixed_salary || ''}
                  onChange={(e) => setFormData({ ...formData, fixed_salary: Number(e.target.value) || 0 })}
                  className="input"
                  placeholder="0.00"
                  style={{ paddingLeft: '32px', fontWeight: 500 }}
                />
              </div>
            </div>

            {/* 绩效薪酬 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                绩效薪酬 <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}
                >
                  ¥
                </span>
                <input
                  type="number"
                  value={formData.performance_salary || ''}
                  onChange={(e) => setFormData({ ...formData, performance_salary: Number(e.target.value) || 0 })}
                  className="input"
                  placeholder="0.00"
                  style={{ paddingLeft: '32px', fontWeight: 500 }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} className="btn btn-secondary">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name}
            className="btn btn-primary"
          >
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
