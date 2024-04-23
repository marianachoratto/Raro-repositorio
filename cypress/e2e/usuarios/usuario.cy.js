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

describe("Testes de consulta de usuário", () => {
  let userId;
  let userToken;

  before(() => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;

      cy.promoverParaAdmin(userToken);
    });
  });

  after(() => {
    cy.promoverParaAdmin(userToken)
      .then((resposta) => {})
      .then(() => {
        cy.request({
          method: "DELETE",
          url: `/api/users/${userId}`,
          headers: {
            Authorization: "Bearer " + userToken,
          },
        });
      });
  });

  it("consultar usuário por ID", () => {
    cy.request({
      method: "GET",
      url: `/api/users/${userId}`,
      auth: {
        bearer: userToken,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.have.property("active");
      expect(resposta.body.active).to.equal(true);
      expect(resposta.body).to.have.property("email");
      expect(resposta.body.email).to.be.an("string");
      expect(resposta.body.id).to.equal(userId);
      expect(resposta.body).to.have.property("name");
      expect(resposta.body.name).to.be.an("string");
      expect(resposta.body.type).to.equal(1);
    });
  });

  it("deve ser possível um administrador consultar a lista de todos os usuários", () => {
    cy.request({
      method: "GET",
      url: "/api/users",
      auth: {
        bearer: userToken,
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.be.an("array");
      expect(resposta.body.length > 0).to.equal(true);
    });
  });

  it("Não permitir que usuário comum tenha permissão de ver informações de outros os usuário", () => {
    // Tem que passar o login, pois nesta função em específico não tem promoção para admin
    cy.cadastroLogin().then((resposta) => {
      let userTokenUsuarioComum = resposta.token;
      cy.request({
        method: "GET",
        url: "/api/users/",
        headers: {
          Authorization: "Bearer " + userTokenUsuarioComum,
        },
        failOnStatusCode: false,
      }).then((resposta) => {
        expect(resposta.status).to.equal(403);
        expect(resposta.body.message).to.equal("Forbidden");
      });
    });
  });

  it("Não deve permitir consultar usuário de id inválido", () => {
    cy.request({
      method: "GET",
      url: `/api/users/usuarioMocado55`,
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

  // it('usuario administrador pode alterar informações de outras contas', () => {
  //   cy.cadastroLogin()
  //   cy.promoverParaAdmin(userToken);
  // })
});

describe("Testes de inativação de conta", () => {
  let userId;
  let userToken;

  it("usuário comum deve conseguir inativar sua própria conta", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      cy.request({
        method: "PATCH",
        url: "/api/users/inactivate",
        auth: {
          bearer: userToken,
        },
      }).then((resposta) => {
        expect(resposta.status).to.equal(204);
        expect(resposta.body).to.be.empty;
      });
    });
  });

  it("usuário administrador pode deletar qualquer conta", () => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;
      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.request({
          method: "PATCH",
          url: "/api/users/inactivate",
          auth: {
            bearer: userToken,
          },
        }).then((resposta) => {
          expect(resposta.status).to.equal(204);
          expect(resposta.body).to.be.empty;
        });
      });
    });
  });
});
