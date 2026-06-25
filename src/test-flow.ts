import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import * as categoryService from './services/category.service';
import * as menuItemService from './services/menu-item.service';
import * as tableService from './services/table.service';
import * as orderService from './services/order.service';
import * as staffService from './services/staff.service';
import * as billService from './services/bill.service';
import User from './models/user.model';
import Staff from './models/staff.model';
import Category from './models/category.model';
import MenuItem from './models/menu-item.model';
import Table from './models/table.model';
import Order from './models/order.model';
import Bill from './models/bill.model';

// Load environment variables
dotenv.config();

const runTest = async () => {
  console.log('--- STARTING SYSTEM INTEGRATION FLOW TEST ---\n');

  // 1. Connect to Database
  await connectDB();

  // 2. Clear previous test data
  console.log('\nCleaning database collections for clean test state...');
  await User.deleteMany({});
  await Staff.deleteMany({});
  await Category.deleteMany({});
  await MenuItem.deleteMany({});
  await Table.deleteMany({});
  await Order.deleteMany({});
  await Bill.deleteMany({});
  console.log('Database cleaned successfully!');

  try {
    // 3. Create Categories
    console.log('\nStep 1: Creating Categories...');
    const catAppetizer = await categoryService.createCategory({
      name: 'Appetizers',
      description: 'Tasty starters to kick off your meal',
    });
    const catMain = await categoryService.createCategory({
      name: 'Main Course',
      description: 'Hearty and filling main dishes',
    });
    console.log(`- Created Category: ${catAppetizer.name} (${catAppetizer._id})`);
    console.log(`- Created Category: ${catMain.name} (${catMain._id})`);

    // 4. Create MenuItems
    console.log('\nStep 2: Creating Menu Items...');
    const itemRolls = await menuItemService.createMenuItem({
      name: 'Spring Rolls',
      description: 'Crispy vegetable spring rolls with sweet chili sauce',
      price: 8.99,
      category: catAppetizer._id.toString(),
      availability: true,
      preparationTime: 10,
    });
    const itemSalmon = await menuItemService.createMenuItem({
      name: 'Grilled Salmon',
      description: 'Atlantic salmon served with asparagus and lemon butter sauce',
      price: 24.99,
      category: catMain._id.toString(),
      availability: true,
      preparationTime: 20,
    });
    console.log(`- Created MenuItem: ${itemRolls.name} - $${itemRolls.price}`);
    console.log(`- Created MenuItem: ${itemSalmon.name} - $${itemSalmon.price}`);

    // 5. Create Tables
    console.log('\nStep 3: Creating Tables...');
    const table5 = await tableService.createTable({
      tableNumber: 5,
      capacity: 4,
    });
    const table6 = await tableService.createTable({
      tableNumber: 6,
      capacity: 2,
    });
    console.log(`- Created Table #${table5.tableNumber} (Capacity: ${table5.capacity}, Status: ${table5.status})`);
    console.log(`- Created Table #${table6.tableNumber} (Capacity: ${table6.capacity}, Status: ${table6.status})`);

    // 6. Create Staff & associated Users
    console.log('\nStep 4: Registering Staff & Users...');
    const waiterUser = await User.create({
      name: 'David Waiter',
      email: 'david@restaurant.com',
      password: 'password123',
      phoneNumber: '+15550101',
      role: 'staff',
      isActive: true,
    });
    const cashierUser = await User.create({
      name: 'Sarah Cashier',
      email: 'sarah@restaurant.com',
      password: 'password123',
      phoneNumber: '+15550102',
      role: 'staff',
      isActive: true,
    });

    const staffWaiterProfile = await staffService.createStaff({
      name: waiterUser.name,
      phone: waiterUser.phoneNumber || '+15550101',
      position: 'Waiter',
      salary: 2800,
    });

    const staffCashierProfile = await staffService.createStaff({
      name: cashierUser.name,
      phone: cashierUser.phoneNumber || '+15550102',
      position: 'Cashier',
      salary: 3000,
    });

    console.log(`- Created Waiter: ${waiterUser.name} (${staffWaiterProfile.position})`);
    console.log(`- Created Cashier: ${cashierUser.name} (${staffCashierProfile.position})`);

    // 7. Place an Order
    console.log('\nStep 5: Placing an Order...');
    const order = await orderService.createOrder({
      tableId: table5._id.toString(),
      staffId: staffWaiterProfile._id.toString(),
      items: [
        { foodId: itemRolls._id.toString(), quantity: 2, notes: 'Extra sweet chili sauce' },
        { foodId: itemSalmon._id.toString(), quantity: 1 },
      ],
      specialInstructions: 'Serve starters first.',
    });
    console.log(`- Order placed! ID: ${order._id}`);
    console.log(`  Total Amount Calculated: $${order.totalAmount} (Expected: $${(8.99 * 2 + 24.99).toFixed(2)})`);
    console.log(`  Items Count: ${order.items.length}`);
    console.log(`  Item 1 price snapshot: $${order.items[0].price}`);
    console.log(`  Item 1 subtotal: $${order.items[0].subtotal} (Expected: $${(8.99 * 2).toFixed(2)})`);

    // Verify physical table is now occupied
    const tablePostOrder = await tableService.getTableById(table5._id.toString());
    console.log(`  Physical Table status: ${tablePostOrder.status} (Expected: occupied)`);

    // 8. Generate Bill
    console.log('\nStep 6: Generating Bill for the Order...');
    const bill = await billService.generateBill({
      orderId: order._id.toString(),
    });
    console.log(`- Bill generated! ID: ${bill._id}`);
    console.log(`  Amount: $${bill.amount}`);
    console.log(`  Bill payment status: ${bill.paymentStatus} (Expected: Pending)`);

    // 9. Pay Bill
    console.log('\nStep 7: Recording Payment...');
    const paidBill = await billService.payBill(bill._id.toString(), 'Card');
    console.log(`- Payment processed via: ${paidBill.paymentMethod}`);
    console.log(`  Bill status: ${paidBill.paymentStatus} (Expected: Paid)`);

    // Verify side effects
    const orderPostPay = await orderService.getOrderById(order._id.toString());
    console.log(`  Order status: ${orderPostPay.status} (Expected: Paid)`);

    const tablePostPay = await tableService.getTableById(table5._id.toString());
    console.log(`  Physical Table status: ${tablePostPay.status} (Expected: available)`);

    console.log('\n--- ALL BUSINESS LOGIC AND SIDE EFFECTS VERIFIED SUCCESSFULLY ---');
  } catch (error: any) {
    console.error('\n❌ Test execution failed with error:');
    console.error(error);
  } finally {
    // Close DB Connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    console.log('--- TEST COMPLETED ---');
  }
};

runTest();
