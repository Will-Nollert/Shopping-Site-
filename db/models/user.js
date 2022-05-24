// grab our db client connection to use with our adapters
const client = require("../client");
const bcrypt = require("bcrypt");

module.exports = {
  // add your database adapter fns here
  getAllUsers,
  createUser,
  updateUser,
  softDeleteUser,
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
    console.log(Object.keys(updateFields).length);

    // this removes any undefined fields from our API req.body
    for (const key in updateFields) {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    }

    console.log(Object.keys(updateFields).length);

    const setString = Object.keys(updateFields)
      .map((key, idx) => `${key} = $${idx + 2}`)
      .join(", ");

    console.log(setString);

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
