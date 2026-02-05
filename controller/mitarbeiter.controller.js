const pool = require('../database/index');

const mitarbeiterController = {

  // Alle Mitarbeiter abrufen (inkl. Funktionen)
  getAllMitarbeiter: async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT m.id, m.vorname, m.nachname, m.email,
               GROUP_CONCAT(f.name) AS funktionen
        FROM mitarbeiter m
        LEFT JOIN mitarbeiter_funktionen mf ON m.id = mf.mitarbeiter_id
        LEFT JOIN funktionen f ON mf.funktion_id = f.id
        GROUP BY m.id
      `);

      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Mitarbeiter konnten nicht geladen werden.' });
    }
  },

  // Einzelnen Mitarbeiter abrufen
  getMitarbeiterById: async (req, res) => {
    try {
      const { id } = req.params;

      const [rows] = await pool.query(`
        SELECT m.id, m.vorname, m.nachname, m.email,
               JSON_ARRAYAGG(f.id) AS funktionen
        FROM mitarbeiter m
        LEFT JOIN mitarbeiter_funktionen mf ON m.id = mf.mitarbeiter_id
        LEFT JOIN funktionen f ON mf.funktion_id = f.id
        WHERE m.id = ?
        GROUP BY m.id
      `, [id]);

      if (rows.length === 0)
        return res.status(404).json({ error: 'Mitarbeiter nicht gefunden.' });

      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Fehler beim Abrufen des Mitarbeiters.' });
    }
  },

  // Mitarbeiter erstellen
  createMitarbeiter: async (req, res) => {
    try {
      const { vorname, nachname, funktionen } = req.body;

      if (!vorname || !nachname || !funktionen || !Array.isArray(funktionen))
        return res.status(400).json({ error: 'Pflichtfelder fehlen oder Funktionen ungültig.' });

      const [result] = await pool.query(
        "INSERT INTO mitarbeiter (vorname, nachname) VALUES (?, ?, ?)",
        [vorname, nachname, email]
      );

      const mitarbeiterId = result.insertId;

      // Funktionen zuweisen
      for (const fId of funktionen) {
        await pool.query(
          "INSERT INTO mitarbeiter_funktionen (mitarbeiter_id, funktion_id) VALUES (?, ?)",
          [mitarbeiterId, fId]
        );
      }

      res.status(201).json({ message: 'Mitarbeiter erstellt.', id: mitarbeiterId });
    } catch (error) {
      console.error("Fehler beim Erstellen des Mitarbeiters:", error);
      res.status(500).json({ error: 'Mitarbeiter konnte nicht erstellt werden.' });
    }
  },

  // Mitarbeiter aktualisieren
  updateMitarbeiter: async (req, res) => {
    try {
      const { id } = req.params;
      const { vorname, nachname, email, funktionen } = req.body;

      await pool.query(
        "UPDATE mitarbeiter SET vorname = ?, nachname = ?, email = ? WHERE id = ?",
        [vorname, nachname, email, id]
      );

      // Alte Funktionen löschen
      await pool.query("DELETE FROM mitarbeiter_funktionen WHERE mitarbeiter_id = ?", [id]);

      // Neue eintragen
      for (const fId of funktionen) {
        await pool.query(
          "INSERT INTO mitarbeiter_funktionen (mitarbeiter_id, funktion_id) VALUES (?, ?)",
          [id, fId]
        );
      }

      res.json({ message: 'Mitarbeiter aktualisiert.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Mitarbeiter konnte nicht aktualisiert werden.' });
    }
  },

  // Mitarbeiter löschen
  deleteMitarbeiter: async (req, res) => {
    try {
      const { id } = req.params;

      await pool.query("DELETE FROM mitarbeiter WHERE id = ?", [id]);

      res.json({ message: 'Mitarbeiter gelöscht.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Mitarbeiter konnte nicht gelöscht werden.' });
    }
  }

};

module.exports = mitarbeiterController;
