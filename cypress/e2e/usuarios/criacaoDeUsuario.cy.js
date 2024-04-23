const { fakerPT_BR } = require("@faker-js/faker");

describe("Testes para criação de usuário", () => {
  let userId;
  let userEmail = fakerPT_BR.internet.email();
  let userPassword = fakerPT_BR.internet.password(8);
  let userName = fakerPT_BR.internet.userName();
  let userToken;

  after(() => {
    // logar o usuário
    cy.request({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: userEmail,
        password: userPassword,
      },
    }).then((resposta) => {
      userToken = resposta.body.accessToken;
      cy.log(userId);
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.deletarUsuário(userId, userToken);
      });
    });
  });

  it("Criação de usuário válido", () => {
    cy.request("POST", "/api/users", {
      name: userName,
      email: userEmail,
      password: userPassword,
    }).then((resposta) => {
      userId = resposta.body.id;
      cy.log(userId);
      expect(resposta.status).to.equal(201);
      expect(resposta.body).to.have.property("id");
      expect(resposta.body.active).to.equal(true);
      expect(resposta.body.id).to.be.an("number");
      expect(resposta.body.type).to.equal(0);
      expect(resposta.body.name).to.equal(userName);
      expect(resposta.body.email).to.equal(userEmail);
    });
  });

  it("Criação de usuário sem body", () => {
    cy.request({
      method: "POST",
      url: "/api/users",
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.equal(400);
      expect(resposta.body.error).to.equal("Bad Request");
      expect(resposta.body.message).to.deep.equal([
        "name must be longer than or equal to 1 characters",
        "name must be a string",
        "name should not be empty",
        "email must be longer than or equal to 1 characters",
        "email must be an email",
        "email should not be empty",
        "password must be longer than or equal to 6 characters",
        "password must be a string",
        "password should not be empty",
      ]);
    });
  });

  it("Criar usuário com email inválido", () => {
    cy.request({
      method: "POST",
      url: "/api/users",
      failOnStatusCode: false,
      body: {
        name: userEmail,
        email: "marianagmail.com",
        password: userPassword,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(400);
      expect(resposta.body.message).to.be.an("array");
      expect(resposta.body.message[0]).to.deep.equal("email must be an email");
    });
  });

  it("Criar Usuário com senha muito curta", () => {
    cy.request({
      method: "POST",
      url: "/api/users",
      failOnStatusCode: false,
      body: {
        name: userName,
        email: userEmail,
        password: "12",
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(400);
      expect(resposta.body.message[0]).to.deep.equal(
        "password must be longer than or equal to 6 characters"
      );
    });
  });

  it("Criar usuario com senha muito longa", () => {
    cy.request({
      method: "POST",
      url: "/api/users",
      failOnStatusCode: false,
      body: {
        name: userName,
        email: userEmail,
        password: "12345678901112",
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(400);
      expect(resposta.body.message).to.be.an("array");
      expect(resposta.body.message[0]).to.deep.equal(
        "password must be shorter than or equal to 12 characters"
      );
    });
  });

  it("Deve receber bad request ao cadastrar usuário sem email", () => {
    cy.request({
      method: "POST",
      url: "/api/users",
      body: {
        name: userName,
        password: userPassword,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("Bad Request");
    });
  });

  it("Deve receber bad request ao cadastrar usuário sem nome", () => {
    cy.request({
      method: "POST",
      url: "/api/users",
      body: {
        email: userEmail,
        password: userPassword,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("Bad Request");
    });
  });

  it("Deve receber bad request ao cadastrar usuário sem password", () => {
    cy.request({
      method: "POST",
      url: "/api/users",
      body: {
        name: userName,
        email: userEmail,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("Bad Request");
    });
  });
});
