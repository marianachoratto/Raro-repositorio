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

      cy.promoverParaAdmin(userToken).then((resposta) => {
        cy.deletarUsuário(userId, userToken);
      });
    });
  });

  it("Teste para criar um usuário", () => {
    cy.request("POST", "/api/users", {
      name: userName,
      email: userEmail,
      password: userPassword,
    }).then((resposta) => {
      userId = resposta.body.id;
      expect(resposta.status).to.equal(201);
      expect(resposta.body).to.have.property("active");
      expect(resposta.body).to.have.property("id");
      expect(resposta.body).to.have.property("type");
      expect(resposta.body.active).to.equal(true);
      expect(resposta.body.id).to.be.an("number");
      expect(resposta.body.type).to.equal(0);
      expect(resposta.body.name).to.equal(userName);
      expect(resposta.body.email).to.equal(userEmail);
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
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("Bad Request");
    });
  });
});

// Faltou coisa aqui. Olhar
describe("Testes de consulta de usuário", () => {
  let userId;
  let userToken;
  let arrayNumber;
  let usuarioCriado;

  before(() => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;

      cy.promoverParaAdmin(userToken).then((resposta) => {});
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

  it("deve ser possível consultar a lista de todos os usuários", () => {
    userToken;
    // usuarioCriado;

    cy.request({
      method: "GET",
      url: "/api/users",
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
  // Ver se o último usuário da lista foi colocado. Perguntar pra Luan sobre a viabilidade de pegar o objeto inteiro

  it("Não permitir que usuário comum tenha permissão de ver informações de outros os usuário", () => {
    // Tem que passar o login, pois nesta função em específico não tem promoção para admin
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      cy.request({
        method: "GET",
        url: "/api/users/",
        headers: {
          Authorization: "Bearer " + userToken,
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
      expect(resposta.status).to.equal(403);
      expect(resposta.body.message).to.equal("Forbidden");
    });
  });
});

describe("Testes de atualização de cadastro", () => {
  var fixtureDoCadastro;
  let userId;
  let userToken;
  let usuarioCriado;

  before(() => {
    cy.cadastroLogin().then((resposta) => {
      userToken = resposta.token;
      userId = resposta.id;

      cy.promoverParaAdmin(userToken).then((resposta) => {});
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

  // falta criar variável para pegar objeto inteiro
  it("atualizar usuário com sucesso", () => {
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
        // expect(resposta.body.id).to.be.an(usuarioCriado.body.id);
        expect(resposta.body.type).to.equal(1);
      });
    });
  });

  it("deve retornar bad request ao tentar atualizar usuário com id inválido", () => {
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

describe("Testes de inativação de conta", () => {
  let userId;
  let userToken;
  let usuarioCriado;

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
