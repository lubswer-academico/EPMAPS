import { fetchMeterFromOffice, officeHttpClient } from '../officeApi';
import { MeterRecord } from '../../domain/meter/types';

describe('officeApi - fetchMeterFromOffice', () => {
  const mockMeter: MeterRecord = {
    code: 'MED-100201',
    address: 'Av. 10 de Agosto N24-150',
    sector: 'Mariscal Sucre',
    accountNumber: 'CTA-884920',
    status: 'active',
    lastReading: {
      value: 1245,
      date: '2026-09-15T08:30:00.000Z',
    },
    averageConsumption: 18,
  };

  let getSpy: jest.SpyInstance;

  beforeEach(() => {
    getSpy = jest.spyOn(officeHttpClient, 'get');
  });

  afterEach(() => {
    getSpy.mockRestore();
  });

  it('debe retornar la ficha técnica de 7 campos cuando el medidor existe', async () => {
    getSpy.mockResolvedValueOnce({
      data: [mockMeter],
      status: 200,
    });

    const result = await fetchMeterFromOffice('MED-100201');

    expect(result).not.toBeNull();
    expect(result).toEqual(mockMeter);
    expect(getSpy).toHaveBeenCalledWith('/medidores', {
      params: { code: 'MED-100201' },
    });
  });

  it('debe soportar la respuesta directa de objeto cuando no es arreglo', async () => {
    getSpy.mockResolvedValueOnce({
      data: mockMeter,
      status: 200,
    });

    const result = await fetchMeterFromOffice('MED-100201');

    expect(result).toEqual(mockMeter);
  });

  it('debe retornar null cuando la API retorna un arreglo vacío (no encontrado)', async () => {
    getSpy.mockResolvedValueOnce({
      data: [],
      status: 200,
    });

    const result = await fetchMeterFromOffice('MED-999999');

    expect(result).toBeNull();
  });

  it('debe retornar null cuando la API responde con status 404', async () => {
    getSpy.mockRejectedValueOnce({
      response: { status: 404, data: 'Not Found' },
      isAxiosError: true,
    });

    const result = await fetchMeterFromOffice('MED-999999');

    expect(result).toBeNull();
  });

  it('debe propagar un error legible cuando ocurre una falla de red o error de servidor', async () => {
    getSpy.mockRejectedValueOnce(new Error('Network Error'));

    await expect(fetchMeterFromOffice('MED-100201')).rejects.toThrow(
      'Error al consultar el medidor en el sistema central'
    );
  });
});
