import axios, { AxiosInstance } from 'axios';
import { MeterRecord } from '../domain/meter/types';

const DEFAULT_API_BASE_URL = 'https://67bc8247ed4861e07b39ea36.mockapi.io/api/v1';

export const officeHttpClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_OFFICE_API_URL || DEFAULT_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Consulta la ficha técnica y comercial del medidor al servidor central de la oficina.
 * @param meterCode Código oficial en formato MED-XXXXXX
 * @returns MeterRecord si se encuentra, o null si no existe (404 o lista vacía)
 * @throws Error si hay fallas de red o indisponibilidad del servidor
 */
export async function fetchMeterFromOffice(meterCode: string): Promise<MeterRecord | null> {
  try {
    const response = await officeHttpClient.get('/medidores', {
      params: { code: meterCode },
    });

    const data = response.data;

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return null;
      }
      return data[0] as MeterRecord;
    }

    if (data && typeof data === 'object' && 'code' in data) {
      return data as MeterRecord;
    }

    return null;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw new Error('Error al consultar el medidor en el sistema central');
  }
}
