const { fakerPT_BR } = require("@faker-js/faker");

describe("Testes de API para criação de usuário", () => {
  let userId;
  let userEmail = fakerPT_BR.internet.email();
  let userPassword = fakerPT_BR.internet.password(8);
  let userName = fakerPT_BR.internet.userName();
  let userToken;

  after(() => {
    cy.request("POST", `/api/auth/login`, {
      email: userEmail,
      password: userPassword,
    }).then((resposta) => {
      userToken = resposta.body.accessToken;

      cy.request({
        method: "PATCH",
        url: "/api/users/admin",
        headers: {
          Authorization: "Bearer " + userToken,
        },
      }).then((resposta) => {
        cy.request({
          method: "DELETE",
          url: `/api/users/${userId}`,
          headers: {
            Authorization: "Bearer " + userToken,
          },
        });
      });
    });
  });

  it("Teste para criar um usuário", () => {
    cy.request("POST", "/api/users", {
      name: "Mariana Choratto",
      email: userEmail,
      password: userPassword,
    }).then((resposta) => {
      userId = resposta.body.id;
      expect(resposta.status).to.equal(201);
      expect(resposta.body.active).to.equal(true);
    });
  });

  it("Criar usuário com email inválido", () => {
    cy.request({
      method: "POST",
      url: "/api/users",
      failOnStatusCode: false,
      body: {
        name: userEmail,
        email: "marianagmail.com",
        password: userPassword,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(400);
      expect(resposta.body.message).to.be.an("array");
      expect(resposta.body.message[0]).to.deep.equal("email must be an email");
    });
  });

  it("Criar Usuário com senha muito curta", () => {
    cy.request({
      method: "POST",
      url: "/api/users",
      failOnStatusCode: false,
      body: {
        name: userName,
        email: userEmail,
        password: "12",
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(400);
      expect(resposta.body.message[0]).to.deep.equal(
        "password must be longer than or equal to 6 characters"
      );
    });
  });

  it("Criar usuario com senha muito longa", () => {
    cy.request({
      method: "POST",
      url: "/api/users",
      failOnStatusCode: false,
      body: {
        name: userName,
        email: userEmail,
        password: "12345678901112",
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(400);
      expect(resposta.body.message).to.be.an("array");
      expect(resposta.body.message[0]).to.deep.equal(
        "password must be shorter than or equal to 12 characters"
      );
    });
  });

  it("Encontrar usuário", () => {
    cy.cadastroLogin().then((resposta) => {
      userId = resposta.id;
      userToken = resposta.token;
      cy.request({
        method: "GET",
        url: "/api/users/" + userId,
        headers: {
          Authorization: "Bearer " + userToken,
        },
      }).then((resposta) => {
        expect(resposta.status).to.equal(200);
      });
    });
  });

  it("Não permitir que usuário comum tenha permissão de ver informações de outros os usuário", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      cy.request({
        method: "GET",
        url: "/api/users/",
        headers: {
          Authorization: "Bearer " + userToken,
        },
        failOnStatusCode: false,
      }).then((resposta) => {
        expect(resposta.status).to.equal(403);
        expect(resposta.body.message).to.equal("Forbidden");
      });
    });
  });
});
