describe('Smoke Test', () => {
  it('should load the home page', () => {
    cy.visit('/');
    cy.contains('Tic Tac Toe Online').should('be.visible');
  });
});