
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardStats } from '@/components/DashboardStats';
import { UserTable } from '@/components/UserTable';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { SettingsPanel } from '@/components/SettingsPanel';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening.</p>
            </div>
            <DashboardStats />
            <AnalyticsChart />
          </div>
        );
      case 'users':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Users</h1>
              <p className="text-muted-foreground mt-2">Manage your user accounts and permissions.</p>
            </div>
            <UserTable />
          </div>
        );
      case 'analytics':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground mt-2">Track your performance and growth metrics.</p>
            </div>
            <AnalyticsChart />
          </div>
        );
      case 'settings':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-2">Configure your application preferences.</p>
            </div>
            <SettingsPanel />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
