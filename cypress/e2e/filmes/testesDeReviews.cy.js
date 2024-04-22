const { fakerPT_BR } = require("@faker-js/faker");

describe("Teste de reviews sem permissão de administrador", () => {
  // Usuário, independente do tipo, pode criar uma review de um filme que esteja cadastrado.

  let userToken;
  let userId;
  let movieId;
  let tituloFilme;

  // É necessário criar o filme para saber qual filme pegar
  before(() => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.criarFilme(userToken).then((resposta) => {
          movieId = resposta.id;
          tituloFilme = resposta.title;

          cy.log(movieId);
        });
      });
    });
  });

  after(() => {
    cy.promoverParaAdmin(userToken).then(() => {
      cy.request({
        method: "DELETE",
        url: `/api/movies/${movieId}`,
        headers: {
          Authorization: "Bearer " + userToken,
        },
      });

      cy.request({
        method: "DELETE",
        url: `/api/users/${userId}`,
        auth: {
          bearer: userToken,
        },
      });
    });
  });

  it("usuario simples deve conseguir fazer review de filme", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      cy.log(movieId);

      cy.request({
        method: "POST",
        url: "/api/users/review",
        auth: {
          bearer: userToken,
        },
        body: {
          movieId: movieId,
          score: 3,
          reviewText: "Gostei muito do filme",
        },
      }).then((resposta) => {
        cy.log(movieId);
        expect(resposta.status).to.equal(201);
      });
    });
  });

  it("Checar que a review criada existe", () => {
    cy.request({
      method: "GET",
      url: "/api/users/review/all",
      auth: {
        bearer: userToken,
      },
    });
  });

  // Levar para baixo
  it("Lista todas as reviews feitas pelo usuario", () => {
    cy.request({
      method: "GET",
      url: "/api/users/review/all",
      auth: {
        bearer: userToken,
      },
    }).then((resposta) => {
      cy.log(movieId);
      expect(resposta.status).to.equal(200);
      // expect(resposta.body[0].id).to.equal(userId);
    });
  });
});

describe("Teste de filmes na lista de usuários com permissão de administrador", () => {
  let userToken;
  let arrayNumber;
  let userId;
  let fixtureDoFilme;
  let movieId;
  let tituloFilme;

  before(() => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.criarFilme(userToken).then((resposta) => {
          movieId = resposta.id;
          tituloFilme = resposta.title;

          cy.log(movieId);
        });
      });
    });
  });

  after(() => {
    cy.promoverParaAdmin(userToken).then(() => {
      cy.request({
        method: "DELETE",
        url: `/api/movies/${movieId}`,
        headers: {
          Authorization: "Bearer " + userToken,
        },
      });

      cy.request({
        method: "DELETE",
        url: `/api/users/${userId}`,
        auth: {
          bearer: userToken,
        },
      });
    });
  });
});
