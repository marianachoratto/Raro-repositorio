describe("Testes de autenticação", () => {
    let emailUser = "maria10@hotmail.com";
    let passwordUser = "abc123";
    let userToken;
    let userId;
  
    before(() => {
      cy.request({
        method: "POST",
        url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users",
        body: {
          name: "Maria",
          email: emailUser,
          password: passwordUser,
        },
      }).then((resposta) => {
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
  
        after(() => {
          cy.request({
            method: "PATCH",
            url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin",
            headers: {
              Authorization: "Bearer " + userToken,
            },
          }).then(() => {
            cy.request({
              method: "DELETE",
              url: `https://raromdb-3c39614e42d4.herokuapp.com/api/users/${userId}`,
              headers: {
                Authorization: "Bearer " + userToken,
              },
            });
          });
        });
  
        it("Fazer autenticação do usuário", () => {});
      });
    });
  });
  