CREATE TABLE admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  passwort VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  must_change_password BOOLEAN DEFAULT TRUE,
  erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE galerie (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bild VARCHAR(255) NOT NULL,
  erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE mitarbeiter (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vorname VARCHAR(100) NOT NULL,
  nachname VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE funktionen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);
INSERT INTO funktionen (name) VALUES
('Apotheker FPH'),
('Inhaber'),
('Fachfrau Apotheke'),
('Vorlehre');
CREATE TABLE mitarbeiter_funktionen (
  mitarbeiter_id INT NOT NULL,
  funktion_id INT NOT NULL,
  PRIMARY KEY (mitarbeiter_id, funktion_id),
  FOREIGN KEY (mitarbeiter_id) REFERENCES mitarbeiter(id) ON DELETE CASCADE,
  FOREIGN KEY (funktion_id) REFERENCES funktionen(id) ON DELETE CASCADE
);
CREATE TABLE oeffnungszeiten (
  id INT AUTO_INCREMENT PRIMARY KEY,

  montag_oeffnet TIME NOT NULL,
  montag_schliesst TIME NOT NULL,

  dienstag_oeffnet TIME NOT NULL,
  dienstag_schliesst TIME NOT NULL,

  mittwoch_oeffnet TIME NOT NULL,
  mittwoch_schliesst TIME NOT NULL,

  donnerstag_oeffnet TIME NOT NULL,
  donnerstag_schliesst TIME NOT NULL,

  freitag_oeffnet TIME NOT NULL,
  freitag_schliesst TIME NOT NULL,

  samstag_oeffnet TIME NOT NULL,
  samstag_schliesst TIME NOT NULL,

  sonntag_oeffnet TIME NOT NULL,
  sonntag_schliesst TIME NOT NULL,

  erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  aktualisiert_am TIMESTAMP NULL DEFAULT NULL
);
INSERT INTO admin (username, passwort, email, must_change_password)
VALUES (
  'admin',
  '$2a$10$njAqXTKem8O5HzRFk9s.J.B8crCLT0WhwMGFpYEs3d6FTDkQdtqZa',
  'admin@apotheke.de',
  FALSE
);

CREATE INDEX idx_admin_username ON admin(username);
CREATE INDEX idx_galerie_erstellt ON galerie(erstellt_am);
