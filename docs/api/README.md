
**Base URL:** `/api`

**Authentication:**
* Most endpoints require a session cookie (`sessionId`) to be sent with the request. This cookie is automatically handled by the browser after a successful login.
* Endpoints requiring admin privileges will return a `403 Forbidden` error if the authenticated user is not an admin.

**Common Error Responses:**
* `400 Bad Request`: Invalid input, missing parameters, or validation errors.
    ```json
    { "message": "Specific error message, e.g., 'Product name is required.' or 'Invalid email format.' " }
    ```
* `401 Unauthorized`: Missing or invalid session cookie.
    ```json
    { "message": "Unauthorized: You must be logged in." }
    ```
* `403 Forbidden`: Authenticated user does not have permission (e.g., non-admin trying to access admin endpoint).
    ```json
    { "message": "Forbidden: You do not have permission." }
    ```
* `404 Not Found`: Resource not found.
    ```json
    { "message": "Resource e.g., 'Product not found.' or 'Category not found.' " }
    ```
* `409 Conflict`: Resource conflict, e.g., trying to create a category with a name that already exists.
    ```json
    { "message": "Specific conflict message, e.g., 'A category with this name already exists.' " }
    ```
* `500 Internal Server Error`: Unexpected server error.
    ```json
    { "message": "Specific error or a generic 'Failed to process request due to a server error.' " }
    ```

**Note on Decimal Types:** Fields defined as `Decimal` in Prisma (like `price`, `totalAmount`) will be serialized as strings in JSON responses to maintain precision (e.g., `"19.99"`).

---

## 1. Authentication Endpoints

### 1.1. Login

* **POST** `/api/auth/login`
* **Description:** Authenticates a user and sets a session cookie.
* **Request Body:** `application/x-www-form-urlencoded` (as per your provided code) or `application/json`
    ```json
  
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
    Or form data:
    * `email`: (string, required) User's email.
    * `password`: (string, required) User's password.
* **Response (200 OK):**
    ```json
    {
      "message": "Login successful",
      "user": {
        "id": "cuid_string_user_id",
        "email": "user@example.com",
        "name": "Test User",
        "isAdmin": false
      
      }
    }
    ```
* **Sets Cookie:** `sessionId` (HttpOnly, Secure in production, SameSite=Lax)

### 1.2. Logout

* **POST** `/api/auth/logout`
* **Description:** Logs out the current user by clearing their session.
* **Request Body:** None
* **Response (200 OK):**
    ```json
    {
      "message": "Logout successful"
    }
    ```
* **Clears Cookie:** `sessionId`

### 1.3. Register

* **POST** `/api/auth/register`
* **Description:** Creates a new user account.
* **Request Body:** `application/json`
    ```json
    {
      "name": "New User",
      "email": "newuser@example.com",
      "password": "newpassword123"
    }
    ```
* **Response (201 Created):**
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": "cuid_string_new_user_id",
        "email": "newuser@example.com",
        "name": "New User",
        "isAdmin": false
      }
    }
    ```

### 1.4. Get Current User / Session Check

* **GET** `/api/auth/me` (or similar)
* **Description:** Retrieves the currently authenticated user's details based on the session cookie.
* **Request:** None (relies on `sessionId` cookie)
* **Response (200 OK):**
    ```json
    {
      "user": {
        "id": "cuid_string_user_id",
        "email": "user@example.com",
        "name": "Test User",
        "isAdmin": false
      }
    }
    ```
* **Response (200 OK if no user / 401 Unauthorized):**
    ```json
    {
      "user": null
    }
    ```

---

## 2. Categories Endpoints

### 2.1. Get All Categories

* **GET** `/api/categories`
* **Description:** Retrieves a list of all categories.
* **Request Query Parameters:** None
* **Response (200 OK):**
    ```json
    [
      {
        "id": "cuid_string_category1",
        "name": "Electronics",
        "slug": "electronics",
        "description": "Gadgets and devices",
        "createdAt": "2023-01-01T10:00:00.000Z",
        "updatedAt": "2023-01-01T10:00:00.000Z"
      },
      {
        "id": "cuid_string_category2",
        "name": "Books",
        "slug": "books",
        "description": "Various genres of books",
        "createdAt": "2023-01-02T11:00:00.000Z",
        "updatedAt": "2023-01-02T11:00:00.000Z"
      }
    ]
    ```

