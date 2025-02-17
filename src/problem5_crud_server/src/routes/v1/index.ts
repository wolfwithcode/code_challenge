import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import resourceRoute from './resource.route';
import docsRoute from './docs.route';
import config from '@config/config';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/users',
    route: userRoute
  },
  {
    path: '/resources',
    route: resourceRoute
  }
];

const devRoutes = [
  {
    path: '/docs',
    route: docsRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
