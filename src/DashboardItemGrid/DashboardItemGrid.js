import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import './DashboardItemGrid.css';

import { gridColumns, gridRowHeight, addShapeToItems } from './gridUtil';
import {
    getPluginByType,
    getFavoriteObjectFromItem,
    getPluginItemConfig,
    renderFavorites,
} from './pluginUtil';

import { orArray, orObject } from '../util';

import * as fromReducers from '../reducers';
import { apiFetchFavorite } from '../api';

const { fromSelected } = fromReducers;

// Components

const ItemBar = ({ item, onButtonClick }) => {
    const favorite = getFavoriteObjectFromItem(item);

    return (
        <div className="dashboard-item-header">
            <div className="dashboard-item-header-title">{favorite.name}</div>
            <ItemButton
                id={favorite.id}
                type={'REPORT_TABLE'}
                text={'T'}
                onButtonClick={onButtonClick}
            />
            <ItemButton
                type={'CHART'}
                text={'C'}
                onButtonClick={onButtonClick}
            />
            <ItemButton type={'MAP'} text={'M'} onButtonClick={onButtonClick} />
        </div>
    );
};

const ItemButton = ({ id, type, text, onButtonClick }) => (
    <button type="button" onClick={() => onButtonClick(id, type)}>
        {text}
    </button>
);

// const reload = (id, type) => {
//     apiFetchFavorite(id, type).then(favorite =>
//         global.reportTablePlugin.load(getPluginItemConfig(favorite, true))
//     );
// };

export class DashboardItemGrid extends Component {
    componentDidUpdate() {
        const { dashboardItems } = this.props;

        if (dashboardItems.length) {
            renderFavorites(dashboardItems);
        }
    }

    render() {
        const { isLoading, dashboardItems, onButtonClick } = this.props;

        if (isLoading) {
            return <div style={{ padding: 50 }}>Loading...</div>;
        }

        if (!dashboardItems.length) {
            return <div style={{ padding: 50 }}>No items</div>;
        }

        const pluginItems = dashboardItems.map((item, index) =>
            Object.assign({}, item, { i: `${index}` })
        );

        return (
            <div className="dashboard-grid-wrapper">
                <ReactGridLayout
                    onLayoutChange={(a, b, c) =>
                        console.log('RGL change', a, b, c)
                    }
                    className="layout"
                    layout={pluginItems}
                    cols={gridColumns}
                    rowHeight={gridRowHeight}
                    width={window.innerWidth}
                >
                    {pluginItems
                        .filter(item => getFavoriteObjectFromItem(item)) //TODO IMPROVE
                        .map(item => (
                            <div key={item.i} className={item.type}>
                                <ItemBar
                                    item={item}
                                    onButtonClick={onButtonClick}
                                />
                                <div
                                    id={`plugin-${
                                        getFavoriteObjectFromItem(item).id
                                    }`}
                                    className="dashboard-item-content"
                                />
                            </div>
                        ))}
                    {}
                </ReactGridLayout>
            </div>
        );
    }
}

DashboardItemGrid.propTypes = {
    dashboardItems: PropTypes.array,
};

DashboardItemGrid.defaultProps = {
    dashboardItems: [],
};

// Container

const mapStateToProps = state => {
    const { sGetSelectedDashboard } = fromReducers;
    const { sGetSelectedIsLoading } = fromSelected;

    const selectedDashboard = sGetSelectedDashboard(state);
    const dashboardItems = orObject(selectedDashboard).dashboardItems;
    const dashboardItemsWithShape = addShapeToItems(orArray(dashboardItems));

    console.log('selectedDashboard', selectedDashboard);
    console.log('dashboardItems', dashboardItems);
    console.log('dashboardItemsWithShape', dashboardItemsWithShape);

    return {
        isLoading: sGetSelectedIsLoading(state),
        dashboardItems: dashboardItemsWithShape,
        onButtonClick: (id, type) => {
            const plugin = getPluginByType(type);

            apiFetchFavorite(id, type).then(favorite => {
                const itemConfig = getPluginItemConfig(favorite, true);

                plugin.load(itemConfig);
            });
        },
    };
};

const DashboardItemGridCt = connect(mapStateToProps)(DashboardItemGrid);

export default DashboardItemGridCt;