### 2.2. Create New Category

* **POST** `/api/categories`
* **Description:** Creates a new category. **Admin only.**
* **Requires Authentication:** Yes (Admin)
* **Request Body:** `application/json`
    ```json
    {
      "name": "Home Appliances",
      "description": "Appliances for your home"
    }
    ```
    * `name`: (string, required) Category name.
    * `description`: (string, optional) Category description.
* **Response (201 Created):**
    ```json
    {
      "id": "cuid_string_new_category",
      "name": "Home Appliances",
      "slug": "home-appliances",
      "description": "Appliances for your home",
      "createdAt": "2023-01-03T12:00:00.000Z",
      "updatedAt": "2023-01-03T12:00:00.000Z"
    }
    ```

### 2.3. Get Category by Slug

* **GET** `/api/categories/{slug}`
* **Description:** Retrieves a single category by its slug, including its products.
* **Path Parameters:**
    * `slug`: (string, required) The URL-friendly slug of the category.
* **Response (200 OK):**
    ```json
    {
      "id": "cuid_string_category1",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Gadgets and devices",
      "createdAt": "2023-01-01T10:00:00.000Z",
      "updatedAt": "2023-01-01T10:00:00.000Z",
      "products": [
        {
          "id": "cuid_string_product1",
          "name": "Smartphone X",
          "description": "Latest model smartphone",
          "price": "699.99",
          "imageUrl": "/images/smartphone-x.jpg",
          "stockQuantity": 100,
          "createdAt": "2023-01-01T10:05:00.000Z",
          "updatedAt": "2023-01-01T10:05:00.000Z",
          "categoryId": "cuid_string_category1"
        }
      
      ]
    }
    ```

### 2.4. Update Category by ID

* **PUT** `/api/categories/id/{id}`
* **Description:** Updates an existing category. **Admin only.**
* **Requires Authentication:** Yes (Admin)
* **Path Parameters:**
    * `id`: (string, required) The CUID of the category to update.
* **Request Body:** `application/json`
    ```json
    {
      "name": "Updated Category Name",
      "description": "Updated description"
    }
    ```
    * `name`: (string, required) New category name.
    * `description`: (string, optional) New category description.
* **Response (200 OK):**
    ```json
    {
      "id": "cuid_string_category_id",
      "name": "Updated Category Name",
      "slug": "updated-category-name",
      "description": "Updated description",
      "createdAt": "...",
      "updatedAt": "..."
    }
    ```

### 2.5. Delete Category by ID

* **DELETE** `/api/categories/id/{id}`
* **Description:** Deletes a category. **Admin only.**
* **Requires Authentication:** Yes (Admin)
* **Path Parameters:**
    * `id`: (string, required) The CUID of the category to delete.
* **Response (200 OK):**
    ```json
    {
      "message": "Category {id} deleted successfully."
    }
    ```
* **Error (409 Conflict):** If the category still has products associated with it and the schema/logic prevents deletion.
    ```json
    { "message": "Cannot delete category as it still has products associated with it." }
    ```

---

## 3. Products Endpoints

### 3.1. Get All Products

* **GET** `/api/products`
* **Description:** Retrieves a list of all products, with optional filtering and pagination.
* **Request Query Parameters:**
    * `page`: (integer, optional, default: 1) Page number for pagination.
    * `limit`: (integer, optional, default: 10) Number of products per page.
    * `categorySlug`: (string, optional) Slug of a category to filter products by.
    * `search`: (string, optional) Search term to filter products by name or description.
    * `sortBy`: (string, optional, default: 'createdAt') Field to sort by (e.g., 'name', 'price', 'createdAt', 'stockQuantity').
    * `sortOrder`: (string, optional, default: 'desc') Sort order ('asc' or 'desc').
