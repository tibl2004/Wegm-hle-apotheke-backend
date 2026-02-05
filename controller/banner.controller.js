// controllers/bannerController.js
const pool = require("../database/index");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const jwt = require("jsonwebtoken");

// 🔹 Multer Storage für Banner
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads"); // Persistenter Ordner
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, "banner_" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const bannerController = {

  // 🔹 JWT Auth Middleware (Admin only)
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

  // 🔹 Aktuelles Banner abrufen
  getCurrentBanner: async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM banners WHERE isActive = 1 LIMIT 1");
      if (!rows.length) return res.status(404).json({ error: "Kein aktuelles Banner gefunden." });
      const fullUrl = `${req.protocol}://${req.get("host")}/${rows[0].image}`;
      res.json({ bannerUrl: fullUrl, id: rows[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Banner konnte nicht geladen werden" });
    }
  },

  // 🔹 Banner hochladen (Admin only)
  uploadBanner: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "Keine Datei hochgeladen." });

      const bannerPath = `uploads/${req.file.filename}`;

      // Alte Banner auf inaktiv setzen
      await pool.query("UPDATE banners SET isActive = 0");

      // Neues Banner als aktiv einfügen
      await pool.query("INSERT INTO banners (image, isActive, created_at) VALUES (?, 1, NOW())", [bannerPath]);

      const fullUrl = `${req.protocol}://${req.get("host")}/${bannerPath}`;
      res.status(201).json({ message: "Banner erfolgreich hochgeladen.", bannerUrl: fullUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Banner Upload fehlgeschlagen" });
    }
  },

  // 🔹 Banner löschen (Admin only)
  deleteBanner: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM banners WHERE id = ?", [id]);
      res.json({ message: "Banner gelöscht" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Banner löschen fehlgeschlagen" });
    }
  },

  // 🔹 Multer Middleware exportieren
  uploadMiddleware: upload
};

module.exports = bannerController;
