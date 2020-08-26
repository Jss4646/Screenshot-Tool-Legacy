describe('Tests the sitemap crawler', () => {
    it('Tests that the crawler works on a valid website', () => {
        cy
            .get('.url')
            .type('https://pragmatic.agency');

        cy
            .get('#crawl-url')
            .click();

        cy.contains('Crawling https://pragmatic.agency for links')

        cy
            .get('.url-list-item')
            .should('have.length.greaterThan', 0)
    })

    it('Tests that a site with no sitemap will show an error', () => {
        cy
            .get('.url')
            .type('https://example.com')

        cy
            .get('#crawl-url')
            .click();

        cy.contains('No valid links found')
    })
})