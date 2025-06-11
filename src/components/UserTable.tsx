
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'active',
    lastActive: '1 day ago',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'User',
    status: 'inactive',
    lastActive: '1 week ago',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'Editor',
    status: 'active',
    lastActive: '5 minutes ago',
  },
];

export function UserTable() {
  const [users] = useState<User[]>(mockUsers);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">User Management</h2>
        <p className="text-muted-foreground mt-1">Manage and monitor user accounts</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-foreground">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {user.lastActive}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                    className="p-1 hover:bg-accent rounded transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  
                  {openDropdown === user.id && (
                    <div className="absolute right-0 top-8 bg-popover border border-border rounded-md shadow-lg z-10 py-1 min-w-[120px]">
                      <button className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                      <button className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
                        <Edit className="h-3 w-3" />
                        Edit
                      </button>
                      <button className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-red-600 flex items-center gap-2">
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
