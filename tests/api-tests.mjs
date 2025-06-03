const BASE_URL = 'http://localhost:5173'; // Replace with your SvelteKit app's URL
const VERBOSE = true; // Set to true for more detailed logging

// --- Globals for testing state ---
let testsPassed = 0;
let testsFailed = 0;
let sessionCookie = null; // To store the sessionId cookie

// --- Helper Functions ---

/**
 * Simple function to parse the 'Set-Cookie' header and extract the session ID.
 * This is a basic parser; a more robust one might be needed for complex cookie attributes.
 * @param {string} setCookieHeader - The value of the 'Set-Cookie' header.
 * @returns {string|null} The cookie string (e.g., "sessionId=value") or null.
 */
function parseSessionCookie(setCookieHeader) {
  if (!setCookieHeader) return null;
  // Split by comma for multiple cookies, then find the one starting with sessionId
  const cookies = setCookieHeader.split(',');
  const sessionCookieStr = cookies.find(cookie => cookie.trim().startsWith('sessionId='));
  if (sessionCookieStr) {
    return sessionCookieStr.split(';')[0].trim(); // Get "sessionId=value" part
  }
  return null;
}

/**
 * Makes an HTTP request.
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
 * @param {string} path - API endpoint path (e.g., '/api/auth/login').
 * @param {object|null} body - Request body for POST/PUT.
 * @param {object} additionalHeaders - Any additional headers.
 * @param {boolean} isFormData - Set to true if the body is FormData.
 * @returns {Promise<{status: number, headers: Headers, data: object|string|null, response: Response}>}
 */
async function request(method, path, body = null, additionalHeaders = {}, isFormData = false) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    ...additionalHeaders,
  };

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  if (VERBOSE) {
    console.log(`\n  🚀 Making ${method} request to ${url}`);
    if (body) console.log(`     Body: ${isFormData ? '[FormData]' : JSON.stringify(body)}`);
    if (sessionCookie) console.log(`     With Cookie: ${sessionCookie}`);
  }

  try {
    const response = await fetch(url, options);
    const responseHeaders = response.headers;
    let responseData = null;

    // Attempt to parse Set-Cookie for login/session creation
    const setCookieHeader = responseHeaders.get('set-cookie');
    if (setCookieHeader) {
      const parsedCookie = parseSessionCookie(setCookieHeader);
      if (parsedCookie && parsedCookie.startsWith('sessionId=')) {
         // If a new sessionId is set (e.g. after login), update it.
         // If the cookie is being cleared (e.g. 'sessionId=; Max-Age=0'), clear it.
        if (parsedCookie.includes('Max-Age=0') || parsedCookie.includes('expires=Thu, 01 Jan 1970')) {
            sessionCookie = null;
            if (VERBOSE) console.log('     🍪 Session cookie cleared.');
        } else {
            sessionCookie = parsedCookie;
            if (VERBOSE) console.log(`     🍪 Session cookie stored: ${sessionCookie}`);
        }
      }
    }


    const contentType = responseHeaders.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text(); // Or handle other content types
    }

    if (VERBOSE) {
      console.log(`  ➡️ Response Status: ${response.status}`);
      if (typeof responseData === 'object') {
        console.log(`     Response Data: ${JSON.stringify(responseData, null, 2)}`);
      } else {
        console.log(`     Response Data: ${responseData.substring(0, 100)}${responseData.length > 100 ? '...' : ''}`);
      }
    }

    return { status: response.status, headers: responseHeaders, data: responseData, response };
  } catch (error) {
    console.error(`  ❌ Error during request to ${url}:`, error.message);
    return { status: 0, headers: new Headers(), data: { message: error.message }, response: null };
  }
}

