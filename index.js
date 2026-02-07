const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
 
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
  );
  
  

// 🔹 CORS für alle erlauben (kein corsOptions nötig)
app.use(cors());

// 🔹 Limits hochsetzen
app.use(express.urlencoded({ limit: "150mb", extended: true }));
app.use(express.json({ limit: "150mb" }));

const loginRouter = require('./routes/login.router');
const anfrageRouter = require('./routes/anfrage.router');
const logoRouter = require('./routes/logo.router');
const adminRouter = require('./routes/admin.router');
const funktionenRouter = require('./routes/funktion.router');
const mitarbeiterRouter = require('./routes/mitarbeiter.router');
const oeffnungszeitenRouter = require('./routes/oeffnungszeiten.router');
const galerieRouter = require('./routes/galerie.router');
const bannerRouter = require('./routes/banner.router');
const emergencyRouter = require('./routes/emergency.router');
const contactRouter = require('./routes/contact.router');


app.use('/api/login', loginRouter);
app.use('/api/anfrage', anfrageRouter);
app.use('/api/logo', logoRouter);
app.use('/api/admin', adminRouter);
app.use('/api/funktionen', funktionenRouter);
app.use('/api/mitarbeiter', mitarbeiterRouter);
app.use('/api/oeffnungszeiten', oeffnungszeitenRouter);
app.use('/api/galerie', galerieRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/contact', contactRouter);


// 🔹 Preflight für alle Anfragen (optional, aber sicher)
app.options('*', cors());

// 🔹 Fehlerbehandlung
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Etwas ist schiefgelaufen!');
});

// 🔹 Server starten
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}....`);
});
