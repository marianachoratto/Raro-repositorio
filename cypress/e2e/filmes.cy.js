const { fakerPT_BR } = require("@faker-js/faker");

describe("Teste sobre os filmes", () => {
  let nameUser = fakerPT_BR.internet.userName();
  let passwordUser = fakerPT_BR.internet.password(8);
  let emailUser = fakerPT_BR.internet.email();
  let userToken;
  let userId;
  let fixtureDoFilme;
  let arrayNumber;
  let idDoFilme = arrayNumber + 1;

  it("Faz a listagem dos filmes", () => {
    cy.request({
      method: "GET",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/movies",
    }).then((resposta) => {
      arrayNumber = resposta.body.length;
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.an("array");
      expect(resposta.body.length).to.deep.equal(arrayNumber);
    });
  });

  it("Criar uma review nova de filme", () => {
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
          cy.request({
            method: "POST",
            url: "/api/movies",
            body: arquivo,
            headers: {
              Authorization: "Bearer " + userToken,
            },
          }).then((resposta) => {
            expect(resposta.status).to.equal(201);
            cy.request({
              method: "GET",
              url: "/api/movies",
            }).then((resposta) => {
              expect(resposta.body.length).to.equal(arrayNumber + 1);
            });
          });
        });
      });
    });
  });

  it('Criar uma review nova de filme sem um atributo ("releaseYear")', () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "POST",
          url: "/api/movies",
          body: {
            title: "O caminho para El Dourado",
            genre: "Animação",
            description: "qualquer coisa",
            durationInMinutes: 127,
          },
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.equal(401);
        });
      });
    });
  });

  it("Deletar filmes", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;

      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.log(idDoFilme);
        cy.log(typeof idDoFilme);
        cy.request({
          method: "DELETE",
          url: `/api/movies/${idDoFilme}`,
          headers: {
            Authorization: "Bearer " + userToken,
          },
        }).then((resposta) => {
          expect(resposta.status).to.equal(204);
        });
      });
    });
  });

  it("Consulta de filmes", () => {
    cy.request({
      // GET não aceita body, ao invés disso usar o qs (atributo nativo do site)
      method: "GET",
      url: "/api/movies/search",
      qs: {
        title: "O caminho para El Dourado",
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.an("array");
    });
  });
});
