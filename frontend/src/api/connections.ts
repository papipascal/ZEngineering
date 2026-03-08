import client from './client';

export type ConnectionType = 'PROCESS_LINE' | 'INSTRUMENT_LOOP' | 'ELECTRICAL_CABLE' | 'UTILITY_LINE' | 'DRAIN_VENT';

export interface Connection {
  id: string;
  projectId: string;
  lineNumber: string;
  type: ConnectionType;
  fluid: string | null;
  fromEquipmentId: string | null;
  fromEquipment?: { id: string; tagNumber: string; service: string } | null;
  toEquipmentId: string | null;
  toEquipment?: { id: string; tagNumber: string; service: string } | null;
  fromNozzle: string | null;
  toNozzle: string | null;
  nominalDiameter: string | null;
  pressureClass: string | null;
  materialSpec: string | null;
  insulationType: string | null;
  paintSystem: string | null;
  isoCertRequired: boolean;
  lineListRef: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConnectionDto {
  projectId: string;
  lineNumber: string;
  type: ConnectionType;
  fluid?: string;
  fromEquipmentId?: string;
  toEquipmentId?: string;
  fromNozzle?: string;
  toNozzle?: string;
  nominalDiameter?: string;
  pressureClass?: string;
  materialSpec?: string;
  insulationType?: string;
  paintSystem?: string;
  isoCertRequired?: boolean;
  lineListRef?: string;
  notes?: string;
}

export const connectionsApi = {
  list: (params?: { projectId?: string; equipmentId?: string; type?: ConnectionType; search?: string }) =>
    client.get<Connection[]>('/api/connections', { params }),

  getById: (id: string) =>
    client.get<Connection>(`/api/connections/${id}`),

  create: (data: CreateConnectionDto) =>
    client.post<Connection>('/api/connections', data),

  update: (id: string, data: Partial<CreateConnectionDto>) =>
    client.put<Connection>(`/api/connections/${id}`, data),

  remove: (id: string) =>
    client.delete(`/api/connections/${id}`),
};
