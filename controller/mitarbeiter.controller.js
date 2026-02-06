const pool = require("../database/index");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// ===============================
// 📸 MULTER SETUP
// ===============================
const uploadDir = path.join(__dirname, "../uploads/mitarbeiter");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, "mitarbeiter_" + Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Nur Bilder erlaubt")),
});

// ===============================
// 👩‍⚕️ CONTROLLER
// ===============================
const mitarbeiterController = {

  // ===============================
  // 📥 GET ALLE MITARBEITER
  // ===============================
  getAll: async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT m.id, m.vorname, m.nachname, m.foto,
        GROUP_CONCAT(f.name) AS funktionen
        FROM mitarbeiter m
        LEFT JOIN mitarbeiter_funktionen mf ON m.id = mf.mitarbeiter_id
        LEFT JOIN funktionen f ON mf.funktion_id = f.id
        GROUP BY m.id
      `);

      const result = rows.map(m => ({
        ...m,
        foto: `${req.protocol}://${req.get("host")}/${m.foto}`
      }));

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Mitarbeiter konnten nicht geladen werden" });
    }
  },

  // ===============================
  // ➕ CREATE MIT FOTO
  // ===============================
  create: (req, res) => {
    upload.single("foto")(req, res, async (err) => {
      try {
        if (err) return res.status(400).json({ error: err.message });

        const { vorname, nachname, funktionen } = req.body;
        if (!vorname || !nachname || !Array.isArray(funktionen))
          return res.status(400).json({ error: "Ungültige Daten" });

        const foto = req.file
          ? `uploads/mitarbeiter/${req.file.filename}`
          : "uploads/mitarbeiter/default.png";

        const [result] = await pool.query(
          "INSERT INTO mitarbeiter (vorname, nachname, foto) VALUES (?, ?, ?)",
          [vorname, nachname, foto]
        );

        for (const f of funktionen) {
          await pool.query(
            "INSERT INTO mitarbeiter_funktionen VALUES (?, ?)",
            [result.insertId, f]
          );
        }

        res.status(201).json({ message: "Erstellt", id: result.insertId });
      } catch (e) {
        res.status(500).json({ error: "Create fehlgeschlagen" });
      }
    });
  },

  // ===============================
  // ✏️ UPDATE + OPTIONAL FOTO
  // ===============================
  update: (req, res) => {
    upload.single("foto")(req, res, async (err) => {
      try {
        if (err) return res.status(400).json({ error: err.message });

        const { id } = req.params;
        const { vorname, nachname, funktionen } = req.body;

        const [old] = await pool.query(
          "SELECT foto FROM mitarbeiter WHERE id = ?",
          [id]
        );

        if (!old.length)
          return res.status(404).json({ error: "Nicht gefunden" });

        let foto = old[0].foto;

        if (req.file) {
          if (!foto.includes("default.png") && fs.existsSync(foto)) {
            fs.unlinkSync(foto);
          }
          foto = `uploads/mitarbeiter/${req.file.filename}`;
        }

        await pool.query(
          "UPDATE mitarbeiter SET vorname=?, nachname=?, foto=? WHERE id=?",
          [vorname, nachname, foto, id]
        );

        await pool.query(
          "DELETE FROM mitarbeiter_funktionen WHERE mitarbeiter_id=?",
          [id]
        );

        for (const f of funktionen) {
          await pool.query(
            "INSERT INTO mitarbeiter_funktionen VALUES (?, ?)",
            [id, f]
          );
        }

        res.json({ message: "Aktualisiert" });
      } catch {
        res.status(500).json({ error: "Update fehlgeschlagen" });
      }
    });
  },

  // ===============================
  // ❌ DELETE + FOTO LÖSCHEN
  // ===============================
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const [rows] = await pool.query(
        "SELECT foto FROM mitarbeiter WHERE id=?",
        [id]
      );

      if (!rows.length)
        return res.status(404).json({ error: "Nicht gefunden" });

      const foto = rows[0].foto;

      if (!foto.includes("default.png") && fs.existsSync(foto)) {
        fs.unlinkSync(foto);
      }

      await pool.query(
        "DELETE FROM mitarbeiter_funktionen WHERE mitarbeiter_id=?",
        [id]
      );
      await pool.query("DELETE FROM mitarbeiter WHERE id=?", [id]);

      res.json({ message: "Gelöscht" });
    } catch {
      res.status(500).json({ error: "Delete fehlgeschlagen" });
    }
  },
};

module.exports = mitarbeiterController;
