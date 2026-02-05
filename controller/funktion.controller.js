const pool = require('../database/index');
const bcrypt = require('bcrypt');

const funktionController = {
  // 🔹 Alle Funktionen abrufen
  getAllFunktionen: async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, name FROM funktionen ORDER BY name ASC");
      res.json(rows);
    } catch (error) {
      console.error("Fehler beim Laden der Funktionen:", error);
      res.status(500).json({ error: 'Funktionen konnten nicht geladen werden.' });
    }
  },

  // 🔹 Einzelne Funktion abrufen
  getFunktionById: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query("SELECT id, name FROM funktionen WHERE id = ?", [id]);
      if (rows.length === 0)
        return res.status(404).json({ error: 'Funktion nicht gefunden.' });
      res.json(rows[0]);
    } catch (error) {
      console.error("Fehler beim Abrufen der Funktion:", error);
      res.status(500).json({ error: 'Fehler beim Abrufen der Funktion.' });
    }
  },

  // 🔹 Neue Funktion erstellen
  createFunktion: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Funktionsname ist erforderlich.' });
      }

      const [existing] = await pool.query("SELECT * FROM funktionen WHERE name = ?", [name.trim()]);
      if (existing.length > 0)
        return res.status(400).json({ error: 'Diese Funktion existiert bereits.' });

      const [result] = await pool.query(
        "INSERT INTO funktionen (name) VALUES (?)",
        [name.trim()]
      );

      res.status(201).json({ message: 'Funktion erstellt.', id: result.insertId });
    } catch (error) {
      console.error("Fehler beim Erstellen der Funktion:", error);
      res.status(500).json({ error: 'Funktion konnte nicht erstellt werden.' });
    }
  },

  // 🔹 Funktion aktualisieren
  updateFunktion: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Funktionsname ist erforderlich.' });
      }

      const [result] = await pool.query(
        "UPDATE funktionen SET name = ? WHERE id = ?",
        [name.trim(), id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ error: 'Funktion nicht gefunden.' });

      res.json({ message: 'Funktion aktualisiert.' });
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Funktion:", error);
      res.status(500).json({ error: 'Funktion konnte nicht aktualisiert werden.' });
    }
  },

  // 🔹 Funktion löschen
  deleteFunktion: async (req, res) => {
    try {
      const { id } = req.params;

      // Prüfen, ob diese Funktion bei Mitarbeitern genutzt wird
      const [used] = await pool.query("SELECT COUNT(*) AS count FROM mitarbeiter WHERE funktion = ?", [id]);
      if (used[0].count > 0) {
        return res.status(400).json({ error: 'Diese Funktion wird noch von Mitarbeitern genutzt.' });
      }

      const [result] = await pool.query("DELETE FROM funktionen WHERE id = ?", [id]);
      if (result.affectedRows === 0)
        return res.status(404).json({ error: 'Funktion nicht gefunden.' });

      res.json({ message: 'Funktion gelöscht.' });
    } catch (error) {
      console.error("Fehler beim Löschen der Funktion:", error);
      res.status(500).json({ error: 'Funktion konnte nicht gelöscht werden.' });
    }
  },


};

module.exports = funktionController;
