// Save this as: prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - remove if you want to keep existing data)
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        isAdmin: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        password: hashedPassword,
        isAdmin: false,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        password: hashedPassword,
        isAdmin: false,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        password: hashedPassword,
        isAdmin: false,
      },
    }),
    prisma.user.create({
      data: {
        email: 'alice.johnson@example.com',
        name: 'Alice Johnson',
        password: hashedPassword,
        isAdmin: false,
      },
    }),
  ]);

  // Create Sessions for some users
  console.log('🔐 Creating sessions...');
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

  await Promise.all([
    prisma.session.create({
      data: {
        userId: users[1].id, // John Doe
        expiresAt: futureDate,
      },
    }),
    prisma.session.create({
      data: {
        userId: users[2].id, // Jane Smith
        expiresAt: futureDate,
      },
    }),
  ]);

  // Create Categories
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest gadgets and electronic devices',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel for all occasions',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Books',
        slug: 'books',
        description: 'Educational and entertainment books',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Everything for your home and garden',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Sports equipment and outdoor gear',
      },
    }),
  ]);

  // Create Products
  console.log('📦 Creating products...');
  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 129.99,
        imageUrl: 'https://example.com/headphones.jpg',
        stockQuantity: 50,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smartphone 128GB',
        description: 'Latest smartphone with advanced camera and long battery life',
        price: 699.99,
        imageUrl: 'https://example.com/smartphone.jpg',
        stockQuantity: 25,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Laptop Stand',
        description: 'Ergonomic adjustable laptop stand for better posture',
        price: 39.99,
        imageUrl: 'https://example.com/laptop-stand.jpg',
        stockQuantity: 100,
        categoryId: categories[0].id,
      },
    }),
    
    // Clothing
    prisma.product.create({
      data: {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt available in multiple colors',
        price: 19.99,
        imageUrl: 'https://example.com/tshirt.jpg',
        stockQuantity: 200,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Denim Jeans',
        description: 'Classic fit denim jeans with premium quality fabric',
        price: 79.99,
        imageUrl: 'https://example.com/jeans.jpg',
        stockQuantity: 75,
        categoryId: categories[1].id,
      },
    }),
    
    // Books
    prisma.product.create({
      data: {
        name: 'JavaScript: The Complete Guide',
        description: 'Comprehensive guide to modern JavaScript programming',
        price: 45.99,
        imageUrl: 'https://example.com/js-book.jpg',
        stockQuantity: 30,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'The Art of War',
        description: 'Classic strategy book by Sun Tzu',
        price: 12.99,
        imageUrl: 'https://example.com/art-of-war.jpg',
        stockQuantity: 60,
        categoryId: categories[2].id,
      },
    }),
    
    // Home & Garden
    prisma.product.create({
      data: {
        name: 'Indoor Plant Pot Set',
        description: 'Set of 3 ceramic plant pots with drainage holes',
        price: 24.99,
        imageUrl: 'https://example.com/plant-pots.jpg',
        stockQuantity: 40,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'LED Desk Lamp',
        description: 'Adjustable LED desk lamp with touch controls',
        price: 34.99,
        imageUrl: 'https://example.com/desk-lamp.jpg',
        stockQuantity: 65,
        categoryId: categories[3].id,
      },
    }),
    
    // Sports & Outdoors
    prisma.product.create({
      data: {
        name: 'Yoga Mat',
        description: 'Non-slip exercise yoga mat with carrying strap',
        price: 29.99,
        imageUrl: 'https://example.com/yoga-mat.jpg',
        stockQuantity: 80,
        categoryId: categories[4].id,
      },
    }),
  ]);

  // Create Cart Items
  console.log('🛒 Creating cart items...');
  await Promise.all([
    prisma.cartItem.create({
      data: {
        userId: users[1].id, // John Doe
        productId: products[0].id, // Headphones
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: users[1].id, // John Doe
        productId: products[3].id, // T-Shirt
        quantity: 2,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: users[2].id, // Jane Smith
        productId: products[1].id, // Smartphone
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: users[3].id, // Bob Wilson
        productId: products[9].id, // Yoga Mat
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: users[3].id, // Bob Wilson
        productId: products[5].id, // JavaScript book
        quantity: 1,
      },
    }),
  ]);

  // Create Orders
  console.log('📋 Creating orders...');
  const orders = await Promise.all([
    // Completed order for Jane Smith
    prisma.order.create({
      data: {
        userId: users[2].id, // Jane Smith
        totalAmount: 149.98,
        status: 'DELIVERED',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        billingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        paymentIntentId: 'pi_1234567890',
      },
    }),
    // Pending order for Bob Wilson
    prisma.order.create({
      data: {
        userId: users[3].id, // Bob Wilson
        totalAmount: 59.98,
        status: 'PENDING',
        shippingAddress: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
        },
        billingAddress: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
        },
      },
    }),
    // Shipped order for Alice Johnson
    prisma.order.create({
      data: {
        userId: users[4].id, // Alice Johnson
        totalAmount: 104.98,
        status: 'SHIPPED',
        shippingAddress: {
          street: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
        },
        billingAddress: {
          street: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
        },
        paymentIntentId: 'pi_0987654321',
      },
    }),
  ]);

  // Create Order Items
  console.log('📋 Creating order items...');
  await Promise.all([
    // Items for Jane's delivered order
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id, // Headphones
        quantity: 1,
        priceAtPurchase: 129.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[3].id, // T-Shirt
        quantity: 1,
        priceAtPurchase: 19.99,
      },
    }),
    
    // Items for Bob's pending order
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[9].id, // Yoga Mat
        quantity: 2,
        priceAtPurchase: 29.99,
      },
    }),
    
    // Items for Alice's shipped order
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        productId: products[4].id, // Jeans
        quantity: 1,
        priceAtPurchase: 79.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        productId: products[7].id, // Plant Pots
        quantity: 1,
        priceAtPurchase: 24.99,
      },
    }),
  ]);

  console.log('✅ Seed completed successfully!');
  console.log(`
📊 Summary:
- Users: ${users.length}
- Categories: ${categories.length}
- Products: ${products.length}
- Orders: ${orders.length}
- Sessions: 2
- Cart Items: 5
- Order Items: 5

🔑 Test Credentials:
- Admin: admin@example.com / password123
- User: john.doe@example.com / password123
- User: jane.smith@example.com / password123
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });