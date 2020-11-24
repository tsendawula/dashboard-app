import { When, Then } from 'cypress-cucumber-preprocessor/steps'
import {
    getDashboardItem,
    chartSubtitleSel,
    chartXAxisLabelSel,
} from '../../../elements/dashboardItem'
import {
    unselectedItemsSel,
    filterDimensionsPanelSel,
    filterBadgeSel,
    orgUnitHierarchySel,
    orgUnitCheckboxesSel,
} from '../../../elements/dashboardFilter'
import { dashboards } from '../../../assets/backends'

const OPTIONS = { timeout: 15000 }
const PERIOD = 'Last 6 months'
const OU = 'Sierra Leone'
const FACILITY_TYPE = 'Clinic'

const chartItemUid = dashboards.Delivery.items.chart.itemUid

When('I add a {string} filter', dimensionType => {
    cy.contains('Add filter').click()

    cy.get(filterDimensionsPanelSel).contains(dimensionType).click()
    if (dimensionType === 'Period') {
        cy.get(unselectedItemsSel).contains(PERIOD).dblclick()
    } else if (dimensionType === 'Organisation Unit') {
        // TODO: to be able to select items under the top
        // hierarchy level - not currently working on CI
        // cy.get('[data-test="modal-dimension-ou"]', OPTIONS)
        //     .find('.arrow')
        //     .click()
        cy.get(orgUnitHierarchySel, OPTIONS)
            .find(orgUnitCheckboxesSel, OPTIONS)
            .contains(OU, OPTIONS)
            .click()
    } else {
        cy.get(unselectedItemsSel).contains(FACILITY_TYPE).dblclick()
    }

    cy.get('button').contains('Confirm').click()
})

/*
Scenario: I add a Period filter
*/

Then('the Period filter is applied to the dashboard', () => {
    cy.get(filterBadgeSel).contains(`Period: ${PERIOD}`).should('be.visible')

    // TODO: this assertion fails on CI but passes locally
    getDashboardItem(chartItemUid)
        .find(chartSubtitleSel, OPTIONS)
        .scrollIntoView()
        .contains(PERIOD, OPTIONS)
        .should('be.visible')
})

/*
Scenario: I add an Organisation Unit filter
*/

Then('the Organisation Unit filter is applied to the dashboard', () => {
    cy.get(filterBadgeSel)
        .contains(`Organisation Unit: ${OU}`)
        .should('be.visible')

    // TODO: this assertion fails on CI but passes locally
    getDashboardItem(chartItemUid)
        .find(chartXAxisLabelSel, OPTIONS)
        .scrollIntoView()
        .contains(OU, OPTIONS)
        .should('be.visible')
})

/*
Scenario: I add a Facility Type filter
*/
Then('the Facility Type filter is applied to the dashboard', () => {
    cy.get(filterBadgeSel)
        .contains(`Facility Type: ${FACILITY_TYPE}`)
        .should('be.visible')

    getDashboardItem(chartItemUid)
        .find(chartSubtitleSel, OPTIONS)
        .scrollIntoView()
        .contains(FACILITY_TYPE, OPTIONS)
        .should('be.visible')
})
