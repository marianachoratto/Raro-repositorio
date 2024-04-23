describe("Testes de atualização de cadastro", () => {
  let userId;
  let userToken;
  let fixtureDoCadastro;

  before(() => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
    });
  });

  after(() => {
    cy.promoverParaAdmin(userToken).then(() => {
      cy.request({
        method: "DELETE",
        url: `/api/users/${userId}`,
        headers: {
          Authorization: "Bearer " + userToken,
        },
      });
    });
  });

  it("usuario comum atualizar sua própria conta", () => {
    cy.fixture("atualizandoCadastro.json").then((arquivo) => {
      fixtureDoCadastro = arquivo;

      cy.request({
        method: "PUT",
        url: `/api/users/${userId}`,
        auth: {
          bearer: userToken,
        },
        body: arquivo,
      }).then((resposta) => {
        expect(resposta.status).to.equal(200);
        expect(resposta.body.name).to.equal(arquivo.name);
        expect(resposta.body.active).to.equal(true);
        expect(resposta.body.id).to.be.an("number");
        expect(resposta.body.type).to.equal(0);
      });
    });
  });

  it("deve retornar bad request ao tentar atualizar usuário com id inválido", () => {
    cy.promoverParaAdmin(userToken).then((resposta) => {
      cy.request({
        method: "PUT",
        url: "/api/users/355A",
        auth: {
          bearer: userToken,
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

  it("usuario administrador pode alterar informações de outras contas", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      let idDoNovoUsuario = resposta.id;
      cy.log("o id do novo usuário é", idDoNovoUsuario);
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.log("o id do usuário que vou alterar é", userId);
        cy.request({
          method: "PUT",
          url: `/api/users/${userId}`,
          auth: {
            bearer: userToken,
          },
          body: {
            name: "mudando nome de usuario",
            password: "abacate",
          },
        }).then((resposta) => {
          expect(resposta.status).to.equal(200);
          expect(resposta.body.name).to.equal("mudando nome de usuario");
          expect(resposta.body.id).to.equal(userId);
        });
      });
    });
  });
});
