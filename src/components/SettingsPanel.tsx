
import { Save, User, Bell, Shield, Database } from 'lucide-react';

export function SettingsPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Profile Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Display Name
            </label>
            <input 
              type="text" 
              defaultValue="Admin User"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input 
              type="email" 
              defaultValue="admin@example.com"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-foreground">Email notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-foreground">Push notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-foreground">SMS notifications</span>
          </label>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Security</h3>
        </div>
        <div className="space-y-4">
          <button className="w-full text-left px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors">
            Change Password
          </button>
          <button className="w-full text-left px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors">
            Two-Factor Authentication
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">System</h3>
        </div>
        <div className="space-y-4">
          <button className="w-full text-left px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors">
            Backup Data
          </button>
          <button className="w-full text-left px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors text-red-600">
            Reset System
          </button>
        </div>
      </div>

      <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
        <Save className="h-4 w-4" />
        Save Changes
      </button>
    </div>
  );
}
