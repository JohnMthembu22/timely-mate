import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useArrayPersistence } from '../hooks/usePersistence';

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  joinDate: string;
  startDate?: string; // Alternative to joinDate
  status: 'active' | 'on-leave' | 'terminated';
  avatar: string;
  salary: number;
  benefits: string[];
  level: 'junior' | 'mid' | 'senior' | 'lead';
  email?: string;
  phone?: string; // Phone number
  employmentType: 'permanent' | 'contract' | 'freelancer';
}

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  addEmployees: (newEmployees: Employee[]) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeesByDepartment: (department: string) => Employee[];
  getEmployeesByLevel: (level: Employee['level']) => Employee[];
  getActiveEmployees: () => Employee[];
  getEmployeeCount: () => number;
  getDepartmentStats: () => { [key: string]: number };
  getLevelStats: () => { [key: string]: number };
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};

interface EmployeeProviderProps {
  children: ReactNode;
}

export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({ children }) => {
  const [employees, setEmployees] = useArrayPersistence<Employee>('timelymate_employees', []);

  const addEmployee = (employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  };

  const addEmployees = (newEmployees: Employee[]) => {
    setEmployees(prev => [...prev, ...newEmployees]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === id ? { ...emp, ...updates } : emp
      )
    );
  };

  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const getEmployeeById = (id: string) => {
    return employees.find(emp => emp.id === id);
  };

  const getEmployeesByDepartment = (department: string) => {
    return employees.filter(emp => emp.department === department);
  };

  const getEmployeesByLevel = (level: Employee['level']) => {
    return employees.filter(emp => emp.level === level);
  };

  const getActiveEmployees = () => {
    return employees.filter(emp => emp.status === 'active');
  };

  const getEmployeeCount = () => {
    return employees.length;
  };

  const getDepartmentStats = () => {
    return employees.reduce((stats, emp) => {
      stats[emp.department] = (stats[emp.department] || 0) + 1;
      return stats;
    }, {} as { [key: string]: number });
  };

  const getLevelStats = () => {
    return employees.reduce((stats, emp) => {
      stats[emp.level] = (stats[emp.level] || 0) + 1;
      return stats;
    }, {} as { [key: string]: number });
  };

  const value: EmployeeContextType = {
    employees,
    addEmployee,
    addEmployees,
    updateEmployee,
    removeEmployee,
    getEmployeeById,
    getEmployeesByDepartment,
    getEmployeesByLevel,
    getActiveEmployees,
    getEmployeeCount,
    getDepartmentStats,
    getLevelStats,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
}; 