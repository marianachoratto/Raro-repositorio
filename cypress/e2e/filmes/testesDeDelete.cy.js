const { fakerPT_BR } = require("@faker-js/faker");

describe("Testes de delete de filmes", () => {
  let userToken;
  let userId;
  let movieId;

  it("Deletar filmes", () => {
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

  it("Não deve conseguir deletar filme sem ser administrador", () => {
    cy.cadastroLogin()
      .then((resposta) => {
        userToken = resposta.token;
        userId = resposta.id;
      })
      .criarFilme(userToken)
      .then((resposta) => {
        movieId = resposta.id;
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
  });
});
