const { fakerPT_BR } = require("@faker-js/faker");

describe("Testes de delete de filmes", () => {
  let userToken;
  let userId;
  let movieId;

  it("Deletar filmes como administrador", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;

      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.criarFilme(userToken)
          .then((resposta) => {
            movieId = resposta.id;
          })
          .then((resposta) => {
            cy.request({
              method: "DELETE",
              url: `/api/movies/${movieId}`,
              headers: {
                Authorization: "Bearer " + userToken,
              },
            }).then((resposta) => {
              expect(resposta.status).to.equal(204);
            });
          });
      });
    });
  });
});

describe("Teste de delete de filmes inválidos", () => {
  let userToken;
  let userId;
  let movieId;

  before(() => {
    cy.cadastroLogin()
      .then((resposta) => {
        userToken = resposta.token;
        userId = resposta.id;
      })
      .then((resposta) => {
        cy.promoverParaAdmin(userToken)
          .then((resposta) => {
            cy.criarFilme(userToken);
          })
          .then((resposta) => {
            movieId = resposta.id;
          })
          .then((resposta) => {
            cy.deletarUsuário(userId, userToken);
          });
      });
  });

  beforeEach(() => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
    });
  });

  afterEach(() => {
    cy.promoverParaAdmin(userToken).then((resposta) => {
      cy.deletarUsuário(userId, userToken);
    });
  });

  it("Usuario comum não deve conseguir deletar um filme", () => {
    cy.request({
      method: "DELETE",
      url: `/api/movies/${movieId}`,
      auth: {
        bearer: userToken,
      },
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.equal(403);
      expect(resposta.body.message).to.equal("Forbidden");
    });
  });

  it("usuario não logado não deve conseguir deletar um filme", () => {
    cy.request({
      method: "DELETE",
      url: `/api/movies/${movieId}`,
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.equal(401);
      expect(resposta.body.error).to.equal("Unauthorized");
      expect(resposta.body.message).to.equal("Access denied.");
    });
  });

  it("Tentar deletar um filme com id inválido", () => {
    cy.promoverParaAdmin(userToken).then((resposta) => {
      cy.criarFilme(userToken)
        .then((resposta) => {
          movieId = resposta.id;
        })
        .then((resposta) => {
          cy.request({
            method: "DELETE",
            url: `/api/movies/999999999`,
            headers: {
              Authorization: "Bearer " + userToken,
            },
          }).then((resposta) => {
            expect(resposta.status).to.equal(204);
            expect(resposta.body).to.be.empty;
          });
        });
    });
  });

  it("Tentar deletar um filme com id inválido (string)", () => {
    cy.promoverParaAdmin(userToken).then((resposta) => {
      cy.criarFilme(userToken)
        .then((resposta) => {
          movieId = resposta.id;
        })
        .then((resposta) => {
          cy.request({
            method: "DELETE",
            url: `/api/movies/filmeInexistente`,
            headers: {
              Authorization: "Bearer " + userToken,
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
  });
});