* **Response (200 OK):**
    ```json
    {
      "products": [
        {
          "id": "cuid_string_product1",
          "name": "Smartphone X",
          "description": "Latest model smartphone",
          "price": "699.99",
          "imageUrl": "/images/smartphone-x.jpg",
          "stockQuantity": 100,
          "createdAt": "2023-01-01T10:05:00.000Z",
          "updatedAt": "2023-01-01T10:05:00.000Z",
          "categoryId": "cuid_string_category1",
          "category": {
            "id": "cuid_string_category1",
            "name": "Electronics",
            "slug": "electronics",
            "description": "Gadgets and devices"
          
          }
        }
      
      ],
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 50
    }
    ```

### 3.2. Create New Product

* **POST** `/api/products`
* **Description:** Creates a new product. **Admin only.**
* **Requires Authentication:** Yes (Admin)
* **Request Body:** `application/json`
    ```json
    {
      "name": "Wireless Headphones",
      "description": "Noise-cancelling over-ear headphones",
      "price": 199.99,
      "imageUrl": "/images/headphones.jpg",
      "stockQuantity": 50,
      "categoryId": "cuid_string_category_for_electronics"
    }
    ```
    * `name`: (string, required)
    * `description`: (string, optional)
    * `price`: (number, required)
    * `imageUrl`: (string, optional)
    * `stockQuantity`: (integer, required, default: 0)
    * `categoryId`: (string, required) CUID of the category this product belongs to.
* **Response (201 Created):**
    ```json
    {
      "id": "cuid_string_new_product",
      "name": "Wireless Headphones",
      "description": "Noise-cancelling over-ear headphones",
      "price": "199.99",
      "imageUrl": "/images/headphones.jpg",
      "stockQuantity": 50,
      "createdAt": "...",
      "updatedAt": "...",
      "categoryId": "cuid_string_category_for_electronics"
    }
    ```

### 3.3. Get Product by ID

* **GET** `/api/products/{id}`
* **Description:** Retrieves a single product by its ID.
* **Path Parameters:**
    * `id`: (string, required) The CUID of the product.
* **Response (200 OK):**
    ```json
    {
      "id": "cuid_string_product1",
      "name": "Smartphone X",
      "description": "Latest model smartphone",
      "price": "699.99",
      "imageUrl": "/images/smartphone-x.jpg",
      "stockQuantity": 100,
      "createdAt": "...",
      "updatedAt": "...",
      "categoryId": "cuid_string_category1",
      "category": {
        "id": "cuid_string_category1",
        "name": "Electronics",
        "slug": "electronics",
        "description": "Gadgets and devices"
      }
    }
    ```

### 3.4. Update Product by ID

* **PUT** `/api/products/{id}`
* **Description:** Updates an existing product. **Admin only.**
* **Requires Authentication:** Yes (Admin)
* **Path Parameters:**
    * `id`: (string, required) The CUID of the product to update.
* **Request Body:** `application/json` (fields are optional, only provided fields will be updated)
    ```json
    {
      "name": "Smartphone X Pro",
      "price": 799.99,
      "stockQuantity": 75,
      "categoryId": "cuid_string_new_category_id"
    }
    ```
* **Response (200 OK):**
    ```json
    {
      "id": "cuid_string_product1",
      "name": "Smartphone X Pro",
      "description": "Latest model smartphone",
      "price": "799.99",
      "imageUrl": "/images/smartphone-x.jpg",
      "stockQuantity": 75,
      "createdAt": "...",
      "updatedAt": "...",
      "categoryId": "cuid_string_new_category_id"
    }
    ```

### 3.5. Delete Product by ID

* **DELETE** `/api/products/{id}`
* **Description:** Deletes a product. **Admin only.**
* **Requires Authentication:** Yes (Admin)
* **Path Parameters:**
    * `id`: (string, required) The CUID of the product to delete.
* **Response (200 OK):**
    ```json
    {
      "message": "Product {id} deleted successfully."
    }
    ```
* **Error (409 Conflict):** If the product is part of an existing order (due to `onDelete: Restrict` in schema).
    ```json
    { "message": "Cannot delete product as it is referenced in existing orders or cart items." }
    ```

---

## 4. Cart Endpoints

### 4.1. Get Current User's Cart

