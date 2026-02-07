const pool = require("../database/index");
const jwt = require("jsonwebtoken");

const contactController = {

  // 🔐 JWT Auth Middleware (Admin only)
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Kein Token." });

    jwt.verify(token, "secretKey", (err, user) => {
      if (err) return res.status(403).json({ error: "Ungültiger Token." });
      if (!user.userTypes?.includes("admin")) {
        return res.status(403).json({ error: "Nur Admins dürfen dies tun." });
      }
      req.user = user;
      next();
    });
  },

  // 📞 Kontakt abrufen (nur 1 Eintrag)
  get: async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, title, address, phone, fax, email FROM contact LIMIT 1"
      );
      if (rows.length === 0) return res.json(null); // kein Eintrag
      res.json(rows[0]);
    } catch (err) {
      console.error("ERROR get:", err);
      res.status(500).json({ error: "Kontakt laden fehlgeschlagen." });
    }
  },

  // ➕ Kontakt erstellen (nur, falls noch keiner existiert)
  create: async (req, res) => {
    try {
      const { title, address, phone, fax, email } = req.body;
      if (!title || !address) {
        return res.status(400).json({ error: "Titel & Adresse erforderlich." });
      }

      // Prüfen, ob schon ein Kontakt existiert
      const [existing] = await pool.query("SELECT id FROM contact LIMIT 1");
      if (existing.length > 0) {
        return res.status(400).json({ error: "Kontakt existiert bereits." });
      }

      await pool.query(
        "INSERT INTO contact (title, address, phone, fax, email) VALUES (?, ?, ?, ?, ?)",
        [title, address, phone || "", fax || "", email || ""]
      );

      res.status(201).json({ message: "Kontakt erstellt." });
    } catch (err) {
      console.error("ERROR create:", err);
      res.status(500).json({ error: "Erstellen fehlgeschlagen." });
    }
  },

  // ✏️ Kontakt bearbeiten
  update: async (req, res) => {
    try {
      const { title, address, phone, fax, email } = req.body;

      // Prüfen, ob Kontakt existiert
      const [existing] = await pool.query("SELECT id FROM contact LIMIT 1");
      if (existing.length === 0) {
        return res.status(400).json({ error: "Kein Kontakt vorhanden, bitte zuerst erstellen." });
      }

      const id = existing[0].id;

      await pool.query(
        "UPDATE contact SET title = ?, address = ?, phone = ?, fax = ?, email = ? WHERE id = ?",
        [title, address, phone || "", fax || "", email || "", id]
      );

      res.json({ message: "Kontakt aktualisiert." });
    } catch (err) {
      console.error("ERROR update:", err);
      res.status(500).json({ error: "Update fehlgeschlagen." });
    }
  },

  // 🗑️ Kontakt löschen
  delete: async (req, res) => {
    try {
      await pool.query("DELETE FROM contact"); // löscht alles (nur 1 Eintrag)
      res.json({ message: "Kontakt gelöscht." });
    } catch (err) {
      console.error("ERROR delete:", err);
      res.status(500).json({ error: "Löschen fehlgeschlagen." });
    }
  }
};

module.exports = contactController;
