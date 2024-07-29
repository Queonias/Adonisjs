import type { HttpContext } from '@adonisjs/core/http'
import Client from '../models/client.js';

export default class ClientsController {
  /**
   * Display a list of resource
   */
  async index({ }: HttpContext) { }

  /**
   * Display form to create a new record
   */
  async create({ }: HttpContext) { }

  /**
   * Salvar
   */
  async store({ request }: HttpContext) {
    const user: Client = await Client.create(request.all());
    return user;
  }

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) { }

  /**
   * Handle form submission for the edit action
   */
  // async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) { }
}