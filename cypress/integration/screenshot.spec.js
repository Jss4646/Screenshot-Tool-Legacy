describe('Screenshot Test', () => {
    it('Checks if taking a single screenshot works', () => {
        cy
            .get('.resolution-container')
            .first()
            .click();

        cy.takeScreenshot('https://google.com');

        cy
            .get('.screenshot-carousel')
            .within(() => {
                cy.contains('google.com', {timeout: 6000});
                cy.contains('/');
                cy
                    .get('.screenshot')
                    .should('have.attr', 'src', 'https://d2imgupmba2ikz.cloudfront.net/google.com//google.com-1080p.jpg');
            })
    })

    it('Checks that you can take screenshots at different resolutions', () => {
        cy.server();
        cy
            .route({
                method: 'POST',
                url: '/take-web-screenshot?url=https://google.com'
            })
            .as('screenshots')

        cy.contains('Select All').click();
        cy.takeScreenshot('https://google.com');

        for (let i=0; i < 21; i++) {
            cy.wait('@screenshots');
        }

        cy
            .get('h4.folder-amount')
            .contains('21')
    })

    it('Checks that you can take screenshots from the url list', () => {

        const urlList = [
            'https://google.com',
            'https://github.com',
            'https://example.com'
        ]

        cy.server();
        cy
            .route({
                method: 'POST',
                url: '**/take-web-screenshot?url=https://*'
            })
            .as('screenshots')

        cy
            .get('.resolution-container')
            .first()
            .click();

        urlList.forEach(url => cy.addUrlToList(url))

        cy
            .get('.take-screenshots')
            .click();

        for (let i=0; i < 3; i++) {
            cy.wait('@screenshots', {timeout: 20000});
        }

        urlList.forEach(url => {
            cy
                .get('.screenshot-carousel')
                .within(() => {
                    cy.contains(url.slice(8));
                    cy
                        .get('.screenshot')
                        .should('have.attr', 'src')
                        .then(src => {
                            cy
                                .wrap(Cypress.minimatch(src, 'https://d2imgupmba2ikz.cloudfront.net/**'))
                                .should('be.true')
                        })
                })
        })
    })
});


