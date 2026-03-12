import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'

interface Employee {
  id?: number
  name: string
  id_card?: string
  city?: string
  department?: string
  position?: string
  entry_date?: string
  fixed_salary: number
  performance_salary: number
  status: string
}

interface Attendance {
  id?: number
  employee_id: number
  year_month: string
  work_days: number
  normal_days: number
  sick_leave_days: number
}

interface SalaryResult {
  employee_id: number
  employee_name: string
  fixed_salary: number
  performance_salary: number
  attendance_deduction: number
  monthly_salary: number
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [yearMonth, setYearMonth] = useState('2026-03')
  const [salaryResult, setSalaryResult] = useState<SalaryResult | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [formData, setFormData] = useState<Employee>({
    name: '',
    fixed_salary: 0,
    performance_salary: 0,
    status: 'active'
  })
  const [attendanceData, setAttendanceData] = useState<Attendance>({
    employee_id: 0,
    year_month: '2026-03',
    work_days: 23,
    normal_days: 21,
    sick_leave_days: 0
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const data = await invoke<Employee[]>('get_employees')
      setEmployees(data)
    } catch (error) {
      console.error('加载员工失败:', error)
    }
  }

  const handleAddEmployee = async () => {
    try {
      await invoke('add_employee', { employee: formData })
      setShowAddModal(false)
      setFormData({ name: '', fixed_salary: 0, performance_salary: 0, status: 'active' })
      loadEmployees()
    } catch (error) {
      console.error('添加员工失败:', error)
    }
  }

  const handleDeleteEmployee = async (id: number) => {
    try {
      await invoke('delete_employee', { id })
      loadEmployees()
      if (selectedEmployee?.id === id) {
        setSelectedEmployee(null)
        setSalaryResult(null)
      }
    } catch (error) {
      console.error('删除员工失败:', error)
    }
  }

  const handleSaveAttendance = async () => {
    if (!selectedEmployee?.id) return
    try {
      await invoke('save_attendance', {
        attendance: {
          ...attendanceData,
          employee_id: selectedEmployee.id,
          year_month: yearMonth
        }
      })
      setShowAttendanceModal(false)
      // 保存考勤后自动重新计算工资
      handleCalculate()
    } catch (error) {
      console.error('保存考勤失败:', error)
    }
  }

  const handleCalculate = async () => {
    if (!selectedEmployee?.id) return
    try {
      const result = await invoke<SalaryResult>('calculate_salary', {
        employeeId: selectedEmployee.id,
        yearMonth
      })
      setSalaryResult(result)
    } catch (error) {
      console.error('计算工资失败:', error)
    }
  }

  const openAttendanceModal = () => {
    if (!selectedEmployee) return
    setAttendanceData({
      employee_id: selectedEmployee.id || 0,
      year_month: yearMonth,
      work_days: 23,
      normal_days: 21,
      sick_leave_days: 0
    })
    setShowAttendanceModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">薪酬管理系统</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 员工列表 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">员工列表</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                添加员工
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">姓名</th>
                    <th className="px-4 py-2 text-right">固定薪酬</th>
                    <th className="px-4 py-2 text-right">绩效薪酬</th>
                    <th className="px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className={`border-t hover:bg-gray-50 cursor-pointer ${
                        selectedEmployee?.id === emp.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      <td className="px-4 py-2">{emp.name}</td>
                      <td className="px-4 py-2 text-right">¥{emp.fixed_salary.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">¥{emp.performance_salary.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteEmployee(emp.id!)
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        暂无员工，请添加
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 工资核算 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">工资核算</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择年月
              </label>
              <input
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择员工
              </label>
              <select
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const emp = employees.find((em) => em.id === Number(e.target.value))
                  setSelectedEmployee(emp || null)
                  setSalaryResult(null)
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">请选择员工</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={openAttendanceModal}
                disabled={!selectedEmployee}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                录入考勤
              </button>
              <button
                onClick={handleCalculate}
                disabled={!selectedEmployee}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                计算工资
              </button>
            </div>

            {salaryResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">{salaryResult.employee_name} - {yearMonth} 月工资</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>固定薪酬：</span>
                    <span>¥{salaryResult.fixed_salary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>绩效薪酬：</span>
                    <span>¥{salaryResult.performance_salary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>考勤扣减：</span>
                    <span>- ¥{salaryResult.attendance_deduction.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>本月工资：</span>
                    <span className="text-green-600">¥{salaryResult.monthly_salary.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 添加员工弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">添加员工</h3>
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
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddEmployee}
                disabled={!formData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 考勤录入弹窗 */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">录入考勤 - {selectedEmployee?.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">本月出勤天数</label>
                <input
                  type="number"
                  value={attendanceData.work_days}
                  onChange={(e) => setAttendanceData({ ...attendanceData, work_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">正常出勤天数</label>
                <input
                  type="number"
                  value={attendanceData.normal_days}
                  onChange={(e) => setAttendanceData({ ...attendanceData, normal_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">事假天数</label>
                <input
                  type="number"
                  value={attendanceData.sick_leave_days}
                  onChange={(e) => setAttendanceData({ ...attendanceData, sick_leave_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <p className="text-sm text-gray-500">
                考勤扣款规则：事假一天扣除固定薪酬一天，绩效薪酬不变。每天工资 = 固定薪酬 ÷ 21.75
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
