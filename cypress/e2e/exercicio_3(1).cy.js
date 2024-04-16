const { fakerPT_BR } = require("@faker-js/faker");

describe("Teste sobre os filmes", () => {
  let emailUser = fakerPT_BR.internet.email();
  let passwordUser = fakerPT_BR.internet.password(8);
  let nameUser = fakerPT_BR.internet.userName();
  let userToken;
  let userId;
  let fixtureDoFilme;
  let arrayNumber;

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

  it("Criar uma review nova de filme E ver o numero de filmes criados", () => {
    cy.cadastroLogin(emailUser, passwordUser, nameUser).then((resposta) => {
      userId = resposta.id;
      userToken = resposta.token;
      cy.request({
        method: "PATCH",
        url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin",
        headers: {
          Authorization: "Bearer " + userToken,
        },
      }).then((resposta) => {
        cy.fixture("criandoUmFilme.json").then((arquivo) => {
          fixtureDoFilme = arquivo;
          cy.request({
            method: "POST",
            url: "https://raromdb-3c39614e42d4.herokuapp.com/api/movies",
            body: arquivo,
            headers: {
              Authorization: "Bearer " + userToken,
            },
          }).then((resposta) => {
            expect(resposta.status).to.equal(201);
            cy.request({
              method: "GET",
              url: "https://raromdb-3c39614e42d4.herokuapp.com/api/movies",
            }).then((resposta) => {
              expect(resposta.body.length).to.equal(arrayNumber + 1);
            });
          });
        });
      });
    });
  });

  it('Criar uma review nova de filme sem um atributo ("releaseYear")', () => {});

  it("Deletar filmes sem o atributo X", () => {});

  it("Consulta de filmes", () => {});
});
