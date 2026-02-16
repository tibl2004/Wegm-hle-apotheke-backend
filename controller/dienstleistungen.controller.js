const pool = require("../database/index");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================
// Multer Setup für Uploads
// ======================
const uploadDir = path.join(__dirname, "../uploads/dienstleistungen");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

const dienstleistungenController = {

  // 🔐 Admin-only Middleware
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

  // 📄 Alle Dienstleistungen abrufen (nur id, titel, bild)
  getAll: async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, titel, bild FROM dienstleistungen ORDER BY id ASC"
      );
      res.json({ data: rows });
    } catch (err) {
      console.error("ERROR getAll:", err);
      res.status(500).json({ error: "Dienstleistungen laden fehlgeschlagen." });
    }
  },

  // 📄 Dienstleistung nach ID abrufen (alle Details)
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query(
        "SELECT id, titel, beschreibung, bild FROM dienstleistungen WHERE id = ?",
        [id]
      );
      if (rows.length === 0) return res.status(404).json({ error: "Dienstleistung nicht gefunden." });
      res.json(rows[0]);
    } catch (err) {
      console.error("ERROR getById:", err);
      res.status(500).json({ error: "Dienstleistung laden fehlgeschlagen." });
    }
  },

  // ➕ Dienstleistung erstellen (Admin + Bild)
  create: [
    upload.single("bild"),
    async (req, res) => {
      try {
        const { titel, beschreibung } = req.body;
        if (!titel || !beschreibung) return res.status(400).json({ error: "Titel & Beschreibung erforderlich." });
        const bild = req.file ? req.file.filename : null;

        const [result] = await pool.query(
          "INSERT INTO dienstleistungen (titel, beschreibung, bild) VALUES (?, ?, ?)",
          [titel, beschreibung, bild]
        );

        res.status(201).json({ message: "Dienstleistung erstellt.", id: result.insertId });
      } catch (err) {
        console.error("ERROR create:", err);
        res.status(500).json({ error: "Dienstleistung erstellen fehlgeschlagen." });
      }
    }
  ],

  // ✏️ Dienstleistung bearbeiten (Admin + optionales neues Bild)
  update: [
    upload.single("bild"),
    async (req, res) => {
      try {
        const { id } = req.params;
        const { titel, beschreibung } = req.body;
        if (!titel || !beschreibung) return res.status(400).json({ error: "Titel & Beschreibung erforderlich." });

        let bild;
        if (req.file) {
          bild = req.file.filename;
          // altes Bild löschen
          const [existing] = await pool.query("SELECT bild FROM dienstleistungen WHERE id = ?", [id]);
          if (existing.length > 0 && existing[0].bild) {
            const oldPath = path.join(uploadDir, existing[0].bild);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
        }

        const [result] = await pool.query(
          "UPDATE dienstleistungen SET titel = ?, beschreibung = ?, bild = COALESCE(?, bild) WHERE id = ?",
          [titel, beschreibung, bild, id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: "Dienstleistung nicht gefunden." });

        res.json({ message: "Dienstleistung aktualisiert." });
      } catch (err) {
        console.error("ERROR update:", err);
        res.status(500).json({ error: "Dienstleistung aktualisieren fehlgeschlagen." });
      }
    }
  ],

  // 🗑️ Dienstleistung löschen (Admin)
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const [existing] = await pool.query("SELECT bild FROM dienstleistungen WHERE id = ?", [id]);
      if (existing.length > 0 && existing[0].bild) {
        const oldPath = path.join(uploadDir, existing[0].bild);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const [result] = await pool.query("DELETE FROM dienstleistungen WHERE id = ?", [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: "Dienstleistung nicht gefunden." });

      res.json({ message: "Dienstleistung gelöscht." });
    } catch (err) {
      console.error("ERROR delete:", err);
      res.status(500).json({ error: "Dienstleistung löschen fehlgeschlagen." });
    }
  },

  // Multer Middleware für Router
  uploadMiddleware: upload
};

module.exports = dienstleistungenController;