* **GET** `/api/cart`
* **Description:** Retrieves all items in the current user's shopping cart.
* **Requires Authentication:** Yes
* **Response (200 OK):**
    ```json
    [
      {
        "id": "cuid_string_cart_item1",
        "quantity": 2,
        "addedAt": "2023-01-10T14:20:00.000Z",
        "userId": "cuid_string_user_id",
        "productId": "cuid_string_product1",
        "product": {
          "id": "cuid_string_product1",
          "name": "Smartphone X",
          "price": "699.99",
          "imageUrl": "/images/smartphone-x.jpg",
          "stockQuantity": 98
        }
      },
      {
        "id": "cuid_string_cart_item2",
        "quantity": 1,
        "addedAt": "2023-01-10T14:25:00.000Z",
        "userId": "cuid_string_user_id",
        "productId": "cuid_string_product2",
        "product": {
          "id": "cuid_string_product2",
          "name": "Wireless Headphones",
          "price": "199.99",
          "imageUrl": "/images/headphones.jpg",
          "stockQuantity": 49
        }
      }
    ]
    ```
    If cart is empty, returns `[]`.

### 4.2. Add Item to Cart / Update Quantity

* **POST** `/api/cart`
* **Description:** Adds a product to the cart or updates its quantity if it already exists.
* **Requires Authentication:** Yes
* **Request Body:** `application/json`
    ```json
    {
      "productId": "cuid_string_product_id",
      "quantity": 1
    }
    ```
    * `productId`: (string, required) CUID of the product to add/update.
    * `quantity`: (integer, required, must be > 0) Quantity to add. If item exists, this quantity is added to the existing quantity.
* **Response (201 Created if new item, 200 OK if quantity updated):**
    ```json
    {
      "id": "cuid_string_cart_item_id",
      "quantity": 2,
      "addedAt": "...",
      "userId": "cuid_string_user_id",
      "productId": "cuid_string_product_id",
      "product": {
        "name": "Smartphone X",
        "price": "699.99",
        "imageUrl": "/images/smartphone-x.jpg"
      }
    }
    ```
* **Error (400 Bad Request):** If `stockQuantity` is insufficient.
    ```json
    { "message": "Not enough stock for [Product Name]. Available: X" }
    ```

### 4.3. Clear Entire Cart

* **DELETE** `/api/cart`
* **Description:** Removes all items from the current user's cart.
* **Requires Authentication:** Yes
* **Response (200 OK):**
    ```json
    {
      "message": "Cart cleared successfully."
    }
    ```

### 4.4. Update Specific Cart Item Quantity

* **PUT** `/api/cart/{itemId}`
* **Description:** Updates the quantity of a specific item in the cart.
* **Requires Authentication:** Yes
* **Path Parameters:**
    * `itemId`: (string, required) The CUID of the cart item to update.
* **Request Body:** `application/json`
    ```json
    {
      "quantity": 3
    }
    ```
    * `quantity`: (integer, required, must be > 0) The new total quantity for this cart item.
* **Response (200 OK):**
    ```json
    {
      "id": "cuid_string_cart_item_id",
      "quantity": 3,
      "addedAt": "...",
      "userId": "cuid_string_user_id",
      "productId": "cuid_string_product_id",
      "product": {
        "name": "Smartphone X",
        "price": "699.99",
        "imageUrl": "/images/smartphone-x.jpg"
      }
    }
    ```
* **Error (400 Bad Request):** If `stockQuantity` is insufficient for the new quantity.

### 4.5. Remove Specific Item from Cart

* **DELETE** `/api/cart/{itemId}`
* **Description:** Removes a specific item from the cart.
* **Requires Authentication:** Yes
* **Path Parameters:**
    * `itemId`: (string, required) The CUID of the cart item to remove.
* **Response (200 OK):**
    ```json
    {
      "message": "Cart item {itemId} removed successfully."
    }
    ```

---

## 5. Orders Endpoints

### 5.1. Get Current User's Orders

