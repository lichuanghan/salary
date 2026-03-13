import { useState, useRef } from 'react'
import { batchImportEmployees, type EmployeeImport, type BatchImportResult } from '../hooks/api'
import { parseExcelFile, generateTemplate, type ParsedEmployee } from '../hooks/useExcel'

interface EmployeeImportModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function EmployeeImportModal({ onClose, onSuccess }: EmployeeImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BatchImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      alert('请选择 Excel 文件 (.xlsx 或 .xls)')
      return
    }
    setFile(selectedFile)
    setResult(null)
    try {
      const data = await parseExcelFile(selectedFile)
      // 限制最多500条
      if (data.length > 500) {
        alert('单次导入最多支持500条记录')
        return
      }
      setParsedData(data)
    } catch (error) {
      console.error('解析Excel失败:', error)
      alert('解析Excel文件失败，请检查文件格式')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return

    setLoading(true)
    try {
      // 过滤有效数据（无错误）
      const validData: EmployeeImport[] = parsedData
        .filter(p => !p.error)
        .map(p => p.data)

      if (validData.length === 0) {
        alert('没有有效数据可导入')
        return
      }

      const importResult = await batchImportEmployees(validData)
      setResult(importResult)
      if (importResult.success > 0) {
        onSuccess()
      }
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const validCount = parsedData.filter(p => !p.error).length
  const errorCount = parsedData.filter(p => p.error).length

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3>批量导入员工</h3>
          </div>
        </div>

        <div className="modal-body">
          {!result ? (
            <>
              {/* 文件上传区域 */}
              {!parsedData.length && (
                <div
                  className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: dragOver ? 'var(--color-bg-secondary)' : 'transparent'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    点击或拖拽上传 Excel 文件
                  </p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                    支持 .xlsx 和 .xls 格式
                  </p>
                </div>
              )}

              {/* 预览表格 */}
              {parsedData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        已选择: <strong>{file?.name}</strong>
                      </span>
                      <span style={{ color: 'var(--color-success)' }}>有效: {validCount} 条</span>
                      {errorCount > 0 && (
                        <span style={{ color: 'var(--color-danger)' }}>无效: {errorCount} 条</span>
                      )}
                    </div>
                    <button
                      onClick={() => { setFile(null); setParsedData([]) }}
                      className="btn btn-secondary btn-sm"
                    >
                      重新选择
                    </button>
                  </div>

                  <div className="overflow-x-auto" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>序号</th>
                          <th>员工编号</th>
                          <th>姓名</th>
                          <th>固定工资</th>
                          <th>绩效工资</th>
                          <th>入职时间</th>
                          <th>状态</th>
                          <th>错误信息</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 10).map((item) => (
                          <tr key={item.row} style={{ color: item.error ? 'var(--color-danger)' : 'inherit' }}>
                            <td>{item.row}</td>
                            <td>{item.data.employee_no}</td>
                            <td>{item.data.name}</td>
                            <td>{item.data.fixed_salary}</td>
                            <td>{item.data.performance_salary}</td>
                            <td>{item.data.entry_date}</td>
                            <td>{item.data.status === 'active' ? '在职' : '离职'}</td>
                            <td>{item.error || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedData.length > 10 && (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      ... 共 {parsedData.length} 条记录
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* 导入结果 */
            <div className="text-center py-8">
              {result.success > 0 ? (
                <div style={{ color: 'var(--color-success)' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="text-lg font-semibold">成功导入 {result.success} 条记录</p>
                </div>
              ) : (
                <div style={{ color: 'var(--color-danger)' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <p className="text-lg font-semibold">导入失败</p>
                </div>
              )}
              {result.failed > 0 && (
                <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
                  失败: {result.failed} 条
                </p>
              )}
              {result.messages.length > 0 && (
                <div style={{ marginTop: '16px', textAlign: 'left', maxHeight: '150px', overflowY: 'auto' }}>
                  {result.messages.slice(0, 5).map((msg, i) => (
                    <p key={i} style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{msg}</p>
                  ))}
                  {result.messages.length > 5 && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>...还有 {result.messages.length - 5} 条</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={generateTemplate} className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            下载模板
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} className="btn btn-secondary">
            {result ? '关闭' : '取消'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={loading || validCount === 0}
              className="btn btn-primary"
            >
              {loading ? '导入中...' : `导入 ${validCount} 条`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
