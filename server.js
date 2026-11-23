require("dotenv").config();

const express = require("express");

if (!process.env.JWT_SECRET) {
    throw new Error("Configure JWT_SECRET no arquivo .env.");
}

const protegerRota = require("./middleware/auth");
const tratarErros = require("./middleware/erros");
const app = express();

app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/categorias", protegerRota, require("./routes/categorias"));
app.use("/fontes-destinos", protegerRota, require("./routes/fontesDestinos"));
app.use("/lancamentos", protegerRota, require("./routes/lancamentos"));
app.use("/relatorios", protegerRota, require("./routes/relatorios"));

app.use((req, res) => {
    res.status(404).json({ erro: "Rota não encontrada." });
});

app.use(tratarErros);

const porta = process.env.PORT || 3000;
app.listen(porta, () =>
    console.log(`API de finanças rodando na porta ${porta}.`),
);
