const db = require("../db");
const axios = require("axios");

exports.createProduct = async (req, res) => {
  const { name, description, price, image } = req.body;
  const user_id = req.user.id;

  try {
    // 1. Insert product into local DB
    const [result] = await db.execute(
      "INSERT INTO products (user_id, name, description, price, image, status) VALUES (?, ?, ?, ?, ?, ?)",
      [user_id, name, description, price, image, "Created Locally"]
    );
    const productId = result.insertId;

    // 2. Debug log to verify image and data going to WooCommerce
    // console.log(" Sending product to WooCommerce:", {
    //   name,
    //   description,
    //   price,
    //   image,
    // });

    // 3. Sync to WooCommerce
    try {
      const response = await axios.post(
        `${process.env.WC_API_URL}/wp-json/wc/v3/products`,
        {
          name,
          type: "simple",
          regular_price: price.toString(),
          description,
          images: [
            {
              src: image,
            },
          ],
        },
        {
          auth: {
            username: process.env.WC_CONSUMER_KEY,
            password: process.env.WC_CONSUMER_SECRET,
          },
        }
      );

      // // 4. Update status to Synced
      // await db.execute(
      //   'UPDATE products SET status = ? WHERE id = ?',
      //   ['Synced to WooCommerce', productId]
      // );
  
      await db.execute(
        "UPDATE products SET status = ?, wc_product_id = ? WHERE id = ?",
        ["Synced to WooCommerce", response.data.id, productId]
      );

      console.log("✅ Product synced to WooCommerce:", response.data.id);
    } catch (err) {
      console.error(
        " WooCommerce Sync Error:",
        err.response?.data || err.message
      );
      await db.execute("UPDATE products SET status = ? WHERE id = ?", [
        "Sync Failed",
        productId,
      ]);
    }

    // 5. Respond back to client
    res.status(201).json({ message: "Product created and sync attempted" });
  } catch (err) {
    console.error("❌ DB Insert Error:", err.message);
    res
      .status(500)
      .json({ error: "Product creation failed", details: err.message });
  }
};

exports.getProducts = async (req, res) => {
  const user_id = req.user.id;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM products WHERE user_id = ?",
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching products", details: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;
  const { name, description, price, image } = req.body;

  try {
    const [[existing]] = await db.execute(
      "SELECT * FROM products WHERE id = ? AND user_id = ?",
      [productId, userId]
    );

    if (!existing) return res.status(404).json({ error: "Product not found" });

    // 1. Update local DB
    await db.execute(
      "UPDATE products SET name=?, description=?, price=?, image=? WHERE id=? AND user_id=?",
      [name, description, price, image, productId, userId]
    );

    // 2. Update on WooCommerce
    if (existing.wc_product_id) {
      await axios.put(
        `${process.env.WC_API_URL}/wp-json/wc/v3/products/${existing.wc_product_id}`,
        {
          name,
          regular_price: price.toString(),
          description,
          images: [{ src: image }],
        },
        {
          auth: {
            username: process.env.WC_CONSUMER_KEY,
            password: process.env.WC_CONSUMER_SECRET,
          },
        }
      );
    }

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("🔥 Update Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Update failed" });
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;

  try {
    const [[existing]] = await db.execute(
      "SELECT * FROM products WHERE id = ? AND user_id = ?",
      [productId, userId]
    );

    if (!existing) return res.status(404).json({ error: "Product not found" });

    // 1. Delete from WooCommerce if exists
    if (existing.wc_product_id) {
      await axios.delete(
        `${process.env.WC_API_URL}/wp-json/wc/v3/products/${existing.wc_product_id}?force=true`,
        {
          auth: {
            username: process.env.WC_CONSUMER_KEY,
            password: process.env.WC_CONSUMER_SECRET,
          },
        }
      );
    }

    // 2. Delete from local DB
    await db.execute("DELETE FROM products WHERE id = ? AND user_id = ?", [
      productId,
      userId,
    ]);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("🔥 Delete Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Delete failed" });
  }
};
