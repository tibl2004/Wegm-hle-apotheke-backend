const pool = require("../database/index");
const jwt = require("jsonwebtoken");

const emergencyController = {

  // 🔐 JWT Auth (Admin)
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Kein Token." });

    jwt.verify(token, "secretKey", (err, user) => {
      if (err) return res.status(403).json({ error: "Ungültiger Token." });
      if (!user.userTypes?.includes("admin")) {
        return res.status(403).json({ error: "Nur Admins." });
      }
      req.user = user;
      next();
    });
  },

  // 📞 Alle Nummern (nach Reihenfolge)
  getAll: async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, title, number, position FROM emergency_numbers ORDER BY position ASC"
      );
      res.json(rows);
    } catch (err) {
      console.error("ERROR getAll:", err); // <-- HIER
      res.status(500).json({ error: "Laden fehlgeschlagen." });
    }
  },  

  // ➕ Neue Nummer (automatisch ans Ende)
  create: async (req, res) => {
    try {
      const { title, number } = req.body;
      if (!title || !number) {
        return res.status(400).json({ error: "Titel & Nummer erforderlich." });
      }

      const [[{ maxPos }]] = await pool.query(
        "SELECT COALESCE(MAX(position), 0) AS maxPos FROM emergency_numbers"
      );

      await pool.query(
        "INSERT INTO emergency_numbers (title, number, position) VALUES (?, ?, ?)",
        [title, number, maxPos + 1]
      );

      res.status(201).json({ message: "Erstellt." });
    } catch (err) {
      res.status(500).json({ error: "Erstellen fehlgeschlagen." });
    }
  },

  // 🔄 Reihenfolge speichern (Drag & Drop)
  updateOrder: async (req, res) => {
    /**
     * Erwartet:
     * [
     *   { id: 3, position: 1 },
     *   { id: 1, position: 2 },
     *   { id: 5, position: 3 }
     * ]
     */
    try {
      const items = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Ungültiges Format." });
      }

      const conn = await pool.getConnection();
      await conn.beginTransaction();

      for (const item of items) {
        await conn.query(
          "UPDATE emergency_numbers SET position = ? WHERE id = ?",
          [item.position, item.id]
        );
      }

      await conn.commit();
      conn.release();

      res.json({ message: "Reihenfolge gespeichert." });
    } catch (err) {
      res.status(500).json({ error: "Reihenfolge speichern fehlgeschlagen." });
    }
  },

  // ✏️ Update
  update: async (req, res) => {
    const { id } = req.params;
    const { title, number } = req.body;

    await pool.query(
      "UPDATE emergency_numbers SET title = ?, number = ? WHERE id = ?",
      [title, number, id]
    );

    res.json({ message: "Aktualisiert." });
  },

  // 🗑️ Löschen
  delete: async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM emergency_numbers WHERE id = ?", [id]);
    res.json({ message: "Gelöscht." });
  }
};

module.exports = emergencyController;
