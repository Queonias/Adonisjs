import type { HttpContext } from '@adonisjs/core/http';
import User from '../models/user.js';

export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({ }: HttpContext) {
    return await User.all();
  }



  /**
   * Salvar
   */
  async store({ request }: HttpContext) {
    const user: User = await User.create(request.all());
    return user;
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const user: User | null = await User.find(params['id']);
    if (user) {
      user.email = request.input('email');
      await user.save();
      return user;
    }
    return 'User not found';
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const user: User | null = await User.find(params['id']);
    if (user) {
      user.delete();
      return user;
    }
    return 'User not found';
  }
}