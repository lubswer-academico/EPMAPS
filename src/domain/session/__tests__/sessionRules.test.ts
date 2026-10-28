import {
  sanitizeEmployeeCode,
  validateCredentialsFormat,
  authenticateTechnician,
} from '../sessionRules';
import { TechnicianCredentials } from '../types';

describe('sessionRules', () => {
  const testCatalog: TechnicianCredentials[] = [
    {
      employeeCode: 'TEC-001',
      pin: '1234',
      name: 'Carlos Mendoza',
    },
    {
      employeeCode: 'TEC-002',
      pin: '5678',
      name: 'Ana Morales',
    },
  ];

  describe('sanitizeEmployeeCode', () => {
    it('debe recortar espacios al inicio y al final del código', () => {
      expect(sanitizeEmployeeCode('  TEC-001  ')).toBe('TEC-001');
      expect(sanitizeEmployeeCode('TEC-002 ')).toBe('TEC-002');
      expect(sanitizeEmployeeCode('   ')).toBe('');
    });
  });

  describe('validateCredentialsFormat', () => {
    it('debe validar cuando el código y la clave no están vacíos', () => {
      const result = validateCredentialsFormat('TEC-001', '1234');
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('debe rechazar código vacío con mensaje en español', () => {
      const result = validateCredentialsFormat('   ', '1234');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Debe ingresar el código de empleado y la clave.');
    });

    it('debe rechazar clave vacía con mensaje en español', () => {
      const result = validateCredentialsFormat('TEC-001', '');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Debe ingresar el código de empleado y la clave.');
    });
  });

  describe('authenticateTechnician', () => {
    it('debe autenticar exitosamente a un técnico con credenciales correctas incluso si hay espacios en el código', () => {
      const result = authenticateTechnician('  TEC-001 ', '1234', testCatalog);
      expect(result.success).toBe(true);
      expect(result.technician).toEqual({
        employeeCode: 'TEC-001',
        name: 'Carlos Mendoza',
      });
      expect(result.errorMessage).toBeUndefined();
    });

    it('debe rechazar código inexistente con mensaje de error en español', () => {
      const result = authenticateTechnician('TEC-999', '1234', testCatalog);
      expect(result.success).toBe(false);
      expect(result.technician).toBeUndefined();
      expect(result.errorMessage).toBe('Código de empleado o clave incorrectos.');
    });

    it('debe rechazar clave incorrecta para código existente', () => {
      const result = authenticateTechnician('TEC-001', '0000', testCatalog);
      expect(result.success).toBe(false);
      expect(result.technician).toBeUndefined();
      expect(result.errorMessage).toBe('Código de empleado o clave incorrectos.');
    });

    it('debe rechazar cuando los campos están vacíos sin consultar el catálogo', () => {
      const result = authenticateTechnician('', '', testCatalog);
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Debe ingresar el código de empleado y la clave.');
    });
  });
});
