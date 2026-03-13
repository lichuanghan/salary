import { useState, useEffect, useCallback } from 'react'
import { EmployeeList, EmployeeForm } from '../components'
import * as api from '../hooks/api'
import type { Employee } from '../types'

export function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    if (searchKeyword.trim() === '') {
      setFilteredEmployees(employees)
    } else {
      const keyword = searchKeyword.toLowerCase()
      setFilteredEmployees(employees.filter(emp =>
        emp.name.toLowerCase().includes(keyword) ||
        emp.department?.toLowerCase().includes(keyword) ||
        emp.position?.toLowerCase().includes(keyword)
      ))
    }
  }, [searchKeyword, employees])

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees()
      setEmployees(data)
      setFilteredEmployees(data)
    } catch (error) {
      console.error('加载员工失败:', error)
    }
  }

  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword)
  }, [])

  const handleAddEmployee = async (data: Employee) => {
    try {
      await api.addEmployee(data)
      setShowModal(false)
      loadEmployees()
    } catch (error) {
      console.error('添加员工失败:', error)
    }
  }

  const handleEditEmployee = async (data: Employee) => {
    try {
      await api.updateEmployee(data)
      setEditingEmployee(null)
      loadEmployees()
    } catch (error) {
      console.error('更新员工失败:', error)
    }
  }

  const handleDeleteEmployee = async (id: number) => {
    try {
      await api.deleteEmployee(id)
      loadEmployees()
      if (selectedEmployee?.id === id) {
        setSelectedEmployee(null)
      }
    } catch (error) {
      console.error('删除员工失败:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="animate-scale">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          员工管理
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          管理员工基本信息
        </p>
      </div>

      {/* 员工列表 */}
      <div className="animate-scale" style={{ animationDelay: '50ms' }}>
        <div className="card" style={{ padding: '24px' }}>
          <EmployeeList
            employees={filteredEmployees}
            selectedId={selectedEmployee?.id}
            onSelect={setSelectedEmployee}
            onEdit={(emp) => setEditingEmployee(emp)}
            onDelete={handleDeleteEmployee}
            onAdd={() => setShowModal(true)}
            searchKeyword={searchKeyword}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* 添加员工弹窗 */}
      {showModal && (
        <EmployeeForm
          onSubmit={handleAddEmployee}
          onCancel={() => setShowModal(false)}
        />
      )}

      {/* 编辑员工弹窗 */}
      {editingEmployee && (
        <EmployeeForm
          initialData={editingEmployee}
          onSubmit={handleEditEmployee}
          onCancel={() => setEditingEmployee(null)}
        />
      )}
    </div>
  )
}
