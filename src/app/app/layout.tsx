import type { ReactNode } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { SettingsPopup } from './components/SettingsPopup'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <SettingsPopup />
    </div>
  )
}
