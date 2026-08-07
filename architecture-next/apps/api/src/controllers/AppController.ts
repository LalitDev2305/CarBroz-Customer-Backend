import { FastifyReply, FastifyRequest } from 'fastify';

export class AppController {
  public init = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Postgres Auth Check
      // We check if request.user is set by the JWT plugin
      const isLoggedIn = !!request.user;

      // Construct the Config Payload
      const configPayload = {
        status: 'success',
        data: {
          isLoggedIn,
          config: {
            forceUpdate: false,
            supportPhone: '+91 9876543210'
          },
          nextRoute: {
            type: 'navigation',
            payload: isLoggedIn 
              ? { destination: 'dashboard_template', api: 'dashboard/home' }
              : { destination: 'auth_template', api: 'auth/auth_login' } // As requested: new user -> auth_login
          }
        }
      };

      return reply.send(configPayload);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  };
}
