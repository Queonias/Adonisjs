import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const UsersController = () => import('#controllers/users_controller')
const ClientsController = () => import('#controllers/clients_controller')
const ProductsController = () => import('#controllers/products_controller')
const SalesController = () => import('#controllers/sales_controller')

router.post('/api/users/signup', [UsersController, 'signup']);
router.post('/api/users/login', [UsersController, 'login']);

router.get('/api/clients/list', [ClientsController, 'index']).use(middleware.auth());
router.post('/api/clients/save', [ClientsController, 'store']).use(middleware.auth());
router.get('/api/clients/:id', [ClientsController, 'show']).use(middleware.auth());
router.put('/api/clients/:id', [ClientsController, 'update']).use(middleware.auth());
router.delete('/api/clients/:id', [ClientsController, 'destroy']).use(middleware.auth());

router.get('/api/products/list', [ProductsController, 'index']).use(middleware.auth());
router.get('/api/products/:id', [ProductsController, 'show']).use(middleware.auth());
router.post('/api/products/save', [ProductsController, 'store']).use(middleware.auth());
router.put('/api/products/:id', [ProductsController, 'update']).use(middleware.auth());
router.delete('/api/products/:id', [ProductsController, 'destroy']).use(middleware.auth());

router.post('/api/sales/save', [SalesController, 'store']).use(middleware.auth());