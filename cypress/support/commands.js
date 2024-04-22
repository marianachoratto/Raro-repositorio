// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
const { fakerPT_BR } = require("@faker-js/faker");

Cypress.Commands.add("cadastroLogin", () => {
  let nameUser = fakerPT_BR.internet.userName();
  let passwordUser = fakerPT_BR.internet.password(8);
  let emailUser = fakerPT_BR.internet.email();
  let userId;
  let userToken;
  let usuarioCriado;

  return cy
    .request({
      method: "POST",
      url: "/api/users",
      body: {
        name: nameUser,
        email: emailUser,
        password: passwordUser,
      },
    })
    .then((resposta) => {
      userId = resposta.body.id;
      usuarioCriado = resposta;
      return cy
        .request("POST", `/api/auth/login`, {
          email: emailUser,
          password: passwordUser,
        })
        .then((resposta) => {
          userToken = resposta.body.accessToken;

          return {
            token: userToken,
            id: userId,
            // objetoComplerto: usuarioCriado,
          };
        });
    });
});

Cypress.Commands.add("promoverParaAdmin", (userToken) => {
  return cy.request({
    method: "PATCH",
    url: "/api/users/admin",
    headers: {
      Authorization: "Bearer " + userToken,
    },
  });
});

Cypress.Commands.add("deletarUsuário", (userId, userToken) => {
  return cy.request({
    method: "DELETE",
    url: `/api/users/${userId}`,
    headers: {
      Authorization: "Bearer " + userToken,
    },
  });
});

Cypress.Commands.add("listaDeTodosOsUsuarios", () => {
  cy.request("GET", "/users").then((response) => {
    return response.body;
  });
});
