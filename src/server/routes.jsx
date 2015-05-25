import bodyParser from 'body-parser';
import config from './appconfig';
import express from 'express';
import FluxComponent from 'flummox/component';
import React from 'react';
import Router from 'react-router';
import RouteUtils from '../shared/utils/RouteUtils';

import App from '../shared/App';
import Flux from '../shared/Flux';
import AppRoutes from '../shared/routes.js';
import TrailRoutes from './routes/trail-routes';
import TagRoutes from './routes/tag-routes';
import AuthRoutes from './routes/auth-routes';
import UserRoutes from './routes/user-routes';
import ResourceRoutes from './routes/resource-routes';

const routes = express.Router();

routes.use(bodyParser.json());
routes.use(bodyParser.urlencoded({ extended: true }));

routes.use(express.static(config.static));

routes.get('/monitor/ping', (req, res) => {
    res.send(`I'm working!`);
});

routes.use('/api', TrailRoutes);
routes.use('/api', TagRoutes);
routes.use('/api', AuthRoutes);
routes.use('/api', UserRoutes);
routes.use('/api', ResourceRoutes);

routes.get('*', (req, res) => {
    const router = Router.create({
        routes: AppRoutes,
        location: req.url,
        onError: error => {
            throw error;
        }
    });
    const flux = new Flux();

    // Process current route.
    // state.routes contains the current route and its parent.
    // Handler is the React component that handlers the current route.
    RouteUtils.run(router).then(({Handler, state}) => {
        // Run init method of current route and its parents.
        RouteUtils.init(state.routes, {state, flux}).then(() => {
            React.withContext({flux}, () => {
                const rendered = React.renderToString(<Handler {...state} />);
                res.send(`
                    <html>
                        <head>
                            <link rel="stylesheet" type="text/css" href="/css/main.css" />
                        </head>
                        <body>
                            <div id="app">
                                ${rendered}
                            </div>
                            <script type="text/javascript" src="/js/bundle.js"></script>
                        </body>
                    </html>
                `);
            });
        }).catch(err => { process.stderr.write(err.stack + '\n'); });
    }).catch(err => { process.stderr.write(err.stack + '\n'); });
});

export default routes;
