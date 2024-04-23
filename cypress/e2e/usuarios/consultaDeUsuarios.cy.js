const { fakerPT_BR } = require("@faker-js/faker");

describe("Testes de consulta de usuário", () => {
  let userId;
  let userToken;

  before(() => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;

      cy.promoverParaAdmin(userToken);
    });
  });

  after(() => {
    cy.promoverParaAdmin(userToken)
      .then((resposta) => {})
      .then(() => {
        cy.request({
          method: "DELETE",
          url: `/api/users/${userId}`,
          headers: {
            Authorization: "Bearer " + userToken,
          },
        });
      });
  });

  it("consultar usuário por ID", () => {
    cy.request({
      method: "GET",
      url: `/api/users/${userId}`,
      auth: {
        bearer: userToken,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.have.property("active");
      expect(resposta.body.active).to.equal(true);
      expect(resposta.body).to.have.property("email");
      expect(resposta.body.email).to.be.an("string");
      expect(resposta.body.id).to.equal(userId);
      expect(resposta.body).to.have.property("name");
      expect(resposta.body.name).to.be.an("string");
      expect(resposta.body.type).to.equal(1);
    });
  });

  it("deve ser possível um administrador consultar a lista de todos os usuários", () => {
    cy.request({
      method: "GET",
      url: "/api/users",
      auth: {
        bearer: userToken,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.an("array");
      expect(resposta.body.length > 0).to.equal(true);
    });
  });

  it("Não permitir que usuário comum tenha permissão de ver informações de outros os usuário", () => {
    // Tem que passar o login, pois nesta função em específico não tem promoção para admin
    cy.cadastroLogin().then((resposta) => {
      let userTokenUsuarioComum = resposta.token;
      cy.request({
        method: "GET",
        url: "/api/users/",
        headers: {
          Authorization: "Bearer " + userTokenUsuarioComum,
        },
        failOnStatusCode: false,
      }).then((resposta) => {
        expect(resposta.status).to.equal(403);
        expect(resposta.body.message).to.equal("Forbidden");
      });
    });
  });

  it("Não deve permitir consultar usuário de id inválido", () => {
    cy.request({
      method: "GET",
      url: `/api/users/usuarioMocado55`,
      auth: {
        bearer: userToken,
      },
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.equal(400);
      expect(resposta.body.error).to.equal("Bad Request");
      expect(resposta.body.message).to.equal(
        "Validation failed (numeric string is expected)"
      );
    });
  });
});
