// grab our db client connection to use with our adapters
const client = require("../client");
const { getOrderDetailsByOrderId } = require("./orders");

module.exports = {
  // add your database adapter fns here
  createUser_orders,
  getUserOrdersByUserId,
};

async function createUser_orders({ userId, orderId }) {
  try {
    const {
      rows: [userOrder],
    } = await client.query(
      `
      INSERT INTO user_orders (user_id, order_id)
       VALUES ($1, $2)
       RETURNING *;`,
      [userId, orderId]
    );
    return userOrder;
  } catch (err) {
    throw err;
  }
}

async function getUserOrdersByUserId(userId) {
  try {
    const { rows: userOrders } = await client.query(
      `
    SELECT * FROM user_orders
    WHERE user_id = $1;`,
      [userId]
    );

    const orders = [];

    for (let i = 0; i < userOrders.length; i++) {
      const userOrder = userOrders[i];
      const orderDetails = await getOrderDetailsByOrderId(userOrder.order_id);
      orders.push(orderDetails);
    }

    return orders;
  } catch (err) {
    throw err;
  }
}
