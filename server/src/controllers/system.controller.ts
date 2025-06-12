import { Request, Response } from 'express';

export default new class SystemController {
  async Home(req: Request, res: Response): Promise<any> {
    return res.status(200).json({
      message: 'Bem-vindo ao sistema de autenticação',
      status: 'success',
    });
  }
  
}