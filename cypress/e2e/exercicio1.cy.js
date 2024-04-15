describe("Testes de API para criação de usuário", () => {
  let userId;
  let userEmail = "marianachoratto22@gmail.com";
  let userPassword = "123456";
  let userToken;

  after(() => {
    cy.request(
      "POST",
      `https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login`,
      {
        email: userEmail,
        password: userPassword,
      }
    ).then((resposta) => {
      userToken = resposta.body.accessToken;

      cy.request({
        method: "PATCH",
        url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin",
        headers: {
          Authorization: "Bearer " + userToken,
        },
      }).then((resposta) => {
        cy.request({
          method: "DELETE",
          url: `https://raromdb-3c39614e42d4.herokuapp.com/api/users/${userId}`,
          headers: {
            Authorization: "Bearer " + userToken,
          },
        });
      });
    });
  });

  it("Criar um usuário", () => {
    cy.request("POST", "https://raromdb-3c39614e42d4.herokuapp.com/api/users", {
      name: "Mariana Choratto",
      email: userEmail,
      password: userPassword,
    }).then((resposta) => {
      userId = resposta.body.id;
      expect(resposta.status).to.equal(201);
      expect(resposta.body.active).to.equal(true);
    });
  });

  it("Criar usuário com email inválido", () => {
    cy.request({
      method: "POST",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users",
      failOnStatusCode: false,
      body: {
        name: "Mariana Choratto",
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
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users",
      failOnStatusCode: false,
      body: {
        name: "Mariana Choratto",
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
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users",
      failOnStatusCode: false,
      body: {
        name: "Mariana Choratto",
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
});
