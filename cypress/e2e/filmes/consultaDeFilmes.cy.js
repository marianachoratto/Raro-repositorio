const { fakerPT_BR } = require("@faker-js/faker");

describe("Consulta de Filmes de sucesso de pessoa logada", () => {
  let userToken;
  let arrayNumber;
  let userId;
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

  it("Faz a listagem dos filmes", () => {
    cy.request({
      method: "GET",
      url: "/api/movies",
      auth: {
        bearer: userToken,
      },
    }).then((resposta) => {
      arrayNumber = resposta.body.length;
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.an("array");
      expect(resposta.body.length).to.deep.equal(arrayNumber);
    });
  });

  it("Consulta de filmes pelo título", () => {
    cy.request({
      // GET não aceita body, ao invés disso usar o qs (atributo nativo do cypress)
      method: "GET",
      url: "/api/movies/search",
      qs: {
        title: tituloFilme,
      },
      auth: {
        bearer: userToken,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.an("array");
      expect(resposta.body[0].title).to.equal(tituloFilme);
      expect(resposta.body).to.have.length(1);
      expect(resposta.body[0].id).to.equal(movieId);
    });
  });

  it("Consultar filme pelo id", () => {
    cy.request({
      method: "GET",
      url: `/api/movies/${movieId}`,
      auth: {
        bearer: userToken,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      expect(resposta.body.title).to.equal(tituloFilme);
      expect(resposta.body.id).to.equal(movieId);
    });
  });
});

describe("Consulta de filmes de pessoa não logada", () => {
  var userToken;
  var userId;
  var movieId;
  var tituloFilme;

  before(() => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken)
        .then((resposta) => {
          cy.criarFilme(userToken).then((resposta) => {
            movieId = resposta.id;
            tituloFilme = resposta.title;
          });
        })
        .then((resposta) => {
          cy.deletarUsuário(userId, userToken);
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

  it("Pessoa não logada pode pesquisar por filmes", () => {
    cy.cadastroLogin()
      .then((resposta) => {
        userToken = resposta.token;
        userId = resposta.id;
      })
      .then((resposta) => {
        cy.log(movieId);

        cy.request({
          method: "GET",
          url: `/api/movies/${movieId}`,
        }).then((resposta) => {
          expect(resposta.status).to.equal(200);
          expect(resposta.body).to.have.property("audienceScore");
          expect(resposta.body).to.have.property("criticScore");
          expect(resposta.body).to.have.property("description");
          expect(resposta.body).to.have.property("durationInMinutes");
          expect(resposta.body).to.have.property("genre");
          expect(resposta.body).to.have.property("releaseYear");
          expect(resposta.body.id).to.equal(movieId);
        });
      });
  });

  it("Faz a listagem dos filmes", () => {
    cy.request({
      method: "GET",
      url: "/api/movies",
    }).then((resposta) => {
      const arrayNumber = resposta.body.length;
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.an("array");
      expect(resposta.body.length).to.deep.equal(arrayNumber);
    });
  });

  it("Consulta de filmes pelo título", () => {
    cy.request({
      method: "GET",
      url: "/api/movies/search",
      qs: {
        title: tituloFilme,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.an("array");
      expect(resposta.body[0].title).to.equal(tituloFilme);
      expect(resposta.body).to.have.length(1);
      expect(resposta.body[0].id).to.equal(movieId);
    });
  });

  it("Consultar filme pelo id", () => {
    cy.request({
      method: "GET",
      url: `/api/movies/${movieId}`,
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      expect(resposta.body.title).to.equal(tituloFilme);
      expect(resposta.body.id).to.equal(movieId);
    });
  });
});

describe("Consulta de filmes inválidas", () => {
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

  // Bug: ver mais informações no arquivo de bugs
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

  // Bug: ver mais informações no arquivo de bugs
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

  // Bug: ver mais informações no arquivo de bugs
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

  it("Consultar filme por id inexistente (com string)", () => {
    cy.request({
      method: "GET",
      url: `/api/movies/idInexistente`,
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
