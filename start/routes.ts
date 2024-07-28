import router from '@adonisjs/core/services/router'
const UsersController = () => import('#controllers/users_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
});

router.get('/api/users/list', [UsersController, 'index']);
router.post('/api/users/save', [UsersController, 'store']);
router.put('/api/users/:id', [UsersController, 'update']);
router.delete('/api/users/:id', [UsersController, 'destroy']);