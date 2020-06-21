describe('Screenshot Test', () => {
    it('Checks if take screenshot button returns a screenshot', () => {
        cy.contains('Deselect All').click();
        cy.contains('1080p Desktop').click();
        cy.takeScreenshot('https://pragmatic.agency');
        cy
            .get('.screenshot', {timeout: 20000})
            .should('have.attr', 'src')
            .then(src => {
               expect(src.length)
                   .to.be.greaterThan(0);
            });
        cy
            .get('.screenshot-resolution-name')
            .should('have.text', '1080p Desktop')
    })
});
