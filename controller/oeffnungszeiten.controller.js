const pool = require("../database/index");
const jwt = require("jsonwebtoken");

const oeffnungszeitenController = {

  // 🔐 JWT Middleware
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Kein Token bereitgestellt." });

    jwt.verify(token, "secretKey", (err, user) => {
      if (err) return res.status(403).json({ error: "Ungültiger Token." });
      req.user = user;
      next();
    });
  },

  // ===============================
  // 🔹 GET Öffnungszeiten (komprimiert)
  // ===============================
  getOeffnungszeiten: async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT *
         FROM oeffnungszeiten
         ORDER BY FIELD(wochentag,'Mo','Di','Mi','Do','Fr','Sa','So'), von`
      );

      const WOCHEN_ORDER = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
      const fmt = (t) => (t ? t.slice(0, 5) : null);

      const tage = {};

      for (const row of rows) {
        if (!tage[row.wochentag]) tage[row.wochentag] = [];

        if (row.von && row.bis) {
          tage[row.wochentag].push({
            von: fmt(row.von),
            bis: fmt(row.bis),
          });
        }
      }

      const compressDays = (days) => {
        const sorted = [...days].sort(
          (a, b) => WOCHEN_ORDER.indexOf(a) - WOCHEN_ORDER.indexOf(b)
        );

        const ranges = [];
        let start = sorted[0];
        let prev = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
          const curr = sorted[i];
          if (WOCHEN_ORDER.indexOf(curr) === WOCHEN_ORDER.indexOf(prev) + 1) {
            prev = curr;
          } else {
            ranges.push(start === prev ? start : `${start} – ${prev}`);
            start = curr;
            prev = curr;
          }
        }

        ranges.push(start === prev ? start : `${start} – ${prev}`);
        return ranges;
      };

      const patternGroups = {};

      for (const wt of Object.keys(tage)) {
        const times = tage[wt];
        const pattern =
          times.length === 0
            ? "geschlossen"
            : times.map(t => `${t.von} – ${t.bis}`).join("|");

        if (!patternGroups[pattern]) patternGroups[pattern] = [];
        patternGroups[pattern].push(wt);
      }

      const output = [];

      for (const pattern of Object.keys(patternGroups)) {
        output.push({
          wochentage: compressDays(patternGroups[pattern]),
          geschlossen: pattern === "geschlossen",
          zeiten: pattern === "geschlossen"
            ? ["geschlossen"]
            : pattern.split("|"),
        });
      }

      res.status(200).json(output);

    } catch (err) {
      console.error("Fehler beim Abrufen:", err);
      res.status(500).json({ error: "Fehler beim Abrufen der Öffnungszeiten." });
    }
  },

  // ===============================
  // 🔹 GET für Bearbeitung (unkomprimiert)
  // ===============================
  getOeffzeitenForEdit: async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT *
         FROM oeffnungszeiten
         ORDER BY FIELD(wochentag,'Mo','Di','Mi','Do','Fr','Sa','So'), von`
      );

      res.status(200).json(rows);

    } catch (err) {
      console.error("Fehler beim Abrufen für Bearbeiten:", err);
      res.status(500).json({ error: "Fehler beim Abrufen." });
    }
  },

  // ===============================
  // 🔹 UPDATE Zeitblock
  // ===============================
  updateZeitblock: async (req, res) => {
    try {
      const { id } = req.params;
      const { wochentag, von, bis } = req.body;

      const [rows] = await pool.query(
        "SELECT * FROM oeffnungszeiten WHERE id = ?",
        [id]
      );

      if (rows.length === 0)
        return res.status(404).json({ error: "Eintrag nicht gefunden" });

      await pool.query(
        "UPDATE oeffnungszeiten SET wochentag = ?, von = ?, bis = ? WHERE id = ?",
        [
          wochentag || rows[0].wochentag,
          von || null,
          bis || null,
          id
        ]
      );

      const [updatedRows] = await pool.query(
        "SELECT * FROM oeffnungszeiten WHERE id = ?",
        [id]
      );

      res.status(200).json({
        message: "Zeitblock aktualisiert",
        zeitblock: updatedRows[0]
      });

    } catch (err) {
      console.error("Fehler beim Aktualisieren:", err);
      res.status(500).json({ error: "Fehler beim Aktualisieren" });
    }
  },

  // ===============================
  // 🔹 ADD Zeitblock
  // ===============================
  addZeitblock: async (req, res) => {
    try {
      const { wochentag, von, bis } = req.body;

      if (!wochentag)
        return res.status(400).json({ error: "Wochentag erforderlich." });

      const closed = (!von || !bis);

      await pool.query(
        "INSERT INTO oeffnungszeiten (wochentag, von, bis) VALUES (?, ?, ?)",
        [
          wochentag,
          closed ? null : von,
          closed ? null : bis
        ]
      );

      res.status(201).json({ message: "Zeitblock hinzugefügt" });

    } catch (err) {
      console.error("Fehler beim Hinzufügen:", err);
      res.status(500).json({ error: "Fehler beim Speichern." });
    }
  },

  // ===============================
  // 🔹 DELETE Zeitblock
  // ===============================
  deleteZeitblock: async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await pool.query(
        "DELETE FROM oeffnungszeiten WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Eintrag nicht gefunden." });

      res.status(200).json({ message: "Zeitblock gelöscht" });

    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      res.status(500).json({ error: "Fehler beim Löschen." });
    }
  }
};

module.exports = oeffnungszeitenController;
