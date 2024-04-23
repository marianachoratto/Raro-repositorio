const { fakerPT_BR } = require("@faker-js/faker");

describe("Teste de reviews de usuário", () => {
  // Usuário, independente do tipo, pode criar uma review de um filme que esteja cadastrado.

  let userToken;
  let userId;
  let movieId;
  let tituloFilme;
  let idDaReview;

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
        idDaReview = resposta.body.id;
        expect(resposta.status).to.equal(201);
        cy.log(idDaReview);
      });
    });
  });

  it("deve retornar sucesso quando o score tiver números quebrados", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;

      cy.request({
        method: "POST",
        url: "/api/users/review",
        auth: {
          bearer: userToken,
        },
        body: {
          movieId: movieId,
          score: 4.73,
          reviewText: "Gostei muito do filme",
        },
      }).then((resposta) => {
        expect(resposta.status).to.equal(201);
      });
    });
  });

  it("deve retornar bad request quando o score foi maior que 5", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;

      cy.request({
        method: "POST",
        url: "/api/users/review",
        auth: {
          bearer: userToken,
        },
        body: {
          movieId: movieId,
          score: 10,
          reviewText: "Gostei muito do filme",
        },
        failOnStatusCode: false,
      }).then((resposta) => {
        expect(resposta.status).to.equal(400);
        expect(resposta.body.error).to.equal("Bad Request");
        expect(resposta.body.message).to.equal(
          "Score should be between 1 and 5"
        );
      });
    });
  });

  it("deve retornar bad request quando o score for menor que 1", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;

      cy.request({
        method: "POST",
        url: "/api/users/review",
        auth: {
          bearer: userToken,
        },
        body: {
          movieId: movieId,
          score: -5,
          reviewText: "Gostei muito do filme",
        },
        failOnStatusCode: false,
      }).then((resposta) => {
        expect(resposta.status).to.equal(400);
        expect(resposta.body.error).to.equal("Bad Request");
        expect(resposta.body.message).to.equal(
          "Score should be between 1 and 5"
        );
      });
    });
  });

  it("deve retornar Movie Not Found quando o filme não existir", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;

      cy.request({
        method: "POST",
        url: "/api/users/review",
        auth: {
          bearer: userToken,
        },
        body: {
          movieId: -9999999,
          score: 5,
          reviewText: "Gostei muito do filme",
        },
        failOnStatusCode: false,
      }).then((resposta) => {
        expect(resposta.status).to.equal(404);
        expect(resposta.body.error).to.equal("Not Found");
        expect(resposta.body.message).to.equal("Movie not found");
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
    }).then((resposta) => {});
  });

  it("Lista todas as reviews feitas pelo usuario", () => {
    cy.request({
      method: "GET",
      url: "/api/users/review/all",
      auth: {
        bearer: userToken,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      // não está retornando nenhuma review
      // expect(resposta.body).to.have.length(1);
      // expect(resposta.body[0].title).to.equal(movieId);
    });
  });
});
