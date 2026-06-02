import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { useArrayPersistence } from '../hooks/usePersistence';
import { isPresentationEmployeeRecord, stripLegacyEmployees } from '../utils/legacyDemoCleanup';
import type { EmployeeLeaveEntitlements, EmployeePayslip } from '../types/employeeHr';

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  joinDate: string;
  startDate?: string;
  status: 'active' | 'on-leave' | 'terminated';
  avatar: string;
  salary: number;
  benefits: string[];
  level: 'junior' | 'mid' | 'senior' | 'lead';
  email?: string;
  phone?: string;
  employmentType: 'permanent' | 'contract' | 'freelancer';
  workLocation?: 'office' | 'offsite' | 'hybrid';
  leaveEntitlements?: EmployeeLeaveEntitlements;
  payslips?: EmployeePayslip[];
}

interface EmployeeContextType {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
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

  useEffect(() => {
    setEmployees((prev) => {
      if (!prev.some(isPresentationEmployeeRecord)) return prev;
      return stripLegacyEmployees(prev);
    });
  }, [setEmployees]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('timelymate:employees-changed'));
  }, [employees.length]);

  const addEmployee = useCallback((employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
  }, [setEmployees]);

  const addEmployees = useCallback((newEmployees: Employee[]) => {
    setEmployees((prev) => [...prev, ...newEmployees]);
  }, [setEmployees]);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp)));
  }, [setEmployees]);

  const removeEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  }, [setEmployees]);

  const getEmployeeById = useCallback(
    (id: string) => employees.find((emp) => emp.id === id),
    [employees]
  );

  const getEmployeesByDepartment = useCallback(
    (department: string) => employees.filter((emp) => emp.department === department),
    [employees]
  );

  const getEmployeesByLevel = useCallback(
    (level: Employee['level']) => employees.filter((emp) => emp.level === level),
    [employees]
  );

  const getActiveEmployees = useCallback(
    () => employees.filter((emp) => emp.status === 'active'),
    [employees]
  );

  const getEmployeeCount = useCallback(() => employees.length, [employees]);

  const getDepartmentStats = useCallback(() => {
    return employees.reduce((stats, emp) => {
      stats[emp.department] = (stats[emp.department] || 0) + 1;
      return stats;
    }, {} as { [key: string]: number });
  }, [employees]);

  const getLevelStats = useCallback(() => {
    return employees.reduce((stats, emp) => {
      stats[emp.level] = (stats[emp.level] || 0) + 1;
      return stats;
    }, {} as { [key: string]: number });
  }, [employees]);

  const value = useMemo<EmployeeContextType>(
    () => ({
      employees,
      setEmployees,
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
    }),
    [
      employees,
      setEmployees,
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
    ]
  );

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};
