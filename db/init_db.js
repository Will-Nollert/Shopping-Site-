const {
  client,
  User,
  Product,
  Order,
  UserOrderItems,
  // declare your model imports here
  // for example, User
} = require("./");
const { UserOrders } = require("./models");

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitalUsers();
    await createInitalProducts();
    await createInitalOrders();
    await createInitalUser_order_items();
    await createInitalUser_orders();
  } catch (error) {
    console.log("Error during rebuildDB");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
    CREATE TYPE order_status AS ENUM('pending', 'settled');

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        email VARCHAR(255),
        deleted_at DATE DEFAULT NULL
      );
     CREATE TABLE inventory (
         id SERIAL PRIMARY KEY,
         quantity INTEGER DEFAULT 0
     );
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      inventory_id INTEGER REFERENCES inventory (id),
      name VARCHAR(255) NOT NULL,
      price INTEGER NOT NULL, 
      description TEXT NOT NULL,
      product_img TEXT,                      
      created_at DATE DEFAULT now()
    );
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      status order_status NOT NULL,
      created_at DATE DEFAULT now()
    );
    CREATE TABLE user_order_items (
      order_item_number SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders (id),
      product_id INTEGER REFERENCES products (id),
      quantity INTEGER NOT NULL,
      price_paid INTEGER NOT NULL,
      created_at DATE DEFAULT now()
    );
     CREATE TABLE user_orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users (id),
      order_id INTEGER REFERENCES orders (id),
      UNIQUE(user_id, order_id)
      );
    `);
    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    // have to make sure to drop in correct order
    await client.query(`
      DROP TABLE IF EXISTS user_order_items;
      DROP TABLE IF EXISTS user_orders;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS inventory;
      DROP TABLE IF EXISTS users;

       DROP TYPE IF EXISTS  order_status;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createInitalUsers() {
  try {
    console.log("Starting to create users...");
    await User.createUser({
      username: "albert",
      password: "bertie99",
      email: "Albert@test.mail",
    });
    await User.createUser({
      username: "sandra",
      password: "2sandy4me",
      email: "Sandra@test.mail",
    });
    await User.createUser({
      username: "glamgal",
      password: "soglam",
      email: "Joshua@test.mail",
    });

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function createInitalProducts() {
  try {
    console.log("Starting to create Products...");

    await Product.createProduct({
      name: "Widget 1",
      inventory_id: 1,
      price: "111",
      quantity: 1,
      description: "This is a test object please ignore",
      product_img:
        "https://cdn.shopify.com/s/files/1/0023/0191/9345/products/785614787201_5314064c-fa38-4fff-8444-b21cb26e842d_499x499.jpg?v=1645169983",
    });
    await Product.createProduct({
      name: "Widget 2",
      inventory_id: 2,
      price: "222",
      quantity: 2,
      description: "This is a test object please ignore",
      product_img:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSIaQW6GZWksFISyGV-FCr2RwlJ7ouHD5e4fxAbHVIuFEbto2IPSnmT5fHhzohWR9e7KHbr6r_l7-zERLuL_xw9YEvUXsEDTe0iuhiGk_58kD5Uoj49MbN55Q&usqp=CAE",
    });
    await Product.createProduct({
      name: "Widget 3",
      inventory_id: 3,
      price: "333",
      quantity: 3,
      description: "This is a test object please ignore",
      product_img:
        "https://media.happysocks.com/catalog/product/m/a/magentoimage_izzfy7u3urz9lr3v.png?width=320&format=pjpg&quality=70&auto=webp&bg-color=fafafa",
    });
  } catch (error) {
    console.error("Error creating Products!");
    throw error;
  }
}

async function createInitalOrders() {
  try {
    console.log("Starting to create Orders...");
    await Order.createOrder({
      status: "pending",
      created_at: new Date().toISOString(),
    });
    await Order.createOrder({
      status: "settled",
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating Inital Orders!");
    throw error;
  }
}

async function createInitalUser_order_items() {
  try {
    console.log("Starting to create User Order Items...");

    await UserOrderItems.createUser_order_items({
      order_id: 1,
      product_id: 1,
      quantity: 1,
      price_paid: 111,
      created_at: new Date("1995-12-17T03:24:00"),
    });
    await UserOrderItems.createUser_order_items({
      order_id: 1,
      product_id: 2,
      quantity: 2,
      price_paid: 222,
      created_at: new Date("1995-12-17T03:24:00"),
    });
    await UserOrderItems.createUser_order_items({
      order_id: 2,
      socks_id: 1,
      quantity: 3,
      price_paid: 333,
      created_at: null,
    });
  } catch (error) {
    console.error("Error creating Inital Order Items!");
    throw error;
  }
}

async function createInitalUser_orders() {
  try {
    console.log("starting to create User's Orders");
    await UserOrders.createUser_orders({
      userId: 1,
      orderId: 1,
    });
    await UserOrders.createUser_orders({
      userId: 2,
      orderId: 2,
    });
  } catch (error) {
    console.error("Error creating Inital User's Orders!");
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await User.getAllUsers();
    console.log("Result:", users);

    console.log("calling getAllOrders");
    const orders = await Order.getAllOrders();
    console.log("Result:", orders);

    console.log("calling getOrderDetailsByOrderId ");
    const order1 = await Order.getOrderDetailsByOrderId(1);
    console.log("Result:", order1);

    console.log("calling getUserOrderByUserId ");
    const userOrder = await UserOrders.getUserOrdersByUserId(2);
    console.log("Result:", userOrder);
  } catch (error) {
    console.log("Error during testDB");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
