const pool = require("../database/index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const loginController = {
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Kein Token bereitgestellt." });
    }

    jwt.verify(token, "secretKey", (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Ungültiger Token." });
      }
      req.user = user;
      next();
    });
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Benutzername und Passwort erforderlich." });
      }

      const [rows] = await pool.query(
        "SELECT * FROM admin WHERE username = ?",
        [username]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Admin nicht gefunden." });
      }

      const admin = rows[0];
      const valid = await bcrypt.compare(password, admin.passwort);

      if (!valid) {
        return res.status(401).json({ error: "Falsches Passwort." });
      }

      const mustChangePassword = admin.must_change_password === 1;

      const token = jwt.sign(
        {
          id: admin.id,
          username: admin.username,
          userTypes: ["admin"],
          forcePasswordChange: mustChangePassword,
        },
        "secretKey",
        { expiresIn: "8h" }
      );

      res.json({
        token,
        id: admin.id,
        userTypes: ["admin"],
        mustChangePassword,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Fehler beim Login." });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { newPassword } = req.body;
      const userId = req.user.id;

      if (!newPassword || newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: "Passwort mindestens 8 Zeichen." });
      }

      const hashed = await bcrypt.hash(newPassword, 10);

      await pool.query(
        "UPDATE admin SET passwort = ?, must_change_password = 0 WHERE id = ?",
        [hashed, userId]
      );

      res.json({ message: "Passwort erfolgreich geändert" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Passwortänderung fehlgeschlagen." });
    }
  },
};

module.exports = loginController;
