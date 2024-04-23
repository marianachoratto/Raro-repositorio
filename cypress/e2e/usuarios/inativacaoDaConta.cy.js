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
