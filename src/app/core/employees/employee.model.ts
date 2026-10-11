export interface Employee {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string };
  status: 'ACTIVE' | 'INACTIVE';
}

export interface EmployeeFilter {
  roleId?: string;
  name?: string;
  email?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  size?: number;
}