// --- Assertion Helpers ---
const expect = (actual) => ({
  toBe: (expected, message = `Expected ${actual} to be ${expected}`) => {
    if (actual !== expected) throw new Error(message);
  },
  toHaveProperty: (prop, message = `Expected object to have property '${prop}'`) => {
    if (typeof actual !== 'object' || actual === null || !Object.prototype.hasOwnProperty.call(actual, prop)) {
      throw new Error(message);
    }
  },
  toBeOkay: (message = `Expected status code to be 2xx or 3xx`) => {
      if (typeof actual !== 'number' || actual < 200 || actual >= 400) {
          throw new Error(message + `. Received: ${actual}`);
      }
  },
  toBeType: (type, message = `Expected type to be ${type}`) => {
    if (typeof actual !== type) throw new Error(message + `. Received type: ${typeof actual}`);
  },
  toBeInstanceOf: (expectedClass, message = `Expected to be instance of ${expectedClass.name}`) => {
    if (!(actual instanceof expectedClass)) throw new Error(message);
  }
  // Add more assertions as needed (e.g., .toEqual for deep object comparison)
});

// --- Test Runner ---
const testSuites = [];

/**
 * Defines a test suite.
 * @param {string} suiteName - Name of the test suite.
 * @param {function} testsFn - Function containing test definitions.
 */
function describe(suiteName, testsFn) {
  testSuites.push({ name: suiteName, testsFn });
}

/**
 * Defines an individual test case.
 * @param {string} description - Description of the test.
 * @param {function} asyncTestFn - Asynchronous function containing the test logic.
 */
async function test(description, asyncTestFn) {
  console.log(`\n  🧪 Running test: ${description}`);
  try {
    await asyncTestFn();
    console.log(`  ✅ PASSED: ${description}`);
    testsPassed++;
  } catch (error) {
    console.error(`  ❌ FAILED: ${description}`);
    console.error(`     Error: ${error.message}`);
    if (error.stack && VERBOSE) console.error(`     Stack: ${error.stack}`);
    testsFailed++;
  }
}

