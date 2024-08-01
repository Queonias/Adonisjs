import router from '@adonisjs/core/services/router'
const UsersController = () => import('#controllers/users_controller')
const ClientsController = () => import('#controllers/clients_controller')
const ProductsController = () => import('#controllers/products_controller')

router.get('/api/users/list', [UsersController, 'index']);
router.post('/api/users/save', [UsersController, 'store']);
router.put('/api/users/:id', [UsersController, 'update']);
router.delete('/api/users/:id', [UsersController, 'destroy']);

router.get('/api/clients/list', [ClientsController, 'index']);
router.post('/api/clients/save', [ClientsController, 'store']);
router.get('/api/clients/:id', [ClientsController, 'show']);
router.put('/api/clients/:id', [ClientsController, 'update']);
router.delete('/api/clients/:id', [ClientsController, 'destroy']);

router.get('/api/products/list', [ProductsController, 'index']);
router.get('/api/products/:id', [ProductsController, 'show']);
router.post('/api/products/save', [ProductsController, 'store']);
router.put('/api/products/:id', [ProductsController, 'update']);
router.delete('/api/products/:id', [ProductsController, 'destroy']);