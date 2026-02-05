const pool = require("../database/index");
const jwt = require("jsonwebtoken");

const oeffnungszeitenController = {
  // 🔒 Middleware: Token prüfen
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });

    jwt.verify(token, 'secretKey', (err, user) => {
      if (err) {
        console.error('Token Überprüfung fehlgeschlagen:', err);
        return res.status(403).json({ error: 'Ungültiger Token.' });
      }
      req.user = user;
      next();
    });
  },

  // ➕ Öffnungszeiten erstellen
  createOeffnungszeiten: async (req, res) => {
    try {
      const { userTypes } = req.user;
      if (!userTypes || !userTypes.includes("vorstand")) {
        return res.status(403).json({ error: "Nur Vorstände dürfen Öffnungszeiten erstellen." });
      }

      const {
        montag_oeffnet, montag_schliesst,
        dienstag_oeffnet, dienstag_schliesst,
        mittwoch_oeffnet, mittwoch_schliesst,
        donnerstag_oeffnet, donnerstag_schliesst,
        freitag_oeffnet, freitag_schliesst,
        samstag_oeffnet, samstag_schliesst,
        sonntag_oeffnet, sonntag_schliesst
      } = req.body;

      // Prüfen, ob alle Felder gesetzt sind
      const alleFelder = [
        montag_oeffnet, montag_schliesst,
        dienstag_oeffnet, dienstag_schliesst,
        mittwoch_oeffnet, mittwoch_schliesst,
        donnerstag_oeffnet, donnerstag_schliesst,
        freitag_oeffnet, freitag_schliesst,
        samstag_oeffnet, samstag_schliesst,
        sonntag_oeffnet, sonntag_schliesst
      ];

      if (alleFelder.some(f => !f)) {
        return res.status(400).json({ error: "Bitte alle Öffnet- und Schließt-Zeiten angeben." });
      }

      await pool.query(
        `INSERT INTO oeffnungszeiten 
        (montag_oeffnet, montag_schliesst,
         dienstag_oeffnet, dienstag_schliesst,
         mittwoch_oeffnet, mittwoch_schliesst,
         donnerstag_oeffnet, donnerstag_schliesst,
         freitag_oeffnet, freitag_schliesst,
         samstag_oeffnet, samstag_schliesst,
         sonntag_oeffnet, sonntag_schliesst)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        alleFelder
      );

      res.status(201).json({ message: "Öffnungszeiten erfolgreich erstellt." });
    } catch (error) {
      console.error("Fehler beim Erstellen der Öffnungszeiten:", error);
      res.status(500).json({ error: "Fehler beim Erstellen der Öffnungszeiten." });
    }
  },

  // 🔄 Öffnungszeiten aktualisieren
  updateOeffnungszeiten: async (req, res) => {
    try {
      const { userTypes } = req.user;
      if (!userTypes || !userTypes.includes("vorstand")) {
        return res.status(403).json({ error: "Nur Vorstände dürfen Öffnungszeiten aktualisieren." });
      }

      const id = req.params.id;
      const {
        montag_oeffnet, montag_schliesst,
        dienstag_oeffnet, dienstag_schliesst,
        mittwoch_oeffnet, mittwoch_schliesst,
        donnerstag_oeffnet, donnerstag_schliesst,
        freitag_oeffnet, freitag_schliesst,
        samstag_oeffnet, samstag_schliesst,
        sonntag_oeffnet, sonntag_schliesst
      } = req.body;

      const [existiert] = await pool.query("SELECT id FROM oeffnungszeiten WHERE id = ?", [id]);
      if (existiert.length === 0) return res.status(404).json({ error: "Eintrag nicht gefunden." });

      const alleFelder = [
        montag_oeffnet, montag_schliesst,
        dienstag_oeffnet, dienstag_schliesst,
        mittwoch_oeffnet, mittwoch_schliesst,
        donnerstag_oeffnet, donnerstag_schliesst,
        freitag_oeffnet, freitag_schliesst,
        samstag_oeffnet, samstag_schliesst,
        sonntag_oeffnet, sonntag_schliesst
      ];

      await pool.query(
        `UPDATE oeffnungszeiten
         SET montag_oeffnet=?, montag_schliesst=?,
             dienstag_oeffnet=?, dienstag_schliesst=?,
             mittwoch_oeffnet=?, mittwoch_schliesst=?,
             donnerstag_oeffnet=?, donnerstag_schliesst=?,
             freitag_oeffnet=?, freitag_schliesst=?,
             samstag_oeffnet=?, samstag_schliesst=?,
             sonntag_oeffnet=?, sonntag_schliesst=?,
             aktualisiert_am=NOW()
         WHERE id=?`,
        [...alleFelder, id]
      );

      res.status(200).json({ message: "Öffnungszeiten erfolgreich aktualisiert." });
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Öffnungszeiten:", error);
      res.status(500).json({ error: "Fehler beim Aktualisieren der Öffnungszeiten." });
    }
  },

  // ❌ Öffnungszeiten löschen
  deleteOeffnungszeiten: async (req, res) => {
    try {
      const { userTypes } = req.user;
      if (!userTypes || !userTypes.includes("vorstand")) {
        return res.status(403).json({ error: "Nur Vorstände dürfen Öffnungszeiten löschen." });
      }

      const id = req.params.id;
      const [existiert] = await pool.query("SELECT id FROM oeffnungszeiten WHERE id = ?", [id]);
      if (existiert.length === 0) return res.status(404).json({ error: "Eintrag nicht gefunden." });

      await pool.query("DELETE FROM oeffnungszeiten WHERE id = ?", [id]);
      res.status(200).json({ message: "Öffnungszeiten erfolgreich gelöscht." });
    } catch (error) {
      console.error("Fehler beim Löschen der Öffnungszeiten:", error);
      res.status(500).json({ error: "Fehler beim Löschen der Öffnungszeiten." });
    }
  },

 // 📖 Öffnungszeiten abrufen
getOeffnungszeiten: async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM oeffnungszeiten ORDER BY id DESC LIMIT 1`
    );

    if (rows.length === 0) return res.status(404).json({ error: "Keine Öffnungszeiten gefunden." });

    const zeiten = rows[0];

   
    const formatZeit = (zeit) => (zeit === "00:00:00" ? "GESCHLOSSEN" : zeit);

    const oeffnungszeiten = {
      montag_oeffnet: formatZeit(zeiten.montag_oeffnet),
      montag_schliesst: formatZeit(zeiten.montag_schliesst),
      dienstag_oeffnet: formatZeit(zeiten.dienstag_oeffnet),
      dienstag_schliesst: formatZeit(zeiten.dienstag_schliesst),
      mittwoch_oeffnet: formatZeit(zeiten.mittwoch_oeffnet),
      mittwoch_schliesst: formatZeit(zeiten.mittwoch_schliesst),
      donnerstag_oeffnet: formatZeit(zeiten.donnerstag_oeffnet),
      donnerstag_schliesst: formatZeit(zeiten.donnerstag_schliesst),
      freitag_oeffnet: formatZeit(zeiten.freitag_oeffnet),
      freitag_schliesst: formatZeit(zeiten.freitag_schliesst),
      samstag_oeffnet: formatZeit(zeiten.samstag_oeffnet),
      samstag_schliesst: formatZeit(zeiten.samstag_schliesst),
      sonntag_oeffnet: formatZeit(zeiten.sonntag_oeffnet),
      sonntag_schliesst: formatZeit(zeiten.sonntag_schliesst),
    };

    res.status(200).json({ id: zeiten.id, oeffnungszeiten });
  } catch (error) {
    console.error("Fehler beim Abrufen der Öffnungszeiten:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Öffnungszeiten." });
  }
}

};

module.exports = oeffnungszeitenController;
