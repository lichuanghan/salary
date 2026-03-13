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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {initialData ? '编辑员工' : '添加员工'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">固定薪酬 *</label>
            <input
              type="number"
              value={formData.fixed_salary}
              onChange={(e) => setFormData({ ...formData, fixed_salary: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">绩效薪酬 *</label>
            <input
              type="number"
              value={formData.performance_salary}
              onChange={(e) => setFormData({ ...formData, performance_salary: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
