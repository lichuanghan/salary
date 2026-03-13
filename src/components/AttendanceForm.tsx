import { useState } from 'react'
import type { Attendance } from '../types'

interface AttendanceFormProps {
  employeeName: string
  initialData?: Attendance
  onSubmit: (data: Attendance) => void
  onCancel: () => void
}

export function AttendanceForm({ employeeName, initialData, onSubmit, onCancel }: AttendanceFormProps) {
  const [formData, setFormData] = useState<Attendance>(
    initialData || {
      employee_id: 0,
      year_month: '',
      work_days: 23,
      normal_days: 21,
      sick_leave_days: 0
    }
  )

  const handleSubmit = () => {
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">录入考勤 - {employeeName}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">本月出勤天数</label>
            <input
              type="number"
              value={formData.work_days}
              onChange={(e) => setFormData({ ...formData, work_days: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">正常出勤天数</label>
            <input
              type="number"
              value={formData.normal_days}
              onChange={(e) => setFormData({ ...formData, normal_days: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">事假天数</label>
            <input
              type="number"
              value={formData.sick_leave_days}
              onChange={(e) => setFormData({ ...formData, sick_leave_days: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <p className="text-sm text-gray-500">
            考勤扣款规则：事假一天扣除固定薪酬一天，绩效薪酬不变。每天工资 = 固定薪酬 ÷ 21.75
          </p>
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
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
