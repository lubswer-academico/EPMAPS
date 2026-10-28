import { TechnicianCredentials } from './types';

/**
 * Catálogo offline determinista de técnicos autorizados para toma de lecturas EPMAPS.
 * Permite la validación de credenciales en campo sin requerir conexión a internet.
 */
export const TECHNICIANS_CATALOG: readonly TechnicianCredentials[] = Object.freeze([
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
  {
    employeeCode: 'TEC-003',
    pin: '9012',
    name: 'Jorge Benítez',
  },
]);
