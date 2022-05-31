const client = require("../client");

module.exports = {
  createInventory,
  updateInventory,
};

async function createInventory({ quantity }) {
  try {
    const {
      rows: [inventory],
    } = await client.query(
      `
      INSERT INTO inventory (quantity)
      VALUES ($1)
      RETURNING *;
      `,
      [quantity]
    );
    return inventory;
  } catch (error) {
    throw error;
  }
}

async function updateInventory(inventoryId, quantity) {
  try {
    if (!inventoryId || (!quantity && quantity !== 0)) {
      throw new Error(
        "Please supply an inventory_id or quantity to update inventory items"
      );
    }

    const {
      rows: [inventory],
    } = await client.query(
      `
      UPDATE inventory
      SET quantity = $1
      WHERE inventory.id = $2
      RETURNING *;
    `,
      [quantity, inventoryId]
    );

    return inventory;
  } catch (err) {
    throw err;
  }
}
