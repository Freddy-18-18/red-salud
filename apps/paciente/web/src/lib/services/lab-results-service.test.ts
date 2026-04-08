import { vi, describe, it, expect, beforeEach } from 'vitest';

// --- Mock fetchJson at the module level ---
const mockFetchJson = vi.fn();

vi.mock('@/lib/utils/fetch', () => ({
  fetchJson: (...args: unknown[]) => mockFetchJson(...args),
  postJson: vi.fn(),
}));

// Import AFTER mock is set up
import { labResultsService } from './lab-results-service';

// ---------------------------------------------------------------------------
// labResultsService
// ---------------------------------------------------------------------------

describe('labResultsService', () => {
  beforeEach(() => {
    mockFetchJson.mockReset();
  });

  // ── getOrders ─────────────────────────────────────────────────────

  describe('getOrders', () => {
    it('fetches from /api/lab/orders', async () => {
      const orders = [
        {
          id: 'ord-1',
          patient_id: 'pat-1',
          doctor_id: 'doc-1',
          laboratory_id: 'lab-1',
          order_number: 'LAB-2026-001',
          ordered_at: '2026-04-01T10:00:00Z',
          status: 'completada',
        },
      ];
      mockFetchJson.mockResolvedValue(orders);

      const result = await labResultsService.getOrders('pat-1');

      expect(mockFetchJson).toHaveBeenCalledWith('/api/lab/orders');
      expect(result).toEqual(orders);
    });
  });

  // ── getOrderDetail ────────────────────────────────────────────────

  describe('getOrderDetail', () => {
    it('fetches from /api/lab/orders/{id}', async () => {
      const detail = {
        order: {
          id: 'ord-1',
          patient_id: 'pat-1',
          doctor_id: 'doc-1',
          laboratory_id: 'lab-1',
          order_number: 'LAB-2026-001',
          ordered_at: '2026-04-01T10:00:00Z',
          status: 'completada' as const,
        },
        results: [
          {
            id: 'res-1',
            order_id: 'ord-1',
            test_type_id: 'tt-1',
            result_at: '2026-04-02T14:00:00Z',
          },
        ],
      };
      mockFetchJson.mockResolvedValue(detail);

      const result = await labResultsService.getOrderDetail('ord-1');

      expect(mockFetchJson).toHaveBeenCalledWith('/api/lab/orders/ord-1');
      expect(result).toEqual(detail);
      expect(result.order.id).toBe('ord-1');
      expect(result.results).toHaveLength(1);
    });
  });

  // ── getResultValues ───────────────────────────────────────────────

  describe('getResultValues', () => {
    it('fetches from /api/lab/results/{id}/values', async () => {
      const values = [
        {
          id: 'val-1',
          result_id: 'res-1',
          parameter_name: 'Glucosa',
          value: 95,
          unit: 'mg/dL',
          reference_min: 70,
          reference_max: 110,
          status: 'normal',
        },
      ];
      mockFetchJson.mockResolvedValue(values);

      const result = await labResultsService.getResultValues('res-1');

      expect(mockFetchJson).toHaveBeenCalledWith(
        '/api/lab/results/res-1/values',
      );
      expect(result).toEqual(values);
    });
  });

  // ── getParameterHistory ───────────────────────────────────────────

  describe('getParameterHistory', () => {
    it('builds correct query params with parameter_name and since', async () => {
      const rawData = [
        {
          value: 95,
          status: 'normal',
          unit: 'mg/dL',
          reference_min: 70,
          reference_max: 110,
          result: { result_at: '2026-03-01T10:00:00Z' },
        },
        {
          value: 105,
          status: 'normal',
          unit: 'mg/dL',
          reference_min: 70,
          reference_max: 110,
          result: { result_at: '2026-04-01T10:00:00Z' },
        },
      ];
      mockFetchJson.mockResolvedValue(rawData);

      const result = await labResultsService.getParameterHistory(
        'pat-1',
        'Glucosa',
        12,
      );

      // Verify URL structure
      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).toContain('/api/lab/parameters/history');
      expect(url).toContain('parameter_name=Glucosa');
      expect(url).toContain('since=');

      // Verify returned ParameterHistory shape
      expect(result.parameter_name).toBe('Glucosa');
      expect(result.unit).toBe('mg/dL');
      expect(result.reference_min).toBe(70);
      expect(result.reference_max).toBe(110);
      expect(result.points).toHaveLength(2);
      expect(result.points[0]).toEqual({
        value: 95,
        date: '2026-03-01T10:00:00Z',
        status: 'normal',
      });
    });

    it('computes stats correctly from returned data', async () => {
      const rawData = [
        {
          value: 80,
          status: 'normal',
          unit: 'mg/dL',
          reference_min: 70,
          reference_max: 110,
          result: { result_at: '2026-01-01T10:00:00Z' },
        },
        {
          value: 100,
          status: 'normal',
          unit: 'mg/dL',
          reference_min: 70,
          reference_max: 110,
          result: { result_at: '2026-02-01T10:00:00Z' },
        },
        {
          value: 120,
          status: 'alto',
          unit: 'mg/dL',
          reference_min: 70,
          reference_max: 110,
          result: { result_at: '2026-03-01T10:00:00Z' },
        },
      ];
      mockFetchJson.mockResolvedValue(rawData);

      const result = await labResultsService.getParameterHistory(
        'pat-1',
        'Glucosa',
        6,
      );

      expect(result.stats.min).toBe(80);
      expect(result.stats.max).toBe(120);
      expect(result.stats.average).toBe(100);
      expect(result.stats.trend).toBe('up'); // 120 vs 100 > 3% threshold
    });

    it('returns stable trend when only one data point exists', async () => {
      const rawData = [
        {
          value: 95,
          status: 'normal',
          unit: 'mg/dL',
          reference_min: 70,
          reference_max: 110,
          result: { result_at: '2026-03-01T10:00:00Z' },
        },
      ];
      mockFetchJson.mockResolvedValue(rawData);

      const result = await labResultsService.getParameterHistory(
        'pat-1',
        'Glucosa',
      );

      expect(result.stats.trend).toBe('stable');
      expect(result.points).toHaveLength(1);
    });

    it('returns down trend when latest value drops significantly', async () => {
      const rawData = [
        {
          value: 100,
          status: 'normal',
          unit: 'mg/dL',
          reference_min: 70,
          reference_max: 110,
          result: { result_at: '2026-01-01T10:00:00Z' },
        },
        {
          value: 80,
          status: 'normal',
          unit: 'mg/dL',
          reference_min: 70,
          reference_max: 110,
          result: { result_at: '2026-02-01T10:00:00Z' },
        },
      ];
      mockFetchJson.mockResolvedValue(rawData);

      const result = await labResultsService.getParameterHistory(
        'pat-1',
        'Glucosa',
      );

      expect(result.stats.trend).toBe('down');
    });

    it('handles empty data gracefully', async () => {
      mockFetchJson.mockResolvedValue([]);

      const result = await labResultsService.getParameterHistory(
        'pat-1',
        'Glucosa',
      );

      expect(result.parameter_name).toBe('Glucosa');
      expect(result.points).toEqual([]);
      expect(result.stats).toEqual({
        min: 0,
        max: 0,
        average: 0,
        trend: 'stable',
      });
    });

    it('defaults months to 12 when not specified', async () => {
      mockFetchJson.mockResolvedValue([]);

      await labResultsService.getParameterHistory('pat-1', 'Hemoglobina');

      const url = mockFetchJson.mock.calls[0][0] as string;
      // The since date should be roughly 12 months ago
      const sinceMatch = url.match(/since=([^&]+)/);
      expect(sinceMatch).toBeTruthy();
      const sinceDate = new Date(decodeURIComponent(sinceMatch![1]));
      const now = new Date();
      const monthsDiff =
        (now.getFullYear() - sinceDate.getFullYear()) * 12 +
        (now.getMonth() - sinceDate.getMonth());
      expect(monthsDiff).toBe(12);
    });
  });

  // ── getMonitoredParameters ────────────────────────────────────────

  describe('getMonitoredParameters', () => {
    it('fetches from /api/lab/parameters/monitored', async () => {
      const rawData = [
        {
          parameter_name: 'Glucosa',
          unit: 'mg/dL',
          reference_min: 70,
          reference_max: 110,
          value: 95,
          status: 'normal',
          result: { result_at: '2026-04-01T10:00:00Z' },
        },
      ];
      mockFetchJson.mockResolvedValue(rawData);

      const result = await labResultsService.getMonitoredParameters('pat-1');

      expect(mockFetchJson).toHaveBeenCalledWith(
        '/api/lab/parameters/monitored',
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        parameter_name: 'Glucosa',
        unit: 'mg/dL',
        reference_min: 70,
        reference_max: 110,
        latest_value: 95,
        latest_status: 'normal',
        latest_date: '2026-04-01T10:00:00Z',
        trend: 'stable',
      });
    });

    it('always sets trend to stable (by design)', async () => {
      const rawData = [
        {
          parameter_name: 'Hemoglobina',
          unit: 'g/dL',
          reference_min: 12,
          reference_max: 17,
          value: 15,
          status: 'normal',
          result: { result_at: '2026-04-01T10:00:00Z' },
        },
        {
          parameter_name: 'Glucosa',
          unit: 'mg/dL',
          reference_min: 70,
          reference_max: 110,
          value: 130,
          status: 'alto',
          result: { result_at: '2026-04-01T10:00:00Z' },
        },
      ];
      mockFetchJson.mockResolvedValue(rawData);

      const result = await labResultsService.getMonitoredParameters('pat-1');

      result.forEach((param) => {
        expect(param.trend).toBe('stable');
      });
    });

    it('handles empty response', async () => {
      mockFetchJson.mockResolvedValue([]);

      const result = await labResultsService.getMonitoredParameters('pat-1');

      expect(result).toEqual([]);
    });
  });

  // ── getLatestResults ──────────────────────────────────────────────

  describe('getLatestResults', () => {
    it('fetches from /api/lab/results/latest with default limit of 5', async () => {
      mockFetchJson.mockResolvedValue([]);

      await labResultsService.getLatestResults('pat-1');

      expect(mockFetchJson).toHaveBeenCalledWith(
        '/api/lab/results/latest?limit=5',
      );
    });

    it('passes custom limit parameter', async () => {
      mockFetchJson.mockResolvedValue([]);

      await labResultsService.getLatestResults('pat-1', 10);

      expect(mockFetchJson).toHaveBeenCalledWith(
        '/api/lab/results/latest?limit=10',
      );
    });

    it('returns the results array', async () => {
      const results = [
        {
          id: 'res-1',
          order_id: 'ord-1',
          test_type_id: 'tt-1',
          result_at: '2026-04-01T10:00:00Z',
          test_type: { id: 'tt-1', name: 'Hematologia Completa' },
        },
        {
          id: 'res-2',
          order_id: 'ord-1',
          test_type_id: 'tt-2',
          result_at: '2026-04-01T10:00:00Z',
          test_type: { id: 'tt-2', name: 'Glucosa en Ayunas' },
        },
      ];
      mockFetchJson.mockResolvedValue(results);

      const result = await labResultsService.getLatestResults('pat-1', 2);

      expect(result).toEqual(results);
      expect(result).toHaveLength(2);
    });
  });

  // ── Error propagation ─────────────────────────────────────────────

  describe('error propagation', () => {
    it('re-throws when fetchJson rejects on getOrders', async () => {
      mockFetchJson.mockRejectedValue(new Error('No autenticado.'));

      await expect(labResultsService.getOrders('pat-1')).rejects.toThrow(
        'No autenticado.',
      );
    });

    it('re-throws when fetchJson rejects on getOrderDetail', async () => {
      mockFetchJson.mockRejectedValue(new Error('Orden no encontrada.'));

      await expect(
        labResultsService.getOrderDetail('ord-999'),
      ).rejects.toThrow('Orden no encontrada.');
    });

    it('re-throws when fetchJson rejects on getParameterHistory', async () => {
      mockFetchJson.mockRejectedValue(new Error('Request failed (500)'));

      await expect(
        labResultsService.getParameterHistory('pat-1', 'Glucosa'),
      ).rejects.toThrow('Request failed (500)');
    });
  });
});