/**
 * Runs all defined test suites.
 */
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  const startTime = Date.now();

  for (const suite of testSuites) {
    console.log(`\n--- Test Suite: ${suite.name} ---`);
    // Reset session cookie before specific suites if needed, e.g., auth suite
    // if (suite.name === 'Authentication Endpoints') sessionCookie = null;
    await suite.testsFn();
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log('\n\n--- Test Summary ---');
  console.log(`Total tests run: ${testsPassed + testsFailed}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`⏱️ Duration: ${duration.toFixed(2)}s`);

  if (testsFailed > 0) {
    process.exitCode = 1; // Indicate failure to CI or other scripts
  }
}

// --- Test Definitions ---

// Example User Credentials (use .env or a config file for real tests)
const TEST_USER_EMAIL = `testuser_${Date.now()}@example.com`;
const TEST_USER_PASSWORD = 'password123';
const TEST_USER_NAME = 'Test User';

let ADMIN_USER_EMAIL = `admin_${Date.now()}@example.com`;
let ADMIN_USER_PASSWORD = 'adminpassword';
let ADMIN_USER_NAME = 'Admin User';

let createdUserId = null;
let createdCategoryId = null;
let createdProductId = null;

describe('Authentication Endpoints', () => {
  // Clear session before auth tests
  sessionCookie = null;

  test('POST /api/auth/register - should register a new user', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: TEST_USER_NAME,
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('user');
    expect(res.data.user.email).toBe(TEST_USER_EMAIL);
    createdUserId = res.data.user.id; // Save for later tests if needed
  });

  test('POST /api/auth/login - should log in the registered user', async () => {
    // Ensure no active session from registration if it auto-logs in
    sessionCookie = null;

    const formData = new FormData();
    formData.append('email', TEST_USER_EMAIL);
    formData.append('password', TEST_USER_PASSWORD);

    const res = await request('POST', '/api/auth/login', formData, {}, true);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('user');
    expect(res.data.user.email).toBe(TEST_USER_EMAIL);
    expect(sessionCookie).toBeType('string', 'Session cookie should be set');
  });

  test('GET /api/auth/me - should get current user details', async () => {
    // Assumes login was successful and sessionCookie is set
    if (!sessionCookie) throw new Error("Session cookie not set, prerequisite test (login) might have failed.");
    const res = await request('GET', '/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('user');
    expect(res.data.user.email).toBe(TEST_USER_EMAIL);
  });

  test('POST /api/auth/logout - should log out the user', async () => {
    if (!sessionCookie) throw new Error("Session cookie not set, cannot test logout.");
    const res = await request('POST', '/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.data.message).toBe('Logout successful');
    expect(sessionCookie).toBe(null, 'Session cookie should be cleared after logout');
  });

  test('GET /api/auth/me - should not get user details after logout', async () => {
    const res = await request('GET', '/api/auth/me');
    // Depending on your /api/auth/me implementation for logged-out users:
    // It might return 401, or 200 with user: null. Adjust assertion accordingly.
    // Based on your docs, it's 200 with user: null or 401.
    // The hooks.server.ts will likely make event.locals.user undefined, leading to this.
    if (res.status === 200) {
        expect(res.data.user).toBe(null);
    } else {
        expect(res.status).toBe(401); // Or whatever your app returns
    }
  });
});

describe('Admin Setup and Login', () => {
    test('POST /api/auth/register - should register an admin user (for testing purposes)', async () => {
        sessionCookie = null; // Ensure no prior session
        const res = await request('POST', '/api/auth/register', {
            name: ADMIN_USER_NAME,
            email: ADMIN_USER_EMAIL,
            password: ADMIN_USER_PASSWORD,
            // You'll need a way to make this user an admin.
            // For testing, you might have a backdoor, or manually set isAdmin=true in DB after this.
            // Or, your register endpoint might have a special key for admin creation in dev.
            // For now, we assume this user needs to be manually promoted or tests for admin actions will fail.
        });
        expect(res.status).toBe(201);
        // Manually set this user as admin in your DB for tests to pass, or modify registration
        console.warn(`  ⚠️  MANUAL STEP: Ensure user ${ADMIN_USER_EMAIL} is an admin in the database for admin tests to pass.`);
    });

    test('POST /api/auth/login - Admin login', async () => {
        sessionCookie = null;
        const formData = new FormData();
        formData.append('email', ADMIN_USER_EMAIL);
        formData.append('password', ADMIN_USER_PASSWORD);
        const res = await request('POST', '/api/auth/login', formData, {}, true);
        expect(res.status).toBe(200);
        expect(res.data.user.email).toBe(ADMIN_USER_EMAIL);
        // Assuming login sets isAdmin correctly if the user is an admin in DB
        // expect(res.data.user.isAdmin).toBe(true); // This depends on your DB state
        if (!res.data.user.isAdmin) {
            console.warn(`  ⚠️  Admin user ${ADMIN_USER_EMAIL} is not flagged as admin after login. Admin tests might fail.`);
        }
        expect(sessionCookie).toBeType('string');
    });
});


describe('Categories Endpoints', () => {
  // Assumes admin is logged in from the 'Admin Setup and Login' suite
  const categoryName = `Test Category ${Date.now()}`;
  const categoryDesc = 'A category created for testing purposes.';

  test('POST /api/categories - should create a new category (Admin)', async () => {
    if (!sessionCookie) throw new Error("Admin session cookie not set. Prerequisite admin login test might have failed or admin status is not set.");
    const res = await request('POST', '/api/categories', {
      name: categoryName,
      description: categoryDesc,
    });
    // If admin is not truly admin, this will be 403
    expect(res.status).toBe(201, `Failed to create category. Ensure admin user '${ADMIN_USER_EMAIL}' is an admin and logged in.`);
    expect(res.data).toHaveProperty('id');
    expect(res.data.name).toBe(categoryName);
    createdCategoryId = res.data.id;
  });

  test('GET /api/categories - should retrieve all categories', async () => {
    // No auth needed for this one as per docs
    const tempSessionCookie = sessionCookie; // Store admin cookie
    sessionCookie = null; // Test without auth
    const res = await request('GET', '/api/categories');
    expect(res.status).toBe(200);
    expect(res.data).toBeInstanceOf(Array);
    if (res.data.length > 0 && createdCategoryId) {
      const found = res.data.find(cat => cat.id === createdCategoryId);
      expect(found).toBeType('object', `Newly created category (ID: ${createdCategoryId}) should be in the list.`);
      if (found) expect(found.name).toBe(categoryName);
    }
    sessionCookie = tempSessionCookie; // Restore admin cookie
  });

  test('GET /api/categories/{slug} - should retrieve a specific category by slug', async () => {
    if (!createdCategoryId) throw new Error("Category ID not available from create test.");
    // Fetch the created category again to get its slug (or derive it if logic is simple)
    const catData = await request('GET', `/api/categories`); // Not ideal, better to get slug from creation response
    const createdCat = catData.data.find(c => c.id === createdCategoryId);
    if (!createdCat || !createdCat.slug) throw new Error("Could not find created category or its slug.");

    const res = await request('GET', `/api/categories/${createdCat.slug}`);
    expect(res.status).toBe(200);
    expect(res.data.id).toBe(createdCategoryId);
    expect(res.data.name).toBe(categoryName);
  });

  // Add tests for PUT /api/categories/id/{id} and DELETE /api/categories/id/{id} (Admin)
  // Remember to use createdCategoryId
});

describe('Products Endpoints', () => {
  // Assumes admin is logged in and a category (createdCategoryId) exists

  const productName = `Test Product ${Date.now()}`;
  const productPrice = 19.99;
  const productStock = 10;

  test('POST /api/products - should create a new product (Admin)', async () => {
    if (!sessionCookie) throw new Error("Admin session cookie not set.");
    if (!createdCategoryId) throw new Error("Category ID not available for product creation.");

    const res = await request('POST', '/api/products', {
      name: productName,
      description: 'A test product.',
      price: productPrice,
      stockQuantity: productStock,
      categoryId: createdCategoryId,
    });
    expect(res.status).toBe(201, `Failed to create product. Ensure admin user is an admin and logged in. Response: ${JSON.stringify(res.data)}`);
    expect(res.data).toHaveProperty('id');
    expect(res.data.name).toBe(productName);
    createdProductId = res.data.id;
  });

  test('GET /api/products - should retrieve all products (with pagination)', async () => {
    const res = await request('GET', '/api/products?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('products');
    expect(res.data).toHaveProperty('currentPage');
    expect(res.data.products).toBeInstanceOf(Array);
    if (createdProductId && res.data.products.length > 0) {
        // Check if the created product is in the list (might be on another page)
        // For simplicity, we'll just check if the endpoint works.
        // A more thorough test would iterate through pages or filter.
    }
  });

  test('GET /api/products/{id} - should retrieve a specific product by ID', async () => {
    if (!createdProductId) throw new Error("Product ID not available from create test.");
    const res = await request('GET', `/api/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.data.id).toBe(createdProductId);
    expect(res.data.name).toBe(productName);
  });

  // Add tests for PUT /api/products/{id} and DELETE /api/products/{id} (Admin)
});


