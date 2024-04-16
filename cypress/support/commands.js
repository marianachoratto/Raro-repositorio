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

Cypress.Commands.add("cadastroLogin", (email, password, name) => {
  let userId;
  let userToken;

  return cy
    .request({
      method: "POST",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users",
      body: {
        name: name,
        email: email,
        password: password,
      },
    })
    .then((resposta) => {
      userId = resposta.body.id;
      return cy
        .request(
          "POST",
          `https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login`,
          {
            email: email,
            password: password,
          }
        )
        .then((resposta) => {
          userToken = resposta.body.accessToken;

          return {
            token: userToken,
            id: userId,
          };
        });
    });
});
