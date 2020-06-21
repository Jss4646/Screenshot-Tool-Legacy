describe('URL Tests', () => {
   it('Tests if the add url button works', () => {
      cy
          .get('.url')
          .type('https://google.com');
      cy
          .get('#add-url')
          .click();
      cy
          .get('.url-list')
          .contains('https://google.com');
   })
});