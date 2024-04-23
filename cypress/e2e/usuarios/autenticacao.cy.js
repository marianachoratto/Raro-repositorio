const { fakerPT_BR } = require("@faker-js/faker");

describe("Testes de autenticação com usuário comum", () => {
  let emailUser = fakerPT_BR.internet.email();
  let passwordUser = fakerPT_BR.internet.password(8);
  let nameUser = fakerPT_BR.internet.userName();
  let userToken;
  let userId;

  before(() => {
    cy.request({
      method: "POST",
      url: "/api/users",
      body: {
        name: nameUser,
        email: emailUser,
        password: passwordUser,
      },
    }).then((resposta) => {
      userId = resposta.body.id;
      cy.request("POST", `/api/auth/login`, {
        email: emailUser,
        password: passwordUser,
      }).then((resposta) => {
        userToken = resposta.body.accessToken;
      });
    });
  });

  after(() => {
    cy.request({
      method: "PATCH",
      url: "/api/users/admin",
      headers: {
        Authorization: "Bearer " + userToken,
      },
    }).then(() => {
      cy.request({
        method: "DELETE",
        url: `/api/users/${userId}`,
        headers: {
          Authorization: "Bearer " + userToken,
        },
      });
    });
  });

  it("Autenticando usuário", () => {
    cy.request("POST", `/api/auth/login`, {
      email: emailUser,
      password: passwordUser,
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
    });
  });

  it("Não é possível fazer autenticação com o email incorreto", () => {
    cy.request({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "emailAleatoriogmail.com",
        password: passwordUser,
      },
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.equal(400);
    });
  });
});

describe("Testes de autenticação com usuário promovido", () => {
  let emailUser = fakerPT_BR.internet.email();
  let passwordUser = fakerPT_BR.internet.password(8);
  let userToken;
  let userId;

  before(() => {
    cy.request({
      method: "POST",
      url: "/api/users",
      body: {
        name: "Maria",
        email: emailUser,
        password: passwordUser,
      },
    }).then((resposta) => {
      userId = resposta.body.id;
      cy.request("POST", `/api/auth/login`, {
        email: emailUser,
        password: passwordUser,
      }).then((resposta) => {
        userToken = resposta.body.accessToken;
      });
    });
  });

  after(() => {
    cy.request({
      method: "PATCH",
      url: "/api/users/admin",
      headers: {
        Authorization: "Bearer " + userToken,
      },
    }).then((resposta) => {
      cy.request({
        method: "DELETE",
        url: `/api/users/${userId}`,
        headers: {
          Authorization: "Bearer " + userToken,
        },
      });
    });
  });

  it("Não é possível promover usuário sem autorização", () => {
    cy.request({
      method: "PATCH",
      url: "/api/users/admin",
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.equal(401);
    });
  });

  it("Não é possível fazer autenticação com o token errado (Autenticação 'bearer')", () => {
    cy.request({
      method: "PATCH",
      url: "/api/users/admin",
      failOnStatusCode: false,
      headers: {
        Authorization: userToken,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(401);
    });
  });

  it("Não é possível fazer autenticação com o token errado (numero errado)", () => {
    cy.request({
      method: "PATCH",
      url: "/api/users/admin",
      failOnStatusCode: false,
      headers: {
        Authorization:
          "Bearer" + "JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTE4LCJl",
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(401);
    });
  });

  it("Não é possivel inativar usuário sem autorização", () => {
    cy.request({
      method: "PATCH",
      url: "/api/users/inactivate",
      headers: {
        Authorization: "Bearer" + userToken,
      },
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.equal(401);
    });
  });
});
