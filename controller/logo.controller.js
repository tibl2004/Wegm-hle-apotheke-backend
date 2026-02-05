// controllers/logoController.js
const pool = require("../database/index");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const jwt = require("jsonwebtoken");

// 🔹 Multer Storage für Logo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, "logo_" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const logoController = {

  // 🔹 JWT Auth Middleware
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });

    jwt.verify(token, 'secretKey', (err, user) => {
      if (err) return res.status(403).json({ error: 'Ungültiger Token.' });
      req.user = user;
      // Nur Admin erlaubt
      if (!user.userTypes.includes("admin")) return res.status(403).json({ error: "Nur Admins dürfen dies tun." });
      next();
    });
  },

  // 🔹 Aktuelles Logo abrufen
  getCurrentLogo: async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM logos WHERE isActive = 1 LIMIT 1");
      if (!rows.length) return res.status(404).json({ error: "Kein aktuelles Logo gefunden." });
      const fullUrl = `${req.protocol}://${req.get("host")}/${rows[0].image}`;
      res.json({ logoUrl: fullUrl, id: rows[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Logo konnte nicht geladen werden" });
    }
  },

  // 🔹 Logo hochladen (Admin only)
  uploadLogo: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "Keine Datei hochgeladen." });

      const logoPath = `uploads/${req.file.filename}`;

      // Alte Logos auf inaktiv setzen
      await pool.query("UPDATE logos SET isActive = 0");

      // Neues Logo als aktiv einfügen
      await pool.query("INSERT INTO logos (image, isActive, created_at) VALUES (?, 1, NOW())", [logoPath]);

      const fullUrl = `${req.protocol}://${req.get("host")}/${logoPath}`;
      res.status(201).json({ message: "Logo erfolgreich hochgeladen.", logoUrl: fullUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Logo Upload fehlgeschlagen" });
    }
  },

  // 🔹 Logo löschen (Admin only)
  deleteLogo: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM logos WHERE id = ?", [id]);
      res.json({ message: "Logo gelöscht" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Logo löschen fehlgeschlagen" });
    }
  },

  // 🔹 Multer Middleware exportieren
  uploadMiddleware: upload
};

module.exports = logoController;
