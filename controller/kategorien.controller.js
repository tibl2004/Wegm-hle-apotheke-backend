const pool = require("../database/index");
const jwt = require('jsonwebtoken');

const kategorienController = {

    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });

        jwt.verify(token, 'secretKey', (err, user) => {
            if (err) return res.status(403).json({ error: 'Ungültiger Token.' });
            req.user = user;
            next();
        });
    },

    // ➕ Kategorie erstellen
    createKategorie: async (req, res) => {
        const { titel } = req.body;
        if (!titel) return res.status(400).json({ error: 'Titel ist erforderlich.' });

        try {
            const [result] = await pool.query(
                `INSERT INTO kategorien (titel) VALUES (?)`, [titel]
            );
            res.status(201).json({ message: "Kategorie erstellt.", id: result.insertId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Fehler beim Erstellen der Kategorie." });
        }
    },

    // ➕ Unterpunkt erstellen
    createUnterpunkt: async (req, res) => {
        const { kategorie_id, name } = req.body;
        if (!kategorie_id || !name) return res.status(400).json({ error: 'Kategorie und Name erforderlich.' });

        try {
            const [result] = await pool.query(
                `INSERT INTO unterpunkte (kategorie_id, name) VALUES (?, ?)`,
                [kategorie_id, name]
            );
            res.status(201).json({ message: "Unterpunkt erstellt.", id: result.insertId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Fehler beim Erstellen des Unterpunkts." });
        }
    },

    // 📄 Alle Kategorien mit Unterpunkten
    getAll: async (req, res) => {
        try {
            const [kategorien] = await pool.query(`SELECT * FROM kategorien`);
            const [unterpunkte] = await pool.query(`SELECT * FROM unterpunkte`);

            const data = kategorien.map(k => ({
                id: k.id,
                titel: k.titel,
                unterpunkte: unterpunkte
                    .filter(u => u.kategorie_id === k.id)
                    .map(u => ({ id: u.id, name: u.name }))
            }));

            res.json({ data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Fehler beim Abrufen der Kategorien." });
        }
    },

    // ✏️ Kategorie löschen (alle Unterpunkte automatisch)
    deleteKategorie: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query(`DELETE FROM kategorien WHERE id = ?`, [id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: "Kategorie nicht gefunden." });
            res.json({ message: "Kategorie gelöscht." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Fehler beim Löschen der Kategorie." });
        }
    },

    // ❌ Unterpunkt löschen
    deleteUnterpunkt: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query(`DELETE FROM unterpunkte WHERE id = ?`, [id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: "Unterpunkt nicht gefunden." });
            res.json({ message: "Unterpunkt gelöscht." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Fehler beim Löschen des Unterpunkts." });
        }
    }
};

module.exports = kategorienController;