describe('Cart Endpoints', () => {
    // Login as a regular user first
    let regularUserSessionCookie = null;
    let cartItemId = null;

    test('Setup: Login as regular user for cart tests', async () => {
        sessionCookie = null; // Clear any admin session
        const formData = new FormData();
        formData.append('email', TEST_USER_EMAIL);
        formData.append('password', TEST_USER_PASSWORD);
        const loginRes = await request('POST', '/api/auth/login', formData, {}, true);
        expect(loginRes.status).toBe(200);
        regularUserSessionCookie = sessionCookie; // sessionCookie is globally updated
        if (!regularUserSessionCookie) throw new Error("Regular user login failed for cart tests.");
    });

    test('POST /api/cart - should add an item to the cart', async () => {
        if (!createdProductId) throw new Error("Product ID not available for adding to cart.");
        if (!regularUserSessionCookie) throw new Error("Regular user session not active.");
        sessionCookie = regularUserSessionCookie; // Ensure correct session

        const res = await request('POST', '/api/cart', {
            productId: createdProductId,
            quantity: 1,
        });
        expect(res.status).toBe(201); // Or 200 if item already existed and quantity was updated
        expect(res.data).toHaveProperty('id');
        expect(res.data.productId).toBe(createdProductId);
        expect(res.data.quantity).toBe(1);
        cartItemId = res.data.id;
    });

    test('GET /api/cart - should retrieve the user\'s cart', async () => {
        if (!regularUserSessionCookie) throw new Error("Regular user session not active.");
        sessionCookie = regularUserSessionCookie;

        const res = await request('GET', '/api/cart');
        expect(res.status).toBe(200);
        expect(res.data).toBeInstanceOf(Array);
        const itemInCart = res.data.find(item => item.id === cartItemId);
        expect(itemInCart).toBeType('object');
        if (itemInCart) {
            expect(itemInCart.quantity).toBe(1);
        }
    });

    test('PUT /api/cart/{itemId} - should update quantity of a specific cart item', async () => {
        if (!cartItemId) throw new Error("Cart item ID not available.");
        if (!regularUserSessionCookie) throw new Error("Regular user session not active.");
        sessionCookie = regularUserSessionCookie;

        const res = await request('PUT', `/api/cart/${cartItemId}`, { quantity: 3 });
        expect(res.status).toBe(200);
        expect(res.data.quantity).toBe(3);
    });

    test('DELETE /api/cart/{itemId} - should remove a specific item from cart', async () => {
        if (!cartItemId) throw new Error("Cart item ID not available.");
        if (!regularUserSessionCookie) throw new Error("Regular user session not active.");
        sessionCookie = regularUserSessionCookie;

        const res = await request('DELETE', `/api/cart/${cartItemId}`);
        expect(res.status).toBe(200);
        expect(res.data.message).toBeType('string');

        // Verify item is gone
        const cartRes = await request('GET', '/api/cart');
        const itemInCart = cartRes.data.find(item => item.id === cartItemId);
        expect(itemInCart).toBe(undefined);
    });

    test('DELETE /api/cart - should clear the entire cart', async () => {
        if (!regularUserSessionCookie) throw new Error("Regular user session not active.");
        sessionCookie = regularUserSessionCookie;
        // Add an item first to ensure cart is not empty
        await request('POST', '/api/cart', { productId: createdProductId, quantity: 1 });

        const res = await request('DELETE', '/api/cart');
        expect(res.status).toBe(200);
        expect(res.data.message).toBe('Cart cleared successfully.');

        const cartRes = await request('GET', '/api/cart');
        expect(cartRes.data.length).toBe(0);
    });
});


