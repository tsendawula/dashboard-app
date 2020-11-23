import { When, Then } from 'cypress-cucumber-preprocessor/steps'

const OPTIONS = { timeout: 15000 }

When('I add a {string} filter', () => {
    cy.contains('Add filter').click()

    cy.get('[data-test="undefined-button-pe"]').click()

    cy.get('[data-test="dhis2-uicore-transfer-sourceoptions"]')
        .contains('Last 6 months')
        .dblclick()

    cy.get('button').contains('Confirm').click()
})

Then('the {string} filter is applied to the dashboard', () => {
    cy.get('[data-test="filter-badge"]')
        .contains('Period: Last 6 months')
        .should('be.visible')

    cy.get('.highcharts-subtitle', OPTIONS)
        .contains('Last 6 months', OPTIONS)
        .should('be.visible')
})
