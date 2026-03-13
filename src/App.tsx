import { Layout, Sidebar, PageContainer } from './components'
import {
  DashboardPage,
  EmployeePage,
  SalaryPage,
  InsurancePage,
  AttendancePage,
  TaxPage,
  ReportPage,
  SettingsPage
} from './pages'
import { useNavigation } from './hooks/useNavigation'
import type { PageId } from './types'

function App() {
  const { activePage, setActivePage, sidebarCollapsed, toggleSidebar } = useNavigation()

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />
      case 'employee':
        return <EmployeePage />
      case 'salary':
        return <SalaryPage />
      case 'insurance':
        return <InsurancePage />
      case 'attendance':
        return <AttendancePage />
      case 'tax':
        return <TaxPage />
      case 'report':
        return <ReportPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <Layout>
      <div className="app-layout">
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => setActivePage(page as PageId)}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <PageContainer>
          {renderPage()}
        </PageContainer>
      </div>
    </Layout>
  )
}

export default App