* **GET** `/api/orders`
* **Description:** Retrieves a list of orders placed by the currently authenticated user.
* **Requires Authentication:** Yes
* **Response (200 OK):**
    ```json
    [
      {
        "id": "cuid_string_order1",
        "orderDate": "2023-01-15T10:00:00.000Z",
        "totalAmount": "899.98",
        "status": "PAID",
        "shippingAddress": { "street": "123 Main St", "city": "Anytown", "zip": "12345", "country": "USA" },
        "billingAddress": { "street": "123 Main St", "city": "Anytown", "zip": "12345", "country": "USA" },
        "paymentIntentId": "pi_xxxxxxxxx",
        "createdAt": "...",
        "updatedAt": "...",
        "userId": "cuid_string_user_id",
        "items": [
          {
            "id": "cuid_string_order_item1",
            "quantity": 1,
            "priceAtPurchase": "699.99",
            "orderId": "cuid_string_order1",
            "productId": "cuid_string_product1",
            "product": {
              "id": "cuid_string_product1",
              "name": "Smartphone X",
              "imageUrl": "/images/smartphone-x.jpg",
              "description": "Latest model smartphone"
            }
          }
        
        ]
      }
    
    ]
    ```

### 5.2. Create New Order (Checkout)

* **POST** `/api/orders`
* **Description:** Creates a new order from the user's current cart items. This action typically clears the cart and decrements product stock.
* **Requires Authentication:** Yes
* **Request Body:** `application/json`
    ```json
    {
      "shippingAddress": { "street": "123 Main St", "city": "Anytown", "zip": "12345", "country": "USA", "name": "John Doe", "phone": "555-1234" },
      "billingAddress": { "street": "123 Main St", "city": "Anytown", "zip": "12345", "country": "USA", "name": "John Doe", "phone": "555-1234" },
      "paymentIntentId": "pi_xxxxxxxxx_from_payment_gateway"
    }
    ```
    * `shippingAddress`: (JSON object, required)
    * `billingAddress`: (JSON object, optional, may be same as shipping)
    * `paymentIntentId`: (string, optional) Reference ID from a payment gateway.
* **Response (201 Created):**
    ```json
    {
      "id": "cuid_string_new_order",
      "orderDate": "...",
      "totalAmount": "calculated_total_string",
      "status": "PENDING",
      "shippingAddress": { "...": "..." },
      "billingAddress": { "...": "..." },
      "paymentIntentId": "pi_xxxxxxxxx",
      "createdAt": "...",
      "updatedAt": "...",
      "userId": "cuid_string_user_id",
      "items": [ /* ... order items ... */ ]
    }
    ```
* **Error (400 Bad Request):** If cart is empty or stock is insufficient for any item.

### 5.3. Get Specific Order by ID (User's Own or Admin)

* **GET** `/api/orders/{id}`
* **Description:** Retrieves details of a specific order. Accessible by the user who owns the order or by an admin.
* **Requires Authentication:** Yes
* **Path Parameters:**
    * `id`: (string, required) The CUID of the order.
* **Response (200 OK):** (Similar structure to an order object in the GET `/api/orders` list, but for a single order)
    ```json
    {
      "id": "cuid_string_order1",
      "orderDate": "2023-01-15T10:00:00.000Z",
      "totalAmount": "899.98",
      "status": "PAID",
      "shippingAddress": { "street": "123 Main St", "city": "Anytown", "zip": "12345", "country": "USA" },
      "billingAddress": { "street": "123 Main St", "city": "Anytown", "zip": "12345", "country": "USA" },
      "paymentIntentId": "pi_xxxxxxxxx",
      "createdAt": "...",
      "updatedAt": "...",
      "userId": "cuid_string_user_id",
      "user": {
          "id": "cuid_string_user_id",
          "name": "Test User",
          "email": "user@example.com"
      },
      "items": [ /* ... order items ... */ ]
    }
    ```

---

## 6. Admin Endpoints

### 6.1. Admin: Get All Orders

* **GET** `/api/admin/orders`
* **Description:** Retrieves a list of all orders in the system. **Admin only.**
* **Requires Authentication:** Yes (Admin)
* **Request Query Parameters:**
    * `page`: (integer, optional, default: 1)
    * `limit`: (integer, optional, default: 10)
    * `status`: (string, optional) Filter by order status (e.g., 'PENDING', 'PAID').
    * `userId`: (string, optional) Filter orders by a specific user's CUID.
    * `sortBy`: (string, optional, default: 'orderDate') Fields like 'orderDate', 'totalAmount', 'status'.
    * `sortOrder`: (string, optional, default: 'desc') 'asc' or 'desc'.
