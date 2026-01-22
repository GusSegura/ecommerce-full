/// <reference types="cypress" />

describe('E2E: login and add to cart', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should login via popup and add product to cart', () => {
    // Interceptors con los endpoints correctos
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');
    cy.intercept('GET', '**/api/products/by-category/Mujeres').as('getProducts');
    cy.intercept('POST', '**/api/cart/my/add').as('addToCart');

    // visita la página principal
    cy.visit('/');
    cy.get('nav', { timeout: 10000 }).should('be.visible');

    // abre popup de login
    cy.get('i.fa-regular.fa-user').click();
    cy.get('.swal2-popup', { timeout: 5000 }).should('be.visible');
    cy.get('.swal2-title').should('contain.text', 'Iniciar sesión');

    // llena el formulario
    cy.get('#email').type('admin@ng-store.com.mx');
    cy.get('#password').type('qwe1234');

    // envio de login
    cy.get('.swal2-confirm').click();

    // espera la respuesta del login
    cy.wait('@loginRequest', { timeout: 10000 })
      .its('response.statusCode')
      .should('eq', 200);

    // cierra popup de exito
    cy.wait(1500);
    cy.get('.swal2-confirm').click({ force: true });

    // naevigar a la categoría "Mujeres"
    cy.visit('/mujeres');

    // espera la respuesta de productos
    cy.wait('@getProducts', { timeout: 10000 })
      .its('response.statusCode')
      .should('eq', 200);

    // espera un momento para que los productos se rendericen
    cy.wait(2000);

    // verifica que los botones de "Agregar al carrito" estén visibles
    cy.contains('button', 'Agregar al carrito', { timeout: 10000 })
      .should('be.visible');

    // clic en el primer botón de "Agregar al carrito"
    cy.contains('button', 'Agregar al carrito')
      .first()
      .click();

    // verifica que el producto se haya agregado al carrito
    cy.wait('@addToCart', { timeout: 10000 })
      .its('response.statusCode')
      .should('eq', 200);

    cy.log('Test completado exitosamente');
  });
});