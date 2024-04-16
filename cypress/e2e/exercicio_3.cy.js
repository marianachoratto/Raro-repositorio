const { fakerPT_BR } = require("@faker-js/faker");

describe("Teste sobre os filmes", () => {
  let emailUser = fakerPT_BR.internet.email();
  let passwordUser = fakerPT_BR.internet.password(8);
  let nameUser = fakerPT_BR.internet.userName();
  let userToken;
  let userId;

  it("Faz a listagem dos filmes", () => {
    cy.request({
      method: "GET",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/movies",
    }).then((resposta) => {
      let arrayNumber = resposta.body.length;
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.an("array");
      expect(resposta.body.length).to.deep.equal(arrayNumber);
    });
  });

  it("Criar uma review nova de filme", () => {
    cy.request({
      method: "POST",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users",
      body: {
        name: nameUser,
        email: emailUser,
        password: passwordUser,
      },
    })
      .then((resposta) => {
        userId = resposta.body.id;
        cy.request(
          "POST",
          `https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login`,
          {
            email: emailUser,
            password: passwordUser,
          }
        ).then((resposta) => {
          userToken = resposta.body.accessToken;
        });
      })
      .then(() => {
        cy.fixture("criandoUmFilme.json").then((arquivo) => {
          cy.request({
            method: "POST",
            url: "https://raromdb-3c39614e42d4.herokuapp.com/api/movies",
            body: arquivo,
            Authorization: "Bearer" + userToken,
          }).then((resposta) => {
            expect(resposta.body).to.deep.equal(arquivo);
          });
        });
      });
  });

  it('Criar uma review nova de filme sem um atributo ("releaseYear")', () => {});
});
