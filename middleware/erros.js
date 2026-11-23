function tratarErros(erro, req, res, next) {
    if (res.headersSent) return next(erro);

    if (erro.name === "UnauthorizedError") {
        return res
            .status(401)
            .json({ erro: "Token ausente, inválido ou expirado." });
    }

    if (erro.type === "entity.parse.failed") {
        return res.status(400).json({ erro: "JSON inválido." });
    }

    if (erro.status === 413) {
        return res
            .status(413)
            .json({ erro: "Corpo da requisição muito grande." });
    }

    console.error(erro);
    return res.status(500).json({ erro: "Erro interno do servidor." });
}

module.exports = tratarErros;
