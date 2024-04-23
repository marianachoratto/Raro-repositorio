const { fakerPT_BR } = require("@faker-js/faker");

describe("Teste de cadastros de filmes de sucesso", () => {
  let userToken;
  let userId;
  let fixtureDoFilme;
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

  it("Deve adicionar um novo filme e verificar se ele está na lista ", () => {
    cy.cadastroLogin().then((resposta) => {
      userId = resposta.id;
      userToken = resposta.token;
      cy.request({
        method: "PATCH",
        url: "/api/users/admin",
        headers: {
          Authorization: "Bearer " + userToken,
        },
      }).then((resposta) => {
        cy.fixture("criandoUmFilme.json").then((arquivo) => {
          fixtureDoFilme = arquivo;
          fixtureDoFilme.title = fakerPT_BR.internet.userName();
          cy.request({
            method: "POST",
            url: "/api/movies",
            body: arquivo,
            headers: {
              Authorization: "Bearer " + userToken,
            },
          }).then((resposta) => {
            expect(resposta.status).to.equal(201);
            expect(resposta.body).to.have.property("description");
            expect(resposta.body.description).to.be.equal(
              "O filme da Barbie e do Ken"
            );
            expect(resposta.body.durationInMinutes).to.be.equal(135);
            expect(resposta.body.releaseYear).to.be.equal(2023);
            expect(resposta.body).to.have.property("id");
            expect(resposta.body).to.have.property("title");

            cy.request({
              method: "GET",
              url: "/api/movies",
            }).then((resposta) => {
              resposta.body.forEach(function (item) {
                if (item.title == fixtureDoFilme.title) {
                  expect(item.title).to.equal(fixtureDoFilme.title);
                  movieId = item.id;
                }
              });
            });
          });
        });
      });
    });
  });

  it("Deve conseguir alterar dados do filme", () => {
    cy.request({
      method: "PUT",
      url: `/api/movies/${movieId}`,
      auth: {
        bearer: userToken,
      },
      body: {
        title: "Mudando Titulo1",
        genre: "Mudando Genero1",
        description: "qualquer coisa1",
        durationInMinutes: 10,
        releaseYear: 2024,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(204);
    });
  });

  it("Checando se os dados foram alterados", () => {
    cy.request({
      method: "GET",
      url: `/api/movies/${movieId}`,
    }).then((resposta) => {
      expect(resposta.body).to.deep.includes({
        title: "Mudando Titulo1",
        genre: "Mudando Genero1",
        description: "qualquer coisa1",
        durationInMinutes: 10,
        releaseYear: 2024,
      });
    });
  });
});

describe("Teste de cadastros de filmes com bad requests", () => {
  let movieTitle = fakerPT_BR.internet.userName();
  let movieGenre = fakerPT_BR.internet.password(8);
  let movieDescription = fakerPT_BR.internet.email();
  let userToken;
  let userId;
  let movieId;

  before(() => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
    });
  });

  it("Deve receber Forbiden ao criar filme sem ser administrador", () => {
    cy.request({
      method: "POST",
      url: "/api/movies",
      auth: {
        bearer: userToken,
      },
      body: {
        title: movieTitle,
        genre: movieGenre,
        description: movieDescription,
        durationInMinutes: 150,
        releaseYear: 2020,
      },
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.equal(403);
      expect(resposta.body.message).to.equal("Forbidden");

      movieId = resposta.body.id;
    });
  });

  it("Não deve criar um novo filme sem passar body", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          auth: {
            bearer: userToken,
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(400);
          expect(resposta.body.error).to.equal("Bad Request");
          expect(resposta.body.message).to.deep.equal([
            "title must be longer than or equal to 1 characters",
            "title must be a string",
            "title should not be empty",
            "genre must be longer than or equal to 1 characters",
            "genre must be a string",
            "genre should not be empty",
            "description must be longer than or equal to 1 characters",
            "description must be a string",
            "description should not be empty",
            "durationInMinutes must be a number conforming to the specified constraints",
            "durationInMinutes should not be empty",
            "releaseYear must be a number conforming to the specified constraints",
            "releaseYear should not be empty",
          ]);
        });
      });
    });
  });

  it("Não deve criar um novo filme sem um nome (string vazia)", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          auth: {
            bearer: userToken,
          },
          body: {
            title: "",
            genre: "Animação",
            description: "qualquer coisa",
            durationInMinutes: 127,
            releaseYear: 2022,
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(400);
          expect(resposta.body.error).to.equal("Bad Request");
          expect(resposta.body.message).to.deep.equal([
            "title must be longer than or equal to 1 characters",
            "title should not be empty",
          ]);
        });
      });
    });
  });

  it("Não deve criar um novo filme sem um nome (null)", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          auth: {
            bearer: userToken,
          },
          body: {
            title: null,
            genre: "Animação",
            description: "qualquer coisa",
            durationInMinutes: 127,
            releaseYear: 2022,
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(400);
          expect(resposta.body.error).to.equal("Bad Request");
          expect(resposta.body.message).to.deep.equal([
            "title must be longer than or equal to 1 characters",
            "title must be a string",
            "title should not be empty",
          ]);
        });
      });
    });
  });

  it("Não deve criar um novo filme com título como número", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          auth: {
            bearer: userToken,
          },
          body: {
            title: 12345,
            genre: "Animação",
            description: "qualquer coisa",
            durationInMinutes: 127,
            releaseYear: 2022,
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(400);
          expect(resposta.body.error).to.equal("Bad Request");
          expect(resposta.body.message).to.deep.equal([
            "title must be longer than or equal to 1 and shorter than or equal to 100 characters",
            "title must be a string",
          ]);
        });
      });
    });
  });

  it('Criar um novo filme sem um atributo ("releaseYear")', () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          auth: {
            bearer: userToken,
          },
          body: {
            title: "O caminho para El Dourado",
            genre: "Animação",
            description: "qualquer coisa",
            durationInMinutes: 127,
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(400);
          expect(resposta.body.error).to.equal("Bad Request");
          expect(resposta.body.message).to.deep.equal([
            "releaseYear must be a number conforming to the specified constraints",
            "releaseYear should not be empty",
          ]);
        });
      });
    });
  });

  it("Criar um novo filme com release year sendo uma string", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          auth: {
            bearer: userToken,
          },
          body: {
            title: "O caminho para El Dourado",
            genre: "Animação",
            description: "qualquer coisa",
            durationInMinutes: 127,
            releaseYear: "0",
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(400);
          expect(resposta.body.error).to.equal("Bad Request");
          expect(resposta.body.message).to.deep.equal([
            "releaseYear must be a number conforming to the specified constraints",
          ]);
        });
      });
    });
  });

  it('Criar um novo filme sem um atributo ("genero")', () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          auth: {
            bearer: userToken,
          },
          body: {
            title: "O caminho para El Dourado",
            genre: null,
            description: "qualquer coisa",
            durationInMinutes: 127,
            releaseYear: 0,
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(400);
          expect(resposta.body.error).to.equal("Bad Request");
          expect(resposta.body.message).to.deep.equal([
            "genre must be longer than or equal to 1 characters",
            "genre must be a string",
            "genre should not be empty",
          ]);
        });
      });
    });
  });

  it('Criar um novo filme sem um atributo ("durationInMinutes")', () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          auth: {
            bearer: userToken,
          },
          body: {
            title: "O caminho para El Dourado",
            genre: null,
            description: "qualquer coisa",
            durationInMinutes: null,
            releaseYear: 0,
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(400);
          expect(resposta.body.error).to.equal("Bad Request");
          expect(resposta.body.message).to.deep.equal([
            "genre must be longer than or equal to 1 characters",
            "genre must be a string",
            "genre should not be empty",
            "durationInMinutes must be a number conforming to the specified constraints",
            "durationInMinutes should not be empty",
          ]);
        });
      });
    });
  });

  it("Criar um novo filme com durationInMinutes como string", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          auth: {
            bearer: userToken,
          },
          body: {
            title: "O caminho para El Dourado",
            genre: null,
            description: "qualquer coisa",
            durationInMinutes: "125",
            releaseYear: 0,
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(400);
          expect(resposta.body.error).to.equal("Bad Request");
          expect(resposta.body.message).to.deep.equal([
            "genre must be longer than or equal to 1 characters",
            "genre must be a string",
            "genre should not be empty",
            "durationInMinutes must be a number conforming to the specified constraints",
          ]);
        });
      });
    });
  });

  it("Criar um novo filme com durationInMinutes como um numero negativo", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          auth: {
            bearer: userToken,
          },
          body: {
            title: "O caminho para El Dourado",
            genre: null,
            description: "qualquer coisa",
            durationInMinutes: "125",
            releaseYear: 0,
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(400);
          expect(resposta.body.error).to.equal("Bad Request");
          expect(resposta.body.message).to.deep.equal([
            "genre must be longer than or equal to 1 characters",
            "genre must be a string",
            "genre should not be empty",
            "durationInMinutes must be a number conforming to the specified constraints",
          ]);
        });
      });
    });
  });

  it("Criar um novo filme sem um atributo ('description')", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          auth: {
            bearer: userToken,
          },
          body: {
            title: "O caminho para El Dourado",
            genre: null,
            durationInMinutes: "125",
            releaseYear: 0,
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(400);
          expect(resposta.body.error).to.equal("Bad Request");
          expect(resposta.body.message).to.deep.equal([
            "genre must be longer than or equal to 1 characters",
            "genre must be a string",
            "genre should not be empty",
            "description must be longer than or equal to 1 characters",
            "description must be a string",
            "description should not be empty",
            "durationInMinutes must be a number conforming to the specified constraints",
          ]);
        });
      });
    });
  });

  // não precisa criar um after, pois não foi criado nenhum filme no banco de dados da API
});
