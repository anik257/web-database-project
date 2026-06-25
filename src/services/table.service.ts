import Table, { ITable } from '../models/table.model';
import { ApiError } from '../utils/api-error';
import { validateObjectId } from '../utils/validation.util';

/**
 * Service: Create a new physical table.
 */
export const createTable = async (data: {
  tableNumber: number;
  capacity: number;
  status?: 'available' | 'occupied' | 'reserved';
}): Promise<ITable> => {
  const { tableNumber, capacity, status } = data;

  if (tableNumber === undefined || tableNumber < 1) {
    throw ApiError.badRequest('Table number is required and must be at least 1');
  }

  if (capacity === undefined || capacity < 1 || capacity > 20) {
    throw ApiError.badRequest('Capacity is required and must be between 1 and 20');
  }

  // Check for duplicate table number
  const existingTable = await Table.findOne({ tableNumber });
  if (existingTable) {
    throw ApiError.badRequest(`Table number ${tableNumber} already exists`);
  }

  const table = await Table.create({
    tableNumber,
    capacity,
    status: status || 'available',
  });

  return table;
};

/**
 * Service: Get all tables with filters.
 */
export const getAllTables = async (filters: { status?: 'available' | 'occupied' | 'reserved' }): Promise<ITable[]> => {
  const query: any = {};
  if (filters.status) {
    query.status = filters.status;
  }
  return Table.find(query).sort({ tableNumber: 1 });
};

/**
 * Service: Get Table by ID.
 */
export const getTableById = async (id: string): Promise<ITable> => {
  validateObjectId(id, 'Table');
  const table = await Table.findById(id);
  if (!table) {
    throw ApiError.notFound(`Table with ID '${id}' not found`);
  }
  return table;
};

/**
 * Service: Update Table details.
 * Admins can update any field. Staff can only update the status field.
 */
export const updateTable = async (
  id: string,
  data: { tableNumber?: number; capacity?: number; status?: 'available' | 'occupied' | 'reserved' },
  userRole: 'admin' | 'manager' | 'staff' | 'customer'
): Promise<ITable> => {
  validateObjectId(id, 'Table');
  const table = await getTableById(id);

  const isAdmin = userRole === 'admin' || userRole === 'manager';

  // Apply changes
  if (data.status !== undefined) {
    table.status = data.status;
  }

  if (data.tableNumber !== undefined || data.capacity !== undefined) {
    if (!isAdmin) {
      throw ApiError.forbidden('Only administrators or managers can modify table configurations (number, capacity).');
    }

    if (data.tableNumber !== undefined) {
      if (data.tableNumber < 1) {
        throw ApiError.badRequest('Table number must be at least 1');
      }

      // Check if tableNumber is taken
      const duplicateTable = await Table.findOne({ tableNumber: data.tableNumber, _id: { $ne: id } });
      if (duplicateTable) {
        throw ApiError.badRequest(`Table number ${data.tableNumber} is already in use`);
      }
      table.tableNumber = data.tableNumber;
    }

    if (data.capacity !== undefined) {
      if (data.capacity < 1 || data.capacity > 20) {
        throw ApiError.badRequest('Capacity must be between 1 and 20');
      }
      table.capacity = data.capacity;
    }
  }

  await table.save();
  return table;
};

/**
 * Service: Delete Table by ID.
 */
export const deleteTable = async (id: string): Promise<void> => {
  validateObjectId(id, 'Table');
  const result = await Table.findByIdAndDelete(id);
  if (!result) {
    throw ApiError.notFound(`Table with ID '${id}' not found`);
  }
};
