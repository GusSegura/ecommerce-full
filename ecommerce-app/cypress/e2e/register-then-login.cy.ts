/// <reference types="cypress" />

describe('E2E: Register and Login', () => {
  const timestamp = Date.now();
  const newUser = {
    name: 'Usuario Prueba',
    email: `test${timestamp}@cypress.com`,
    phone: '5512345678',
    password: 'test123'
  };

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should register new user and then login', () => {
    cy.intercept('POST', '**/api/auth/register').as('registerRequest');
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');
    cy.intercept('GET', '**/api/cart/my').as('getCart');

    // abre popup de registro y esprera animacion
    cy.visit('/');
    cy.get('i.fa-regular.fa-user').click();
    cy.wait(1000); 
    cy.get('#register-link').click();
    cy.wait(1000); 

    // verfica que el popup de registro esté visible
    cy.get('.swal2-title', { timeout: 5000 }).should('contain.text', 'Crear cuenta');

    // llena el formulario
    cy.get('#reg-name').should('be.visible').type(newUser.name);
    cy.get('#reg-email').should('be.visible').type(newUser.email);
    cy.get('#reg-phone').should('be.visible').type(newUser.phone);
    cy.get('#reg-password').should('be.visible').type(newUser.password);

    // envia
    cy.contains('button', 'Registrarme').click();

    // espera la respuesta del registro
    cy.wait('@registerRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

    // espera el popup de exito y lo cierra
    cy.wait(1500);
    cy.contains('button', 'Iniciar sesión').click({ force: true });

    // llena el formulario
    cy.wait(1500);
    cy.get('#email', { timeout: 5000 }).should('exist').type(newUser.email, { force: true });
    cy.get('#password', { timeout: 5000 }).should('exist').type(newUser.password, { force: true });
    cy.contains('button', 'Ingresar').click({ force: true });

    // verifica login exitoso
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

    // cierra popup de exito
    cy.wait(1500);
    cy.contains('button', 'OK').click({ force: true });

    // verifica que el usuario esté autenticado
    cy.wait('@getCart', { timeout: 10000 });
    cy.log('Usuario autenticado correctamente');
  });
});