describe('Orders Endpoints', () => {
    // Assumes regular user (TEST_USER_EMAIL) is logged in and has items in cart (or we add them)
    // Assumes a product (createdProductId) exists
    let orderId = null;

    test('Setup: Ensure user is logged in and cart has an item', async () => {
        sessionCookie = null; // Clear any previous session
        const formData = new FormData();
        formData.append('email', TEST_USER_EMAIL);
        formData.append('password', TEST_USER_PASSWORD);
        const loginRes = await request('POST', '/api/auth/login', formData, {}, true);
        expect(loginRes.status).toBe(200);
        if (!sessionCookie) throw new Error("User login failed for order tests.");

        if (!createdProductId) throw new Error("Product ID is required for order test setup.");
        // Clear cart first, then add one item
        await request('DELETE', '/api/cart');
        const addToCartRes = await request('POST', '/api/cart', { productId: createdProductId, quantity: 1 });
        expect(addToCartRes.status).toBe(201);
    });

    test('POST /api/orders - should create a new order', async () => {
        if (!sessionCookie) throw new Error("User not logged in for creating order.");

        const shippingAddress = { street: "123 Test St", city: "Testville", zip: "12345", country: "Testland", name: "Test User", phone: "555-0101" };
        const res = await request('POST', '/api/orders', {
            shippingAddress: shippingAddress,
            billingAddress: shippingAddress, // Can be different
            // paymentIntentId: "pi_test_xxxxxxxx" // Optional
        });
        expect(res.status).toBe(201, `Order creation failed. Response: ${JSON.stringify(res.data)}`);
        expect(res.data).toHaveProperty('id');
        orderId = res.data.id;
        expect(res.data.totalAmount).toBeType('string'); // Price of one item
        expect(res.data.items.length).toBe(1);
        expect(res.data.items[0].productId).toBe(createdProductId);

        // Verify cart is cleared
        const cartRes = await request('GET', '/api/cart');
        expect(cartRes.data.length).toBe(0, "Cart should be empty after order creation.");
    });

    test('GET /api/orders - should retrieve current user\'s orders', async () => {
        if (!sessionCookie) throw new Error("User not logged in for fetching orders.");
        if (!orderId) throw new Error("Order ID not available from create order test.");

        const res = await request('GET', '/api/orders');
        expect(res.status).toBe(200);
        expect(res.data).toBeInstanceOf(Array);
        const foundOrder = res.data.find(o => o.id === orderId);
        expect(foundOrder).toBeType('object');
    });

    test('GET /api/orders/{id} - should retrieve a specific order', async () => {
        if (!sessionCookie) throw new Error("User not logged in for fetching specific order.");
        if (!orderId) throw new Error("Order ID not available.");

        const res = await request('GET', `/api/orders/${orderId}`);
        expect(res.status).toBe(200);
        expect(res.data.id).toBe(orderId);
    });
});


