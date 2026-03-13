import { useState } from 'react'
import type { PageId } from '../types'

export function useNavigation() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return {
    activePage,
    setActivePage,
    sidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed(!sidebarCollapsed)
  }
}
