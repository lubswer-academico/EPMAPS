import {
  formatConnectionStatus,
  getInitialPendingReadingsLabel,
} from '../statusBarRules';

describe('statusBarRules', () => {
  describe('formatConnectionStatus', () => {
    it('debe retornar "Con señal" cuando isConnected es true', () => {
      expect(formatConnectionStatus(true)).toBe('Con señal');
    });

    it('debe retornar "Sin señal" cuando isConnected es false', () => {
      expect(formatConnectionStatus(false)).toBe('Sin señal');
    });

    it('debe retornar "Sin señal" cuando isConnected es null o undefined', () => {
      expect(formatConnectionStatus(null)).toBe('Sin señal');
      expect(formatConnectionStatus(undefined)).toBe('Sin señal');
    });
  });

  describe('getInitialPendingReadingsLabel', () => {
    it('debe retornar exactamente "0 pendientes" de forma constante', () => {
      expect(getInitialPendingReadingsLabel()).toBe('0 pendientes');
    });
  });
});
