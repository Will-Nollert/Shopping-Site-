// grab our db client connection to use with our adapters
const client = require("../client");
const bcrypt = require("bcrypt");
const { getUserOrdersByUserId } = require("./user_orders");

module.exports = {
  // add your database adapter fns here
  getAllUsers,
  createUser,
  updateUser,
  softDeleteUser,
  getUserByUserName,
  getUser,
  getUserById,
};

async function getAllUsers() {
  try {
    const { rows: users } = await client.query(`
    SELECT id, username, email, deleted_at FROM users
    WHERE deleted_at IS NULL;    
  `);

    return users;
  } catch (err) {
    throw err;
  }
}

async function createUser({ username, password, email }) {
  try {
    const SALT_COUNT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users (username, password, email)
        VALUES ($1, $2, $3)
        RETURNING *;
      `,
      [username, hashedPassword, email]
    );

    delete user.password;
    return user;
  } catch (err) {
    throw err;
  }
}

async function updateUser(userId, updateFields) {
  try {
    // this removes any undefined fields from our API req.body
    for (const key in updateFields) {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    }

    const setString = Object.keys(updateFields)
      .map((key, idx) => `${key} = $${idx + 2}`)
      .join(", ");

    const {
      rows: [user],
    } = await client.query(
      `
      UPDATE users
      SET ${setString}
      WHERE id = $1
      RETURNING *;
    `,
      [userId, ...Object.values(updateFields)]
    );

    return user;
  } catch (err) {
    throw err;
  }
}

async function softDeleteUser(userId) {
  try {
    const now = new Date();
    const user = await updateUser(userId, { deleted_at: now.toISOString() });
    return user;
  } catch (err) {
    throw err;
  }
}

async function getUserByUserName(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT * from users
      WHERE username = $1;
      `,
      [username]
    );
    return user;
  } catch (err) {
    throw err;
  }
}

async function getUser({ username, password }) {
  try {
    const user = await getUserByUserName(username);

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      delete user.password;
      return user;
    }
  } catch (err) {
    throw err;
  }
}

async function getUserById(userID) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    SELECT * FROM users
    WHERE id=$1;
    `,
      [userID]
    );

    const userOrders = await getUserOrdersByUserId(userID);

    user.orders = userOrders;
    return user;
  } catch (err) {
    throw err;
  }
}
