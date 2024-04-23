const { fakerPT_BR } = require("@faker-js/faker");

describe("Consulta de Filmes", () => {
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
    }).then((resposta) => {
      arrayNumber = resposta.body.length;
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.an("array");
      expect(resposta.body.length).to.deep.equal(arrayNumber);
    });
  });

  // Criar uns erros aí

  it("Consulta de filmes pelo título", () => {
    cy.request({
      // GET não aceita body, ao invés disso usar o qs (atributo nativo do cypress)
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
