import { getCustomDashboards, sGetDashboardById } from '../reducers/dashboards'
import {
    SET_SELECTED_ID,
    SET_SELECTED_ISLOADING,
    SET_SELECTED_SHOWDESCRIPTION,
    sGetSelectedIsLoading,
    sGetSelectedId,
} from '../reducers/selected'
import { sGetUserUsername } from '../reducers/user'

import { acSetDashboardItems, acAppendDashboards } from './dashboards'
import { acClearItemFilters } from './itemFilters'
import { tGetMessages } from '../components/Item/MessagesItem/actions'
import { acReceivedSnackbarMessage, acCloseSnackbar } from './snackbar'
import { acAddVisualization } from './visualizations'

import { apiFetchDashboard } from '../api/dashboards'
import { storePreferredDashboardId } from '../api/localStorage'

import { withShape } from '../components/ItemGrid/gridUtil'
import { loadingDashboardMsg } from '../components/SnackbarMessage/SnackbarMessage'
import { extractFavorite } from '../components/Item/VisualizationItem/plugin'

import {
    REPORT_TABLE,
    CHART,
    MAP,
    EVENT_REPORT,
    EVENT_CHART,
    MESSAGES,
} from '../modules/itemTypes'
import { orObject } from '../modules/util'

// actions

export const acSetSelectedId = value => ({
    type: SET_SELECTED_ID,
    value,
})

export const acSetSelectedIsLoading = value => ({
    type: SET_SELECTED_ISLOADING,
    value,
})

export const acSetSelectedShowDescription = value => ({
    type: SET_SELECTED_SHOWDESCRIPTION,
    value,
})

// thunks
export const tSetSelectedDashboardById = id => async (dispatch, getState) => {
    dispatch(acSetSelectedIsLoading(true))

    const snackbarTimeout = setTimeout(() => {
        const dashboardName = orObject(sGetDashboardById(getState(), id))
            .displayName
        if (sGetSelectedIsLoading(getState()) && dashboardName) {
            loadingDashboardMsg.name = dashboardName

            dispatch(
                acReceivedSnackbarMessage({
                    message: loadingDashboardMsg,
                    open: true,
                })
            )
        }
    }, 500)

    const onSuccess = selected => {
        dispatch(acAppendDashboards(selected))

        const customDashboard = getCustomDashboards(selected)[0]

        dispatch(acSetDashboardItems(withShape(customDashboard.dashboardItems)))

        storePreferredDashboardId(sGetUserUsername(getState()), id)

        customDashboard.dashboardItems.forEach(item => {
            switch (item.type) {
                case REPORT_TABLE:
                case CHART:
                case MAP:
                case EVENT_REPORT:
                case EVENT_CHART:
                    dispatch(acAddVisualization(extractFavorite(item)))
                    break
                case MESSAGES:
                    dispatch(tGetMessages(id))
                    break
                default:
                    break
            }
        })

        if (id !== sGetSelectedId(getState())) {
            dispatch(acClearItemFilters())
        }

        dispatch(acSetSelectedId(id))

        dispatch(acSetSelectedIsLoading(false))

        clearTimeout(snackbarTimeout)

        dispatch(acCloseSnackbar())

        return selected
    }

    const onError = error => {
        console.log('Error: ', error)
        return error
    }

    try {
        const dashboard = await apiFetchDashboard(id)

        return onSuccess(dashboard)
    } catch (err) {
        return onError(err)
    }
}