* **Response (200 OK):**
    ```json
    {
      "orders": [
        {
          "id": "cuid_string_order1",
          "orderDate": "...",
          "totalAmount": "...",
          "status": "PAID",
          "userId": "cuid_string_user1",
          "user": { "id": "cuid_string_user1", "name": "User One", "email": "user1@example.com" },
          "items": [ /* ... */ ]
        
        },
        {
          "id": "cuid_string_order2",
          "orderDate": "...",
          "totalAmount": "...",
          "status": "SHIPPED",
          "userId": "cuid_string_user2",
          "user": { "id": "cuid_string_user2", "name": "User Two", "email": "user2@example.com" },
          "items": [ /* ... */ ]
        
        }
      ],
      "currentPage": 1,
      "totalPages": 3,
      "totalOrders": 30
    }
    ```

### 6.2. Admin: Update Order Status

* **PUT** `/api/admin/orders/{id}/status`
* **Description:** Updates the status of a specific order. **Admin only.**
* **Requires Authentication:** Yes (Admin)
* **Path Parameters:**
    * `id`: (string, required) The CUID of the order to update.
* **Request Body:** `application/json`
    ```json
    {
      "status": "SHIPPED"
    }
    ```
    * `status`: (string, required) Must be one of the valid `OrderStatus` enum values.
* **Response (200 OK):** (Returns the updated order object)
    ```json
    {
      "id": "cuid_string_order1",
      "orderDate": "...",
      "totalAmount": "...",
      "status": "SHIPPED",
    
      "user": { "id": "...", "name": "...", "email": "..." },
      "items": [ { "product": {"name": "..."} /* ... */ } ]
    }
    ```

### 6.3. Admin: Get All Users

* **GET** `/api/admin/users`
* **Description:** Retrieves a list of all users. **Admin only.**
* **Requires Authentication:** Yes (Admin)
* **Request Query Parameters:**
    * `page`: (integer, optional, default: 1)
    * `limit`: (integer, optional, default: 10)
    * `search`: (string, optional) Search term for user email or name.
* **Response (200 OK):**
    ```json
    {
      "users": [
        {
          "id": "cuid_string_user1",
          "email": "user1@example.com",
          "name": "User One",
          "isAdmin": false,
          "createdAt": "...",
          "updatedAt": "...",
          "_count": { "orders": 5, "sessions": 2 }
        },
        {
          "id": "cuid_string_admin_user",
          "email": "admin@example.com",
          "name": "Admin User",
          "isAdmin": true,
          "createdAt": "...",
          "updatedAt": "...",
          "_count": { "orders": 0, "sessions": 1 }
        }
      ],
      "currentPage": 1,
      "totalPages": 2,
      "totalUsers": 15
    }
    ```

### 6.4. Admin: Get Specific User by ID

* **GET** `/api/admin/users/{id}`
* **Description:** Retrieves details for a specific user. **Admin only.**
* **Requires Authentication:** Yes (Admin)
* **Path Parameters:**
    * `id`: (string, required) The CUID of the user.
* **Response (200 OK):**
    ```json
    {
      "id": "cuid_string_user1",
      "email": "user1@example.com",
      "name": "User One",
      "isAdmin": false,
      "createdAt": "...",
      "updatedAt": "...",
      "orders": [
        { "id": "order_cuid1", "orderDate": "...", "totalAmount": "...", "status": "DELIVERED" }
      ],
      "sessions": [
        { "id": "session_cuid1", "expiresAt": "...", "createdAt": "..." }
      ]
    }
    ```

### 6.5. Admin: Update User Details

* **PUT** `/api/admin/users/{id}`
* **Description:** Updates a user's details (e.g., name, email, admin status). **Admin only.**
* **Requires Authentication:** Yes (Admin)
* **Path Parameters:**
    * `id`: (string, required) The CUID of the user to update.
* **Request Body:** `application/json` (fields are optional)
    ```json
    {
      "name": "User One Updated",
      "email": "userone.updated@example.com",
      "isAdmin": true
    }
    ```
* **Response (200 OK):** (Returns the updated user object, excluding password)
    ```json
    {
      "id": "cuid_string_user1",
      "email": "userone.updated@example.com",
      "name": "User One Updated",
      "isAdmin": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
    ```
* **Error (409 Conflict):** If trying to change email to one that's already in use.

---
