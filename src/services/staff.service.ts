import Staff, { IStaff } from '../models/staff.model';
import { ApiError } from '../utils/api-error';
import { validateObjectId } from '../utils/validation.util';

/**
 * Service: Create a new Staff profile.
 */
export const createStaff = async (data: {
  name: string;
  phone: string;
  position: 'Manager' | 'Waiter' | 'Chef' | 'Cashier';
  salary: number;
  joiningDate?: Date;
}): Promise<IStaff> => {
  const { name, phone, position, salary, joiningDate } = data;

  // Validate fields
  if (!name || name.trim() === '') {
    throw ApiError.badRequest('Name is required');
  }

  if (!phone || phone.trim() === '') {
    throw ApiError.badRequest('Phone number is required');
  }

  if (!position) {
    throw ApiError.badRequest('Position is required');
  }

  const validPositions = ['Manager', 'Waiter', 'Chef', 'Cashier'];
  if (!validPositions.includes(position)) {
    throw ApiError.badRequest(`Position must be one of: ${validPositions.join(', ')}`);
  }

  if (salary === undefined || salary < 0) {
    throw ApiError.badRequest('Salary is required and cannot be negative');
  }

  const staff = await Staff.create({
    name: name.trim(),
    phone: phone.trim(),
    position,
    salary,
    joiningDate: joiningDate || new Date(),
  });

  return staff;
};

/**
 * Service: Get all staff profiles.
 */
export const getAllStaff = async (filters: { position?: string }): Promise<IStaff[]> => {
  const query: any = {};
  if (filters.position) {
    query.position = filters.position;
  }

  return Staff.find(query).sort({ joiningDate: -1 });
};

/**
 * Service: Get staff profile by ID.
 */
export const getStaffById = async (id: string): Promise<IStaff> => {
  validateObjectId(id, 'Staff');
  const staff = await Staff.findById(id);
  if (!staff) {
    throw ApiError.notFound(`Staff profile with ID '${id}' not found`);
  }
  return staff;
};

/**
 * Service: Update staff profile details.
 */
export const updateStaff = async (
  id: string,
  data: {
    name?: string;
    phone?: string;
    position?: 'Manager' | 'Waiter' | 'Chef' | 'Cashier';
    salary?: number;
    joiningDate?: Date;
  }
): Promise<IStaff> => {
  validateObjectId(id, 'Staff');

  const staff = await Staff.findById(id);
  if (!staff) {
    throw ApiError.notFound(`Staff profile with ID '${id}' not found`);
  }

  if (data.name !== undefined) {
    if (data.name.trim() === '') {
      throw ApiError.badRequest('Name cannot be empty');
    }
    staff.name = data.name.trim();
  }

  if (data.phone !== undefined) {
    if (data.phone.trim() === '') {
      throw ApiError.badRequest('Phone number cannot be empty');
    }
    staff.phone = data.phone.trim();
  }

  if (data.position !== undefined) {
    const validPositions = ['Manager', 'Waiter', 'Chef', 'Cashier'];
    if (!validPositions.includes(data.position)) {
      throw ApiError.badRequest(`Position must be one of: ${validPositions.join(', ')}`);
    }
    staff.position = data.position;
  }

  if (data.salary !== undefined) {
    if (data.salary < 0) {
      throw ApiError.badRequest('Salary cannot be negative');
    }
    staff.salary = data.salary;
  }

  if (data.joiningDate !== undefined) {
    staff.joiningDate = data.joiningDate;
  }

  await staff.save();
  return staff;
};

/**
 * Service: Delete staff profile.
 */
export const deleteStaff = async (id: string): Promise<void> => {
  validateObjectId(id, 'Staff');
  const result = await Staff.findByIdAndDelete(id);
  if (!result) {
    throw ApiError.notFound(`Staff profile with ID '${id}' not found`);
  }
};
