import type { Employee } from '../types'

interface EmployeeListProps {
  employees: Employee[]
  selectedId?: number
  onSelect: (employee: Employee) => void
  onDelete: (id: number) => void
  onAdd: () => void
}

export function EmployeeList({ employees, selectedId, onSelect, onDelete, onAdd }: EmployeeListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">员工列表</h2>
        <button
          onClick={onAdd}
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
                  selectedId === emp.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelect(emp)}
              >
                <td className="px-4 py-2">{emp.name}</td>
                <td className="px-4 py-2 text-right">¥{emp.fixed_salary.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">¥{emp.performance_salary.toFixed(2)}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(emp.id!)
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
  )
}