describe('Admin Endpoints - Post-creation cleanup (Optional)', () => {
    // Login as admin first
    test('Setup: Admin Login for cleanup', async () => {
        sessionCookie = null;
        const formData = new FormData();
        formData.append('email', ADMIN_USER_EMAIL);
        formData.append('password', ADMIN_USER_PASSWORD);
        const res = await request('POST', '/api/auth/login', formData, {}, true);
        expect(res.status).toBe(200);
        if (!sessionCookie) throw new Error("Admin login failed for cleanup.");
        // Add a check here if res.data.user.isAdmin is false, then admin tests will fail.
        if (!res.data.user.isAdmin) {
            console.warn(`  ⚠️  User ${ADMIN_USER_EMAIL} is not an admin. Cleanup tests might fail or be skipped.`);
        }
    });

    test('DELETE /api/products/{id} - Admin cleanup created product', async () => {
        if (!sessionCookie) { console.warn("Skipping product cleanup: Admin not logged in."); return; }
        if (!createdProductId) { console.warn("Skipping product cleanup: No product ID."); return; }

        const res = await request('DELETE', `/api/products/${createdProductId}`);
        // This might fail if the product is in an order and schema restricts it.
        if (res.status === 409) {
            console.warn(`  ⚠️  Could not delete product ${createdProductId} due to conflict (likely in an order). Manual cleanup may be needed.`);
        } else {
            expect(res.status).toBe(200, `Product deletion failed. Response: ${JSON.stringify(res.data)}`);
        }
    });

    test('DELETE /api/categories/id/{id} - Admin cleanup created category', async () => {
        if (!sessionCookie) { console.warn("Skipping category cleanup: Admin not logged in."); return; }
        if (!createdCategoryId) { console.warn("Skipping category cleanup: No category ID."); return; }

        const res = await request('DELETE', `/api/categories/id/${createdCategoryId}`);
         // This might fail if the category still has products (if product deletion failed or other products exist)
        if (res.status === 409) {
            console.warn(`  ⚠️  Could not delete category ${createdCategoryId} due to conflict (likely still has products). Manual cleanup may be needed.`);
        } else {
            expect(res.status).toBe(200, `Category deletion failed. Response: ${JSON.stringify(res.data)}`);
        }
    });

    // Note: Deleting users is usually not done in tests unless specifically testing that feature,
    // as it can affect subsequent test runs if not handled carefully.
});


// --- Start the test runner ---
runTests();

