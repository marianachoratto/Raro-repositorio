// Todos os bugs reportados também estãrão no arquivo em que foram encontrados com o comentário "bug"

describe("Bugs de consulta de filmes", () => {
  let userToken;
  let userId;
  let movieId;

  before(() => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.criarFilme(userToken).then((resposta) => {
          movieId = resposta.id;
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

  // Todos estes arquivos não deveriam retornar 200, mas sim bad request
  it("consulta de filmes com titulo inexistente", () => {
    cy.request({
      method: "GET",
      url: "/api/movies/search",
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.equal(500);
      expect(resposta.body.message).to.equal("Internal server error");
    });
  });

  it("Consultar filme por id inexistente (com numeros)", () => {
    cy.request({
      method: "GET",
      url: `/api/movies/9999999999999`,
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.empty;
    });
  });

  it("Consultar filme por id inexistente (com numeros negativos)", () => {
    cy.request({
      method: "GET",
      url: `/api/movies/-785`,
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.empty;
    });
  });
});

describe("Bugs de delete", () => {
  let userToken;
  let userId;
  let movieId;

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

  //   Não deveria conseguir deletar um filme com um id inexistente
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
});
