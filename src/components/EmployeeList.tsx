import type { Employee } from '../types'

interface EmployeeListProps {
  employees: Employee[]
  selectedId?: number
  onSelect: (employee: Employee) => void
  onEdit: (employee: Employee) => void
  onDelete: (id: number) => void
  onAdd: () => void
  onImport?: () => void
  searchKeyword?: string
  onSearch?: (keyword: string) => void
}

export function EmployeeList({ employees, selectedId, onSelect, onEdit, onDelete, onAdd, onImport, searchKeyword, onSearch }: EmployeeListProps) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-light) 0%, #f5f0e0 100%)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              员工列表
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
              共 {employees.length} 名员工
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          {onSearch && (
            <div className="relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchKeyword || ''}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="搜索员工..."
                className="input"
                style={{ paddingLeft: '36px', width: '200px', height: '38px' }}
              />
            </div>
          )}
          {onImport && (
            <button onClick={onImport} className="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              批量导入
            </button>
          )}
          <button onClick={onAdd} className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            添加员工
          </button>
        </div>
      </div>

      {/* 表格 */}
      {employees.length > 0 ? (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="table">
            <thead>
              <tr>
                <th>姓名</th>
                <th style={{ textAlign: 'right' }}>固定薪酬</th>
                <th style={{ textAlign: 'right' }}>绩效薪酬</th>
                <th style={{ textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className={selectedId === emp.id ? 'selected' : ''}
                  onClick={() => onSelect(emp)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      {/* 头像 */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm"
                        style={{
                          background: 'linear-gradient(135deg, var(--color-accent) 0%, #9a7209 100%)',
                          boxShadow: '0 2px 6px rgba(184, 134, 11, 0.3)'
                        }}
                      >
                        {emp.name.charAt(0)}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{emp.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount font-medium">¥{emp.fixed_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount font-medium">¥{emp.performance_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(emp)
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: '8px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        编辑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(emp.id!)
                        }}
                        className="btn btn-danger btn-sm"
                        style={{ borderRadius: '8px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div
            className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-light) 0%, #f5f0e0 100%)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" width="36" height="36">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>暂无员工</p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>点击上方"添加员工"按钮创建新员工</p>
        </div>
      )}
    </div>
  )
}
