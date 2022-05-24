// grab our db client connection to use with our adapters
const client = require("../client");

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
      // how do we get products associated with this order?
      // easy :) we do an n + 1 query on the userOrders[i]

      const userOrder = userOrders[i];

      // this needs to be implemented in the OrderDetails adapter
      const orderDetails = await getOrderDetailsByOrderId(userOrder.order_id);

      console.log({ orderDetails });

      orders.push(orderDetails);
    }

    return orders;
  } catch (err) {
    throw err;
  }
}
